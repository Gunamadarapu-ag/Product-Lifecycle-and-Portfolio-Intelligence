# TODO — Data Layer Migration

Tracking the move from hardcoded constants to a generated, validated dataset and a
PostgreSQL database.

**Last updated:** 6 October 2026
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
| 18. Client-facing pitch and positioning | **In progress** — business-case deck v2 built 9 Oct; 10 Oct leadership review reframed it as an Acies capability showcase. Deck v3 is O28. See O14 |
| 19. Inventory visibility and forecast accuracy | **Partly done** — forecast generated 7 Oct and live 8 Oct (Forecast Attainment 91.9%); inventory generated but no SQL function reads it (O22). See O15 |
| 20. EOL/obsolescence tracking | **Done** — 7–8 Oct: `supplier_notice` generated; feeds `fn_alerts`, `fn_signals` and the rationale rules. See O16 |
| 21. O8 deferred; data-source audit + explainability (O17) | **Done** — 6 Oct. All 3 targets complete: Portfolio Health Score live, fake live-feed stopped, 10 KPI drawers made honest. See O17 |
| 22. Generate all missing data (O18) — step 1 of generate → wire → diagrams | **Done** — generated 7 Oct; all 6 data threads wired 8 Oct; 30/30 Python, 61 SQL checks, 37 API tests, smoke 36/36. See O18 |
| 23. Architecture and data-flow diagrams; data-points docx update | **Done** — 8 Oct: 10 diagrams (`system_architecture_and_data_flow.md`, `as_is_process_lineage.md`); docx gets an "Update — 8 Oct 2026" column |
| 24. Business-case deck (evidence-backed) | **Done (v2)** — 9 Oct, 9 slides, every external figure sourced. v3 per the 10 Oct review is O28 |
| 25. Phase-wise implementation plan | **Drafted** — 14 Oct, `documentation/Phase_wise_Implementation_Plan.docx`; owners and decisions D1–D6 to fill. See O31 |

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

### O3 — Fix the Netherlands margin assumption — **fixed 7 Oct** (`config.COUNTRY_PRICE_INDEX`; validation check 21 asserts it)
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

### O6 — Competitor intelligence dataset — **decided 7 Oct: out of scope; external data later via client APIs**
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

