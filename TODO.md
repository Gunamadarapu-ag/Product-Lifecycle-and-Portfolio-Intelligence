# TODO — Data Layer Migration

Tracking the move from hardcoded constants to a generated, validated dataset and a
PostgreSQL database.

**Last updated:** 30 September 2026
**Branch:** `Branch_G` (pushed to `origin`) — `refactor/cleanup-and-architecture` also exists locally

---

## Status at a glance

| Phase | State |
| --- | --- |
| 1. Schema design | **Done** |
| 2. Dataset generation | **Done** — 16/16 targets pass |
| 3. Dashboard wiring (partial) | **Done** — 7 arrays live |
| 4. Database | **Done** — 20 Sep, loaded and reconciled |
| 5. Dashboard wiring (SKUS) | **Open** — threshold audit partly done, see O1 |
| 6. Repo cleanup | **Done** — 20 Sep, resolved by rows 10–11 below (was recorded as Blocked; the permission issue cleared and 187 files were removed the same day) |
| 7. Product review — metrics, tabs, competitors | **Done** — 3 reports, 17 Sep |
| 8. Metric integrity | **Open** — see O7 |
| 9. Tab consolidation, 12 → 5 | **Open** — see O8 |
| 10. Repo cleanup, phases A and B | **Done** — 20 Sep, 187 files removed |
| 11. Phase C — split the giant files | **Done** — 20 Sep, 9 files split into 30 |
| 12. Backend language | **Decided** — 20 Sep, Python/FastAPI; Node backend deleted |
| 13. Python dependencies pinned | **Done** — 20 Sep, `requirements.txt` |
| 14. Database → API → app connection | **Done (headline figures)** — 29 Sep; SQL calc layer, FastAPI, live KPI strip / Home / Portfolio Health. See below |
| 15. SKU-level threshold audit | **Partly done** — 29–30 Sep, dollar cutoffs and the Tier 1 raw-display sweep both fixed; percent constants (Tier 2, decided, not started) and a few newly-found Tier 2/3 items remain. See O1 |
| 16. Branding — logo, backdrop, profile switcher | **Done** — 30 Sep. See below |
| 17. Top-Down Drilldown relabelled to real regions, real OTIF | **Done** — 30 Sep; real 7 countries/3 regions, live fulfillment metric, SQL 51/51, API 14/14. See O11 |
| 18. Client-facing pitch and positioning | **Open** — 1 Oct, synthesised from Report 3; gap logged, not yet built. See O14 |

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

**Was — `pg_hba.conf` set to `trust`.** All three local lines (`local`, `127.0.0.1/32`,
`::1/128`) used `trust`, meaning no password was verified for any local connection, including
`postgres`. So the database password protected nothing on this machine, and the S1 leak never
protected anything either.

Contained by: `listen_addresses = '*'` exposes the port, but there is **no `pg_hba` rule for
non-loopback addresses**, and PostgreSQL rejects connections matching no rule. Remote access
is refused.

- [x] **Switch the two `host` lines to `scram-sha-256`** — **done and verified 30 Sep.**
      Both lines in `C:\Program Files\PostgreSQL\17\data\pg_hba.conf` now read
      `scram-sha-256` instead of `trust`; reloaded via `SELECT pg_reload_conf();` (no service
      restart or OS admin needed — connected as `postgres` in the moment before the file's
      new rules took effect). Verified three ways: `postgres` with a wrong password now gets a
      clean `password authentication failed` (would have succeeded under `trust`, which
      ignores whatever password is sent); `Pd_lc_app` with no password now gets
      `fe_sendauth: no password supplied`; `Pd_lc_app` with its real password from `.env`
      still connects fine and the running API (`npm run api`) is unaffected. The `local` and
      `replication` lines were left on `trust` — out of scope for this pass, not part of the
      finding above.

