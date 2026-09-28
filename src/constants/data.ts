/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PortfolioItem,
  Agent,
  KPI,
  ChannelData,
  RegionalData,
  StockoutItem,
  RationalizationScenario,
  PCIDriver,
  TopSKU,
  VPAlert,
  VPApproval,
  VPForecast,
  SKU,
} from '../types/dashboard';
import {
  GENERATED_KPI_VALUES,
  GENERATED_REGIONAL_DATA,
  GENERATED_CHANNEL_DATA,
  GENERATED_PCI_DRIVERS,
  GENERATED_STOCKOUT_TOP10,
  GENERATED_TOP_SKUS_REVENUE,
  GENERATED_RATIONALIZATION_SCENARIOS,
} from './generated';

// ─── KPI Strip (8 cards) ─────────────────────────────────────────────────────
// Values sourced from extracted_text.txt (Colab Notebook analysis)
const KPIS_SEED: KPI[] = [
  {
    label: 'Net Sales (Portfolio)',
    value: '$473M',
    trend: 'up',
    trendValue: '+8.3% YoY',
    info: 'Total portfolio net sales across all 7 markets and 4 channels. Direct from transaction data.',
    highlight: ['VP Product Management'],
  },
  {
    label: 'Avg Gross Margin',
    value: '38.53%',
    trend: 'down',
    trendValue: '−0.4% vs bench',
    info: 'Portfolio average gross margin. 12 high-volume SKUs are diluting this below the 40% target.',
    highlight: ['Pricing and Margin Partner'],
  },
  {
    label: 'Revenue Concentration',
    value: '27.81%',
    trend: 'neutral',
    trendValue: 'Top 10% SKUs',
    info: 'Top 10% of SKUs (10 items) drive 27.81% of total revenue. Top 30% drive 62.88%.',
    highlight: ['VP Product Management'],
  },
  {
    label: 'Portfolio PCI',
    value: '0.5509',
    trend: 'up',
    isRisk: true,
    trendValue: '+0.02 vs prior',
    info: 'Portfolio Complexity Index. Dominated by Supplier Fragmentation (1.20) and SKU Proliferation (1.02). Target ≤ 0.42.',
    highlight: ['VP Product Management'],
  },
  {
    label: 'Long-Tail SKU Burden',
    value: '66.7%',
    trend: 'up',
    isRisk: true,
    trendValue: '68 SKUs <1% rev',
    info: '66.7% of SKUs contribute <1% of revenue each but consume 100% of supplier administrative overhead.',
    highlight: ['Product Manager'],
  },
  {
    label: 'Rationalize Candidates',
    value: '35 SKUs',
    trend: 'up',
    isRisk: true,
    trendValue: '−27.08% tail risk',
    info: 'Low Value / High Complexity. Full removal cuts safety stock by 42.2% but introduces 27.08% revenue tail risk.',
    highlight: ['Product Manager'],
  },
  {
    label: 'Peak Stockout Freq.',
    value: '440 events',
    trend: 'up',
    isRisk: true,
    trendValue: 'BrandC Biscuits',
    info: 'Highest stockout frequency in portfolio: BrandC Biscuits (440) and BrandF Soap (440). Supply chain fragility signal.',
    highlight: ['Product Manager'],
  },
  {
    label: 'Revenue Tail Risk',
    value: '27.08%',
    trend: 'up',
    isRisk: true,
    trendValue: 'Full Rat. scenario',
    info: 'Maximum revenue at risk if all 35 "Rationalize" segment SKUs are removed simultaneously.',
    highlight: ['Pricing and Margin Partner'],
  },
];

// ─── Segment Colors ───────────────────────────────────────────────────────────
/**
 * KPI cards. Labels, tooltips and role highlighting stay authored here; the
 * numbers come from the generated dataset so they cannot drift from the data.
 */
export const KPIS: KPI[] = KPIS_SEED.map(kpi => {
  const computed = GENERATED_KPI_VALUES[kpi.label];
  return computed ? { ...kpi, value: computed.value, trendValue: computed.trendValue } : kpi;
});

