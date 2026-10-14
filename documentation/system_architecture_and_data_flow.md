# System Architecture and Data Flow — by thread

**Date:** 8 October 2026 · supersedes the three diagrams in `system_architecture.md`
(20 September), whose "Now" state had no database and no API.

Ten diagrams:

| # | Diagram | Answers |
| --- | --- | --- |
| 1 | System architecture | What the parts are and how they connect |
| 2 | Data flow overview | How the dataset is built, and how one number reaches a screen |
| 3–9 | One data flow per thread | For each thread: source → input → calculation → rule → KPI/signal → (agent reasoning → recommendation) |
| 10 | As-Is process | In [`as_is_process_lineage.md`](as_is_process_lineage.md): the team's 8 As-Is steps and what supports each today |

The thread diagrams use the lineage chain from the team deck's *Explain* pillar
(`Research_doc/Presentastaions/`, slide 9): **Source → Input → Calculation → Rule →
KPI / Signal → Agent reasoning → Recommendation**. The last two links are dashed in every
thread: no agent computes anything today. Each thread is also tagged with its decision stage
from the deck's To-Be journey (Detect → Diagnose → Assess → Correlate → Recommend →
Approve / Act → Measure).

Figures quoted in boxes are for the 12-month window ending 2025-12-31 and were read from the
API on 8 October.

## Status legend (all diagrams)

| Colour | Status | Meaning |
| --- | --- | --- |
| Green | **Live** | Computed in SQL over the selected timeline window |
| Blue | **Snapshot** | Computed once over the full 24 months; ignores the timeline selector |
| Purple | **Assumption** | Generated input, labelled as an assumption (costs, plans, gate weights) |
| Grey | **Typed** | Hand-written in the frontend; shown only offline, or not yet replaced |
| Red, dashed | **No source** | Nothing in the data can supply it; the screen says so |
| White, dashed | **Roadmap** | Planned, not built |

## Using these diagrams

Paste a block's contents (without the fence) into mermaid.live, or into Excalidraw's
*Mermaid to Excalidraw* dialog. All blocks follow the Excalidraw-safe rules: plain
rectangles, one edge per line, quoted labels, no `<br>`. Excalidraw may drop the `classDef`
colours; the structure survives.

---
 
## 1 · System architecture

Six layers, top to bottom. From the calculation layer down, boxes are grouped by thread.

