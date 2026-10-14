-- ============================================================================
-- 04_validate.sql — assertions over the calculation engine
--
-- Two kinds of check:
--   1. Targets — the 12-month figures must land on the same targets, with the
--      same tolerances, as data/generator/validate.py (config.py TOL).
--   2. Consistency — every breakdown must add back up to the headline total,
--      for every timeline period. This is what guarantees two screens can't
--      show different numbers for the same thing.
--
-- Fails loudly (ON_ERROR_STOP + RAISE EXCEPTION) on the first broken check.
--   "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U Pd_lc_app -d ppl_intelligence -f data\schema\04_validate.sql
-- ============================================================================

\set ON_ERROR_STOP on

DO $$
DECLARE
  k record;
  c record;
  m int;
  total numeric;
  parts numeric;
  n_checks int := 0;
BEGIN
  -- ── 1. Targets (12 months = report year 2025) ──────────────────────────────
  SELECT * INTO k FROM fn_portfolio_kpis(12);

  IF abs(k.net_sales / 473000000 - 1) > 0.005 THEN
    RAISE EXCEPTION 'net_sales % is outside 0.5%% of $473M', k.net_sales; END IF;
  n_checks := n_checks + 1;

  IF abs(k.gross_margin_pct - 0.3853) > 0.001 THEN
    RAISE EXCEPTION 'gross_margin_pct % is outside 0.1pp of 38.53%%', k.gross_margin_pct; END IF;
  n_checks := n_checks + 1;

  IF abs(k.growth_pct - 0.083) > 0.003 THEN
    RAISE EXCEPTION 'growth_pct % is outside 0.3pp of 8.3%%', k.growth_pct; END IF;
  n_checks := n_checks + 1;

  IF k.active_skus <> 119 THEN
    RAISE EXCEPTION 'active_skus is %, expected 119', k.active_skus; END IF;
  n_checks := n_checks + 1;

  SELECT * INTO c FROM fn_concentration(12);
  IF abs(c.top10_share - 0.2781) > 0.01 OR abs(c.top20_share - 0.4851) > 0.01
     OR abs(c.top30_share - 0.6288) > 0.01 THEN
    RAISE EXCEPTION 'concentration %/%/% is outside 1pp of 27.81/48.51/62.88',
      c.top10_share, c.top20_share, c.top30_share; END IF;
  n_checks := n_checks + 1;

  -- ── 2. Consistency, every timeline period ──────────────────────────────────
  FOREACH m IN ARRAY ARRAY[1, 3, 6, 12, 24, 36] LOOP
    SELECT net_sales INTO total FROM fn_portfolio_kpis(m);

    SELECT sum(net_sales) INTO parts FROM fn_sku_performance(m);
    IF abs(parts - total) > 0.01 THEN
      RAISE EXCEPTION '% months: SKU breakdown % <> total %', m, parts, total; END IF;

    SELECT sum(net_sales) INTO parts FROM fn_regional_performance(m);
    IF abs(parts - total) > 0.01 THEN
      RAISE EXCEPTION '% months: regional breakdown % <> total %', m, parts, total; END IF;

    SELECT sum(net_sales) INTO parts FROM fn_channel_performance(m);
    IF abs(parts - total) > 0.01 THEN
      RAISE EXCEPTION '% months: channel breakdown % <> total %', m, parts, total; END IF;

    SELECT sum(net_sales) INTO parts FROM fn_monthly_trend(m);
    IF abs(parts - total) > 0.01 THEN
      RAISE EXCEPTION '% months: monthly series % <> total %', m, parts, total; END IF;

    SELECT sum(revenue_share_pct) INTO parts FROM fn_sku_performance(m);
    IF abs(parts - 1) > 0.000001 THEN
      RAISE EXCEPTION '% months: SKU shares sum to %, not 1', m, parts; END IF;

    SELECT stockout_events INTO total FROM fn_portfolio_kpis(m);
    SELECT sum(stockout_events) INTO parts FROM fn_regional_fulfillment(m);
    IF parts <> total THEN
      RAISE EXCEPTION '% months: fulfillment stockout breakdown % <> total %', m, parts, total; END IF;

    SELECT net_sales INTO total FROM fn_portfolio_kpis(m);
    SELECT sum(net_sales) INTO parts FROM fn_regional_fulfillment(m);
    IF abs(parts - total) > 0.01 THEN
      RAISE EXCEPTION '% months: fulfillment net_sales breakdown % <> total %', m, parts, total; END IF;

    n_checks := n_checks + 7;
  END LOOP;

  -- Growth must be NULL, not invented, when no full comparison window exists.
  IF (SELECT growth_pct FROM fn_portfolio_kpis(24)) IS NOT NULL THEN
    RAISE EXCEPTION '24 months: growth should be NULL (no prior window in the data)'; END IF;
  n_checks := n_checks + 1;

  -- Fulfillment is a rate: every country must land in [0, 1].
  IF EXISTS (
    SELECT 1 FROM fn_regional_fulfillment(12)
    WHERE fulfillment_pct < 0 OR fulfillment_pct > 1
  ) THEN
    RAISE EXCEPTION '12 months: a country fulfillment_pct is outside [0, 1]'; END IF;
  n_checks := n_checks + 1;

  -- All 7 real countries must be present, each in one of the 3 real regions.
  IF (SELECT count(*) FROM fn_regional_fulfillment(12)) <> 7 THEN
    RAISE EXCEPTION '12 months: fn_regional_fulfillment returned %, not 7 countries',
      (SELECT count(*) FROM fn_regional_fulfillment(12)); END IF;
  IF (SELECT count(DISTINCT region) FROM fn_regional_fulfillment(12)) <> 3 THEN
    RAISE EXCEPTION '12 months: fn_regional_fulfillment returned %, not 3 regions',
      (SELECT count(DISTINCT region) FROM fn_regional_fulfillment(12)); END IF;
  n_checks := n_checks + 2;

  -- ── 3. 7 Oct tables: breakdowns reconcile, nothing contradicts fact_sales ──
  -- Account sales add back to fact_sales, per month x SKU x country x channel.
  IF EXISTS (
    WITH a AS (
      SELECT date_trunc('month', date_key)::date AS m, sku_id, country_id, channel_id,
             sum(units_sold) AS u, sum(net_sales) AS n
      FROM fact_sales GROUP BY 1, 2, 3, 4),
    b AS (
      -- alias dc, not c: the block declares a record variable named c
      SELECT s.month_start AS m, s.sku_id, dc.country_id, dc.channel_id,
             sum(s.units_sold) AS u, sum(s.net_sales) AS n
      FROM fact_customer_sales s JOIN dim_customer dc USING (customer_id)
      GROUP BY 1, 2, 3, 4)
    SELECT 1 FROM a FULL JOIN b USING (m, sku_id, country_id, channel_id)
    WHERE a.u IS DISTINCT FROM b.u OR a.n IS DISTINCT FROM b.n
  ) THEN
    RAISE EXCEPTION 'fact_customer_sales does not reconcile to fact_sales'; END IF;
  n_checks := n_checks + 1;

  -- No sale before its SKU launched; no sale outside a listing.
  IF EXISTS (SELECT 1 FROM fact_sales f JOIN dim_sku s USING (sku_id)
             WHERE f.date_key < s.launch_date) THEN
    RAISE EXCEPTION 'a sale predates its SKU''s launch_date'; END IF;
  IF EXISTS (
    SELECT 1 FROM fact_sales f
    WHERE NOT EXISTS (
      SELECT 1 FROM fact_listing l
      WHERE l.sku_id = f.sku_id AND l.country_id = f.country_id AND l.channel_id = f.channel_id
        AND f.date_key >= l.listed_from AND (l.listed_to IS NULL OR f.date_key < l.listed_to))
  ) THEN
    RAISE EXCEPTION 'a sale falls outside every listing'; END IF;
  n_checks := n_checks + 2;

  -- Inventory sold units are fact_sales units (flow identity is a table CHECK).
  IF (SELECT sum(sold_units) FROM fact_inventory) <> (SELECT sum(units_sold) FROM fact_sales) THEN
    RAISE EXCEPTION 'fact_inventory sold_units does not match fact_sales units'; END IF;
  n_checks := n_checks + 1;

  -- Every traded SKU x country has a price in force on every sale date.
  IF EXISTS (
    SELECT 1 FROM fact_sales f
    WHERE NOT EXISTS (
      SELECT 1 FROM fact_price p
      WHERE p.sku_id = f.sku_id AND p.country_id = f.country_id
        AND f.date_key >= p.effective_from
        AND (p.effective_to IS NULL OR f.date_key < p.effective_to))
  ) THEN
    RAISE EXCEPTION 'a sale has no list price in force'; END IF;
  n_checks := n_checks + 1;

  -- Launch gate weights sum to 1 per launch.
  IF EXISTS (SELECT 1 FROM launch_gate GROUP BY launch_id HAVING abs(sum(weight) - 1) > 0.0005) THEN
    RAISE EXCEPTION 'launch gate weights do not sum to 1'; END IF;
  n_checks := n_checks + 1;

  -- Launch targets (8 Oct): every lead region is a real region, and each
  -- launched SKU's plan sits inside the generator's stated plan-error band
  -- (config.LAUNCH_PLAN_ERROR 0.8-1.25, widened by the $1k rounding).
  IF EXISTS (SELECT 1 FROM dim_launch l
             WHERE l.lead_region NOT IN (SELECT region FROM dim_country)) THEN
    RAISE EXCEPTION 'a launch lead_region is not a dim_country region'; END IF;
  IF EXISTS (SELECT 1 FROM fn_launches()
             WHERE sku_id IS NOT NULL AND plan_attainment_pct NOT BETWEEN 0.79 AND 1.26) THEN
    RAISE EXCEPTION 'a launched SKU''s year-1 actual is outside the plan-error band'; END IF;
  -- Revenue at risk is exactly the plan of pipeline launches with an overdue gate.
  IF (SELECT revenue_at_risk_usd FROM fn_launch_summary()) <>
     (SELECT coalesce(sum(expected_year1_revenue_usd), 0) FROM dim_launch l
      WHERE l.sku_id IS NULL AND EXISTS (SELECT 1 FROM launch_gate g
                                         WHERE g.launch_id = l.launch_id AND g.status = 'Overdue')) THEN
    RAISE EXCEPTION 'launch revenue at risk does not reconcile'; END IF;
  n_checks := n_checks + 3;

  -- Opex rates match the assumption they cite.
  IF EXISTS (SELECT 1 FROM fact_opex o JOIN dim_cost_assumption a USING (assumption_key)
             WHERE o.rate <> a.rate) THEN
    RAISE EXCEPTION 'a fact_opex rate differs from its dim_cost_assumption rate'; END IF;
  n_checks := n_checks + 1;

  RAISE NOTICE 'All % checks passed.', n_checks;
END
$$;