### O15 — Inventory visibility and forecast accuracy  *(found 5 Oct, team call)* — **forecast done 8 Oct; inventory generated but unread → O22**
Requested at SKU level, tied explicitly to Launch Readiness ("inaccurate forecasting means we
can't be ready with products' readiness") and SKU Rationalization ("there's a rationalization
opportunity here, we need inventory status"). Checked against the schema — same shape of gap
as O11's OTIF finding: **neither exists as real data.**

- `inventory_carrying_cost` (`portfolio_metrics`) is explicitly commented `'ESTIMATED - no
  real inventory data exists'` — derived from `lead_time_days × demand_std`, not an actual
  stock-on-hand figure. There is no inventory-level column anywhere in the 13 tables.
- There is no forecast table at all. The dataset has actuals (`units_sold`, `net_sales`) with
  nothing "planned" to compare them against — forecast accuracy needs both and only has one,
  the same absence Report 1 found for launch dates.

- [ ] **Decision needed:** generate new synthetic data for one or both (a forecast-vs-actual
      table, a real inventory-on-hand figure per SKU/country), or scope these as illustrative
      only and say so, the way O11 scoped the Signals Board's competitor feed. Not a SQL-layer
      fix — needs new data first, same as O7's launch table.

### GTM workstream — tracked, not engineering  *(from the 5 Oct call)*
Two open threads outside this tracker's scope, logged so they aren't lost:
- Whether a client would realistically share enough data for a single-VP-persona pilot —
  flagged to raise with **Prashant**.
- A parallel customer-validation workstream with **Satish**, asking prospects direct
  questions about this problem statement — status not yet known from this session.

Relevant to O14: if the data-access concern is real, it constrains how literally "decision
layer on top of the stack you already own" can be delivered for a first pilot.

### O16 — EOL / obsolescence tracking  *(found 6 Oct, leadership review call)* — **done 7–8 Oct** (`supplier_notice` → alerts, signals, rationale)
A product manager needs visibility when a **supplier** notifies that a component/SKU is
becoming end-of-life months ahead ("this part stops production from January 2027"), tied to
the existing Decline lifecycle stage — not just "underperforming," but "about to become
unavailable regardless of demand." Raised as a named gap: *"being a product manager, I don't
see that visibility... where is that EOL thing."*

Checked against the schema — **absent**, same shape as O15. No supplier-notification or
EOL-date concept exists anywhere in the 13 tables; `dim_supplier`/`sku_supplier` model which
supplier serves which SKU, not whether that supply is ending.

- [ ] **Decision needed**, same as O15: new synthetic data (a supplier-notification /
      EOL-date table) before this is anything but illustrative. Natural to scope together with
      O15 — both are "the business asked for a capability the dataset doesn't model yet."

**Separately raised on the same call, unresolved**: whether inventory even belongs in this
tool at all — one team member argued inventory/supply is a different problem from the
demand-side assortment planning this was scoped for. Not a data question, a scope question —
worth raising with Prashant directly rather than guessing at an answer.

---

## 6 October — leadership review redirected the plan

A review call with Prashant (senior stakeholder) directly challenged the O8 consolidation work
this tracker had queued next: *"each tab has its own functionality... why do you want to
consolidate... that is not the priority."* His alternative, if role-based tab access is wanted
at all: a simple backend visibility flag per role, not a structural merge — **not started,
not decided whether wanted**.

His actual, repeated demand during a live walkthrough: *"what is the primary data set going
into this"* for KPI after KPI, with no confident answer from the team. Two concrete catches:
- **Portfolio Health Score** named specifically — the audit-drawer explanation a user sees on
  click is disconnected from the real live formula (fictional formula text, hardcoded stale
  value, invented trend table). See the new pivot plan, Target 1.
- **Home tab's "Live Industry Updates" feed** — correctly identified as updating too fast to be
  real (~10 seconds). See Target 2.

His verdict: *"most of the data you see is static... this is not going to be continued"*
without visible progress — a real threat to the project's continuation, with a parallel push
to involve **Satish** given the lack of visible movement.

**O8 is deferred, not abandoned.** The full plan (role-default-tab mechanism, the Portfolio
Health / SKU Rationalization sub-tab design, the fold sequencing) is written and saved
(`C:\Users\sangr\.claude\plans\mossy-hatching-perlis.md` on this machine — outside the repo).
Current priority is the data-source-audit-and-explainability pivot instead — see O17.

### O17 — Data-source audit and explainability  *(done, 6 Oct, from the leadership call)*
The flagship fix for the pivot above. `LifecycleHealthPanel.tsx:109-114` computes a real score
from real live data (`positiveTrendPct × 0.45 + marginFactor × 0.35 + (100 − complexityPenalty)
× 0.10 + (100 − stockoutPenalty) × 0.10`), but the audit-drawer entry a user actually sees on
click (`constants/auditData.ts:898-920`) shows a different, fictional formula with a hardcoded
stale value and an invented trend table — exactly the gap Prashant hit live.

- [x] Return the 4 weighted components from `calculatePortfolioHealth`, not just the final
      score. Done 6 Oct — `factors` object added to the return value
      (`LifecycleHealthPanel.tsx`).
- [x] Rewrite the audit entry to show the real formula and a live per-factor breakdown (value,
      weight, point contribution) instead of the fictional formula and static table. Done 6
      Oct — `AuditDrawer.tsx` now calls `calculatePortfolioHealth` directly for this one entry,
      so the explanation can't drift from the displayed score. Verified by screenshot: live
      88% score, breakdown table sums to the displayed value.
- [x] State plainly in the entry that the 4 weights and 2 penalty constants are a judgment
      call, not an empirical fit — explainable *and* honest, not just explainable. Done 6 Oct
      — in the entry's `formulaDescription`.
- [x] Target 2, same session: the Home tab's ~2-6 second fake "Live Industry Updates" feed —
      label honestly or stop auto-refreshing, per the same "don't present fabricated as live"
      principle. Done 6 Oct — removed the recursive `setTimeout` entirely
      (`ExecutiveOverview.tsx`); the panel now shows the same 12 seed events as a static list,
      renamed "Industry Event Feed" with a "Demo content" badge replacing the green "live"
      dot. The same timer was also injecting fake "Auto-detected" critical alerts into the
      Smart Alerts panel (`dyn-al-*`, `Math.random() > 0.6` on a critical template) — removing
      it fixes that too, which is a bigger fix than the feed label alone. Verified: alert count
      and feed contents byte-identical before/after an 8s wait in a live headless check; no
      console errors; 27/27 smoke.
- [x] Target 3: extend the same real-formula-or-honestly-flagged treatment to the other KPIs
      Prashant walked through live. Done 6 Oct. Audited each against current code rather than
      trusting `formulas.md` (23 Sep, predates the live wiring), and found the audit drawer was
      worse than catalogued: it cited **database columns that do not exist**. New
      `src/components/dashboard/auditLiveContent.ts` builds every explanation from the same
      live data the card renders, so the two cannot drift.

      | KPI | Was | Now |
      | --- | --- | --- |
      | Portfolio Revenue / Total Revenue | drawer said $851.4M, fabricated monthly table | live $473.0M, real category split that sums to the headline |
      | Portfolio SKU Count / Active SKUs | said 100 | live 119, and states "sold in this window" ≠ an ERP active flag |
      | Growth Rate | said 8.4%, invented quarterly table | live 8.30%, names the prior-window convention, shows NULL honestly |
      | Gross Profit | said $308.1M | live $182.3M, real COGS bridge off the GENERATED column |
      | Gross margin % | said 36.2% | live 38.55%, states it is revenue-weighted |
      | Value Diluting SKUs | **no entry — the card opened nothing**; card said 12 | live 82 of 119 below the 38.55% portfolio margin; card now live too |
      | Orders — Today | cited `order_id`, `order_timestamp` as [DIRECT] | **there is no orders table**; says so |
      | Forecast Attainment | cited `forecast_units`, `actual_units` | **no forecast exists in the data**; says so |
      | Net Profit | cited `opex` as [DIRECT] | **no opex/SG&A/tax anywhere**; says so |
      | Total SG&A Overhead | **no entry — the card opened nothing** | says plainly it has no expense data |

- [x] Target 3 also removed three systemic fabrications that sat on *every* audit drawer,
      including the honest ones from Target 1:
      - A `FORMULA VERIFIED` badge shown unconditionally — stamping verification on figures with
        no formula and no source table. Replaced with a real provenance badge
        (`LIVE FROM WAREHOUSE` / `NO DATA SOURCE` / `ILLUSTRATIVE SAMPLE`, or none when nothing
        has been audited). This badge is arguably why the audit trail lost credibility: it
        asserted verification loudest exactly where there was least.
      - `getConfidenceScore()` — returned `92 + hash(metric_name) % 7`, a "confidence" figure
        derived from the letters of the metric's name. It was imported but never rendered;
        deleted.
      - `getMetricTrend()` — a hardcoded per-metric lookup printing e.g. "+8.4% vs last month"
        next to a live value that had moved elsewhere. Deleted. The pill now renders only from a
        real computed comparison, which today means Portfolio Revenue alone. `getMetricStatus()`
        also stopped claiming `OPTIMAL / ON-TRACK` for everything, a verdict nothing computed.

- [x] Target 3 follow-on, found while verifying: the live Gross Profit card showed $182.3M
      against a **stale $320M target and a 290-308 sparkline** from the rejected baseline,
      making a healthy margin read as a 43% miss. `KPI` gained optional `target`/`hist` so a
      caller with live data overrides `KPICard`'s baked-in table; Gross Profit now draws its
      sparkline from `live.trend` and claims no target, because the data holds none. Net Profit
      and SG&A cards are labelled `Illustrative — no cost basis in data` on the card face, so
      the drawer is no longer the only place that admits it. Three `KPI_TOOLTIPS` entries that
      quoted superseded figures were rewritten to describe provenance instead.

- Verified: `npm run lint`, `npm run build`, `npm run smoke` 27/27, `npm run test:api` 14/14,
  plus headless checks of all 10 drawers (badge + value + card/drawer agreement) and of the
  offline path, which falls back to the static entry and labels it `ILLUSTRATIVE SAMPLE`.


### O18 — Generate all missing data  *(done 7 Oct; wired 8 Oct)*
Step 1 of the user's order: generate → wire → architecture and process-flow diagrams. Plan:
`C:\Users\sangr\.claude\plans\mossy-hatching-perlis.md`. Detail of every table:
`documentation/data_model_specification.md` §13.

**Found and fixed in existing data**
- Every SKU grew 8.28–8.33% — the lifecycle story could not be computed. Now 23 decliners
  (−22% to −2%), growers to +14%, 4 launches in 2024 and 6 in 2025 (Intro). Portfolio still +8.30%.
- 22 of 28 SKUs named "BrandX …" carried another brand's `brand_id`. Fixed.
- Netherlands came out highest-margin against the documented lowest. Fixed via a country price index.
- `rationalization_scenario` held typed safety-stock figures and zeros. Now computed
  (Full Rationalize: 45 SKUs, −13.3% revenue, +1.16pp margin, 42.5% safety stock freed).

**New tables** (all reconcile or are labelled): `fact_price`, `dim_customer`,
`fact_customer_sales`, `fact_listing`, `fact_plan`, `fact_forecast`, `fact_inventory`,
`dim_launch`, `launch_gate`, `supplier_notice`, `dim_cost_assumption`, `fact_opex`,
`sku_fixed_cost`. Implied 2025 EBIT 14.3% on the labelled cost assumptions.

**Visible effects already** (screens reading live data): `fact_sales` is 357,471 rows (was
368,013); headline $473.0M / 38.51% / +8.30% / 119 unchanged; `generated.ts` re-exported.
`npm run smoke` 27/27, `test:api` 14/14.

**Wiring — thread by thread** (plan: `C:\Users\sangr\.claude\plans\mossy-hatching-perlis.md`;
sequencing confirmed by the 7 Oct call below). 14 new SQL functions added to
`03_derive_metrics.sql` across threads 1-5 in one pass (all read-only, all tested against
live data before any frontend change); frontend wired thread by thread with a lint/build/smoke
checkpoint after each.

- [x] **Thread 1 — Portfolio Health (tabs 0, 1, 6), done 7 Oct.** `fn_sku_segments`,
      `fn_portfolio_snapshot`, `fn_cannibalization`, `fn_rationalization_scenarios`,
      `fn_alerts`, `fn_forecast_accuracy`, `fn_customer_insights` + 11 API endpoints.
      - Lifecycle stage/score (`LifecycleHealthPanel.calculatePortfolioHealth`) now takes live
        growth/margin (windowed) and complexity/stockouts (snapshot) via a new `liveSkusList`
        adapter, instead of the typed `SKUS` array — same scoring logic, live inputs.
      - Orders Today → **Units Sold — Last Month** (real, `fn_portfolio_kpis(1)`); Forecast
        Attainment → real WAPE-based attainment (`fact_forecast` vs `fact_sales`). Both drop
        their fabricated target and comparison text when live (no "+12.3% vs yesterday" on a
        real number).
      - Home: Critical Alerts, the Smart Alerts feed, Category Performance, Customer Insights
        and Regional Forecast all switched from typed/fictional to live (`fn_alerts`,
        grouped `fn_sku_performance`, `fn_customer_insights`, `useLiveRegionalFulfillment`
        reused). Regional Forecast now shows the real 3 European regions, not APAC/Americas/EMEA.
      - Top-Down Drill's per-region SKU shortlist: real top-SKUs-by-sales
        (`fn_region_sku_shortlist`), replacing the curated `REGION_SKUS` list.
      - Portfolio PCI and Critical Alerts audit-drawer entries made live (reachable via
        Ctrl-K search and the Home card respectively); both show a `LIVE FROM WAREHOUSE` badge.
      - Verified: `npm run lint`, `npm run build`, `npm run smoke` 27/27, `npm run test:api`
        14/14, plus headless checks of the Home panels and both audit drawers against the DB.
- [x] **Thread 2 — Profitability (tab 3), done 7 Oct.** `fn_pnl`, `fn_pnl_by_category`.
      - VP strip: Net Profit and SG&A now computed live from `fn_pnl` (were "no-source" since
        O17) — every cost term below gross profit is a `dim_cost_assumption`-labelled
        assumption, stated as such on the card and in the audit drawer (no provenance badge,
        matching the Portfolio Health Score's mixed-provenance precedent — real computation,
        assumed inputs, neither "live" nor "no-source" alone is honest).
      - PM/Pricing P&L simulator: sliders (units/price/cost/logistics/overhead) now seed from
        real portfolio averages (`fn_portfolio_kpis`, `fn_pnl`) instead of typed constants —
        price/cost are real $/unit, units is back-solved so the existing `units×price/100`
        formula reproduces real monthly revenue exactly. Still fully editable ("what if").
        Promo and Overhead are seeded in $M from `fn_pnl` (marketing; SG&A + per-SKU fixed
        cost) — corrected in the 7 Oct audit, see below.
      - Margin Velocity Alerts → real promo margin erosion per SKU (`sku_metrics.margin_erosion`,
        via `skuSegments`, already fetched for thread 1). Break-even SKU Radar → real SKUs
        below 20% gross margin, ranked by net sales (`live.skus`, already fetched).
      - `REGIONAL_DATA` (Regional Opportunities panel) checked and left alone: it is a real
        generated export (`generated.ts`, from the Python generator), not fabricated — just
        not live-refreshed. Confirmed correct post-Phase-1 (Netherlands now lowest-margin,
        34.53%). Lower priority than anything actually fake; revisit only if regenerating the
        dataset without redeploying becomes a real workflow need.
      - Verified: `lint`, `build`, `smoke` 27/27, `test:api` 14/14, plus a headless check of
        the VP strip + Net Profit audit drawer and the PM view's P&L inputs, margin velocity,
        break-even and regional panels against the DB.
- [x] **Thread 3 — SKU Rationalization (tabs 4, 9, 10, 11), done 8 Oct.**
      - 7 Oct: shared KPI pool (Rationalize Candidates, Long-Tail Burden, Revenue Tail Risk, Avg
        Complexity, Peak Stockout Freq.) and their audit drawers live; VP "Sunset Candidates"
        and Pricing "Rationalize Candidates" now agree (**43** after the 7 Oct regeneration).
      - 8 Oct: **`fn_sku_rationale(p_months)`** classifies the real SKUs, one primary factor
        each, first match wins: supplier notice -> declining sales -> margin < portfolio - 8pt
        -> stockout rate > 2x portfolio -> smaller SKU of a pair with rho <= -0.5 -> long-tail
        Rationalize -> growth >= 12%. Action follows the factor (Discontinue / Consolidate,
        Reposition, Reformulate / Redesign, Invest / Expand). Also returns the portfolio margin
        without the SKU (no demand transfer). 12m: 54 SKUs flagged (37 / 0 / 12 / 5 by action;
        every 12m decliner is a long-tail Rationalize SKU, so Reposition is empty at 12m and
        fills at shorter windows). 2 refinements after the first run: cannibalization flags
        only the smaller SKU of a pair (it had told a $9.9M growing SKU to discontinue), and
        decliners go to Reposition unless long-tail.
      - Tab 9: factor cards (Financial 25, Portfolio 19, Supply Chain 10; Customer & Market and
        Regulatory 0, labelled "No data source"), roadmap bar and step cards, driver chart,
        phase modal (categories, real regions, stages, insights, SKU table) and the 6 alert
        cards all from `rationaleLive.ts`. Analyze panel: root causes are every rule the SKU
        meets; the "perks" table compares with the portfolio instead of projecting invented
        futures. Fixed a phase mapping bug (Q2/Q3 sent the wrong action filter to tab 10).
        Live factor cards open tab 10; the typed deep-dive pages remain only offline.
      - Tab 10: the 54 real flagged SKUs replace 200 generated rows; real regions/categories in
        filters; RCA panel, margin tiles and the "simulate" table use the SKU's own figures
        (net sales removed, portfolio margin with/without it); typed evaluation cards hidden.
      - Tab 11 (Task Tracker): workflow state, unchanged.
      - Global "How This Evolves" panel: Full Rationalize figures live; `AGENT_ROSTER` and the
        agentic paragraph rewritten without retired-baseline numbers.
      - Still typed: the five deep-dive pages (`RationalisationDrillDowns.tsx`, offline only now)
        and `MarginWaterfallChart` / `SkuCategoryBenchmarks` (offline only now).
- [x] **Thread 4 — Assortment Planning (tab 8), done 8 Oct.** New `fn_assortment_summary`:
      max SKUs selling in a country (Italy 119), long-tail share (72.3%, 86 SKUs <1% revenue —
      expected with 119 SKUs, the drawer says so), gross margin per selling SKU, cannibalization
      index (mean |rho| of 187 significant negative pairs, snapshot) and listed-never-sold (82).
      KPI cards: live values, trend text and hover text, target "—"; the delist slider no
      longer overwrites live cards with its typed coefficients. 4 live audit drawers. "Shelf
      Productivity" renamed "Availability-Adjusted Value" everywhere it is displayed (formula
      unchanged). Still typed: the slider's own what-if coefficients and the staged-action
      cart values.