```mermaid
flowchart TB
  subgraph L1 ["Layer 1 · Data sources"]
    GEN["Python generator: data/generator, 20 modules, SEED 20260909"]
    CSV["data/output: 26 CSV tables"]
    EXT["External feeds: competitor, NPS, client ERP and APIs"]
  end

  subgraph L2 ["Layer 2 · Validate and load"]
    VAL["validate.py: 30 exact checks"]
    LOAD["load.py: COPY 26 tables in FK order"]
    SQLV["04_validate.sql: 61 checks"]
  end

  subgraph L3 ["Layer 3 · Warehouse: PostgreSQL 17, port 5433"]
    CORE["Core: dim_date, dim_sku, dim_brand, dim_category, dim_country, dim_channel, dim_supplier, sku_supplier, fact_sales 357,471 rows"]
    SNAP["Snapshots: sku_metrics, sku_cannibalization, portfolio_metrics, rationalization_scenario"]
    OCT7["7 Oct tables: dim_customer, fact_customer_sales, fact_listing, fact_forecast, dim_launch, launch_gate, supplier_notice"]
    ASSUME["Assumption tables: dim_cost_assumption, fact_opex, sku_fixed_cost"]
    UNREAD["Loaded, not yet read: fact_plan, fact_inventory, fact_price"]
  end

  subgraph L4 ["Layer 4 · Calculation: 03_derive_metrics.sql + metric_registry"]
    C1["T1 Portfolio Health: fn_portfolio_kpis, fn_concentration, fn_monthly_trend, fn_sku_performance, fn_sku_segments, fn_portfolio_snapshot, fn_alerts, fn_forecast_accuracy, fn_customer_category_insights, fn_region_mix, fn_regional_fulfillment, fn_region_sku_shortlist"]
    C2["T2 Profitability: fn_pnl, fn_pnl_by_category, fn_regional_performance"]
    C3["T3 SKU Rationalization: fn_sku_rationale, fn_rationalization_scenarios, fn_cannibalization"]
    C4["T4 Assortment: fn_assortment_summary, fn_assortment, fn_listing_gaps"]
    C5["T5 Launch: fn_launches, fn_launch_gates, fn_launch_summary"]
    C6["T6 Signals: fn_signals, fn_category_trend"]
    WIN["metric_window: trailing 1, 3, 6, 12, 24, 36 months, prior window of equal length"]
  end

  subgraph L5 ["Layer 5 · API: FastAPI, backend/app/main.py, port 8000"]
    API["32 GET endpoints, each calls one SQL function, no arithmetic"]
    TEST["backend/tests: 37 tests, breakdowns sum to the headline"]
  end

  subgraph L6 ["Layer 6 · Frontend: React + Vite"]
    CTX["liveData.tsx: one fetch per timeline period, shared context"]
    LAZY["Screen-specific fetches: regional fulfillment, region top SKUs, category trend"]
    VP["VP Product Management"]
    PM["Product Manager"]
    PR["Pricing and Margin Partner"]
    TABS["12 tabs: T1 0 1 6, T2 3, T3 4 9 10 11, T4 8, T5 2, T6 5, T7 7"]
    AUDIT["Audit drawer: formula, columns and provenance per card"]
    OFF["Offline fallback: generated.ts and typed sample, grey badge"]
  end

  AGENTS["Agents and LLM reasoning"]
  O19["Role-based data access O19"]
  FIVE["5-tab consolidation O8"]

  GEN --> CSV
  CSV --> VAL
  VAL --> LOAD
  LOAD --> CORE
  LOAD --> SNAP
  LOAD --> OCT7
  LOAD --> ASSUME
  LOAD --> UNREAD
  CORE --> SQLV
  EXT -.-> CORE

  CORE --> C1
  SNAP --> C1
  OCT7 --> C1
  CORE --> C2
  ASSUME --> C2
  SNAP --> C3
  OCT7 --> C3
  CORE --> C4
  OCT7 --> C4
  OCT7 --> C5
  C1 --> C6
  WIN --> C1

  C1 --> API
  C2 --> API
  C3 --> API
  C4 --> API
  C5 --> API
  C6 --> API
  API --> TEST

  API --> CTX
  API --> LAZY
  CTX --> TABS
  LAZY --> TABS
  CTX --> AUDIT
  OFF -.-> TABS
  VP --> TABS
  PM --> TABS
  PR --> TABS

  API -.-> AGENTS
  AGENTS -.-> TABS
  O19 -.-> API
  FIVE -.-> TABS

  classDef live fill:#dcfce7,color:#14532d,stroke:#16a34a
  classDef snap fill:#dbeafe,color:#1e3a8a,stroke:#2563eb
  classDef assume fill:#ede9fe,color:#4c1d95,stroke:#7c3aed
  classDef typed fill:#f3f4f6,color:#374151,stroke:#9ca3af
  classDef nosrc fill:#fee2e2,color:#7f1d1d,stroke:#ef4444,stroke-dasharray:4 3
  classDef road fill:#ffffff,color:#374151,stroke:#6b7280,stroke-dasharray:4 3
  class C1,C2,C3,C4,C5,C6,WIN,API,CTX,LAZY live
  class SNAP snap
  class ASSUME assume
  class OFF typed
  class EXT,UNREAD nosrc
  class AGENTS,O19,FIVE road
```

**Notes**

- **All arithmetic lives in SQL.** FastAPI only calls functions, and the frontend only
  formats. Exceptions are named in the thread diagrams: the Portfolio Health Score weighting
  and the P&L what-if sliders still compute in the browser.
