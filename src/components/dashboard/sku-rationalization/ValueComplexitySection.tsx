/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Sparkles } from 'lucide-react';
import { srClassify, SR_CLASSES } from './SKURationalization';

interface ValueComplexitySectionProps {
  groupedBarData: any[];
  rankedPriorities: any[];
  selectedAiClass: string | null;
  setSelectedSkuName: (name: string) => void;
  setSimTab: (tab: 'remove' | 'price' | 'launch') => void;
  setSelectedSkuDetails: (sku: any) => void;
  isDarkMode: boolean;
  gridStroke: string;
  tickColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

export const ValueComplexitySection: React.FC<ValueComplexitySectionProps> = ({
  groupedBarData,
  rankedPriorities,
  selectedAiClass,
  setSelectedSkuName,
  setSimTab,
  setSelectedSkuDetails,
  isDarkMode,
  gridStroke,
  tickColor,
  tooltipBg,
  tooltipBorder,
  tooltipText
}) => {
  return (
    <div className="space-y-3" id="quadrant-matrix-section" style={{ scrollMarginTop: '100px' }}>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horizontal Grouped Bar Chart */}
        <div id="complexity-matrix-section" style={{ scrollMarginTop: '100px' }} className="lg:col-span-2 glass-card bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 p-5 shadow-sm rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-acies-gray dark:text-white">Commercial Value & Complexity Segment Analysis</h4>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider mt-0.5">Horizontal Grouped Bars · Comparison of segment averages</p>
            </div>
            {/* Custom Legend */}
            <div className="flex items-center gap-4 text-[9px] font-extrabold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <span className="w-2.5 h-2 rounded-sm bg-[#12b886]" /> Commercial value
              </span>
              <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <span className="w-2.5 h-2 rounded-sm bg-[#c5c2b5] dark:bg-zinc-400" /> Complexity score
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={groupedBarData}
                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                barGap={3}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} vertical={true} />
                <XAxis 
                  type="number" 
                  domain={[0.0, 1.0]} 
                  ticks={[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
                  tick={{ fill: tickColor, fontSize: 8 }} 
                  axisLine={{ stroke: gridStroke }}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: tickColor, fontSize: 8, fontWeight: 'bold' }} 
                  width={75}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, fontSize: '9px' }}
                  itemStyle={{ fontSize: 10 }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  formatter={(value: any, name: any) => [value.toFixed(2), name]}
                />
                <Bar 
                  dataKey="Commercial value" 
                  fill="#12b886" 
                  radius={[0, 4, 4, 0]} 
                  barSize={12} 
                />
                <Bar 
                  dataKey="Complexity score" 
                  fill={isDarkMode ? '#a1a1aa' : '#c5c2b5'} 
                  radius={[0, 4, 4, 0]} 
                  barSize={12} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pruning list */}
        <div className="glass-card bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 p-5 shadow-sm rounded-xl flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-acies-gray dark:text-white">Discontinuation & Reposition priorities</h4>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider mt-0.5">Automated queue ranked by AI complexity margin drag</p>
            </div>

            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] max-h-56 overflow-y-auto pr-1">
              {rankedPriorities.map((sku, i) => {
                const cls = srClassify(sku);
                const cfg = SR_CLASSES[cls];
                const isHighlighted = selectedAiClass ? cls === selectedAiClass : true;
                return (
                  <div 
                    key={sku.name} 
                    className={`flex items-center gap-3 py-2 text-[10.5px] transition-opacity cursor-pointer ${
                      isHighlighted ? 'opacity-100' : 'opacity-20'
                    }`}
                    onClick={() => {
                      setSelectedSkuName(sku.name);
                      setSimTab('remove');
                    }}
                  >
                    <div className="w-5 h-5 rounded text-[8px] font-black flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-acies-gray dark:text-white truncate font-bold text-[10px]">{sku.name}</div>
                      <div className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">
                        Complexity {sku.cx.toFixed(2)} · Value {sku.val.toFixed(2)} · ${sku.rev}M
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-widest" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSkuDetails(sku);
                        }}
                        className="w-5 h-5 rounded hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-[#8b5cf6] transition-all cursor-pointer border-none bg-transparent outline-none shrink-0"
                        title="Open SKU Intelligence Card"
                      >
                        <Sparkles size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-black/5 dark:border-white/5 text-center">
            <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold">
              Click any item to load in simulator below
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
