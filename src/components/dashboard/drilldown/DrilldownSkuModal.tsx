/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Tag, TrendingUp, TrendingDown, BarChart3, Clock, ShieldAlert, Zap, Activity 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { SKUS as GLOBAL_SKUS } from '../../../constants/data';
import { EmailComposerModal } from '../portfolio-health/EmailComposerModal';
import { SuccessFeedbackModal } from '../portfolio-health/SuccessFeedbackModal';
import { TimelineRange, getFilteredSKUS } from '../../../utils/timeframe';
import { useMemo } from 'react';

interface DrilldownSkuModalProps {
  isOpen: boolean;
  onClose: () => void;
  skuName: string;
  selectedRegion: string;
  timeHorizon: '1M' | '3M' | '6M' | 'YTD' | '12M' | '2Y' | '3Y';
  multiplier: number;
  isDarkMode: boolean;
  timelineRange: TimelineRange;
}

const REGIONS_CONFIG: Record<string, { name: string; manager: string; email: string; role: string; plant: string }> = {
  APAC: { name: 'Asia-Pacific', manager: 'Vijay Kumar', email: 'vijay.kumar@aciesglobal.com', role: 'APAC Logistics Head', plant: 'Chennai Bottling Plant' },
  Americas: { name: 'North & South America', manager: 'Gautam Sen', email: 'gautam.sen@aciesglobal.com', role: 'National Distribution Manager', plant: 'Vapi Consumer Goods Hub' },
  EMEA: { name: 'Europe, Middle East & Africa', manager: 'Jean-Pierre Dubois', email: 'jp.dubois@aciesglobal.com', role: 'Commodities Hedging Director', plant: 'Baddi Manufacturing Hub' },
  LATAM: { name: 'Latin America', manager: 'Dieter Maes', email: 'dieter.maes@aciesglobal.com', role: 'Production Scheduler', plant: 'Vapi Consumer Goods Hub' },
};