- [ ] **Reset the `postgres` superuser password.** It already has *a* password set (confirmed
      via `pg_shadow`), but it isn't recorded in `.env` or anywhere else — it predates this
      project and neither Claude nor the user currently knows it. Not a lockout: reload only
      needed `pg_reload_conf()` from an existing session, not a fresh login, and the app never
      uses this role. But if superuser access is ever needed again, nobody can get it without
      resetting it first. **Blocked for Claude** — `ALTER ROLE ... PASSWORD` is refused by
      the sandbox as a secret-store write, on any role, regardless of `pg_hba.conf`'s state.
      Run yourself, from cmd.exe:
      ```
      "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U postgres -d postgres -c "ALTER ROLE postgres PASSWORD 'choose-a-new-one-here';"
      ```
      This will itself prompt for the *current* postgres password first (scram is enforced
      now) — if that's unknown too, reset via single-user mode instead (stop the
      `postgresql-x64-17` service as Administrator, run
      `postgres --single -D "...\17\data" postgres`, issue
      `ALTER ROLE postgres PASSWORD '...';` there, restart the service).
- [ ] **Then strengthen the app password** (`Pd_lc_app`, currently `Admin123!` — a
      top-of-list pattern for any scanner). Same block applies — run this yourself:
      ```
      "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U "Pd_lc_app" -d ppl_intelligence -c "ALTER ROLE ""Pd_lc_app"" PASSWORD 'choose-a-new-one-here';"
      ```
      Then tell Claude the new password so `.env` (`PGPASSWORD` and the embedded value in
      `DATABASE_URL`) can be updated and `npm run api` restarted to pick it up — only the
      `ALTER ROLE` itself is blocked, not the `.env` edit or the restart.

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

## Blocked — none currently open

Both blockers this section used to track are resolved. Kept as a compressed record with a
pointer to the section holding the actual resolution detail — not as live blockers.

### B1 — PostgreSQL role and database — **resolved 20 Sep**
Was blocked on a rejected `postgres` superuser password (7 Sep). Resolved same day the
database went live — see "Database live — 20 September" below for what actually happened.
To rebuild from scratch on a new machine: run `data/schema/00_create_role.sql` (role +
database, port **5433** not 5432, password via `-v app_password`), then `01_schema.sql`,
then `python data/generator/load.py` — same order as originally, no longer blocked.

### B2 — Remove 133 tracked scratch files — **resolved 20 Sep**
Was blocked on a bulk `git rm` permission prompt. Resolved as part of the same day's cleanup
— see "Cleanup done — 20 September" below (187 files removed, of which these 133 were the
majority).

---

## Database connected — 29 September

The warehouse is no longer read by nothing:
`PostgreSQL → SQL functions → FastAPI → /api → app`.

| Layer | What exists | Verified |
| --- | --- | --- |
| Calculation | `data/schema/03_derive_metrics.sql`: `metric_window` + 7 functions + `metric_registry`. Every figure is defined once, parameterised by timeline months | `04_validate.sql`: **36/36** checks |
| API | `backend/app/main.py` (FastAPI, `npm run api`, :8000): health, registry, portfolio kpis/summary/concentration/trend, skus, regions, channels | `backend/tests`: **12/12** against the real DB |
| App | `src/api/liveData.tsx` (one fetch per period, shared context, offline fallback + provenance badge); Vite proxies `/api` | smoke **27/27**; no old figure on any wired screen at 12m or 3m |

**Figures now live:** KPI strip (Net Sales, Avg Gross Margin, Revenue Concentration); Home
(Total Revenue, Gross Margin, Active SKUs, with real monthly sparklines); Portfolio Health
(revenue with target = prior × 1.10, SKU count, growth, and lifecycle stage revenue);
SKU Rationalization Revenue at Risk; Profitability Gross Profit.

**Gone:** $851M / $853M / $1,071M / $10,592M revenue, 36.2% margin, $447M revenue-at-risk,
$308.1M gross profit. At 12 months every wired screen reads $473.0M / 38.55% / +8.30%.
Changing the timeline now returns real period data: 3 months = $120.6M, −2.35% vs the prior
3 months.

