# Dataset Generation & Database Setup Plan

**Status:** Planning — no data generated yet
**Date:** 7 September 2026
**Goal:** Produce a synthetic but internally-consistent FMCG transaction dataset, load it into a database, and move the dashboard off hardcoded constants.

---

## 0. Why this document exists

The dashboard currently computes nothing from data. Every figure it displays is a
hardcoded literal in TypeScript. Before generating a dataset we need to know three
things precisely:

1. **What we already hold** — because the generated data has to agree with it, or the
   dashboard will contradict its own audit trails.
2. **What is missing** — the source CSV, the database layer, and several columns the UI
   needs that no source defines.
3. **What rules the generator must follow** — distributions, formulas, and the specific
   figures the output must reconcile to.

This document covers all three, then specifies the database schema and load procedure.

---

# Part 1 — What we currently hold

## 1.1 A documented 38-column schema

`docs/FMCG Multi-Country Sales Dataset — Column Reference.docx` (extracted text at
`docs/internal_processing/column_reference_text.txt`) fully specifies the source schema
in 10 groups. This is the most valuable asset we have — a complete spec with formulas,
and what the generator should target.

| Group | Columns | Classification |
| --- | --- | --- |
| 1. Identity & Keys | `sku_id`, `sku_name`, `supplier_id` | DIRECT |
| 2. Time | `date`, `year`, `month`, `week`, `quarter` | DIRECT + DERIVED |
| 3. Product | `category`, brand/type split | DIRECT + DERIVED |
| 4. Geography & Channel | `country`, `channel` | DIRECT |
| 5. Commercial | `net_sales`, `units_sold`, `purchase_cost`, `gross_margin`, `gross_margin_pct`, `revenue_growth` | DIRECT + DERIVED |
| 6. Supply Chain | `lead_time_days`, `stock_out_flag`, `safety_stock_proxy`, `ss_to_revenue_ratio`, `demand_std` | DIRECT + ESTIMATED |
| 7. Promotions | `promo_flag`, `promo_dependency`, `margin_erosion` | DIRECT + DERIVED |
| 8. Volatility | `cv_score`, `volatility_class`, `seasonality_index` | DERIVED |
| 9. Composite Scores | `commercial_value_score`, `operational_complexity_score`, `portfolio_segment`, `op_burden_ratio`, `portfolio_complexity_index`, `cannibalization_risk_score` | DERIVED + ESTIMATED |
| 10. Aggregations | `revenue_share_pct`, `low_velocity_flag`, `margin_per_supplier`, `suppliers_per_category`, `safety_stock_reduction_pct`, `inventory_carrying_cost_proxy` | DERIVED + ESTIMATED |

**Only 14 columns are truly raw.** Everything else is computed. The generator therefore
only needs to invent the raw layer convincingly; the rest follows from formulas.

## 1.2 A curated SKU master — 119 rows

`src/constants/data.ts` → `SKUS` holds **119 SKU rows**. (An earlier count of 120
included a comment line.) No duplicate names. Each row carries 11 attributes:

```ts
{ name, cat, rev, val, cx, stockouts, promo, margin, growth, lead, householdPenetration }
```

Category distribution:

| Category | SKUs |
| --- | ---: |
| Beverages | 27 |
| Snacks | 24 |
| Personal Care | 20 |
| Dairy | 18 |
| Household | 18 |
| Beauty | 6 |
| Fashion | 6 |
| **Total** | **119** |

Observed ranges in this master:

| Attribute | Range | Mean |
| --- | --- | --- |
| `margin` | 15% – 58% | 37.9% |
| `lead` | 6 – 35 days | 13.9 |

**This is the seed list.** The generator should not invent SKU names — it should use
these 119 and attach transaction history to them.

## 1.3 Dimensional anchors

**7 countries** (`REGIONAL_DATA`) — these already reconcile: the country net-sales
figures sum to **$472.9M**, matching the `$473M` headline.

| Country | SKUs listed | Net Sales ($M) | Margin % | Complexity |
| --- | ---: | ---: | ---: | --- |
| Italy | 100 | 137.2 | 38.53 | High |
| Spain | 100 | 106.7 | 38.60 | High |
| Germany | 98 | 88.5 | 38.48 | High |
| Austria | 80 | 43.0 | 38.64 | Medium |
| France | 80 | 42.6 | 38.55 | Medium |
| Poland | 80 | 42.4 | 38.36 | Medium |
| Netherlands | 45 | 12.5 | 38.20 | Opt |

**4 channels** (`CHANNEL_DATA`) — total stockout events **33,114**:

