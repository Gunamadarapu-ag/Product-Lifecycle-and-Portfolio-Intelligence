/**
 * Live data from the FastAPI backend (backend/app/main.py → PostgreSQL).
 *
 * One fetch per timeline period, shared through context, so every screen that
 * shows a figure shows the same one. The backend does no arithmetic either —
 * every value comes from a SQL function in data/schema/03_derive_metrics.sql.
 *
 * If the API can't be reached (e.g. the static Vercel deployment, which has no
 * backend), status becomes 'offline' and components fall back to their
 * built-in figures. The UI says so — see <LiveDataBadge> — rather than silently
 * presenting sample numbers as real ones.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { TimelineRange } from '../utils/timeframe';

export interface PortfolioKpis {
  period_start: string;
  period_end: string;
  months_requested: number;
  months_available: number;
  net_sales: number;
  gross_margin: number;
  gross_margin_pct: number;
  units_sold: number;
  active_skus: number;
  stockout_events: number;
  prior_net_sales: number | null;
  growth_pct: number | null;
}

export interface Concentration {
  sku_count: number;
  top10_share: number;
  top20_share: number;
  top30_share: number;
}

export interface SkuPerformance {
  sku_id: number;
  sku_name: string;
  category_name: string;
  brand_name: string;
  net_sales: number;
  gross_margin_pct: number;
  units_sold: number;
  stockout_events: number;
  prior_net_sales: number | null;
  growth_pct: number | null;
  revenue_share_pct: number;
  /** fact_sales rows in the window — the denominator for a stockout rate. */
  transactions: number;
}

export interface MonthPoint {
  month_start: string;
  net_sales: number;
  gross_margin_pct: number;
  active_skus: number;
}

export interface RegionFulfillment {
  country_name: string;
  region: string;
  net_sales: number;
  gross_margin_pct: number;
  prior_net_sales: number | null;
  revenue_growth_pct: number | null;
  prior_gross_margin_pct: number | null;
  margin_change: number | null;
  transactions: number;
  stockout_events: number;
  fulfillment_pct: number;
  avg_lead_time_days: number;
  prior_fulfillment_pct: number | null;
  fulfillment_change: number | null;
}

// 7 Oct additions (TODO.md O18). skuSegments/portfolioSnapshot/cannibalization
// are snapshot data — see the comment above fn_sku_segments in
// 03_derive_metrics.sql for why they carry no months parameter.
export interface SkuSegment {
  sku_id: number;
  sku_name: string;
  portfolio_segment: 'Keep' | 'Grow' | 'Consolidate' | 'Rationalize';
  commercial_value_score: number;
  operational_complexity_score: number;
  op_burden_ratio: number;
  safety_stock_proxy: number;
  revenue_share_pct: number;
  low_velocity_flag: 0 | 1;
  total_stockouts: number;
  margin_erosion: number;
  promo_dependency: number;
  cannibalization_risk_score: number;
  volatility_class: string;
  cv_score: number;
}

export interface PortfolioSnapshot {
  snapshot_date: string;
  portfolio_complexity_index: number;
  supplier_fragmentation: number;
  sku_proliferation: number;
  low_velocity_pct: number;
  lead_time_instability: number;
  promo_dependency_score: number;
  avg_volatility_cv: number;
}

export interface Alert {
  alert_id: string;
  severity: 'critical' | 'warning' | 'info';
  alert_type: string;
  title: string;
  detail: string;
  sku_id: number | null;
}

export interface ForecastAccuracy {
  period_start: string;
  period_end: string;
  forecast_units: number;
  actual_units: number;
  wape: number;
  bias_pct: number;
  /** sum(actual) / sum(forecast) — volume delivered against plan. */
  attainment_pct: number;
  /** 1 - WAPE — how close the forecast was, line by line. */
  accuracy_pct: number;
}