- [x] **Thread 5 — Launch Readiness (tab 2), done 8 Oct.** User chose "generate the missing
      data" over dropping the panels that had no source.
      - **Data (labelled assumptions, `config.py` "Launch targets", own RNG stream
        `launch_targets` so no other table moved):** `dim_launch.lead_region` (launched SKUs:
        derived — region of largest first-year sales; pipeline: drawn by category's regional
        sales mix), `dim_launch.expected_year1_revenue_usd` (pipeline: category median of
        launched SKUs' annualised year 1 × 0.7-1.3; launched: own year 1 ÷ a 0.8-1.25 plan
        error), `launch_gate.reviewer_role` (a role per gate, not a person). `validate.py` check
        32; 30/30 pass.
      - **SQL:** `fn_launches` adds lead region, plan, actual annualised year 1 (computed from
        `fact_sales`), plan attainment, next gate due and `risk_level` (High = overdue gate;
        Medium = next gate due within 45 days). `fn_launch_gates(NULL)` returns all gates;
        new `fn_launch_summary`. 3 new `04_validate` checks (61/61), 3 registry rows.
        Endpoints `/api/launches/summary`, `/api/launches/gates`; 1 new API test (23/23).
      - **Screens:** VP and PM views read the 15 real pipeline launches (typed `VP_PRODUCTS`
        kept as offline sample). Real 3 regions, categories and quarters in filters; status
        tiles from `risk_level` (readiness thresholds misread early-stage launches as delayed);
        escalations = the 3 overdue gates; financial chart = plan at risk / budget / spent with
        the typed ×2.62-style multipliers gone; gate timeline maps 6 DB gates onto the 5 UI
        stages (Concept + Business case share one) with a new `Overdue` status; "simulate
        delay" slips the Medium-risk launches. Tab-2 KPI strip: Overall Readiness 39%,
        Launches at Risk 3 of 15, Launch Revenue at Risk $4.5M of $30.7M, Launch Plan
        Attainment 102% — each with a live audit drawer. "AI Risk Predictions" shows a
        roadmap note when live (7 Oct decision).
      - Still typed: the 8-dimension readiness simulator (`getProductDimensions`, hash-seeded)
        and the escalation-resolution/email flows. No source exists for per-dimension readiness.
