# Report 1 of 3 — Portfolio Metric Dictionary

**17 September 2026.** Every metric the Product Lifecycle & Portfolio Intelligence lab
calculates: what it means, how it is computed, and the decision that justifies calculating it
at all. 30 metrics across 7 families, values from the 368,013-row dataset, checked against the
Lab 8 brief.

**Original:** [claude.ai artifact](https://claude.ai/artifact/Q1JmpLj6Ly9chiGP2sH4Ci) ·
[Google Doc](https://docs.google.com/document/d/1v6Cre0WwNMBg4qI6fbdkA3i5MbfkgVBU7zXhbe2Lhbs/edit)

> This is a point-in-time snapshot (17 Sep 2026), saved locally so it survives a fresh clone.
> Later work has resolved some of what it flags — see `../../../TODO.md` for current state,
> and the note at the bottom of this file.

---

## The verdict

| | |
| --- | --- |
| **Keep as defined** | 15 |
| **Fix definition or value** | 9 |
| **Add — missing** | 5 |
| **Cut or source data** | 1 |

The justification test used throughout: **a metric earns its place only if it changes a
decision someone in the lab has to make.** Each one below is tied to the scorecard question it
answers from the Lab 8 brief — the program's own evaluation criteria.

## Key findings

1. **Only 2 of the brief's 6 required KPIs are properly computed.** Product/SKU margin and the
   Portfolio Complexity Index are live. Time-to-market, launch success rate and SKU
   productivity are absent. Cannibalization rate exists only as a hardcoded `78.5%` with no
   formula behind it.
2. **Revenue and margin each have two competing values.** Net sales is `$473M` in the KPI
   strip and `$851.2M` on the VP views — and `$851.4M` elsewhere, labelled month-to-date in
   one place and 2026 year-to-date in another. Gross margin is `38.55%` and `36.2%`. Global
   search lists both answers side by side.   
3. **Partial data wiring created new conflicts.** The KPI strip now shows the computed
   `46 SKUs` and `15.79%` tail risk. The Launch tab, search, agent chat and the audit drawer
   that explains that very card still say `35 SKUs` and `27.08%`.
4. **Four KPI strips never render.** Tabs 5, 6 and 7 filter for labels with no value in the
   KPI set; tab 1 excludes all three roles; tabs 4 and 8 render one card short. The missing
   metrics — Customer Sentiment Score, Competitor Alerts, Avg Complexity and others — already
   have card styling, targets and audit handlers built. They were designed and never wired to
   a value.
5. **Two metrics can't move the way they appear to.** Long-Tail Burden uses a 1% threshold,
   but the average SKU holds 0.84% — so an *average* SKU counts as tail. And two of the PCI's
   six sub-drivers are fixed by configuration, so a third of the index cannot respond to
   anything.

---

## The six KPIs the brief requires

The Lab 8 brief states each of these *"should appear in at least one tab with a realistic
simulated value."*

| Required KPI | Status | Can the dataset produce it? |
| --- | --- | --- |
| Product / SKU margin | COMPUTED | Yes — per-SKU gross margin % |
| Portfolio complexity index | COMPUTED | Yes — 0.5961, though two drivers are fixed |
| SKU productivity | ABSENT | **Yes, today** — $473M ÷ 119 = $3.97M per SKU |
| Cannibalization rate | HARDCODED | Partly — pairwise correlation exists, but not a rate |
| Time-to-market | ABSENT | **No** — `launch_date` is empty on all 119 SKUs |
| Launch success rate | ABSENT | **No** — needs a launch table the schema defers |

**The fastest fix:** SKU productivity needs no new data — it is one division on figures already
computed. The two launch KPIs are the real gap: they depend on the launch pipeline entity that
`data_model_specification.md` §11 deferred.

---

## The dictionary

Values are for 2025, the report year. **COMPUTED** means derived from the dataset;
**ESTIMATED** means a modelled proxy; **HARDCODED** means a literal typed into the code.

### A. Commercial scale
*How big the portfolio is, whether it is growing, and how evenly revenue is spread.*

**Net Sales** — FIX, COMPUTED, $473.0M
- Definition: Revenue after promotional discount, for the report year.
- Formula: `SUM(fact_sales.net_sales) WHERE year = 2025`
- Why: The denominator for every share, ratio and risk figure in the lab. Sizes the prize a VP is managing.
- Fix: Retire the **$851.2M / $851.4M** baseline. The dataset reconciles to $473M; the other figure has no source.

**Year-on-Year Growth** — KEEP, COMPUTED, +8.30%
- Formula: `(net_sales_2025 − net_sales_2024) / net_sales_2024`
- Why: Separates growing SKUs from declining ones — the basis for placing a product in a lifecycle stage.
- Answers: Scorecard Q1 — performance by lifecycle stage in one view.

**SKU Productivity** — REQUIRED, ADD, ABSENT, $3.97M
- Definition: Revenue earned per active SKU.
- Formula: `net_sales / COUNT(dim_sku WHERE is_active)`
- Why: The single clearest proliferation signal. If SKU count grows faster than revenue, this falls — complexity is being added without proportional value.
- Answers: Scorecard Q2 — which SKUs add complexity without proportional value.

**Revenue Concentration** — KEEP, COMPUTED, 28.01% / 48.80% / 63.10%
- Definition: Share of revenue from the top 10%, 20% and 30% of SKUs.
- Formula: `SUM(top N% revenue_share_pct)`, ranked descending
- Why: Identifies the hero SKUs that must be protected during supply shocks and never swept up in a rationalization cut.

**Long-Tail SKU Burden** — FIX, COMPUTED, 72.3% · 86 SKUs
- Formula: `COUNT(revenue_share_pct < 0.01) / COUNT(sku)`
- Why: Sizes the pool of rationalization candidates.
- Fix: With 119 SKUs the **average share is 0.84%** — below the 1% line. The metric counts a typical SKU as tail and will stay above 70% regardless of performance. Define the tail by cumulative revenue instead: *SKUs making up the bottom 5% of revenue*.

### B. Profitability
*Where margin is made, where it leaks, and what the data can and cannot support.*

**Portfolio Gross Margin** — FIX, COMPUTED, 38.55%
- Formula: `SUM(gross_margin) / SUM(net_sales)`
- Why: The headline profitability figure, read against the 40% benchmark. Revenue-weighted, so large SKUs dominate it.
- Fix: Retire the hardcoded **36.2%** on the VP profitability view and in search.

**SKU Gross Margin** — REQUIRED, KEEP, COMPUTED
- Formula: `sku_metrics.total_gross_margin / total_net_sales`
- Why: Finds the margin-dilutive SKUs a pricing partner should act on first.
- Answers: Scorecard Q5 — profitability visible at SKU level.

**Promotional Margin Erosion** — KEEP, COMPUTED
- Formula: `(margin_non_promo − margin_promo) × 100`, in points
- Why: Shows which promotions buy volume by giving away more margin than they return.

**Value-Diluting SKUs** — FIX, HARDCODED, "12 SKUs"
- Why: A short target list for pricing review — worth having.
- Fix: No threshold is defined anywhere. Specify it — e.g. *top-quartile revenue AND margin below 40%* — then compute.

**Gross Profit, Net Profit, SG&A** — CUT, HARDCODED, $308.1M · $95.2M · $117.7M
- Why: Standard P&L lines, useful to a VP in principle.
- Problem: The dataset has **no SG&A, operating expense or net-profit column**. These three figures cannot be computed and are built on the $851M baseline. Cut them, or add a cost table.

**Cost-to-Serve** — ADD, ABSENT
- Definition: Logistics, handling and channel cost attributed to each SKU.
- Why: The brief defines the Profitability Tree as a *"cost-to-serve breakdown."* Gross margin alone hides SKUs that are profitable on paper and loss-making once delivered.
- Needs: Freight and handling cost by SKU and channel — not in the current schema.

### C. Portfolio complexity
*Whether the portfolio carries more variety than its revenue justifies — and what to cut.*

**Portfolio Complexity Index** — REQUIRED, FIX, COMPUTED, 0.5961 · target 0.42
- Formula: `MEAN(6 normalised sub-drivers)`
- Why: One board-level number that shows whether simplification is working over time.
- Fix: **Supplier fragmentation (1.20) and SKU proliferation (1.02) are fixed by configuration**, not measured — a third of the index cannot move. Compute both from the data.

**Commercial Value Score** — KEEP, COMPUTED, 0–1
- Formula: `MEAN(norm(revenue), norm(margin), norm(growth), norm(1 − CV))`
- Why: The horizontal axis of the Keep / Grow / Consolidate / Rationalize matrix. Disclose the equal weighting in the UI.

**Operational Complexity Score** — KEEP, COMPUTED, 0–1
- Formula: `MEAN(norm(lead time), norm(promo dep), norm(stockouts), norm(volatility))`
- Why: The vertical axis. Note demand volatility sits in *both* scores, which builds in a negative correlation.

**Portfolio Segment** — KEEP, COMPUTED, 46 / 14 / 13 / 46
- Definition: Keep, Grow, Consolidate or Rationalize, by median split on both scores.
- Why: Turns two scores into an action. This is the step where analysis becomes a decision.

**Operational Burden Ratio** — KEEP, COMPUTED
- Formula: `operational_complexity_score / commercial_value_score`
- Why: Ranks candidates within Rationalize — decides the order of cuts.

**Rationalize Candidates** — FIX, COMPUTED, 46 SKUs
- Why: The size of the action list.
- Answers: Scorecard Q7 — how quickly you can identify what to rationalize.
- Fix: Launch tab, search, agent chat and audit drawer still say **35 SKUs**.

**Revenue Tail Risk** — FIX, COMPUTED, 15.79%
- Formula: `SUM(revenue_share_pct) WHERE segment = 'Rationalize'`
- Why: The cost of acting: what a full sunset puts at risk before any demand transfers to surviving SKUs.
- Fix: Four other places still say **27.08%**.

### D. Supply chain
*Availability, responsiveness, and the working capital locked in safety stock.*

**Stockout Events** — KEEP, COMPUTED, 33,052 · peak 440
- Formula: `SUM(stock_out_flag)`, by SKU and channel
- Why: Lost sales plus retailer penalties. Stockouts concentrated in low-value SKUs are an argument to rationalize them.

**Lead Time** — KEEP, COMPUTED
- Why: Drives how much safety stock a SKU needs, and how fast supply can react to a launch.

**Safety Stock & Capital Freed** — KEEP, ESTIMATED
- Formula: `lead_time_days × demand_std`
- Why: The financial prize of rationalization — the argument that wins budget.
- Caveat: There is **no inventory data**. Label this as a modelled estimate wherever it appears.

**Inventory Carrying Cost** — KEEP, ESTIMATED
- Formula: `0.20 × safety_stock_proxy`
- Why: Converts inventory into annual cost. The 20% rate is an industry rule of thumb — directional only.

### E. Demand & promotion
*How predictable demand is, and how much of it depends on discounting.*

**Promo Dependency** — KEEP, COMPUTED, max 28.06%
- Formula: `promo net_sales / total net_sales`, per SKU
- Why: A SKU that only sells on discount has weak brand equity and a margin problem waiting to surface.

**Demand Volatility (CV)** — KEEP, COMPUTED, 92 Stable · 27 Variable
- Formula: `std(monthly units) / mean(monthly units)`
- Why: Forecastability. Volatile SKUs need more safety stock, which raises their true cost.

**Seasonality Index** — KEEP, COMPUTED
- Why: Separates genuine seasonal swings from structural decline — prevents cutting a SKU in its off-season.

### F. Launch
*The weakest family. The brief's core problem is "slow launch decisions", yet neither launch KPI it requires exists.*

**Time-to-Market** — REQUIRED, ADD, ABSENT
- Definition: Days from concept approval to first shipment.
- Formula: `first_ship_date − concept_gate_date`
- Why: The direct measure of the problem the lab exists to address.
- Needs: A launch table with gate dates. `launch_date` is empty on all 119 SKUs.

**Launch Success Rate** — REQUIRED, ADD, ABSENT
- Definition: Share of launches reaching their revenue target six months after launch — the brief's own definition.
- Formula: `COUNT(rev_6mo >= target_6mo) / COUNT(launches)`
- Why: Tells a VP whether the launch process picks winners. Without it, readiness scores are never checked against outcomes.
- Answers: Scorecard Q3 — whether launch decisions are supported by real signals.

**Launch Readiness %** — FIX, HARDCODED, "82%"
- Why: The go/no-go gate across market, supply, channel and pricing. Correct metric for the tab.
- Fix: Hardcoded. Also, three of the four cards beside it on the Launch tab — tail risk, peak stockout, rationalize candidates — are portfolio metrics, not launch metrics. Replace them with time-to-market and success rate.

### G. Market & voice of customer
*Signals from outside the business — which the internal sales dataset cannot supply.*

**Cannibalization Rate** — REQUIRED, FIX, HARDCODED, "78.5%"
- Definition: Share of a new or promoted SKU's volume taken from existing SKUs rather than won from competitors.
- Formula: `volume lost by siblings / volume gained by the SKU`
- Why: A launch that cannibalizes 78% of its volume adds cost, not growth.
- Fix: The lab computes pairwise promo-to-units **correlation** (−0.58 at strongest) — a signal, not a rate. The displayed 78.5% has no formula.
- Answers: Scorecard Q4 — predicting cannibalization before a launch.

**Sentiment, Competitor Price Index, Demand Change** — ADD, ABSENT
- Why: The brief's Signal Board is built around customer sentiment and competitor moves.
- Problem: Card styling, targets and history already exist in `KPICard.tsx`, but no value exists in the KPI set the tab 5 and tab 7 strips read — so both render empty. A real value needs external sources — reviews, pricing feeds, search trends — that the FMCG dataset doesn't contain.
- Answers: Scorecard Q6 — VoC and competitor signals connected to decisions.

---

## One metric, several numbers

The same concept currently shows different values depending on where you look. Each row needs
resolving to one source.

| Metric | Values in the app | Where |
| --- | --- | --- |
| Revenue | $473M · $851.2M · $851.4M | KPI strip; VP views & search; audit drawer, called both "MTD" and "2026 YTD" |
| Gross margin | 38.55% · 36.2% | KPI strip; VP profitability & search |
| Rationalize candidates | 46 · 35 | KPI strip; Launch tab, search, agent chat, audit |
| Revenue tail risk | 15.79% · 27.08% | KPI strip; Launch tab, search, agent chat, audit |
| Active SKUs | 119 · 102 · 100 | Dataset; README; VP KPI base |
| Snacks revenue | $118.6M · $260M | Two audit entries, following the two revenue baselines |
| Lowest-margin market | Italy 38.24% · Netherlands 38.20% | Generated data; agent chat |

**A regression from the generator.** The last row is the report's own finding. The source
documents the Netherlands as the lowest-margin market; the generated data makes it the
**highest** at 40.29%, because listing only top-ranked SKUs there raised its average. The
validation suite checked each market's revenue share but not its margin order, so it passed.
It needs a check added. *(Still open as of 1 Oct — this is TODO.md's O3.)*

**Two data-quality notes.** Three of the five top SKUs by revenue are **apparel** — jeans,
sneakers, a T-shirt — in a portfolio presented as FMCG. And the SKU list includes a real
trademark, **"Coca-Cola 500ml,"** in a demo shown to senior leaders. Both come from the
original 119-SKU seed list. *(The trademark issue is still open as of 1 Oct — confirmed still
present by direct grep — this is TODO.md's O9.)*

---

## What to do

| Priority | Action | Effort |
| --- | --- | --- |
| 1 | **One metric registry.** Every card, search result, agent reply and audit entry reads its value from one place. This is what stops the list above from growing. | 2–3 days |
| 2 | **Retire the $851M / 36.2% baseline** and the P&L lines built on it. | 1 day |
| 3 | **Add SKU productivity** — computable today. | Hours |
| 4 | **Add a launch table** so time-to-market and launch success rate can be computed. | 2 days |
| 5 | **Redefine** long-tail burden and cannibalization rate; compute the two fixed PCI drivers. | 1 day |
| 6 | **Repair the KPI strips** on tabs 1, 4–8, and add a country-margin check to validation. | Hours |

---

## What's changed since 17 Sep (as of 1 Oct 2026)

This report is a snapshot; it was not regenerated when the build moved. For current status on
each item above, see `TODO.md`. In outline: the database went live and got wired to the app
(29 Sep) — the KPI strip, Home, Portfolio Health and SKU Rationalization now correctly read
$473M, resolving priority 2 *in those places*. But `$851.2M`/`$851.4M` are still live in the VP
Profitability tree simulator, a KPI tooltip, and — matching this report's own "revenue... in
search" finding almost exactly — global search and the audit drawer still return the old
figure as a literal result. Priority 1 (one metric registry) has not been built. Priorities 3–6
remain open. The real-brand and Netherlands-margin findings are both still live, unaddressed.
