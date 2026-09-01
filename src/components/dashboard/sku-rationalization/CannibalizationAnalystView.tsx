/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Cell, LabelList,
  BarChart, Bar, ReferenceLine 
} from 'recharts';
import { Activity, X } from 'lucide-react';
import { SKUS } from '../../../constants/data';
import { CalculatorScorer } from './CalculatorScorer';
import { ActionRoutingPanel } from './ActionRoutingPanel';

interface CannibalizationAnalystViewProps {
  skuA: string;
  setSkuA: (name: string) => void;
  skuB: string;
  setSkuB: (name: string) => void;
  correlation: number;
  setCorrelation: (val: number) => void;
  category: string;
  hasScored: boolean;
  setHasScored: (val: boolean) => void;
  selectedRoutingTeam: number;
  setSelectedRoutingTeam: (idx: number) => void;
  setSelectedSkuDetails: (sku: any | null) => void;
  
  // derived / data
  skuACategory: string;
  skuBOptions: any[];
  skusByCategory: Record<string, any[]>;
  pairRisk: number;
  riskVerdict: string;
  verdictColor: string;
  scatterPairsData: any[];
  promoErosionData: any[];
  highRiskPairs: number;
  moderateRiskPairs: number;
  promoRiskSkus: number;
  handleAnalystScatterClick: (node: any) => void;

  // theming / visual
  isDarkMode: boolean;
  gridStroke: string;
  tickColor: string;
  // These three were passed by the parent and destructured below, but never
  // declared here — invisible while React was untyped.
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  // Control Center additions
  completedSteps: Record<string, boolean>;
  setStepCompleted: (pairKey: string, team: string, stepIdx: number, completed: boolean) => void;
  resetPairWorkflow: (pairKey: string) => void;
  shortlistedSkus: string[];
  shortlistSku: (name: string) => void;
  unshortlistSku: (name: string) => void;
  frozenSkus: string[];
  freezeSkuReplenishment: (name: string) => void;
  unfreezeSkuReplenishment: (name: string) => void;
  auditLog: any[];
  isControlCenterOpen: boolean;
  setIsControlCenterOpen: (open: boolean) => void;
  logAction: (team: string, stepLabel: string, details: string, rationale: string) => void;
  removeActionLog: (pairKey: string, stepLabel: string) => void;
}