- [x] **Thread 6 — Market Signals (tab 5), done 8 Oct.** New `fn_signals(p_months)`: every
      `fn_alerts` alert plus region x category demand shifts (3 fastest-growing cells above
      portfolio growth = Opportunity; any declining cell = Demand), each with category, region,
      dollar impact (what it is depends on type — see the SQL comment), the rule and an action.
      12m: 22 signals; 3m: 42. New `fn_category_trend` (weekly/monthly, indexed to 100) drives
      the momentum chart (7 real categories). VP view: feed, filters, region map, Risk
      Exposure (each SKU counted once), Opportunities, Regions Alerted and Resolution Rate
      (resolved this session — no history table) live. Competitor Alerts, AI Risk Predictions,
      Market signals, Competitive Intelligence and NPS show "No data source" / roadmap panels
      instead of typed figures. PM view: the competitor console (rupee-priced Lay's/Frito
      Balaji demand curves) and SKU tracker give way to the same statement. Still typed: the
      Portfolio Saturation dials, and the resolve/email flows' named contacts.
- [ ] Thread 7 — Agent Orchestrator: skipped, no computed figures exist on that tab.
- [x] **Diagrams, 8 Oct.** `documentation/system_architecture_and_data_flow.md` (tracked):
      1 architecture + 8 data-flow diagrams (overview + one per thread, lineage chain from the
      team deck: source -> input -> calculation -> rule -> KPI/signal -> agent -> recommendation,
      status-coloured). `documentation/as_is_process_lineage.md`: diagram 10, the deck's 8 As-Is
      steps annotated with supporting tables/functions and gaps. All render in mermaid-cli and
      follow the Excalidraw-safe rules. Old `system_architecture.md` marked superseded. Next:
      walk through with Sreeja. (Green Tea RTD "$0.40M" on deck slide 8: user fixing manually.)
