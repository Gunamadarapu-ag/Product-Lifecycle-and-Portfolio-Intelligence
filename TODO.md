# TODO — Data Layer Migration

Tracking the move from hardcoded constants to a generated, validated dataset and a
PostgreSQL database.

**Last updated:** 22 September 2026
**Branch:** `Branch_G` (pushed to `origin`) — `refactor/cleanup-and-architecture` also exists locally

---

## Status at a glance

| Phase | State |
| --- | --- |
| 1. Schema design | **Done** |
| 2. Dataset generation | **Done** — 16/16 targets pass |
| 3. Dashboard wiring (partial) | **Done** — 7 arrays live |
| 4. Database | **Done** — 20 Sep, loaded and reconciled |
| 5. Dashboard wiring (SKUS) | **Open** — needs threshold audit |
| 6. Repo cleanup | **Blocked** — permissions |
| 7. Product review — metrics, tabs, competitors | **Done** — 3 reports, 17 Sep |
| 8. Metric integrity | **Open** — see O7 |
| 9. Tab consolidation, 12 → 5 | **Open** — see O8 |
| 10. Repo cleanup, phases A and B | **Done** — 20 Sep, 187 files removed |
| 11. Phase C — split the giant files | **Done** — 20 Sep, 9 files split into 30 |
| 12. Backend language | **Decided** — 20 Sep, Python/FastAPI; Node backend deleted |
| 13. Python dependencies pinned | **Done** — 20 Sep, `requirements.txt` |

---

## Cleanup done — 20 September

Uncommitted; `tsc --noEmit` clean and production build passing.

| Change | Detail |
| --- | --- |
| Root scratch files | 144 → **11** tracked files. Removed 133 Puppeteer/Python/PowerShell scripts, text dumps and duplicated HTML/PDF |
| Scratch directories | `.gemini/` (38 files) and `extracted_tabs/` (6) |
| Orphaned components | 10 files, **2,158 lines** — 6 launch-readiness, 3 profitability, `SKUSubNav`. None imported anywhere |
| `PortfolioHealthMapOld` | **1,289 lines** of dead code inside a live file, unreachable since 16 June |
| Unused helpers | `updateHash`, `getFilteredChannelData`, `getFilteredStockoutTop10` |
| **Total** | **187 files removed**, ~3,500 lines of dead `src/` code |

`PortfolioHealthMap` chunk fell from 150 kB to **106 kB**.

## Phase C — giant files split, 20 September

Pure restructuring: every block moved verbatim, verified line-by-line against `HEAD`.

| File | Before | After | New modules |
| --- | ---: | ---: | --- |
| `SignalsBoard.tsx` | 3,981 | **1,304** | `signalsData`, `alertExplainers`, `CompetitiveIntelligenceModal`, `PortfolioDeepDiveModal`, `RegionalAlertsModal`, `VPSignalsBoardView` |
| `RationalisationTab.tsx` | 2,596 | **1,079** | `rationalisationData`, `rationalisationHelpers`, `RationalisationCharts`, `RationalisationDrillDowns` |
| `AgenticAlertExplanationModal.tsx` | 3,473 | **2,808** | `agenticAlertData` |
| `VPLaunchReadinessView.tsx` | 2,660 | **2,418** | `launchData` |
| **Total** | **12,710** | **7,609** | 4 files → 16 |

**More dead code found and removed** — 162 lines in `RationalisationTab`:
`ACTION_RECOMMENDATIONS`, `HEATMAP_DATA`, `EXPLORER_ROWS`, `SUMMARY_KPIS` and
`CustomHeatmapTooltip`. All declared, never read — the heatmap feature they belonged to is
gone. (`DemoTab` has its own `EXPLORER_ROWS`; it never imported this one.)

**New: `npm run smoke`** — `scripts/smoke.mjs` drives the built app in a headless browser
across all 3 personas × 9 tabs and fails on any console error, page error or blank render.
Compilation does not prove a lazy-loaded chunk renders; this does. Currently **27/27 pass**.