- **Three tables are loaded but read by nothing:** `fact_plan`, `fact_inventory`,
  `fact_price`. See diagram 10 for which As-Is steps they would close.
- **Offline is deliberate.** The static Vercel build has no API, so every screen keeps a
  typed fallback and the grey badge says so.

---

## 2 · Data flow overview

Two chains: how the dataset is built (once, by hand), and how a number reaches a card (on
every timeline change).

```mermaid
flowchart LR
  subgraph BUILD ["A · Build the dataset: run by hand"]
    B1["config.py: targets, tolerances, seed"]
    B2["main.py: generate 26 tables"]
    B3["validate.py: 30 exact checks"]
    B4["export_ts.py: generated.ts for offline"]
    B5["load.py: PostgreSQL"]
    B6["03_derive_metrics.sql: install functions"]
    B7["04_validate.sql: 61 checks"]
  end

  subgraph REQ ["B · One number to the screen: every timeline change"]
    R1["User picks timeline: 1m to 36m"]
    R2["months: 1, 3, 6, 12, 24, 36"]
    R3["liveData.tsx: 20 fetches in parallel"]
    R4["FastAPI endpoint"]
    R5["SQL function over metric_window"]
    R6["JSON rows"]
    R7["Card formats the value"]
    R8["Audit drawer: same data, formula and columns"]
  end

  OFF1["API down: status offline"]
  OFF2["Typed figures from generated.ts and constants, grey badge"]

  B1 --> B2
  B2 --> B3
  B3 --> B4
  B3 --> B5
  B5 --> B6
  B6 --> B7
  B7 --> R4

  R1 --> R2
  R2 --> R3
  R3 --> R4
  R4 --> R5
  R5 --> R6
  R6 --> R7
  R6 --> R8
  R3 -.-> OFF1
  OFF1 -.-> OFF2

  classDef live fill:#dcfce7,color:#14532d,stroke:#16a34a
  classDef typed fill:#f3f4f6,color:#374151,stroke:#9ca3af
  class R1,R2,R3,R4,R5,R6,R7,R8 live
  class OFF1,OFF2,B4 typed
```

**Notes**

- Growth always compares with the prior window of equal length. The data holds 24 months,
  so 36 is clamped and growth is NULL when no full prior window exists. It is never invented.
- Snapshot functions (`fn_sku_segments`, `fn_portfolio_snapshot`,
  `fn_rationalization_scenarios`, `fn_launches`) are fetched once and ignore the timeline.

---

## 3 · Thread 1 — Portfolio Health · stage: Detect

Tabs 0 Home, 1 Portfolio Health, 6 Top-Down Drill.

