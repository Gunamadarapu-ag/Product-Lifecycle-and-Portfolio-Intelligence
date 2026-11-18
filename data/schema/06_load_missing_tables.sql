BEGIN;

-- 1. Cost assumptions
\copy dim_cost_assumption (assumption_key, cost_type, driver, rate, unit, basis, basis_note) FROM 'data/output/dim_cost_assumption.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 2. Price history
\copy fact_price (sku_id, country_id, effective_from, effective_to, list_price, change_pct) FROM 'data/output/fact_price.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 3. Listing history
\copy fact_listing (sku_id, country_id, channel_id, listed_from, listed_to) FROM 'data/output/fact_listing.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 4. Monthly plans
\copy fact_plan (month_start, country_id, category_id, revenue_target_usd, gross_margin_pct_target, basis) FROM 'data/output/fact_plan.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 5. Weekly inventory
\copy fact_inventory (week_start, sku_id, country_id, opening_units, receipts_units, expedited_units, sold_units, closing_units, on_order_units, safety_stock_units) FROM 'data/output/fact_inventory.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 6. Launch pipeline
\copy dim_launch (launch_id, sku_id, product_name, category_id, brand_id, planned_launch_date, actual_launch_date, stage, budget_usd, spent_usd, owner_role, lead_region, expected_year1_revenue_usd) FROM 'data/output/dim_launch.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 7. Launch gates
\copy launch_gate (launch_id, gate_no, gate_name, weight, reviewer_role, due_date, completed_date, status) FROM 'data/output/launch_gate.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 8. Supplier notices
\copy supplier_notice (notice_id, supplier_id, sku_id, notice_date, eol_effective_date, notice_type) FROM 'data/output/supplier_notice.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 9. Operating expenses (amount_usd is generated automatically)
\copy fact_opex (month_start, country_id, category_id, assumption_key, driver_value, rate, basis) FROM 'data/output/fact_opex.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 10. SKU fixed costs
\copy sku_fixed_cost (sku_id, year, markets_listed, amount_usd, assumption_key, basis) FROM 'data/output/sku_fixed_cost.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

COMMIT;