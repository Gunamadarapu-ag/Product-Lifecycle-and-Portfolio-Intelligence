/**
 * Product Manager's Launch Readiness view.
 *
 * The persona matrix (Research_doc/...Project_Tracker 1.xlsx, "Profile Hirarchy
 * Importance") marks PM as *primary* here — the decision this tab exists to
 * support is "Should the product launch, and what is blocking it?" Until now
 * PM was silently given the VP's own view (LaunchReadinessDashboard.tsx:30),
 * which answers a different question: "How much portfolio revenue is at
 * risk?" That's an executive framing. A PM needs to know, launch by launch,
 * which gate it's stuck at and who to chase — so this view leads with a
 * worklist and a blocker, not a financial-exposure gauge.
 *
 * Reuses the same underlying data the VP view already reads (VP_PRODUCTS,
 * generateInitialStageGates) rather than inventing a parallel dataset —
 * this is a new lens on the same source, not new fabricated content.
 */
import React, { useMemo, useState } from 'react';
import {
  CheckCircle2, XCircle, Clock, ShieldAlert, ChevronRight, User, Calendar, FileWarning
} from 'lucide-react';
import {
  VP_PRODUCTS, generateInitialStageGates, STAGE_NAMES,
  type VPLaunchProduct, type StageGateRecord,
} from './launchData';

interface PMLaunchReadinessViewProps {
  isDarkMode: boolean;
  onAuditClick?: (metric: string | null) => void;
}

const STAGE_INDEX: Record<VPLaunchProduct['stage'], number> = {
  Ideation: 0, Development: 1, Testing: 2, 'Pre-market': 3, Launch: 4,
};

