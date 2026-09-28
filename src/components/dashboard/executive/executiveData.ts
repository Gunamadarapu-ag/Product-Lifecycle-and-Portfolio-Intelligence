/**
 * Customer insights, month forecasts, event templates and flagged SKUs.
 *
 * Extracted from ExecutiveOverview.tsx (2,142 lines).
 */


export interface CustomerInsight {
  name: string;
  segment: string;
  revContribution: string;
  interestTrend: string;
  buyingFocus: string[];
  growthTrend: string;
  growthDirection: 'up' | 'down' | 'neutral';
}

export const CUSTOMER_INSIGHTS: Record<string, CustomerInsight[]> = {
  Beverages: [
    {
      name: 'Apex Hypermarkets',
      segment: 'Enterprise Chain • 98% Retention',
      revContribution: '$24.8 M',
      interestTrend: 'Rising demand for eco-friendly packaging and natural mineral mixers.',
      buyingFocus: ['BrandF Water Eco-Pack', 'Coconut Water 1K'],
      growthTrend: '+12.4% YoY',
      growthDirection: 'up'
    },
    {
      name: 'QuickCart Convenience',
      segment: 'Regional Chain • 94% Retention',
      revContribution: '$14.2 M',
      interestTrend: 'Shifting shelf preference toward high-energy single-serve options.',
      buyingFocus: ['BrandC Energy Drink', 'Mango Fizz 250ml'],
      growthTrend: '+8.7% YoY',
      growthDirection: 'up'
    },
    {
      name: 'Zenith Distributors',
      segment: 'Wholesale Partner • 91% Retention',
      revContribution: '$18.5 M',
      interestTrend: 'Bulk purchasing of premium fruit-based beverage offerings.',
      buyingFocus: ['Mango Fizz 500ml', 'Aloe Vera Drink'],
      growthTrend: '+4.2% YoY',
      growthDirection: 'up'
    }
  ],
  Snacks: [
    {
      name: 'MetroFoods Group',
      segment: 'Key Account • 97% Retention',
      revContribution: '$19.6 M',
      interestTrend: 'Spike in premium healthy baked items and baked grain products.',
      buyingFocus: ['Oat Cookies', 'Masala Puffs'],
      growthTrend: '+15.3% YoY',
      growthDirection: 'up'
    },
    {
      name: 'Apex Hypermarkets',
      segment: 'Enterprise Chain • 98% Retention',
      revContribution: '$16.8 M',
      interestTrend: 'High volume restocking of classic snack portfolios.',
      buyingFocus: ['BrandB Chips', 'BrandD Chocolate 100g'],
      growthTrend: '+3.4% YoY',
      growthDirection: 'up'
    },
    {
      name: 'Star Retailers',
      segment: 'Mid-Market Chain • 89% Retention',
      revContribution: '$8.4 M',
      interestTrend: 'Margin compression on chocolate products due to promotional shifts.',
      buyingFocus: ['Choco Wafers', 'BrandD Chocolate 250g'],
      growthTrend: '-2.1% YoY',
      growthDirection: 'down'
    }
  ],
  'Personal Care': [
    {
      name: 'Luminate Boutique',
      segment: 'Specialty Retailer • 95% Retention',
      revContribution: '$11.2 M',
      interestTrend: 'Surging demand for organic ingredients and active-SPF hand care.',
      buyingFocus: ['Hand Cream SPF', 'Herbal Shampoo'],
      growthTrend: '+22.4% YoY',
      growthDirection: 'up'
    },
    {
      name: 'GlobalMart Inc',
      segment: 'Enterprise Chain • 96% Retention',
      revContribution: '$14.5 M',
      interestTrend: 'Steady interest in family-pack cleansing and hygiene products.',
      buyingFocus: ['BrandB Soap', 'BrandD Toothpaste'],
      growthTrend: '+6.1% YoY',
      growthDirection: 'up'
    },
    {
      name: 'EcoBeauty Distribs',
      segment: 'Niche Wholesaler • 92% Retention',
      revContribution: '$6.8 M',
      interestTrend: 'Stocking up on foaming cleansers; sensitive skin variants preferred.',
      buyingFocus: ['Foam Face Wash', 'Aloe Face Wash'],
      growthTrend: '+8.2% YoY',
      growthDirection: 'up'
    }
  ],
  Dairy: [
    {
      name: 'MetroFoods Group',
      segment: 'Key Account • 97% Retention',
      revContribution: '$12.4 M',
      interestTrend: 'Expanding premium European cheese inventory across key metro centers.',
      buyingFocus: ['BrandD Cheese Blocks', 'BrandB Yogurt 500g'],
      growthTrend: '+11.2% YoY',
      growthDirection: 'up'
    },
    {
      name: 'Apex Hypermarkets',
      segment: 'Enterprise Chain • 98% Retention',
      revContribution: '$10.5 M',
      interestTrend: 'Steady volume orders for organic and gut-health probiotic brands.',
      buyingFocus: ['BrandB Yogurt 1kg', 'BrandE Yogurt (Straw)'],
      growthTrend: '+4.5% YoY',
      growthDirection: 'up'
    }
  ],
  Household: [
    {
      name: 'GlobalMart Inc',
      segment: 'Enterprise Chain • 96% Retention',
      revContribution: '$18.2 M',
      interestTrend: 'Substantial transition to premium concentrated cleaning capsules.',
      buyingFocus: ['Laundry Pods Premium', 'Dish Soap 1K'],
      growthTrend: '+14.6% YoY',
      growthDirection: 'up'
    },
    {
      name: 'Apex Hypermarkets',
      segment: 'Enterprise Chain • 98% Retention',
      revContribution: '$12.6 M',
      interestTrend: 'Volume restocking of general dish soaps and standard detergents.',
      buyingFocus: ['BrandF Detergent', 'Dish Soap 1K'],
      growthTrend: '+5.3% YoY',
      growthDirection: 'up'
    },
    {
      name: 'QuickCart Convenience',
      segment: 'Regional Chain • 94% Retention',
      revContribution: '$4.8 M',
      interestTrend: 'Decline in fabric softeners due to localized chemical regulatory flags.',
      buyingFocus: ['Fabric Softener', 'Floor Cleaner'],
      growthTrend: '-8.4% YoY',
      growthDirection: 'down'
    }
  ]
};

