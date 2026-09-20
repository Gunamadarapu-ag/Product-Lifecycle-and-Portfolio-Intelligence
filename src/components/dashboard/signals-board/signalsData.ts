/**
 * Shared data and types for the Signals Board.
 *
 * Extracted from the original 3,982-line SignalsBoard.tsx.
 */
import React from 'react';


export const RECIPIENT_TITLES: Record<string, string> = {
  'ananya.sen@aciesglobal.com': 'VP Finance',
  'vikram.solanki@aciesglobal.com': 'QC Manager & Logistics Lead',
  'priya.sharma@aciesglobal.com': 'Product Manager',
  'rajendra.patel@aciesglobal.com': 'Vapi Hub Director',
  'amit.verma@aciesglobal.com': 'NPD Lead',
  'karan.johar@aciesglobal.com': 'Retail Relations Director'
};

export interface Signal {
  id: number;
  title: string;
  sev: 'critical' | 'warning' | 'info';
  type: string;
  detail: string;
  ack: boolean;
}

export interface InboxMessage {
  id: number;
  from: string;
  fromInitials: string;
  fromColor: string;
  type: 'email' | 'message';
  subject: string;  body: string;
  time: string;
  read: boolean;
}

export const skuComparisonData: Record<string, {
  you: {
    name: string;
    brand: string;
    priceHistory: string;
    prices: number[];
    campaigns: number;
    discountPill: string;
    availability: string;
    availabilityPct: number;
    trend: string;
  };
  rival1: {
    name: string;
    desc: string;
    priceHistory: string;
    prices: number[];
    campaigns: number;
    discountPill: string;
    availability: string;
    availabilityPct: number;
    trend: string;
  };
  rival2: {
    name: string;
    desc: string;
    priceHistory: string;
    prices: number[];
    campaigns: number;
    discountPill: string;
    availability: string;
    availabilityPct: number;
    trend: string;
  };
  alerts: string[];
}> = {
  Lays: {
    you: {
      name: "Lay's Classic 52g",
      brand: "PepsiCo",
      priceHistory: "₹20 → ₹20",
      prices: [8, 8, 5, 8, 3, 8, 8],
      campaigns: 4,
      discountPill: "Balanced – moderate, rotating promos",
      availability: "In stock",
      availabilityPct: 92,
      trend: "Up 10% vs last quarter"
    },
    rival1: {
      name: "Frito Balaji",
      desc: "Direct chips competitor • Metro & Tier 2",
      priceHistory: "₹19 → ₹21",
      prices: [5, 5, 7, 5, 6, 8, 10],
      campaigns: 6,
      discountPill: "Deep & rare – 20-25% off, ~5x/qtr",
      availability: "In stock",
      availabilityPct: 96,
      trend: "Up 30% vs last quarter"
    },
    rival2: {
      name: "Haldiram's",
      desc: "Namkeen / adjacent snacking • All markets",
      priceHistory: "₹18 → ₹18",
      prices: [4, 4, 4, 4, 6, 6, 6],
      campaigns: 1,
      discountPill: "Rarely discounts – trust-led, not price-led",
      availability: "Limited SKUs",
      availabilityPct: 78,
      trend: "Flat, no change"
    },
    alerts: [
      "You're 11% pricier than Haldiram's right now on current price.",
      "Haldiram's has availability gaps (78% of outlets) — a distribution push here can win shelf space without touching price.",
      "You're 67% pricier than Store-brand Chips right now on current price.",
      "Store-brand Chips has availability gaps (61% of outlets) — a distribution push here can win shelf space without touching price.",
      "Store-brand Chips is running 11 campaigns/quarter vs your 4 — they're out-pacing you on frequency, not just depth."
    ]
  },
  Doritos: {
    you: {
      name: "Doritos Nacho Cheese 60g",
      brand: "PepsiCo",
      priceHistory: "₹30 → ₹30",
      prices: [10, 10, 8, 10, 6, 10, 10],
      campaigns: 5,
      discountPill: "High-margin premium – selective promos",
      availability: "In stock",
      availabilityPct: 95,
      trend: "Up 15% vs last quarter"
    },
    rival1: {
      name: "Frito Balaji",
      desc: "Direct chips competitor • Metro & Tier 2",
      priceHistory: "₹28 → ₹32",
      prices: [7, 7, 9, 8, 8, 9, 10],
      campaigns: 7,
      discountPill: "Deep & rare – 20-25% off, ~5x/qtr",
      availability: "In stock",
      availabilityPct: 94,
      trend: "Up 25% vs last quarter"
    },
    rival2: {
      name: "Haldiram's",
      desc: "Namkeen / adjacent snacking • All markets",
      priceHistory: "₹25 → ₹25",
      prices: [6, 6, 6, 6, 8, 8, 8],
      campaigns: 2,
      discountPill: "Value pricing – moderate promos",
      availability: "Limited SKUs",
      availabilityPct: 80,
      trend: "Flat, no change"
    },
    alerts: [
      "You're 20% pricier than Haldiram's right now on current price.",
      "Haldiram's has availability gaps (80% of outlets) — a distribution push here can win shelf space without touching price.",
      "You're 66% pricier than Store-brand Chips right now on current price.",
      "Store-brand Chips has availability gaps (65% of outlets) — a distribution push here can win shelf space without touching price.",
      "Store-brand Chips is running 14 campaigns/quarter vs your 5 — they're out-pacing you on frequency, not just depth."
    ]
  },
  Kurkure: {
    you: {
      name: "Kurkure Masala Munch 50g",
      brand: "PepsiCo",
      priceHistory: "₹15 → ₹15",
      prices: [6, 6, 4, 6, 3, 6, 6],
      campaigns: 3,
      discountPill: "Mass market – high volume strategy",
      availability: "In stock",
      availabilityPct: 90,
      trend: "Up 5% vs last quarter"
    },
    rival1: {
      name: "Frito Balaji",
      desc: "Direct chips competitor • Metro & Tier 2",
      priceHistory: "₹14 → ₹16",
      prices: [4, 4, 5, 4, 5, 6, 7],
      campaigns: 5,
      discountPill: "Moderate – seasonal discounts",
      availability: "In stock",
      availabilityPct: 95,
      trend: "Up 35% vs last quarter"
    },
    rival2: {
      name: "Haldiram's",
      desc: "Namkeen / adjacent snacking • All markets",
      priceHistory: "₹12 → ₹12",
      prices: [3, 3, 3, 3, 4, 4, 4],
      campaigns: 1,
      discountPill: "Lowest price – bare minimum discounts",
      availability: "Limited SKUs",
      availabilityPct: 75,
      trend: "Flat, no change"
    },
    alerts: [
      "You're 25% pricier than Haldiram's right now on current price.",
      "Haldiram's has availability gaps (75% of outlets) — a distribution push here can win shelf space without touching price.",
      "You're 50% pricier than Store-brand Chips right now on current price.",
      "Store-brand Chips has availability gaps (60% of outlets) — a distribution push here can win shelf space without touching price.",
      "Store-brand Chips is running 9 campaigns/quarter vs your 3 — they're out-pacing you on frequency, not just depth."
    ]
  }
};

