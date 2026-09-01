/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Globe } from 'lucide-react';

interface BusinessCaseAdvisorProps {
  paybackMonths: number;
  totalExitCost: number;
  annualSavingsThousands: number;
  exitDateDays: number;
  skuB: string;
  transferenceRate: number;
  transferenceVolume: number;
  leakageVolume: number;
  walmartStatus: string;
  targetStatus: string;
  tescoStatus: string;
  costcoStatus: string;
  isSafetyStockRaised: boolean;
  role: string;
  hasVpSignedOff: boolean;
  isCaseReady: boolean;
  logAction?: (team: string, stepLabel: string, details: string, rationale: string) => void;
}

export const BusinessCaseAdvisor: React.FC<BusinessCaseAdvisorProps> = ({
  paybackMonths,
  totalExitCost,
  annualSavingsThousands,
  exitDateDays,
  skuB,
  transferenceRate,
  transferenceVolume,
  leakageVolume,
  walmartStatus,
  targetStatus,
  tescoStatus,
  costcoStatus,
  isSafetyStockRaised,
  role,
  hasVpSignedOff,
  isCaseReady,
  logAction,
}) => {
  return (
    <div className="lg:col-span-5 space-y-5">
      {/* Advisor Header */}
      <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-1">
        <h4 className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider flex items-center gap-1.5 font-sans">
          <Globe size={11} className="stroke-[2.5]" />
          <span>Category Business Case Advisor</span>
        </h4>
        <p className="text-[8.5px] font-medium text-zinc-500 dark:text-zinc-500 leading-normal font-sans">
          Continuous simulations evaluating substitutions, obsolescence costs, and retailer notice runways.
        </p>
      </div>

      {/* Payback Card */}
      <div className="p-4 bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 rounded-xl space-y-3.5 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-500">Payback Feasibility</span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
            paybackMonths < 9 
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
              : paybackMonths <= 18 
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {paybackMonths < 12 ? 'RECOMMENDED' : 'EVALUATE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block">Exit Cost Burden</span>
            <span className="text-base font-black text-zinc-800 dark:text-zinc-100 block">
              ${totalExitCost.toFixed(0)}k
            </span>
            <span className="text-[7.5px] text-zinc-500 dark:text-zinc-500 block font-bold uppercase">
              Write-offs + markdowns
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block">Annual Savings</span>
            <span className="text-base font-black text-emerald-500 block">
              ${annualSavingsThousands.toFixed(0)}k
            </span>
            <span className="text-[7.5px] text-zinc-500 dark:text-zinc-500 block font-bold uppercase">
              Margin uplift + SC savings
            </span>
          </div>
        </div>

        {/* Payback speed progress */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1.5">
          <div className="flex justify-between text-[8px] font-black uppercase text-zinc-500">
            <span>Exit Payback Speed</span>
            <span className="text-purple-500 font-extrabold">{paybackMonths} Months</span>
          </div>
          <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                paybackMonths < 9 ? 'bg-emerald-500' : paybackMonths <= 18 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (paybackMonths / 24) * 100)}%` }}
            />
          </div>
          <p className="text-[8.5px] text-zinc-500 leading-relaxed font-semibold italic mt-1 font-sans">
            * Payback calculations automatically factor run-down optimization over {exitDateDays} days.
          </p>
        </div>
      </div>

      {/* Volume Transference Map */}
      <div className="p-4 bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 rounded-xl space-y-3 shadow-sm">
        <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-500 block">Variant Substitution Rate</span>
        
        <div className="space-y-3.5">
          <div className="space-y-1">
            <div className="flex justify-between text-[8.5px] font-bold">
              <span className="text-acies-gray dark:text-zinc-300">Transferred to Sibling ({skuB ? skuB.split(' ')[0] : ''})</span>
              <span className="text-purple-600 dark:text-purple-400 font-black">{transferenceRate}%</span>
            </div>
            <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded overflow-hidden flex">
              <div className="bg-purple-500 h-full" style={{ width: `${transferenceRate}%` }} />
              <div className="bg-red-500/20 h-full" style={{ width: `${100 - transferenceRate}%` }} />
            </div>
            <div className="flex justify-between text-[7.5px] font-bold text-zinc-500">
              <span>${transferenceVolume} M preserved</span>
              <span>${leakageVolume} M category leak ({100 - transferenceRate}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retailer Delisting Notice Checklist */}
      <div className="p-4 bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 rounded-xl space-y-3 shadow-sm">
        <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-500 block">Global Retailer Alignment</span>
        
        <div className="divide-y divide-black/5 dark:divide-white/5 text-[9px] font-bold">
          <div className="flex justify-between py-2 items-center">
            <span className="text-zinc-600 dark:text-zinc-300">Walmart US SKU Listing</span>
            <span className={`px-2 py-0.5 rounded text-[7.5px] font-black uppercase ${
              walmartStatus === 'Delisted' ? 'bg-emerald-500/10 text-emerald-500 font-black' : 'bg-amber-500/10 text-amber-500 font-black'
            }`}>{walmartStatus}</span>
          </div>
          <div className="flex justify-between py-2 items-center">
            <span className="text-zinc-600 dark:text-zinc-300">Target Corp De-listing</span>
            <span className={`px-2 py-0.5 rounded text-[7.5px] font-black uppercase ${
              targetStatus === 'Delisted' ? 'bg-emerald-500/10 text-emerald-500 font-black' : 'bg-amber-500/10 text-amber-500 font-black'
            }`}>{targetStatus}</span>
          </div>
          <div className="flex justify-between py-2 items-center">
            <span className="text-zinc-600 dark:text-zinc-300">Tesco PLC Notice</span>
            <span className={`px-2 py-0.5 rounded text-[7.5px] font-black uppercase ${
              tescoStatus === 'Delisted' ? 'bg-emerald-500/10 text-emerald-500 font-black' : 'bg-blue-500/10 text-blue-500 font-black'
            }`}>{tescoStatus}</span>
          </div>
          <div className="flex justify-between py-2 items-center">
            <span className="text-zinc-600 dark:text-zinc-300">Costco Wholesale Review</span>
            <span className={`px-2 py-0.5 rounded text-[7.5px] font-black uppercase ${
              costcoStatus === 'In Negotiation' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500 font-black'
            }`}>{costcoStatus}</span>
          </div>
        </div>
      </div>

      {/* Supply Chain Runway */}
      <div className="p-4 bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 rounded-xl space-y-3 shadow-sm">
        <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-500 block">Supply Run-down Runway</span>
        <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg text-[9px] font-bold space-y-1.5 text-zinc-500 font-mono">
          <div className="flex justify-between">
            <span>Phase-out Period:</span>
            <span className="text-zinc-900 dark:text-zinc-200">{exitDateDays} Days</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining Packaging Runway:</span>
            <span className="text-purple-700 dark:text-purple-400">{Math.round(exitDateDays * 0.08)} weeks of supply</span>
          </div>
          <div className="flex justify-between">
            <span>Supply Transition Risk:</span>
            <span className={isSafetyStockRaised ? 'text-emerald-500' : 'text-amber-500'}>
              {isSafetyStockRaised ? 'Minimal (Sibling safety raised)' : 'Medium (Raise sibling buffer)'}
            </span>
          </div>
        </div>
      </div>

      {/* VP Executive Sign-Off Section */}
      {role === 'VP Product Management' && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-3.5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[8.5px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">Executive Authorization</span>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
              hasVpSignedOff 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}>
              {hasVpSignedOff ? 'AUTHORIZED' : 'PENDING'}
            </span>
          </div>

          <p className="text-[8.5px] text-zinc-500 dark:text-zinc-500 leading-normal font-sans">
            Review the generated verification certificates in the ledger/vault. Once all 10 checklist steps are verified, authorize the sunset directive.
          </p>

          <button
            type="button"
            disabled={!isCaseReady || hasVpSignedOff}
            onClick={() => {
              if (logAction) {
                logAction(
                  'product',
                  'Executive Sign-Off',
                  'FINAL AUTHORIZATION APPROVED',
                  'VP Product Management signed off on final rationalization and sunset schedule. DC depletion phase-out locks activated.'
                );
              }
            }}
            className={`w-full py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition shadow-sm border-none cursor-pointer flex items-center justify-center gap-1.5 ${
              hasVpSignedOff
                ? 'bg-emerald-600 text-white cursor-default'
                : isCaseReady
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-black/5 dark:bg-white/5 text-zinc-400 dark:text-zinc-700 cursor-not-allowed'
            }`}
          >
            {hasVpSignedOff ? (
              <span>👑 Authorized & Signed Off</span>
            ) : (
              <span>👑 Authorize Final Sunset</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
