/**
 * Portfolio health by lifecycle stage, with the scoring that drives it.
 *
 * Extracted from PortfolioHealthMap.tsx (2,663 lines).
 */
import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// SKUS[].rev totals $10,608M against real net sales of $473M (TODO.md O1) — a
// ~22.43x inflation. The Introduction-stage cutoff was authored against the old
// scale; when real per-SKU revenue is available, the cutoff is divided by the
// same factor so it selects the same relative slice of the portfolio.
const REV_SCALE_FACTOR = 10608 / 473;
const INTRO_REV_THRESHOLD_M = 100;
const INTRO_REV_THRESHOLD_REAL_M = INTRO_REV_THRESHOLD_M / REV_SCALE_FACTOR;

export const getLifecycleStage = (growth: number, margin: number, rev: number, isLiveRev = false) => {
  if (growth < 0) return 'Decline';
  const introThreshold = isLiveRev ? INTRO_REV_THRESHOLD_REAL_M : INTRO_REV_THRESHOLD_M;
  if (growth >= 0.15 && rev < introThreshold) return 'Introduction';
  if (growth >= 0.10) return 'Growth';
  return 'Margin';
};

// Calculate Portfolio Health Score dynamically

/**
 * @param revenueM  Real net sales in $M by SKU name, from the warehouse
 *   (useLiveData().skuRevenueM). When given, every revenue figure below —
 *   including the Introduction-stage cutoff in getLifecycleStage — comes
 *   from it, with thresholds rescaled to match (TODO.md O1).
 */
export const calculatePortfolioHealth = (skusList: any[], revenueM?: Record<string, number>) => {
  const revOf = (s: any): number => revenueM?.[s.name] ?? s.rev;
  if (skusList.length === 0) {
    return { 
      score: 0, 
      intro: 0, 
      growth: 0, 
      margin: 0, 
      decline: 0, 
      introRev: 0,
      growthRev: 0,
      marginRev: 0,
      declineRev: 0,
      totalRev: 0,
      list: { intro: [], growth: [], margin: [], decline: [] } 
    };
  }
  
  let introCount = 0;
  let growthCount = 0;
  let marginCount = 0;
  let declineCount = 0;
  
  let introRev = 0;
  let growthRev = 0;
  let marginRev = 0;
  let declineRev = 0;
  
  const introSKUs: string[] = [];
  const growthSKUs: string[] = [];
  const marginSKUs: string[] = [];
  const declineSKUs: string[] = [];
  
  let totalMargin = 0;
  let totalStockouts = 0;
  let totalComplexity = 0;
  
  const isLiveRev = !!revenueM;
  skusList.forEach(s => {
    const stage = getLifecycleStage(s.growth, s.margin, revOf(s), isLiveRev);
    if (stage === 'Introduction') {
      introCount++;
      introSKUs.push(s.name);
      introRev += revOf(s);
    } else if (stage === 'Growth') {
      growthCount++;
      growthSKUs.push(s.name);
      growthRev += revOf(s);
    } else if (stage === 'Margin') {
      marginCount++;
      marginSKUs.push(s.name);
      marginRev += revOf(s);
    } else {
      declineCount++;
      declineSKUs.push(s.name);
      declineRev += revOf(s);
    }
    totalMargin += s.margin;
    totalStockouts += s.stockouts;
    totalComplexity += s.cx;
  });
  
  const avgMargin = totalMargin / skusList.length;
  const avgComplexity = totalComplexity / skusList.length;
  
  // Complexity penalty (0 to 1 score)
  const pciScore = (avgComplexity * 0.8 + (avgMargin >= 35 ? 0.2 : 0.4)) / 1.2;
  const complexityPenalty = pciScore * 25;
  
  // Stockouts penalty
  const avgStockouts = totalStockouts / skusList.length;
  const stockoutPenalty = Math.min(15, avgStockouts * 3);
  
  const positiveTrendPct = ((introCount + growthCount + marginCount) / skusList.length) * 100;
  const marginFactor = Math.min(100, (avgMargin / 40) * 100);
  
  const score = Math.round(
    positiveTrendPct * 0.45 + 
    marginFactor * 0.35 + 
    (100 - complexityPenalty) * 0.10 + 
    (100 - stockoutPenalty) * 0.10
  );
  
  const finalScore = Math.max(0, Math.min(100, score));
  const totalRev = skusList.reduce((sum, s) => sum + revOf(s), 0) || 1;
  
  return {
    score: finalScore,
    intro: introCount,
    growth: growthCount,
    margin: marginCount,
    decline: declineCount,
    introRev,
    growthRev,
    marginRev,
    declineRev,
    totalRev,
    list: {
      intro: introSKUs,
      growth: growthSKUs,
      margin: marginSKUs,
      decline: declineSKUs
    }
  };
};

