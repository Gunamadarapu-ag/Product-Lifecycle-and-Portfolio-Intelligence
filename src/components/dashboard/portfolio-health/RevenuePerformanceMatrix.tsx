/**
 * Revenue against performance matrix for the portfolio.
 *
 * Extracted from PortfolioHealthMap.tsx (2,663 lines).
 */
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, LabelList, Cell, ReferenceLine } from 'recharts';
import { getChartTheme } from '../../../utils/chartTheme';

export interface RevPerfSku {
  name: string;
  cat: string;
  rev: number;
  margin: number;
  growth: number;
  performance: number;
  quadrant: 'high_performer' | 'underperformer' | 'hidden_growth' | 'attention';
  rec: string;
}

export interface RevenuePerformanceMatrixProps {
  skusList: any[];
  isDarkMode: boolean;
  onSelectSku?: (sku: any) => void;
  addToast?: (title: string, body: string, color: string) => void;
  onScheduleMeeting?: (title: string, type: string) => void;
}

export const getRevPerfData = (skusList: any[]): RevPerfSku[] => {
  return skusList.map(s => {
    const perf = Math.round(s.margin * 1.5 + s.growth * 100);
    const performance = Math.min(100, Math.max(0, perf));
    const revenue = s.rev;
    let quadrant: 'high_performer' | 'underperformer' | 'hidden_growth' | 'attention' = 'attention';
    let rec = '';

    if (revenue >= 75 && performance >= 50) {
      quadrant = 'high_performer';
      rec = `Core driver of portfolio revenue. Protect shelf placement, maintain marketing support, and ensure stock availability.`;
    } else if (revenue >= 75 && performance < 50) {
      quadrant = 'underperformer';
      rec = `Generates high revenue ($${revenue} M) but has low performance score (${performance}%). Review pricing and optimize margin metrics.`;
    } else if (revenue < 75 && performance >= 50) {
      quadrant = 'hidden_growth';
      rec = `High-margin and strong growth with low volume. Expand distribution channels, increase marketing, and scale production.`;
    } else {
      quadrant = 'attention';
      rec = `Lagging in both revenue and performance. Candidate for consolidation, supply chain optimization, or sunsetting.`;
    }

    return {
      name: s.name,
      cat: s.cat,
      rev: s.rev,
      margin: s.margin,
      growth: s.growth,
      performance,
      quadrant,
      rec
    };
  });
};

