/**
 * Live builders for the SKU Rationalisation home (tab 9) and SKU Drill Down
 * (tab 10), from fn_sku_rationale (TODO.md O18, thread 3, 8 Oct).
 *
 * Both tabs used to show invented SKUs ("BrandA Cola 500ml", 200 generated
 * brand x product rows), invented regions (LATAM, APAC) and invented
 * root-cause numbers. Every builder here only reshapes and formats the SQL
 * rows: the classification rules, thresholds and the "margin without this
 * SKU" figure all live in fn_sku_rationale.
 *
 * Customer & Market and Regulatory & Risk have no data source; they are kept
 * in the outputs at zero and labelled, not hidden.
 */
import type { LiveSkuRationale } from '../../../api/liveData';
import type { RoadmapPhaseData } from './rationalisationData';

export const FACTOR_GROUPS = [
  { name: 'Financial Reasons', short: 'Financial', color: '#ef4444' },
  { name: 'Portfolio Reasons', short: 'Portfolio', color: '#3b82f6' },
  { name: 'Supply Chain Reasons', short: 'Supply Chain', color: '#f59e0b' },
  { name: 'Customer & Market', short: 'Customer & Market', color: '#a855f7' },
  { name: 'Regulatory & Risk', short: 'Regulatory & Risk', color: '#10b981' },
] as const;

/** Groups with no data behind them — shown at zero with this reason. */
export const NO_SOURCE_GROUPS: Record<string, string> = {
  'Customer & Market': 'No complaint, survey or competitor data in the dataset.',
  'Regulatory & Risk': 'No regulatory or compliance data in the dataset.',
};

export const PHASE_ACTIONS: Record<string, string> = {
  q1: 'Discontinue / Consolidate',
  q2: 'Reposition',
  q3: 'Reformulate / Redesign',
  q4: 'Invest / Expand',
};

const PALETTE = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500', 'bg-red-500', 'bg-teal-500', 'bg-pink-500'];

export const pct = (x: number | null | undefined, d = 1) => (x === null || x === undefined ? '—' : `${(x * 100).toFixed(d)}%`);
export const pp = (x: number, d = 1) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(d)}pt`;
export const money = (x: number) => (x === 0 ? '$0' : Math.abs(x) >= 1e6 ? `$${(x / 1e6).toFixed(2)}M` : `$${Math.round(x / 1e3)}K`);

/** Count of flagged SKUs and distinct factors per group (all 5 groups). */
export function groupCounts(rows: LiveSkuRationale[]) {
  return Object.fromEntries(FACTOR_GROUPS.map(g => {
    const mine = rows.filter(r => r.factor_group === g.name);
    return [g.name, { skus: mine.length, factors: new Set(mine.map(r => r.factor)).size }];
  })) as Record<string, { skus: number; factors: number }>;
}

/** RATIONALE_DRIVERS shape: SKUs per group, ranked. */
export function buildDrivers(rows: LiveSkuRationale[]) {
  const total = rows.length || 1;
  return FACTOR_GROUPS
    .map(g => {
      const count = rows.filter(r => r.factor_group === g.name).length;
      return { name: g.short, count, pct: Math.round((count / total) * 100), color: g.color, rank: 0 };
    })
    .sort((a, b) => b.count - a.count)
    .map((d, i) => ({ ...d, rank: i + 1 }));
}

const tally = (items: string[]) => {
  const m = new Map<string, number>();
  for (const i of items) m.set(i, (m.get(i) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

/** ROADMAP_PHASES_DETAILS shape, one entry per action. */
export function buildPhases(rows: LiveSkuRationale[]): Record<string, RoadmapPhaseData> {
  const portMargin = rows[0]?.portfolio_margin_pct ?? 0;
  const portGrowth = rows[0]?.portfolio_growth_pct ?? null;
  return Object.fromEntries(Object.entries(PHASE_ACTIONS).map(([key, action], i) => {
    const mine = rows.filter(r => r.action === action);
    const revenue = mine.reduce((s, r) => s + r.net_sales, 0);
    const cats = tally(mine.map(r => r.category_name));
    const regs = tally(mine.map(r => r.region ?? '—'));
    const avgMargin = mine.length ? mine.reduce((s, r) => s + r.gross_margin_pct, 0) / mine.length : null;
    const grow = mine.filter(r => r.growth_pct !== null);
    const avgGrowth = grow.length ? grow.reduce((s, r) => s + (r.growth_pct ?? 0), 0) / grow.length : null;
    const insights = mine.length === 0 ? [`No SKU is classified "${action}" in this window.`] : [
      `${cats[0][1]} of ${mine.length} SKUs (${Math.round((cats[0][1] / mine.length) * 100)}%) are in ${cats[0][0]}.`,
      avgMargin !== null ? `Average gross margin ${pct(avgMargin)} vs the portfolio's ${pct(portMargin)} (${pp(avgMargin - portMargin)}).` : '',
      avgGrowth !== null && portGrowth !== null ? `Average growth ${pct(avgGrowth)} vs the portfolio's ${pct(portGrowth)}.` : '',
      `${regs[0][0]} is the largest region for ${regs[0][1]} of them (by each SKU's own sales).`,
      `Net sales involved in this window: ${money(revenue)}.`,
    ].filter(Boolean);
    return [key, {
      title: action,
      step: `Q${i + 1} - Step ${i + 1}`,
      skusCount: mine.length,
      revenue: money(revenue),
      action,
      categories: cats.map(([name, count], j) => ({ name, count, color: PALETTE[j % PALETTE.length] })),
      regions: regs.map(([name, count], j) => ({ name, count, color: PALETTE[j % PALETTE.length] })),
      stages: tally(mine.map(r => r.lifecycle_stage)).map(([name, count], j) => ({ name, count, color: PALETTE[j % PALETTE.length] })),
      insights,
      skus: mine.map(r => ({
        sku: r.sku_name,
        code: `SKU-${r.sku_id}`,
        category: r.category_name,
        region: r.region ?? '—',
        revenue: money(r.net_sales),
        margin: pct(r.gross_margin_pct),
        growth: r.growth_pct === null ? '—' : `${r.growth_pct >= 0 ? '+' : ''}${(r.growth_pct * 100).toFixed(1)}%`,
        growthColor: (r.growth_pct ?? 0) < 0 ? 'text-red-500' : 'text-emerald-500',
        stage: r.lifecycle_stage,
        action: r.action,
      })),
    } as RoadmapPhaseData];
  }));
}

