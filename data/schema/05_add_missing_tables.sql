BEGIN;

-- 1. Price history
CREATE TABLE IF NOT EXISTS fact_price (
    sku_id         INTEGER       NOT NULL,
    country_id     SMALLINT      NOT NULL,
    effective_from DATE          NOT NULL,
    effective_to   DATE          NULL,
    list_price     NUMERIC(10,2) NOT NULL,
    change_pct     NUMERIC(6,4)  NOT NULL,
    CONSTRAINT pk_fact_price PRIMARY KEY (sku_id, country_id, effective_from),
    CONSTRAINT fk_fact_price_sku FOREIGN KEY (sku_id) REFERENCES dim_sku (sku_id),
    CONSTRAINT fk_fact_price_country FOREIGN KEY (country_id) REFERENCES dim_country (country_id),
    CONSTRAINT ck_fact_price_positive CHECK (list_price > 0),
    CONSTRAINT ck_fact_price_spell CHECK (effective_to IS NULL OR effective_to > effective_from)
);

COMMENT ON TABLE fact_price IS
'List price before promotion. fact_sales.net_sales / units_sold is the promoted price actually paid; the difference is promotional discount.';

-- 2. Listing history
CREATE TABLE IF NOT EXISTS fact_listing (
    sku_id      INTEGER  NOT NULL,
    country_id  SMALLINT NOT NULL,
    channel_id  SMALLINT NOT NULL,
    listed_from DATE     NOT NULL,
    listed_to   DATE     NULL,
    CONSTRAINT pk_fact_listing PRIMARY KEY (sku_id, country_id, channel_id, listed_from),
    CONSTRAINT fk_fl_sku FOREIGN KEY (sku_id) REFERENCES dim_sku (sku_id),
    CONSTRAINT fk_fl_country FOREIGN KEY (country_id) REFERENCES dim_country (country_id),
    CONSTRAINT fk_fl_channel FOREIGN KEY (channel_id) REFERENCES dim_channel (channel_id),
    CONSTRAINT ck_fl_span CHECK (listed_to IS NULL OR listed_to > listed_from)
);

-- 3. Monthly plan
CREATE TABLE IF NOT EXISTS fact_plan (
    month_start             DATE          NOT NULL,
    country_id              SMALLINT      NOT NULL,
    category_id             SMALLINT      NOT NULL,
    revenue_target_usd      NUMERIC(14,2) NOT NULL,
    gross_margin_pct_target NUMERIC(6,4)  NOT NULL,
    basis                   TEXT          NOT NULL,
    CONSTRAINT pk_fact_plan PRIMARY KEY (month_start, country_id, category_id),
    CONSTRAINT fk_fp_country FOREIGN KEY (country_id) REFERENCES dim_country (country_id),
    CONSTRAINT fk_fp_category FOREIGN KEY (category_id) REFERENCES dim_category (category_id),
    CONSTRAINT ck_fp_month CHECK (extract(day FROM month_start) = 1)
);

COMMENT ON TABLE fact_plan IS
'Generated targets, back-derived from actuals with a planning error (see basis).';

-- 4. Weekly inventory
CREATE TABLE IF NOT EXISTS fact_inventory (
    week_start         DATE     NOT NULL,
    sku_id             INTEGER  NOT NULL,
    country_id         SMALLINT NOT NULL,
    opening_units      INTEGER  NOT NULL,
    receipts_units     INTEGER  NOT NULL,
    expedited_units    INTEGER  NOT NULL,
    sold_units         INTEGER  NOT NULL,
    closing_units      INTEGER  NOT NULL,
    on_order_units     INTEGER  NOT NULL,
    safety_stock_units INTEGER  NOT NULL,
    CONSTRAINT pk_fact_inventory PRIMARY KEY (week_start, sku_id, country_id),
    CONSTRAINT fk_fi_sku FOREIGN KEY (sku_id) REFERENCES dim_sku (sku_id),
    CONSTRAINT fk_fi_country FOREIGN KEY (country_id) REFERENCES dim_country (country_id),
    CONSTRAINT ck_fi_monday CHECK (extract(isodow FROM week_start) = 1),
    CONSTRAINT ck_fi_nonneg CHECK (
        opening_units >= 0 AND receipts_units >= 0 AND expedited_units >= 0
        AND sold_units >= 0 AND closing_units >= 0 AND on_order_units >= 0
    ),
    CONSTRAINT ck_fi_flow CHECK (
        closing_units = opening_units + receipts_units + expedited_units - sold_units
    )
);

COMMENT ON TABLE fact_inventory IS
'Distribution-centre stock. fact_sales.stock_out_flag is a store-shelf event: the two are correlated, not identical.';

-- 5. Launch pipeline
CREATE TABLE IF NOT EXISTS dim_launch (
    launch_id                   TEXT          NOT NULL,
    sku_id                      INTEGER       NULL,
    product_name                TEXT          NOT NULL,
    category_id                 SMALLINT      NOT NULL,
    brand_id                    SMALLINT      NOT NULL,
    planned_launch_date         DATE          NOT NULL,
    actual_launch_date          DATE          NULL,
    stage                       TEXT          NOT NULL,
    budget_usd                  NUMERIC(14,2) NOT NULL,
    spent_usd                   NUMERIC(14,2) NOT NULL,
    owner_role                  TEXT          NOT NULL,
    lead_region                 TEXT          NOT NULL,
    expected_year1_revenue_usd  NUMERIC(14,2) NOT NULL,
    CONSTRAINT pk_dim_launch PRIMARY KEY (launch_id),
    CONSTRAINT fk_dl_sku FOREIGN KEY (sku_id) REFERENCES dim_sku (sku_id),
    CONSTRAINT fk_dl_category FOREIGN KEY (category_id) REFERENCES dim_category (category_id),
    CONSTRAINT fk_dl_brand FOREIGN KEY (brand_id) REFERENCES dim_brand (brand_id),
    CONSTRAINT ck_dl_launched CHECK ((sku_id IS NULL) = (actual_launch_date IS NULL))
);