export const MONTH_FORECAST_DETAILS: Record<string, {
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
}> = {
  Jan: {
    month: "Jan",
    fullName: "January",
    thisYearActual: "$58.0 M",
    thisYearTarget: "$60.0 M",
    lastYearActual: "$51.8 M",
    nextYearForecast: "$65.0 M",
    lastYearPriceIndex: "$142 / unit",
    thisYearPriceIndex: "$148 / unit",
    growthRate: "+12.4% projected",
    aiRecommendations: [
      "Raw material prices are projected to ease in Q1. Pre-negotiate wholesale sugar and packaging contracts to lock in a 4% cost reduction.",
      "Sustain higher marketing allocation for APAC Beverages to offset the slight winter seasonal slowdown.",
      "Transition low-velocity Dairy variants to regional distributors to lower direct administrative complexity."
    ]
  },
  Feb: {
    month: "Feb",
    fullName: "February",
    thisYearActual: "$61.0 M",
    thisYearTarget: "$63.0 M",
    lastYearActual: "$54.5 M",
    nextYearForecast: "$68.3 M",
    lastYearPriceIndex: "$143 / unit",
    thisYearPriceIndex: "$149 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Run cross-promotional campaigns linking Beverages and Snacks to capture post-holiday retail velocity.",
      "Increase safety stock levels by 6% in hypermarkets for top 10 hero SKUs to avoid recurring stockout leakage.",
      "Hold contract pricing corridors stable across Italy and Spain; resist discount pressure from enterprise accounts."
    ]
  },
  Mar: {
    month: "Mar",
    fullName: "March",
    thisYearActual: "$65.0 M",
    thisYearTarget: "$66.0 M",
    lastYearActual: "$58.1 M",
    nextYearForecast: "$72.8 M",
    lastYearPriceIndex: "$144 / unit",
    thisYearPriceIndex: "$151 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Lock in procurement logistics for Q2 peak shipping lanes to hedge against freight rates volatility.",
      "Introduce secondary vendor options for primary flavor concentrates to hedge supply chain lead-time risks.",
      "Prepare shelf layouts for upcoming BrandA Premium Energy launches; secure endcap space with retailers."
    ]
  },
  Apr: {
    month: "Apr",
    fullName: "April",
    thisYearActual: "$70.0 M",
    thisYearTarget: "$70.0 M",
    lastYearActual: "$62.5 M",
    nextYearForecast: "$78.4 M",
    lastYearPriceIndex: "$144 / unit",
    thisYearPriceIndex: "$152 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Monitor raw milk supplier capacity; pre-arrange backup supply agreements to secure gross margin parameters.",
      "Deploy regional price increases of 3.5% on snacks where demand elasticity is low to counter inflation.",
      "Standardize currency hedging contracts to insulate EMEA sales margins from currency fluctuations."
    ]
  },
  May: {
    month: "May",
    fullName: "May",
    thisYearActual: "$74.0 M",
    thisYearTarget: "$74.0 M",
    lastYearActual: "$66.1 M",
    nextYearForecast: "$82.9 M",
    lastYearPriceIndex: "$145 / unit",
    thisYearPriceIndex: "$153 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Run optimization algorithms on regional inventories to balance stock levels across North and West DCs.",
      "Optimize trade promotion depth: enforce a 15% discount cap on cookies and chips to reclaim margin rates.",
      "Accelerate phase-out timelines for low-value sunset candidates to reallocate production floor bandwidth."
    ]
  },
  Jun: {
    month: "Jun",
    fullName: "June",
    thisYearActual: "$77.0 M",
    thisYearTarget: "$76.0 M",
    lastYearActual: "$68.8 M",
    nextYearForecast: "$86.2 M",
    lastYearPriceIndex: "$146 / unit",
    thisYearPriceIndex: "$154 / unit",
    growthRate: "+11.9% projected",
    aiRecommendations: [
      "Implement direct-to-retailer distribution routes in high-density metro corridors to bypass regional depot margins.",
      "Triage competitor pricing moves: match promotional discount frequency, but maintain base list prices.",
      "Leverage summer volume gains by scaling distribution of single-serve mineral water and sports drinks."
    ]
  },
  Jul: {
    month: "Jul",
    fullName: "July",
    thisYearActual: "$80.0 M",
    thisYearTarget: "$80.0 M",
    lastYearActual: "$71.4 M",
    nextYearForecast: "$89.6 M",
    lastYearPriceIndex: "$146 / unit",
    thisYearPriceIndex: "$154 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Conduct midpoint operational reviews of supply sourcing lead times; update DC replenishment schedules.",
      "Consolidate raw material freight carriers to secure bulk shipping lane contract discounts.",
      "Optimize portfolio mix: increase production volume for top-margin items while capping low-velocity lines."
    ]
  },
  Aug: {
    month: "Aug",
    fullName: "August",
    thisYearActual: "$84.0 M",
    thisYearTarget: "$83.0 M",
    lastYearActual: "$75.0 M",
    nextYearForecast: "$94.1 M",
    lastYearPriceIndex: "$147 / unit",
    thisYearPriceIndex: "$155 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Initiate discussions with primary supermarkets for holiday shelf placement commitments.",
      "Pre-position packaging inventory at regional warehouses to avoid shipping congestions.",
      "Analyze customer NPS score feedback; prioritize delivery dispatch speed optimizations in Europe."
    ]
  },
  Sep: {
    month: "Sep",
    fullName: "September",
    thisYearActual: "$88.0 M",
    thisYearTarget: "$86.0 M",
    lastYearActual: "$78.6 M",
    nextYearForecast: "$98.6 M",
    lastYearPriceIndex: "$148 / unit",
    thisYearPriceIndex: "$156 / unit",
    growthRate: "+12.1% projected",
    aiRecommendations: [
      "Negotiate bulk warehouse space leases for Q4 inventory build-ups before spot rental rates spike.",
      "Curb promotional discounts on high-erosion accounts to recover list price margins prior to holidays.",
      "Audit supplier performance indexes; draft performance improvement plans for lagging partners."
    ]
  },
  Oct: {
    month: "Oct",
    fullName: "October",
    thisYearActual: "$91.0 M",
    thisYearTarget: "$90.0 M",
    lastYearActual: "$81.3 M",
    nextYearForecast: "$101.9 M",
    lastYearPriceIndex: "$148 / unit",
    thisYearPriceIndex: "$157 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Execute phased rollouts for regional pricing adjustments on personal care portfolios.",
      "Establish priority freight lanes with logistics providers to secure holiday delivery dispatch windows.",
      "Monitor cannibalization alerts in Snacks; adjust shelf spacing to favor high-margin variants."
    ]
  },
  Nov: {
    month: "Nov",
    fullName: "November",
    thisYearActual: "$92.4 M",
    thisYearTarget: "$93.0 M",
    lastYearActual: "$83.0 M",
    nextYearForecast: "$104.2 M",
    lastYearPriceIndex: "$149 / unit",
    thisYearPriceIndex: "$157 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Run final tests on the upcoming Q1 new product launches; check milestone pipeline readiness.",
      "Maximize distributor shelf inventory depth on high-demand holiday SKU lines.",
      "Ensure Continuous Close audit ledger records are updated; clear all intercompany variances."
    ]
  },
  Dec: {
    month: "Dec",
    fullName: "December",
    thisYearActual: "$95.1 M",
    thisYearTarget: "$96.0 M",
    lastYearActual: "$85.7 M",
    nextYearForecast: "$107.5 M",
    lastYearPriceIndex: "$150 / unit",
    thisYearPriceIndex: "$158 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Review full-year margin and revenue targets; formulate Q1 operational goals and benchmarks.",
      "Leverage year-end volume rebates with raw material suppliers to maximize gross margins.",
      "Prepare portfolio rationalization lists for phase-out rollouts in the new fiscal year."
    ]
  }
};

