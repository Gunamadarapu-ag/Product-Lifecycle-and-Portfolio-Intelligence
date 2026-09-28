-- ============================================================================
-- 01_schema.sql — FMCG portfolio star schema
--
-- Implements documentation/data_model_specification.md in full:
--   7 dimensions, 1 bridge, 1 fact, 4 derived tables, 1 matview, 1 view.
--
-- Run as ppl_app against the ppl_intelligence database. From the repo root in
-- Command Prompt (cmd.exe), as two separate lines:
--
--   set PGPASSWORD=<APP_PASSWORD>
--   "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U ppl_app -d ppl_intelligence -f data\schema\01_schema.sql
--
-- cmd.exe has no & call operator and no backtick continuation — keep each
-- command on a single line or it breaks into fragments.
--
-- Idempotent: drops and recreates everything. Safe to re-run during design.
-- All monetary columns are USD. Money is NUMERIC, never FLOAT.
-- ============================================================================

\set ON_ERROR_STOP on

BEGIN;

-- ── Teardown, reverse dependency order ──────────────────────────────────────
DROP VIEW             IF EXISTS v_supplier_category  CASCADE;
DROP MATERIALIZED VIEW IF EXISTS agg_sku_monthly     CASCADE;
DROP TABLE            IF EXISTS rationalization_scenario CASCADE;
DROP TABLE            IF EXISTS portfolio_metrics    CASCADE;
DROP TABLE            IF EXISTS sku_cannibalization  CASCADE;
DROP TABLE            IF EXISTS sku_metrics          CASCADE;
DROP TABLE            IF EXISTS fact_sales           CASCADE;
DROP TABLE            IF EXISTS sku_supplier         CASCADE;
DROP TABLE            IF EXISTS dim_sku              CASCADE;
DROP TABLE            IF EXISTS dim_date             CASCADE;
DROP TABLE            IF EXISTS dim_channel          CASCADE;
DROP TABLE            IF EXISTS dim_category         CASCADE;
DROP TABLE            IF EXISTS dim_brand            CASCADE;
DROP TABLE            IF EXISTS dim_supplier         CASCADE;
DROP TABLE            IF EXISTS dim_country          CASCADE;


-- ════════════════════════════════════════════════════════════════════════════
-- DIMENSIONS
-- ════════════════════════════════════════════════════════════════════════════

-- ── dim_country ─────────────────────────────────────────────────────────────
CREATE TABLE dim_country (
  country_id           SMALLINT      NOT NULL,
  country_name         TEXT          NOT NULL,
  region               TEXT          NOT NULL,
  complexity_label     TEXT          NOT NULL,
  listed_sku_count     SMALLINT      NOT NULL,
  revenue_share_target NUMERIC(6,4)  NOT NULL,

  CONSTRAINT pk_dim_country         PRIMARY KEY (country_id),
  CONSTRAINT uq_dim_country_name    UNIQUE (country_name),
  CONSTRAINT ck_dim_country_cxlabel CHECK (complexity_label IN ('High','Medium','Opt')),
  CONSTRAINT ck_dim_country_share   CHECK (revenue_share_target BETWEEN 0 AND 1),
  CONSTRAINT ck_dim_country_skus    CHECK (listed_sku_count > 0)
);

COMMENT ON TABLE  dim_country IS 'Markets. Seeded net-sales shares reconcile to $473M.';
COMMENT ON COLUMN dim_country.revenue_share_target IS 'Generator calibration target.';


-- ── dim_supplier ────────────────────────────────────────────────────────────
CREATE TABLE dim_supplier (
  supplier_id   TEXT     NOT NULL,
  supplier_name TEXT     NOT NULL,
  country_id    SMALLINT NULL,          -- nullable: not every supplier has a home market

  CONSTRAINT pk_dim_supplier         PRIMARY KEY (supplier_id),
  CONSTRAINT fk_dim_supplier_country FOREIGN KEY (country_id)
      REFERENCES dim_country (country_id) ON DELETE RESTRICT,
  CONSTRAINT ck_dim_supplier_idfmt   CHECK (supplier_id ~ '^S[0-9]{3}$')
);

COMMENT ON TABLE dim_supplier IS
  'S001-S060. All 60 suppliers cover all SKUs - the absence of specialisation '
  'is the finding behind the Supplier Fragmentation Index (1.20 vs 1.00).';