- [ ] Re-issue `data-points-by-thread.docx` once all 7 threads are wired (not per-thread).
- [ ] Then: system-architecture and process-flow diagrams, with Sreeja (see the 7 Oct call note).

**7 Oct — audit of the wiring work above (user asked "is there any issue in the previous work").**
Found and fixed, in this order:
- **Data: stockout rates.** 10 SKUs had stockout flags on >50% of their rows (5 pre-existing,
  5 from the launch changes), because targets were split by seed weight, not by how many rows a
  SKU has. `demand.sku_stockout_targets` now allocates by exposure (seed × rows) with a 35% cap
  (`config.STOCKOUT_MAX_RATE`), plus a new `validate.py` check. Regenerated: 29/29 Python, 58/58
  SQL, `fact_sales` still 357,471 rows, headline targets unchanged. Rationalize segment 45 → 43.
- **SQL.** `fn_alerts` stockout rule compared raw counts across windows of different length →
  now compares rates (stockouts ÷ transactions); false stockout alerts gone (19 alerts total).
  `fn_forecast_accuracy` returned 1 − WAPE labelled as attainment → now returns both
  `attainment_pct` (Σactual ÷ Σforecast, 91.9%) and `accuracy_pct` (1 − WAPE, 72.8%).
  `fn_pnl`/`fn_pnl_by_category` charged a full year of fixed cost to any window → pro-rated by
  months in window; tax now revenue-weighted by country. EOL alert titles read "supplier
  supplier discontinuation" → fixed. New `fn_customer_category_insights` and `fn_region_mix`.