export interface CustomerInsight {
  customer_id: number;
  customer_name: string;
  account_tier: string;
  country_name: string;
  channel_name: string;
  net_sales: number;
  prior_net_sales: number | null;
  growth_pct: number | null;
  top_sku_name: string | null;
}

/** fn_sku_rationale: why one real SKU is flagged, and the action (tabs 9-10). */
export interface LiveSkuRationale {
  sku_id: number;
  sku_name: string;
  category_name: string;
  brand_name: string;
  region: string | null;
  lifecycle_stage: string;
  net_sales: number;
  gross_margin_pct: number;
  portfolio_margin_pct: number;
  growth_pct: number | null;
  portfolio_growth_pct: number | null;
  margin_erosion: number;
  promo_dependency: number;
  stockout_rate: number;
  portfolio_stockout_rate: number;
  complexity: number;
  portfolio_segment: string;
  cann_partner: string | null;
  cann_correlation: number | null;
  eol_notice_type: string | null;
  eol_effective_date: string | null;
  factor: string;
  factor_group: string;
  action: string;
  priority: 'Critical' | 'High' | 'Medium';
  revenue_share_pct: number;
  /** Portfolio margin with this SKU removed and no demand transfer. */
  margin_without_sku_pct: number;
}

/** fn_assortment_summary: the 4 Assortment KPI cards (tab 8). */
export interface AssortmentSummary {
  active_skus: number;
  max_density: number;
  max_density_country: string;
  long_tail_skus: number;
  long_tail_share: number;
  gross_yield_per_sku: number;
  /** Snapshot (sku_cannibalization): mean |correlation| of significant negative pairs. */
  cannibalization_index: number;
  cannibalization_pairs: number;
  top_cannibalization_category: string;
  listed_never_sold: number;
}

/** fn_signals: an internal signal with its category, region and $ impact. */
export interface LiveSignal {
  signal_id: string;
  severity: 'critical' | 'warning' | 'info';
  /** Launch | Supply | Margin | Cannibalization | Demand | Opportunity */
  signal_type: string;
  title: string;
  detail: string;
  category_name: string;
  region: string;
  impact_usd: number | null;
  impact_label: string;
  trigger_rule: string;
  recommended_action: string;
  sku_id: number | null;
}

/** fn_category_trend: one category's sales in one week or month. */
export interface CategoryTrendPoint {
  period_start: string;
  category_name: string;
  net_sales: number;
  /** 100 = the category's first full period in the window. */
  sales_index: number;
}

/** fn_launches: one launch, pipeline (sku_id null) or already launched. */
export interface LiveLaunch {
  launch_id: string;
  sku_id: number | null;
  product_name: string;
  category_name: string;
  brand_name: string;
  planned_launch_date: string;
  actual_launch_date: string | null;
  /** The first gate not yet completed, or 'Launched'. */
  stage: string;
  budget_usd: number;
  spent_usd: number;
  owner_role: string;
  readiness_pct: number;
  gates_overdue: number;
  /** Labelled assumption (dim_launch, 8 Oct). */
  lead_region: string;
  /** Labelled assumption: the year-1 revenue plan set before launch. */
  expected_year1_revenue_usd: number;
  /** Launched SKUs only: first 365 days of fact_sales, annualised. */
  actual_year1_revenue_usd: number | null;
  plan_attainment_pct: number | null;
  next_gate_due: string | null;
  /** SQL rule: High = gate overdue; Medium = next gate due within 45 days. */
  risk_level: 'High' | 'Medium' | 'Low';
}

/** fn_launch_gates(NULL): every launch's 6 gates. */
export interface LiveLaunchGate {
  launch_id: string;
  gate_no: number;
  gate_name: string;
  weight: number;
  reviewer_role: string;
  due_date: string;
  completed_date: string | null;
  status: 'Completed' | 'Overdue' | 'Scheduled';
}