-- ── dim_brand ───────────────────────────────────────────────────────────────
CREATE TABLE dim_brand (
  brand_id   SMALLINT NOT NULL,
  brand_name TEXT     NOT NULL,
  brand_role TEXT     NULL,             -- nullable: strategic label, not a data attribute

  CONSTRAINT pk_dim_brand      PRIMARY KEY (brand_id),
  CONSTRAINT uq_dim_brand_name UNIQUE (brand_name),
  CONSTRAINT ck_dim_brand_role CHECK (
      brand_role IS NULL OR
      brand_role IN ('Strategic','Cash Cow','Flanker','Silver Bullet','Energizer'))
);

COMMENT ON TABLE dim_brand IS
  'Not in the source schema. Added because 91 of 119 SKU names are descriptive '
  'and do not parse as Brand + Type.';


-- ── dim_category ────────────────────────────────────────────────────────────
CREATE TABLE dim_category (
  category_id         SMALLINT NOT NULL,
  category_name       TEXT     NOT NULL,
  seasonality_profile TEXT     NOT NULL,

  CONSTRAINT pk_dim_category      PRIMARY KEY (category_id),
  CONSTRAINT uq_dim_category_name UNIQUE (category_name),
  CONSTRAINT ck_dim_category_seas CHECK (
      seasonality_profile IN ('winter_peak','summer_peak','flat','q4_peak'))
);

COMMENT ON TABLE dim_category IS
  '7 categories. Source reference documents 5 and calls one Home Care; the code '
  'uses 7, renaming it Household and adding Beauty and Fashion. Code wins.';


-- ── dim_channel ─────────────────────────────────────────────────────────────
CREATE TABLE dim_channel (
  channel_id            SMALLINT     NOT NULL,
  channel_name          TEXT         NOT NULL,
  revenue_share_target  NUMERIC(6,4) NOT NULL,
  stockout_share_target NUMERIC(6,4) NOT NULL,

  CONSTRAINT pk_dim_channel        PRIMARY KEY (channel_id),
  CONSTRAINT uq_dim_channel_name   UNIQUE (channel_name),
  CONSTRAINT ck_dim_channel_shares CHECK (
      revenue_share_target  BETWEEN 0 AND 1 AND
      stockout_share_target BETWEEN 0 AND 1)
);


-- ── dim_date ────────────────────────────────────────────────────────────────
CREATE TABLE dim_date (
  date_key    DATE     NOT NULL,
  year        SMALLINT NOT NULL,
  quarter     SMALLINT NOT NULL,
  month       SMALLINT NOT NULL,
  month_name  TEXT     NOT NULL,
  week        SMALLINT NOT NULL,
  day_of_week SMALLINT NOT NULL,
  is_weekend  BOOLEAN  NOT NULL,

  CONSTRAINT pk_dim_date       PRIMARY KEY (date_key),
  CONSTRAINT ck_dim_date_month CHECK (month       BETWEEN 1 AND 12),
  CONSTRAINT ck_dim_date_qtr   CHECK (quarter     BETWEEN 1 AND 4),
  CONSTRAINT ck_dim_date_week  CHECK (week        BETWEEN 1 AND 53),
  CONSTRAINT ck_dim_date_dow   CHECK (day_of_week BETWEEN 0 AND 6)
);

COMMENT ON TABLE dim_date IS
  '2024-01-01 to 2025-12-31, 730 rows. Two complete years so YoY growth is computable.';


