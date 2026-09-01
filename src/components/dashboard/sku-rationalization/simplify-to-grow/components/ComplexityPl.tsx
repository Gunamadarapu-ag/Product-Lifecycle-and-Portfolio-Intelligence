import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Info } from 'lucide-react';
import { EnrichedSKU } from '../types';
import { CAT_COLORS } from '../utils';
import { chartDatum } from '../../../../../utils/rechartsCompat';

interface ComplexityPlProps {
  categories: any[];
  skus: EnrichedSKU[];
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  costDriverFilter: 'All' | 'downtime' | 'transport' | 'waste';
  setCostDriverFilter: (filter: 'All' | 'downtime' | 'transport' | 'waste') => void;
  handleSkuClick: (sku: EnrichedSKU) => void;
  isDarkMode: boolean;
}

export const ComplexityPl: React.FC<ComplexityPlProps> = ({
  categories,
  skus,
  selectedCategory,
  setSelectedCategory,
  costDriverFilter,
  setCostDriverFilter,
  handleSkuClick,
  isDarkMode,
}) => {
  const tick = isDarkMode ? '#a1a1aa' : '#52525b';
  const grid = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const ttBg = isDarkMode ? '#1a1a24' : '#fff';
  const ttBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div>
      <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-3 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          ③ Complexity P&amp;L — Three Hidden Cost Drivers
        </h3>
        <span className="ml-auto text-[7px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10">$ Thousands · Click a category to filter</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-zinc-800 dark:text-white">
        {/* Cost Stacked Bar Chart Card */}
        <div className="lg:col-span-2 glass-card bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 p-5 rounded-xl shadow-sm">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-acies-gray dark:text-white mb-1">Hidden Costs by Category</h4>
          <p className="text-[8px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-3">Isolate specific cost drivers using the pills below · Click category bars/cards to filter IPPV table</p>
          
          {/* Cost Driver Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4 bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/5">
            <span className="text-[7.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mr-2">Focus Cost Driver:</span>
            {[
              { id: 'All', label: 'All Drivers (Stacked)', color: '#6b7280' },
              { id: 'downtime', label: 'Production Downtime', color: '#ef4444' },
              { id: 'transport', label: 'Transport Overhead', color: '#f59e0b' },
              { id: 'waste', label: 'Waste & Write-off', color: '#8b5cf6' },
            ].map(driver => (
              <button
                key={driver.id}
                onClick={() => setCostDriverFilter(driver.id as any)}
                className={`px-2.5 py-1 rounded-full text-[7.5px] font-black uppercase tracking-wider transition-all border cursor-pointer outline-none ${
                  costDriverFilter === driver.id 
                    ? 'text-white shadow-sm' 
                    : 'border-black/5 dark:border-white/5 text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 bg-transparent'
                }`}
                style={costDriverFilter === driver.id ? { backgroundColor: driver.color, borderColor: 'transparent' } : {}}
              >
                {driver.label}
              </button>
            ))}
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} vertical />
                <XAxis dataKey="cat" tick={{ fill: tick, fontSize: 8, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: tick, fontSize: 8 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: ttBg, borderColor: ttBorder, fontSize: '9px' }}
                  formatter={(v: any, name: string) => [`$${v}k`, name]}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const cat = categories.find(c => c.cat === label);
                    
                    let worstSkuName = cat?.worstSku?.name;
                    let worstSkuCost = cat?.worstSku?.totalHiddenCost;
                    let culpritLabel = "Top Cost Culprit";
                    
                    if (costDriverFilter === 'downtime') {
                      worstSkuName = cat?.worstDowntimeSku?.name;
                      worstSkuCost = cat?.worstDowntimeSku?.productionDowntimeCost;
                      culpritLabel = "Downtime Culprit";
                    } else if (costDriverFilter === 'transport') {
                      worstSkuName = cat?.worstTransportSku?.name;
                      worstSkuCost = cat?.worstTransportSku?.transportOverheadCost;
                      culpritLabel = "Transport Culprit";
                    } else if (costDriverFilter === 'waste') {
                      worstSkuName = cat?.worstWasteSku?.name;
                      worstSkuCost = cat?.worstWasteSku?.wasteWriteOffCost;
                      culpritLabel = "Waste Culprit";
                    }
                    
                    return (
                      <div className="rounded-xl border p-3 text-[8.5px] shadow-xl" style={{ backgroundColor: ttBg, borderColor: ttBorder }}>
                        <div className="font-black mb-2" style={{ color: CAT_COLORS[label] }}>{label}</div>
                        {payload.map((p: any) => (
                          <div key={p.name} className="flex justify-between gap-4 py-0.5">
                            <span className="text-zinc-500 dark:text-zinc-400 font-bold">{p.name}</span>
                            <span className="font-black" style={{ color: p.fill }}>${p.value}k</span>
                          </div>
                        ))}
                        {cat && worstSkuName && (
                          <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 text-zinc-500 dark:text-zinc-400 flex flex-col gap-0.5">
                            <span className="font-black text-zinc-500 dark:text-zinc-400">{culpritLabel}:</span>
                            <span className="font-bold text-amber-500">{worstSkuName} (${worstSkuCost}k)</span>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                {costDriverFilter === 'All' && (
                  <>
                    <Bar dataKey="productionDowntime" name="Production Downtime" stackId="a" fill="#ef4444" radius={[0,0,0,0]} barSize={28}
                      onClick={(data) => { const cat = chartDatum<{ cat: string }>(data).cat ?? null; setSelectedCategory(selectedCategory === cat ? null : cat); }}>
                      {categories.map(c => (
                        <Cell key={c.cat} fill="#ef4444" opacity={selectedCategory && selectedCategory !== c.cat ? 0.35 : 1} className="cursor-pointer" />
                      ))}
                    </Bar>
                    <Bar dataKey="transportOverhead" name="Transport Overhead" stackId="a" fill="#f59e0b" barSize={28}
                      onClick={(data) => { const cat = chartDatum<{ cat: string }>(data).cat ?? null; setSelectedCategory(selectedCategory === cat ? null : cat); }}>
                      {categories.map(c => (
                        <Cell key={c.cat} fill="#f59e0b" opacity={selectedCategory && selectedCategory !== c.cat ? 0.35 : 1} className="cursor-pointer" />
                      ))}
                    </Bar>
                    <Bar dataKey="wasteWriteOff" name="Waste & Write-off" stackId="a" fill="#8b5cf6" radius={[4,4,0,0]} barSize={28}
                      onClick={(data) => { const cat = chartDatum<{ cat: string }>(data).cat ?? null; setSelectedCategory(selectedCategory === cat ? null : cat); }}>
                      {categories.map(c => (
                        <Cell key={c.cat} fill="#8b5cf6" opacity={selectedCategory && selectedCategory !== c.cat ? 0.35 : 1} className="cursor-pointer" />
                      ))}
                    </Bar>
                  </>
                )}
                {costDriverFilter === 'downtime' && (
                  <Bar dataKey="productionDowntime" name="Production Downtime" fill="#ef4444" radius={[4,4,0,0]} barSize={28}
                    onClick={(data) => { const cat = chartDatum<{ cat: string }>(data).cat ?? null; setSelectedCategory(selectedCategory === cat ? null : cat); }}>
                    {categories.map(c => (
                      <Cell key={c.cat} fill="#ef4444" opacity={selectedCategory && selectedCategory !== c.cat ? 0.35 : 1} className="cursor-pointer" />
                    ))}
                  </Bar>
                )}
                {costDriverFilter === 'transport' && (
                  <Bar dataKey="transportOverhead" name="Transport Overhead" fill="#f59e0b" radius={[4,4,0,0]} barSize={28}
                    onClick={(data) => { const cat = chartDatum<{ cat: string }>(data).cat ?? null; setSelectedCategory(selectedCategory === cat ? null : cat); }}>
                    {categories.map(c => (
                      <Cell key={c.cat} fill="#f59e0b" opacity={selectedCategory && selectedCategory !== c.cat ? 0.35 : 1} className="cursor-pointer" />
                    ))}
                  </Bar>
                )}
                {costDriverFilter === 'waste' && (
                  <Bar dataKey="wasteWriteOff" name="Waste & Write-off" fill="#8b5cf6" radius={[4,4,0,0]} barSize={28}
                    onClick={(data) => { const cat = chartDatum<{ cat: string }>(data).cat ?? null; setSelectedCategory(selectedCategory === cat ? null : cat); }}>
                    {categories.map(c => (
                      <Cell key={c.cat} fill="#8b5cf6" opacity={selectedCategory && selectedCategory !== c.cat ? 0.35 : 1} className="cursor-pointer" />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[7.5px] font-black uppercase tracking-wider">
            <button onClick={() => setCostDriverFilter(costDriverFilter === 'downtime' ? 'All' : 'downtime')} className={`flex items-center gap-1 hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer ${costDriverFilter === 'downtime' ? 'underline text-red-500' : 'text-zinc-500'}`}>
              <span className="w-2 h-1.5 rounded-sm bg-red-500" /> Production Downtime
            </button>
            <button onClick={() => setCostDriverFilter(costDriverFilter === 'transport' ? 'All' : 'transport')} className={`flex items-center gap-1 hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer ${costDriverFilter === 'transport' ? 'underline text-amber-500' : 'text-zinc-500'}`}>
              <span className="w-2 h-1.5 rounded-sm bg-amber-500" /> Transport Overhead
            </button>
            <button onClick={() => setCostDriverFilter(costDriverFilter === 'waste' ? 'All' : 'waste')} className={`flex items-center gap-1 hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer ${costDriverFilter === 'waste' ? 'underline text-purple-500' : 'text-zinc-500'}`}>
              <span className="w-2 h-1.5 rounded-sm bg-purple-500" /> Waste &amp; Write-off
            </button>
          </div>
        </div>

        {/* Categories Drill-down Sidebar */}
        <div className="flex flex-col gap-2">
          {[...categories].sort((a, b) => {
            if (costDriverFilter === 'downtime') return b.productionDowntime - a.productionDowntime;
            if (costDriverFilter === 'transport') return b.transportOverhead - a.transportOverhead;
            if (costDriverFilter === 'waste') return b.wasteWriteOff - a.wasteWriteOff;
            return b.totalHiddenCost - a.totalHiddenCost;
          }).map(cat => {
            const isActive = selectedCategory === cat.cat;
            const catItems = isActive 
              ? skus.filter(s => s.cat === cat.cat).sort((a, b) => {
                  if (costDriverFilter === 'downtime') return b.productionDowntimeCost - a.productionDowntimeCost;
                  if (costDriverFilter === 'transport') return b.transportOverheadCost - a.transportOverheadCost;
                  if (costDriverFilter === 'waste') return b.wasteWriteOffCost - a.wasteWriteOffCost;
                  return b.totalHiddenCost - a.totalHiddenCost;
                }).slice(0, 5)
              : [];
              
            return (
              <div key={cat.cat}
                className={`glass-card bg-white dark:bg-[#1a1a24] border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all group ${isActive ? 'ring-2' : 'hover:shadow-md'}`}
                style={{ borderColor: isActive ? `${CAT_COLORS[cat.cat]}40` : undefined, boxShadow: isActive ? `0 0 0 2px ${CAT_COLORS[cat.cat]}25` : undefined }}
                onClick={() => setSelectedCategory(selectedCategory === cat.cat ? null : cat.cat)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: CAT_COLORS[cat.cat] }}>{cat.cat}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[7px] text-zinc-500 dark:text-zinc-400 font-bold">{cat.totalCount} SKUs</span>
                    <span className="text-[8px] font-black text-amber-500">${cat.totalHiddenCost}k</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-1 text-center mb-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCostDriverFilter(costDriverFilter === 'downtime' ? 'All' : 'downtime'); }}
                    className={`rounded-md p-1 transition-all border cursor-pointer ${
                      costDriverFilter === 'downtime' ? 'border-red-500/50 bg-red-500/15' : 'border-transparent bg-red-500/5 hover:bg-red-500/10'
                    }`}
                    style={{ opacity: costDriverFilter === 'All' || costDriverFilter === 'downtime' ? 1 : 0.4 }}
                  >
                    <div className="text-[8px] font-black text-red-500">${cat.productionDowntime}k</div>
                    <div className="text-[6px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider leading-tight">Downtime</div>
                  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCostDriverFilter(costDriverFilter === 'transport' ? 'All' : 'transport'); }}
                    className={`rounded-md p-1 transition-all border cursor-pointer ${
                      costDriverFilter === 'transport' ? 'border-amber-500/50 bg-amber-500/15' : 'border-transparent bg-amber-500/5 hover:bg-amber-500/10'
                    }`}
                    style={{ opacity: costDriverFilter === 'All' || costDriverFilter === 'transport' ? 1 : 0.4 }}
                  >
                    <div className="text-[8px] font-black text-amber-500">${cat.transportOverhead}k</div>
                    <div className="text-[6px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider leading-tight">Transport</div>
                  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCostDriverFilter(costDriverFilter === 'waste' ? 'All' : 'waste'); }}
                    className={`rounded-md p-1 transition-all border cursor-pointer ${
                      costDriverFilter === 'waste' ? 'border-purple-500/50 bg-purple-500/15' : 'border-transparent bg-purple-500/5 hover:bg-purple-500/10'
                    }`}
                    style={{ opacity: costDriverFilter === 'All' || costDriverFilter === 'waste' ? 1 : 0.4 }}
                  >
                    <div className="text-[8px] font-black text-purple-500">${cat.wasteWriteOff}k</div>
                    <div className="text-[6px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider leading-tight">Waste</div>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[7px] font-black">
                  <span className="text-red-500">{cat.badCount} Bad</span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-emerald-500">{cat.goodCount} Good</span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-zinc-500 dark:text-zinc-400">{cat.totalCount - cat.badCount - cat.goodCount} Neutral</span>
                  {isActive && <span className="ml-auto text-[6.5px] uppercase tracking-widest font-black text-zinc-500 dark:text-zinc-400">Expanded view</span>}
                </div>
                <div className="mt-2 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full rounded-full" style={{ width: `${Math.min((cat.totalHiddenCost / 25) * 100, 100)}%`, backgroundColor: CAT_COLORS[cat.cat] }} />
                </div>
                
                {/* Expanded SKU List Drill-down */}
                {isActive && (
                  <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-2 animate-fadeIn">
                    <div className="text-[7.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">
                      {costDriverFilter === 'downtime' ? 'Top 5 Downtime Culprits' :
                       costDriverFilter === 'transport' ? 'Top 5 Transport Culprits' :
                       costDriverFilter === 'waste' ? 'Top 5 Waste Culprits' :
                       'Top 5 Cost Culprits'} (Click to inspect)
                    </div>
                    <div className="space-y-1.5">
                      {catItems.map((s, idx) => {
                        const shownCost = costDriverFilter === 'downtime' ? s.productionDowntimeCost :
                                          costDriverFilter === 'transport' ? s.transportOverheadCost :
                                          costDriverFilter === 'waste' ? s.wasteWriteOffCost :
                                          s.totalHiddenCost;
                        return (
                          <div
                            key={s.name}
                            onClick={(e) => { e.stopPropagation(); handleSkuClick(s); }}
                            className="flex items-center gap-2 p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 transition-all text-left group/sku-row cursor-pointer"
                          >
                            <span className="text-[7.5px] font-black w-3 text-zinc-500 dark:text-zinc-400 font-mono">#{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[8px] font-black text-acies-gray dark:text-zinc-200 truncate group-hover/sku-row:text-amber-500 transition-colors">
                                {s.name.replace('Brand ', '').replace('Category ', '')}
                              </div>
                              <div className="flex h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-1 max-w-[120px]">
                                <div style={{ width: `${(s.productionDowntimeCost / (s.totalHiddenCost || 1)) * 100}%`, backgroundColor: '#ef4444' }} />
                                <div style={{ width: `${(s.transportOverheadCost / (s.totalHiddenCost || 1)) * 100}%`, backgroundColor: '#f59e0b' }} />
                                <div style={{ width: `${(s.wasteWriteOffCost / (s.totalHiddenCost || 1)) * 100}%`, backgroundColor: '#8b5cf6' }} />
                              </div>
                            </div>
                            <span className="text-[8px] font-black text-amber-500 shrink-0">${shownCost}k</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isActive && (
                  <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7px] font-bold text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-0.5">
                      Top SKU: 
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSkuClick(cat.topSku); }}
                        className="text-emerald-500 hover:underline truncate max-w-[65px] font-black cursor-pointer border-none bg-transparent">
                        {cat.topSku.name}
                      </button>
                    </span>
                    <span className="flex items-center gap-0.5">
                      Worst: 
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSkuClick(cat.worstSku); }}
                        className="text-red-500 hover:underline truncate max-w-[65px] font-black cursor-pointer border-none bg-transparent">
                        {cat.worstSku.name}
                      </button>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
