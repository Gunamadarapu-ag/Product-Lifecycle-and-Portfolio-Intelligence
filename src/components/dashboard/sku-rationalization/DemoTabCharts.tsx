/**
 * Charts for the SKU drill-down.
 *
 * Extracted from DemoTab.tsx (1,233 lines).
 */
import React from 'react';

export const MarginWaterfallChart: React.FC = () => {
  return (
    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm">
      <h5 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-4">Margin Bridge (% of Revenue)</h5>
      <div className="relative w-full h-[180px] font-semibold text-[8px] sm:text-[9px] text-zinc-400">
        {/* Draw a grid of horizontal helper lines: 0%, 5%, 10%, 15%, 20%, 22% */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-zinc-500">
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
        </div>
        
        {/* Draw the columns */}
        <div className="absolute inset-0 flex justify-between px-2 pt-2">
          {/* Column 1: Target margin (0% to 20%) */}
          <div className="flex flex-col items-center justify-end h-full w-[15%]">
            <div className="w-full bg-zinc-500 dark:bg-zinc-600 rounded-t-xs h-[90%] flex items-center justify-center text-white font-bold text-[9px]">20.0%</div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-500">Target Margin</span>
          </div>

          {/* Column 2: Material cost inflation (-2.0%, from 20% down to 18%) */}
          <div className="flex flex-col items-center justify-end h-full w-[18%]">
            <div className="w-full h-full relative">
              {/* Floating bar: 18% to 20% (height is 9% of total, offset from top is 10%) */}
              <div className="absolute w-full bg-red-500 rounded-xs flex items-center justify-center text-white font-bold text-[8.5px]" style={{ bottom: '81%', height: '9%' }}>
                -2.0%
              </div>
            </div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-500">Material Cost</span>
          </div>

          {/* Column 3: Promotional dilution (-2.4%, from 18% down to 15.6%) */}
          <div className="flex flex-col items-center justify-end h-full w-[18%]">
            <div className="w-full h-full relative">
              {/* Floating bar: 15.6% to 18% (height is 10.8% of total, offset from top is 19%) */}
              <div className="absolute w-full bg-red-500 rounded-xs flex items-center justify-center text-white font-bold text-[8.5px]" style={{ bottom: '70.2%', height: '10.8%' }}>
                -2.4%
              </div>
            </div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-500">Promo Dilution</span>
          </div>

          {/* Column 4: Manufacturing overhead (-1.0%, from 15.6% down to 14.6%) */}
          <div className="flex flex-col items-center justify-end h-full w-[18%]">
            <div className="w-full h-full relative">
              {/* Floating bar: 14.6% to 15.6% (height is 4.5% of total, offset from top is 29.8%) */}
              <div className="absolute w-full bg-red-500 rounded-xs flex items-center justify-center text-white font-bold text-[8.5px]" style={{ bottom: '65.7%', height: '4.5%' }}>
                -1.0%
              </div>
            </div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-500">Mfg Overhead</span>
          </div>

          {/* Column 5: Actual margin (0% to 14.6%) */}
          <div className="flex flex-col items-center justify-end h-full w-[15%]">
            <div className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-xs h-[65.7%] flex items-center justify-center text-white font-bold text-[9px]">14.6%</div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-500">Actual Margin</span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 border-t border-black/5 dark:border-white/5 pt-2 text-[8px] font-black uppercase tracking-wider text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-zinc-500 dark:bg-zinc-600 rounded-xs" />
          <span>Baseline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-xs" />
          <span>Margin Loss</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs" />
          <span>Result</span>
        </div>
      </div>
    </div>
  );
};

export const SkuCategoryBenchmarks: React.FC<{ skuName: string, category: string }> = ({ skuName, category }) => {
  return (
    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm space-y-4 text-left">
      <h5 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 leading-tight">
        {skuName} vs. {category.toLowerCase()} category
      </h5>
      
      <div className="space-y-4">
        {/* Metric 1: Material cost inflation */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-[10.5px]">
            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Material cost inflation</span>
            <span className="font-mono font-black text-red-500">+14.5% YoY</span>
          </div>
          {/* Progress bar track */}
          <div className="relative h-2 w-full bg-black/15 dark:bg-white/10 rounded-full overflow-visible">
            <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full" style={{ width: '72.5%' }} />
            <div className="absolute top-[-4px] h-4 w-[2px] bg-white border border-black/40 dark:border-white/60" style={{ left: '49%' }} />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase">
            <span>this SKU: 14.5%</span>
            <span>category avg: 9.8%</span>
          </div>
        </div>

        {/* Metric 2: Promotional lift ratio */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-[10.5px]">
            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Promotional lift ratio</span>
            <span className="font-mono font-black text-red-500">1.12x (rank 21/24)</span>
          </div>
          {/* Progress bar track */}
          <div className="relative h-2 w-full bg-black/15 dark:bg-white/10 rounded-full overflow-visible">
            <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full" style={{ width: '15%' }} />
            <div className="absolute top-[-4px] h-4 w-[2px] bg-white border border-black/40 dark:border-white/60" style={{ left: '50%' }} />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase">
            <span>this SKU: 1.12x</span>
            <span>category median: 1.70x</span>
          </div>
        </div>

        {/* Metric 3: Manufacturing overhead per unit */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-[10.5px]">
            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Manufacturing overhead per unit</span>
            <span className="font-mono font-black text-amber-500">+8.2%</span>
          </div>
          {/* Progress bar track */}
          <div className="relative h-2 w-full bg-black/15 dark:bg-white/10 rounded-full overflow-visible">
            <div className="absolute top-0 left-0 h-full bg-amber-500 rounded-full" style={{ width: '68%' }} />
            <div className="absolute top-[-4px] h-4 w-[2px] bg-white border border-black/40 dark:border-white/60" style={{ left: '58%' }} />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase">
            <span>this SKU: 8.2%</span>
            <span>category avg: 7.0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