// ─── Portfolio Data (25 SKUs across all 4 segments) ───────────────────────────
// Derived from Q1, Q4, Q5, Q10, Q21, Q27 of extracted_text.txt
// value = Commercial Value Score 0-100 (norm revenue+margin+growth+stability)
// complexity = Operational Complexity Score 0-100 (norm leadtime+supplier+promo+stockout+volatility)
export const PORTFOLIO_DATA: PortfolioItem[] = [
  // KEEP — High Value / Low Complexity (35 SKUs in dataset; showing 9 representatives)
  { name: 'BrandF Water',        category: 'Beverages',     margin: 40.0, growth: 12.4, netSales: 17.03, value: 88, complexity: 14, segment: 'Keep',        stage: 'Growth',   stockouts: 210, promoDep: 18.2, leadTime: 5.1, promoErosion: 4.2 },
  { name: 'BrandB Chips',        category: 'Snacks',        margin: 39.8, growth:  5.4, netSales: 13.03, value: 74, complexity: 22, segment: 'Keep',        stage: 'Maturity', stockouts: 245, promoDep: 19.5, leadTime: 5.3, promoErosion: 5.0 },
  { name: 'BrandB Soap',         category: 'Personal Care', margin: 40.0, growth:  4.2, netSales: 12.50, value: 80, complexity: 12, segment: 'Keep',        stage: 'Maturity', stockouts: 200, promoDep: 17.8, leadTime: 5.0, promoErosion: 3.8 },
  { name: 'BrandD Cheese',       category: 'Dairy',         margin: 39.5, growth:  6.1, netSales: 11.20, value: 76, complexity: 18, segment: 'Keep',        stage: 'Maturity', stockouts: 220, promoDep: 16.4, leadTime: 5.2, promoErosion: 4.5 },
  { name: 'BrandD Toothpaste',   category: 'Personal Care', margin: 39.2, growth:  7.3, netSales: 10.80, value: 73, complexity: 16, segment: 'Keep',        stage: 'Growth',   stockouts: 198, promoDep: 15.9, leadTime: 4.9, promoErosion: 4.1 },
  { name: 'BrandA Cheese',       category: 'Dairy',         margin: 38.9, growth:  3.8, netSales:  9.60, value: 70, complexity: 20, segment: 'Keep',        stage: 'Maturity', stockouts: 215, promoDep: 16.1, leadTime: 5.1, promoErosion: 4.9 },
  { name: 'BrandB Detergent',    category: 'Home Care',     margin: 39.1, growth:  4.5, netSales:  9.20, value: 68, complexity: 24, segment: 'Keep',        stage: 'Maturity', stockouts: 230, promoDep: 17.0, leadTime: 5.4, promoErosion: 5.2 },
  { name: 'BrandF Detergent',    category: 'Home Care',     margin: 38.8, growth:  2.9, netSales:  8.50, value: 65, complexity: 19, segment: 'Keep',        stage: 'Maturity', stockouts: 208, promoDep: 15.5, leadTime: 5.0, promoErosion: 4.6 },
  { name: 'BrandC Energy Drink', category: 'Beverages',     margin: 39.4, growth:  9.2, netSales:  8.10, value: 69, complexity: 17, segment: 'Keep',        stage: 'Growth',   stockouts: 190, promoDep: 14.8, leadTime: 4.8, promoErosion: 3.9 },

  // GROW — High Value / High Complexity (16 SKUs; showing 4 representatives)
  { name: 'BrandC Chips',        category: 'Snacks',        margin: 36.2, growth: 18.2, netSales: 16.00, value: 78, complexity: 68, segment: 'Grow',        stage: 'Growth',   stockouts: 320, promoDep: 25.1, leadTime: 6.1, promoErosion: 11.2 },
  { name: 'BrandC Toothpaste',   category: 'Personal Care', margin: 35.8, growth: 14.6, netSales: 12.97, value: 72, complexity: 74, segment: 'Grow',        stage: 'Growth',   stockouts: 340, promoDep: 27.59, leadTime: 6.2, promoErosion: 15.49 },
  { name: 'BrandA Soda',         category: 'Beverages',     margin: 36.1, growth: 22.1, netSales: 11.80, value: 68, complexity: 72, segment: 'Grow',        stage: 'Maturity', stockouts: 397, promoDep: 24.3, leadTime: 6.5, promoErosion: 12.0 },
  { name: 'BrandD Chocolate',    category: 'Snacks',        margin: 36.2, growth: 15.3, netSales:  9.90, value: 64, complexity: 78, segment: 'Grow',        stage: 'Growth',   stockouts: 416, promoDep: 22.8, leadTime: 6.3, promoErosion: 10.5 },

  // CONSOLIDATE — Low Value / Low Complexity (16 SKUs; showing 4 representatives)
  { name: 'BrandE Cheese',       category: 'Dairy',         margin: 38.6, growth:  3.1, netSales:  0.85, value: 32, complexity: 38, segment: 'Consolidate', stage: 'Maturity', stockouts: 405, promoDep: 27.68, leadTime: 5.8, promoErosion: 8.4 },
  { name: 'BrandD Nuts',         category: 'Snacks',        margin: 35.9, growth:  2.8, netSales:  2.10, value: 28, complexity: 42, segment: 'Consolidate', stage: 'Maturity', stockouts: 280, promoDep: 20.5, leadTime: 5.6, promoErosion: 7.2 },
  { name: 'BrandF Energy Drink', category: 'Beverages',     margin: 37.2, growth:  1.5, netSales:  2.50, value: 30, complexity: 35, segment: 'Consolidate', stage: 'Maturity', stockouts: 255, promoDep: 19.2, leadTime: 5.5, promoErosion: 6.8 },
  { name: 'BrandB Chocolate',    category: 'Snacks',        margin: 36.8, growth:  2.2, netSales:  3.20, value: 34, complexity: 40, segment: 'Consolidate', stage: 'Maturity', stockouts: 310, promoDep: 27.59, leadTime: 5.7, promoErosion: 9.1 },

  // RATIONALIZE — Low Value / High Complexity (35 SKUs; showing 8 representatives)
  { name: 'BrandF Soda',         category: 'Beverages',     margin: 36.3, growth: -8.2, netSales:  2.02, value: 18, complexity: 90, segment: 'Rationalize', stage: 'Decline',  stockouts: 393, promoDep: 26.1, leadTime: 6.4, promoErosion: 13.1 },
  { name: 'BrandA Chocolate',    category: 'Snacks',        margin: 35.8, growth: -5.2, netSales:  1.80, value: 15, complexity: 88, segment: 'Rationalize', stage: 'Decline',  stockouts: 392, promoDep: 24.7, leadTime: 6.5, promoErosion: 13.8 },
  { name: 'BrandD Water',        category: 'Beverages',     margin: 35.9, growth: -3.8, netSales:  3.10, value: 22, complexity: 85, segment: 'Rationalize', stage: 'Decline',  stockouts: 378, promoDep: 27.97, leadTime: 6.4, promoErosion: 14.1 },
  { name: 'BrandE Water',        category: 'Beverages',     margin: 35.9, growth: -2.1, netSales:  2.23, value: 20, complexity: 82, segment: 'Rationalize', stage: 'Decline',  stockouts: 360, promoDep: 25.4, leadTime: 6.3, promoErosion: 12.9 },
  { name: 'BrandA Softener',     category: 'Home Care',     margin: 35.8, growth:  1.2, netSales:  1.40, value: 16, complexity: 92, segment: 'Rationalize', stage: 'Maturity', stockouts: 293, promoDep: 23.1, leadTime: 6.5, promoErosion: 13.5 },
  { name: 'BrandE Juice',        category: 'Beverages',     margin: 36.4, growth: -4.5, netSales:  1.65, value: 19, complexity: 84, segment: 'Rationalize', stage: 'Decline',  stockouts: 345, promoDep: 27.62, leadTime: 6.2, promoErosion: 14.2 },
  { name: 'BrandB Yogurt',       category: 'Dairy',         margin: 37.1, growth: -1.5, netSales:  1.20, value: 14, complexity: 80, segment: 'Rationalize', stage: 'Decline',  stockouts: 350, promoDep: 22.8, leadTime: 6.0, promoErosion: 11.4 },
  { name: 'BrandC Water',        category: 'Beverages',     margin: 36.0, growth: -2.9, netSales:  1.75, value: 17, complexity: 86, segment: 'Rationalize', stage: 'Decline',  stockouts: 330, promoDep: 24.5, leadTime: 6.3, promoErosion: 12.5 },
];