export const RevenuePerformanceMatrix: React.FC<RevenuePerformanceMatrixProps> = ({ skusList, isDarkMode, onSelectSku, addToast, onScheduleMeeting }) => {
  const [activeQuad, setActiveQuad] = useState<'high_performer' | 'underperformer' | 'hidden_growth' | 'attention'>('high_performer');
  const [viewMode, setViewMode] = useState<'quadrant' | 'category'>('quadrant');
  const [activeCat, setActiveCat] = useState<string>('Beverages');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const oppData = getRevPerfData(skusList);
  
  const chartData = categoryFilter === 'all' 
    ? oppData 
    : oppData.filter(x => x.cat === categoryFilter);

  const filteredOppData = (viewMode === 'quadrant'
    ? oppData.filter(x => x.quadrant === activeQuad)
    : oppData.filter(x => x.cat === activeCat)
  ).filter(x => categoryFilter === 'all' || x.cat === categoryFilter);

  useEffect(() => {
    if (categoryFilter !== 'all') {
      setActiveCat(categoryFilter);
    }
  }, [categoryFilter]);
  
  const accentColor = isDarkMode ? '#a78bfa' : '#6d28d9';
  const { gridStroke, tickColor } = getChartTheme(isDarkMode);

  const categoryColors: Record<string, string> = {
    'Beverages': '#7C3AED',
    'Snacks': '#10b981',
    'Personal Care': '#185FA5',
    'Dairy': '#854F0B',
    'Household': '#ED93B1',
    'Beauty': '#EC4899',
    'Fashion': '#F97316'
  };

  const counts = {
    high_performer: oppData.filter(x => x.quadrant === 'high_performer' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    underperformer: oppData.filter(x => x.quadrant === 'underperformer' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    hidden_growth: oppData.filter(x => x.quadrant === 'hidden_growth' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    attention: oppData.filter(x => x.quadrant === 'attention' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
  };

  const catCounts = {
    'Beverages': oppData.filter(x => x.cat === 'Beverages').length,
    'Snacks': oppData.filter(x => x.cat === 'Snacks').length,
    'Personal Care': oppData.filter(x => x.cat === 'Personal Care').length,
    'Dairy': oppData.filter(x => x.cat === 'Dairy').length,
    'Household': oppData.filter(x => x.cat === 'Household').length,
  };

  const handleAuthorizeStrategy = (skuName: string, quadrant: string) => {
    if (addToast) {
      let title = "Strategy Authorized";
      let msg = `Directives logged successfully for ${skuName}.`;
      let color = "#10b981";

      if (quadrant === 'high_performer') {
        title = "Defensive Strategy Active";
        msg = `Shelf allocation protection and distribution guardrails locked in for ${skuName}.`;
        color = "#10b981";
      } else if (quadrant === 'underperformer') {
        title = "Margin Stabilization Active";
        msg = `Authorized price adjustment and discount reduction study for ${skuName}.`;
        color = "#f59e0b";
      } else if (quadrant === 'hidden_growth') {
        title = "Scale Strategy Active";
        msg = `Approved marketing expansion budget and multi-channel rollout plan for ${skuName}.`;
        color = "#8b5cf6";
      } else if (quadrant === 'attention') {
        title = "Pruning Directives Active";
        msg = `Authorized supply chain audit and sunset feasibility assessment for ${skuName}.`;
        color = "#ef4444";
      }

      addToast(title, msg, color);
    }
  };

  const getBubbleColor = (quad: string) => {
    switch (quad) {
      case 'high_performer': return '#10b981';
      case 'hidden_growth': return '#8b5cf6';
      case 'underperformer': return '#f59e0b';
      case 'attention': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-950 border border-black/15 dark:border-zinc-800/80 p-3 rounded-md shadow-lg text-[10px] space-y-1">
          <p className="font-extrabold text-zinc-900 dark:text-zinc-50">{data.name}</p>
          <p className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[8px]">{data.cat}</p>
          <div className="border-t border-black/5 dark:border-white/5 pt-1 mt-1 space-y-0.5 font-medium">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Revenue:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">${data.rev} M</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Performance:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{data.performance}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Gross Margin:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{data.margin}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-black/5 dark:border-white/5 mb-3 gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Revenue vs. Performance Matrix</span>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 text-zinc-800 dark:text-zinc-200 rounded-sm text-[8.5px] font-extrabold uppercase tracking-widest px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="Beverages">Beverages</option>
            <option value="Snacks">Snacks</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Dairy">Dairy</option>
            <option value="Household">Household</option>
            <option value="Beauty">Beauty</option>
            <option value="Fashion">Fashion</option>
          </select>

          <span className="text-[8px] font-bold uppercase tracking-wider text-[#8b5cf6] bg-[#8b5cf6]/10 px-2 py-0.5 rounded-full animate-pulse">
            Portfolio Segmentation Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SCATTER MAP */}
        <div className="lg:col-span-7 space-y-2 relative">
          {viewMode === 'category' && (
            <div className="flex flex-wrap items-center justify-center gap-4 py-2 px-3 text-[8.5px] font-bold uppercase tracking-widest bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm mb-3">
              {Object.entries(categoryColors).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5 animate-fadeIn">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-zinc-700 dark:text-zinc-400">{cat}</span>
                </div>
              ))}
            </div>
          )}

          <div className="h-80 relative">
            {viewMode === 'quadrant' && (
              <>
                <div className="absolute top-6 left-16 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-purple-500/80 bg-purple-500/5 px-2 py-0.5 border border-purple-500/10 rounded-sm">
                  Hidden Growth (Top-Left)
                </div>
                <div className="absolute top-6 right-6 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded-sm">
                  High Performers (Top-Right)
                </div>
                <div className="absolute top-[200px] left-16 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-red-500/80 bg-red-500/5 px-2 py-0.5 border border-red-500/10 rounded-sm">
                  Attention Required (Bottom-Left)
                </div>
                <div className="absolute top-[200px] right-6 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-amber-500/80 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded-sm">
                  Underperformers (Bottom-Right)
                </div>
              </>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <ReferenceLine x={75} stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeDasharray="5 5" />
                <ReferenceLine y={50} stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeDasharray="5 5" />
                <XAxis 
                  type="number" 
                  dataKey="rev" 
                  name="Revenue" 
                  domain={[0, 160]} 
                  tick={{ fill: tickColor, fontSize: 9 }} 
                  label={{ value: 'Revenue ($ M) →', position: 'bottom', fill: tickColor, fontSize: 10, offset: 10 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="performance" 
                  name="Performance" 
                  domain={[0, 100]} 
                  tick={{ fill: tickColor, fontSize: 9 }} 
                  label={{ value: 'Performance Score (%)', angle: -90, position: 'left', fill: tickColor, fontSize: 10, offset: 15 }} 
                />
                <ZAxis type="number" dataKey="margin" range={[100, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={<CustomTooltip />}
                />
                <Scatter data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={viewMode === 'category' ? (categoryColors[entry.cat] || '#6b7280') : getBubbleColor(entry.quadrant)} 
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={() => {
                        const originalSku = skusList.find(s => s.name === entry.name);
                        if (originalSku && onSelectSku) {
                          onSelectSku(originalSku);
                        }
                      }}
                    />
                  ))}
                  <LabelList 
                    dataKey="name" 
                    position="top" 
                    style={{ fill: 'rgba(156, 163, 175, 0.65)', fontSize: 7, pointerEvents: 'none', fontWeight: 'bold' }} 
                    formatter={(val: string) => {
                      const highlights = ['Herbal Shampoo', 'Oat Cookies', 'Laundry Pods Premium', 'Mango Fizz 500ml', 'Choco Wafers'];
                      return highlights.includes(val) ? val : '';
                    }}
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR LIST */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex border-b border-black/10 dark:border-white/10 p-0.5 bg-black/5 dark:bg-white/5 rounded-sm">
            {viewMode === 'quadrant' ? (
              [
                { id: 'high_performer', label: 'High Perf.', count: counts.high_performer, color: '#10b981' },
                { id: 'underperformer', label: 'Underperf.', count: counts.underperformer, color: '#f59e0b' },
                { id: 'hidden_growth', label: 'Hidden Gr.', count: counts.hidden_growth, color: '#8b5cf6' },
                { id: 'attention', label: 'Attention', count: counts.attention, color: '#ef4444' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveQuad(t.id as any)}
                  className={`flex-1 py-1.5 text-[8px] font-extrabold uppercase tracking-wider text-center rounded-sm transition-all cursor-pointer border-none flex items-center justify-center gap-0.5 ${
                    activeQuad === t.id
                      ? 'bg-white dark:bg-zinc-800 shadow-sm font-black text-acies-gray dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 bg-transparent'
                  }`}
                  style={{ borderTop: activeQuad === t.id ? `2px solid ${t.color}` : 'none' }}
                >
                  <span>{t.label}</span>
                  <span className="text-[7px] opacity-60 px-1 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
                    {t.count}
                  </span>
                </button>
              ))
            ) : (
              [
                { id: 'Beverages', label: 'Bev.', count: catCounts['Beverages'], color: '#7C3AED' },
                { id: 'Snacks', label: 'Snack', count: catCounts['Snacks'], color: '#10b981' },
                { id: 'Personal Care', label: 'Pers.', count: catCounts['Personal Care'], color: '#185FA5' },
                { id: 'Dairy', label: 'Dairy', count: catCounts['Dairy'], color: '#854F0B' },
                { id: 'Household', label: 'House.', count: catCounts['Household'], color: '#ED93B1' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveCat(t.id);
                    setCategoryFilter(t.id);
                  }}
                  className={`flex-1 py-1.5 text-[8px] font-extrabold uppercase tracking-wider text-center rounded-sm transition-all cursor-pointer border-none flex items-center justify-center gap-0.5 ${
                    activeCat === t.id
                      ? 'bg-white dark:bg-zinc-800 shadow-sm font-black text-acies-gray dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 bg-transparent'
                  }`}
                  style={{ borderTop: activeCat === t.id ? `2px solid ${t.color}` : 'none' }}
                >
                  <span>{t.label}</span>
                  <span className="text-[7px] opacity-60 px-1 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
                    {t.count}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="space-y-2.5 max-h-[265px] overflow-y-auto pr-1 no-scrollbar animate-fadeIn">
            {filteredOppData.map(item => (
              <div 
                key={item.name}
                className="p-3 border border-black/10 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all flex flex-col gap-2 relative group animate-fadeIn"
              >
                <div className="flex justify-between items-start gap-2">
                  <div 
                    onClick={() => {
                      const originalSku = skusList.find(s => s.name === item.name);
                      if (originalSku && onSelectSku) {
                        onSelectSku(originalSku);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <h4 className="text-[11.5px] font-extrabold text-zinc-900 dark:text-zinc-200 group-hover:text-purple-500 transition-colors font-display">
                      {item.name}
                    </h4>
                    <p className="text-[8.5px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider mt-0.5">
                      {item.cat} • Rev: ${item.rev} M • Perf: {item.performance}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] font-extrabold font-mono text-purple-600 dark:text-purple-400">
                      ${item.rev} M
                    </span>
                    <p className="text-[7.5px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold mt-0.5">
                      Revenue
                    </p>
                  </div>
                </div>

                <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {item.rec}
                </p>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const originalSku = skusList.find(s => s.name === item.name);
                      if (originalSku && onSelectSku) {
                        onSelectSku(originalSku);
                      }
                    }}
                    className="px-2 py-1 border border-black/10 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-sm text-[8.5px] font-bold uppercase tracking-wider cursor-pointer bg-transparent outline-none"
                  >
                    Review Metrics
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onScheduleMeeting) {
                        const meetingType = item.quadrant === 'high_performer' ? 'Pricing' :
                                            item.quadrant === 'underperformer' ? 'Rationalize' :
                                            item.quadrant === 'hidden_growth' ? 'Launch' : 'Pricing';
                        onScheduleMeeting(item.name, meetingType);
                      } else {
                        handleAuthorizeStrategy(item.name, item.quadrant);
                      }
                    }}
                    className="px-2 py-1 bg-purple-600 dark:bg-purple-500 text-white dark:text-zinc-950 hover:opacity-90 rounded-sm text-[8.5px] font-extrabold uppercase tracking-wider cursor-pointer border-none flex items-center gap-1 outline-none"
                  >
                    Authorize Strategy
                  </button>
                </div>
              </div>
            ))}
            {filteredOppData.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                No SKUs found for this active filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMMAND CENTER SUB-COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
