/**
 * Forecast detail for a selected month.
 *
 * Extracted from ExecutiveOverview.tsx (2,142 lines).
 */
import React from 'react';
import { X, Calendar } from 'lucide-react';
import { ModalShell } from '../../common/Modal';
import { MONTH_FORECAST_DETAILS } from './executiveData';

export const MonthForecastModal: React.FC<{ isOpen: boolean; month: string | null; onClose: () => void }> = ({ isOpen, month, onClose }) => {
  if (!isOpen || !month) return null;
  const data = MONTH_FORECAST_DETAILS[month];
  if (!data) return null;
  const isBelowTarget = data.thisYearActual !== "N/A (Pending)" && parseFloat(data.thisYearActual.replace(/[^\d.]/g, "")) < parseFloat(data.thisYearTarget.replace(/[^\d.]/g, ""));

  return (
    <ModalShell isOpen onClose={onClose} layer="nested" className="flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-display font-extrabold text-zinc-900 dark:text-zinc-50">
                Strategic Forecast & Pricing Review: {data.fullName}
              </h2>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Corporate Intelligence & Projections
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="font-bold text-[9.5px] uppercase tracking-widest text-zinc-400">Revenue Analysis ($ M)</p>
            <div className="bg-zinc-50 dark:bg-white/5 p-3.5 rounded border border-black/5 dark:border-white/10 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Prior Year (Last Year) Sales:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{data.lastYearActual}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">This Year Target vs Actual:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {data.thisYearTarget} / <span className={isBelowTarget ? "text-amber-500 font-bold" : "text-green-500 font-bold"}>{data.thisYearActual}</span>
                </span>
              </div>
              <div className="border-t border-black/5 dark:border-white/5 pt-2.5 flex justify-between items-center">
                <span className="text-purple-600 dark:text-purple-400 font-extrabold">Next Year Forecast (Proj):</span>
                <div className="text-right">
                  <span className="font-extrabold text-purple-600 dark:text-purple-400 text-sm block">{data.nextYearForecast}</span>
                  <span className="text-[8px] text-green-500 uppercase tracking-wider font-extrabold">{data.growthRate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-[9.5px] uppercase tracking-widest text-zinc-400">Blended Price Index (Category unit)</p>
            <div className="bg-zinc-50 dark:bg-white/5 p-3.5 rounded border border-black/5 dark:border-white/10 space-y-2.5 h-[116px] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Last Year Blended Price:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{data.lastYearPriceIndex}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">This Year Blended Price:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{data.thisYearPriceIndex}</span>
              </div>
              <div className="border-t border-black/5 dark:border-white/5 pt-2.5 flex justify-between items-center">
                <span className="text-indigo-700 dark:text-indigo-400 font-bold">YoY Price Lift:</span>
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">+4.2% Growth</span>
              </div>
            </div>
          </div>
        </div>



        <div className="flex justify-end border-t border-black/10 dark:border-white/10 pt-3 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent outline-none"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