// ─── Channel Performance (Q17/Q18) ───────────────────────────────────────────
/**
 * Computed from the generated dataset - see src/constants/generated.ts
 *
 * NOT RENDERED ANYWHERE. Its only consumer was the deleted Express server,
 * so the dashboard still shows hardcoded values for this. Wiring it is TODO O7.
 */
export const CHANNEL_DATA: ChannelData[] = GENERATED_CHANNEL_DATA;

// ─── Regional Data (Q16) ─────────────────────────────────────────────────────
/** Computed from the generated dataset - see src/constants/generated.ts */
export const REGIONAL_DATA: RegionalData[] = GENERATED_REGIONAL_DATA;

// ─── Top 10 Stockout SKUs (Q11 + Q12) ────────────────────────────────────────
/**
 * Computed from the generated dataset - see src/constants/generated.ts
 *
 * NOT RENDERED ANYWHERE. Its only consumer was the deleted Express server,
 * so the dashboard still shows hardcoded values for this. Wiring it is TODO O7.
 */
export const STOCKOUT_TOP10: StockoutItem[] = GENERATED_STOCKOUT_TOP10;

// ─── Rationalization Scenarios (Q28-Q30) ─────────────────────────────────────
/**
 * Computed from the generated dataset - see src/constants/generated.ts
 *
 * NOT RENDERED ANYWHERE. Its only consumer was the deleted Express server,
 * so the dashboard still shows hardcoded values for this. Wiring it is TODO O7.
 */
export const RATIONALIZATION_SCENARIOS: RationalizationScenario[] = GENERATED_RATIONALIZATION_SCENARIOS;

// ─── PCI Sub-Drivers (Q25) ───────────────────────────────────────────────────
/**
 * Computed from the generated dataset - see src/constants/generated.ts
 *
 * NOT RENDERED ANYWHERE. Its only consumer was the deleted Express server,
 * so the dashboard still shows hardcoded values for this. Wiring it is TODO O7.
 */
export const PCI_DRIVERS: PCIDriver[] = GENERATED_PCI_DRIVERS;

// ─── Top SKUs by Revenue (Q1) ─────────────────────────────────────────────────
/**
 * Computed from the generated dataset - see src/constants/generated.ts
 *
 * NOT RENDERED ANYWHERE. Its only consumer was the deleted Express server,
 * so the dashboard still shows hardcoded values for this. Wiring it is TODO O7.
 */
export const TOP_SKUS_REVENUE: TopSKU[] = GENERATED_TOP_SKUS_REVENUE;

// ─── Agent Roster ─────────────────────────────────────────────────────────────
export const AGENT_ROSTER: Agent[] = [
  { name: 'Portfolio Agent',     role: 'Monitors 100 SKUs; flagged Dairy as highest drag (27.78%).' },
  { name: 'Market Signal Agent', role: 'Tracks promo dependency; BrandD Water at 27.97% — highest in portfolio.' },
  { name: 'Supplier Agent',      role: 'Identified 60 universal suppliers creating interconnectivity risk (0% reducible).' },
  { name: 'Profitability Agent', role: '12 high-volume SKUs diluting portfolio margin to 38.53% vs 40% target.' },
  { name: 'Sunset Agent',        role: 'Removing 35 "Rationalize" SKUs frees 42.2% safety stock capital ($246M → $142M).' },
];

export const TABS = [
  { id: 0, name: 'HOME' },
  { id: 1, name: 'Portfolio Health Map' },
  { id: 2, name: 'Launch Readiness' },
  { id: 3, name: 'Profitability Tree' },
  { id: 4, name: 'SKU Rationalization' },
  { id: 5, name: 'Signals Board' },
  { id: 6, name: 'Top-Down Drilldown' },
  { id: 7, name: 'Agent Orchestrator' },
  { id: 8, name: 'SKU Assortment' },
  { id: 9, name: 'Rationalisation Home' },
  { id: 10, name: 'SKU Drill Down' },
  { id: 11, name: 'Task Tracker' },
];

