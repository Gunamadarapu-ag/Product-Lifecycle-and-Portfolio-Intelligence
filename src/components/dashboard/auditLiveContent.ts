/**
 * Live audit-drawer explanations (TODO.md O17).
 *
 * A 6 October review call asked, for one KPI after another, "what is the primary
 * data set going into this" — and the audit drawer, whose whole job is to answer
 * that, was showing static text: stale values from the rejected $851.2M baseline,
 * formulas that were never the real ones, and `[DIRECT]` columns that do not
 * exist in the schema.
 *
 * Every builder here computes its explanation from the SAME live data the card on
 * screen is rendering, so the two cannot drift apart. Where a figure genuinely has
 * no source in the data, the honest statement lives in `constants/auditData.ts`
 * instead — this module only covers metrics the warehouse can actually answer.
 *
 * Returning `null` means "no live explanation" and the caller falls back to the
 * static entry, which is what happens when the API is unavailable.
 */

import type { AuditContent } from '../../constants/auditData';
import type { LiveData } from '../../api/liveData';
import { SKUS } from '../../constants/data';
import { calculatePortfolioHealth, liveSkusList } from './portfolio-health/LifecycleHealthPanel';

/** The real fact_sales columns behind every revenue figure in this app. */
const REVENUE_COLUMNS = [
  { name: 'fact_sales.net_sales', type: 'numeric(12,2) [DIRECT]', desc: 'Revenue for one SKU/country/channel/day. Summed over the selected window.' },
  { name: 'fact_sales.date_key', type: 'date [DIRECT]', desc: 'Filters rows to the selected trailing window.' },
];

const MARGIN_COLUMNS = [
  { name: 'fact_sales.gross_margin', type: 'numeric(14,2) [GENERATED]', desc: 'A Postgres GENERATED column: net_sales − (units_sold × purchase_cost). The database computes it, so it cannot disagree with its inputs.' },
  { name: 'fact_sales.net_sales', type: 'numeric(12,2) [DIRECT]', desc: 'The denominator when expressing margin as a percentage.' },
  { name: 'fact_sales.purchase_cost', type: 'numeric(10,2) [DIRECT]', desc: 'Unit cost captured at the transaction, deliberately denormalised from dim_sku so historic margin stays correct.' },
];

/** How the trailing window was resolved — including the 36-month clamp. */
function windowNote(k: NonNullable<LiveData['kpis']>): string {
  const clamped = k.months_available < k.months_requested;
  return `Window: ${k.period_start} to ${k.period_end} (${k.months_available} months)${
    clamped ? `. You selected ${k.months_requested} months, but the dataset only covers ${k.months_available} — the request was clamped rather than padded with invented periods.` : '.'
  }`;
}

/** Growth is null when there is no full prior window — never invented. */
function growthNote(k: NonNullable<LiveData['kpis']>): string {
  return k.growth_pct === null
    ? 'Growth is not shown for this window: there is no full prior window of equal length in the data, and a partial comparison would be misleading.'
    : `Growth of ${(k.growth_pct * 100).toFixed(2)}% compares this window against the immediately prior window of the same length (${k.months_available} months), not against a calendar year.`;
}

const SOURCE_LINE = 'Computed in SQL by fn_portfolio_kpis() in data/schema/03_derive_metrics.sql, served over /api, and only formatted by the browser. No arithmetic happens in TypeScript.';

function revenueContent(title: string, live: LiveData): AuditContent {
  const k = live.kpis!;
  const m = k.net_sales / 1e6;
  const byCategory = new Map<string, number>();
  for (const s of live.skus ?? []) {
    byCategory.set(s.category_name, (byCategory.get(s.category_name) ?? 0) + s.net_sales);
  }
  const rows = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat, v]) => [cat, `$${(v / 1e6).toFixed(1)} M`, `${((v / k.net_sales) * 100).toFixed(1)}%`]);
  const total = rows.reduce((sum, r) => sum + parseFloat(r[1].replace(/[^\d.]/g, '')), 0);

  return {
    title,
    provenance: 'live',
    value: `$${m.toFixed(1)} M`,
    // The only trend pill in the drawer with a real comparison behind it.
    trend: k.growth_pct === null ? undefined : {
      value: `${(k.growth_pct * 100).toFixed(2)}% vs prior ${k.months_available} months`,
      isUp: k.growth_pct >= 0,
    },
    soWhat: `Net sales of $${m.toFixed(1)} M across ${k.active_skus} SKUs that sold in the window. ${growthNote(k)} ${windowNote(k)}`,
    action: k.growth_pct !== null && k.growth_pct < 0.10
      ? `Growth is running below the 10% the Portfolio Health tab uses as its target. The category split below shows where the volume actually sits before deciding where to push.`
      : 'Use the category split below to see where the volume sits before reallocating.',
    columns: REVENUE_COLUMNS,
    formula: 'R = \\sum_{i} \\text{net\\_sales}_i \\quad \\text{over the selected window}',
    formulaDescription: `A plain sum of the net_sales column over the selected trailing window — no weighting, no adjustment, no noise term. ${SOURCE_LINE}`,
    assumptions: [
      'Every SKU that recorded a sale in the window is included; nothing is excluded as an outlier.',
      'The category rows below sum to the headline figure by construction — 04_validate.sql asserts this for every window length, which is what stops two screens disagreeing.',
      `Checksum: the ${rows.length} category rows below total $${total.toFixed(1)} M against a headline of $${m.toFixed(1)} M.`,
    ],
    trendTitle: 'Net sales by category (live)',
    trendHeaders: ['Category', 'Net Sales', 'Share'],
    trendRows: rows,
  };
}

function skuCountContent(title: string, live: LiveData): AuditContent {
  const k = live.kpis!;
  const byCategory = new Map<string, number>();
  for (const s of live.skus ?? []) {
    byCategory.set(s.category_name, (byCategory.get(s.category_name) ?? 0) + 1);
  }
  const rows = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat, n]) => [cat, String(n), `${((n / k.active_skus) * 100).toFixed(1)}%`]);

  return {
    title,
    provenance: 'live',
    value: String(k.active_skus),
    soWhat: `${k.active_skus} SKUs recorded at least one sale in the selected window. This is a count of SKUs that actually sold, not a count of rows in the product master — a SKU listed but dormant in this window is not counted. ${windowNote(k)}`,
    action: 'Compare against the Rationalization tab before reading this as catalogue size: a falling count here can mean rationalization working, or simply a shorter window.',
    columns: [
      { name: 'fact_sales.sku_id', type: 'integer [DIRECT]', desc: 'Distinct SKU ids appearing in the window. The count is of these, not of dim_sku rows.' },
      { name: 'dim_sku.sku_name', type: 'text [DIRECT]', desc: 'Joined for the category breakdown below.' },
    ],
    formula: 'N = \\text{count}(\\text{distinct } \\text{sku\\_id}) \\quad \\text{over the selected window}',
    formulaDescription: `A distinct count of SKU ids present in fact_sales for the window. There is no is_active or status column in the schema — "active" here means "sold in this window", which is a different definition from an ERP active flag, and the difference matters when comparing against a client's own SKU count. ${SOURCE_LINE}`,
    assumptions: [
      'A SKU selling in only one country or one channel counts the same as one selling everywhere.',
      'The dataset holds 119 SKUs in dim_sku; a window shorter than the full history can legitimately show fewer.',
    ],
    trendTitle: 'SKUs that sold, by category (live)',
    trendHeaders: ['Category', 'SKUs', 'Share'],
    trendRows: rows,
  };
}

