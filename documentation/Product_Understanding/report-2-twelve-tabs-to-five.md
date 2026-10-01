# Report 2 of 3 — Twelve Tabs to Five

**17 September 2026.** Whether every tab in the portfolio lab earns its place, what each
persona actually needs, and how to reach the five-tab structure the program brief requires.
12 tabs audited across 3 personas, checked against the Lab 8 brief and shell spec.

**Original:** [claude.ai artifact](https://claude.ai/artifact/LCXiykgu3MfPb5RYuyLAot) ·
[Google Doc](https://docs.google.com/document/d/1pfcD4hJ0GjJB3gwQFjWYSFSs4loJoim6VinqQXQo2-U/edit)

> This is a point-in-time snapshot (17 Sep 2026), saved locally so it survives a fresh clone.
> As of 1 Oct 2026 the consolidation it recommends has **not started** — see `TODO.md` O8.

---

## Yes — there are too many

The Lab 8 brief is explicit: *"keep to exactly 5 domain tabs."* The common shell has no Home
tab. The lab currently ships twelve. Five map to the brief; seven don't.

**Today (12):** Home · Portfolio Health Map · Launch Readiness · Profitability Tree ·
SKU Rationalization · Signals Board · Top-Down Drilldown · Agent Orchestrator ·
SKU Assortment · Rationalisation Home · SKU Drill Down · Task Tracker

**Recommended (5 + 2 relocated):**
1. Portfolio Health *(+ Home, Top-Down Drill, Assortment)*
2. Launch Readiness *(one view, not two)*
3. Profitability Tree *(one view, not two)*
4. SKU Rationalisation *(+ PM workspace, transference simulator)*
5. Market & VoC Signals *(one view, not two)*
- → Side panel: Agent Orchestrator
- → Header queue: Task Tracker

## Key findings

1. **More than half the tab code is outside the brief's scope.** The seven out-of-scope tabs
   account for roughly 19,900 of 39,300 lines — **51%**. Home alone is the largest tab at
   about 9,100 lines. *Counts include each tab's own sub-components; indicative, not exact.*
2. **Every persona sees the same nine icons.** The sidebar renders
   `tabs.filter(tab => tab.id < 9)` for everyone. A VP, a product manager and a pricing
   analyst are shown identical navigation despite having very different jobs.
3. **Three of the five brief tabs are built twice.** Launch Readiness, Profitability and
   Signals each return an entirely separate VP dashboard. The brief asks for role to change
   *emphasis* — tour, tooltips, default tab — not to swap the whole view. Every change has to
   be made twice. *(Correction, 20 Sep: this said four. Portfolio Health also had a second
   implementation, but it had been unreachable since June and has now been deleted — 1,289
   lines. That tab shows the VP command centre to every persona.)*
4. **The same analysis is rebuilt across many tabs.** Rationalization, stockout and margin
   analysis each appear in about **eight** tabs; cannibalization and launch in about seven.
   Portfolio Health and SKU Rationalization have near-identical coverage.
5. **Role never sets the default tab.** The brief says choosing a role should change the
   default tab. Selecting a role only closes the gate — everyone lands on Home, or wherever
   they last were.

---

## What the brief specifies

| # | Required tab | What it should show |
| --- | --- | --- |
| 1 | Portfolio Health Map | SKU performance by lifecycle stage, margin, growth and strategic fit |
| 2 | Launch Readiness Dashboard | Market, supply chain, channel and pricing readiness for upcoming launches |
| 3 | Profitability Tree | Revenue, margin and cost-to-serve by product, with leakage and complexity drivers |
| 4 | SKU Rationalisation Simulator | AI-recommended retain, grow, bundle, reposition or sunset, with projected impact |
| 5 | Market & VoC Signal Board | Sentiment, competitor moves, demand trends and channel signals |

And the role lenses it defines, which drive everything below:

| Role | Who they are | What they care about most |
| --- | --- | --- |
| VP Product Management | Senior functional leader | Strategic KPIs, exception escalations, key decisions |
| Product Manager | Domain practitioner | Operational workflows, root causes, queue management |
| Pricing & Margin Partner | Analyst / ops support | Data quality, process detail, reporting and analysis |

---

## What each persona gets today

Traced from the role checks in each tab's code.

| Tab | VP | Product Manager | Pricing & Margin |
| --- | --- | --- | --- |
| 0 Home | Tailored layout | Tailored layout | Tailored, alerts first |
| 1 Portfolio Health | **VP COMMAND CENTRE FOR ALL THREE** | — | — |
| 2 Launch Readiness | SEPARATE VIEW | **VP'S VIEW** | Standard |
| 3 Profitability | SEPARATE VIEW | Standard | Standard |
| 4 SKU Rationalization | VP variant | Redirected to 9 | Own variant |
| 5 Signals | SEPARATE VIEW | Standard + extra panels | Standard |
| 6 Top-Down Drill | Same | Same | Same |
| 7 Orchestrator | Same | Same | Same |
| 8 Assortment | Same | Same | Same |
| 9–11 PM workspace | Redirected to 4 | PM only | **NOT REACHABLE** |

**Looks inverted.** On Launch Readiness the **Product Manager receives the VP's executive
view**, while the Pricing & Margin Partner gets the operational one. The brief positions the PM
as the workflow and root-cause persona, and the PM's own welcome card advertises *Launch
Readiness* as a headline feature. *(Still open as of 1 Oct — TODO.md O8's last bullet.)*

---

## How useful each tab is, by persona

ESSENTIAL = core to the role's job · USEFUL = supports it · LOW = duplicated or off-role

| Tab | VP | PM | Pricing | Reasoning |
| --- | --- | --- | --- | --- |
| 0 Home | ESS | USE | USE | Exceptions are the VP's core job — but the shell has no Home, so this content belongs on Portfolio Health |
| 1 Portfolio Health | ESS | USE | USE | Strategic KPIs and portfolio shape |
| 2 Launch Readiness | USE | ESS | LOW | The PM runs launch execution; the VP makes the go/no-go call |
| 3 Profitability | USE | LOW | ESS | The pricing partner's central analysis surface |
| 4 SKU Rationalization | ESS | ESS | USE | The key decision for the VP; the working queue for the PM |
| 5 Signals | ESS | USE | LOW | Escalations and external risk |
| 6 Top-Down Drill | LOW | LOW | USE | Regional drill-down repeats Home and Portfolio Health |
| 7 Orchestrator | LOW | LOW | LOW | The shell places the agent roster in the side panel, not a tab |
| 8 Assortment | USE | USE | LOW | Regional grid and Pareto duplicate tabs 1 and 4 |
| 9 Rationalisation Home | — | USE | — | A second entry point to tab 4 |
| 10 SKU Drill Down | — | USE | — | SKU detail — better as a drawer than a tab |
| 11 Task Tracker | — | ESS | — | "Queue management" is the PM's stated job — keep it, but reachable from anywhere |

*These ratings assess each tab against the brief's role definitions. They are a starting
hypothesis — the program expects them to be tested in stakeholder interviews.*

---

## The recommended five

Nothing valuable is lost — content moves to where it belongs. What disappears is the
duplication: second copies of views, simulators and navigation.

**1. Portfolio Health** *(VP default)* — The VP's landing view: headline KPIs, exception
alerts, and the portfolio's shape by lifecycle stage. Regional drill-down lives here as a
filter, not a separate tab. *Absorbs: Home · Top-Down Drill · Assortment regional grid and
Pareto.*

**2. Launch Readiness** *(PM default)* — One view. The VP sees the go/no-go summary
emphasised; the PM sees gate tasks and root causes emphasised. Add time-to-market and launch
success rate here. *Merges the VP and standard views.*

**3. Profitability Tree** *(Pricing default)* — One view with margin, leakage and
cost-to-serve. The margin drill from Top-Down Drilldown folds in here. *Merges the VP and
standard views.*

**4. SKU Rationalisation Simulator** — One simulator instead of several. The PM's workspace
becomes a workflow mode within the tab, and SKU detail opens as a drawer. *Absorbs:
Rationalisation Home · SKU Drill Down · Assortment transference simulator.*

**5. Market & VoC Signal Board** — One view. Sentiment, competitor moves and demand shifts,
each linked to the SKUs they affect. *Merges the VP and standard views.*

| Current tab | Action | Goes to |
| --- | --- | --- |
| 0 Home | MERGE | Portfolio Health — KPI strip and exception alerts |
| 1 Portfolio Health | KEEP | Tab 1 |
| 2 Launch Readiness | KEEP | Tab 2, unified |
| 3 Profitability | KEEP | Tab 3, unified |
| 4 SKU Rationalization | KEEP | Tab 4 |
| 5 Signals | KEEP | Tab 5, unified |
| 6 Top-Down Drill | MERGE | Portfolio Health regional filter; Profitability margin drill |
| 7 Agent Orchestrator | MOVE | "How This Evolves" side panel — where the shell puts the agent roster |
| 8 Assortment | MERGE | Portfolio Health; transference simulator to tab 4 |
| 9 Rationalisation Home | MERGE | Tab 4 workflow mode |
| 10 SKU Drill Down | MERGE | Tab 4 SKU detail drawer |
| 11 Task Tracker | MOVE | Header action queue, reachable from every tab |

---

## Also required by the shell

Three acceptance criteria from the program guidance are currently unmet.

| Criterion | Today |
| --- | --- |
| "All 5 tabs render correctly; no broken states" | Four KPI strips render empty — tabs 1, 5, 6 and 7 |
| Consulting CTA: "buttons functional" | Diagnostic Workshop, Use Cases and Lab Explorer have no click handlers |
| Role changes tour, tooltips and default tab | Role swaps whole views; the default tab never changes |

*(The Consulting CTA gap is still open as of 1 Oct — TODO.md O9 — and is specifically what
blocks O14's "name the integration story" positioning work, since that CTA is where a GTM
conversation would actually convert.)*

---

## How to get there

| Phase | Work | Risk |
| --- | --- | --- |
| 1 · Quick wins | Move Orchestrator to the side panel and Task Tracker to the header. Set a default tab per role. Wire the CTA buttons. | LOW |
| 2 · Merge | Fold Home, Top-Down Drill and Assortment into Portfolio Health. Fold the PM workspace into SKU Rationalisation. | MEDIUM |
| 3 · Unify | Collapse the three VP / standard view pairs into single views with role-based emphasis. | HIGHER |

**Do phase 3 last.** Unifying the view pairs is the most valuable change — it halves future
maintenance on four tabs — but it touches the largest files. Doing phases 1 and 2 first shrinks
the surface it has to cover.

---

## What's changed since 17 Sep (as of 1 Oct 2026)

None of the three phases above have started — `TODO.md` O8 is still fully open. One relevant
twist: the Top-Down Drilldown tab this report recommends merging into Portfolio Health (phase
2) was substantially rebuilt on 30 Sep (see `TODO.md` O11) to replace its fictional
APAC/EMEA/LATAM regions with the database's real geography. That rebuild makes the tab *more*
real than it was when this report was written, which doesn't change the consolidation
recommendation itself, but means "merge" now means merging something live, not something
fabricated.