```mermaid
flowchart LR
  subgraph SRC ["Source"]
    S1["fact_sales"]
    S2["sku_metrics, portfolio_metrics"]
    S3["fact_forecast"]
    S4["dim_customer, fact_customer_sales"]
    S5["supplier_notice, launch_gate, sku_cannibalization"]
  end
  subgraph INP ["Input"]
    I1["net_sales, gross_margin, units_sold, stock_out_flag, date_key, country_id"]
    I2["portfolio_segment, operational_complexity_score, PCI sub-drivers"]
    I3["forecast_units by SKU x country x month"]
    I4["account net sales by category"]
    I5["gate status, notice dates, pair correlation"]
  end
  subgraph CALC ["Calculation"]
    C1["fn_portfolio_kpis, fn_concentration, fn_monthly_trend"]
    C2["fn_sku_performance, fn_sku_segments, fn_portfolio_snapshot"]
    C3["fn_forecast_accuracy"]
    C4["fn_customer_category_insights, fn_region_mix"]
    C5["fn_alerts"]
    C6["fn_regional_fulfillment, fn_region_sku_shortlist"]
  end
  subgraph RULE ["Rule"]
    R1["Growth vs prior window of equal length"]
    R2["Health score: 45 lifecycle mix, 35 margin, 10 complexity, 10 stockout rate"]
    R3["Attainment = actual / forecast; accuracy = 1 - WAPE"]
    R4["Alert rules: overdue gate, supplier notice, top-5 margin erosion, top-5 cannibalization, stockout rate above 1.5x prior"]
  end
  subgraph KPI ["KPI / Signal"]
    K1["Home: Total Revenue 473.0M, Gross Margin 38.55%, Active SKUs 119, Critical Alerts"]
    K2["Portfolio Health Score, PCI"]
    K3["Forecast Attainment 91.9%, Units Sold last month"]
    K4["Customer Insights, Regional Forecast vs prior window"]
    K5["Top-Down Drill: fulfillment by country, region SKU shortlist"]
    K6["Industry event feed"]
  end
  AG["Agent reasoning"]
  RE["Recommendation"]

  S1 --> I1
  S2 --> I2
  S3 --> I3
  S4 --> I4
  S5 --> I5
  I1 --> C1
  I1 --> C2
  I2 --> C2
  I3 --> C3
  I4 --> C4
  I5 --> C5
  I1 --> C6
  C1 --> R1
  C2 --> R2
  C3 --> R3
  C5 --> R4
  R1 --> K1
  R2 --> K2
  R3 --> K3
  R4 --> K1
  C4 --> K4
  C6 --> K5
  K1 -.-> AG
  AG -.-> RE

  classDef live fill:#dcfce7,color:#14532d,stroke:#16a34a
  classDef snap fill:#dbeafe,color:#1e3a8a,stroke:#2563eb
  classDef assume fill:#ede9fe,color:#4c1d95,stroke:#7c3aed
  classDef typed fill:#f3f4f6,color:#374151,stroke:#9ca3af
  classDef road fill:#ffffff,color:#374151,stroke:#6b7280,stroke-dasharray:4 3
  class S1,I1,C1,C3,C4,C5,C6,R1,R3,R4,K1,K3,K4,K5 live
  class S2,I2,C2 snap
  class S3,I3,S4,I4 assume
  class R2,K2 snap
  class K6 typed
  class AG,RE road
```

**Notes**

- The Health Score combines live inputs (growth, margin, stockout rate) with snapshot
  complexity. Its 45/35/10/10 weighting runs in the browser (`LifecycleHealthPanel`), and the
  weights are a judgment call, which the drawer states.
- The forecast and customer tables are generated (purple). Their figures are real
  calculations over generated inputs.
- The Home industry event feed is illustrative and typed.

---

## 4 · Thread 2 — Profitability · stage: Diagnose

Tab 3.

```mermaid
flowchart LR
  subgraph SRC ["Source"]
    S1["fact_sales"]
    S2["fact_opex"]
    S3["sku_fixed_cost"]
    S4["dim_cost_assumption"]
    S5["sku_metrics"]
  end
  subgraph INP ["Input"]
    I1["net_sales, gross_margin by month and country"]
    I2["logistics, marketing, SG&A variable and fixed, by month"]
    I3["fixed cost per SKU per year"]
    I4["tax rate per country"]
    I5["margin_erosion per SKU"]
  end
  subgraph CALC ["Calculation"]
    C1["fn_pnl"]
    C2["fn_pnl_by_category"]
    C3["fn_regional_performance: tax weights"]
    C4["fn_sku_performance"]
  end
  subgraph RULE ["Rule"]
    R1["Fixed costs pro-rated by months in window"]
    R2["Tax weighted by each country's revenue share"]
    R3["EBIT = gross margin - logistics - marketing - SG&A - fixed"]
    R4["Break-even radar: SKUs under 20% gross margin"]
  end
  subgraph KPI ["KPI / Signal"]
    K1["Gross Profit"]
    K2["Net Profit, SG&A overhead"]
    K3["P&L simulator seeds: EBIT 14.7%"]
    K4["Margin velocity alerts, break-even radar"]
    K5["VP tree, scenarios and YTD on the 851.2M baseline"]
  end
  AG["Agent reasoning"]
  RE["Recommendation"]

  S1 --> I1
  S2 --> I2
  S3 --> I3
  S4 --> I4
  S5 --> I5
  I1 --> C1
  I2 --> C1
  I3 --> C1
  I4 --> C3
  C3 --> C1
  I1 --> C2
  I2 --> C2
  I1 --> C4
  C1 --> R1
  C1 --> R2
  C1 --> R3
  C4 --> R4
  I5 --> K4
  R3 --> K1
  R3 --> K2
  R3 --> K3
  R4 --> K4
  K2 -.-> AG
  AG -.-> RE

  classDef live fill:#dcfce7,color:#14532d,stroke:#16a34a
  classDef snap fill:#dbeafe,color:#1e3a8a,stroke:#2563eb
  classDef assume fill:#ede9fe,color:#4c1d95,stroke:#7c3aed
  classDef typed fill:#f3f4f6,color:#374151,stroke:#9ca3af
  classDef road fill:#ffffff,color:#374151,stroke:#6b7280,stroke-dasharray:4 3
  class S1,I1,C1,C2,C3,C4,R1,R2,R3,R4,K1 live
  class S2,S3,S4,I2,I3,I4,K2,K3 assume
  class S5,I5,K4 snap
  class K5 typed
  class AG,RE road
```

