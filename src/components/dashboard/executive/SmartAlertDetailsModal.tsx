/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, AlertTriangle, Info, ShieldAlert, TrendingDown, DollarSign, Activity, 
  FileText, Calendar, Cpu, Database, ChevronDown, ChevronUp 
} from 'lucide-react';
import { ModalShell } from '../../common/Modal';

export interface AlertData {
  id: string;
  sev: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
}

interface AlertDetailContext {
  impact: string;
  problem: string;
  metrics: { label: string; value: string }[];
  financial: string;
  recommendations: string[];
  directive: string;
  agenticTrace: {
    agent: string;
    dataset: string;
    signals: string[];
    logic: string;
  };
}

const ALERT_DETAILS_CONTEXT: Record<string, AlertDetailContext> = {
  a1: {
    impact: 'Launch Delay Risk',
    problem: 'The upcoming launch of Mango Fizz 750ml is experiencing critical packaging material bottle shortages from key regional suppliers, pushing the schedule back by 21 days.',
    metrics: [
      { label: 'Target Launch Date', value: 'Sep 15, 2026' },
      { label: 'Readiness Score', value: '78%' },
      { label: 'Schedule Variance', value: '-21 Days' }
    ],
    financial: '$2.5 M in projected first-quarter revenue deferred due to launch delay.',
    recommendations: [
      'Initiate emergency qualification of backup bottle packaging supplier.',
      'Pre-allocate initial production run to highest-margin regional distributors.',
      'Adjust Q3 promotional marketing calendar to align with new launch window.'
    ],
    directive: 'Approve secondary packaging supplier onboarding and launch date revision.',
    agenticTrace: {
      agent: 'Launch Agent',
      dataset: 'SharePoint PM Logs (LP001) & ERP Supplier Inventory Ledger',
      signals: [
        'APAC Supplier Lead Time: 45 days (Threshold: < 14 days)',
        'Bottle Inventory level: 1,200 units (Threshold: > 40,000 units)'
      ],
      logic: 'The Launch Agent scanned SharePoint project logs and flagged "APAC logistics bottleneck." It cross-referenced the ERP supplier inventory database to confirm current bottle stocks are insufficient for the initial manufacturing batch, projecting a 21-day timeline slip.'
    }
  },
  a2: {
    impact: 'Margin Erosion',
    problem: 'Aggressive and prolonged trade discount schemes have trained consumers to purchase only during promotional windows. Organic, full-price sales now constitute only 28% of total volume.',
    metrics: [
      { label: 'Promotion Dependency', value: '72% of Total Sales' },
      { label: 'Actual Margin', value: '12.0% (Target: 35.0%)' },
      { label: 'Organic Purchase Rate', value: '28% (Declining)' }
    ],
    financial: '$0.8 M in category profit leakage due to deep discounting reliance.',
    recommendations: [
      'Implement a two-quarter promotional phase-down schedule to stabilize pricing baselines.',
      'Transition key account promotions from single-unit price reductions to multi-pack bundle pricing.',
      'Re-invest saved trade spend into digital brand-equity marketing to restore organic appeal.'
    ],
    directive: 'Sign off on promotional discount phase-down program for Q4.',
    agenticTrace: {
      agent: 'Profitability Agent',
      dataset: 'FMCG Multi-Country Sales Dataset & Promo Calendar Database',
      signals: [
        'Promo Volume Dependency: 72% (Threshold: < 30%)',
        'Gross Margin: 12.0% (Target: 35.0%)'
      ],
      logic: 'The Profitability Agent executed a daily aggregation query across regional transaction archives. It detected that volume lift during active promo schedules was insufficient to cover the double-discounting margin drop, flagging structural pricing dilution.'
    }
  },
  a3: {
    impact: 'Margin Contraction',
    problem: 'Laundry Pods Premium is experiencing high ingredient cost variance due to surfactant price spikes, eroding the gross margin below the target threshold.',
    metrics: [
      { label: 'Gross Margin', value: '31.0% (Target: 46.0%)' },
      { label: 'Cost Variance', value: '+15.2% on Surfactants' },
      { label: 'Revenue Impact', value: '$0.65 M' }
    ],
    financial: '$0.65 M gross profit leakage if pricing strategy is not optimized.',
    recommendations: [
      'Renegotiate contract prices with primary surfactant supplier.',
      'Implement a selective price adjustment (cost pass-through) on premium SKUs.',
      'Optimize the formulation mix to reduce reliance on high-cost raw materials.'
    ],
    directive: 'Authorize SKU-level price adjustment and formulation optimization review.',
    agenticTrace: {
      agent: 'Profitability Agent',
      dataset: 'ERP Cost Ledger (Household Care) & COGS Composition Database',
      signals: [
        'Active Chemical Cost Variance: +15.2% (Threshold: < +3.0%)',
        'Simulated gross margin drop: -15% drag'
      ],
      logic: 'The Profitability Agent audited raw material invoices inside the ERP ledger. It detected a price surge in surfactants and mapped the cost change across product formulations, identifying Laundry Pods Premium as having critical exposure.'
    }
  },
  a4: {
    impact: 'Product Cannibalization',
    problem: 'The newly introduced Mango Fizz line variants are cannibalizing the core beverage portfolio. Brand share is shifting internally without attracting incremental customers to the brand ecosystem.',
    metrics: [
      { label: 'Pair Correlation Coefficient', value: '-0.62 (Severe)' },
      { label: 'Mango Fizz Volume Delta', value: '+15.0%' },
      { label: 'Core Beverage Volume Delta', value: '-18.0%' }
    ],
    financial: 'Flat net category growth despite elevated product launching and packaging costs.',
    recommendations: [
      'Differentiate package sizing (e.g. position original as multi-serve and variants as single-serve).',
      'Re-segment supermarket shelf layouts to place Mango Fizz variants separate from core product bays.',
      'Introduce joint cross-purchase bundles to encourage cart expansion rather than substitution.'
    ],
    directive: 'Approve shelf re-layout and packaging segmentation directive.',
    agenticTrace: {
      agent: 'Sunset Agent',
      dataset: 'FMCG Multi-Country Sales Dataset',
      signals: [
        'Pearson volume correlation coefficient: -0.62 (Threshold: > -0.20)',
        'Net volume variance: -3% net decline'
      ],
      logic: 'The Sunset Agent ran a Pearson correlation matrix over transaction volumes. It identified a strong negative correlation (r = -0.62) between the new variants and the core lines, indicating that variants are cannibalizing core SKU volume.'
    }
  },
  a5: {
    impact: 'Launch Readiness Check',
    problem: 'BrandA Premium Energy is approaching its final launch gate with 88% readiness. However, channel placement and labeling compliance verification are pending final approval.',
    metrics: [
      { label: 'Overall Readiness', value: '88% (Target: 95%)' },
      { label: 'Estimated 1st Year Rev', value: '$24.5 M' },
      { label: 'Gate Status', value: 'Pre-Launch (Gate 3)' }
    ],
    financial: '$24.5 M in estimated first-year revenue dependent on timely gate sign-off.',
    recommendations: [
      'Accelerate final label compliance review with regulatory team.',
      'Finalize supermarket shelf space allocations with key retail partners.',
      'Authorize pre-launch inventory build of 5,000 cases.'
    ],
    directive: 'Approve Pre-Launch Gate 3 sign-off and inventory release.',
    agenticTrace: {
      agent: 'Launch Agent',
      dataset: 'SharePoint PM Logs (LP002) - Launch Gate Checklist',
      signals: [
        'Overall Readiness Score: 88% (Threshold: >= 95% for Gate 3)',
        'Labeling Compliance: Pending'
      ],
      logic: 'The Launch Agent scanned PM launch readiness metrics. While sourcing and marketing gates are complete, labeling compliance approval and supermarket shelf-space allocation remain unconfirmed, keeping the score below gate authorization thresholds.'
    }
  },
  a6: {
    impact: 'Margin Erosion',
    problem: 'Dishwasher Pods 30ct margin is contracting due to overlapping promotional campaigns across major supermarket chains, leading to double-discounting.',
    metrics: [
      { label: 'Gross Margin', value: '34.0% (Target: 48.0%)' },
      { label: 'Promo Discount Rate', value: '42.0%' },
      { label: 'Volume Lift Delta', value: '+8.0% (Insufficient)' }
    ],
    financial: '$0.75 M in promotion-related margin dilution during the current cycle.',
    recommendations: [
      'Suspend overlapping Q3 promotional campaigns for the 30ct format.',
      'Transition trade promotions to volume-based rebates instead of front-end discounts.',
      'Enforce minimum advertised price (MAP) guidelines across retail channels.'
    ],
    directive: 'Authorize temporary promotion suspension and trade term renegotiation.',
    agenticTrace: {
      agent: 'Profitability Agent',
      dataset: 'Promo Calendar Database & FMCG Multi-Country Sales Dataset',
      signals: [
        'Active Overlapping Campaigns: 2 (Threshold: <= 1)',
        'Effective Promo Discount Rate: 42.0% (Threshold: < 25.0%)'
      ],
      logic: 'The Profitability Agent cross-referenced the promotional calendars and detected calendar clashes on the 30ct SKU. The combined double-discounting resulted in a 42.0% price cut, producing a mere 8% volume lift, leading to margin erosion.'
    }
  }
};

