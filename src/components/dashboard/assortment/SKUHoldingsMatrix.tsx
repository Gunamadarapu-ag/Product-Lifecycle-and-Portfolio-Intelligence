import React, { useState } from 'react';
import { SKUS } from '../../../constants/data';
import { useLiveData } from '../../../api/liveData';
import { Search, AlertTriangle, CheckCircle, XCircle, Minus, Layers, Info, Filter, ArrowUpDown } from 'lucide-react';

// The not-listed catalog cutoffs below (85, 48) were authored against
// SKUS[].rev, which is ~22.43x inflated vs. real net sales (TODO.md O1). A
// straight unit conversion (divide by 22.43) does not preserve selectivity:
// SKUS[].rev is a roughly uniform hand-typed spread, while real per-SKU
// revenue is Pareto-skewed, so the same ratio-to-mean threshold catches a very
// different share of SKUs (verified: 85 selects 44% of SKUs on the old scale,
// but 85/22.43 selects 71% on the real distribution; 48 selects 8% vs. 32%).
// These constants are the real-revenue values ($M) that reproduce the
// original 44%/8% selectivity, computed from a live /api/skus?months=12 pull
// (119 SKUs, 2026-09-29) — recompute if the dataset regenerates.
const NL_NOT_LISTED_LIVE_M = 2.69;
const FAP_NOT_LISTED_LIVE_M = 0.65;

interface SKUHoldingsMatrixProps {
  isDarkMode?: boolean;
}

const COUNTRIES = [
  { name: 'Italy', code: 'IT', capacity: 95 },
  { name: 'Spain', code: 'ES', capacity: 62 },
  { name: 'Germany', code: 'DE', capacity: 88 },
  { name: 'France', code: 'FR', capacity: 68 },
  { name: 'Austria', code: 'AT', capacity: 54 },
  { name: 'Poland', code: 'PL', capacity: 76 },
  { name: 'Netherlands', code: 'NL', capacity: 42 }
];

