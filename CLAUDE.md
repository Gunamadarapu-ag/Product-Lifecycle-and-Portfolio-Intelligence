# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git policy — do not commit or push

**Never run `git commit` or `git push`.** The user commits their own work.

Make edits, run verification, and report what changed — then stop. Staging (`git add`) is also
the user's call. This applies even when a task feels finished, when many files are
uncommitted, or when the user says "go ahead" about the work itself; treat commit and push as
a separate act only the user performs.

Reading git state is fine and often necessary: `git status`, `git diff`, `git log`,
`git show`, `git branch`.

There is a further reason not to push here: a database password was committed in `a3a3c54`
and that commit is already on `origin/Branch_G`. See the Security section of `TODO.md`.

## Commands

```bash
npm run dev          # Vite dev server on :3000
npm run build        # production build to dist/
npm run preview      # serve dist/ on :4173 — required before npm run smoke
npm run lint         # tsc --noEmit (type check; there is no ESLint config)
npm run smoke        # headless browser test, 3 roles x 9 tabs = 27 combinations
npm run api          # FastAPI backend on :8000 (reads PostgreSQL; Vite proxies /api to it)
npm run test:api     # 12 API integration tests against the real database
```

**Run `npm run api` alongside `dev`/`preview`.** Without it the app still works, but shows
built-in sample figures and a grey "Offline · sample figures" badge. The browser also logs the
failed `/api` requests as console errors, so **`npm run smoke` fails unless the API is up**.

`npm run smoke` needs a preview server already running on :4173. Override with
`BASE=http://localhost:3000 npm run smoke`. There is no unit-test framework — `smoke` is the
only runtime test. **Run it after any component change**: `tsc` proves a lazy-loaded chunk
compiles, not that it renders, and several tabs have failed only at runtime.

To test one combination, edit the `ROLES` / `TABS` arrays at the top of `scripts/smoke.mjs`.

**Coverage gap:** `TABS` is `[0..8]`, but tabs go to 11. The three SKU-rationalisation
sub-tabs (9 Rationalisation Home, 10 SKU Drill Down, 11 Task Tracker) are **not** smoke
tested. Verify those manually, or extend the array.

`smoke.mjs` retries a failing combination once before reporting it: `ProductMixClustering`'s
ScatterChart intermittently logs a Recharts attribute error when `ResponsiveContainer`
measures zero width on first paint. Only a repeated failure is real.

```bash
pip install -r requirements.txt        # exact pins; see "Determinism" below
python data/generator/main.py          # regenerate the dataset into data/output/
python data/generator/validate.py      # 16 reconciliation assertions
python data/generator/export_ts.py     # data/output/ -> src/constants/generated.ts
python data/generator/load.py --dry-run # check DB connection + CSVs, write nothing
python data/generator/load.py          # COPY all 13 tables in FK order (~45s)
```

The SQL calculation layer is installed and checked with psql as the app role. After any
reload, re-run both scripts (cmd.exe, one line each):

```
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U Pd_lc_app -d ppl_intelligence -f data\schema\03_derive_metrics.sql
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U Pd_lc_app -d ppl_intelligence -f data\schema\04_validate.sql
```

## The architecture fact that matters most

**The headline figures now come from PostgreSQL. Most of the app still doesn't.**

```
PostgreSQL --> SQL functions (03_derive_metrics.sql) --> FastAPI (backend/) --> /api
    --> src/api/liveData.tsx (one fetch per timeline period, shared via context)
    --> KPI strip, Home cards, Portfolio Health, SKU Rationalization "Revenue at Risk",
        Profitability "Gross Profit"
```

Wired since 29 Sep. The rules that make it work — keep them:

- **All arithmetic lives in SQL.** Each figure is one function in `03_derive_metrics.sql`
  (registered in the `metric_registry` table). FastAPI (`backend/app/main.py`) only calls
  those functions, and the frontend only formats their results. A new live figure means a new
  SQL function, not a calculation in Python or TypeScript.
- **`months` is the timeline selector.** Every function takes the trailing 1/3/6/12/24/36
  months, and growth compares against the prior window of equal length. The data covers
  24 months: 36 is clamped (`months_available`), and growth is `NULL` when there is no full
  prior window, never invented.
