/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, MapPin, Mail, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModalShell } from '../../common/Modal';

interface Suggestion {
  action: string;
  impact: string;
  contactName: string;
  contactTitle: string;
  email: string;
  draftBody: string;
}

interface Bottleneck {
  label: string;
  val: number;
  color: string;
  status: string;
  location: string;
  cause: string;
  suggestions: Suggestion[];
}

interface BottleneckDetailsModalProps {
  isOpen: boolean;
  bottleneck: Bottleneck | null;
  onClose: () => void;
  onRequestAction: (email: string, name: string, subject: string, body: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const BottleneckDetailsModal: React.FC<BottleneckDetailsModalProps> = ({
  isOpen,
  bottleneck,
  onClose,
  onRequestAction,
  onPrev,
  onNext
}) => {
  if (!isOpen || !bottleneck) return null;

  return (
    <ModalShell isOpen onClose={onClose} layer="panel" className="flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={14} style={{ color: bottleneck.color }} />
            <span className="text-[14px] font-display font-bold text-zinc-800 dark:text-zinc-100">
              Portfolio Health Concern: {bottleneck.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onPrev && (
              <button 
                onClick={onPrev}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent"
                title="Previous Health Concern"
              >
                <ChevronLeft size={14} />
              </button>
            )}
            {onNext && (
              <button 
                onClick={onNext}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent"
                title="Next Health Concern"
              >
                <ChevronRight size={14} />
              </button>
            )}
            <span className="text-zinc-300 dark:text-zinc-700 mx-1">|</span>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-start gap-2 bg-zinc-50 dark:bg-white/5 p-3 rounded border border-black/5 dark:border-white/10">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <MapPin size={12} className="text-zinc-400" />
            <span className="font-bold text-[10px] uppercase tracking-wider">{bottleneck.location}</span>
          </div>
          <span className={`text-[8.5px] uppercase font-extrabold px-2 py-0.5 rounded-sm ${
            bottleneck.status === 'critical' ? 'bg-red-500/10 text-red-500' :
            bottleneck.status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
            'bg-emerald-500/10 text-emerald-500'
          }`}>
            {bottleneck.status}
          </span>
        </div>

        <div>
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400 mb-1">Root Cause / Portfolio Impact</p>
          <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed font-normal">{bottleneck.cause}</p>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">Suggested Action Plans</p>
          {bottleneck.suggestions.map((s, idx) => (
            <div 
              key={idx} 
              className="p-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-sm hover:border-black/15 dark:hover:border-white/20 transition-all flex flex-col gap-1.5 shadow-sm"
            >
              <div className="flex items-start gap-1.5">
                <span className="text-[11px] font-bold text-indigo-500 shrink-0 mt-0.5">0{idx + 1}</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200 leading-snug">{s.action}</p>
              </div>
              <div className="pl-4 flex items-center justify-between gap-2 border-t border-black/[0.03] dark:border-white/[0.03] pt-1.5">
                <div className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-medium">
                  <span className="opacity-60 uppercase font-bold text-[8px] tracking-wider block">Impact</span>
                  {s.impact}
                </div>
                <button
                  onClick={() => onRequestAction(s.email, s.contactName, `Urgent Action Required: ${bottleneck.label} Health Mitigation`, s.draftBody)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-white bg-[#6d28d9] dark:bg-[#a78bfa] hover:opacity-95 rounded-sm transition-all cursor-pointer border-none"
                >
                  <Mail size={9} />
                  Request
                </button>
              </div>
              <div className="pl-4 text-[8px] opacity-45 leading-none">
                Owner: <span className="font-bold">{s.contactName}</span> ({s.contactTitle})
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end border-t border-black/15 dark:border-white/15 pt-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent"
          >
            Close Review
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
