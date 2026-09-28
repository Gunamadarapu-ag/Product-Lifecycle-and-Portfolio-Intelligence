# Formula Reference — every calculation in the application

**Date:** 23 September 2026
**Method:** every formula below was read from the source, not recalled from memory or from
report copy. File and line are cited so anyone can re-check them. Where a formula spans a
function, the citation names the function and its file.

**Companion to:** [`Nine Tabs, Zero Backend`](https://claude.ai/artifact/RUSZBYqo2KMiveaVVJGMKW)
(what's built per persona), [`data_model_specification.md`](data_model_specification.md) (the
schema), `TODO.md` O1/O2/O7 (the fixes these findings feed).

---

## How to read this

Three layers exist, and they disagree with each other constantly:

1. **The Python generator** (`data/generator/`) — the only layer with real, validated,
   statistically-grounded formulas. It produces 368,013 fact rows that reconcile to 16 of 16
   targets.
2. **The database** — mostly just *holds* what the generator computed. Almost nothing is
   computed in SQL yet (that's `TODO.md` O2, still open).
3. **The frontend** — nine tabs, each with its own formulas. Most are typed-in numbers dressed
   as calculations. A few are genuinely computed from real data. One layer (the timeframe
   selector) silently perturbs *every* number, including the two that are otherwise real.

Every entry below is marked one of four ways:

| Mark | Meaning |
| --- | --- |
| 🟢 **Real** | Computed from actual data, and the computation is sound |
| 🟡 **Real formula, fake input** | The math is legitimate; the numbers it runs on are typed in |
| 🔴 **Fabricated** | No real formula — a typed-in value, or an operation with no meaning (e.g. `revenue % 30`) |
| ⚪ **Not yet built** | Defined in the schema or planned, but nothing computes it today |

---

## Quick reference

| Metric | Tab | Formula is | Where |
| --- | --- | --- | --- |
| Net Sales, Avg Gross Margin (dataset) | — | 🟢 Real | `config.py`, `calibrate.py` |
| Revenue concentration (Pareto) | — | 🟢 Real | `sku_master.py` |
| Portfolio Complexity Index | — | 🟡 4 of 6 sub-drivers real, 2 pinned to a target | `derive.py` |
| `gross_margin` (per row) | — | 🟢 Real, computed by Postgres | `01_schema.sql` |
| `sku_metrics`, `portfolio_metrics`, `sku_cannibalization` | — | ⚪ Loaded, not SQL-derived | O2, open |
| Home KPI cards | Home | 🔴 Fabricated | `data.ts → VP_KPI_BASE` |
| **Timeframe selector, all tabs** | cross-cutting | 🔴 Fabricated noise, even on real figures | `utils/timeframe.ts` |
| Portfolio Health Score | Portfolio Health | 🔴 Fabricated (real inputs, arbitrary weights) | `LifecycleHealthPanel.tsx:18` |
| Investment vs Return Margin quadrant | Portfolio Health | 🔴 Fabricated (`revenue % 30`) | `InvestmentMarginMap.tsx:75` |
| Revenue Performance Matrix quadrant | Portfolio Health | 🟡 Real split logic, fake inputs | `RevenuePerformanceMatrix.tsx:34` |
| Launch Readiness Score (gauge) | Launch Readiness | 🔴 Fabricated (typed per SKU) | `launchData.ts` |
| Revenue at Risk | Launch Readiness | 🟡 Real formula, fake inputs | `VPLaunchReadinessView.tsx:289` |
| Gross / Operating Margin cards | Profitability | 🔴 Fabricated baseline + fake noise | `VPProfitabilityTreeView.tsx:199` |
| Margin Simulator profit lift | Profitability | 🟢 Real — reads the generated regional dataset | `MarginSimulator.tsx:200` |
| Cannibalization rate (78.5%) | SKU Rationalization | 🔴 Fabricated, a literal | `DemoTab.tsx` |
| Segment (Keep/Grow/Consolidate/Rationalize) | SKU Rationalization | 🔴 Typed per SKU, not computed | `data.ts → SKUS` |
| Pricing elasticity simulator | Signals Board | 🟡 Real linear demand model, fake inputs, real brand names | `SignalsBoard.tsx:191` |
| Assortment Density / Burden / Yield / Cannibalization | SKU Assortment | 🔴 Hardcoded per-timeframe lookup | `AssortmentOverview.tsx:41` |
| Top-Down Drilldown attainment % | Top-Down Drilldown | 🟢 Real (`actual / target`), on fake inputs | `DrilldownRegionGrid.tsx:140` |
| Agent Orchestrator | Agent Orchestrator | 🔴 No formulas at all | — |

---

## Part 1 — The generator (the real math)

Everything here is in `data/generator/`, seeded (`SEED = 20260909`), and asserted by
`validate.py` (16 of 16 targets pass). This is the only layer worth trusting as-is.

### Net sales and margin

```
ANNUAL_NET_SALES = $473,000,000        (config.py:31)
YOY_GROWTH       = 8.3%                (config.py:32)
BASE_YEAR_NET_SALES = ANNUAL_NET_SALES / (1 + YOY_GROWTH)
AVG_GROSS_MARGIN = 38.53%              (config.py:33)
```

**Margin calibration** (`calibrate.py`) — the only post-hoc correction the pipeline needs.
Revenue is fixed by price × units; margin is revenue-weighted, so high-revenue SKUs pull the
portfolio average above the unweighted mean. The fix has a closed form:

```
cost_i = price_i × (1 − m_i − d)
GM(d)  = GM(0) + d × U            where U = Σ(units × price)
d      = (GM_target − GM(0)) / U
```

`d` shifts every SKU's cost by the same amount, so relative margin ordering never changes.
*(This is the same sign-error trap noted in `TODO.md`'s decisions log — the effective margin
is `m + d`, not `m − d`, because cost subtracts the shift.)*

### Revenue concentration (Pareto curve)

```
PARETO_ANCHORS = {10%: 27.81%, 20%: 48.51%, 30%: 62.88%, 100%: 100%}   (config.py:42)
```

A monotone PCHIP curve through those anchors sets the target concentration. Reaching it exactly
requires more than sorting by revenue — country listing thresholds cut off lower-ranked SKUs in
some markets, which pushes the *realised* concentration above the input curve. `sku_master.py`'s
`solve_input_shares()` inverts this with damped fixed-point iteration:

```
w ← w × (target / realised)^0.5,  repeated 300 times, renormalised each pass
```

so the shares that go *in* are pre-compensated for the market-listing effect, and what comes
*out* — the realised concentration — lands on the documented 27.81% / 48.51% / 62.88%.

### Portfolio Complexity Index

`derive.py:211-224`. The 0.5509 figure quoted throughout the app is the mean of six
sub-drivers:

```
PCI = mean(supplier_fragmentation, sku_proliferation, low_velocity_pct,
           lead_time_instability, promo_dependency_score, avg_volatility_cv)
```

| Sub-driver | Target | How it's computed |
| --- | --- | --- |
| Supplier fragmentation | 1.2000 | 🟡 `supplier_count / 60 × 1.2000` — moves only if supplier count changes |
| SKU proliferation | 1.0200 | 🟡 `sku_count / 119 × 1.0200` — moves only if SKU count changes |
| Low-velocity % | 0.6667 | 🟢 mean of a real per-SKU low-velocity flag |
| Lead-time instability | 0.2014 | 🟢 `std(lead_time_days) / mean(lead_time_days)` |
| Promo dependency score | 0.1100 | 🟢 Σ(promo_dependency × revenue_share) |
| Avg volatility (CV) | 0.1071 | 🟢 mean of a real per-SKU coefficient-of-variation score |

The first two are **not independent measurements** — they're the SKU/supplier count expressed
as a ratio against a baseline that already equals today's count (119 SKUs, 60 suppliers), so
they sit at their target by construction and can't move without changing the catalog size. This
is the "2 of 6 sub-drivers fixed by config" limitation already logged in `TODO.md`.

---

## Part 2 — SQL (mostly not built yet)

One real formula exists at the database level:

```sql
gross_margin NUMERIC GENERATED ALWAYS AS (net_sales - (units_sold * purchase_cost)) STORED
```
`01_schema.sql:237` — computed by Postgres itself on every row, so it can never drift from
`net_sales` and `purchase_cost`.

Everything else — `sku_metrics`, `portfolio_metrics`, `sku_cannibalization`,
`rationalization_scenario` — is a table with real columns and keys, **loaded from Python-computed
CSVs**, not derived by SQL. `03_derive_metrics.sql` and `04_validate.sql` (`TODO.md` O2) don't
exist yet. Until they do, "computed in SQL" is aspirational for every metric except
`gross_margin`.

---

## Part 3 — Frontend, tab by tab

### Home

| Metric | Formula |
| --- | --- |
| Total Revenue, Gross Margin, Active SKUs, Critical Alerts | 🔴 Four literals in `VP_KPI_BASE` (`data.ts:388`). Total Revenue reads **$851M**, Gross Margin **36.2%** — the baseline the generator does not produce ($473M, 38.55%). |

### Portfolio Health Map

**Portfolio Health Score** (`LifecycleHealthPanel.tsx:18-96`) — the "88% HEALTH" figure:

```
score = positiveTrendPct × 0.45
      + marginFactor      × 0.35
      + (100 − complexityPenalty) × 0.10
      + (100 − stockoutPenalty)   × 0.10
```

- `positiveTrendPct` — share of SKUs with non-negative growth (Introduction/Growth/Margin vs
  Decline; the stage cutoffs are `growth ≥ 15% & rev < 100` for Introduction, `growth ≥ 10%`
  for Growth).
- `marginFactor = min(100, avgMargin / 40 × 100)`.
- `complexityPenalty = ((avgComplexity × 0.8 + (avgMargin≥35 ? 0.2 : 0.4)) / 1.2) × 25`.
- `stockoutPenalty = min(15, avgStockouts × 3)`.

🔴 The four weights (45/35/10/10) and every threshold in it are typed in, not derived or
calibrated against anything. It also runs on `SKUS` (the array with the 22× revenue scale
issue, `TODO.md` O1) — the `rev < 100` Introduction-stage cutoff is evaluated against that
distorted figure, so stage classification may already be wrong before the weighting is even
applied.

**Investment vs Return Margin Map** (`InvestmentMarginMap.tsx:75-114`):

```
investment = 55 + (rev % 35)     // or 15/60/10 + a different modulus, by margin/rev branch
quadrant   = returnMargin ≥ 50 && investment < 50  → "quickwin"
             returnMargin ≥ 50 && investment ≥ 50  → "strategic"
             returnMargin < 50 && investment < 50  → "niche"
             else                                   → "avoid"
```

🔴 `rev % 30` (revenue modulo 30) has no financial meaning — it's used purely because it
produces a number that *looks* like a plausible capital requirement. A handful of SKUs
(`BrandE Yogurt (Straw)`, `Foam Face Wash`, …) have individually hardcoded overrides on top of
this. The quadrant thresholds (50/50) are round numbers, not derived from any target.

**Revenue Performance Matrix** (`RevenuePerformanceMatrix.tsx:34-47`):

```
quadrant = revenue ≥ 75 && performance ≥ 50  → "high_performer"
           revenue ≥ 75 && performance < 50  → "underperformer"
           revenue < 75 && performance ≥ 50  → "hidden_growth"
           else                               → "attention"
```

🟡 The split logic itself is a reasonable quadrant classifier; the `revenue`/`performance`
inputs it runs on come from the same fabricated pipeline as the rest of the tab.

### Launch Readiness

**Launch Readiness Index (LRI)**, shown in the simulator (`VPLaunchReadinessView.tsx:556-561`):

```
LRI = mean(Product, Compliance, Marketing, Market, Sales, Operations,
           Customer Support, Financial Readiness)
```

🔴 An unweighted average of eight sub-scores, each of which is itself a typed-in number per
product in `launchData.ts` (e.g. `readiness: 95`) — not derived from any launch-gate data. No
launch table exists in the warehouse either (0 of 119 SKUs have a `launch_date`), so this
couldn't be grounded in real data even if the formula were sound.

**Revenue at Risk** (`VPLaunchReadinessView.tsx:289`, and the tab documents its own formula in
a tooltip at line 811):

```
Revenue at Risk = Σ(revExposure)  where readiness < 75%
```

🟡 The aggregation itself is fine; `revExposure` is a typed-in per-product figure.

### Profitability Tree

**Gross / Operating Margin cards** (`VPProfitabilityTreeView.tsx:199-200`):

```
value = getAdjustedMargin(36.2, 'GM_PT', timelineRange)
```

🔴 Starts from the same wrong baseline as Home (36.2%, not 38.55%), then passes through the
fake-noise layer described below — so it moves every time the timeline filter changes, for
reasons that have nothing to do with the underlying data.

**Margin Simulator** (`MarginSimulator.tsx:200-227`) — the one clean piece of financial logic
in the whole tab:

```
gross_profit_i = net_sales_i × margin_pct_i / 100
Δ total GP     = Σ over countries of (net_sales_i × (sim_margin_i − orig_margin_i) / 100)
simulated enterprise margin = (original total GP + Δ total GP) / total net sales
```

🟢 Correct, standard margin-lift arithmetic, and it runs on `REGIONAL_DATA` — the real,
generator-produced dataset. This is the most defensible calculation anywhere in the frontend.

### SKU Rationalization

- **Segment** (Keep / Grow / Consolidate / Rationalize) — 🔴 typed per SKU in `data.ts → SKUS`,
  not derived from `value`/`complexity` by any threshold rule in the code.
- **Cannibalization rate** — 🔴 a hardcoded `78.5%` literal in `DemoTab.tsx`, while a real,
  validated `sku_cannibalization` table (1,153 rows) sits loaded in the database, unused by
  this screen.
- **Portfolio SKUs / Sunset Candidates / Revenue at Risk / Avg Complexity** (the four KPI
  cards) — counts and sums over the same authored `SKUS` array; no independent formula beyond
  filtering by the typed-in `segment` field.

### Signals Board

**Pricing / cross-elasticity simulator** (`SignalsBoard.tsx:191-215`):

```
Pepsi demand    = max(0, 10000 − 800·(pepsiPrice − 20) + 200·(mtnDewPrice − 22))
MtnDew demand   = max(0, 6000  − 500·(mtnDewPrice − 22) + 150·(pepsiPrice − 20))
Est. revenue    = Σ(demand_i × price_i)
Est. profit     = Σ(demand_i × (price_i − unit_cost_i))     unit costs: $9, $10
```

🟡 This is a genuine linear own-price/cross-price demand model — own-price and cross-price
elasticity coefficients, real contribution-margin arithmetic. The formula is sound; the
coefficients are typed in, and — separately from the math — it names **real competitor
brands** (Pepsi, Mountain Dew, and it compares against "Coke & Sprite equivalents"), which is
the brand-exposure issue already tracked in `TODO.md` O9.

Signal counts by severity/domain are plain filters over an authored list — not a calculation.

### SKU Assortment

**Assortment Density, Long-Tail Burden Ratio, Assortment Gross Yield, Cannibalization Risk
Index** (`AssortmentOverview.tsx:41-73`):

```
switch (timeframe) {
  case '1m':  burden = 68.2%; yield = $0.25M; cannibalization = 0.64;
  case '3m':  burden = 67.5%; yield = $0.76M; cannibalization = 0.63;
  ...
}
```

🔴 A hardcoded lookup table, one literal set per timeframe bucket — not computed from
`REGIONAL_DATA`, even though that real dataset is available in this same tab (and is what
actually feeds the regional grid components sitting right next to these cards).

### Top-Down Drilldown

```
attainment % = round(min(100, actual / target × 100))
```
🟢 `DrilldownRegionGrid.tsx:140` — simple, correct attainment math. 🔴 But `target` and
`actual` come from `REGIONS_CONFIG`/`REGION_SKUS`, typed directly into the component
(`TopDownDrilldown.tsx:17-25`) — real formula, fabricated inputs, same pattern as Signals.

### Agent Orchestrator

No formulas of any kind. Four named agents (FP&A, Controller, Merchandiser, Supply Chain — note
these don't match the five named in the brief and the architecture doc) with typed-in findings
and simulated activity. Confirmed separately: no model is called; the widget matches keywords.

---

## Cross-cutting — the timeframe selector fabricates variance everywhere

This is the single most important finding in this document, because it's invisible from any
one tab and touches figures this review had previously called "real."

`src/utils/timeframe.ts` defines a family of `getAdjusted*` functions
(`getAdjustedRevenue`, `getAdjustedMargin`, `getAdjustedStockouts`, `getAdjustedGrowth`,
`getAdjustedPci`) built on one primitive:

```js
function getDeterministicNoise(seed, timeframe) {
  // hashes (seed + timeframe) into a float in [-1, 1] — stable per input, but not derived
  // from any real period-over-period data
}
```

Every one of these adds a hash-based "noise" term plus a hand-typed `drift` schedule per
timeframe bucket (`1m: −1.5, 3m: −0.8, 6m: −0.3, 12m: 0, 24m: +0.5, 36m: +1.1`, for margin —
each function has its own schedule). The effect: selecting a different date range doesn't
filter to different real data — it runs the *same* base number through a fabricated-variance
function and displays whatever comes out.

**This reaches the KPI strip, including the two metrics this review had called genuinely
computed.** `getFilteredKPIS` (`timeframe.ts:163-212`) re-declares its own base literals —
`473` for Net Sales, `38.53` for Avg Gross Margin — discarding whatever value arrived from
`GENERATED_KPI_VALUES`, then runs each through the noise layer:

```js
if (kpi.label === 'Net Sales (Portfolio)') {
  const scaledVal = 473 * scale * (1 + getDeterministicNoise('sales_kpi', timeframe) * 0.02);
  newValue = `$${Math.round(scaledVal)}M`;
}
```

At the default `12m` timeframe, `scale = 1.0` but the noise term is **not** zero — it's
whatever the hash of `'sales_kpi12m'` produces, up to ±2%. So even the headline "$473M" figure,
at the app's default settings, is not the literal validated number — it's that number run
through a deterministic-but-arbitrary perturbation. `Long-Tail SKU Burden` and `Rationalize
Candidates` skip the noise function entirely and just switch between six typed-in literals per
timeframe bucket.

**Practical effect:** changing the timeline filter on Home, Portfolio Health (via
`getFilteredPortfolioData`/`getFilteredSKUS`), Profitability, or the KPI strip changes every
number on screen, and none of that change reflects anything about the actual time period
selected. It's simulated for visual effect.

---

## What I'd add to this document next

This pass covers every formula that exists. Three things would make it more useful as the
project moves past this audit stage, and I didn't do them here because each is a real decision,
not a research task:

1. **A "target formula" column** — for each fabricated metric, what the formula *should* be
   once it's wired to real data (e.g. Portfolio Health Score's weights, once someone decides
   whether 45/35/10/10 is the intended weighting or just what shipped first).
2. **A migration column** — which O-numbered `TODO.md` item fixes each row, so this doubles as
   a work-breakdown rather than only a finding. I've cross-referenced where an item already
   exists (O1, O7, O9); most fabricated formulas here don't have one yet.
3. **Fold in the derived-metrics SQL, once O2 lands** — `03_derive_metrics.sql` should
   reproduce Part 1's Python formulas exactly. When it exists, this document is the place to
   confirm the SQL and Python versions agree, rather than trusting that they do.

I'd hold off adding those until the team has been through this once — assigning target formulas
and owners is a decision for the metrics meeting (M2), not something to pre-empt here.
