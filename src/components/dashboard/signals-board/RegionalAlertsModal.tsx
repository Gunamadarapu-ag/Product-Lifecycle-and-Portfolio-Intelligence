/**
 * Regional alert detail, with trigger and rectification values.
 *
 * Extracted from the original 3,982-line SignalsBoard.tsx.
 */
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter, TrendingUp, Globe, ShieldAlert, ChevronRight, ArrowLeft, CheckCircle2, X, Brain, User, Clock, Sparkles } from 'lucide-react';
import { ModalShell } from '../../common/Modal';
import { getAlertExplainer, getRectificationVal, getTriggerVal } from './alertExplainers';
import { VPSignal } from './signalsData';

export interface RegionalAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: string;
  signals: VPSignal[];
}

export const RegionalAlertsModal: React.FC<RegionalAlertsModalProps> = ({
  isOpen,
  onClose,
  region,
  signals
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAlertId(null);
  }, [region, isOpen]);

  if (!isOpen) return null;

  // Filter unresolved alerts for the region
  const regionAlerts = signals.filter(s => s.region === region && !s.ack);
  
  // Sort by severity (critical first, then warning, then info)
  const sortedRegionAlerts = [...regionAlerts].sort((a, b) => {
    const sevWeight = { critical: 3, warning: 2, info: 1 };
    return (sevWeight[b.severity] || 0) - (sevWeight[a.severity] || 0);
  });

  if (selectedAlertId) {
    const sig = signals.find(s => s.id === selectedAlertId);
    if (sig) {
      const explainer = getAlertExplainer(sig.id);
      const triggerText = getTriggerVal(sig);
      const solutionText = getRectificationVal(sig);
      const indicatorBg = sig.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : sig.severity === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20';

      return (
        <ModalShell isOpen onClose={onClose} layer="panel" className="flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-5 text-xs max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedAlertId(null)}
                  className="flex items-center gap-1 text-zinc-500 hover:text-[#5850ec] dark:hover:text-indigo-400 font-bold cursor-pointer border-none bg-transparent outline-none transition-colors text-xs"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <span className="text-zinc-300 dark:text-zinc-800">|</span>
                <div className="flex items-center gap-1.5 text-[#6d28d9] dark:text-[#a78bfa]">
                  <Brain size={18} className="fill-[#6d28d9]/10" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">AI Alert Explainer</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
              >
                <X size={16} />
              </button>
            </div>

            {/* Hero Alert Details */}
            <div className={`p-4 rounded border flex justify-between items-center ${indicatorBg}`}>
              <div>
                <span className="text-[8px] font-bold uppercase tracking-widest opacity-75">{sig.refCode} · {sig.type}</span>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-white">
                  {sig.title}
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                  {sig.detail}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[8px] font-bold uppercase tracking-widest block opacity-75">Projected Impact</span>
                <span className="text-sm font-mono font-extrabold block">
                  {sig.impact}
                </span>
              </div>
            </div>

            {/* Explanation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Why (Underlying Drivers) */}
              <div className="space-y-2.5 p-3.5 rounded bg-zinc-50/50 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200">
                  <AlertTriangle size={14} className="text-orange-500" />
                  <h5 className="font-bold uppercase tracking-wider text-[10px]">Why was this triggered?</h5>
                </div>
                <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                  <p>{triggerText}</p>
                </div>
              </div>

              {/* How to Solve */}
              <div className="space-y-2.5 p-3.5 rounded bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15">
                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200">
                  <Sparkles size={14} className="text-[#5850ec] dark:text-indigo-400 animate-pulse" />
                  <h5 className="font-bold uppercase tracking-wider text-[10px] text-emerald-600 dark:text-emerald-500">How can it be solved?</h5>
                </div>
                <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                  <p>{solutionText}</p>
                </div>
              </div>

            </div>

            {/* Execution Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 border-t border-black/5 dark:border-white/10 pt-4">
              {/* Checklist */}
              <div className="md:col-span-3 space-y-3">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  Mitigation Action Steps
                </span>
                <ul className="space-y-2 list-none pl-0">
                  {explainer.checklist.map((step, sIdx) => (
                    <li key={sIdx} className="flex gap-2.5 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50/40 dark:bg-white/2 p-2.5 rounded border border-black/2 dark:border-white/2 hover:border-black/5 dark:hover:border-white/5 transition-all">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Parameter Sidebar */}
              <div className="md:col-span-2 space-y-4">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  Ownership & Timeline
                </span>
                <div className="space-y-3.5 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded border border-black/5 dark:border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                      <User size={12} className="text-zinc-400" /> Assigned Owner
                    </span>
                    <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">
                      {explainer.owner}
                    </p>
                  </div>
                  
                  <div className="space-y-0.5 border-t border-black/5 dark:border-white/5 pt-2.5">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                      <Clock size={12} className="text-zinc-400" /> Expected Lead Time
                    </span>
                    <p className="text-[11px] font-bold text-[#6d28d9] dark:text-[#a78bfa] font-mono">
                      {explainer.timeline}
                    </p>
                  </div>

                  <div className="space-y-0.5 border-t border-black/5 dark:border-white/5 pt-2.5">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                      <TrendingUp size={12} className="text-zinc-400" /> Expected Outcome
                    </span>
                    <p className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-500 leading-normal font-mono">
                      {explainer.outcome}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-black/15 dark:border-white/15 pt-3.5">
              <button 
                onClick={() => setSelectedAlertId(null)}
                className="px-3.5 py-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 text-[9px] font-extrabold uppercase tracking-widest rounded-sm border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer"
              >
                ← Back to Summary
              </button>
              
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-acies-gray hover:bg-acies-yellow hover:text-acies-gray text-white text-[9px] font-extrabold uppercase tracking-widest rounded-sm transition-all cursor-pointer border-none"
              >
                Acknowledge & Close
              </button>
            </div>

          </div>
        </ModalShell>
      );
    }
  }

  return (
    <ModalShell isOpen onClose={onClose} layer="panel" className="flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-5 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-3">
          <div className="flex items-center gap-2 text-[#6d28d9] dark:text-[#a78bfa]">
            <Globe size={18} className="fill-[#6d28d9]/10" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">{region} Regional Alerts</span>
              <h3 className="text-[15px] font-display font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                Alert Triggers & Rectification Summary
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Overview Banner */}
        <div className="bg-[#6d28d9]/5 dark:bg-[#a78bfa]/5 border border-[#6d28d9]/10 dark:border-[#a78bfa]/10 p-3.5 rounded text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
          This summary outlines active operational alerts detected in the <strong className="text-zinc-800 dark:text-white">{region}</strong> region. Click an alert below to view its AI predictive analysis, trigger drivers, and step-by-step mitigation plans.
        </div>

        {/* Alerts Registry details inside Modal */}
        <div className="space-y-3">
          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
            {sortedRegionAlerts.length > 0 ? (
              sortedRegionAlerts.map(sig => {
                const borderCol = sig.severity === 'critical' ? 'border-red-500/30' : sig.severity === 'warning' ? 'border-amber-500/30' : 'border-blue-500/30';
                const indicatorBg = sig.severity === 'critical' ? 'bg-red-500/10 text-red-500' : sig.severity === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500';
                const triggerText = getTriggerVal(sig);
                const solutionText = getRectificationVal(sig);
                
                return (
                  <div 
                    key={sig.id} 
                    onClick={() => setSelectedAlertId(sig.id)}
                    className={`p-4 border-l-2 ${borderCol} border border-black/5 dark:border-white/5 rounded bg-zinc-50/20 dark:bg-white/2 space-y-3.5 transition-all duration-200 hover:scale-[1.01] hover:shadow-md hover:bg-black/[0.02] dark:hover:bg-white/5 cursor-pointer`}
                  >
                    
                    {/* Upper Meta Details */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[8.5px] font-bold text-[#6d28d9] dark:text-[#a78bfa] bg-[#6d28d9]/5 dark:bg-[#a78bfa]/5 px-1.5 py-0.5 rounded">
                            {sig.refCode}
                          </span>
                          <span className="text-zinc-400 dark:text-zinc-600">•</span>
                          <h4 className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight">
                            {sig.title}
                          </h4>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded-sm opacity-55">
                            {sig.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed pt-0.5">
                          {sig.detail}
                        </p>
                      </div>

                      <div className="shrink-0 text-right space-y-1">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm inline-block ${indicatorBg}`}>
                          {sig.impact}
                        </span>
                        <span className="text-[8px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono block">
                          Cat: {sig.category}
                        </span>
                      </div>
                    </div>

                    {/* Trigger and Solution Summary */}
                    <div className="mt-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.04] space-y-1.5 text-[10px] leading-relaxed">
                      <p className="text-zinc-600 dark:text-zinc-400">
                        <strong className="text-orange-600 dark:text-orange-400 uppercase tracking-wider text-[8px] mr-1.5">Trigger:</strong>
                        {triggerText}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        <strong className="text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[8px] mr-1.5">Solution:</strong>
                        {solutionText}
                      </p>
                    </div>

                    {/* AI Prediction Explainer Prompt */}
                    <div className="pt-2 border-t border-black/[0.02] dark:border-white/[0.02] flex justify-between items-center text-[9px] text-[#6d28d9] dark:text-[#a78bfa] font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles size={10} className="animate-pulse" /> AI Predictor Explainer Available
                      </span>
                      <span className="uppercase tracking-widest hover:underline flex items-center gap-0.5">
                        View Analysis <ChevronRight size={10} />
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 space-y-2">
                <p className="text-[20px]">🎉</p>
                <p className="text-[11px] text-zinc-500 font-bold">All alerts resolved for the {region} Region!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-black/15 dark:border-white/15 pt-3.5">
          <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono font-bold">
            <ShieldAlert size={12} className="text-zinc-500" />
            <span>REGIONAL ALERT SUMMARY</span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-acies-gray hover:bg-acies-yellow hover:text-acies-gray text-white text-[9px] font-extrabold uppercase tracking-widest rounded-sm transition-all cursor-pointer border-none"
          >
            Close Summary
          </button>
        </div>

      </div>
    </ModalShell>
  );
};
