/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { SKUS } from '../../../constants/data';
import { srClassify, SR_CLASSES, getSkuLocation } from './SKURationalization';
import { useLiveData } from '../../../api/liveData';

interface ProductDirectoryProps {
  onSelectSku: (sku: typeof SKUS[0]) => void;
  selectedLocation?: string;
  shortlistedSkus?: string[];
  frozenSkus?: string[];
}

export const ProductDirectory: React.FC<ProductDirectoryProps> = ({ 
  onSelectSku, 
  selectedLocation,
  shortlistedSkus = [],
  frozenSkus = [],
}) => {
  // Real per-SKU net sales ($M); `sku.rev` is ~22x too large (TODO.md O1).
  const { skuRevenueM } = useLiveData();
  // Product Directory Search & Filtering States
  const [dirSearch, setDirSearch] = useState('');
  const [dirCatFilter, setDirCatFilter] = useState('ALL');
  const [dirSegmentFilter, setDirSegmentFilter] = useState('ALL');

  // Filter Directory SKUs
  const filteredDirSKUs = useMemo(() => {
    return SKUS.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(dirSearch.toLowerCase()) || 
                          s.cat.toLowerCase().includes(dirSearch.toLowerCase());
      
      const normalizedCat = s.cat === 'Home Care' ? 'Household' : s.cat;
      const matchCat = dirCatFilter === 'ALL' || normalizedCat === dirCatFilter;
      
      const segment = srClassify(s);
      const matchSegment = dirSegmentFilter === 'ALL' || segment === dirSegmentFilter;
      
      const matchLocation = !selectedLocation || selectedLocation === 'ALL' || getSkuLocation(s.name) === selectedLocation;
      
      return matchSearch && matchCat && matchSegment && matchLocation;
    });
  }, [dirSearch, dirCatFilter, dirSegmentFilter, selectedLocation]);

  return (
    <div className="space-y-3 pt-6 border-t border-black/5 dark:border-white/5">
      <div className="flex items-center justify-between gap-4 py-0.5 w-full">
        <div className="flex items-center gap-2 border-l-4 border-[#8b5cf6] pl-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6] dark:text-purple-300">
            ⑤ Portfolio Product Directory & Auditing Explorer
          </h3>
        </div>
        <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest hidden sm:inline">Click any product to audit detail analytics</span>
      </div>

      <div className="glass-card bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 p-5 shadow-sm rounded-xl space-y-4">
        {/* Directory Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search SKUs by name or category..." 
              value={dirSearch}
              onChange={(e) => setDirSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-lg py-2 px-3 pl-8 text-xs font-semibold text-acies-gray dark:text-white outline-none focus:border-acies-yellow"
            />
            <span className="absolute left-2.5 top-2 text-zinc-500 dark:text-zinc-500 text-xs">🔍</span>
          </div>
          <select 
            value={dirCatFilter}
            onChange={(e) => setDirCatFilter(e.target.value)}
            className="bg-black/5 dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-lg py-2 px-3 text-xs font-bold text-acies-gray dark:text-white outline-none focus:border-acies-yellow"
          >
            <option value="ALL">All Categories</option>
            <option value="Beverages">Beverages</option>
            <option value="Snacks">Snacks</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Dairy">Dairy</option>
            <option value="Household">Household</option>
            <option value="Beauty">Beauty</option>
            <option value="Fashion">Fashion</option>
          </select>
          <select 
            value={dirSegmentFilter}
            onChange={(e) => setDirSegmentFilter(e.target.value)}
            className="bg-black/5 dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-lg py-2 px-3 text-xs font-bold text-acies-gray dark:text-white outline-none focus:border-acies-yellow"
          >
            <option value="ALL">All Segments</option>
            <option value="retain">Retain</option>
            <option value="grow">Grow</option>
            <option value="bundle">Bundle</option>
            <option value="reposition">Reposition</option>
            <option value="sunset">Sunset</option>
          </select>
        </div>

        {/* Scrollable list/grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
          {filteredDirSKUs.map((sku) => {
            const cls = srClassify(sku);
            const cfg = SR_CLASSES[cls];
            const isShortlisted = shortlistedSkus.includes(sku.name);
            const isFrozen = frozenSkus.includes(sku.name);
            return (
              <div 
                key={`dir-${sku.name}`}
                onClick={() => onSelectSku(sku)}
                className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-lg hover:border-purple-500/30 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer transition-all flex flex-col justify-between h-24 group relative overflow-hidden"
              >
                <div>
                  <div className="text-[10px] font-black text-acies-gray dark:text-white truncate group-hover:text-[#8b5cf6] transition-colors flex items-center justify-between gap-1">
                    <span className="truncate">{sku.name}</span>
                    <div className="flex gap-0.5 shrink-0">
                      {isShortlisted && <span title="Shortlisted for rationalization" className="text-[9px]">⚠️</span>}
                      {isFrozen && <span title="Replenishment frozen" className="text-[9px]">❄️</span>}
                    </div>
                  </div>
                  <div className="text-[8px] text-zinc-500 dark:text-zinc-500 font-bold uppercase mt-0.5">{sku.cat} · ${(skuRevenueM?.[sku.name] ?? sku.rev).toLocaleString('en-US', { maximumFractionDigits: 1 })}M · {getSkuLocation(sku.name)}</div>
                </div>
                <div className="flex justify-between items-center mt-2 font-sans">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[7px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-widest" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {isShortlisted && (
                      <span className="text-[6px] font-black bg-amber-500/10 text-amber-500 px-1 py-0.5 rounded uppercase tracking-wider">
                        Shortlist
                      </span>
                    )}
                    {isFrozen && (
                      <span className="text-[6px] font-black bg-blue-500/10 text-blue-400 px-1 py-0.5 rounded uppercase tracking-wider">
                        Frozen
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-[#8b5cf6] dark:text-purple-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Inspect →</span>
                </div>
              </div>
            );
          })}
          {filteredDirSKUs.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
              No matching product SKUs found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
