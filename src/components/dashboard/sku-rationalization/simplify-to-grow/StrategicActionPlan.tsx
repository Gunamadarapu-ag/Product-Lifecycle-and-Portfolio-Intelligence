/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * StrategicActionPlan — Section ⑤ of the Simplify to Grow tab.
 *
 * A 6-step interactive workflow: each step is a full drill-down card with
 * status tracking, affected-SKU mini-table, sub-task checklist, impact
 * estimates, and live navigation to connected dashboard tabs.
 */

import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import {
  ChevronDown, ChevronUp, CheckCircle2, Circle, ArrowRight,
  ExternalLink, Users, Link2, Layers, Target, Zap, CheckCircle,
  Activity, BarChart3, Scissors, Award, TrendingUp, TrendingDown,
  AlertTriangle, Package, Minus,
} from 'lucide-react';

import { ComplexityType, EnrichedSKU } from './types';

// ── Types ─────────────────────────────────────────────────────────────────────
type StepStatus = 'not-started' | 'in-progress' | 'done';

export type EnrichedSKURef = EnrichedSKU;

interface CheckItem { id: string; label: string; }

interface StepDef {
  id: string;
  step: number;
  pillar: string;
  priority: 'High' | 'Medium' | 'Low';
  color: string;
  icon: React.ElementType;
  routeTab: number;
  routeLabel: string;
  extraParams?: string;
  action: string;
  description: string;
  impactLabel: string;
  impactFn: (skus: EnrichedSKURef[]) => string;
  affectedFn: (skus: EnrichedSKURef[]) => EnrichedSKURef[];
  miniChartKey: 'ippv' | 'totalHiddenCost' | 'shelfProductivity' | 'cx' | 'growth';
  miniChartLabel: string;
  checks: CheckItem[];
}

interface Props {
  skus: EnrichedSKURef[];
  isDarkMode: boolean;
  onNavigate: (tab: number, extraParams?: string) => void;
  onSkuClick?: (sku: EnrichedSKURef) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  Beverages: '#6366f1', Snacks: '#f59e0b', 'Personal Care': '#0ea5e9',
  Dairy: '#10b981', Household: '#a855f7',
};

const COMPLEXITY_CFG: Record<ComplexityType, { color: string }> = {
  'Good Variety':   { color: '#10b981' },
  'Bad Complexity': { color: '#ef4444' },
  'Neutral':        { color: '#6b7280' },
};

const TAB_ICONS: Record<number, React.ElementType> = {
  1: Activity, 3: BarChart3, 4: Scissors, 8: Award,
};