function growthContent(live: LiveData): AuditContent {
  const k = live.kpis!;
  const hasGrowth = k.growth_pct !== null;
  const cur = k.net_sales / 1e6;
  const prior = k.prior_net_sales !== null ? k.prior_net_sales / 1e6 : null;

  return {
    title: 'Revenue Growth',
    provenance: 'live',
    value: hasGrowth ? `${(k.growth_pct! * 100).toFixed(2)}%` : 'Not available',
    soWhat: hasGrowth
      ? `Net sales of $${cur.toFixed(1)} M this window against $${prior!.toFixed(1)} M in the prior window of equal length — a change of ${(k.growth_pct! * 100).toFixed(2)}%. ${windowNote(k)}`
      : `No growth figure is shown for this window. ${growthNote(k)} ${windowNote(k)}`,
    action: hasGrowth
      ? 'Read this as window-over-window, not year-over-year. Changing the timeline selector changes both windows, so the figure is not comparable across selections.'
      : 'Select a shorter window — 1, 3, 6 or 12 months — so a full prior window of equal length exists in the 24 months of data.',
    columns: REVENUE_COLUMNS,
    formula: 'g = \\frac{R_{current} - R_{prior}}{R_{prior}}',
    formulaDescription: `Window-over-window change in summed net_sales. The prior window is the equal-length period immediately before the current one — it is NOT the same calendar period a year earlier. When no full prior window exists the function returns NULL and the UI shows nothing rather than a fabricated figure. ${SOURCE_LINE}`,
    assumptions: [
      'Prior window is adjacent and equal in length, so seasonality is not controlled for.',
      'A SKU that did not exist in the prior window contributes its full revenue to the numerator, which flatters growth after a launch.',
    ],
    trendTitle: 'The two windows being compared (live)',
    trendHeaders: ['Window', 'Net Sales'],
    trendRows: [
      [`Current — ${k.period_start} to ${k.period_end}`, `$${cur.toFixed(1)} M`],
      ['Prior — equal length, immediately before', prior !== null ? `$${prior.toFixed(1)} M` : 'No full prior window in the data'],
    ],
  };
}

function rationalizeCandidatesContent(live: LiveData): AuditContent {
  const seg = live.skuSegments!;
  const mix = ['Keep', 'Grow', 'Consolidate', 'Rationalize'].map(name => ({
    name, rows: seg.filter(s => s.portfolio_segment === name),
  }));
  const n = seg.filter(s => s.portfolio_segment === 'Rationalize').length;
  return {
    title: 'Rationalize Candidates',
    provenance: 'live',
    value: `${n} SKUs`,
    soWhat: `${n} of ${seg.length} SKUs fall in the Rationalize segment (low commercial value, high operational complexity — a median split on both axes). ` +
      'As of the data\'s last snapshot, not filtered by the timeline selector.',
    action: n > 0
      ? `Start with the segment's own worst cases — rank by operational_complexity_score and commercial_value_score together, not by revenue alone.`
      : 'No SKUs currently fall in the Rationalize segment.',
    columns: [
      { name: 'sku_metrics.commercial_value_score', type: 'numeric [SNAPSHOT]', desc: 'Mean of 4 min-max normalised inputs (net sales, margin, growth, 1-cv).' },
      { name: 'sku_metrics.operational_complexity_score', type: 'numeric [SNAPSHOT]', desc: 'Mean of 5 min-max normalised inputs (lead time, suppliers, promo, stockouts, volatility).' },
    ],
    formula: '\\text{Segment} = \\text{Rationalize if Value} < \\text{Median} \\text{ and Complexity} > \\text{Median}',
    formulaDescription: 'A median split on both scores — "Rationalize" is relative to this portfolio, not an absolute threshold. The split guarantees roughly a quarter of SKUs land here regardless of how healthy the portfolio actually is; that is a property of the method, not a finding.',
    assumptions: [
      'Medians are of the current 119-SKU portfolio; the segment boundary moves if the catalog changes.',
      'Both sub-scores are themselves equal-weighted means of several normalised inputs.',
    ],
    trendTitle: 'Segment mix (live, snapshot)',
    trendHeaders: ['Segment', 'SKU Count'],
    trendRows: mix.map(m => [m.name, String(m.rows.length)]),
  };
}

function longTailBurdenContent(live: LiveData): AuditContent {
  const seg = live.skuSegments!;
  const tail = seg.filter(s => s.low_velocity_flag === 1);
  return {
    title: 'Long-Tail SKU Burden',
    provenance: 'live',
    value: `${((tail.length / seg.length) * 100).toFixed(1)}%`,
    soWhat: `${tail.length} of ${seg.length} SKUs (${((tail.length / seg.length) * 100).toFixed(1)}%) each earn under 1% of portfolio revenue share. Snapshot, not filtered by the timeline selector.`,
    action: 'Every one of these SKUs still shares all 60 suppliers with the rest of the catalog (no SKU-specific supplier relationship exists in the data) — supplier-overhead claims about this group should be qualitative, not quantified from this table.',
    columns: [
      { name: 'sku_metrics.revenue_share_pct', type: 'numeric [SNAPSHOT]', desc: 'Per-SKU share of total portfolio net sales.' },
      { name: 'sku_metrics.low_velocity_flag', type: 'smallint [SNAPSHOT]', desc: '1 if revenue_share_pct < 1%.' },
    ],
    formula: '\\text{Burden} = \\frac{\\text{Count}(revenue\\_share\\_pct < 0.01)}{\\text{Total SKUs}}',
    formulaDescription: 'Share of SKUs individually earning under 1% of total revenue. The 1% cutoff is the generator\'s own definition, not independently derived here.',
    assumptions: ['1% is a cutoff, not a measured inflection point in the data.'],
    trendTitle: 'Long-tail SKUs, largest revenue share first (live)',
    trendHeaders: ['SKU', 'Revenue Share'],
    trendRows: tail.sort((a, b) => b.revenue_share_pct - a.revenue_share_pct).slice(0, 8)
      .map(s => [s.sku_name, `${(s.revenue_share_pct * 100).toFixed(2)}%`]),
  };
}

function peakStockoutContent(live: LiveData): AuditContent {
  const seg = live.skuSegments!;
  const top = [...seg].sort((a, b) => b.total_stockouts - a.total_stockouts).slice(0, 8);
  return {
    title: 'Peak Stockout Freq.',
    provenance: 'live',
    value: `${top[0].total_stockouts} events`,
    soWhat: `${top[0].sku_name} has the most stockout events (${top[0].total_stockouts}) of any SKU. Snapshot over the full history, not the timeline selector.`,
    action: `Check ${top[0].sku_name}'s lead time and safety stock first — it is the single largest stockout contributor.`,
    columns: [
      { name: 'fact_sales.stock_out_flag', type: 'smallint [DIRECT]', desc: 'Summed per SKU over the full history by sku_metrics.' },
    ],
    formula: '\\text{Peak} = \\max_i \\sum \\text{stock\\_out\\_flag}_i',
    formulaDescription: 'The highest per-SKU stockout count in the dataset.',
    assumptions: ['Every stockout event is treated as equally significant, regardless of the revenue or margin of the SKU it happened to.'],
    trendTitle: 'Highest stockout counts, by SKU (live)',
    trendHeaders: ['SKU', 'Stockout Events'],
    trendRows: top.map(s => [s.sku_name, String(s.total_stockouts)]),
  };
}

