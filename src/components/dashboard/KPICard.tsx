import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, Info, FileSearch } from 'lucide-react';
import { Role, KPI } from '../../types/dashboard';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';

interface KPICardProps {
  kpi: KPI;
  role: Role;
  onAuditClick?: () => void;
}

const KPI_TOOLTIPS: Record<string, { soWhat: string; action: string }> = {
  'Net Sales (Portfolio)': {
    soWhat: 'Revenue growth is +10.12% YoY ($225.1M to $247.9M) but heavily concentrated in the top 30% of SKUs.',
    action: 'Implement cross-selling to drive volume of middle-tier velocity items.'
  },
  'Avg Gross Margin': {
    soWhat: '12 high-volume items (like BrandA Soda) drag gross margin below the 40.0% corporate benchmark.',
    action: 'Review and adjust pricing terms or pack architecture on dilutive items.'
  },
  'Revenue Concentration': {
    soWhat: 'Top 10% of items generate 27.81% of sales. Severe vulnerability to supply chain failures.',
    action: 'Apply targeted safety stock buffers exclusively to these 10 highest-value items.'
  },
  'Portfolio PCI': {
    soWhat: 'High supplier fragmentation (1.20) and SKU count (1.02) inflate carrying costs by 20%.',
    action: 'Consolidate supplier relationships into specialized category clusters.'
  },
  'Long-Tail SKU Burden': {
    soWhat: '68 SKUs generate <1% sales but interact with all 60 suppliers, creating high administrative overhead.',
    action: 'Consolidate supplier networks by eliminating overlapping SKU suppliers.'
  },
  'Rationalize Candidates': {
    soWhat: '35 items generate low margins/revenue but drive peak stockouts and high promotion erosion.',
    action: 'Prune the bottom 10% immediately to reclaim 8.81% safety stock at <3.58% sales risk.'
  },
  'Peak Stockout Freq.': {
    soWhat: 'BrandC Biscuits and BrandF Soap had 440 stockouts, mostly in Hypermarkets (15.9k events).',
    action: 'Re-negotiate SLAs and establish priority freight lanes for Modern Trade/Hypermarkets.'
  },
  'Revenue Tail Risk': {
    soWhat: 'Pruning all 35 candidates simultaneously risks 27.08% of revenue under a zero customer transfer assumption.',
    action: 'Run a phased pilot substitution test in a single region before fully sun-setting items.'
  },
  // Tab 2 (Launch Readiness) KPIs
  'Overall Readiness %': {
    soWhat: 'Overall category launch readiness stands at 82% (or 79% under delays), dragged down by supplier bottlenecks in Household and Dairy labels.',
    action: 'Escalate lead-time reviews with regional supplier partners and clear the Q4 launch pipeline backlog.'
  },
  // Tab 3 (Profitability Tree) KPIs
  'Net Profit': {
    soWhat: 'Net profitability reaches $95.2 M, driven by strong growth in core beverages, but impacted by rising raw milk COGS in Dairy.',
    action: 'Re-negotiate milk procurement contracts and increase high-margin snack items distribution focus.'
  },
  'Gross margin %': {
    soWhat: 'Average segment gross margin is 36.2%, compressed by deep promotional discounts on cookies and chips.',
    action: 'Cap promotional discount depths at 15% and enforce margin pricing corridors.'
  },
  'Gross Profit': {
    soWhat: 'Gross profit reached $308.1 M, driven by strong volumes in carbonated beverages and snacks.',
    action: 'Optimize supply chain logistics to reduce supplier COGS and protect the margins.'
  },
  'Revenue MTD': {
    soWhat: 'MTD revenue reaches $851.2 M (8.4% increase vs last month), driven by a demand surge in natural beverages.',
    action: 'Expedite distribution channel replenishments in high-velocity retail stores to capture demand.'
  },
  'Launch ROI': {
    soWhat: 'Expected launch return stands at 1.85x ROI, buoyed by the upcoming premium Mango Fizz 750ml rollout.',
    action: 'Approve the $4.2 M launch budget and run early cross-promotions with snacks.'
  },
  // Tab 4 (SKU Rationalization) KPIs
  'Portfolio SKUs': {
    soWhat: 'Portfolio contains 100 total active SKUs, recently optimized by sun-setting 3 low-value tail products.',
    action: 'Maintain category assortments and monitor baseline volume transfer to core hero SKUs.'
  },
  'Sunset Candidates': {
    soWhat: 'AI has identified 6 critical sunset candidates (like Fabric Softener, Floor Cleaner, and Aloe Face Wash) that drive margin leakage.',
    action: 'Execute phase-out for the bottom 3 performers immediately to reclaim supplier administrative capacity.'
  },
  'Revenue at Risk': {
    soWhat: 'Total revenue exposure is $148 M if all 6 sunset candidates are pruned simultaneously without substitution transfer.',
    action: 'Enforce product replacement recommendations (e.g. redirecting demand to hero Mango Fizz or Soap variants).'
  },
  'Avg Complexity': {
    soWhat: 'Catalog complexity average is 0.48, exceeding the corporate ceiling of 0.40 due to vendor fragmentation.',
    action: 'Consolidate logistics by routing tail-end variants to distributor-held fulfillment models.'
  },
  // Tab 5 (Signals Board) KPIs
  'Active Stockouts': {
    soWhat: 'Active stockouts stand at 7, exceeding the threshold of 3, primarily driven by surfactant packaging delays at the Baddi plant.',
    action: 'Expedite surfactant safety stock transfer and coordinate local vendor transition.'
  },
  'Total Active Signals': {
    soWhat: 'A total of 6 critical operational signals are active, led by NPS drops in EMEA and cannibalization alerts in India.',
    action: 'Review signals queue and triage urgent tickets to respective category managers.'
  },
  'Competitor Alerts': {
    soWhat: 'Active competitor alerts indicate aggressive pricing cuts on snacks and soap lines in regional supermarkets.',
    action: 'Monitor daily discount tracking and stabilize baseline retail price corridors.'
  },
  'Market Demand Change': {
    soWhat: 'Market demand is up +18.4% overall, heavily driven by carbonated and natural beverages in APAC.',
    action: 'Establish dedicated priority freight corridors to prevent stockouts in high-demand zones.'
  },
  'Customer Sentiment Score': {
    soWhat: 'Customer Net Promoter Score is stable at 72, though EMEA snacks saw a 3-point dip due to recent logistics delays.',
    action: 'Implement local customer feedback loops and optimize warehouse dispatch times in Europe.'
  }
};