-- ── dim_sku ─────────────────────────────────────────────────────────────────
CREATE TABLE dim_sku (
  sku_id                INTEGER       NOT NULL,
  sku_name              TEXT          NOT NULL,
  brand_id              SMALLINT      NOT NULL,
  category_id           SMALLINT      NOT NULL,
  primary_supplier_id   TEXT          NOT NULL,
  base_price            NUMERIC(10,2) NOT NULL,
  purchase_cost         NUMERIC(10,2) NOT NULL,
  target_margin_pct     NUMERIC(6,4)  NOT NULL,
  lead_time_days        NUMERIC(5,2)  NOT NULL,
  promo_propensity      NUMERIC(6,4)  NOT NULL,
  household_penetration NUMERIC(4,3)  NULL,   -- nullable: invented proxy, no source column
  launch_date           DATE          NULL,   -- nullable: NULL means it predates the dataset
  is_active             BOOLEAN       NOT NULL DEFAULT TRUE,

  CONSTRAINT pk_dim_sku           PRIMARY KEY (sku_id),
  CONSTRAINT uq_dim_sku_name      UNIQUE (sku_name),
  CONSTRAINT fk_dim_sku_brand     FOREIGN KEY (brand_id)
      REFERENCES dim_brand (brand_id) ON DELETE RESTRICT,
  CONSTRAINT fk_dim_sku_category  FOREIGN KEY (category_id)
      REFERENCES dim_category (category_id) ON DELETE RESTRICT,
  CONSTRAINT fk_dim_sku_supplier  FOREIGN KEY (primary_supplier_id)
      REFERENCES dim_supplier (supplier_id) ON DELETE RESTRICT,

  -- Makes a negative-margin SKU structurally impossible to insert.
  CONSTRAINT ck_dim_sku_price     CHECK (base_price > purchase_cost AND purchase_cost > 0),
  CONSTRAINT ck_dim_sku_margin    CHECK (target_margin_pct BETWEEN 0 AND 1),
  CONSTRAINT ck_dim_sku_lead      CHECK (lead_time_days > 0),
  CONSTRAINT ck_dim_sku_promo     CHECK (promo_propensity BETWEEN 0 AND 1),
  CONSTRAINT ck_dim_sku_penetration CHECK (
      household_penetration IS NULL OR household_penetration BETWEEN 0 AND 1)
);

COMMENT ON TABLE  dim_sku IS '119 SKUs, seeded from src/constants/data.ts SKUS.';
COMMENT ON COLUMN dim_sku.purchase_cost IS
  'Constant across the period - documented assumption #1.';


-- ════════════════════════════════════════════════════════════════════════════
-- BRIDGE
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE sku_supplier (
  sku_id      INTEGER       NOT NULL,
  supplier_id TEXT          NOT NULL,
  is_primary  BOOLEAN       NOT NULL DEFAULT FALSE,
  unit_cost   NUMERIC(10,2) NULL,      -- nullable: reserved, unused in phase 1

  CONSTRAINT pk_sku_supplier          PRIMARY KEY (sku_id, supplier_id),
  CONSTRAINT fk_sku_supplier_sku      FOREIGN KEY (sku_id)
      REFERENCES dim_sku (sku_id) ON DELETE CASCADE,
  CONSTRAINT fk_sku_supplier_supplier FOREIGN KEY (supplier_id)
      REFERENCES dim_supplier (supplier_id) ON DELETE RESTRICT,
  CONSTRAINT ck_sku_supplier_cost     CHECK (unit_cost IS NULL OR unit_cost > 0)
);

-- Exactly one primary supplier per SKU.
CREATE UNIQUE INDEX uq_sku_supplier_primary
  ON sku_supplier (sku_id) WHERE is_primary;

COMMENT ON TABLE sku_supplier IS '119 x 60 = 7,140 rows. All suppliers cover all SKUs.';


