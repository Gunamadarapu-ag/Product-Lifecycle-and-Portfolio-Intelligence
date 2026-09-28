/**
 * Investment versus margin map for the portfolio.
 *
 * Extracted from PortfolioHealthMap.tsx (2,663 lines).
 */
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, LabelList, Cell, ReferenceLine } from 'recharts';
import { getChartTheme } from '../../../utils/chartTheme';

export interface InvestmentMarginSku {
  name: string;
  cat: string;
  rev: number;
  margin: number;
  growth: number;
  investment: number;
  returnMargin: number;
  quadrant: 'quickwin' | 'strategic' | 'niche' | 'avoid';
  rec: string;
}

export interface InvestmentMarginMapProps {
  skusList: any[];
  isDarkMode: boolean;
  onSelectSku?: (sku: any) => void;
  addToast?: (title: string, body: string, color: string) => void;
  onScheduleMeeting?: (title: string, type: string) => void;
}

export const getInvestmentMarginData = (skusList: any[]): InvestmentMarginSku[] => {
  return skusList.map(s => {
    let investment = 50;
    let returnMargin = s.margin;
    let rec = '';

    if (s.name === 'Herbal Shampoo') {
      investment = 14; returnMargin = 85;
      rec = 'Booming demand requires low capital layout of $14 M; yields a high return margin of 85%. Primary focus for budget boost.';
    } else if (s.name === 'BrandD Toothpaste') {
      investment = 22; returnMargin = 72;
      rec = 'Stable personal care SKU. Low marketing investment needed; returns steady 72% margins. Increase store penetration.';
    } else if (s.name === 'Oat Cookies') {
      investment = 18; returnMargin = 78;
      rec = 'Snack leader with low freight overhead. Low investment of $18 M yields 78% returns. Increase promotional layout.';
    } else if (s.name === 'BrandC Chips (Spicy)') {
      investment = 28; returnMargin = 68;
      rec = 'High local demand pull; low capital required ($28 M) to yield 68% returns. Optimize distributor placement.';
    } else if (s.name === 'Coconut Water 330ml') {
      investment = 35; returnMargin = 81;
      rec = 'Organic category with high profit return of 81% against moderate $35 M capital expansion. Secure convenience store placement.';
    } else if (s.name === 'Mango Fizz 500ml') {
      investment = 75; returnMargin = 70;
      rec = 'Market leader requires substantial launch budget ($75 M) for regional campaigns. Returns a strong 70% margin.';
    } else if (s.name === 'Laundry Pods Premium') {
      investment = 82; returnMargin = 74;
      rec = 'Premium category needs automated line upgrades ($82 M) but offers excellent 74% margins once scaled.';
    } else if (s.name === 'Dish Soap 1L') {
      investment = 60; returnMargin = 62;
      rec = 'Steady household demand. Scaling production requires $60 M with solid 62% margins.';
    } else if (s.name === 'Choco Wafers') {
      investment = 70; returnMargin = 22;
      rec = 'High promotional dependency (72%) and heavy capital layout. Margin returns only 22%. Avoid additional investment.';
    } else if (s.name === 'Fabric Softener') {
      investment = 85; returnMargin = 15;
      rec = 'Severe logistics bottleneck (35d lead time). Requires $85 M for warehouse overrides with poor 15% margin yields.';
    } else if (s.name === 'BrandB Yogurt 1kg') {
      investment = 65; returnMargin = 24;
      rec = 'Saturated dairy item. Shift production focus to higher-margin fresh cheese.';
    } else if (s.name === 'Floor Cleaner') {
      investment = 32; returnMargin = 19;
      rec = 'Low margin (19%) and low capital layout. Maintain baseline trading without active expansion.';
    } else if (s.name === 'Aloe Face Wash') {
      investment = 25; returnMargin = 18;
      rec = 'Underperforming skin care item. Low capital cost but returns only 18%. Defer expansion.';
    } else if (s.name === 'BrandE Yogurt (Straw)') {
      investment = 40; returnMargin = 21;
      rec = 'Minor dairy segment. Defer promotional budgets to release safety stock capital.';
    } else if (s.name === 'Foam Face Wash') {
      investment = 45; returnMargin = 26;
      rec = 'High volume but low margins (26%). Limit capital layout to baseline maintenance.';
    } else {
      if (s.margin >= 35) {
        if (s.rev >= 80) {
          investment = Math.round(55 + (s.rev % 35));
          returnMargin = Math.round(s.margin);
          rec = `High-value product. Requires $${investment} M capital to yield ${returnMargin}% margins.`;
        } else {
          investment = Math.round(15 + (s.rev % 30));
          returnMargin = Math.round(s.margin);
          rec = `Attractive margin profile. Low investment of $${investment} M delivers ${returnMargin}% returns.`;
        }
      } else {
        if (s.rev >= 80) {
          investment = Math.round(60 + (s.rev % 30));
          returnMargin = Math.round(s.margin);
          rec = `Capital heavy and low yield. Investment of $${investment} M delivers only ${returnMargin}% margin.`;
        } else {
          investment = Math.round(10 + (s.rev % 35));
          returnMargin = Math.round(s.margin);
          rec = `Minor tactical SKU. Low investment of $${investment} M yields minor ${returnMargin}% margins.`;
        }
      }
    }

    let quadrant: 'quickwin' | 'strategic' | 'niche' | 'avoid' = 'niche';
    if (returnMargin >= 50 && investment < 50) {
      quadrant = 'quickwin';
    } else if (returnMargin >= 50 && investment >= 50) {
      quadrant = 'strategic';
    } else if (returnMargin < 50 && investment < 50) {
      quadrant = 'niche';
    } else {
      quadrant = 'avoid';
    }

    return {
      name: s.name,
      cat: s.cat,
      rev: s.rev,
      margin: s.margin,
      growth: s.growth,
      investment,
      returnMargin,
      quadrant,
      rec
    };
  });
};

