-- ============================================================================
-- 03_derive_metrics.sql — the calculation engine
--
-- Every figure the dashboard shows from real data is defined here, once, as a
-- SQL function over fact_sales. The API (backend/) only calls these functions;
-- it does no arithmetic of its own, and neither does the frontend. One
-- definition per figure is the structural fix for the same metric showing
-- different values on different screens (TODO.md O7, formulas.md).
--
-- Every function takes p_months — the dashboard's timeline selector
-- (1, 3, 6, 12, 24 or 36). The window is the trailing p_months calendar months
-- ending at the last date in fact_sales. The comparison window is the p_months
-- immediately before it. This replaces the hash-based "noise" the frontend used
-- to fake period variation (utils/timeframe.ts) with real period data.
--
-- The dataset covers 24 months (2024-01..2025-12). A 36-month request is
-- clamped to the data available and says so via months_available; growth is
-- NULL whenever a full comparison window doesn't exist, rather than invented.
--
-- Run as the app role after 01_schema.sql and load.py, from the repo root in
-- cmd.exe, on one line:
--   "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U Pd_lc_app -d ppl_intelligence -f data\schema\03_derive_metrics.sql
--
-- Idempotent: CREATE OR REPLACE throughout; the registry is rebuilt.
-- ============================================================================

\set ON_ERROR_STOP on

BEGIN;

-- ── The period window every metric shares ───────────────────────────────────
CREATE OR REPLACE FUNCTION metric_window(p_months int)
RETURNS TABLE (
  period_start date, period_end date,
  prior_start date, prior_end date,
  months_requested int, months_available int
)
LANGUAGE sql STABLE AS $$
  WITH bounds AS (
    SELECT min(date_key) AS data_start, max(date_key) AS data_end FROM fact_sales
  ), w AS (
    SELECT data_start, data_end,
           greatest(data_start,
                    (date_trunc('month', data_end) - make_interval(months => p_months - 1))::date) AS ps
    FROM bounds
  )
  SELECT ps, data_end,
         CASE WHEN (ps - make_interval(months => p_months))::date >= data_start
              THEN (ps - make_interval(months => p_months))::date END,
         CASE WHEN (ps - make_interval(months => p_months))::date >= data_start
              THEN ps - 1 END,
         p_months,
         (extract(year FROM age(data_end + 1, ps)) * 12
          + extract(month FROM age(data_end + 1, ps)))::int
  FROM w;
$$;

-- ── Portfolio headline KPIs ─────────────────────────────────────────────────
-- growth_pct compares against the immediately preceding window of equal
-- length. For p_months = 12 that is year-over-year (2025 vs 2024).
CREATE OR REPLACE FUNCTION fn_portfolio_kpis(p_months int)
RETURNS TABLE (
  period_start date, period_end date, months_requested int, months_available int,
  net_sales numeric, gross_margin numeric, gross_margin_pct numeric,
  units_sold bigint, active_skus bigint, stockout_events bigint,
  prior_net_sales numeric, growth_pct numeric
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  cur AS (
    SELECT sum(f.net_sales) AS ns, sum(f.gross_margin) AS gm, sum(f.units_sold) AS u,
           count(DISTINCT f.sku_id) AS skus, sum(f.stock_out_flag) AS so
    FROM fact_sales f, w
    WHERE f.date_key BETWEEN w.period_start AND w.period_end
  ),
  pri AS (
    SELECT sum(f.net_sales) AS ns
    FROM fact_sales f, w
    WHERE w.prior_start IS NOT NULL
      AND f.date_key BETWEEN w.prior_start AND w.prior_end
  )
  SELECT w.period_start, w.period_end, w.months_requested, w.months_available,
         cur.ns, cur.gm, cur.gm / NULLIF(cur.ns, 0),
         cur.u, cur.skus, cur.so,
         pri.ns, cur.ns / NULLIF(pri.ns, 0) - 1
  FROM w, cur, pri;
$$;

-- ── Per-SKU performance ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_sku_performance(p_months int)
RETURNS TABLE (
  sku_id int, sku_name text, category_name text, brand_name text,
  net_sales numeric, gross_margin_pct numeric, units_sold bigint, stockout_events bigint,
  prior_net_sales numeric, growth_pct numeric, revenue_share_pct numeric
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  cur AS (
    SELECT f.sku_id, sum(f.net_sales) AS ns, sum(f.gross_margin) AS gm,
           sum(f.units_sold) AS u, sum(f.stock_out_flag) AS so
    FROM fact_sales f, w
    WHERE f.date_key BETWEEN w.period_start AND w.period_end
    GROUP BY f.sku_id
  ),
  pri AS (
    SELECT f.sku_id, sum(f.net_sales) AS ns
    FROM fact_sales f, w
    WHERE w.prior_start IS NOT NULL
      AND f.date_key BETWEEN w.prior_start AND w.prior_end
    GROUP BY f.sku_id
  )
  SELECT s.sku_id, s.sku_name, c.category_name, b.brand_name,
         cur.ns, cur.gm / NULLIF(cur.ns, 0), cur.u, cur.so,
         pri.ns, cur.ns / NULLIF(pri.ns, 0) - 1,
         cur.ns / NULLIF(sum(cur.ns) OVER (), 0)
  FROM cur
  JOIN dim_sku s ON s.sku_id = cur.sku_id
  JOIN dim_category c ON c.category_id = s.category_id
  JOIN dim_brand b ON b.brand_id = s.brand_id
  LEFT JOIN pri ON pri.sku_id = cur.sku_id
  ORDER BY cur.ns DESC;
$$;

-- ── Revenue concentration (Pareto) ──────────────────────────────────────────
-- Same rule as data/generator/derive.py: the top round(n x pct) SKUs by
-- revenue, minimum one.
CREATE OR REPLACE FUNCTION fn_concentration(p_months int)
RETURNS TABLE (sku_count bigint, top10_share numeric, top20_share numeric, top30_share numeric)
LANGUAGE sql STABLE AS $$
  WITH s AS (
    SELECT net_sales, revenue_share_pct,
           row_number() OVER (ORDER BY net_sales DESC) AS rk,
           count(*) OVER () AS n
    FROM fn_sku_performance(p_months)
  )
  SELECT max(n),
         sum(revenue_share_pct) FILTER (WHERE rk <= greatest(1, round(n * 0.10))),
         sum(revenue_share_pct) FILTER (WHERE rk <= greatest(1, round(n * 0.20))),
         sum(revenue_share_pct) FILTER (WHERE rk <= greatest(1, round(n * 0.30)))
  FROM s;
$$;

-- ── Regional and channel performance ────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_regional_performance(p_months int)
RETURNS TABLE (country_name text, region text, net_sales numeric, gross_margin_pct numeric,
               revenue_share_pct numeric, stockout_events bigint)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months))
  SELECT c.country_name, c.region, sum(f.net_sales),
         sum(f.gross_margin) / NULLIF(sum(f.net_sales), 0),
         sum(f.net_sales) / NULLIF(sum(sum(f.net_sales)) OVER (), 0),
         sum(f.stock_out_flag)
  FROM fact_sales f
  JOIN dim_country c ON c.country_id = f.country_id, w
  WHERE f.date_key BETWEEN w.period_start AND w.period_end
  GROUP BY c.country_name, c.region
  ORDER BY 3 DESC;
