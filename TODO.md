# TODO — Data Layer Migration

Tracking the move from hardcoded constants to a generated, validated dataset and a
PostgreSQL database.

**Last updated:** 14 September 2026
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
# 1. role + database  (note: port 5433, not 5432)
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U postgres -d postgres `
    -v app_password=2GuYYX4LFOJmpdsQL7dhihWG -f data/schema/00_create_role.sql

# 2. schema
$env:PGPASSWORD = "2GuYYX4LFOJmpdsQL7dhihWG"
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

### O4 — Reconcile `auditData.ts`
921 lines, 38 audit-trail entries citing specific figures that have now changed:
long tail 66.7% → 72.3%, PCI 0.5509 → 0.5961, Rationalize 35 → 46 SKUs,
tail risk 27.08% → 15.79%.

### O5 — Cannibalization displacement is not modelled
Correlations are derived from promo timing and reach −0.581, close to the UI's −0.62
reference. But promotions on one SKU do not actually reduce a sibling's units in the
demand model. The correlation is real in the data; the *mechanism* is coincidental.
Worth modelling explicitly if cannibalization analysis matters.

### O6 — Competitor intelligence dataset
Out of scope for phase 1. The blueprint's §5 playbook needs review counts, Google Trends
indices, bestseller rank and distribution coverage — none exist in the FMCG schema. A
separate source with its own grain and refresh cadence.

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