// Month Forecast Modal Component

export const EVENT_TEMPLATES = [
  { sev: 'info', sevC: '#3b82f6', type: 'Demand', msgs: ['Mango Fizz 500ml — reorder triggered: 12,000 units', 'E-Commerce channel orders up 18% in last 2hrs', 'Oat Cookies demand spike detected — APAC region', 'Customer return rate dropped to 1.2% — all categories'] },
  { sev: 'warning', sevC: '#f59e0b', type: 'Supply', msgs: ['Fabric Softener stock level below safety threshold', 'Lead time breach — supplier notification sent', 'Cold chain temperature alert — Mumbai DC resolved', 'Freight cost increase 4% — Mumbai to Bangalore lane'] },
  { sev: 'critical', sevC: '#ef4444', type: 'Margin', msgs: ['Margin erosion detected: Green Tea RTD promo overlap', 'Price floor breach on Choco Wafers — auto-flagged', 'Promotional budget 83% consumed — 14 days remaining', 'Cost variance alert: packaging +7% vs budget'] },
  { sev: 'info', sevC: '#10b981', type: 'Finance', msgs: ['Invoice cleared: Supplier ID #4821 — $2.3 M', 'Revenue milestone: $850 M MTD achieved', 'GST reconciliation complete — no discrepancies', 'Quarterly audit trail generated and archived'] },
  { sev: 'info', sevC: '#8b5cf6', type: 'Launch', msgs: ['Mango Fizz 750ml — shelf placement confirmed: 240 stores', 'Launch readiness score updated: 82/100', 'Market test: Herbal Shampoo new variant — positive signal', 'NPD gate review scheduled: Thursday 10:00 AM'] },
];

