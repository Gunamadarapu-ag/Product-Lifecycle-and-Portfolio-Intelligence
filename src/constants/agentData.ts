export interface AgentThoughts {
  agent: string;
  role: string;
  colorClass: string;
  dotColor: string;
  borderColor: string;
  bgColor: string;
  thoughts: string[];
}

export const AGENT_THOUGHTS_DATA: Record<string, AgentThoughts> = {
  '1': {
    agent: 'Portfolio Agent',
    role: 'Portfolio Complexity & Mix Monitor',
    colorClass: 'text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/5',
    dotColor: 'bg-purple-500',
    borderColor: 'border-purple-500/25',
    bgColor: 'bg-purple-500/5',
    thoughts: [
      'Scanning portfolio: 100 SKUs loaded.',
      'Identified Dairy category as the highest friction point (27.78% margin dilution).',
      'Supplier fragmentation index at 1.20 (above 1.0 benchmark). Recommended SKU consolidation.'
    ]
  },
  '2': {
    agent: 'Supply Chain Agent',
    role: 'Logistics, Lead Times & Sourcing Planner',
    colorClass: 'text-orange-600 dark:text-orange-400 border-orange-500/30 bg-orange-500/5',
    dotColor: 'bg-orange-500',
    borderColor: 'border-orange-500/25',
    bgColor: 'bg-orange-500/5',
    thoughts: [
      'Monitoring launch readiness gates for 5 upcoming SKU releases.',
      'Detected sourcing delay on BrandD Organic Yogurt (sourcing lead time +14 days).',
      'Simulated raw milk supplier shock: recommended pre-positioning 2.5 weeks safety stock.'
    ]
  },
  '3': {
    agent: 'FP&A Agent',
    role: 'Financial Analyst & Cash Flow Forecaster',
    colorClass: 'text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/5',
    dotColor: 'bg-purple-500',
    borderColor: 'border-purple-500/25',
    bgColor: 'bg-purple-500/5',
    thoughts: [
      'Simulated 3-statement models under inflation shock scenario.',
      'Alert: Margin dilution detected across 12 high-volume SKUs (diluting target gross margin from 40.0% to 38.53%).',
      'Cash runway forecasted at 14.2 months. Suggesting structural pricing correction.'
    ]
  },
  '4': {
    agent: 'Merchandiser Agent',
    role: 'Category Assortment & Inventory Optimizer',
    colorClass: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/25',
    bgColor: 'bg-emerald-500/5',
    thoughts: [
      'Analyzing promo dependencies: BrandD Water at 27.97% promo dependency.',
      'Flagged 35 "Rationalize" segment SKUs. Full removal cuts safety stock capital from $246M to $142M (saving 42.2%).',
      'Drafted transition path to phase out Dairy yogurt variants with >30% margin leakage.'
    ]
  },
  '4-simplify': {
    agent: 'Simplification Agent',
    role: 'Bain Simplify to Grow Flywheel Analyst',
    colorClass: 'text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/5',
    dotColor: 'bg-indigo-500',
    borderColor: 'border-indigo-500/25',
    bgColor: 'bg-indigo-500/5',
    thoughts: [
      'IPPV model loaded for 100 SKUs. Top performer: BrandB Chips (78% household penetration, IPPV 100).',
      'Detected 8 Bad Complexity SKUs dragging portfolio flywheel score below 65.',
      'Complexity P&L analysis complete: Household category carries highest hidden cost burden. Recommend value chain review.'
    ]
  },
  '5': {
    agent: 'Controller Agent',
    role: 'Real-time Ledger & Governance Auditor',
    colorClass: 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/5',
    dotColor: 'bg-blue-500',
    borderColor: 'border-blue-500/25',
    bgColor: 'bg-blue-500/5',
    thoughts: [
      'Auditing real-time ledger records for MTD close.',
      'Flagged stockout exposure: Fabric Softener has 7 critical stockouts, causing $42k revenue leakage.',
      'Verified compliance of multi-currency transfer pricing across Italy and Spain.'
    ]
  },
  '6': {
    agent: 'Scenario Agent',
    role: 'Macro Simulation & Multi-Variable Optimizer',
    colorClass: 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5',
    dotColor: 'bg-amber-500',
    borderColor: 'border-amber-500/25',
    bgColor: 'bg-amber-500/5',
    thoughts: [
      'Drilldown engine running. Multi-variable target grids compiled.',
      'Regional analysis synced for Italy, Spain, France, and Germany.',
      'Ready to simulate target adjustments for Revenue, Margin, and OTIF across horizons.'
    ]
  },
  '8': {
    agent: 'Assortment Agent',
    role: 'Category Assortment & Regional Mix Optimizer',
    colorClass: 'text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/5',
    dotColor: 'bg-rose-500',
    borderColor: 'border-rose-500/25',
    bgColor: 'bg-rose-500/5',
    thoughts: [
      'Assortment Optimization Model loaded: 100 SKUs registered.',
      'Netherlands identified as immediate opportunity: lowest gross margin at 38.20% with smallest footprint (45 SKUs).',
      'Beverages category flagged for high cannibalization risk (internal promo correlation index at -0.62).'
    ]
  }
};

export const getAgentThoughtsForTab = (tabId: number, viewParam: string | null): AgentThoughts | null => {
  if (tabId === 4 && viewParam === 'simplify') {
    return AGENT_THOUGHTS_DATA['4-simplify'] || null;
  }
  return AGENT_THOUGHTS_DATA[String(tabId)] || null;
};
