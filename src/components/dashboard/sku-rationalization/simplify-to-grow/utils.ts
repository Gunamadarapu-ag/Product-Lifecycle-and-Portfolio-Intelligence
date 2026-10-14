/**
 * Utility functions and configurations for Simplify to Grow
 */

import React from 'react';
import { Users, Link2, Layers, Target, Zap, Activity, BarChart3, Scissors, Award } from 'lucide-react';
import { SKUS } from '../../../../constants/data';
import { EnrichedSKU, PillarDef, ComplexityType } from './types';
import { TimelineRange, getFilteredSKUS } from '../../../../utils/timeframe';

export const COMPLEXITY_CONFIG: Record<ComplexityType, { color: string; bg: string; label: string; desc: string }> = {
  'Good Variety':   { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'Good Variety',  desc: 'High IPPV with positive growth. Meets emerging consumer needs — retain & invest.' },
  'Bad Complexity': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Bad Complexity', desc: 'Low IPPV with high operational complexity. Top rationalization priority.' },
  'Neutral':        { color: '#6b7280', bg: 'rgba(107,114,128,0.10)', label: 'Neutral',        desc: 'Moderate IPPV or mixed signals. Monitor quarterly — could shift either way.' },
};

export const CAT_COLORS: Record<string, string> = {
  Beverages: '#6366f1',
  Snacks: '#f59e0b',
  'Personal Care': '#0ea5e9',
  Dairy: '#10b981',
  Household: '#a855f7',
};

export const TAB_ROUTE_ICONS: Record<number, React.ComponentType<any>> = {
  1: Activity,
  3: BarChart3,
  4: Scissors,
  8: Award,
};

export function computeEnrichedSKUs(timelineRange: TimelineRange = '12m'): EnrichedSKU[] {
  const timeframeSkus = getFilteredSKUS(SKUS, timelineRange);
  const enriched = timeframeSkus.map(s => {
    const ros = s.margin / 100;
    const unitProfitPool = s.rev * ros;
    const penetration = (s as any).householdPenetration ?? 0.4;
    const ippvRaw = ros * penetration * unitProfitPool;
    const productionDowntimeCost = parseFloat((s.cx * s.stockouts * 0.8).toFixed(2));
    const transportOverheadCost = parseFloat((s.cx * (s.lead / 10) * 0.5).toFixed(2));
    const wasteWriteOffCost = parseFloat((s.promo * s.cx * s.rev * 0.03).toFixed(2));
    const totalHiddenCost = parseFloat((productionDowntimeCost + transportOverheadCost + wasteWriteOffCost).toFixed(2));
    const stockoutRate = Math.min(s.stockouts / 8, 1);
    const shelfProductivity = parseFloat(((s.val * (1 - stockoutRate)) * 100).toFixed(1));
    return {
      name: s.name, cat: s.cat, rev: s.rev, val: s.val, cx: s.cx,
      margin: s.margin, growth: s.growth, householdPenetration: penetration, promo: s.promo, lead: s.lead,
      ros, unitProfitPool, ippvRaw, ippv: 0,
      complexityType: 'Neutral' as ComplexityType,
      productionDowntimeCost, transportOverheadCost, wasteWriteOffCost, totalHiddenCost, shelfProductivity,
    };
  });
  
  const maxIppv = Math.max(...enriched.map(s => s.ippvRaw));
  enriched.forEach(s => {
    s.ippv = parseFloat(((s.ippvRaw / maxIppv) * 100).toFixed(1));
    if (s.ippv >= 45 && s.growth >= 0) s.complexityType = 'Good Variety';
    else if (s.ippv < 30 && s.cx > 0.50) s.complexityType = 'Bad Complexity';
    else s.complexityType = 'Neutral';
  });
  return enriched;
}

