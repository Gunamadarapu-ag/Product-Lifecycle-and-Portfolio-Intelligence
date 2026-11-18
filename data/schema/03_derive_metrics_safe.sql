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
-- transactions (rows in the window) lets callers express stockouts as a rate
-- rather than a raw count — a SKU launched mid-window has fewer rows, so its
-- raw count is not comparable to a full-window SKU's (7 Oct fix, TODO.md O18).
-- Return type changed, so the function is dropped and recreated.
DROP FUNCTION IF EXISTS fn_sku_performance(int);
CREATE FUNCTION fn_sku_performance(p_months int)
RETURNS TABLE (
  sku_id int, sku_name text, category_name text, brand_name text,
  net_sales numeric, gross_margin_pct numeric, units_sold bigint, stockout_events bigint,
  prior_net_sales numeric, growth_pct numeric, revenue_share_pct numeric,
  transactions bigint
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  cur AS (
    SELECT f.sku_id, sum(f.net_sales) AS ns, sum(f.gross_margin) AS gm,
           sum(f.units_sold) AS u, sum(f.stock_out_flag) AS so, count(*) AS txn
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
         cur.ns / NULLIF(sum(cur.ns) OVER (), 0),
         cur.txn
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
-- Preserved existing function: fn_regional_fulfillment. No DROP required.
CREATE OR REPLACE FUNCTION fn_regional_fulfillment(p_months int)
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

-- ════════════════════════════════════════════════════════════════════════════
-- 7 OCT ADDITIONS — thread-by-thread wiring over the new tables
-- (data/generator: pricing, customers, listing, plan, forecast, inventory,
-- launches, costs). See TODO.md O18/O19 and the wiring plan.
--
-- sku_metrics, portfolio_metrics and sku_cannibalization are SNAPSHOT tables:
-- one row per SKU/pair, computed once by the Python generator over the full
-- 24-month history. They do not take p_months — re-deriving them per arbitrary
-- trailing window would mean porting the statistical model (percentile ranks,
-- a median-split segment quadrant) into SQL. Functions reading them are named
-- and registered as snapshots, "as of" the data's last date, rather than
-- quietly pretending they respond to the timeline selector.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Per-SKU snapshot scores (segment, complexity, cannibalization, …) ──────
CREATE OR REPLACE FUNCTION fn_sku_segments()
RETURNS TABLE (
  sku_id int, sku_name text, portfolio_segment text,
  commercial_value_score numeric, operational_complexity_score numeric,
  op_burden_ratio numeric, safety_stock_proxy numeric, revenue_share_pct numeric,
  low_velocity_flag smallint, total_stockouts int, margin_erosion numeric,
  promo_dependency numeric, cannibalization_risk_score numeric,
  volatility_class text, cv_score numeric
)
LANGUAGE sql STABLE AS $$
  SELECT m.sku_id, s.sku_name, m.portfolio_segment,
         m.commercial_value_score, m.operational_complexity_score,
         m.op_burden_ratio, m.safety_stock_proxy, m.revenue_share_pct,
         m.low_velocity_flag, m.total_stockouts, m.margin_erosion,
         m.promo_dependency, m.cannibalization_risk_score,
         m.volatility_class, m.cv_score
  FROM sku_metrics m
  JOIN dim_sku s ON s.sku_id = m.sku_id;
$$;

-- ── Portfolio snapshot: Complexity Index and its 6 sub-drivers ─────────────
CREATE OR REPLACE FUNCTION fn_portfolio_snapshot()
RETURNS TABLE (
  snapshot_date date, portfolio_complexity_index numeric,
  supplier_fragmentation numeric, sku_proliferation numeric,
  low_velocity_pct numeric, lead_time_instability numeric,
  promo_dependency_score numeric, avg_volatility_cv numeric
)
LANGUAGE sql STABLE AS $$
  SELECT snapshot_date, portfolio_complexity_index, supplier_fragmentation,
         sku_proliferation, low_velocity_pct, lead_time_instability,
         promo_dependency_score, avg_volatility_cv
  FROM portfolio_metrics
  LIMIT 1;
$$;

-- ── SKU pair cannibalization (snapshot) ────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_cannibalization()
RETURNS TABLE (
  sku_id_a int, sku_name_a text, sku_id_b int, sku_name_b text,
  category_name text, correlation numeric, is_significant boolean
)
LANGUAGE sql STABLE AS $$
  SELECT a.sku_id_a, sa.sku_name, a.sku_id_b, sb.sku_name,
         c.category_name, a.correlation, a.is_significant
  FROM sku_cannibalization a
  JOIN dim_sku sa ON sa.sku_id = a.sku_id_a
  JOIN dim_sku sb ON sb.sku_id = a.sku_id_b
  JOIN dim_category c ON c.category_id = a.category_id
  ORDER BY a.correlation ASC;
$$;

-- ── Rationalization scenarios (snapshot; computed in Phase 1, exposed here) ─
CREATE OR REPLACE FUNCTION fn_rationalization_scenarios()
RETURNS TABLE (
  scenario_id smallint, scenario_label text, skus_removed smallint,
  revenue_impact_pct numeric, margin_impact_pct numeric,
  safety_stock_freed_pct numeric, supplier_reduction_pct numeric
)
LANGUAGE sql STABLE AS $$
  SELECT scenario_id, scenario_label, skus_removed, revenue_impact_pct,
         margin_impact_pct, safety_stock_freed_pct, supplier_reduction_pct
  FROM rationalization_scenario
  ORDER BY scenario_id;
$$;

-- ── Launch pipeline: gates + readiness, computed, never stored ────────────
-- lead_region and expected_year1_revenue_usd are labelled assumptions (8 Oct,
-- config.py "Launch targets"). actual_year1_revenue_usd is computed here from
-- fact_sales: a launched SKU's first 365 days on sale, annualised when the
-- data ends sooner. NULL for pipeline products, which have no sales.
-- risk_level is a fixed rule (see the CASE below), not a model.
-- Preserved existing function: fn_launches. No DROP required.
CREATE OR REPLACE FUNCTION fn_launches()
RETURNS TABLE (
  launch_id text, sku_id int, product_name text, category_name text,
  brand_name text, planned_launch_date date, actual_launch_date date,
  stage text, budget_usd numeric, spent_usd numeric, owner_role text,
  readiness_pct numeric, gates_overdue bigint,
  lead_region text, expected_year1_revenue_usd numeric,
  actual_year1_revenue_usd numeric, plan_attainment_pct numeric,
  next_gate_due date, risk_level text
)
LANGUAGE sql STABLE AS $$
  WITH data_end AS (SELECT max(date_key) AS d FROM fact_sales),
  ready AS (
    SELECT lg.launch_id,
           coalesce(sum(lg.weight) FILTER (WHERE lg.status = 'Completed'), 0) AS readiness,
           count(*) FILTER (WHERE lg.status = 'Overdue') AS overdue,
           min(lg.due_date) FILTER (WHERE lg.status <> 'Completed') AS next_due
    FROM launch_gate lg
    GROUP BY lg.launch_id
  ),
  first_sale AS (
    SELECT f.sku_id, min(f.date_key) AS d0
    FROM fact_sales f
    WHERE f.sku_id IN (SELECT dl.sku_id FROM dim_launch dl WHERE dl.sku_id IS NOT NULL)
    GROUP BY f.sku_id
  ),
  y1 AS (
    SELECT fs.sku_id,
           sum(f.net_sales) * 365.0
             / (least(fs.d0 + 364, max(de.d)) - fs.d0 + 1) AS annualised
    FROM first_sale fs
    JOIN data_end de ON true
    JOIN fact_sales f ON f.sku_id = fs.sku_id
                     AND f.date_key BETWEEN fs.d0 AND least(fs.d0 + 364, de.d)
    GROUP BY fs.sku_id, fs.d0
  )
  SELECT l.launch_id, l.sku_id, l.product_name, c.category_name, b.brand_name,
         l.planned_launch_date, l.actual_launch_date, l.stage,
         l.budget_usd, l.spent_usd, l.owner_role,
         r.readiness, r.overdue,
         l.lead_region, l.expected_year1_revenue_usd,
         round(y1.annualised, 2), y1.annualised / NULLIF(l.expected_year1_revenue_usd, 0),
         r.next_due,
         -- High: a gate is overdue. Medium: the next open gate falls due within
         -- 45 days of the data's as-of date. Low: otherwise (incl. launched).
         CASE WHEN r.overdue > 0 THEN 'High'
              WHEN r.next_due <= (SELECT d FROM data_end) + 45 THEN 'Medium'
              ELSE 'Low' END
  FROM dim_launch l
  JOIN dim_category c ON c.category_id = l.category_id
  JOIN dim_brand b ON b.brand_id = l.brand_id
  JOIN ready r ON r.launch_id = l.launch_id
  LEFT JOIN y1 ON y1.sku_id = l.sku_id
  ORDER BY l.planned_launch_date;
$$;

-- One launch's gates, or every launch's when p_launch_id is NULL (the
-- pipeline screen needs all of them in one request).
-- Preserved existing function: fn_launch_gates. No DROP required.
CREATE OR REPLACE FUNCTION fn_launch_gates(p_launch_id text DEFAULT NULL)
RETURNS TABLE (launch_id text, gate_no smallint, gate_name text, weight numeric,
               reviewer_role text, due_date date, completed_date date, status text)
LANGUAGE sql STABLE AS $$
  SELECT lg.launch_id, lg.gate_no, lg.gate_name, lg.weight, lg.reviewer_role,
         lg.due_date, lg.completed_date, lg.status
  FROM launch_gate lg
  WHERE p_launch_id IS NULL OR lg.launch_id = p_launch_id
  ORDER BY lg.launch_id, lg.gate_no;
$$;

-- Pipeline headline. At risk = a pipeline launch with at least one overdue
-- gate; revenue at risk = those launches' year-1 plan. Plan attainment is
-- over launched SKUs only (actual annualised year 1 ÷ plan).
CREATE OR REPLACE FUNCTION fn_launch_summary()
RETURNS TABLE (
  pipeline_launches bigint, launched bigint, avg_pipeline_readiness_pct numeric,
  at_risk_launches bigint, gates_overdue bigint,
  pipeline_year1_plan_usd numeric, revenue_at_risk_usd numeric,
  pipeline_budget_usd numeric, pipeline_spent_usd numeric,
  launched_plan_attainment_pct numeric
)
LANGUAGE sql STABLE AS $$
  WITH l AS (SELECT * FROM fn_launches())
  SELECT count(*) FILTER (WHERE l.sku_id IS NULL),
         count(*) FILTER (WHERE l.sku_id IS NOT NULL),
         avg(l.readiness_pct) FILTER (WHERE l.sku_id IS NULL),
         count(*) FILTER (WHERE l.sku_id IS NULL AND l.gates_overdue > 0),
         sum(l.gates_overdue),
         sum(l.expected_year1_revenue_usd) FILTER (WHERE l.sku_id IS NULL),
         coalesce(sum(l.expected_year1_revenue_usd) FILTER (WHERE l.sku_id IS NULL AND l.gates_overdue > 0), 0),
         sum(l.budget_usd) FILTER (WHERE l.sku_id IS NULL),
         sum(l.spent_usd) FILTER (WHERE l.sku_id IS NULL),
         sum(l.actual_year1_revenue_usd) FILTER (WHERE l.sku_id IS NOT NULL)
           / NULLIF(sum(l.expected_year1_revenue_usd) FILTER (WHERE l.sku_id IS NOT NULL), 0)
  FROM l;
$$;

-- ── Forecast attainment and accuracy over the trailing window ─────────────
-- Two different questions, kept apart (7 Oct fix — the first version called
-- 1 − WAPE "attainment"):
--   attainment_pct = actual ÷ forecast        "did we sell what we forecast?"
--   accuracy_pct   = 1 − WAPE                 "how close was each forecast?"
-- WAPE (weighted absolute percentage error) scores per SKU × country × month,
-- so over- and under-forecasts don't cancel the way they do in attainment.
-- LEFT JOIN: a forecast month with no sale is a miss, not a dropped row.
-- Preserved existing function: fn_forecast_accuracy. No DROP required.
CREATE OR REPLACE FUNCTION fn_forecast_accuracy(p_months int)
RETURNS TABLE (
  period_start date, period_end date,
  forecast_units bigint, actual_units bigint,
  wape numeric, bias_pct numeric, attainment_pct numeric, accuracy_pct numeric
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  act AS (
    SELECT date_trunc('month', f.date_key)::date AS m, f.sku_id, f.country_id,
           sum(f.units_sold) AS actual
    FROM fact_sales f, w
    WHERE f.date_key BETWEEN w.period_start AND w.period_end
    GROUP BY 1, 2, 3
  ),
  joined AS (
    SELECT fc.forecast_units, coalesce(act.actual, 0) AS actual
    FROM fact_forecast fc
    JOIN w ON true
    LEFT JOIN act ON act.m = fc.month_start AND act.sku_id = fc.sku_id
                 AND act.country_id = fc.country_id
    WHERE fc.month_start BETWEEN w.period_start AND w.period_end
      AND fc.forecast_method = 'statistical'
  )
  SELECT w.period_start, w.period_end,
         sum(j.forecast_units)::bigint, sum(j.actual)::bigint,
         sum(abs(j.forecast_units - j.actual))::numeric / NULLIF(sum(j.actual), 0),
         sum(j.forecast_units)::numeric / NULLIF(sum(j.actual), 0) - 1,
         sum(j.actual)::numeric / NULLIF(sum(j.forecast_units), 0),
         1 - (sum(abs(j.forecast_units - j.actual))::numeric / NULLIF(sum(j.actual), 0))
  FROM joined j, w
  GROUP BY w.period_start, w.period_end;
$$;

-- ── Customer accounts: top accounts over the trailing window ──────────────
CREATE OR REPLACE FUNCTION fn_customer_insights(p_months int)
RETURNS TABLE (
  customer_id smallint, customer_name text, account_tier text,
  country_name text, channel_name text,
  net_sales numeric, prior_net_sales numeric, growth_pct numeric,
  top_sku_name text
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  cur AS (
    SELECT cs.customer_id, sum(cs.net_sales) AS ns
    FROM fact_customer_sales cs, w
    WHERE cs.month_start BETWEEN w.period_start AND w.period_end
    GROUP BY cs.customer_id
  ),
  pri AS (
    SELECT cs.customer_id, sum(cs.net_sales) AS ns
    FROM fact_customer_sales cs, w
    WHERE w.prior_start IS NOT NULL
      AND cs.month_start BETWEEN w.prior_start AND w.prior_end
    GROUP BY cs.customer_id
  ),
  sku_rank AS (
    SELECT cs.customer_id, s.sku_name,
           row_number() OVER (PARTITION BY cs.customer_id ORDER BY sum(cs.net_sales) DESC) AS rk
    FROM fact_customer_sales cs
    JOIN dim_sku s ON s.sku_id = cs.sku_id
    JOIN w ON true
    WHERE cs.month_start BETWEEN w.period_start AND w.period_end
    GROUP BY cs.customer_id, s.sku_name
  )
  SELECT c.customer_id, c.customer_name, c.account_tier, co.country_name, ch.channel_name,
         cur.ns, pri.ns, cur.ns / NULLIF(pri.ns, 0) - 1, sk.sku_name
  FROM cur
  JOIN dim_customer c ON c.customer_id = cur.customer_id
  JOIN dim_country co ON co.country_id = c.country_id
  JOIN dim_channel ch ON ch.channel_id = c.channel_id
  LEFT JOIN pri ON pri.customer_id = cur.customer_id
  LEFT JOIN sku_rank sk ON sk.customer_id = cur.customer_id AND sk.rk = 1
  ORDER BY cur.ns DESC;
$$;

-- ── Rule-based alerts over real data — replaces the typed VP_ALERTS /
-- EVENT_TEMPLATES feed. Shared by the Home "Smart Alerts" panel and the
-- Signals Board (thread 6) rather than duplicated.
CREATE OR REPLACE FUNCTION fn_alerts(p_months int)
RETURNS TABLE (
  alert_id text, severity text, alert_type text, title text, detail text, sku_id int
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  -- Stockout RATE (events per transaction row), not raw count: a SKU launched
  -- partway through the prior window has fewer rows there, so its raw count
  -- rises year on year with no change in availability. The first version of
  -- this rule compared counts and fired only for three 2024 launches (7 Oct fix).
  cur_so AS (
    SELECT f.sku_id, sum(f.stock_out_flag) AS so, count(*) AS txn
    FROM fact_sales f, w
    WHERE f.date_key BETWEEN w.period_start AND w.period_end
    GROUP BY f.sku_id
  ),
  pri_so AS (
    SELECT f.sku_id, sum(f.stock_out_flag) AS so, count(*) AS txn
    FROM fact_sales f, w
    WHERE w.prior_start IS NOT NULL
      AND f.date_key BETWEEN w.prior_start AND w.prior_end
    GROUP BY f.sku_id
  ),
  stockout_alerts AS (
    SELECT 'SO-' || c.sku_id AS alert_id, 'warning'::text AS severity,
           'Supply'::text AS alert_type,
           s.sku_name || ' — stockout rate up '
             || round(((c.so::numeric / c.txn) / NULLIF(p.so::numeric / p.txn, 0) - 1) * 100)
             || '% this window' AS title,
           round(100.0 * c.so / c.txn, 1) || '% of transactions stocked out this window vs '
             || round(100.0 * p.so / p.txn, 1) || '% the prior window.' AS detail,
           c.sku_id
    FROM cur_so c
    JOIN pri_so p ON p.sku_id = c.sku_id
    JOIN dim_sku s ON s.sku_id = c.sku_id
    WHERE p.so >= 5
      AND (c.so::numeric / c.txn) > 1.5 * (p.so::numeric / p.txn)
  ),
  launch_alerts AS (
    SELECT 'LG-' || g.launch_id || '-' || g.gate_no, 'critical'::text, 'Launch'::text,
           l.product_name || ' — ' || g.gate_name || ' gate overdue',
           'Due ' || g.due_date || ', not yet complete. Planned launch ' || l.planned_launch_date || '.',
           l.sku_id
    FROM launch_gate g
    JOIN dim_launch l ON l.launch_id = g.launch_id
    WHERE g.status = 'Overdue'
  ),
  eol_alerts AS (
    SELECT 'EOL-' || n.notice_id, 'warning'::text, 'Supply'::text,
           s.sku_name || ' — ' || lower(n.notice_type) || ' (' || n.supplier_id || ')',
           'Notice received ' || n.notice_date || '; effective ' || n.eol_effective_date || '.',
           n.sku_id
    FROM supplier_notice n
    JOIN dim_sku s ON s.sku_id = n.sku_id
  ),
  margin_alerts AS (
    SELECT 'ME-' || m.sku_id, 'warning'::text, 'Margin'::text,
           s.sku_name || ' — margin erosion on promotion',
           round(m.margin_erosion, 1) || 'pp margin loss when promoted vs full price.',
           m.sku_id
    FROM sku_metrics m
    JOIN dim_sku s ON s.sku_id = m.sku_id
    WHERE m.margin_erosion >= 5
    ORDER BY m.margin_erosion DESC
    LIMIT 5
  ),
  cann_alerts AS (
    SELECT 'CN-' || a.sku_id_a || '-' || a.sku_id_b, 'info'::text, 'Cannibalization'::text,
           sa.sku_name || ' / ' || sb.sku_name || ' — high cannibalization risk',
           'Promo-to-units correlation ' || a.correlation || '.',
           a.sku_id_a
    FROM sku_cannibalization a
    JOIN dim_sku sa ON sa.sku_id = a.sku_id_a
    JOIN dim_sku sb ON sb.sku_id = a.sku_id_b
    WHERE a.is_significant
    ORDER BY a.correlation ASC
    LIMIT 5
  )
  SELECT * FROM stockout_alerts
  UNION ALL SELECT * FROM launch_alerts
  UNION ALL SELECT * FROM eol_alerts
  UNION ALL SELECT * FROM margin_alerts
  UNION ALL SELECT * FROM cann_alerts;
$$;

-- ── Assortment: density, yield, long-tail, per country ─────────────────────
CREATE OR REPLACE FUNCTION fn_assortment(p_months int)
RETURNS TABLE (
  country_name text, skus_selling bigint, gross_yield_per_sku numeric,
  long_tail_share numeric
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  by_country AS (
    SELECT c.country_name, f.sku_id, sum(f.net_sales) AS ns, sum(f.gross_margin) AS gm
    FROM fact_sales f
    JOIN dim_country c ON c.country_id = f.country_id, w
    WHERE f.date_key BETWEEN w.period_start AND w.period_end
    GROUP BY c.country_name, f.sku_id
  ),
  ranked AS (
    SELECT country_name, sku_id, ns, gm,
           ns / NULLIF(sum(ns) OVER (PARTITION BY country_name), 0) AS share
    FROM by_country
  )
  SELECT country_name, count(*),
         sum(gm) / NULLIF(count(*), 0),
         avg((share < 0.01)::int)
  FROM ranked
  GROUP BY country_name
  ORDER BY country_name;
$$;

-- ── Listings: ghost count and real per-region SKU shortlist ────────────────
CREATE OR REPLACE FUNCTION fn_listing_gaps()
RETURNS TABLE (country_name text, listed_never_sold bigint)
LANGUAGE sql STABLE AS $$
  SELECT c.country_name, count(*)
  FROM fact_listing l
  JOIN dim_country c ON c.country_id = l.country_id
  WHERE NOT EXISTS (
    SELECT 1 FROM fact_sales f
    WHERE f.sku_id = l.sku_id AND f.country_id = l.country_id AND f.channel_id = l.channel_id
  )
  GROUP BY c.country_name
  ORDER BY c.country_name;
$$;

-- ── Assortment headline (8 Oct, thread 4): the 4 KPI cards on tab 8 ───────
--   max_density            most SKUs selling in any one country (+ which)
--   long_tail_share        share of SKUs under 1% of portfolio revenue
--   gross_yield_per_sku    gross margin / SKUs selling, over the window
--   cannibalization_index  mean |correlation| of the significant negative
--                          promo-to-units pairs (sku_cannibalization, snapshot)
--   listed_never_sold      fact_listing rows with no sale on that listing
CREATE OR REPLACE FUNCTION fn_assortment_summary(p_months int)
RETURNS TABLE (
  active_skus bigint, max_density bigint, max_density_country text,
  long_tail_skus bigint, long_tail_share numeric,
  gross_yield_per_sku numeric, cannibalization_index numeric,
  cannibalization_pairs bigint, top_cannibalization_category text,
  listed_never_sold bigint
)
LANGUAGE sql STABLE AS $$
  WITH s AS (SELECT * FROM fn_sku_performance(p_months)),
  dens AS (SELECT a.country_name, a.skus_selling FROM fn_assortment(p_months) a
           ORDER BY a.skus_selling DESC, a.country_name LIMIT 1),
  cann AS (
    SELECT c.correlation, cat.category_name
    FROM sku_cannibalization c
    JOIN dim_sku sk ON sk.sku_id = c.sku_id_a
    JOIN dim_category cat ON cat.category_id = sk.category_id
    WHERE c.is_significant AND c.correlation < 0
  ),
  top_cat AS (SELECT category_name FROM cann GROUP BY 1 ORDER BY count(*) DESC, 1 LIMIT 1)
  SELECT (SELECT count(*) FROM s),
         (SELECT skus_selling FROM dens), (SELECT country_name FROM dens),
         (SELECT count(*) FROM s WHERE s.revenue_share_pct < 0.01),
         (SELECT avg((s.revenue_share_pct < 0.01)::int) FROM s),
         (SELECT sum(s.net_sales * s.gross_margin_pct) / NULLIF(count(*), 0) FROM s),
         (SELECT avg(-correlation) FROM cann),
         (SELECT count(*) FROM cann),
         (SELECT category_name FROM top_cat),
         (SELECT coalesce(sum(g.listed_never_sold), 0) FROM fn_listing_gaps() g);
$$;

CREATE OR REPLACE FUNCTION fn_region_sku_shortlist(p_region text, p_months int)
RETURNS TABLE (sku_name text, net_sales numeric)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months))
  SELECT s.sku_name, sum(f.net_sales)
  FROM fact_sales f
  JOIN dim_country c ON c.country_id = f.country_id
  JOIN dim_sku s ON s.sku_id = f.sku_id
  JOIN w ON true
  WHERE c.region = p_region AND f.date_key BETWEEN w.period_start AND w.period_end
  GROUP BY s.sku_name
  ORDER BY 2 DESC
  LIMIT 4;
$$;

-- ── Accounts ranked within each category ──────────────────────────────────
-- The Home "Customer Insights" panel has one tab per category. Filtering
-- fn_customer_insights by each account's single top SKU left Personal Care
-- empty (no account's top SKU was in it); every account buys most
-- categories, so rank accounts by their sales IN the category instead.
CREATE OR REPLACE FUNCTION fn_customer_category_insights(p_months int)
RETURNS TABLE (
  category_name text, customer_id smallint, customer_name text, account_tier text,
  country_name text, channel_name text, net_sales numeric, prior_net_sales numeric,
  growth_pct numeric, top_sku_name text, category_rank bigint
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  cur AS (
    SELECT cs.customer_id, s.category_id, sum(cs.net_sales) AS ns
    FROM fact_customer_sales cs
    JOIN dim_sku s ON s.sku_id = cs.sku_id
    JOIN w ON true
    WHERE cs.month_start BETWEEN w.period_start AND w.period_end
    GROUP BY 1, 2
  ),
  pri AS (
    SELECT cs.customer_id, s.category_id, sum(cs.net_sales) AS ns
    FROM fact_customer_sales cs
    JOIN dim_sku s ON s.sku_id = cs.sku_id
    JOIN w ON true
    WHERE w.prior_start IS NOT NULL
      AND cs.month_start BETWEEN w.prior_start AND w.prior_end
    GROUP BY 1, 2
  ),
  top_sku AS (
    SELECT cs.customer_id, s.category_id, s.sku_name,
           row_number() OVER (PARTITION BY cs.customer_id, s.category_id
                              ORDER BY sum(cs.net_sales) DESC) AS rk
    FROM fact_customer_sales cs
    JOIN dim_sku s ON s.sku_id = cs.sku_id
    JOIN w ON true
    WHERE cs.month_start BETWEEN w.period_start AND w.period_end
    GROUP BY cs.customer_id, s.category_id, s.sku_name
  )
  SELECT cat.category_name, c.customer_id, c.customer_name, c.account_tier,
         co.country_name, ch.channel_name, cur.ns, pri.ns,
         cur.ns / NULLIF(pri.ns, 0) - 1, t.sku_name,
         row_number() OVER (PARTITION BY cur.category_id ORDER BY cur.ns DESC)
  FROM cur
  JOIN dim_category cat ON cat.category_id = cur.category_id
  JOIN dim_customer c ON c.customer_id = cur.customer_id
  JOIN dim_country co ON co.country_id = c.country_id
  JOIN dim_channel ch ON ch.channel_id = c.channel_id
  LEFT JOIN pri ON pri.customer_id = cur.customer_id AND pri.category_id = cur.category_id
  LEFT JOIN top_sku t ON t.customer_id = cur.customer_id AND t.category_id = cur.category_id AND t.rk = 1
  ORDER BY cat.category_name, cur.ns DESC;
$$;

-- ── Region mix: category and channel breakdown per real region ─────────────
-- For the Home Regional Forecast modal, which used to show the same typed
-- "EMEA" figures for every region (7 Oct fix).
CREATE OR REPLACE FUNCTION fn_region_mix(p_months int)
RETURNS TABLE (region text, dimension text, name text, net_sales numeric, prior_net_sales numeric)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  base AS (
    SELECT co.region, cat.category_name, ch.channel_name, f.net_sales,
           (f.date_key BETWEEN w.period_start AND w.period_end) AS is_cur,
           (w.prior_start IS NOT NULL AND f.date_key BETWEEN w.prior_start AND w.prior_end) AS is_pri
    FROM fact_sales f
    JOIN dim_country co ON co.country_id = f.country_id
    JOIN dim_channel ch ON ch.channel_id = f.channel_id
    JOIN dim_sku s ON s.sku_id = f.sku_id
    JOIN dim_category cat ON cat.category_id = s.category_id
    JOIN w ON true
  )
  SELECT region, 'category', category_name,
         sum(net_sales) FILTER (WHERE is_cur), sum(net_sales) FILTER (WHERE is_pri)
  FROM base GROUP BY region, category_name
  UNION ALL
  SELECT region, 'channel', channel_name,
         sum(net_sales) FILTER (WHERE is_cur), sum(net_sales) FILTER (WHERE is_pri)
  FROM base GROUP BY region, channel_name
  ORDER BY 1, 2, 4 DESC;
$$;

-- ── Category sales trend, weekly or monthly, indexed to the first period ──
-- sales_index = 100 x period net sales / the category's first full period in
-- the window, so categories of very different size share one axis. Partial
-- first/last weeks are dropped (date_trunc('week') starts on Monday).
CREATE OR REPLACE FUNCTION fn_category_trend(p_months int, p_grain text DEFAULT 'month')
RETURNS TABLE (period_start date, category_name text, net_sales numeric, sales_index numeric)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  g AS (SELECT CASE WHEN p_grain = 'week' THEN 'week' ELSE 'month' END AS grain),
  base AS (
    SELECT date_trunc((SELECT grain FROM g), f.date_key)::date AS ps,
           cat.category_name, sum(f.net_sales) AS ns, count(DISTINCT f.date_key) AS days
    FROM fact_sales f
    JOIN dim_sku s ON s.sku_id = f.sku_id
    JOIN dim_category cat ON cat.category_id = s.category_id
    JOIN w ON true
    WHERE f.date_key BETWEEN w.period_start AND w.period_end
    GROUP BY 1, 2
  ),
  full_periods AS (
    SELECT b.* FROM base b
    WHERE (SELECT grain FROM g) = 'month' OR b.days = 7
  ),
  first_p AS (
    SELECT DISTINCT ON (category_name) category_name, ns AS ns0
    FROM full_periods ORDER BY category_name, ps
  )
  SELECT fp.ps, fp.category_name, round(fp.ns, 2),
         round(100 * fp.ns / NULLIF(f0.ns0, 0), 1)
  FROM full_periods fp
  JOIN first_p f0 ON f0.category_name = fp.category_name
  ORDER BY fp.ps, fp.category_name;
$$;

-- ── SKU rationale (8 Oct, thread 3): why each real SKU is flagged ─────────
-- Replaces the 30 fictional SKUs on tab 9 and the 200 generated rows on
-- tab 10. One primary factor per SKU, first match wins:
--   1 Supplier Discontinuation  a supplier_notice exists          -> Discontinue / Consolidate
--   2 Declining Sales           growth < 0 over the window        -> Discontinue / Consolidate
--                               if also Rationalize + <1% revenue, else Reposition
--   3 Low Profitability         margin < portfolio margin - 8pp   -> Reformulate / Redesign
--   4 Inventory Inefficiency    stockout rate > 2x the portfolio  -> Reformulate / Redesign
--   5 Cannibalization           smaller SKU of a significant pair with rho <= -0.5
--                                                                 -> Discontinue / Consolidate
--   6 SKU Proliferation         Rationalize segment + <1% revenue -> Discontinue / Consolidate
--   7 Strong Brand Growth       growth >= 12%                     -> Invest / Expand
-- SKUs matching none are not returned. Thresholds are judgment calls, stated
-- here and in the audit drawer. Customer complaints, competitor moves and
-- regulation have no data source, so no SKU is classified under them.
-- Preserved existing function: fn_sku_rationale. No DROP required.
CREATE OR REPLACE FUNCTION fn_sku_rationale(p_months int)
RETURNS TABLE (
  sku_id int, sku_name text, category_name text, brand_name text, region text,
  lifecycle_stage text, net_sales numeric, gross_margin_pct numeric,
  portfolio_margin_pct numeric, growth_pct numeric, portfolio_growth_pct numeric,
  margin_erosion numeric, promo_dependency numeric, stockout_rate numeric,
  portfolio_stockout_rate numeric, complexity numeric, portfolio_segment text,
  cann_partner text, cann_correlation numeric, eol_notice_type text, eol_effective_date date,
  factor text, factor_group text, action text, priority text,
  revenue_share_pct numeric, margin_without_sku_pct numeric
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  perf AS (SELECT * FROM fn_sku_performance(p_months)),
  port AS (
    SELECT sum(pf.net_sales * pf.gross_margin_pct) / NULLIF(sum(pf.net_sales), 0) AS margin,
           sum(pf.net_sales) AS ns, sum(pf.net_sales * pf.gross_margin_pct) AS gm,
           sum(pf.stockout_events)::numeric / NULLIF(sum(pf.transactions), 0) AS so_rate,
           (SELECT growth_pct FROM fn_portfolio_kpis(p_months)) AS growth
    FROM perf pf
  ),
  reg AS (
    SELECT DISTINCT ON (f.sku_id) f.sku_id, co.region
    FROM fact_sales f
    JOIN dim_country co ON co.country_id = f.country_id
    JOIN w ON true
    WHERE f.date_key BETWEEN w.period_start AND w.period_end
    GROUP BY f.sku_id, co.region
    ORDER BY f.sku_id, sum(f.net_sales) DESC
  ),
  cann AS (
    SELECT DISTINCT ON (x.sku_id) x.sku_id, x.partner, x.partner_id, x.correlation
    FROM (
      SELECT c.sku_id_a AS sku_id, c.sku_id_b AS partner_id, c.correlation FROM sku_cannibalization c
      WHERE c.is_significant AND c.correlation <= -0.5
      UNION ALL
      SELECT c.sku_id_b, c.sku_id_a, c.correlation FROM sku_cannibalization c
      WHERE c.is_significant AND c.correlation <= -0.5
    ) x0
    CROSS JOIN LATERAL (SELECT x0.sku_id, s.sku_name AS partner, x0.partner_id, x0.correlation
                        FROM dim_sku s WHERE s.sku_id = x0.partner_id) x
    ORDER BY x.sku_id, x.correlation
  ),
  eol AS (
    SELECT DISTINCT ON (n.sku_id) n.sku_id, n.notice_type, n.eol_effective_date
    FROM supplier_notice n ORDER BY n.sku_id, n.eol_effective_date
  ),
  base AS (
    SELECT pf.sku_id, pf.sku_name, pf.category_name, pf.brand_name, rg.region,
           pf.net_sales, pf.gross_margin_pct, pt.margin AS port_margin,
           pf.growth_pct, pt.growth AS port_growth,
           m.margin_erosion, m.promo_dependency,
           pf.stockout_events::numeric / NULLIF(pf.transactions, 0) AS so_rate, pt.so_rate AS port_so,
           m.operational_complexity_score AS cx, m.portfolio_segment, m.low_velocity_flag,
           cn.partner, cn.correlation, pp.net_sales AS partner_ns, e.notice_type, e.eol_effective_date,
           s.launch_date, w.period_start, pf.revenue_share_pct AS rev_share,
           -- portfolio margin with this SKU's sales and margin taken out, no
           -- demand transfer to other SKUs (the conservative case)
           (pt.gm - pf.net_sales * pf.gross_margin_pct) / NULLIF(pt.ns - pf.net_sales, 0) AS margin_wo
    FROM perf pf
    JOIN port pt ON true
    JOIN w ON true
    JOIN dim_sku s ON s.sku_id = pf.sku_id
    JOIN sku_metrics m ON m.sku_id = pf.sku_id
    LEFT JOIN reg rg ON rg.sku_id = pf.sku_id
    LEFT JOIN cann cn ON cn.sku_id = pf.sku_id
    LEFT JOIN perf pp ON pp.sku_id = cn.partner_id
    LEFT JOIN eol e ON e.sku_id = pf.sku_id
  ),
  classified AS (
    SELECT b.*,
      CASE
        WHEN b.notice_type IS NOT NULL THEN 'Supplier Discontinuation'
        WHEN b.growth_pct < 0 THEN 'Declining Sales'
        WHEN b.gross_margin_pct < b.port_margin - 0.08 THEN 'Low Profitability'
        WHEN b.so_rate > 2 * b.port_so THEN 'Inventory Inefficiency'
        -- only the smaller SKU of the pair: it is the one to fold into the other
        WHEN b.partner IS NOT NULL AND b.net_sales < coalesce(b.partner_ns, 0) THEN 'Cannibalization'
        WHEN b.portfolio_segment = 'Rationalize' AND b.low_velocity_flag = 1 THEN 'SKU Proliferation'
        WHEN b.growth_pct >= 0.12 THEN 'Strong Brand Growth'
      END AS factor
    FROM base b
  )
  SELECT c.sku_id, c.sku_name, c.category_name, c.brand_name, c.region,
         CASE WHEN c.growth_pct < 0 THEN 'Decline'
              WHEN c.launch_date >= c.period_start - interval '12 months' THEN 'Introduction'
              WHEN c.growth_pct >= 0.10 THEN 'Growth'
              ELSE 'Maturity' END,
         round(c.net_sales, 2), c.gross_margin_pct, c.port_margin, c.growth_pct, c.port_growth,
         c.margin_erosion, c.promo_dependency, c.so_rate, c.port_so, c.cx, c.portfolio_segment,
         c.partner, c.correlation, c.notice_type, c.eol_effective_date,
         c.factor,
         CASE c.factor
           WHEN 'Supplier Discontinuation' THEN 'Supply Chain Reasons'
           WHEN 'Inventory Inefficiency' THEN 'Supply Chain Reasons'
           WHEN 'Declining Sales' THEN 'Financial Reasons'
           WHEN 'Low Profitability' THEN 'Financial Reasons'
           ELSE 'Portfolio Reasons' END,
         CASE
           WHEN c.factor = 'Supplier Discontinuation' THEN 'Discontinue / Consolidate'
           WHEN c.factor = 'Declining Sales' AND c.portfolio_segment = 'Rationalize'
                AND c.low_velocity_flag = 1 THEN 'Discontinue / Consolidate'
           WHEN c.factor = 'Declining Sales' THEN 'Reposition'
           WHEN c.factor IN ('Low Profitability', 'Inventory Inefficiency') THEN 'Reformulate / Redesign'
           WHEN c.factor = 'Strong Brand Growth' THEN 'Invest / Expand'
           ELSE 'Discontinue / Consolidate' END,
         CASE
           WHEN c.factor = 'Supplier Discontinuation' THEN 'Critical'
           WHEN c.factor IN ('Declining Sales', 'Low Profitability') THEN 'High'
           ELSE 'Medium' END,
         c.rev_share, c.margin_wo
  FROM classified c
  WHERE c.factor IS NOT NULL
  ORDER BY c.net_sales DESC;
$$;

-- ── Signals Board (8 Oct, thread 6): internal signals only ────────────────
-- fn_alerts' rule-based alerts, each given a category, a region and a dollar
-- figure, plus demand shifts from fn_region_mix. Competitor, sentiment and
-- market-demand signals need external feeds and are out of scope (6-7 Oct
-- calls) — the screen says so rather than showing typed ones.
--   impact_usd by type:
--     Supply / Margin  the SKU's net sales in the window (revenue exposed)
--     Launch           the launch's year-1 plan (dim_launch, an assumption)
--     Cannibalization  the smaller SKU's net sales in the window
--     Opportunity      region x category sales above the prior window
--     Demand risk      region x category sales lost vs the prior window
--   region: the SKU's largest region in the window; a launch's lead region.
CREATE OR REPLACE FUNCTION fn_signals(p_months int)
RETURNS TABLE (
  signal_id text, severity text, signal_type text, title text, detail text,
  category_name text, region text, impact_usd numeric, impact_label text,
  trigger_rule text, recommended_action text, sku_id int
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  sku_reg AS (
    SELECT f.sku_id, co.region, sum(f.net_sales) AS ns
    FROM fact_sales f
    JOIN dim_country co ON co.country_id = f.country_id
    JOIN w ON true
    WHERE f.date_key BETWEEN w.period_start AND w.period_end
    GROUP BY f.sku_id, co.region
  ),
  sku_ns AS (
    SELECT sr.sku_id, sum(sr.ns) AS ns,
           (array_agg(sr.region ORDER BY sr.ns DESC))[1] AS top_region
    FROM sku_reg sr GROUP BY sr.sku_id
  ),
  a AS (SELECT * FROM fn_alerts(p_months)),
  sku_signals AS (
    SELECT a.alert_id, a.severity, a.alert_type, a.title, a.detail,
           cat.category_name, sn.top_region,
           CASE WHEN a.alert_type = 'Cannibalization'
                THEN least(sn.ns, sn_b.ns) ELSE sn.ns END AS impact_usd,
           CASE WHEN a.alert_type = 'Cannibalization' THEN 'smaller SKU''s sales in window'
                ELSE 'SKU sales in window' END AS impact_label,
           CASE a.alert_type
             WHEN 'Supply' THEN CASE WHEN a.alert_id LIKE 'EOL-%'
               THEN 'supplier_notice row for this SKU'
               ELSE 'stockout rate > 1.5x the prior window, >= 5 prior events' END
             WHEN 'Margin' THEN 'top 5 SKUs by promo margin erosion, >= 5pp'
             ELSE 'top 5 significant negative promo-to-units correlations' END AS trigger_rule,
           CASE a.alert_type
             WHEN 'Supply' THEN CASE WHEN a.alert_id LIKE 'EOL-%'
               THEN 'Qualify an alternative supplier before the effective date, or add the SKU to the rationalization review.'
               ELSE 'Check lead time and safety stock for this SKU before the next replenishment.' END
             WHEN 'Margin' THEN 'Review promotion depth and frequency; compare volume uplift against margin given away.'
             ELSE 'Stagger promotions on the pair; review whether both variants are needed.' END,
           a.sku_id
    FROM a
    JOIN dim_sku s ON s.sku_id = a.sku_id
    JOIN dim_category cat ON cat.category_id = s.category_id
    LEFT JOIN sku_ns sn ON sn.sku_id = a.sku_id
    -- CASE, not AND: the cast must never run on a non-pair id ('SO-12').
    LEFT JOIN sku_ns sn_b ON sn_b.sku_id = CASE WHEN a.alert_type = 'Cannibalization'
                                                THEN split_part(a.alert_id, '-', 3)::int END
    WHERE a.alert_type <> 'Launch'
  ),
  launch_signals AS (
    SELECT a.alert_id, a.severity, a.alert_type, a.title, a.detail,
           cat.category_name, l.lead_region, l.expected_year1_revenue_usd,
           'year-1 plan (assumption)',
           'launch_gate.status = Overdue',
           'Escalate the overdue gate to its reviewer and confirm whether the planned launch date still holds.',
           NULL::int
    FROM a
    JOIN dim_launch l ON l.launch_id = split_part(a.alert_id, '-', 2)
    JOIN dim_category cat ON cat.category_id = l.category_id
    WHERE a.alert_type = 'Launch'
  ),
  mix AS (
    SELECT m.region, m.name AS category_name, m.net_sales, m.prior_net_sales,
           m.net_sales / NULLIF(m.prior_net_sales, 0) - 1 AS g
    FROM fn_region_mix(p_months) m
    WHERE m.dimension = 'category' AND m.prior_net_sales IS NOT NULL
  ),
  port AS (SELECT growth_pct FROM fn_portfolio_kpis(p_months)),
  opp AS (
    SELECT 'OPP-' || replace(m.region, ' ', '') || '-' || replace(m.category_name, ' ', ''),
           'info'::text, 'Opportunity'::text,
           m.category_name || ' growing ' || round(m.g * 100, 1) || '% in ' || m.region,
           'Sales $' || round(m.net_sales / 1e6, 1) || 'M vs $' || round(m.prior_net_sales / 1e6, 1)
             || 'M the prior window; portfolio growth ' || round((SELECT growth_pct FROM port) * 100, 1) || '%.',
           m.category_name, m.region, m.net_sales - m.prior_net_sales,
           'sales added vs prior window',
           'one of the 3 fastest-growing region x category cells, and above portfolio growth',
           'Check availability and safety stock for this category in this region so supply keeps up with demand.',
           NULL::int
    FROM (SELECT mix.*, row_number() OVER (ORDER BY g DESC) AS rk FROM mix) m
    WHERE m.rk <= 3 AND m.g > (SELECT growth_pct FROM port)
  ),
  demand_risk AS (
    SELECT 'DEM-' || replace(m.region, ' ', '') || '-' || replace(m.category_name, ' ', ''),
           'warning'::text, 'Demand'::text,
           m.category_name || ' declining ' || round(-m.g * 100, 1) || '% in ' || m.region,
           'Sales $' || round(m.net_sales / 1e6, 1) || 'M vs $' || round(m.prior_net_sales / 1e6, 1)
             || 'M the prior window.',
           m.category_name, m.region, m.prior_net_sales - m.net_sales,
           'sales lost vs prior window',
           'region x category sales below the prior window',
           'Review range, pricing and promotion for this category in this region.',
           NULL::int
    FROM mix m WHERE m.g < 0
  )
  SELECT u.* FROM (
    SELECT * FROM launch_signals
    UNION ALL SELECT * FROM sku_signals
    UNION ALL SELECT * FROM demand_risk
    UNION ALL SELECT * FROM opp
  ) u (signal_id, severity, signal_type, title, detail, category_name, region,
       impact_usd, impact_label, trigger_rule, recommended_action, sku_id)
  ORDER BY CASE u.severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
           u.impact_usd DESC NULLS LAST;
$$;

-- ── Profitability: revenue, COGS, assumption-based costs, implied EBIT ─────
CREATE OR REPLACE FUNCTION fn_pnl(p_months int)
RETURNS TABLE (
  period_start date, period_end date,
  net_sales numeric, gross_margin numeric,
  logistics_usd numeric, marketing_usd numeric, sga_variable_usd numeric,
  sga_fixed_usd numeric, fixed_sku_cost_usd numeric, opex_total_usd numeric,
  ebit_usd numeric, tax_usd numeric, net_profit_usd numeric
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  kpi AS (SELECT * FROM fn_portfolio_kpis(p_months)),
  ox AS (
    SELECT
      sum(o.amount_usd) FILTER (WHERE o.assumption_key LIKE 'logistics.%') AS logistics,
      sum(o.amount_usd) FILTER (WHERE o.assumption_key LIKE 'marketing.%') AS marketing,
      sum(o.amount_usd) FILTER (WHERE o.assumption_key = 'sga.variable') AS sga_var,
      sum(o.amount_usd) FILTER (WHERE o.assumption_key LIKE 'sga.fixed.%') AS sga_fixed
    FROM fact_opex o, w
    WHERE o.month_start BETWEEN w.period_start AND w.period_end
  ),
  -- sku_fixed_cost is annual. Each year contributes amount × (months of the
  -- window that fall in that year ÷ 12). The first version charged the end
  -- year's cost for the whole window, double-counting 2025 over 24 months.
  months_in AS (
    SELECT extract(year FROM m)::int AS yr, count(*) AS n
    FROM w, generate_series(date_trunc('month', w.period_start), w.period_end, interval '1 month') AS m
    GROUP BY 1
  ),
  fx AS (
    SELECT sum(sfc.amount_usd * mi.n / 12.0) AS fixed_cost
    FROM sku_fixed_cost sfc
    JOIN months_in mi ON mi.yr = sfc.year
  ),
  -- Revenue-weighted statutory rate across countries (the first version used
  -- an unweighted average, giving the Netherlands' 2.6% of sales the same say
  -- as Italy's 29%).
  tax AS (
    SELECT sum(a.rate * r.net_sales) / NULLIF(sum(r.net_sales), 0) AS rate
    FROM fn_regional_performance(p_months) r
    JOIN dim_cost_assumption a ON a.assumption_key = 'tax.' || r.country_name
  )
  SELECT w.period_start, w.period_end, kpi.net_sales, kpi.gross_margin,
         ox.logistics, ox.marketing, ox.sga_var, ox.sga_fixed, fx.fixed_cost,
         ox.logistics + ox.marketing + ox.sga_var + ox.sga_fixed + fx.fixed_cost,
         kpi.gross_margin - (ox.logistics + ox.marketing + ox.sga_var + ox.sga_fixed + fx.fixed_cost),
         greatest(0, kpi.gross_margin - (ox.logistics + ox.marketing + ox.sga_var + ox.sga_fixed + fx.fixed_cost)) * tax.rate,
         (kpi.gross_margin - (ox.logistics + ox.marketing + ox.sga_var + ox.sga_fixed + fx.fixed_cost))
           - greatest(0, kpi.gross_margin - (ox.logistics + ox.marketing + ox.sga_var + ox.sga_fixed + fx.fixed_cost)) * tax.rate
  FROM w, kpi, ox, fx, tax;
$$;

CREATE OR REPLACE FUNCTION fn_pnl_by_category(p_months int)
RETURNS TABLE (
  category_name text, net_sales numeric, gross_margin numeric,
  logistics_usd numeric, marketing_usd numeric, sga_usd numeric, fixed_sku_cost_usd numeric
)
LANGUAGE sql STABLE AS $$
  WITH w AS (SELECT * FROM metric_window(p_months)),
  rev AS (
    SELECT c.category_name, sum(f.net_sales) AS ns, sum(f.gross_margin) AS gm
    FROM fact_sales f
    JOIN dim_sku s ON s.sku_id = f.sku_id
    JOIN dim_category c ON c.category_id = s.category_id, w
    WHERE f.date_key BETWEEN w.period_start AND w.period_end
    GROUP BY c.category_name
  ),
  ox AS (
    SELECT c.category_name,
           sum(o.amount_usd) FILTER (WHERE o.assumption_key LIKE 'logistics.%') AS logistics,
           sum(o.amount_usd) FILTER (WHERE o.assumption_key LIKE 'marketing.%') AS marketing,
           sum(o.amount_usd) FILTER (WHERE o.assumption_key LIKE 'sga.%') AS sga
    FROM fact_opex o
    JOIN dim_category c ON c.category_id = o.category_id, w
    WHERE o.month_start BETWEEN w.period_start AND w.period_end
    GROUP BY c.category_name
  ),
  -- Same per-year pro-rating as fn_pnl (7 Oct fix).
  months_in AS (
    SELECT extract(year FROM m)::int AS yr, count(*) AS n
    FROM w, generate_series(date_trunc('month', w.period_start), w.period_end, interval '1 month') AS m
    GROUP BY 1
  ),
  fx AS (
    SELECT cat.category_name, sum(sfc.amount_usd * mi.n / 12.0) AS fixed_cost
    FROM sku_fixed_cost sfc
    JOIN months_in mi ON mi.yr = sfc.year
    JOIN dim_sku s ON s.sku_id = sfc.sku_id
    JOIN dim_category cat ON cat.category_id = s.category_id
    GROUP BY cat.category_name
  )
  SELECT rev.category_name, rev.ns, rev.gm,
         ox.logistics, ox.marketing, ox.sga, fx.fixed_cost
  FROM rev
  LEFT JOIN ox ON ox.category_name = rev.category_name
  LEFT JOIN fx ON fx.category_name = rev.category_name
  ORDER BY rev.ns DESC;
$$;

-- ── Metric registry — one row per figure, what it means, where it comes from ─
-- Preserve the existing metric_registry table and its constraints.
-- Original registry rows are backed up in metric_registry_backup_20261117.
DELETE FROM metric_registry;
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
  ('avg_lead_time_days','Average Lead Time',    'days',    'Mean of fact_sales.lead_time_days per country over the window. Reported alongside fulfillment_pct, not blended into it.', 'fn_regional_fulfillment'),
  -- 7 Oct additions. Snapshot metrics say so in their own definition.
  ('portfolio_segment','Portfolio Segment',    'category','Keep/Grow/Consolidate/Rationalize, a median split of commercial value and operational complexity across sku_metrics. Snapshot as of 2025-12-31, not windowed by the timeline selector.', 'fn_sku_segments'),
  ('operational_complexity_score','Complexity Score','ratio 0-1','Mean of 5 min-max normalised inputs (lead time, supplier count, promo dependency, stockouts, volatility). Snapshot as of 2025-12-31.', 'fn_sku_segments'),
  ('portfolio_complexity_index','Portfolio Complexity Index','ratio','Mean of 6 sub-drivers (2 are ratios against a typed baseline, not independently measured — see dataset docs). Snapshot as of 2025-12-31.', 'fn_portfolio_snapshot'),
  ('cannibalization_pair','SKU Pair Cannibalization','ratio -1..1','Correlation between one SKU''s promo intensity and another''s units, within category. Snapshot as of 2025-12-31.', 'fn_cannibalization'),
  ('scenario_revenue_impact','Rationalization Scenario Impact','ratio','Revenue/margin/safety-stock/supplier impact of removing a cohort of SKUs, computed from sku_metrics. Snapshot as of 2025-12-31.', 'fn_rationalization_scenarios'),
  ('launch_readiness_pct','Launch Readiness','ratio','Sum of completed gate weights for a launch, as of 2025-12-31. Computed from launch_gate, never stored.', 'fn_launches'),
  ('launch_revenue_at_risk','Launch Revenue at Risk','USD','Year-1 revenue plan (dim_launch.expected_year1_revenue_usd, a labelled assumption) of pipeline launches with at least one overdue gate.', 'fn_launch_summary'),
  ('assortment_summary','Assortment Headline','mixed','Max SKUs selling in a country, long-tail share (<1% revenue), gross margin per selling SKU, mean |correlation| of significant cannibalizing pairs (snapshot), listed-never-sold count.', 'fn_assortment_summary'),
  ('category_trend','Category Sales Trend','index','Weekly or monthly category net sales, indexed to 100 at the first full period in the window.', 'fn_category_trend'),
  ('sku_rationale','SKU Rationale','label','One primary rationale factor and action per flagged SKU, by a fixed 7-rule precedence (see fn_sku_rationale). Replaces the fictional SKUs on tabs 9 and 10.', 'fn_sku_rationale'),
  ('signals','Signals Board','list','fn_alerts rules plus region x category demand shifts (fn_region_mix), each with a category, region and dollar impact. Internal data only; competitor and sentiment signals are out of scope.', 'fn_signals'),
  ('launch_risk_level','Launch Risk Level','label','High = a gate is overdue; Medium = next open gate due within 45 days of the as-of date; Low = otherwise.', 'fn_launches'),
  ('launch_plan_attainment','Launch Plan Attainment','ratio','Launched SKUs: annualised first-365-day net sales from fact_sales ÷ the year-1 plan.', 'fn_launch_summary'),
  ('forecast_attainment','Forecast Attainment','ratio','Actual units sold ÷ statistical forecast units over the trailing window. Only forecasts made before their month count (causal).', 'fn_forecast_accuracy'),
  ('forecast_wape','Forecast Accuracy (1 − WAPE)','ratio','1 − weighted absolute percentage error per SKU × country × month: how close each forecast was, so over- and under-forecasts do not cancel.', 'fn_forecast_accuracy'),
  ('customer_category_net_sales','Account Net Sales by Category','USD','Per account × category sum of fact_customer_sales.net_sales, ranked within category.', 'fn_customer_category_insights'),
  ('region_mix','Region Category / Channel Mix','USD','Net sales per real region by category and by channel, current and prior window.', 'fn_region_mix'),
  ('customer_net_sales','Account Net Sales','USD','Per-account sum of fact_customer_sales.net_sales over the window; reconciles to fact_sales exactly.', 'fn_customer_insights'),
  ('alert','Alert','event','Rule-based: stockout spikes, overdue launch gates, supplier EOL notices, promo margin erosion, significant cannibalization pairs. Replaces the typed demo feed.', 'fn_alerts'),
  ('assortment_density','Assortment Density','count','Distinct SKUs selling per country over the window.', 'fn_assortment'),
  ('assortment_gross_yield','Assortment Gross Yield','USD per SKU','Gross profit per selling SKU, per country, over the window.', 'fn_assortment'),
  ('listed_never_sold','Listed, Never Sold','count','fact_listing rows with no matching fact_sales row for that SKU/country/channel.', 'fn_listing_gaps'),
  ('net_profit_usd','Net Profit','USD','Gross profit less logistics, marketing, SG&A and fixed SKU cost (all dim_cost_assumption-labelled assumptions) and corporate tax, over the window.', 'fn_pnl');

COMMIT;

\echo ''
\echo 'Calculation layer ready: metric_window + 8 metric functions + metric_registry.'
\echo 'Next: 04_validate.sql'
