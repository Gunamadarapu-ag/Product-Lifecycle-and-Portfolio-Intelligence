/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SR_CLASSES } from './SKURationalization';

interface SegmentFiltersProps {
  groups: Record<string, any[]>;
  selectedAiClass: string | null;
  setSelectedAiClass: (cls: string | null) => void;
}

export const SegmentFilters: React.FC<SegmentFiltersProps> = ({
  groups,
  selectedAiClass,
  setSelectedAiClass
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 py-0.5 w-full">
        <div className="flex items-center gap-2 border-l-4 border-[#8b5cf6] pl-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6] dark:text-purple-300">
            ① Portfolio Segment Filters
          </h3>
          <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest ml-2 hidden sm:inline">
            Click cards to filter charts below
          </span>
        </div>
        {selectedAiClass && (
          <button
            onClick={() => setSelectedAiClass(null)}
            className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-[#8b5cf6] dark:text-purple-300 text-[8px] font-bold uppercase tracking-widest rounded border border-purple-500/20 transition-all cursor-pointer outline-none"
          >
            ✕ Clear Filter ({SR_CLASSES[selectedAiClass]?.label})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(SR_CLASSES).map(([key, cfg]) => {
          const list = groups[key] || [];
          const isSelected = selectedAiClass === key;
          return (
            <button 
              key={key} 
              onClick={() => setSelectedAiClass(isSelected ? null : key)}
              className={`text-left bg-white dark:bg-[#1a1a24] border p-4 rounded transition-all hover:translate-y-[-1px] shadow-sm flex flex-col justify-between min-h-[115px] cursor-pointer outline-none relative overflow-hidden group ${
                isSelected 
                  ? 'ring-2 ring-acies-yellow ring-offset-2 dark:ring-offset-[#121214] scale-[1.01] border-transparent' 
                  : 'border-black/5 dark:border-white/10 hover:border-black/15 dark:hover:border-white/15'
              }`}
              style={{ borderColor: isSelected ? undefined : cfg.border }}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-acies-yellow" />
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base shrink-0">{cfg.icon}</span>
                  <div>
                    <h4 className="text-[11px] font-bold" style={{ color: cfg.color }}>{cfg.label}</h4>
                    <p className="text-[7.5px] text-zinc-400 leading-tight font-medium" style={{ contentVisibility: 'auto' }}>{cfg.desc}</p>
                  </div>
                </div>
                <div className="text-2xl font-black mb-3" style={{ color: cfg.color }}>
                  {list.length} <span className="text-xs font-bold opacity-50">SKUs</span>
                </div>
              </div>
              
              <div className="border-t border-black/5 dark:border-white/5 pt-2 text-[8px] font-medium text-zinc-500 dark:text-zinc-500 tracking-wide leading-relaxed truncate w-full">
                {list.slice(0, 2).map(s => s.name.split(' ').slice(0, 2).join(' ')).join(' · ')}
                {list.length > 2 && <span className="opacity-55 font-semibold">{` +${list.length - 2} items`}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