**Notes**

- Everything below gross profit rests on labelled cost assumptions. Net Profit and SG&A are
  real calculations over assumed inputs, which is why they are purple, not green.
- The P&L what-if sliders seed from `fn_pnl`, then recompute in the browser as the user moves
  them.

---

## 5 · Thread 3 — SKU Rationalization · stage: Assess

Tabs 4, 9 Rationalisation Home, 10 SKU Drill Down, 11 Task Tracker.

```mermaid
flowchart LR
  subgraph SRC ["Source"]
    S1["fact_sales"]
    S2["sku_metrics"]
    S3["sku_cannibalization"]
    S4["supplier_notice"]
    S5["rationalization_scenario"]
  end
  subgraph INP ["Input"]
    I1["net sales, margin, growth, stockout rate per SKU in window"]
    I2["portfolio_segment, low_velocity_flag, complexity, margin_erosion"]
    I3["significant pairs, correlation"]
    I4["notice type, effective date"]
    I5["4 removal scenarios"]
  end
  subgraph CALC ["Calculation"]
    C1["fn_sku_segments"]
    C2["fn_sku_rationale"]
    C3["fn_rationalization_scenarios"]
  end
  subgraph RULE ["Rule"]
    R1["Segment: median split on value and complexity"]
    R2["7 rules, first match wins: supplier notice, declining sales, margin 8pt below, stockouts above 2x, smaller SKU of pair, long-tail Rationalize, growth 12% or more"]
    R3["Action follows the factor; margin without the SKU assumes no demand transfer"]
  end
  subgraph KPI ["KPI / Signal"]
    K1["Tab 4: Rationalize Candidates 43, Long-Tail Burden, Revenue Tail Risk, Avg Complexity, Peak Stockout"]
    K2["Tab 9: factor cards, roadmap 37 / 0 / 12 / 5, alerts, Analyze panel"]
    K3["Tab 10: 54 flagged SKUs, RCA, Simulate"]
    K4["Tab 9: Customer and Market, Regulatory: 0, no data source"]
    K5["Tab 11 Task Tracker: browser session only"]
    K6["Tab 9 deep-dive pages: offline only"]
  end
  AG["Agent reasoning"]
  RE["Recommendation"]

  S1 --> I1
  S2 --> I2
  S3 --> I3
  S4 --> I4
  S5 --> I5
  I2 --> C1
  I1 --> C2
  I2 --> C2
  I3 --> C2
  I4 --> C2
  I5 --> C3
  C1 --> R1
  C2 --> R2
  C2 --> R3
  R1 --> K1
  C3 --> K1
  R2 --> K2
  R2 --> K3
  R3 --> K3
  K2 --> K5
  K3 -.-> AG
  AG -.-> RE

  classDef live fill:#dcfce7,color:#14532d,stroke:#16a34a
  classDef snap fill:#dbeafe,color:#1e3a8a,stroke:#2563eb
  classDef typed fill:#f3f4f6,color:#374151,stroke:#9ca3af
  classDef nosrc fill:#fee2e2,color:#7f1d1d,stroke:#ef4444,stroke-dasharray:4 3
  classDef road fill:#ffffff,color:#374151,stroke:#6b7280,stroke-dasharray:4 3
  class S1,I1,C2,R2,R3,K2,K3 live
  class S2,S3,S4,S5,I2,I3,I4,I5,C1,C3,R1,K1 snap
  class K5,K6 typed
  class K4 nosrc
  class AG,RE road
```