function revenueTailRiskContent(live: LiveData): AuditContent {
  const seg = live.skuSegments!;
  const n = seg.filter(s => s.portfolio_segment === 'Rationalize').length;
  const risk = seg.filter(s => s.portfolio_segment === 'Rationalize').reduce((sum, s) => sum + s.revenue_share_pct, 0);
  const scenarios = live.rationalizationScenarios ?? [];
  return {
    title: 'Revenue Tail Risk',
    provenance: 'live',
    value: `${(risk * 100).toFixed(1)}%`,
    soWhat: `Removing all ${n} Rationalize-segment SKUs at once risks ${(risk * 100).toFixed(1)}% of portfolio revenue, assuming zero transfer to surviving SKUs. Snapshot, not the timeline selector.`,
    action: 'Phase the removal — the scenario table below shows the same cohort split into smaller, less risky tranches.',
    columns: [
      { name: 'sku_metrics.revenue_share_pct', type: 'numeric [SNAPSHOT]', desc: 'Per-SKU share of total revenue, summed over the Rationalize segment.' },
      { name: 'rationalization_scenario.*', type: '[SNAPSHOT, COMPUTED]', desc: 'Impact of removing each cohort, computed from sku_metrics — not typed.' },
    ],
    formula: 'R_{risk} = \\sum_{i \\in Rationalize} \\text{revenue\\_share\\_pct}_i',
    formulaDescription: 'Sum of revenue share across the Rationalize segment. Assumes zero revenue transfer to surviving SKUs — in reality a share typically transfers; there is no transfer-rate data to model that with.',
    assumptions: [
      'Zero transfer: every dollar from a removed SKU is treated as lost, not redirected.',
      'The scenario table\'s safety-stock and margin impacts ARE computed from sku_metrics, not typed — see derive.build_rationalization_scenarios.',
    ],
    trendTitle: 'SKU pruning scenarios (live, computed)',
    trendHeaders: ['Scenario', 'SKUs Removed', 'Revenue Impact', 'Margin Impact', 'Safety Stock Freed'],
    trendRows: scenarios.map(s => [
      s.scenario_label, String(s.skus_removed),
      `${(s.revenue_impact_pct * 100).toFixed(2)}%`, `${(s.margin_impact_pct * 100).toFixed(2)}%`,
      `${(s.safety_stock_freed_pct * 100).toFixed(1)}%`,
    ]),
  };
}

function avgComplexityContent(live: LiveData): AuditContent {
  const seg = live.skuSegments!;
  const avg = seg.reduce((sum, s) => sum + s.operational_complexity_score, 0) / seg.length;
  const top = [...seg].sort((a, b) => b.operational_complexity_score - a.operational_complexity_score).slice(0, 5);
  return {
    title: 'Avg Complexity',
    provenance: 'live',
    value: avg.toFixed(2),
    soWhat: `Average operational complexity is ${avg.toFixed(2)} across ${seg.length} SKUs. Snapshot over the full history, not the timeline selector.`,
    action: `${top[0].sku_name} is the single most complex SKU (${top[0].operational_complexity_score.toFixed(2)}) — check its lead time, supplier count and promo dependency first.`,
    columns: [
      { name: 'sku_metrics.operational_complexity_score', type: 'numeric [SNAPSHOT]', desc: 'Mean of 5 min-max normalised inputs: lead time, supplier count, promo dependency, stockouts, volatility class.' },
    ],
    formula: 'C_{avg} = \\frac{1}{N}\\sum_i \\text{operational\\_complexity\\_score}_i',
    formulaDescription: 'Unweighted mean of the per-SKU complexity score across the active catalog.',
    assumptions: ['All 5 complexity sub-inputs are equally weighted inside each SKU\'s own score.'],
    trendTitle: 'Most complex SKUs (live)',
    trendHeaders: ['SKU', 'Complexity Score'],
    trendRows: top.map(s => [s.sku_name, s.operational_complexity_score.toFixed(3)]),
  };
}

function netProfitContent(live: LiveData): AuditContent {
  const p = live.pnl!;
  const m = (v: number) => `$${(v / 1e6).toFixed(1)} M`;
  return {
    title: 'Net Profit',
    // No badge: the computation is real (fn_pnl) and the revenue/COGS half is
    // measured, but every cost term below gross profit is a labelled
    // assumption (dim_cost_assumption), not a measurement — same honesty rule
    // as the mixed-provenance Portfolio Health Score.
    value: m(p.net_profit_usd),
    soWhat: `Net profit of ${m(p.net_profit_usd)}: gross profit ${m(p.gross_margin)} less opex ${m(p.opex_total_usd)} ` +
      `(logistics ${m(p.logistics_usd)}, marketing ${m(p.marketing_usd)}, SG&A ${m(p.sga_variable_usd + p.sga_fixed_usd)}, ` +
      `fixed SKU cost ${m(p.fixed_sku_cost_usd)}) less tax ${m(p.tax_usd)}.`,
    action: 'Gross profit is measured. Everything below it is a stated assumption — change the rates in dim_cost_assumption, not this figure, to model a different cost structure.',
    columns: [
      { name: 'fact_sales.net_sales, gross_margin', type: '[DIRECT]', desc: 'Revenue and COGS — measured, feeds gross profit.' },
      { name: 'fact_opex.amount_usd', type: 'numeric [GENERATED]', desc: 'driver_value × rate, both from dim_cost_assumption. An assumption, not a measurement.' },
      { name: 'sku_fixed_cost.amount_usd', type: 'numeric [ASSUMPTION]', desc: 'Fixed cost per SKU per year, pro-rated to the window.' },
      { name: 'dim_cost_assumption.rate', type: 'numeric [ASSUMPTION]', desc: "Corporate tax rate, applied to profit before tax if positive." },
    ],
    formula: 'NP = GP - (\\text{Logistics} + \\text{Marketing} + \\text{SG\\&A} + \\text{Fixed Cost}) - \\text{Tax}',
    formulaDescription: 'Gross profit (measured) less 4 assumption-based cost terms and tax. This is a real computation over stated assumptions, not a measurement — the distinction is the whole point of showing it this way rather than a single unexplained number.',
    assumptions: [
      'Logistics, marketing, SG&A and fixed SKU cost rates are all set in dim_cost_assumption, not measured from any transaction.',
      'Tax is applied only if profit before tax is positive (no loss carryback modelled).',
    ],
    trendTitle: 'P&L bridge, gross profit to net profit (live)',
    trendHeaders: ['Line', 'Amount', 'Basis'],
    trendRows: [
      ['Gross profit', m(p.gross_margin), 'Measured'],
      ['Logistics', `-${m(p.logistics_usd)}`, 'Assumption'],
      ['Marketing', `-${m(p.marketing_usd)}`, 'Assumption'],
      ['SG&A', `-${m(p.sga_variable_usd + p.sga_fixed_usd)}`, 'Assumption'],
      ['Fixed SKU cost', `-${m(p.fixed_sku_cost_usd)}`, 'Assumption'],
      ['EBIT', m(p.ebit_usd), 'Computed'],
      ['Tax', `-${m(p.tax_usd)}`, 'Assumption'],
      ['Net profit', m(p.net_profit_usd), 'Computed'],
    ],
  };
}

