/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, MessageSquare, Check, X } from 'lucide-react';
import { ModalShell } from '../../common/Modal';

interface SuccessFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientTitle: string;
  recipientEmail: string;
  contextType: 'approval' | 'bottleneck' | 'signal';
  contextTitle: string;
  isDarkMode: boolean;
  channel: 'email' | 'message';
}

export const SuccessFeedbackModal: React.FC<SuccessFeedbackModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  recipientTitle,
  recipientEmail,
  contextType,
  contextTitle,
  isDarkMode,
  channel
}) => {
  if (!isOpen) return null;

  // Extract initials
  const initials = recipientName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Create context-specific description text
  const descriptionText = contextType === 'approval'
    ? `The approval for "${contextTitle}" requires coordination with ${recipientName} (${recipientTitle}). You can request sign-off or align schedules by emailing or messaging them.`
    : contextType === 'bottleneck'
    ? `The mitigation action plan for the "${contextTitle}" health concern is managed by ${recipientName} (${recipientTitle}). You can request strategic support or status updates by emailing or messaging them.`
    : `The mitigation action plan for the "${contextTitle}" signal is managed by ${recipientName} (${recipientTitle}). You can coordinate resolution or align schedules by emailing or messaging them.`;

  return (
    <ModalShell isOpen onClose={onClose} layer="elevated" className="flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#161620] border border-black/10 dark:border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-xs animate-fade-in text-zinc-800 dark:text-zinc-200">
        
        {/* Profile Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* Avatar Circle */}
            <div className="w-11 h-11 rounded-full bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center font-bold text-[15px] shadow-sm">
              {initials}
            </div>
            <div>
              <h3 className="text-[13px] font-bold font-display text-zinc-900 dark:text-white leading-tight">
                {recipientName}
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium">
                {recipientTitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent outline-none"
          >
            <X size={15} />
          </button>
        </div>

        {/* Informative Context Box */}
        <div className="p-3 bg-purple-50/50 dark:bg-purple-950/10 border-l-4 border-purple-500 dark:border-purple-400 rounded-r-lg text-[10.5px] leading-relaxed text-zinc-700 dark:text-zinc-400 font-medium">
          {descriptionText}
        </div>

        {/* Tabs Row (Read-Only) */}
        <div className="grid grid-cols-2 p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl select-none">
          <div
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-bold text-[10.5px] transition-all ${
              channel === 'email'
                ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-500 font-medium'
            }`}
          >
            <Mail size={11} className={channel === 'email' ? 'text-blue-500' : ''} />
            <span>Email Sent</span>
          </div>
          <div
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-bold text-[10.5px] transition-all ${
              channel === 'message'
                ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-500 font-medium'
            }`}
          >
            <MessageSquare size={11} className={channel === 'message' ? 'text-emerald-500' : ''} />
            <span>Message Sent</span>
          </div>
        </div>

        {/* Success Block */}
        <div className="flex flex-col items-center justify-center py-2.5 space-y-2 text-center" key={channel}>
          {/* Green Check Box (matches screenshot) */}
          <div className="w-11 h-11 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-inner animate-pulse-slow">
            <Check size={22} className="stroke-[3.5]" />
          </div>
          <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Request Sent!</h4>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-relaxed max-w-[260px] mx-auto font-medium">
            Your {channel === 'email' ? 'email' : 'message'} to {recipientName} has been delivered. They'll see it in their Signals Board inbox when they log in.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 border border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 text-[9px] transition-all cursor-pointer bg-transparent outline-none"
        >
          Close
        </button>

      </div>
    </ModalShell>
  );
};