-- ════════════════════════════════════════════════════════════════════════════
-- FACT
-- Grain: one row per SKU x country x channel x day.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE fact_sales (
  sale_id        BIGINT        GENERATED ALWAYS AS IDENTITY,
  date_key       DATE          NOT NULL,
  sku_id         INTEGER       NOT NULL,
  country_id     SMALLINT      NOT NULL,
  channel_id     SMALLINT      NOT NULL,
  supplier_id    TEXT          NOT NULL,
  units_sold     INTEGER       NOT NULL,
  net_sales      NUMERIC(12,2) NOT NULL,
  purchase_cost  NUMERIC(10,2) NOT NULL,

  -- Generated: makes gross_margin = net_sales - units x cost impossible to violate.
  gross_margin   NUMERIC(14,2)
      GENERATED ALWAYS AS (net_sales - (units_sold * purchase_cost)) STORED,

  promo_flag     NUMERIC(3,2)  NOT NULL,
  stock_out_flag SMALLINT      NOT NULL,
  lead_time_days NUMERIC(5,2)  NOT NULL,

  CONSTRAINT pk_fact_sales PRIMARY KEY (sale_id),

  -- The grain, stated as an enforceable rule. Without this a duplicated
  -- SKU/country/channel/day would silently double revenue.
  CONSTRAINT uq_fact_sales_grain UNIQUE (date_key, sku_id, country_id, channel_id),

  CONSTRAINT fk_fact_sales_date     FOREIGN KEY (date_key)
      REFERENCES dim_date (date_key) ON DELETE RESTRICT,
  CONSTRAINT fk_fact_sales_sku      FOREIGN KEY (sku_id)
      REFERENCES dim_sku (sku_id) ON DELETE RESTRICT,
  CONSTRAINT fk_fact_sales_country  FOREIGN KEY (country_id)
      REFERENCES dim_country (country_id) ON DELETE RESTRICT,
  CONSTRAINT fk_fact_sales_channel  FOREIGN KEY (channel_id)
      REFERENCES dim_channel (channel_id) ON DELETE RESTRICT,
  CONSTRAINT fk_fact_sales_supplier FOREIGN KEY (supplier_id)
      REFERENCES dim_supplier (supplier_id) ON DELETE RESTRICT,

  CONSTRAINT ck_fact_sales_units    CHECK (units_sold    >= 0),
  CONSTRAINT ck_fact_sales_sales    CHECK (net_sales     >= 0),
  CONSTRAINT ck_fact_sales_cost     CHECK (purchase_cost >  0),
  CONSTRAINT ck_fact_sales_promo    CHECK (promo_flag IN (0, 0.2, 0.5, 1.0)),
  CONSTRAINT ck_fact_sales_stockout CHECK (stock_out_flag IN (0, 1)),
  CONSTRAINT ck_fact_sales_lead     CHECK (lead_time_days > 0)
);

COMMENT ON COLUMN fact_sales.purchase_cost IS
  'Denormalised from dim_sku deliberately: captures cost as at the transaction '
  'so historic margin stays correct if the SKU-level figure is revised.';


-- ════════════════════════════════════════════════════════════════════════════
-- DERIVED  (computed from fact_sales after load; truncate and rebuild)
-- ════════════════════════════════════════════════════════════════════════════

-- ── sku_metrics ─────────────────────────────────────────────────────────────
CREATE TABLE sku_metrics (
  sku_id                       INTEGER       NOT NULL,
  snapshot_date                DATE          NOT NULL,

  -- Commercial
  total_net_sales              NUMERIC(14,2) NOT NULL,
  total_units_sold             BIGINT        NOT NULL,
  total_gross_margin           NUMERIC(14,2) NOT NULL,
  gross_margin_pct             NUMERIC(6,4)  NOT NULL,
  revenue_growth               NUMERIC(6,4)  NULL,   -- NULL = no prior-year history
  revenue_share_pct            NUMERIC(6,4)  NOT NULL,
  low_velocity_flag            SMALLINT      NOT NULL,

  -- Supply chain
  total_stockouts              INTEGER       NOT NULL,
  avg_lead_time_days           NUMERIC(5,2)  NOT NULL,
  demand_std                   NUMERIC(12,4) NOT NULL,
  safety_stock_proxy           NUMERIC(14,4) NOT NULL,
  ss_to_revenue_ratio          NUMERIC(10,8) NOT NULL,
  inventory_carrying_cost      NUMERIC(14,2) NOT NULL,

  -- Promotions
  promo_dependency             NUMERIC(6,4)  NOT NULL,
  margin_erosion               NUMERIC(10,4) NOT NULL,

  -- Volatility
  cv_score                     NUMERIC(6,4)  NOT NULL,
  volatility_class             TEXT          NOT NULL,
  seasonality_index            NUMERIC(6,4)  NOT NULL,

  -- Composite
  commercial_value_score       NUMERIC(6,4)  NOT NULL,
  operational_complexity_score NUMERIC(6,4)  NOT NULL,
  op_burden_ratio              NUMERIC(8,4)  NOT NULL,
  portfolio_segment            TEXT          NOT NULL,
  cannibalization_risk_score   NUMERIC(6,4)  NOT NULL,

  CONSTRAINT pk_sku_metrics     PRIMARY KEY (sku_id),
  CONSTRAINT fk_sku_metrics_sku FOREIGN KEY (sku_id)
      REFERENCES dim_sku (sku_id) ON DELETE CASCADE,
  CONSTRAINT ck_sku_metrics_vol CHECK (
      volatility_class IN ('Stable','Variable','Unstable')),
  CONSTRAINT ck_sku_metrics_seg CHECK (
      portfolio_segment IN ('Keep','Grow','Consolidate','Rationalize')),
  CONSTRAINT ck_sku_metrics_scores CHECK (
      commercial_value_score       BETWEEN 0 AND 1 AND
      operational_complexity_score BETWEEN 0 AND 1),
  CONSTRAINT ck_sku_metrics_lowvel CHECK (low_velocity_flag IN (0,1))
);