$$;

-- ── Regional scorecard: revenue, margin, fulfillment ("OTIF") ───────────────
-- One function per real country (dim_country.region), everything the
-- Top-Down Drilldown's region cards need. net_sales/gross_margin_pct
-- duplicate fn_regional_performance's numbers (same source, same window) —
-- kept together here so the drilldown needs one call, not a join.
--
-- fact_sales has no order-vs-received quantity and no promised-vs-actual date
-- (it is a sales fact, not a purchase-order fact), so a literal OTIF cannot be
-- read off it — only two proxies exist: stock_out_flag (a transaction either
-- stocked out or it didn't — the "in full" half) and lead_time_days (a
-- duration, no stated target to compare against — the "on time" half cannot
-- be scored without inventing a target). fulfillment_pct is the real,
-- defensible half: the share of transactions with no stockout. avg_lead_time
-- is reported alongside it, not blended in. Compared against the prior period
-- of equal length, the same pattern as fn_portfolio_kpis.growth_pct, rather
-- than against an invented target — no fulfillment target exists anywhere in
-- config.py or the generation plan.
DROP FUNCTION IF EXISTS fn_regional_fulfillment(int);
CREATE FUNCTION fn_regional_fulfillment(p_months int)
RETURNS TABLE (
  country_name text, region text,
  net_sales numeric, gross_margin_pct numeric,
  prior_net_sales numeric, revenue_growth_pct numeric,
  prior_gross_margin_pct numeric, margin_change numeric,
  transactions bigint, stockout_events bigint, fulfillment_pct numeric,
  avg_lead_time_days numeric,
  prior_fulfillment_pct numeric, fulfillment_change numeric
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  cur AS (
    SELECT c.country_name, c.region,
           sum(f.net_sales) AS ns, sum(f.gross_margin) AS gm,
           count(*) AS txn, sum(f.stock_out_flag) AS so,
           avg(f.lead_time_days) AS lead
    FROM fact_sales f
    JOIN dim_country c ON c.country_id = f.country_id, w
    WHERE f.date_key BETWEEN w.period_start AND w.period_end
    GROUP BY c.country_name, c.region
  ),
  pri AS (
    SELECT c.country_name,
           sum(f.net_sales) AS ns, sum(f.gross_margin) AS gm,
           count(*) AS txn, sum(f.stock_out_flag) AS so
    FROM fact_sales f
    JOIN dim_country c ON c.country_id = f.country_id, w
    WHERE w.prior_start IS NOT NULL
      AND f.date_key BETWEEN w.prior_start AND w.prior_end
    GROUP BY c.country_name
  )
  SELECT cur.country_name, cur.region,
         cur.ns, cur.gm / NULLIF(cur.ns, 0),
         pri.ns, cur.ns / NULLIF(pri.ns, 0) - 1,
         pri.gm / NULLIF(pri.ns, 0),
         (cur.gm / NULLIF(cur.ns, 0)) - (pri.gm / NULLIF(pri.ns, 0)),
         cur.txn, cur.so, 1 - (cur.so::numeric / NULLIF(cur.txn, 0)),
         cur.lead,
         1 - (pri.so::numeric / NULLIF(pri.txn, 0)),
         (1 - (cur.so::numeric / NULLIF(cur.txn, 0)))
           - (1 - (pri.so::numeric / NULLIF(pri.txn, 0)))
  FROM cur
  LEFT JOIN pri ON pri.country_name = cur.country_name
  ORDER BY cur.country_name;
$$;

CREATE OR REPLACE FUNCTION fn_channel_performance(p_months int)
RETURNS TABLE (channel_name text, net_sales numeric, gross_margin_pct numeric,
               revenue_share_pct numeric, stockout_events bigint)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months))
  SELECT ch.channel_name, sum(f.net_sales),
         sum(f.gross_margin) / NULLIF(sum(f.net_sales), 0),
         sum(f.net_sales) / NULLIF(sum(sum(f.net_sales)) OVER (), 0),
         sum(f.stock_out_flag)
  FROM fact_sales f
  JOIN dim_channel ch ON ch.channel_id = f.channel_id, w
  WHERE f.date_key BETWEEN w.period_start AND w.period_end
  GROUP BY ch.channel_name
  ORDER BY 2 DESC;