export const DrilldownSkuModal: React.FC<DrilldownSkuModalProps> = ({
  isOpen,
  onClose,
  skuName,
  selectedRegion,
  timeHorizon,
  multiplier,
  isDarkMode,
  timelineRange,
}) => {
  const SKUS = useMemo(() => getFilteredSKUS(GLOBAL_SKUS, timelineRange), [timelineRange]);
  const [detailTab, setDetailTab] = useState<'profit' | 'supply' | 'ai'>('profit');
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<{
    isOpen: boolean;
    recipientName: string;
    recipientTitle: string;
    recipientEmail: string;
    contextType: 'approval' | 'bottleneck' | 'signal';
    contextTitle: string;
    channel: 'email' | 'message';
  } | null>(null);
  const [emailData, setEmailData] = useState({ to: '', name: '', subject: '', body: '' });

  // Simulator range slider states
  const [sliderLogistics, setSliderLogistics] = useState(0);
  const [sliderPromo, setSliderPromo] = useState(0);
  const [sliderCOGS, setSliderCOGS] = useState(0);

  // Reset sliders when SKU or Region changes
  useEffect(() => {
    setSliderLogistics(0);
    setSliderPromo(0);
    setSliderCOGS(0);
  }, [skuName, selectedRegion]);

  if (!isOpen) return null;

  const rawSku = SKUS.find(s => s.name === skuName) || SKUS[0];
  const regionalConfig = REGIONS_CONFIG[selectedRegion] || REGIONS_CONFIG.APAC;

  // SKU metrics calculations
  const skuRev = rawSku.rev * multiplier;
  const skuMargin = rawSku.margin;
  const skuGrowth = rawSku.growth;
  const skuPromo = rawSku.promo;
  const skuLead = rawSku.lead;
  
  const getStockoutsMultiplier = () => {
    switch (timeHorizon) {
      case '3Y': return 12;
      case '2Y': return 8;
      case '12M': return 4;
      case '6M': return 2;
      case 'YTD': return 1.67;
      case '3M': return 1;
      case '1M':
      default: return 0.33;
    }
  };
  const skuStockouts = Math.max(1, Math.round(rawSku.stockouts * getStockoutsMultiplier()));

  // Base Waterfall financials
  const wRevenue = skuRev;
  const wTradePromo = +(skuRev * skuPromo * 0.18).toFixed(1);
  const wCOGS = +(skuRev * (1 - skuMargin / 100) * 0.65).toFixed(1);
  const wLogistics = +(skuRev * 0.08 + (skuLead * 0.08)).toFixed(1);
  const wNetProfit = +(wRevenue - wTradePromo - wCOGS - wLogistics).toFixed(1);

  // Simulated financials based on slider percentage reductions
  const simTradePromo = +(wTradePromo * (1 - sliderPromo / 100)).toFixed(1);
  const simCOGS = +(wCOGS * (1 - sliderCOGS / 100)).toFixed(1);
  const simLogistics = +(wLogistics * (1 - sliderLogistics / 100)).toFixed(1);
  const simNetProfit = +(wRevenue - simTradePromo - simCOGS - simLogistics).toFixed(1);

  const waterfallData = [
    { name: 'Revenue', bottom: 0, value: wRevenue, displayVal: wRevenue, color: isDarkMode ? '#a78bfa' : '#6d28d9' },
    { name: 'Trade Promo', bottom: +(wRevenue - simTradePromo).toFixed(1), value: simTradePromo, displayVal: -simTradePromo, color: '#f87171' },
    { name: 'COGS', bottom: +(wRevenue - simTradePromo - simCOGS).toFixed(1), value: simCOGS, displayVal: -simCOGS, color: '#fb923c' },
    { name: 'Logistics', bottom: +simNetProfit.toFixed(1), value: simLogistics, displayVal: -simLogistics, color: '#60a5fa' },
    { name: 'Net Profit', bottom: 0, value: simNetProfit, displayVal: simNetProfit, color: '#34d399' }
  ];

  // Dynamic recommendations
  const getSkuInsights = () => {
    const regionObj = regionalConfig;
    const recs: { title: string; desc: string; email: string; body: string }[] = [];

    if (rawSku.cx >= 0.6 && rawSku.margin < 30) {
      recs.push({
        title: 'Review Tail Rationalization & Variant Consolidation',
        desc: `Operational complexity index stands at ${rawSku.cx.toFixed(2)} with only ${rawSku.margin}% gross margin.`,
        email: regionObj.email,
        body: `Hi ${regionObj.manager.split(' ')[0]},\n\nRegarding our SKU "${rawSku.name}" in the ${selectedRegion} market. It is operating with a complexity index of ${rawSku.cx.toFixed(2)} and compressed margin of ${rawSku.margin}%, placing it in our rationalization scope.\n\nCould we schedule a category audit to examine variant consolidation options at the ${regionObj.plant}?\n\nThanks,\nExecutive Director`
      });
    } else if (rawSku.promo > 0.45) {
      recs.push({
        title: 'Rollback Trade Promotion Caps to Recover Margin',
        desc: `${Math.round(rawSku.promo * 100)}% of sales are promo-driven. Shift spend to brand equity campaigns.`,
        email: 'rajesh.verma@aciesglobal.com',
        body: `Hi Rajesh,\n\nLooking at the promo reliance for "${rawSku.name}" in ${selectedRegion}. With ${Math.round(rawSku.promo * 100)}% of sales driven by discounts, our trade promo spend is $${wTradePromo} M. This is diluting our margins.\n\nWe need to implement a selective promotional cap (maximum 30% discount ceiling) next quarter. Let's align on next steps.\n\nRegards,\nExecutive Director`
      });
    }

    if (skuStockouts > 3 || rawSku.lead > 20) {
      recs.push({
        title: 'Qualify Secondary Logistics Supplier',
        desc: `Lead times have stretched to ${skuLead} days at ${regionObj.plant}, leading to ${skuStockouts} stockout events.`,
        email: 'vijay.kumar@aciesglobal.com',
        body: `Hi Vijay,\n\nWe are seeing severe supply bottlenecks for "${rawSku.name}" in the ${selectedRegion} region. Supplier lead times are at ${skuLead} days, leading to ${skuStockouts} stockout events this period.\n\nWe need to qualify secondary logistics routes out of ${regionObj.plant} to stabilize shipping. Let's arrange a call next Tuesday.\n\nBest regards,\nExecutive Director`
      });
    } else {
      recs.push({
        title: 'Optimize Safety Stock Buffers',
        desc: `Logistics lines are healthy (${skuLead}d lead time). Buffer release releases $${(skuRev * 0.03).toFixed(1)} M capital.`,
        email: 'nisha.patel@aciesglobal.com',
        body: `Hi Nisha,\n\nGiven the logistics stability of "${rawSku.name}" in ${selectedRegion} (lead time: ${skuLead} days), we have an opportunity to optimize safety stock.\n\nBased on our model, releasing safety stock buffers can free up $${(skuRev * 0.03).toFixed(1)} M in locked inventory capital at the ${regionObj.plant} warehouse. Please set up a simulation.\n\nThanks,\nExecutive Director`
      });
    }

    return recs;
  };

  const currentInsights = getSkuInsights();

  // Helper to determine Commercial segment classification dynamically
  const getSkuSegment = (sku: typeof rawSku) => {
    if (sku.cx >= 0.55 && sku.margin < 33) {
      return { label: 'Rationalize', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    }
    if (sku.cx >= 0.55 && sku.margin >= 33) {
      return { label: 'Consolidate', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
    }
    if (sku.cx < 0.55 && sku.margin >= 35) {
      return { label: 'Keep', color: 'text-green-500 bg-green-500/10 border-green-500/20' };
    }
    return { label: 'Grow', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
  };

  const segment = getSkuSegment(rawSku);

  // Status colors for Lead Time & Stockouts
  const getLeadTimeStatus = (days: number) => {
    if (days <= 14) return { label: 'Optimal', color: 'text-green-500 bg-green-500/10 border-green-500/15' };
    if (days <= 24) return { label: 'Extended', color: 'text-amber-500 bg-amber-500/10 border-amber-500/15' };
    return { label: 'Critical Delay', color: 'text-red-500 bg-red-500/10 border-red-500/15 animate-pulse' };
  };

  const getStockoutStatus = (events: number) => {
    if (events <= 1) return { label: 'Stable', color: 'text-green-500 bg-green-500/10 border-green-500/15' };
    if (events <= 3) return { label: 'Moderate Risk', color: 'text-amber-500 bg-amber-500/10 border-amber-500/15' };
    return { label: 'Critical Shortage', color: 'text-red-500 bg-red-500/10 border-red-500/15 animate-pulse' };
  };

  const leadStatus = getLeadTimeStatus(skuLead);
  const stockoutStatus = getStockoutStatus(skuStockouts);

  // Recharts styling
  const gridStroke = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const tooltipBg = isDarkMode ? '#1f1f1f' : '#fff';
  const tooltipBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipText = isDarkMode ? '#fff' : '#000';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Modal Container */}
      <div 
        className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 w-full max-w-4xl shadow-2xl rounded-sm overflow-hidden animate-scaleIn flex flex-col relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-100 cursor-pointer border-none bg-transparent outline-none"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-black/5 dark:border-white/5 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-acies-yellow" />
                <h3 className="text-lg font-display font-extrabold text-zinc-800 dark:text-white leading-none">
                  {rawSku.name}
                </h3>
              </div>
              <p className="text-[9px] text-zinc-550 dark:text-zinc-400 uppercase tracking-widest font-extrabold">
                Category: <span className="text-zinc-750 dark:text-zinc-200">{rawSku.cat}</span> · Plant Site: <span className="text-zinc-750 dark:text-zinc-200">{regionalConfig.plant}</span>
              </p>
            </div>

            {/* Commercial Value Badge */}
            <div className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded border shrink-0 ${segment.color}`}>
              Segment: {segment.label}
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded flex flex-col justify-between h-18">
              <p className="font-bold text-[8px] uppercase tracking-widest text-zinc-450 leading-none">Realized Revenue</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-display font-extrabold text-acies-yellow">${skuRev.toFixed(1)}</span>
                <span className="text-[10px] font-bold text-zinc-450">M</span>
              </div>
              <p className="text-[7px] text-zinc-450 uppercase tracking-wider font-bold">Horizon: {timeHorizon}</p>
            </div>
            
            <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded flex flex-col justify-between h-18">
              <p className="font-bold text-[8px] uppercase tracking-widest text-zinc-450 leading-none">Gross Margin %</p>
              <span className="text-lg font-display font-extrabold text-zinc-855 dark:text-white mt-1">{skuMargin}%</span>
              <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-acies-yellow" style={{ width: `${skuMargin}%` }} />
              </div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded flex flex-col justify-between h-18">
              <p className="font-bold text-[8px] uppercase tracking-widest text-zinc-450 leading-none">YoY Sales Growth</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-lg font-display font-extrabold ${skuGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {skuGrowth >= 0 ? '+' : ''}{Math.round(skuGrowth * 100)}%
                </span>
                {skuGrowth >= 0 ? (
                  <TrendingUp size={14} className="text-green-500" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
              </div>
              <p className="text-[7px] text-zinc-455 uppercase tracking-wider font-bold">Category Trend</p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Sub-Tab Navigation */}
          <div className="flex border-b border-black/10 dark:border-white/10 gap-6">
            {(['profit', 'supply', 'ai'] as const).map(t => {
              const isActive = detailTab === t;
              const labels = { profit: 'Profitability Bridge', supply: 'Supply Operations', ai: 'AI Recommendations' };
              return (
                <button
                  key={t}
                  onClick={() => setDetailTab(t)}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer outline-none transition-all relative ${
                    isActive ? 'text-acies-yellow' : 'text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-250'
                  }`}
                >
                  {labels[t]}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-acies-yellow" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Conditional Sub-Tab Display Content */}
          <div className="min-h-[260px] flex flex-col justify-start">
            
            {/* Profitability Waterfall Chart */}
            {detailTab === 'profit' && (
              <div className="space-y-4 animate-fadeIn w-full">
                <div className="flex items-center justify-between pb-1 border-b border-black/[0.03] dark:border-white/[0.03]">
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                    Cost leakage breakdown of gross revenue to net profit
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Side: Waterfall Chart + Simulator Sliders */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={waterfallData} margin={{ top: 15, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                          <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 8 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: tickColor, fontSize: 8 }} label={{ value: '$ Million', angle: -90, position: 'insideLeft', fill: tickColor, fontSize: 8 }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                            itemStyle={{ fontSize: 10 }}
                            formatter={(value: any, name: any, props: any) => {
                              return [`$${props.payload.displayVal} M`, 'Value'];
                            }}
                          />
                          <Bar dataKey="bottom" stackId="topdown-wfall" fill="transparent" />
                          <Bar dataKey="value" stackId="topdown-wfall" radius={1}>
                            {waterfallData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Simulator Sliders */}
                    <div className="p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded space-y-3.5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                        <h4 className="text-[9.5px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-display flex items-center gap-1.5">
                          <span>🔧 Interactive Margin Optimization Levers</span>
                        </h4>
                        <button 
                          onClick={() => { setSliderLogistics(0); setSliderPromo(0); setSliderCOGS(0); }}
                          className="text-[7.5px] font-extrabold uppercase text-purple-600 dark:text-purple-400 hover:underline bg-transparent border-none cursor-pointer p-0"
                          title="Reset all optimization levers to original values"
                        >
                          Reset Levers
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {/* Slider 1 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline text-[7.5px] font-bold uppercase tracking-wider text-zinc-450">
                            <span>Logistics Opt.</span>
                            <span className="text-[#f59e0b] font-black font-mono text-[8.5px]">{sliderLogistics}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="50" 
                            value={sliderLogistics} 
                            onChange={(e) => setSliderLogistics(parseInt(e.target.value))} 
                            className="w-full h-1 bg-zinc-200 dark:bg-zinc-750 rounded-lg appearance-none cursor-pointer accent-[#f59e0b] outline-none"
                          />
                          <p className="text-[6.5px] text-zinc-400 leading-tight">Reduces logistics leak (0-50%)</p>
                        </div>

                        {/* Slider 2 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline text-[7.5px] font-bold uppercase tracking-wider text-zinc-450">
                            <span>Promo Cap</span>
                            <span className="text-[#f59e0b] font-black font-mono text-[8.5px]">{sliderPromo}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="60" 
                            value={sliderPromo} 
                            onChange={(e) => setSliderPromo(parseInt(e.target.value))} 
                            className="w-full h-1 bg-zinc-200 dark:bg-zinc-750 rounded-lg appearance-none cursor-pointer accent-[#f59e0b] outline-none"
                          />
                          <p className="text-[6.5px] text-zinc-400 leading-tight">Limits trade discounts (0-60%)</p>
                        </div>

                        {/* Slider 3 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline text-[7.5px] font-bold uppercase tracking-wider text-zinc-450">
                            <span>COGS Efficiency</span>
                            <span className="text-[#f59e0b] font-black font-mono text-[8.5px]">{sliderCOGS}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="30" 
                            value={sliderCOGS} 
                            onChange={(e) => setSliderCOGS(parseInt(e.target.value))} 
                            className="w-full h-1 bg-zinc-200 dark:bg-zinc-750 rounded-lg appearance-none cursor-pointer accent-[#f59e0b] outline-none"
                          />
                          <p className="text-[6.5px] text-zinc-400 leading-tight">Boosts production yield (0-30%)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Reconciliation Table */}
                  <div className="md:col-span-5 border border-black/5 dark:border-white/10 rounded overflow-hidden self-start">
                    <table className="w-full text-left border-collapse text-[9px]">
                      <thead>
                        <tr className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10 font-bold uppercase tracking-wider text-zinc-500">
                          <th className="py-2 px-2.5">Financial Stage</th>
                          <th className="py-2 px-2 text-right">Original</th>
                          <th className="py-2 px-2 text-right">Simulated</th>
                          <th className="py-2 px-2.5 text-right text-green-500">Recovery</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/10 font-medium">
                        <tr>
                          <td className="py-2 px-2.5 text-zinc-700 dark:text-zinc-300">Gross Sales Revenue</td>
                          <td className="py-2 px-2 text-right text-zinc-500 dark:text-zinc-450">${wRevenue.toFixed(1)} M</td>
                          <td className="py-2 px-2 text-right text-acies-yellow font-bold">${wRevenue.toFixed(1)} M</td>
                          <td className="py-2 px-2.5 text-right text-zinc-400 font-mono">—</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2.5 text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                            <span className="text-red-500 text-[8px] bg-red-500/10 px-1 rounded font-extrabold leading-none">−</span>
                            Trade Promotions
                          </td>
                          <td className="py-2 px-2 text-right text-zinc-500 dark:text-zinc-450">-${wTradePromo.toFixed(1)} M</td>
                          <td className="py-2 px-2 text-right text-red-500 font-semibold">-${simTradePromo.toFixed(1)} M</td>
                          <td className="py-2 px-2.5 text-right text-green-500 font-bold font-mono">
                            {wTradePromo - simTradePromo > 0 ? `+$${(wTradePromo - simTradePromo).toFixed(1)} M` : '—'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2.5 text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                            <span className="text-orange-500 text-[8px] bg-orange-500/10 px-1 rounded font-extrabold leading-none">−</span>
                            Manufacturing COGS
                          </td>
                          <td className="py-2 px-2 text-right text-zinc-500 dark:text-zinc-450">-${wCOGS.toFixed(1)} M</td>
                          <td className="py-2 px-2 text-right text-orange-500 font-semibold">-${simCOGS.toFixed(1)} M</td>
                          <td className="py-2 px-2.5 text-right text-green-500 font-bold font-mono">
                            {wCOGS - simCOGS > 0 ? `+$${(wCOGS - simCOGS).toFixed(1)} M` : '—'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2.5 text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                            <span className="text-blue-500 text-[8px] bg-blue-500/10 px-1 rounded font-extrabold leading-none">−</span>
                            Logistics & Dist.
                          </td>
                          <td className="py-2 px-2 text-right text-zinc-500 dark:text-zinc-450">-${wLogistics.toFixed(1)} M</td>
                          <td className="py-2 px-2 text-right text-blue-500 font-semibold">-${simLogistics.toFixed(1)} M</td>
                          <td className="py-2 px-2.5 text-right text-green-500 font-bold font-mono">
                            {wLogistics - simLogistics > 0 ? `+$${(wLogistics - simLogistics).toFixed(1)} M` : '—'}
                          </td>
                        </tr>
                        <tr className="bg-black/[0.02] dark:bg-white/[0.02] font-bold text-zinc-805 dark:text-white border-t border-black/10 dark:border-white/15">
                          <td className="py-2.5 px-2.5">Net Oper. Profit</td>
                          <td className="py-2.5 px-2 text-right text-zinc-450 dark:text-zinc-500 font-medium">
                            ${wNetProfit.toFixed(1)} M
                            <span className="text-[7.5px] block font-normal text-zinc-450">({((wNetProfit / wRevenue) * 100).toFixed(1)}%)</span>
                          </td>
                          <td className="py-2.5 px-2 text-right text-emerald-500">
                            ${simNetProfit.toFixed(1)} M
                            <span className="text-[7.5px] block font-extrabold text-emerald-500">({((simNetProfit / wRevenue) * 100).toFixed(1)}%)</span>
                          </td>
                          <td className="py-2.5 px-2.5 text-right text-green-500 font-black text-[10px] font-mono leading-tight">
                            {simNetProfit - wNetProfit > 0 ? (
                              <>
                                <span className="block font-black">+${(simNetProfit - wNetProfit).toFixed(1)} M</span>
                                <span className="text-[7.5px] font-extrabold block">+{(((simNetProfit - wNetProfit) / wRevenue) * 100).toFixed(1)}pp</span>
                              </>
                            ) : '—'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Supply chain health operations gauges */}
            {detailTab === 'supply' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <div className="space-y-4">
                  {/* Lead Time Gauge */}
                  <div className="p-3 border rounded flex justify-between items-center bg-zinc-50 dark:bg-white/[0.02] border-black/5 dark:border-white/10">
                    <div className="space-y-0.5">
                      <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-zinc-450 flex items-center gap-1">
                        <Clock size={10} /> Sourcing Lead Time
                      </span>
                      <p className="text-base font-display font-extrabold text-zinc-800 dark:text-white leading-none mt-1">
                        {skuLead} Days
                      </p>
                    </div>
                    <span className={`text-[8.5px] px-2 py-0.5 rounded-sm font-extrabold uppercase border ${leadStatus.color}`}>
                      {leadStatus.label}
                    </span>
                  </div>

                  {/* Stockouts Gauge */}
                  <div className="p-3 border rounded flex justify-between items-center bg-zinc-50 dark:bg-white/[0.02] border-black/5 dark:border-white/10">
                    <div className="space-y-0.5">
                      <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-zinc-450 flex items-center gap-1">
                        <ShieldAlert size={10} /> Stockout Frequency
                      </span>
                      <p className="text-base font-display font-extrabold text-zinc-800 dark:text-white leading-none mt-1">
                        {skuStockouts} Events
                      </p>
                    </div>
                    <span className={`text-[8.5px] px-2 py-0.5 rounded-sm font-extrabold uppercase border ${stockoutStatus.color}`}>
                      {stockoutStatus.label}
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] rounded space-y-4">
                  {/* Complexity bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-bold uppercase text-zinc-450">
                      <span>Manufacturing Complexity</span>
                      <span className="text-zinc-700 dark:text-zinc-350 font-mono">Index {rawSku.cx.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-acies-yellow" style={{ width: `${rawSku.cx * 100}%` }} />
                    </div>
                    <p className="text-[7px] text-zinc-400 italic">Complexity score maps layout, lines, and custom packaging changes.</p>
                  </div>

                  {/* Promo Reliance bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-bold uppercase text-zinc-450">
                      <span>Promotional discount Reliance</span>
                      <span className="text-zinc-700 dark:text-zinc-350 font-mono">{Math.round(skuPromo * 100)}% of sales</span>
                    </div>
                    <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-acies-yellow" style={{ width: `${skuPromo * 100}%` }} />
                    </div>
                    <p className="text-[7px] text-zinc-400 italic">Volume percentage of gross revenue generated under active sales discounts.</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {detailTab === 'ai' && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between pb-1 border-b border-black/[0.03] dark:border-white/[0.03]">
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                    Prescriptive mitigations to resolve supply risks and recover margins
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {currentInsights.map((rec, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded hover:border-acies-yellow dark:hover:border-acies-yellow transition-all flex flex-col justify-between gap-3 shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-bold text-acies-yellow">0{index + 1}</span>
                          <p className="font-bold text-[10px] text-zinc-800 dark:text-zinc-100 leading-snug">{rec.title}</p>
                        </div>
                        <p className="text-[8px] text-zinc-550 dark:text-zinc-400 leading-relaxed font-normal">{rec.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-2">
                        <span className="text-[7.5px] text-zinc-405">
                          Route: <span className="font-bold text-zinc-555 dark:text-zinc-350">{regionalConfig.manager.split(' ')[0]}</span> ({regionalConfig.role.split(' ').slice(-1)[0]})
                        </span>
                        <button
                          onClick={() => {
                            setEmailData({ to: rec.email, name: regionalConfig.manager, subject: rec.title, body: rec.body });
                            setIsEmailOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-white bg-acies-yellow hover:opacity-90 rounded-sm transition-all cursor-pointer border-none shadow-sm shadow-black/10"
                        >
                          <Mail size={9} />
                          Request Action
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer Banner */}
        <div className="bg-zinc-50 dark:bg-white/5 p-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[8.5px] text-zinc-400 font-bold uppercase">
            <Zap size={10} className="text-acies-yellow fill-acies-yellow" />
            Executive Decision Loop Active
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-acies-yellow hover:opacity-90 text-white dark:text-acies-gray rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-sm"
          >
            Close Profile
          </button>
        </div>
      </div>

      {/* Embedded Email Composer Modal */}
      <EmailComposerModal 
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        initialEmail={emailData}
        onSend={(recipientName, recipientEmail, subject, body, channel) => {
          const title = REGIONS_CONFIG[selectedRegion]?.role || 'Regional Lead';
          setSuccessFeedback({
            isOpen: true,
            recipientName,
            recipientTitle: title,
            recipientEmail,
            contextType: 'signal',
            contextTitle: subject || `Sourcing Action for ${skuName}`,
            channel: channel || 'email'
          });
          setIsEmailOpen(false);
        }}
      />

      {successFeedback && (
        <SuccessFeedbackModal
          isOpen={successFeedback.isOpen}
          onClose={() => setSuccessFeedback(null)}
          recipientName={successFeedback.recipientName}
          recipientTitle={successFeedback.recipientTitle}
          recipientEmail={successFeedback.recipientEmail}
          contextType={successFeedback.contextType}
          contextTitle={successFeedback.contextTitle}
          isDarkMode={isDarkMode}
          channel={successFeedback.channel}
        />
      )}
    </div>
  );
};