COMMENT ON COLUMN sku_metrics.revenue_growth IS
  'NULL means no 2024 history. The source warns these were filled with 0 and '
  'must be read as unknown, not flat.';
COMMENT ON COLUMN sku_metrics.safety_stock_proxy IS
  'lead_time x demand_std. ESTIMATED - no real inventory data exists.';


-- ── sku_cannibalization ─────────────────────────────────────────────────────
CREATE TABLE sku_cannibalization (
  sku_id_a       INTEGER      NOT NULL,
  sku_id_b       INTEGER      NOT NULL,
  category_id    SMALLINT     NOT NULL,
  correlation    NUMERIC(5,4) NOT NULL,
  is_significant BOOLEAN      NOT NULL,

  CONSTRAINT pk_sku_cannibalization PRIMARY KEY (sku_id_a, sku_id_b),
  CONSTRAINT fk_sku_cann_a   FOREIGN KEY (sku_id_a)
      REFERENCES dim_sku (sku_id) ON DELETE CASCADE,
  CONSTRAINT fk_sku_cann_b   FOREIGN KEY (sku_id_b)
      REFERENCES dim_sku (sku_id) ON DELETE CASCADE,
  CONSTRAINT fk_sku_cann_cat FOREIGN KEY (category_id)
      REFERENCES dim_category (category_id) ON DELETE RESTRICT,

  -- Stores each pair once. Without this, (5,9) and (9,5) both exist and counts double.
  CONSTRAINT ck_sku_cann_order CHECK (sku_id_a < sku_id_b),
  CONSTRAINT ck_sku_cann_corr  CHECK (correlation BETWEEN -1 AND 1)
);

COMMENT ON TABLE sku_cannibalization IS
  'Within-category pairs: 351+276+190+153+153+15+15 = 1,153 rows.';


-- ── portfolio_metrics ───────────────────────────────────────────────────────
CREATE TABLE portfolio_metrics (
  snapshot_date              DATE          NOT NULL,
  total_net_sales            NUMERIC(14,2) NOT NULL,   -- target 473,000,000
  avg_gross_margin_pct       NUMERIC(6,4)  NOT NULL,   -- target 0.3853
  yoy_growth                 NUMERIC(6,4)  NOT NULL,   -- target 0.0830
  active_sku_count           SMALLINT      NOT NULL,   -- 119
  supplier_count             SMALLINT      NOT NULL,   -- 60
  top10pct_revenue_share     NUMERIC(6,4)  NOT NULL,   -- target 0.2781
  top20pct_revenue_share     NUMERIC(6,4)  NOT NULL,   -- target 0.4851
  top30pct_revenue_share     NUMERIC(6,4)  NOT NULL,   -- target 0.6288
  long_tail_pct              NUMERIC(6,4)  NOT NULL,   -- target 0.6670
  total_stockouts            INTEGER       NOT NULL,   -- target 33,114

  -- PCI and its six sub-drivers
  portfolio_complexity_index NUMERIC(6,4)  NOT NULL,   -- target 0.5509, benchmark 0.4200
  supplier_fragmentation     NUMERIC(6,4)  NOT NULL,   -- 1.2000 vs 1.0000
  sku_proliferation          NUMERIC(6,4)  NOT NULL,   -- 1.0200 vs 0.8500
  low_velocity_pct           NUMERIC(6,4)  NOT NULL,   -- 0.6667 vs 0.4000
  lead_time_instability      NUMERIC(6,4)  NOT NULL,   -- 0.2014 vs 0.1500
  promo_dependency_score     NUMERIC(6,4)  NOT NULL,   -- 0.1100 vs 0.0800
  avg_volatility_cv          NUMERIC(6,4)  NOT NULL,   -- 0.1071 vs 0.0800

  CONSTRAINT pk_portfolio_metrics PRIMARY KEY (snapshot_date)
);


