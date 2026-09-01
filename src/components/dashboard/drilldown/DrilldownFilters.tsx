/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import type { TimeHorizon } from '../../../types/dashboard';

interface DrilldownFiltersProps {
  timeHorizon: TimeHorizon;
  setTimeHorizon: (q: TimeHorizon) => void;
  selectedMetric: 'rev' | 'margin' | 'otif';
  setSelectedMetric: (m: 'rev' | 'margin' | 'otif') => void;
}

const getDateRangeLabel = (horizon: TimeHorizon) => {
  switch (horizon) {
    case '1M':  return 'May 09, 2026 – Jun 08, 2026 (30 Days)';
    case '3M':  return 'Mar 09, 2026 – Jun 08, 2026 (91 Days)';
    case '6M':  return 'Dec 09, 2025 – Jun 08, 2026 (182 Days)';
    case 'YTD': return 'Jan 01, 2026 – Jun 08, 2026 (159 Days)';
    case '12M': return 'Jun 09, 2025 – Jun 08, 2026 (365 Days)';
    case '2Y':  return 'Jun 09, 2024 – Jun 08, 2026 (730 Days)';
    case '3Y':  return 'Jun 09, 2023 – Jun 08, 2026 (1096 Days)';
    default:    return '';
  }
};

export const DrilldownFilters: React.FC<DrilldownFiltersProps> = ({
  timeHorizon,
  setTimeHorizon,
  selectedMetric,
  setSelectedMetric,
}) => {
  const horizons = ['1M', '3M', '6M', 'YTD', '12M', '2Y', '3Y'] as const;
  const activeIndex = horizons.indexOf(timeHorizon);
  const trackPct = (activeIndex / (horizons.length - 1)) * 100;

  // Ref used to measure click position on the rail
  const railRef = useRef<HTMLDivElement>(null);

  /** Snap a click on the rail to the nearest horizon */
  const handleRailClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!railRef.current) return;
    const rect = railRef.current.getBoundingClientRect();
    const clickPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    // Map percentage to nearest index
    const nearestIndex = Math.round(clickPct * (horizons.length - 1));
    setTimeHorizon(horizons[nearestIndex]);
  };

  const metrics = [
    { key: 'rev'    as const, label: 'Revenue',     sub: '$ Million',  icon: '💰' },
    { key: 'margin' as const, label: 'Margin',      sub: '% Gross',  icon: '📊' },
    { key: 'otif'   as const, label: 'Fulfillment', sub: 'OTIF %',   icon: '🚚' },
  ];

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded shadow-sm w-full overflow-hidden">

      {/* ── Section 1: Analysis Horizon Timeline ── */}
      <div className="px-5 pt-4 pb-3 border-b border-black/5 dark:border-white/5">

        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={11} className="text-acies-yellow" />
            <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-400">
              Analysis Horizon
            </span>
          </div>
          <span className="text-[8px] font-mono font-bold text-purple-500 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/15 tracking-wide">
            {getDateRangeLabel(timeHorizon)}
          </span>
        </div>

        {/* Timeline rail — entire area is clickable */}
        <div className="relative px-2 py-2">

          {/*
            Clickable rail wrapper.
            - ref lets us measure pixel width for position → index mapping.
            - cursor-pointer shows intent.
            - The invisible hit area (h-8, -my-3) extends the tap zone well
              above and below the 4px visual rail so it's easy to click.
          */}
          <div
            ref={railRef}
            onClick={handleRailClick}
            className="relative w-full cursor-pointer select-none"
            role="slider"
            aria-label="Analysis horizon slider"
            aria-valuemin={0}
            aria-valuemax={horizons.length - 1}
            aria-valuenow={activeIndex}
            aria-valuetext={timeHorizon}
          >
            {/* Expanded invisible hit-zone (sits behind the visual rail) */}
            <div className="absolute inset-x-0 -top-3 -bottom-3 z-0" />

            {/* Visual rail track */}
            <div className="relative w-full h-1 bg-black/8 dark:bg-white/8 rounded-full z-10">
              {/* Filled gradient segment */}
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-600 to-acies-yellow transition-all duration-500 ease-out"
                style={{ width: `${trackPct}%` }}
              />
              {/* Glowing active dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-acies-yellow border-2 border-white dark:border-zinc-900 shadow-[0_0_8px_rgba(245,158,11,0.75)] transition-all duration-500 ease-out z-20"
                style={{ left: `${trackPct}%` }}
              />
            </div>
          </div>

          {/* Tick labels — each also clickable individually */}
          <div className="flex justify-between mt-3">
            {horizons.map((h, i) => {
              const isActive = h === timeHorizon;
              const isPast   = i <= activeIndex;
              return (
                <button
                  key={h}
                  onClick={() => setTimeHorizon(h)}
                  className="flex flex-col items-center gap-0.5 group cursor-pointer bg-transparent border-none outline-none p-0"
                >
                  <div className={`w-1 h-1 rounded-full mb-0.5 transition-all duration-300 ${isPast ? 'bg-acies-yellow' : 'bg-black/15 dark:bg-white/15'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'text-acies-yellow scale-110'
                      : isPast
                        ? 'text-purple-500 dark:text-purple-400'
                        : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                  }`}>
                    {h}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Section 2: KPI Focus Selector (vertical list) ── */}
      <div className="px-5 pt-3 pb-4">
        <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 dark:text-zinc-400 block mb-2">
          Focus KPI
        </span>
        <div className="flex flex-col gap-1.5">
          {metrics.map(({ key, label, sub, icon }) => {
            const isActive = selectedMetric === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded border transition-all duration-200 cursor-pointer outline-none relative overflow-hidden text-left ${
                  isActive
                    ? 'bg-acies-yellow/[0.07] border-acies-yellow/60 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                    : 'bg-zinc-50 dark:bg-white/[0.03] border-black/6 dark:border-white/8 hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:border-black/12 dark:hover:border-white/14'
                }`}
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l transition-all duration-200 ${
                  isActive ? 'bg-acies-yellow' : 'bg-transparent'
                }`} />

                {/* Icon */}
                <span className="text-base leading-none shrink-0 ml-1">{icon}</span>

                {/* Label + unit */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-black uppercase tracking-wider leading-none ${
                    isActive ? 'text-acies-yellow' : 'text-zinc-700 dark:text-zinc-200'
                  }`}>
                    {label}
                  </p>
                  <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 leading-tight mt-0.5 uppercase tracking-wider">
                    {sub}
                  </p>
                </div>

                {/* Active glow dot */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-acies-yellow shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.95)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
