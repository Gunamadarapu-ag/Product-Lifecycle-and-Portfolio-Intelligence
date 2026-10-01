/**
 * Overlay live warehouse values onto the KPI strip.
 *
 * Only the three cards the database can actually supply are replaced: Net Sales,
 * Avg Gross Margin and Revenue Concentration. The rest (PCI, long-tail burden,
 * rationalize candidates, stockout peak, tail risk) have no SQL function yet
 * and keep their built-in values — see documentation/formulas.md.
 */
import type { KPI } from '../types/dashboard';
import type { LiveData } from './liveData';

const MARGIN_BENCH = 0.40;

function pct(x: number, digits = 2) {
  return `${(x * 100).toFixed(digits)}%`;
}

export function applyLiveKpis(kpis: KPI[], live: LiveData): KPI[] {
  // Offline: the built-in figures stand, and the badge says so.
  if (live.status === 'offline') return kpis;

  const k = live.kpis;
  const c = live.concentration;

  return kpis.map(kpi => {
    if (kpi.label === 'Net Sales (Portfolio)') {
      if (!k) return { ...kpi, value: '…', trendValue: 'Loading' };
      const g = k.growth_pct;
      return {
        ...kpi,
        value: `$${(k.net_sales / 1e6).toFixed(1)}M`,
        trend: g === null ? 'neutral' : g >= 0 ? 'up' : 'down',
        trendValue: g === null
          ? 'No prior period in data'
          : `${g >= 0 ? '+' : ''}${(g * 100).toFixed(1)}% ${live.months === 12 ? 'YoY' : 'vs prior period'}`,
      };
    }
    if (kpi.label === 'Avg Gross Margin') {
      if (!k) return { ...kpi, value: '…', trendValue: 'Loading' };
      const diff = k.gross_margin_pct - MARGIN_BENCH;
      return {
        ...kpi,
        value: pct(k.gross_margin_pct),
        trend: diff >= 0 ? 'up' : 'down',
        trendValue: `${diff >= 0 ? '+' : ''}${(diff * 100).toFixed(2)}pp vs 40% bench`,
      };
    }
    if (kpi.label === 'Revenue Concentration') {
      if (!c) return { ...kpi, value: '…', trendValue: 'Loading' };
      return { ...kpi, value: pct(c.top10_share), trendValue: 'Top 10% SKUs' };
    }
    return kpi;
  });
}