**Still open (next):**
- [x] **O1 at SKU level — Tier 1 sweep, 30 Sep.** A read-only inventory pass (Explore agent,
      whole `src/` tree) found every remaining raw `.rev` display, classified Tier 1 (raw
      display, safe to fix) / Tier 2 (hand-tuned % formula, leave alone) / Tier 3 (structurally
      fabricated, e.g. modulo tricks — not a rescaling candidate at all). 9 Tier 1 spots fixed
      across 6 files:
      - `DrilldownSkuGrid.tsx` — SKU card "Rev:" footer.
      - `SkuDetailsModal.tsx` — "QTD Revenue" tile + 2 raw mentions in AI-drafted email bodies
        (the file's Tier 2 % estimates like `pricingLift` correctly keep reading old-scale
        `item.rev`, verified by screenshot: same SKU shows live "$6.1M" on the QTD tile and an
        unchanged, old-scale-derived "$1.68M" pricing-lift estimate right next to it).
      - `InvestmentMarginMap.tsx` — root-cause fix: `getInvestmentMarginData` now takes an
        optional `skuRevenueM` param and sets the returned `rev` field from it, fixing the
        tooltip, the scatter chart's bubble-size (`ZAxis dataKey="rev"`), and the sidebar list
        in one change — while its Tier 3 modulo-based `investment` figure keeps reading raw
        `s.rev` directly (different field, untouched, confirmed by comment and diff).
      - `StrategicActionPlan.tsx` — 2 revenue-sum impact lines ("revenue needs managed exit" /
        "revenue to protect"). Deliberately did *not* fix this at the shared `EnrichedSKU.rev`
        source (`simplify-to-grow/utils.ts:46`) since that field is also read by a Tier 2
        formula (`avgHiddenCostRatio` in `computePillars`) — fixed with a local `revOf` helper
        in the component instead, so only the display sums move.
      - `DrilldownSkuModal.tsx` — "Realized Revenue" tile, via a separate `liveRev` alongside
        the untouched `skuRev` (which still feeds the Tier 2 waterfall breakdown below it).
      Verified with Puppeteer (not just `tsc`): opened the SKU detail modal for the same SKU
      shown live in `InvestmentMarginMap.tsx` and confirmed both tiles agree exactly ($6.1M).
      `tsc`, build, smoke (27/27) all clean.
      **Still open:** a handful of Tier 2/3 items the inventory flagged but didn't fix — e.g.
      `RevenuePerformanceMatrix.tsx`'s `revenue >= 75` classification cutoff and axis domain
      (whole file is one Tier 2 unit, same shape as the `SKUHoldingsMatrix.tsx` cutoffs already
      decided 29 Sep — needs the same kind of decision, not yet asked); `SKUHoldingsMatrix.tsx`
      line 116's `localSalesVal` (×0.035) was already known Tier 2 and still untouched;
      `SKUPerformanceTab.tsx`'s hash-of-name sparkline is Tier 3 (fabricated trend, not a scale
      issue). None of these were part of this pass.
