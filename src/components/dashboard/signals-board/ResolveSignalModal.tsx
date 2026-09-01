import React from 'react';
import { Calendar, User, Mail, AlertTriangle, AlertCircle, TrendingUp, Cpu } from 'lucide-react';
import { Modal } from '../../common/Modal';
import { VPSignal } from './SignalsBoard';

interface ResolveTeamOption {
  action: string;
  impact: string;
  contactName: string;
  contactTitle: string;
  email: string;
  draftBody: string;
}

interface ResolveSignalModalProps {
  isOpen: boolean;
  signal: VPSignal | null;
  onClose: () => void;
  onRequestAction: (email: string, name: string, subject: string, body: string) => void;
}

export const ResolveSignalModal: React.FC<ResolveSignalModalProps> = ({
  isOpen,
  signal,
  onClose,
  onRequestAction
}) => {
  if (!isOpen || !signal) return null;

  // Respective teams/options depending on signal type
  const getTeamOptions = (): ResolveTeamOption[] => {
    if (signal.type === 'Supply') {
      return [
        {
          action: 'Alternate Supplier Validation & Sourcing Audit',
          impact: 'Mitigates raw material bottleneck and secures active supplier backup',
          contactName: 'Vikram Solanki',
          contactTitle: 'QC Manager & Logistics Lead',
          email: 'vikram.solanki@aciesglobal.com',
          draftBody: `Hi Vikram,\n\nI want to schedule an urgent alignment meeting regarding the "${signal.title}". Let's discuss onboarding alternate local suppliers to mitigate this supply risk.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Pre-position Buffer Stock & Hub Inventory Audit',
          impact: 'Secures hub inventory levels to buffer lead time extension',
          contactName: 'Rajendra Patel',
          contactTitle: 'Vapi Hub Director',
          email: 'rajendra.patel@aciesglobal.com',
          draftBody: `Hi Rajendra,\n\nI want to align on buffer stock allocation for "${signal.title}" to mitigate the port transit delays. Let's schedule a sync.\n\nThanks,\nVP Product Management`
        }
      ];
    } else if (signal.type === 'Opportunity') {
      return [
        {
          action: 'Key Account Assortment Allocation & Shelf Strategy',
          impact: 'Maximizes GTM front-row placement to capture demand surge',
          contactName: 'Karan Johar',
          contactTitle: 'Retail Relations Director',
          email: 'karan.johar@aciesglobal.com',
          draftBody: `Hi Karan,\n\nLet's schedule a sync to review key retail account allocations for "${signal.title}". We want to maximize our front-row shelf presence.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Promotions Calendar & Category Target Alignment',
          impact: 'Optimizes category campaign planning to capture regional demand shift',
          contactName: 'Priya Sharma',
          contactTitle: 'Brand Director',
          email: 'priya.sharma@aciesglobal.com',
          draftBody: `Hi Priya,\n\nLet's coordinate on Q4 campaigns for the "${signal.title}" to capture this demand. Please pull the category performance trends.\n\nThanks,\nVP Product Management`
        }
      ];
    } else if (signal.type === 'Competitor' || signal.type === 'Risk') {
      return [
        {
          action: 'Pricing Floor & Gross Margin Integrity Audit',
          impact: 'Establishes defensive price point strategy to protect margin thresholds',
          contactName: 'Ananya Sen',
          contactTitle: 'VP Finance',
          email: 'ananya.sen@aciesglobal.com',
          draftBody: `Hi Ananya,\n\nI want to schedule a sync to verify our defensive pricing thresholds and gross margin integrity for "${signal.title}" in response to competitor action.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Defensive Campaign & Promo Spend Allocation',
          impact: 'Deploys targeted promotional incentives to protect local market share',
          contactName: 'Priya Sharma',
          contactTitle: 'Brand Director',
          email: 'priya.sharma@aciesglobal.com',
          draftBody: `Hi Priya,\n\nI want to sync on defensive promotional actions for "${signal.title}" to address competitor pricing pressure. Let's schedule a meeting.\n\nThanks,\nVP Product Management`
        }
      ];
    } else if (signal.type === 'Sentiment') {
      return [
        {
          action: 'Brand Campaign Alignment & Consumer PR Strategy',
          impact: 'Addresses consumer feedback and deploys post-artwork PR strategy',
          contactName: 'Priya Sharma',
          contactTitle: 'Brand Director',
          email: 'priya.sharma@aciesglobal.com',
          draftBody: `Hi Priya,\n\nI want to align on PR response and customer feedback for the "${signal.title}". Let's review the recent post-artwork sentiment decline.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Packaging Design & NPD Configuration Sync',
          impact: 'Modifies product aesthetics to align with customer NPS benchmarks',
          contactName: 'Amit Verma',
          contactTitle: 'NPD Lead',
          email: 'amit.verma@aciesglobal.com',
          draftBody: `Hi Amit,\n\nWe need to schedule a meeting to review design revision pathways for "${signal.title}". Let's address recent consumer feedback.\n\nThanks,\nVP Product Management`
        }
      ];
    } else {
      // Default / Portfolio
      return [
        {
          action: 'Product Assortment Rationalization & Variant Review',
          impact: 'Rationalizes low-performing tail SKUs to optimize portfolio value',
          contactName: 'Amit Verma',
          contactTitle: 'NPD Lead',
          email: 'amit.verma@aciesglobal.com',
          draftBody: `Hi Amit,\n\nLet's schedule an assortment review meeting for "${signal.title}" to address variant cannibalization and margin leakage.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Gross Margin & Financial Assortment Audit',
          impact: 'Verifies complexity cost savings and profit contributions',
          contactName: 'Ananya Sen',
          contactTitle: 'VP Finance',
          email: 'ananya.sen@aciesglobal.com',
          draftBody: `Hi Ananya,\n\nLet's audit the complexity cost savings and margin structure for the "${signal.title}" variants. Please coordinate a financial sync.\n\nThanks,\nVP Product Management`
        }
      ];
    }
  };

  const options = getTeamOptions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Resolution Meeting"
      icon={<Calendar size={15} />}
      accentClassName="text-blue-500"
      size="md"
      layer="panel"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent"
          >
            Cancel
          </button>
        </div>
      }
    >
        
        {/* Item Details */}
        <div className="flex justify-between items-start gap-2 bg-zinc-50 dark:bg-white/5 p-3 rounded border border-black/5 dark:border-white/10">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <Cpu size={12} className="text-zinc-400" />
            <span className="font-bold text-[10px] uppercase tracking-wider">{signal.title}</span>
          </div>
          <span className={`text-[8.5px] uppercase font-extrabold px-2 py-0.5 rounded-sm ${
            signal.severity === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            {signal.severity} Urgency
          </span>
        </div>

        {/* Root Cause Context */}
        <div>
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400 mb-1">Signal context</p>
          <p className="text-zinc-600 dark:text-zinc-350 leading-relaxed font-normal">
            To resolve this active signal, a cross-functional alignment session is recommended with the departments owning the execution risks, category promotions, or supply operations.
          </p>
        </div>

        {/* Suggested Team Meetings List */}
        <div className="space-y-2.5">
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">Responsible Departments & Leads</p>
          {options.map((s, idx) => (
            <div 
              key={idx} 
              className="p-3 bg-white dark:bg-zinc-805 border border-black/5 dark:border-white/10 rounded-sm hover:border-black/15 dark:hover:border-white/20 transition-all flex flex-col gap-1.5 shadow-sm"
            >
              <div className="flex items-start gap-1.5">
                <span className="text-[11px] font-bold text-blue-500 shrink-0 mt-0.5">0{idx + 1}</span>
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
                  onClick={() => onRequestAction(s.email, s.contactName, `Urgent Sync: ${signal.title} Resolution Alignment`, s.draftBody)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-white bg-blue-500 hover:bg-blue-600 rounded-sm transition-all cursor-pointer border-none"
                >
                  <Mail size={9} />
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
        
    </Modal>
  );
};