| Channel | Margin % | Volatility CV | Stockouts |
| --- | ---: | ---: | ---: |
| E-commerce | 38.56 | 0.061 | 7,907 |
| Supermarket | 38.53 | 0.065 | 7,818 |
| Hypermarket | 38.52 | 0.063 | 15,907 |
| Convenience | 38.20 | 0.069 | 1,482 |

**60 suppliers** (`S001`–`S060`). Per the source doc, *all 60 suppliers cover all SKUs* —
there is no supplier specialisation, and that absence is itself a documented finding
driving the Supplier Fragmentation Index.

## 1.4 Target figures the generated data must reproduce

These are currently hardcoded display strings. They are the reconciliation targets.

| Metric | Target | Source |
| --- | --- | --- |
| Total net sales | **$473M** | `KPIS` |
| YoY growth | **+8.3%** | `KPIS` |
| Avg gross margin | **38.53%** | `KPIS` |
| Revenue concentration, top 10% | **27.81%** | `KPIS` |
| Revenue concentration, top 20% | **48.51%** | Column ref |
| Revenue concentration, top 30% | **62.88%** | `KPIS` |
| Long-tail burden | **66.7%** (68 SKUs < 1% rev) | `KPIS` |
| Portfolio PCI | **0.5509** (target ≤ 0.42) | `KPIS` |
| Peak stockout frequency | **440 events** (two SKUs tied) | `KPIS` |
| Total stockout events | **33,114** | `CHANNEL_DATA` |
| Rationalize candidates | **35 SKUs** | `KPIS` |
| Revenue tail risk | **27.08%** | `KPIS` |
| Safety stock freed (full rationalization) | **42.2%** ($246M → $142M) | `KPIS` |

**PCI sub-drivers** (`PCI_DRIVERS`) — PCI is the mean of these six normalised indices:

| Sub-driver | Value | Benchmark |
| --- | ---: | ---: |
| Supplier Fragmentation Index | 1.2000 | 1.0000 |
| SKU Proliferation Index | 1.0200 | 0.8500 |
| Low Velocity SKU % | 0.6667 | 0.4000 |
| Lead Time Instability (CV) | 0.2014 | 0.1500 |
| Promo Dependency Score | 0.1100 | 0.0800 |
| Avg Portfolio Volatility CV | 0.1071 | 0.0800 |

**Safety-stock reduction curve** (rationalization simulator):

| Cohort removed | Safety stock reduction |
| --- | ---: |
| Bottom 10% | 8.8% |
| Bottom 20% | 22.3% |
| Bottom 30% | 29.6% |
| All 35 Rationalize SKUs | 42.2% |

## 1.5 Formulas already specified

The column reference gives us every formula. No invention required:

```
gross_margin            = net_sales − (units_sold × purchase_cost)
gross_margin_pct        = gross_margin / net_sales
revenue_growth          = (rev_Y2 − rev_Y1) / rev_Y1
demand_std              = std(monthly units_sold per SKU)
cv_score                = std(monthly units) / mean(monthly units)
seasonality_index       = std(avg monthly units across months)
safety_stock_proxy      = lead_time_days × demand_std
ss_to_revenue_ratio     = safety_stock_proxy / net_sales
op_burden_ratio         = operational_complexity_score / commercial_value_score
revenue_share_pct       = sku net_sales / total net_sales
low_velocity_flag       = 1 if revenue_share_pct < 1%
inventory_carrying_cost = 0.20 × safety_stock_proxy

commercial_value_score       = mean of normalised(revenue, gross_margin,
                                    revenue_growth, demand_stability = 1 − CV)
operational_complexity_score = mean of normalised(lead_time, supplier_dependency,
                                    promo_dependency, stock_out_flag, volatility_class)
```

Classification thresholds:

- `volatility_class`: Stable `CV < 0.2` · Variable `0.2–0.5` · Unstable `> 0.5`
- Volatility numeric mapping for the complexity score: `0.3 / 0.6 / 1.0`
- `portfolio_segment`: median split on both axes → Keep / Grow / Consolidate / Rationalize

---

# Part 2 — What is missing

## 2.1 The source data itself

`fmcg_sales_dataset_1.csv` is referenced by name in the column reference — *"loaded in the
Colab notebook you shared"* — but **is not in this repository**. There is no CSV, XLSX,
parquet, or database file anywhere in the tree. Every figure in the UI was computed once
in Colab and typed in by hand.

This is the root dependency. Without it, nothing in the dashboard can be re-derived.

## 2.2 No database layer, at all

