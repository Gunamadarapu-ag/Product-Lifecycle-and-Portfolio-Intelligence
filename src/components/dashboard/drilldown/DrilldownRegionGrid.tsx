/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Globe } from 'lucide-react';
import type { TimeHorizon } from '../../../types/dashboard';
import type { TimelineRange } from '../../../utils/timeframe';
import { REGIONS_CONFIG, REGION_ORDER } from '../../../constants/regions';
import { useLiveRegionalFulfillment, RegionFulfillment } from '../../../api/liveData';

interface DrilldownRegionGridProps {
  selectedRegion: string | null;
  onRegionSelect: (region: string) => void;
  selectedMetric: 'rev' | 'margin' | 'otif';
  timeHorizon: TimeHorizon;
  timelineRange: TimelineRange;
  isDarkMode: boolean;
}

interface RegionCard {
  revM: number; marginPct: number; fulfillmentPct: number; avgLeadDays: number;
  revGrowth: number | null; marginChange: number | null; fulfillmentChange: number | null;
  revSharePct: number;
}

// Used only when the API is unreachable — approximate, static, not
// time-horizon-varying (unlike the old per-horizon fabricated matrix this
// replaced). Derived from data/generator/config.py's revenue_share_target:
// Southern = Italy(0.290)+Spain(0.226), Western = Germany(0.187)+France(0.090)
// +Netherlands(0.026), Central = Austria(0.091)+Poland(0.090), of $473M.
const OFFLINE_FALLBACK: Record<string, RegionCard> = {
  'Southern Europe': { revM: 244, marginPct: 37.5, fulfillmentPct: 89.1, avgLeadDays: 13.4, revGrowth: null, marginChange: null, fulfillmentChange: null, revSharePct: 51.6 },
  'Western Europe':  { revM: 143, marginPct: 38.5, fulfillmentPct: 92.4, avgLeadDays: 12.7, revGrowth: null, marginChange: null, fulfillmentChange: null, revSharePct: 30.3 },
  'Central Europe':  { revM: 86,  marginPct: 39.5, fulfillmentPct: 92.9, avgLeadDays: 12.4, revGrowth: null, marginChange: null, fulfillmentChange: null, revSharePct: 18.1 },
};

function aggregateByRegion(rows: RegionFulfillment[]): Record<string, RegionCard> {
  const totalNs = rows.reduce((s, r) => s + r.net_sales, 0) || 1;
  const out: Record<string, RegionCard> = {};
  for (const key of REGION_ORDER) {
    const regionRows = rows.filter(r => r.region === key);
    const ns = regionRows.reduce((s, r) => s + r.net_sales, 0);
    const gm = regionRows.reduce((s, r) => s + r.gross_margin_pct * r.net_sales, 0);
    const priorNs = regionRows.every(r => r.prior_net_sales != null)
      ? regionRows.reduce((s, r) => s + (r.prior_net_sales ?? 0), 0) : null;
    const priorGm = priorNs
      ? regionRows.reduce((s, r) => s + (r.prior_gross_margin_pct ?? 0) * (r.prior_net_sales ?? 0), 0) / priorNs
      : null;
    const txn = regionRows.reduce((s, r) => s + r.transactions, 0);
    const stockouts = regionRows.reduce((s, r) => s + r.stockout_events, 0);
    const priorTxn = regionRows.every(r => r.prior_fulfillment_pct != null) ? txn : null; // proxy: same-shape rows
    const fulfillmentPct = txn > 0 ? 1 - stockouts / txn : 0;
    const priorFulfillmentPct = priorTxn && regionRows.length
      ? regionRows.reduce((s, r) => s + (r.prior_fulfillment_pct ?? 0) * r.transactions, 0) / txn
      : null;
    const avgLeadDays = regionRows.length
      ? regionRows.reduce((s, r) => s + r.avg_lead_time_days, 0) / regionRows.length : 0;

    out[key] = {
      revM: ns / 1e6,
      marginPct: ns > 0 ? (gm / ns) * 100 : 0,
      fulfillmentPct: fulfillmentPct * 100,
      avgLeadDays,
      revGrowth: priorNs ? (ns / priorNs - 1) * 100 : null,
      marginChange: priorGm != null ? (gm / ns - priorGm) * 100 : null,
      fulfillmentChange: priorFulfillmentPct != null ? (fulfillmentPct - priorFulfillmentPct) * 100 : null,
      revSharePct: (ns / totalNs) * 100,
    };
  }
  return out;
}

