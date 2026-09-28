/**
 * Category performance detail. Opens the SKU analysis modal for a selected category.
 *
 * Extracted from CategoryPerformanceDetailsModal.tsx (1,790 lines).
 */
import React, { useState } from 'react';
import { X, Award, AlertTriangle, Zap, BarChart2, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { Role } from '../../../types/dashboard';
import { ModalShell } from '../../common/Modal';
import { SkuAnalysisModal } from './SkuAnalysisModal';
import { CATEGORY_DETAILS_DATA, SkuPerformanceDetail } from './categoryDetailsData';

export interface CategoryPerformanceDetailsModalProps {
  isOpen: boolean;
  categoryName: string | null;
  onClose: () => void;
  role?: Role;
  onRequestAction?: (email: string, name: string, subject: string, body: string, messageBody?: string) => void;
}

export const CategoryPerformanceDetailsModal: React.FC<CategoryPerformanceDetailsModalProps> = ({
  isOpen,
  categoryName,
  onClose,
  role,
  onRequestAction
}) => {
  const [selectedSkuDetail, setSelectedSkuDetail] = useState<{ sku: SkuPerformanceDetail; type: 'good' | 'poor' | 'booming' } | null>(null);

  if (!isOpen || !categoryName) return null;

  const data = CATEGORY_DETAILS_DATA[categoryName];
  if (!data) return null;

  return (
    <ModalShell isOpen onClose={onClose} layer="nested" className="flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-blue-500" />
              <h2 className="text-sm font-display font-extrabold text-zinc-900 dark:text-zinc-50">
                Category Insight Briefing: {data.name}
              </h2>
              <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded">
                Share: {data.marketShare}
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">
              Category Total Revenue: <span className="text-zinc-700 dark:text-zinc-200 font-extrabold">{data.totalRev}</span>
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent outline-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* 3-Column Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Top Performer - Giving Good */}
          <div 
            onClick={() => setSelectedSkuDetail({ sku: data.topPerformer, type: 'good' })}
            className="bg-emerald-500/5 dark:bg-emerald-500/2 border border-emerald-500/15 rounded p-3.5 flex flex-col justify-between h-full space-y-3 cursor-pointer hover:border-emerald-500/40 hover:scale-[1.01] transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Award size={14} className="shrink-0" />
                <span className="font-extrabold text-[9.5px] uppercase tracking-wider">Top Performer (Good)</span>
              </div>
              <div>
                <h3 className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200 leading-snug">{data.topPerformer.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{data.topPerformer.rev}</span>
                  <span className="text-[8.5px] font-extrabold text-emerald-500 flex items-center gap-0.5">
                    <ArrowUpRight size={10} />
                    {data.topPerformer.growth}
                  </span>
                </div>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                {data.topPerformer.rationale}
              </p>
            </div>
            <div className="border-t border-emerald-500/10 pt-2.5 flex justify-between items-center text-[9px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase">
              <span>{data.topPerformer.metricLabel}:</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300">{data.topPerformer.metricValue}</span>
            </div>
          </div>

          {/* Underperformer - Not Giving Good */}
          <div 
            onClick={() => setSelectedSkuDetail({ sku: data.underperformer, type: 'poor' })}
            className="bg-rose-500/5 dark:bg-rose-500/2 border border-rose-500/15 rounded p-3.5 flex flex-col justify-between h-full space-y-3 cursor-pointer hover:border-rose-500/40 hover:scale-[1.01] transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle size={14} className="shrink-0" />
                <span className="font-extrabold text-[9.5px] uppercase tracking-wider">Underperformer (Poor)</span>
              </div>
              <div>
                <h3 className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200 leading-snug">{data.underperformer.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">{data.underperformer.rev}</span>
                  <span className="text-[8.5px] font-extrabold text-rose-500 flex items-center gap-0.5">
                    <ArrowDownRight size={10} />
                    {data.underperformer.growth}
                  </span>
                </div>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                {data.underperformer.rationale}
              </p>
            </div>
            <div className="border-t border-rose-500/10 pt-2.5 flex justify-between items-center text-[9px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase">
              <span>{data.underperformer.metricLabel}:</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300">{data.underperformer.metricValue}</span>
            </div>
          </div>

          {/* Booming Sku - Booming in Market */}
          <div 
            onClick={() => setSelectedSkuDetail({ sku: data.boomingSku, type: 'booming' })}
            className="bg-purple-500/5 dark:bg-purple-500/2 border border-purple-500/15 rounded p-3.5 flex flex-col justify-between h-full space-y-3 cursor-pointer hover:border-purple-500/40 hover:scale-[1.01] transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Zap size={14} className="shrink-0" />
                <span className="font-extrabold text-[9.5px] uppercase tracking-wider">Booming (Market)</span>
              </div>
              <div>
                <h3 className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200 leading-snug">{data.boomingSku.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400">{data.boomingSku.rev}</span>
                  <span className="text-[8.5px] font-extrabold text-purple-500 flex items-center gap-0.5">
                    <ArrowUpRight size={10} />
                    {data.boomingSku.growth}
                  </span>
                </div>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                {data.boomingSku.rationale}
              </p>
            </div>
            <div className="border-t border-purple-500/10 pt-2.5 flex justify-between items-center text-[9px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase">
              <span>{data.boomingSku.metricLabel}:</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300">{data.boomingSku.metricValue}</span>
            </div>
          </div>
        </div>

        {/* VP Category Sourcing Brief */}
        {role !== 'Product Manager' && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-500" />
              <p className="font-bold text-[9.5px] uppercase tracking-widest text-blue-500">VP Strategic Briefing & Direction</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/15 rounded p-3 leading-relaxed text-zinc-800 dark:text-zinc-200">
              {data.vpBriefing}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t border-black/10 dark:border-white/10 pt-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent outline-none"
          >
            Close Briefing
          </button>
        </div>

      </div>

      {selectedSkuDetail && (
        <SkuAnalysisModal 
          isOpen={true}
          sku={selectedSkuDetail.sku}
          type={selectedSkuDetail.type}
          categoryName={data.name}
          onClose={() => setSelectedSkuDetail(null)}
          onRequestAction={onRequestAction}
          role={role}
        />
      )}
    </ModalShell>
  );
};