**Notes**

- `fn_sku_rationale` mixes windowed inputs (growth, margin, stockouts) with snapshot ones
  (segment, cannibalization). So the classification moves with the timeline: Reposition is
  empty at 12 months and fills at 3 months.
- `supplier_notice` is generated. It is drawn blue because it is a fixed list, not a window.

---

## 6 · Thread 4 — Assortment · stage: Assess

Tab 8.

```mermaid
flowchart LR
  subgraph SRC ["Source"]
    S1["fact_sales"]
    S2["fact_listing"]
    S3["dim_country"]
    S4["sku_cannibalization"]
  end
  subgraph INP ["Input"]
    I1["net sales, gross margin per SKU per country"]
    I2["listings by SKU x country x channel"]
    I3["7 countries, 3 regions"]
    I4["significant negative pairs"]
  end
  subgraph CALC ["Calculation"]
    C1["fn_assortment"]
    C2["fn_listing_gaps"]
    C3["fn_sku_performance"]
    C4["fn_assortment_summary"]
  end
  subgraph RULE ["Rule"]
    R1["Density: most SKUs selling in one country"]
    R2["Long tail: SKU under 1% of revenue"]
    R3["Yield: gross margin per selling SKU"]
    R4["Cannibalization index: mean absolute correlation"]
    R5["Listed never sold: a listing with no sale"]
  end
  subgraph KPI ["KPI / Signal"]
    K1["Assortment Density 119, Italy"]
    K2["Long-Tail Burden 72.3%"]
    K3["Assortment Gross Yield"]
    K4["Cannibalization Risk Index, 187 pairs"]
    K5["82 listings never sold"]
    K6["Regional grid and delist slider coefficients"]
  end
  AG["Agent reasoning"]
  RE["Recommendation"]

  S1 --> I1
  S2 --> I2
  S3 --> I3
  S4 --> I4
  I1 --> C1
  I3 --> C1
  I2 --> C2
  I1 --> C3
  C1 --> C4
  C2 --> C4
  C3 --> C4
  I4 --> C4
  C4 --> R1
  C4 --> R2
  C4 --> R3
  C4 --> R4
  C4 --> R5
  R1 --> K1
  R2 --> K2
  R3 --> K3
  R4 --> K4
  R5 --> K5
  K2 -.-> AG
  AG -.-> RE

  classDef live fill:#dcfce7,color:#14532d,stroke:#16a34a
  classDef snap fill:#dbeafe,color:#1e3a8a,stroke:#2563eb
  classDef assume fill:#ede9fe,color:#4c1d95,stroke:#7c3aed
  classDef typed fill:#f3f4f6,color:#374151,stroke:#9ca3af
  classDef road fill:#ffffff,color:#374151,stroke:#6b7280,stroke-dasharray:4 3
  class S1,S3,I1,I3,C1,C3,C4,R1,R2,R3,K1,K2,K3 live
  class S2,I2,C2,R5,K5 assume
  class S4,I4,R4,K4 snap
  class K6 typed
  class AG,RE road
```

**Notes**

- A 72.3% long tail is expected with 119 SKUs, where the average share is 0.84%. The drawer
  says so.
