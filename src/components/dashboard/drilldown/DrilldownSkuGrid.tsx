/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Layers, TrendingUp, TrendingDown, Clock, ShieldAlert, ChevronRight } from 'lucide-react';
import { SKUS as GLOBAL_SKUS } from '../../../constants/data';
import { TimelineRange, getFilteredSKUS } from '../../../utils/timeframe';
import { useLiveData } from '../../../api/liveData';

interface DrilldownSkuGridProps {
  activeRegionSkus: string[];
  selectedSkuName: string;
  onSkuSelect: (name: string) => void;
  selectedRegionName: string;
  timelineRange: TimelineRange;
}

export const DrilldownSkuGrid: React.FC<DrilldownSkuGridProps> = ({
  activeRegionSkus,
  selectedSkuName,
  onSkuSelect,
  selectedRegionName,
  timelineRange,
}) => {
  const SKUS = useMemo(() => getFilteredSKUS(GLOBAL_SKUS, timelineRange), [timelineRange]);
  const { skuRevenueM } = useLiveData();
  const revOf = (sku: { name: string; rev: number }): number => skuRevenueM?.[sku.name] ?? sku.rev;
  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded shadow-sm space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
        <Layers size={14} className="text-acies-yellow" />
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-display">
            Regional SKU Assortment Explorer
          </h3>
          <p className="text-[8px] text-zinc-400 uppercase tracking-widest mt-0.5">
            Active products launched in {selectedRegionName} (Click to inspect detailed diagnostics)
          </p>
        </div>
      </div>

      {/* Grid of SKU Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeRegionSkus.map(name => {
          const item = SKUS.find(s => s.name === name) || SKUS[0];
          const isSelected = selectedSkuName === name;
          const isUp = item.growth >= 0;

          // Border & Glow styling based on growth/selected states
          let cardBorderClass = 'border-black/5 dark:border-white/10';
          let glowClass = '';

          if (isSelected) {
            cardBorderClass = 'border-acies-yellow ring-1 ring-acies-yellow';
            glowClass = 'shadow-[0_0_12px_rgba(245,158,11,0.15)] scale-[1.01]';
          } else {
            if (isUp) {
              // Positive growth: subtle purple/violet border matching the accent system
              cardBorderClass = 'border-purple-500/20 dark:border-purple-500/25';
              glowClass = 'shadow-[0_0_6px_rgba(139,92,246,0.05)]';
            } else {
              // Negative growth: subtle red warning border
              cardBorderClass = 'border-red-500/20 dark:border-red-500/25';
              glowClass = 'shadow-[0_0_6px_rgba(239,68,68,0.05)]';
            }
          }

          // Category Badge Colors
          const getCategoryBadgeClass = (cat: string) => {
            switch (cat) {
              case 'Beverages': 
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
              case 'Snacks': 
                return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
              case 'Personal Care': 
                return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
              case 'Dairy': 
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
              case 'Household': 
                return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
              default: 
                return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
            }
          };

          return (
            <button
              key={name}
              onClick={() => onSkuSelect(name)}
              className={`p-4 rounded text-left cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-44 outline-none bg-zinc-50 dark:bg-white/5 hover:border-acies-yellow/55 hover:scale-[1.01] hover:shadow-sm ${cardBorderClass} ${glowClass}`}
            >
              {/* Card Header: Category & Growth Badge */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded border tracking-wider ${getCategoryBadgeClass(item.cat)}`}>
                  {item.cat}
                </span>
                
                <div className={`flex items-center gap-1 text-[8.5px] font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <span>{isUp ? '+' : ''}{Math.round(item.growth * 100)}%</span>
                </div>
              </div>

              {/* SKU Name & Status warning indicator */}
              <div className="my-2.5 flex items-start gap-1.5 justify-between">
                <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 tracking-wide line-clamp-2 uppercase font-body">
                  {name}
                </h4>
                {!isUp && (
                  <span className="text-[6.5px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/15 text-red-500 border border-red-500/20 shrink-0 tracking-widest flex items-center gap-0.5 animate-pulse">
                    ⚠️ Risk
                  </span>
                )}
              </div>

              {/* Margin Efficiency Bar */}
              <div className="space-y-1.5 w-full pb-2">
                <div className="flex justify-between text-[7px] font-bold uppercase tracking-wider text-zinc-400">
                  <span>Margin Efficiency</span>
                  <span className="text-zinc-800 dark:text-zinc-300 font-mono font-black">{item.margin}%</span>
                </div>
                <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.margin >= 35 ? 'bg-emerald-500' : item.margin >= 25 ? 'bg-acies-yellow' : 'bg-red-500'}`} 
                    style={{ width: `${item.margin}%` }} 
                  />
                </div>
              </div>

              {/* Card Footer: Metric Strip */}
              <div className="border-t border-black/5 dark:border-white/10 pt-2 flex items-center justify-between w-full text-[8.5px]">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-bold uppercase">
                  <span>Rev:</span>
                  <span className="font-extrabold text-zinc-800 dark:text-white font-mono">${revOf(item).toLocaleString('en-US', { maximumFractionDigits: 1 })} M</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-zinc-400" title="Sourcing Lead Time">
                    <Clock size={9} />
                    <span className="font-semibold text-zinc-600 dark:text-zinc-300 font-mono">{item.lead}d</span>
                  </div>
                  {item.stockouts > 2 && (
                    <div className="flex items-center gap-0.5 text-red-500" title="Critical Stockout Events">
                      <ShieldAlert size={9} className="animate-pulse" />
                      <span className="font-black font-mono">{item.stockouts}</span>
                    </div>
                  )}
                  <ChevronRight size={10} className={`text-zinc-400 transition-transform ${isSelected ? 'translate-x-0.5 text-acies-yellow font-bold' : ''}`} />
                </div>
              </div>

              {/* Decorative left accent edge line if selected */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-acies-yellow" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

