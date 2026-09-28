# Product Lifecycle & Portfolio Intelligence — where we are, and what we need decided

**Date:** 21 September 2026
**From:** Guna
**For:** Lab 8 program owners
**Read time:** ~6 minutes. The questions in Part 3 are the point.

---

## Part 1 — Where the build actually is

The dashboard is real and runs. Three personas, twelve tabs, forty-three overlays, a
persona-aware shell with deep-linkable URLs. As of this week it also has a real data spine:

| Piece | State |
| --- | --- |
| Synthetic FMCG dataset | **Done** — 119 SKUs, 7 markets, 4 channels, 2 years |
| Statistical validation | **Done** — 16 reconciliation targets, 16 pass |
| PostgreSQL warehouse | **Done** — 13 tables, 368,013 fact rows, loaded and reconciled |
| Backend API | **Not started** — decided as Python / FastAPI |
| Dashboard reading from the database | **Not started** |

That last row is the honest headline. The database reconciles to the penny — 2025 net sales
$473.0M, growth +8.29%, margin 38.55% — and **the application cannot see any of it**. The UI
still renders numbers compiled into its own bundle. Connecting the two is the next build
phase, and it is mostly mechanical.

What is *not* mechanical is a set of product questions that keep resurfacing. We have been
answering them by inference. They need answering by decision.

---

## Part 2 — The three reports, in brief

A three-part review was completed on 17 September. Each is published in full; this is the
one-paragraph version.

### 1 · Metric Dictionary — *what every number means and why we calculate it*

Defines all displayed metrics with their formula, source and business justification.

**What it found:** of the **six KPIs the brief requires, two are properly computed.** Revenue
and margin each carry two competing definitions that appear on different screens — the
portfolio reads `$473M` in one place and `$851M` in another; margin `38.55%` against `36.2%`.
Global search returns both answers side by side. Partial wiring made this worse, not better,
because it created a second source of truth instead of replacing the first.

### 2 · Twelve Tabs to Five — *per-persona audit of every tab*

Walks all twelve tabs for each of the three personas and asks whether each earns its place.

**What it found:** the brief specifies **exactly five domain tabs; we have twelve.** Several
exist in duplicate — a "VP" variant and a standard variant of the same view. At least one
persona is served the wrong lens. The recommendation is a staged consolidation, not a rebuild:
the underlying components are sound, the navigation is overloaded.

### 3 · Worth Building? — *the competitive landscape*

Assesses the incumbents and asks whether this is worth building at all.

**What it found:** the honest answer depends entirely on what we think we are building — which
is the first question in Part 3, and the reason this document exists.