$$;

-- ── Monthly series — the sparklines on the KPI cards ────────────────────────
CREATE OR REPLACE FUNCTION fn_monthly_trend(p_months int)
RETURNS TABLE (month_start date, net_sales numeric, gross_margin_pct numeric, active_skus bigint)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months))
  SELECT date_trunc('month', f.date_key)::date, sum(f.net_sales),
         sum(f.gross_margin) / NULLIF(sum(f.net_sales), 0),
         count(DISTINCT f.sku_id)
  FROM fact_sales f, w
  WHERE f.date_key BETWEEN w.period_start AND w.period_end
  GROUP BY 1
  ORDER BY 1;
$$;

-- ── Metric registry — one row per figure, what it means, where it comes from ─
DROP TABLE IF EXISTS metric_registry;
CREATE TABLE metric_registry (
  metric_key      text PRIMARY KEY,
  label           text NOT NULL,
  unit            text NOT NULL,
  definition      text NOT NULL,
  source_function text NOT NULL
);

INSERT INTO metric_registry VALUES
  ('net_sales',        'Net Sales',             'USD',     'Sum of fact_sales.net_sales over the trailing window.',                                   'fn_portfolio_kpis'),
  ('gross_margin_pct', 'Gross Margin %',        'ratio',   'Sum of gross_margin / sum of net_sales over the window (revenue-weighted, not a mean of SKU margins).', 'fn_portfolio_kpis'),
  ('growth_pct',       'Growth',                'ratio',   'Net sales vs the immediately preceding window of equal length; NULL if that window is not fully in the data. 12 months = year-over-year.', 'fn_portfolio_kpis'),
  ('active_skus',      'Active SKUs',           'count',   'Distinct SKUs with at least one sale in the window.',                                      'fn_portfolio_kpis'),
  ('stockout_events',  'Stockout Events',       'count',   'Sum of fact_sales.stock_out_flag over the window.',                                        'fn_portfolio_kpis'),
  ('top10_share',      'Revenue Concentration (Top 10%)', 'ratio', 'Revenue share of the top round(n x 0.10) SKUs by net sales in the window.',  'fn_concentration'),
  ('sku_net_sales',    'SKU Net Sales',         'USD',     'Per-SKU sum of net_sales over the window.',                                                 'fn_sku_performance'),
  ('region_net_sales', 'Country Net Sales',     'USD',     'Per-country sum of net_sales over the window.',                                             'fn_regional_performance'),
  ('channel_net_sales','Channel Net Sales',     'USD',     'Per-channel sum of net_sales over the window.',                                             'fn_channel_performance'),
  ('monthly_net_sales','Monthly Net Sales',     'USD',     'Net sales and margin per calendar month in the window (KPI sparklines).',                  'fn_monthly_trend'),
  ('fulfillment_pct',  'Fulfillment Rate ("OTIF")', 'ratio', 'Share of country transactions with no stockout flag in the window (the "in full" half of OTIF; fact_sales has no promised-vs-actual date, so "on time" cannot be scored — see avg_lead_time_days). No stated business target exists, so compared against the prior period of equal length, not an invented target.', 'fn_regional_fulfillment'),
  ('avg_lead_time_days','Average Lead Time',    'days',    'Mean of fact_sales.lead_time_days per country over the window. Reported alongside fulfillment_pct, not blended into it.', 'fn_regional_fulfillment');

COMMIT;

\echo ''
\echo 'Calculation layer ready: metric_window + 8 metric functions + metric_registry.'
\echo 'Next: 04_validate.sql'
