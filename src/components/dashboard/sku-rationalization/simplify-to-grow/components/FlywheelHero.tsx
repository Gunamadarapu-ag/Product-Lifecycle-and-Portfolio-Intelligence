import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { PillarDef } from '../types';

interface FlywheelHeroProps {
  pillars: PillarDef[];
  overallScore: number;
  scoreColor: string;
  scoreRingColor: string;
}

export const FlywheelHero: React.FC<FlywheelHeroProps> = ({ pillars, overallScore, scoreColor, scoreRingColor }) => {
  const [showCalculation, setShowCalculation] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-emerald-600/10 dark:from-indigo-900/30 dark:via-purple-900/20 dark:to-emerald-900/20 p-4 text-zinc-800 dark:text-white">
      <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left side: Title, Description, and Collapsible Formula Trigger */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              BAIN &amp; COMPANY FRAMEWORK
            </span>
            <h2 className="text-sm font-black text-acies-gray dark:text-white leading-tight">
              Simplify to Grow — Strategic Flywheel
            </h2>
          </div>
          <p className="text-[10px] text-zinc-700 dark:text-zinc-300 max-w-xl font-medium">
            Re-investing to grow vs. merely cutting SKUs. Up to 5% sales uplift through consumer-led portfolio simplification.
          </p>
          
          {/* Interactive Formula Toggle */}
          <button
            type="button"
            onClick={() => setShowCalculation(!showCalculation)}
            className="flex items-center gap-1.5 text-[8.5px] text-zinc-700 dark:text-zinc-300 font-mono bg-white/50 dark:bg-white/5 py-1 px-2.5 rounded-lg border border-black/10 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition cursor-pointer w-fit outline-none select-none font-bold"
          >
            <Info size={10} className="text-[#f59e0b] stroke-[2.5]" />
            <span>Formula: ({pillars.map(p => p.score).join(' + ')}) / 5 = <span className="font-black text-zinc-900 dark:text-white bg-indigo-600/15 dark:bg-indigo-600/35 px-1 rounded">{overallScore}</span></span>
            <span className="text-[#f59e0b] text-[7.5px] font-black uppercase tracking-wider pl-2 border-l border-black/15 dark:border-white/10 flex items-center gap-0.5">
              <span>{showCalculation ? 'Collapse Details' : 'Click to Explore'}</span>
              {showCalculation ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
            </span>
          </button>
        </div>

        {/* Right side: Overall Score Ring Callout */}
        <div className="flex items-center gap-4 shrink-0 bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3">
          <div className="text-center">
            <div className="flex items-baseline gap-1 justify-center font-mono">
              <span className={`text-2xl font-black leading-none ${scoreColor}`}>{overallScore}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-500">/100</span>
            </div>
            <div className="text-[7.5px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-bold mt-0.5">Flywheel Score</div>
            <div className={`text-[6.5px] font-black uppercase tracking-wider ${scoreColor}`}>
              {overallScore >= 70 ? 'Strong' : overallScore >= 50 ? 'Developing' : 'Needs Action'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Live Computation Panel */}
      {showCalculation && (
        <div className="relative z-10 mt-4 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[9px] text-zinc-700 dark:text-zinc-300 space-y-3 animate-fadeIn">
          <div className="font-extrabold uppercase tracking-widest text-[#f59e0b] flex items-center gap-1.5">
            <Info size={12} className="stroke-[2.5]" /> score justification & live computation
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/5 dark:bg-black/25 p-3 rounded-lg border border-black/10 dark:border-white/5">
            <div>
              <span className="text-[10px] font-bold text-zinc-800 dark:text-white uppercase tracking-wider">Formula & Average Calculation:</span>
              <div className="text-zinc-700 dark:text-zinc-300 mt-1 font-mono text-[9.5px]">
                (Consumer + Retailer + Value Chain + E2E + Momentum) / 5
                <div className="mt-0.5 text-zinc-600 dark:text-zinc-400">
                  = ({pillars[0].score} + {pillars[1].score} + {pillars[2].score} + {pillars[3].score} + {pillars[4].score}) / 5 = <span className="text-emerald-600 dark:text-emerald-500 font-extrabold">{overallScore}</span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <div className="text-[14px] font-black text-emerald-600 dark:text-emerald-500">{overallScore}/100</div>
              <div className="text-[7px] text-zinc-600 dark:text-zinc-500 uppercase font-black tracking-widest">Balanced Health Index</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1 text-[8.5px]">
            {pillars.map((p, idx) => {
              const P_Icon = p.icon;
              return (
                <div key={p.pillar} className="p-2 rounded-lg bg-white/40 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex flex-col justify-between gap-1.5 hover:bg-white/60 dark:hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-black/5 dark:bg-white/5 shrink-0">
                      <P_Icon size={10} style={{ color: p.color }} />
                    </div>
                    <span className="text-[7.5px] font-black uppercase tracking-wider truncate text-zinc-700 dark:text-zinc-300" title={p.pillar}>
                      Pillar {idx + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-black text-zinc-800 dark:text-white">{p.score}/100</div>
                    <div className="text-[7px] text-zinc-600 dark:text-zinc-400 font-bold uppercase truncate" title={p.pillar}>{p.pillar}</div>
                  </div>
                  <div className="text-[7px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight pt-1.5 border-t border-black/5 dark:border-white/5">
                    Metric: <span className="font-extrabold text-zinc-800 dark:text-white">{p.kpiValue}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border-4 opacity-5" style={{ borderColor: scoreRingColor }} />
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border-2 opacity-5" style={{ borderColor: scoreRingColor }} />
    </div>
  );
};