const STATUS_STYLE: Record<StageGateRecord['status'], { icon: typeof CheckCircle2; cls: string; label: string }> = {
  Passed:  { icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Cleared' },
  Pending: { icon: Clock,        cls: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',       label: 'Needs review' },
  Failed:  { icon: XCircle,      cls: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',           label: 'Blocked' },
  Waived:  { icon: ShieldAlert,  cls: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',               label: 'Waived' },
};

// Same visual language as STATUS_STYLE, but keyed by a launch's full-history
// category (see the `rows` memo below) rather than only its current gate —
// this is what the worklist pill and stat tiles actually use.
const CATEGORY_STYLE: Record<'blocked' | 'needs-review' | 'waived' | 'on-track',
  { icon: typeof CheckCircle2; cls: string; label: string }> = {
  blocked:      { icon: XCircle,      cls: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',     label: 'Blocked' },
  'needs-review': { icon: Clock,      cls: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Needs review' },
  waived:       { icon: ShieldAlert,  cls: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',         label: 'Waived' },
  'on-track':   { icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'On track' },
};

function nextAction(current: StageGateRecord, failedGate?: StageGateRecord, waivedGate?: StageGateRecord): string {
  // A failure or waiver earlier in the pipeline is still worth acting on
  // even if the *current* gate looks like it's just waiting on a routine
  // review — don't let it hide behind a calm "awaiting review" message.
  if (failedGate && failedGate.stageName !== current.stageName) {
    return `Blocked upstream at ${failedGate.stageName} — escalate to ${failedGate.reviewer} before this launch can proceed.`;
  }
  if (current.status === 'Failed') return `Escalate to ${current.reviewer} — this is blocking the launch.`;
  if (waivedGate && waivedGate.stageName !== current.stageName) {
    return `Approved on a waiver at ${waivedGate.stageName} — confirm with ${waivedGate.reviewer} before the launch closes it out.`;
  }
  if (current.status === 'Pending') return `Awaiting ${current.reviewer}'s review, due ${current.reviewDate}.`;
  if (current.status === 'Waived') return `Waived by ${current.reviewer} — revisit before the next gate closes.`;
  return 'Cleared — no action needed.';
}

export const PMLaunchReadinessView: React.FC<PMLaunchReadinessViewProps> = ({ isDarkMode, onAuditClick }) => {
  const gateRecords = useMemo(() => generateInitialStageGates(VP_PRODUCTS), []);
  const [selectedId, setSelectedId] = useState(VP_PRODUCTS[0].id);
  const [stageFilter, setStageFilter] = useState<'All' | VPLaunchProduct['stage']>('All');

  // A product's *current* gate defaults to "Pending — under evaluation" for
  // every launch that hasn't reached its final stage (that's how
  // generateInitialStageGates seeds it), so current-gate status alone can't
  // tell a real blocker from business-as-usual. A few products carry a
  // Failed or Waived gate earlier in their history instead — e.g. a product
  // now sitting at "Pre-market" that failed its Validation gate on the way
  // there. Scan the whole gate history, not just the active one, or those
  // launches read as "on track" when they aren't.
  const rows = useMemo(() => VP_PRODUCTS.map(p => {
    const record = gateRecords.find(g => g.productId === p.id)!;
    const idx = STAGE_INDEX[p.stage];
    const currentGate = record.gates[idx];
    const failedGate = record.gates.find(g => g.status === 'Failed');
    const waivedGate = !failedGate ? record.gates.find(g => g.status === 'Waived') : undefined;
    // A waived gate is a flagged exception worth its own category even when
    // the current gate is sitting in the same default "Pending" state as
    // most of the portfolio — check for it before falling back to the
    // generic needs-review bucket, not after.
    const category: 'blocked' | 'needs-review' | 'waived' | 'on-track' =
      failedGate ? 'blocked'
      : waivedGate ? 'waived'
      : currentGate.status === 'Pending' ? 'needs-review'
      : 'on-track';
    return { product: p, record, currentGate, stageName: STAGE_NAMES[idx], failedGate, waivedGate, category };
  }), [gateRecords]);

  const blocked = rows.filter(r => r.category === 'blocked');
  const needsAction = rows.filter(r => r.category === 'needs-review');
  const waived = rows.filter(r => r.category === 'waived');

  const filtered = stageFilter === 'All' ? rows : rows.filter(r => r.product.stage === stageFilter);
  const selected = rows.find(r => r.product.id === selectedId) ?? rows[0];

  const stageCounts = STAGE_NAMES.map((name, i) => ({
    name, count: rows.filter(r => STAGE_INDEX[r.product.stage] === i).length,
  }));
  const maxStageCount = Math.max(1, ...stageCounts.map(s => s.count));

  const card = 'bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm shadow-sm';

  return (
    <div className="space-y-4">
      {/* Header + headline counts — an action worklist, not a portfolio gauge */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl text-zinc-800 dark:text-white">My Launch Pipeline</h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {rows.length} launches · {blocked.length} blocked · {needsAction.length} need your review this week
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total launches', value: rows.length, cls: 'text-zinc-800 dark:text-white' },
          { label: 'Blocked', value: blocked.length, cls: 'text-rose-600 dark:text-rose-400' },
          { label: 'Needs your review', value: needsAction.length, cls: 'text-amber-600 dark:text-amber-400' },
          { label: 'Waived exceptions', value: waived.length, cls: 'text-sky-600 dark:text-sky-400' },
        ].map(kpi => (
          <div
            key={kpi.label}
            onClick={() => onAuditClick?.(kpi.label)}
            className={`${card} p-3 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">{kpi.label}</span>
            <span className={`text-2xl font-display font-extrabold ${kpi.cls}`}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Stage distribution — where everything sits, at a glance */}
      <div className={`${card} p-4`}>
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-3">Pipeline by stage</span>
        <div className="space-y-2">
          {stageCounts.map(s => (
            <button
              key={s.name}
              onClick={() => setStageFilter(prev => prev === s.name ? 'All' : s.name as VPLaunchProduct['stage'])}
              className="w-full flex items-center gap-3 text-left group"
            >
              <span className={`text-[10px] font-bold w-24 shrink-0 ${stageFilter === s.name ? 'text-zinc-800 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {s.name}
              </span>
              <div className="flex-1 h-5 bg-black/5 dark:bg-white/5 rounded-sm overflow-hidden">
                <div
                  className={`h-full rounded-sm transition-all ${stageFilter === s.name ? 'bg-violet-500' : 'bg-violet-500/40 group-hover:bg-violet-500/60'}`}
                  style={{ width: `${(s.count / maxStageCount) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 w-5 text-right shrink-0">{s.count}</span>
            </button>
          ))}
        </div>
        {stageFilter !== 'All' && (
          <button onClick={() => setStageFilter('All')} className="mt-2 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline">
            Clear filter — showing {stageFilter} only
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4">

        {/* Worklist */}
        <div className={`${card} overflow-hidden flex flex-col max-h-[520px]`}>
          <div className="px-4 py-2.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
              Launches{stageFilter !== 'All' ? ` — ${stageFilter}` : ''}
            </span>
            <span className="text-[9px] font-bold text-zinc-400">{filtered.length}</span>
          </div>
          <div className="overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
            {filtered.map(r => {
              const S = CATEGORY_STYLE[r.category];
              const Icon = S.icon;
              const isSelected = r.product.id === selected.product.id;
              return (
                <button
                  key={r.product.id}
                  onClick={() => setSelectedId(r.product.id)}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                    isSelected ? 'bg-violet-500/10' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon size={14} className={`shrink-0 ${S.cls.split(' ').slice(0, 2).join(' ')}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-zinc-800 dark:text-white truncate">{r.product.name}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                      {r.stageName} · {r.product.owner}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border shrink-0 ${S.cls}`}>
                    {S.label}
                  </span>
                  <ChevronRight size={13} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected launch detail */}
        <div className={`${card} p-4 space-y-4`}>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Selected launch</p>
            <h3 className="font-display text-lg text-zinc-800 dark:text-white">{selected.product.name}</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {selected.product.category} · {selected.product.region} · {selected.product.quarter} · Owner: {selected.product.owner}
            </p>
          </div>

          {/* 5-stage gate stepper */}
          <div className="flex items-center">
            {selected.record.gates.map((g, i) => {
              const S = STATUS_STYLE[g.status];
              const Icon = S.icon;
              const isCurrent = STAGE_NAMES[i] === selected.stageName;
              return (
                <React.Fragment key={g.stageName}>
                  <div className="flex flex-col items-center gap-1 shrink-0" style={{ width: 64 }}>
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${S.cls} ${isCurrent ? 'ring-2 ring-offset-1 ring-violet-400 dark:ring-offset-transparent' : ''}`}>
                      <Icon size={12} />
                    </div>
                    <span className={`text-[8.5px] font-bold text-center leading-tight ${isCurrent ? 'text-zinc-800 dark:text-white' : 'text-zinc-400'}`}>
                      {g.stageName}
                    </span>
                  </div>
                  {i < selected.record.gates.length - 1 && (
                    <div className={`h-px flex-1 -mt-4 ${i < STAGE_INDEX[selected.product.stage] ? 'bg-emerald-400/60' : 'bg-black/10 dark:bg-white/10'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* An earlier gate failed even though the current one looks routine —
              surface it explicitly, not just as an unexplained red circle above. */}
          {selected.failedGate && selected.failedGate.stageName !== selected.currentGate.stageName && (
            <div className="p-3 rounded-sm border text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wide">
                  Blocked earlier — {selected.failedGate.stageName}
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/10">
                  {selected.failedGate.riskRating}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-200">
                {selected.failedGate.approvalNotes}
              </p>
            </div>
          )}
          {!selected.failedGate && selected.waivedGate && selected.waivedGate.stageName !== selected.currentGate.stageName && (
            <div className="p-3 rounded-sm border text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wide">
                  Waived exception — {selected.waivedGate.stageName}
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/10">
                  {selected.waivedGate.riskRating}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-200">
                {selected.waivedGate.approvalNotes}
              </p>
            </div>
          )}

          {/* Current gate detail — the actual "what's blocking it" */}
          <div className={`p-3 rounded-sm border ${STATUS_STYLE[selected.currentGate.status].cls}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wide">
                {selected.currentGate.gateName}
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/10">
                {selected.currentGate.riskRating}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-200 mb-2">
              {selected.currentGate.approvalNotes || 'No notes recorded for this gate yet.'}
            </p>
            <div className="flex items-center gap-3 text-[10px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1"><User size={11} /> {selected.currentGate.reviewer}</span>
              <span className="flex items-center gap-1"><Calendar size={11} /> {selected.currentGate.reviewDate}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-sm bg-violet-500/10 border border-violet-500/20">
            <FileWarning size={14} className="text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
            <p className="text-[11px] font-medium text-violet-700 dark:text-violet-300">
              {nextAction(selected.currentGate, selected.failedGate, selected.waivedGate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
