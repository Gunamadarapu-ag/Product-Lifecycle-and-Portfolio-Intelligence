import React, { useState } from 'react';
import { PORTFOLIO_DATA } from '../../../constants/data';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { BarChart2, Star, Award, Layers, X, Sparkles, TrendingUp, AlertTriangle, Percent, Clock, ShieldCheck, Box, ChevronRight, HelpCircle, Coins, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LAYER } from '../../../constants/layers';
import { useDialogBehavior } from '../../../hooks/useDialogBehavior';

export const ParetoConcentration: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'heroes' | 'tail'>('all');
  const [selectedSkuName, setSelectedSkuName] = useState<string | null>(null);
  // Escape-to-close, scroll lock and focus restore, shared with ModalShell.
  useDialogBehavior(!!selectedSkuName, () => setSelectedSkuName(null));
  const [discountDepth, setDiscountDepth] = useState<number>(10);
  const [heroThreshold, setHeroThreshold] = useState<number>(30); // dynamic simulator from 20 to 60

  const skuItem = selectedSkuName ? PORTFOLIO_DATA.find(item => item.name === selectedSkuName) : null;

  // Sort portfolio items by sales descending
  const sortedItems = [...PORTFOLIO_DATA].sort((a, b) => b.netSales - a.netSales);

  // Calculate cumulative totals
  const totalSales = sortedItems.reduce((sum, item) => sum + item.netSales, 0);
  
  let runningSum = 0;
  const chartData = sortedItems.map((item, index) => {
    runningSum += item.netSales;
    const cumulativePct = (runningSum / totalSales) * 100;
    
    return {
      name: item.name,
      sales: item.netSales,
      cumulative: parseFloat(cumulativePct.toFixed(2)),
      rank: index + 1,
      category: item.category,
      margin: item.margin,
      segment: item.segment
    };
  });

  // Filter items for display
  const heroCutoffIdx = Math.floor(chartData.length * (heroThreshold / 100)); // Dynamic Hero cutoff index
  
  const filteredData = chartData.filter(item => {
    if (filterType === 'heroes') return item.rank <= heroCutoffIdx;
    if (filterType === 'tail') return item.rank > heroCutoffIdx;
    return true; // all
  });

  // Hero highlights details
  const top10pctSales = chartData.filter(item => item.rank <= Math.ceil(chartData.length * 0.1)).reduce((sum, i) => sum + i.sales, 0);
  const topHeroPctSales = chartData.filter(item => item.rank <= Math.ceil(chartData.length * (heroThreshold / 100))).reduce((sum, i) => sum + i.sales, 0);
  const tailPct = 100 - heroThreshold;
  const tailSales = totalSales - topHeroPctSales;

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-5 flex flex-col mb-6">
      
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <h4 className="text-xs uppercase font-bold tracking-widest text-zinc-400">Pareto SKU Concentration</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Analysing SKU catalog revenue density and identification of the long-tail.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Simulator Slider */}
          <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded border border-black/10 dark:border-white/10 text-[9px] font-bold text-zinc-500 dark:text-zinc-400">
            <span className="shrink-0 uppercase tracking-wider">Cutoff:</span>
            <input 
              type="range" 
              min="20" 
              max="100" 
              value={heroThreshold}
              onChange={(e) => setHeroThreshold(parseInt(e.target.value, 10))}
              className="accent-acies-yellow cursor-pointer h-1 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
            />
            <span className="text-acies-yellow font-extrabold w-6 text-right">{heroThreshold}%</span>
          </div>

          {/* Tab-like Filters */}
          <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/5 self-start">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-[8.5px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                filterType === 'all' 
                  ? 'bg-white dark:bg-zinc-800 text-acies-yellow shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              All SKUs
            </button>
            <button 
              onClick={() => setFilterType('heroes')}
              className={`px-3 py-1 text-[8.5px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                filterType === 'heroes' 
                  ? 'bg-white dark:bg-zinc-800 text-acies-yellow shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              Hero Tier (Top {heroThreshold}%)
            </button>
            <button 
              onClick={() => setFilterType('tail')}
              className={`px-3 py-1 text-[8.5px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                filterType === 'tail' 
                  ? 'bg-white dark:bg-zinc-800 text-acies-yellow shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              Long Tail (Bottom {100 - heroThreshold}%)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Chart Column */}
        <div className="lg:col-span-3 h-[240px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#888', fontSize: 7, fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: '#888', fontSize: 8, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Net Sales ($M)', angle: -90, position: 'insideLeft', style: { fill: '#666', fontSize: 8, fontWeight: 'bold' } }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: '#888', fontSize: 8, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', style: { fill: '#666', fontSize: 8, fontWeight: 'bold' } }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-acies-gray text-white p-2.5 shadow-xl border border-white/10 text-[9px] rounded-sm font-sans">
                        <p className="font-bold text-acies-yellow mb-1">{data.name}</p>
                        <p className="opacity-70">Category: <span className="font-bold">{data.category}</span></p>
                        <p className="opacity-70">Segment: <span className="font-bold">{data.segment}</span></p>
                        <p className="opacity-70 mt-1">Sales: <span className="font-mono font-bold text-blue-400">${data.sales.toFixed(2)}M</span></p>
                        <p className="opacity-70">Cumulative Rev %: <span className="font-mono font-bold text-emerald-400">{data.cumulative}%</span></p>
                        <p className="opacity-50 text-[7px] mt-1 font-bold uppercase tracking-wider">Rank #{data.rank} of {chartData.length}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="sales" 
                radius={[2, 2, 0, 0]} 
                maxBarSize={30}
                style={{ cursor: 'pointer' }}
                onClick={(data) => {
                  if (data && data.name) {
                    setSelectedSkuName(data.name);
                    setDiscountDepth(15);
                  }
                }}
              >
                {filteredData.map((entry, index) => {
                  const isHero = entry.rank <= heroCutoffIdx;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isHero ? '#3b82f6' : '#94a3b8'} 
                    />
                  );
                })}
              </Bar>
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
              />
              {/* Strategic 80% Line */}
              <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '80% Revenue Cutoff', fill: '#ef4444', fontSize: 7, fontWeight: 'bold', position: 'top' }} />
              
              {/* Simulated Cutoff Vertical Line */}
              {filterType === 'all' && chartData[heroCutoffIdx - 1] && (
                <ReferenceLine 
                  yAxisId="left"
                  x={chartData[heroCutoffIdx - 1].name} 
                  stroke="#3b82f6" 
                  strokeDasharray="3 3" 
                  label={{ value: `Top ${heroThreshold}% Cutoff`, fill: '#3b82f6', fontSize: 6.5, fontWeight: 'bold', position: 'insideTopRight' }} 
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Analytical Breakdown Column */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h5 className="text-[8.5px] uppercase font-bold tracking-wider text-zinc-400 border-b border-black/5 dark:border-white/5 pb-1 flex items-center gap-1">
              <BarChart2 size={11} className="text-acies-yellow" />
              Concentration Insights
            </h5>
            
            {/* KPI Item 1: Top 10% */}
            <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-2 rounded-sm">
              <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400">
                <span className="flex items-center gap-1">
                  <Star size={9} className="text-yellow-500 fill-yellow-500" />
                  Top 10% SKUs
                </span>
                <span className="font-mono text-emerald-500">
                  {((top10pctSales / totalSales) * 100).toFixed(1)}% Sales
                </span>
              </div>
              <p className="text-[8px] text-zinc-500 mt-1 leading-normal">
                10 Hero items (e.g. BrandF Water) drive 27.8% of total revenue.
              </p>
            </div>

            {/* KPI Item 2: Top X% */}
            <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-2 rounded-sm">
              <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400">
                <span className="flex items-center gap-1">
                  <Award size={9} className="text-blue-500" />
                  Top {heroThreshold}% SKUs
                </span>
                <span className="font-mono text-emerald-500">
                  {((topHeroPctSales / totalSales) * 100).toFixed(1)}% Sales
                </span>
              </div>
              <p className="text-[8px] text-zinc-500 mt-1 leading-normal">
                {heroCutoffIdx} high-performing items drive {((topHeroPctSales / totalSales) * 100).toFixed(1)}% of portfolio revenue.
              </p>
            </div>

            {/* KPI Item 3: Long-Tail */}
            <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-2 rounded-sm">
              <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400">
                <span className="flex items-center gap-1">
                  <Layers size={9} className="text-rose-500" />
                  Bottom {tailPct.toFixed(0)}% SKUs
                </span>
                <span className="font-mono text-rose-500">
                  {((tailSales / totalSales) * 100).toFixed(1)}% Sales
                </span>
              </div>
              <p className="text-[8px] text-zinc-500 mt-1 leading-normal">
                {chartData.length - heroCutoffIdx} long-tail items consume massive supplier overhead with negligible return.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* SKU Battlecard Drawer */}
      <AnimatePresence>
        {selectedSkuName && skuItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSkuName(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              style={{ zIndex: LAYER.composer }}
            />

            {/* Drawer Container */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              role="dialog"
              aria-modal="true"
              aria-label={`SKU detail: ${selectedSkuName ?? ''}`}
              // Drawer panels sit one step above their own backdrop.
              style={{ zIndex: LAYER.composer + 10 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-l border-black/10 dark:border-white/10 overflow-y-auto flex flex-col shadow-2xl text-zinc-800 dark:text-zinc-200 p-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={11} className="text-acies-yellow animate-pulse" />
                    <span className="text-[8px] uppercase font-bold tracking-wider text-zinc-400">AI Lifecycle Intelligence</span>
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse ml-1" />
                  </div>
                  <h3 className="text-sm font-display font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {selectedSkuName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{skuItem.category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-extrabold uppercase tracking-widest border ${
                      skuItem.segment === 'Keep' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                      skuItem.segment === 'Grow' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                      skuItem.segment === 'Consolidate' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                      'text-rose-500 bg-rose-500/10 border-rose-500/20'
                    }`}>
                      {skuItem.segment}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedSkuName(null)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent outline-none"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-[9px] font-semibold text-zinc-500">
                    <div className="p-3 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-sm flex items-center gap-2">
                      <Coins size={12} className="text-blue-500" />
                      <div>
                        <span className="text-[7px] text-zinc-400 uppercase font-bold block">Annual Net Sales</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200 text-[10px]">
                          ${skuItem.netSales.toFixed(2)}M
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-sm flex items-center gap-2">
                      <Percent size={12} className="text-emerald-500" />
                      <div>
                        <span className="text-[7px] text-zinc-400 uppercase font-bold block">Gross Margin</span>
                        <span className="font-mono font-bold text-emerald-500 text-[10px]">
                          {skuItem.margin.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-sm flex items-center gap-2">
                      <TrendingUp size={12} className="text-purple-500" />
                      <div>
                        <span className="text-[7px] text-zinc-400 uppercase font-bold block">YoY Growth</span>
                        <span className={`font-mono font-bold text-[10px] ${skuItem.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {skuItem.growth >= 0 ? `+${skuItem.growth}%` : `${skuItem.growth}%`}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-sm flex items-center gap-2">
                      <Clock size={12} className="text-amber-500" />
                      <div>
                        <span className="text-[7px] text-zinc-400 uppercase font-bold block">Supplier Lead Time</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200 text-[10px]">
                          {skuItem.leadTime.toFixed(1)} Days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Sub-Visual: Price Elasticity Simulator */}
                  <div className="p-4 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[8.5px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1">
                        <BarChart3 size={10} className="text-acies-yellow" />
                        Price Elasticity Simulator
                      </span>
                      <span className="text-[7.5px] uppercase font-extrabold tracking-widest text-zinc-500 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                        Elasticity: -2.5
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-zinc-400">
                        <span>Simulate Discount Depth</span>
                        <span className="text-rose-500 font-mono font-bold">{discountDepth}% Off</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="40" 
                        value={discountDepth}
                        onChange={(e) => setDiscountDepth(parseInt(e.target.value, 10))}
                        className="w-full accent-rose-500 cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[6.5px] text-zinc-600 font-bold">
                        <span>0% (Full Price)</span>
                        <span>40% (Max Markdown)</span>
                      </div>
                    </div>

                    {/* Calculations Panel */}
                    {(() => {
                      const baseSales = skuItem.netSales;
                      const baseMargin = skuItem.margin;
                      const elasticity = 2.5;
                      const volumeLift = (discountDepth * elasticity);
                      
                      // Sourcing Cost
                      const cogs = 1 - baseMargin/100;
                      // New price after discount
                      const newPrice = 1 - discountDepth/100;
                      // New margin %
                      const newMarginPct = newPrice > cogs ? ((newPrice - cogs) / newPrice) * 100 : 0;
                      
                      // New Net Sales
                      const newSales = baseSales * (1 + volumeLift/100) * newPrice;
                      // Net Sales Delta
                      const salesDelta = newSales - baseSales;

                      // Base Profit
                      const baseProfit = baseSales * (baseMargin/100);
                      // New Profit
                      const newProfit = newSales * (newMarginPct/100);
                      // Profit Delta
                      const profitDelta = newProfit - baseProfit;
                      
                      const isProfitable = profitDelta >= 0;

                      return (
                        <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                          <div className="grid grid-cols-2 gap-2 font-mono text-[8px] font-semibold text-zinc-400 dark:text-zinc-400">
                            <div>
                              <span className="block text-[6.5px] text-zinc-500 uppercase font-bold">Volume Demand Lift</span>
                              <span className="text-emerald-500 font-bold">+{volumeLift.toFixed(1)}% Units</span>
                            </div>
                            <div>
                              <span className="block text-[6.5px] text-zinc-500 uppercase font-bold">New Gross Margin</span>
                              <span className={`${newMarginPct > 0 ? 'text-zinc-700 dark:text-zinc-400' : 'text-rose-500'} font-bold`}>
                                {newMarginPct.toFixed(1)}%
                              </span>
                            </div>
                            <div>
                              <span className="block text-[6.5px] text-zinc-500 uppercase font-bold">Net Sales Impact</span>
                              <span className={`${salesDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'} font-bold`}>
                                {salesDelta >= 0 ? `+$${salesDelta.toFixed(2)}M` : `-$${Math.abs(salesDelta).toFixed(2)}M`}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[6.5px] text-zinc-500 uppercase font-bold">Net Profit Impact</span>
                              <span className={`${isProfitable ? 'text-emerald-500' : 'text-rose-500'} font-bold`}>
                                {profitDelta >= 0 ? `+$${profitDelta.toFixed(2)}M` : `-$${Math.abs(profitDelta).toFixed(2)}M`}
                              </span>
                            </div>
                          </div>
                          
                          {/* Summary alert banner */}
                          <div className={`p-2 border rounded-sm text-[7.5px] font-bold ${
                            isProfitable 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                          }`}>
                            {isProfitable ? (
                              <span>Volume lift overcomes margin compression. Net profit rises by **+$${profitDelta.toFixed(2)}M** (Margin-accretive promo).</span>
                            ) : (
                              <span>Warning: Sourcing drag and discounts exceed volume benefits. Net profit drops by **-$${Math.abs(profitDelta).toFixed(2)}M** (Margin-dilutive promo).</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Operational Complexity & Logistics details */}
                  <div className="space-y-2">
                    <span className="text-[8.5px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1 border-b border-black/5 dark:border-white/5 pb-1">
                      <Box size={10} className="text-rose-500" />
                      Operational Risk & Complexity Audit
                    </span>
                    
                    <div className="space-y-1.5 text-[8.5px] font-medium text-zinc-500">
                      {/* Complexity score bar */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between font-mono font-bold text-[8px]">
                          <span>Sourcing Complexity Index</span>
                          <span className={skuItem.complexity >= 60 ? 'text-rose-500' : skuItem.complexity >= 30 ? 'text-amber-500' : 'text-emerald-500'}>
                            {skuItem.complexity}/100
                          </span>
                        </div>
                        <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              skuItem.complexity >= 60 ? 'bg-rose-500' :
                              skuItem.complexity >= 30 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${skuItem.complexity}%` }}
                          />
                        </div>
                      </div>

                      {/* Stockout issues */}
                      <div className="flex justify-between items-center py-1">
                        <span>Stockout Events (Annualised)</span>
                        <span className={`font-bold font-mono ${skuItem.stockouts > 300 ? 'text-rose-500' : 'text-zinc-700'}`}>
                          {skuItem.stockouts} events
                        </span>
                      </div>

                      {/* Promo dependencies */}
                      <div className="flex justify-between items-center py-1">
                        <span>Trade Promo Revenue Share</span>
                        <span className="font-bold font-mono text-zinc-700">{skuItem.promoDep}% share</span>
                      </div>

                      {/* Sourcing margins */}
                      <div className="flex justify-between items-center py-1">
                        <span>Erosion Penalty (Freight + Promo)</span>
                        <span className="font-bold font-mono text-rose-500">-{skuItem.promoErosion}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* S&OP Action Recommendation */}
                <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-4 rounded-sm border-l-2 border-l-blue-500 space-y-2 mt-4">
                  <div className="flex items-center gap-1 text-[8.5px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                    <ShieldCheck size={11} className="text-blue-500" />
                    Prescriptive Action Plan
                  </div>
                  <p className="text-[9px] leading-relaxed text-zinc-500 font-medium">
                    {skuItem.segment === 'Keep' && "Hero product driving key category profitability. Establish safety stock buffer parameters (+5 days), secure regional distribution lanes, and protect catalog shelf-share."}
                    {skuItem.segment === 'Grow' && "Category growth candidate. Recommended to expand listings into Spain & Italy catalogs. Consolidation of suppliers recommended to lower sourcing lead time from 6+ days."}
                    {skuItem.segment === 'Consolidate' && "High package overlap and low volume contribution. Recommend consolidating multiple sizing variants into a single core listing (e.g. 500ml) to reclaim warehouse handling space."}
                    {skuItem.segment === 'Rationalize' && "Low margin yield with heavy supplier and operational complexity. High priority pruning candidate. Phase-out proposed to reduce safety stock inventory carrying costs."}
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