export const SKUS = [
  // Beverages
  // householdPenetration: measured as fraction of target households regularly purchasing (sourced from Nielsen-style panel data proxy)
  {name:'Mango Fizz 500ml',       cat:'Beverages',    rev:142, val:0.82, cx:0.31, stockouts:1, promo:0.28, margin:41, growth:0.18,  lead:14, householdPenetration:0.68},
  {name:'Mango Fizz 250ml',       cat:'Beverages',    rev:84,  val:0.62, cx:0.35, stockouts:2, promo:0.41, margin:38, growth:0.12,  lead:14, householdPenetration:0.52},
  {name:'Aloe Vera Drink',        cat:'Beverages',    rev:98,  val:0.68, cx:0.44, stockouts:3, promo:0.51, margin:34, growth:0.09,  lead:18, householdPenetration:0.45},
  {name:'Green Tea RTD',          cat:'Beverages',    rev:76,  val:0.59, cx:0.58, stockouts:4, promo:0.62, margin:29, growth:-0.04, lead:22, householdPenetration:0.28},
  {name:'Coconut Water 330ml',    cat:'Beverages',    rev:110, val:0.75, cx:0.25, stockouts:1, promo:0.18, margin:45, growth:0.22,  lead:10, householdPenetration:0.72},
  {name:'Coconut Water 1K',       cat:'Beverages',    rev:68,  val:0.65, cx:0.42, stockouts:2, promo:0.35, margin:42, growth:0.14,  lead:11, householdPenetration:0.58},
  {name:'BrandC Energy Drink',    cat:'Beverages',    rev:92,  val:0.71, cx:0.38, stockouts:1, promo:0.25, margin:44, growth:0.26,  lead:12, householdPenetration:0.65},
  {name:'BrandC Diet Cola 500ml', cat:'Beverages',    rev:112, val:0.74, cx:0.28, stockouts:1, promo:0.24, margin:43, growth:0.14,  lead:12, householdPenetration:0.64},
  {name:'BrandC Orange Soda 500ml',cat:'Beverages',   rev:95,  val:0.68, cx:0.32, stockouts:2, promo:0.31, margin:40, growth:0.08,  lead:12, householdPenetration:0.55},
  {name:'Premium Cold Brew 250ml',cat:'Beverages',    rev:130, val:0.81, cx:0.45, stockouts:1, promo:0.15, margin:48, growth:0.25,  lead:16, householdPenetration:0.48},
  {name:'Organic Lemonade 1K',    cat:'Beverages',    rev:85,  val:0.63, cx:0.38, stockouts:3, promo:0.35, margin:37, growth:0.06,  lead:14, householdPenetration:0.42},
  {name:'Pomegranate Juice 1K',   cat:'Beverages',    rev:72,  val:0.54, cx:0.52, stockouts:4, promo:0.48, margin:33, growth:-0.02, lead:18, householdPenetration:0.32},
  {name:'Apple Juice Box 6-Pack', cat:'Beverages',    rev:105, val:0.72, cx:0.26, stockouts:1, promo:0.20, margin:39, growth:0.10,  lead:10, householdPenetration:0.67},
  {name:'BrandC Sugar Free Energy',cat:'Beverages',   rev:88,  val:0.69, cx:0.40, stockouts:2, promo:0.28, margin:42, growth:0.18,  lead:12, householdPenetration:0.49},
  {name:'Ginger Beer 4-Pack',     cat:'Beverages',    rev:64,  val:0.50, cx:0.48, stockouts:3, promo:0.38, margin:35, growth:0.04,  lead:15, householdPenetration:0.38},
  {name:'Tonic Water 1K',         cat:'Beverages',    rev:55,  val:0.45, cx:0.30, stockouts:2, promo:0.25, margin:38, growth:0.02,  lead:10, householdPenetration:0.44},
  {name:'Sparkling Water Lime 500ml',cat:'Beverages', rev:118, val:0.76, cx:0.22, stockouts:1, promo:0.12, margin:44, growth:0.21,  lead:8,  householdPenetration:0.70},
  {name:'Sparkling Water Berry 500ml',cat:'Beverages',rev:110, val:0.73, cx:0.24, stockouts:2, promo:0.14, margin:43, growth:0.19,  lead:8,  householdPenetration:0.68},
  {name:'Peach Iced Tea 500ml',   cat:'Beverages',    rev:82,  val:0.60, cx:0.36, stockouts:2, promo:0.34, margin:36, growth:0.07,  lead:12, householdPenetration:0.51},
  {name:'Matcha Latte RTD',       cat:'Beverages',    rev:50,  val:0.38, cx:0.65, stockouts:4, promo:0.55, margin:30, growth:-0.05, lead:20, householdPenetration:0.20},
  {name:'Almond Milk Latte RTD',  cat:'Beverages',    rev:78,  val:0.58, cx:0.48, stockouts:3, promo:0.42, margin:35, growth:0.12,  lead:15, householdPenetration:0.35},
  {name:'Root Beer 500ml',        cat:'Beverages',    rev:45,  val:0.32, cx:0.55, stockouts:5, promo:0.50, margin:28, growth:-0.08, lead:16, householdPenetration:0.25},

  // Snacks
  {name:'Oat Cookies',            cat:'Snacks',       rev:121, val:0.77, cx:0.29, stockouts:1, promo:0.22, margin:44, growth:0.22,  lead:12, householdPenetration:0.71},
  {name:'Masala Puffs',           cat:'Snacks',       rev:88,  val:0.64, cx:0.38, stockouts:2, promo:0.33, margin:38, growth:0.11,  lead:14, householdPenetration:0.54},
  {name:'Choco Wafers',           cat:'Snacks',       rev:44,  val:0.34, cx:0.71, stockouts:5, promo:0.72, margin:22, growth:-0.12, lead:28, householdPenetration:0.18},
  {name:'BrandB Chips',           cat:'Snacks',       rev:135, val:0.85, cx:0.22, stockouts:1, promo:0.15, margin:43, growth:0.08,  lead:8,  householdPenetration:0.78},
  {name:'BrandC Chips (Spicy)',   cat:'Snacks',       rev:94,  val:0.78, cx:0.55, stockouts:3, promo:0.48, margin:36, growth:0.19,  lead:15, householdPenetration:0.62},
  {name:'BrandD Chocolate 100g',  cat:'Snacks',       rev:85,  val:0.66, cx:0.32, stockouts:2, promo:0.29, margin:39, growth:0.16,  lead:13, householdPenetration:0.55},
  {name:'BrandD Chocolate 250g',  cat:'Snacks',       rev:52,  val:0.48, cx:0.64, stockouts:4, promo:0.58, margin:31, growth:-0.02, lead:19, householdPenetration:0.22},
  {name:'Salted Peanuts 200g',    cat:'Snacks',       rev:90,  val:0.67, cx:0.25, stockouts:1, promo:0.18, margin:42, growth:0.09,  lead:9,  householdPenetration:0.62},
  {name:'Spicy Cashews 150g',     cat:'Snacks',       rev:108, val:0.75, cx:0.38, stockouts:2, promo:0.24, margin:45, growth:0.15,  lead:14, householdPenetration:0.52},
  {name:'BrandB Tortilla Chips',  cat:'Snacks',       rev:125, val:0.82, cx:0.24, stockouts:1, promo:0.16, margin:44, growth:0.11,  lead:8,  householdPenetration:0.75},
  {name:'Cheese Crackers 150g',   cat:'Snacks',       rev:98,  val:0.70, cx:0.28, stockouts:2, promo:0.22, margin:40, growth:0.07,  lead:10, householdPenetration:0.65},
  {name:'Pretzels Sea Salt',      cat:'Snacks',       rev:76,  val:0.56, cx:0.30, stockouts:2, promo:0.28, margin:38, growth:0.03,  lead:11, householdPenetration:0.53},
  {name:'BrandD Milk Chocolate Bar',cat:'Snacks',     rev:115, val:0.78, cx:0.26, stockouts:1, promo:0.19, margin:42, growth:0.13,  lead:10, householdPenetration:0.70},
  {name:'BrandD Dark Chocolate Bar',cat:'Snacks',     rev:92,  val:0.69, cx:0.34, stockouts:2, promo:0.22, margin:45, growth:0.16,  lead:12, householdPenetration:0.50},
  {name:'Gummy Bears 150g',       cat:'Snacks',       rev:84,  val:0.62, cx:0.32, stockouts:2, promo:0.35, margin:36, growth:0.05,  lead:11, householdPenetration:0.58},
  {name:'Sour Worms 150g',        cat:'Snacks',       rev:70,  val:0.52, cx:0.35, stockouts:3, promo:0.40, margin:34, growth:0.02,  lead:11, householdPenetration:0.48},
  {name:'Caramel Popcorn Bag',    cat:'Snacks',       rev:62,  val:0.46, cx:0.42, stockouts:3, promo:0.45, margin:31, growth:-0.01, lead:13, householdPenetration:0.38},
  {name:'Butter Popcorn Bag',     cat:'Snacks',       rev:80,  val:0.59, cx:0.30, stockouts:2, promo:0.32, margin:35, growth:0.04,  lead:10, householdPenetration:0.52},
  {name:'Rice Cakes Sea Salt',    cat:'Snacks',       rev:58,  val:0.43, cx:0.45, stockouts:4, promo:0.50, margin:28, growth:-0.04, lead:16, householdPenetration:0.29},
  {name:'Granola Bars Honey 6P',  cat:'Snacks',       rev:102, val:0.72, cx:0.32, stockouts:2, promo:0.25, margin:39, growth:0.08,  lead:12, householdPenetration:0.60},
  {name:'Granola Bars Choco 6P',  cat:'Snacks',       rev:105, val:0.74, cx:0.30, stockouts:1, promo:0.23, margin:40, growth:0.10,  lead:12, householdPenetration:0.62},
  {name:'Fruit & Nut Mix 250g',   cat:'Snacks',       rev:86,  val:0.64, cx:0.48, stockouts:3, promo:0.30, margin:43, growth:0.06,  lead:15, householdPenetration:0.45},

  // Personal Care
  {name:'Hand Cream SPF',         cat:'Personal Care',rev:62,  val:0.48, cx:0.52, stockouts:3, promo:0.44, margin:31, growth:0.06,  lead:20, householdPenetration:0.28},
  {name:'Herbal Shampoo',         cat:'Personal Care',rev:108, val:0.74, cx:0.34, stockouts:1, promo:0.19, margin:47, growth:0.28,  lead:11, householdPenetration:0.69},
  {name:'Foam Face Wash',         cat:'Personal Care',rev:55,  val:0.42, cx:0.63, stockouts:4, promo:0.57, margin:26, growth:-0.08, lead:25, householdPenetration:0.21},
  {name:'Aloe Face Wash',         cat:'Personal Care',rev:32,  val:0.28, cx:0.78, stockouts:6, promo:0.65, margin:18, growth:-0.15, lead:26, householdPenetration:0.12},
  {name:'BrandD Toothpaste',      cat:'Personal Care',rev:81,  val:0.72, cx:0.28, stockouts:1, promo:0.21, margin:40, growth:0.05,  lead:10, householdPenetration:0.64},
  {name:'BrandB Soap',            cat:'Personal Care',rev:74,  val:0.67, cx:0.36, stockouts:2, promo:0.26, margin:38, growth:0.04,  lead:9,  householdPenetration:0.59},
  {name:'Anti-Dandruff Shampoo',  cat:'Personal Care',rev:95,  val:0.70, cx:0.38, stockouts:2, promo:0.25, margin:44, growth:0.08,  lead:12, householdPenetration:0.58},
  {name:'Tea Tree Conditioner',   cat:'Personal Care',rev:82,  val:0.61, cx:0.42, stockouts:2, promo:0.28, margin:46, growth:0.11,  lead:12, householdPenetration:0.48},
  {name:'Moisturizing Body Wash', cat:'Personal Care',rev:110, val:0.76, cx:0.30, stockouts:1, promo:0.20, margin:42, growth:0.12,  lead:10, householdPenetration:0.65},
  {name:'Exfoliating Scrub 150ml',cat:'Personal Care',rev:48,  val:0.34, cx:0.68, stockouts:5, promo:0.58, margin:28, growth:-0.07, lead:22, householdPenetration:0.18},
  {name:'Sensitive Skin Lotion',  cat:'Personal Care',rev:76,  val:0.55, cx:0.46, stockouts:3, promo:0.38, margin:37, growth:0.04,  lead:16, householdPenetration:0.38},
  {name:'BrandD Charcoal Toothpaste',cat:'Personal Care',rev:68,val:0.50,cx:0.44, stockouts:3, promo:0.35, margin:39, growth:0.08,  lead:11, householdPenetration:0.35},
  {name:'Whitening Mouthwash 500ml',cat:'Personal Care',rev:85,val:0.63, cx:0.35, stockouts:2, promo:0.26, margin:41, growth:0.06,  lead:12, householdPenetration:0.52},
  {name:'BrandB Shea Soap 3-Pack',cat:'Personal Care',rev:90,  val:0.68, cx:0.28, stockouts:1, promo:0.18, margin:38, growth:0.05,  lead:9,  householdPenetration:0.61},
  {name:'Deodorant Roll-On Active',cat:'Personal Care',rev:104,val:0.74, cx:0.26, stockouts:1, promo:0.15, margin:45, growth:0.14,  lead:10, householdPenetration:0.68},
  {name:'Deodorant Roll-On Fresh',cat:'Personal Care',rev:98,  val:0.71, cx:0.26, stockouts:2, promo:0.18, margin:44, growth:0.10,  lead:10, householdPenetration:0.64},
  {name:'Aloe Hand Sanitizer 100ml',cat:'Personal Care',rev:40,val:0.28, cx:0.50, stockouts:4, promo:0.45, margin:25, growth:-0.10, lead:14, householdPenetration:0.26},
  {name:'Hydrating Sheet Mask',   cat:'Personal Care',rev:35,  val:0.24, cx:0.70, stockouts:5, promo:0.62, margin:22, growth:-0.12, lead:24, householdPenetration:0.15},
  {name:'Foaming Shaving Gel',    cat:'Personal Care',rev:70,  val:0.52, cx:0.38, stockouts:2, promo:0.30, margin:38, growth:0.03,  lead:12, householdPenetration:0.44},
  {name:'Soothing Aftershave Balm',cat:'Personal Care',rev:52, val:0.38, cx:0.58, stockouts:4, promo:0.48, margin:32, growth:-0.04, lead:18, householdPenetration:0.25},

  // Dairy
  {name:'BrandD Cheese Blocks',   cat:'Dairy',        rev:95,  val:0.76, cx:0.38, stockouts:2, promo:0.22, margin:39, growth:0.06,  lead:12, householdPenetration:0.61},
  {name:'BrandB Yogurt 500g',     cat:'Dairy',        rev:72,  val:0.60, cx:0.45, stockouts:3, promo:0.38, margin:35, growth:0.02,  lead:14, householdPenetration:0.48},
  {name:'BrandB Yogurt 1kg',      cat:'Dairy',        rev:42,  val:0.35, cx:0.68, stockouts:5, promo:0.61, margin:24, growth:-0.08, lead:18, householdPenetration:0.24},
  {name:'BrandE Yogurt (Straw)',  cat:'Dairy',        rev:35,  val:0.29, cx:0.72, stockouts:6, promo:0.68, margin:21, growth:-0.14, lead:19, householdPenetration:0.16},
  {name:'BrandD Cheddar Slices',  cat:'Dairy',        rev:105, val:0.78, cx:0.34, stockouts:1, promo:0.20, margin:41, growth:0.08,  lead:11, householdPenetration:0.68},
  {name:'BrandD Shredded Mozzarella',cat:'Dairy',     rev:112, val:0.82, cx:0.36, stockouts:2, promo:0.24, margin:40, growth:0.12,  lead:11, householdPenetration:0.70},
  {name:'BrandB Greek Yogurt Plain',cat:'Dairy',      rev:120, val:0.85, cx:0.28, stockouts:1, promo:0.18, margin:43, growth:0.15,  lead:8,  householdPenetration:0.74},
  {name:'BrandB Greek Yogurt Blueberry',cat:'Dairy',  rev:95,  val:0.70, cx:0.35, stockouts:2, promo:0.28, margin:39, growth:0.09,  lead:10, householdPenetration:0.58},
  {name:'BrandB Greek Yogurt Honey',cat:'Dairy',      rev:88,  val:0.65, cx:0.38, stockouts:3, promo:0.32, margin:38, growth:0.07,  lead:10, householdPenetration:0.52},
  {name:'Organic Whole Milk 1K',  cat:'Dairy',        rev:130, val:0.88, cx:0.22, stockouts:1, promo:0.12, margin:35, growth:0.05,  lead:6,  householdPenetration:0.82},
  {name:'Organic Low Fat Milk 1K',cat:'Dairy',        rev:118, val:0.80, cx:0.22, stockouts:2, promo:0.15, margin:34, growth:0.03,  lead:6,  householdPenetration:0.76},
  {name:'Salted Butter 250g',     cat:'Dairy',        rev:115, val:0.81, cx:0.25, stockouts:1, promo:0.16, margin:38, growth:0.06,  lead:9,  householdPenetration:0.78},
  {name:'Unsalted Butter 250g',   cat:'Dairy',        rev:92,  val:0.68, cx:0.28, stockouts:2, promo:0.22, margin:38, growth:0.04,  lead:9,  householdPenetration:0.62},
  {name:'Whipped Cream Can',      cat:'Dairy',        rev:60,  val:0.44, cx:0.48, stockouts:4, promo:0.45, margin:30, growth:-0.02, lead:14, householdPenetration:0.38},
  {name:'BrandE Yogurt Drink Strawberry',cat:'Dairy', rev:64,  val:0.46, cx:0.45, stockouts:3, promo:0.38, margin:32, growth:0.02,  lead:12, householdPenetration:0.41},
  {name:'BrandE Yogurt Drink Mango',cat:'Dairy',      rev:58,  val:0.42, cx:0.48, stockouts:4, promo:0.42, margin:31, growth:-0.01, lead:12, householdPenetration:0.36},
  {name:'Sour Cream 250g',        cat:'Dairy',        rev:70,  val:0.52, cx:0.36, stockouts:2, promo:0.28, margin:36, growth:0.03,  lead:11, householdPenetration:0.49},
  {name:'Cottage Cheese 400g',    cat:'Dairy',        rev:80,  val:0.58, cx:0.40, stockouts:3, promo:0.30, margin:35, growth:0.05,  lead:12, householdPenetration:0.54},

  // Household
  {name:'Floor Cleaner',          cat:'Household',    rev:38,  val:0.29, cx:0.74, stockouts:6, promo:0.68, margin:19, growth:-0.16, lead:31, householdPenetration:0.14},
  {name:'Dish Soap 1K',           cat:'Household',    rev:92,  val:0.65, cx:0.35, stockouts:2, promo:0.28, margin:36, growth:0.14,  lead:13, householdPenetration:0.55},
  {name:'Fabric Softener',        cat:'Household',    rev:28,  val:0.22, cx:0.81, stockouts:7, promo:0.76, margin:15, growth:-0.22, lead:35, householdPenetration:0.10},
  {name:'Laundry Pods Premium',   cat:'Household',    rev:115, val:0.81, cx:0.33, stockouts:1, promo:0.24, margin:46, growth:0.24,  lead:12, householdPenetration:0.74},
  {name:'BrandF Detergent',       cat:'Household',    rev:66,  val:0.58, cx:0.48, stockouts:3, promo:0.36, margin:33, growth:0.05,  lead:15, householdPenetration:0.44},
  {name:'Multi-Surface Cleaner 1K',cat:'Household',   rev:100, val:0.72, cx:0.32, stockouts:2, promo:0.24, margin:38, growth:0.11,  lead:12, householdPenetration:0.60},
  {name:'Glass Cleaner Spray 500ml',cat:'Household',  rev:78,  val:0.56, cx:0.38, stockouts:3, promo:0.32, margin:35, growth:0.04,  lead:14, householdPenetration:0.48},
  {name:'Dish Soap Lemon 500ml',  cat:'Household',    rev:85,  val:0.62, cx:0.28, stockouts:1, promo:0.20, margin:37, growth:0.08,  lead:10, householdPenetration:0.59},
  {name:'Dishwasher Pods 30ct',   cat:'Household',    rev:120, val:0.84, cx:0.35, stockouts:1, promo:0.18, margin:48, growth:0.20,  lead:14, householdPenetration:0.70},
  {name:'Trash Bags 30 Gallon',   cat:'Household',    rev:94,  val:0.68, cx:0.26, stockouts:2, promo:0.22, margin:34, growth:0.05,  lead:10, householdPenetration:0.66},
  {name:'Kitchen Paper Towels 4-Pack',cat:'Household',rev:110, val:0.78, cx:0.24, stockouts:2, promo:0.19, margin:32, growth:0.08,  lead:8,  householdPenetration:0.78},
  {name:'Toilet Paper 12-Pack',   cat:'Household',    rev:140, val:0.90, cx:0.20, stockouts:1, promo:0.12, margin:30, growth:0.04,  lead:6,  householdPenetration:0.85},
  {name:'BrandF Detergent Powder 2kg',cat:'Household',rev:88,  val:0.64, cx:0.42, stockouts:3, promo:0.29, margin:35, growth:0.06,  lead:13, householdPenetration:0.52},
  {name:'Fabric Softener Lavender 1K',cat:'Household',rev:42,  val:0.30, cx:0.72, stockouts:5, promo:0.65, margin:20, growth:-0.12, lead:28, householdPenetration:0.22},
  {name:'Disinfecting Wipes 80ct',cat:'Household',    rev:105, val:0.75, cx:0.30, stockouts:2, promo:0.20, margin:42, growth:0.14,  lead:12, householdPenetration:0.64},
  {name:'Air Freshener Spray 300ml',cat:'Household',  rev:50,  val:0.35, cx:0.55, stockouts:4, promo:0.48, margin:28, growth:-0.06, lead:18, householdPenetration:0.30},
  {name:'Drain Clog Remover 1K',  cat:'Household',    rev:55,  val:0.39, cx:0.62, stockouts:4, promo:0.42, margin:31, growth:-0.04, lead:20, householdPenetration:0.25},
  {name:'Bathroom Cleaner Gel 750ml',cat:'Household', rev:72,  val:0.52, cx:0.45, stockouts:3, promo:0.35, margin:33, growth:0.02,  lead:15, householdPenetration:0.40},

  // Added Beverages
  {name:'Sprite 500ml',           cat:'Beverages',    rev:120, val:0.78, cx:0.25, stockouts:1, promo:0.22, margin:42, growth:0.15,  lead:10, householdPenetration:0.75},
  {name:'Coca-Cola 500ml',        cat:'Beverages',    rev:160, val:0.88, cx:0.22, stockouts:1, promo:0.18, margin:44, growth:0.10,  lead:10, householdPenetration:0.88},
  {name:'Thums Up 500ml',         cat:'Beverages',    rev:140, val:0.82, cx:0.28, stockouts:2, promo:0.25, margin:40, growth:0.12,  lead:12, householdPenetration:0.80},
  {name:'Foorti Mango Juice 250ml',cat:'Beverages',   rev:65,  val:0.52, cx:0.38, stockouts:3, promo:0.35, margin:35, growth:0.08,  lead:14, householdPenetration:0.48},
  {name:'Pulpy Orange 1L',        cat:'Beverages',    rev:95,  val:0.69, cx:0.32, stockouts:2, promo:0.28, margin:38, growth:0.14,  lead:12, householdPenetration:0.62},

  // Added Chocolates (Snacks)
  {name:'5-Star Chocolate 20g',   cat:'Snacks',       rev:75,  val:0.58, cx:0.24, stockouts:1, promo:0.30, margin:36, growth:0.08,  lead:8,  householdPenetration:0.68},
  {name:'Munch Chocolate Bar 15g',cat:'Snacks',       rev:80,  val:0.62, cx:0.22, stockouts:1, promo:0.28, margin:38, growth:0.11,  lead:8,  householdPenetration:0.72},

  // Beauty Category
  {name:'Matte Lipstick Red',     cat:'Beauty',       rev:85,  val:0.72, cx:0.42, stockouts:2, promo:0.32, margin:52, growth:0.16,  lead:18, householdPenetration:0.35},
  {name:'Liquid Foundation 30ml', cat:'Beauty',       rev:110, val:0.79, cx:0.48, stockouts:2, promo:0.25, margin:55, growth:0.22,  lead:22, householdPenetration:0.28},
  {name:'Volume Mascara Black',   cat:'Beauty',       rev:65,  val:0.58, cx:0.35, stockouts:1, promo:0.18, margin:50, growth:0.12,  lead:15, householdPenetration:0.22},
  {name:'Hydrating Face Cream',   cat:'Beauty',       rev:130, val:0.84, cx:0.38, stockouts:1, promo:0.15, margin:58, growth:0.28,  lead:14, householdPenetration:0.44},
  {name:'Sunscreen SPF 50',       cat:'Beauty',       rev:145, val:0.86, cx:0.31, stockouts:2, promo:0.20, margin:54, growth:0.32,  lead:12, householdPenetration:0.52},
  {name:'Herbal Shampoo 400ml',   cat:'Beauty',       rev:95,  val:0.68, cx:0.28, stockouts:2, promo:0.26, margin:48, growth:0.14,  lead:10, householdPenetration:0.60},

  // Fashion Category
  {name:'Casual Cotton T-Shirt',  cat:'Fashion',      rev:150, val:0.81, cx:0.40, stockouts:3, promo:0.35, margin:45, growth:0.08,  lead:20, householdPenetration:0.55},
  {name:'Slim Fit Denim Jeans',   cat:'Fashion',      rev:180, val:0.85, cx:0.45, stockouts:2, promo:0.28, margin:48, growth:0.05,  lead:24, householdPenetration:0.48},
  {name:'Classic Leather Jacket', cat:'Fashion',      rev:120, val:0.71, cx:0.55, stockouts:4, promo:0.15, margin:52, growth:0.12,  lead:30, householdPenetration:0.18},
  {name:'Running Sports Sneakers',cat:'Fashion',      rev:165, val:0.83, cx:0.38, stockouts:2, promo:0.22, margin:46, growth:0.18,  lead:15, householdPenetration:0.38},
  {name:'Aviator Sunglasses',     cat:'Fashion',      rev:70,  val:0.59, cx:0.32, stockouts:1, promo:0.20, margin:55, growth:0.14,  lead:12, householdPenetration:0.25},
  {name:'Designer Leather Handbag',cat:'Fashion',     rev:135, val:0.76, cx:0.52, stockouts:3, promo:0.18, margin:58, growth:0.10,  lead:28, householdPenetration:0.15},
];

