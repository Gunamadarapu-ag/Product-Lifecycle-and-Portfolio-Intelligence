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

  RAISE NOTICE 'All % checks passed.', n_checks;
END
$$;
