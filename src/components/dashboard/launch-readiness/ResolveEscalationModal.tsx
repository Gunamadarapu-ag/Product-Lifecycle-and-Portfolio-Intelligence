import React from 'react';
import { Calendar, User, Mail, X, Cpu } from 'lucide-react';
import { ModalShell } from '../../common/Modal';

export interface VPEscalation {
  id: string;
  title: string;
  sub: string;
  severity: string;
  impact: string;
  status: string;
  color: string;
}

interface ResolveTeamOption {
  action: string;
  impact: string;
  contactName: string;
  contactTitle: string;
  email: string;
  draftBody: string;
}

interface ResolveEscalationModalProps {
  isOpen: boolean;
  escalation: VPEscalation | null;
  onClose: () => void;
  onRequestAction: (email: string, name: string, subject: string, body: string) => void;
}

export const ResolveEscalationModal: React.FC<ResolveEscalationModalProps> = ({
  isOpen,
  escalation,
  onClose,
  onRequestAction
}) => {
  if (!isOpen || !escalation) return null;

  const getTeamOptions = (): ResolveTeamOption[] => {
    if (escalation.id === 'esc1') {
      return [
        {
          action: 'Alternate Supplier Sourcing Audit',
          impact: 'Validates domestic raw material supply to recover launch timeline',
          contactName: 'Vikram Solanki',
          contactTitle: 'QC Manager & Logistics Lead',
          email: 'vikram.solanki@aciesglobal.com',
          draftBody: `Hi Vikram,\n\nI want to schedule an urgent meeting regarding the packaging material shortage for "${escalation.sub}". Let's discuss onboarding alternate local vendors to resolve this delay.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Vapi Hub Stock Allocation Sync',
          impact: 'Checks regional raw stock reserves for buffer packaging allocation',
          contactName: 'Rajendra Patel',
          contactTitle: 'Vapi Hub Director',
          email: 'rajendra.patel@aciesglobal.com',
          draftBody: `Hi Rajendra,\n\nLet's coordinate on raw stock buffer allocations for "${escalation.sub}" to bypass supplier delay. Please pull the Vapi inventory logs.\n\nThanks,\nVP Product Management`
        }
      ];
    } else if (escalation.id === 'esc2') {
      return [
        {
          action: 'Regulatory Response Strategy Alignment',
          impact: 'Formulates audit feedback file dispatch to secure EU approval gate',
          contactName: 'Amit Verma',
          contactTitle: 'NPD Lead',
          email: 'amit.verma@aciesglobal.com',
          draftBody: `Hi Amit,\n\nLet's sync on our compliance filing strategy regarding EU Regulatory Approval for "${escalation.sub}". Let's schedule a meeting to review our response draft.\n\nThanks,\nVP Product Management`
        }
      ];
    } else if (escalation.id === 'esc3') {
      return [
        {
          action: 'Co-packer Capacity Allocation Review',
          impact: 'Aligns secondary production lines to mitigate $10Cr revenue risk',
          contactName: 'Rajendra Patel',
          contactTitle: 'Vapi Hub Director',
          email: 'rajendra.patel@aciesglobal.com',
          draftBody: `Hi Rajendra,\n\nI want to schedule an urgent capacity sync regarding co-packer bottlenecks for "${escalation.sub}". Let's align on shifting run priority.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Production Run Schedule Re-optimization',
          impact: 'Re-sequences manufacturing priority queues to protect core SKUs',
          contactName: 'Vikram Solanki',
          contactTitle: 'QC Manager & Logistics Lead',
          email: 'vikram.solanki@aciesglobal.com',
          draftBody: `Hi Vikram,\n\nLet's align on co-packer runtime scheduling for "${escalation.sub}" to safeguard MTD volume targets. Let's schedule a sync.\n\nThanks,\nVP Product Management`
        }
      ];
    } else {
      // Label Compliance Issue (esc4) or Default
      return [
        {
          action: 'Design Revision & Label Sign-off',
          impact: 'Fast-tracks updated artwork approvals to prevent packaging rerun stalls',
          contactName: 'Amit Verma',
          contactTitle: 'NPD Lead',
          email: 'amit.verma@aciesglobal.com',
          draftBody: `Hi Amit,\n\nWe need a quick sync to sign off on revised labels for "${escalation.sub}". Let's review the artwork correction files.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Retail Label Compliance Verification',
          impact: 'Coordinates packaging audit results with regional retail regulations',
          contactName: 'Karan Johar',
          contactTitle: 'Retail Relations Director',
          email: 'karan.johar@aciesglobal.com',
          draftBody: `Hi Karan,\n\nLet's align on label compliance requirements for "${escalation.sub}". I want to verify retailer approval criteria.\n\nThanks,\nVP Product Management`
        }
      ];
    }
  };

  const options = getTeamOptions();

  return (
    <ModalShell isOpen onClose={onClose} layer="panel" className="flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-2">
          <div className="flex items-center gap-1.5 text-[#6d28d9] dark:text-[#a78bfa]">
            <Calendar size={15} />
            <span className="text-[14px] font-display font-bold text-zinc-800 dark:text-zinc-100">
              Schedule Resolution Meeting
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent"
          >
            <X size={14} />
          </button>
        </div>
        
        {/* Item Details */}
        <div className="flex justify-between items-start gap-2 bg-zinc-50 dark:bg-white/5 p-3 rounded border border-black/5 dark:border-white/10">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <Cpu size={12} className="text-zinc-400" />
            <span className="font-bold text-[10px] uppercase tracking-wider">{escalation.title}</span>
          </div>
          <span className="text-[8.5px] uppercase font-extrabold px-2 py-0.5 rounded-sm bg-red-500/10 text-red-500">
            {escalation.severity} Severity
          </span>
        </div>

        {/* Root Cause Context */}
        <div>
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400 mb-1">Escalation context</p>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            To resolve the active delay on <span className="font-semibold">{escalation.sub}</span> ({escalation.impact}), please schedule an alignment meeting with the responsible execution leads below.
          </p>
        </div>

        {/* Suggested Team Meetings List */}
        <div className="space-y-2.5">
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">Responsible Departments & Leads</p>
          {options.map((s, idx) => (
            <div 
              key={idx} 
              className="p-3 bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 rounded-sm hover:border-black/15 dark:hover:border-white/20 transition-all flex flex-col gap-1.5 shadow-sm"
            >
              <div className="flex items-start gap-1.5">
                <span className="text-[11px] font-bold text-[#6d28d9] dark:text-[#a78bfa] shrink-0 mt-0.5">0{idx + 1}</span>
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 leading-snug">{s.action}</p>
                  <p className="text-[9px] opacity-60 leading-none mt-1">
                    Lead: <span className="font-extrabold">{s.contactName}</span> ({s.contactTitle})
                  </p>
                </div>
              </div>
              
              <div className="pl-4 flex items-center justify-between gap-2 border-t border-black/[0.03] dark:border-white/[0.03] pt-1.5 mt-0.5">
                <div className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-medium">
                  <span className="opacity-60 uppercase font-bold text-[8px] tracking-wider block">Objective</span>
                  {s.impact}
                </div>
                <button
                  onClick={() => onRequestAction(s.email, s.contactName, `Urgent Sync: ${escalation.title} Resolution Alignment`, s.draftBody)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-white bg-[#6d28d9] hover:bg-[#5b21b6] dark:bg-[#a78bfa] dark:hover:bg-[#8b5cf6] dark:text-zinc-900 rounded-sm transition-all cursor-pointer border-none"
                >
                  <Mail size={9} />
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end border-t border-black/15 dark:border-white/15 pt-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent"
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