function sgaContent(live: LiveData): AuditContent {
  const p = live.pnl!;
  const total = p.sga_variable_usd + p.sga_fixed_usd;
  const m = (v: number) => `$${(v / 1e6).toFixed(1)} M`;
  return {
    title: 'Total SG&A Overhead',
    value: m(total),
    soWhat: `SG&A of ${m(total)}: ${m(p.sga_variable_usd)} variable (a % of net sales) plus ${m(p.sga_fixed_usd)} fixed ` +
      '(a per-country monthly amount, split across categories by their share of that country\'s sales). Both rates are assumptions.',
    action: 'Change the rate in dim_cost_assumption to model a different SG&A structure — this figure is computed from it exactly, not typed.',
    columns: [
      { name: "fact_opex WHERE assumption_key = 'sga.variable'", type: '[ASSUMPTION]', desc: 'net_sales × a fixed % rate.' },
      { name: "fact_opex WHERE assumption_key LIKE 'sga.fixed.%'", type: '[ASSUMPTION]', desc: 'A per-country monthly amount, allocated to categories by revenue share.' },
    ],
    formula: '\\text{SG\\&A} = (\\text{NetSales} \\times r_{var}) + \\text{FixedMonthly}_{country}',
    formulaDescription: 'Two assumption-based terms, computed over the selected window — not a measurement, and not typed either.',
    assumptions: [
      'The variable rate is a flat % of net sales, the same for every category and country.',
      'The fixed amount is allocated to categories by their share of that country\'s sales, not an independently-set per-category budget.',
    ],
    trendTitle: 'SG&A composition (live)',
    trendHeaders: ['Component', 'Amount', 'Basis'],
    trendRows: [
      ['Variable (% of net sales)', m(p.sga_variable_usd), 'Assumption'],
      ['Fixed (per-country monthly)', m(p.sga_fixed_usd), 'Assumption'],
      ['Total', m(total), 'Computed'],
    ],
  };
}

function grossProfitContent(live: LiveData): AuditContent {
  const k = live.kpis!;
  const gp = k.gross_margin / 1e6;
  const pct = k.gross_margin_pct * 100;
  const cogs = (k.net_sales - k.gross_margin) / 1e6;

  return {
    title: 'Gross Profit',
    provenance: 'live',
    value: `$${gp.toFixed(1)} M`,
    soWhat: `Gross profit of $${gp.toFixed(1)} M on net sales of $${(k.net_sales / 1e6).toFixed(1)} M — a gross margin of ${pct.toFixed(2)}%. Implied COGS is $${cogs.toFixed(1)} M. ${windowNote(k)}`,
    action: 'This is the deepest genuinely-measured profit line in the product. Anything below it — Net Profit, SG&A — has no cost basis in the data, so decisions needing a net figure cannot be supported from here yet.',
    columns: MARGIN_COLUMNS,
    formula: 'GP = \\sum_{i} \\left( \\text{net\\_sales}_i - \\text{units\\_sold}_i \\times \\text{purchase\\_cost}_i \\right)',
    formulaDescription: `Summed over the window. The per-row subtraction is a Postgres GENERATED column, so gross_margin cannot drift from net_sales and purchase_cost even if a row is edited. ${SOURCE_LINE}`,
    assumptions: [
      'Cost is the purchase cost captured at the transaction; no freight, warehousing or overhead is included, so this is a gross figure and nothing more.',
      'No inventory valuation method applies — cost is per transaction, not drawn from a stock pool, so FIFO/LIFO does not arise.',
    ],
    trendTitle: 'Gross profit bridge (live)',
    trendHeaders: ['Line', 'Amount'],
    trendRows: [
      ['Net sales', `$${(k.net_sales / 1e6).toFixed(1)} M`],
      ['Less: COGS (units_sold × purchase_cost)', `$${cogs.toFixed(1)} M`],
      ['Gross profit', `$${gp.toFixed(1)} M`],
      ['Gross margin %', `${pct.toFixed(2)}%`],
    ],
  };
}

function grossMarginPctContent(live: LiveData): AuditContent {
  const k = live.kpis!;
  const pct = k.gross_margin_pct * 100;
  const byCategory = new Map<string, { gm: number; ns: number }>();
  for (const s of live.skus ?? []) {
    const e = byCategory.get(s.category_name) ?? { gm: 0, ns: 0 };
    e.gm += s.net_sales * s.gross_margin_pct;
    e.ns += s.net_sales;
    byCategory.set(s.category_name, e);
  }
  const rows = [...byCategory.entries()]
    .sort((a, b) => b[1].ns - a[1].ns)
    .map(([cat, e]) => [cat, `${((e.gm / e.ns) * 100).toFixed(2)}%`, `$${(e.ns / 1e6).toFixed(1)} M`]);

  return {
    title: 'Gross margin %',
    provenance: 'live',
    value: `${pct.toFixed(2)}%`,
    soWhat: `Portfolio gross margin is ${pct.toFixed(2)}%, on $${(k.net_sales / 1e6).toFixed(1)} M of net sales. This is revenue-weighted, not an average of per-SKU margins, so high-revenue SKUs pull it. ${windowNote(k)}`,
    action: 'Read the category rows as revenue-weighted too. A small category with a high margin moves the portfolio figure very little.',
    columns: MARGIN_COLUMNS,
    formula: 'GM\\% = \\frac{\\sum_i \\text{gross\\_margin}_i}{\\sum_i \\text{net\\_sales}_i}',
    formulaDescription: `Total margin over total revenue — a revenue-weighted figure, deliberately not the mean of per-SKU margin percentages, which would overweight small SKUs. ${SOURCE_LINE}`,
    assumptions: [
      'Revenue-weighted by construction; the unweighted mean of per-SKU margins is a different number and is not what is shown.',
      'Category rows are each revenue-weighted within the category.',
    ],
    trendTitle: 'Gross margin by category (live, revenue-weighted)',
    trendHeaders: ['Category', 'Gross Margin %', 'Net Sales'],
    trendRows: rows,
  };
}

/** PCI's 6 sub-drivers, 2 of them (fragmentation, proliferation) are ratios
 * against a typed baseline, not independently measured — the generator's own
 * documentation (config.py) says so; kept visible rather than hidden. */
const PCI_BENCHMARKS: Record<string, string> = {
  supplier_fragmentation: '1.0000', sku_proliferation: '0.8500',
  low_velocity_pct: '0.4000', lead_time_instability: '0.1500',
  promo_dependency_score: '0.0800', avg_volatility_cv: '0.0800',
};
const PCI_LABELS: Record<string, string> = {
  supplier_fragmentation: 'Supplier Fragmentation Index', sku_proliferation: 'SKU Proliferation Index',
  low_velocity_pct: 'Low Velocity SKU Concentration', lead_time_instability: 'Lead Time Instability (CV)',
  promo_dependency_score: 'Promo Dependency Score', avg_volatility_cv: 'Avg Portfolio Volatility (CV)',
};