export const DrilldownRegionGrid: React.FC<DrilldownRegionGridProps> = ({
  selectedRegion,
  onRegionSelect,
  selectedMetric,
  timelineRange,
}) => {
  const live = useLiveRegionalFulfillment(timelineRange);
  const cards = live.status === 'live' && live.rows ? aggregateByRegion(live.rows) : OFFLINE_FALLBACK;

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded shadow-sm space-y-3 w-full">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Globe size={13} className="text-acies-yellow" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Regional Performance
            </h3>
            <p className="text-[8px] text-zinc-400 uppercase tracking-widest mt-0.5">
              Click a card to select region and inspect SKUs
            </p>
          </div>
        </div>
        <span className="text-[7.5px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
          {live.status === 'live' ? 'Live · PostgreSQL' : live.status === 'loading' ? 'Loading…' : 'Offline · sample figures'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REGION_ORDER.map(key => {
          const config = REGIONS_CONFIG[key];
          const card = cards[key];
          const isSelected = selectedRegion === key;

          const activeValue = selectedMetric === 'rev' ? card.revM
            : selectedMetric === 'margin' ? card.marginPct
            : card.fulfillmentPct;
          const activeTrend = selectedMetric === 'rev' ? card.revGrowth
            : selectedMetric === 'margin' ? card.marginChange
            : card.fulfillmentChange;
          const unit = selectedMetric === 'rev' ? '$ M' : '%';
          // Margin/fulfillment are already 0-100 scale; revenue uses its
          // share of the 3 regions shown, so the three bars sum to ~100%.
          const barPct = selectedMetric === 'rev' ? card.revSharePct : Math.min(100, activeValue);

          return (
            <button
              key={key}
              onClick={() => onRegionSelect(key)}
              className={`text-left bg-zinc-50 dark:bg-white/5 border p-3.5 rounded shadow-sm transition-all hover:translate-y-[-1px] cursor-pointer flex flex-col justify-between h-28 relative overflow-hidden group outline-none ${
                isSelected
                  ? 'border-acies-yellow ring-1 ring-acies-yellow/30'
                  : 'border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/15'
              }`}
            >
              {isSelected && <div className="absolute top-0 left-0 w-full h-0.5 bg-acies-yellow" />}

              <div className="w-full">
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] font-display font-extrabold text-zinc-900 dark:text-white leading-tight group-hover:text-acies-yellow transition-colors">
                    {config.name}
                  </span>
                  {activeTrend != null ? (
                    <span className={`text-[8px] font-mono font-bold leading-none shrink-0 ${activeTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {activeTrend >= 0 ? '▲' : '▼'}{Math.abs(activeTrend).toFixed(1)}{selectedMetric === 'rev' ? '%' : 'pp'} vs prior
                    </span>
                  ) : (
                    <span className="text-[8px] font-mono font-bold leading-none text-zinc-400 shrink-0">no prior period</span>
                  )}
                </div>
                <p className="text-[7.5px] uppercase font-bold tracking-wider text-zinc-400 leading-none mt-1">
                  {config.manager} · {config.role}
                </p>
                <div className="flex items-baseline gap-1 mt-2.5">
                  <span className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-none">
                    {activeValue.toFixed(selectedMetric === 'rev' ? 0 : 1)}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-500">{unit}</span>
                  {selectedMetric === 'otif' && (
                    <span className="text-[7px] text-zinc-400 uppercase tracking-wider ml-1">
                      avg lead {card.avgLeadDays.toFixed(1)} d
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full space-y-1 mt-2">
                <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isSelected ? 'bg-acies-yellow' : 'bg-zinc-400 dark:bg-zinc-600'}`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[7px] text-zinc-400 uppercase tracking-widest font-semibold leading-none">
                  <span>Revenue Share</span>
                  <span>{card.revSharePct.toFixed(1)}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
