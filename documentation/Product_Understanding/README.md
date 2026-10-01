# Product Understanding — start here

One place to go from zero to a complete, accurate picture of this product: what it is, what it
actually does today versus what it appears to do, who it's for, how it compares to the market,
and what's still open. Nothing here is new research — it's an index over what already exists,
organized by what to trust and in what order to read it.

**The single most important fact about this codebase**, repeated throughout everything below:
*what a screen shows and what's actually computed are often two different things.* Several
documents here were written specifically because a screen's polish and its correctness turned
out not to be the same question. Read with that in mind, including — especially — the
documents written by the previous team, several of which describe an intended, polished self-
image rather than what a line-by-line audit later found. Each entry below says which kind it
is.

---

## Read this first, in this order

1. **[CLAUDE.md](../../CLAUDE.md)** *(repo root)* — the architecture as it actually stands
   today: the two data paths, what's wired to the live database versus still hardcoded, the
   dataset generator, known traps. Written for an engineer about to touch the code, but it's
   the most current and most load-bearing document in the repo. Start here if you're going to
   run or modify anything.
2. **[README.md](../../README.md)** *(repo root)* — the quick project overview. Treat its
   specific numbers with caution: it says "102 SKUs," the dataset has 119. Good for a 60-second
   orientation, not for any number you'd repeat to someone else.
3. **[TODO.md](../../TODO.md)** *(repo root — gitignored, so it won't exist on a fresh clone;
   ask whoever has it)* — the live work tracker. Current build status, every open item (O1–O14),
   decisions made and when, a dated changelog. This is the one document in the whole set that's
   actually kept current — everything else below is a snapshot as of the date on it.
4. **[pitch.md](../pitch.md)** — a decision-request letter to Lab 8 program owners (21 Sep),
   with a dated status update added at the top (1 Oct) correcting what's changed since. Twelve
   open product questions, each with a recommendation and a default. Read this to understand
   what's *undecided*, not what's built.

---

## The three product reviews — 17 September 2026

A structured, code-level audit — not opinion, not a pitch. Each finding is cited to a specific
file and line. These are the most rigorous documents in this set, and each now has a short
"what's changed since" note at the bottom reflecting status as of 1 Oct — added here, not in
the originals, so the two can be compared.

| Report | Answers | Verdict |
| --- | --- | --- |
| **[1 · Metric Dictionary](report-1-metric-dictionary.md)** | What does every number mean, and is it real? | 2 of 6 required KPIs properly computed; revenue and margin each have two competing values |
| **[2 · Twelve Tabs to Five](report-2-twelve-tabs-to-five.md)** | What does each of the 3 personas actually see, tab by tab? | 12 tabs ship against a 5-tab spec; 3 of the 5 required tabs are built twice (once per role) |
| **[3 · Worth Building?](report-3-worth-building.md)** | Who already solves this, and should we compete with them? | Not worth competing as software (o9, Kinaxis, SAP, Aera own the category) — worth building as the GTM demo it was specified to be |

**If you read only one, read Report 3** — it's the one whose conclusion hasn't gone stale, and
it's the direct basis for how this product should be pitched (see "Business & market context"
below).

---

## Business & market context

What this product is *for*, who it's *for*, and how to talk about it to someone outside the
build team.

- **[Report 3 · Worth Building?](report-3-worth-building.md)** — the competitive landscape:
  18 companies across 7 market segments, and the recommended positioning ("the decision layer
  on top of the stack a client already owns, not a replacement for it"). Still the current
  recommendation as of 1 Oct — see `TODO.md` O14.
- **[Portfolio & Product Lifecycle Intelligence - Research Documentation.docx](../Portfolio%20%26%20Product%20Lifecycle%20Intelligence%20-%20Research%20Documentation.docx)**
  — earlier (22 Jun 2026) market research from the previous team. Its most useful content
  isn't duplicated in Report 3: an explicit **ideal customer profile** (Tier 2 mid-market FMCG,
  $100M–$3B revenue, 100–1,000+ SKUs — companies that have outgrown Excel but can't afford a
  Tier 1 platform budget) and an ERP/BI deficiency argument for why that segment is underserved.
  Read Report 3 for the competitive landscape; read this for *who specifically* the pitch is
  aimed at. Not re-verified against current sourcing standards the way Report 3 was.