### Second pass — five more files

Using a generic splitter that derives exact ranges from a full declaration scan and
computes each new module's imports from the identifiers it actually uses.

| File | Before | After | New modules |
| --- | ---: | ---: | --- |
| `CategoryPerformanceDetailsModal.tsx` | 1,790 | **197** | `categoryDetailsData`, `categoryHelpers`, `SkuAnalysisModal` |
| `ProfitabilityTree.tsx` | 2,081 | **426** | `profitabilityData`, `VPProfitabilityTreeView` |
| `PortfolioHealthMap.tsx` | 2,663 | **1,334** | `LifecycleHealthPanel`, `InvestmentMarginMap`, `RevenuePerformanceMatrix` |
| `DemoTab.tsx` | 1,233 | **777** | `demoTabData`, `demoTabHelpers`, `DemoTabCharts` |
| `ExecutiveOverview.tsx` | 2,142 | **1,511** | `executiveData`, `MonthForecastModal` |

**More dead code removed:** `CustomSKUType` (12) and `CUSTOMER_INSIGHTS_DATA` (148) —
declared, never read.

**One real duplicate removed:** `DemoTab` carried a byte-identical copy of
`generateTasksForSku` (48 lines, 100% match). It now imports the shared one.
`getRcaDetails`, `MarginWaterfallChart` and `SkuCategoryBenchmarks` also exist in both
places but differ (34–77% similar), so they are **variants, not duplicates** — merging
them would change behaviour and was left alone.

**Smoke test made stable.** `ProductMixClustering`'s ScatterChart intermittently logs
`<circle> attribute cx: Expected length, "undefined"` when `ResponsiveContainer` measures
zero width on first paint. Pre-existing and cosmetic, but it made the test flaky, so a
combination is now retried once and only a repeat failure counts. Three consecutive
clean runs.

The two modals and `VPLaunchReadinessView` shrank less because their remainder is one
contiguous JSX return. Splitting those means extracting panel sub-components and threading
props — real refactoring, not a move, so it was left out of this pass.

**Decided and done — `server.ts` deleted (20 Sep).** The user confirmed the backend will be
**Python**, which settled it: an orphaned Express API is not the seed of a FastAPI layer.

Two corrections to what this entry previously claimed:

- It named twelve `data.ts` constants as server-only. `server.ts` actually imported **ten**,
  and six of the names listed (`LAUNCH_PRODUCTS`, `LAUNCH_TIMELINE`, `SEGMENT_COLORS`,
  `PROMO_EROSION_DATA`, `SKU_BURDEN_DATA`, `SIGNALS`) **do not exist anywhere in the repo** —
  zero references, no declaration. The note was written from a stale reading.
- Of the ten it did import, four (`KPIS`, `PORTFOLIO_DATA`, `REGIONAL_DATA`, `AGENT_ROSTER`)
  are live in components and were never at risk.

**What was removed**

| Item | Detail |
| --- | --- |
| `server.ts` | 205 lines, Express, no npm script started it |
| `COMPANY_CONTEXT` | Dead once the server went — and wrong: it read "100 SKUs" against a 119-SKU dataset |
| `express`, `@types/express` | Only `server.ts` used them |
| `dotenv` | Declared but imported by **nothing**, not even `server.ts` |
| `tsx` | Declared but referenced by no script |
| `@google/genai` | Imported nowhere. With the LLM tier moving to Python it would also have meant shipping a Gemini key in a static bundle |
| `vite` duplicate | Was listed in **both** `dependencies` and `devDependencies` |
| `puppeteer` | Moved to `devDependencies` — it is a test tool, not a runtime dep |
| `"clean"` script | Targeted `server.js`, a build output no script produces |

**Net:** 124 npm packages removed. `tsc --noEmit` clean, production build clean,
`npm run smoke` 27/27.

