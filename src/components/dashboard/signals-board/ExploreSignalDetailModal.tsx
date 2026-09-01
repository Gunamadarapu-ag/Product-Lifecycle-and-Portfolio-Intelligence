import React from 'react';
import { X, Sparkles, AlertTriangle, TrendingUp, Users, Inbox, Globe } from 'lucide-react';

export interface ExploreSignal {
  id: number;
  type: string;
  title: string;
  desc: string;
  urgency: number;
  urgencyLabel: string;
  action: string;
}

interface ExploreSignalDetailModalProps {
  isOpen: boolean;
  signal: ExploreSignal | null;
  onClose: () => void;
  isDarkMode?: boolean;
}

const OUTCOMES_MAP: Record<number, { metric: string; val: string; desc: string }[]> = {
  1: [
    { metric: 'Volume Recovery', val: '+14%', desc: 'Uplift in promo unit sales.' },
    { metric: 'Basket Expansion', val: '+8.5%', desc: 'Increases average shopping basket value.' },
    { metric: 'Margin Offset', val: '+120 bps', desc: 'Mitigates gross margin dilution.' },
    { metric: 'Retention Rate', val: '+18%', desc: 'Retains repeat purchasers.' }
  ],
  2: [
    { metric: 'Incremental Rev.', val: '$4.2M', desc: 'Projected first-year revenue addition.' },
    { metric: 'Shelf Footprint', val: '+6%', desc: 'Shelf share at premium retailers.' },
    { metric: 'Gross Margin', val: '42.5%', desc: '+250 bps higher than core.' },
    { metric: 'Segment Capture', val: '+22%', desc: 'Taps new health demographics.' }
  ],
  3: [
    { metric: 'Distribution Share', val: '85%', desc: 'Supermarket share (up from 72%).' },
    { metric: 'Store Velocity', val: '+19.5%', desc: 'Weekly sales rate spike in targets.' },
    { metric: 'Deflection Rate', val: '85%', desc: 'Intercepts new competitor impact.' },
    { metric: 'Cooperation Rate', val: '92%', desc: 'Retailer alignment on incentives.' }
  ],
  4: [
    { metric: 'Lead Time Cut', val: '-66%', desc: 'Reduces lead times to 1.5 weeks.' },
    { metric: 'Stockout Mitigation', val: '$1.2M', desc: 'Preempts potential sales loss.' },
    { metric: 'COGS Stability', val: '+1.2%', desc: 'Offset fully by logistics savings.' },
    { metric: 'Schedule Adherence', val: '100%', desc: 'Guarantees uninterrupted cycles.' }
  ],
  5: [
    { metric: 'Export Sales Target', val: '$3.8M', desc: 'APAC gross export sales (32% YoY).' },
    { metric: 'Capacity Util.', val: '94%', desc: 'Maximizes factory line efficiency.' },
    { metric: 'Distributors', val: '3 New', desc: 'Onboards regional supply partners.' },
    { metric: 'Export Margin', val: '44.0%', desc: '+400 bps over domestic lines.' }
  ]
};

export const ExploreSignalDetailModal: React.FC<ExploreSignalDetailModalProps> = ({
  isOpen,
  signal,
  onClose,
  isDarkMode = false
}) => {
  if (!isOpen || !signal) return null;

  const outcomes = OUTCOMES_MAP[signal.id] || [];

  const getIcon = () => {
    switch (signal.type) {
      case 'Risk':
        return <AlertTriangle className="text-red-500" size={18} />;
      case 'Growth':
        return <TrendingUp className="text-emerald-500" size={18} />;
      case 'Competition':
        return <Users className="text-blue-500" size={18} />;
      case 'Supply':
        return <Inbox className="text-amber-500" size={18} />;
      default:
        return <Globe className="text-zinc-500" size={18} />;
    }
  };

  const getBadgeStyle = () => {
    switch (signal.type) {
      case 'Risk':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25';
      case 'Supply':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25';
      case 'Growth':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25';
      default:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25';
    }
  };

  const colorHex = signal.type === 'Risk' || signal.type === 'Supply'
    ? (signal.urgency > 80 ? '#ef4444' : '#f59e0b')
    : (signal.type === 'Growth' ? '#10b981' : '#3b82f6');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-5.5 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[95vh] overflow-y-hidden">
        
        {/* Header section */}
        <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black/5 dark:bg-white/5 rounded shrink-0">
              {getIcon()}
            </div>
            <div>
              <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-zinc-400 block leading-none">Signal Impact Analysis</span>
              <h3 className="text-sm font-display font-bold text-zinc-800 dark:text-zinc-100 mt-1 leading-tight">
                {signal.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Overview Row */}
        <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-white/5 py-2 px-3.5 rounded border border-black/5 dark:border-white/10 text-[10.5px]">
          <div>
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-zinc-400 block mb-0.5">Category</span>
            <span className={`text-[8.5px] uppercase font-extrabold px-2 py-0.5 rounded border ${getBadgeStyle()}`}>
              {signal.type}
            </span>
          </div>
          <div>
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-zinc-400 block mb-0.5">Urgency Index</span>
            <div className="flex items-center gap-2 leading-none">
              <span className="font-mono font-bold text-[11px]" style={{ color: colorHex }}>
                {signal.urgency}%
              </span>
              <span className="text-zinc-500 dark:text-zinc-500">({signal.urgencyLabel})</span>
            </div>
          </div>
        </div>

        {/* Trend Info */}
        <div className="space-y-1">
          <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-zinc-400 block">Identified Trend</span>
          <p className="text-zinc-700 dark:text-zinc-300 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 px-3 py-2 rounded-sm leading-relaxed text-[10.5px]">
            {signal.desc}
          </p>
        </div>

        {/* Recommended Action */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[#6d28d9] dark:text-[#a78bfa]">
            <Sparkles size={12} className="shrink-0" />
            <span className="text-[8.5px] font-extrabold uppercase tracking-widest">Recommended Action</span>
          </div>
          <div className="px-3 py-2 bg-[#6d28d9]/[0.03] dark:bg-[#a78bfa]/[0.02] border border-[#6d28d9]/15 dark:border-[#a78bfa]/15 rounded-sm">
            <p className="text-zinc-800 dark:text-zinc-200 leading-snug text-[10.5px] font-medium font-body">
              {signal.action}
            </p>
          </div>
        </div>

        {/* Projected Outcomes (2x2 Grid) */}
        <div className="space-y-1.5">
          <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-zinc-400 block">Projected Outcomes</span>
          <div className="grid grid-cols-2 gap-2.5">
            {outcomes.map((o, idx) => (
              <div 
                key={idx} 
                className="p-2.5 bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 rounded-sm hover:border-[#6d28d9]/25 transition-all flex flex-col justify-between shadow-sm min-h-[50px]"
              >
                <div className="flex items-start justify-between gap-1 leading-none">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[10px] leading-tight">{o.metric}</span>
                  <span className="text-[11px] font-mono font-extrabold text-emerald-500 dark:text-emerald-400 shrink-0">
                    {o.val}
                  </span>
                </div>
                <p className="text-[8.5px] text-zinc-500 dark:text-zinc-400 leading-tight mt-1">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center border-t border-black/5 dark:border-white/5 pt-3 mt-1">
          <span className="text-[8.5px] font-mono text-zinc-400">FP&A Copilot Projections</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded font-bold uppercase tracking-wider transition-colors border-none cursor-pointer text-[9.5px]"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
