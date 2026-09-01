import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, BarChart2, AlertTriangle, Check, RefreshCw, Search, Download, 
  HelpCircle, Eye, Trash2, Tag, Percent, Play, Settings, Compass, LayoutGrid, Frown, Shield, Box, ArrowLeft, ArrowRight, List,
  X, Lightbulb, ChevronRight, PieChart as LucidePieChart, Radar as LucideRadar
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, 
  ScatterChart, Scatter, CartesianGrid, ZAxis, ReferenceLine, 
  PieChart, Pie, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LabelList,
  Sector
} from 'recharts';

// --- SHARED DATA TYPES & CONSTANTS ---


const REASONS = [
  { category: 'LOW PROFITABILITY REASONS', count: 4, desc: 'Key factors identified', icon: TrendingDown, color: 'text-red-500 bg-red-500/10' },
  { category: 'PORTFOLIO REASONS', count: 4, desc: 'Strategic issues', icon: Compass, color: 'text-blue-500 bg-blue-500/10' },
  { category: 'SUPPLY CHAIN REASONS', count: 3, desc: 'Operational challenges', icon: Box, color: 'text-amber-500 bg-amber-500/10' },
  { category: 'CUSTOMER & MARKET REASONS', count: 5, desc: 'Market & customer issues', icon: Tag, color: 'text-purple-500 bg-purple-500/10' },
  { category: 'REGULATORY & RISK REASONS', count: 3, desc: 'Compliance & risk factors', icon: Shield, color: 'text-emerald-500 bg-emerald-500/10' }
];

const RATIONALE_DRIVERS = [
  { rank: 1, name: 'Financial', count: 90, pct: 29, color: '#ef4444' },
  { rank: 2, name: 'Portfolio', count: 55, pct: 18, color: '#3b82f6' },
  { rank: 3, name: 'Supply Chain', count: 65, pct: 21, color: '#f59e0b' },
  { rank: 4, name: 'Customer & Market', count: 50, pct: 16, color: '#a855f7' },
  { rank: 5, name: 'Regulatory & Risk', count: 50, pct: 16, color: '#10b981' }
];

const ACTION_RECOMMENDATIONS = [
  { 
    action: 'DISCONTINUE / CONSOLIDATE', 
    priority: 'High priority actions', 
    count: 78, 
    pct: 31, 
    desc: 'Criteria: Low profitability, declining sales, high operational costs, poor strategic fit.', 
    color: 'text-red-500 border-red-500/20 bg-red-500/5', 
    btnColor: 'bg-red-500 hover:bg-red-600 text-white',
    icon: Trash2
  },
  { 
    action: 'REPOSITION', 
    priority: 'Optimize and reposition', 
    count: 56, 
    pct: 22, 
    desc: 'Criteria: Good margins but declining adoption, market alignment needed.', 
    color: 'text-amber-500 border-amber-500/20 bg-amber-500/5', 
    btnColor: 'bg-amber-500 hover:bg-amber-600 text-white',
    icon: Compass
  },
  { 
    action: 'INVEST / EXPAND', 
    priority: 'High priority growth', 
    count: 42, 
    pct: 17, 
    desc: 'Criteria: High growth potential, good profitability, strategic importance.', 
    color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5', 
    btnColor: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    icon: Check
  },
  { 
    action: 'REFORMULATE / REDESIGN', 
    priority: 'Improve and optimize', 
    count: 72, 
    pct: 29, 
    desc: 'Criteria: Customer complaints, competitive gaps, compliance requirements.', 
    color: 'text-blue-500 border-blue-500/20 bg-blue-500/5', 
    btnColor: 'bg-blue-500 hover:bg-blue-600 text-white',
    icon: Settings
  }
];

const HEATMAP_DATA = [
  { x: 15, y: 75, name: 'BrandF Water', q: 'Quick Wins', color: '#10b981' },
  { x: 25, y: 80, name: 'BrandB Soap', q: 'Quick Wins', color: '#10b981' },
  { x: 35, y: 70, name: 'BrandD Toothpaste', q: 'Quick Wins', color: '#10b981' },
  { x: 20, y: 65, name: 'BrandC Diet Cola', q: 'Quick Wins', color: '#10b981' },
  { x: 65, y: 85, name: 'BrandC Chips', q: 'Strategic Projects', color: '#ef4444' },
  { x: 75, y: 75, name: 'BrandA Soda', q: 'Strategic Projects', color: '#ef4444' },
  { x: 85, y: 68, name: 'BrandD Chocolate', q: 'Strategic Projects', color: '#ef4444' },
  { x: 70, y: 72, name: 'BrandC Energy Drink', q: 'Strategic Projects', color: '#ef4444' },
  { x: 20, y: 30, name: 'BrandE Cheese', q: 'Fill-ins', color: '#3b82f6' },
  { x: 30, y: 25, name: 'BrandD Nuts', q: 'Fill-ins', color: '#3b82f6' },
  { x: 15, y: 38, name: 'BrandF Energy Drink', q: 'Fill-ins', color: '#3b82f6' },
  { x: 38, y: 28, name: 'BrandB Chocolate', q: 'Fill-ins', color: '#3b82f6' },
  { x: 68, y: 35, name: 'BrandF Soda', q: 'Low Priority', color: '#f59e0b' },
  { x: 78, y: 28, name: 'BrandA Chocolate', q: 'Low Priority', color: '#f59e0b' },
  { x: 88, y: 22, name: 'BrandD Water', q: 'Low Priority', color: '#f59e0b' },
  { x: 72, y: 18, name: 'BrandE Water', q: 'Low Priority', color: '#f59e0b' },
  { x: 82, y: 31, name: 'BrandB Yogurt', q: 'Low Priority', color: '#f59e0b' }
];

const EXPLORER_ROWS = (() => {
  const getProductCategory = (pName: string): string => {
    const name = pName.toLowerCase();
    if (
      name.includes('cola') || name.includes('soda') || name.includes('orange') || 
      name.includes('lemonade') || name.includes('water') || name.includes('energy') || 
      name.includes('protein') || name.includes('coffee') || name.includes('milk')
    ) {
      return 'Beverages';
    }
    if (
      name.includes('yogurt') || name.includes('cheese') || name.includes('butter') || 
      name.includes('cream') || name.includes('ice') || name.includes('chips') || 
      name.includes('pretzels') || name.includes('popcorn') || name.includes('chocolate')
    ) {
      return 'Snacks';
    }
    if (
      name.includes('soap') || name.includes('wash') || name.includes('shampoo') || 
      name.includes('conditioner') || name.includes('toothpaste')
    ) {
      return 'Personal Care';
    }
    if (
      name.includes('detergent') || name.includes('softener') || name.includes('dishwashing') || 
      name.includes('spray') || name.includes('bleach')
    ) {
      return 'Household';
    }
    return 'Beverages';
  };

  const categories = [
    { factor: 'Low Profitability', cat: 'Financial Reasons', desc: 'Consistency low margins below target threshold', impact: 'High', action: 'Discontinue / Consolidate', priority: 'Critical' },
    { factor: 'Declining Sales', cat: 'Financial Reasons', desc: 'Sales declining for 3+ consecutive quarters', impact: 'High', action: 'Reposition', priority: 'High' },
    { factor: 'SKU Proliferation', cat: 'Portfolio Reasons', desc: 'Too many similar SKUs causing complexity', impact: 'Medium', action: 'Consolidate', priority: 'High' },
    { factor: 'Cannibalization', cat: 'Portfolio Reasons', desc: 'SKUs cannibalizing each other\'s sales', impact: 'High', action: 'Consolidate', priority: 'High' },
    { factor: 'Inventory Inefficiency', cat: 'Supply Chain Reasons', desc: 'High inventory holding costs, low turns', impact: 'Medium', action: 'Reformulate / Redesign', priority: 'Medium' },
    { factor: 'Customer Complaints', cat: 'Customer & Market', desc: 'High customer complaint rate', impact: 'Medium', action: 'Reformulate / Redesign', priority: 'Medium' },
    { factor: 'Competitive Disadvantage', cat: 'Customer & Market', desc: 'Falling behind competitors on key factors', impact: 'High', action: 'Reformulate / Redesign', priority: 'High' },
    { factor: 'Regulatory Changes', cat: 'Regulatory & Risk', desc: 'New regulations affecting product viability', impact: 'High', action: 'Discontinue', priority: 'Critical' }
  ];

  const brands = ['BrandA', 'BrandB', 'BrandC', 'BrandD', 'BrandE', 'BrandF'];
  const products = [
    'Cola 500ml', 'Cola 1.5L', 'Diet Soda 500ml', 'Orange Drink', 'Lemonade 1L',
    'Water 500ml', 'Water 1.5L', 'Energy Drink', 'Protein Shake', 'Cold Brew Coffee',
    'Yogurt Strawberry', 'Yogurt Blueberry', 'Greek Yogurt 500g', 'Cheddar Cheese 200g', 'Butter 250g',
    'Chips Salted', 'Chips Barbecue', 'Pretzels 150g', 'Popcorn Butter', 'Chocolate Bar 100g',
    'Milk 1L', 'Milk 2L', 'Sour Cream 250ml', 'Cream Cheese 200g', 'Ice Cream Vanilla',
    'Soap Soap', 'Body Wash 250ml', 'Shampoo 400ml', 'Conditioner 400ml', 'Toothpaste 100ml',
    'Detergent Liquid 1L', 'Fabric Softener 1L', 'Dishwashing Liquid 500ml', 'Multi-Purpose Spray', 'Bleach 1L'
  ];

  const list = [];
  let count = 0;
  for (let b = 0; b < brands.length; b++) {
    for (let p = 0; p < products.length; p++) {
      if (count >= 200) break;
      const skuName = `${brands[b]} ${products[p]}`;
      const factorObj = categories[count % categories.length];
      list.push({
        sku: skuName,
        productCat: getProductCategory(products[p]),
        factor: factorObj.factor,
        cat: factorObj.cat,
        desc: factorObj.desc,
        impact: factorObj.impact,
        action: factorObj.action,
        priority: factorObj.priority
      });
      count++;
    }
    if (count >= 200) break;
  }
  return list;
})();

const SUMMARY_KPIS = [
  { label: 'Total Rationale Factors', value: '22', subtitle: 'Identified' },
  { label: 'Critical Issues', value: '12', subtitle: 'High Priority' },
  { label: 'Total SKUs Affected', value: '252', subtitle: '100% Portfolio' },
  { label: 'Potential Value Impact', value: '$38.2M', subtitle: 'Revenue at Risk' },
  { label: 'Implementation Effort', value: 'Medium', subtitle: 'Overall Level' },
  { label: 'Success Probability', value: '78%', subtitle: 'Estimated' }
];