**Kept deliberately.** The five `data.ts` aliases of computed arrays (`CHANNEL_DATA`,
`STOCKOUT_TOP10`, `RATIONALIZATION_SCENARIOS`, `PCI_DRIVERS`, `TOP_SKUS_REVENUE`). Deleting
`server.ts` exposed that these were its *only* consumers — see O7 below, which this makes
considerably more concrete.

## Python dependencies pinned — 20 September

`requirements.txt` added at the repo root. There was none, so the dataset was reproducible
only on this machine.

Versions are pinned **exactly**, not with `>=`. The generator is deterministic — every RNG
is seeded with `20260909` and `validate.py` asserts 16 reconciliation targets — so a
different NumPy or SciPy can move a target outside tolerance and silently produce a
different dataset. All eight pins were verified against what is installed.

| Group | Packages |
| --- | --- |
| Generator | `pandas==3.0.2`, `numpy==2.4.4`, `scipy==1.17.1`, `pyarrow==23.0.1` |
| Loader | `psycopg2-binary==2.9.11` (imported lazily; generator runs without it) |
| FastAPI backend | `fastapi==0.136.0`, `uvicorn==0.44.0`, `pydantic==2.13.2` |

Two things deliberately **not** pinned: `SQLAlchemy` (installed but imported nowhere — the
loader uses raw `psycopg2` `COPY`) and `python-dotenv` (`load.py` has its own `read_env`
parser). `pyarrow` is pinned despite never being imported directly, because it backs
`fact_sales.parquet`.

Tested on CPython 3.14.4, Windows 11.

---

## Database live — 20 September

`B1 is unblocked.` PostgreSQL 17.11 on `localhost:5433` now holds the full dataset.

| Object | Value |
| --- | --- |
| Database | `ppl_intelligence` (created by hand as `Pd_lc_app`, renamed by the script) |
| Owner / app role | `Pd_lc_app` — LOGIN, not superuser |
| Credentials | `.env` only (gitignored) |
| Rows loaded | **377,364** across 13 tables, in 44.9s |

**Reconciliation against the generator's targets — all pass:**

| Check | Target | In the database |
| --- | --- | --- |
| 2025 net sales | $473.0M | $473.0M |
| YoY growth | +8.3% | +8.29% (436.8M → 473.0M) |
| Avg gross margin | 38.53% | 38.55% |
| SKUs / brands / categories | 119 / 6 / 7 | 119 / 6 / 7 |

### Two bugs found by actually running the scripts

1. **`00_create_role.sql` had never worked.** It wrapped `:'app_password'` in a
   `DO $$ ... $$` block, but **psql does not substitute `:variables` inside dollar-quoted
   strings** — it treats the body as one literal. The variable reached the server verbatim
   and failed with `syntax error at or near ":"`. Rewritten as `SELECT format(...) \gexec`,
   which keeps the variables in plain SQL text. This latent bug survived because the file had
   never been executed.
2. **Mixed-case identifiers.** `CREATE ROLE Pd_lc_app` unquoted folds to `pd_lc_app`, after
   which `-U Pd_lc_app` fails with "role does not exist". All identifiers now go through
   `format('%I')`, which quotes only when required. Verified: the role connects by its
   exact case.

The script is now fully parameterised (`-v app_user`, `-v app_db`, `-v app_password`) so it
tracks `.env` instead of drifting from it, and both schema files carry cmd.exe invocation
lines rather than PowerShell ones.

**Stale reference:** `01_schema.sql` ends by pointing at `02_seed_dimensions.sql`, which does
not exist. `load.py` does that job. Harmless, but the message should be corrected.

---

## Security

### S1 — Database password committed in `a3a3c54` — **escalated 20 Sep**
The `ppl_app` password was written in plain text into this file and committed.

**The earlier containment note was wrong.** It said "the branch has never been pushed."
Verified on 20 September:

| Check | Result |
| --- | --- |
| Is `a3a3c54` an ancestor of `origin/Branch_G`? | **Yes** |
| Does `origin/Branch_G` exist on GitHub? | **Yes** — `Gunamadarapu-ag/Product-Lifecycle-and-Portfolio-Intelligence` |
| Where is the plaintext? | `TODO.md` lines 64 and 67 of `a3a3c54` |
| Is it at the current tip? | No — removed 17 Sep, but history retains it |
| Branches carrying it | `Branch_G`, `refactor/cleanup-and-architecture` |

So the secret **has left this machine**. Anyone who can read that repository can recover it
with `git show a3a3c54:TODO.md`. Removing it from the tip did not remove it from history.

**What still limits the damage:** the `ppl_app` role has never been created, so the value
currently unlocks nothing. That holds only until someone creates the role with that password.

- [ ] **Never use this password.** Generate a fresh one when creating the role — treat
      `2GuYYX4LFOJmpdsQL7dhihWG` as burned. This is the single most important step and it
      costs nothing.
- [ ] **Confirm the repository's visibility.** If `Gunamadarapu-ag/...` is public, the value
      should be considered disclosed to anyone, and any *other* place it was reused needs
      changing too.
- [ ] **Decide whether to purge history.** Only worth the disruption if the value was reused
      elsewhere; otherwise generating a new one is sufficient. Purging means a force-push
      (`git filter-repo`), which rewrites commits others may have pulled.
**Status 20 Sep, after the database went live.** The leaked value is no longer used
anywhere: `.env` was rewritten and the `Pd_lc_app` role was created with a different
password. The leaked string remains in `origin/Branch_G` history and should still be treated
as burned.

**New finding — `pg_hba.conf` is set to `trust`.** All three local lines
(`local`, `127.0.0.1/32`, `::1/128`) use `trust`, which means **no password is verified for
any local connection, including `postgres`**. So the database password currently protects
nothing on this machine, and the S1 leak never protected anything either.

Contained by: `listen_addresses = '*'` exposes the port, but there is **no `pg_hba` rule for
non-loopback addresses**, and PostgreSQL rejects connections matching no rule. Remote access
is refused.

- [ ] **Switch the two `host` lines to `scram-sha-256`** and reload
      (`pg_ctl reload -D "C:\Program Files\PostgreSQL\data"`, Administrator). Until
      then the password in `.env` is decorative.
- [ ] **Then strengthen the app password.** The current one follows a very common pattern
      and is among the first strings any scanner tries. Harmless while auth is `trust`;
      not harmless the moment it is not.

- [ ] **Do not add the new password to any tracked file** — `.env` only (`.gitignore:7`
      covers `.env*`, verified with `git check-ignore`).

---

## Done

### Schema design
- [x] `documentation/data_model_specification.md` — 13 tables, all columns, types, PKs, FKs
- [x] `data/schema/00_create_role.sql` — role + database, password passed as a psql variable
- [x] `data/schema/01_schema.sql` — full DDL, 13 tables + matview + view
- [x] Currency resolved: **USD only**, no FX table

### Dataset generation
- [x] `data/generator/` — config, dimensions, SKU master, demand, derive, calibrate, validate
- [x] 119 SKUs extracted from `src/constants/data.ts` into `sku_seed.json`
- [x] **368,013 fact rows generated**, seed `20260909`, deterministic, 3.4s
- [x] **16/16 reconciliation targets pass** — $473M, 38.55% margin, +8.30% YoY, Pareto anchors, 440 peak stockouts
- [x] Three figures documented as recomputed (long tail, PCI, segment split)
- [x] Output written to `data/output/` — gitignored, reproducible from seed

### Dashboard wiring — phase 1
- [x] `data/generator/export_ts.py` → `src/constants/generated.ts`
- [x] `KPIS` values now computed (labels, tooltips and role highlighting stay authored)
- [x] `REGIONAL_DATA`, `CHANNEL_DATA`, `PCI_DRIVERS`, `STOCKOUT_TOP10`,
      `TOP_SKUS_REVENUE`, `RATIONALIZATION_SCENARIOS` sourced from the dataset