// ── Status Cycle ──────────────────────────────────────────────────────────────
const STATUS_CYCLE: StepStatus[] = ['not-started', 'in-progress', 'done'];
const STATUS_CFG: Record<StepStatus, { label: string; color: string; bg: string; border: string }> = {
  'not-started': { label: 'Not Started', color: '#6b7280', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'done':        { label: 'Done',        color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

// ── Tiny IPPV / metric bar ────────────────────────────────────────────────────
const MiniBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
  <div className="h-1 flex-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
    <div className="h-full rounded-full" style={{ width: `${Math.min(Math.abs(value) / max * 100, 100)}%`, backgroundColor: color }} />
  </div>
);

// ── Step Card ─────────────────────────────────────────────────────────────────
const StepCard: React.FC<{
  step: StepDef;
  skus: EnrichedSKURef[];
  status: StepStatus;
  isLast: boolean;
  isDarkMode: boolean;
  onStatusChange: (id: string, s: StepStatus) => void;
  onNavigate: (tab: number, extraParams?: string) => void;
  checkedItems: Set<string>;
  onCheckItem: (id: string) => void;
  onSkuClick?: (sku: EnrichedSKURef) => void;
  totalSteps: number;
}> = ({ step, skus, status, isLast, isDarkMode, onStatusChange, onNavigate, checkedItems, onCheckItem, onSkuClick, totalSteps }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const affected = useMemo(() => step.affectedFn(skus), [step, skus]);
  const impact = useMemo(() => step.impactFn(skus), [step, skus]);
  const displayedSkus = showAll ? affected : affected.slice(0, 5);
  const checked = step.checks.filter(c => checkedItems.has(c.id)).length;
  const progress = Math.round((checked / step.checks.length) * 100);

  const Icon = step.icon;
  const RouteIcon = TAB_ICONS[step.routeTab] ?? ArrowRight;
  const sCfg = STATUS_CFG[status];
  const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length];

  const priorityStyle = step.priority === 'High'
    ? 'text-red-500 bg-red-500/10 border-red-500/20'
    : step.priority === 'Medium'
    ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    : 'text-sky-500 bg-sky-500/10 border-sky-500/20';

  const ttBg = isDarkMode ? '#1a1a24' : '#fff';
  const ttBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Mini chart data
  const chartData = affected.slice(0, 6).map(s => ({
    name: s.name.split(' ').slice(-1)[0],
    value: Math.abs(Number(s[step.miniChartKey as keyof EnrichedSKURef])),
    color: s.complexityType ? COMPLEXITY_CFG[s.complexityType].color : CAT_COLORS[s.cat] ?? step.color,
  }));

  return (
    <div className="flex gap-0">
      {/* ── Stepper rail ── */}
      <div className="flex flex-col items-center shrink-0 w-12 pt-1">
        {/* Status circle — click to cycle */}
        <button
          onClick={() => onStatusChange(step.id, nextStatus)}
          title={`Status: ${sCfg.label} — click to advance`}
          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-[11px] transition-all hover:scale-110 shadow-sm z-10 ${
            status === 'not-started' ? 'text-zinc-600 dark:text-zinc-500' : 'text-white'
          }`}
          style={{
            backgroundColor: status === 'done' ? '#10b981' : status === 'in-progress' ? '#f59e0b' : isDarkMode ? '#27272a' : '#f4f4f5',
            borderColor: status === 'done' ? '#10b981' : status === 'in-progress' ? '#f59e0b' : isDarkMode ? '#3f3f46' : '#d4d4d8',
            color: status === 'not-started' ? (isDarkMode ? '#a1a1aa' : '#52525b') : 'white',
          }}>
          {status === 'done' ? <CheckCircle2 size={16} /> : step.step}
        </button>
        {/* Connector line */}
        {!isLast && (
          <div className="flex-1 w-0.5 mt-1 mb-0 min-h-[16px]"
            style={{ backgroundColor: status === 'done' ? '#10b981' : isDarkMode ? '#3f3f46' : '#e4e4e7', opacity: 0.7 }} />
        )}
      </div>

      {/* ── Card ── */}
      <div className={`flex-1 mb-4 rounded-2xl border transition-all duration-200 overflow-hidden ${
        expanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'
      }`}
        style={{
          borderColor: expanded ? `${step.color}35` : isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          background: expanded
            ? isDarkMode ? `linear-gradient(135deg, ${step.color}08, rgba(26,26,36,1))` : `linear-gradient(135deg, ${step.color}05, #fff)`
            : isDarkMode ? '#1a1a24' : '#fff',
        }}>

        {/* ── Card header (always visible) ── */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full text-left p-4 flex items-start gap-3 group">
          {/* Progress arc */}
          <div className="relative shrink-0 mt-0.5">
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="11" fill="none" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="2.5" />
              <circle cx="14" cy="14" r="11" fill="none" stroke={step.color} strokeWidth="2.5"
                strokeDasharray={`${progress * 0.69} 69`} strokeLinecap="round"
                transform="rotate(-90 14 14)" className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon size={11} style={{ color: step.color }} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: step.color }}>{step.pillar}</span>
              <span className={`text-[6.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${priorityStyle}`}>{step.priority}</span>
              <span className={`text-[6.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${sCfg.bg} ${sCfg.border}`}
                style={{ color: sCfg.color }}>{sCfg.label}</span>
              {affected.length > 0 && (
                <span className="text-[6.5px] font-bold text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
                  {affected.length} SKUs affected
                </span>
              )}
            </div>
            <div className="text-[10px] font-black text-acies-gray dark:text-white leading-snug pr-4">{step.action}</div>
            {/* Progress bar */}
            {checked > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: step.color }} />
                </div>
                <span className="text-[6.5px] font-black uppercase tracking-wider" style={{ color: step.color }}>{checked}/{step.checks.length}</span>
              </div>
            )}
          </div>

          <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
            expanded ? 'bg-black/10 dark:bg-white/10' : 'group-hover:bg-black/5 dark:group-hover:bg-white/5'
          }`}>
            {expanded ? <ChevronUp size={13} className="text-zinc-500 dark:text-zinc-400" /> : <ChevronDown size={13} className="text-zinc-500 dark:text-zinc-400" />}
          </div>
        </button>

        {/* ── Expanded body ── */}
        {expanded && (
          <div className="border-t px-4 pb-5 pt-4 space-y-5" style={{ borderColor: `${step.color}15` }}>

            {/* Description + Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5">Context & Rationale</div>
                <p className="text-[8.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{step.description}</p>
              </div>
              <div className="rounded-xl p-3 border" style={{ backgroundColor: `${step.color}08`, borderColor: `${step.color}20` }}>
                <div className="text-[7px] font-black uppercase tracking-widest mb-1" style={{ color: step.color }}>Estimated Impact</div>
                <div className="text-[9px] font-black text-acies-gray dark:text-white leading-snug">{impact}</div>
                <div className="mt-2 text-[7px] text-zinc-500 dark:text-zinc-400 font-bold">{step.impactLabel}</div>
              </div>
            </div>

            {/* Affected SKUs + Mini Chart — two-column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Affected SKU table */}
              <div>
                <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 flex items-center justify-between">
                  <span>Affected SKUs — {affected.length} total</span>
                  {affected.length > 5 && (
                    <button onClick={() => setShowAll(s => !s)}
                      className="text-[7px] font-black uppercase tracking-wider hover:opacity-70 transition-opacity"
                      style={{ color: step.color }}>
                      {showAll ? 'Show fewer ↑' : `Show all ${affected.length} ↓`}
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {displayedSkus.map((s, i) => {
                    const rawVal = s[step.miniChartKey as keyof EnrichedSKURef] as number;
                    const isGrowth = step.miniChartKey === 'growth';
                    const displayVal = isGrowth ? `${(rawVal * 100).toFixed(1)}%` : rawVal.toFixed(1);
                    const barColor = isGrowth
                      ? (rawVal >= 0 ? '#10b981' : '#ef4444')
                      : s.complexityType ? COMPLEXITY_CFG[s.complexityType].color : step.color;
                    const maxVal = step.miniChartKey === 'ippv' ? 100
                      : step.miniChartKey === 'shelfProductivity' ? 100
                      : step.miniChartKey === 'cx' ? 1
                      : step.miniChartKey === 'growth' ? 0.5
                      : 20;

                    return (
                      <div key={s.name}
                        onClick={() => onSkuClick && onSkuClick(s)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-black/[0.05] dark:hover:bg-white/[0.05] group/sku ${onSkuClick ? 'cursor-pointer' : 'cursor-default'}`}
                        style={{ backgroundColor: i % 2 === 0 ? (isDarkMode ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)') : 'transparent' }}>
                        <span className="text-[7px] w-4 font-mono font-black text-zinc-500 dark:text-zinc-400">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[8.5px] font-black text-acies-gray dark:text-zinc-100 truncate">{s.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[6.5px] font-black uppercase tracking-wider px-1 py-0.5 rounded-sm"
                              style={{ backgroundColor: `${CAT_COLORS[s.cat] ?? '#6b7280'}18`, color: CAT_COLORS[s.cat] ?? '#6b7280' }}>
                              {s.cat}
                            </span>
                            <span className="text-[6.5px] font-black uppercase tracking-wider px-1 py-0.5 rounded-sm"
                              style={{ backgroundColor: `${COMPLEXITY_CFG[s.complexityType].color}15`, color: COMPLEXITY_CFG[s.complexityType].color }}>
                              {s.complexityType}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 w-24">
                          <MiniBar value={Math.abs(rawVal)} max={maxVal} color={barColor} />
                          <span className="text-[8px] font-black w-10 text-right" style={{ color: barColor }}>
                            {isGrowth && rawVal >= 0 ? '+' : ''}{displayVal}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {affected.length === 0 && (
                    <div className="text-center py-4 text-[8px] text-zinc-500 dark:text-zinc-400 font-bold">No SKUs in this category</div>
                  )}
                </div>
              </div>

              {/* Mini chart + Action checklist */}
              <div className="space-y-4">
                {/* Micro bar chart */}
                {chartData.length > 0 && (
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">{step.miniChartLabel} — Top SKUs</div>
                    <div className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#71717a' : '#a1a1aa', fontSize: 7, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: isDarkMode ? '#71717a' : '#a1a1aa', fontSize: 7 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: ttBg, borderColor: ttBorder, fontSize: '8px', borderRadius: '8px' }} />
                          <Bar dataKey="value" radius={[3, 3, 0, 0]} barSize={18}>
                            {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Action checklist */}
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 flex items-center justify-between">
                    <span>Action Checklist</span>
                    <span className="text-[7px] font-bold" style={{ color: step.color }}>{checked}/{step.checks.length} complete</span>
                  </div>
                  <div className="space-y-1.5">
                    {step.checks.map(c => {
                      const done = checkedItems.has(c.id);
                      return (
                        <button key={c.id} onClick={() => onCheckItem(c.id)}
                          className="w-full flex items-start gap-2.5 text-left p-2 rounded-lg transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02] group/check"
                          style={{ backgroundColor: done ? `${step.color}08` : 'transparent' }}>
                          <div className="shrink-0 mt-0.5">
                            {done
                              ? <CheckCircle2 size={13} style={{ color: step.color }} />
                              : <Circle size={13} className="text-zinc-300 dark:text-zinc-600 group-hover/check:text-zinc-400 transition-colors" />
                            }
                          </div>
                          <span className={`text-[8.5px] font-medium leading-snug transition-all ${done ? 'line-through' : ''}`}
                            style={{ color: done ? step.color : isDarkMode ? '#a1a1aa' : '#52525b' }}>
                            {c.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: `${step.color}15` }}>
              <div className="flex items-center gap-2">
                <button onClick={() => onNavigate(step.routeTab, step.extraParams)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-white transition-all hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: step.color }}>
                  <RouteIcon size={10} /> {step.routeLabel} <ExternalLink size={8} />
                </button>
                <button onClick={() => onStatusChange(step.id, nextStatus)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all hover:shadow-sm"
                  style={{ borderColor: `${sCfg.color}30`, color: sCfg.color, backgroundColor: `${sCfg.color}08` }}>
                  {status === 'not-started' ? 'Mark In Progress' : status === 'in-progress' ? 'Mark Done ✓' : 'Reset'}
                </button>
              </div>
              <span className="text-[7px] text-zinc-500 dark:text-zinc-400 font-bold">Step {step.step} of {totalSteps}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Export ───────────────────────────────────────────────────────────────
export const StrategicActionPlan: React.FC<Props> = ({ skus, isDarkMode, onNavigate, onSkuClick }) => {
  const steps = useMemo<StepDef[]>(() => {
    const worstIppvSku = [...skus].sort((a, b) => a.ippv - b.ippv)[0] || { name: 'Fabric Softener' };

    const catNames: string[] = skus.map(s => s.cat).filter((v, i, a) => a.indexOf(v) === i);
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
        id: 'consumer', step: 1, pillar: 'Consumer-Right', priority: 'High',
        color: '#6366f1', icon: Users, routeTab: 4, routeLabel: 'SKU Rationalization',
        extraParams: `view=simulator&simTab=remove&sku=${encodeURIComponent(worstIppvSku.name)}`,
        action: 'Prioritise IPPV as primary portfolio review KPI',
        description: 'The Bad Complexity SKUs below are dragging your Consumer-Right pillar score. Each has low IPPV — they consume resources without delivering proportionate consumer value. These should be the first candidates for consumer-needs validation before any tail-cut decision.',
        impactLabel: 'Potential IPPV uplift if Bad Complexity SKUs exit',
        impactFn: (skus) => {
          const bad = skus.filter(s => s.complexityType === 'Bad Complexity');
          const currentAvg = skus.reduce((a, s) => a + s.ippv, 0) / skus.length;
          const remaining = skus.filter(s => s.complexityType !== 'Bad Complexity');
          const newAvg = remaining.length ? remaining.reduce((a, s) => a + s.ippv, 0) / remaining.length : currentAvg;
          return `+${(newAvg - currentAvg).toFixed(1)} pts avg IPPV across ${bad.length} SKUs exited`;
        },
        affectedFn: (skus) => [...skus].filter(s => s.complexityType === 'Bad Complexity').sort((a, b) => a.ippv - b.ippv),
        miniChartKey: 'ippv', miniChartLabel: 'IPPV Score',
        checks: [
          { id: 'c1', label: 'Map all portfolio SKUs to their IPPV score' },
          { id: 'c2', label: 'Flag SKUs with IPPV < 30 for consumer-needs review' },
          { id: 'c3', label: 'Present IPPV ranking in next S&OP cycle' },
          { id: 'c4', label: 'Align commercial team on IPPV as primary portfolio KPI' },
        ],
      },
      {
        id: 'retailer', step: 2, pillar: 'Retailer Win-Win', priority: 'Medium',
        color: '#0ea5e9', icon: Link2, routeTab: 1, routeLabel: 'Portfolio Health Map',
        extraParams: `subtab=ph-kpi&metric=Shelf%20Productivity&category=${encodeURIComponent(worstShelfCat)}`,
        action: 'Launch Joint Business Planning for low shelf-score categories',
        description: 'Categories below 55 Shelf Productivity are under-serving retailers and losing premium shelf placement. The SKUs below are the worst performers inside those categories — they are the focus for retailer co-creation sessions and joint assortment planning.',
        impactLabel: 'Shelf Productivity improvement opportunity',
        impactFn: (skus) => {
          const below = skus.filter(s => s.shelfProductivity < 55);
          const totalGap = below.reduce((a, s) => a + (55 - s.shelfProductivity), 0);
          return `${below.length} SKUs below threshold · avg gap ${(totalGap / (below.length || 1)).toFixed(0)} pts`;
        },
        affectedFn: (skus) => [...skus].sort((a, b) => a.shelfProductivity - b.shelfProductivity).slice(0, 8),
        miniChartKey: 'shelfProductivity', miniChartLabel: 'Shelf Score',
        checks: [
          { id: 'r1', label: 'Identify categories with Shelf Productivity < 55' },
          { id: 'r2', label: 'Schedule JBP sessions with top 3 retail accounts' },
          { id: 'r3', label: 'Prepare SKU profit pool growth scenario models' },
          { id: 'r4', label: 'Agree shared KPIs and review cadence with retailers' },
        ],
      },
      {
        id: 'valuechain', step: 3, pillar: 'Value Chain Efficient', priority: 'High',
        color: '#f59e0b', icon: Layers, routeTab: 3, routeLabel: 'Profitability Tree',
        extraParams: `simCountry=${encodeURIComponent(worstMarginRegion.country)}`,
        action: 'Recover hidden complexity costs across value chain',
        description: 'These SKUs carry the highest hidden cost burden — production downtime from small runs, transport overhead from route complexity, and waste from promo dependency. De-averaging shared costs reveals their true P&L and makes rationalisation decisions defensible.',
        impactLabel: 'Total recoverable hidden cost',
        impactFn: (skus) => {
          const top = [...skus].sort((a, b) => b.totalHiddenCost - a.totalHiddenCost).slice(0, 10);
          const total = top.reduce((a, s) => a + s.totalHiddenCost, 0);
          return `$${total.toFixed(1)}L recoverable from top 10 cost SKUs`;
        },
        affectedFn: (skus) => [...skus].sort((a, b) => b.totalHiddenCost - a.totalHiddenCost).slice(0, 8),
        miniChartKey: 'totalHiddenCost', miniChartLabel: 'Hidden Cost ($L)',
        checks: [
          { id: 'v1', label: 'De-average shared supply chain cost allocation per SKU' },
          { id: 'v2', label: 'Map production downtime, transport & waste per SKU' },
          { id: 'v3', label: 'Present true P&L to supply chain and commercial leadership' },
          { id: 'v4', label: 'Initiate SKU-level hidden cost recovery plan' },
        ],
      },
      {
        id: 'e2e', step: 4, pillar: 'End-to-End Value', priority: 'Medium',
        color: '#10b981', icon: Target, routeTab: 4, routeLabel: 'SKU Rationalization',
        extraParams: `view=analyst&sku=${encodeURIComponent(worstDeclineSku.name)}`,
        action: 'Involve Finance + Supply in every SKU exit decision',
        description: 'Breaking cross-functional silos is non-negotiable for lasting simplification. The SKUs below are in negative growth territory — each needs a structured multi-team review before any exit decision. Use the Rationalization workflow to enforce the sign-off chain.',
        impactLabel: 'Negative-growth SKUs needing cross-functional review',
        impactFn: (skus) => {
          const neg = skus.filter(s => s.growth < 0);
          const revAtRisk = neg.reduce((a, s) => a + s.rev, 0);
          return `${neg.length} SKUs · $${revAtRisk.toFixed(1)}M revenue needs managed exit`;
        },
        affectedFn: (skus) => [...skus].filter(s => s.growth < 0).sort((a, b) => a.growth - b.growth),
        miniChartKey: 'growth', miniChartLabel: 'Growth Rate',
        checks: [
          { id: 'e1', label: 'Schedule first cross-functional SKU review in next 30 days' },
          { id: 'e2', label: 'Map SKU exit workflow in SKU Rationalization tab' },
          { id: 'e3', label: 'Confirm Finance + Supply sign-off process is enforced' },
          { id: 'e4', label: 'Document first joint review outcomes and learnings' },
        ],
      },
      {
        id: 'momentum', step: 5, pillar: 'Momentum & Muscle', priority: 'Low',
        color: '#a855f7', icon: Zap, routeTab: 8, routeLabel: 'SKU Assortment',
        extraParams: 'subTab=guided&step=2',
        action: 'Embed IPPV into S&OP rhythm and NPD gate reviews',
        description: 'Sustained simplification requires institutional muscle — IPPV must be an input to every new product launch gate, every S&OP review, and every assortment planning cycle. The high-complexity SKUs below are examples of what slips through without this governance.',
        impactLabel: 'High-complexity SKUs that would be gated with IPPV governance',
        impactFn: (skus) => {
          const highCx = skus.filter(s => s.cx > 0.6);
          return `${highCx.length} high-complexity SKUs (CX > 0.6) that need gate review`;
        },
        affectedFn: (skus) => [...skus].filter(s => s.cx > 0.5).sort((a, b) => b.cx - a.cx).slice(0, 8),
        miniChartKey: 'cx', miniChartLabel: 'Complexity Score',
        checks: [
          { id: 'm1', label: 'Add IPPV to NPD gate scorecard as mandatory criterion' },
          { id: 'm2', label: 'Set quarterly IPPV portfolio review in S&OP calendar' },
          { id: 'm3', label: 'Integrate IPPV into annual planning and budget templates' },
          { id: 'm4', label: 'Define Bad Complexity threshold policy and annual reset' },
        ],
      },
      {
        id: 'goodvariety', step: 6, pillar: 'Good Variety Protection', priority: 'Medium',
        color: '#10b981', icon: CheckCircle, routeTab: 8, routeLabel: 'SKU Assortment',
        extraParams: 'subTab=comprehensive',
        action: 'Ring-fence Good Variety SKUs from rationalization pressure',
        description: 'Good Variety SKUs deliver high IPPV and meet emerging consumer needs — even when they carry operational complexity. They must be explicitly protected from blanket cost-cutting. The SKUs below are your most valuable and need long-term investment commitment.',
        impactLabel: 'Good Variety SKUs generating high consumer value',
        impactFn: (skus) => {
          const good = skus.filter(s => s.complexityType === 'Good Variety');
          const totalRev = good.reduce((a, s) => a + s.rev, 0);
          return `${good.length} SKUs · $${totalRev.toFixed(1)}M revenue to protect`;
        },
        affectedFn: (skus) => [...skus].filter(s => s.complexityType === 'Good Variety').sort((a, b) => b.ippv - a.ippv),
        miniChartKey: 'ippv', miniChartLabel: 'IPPV Score',
        checks: [
          { id: 'g1', label: 'Extract Good Variety SKU list and share with all teams' },
          { id: 'g2', label: 'Add protection flag to SKU Rationalization workflow' },
          { id: 'g3', label: 'Communicate protection rationale to commercial & supply' },
          { id: 'g4', label: 'Review Good Variety eligibility quarterly using IPPV' },
        ],
      },
    ];
  }, [skus]);

  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({
    consumer: 'not-started',
    retailer: 'not-started',
    valuechain: 'not-started',
    e2e: 'not-started',
    momentum: 'not-started',
    goodvariety: 'not-started',
  });
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const doneCount = Object.values(statuses).filter(s => s === 'done').length;
  const inProgressCount = Object.values(statuses).filter(s => s === 'in-progress').length;
  const overallProgress = Math.round((doneCount / steps.length) * 100);

  const handleStatusChange = (id: string, next: StepStatus) => {
    setStatuses(prev => ({ ...prev, [id]: next }));
  };

  const handleCheckItem = (itemId: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  return (
    <div>
      {/* ── Section header ── */}
      <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-3 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          ⑤ Momentum &amp; Muscle — Strategic Action Plan
        </h3>
        <span className="ml-auto text-[7.5px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
          Click a step to expand · Check off tasks · Click status to advance
        </span>
      </div>

      {/* ── Overall progress bar ── */}
      <div className="glass-card bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 rounded-xl p-4 mb-5 flex items-center gap-5">
        {/* Ring */}
        <div className="relative shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="4" />
            <circle cx="28" cy="28" r="22" fill="none" stroke={overallProgress === 100 ? '#10b981' : '#6366f1'} strokeWidth="4"
              strokeDasharray={`${overallProgress * 1.382} 138.2`} strokeLinecap="round"
              transform="rotate(-90 28 28)" className="transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[13px] font-black" style={{ color: overallProgress === 100 ? '#10b981' : '#6366f1' }}>{overallProgress}%</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[10px] font-black text-acies-gray dark:text-white">Simplification Plan Progress</span>
            {overallProgress === 100 && (
              <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                All Steps Done
              </span>
            )}
          </div>
          <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%`, background: 'linear-gradient(90deg, #6366f1, #10b981)' }} />
          </div>
          <div className="flex items-center gap-4 text-[7.5px] font-black uppercase tracking-wider">
            <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={9} /> {doneCount} Done</span>
            <span className="text-amber-500 flex items-center gap-1"><Minus size={9} /> {inProgressCount} In Progress</span>
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Circle size={9} /> {steps.length - doneCount - inProgressCount} Not Started</span>
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-2 gap-x-6 gap-y-1 text-[7.5px] font-black shrink-0">
          {steps.map(s => {
            const st = statuses[s.id];
            const sCfg = STATUS_CFG[st];
            return (
              <div key={s.id} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sCfg.color }} />
                <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[80px]">{s.pillar}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step cards ── */}
      <div className="pl-2">
        {steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            skus={skus}
            status={statuses[step.id]}
            isLast={i === steps.length - 1}
            isDarkMode={isDarkMode}
            onStatusChange={handleStatusChange}
            onNavigate={onNavigate}
            checkedItems={checkedItems}
            onCheckItem={handleCheckItem}
            onSkuClick={onSkuClick}
            totalSteps={steps.length}
          />
        ))}
      </div>
    </div>
  );
};