| Component | Status |
| --- | --- |
| DB driver in `package.json` | None (`pg`, `mysql`, `sqlite`, `duckdb` — all absent) |
| ORM / query builder | None (`prisma`, `drizzle`, `knex`, `typeorm` — all absent) |
| Migration files | None |
| `docker-compose.yml` | None |
| `.sql` schema files | None |
| API layer | `server.ts` exists but is orphaned — no npm script starts it, nothing calls it |

## 2.3 Columns the UI needs that no source defines

| Field | Used by | Problem |
| --- | --- | --- |
| `householdPenetration` | `SKUS`, IPPV league table | Present on all 119 rows, absent from the 38-column spec. Documented in-code as a "Nielsen-style panel proxy" — i.e. invented |
| `brand` | 95 `BrandX` strings across components | No brand column exists. The spec assumes `sku_name` parses as `Brand + Type`, but 91 of the 119 names are descriptive (`Mango Fizz 500ml`) and not parseable |
| PC-to-MRP inputs | Blueprint's headline Profitability KPI | Needs prime cost and MRP; we have `purchase_cost` but no retail price ceiling |
| `cannibalization_risk_score` pairs | Cannibalization analyst view | Spec defines a per-SKU score, but the UI shows *pairwise* correlations (e.g. Mango Fizz at −0.62) |

## 2.4 An entire second dataset, for competitor intelligence

The blueprint's §5 playbook specifies three derived metrics:

```
Price Index               = ((Competitor Price − Our Price) / Competitor Price) × 100
Est. Monthly Sales Growth = 0.5×ReviewVelocity + 0.3×SearchInterest + 0.2×RankImprovement
Est. Market Share         = 0.4×ReviewShare + 0.35×SearchShare + 0.25×ListingCoverageShare
```

These need **review counts, Google Trends indices, bestseller ranks, and distribution
coverage** — scraped external signals. **None of these have a column in the FMCG schema.**
This is a separate source with its own grain and refresh cadence, not a derivation.

*Recommendation: out of scope for phase 1. Generate the FMCG dataset first.*

## 2.5 Conflicts that had to be resolved before generating

The existing figures disagree with each other. These are not cosmetic — each changes the
data we produce.

| # | Conflict | Evidence |
| --- | --- | --- |
| 1 | **Portfolio size stated four ways** | `COMPANY_CONTEXT` = 100 · "top 10% = 10 items" implies 100 · "68 SKUs = 66.7%" implies 102 · segment counts 35+16+16+35 = 102 · volatility 80+22 = 102 · README = 102 · **actual array = 119** |
| 2 | **Category count: 5 or 7** | Spec and `COMPANY_CONTEXT` say 5 (Beverages, Dairy, Home Care, Personal Care, Snacks). Code has 7 — adds Beauty (6) and Fashion (6), renames Home Care → Household |
| 3 | **Two SKU naming universes** | `SKUS` array is mostly descriptive with 28 `BrandX` exceptions; the rest of the app uses 95 distinct `BrandX Product` names |
| 4 | **Lead time scale** | Spec says longest ≈ **6.54 days**; code array spans **6–35 days**, mean 13.9 |
| 5 | **Transaction grain** | Never specified anywhere |
| 6 | **Segment distribution is not an even split** | 35/16/16/35 = 34%/16%/16%/34%. A pure median split on independent axes would give ~25% each. Value and complexity must be **negatively correlated** |

---

# Part 3 — Rules for creating the data

## 3.1 Decisions taken

| # | Decision | Rationale |
| --- | --- | --- |
| 1 | **119 SKUs** — the existing array is canonical | It is what the code actually uses. Derived KPIs get **recomputed** from data rather than preserved, which is the point of the exercise |
| 2 | **7 categories**, keeping Beauty and Fashion | The UI already filters on all 7. Data is synthetic; extending the spec is legitimate. Record `Home Care → Household` as a rename |
| 3 | **Descriptive names canonical + explicit `brand` column** | The 119 names stay; a separate `brand` field (BrandA–BrandF) supports brand aggregation without relying on unparseable names |
| 4 | **Daily grain, sparse** (~368k rows) | Full daily is 2.45M rows; monthly is 80k but too coarse for CV, seasonality and volatility. Sparse daily is realistic and manageable |
| 5 | **PostgreSQL 17**, the instance already installed locally | No Docker needed — `postgresql-x64-17` is installed and running. **It listens on port 5433, not 5432** |
| 6 | **Lead times: use the code range (6–35 days)** | More realistic for multi-country FMCG than the spec's ≈6.5-day ceiling |
| 7 | **Seeded generator** | Figures must be stable across regenerations, or every run churns the UI constants |
| 8 | **All amounts in USD** | Single reporting currency across all 7 European markets. Source transactions are treated as already USD-converted — **no FX table, no currency column, no conversion step** |