- [x] `tsc --noEmit` clean, production build passes

### Loader
- [x] `data/generator/load.py` — COPY in FK order, `--dry-run`, `--truncate`,
      graceful errors with next-step hints

---

## Blocked

### B1 — PostgreSQL role and database
**Blocker:** the `postgres` superuser password was rejected twice (7 Sep, 17:06 and 17:08).
Auth is `scram-sha-256`, so no connection is possible without it.

Everything needed is already written. When you have the password:

```powershell
# 0. read the app password from .env (gitignored) - never paste it into tracked files
$pw = (Select-String -Path .env -Pattern '^PGPASSWORD=(.+)$').Matches[0].Groups[1].Value

# 1. role + database  (note: port 5433, not 5432)
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U postgres -d postgres `
    -v app_password=$pw -f data/schema/00_create_role.sql

# 2. schema
$env:PGPASSWORD = $pw
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U ppl_app -d ppl_intelligence `
    -f data/schema/01_schema.sql

# 3. load
python data/generator/load.py
```

**Alternatives if the password can't be recovered:**
- Reset via temporary `trust` auth in `pg_hba.conf` (writable by this account; the
  service restart needs an admin prompt)
- Docker — already installed, sidesteps the password entirely

**Environment notes:** PostgreSQL 17.10, service `postgresql-x64-17`, **port 5433**,
`psql` not on PATH. Credentials in `.env` (gitignored).

### B2 — Remove 133 tracked scratch files
**Blocker:** bulk `git rm` is refused by the permission classifier.

133 files at repo root — Puppeteer one-offs, Python inspection scripts, text dumps —
outnumber the 109 real source files. Nothing in `src/` references any of them; the six
duplicated in `docs/`, `validation/` and `public/` are byte-identical. Also
`.gemini/antigravity/scratch/` (38 files) and `extracted_tabs/`.

Needs either your approval on the prompt or a Bash permission rule in settings.

---

## Open

### O1 — Migrate `SKUS` to generated values  *(next substantial piece)*
Deliberately left out of phase 1. Two scale conflicts must be resolved first.

**Conflict 1 — `rev` is off by ~22×.** It renders as `${sku.rev}M`, but the 119 seed
values sum to **10,608** ($10.6B) against a stated portfolio of **$473M**.

**Conflict 2 — components disagree on `stockouts`.** `ParetoConcentration.tsx:511`
tests `> 300`; `SKUHoldingsMatrix.tsx:38` tests `>= 6`. Both cannot be right.

**14 threshold comparisons** across 6 components depend on these scales:

| File | Line | Test |
| --- | ---: | --- |
| `assortment/SKUHoldingsMatrix.tsx` | 32 | `sku.rev < 85` — Netherlands listing |
| `assortment/SKUHoldingsMatrix.tsx` | 35 | `sku.rev < 48` — France/Austria/Poland listing |
| `assortment/SKUHoldingsMatrix.tsx` | 38, 39, 315 | `stockouts >= 6 / 3 / 4` |
| `assortment/ParetoConcentration.tsx` | 511 | `stockouts > 300` |
| `drilldown/DrilldownSkuGrid.tsx` | 142 | `stockouts > 2` |
| `executive/SkuDetailsModal.tsx` | 83, 237 | `stockouts > 3`, `>= 4` |
| `executive/SKUPerformanceTab.tsx` | 508 | `stockouts >= 4 / >= 2` |

**Plan:**
1. Emit `GENERATED_SKUS` with true `rev` ($M for 2025) and `stockouts` (event counts),
   plus a `revenueRank` field
2. Replace the two absolute listing thresholds with rank-based logic — the generator
   already models listing via `listed_sku_count` per market (119/114/93/52)
3. Rescale the stockout thresholds to the event-count scale
4. Typecheck, build, then check every tab renders

