/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, X } from 'lucide-react';
import { ModalShell } from '../../common/Modal';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail: { to: string; subject: string; body: string; name: string; messageBody?: string };
  onSend: (recipientName: string, recipientEmail: string, subject: string, body: string, channel: 'email' | 'message') => void;
}

const RECIPIENT_OPTIONS = [
  // PM-relevant contacts at the top
  { name: 'Amit Verma', title: 'NPD Product Lead', email: 'amit.verma@aciesglobal.com' },
  { name: 'Amit Mehta', title: 'Product Pricing Director', email: 'amit.mehta@aciesglobal.com' },
  { name: 'Karan Johar', title: 'Director of Commercial Portfolio', email: 'karan.johar@aciesglobal.com' },
  { name: 'Ananya Sen', title: 'Director of Portfolio Finance', email: 'ananya.sen@aciesglobal.com' },
  { name: 'Siddharth Roy', title: 'Marketing Manager', email: 'siddharth.roy@aciesglobal.com' },
  { name: 'Rohan Das', title: 'Supply Chain Lead', email: 'rohan.das@aciesglobal.com' },
  { name: 'Nehal Gupta', title: 'Retail Operations Manager', email: 'nehal.gupta@aciesglobal.com' },
  
  // Existing contacts
  { name: 'Marcus Ng', title: 'Global Procurement Director', email: 'marcus.ng@aciesglobal.com' },
  { name: 'Dr. Elena Rostova', title: 'R&D Product Lead', email: 'elena.rostova@aciesglobal.com' },
  { name: 'Vijay Kumar', title: 'APAC Logistics Head', email: 'vijay.kumar@aciesglobal.com' },
  { name: 'Rohan Sharma', title: 'Plant Manager - Baddi', email: 'rohan.sharma@aciesglobal.com' },
  { name: 'Pooja Iyer', title: 'Citrus Category Manager', email: 'pooja.iyer@aciesglobal.com' },
  { name: 'Nisha Patel', title: 'Demand Planning Lead', email: 'nisha.patel@aciesglobal.com' },
  { name: 'Rajesh Verma', title: 'VP Sales', email: 'rajesh.verma@aciesglobal.com' },
  { name: 'Jean-Pierre Dubois', title: 'Commodities Hedging Director', email: 'jp.dubois@aciesglobal.com' },
  { name: 'Sarah Jenkins', title: 'Product Formulation Scientist', email: 'sarah.jenkins@aciesglobal.com' },
  { name: 'Dieter Maes', title: 'Production Scheduler', email: 'dieter.maes@aciesglobal.com' },
  { name: 'K. Srinivasan', title: 'Maintenance Director', email: 'k.srinivasan@aciesglobal.com' },
  { name: 'Priyanka Rao', title: 'Chennai Plant Supervisor', email: 'priyanka.rao@aciesglobal.com' },
  { name: 'Gautam Sen', title: 'National Distribution Manager', email: 'gautam.sen@aciesglobal.com' },
  { name: 'Vikram Solanki', title: 'QC Lead', email: 'vikram.solanki@aciesglobal.com' },
  { name: 'Rajendra Patel', title: 'Vapi Hub Director', email: 'rajendra.patel@aciesglobal.com' },
  { name: 'Custom Recipient...', title: 'Manually specify details', email: 'custom' }
];