export interface VPSignal {
  id: string;
  title: string;
  category: string;
  region: string;
  type: 'Risk' | 'Opportunity' | 'Competitor' | 'Sentiment' | 'Supply' | 'Portfolio';
  severity: 'critical' | 'warning' | 'info';
  impact: string;
  detail: string;
  ack: boolean;
  refCode: string;
  trigger: string;
  rectification: string;
}

export const VP_SIGNALS_DATA: VPSignal[] = [
  { 
    id: 'S01', 
    title: 'Demand spike in APAC Beverages', 
    category: 'Beverages', 
    region: 'APAC', 
    type: 'Opportunity', 
    severity: 'critical', 
    impact: '$1.2M Revenue Opportunity', 
    detail: 'Beverages volume trending +18% YoY in APAC. Sourcing buffers are currently insufficient to cover this demand shift.', 
    ack: false, 
    refCode: 'BEV-APAC-01',
    trigger: 'A sharp 18% YoY volume spike in Q2 consumer consumption tracking across major APAC retail networks.',
    rectification: 'Re-route 15,000 units of safety stock from Western warehouses to Vapi Hub and expand peak packaging throughput.'
  },
  { 
    id: 'S02', 
    title: 'Packaging Material Shortage', 
    category: 'Snacks', 
    region: 'EMEA', 
    type: 'Risk', 
    severity: 'critical', 
    impact: '15d Launch Delay', 
    detail: 'Organic packaging supplier in Germany locked down. BrandC Biscuits Eco launch target at risk.', 
    ack: false, 
    refCode: 'SNC-EMEA-02',
    trigger: 'Sudden local environmental regulatory hold and supplier factory lockdown at German eco-carton supplier.',
    rectification: 'Onboard pre-qualified regional packaging vendor in Poland and fast-track quality verification loops.'
  },
  { 
    id: 'S03', 
    title: 'Competitor price reduction', 
    category: 'Snacks', 
    region: 'EMEA', 
    type: 'Competitor', 
    severity: 'warning', 
    impact: 'Market Share Risk', 
    detail: 'Competitor B cut price of Wafers by 10% in Europe. Category gross margin target under pressure.', 
    ack: false, 
    refCode: 'COMP-EMEA-03',
    trigger: 'Competitor B initiated an aggressive 10% price promotion across discount grocery channels in EU supermarkets.',
    rectification: 'Trigger a cross-category bundle campaign (Yogurt + BrandC Cookies) to shield customer grocery basket value.'
  },
  { 
    id: 'S04', 
    title: 'Social sentiment decline', 
    category: 'Personal Care', 
    region: 'Americas', 
    type: 'Sentiment', 
    severity: 'warning', 
    impact: 'Brand Equity Risk', 
    detail: 'Social mentions for Personal Care lines dropped by 14% post-artwork revision. Packaging aesthetics cited as key factor.', 
    ack: false, 
    refCode: 'SENT-AMER-04',
    trigger: 'Negative online reviews and social media mentions spike citing poor ergonomics and artwork changes on new personal care bottles.',
    rectification: 'Revert bottle packaging layout to classic artwork template and schedule target consumer feedback focus groups.'
  },
  { 
    id: 'S05', 
    title: 'Raw material shortage', 
    category: 'Household', 
    region: 'India', 
    type: 'Supply', 
    severity: 'critical', 
    impact: '$800K Revenue Risk', 
    detail: 'Active surfactant supplier constraint in domestic market. Alternate local validation recommended.', 
    ack: false, 
    refCode: 'SUPP-IND-05',
    trigger: 'Primary chemical raw materials processing line breakdown at our domestic supplier in Western India.',
    rectification: 'Qualify and onboard backup regional raw materials manufacturer in Gujarat within 10 days to fill inventory gap.'
  },
  { 
    id: 'S06', 
    title: 'Product Cannibalization Alert', 
    category: 'Beverages', 
    region: 'India', 
    type: 'Portfolio', 
    severity: 'warning', 
    impact: 'Margin Leakage', 
    detail: 'Mango Fizz 250ml and 500ml variants show -0.62 promotional correlation. Variant shelf rationalization required.', 
    ack: false, 
    refCode: 'PORT-IND-06',
    trigger: 'Overlapping promotional cycles showing high cross-substitution (-0.62 correlation) between 250ml and 500ml variants.',
    rectification: 'Consolidate promotional funding onto the 500ml high-margin pack size and phase out overlapping 250ml discount runs.'
  },
  { 
    id: 'S07', 
    title: 'NPS Score Decline', 
    category: 'Snacks', 
    region: 'EMEA', 
    type: 'Sentiment', 
    severity: 'info', 
    impact: 'Customer Satisfaction Drop', 
    detail: 'Snacks segment NPS fell from 74 to 71 in Europe due to recent logistics delays. Core product quality scores stable.', 
    ack: false, 
    refCode: 'SENT-EMEA-07',
    trigger: 'Extended shipping logistics port bottlenecks in Rotterdam causing 5-day delivery delays to major retail stores.',
    rectification: 'Pre-position finished goods buffer stock at secondary warehouse in Germany to stabilize localized supply rates.'
  },
  { 
    id: 'S08', 
    title: 'Competitor launch in India', 
    category: 'Beverages', 
    region: 'India', 
    type: 'Competitor', 
    severity: 'info', 
    impact: 'Market Competitiveness', 
    detail: 'Rival brand launched Organic Green Tea SKU in West region. Pricing aligns with our mid-tier line.', 
    ack: false, 
    refCode: 'COMP-IND-08',
    trigger: 'Competitor launched a new Organic Green Tea SKU in Western region supermarkets, matching our pricing structure.',
    rectification: 'Enhance regional shelf-display visibility and coordinate a co-marketing campaign highlighting our local packaging origin.'
  },
  { 
    id: 'S09', 
    title: 'Logistics bottleneck at port', 
    category: 'Personal Care', 
    region: 'APAC', 
    type: 'Supply', 
    severity: 'warning', 
    impact: '10d Lead Time Extension', 
    detail: 'APAC port gridlock causing shipment lag on personal care materials. Pre-positioned buffer stock recommended.', 
    ack: false, 
    refCode: 'SUPP-APAC-09',
    trigger: 'Major maritime cargo transit gridlock and customs clearance backlog at the Shanghai port hubs.',
    rectification: 'Divert upcoming raw materials shipments to secondary ports and pre-position buffer stock at the local hub.'
  },
  { 
    id: 'S10', 
    title: 'Growing market demand shift', 
    category: 'Household', 
    region: 'Americas', 
    type: 'Opportunity', 
    severity: 'warning', 
    impact: '$600K Revenue Opportunity', 
    detail: 'Americas household category demand increased 24% in South region. Eco-friendly line under-distributed.', 
    ack: false, 
    refCode: 'OPP-AMER-10',
    trigger: 'Sustained 24% consumer demand surge for biodegradable cleaning products in Southern Americas retail stores.',
    rectification: 'Expand regional distribution network agreements to place eco-friendly household detergents in 120 new outlets.'
  }
];