const KPI_METRIC_CONFIGS: Record<string, { target: string; color: string; hist: number[] }> = {
  // Launch Readiness
  'Overall Readiness %': { target: '85%', color: '#8b5cf6', hist: [78, 80, 81, 81, 82, 82, 82, 82] },
  'Revenue Tail Risk': { target: '30%', color: '#ef4444', hist: [25, 26, 26, 27, 27, 27, 27.08, 27.08] },
  'Peak Stockout Freq.': { target: '350', color: '#ef4444', hist: [400, 420, 430, 435, 438, 440, 440, 440] },
  'Rationalize Candidates': { target: '40 SKUs', color: '#8b5cf6', hist: [30, 32, 33, 34, 35, 35, 35, 35] },
  
  // Profitability
  'Net Profit': { target: '$100 M', color: '#10b981', hist: [85, 88, 90, 92, 93, 94, 94.8, 95.2] },
  'Gross margin %': { target: '38%', color: '#3b82f6', hist: [35.1, 35.4, 35.6, 35.8, 36.0, 36.1, 36.2, 36.2] },
  'Gross Profit': { target: '$320 M', color: '#10b981', hist: [290, 295, 300, 302, 304, 306, 307.5, 308.1] },
  'Revenue MTD': { target: '$900 M', color: '#3b82f6', hist: [780, 795, 808, 821, 833, 843, 850, 851.2] },
  'Launch ROI': { target: '1.50x', color: '#f59e0b', hist: [1.2, 1.3, 1.5, 1.6, 1.7, 1.8, 1.83, 1.85] },
  
  // Signals Board
  'Total Active Signals': { target: '3', color: '#3b82f6', hist: [4, 5, 5, 6, 6, 6, 6, 6] },
  'Competitor Alerts': { target: '1', color: '#ef4444', hist: [1, 2, 2, 2, 2, 2, 2, 2] },
  'Active Stockouts': { target: '3', color: '#ef4444', hist: [5, 6, 6, 7, 7, 7, 7, 7] },
  'Market Demand Change': { target: '+15%', color: '#10b981', hist: [12, 14, 15, 16, 17, 18, 18.2, 18.4] },
  'Customer Sentiment Score': { target: '80', color: '#f59e0b', hist: [75, 74, 73, 73, 72, 72, 72, 72] }
};