const generateCasualMessage = (formalBody: string, name: string): string => {
  if (!formalBody) return '';
  const firstName = name ? name.split(' ')[0] : 'there';
  const clean = formalBody
    .replace(/Dear\s+[A-Za-z.\s]+,?\n*/i, '')
    .replace(/Hi\s+[A-Za-z.\s]+,?\n*/i, '')
    .replace(/I hope this email finds you well\.?\n*/i, '')
    .replace(/I hope you are doing well\.?\n*/i, '')
    .replace(/Thanks,?\n*[A-Za-z\s]*/i, '')
    .replace(/Best regards,?\n*[A-Za-z\s]*/i, '')
    .trim();
  
  return `Hey ${firstName}, quick question - ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
};

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({
  isOpen,
  onClose,
  initialEmail,
  onSend
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'message'>('email');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('custom');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const [emailBodyState, setEmailBodyState] = useState<string>('');
  const [messageBodyState, setMessageBodyState] = useState<string>('');

  // Update form inputs when initialEmail changes
  useEffect(() => {
    if (initialEmail.to) {
      const match = RECIPIENT_OPTIONS.find(r => r.email.toLowerCase() === initialEmail.to.toLowerCase());
      if (match) {
        setSelectedRecipient(match.email);
        setRecipientName(match.name);
        setRecipientEmail(match.email);
      } else {
        setSelectedRecipient('custom');
        setRecipientName(initialEmail.name || '');
        setRecipientEmail(initialEmail.to);
      }
      setSubject(initialEmail.subject || '');
      
      const emailDraft = initialEmail.body || '';
      const msgDraft = initialEmail.messageBody || generateCasualMessage(initialEmail.body, initialEmail.name);

      setEmailBodyState(emailDraft);
      setMessageBodyState(msgDraft);
      setBody(activeTab === 'email' ? emailDraft : msgDraft);
    }
  }, [initialEmail]);

  const handleTabChange = (tab: 'email' | 'message') => {
    setActiveTab(tab);
    setBody(tab === 'email' ? emailBodyState : messageBodyState);
  };

  // Handle changing the select dropdown
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedRecipient(val);
    if (val === 'custom') {
      setRecipientName('');
      setRecipientEmail('');
    } else {
      const match = RECIPIENT_OPTIONS.find(r => r.email === val);
      if (match) {
        setRecipientName(match.name);
        setRecipientEmail(match.email);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <ModalShell isOpen onClose={onClose} layer="composer" className="flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-display font-bold text-zinc-800 dark:text-zinc-100">
              ✉ Compose Mitigation Request
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tabs Row in Composer */}
        <div className="grid grid-cols-2 p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => handleTabChange('email')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-bold text-[10.5px] cursor-pointer transition-all border-none outline-none ${
              activeTab === 'email'
                ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 bg-transparent'
            }`}
          >
            <Mail size={11} className={activeTab === 'email' ? 'text-blue-500' : ''} />
            <span>Send Email</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('message')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-bold text-[10.5px] cursor-pointer transition-all border-none outline-none ${
              activeTab === 'message'
                ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 bg-transparent'
            }`}
          >
            <MessageSquare size={11} className={activeTab === 'message' ? 'text-emerald-500' : ''} />
            <span>Send Instant Message</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Recipient Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[9px] uppercase tracking-wider text-zinc-400">Select Stakeholder Contact</label>
            <select
              value={selectedRecipient}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 border border-black/10 dark:border-white/10 bg-transparent rounded font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-[#6d28d9] dark:focus:border-[#a78bfa] transition-colors"
            >
              {RECIPIENT_OPTIONS.map(opt => (
                <option key={opt.email} value={opt.email} className="bg-white dark:bg-zinc-900">
                  {opt.name} — {opt.title} {opt.email !== 'custom' ? `(${opt.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Always Visible Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[9px] uppercase tracking-wider text-zinc-400">Contact Name</label>
              <input 
                type="text" 
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                  setSelectedRecipient('custom');
                }}
                placeholder="E.g., Marcus Ng"
                className="w-full px-3 py-2 border border-black/10 dark:border-white/10 bg-transparent rounded font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-[#6d28d9] dark:focus:border-[#a78bfa] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[9px] uppercase tracking-wider text-zinc-400">
                {activeTab === 'email' ? 'Contact Email' : 'Contact Email / Handle'}
              </label>
              <input 
                type="email" 
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  setSelectedRecipient('custom');
                }}
                placeholder="E.g., marcus@acies.com"
                className="w-full px-3 py-2 border border-black/10 dark:border-white/10 bg-transparent rounded font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-[#6d28d9] dark:focus:border-[#a78bfa] transition-colors"
              />
            </div>
          </div>
          
          {activeTab === 'email' && (
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[9px] uppercase tracking-wider text-zinc-400">Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-3 py-2 border border-black/10 dark:border-white/10 bg-transparent rounded font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-[#6d28d9] dark:focus:border-[#a78bfa] transition-colors"
              />
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[9px] uppercase tracking-wider text-zinc-400">
              {activeTab === 'email' ? 'Message Body' : 'Instant Message Body'}
            </label>
            <textarea 
              rows={6}
              value={body}
              onChange={(e) => {
                const val = e.target.value;
                setBody(val);
                if (activeTab === 'email') {
                  setEmailBodyState(val);
                } else {
                  setMessageBodyState(val);
                }
              }}
              className="px-3 py-2 border border-black/10 dark:border-white/10 bg-transparent rounded font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-[#6d28d9] dark:focus:border-[#a78bfa] transition-colors resize-none font-sans"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-black/15 dark:border-white/15 pt-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (!recipientEmail || !recipientName) {
                alert('Please provide both recipient name and email.');
                return;
              }
              onSend(recipientName, recipientEmail, subject, body, activeTab);
            }}
            className="px-4 py-2 bg-[#6d28d9] dark:bg-[#a78bfa] text-white rounded-sm font-bold uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer border-none"
          >
            Send Request
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
