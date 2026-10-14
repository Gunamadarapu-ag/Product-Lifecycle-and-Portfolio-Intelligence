/**
 * Profitability Tree. Dispatches to the VP view for that role, otherwise renders the scenario simulator.
 *
 * Extracted from ProfitabilityTree.tsx (2,081 lines).
 */
import React, { useState, useEffect } from 'react';
import { Layers, Save } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Role } from '../../../types/dashboard';
import { MarginSimulator } from './MarginSimulator';
import { TimelineRange, getTimeframeScale, getDeterministicNoise } from '../../../utils/timeframe';
import { getChartTheme } from '../../../utils/chartTheme';
import { VPProfitabilityTreeView } from './VPProfitabilityTreeView';
import { Scenario, breakevenSKUs, marginVelocityAlerts } from './profitabilityData';
import { useLiveData } from '../../../api/liveData';

export interface ProfitabilityTreeProps {
  role: Role;
  onAuditClick?: (metric: string | null) => void;
  isDarkMode: boolean;
  isSimulatorOpen?: boolean;
  setIsSimulatorOpen?: (open: boolean) => void;
  timelineRange: TimelineRange;
}

export const ProfitabilityTree: React.FC<ProfitabilityTreeProps> = ({ 
  role, 
  isDarkMode,
  isSimulatorOpen,
  setIsSimulatorOpen,
  onAuditClick,
  timelineRange
}) => {
  if (role === 'VP Product Management') {
    return (
      <VPProfitabilityTreeView 
        isDarkMode={isDarkMode} 
        isSimulatorOpen={isSimulatorOpen}
        setIsSimulatorOpen={setIsSimulatorOpen}
        onAuditClick={onAuditClick}
        timelineRange={timelineRange}
      />
    );
  }
  const accentColor = isDarkMode ? '#a78bfa' : '#6d28d9';
  const { gridStroke, tickColor, tooltipBg, tooltipBorder, tooltipText } = getChartTheme(isDarkMode);
  
  const [units, setUnits] = useState(850);
  const [price, setPrice] = useState(180);
  const [cost, setCost] = useState(95);
  const [logistics, setLogistics] = useState(18);
  const [promo, setPromo] = useState(4.5);
  const [overhead, setOverhead] = useState(8);

  const [hasCalculated, setHasCalculated] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  // Accordion guide
  const [guideOpen, setGuideOpen] = useState(false);

  const live = useLiveData();

  // Margin Velocity Alerts and Break-even SKU Radar, live since 7 Oct
  // (TODO.md O18): both used typed demo rows presented as "auto-surfaced".
  // No per-SKU month-over-month margin trend exists yet, so "velocity" is
  // relabelled to the real metric that does — promo margin erosion
  // (sku_metrics.margin_erosion, already fetched as live.skuSegments).
  // Break-even uses live.skus (already fetched), ranked by revenue at risk
  // among SKUs below a 20% margin line, the same sort the UI already claims.
  const liveMarginAlerts = live.skuSegments
    ? [...live.skuSegments].sort((a, b) => b.margin_erosion - a.margin_erosion).slice(0, 4).map(s => ({
        name: s.sku_name,
        detail: `Margin erosion on promotion`,
        delta: `${s.margin_erosion >= 0 ? '-' : '+'}${Math.abs(s.margin_erosion).toFixed(1)}pp`,
        status: s.margin_erosion >= 8 ? 'critical' : 'high',
        sColor: s.margin_erosion >= 8 ? '#ef4444' : '#f59e0b',
      }))
    : null;
  const liveBreakeven = live.skus
    ? [...live.skus].filter(s => s.gross_margin_pct < 0.20).sort((a, b) => b.net_sales - a.net_sales).slice(0, 4).map(s => ({
        name: s.sku_name,
        detail: `${s.category_name} · Net sales $${(s.net_sales / 1e6).toFixed(1)} M`,
        margin: Math.round(s.gross_margin_pct * 100),
        color: s.gross_margin_pct * 100 < 15 ? '#dc2626' : '#ea580c',
      }))
    : null;

  useEffect(() => {
    // Live since 7 Oct (TODO.md O18, thread 2): the sliders' own convention is
    // rev($M) = units × price / 100 (and so on for cogs/logistics),
    // unchanged below so every other calculation in this file keeps working.
    // price/cost are real averages ($/unit, from fn_portfolio_kpis); units is
    // back-solved so units × price / 100 reproduces the real monthly revenue
    // exactly — that keeps "units" a believable size instead of the raw
    // monthly unit count (tens of millions). Touching a slider still runs the
    // same "what if" math as before.
    if (live.pnl && live.kpis && live.kpis.units_sold > 0) {
      const months = Math.max(1, live.kpis.months_available);
      const avgPrice = live.kpis.net_sales / live.kpis.units_sold;
      const avgCost = (live.kpis.net_sales - live.kpis.gross_margin) / live.kpis.units_sold;
      const monthlyRevM = live.kpis.net_sales / months / 1e6;
      const u = Math.max(1, Math.round((monthlyRevM * 100) / avgPrice));
      setUnits(u);
      setPrice(+avgPrice.toFixed(2));
      setCost(+avgCost.toFixed(2));
      setLogistics(+((live.pnl.logistics_usd / months / 1e6) * 100 / u).toFixed(2));
      // Promo and Overhead are $M per month in the EBIT formula below (not
      // per-unit like Logistics), so they are seeded in $M: marketing as the
      // promo line, and SG&A (variable + fixed) plus per-SKU fixed cost as
      // overhead. With these seeds EBIT % equals fn_pnl's.
      setPromo(+(live.pnl.marketing_usd / months / 1e6).toFixed(2));
      setOverhead(+((live.pnl.sga_variable_usd + live.pnl.sga_fixed_usd + live.pnl.fixed_sku_cost_usd) / months / 1e6).toFixed(2));
      return;
    }
    const scale = getTimeframeScale(timelineRange);
    const noise = 1 + getDeterministicNoise('ProfitTree_Units', timelineRange) * 0.03;
    setUnits(Math.round(850 * scale * noise));
    setCost(Math.round(95 * (1 + getDeterministicNoise('ProfitTree_Cost', timelineRange) * 0.02)));
    setLogistics(Math.round(18 * scale * (1 + getDeterministicNoise('ProfitTree_Log', timelineRange) * 0.04)));
    setPrice(Math.round(180 + getDeterministicNoise('ProfitTree_Price', timelineRange) * 5));
    setOverhead(Math.round(8 * scale * (1 + getDeterministicNoise('ProfitTree_OH', timelineRange) * 0.03)));
  }, [timelineRange, live.pnl, live.kpis]);

  // Financial calculations
  const rev = units * price / 100;
  const cogs = units * cost / 100;
  const gm = rev - cogs;
  const logCost = units * logistics / 100;
  const gmAfterLog = gm - logCost;
  const ebit = gmAfterLog - promo - overhead;
  const gmPct = rev > 0 ? (gm / rev * 100).toFixed(1) : '0';
  const ebitPct = rev > 0 ? (ebit / rev * 100).toFixed(1) : '0';

  // Waterfall dataset transformation for Recharts
  const rawWaterfall = [
    { name: 'Revenue', val: rev, type: 'total' },
    { name: 'COGS', val: -cogs, type: 'change' },
    { name: 'Gross Margin', val: gm, type: 'total' },
    { name: 'Logistics', val: -logCost, type: 'change' },
    { name: 'After Log', val: gmAfterLog, type: 'total' },
    { name: 'Promo', val: -promo, type: 'change' },
    { name: 'Overhead', val: -overhead, type: 'change' },
    { name: 'EBIT', val: ebit, type: 'total' }
  ];

  const waterfallChartData = rawWaterfall.map((d) => {
    let color = accentColor;
    if (d.type === 'total') {
      color = accentColor;
    } else {
      color = d.val >= 0 ? '#0F6E56' : '#A32D2D';
    }

    return {
      name: d.name,
      bottom: 0,
      value: Math.abs(d.val),
      displayVal: Math.abs(Math.round(d.val)),
      color: color
    };
  });

  const handleSaveScenario = () => {
    const sName = prompt('Scenario name:', `Scenario ${scenarios.length + 1}`);
    if (!sName) return;

    const newScenario: Scenario = {
      name: sName,
      units,
      price,
      cost,
      logistics,
      promo,
      overhead,
      rev: Math.round(rev),
      gm: Math.round(gm),
      ebit: Math.round(ebit),
      gmPct,
      ebitPct
    };

    setScenarios(prev => [...prev, newScenario]);
  };

  return (
    <div className="space-y-6">
      
      {/* Strategic Header */}
      <div className="glass-card bg-acies-gray text-white py-5 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 pointer-events-none">
          <Layers size={100} />
        </div>
        <div>
          <p className="text-[9px] uppercase font-bold tracking-widest opacity-40 mb-2">Scenario Analysis Module</p>
          <h2 className="text-xl font-display font-medium text-white mb-2">Profitability Tree</h2>
          <p className="text-xs text-zinc-300 font-medium max-w-xl leading-relaxed">
            Decompose SKU profitability into core financial drivers. Adjust units, pricing, purchase costs, and overhead below, and instantly model P&L waterfall scenarios.
          </p>
        </div>
      </div>

      {/* Guide Accordion */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4">
        <button 
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full text-left font-bold text-xs uppercase tracking-widest text-acies-yellow flex justify-between items-center cursor-pointer border-none bg-transparent"
        >
          <span>📖 Profitability modeling guide</span>
          <span className="text-[10px]">{guideOpen ? '✕ Collapse' : '▲ Expand'}</span>
        </button>

        {guideOpen && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-black/5 dark:border-white/5 mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
            <div>
              <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">1. Enter P&L inputs</h4>
              <p>Fill units, price, purchase cost, logistics, promo spend, overhead. The waterfall calculates Gross → Net → EBITDA/EBIT live.</p>
            </div>
            <div>
              <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">2. Read the waterfall</h4>
              <p>Green bars add value, red bars subtract. Each step shows the cumulative impact of cost-to-serve leakages on profitability.</p>
            </div>
            <div>
              <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">3. Run what-if scenarios</h4>
              <p>Adjust any input slider and watch the waterfall update instantly. Model price increases, cost reductions, or promo cuts.</p>
            </div>
            <div>
              <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">4. Compare scenarios</h4>
              <p>Save multiple scenarios and compare side-by-side to find optimal pricing and cost-reduction levers.</p>
            </div>
          </div>
        )}
      </div>

      {/* Inputs Form */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">💰 P&L Inputs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Units Sold (000s)</label>
            <input 
              type="number" 
              value={units}
              onChange={(e) => setUnits(parseInt(e.target.value) || 0)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-2 text-xs font-semibold text-acies-gray dark:text-white outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Selling Price ($)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-2 text-xs font-semibold text-acies-gray dark:text-white outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Purchase Cost ($)</label>
            <input 
              type="number" 
              value={cost}
              onChange={(e) => setCost(parseInt(e.target.value) || 0)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-2 text-xs font-semibold text-acies-gray dark:text-white outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Logistics Cost ($)</label>
            <input 
              type="number" 
              value={logistics}
              onChange={(e) => setLogistics(parseFloat(e.target.value) || 0)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-2 text-xs font-semibold text-acies-gray dark:text-white outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Promo Spend ($ M)</label>
            <input 
              type="number" 
              value={promo}
              step="0.5"
              onChange={(e) => setPromo(parseFloat(e.target.value) || 0)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-2 text-xs font-semibold text-acies-gray dark:text-white outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Overhead ($ M)</label>
            <input 
              type="number" 
              value={overhead}
              step="0.5"
              onChange={(e) => setOverhead(parseFloat(e.target.value) || 0)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-2 text-xs font-semibold text-acies-gray dark:text-white outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
          <button 
            onClick={() => setHasCalculated(true)}
            className="px-5 py-2 bg-acies-gray text-white text-[9px] font-bold uppercase tracking-widest hover:bg-acies-yellow hover:text-acies-gray transition-all cursor-pointer border-none"
          >
            Calculate
          </button>
          <button 
            onClick={handleSaveScenario}
            className="px-4 py-2 border border-black/10 dark:border-white/10 text-acies-yellow text-[9px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            Save Scenario
          </button>
        </div>
      </div>

      {/* Margin Velocity Alerts, Break-even SKU Radar, & Regional Margin Simulator (PM view) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card bg-white dark:bg-[#1a1a24]/90 border border-black/10 dark:border-white/10 p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Margin Velocity Alerts</h4>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                {liveMarginAlerts ? 'Highest promo margin erosion, by SKU' : 'SKUs declining faster than 2pp/month — auto-surfaced'}
              </p>
            </div>
            <span className="text-[8px] font-black bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full shrink-0">
              {(liveMarginAlerts ?? marginVelocityAlerts).filter(a => a.status === 'critical').length} critical
            </span>
          </div>
          <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-xs font-semibold">
            {(liveMarginAlerts ?? marginVelocityAlerts).map((a, idx) => (
              <div key={idx} className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.sColor }} />
                  <div>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{a.name}</p>
                    <p className="text-[9.5px] text-zinc-400 font-medium">{a.detail}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                  {a.delta}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card bg-white dark:bg-[#1a1a24]/90 border border-black/10 dark:border-white/10 p-5 rounded-xl shadow-sm space-y-4">
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Break-even SKU Radar</h4>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
              {liveBreakeven ? 'Below 20% gross margin, ranked by net sales' : 'SKUs near or below break-even — ranked by revenue at risk'}
            </p>
          </div>
          <div className="space-y-5 pt-2 text-xs font-semibold">
            {(liveBreakeven ?? breakevenSKUs).map((s, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center font-bold text-zinc-800 dark:text-zinc-200">
                  <div>
                    <p>{s.name}</p>
                    <p className="text-[9px] text-zinc-500 uppercase font-medium">{s.detail}</p>
                  </div>
                  <span className="font-mono text-red-500 font-extrabold">{s.margin}% margin</span>
                </div>
                <div className="w-full bg-black/5 dark:bg-white/15 h-2 rounded relative overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 bottom-0 rounded" 
                    style={{ 
                      width: `${s.margin * 2.5}%`,
                      backgroundColor: s.margin < 18 ? '#dc2626' : '#ea580c' 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <MarginSimulator onAuditClick={onAuditClick ? (metric) => onAuditClick(metric) : undefined} />
        </div>
      </div>

      {/* Calculations & Charts Summary */}
      {hasCalculated && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Summary Metrics Grid */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5">
            <h4 className="text-xs font-bold uppercase tracking-widest pb-3 border-b border-black/5 dark:border-white/5 mb-4">
              P&L Summary Diagnosis
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-sm text-center">
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-45 mb-1">Revenue</p>
                <h5 className="text-base font-display font-extrabold text-blue-500">${Math.round(rev)}M</h5>
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-sm text-center">
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-45 mb-1">Gross Margin</p>
                <h5 className="text-base font-display font-extrabold text-green-500">${Math.round(gm)}M ({gmPct}%)</h5>
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-sm text-center">
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-45 mb-1">EBIT / EBITDA</p>
                <h5 className={`text-base font-display font-extrabold ${ebit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${Math.round(ebit)}M ({ebitPct}%)
                </h5>
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-sm text-center">
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-45 mb-1">Units (000s)</p>
                <h5 className="text-base font-display font-extrabold text-acies-gray dark:text-white">{units}</h5>
              </div>
            </div>
          </div>

          {/* Waterfall Chart */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-1">Profitability Waterfall</h3>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-4">Revenue → EBITDA. Hover each step for driver details.</p>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterfallChartData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tickColor, fontSize: 9 }} label={{ value: '$ Million', angle: -90, position: 'insideLeft', fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                    itemStyle={{ fontSize: 11 }}
                    formatter={(value: any, name: any, props: any) => {
                      return [`$${props.payload.displayVal}M`, 'Value'];
                    }}
                  />
                  {/* Bottom transparent spacer bar for waterfall stack */}
                  <Bar dataKey="bottom" stackId="wfall" fill="transparent" />
                  
                  {/* Top visible waterfall bar */}
                  <Bar dataKey="value" stackId="wfall" radius={2}>
                    {waterfallChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Saved Scenarios List */}
          {scenarios.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest pl-1">Saved Comparative Scenarios</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((s, idx) => (
                  <div key={idx} className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 space-y-3 relative">
                    <span className="absolute top-4 right-4 text-[7px] font-extrabold uppercase bg-acies-yellow/20 text-acies-yellow px-2 py-0.5 rounded-sm">
                      Saved
                    </span>
                    <h4 className="text-xs font-bold text-acies-gray dark:text-white pb-2 border-b border-black/5 dark:border-white/5 truncate max-w-[150px]">
                      {s.name}
                    </h4>
                    
                    <div className="space-y-1.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="text-blue-500 font-extrabold">${s.rev}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gross Margin:</span>
                        <span className="text-green-500 font-extrabold">${s.gm}M ({s.gmPct}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EBITDA:</span>
                        <span className={`font-extrabold ${s.ebit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${s.ebit}M ({s.ebitPct}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