/** fn_launch_summary: the pipeline headline. */
export interface LaunchSummary {
  pipeline_launches: number;
  launched: number;
  avg_pipeline_readiness_pct: number;
  at_risk_launches: number;
  gates_overdue: number;
  pipeline_year1_plan_usd: number;
  revenue_at_risk_usd: number;
  pipeline_budget_usd: number;
  pipeline_spent_usd: number;
  launched_plan_attainment_pct: number | null;
}

/** fn_customer_category_insights: an account's sales within one category. */
export interface CustomerCategoryInsight extends CustomerInsight {
  category_name: string;
  /** 1 = the category's largest account in the window. */
  category_rank: number;
}

/** fn_region_mix: one region's sales split by category or by channel. */
export interface RegionMixRow {
  region: string;
  dimension: 'category' | 'channel';
  name: string;
  net_sales: number;
  prior_net_sales: number | null;
}

export interface LiveData {
  status: 'loading' | 'live' | 'offline';
  months: number;
  kpis?: PortfolioKpis;
  concentration?: Concentration;
  skus?: SkuPerformance[];
  /** Net sales in $M keyed by SKU name — the join key shared with constants/data.ts SKUS. */
  skuRevenueM?: Record<string, number>;
  trend?: MonthPoint[];
  skuSegments?: SkuSegment[];
  portfolioSnapshot?: PortfolioSnapshot;
  alerts?: Alert[];
  forecastAccuracy?: ForecastAccuracy;
  customerInsights?: CustomerInsight[];
  /**
   * Units sold in the single most recent complete month — fetched at a fixed
   * 1 month regardless of the timeline selector. There is no orders table
   * (TODO.md O18/O17), so "Orders Today" is replaced by this real figure
   * rather than left fabricated.
   */
  lastMonthUnits?: number;
  lastMonthPeriod?: { start: string; end: string };
  pnl?: Pnl;
  pnlByCategory?: PnlByCategory[];
  rationalizationScenarios?: RationalizationScenario[];
  /** Top 5 accounts per category (fn_customer_category_insights). */
  customerCategoryInsights?: CustomerCategoryInsight[];
  /** Per-region category and channel split (fn_region_mix). */
  regionMix?: RegionMixRow[];
  /** Launch pipeline (fn_launches / fn_launch_gates / fn_launch_summary) — not windowed. */
  launches?: LiveLaunch[];
  launchGates?: LiveLaunchGate[];
  launchSummary?: LaunchSummary;
  /** Signals Board (fn_signals) — windowed. */
  signals?: LiveSignal[];
  /** Assortment KPI cards (fn_assortment_summary) — windowed except cannibalization. */
  assortmentSummary?: AssortmentSummary;
  /** SKU rationale for tabs 9-10 (fn_sku_rationale) — windowed. */
  skuRationale?: LiveSkuRationale[];
  /** Where live figures came from: the running API, or the frozen snapshot. */
  source?: 'api' | 'snapshot';
}

// Thread 3 (SKU Rationalization). Snapshot — computed once from sku_metrics,
// not re-derived per request; see fn_rationalization_scenarios.
export interface RationalizationScenario {
  scenario_id: number;
  scenario_label: string;
  skus_removed: number;
  revenue_impact_pct: number;
  margin_impact_pct: number;
  safety_stock_freed_pct: number;
  supplier_reduction_pct: number;
}

// Thread 2 (Profitability, TODO.md O18). Every cost term is a dim_cost_assumption-
// labelled assumption — see fn_pnl in 03_derive_metrics.sql.
export interface Pnl {
  period_start: string;
  period_end: string;
  net_sales: number;
  gross_margin: number;
  logistics_usd: number;
  marketing_usd: number;
  sga_variable_usd: number;
  sga_fixed_usd: number;
  fixed_sku_cost_usd: number;
  opex_total_usd: number;
  ebit_usd: number;
  tax_usd: number;
  net_profit_usd: number;
}

export interface PnlByCategory {
  category_name: string;
  net_sales: number;
  gross_margin: number;
  logistics_usd: number;
  marketing_usd: number;
  sga_usd: number;
  fixed_sku_cost_usd: number;
}