### O2 — Derived-metric and validation SQL
- [ ] `data/schema/03_derive_metrics.sql` — rebuild `sku_metrics`, `sku_cannibalization`,
      `portfolio_metrics` in-database
- [ ] `data/schema/04_validate.sql` — the same 16 assertions as SQL

**Held until B1 clears.** Writing them now means accumulating unverified SQL — the
derive script is the complex one (median splits, window functions, six PCI sub-drivers),
and errors would not surface until someone runs it. `01_schema.sql` (23,564 bytes) is
already unverified for the same reason.

### O3 — Fix the Netherlands margin assumption
The generation plan asserted that listing only high-revenue SKUs is what gives the
Netherlands its documented lowest margin (38.20%). **The opposite is true** — restricting
it to the top 52 SKUs gives it the *highest* margin (40.29%), because high-revenue SKUs
carry better margins. The documented figure must come from regional cost structure or
channel mix, neither of which is modelled. Decide whether to model it or drop the claim.

### O4 — Reconcile figures left behind by partial wiring
The KPI strip now shows computed values, but **five other places still show the old ones** —
so the same metric displays two numbers. Worst case: the audit drawer that *explains* a KPI
card contradicts the card.

| Metric | KPI strip (computed) | Still stale in |
| --- | --- | --- |
| Rationalize candidates | 46 SKUs | `App.tsx:524`, `useGlobalSearch.ts:112`, `useAgentWidget.ts:106`, `auditData.ts:167,230` |
| Revenue tail risk | 15.79% | `App.tsx:506`, `useGlobalSearch.ts:114`, `useAgentWidget.ts:106`, `auditData.ts:212` |
| Long tail | 72.3% | `auditData.ts` |
| PCI | 0.5961 | `auditData.ts` |

Solved properly by O7's metric registry rather than by editing each literal.

### O5 — Cannibalization displacement is not modelled
Correlations are derived from promo timing and reach −0.581, close to the UI's −0.62
reference. But promotions on one SKU do not actually reduce a sibling's units in the
demand model. The correlation is real in the data; the *mechanism* is coincidental.
Worth modelling explicitly if cannibalization analysis matters.

### O6 — Competitor intelligence dataset
Out of scope for phase 1. The blueprint's §5 playbook needs review counts, Google Trends
indices, bestseller rank and distribution coverage — none exist in the FMCG schema. A
separate source with its own grain and refresh cadence.

### O7 — Metric integrity  *(from report 1)*
Only **2 of the brief's 6 required KPIs** are properly computed. Revenue and margin each
have two competing baselines.

**Sharpened on 20 Sep by deleting `server.ts`.** `data.ts` is the sole importer of
`generated.ts`, and only **2 of its 7 computed exports reach a component**:

| Generated export | Reaches the UI? |
| --- | --- |
| `GENERATED_KPI_VALUES` | Yes — overrides the KPI strip |
| `GENERATED_REGIONAL_DATA` | Yes — 19 references |
| `GENERATED_CHANNEL_DATA` | **No** |
| `GENERATED_STOCKOUT_TOP10` | **No** |
| `GENERATED_RATIONALIZATION_SCENARIOS` | **No** |
| `GENERATED_PCI_DRIVERS` | **No** |
| `GENERATED_TOP_SKUS_REVENUE` | **No** |

The five unconnected ones had exactly one consumer: the deleted Express server. So every
screen showing channel performance, stockouts, rationalization scenarios, PCI drivers or top
SKUs renders a hardcoded number while a correct computed one sits one import away. The
aliases in `data.ts` are kept and annotated as the wiring points.

This is the cheapest high-value item on this list — five arrays already computed and
validated, needing only to be consumed.

- [ ] **Fix the lifecycle "Total Revenue" units bug** (found by a teammate's review, confirmed
      22 Sep). `LifecycleHealthPanel.tsx:100` sums each SKU's `rev` field and renders it as
      `$…M`. Across 119 SKUs `rev` totals **10,608** — against annual net sales of **$473M** —
      so the screen shows ~$10,592M, about 22× too high. `rev` is not in millions. *(hours)*
