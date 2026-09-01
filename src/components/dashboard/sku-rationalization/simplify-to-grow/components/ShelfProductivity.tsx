import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Info, ArrowRight } from 'lucide-react';
import { CAT_COLORS } from '../utils';
import { chartDatum } from '../../../../../utils/rechartsCompat';

interface ShelfProductivityProps {
  categories: any[];
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  handleNavigate: (tab: number, extraParams?: string) => void;
  isDarkMode: boolean;
}

export const ShelfProductivity: React.FC<ShelfProductivityProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  handleNavigate,
  isDarkMode,
}) => {
  const tick = isDarkMode ? '#a1a1aa' : '#52525b';
  const grid = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const ttBg = isDarkMode ? '#1a1a24' : '#fff';
  const ttBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div>
      <div className="flex items-center gap-2 border-l-4 border-sky-500 pl-3 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
          ④ Retailer Win-Win — Shelf Productivity Index
        </h3>
        <span className="ml-auto text-[7px] font-bold uppercase tracking-wider text-zinc-400">Click a category ring to filter</span>
      </div>

      <div className="glass-card bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 p-5 rounded-xl shadow-sm text-zinc-800 dark:text-white">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          {categories.map(cat => {
            const isActive = selectedCategory === cat.cat;
            return (
              <button key={cat.cat}
                onClick={() => setSelectedCategory(selectedCategory === cat.cat ? null : cat.cat)}
                className={`text-center rounded-xl p-3 transition-all border group cursor-pointer bg-transparent outline-none ${isActive ? 'ring-2 border-zinc-300 dark:border-zinc-700' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={{ borderColor: isActive ? `${CAT_COLORS[cat.cat]}40` : undefined }}>
                
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={CAT_COLORS[cat.cat]} strokeWidth="3"
                      strokeDasharray={`${(cat.avgShelf / 100) * 100} 100`} strokeLinecap="round"
                      className="transition-all duration-500" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-black" style={{ color: CAT_COLORS[cat.cat] }}>{cat.avgShelf.toFixed(0)}</span>
                  </div>
                </div>

                <div className="text-[8px] font-black uppercase tracking-wider" style={{ color: CAT_COLORS[cat.cat] }}>{cat.cat}</div>
                <div className="text-[7px] text-zinc-400 font-bold mt-0.5">
                  {cat.avgShelf < 55 ? <span className="text-amber-500">⚠ Below threshold</span> : <span className="text-emerald-500">✓ Healthy</span>}
                </div>
                <div className="text-[7px] font-bold text-zinc-500 mt-0.5">{cat.goodCount}G · {cat.badCount}B</div>
                
                {cat.avgShelf < 55 && (
                  <button onClick={e => { e.stopPropagation(); handleNavigate(1, `subtab=ph-kpi&category=${encodeURIComponent(cat.cat)}`); }}
                    className="mt-1.5 flex items-center gap-0.5 text-[6.5px] font-black uppercase tracking-wider text-sky-500 mx-auto hover:text-sky-400 transition-colors border-none bg-transparent cursor-pointer">
                    View health <ArrowRight size={7} />
                  </button>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} vertical />
              <XAxis dataKey="cat" tick={{ fill: tick, fontSize: 8, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: tick, fontSize: 8 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: ttBg, borderColor: ttBorder, fontSize: '9px' }}
                formatter={(v: any) => [`${v}/100`, 'Shelf Productivity']} />
              <Bar dataKey="avgShelf" name="Avg Shelf Productivity" radius={[4,4,0,0]} barSize={32}
                onClick={(data) => { const cat = chartDatum<{ cat: string }>(data).cat ?? null; setSelectedCategory(selectedCategory === cat ? null : cat); }}>
                {categories.map(c => (
                  <Cell key={c.cat} fill={CAT_COLORS[c.cat]} className="cursor-pointer"
                    opacity={selectedCategory && selectedCategory !== c.cat ? 0.3 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/15 text-[8px] text-sky-700 dark:text-sky-400 font-bold leading-relaxed flex items-start gap-2">
          <Info size={11} className="shrink-0 mt-0.5" />
          <span><strong>Retailer Win-Win:</strong> Categories below 55 warrant joint business planning with key accounts. &nbsp;
            <button onClick={() => handleNavigate(1, 'subtab=ph-kpi')} className="underline hover:no-underline transition-all cursor-pointer border-none bg-transparent text-sky-600 dark:text-sky-400 font-bold">
              View Portfolio Health Map →
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};
