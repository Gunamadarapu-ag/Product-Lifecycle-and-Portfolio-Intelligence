import React, { useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ScatterChart, Scatter, ZAxis, Cell, ReferenceLine
} from 'recharts';
import { Sparkles, Grid, Layers, MapPin, Check, RefreshCw } from 'lucide-react';

interface ProductMixClusteringProps {
  isDarkMode: boolean;
  onStageAction?: (action: any) => void;
}

export const ProductMixClustering: React.FC<ProductMixClusteringProps> = ({ isDarkMode, onStageAction }) => {
  const [mixIntensity, setMixIntensity] = useState<number>(40); // 0 to 100%
  const [selectedCluster, setSelectedCluster] = useState<string>('All');

  // 1. Product Mix Optimization Data
  // Categories: Beverages, Snacks, Personal Care, Dairy, Household
  // Base Mix: 25%, 20%, 15%, 22%, 18%
  // Optimized Mix shifts weight from Dairy and Household to Beverages and Snacks
  const baseMix = [
    { category: 'Beverages', current: 25.0, margin: 41.2 },
    { category: 'Snacks', current: 20.0, margin: 39.4 },
    { category: 'Personal Care', current: 15.0, margin: 38.6 },
    { category: 'Dairy', current: 22.0, margin: 32.1 },
    { category: 'Household', current: 18.0, margin: 34.8 }
  ];

  const mixShiftRate = mixIntensity / 100; // 0 to 1
  
  // Calculate shifted mix
  const optimizedMix = baseMix.map(item => {
    let opt = item.current;
    if (item.category === 'Beverages') {
      opt = item.current + (5.0 * mixShiftRate);
    } else if (item.category === 'Snacks') {
      opt = item.current + (3.0 * mixShiftRate);
    } else if (item.category === 'Dairy') {
      opt = Math.max(10.0, item.current - (5.0 * mixShiftRate));
    } else if (item.category === 'Household') {
      opt = Math.max(10.0, item.current - (3.0 * mixShiftRate));
    }
    return {
      ...item,
      'Current Mix (%)': item.current,
      'Optimized Mix (%)': parseFloat(opt.toFixed(1))
    };
  });

  // Calculate Net Margin Change
  const baseBlendedMargin = baseMix.reduce((sum, item) => sum + (item.current * item.margin / 100), 0);
  const optBlendedMargin = optimizedMix.reduce((sum, item) => sum + (item['Optimized Mix (%)'] * item.margin / 100), 0);
  const marginLift = optBlendedMargin - baseBlendedMargin;
  const projectedRevenueCr = 851.2; // total portfolio revenue
  const absoluteProfitLift = projectedRevenueCr * (marginLift / 100);

  // 2. Store Clustering Scatter Data
  const storeClusters = [
    { name: 'High-Volume Urban', x: 78, y: 45, z: 254, color: '#3b82f6', desc: 'Metropolitan stores, high density sales, medium premium share.' },
    { name: 'Premium Suburban', x: 52, y: 76, z: 180, color: '#8b5cf6', desc: 'Residential areas, moderate density sales, high premium/organic SKU share.' },
    { name: 'Convenience / Express', x: 30, y: 25, z: 320, color: '#f59e0b', desc: 'Transit hubs, low footprint, high convenience and RTD share.' },
    { name: 'Low-Margin Discount', x: 82, y: 18, z: 152, color: '#ef4444', desc: 'Regional hubs, price-sensitive shoppers, discount SKU reliance.' }
  ];

  // 3. Assortment Recommendations Directory
  const assortmentRecs = [
    {
      clusterName: 'High-Volume Urban',
      storeCount: 254,
      strategy: 'Core + Premium Focus',
      recs: 'List all Keep/Grow Beverages & Snacks. Target 85+ active SKUs. Delist slow-velocity Dairy.',
      justification: 'Maximize velocity and margins by scaling high-value Beverages to match strong foot traffic.',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
      clusterName: 'Premium Suburban',
      storeCount: 180,
      strategy: 'Niche / Organic Expansion',
      recs: 'Introduce BrandD Organic Yogurt & Eco-Pack Water. Highlight Premium Personal Care. 75+ SKUs.',
      justification: 'High consumer willingness-to-pay makes it ideal for testing new premium/organic variants.',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    {
      clusterName: 'Convenience / Express',
      storeCount: 320,
      strategy: 'RTD & Convenience Pack Core',
      recs: 'List only single-serve RTD beverages (e.g. Mango Fizz 250ml) & snack bars. Prune large packs. Max 35 SKUs.',
      justification: 'Frees up shelf footprint by focusing entirely on immediate-consumption items.',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    },
    {
      clusterName: 'Low-Margin Discount',
      storeCount: 152,
      strategy: 'Max Delisting / High-Volume Core',
      recs: 'Restrict catalog to top 20 high-velocity SKUs only. Delist all Consolidate segment. Max 45 SKUs.',
      justification: 'Minimizes supplier administration complexity and safety stock overhead.',
      badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  ];

  const filteredRecs = selectedCluster === 'All'
    ? assortmentRecs
    : assortmentRecs.filter(r => r.clusterName === selectedCluster);

  const handleStageMixPlan = () => {
    if (onStageAction) {
      onStageAction({
        id: `mix-${Date.now()}`,
        type: 'mix_optimization',
        title: `Mix Optimization - Intensity ${mixIntensity}%`,
        details: `Reallocate category weights to lift gross margin by +${marginLift.toFixed(2)}%.`,
        revenueImpact: 0,
        marginImpact: parseFloat(absoluteProfitLift.toFixed(2)),
        complexityImpact: parseFloat((mixIntensity * 0.05).toFixed(1)),
        spaceImpact: 0
      });
      alert(`Product Mix Optimization Plan staged successfully! Projected absolute profit lift of $${absoluteProfitLift.toFixed(2)} M.`);
    }
  };

  const chartColors = {
    current: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    optimized: isDarkMode ? '#a78bfa' : '#6d28d9',
    grid: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  };

  return (
    <div className="space-y-6">
      
      {/* Product Mix Optimization Card */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm">
        <div className="flex justify-between items-center mb-4 border-b border-black/5 dark:border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-[#6d28d9] dark:text-[#a78bfa]" />
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-zinc-800 dark:text-zinc-200 font-sans">Product Mix Optimization Simulator</h4>
          </div>
          <span className="text-[8px] uppercase font-bold text-zinc-400">Current vs Optimized Mix Share (%)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Slider and Metrics */}
          <div className="lg:col-span-5 space-y-4">
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
              Adjust the slider to simulate shift intensities. This model automatically moves catalog share from low-performing/dilutive categories (Dairy, Household) into high-margin drivers (Beverages, Snacks).
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                <span>Mix Optimization Intensity</span>
                <span className="text-[#6d28d9] dark:text-[#a78bfa] font-mono font-bold text-[10px]">{mixIntensity}% Shift</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={mixIntensity}
                onChange={(e) => setMixIntensity(parseInt(e.target.value) || 0)}
                className="w-full accent-purple-600 cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[7.5px] text-zinc-400 font-bold">
                <span>Conservative (0%)</span>
                <span>Balanced (50%)</span>
                <span>Aggressive (100%)</span>
              </div>
            </div>

            {/* Projected Impact Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-sm">
                <span className="text-[8px] text-zinc-500 block uppercase font-bold">Blended Margin Lift</span>
                <span className="text-sm font-extrabold text-emerald-500 mt-1 block font-mono">
                  +{marginLift.toFixed(2)}%
                </span>
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-sm">
                <span className="text-[8px] text-zinc-500 block uppercase font-bold">Net Profit Boost</span>
                <span className="text-sm font-extrabold text-emerald-500 mt-1 block font-mono">
                  +${absoluteProfitLift.toFixed(2)} M
                </span>
              </div>
            </div>

            <button
              onClick={handleStageMixPlan}
              disabled={mixIntensity === 0}
              className={`w-full py-2 rounded text-[8px] font-extrabold uppercase tracking-widest text-center transition-all border-none outline-none ${
                mixIntensity > 0 
                  ? 'bg-purple-600 text-white hover:brightness-105 active:scale-95 cursor-pointer shadow-md shadow-purple-600/10' 
                  : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-700 cursor-not-allowed'
              }`}
            >
              Stage Mix Optimization Plan
            </button>
          </div>

          {/* Bar Chart Representation */}
          <div className="lg:col-span-7 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={optimizedMix} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="category" tick={{ fill: chartColors.text, fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartColors.text, fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 30]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', 
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                    color: isDarkMode ? '#fff' : '#000',
                    fontSize: 10
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 9, textTransform: 'uppercase' }} />
                <Bar dataKey="Current Mix (%)" fill={chartColors.current} radius={[2, 2, 0, 0]} barSize={18} />
                <Bar dataKey="Optimized Mix (%)" fill={chartColors.optimized} radius={[2, 2, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Store Clustering Scatter Plot & recommendations */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Store Clustering Scatter chart */}
        <div className="xl:col-span-7 glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-black/5 dark:border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Grid size={13} className="text-[#6d28d9] dark:text-[#a78bfa]" />
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-zinc-800 dark:text-zinc-200">Store Clustering Matrix</h4>
              </div>
              <span className="text-[8px] uppercase font-bold text-zinc-400">Stores mapped by Sales Density & Premium Share</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: -10, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Sales Density" 
                    unit=" L" 
                    domain={[0, 100]} 
                    tick={{ fill: chartColors.text, fontSize: 8 }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Premium SKU Share" 
                    unit="%" 
                    domain={[0, 100]} 
                    tick={{ fill: chartColors.text, fontSize: 8 }} 
                  />
                  <ZAxis type="number" dataKey="z" range={[80, 400]} name="Stores Count" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDarkMode ? '#fff' : '#000', fontSize: 9 }} />
                  <ReferenceLine x={50} stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} strokeDasharray="3 3" />
                  <ReferenceLine y={50} stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} strokeDasharray="3 3" />
                  <Scatter name="Store Clusters" data={storeClusters} fill="#8884d8">
                    {storeClusters.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        cursor="pointer"
                        onClick={() => setSelectedCluster(entry.name)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="flex flex-wrap items-center gap-3 mt-4 text-[7.5px] uppercase font-extrabold tracking-widest pl-2">
              {storeClusters.map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCluster(selectedCluster === c.name ? 'All' : c.name)}
                  className={`flex items-center gap-1.5 cursor-pointer bg-transparent border-none ${selectedCluster === c.name ? 'opacity-100 scale-105' : 'opacity-60'}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className={selectedCluster === c.name ? 'text-acies-yellow' : 'text-zinc-400'}>{c.name} ({c.z})</span>
                </button>
              ))}
              {selectedCluster !== 'All' && (
                <button 
                  onClick={() => setSelectedCluster('All')}
                  className="text-blue-500 ml-auto hover:underline border-none bg-transparent cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Assortment recommendations */}
        <div className="xl:col-span-5 glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-[#6d28d9] dark:text-[#a78bfa]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Assortment recommendations</span>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
                {selectedCluster === 'All' ? 'All Clusters' : 'Filtered'}
              </span>
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {filteredRecs.map(rec => (
                <div key={rec.clusterName} className="p-3 border border-black/5 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 space-y-2 text-[9.5px]">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-[#6d28d9] dark:text-[#a78bfa]" />
                      <h4 className="font-extrabold text-zinc-800 dark:text-zinc-200">{rec.clusterName}</h4>
                      <span className="text-[8px] font-bold text-zinc-500 font-mono">({rec.storeCount} stores)</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[6px] font-extrabold uppercase tracking-widest border ${rec.badgeColor}`}>
                      {rec.strategy}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                      <strong>Directive:</strong> {rec.recs}
                    </p>
                    <p className="text-zinc-500 italic">
                      <strong>Rationale:</strong> {rec.justification}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
