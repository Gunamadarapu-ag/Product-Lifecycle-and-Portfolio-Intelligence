/**
 * SKU analysis, its root-cause deep dive and the recommendation detail.
 *
 * Extracted from CategoryPerformanceDetailsModal.tsx (1,790 lines).
 */
import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Sparkles, Calendar, Mail, Users } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Role } from '../../../types/dashboard';
import { ModalShell } from '../../common/Modal';
import { RecommendationDetail, SKU_ANALYSIS_DETAILS, SkuPerformanceDetail, SkuRootCauseDeepDive } from './categoryDetailsData';
import { generateTrendData, getCasualMessage, getFormalEmail } from './categoryHelpers';

export interface SkuRootCauseDeepDiveModalProps {
  isOpen: boolean;
  skuName: string;
  onClose: () => void;
  deepDive: SkuRootCauseDeepDive;
}

export const SkuRootCauseDeepDiveModal: React.FC<SkuRootCauseDeepDiveModalProps> = ({
  isOpen,
  skuName,
  onClose,
  deepDive
}) => {
  if (!isOpen) return null;

  return (
    <ModalShell isOpen onClose={onClose} layer="rootCause" className="flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-2">
          <div className="flex items-center gap-1.5 text-purple-600">
            <Users size={15} />
            <span className="text-[13px] font-display font-bold text-zinc-800 dark:text-zinc-100">
              Deep-Dive Root Cause
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent"
          >
            <X size={14} />
          </button>
        </div>

        <div className="bg-purple-500/5 p-3 rounded border border-purple-500/10">
          <p className="font-bold text-zinc-800 dark:text-zinc-100 text-[11px] leading-snug">{skuName}</p>
        </div>

        {/* Deep Dive Sections */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[7.5px] font-bold text-purple-500 uppercase tracking-widest block">Supply Chain & Inventory Logistics</span>
            <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed font-normal">
              {deepDive.supplyChain}
            </p>
          </div>

          <div className="space-y-1 border-t border-black/[0.04] dark:border-white/[0.04] pt-3">
            <span className="text-[7.5px] font-bold text-purple-500 uppercase tracking-widest block">Consumer Behavior & Cohort Insights</span>
            <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed font-normal">
              {deepDive.consumerInsights}
            </p>
          </div>

          <div className="space-y-1 border-t border-black/[0.04] dark:border-white/[0.04] pt-3">
            <span className="text-[7.5px] font-bold text-purple-500 uppercase tracking-widest block">Financial Performance & Promotional Elasticity</span>
            <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed font-normal">
              {deepDive.financialPricing}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-black/15 dark:border-white/15 pt-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-700 text-white rounded-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-none"
          >
            Go Back
          </button>
        </div>

      </div>
    </ModalShell>
  );
};

export interface RecommendationDetailModalProps {
  isOpen: boolean;
  rec: RecommendationDetail;
  idx: number;
  onClose: () => void;
  onRequestAction?: (email: string, name: string, subject: string, body: string, messageBody?: string) => void;
  role?: Role;
}

export const RecommendationDetailModal: React.FC<RecommendationDetailModalProps> = ({
  isOpen,
  rec,
  idx,
  onClose,
  onRequestAction,
  role
}) => {
  if (!isOpen) return null;

  const getMappedOptions = () => {
    return rec.teamOptions.map(opt => {
      let contactName = opt.contactName;
      let contactTitle = opt.contactTitle;
      let email = opt.email;

      // If the user role is Product Manager or Pricing and Margin Partner, substitute Priya Sharma (self-sync)
      if (role === 'Product Manager' || role === 'Pricing and Margin Partner') {
        if (contactName === 'Priya Sharma') {
          if (opt.action.toLowerCase().includes('marketing') || opt.action.toLowerCase().includes('promo') || opt.action.toLowerCase().includes('brand')) {
            contactName = 'Siddharth Roy';
            contactTitle = 'Marketing Manager';
            email = 'siddharth.roy@aciesglobal.com';
          } else {
            contactName = 'Rohan Das';
            contactTitle = 'Supply Chain Lead';
            email = 'rohan.das@aciesglobal.com';
          }
        }
      }

      // Generate formal email and casual message drafts dynamically
      const emailDraft = getFormalEmail(contactName, role || 'VP', opt.action, opt.impact, rec.title);
      const msgDraft = getCasualMessage(contactName, opt.action);
      
      return {
        ...opt,
        contactName,
        contactTitle,
        email,
        draftBody: emailDraft,
        messageBody: msgDraft
      };
    });
  };

  const options = getMappedOptions();

  return (
    <ModalShell isOpen onClose={onClose} layer="deepDive" className="flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-2">
          <div className="flex items-center gap-1.5 text-purple-600">
            <Calendar size={15} />
            <span className="text-[14px] font-display font-bold text-zinc-800 dark:text-zinc-100">
              Schedule Sync Meeting
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent"
          >
            <X size={14} />
          </button>
        </div>
        
        {/* Recommendation Context */}
        <div className="bg-zinc-50 dark:bg-white/5 p-3 rounded border border-black/5 dark:border-white/10">
          <span className="font-bold text-[8.5px] uppercase tracking-wider text-purple-500 block mb-1">Recommendation 0{idx + 1}</span>
          <p className="text-zinc-800 dark:text-zinc-100 font-bold leading-snug">{rec.title}</p>
        </div>

        {/* Detailed Analysis */}
        <div>
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400 mb-1">Detailed Analysis & Objective</p>
          <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed font-normal">
            {rec.moreInfo}
          </p>
        </div>

        {/* Suggested Team Meetings List */}
        <div className="space-y-2.5">
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">Responsible Departments & Leads</p>
          {options.map((opt, idx) => (
            <div 
              key={idx} 
              className="p-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-sm hover:border-black/15 dark:hover:border-white/20 transition-all flex flex-col gap-1.5 shadow-sm"
            >
              <div className="flex items-start gap-1.5">
                <span className="text-[11px] font-bold text-purple-500 shrink-0 mt-0.5">0{idx + 1}</span>
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 leading-snug">{opt.action}</p>
                  <p className="text-[9px] opacity-45 leading-none mt-1">
                    Lead: <span className="font-extrabold">{opt.contactName}</span> ({opt.contactTitle})
                  </p>
                </div>
              </div>
              
              <div className="pl-4 flex items-center justify-between gap-2 border-t border-black/[0.03] dark:border-white/[0.03] pt-1.5 mt-0.5">
                <div className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-medium">
                  <span className="opacity-60 uppercase font-bold text-[8px] tracking-wider block">Objective</span>
                  {opt.impact}
                </div>
                {onRequestAction && (
                  <button
                    onClick={() => {
                      onRequestAction(opt.email, opt.contactName, `Sync Request: ${opt.action}`, opt.draftBody, opt.messageBody);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-white bg-blue-500 hover:bg-blue-600 rounded-sm transition-all cursor-pointer border-none"
                  >
                    <Mail size={9} />
                    Schedule
                  </button>
                )}
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

export interface SkuAnalysisModalProps {
  isOpen: boolean;
  sku: SkuPerformanceDetail;
  type: 'good' | 'poor' | 'booming';
  categoryName: string;
  onClose: () => void;
  onRequestAction?: (email: string, name: string, subject: string, body: string, messageBody?: string) => void;
  role?: Role;
}

export const SkuAnalysisModal: React.FC<SkuAnalysisModalProps> = ({
  isOpen,
  sku,
  type,
  categoryName,
  onClose,
  onRequestAction,
  role
}) => {
  const [selectedRecDetail, setSelectedRecDetail] = useState<{ rec: RecommendationDetail; idx: number } | null>(null);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const details = SKU_ANALYSIS_DETAILS[sku.name];
  if (!details) return null;

  const getTypeStyle = () => {
    if (type === 'good') return {
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      title: 'Top Performer (Good)',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      borderColorClass: 'border-emerald-500/10 dark:border-emerald-500/20'
    };
    if (type === 'poor') return {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      title: 'Underperformer (Poor)',
      colorClass: 'text-rose-600 dark:text-rose-400',
      borderColorClass: 'border-rose-500/10 dark:border-rose-500/20'
    };
    return {
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      title: 'Booming (Market)',
      colorClass: 'text-purple-600 dark:text-purple-400',
      borderColorClass: 'border-purple-500/10 dark:border-purple-500/20'
    };
  };

  const style = getTypeStyle();

  const handleClose = () => {
    setSelectedRecDetail(null);
    setIsDeepDiveOpen(false);
    onClose();
  };

  return (
    <ModalShell isOpen onClose={onClose} layer="detail" scrimClassName="bg-black/70" className="flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-extrabold uppercase tracking-wider border px-2 py-0.5 rounded-sm ${style.badge}`}>
                {style.title}
              </span>
              <h2 className="text-sm font-display font-extrabold text-zinc-900 dark:text-zinc-50">
                {sku.name}
              </h2>
            </div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">
              Category: <span className="text-zinc-700 dark:text-zinc-200 font-extrabold">{categoryName}</span>
            </p>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent outline-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-3 gap-3 bg-zinc-50 dark:bg-white/5 p-3 rounded border border-black/5 dark:border-white/10">
          <div>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block">Revenue</span>
            <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100">{sku.rev}</span>
          </div>
          <div>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block">Growth</span>
            <span className={`font-extrabold text-sm flex items-center gap-0.5 ${type === 'poor' ? 'text-red-500' : 'text-green-500'}`}>
              {type === 'poor' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
              {sku.growth}
            </span>
          </div>
          <div>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block">{sku.metricLabel}</span>
            <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100">{sku.metricValue}</span>
          </div>
        </div>

        {/* Root Cause Analysis */}
        <div className="space-y-1.5">
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400 font-display">Why It's Performing (Root Cause Analysis)</p>
          <div 
            onClick={() => role === 'Product Manager' && setIsDeepDiveOpen(true)}
            className={`bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5 rounded leading-relaxed text-zinc-800 dark:text-zinc-200 transition-all ${
              role === 'Product Manager' 
                ? 'cursor-pointer hover:border-purple-500/30 hover:bg-purple-500/[0.02] group shadow-sm' 
                : ''
            }`}
          >
            <p className="font-semibold">{details.whyItIsPerforming}</p>
            {role === 'Product Manager' && (
              <div className="mt-2.5 flex items-center gap-1 text-[8.5px] font-bold text-purple-600 dark:text-purple-400 group-hover:underline uppercase tracking-wider">
                <span>View Deep-Dive Analysis</span>
                <ArrowUpRight size={10} />
              </div>
            )}
          </div>
        </div>

        {/* Sales Trend Graph (VP & Pricing/Margin Partner Profile) vs AI Recommendations (PM Profile only) */}
        {role !== 'Product Manager' ? (
          <div className="space-y-2">
            <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">SKU Revenue Trend (6-Month Historical)</p>
            <div className="h-44 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded p-2.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateTrendData(sku.name, type)} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={type === 'good' ? '#10b981' : type === 'poor' ? '#f43f5e' : '#a855f7'} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={type === 'good' ? '#10b981' : type === 'poor' ? '#f43f5e' : '#a855f7'} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.07)" />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#71717a', fontSize: 9 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#71717a', fontSize: 9 }}
                    unit="M"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      borderColor: '#27272a',
                      borderRadius: '4px',
                      color: '#f4f4f5',
                      fontSize: '9px'
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Revenue" 
                    stroke={type === 'good' ? '#10b981' : type === 'poor' ? '#f43f5e' : '#a855f7'} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#trendColor)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-purple-500 shrink-0" />
              <p className="font-bold text-[9.5px] uppercase tracking-widest text-purple-500">AI Recommendations to Improve</p>
            </div>
            
            <div className="space-y-2 pl-1">
              {details.recommendations.map((rec, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedRecDetail({ rec, idx })}
                  className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded hover:border-purple-500/30 hover:bg-purple-500/[0.01] transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div className="flex items-start gap-2.5 text-zinc-800 dark:text-zinc-200 leading-snug font-bold pr-3">
                    <span className="text-[10px] text-purple-500 font-mono mt-0.5">0{idx + 1}</span>
                    <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{rec.title}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-zinc-400 group-hover:text-purple-500 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t border-black/10 dark:border-white/10 pt-3">
          <button 
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent outline-none"
          >
            Close Analysis
          </button>
        </div>

      </div>

      {selectedRecDetail && (
        <RecommendationDetailModal 
          isOpen={true}
          rec={selectedRecDetail.rec}
          idx={selectedRecDetail.idx}
          onClose={() => setSelectedRecDetail(null)}
          onRequestAction={(email, name, subject, body, messageBody) => {
            if (onRequestAction) {
              onRequestAction(email, name, subject, body, messageBody);
            }
            setSelectedRecDetail(null);
            onClose(); // close the parent analysis modal too
          }}
          role={role}
        />
      )}

      {isDeepDiveOpen && (
        <SkuRootCauseDeepDiveModal 
          isOpen={true}
          skuName={sku.name}
          onClose={() => setIsDeepDiveOpen(false)}
          deepDive={details.deepDive}
        />
      )}
    </ModalShell>
  );
};