const PRIORITY_RANK: Record<string, number> = { Critical: 0, High: 1, Medium: 2 };

/** One-line description of why the SKU is flagged, from its own figures. */
export function factorDescription(r: LiveSkuRationale): string {
  switch (r.factor) {
    case 'Supplier Discontinuation':
      return `Supplier notice: ${(r.eol_notice_type ?? '').toLowerCase()}, effective ${r.eol_effective_date}.`;
    case 'Declining Sales':
      return `Net sales ${pct(r.growth_pct)} vs the prior window; portfolio ${pct(r.portfolio_growth_pct)}.`;
    case 'Low Profitability':
      return `Gross margin ${pct(r.gross_margin_pct)} vs portfolio ${pct(r.portfolio_margin_pct)} (${pp(r.gross_margin_pct - r.portfolio_margin_pct)}).`;
    case 'Inventory Inefficiency':
      return `Stockouts on ${pct(r.stockout_rate)} of sales rows vs ${pct(r.portfolio_stockout_rate)} portfolio-wide.`;
    case 'Cannibalization':
      return `Promo-to-units correlation ${r.cann_correlation?.toFixed(2)} with ${r.cann_partner}, the larger SKU of the pair.`;
    case 'SKU Proliferation':
      return `Rationalize segment (low value, high complexity) and under 1% of revenue (${pct(r.revenue_share_pct, 2)}).`;
    case 'Strong Brand Growth':
      return `Net sales ${pct(r.growth_pct)} vs the prior window, against ${pct(r.portfolio_growth_pct)} for the portfolio.`;
    default:
      return '';
  }
}

/** CRITICAL_ALERTS shape: the 6 most urgent non-invest SKUs. */
export function buildCriticalAlerts(rows: LiveSkuRationale[]) {
  return rows
    .filter(r => r.action !== 'Invest / Expand')
    .sort((a, b) => (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) || b.net_sales - a.net_sales)
    .slice(0, 6)
    .map(r => ({
      sku: r.sku_name,
      riskScore: r.priority,
      factor: r.factor,
      desc: factorDescription(r),
      action: r.action,
      productCat: r.category_name,
      live: r,
    }));
}

/** Impact band by the SKU's sales in the window (presentation only). */
const impactBand = (ns: number) => (ns >= 3e6 ? 'High' : ns >= 1e6 ? 'Medium' : 'Low impact');

/** EXPLORER_ROWS shape for tab 10. */
export function toExplorerRows(rows: LiveSkuRationale[]) {
  return rows.map(r => ({
    sku: r.sku_name,
    productCat: r.category_name,
    factor: r.factor,
    cat: r.factor_group,
    desc: factorDescription(r),
    impact: impactBand(r.net_sales),
    action: r.action,
    priority: r.priority,
    region: r.region ?? '—',
    live: r,
  }));
}

type Status = 'Critical' | 'Warning' | 'OK';

/**
 * Root-cause panel content for one SKU. "rootCauses" lists every rule the SKU
 * meets, not only the primary one; "perks" compares the SKU with the
 * portfolio and with the portfolio without it — no projected future values.
 */