export const getDynamicAlertContext = (alert: AlertData): AlertDetailContext => {
  if (ALERT_DETAILS_CONTEXT[alert.id]) {
    return ALERT_DETAILS_CONTEXT[alert.id];
  }

  const title = alert.title || '';
  
  // Default values
  let impact = 'System Alert';
  let problem = 'The agentic system auto-detected an operational variance requiring review.';
  let metrics = [{ label: 'Status', value: 'Active' }];
  let financial = 'Undetermined margin exposure.';
  let recommendations = ['Inspect relevant department ledgers.', 'Acknowledge alert and notify category operations.'];
  let directive = 'Investigate system anomaly.';
  let agenticAgent = 'Portfolio Agent';
  let agenticDataset = 'FMCG Multi-Country Sales Dataset';
  let agenticSignals = ['System Flag: Active'];
  let agenticLogic = 'Automated trace logic executed.';

  if (title.includes('Fabric Softener')) {
    impact = 'Inventory Outage';
    problem = 'Fabric Softener stock level falls below safety threshold of 1,500 units at regional warehouses due to delayed inbound transit.';
    metrics = [
      { label: 'Current Stock', value: '140 units' },
      { label: 'Safety Threshold', value: '1,500 units' },
      { label: 'Days of Cover', value: '0.8 days' }
    ];
    financial = '$0.12 M in potential lost sales if stockout occurs.';
    recommendations = [
      'Initiate emergency stock transfer from secondary logistics hub.',
      'Expedite supplier shipping logs validation.',
      'Alert national account sales team of temporary order constraints.'
    ];
    directive = 'Authorize emergency replenishment route.';
    agenticAgent = 'Portfolio Agent';
    agenticDataset = 'ERP Inventory Ledger';
    agenticSignals = [
      'Fabric Softener Stock: 140 units (Threshold: > 1,500)',
      'Days of Cover: 0.8 days (Threshold: > 7 days)'
    ];
    agenticLogic = 'Inventory sensors flagged low stock on Household SKU. Cross-referenced inbound shipping calendars to verify delayed logistics schedules.';
  } else if (title.includes('Lead time breach')) {
    impact = 'Supplier SLA Breach';
    problem = 'SLA lead times breached for core packaging supplier, delaying shipping timelines by 21 days due to port congestion.';
    metrics = [
      { label: 'Observed Lead Time', value: '35 days' },
      { label: 'Contractual SLA', value: '14 days' },
      { label: 'Schedule Variance', value: '+21 days' }
    ];
    financial = '$0.45 M in delayed order fulfillment and penalty risks.';
    recommendations = [
      'Route upcoming orders to qualified backup local suppliers.',
      'Issue formal SLA breach warning to supplier account manager.',
      'Prioritize available inventory to strategic priority channels.'
    ];
    directive = 'Sign off on logistics routing redirection plan.';
    agenticAgent = 'Launch Agent';
    agenticDataset = 'SharePoint PM Logs & Supplier Shipping Database';
    agenticSignals = [
      'Lead Time: 35 days (Threshold: < 14)',
      'Logistics Status: Port Congestion'
    ];
    agenticLogic = 'Launch Agent scanned carrier customs logs. Identified that raw materials are container-locked, calculating downstream production bottlenecks.';
  } else if (title.includes('Cold chain')) {
    impact = 'Logistics Cold Chain Failure';
    problem = 'IoT temperature sensors reported room temperature spike above threshold limits in Mumbai DC, putting perishables at risk.';
    metrics = [
      { label: 'Chamber Temperature', value: '8.2°C' },
      { label: 'Target Threshold', value: '4.0°C' },
      { label: 'Duration of Spike', value: '4 hours' }
    ];
    financial = '$0.30 M in perishable inventory write-off risks if unresolved.';
    recommendations = [
      'Dispatch technical facility maintenance team to inspect seal leaks.',
      'Temporarily reroute inbound cold products to adjacent cold chambers.',
      'Flag affected batch identifiers for compliance review.'
    ];
    directive = 'Approve chamber maintenance order and inventory check.';
    agenticAgent = 'Market Signal Agent';
    agenticDataset = 'IoT Telemetry Feed & Facilities Logs';
    agenticSignals = [
      'DC Temp: 8.2°C (Threshold: < 4.0)',
      'Spike Duration: 4 hours (Threshold: < 30 mins)'
    ];
    agenticLogic = 'IoT sensor reported telemetry spike. Swarm agent coordinated with local facility managers, resolving seal leak.';
  } else if (title.includes('Freight cost')) {
    impact = 'Logistics Margin Leak';
    problem = 'Freight lane rates increased unexpectedly by 4.2% on Mumbai to Bangalore routes, increasing cost-to-serve metrics.';
    metrics = [
      { label: 'Lane Cost Delta', value: '+4.2%' },
      { label: 'Target Inflation Cap', value: '+2.0%' },
      { label: 'Affected SKUs count', value: '14 SKUs' }
    ];
    financial = '$0.20 M margin dilution across Household Care segments in Bangalore.';
    recommendations = [
      'Renegotiate contracts with primary regional logistics partners.',
      'Audit spot-rate freight pricing for comparison options.',
      'Consider consolidated shipping schedules to optimize load capacity.'
    ];
    directive = 'Authorize freight rate audit and carrier negotiation mandate.';
    agenticAgent = 'Profitability Agent';
    agenticDataset = 'Logistics Expense Database & Contracts Ledger';
    agenticSignals = [
      'Freight Lane Delta: +4.2% (Threshold: < +2.0%)'
    ];
    agenticLogic = 'Analyzed freight bills and identified fuel surcharge increases. Traversed distribution paths to calculate product margins.';
  } else if (title.includes('Green Tea')) {
    impact = 'Margin Erosion';
    problem = 'Double-discounting detected on Green Tea RTD due to overlapping regional banner flyers and national digital promotions.';
    metrics = [
      { label: 'Effective Discount', value: '38.0%' },
      { label: 'Promo Overlap Period', value: '10 days' },
      { label: 'Observed Margin', value: '22.5%' }
    ];
    financial = '$0.40 M in category profit leakage from unauthorized promotion combinations.';
    recommendations = [
      'Suspend overlapping regional flyer pricing immediately.',
      'Review promo calendar rules to enforce combination exclusions.',
      'Transition next cycle trade promos to volume-based rebates.'
    ];
    directive = 'Authorize temporary campaign suspension and trade term audit.';
    agenticAgent = 'Profitability Agent';
    agenticDataset = 'Promo Calendar Ledger & FMCG Sales Dataset';
    agenticSignals = [
      'Overlapping Campaigns: 2 (Threshold: <= 1)',
      'Combined Discount: 42.0% (Threshold: < 25.0%)'
    ];
    agenticLogic = 'Scanned promotional calendar files and POS discount indicators. Flagged double-discounting anomalies on Green Tea RTD SKU.';
  } else if (title.includes('Price floor')) {
    impact = 'Pricing Compliance Breach';
    problem = 'POS records indicate unit sales of Choco Wafers priced at $45.00, breaching the mandatory pricing floor guidelines.';
    metrics = [
      { label: 'Observed Retail Price', value: '$45.00' },
      { label: 'Mandated Price Floor', value: '$50.00' },
      { label: 'Compliance Deviation', value: '-10.0%' }
    ];
    financial = '$0.25 M in brand price erosion and retail partner margin dilution.';
    recommendations = [
      'Enforce pricing compliance rules through retail POS channels.',
      'Request explanation from APAC store operations group.',
      'Verify if breach was triggered defensively against competitor pricing.'
    ];
    directive = 'Approve price compliance warning and operational audit.';
    agenticAgent = 'Portfolio Agent';
    agenticDataset = 'ERP Pricing Ledger & Sales Dataset';
    agenticSignals = [
      'Unit Retail Price: $45.00 (Threshold: > $50.00)',
      'Applied Discount: 25% (Threshold: < 15%)'
    ];
    agenticLogic = 'Monitored daily POS transactions and flagged price floor breaches. Traced to store manager manual override codes.';
  } else if (title.includes('Promotional budget')) {
    impact = 'Trade Spend Overrun';
    problem = 'Q3 promotional trade spend budget has reached 83% utilization ahead of schedule, with 14 campaign days remaining.';
    metrics = [
      { label: 'Budget Utilization', value: '83%' },
      { label: 'Milestone Target', value: '65%' },
      { label: 'Days Remaining', value: '14 days' }
    ];
    financial = '$0.50 M potential overrun liability if redemptions continue at pace.';
    recommendations = [
      'Implement digital coupon cap limits to slow budget consumption.',
      'De-prioritize low-margin advertising spots for the remaining cycle.',
      'Request contingency budget reallocation from Q4 marketing pool.'
    ];
    directive = 'Authorize coupon cap activation and budget reallocation review.';
    agenticAgent = 'Profitability Agent';
    agenticDataset = 'Trade Spend Ledger & Campaign Database';
    agenticSignals = [
      'Budget Consumed: 83% (Threshold: < 70% at milestone)'
    ];
    agenticLogic = 'Audited promotional expenditures and calculated accelerated budget burn rates due to elevated coupon redemptions.';
  } else if (title.includes('Cost variance')) {
    impact = 'Margin Contraction';
    problem = 'Cost-of-goods-sold (COGS) variance spike detected due to a 7.4% raw cost increase in plastic film packaging.';
    metrics = [
      { label: 'Packaging Cost Delta', value: '+7.4%' },
      { label: 'Gross Margin Drag', value: '-1.4%' },
      { label: 'Monthly Cost Impact', value: '$0.15 M' }
    ];
    financial = '$0.15 M margin dilution per month across household care category.';
    recommendations = [
      'Renegotiate contract rates with packaging material suppliers.',
      'Evaluate alternative packaging specifications or gauges.',
      'Model SKU cost pass-through price adjustments.'
    ];
    directive = 'Approve cost pass-through modeling and supplier review.';
    agenticAgent = 'Profitability Agent';
    agenticDataset = 'COGS Composition Database & ERP Cost Ledger';
    agenticSignals = [
      'Packaging Cost Spike: +7.4% (Threshold: < +2.0%)'
    ];
    agenticLogic = 'Scanned procurement invoices and identified plastic film price spikes. Traced recipe COGS across affected household care SKUs.';
  }

  return {
    impact,
    problem,
    metrics,
    financial,
    recommendations,
    directive,
    agenticTrace: {
      agent: agenticAgent,
      dataset: agenticDataset,
      signals: agenticSignals,
      logic: agenticLogic
    }
  };
};

