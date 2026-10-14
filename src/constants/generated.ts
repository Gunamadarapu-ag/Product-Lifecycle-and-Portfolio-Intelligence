/**
 * AUTO-GENERATED - do not edit by hand.
 *
 * Emitted by data/generator/export_ts.py from the dataset in data/output/.
 * Regenerate with:
 *     python data/generator/main.py && python data/generator/export_ts.py
 *
 * Every figure here is computed from the 357,471-row fact table rather
 * than transcribed from a notebook. Values are USD; monetary figures are $M for
 * the report year (2025).
 */

import { ChannelData, RegionalData, StockoutItem, PCIDriver, TopSKU,
         RationalizationScenario } from '../types/dashboard';

export const GENERATED_META = { seed: 20260909, generatedAt: "2026-10-07T14:11:32Z", factRows: 357471, skuCount: 119, window: "2024-01-01..2025-12-31", reportYear: 2025, currency: "USD" } as const;

/** KPI label -> computed display values. Labels match the KPIS array in data.ts. */
export const GENERATED_KPI_VALUES: Record<string, { value: string; trendValue: string }> = {
  "Net Sales (Portfolio)": { value: "$473M", trendValue: "+8.3% YoY" },
  "Avg Gross Margin": { value: "38.35%", trendValue: "-1.65% vs bench" },
  "Revenue Concentration": { value: "28.29%", trendValue: "Top 10% SKUs" },
  "Portfolio PCI": { value: "0.5966", trendValue: "Target: 0.4200" },
  "Long-Tail SKU Burden": { value: "72.3%", trendValue: "86 SKUs <1% rev" },
  "Rationalize Candidates": { value: "43 SKUs", trendValue: "-12.79% tail risk" },
  "Peak Stockout Freq.": { value: "440 events", trendValue: "Casual Cotton T-Shirt" },
  "Revenue Tail Risk": { value: "12.79%", trendValue: "Full Rat. scenario" },
};

export const GENERATED_REGIONAL_DATA: RegionalData[] = [
  { country: "Italy", skuCount: 119, netSalesM: 137.2, marginPct: 38.33, complexityLabel: "High" },
  { country: "Spain", skuCount: 119, netSalesM: 106.9, marginPct: 37.05, complexityLabel: "High" },
  { country: "Germany", skuCount: 114, netSalesM: 88.5, marginPct: 39.68, complexityLabel: "High" },
  { country: "Austria", skuCount: 93, netSalesM: 43, marginPct: 41.15, complexityLabel: "Medium" },
  { country: "France", skuCount: 93, netSalesM: 42.6, marginPct: 40.52, complexityLabel: "Medium" },
  { country: "Poland", skuCount: 93, netSalesM: 42.6, marginPct: 36.82, complexityLabel: "Medium" },
  { country: "Netherlands", skuCount: 52, netSalesM: 12.3, marginPct: 34.53, complexityLabel: "Opt" },
];

export const GENERATED_CHANNEL_DATA: ChannelData[] = [
  { channel: "E-commerce", marginPct: 38.51, volatilityCV: 0.067, stockoutCount: 7849 },
  { channel: "Supermarket", marginPct: 38.51, volatilityCV: 0.067, stockoutCount: 7997 },
  { channel: "Hypermarket", marginPct: 38.52, volatilityCV: 0.067, stockoutCount: 15848 },
  { channel: "Convenience", marginPct: 38.52, volatilityCV: 0.065, stockoutCount: 1420 },
];

export const GENERATED_PCI_DRIVERS: PCIDriver[] = [
  { label: "Supplier Fragmentation Index", value: 1.2, benchmark: 1 },
  { label: "SKU Proliferation Index", value: 1.02, benchmark: 0.85 },
  { label: "Low Velocity SKU %", value: 0.7227, benchmark: 0.4 },
  { label: "Lead Time Instability (CV)", value: 0.3963, benchmark: 0.15 },
  { label: "Promo Dependency Score", value: 0.0787, benchmark: 0.08 },
  { label: "Avg Portfolio Volatility CV", value: 0.1621, benchmark: 0.08 },
];

export const GENERATED_STOCKOUT_TOP10: StockoutItem[] = [
  { name: "Casual Cotton T-Shirt", category: "Fashion", stockoutCount: 440, safetyStockRatio: 0.0024, netSalesM: 23, segment: "Grow" },
  { name: "Classic Leather Jacket", category: "Fashion", stockoutCount: 440, safetyStockRatio: 0.0036, netSalesM: 16.74, segment: "Grow" },
  { name: "Designer Leather Handbag", category: "Fashion", stockoutCount: 403, safetyStockRatio: 0.0023, netSalesM: 20.4, segment: "Grow" },
  { name: "Green Tea RTD", category: "Beverages", stockoutCount: 364, safetyStockRatio: 0.0681, netSalesM: 4.58, segment: "Rationalize" },
  { name: "Pomegranate Juice 1K", category: "Beverages", stockoutCount: 360, safetyStockRatio: 0.079, netSalesM: 4.09, segment: "Rationalize" },
  { name: "Aloe Vera Drink", category: "Beverages", stockoutCount: 355, safetyStockRatio: 0.0399, netSalesM: 6.67, segment: "Rationalize" },
  { name: "BrandC Chips (Spicy)", category: "Snacks", stockoutCount: 352, safetyStockRatio: 0.0317, netSalesM: 6.12, segment: "Rationalize" },
  { name: "Slim Fit Denim Jeans", category: "Fashion", stockoutCount: 352, safetyStockRatio: 0.0021, netSalesM: 24.46, segment: "Grow" },
  { name: "Running Sports Sneakers", category: "Fashion", stockoutCount: 352, safetyStockRatio: 0.001, netSalesM: 23.4, segment: "Grow" },
  { name: "Sunscreen SPF 50", category: "Beauty", stockoutCount: 349, safetyStockRatio: 0.0017, netSalesM: 21.49, segment: "Keep" },
];

export const GENERATED_TOP_SKUS_REVENUE: TopSKU[] = [
  { name: "Slim Fit Denim Jeans", category: "Fashion", netSalesM: 24.46, grossMarginM: 11.01 },
  { name: "Running Sports Sneakers", category: "Fashion", netSalesM: 23.4, grossMarginM: 10.01 },
  { name: "Coca-Cola 500ml", category: "Beverages", netSalesM: 23.35, grossMarginM: 9.19 },
  { name: "Casual Cotton T-Shirt", category: "Fashion", netSalesM: 23, grossMarginM: 9.47 },
  { name: "Toilet Paper 12-Pack", category: "Household", netSalesM: 21.73, grossMarginM: 5.74 },
];

export const GENERATED_RATIONALIZATION_SCENARIOS: RationalizationScenario[] = [
  { label: "Bottom 10%", skusRemoved: 12, revenueImpact: -1.07, marginImpact: -0.56, safetyStockFreed: 4.71, supplierReduction: 0 },
  { label: "Bottom 20%", skusRemoved: 24, revenueImpact: -3.44, marginImpact: -2.35, safetyStockFreed: 19.19, supplierReduction: 0 },
  { label: "Bottom 30%", skusRemoved: 36, revenueImpact: -7.22, marginImpact: -5.51, safetyStockFreed: 27.2, supplierReduction: 0 },
  { label: "Full Rationalize", skusRemoved: 43, revenueImpact: -12.79, marginImpact: -10.3, safetyStockFreed: 41.52, supplierReduction: 0 },
];