export const TIMELINE_MONTHS: Record<TimelineRange, number> = {
  '1m': 1, '3m': 3, '6m': 6, '12m': 12, '24m': 24, '36m': 36,
};

/*
 * Data snapshot (15 Oct). The shareable deployment is a static site with no
 * database, so scripts/build_snapshot.py freezes every API answer the app asks
 * for into public/data-snapshot/. Order of preference:
 *   1. the live API (local development, `npm run api`);
 *   2. the snapshot — real SQL-computed figures, frozen at the data's end date;
 *   3. the built-in sample figures (status 'offline'), as before.
 * A build made with `vite build --mode snapshot` skips step 1 entirely, so
 * the hosted site never logs failed /api requests.
 */
const SNAPSHOT_ONLY = import.meta.env.MODE === 'snapshot';
/** null = not tried yet; false = unreachable, go straight to the snapshot. */
let apiReachable: boolean | null = SNAPSHOT_ONLY ? false : null;
let snapshotUsed = false;

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

/** Must match snapshot_path() in scripts/build_snapshot.py. */
export function snapshotPath(url: string): string {
  const u = new URL(url, 'http://snapshot.local');
  const segments = u.pathname.split('/').filter(s => s && s !== 'api').map(s => slug(decodeURIComponent(s)));
  const query = [...u.searchParams.entries()]
    .sort((a, b) => (a[0] === b[0] ? (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0) : a[0] < b[0] ? -1 : 1))
    .map(([k, v]) => `${slug(k)}-${slug(v)}`)
    .join('__');
  return `/data-snapshot/${segments.join('/')}/${query || 'all'}.json`;
}

const isJson = (res: Response) => (res.headers.get('content-type') ?? '').includes('json');

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  if (apiReachable !== false) {
    try {
      const res = await fetch(url, { signal });
      // A static host may answer an unknown path with index.html and a 200,
      // so only a JSON response counts as the API.
      if (res.ok && isJson(res)) {
        apiReachable = true;
        return res.json() as Promise<T>;
      }
      if (apiReachable === true) throw new Error(`${url} → ${res.status}`);
    } catch (err) {
      if (signal.aborted || apiReachable === true) throw err;
    }
    apiReachable = false;
  }
  const res = await fetch(snapshotPath(url), { signal });
  if (!res.ok || !isJson(res)) throw new Error(`${url} → no snapshot (${res.status})`);
  snapshotUsed = true;
  return res.json() as Promise<T>;
}

