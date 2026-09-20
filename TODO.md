# TODO — Data Layer Migration

Tracking the move from hardcoded constants to a generated, validated dataset and a
PostgreSQL database.

**Last updated:** 17 September 2026
**Branch:** `refactor/cleanup-and-architecture`

---

## Status at a glance

| Phase | State |
| --- | --- |
| 1. Schema design | **Done** |
| 2. Dataset generation | **Done** — 16/16 targets pass |
| 3. Dashboard wiring (partial) | **Done** — 7 arrays live |
| 4. Database | **Blocked** — postgres superuser password |
| 5. Dashboard wiring (SKUS) | **Open** — needs threshold audit |
| 6. Repo cleanup | **Blocked** — permissions |
| 7. Product review — metrics, tabs, competitors | **Done** — 3 reports, 17 Sep |
| 8. Metric integrity | **Open** — see O7 |
| 9. Tab consolidation, 12 → 5 | **Open** — see O8 |
| 10. Repo cleanup, phases A and B | **Done** — 20 Sep, 187 files removed |
| 11. Phase C — split the giant files | **Done** — 20 Sep, 4 files split into 16 |

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

The two modals and `VPLaunchReadinessView` shrank less because their remainder is one
contiguous JSX return. Splitting those means extracting panel sub-components and threading
props — real refactoring, not a move, so it was left out of this pass.

**Still to decide — `server.ts`.** It is an orphaned Express API: no npm script starts it
and nothing imports it. It is also the only consumer of nine `data.ts` constants
(`COMPANY_CONTEXT`, `CHANNEL_DATA`, `STOCKOUT_TOP10`, `PCI_DRIVERS`, `TOP_SKUS_REVENUE`,
`RATIONALIZATION_SCENARIOS`, `LAUNCH_PRODUCTS`, `LAUNCH_TIMELINE`, `SEGMENT_COLORS`,
`PROMO_EROSION_DATA`, `SKU_BURDEN_DATA`, `SIGNALS`), which is why those were left in place.
Delete it and they can go too; keep it as the seed of the API layer and they stay.

---

## Security

### S1 — Database password committed in `a3a3c54`
The `ppl_app` password was written in plain text into this file and committed.
**Contained:** the branch has never been pushed, and the `ppl_app` role does not exist yet,
so the value protects nothing. The plaintext has been removed from this file (17 Sep).

- [ ] **Before creating the role, generate a new password** and put it in `.env`. The
      committed value then becomes worthless and history needs no rewriting.
- [ ] **Do not push this branch** until that is done — the old value remains in history.

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
- [ ] **Remove the real trademark** "Coca-Cola 500ml" from the SKU list.
- [ ] Review category mix — 3 of the top 5 SKUs by revenue are apparel in an FMCG portfolio.

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