export const VP_ALERTS = [
  {id:'a1',sev:'critical' as const,title:'Mango Fizz 750ml launch delay — packaging shortage',detail:'Launch · Delay risk: 21 days behind schedule',ack:false},
  {id:'a2',sev:'critical' as const,title:'Choco Wafers promo dependency at 72% — margin risk',detail:'Margin · Organic revenue only 28%',ack:false},
  {id:'a3',sev:'warning' as const,title:'Laundry Pods Premium — 15% cost variance on active ingredients',detail:'Margin · Gross margin contraction to 31%',ack:false},
  {id:'a4',sev:'warning' as const,title:'Beverages cannibalization risk elevated across variants',detail:'Cannibalization · Mango Fizz pair correlation −0.62',ack:false},
  {id:'a5',sev:'warning' as const,title:'BrandA Premium Energy launch readiness at 88% — final gate pending',detail:'Launch · Target launch date Sep 15, 2026',ack:false},
  {id:'a6',sev:'info' as const,title:'Dishwasher Pods 30ct promo overlap — margin erosion',detail:'Margin · Combined promo discount at 42%',ack:false},
];

export const VP_APPROVALS = [
  {id:'p1',title:'Mango Fizz 750ml — Launch budget $4.2 M',type:'Launch' as const,urgency:'high' as const,age:'2d',done:false},
  {id:'p2',title:'Choco Wafers promo extension — Q4',type:'Promo' as const,urgency:'medium' as const,age:'4d',done:false},
  {id:'p3',title:'Foam Face Wash rationalization sign-off',type:'Rationalize' as const,urgency:'low' as const,age:'6d',done:false},
];