-- ── rationalization_scenario ────────────────────────────────────────────────
CREATE TABLE rationalization_scenario (
  scenario_id            SMALLINT     NOT NULL,
  scenario_label         TEXT         NOT NULL,
  skus_removed           SMALLINT     NOT NULL,
  revenue_impact_pct     NUMERIC(6,4) NOT NULL,
  margin_impact_pct      NUMERIC(6,4) NOT NULL,
  safety_stock_freed_pct NUMERIC(6,4) NOT NULL,
  supplier_reduction_pct NUMERIC(6,4) NOT NULL,

  CONSTRAINT pk_rationalization_scenario PRIMARY KEY (scenario_id),
  CONSTRAINT uq_rationalization_label    UNIQUE (scenario_label)
);

COMMENT ON COLUMN rationalization_scenario.supplier_reduction_pct IS
  'Zero - universal supplier overlap prevents any reduction.';


-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX ix_fact_sales_sku_date ON fact_sales (sku_id, date_key);
CREATE INDEX ix_fact_sales_date     ON fact_sales (date_key);
CREATE INDEX ix_fact_sales_country  ON fact_sales (country_id);
CREATE INDEX ix_fact_sales_channel  ON fact_sales (channel_id);

-- Partial: ~9% of rows carry a stockout, so these are a fraction of full-index size.
CREATE INDEX ix_fact_sales_promo    ON fact_sales (sku_id) WHERE promo_flag > 0;
CREATE INDEX ix_fact_sales_stockout ON fact_sales (sku_id) WHERE stock_out_flag = 1;

CREATE INDEX ix_sku_metrics_segment  ON sku_metrics (portfolio_segment);
CREATE INDEX ix_sku_metrics_revshare ON sku_metrics (revenue_share_pct DESC);

CREATE INDEX ix_sku_cann_b ON sku_cannibalization (sku_id_b);

CREATE INDEX ix_dim_sku_category ON dim_sku (category_id);
CREATE INDEX ix_dim_sku_brand    ON dim_sku (brand_id);


-- ════════════════════════════════════════════════════════════════════════════
-- VIEWS
-- ════════════════════════════════════════════════════════════════════════════

-- The rollup the dashboard reads. 119 SKUs x 24 months = 2,856 rows.
CREATE MATERIALIZED VIEW agg_sku_monthly AS
SELECT
  f.sku_id,
  d.year,
  d.month,
  SUM(f.units_sold)     AS units_sold,
  SUM(f.net_sales)      AS net_sales,
  SUM(f.gross_margin)   AS gross_margin,
  AVG(f.promo_flag)     AS promo_flag_avg,
  SUM(f.stock_out_flag) AS stockouts,
  COUNT(*)              AS transaction_count
FROM fact_sales f
JOIN dim_date d ON d.date_key = f.date_key
GROUP BY f.sku_id, d.year, d.month;

-- Required for REFRESH MATERIALIZED VIEW CONCURRENTLY.
CREATE UNIQUE INDEX uq_agg_sku_monthly ON agg_sku_monthly (sku_id, year, month);


-- Covers suppliers_per_category and margin_per_supplier (Group 10 aggregations).
CREATE VIEW v_supplier_category AS
SELECT
  c.category_id,
  c.category_name,
  COUNT(DISTINCT ss.supplier_id)                AS suppliers_per_category,
  SUM(m.total_gross_margin)
    / NULLIF(COUNT(DISTINCT ss.supplier_id), 0) AS margin_per_supplier
FROM dim_category c
JOIN dim_sku      s  ON s.category_id = c.category_id
JOIN sku_supplier ss ON ss.sku_id     = s.sku_id
JOIN sku_metrics  m  ON m.sku_id      = s.sku_id
GROUP BY c.category_id, c.category_name;


COMMIT;

\echo ''
\echo 'Schema created: 13 tables, 1 materialized view, 1 view.'
\echo 'Next: 02_seed_dimensions.sql'
