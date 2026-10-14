/**
 * Overlay live warehouse values onto the KPI strip.
 *
 * Since 7 Oct (TODO.md O18): Net Sales, Avg Gross Margin and Revenue
 * Concentration are windowed/live; Rationalize Candidates, Long-Tail SKU
 * Burden, Revenue Tail Risk, Avg Complexity and Peak Stockout Freq. now read
 * fn_sku_segments — a snapshot (see its comment in 03_derive_metrics.sql),
 * so these five don't move with the timeline selector the way the first
 * three do. This pool is shared across tabs 2/4/6/8, so fixing a card here
 * fixes it everywhere it appears. Portfolio PCI has no card in this shared
 * pool (it's reachable via Ctrl-K search only) — see auditLiveContent.ts.
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
      const top10 = c ? pct(c.top10_share, 1) : null;
      return {
        ...kpi,
        value: `$${(k.net_sales / 1e6).toFixed(1)}M`,
        trend: g === null ? 'neutral' : g >= 0 ? 'up' : 'down',
        trendValue: g === null
          ? 'No prior period in data'
          : `${g >= 0 ? '+' : ''}${(g * 100).toFixed(1)}% ${live.months === 12 ? 'YoY' : 'vs prior period'}`,
        tooltip: {
          soWhat: `$${(k.net_sales / 1e6).toFixed(1)}M net sales over ${k.period_start} to ${k.period_end}` +
            (g === null ? ', with no full prior window to compare against.' : `, ${g >= 0 ? 'up' : 'down'} ${(Math.abs(g) * 100).toFixed(1)}% on the prior window.`) +
            (top10 ? ` The top 10% of SKUs carry ${top10} of it.` : ''),
          action: 'Open the audit drawer for the per-category split; growth outside the top decile is where volume can still be added.',
        },
      };
    }
    if (kpi.label === 'Avg Gross Margin') {
      if (!k) return { ...kpi, value: '…', trendValue: 'Loading' };
      const diff = k.gross_margin_pct - MARGIN_BENCH;
      const below = live.skus?.filter(s => s.gross_margin_pct < MARGIN_BENCH).length;
      return {
        ...kpi,
        value: pct(k.gross_margin_pct),
        trend: diff >= 0 ? 'up' : 'down',
        trendValue: `${diff >= 0 ? '+' : ''}${(diff * 100).toFixed(2)}pp vs 40% bench`,
        tooltip: {
          soWhat: `Gross margin is ${pct(k.gross_margin_pct)}, ${Math.abs(diff * 100).toFixed(2)}pp ${diff >= 0 ? 'above' : 'below'} the 40% benchmark` +
            (below !== undefined ? `; ${below} SKUs sit under 40% in this window.` : '.'),
          action: 'Review price and pack architecture on the sub-40% SKUs with the largest revenue first.',
        },
      };
    }
    if (kpi.label === 'Revenue Concentration') {
      if (!c) return { ...kpi, value: '…', trendValue: 'Loading' };
      return {
        ...kpi, value: pct(c.top10_share), trendValue: 'Top 10% SKUs',
        tooltip: {
          soWhat: `The top 10% of SKUs generate ${pct(c.top10_share)} of net sales in this window — a supply failure on any of them moves the headline.`,
          action: 'Prioritise safety stock and supplier redundancy for the top-decile SKUs.',
        },
      };
    }

    const seg = live.skuSegments;
    if (!seg) return kpi; // offline, or segments still loading — keep the built-in value

    // Snapshot cards: one value over the full history, so there is no target
    // in the data and no history to draw — a flat line says exactly that.
    const snap = (value: number, rest: Partial<KPI>): KPI =>
      ({ ...kpi, target: '—', hist: Array(8).fill(value), ...rest });
    const rationalize = seg.filter(s => s.portfolio_segment === 'Rationalize');

    if (kpi.label === 'Rationalize Candidates') {
      const n = rationalize.length;
      return snap(n, {
        value: String(n), trend: 'down', trendValue: `of ${seg.length} SKUs (snapshot)`,
        tooltip: {
          soWhat: `${n} of ${seg.length} SKUs fall in the Rationalize segment: below-median commercial value and above-median operational complexity.`,
          action: 'Start with the Rationalize SKUs that also carry a supplier end-of-life notice — they need a decision anyway.',
        },
      });
    }
    if (kpi.label === 'Long-Tail SKU Burden') {
      const n = seg.filter(s => s.low_velocity_flag === 1).length;
      return snap(100 * n / seg.length, {
        value: pct(n / seg.length, 1), trendValue: `${n} SKUs <1% revenue (snapshot)`,
        tooltip: {
          soWhat: `${n} SKUs (${pct(n / seg.length, 1)} of the range) each contribute under 1% of revenue but still carry their own supply, listing and planning overhead.`,
          action: 'Check which long-tail SKUs share suppliers with core SKUs; those are the cheapest to consolidate.',
        },
      });
    }
    if (kpi.label === 'Revenue Tail Risk') {
      const risk = rationalize.reduce((sum, s) => sum + s.revenue_share_pct, 0);
      return snap(100 * risk, {
        value: pct(risk, 1), trendValue: 'If Rationalize segment removed (snapshot)',
        tooltip: {
          soWhat: `Removing all ${rationalize.length} Rationalize SKUs at once puts ${pct(risk, 1)} of revenue at risk, assuming no customer switches to a remaining SKU.`,
          action: 'Phase removals and measure demand transfer on a pilot region before sunsetting the rest.',
        },
      });
    }
    if (kpi.label === 'Avg Complexity') {
      const avg = seg.reduce((sum, s) => sum + s.operational_complexity_score, 0) / seg.length;
      const avgR = rationalize.length
        ? rationalize.reduce((sum, s) => sum + s.operational_complexity_score, 0) / rationalize.length : null;
      return snap(avg, {
        value: avg.toFixed(2), trendValue: `0–1 scale, ${seg.length} SKUs (snapshot)`,
        tooltip: {
          soWhat: `Average operational complexity is ${avg.toFixed(2)} on a 0–1 scale` +
            (avgR !== null ? `; the Rationalize segment averages ${avgR.toFixed(2)}.` : '.'),
          action: 'Lead time and supplier count are the main inputs — see the audit drawer for the per-SKU drivers.',
        },
      });
    }
    if (kpi.label === 'Peak Stockout Freq.') {
      const top = [...seg].sort((a, b) => b.total_stockouts - a.total_stockouts)[0];
      return snap(top.total_stockouts, {
        value: String(top.total_stockouts), trendValue: `${top.sku_name} (snapshot)`,
        tooltip: {
          soWhat: `${top.sku_name} has the most stockout events of any SKU (${top.total_stockouts}) over the full history.`,
          action: `Check ${top.sku_name}'s lead time and safety stock before its next replenishment cycle.`,
        },
      });
    }
    return kpi;
  });
}
