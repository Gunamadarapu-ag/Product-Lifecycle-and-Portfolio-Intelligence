import React from 'react';
import { Calendar, User, Mail, Users } from 'lucide-react';
import { Modal } from '../../common/Modal';

interface MeetingTeamOption {
  action: string;
  impact: string;
  contactName: string;
  contactTitle: string;
  email: string;
  draftBody: string;
}

interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  age: string;
  urgency: string;
  done: boolean;
}

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  approval: ApprovalItem | null;
  onClose: () => void;
  onRequestAction: (email: string, name: string, subject: string, body: string) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  approval,
  onClose,
  onRequestAction
}) => {
  if (!isOpen || !approval) return null;

  // Respective teams/options depending on approval type
  const getTeamOptions = (): MeetingTeamOption[] => {
    if (approval.type === 'CAPEX') {
      return [
        {
          action: 'Audit Capital Allocation & Finance Sync',
          impact: 'Secures Q3 CAPEX reserves for brand acquisitions',
          contactName: 'Ananya Sen',
          contactTitle: 'Director of Portfolio Finance',
          email: 'ananya.sen@aciesglobal.com',
          draftBody: `Hi Ananya,\n\nI want to schedule an urgent meeting to sync on the CAPEX allocation for the "${approval.title}". Let's align on the Q3 capital reserves.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Brand Compliance & Regulatory Sync',
          impact: 'Vets brand trademark registrations and legal compliance',
          contactName: 'Amit Verma',
          contactTitle: 'NPD Product Lead',
          email: 'amit.verma@aciesglobal.com',
          draftBody: `Hi Amit,\n\nLet's schedule a meeting to review trademark compliance and legal filings for the "${approval.title}".\n\nThanks,\nVP Product Management`
        }
      ];
    } else if (approval.type === 'Promo') {
      return [
        {
          action: 'Pricing Floor & Gross Margin Integrity Check',
          impact: 'Ensures margin floor won\'t collapse below the 35% limit',
          contactName: 'Priya Sharma',
          contactTitle: 'Lead Product Manager',
          email: 'priya.sharma@aciesglobal.com',
          draftBody: `Hi Priya,\n\nI\'d like to schedule a brief meeting to verify the gross margin protection and pricing floors for the "${approval.title}". Let\'s review Q4 ROI.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Retail Account Alignment',
          impact: 'Aligns key account retail margins and promotional calendar',
          contactName: 'Karan Johar',
          contactTitle: 'Director of Commercial Portfolio',
          email: 'karan.johar@aciesglobal.com',
          draftBody: `Hi Karan,\n\nLet's schedule a meeting to review the key account margin structures for the upcoming "${approval.title}".\n\nThanks,\nVP Product Management`
        }
      ];
    } else if (approval.type === 'Pricing') {
      return [
        {
          action: 'Margin Integrity & Pricing Elasticity Sync',
          impact: 'Ensures price increases do not lead to volume drop-offs',
          contactName: 'Amit Mehta',
          contactTitle: 'Product Pricing Director',
          email: 'amit.mehta@aciesglobal.com',
          draftBody: `Hi Amit,\n\nI want to schedule a sync to review the price elasticity model for "${approval.title}". Let's align on protecting gross margins.\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Finance & P&L Impact Review',
          impact: 'Confirms contribution margin targets across all channels',
          contactName: 'Ananya Sen',
          contactTitle: 'Director of Portfolio Finance',
          email: 'ananya.sen@aciesglobal.com',
          draftBody: `Hi Ananya,\n\nLet's align on the P&L impact of the price adjustment proposal: "${approval.title}".\n\nThanks,\nVP Product Management`
        }
      ];
    } else if (approval.type === 'Rationalize') {
      return [
        {
          action: 'SKU De-listing & Retail Alignment',
          impact: 'Coordinates retail de-listing timeline and shelf space reallocation',
          contactName: 'Karan Johar',
          contactTitle: 'Director of Commercial Portfolio',
          email: 'karan.johar@aciesglobal.com',
          draftBody: `Hi Karan,\n\nLet's schedule a meeting to coordinate the retail de-listing timeline and shelf space transitions for "${approval.title}".\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Brand Marketing Budget Reallocation',
          impact: 'Reallocates brand marketing and promotional spend to high-margin growth SKUs',
          contactName: 'Priya Sharma',
          contactTitle: 'Lead Product Manager',
          email: 'priya.sharma@aciesglobal.com',
          draftBody: `Hi Priya,\n\nWe need to schedule a meeting to review how the "${approval.title}" rationalization will allow us to reallocate marketing resources to our growth portfolio.\n\nThanks,\nVP Product Management`
        }
      ];
    } else {
      // Launch / default
      return [
        {
          action: 'GTM Brand Positioning & Package Design Review',
          impact: 'Ensures brand positioning and packaging design are certified',
          contactName: 'Amit Verma',
          contactTitle: 'NPD Product Lead',
          email: 'amit.verma@aciesglobal.com',
          draftBody: `Hi Amit,\n\nI'd like to schedule a meeting to review package designs and first-year pricing models for "${approval.title}".\n\nThanks,\nVP Product Management`
        },
        {
          action: 'Regional Retail Placement Sync',
          impact: 'Confirms front-row shelf allocations across 240 key stores',
          contactName: 'Karan Johar',
          contactTitle: 'Director of Commercial Portfolio',
          email: 'karan.johar@aciesglobal.com',
          draftBody: `Hi Karan,\n\nLet's schedule a meeting to review the regional shelf placement contracts and account launches for "${approval.title}". We want optimal positioning.\n\nThanks,\nVP Product Management`
        }
      ];
    }
  };

  const options = getTeamOptions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Sync Meeting"
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
          <div className="flex items-center gap-1.5 text-zinc-550 dark:text-zinc-300">
            <Users size={12} className="text-zinc-400" />
            <span className="font-bold text-[10px] uppercase tracking-wider">{approval.title}</span>
          </div>
          <span className={`text-[8.5px] uppercase font-extrabold px-2 py-0.5 rounded-sm ${
            approval.urgency === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            {approval.urgency} Urgency
          </span>
        </div>

        {/* Root Cause Context */}
        <div>
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400 mb-1">Approval Request context</p>
          <p className="text-zinc-655 dark:text-zinc-350 leading-relaxed font-normal">
            To proceed with this item, a cross-functional alignment session is required with the departments owning the execution risks, commercial strategies, and capital reserves.
          </p>
        </div>

        {/* Suggested Team Meetings List */}
        <div className="space-y-2.5">
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">Responsible Departments & Leads</p>
          {options.map((s, idx) => (
            <div 
              key={idx} 
              className="p-3 bg-white dark:bg-zinc-850 border border-black/5 dark:border-white/10 rounded-sm hover:border-black/15 dark:hover:border-white/20 transition-all flex flex-col gap-1.5 shadow-sm"
            >
              <div className="flex items-start gap-1.5">
                <span className="text-[11px] font-bold text-blue-500 shrink-0 mt-0.5">0{idx + 1}</span>
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 leading-snug">{s.action}</p>
                  <p className="text-[9px] opacity-45 leading-none mt-1">
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
                  onClick={() => onRequestAction(s.email, s.contactName, `Urgent Sync: ${approval.title} Approval Alignment`, s.draftBody)}
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