export function useLivePortfolio(timelineRange: TimelineRange): LiveData {
  const months = TIMELINE_MONTHS[timelineRange];
  const [data, setData] = useState<LiveData>({ status: 'loading', months });

  useEffect(() => {
    const ctrl = new AbortController();
    // Keep the previous period's figures on screen while the new ones load.
    setData(prev => ({ ...prev, status: prev.kpis ? prev.status : 'loading', months }));
    Promise.all([
      getJson<{ kpis: PortfolioKpis; concentration: Concentration }>(`/api/portfolio/summary?months=${months}`, ctrl.signal),
      getJson<SkuPerformance[]>(`/api/skus?months=${months}`, ctrl.signal),
      // Sparklines need a readable series even when the window is 1–6 months.
      getJson<MonthPoint[]>(`/api/portfolio/trend?months=${Math.max(months, 12)}`, ctrl.signal),
      getJson<SkuSegment[]>('/api/skus/segments', ctrl.signal),
      getJson<PortfolioSnapshot>('/api/portfolio/snapshot', ctrl.signal),
      getJson<Alert[]>(`/api/alerts?months=${months}`, ctrl.signal),
      getJson<ForecastAccuracy>(`/api/forecast/accuracy?months=${months}`, ctrl.signal),
      getJson<CustomerInsight[]>(`/api/customers?months=${months}`, ctrl.signal),
      // Fixed at 1 month regardless of the selected timeline — "last month",
      // not "the selected window's last month."
      getJson<PortfolioKpis>('/api/portfolio/kpis?months=1', ctrl.signal),
      getJson<Pnl>(`/api/profitability/pnl?months=${months}`, ctrl.signal),
      getJson<PnlByCategory[]>(`/api/profitability/pnl-by-category?months=${months}`, ctrl.signal),
      getJson<RationalizationScenario[]>('/api/rationalization/scenarios', ctrl.signal),
      getJson<CustomerCategoryInsight[]>(`/api/customers/by-category?months=${months}&top=5`, ctrl.signal),
      getJson<RegionMixRow[]>(`/api/regions/mix?months=${months}`, ctrl.signal),
      getJson<LiveLaunch[]>('/api/launches', ctrl.signal),
      getJson<LiveLaunchGate[]>('/api/launches/gates', ctrl.signal),
      getJson<LaunchSummary>('/api/launches/summary', ctrl.signal),
      getJson<LiveSignal[]>(`/api/signals?months=${months}`, ctrl.signal),
      getJson<AssortmentSummary>(`/api/assortment/summary?months=${months}`, ctrl.signal),
      getJson<LiveSkuRationale[]>(`/api/skus/rationale?months=${months}`, ctrl.signal),
    ])
      .then(([summary, skus, trend, skuSegments, portfolioSnapshot, alerts, forecastAccuracy, customerInsights, lastMonth, pnl, pnlByCategory, rationalizationScenarios, customerCategoryInsights, regionMix, launches, launchGates, launchSummary, signals, assortmentSummary, skuRationale]) => {
        setData({
          status: 'live',
          source: snapshotUsed ? 'snapshot' : 'api',
          months,
          kpis: summary.kpis,
          concentration: summary.concentration,
          skus,
          skuRevenueM: Object.fromEntries(skus.map(s => [s.sku_name, s.net_sales / 1e6])),
          trend,
          skuSegments,
          portfolioSnapshot,
          alerts,
          forecastAccuracy,
          customerInsights,
          lastMonthUnits: lastMonth.units_sold,
          lastMonthPeriod: { start: lastMonth.period_start, end: lastMonth.period_end },
          pnl,
          pnlByCategory,
          rationalizationScenarios,
          customerCategoryInsights,
          regionMix,
          launches,
          launchGates,
          launchSummary,
          signals,
          assortmentSummary,
          skuRationale,
        });
      })
      .catch(err => {
        if (ctrl.signal.aborted) return;
        console.warn('Live data unavailable — showing built-in figures:', err);
        setData({ status: 'offline', months });
      });
    return () => ctrl.abort();
  }, [months]);

  return data;
}

export interface LiveRegionFulfillment {
  status: 'loading' | 'live' | 'offline';
  months: number;
  rows?: RegionFulfillment[];
}

/**
 * Fetched lazily by the Top-Down Drilldown only (not part of the shared
 * LiveDataContext) — this data isn't needed anywhere else, so there's no
 * reason to fetch it on every page load.
 */
export function useLiveRegionalFulfillment(timelineRange: TimelineRange): LiveRegionFulfillment {
  const months = TIMELINE_MONTHS[timelineRange];
  const [data, setData] = useState<LiveRegionFulfillment>({ status: 'loading', months });

  useEffect(() => {
    const ctrl = new AbortController();
    setData(prev => ({ ...prev, status: prev.rows ? prev.status : 'loading', months }));
    getJson<RegionFulfillment[]>(`/api/regions/fulfillment?months=${months}`, ctrl.signal)
      .then(rows => setData({ status: 'live', months, rows }))
      .catch(err => {
        if (ctrl.signal.aborted) return;
        console.warn('Live regional fulfillment unavailable:', err);
        setData({ status: 'offline', months });
      });
    return () => ctrl.abort();
  }, [months]);

  return data;
}