- The regional grid reads `generated.ts`, a real export but not live, and the delist slider
  uses typed coefficients. Both are grey.

---

## 7 · Thread 5 — Launch Readiness · stage: Assess

Tab 2.

```mermaid
flowchart LR
  subgraph SRC ["Source"]
    S1["dim_launch"]
    S2["launch_gate"]
    S3["fact_sales"]
  end
  subgraph INP ["Input"]
    I1["25 launches: 10 launched, 15 pipeline; budget, spent, owner_role"]
    I2["lead_region, expected_year1_revenue_usd"]
    I3["6 gates: weight, due date, status, reviewer_role"]
    I4["first 365 days of sales per launched SKU"]
  end
  subgraph CALC ["Calculation"]
    C1["fn_launches"]
    C2["fn_launch_gates"]
    C3["fn_launch_summary"]
  end
  subgraph RULE ["Rule"]
    R1["Readiness = sum of completed gate weights"]
    R2["Risk: High if a gate is overdue, Medium if the next gate is due within 45 days"]
    R3["Revenue at risk = year-1 plan of High-risk launches"]
    R4["Plan attainment = annualised year-1 actual / plan"]
  end
  subgraph KPI ["KPI / Signal"]
    K1["Overall Readiness 39%"]
    K2["Launches at Risk 3 of 15, escalations"]
    K3["Launch Revenue at Risk 4.5M of 30.7M"]
    K4["Launch Plan Attainment 102%"]
    K5["8-dimension readiness simulator"]
    K6["AI risk predictions"]
  end
  AG["Agent reasoning"]
  RE["Recommendation"]

  S1 --> I1
  S1 --> I2
  S2 --> I3
  S3 --> I4
  I1 --> C1
  I2 --> C1
  I3 --> C1
  I4 --> C1
  I3 --> C2
  C1 --> C3
  C1 --> R1
  C1 --> R2
  C3 --> R3
  C3 --> R4
  R1 --> K1
  R2 --> K2
  R3 --> K3
  R4 --> K4
  K2 -.-> AG
  AG -.-> RE

  classDef live fill:#dcfce7,color:#14532d,stroke:#16a34a
  classDef snap fill:#dbeafe,color:#1e3a8a,stroke:#2563eb
  classDef assume fill:#ede9fe,color:#4c1d95,stroke:#7c3aed
  classDef typed fill:#f3f4f6,color:#374151,stroke:#9ca3af
  classDef road fill:#ffffff,color:#374151,stroke:#6b7280,stroke-dasharray:4 3
  class S1,S2,I1,I3,C1,C2,C3,R1,R2,K1,K2 snap
  class I2,R3,K3 assume
  class S3,I4,R4,K4 live
  class K5 typed
  class K6,AG,RE road
```

**Notes**

- Launch data is stated as of 2025-12-31, not windowed, so it is drawn blue. Plan
  attainment is green because its actual side is computed from `fact_sales`.
- Gate weights, lead region and the year-1 plan are generated assumptions, each labelled as
  such.

---

## 8 · Thread 6 — Market Signals · stage: Detect and Correlate

Tab 5.