export function computePillars(skus: EnrichedSKU[]): PillarDef[] {
  const avgIppv = skus.reduce((a, s) => a + s.ippv, 0) / skus.length;
  const goodVarietyPct = (skus.filter(s => s.complexityType === 'Good Variety').length / skus.length) * 100;
  const badComplexityPct = (skus.filter(s => s.complexityType === 'Bad Complexity').length / skus.length) * 100;
  const avgShelf = skus.reduce((a, s) => a + s.shelfProductivity, 0) / skus.length;
  const avgHiddenCostRatio = skus.reduce((a, s) => a + (s.totalHiddenCost / (s.rev || 1)), 0) / skus.length;
  const positiveGrowth = skus.filter(s => s.growth > 0).length / skus.length;

  const worstIppvSku = [...skus].sort((a, b) => a.ippv - b.ippv)[0] || { name: 'Fabric Softener' };

  const catNames = Array.from(new Set(skus.map(s => s.cat)));
  const catShelves = catNames.map(cat => {
    const items = skus.filter(s => s.cat === cat);
    const avgShelf = items.reduce((a, s) => a + s.shelfProductivity, 0) / items.length;
    return { cat, avgShelf };
  });
  const worstShelfCat = [...catShelves].sort((a, b) => a.avgShelf - b.avgShelf)[0]?.cat || 'Household';

  const REG_DATA = [
    { country: 'Italy',       skuCount: 100, netSalesM: 137.2, marginPct: 38.53 },
    { country: 'Spain',       skuCount: 100, netSalesM: 106.7, marginPct: 38.60 },
    { country: 'Germany',     skuCount:  98, netSalesM:  88.5, marginPct: 38.48 },
    { country: 'France',      skuCount:  80, netSalesM:  42.6, marginPct: 38.55 },
    { country: 'Austria',     skuCount:  80, netSalesM:  43.0, marginPct: 38.64 },
    { country: 'Poland',      skuCount:  80, netSalesM:  42.4, marginPct: 38.36 },
    { country: 'Netherlands', skuCount:  45, netSalesM:  12.5, marginPct: 38.20 },
  ];
  const sortedRegions = [...REG_DATA]
    .filter(r => r.country !== 'Austria')
    .map(r => ({ ...r, opp: r.netSalesM * (38.64 - r.marginPct) }))
    .sort((a, b) => b.opp - a.opp);
  const worstMarginRegion = sortedRegions[0] || { country: 'Germany' };

  const worstDeclineSku = [...skus].filter(s => s.growth < 0).sort((a, b) => a.growth - b.growth)[0] || { name: 'Aloe Face Wash' };

  return [
    {
      id: 'consumer', pillar: 'Consumer-Right', score: Math.round(avgIppv),
      description: 'Avg IPPV across portfolio. Higher = portfolio prioritises consumer-valued SKUs.',
      icon: Users, color: '#6366f1', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20',
      text: 'text-indigo-600 dark:text-indigo-400', routeTab: 4, routeLabel: 'SKU Rationalization',
      extraParams: `view=simulator&simTab=remove&sku=${encodeURIComponent(worstIppvSku.name)}`,
      kpiLabel: 'Avg IPPV', kpiValue: avgIppv.toFixed(1),
      insight: 'IPPV combines Return on Sales, Household Penetration, and Unit Profit Pool. Low-IPPV SKUs are strong rationalization candidates.',
      topSkus: (skusList: EnrichedSKU[]) => [...skusList].sort((a, b) => b.ippv - a.ippv).slice(0, 3),
      worstSkus: (skusList: EnrichedSKU[]) => [...skusList].sort((a, b) => a.ippv - b.ippv).slice(0, 3),
    },
    {
      id: 'retailer', pillar: 'Retailer Win-Win', score: Math.round(avgShelf),
      description: 'Avg Availability-Adjusted Value Index. Combines commercial value with on-shelf availability.',
      icon: Link2, color: '#0ea5e9', bg: 'bg-sky-500/10', border: 'border-sky-500/20',
      text: 'text-sky-600 dark:text-sky-400', routeTab: 1, routeLabel: 'Portfolio Health Map',
      extraParams: `subtab=ph-kpi&metric=Availability-Adjusted%20Value&category=${encodeURIComponent(worstShelfCat)}`,
      kpiLabel: 'Avg Availability-Adj. Value', kpiValue: avgShelf.toFixed(1),
      insight: 'Availability-Adjusted Value = Commercial Value × (1 − Stockout Rate). Low scores signal opportunity for joint assortment planning with retailers.',
      topSkus: (skusList: EnrichedSKU[]) => [...skusList].sort((a, b) => b.shelfProductivity - a.shelfProductivity).slice(0, 3),
      worstSkus: (skusList: EnrichedSKU[]) => [...skusList].sort((a, b) => a.shelfProductivity - b.shelfProductivity).slice(0, 3),
    },
    {
      id: 'valuechain', pillar: 'Value Chain Efficient', score: Math.max(0, Math.round(100 - avgHiddenCostRatio * 200)),
      description: 'Complexity P&L health. Measures how well hidden costs (downtime, transport, waste) are controlled.',
      icon: Layers, color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400', routeTab: 3, routeLabel: 'Profitability Tree',
      extraParams: `simCountry=${encodeURIComponent(worstMarginRegion.country)}`,
      kpiLabel: 'Avg Hidden Cost Ratio', kpiValue: (avgHiddenCostRatio * 100).toFixed(1) + '%',
      insight: 'Hidden costs include production downtime for small runs, transport overhead, and promo-driven waste. De-averaging shared costs reveals the true P&L of each SKU.',
      topSkus: (skusList: EnrichedSKU[]) => [...skusList].sort((a, b) => a.totalHiddenCost - b.totalHiddenCost).slice(0, 3),
      worstSkus: (skusList: EnrichedSKU[]) => [...skusList].sort((a, b) => b.totalHiddenCost - a.totalHiddenCost).slice(0, 3),
    },
    {
      id: 'e2e', pillar: 'End-to-End Value', score: Math.round(positiveGrowth * 100 * 0.85 + goodVarietyPct * 0.15),
      description: 'Cross-functional value creation. % of portfolio with positive growth balanced with Good Variety classification.',
      icon: Target, color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400', routeTab: 4, routeLabel: 'SKU Rationalization',
      extraParams: `view=analyst&sku=${encodeURIComponent(worstDeclineSku.name)}`,
      kpiLabel: 'Positive Growth SKUs', kpiValue: Math.round(positiveGrowth * 100) + '%',
      insight: 'End-to-End Value requires Finance, Marketing, Commercial, and Supply to jointly govern SKU decisions. Good Variety SKUs should be protected.',
      topSkus: (skusList: EnrichedSKU[]) => [...skusList].sort((a, b) => b.growth - a.growth).slice(0, 3),
      worstSkus: (skusList: EnrichedSKU[]) => [...skusList].sort((a, b) => a.growth - b.growth).slice(0, 3),
    },
    {
      id: 'momentum', pillar: 'Momentum & Muscle', score: Math.round(100 - badComplexityPct),
      description: 'Portfolio simplification health. % of SKUs that are NOT Bad Complexity.',
      icon: Zap, color: '#a855f7', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
      text: 'text-purple-600 dark:text-purple-400', routeTab: 8, routeLabel: 'SKU Assortment',
      extraParams: 'subTab=guided&step=2',
      kpiLabel: 'Bad Complexity %', kpiValue: badComplexityPct.toFixed(0) + '%',
      insight: 'Sustained simplification requires embedding SKU productivity into S&OP, budgeting, and NPD gate reviews. Bad Complexity % should be tracked quarterly.',
      topSkus: (skusList: EnrichedSKU[]) => skusList.filter(s => s.complexityType === 'Good Variety').slice(0, 3),
      worstSkus: (skusList: EnrichedSKU[]) => skusList.filter(s => s.complexityType === 'Bad Complexity').slice(0, 3),
    },
  ];
}
