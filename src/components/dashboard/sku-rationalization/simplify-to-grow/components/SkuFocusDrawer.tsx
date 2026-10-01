import React from 'react';
import { Scissors, Activity, Package, X } from 'lucide-react';
import { EnrichedSKU } from '../types';
import { COMPLEXITY_CONFIG } from '../utils';
import { LAYER } from '../../../../../constants/layers';
import { useDialogBehavior } from '../../../../../hooks/useDialogBehavior';
import { useLiveData } from '../../../../../api/liveData';

interface SkuFocusDrawerProps {
  sku: EnrichedSKU;
  onClose: () => void;
  onNavigate: (tab: number, extraParams?: string) => void;
  isDarkMode: boolean;
  maxIppv: number;
}

const FillBar: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max, color, label }) => (
  <div className="mb-1.5">
    <div className="flex justify-between text-[7.5px] font-bold mb-0.5">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span style={{ color }}>{value.toFixed(1)}</span>
    </div>
    <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color }} />
    </div>
  </div>
);

export const SkuFocusDrawer: React.FC<SkuFocusDrawerProps> = ({ sku, onClose, onNavigate, isDarkMode, maxIppv }) => {
  // Escape-to-close, scroll lock and focus restore, shared with ModalShell.
  useDialogBehavior(!!sku, onClose);
  // Real per-SKU net sales ($M); `sku.rev` is ~22x too large (TODO.md O1). Only
  // the raw revenue display below is switched — the derived hidden-cost/profit
  // fields on EnrichedSKU keep their built-in scale (simplify-to-grow/utils.ts,
  // Tier 2 — compound formulas with constants possibly tuned against it).
  const { skuRevenueM } = useLiveData();
  const liveRev = skuRevenueM?.[sku.name] ?? sku.rev;
  const cfg = COMPLEXITY_CONFIG[sku.complexityType];
  const growth = sku.growth * 100;
  const ippvComponents = [
    { label: 'Return on Sales (ROS)', value: sku.ros * 100, max: 60, unit: '%', color: '#6366f1' },
    { label: 'Household Penetration', value: sku.householdPenetration * 100, max: 100, unit: '%', color: '#0ea5e9' },
    { label: 'Unit Profit Pool ($M)', value: sku.unitProfitPool, max: 80, unit: 'M', color: '#10b981' },
  ];

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        style={{ zIndex: LAYER.base }}
      />

      {/* Drawer Panel */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label={`SKU focus: ${sku?.name ?? ''}`}
        style={{ zIndex: LAYER.panel }}
        className={`fixed inset-y-0 right-0 w-full sm:w-[480px] shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in-right border-l ${
          isDarkMode 
            ? 'bg-[#181824] border-zinc-800 text-white' 
            : 'bg-white border-zinc-200 text-zinc-800'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-black/10 dark:border-white/10"
            style={{ background: `linear-gradient(135deg, ${cfg.color}12, transparent)` }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                <Package size={16} style={{ color: cfg.color }} />
              </div>
              <div>
                <div className="text-[12px] font-black">{sku.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  <span className="text-[7.5px] text-zinc-500 dark:text-zinc-400 font-bold">{sku.cat}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-zinc-400 transition-all">
              <X size={14} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto text-[9.5px]">
            {/* IPPV Section */}
            <div className="space-y-3">
              <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">IPPV Performance Summary</div>
              <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                <div>
                  <div className="text-3xl font-black" style={{ color: cfg.color }}>{sku.ippv.toFixed(1)}</div>
                  <div className="text-[7px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">IPPV Score /100</div>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full" style={{ width: `${sku.ippv}%`, backgroundColor: cfg.color }} />
                  </div>
                  <div className="text-[7.5px] text-zinc-400 font-bold">vs portfolio maximum</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {ippvComponents.map(c => (
                  <FillBar key={c.label} value={c.value} max={c.max} color={c.color} label={`${c.label} (${c.value.toFixed(1)}${c.unit})`} />
                ))}
              </div>

              <div className="p-3 rounded-xl text-[8px] font-medium leading-relaxed"
                style={{ backgroundColor: `${cfg.color}10`, color: cfg.color, border: `1px solid ${cfg.color}20` }}>
                {cfg.desc}
              </div>
            </div>

            {/* Complexity P&L Cost Breakdown */}
            <div className="space-y-3">
              <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Complexity P&amp;L Cost Drivers</div>
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5 space-y-3">
                {[
                  { label: 'Production Downtime (Small runs cost)', value: sku.productionDowntimeCost, color: '#ef4444' },
                  { label: 'Transport & Logistics Overhead', value: sku.transportOverheadCost, color: '#f59e0b' },
                  { label: 'Waste & Write-off (Promo driven)', value: sku.wasteWriteOffCost, color: '#8b5cf6' },
                ].map(d => (
                  <div key={d.label} className="flex items-center justify-between gap-2">
                    <span className="text-[8px] text-zinc-500 dark:text-zinc-400 font-bold flex-1">{d.label}</span>
                    <span className="text-[9px] font-black" style={{ color: d.color }}>${d.value}L</span>
                  </div>
                ))}
                <div className="border-t border-black/10 dark:border-white/10 pt-2.5 flex justify-between">
                  <span className="text-[8.5px] font-black text-zinc-800 dark:text-zinc-400">Total Hidden Supply Chain Cost</span>
                  <span className="text-[10px] font-black text-amber-500">${sku.totalHiddenCost}L</span>
                </div>
              </div>
            </div>

            {/* SKU Vitals Table */}
            <div className="space-y-3">
              <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">SKU Vitals &amp; Commercial Health</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Revenue', value: `$${liveRev.toLocaleString('en-US', { maximumFractionDigits: 1 })}M`, color: '#6366f1' },
                  { label: 'Gross Margin', value: `${sku.margin}%`, color: '#10b981' },
                  { label: 'Growth Rate', value: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`, color: growth >= 0 ? '#10b981' : '#ef4444' },
                  { label: 'Promo Dependency', value: `${(sku.promo * 100).toFixed(0)}%`, color: sku.promo > 0.5 ? '#ef4444' : '#f59e0b' },
                  { label: 'Shelf Productivity', value: `${sku.shelfProductivity.toFixed(0)}/100`, color: '#0ea5e9' },
                  { label: 'Complexity Index', value: `${sku.cx.toFixed(2)}`, color: sku.cx > 0.6 ? '#ef4444' : '#6b7280' },
                ].map(v => (
                  <div key={v.label} className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 flex flex-col gap-0.5">
                    <span className="text-[7.5px] text-zinc-500 dark:text-zinc-400 font-bold">{v.label}</span>
                    <span className="text-[11px] font-black" style={{ color: v.color }}>{v.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.01] flex flex-wrap gap-2">
            <button onClick={() => onNavigate(4, `view=simulator&simTab=remove&sku=${encodeURIComponent(sku.name)}`)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-white transition-all hover:opacity-90 shadow-md cursor-pointer border-none"
              style={{ backgroundColor: '#6366f1' }}>
              <Scissors size={12} /> Open Rationalization
            </button>
            <button onClick={() => onNavigate(1, `subtab=ph-kpi&sku=${encodeURIComponent(sku.name)}`)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-white transition-all hover:opacity-90 shadow-md cursor-pointer border-none"
              style={{ backgroundColor: '#0ea5e9' }}>
              <Activity size={12} /> Portfolio Health
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