```mermaid
flowchart LR
  subgraph SRC ["Source"]
    S1["fact_sales"]
    S2["supplier_notice, launch_gate, sku_metrics, sku_cannibalization"]
    S3["dim_country, dim_category"]
    S4["Competitor, sentiment, market feeds"]
  end
  subgraph INP ["Input"]
    I1["sales by region x category, this and prior window"]
    I2["alert rows"]
    I3["category sales by week or month"]
  end
  subgraph CALC ["Calculation"]
    C1["fn_alerts"]
    C2["fn_region_mix, fn_portfolio_kpis"]
    C3["fn_signals"]
    C4["fn_category_trend"]
  end
  subgraph RULE ["Rule"]
    R1["Every alert becomes a signal with category, region and dollar impact"]
    R2["Opportunity: 3 fastest-growing region x category cells above portfolio growth"]
    R3["Demand risk: any region x category cell below its prior window"]
    R4["Index: 100 = each category's first full period"]
  end
  subgraph KPI ["KPI / Signal"]
    K1["Signal feed: 22 signals, filters, region map"]
    K2["Risk Exposure, each SKU counted once"]
    K3["Opportunities, Regions Alerted, Resolution Rate this session"]
    K4["Category momentum chart, 7 categories"]
    K5["Competitor alerts, market signals, competitive intelligence, NPS"]
    K6["Portfolio saturation dials"]
  end
  AG["Agent reasoning"]
  RE["Recommendation"]

  S1 --> I1
  S1 --> I3
  S2 --> I2
  S3 --> I1
  I2 --> C1
  I1 --> C2
  C1 --> C3
  C2 --> C3
  I3 --> C4
  C3 --> R1
  C3 --> R2
  C3 --> R3
  C4 --> R4
  R1 --> K1
  R1 --> K2
  R2 --> K3
  R3 --> K1
  R4 --> K4
  S4 -.-> K5
  K1 -.-> AG
  AG -.-> RE

  classDef live fill:#dcfce7,color:#14532d,stroke:#16a34a
  classDef snap fill:#dbeafe,color:#1e3a8a,stroke:#2563eb
  classDef typed fill:#f3f4f6,color:#374151,stroke:#9ca3af
  classDef nosrc fill:#fee2e2,color:#7f1d1d,stroke:#ef4444,stroke-dasharray:4 3
  classDef road fill:#ffffff,color:#374151,stroke:#6b7280,stroke-dasharray:4 3
  class S1,S3,I1,I3,C1,C2,C3,C4,R1,R2,R3,R4,K1,K2,K3,K4 live
  class S2,I2 snap
  class S4,K5 nosrc
  class K6 typed
  class AG,RE road
```

**Notes**

- This is the deck's **Correlate** stage. Each signal carries the rule that fired it, and the
  audit drawer shows the same rows, which together make up the provenance trail.
- Resolution Rate counts only signals resolved on screen this session. No resolution history
  table exists.

---

## 9 · Thread 7 — Agent Orchestrator · stage: Recommend

Tab 7. No computed figures exist on this tab; the diagram shows what would connect it.

```mermaid
flowchart LR
  subgraph NOW ["Today"]
    N1["agentData.ts: typed agent roster, traces and messages"]
    N2["Tab 7 Agent Orchestrator"]
  end
  subgraph LIVE ["Already live, ready to feed agents"]
    L1["fn_signals: what changed, with rule and impact"]
    L2["fn_sku_rationale: why a SKU is flagged, and the action"]
    L3["fn_launch_summary, fn_pnl, fn_assortment_summary"]
    L4["metric_registry: definition of every figure"]
  end
  subgraph ROAD ["Roadmap"]
    A1["Agent reasoning over the live functions"]
    A2["Recommendation with evidence trail"]
    A3["Approve and act: decision table, owner, status"]
    A4["Measure: expected vs actual impact"]
  end

  N1 --> N2
  L1 -.-> A1
  L2 -.-> A1
  L3 -.-> A1
  L4 -.-> A1
  A1 -.-> A2
  A2 -.-> A3
  A3 -.-> A4
  A2 -.-> N2

  classDef live fill:#dcfce7,color:#14532d,stroke:#16a34a
  classDef typed fill:#f3f4f6,color:#374151,stroke:#9ca3af
  classDef road fill:#ffffff,color:#374151,stroke:#6b7280,stroke-dasharray:4 3
  class L1,L2,L3,L4 live
  class N1,N2 typed
  class A1,A2,A3,A4 road
```

**Notes**

- The team deck marks Agent Orchestrator as PRIMARY for all three personas. Today it shows
  typed content only.
- **Measure** has two live precedents to build on: Launch Plan Attainment (102%) and Forecast
  Attainment (91.9%). Both are expected-vs-actual comparisons computed in SQL.