function portfolioComplexityContent(live: LiveData): AuditContent {
  const s = live.portfolioSnapshot!;
  const drivers: [string, number][] = [
    ['supplier_fragmentation', s.supplier_fragmentation], ['sku_proliferation', s.sku_proliferation],
    ['low_velocity_pct', s.low_velocity_pct], ['lead_time_instability', s.lead_time_instability],
    ['promo_dependency_score', s.promo_dependency_score], ['avg_volatility_cv', s.avg_volatility_cv],
  ];
  return {
    title: 'Portfolio Complexity Index (PCI)',
    provenance: 'live',
    value: s.portfolio_complexity_index.toFixed(4),
    soWhat: `PCI is ${s.portfolio_complexity_index.toFixed(4)}, the mean of 6 sub-drivers. As of ${s.snapshot_date} — ` +
      'this is a snapshot over the full dataset history, not filtered by the timeline selector (see formula note).',
    action: 'Supplier fragmentation and SKU proliferation are the two largest drivers above their benchmark; see the breakdown below.',
    columns: [
      { name: 'portfolio_metrics.*', type: 'numeric [SNAPSHOT]', desc: 'Computed once by the data generator over the full 24-month history, not re-derived per request.' },
    ],
    formula: '\\text{PCI} = \\frac{1}{6}\\left(I_{Frag} + I_{Prolif} + I_{LowVel} + I_{LeadTime} + I_{Promo} + I_{Vol}\\right)',
    formulaDescription: 'Mean of 6 sub-drivers. Two of them (fragmentation, proliferation) are ratios against a typed baseline (119 SKUs, 60 suppliers), not independently measured — stated plainly rather than presented as 6 equally empirical measures. Snapshot: does not respond to the timeline selector (TODO.md O18).',
    assumptions: [
      'Equal weighting across the 6 sub-drivers.',
      'Baselines (119 SKUs, 60 suppliers) are internal modelling benchmarks, not industry maximums.',
    ],
    trendTitle: 'Complexity drivers vs. benchmark (live)',
    trendHeaders: ['Complexity Driver', 'Actual Index Value', 'Benchmark Target', 'Status'],
    trendRows: drivers.map(([key, val]) => {
      const bench = parseFloat(PCI_BENCHMARKS[key]);
      return [PCI_LABELS[key], val.toFixed(4), PCI_BENCHMARKS[key], val > bench ? 'Above benchmark' : 'At or below benchmark'];
    }),
  };
}

function unitsLastMonthContent(live: LiveData): AuditContent {
  const u = live.lastMonthUnits!;
  const per = live.lastMonthPeriod;
  const span = per ? `${per.start} to ${per.end}` : 'the last complete month';
  return {
    title: 'Units Sold — Last Month',
    provenance: 'live',
    value: u.toLocaleString('en-US'),
    soWhat: `${u.toLocaleString('en-US')} units sold across all SKUs, countries and channels, ${span}. ` +
      'This replaces "Orders — Today": the data is daily but has no order header, and a single day is too noisy to steer by.',
    action: 'Read alongside Forecast Attainment: units are the actual side of that ratio.',
    columns: [
      { name: 'fact_sales.units_sold', type: 'int [DIRECT]', desc: 'Units for one SKU/country/channel/day. Summed over the month.' },
      { name: 'fact_sales.date_key', type: 'date [DIRECT]', desc: 'Filters rows to the trailing 1-month window.' },
    ],
    formula: '\text{Units}_{month} = \sum_{d \in month} \text{units\_sold}_d',
    formulaDescription: 'fn_portfolio_kpis(1).units_sold: a plain sum over the last month. Fixed at 1 month — it does not follow the timeline selector, by design of the card.',
    assumptions: ['Units are counted as shipped/sold; returns are not netted out (the dataset has no returns table).'],
    trendTitle: 'Last month (live)',
    trendHeaders: ['Measure', 'Value'],
    trendRows: [['Period', span], ['Units sold', u.toLocaleString('en-US')]],
  };
}

function forecastAttainmentContent(live: LiveData): AuditContent {
  const f = live.forecastAccuracy!;
  const att = f.attainment_pct * 100;
  const acc = f.accuracy_pct * 100;
  const bias = f.bias_pct * 100;
  return {
    title: 'Forecast Attainment',
    provenance: 'live',
    value: `${att.toFixed(1)}%`,
    soWhat: `Actual units were ${att.toFixed(1)}% of forecast units (${f.period_start} to ${f.period_end}). ` +
      `Line-level accuracy is lower, ${acc.toFixed(1)}% (1 − WAPE), because over- and under-forecasts on individual ` +
      `SKU/country/months partly cancel in the total. Bias is ${bias >= 0 ? '+' : ''}${bias.toFixed(1)}%: ` +
      (bias >= 0 ? 'the plan systematically over-forecasts.' : 'the plan systematically under-forecasts.'),
    action: bias > 5
      ? 'Over-forecasting drives excess safety stock; review the SKUs with the largest forecast-minus-actual gap first.'
      : 'Bias is within ±5%; focus on line-level accuracy rather than the total.',
    columns: [
      { name: 'fact_forecast.forecast_units', type: 'int [DIRECT]', desc: 'Planned units per SKU/country/month (generated plan, labelled as such).' },
      { name: 'fact_sales.units_sold', type: 'int [DIRECT]', desc: 'Actual units, rolled up to the same SKU/country/month grain.' },
    ],
    formula: '\text{Attainment} = \frac{\sum Actual}{\sum Forecast} \qquad \text{Accuracy} = 1 - \frac{\sum |Actual - Forecast|}{\sum Actual}',
    formulaDescription: 'fn_forecast_accuracy(p_months). The card shows attainment; accuracy and bias are in the delta line. No target is shown because the brief does not set one.',
    assumptions: [
      'The forecast is generated (fact_forecast), not a client planning system export — its error profile is a modelling choice.',
      'Compared at SKU × country × month; a coarser grain would report higher accuracy.',
    ],
    trendTitle: 'Forecast vs actual (live)',
    trendHeaders: ['Measure', 'Value'],
    trendRows: [
      ['Forecast units', f.forecast_units.toLocaleString('en-US')],
      ['Actual units', f.actual_units.toLocaleString('en-US')],
      ['Attainment', `${att.toFixed(1)}%`],
      ['Accuracy (1 − WAPE)', `${acc.toFixed(1)}%`],
      ['Bias', `${bias >= 0 ? '+' : ''}${bias.toFixed(1)}%`],
    ],
  };
}

// ── Launch Readiness (8 Oct, thread 5) ──────────────────────────────────────
const LAUNCH_COLUMNS = [
  { name: 'launch_gate.weight', type: 'numeric [ASSUMPTION]', desc: 'Share of readiness each of the 6 gates carries (sums to 1 per launch).' },
  { name: 'launch_gate.status', type: 'text [DIRECT]', desc: 'Completed / Overdue / Scheduled, as of 2025-12-31.' },
  { name: 'dim_launch.expected_year1_revenue_usd', type: 'numeric [ASSUMPTION]', desc: 'Year-1 revenue plan set before launch. Generated, labelled as an assumption.' },
];

function launchRows(live: LiveData) {
  return (live.launches ?? []).filter(l => l.sku_id === null)
    .sort((a, b) => a.planned_launch_date.localeCompare(b.planned_launch_date))
    .map(l => [l.product_name, l.stage, `${(l.readiness_pct * 100).toFixed(0)}%`, l.risk_level,
               `$${(l.expected_year1_revenue_usd / 1e6).toFixed(1)}M`]);
}

