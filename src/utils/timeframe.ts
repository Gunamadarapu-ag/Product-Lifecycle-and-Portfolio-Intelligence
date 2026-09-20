/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SKU, PortfolioItem, KPI, RegionalData, ChannelData, StockoutItem } from '../types/dashboard';

export type TimelineRange = '1m' | '3m' | '6m' | '12m' | '24m' | '36m';

/**
 * Deterministic pseudo-random number generator.
 * Returns a float between -1 and 1 based on seed keys.
 * This guarantees the numbers are stable per timeframe but look randomized (noisy).
 */
export function getDeterministicNoise(seed: string, timeframe: TimelineRange): number {
  let hash = 0;
  const combined = seed + timeframe;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Extract a fractional float in [-1.0, 1.0]
  return (Math.abs(hash % 1000) / 500) - 1;
}

/**
 * Returns the scale multiplier for additive metrics (sales, stockouts).
 */
export function getTimeframeScale(timeframe: TimelineRange): number {
  switch (timeframe) {
    case '1m': return 1 / 12; // 0.0833
    case '3m': return 3 / 12; // 0.2500
    case '6m': return 6 / 12; // 0.5000
    case '12m': return 1.0;
    case '24m': return 2.0;
    case '36m': return 3.0;
    default: return 1.0;
  }
}

/**
 * Scales revenue and adds deterministic noise (range: ±5%)
 */
export function getAdjustedRevenue(baseRev: number, name: string, timeframe: TimelineRange): number {
  const scale = getTimeframeScale(timeframe);
  const noise = getDeterministicNoise(name, timeframe) * 0.05; // ±5% noise
  const scaled = baseRev * scale * (1 + noise);
  return parseFloat(scaled.toFixed(2));
}

/**
 * Scales stockouts and adds deterministic noise (range: ±10%)
 */
export function getAdjustedStockouts(baseStockouts: number, name: string, timeframe: TimelineRange): number {
  const scale = getTimeframeScale(timeframe);
  if (baseStockouts <= 0) return 0;
  const noise = getDeterministicNoise(name, timeframe) * 0.10; // ±10% noise
  const scaled = Math.round(baseStockouts * scale * (1 + noise));
  return Math.max(1, scaled); // default to at least 1 stockout if original was > 0
}

/**
 * Adjusts average margins (since margin is non-additive, it shifts slightly based on historical conditions)
 */
export function getAdjustedMargin(baseMargin: number, name: string, timeframe: TimelineRange): number {
  const noise = getDeterministicNoise(name, timeframe) * 1.2; // ±1.2 percentage points SKU variation
  let drift = 0;
  
  // Simulate margin compression recently (inflation) vs. historical better cost structures
  switch (timeframe) {
    case '1m': drift = -1.5; break;
    case '3m': drift = -0.8; break;
    case '6m': drift = -0.3; break;
    case '12m': drift = 0; break;
    case '24m': drift = 0.5; break;
    case '36m': drift = 1.1; break;
  }
  
  const finalMargin = baseMargin + drift + noise;
  return parseFloat(Math.max(5, Math.min(95, finalMargin)).toFixed(2));
}

/**
 * Adjusts growth rates (shorter periods are more volatile; multi-year averages are more stable)
 */
export function getAdjustedGrowth(baseGrowth: number, name: string, timeframe: TimelineRange, isDecimal = true): number {
  const multiplier = isDecimal ? 1 : 100;
  const noise = getDeterministicNoise(name + 'growth', timeframe) * 0.03 * multiplier; // ±3% noise
  let drift = 0;
  
  // Shorter periods are slightly positive or negative depending on seasonal trends
  switch (timeframe) {
    case '1m': drift = 0.02 * multiplier; break;
    case '3m': drift = 0.01 * multiplier; break;
    case '24m': drift = -0.01 * multiplier; break;
    case '36m': drift = -0.015 * multiplier; break;
  }
  
  const finalGrowth = baseGrowth + drift + noise;
  return parseFloat(finalGrowth.toFixed(isDecimal ? 4 : 2));
}

/**
 * Adjusts portfolio complexity index (PCI) globally
 */
export function getAdjustedPci(basePci: number, timeframe: TimelineRange): number {
  let drift = 0;
  switch (timeframe) {
    case '1m': drift = 0.0311; break;
    case '3m': drift = 0.0171; break;
    case '6m': drift = 0.0081; break;
    case '12m': drift = 0; break;
    case '24m': drift = -0.0159; break;
    case '36m': drift = -0.0309; break;
  }
  return parseFloat((basePci + drift).toFixed(4));
}

/**
 * Filters the SKUS list
 */
export function getFilteredSKUS(baseSkus: SKU[], timeframe: TimelineRange): SKU[] {
  return baseSkus.map(s => ({
    ...s,
    rev: getAdjustedRevenue(s.rev, s.name, timeframe),
    stockouts: getAdjustedStockouts(s.stockouts, s.name, timeframe),
    margin: getAdjustedMargin(s.margin, s.name, timeframe),
    growth: getAdjustedGrowth(s.growth, s.name, timeframe, true),
    lead: Math.max(2, Math.round(s.lead + getDeterministicNoise(s.name, timeframe) * 2))
  }));
}