export interface RegionTopSku {
  sku_name: string;
  net_sales: number;
}

/**
 * Top SKUs by real sales for one region (fn_region_sku_shortlist, TODO.md
 * O18) — replaces TopDownDrilldown's editorially curated REGION_SKUS list,
 * which a comment there said the schema couldn't supply. It can.
 * Fetched lazily, like useLiveRegionalFulfillment, since only one screen needs it.
 */
export function useLiveRegionTopSkus(region: string | null, timelineRange: TimelineRange) {
  const months = TIMELINE_MONTHS[timelineRange];
  const [data, setData] = useState<{ status: 'loading' | 'live' | 'offline'; rows?: RegionTopSku[] }>({ status: 'loading' });

  useEffect(() => {
    if (!region) return;
    const ctrl = new AbortController();
    setData(prev => ({ status: prev.rows ? prev.status : 'loading' }));
    getJson<RegionTopSku[]>(`/api/regions/${encodeURIComponent(region)}/top-skus?months=${months}`, ctrl.signal)
      .then(rows => setData({ status: 'live', rows }))
      .catch(err => {
        if (ctrl.signal.aborted) return;
        console.warn('Live region SKU shortlist unavailable:', err);
        setData({ status: 'offline' });
      });
    return () => ctrl.abort();
  }, [region, months]);

  return data;
}

/**
 * Category sales trend for the Signals Board momentum chart. Lazy: only that
 * chart needs it. Follows the shared timeline via the months passed in.
 */
export function useLiveCategoryTrend(months: number, grain: 'week' | 'month') {
  const [data, setData] = useState<{ status: 'loading' | 'live' | 'offline'; rows?: CategoryTrendPoint[] }>({ status: 'loading' });

  useEffect(() => {
    const ctrl = new AbortController();
    setData(prev => ({ ...prev, status: prev.rows ? prev.status : 'loading' }));
    getJson<CategoryTrendPoint[]>(`/api/categories/trend?months=${months}&grain=${grain}`, ctrl.signal)
      .then(rows => setData({ status: 'live', rows }))
      .catch(err => {
        if (ctrl.signal.aborted) return;
        console.warn('Live category trend unavailable:', err);
        setData({ status: 'offline' });
      });
    return () => ctrl.abort();
  }, [months, grain]);

  return data;
}

const LiveDataContext = createContext<LiveData>({ status: 'loading', months: 12 });

export const LiveDataProvider = LiveDataContext.Provider;

export function useLiveData(): LiveData {
  return useContext(LiveDataContext);
}

/** Small provenance pill: where the numbers on screen come from. */
export function LiveDataBadge({ live }: { live: LiveData }) {
  const cfg = {
    live: {
      dot: 'bg-emerald-500',
      text: 'Live · PostgreSQL',
      title: live.kpis
        ? `Figures from the warehouse, ${live.kpis.period_start} to ${live.kpis.period_end}` +
          (live.kpis.months_available < live.kpis.months_requested
            ? ` (only ${live.kpis.months_available} of ${live.kpis.months_requested} months exist in the data)`
            : '')
        : 'Figures from the warehouse',
    },
    loading: { dot: 'bg-amber-400 animate-pulse', text: 'Loading live data…', title: 'Contacting the API' },
    offline: {
      dot: 'bg-zinc-400',
      text: 'Offline · sample figures',
      title: 'The API is not reachable, so built-in sample figures are shown. Start it with: npm run api',
    },
    snapshot: {
      dot: 'bg-sky-500',
      text: `Snapshot · data to ${live.kpis?.period_end ?? '2025-12-31'}`,
      title: 'Figures computed by the SQL layer and frozen into this site — the same numbers as the live system, ' +
        'not a live feed.',
    },
  }[live.status === 'live' && live.source === 'snapshot' ? 'snapshot' : live.status];
  return (
    <span
      title={cfg.title}
      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-2 py-1 rounded-sm border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.text}
    </span>
  );
}