- **`04_validate.sql` (36 checks) and `backend/tests` (12 tests)** assert the targets
  ($473.0M, 38.55%, +8.30%, 119 SKUs, the Pareto anchors). They also assert that every
  breakdown sums to the headline for every period. That second rule is what stops two
  screens disagreeing.
- **Offline fallback is deliberate.** The static Vercel deployment has no backend. With no
  API, `useLivePortfolio` returns `status: 'offline'`, screens keep their built-in figures,
  and `LiveDataBadge` says so.

**Everything else is still the old path:** `constants/data.ts` / `generated.ts` / values
typed into components, and for timeline changes `utils/timeframe.ts` adds fabricated
hash-based "noise" (see `documentation/formulas.md`). In particular:

- **22 component files still read `SKUS[].rev`, which is ~22x too large** (TODO.md O1).
  Example: Mango Fizz 500ml displays $142M, but its real 2025 net sales are $11.2M. Live
  per-SKU revenue is available as `useLiveData().skuRevenueM[name]` (all 119 names match
  `dim_sku`). The lifecycle stage *classification* still uses `rev` pending O1's threshold
  audit — only its revenue totals were switched.
- VP Profitability's tree, scenarios and YTD rows are built on the $851.2M baseline
  throughout. Only the header Gross Profit card is live.
- Net Profit and SG&A have no cost basis in the data at all (pitch.md Q4).

Before "fixing" a number, find out which path produces it. If the database can supply it,
add or extend a SQL function and read it through `useLiveData()` — don't patch the constant.

## App shell

`src/App.tsx` (~776 lines) is the whole shell: role gate, header, sidebar, tab routing.

- **Three roles**, defined as a union in `src/types/dashboard.ts`:
  `'VP Product Management' | 'Product Manager' | 'Pricing and Margin Partner'`.
- **12 tabs**, all `React.lazy` chunks. Tab index is numeric and appears in `App.tsx` as bare
  comparisons (`activeTab === 9`), so renumbering tabs breaks logic in several places.
- **Session state lives in the URL hash plus `localStorage`** (`#tab=4&role=...&timeline=12m&theme=light`).
  That is what makes `smoke.mjs` able to deep-link into any role/tab pair.
- **Role branching is scattered**: ~36 `role === '...'` checks inside components, not
  centralised. Some tabs render an entirely separate `VP*View` component. When auditing what a
  role sees, check the live component — dead `*Old` components have existed here before and
  misled a previous audit.

Data files in `src/constants/`: `data.ts` (authored + re-exported computed),
`generated.ts` (machine-written — **do not hand-edit**, `export_ts.py` overwrites it),
`auditData.ts` (~58 KB of audit trails), `agentData.ts`, `layers.ts`.

## Dataset generator

`data/generator/` is 11 Python modules. `config.py` holds every target and tolerance.

**Determinism is a hard requirement.** Every RNG is seeded (`SEED = 20260909`) and
`validate.py` asserts 16 reconciliation targets. That is why `requirements.txt` pins exact
versions rather than ranges — a different NumPy or SciPy can move a target outside tolerance
and silently produce a different dataset. If you change a generator module, re-run
`validate.py`; 16/16 must still pass.

Known data defect: the source documents Netherlands as the lowest-margin country, but the
generator makes it the highest. Validation checks country revenue share but not margin order.

## Database

PostgreSQL 17 on **port 5433** (not 5432). Database `ppl_intelligence`, app role `Pd_lc_app`,
credentials in `.env` (gitignored; `.env.example` is the tracked template). 13 tables,
1 materialized view, 1 view; `fact_sales` holds 368,013 rows.

`data/schema/00_create_role.sql` takes `-v app_user`, `-v app_db`, `-v app_password` so it
tracks `.env` instead of hardcoding. Three traps that have already cost time here:

- **psql does not substitute `:variables` inside dollar-quoted strings.** `:'app_user'` inside
  a `DO $$ ... $$` block reaches the server verbatim and fails with `syntax error at or near ":"`.
  Use `SELECT format(...) \gexec` instead.
- **Mixed-case identifiers must be quoted.** `CREATE ROLE Pd_lc_app` unquoted folds to
  `pd_lc_app`, after which `-U Pd_lc_app` fails with "role does not exist". Emit identifiers
  through `format('%I')`.