## 3.2 Generation order

Each layer depends only on the ones above it.

```
1. Dimensions      countries, channels, categories, suppliers, calendar
2. SKU master      119 SKUs + brand, supplier links, base economics
3. Demand model    per-SKU baseline, seasonality, volatility profiles
4. Transactions    daily sparse fact rows
5. Derived         gross margin, growth, promo dependency, CV, seasonality
6. Composites      value/complexity scores, segments, PCI, cannibalization
7. Calibrate       scale to hit reconciliation targets; repeat 4–6
8. Validate        run the assertion suite
```

## 3.3 Layer 1 — Dimensions

**Calendar:** `2024-01-01` → `2025-12-31`, **731 days** (2024 is a leap year). Two complete years makes
`revenue_growth` (2024 → 2025) computable, and leaves 2026 as the dashboard's "current"
year, matching the app's existing date context.

**Countries:** the 7 above. Allocate revenue by the documented shares:

| Country | Share of $473M |
| --- | ---: |
| Italy | 29.0% |
| Spain | 22.6% |
| Germany | 18.7% |
| Austria | 9.1% |
| France | 9.0% |
| Poland | 9.0% |
| Netherlands | 2.6% |

**SKU listing per country** — not every SKU sells everywhere. Use the documented counts,
scaled from 102 to 119:

| Country | Listed SKUs |
| --- | ---: |
| Italy, Spain | 119 (all) |
| Germany | 114 |
| France, Austria, Poland | 93 |
| Netherlands | 52 |

Netherlands lists only the highest-revenue SKUs — this is what produces its documented
lowest-margin position.

**Channels:** 4, with revenue split roughly Hypermarket 35% / Supermarket 30% /
E-commerce 25% / Convenience 10%. Stockouts must concentrate in Hypermarket (48% of all
events, per `CHANNEL_DATA`).

**Suppliers:** `S001`–`S060`. Per the spec, **all suppliers serve all SKUs** — assign a
primary supplier per SKU for `supplier_id`, but the fragmentation index derives from the
all-to-all coverage.

## 3.4 Layer 2 — SKU master

For each of the 119 SKUs, carry forward `name`, `category` and the seed attributes, then
assign:

| Field | Rule |
| --- | --- |
| `sku_id` | Sequential 1–119 |
| `brand` | BrandA–BrandF. Assign so each brand spans multiple categories (matches the 95 observed `BrandX Product` combinations) |
| `supplier_id` | Random from S001–S060, seeded |
| `base_price` | Derived from seed `rev` and target unit volume |
| `purchase_cost` | `base_price × (1 − target_margin)`. Held **constant across the period** — an explicit documented assumption |
| `target_margin` | From the seed `margin` field (15%–58%) |
| `lead_time_days` | From seed `lead` (6–35), with small per-transaction jitter |
| `promo_propensity` | From seed `promo` (0–1); drives promo frequency |
| `revenue_rank` | Assigned to fit the Pareto curve — see below |

**Pareto shape.** Revenue share must follow the documented concentration curve. With 119
SKUs the *percentiles* stay fixed but the *SKU counts* change:

| Percentile | Cumulative revenue share | SKUs (was 102) | SKUs (now 119) |
| --- | ---: | ---: | ---: |
| Top 10% | 27.81% | 10 | 12 |
| Top 20% | 48.51% | 20 | 24 |
| Top 30% | 62.88% | 31 | 36 |

Fit a power law to these three points and assign each SKU a revenue weight from it.

**Long tail.** 66.7% of SKUs must fall below 1% revenue share each — with 119 SKUs that
is **79 SKUs**, not the documented 68. This figure gets recomputed and the UI constant
updated.

## 3.5 Layer 3 — Demand model

Per SKU, per country, per channel, per day:

```
units_sold = base_daily_demand
           × seasonality_factor(month, sku_seasonality_profile)
           × promo_lift(promo_flag)
           × channel_factor
           × country_factor
           × noise(1, sku_volatility)
```

**Seasonality.** Assign each SKU a profile. Chocolate/confectionery variants must be the
most seasonal — the spec names two chocolate SKUs as the leaders (0.239, 0.238), and
chocolate variants dominate the top-10 CV list at `CV > 0.23`.

| Profile | Applies to | Amplitude |
| --- | --- | --- |
| Winter-peaking | Chocolate, hot beverages | ±25% |
| Summer-peaking | Soda, water, ice cream | ±30% |
| Flat | Household, personal care staples | ±8% |
| Q4-peaking | Beauty, gifting | ±20% |