- **Health score.** Live stockout input was a raw window count, which saturated the penalty for
  every SKU → now the per-SKU stockout rate; penalty = average rate in pp, capped at 15.
- **P&L simulator.** Overhead was seeded per-unit but the EBIT formula takes $M → EBIT was
  wrong. Now Promo = marketing $M, Overhead = SG&A + fixed SKU cost $M; EBIT 14.7% = `fn_pnl`.
- **Cards.** Forecast Attainment shows the real attainment with accuracy and bias in the delta
  line; live audit drawers for it and for Units Sold — Last Month. The 5 snapshot KPI cards no
  longer show invented targets/sparklines (target "—", flat line) and their hover text is
  computed from live data (`KPI.tooltip`), as are Net Sales / Gross Margin / Concentration.
- **Home.** Customer Insights lists each category's top 5 accounts by sales in that category
  (most category tabs were empty before). Regional Forecast says "Actual vs Prior Window" when
  live; its modal shows the real category/channel mix and data-derived observations, and drops
  the typed people, emails and plans. Smart-alert modal explains live alerts from the alert row
  and the rule that raised it — the title-keyword fallback could match a real SKU name
  (e.g. "Fabric Softener") and show invented stock numbers.
- New endpoints `/api/customers/by-category`, `/api/regions/mix`; `test:api` now 22 (3 new
  tests: region mix sums to the headline on both dimensions for every period, 7 categories × 5
  accounts, attainment ≠ accuracy). Verified: lint, build, smoke 27/27, headless checks.

**9 Oct, deck review with Prashant (`Research_doc/Daily_calls/09-10-2026.txt`).** Business-case deck
rebuilt as v2 (9 slides, `Research_doc/Presentastaions/VLabs_Portfolio_Intelligence_Business_Case.pptx`;
v1 backed up in the session scratchpad). Decisions recorded:
- Message is **"weeks to hours"**, justified by connected data, scheduled refresh, SKU × market × region
  visibility and proactive alerts. **Refresh frequency is set per client; 4–6 hours is the feasible
  default we quote** (the demo itself runs on generated data, not a live feed).
- Value shown in **percentages**: 67% faster decisions, ≈ 67% of revenue at risk protected, 75% less
  analyst effort, 100% SKU × market coverage — labelled as estimates for a 3-month pilot.
- In-house build time ("about two years, like Unilever") is stated as **our team's experience**, not a
  public figure. Integration estimate: 4–6 weeks with data available, +2–4 weeks if data needs prep.
- Positioning: FMCG/CPG first; sits on top of existing systems (not a replacement); scalability =
  adding data feeds. New evidence on slides: Nestlé (>20% fewer SKUs, ≈ $750M revenue walked away
  from), Kraft Heinz (≈ 20% fewer SKUs, cut anything with negative margin), Hershey/Nike recovery.
  Not used (unverified): Nestlé "27,000 SKUs", J&J, PepsiCo/Coca-Cola LatAm.