- **The user runs commands in cmd.exe.** PowerShell's `&` call operator and backtick line
  continuation break there. Give single-line commands with absolute paths.

`pg_hba.conf` is currently set to `trust` for all local connections, so no password is
actually verified locally.

## Backend

**Python / FastAPI**, in `backend/`. Run it with `npm run api`; `vite.config.ts` proxies
`/api` to it for both `dev` and `preview`. Credentials are read from the repo-root `.env`,
the same file `load.py` uses. A Node/Express `server.ts` used to exist and was deleted — do
not reintroduce a JavaScript backend.

`vite.config.ts` still defines `process.env.GEMINI_API_KEY`, left over from a removed
`@google/genai` dependency. Any LLM calls belong in the Python tier, not the browser bundle.

## Program context and prior product review

This is **Lab 8** of an Acies AgenticBus program. Labs are **GTM assets** — demos built to
open VP-level conversations — not products. That framing decides arguments about scope: the
goal is a credible, explainable demo, not feature parity with Nielsen or Circana.

Two constraints from the brief are binding and should not be re-litigated:

- **Exactly five domain tabs** in the target state (the app currently has 12).
- **Six required KPIs.** Only two are properly computed today.

A three-part product review was completed on **17 September**. It is the source of TODO items
O7, O8 and O9, and it exists **only as published documents — nothing in this repo**:

| # | Report | Conclusion in one line |
| --- | --- | --- |
| 1 | Metric dictionary | Every metric defined, with justification. Found 2 of 6 required KPIs computed; revenue and margin each carry two competing baselines |
| 2 | Twelve Tabs to Five | Per-role audit of all 12 tabs and what each persona actually sees; recommends the consolidation in O8 |
| 3 | Worth Building? | Competitive landscape and whether this is worth building at all |

Artifacts: [1 · Metric dictionary](https://claude.ai/artifact/Q1JmpLj6Ly9chiGP2sH4Ci) ·
[2 · Tab audit](https://claude.ai/artifact/LCXiykgu3MfPb5RYuyLAot) ·
[3 · Competitive landscape](https://claude.ai/artifact/6fQTYvkiB8Vs1X4xJcELT5)

Google Docs, in [Acies Portfolio Lab — Reports](https://drive.google.com/drive/folders/1oeOPC1I54kBNnrLfIscDCxiCLIUnoXIA):
[1](https://docs.google.com/document/d/1v6Cre0WwNMBg4qI6fbdkA3i5MbfkgVBU7zXhbe2Lhbs/edit) ·
[2](https://docs.google.com/document/d/1pfcD4hJ0GjJB3gwQFjWYSFSs4loJoim6VinqQXQo2-U/edit) ·
[3](https://docs.google.com/document/d/1ZvMTreERw_DFyEpnYKbw04bhLigSEC7Xy2iWUvch85w/edit)

Earlier published work: [build brief](https://claude.ai/code/artifact/0afd68c0-d0c6-49d7-88bb-747af9c9cda7) ·
[data model](https://claude.ai/code/artifact/0a1fe036-50e3-4f5f-bd2a-e359dfa66f2b) ·
[validation](https://claude.ai/code/artifact/75c2af6d-f999-4d0c-8c72-7c6198994093)

Read the relevant report before redesigning tabs or redefining a metric — the analysis is
done, and redoing it from the code will reach worse conclusions than the reports did.

## Treat repository documents as dated, not authoritative

`README.md` says "102 SKUs"; the dataset has **119**. Other documents have said 120, and 100.
`documentation/architecture_proposal.md` says "240+ SKUs". Several documented claims have
turned out to be written from stale readings. Verify counts and file facts against the code
or the database before repeating them, including claims made in `TODO.md`.

`TODO.md` is the live work tracker — current priorities (O1–O9), blockers, the decisions log,
and links to every published document. Read it first in any session that has it.

**But it is in `.gitignore`** (line 21), as is `documentation/system_architecture.md`
(line 22). Neither is in version control, so a fresh clone has **neither the work tracker nor
the architecture diagrams** — and no pointer to the three reports above, which is why their
links are duplicated into this file. If `TODO.md` is missing from the working tree, do not
assume there is no outstanding work; ask.