function launchReadinessContent(live: LiveData): AuditContent {
  const s = live.launchSummary!;
  const pct = (s.avg_pipeline_readiness_pct * 100).toFixed(0);
  return {
    title: 'Overall Readiness %', provenance: 'live', value: `${pct}%`,
    soWhat: `The ${s.pipeline_launches} pipeline launches have completed ${pct}% of their gate weight on average. ` +
      'Most of that spread is how early each launch is (a Business-case launch is 10-25% ready by design), so it is not a delay measure.',
    action: 'Read Launches at Risk for delay; use this to see how far along the pipeline is overall.',
    columns: LAUNCH_COLUMNS.slice(0, 2),
    formula: '\\text{Readiness}_l = \\sum_{g \\in \\text{completed}} w_g \\qquad \\overline{R} = \\frac{1}{N}\\sum_l \\text{Readiness}_l',
    formulaDescription: 'fn_launches.readiness_pct per launch, averaged in fn_launch_summary over pipeline launches only.',
    assumptions: ['Gate weights (10/15/25/15/20/15%) are an assumption, not a measured effort split.'],
    trendTitle: 'Pipeline launches (live)',
    trendHeaders: ['Launch', 'Open gate', 'Readiness', 'Risk', 'Year-1 plan'],
    trendRows: launchRows(live),
  };
}

function launchesAtRiskContent(live: LiveData): AuditContent {
  const s = live.launchSummary!;
  return {
    title: 'Launches at Risk', provenance: 'live', value: `${s.at_risk_launches} of ${s.pipeline_launches}`,
    soWhat: `${s.at_risk_launches} pipeline launches have at least one overdue gate (${s.gates_overdue} overdue gates in total).`,
    action: 'Each overdue gate appears in the Risk & Escalation Center with its due date and reviewer role.',
    columns: LAUNCH_COLUMNS.slice(1, 2),
    formula: '\\text{At risk} = \\#\\{l : \\exists g,\\ \\text{status}_g = \\text{Overdue}\\}',
    formulaDescription: 'fn_launches.risk_level = High. Medium (next open gate due within 45 days) is shown on the launch screen but not counted here.',
    assumptions: ['A gate is overdue when its due date has passed without completion — no partial credit.'],
    trendTitle: 'Pipeline launches (live)',
    trendHeaders: ['Launch', 'Open gate', 'Readiness', 'Risk', 'Year-1 plan'],
    trendRows: launchRows(live),
  };
}

function launchRevenueAtRiskContent(live: LiveData): AuditContent {
  const s = live.launchSummary!;
  const m = (x: number) => `$${(x / 1e6).toFixed(1)}M`;
  return {
    title: 'Launch Revenue at Risk', provenance: 'live', value: m(s.revenue_at_risk_usd),
    soWhat: `${m(s.revenue_at_risk_usd)} of the ${m(s.pipeline_year1_plan_usd)} pipeline year-1 plan belongs to launches with an overdue gate.`,
    action: 'Unblock the at-risk launch with the largest plan first.',
    columns: LAUNCH_COLUMNS,
    formula: '\\text{Revenue at risk} = \\sum_{l\\ \\text{at risk}} \\text{Plan}^{Y1}_l',
    formulaDescription: 'fn_launch_summary.revenue_at_risk_usd. The plan is a generated assumption: the category median of launched SKUs\' annualised first-year sales × a 0.7-1.3 draw.',
    assumptions: ['The whole year-1 plan counts as at risk; a late launch usually loses part of it, not all.'],
    trendTitle: 'Pipeline launches (live)',
    trendHeaders: ['Launch', 'Open gate', 'Readiness', 'Risk', 'Year-1 plan'],
    trendRows: launchRows(live),
  };
}

function launchPlanAttainmentContent(live: LiveData): AuditContent {
  const s = live.launchSummary!;
  const att = s.launched_plan_attainment_pct;
  const done = (live.launches ?? []).filter(l => l.sku_id !== null);
  return {
    title: 'Launch Plan Attainment', provenance: 'live', value: att === null ? '—' : `${(att * 100).toFixed(0)}%`,
    soWhat: att === null ? 'No launched SKUs to compare.'
      : `The ${s.launched} SKUs launched in 2024-25 delivered ${(att * 100).toFixed(0)}% of their year-1 plan in total.`,
    action: 'Use this as the calibration check on the pipeline plan figures.',
    columns: [
      { name: 'fact_sales.net_sales', type: 'numeric [DIRECT]', desc: 'First 365 days on sale per launched SKU; annualised when the data ends sooner.' },
      LAUNCH_COLUMNS[2],
    ],
    formula: '\\text{Attainment} = \\frac{\\sum_l \\text{Actual}^{Y1}_l}{\\sum_l \\text{Plan}^{Y1}_l}',
    formulaDescription: 'fn_launch_summary.launched_plan_attainment_pct, over launched SKUs only.',
    assumptions: ['2025 launches have less than a year of sales; their year 1 is annualised from what exists.'],
    trendTitle: 'Launched SKUs: year 1 vs plan (live)',
    trendHeaders: ['SKU', 'Launched', 'Year-1 actual', 'Plan', 'Attainment'],
    trendRows: done.map(l => [l.product_name, l.actual_launch_date ?? '',
      `$${((l.actual_year1_revenue_usd ?? 0) / 1e6).toFixed(2)}M`, `$${(l.expected_year1_revenue_usd / 1e6).toFixed(2)}M`,
      l.plan_attainment_pct === null ? '—' : `${(l.plan_attainment_pct * 100).toFixed(0)}%`]),
  };
}