**Volatility.** Target the documented split — **Stable ~78%, Variable ~22%, Unstable 0%**
(no SKU in the source exceeded CV 0.5). Draw per-SKU noise sigma so the resulting
`cv_score` lands in the right band.

**Promotions.** `promo_flag` is not binary in the source — it appears as a mean,
suggesting intensity levels. Encode as `0`, `0.2`, `0.5`, `1.0`. Promo periods apply a
discount (10–30%) and a volume lift (1.3×–2.5×). Calibrate so:

- Portfolio promo dependency lands at **11%** (the PCI sub-driver value)
- The most promo-dependent SKU reaches **≈27.97%** of revenue under promo
- The top 10 dependent SKUs cluster in **27.6%–28.0%**

**Stockouts.** `stock_out_flag` per transaction row. Probability rises with lead time and
demand volatility. Calibrate so:

- Total events ≈ **33,114**
- Hypermarket holds **15,907** (48%)
- The peak SKU reaches **440** events, with two SKUs tied at the top

## 3.6 Layers 4 & 5 — Derived and composite columns

Apply the formulas in §1.5 verbatim. Two rules deserve emphasis:

**Value and complexity must be negatively correlated.** A median split on independent
axes yields ~25% per quadrant. The documented split is 34/16/16/34 — a heavy
Keep–Rationalize diagonal. Induce this by making complexity partly a function of low
revenue (long-tail SKUs get more suppliers, longer leads, more promo dependency). Target
correlation ≈ **−0.45**.

**PCI must land at 0.5509.** It is the mean of six normalised sub-indices, each with a
documented value and benchmark (§1.4). Compute each from the generated data, then verify
the mean. The two baselines the spec flags as internal assumptions — 100 SKUs and 50
suppliers — must be **restated for 119 SKUs and 60 suppliers**, which will shift the
proliferation and fragmentation indices. Recompute and record the new values.

## 3.7 Calibration loop

The generator will not hit the targets on the first pass. Structure it as:

```
generate → measure → adjust scale factors → regenerate → measure
```

Converge on total net sales `$473M ± 0.5%` by scaling base demand. Margin, concentration
and stockout targets follow from the per-SKU parameters and need their own adjustment
passes.

## 3.8 Validation suite

The generator is not done until every assertion passes. Write these as SQL or test
assertions that run after load.

| # | Assertion | Tolerance |
| --- | --- | --- |
| 1 | `SUM(net_sales)` = $473M | ±0.5% |
| 2 | `SUM(gross_margin) / SUM(net_sales)` = 38.53% | ±0.1pp |
| 3 | Country totals sum to grand total | exact |
| 4 | Country split matches the 7 documented shares | ±1pp each |
| 5 | 2025 vs 2024 growth = +8.3% | ±0.3pp |
| 6 | Top 10/20/30% concentration = 27.81 / 48.51 / 62.88% | ±1pp |
| 7 | `SUM(stock_out_flag)` = 33,114 | ±2% |
| 8 | Hypermarket share of stockouts = 48% | ±2pp |
| 9 | Peak SKU stockouts = 440 | ±10 |
| 10 | Portfolio PCI = 0.5509 | ±0.02 |
| 11 | No SKU above CV 0.5 | exact |
| 12 | Segment split ≈ 34/16/16/34 | ±3pp |
| 13 | `gross_margin = net_sales − units×cost` on every row | exact |
| 14 | No negative `net_sales`, `units_sold`, or `purchase_cost` | exact |
| 15 | Every SKU appears in ≥1 country and ≥1 channel | exact |
| 16 | Max promo dependency ≈ 27.97% | ±0.5pp |

---

# Part 4 — Database setup

## 4.1 Target

**PostgreSQL 17**, using the instance already installed on this machine — no Docker
required. Star schema: dimensions plus one transaction fact table, with a materialised
monthly aggregate the dashboard reads from.

| Setting | Value |
| --- | --- |
| Service | `postgresql-x64-17` (running) |
| Version | 17.10 |
| **Port** | **5433** — not the default 5432 |
| Data directory | `C:\Program Files\PostgreSQL\17\data` |
| Binaries | `C:\Program Files\PostgreSQL\17\bin` (not on PATH) |
| Auth method | `scram-sha-256` for all local and host connections |
| Application role | `ppl_app` (LOGIN only — no SUPERUSER/CREATEDB/CREATEROLE) |
| Database | `ppl_intelligence`, owned by `ppl_app`, UTF8 |

Credentials live in `.env`, which is gitignored (`.gitignore` line 7: `.env*`). All
monetary values are **USD**.

## 4.2 Schema

