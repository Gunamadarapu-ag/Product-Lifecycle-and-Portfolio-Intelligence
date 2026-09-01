/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, TrendingUp, TrendingDown, AlertTriangle, Activity, CheckCircle, Sparkles, DollarSign, Calendar
} from 'lucide-react';

interface MonthForecastDetail {
  month: string;
  fullName: string;
  thisYearActual: string;
  thisYearTarget: string;
  lastYearActual: string;
  nextYearForecast: string;
  lastYearPriceIndex: string;
  thisYearPriceIndex: string;
  growthRate: string;
  aiRecommendations: string[];
}

const MONTH_FORECAST_DATA: Record<string, MonthForecastDetail> = {
  Jan: {
    month: 'Jan',
    fullName: 'January',
    thisYearActual: '$58.0 M',
    thisYearTarget: '$60.0 M',
    lastYearActual: '$51.8 M',
    nextYearForecast: '$65.0 M',
    lastYearPriceIndex: '$142 / unit',
    thisYearPriceIndex: '$148 / unit',
    growthRate: '+12.4% projected',
    aiRecommendations: [
      'Raw material prices are projected to ease in Q1. Pre-negotiate wholesale sugar and packaging contracts to lock in a 4% cost reduction.',
      'Sustain higher marketing allocation for APAC Beverages to offset the slight winter seasonal slowdown.',
      'Transition low-velocity Dairy variants to regional distributors to lower direct administrative complexity.'
    ]
  },
  Feb: {
    month: 'Feb',
    fullName: 'February',
    thisYearActual: '$61.0 M',
    thisYearTarget: '$63.0 M',
    lastYearActual: '$54.5 M',
    nextYearForecast: '$68.3 M',
    lastYearPriceIndex: '$143 / unit',
    thisYearPriceIndex: '$149 / unit',
    growthRate: '+12.0% projected',
    aiRecommendations: [
      'Run cross-promotional campaigns linking Beverages and Snacks to capture post-holiday retail velocity.',
      'Increase safety stock levels by 6% in hypermarkets for top 10 hero SKUs to avoid recurring stockout leakage.',
      'Hold contract pricing corridors stable across Italy and Spain; resist discount pressure from enterprise accounts.'
    ]
  },
  Mar: {
    month: 'Mar',
    fullName: 'March',
    thisYearActual: '$65.0 M',
    thisYearTarget: '$66.0 M',
    lastYearActual: '$58.1 M',
    nextYearForecast: '$72.8 M',
    lastYearPriceIndex: '$144 / unit',
    thisYearPriceIndex: '$151 / unit',
    growthRate: '+12.0% projected',
    aiRecommendations: [
      'Lock in procurement logistics for Q2 peak shipping lanes to hedge against freight rates volatility.',
      'Introduce secondary vendor options for primary flavor concentrates to hedge supply chain lead-time risks.',
      'Prepare shelf layouts for upcoming BrandA Premium Energy launches; secure endcap space with retailers.'
    ]
  },
  Apr: {
    month: 'Apr',
    fullName: 'April',
    thisYearActual: '$70.0 M',
    thisYearTarget: '$70.0 M',
    lastYearActual: '$62.5 M',
    nextYearForecast: '$78.4 M',
    lastYearPriceIndex: '$144 / unit',
    thisYearPriceIndex: '$152 / unit',
    growthRate: '+12.0% projected',
    aiRecommendations: [
      'Monitor raw milk supplier capacity; pre-arrange backup supply agreements to secure gross margin parameters.',
      'Deploy regional price increases of 3.5% on snacks where demand elasticity is low to counter inflation.',
      'Standardize currency hedging contracts to insulate EMEA sales margins from currency fluctuations.'
    ]
  },
  May: {
    month: 'May',
    fullName: 'May',
    thisYearActual: '$74.0 M',
    thisYearTarget: '$74.0 M',
    lastYearActual: '$66.1 M',
    nextYearForecast: '$82.9 M',
    lastYearPriceIndex: '$145 / unit',
    thisYearPriceIndex: '$153 / unit',
    growthRate: '+12.0% projected',
    aiRecommendations: [
      'Run optimization algorithms on regional inventories to balance stock levels across North and West DCs.',
      'Optimize trade promotion depth: enforce a 15% discount cap on cookies and chips to reclaim margin rates.',
      'Accelerate phase-out timelines for low-value sunset candidates to reallocate production floor bandwidth.'
    ]
  },
  Jun: {
    month: 'Jun',
    fullName: 'June',
    thisYearActual: '$77.0 M',
    thisYearTarget: '$76.0 M',
    lastYearActual: '$68.8 M',
    nextYearForecast: '$86.2 M',
    lastYearPriceIndex: '$146 / unit',
    thisYearPriceIndex: '$154 / unit',
    growthRate: '+11.9% projected',
    aiRecommendations: [
      'Implement direct-to-retailer distribution routes in high-density metro corridors to bypass regional depot margins.',
      'Triage competitor pricing moves: match promotional discount frequency, but maintain base list prices.',
      'Leverage summer volume gains by scaling distribution of single-serve mineral water and sports drinks.'
    ]
  },
  Jul: {
    month: 'Jul',
    fullName: 'July',
    thisYearActual: '$80.0 M',
    thisYearTarget: '$80.0 M',
    lastYearActual: '$71.4 M',
    nextYearForecast: '$89.6 M',
    lastYearPriceIndex: '$146 / unit',
    thisYearPriceIndex: '$154 / unit',
    growthRate: '+12.0% projected',
    aiRecommendations: [
      'Conduct midpoint operational reviews of supply sourcing lead times; update DC replenishment schedules.',
      'Consolidate raw material freight carriers to secure bulk shipping lane contract discounts.',
      'Optimize portfolio mix: increase production volume for top-margin items while capping low-velocity lines.'
    ]
  },
  Aug: {
    month: 'Aug',
    fullName: 'August',
    thisYearActual: '$84.0 M',
    thisYearTarget: '$83.0 M',
    lastYearActual: '$75.0 M',
    nextYearForecast: '$94.1 M',
    lastYearPriceIndex: '$147 / unit',
    thisYearPriceIndex: '$155 / unit',
    growthRate: '+12.0% projected',
    aiRecommendations: [
      'Initiate discussions with primary supermarkets for holiday shelf placement commitments.',
      'Pre-position packaging inventory at regional warehouses to avoid shipping congestions.',
      'Analyze customer NPS score feedback; prioritize delivery dispatch speed optimizations in Europe.'
    ]
  },
  Sep: {
    month: 'Sep',
    fullName: 'September',
    thisYearActual: '$88.0 M',
    thisYearTarget: '$86.0 M',
    lastYearActual: '$78.6 M',
    nextYearForecast: '$98.6 M',
    lastYearPriceIndex: '$148 / unit',
    thisYearPriceIndex: '$156 / unit',
    growthRate: '+12.1% projected',
    aiRecommendations: [
      'Negotiate bulk warehouse space leases for Q4 inventory build-ups before spot rental rates spike.',
      'Curb promotional discounts on high-erosion accounts to recover list price margins prior to holidays.',
      'Audit supplier performance indexes; draft performance improvement plans for lagging partners.'
    ]
  },
  Oct: {
    month: 'Oct',
    fullName: 'October',
    thisYearActual: '$91.0 M',
    thisYearTarget: '$90.0 M',
    lastYearActual: '$81.3 M',
    nextYearForecast: '$101.9 M',
    lastYearPriceIndex: '$148 / unit',
    thisYearPriceIndex: '$157 / unit',
    growthRate: '+12.0% projected',
    aiRecommendations: [
      'Execute phased rollouts for regional pricing adjustments on personal care portfolios.',
      'Establish priority freight lanes with logistics providers to secure holiday delivery dispatch windows.',
      'Monitor cannibalization alerts in Snacks; adjust shelf spacing to favor high-margin variants.'
    ]
  },
  Nov: {
    month: 'Nov',
    fullName: 'November',
    thisYearActual: '$92.4 M',
    thisYearTarget: '$93.0 M',
    lastYearActual: '$83.0 M',
    nextYearForecast: '$104.2 M',
    lastYearPriceIndex: '$149 / unit',
    thisYearPriceIndex: '$157 / unit',
    growthRate: '+12.0% projected',
    aiRecommendations: [
      'Run final tests on the upcoming Q1 new product launches; check milestone pipeline readiness.',
      'Maximize distributor shelf inventory depth on high-demand holiday SKU lines.',
      'Ensure Continuous Close audit ledger records are updated; clear all intercompany variances.'
    ]
  },
  Dec: {
    month: 'Dec',
    fullName: 'December',
    thisYearActual: '$95.1 M',
    thisYearTarget: '$96.0 M',
    lastYearActual: '$85.7 M',
    nextYearForecast: '$107.5 M',
    lastYearPriceIndex: '$150 / unit',
    thisYearPriceIndex: '$158 / unit',
    growthRate: '+12.0% projected',
    aiRecommendations: [
      'Review full-year margin and revenue targets; formulate Q1 operational goals and benchmarks.',
      'Leverage year-end volume rebates with raw material suppliers to maximize gross margins.',
      'Prepare portfolio rationalization lists for phase-out rollouts in the new fiscal year.'
    ]
  }
};

interface TrendMonthForecastModalProps {
  isOpen: boolean;
  month: string | null;
  onClose: () => void;
}

export const TrendMonthForecastModal: React.FC<TrendMonthForecastModalProps> = ({
  isOpen,
  month,
  onClose
}) => {

  if (!isOpen || !month) return null;

  const data = MONTH_FORECAST_DATA[month];
  if (!data) return null;

  const isUnderperforming = data.thisYearActual !== 'N/A (Pending)' && 
    parseFloat(data.thisYearActual.replace(/[^\d.]/g, '')) < parseFloat(data.thisYearTarget.replace(/[^\d.]/g, ''));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
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

        {/* Projections Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Revenue Columns */}
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
                  {data.thisYearTarget} / <span className={isUnderperforming ? 'text-amber-500 font-bold' : 'text-green-500 font-bold'}>{data.thisYearActual}</span>
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

          {/* Pricing Dynamics */}
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
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  +4.2% Growth
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end items-center border-t border-black/10 dark:border-white/10 pt-3 mt-1">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent outline-none"
          >
            Close Analysis
          </button>
        </div>

      </div>
    </div>
  );
};
