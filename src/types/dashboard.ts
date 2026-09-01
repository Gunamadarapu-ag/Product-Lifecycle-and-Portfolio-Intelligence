/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'VP Product Management' | 'Product Manager' | 'Pricing and Margin Partner';

export interface KPI {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  info: string;
  /** When true, an upward trend is a risk signal (shown red, not green) */
  isRisk?: boolean;
  /** Which roles should this card be highlighted for */
  highlight?: Role[];
}

export interface PortfolioItem {
  name: string;
  category: string;
  margin: number;       // gross margin %
  growth: number;       // YoY revenue growth %
  netSales: number;     // net sales in $M
  value: number;        // commercial value score 0-100
  complexity: number;   // operational complexity score 0-100
  segment: 'Keep' | 'Grow' | 'Consolidate' | 'Rationalize';
  stage: 'Introduction' | 'Growth' | 'Maturity' | 'Decline';
  stockouts?: number;
  promoDep?: number;    // promo dependency %
  leadTime?: number;    // lead time in days
  promoErosion?: number; // promo margin erosion score
}

export interface Agent {
  name: string;
  role: string;
}

export interface ChannelData {
  channel: string;
  marginPct: number;
  volatilityCV: number;
  stockoutCount: number;
}

export interface RegionalData {
  country: string;
  skuCount: number;
  netSalesM: number;
  marginPct: number;
  complexityLabel: 'High' | 'Medium' | 'Opt';
}

export interface StockoutItem {
  name: string;
  category: string;
  stockoutCount: number;
  safetyStockRatio: number;
  netSalesM: number;
  segment: 'Keep' | 'Grow' | 'Consolidate' | 'Rationalize';
}

export interface RationalizationScenario {
  label: string;
  skusRemoved: number;
  revenueImpact: number;   // negative %
  marginImpact: number;    // negative %
  safetyStockFreed: number; // positive %
  supplierReduction: number; // %
}

export interface PCIDriver {
  label: string;
  value: number;
  benchmark: number;
}

export interface TopSKU {
  name: string;
  category: string;
  netSalesM: number;
  grossMarginM: number;
}

export interface PromoErosionItem {
  name: string;
  category: string;
  erosionScore: number;
  promoDependency: number;
}

export interface SKUBurdenItem {
  name: string;
  category: string;
  opBurdenRatio: number;
  netSales: number;
  leadTime: number;
  stockouts: number;
  promoDep: number;
}

// ─── Launch Readiness Types ──────────────────────────────────────────────────
export type LaunchStage = 'Concept' | 'Development' | 'Pre-Launch' | 'Launch' | 'Post-Launch';
export type ReadinessStatus = 'On Track' | 'At Risk' | 'Critical' | 'Complete';

export interface LaunchReadinessMetric {
  dimension: 'Market' | 'Supply Chain' | 'Channel' | 'Pricing' | 'Operations';
  readinessScore: number;    // 0-100
  status: ReadinessStatus;
  keyFindings: string[];
  actionItems: string[];
}

export interface LaunchGate {
  stageName: LaunchStage;
  gateDate: string;          // ISO date string
  isCompleted: boolean;
  keyMilestones: string[];
  gateOwner: string;
}

export interface LaunchProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  currentStage: LaunchStage;
  gateProgress: number;      // 0-100, completion %
  targetLaunchDate: string;  // ISO date
  estimatedFirstYearRevenue: number;  // $M
  estimatedMargin: number;   // %
  targetMarkets: string[];   // List of countries
  readiness: LaunchReadinessMetric[];
  overallReadiness: number;  // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
  launchType?: 'New' | 'Relaunch';
  completedGates: LaunchGate[];
  upcomingGates: LaunchGate[];
}

export interface LaunchTimelineItem {
  date: string;
  product: string;
  stage: LaunchStage;
  region: string;
  status: 'Planned' | 'Delayed' | 'Completed';
}

export interface VPAlert {
  id: string;
  sev: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  ack: boolean;
}

export interface VPApproval {
  id: string;
  title: string;
  type: 'Launch' | 'Promo' | 'Rationalize';
  urgency: 'high' | 'medium' | 'low';
  age: string;
  done: boolean;
}

export interface VPForecast {
  region: string;
  actual: number;
  target: number;
  delta: string;
  up: boolean;
}

export interface SKU {
  name: string;
  cat: string;
  rev: number;
  val: number;
  cx: number;
  stockouts: number;
  promo: number;
  margin: number;
  growth: number;
  lead: number;
  /**
   * Fraction of target households regularly purchasing (Nielsen-style panel
   * proxy). Present on every row in `SKUS` but previously absent from this
   * interface, so consumers that needed it could not see it.
   */
  householdPenetration: number;
}

export interface SignalItem {
  id: string;
  category: 'Supply' | 'Margin' | 'Demand' | 'Launch' | 'Cannibalization';
  title: string;
  severity: 'critical' | 'warning' | 'info';
  summary: string;
  received: string;
  acknowledged: boolean;
}


/**
 * Time horizon for the Top-Down Drilldown filters.
 *
 * Previously this union was re-declared inline at five call sites and one of
 * them (DrilldownRegionGrid) omitted '2Y', even though the picker offers it
 * and the component's own lookup tables carry a '2Y' row.
 */
export type TimeHorizon = '1M' | '3M' | '6M' | 'YTD' | '12M' | '2Y' | '3Y';
