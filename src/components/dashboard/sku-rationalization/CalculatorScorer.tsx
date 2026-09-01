/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Link as LinkIcon, HelpCircle, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, 
  Sparkles, Sliders, Activity, BadgePercent
} from 'lucide-react';
import { SKUS } from '../../../constants/data';

interface CalculatorScorerProps {
  skuA: string;
  setSkuA: (val: string) => void;
  skuB: string;
  setSkuB: (val: string) => void;
  correlation: number;
  setCorrelation: (val: number) => void;
  category: string;
  hasScored: boolean;
  setHasScored: (val: boolean) => void;
  skusByCategory: Record<string, typeof SKUS>;
  skuACategory: string;
  skuBOptions: typeof SKUS;
  pairRisk: number;
  riskVerdict: string;
  verdictColor: string;
  onInspectSku: (skuName: string) => void;
}

export const CalculatorScorer: React.FC<CalculatorScorerProps> = ({
  skuA,
  setSkuA,
  skuB,
  setSkuB,
  correlation,
  setCorrelation,
  category,
  hasScored,
  setHasScored,
  skusByCategory,
  skuACategory,
  skuBOptions,
  pairRisk,
  riskVerdict,
  verdictColor,
  onInspectSku
}) => {
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'baseline' | 'target' | 'max'>('baseline');
  const [isCommitted, setIsCommitted] = useState(false);

  // Reset override states on SKU/correlation change
  React.useEffect(() => {
    setSelectedScenario('baseline');
    setIsCommitted(false);
  }, [skuA, skuB, correlation]);

  // Lookup SKU details
  const skuAObj = SKUS.find(s => s.name === skuA);
  const skuBObj = SKUS.find(s => s.name === skuB);

  // Compute similarity score
  const getSimilarityScore = (nameA: string, nameB: string) => {
    if (!nameA || !nameB) return 0;
    let score = 30; // base similarity for same-category items
    const wordsA = nameA.toLowerCase().split(' ');
    const wordsB = nameB.toLowerCase().split(' ');
    
    // Brand match (first word, e.g. "Mango" or "BrandB")
    if (wordsA[0] === wordsB[0]) {
      score += 40;
    }
    // Check for size differences or key words
    const hasSizeA = wordsA.some(w => w.includes('ml') || w.includes('g') || w.includes('l') || w.includes('kg') || w.includes('1l'));
    const hasSizeB = wordsB.some(w => w.includes('ml') || w.includes('g') || w.includes('l') || w.includes('kg') || w.includes('1l'));
    if (hasSizeA && hasSizeB) {
      score += 15;
    }
    // Suffix overlap (e.g., both contain "Fizz" or "Yogurt")
    const commonWords = wordsA.filter(w => wordsB.includes(w) && w !== wordsA[0]);
    if (commonWords.length > 0) {
      score += 15 * commonWords.length;
    }
    return Math.min(95, score);
  };

  const similarityScore = skuA && skuB ? getSimilarityScore(skuA, skuB) : 0;

  let similarityVerdict = 'Low Substitutability';
  let similarityColor = 'text-green-500 bg-green-500/10 border-green-500/20';
  if (similarityScore >= 70) {
    similarityVerdict = 'High Substitutability';
    similarityColor = 'text-red-500 bg-red-500/10 border-red-500/20';
  } else if (similarityScore >= 40) {
    similarityVerdict = 'Moderate';
    similarityColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  }

  // Pre-calculate transference scenarios
  const defaultDtr = Math.round(pairRisk * 100);
  const targetDtr = Math.min(95, defaultDtr + 20);
  const maxDtr = 95;

  const revA = skuAObj ? skuAObj.rev : 0;
  const marginA = skuAObj ? skuAObj.margin : 0;
  const revB = skuBObj ? skuBObj.rev : 0;
  const marginB = skuBObj ? skuBObj.margin : 0;

  const getTransferenceMetrics = (dtr: number) => {
    const transferred = revA * (dtr / 100);
    const leaked = revA * (1 - dtr / 100) * 0.6;
    const defection = revA * (1 - dtr / 100) * 0.4;
    const netRevenue = -revA + transferred;

    const oldProf = (revA * marginA / 100) + (revB * marginB / 100);
    const newProf = (revB + transferred) * marginB / 100;
    const netProfit = newProf - oldProf;

    const oldBMargin = (revA + revB) > 0 ? (oldProf / (revA + revB)) * 100 : 0;
    const newBMargin = marginB;
    const netMargin = newBMargin - oldBMargin;

    return {
      dtr,
      transferred,
      leaked,
      defection,
      netRevenue,
      netProfit,
      netMargin
    };
  };

  const baselineMetrics = getTransferenceMetrics(defaultDtr);
  const targetMetrics = getTransferenceMetrics(targetDtr);
  const maxMetrics = getTransferenceMetrics(maxDtr);

  // Selected scenario outcomes
  const activeMetrics = 
    selectedScenario === 'baseline' ? baselineMetrics :
    selectedScenario === 'target' ? targetMetrics :
    maxMetrics;

  const activeDtr = activeMetrics.dtr;
  const transferredRev = activeMetrics.transferred;
  const leakedRev = activeMetrics.leaked;
  const defectionRev = activeMetrics.defection;
  const netRevenueImpact = activeMetrics.netRevenue;
  const netProfitImpact = activeMetrics.netProfit;
  const netMarginDelta = activeMetrics.netMargin;

  const handleCommit = () => {
    setIsCommitted(true);
    setTimeout(() => {
      setIsCommitted(false);
    }, 4000);
  };

  return (
    <div className="glass-card bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 p-5 rounded-xl shadow-sm space-y-5">
      
      {/* ① RATIONALIZATION DIAGNOSTIC GUIDE SECTION */}
      <div>
        <button 
          type="button"
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full text-left font-bold text-xs uppercase tracking-widest text-[#8b5cf6] dark:text-purple-300 flex justify-between items-center cursor-pointer border-none bg-transparent outline-none"
        >
          <span className="flex items-center gap-2">
            <HelpCircle size={14} className="text-acies-yellow" />
            Rationalization Diagnostic Guide
          </span>
          <span className="text-[10px]">{guideOpen ? '✕ Collapse Info' : '▲ Expand Info'}</span>
        </button>

        {guideOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-black/5 dark:border-white/5 mt-3 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-semibold animate-fadeIn">
            <div className="space-y-1">
              <h4 className="font-bold text-acies-gray dark:text-white uppercase text-[9px] tracking-wider text-[#8b5cf6]">1. Cannibalization Scatter Map</h4>
              <p>Represents variant overlaps. Bubble size denotes revenue at risk. Click bubbles to auto-load pairs inside the scorer card.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-acies-gray dark:text-white uppercase text-[9px] tracking-wider text-[#8b5cf6]">2. Promotional Erosion Analysis</h4>
              <p>Lists SKUs with high promo dependencies. Products with &gt;40% discount dependency erode margin equity and represent rationalization priorities.</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-acies-gray dark:text-white uppercase text-[9px] tracking-wider text-[#8b5cf6]">3. Score SKU Pairs Calculator</h4>
              <p>Evaluates correlation coefficients. Large negative numbers reflect substitution shifts where promo items cannibalize organic baselines.</p>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-black/5 dark:bg-white/5" />

      {/* ② INTERACTIVE PAIR SCORER CALCULATOR SECTION */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 text-acies-gray dark:text-white">
          <LinkIcon size={12} className="text-acies-yellow" />
          Score a Variant SKU Pair
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[8px] font-bold uppercase tracking-widest opacity-45">SKU A (Base Variant)</label>
              <button 
                type="button"
                onClick={() => onInspectSku(skuA)}
                className="text-[8px] text-[#8b5cf6] dark:text-purple-300 font-bold uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent outline-none"
              >
                Inspect ℹ®
              </button>
            </div>
            <select 
              value={skuA}
              onChange={(e) => setSkuA(e.target.value)}
              className="bg-black/5 dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded px-2.5 py-2 text-xs font-semibold text-acies-gray dark:text-white outline-none focus:border-acies-yellow"
            >
              {(Object.entries(skusByCategory) as [string, any[]][]).map(([cat, list]) => (
                <optgroup key={`optg-a-${cat}`} label={cat.toUpperCase()} className="font-extrabold text-[8px] tracking-wider text-zinc-400 dark:text-zinc-500 bg-white dark:bg-[#1a1a24] py-1">
                  {list.map(s => (
                    <option key={`a-${s.name}`} value={s.name} className="dark:bg-[#1a1a24] text-xs font-semibold text-zinc-800 dark:text-white">{s.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[8px] font-bold uppercase tracking-widest opacity-45">SKU B (Compare Variant)</label>
              <button 
                type="button"
                onClick={() => onInspectSku(skuB)}
                className="text-[8px] text-[#8b5cf6] dark:text-purple-300 font-bold uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent outline-none"
              >
                Inspect ℹ®
              </button>
            </div>
            <select 
              value={skuB}
              onChange={(e) => setSkuB(e.target.value)}
              className="bg-black/5 dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded px-2.5 py-2 text-xs font-semibold text-acies-gray dark:text-white outline-none focus:border-acies-yellow"
            >
              <optgroup label={`${skuACategory.toUpperCase()} VARIANTS`} className="font-extrabold text-[8px] tracking-wider text-zinc-400 dark:text-zinc-500 bg-white dark:bg-[#1a1a24] py-1">
                {skuBOptions.map(s => (
                  <option key={`b-${s.name}`} value={s.name} className="dark:bg-[#1a1a24] text-xs font-semibold text-zinc-800 dark:text-white">{s.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-bold uppercase tracking-widest opacity-45">Promo-Sales Cross Correlation</label>
            <input 
              type="number" 
              value={correlation}
              step="0.01"
              min="-1"
              max="0"
              onChange={(e) => setCorrelation(parseFloat(e.target.value) || 0)}
              className="bg-black/5 dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded px-2.5 py-2 text-xs font-semibold text-acies-gray dark:text-white outline-none focus:border-acies-yellow"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-bold uppercase tracking-widest opacity-45">Category</label>
            <input 
              type="text" 
              value={category}
              disabled
              className="bg-black/5 dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded px-2.5 py-2.5 text-xs font-bold text-zinc-400 dark:text-zinc-500 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-5 pt-4 border-t border-black/5 dark:border-white/5">
          <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold">
            Tip: Adjust correlation values to see calculated risk shift
          </span>
          <button 
            type="button"
            onClick={() => setHasScored(true)}
            className="px-5 py-2 bg-acies-gray text-white dark:bg-white dark:text-acies-gray text-[9px] font-bold uppercase tracking-widest hover:bg-acies-yellow hover:text-acies-gray hover:dark:text-white transition-all cursor-pointer border-none rounded"
          >
            Calculate displacement
          </button>
        </div>
      </div>

      {/* ③ DISPLACEMENT ASSESSMENT VERDICT SECTION */}
      {hasScored && (
        <>
          <div className="h-px bg-black/5 dark:bg-white/5" />
          
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-acies-gray dark:text-white">
                Displacement Assessment Verdict:
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded border ${verdictColor}`}>
                  {riskVerdict}
                </span>
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold uppercase tracking-widest opacity-45">Substitutability:</span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border ${similarityColor}`}>
                  {similarityScore}% Similarity ({similarityVerdict})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-black/5 dark:bg-[#121214]/60 border border-black/5 dark:border-white/5 rounded text-center">
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-45 mb-1">Variant A (To delist)</p>
                <h5 className="text-[11px] font-bold truncate text-acies-gray dark:text-white" title={skuA}>{skuA}</h5>
                <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 mt-0.5">${revA} M · Margin {marginA}%</p>
              </div>
              <div className="p-3 bg-black/5 dark:bg-[#121214]/60 border border-black/5 dark:border-white/5 rounded text-center">
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-45 mb-1">Variant B (Substitute)</p>
                <h5 className="text-[11px] font-bold truncate text-acies-gray dark:text-white" title={skuB}>{skuB}</h5>
                <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 mt-0.5">${revB} M · Margin {marginB}%</p>
              </div>
              <div className="p-3 bg-black/5 dark:bg-[#121214]/60 border border-black/5 dark:border-white/5 rounded text-center">
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-45 mb-1">Cross Correlation</p>
                <h5 className="text-base font-display font-extrabold text-[#8b5cf6] dark:text-purple-300">{correlation.toFixed(2)}</h5>
                <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mt-0.5">Substitution strength</p>
              </div>
              <div className="p-3 bg-black/5 dark:bg-[#121214]/60 border border-black/5 dark:border-white/5 rounded text-center">
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-45 mb-1">Substitution Threat</p>
                <h5 className="text-base font-display font-extrabold text-acies-gray dark:text-white">{(pairRisk * 100).toFixed(0)}%</h5>
                <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mt-0.5">Transfer potential</p>
              </div>
            </div>

            <div className="h-px bg-black/5 dark:bg-white/5" />

            {/* ④ DEMAND TRANSFERENCE & ASSORTMENT SIMULATOR */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-between flex-wrap">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 text-acies-gray dark:text-white">
                    <Sliders size={12} className="text-acies-yellow" />
                    Demand Transference & Assortment Simulator
                  </h4>
                  <p className="text-[9px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-wider">
                    Compare outcomes across distinct transfer scenarios to determine the optimal strategy
                  </p>
                </div>
              </div>

              {/* Scenario Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'baseline',
                    name: 'Scenario 1: Baseline',
                    dtr: defaultDtr,
                    metrics: baselineMetrics,
                    desc: 'Conservative correlation default'
                  },
                  {
                    id: 'target',
                    name: 'Scenario 2: Targeted Push',
                    dtr: targetDtr,
                    metrics: targetMetrics,
                    desc: 'With +20% promotion focus'
                  },
                  {
                    id: 'max',
                    name: 'Scenario 3: Max Retention',
                    dtr: maxDtr,
                    metrics: maxMetrics,
                    desc: 'Optimal brand retention target'
                  }
                ].map((scen) => {
                  const isActive = selectedScenario === scen.id;
                  const profitIsPositive = scen.metrics.netProfit >= 0;
                  return (
                    <div 
                      key={scen.id}
                      onClick={() => setSelectedScenario(scen.id as any)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between h-28 ${
                        isActive
                          ? 'bg-[#8b5cf6]/5 border-[#8b5cf6] shadow-sm shadow-[#8b5cf6]/10'
                          : 'bg-black/5 dark:bg-[#121214]/30 border-black/10 dark:border-white/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold uppercase text-acies-gray dark:text-white leading-none">{scen.name}</span>
                          {isActive && <CheckCircle2 size={11} className="text-[#8b5cf6] stroke-[3]" />}
                        </div>
                        <span className="text-[8px] font-bold uppercase text-zinc-500 dark:text-zinc-500">{scen.desc}</span>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-bold text-zinc-400 uppercase leading-none">DTR</span>
                          <span className="text-sm font-black text-acies-gray dark:text-white leading-none mt-1">{scen.dtr}%</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[7.5px] font-bold text-zinc-400 uppercase leading-none">Net Profit</span>
                          <span className={`text-[11px] font-extrabold leading-none mt-1 ${profitIsPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {scen.metrics.netProfit >= 0 ? '+' : ''}${scen.metrics.netProfit.toFixed(1)} M
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stacked Progress Bar visual flow */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase text-zinc-500">
                  <span>Scenario Demand Redistribution Flow</span>
                </div>
                <div className="h-4.5 w-full bg-black/10 dark:bg-white/10 rounded-lg overflow-hidden flex text-[9px] font-black text-white shadow-inner">
                  {activeDtr > 0 && (
                    <div 
                      style={{ width: `${activeDtr}%` }} 
                      className="bg-emerald-500 h-full flex items-center justify-center transition-all duration-300"
                      title="Retained Volume"
                    >
                      {activeDtr >= 8 ? `${activeDtr}%` : ''}
                    </div>
                  )}
                  {((100 - activeDtr) * 0.6) > 0 && (
                    <div 
                      style={{ width: `${(100 - activeDtr) * 0.6}%` }} 
                      className="bg-red-500 h-full flex items-center justify-center transition-all duration-300"
                      title="Competitor Leakage"
                    >
                      {((100 - activeDtr) * 0.6) >= 8 ? `${Math.round((100 - activeDtr) * 0.6)}%` : ''}
                    </div>
                  )}
                  {((100 - activeDtr) * 0.4) > 0 && (
                    <div 
                      style={{ width: `${(100 - activeDtr) * 0.4}%` }} 
                      className="bg-amber-500 h-full flex items-center justify-center transition-all duration-300"
                      title="Category Defection"
                    >
                      {((100 - activeDtr) * 0.4) >= 8 ? `${Math.round((100 - activeDtr) * 0.4)}%` : ''}
                    </div>
                  )}
                </div>

                {/* Legend metrics grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] font-bold">
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 block shrink-0" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Sibling Retained:</span>
                      <span className="text-emerald-500">${transferredRev.toFixed(1)} M</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <span className="w-2.5 h-2.5 rounded bg-red-500 block shrink-0" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Competitor Leak:</span>
                      <span className="text-red-500">${leakedRev.toFixed(1)} M</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 block shrink-0" />
                    <div className="flex-1 flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Category Defect:</span>
                      <span className="text-amber-500">${defectionRev.toFixed(1)} M</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial KPI impacts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-black/5 dark:bg-[#121214]/40 border border-black/5 dark:border-white/5 rounded-lg text-center space-y-0.5">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Net Revenue Shift</p>
                  <h5 className={`text-base font-display font-extrabold ${netRevenueImpact >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {netRevenueImpact >= 0 ? '+' : ''}${netRevenueImpact.toFixed(1)} M
                  </h5>
                  <p className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-wide">
                    {((netRevenueImpact / (revA || 1)) * 100).toFixed(0)}% of SKU A
                  </p>
                </div>
                <div className="p-3 bg-black/5 dark:bg-[#121214]/40 border border-black/5 dark:border-white/5 rounded-lg text-center space-y-0.5">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Absolute Profit Impact</p>
                  <h5 className={`text-base font-display font-extrabold ${netProfitImpact >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {netProfitImpact >= 0 ? '+' : ''}${netProfitImpact.toFixed(2)} M
                  </h5>
                  <p className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-wide">
                    {netProfitImpact >= 0 ? 'Margin Leverage' : 'Profit Compression'}
                  </p>
                </div>
                <div className="p-3 bg-black/5 dark:bg-[#121214]/40 border border-black/5 dark:border-white/5 rounded-lg text-center space-y-0.5">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Blended Margin Shift</p>
                  <h5 className={`text-base font-display font-extrabold ${netMarginDelta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {netMarginDelta >= 0 ? '+' : ''}{netMarginDelta.toFixed(2)}pp
                  </h5>
                  <p className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-wide">
                    Blended portfolio rate
                  </p>
                </div>
              </div>

              {/* Dynamic Alert Banner based on profit impact */}
              {netProfitImpact >= 0 ? (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded-lg text-[10.5px] font-semibold leading-relaxed flex gap-2.5 items-start">
                  <Sparkles size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-emerald-700 dark:text-emerald-200 text-[11px] mb-0.5 uppercase tracking-wide">
                      ✨ Positive Margin Leverage Detected
                    </strong>
                    Delisting the lower-margin SKU A ({marginA}%) and redirecting demand to the higher-margin substitute SKU B ({marginB}%) increases net absolute portfolio profitability by <strong className="font-extrabold">${netProfitImpact.toFixed(2)} M</strong>, despite some revenue defection. This represents an optimal consolidation scenario.
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 rounded-lg text-[10.5px] font-semibold leading-relaxed flex gap-2.5 items-start">
                  <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <strong className="font-bold block text-red-700 dark:text-red-200 text-[11px] mb-0.5 uppercase tracking-wide">
                      ⚠️ Margin Dilution Risk
                    </strong>
                    Delisting SKU A leads to a net profit decline of <strong className="font-extrabold">${Math.abs(netProfitImpact).toFixed(2)} M</strong> because the substitute SKU B&apos;s margin ({marginB}%) is not high enough to compensate for the leaked demand ({Math.round(100 - activeDtr)}%). Consider executing a price increase on SKU A or launching structural cost-cutting on SKU B first.
                  </div>
                </div>
              )}

              {/* Commit action desk button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={isCommitted}
                  className={`px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest rounded transition-all cursor-pointer border-none flex items-center gap-2 ${
                    isCommitted 
                      ? 'bg-emerald-500 text-white shadow-md cursor-default'
                      : 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white hover:shadow-lg hover:shadow-[#8b5cf6]/20'
                  }`}
                >
                  {isCommitted ? (
                    <>
                      <CheckCircle2 size={12} className="stroke-[3]" />
                      <span>Scenario registered in assortment ledger</span>
                    </>
                  ) : (
                    <>
                      <Activity size={12} />
                      <span>Commit to Assortment Scenario</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
};