- **[industry_gap_analysis.md](../industry_gap_analysis.md)** *(and its [.docx
  counterpart](../FMCG_Gap_Analysis.docx), which appears to be the same content exported)* —
  external industry research (Bain, McKinsey, BCG citations) on FMCG-wide pain points: SKU
  proliferation, supplier over-integration, promotional margin erosion. This is about the
  *industry*, not this specific product — background for why any tool in this space matters,
  not a claim about what this tool does.
- **[dashboard_justification.md](../dashboard_justification.md)** — a previous-team,
  component-by-component business justification with external citations, plus a gap analysis
  of what each tab is missing. Useful as research (e.g. it independently recommends an OTIF
  card for the Home tab — exactly what the 30 Sep team call later asked for, see `TODO.md`
  O11). Written before the three reports above and before the Top-Down Drilldown's regions
  were rebuilt from fictional to real — some of its specific tab descriptions predate that.

---

## Technical reference

- **[formulas.md](../formulas.md)** *(23 Sep)* — the most rigorous technical document outside
  the three reports: every formula in the application, cited to file and line, marked 🟢 Real /
  🟡 Real formula with fake input / 🔴 Fabricated / ⚪ Not yet built. **Read this to know what's
  actually computed versus typed in.** ⚠️ Partially stale: it was written before the database
  connection (29 Sep) and the Top-Down Drilldown rebuild (30 Sep). Specifically, the "Home KPI
  cards: 🔴 Fabricated" and "Top-Down Drilldown attainment %: fake inputs" rows are now wrong —
  both are substantially real. Cross-check anything you rely on from it against `TODO.md`.
- **[data_model_specification.md](../data_model_specification.md)** — the 13-table schema:
  columns, types, keys, grain. Current and accurate as of the database build.
- **[dataset_generation_plan.md](../dataset_generation_plan.md)** — how the synthetic dataset
  is generated: targets, tolerances, the determinism requirement (seeded RNG, pinned
  dependency versions). Current.
- **[system_architecture.md](../system_architecture.md)** *(gitignored, won't survive a fresh
  clone)* — Now / Next / Future architecture diagrams.
- **[architecture_proposal.md](../architecture_proposal.md)** — target-state architecture and
  cost strategy. ⚠️ Known stale claim: says "240+ SKUs"; the dataset has 119. Read for the
  shape of the argument, verify any specific number against the database.

---

## Previous-team artifacts — read with real caution

These describe the product as the previous team intended or presented it, largely **before**
the remediation and audit work (1 Sep onward) that produced everything above. Several frame
the build as already-polished and production-grade in ways the later, code-level reports
directly contradict. Useful for understanding original intent and vocabulary; not reliable for
current state.

- **[KT_Onboarding_Guide.md](../KT_Onboarding_Guide.md)** — an onboarding doc describing "8
  workspace tabs" (there are 12) with file links pointing to another contributor's local
  machine (`file:///c:/Users/Jaiadithya/...`), broken on any other machine. Frames the build as
  *"a premium, high-fidelity client demo... to wow potential clients"* — a framing report 1
  directly complicates (two competing revenue baselines don't wow anyone who checks). Use
  CLAUDE.md for onboarding instead.
- **[stakeholder_presentation_guide.md](../stakeholder_presentation_guide.md)** — tab-by-tab
  pitch scripts contrasting "Normal AI" with "Agentic AI," describing agents that
  *"continuously monitor the sales ledger"* and *"autonomously query"* each other. This is the
  **aspirational architecture**, not current capability — per `formulas.md`, the Agent
  Orchestrator today has no formulas at all, and per Report 3, the lab's "agents" are
  keyword-matched replies, not the production agents Kinaxis/SAP/o9/Aera already ship. Useful
  for the *vocabulary and narrative shape* of a future pitch; do not present its specific
  capability claims as already true.
- **[agent_audit_workflow.md](../agent_audit_workflow.md)** — not about the product at all; the
  five-step process the previous team used to produce `dashboard_justification.md`. Meta-
  documentation, low priority.

---

## If you only have ten minutes

Read `CLAUDE.md`'s "architecture fact that matters most" section, then Report 3's two-answer
summary at the top. That's the whole product in two paragraphs: a demo whose headline numbers
are now partly real and partly still fabricated, honestly positioned as a GTM conversation-
opener rather than a competitor to the category's well-funded incumbents.