export const generateInitialEvents = () => {
  const list = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const tmpl = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
    const msg = tmpl.msgs[Math.floor(Math.random() * tmpl.msgs.length)];
    const timeObj = new Date(now.getTime() - i * 60000);
    const timeStr = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    list.push({
      id: 'init-' + i + '-' + Date.now(),
      sev: tmpl.sev,
      sevC: tmpl.sevC,
      type: tmpl.type,
      msg,
      time: timeStr
    });
  }
  return list;
};

export const FLAGGED_SKUS = [
  { name: 'Premium Cold Brew 250ml', reason: 'Revenue decline', value: '-18.2%', color: '#ef4444', pct: 80, isRed: true },
  { name: 'BrandB Chips', reason: 'Margin decline', value: '-6.2 pts', color: '#f59e0b', pct: 60, isRed: false },
  { name: 'Organic Whole Milk 1K', reason: 'Sentiment drop', value: '3.2 / 5', color: '#ef4444', pct: 62, isRed: true },
  { name: 'Mango Fizz 500ml', reason: 'Revenue decline', value: '-9.1%', color: '#f59e0b', pct: 45, isRed: false },
  { name: 'Toilet Paper 12-Pack', reason: 'Stockout risk', value: 'High', color: '#f59e0b', pct: 38, isRed: false },
];