interface SubPageProps {
  onBack: () => void;
}

// ==========================================
// 1. LOW PROFITABILITY DRILL DOWN PAGE
// ==========================================
const FinancialDrillDown: React.FC<SubPageProps> = ({ onBack }) => {
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
          <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold mt-0.5">Drill down into SKUs impacted due to low profitability</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-650 dark:text-zinc-300">
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
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Profitability overview + margin distribution */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">PROFITABILITY OVERVIEW</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/5 border border-red-500/10 p-3 rounded text-center">
              <span className="text-[8px] font-bold text-zinc-450 dark:text-zinc-500 block uppercase">AVG GROSS MARGIN</span>
              <h4 className="text-xl font-display font-black text-red-500 mt-0.5">-3.2%</h4>
              <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-550 block">Target: +40%</span>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 p-3 rounded text-center">
              <span className="text-[8px] font-bold text-zinc-450 dark:text-zinc-500 block uppercase">AVG NET MARGIN</span>
              <h4 className="text-xl font-display font-black text-red-500 mt-0.5">-5.1%</h4>
              <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-550 block">Target: +15%</span>
            </div>
          </div>

          <div className="border-t border-black/5 dark:border-white/5 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200 mb-2">MARGIN DISTRIBUTION</h3>
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
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">KEY FACTORS DRIVING LOW PROFITABILITY</h3>
            <p className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold mt-0.5">Primary issues resulting in negative margins</p>
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
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200 mb-3">TOP AFFECTED SKUs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-2">Revenue</th>
                <th className="py-2 px-2">Gross Margin</th>
                <th className="py-2 px-2">Net Margin</th>
                <th className="py-2 px-2">Margin Impact</th>
                <th className="py-2 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-350">
              {affectedSkus.map(row => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-extrabold text-zinc-850 dark:text-zinc-200">{row.name}</td>
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
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200 mb-3">RECOMMENDED ACTIONS</h3>
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
const PortfolioDrillDown: React.FC<SubPageProps> = ({ onBack }) => {
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
          <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold mt-0.5">Drill down into strategic portfolio reasons</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-650 dark:text-zinc-300">
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
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">PORTFOLIO REASONS BREAKDOWN</h3>
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
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">STRATEGIC ISSUES</h3>
          <div className="space-y-3">
            {[
              { title: 'High SKU Proliferation', desc: 'Too many active variants in snacks and dairy segments.', count: '42 SKUs' },
              { title: 'Cannibalization Risk', desc: 'Internal competitors driving down gross profit rates.', count: '30 SKUs' },
              { title: 'Portfolio Overlap', desc: 'Sub-brands overlapping key product ranges.', count: '18 SKUs' },
              { title: 'Weak Strategic Fit', desc: 'Out of scope products targeting declining audiences.', count: '6 SKUs' }
            ].map((issue, idx) => (
              <div key={issue.title} className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-2">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-850 dark:text-zinc-200">{issue.title}</h4>
                  <p className="text-[8.5px] text-zinc-450 dark:text-zinc-500 font-medium leading-relaxed">{issue.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200 mb-3">TOP AFFECTED SKUs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-2">Revenue</th>
                <th className="py-2 px-2">Growth Rate</th>
                <th className="py-2 px-2">Revenue Overlap</th>
                <th className="py-2 px-2">Overlap SKU Target</th>
                <th className="py-2 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-350">
              {affectedSkus.map(row => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-extrabold text-zinc-855 dark:text-zinc-200">{row.name}</td>
                  <td className="py-2 px-2 font-mono">{row.rev}</td>
                  <td className="py-2 px-2 text-zinc-500 font-mono">{row.growth}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.overlap}</td>
                  <td className="py-2 px-2 text-zinc-450 font-bold">{row.target}</td>
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
const SupplyChainDrillDown: React.FC<SubPageProps> = ({ onBack }) => {
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
          <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold mt-0.5">Drill down into supply chain related issues</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-650 dark:text-zinc-300">
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
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">SUPPLY CHAIN REASONS BREAKDOWN</h3>
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
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">KEY SUPPLY CHAIN ISSUES</h3>
          <div className="space-y-3">
            {[
              { title: 'Inventory Inefficiencies', desc: 'Slow inventory turns resulting in elevated carrying costs.', count: '40 SKUs' },
              { title: 'Frequent Stockouts', desc: 'Repeated supply interruptions driving down service levels.', count: '25 SKUs' },
              { title: 'Complex Manufacturing Requirements', desc: 'Products requiring specialized machinery or slow line adjustments.', count: '15 SKUs' },
              { title: 'High Supply Costs', desc: 'Friction points due to premium sourcing or import tariffs.', count: '10 SKUs' }
            ].map((issue) => (
              <div key={issue.title} className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-2">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-850 dark:text-zinc-200">{issue.title}</h4>
                  <p className="text-[8.5px] text-zinc-450 dark:text-zinc-500 font-medium leading-relaxed">{issue.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200 mb-3">TOP AFFECTED SKUs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-2">Revenue</th>
                <th className="py-2 px-2">Stockout Frequency</th>
                <th className="py-2 px-2">Holding Cost</th>
                <th className="py-2 px-2">Lead Time</th>
                <th className="py-2 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-350">
              {affectedSkus.map(row => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-extrabold text-zinc-855 dark:text-zinc-200">{row.name}</td>
                  <td className="py-2 px-2 font-mono">{row.rev}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.stockout}</td>
                  <td className="py-2 px-2 text-zinc-500 font-mono">{row.cost}</td>
                  <td className="py-2 px-2 text-zinc-450 font-bold">{row.lead}</td>
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
const CustomerMarketDrillDown: React.FC<SubPageProps> = ({ onBack }) => {
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
          <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold mt-0.5">Drill down into customer and market related issues</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-650 dark:text-zinc-300">
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
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">MARKET REASONS BREAKDOWN</h3>
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
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">MARKET ISSUES</h3>
          <div className="space-y-3">
            {[
              { title: 'Competitive Disadvantage', desc: 'Underperforming key rival offerings in value and placement.', count: '22 SKUs' },
              { title: 'Price Pressure', desc: 'Demands for higher promotion rates cutting core margins.', count: '15 SKUs' },
              { title: 'Innovation Obsolescence', desc: 'Lagging behind on sustainable packaging and wellness trends.', count: '10 SKUs' },
              { title: 'Low Customer Adoption', desc: 'Low listing rates at major regional distributors.', count: '8 SKUs' }
            ].map((issue) => (
              <div key={issue.title} className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-2">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-850 dark:text-zinc-200">{issue.title}</h4>
                  <p className="text-[8.5px] text-zinc-450 dark:text-zinc-500 font-medium leading-relaxed">{issue.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200 mb-3">TOP AFFECTED SKUs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-2">Revenue</th>
                <th className="py-2 px-2">Growth Rate</th>
                <th className="py-2 px-2">Net Promoter Score</th>
                <th className="py-2 px-2">Market Share</th>
                <th className="py-2 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-350">
              {affectedSkus.map(row => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-extrabold text-zinc-855 dark:text-zinc-200">{row.name}</td>
                  <td className="py-2 px-2 font-mono">{row.rev}</td>
                  <td className="py-2 px-2 text-zinc-500 font-mono">{row.growth}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.promoter}</td>
                  <td className="py-2 px-2 text-zinc-450 font-bold">{row.share}</td>
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
const RegulatoryDrillDown: React.FC<SubPageProps> = ({ onBack }) => {
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
          <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold mt-0.5">Drill down into regulatory and risk related issues</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-650 dark:text-zinc-300">
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
            <h3 className="text-2xl font-display font-black text-zinc-850 dark:text-zinc-100 mt-1">{m.value}</h3>
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">RISK REASONS BREAKDOWN</h3>
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
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">RISK FACTORS</h3>
          <div className="space-y-3">
            {[
              { title: 'Regulatory Changes', desc: 'Failure to comply with upcoming regional carbon/plastic use taxes.', count: '12 SKUs' },
              { title: 'Quality / Safety Concerns', desc: 'Products flagged in audits requiring adjustment or recipe revision.', count: '8 SKUs' },
              { title: 'Sustainability Goals', desc: 'Items underperforming organizational green thresholds.', count: '4 SKUs' }
            ].map((issue) => (
              <div key={issue.title} className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-2">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-855 dark:text-zinc-200">{issue.title}</h4>
                  <p className="text-[8.5px] text-zinc-450 dark:text-zinc-500 font-medium leading-relaxed">{issue.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-855 dark:text-zinc-200 mb-3">TOP AFFECTED SKUs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-2">Revenue</th>
                <th className="py-2 px-2">Regulation Gap</th>
                <th className="py-2 px-2">Risk Index</th>
                <th className="py-2 px-2">Compliance Cost</th>
                <th className="py-2 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-350">
              {affectedSkus.map(row => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-extrabold text-zinc-855 dark:text-zinc-200">{row.name}</td>
                  <td className="py-2 px-2 font-mono">{row.rev}</td>
                  <td className="py-2 px-2 text-zinc-550 font-bold">{row.gap}</td>
                  <td className="py-2 px-2 text-red-500 font-mono">{row.risk}</td>
                  <td className="py-2 px-2 text-zinc-450 font-bold">{row.cost}</td>
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
const SummaryDashboardPage: React.FC<SubPageProps> = ({ onBack }) => {
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
          <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold mt-0.5">Overview of all rationale categories</p>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9.5px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer bg-transparent text-zinc-650 dark:text-zinc-300">
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
            <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 block mt-0.5 uppercase">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Category Overview table (2 cols) */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm lg:col-span-2 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">RATIONALE CATEGORY OVERVIEW</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10.5px]">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-450 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-2">SKUs</th>
                  <th className="py-2 px-2">% of Portfolio</th>
                  <th className="py-2 px-2">Impact</th>
                  <th className="py-2 px-2">Affected Revenue</th>
                  <th className="py-2 px-3 text-right">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-350">
                {categoriesOverview.map(row => (
                  <tr key={row.cat}>
                    <td className="py-2.5 px-3 font-extrabold text-zinc-855 dark:text-zinc-200">{row.cat}</td>
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
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200">IMPACT BY CATEGORY</h3>
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
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-850 dark:text-zinc-200 mb-3">RECOMMENDED NEXT STEPS</h3>
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

interface RoadmapPhaseData {
  title: string;
  step: string;
  skusCount: number;
  revenue: string;
  action: string;
  categories: { name: string; count: number; color: string }[];
  regions: { name: string; count: number; color: string }[];
  stages: { name: string; count: number; color: string }[];
  insights: string[];
  skus: {
    sku: string;
    code: string;
    category: string;
    region: string;
    revenue: string;
    margin: string;
    growth: string;
    growthColor: string;
    stage: string;
    action: string;
  }[];
}

const ROADMAP_PHASES_DETAILS: Record<string, RoadmapPhaseData> = {
  q1: {
    title: 'Discontinue / Consolidate',
    step: 'Q1 - Step 1',
    skusCount: 78,
    revenue: '$23.4M',
    action: 'Discontinue / Consolidate',
    categories: [
      { name: 'Snacks & Beverages', count: 29, color: 'bg-indigo-500' },
      { name: 'Home & Living', count: 15, color: 'bg-emerald-500' },
      { name: 'Apparel & Accessories', count: 12, color: 'bg-amber-500' },
      { name: 'Personal Care', count: 10, color: 'bg-blue-500' },
      { name: 'Family & Pet Care', count: 8, color: 'bg-red-500' },
      { name: 'Home Care', count: 4, color: 'bg-teal-500' }
    ],
    regions: [
      { name: 'LATAM', count: 24, color: 'bg-indigo-500' },
      { name: 'North America', count: 22, color: 'bg-emerald-500' },
      { name: 'Europe', count: 18, color: 'bg-amber-500' },
      { name: 'APAC', count: 14, color: 'bg-blue-500' }
    ],
    stages: [
      { name: 'Maturity', count: 55, color: 'bg-indigo-500' },
      { name: 'Growth', count: 18, color: 'bg-emerald-500' },
      { name: 'Decline', count: 5, color: 'bg-amber-500' }
    ],
    insights: [
      '37% of affected SKUs sit in Snacks & Beverages — the largest concentration, suggesting a category-level review rather than one-off fixes.',
      'Average margin is 12.4%, below the portfolio average of 20.7% by 8.3 pts.',
      'Average YoY growth is -6.8%, behind the portfolio average (-4.2%).',
      'Customer satisfaction averages 52/100 vs a portfolio average of 69, and LATAM carries the largest regional share (24 SKUs).',
      'Combined annualized revenue exposure across these SKUs is $23.4M.'
    ],
    skus: [
      { sku: 'Sparkling Water Lime', code: 'SKU-1022', category: 'Snacks & Beverages', region: 'LATAM', revenue: '$480K', margin: '10.2%', growth: '-7.5%', growthColor: 'text-red-500', stage: 'Decline', action: 'Discontinue / Consolidate' },
      { sku: 'Premium Office Chair', code: 'SKU-1144', category: 'Home & Living', region: 'North America', revenue: '$450K', margin: '11.8%', growth: '-8.9%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Discontinue / Consolidate' },
      { sku: 'Cotton Socks Pack', code: 'SKU-1077', category: 'Apparel & Accessories', region: 'Europe', revenue: '$410K', margin: '9.4%', growth: '-5.2%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Discontinue / Consolidate' },
      { sku: 'Hydrating Shaving Gel', code: 'SKU-1188', category: 'Personal Care', region: 'APAC', revenue: '$390K', margin: '12.0%', growth: '-4.1%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Discontinue / Consolidate' },
      { sku: 'Organic Dog Treats', code: 'SKU-1201', category: 'Family & Pet Care', region: 'LATAM', revenue: '$380K', margin: '13.5%', growth: '-6.0%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Discontinue / Consolidate' },
      { sku: 'Lemon Dish Soap', code: 'SKU-1212', category: 'Home Care', region: 'North America', revenue: '$350K', margin: '8.5%', growth: '-9.1%', growthColor: 'text-red-500', stage: 'Decline', action: 'Discontinue / Consolidate' }
    ]
  },
  q2: {
    title: 'Reposition',
    step: 'Q2 - Step 2',
    skusCount: 56,
    revenue: '$16.4M',
    action: 'Reposition',
    categories: [
      { name: 'Snacks & Beverages', count: 22, color: 'bg-indigo-500' },
      { name: 'Home & Living', count: 11, color: 'bg-emerald-500' },
      { name: 'Apparel & Accessories', count: 8, color: 'bg-amber-500' },
      { name: 'Personal Care', count: 7, color: 'bg-blue-500' },
      { name: 'Family & Pet Care', count: 5, color: 'bg-red-500' },
      { name: 'Home Care', count: 3, color: 'bg-teal-500' }
    ],
    regions: [
      { name: 'LATAM', count: 18, color: 'bg-indigo-500' },
      { name: 'North America', count: 16, color: 'bg-emerald-500' },
      { name: 'Europe', count: 12, color: 'bg-amber-500' },
      { name: 'APAC', count: 10, color: 'bg-blue-500' }
    ],
    stages: [
      { name: 'Maturity', count: 40, color: 'bg-indigo-500' },
      { name: 'Growth', count: 12, color: 'bg-emerald-500' },
      { name: 'Decline', count: 4, color: 'bg-amber-500' }
    ],
    insights: [
      '39% of affected SKUs sit in Snacks & Beverages — the largest concentration, suggesting a category-level review rather than one-off fixes.',
      'Average margin is 18.2%, below the portfolio average of 20.7% by 2.5 pts.',
      'Average YoY growth is 2.1%, ahead of the portfolio average (-4.2%).',
      'Customer satisfaction averages 61/100 vs a portfolio average of 69, and LATAM carries the largest regional share (18 SKUs).',
      'Combined annualized revenue exposure across these SKUs is $16.4M.'
    ],
    skus: [
      { sku: 'Diet Orange Soda', code: 'SKU-1045', category: 'Snacks & Beverages', region: 'LATAM', revenue: '$420K', margin: '18.5%', growth: '+1.5%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reposition' },
      { sku: 'Ergonomic Seat Cushion', code: 'SKU-1120', category: 'Home & Living', region: 'North America', revenue: '$380K', margin: '17.4%', growth: '+2.1%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Reposition' },
      { sku: 'Running Cap Pro', code: 'SKU-1090', category: 'Apparel & Accessories', region: 'Europe', revenue: '$340K', margin: '19.0%', growth: '+3.4%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reposition' },
      { sku: 'Aloe Vera Lotion', code: 'SKU-1160', category: 'Personal Care', region: 'APAC', revenue: '$310K', margin: '16.5%', growth: '+1.8%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Reposition' },
      { sku: 'Premium Cat Kibble', code: 'SKU-1205', category: 'Family & Pet Care', region: 'LATAM', revenue: '$290K', margin: '20.1%', growth: '+2.5%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reposition' }
    ]
  },
  q3: {
    title: 'Reformulate / Redesign',
    step: 'Q3 - Step 3',
    skusCount: 72,
    revenue: '$21.1M',
    action: 'Reformulate / Redesign',
    categories: [
      { name: 'Snacks & Beverages', count: 27, color: 'bg-[#4f46e5]' },
      { name: 'Home & Living', count: 13, color: 'bg-[#10b981]' },
      { name: 'Apparel & Accessories', count: 10, color: 'bg-[#f59e0b]' },
      { name: 'Personal Care', count: 9, color: 'bg-[#3b82f6]' },
      { name: 'Family & Pet Care', count: 7, color: 'bg-[#ef4444]' },
      { name: 'Home Care', count: 6, color: 'bg-[#0d9488]' }
    ],
    regions: [
      { name: 'LATAM', count: 21, color: 'bg-[#4f46e5]' },
      { name: 'North America', count: 21, color: 'bg-[#10b981]' },
      { name: 'Europe', count: 17, color: 'bg-[#f59e0b]' },
      { name: 'APAC', count: 13, color: 'bg-[#3b82f6]' }
    ],
    stages: [
      { name: 'Maturity', count: 51, color: 'bg-[#4f46e5]' },
      { name: 'Growth', count: 19, color: 'bg-[#10b981]' },
      { name: 'Decline', count: 2, color: 'bg-[#f59e0b]' }
    ],
    insights: [
      '38% of affected SKUs sit in Snacks & Beverages — the largest concentration, suggesting a category-level review rather than one-off fixes.',
      'Average margin is 20.6%, below the portfolio average of 20.7% by 0.2 pts.',
      'Average YoY growth is 4.5%, ahead of the portfolio average (-4.2%).',
      'Customer satisfaction averages 66/100 vs a portfolio average of 69, and LATAM carries the largest regional share (21 SKUs).',
      'Combined annualized revenue exposure across these SKUs is $21.1M.'
    ],
    skus: [
      { sku: 'Cedar & Co Energy Drink Classic', code: 'SKU-1049', category: 'Snacks & Beverages', region: 'LATAM', revenue: '$507K', margin: '32.2%', growth: '+4.7%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Meridian Phone Charger Sport', code: 'SKU-1129', category: 'Apparel & Accessories', region: 'North America', revenue: '$506K', margin: '4.8%', growth: '+3.6%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Foundry Yoga Mat Max', code: 'SKU-1119', category: 'Home & Living', region: 'LATAM', revenue: '$498K', margin: '34.5%', growth: '-5.9%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Everline Ice Cream Tub Lite', code: 'SKU-1003', category: 'Snacks & Beverages', region: 'LATAM', revenue: '$495K', margin: '15.7%', growth: '-5.6%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Everline Conditioner Sensitive', code: 'SKU-1152', category: 'Personal Care', region: 'APAC', revenue: '$471K', margin: '19.9%', growth: '+18.2%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Reformulate / Redesign' },
      { sku: 'Foundry Coffee Pods Classic', code: 'SKU-1055', category: 'Snacks & Beverages', region: 'North America', revenue: '$467K', margin: '21.9%', growth: '-0.3%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Crestview Cotton T-Shirt Family Pack', code: 'SKU-1097', category: 'Apparel & Accessories', region: 'Europe', revenue: '$456K', margin: '6.7%', growth: '+5.7%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Northwind Notebook Set Family Pack', code: 'SKU-1193', category: 'Home & Living', region: 'LATAM', revenue: '$455K', margin: '21.6%', growth: '-2.1%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Reformulate / Redesign' }
    ]
  },
  q4: {
    title: 'Invest / Expand',
    step: 'Q4 - Step 4',
    skusCount: 42,
    revenue: '$12.8M',
    action: 'Invest / Expand',
    categories: [
      { name: 'Snacks & Beverages', count: 16, color: 'bg-indigo-500' },
      { name: 'Home & Living', count: 8, color: 'bg-emerald-500' },
      { name: 'Apparel & Accessories', count: 6, color: 'bg-amber-500' },
      { name: 'Personal Care', count: 5, color: 'bg-blue-500' },
      { name: 'Family & Pet Care', count: 4, color: 'bg-red-500' },
      { name: 'Home Care', count: 3, color: 'bg-teal-500' }
    ],
    regions: [
      { name: 'LATAM', count: 13, color: 'bg-indigo-500' },
      { name: 'North America', count: 12, color: 'bg-emerald-500' },
      { name: 'Europe', count: 10, color: 'bg-amber-500' },
      { name: 'APAC', count: 7, color: 'bg-blue-500' }
    ],
    stages: [
      { name: 'Maturity', count: 28, color: 'bg-indigo-500' },
      { name: 'Growth', count: 12, color: 'bg-emerald-500' },
      { name: 'Decline', count: 2, color: 'bg-amber-500' }
    ],
    insights: [
      '38% of affected SKUs sit in Snacks & Beverages — the largest concentration, suggesting a category-level review rather than one-off fixes.',
      'Average margin is 26.5%, ahead of the portfolio average of 20.7% by 5.8 pts.',
      'Average YoY growth is 14.8%, ahead of the portfolio average (-4.2%).',
      'Customer satisfaction averages 78/100 vs a portfolio average of 69, and LATAM carries the largest regional share (13 SKUs).',
      'Combined annualized revenue exposure across these SKUs is $12.8M.'
    ],
    skus: [
      { sku: 'BrandA Cola 500ml', code: 'SKU-1001', category: 'Snacks & Beverages', region: 'LATAM', revenue: '$650K', margin: '28.5%', growth: '+12.4%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Invest / Expand' },
      { sku: 'Ultra Light Sleeping Pad', code: 'SKU-1110', category: 'Home & Living', region: 'North America', revenue: '$520K', margin: '27.4%', growth: '+10.9%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Invest / Expand' },
      { sku: 'Waterproof Running Jacket', code: 'SKU-1080', category: 'Apparel & Accessories', region: 'Europe', revenue: '$480K', margin: '25.8%', growth: '+15.2%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Invest / Expand' },
      { sku: 'Gentle Cleansing Foam', code: 'SKU-1150', category: 'Personal Care', region: 'APAC', revenue: '$420K', margin: '29.0%', growth: '+11.5%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Invest / Expand' },
      { sku: 'Eco-Friendly Laundry Pods', code: 'SKU-1210', category: 'Home Care', region: 'North America', revenue: '$380K', margin: '24.5%', growth: '+9.8%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Invest / Expand' }
    ]
  }
};

const CustomHeatmapTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1e293b]/95 border border-white/10 px-3 py-2 rounded shadow-lg text-left select-none pointer-events-none text-white text-[9.5px] font-semibold">
        {data.q} : {data.name}
      </div>
    );
  }
  return null;
};

const getRcaDetails = (sku: string, factor: string) => {
  const normFactor = factor.toLowerCase();
  if (normFactor.includes('margin') || normFactor.includes('profit') || normFactor.includes('supply')) {
    return {
      summary: 'Unit margins have dropped below the 20% strategic target due to rising commodity costs and high promotional support.',
      rootCauses: [
        { title: 'Material Cost Inflation', desc: 'Raw material procurement costs for this product category have risen by 14.5% YoY.' },
        { title: 'Promotional Dilution', desc: 'Average promotional discount depth of 38% with a low volume lift ratio (1.12x).' },
        { title: 'Manufacturing Overhead', desc: 'Short production runs result in high changeover times, increasing manufacturing overhead by 8.2% per unit.' }
      ],
      metrics: [
        { label: 'Gross Margin', value: '11.4%', target: '25.0%', status: 'Critical' },
        { label: 'Promo Spend', value: '$84K', target: '< $50K', status: 'Warning' },
        { label: 'COGS % of Rev', value: '72.3%', target: '< 60.0%', status: 'Critical' }
      ],
      recommendations: 'Shift SKU to Consolidated regional manufacturing; reduce promotional frequency by 50% and implement a price correction.',
      perks: [
        { metric: 'Gross Margin %', current: '11.4%', future: '26.2%', delta: '+14.8pt (+1480 bps)', isPositive: true },
        { metric: 'Annualized COGS', current: '$3.59M', future: '$3.08M', delta: '-$510K (-14.2%)', isPositive: true },
        { metric: 'Working Capital locked', current: '$1.20M', future: '$150K', delta: '-$1.05M (-87.5%)', isPositive: true },
        { metric: 'Promotional ROI', current: '1.12x', future: '1.85x', delta: '+0.73x (+65.2%)', isPositive: true }
      ]
    };
  } else if (normFactor.includes('sales') || normFactor.includes('decline')) {
    return {
      summary: 'Volume sales have consistently declined for three consecutive quarters, indicating market saturation or shifting consumer preferences.',
      rootCauses: [
        { title: 'Consumer Trend Shift', desc: 'Market-wide migration towards healthier, sugar-free, or eco-friendly alternatives in this segment.' },
        { title: 'Shelf Space Reduction', desc: 'Lost primary eye-level shelf space at major retail partners in favor of competitor store brands.' },
        { title: 'Price Elasticity Pressure', desc: 'Competitor price cuts have made this SKU 15% more expensive than direct substitutes without clear differentiation.' }
      ],
      metrics: [
        { label: 'Sales Growth (QoQ)', value: '-18.5%', target: '> +2.0%', status: 'Critical' },
        { label: 'Retailer Penetration', value: '42.0%', target: '> 60.0%', status: 'Warning' },
        { label: 'Brand Health Score', value: '64 / 100', target: '80 / 100', status: 'Warning' }
      ],
      recommendations: 'Reposition the brand with natural ingredients or repackage into multi-packs to improve volume sales and reclaim retail shelf-space.',
      perks: [
        { metric: 'Volume Sales Growth', current: '-18.5%', future: '+4.2%', delta: '+22.7pt', isPositive: true },
        { metric: 'Retailer Shelf Penetration', current: '42.0%', future: '78.0%', delta: '+36.0pt', isPositive: true },
        { metric: 'Annualized Revenue', current: '$2.15M', future: '$2.80M', delta: '+$650K (+30.2%)', isPositive: true },
        { metric: 'Brand Health Index', current: '64/100', future: '85/100', delta: '+21 points', isPositive: true }
      ]
    };
  } else if (normFactor.includes('overlap') || normFactor.includes('proliferation') || normFactor.includes('cannibalization')) {
    return {
      summary: 'High portfolio overlap and similarity with core items, leading to operational complexity and warehouse footprint wastage.',
      rootCauses: [
        { title: 'Flavor/Size Redundant', desc: 'This SKU sits between two high-volume variants, adding minimal incremental category volume.' },
        { title: 'Distribution Inefficient', desc: 'Low velocity leads to slow warehouse turnover, occupying high-cost picking slots.' },
        { title: 'Retailer Confusion', desc: 'Retailers are refusing to list the entire range, causing fragmented distribution patterns.' }
      ],
      metrics: [
        { label: 'Incremental Volume', value: '2.4%', target: '> 10.0%', status: 'Critical' },
        { label: 'Stock Turns / Year', value: '4.2x', target: '> 12.0x', status: 'Critical' },
        { label: 'Distribution SKU Count', value: '248', target: '200 Max', status: 'Warning' }
      ],
      recommendations: 'Consolidate the SKU into the core brand variant. Delist this specific pack size and transition existing retail contracts to the main product line.',
      perks: [
        { metric: 'Incremental Category Vol', current: '2.4%', future: '12.8%', delta: '+10.4pt', isPositive: true },
        { metric: 'Annual Stock Turns', current: '4.2x', future: '14.5x', delta: '+10.3x (+245%)', isPositive: true },
        { metric: 'Changeover Overhead Cost', current: '$140K', future: '$35K', delta: '-$105K (-75.0%)', isPositive: true },
        { metric: 'Shelf Space Efficiency', current: '48%', future: '92%', delta: '+44pt', isPositive: true }
      ]
    };
  } else {
    // Regulatory or fallback
    return {
      summary: 'Pending chemical tax regulation changes will inflate surfactant packaging COGS by 18%, causing negative gross margin.',
      rootCauses: [
        { title: 'Regulatory COGS Surge', desc: 'Pending chemical tax regulation changes will inflate packaging surfactant COGS by 18%.' },
        { title: 'Formula Compliance', desc: 'Current ingredient formula contains surfactants that face outright ban in major sales regions.' },
        { title: 'Eco-Friendly Gap', desc: 'Lack of compliant compostable packaging alternatives in the current sourcing catalog.' }
      ],
      metrics: [
        { label: 'Compliance Index', value: 'Non-Compliant', target: 'Compliant', status: 'Critical' },
        { label: 'Transition Cost Est.', value: '$180K', target: '< $50K', status: 'Critical' },
        { label: 'Time to Ban Deadline', value: '85 Days', target: '> 180 Days', status: 'Warning' }
      ],
      recommendations: 'Discontinue the current packaging model immediately and transition to the compostable eco-friendly design to ensure compliance.',
      perks: [
        { metric: 'Compliance Index Status', current: 'Non-Compliant', future: '100% Compliant', delta: 'Resolved', isPositive: true },
        { metric: 'Surfactant Chemical Tax', current: '$180K/yr', future: '$0/yr', delta: '-$180K (-100%)', isPositive: true },
        { metric: 'Eco-Preference Lift', current: 'Neutral', future: '+18.0%', delta: '+18.0% Volume', isPositive: true },
        { metric: 'Container COGS Premium', current: '$0.34/unit', future: '$0.38/unit', delta: '+$0.04 (+11.7%)', isPositive: false }
      ]
    };
  }
};

const MarginWaterfallChart: React.FC = () => {
  return (
    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm">
      <h5 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-500 mb-4">Margin Bridge (% of Revenue)</h5>
      <div className="relative w-full h-[180px] font-semibold text-[8px] sm:text-[9px] text-zinc-400">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-zinc-500">
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
        </div>
        <div className="absolute inset-0 flex justify-between px-2 pt-2">
          <div className="flex flex-col items-center justify-end h-full w-[15%]">
            <div className="w-full bg-zinc-500 dark:bg-zinc-600 rounded-t-xs h-[90%] flex items-center justify-center text-white font-bold text-[9px]">20.0%</div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-450">Target Margin</span>
          </div>
          <div className="flex flex-col items-center justify-end h-full w-[18%]">
            <div className="w-full h-full relative">
              <div className="absolute w-full bg-red-500 rounded-xs flex items-center justify-center text-white font-bold text-[8.5px]" style={{ bottom: '81%', height: '9%' }}>
                -2.0%
              </div>
            </div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-450">Material Cost</span>
          </div>
          <div className="flex flex-col items-center justify-end h-full w-[18%]">
            <div className="w-full h-full relative">
              <div className="absolute w-full bg-red-500 rounded-xs flex items-center justify-center text-white font-bold text-[8.5px]" style={{ bottom: '70.2%', height: '10.8%' }}>
                -2.4%
              </div>
            </div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-450">Promo Dilution</span>
          </div>
          <div className="flex flex-col items-center justify-end h-full w-[18%]">
            <div className="w-full h-full relative">
              <div className="absolute w-full bg-red-500 rounded-xs flex items-center justify-center text-white font-bold text-[8.5px]" style={{ bottom: '65.7%', height: '4.5%' }}>
                -1.0%
              </div>
            </div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-450">Mfg Overhead</span>
          </div>
          <div className="flex flex-col items-center justify-end h-full w-[15%]">
            <div className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-xs h-[65.7%] flex items-center justify-center text-white font-bold text-[9px]">14.6%</div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-450">Actual Margin</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4 border-t border-black/5 dark:border-white/5 pt-2 text-[8px] font-black uppercase tracking-wider text-zinc-450">
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

const SkuCategoryBenchmarks: React.FC<{ skuName: string, category: string }> = ({ skuName, category }) => {
  return (
    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm space-y-4 text-left">
      <h5 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-500 leading-tight">
        {skuName} vs. {category.toLowerCase()} category
      </h5>
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-[10.5px]">
            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Material cost inflation</span>
            <span className="font-mono font-black text-red-500">+14.5% YoY</span>
          </div>
          <div className="relative h-2 w-full bg-black/15 dark:bg-white/10 rounded-full overflow-visible">
            <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full" style={{ width: '72.5%' }} />
            <div className="absolute top-[-4px] h-4 w-[2px] bg-white border border-black/40 dark:border-white/60" style={{ left: '49%' }} />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-zinc-450 uppercase">
            <span>this SKU: 14.5%</span>
            <span>category avg: 9.8%</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-[10.5px]">
            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Promotional lift ratio</span>
            <span className="font-mono font-black text-red-500">1.12x (rank 21/24)</span>
          </div>
          <div className="relative h-2 w-full bg-black/15 dark:bg-white/10 rounded-full overflow-visible">
            <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full" style={{ width: '15%' }} />
            <div className="absolute top-[-4px] h-4 w-[2px] bg-white border border-black/40 dark:border-white/60" style={{ left: '50%' }} />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-zinc-450 uppercase">
            <span>this SKU: 1.12x</span>
            <span>category median: 1.70x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Previously a second, narrower `Task` interface was declared here while the
// tracker used its own. Both fed the same `trackerTasks` state, so the two
// shapes could disagree silently. Use the canonical model instead.
import type { Task } from './trackerTasks';

const generateTasksForSku = (skuName: string, action: string, factor: string): Record<string, Task[]> => {
  const normAction = (action || '').toLowerCase();
  const timestamp = Date.now();

  const generated: Record<string, Task[]> = {};

  if (normAction.includes('sunset') || normAction.includes('discontinue') || normAction.includes('rationalise') || normAction.includes('remove') || normAction.includes('rationalize')) {
    generated.pmo = [
      { id: `pmo-auto-${timestamp}-1`, tags: ['Scope'], title: `Coordinate sunset checklist & transition for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.procurement = [
      { id: `pro-auto-${timestamp}-1`, tags: ['Analysis'], title: `Negotiate contract termination & raw materials write-off for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
    generated.finance = [
      { id: `fin-auto-${timestamp}-1`, tags: ['Analysis'], title: `Calculate final margin write-off savings & tax implications for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.consumer = [
      { id: `con-auto-${timestamp}-1`, tags: ['Scope'], title: `Draft customer substitution & delisting notice for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['AM'], isNew: true, createdAt: timestamp }
    ];
  } else if (normAction.includes('consolidate') || normAction.includes('merge')) {
    generated.pmo = [
      { id: `pmo-auto-${timestamp}-1`, tags: ['Scope'], title: `Manage consolidation timeline & retail transition for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.rd = [
      { id: `rd-auto-${timestamp}-1`, tags: ['Design'], title: `Draft SKU merge specifications & revised bill of materials for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
    generated.marketing = [
      { id: `mkt-auto-${timestamp}-1`, tags: ['Design'], title: `Execute packaging rebranding & shelf slot transition mockups for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.sales = [
      { id: `sls-auto-${timestamp}-1`, tags: ['Development'], title: `Update price list sheets & retail inventory links for consolidated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['AM'], isNew: true, createdAt: timestamp }
    ];
  } else {
    generated.rd = [
      { id: `rd-auto-${timestamp}-1`, tags: ['Development'], title: `Develop ingredient substitution prototypes for ${skuName} cost savings`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
    generated.qa = [
      { id: `qa-auto-${timestamp}-1`, tags: ['Testing'], title: `Execute formula stability testing & check compliance files for reformulated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['AM'], isNew: true, createdAt: timestamp }
    ];
    generated.procurement = [
      { id: `pro-auto-${timestamp}-1`, tags: ['Development'], title: `Source new raw material vendor agreements for reformulated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.sustainability = [
      { id: `sus-auto-${timestamp}-1`, tags: ['Analysis'], title: `Conduct packaging recyclability lifecycle assessment for reformulated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
  }
  return generated;
};

const renderActiveShape = (props: any) => {
  const { cx, cy, startAngle, endAngle, innerRadius, outerRadius, fill } = props;
  const RADIAN = Math.PI / 180;
  const midAngle = (startAngle + endAngle) / 2;
  const explodeOffset = 8;
  const dx = explodeOffset * Math.cos(-midAngle * RADIAN);
  const dy = explodeOffset * Math.sin(-midAngle * RADIAN);
  return (
    <g>
      <Sector
        cx={cx + dx}
        cy={cy + dy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#ffffff"
        strokeWidth={2}
      />
    </g>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
interface RationalisationTabProps {
  setActiveTab?: (tabId: number) => void;
  setSelectedRoadmapPhaseFilter?: (action: string) => void;
  setSkuDrilldownSearchQuery?: (search: string) => void;
  tasks?: Record<string, Task[]>;
  setTasks?: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
}

export const RationalisationTab: React.FC<RationalisationTabProps> = ({ 
  setActiveTab, 
  setSelectedRoadmapPhaseFilter,
  setSkuDrilldownSearchQuery,
  tasks,
  setTasks
}) => {
  const [activeDrillDown, setActiveDrillDown] = useState<string | null>(null);
  const [activeCenterPath, setActiveCenterPath] = useState<string>('DISCONTINUE / CONSOLIDATE');
  const [impactViewMode, setImpactViewMode] = useState<'bar' | 'donut' | 'spider'>('spider');
  const [selectedRoadmapPhase, setSelectedRoadmapPhase] = useState<string | null>(null);
  const [roadmapSearchQuery, setRoadmapSearchQuery] = useState('');
  const [riskViewMode, setRiskViewMode] = useState<'line' | 'grid'>('line');
  const [selectedRiskForAnalysis, setSelectedRiskForAnalysis] = useState<any>(null);

  const CRITICAL_ALERTS = useMemo(() => [
    {
      sku: 'BrandA Cola 500ml',
      riskScore: '98%',
      factor: 'Margin Leak',
      desc: 'Unit margins fell below 11.4% (vs 25.0% target) driven by commodity inflation.',
      action: 'Discontinue',
      productCat: 'Beverages'
    },
    {
      sku: 'BrandC Greek Yogurt 500g',
      riskScore: '94%',
      factor: 'Overlap',
      desc: 'Severe overlap (85% correlation) cannibalizing core line. Generating changeover overheads.',
      action: 'Consolidate',
      productCat: 'Dairy'
    },
    {
      sku: 'BrandF Shampoo 400ml',
      riskScore: '89%',
      factor: 'Regulatory',
      desc: 'Pending chemical tax regulation changes will inflate surfactant packaging COGS by 18%.',
      action: 'Reformulate',
      productCat: 'Personal Care'
    },
    {
      sku: 'BrandB Chips Barbecue',
      riskScore: '85%',
      factor: 'Declining Sales',
      desc: 'Volume sales decreased by 22% over consecutive quarters indicating consumer shift.',
      action: 'Reposition',
      productCat: 'Snacks'
    },
    {
      sku: 'BrandD Multi-Purpose Spray',
      riskScore: '81%',
      factor: 'Supply Chain',
      desc: 'Out of stock rate reached 34% due to local container import disruptions.',
      action: 'Reformulate',
      productCat: 'Household'
    },
    {
      sku: 'BrandE Milk 2L',
      riskScore: '78%',
      factor: 'Low Profitability',
      desc: 'High logistics refrigeration costs are eating away regional distribution margins.',
      action: 'Consolidate',
      productCat: 'Dairy'
    }
  ], []);

  const handlePhaseClick = (phase: string) => {
    if (setSelectedRoadmapPhaseFilter && setActiveTab) {
      let actionVal = 'All';
      if (phase === 'q1') actionVal = 'Discontinue';
      if (phase === 'q2') actionVal = 'Reformulate';
      if (phase === 'q3') actionVal = 'Reposition';
      if (phase === 'q4') actionVal = 'Invest';
      
      setSelectedRoadmapPhaseFilter(actionVal);
      setActiveTab(10); // Navigate to SKU Drill Down tab!
    } else {
      setSelectedRoadmapPhase(phase);
    }
  };


  // Drill down routing logic
  if (activeDrillDown === 'financial') {
    return <FinancialDrillDown onBack={() => setActiveDrillDown(null)} />;
  }
  if (activeDrillDown === 'portfolio') {
    return <PortfolioDrillDown onBack={() => setActiveDrillDown(null)} />;
  }
  if (activeDrillDown === 'supply_chain') {
    return <SupplyChainDrillDown onBack={() => setActiveDrillDown(null)} />;
  }
  if (activeDrillDown === 'customer_market') {
    return <CustomerMarketDrillDown onBack={() => setActiveDrillDown(null)} />;
  }
  if (activeDrillDown === 'regulatory') {
    return <RegulatoryDrillDown onBack={() => setActiveDrillDown(null)} />;
  }
  if (activeDrillDown === 'summary_dashboard') {
    return <SummaryDashboardPage onBack={() => setActiveDrillDown(null)} />;
  }



  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">

      <div className="space-y-3.5">
        {/* Quick Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 p-2 rounded-sm shadow-sm text-[9px] font-bold uppercase tracking-wider">
        <span className="text-zinc-400 dark:text-zinc-500 mr-2 uppercase tracking-widest text-[8px]">Quick Jump:</span>
        <button 
          onClick={() => {
            const el = document.getElementById('rat-factors');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-350 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          📊 Rationale Factors
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => {
            const el = document.getElementById('rat-roadmap');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-350 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          ⚡ Phased Rollout Roadmap
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => {
            const el = document.getElementById('rat-ai-recs');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          🎯 AI Recommendations
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => {
            const el = document.getElementById('rat-breakdown');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          📈 Rationale Breakdown
        </button>
      </div>

      {/* Rationale Summary by Category (Interactive Deep Dive List) */}
      <div id="rat-factors" className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3 rounded-sm flex flex-col gap-2.5">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-855 dark:text-zinc-200">RATIONALE FACTORS</h3>
          <p className="text-[8px] text-zinc-455 dark:text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">Overview of key rationalization factors with Deep Dive controls</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border-t border-black/5 dark:border-white/5 pt-3">
          {/* Financial Reasons KPI Card */}
          <button 
            onClick={() => setActiveDrillDown('financial')}
            className="neumorphic-soft-card p-3 rounded-xl flex flex-col justify-between h-[105px] hover:border-emerald-500/30 dark:hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full group relative overflow-hidden outline-none"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Financial Reasons
              </span>
              <span className="p-1 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-450">
                <Percent size={14} />
              </span>
            </div>
            <div className="my-1">
              <h4 className="text-[22px] font-display font-black text-zinc-855 dark:text-zinc-100 leading-none">
                4
              </h4>
              <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                Identified Factors
              </p>
            </div>
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7.5px] font-black uppercase text-emerald-600 dark:text-emerald-450 tracking-wider">
              <span>Deep Dive</span>
              <ChevronRight size={8} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Portfolio Reasons KPI Card */}
          <button 
            onClick={() => setActiveDrillDown('portfolio')}
            className="neumorphic-soft-card p-3 rounded-xl flex flex-col justify-between h-[105px] hover:border-red-500/30 dark:hover:border-red-500/40 hover:bg-red-500/[0.02] dark:hover:bg-red-500/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full group relative overflow-hidden outline-none"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-all pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Portfolio Reasons
              </span>
              <span className="p-1 rounded bg-red-500/10 text-red-500 dark:text-red-450">
                <LayoutGrid size={14} />
              </span>
            </div>
            <div className="my-1">
              <h4 className="text-[22px] font-display font-black text-zinc-855 dark:text-zinc-100 leading-none">
                4
              </h4>
              <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                Identified Factors
              </p>
            </div>
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7.5px] font-black uppercase text-red-600 dark:text-red-450 tracking-wider">
              <span>Deep Dive</span>
              <ChevronRight size={8} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Supply Chain KPI Card */}
          <button 
            onClick={() => setActiveDrillDown('supply_chain')}
            className="neumorphic-soft-card p-3 rounded-xl flex flex-col justify-between h-[105px] hover:border-blue-500/30 dark:hover:border-blue-500/40 hover:bg-blue-500/[0.02] dark:hover:bg-blue-500/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full group relative overflow-hidden outline-none"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Supply Chain
              </span>
              <span className="p-1 rounded bg-blue-500/10 text-blue-500 dark:text-blue-450">
                <Box size={14} />
              </span>
            </div>
            <div className="my-1">
              <h4 className="text-[22px] font-display font-black text-zinc-855 dark:text-zinc-100 leading-none">
                3
              </h4>
              <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                Identified Factors
              </p>
            </div>
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7.5px] font-black uppercase text-blue-600 dark:text-blue-450 tracking-wider">
              <span>Deep Dive</span>
              <ChevronRight size={8} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Customer/Market KPI Card */}
          <button 
            onClick={() => setActiveDrillDown('customer_market')}
            className="neumorphic-soft-card p-3 rounded-xl flex flex-col justify-between h-[105px] hover:border-amber-500/30 dark:hover:border-amber-500/40 hover:bg-amber-500/[0.02] dark:hover:bg-amber-500/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full group relative overflow-hidden outline-none"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Customer/Market
              </span>
              <span className="p-1 rounded bg-amber-500/10 text-amber-500 dark:text-amber-450">
                <Compass size={14} />
              </span>
            </div>
            <div className="my-1">
              <h4 className="text-[22px] font-display font-black text-zinc-855 dark:text-zinc-100 leading-none">
                5
              </h4>
              <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                Identified Factors
              </p>
            </div>
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7.5px] font-black uppercase text-amber-600 dark:text-amber-450 tracking-wider">
              <span>Deep Dive</span>
              <ChevronRight size={8} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Regulatory/Risk KPI Card */}
          <button 
            onClick={() => setActiveDrillDown('regulatory')}
            className="neumorphic-soft-card p-3 rounded-xl flex flex-col justify-between h-[105px] hover:border-purple-500/30 dark:hover:border-purple-500/40 hover:bg-purple-500/[0.02] dark:hover:bg-purple-500/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full group relative overflow-hidden outline-none"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Regulatory/Risk
              </span>
              <span className="p-1 rounded bg-purple-500/10 text-purple-500 dark:text-purple-450">
                <Shield size={14} />
              </span>
            </div>
            <div className="my-1">
              <h4 className="text-[22px] font-display font-black text-zinc-855 dark:text-zinc-100 leading-none">
                3
              </h4>
              <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                Identified Factors
              </p>
            </div>
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7.5px] font-black uppercase text-purple-600 dark:text-purple-450 tracking-wider">
              <span>Deep Dive</span>
              <ChevronRight size={8} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>


      {/* Phased Rollout Roadmap */}
      <div id="rat-roadmap" className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-sm flex flex-col gap-4">
        <div className="flex items-start gap-2 border-l-2 border-indigo-600 pl-3 text-left">
          <div>
            <h3 className="text-[10px] font-black text-zinc-900 dark:text-white font-display uppercase tracking-wider">Phased Rollout Roadmap</h3>
            <p className="text-[8px] text-zinc-455 dark:text-zinc-500 mt-0.5 uppercase tracking-wide font-bold">A realistic sequencing of the recommended actions — what to execute first, second, third, and fourth</p>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="w-full h-8 rounded-full overflow-hidden flex font-display text-[9px] font-black text-white select-none">
          {/* Q1: 78 SKUs (approx 31.45% width) */}
          <div 
            onClick={() => handlePhaseClick('q1')}
            className="bg-[#ef4444] h-full flex items-center justify-center transition-all hover:brightness-105 active:scale-95 cursor-pointer" 
            style={{ width: '31.45%' }}
            title="Click to view Q1 Phased Rollout Details"
          >
            <span>Q1 · 78</span>
          </div>
          {/* Q2: 56 SKUs (approx 22.58% width) */}
          <div 
            onClick={() => handlePhaseClick('q2')}
            className="bg-[#f59e0b] h-full flex items-center justify-center transition-all hover:brightness-105 active:scale-95 cursor-pointer" 
            style={{ width: '22.58%' }}
            title="Click to view Q2 Phased Rollout Details"
          >
            <span>Q2 · 56</span>
          </div>
          {/* Q3: 72 SKUs (approx 29.03% width) */}
          <div 
            onClick={() => handlePhaseClick('q3')}
            className="bg-[#3b82f6] h-full flex items-center justify-center transition-all hover:brightness-105 active:scale-95 cursor-pointer" 
            style={{ width: '29.03%' }}
            title="Click to view Q3 Phased Rollout Details"
          >
            <span>Q3 · 72</span>
          </div>
          {/* Q4: 42 SKUs (approx 16.94% width) */}
          <div 
            onClick={() => handlePhaseClick('q4')}
            className="bg-[#10b981] h-full flex items-center justify-center transition-all hover:brightness-105 active:scale-95 cursor-pointer" 
            style={{ width: '16.94%' }}
            title="Click to view Q4 Phased Rollout Details"
          >
            <span>Q4 · 42</span>
          </div>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-1 text-left">
          {/* Card 1 */}
          <div 
            onClick={() => handlePhaseClick('q1')}
            className="border border-black/5 dark:border-white/5 rounded-sm p-4 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col gap-3 relative pt-6 hover:border-indigo-500/30 dark:hover:border-indigo-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all hover:shadow-sm"
          >
            <span className="absolute top-2 left-4 px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black tracking-widest uppercase rounded-full">
              Q1 - Step 1
            </span>
            <div className="space-y-0.5">
              <h4 className="text-[11.5px] font-extrabold text-[#ef4444]">Discontinue / Consolidate</h4>
              <span className="text-[9px] font-semibold text-zinc-400 uppercase">78 SKUs · $23.4M revenue involved</span>
            </div>
            <div className="bg-black/2 dark:bg-white/2 p-3 rounded text-[10px] text-zinc-555 dark:text-zinc-450 leading-relaxed font-medium">
              Fastest to execute and lowest risk to start with — stop the bleeding on low-profitability SKUs before investing effort elsewhere.
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => handlePhaseClick('q2')}
            className="border border-black/5 dark:border-white/5 rounded-sm p-4 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col gap-3 relative pt-6 hover:border-indigo-500/30 dark:hover:border-indigo-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all hover:shadow-sm"
          >
            <span className="absolute top-2 left-4 px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black tracking-widest uppercase rounded-full">
              Q2 - Step 2
            </span>
            <div className="space-y-0.5">
              <h4 className="text-[11.5px] font-extrabold text-[#f59e0b]">Reformulate / Margin Improvement</h4>
              <span className="text-[9px] font-semibold text-zinc-400 uppercase">56 SKUs · $16.8M revenue involved</span>
            </div>
            <div className="bg-black/2 dark:bg-white/2 p-3 rounded text-[10px] text-zinc-555 dark:text-zinc-450 leading-relaxed font-medium">
              High margin leakage but reformulating recipes or renegotiating contracts takes 3-6 months. Plan early, execute in phase 2.
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => handlePhaseClick('q3')}
            className="border border-black/5 dark:border-white/5 rounded-sm p-4 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col gap-3 relative pt-6 hover:border-indigo-500/30 dark:hover:border-indigo-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all hover:shadow-sm"
          >
            <span className="absolute top-2 left-4 px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black tracking-widest uppercase rounded-full">
              Q3 - Step 3
            </span>
            <div className="space-y-0.5">
              <h4 className="text-[11.5px] font-extrabold text-[#3b82f6]">Renegotiate / Price Adjust</h4>
              <span className="text-[9px] font-semibold text-zinc-400 uppercase">72 SKUs · $21.6M revenue involved</span>
            </div>
            <div className="bg-black/2 dark:bg-white/2 p-3 rounded text-[10px] text-zinc-555 dark:text-zinc-450 leading-relaxed font-medium">
              Requires careful negotiation or customer communication; execute once baseline margin improvement is secured.
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => handlePhaseClick('q4')}
            className="border border-black/5 dark:border-white/5 rounded-sm p-4 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col gap-3 relative pt-6 hover:border-indigo-500/30 dark:hover:border-indigo-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all hover:shadow-sm"
          >
            <span className="absolute top-2 left-4 px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black tracking-widest uppercase rounded-full">
              Q4 - Step 4
            </span>
            <div className="space-y-0.5">
              <h4 className="text-[11.5px] font-extrabold text-[#10b981]">Invest / Expand</h4>
              <span className="text-[9px] font-semibold text-zinc-450 dark:text-zinc-500 uppercase">42 SKUs · $12.8M revenue involved</span>
            </div>
            <div className="bg-black/2 dark:bg-white/2 p-3 rounded text-[10px] text-zinc-555 dark:text-zinc-450 leading-relaxed font-medium">
              Scale up once capacity, budget, and attention freed from the earlier phases can be redirected to winners.
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Row 2: Rationale Impact Analysis & SKU Action Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: AI Recommendations & Immediate Actions (1 col span) */}
        <div id="rat-ai-recs" className="glass-card bg-gradient-to-br from-red-500/[0.02] to-indigo-500/[0.02] dark:from-red-500/[0.04] dark:to-indigo-500/[0.04] border border-red-500/10 dark:border-red-500/20 p-4 rounded-sm flex flex-col justify-between h-[480px] lg:col-span-1">
          <div>
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <div className="flex items-start gap-1.5 border-l-2 border-red-500 pl-2 text-left">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[10px] font-black text-zinc-900 dark:text-white font-display uppercase tracking-wider">AI Recommendations</h3>
                  </div>
                  <p className="text-[7.5px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold">Immediate operational intervention</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Toggle selector */}
                <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/10 dark:border-white/10 gap-0.5">
                  <button
                    onClick={() => setRiskViewMode('line')}
                    className={`p-1 rounded transition-all cursor-pointer border-none flex items-center justify-center ${
                      riskViewMode === 'line'
                        ? 'bg-white dark:bg-acies-gray shadow-sm text-zinc-855 dark:text-white font-bold'
                        : 'text-zinc-450 hover:text-zinc-655 dark:hover:text-zinc-350 bg-transparent'
                    }`}
                    title="Line View"
                  >
                    <List size={10} />
                  </button>
                  <button
                    onClick={() => setRiskViewMode('grid')}
                    className={`p-1 rounded transition-all cursor-pointer border-none flex items-center justify-center ${
                      riskViewMode === 'grid'
                        ? 'bg-white dark:bg-acies-gray shadow-sm text-zinc-855 dark:text-white font-bold'
                        : 'text-zinc-450 hover:text-zinc-655 dark:hover:text-zinc-350 bg-transparent'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={10} />
                  </button>
                </div>

                <span className="px-1.5 py-0.5 bg-red-500/10 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-500/20 rounded text-[7.5px] font-black tracking-widest uppercase">
                  6 Critical
                </span>
              </div>
            </div>

            {/* List / Grid Stack of Cards */}
            <div className={`overflow-y-auto max-h-[385px] pr-1.5 mt-3 ${
              riskViewMode === 'grid' ? 'grid grid-cols-2 gap-2.5' : 'flex flex-col gap-2.5'
            }`}>
              {CRITICAL_ALERTS.map((alert, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 rounded-sm p-2.5 flex flex-col justify-between text-left hover:border-red-500/25 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[7px] font-extrabold uppercase bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 leading-none">
                        {alert.riskScore} Risk
                      </span>
                      <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        {alert.factor}
                      </span>
                    </div>
                    <h4 className="text-[9.5px] font-extrabold text-zinc-850 dark:text-zinc-200 truncate" title={alert.sku}>
                      {alert.sku}
                    </h4>
                    <p className="text-[8.5px] text-zinc-450 dark:text-zinc-500 leading-normal mt-0.5 font-medium line-clamp-2" title={alert.desc}>
                      {alert.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between mt-1.5">
                    <span className="text-[7.5px] font-black uppercase text-red-600 dark:text-red-400">
                      {alert.action}
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedRiskForAnalysis(alert);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[9.5px] font-extrabold uppercase tracking-wider cursor-pointer border-none shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <span>Analyze</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Rationale Impact Analysis (1 col span) */}
        <div id="rat-breakdown" className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col justify-between h-[480px] lg:col-span-1">
          <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-855 dark:text-zinc-200">
                {impactViewMode === 'bar' ? 'RATIONALE IMPACT ANALYSIS' : 'RATIONALE BREAKDOWN'}
              </h3>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">
                {impactViewMode === 'bar' 
                  ? 'Distribution of SKUs by primary rationalization reason' 
                  : 'Distribution across primary rationale fields'}
              </p>
            </div>
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10 shrink-0 gap-1">
              <button
                onClick={() => setImpactViewMode('bar')}
                className={`p-2 rounded-lg transition-all cursor-pointer border-none flex items-center justify-center ${
                  impactViewMode === 'bar'
                    ? 'bg-white dark:bg-acies-gray shadow-sm text-zinc-855 dark:text-white font-bold'
                    : 'text-zinc-450 hover:text-zinc-655 dark:hover:text-zinc-350 bg-transparent'
                }`}
                title="Bar Chart"
              >
                <BarChart2 size={16} />
              </button>
              <button
                onClick={() => setImpactViewMode('donut')}
                className={`p-2 rounded-lg transition-all cursor-pointer border-none flex items-center justify-center ${
                  impactViewMode === 'donut'
                    ? 'bg-white dark:bg-acies-gray shadow-sm text-zinc-855 dark:text-white font-bold'
                    : 'text-zinc-450 hover:text-zinc-655 dark:hover:text-zinc-350 bg-transparent'
                }`}
                title="Donut Chart"
              >
                <LucidePieChart size={16} />
              </button>
              <button
                onClick={() => setImpactViewMode('spider')}
                className={`p-2 rounded-lg transition-all cursor-pointer border-none flex items-center justify-center ${
                  impactViewMode === 'spider'
                    ? 'bg-white dark:bg-acies-gray shadow-sm text-zinc-855 dark:text-white font-bold'
                    : 'text-zinc-450 hover:text-zinc-655 dark:hover:text-zinc-350 bg-transparent'
                }`}
                title="Radar Chart"
              >
                <LucideRadar size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 mt-4 relative flex flex-col justify-between">
            {impactViewMode === 'bar' && (
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="95%">
                    <BarChart
                      data={RATIONALE_DRIVERS}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        stroke="currentColor" 
                        fontSize={8} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: 'currentColor', opacity: 0.6 }}
                      />
                      <YAxis 
                        stroke="currentColor" 
                        fontSize={8} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: 'currentColor', opacity: 0.6 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', color: '#fff', fontSize: '9.5px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={30}>
                        {RATIONALE_DRIVERS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[8.5px] font-semibold text-zinc-500 dark:text-zinc-400 mt-2 pb-1">
                  {RATIONALE_DRIVERS.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 justify-center truncate" title={d.name}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="truncate">{d.name} ({d.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {impactViewMode === 'donut' && (
              <div className="w-full h-full flex flex-row items-center justify-around gap-4 p-2">
                {/* Left: Donut Chart */}
                <div className="flex-1 flex items-center justify-center min-w-0">
                  <div className="w-[200px] h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {/* `activeIndex` was removed from <Pie> in Recharts v3
                            (this project is on 3.8.1), so it had been inert since
                            the upgrade — the first slice is no longer statically
                            emphasised. `activeShape` still applies on hover.
                            The dead prop was dropped to match real behaviour. */}
                        <Pie
                          data={RATIONALE_DRIVERS}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="count"
                          stroke="#ffffff"
                          strokeWidth={2}
                          activeShape={renderActiveShape}
                        >
                          {RATIONALE_DRIVERS.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', color: '#fff', fontSize: '9.5px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Right: Vertical Progress Legend */}
                <div className="flex flex-col gap-2.5 justify-center shrink-0 pr-4 select-none">
                  {[...RATIONALE_DRIVERS]
                    .sort((a, b) => b.pct - a.pct)
                    .map(d => (
                      <div key={d.name} className="flex items-center justify-between gap-4 text-[9px] font-semibold">
                        <div className="flex items-center gap-1.5 w-[110px] truncate" title={d.name}>
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-zinc-700 dark:text-zinc-350 truncate">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Progress Bar */}
                          <div className="w-16 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shrink-0">
                            <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                          </div>
                          <span className="w-7 text-right font-black text-zinc-900 dark:text-white font-mono">{d.pct}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {impactViewMode === 'spider' && (
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="95%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RATIONALE_DRIVERS}>
                      <PolarGrid stroke="currentColor" opacity={0.3} strokeWidth={1} strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: 'currentColor', fontWeight: 'bold', opacity: 0.9 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar 
                        name="SKUs" 
                        dataKey="count" 
                        stroke="#6366f1" 
                        strokeWidth={2} 
                        fill="#6366f1" 
                        fillOpacity={0.25} 
                        dot={{ r: 4, fill: '#6366f1', stroke: '#6366f1', strokeWidth: 1 }}
                      >
                        <LabelList 
                          dataKey="count" 
                          position="top" 
                          offset={8} 
                          style={{ fontSize: '9px', fontWeight: '900', fill: '#6366f1', fontFamily: 'monospace' }} 
                        />
                      </Radar>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', color: '#fff', fontSize: '9.5px' }}
                        formatter={(value: any) => [`${value} SKUs`]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roadmap Phase Details Modal */}
      {selectedRoadmapPhase && (() => {
        const details = ROADMAP_PHASES_DETAILS[selectedRoadmapPhase];
        if (!details) return null;
        
        const modalFilteredSkus = details.skus.filter(sku => 
          sku.sku.toLowerCase().includes(roadmapSearchQuery.toLowerCase()) ||
          sku.code.toLowerCase().includes(roadmapSearchQuery.toLowerCase()) ||
          sku.category.toLowerCase().includes(roadmapSearchQuery.toLowerCase())
        );

        const maxCatCount = Math.max(...details.categories.map(c => c.count));
        const maxRegionCount = Math.max(...details.regions.map(r => r.count));
        const maxStageCount = Math.max(...details.stages.map(s => s.count));

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fadeIn text-zinc-800 dark:text-zinc-150">
            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-slideIn">
              
              {/* Header */}
              <div className="p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[9px] text-indigo-650 dark:text-indigo-400 uppercase tracking-widest font-black block mb-1">
                    {details.step} · Phased Rollout breakdown
                  </span>
                  <h3 className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-tight">
                    {details.title}
                  </h3>
                  <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase mt-0.5 block">
                    {details.skusCount} SKUs · {details.revenue} Annualized Revenue Exposure
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedRoadmapPhase(null);
                    setRoadmapSearchQuery('');
                  }}
                  className="text-zinc-400 hover:text-zinc-655 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-650 dark:text-zinc-350">
                
                {/* Breakdowns section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* By Product Category */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 text-left">By Product Category</h4>
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-sm space-y-3">
                        {details.categories.map(cat => (
                          <div key={cat.name} className="flex items-center justify-between gap-3">
                            <span className="w-1/3 truncate text-[10px] font-bold text-zinc-700 dark:text-zinc-350 text-left">{cat.name}</span>
                            <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
                              <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${(cat.count / maxCatCount) * 100}%` }} />
                            </div>
                            <span className="w-8 text-right font-mono font-black text-zinc-700 dark:text-zinc-300">{cat.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* By Region */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 text-left">By Region</h4>
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-sm space-y-3">
                        {details.regions.map(reg => (
                          <div key={reg.name} className="flex items-center justify-between gap-3">
                            <span className="w-1/3 truncate text-[10px] font-bold text-zinc-700 dark:text-zinc-350 text-left">{reg.name}</span>
                            <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
                              <div className={`h-full ${reg.color} rounded-full`} style={{ width: `${(reg.count / maxRegionCount) * 100}%` }} />
                            </div>
                            <span className="w-8 text-right font-mono font-black text-zinc-700 dark:text-zinc-300">{reg.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* By Lifecycle Stage */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 text-left">By Lifecycle Stage</h4>
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-sm space-y-3">
                        {details.stages.map(stg => (
                          <div key={stg.name} className="flex items-center justify-between gap-3">
                            <span className="w-1/3 truncate text-[10px] font-bold text-zinc-700 dark:text-zinc-350 text-left">{stg.name}</span>
                            <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
                              <div className={`h-full ${stg.color} rounded-full`} style={{ width: `${(stg.count / maxStageCount) * 100}%` }} />
                            </div>
                            <span className="w-8 text-right font-mono font-black text-zinc-700 dark:text-zinc-300">{stg.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Insights list */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 text-left">Insights</h4>
                      <div className="space-y-2 text-left">
                        {details.insights.map((insight, idx) => (
                          <div key={idx} className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/30 p-2.5 rounded-sm flex items-start gap-2.5 text-[10px] leading-relaxed">
                            <Lightbulb size={12} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SKUs — Explore & Sort Table section */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-500 text-left">SKUs — Explore & Sort</h4>
                    
                    {/* Modal Search Bar */}
                    <div className="relative max-w-xs w-full">
                      <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-450 dark:text-zinc-500" />
                      <input 
                        type="text" 
                        placeholder="Search these SKUs by name, code, or category..."
                        value={roadmapSearchQuery}
                        onChange={(e) => setRoadmapSearchQuery(e.target.value)}
                        className="w-full pl-7 pr-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded text-[9.5px] focus:outline-none focus:border-indigo-500 text-zinc-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* SKU Table */}
                  <div className="border border-black/5 dark:border-white/5 rounded overflow-x-auto">
                    <table className="w-full text-[10px] text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-[8px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">
                          <th className="py-2 px-3">SKU</th>
                          <th className="py-2 px-2">Category</th>
                          <th className="py-2 px-2">Region</th>
                          <th className="py-2 px-2">Revenue</th>
                          <th className="py-2 px-2">Margin</th>
                          <th className="py-2 px-2">Growth</th>
                          <th className="py-2 px-2">Stage</th>
                          <th className="py-2 px-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalFilteredSkus.map(sku => (
                          <tr key={sku.code} className="border-b border-black/5 dark:border-white/5 last:border-none hover:bg-black/[0.01] dark:hover:bg-white/[0.01] text-zinc-700 dark:text-zinc-300">
                            <td className="py-2 px-3 text-left">
                              <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block">{sku.sku}</span>
                              <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-widest">{sku.code}</span>
                            </td>
                            <td className="py-2 px-2 font-medium text-left">{sku.category}</td>
                            <td className="py-2 px-2 font-semibold text-left">{sku.region}</td>
                            <td className="py-2 px-2 font-bold text-left">{sku.revenue}</td>
                            <td className="py-2 px-2 font-bold text-left">{sku.margin}</td>
                            <td className={`py-2 px-2 font-mono font-bold text-left ${sku.growthColor}`}>{sku.growth}</td>
                            <td className="py-2 px-2 text-left">
                              <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-extrabold uppercase ${
                                sku.stage === 'Growth' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                                sku.stage === 'Decline' ? 'bg-red-500/10 text-red-500 border border-red-500/10' :
                                'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10'
                              }`}>
                                {sku.stage}
                              </span>
                            </td>
                            <td className="py-2 px-2 font-extrabold text-left">{sku.action}</td>
                          </tr>
                        ))}
                        {modalFilteredSkus.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-zinc-450 dark:text-zinc-500">
                              No SKUs matched your search term.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-end">
                <button 
                  onClick={() => {
                    setSelectedRoadmapPhase(null);
                    setRoadmapSearchQuery('');
                  }}
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-650 dark:text-zinc-400 rounded text-[9.5px] font-bold uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  Close Roadmap Phase
                </button>
              </div>

            </div>
          </div>
        );
      })()}      {/* AI Risk Analysis Details Modal */}
      {selectedRiskForAnalysis && (() => {
        const rca = getRcaDetails(selectedRiskForAnalysis.sku, selectedRiskForAnalysis.factor);
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fadeIn text-zinc-800 dark:text-zinc-150">
            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-slideIn">
              
              {/* Header */}
              <div className="p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[9px] text-red-650 dark:text-red-400 uppercase tracking-widest font-black block mb-1">
                    AI Risk Diagnosis
                  </span>
                  <h3 className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-tight">
                    {selectedRiskForAnalysis.sku}
                  </h3>
                  <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase mt-0.5 block text-left">
                    {selectedRiskForAnalysis.productCat} Category · {selectedRiskForAnalysis.factor}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedRiskForAnalysis(null)}
                  className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-650 dark:text-zinc-350">
                
                {/* AI Recommended Solution panel */}
                <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-sm text-left space-y-3">
                  <div>
                    <span className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-500 block uppercase tracking-widest mb-1.5">AI Recommended Solution</span>
                    <p className="text-[11.5px] leading-relaxed text-zinc-705 dark:text-zinc-200 font-extrabold">{rca.recommendations}</p>
                  </div>
                  
                  {/* Quantitative Comparison Table */}
                  <div className="border border-emerald-500/20 rounded overflow-hidden mt-3 bg-white/40 dark:bg-black/10">
                    <table className="w-full text-left border-collapse text-[9.5px]">
                      <thead>
                        <tr className="bg-emerald-500/15 border-b border-emerald-500/25 text-[8.5px] uppercase font-black text-emerald-800 dark:text-emerald-450 tracking-wider">
                          <th className="py-2 px-3">Quantitative Perks & Comparison</th>
                          <th className="py-2 px-2 text-right">Current</th>
                          <th className="py-2 px-2 text-right">Future (Simulated)</th>
                          <th className="py-2 px-3 text-right">Delta / Benefit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-500/10 font-bold text-zinc-700 dark:text-zinc-350">
                        {rca.perks && rca.perks.map((perk: any, idx: number) => (
                          <tr key={idx} className="hover:bg-emerald-500/5 transition-colors">
                            <td className="py-2 px-3 font-semibold text-zinc-800 dark:text-zinc-200">{perk.metric}</td>
                            <td className="py-2 px-2 text-right font-mono font-medium">{perk.current}</td>
                            <td className="py-2 px-2 text-right font-mono font-medium">{perk.future}</td>
                            <td className={`py-2 px-3 text-right font-mono font-black ${
                              perk.isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-500'
                            }`}>
                              {perk.delta}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Primary Root Causes */}
                <div className="space-y-2">
                  <h4 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-500 text-left">Primary Root Causes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {rca.rootCauses.map((cause, index) => (
                      <div key={cause.title} className="bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/5 p-2.5 rounded-sm relative flex flex-col gap-2 text-left hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-center">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-350 flex items-center justify-center font-bold text-[8.5px] shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-600/10 px-1.5 py-0.5 rounded">FACTOR</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-[10.5px] leading-tight">{cause.title}</span>
                          <p className="text-zinc-555 dark:text-zinc-400 text-[9px] leading-normal">{cause.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnostic Charts */}
                <div className="space-y-4">
                  <h4 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-500 text-left">Diagnostic Analytics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MarginWaterfallChart />
                    <SkuCategoryBenchmarks skuName={selectedRiskForAnalysis.sku} category={selectedRiskForAnalysis.productCat} />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-between items-center">
                <button 
                  onClick={() => {
                    if (setTasks) {
                      const newTasks = generateTasksForSku(
                        selectedRiskForAnalysis.sku,
                        selectedRiskForAnalysis.action,
                        selectedRiskForAnalysis.factor
                      );
                      setTasks(prev => {
                        const updated = { ...prev };
                        Object.keys(newTasks).forEach(deptKey => {
                          updated[deptKey] = [...(updated[deptKey] || []), ...newTasks[deptKey]];
                        });
                        return updated;
                      });
                    }
                    setSelectedRiskForAnalysis(null);
                    if (setActiveTab) {
                      setActiveTab(11); // Open the Task Tracker tab!
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-sm flex items-center gap-1 font-extrabold"
                >
                  <span>Execute Plan</span>
                </button>
                <button 
                  onClick={() => setSelectedRiskForAnalysis(null)}
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-650 dark:text-zinc-400 rounded text-[9.5px] font-bold uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  Close Analysis
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