export const InvestmentMarginMap: React.FC<InvestmentMarginMapProps> = ({ skusList, isDarkMode, onSelectSku, addToast, onScheduleMeeting }) => {
  const [activeQuad, setActiveQuad] = useState<'quickwin' | 'strategic' | 'niche' | 'avoid'>('quickwin');
  const [viewMode, setViewMode] = useState<'quadrant' | 'category'>('quadrant');
  const [activeCat, setActiveCat] = useState<string>('Beverages');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const oppData = getInvestmentMarginData(skusList);
  
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
    quickwin: oppData.filter(x => x.quadrant === 'quickwin' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    strategic: oppData.filter(x => x.quadrant === 'strategic' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    niche: oppData.filter(x => x.quadrant === 'niche' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    avoid: oppData.filter(x => x.quadrant === 'avoid' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
  };

  const catCounts = {
    'Beverages': oppData.filter(x => x.cat === 'Beverages').length,
    'Snacks': oppData.filter(x => x.cat === 'Snacks').length,
    'Personal Care': oppData.filter(x => x.cat === 'Personal Care').length,
    'Dairy': oppData.filter(x => x.cat === 'Dairy').length,
    'Household': oppData.filter(x => x.cat === 'Household').length,
  };

  const handleApproveInvestment = (skuName: string, potential: number) => {
    if (addToast) {
      addToast(
        "Investment Approved",
        `Mitigation plan & $${potential} M expansion budget successfully approved for ${skuName}.`,
        "#10b981"
      );
    }
  };

  const getBubbleColor = (quad: string) => {
    switch (quad) {
      case 'quickwin': return '#10b981';
      case 'strategic': return '#8b5cf6';
      case 'niche': return '#f59e0b';
      case 'avoid': return '#ef4444';
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
              <span className="text-zinc-400">Investment:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">${data.investment} M</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Return Margin:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{data.returnMargin}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">SKU Revenue:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-500">${data.rev} M</span>
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Investment vs. Return Margin Map</span>
          <p className="text-[9px] text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
            Optimize fund allocation: High Return & Low Investment (Quick Wins) represent top priority candidates.
          </p>
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

          <span className="text-[8px] font-bold uppercase tracking-wider text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full animate-pulse">
            Capital Allocation Active
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
                <div className="absolute top-6 left-16 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded-sm">
                  Quick Wins (High Priority)
                </div>
                <div className="absolute top-6 right-6 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-purple-500/80 bg-purple-500/5 px-2 py-0.5 border border-purple-500/10 rounded-sm">
                  Strategic Bets (Scale)
                </div>
                <div className="absolute top-[200px] left-16 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-amber-500/80 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded-sm">
                  Niche / Tactical
                </div>
                <div className="absolute top-[200px] right-6 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-red-500/80 bg-red-500/5 px-2 py-0.5 border border-red-500/10 rounded-sm">
                  Avoid / High Risk
                </div>
              </>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <ReferenceLine x={50} stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeDasharray="5 5" />
                <ReferenceLine y={50} stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeDasharray="5 5" />
                <XAxis 
                  type="number" 
                  dataKey="investment" 
                  name="Investment" 
                  domain={[0, 100]} 
                  tick={{ fill: tickColor, fontSize: 9 }} 
                  label={{ value: 'Required Investment ($ M) →', position: 'bottom', fill: tickColor, fontSize: 10, offset: 10 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="returnMargin" 
                  name="Return Margin" 
                  domain={[0, 100]} 
                  tick={{ fill: tickColor, fontSize: 9 }} 
                  label={{ value: 'Return Margin (%)', angle: -90, position: 'left', fill: tickColor, fontSize: 10, offset: 15 }} 
                />
                <ZAxis type="number" dataKey="rev" range={[100, 600]} />
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
                { id: 'quickwin', label: 'Quick Wins', count: counts.quickwin, color: '#10b981' },
                { id: 'strategic', label: 'Strategic', count: counts.strategic, color: '#8b5cf6' },
                { id: 'niche', label: 'Niche', count: counts.niche, color: '#f59e0b' },
                { id: 'avoid', label: 'Avoid', count: counts.avoid, color: '#ef4444' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveQuad(t.id as any)}
                  className={`flex-1 py-1.5 text-[8.5px] font-extrabold uppercase tracking-wider text-center rounded-sm transition-all cursor-pointer border-none flex items-center justify-center gap-1 ${
                    activeQuad === t.id
                      ? 'bg-white dark:bg-zinc-800 shadow-sm font-black text-acies-gray dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 bg-transparent'
                  }`}
                  style={{ borderTop: activeQuad === t.id ? `2px solid ${t.color}` : 'none' }}
                >
                  <span>{t.label}</span>
                  <span className="text-[7.5px] opacity-60 px-1 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
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
                    <h4 className="text-[11.5px] font-extrabold text-zinc-900 dark:text-zinc-200 group-hover:text-emerald-500 transition-colors font-display">
                      {item.name}
                    </h4>
                    <p className="text-[8.5px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider mt-0.5">
                      {item.cat} • Rev: ${item.rev} M • Margin: {item.margin}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      ${item.investment} M
                    </span>
                    <p className="text-[7.5px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold mt-0.5">
                      Investment
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
                  {item.quadrant === 'quickwin' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onScheduleMeeting) {
                          onScheduleMeeting(item.name, 'CAPEX');
                        } else {
                          handleApproveInvestment(item.name, item.investment);
                        }
                      }}
                      className="px-2 py-1 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-zinc-950 hover:opacity-90 rounded-sm text-[8.5px] font-extrabold uppercase tracking-wider cursor-pointer border-none flex items-center gap-1 outline-none"
                    >
                      <Plus size={10} />
                      Approve Investment
                    </button>
                  )}
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