- [ ] **Wire the five orphaned computed arrays** into the components that currently hardcode
      them. No new data work; the generator already produces all five. *(1–2 days)*
- [ ] **One metric registry** — every card, search result, agent reply and audit entry reads
      its value from one place. Fixes O4 and stops new conflicts. *(2–3 days)*
- [ ] **Retire the $851.2M / $851.4M / 36.2% baseline** and the Gross Profit, Net Profit and
      SG&A cards built on it — the dataset has no SG&A or opex column. *(1 day)*
- [ ] **Add SKU productivity** — computable today: $473M ÷ 119 = $3.97M. *(hours)*
- [ ] **Add a launch table** so time-to-market and launch success rate can be computed.
      `launch_date` is empty on all 119 SKUs. *(2 days)*
- [ ] **Redefine long-tail burden** — mean SKU share is 0.84%, below the 1% threshold, so an
      average SKU counts as tail. Use cumulative revenue instead.
- [ ] **Redefine cannibalization rate** — currently a hardcoded `78.5%` in `DemoTab.tsx:143`.
- [ ] **Compute the two fixed PCI drivers** — supplier fragmentation and SKU proliferation
      are set by config, so a third of the index can't move.
- [ ] **Repair the KPI strips** — tabs 1, 5, 6, 7 render empty; tabs 4 and 8 render one card
      short. The missing metrics have styling in `KPICard.tsx` but no value in `KPIS`.
- [ ] **Add a country-margin-order check** to `validate.py` (would have caught O3).

### O8 — Consolidate 12 tabs to 5  *(from report 2)*
The brief requires **exactly 5 domain tabs**; the shell has no Home. About 49% of tab code is
outside the brief's scope. Four of the five brief tabs are built twice (VP + standard view).

- [ ] **Phase 1, low risk** — Agent Orchestrator → "How This Evolves" side panel; Task Tracker
      → header action queue; set a default tab per role (VP → Portfolio Health, PM → Launch
      Readiness, Pricing → Profitability)
- [ ] **Phase 2, medium** — fold Home, Top-Down Drill and Assortment into Portfolio Health;
      fold the PM workspace (tabs 9–11) into SKU Rationalisation
- [ ] **Phase 3, higher** — collapse the four VP / standard view pairs into single views with
      role-based emphasis
- [ ] Investigate: Product Manager currently receives the **VP's** Launch Readiness view

### O9 — Shell compliance and demo hygiene  *(from reports 2 & 3)*
- [ ] **Wire the Consulting CTA** — Diagnostic Workshop, Use Cases and Lab Explorer have no
      click handlers. The acceptance criteria require them functional, and it's the GTM
      conversion point.
- [ ] **Remove real brands — seven, not one** (corrected 22 Sep). In `dim_sku`: Coca-Cola,
      Sprite, Thums Up, Pulpy Orange, 5-Star, Munch, "Foorti" — all added in one commit on
      13 Jul. Also Pepsi, Mountain Dew and Lay's by name in the Signals Board pricing simulator
      (`SignalsBoard.tsx`, `signalsData.ts`). Rename to fictional brands; the SKU names live in
      `data.ts` → `sku_seed.json`, so regenerate and reload the dataset after renaming.
- [ ] Review category mix — 3 of the top 5 SKUs by revenue are apparel in an FMCG portfolio.

### O10 — `role` never updates from a `hashchange` event  *(found 22 Sep, while reordering the sidebar)*
`App.tsx`'s `role` state is set once, in the `useState` lazy initializer, from the URL hash or
`localStorage`. The `hashchange` listener (`App.tsx` ~line 229) re-reads `tab`, `timeline`,
`metric`, `simulator` and `view` on every hash change — but never `role`.