```sql
-- Dimensions ---------------------------------------------------------------
CREATE TABLE dim_country (
  country_id       SMALLSERIAL PRIMARY KEY,
  country_name     TEXT NOT NULL UNIQUE,
  region           TEXT NOT NULL,
  complexity_label TEXT NOT NULL
);

CREATE TABLE dim_channel (
  channel_id   SMALLSERIAL PRIMARY KEY,
  channel_name TEXT NOT NULL UNIQUE
);

CREATE TABLE dim_supplier (
  supplier_id   TEXT PRIMARY KEY,            -- S001..S060
  supplier_name TEXT NOT NULL
);

CREATE TABLE dim_sku (
  sku_id                INTEGER PRIMARY KEY, -- 1..119
  sku_name              TEXT NOT NULL UNIQUE,
  brand                 TEXT NOT NULL,       -- BrandA..BrandF
  category              TEXT NOT NULL,
  primary_supplier      TEXT NOT NULL REFERENCES dim_supplier(supplier_id),
  base_price            NUMERIC(10,2) NOT NULL,
  purchase_cost         NUMERIC(10,2) NOT NULL,
  lead_time_days        NUMERIC(5,2)  NOT NULL,
  household_penetration NUMERIC(4,3),        -- proxy, no source column
  CHECK (purchase_cost > 0 AND base_price > purchase_cost)
);

CREATE TABLE dim_date (
  date_key    DATE PRIMARY KEY,
  year        SMALLINT NOT NULL,
  quarter     SMALLINT NOT NULL,
  month       SMALLINT NOT NULL,
  week        SMALLINT NOT NULL,
  day_of_week SMALLINT NOT NULL
);

-- Fact ---------------------------------------------------------------------
CREATE TABLE fact_sales (
  sale_id        BIGSERIAL PRIMARY KEY,
  date_key       DATE     NOT NULL REFERENCES dim_date(date_key),
  sku_id         INTEGER  NOT NULL REFERENCES dim_sku(sku_id),
  country_id     SMALLINT NOT NULL REFERENCES dim_country(country_id),
  channel_id     SMALLINT NOT NULL REFERENCES dim_channel(channel_id),
  supplier_id    TEXT     NOT NULL REFERENCES dim_supplier(supplier_id),
  units_sold     INTEGER  NOT NULL CHECK (units_sold >= 0),
  net_sales      NUMERIC(12,2) NOT NULL CHECK (net_sales >= 0),
  purchase_cost  NUMERIC(10,2) NOT NULL,
  gross_margin   NUMERIC(12,2) NOT NULL,
  promo_flag     NUMERIC(3,2)  NOT NULL CHECK (promo_flag BETWEEN 0 AND 1),
  stock_out_flag SMALLINT      NOT NULL CHECK (stock_out_flag IN (0,1)),
  lead_time_days NUMERIC(5,2)  NOT NULL
);

-- Per-SKU scores, recomputed after each load --------------------------------
CREATE TABLE sku_scores (
  sku_id                       INTEGER PRIMARY KEY REFERENCES dim_sku(sku_id),
  total_net_sales              NUMERIC(14,2),
  total_gross_margin           NUMERIC(14,2),
  gross_margin_pct             NUMERIC(6,4),
  revenue_growth               NUMERIC(6,4),
  revenue_share_pct            NUMERIC(6,4),
  low_velocity_flag            SMALLINT,
  demand_std                   NUMERIC(12,4),
  cv_score                     NUMERIC(6,4),
  volatility_class             TEXT,
  seasonality_index            NUMERIC(6,4),
  promo_dependency             NUMERIC(6,4),
  margin_erosion               NUMERIC(10,4),
  safety_stock_proxy           NUMERIC(14,4),
  ss_to_revenue_ratio          NUMERIC(10,8),
  commercial_value_score       NUMERIC(6,4),
  operational_complexity_score NUMERIC(6,4),
  op_burden_ratio              NUMERIC(8,4),
  portfolio_segment            TEXT,
  cannibalization_risk_score   NUMERIC(6,4)
);

-- Enterprise-level scalars, one row per snapshot ----------------------------
CREATE TABLE portfolio_metrics (
  snapshot_date              DATE PRIMARY KEY,
  portfolio_complexity_index NUMERIC(6,4),
  supplier_fragmentation     NUMERIC(6,4),
  sku_proliferation          NUMERIC(6,4),
  low_velocity_pct           NUMERIC(6,4),
  lead_time_instability      NUMERIC(6,4),
  promo_dependency_score     NUMERIC(6,4),
  avg_volatility_cv          NUMERIC(6,4)
);

-- Indexes -------------------------------------------------------------------
CREATE INDEX idx_fact_sku_date ON fact_sales (sku_id, date_key);
CREATE INDEX idx_fact_date     ON fact_sales (date_key);
CREATE INDEX idx_fact_country  ON fact_sales (country_id);
CREATE INDEX idx_fact_channel  ON fact_sales (channel_id);
CREATE INDEX idx_fact_promo    ON fact_sales (promo_flag) WHERE promo_flag > 0;
CREATE INDEX idx_fact_stockout ON fact_sales (sku_id)     WHERE stock_out_flag = 1;

-- Monthly rollup the dashboard actually reads --------------------------------
CREATE MATERIALIZED VIEW agg_sku_monthly AS
SELECT
  s.sku_id, d.year, d.month,
  SUM(s.units_sold)     AS units_sold,
  SUM(s.net_sales)      AS net_sales,
  SUM(s.gross_margin)   AS gross_margin,
  AVG(s.promo_flag)     AS promo_flag_avg,
  SUM(s.stock_out_flag) AS stockouts
FROM fact_sales s
JOIN dim_date d ON d.date_key = s.date_key
GROUP BY s.sku_id, d.year, d.month;

CREATE UNIQUE INDEX ON agg_sku_monthly (sku_id, year, month);
```

