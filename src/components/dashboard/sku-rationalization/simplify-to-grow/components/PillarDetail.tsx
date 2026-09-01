import React from 'react';
import { TrendingUp, TrendingDown, ExternalLink, X, ChevronRight } from 'lucide-react';
import { PillarDef, EnrichedSKU } from '../types';
import { TAB_ROUTE_ICONS } from '../utils';

interface PillarDetailProps {
  pillar: PillarDef;
  skus: EnrichedSKU[];
  onNavigate: (tab: number, extraParams?: string) => void;
  onClose: () => void;
  onSkuClick: (sku: EnrichedSKU) => void;
}

export const PillarDetail: React.FC<PillarDetailProps> = ({ pillar, skus, onNavigate, onClose, onSkuClick }) => {
  const topSkus = pillar.topSkus(skus);
  const worstSkus = pillar.worstSkus(skus);
  const RouteIcon = TAB_ROUTE_ICONS[pillar.routeTab] ?? ChevronRight;
  
  return (
    <div className="col-span-full rounded-xl border-2 p-5 mt-1 animate-fadeIn text-zinc-800 dark:text-white"
      style={{ borderColor: `${pillar.color}25`, background: `linear-gradient(135deg, ${pillar.color}06, transparent)` }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: pillar.color }}>
            {pillar.pillar} — Deep Dive
          </div>
          <div className="text-xs font-black text-acies-gray dark:text-white">
            {pillar.kpiLabel}: <span style={{ color: pillar.color }}>{pillar.kpiValue}</span>
          </div>
          <p className="text-[8px] text-zinc-600 dark:text-zinc-400 mt-1 max-w-lg leading-relaxed">{pillar.insight}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onNavigate(pillar.routeTab, pillar.extraParams)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-white transition-all hover:opacity-90 cursor-pointer border-none"
            style={{ backgroundColor: pillar.color }}>
            <RouteIcon size={10} /> {pillar.routeLabel} <ExternalLink size={9} />
          </button>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-zinc-400 transition-all cursor-pointer border-none bg-transparent">
            <X size={13} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[7.5px] font-black uppercase tracking-widest text-emerald-500 mb-2 flex items-center gap-1">
            <TrendingUp size={9} /> Top 3 — Helping This Score
          </div>
          <div className="space-y-1.5">
            {topSkus.map((s, i) => (
              <button key={s.name} onClick={() => onSkuClick(s)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 transition-all cursor-pointer text-left">
                <span className="text-[7px] font-black w-4 text-center rounded text-emerald-600 dark:text-emerald-400">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[8.5px] font-black text-acies-gray dark:text-white truncate">{s.name}</div>
                  <div className="text-[7px] text-zinc-400 font-bold">{s.cat}</div>
                </div>
                <span className="text-[8px] font-black text-emerald-500">
                  {pillar.id === 'consumer' ? `IPPV ${s.ippv.toFixed(0)}` :
                   pillar.id === 'retailer' ? `Shelf ${s.shelfProductivity.toFixed(0)}` :
                   pillar.id === 'valuechain' ? `$${s.totalHiddenCost}L` :
                   pillar.id === 'e2e' ? `+${(s.growth * 100).toFixed(1)}%` :
                   s.complexityType === 'Good Variety' ? '✓ Good' : `CX ${s.cx.toFixed(2)}`}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[7.5px] font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-1">
            <TrendingDown size={9} /> Bottom 3 — Dragging This Score
          </div>
          <div className="space-y-1.5">
            {worstSkus.map((s, i) => (
              <button key={s.name} onClick={() => onSkuClick(s)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/15 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-all cursor-pointer text-left">
                <span className="text-[7px] font-black w-4 text-center rounded text-red-400">!{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[8.5px] font-black text-acies-gray dark:text-white truncate">{s.name}</div>
                  <div className="text-[7px] text-zinc-400 font-bold">{s.cat}</div>
                </div>
                <span className="text-[8px] font-black text-red-500">
                  {pillar.id === 'consumer' ? `IPPV ${s.ippv.toFixed(0)}` :
                   pillar.id === 'retailer' ? `Shelf ${s.shelfProductivity.toFixed(0)}` :
                   pillar.id === 'valuechain' ? `$${s.totalHiddenCost}L` :
                   pillar.id === 'e2e' ? `${(s.growth * 100).toFixed(1)}%` :
                   `CX ${s.cx.toFixed(2)}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