-- 6. Launch gates
CREATE TABLE IF NOT EXISTS launch_gate (
    launch_id      TEXT         NOT NULL,
    gate_no        SMALLINT     NOT NULL,
    gate_name      TEXT         NOT NULL,
    weight         NUMERIC(4,3) NOT NULL,
    reviewer_role  TEXT         NOT NULL,
    due_date       DATE         NOT NULL,
    completed_date DATE         NULL,
    status         TEXT         NOT NULL,
    CONSTRAINT pk_launch_gate PRIMARY KEY (launch_id, gate_no),
    CONSTRAINT fk_lg_launch FOREIGN KEY (launch_id) REFERENCES dim_launch (launch_id),
    CONSTRAINT ck_lg_status CHECK (status IN ('Completed', 'Overdue', 'Scheduled')),
    CONSTRAINT ck_lg_done CHECK ((status = 'Completed') = (completed_date IS NOT NULL))
);

COMMENT ON TABLE launch_gate IS
'Status as of 2025-12-31. Readiness is computed as the sum of weights of completed gates.';

-- 7. Supplier end-of-life notices
CREATE TABLE IF NOT EXISTS supplier_notice (
    notice_id          SMALLINT NOT NULL,
    supplier_id        TEXT     NOT NULL,
    sku_id             INTEGER  NOT NULL,
    notice_date        DATE     NOT NULL,
    eol_effective_date DATE     NOT NULL,
    notice_type        TEXT     NOT NULL,
    CONSTRAINT pk_supplier_notice PRIMARY KEY (notice_id),
    CONSTRAINT fk_sn_supplier FOREIGN KEY (supplier_id) REFERENCES dim_supplier (supplier_id),
    CONSTRAINT fk_sn_sku FOREIGN KEY (sku_id) REFERENCES dim_sku (sku_id),
    CONSTRAINT ck_sn_dates CHECK (eol_effective_date > notice_date)
);

-- 8. Cost assumptions
CREATE TABLE IF NOT EXISTS dim_cost_assumption (
    assumption_key TEXT          NOT NULL,
    cost_type      TEXT          NOT NULL,
    driver         TEXT          NOT NULL,
    rate           NUMERIC(14,6) NOT NULL,
    unit           TEXT          NOT NULL,
    basis          TEXT          NOT NULL,
    basis_note     TEXT          NOT NULL,
    CONSTRAINT pk_dim_cost_assumption PRIMARY KEY (assumption_key),
    CONSTRAINT ck_dca_basis CHECK (basis = 'assumption')
);

COMMENT ON TABLE dim_cost_assumption IS
'Every cost below gross profit is an assumption, not a measurement.';

-- 9. Operating expenses; amount_usd is database-generated
CREATE TABLE IF NOT EXISTS fact_opex (
    month_start    DATE          NOT NULL,
    country_id     SMALLINT      NOT NULL,
    category_id    SMALLINT      NOT NULL,
    assumption_key TEXT          NOT NULL,
    driver_value   NUMERIC(16,6) NOT NULL,
    rate           NUMERIC(14,6) NOT NULL,
    amount_usd     NUMERIC(16,2)
        GENERATED ALWAYS AS (round(driver_value * rate, 2)) STORED,
    basis          TEXT          NOT NULL,
    CONSTRAINT pk_fact_opex PRIMARY KEY (month_start, country_id, category_id, assumption_key),
    CONSTRAINT fk_fo_country FOREIGN KEY (country_id) REFERENCES dim_country (country_id),
    CONSTRAINT fk_fo_category FOREIGN KEY (category_id) REFERENCES dim_category (category_id),
    CONSTRAINT fk_fo_assumption FOREIGN KEY (assumption_key) REFERENCES dim_cost_assumption (assumption_key),
    CONSTRAINT ck_fo_basis CHECK (basis = 'assumption')
);

-- 10. SKU fixed costs
CREATE TABLE IF NOT EXISTS sku_fixed_cost (
    sku_id         INTEGER       NOT NULL,
    year           SMALLINT      NOT NULL,
    markets_listed SMALLINT      NOT NULL,
    amount_usd     NUMERIC(12,2) NOT NULL,
    assumption_key TEXT          NOT NULL,
    basis          TEXT          NOT NULL,
    CONSTRAINT pk_sku_fixed_cost PRIMARY KEY (sku_id, year),
    CONSTRAINT fk_sfc_sku FOREIGN KEY (sku_id) REFERENCES dim_sku (sku_id),
    CONSTRAINT fk_sfc_assumption FOREIGN KEY (assumption_key) REFERENCES dim_cost_assumption (assumption_key),
    CONSTRAINT ck_sfc_basis CHECK (basis = 'assumption')
);

COMMIT;