## 4.3 Load procedure

`psql` is not on PATH, so invoke it by full path. From the repo root:

```powershell
$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

# 1. Create role + database (as superuser, once)
& $psql -h localhost -p 5433 -U postgres -d postgres `
        -v app_password=<APP_PASSWORD> -f data/schema/00_create_role.sql

# 2. Build the schema (as the app role, from here on)
$env:PGPASSWORD = "<APP_PASSWORD>"
& $psql -h localhost -p 5433 -U ppl_app -d ppl_intelligence -f data/schema/01_schema.sql
```

Then:

1. Role and database created by `00_create_role.sql`
2. Run `01_schema.sql` (DDL above)
3. Seed dimensions from `src/constants/data.ts` (countries, channels) and the generator
   (suppliers, SKUs, calendar)
4. Generate and bulk-load `fact_sales` via `COPY` — not row-by-row inserts, ~368k rows
5. Compute `sku_scores` and `portfolio_metrics` in SQL, not in application code
6. `REFRESH MATERIALIZED VIEW agg_sku_monthly`
7. Run the §3.8 validation suite; fail the build if any assertion breaks

## 4.4 Proposed repository layout

```
data/
  generator/
    config.py          seeds, targets, tolerances
    dimensions.py      countries, channels, suppliers, calendar
    sku_master.py      the 119 SKUs + brand + economics
    demand.py          seasonality, volatility, promo, stockout models
    derive.py          derived columns and composite scores
    calibrate.py       the convergence loop
    validate.py        the 16 assertions
    main.py
  schema/
    01_schema.sql
    02_seed_dimensions.sql
    03_derive_scores.sql
  output/
    fmcg_sales_dataset.csv    (gitignored if large; commit a sample)