- [ ] App: add a **month / quarter / year period filter** to actual-vs-target views (Prashant: "just a
      filter", low priority customisation).
- [ ] Still to prepare: one-slide GTM approach (lowest priority, 8 Oct call).

**7 Oct, internal call (`Research_doc/Daily_calls/07-10-2026_1200_am call.txt`):** confirms the
same 7-thread breakdown and the generate-then-wire sequencing — no change to priority. Two new
items surfaced:
- **O19 — Role-based data access** (not started, not scoped): which persona can access which
  dataset at the backend, not just which UI elements render for them. Sandeep raised it,
  explicitly deferred ("we need to think through that"). Needs a decision with Prashant before
  any work starts.
- **Architecture diagrams, content clarified for when that phase starts**: As-Is = the current
  *industry* process (reuse Amita's prior work, don't redo it); To-Be = our solution's tables,
  columns, calculations and status per metric — i.e. exactly `data-points-by-thread.docx`.
  Sreeja is assigned to work on this with the user.
---

## 8–10 October — new requirements and remaining work

**8 Oct call (`Research_doc/Daily_calls/08-10-2026.txt`).** Positioning confirmed by Prashant:
V-Labs gives *decision support, not optimisation* — it shows that a SKU has underperformed in a
market over a chosen period, and the user decides. New build request below (O20).

**10 Oct call (`Research_doc/Daily_calls/10-10-26.txt`) — leadership review of deck v2.** The
reviewer is sold on the idea, but the narration was too jargon-heavy for a non-specialist. Key
reframing: **V-Labs is not sold as a product; it is a showcase that wins client trust in Acies**
on two axes — functional depth and technology innovation (GenAI, agentic AI, "AI for BI"). Like
the AI-for-BI precedent (GPC asked Acies to build its own version), clients should like the
approach and ask Acies to build something similar. Pitch the thinking and the architecture, not a
feature list. Talk-track corrections from the call: signals are internal and batch-refreshed (no
"real-time market updates" claim); revenue protected is ≈67% (not 70%); Sphera is 40+ *hours*.
(The EIM / Yashastri meeting mentioned at the end of the call is for another client's POC — not
this project.)

### O20 — Sub-country regions: drill from country to region  *(8 Oct call, Prashant)*
Clicking a country (e.g. Germany) breaks it into **six regions**, named generically "Region 1–6"
for the demo (a client supplies real names). Per region: net sales, gross margin, and **which SKU
is underperforming where** — so the decision becomes "drop SKU X in Region 3, add capacity in
Region 5". Today the data stops at 7 countries / 3 multi-country regions.
- [ ] Data: recommended — an allocation table splitting each SKU × country's sales across its six
      regions, so country totals (and every existing check) stay identical. Alternative — a region
      on every `fact_sales` row (multiplies the fact table; rejected unless needed).
- [ ] SQL functions for region performance and the region × SKU underperformer list; registry rows.
- [ ] UI: country → region drill on Top-Down Drill (tab 6) and Assortment (tab 8).
- [ ] Validation: regions sum to country for every period.

### O21 — Strategic vs genuinely weak SKUs; ABC per market  *(8 Oct call — candidate, not decided)*
Sandeep asked how the system tells a genuinely weak SKU from a strategic one that is slow now but
needed later. Prashant's answer was decision support over a chosen period. Candidate additions:
an **ABC class per SKU × market** that moves with demand and seasonality (using sales plus
`fact_forecast`), and a **"strategic" flag** that keeps a SKU out of exit recommendations.
- [ ] Confirm scope with Prashant before building.

### O22 — Wire the three loaded-but-unread tables
`fact_plan`, `fact_inventory` and `fact_price` are generated and loaded, but no SQL function reads
them (see `documentation/as_is_process_lineage.md`). Wiring them closes the largest gaps in As-Is
steps 1, 3, 5 and 7 without new data.
- [ ] `fact_plan` → actual vs target (Home Revenue Trend, target lines on cards).
- [ ] `fact_inventory` → days of cover / overstock signals; inventory evidence in root cause.
- [ ] `fact_price` → price history for the pricing what-if and elasticity (Pricing tab 5 view).

### O23 — Screens still showing typed content
- [ ] Home Revenue Trend (actual and target) — via O22 `fact_plan`.
- [ ] VP Profitability tree, scenarios and YTD rows — still on the $851.2M baseline.
- [ ] AI-initiative cards on VP Profitability → roadmap section (decided 7 Oct, not done).
- [ ] Pricing views: Launch Readiness Tracker / New SKU Brief (tab 2); elasticity sign-off (tab 5).
- [ ] Tab 4 VP promotional-erosion top-10 list (data is in `sku_metrics`).
- [ ] Launch 8-dimension readiness simulator; Signals "Portfolio Saturation" dials.
- [ ] Named contacts in resolve/escalation email flows (Launch, Signals, Home modals).
- [ ] Industry Event Feed (Home) — illustrative; label or remove.
- [ ] Tab 9 deep-dive pages and tab 10 offline root-cause text (offline only now).

### O24 — Month / quarter / year period filter  *(9 Oct call)*
- [ ] Add a period-grain filter to actual-vs-target views. Prashant: "just a filter", low priority.

### O25 — AI layer: semantic layer, conversational analytics, agentic root cause  *(10 Oct call — strategic)*
The reviewer's main ask: show technology innovation. Builds on what exists — every figure is one
documented SQL function and `metric_registry` defines every metric, which is the seed of a
semantic layer.
- [ ] Semantic layer: extend `metric_registry` with grain, dimensions and allowed filters so an
      agent can only ask well-formed questions; pre-aggregated, small inputs for the model (the
      WK POC lesson: do not dump raw tables on the agent).
- [ ] Conversational analytics ("AI for BI"): type a question, get the figure plus its source
      function and formula (reuse the audit drawer's provenance).
- [ ] Agentic root cause: for an alert (e.g. revenue drop on a SKU), generate 4–5 hypotheses from
      the live functions, rank them, recommend one, name the owner role. Makes the Agent
      Orchestrator (tab 7) real.
- [ ] LLM calls live in the Python tier only (CLAUDE.md); model and cost choice to be decided.

### O26 — Launch viability intelligence  *(10 Oct call)*
Before a launch: is it viable, and what outcome to expect? Builds on `dim_launch` (year-1 plan),
launched SKUs' actual year-1 sales and category benchmarks.
- [ ] Define the viability signal (e.g. plan vs category benchmark vs comparable launches).

### O27 — Close the loop: from recommendation to action  *(10 Oct call — "third system" objection)*
Users will ask: "I already use two systems; after V-Labs recommends, I still go back to my ERP."
- [ ] Decision log (decision, owner, status, expected vs actual impact) — the deck's
      Approve / Act and Measure stages; also persists Task Tracker (tab 11).
- [ ] Signal log (raised / resolved) — makes Resolution Rate real.
- [ ] Export / hand-off of a decision to the operational system (relates to O13 export).

### O28 — Deck v3 per the 10 Oct review
- [ ] Open with the **landscape**: typical challenges and the systems companies already use
      (planning tools such as o9; ERP such as SAP or Oracle; built-in BI), and why siloed systems
      still slow decisions.
- [ ] Plain-language **definitions**: product lifecycle (launch → growth → maturity →
      discontinuation), revenue leakage (undetected loss) vs revenue drop, users by role.
- [ ] **Integration and closing the loop** (O27 message).
- [ ] **Technology innovation** slide: semantic layer, conversational analytics, agentic
      hypotheses — clearly marked built vs planned (O25).
- [ ] Reframe as "what Acies can do", not a feature list; keep the evidence slides.
- [ ] One-slide GTM approach (lowest priority, from 8 Oct).
- [ ] Talk-track corrections listed above.

### O29 — Domain knowledge: talk to real product managers  *(10 Oct call)*
- [ ] Reach out to 20–30 product / portfolio managers on LinkedIn (including North America) for a
      20-minute advice call. Leadership will fund a $25–50 gift card where useful.
- [ ] Follow up the Mercedes-Benz contact arranged through a team member's senior.
- [ ] Team reading on product lifecycle, portfolio and revenue-management basics.

### O30 — Present to Mukunda  *(10 Oct call)*
- [ ] Schedule after deck v3 (O28); validate the solution and story with him.

### O31 — Phase-wise implementation plan  *(14 Oct, user request)*
- [x] Written 14 Oct: `documentation/Phase_wise_Implementation_Plan.docx` (plain, owner drop-downs,
      estimates in days/weeks). Order agreed: **data first** — P1 story (parallel), P2 complete the
      data, P3 regional depth, P4 AI layer, P5 close the loop + launch intelligence, P6 production
      readiness. ≈108–112 person-days, ≈13 weeks elapsed with two people on build.
- [ ] Team to fill owners and confirm decisions D1–D6 in the document.

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
| 6 Oct | O8 deferred; data-source audit + explainability (O17) becomes the priority instead | Leadership review call — Prashant directly challenged tab consolidation as not the priority, demanded proof of what's real vs. static |
| 6 Oct | Fake "Live Industry Updates" feed: stop auto-refreshing and label it demo content, rather than slowing the timer to a less noticeable interval | O17 Target 2. The call's whole theme was "stop presenting fabricated things as live", so tuning the fake-ness to be less detectable would have missed the point. Side benefit: the same timer was injecting fake "Auto-detected" critical alerts into Smart Alerts |
| 6 Oct | A metric with no data source says so on the card face, not only in its audit drawer | O17 Target 3. Net Profit and SG&A keep their figures (the demo still reads) but carry "Illustrative — no cost basis in data", so the drawer is not the only place that admits it. Blanking the tiles was rejected as needlessly destructive to the demo |
| 6 Oct | Removed the `FORMULA VERIFIED` badge, hash-based confidence score and hardcoded trend pills app-wide, not just on the audited metrics | O17 Target 3. Selective honesty is worse than none: leaving a verification stamp on the un-audited metrics while removing it from the audited ones would have inverted the signal. Badges now state real provenance or say nothing |
| 6 Oct | Where the data holds no target, claim none ("—") rather than carrying over the old baseline's target | O17 Target 3. The live $182.3M Gross Profit against the stale $320M target read as a 43% miss — a number made misleading by a *partial* migration, not by fabrication |
| 7 Oct | **Generate all missing data first, then wire, then draw the architecture and process-flow diagrams** | User priority. Wiring the screens before the data exists would mean wiring twice |
| 7 Oct | Inventory is **in scope** | User decision — settles the 6 Oct dispute |
| 7 Oct | Opex, SG&A, logistics and fixed costs: **generate as clearly labelled assumptions** | User decision. Net Profit / SG&A / EBIT become computable, but every screen using them must say the cost basis is assumed |
| 7 Oct | **Generate price history**, accepting that sales must be regenerated | User decision. Needed for a credible elasticity / pricing simulator |
| 7 Oct | **Generate customers** (retail accounts) | User decision — keeps the Customer Insights panel, backed by data |
| 7 Oct | Signals Board: **internal signals now** (rules over warehouse data); external market data later, only if a client exposes APIs | User decision |
| 7 Oct | Orders Today → **units / sales for the last month or last 3 months** (live) | User decision. There is no "today" in a dataset that ends 31 Dec 2025 |
| 7 Oct | AI-initiative cards on Profitability → **move to a Roadmap section**, no dollar figures | User decision |
| 7 Oct | Shelf Productivity → keep, wire to `sku_metrics`, **rename to "Availability-Adjusted Value"** (it is commercial value × (1 − stockout rate), not sales per shelf metre) | User decision; corrects the earlier "drop" advice |
| 7 Oct | The password in `a3a3c54` is a **local-only** database password | User clarification — lowers the severity of the security item; the no-push rule stands regardless |
| 8 Oct | V-Labs is **decision support, not optimisation**: it shows underperformance per market over a period; the user decides | Prashant, 8 Oct call |
| 8 Oct | Countries break into **six generic sub-regions** for the demo | Prashant, 8 Oct call → O20 |
| 9 Oct | Deck message "weeks to hours"; refresh frequency set per client, **4–6 hours** quoted as feasible | User decision after the 9 Oct deck review |
| 9 Oct | Value in percentages; **67%** faster decisions / ≈67% of revenue at risk protected | User decision |
| 9 Oct | In-house build time ("~2 years, like Unilever") stated as **our team's experience** | User decision — no public source exists |
| 10 Oct | **V-Labs is an Acies capability showcase, not a product to sell** — pitch the approach and the technology (GenAI, agentic, AI for BI), not features | Leadership review, 10 Oct call |

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