export function liveRcaDetails(r: LiveSkuRationale) {
  const gap = r.gross_margin_pct - r.portfolio_margin_pct;
  const causes: { title: string; desc: string }[] = [];
  if (r.eol_notice_type) causes.push({ title: 'Supplier notice', desc: factorDescription({ ...r, factor: 'Supplier Discontinuation' }) });
  if (r.growth_pct !== null && r.growth_pct < 0) causes.push({ title: 'Declining sales', desc: factorDescription({ ...r, factor: 'Declining Sales' }) });
  if (gap < -0.08) causes.push({ title: 'Margin below portfolio', desc: factorDescription({ ...r, factor: 'Low Profitability' }) });
  if (r.stockout_rate > 2 * r.portfolio_stockout_rate) causes.push({ title: 'Frequent stockouts', desc: factorDescription({ ...r, factor: 'Inventory Inefficiency' }) });
  if (r.cann_partner) causes.push({ title: 'Cannibalization pair', desc: `Promo-to-units correlation ${r.cann_correlation?.toFixed(2)} with ${r.cann_partner}.` });
  if (r.portfolio_segment === 'Rationalize') causes.push({ title: 'Rationalize segment', desc: `Below-median commercial value, at-or-above-median complexity (${r.complexity.toFixed(2)}).` });
  if (r.margin_erosion >= 5) causes.push({ title: 'Promotion erodes margin', desc: `${r.margin_erosion.toFixed(1)}pt lower margin when promoted.` });
  if (r.growth_pct !== null && r.growth_pct >= 0.12) causes.push({ title: 'Strong growth', desc: factorDescription({ ...r, factor: 'Strong Brand Growth' }) });

  const status = (bad: boolean, warn: boolean): Status => (bad ? 'Critical' : warn ? 'Warning' : 'OK');
  const marginDelta = r.margin_without_sku_pct - r.portfolio_margin_pct;
  return {
    summary: factorDescription(r),
    rootCauses: causes.slice(0, 3),
    metrics: [
      { label: 'Gross Margin', value: pct(r.gross_margin_pct), target: `${pct(r.portfolio_margin_pct)} portfolio`, status: status(gap < -0.08, gap < 0) },
      { label: 'Growth', value: pct(r.growth_pct), target: `${pct(r.portfolio_growth_pct)} portfolio`, status: status((r.growth_pct ?? 0) < 0, (r.growth_pct ?? 0) < (r.portfolio_growth_pct ?? 0)) },
      { label: 'Stockout rate', value: pct(r.stockout_rate), target: `${pct(r.portfolio_stockout_rate)} portfolio`, status: status(r.stockout_rate > 2 * r.portfolio_stockout_rate, r.stockout_rate > r.portfolio_stockout_rate) },
    ],
    recommendations: RECOMMENDATION[r.action] ?? 'Review with the category team.',
    perks: [
      { metric: 'Net sales in window', current: money(r.net_sales), future: `${pct(r.revenue_share_pct, 2)} of portfolio`, delta: r.action === 'Invest / Expand' ? 'Grow' : `−${money(r.net_sales)} if removed`, isPositive: r.action === 'Invest / Expand' },
      { metric: 'Gross margin', current: pct(r.gross_margin_pct), future: pct(r.portfolio_margin_pct), delta: pp(gap), isPositive: gap >= 0 },
      { metric: 'Portfolio margin without this SKU', current: pct(r.portfolio_margin_pct), future: pct(r.margin_without_sku_pct), delta: pp(marginDelta, 2), isPositive: marginDelta > 0 },
      { metric: 'Promo margin erosion', current: `${r.margin_erosion.toFixed(1)}pt`, future: '—', delta: '—', isPositive: r.margin_erosion < 5 },
    ],
  };
}

const RECOMMENDATION: Record<string, string> = {
  'Discontinue / Consolidate': 'Plan the exit: run down stock, and move listings and promotion to the nearest remaining SKU in the category. Check the cannibalization partner first, if there is one.',
  'Reposition': 'Sales are falling but the SKU is not in the long tail: review price point, pack and channel before deciding to exit.',
  'Reformulate / Redesign': 'Fix the cost or supply problem rather than the range: review cost price and promotion depth for low margin, or lead time and safety stock for stockouts.',
  'Invest / Expand': 'Protect supply and widen distribution: this SKU is growing faster than the portfolio.',
};

/** Plain-language reason for tab 10's justification box. */
export function liveReason(r: LiveSkuRationale): string {
  return `${r.sku_name} is flagged for ${r.factor.toLowerCase()} (${r.factor_group}). ${factorDescription(r)} ` +
    `Recommended action: ${r.action}. ${RECOMMENDATION[r.action] ?? ''}`;
}
