/**
 * The six rationale drill-down pages, one per reason category.
 *
 * Extracted from the original 2,597-line RationalisationTab.tsx.
 */
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { REASONS } from './rationalisationData';

export interface SubPageProps {
  onBack: () => void;
}

// ==========================================
// 1. LOW PROFITABILITY DRILL DOWN PAGE
// ==========================================

export const FinancialDrillDown: React.FC<SubPageProps> = ({ onBack }) => {
  const marginDistData = [
    { name: '<-10%', value: 24, color: '#ef4444' },
    { name: '-5% to -10%', value: 32, color: '#f97316' },
    { name: '0% to -5%', value: 28, color: '#f59e0b' },
    { name: '>0%', value: 16, color: '#10b981' }
  ];

  const financialFactorsData = [
    { name: 'High Oper. Costs', count: 75, color: '#ef4444' },
    { name: 'Low Sales Volume', count: 60, color: '#f97316' },
    { name: 'High Discounts', count: 45, color: '#f59e0b' },
    { name: 'Complex Manuf.', count: 35, color: '#3b82f6' },
    { name: 'High Supply Costs', count: 30, color: '#8b5cf6' },
    { name: 'Weak Strategic Fit', count: 20, color: '#6b7280' }
  ];

  const affectedSkus = [
    { name: 'SKU-Y001 (BrandC Water)', rev: '$550K', gross: '-4.2%', net: '-8.5%', impact: '-$120K', action: 'Discontinue' },
    { name: 'SKU-Y002 (BrandB Yogurt)', rev: '$320K', gross: '-5.1%', net: '-9.2%', impact: '-$85K', action: 'Discontinue' },
    { name: 'SKU-Y003 (BrandE Juice)', rev: '$480K', gross: '-2.8%', net: '-7.3%', impact: '-$95K', action: 'Reposition' },
    { name: 'SKU-Y004 (BrandA Chocolate)', rev: '$290K', gross: '-3.5%', net: '-8.1%', impact: '-$70K', action: 'Reposition' },
    { name: 'SKU-Y005 (BrandF Soda)', rev: '$620K', gross: '-1.8%', net: '-6.4%', impact: '-$75K', action: 'Reformulate' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block">SKU RATIONALIZE / RATIONALE SUMMARY / FINANCIAL REASONS</span>
          <h2 className="text-xl font-display leading-tight text-acies-gray dark:text-white font-bold mt-1">Low Profitability Drill Down</h2>
          <p className="text-[9.5px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold mt-0.5">Drill down into SKUs impacted due to low profitability</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-700 dark:text-zinc-300">
          <ArrowLeft size={12} />
          <span>Back to Summary</span>
        </button>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'AFFECTED SKUs', value: '78 SKUs', sub: '31% of portfolio' },
          { label: 'AVG NET MARGIN', value: '-5.1%', sub: 'Target: +15%' },
          { label: 'TOTAL LOSS IMPACT', value: '-$2.5M', sub: 'Calculated annual' },
          { label: 'AFFECTED REVENUE', value: '$24.6M', sub: 'Portfolio revenue' }
        ].map(m => (
          <div key={m.label} className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
            <span className="text-[8px] font-extrabold tracking-widest text-zinc-400 dark:text-zinc-500 block uppercase">{m.label}</span>
            <h3 className="text-2xl font-display font-black text-zinc-800 dark:text-zinc-100 mt-1">{m.value}</h3>
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-600 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Profitability overview + margin distribution */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">PROFITABILITY OVERVIEW</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/5 border border-red-500/10 p-3 rounded text-center">
              <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-500 block uppercase">AVG GROSS MARGIN</span>
              <h4 className="text-xl font-display font-black text-red-500 mt-0.5">-3.2%</h4>
              <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-600 block">Target: +40%</span>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 p-3 rounded text-center">
              <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-500 block uppercase">AVG NET MARGIN</span>
              <h4 className="text-xl font-display font-black text-red-500 mt-0.5">-5.1%</h4>
              <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-600 block">Target: +15%</span>
            </div>
          </div>

          <div className="border-t border-black/5 dark:border-white/5 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-2">MARGIN DISTRIBUTION</h3>
            <div className="h-[180px] relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-display font-black">78</span>
                <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">SKUs</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={marginDistData} cx="50%" cy="50%" innerRadius={55} outerRadius={70} paddingAngle={2} dataKey="value">
                    {marginDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}% of SKUs`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 mt-2">
              {marginDistData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: factors horizontal bar */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col justify-between h-[450px]">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">KEY FACTORS DRIVING LOW PROFITABILITY</h3>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold mt-0.5">Primary issues resulting in negative margins</p>
          </div>
          <div className="flex-1 min-h-0 mt-4">
            <ResponsiveContainer width="100%" height="95%">
              <BarChart layout="vertical" data={financialFactorsData} margin={{ top: 5, right: 30, left: 35, bottom: 5 }}>
                <XAxis type="number" stroke="#888888" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={9} width={90} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}% impact factor`]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                  {financialFactorsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Affected SKUs */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-3">TOP AFFECTED SKUs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-2">Revenue</th>
                <th className="py-2 px-2">Gross Margin</th>
                <th className="py-2 px-2">Net Margin</th>
                <th className="py-2 px-2">Margin Impact</th>
                <th className="py-2 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-400">
              {affectedSkus.map(row => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-extrabold text-zinc-900 dark:text-zinc-200">{row.name}</td>
                  <td className="py-2 px-2 font-mono">{row.rev}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.gross}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.net}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.impact}</td>
                  <td className="py-2 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-red-500/10 text-red-500 border border-red-500/10">
                      {row.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-3">RECOMMENDED ACTIONS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'DISCONTINUE', count: '45 SKUs', pct: '58% of affected', desc: 'High candidates for portfolio pruning', color: 'border-red-500/20 text-red-500 bg-red-500/5' },
            { label: 'REPOSITION', count: '18 SKUs', pct: '23% of affected', desc: 'Optimize regional pricing & distribution', color: 'border-amber-500/20 text-amber-500 bg-amber-500/5' },
            { label: 'CONSOLIDATE', count: '10 SKUs', pct: '13% of affected', desc: 'Merge with similar active high-margin items', color: 'border-blue-500/20 text-blue-500 bg-blue-500/5' },
            { label: 'INVEST / EXPAND', count: '5 SKUs', pct: '6% of affected', desc: 'Reformulate packaging to lower manufacturing friction', color: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' }
          ].map(c => (
            <div key={c.label} className={`border p-4 rounded flex flex-col justify-between h-[120px] ${c.color}`}>
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-wider">{c.label}</h4>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-xl font-black font-mono leading-none">{c.count}</span>
                  <span className="text-[8px] font-bold opacity-75">{c.pct}</span>
                </div>
                <p className="text-[8.5px] opacity-75 leading-tight font-semibold mt-1.5">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

// ==========================================
// 2. PORTFOLIO REASONS DRILL DOWN PAGE
// ==========================================

export const PortfolioDrillDown: React.FC<SubPageProps> = ({ onBack }) => {
  const breakdownData = [
    { name: 'SKU Proliferation', value: 42, color: '#ef4444' },
    { name: 'Cannibalization', value: 30, color: '#f97316' },
    { name: 'Portfolio Overlap', value: 18, color: '#f59e0b' },
    { name: 'Weak Strategic Fit', value: 10, color: '#3b82f6' }
  ];

  const affectedSkus = [
    { name: 'SKU-C001 (BrandC Chips)', rev: '$750K', growth: '12.1%', overlap: '45%', target: 'SKU-C002', action: 'Consolidate' },
    { name: 'SKU-C002 (BrandB Chips)', rev: '$620K', growth: '10.5%', overlap: '40%', target: 'SKU-C001', action: 'Consolidate' },
    { name: 'SKU-P001 (BrandD Soap)', rev: '$280K', growth: '3.2%', overlap: '35%', target: 'SKU-P002', action: 'Reposition' },
    { name: 'SKU-P002 (BrandB Soap)', rev: '$250K', growth: '2.4%', overlap: '30%', target: 'SKU-P001', action: 'Reposition' },
    { name: 'SKU-S001 (BrandE Cheese)', rev: '$180K', growth: '-1.5%', overlap: '15%', target: 'SKU-S002', action: 'Discontinue' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block">SKU RATIONALIZE / RATIONALE SUMMARY / PORTFOLIO REASONS</span>
          <h2 className="text-xl font-display leading-tight text-acies-gray dark:text-white font-bold mt-1">Portfolio Reasons Drill Down</h2>
          <p className="text-[9.5px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold mt-0.5">Drill down into strategic portfolio reasons</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-700 dark:text-zinc-300">
          <ArrowLeft size={12} />
          <span>Back to Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'AFFECTED SKUs', value: '56 SKUs', sub: '22% of portfolio' },
          { label: 'TOTAL IMPACT', value: '-$1.3M', sub: 'Calculated annual overlap' },
          { label: 'AFFECTED REVENUE', value: '$8.3M', sub: 'Combined overlap revenue' },
          { label: 'STRATEGIC ISSUES', value: '4 Issues', sub: 'Identified core friction' }
        ].map(m => (
          <div key={m.label} className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
            <span className="text-[8px] font-extrabold tracking-widest text-zinc-400 dark:text-zinc-500 block uppercase">{m.label}</span>
            <h3 className="text-2xl font-display font-black text-zinc-800 dark:text-zinc-100 mt-1">{m.value}</h3>
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-600 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">PORTFOLIO REASONS BREAKDOWN</h3>
          <div className="h-[200px] relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-display font-black">56</span>
              <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">SKUs</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={60} outerRadius={75} paddingAngle={2} dataKey="value">
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-zinc-500 dark:text-zinc-400">
            {breakdownData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">STRATEGIC ISSUES</h3>
          <div className="space-y-3">
            {[
              { title: 'High SKU Proliferation', desc: 'Too many active variants in snacks and dairy segments.', count: '42 SKUs' },
              { title: 'Cannibalization Risk', desc: 'Internal competitors driving down gross profit rates.', count: '30 SKUs' },
              { title: 'Portfolio Overlap', desc: 'Sub-brands overlapping key product ranges.', count: '18 SKUs' },
              { title: 'Weak Strategic Fit', desc: 'Out of scope products targeting declining audiences.', count: '6 SKUs' }
            ].map((issue, idx) => (
              <div key={issue.title} className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-2">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-900 dark:text-zinc-200">{issue.title}</h4>
                  <p className="text-[8.5px] text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed">{issue.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-3">TOP AFFECTED SKUs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-2">Revenue</th>
                <th className="py-2 px-2">Growth Rate</th>
                <th className="py-2 px-2">Revenue Overlap</th>
                <th className="py-2 px-2">Overlap SKU Target</th>
                <th className="py-2 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-400">
              {affectedSkus.map(row => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-extrabold text-zinc-900 dark:text-zinc-200">{row.name}</td>
                  <td className="py-2 px-2 font-mono">{row.rev}</td>
                  <td className="py-2 px-2 text-zinc-500 font-mono">{row.growth}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.overlap}</td>
                  <td className="py-2 px-2 text-zinc-500 font-bold">{row.target}</td>
                  <td className="py-2 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/10">
                      {row.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. SUPPLY CHAIN REASONS DRILL DOWN PAGE
// ==========================================

export const SupplyChainDrillDown: React.FC<SubPageProps> = ({ onBack }) => {
  const breakdownData = [
    { name: 'Inventory Ineff.', value: 40, color: '#3b82f6' },
    { name: 'Frequent Stockouts', value: 35, color: '#ef4444' },
    { name: 'Complex Mfg.', value: 15, color: '#f59e0b' },
    { name: 'High Supply Costs', value: 10, color: '#8b5cf6' }
  ];

  const affectedSkus = [
    { name: 'SKU-S001 (BrandC Biscuits)', rev: '$550K', stockout: '8.2%', cost: '$12K', lead: '14 Days', action: 'Consolidate' },
    { name: 'SKU-S002 (BrandF Soap)', rev: '$480K', stockout: '7.5%', cost: '$10K', lead: '14 Days', action: 'Consolidate' },
    { name: 'SKU-S003 (BrandB Energy Drink)', rev: '$420K', stockout: '6.8%', cost: '$9K', lead: '18 Days', action: 'Consolidate' },
    { name: 'SKU-S004 (BrandB Milk)', rev: '$380K', stockout: '5.9%', cost: '$8K', lead: '22 Days', action: 'Reformulate' },
    { name: 'SKU-S005 (BrandD Cheese)', rev: '$310K', stockout: '5.1%', cost: '$7K', lead: '16 Days', action: 'Reformulate' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block">SKU RATIONALIZE / RATIONALE SUMMARY / SUPPLY CHAIN REASONS</span>
          <h2 className="text-xl font-display leading-tight text-acies-gray dark:text-white font-bold mt-1">Supply Chain Reasons Drill Down</h2>
          <p className="text-[9.5px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold mt-0.5">Drill down into supply chain related issues</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-700 dark:text-zinc-300">
          <ArrowLeft size={12} />
          <span>Back to Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'AFFECTED SKUs', value: '42 SKUs', sub: '17% of portfolio' },
          { label: 'TOTAL IMPACT', value: '-$1.4M', sub: 'Annual holding & stockout cost' },
          { label: 'STOCKOUT IMPACT', value: '11%', sub: 'Avg service level drop' },
          { label: 'KEY ISSUES', value: '3 Issues', sub: 'Identified supply blocks' }
        ].map(m => (
          <div key={m.label} className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
            <span className="text-[8px] font-extrabold tracking-widest text-zinc-400 dark:text-zinc-500 block uppercase">{m.label}</span>
            <h3 className="text-2xl font-display font-black text-zinc-800 dark:text-zinc-100 mt-1">{m.value}</h3>
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-600 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">SUPPLY CHAIN REASONS BREAKDOWN</h3>
          <div className="h-[200px] relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-display font-black">42</span>
              <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">SKUs</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={60} outerRadius={75} paddingAngle={2} dataKey="value">
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-zinc-500 dark:text-zinc-400">
            {breakdownData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">KEY SUPPLY CHAIN ISSUES</h3>
          <div className="space-y-3">
            {[
              { title: 'Inventory Inefficiencies', desc: 'Slow inventory turns resulting in elevated carrying costs.', count: '40 SKUs' },
              { title: 'Frequent Stockouts', desc: 'Repeated supply interruptions driving down service levels.', count: '25 SKUs' },
              { title: 'Complex Manufacturing Requirements', desc: 'Products requiring specialized machinery or slow line adjustments.', count: '15 SKUs' },
              { title: 'High Supply Costs', desc: 'Friction points due to premium sourcing or import tariffs.', count: '10 SKUs' }
            ].map((issue) => (
              <div key={issue.title} className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-2">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-900 dark:text-zinc-200">{issue.title}</h4>
                  <p className="text-[8.5px] text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed">{issue.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-3">TOP AFFECTED SKUs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-2">Revenue</th>
                <th className="py-2 px-2">Stockout Frequency</th>
                <th className="py-2 px-2">Holding Cost</th>
                <th className="py-2 px-2">Lead Time</th>
                <th className="py-2 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-400">
              {affectedSkus.map(row => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-extrabold text-zinc-900 dark:text-zinc-200">{row.name}</td>
                  <td className="py-2 px-2 font-mono">{row.rev}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.stockout}</td>
                  <td className="py-2 px-2 text-zinc-500 font-mono">{row.cost}</td>
                  <td className="py-2 px-2 text-zinc-500 font-bold">{row.lead}</td>
                  <td className="py-2 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-blue-500/10 text-blue-500 border border-blue-500/10">
                      {row.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. CUSTOMER & MARKET REASONS DRILL DOWN PAGE
// ==========================================

export const CustomerMarketDrillDown: React.FC<SubPageProps> = ({ onBack }) => {
  const breakdownData = [
    { name: 'Competitive Dis.', value: 35, color: '#ef4444' },
    { name: 'Price Pressure', value: 30, color: '#f97316' },
    { name: 'Innovation Obs.', value: 20, color: '#f59e0b' },
    { name: 'Low Adoption', value: 15, color: '#3b82f6' }
  ];

  const affectedSkus = [
    { name: 'SKU-M001 (Premium Cold Brew)', rev: '$550K', growth: '6.1%', promoter: '45%', share: '12%', action: 'Consolidate' },
    { name: 'SKU-M002 (Premium Cola)', rev: '$480K', growth: '5.4%', promoter: '40%', share: '10%', action: 'Consolidate' },
    { name: 'SKU-M003 (Premium Juice)', rev: '$420K', growth: '4.2%', promoter: '35%', share: '8%', action: 'Reposition' },
    { name: 'SKU-M004 (premium tea)', rev: '$380K', growth: '3.1%', promoter: '30%', share: '7%', action: 'Reposition' },
    { name: 'SKU-M005 (premium soda)', rev: '$310K', growth: '2.4%', promoter: '15%', share: '4%', action: 'Discontinue' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block">SKU RATIONALIZE / RATIONALE SUMMARY / CUSTOMER & MARKET REASONS</span>
          <h2 className="text-xl font-display leading-tight text-acies-gray dark:text-white font-bold mt-1">Customer & Market Reasons Drill Down</h2>
          <p className="text-[9.5px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold mt-0.5">Drill down into customer and market related issues</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-700 dark:text-zinc-300">
          <ArrowLeft size={12} />
          <span>Back to Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'AFFECTED SKUs', value: '38 SKUs', sub: '15% of portfolio' },
          { label: 'TOTAL IMPACT', value: '-$1.1M', sub: 'Calculated annual market loss' },
          { label: 'AFFECTED REVENUE', value: '$4.2M', sub: 'Combined overlap revenue' },
          { label: 'MARKET ISSUES', value: '4 Issues', sub: 'Identified core friction' }
        ].map(m => (
          <div key={m.label} className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
            <span className="text-[8px] font-extrabold tracking-widest text-zinc-400 dark:text-zinc-500 block uppercase">{m.label}</span>
            <h3 className="text-2xl font-display font-black text-zinc-800 dark:text-zinc-100 mt-1">{m.value}</h3>
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-600 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">MARKET REASONS BREAKDOWN</h3>
          <div className="h-[200px] relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-display font-black">38</span>
              <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">SKUs</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={60} outerRadius={75} paddingAngle={2} dataKey="value">
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-zinc-500 dark:text-zinc-400">
            {breakdownData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">MARKET ISSUES</h3>
          <div className="space-y-3">
            {[
              { title: 'Competitive Disadvantage', desc: 'Underperforming key rival offerings in value and placement.', count: '22 SKUs' },
              { title: 'Price Pressure', desc: 'Demands for higher promotion rates cutting core margins.', count: '15 SKUs' },
              { title: 'Innovation Obsolescence', desc: 'Lagging behind on sustainable packaging and wellness trends.', count: '10 SKUs' },
              { title: 'Low Customer Adoption', desc: 'Low listing rates at major regional distributors.', count: '8 SKUs' }
            ].map((issue) => (
              <div key={issue.title} className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-2">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-900 dark:text-zinc-200">{issue.title}</h4>
                  <p className="text-[8.5px] text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed">{issue.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-3">TOP AFFECTED SKUs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-2">Revenue</th>
                <th className="py-2 px-2">Growth Rate</th>
                <th className="py-2 px-2">Net Promoter Score</th>
                <th className="py-2 px-2">Market Share</th>
                <th className="py-2 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-400">
              {affectedSkus.map(row => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-extrabold text-zinc-900 dark:text-zinc-200">{row.name}</td>
                  <td className="py-2 px-2 font-mono">{row.rev}</td>
                  <td className="py-2 px-2 text-zinc-500 font-mono">{row.growth}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.promoter}</td>
                  <td className="py-2 px-2 text-zinc-500 font-bold">{row.share}</td>
                  <td className="py-2 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/10">
                      {row.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. REGULATORY & RISK REASONS DRILL DOWN PAGE
// ==========================================

export const RegulatoryDrillDown: React.FC<SubPageProps> = ({ onBack }) => {
  const breakdownData = [
    { name: 'Regulatory Changes', value: 50, color: '#ef4444' },
    { name: 'Quality / Safety', value: 30, color: '#f97316' },
    { name: 'Sustainability', value: 20, color: '#10b981' }
  ];

  const affectedSkus = [
    { name: 'SKU-R001 (BrandF Soda)', rev: '$250K', gap: 'Regulatory Change', risk: '8.2', cost: '$45K', action: 'Discontinue' },
    { name: 'SKU-R002 (BrandA Chocolate)', rev: '$210K', gap: 'Regulatory Change', risk: '7.8', cost: '$40K', action: 'Discontinue' },
    { name: 'SKU-R003 (BrandD Water)', rev: '$180K', gap: 'Safety Issue', risk: '6.8', cost: '$35K', action: 'Discontinue' },
    { name: 'SKU-R004 (BrandE Water)', rev: '$150K', gap: 'Safety Issue', risk: '5.9', cost: '$25K', action: 'Reformulate' },
    { name: 'SKU-R005 (BrandB Yogurt)', rev: '$110K', gap: 'Sustainability Gap', risk: '5.1', cost: '$18K', action: 'Reformulate' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block">SKU RATIONALIZE / RATIONALE SUMMARY / REGULATORY & RISK REASONS</span>
          <h2 className="text-xl font-display leading-tight text-acies-gray dark:text-white font-bold mt-1">Regulatory & Risk Reasons Drill Down</h2>
          <p className="text-[9.5px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold mt-0.5">Drill down into regulatory and risk related issues</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-700 dark:text-zinc-300">
          <ArrowLeft size={12} />
          <span>Back to Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'AFFECTED SKUs', value: '24 SKUs', sub: '10% of portfolio' },
          { label: 'TOTAL IMPACT', value: '-$900K', sub: 'Calculated annual overlap risk' },
          { label: 'RISK DRIVERS', value: '3 Fields', sub: 'Identified risk fields' },
          { label: 'RISK LEVEL', value: 'High', sub: 'Immediate compliance gap' }
        ].map(m => (
          <div key={m.label} className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
            <span className="text-[8px] font-extrabold tracking-widest text-zinc-400 dark:text-zinc-500 block uppercase">{m.label}</span>
            <h3 className="text-2xl font-display font-black text-zinc-900 dark:text-zinc-100 mt-1">{m.value}</h3>
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-600 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">RISK REASONS BREAKDOWN</h3>
          <div className="h-[200px] relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-display font-black">24</span>
              <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">SKUs</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={60} outerRadius={75} paddingAngle={2} dataKey="value">
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-zinc-500 dark:text-zinc-400">
            {breakdownData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">RISK FACTORS</h3>
          <div className="space-y-3">
            {[
              { title: 'Regulatory Changes', desc: 'Failure to comply with upcoming regional carbon/plastic use taxes.', count: '12 SKUs' },
              { title: 'Quality / Safety Concerns', desc: 'Products flagged in audits requiring adjustment or recipe revision.', count: '8 SKUs' },
              { title: 'Sustainability Goals', desc: 'Items underperforming organizational green thresholds.', count: '4 SKUs' }
            ].map((issue) => (
              <div key={issue.title} className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-2">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-900 dark:text-zinc-200">{issue.title}</h4>
                  <p className="text-[8.5px] text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed">{issue.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-3">TOP AFFECTED SKUs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-2">Revenue</th>
                <th className="py-2 px-2">Regulation Gap</th>
                <th className="py-2 px-2">Risk Index</th>
                <th className="py-2 px-2">Compliance Cost</th>
                <th className="py-2 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-400">
              {affectedSkus.map(row => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-extrabold text-zinc-900 dark:text-zinc-200">{row.name}</td>
                  <td className="py-2 px-2 font-mono">{row.rev}</td>
                  <td className="py-2 px-2 text-zinc-600 font-bold">{row.gap}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.risk}</td>
                  <td className="py-2 px-2 text-zinc-500 font-bold">{row.cost}</td>
                  <td className="py-2 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-red-500/10 text-red-500 border border-red-500/10">
                      {row.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. RATIONALE SUMMARY DASHBOARD PAGE (6th screen)
// ==========================================

export const SummaryDashboardPage: React.FC<SubPageProps> = ({ onBack }) => {
  const summaryCategoryData = [
    { name: 'Low Profitability', value: 78, color: '#ef4444' },
    { name: 'Portfolio Reasons', value: 56, color: '#f97316' },
    { name: 'Supply Chain Reasons', value: 42, color: '#f59e0b' },
    { name: 'Customer & Market', value: 38, color: '#10b981' },
    { name: 'Regulatory & Risk', value: 18, color: '#8b5cf6' }
  ];

  const categoriesOverview = [
    { cat: 'Low Profitability', skus: 78, pct: '31%', impact: '-$2.5M', rev: '$24.6M', risk: 'High', color: 'text-red-500 bg-red-500/10' },
    { cat: 'Portfolio Reasons', skus: 56, pct: '22%', impact: '-$1.3M', rev: '$8.3M', risk: 'High', color: 'text-orange-500 bg-orange-500/10' },
    { cat: 'Supply Chain Reasons', skus: 42, pct: '17%', impact: '-$1.4M', rev: '$12.0M', risk: 'Medium', color: 'text-amber-500 bg-amber-500/10' },
    { cat: 'Customer & Market', skus: 38, pct: '15%', impact: '-$1.1M', rev: '$4.2M', risk: 'Medium', color: 'text-green-500 bg-green-500/10' },
    { cat: 'Regulatory & Risk', skus: 18, pct: '7%', impact: '-$900K', rev: '$3.5M', risk: 'Critical', color: 'text-purple-500 bg-purple-500/10' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block">SKU RATIONALIZE / RATIONALE SUMMARY / SUMMARY DASHBOARD</span>
          <h2 className="text-xl font-display leading-tight text-acies-gray dark:text-white font-bold mt-1">Rationale Summary Dashboard</h2>
          <p className="text-[9.5px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold mt-0.5">Overview of all rationale categories</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-700 dark:text-zinc-300">
          <ArrowLeft size={12} />
          <span>Back to Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL SKUs ANALYZED', value: '248 SKUs', sub: '100% Portfolio' },
          { label: 'TOTAL IMPACT', value: '-$5.8M', sub: 'Combined annual leakage' },
          { label: 'AFFECTED REVENUE', value: '$34.6M', sub: 'Revenue at Risk' },
          { label: 'PORTFOLIO COVERAGE', value: '100%', sub: 'Comprehensive checks' }
        ].map(m => (
          <div key={m.label} className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
            <span className="text-[8px] font-extrabold tracking-widest text-zinc-400 dark:text-zinc-500 block uppercase">{m.label}</span>
            <h3 className="text-2xl font-display font-black text-zinc-800 dark:text-zinc-100 mt-1">{m.value}</h3>
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-600 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Category Overview table (2 cols) */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm lg:col-span-2 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">RATIONALE CATEGORY OVERVIEW</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10.5px]">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-2">SKUs</th>
                  <th className="py-2 px-2">% of Portfolio</th>
                  <th className="py-2 px-2">Impact</th>
                  <th className="py-2 px-2">Affected Revenue</th>
                  <th className="py-2 px-3 text-right">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-400">
                {categoriesOverview.map(row => (
                  <tr key={row.cat}>
                    <td className="py-2.5 px-3 font-extrabold text-zinc-900 dark:text-zinc-200">{row.cat}</td>
                    <td className="py-2.5 px-2 font-mono">{row.skus}</td>
                    <td className="py-2.5 px-2 font-mono">{row.pct}</td>
                    <td className="py-2.5 px-2 text-red-500 font-mono">{row.impact}</td>
                    <td className="py-2.5 px-2 font-mono">{row.rev}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        row.risk === 'Critical' || row.risk === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/10' : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                      }`}>
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Pie chart (1 col) */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col justify-between h-[300px]">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">IMPACT BY CATEGORY</h3>
          </div>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summaryCategoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={2} dataKey="value">
                  {summaryCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} SKUs`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[8.5px] font-semibold text-zinc-500 dark:text-zinc-400">
            {summaryCategoryData.map(d => (
              <div key={d.name} className="flex items-center gap-1 truncate" title={d.name}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-3">RECOMMENDED NEXT STEPS</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Discontinue', value: '78 SKUs', color: 'border-red-500/10 text-red-500 bg-red-500/5' },
            { label: 'Reposition', value: '56 SKUs', color: 'border-orange-500/10 text-orange-500 bg-orange-500/5' },
            { label: 'Consolidate', value: '54 SKUs', color: 'border-amber-500/10 text-amber-500 bg-amber-500/5' },
            { label: 'Invest/Expand', value: '42 SKUs', color: 'border-emerald-500/10 text-emerald-500 bg-emerald-500/5' },
            { label: 'Reformulate', value: '72 SKUs', color: 'border-blue-500/10 text-blue-500 bg-blue-500/5' }
          ].map(s => (
            <div key={s.label} className={`border p-3 rounded text-center ${s.color}`}>
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest block opacity-75">{s.label}</span>
              <h4 className="text-xl font-display font-black mt-1 font-mono leading-none">{s.value}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