export const VP_FORECAST = [
  {region:'APAC',actual:312,target:290,delta:'+7.6%',up:true},
  {region:'Americas',actual:228,target:240,delta:'-5.0%',up:false},
  {region:'EMEA',actual:311,target:305,delta:'+2.0%',up:true},
];

export const VP_KPI_BASE = [
  {label:'Total Revenue',value:851,unit:'$ M',trend:+8.4,spark:[720,748,771,790,810,822,838,851],color:'#534AB7',fmt:(v: number)=>'$'+v+'M'},
  {label:'Gross Margin',value:36.2,unit:'%',trend:+1.1,spark:[33.1,33.8,34.2,34.9,35.4,35.8,36.0,36.2],color:'#0F6E56',fmt:(v: number)=>v+'%'},
  {label:'Active SKUs',value:100,unit:'',trend:-3,spark:[134,133,131,130,129,128,128,100],color:'#185FA5',fmt:(v: number)=>String(v)},
  {label:'Critical Alerts',value:2,unit:'',trend:+2,spark:[0,0,1,0,1,2,2,2],color:'#A32D2D',fmt:(v: number)=>String(v)},
];

// ─── Launch Readiness Datasets (Tab 1) ────────────────────────────────────────
// 5 products in pipeline: 2 new launches, 3 relaunches in various lifecycle stages

// ─── Launch Timeline ──────────────────────────────────────────────────────────

