/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Activity, Check, RefreshCw, Sparkles, CreditCard, Briefcase, Truck, X,
  TrendingUp, AlertTriangle, ShieldCheck, Info, DollarSign, Globe, Layers, ArrowRight,
  Eye, Printer, Download, FileText, Lock, CheckCircle2
} from 'lucide-react';
import { SKUS } from '../../../constants/data';
import { BusinessCaseAdvisor } from './BusinessCaseAdvisor';

interface ActionRoutingPanelProps {
  role: string;
  auditLog: any[];
  hasScored: boolean;
  pairRisk: number;
  riskVerdict: string;
  verdictColor: string;
  skuA: string;
  skuB: string;
  category: string;
  selectedRoutingTeam: number;
  setSelectedRoutingTeam: (idx: number) => void;

  // Control Center persistent state & actions
  completedSteps: Record<string, boolean>;
  setStepCompleted: (pairKey: string, team: string, stepIdx: number, completed: boolean) => void;
  resetPairWorkflow: (pairKey: string) => void;
  shortlistedSkus: string[];
  shortlistSku: (name: string) => void;
  unshortlistSku: (name: string) => void;
  frozenSkus: string[];
  freezeSkuReplenishment: (name: string) => void;
  unfreezeSkuReplenishment: (name: string) => void;
  logAction: (team: string, stepLabel: string, details: string, rationale: string) => void;
  logReversalAction: (team: string, stepLabel: string, details: string, rationale: string) => void;
  removeActionLog: (pairKey: string, stepLabel: string) => void;
  isDarkMode?: boolean;

  // Lifted States
  exitDateDays: number;
  setExitDateDays: (days: number) => void;
  pricingPriceShift: number;
  setPricingPriceShift: (shift: number) => void;
  supplySafetyStockShift: number;
  setSupplySafetyStockShift: (shift: number) => void;
  selectedDoc: string | null;
  setSelectedDoc: (doc: string | null) => void;
}