export const SKUHoldingsMatrix: React.FC<SKUHoldingsMatrixProps> = () => {
  const { skuRevenueM } = useLiveData();
  const isLiveRev = !!skuRevenueM;
  const revOf = (sku: any): number => skuRevenueM?.[sku.name] ?? sku.rev;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCell, setSelectedCell] = useState<{ skuName: string; countryName: string } | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'rev' | 'margin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Categories list
  const categories = ['All', 'Beverages', 'Dairy', 'Snacks', 'Personal Care', 'Household', 'Beauty', 'Fashion'];

  // Determine SKU listing status for a country
  const getSkuStatus = (sku: any, country: string) => {
    const rev = revOf(sku);

    // Netherlands: smallest catalog (45 SKUs) - list only high-revenue items
    const nlThreshold = isLiveRev ? NL_NOT_LISTED_LIVE_M : 85;
    if (country === 'Netherlands' && rev < nlThreshold) return 'not-listed';

    // France, Austria, Poland: medium catalog (80 SKUs) - omit highly complex low-velocity items
    const fapThreshold = isLiveRev ? FAP_NOT_LISTED_LIVE_M : 48;
    if ((country === 'France' || country === 'Austria' || country === 'Poland') && rev < fapThreshold) return 'not-listed';

    // Germany (98), Spain (100), Italy (100): largest catalogs - list almost everything
    if (sku.stockouts >= 6) return 'critical'; // Extreme stockouts
    if (sku.stockouts >= 3 || sku.growth < 0) return 'warning'; // Stockout risk or negative growth
    return 'active'; // Healthy stock level
  };

  // Calculate local margin (incorporates regional category offsets)
  const getSkuLocalMargin = (sku: any, country: string) => {
    const category = sku.cat || 'Beverages';
    const categoryOffsets: Record<string, Record<string, number>> = {
      'Beverages': { 'Italy': 0.8, 'Spain': -0.4, 'Germany': 0.5, 'France': -0.2, 'Austria': 1.1, 'Poland': -0.6, 'Netherlands': 0.2 },
      'Snacks':    { 'Italy': -0.5, 'Spain': 0.9, 'Germany': -0.2, 'France': 0.6, 'Austria': -0.4, 'Poland': 1.2, 'Netherlands': -0.8 },
      'Personal Care': { 'Italy': 1.2, 'Spain': -0.6, 'Germany': 0.8, 'France': -0.4, 'Austria': 0.5, 'Poland': -1.0, 'Netherlands': 0.6 },
      'Dairy':     { 'Italy': -0.9, 'Spain': 0.4, 'Germany': -0.6, 'France': 1.1, 'Austria': -0.2, 'Poland': 0.5, 'Netherlands': -0.4 },
      'Household': { 'Italy': 0.5, 'Spain': -1.1, 'Germany': 0.3, 'France': -0.5, 'Austria': 0.8, 'Poland': -0.3, 'Netherlands': 0.4 },
    };
    const offset = categoryOffsets[category]?.[country] || 0;
    return parseFloat((sku.margin + offset).toFixed(1));
  };

  // Filter and sort SKUs
  const filteredSkus = SKUS.filter(sku => {
    const matchesSearch = sku.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || sku.cat === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let factorA: string | number = sortBy === 'name' ? a.name : sortBy === 'rev' ? revOf(a) : a.margin;
    let factorB: string | number = sortBy === 'name' ? b.name : sortBy === 'rev' ? revOf(b) : b.margin;

    if (typeof factorA === 'string') {
      return sortOrder === 'asc' 
        ? factorA.localeCompare(factorB as string) 
        : (factorB as string).localeCompare(factorA);
    } else {
      return sortOrder === 'asc' 
        ? (factorA as number) - (factorB as number) 
        : (factorB as number) - (factorA as number);
    }
  });

  const handleSort = (field: 'name' | 'rev' | 'margin') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to high-to-low for numbers
    }
  };

  const getCellDetails = () => {
    if (!selectedCell) return null;
    const sku = SKUS.find(s => s.name === selectedCell.skuName);
    const country = COUNTRIES.find(c => c.name === selectedCell.countryName);
    if (!sku || !country) return null;

    const status = getSkuStatus(sku, country.name);
    const localMargin = getSkuLocalMargin(sku, country.name);
    const localSalesVal = (sku.rev * (country.capacity / 100) * 0.035).toFixed(2); // scaled representation of local sales

    return {
      sku,
      country,
      status,
      localMargin,
      localSalesVal
    };
  };

  const details = getCellDetails();

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-5 flex flex-col mb-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-black/5 dark:border-white/5 pb-3">
        <div>
          <h4 className="text-xs uppercase font-bold tracking-widest text-zinc-400">SKU Regional Holdings Matrix</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Explore specific SKU distributions across European warehouses. Inspect stock levels, regional profit margins, and localize stockout warnings.</p>
        </div>
        <div className="flex items-center gap-2 text-[7.5px] uppercase font-extrabold tracking-widest bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded">
          <Layers size={10} />
          <span>Catalog Visualized ({filteredSkus.length} SKUs)</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-5 justify-between">
        
        {/* Category Pill Filters */}
        <div className="flex flex-wrap bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/5 gap-0.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-[8.5px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-zinc-800 text-acies-yellow shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full lg:w-72">
          <Search size={12} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search variant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/5 dark:bg-zinc-800/60 border border-black/10 dark:border-white/10 rounded-sm pl-8 pr-3 py-1.5 text-[10px] outline-none text-zinc-800 dark:text-zinc-200 focus:border-acies-yellow/45 transition-colors"
          />
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left/Middle: Matrix Table (3/4 columns) */}
        <div className="xl:col-span-3 overflow-x-auto border border-black/10 dark:border-white/10 rounded-sm">
          <table className="w-full text-left border-collapse text-[9.5px]">
            <thead>
              <tr className="bg-black/5 dark:bg-zinc-900 border-b border-black/10 dark:border-white/10 text-[8.5px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-2.5 px-3 cursor-pointer select-none hover:text-zinc-300 min-w-[140px]" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    SKU Name
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="py-2.5 px-2 cursor-pointer select-none hover:text-zinc-300" onClick={() => handleSort('rev')}>
                  <div className="flex items-center gap-1">
                    Sales
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="py-2.5 px-2 cursor-pointer select-none hover:text-zinc-300" onClick={() => handleSort('margin')}>
                  <div className="flex items-center gap-1">
                    Margin
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                {COUNTRIES.map(c => (
                  <th key={c.code} className="py-2.5 px-2 text-center font-mono">
                    <span className="cursor-help" title={`${c.name} (Capacity: ${c.capacity}%)`}>
                      {c.code}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSkus.map((sku) => (
                <tr 
                  key={sku.name} 
                  className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-colors"
                >
                  <td className="py-2 px-3 font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]">
                    <span className="block truncate">{sku.name}</span>
                    <span className="text-[7px] text-zinc-500 uppercase tracking-widest">{sku.cat}</span>
                  </td>
                  <td className="py-2 px-2 font-mono font-bold text-zinc-500">${revOf(sku).toLocaleString('en-US', { maximumFractionDigits: 1 })}M</td>
                  <td className="py-2 px-2 font-mono font-bold text-emerald-500">{sku.margin}%</td>
                  
                  {COUNTRIES.map(c => {
                    const status = getSkuStatus(sku, c.name);
                    const isSelected = selectedCell?.skuName === sku.name && selectedCell?.countryName === c.name;
                    
                    return (
                      <td 
                        key={c.code}
                        onClick={() => setSelectedCell({ skuName: sku.name, countryName: c.name })}
                        className={`py-2 px-2 text-center cursor-pointer transition-all border ${
                          isSelected 
                            ? 'bg-acies-yellow/10 border-acies-yellow/40' 
                            : 'border-transparent hover:bg-black/10 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex justify-center items-center">
                          {status === 'active' && (
                            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Listed / Healthy Stock" />
                          )}
                          {status === 'warning' && (
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Listed / Stockout Risk" />
                          )}
                          {status === 'critical' && (
                            <div className="w-2.5 h-2.5 bg-rose-500 rotate-45 border border-rose-600" title="Severe Stockout" />
                          )}
                          {/* `title` on a Lucide icon lands on the <svg> as an
                              attribute, which renders no tooltip — SVG needs a
                              <title> child. The span makes it actually appear. */}
                          {status === 'not-listed' && (
                            <span title="Not Listed" className="inline-flex">
                              <Minus size={10} className="text-zinc-300 dark:text-zinc-700" />
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Selected Cell Diagnostic Panel (1/4 column) */}
        <div className="xl:col-span-1">
          {details ? (
            <div className="p-4 bg-black/5 dark:bg-zinc-800/40 border border-black/10 dark:border-white/10 rounded-sm flex flex-col justify-between h-full min-h-[260px] animate-fadeIn text-left">
              <div className="space-y-4">
                
                {/* Panel Title */}
                <div className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-2">
                  <div>
                    <h5 className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{details.country.name} Depot</h5>
                    <p className="text-[7.5px] font-bold font-mono text-zinc-400 mt-0.5">Capacity Load: {details.country.capacity}%</p>
                  </div>
                  <button 
                    onClick={() => setSelectedCell(null)}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 border-none bg-transparent cursor-pointer p-0.5"
                  >
                    <XCircle size={14} />
                  </button>
                </div>

                {/* SKU Details */}
                <div className="space-y-2 text-[9px]">
                  <div>
                    <span className="text-zinc-500 uppercase block font-bold text-[7.5px]">Selected SKU</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{details.sku.name}</span>
                    <span className="text-[7px] text-zinc-500 uppercase tracking-widest block">{details.sku.cat}</span>
                  </div>

                  {/* Status Box */}
                  <div className="pt-2">
                    <span className="text-zinc-500 uppercase block font-bold text-[7.5px] mb-1">Holdings Status</span>
                    {details.status === 'active' && (
                      <span className="px-2 py-0.5 rounded-full text-[7px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-flex items-center gap-1">
                        <CheckCircle size={8} /> Listed / Healthy Stock
                      </span>
                    )}
                    {details.status === 'warning' && (
                      <span className="px-2 py-0.5 rounded-full text-[7px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 inline-flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={8} /> Stockout Risk / Slow Sales
                      </span>
                    )}
                    {details.status === 'critical' && (
                      <span className="px-2 py-0.5 rounded-full text-[7px] font-extrabold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20 inline-flex items-center gap-1">
                        <XCircle size={8} /> Critical Sourcing Disruption
                      </span>
                    )}
                    {details.status === 'not-listed' && (
                      <span className="px-2 py-0.5 rounded-full text-[7px] font-extrabold uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 inline-flex items-center gap-1">
                        <Minus size={8} /> Not Listed in Catalog
                      </span>
                    )}
                  </div>

                  {/* Local Metrics */}
                  {details.status !== 'not-listed' && (
                    <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="font-sans text-zinc-500 font-bold">Local Sales:</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-200">${details.localSalesVal} M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans text-zinc-500 font-bold">Local Margin:</span>
                        <span className="font-bold text-emerald-500">{details.localMargin}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans text-zinc-500 font-bold">Supplier Lead Time:</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-200">{details.sku.lead} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans text-zinc-500 font-bold">Stockouts Count:</span>
                        <span className={`font-bold ${details.sku.stockouts >= 4 ? 'text-rose-500 font-extrabold' : 'text-zinc-500'}`}>
                          {details.sku.stockouts} / yr
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sourcing Action Recommendations */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5">
                  <span className="text-zinc-500 uppercase block font-bold text-[7.5px] mb-1">Prescriptive SLA</span>
                  <p className="text-[8.5px] leading-relaxed text-zinc-500">
                    {details.status === 'active' && 'Current replenishment cycle is stable. Maintain safety stock reserves.'}
                    {details.status === 'warning' && `Low velocity/volatility warning. Consider optimizing regional logistics buffers or re-negotiating supplier SLAs (lead time: ${details.sku.lead} days).`}
                    {details.status === 'critical' && `Immediate action needed. Reallocate listing allocations to warehouses with free capacity to mitigate stockout penalties.`}
                    {details.status === 'not-listed' && 'Variant is not distributed to this regional warehouse. Shifting listings here requires catalog activation.'}
                  </p>
                </div>

              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/5 text-[7px] text-zinc-400 font-sans flex items-center gap-1.5">
                <Info size={10} className="text-zinc-500" />
                <span>Double-click cells to stage reallocations.</span>
              </div>

            </div>
          ) : (
            <div className="p-5 border border-dashed border-black/10 dark:border-white/10 rounded-sm flex flex-col items-center justify-center text-center h-full min-h-[260px] opacity-55">
              <Filter size={20} className="text-zinc-400 mb-2" />
              <p className="text-[9px] uppercase font-extrabold tracking-widest text-zinc-500">Cell Diagnostics</p>
              <p className="text-[8px] text-zinc-500 mt-1 max-w-[150px] leading-relaxed">Click any colored dot inside the holdings matrix to inspect SKU performance and sourcing diagnostics.</p>
            </div>
          )}
        </div>

      </div>

      {/* Legend Block */}
      <div className="mt-4 pt-3.5 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-x-6 gap-y-2 text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Healthy Listing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Stockout Risk / Performance issues
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-rose-500 rotate-45 border border-rose-600" />
          Critical Stockout / Disrupted Sourcing
        </span>
        <span className="flex items-center gap-1.5">
          <Minus size={10} className="text-zinc-400" />
          Not Listed at location
        </span>
      </div>

    </div>
  );
};