- [x] **O1 threshold audit — dollar cutoffs, 29 Sep.** User decision: rescale to preserve
      selectivity rather than leave alone or wait for real numbers. Two classification
      thresholds fixed:
      - `LifecycleHealthPanel.tsx` Introduction-stage `rev < 100` → divides by the mean scale
        factor (10,608/473 ≈ 22.43) when live revenue is available. Verified safe: the
        `growth >= 0.15` filter is the binding constraint (6/119 SKUs qualify either way), so
        the mean-ratio approach doesn't distort this one.
      - `SKUHoldingsMatrix.tsx` Netherlands (`rev < 85`) and France/Austria/Poland (`rev < 48`)
        "not-listed" cutoffs — **mean-ratio division does NOT preserve selectivity here**
        (verified: old 85 selects 44% of SKUs, `85/22.43` selects 71%; old 48 selects 8%,
        `48/22.43` selects 32% — real per-SKU revenue is Pareto-skewed, the old hand-typed
        `rev` values are roughly uniform, so a single ratio doesn't transfer). Fixed instead
        with rank-preserving constants (`NL_NOT_LISTED_LIVE_M = 2.69`,
        `FAP_NOT_LISTED_LIVE_M = 0.65`) computed from a live `/api/skus` pull to reproduce the
        exact original 52/119 and 10/119 counts. Recompute if the dataset regenerates.
      - Also fixed while there (Tier 1-style, not part of the threshold decision): the raw
        "Sales" column and rev-sort in `SKUHoldingsMatrix.tsx` were still displaying
        `${sku.rev}M` unscaled — this component wasn't in the original Tier 1 sweep.
      - **Not changed:** `getCellDetails`'s `localSalesVal` (`sku.rev * capacity/100 * 0.035`)
        — a hand-tuned % constant, same category as the simulator math below; still reads the
        old `sku.rev` scale.
- [ ] **O1 threshold audit — percent constants, decided 29 Sep, not started.** User: the
      hand-tuned % constants in `PLSimulatorSection.tsx`, `useSkuRationalizationState.ts`
      (transferredVolume/leakageVolume/complexitySavings 4%/substitute 5%/delistedProfit),
      `ActionRoutingPanel.tsx`/`CalculatorScorer.tsx` (cannibalization uplift),
      `simplify-to-grow/utils.ts` (unitProfitPool, wasteWriteOffCost 3%,
      avgHiddenCostRatio) are demo-plausible assumptions, not calibrated figures — leave them
      as-is; they'll now apply to correct dollars once their inputs are live-wired, no
      rescaling needed. Still Tier 3 for `InvestmentMarginMap.tsx` (`rev % 30`/`rev % 35`
      modulo trick — structurally fabricated, not a threshold to rescale at all).
- [ ] VP Profitability tree/scenarios still on the $851.2M baseline; only Gross Profit is live.
- [ ] Other KPI-strip cards (PCI, long-tail, rationalize candidates, stockout peak, tail risk)
      need SQL functions — `portfolio_metrics` already holds PCI and long-tail.
- [ ] The rest of `utils/timeframe.ts`'s fabricated noise, wherever a screen isn't live yet.

---

## Branding, and the drill-down audited against the database — 30 September

**Branding — done.** Extracted the cube mark from `Research_doc/Logo.png` (cropped to its own
bounding box) into `public/logo-mark.png` and a square `public/favicon.png`. Wired into the
browser tab (`index.html`), `Header.tsx` (replaced a generic icon-in-a-box), `LoginPage.tsx`
and `WelcomeGate.tsx` (both replaced a placeholder `Cpu` icon in the brand pill). Also
replaced `WelcomeGate`'s generic "AI network lines" SVG overlay with a new shared
`BrandBackdrop.tsx` component — a product-lifecycle S-curve, portfolio growth bars, and
diamond markers echoing the logo's cube facets — applied to both `LoginPage` and
`WelcomeGate` for visual consistency. Separately, converted the header's "Switch profile"
button from a full navigate-away-to-the-Welcome-Gate flow into an in-place dropdown
(`Header.tsx`): picking a role now calls `setRole` directly, no longer leaves the current
tab, and the now-dead `handleSwitchPersona`/`onSwitchPersona` plumbing was removed.

**Team call reviewed (`Research_doc/Daily_calls/30-09-2026.txt`).** The team's core ask:
every off-target KPI should give a VP *detect → diagnose → simulate → recommend*, not just a
number. They walked through `TopDownDrilldown.tsx` as a working example of this pattern
(Fulfillment/OTIF → Supply Chain Network → region → SKU → reason → recommendation) and want
it to be the model elsewhere. Two UX gaps were flagged: search only handles one SKU at a
time (no bulk select + combined report), and report download/export is unconfirmed.

**The call's stated blocker, checked:** "does the database actually have this data?" —
**partially.** See O11.

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
| `assortment/SKUHoldingsMatrix.tsx` | 32 | ~~`sku.rev < 85`~~ — **fixed 29 Sep**, rank-preserving live threshold (see above) |
| `assortment/SKUHoldingsMatrix.tsx` | 35 | ~~`sku.rev < 48`~~ — **fixed 29 Sep**, rank-preserving live threshold (see above) |
| `assortment/SKUHoldingsMatrix.tsx` | 38, 39, 315 | `stockouts >= 6 / 3 / 4` — still open, separate conflict (Conflict 2 below) |
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

### O2 — Derived-metric and validation SQL — **done 29 Sep** (see "Database connected")
- [x] `data/schema/03_derive_metrics.sql` — rebuild `sku_metrics`, `sku_cannibalization`,
      `portfolio_metrics` in-database
- [x] `data/schema/04_validate.sql` — 36 checks (grew from the originally planned 16 to also
      cover every period × breakdown consistency), 36/36 passing

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

- [x] **Fix the lifecycle "Total Revenue" units bug** (found by a teammate's review, confirmed
      22 Sep, fixed 29 Sep). `LifecycleHealthPanel.tsx` now sums live per-SKU revenue
      (`skuRevenueM`) when available, with the old `rev`-based total kept only as the offline
      fallback. Stage *classification* (Introduction/Growth/Margin/Decline) was fixed the same
      day — see the O1 threshold audit above.
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

### O11 — Top-Down Drilldown is fictional, not just unwired — **found and fixed 30 Sep** *(team call)*
Checked whether the database backs the OTIF/fulfillment drill-down the team reviewed live on
the call (`TopDownDrilldown.tsx` → `DrilldownFilters.tsx` → `DrilldownRegionGrid.tsx` /
`DrilldownNetworkGraph.tsx`). It doesn't — and not only because nothing is wired yet, the way
most of the rest of the app is. The screen's own content has no real counterpart to connect:

- **Regions don't exist in the data.** The screen shows APAC / EMEA / LATAM / Americas
  (`TopDownDrilldown.tsx:18-21`). The database has 7 European countries (Italy, Spain,
  Germany, France, Austria, Poland, Netherlands), grouped as Southern/Western/Central Europe.
- **The regional "managers" are invented** — names, emails and named plants
  (`TopDownDrilldown.tsx:18-21`) with no possible real counterpart; there is no org/HR table
  in this schema and none is planned.
- **OTIF numbers per region are hardcoded constants** (`DrilldownRegionGrid.tsx:38-77`), not
  computed from `fact_sales`.
- **The "13-day lead time" recommendation** (`DrilldownSkuModal.tsx:149`) is a template string
  built from `SKUS[].lead`, the same hand-typed `constants/data.ts` field the O1 audit is
  already rescaling elsewhere — not from `fact_sales.lead_time_days`.
- **There is no literal OTIF field anywhere.** The team defined it on the call as ordered-vs-
  received quantity; `fact_sales` only has `stock_out_flag` (binary, per transaction) and
  `lead_time_days` (a duration) — proxies, not that measurement. A real OTIF has to be
  *defined* against what exists, not looked up.

**What does exist and is real:** `fact_sales.lead_time_days` / `stock_out_flag` per
transaction, pre-aggregated in `sku_metrics` (`avg_lead_time_days`, `total_stockouts`),
`dim_supplier` / `sku_supplier` (60 suppliers, all covering all SKUs), and `dim_country.region`
for genuine geographic grouping.

- [x] **Decision made 30 Sep:** relabel to the database's real 7 countries / 3 European
      regions, not keep APAC/EMEA/LATAM as demo framing.
- [x] **OTIF defined and computed, 30 Sep.** `fn_regional_fulfillment` in
      `03_derive_metrics.sql`: `fulfillment_pct` = share of country transactions with no
      `stock_out_flag` (the real, defensible "in full" half), `avg_lead_time_days` reported
      alongside it, not blended in (no stated target exists to score "on time" against). Both
      compared to the prior period, same pattern as `fn_portfolio_kpis.growth_pct`, not an
      invented target. Extended to also carry `net_sales`/`gross_margin_pct` (+ prior-period
      versions) so the drill-down needs one call, not a join with `fn_regional_performance`.
      `04_validate.sql` grew from 45 to **51/51** checks (bounds, region/country counts,
      stockout and net_sales reconciliation to the portfolio total). New endpoint:
      `GET /api/regions/fulfillment`, `backend/tests`: **14/14**.
- [x] **Frontend relabelled, 30 Sep.** New `src/constants/regions.ts` replaces the fictional
      `REGIONS_CONFIG` that was independently hand-duplicated across all 4 drilldown files with
      one real source (Southern/Western/Central Europe; Elena Marchetti / Lukas Hoffmann /
      Katarzyna Nowak as the (still illustrative) regional contacts — a GTM demo doesn't need a
      real org chart, but the geography they're attached to now matches the database instead of
      contradicting it). `DrilldownRegionGrid.tsx`'s 56 hardcoded margin/OTIF numbers replaced
      with `useLiveRegionalFulfillment` + live aggregation to region level; offline fallback is
      a single static estimate per region (from `config.py`'s `revenue_share_target`), not a
      7-horizon fabricated matrix. Bug fixed along the way: `DrilldownSkuModal.tsx`'s
      "Qualify Secondary Logistics Supplier" recommendation hardcoded `Hi Vijay,` and
      `vijay.kumar@aciesglobal.com` regardless of the *actually selected* region — now reads
      `regionObj.manager`/`.email` like the other two recommendations already did.
      Verified with Puppeteer: region cards show real live figures (confirmed against a direct
      SQL query — the identical "+8.3%" on all three region revenue cards is real, not a bug;
      the generator applies YoY growth uniformly across regions by construction, confirmed by
      margin/fulfillment genuinely varying by region), drilling into a SKU shows the correct
      new plant name and contact, and the Email Composer opens pre-filled with the right
      person. `tsc`, build, smoke (27/27) all clean throughout.
- [x] **The 3 entangled files, 30 Sep** (the reason this wasn't scoped as "just 4 files"): the
      same 4 fictional managers were independently hand-duplicated in `EmailComposerModal.tsx`
      (`RECIPIENT_OPTIONS`, the app-wide "email this person" dropdown) and
      `PortfolioHealthMap.tsx` (`RECIPIENT_TITLES`, also imported by
      `VPLaunchReadinessView.tsx`) — both updated to the 3 new contacts, nothing left dangling.
      `SkuDetailsModal.tsx`'s stockout-escalation contact also hardcoded "Vijay Kumar / APAC
      Logistics Head" regardless of product category (not region — this file branches on
      category, not region, so none of the 3 new region contacts actually fit); swapped for the
      already-existing generic "Rohan Das / Supply Chain Lead" from the same shared directory
      instead of inventing a new mismatch.
- [ ] **Residual, explicitly out of scope for 30 Sep** (the 7-file scope was a deliberate
      choice, not an oversight — see the chat for the tradeoff):
      - `RegionalForecastModal.tsx` (Executive Overview's own regional drill-in) reuses "Vijay
        Kumar"/"Jean-Pierre Dubois" directly and branches on APAC/Americas/EMEA — untouched, so
        it now references contacts no longer in the shared directory. Same fictional $312M/
        $228M/$311M trio also duplicated in `constants/data.ts`'s `VP_FORECAST`,
        `constants/auditData.ts`, and `PortfolioHealthMap.tsx`'s own `regions` array — a
        separate, pre-existing duplication problem, not created by this pass.
      - `EmailComposerModal.tsx`/`PortfolioHealthMap.tsx` still carry three untouched
        India-plant-linked entries (Rohan Sharma/Baddi, Priyanka Rao/Chennai, Rajendra
        Patel/Vapi Hub) — not part of the 4-region-manager set, now orphaned from any plant the
        drilldown mentions, but a smaller, separate fabrication than what this pass fixed.
      - SKU Rationalization has two of its *own*, different invented geographies (LATAM/North
        America/Europe/APAC in `DemoTab.tsx`/`rationalisationData.ts`; a hash-based APAC/EMEA/
        Americas in `skuConstants.ts`'s `getSkuLocation()`, consumed by `ProductDirectory.tsx`,
        `useSkuRationalizationState.ts`, `simplify-to-grow/useSimplifyToGrowState.ts`) — not
        touched, pre-existing and unrelated to yesterday's call. Useful for later: `executive/
        SKUPerformanceTab.tsx` already has its own migrated `getSkuLocation()` returning the
        real 7 countries — a ready template.
      - 13 more files only mention APAC/EMEA/LATAM in decorative tooltip/narrative strings
        (`AuditDrawer.tsx`, `KPICard.tsx`, `executiveData.ts`, and others) — no logic, low
        value, safe to batch-fix whenever.

### O12 — Bulk multi-SKU search and combined report  *(found 30 Sep, team call)*
Confirmed missing app-wide: `useGlobalSearch.ts` has no multi-select, and there is no "pick
several SKUs, generate one report" flow anywhere. Today a VP has to search, copy the name,
cancel, and repeat per SKU.

- [ ] Design a selection mechanism (checkboxes in search results, or a persistent "basket")
      and a combined-report view or export built from the selection.

### O13 — Report download / export  *(found 30 Sep, team call)*
Left as an open question on the call. What exists today is scattered and per-screen only:
CSV export buttons in `SKUPerformanceTab.tsx`, `SKURationalization.tsx`, `DemoTab.tsx`,
`VPLaunchReadinessView.tsx`, `PortfolioHealthMap.tsx`, `VPSignalsBoardView.tsx` and
`AuditDrawer.tsx` — no general "download what's on screen" capability.

- [ ] Decide whether this needs a general capability or whether more per-screen exports are
      sufficient; likely related to O12's combined-report work.

### O14 — Name the integration story  *(found 1 Oct, from Report 3 — "Worth Building?")*
Report 3's recommendation for how to position this lab to clients: not as software competing
with o9/Kinaxis/SAP/Aera (capital, category and maturity gaps make that unwinnable — see the
report's "Why it can't compete as a product" table), but as **the decision layer a VP sees on
top of the planning stack and market data they already pay for — complementary to incumbents,
not a replacement.** The value proposition is speed-to-insight: incumbent deployments
reportedly run 12–24 months and $2.5–6M before a client sees value (figure from a competing
vendor's marketing — direction credible, exact number isn't); this lab shows the "after"
picture in minutes.

Report 3 named this specific gap: the demo currently has nowhere that *shows* that
positioning. A VP sees twelve tabs of a self-contained app, not a hint that it's meant to sit
on top of systems they already own.

- [ ] Add a side panel (the existing "How This Evolves" panel is the natural home — see O8
      Phase 1, which already plans to move Agent Orchestrator there) that explicitly shows
      Acies positioned across the planning suites (o9/SAP/Kinaxis) and syndicated data
      (NIQ/Circana/Numerator) a client already owns, rather than implying this app replaces
      them.
- [ ] This only lands once O9's Consulting CTA actually does something — right now the
      button a VP would click to continue this conversation has no click handler at all.

---

## Decisions

| Date | Decision | Basis |
| --- | --- | --- |
| 7 Sep | All amounts in USD, no FX table | — |
| 9 Sep | 119 SKUs canonical; 7 categories; PostgreSQL 17 | Dataset generation plan |
| 17 Sep | **Build the lab as a GTM asset, not a competing product** | Report 3 — o9, Kinaxis, SAP and Aera are Gartner Leaders already shipping AI agents; the program guidance defines labs as GTM demos |
| 17 Sep | Target structure: 5 domain tabs + side panel | Report 2, Lab 8 brief |
| 29 Sep | O1 dollar thresholds: rescale to preserve selectivity, not leave alone or wait for real numbers | User decision, checked numerically — mean-ratio division alone was wrong for `SKUHoldingsMatrix.tsx`, needed rank-preserving constants instead |
| 29 Sep | O1 percent constants (cannibalization uplift, waste write-off, etc.): leave as-is, demo-plausible not calibrated | User decision |
| 30 Sep | Logo: extract the mark only (header, login, favicon) — not the reference mockup's palette, icon set or full page layout | User decision via options; scope may expand later |
| 1 Oct | Client pitch: "decision layer on top of the stack a client already owns, not a replacement for it" — value is speed-to-insight, not feature parity | Reaffirms the 17 Sep Q1 decision in `pitch.md`/Report 3; logged as O14 rather than built as a separate artifact for now |

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
| `documentation/Product_Understanding/README.md` | Start-here index over every doc in the repo (including the three reports below, now saved locally) — what to trust, what's stale, in what order to read it |
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