// ── Assortment (8 Oct, thread 4): fn_assortment_summary ─────────────────────
function assortmentContent(metric: string, live: LiveData): AuditContent | null {
  const s = live.assortmentSummary;
  if (!s) return null;
  const m2 = (x: number) => x >= 1e6 ? `$${(x / 1e6).toFixed(2)}M` : `$${Math.round(x / 1e3)}K`;
  const base = {
    provenance: 'live' as const,
    trendTitle: 'Assortment headline (live)',
    trendHeaders: ['Measure', 'Value'],
    trendRows: [
      ['SKUs selling in window', String(s.active_skus)],
      [`Most SKUs in one country (${s.max_density_country})`, String(s.max_density)],
      ['SKUs under 1% of revenue', `${s.long_tail_skus} (${(s.long_tail_share * 100).toFixed(1)}%)`],
      ['Gross margin per selling SKU', m2(s.gross_yield_per_sku)],
      ['Significant cannibalizing pairs (snapshot)', String(s.cannibalization_pairs)],
      ['Listings never sold', String(s.listed_never_sold)],
    ],
  };
  switch (metric) {
    case 'Assortment Density':
      return { ...base, title: metric, value: `${s.max_density} SKUs`,
        soWhat: `${s.max_density_country} sells the most SKUs (${s.max_density}). ${s.listed_never_sold} listings across all markets have never had a sale.`,
        action: 'Start range reviews with the listed-never-sold lines.',
        columns: [{ name: 'fact_sales.sku_id', type: 'int [DIRECT]', desc: 'Distinct SKUs with a sale per country in the window.' },
                  { name: 'fact_listing', type: 'table [DIRECT]', desc: 'Listings with no matching sale count as listed-never-sold.' }],
        formula: '\\text{Density} = \\max_c \\#\\{\\text{SKUs selling in } c\\}',
        formulaDescription: 'fn_assortment_summary.max_density (from fn_assortment, per country).',
        assumptions: ['A SKU counts as selling in a country if it had any sale there in the window.'] };
    case 'Long-Tail Burden Ratio':
      return { ...base, title: metric, value: `${(s.long_tail_share * 100).toFixed(1)}%`,
        soWhat: `${s.long_tail_skus} of ${s.active_skus} SKUs each bring in under 1% of portfolio revenue. With ${s.active_skus} SKUs the average share is ${(100 / s.active_skus).toFixed(2)}%, so a majority under 1% is expected.`,
        action: 'Use with the Rationalize segment rather than alone.',
        columns: [{ name: 'fn_sku_performance.revenue_share_pct', type: 'numeric [DERIVED]', desc: 'SKU net sales ÷ portfolio net sales in the window.' }],
        formula: '\\text{Long tail} = \\frac{\\#\\{\\text{SKU} : \\text{share} < 1\\%\\}}{\\#\\text{SKUs}}',
        formulaDescription: 'fn_assortment_summary.long_tail_share.',
        assumptions: ['The 1% cut-off is fixed, not scaled to SKU count.'] };
    case 'Assortment Gross Yield':
      return { ...base, title: metric, value: m2(s.gross_yield_per_sku),
        soWhat: `Each selling SKU earned ${m2(s.gross_yield_per_sku)} gross margin on average in this window.`,
        action: 'Compare a removal candidate\'s yield with this average before delisting.',
        columns: [{ name: 'fact_sales.gross_margin', type: 'numeric [DERIVED]', desc: 'net_sales − units × purchase_cost.' }],
        formula: '\\text{Yield} = \\frac{\\sum \\text{gross margin}}{\\#\\text{SKUs selling}}',
        formulaDescription: 'fn_assortment_summary.gross_yield_per_sku. Scales with the window length.',
        assumptions: ['Gross margin only; logistics and other costs are not deducted.'] };
    case 'Cannibalization Risk Index':
      return { ...base, title: metric, value: s.cannibalization_index.toFixed(2),
        soWhat: `${s.cannibalization_pairs} SKU pairs show a significant negative promo-to-units correlation, averaging ${s.cannibalization_index.toFixed(2)}. ${s.top_cannibalization_category} has the most pairs.`,
        action: 'Stagger promotions inside the most-affected category.',
        columns: [{ name: 'sku_cannibalization.correlation', type: 'numeric [SNAPSHOT]', desc: 'Promo-to-units correlation between two SKUs, full history.' },
                  { name: 'sku_cannibalization.is_significant', type: 'boolean [SNAPSHOT]', desc: 'Only significant pairs are counted.' }],
        formula: '\\text{Index} = \\overline{|\\rho|} \\text{ over significant pairs with } \\rho < 0',
        formulaDescription: 'fn_assortment_summary.cannibalization_index. Snapshot: does not follow the timeline selector.',
        assumptions: ['Correlation, not measured demand transfer (TODO.md O5).'] };
  }
  return null;
}

function alertsContent(live: LiveData): AuditContent {
  const alerts = live.alerts ?? [];
  const byType = new Map<string, number>();
  for (const a of alerts) byType.set(a.alert_type, (byType.get(a.alert_type) ?? 0) + 1);
  const critical = alerts.filter(a => a.severity === 'critical').length;
  const rows = [...byType.entries()].sort((a, b) => b[1] - a[1]);

  return {
    title: 'Critical Alerts',
    provenance: 'live',
    value: String(critical),
    soWhat: `${critical} critical alerts of ${alerts.length} total, over the selected window. Rules: a SKU's stockout rate ` +
      '(stockout rows ÷ transactions) above 1.5x its prior-window rate, with at least 5 prior events (warning); an overdue launch gate (critical); a supplier ' +
      'end-of-life notice (warning); a SKU in the top 5 by promo margin erosion (warning); a significant ' +
      'cannibalization pair (info).',
    action: critical > 0
      ? `${critical} launch-gate overdue alerts need escalation first — they carry the critical severity in this rule set.`
      : 'No overdue launch gates this window.',
    columns: [
      { name: 'launch_gate.status', type: "text [DIRECT]", desc: "'Overdue' rows generate a critical alert." },
      { name: 'fact_sales.stock_out_flag', type: 'smallint [DIRECT]', desc: 'Summed per SKU per window; a 50%+ rise with 5+ prior events generates a warning.' },
      { name: 'supplier_notice.*', type: '[DIRECT]', desc: 'Every row generates a warning.' },
      { name: 'sku_metrics.margin_erosion', type: 'numeric [SNAPSHOT]', desc: 'Top 5 SKUs by erosion generate a warning.' },
      { name: 'sku_cannibalization.is_significant', type: 'boolean [DIRECT]', desc: 'Top 5 most negative pairs generate an info alert.' },
    ],
    formula: '\\text{Alert} = f(\\text{stockout spikes}, \\text{overdue gates}, \\text{EOL notices}, \\text{margin erosion}, \\text{cannibalization})',
    formulaDescription: 'Five fixed rules over real tables (fn_alerts), replacing a typed demo feed. Thresholds (1.5x prior stockout rate, top-5 margin erosion, top-5 cannibalization) are a judgment call, not a statistical fit.',
    assumptions: [
      'No alert-resolution workflow exists yet — every rule match is shown every time it is queried, there is no "acknowledged" state server-side.',
      'Margin erosion and cannibalization are read from a snapshot (sku_metrics/sku_cannibalization), not the selected window.',
    ],
    trendTitle: 'Alerts by type (live)',
    trendHeaders: ['Alert Type', 'Count'],
    trendRows: rows.map(([type, n]) => [type, String(n)]),
  };
}

function valueDilutingContent(live: LiveData): AuditContent {
  const k = live.kpis!;
  const skus = live.skus ?? [];
  const portfolioPct = k.gross_margin_pct;
  const diluting = skus
    .filter(s => s.gross_margin_pct < portfolioPct)
    .sort((a, b) => b.net_sales - a.net_sales);
  const dilutingRev = diluting.reduce((sum, s) => sum + s.net_sales, 0);

  return {
    title: 'Value Diluting SKUs',
    provenance: 'live',
    value: `${diluting.length} SKUs`,
    soWhat: `${diluting.length} of ${skus.length} SKUs earn a gross margin below the portfolio's own ${(portfolioPct * 100).toFixed(2)}%, and together they carry $${(dilutingRev / 1e6).toFixed(1)} M — ${((dilutingRev / k.net_sales) * 100).toFixed(1)}% of net sales. Diluting margin is not the same as losing money: every one of these is still gross-profitable. ${windowNote(k)}`,
    action: diluting.length > 0
      ? `Start with the largest by revenue (listed below) — those move the portfolio margin most. A low-margin SKU with trivial revenue is not worth a decision.`
      : 'No SKU is currently below the portfolio margin.',
    columns: [
      { name: 'fact_sales.gross_margin', type: 'numeric(14,2) [GENERATED]', desc: 'Per-row margin, aggregated to a per-SKU percentage by fn_sku_performance().' },
      { name: 'fact_sales.net_sales', type: 'numeric(12,2) [DIRECT]', desc: 'Used both for the per-SKU margin denominator and to rank by materiality.' },
    ],
    formula: 'D = \\left\\{ i : GM\\%_i < GM\\%_{portfolio} \\right\\}',
    formulaDescription: `The set of SKUs whose own gross margin percentage falls below the portfolio's revenue-weighted margin for the same window. The threshold is the portfolio's own figure, not a typed-in target — so it moves with the data and with the timeline selector. Per-SKU margin comes from fn_sku_performance() in 03_derive_metrics.sql.`,
    assumptions: [
      'The comparison threshold is the portfolio margin itself. Against a fixed 40% target the count would be larger, and the card would mean something different.',
      'Because the threshold is revenue-weighted, roughly half the portfolio sitting below it is arithmetically normal, not a red flag on its own.',
      'Gross margin only — no SKU-level overhead or complexity cost is included, because the data has none.',
    ],
    trendTitle: 'Largest margin-diluting SKUs by revenue (live)',
    trendHeaders: ['SKU', 'Gross Margin %', 'Net Sales'],
    trendRows: diluting.slice(0, 8).map(s => [
      s.sku_name,
      `${(s.gross_margin_pct * 100).toFixed(2)}%`,
      `$${(s.net_sales / 1e6).toFixed(1)} M`,
    ]),
  };
}

