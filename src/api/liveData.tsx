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

export interface LiveData {
  status: 'loading' | 'live' | 'offline';
  months: number;
  kpis?: PortfolioKpis;
  concentration?: Concentration;
  skus?: SkuPerformance[];
  /** Net sales in $M keyed by SKU name — the join key shared with constants/data.ts SKUS. */
  skuRevenueM?: Record<string, number>;
  trend?: MonthPoint[];
}

export const TIMELINE_MONTHS: Record<TimelineRange, number> = {
  '1m': 1, '3m': 3, '6m': 6, '12m': 12, '24m': 24, '36m': 36,
};

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
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
    ])
      .then(([summary, skus, trend]) => {
        setData({
          status: 'live',
          months,
          kpis: summary.kpis,
          concentration: summary.concentration,
          skus,
          skuRevenueM: Object.fromEntries(skus.map(s => [s.sku_name, s.net_sales / 1e6])),
          trend,
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
  }[live.status];
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
