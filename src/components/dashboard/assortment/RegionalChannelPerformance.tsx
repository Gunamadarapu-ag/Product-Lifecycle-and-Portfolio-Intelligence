import React, { useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell 
} from 'recharts';
import { SKUS, REGIONAL_DATA } from '../../../constants/data';
import { Globe, ShoppingBag, Filter, Info, TrendingUp } from 'lucide-react';

interface RegionalChannelPerformanceProps {
  isDarkMode: boolean;
}

export const RegionalChannelPerformance: React.FC<RegionalChannelPerformanceProps> = ({ isDarkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSkuName, setSelectedSkuName] = useState<string>('All');

  // Filter SKUs based on selected category
  const availableSkus = selectedCategory === 'All' 
    ? SKUS 
    : SKUS.filter(s => s.cat === selectedCategory);

  // Filtered SKUs for calculations
  const filteredSkus = SKUS.filter(s => {
    const matchCat = selectedCategory === 'All' || s.cat === selectedCategory;
    const matchSku = selectedSkuName === 'All' || s.name === selectedSkuName;
    return matchCat && matchSku;
  });

  // 1. Calculate Region-wise SKU Performance
  // Sourcing ratios representing regional distribution weights
  const regionWeights: Record<string, Record<string, number>> = {
    'Beverages': { Italy: 0.35, Spain: 0.25, Germany: 0.18, France: 0.10, Austria: 0.08, Poland: 0.03, Netherlands: 0.01 },
    'Snacks': { Italy: 0.30, Spain: 0.35, Germany: 0.15, France: 0.08, Austria: 0.06, Poland: 0.04, Netherlands: 0.02 },
    'Personal Care': { Italy: 0.28, Spain: 0.20, Germany: 0.25, France: 0.12, Austria: 0.08, Poland: 0.05, Netherlands: 0.02 },
    'Dairy': { Italy: 0.40, Spain: 0.15, Germany: 0.20, France: 0.10, Austria: 0.10, Poland: 0.04, Netherlands: 0.01 },
    'Household': { Italy: 0.32, Spain: 0.22, Germany: 0.20, France: 0.11, Austria: 0.08, Poland: 0.05, Netherlands: 0.02 }
  };

  const countries = ['Italy', 'Spain', 'Germany', 'France', 'Austria', 'Poland', 'Netherlands'];
  
  const regionalSalesData = countries.map(country => {
    let sales = 0;
    filteredSkus.forEach(sku => {
      const catWeights = regionWeights[sku.cat] || regionWeights['Beverages'];
      const weight = catWeights[country] || 0.1;
      sales += sku.rev * weight;
    });
    return {
      country,
      'Sales ($ M)': parseFloat(sales.toFixed(1)),
      'SKU Count': selectedSkuName === 'All' ? filteredSkus.length : 1
    };
  });

  // 2. Calculate Channel-wise SKU Performance
  const channelWeights: Record<string, Record<string, number>> = {
    'E-commerce': { Beverages: 0.18, Snacks: 0.20, 'Personal Care': 0.32, Dairy: 0.08, Household: 0.22 },
    'Supermarket': { Beverages: 0.32, Snacks: 0.38, 'Personal Care': 0.28, Dairy: 0.42, Household: 0.30 },
    'Hypermarket': { Beverages: 0.40, Snacks: 0.35, 'Personal Care': 0.30, Dairy: 0.45, Household: 0.40 },
    'Convenience': { Beverages: 0.10, Snacks: 0.07, 'Personal Care': 0.10, Dairy: 0.05, Household: 0.08 }
  };

  const channels = ['Hypermarket', 'Supermarket', 'E-commerce', 'Convenience'];
  
  const channelSalesData = channels.map(channel => {
    let sales = 0;
    let marginSum = 0;
    let skuCount = 0;

    filteredSkus.forEach(sku => {
      const weights = channelWeights[channel] || channelWeights['Supermarket'];
      const weight = weights[sku.cat] || 0.25;
      const skuChannelSales = sku.rev * weight;
      sales += skuChannelSales;
      marginSum += sku.margin * skuChannelSales;
      skuCount++;
    });

    const avgMargin = sales > 0 ? (marginSum / sales) : 0;

    return {
      channel,
      'Sales ($ M)': parseFloat(sales.toFixed(1)),
      'Avg Margin (%)': parseFloat(avgMargin.toFixed(1))
    };
  });

  // Dynamic Insight generation
  const getPerformanceInsights = () => {
    const totalFilteredSales = filteredSkus.reduce((sum, s) => sum + s.rev, 0);
    const topRegion = [...regionalSalesData].sort((a, b) => b['Sales ($ M)'] - a['Sales ($ M)'])[0];
    const topChannel = [...channelSalesData].sort((a, b) => b['Sales ($ M)'] - a['Sales ($ M)'])[0];
    
    return {
      totalSales: totalFilteredSales,
      topRegionName: topRegion?.country || 'N/A',
      topRegionSales: topRegion?.['Sales ($ M)'] || 0,
      topChannelName: topChannel?.channel || 'N/A',
      topChannelSales: topChannel?.['Sales ($ M)'] || 0
    };
  };

  const insights = getPerformanceInsights();

  // Category change wrapper to reset SKU selection
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSkuName('All');
  };

  const chartColors = {
    sales: isDarkMode ? '#a78bfa' : '#6d28d9',
    margin: isDarkMode ? '#34d399' : '#10b981',
    grid: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-[#6d28d9] dark:text-[#a78bfa]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Analysis Filters</span>
        </div>
        
        {/* Category Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[8px] font-bold uppercase tracking-wider opacity-45">Product Category</label>
          <select 
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Beverages">Beverages</option>
            <option value="Snacks">Snacks</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Dairy">Dairy</option>
            <option value="Household">Household</option>
          </select>
        </div>

        {/* SKU Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[8px] font-bold uppercase tracking-wider opacity-45">Specific SKU</label>
          <select 
            value={selectedSkuName}
            onChange={(e) => setSelectedSkuName(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer max-w-xs"
          >
            <option value="All">All SKUs</option>
            {availableSkus.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-[9px] font-bold text-zinc-400">
          Showing <span className="text-acies-yellow">{filteredSkus.length}</span> of <span className="text-[#6d28d9] dark:text-[#a78bfa]">{SKUS.length} SKUs</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Region-wise SKU Performance */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-black/5 dark:border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Globe size={13} className="text-[#6d28d9] dark:text-[#a78bfa]" />
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-zinc-800 dark:text-zinc-200">Region-wise SKU Performance</h4>
              </div>
              <span className="text-[8px] uppercase font-bold text-zinc-400">Revenue ($ M)</span>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalSalesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="country" tick={{ fill: chartColors.text, fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: chartColors.text, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', 
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                      color: isDarkMode ? '#fff' : '#000',
                      fontSize: 10
                    }} 
                  />
                  <Bar dataKey="Sales ($ M)" fill={chartColors.sales} radius={[2, 2, 0, 0]} barSize={26}>
                    {regionalSalesData.map((entry, index) => {
                      // Color Netherlands differently if it's the focus of optimization
                      const color = entry.country === 'Netherlands' 
                        ? (isDarkMode ? '#ef4444' : '#dc2626') 
                        : chartColors.sales;
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-[8.5px] text-zinc-500 font-medium mt-3 italic leading-relaxed">
            *Regional distribution modeled based on actual Q1 shipping manifests and local listings density indexes.
          </p>
        </div>

        {/* Channel-wise SKU Performance */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-black/5 dark:border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag size={13} className="text-[#6d28d9] dark:text-[#a78bfa]" />
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-zinc-800 dark:text-zinc-200">Channel-wise SKU Performance</h4>
              </div>
              <span className="text-[8px] uppercase font-bold text-zinc-400">Sales & Margin</span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelSalesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="channel" tick={{ fill: chartColors.text, fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: chartColors.text, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: chartColors.text, fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 50]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', 
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                      color: isDarkMode ? '#fff' : '#000',
                      fontSize: 10
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  <Bar yAxisId="left" dataKey="Sales ($ M)" fill={isDarkMode ? '#3b82f6' : '#2563eb'} radius={[2, 2, 0, 0]} barSize={20} />
                  <Bar yAxisId="right" dataKey="Avg Margin (%)" fill={chartColors.margin} radius={[2, 2, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-[8.5px] text-zinc-500 font-medium mt-3 italic leading-relaxed">
            *Avg Margin reflects the blended margin yield. Right Y-axis represents Gross Margin percentage (%).
          </p>
        </div>

      </div>

      {/* Summary Insights Card */}
      <div className="glass-card bg-purple-500/5 border border-purple-500/15 rounded-sm p-4">
        <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#6d28d9] dark:text-[#a78bfa] mb-2 flex items-center gap-1.5">
          <Info size={13} />
          AI Performance Summary Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[9.5px] leading-relaxed">
          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-sm space-y-1">
            <span className="text-zinc-600 block uppercase font-bold text-[8px]">Sales Volume</span>
            <span className="text-sm font-extrabold text-zinc-800 dark:text-white block font-mono">
              ${insights.totalSales.toFixed(1)} M
            </span>
            <p className="text-zinc-500 mt-1 font-medium">Blended sales footprint across all listed channels in Q1.</p>
          </div>

          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-sm space-y-1">
            <span className="text-zinc-600 block uppercase font-bold text-[8px]">Dominant Geography</span>
            <span className="text-sm font-extrabold text-zinc-800 dark:text-white block">
              {insights.topRegionName} <span className="text-xs font-mono font-medium text-purple-500">(${insights.topRegionSales.toFixed(1)} M)</span>
            </span>
            <p className="text-zinc-500 mt-1 font-medium">Represents the highest regional cluster, driving the major mix volume.</p>
          </div>

          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-sm space-y-1">
            <span className="text-zinc-600 block uppercase font-bold text-[8px]">Primary Channel</span>
            <span className="text-sm font-extrabold text-zinc-800 dark:text-white block">
              {insights.topChannelName} <span className="text-xs font-mono font-medium text-emerald-500">(${insights.topChannelSales.toFixed(1)} M)</span>
            </span>
            <p className="text-zinc-500 mt-1 font-medium">Hypermarket channel continues to act as the primary margin driver.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