interface SmartAlertDetailsModalProps {
  isOpen: boolean;
  alert: AlertData | null;
  onClose: () => void;
  onScheduleMeeting: (alert: AlertData) => void;
}

export const SmartAlertDetailsModal: React.FC<SmartAlertDetailsModalProps> = ({
  isOpen,
  alert,
  onClose,
  onScheduleMeeting
}) => {
  const [isTraceExpanded, setIsTraceExpanded] = useState(true);

  if (!isOpen || !alert) return null;

  const data = getDynamicAlertContext(alert);
  if (!data) return null;

  const sevColors = {
    critical: {
      bg: 'bg-red-500/10 border-red-500/20 text-red-500',
      icon: <ShieldAlert className="text-red-500 shrink-0" size={16} />,
      badge: 'bg-red-500 text-white'
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      icon: <AlertTriangle className="text-amber-500 shrink-0" size={16} />,
      badge: 'bg-amber-500 text-black'
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      icon: <Info className="text-blue-500 shrink-0" size={16} />,
      badge: 'bg-blue-500 text-white'
    }
  };

  const currentSev = sevColors[alert.sev];

  return (
    <ModalShell isOpen onClose={onClose} layer="nested" className="flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {currentSev.icon}
              <h2 className="text-sm font-display font-extrabold text-zinc-900 dark:text-zinc-50 leading-snug">
                Smart Alert Briefing
              </h2>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${currentSev.badge}`}>
                {alert.sev}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-semibold tracking-wide truncate max-w-[500px]">
              {alert.title}
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

        {/* Impact Category */}
        <div className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-2 rounded">
          <FileText size={14} className="text-zinc-500" />
          <span className="font-extrabold text-[9.5px] uppercase tracking-wider text-zinc-500">
            Impact Domain:
          </span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase">
            {data.impact}
          </span>
        </div>

        {/* Problem Description */}
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-zinc-400">Situation Analysis</h3>
          <p className="bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded p-3 leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
            {data.problem}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.metrics.map(metric => (
            <div key={metric.label} className="border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded flex flex-col justify-between">
              <span className="text-[8.5px] font-semibold uppercase tracking-wider text-zinc-400 leading-normal">{metric.label}</span>
              <span className="text-sm font-display font-extrabold text-zinc-800 dark:text-zinc-300 mt-1">{metric.value}</span>
            </div>
          ))}
        </div>

        {/* Financial Implications */}
        <div className="border border-red-500/10 bg-red-500/[0.02] dark:bg-red-500/[0.01] p-3.5 rounded space-y-1">
          <div className="flex items-center gap-1.5 text-red-500">
            <DollarSign size={14} />
            <span className="font-extrabold text-[9.5px] uppercase tracking-widest">Financial Implication</span>
          </div>
          <p className="font-extrabold text-zinc-800 dark:text-zinc-200 leading-normal">
            {data.financial}
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-zinc-400">Recommended Action Plan</h3>
          <ul className="space-y-2 pr-1">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="flex gap-2 items-start text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                <span className="text-blue-500 shrink-0 font-bold font-mono">0{index + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Agentic Trace Accordion */}
        {data.agenticTrace && (
          <div className="border border-purple-500/15 bg-purple-500/[0.01] dark:bg-purple-500/[0.005] rounded-lg overflow-hidden mt-1">
            <button
              type="button"
              onClick={() => setIsTraceExpanded(!isTraceExpanded)}
              className="w-full flex justify-between items-center p-3 bg-purple-500/5 hover:bg-purple-500/10 transition-colors border-none text-left cursor-pointer outline-none"
            >
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-extrabold text-[9.5px] uppercase tracking-wider">
                <Cpu size={14} className="animate-pulse" />
                <span>Agentic Decision Trace & Data Provenance</span>
              </div>
              {isTraceExpanded ? (
                <ChevronUp size={14} className="text-purple-500" />
              ) : (
                <ChevronDown size={14} className="text-purple-500" />
              )}
            </button>

            {isTraceExpanded && (
              <div className="p-4 border-t border-purple-500/10 space-y-3 leading-relaxed text-zinc-700 dark:text-zinc-400">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
                      <Cpu size={10} className="text-purple-400" /> Triggering Swarm Agent
                    </span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">
                      {data.agenticTrace.agent}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
                      <Database size={10} className="text-blue-400" /> Source Systems & Files
                    </span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate" title={data.agenticTrace.dataset}>
                      {data.agenticTrace.dataset}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-black/5 dark:border-white/5 pt-2.5">
                  <span className="text-[8px] font-mono uppercase text-zinc-400 font-bold">Referenced Signals Checked</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.agenticTrace.signals.map((sig, idx) => (
                      <span key={idx} className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-2.5 py-1 rounded text-[8.5px] font-semibold text-zinc-700 dark:text-zinc-300">
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 border-t border-black/5 dark:border-white/5 pt-2.5">
                  <span className="text-[8px] font-mono uppercase text-zinc-400 font-bold">Trace Reasoning & Math Verification</span>
                  <p className="text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                    {data.agenticTrace.logic}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center border-t border-black/10 dark:border-white/10 pt-3 mt-1">
          <button 
            type="button"
            onClick={() => {
              onScheduleMeeting(alert);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 border rounded-lg text-[10.5px] font-bold tracking-wide transition-all duration-150 cursor-pointer border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white dark:border-blue-500/35 dark:text-blue-400 dark:bg-blue-50/5 dark:hover:bg-blue-500 dark:hover:text-white"
          >
            <Calendar size={13} />
            Schedule a Meeting
          </button>
          
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent outline-none"
          >
            Close
          </button>
        </div>

      </div>
    </ModalShell>
  );
};
