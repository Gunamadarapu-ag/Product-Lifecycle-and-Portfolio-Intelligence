/**
 * AUTO-GENERATED - do not edit by hand.
 *
 * Emitted by data/generator/export_ts.py from the dataset in data/output/.
 * Regenerate with:
 *     python data/generator/main.py && python data/generator/export_ts.py
 *
 * Every figure here is computed from the 368,013-row fact table rather
 * than transcribed from a notebook. Values are USD; monetary figures are $M for
 * the report year (2025).
 */

import { ChannelData, RegionalData, StockoutItem, PCIDriver, TopSKU,
         RationalizationScenario } from '../types/dashboard';

export const GENERATED_META = { seed: 20260909, generatedAt: "2026-09-14T15:41:12Z", factRows: 368013, skuCount: 119, window: "2024-01-01..2025-12-31", reportYear: 2025, currency: "USD" } as const;

/** KPI label -> computed display values. Labels match the KPIS array in data.ts. */
export const GENERATED_KPI_VALUES: Record<string, { value: string; trendValue: string }> = {
  "Net Sales (Portfolio)": { value: "$473M", trendValue: "+8.3% YoY" },
  "Avg Gross Margin": { value: "38.55%", trendValue: "-1.45% vs bench" },
  "Revenue Concentration": { value: "28.01%", trendValue: "Top 10% SKUs" },
  "Portfolio PCI": { value: "0.5961", trendValue: "Target: 0.4200" },
  "Long-Tail SKU Burden": { value: "72.3%", trendValue: "86 SKUs <1% rev" },
  "Rationalize Candidates": { value: "46 SKUs", trendValue: "-15.79% tail risk" },
  "Peak Stockout Freq.": { value: "440 events", trendValue: "Aloe Face Wash" },
  "Revenue Tail Risk": { value: "15.79%", trendValue: "Full Rat. scenario" },
};

export const GENERATED_REGIONAL_DATA: RegionalData[] = [
  { country: "Italy", skuCount: 119, netSalesM: 137.2, marginPct: 38.24, complexityLabel: "High" },
  { country: "Spain", skuCount: 119, netSalesM: 106.9, marginPct: 38.25, complexityLabel: "High" },
  { country: "Germany", skuCount: 114, netSalesM: 88.4, marginPct: 38.31, complexityLabel: "High" },
  { country: "Austria", skuCount: 93, netSalesM: 43, marginPct: 39.12, complexityLabel: "Medium" },
  { country: "France", skuCount: 93, netSalesM: 42.6, marginPct: 39.13, complexityLabel: "Medium" },
  { country: "Poland", skuCount: 93, netSalesM: 42.6, marginPct: 39.12, complexityLabel: "Medium" },
  { country: "Netherlands", skuCount: 52, netSalesM: 12.3, marginPct: 40.29, complexityLabel: "Opt" },
];

export const GENERATED_CHANNEL_DATA: ChannelData[] = [
  { channel: "E-commerce", marginPct: 38.55, volatilityCV: 0.064, stockoutCount: 7851 },
  { channel: "Supermarket", marginPct: 38.53, volatilityCV: 0.064, stockoutCount: 7908 },
  { channel: "Hypermarket", marginPct: 38.56, volatilityCV: 0.064, stockoutCount: 15862 },
  { channel: "Convenience", marginPct: 38.57, volatilityCV: 0.062, stockoutCount: 1431 },
];

export const GENERATED_PCI_DRIVERS: PCIDriver[] = [
  { label: "Supplier Fragmentation Index", value: 1.2, benchmark: 1 },
  { label: "SKU Proliferation Index", value: 1.02, benchmark: 0.85 },
  { label: "Low Velocity SKU %", value: 0.7227, benchmark: 0.4 },
  { label: "Lead Time Instability (CV)", value: 0.3963, benchmark: 0.15 },
  { label: "Promo Dependency Score", value: 0.0789, benchmark: 0.08 },
  { label: "Avg Portfolio Volatility CV", value: 0.1584, benchmark: 0.08 },
];

export const GENERATED_STOCKOUT_TOP10: StockoutItem[] = [
  { name: "Aloe Face Wash", category: "Personal Care", stockoutCount: 440, safetyStockRatio: 0.0712, netSalesM: 0.2, segment: "Rationalize" },
  { name: "BrandE Yogurt (Straw)", category: "Dairy", stockoutCount: 414, safetyStockRatio: 0.054, netSalesM: 0.45, segment: "Rationalize" },
  { name: "Floor Cleaner", category: "Household", stockoutCount: 414, safetyStockRatio: 0.07, netSalesM: 0.58, segment: "Rationalize" },
  { name: "Root Beer 500ml", category: "Beverages", stockoutCount: 385, safetyStockRatio: 0.1188, netSalesM: 1.19, segment: "Rationalize" },
  { name: "Choco Wafers", category: "Snacks", stockoutCount: 385, safetyStockRatio: 0.1169, netSalesM: 1.07, segment: "Rationalize" },
  { name: "Exfoliating Scrub 150ml", category: "Personal Care", stockoutCount: 385, safetyStockRatio: 0.034, netSalesM: 1.31, segment: "Rationalize" },
  { name: "Hydrating Sheet Mask", category: "Personal Care", stockoutCount: 385, safetyStockRatio: 0.0644, netSalesM: 0.32, segment: "Rationalize" },
  { name: "BrandB Yogurt 1kg", category: "Dairy", stockoutCount: 385, safetyStockRatio: 0.0465, netSalesM: 0.83, segment: "Rationalize" },
  { name: "Fabric Softener Lavender 1K", category: "Household", stockoutCount: 385, safetyStockRatio: 0.0519, netSalesM: 0.95, segment: "Rationalize" },
  { name: "Fabric Softener", category: "Household", stockoutCount: 378, safetyStockRatio: 0.1566, netSalesM: 0.07, segment: "Rationalize" },
];

export const GENERATED_TOP_SKUS_REVENUE: TopSKU[] = [
  { name: "Slim Fit Denim Jeans", category: "Fashion", netSalesM: 23.78, grossMarginM: 10.61 },
  { name: "Running Sports Sneakers", category: "Fashion", netSalesM: 23.37, grossMarginM: 9.94 },
  { name: "Coca-Cola 500ml", category: "Beverages", netSalesM: 22.95, grossMarginM: 9.41 },
  { name: "Casual Cotton T-Shirt", category: "Fashion", netSalesM: 22.51, grossMarginM: 9.36 },
  { name: "Sunscreen SPF 50", category: "Beauty", netSalesM: 22.05, grossMarginM: 11.17 },
];

export const GENERATED_RATIONALIZATION_SCENARIOS: RationalizationScenario[] = [
  { label: "Bottom 10%", skusRemoved: 12, revenueImpact: -1, marginImpact: -0.52, safetyStockFreed: 4.44, supplierReduction: 0 },
  { label: "Bottom 20%", skusRemoved: 24, revenueImpact: -3.85, marginImpact: -2.51, safetyStockFreed: 12.34, supplierReduction: 0 },
  { label: "Bottom 30%", skusRemoved: 36, revenueImpact: -8.31, marginImpact: -6.49, safetyStockFreed: 20.17, supplierReduction: 0 },
  { label: "Full Rationalize", skusRemoved: 46, revenueImpact: -15.79, marginImpact: -12.99, safetyStockFreed: 39.84, supplierReduction: 0 },
];