export interface LifecycleHealthPanelProps {
  skusList: any[];
  /** Real net sales in $M by SKU name; omit to fall back to the built-in figures. */
  skuRevenueM?: Record<string, number>;
  isDarkMode: boolean;
  onSelectSku?: (sku: any) => void;
  onAuditClick?: (metric: string) => void;
}

export const LifecycleHealthPanel: React.FC<LifecycleHealthPanelProps> = ({ skusList, skuRevenueM, isDarkMode, onSelectSku, onAuditClick }) => {
  const data = calculatePortfolioHealth(skusList, skuRevenueM);
  
  // Circular progress ring setup
  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.score / 100) * circumference;
  
  // Health level attributes
  let ratingLabel = 'ELEVATED RISK';
  let ratingColorClass = 'bg-red-500/10 text-red-500 border-red-500/20';
  let ratingStroke = '#ef4444';
  let insightText = '';
  
  if (data.score >= 85) {
    ratingLabel = 'OPTIMAL / ON-TRACK';
    ratingColorClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    ratingStroke = '#10b981';
    insightText = 'Portfolio health is optimal. Excellent balance of high-margin cash cows and growing products.';
  } else if (data.score >= 70) {
    ratingLabel = 'STABLE / ON-TRACK';
    ratingColorClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    ratingStroke = '#f59e0b';
    insightText = `${data.decline} Decline products (${Math.round((data.decline / skusList.length) * 100)}%) are dragging the health score. Consider sunsetting candidates.`;
  } else {
    ratingLabel = 'CRITICAL DRAG';
    ratingColorClass = 'bg-red-500/10 text-red-500 border-red-500/20';
    ratingStroke = '#ef4444';
    insightText = 'Critical complexity and declining volumes. Immediate SKU rationalization is highly recommended.';
  }

  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const totalCount = skusList.length || 1;
  const totalRevVal = data.totalRev || 1;
  const stages = [
    { key: 'intro', label: 'Introduction', count: data.intro, pct: Math.round((data.intro / totalCount) * 100), revAmount: data.introRev, revPct: Math.round((data.introRev / totalRevVal) * 100), color: '#8b5cf6', list: data.list.intro, desc: 'New launches and pipeline concepts' },
    { key: 'growth', label: 'Growth', count: data.growth, pct: Math.round((data.growth / totalCount) * 100), revAmount: data.growthRev, revPct: Math.round((data.growthRev / totalRevVal) * 100), color: '#10b981', list: data.list.growth, desc: 'High growth and expanding volume' },
    { key: 'margin', label: 'Maturity', count: data.margin, pct: Math.round((data.margin / totalCount) * 100), revAmount: data.marginRev, revPct: Math.round((data.marginRev / totalRevVal) * 100), color: '#f59e0b', list: data.list.margin, desc: 'Mature cash cows with solid margins' },
    { key: 'decline', label: 'Decline', count: data.decline, pct: Math.round((data.decline / totalCount) * 100), revAmount: data.declineRev, revPct: Math.round((data.declineRev / totalRevVal) * 100), color: '#ef4444', list: data.list.decline, desc: 'Dwindling volumes and low margins' },
  ];

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* LEFT COLUMN: GAUGE & HEALTH */}
      <div className="lg:col-span-4 flex flex-col items-center justify-center gap-4 border-r border-black/5 dark:border-white/5 pr-4 h-full py-2">
        <div 
          onClick={() => onAuditClick?.('Portfolio Health Score')}
          className="relative flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 group"
          title="Click to audit Portfolio Health Score"
        >
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r={radius} stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth={strokeWidth} fill="transparent" />
            <circle 
              cx="64" 
              cy="64" 
              r={radius} 
              stroke={ratingStroke} 
              strokeWidth={strokeWidth} 
              fill="transparent" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-display font-extrabold text-acies-gray dark:text-white leading-none">{data.score}%</span>
            <span className="text-[8px] text-zinc-400 font-extrabold tracking-wider leading-none mt-1">HEALTH</span>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Portfolio Health Score</span>
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-sm border ${ratingColorClass}`}>
              {ratingLabel}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium px-2">
            {insightText}
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: TIMELINE JOURNEY AND SUMMARY CARDS */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex justify-between items-center pb-1 border-b border-black/5 dark:border-white/5">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa] border-l-2 border-[#6d28d9] dark:border-[#a78bfa] pl-2 block">Product Lifecycle Journey Timeline</span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 uppercase">
            Active Portfolio View
          </span>
        </div>

        {/* Horizontal Journey Timeline */}
        <div className="relative w-full py-4 mb-4 select-none">
          {/* Thin connector line behind nodes */}
          <div className="absolute top-[48px] left-[12.5%] right-[12.5%] h-[2px] bg-zinc-200 dark:bg-zinc-800 z-0"></div>

          {/* Timeline nodes */}
          <div className="relative z-10 flex justify-between items-start w-full">
            {stages.map((stage) => {
              const borderCol = 
                stage.key === 'intro' ? 'border-purple-500' :
                stage.key === 'growth' ? 'border-teal-500' :
                stage.key === 'margin' ? 'border-amber-500' : 'border-red-500';

              const textCol = 
                stage.key === 'intro' ? 'text-purple-600 dark:text-purple-400' :
                stage.key === 'growth' ? 'text-teal-600 dark:text-teal-400' :
                stage.key === 'margin' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
              
              const isEfficient = stage.revPct >= stage.pct;
              const isHoveredOrActive = hoveredStage === stage.key;

              return (
                <div 
                  key={stage.key} 
                  className="flex flex-col items-center text-center w-1/4 group select-none relative"
                  onMouseEnter={() => setHoveredStage(stage.key)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  {/* Circular Badge showing SKU Share % */}
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-display font-extrabold text-xs border-[5px] bg-white dark:bg-zinc-900 shadow-md transition-all duration-300 group-hover:scale-110 cursor-pointer ${borderCol} ${textCol}`}
                    title={`${stage.label} stage SKU share: ${stage.pct}%`}
                  >
                    <span className="text-zinc-800 dark:text-white font-mono">{stage.pct}%</span>
                  </div>

                  {/* Stage Name */}
                  <span className={`text-[10px] font-extrabold tracking-wide mt-2 text-zinc-800 dark:text-zinc-200 group-hover:${textCol} transition-colors`}>
                    {stage.label}
                  </span>

                  {/* Absolute SKU Count */}
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {stage.count} SKUs
                  </span>

                  {/* Absolute Revenue Value */}
                  <span className="text-[9px] font-extrabold text-zinc-700 dark:text-zinc-300 font-mono mt-0.5">
                    ${stage.revAmount.toLocaleString('en-IN', { maximumFractionDigits: 1 })} M
                  </span>

                  {/* Efficiency arrow */}
                  <div className="flex items-center gap-0.5 mt-0.5 text-[8px] font-bold">
                    {isEfficient ? (
                      <span className="text-emerald-500 flex items-center gap-0.5" title="Revenue share is higher than SKU share (Efficient)">
                        <TrendingUp size={9} />
                        <span>▲ Efficient</span>
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-0.5" title="SKU share is higher than revenue share (Underperforming)">
                        <TrendingDown size={9} />
                        <span>▼ Underperforming</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Share comparison */}
                  <span className="text-[7px] text-zinc-400 dark:text-zinc-700 font-mono mt-0.5">
                    ({stage.revPct}% Rev vs {stage.pct}% SKU)
                  </span>

                  {/* Micro SKU list popover on hover */}
                  {isHoveredOrActive && stage.list.length > 0 && (
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-2 rounded-sm shadow-xl z-30 space-y-1.5 max-h-48 w-44 overflow-y-auto no-scrollbar"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-[7.5px] font-bold uppercase tracking-widest text-zinc-400 mb-1 leading-none">{stage.label} SKUs ({stage.count})</p>
                      <div className="flex flex-wrap gap-1">
                        {stage.list.map(name => (
                          <button 
                            key={name}
                            onClick={(e) => {
                              e.stopPropagation();
                              const skuObject = skusList.find(s => s.name === name);
                              if (skuObject && onSelectSku) {
                                onSelectSku(skuObject);
                              }
                            }}
                            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-1 py-0.5 rounded-sm text-[7.5px] font-medium text-acies-gray dark:text-zinc-200 hover:bg-[#8b5cf6]/10 hover:border-[#8b5cf6]/30 cursor-pointer transition-all outline-none"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-black/5 dark:border-white/5">
          {/* Total SKUs */}
          <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
            <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
              Total SKUs
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-display font-extrabold text-zinc-800 dark:text-white">
                {totalCount}
              </span>
              <span className="text-[8px] text-zinc-500 uppercase font-bold">Items</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
            <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
              Total Revenue
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-display font-extrabold text-zinc-800 dark:text-white font-mono">
                ${totalRevVal.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
              </span>
              <span className="text-[8px] text-zinc-500 uppercase font-bold">M</span>
            </div>
          </div>

          {/* Most Efficient Stage */}
          {(() => {
            let mostEfficient = stages[0];
            let maxRatio = 0;
            stages.forEach(st => {
              const ratio = st.count > 0 ? st.revAmount / st.count : 0;
              if (ratio > maxRatio) {
                maxRatio = ratio;
                mostEfficient = st;
              }
            });
            const textCol = 
              mostEfficient.key === 'intro' ? 'text-purple-700 dark:text-purple-400' :
              mostEfficient.key === 'growth' ? 'text-teal-700 dark:text-teal-400' :
              mostEfficient.key === 'margin' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400';
            return (
              <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
                <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                  Most Efficient Stage
                </span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className={`text-[11px] font-display font-extrabold ${textCol} truncate max-w-[55px]`}>
                    {mostEfficient.label}
                  </span>
                  <span className="text-[8px] font-mono text-emerald-500 font-bold">
                    Ratio: {maxRatio.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Least Efficient Stage */}
          {(() => {
            let leastEfficient = stages[0];
            let minRatio = Infinity;
            stages.forEach(st => {
              const ratio = st.count > 0 ? st.revAmount / st.count : 0;
              if (ratio < minRatio) {
                minRatio = ratio;
                leastEfficient = st;
              }
            });
            const textCol = 
              leastEfficient.key === 'intro' ? 'text-purple-700 dark:text-purple-400' :
              leastEfficient.key === 'growth' ? 'text-teal-700 dark:text-teal-400' :
              leastEfficient.key === 'margin' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400';
            return (
              <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
                <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                  Least Efficient Stage
                </span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className={`text-[11px] font-display font-extrabold ${textCol} truncate max-w-[55px]`}>
                    {leastEfficient.label}
                  </span>
                  <span className="text-[8px] font-mono text-red-500 font-bold">
                    Ratio: {minRatio.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