**Consequence:** a role-specific link (`#tab=0&role=Product%20Manager...`) opened in a tab that
already has the app loaded silently keeps whichever role loaded first. Only a full page load
picks up a new `role` from the URL. Confirmed with Puppeteer: reusing one browser tab across
three `role` values in the hash rendered the same role three times; a fresh page per URL
rendered correctly each time.

**Also affects `scripts/smoke.mjs`** — it reuses one `page` across every `visit(role, tab)`
call. Worth an audit: with 27/27 passing, either the role switch works in some environments
this reproduction didn't hit, or the smoke test has been exercising fewer real role/tab
combinations than its "3 × 9 = 27" label claims. Check before trusting future green runs.

- [ ] Fix: read and apply `role` inside the `hashchange` handler, matching the pattern already
      used for `tab` and `timeline`.
- [ ] Re-verify `scripts/smoke.mjs` actually switches role per combination (e.g. assert
      `document.title` or a role-specific DOM marker changes between combinations), not just
      that no console error fires.

---

## Decisions

| Date | Decision | Basis |
| --- | --- | --- |
| 7 Sep | All amounts in USD, no FX table | — |
| 9 Sep | 119 SKUs canonical; 7 categories; PostgreSQL 17 | Dataset generation plan |
| 17 Sep | **Build the lab as a GTM asset, not a competing product** | Report 3 — o9, Kinaxis, SAP and Aera are Gartner Leaders already shipping AI agents; the program guidance defines labs as GTM demos |
| 17 Sep | Target structure: 5 domain tabs + side panel | Report 2, Lab 8 brief |

---

## Reference

```bash
python data/generator/main.py        # regenerate the dataset (3.4s, deterministic)
python data/generator/export_ts.py   # refresh src/constants/generated.ts
python data/generator/load.py --dry-run
npm run lint                         # tsc --noEmit
npm run build
npm run preview                      # serve dist/ on :4173
```

| Document | Covers |
| --- | --- |
| `documentation/data_model_specification.md` | Tables, columns, types, keys |
| `documentation/dataset_generation_plan.md` | Generation rules, targets, run outcomes |
| `documentation/system_architecture.md` | Now / Next / Future diagrams, Excalidraw-ready |
| `documentation/architecture_proposal.md` | Target state and cost strategy — see corrections in the file above |
| `TODO.md` | This file |

**Published:** [build brief](https://claude.ai/code/artifact/0afd68c0-d0c6-49d7-88bb-747af9c9cda7) ·
[data model](https://claude.ai/code/artifact/0a1fe036-50e3-4f5f-bd2a-e359dfa66f2b) ·
[validation](https://claude.ai/code/artifact/75c2af6d-f999-4d0c-8c72-7c6198994093)

**Product review, 17 Sep:**
[1 · Metric dictionary](https://claude.ai/artifact/Q1JmpLj6Ly9chiGP2sH4Ci) ·
[2 · Tab audit](https://claude.ai/artifact/LCXiykgu3MfPb5RYuyLAot) ·
[3 · Competitive landscape](https://claude.ai/artifact/6fQTYvkiB8Vs1X4xJcELT5)

**Same three as Google Docs** (File → Download → .docx for Word), in
[Acies Portfolio Lab — Reports](https://drive.google.com/drive/folders/1oeOPC1I54kBNnrLfIscDCxiCLIUnoXIA):
[1 · Metric Dictionary](https://docs.google.com/document/d/1v6Cre0WwNMBg4qI6fbdkA3i5MbfkgVBU7zXhbe2Lhbs/edit) ·
[2 · Twelve Tabs to Five](https://docs.google.com/document/d/1pfcD4hJ0GjJB3gwQFjWYSFSs4loJoim6VinqQXQo2-U/edit) ·
[3 · Worth Building?](https://docs.google.com/document/d/1ZvMTreERw_DFyEpnYKbw04bhLigSEC7Xy2iWUvch85w/edit)