**Full versions:** [1 · Metric Dictionary](https://docs.google.com/document/d/1v6Cre0WwNMBg4qI6fbdkA3i5MbfkgVBU7zXhbe2Lhbs/edit) ·
[2 · Twelve Tabs to Five](https://docs.google.com/document/d/1pfcD4hJ0GjJB3gwQFjWYSFSs4loJoim6VinqQXQo2-U/edit) ·
[3 · Worth Building?](https://docs.google.com/document/d/1ZvMTreERw_DFyEpnYKbw04bhLigSEC7Xy2iWUvch85w/edit)

---

## Part 3 — What we need decided

Ordered by how much each unblocks. Every one has a recommendation, so a simple "agreed" is a
sufficient answer.

### The question underneath all the others

**Q1. Is this a capability showcase, or a product that competes?**

This is the one that decides the rest. Three coherent answers:

| | What it means | What it costs |
| --- | --- | --- |
| **A. GTM demo asset** | A credible, explainable demo that opens VP-level conversations. Never touches client data | Weeks. Synthetic data is fine; realism matters more than coverage |
| **B. Internal accelerator** | A starting codebase we fork per engagement with the client's own extracts | Months. Needs ingestion, configurability, per-client deployment |
| **C. Product** | Sold and supported against Nielsen, Circana, o9 | Years, and a different team |

We have been building as though the answer is **A** while occasionally arguing as though it is
**C** — that tension is exactly what report 3 could not resolve on its own. Competing on data
breadth against firms whose core asset *is* the panel data is not winnable. Competing on
**explainability and speed to insight** is.

**Recommendation: A**, with the codebase kept clean enough that B stays open.

**Why it blocks:** the answer changes how much we invest in ingestion, whether real-data
security work starts now, and whether the competitor feed below is needed at all.

---

### Metric integrity — the demo's credibility rests here

**Q2. Which revenue baseline is canonical — $473M or $851M?**

Both appear in the UI today. The `$851M` figure is the *more* widespread (18 source locations
against 6), but `$473M` is the one the validated dataset actually produces.

**Recommendation:** $473M becomes the single baseline; retire $851M everywhere.
**Blocks:** the metric registry, and therefore every downstream number.

**Q3. Two of the six required KPIs have no data behind them.**

Time-to-market and launch success rate need launch gate dates. Verified in the warehouse:
**119 SKUs, 0 with a launch date.** These cannot be computed today at any level of effort.

Options: (a) add a launch table with synthesised gate dates, (b) drop both KPIs and tell the
brief owner why, (c) source real launch data.

**Recommendation: (a)** — roughly two days, and it makes the Launch Readiness tab mean
something.

**Q4. Three profit cards have no cost basis.**

Gross Profit, Net Profit and SG&A Overhead are displayed. The warehouse has **zero** SG&A,
opex or overhead columns — verified. These numbers are not derivable from any data we hold.

**Recommendation:** remove the three cards, or extend the model to carry an opex basis. Showing
a Net Profit we cannot defend is the single most likely thing to end a client demo badly.

**Q5. Twelve of twenty metrics are designed but have no value.**

`KPICard.tsx` defines styling, targets and sparkline history for **20** metric labels.
`data.ts` supplies a value for **8**. That gap is why KPI strips render empty on four tabs and
one card short on two others.

**Recommendation:** compute the ones that map to real data; delete the rest. Either is fine —
leaving them half-built is not.

**Q6. Our data contradicts the source on Netherlands margin.**

The source research documents Netherlands as the **lowest**-margin market at 38.20%. Our
generated warehouse makes it the **highest at 40.27%** — an artefact of which SKUs are listed
there, and validation did not catch it because it checks revenue share, not margin order.

**Which is authoritative?** If the source is right, the generator needs a constraint and a new
assertion. If the source figure was itself an artefact, we should say so and move on.

---

### Product shape

**Q7. Which five tabs?**

Twelve today, five required. We can propose a shortlist, but the brief owner should sign it
off before we start deleting navigation.

Related and smaller: **Product Manager currently receives the VP's Launch Readiness view.** We
cannot tell from the code whether that is deliberate. Is it?

**Q8. Real brands are in the demo data — more than first reported.**

Verified in the warehouse: **seven real brands** are in the SKU list — Coca-Cola, Sprite,
Thums Up and Pulpy Orange (all Coca-Cola Company), 5-Star, Munch, and "Foorti" (a misspelling
of Frooti). All seven arrived in a single commit on 13 July. Separately, the Signals Board's
pricing simulator models price elasticity for **Pepsi, Mountain Dew and Lay's** by name.

Simulating a named company's pricing in front of an FMCG client — possibly that company's
competitor, possibly the company itself — is the riskier of the two.

**Recommendation:** rename all of them to fictional brands. About half a day, and I will do it
unless told otherwise.

---

### Delivery

**Q9. When is the first demo, and to whom?**

The programme plan's timeline begins 21 June 2026 — three months in the past. Without a real
date we cannot sequence the remaining work or tell you what will not be ready.

**Q10. Where does this run, and what is the LLM budget?**

The frontend is on Vercel as a static site. A Python backend needs somewhere to live, and the
warehouse needs somewhere that is not a laptop. The agent tier's model choices and costs in
our own architecture document are now dated and should be re-priced before anyone quotes a
monthly figure.

Our design keeps **all arithmetic in SQL and Python, with the LLM only explaining results it
is handed** — that holds cost down and keeps numbers reproducible. Worth confirming that
principle is agreed, because it constrains agent design.

**Q11. Does the Signals Board need a real competitor feed?**

It currently shows competitor pricing and market signals from authored content. A real feed is
a second data source with its own grain, refresh cadence and licensing — not a derivation from
sales data. Under answer **A** to Q1 we can leave it illustrative and say so. Under **B** or
**C** it is a substantial workstream.

**Q12. Is the project repository public?**

A database password was committed in September and is present in pushed history. It protects
nothing today — the credential has been rotated and the account it referenced was never
created. But if the repository is publicly visible, that changes the follow-up, and we should
confirm either way.

---

## Part 4 — What happens if we hear nothing

So work does not stall, these are the defaults we will proceed on. Any of them can be
overridden later at low cost.

| Question | Default |
| --- | --- |
| Q1 Positioning | Build as a GTM demo asset |
| Q2 Baseline | $473M becomes canonical |
| Q3 Launch KPIs | Add a synthetic launch table |
| Q4 Profit cards | Remove them |
| Q5 Orphan metrics | Compute what maps to data, delete the rest |
| Q6 Netherlands | Treat the source as authoritative; add a validation check |
| Q8 Real brands | Rename all to fictional brands |
| Q11 Competitor feed | Keep illustrative, label it as such |

The ones we genuinely cannot default are **Q7 (which five tabs)**, **Q9 (demo date)** and
**Q10 (hosting and budget)**. Those need an owner.

---

## The short version

The engineering is in good shape and the data spine is now real. What is missing is not
capability — it is agreement on what this is for. Answer Q1 and most of the rest follows.
