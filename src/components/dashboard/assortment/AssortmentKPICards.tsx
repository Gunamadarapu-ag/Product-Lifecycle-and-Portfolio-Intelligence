import React, { useState } from 'react';
import { Zap, Info, FileSearch } from 'lucide-react';
import { Role } from '../../../types/dashboard';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';

interface AssortmentKPICardsProps {
  role: Role;
  onAuditClick?: (metricName: string) => void;
  customValues?: {
    density: string;
    burden: string;
    yieldVal: string;
    cannibalization: string;
  };
}

interface AssortmentKPI {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  info: string;
  isRisk?: boolean;
  target: string;
  color: string;
  hist: number[];
  soWhat: string;
  action: string;
}

export const AssortmentKPICards: React.FC<AssortmentKPICardsProps> = ({ role, onAuditClick, customValues }) => {
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);
  const [showTooltipIdx, setShowTooltipIdx] = useState<number | null>(null);

  const kpis: AssortmentKPI[] = [
    {
      label: 'Assortment Density',
      value: customValues?.density || '100 SKUs',
      trend: 'up',
      trendValue: 'Max in Italy (100)',
      info: 'Count of active items listed in country-channel catalogs.',
      target: '80 SKUs',
      color: '#8b5cf6', // purple
      hist: [105, 104, 103, 100, 100, 100, 100, 100],
      soWhat: 'Catalog breadth is at 100 active items, causing operational friction in warehouse layouts.',
      action: 'Prune the bottom 20% to free up logistics capacity and focus on hero lines.'
    },
    {
      label: 'Long-Tail Burden Ratio',
      value: customValues?.burden || '68.0%',
      trend: 'up',
      isRisk: true,
      trendValue: '68 SKUs <1% rev',
      info: 'Percentage of SKUs contributing less than 1% of revenue but occupying shelf space.',
      target: '< 40.0%',
      color: '#ef4444', // red
      hist: [62, 63, 64, 65, 65, 66, 68.0, 68.0],
      soWhat: '68 items contribute negligible revenue but eat up 100% of vendor management cycles.',
      action: 'Transition low-value suppliers to category clusters or consolidate variants.'
    },
    {
      label: 'Assortment Gross Yield',
      value: customValues?.yieldVal || '$3.02 M',
      trend: 'down',
      trendValue: '-1.1% vs target',
      info: 'Average gross profit contribution generated per active listing.',
      target: '$3.50 M',
      color: '#3b82f6', // blue
      hist: [3.20, 3.15, 3.12, 3.08, 3.05, 3.03, 3.02, 3.02],
      soWhat: 'Average SKU yield is dragged down by 12 margin-dilutive high-volume lines.',
      action: 'Implement dead-net price floors and reduce trade promo dependencies.'
    },
    {
      label: 'Cannibalization Risk Index',
      value: customValues?.cannibalization || '0.62',
      trend: 'up',
      isRisk: true,
      trendValue: 'High in Beverages',
      info: 'Average negative sales correlation between product variants in the same category.',
      target: '< 0.30',
      color: '#ef4444', // red
      hist: [0.55, 0.57, 0.58, 0.60, 0.61, 0.62, 0.62, 0.62],
      soWhat: 'Beverage variants (such as Mango Fizz) heavily cannibalize each other during promo periods.',
      action: 'Synchronize promo calendars and bundle competing lines to capture incremental sales.'
    }
  ];

  const getTrendColor = (kpi: AssortmentKPI) => {
    if (kpi.trend === 'neutral') return 'text-zinc-500 dark:text-zinc-400';
    if (kpi.trend === 'up') return kpi.isRisk ? 'text-red-500' : 'text-emerald-500';
    return kpi.isRisk ? 'text-emerald-500' : 'text-red-500';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {kpis.map((kpi, idx) => {
        const deltaText = `${kpi.trend === 'up' ? '▲' : kpi.trend === 'down' ? '▼' : '•'} ${kpi.trendValue}`;
        const isHovered = hoveredCardIdx === idx;
        const isHighlighted = role === 'VP Product Management';

        return (
          <div
            key={kpi.label}
            onClick={() => onAuditClick && onAuditClick(kpi.label)}
            onMouseEnter={() => setHoveredCardIdx(idx)}
            onMouseLeave={() => setHoveredCardIdx(null)}
            className={`glass-card bg-white dark:bg-white/5 border p-3 rounded-sm shadow-sm flex flex-col justify-between h-[115px] group cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all relative select-none ${
              isHighlighted
                ? 'border-acies-yellow/80 bg-white/90 dark:bg-white/10'
                : 'border-black/10 dark:border-white/10'
            }`}
          >
            {isHighlighted && (
              <div className="absolute top-[1.5px] left-[1.5px] right-[1.5px] h-[2px] rounded-t-sm bg-acies-yellow animate-pulse" />
            )}

            <div className="flex justify-between items-start mb-0.5">
              <div className="min-w-0 pr-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 truncate flex items-center gap-1">
                  {kpi.label}
                  {isHighlighted && <Zap size={8} className="text-acies-yellow fill-acies-yellow shrink-0" />}
                </p>
                <h3 className="text-xl font-display font-extrabold text-zinc-900 dark:text-zinc-200 mt-0.5">
                  {kpi.value}
                </h3>
              </div>
              
              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-[8px] uppercase font-bold text-zinc-400">Target</span>
                  <div
                    className="relative shrink-0 z-40"
                    onMouseEnter={() => setShowTooltipIdx(idx)}
                    onMouseLeave={() => setShowTooltipIdx(null)}
                  >
                    <Info size={9} className="opacity-35 hover:opacity-100 transition-opacity cursor-help" />
                    {showTooltipIdx === idx && (
                      <div className="absolute right-0 top-4 w-56 bg-acies-gray text-white text-[9px] p-2.5 shadow-2xl border border-white/10 z-50 leading-relaxed pointer-events-none rounded-sm font-sans normal-case text-left">
                        <p className="opacity-70 mb-1.5">{kpi.info}</p>
                        <div className="space-y-1 border-t border-white/10 pt-1.5">
                          <div>
                            <span className="text-red-400 font-bold uppercase tracking-wider block text-[6.5px]">So What?</span>
                            <p className="opacity-95">{kpi.soWhat}</p>
                          </div>
                          <div>
                            <span className="text-green-400 font-bold uppercase tracking-wider block text-[6.5px]">Action Plan</span>
                            <p className="opacity-95 text-acies-yellow">{kpi.action}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] font-bold font-mono text-zinc-600 dark:text-zinc-400 leading-none mt-0.5">
                  {kpi.target}
                </p>
              </div>
            </div>

            {/* Sparkline chart */}
            <div className="h-[22px] my-1 opacity-85 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.hist.map((val, i) => ({ i, val }))} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <YAxis domain={['auto', 'auto']} hide />
                  <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke={kpi.color} 
                    fill={`${kpi.color}15`} 
                    strokeWidth={1.5} 
                    dot={false} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5 flex justify-between items-center">
              <span className={getTrendColor(kpi)}>{deltaText}</span>
              <span 
                className={`flex items-center gap-1 text-[7px] font-bold uppercase tracking-widest text-acies-yellow transition-opacity duration-200 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <FileSearch size={8} />
                Audit Trace
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