function portfolioHealthContent(live: LiveData): AuditContent {
  const h = calculatePortfolioHealth(liveSkusList(SKUS, live.skus, live.skuSegments), live.skuRevenueM);
  const totalSkus = h.intro + h.growth + h.margin + h.decline;
  // Live once growth/margin (windowed) and complexity/stockouts (snapshot)
  // are all present — liveSkusList falls back silently per SKU otherwise, so
  // this is the same completeness check it uses internally (TODO.md O18).
  const isFullyLive = !!(live.skus && live.skuSegments);
  return {
    title: 'Portfolio Health Score',
    // Weights (45/35/10/10) are still a judgment call, not a statistical fit —
    // true regardless of how live the 4 inputs are, so stated in
    // formulaDescription below rather than implied by the badge.
    provenance: isFullyLive ? 'live' : undefined,
    value: `${h.score}%`,
    soWhat: `Portfolio health stands at ${h.score}%, built from 4 weighted factors: ` +
      `${h.factors.positiveTrend.value.toFixed(0)}% of SKUs in a healthy lifecycle stage, ` +
      `${h.factors.margin.value.toFixed(0)}% margin-factor score, a complexity score of ` +
      `${h.factors.complexity.value.toFixed(0)}, and a stockout score of ` +
      `${h.factors.stockouts.value.toFixed(0)} (both already inverted, higher is better). ` +
      `${h.decline} of ${totalSkus} SKUs are in the Decline stage.`,
    action: h.decline > 0
      ? `Review the ${h.decline} Decline-stage SKUs for rationalization — they carry the largest weight (45%) in this score via the lifecycle-mix factor.`
      : 'No SKUs are currently in the Decline stage.',
    columns: [
      { name: 'growth', type: 'float [DIRECT]', desc: 'YoY growth rate — determines lifecycle stage (Decline if negative).' },
      { name: 'margin', type: 'float [DIRECT]', desc: 'Gross margin % — feeds the margin factor directly.' },
      { name: 'cx', type: 'float [DIRECT]', desc: 'Complexity index — feeds the complexity penalty.' },
      { name: 'stockout rate', type: 'float [DERIVED]', desc: 'fn_sku_performance: stockout_events ÷ transactions per SKU, over the window. Penalty = average rate in percentage points, capped at 15.' },
    ],
    formula: 'H = 0.45{\\times}LifecycleMix + 0.35{\\times}Margin + 0.10{\\times}(100-Complexity) + 0.10{\\times}(100-Stockouts)',
    formulaDescription: 'The 4 weights (45/35/10/10) and the 2 penalty constants behind the Complexity and ' +
      'Stockouts factors are an internal judgment call, not a statistical fit or industry benchmark — ' +
      'stated plainly here rather than presented as empirically derived.',
    assumptions: [
      'Lifecycle stage is Decline whenever YoY growth is negative, regardless of how small the decline is.',
      'Complexity and stockout penalties are capped (complexity ≤25 points, stockouts ≤15 points) so neither alone can zero out the score.',
      'The stockout penalty uses a rate, not a count: a 9% average stockout rate costs 9 points; 15% or more costs the full 15.',
    ],
    trendTitle: 'Score Factor Breakdown',
    trendHeaders: ['Factor', 'Value', 'Weight', 'Points Contributed'],
    trendRows: Object.values(h.factors).map(f =>
      [f.label, f.value.toFixed(1), `${(f.weight * 100).toFixed(0)}%`, f.points.toFixed(1)]
    ),
  };
}

/**
 * Build a live explanation for `metric`, or null to fall back to the static entry.
 *
 * `metric` is the key already resolved by the drawer's own alias mapping, so the
 * Home tab's "Total Revenue" arrives here as 'Revenue MTD'.
 */
export function buildLiveAuditContent(
  metric: string | null,
  live: LiveData,
): AuditContent | null {
  if (!metric) return null;

  // Computed from SKUS plus live per-SKU revenue, so it works offline too.
  if (metric === 'Portfolio Health Score') return portfolioHealthContent(live);

  // Everything below needs the warehouse. Offline, the static entry is used and
  // says plainly that its figures are built-in samples.
  if (!live.kpis) return null;

  switch (metric) {
    case 'Revenue MTD': return revenueContent('Total Revenue', live);
    case 'Portfolio Revenue': return revenueContent('Portfolio Revenue', live);
    case 'Portfolio SKUs': return skuCountContent('Active SKUs', live);
    case 'Portfolio SKU Count': return skuCountContent('Portfolio SKU Count', live);
    case 'Growth Rate': return growthContent(live);
    case 'Gross Profit': return grossProfitContent(live);
    case 'Gross margin %': return grossMarginPctContent(live);
    case 'Value Diluting SKUs': return valueDilutingContent(live);
    case 'Portfolio PCI': return live.portfolioSnapshot ? portfolioComplexityContent(live) : null;
    case 'Total Active Signals': return live.alerts ? alertsContent(live) : null;
    case 'Net Profit': return live.pnl ? netProfitContent(live) : null;
    case 'Total SG&A Overhead': return live.pnl ? sgaContent(live) : null;
    case 'Rationalize Candidates': return live.skuSegments ? rationalizeCandidatesContent(live) : null;
    case 'Long-Tail SKU Burden': return live.skuSegments ? longTailBurdenContent(live) : null;
    case 'Peak Stockout Freq.': return live.skuSegments ? peakStockoutContent(live) : null;
    case 'Revenue Tail Risk': return live.skuSegments ? revenueTailRiskContent(live) : null;
    case 'Avg Complexity': return live.skuSegments ? avgComplexityContent(live) : null;
    case 'Units Sold — Last Month': return live.lastMonthUnits !== undefined ? unitsLastMonthContent(live) : null;
    case 'Forecast Attainment': return live.forecastAccuracy ? forecastAttainmentContent(live) : null;
    case 'Overall Readiness %': return live.launchSummary ? launchReadinessContent(live) : null;
    case 'Launches at Risk': return live.launchSummary ? launchesAtRiskContent(live) : null;
    case 'Launch Revenue at Risk': return live.launchSummary ? launchRevenueAtRiskContent(live) : null;
    case 'Launch Plan Attainment': return live.launchSummary ? launchPlanAttainmentContent(live) : null;
    case 'Assortment Density':
    case 'Long-Tail Burden Ratio':
    case 'Assortment Gross Yield':
    case 'Cannibalization Risk Index':
      return assortmentContent(metric, live);
    default: return null;
  }
}