docker-compose.yml
```

---

# Part 5 — Execution sequence

| Step | Work | Depends on |
| --- | --- | --- |
| 1 | Stand up Postgres + run DDL | — |
| 2 | Build dimension seeds | 1 |
| 3 | Build SKU master with brand assignment | 2 |
| 4 | Implement demand + promo + stockout models | 3 |
| 5 | Generate transactions, load via `COPY` | 4 |
| 6 | Implement derived and composite score SQL | 5 |
| 7 | Run calibration loop until targets converge | 6 |
| 8 | Run validation suite | 7 |
| 9 | Export canonical CSV, commit a sample | 8 |
| 10 | Replace hardcoded constants in `data.ts` with query results | 9 |
| 11 | Revisit `auditData.ts` — 38 audit entries cite specific figures | 10 |

Steps 1–9 deliver the dataset and database. Steps 10–11 are the dashboard migration and
can follow separately.

---

# Appendix A — Assumptions register

Carried forward from the column reference, plus ones this plan adds. Each should be
surfaced in the UI wherever the dependent metric is displayed.

| # | Assumption | Impact if wrong |
| --- | --- | --- |
| 1 | Purchase cost is constant across the period | All margin figures shift |
| 2 | `safety_stock = lead_time × demand_std` — no real inventory data | The 42.2% capital-release figure is entirely proxy-driven |
| 3 | All composite scores use equal weighting | Segment assignment changes |
| 4 | CV thresholds (0.2 / 0.5) are hardcoded, not benchmarked | SKUs move between volatility classes |
| 5 | Cannibalization proxied by negative correlation, no time lag | False positives from shared seasonality |
| 6 | Rationalization assumes removed revenue is fully lost (no transfer) | Overstates tail risk |
| 7 | PCI baselines restated from 100 SKUs / 50 suppliers to 119 / 60 | Proliferation and fragmentation indices shift |
| 8 | Carrying cost = 20% of safety stock proxy | Directional only |
| 9 | **New:** `householdPenetration` is invented — no source column | IPPV league table is not traceable to source |
| 10 | **New:** brand assignment is synthetic | Brand-level aggregations are illustrative |
| 11 | **New:** lead times use the code range (6–35d), not the spec's ≈6.5d ceiling | Safety stock proxy scales up materially |

---

# Appendix B — Open questions

1. **Should the 2026 launch pipeline be generated too?** `LAUNCH_PRODUCTS` holds 5
   products with gate dates in 2026 — forward-looking, not transactional. Likely a
   separate table.
2. **Do we need supplier-level cost variation?** Currently one `purchase_cost` per SKU.
   Supplier rationalization analysis would benefit from cost varying by supplier.
3. **Competitor dataset — when?** Deferred from phase 1, but the Signals Board and the
   blueprint's §5 both depend on it.
4. ~~**Currency.**~~ **Resolved 7 Sep 2026 — USD only.** All monetary values are reported
   in US dollars across all 7 European markets. Source transactions are treated as
   already USD-converted. No currency column, no FX table, no conversion step. This
   matches the existing `$473M` / `$M` formatting throughout the UI.

---

# Part 6 — Outcome of the first run

*Added 14 September 2026, after `python data/generator/main.py` ran end to end.*

**16 of 16 reconciliation targets pass.** 368,013 rows, 3.4s, seed `20260909`.

## Corrections to this plan

| Item | Planned | Actual |
| --- | --- | --- |
| Calendar length | 730 days | **731** — 2024 is a leap year |
| `$473M` interpretation | ambiguous | **Annual.** The dataset spans `$909.75M` across two years |
| SKU count | 119 | confirmed 119 (an earlier count of 120 included a comment line) |

## Figures that recompute

| Figure | Documented | Generated | Why |
| --- | ---: | ---: | --- |
| Long-tail SKUs | 66.7% | **72.3%** | 86 of 119 below 1%. The documented figure was 68 of 102 |
| Portfolio PCI | 0.5509 | **0.5961** | Lead-time instability is 0.3963 vs 0.2014 because we chose the 6–35 day range over the source's ~6.5d ceiling. The other five sub-drivers land close |
| Segment split | 34/16/16/34 | **39/12/11/39** | See below |
| Rationalize candidates | 35 SKUs | **46 SKUs** | Follows from the segment split |
| Revenue tail risk | 27.08% | **15.79%** | Follows from which SKUs land in Rationalize |

## Finding: 34/16/16/34 is not reachable from this data

A median split on both axes forces `Keep == Rationalize` and `Grow == Consolidate`.
The seed's own `val` and `cx` fields correlate at **−0.763** and produce a 4.24pp
deviation by themselves. Raising the complexity bias made it *worse* (−0.79
correlation, 42/8/8/42). The bias was therefore set to **0** and the generated
data reproduces the seed's structure faithfully. The documented counts appear not
to come from a plain median split on this data.

## Finding: the Netherlands margin assumption was wrong

§3.3 asserted that listing only high-revenue SKUs is "what produces its documented
lowest-margin position". The opposite holds: restricting the Netherlands to the top
52 SKUs gives it the **highest** margin (40.29%), because high-revenue SKUs carry
better margins. The documented 38.20% must come from something else — regional cost
structure or channel mix, not assortment depth.

## Finding: SKU-level revenue is inconsistent with the portfolio headline

`SKUS.rev` is rendered as `${sku.rev}M`, but the 119 seed values sum to **10,608**
— $10.6B against a stated portfolio of $473M, a factor of ~22. Components also
disagree about the scale of `stockouts`: `ParetoConcentration` tests `> 300` while
`SKUHoldingsMatrix` tests `>= 6`. Migrating `SKUS` to generated values therefore
requires auditing 14 threshold comparisons first. Tracked in `TODO.md`.

## Tuning applied after measurement

| Parameter | From | To | Reason |
| --- | --- | --- | --- |
| Seasonality amplitudes | 0.25/0.30/0.08/0.20 | **×0.80** | Stable share was 65.5%; now 77.3% against the documented 78% |
| `COMPLEXITY_REVENUE_BIAS` | 0.55 | **0.0** | Measured; the seed already carries the correlation |
| Promo day fraction | full discount | **× mean intensity 0.465** | Promo intensity averages 0.465, so the realised discount is smaller than the analytic formula assumed |