export const ActionRoutingPanel: React.FC<ActionRoutingPanelProps> = ({
  role,
  auditLog,
  hasScored,
  pairRisk,
  riskVerdict,
  verdictColor,
  skuA,
  skuB,
  category,
  selectedRoutingTeam,
  setSelectedRoutingTeam,

  completedSteps,
  setStepCompleted,
  resetPairWorkflow,
  shortlistedSkus,
  shortlistSku,
  unshortlistSku,
  frozenSkus,
  freezeSkuReplenishment,
  unfreezeSkuReplenishment,
  logAction,
  logReversalAction,
  removeActionLog,
  isDarkMode = false,

  exitDateDays,
  setExitDateDays,
  pricingPriceShift,
  setPricingPriceShift,
  supplySafetyStockShift,
  setSupplySafetyStockShift,
  selectedDoc,
  setSelectedDoc,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [executingStep, setExecutingStep] = useState<string | null>(null);

  // Calendar deconfliction state
  const [calendarDeconflicted, setCalendarDeconflicted] = useState(false);

  const canRoleExecuteTeam = (role: string, teamKey: string): boolean => {
    const key = teamKey.toLowerCase().replace(' ', '');
    if (role === 'Pricing and Margin Partner') return key === 'pricing';
    if (role === 'Product Manager') return key === 'product' || key === 'supplychain' || key === 'supply';
    return false;
  };


  // Find SKU details for calculations
  const pairKey = `${skuA}|${skuB}`;
  const sA = SKUS.find(s => s.name === skuA) || SKUS[0];
  const sB = SKUS.find(s => s.name === skuB) || SKUS[1];
  const revA = sA ? sA.rev : 10;
  const marginA = sA ? sA.margin : 35;
  const marginB = sB ? sB.margin : 40;

  // 1. Transference & Leakage
  const transferenceRate = Math.round(pairRisk * 100);
  const transferenceVolume = parseFloat((revA * (transferenceRate / 100)).toFixed(2));
  const leakageVolume = parseFloat((revA - transferenceVolume).toFixed(2));

  // 2. Margin differential uplift + complexity savings (5% of SKU A rev)
  const marginDiffUplift = transferenceVolume * ((marginB - marginA) / 100);
  const complexitySavings = revA * 0.05;
  const annualSavingsThousands = Math.round((marginDiffUplift + complexitySavings) * 1000);

  // 3. Dynamic Exit Costs (decrease as exitDateDays increases)
  const inventoryWriteoff = (revA * 100) * Math.max(0.02, 0.8 - (exitDateDays / 150));
  const packagingObsolescence = (revA * 20) * Math.max(0.05, 1.1 - (exitDateDays / 100));
  const markdownCost = (revA * 30) * Math.max(0.1, 1.2 - (exitDateDays / 120));
  
  const totalExitCost = Math.round(inventoryWriteoff + packagingObsolescence + markdownCost);

  // 4. Payback Period
  const monthlySavings = annualSavingsThousands / 12;
  const paybackMonths = parseFloat((totalExitCost / (monthlySavings || 1)).toFixed(1));

  // 5. Retailer Notice Checklist Status
  const productTeamKey = 'product';
  const supplyTeamKey = 'supplychain';
  const isCapacityAudited = !!(completedSteps && completedSteps[`${pairKey}|${productTeamKey}|1`]);
  const isSunsetDrafted = !!(completedSteps && completedSteps[`${pairKey}|${productTeamKey}|2`]);
  const isReplenishmentFrozen = !!(completedSteps && completedSteps[`${pairKey}|${supplyTeamKey}|0`]);
  const isSafetyStockRaised = !!(completedSteps && completedSteps[`${pairKey}|${supplyTeamKey}|1`]);
  
  const walmartStatus = isSunsetDrafted ? 'Delisted' : 'Notice Pending';
  const targetStatus = isReplenishmentFrozen ? 'Delisted' : 'Notice Pending';
  const tescoStatus = isSunsetDrafted && isReplenishmentFrozen ? 'Delisted' : 'In Run-down';
  const costcoStatus = isCapacityAudited ? 'In Negotiation' : 'Notice Pending';

  if (!hasScored) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-white dark:bg-acies-offwhite rounded-xl border border-black/10 dark:border-white/10">
        <Activity size={24} className="text-zinc-400 animate-pulse" />
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Score a pair first</p>
          <p className="text-[10px] text-zinc-300 dark:text-zinc-700 font-bold uppercase mt-0.5">Please evaluate products on the scatter map or scorer</p>
        </div>
      </div>
    );
  }

  const isHigh = pairRisk > 0.5;
  const isMod  = pairRisk > 0.25 && pairRisk <= 0.5;

  const urgency       = isHigh ? 'URGENT'  : isMod ? 'MONITOR' : 'ROUTINE';
  const urgencyColor  = isHigh ? '#ef4444' : isMod ? '#f59e0b' : '#10b981';
  const urgencyBg     = isHigh ? 'rgba(239,68,68,0.08)'  : isMod ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)';
  const urgencyBorder = isHigh ? 'rgba(239,68,68,0.2)'   : isMod ? 'rgba(245,158,11,0.2)'  : 'rgba(16,185,129,0.2)';
  const timeline      = isHigh ? 'Act within 2–4 weeks'  : isMod ? 'Review in 30–60 days'  : 'Next quarterly cycle';

  type TeamRouting = {
    name: string; shortName: string; isLead: boolean;
    dotColor: string; dotBg: string; dotBorder: string;
    contact: string; owner: string;
    steps: Array<{ label: string; detail: string }>;
  };

  const routing: TeamRouting[] = isHigh ? [
    {
      name: 'Pricing & Finance', shortName: 'Pricing', isLead: true,
      dotColor: '#ef4444', dotBg: 'rgba(239,68,68,0.08)', dotBorder: 'rgba(239,68,68,0.18)',
      contact: 'VP Revenue Management', owner: 'Pricing Mgr + FP&A Analyst',
      steps: [
        { label: 'Pull price ladder',     detail: `Extract current pricing structures for ${skuA} vs ${skuB} to evaluate profitability differentials.` },
        { label: 'Run cross-elasticity',  detail: `Model potential demand shift from ${skuA} to sibling ${skuB} if price gap is adjusted.` },
        { label: 'Separate promo slots',  detail: `Examine overlapping promotional calendar timelines to mitigate self-cannibalization.` },
        { label: 'Escalate to committee', detail: `Compile Rationalization Escalation Ticket & route to Portfolio Board.` },
      ]
    },
    {
      name: 'Product Management', shortName: 'Product', isLead: false,
      dotColor: '#f59e0b', dotBg: 'rgba(245,158,11,0.06)', dotBorder: 'rgba(245,158,11,0.15)',
      contact: 'Category Portfolio Manager', owner: 'SKU Rationalization WG',
      steps: [
        { label: 'Add to shortlist',    detail: `Flag ${skuA} for Category observation on the active Rationalization Shortlist.` },
        { label: 'Feasibility check',   detail: `Audit if sibling SKU ${skuB} has the manufacturing capacity to absorb ${skuA} volume.` },
        { label: 'Sunset plan draft',   detail: `Prepare SKU exit schedule, inventory liquidation, and retailer delisting timeline.` },
      ]
    },
    {
      name: 'Supply Chain Ops', shortName: 'Supply Chain', isLead: false,
      dotColor: '#3b82f6', dotBg: 'rgba(59,130,246,0.06)', dotBorder: 'rgba(59,130,246,0.15)',
      contact: 'Supply Chain Director', owner: 'DC Inventory Planner',
      steps: [
        { label: 'Freeze replenishment', detail: `Put an active replenishment freeze flag on SKU ${skuA} inside the WMS ledger.` },
        { label: 'Raise safety stock',   detail: `Adjust sibling SKU ${skuB} buffer parameters inside the MRP system to absorb incoming demand.` },
        { label: 'Warehouse release',    detail: `De-allocate warehouse bays currently assigned to SKU ${skuA} to unlock capital.` },
      ]
    }
  ] : isMod ? [
    {
      name: 'Product Management', shortName: 'Product', isLead: true,
      dotColor: '#f59e0b', dotBg: 'rgba(245,158,11,0.08)', dotBorder: 'rgba(245,158,11,0.18)',
      contact: 'Category Manager', owner: 'Junior PM + Commercial Analyst',
      steps: [
        { label: 'Set up alert',         detail: `Configure weekly sales-overlap triggers for ${skuA} vs ${skuB} in BI dashboards.` },
        { label: 'Promo calendar audit', detail: `Review next 12 weeks of promo calendar slots to verify zero promotional overlaps.` },
        { label: '30-day report',        detail: `Prepare monthly Pair Observation brief tracking overlap trends.` },
        { label: 'Q4 planning flag',     detail: `Add both variants to the Q4 Watch List workbook.` },
      ]
    },
    {
      name: 'Pricing & Finance', shortName: 'Pricing', isLead: false,
      dotColor: '#8b5cf6', dotBg: 'rgba(139,92,246,0.06)', dotBorder: 'rgba(139,92,246,0.14)',
      contact: 'Commercial Finance BP', owner: 'Pricing Analyst',
      steps: [
        { label: 'Elasticity validation', detail: `Re-run baseline price elasticity audits for ${skuA}.` },
        { label: 'P&L flag',              detail: `Add pair monitoring flag under Brand P&L reviews.` },
      ]
    }
  ] : [
    {
      name: 'Supply Chain Ops', shortName: 'Supply', isLead: true,
      dotColor: '#10b981', dotBg: 'rgba(16,185,129,0.08)', dotBorder: 'rgba(16,185,129,0.18)',
      contact: 'Category Inventory Manager', owner: 'Inventory Planning Team',
      steps: [
        { label: 'Log in tracker',  detail: `Record ${skuA} / ${skuB} risk score ${(pairRisk * 100).toFixed(0)}% in annual tracker.` },
        { label: 'Standard review', detail: `No fast-track escalation. Check on next quarterly health review.` },
      ]
    },
    {
      name: 'Product Management', shortName: 'Product', isLead: false,
      dotColor: '#10b981', dotBg: 'rgba(16,185,129,0.05)', dotBorder: 'rgba(16,185,129,0.12)',
      contact: 'Category Portfolio Manager', owner: 'Portfolio Analyst',
      steps: [
        { label: 'Confirm within bounds', detail: `Verify overlap remains below 30% substitution risk.` },
        { label: 'No escalation',         detail: `Approve no committee review required.` },
      ]
    }
  ];

  const teamIdx = Math.max(0, Math.min(selectedRoutingTeam, routing.length - 1));
  const activeTeam = routing[teamIdx] || routing[0];
  if (!activeTeam) return null;
  const activeTeamKey = activeTeam.shortName.toLowerCase().replace(' ', '');

  // Calculate overall progress stats
  let totalStepsCount = 0;
  let totalCompletedCount = 0;
  routing.forEach(team => {
    const tKey = team.shortName.toLowerCase().replace(' ', '');
    team.steps.forEach((_, idx) => {
      totalStepsCount++;
      if (completedSteps && completedSteps[`${pairKey}|${tKey}|${idx}`]) {
        totalCompletedCount++;
      }
    });
  });

  const blendedPct = Math.round((totalCompletedCount / (totalStepsCount || 1)) * 100);

  // Return Lucide icon for active team
  const getTeamIcon = (shortName: string) => {
    if (shortName.includes('Pricing')) return <CreditCard size={14} className="stroke-[2.5]" />;
    if (shortName.includes('Product')) return <Briefcase size={14} className="stroke-[2.5]" />;
    return <Truck size={14} className="stroke-[2.5]" />;
  };

  // Compile detailed parameters and rationale for ledger records
  const getStepLogData = (si: number) => {
    if (isHigh) {
      if (activeTeamKey === 'pricing') {
        if (si === 0) return { details: 'SKU A: $90, SKU B: $80, Price Gap: 12.5%', rationale: 'Pulled pricing structures to verify distributor and retail pricing ladders between sibling SKUs.' };
        if (si === 1) return { details: `Price Gap Shift: ${pricingPriceShift >= 0 ? '+' : ''}${pricingPriceShift}%, Vol. Shift: +${(15 + pricingPriceShift * 0.8).toFixed(1)}%`, rationale: 'Simulated pricing gap tweaks to model cross-elasticity and कैटेगरी demand shifts.' };
        if (si === 2) return { details: 'Promo calendar de-conflicted', rationale: 'Shifted promotional calendar offsets to avoid overlapping discount periods and blended margins erosion.' };
        return { details: 'Brief Sheet Submitted', rationale: `Escalated rationalization case (Score: ${(pairRisk * 100).toFixed(0)}%, At Risk: $${Math.round(pairRisk * 42)} M) to rationalization committee.` };
      }
      if (activeTeamKey === 'product') {
        if (si === 0) return { details: 'Added to rationalization watchlist', rationale: `Shortlisted SKU ${skuA} for sunset portfolio analysis due to high substitution rates with SKU ${skuB}.` };
        if (si === 1) return { details: 'Sibling capacity audit complete: 89%', rationale: `Verified sibling SKU ${skuB} manufacturing capacity has sufficient head-room to absorb absorbed volumes.` };
        return { details: `Exit timeline: ${exitDateDays} Days, Discount: 25%`, rationale: 'Approved structured exit timeline detailing de-listing dates and clearance discounts.' };
      }
      // supplychain
      if (si === 0) return { details: 'Replenishment frozen in WMS ledger', rationale: 'Halted replenishment releases in inventory systems to run down channel stock.' };
      if (si === 1) return { details: `Safety stock buffer adjusted: +${supplySafetyStockShift}%`, rationale: `Raised sibling SKU ${skuB} safety buffer parameters in MRP systems to insulate against supply gaps.` };
      return { details: `Freed warehouse bays: 4. Capital: $${Math.round(pairRisk * 40)}L`, rationale: 'De-allocated storage bay assignments in distribution center, releasing working capital.' };
    } else if (isMod) {
      if (activeTeamKey === 'product') {
        if (si === 0) return { details: 'BI weekly alert enabled', rationale: 'Configured weekly sales-overlap triggers in category intelligence boards.' };
        if (si === 1) return { details: '12-week promo audit completed', rationale: 'Reviewed promotional plans to ensure calendar separations.' };
        if (si === 2) return { details: 'Pair observation report logged', rationale: 'Prepared monthly pair observation brief tracking volume trends.' };
        return { details: 'Watchlist flag added to workbook', rationale: 'Tagged variant pair in category watch sheet for Q4 planning review.' };
      } else {
        if (si === 0) return { details: 'Cross-elasticity verified', rationale: 'Re-validated price elasticity values against historical parameters.' };
        return { details: 'P&L flag activated', rationale: 'Flagged variants under monthly brand gross margin reviews.' };
      }
    } else {
      // low risk
      if (activeTeamKey === 'supply') {
        if (si === 0) return { details: 'Logged in Rationalization Tracker', rationale: 'Recorded low risk score in annual portfolio database.' };
        return { details: 'Quarterly review sign-off complete', rationale: 'Approved sign-off on the quarterly inventory health dashboard.' };
      } else {
        if (si === 0) return { details: 'Overlap validated within limits', rationale: 'Confirmed cross-brand substitution is within category tolerances.' };
        return { details: 'No committee action required', rationale: 'Concluded variant pair does not require board review.' };
      }
    }
  };

  // Trigger simulated execution
  const executeStep = (si: number, label: string, customAction?: () => void) => {
    const stepKey = `${pairKey}|${activeTeamKey}|${si}`;
    setExecutingStep(stepKey);
    setTimeout(() => {
      if (customAction) {
        customAction();
      }
      const logData = getStepLogData(si);
      if (logData) {
        logAction(activeTeamKey, label, logData.details, logData.rationale);
      }
      setStepCompleted(pairKey, activeTeamKey, si, true);
      setExecutingStep(null);
      // Auto-expand next step
      if (si < activeTeam.steps.length - 1) {
        setExpandedStep(si + 1);
      }
    }, 850);
  };

  const getDocTypeForStep = (team: string, stepIdx: number): string | null => {
    if (team === 'pricing') {
      if (stepIdx === 0) return 'price_ladder';
      if (stepIdx === 1) return 'pricing_elasticity';
      if (stepIdx === 2) return 'promo_deconfliction';
      if (stepIdx === 3) return 'committee_escalation';
    }
    if (team === 'product') {
      if (stepIdx === 0) return 'watchlist_registration';
      if (stepIdx === 1) return 'capacity';
      if (stepIdx === 2) return 'sunset';
    }
    if (team === 'supplychain') {
      if (stepIdx === 0) return 'replenishment_freeze';
      if (stepIdx === 1) return 'mrp_safety_revision';
      if (stepIdx === 2) return 'warehouse_release';
    }
    return null;
  };

  const documentTemplates: Record<string, { title: string; subtitle: string; code: string; content: React.ReactNode }> = {
    price_ladder: {
      title: "BRAND PRICE LADDER COMPARISON REPORT",
      subtitle: "FORM FIN-LADDER-102",
      code: "SHA256: e82f1b0a92d3f9e9a44b8292019c83664ef819bc2e1a90c1f2b2c3a5b6c7d8e90",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] ANALYSIS STATUS:</strong> <span className="text-emerald-500 font-extrabold">COMPLETED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="grid grid-cols-3 gap-2 text-[9px] font-bold text-center border-b pb-1.5 border-black/5 dark:border-white/5 text-zinc-500">
            <div>Metric</div>
            <div className="text-purple-700 dark:text-purple-400">{skuA ? skuA.split(' ')[0] : ''}</div>
            <div className="text-emerald-500">{skuB ? skuB.split(' ')[0] : ''}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[9px] font-semibold text-center divide-y divide-black/[0.02] dark:divide-white/[0.02] text-zinc-600 dark:text-zinc-400">
            <div className="text-left font-bold text-[8px] uppercase">Base Retail Price</div>
            <div>$90</div>
            <div>$80</div>
            <div className="text-left font-bold text-[8px] uppercase pt-1.5">Distributor Price</div>
            <div className="pt-1.5">$65</div>
            <div className="pt-1.5">$55</div>
            <div className="text-left font-bold text-[8px] uppercase pt-1.5">Gross Margin</div>
            <div className="pt-1.5 text-red-500 font-extrabold font-bold">41.0%</div>
            <div className="pt-1.5 text-emerald-500 font-extrabold font-bold">34.0%</div>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Price Positioning Audit</span>
            <p>· Sibling {skuB ? skuB.split(' ')[0] : ''} sits $10 lower in the retail value tier.</p>
            <p>· Net margins are aligned; margin shift will be mitigated by volume transference gains.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">David Miller</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Category Financial Controller</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Audit Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    promo_deconfliction: {
      title: "PROMOTIONAL CALENDAR DE-CONFLICTION DIRECTIVE",
      subtitle: "FORM MKT-PROMO-903",
      code: "SHA256: 12f9b2d9a9bc8f42d201e912f2b2d2a2c2c2f1f5e2a2c3a5b6c7d8e90a98c819",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] MITIGATION STATUS:</strong> <span className="text-emerald-500 font-extrabold">DE-CONFLICTED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Promo Schedule Separations</span>
            <p>Overlapping promotion slots detected on: <strong>Week 4 and Week 8</strong></p>
            <p>Erosion Risk: Double discounting on overlapping category items causes blended margin dilution.</p>
            <p>Mitigation: Halted promotional discount overlays. Separated campaign schedules by 14 days minimum.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Promotional Calendar Slots</span>
            <div className="grid grid-cols-6 gap-1.5 text-[8px] text-center font-bold">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                <div key={w} className={`p-1 rounded border bg-black/5 dark:bg-white/5 border-transparent text-zinc-500`}>
                  Wk {w} {w === 4 || w === 8 ? '✅' : ''}
                </div>
              ))}
            </div>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Clara Higgins</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Brand Promotion Director</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    committee_escalation: {
      title: "SKU RATIONALIZATION COMMITTEE ESCALATION BRIEF",
      subtitle: "FORM COM-ESC-122",
      code: "SHA256: 5f9d22c8b9354117fd89c1b3f9b2d90a98c819192938e3e4a9bc8f42d201e912",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] ESCALATION STATUS:</strong> <span className="text-purple-600 dark:text-purple-400 font-extrabold">SUBMITTED TO BOARD</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Escalation Proposal Summary</span>
            <p>Sunset Candidate SKU: <strong>{skuA}</strong></p>
            <p>Target Category: {category}</p>
            <p>Risk Score: {(pairRisk * 100).toFixed(0)}% Substitution Risk</p>
            <p>Estimated Revenue Exposure: ${Math.round(pairRisk * 42)} M</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Escalation Justification</span>
            <p>· Sibling variant {skuB} has capacity margins and supply network ready to absorb sunset demand.</p>
            <p>· Eliminating SKU A will simplify manufacturing lines, reducing logistics and changeover overhead.</p>
            <p>· Net annual Category saving is estimated to reach ${annualSavingsThousands}k.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Vikash Sharma</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Portfolio Review Secretariat</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    watchlist_registration: {
      title: "PORTFOLIO SHORTLIST WATCHLIST REGISTRATION CERTIFICATE",
      subtitle: "FORM PM-WATCH-884",
      code: "SHA256: a82f1b0a92d3f9e9a44b8292019c83664ef819bc2e1a90c1f2b2c3a5b6c7d8e90",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] WATCHLIST STATUS:</strong> <span className="text-emerald-500 font-extrabold">SHORTLISTED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Shortlist Registration Details</span>
            <p>SKU Name: <strong>{skuA}</strong></p>
            <p>Shortlist Date: {new Date().toLocaleDateString()}</p>
            <p>Audit Class: Sunset Candidate</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Strategic Justification</span>
            <p>· High substitution overlap with sibling variant {skuB} ({transferenceRate}%).</p>
            <p>· Low-value product margin performance profile.</p>
            <p>· Registered under the active rationalization monitor loop.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Linda Carter</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Category Portfolio Director</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    mrp_safety_revision: {
      title: "MRP SAFETY STOCK BUFFER REVISION ORDER",
      subtitle: "FORM SC-MRP-049",
      code: "SHA256: c3a5b6c7d8e90a98c819f2b2d2a2c2c2f1f5e2a2c3a5b6c7d8e90a98c81912fa",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] MRP STATUS:</strong> <span className="text-emerald-500 font-extrabold">UPDATED / RE-BUFFERED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">MRP Buffer Modification</span>
            <p>Target Sibling SKU: <strong>{skuB}</strong></p>
            <p>Adjust Safety Buffer Stock level: <strong>+{supplySafetyStockShift}%</strong></p>
            <p>MRP Re-order Point Parameter: Raised to handle target demand redirection.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Operations Safety Assessment</span>
            <p>· Increased safety buffers provide a transition safety net for accounts during the run-down of SKU A.</p>
            <p>· Ensures zero shelf out-of-stock events on variant {skuB ? skuB.split(' ')[0] : ''}.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">David Reynolds</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Director of Material Requirements Planning</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Issue Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    capacity: {
      title: "CAPACITY CLEARANCE & LINE FEASIBILITY CERTIFICATE",
      subtitle: "FORM MFG-CAP-AUD-2026",
      code: "SHA256: 8f3b20c92176d54efd0a1b92a3f9e9a44b8292019c83664ef819bc2e1a90c1f2",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] EVALUATION STATUS:</strong> <span className="text-emerald-500 font-extrabold">FEASIBLE (APPROVED)</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="grid grid-cols-2 gap-4 font-semibold">
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Sunset SKU (A)</span>
              <span className="font-bold">{skuA}</span>
            </div>
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Sibling SKU (B)</span>
              <span className="font-bold">{skuB}</span>
            </div>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Manufacturing Line Audit Details</span>
            <p>Location: Pune Manufacturing Complex, Plant Bottling Line 4</p>
            <p>Line Velocity: 120 Units/Minute (Rotary filler capacity)</p>
            <p>Baseline Line Utilization (pre-absorption): 82.1% OEE</p>
            <p>Incremental Load (SKU A absorbed volume): +7.2% load projection</p>
            <p>Projected Post-Absorption Utilization: 89.3% OEE (Under 96% critical limit)</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Operational Impact & Mitigation</span>
            <p>· Sibling SKU {skuB ? skuB.split(' ')[0] : ''} shares tooling and nozzle calibrations with SKU A.</p>
            <p>· Line changeovers will be reduced from 3 to 1 per week, recovering 8 hours of active runtime.</p>
            <p>· Operations recommends extending shift hours by 4 hours/week during transition peaks.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Rajesh Nair</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Director of Manufacturing Operations</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Audit Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    sunset: {
      title: "SKU SUNSET DIRECTIVE & RETRACTION TIMELINE",
      subtitle: "FORM MKT-SUNSET-2026-04",
      code: "SHA256: 4f9d22c8b9354117fd89c1b3f9b2d90a98c819192938e3e4a9bc8f42d201e912",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] DIRECTION STATUS:</strong> <span className="text-purple-600 dark:text-purple-400 font-extrabold">PHASE-OUT AUTHORIZED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="grid grid-cols-2 gap-4 font-semibold">
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Product to Sunset</span>
              <span className="font-bold text-red-500">{skuA}</span>
            </div>
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Primary Substituted Variant</span>
              <span className="font-bold text-emerald-500">{skuB}</span>
            </div>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Phase-out Parameters</span>
            <p>Exit Duration Target: {exitDateDays} Days</p>
            <p>Distributor Markdown Allowance: 25% discount threshold</p>
            <p>Shelf Retraction Schedule: Immediate notice to accounts</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Account Notice Dispatches</span>
            <p>· Walmart US: Notice dispatched (Delisting on sunset date)</p>
            <p>· Target Corp: Notice dispatched (Inventory run-down active)</p>
            <p>· Tesco PLC: Delisting pending (Notice queue confirmed)</p>
            <p>· Costco Wholesale: Active review (Margin offset negotiations ongoing)</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Sarah Jenkins</span>
              <span className="block text-[8px] text-zinc-400 font-sans">VP Category Management & Brand Planning</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Issue Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    replenishment_freeze: {
      title: "WMS REPLENISHMENT FREEZE & PRODUCTION BLOCK DIRECTIVE",
      subtitle: "FORM WMS-FRZ-992",
      code: "SHA256: d182c3f8e91916362547b9a8f4c2e1f2b2d2a2c2c2f1f5e2a2c3a5b6c7d8e90a",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] INVENTORY STATUS:</strong> <span className="text-red-500 font-extrabold">LOCKED / STOP REPLENISHMENT</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">ERP Block Directive</span>
            <p>System Affected: SAP S/4HANA & WMS Ledger</p>
            <p>Target SKU Identifier: {skuA}</p>
            <p>Status: Block Level 1 (Stop all inbound SKU releases and manufacturing order routing)</p>
            <p>Warehouse Action: Allow run-down of existing finished DC inventory. Do not replenish.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Current Stock Run-down Estimate</span>
            <p>Warehouse DC-2 (Pune): 1,240 cases remaining</p>
            <p>Warehouse DC-4 (Mumbai): 850 cases remaining</p>
            <p>Estimated Supply Runway: {exitDateDays} days based on current category run rates</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Marcus Brody</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Supply Chain & Logistics Operations Manager</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Block Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    pricing_elasticity: {
      title: "PORTFOLIO CROSS-ELASTICITY & DE-RUIZING SIMULATION REPORT",
      subtitle: "FORM FIN-ELAST-881",
      code: "SHA256: 7f3b8219c92176d54efd0a1b92a3f9e9a44b8292019c83664ef819bc2e1a90c1f2",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] ANALYSIS SUMMARY:</strong> <span className="text-emerald-500 font-extrabold">UPLIFT ESTIMATED (APPROVED)</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="grid grid-cols-2 gap-4 font-semibold">
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Pricing Price Gap</span>
              <span className="font-bold">{pricingPriceShift >= 0 ? '+' : ''}{pricingPriceShift}%</span>
            </div>
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Estimated Sibling Transference</span>
              <span className="font-bold text-emerald-500">{transferenceRate}%</span>
            </div>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Quantitative Elasticity Parameters</span>
            <p>Sunset SKU Base Price: $90</p>
            <p>Sibling SKU Base Price: $80</p>
            <p>Estimated Sibling Volume Shift: +{(15 + pricingPriceShift * 0.8).toFixed(1)}%</p>
            <p>Uncompensated Category Leakage: {(100 - transferenceRate).toFixed(1)}%</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Financial Net Benefit</span>
            <p>Net Annual Margin Uplift: ${marginDiffUplift.toFixed(2)} M</p>
            <p>Complexity Savings (Logistics release): ${complexitySavings.toFixed(2)} M</p>
            <p>Total Estimated Annual Category Gain: ${(marginDiffUplift + complexitySavings).toFixed(2)} M</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Ananya Roy</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Lead Pricing & FP&A Analyst</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Simulation Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    warehouse_release: {
      title: "FORM SC-114: DC BAY DE-ALLOCATION & CAPITAL RELEASE",
      subtitle: "FORM LOG-BAY-RELEASE",
      code: "SHA256: 3c9b20d98127efd0a1b92a3f9e9a44b8292019c83664ef819bc2e1a90c1f28b2c",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] BAY RELEASE STATUS:</strong> <span className="text-emerald-500 font-extrabold">RELEASED / DE-ALLOCATED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Distribution Center De-allocation</span>
            <p>Target DC: Pune Regional Distribution Center</p>
            <p>Released Pallet Locations: 120 locations (Bays DC-2 & DC-4)</p>
            <p>Inventory Level: 0 cases (Run-down completed)</p>
            <p>Recovered Storage Capital: ${(pairRisk * 4.0).toFixed(1)}M / year</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Sourcing Redirection</span>
            <p>· Freed warehouse storage positions re-allocated to Hero SKU {skuB ? skuB.split(' ')[0] : ''} stock safety buffers.</p>
            <p>· Material handling labor hours for SKU A reassigned to active SKU B line consolidation.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Vikram Rathore</span>
              <span className="block text-[8px] text-zinc-400 font-sans">DC Warehouse Director</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Form Signature Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    }
  };

  const undoStep = (si: number, label: string, customUndo?: () => void) => {
    if (customUndo) {
      customUndo();
    }
    const logData = getStepLogData(si);
    if (logData) {
      const rollbackDetails = `REVERSED | ${logData.details}`;
      const rollbackRationale = `Rollback authorized. Action "${label}" has been cancelled/reverted. Original context: ${logData.rationale}`;
      logReversalAction(activeTeamKey, label, rollbackDetails, rollbackRationale);
    }
    setStepCompleted(pairKey, activeTeamKey, si, false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Overall Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Active Pair Audit Workflow</span>
          <h2 className="text-lg font-display font-extrabold text-zinc-900 dark:text-white mt-1">
            {skuA} <span className="text-zinc-400 font-normal">↔</span> {skuB}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-black uppercase text-acies-gray dark:text-zinc-200">
              Blended Status: {blendedPct}% Completed
            </span>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-0.5">
              {totalCompletedCount} of {totalStepsCount} tasks signed-off
            </span>
          </div>
          {totalCompletedCount > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Reset workflow progress? This will revert shortlist/frozen flags and clear audit logs.")) {
                  resetPairWorkflow(pairKey);
                  unshortlistSku(skuA);
                  unfreezeSkuReplenishment(skuA);
                }
              }}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg transition text-zinc-500 hover:text-zinc-800 dark:hover:text-white cursor-pointer bg-transparent"
              title="Reset Pair Audit"
            >
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar meter */}
      <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-purple-600 dark:bg-purple-400 h-full transition-all duration-300"
          style={{ width: `${blendedPct}%` }}
        />
      </div>

      {/* Two-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Team selection & Workflow Steps */}
        <div className="lg:col-span-7 space-y-6">

          {/* Team selection Grid */}
          <div className="grid gap-px rounded-xl overflow-hidden bg-black/10 dark:bg-white/10" style={{ gridTemplateColumns: `repeat(${routing.length}, 1fr)` }}>
        {routing.map((team, ti) => {
          const isActive = ti === teamIdx;
          const tKey = team.shortName.toLowerCase().replace(' ', '');
          const teamSteps = team.steps;
          const completedCount = teamSteps.filter((_, idx) => completedSteps && completedSteps[`${pairKey}|${tKey}|${idx}`]).length;
          const isDone = completedCount === teamSteps.length;

          return (
            <div
              key={team.name}
              onClick={() => {
                setSelectedRoutingTeam(ti);
                setExpandedStep(0);
              }}
              className={`flex flex-col gap-1.5 p-3 cursor-pointer transition-all duration-150 ${
                isActive ? '' : 'bg-white dark:bg-[#121214]'
              }`}
              style={{
                background: isActive ? team.dotBg : undefined,
                borderBottom: isActive ? `3px solid ${team.dotColor}` : '3px solid transparent',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">{getTeamIcon(team.shortName)}</span>
                <span className="text-[6.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: team.dotColor, background: team.dotBg, border: `1px solid ${team.dotBorder}` }}>
                  {team.isLead ? 'LEAD' : 'SUPP'}
                </span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-wider text-acies-gray dark:text-zinc-200">
                {team.shortName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[8.5px] font-bold text-zinc-500">
                <span>{completedCount}/{teamSteps.length} Signed-off</span>
                {isDone && <Check size={10} className="text-emerald-500 stroke-[3.5]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Steps List */}
      <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
        <div className="flex justify-between items-center px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/10 dark:border-white/10">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            {getTeamIcon(activeTeam.shortName)}
            <span>{activeTeam.name} — Action List</span>
          </span>
          <span className="text-[8px] font-bold text-zinc-400 uppercase">
            Contact: {activeTeam.contact} · Owner: {activeTeam.owner}
          </span>
        </div>

        <div className="bg-white dark:bg-acies-offwhite divide-y divide-black/5 dark:divide-white/5">
          {activeTeam.steps.map((step, si) => {
            const stepKey = `${pairKey}|${activeTeamKey}|${si}`;
            const isCompleted = !!(completedSteps && completedSteps[stepKey]);
            const isExpanded = expandedStep === si;
            const isExecuting = executingStep === stepKey;
            const canExecute = canRoleExecuteTeam(role, activeTeamKey);

            return (
              <div key={si} className={`transition-colors duration-150 ${isExpanded ? 'bg-black/[0.01] dark:bg-white/[0.01]' : ''}`}>
                <div 
                  onClick={() => setExpandedStep(isExpanded ? null : si)}
                  className="flex items-start justify-between gap-4 px-4 py-3.5 cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.01] select-none"
                >
                  <div className="flex gap-3 min-w-0">
                    <div 
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-zinc-600'
                      }`}
                    >
                      {isCompleted ? <Check size={11} className="stroke-[3]" /> : si + 1}
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${isCompleted ? 'line-through text-zinc-400 dark:text-zinc-700' : 'text-acies-gray dark:text-zinc-200'}`}>
                        {step.label}
                      </p>
                      <p className="text-[8.5px] font-medium text-zinc-500 dark:text-zinc-500 leading-relaxed mt-0.5">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                  <span className="text-zinc-400 text-[8px] font-bold mt-0.5 whitespace-nowrap">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 pl-12 bg-black/[0.02] dark:bg-white/[0.02] border-t border-dashed border-black/5 dark:border-white/5 space-y-3">
                    
                    {/* Render Interactive Actions */}
                    {activeTeamKey === 'pricing' && isHigh && (
                      <>
                        {si === 0 && (
                          <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-white dark:bg-acies-gray space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Pricing Ladder Details</span>
                            <div className="grid grid-cols-3 gap-2 text-[8px] font-bold text-center border-b pb-1.5 border-black/5 dark:border-white/5 text-zinc-500">
                              <div>Metric</div>
                              <div className="text-purple-700 dark:text-purple-400">{skuA ? skuA.split(' ')[0] : ''}</div>
                              <div className="text-emerald-500">{skuB ? skuB.split(' ')[0] : ''}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[9px] font-semibold text-center divide-y divide-black/[0.02] dark:divide-white/[0.02] text-zinc-500 dark:text-zinc-400">
                              <div className="text-left font-bold text-[8px] uppercase">Base Retail Price</div>
                              <div>$90</div>
                              <div>$80</div>
                              <div className="text-left font-bold text-[8px] uppercase pt-1.5">Distributor price</div>
                              <div className="pt-1.5">$65</div>
                              <div className="pt-1.5">$55</div>
                              <div className="text-left font-bold text-[8px] uppercase pt-1.5">Gross Margin</div>
                              <div className="pt-1.5 text-red-500 font-extrabold">41.0%</div>
                              <div className="pt-1.5 text-emerald-500 font-extrabold">34.0%</div>
                            </div>
                          </div>
                        )}

                        {si === 1 && (
                          <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-white dark:bg-acies-gray space-y-3">
                            <div className="flex justify-between items-center text-[8px] font-black uppercase text-zinc-500 dark:text-zinc-500">
                              <span>Cross-Price Elasticity Sandbox</span>
                              <span className="text-purple-500">Price Gap Shift: {pricingPriceShift > 0 ? `+${pricingPriceShift}%` : `${pricingPriceShift}%`}</span>
                            </div>
                            <div className="space-y-1.5">
                              <input 
                                type="range" 
                                min="-10" 
                                max="15" 
                                value={pricingPriceShift} 
                                onChange={(e) => setPricingPriceShift(Number(e.target.value))}
                                className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 p-2 rounded text-[8px] font-bold space-y-1 text-zinc-500">
                              <div className="flex justify-between">
                                <span>Projected shift to sibling {skuB ? skuB.split(' ')[0] : ''}:</span>
                                <span className="text-emerald-500">+{(15 + pricingPriceShift * 0.8).toFixed(1)}% volume</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Category Loss (Uncompensated Leak):</span>
                                <span className="text-red-500">-{(3 - pricingPriceShift * 0.1).toFixed(1)}% volume</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {si === 2 && (
                          <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-white dark:bg-acies-gray space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-500 block">Weekly Promotion Overlap Review</span>
                            <div className="grid grid-cols-6 gap-1.5 text-[8px] text-center font-bold">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                                <div key={w} className={`p-1 rounded border ${
                                  !calendarDeconflicted && (w === 4 || w === 8) 
                                    ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                                    : 'bg-black/5 dark:bg-white/5 border-transparent text-zinc-500'
                                }`}>
                                  Wk {w}
                                  {!calendarDeconflicted && (w === 4 || w === 8) ? ' ⚠️' : ''}
                                </div>
                              ))}
                            </div>
                            <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-semibold leading-normal">
                              {calendarDeconflicted 
                                ? '✅ Promotion schedules separated. Overlaps de-conflicted.'
                                : '⚠️ Promotional discount overlays on week 4 and 8 will diluting blended margins.'}
                            </div>
                            {!calendarDeconflicted && (
                              <button 
                                onClick={() => setCalendarDeconflicted(true)}
                                className="w-full py-1.5 text-[9px] font-black bg-purple-600 hover:bg-purple-700 text-white rounded border-none cursor-pointer transition uppercase tracking-wider"
                              >
                                De-conflict Promo Calendars
                              </button>
                            )}
                          </div>
                        )}

                        {si === 3 && (
                          <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-white dark:bg-acies-gray space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-500 block">Rationalization Brief Parameters</span>
                            <div className="text-[8.5px] font-bold space-y-1 bg-black/5 dark:bg-white/5 p-2 rounded text-zinc-500">
                              <div className="flex justify-between"><span>Risk score:</span><span>{(pairRisk*100).toFixed(0)}%</span></div>
                              <div className="flex justify-between"><span>Revenue at risk:</span><span>${Math.round(pairRisk * 42)} M</span></div>
                              <div className="flex justify-between"><span>Sibling variant:</span><span>{skuB}</span></div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {activeTeamKey === 'product' && isHigh && (
                      <>
                        {si === 0 && (
                          <div className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500">
                            {(shortlistedSkus || []).includes(skuA) 
                              ? `✅ ${skuA} is registered in active rationalization watchlist.` 
                              : `Add ${skuA} to watchlist to track in portfolio directory.`}
                          </div>
                        )}

                        {si === 1 && (
                          <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-white dark:bg-acies-gray space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-500 block">Manufacturing capacity audit</span>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-[8px] font-bold text-zinc-500">
                                  <span>{skuB} current utilization:</span>
                                  <span>82%</span>
                                </div>
                                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded">
                                  <div className="bg-blue-500 h-full rounded" style={{ width: '82%' }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-[8px] font-bold text-zinc-500">
                                  <span>Projected utilization with absorbed volume:</span>
                                  <span className="text-emerald-500 font-extrabold">89%</span>
                                </div>
                                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded">
                                  <div className="bg-emerald-500 h-full rounded" style={{ width: '89%' }} />
                                </div>
                              </div>
                            </div>
                            <div className="text-[8px] text-emerald-500 font-black uppercase">
                              ✅ FEASIBLE (Under 96% ceiling)
                            </div>
                          </div>
                        )}

                        {si === 2 && (
                          <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-white dark:bg-acies-gray space-y-3">
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-500 block">Exit Strategy Configuration</span>
                            <div className="space-y-2">
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[8.5px] font-bold text-zinc-400">
                                  <span>Exit Timeline:</span>
                                  <span>{exitDateDays} Days</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="30" 
                                  max="120" 
                                  step="15"
                                  value={exitDateDays} 
                                  onChange={(e) => setExitDateDays(Number(e.target.value))}
                                  className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                              </div>
                              <div className="text-[8px] bg-black/5 dark:bg-white/5 p-2 rounded font-bold text-zinc-400 leading-normal">
                                De-listing checklist generated. Liquidation discount set to 25%.
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {activeTeamKey === 'supplychain' && isHigh && (
                      <>
                        {si === 0 && (
                          <div className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500">
                            {(frozenSkus || []).includes(skuA) 
                              ? `✅ ${skuA} replenishment frozen in WMS database.` 
                              : `Halt supply replenishments of ${skuA} to start sunset.`}
                          </div>
                        )}

                        {si === 1 && (
                          <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-white dark:bg-acies-gray space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-500 block">MRP safety buffer</span>
                            <div className="space-y-2">
                              <div className="flex justify-between text-[8.5px] font-bold text-zinc-400">
                                <span>Adjust Sibling Safety Stock:</span>
                                <span className="text-purple-500 font-black">+{supplySafetyStockShift}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="5" 
                                max="30" 
                                step="5"
                                value={supplySafetyStockShift} 
                                onChange={(e) => setSupplySafetyStockShift(Number(e.target.value))}
                                className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                            </div>
                          </div>
                        )}

                        {si === 2 && (
                          <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-white dark:bg-acies-gray space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-500 block">Form SC-114 Bay Release</span>
                            <div className="text-[8.5px] font-bold text-zinc-500 space-y-1 bg-black/5 dark:bg-white/5 p-2 rounded">
                              <div className="flex justify-between"><span>Assigned Bays:</span><span>4 Bays (DC-2, DC-4)</span></div>
                              <div className="flex justify-between"><span>Freed Working Capital:</span><span className="text-emerald-500 font-extrabold">${Math.round(pairRisk * 40)}L</span></div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Execution Buttons */}
                    <div className="flex gap-2">
                      {isCompleted ? (
                        <div className="flex gap-2">
                          {!canExecute ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                              <CheckCircle2 size={10} />
                              <span>Verified & Signed Off</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const isShortlistStep = activeTeamKey === 'product' && si === 0 && isHigh;
                                const isFreezeStep = activeTeamKey === 'supplychain' && si === 0 && isHigh;
                                
                                const undoAction = () => {
                                  if (isShortlistStep) unshortlistSku(skuA);
                                  if (isFreezeStep) unfreezeSkuReplenishment(skuA);
                                };

                                undoStep(si, step.label, undoAction);
                              }}
                              className="px-3 py-1 text-[9px] font-black border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-lg cursor-pointer transition border-none"
                            >
                              Undo execution
                            </button>
                          )}
                          {(() => {
                            const docType = getDocTypeForStep(activeTeamKey, si);
                            if (!docType) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => setSelectedDoc(docType)}
                                className="flex items-center gap-1.5 px-3 py-1 text-[9px] font-black border border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 rounded-lg cursor-pointer transition border-none"
                              >
                                <Eye size={10} />
                                <span>View Document</span>
                              </button>
                            );
                          })()}
                        </div>
                      ) : !canExecute ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                          <Lock size={10} />
                          <span>
                            {activeTeamKey === 'pricing' 
                              ? 'Awaiting Pricing Partner' 
                              : 'Awaiting Product Manager'}
                          </span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isExecuting}
                          onClick={() => {
                            const isShortlistStep = activeTeamKey === 'product' && si === 0 && isHigh;
                            const isFreezeStep = activeTeamKey === 'supplychain' && si === 0 && isHigh;

                            const customAction = () => {
                              if (isShortlistStep) shortlistSku(skuA);
                              if (isFreezeStep) freezeSkuReplenishment(skuA);
                            };

                            executeStep(si, step.label, customAction);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black text-white bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer transition shadow-sm border-none uppercase tracking-wider disabled:opacity-50"
                        >
                          {isExecuting ? (
                            <>
                              <RefreshCw size={10} className="animate-spin" />
                              <span>Executing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={10} />
                              <span>
                                {activeTeamKey === 'pricing' && si === 1 ? 'Run Simulation' :
                                 activeTeamKey === 'pricing' && si === 2 ? 'Isolate Promo' :
                                 activeTeamKey === 'product' && si === 0 ? 'Shortlist SKU' :
                                 activeTeamKey === 'product' && si === 1 ? 'Audit Capacity' :
                                 activeTeamKey === 'supplychain' && si === 0 ? 'Freeze SKU' :
                                 activeTeamKey === 'supplychain' && si === 2 ? 'Submit Release Form' :
                                 'Execute action'}
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>

        {/* Right Column: Category & Financial Business Case Advisor */}
        <BusinessCaseAdvisor
          paybackMonths={paybackMonths}
          totalExitCost={totalExitCost}
          annualSavingsThousands={annualSavingsThousands}
          exitDateDays={exitDateDays}
          skuB={skuB}
          transferenceRate={transferenceRate}
          transferenceVolume={transferenceVolume}
          leakageVolume={leakageVolume}
          walmartStatus={walmartStatus}
          targetStatus={targetStatus}
          tescoStatus={tescoStatus}
          costcoStatus={costcoStatus}
          isSafetyStockRaised={isSafetyStockRaised}
          role={role}
          hasVpSignedOff={auditLog ? auditLog.some(log => log.actionLabel === 'Executive Sign-Off' && log.skuA === skuA && log.skuB === skuB) : false}
          isCaseReady={blendedPct === 100}
          logAction={logAction}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2 text-[7.5px] font-bold uppercase tracking-widest text-zinc-400">
        <span>Logged under active ledger sync</span>
        <span>Secure cryptographic sign-off</span>
      </div>
    </div>
  );
};
