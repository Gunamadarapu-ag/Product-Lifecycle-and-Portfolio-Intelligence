/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ArrowUpRight, ArrowDownRight, RefreshCw, Download, 
  ChevronRight, TrendingUp, AlertTriangle, Layers, Info, Filter, ArrowLeft
} from 'lucide-react';
import { SKUS } from '../../../constants/data';

interface SKUPerformanceTabProps {
  isDarkMode: boolean;
  onSelectSku: (sku: typeof SKUS[0]) => void;
  onBack?: () => void;
}

// Sparkline helper using SVG
const Sparkline: React.FC<{ data: number[], isPositive: boolean }> = ({ data, isPositive }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const width = 80;
  const height = 24;
  const padding = 2;
  
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = isPositive ? '#10b981' : '#ef4444';
  const gradId = React.useId();
  
  return (
    <div className="flex items-center justify-center">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <path
          d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`}
          fill={`url(#${gradId})`}
        />
      </svg>
    </div>
  );
};

// Sku Location Helper
const getSkuLocation = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const locations = ['Italy', 'Spain', 'Germany', 'France', 'Austria', 'Poland', 'Netherlands'];
  return locations[Math.abs(hash) % locations.length];
};

export const SKUPerformanceTab: React.FC<SKUPerformanceTabProps> = ({ 
  isDarkMode, 
  onSelectSku,
  onBack
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'rev' | 'margin' | 'growth' | 'cx' | 'stockouts'>('rev');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const locationsList = ['Italy', 'Spain', 'Germany', 'France', 'Austria', 'Poland', 'Netherlands'];

  useEffect(() => {
    if (!isLocationDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#location-filter-dropdown-container')) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isLocationDropdownOpen]);

  // Compute sparkline points deterministically
  const getSparklineData = (skuName: string, baseRev: number) => {
    let hash = 0;
    for (let i = 0; i < skuName.length; i++) {
      hash = skuName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const pts: number[] = [];
    let current = baseRev;
    for (let j = 0; j < 5; j++) {
      const change = ((hash >> (j * 4)) & 0xf) - 7.5; // [-7.5, 7.5] %
      current = current * (1 + change / 100);
      pts.push(current);
    }
    return pts;
  };

  // Filter and Sort SKUs
  const processedSkus = useMemo(() => {
    return SKUS.map(s => {
      const location = getSkuLocation(s.name);
      const sparklineData = getSparklineData(s.name, s.rev);
      return {
        ...s,
        location,
        sparklineData,
        isPositive: s.growth >= 0
      };
    });
  }, []);

  const filteredSKUs = useMemo(() => {
    return processedSkus.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.cat.toLowerCase().includes(searchQuery.toLowerCase());
      
      const normalizedCat = s.cat === 'Home Care' ? 'Household' : s.cat;
      const matchCat = categoryFilter === 'ALL' || normalizedCat === categoryFilter;
      
      const matchLocation = selectedLocations.length === 0 || selectedLocations.includes(s.location);
      
      return matchSearch && matchCat && matchLocation;
    });
  }, [processedSkus, searchQuery, categoryFilter, selectedLocations]);

  const sortedSKUs = useMemo(() => {
    const sorted = [...filteredSKUs];
    sorted.sort((a, b) => {
      let aVal: any = a[sortField === 'cx' ? 'cx' : sortField];
      let bVal: any = b[sortField === 'cx' ? 'cx' : sortField];
      
      if (sortField === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredSKUs, sortField, sortOrder]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    // We scale to match the 109 active SKUs narrative
    const totalCount = 109; 
    const totalSales = 851.2; // $ M
    const avgMargin = 38.53; // %
    const rationalizeCount = 35;
    
    return {
      totalCount,
      totalSales,
      avgMargin,
      rationalizeCount
    };
  }, []);

  const exportCSV = () => {
    const headers = ['SKU Name', 'Category', 'Location', 'Revenue ($ M)', 'Gross Margin %', 'YoY Growth %', 'Complexity', 'Stockouts'];
    const rows = sortedSKUs.map(s => [
      s.name,
      s.cat,
      s.location,
      s.rev,
      s.margin,
      (s.growth * 100).toFixed(1),
      s.cx.toFixed(2),
      s.stockouts
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SKU_Performance_Directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find max revenue for progress bar calculation
  const maxRevenue = useMemo(() => {
    return Math.max(...SKUS.map(s => s.rev));
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-zinc-600 dark:text-zinc-400 cursor-pointer bg-transparent"
              title="Back to Home"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-display leading-tight text-acies-gray dark:text-white">SKU Performance Ledger</h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium">Portfolio-wide active SKU performance analysis and trends</p>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Active SKUs */}
        <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[8px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-wider block">
            Total Active SKUs
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-display font-extrabold text-zinc-800 dark:text-white">
              {stats.totalCount}
            </span>
            <span className="text-[8px] text-zinc-500 uppercase font-bold">Products</span>
          </div>
        </div>

        {/* Avg Margin */}
        <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[8px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-wider block">
            Avg Gross Margin
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-display font-extrabold text-emerald-500">
              {stats.avgMargin}%
            </span>
            <span className="text-[8px] text-emerald-500 uppercase font-bold">MTD Avg</span>
          </div>
        </div>

        {/* Total SKU Revenue */}
        <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[8px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-wider block">
            Total SKU Revenue
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-display font-extrabold text-blue-500">
              ${stats.totalSales}M
            </span>
            <span className="text-[8px] text-blue-500 uppercase font-bold">Annualized</span>
          </div>
        </div>

        {/* Rationalize Flags */}
        <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[8px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-wider block">
            Rationalization Candidates
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-display font-extrabold text-red-500">
              {stats.rationalizeCount}
            </span>
            <span className="text-[8px] text-red-500 uppercase font-bold">Candidates</span>
          </div>
        </div>
      </div>

      {/* Directory Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2.5 rounded-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2 py-1.5 rounded-sm">
            <Filter size={11} className="text-[#6d28d9] dark:text-[#a78bfa] shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Filters</span>
          </div>

          {/* Category Pills */}
          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden bg-black/5 dark:bg-white/5 p-0.5 shrink-0">
            {['ALL', 'Beverages', 'Snacks', 'Personal Care', 'Dairy', 'Household', 'Beauty', 'Fashion'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryCategoryHelper(cat)}
                className={`px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer ${
                  categoryFilter === (cat === 'ALL' ? 'ALL' : cat)
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white bg-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Location Dropdown */}
          <div id="location-filter-dropdown-container" className="relative shrink-0 ml-auto sm:ml-2">
            <button
              type="button"
              onClick={() => setIsLocationDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider rounded-sm text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              <span>
                {selectedLocations.length === 0
                  ? 'All Locations'
                  : selectedLocations.length === 1
                    ? selectedLocations[0]
                    : `${selectedLocations.length} Locations`}
              </span>
              <span className="text-[7px]">▼</span>
            </button>

            {isLocationDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-lg rounded-sm py-2 z-50 text-[9px] text-zinc-700 dark:text-zinc-300">
                <div className="px-3 py-1 border-b border-black/5 dark:border-white/5 flex justify-between items-center mb-1.5 font-bold uppercase text-[8px] text-zinc-400">
                  <span>Select Locations</span>
                  {selectedLocations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedLocations([])}
                      className="text-[#6d28d9] dark:text-[#a78bfa] hover:underline bg-transparent border-none p-0 cursor-pointer font-bold uppercase text-[7px]"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto px-1">
                  {locationsList.map(loc => {
                    const isChecked = selectedLocations.includes(loc);
                    return (
                      <label
                        key={loc}
                        className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedLocations(prev => prev.filter(x => x !== loc));
                            } else {
                              setSelectedLocations(prev => [...prev, loc]);
                            }
                          }}
                          className="rounded text-[#6d28d9] focus:ring-[#6d28d9] h-3 w-3 accent-[#6d28d9]"
                        />
                        <span className="font-semibold">{loc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search box */}
          <div className="relative w-full max-w-[240px] sm:ml-2">
            <input 
              type="text" 
              placeholder="Search SKUs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm py-1.5 px-3 pl-8 text-[9px] font-bold text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500/50"
            />
            <Search size={11} className="absolute left-2.5 top-2.5 text-zinc-400" />
          </div>
        </div>

        <button 
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider rounded-sm text-zinc-700 dark:text-zinc-500 cursor-pointer border-none"
        >
          <Download size={11} />
          Export CSV
        </button>
      </div>

      {/* SKU Table Card */}
      <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">SKU Ledger List ({filteredSKUs.length} items)</span>
          <span className="text-[8px] text-zinc-500 dark:text-zinc-600 font-bold uppercase tracking-wider">Click any SKU row to inspect details & mitigate trends</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold">
                <th className="p-3 pl-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" onClick={() => handleSort('name')}>
                  SKU Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" onClick={() => handleSort('rev')}>
                  Revenue ($ M) {sortField === 'rev' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="p-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" onClick={() => handleSort('margin')}>
                  Gross Margin % {sortField === 'margin' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="p-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" onClick={() => handleSort('growth')}>
                  YoY Growth % {sortField === 'growth' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="p-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" onClick={() => handleSort('cx')}>
                  Complexity {sortField === 'cx' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="p-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" onClick={() => handleSort('stockouts')}>
                  Stockouts {sortField === 'stockouts' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="p-3 text-center">Performance Trend</th>
                <th className="p-3 pr-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sortedSKUs.map((sku) => {
                const revenuePct = (sku.rev / maxRevenue) * 100;
                
                return (
                  <tr 
                    key={sku.name}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors bg-[#fafaf7]/50 dark:bg-zinc-950/5"
                  >
                    {/* SKU Name */}
                    <td className="p-3 pl-4 font-bold text-zinc-900 dark:text-zinc-200">
                      {sku.name}
                    </td>
                    
                    {/* Category */}
                    <td className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">
                      {sku.cat}
                    </td>

                    {/* Location */}
                    <td className="p-3 text-zinc-600 dark:text-zinc-500">
                      {sku.location}
                    </td>

                    {/* Revenue */}
                    <td className="p-3 font-mono font-bold text-zinc-800 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="w-10">${sku.rev}M</span>
                        <div className="w-12 bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(5, revenuePct))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Gross Margin % */}
                    <td className="p-3 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[9px] ${
                        sku.margin >= 40 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : sku.margin >= 30 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {sku.margin}%
                      </span>
                    </td>

                    {/* YoY Growth % */}
                    <td className="p-3 font-mono font-bold">
                      <div className={`flex items-center gap-0.5 ${
                        sku.growth >= 0 ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {sku.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {(sku.growth * 100).toFixed(1)}%
                      </div>
                    </td>

                    {/* Operational Complexity */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${sku.cx >= 0.6 ? 'bg-red-500' : sku.cx >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${sku.cx * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-[9px] text-zinc-500">{sku.cx.toFixed(2)}</span>
                      </div>
                    </td>

                    {/* Stockouts */}
                    <td className="p-3 font-mono font-bold text-center">
                      <span className={sku.stockouts >= 4 ? 'text-red-500' : sku.stockouts >= 2 ? 'text-amber-500' : 'text-zinc-500'}>
                        {sku.stockouts} events
                      </span>
                    </td>

                    {/* Inline Sparkline */}
                    <td className="p-3">
                      <Sparkline data={sku.sparklineData} isPositive={sku.isPositive} />
                    </td>

                    {/* Actions */}
                    <td className="p-3 pr-4 text-center">
                      <button 
                        onClick={() => onSelectSku(sku)}
                        className="px-2 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-[#6d28d9] hover:text-white rounded-sm text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none text-zinc-700 dark:text-zinc-400"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );

  function setCategoryCategoryHelper(cat: string) {
    setCategoryFilter(cat);
  }
};