/**
 * Filters the PORTFOLIO_DATA list
 */
export function getFilteredPortfolioData(basePortfolio: PortfolioItem[], timeframe: TimelineRange): PortfolioItem[] {
  return basePortfolio.map(p => {
    const adjustedRev = getAdjustedRevenue(p.netSales, p.name, timeframe);
    const adjustedMargin = getAdjustedMargin(p.margin, p.name, timeframe);
    const adjustedStockouts = p.stockouts !== undefined ? getAdjustedStockouts(p.stockouts, p.name, timeframe) : undefined;
    const adjustedGrowth = getAdjustedGrowth(p.growth, p.name, timeframe, false);
    
    // Recalculate commercial value and complexity scores slightly based on scaled values
    const valueNoise = Math.round(getDeterministicNoise(p.name, timeframe) * 4);
    const complexityNoise = Math.round(getDeterministicNoise(p.name + 'cx', timeframe) * 4);
    const newValue = Math.max(1, Math.min(99, p.value + valueNoise));
    const newComplexity = Math.max(1, Math.min(99, p.complexity + complexityNoise));
    
    return {
      ...p,
      netSales: adjustedRev,
      margin: adjustedMargin,
      stockouts: adjustedStockouts,
      growth: adjustedGrowth,
      value: newValue,
      complexity: newComplexity
    };
  });
}

/**
 * Filters the aggregate KPI strip based on timeframe configurations
 */
export function getFilteredKPIS(baseKpis: KPI[], timeframe: TimelineRange): KPI[] {
  const scale = getTimeframeScale(timeframe);
  return baseKpis.map(kpi => {
    let newValue = kpi.value;
    let newTrendVal = kpi.trendValue;
    
    if (kpi.label === 'Net Sales (Portfolio)') {
      // Annualized/scaled net sales
      const scaledVal = 473 * scale * (1 + getDeterministicNoise('sales_kpi', timeframe) * 0.02);
      newValue = `$${Math.round(scaledVal)}M`;
      newTrendVal = timeframe === '12m' ? '+8.3% YoY' : 
                    timeframe === '24m' ? '+7.9% YoY CAGR' : 
                    timeframe === '36m' ? '+8.1% YoY CAGR' : `vs. Prior Period`;
    } else if (kpi.label === 'Avg Gross Margin') {
      const margin = getAdjustedMargin(38.53, 'avg_margin_kpi', timeframe);
      newValue = `${margin.toFixed(2)}%`;
      const diff = margin - 40.0;
      newTrendVal = diff < 0 ? `${diff.toFixed(2)}% vs bench` : `+${diff.toFixed(2)}% vs bench`;
    } else if (kpi.label === 'Portfolio PCI') {
      const pci = getAdjustedPci(0.5509, timeframe);
      newValue = pci.toFixed(4);
      newTrendVal = timeframe === '12m' ? '+0.02 vs prior' : `Target: 0.4200`;
    } else if (kpi.label === 'Long-Tail SKU Burden') {
      let baseBurden = 66.7;
      if (timeframe === '1m') baseBurden = 68.2;
      else if (timeframe === '3m') baseBurden = 67.5;
      else if (timeframe === '6m') baseBurden = 67.0;
      else if (timeframe === '24m') baseBurden = 65.5;
      else if (timeframe === '36m') baseBurden = 64.2;
      newValue = `${baseBurden.toFixed(1)}%`;
    } else if (kpi.label === 'Rationalize Candidates') {
      let baseCount = 35;
      if (timeframe === '1m') baseCount = 38;
      else if (timeframe === '3m') baseCount = 37;
      else if (timeframe === '6m') baseCount = 36;
      else if (timeframe === '24m') baseCount = 32;
      else if (timeframe === '36m') baseCount = 30;
      newValue = `${baseCount} SKUs`;
    } else if (kpi.label === 'Peak Stockout Freq.') {
      const baseFreq = 440;
      const count = Math.round(baseFreq * scale * (1 + getDeterministicNoise('stockout_freq_kpi', timeframe) * 0.05));
      newValue = `${count} events`;
    } else if (kpi.label === 'Revenue Tail Risk') {
      let baseRisk = 27.08;
      const noise = getDeterministicNoise('tail_risk_kpi', timeframe) * 0.8;
      newValue = `${(baseRisk + noise).toFixed(2)}%`;
    }
    
    return {
      ...kpi,
      value: newValue,
      trendValue: newTrendVal
    };
  });
}

/**
 * Scales and filters regional data
 */
export function getFilteredRegionalData(baseRegional: RegionalData[], timeframe: TimelineRange): RegionalData[] {
  return baseRegional.map(r => {
    const scale = getTimeframeScale(timeframe);
    const noise = getDeterministicNoise(r.country, timeframe) * 0.03;
    const adjustedSales = r.netSalesM * scale * (1 + noise);
    const adjustedMargin = getAdjustedMargin(r.marginPct, r.country, timeframe);
    
    return {
      ...r,
      netSalesM: parseFloat(adjustedSales.toFixed(2)),
      marginPct: adjustedMargin
    };
  });
}