export const CannibalizationAnalystView: React.FC<CannibalizationAnalystViewProps> = ({
  skuA,
  setSkuA,
  skuB,
  setSkuB,
  correlation,
  setCorrelation,
  category,
  hasScored,
  setHasScored,
  selectedRoutingTeam,
  setSelectedRoutingTeam,
  setSelectedSkuDetails,
  skuACategory,
  skuBOptions,
  skusByCategory,
  pairRisk,
  riskVerdict,
  verdictColor,
  scatterPairsData,
  promoErosionData,
  highRiskPairs,
  moderateRiskPairs,
  promoRiskSkus,
  handleAnalystScatterClick,
  isDarkMode,
  gridStroke,
  tickColor,
  tooltipBg,
  tooltipBorder,
  tooltipText,
  completedSteps,
  setStepCompleted,
  resetPairWorkflow,
  shortlistedSkus,
  shortlistSku,
  unshortlistSku,
  frozenSkus,
  freezeSkuReplenishment,
  unfreezeSkuReplenishment,
  auditLog,
  isControlCenterOpen,
  setIsControlCenterOpen,
  logAction,
  removeActionLog,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
      
      {/* Left Column: Charts & Matrices (Immediate Visibility) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Cannibalization Scatter Map (Interacts with Pair Scorer on click) */}
        <div id="cannibalization-section" style={{ scrollMarginTop: '100px' }} className="glass-card bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 p-5 rounded-xl shadow-sm">
          {/* Header row with risk summary badges */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-acies-gray dark:text-white">Substitution Risk Scatter Map</h3>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">
                Bubble size = revenue at risk ($ M) • Click a bubble to load pair in scorer
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {highRiskPairs > 0 && (
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[7.5px] font-black uppercase tracking-wider rounded-full animate-pulse">
                  {highRiskPairs} HIGH
                </span>
              )}
              {moderateRiskPairs > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[7.5px] font-black uppercase tracking-wider rounded-full">
                  {moderateRiskPairs} MODERATE
                </span>
              )}
            </div>
          </div>

          {/* Risk zone legend */}
          <div className="flex items-center gap-4 mb-3 text-[7.5px] font-bold uppercase tracking-widest text-zinc-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Low (&lt;0.3)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Moderate (0.3–0.5)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />High (&gt;0.5)</span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 80, bottom: 25, left: 10 }}>
                {/* Risk zone background bands */}
                <ReferenceLine x={0.3} stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} strokeDasharray="3 3" />
                <ReferenceLine x={0.5} stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} strokeDasharray="3 3" />
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis 
                  type="number" 
                  dataKey="risk" 
                  name="Risk" 
                  domain={[0, 1]} 
                  tick={{ fill: tickColor, fontSize: 9 }} 
                  label={{ value: 'Cannibalization Risk Score →', position: 'insideBottom', offset: -10, fill: tickColor, fontSize: 9 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="index" 
                  name="Pair" 
                  domain={[-0.5, scatterPairsData.length - 0.5]} 
                  tick={false} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <ZAxis type="number" dataKey="revAtRisk" range={[60, 450]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }: any) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    const riskLevel = d.risk > 0.5 ? 'HIGH RISK' : d.risk > 0.3 ? 'MODERATE' : 'LOW RISK';
                    const riskColor = d.risk > 0.5 ? '#ef4444' : d.risk > 0.3 ? '#f59e0b' : '#10b981';
                    return (
                      <div style={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, padding: '8px 12px', minWidth: 175 }}>
                        <p style={{ color: tooltipText, fontWeight: 800, fontSize: 10, marginBottom: 4 }}>{d.name}</p>
                        <p style={{ color: riskColor, fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{riskLevel} · {(d.risk * 100).toFixed(0)}% Score</p>
                        <p style={{ color: tooltipText, fontSize: 9, opacity: 0.7, marginBottom: 4 }}>${d.revAtRisk} M revenue at risk</p>
                        <p style={{ color: '#8b5cf6', fontSize: 8, fontWeight: 700 }}>↗ Click to load pair in scorer</p>
                      </div>
                    );
                  }}
                />
                <Scatter 
                  data={scatterPairsData} 
                  onClick={(node) => handleAnalystScatterClick(node.payload)}
                  style={{ cursor: 'pointer' }}
                >
                  {scatterPairsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList 
                    dataKey="name" 
                    position="right" 
                    style={{ fill: tickColor, fontSize: 7.5, pointerEvents: 'none', fontWeight: 600 }} 
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Promo Erosion Horizontal Bar Chart */}
        <div id="promo-erosion-section" style={{ scrollMarginTop: '100px' }} className="glass-card bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 p-5 rounded-xl shadow-sm">
          {/* Header with risk count badge */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-acies-gray dark:text-white">Promotional Erosion — Top 10 Dependent SKUs</h3>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">
                % of sales under promo discount • Click any bar to load SKU into scorer
              </p>
            </div>
            {promoRiskSkus > 0 && (
              <span className="shrink-0 px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[7.5px] font-black uppercase tracking-wider rounded-lg">
                {promoRiskSkus} above 40% threshold
              </span>
            )}
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={promoErosionData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  tick={{ fill: tickColor, fontSize: 9 }} 
                  label={{ value: 'Promo Volume Dependency %', position: 'insideBottom', offset: -12, fill: tickColor, fontSize: 9 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: tickColor, fontSize: 8 }} 
                  axisLine={false} 
                  tickLine={false} 
                  width={90} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, fontSize: '9px' }}
                  content={({ active, payload }: any) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    const riskLabel = d.promoPct > 50 ? 'CRITICAL' : d.promoPct > 40 ? 'HIGH RISK' : 'WATCH';
                    const riskColor = d.promoPct > 50 ? '#ef4444' : d.promoPct > 40 ? '#f59e0b' : '#10b981';
                    return (
                      <div style={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, padding: '8px 12px' }}>
                        <p style={{ color: tooltipText, fontWeight: 800, fontSize: 10, marginBottom: 4 }}>{d.name}</p>
                        <p style={{ color: riskColor, fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{riskLabel} · {d.promoPct}% promo-dependent</p>
                        <p style={{ color: '#8b5cf6', fontSize: 8, fontWeight: 700 }}>↗ Click to load as SKU A in scorer</p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine 
                  x={40} 
                  stroke="#f59e0b" 
                  strokeDasharray="5 3" 
                  strokeWidth={1.5} 
                  label={{ value: '40% Risk Threshold', position: 'insideTopRight', fill: '#f59e0b', fontSize: 8, fontWeight: 700 }} 
                />
                <Bar 
                  dataKey="promoPct" 
                  barSize={10} 
                  radius={[0, 2, 2, 0]}
                  onClick={(data: any) => {
                    if (data && data.name) {
                      setSkuA(data.name);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {promoErosionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Control Room Launch Banner */}
        <div className="p-5 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent dark:from-purple-950/20 dark:via-indigo-950/10 dark:to-transparent border border-purple-500/15 dark:border-purple-500/20 rounded-xl shadow-sm flex flex-col justify-between h-48 relative overflow-hidden group transition-all duration-300">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/5 dark:bg-purple-400/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-300 pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-300 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 w-max">
              <Activity size={10} />
              <span>Control Room Desk</span>
            </span>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-800 dark:text-white mt-2">Action Routing Control Center</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed mt-1">
              Access the full-screen control center to execute price ladders, capacity feasibility audits, and inventory freeze checklists.
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3 mt-2 relative z-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase">
                Workflow status
              </span>
              <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                {highRiskPairs + moderateRiskPairs} active alert pairs
              </span>
            </div>
            <button
              onClick={() => setIsControlCenterOpen(true)}
              className="px-3.5 py-1.5 text-[9px] font-black text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-400 rounded-lg cursor-pointer transition shadow-md shadow-purple-600/10 dark:shadow-purple-500/20 border-none uppercase tracking-wider"
            >
              Open Center
            </button>
          </div>
        </div>

      </div>

      {/* Right Column: Scorer & Transference Calculator (Details & Controls) */}
      <div className="lg:col-span-7">
        <CalculatorScorer
          skuA={skuA}
          setSkuA={setSkuA}
          skuB={skuB}
          setSkuB={setSkuB}
          correlation={correlation}
          setCorrelation={setCorrelation}
          category={category}
          hasScored={hasScored}
          setHasScored={setHasScored}
          skusByCategory={skusByCategory}
          skuACategory={skuACategory}
          skuBOptions={skuBOptions}
          pairRisk={pairRisk}
          riskVerdict={riskVerdict}
          verdictColor={verdictColor}
          onInspectSku={(name) => {
            const s = SKUS.find(item => item.name === name);
            if (s) setSelectedSkuDetails(s);
          }}
        />
      </div>

    </div>
  );
};