const getMetricConfig = (label: string) => {
  return KPI_METRIC_CONFIGS[label] || {
    target: '—',
    color: '#8b5cf6',
    hist: [50, 52, 54, 53, 55, 57, 58, 60]
  };
};

export const KPICard: React.FC<KPICardProps> = ({ kpi, role, onAuditClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const isHighlighted = kpi.highlight?.includes(role) ?? false;
  const auditDetails = KPI_TOOLTIPS[kpi.label];
  const config = getMetricConfig(kpi.label);

  const getTrendColor = () => {
    if (kpi.trend === 'neutral') return 'text-zinc-500 dark:text-zinc-400';
    if (kpi.trend === 'up') return kpi.isRisk ? 'text-red-500' : 'text-emerald-500';
    return kpi.isRisk ? 'text-emerald-500' : 'text-red-500';
  };

  const deltaText = `${kpi.trend === 'up' ? '▲' : kpi.trend === 'down' ? '▼' : '•'} ${kpi.trendValue}`;

  return (
    <div
      onClick={onAuditClick}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      className={`glass-card bg-white dark:bg-white/5 border p-3 rounded-sm shadow-sm flex flex-col justify-between h-[115px] group cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all relative select-none ${
        isHighlighted
          ? 'border-acies-yellow bg-white/90 dark:bg-white/10'
          : 'border-black/10 dark:border-white/10'
      }`}
    >
      {/* Highlighted pulse bar */}
      {isHighlighted && (
        <div className="absolute top-[1.5px] left-[1.5px] right-[1.5px] h-[2px] rounded-t-sm bg-acies-yellow animate-pulse" />
      )}

      <div className="flex justify-between items-start mb-0.5">
        <div className="min-w-0 pr-1">
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 truncate flex items-center gap-1">
            {kpi.label}
            {isHighlighted && <Zap size={8} className="text-acies-yellow fill-acies-yellow shrink-0" />}
          </p>
          <h3 className="text-xl font-display font-extrabold text-zinc-900 dark:text-zinc-200 mt-0.5">
            {kpi.value}
          </h3>
        </div>
        
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1">
            <span className="text-[8px] uppercase font-bold text-zinc-400">Target</span>
            <div
              className="relative shrink-0 z-40"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info size={9} className="opacity-35 hover:opacity-100 transition-opacity cursor-help" />
              {showTooltip && (
                <div className="absolute right-0 top-4 w-56 bg-acies-gray text-white text-[9px] p-2.5 shadow-2xl border border-white/10 z-50 leading-relaxed pointer-events-none rounded-sm font-sans normal-case text-left">
                  <p className="opacity-70 mb-1.5">{kpi.info}</p>
                  {auditDetails && (
                    <div className="space-y-1 border-t border-white/10 pt-1.5">
                      <div>
                        <span className="text-red-400 font-bold uppercase tracking-wider block text-[6.5px]">So What?</span>
                        <p className="opacity-95">{auditDetails.soWhat}</p>
                      </div>
                      <div>
                        <span className="text-green-400 font-bold uppercase tracking-wider block text-[6.5px]">Action Plan</span>
                        <p className="opacity-95 text-acies-yellow">{auditDetails.action}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-[10px] font-bold font-mono text-zinc-600 dark:text-zinc-400 leading-none mt-0.5">
            {config.target}
          </p>
        </div>
      </div>

      {/* Sparkline chart */}
      <div className="h-[22px] my-1 opacity-85 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={config.hist.map((val, idx) => ({ idx, val }))} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
            <YAxis domain={['auto', 'auto']} hide />
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke={config.color} 
              fill={`${config.color}15`} 
              strokeWidth={1.5} 
              dot={false} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5 flex justify-between items-center">
        <span className={getTrendColor()}>{deltaText}</span>
        
        {/* Slide-up Audit indicator */}
        <span 
          className={`flex items-center gap-1 text-[7px] font-bold uppercase tracking-widest text-acies-yellow transition-opacity duration-200 ${
            isCardHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <FileSearch size={8} />
          Audit Trace
        </span>
      </div>
    </div>
  );
};
