/**
 * Rationalisation home: reason summary, drill-downs and the roadmap.
 *
 * Extracted from the original 2,597-line RationalisationTab.tsx.
 */
import React, { useState, useMemo } from 'react';
import { BarChart2, Search, Percent, Compass, LayoutGrid, Shield, Box, ArrowRight, List, X, Lightbulb, ChevronRight, PieChart as LucidePieChart, Radar as LucideRadar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LabelList } from 'recharts';
import { ModalShell } from '../../common/Modal';
import type { Task } from './trackerTasks';
import { MarginWaterfallChart, SkuCategoryBenchmarks, renderActiveShape } from './RationalisationCharts';
import { CustomerMarketDrillDown, FinancialDrillDown, PortfolioDrillDown, RegulatoryDrillDown, SummaryDashboardPage, SupplyChainDrillDown } from './RationalisationDrillDowns';
import { RATIONALE_DRIVERS, ROADMAP_PHASES_DETAILS } from './rationalisationData';
import { generateTasksForSku, getRcaDetails } from './rationalisationHelpers';

export interface RationalisationTabProps {
  setActiveTab?: (tabId: number) => void;
  setSelectedRoadmapPhaseFilter?: (action: string) => void;
  setSkuDrilldownSearchQuery?: (search: string) => void;
  tasks?: Record<string, Task[]>;
  setTasks?: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
}

export const RationalisationTab: React.FC<RationalisationTabProps> = ({ 
  setActiveTab, 
  setSelectedRoadmapPhaseFilter,
  setSkuDrilldownSearchQuery,
  tasks,
  setTasks
}) => {
  const [activeDrillDown, setActiveDrillDown] = useState<string | null>(null);
  const [activeCenterPath, setActiveCenterPath] = useState<string>('DISCONTINUE / CONSOLIDATE');
  const [impactViewMode, setImpactViewMode] = useState<'bar' | 'donut' | 'spider'>('spider');
  const [selectedRoadmapPhase, setSelectedRoadmapPhase] = useState<string | null>(null);
  const [roadmapSearchQuery, setRoadmapSearchQuery] = useState('');
  const [riskViewMode, setRiskViewMode] = useState<'line' | 'grid'>('line');
  const [selectedRiskForAnalysis, setSelectedRiskForAnalysis] = useState<any>(null);

  const CRITICAL_ALERTS = useMemo(() => [
    {
      sku: 'BrandA Cola 500ml',
      riskScore: '98%',
      factor: 'Margin Leak',
      desc: 'Unit margins fell below 11.4% (vs 25.0% target) driven by commodity inflation.',
      action: 'Discontinue',
      productCat: 'Beverages'
    },
    {
      sku: 'BrandC Greek Yogurt 500g',
      riskScore: '94%',
      factor: 'Overlap',
      desc: 'Severe overlap (85% correlation) cannibalizing core line. Generating changeover overheads.',
      action: 'Consolidate',
      productCat: 'Dairy'
    },
    {
      sku: 'BrandF Shampoo 400ml',
      riskScore: '89%',
      factor: 'Regulatory',
      desc: 'Pending chemical tax regulation changes will inflate surfactant packaging COGS by 18%.',
      action: 'Reformulate',
      productCat: 'Personal Care'
    },
    {
      sku: 'BrandB Chips Barbecue',
      riskScore: '85%',
      factor: 'Declining Sales',
      desc: 'Volume sales decreased by 22% over consecutive quarters indicating consumer shift.',
      action: 'Reposition',
      productCat: 'Snacks'
    },
    {
      sku: 'BrandD Multi-Purpose Spray',
      riskScore: '81%',
      factor: 'Supply Chain',
      desc: 'Out of stock rate reached 34% due to local container import disruptions.',
      action: 'Reformulate',
      productCat: 'Household'
    },
    {
      sku: 'BrandE Milk 2L',
      riskScore: '78%',
      factor: 'Low Profitability',
      desc: 'High logistics refrigeration costs are eating away regional distribution margins.',
      action: 'Consolidate',
      productCat: 'Dairy'
    }
  ], []);

  const handlePhaseClick = (phase: string) => {
    if (setSelectedRoadmapPhaseFilter && setActiveTab) {
      let actionVal = 'All';
      if (phase === 'q1') actionVal = 'Discontinue';
      if (phase === 'q2') actionVal = 'Reformulate';
      if (phase === 'q3') actionVal = 'Reposition';
      if (phase === 'q4') actionVal = 'Invest';
      
      setSelectedRoadmapPhaseFilter(actionVal);
      setActiveTab(10); // Navigate to SKU Drill Down tab!
    } else {
      setSelectedRoadmapPhase(phase);
    }
  };


  // Drill down routing logic
  if (activeDrillDown === 'financial') {
    return <FinancialDrillDown onBack={() => setActiveDrillDown(null)} />;
  }
  if (activeDrillDown === 'portfolio') {
    return <PortfolioDrillDown onBack={() => setActiveDrillDown(null)} />;
  }
  if (activeDrillDown === 'supply_chain') {
    return <SupplyChainDrillDown onBack={() => setActiveDrillDown(null)} />;
  }
  if (activeDrillDown === 'customer_market') {
    return <CustomerMarketDrillDown onBack={() => setActiveDrillDown(null)} />;
  }
  if (activeDrillDown === 'regulatory') {
    return <RegulatoryDrillDown onBack={() => setActiveDrillDown(null)} />;
  }
  if (activeDrillDown === 'summary_dashboard') {
    return <SummaryDashboardPage onBack={() => setActiveDrillDown(null)} />;
  }



  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">

      <div className="space-y-3.5">
        {/* Quick Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 p-2 rounded-sm shadow-sm text-[9px] font-bold uppercase tracking-wider">
        <span className="text-zinc-400 dark:text-zinc-500 mr-2 uppercase tracking-widest text-[8px]">Quick Jump:</span>
        <button 
          onClick={() => {
            const el = document.getElementById('rat-factors');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          📊 Rationale Factors
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => {
            const el = document.getElementById('rat-roadmap');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          ⚡ Phased Rollout Roadmap
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => {
            const el = document.getElementById('rat-ai-recs');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          🎯 AI Recommendations
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => {
            const el = document.getElementById('rat-breakdown');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          📈 Rationale Breakdown
        </button>
      </div>

      {/* Rationale Summary by Category (Interactive Deep Dive List) */}
      <div id="rat-factors" className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3 rounded-sm flex flex-col gap-2.5">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">RATIONALE FACTORS</h3>
          <p className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">Overview of key rationalization factors with Deep Dive controls</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border-t border-black/5 dark:border-white/5 pt-3">
          {/* Financial Reasons KPI Card */}
          <button 
            onClick={() => setActiveDrillDown('financial')}
            className="neumorphic-soft-card p-3 rounded-xl flex flex-col justify-between h-[105px] hover:border-emerald-500/30 dark:hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full group relative overflow-hidden outline-none"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Financial Reasons
              </span>
              <span className="p-1 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-500">
                <Percent size={14} />
              </span>
            </div>
            <div className="my-1">
              <h4 className="text-[22px] font-display font-black text-zinc-900 dark:text-zinc-100 leading-none">
                4
              </h4>
              <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                Identified Factors
              </p>
            </div>
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7.5px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-wider">
              <span>Deep Dive</span>
              <ChevronRight size={8} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Portfolio Reasons KPI Card */}
          <button 
            onClick={() => setActiveDrillDown('portfolio')}
            className="neumorphic-soft-card p-3 rounded-xl flex flex-col justify-between h-[105px] hover:border-red-500/30 dark:hover:border-red-500/40 hover:bg-red-500/[0.02] dark:hover:bg-red-500/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full group relative overflow-hidden outline-none"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-all pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Portfolio Reasons
              </span>
              <span className="p-1 rounded bg-red-500/10 text-red-500 dark:text-red-500">
                <LayoutGrid size={14} />
              </span>
            </div>
            <div className="my-1">
              <h4 className="text-[22px] font-display font-black text-zinc-900 dark:text-zinc-100 leading-none">
                4
              </h4>
              <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                Identified Factors
              </p>
            </div>
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7.5px] font-black uppercase text-red-600 dark:text-red-500 tracking-wider">
              <span>Deep Dive</span>
              <ChevronRight size={8} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Supply Chain KPI Card */}
          <button 
            onClick={() => setActiveDrillDown('supply_chain')}
            className="neumorphic-soft-card p-3 rounded-xl flex flex-col justify-between h-[105px] hover:border-blue-500/30 dark:hover:border-blue-500/40 hover:bg-blue-500/[0.02] dark:hover:bg-blue-500/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full group relative overflow-hidden outline-none"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Supply Chain
              </span>
              <span className="p-1 rounded bg-blue-500/10 text-blue-500 dark:text-blue-500">
                <Box size={14} />
              </span>
            </div>
            <div className="my-1">
              <h4 className="text-[22px] font-display font-black text-zinc-900 dark:text-zinc-100 leading-none">
                3
              </h4>
              <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                Identified Factors
              </p>
            </div>
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7.5px] font-black uppercase text-blue-600 dark:text-blue-500 tracking-wider">
              <span>Deep Dive</span>
              <ChevronRight size={8} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Customer/Market KPI Card */}
          <button 
            onClick={() => setActiveDrillDown('customer_market')}
            className="neumorphic-soft-card p-3 rounded-xl flex flex-col justify-between h-[105px] hover:border-amber-500/30 dark:hover:border-amber-500/40 hover:bg-amber-500/[0.02] dark:hover:bg-amber-500/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full group relative overflow-hidden outline-none"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Customer/Market
              </span>
              <span className="p-1 rounded bg-amber-500/10 text-amber-500 dark:text-amber-500">
                <Compass size={14} />
              </span>
            </div>
            <div className="my-1">
              <h4 className="text-[22px] font-display font-black text-zinc-900 dark:text-zinc-100 leading-none">
                5
              </h4>
              <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                Identified Factors
              </p>
            </div>
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7.5px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-wider">
              <span>Deep Dive</span>
              <ChevronRight size={8} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Regulatory/Risk KPI Card */}
          <button 
            onClick={() => setActiveDrillDown('regulatory')}
            className="neumorphic-soft-card p-3 rounded-xl flex flex-col justify-between h-[105px] hover:border-purple-500/30 dark:hover:border-purple-500/40 hover:bg-purple-500/[0.02] dark:hover:bg-purple-500/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full group relative overflow-hidden outline-none"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Regulatory/Risk
              </span>
              <span className="p-1 rounded bg-purple-500/10 text-purple-500 dark:text-purple-500">
                <Shield size={14} />
              </span>
            </div>
            <div className="my-1">
              <h4 className="text-[22px] font-display font-black text-zinc-900 dark:text-zinc-100 leading-none">
                3
              </h4>
              <p className="text-[7.5px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                Identified Factors
              </p>
            </div>
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[7.5px] font-black uppercase text-purple-600 dark:text-purple-500 tracking-wider">
              <span>Deep Dive</span>
              <ChevronRight size={8} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>


      {/* Phased Rollout Roadmap */}
      <div id="rat-roadmap" className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-sm flex flex-col gap-4">
        <div className="flex items-start gap-2 border-l-2 border-indigo-600 pl-3 text-left">
          <div>
            <h3 className="text-[10px] font-black text-zinc-900 dark:text-white font-display uppercase tracking-wider">Phased Rollout Roadmap</h3>
            <p className="text-[8px] text-zinc-500 dark:text-zinc-500 mt-0.5 uppercase tracking-wide font-bold">A realistic sequencing of the recommended actions — what to execute first, second, third, and fourth</p>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="w-full h-8 rounded-full overflow-hidden flex font-display text-[9px] font-black text-white select-none">
          {/* Q1: 78 SKUs (approx 31.45% width) */}
          <div 
            onClick={() => handlePhaseClick('q1')}
            className="bg-[#ef4444] h-full flex items-center justify-center transition-all hover:brightness-105 active:scale-95 cursor-pointer" 
            style={{ width: '31.45%' }}
            title="Click to view Q1 Phased Rollout Details"
          >
            <span>Q1 · 78</span>
          </div>
          {/* Q2: 56 SKUs (approx 22.58% width) */}
          <div 
            onClick={() => handlePhaseClick('q2')}
            className="bg-[#f59e0b] h-full flex items-center justify-center transition-all hover:brightness-105 active:scale-95 cursor-pointer" 
            style={{ width: '22.58%' }}
            title="Click to view Q2 Phased Rollout Details"
          >
            <span>Q2 · 56</span>
          </div>
          {/* Q3: 72 SKUs (approx 29.03% width) */}
          <div 
            onClick={() => handlePhaseClick('q3')}
            className="bg-[#3b82f6] h-full flex items-center justify-center transition-all hover:brightness-105 active:scale-95 cursor-pointer" 
            style={{ width: '29.03%' }}
            title="Click to view Q3 Phased Rollout Details"
          >
            <span>Q3 · 72</span>
          </div>
          {/* Q4: 42 SKUs (approx 16.94% width) */}
          <div 
            onClick={() => handlePhaseClick('q4')}
            className="bg-[#10b981] h-full flex items-center justify-center transition-all hover:brightness-105 active:scale-95 cursor-pointer" 
            style={{ width: '16.94%' }}
            title="Click to view Q4 Phased Rollout Details"
          >
            <span>Q4 · 42</span>
          </div>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-1 text-left">
          {/* Card 1 */}
          <div 
            onClick={() => handlePhaseClick('q1')}
            className="border border-black/5 dark:border-white/5 rounded-sm p-4 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col gap-3 relative pt-6 hover:border-indigo-500/30 dark:hover:border-indigo-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all hover:shadow-sm"
          >
            <span className="absolute top-2 left-4 px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black tracking-widest uppercase rounded-full">
              Q1 - Step 1
            </span>
            <div className="space-y-0.5">
              <h4 className="text-[11.5px] font-extrabold text-[#ef4444]">Discontinue / Consolidate</h4>
              <span className="text-[9px] font-semibold text-zinc-400 uppercase">78 SKUs · $23.4M revenue involved</span>
            </div>
            <div className="bg-black/2 dark:bg-white/2 p-3 rounded text-[10px] text-zinc-600 dark:text-zinc-500 leading-relaxed font-medium">
              Fastest to execute and lowest risk to start with — stop the bleeding on low-profitability SKUs before investing effort elsewhere.
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => handlePhaseClick('q2')}
            className="border border-black/5 dark:border-white/5 rounded-sm p-4 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col gap-3 relative pt-6 hover:border-indigo-500/30 dark:hover:border-indigo-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all hover:shadow-sm"
          >
            <span className="absolute top-2 left-4 px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black tracking-widest uppercase rounded-full">
              Q2 - Step 2
            </span>
            <div className="space-y-0.5">
              <h4 className="text-[11.5px] font-extrabold text-[#f59e0b]">Reformulate / Margin Improvement</h4>
              <span className="text-[9px] font-semibold text-zinc-400 uppercase">56 SKUs · $16.8M revenue involved</span>
            </div>
            <div className="bg-black/2 dark:bg-white/2 p-3 rounded text-[10px] text-zinc-600 dark:text-zinc-500 leading-relaxed font-medium">
              High margin leakage but reformulating recipes or renegotiating contracts takes 3-6 months. Plan early, execute in phase 2.
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => handlePhaseClick('q3')}
            className="border border-black/5 dark:border-white/5 rounded-sm p-4 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col gap-3 relative pt-6 hover:border-indigo-500/30 dark:hover:border-indigo-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all hover:shadow-sm"
          >
            <span className="absolute top-2 left-4 px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black tracking-widest uppercase rounded-full">
              Q3 - Step 3
            </span>
            <div className="space-y-0.5">
              <h4 className="text-[11.5px] font-extrabold text-[#3b82f6]">Renegotiate / Price Adjust</h4>
              <span className="text-[9px] font-semibold text-zinc-400 uppercase">72 SKUs · $21.6M revenue involved</span>
            </div>
            <div className="bg-black/2 dark:bg-white/2 p-3 rounded text-[10px] text-zinc-600 dark:text-zinc-500 leading-relaxed font-medium">
              Requires careful negotiation or customer communication; execute once baseline margin improvement is secured.
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => handlePhaseClick('q4')}
            className="border border-black/5 dark:border-white/5 rounded-sm p-4 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col gap-3 relative pt-6 hover:border-indigo-500/30 dark:hover:border-indigo-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all hover:shadow-sm"
          >
            <span className="absolute top-2 left-4 px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black tracking-widest uppercase rounded-full">
              Q4 - Step 4
            </span>
            <div className="space-y-0.5">
              <h4 className="text-[11.5px] font-extrabold text-[#10b981]">Invest / Expand</h4>
              <span className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase">42 SKUs · $12.8M revenue involved</span>
            </div>
            <div className="bg-black/2 dark:bg-white/2 p-3 rounded text-[10px] text-zinc-600 dark:text-zinc-500 leading-relaxed font-medium">
              Scale up once capacity, budget, and attention freed from the earlier phases can be redirected to winners.
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Row 2: Rationale Impact Analysis & SKU Action Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: AI Recommendations & Immediate Actions (1 col span) */}
        <div id="rat-ai-recs" className="glass-card bg-gradient-to-br from-red-500/[0.02] to-indigo-500/[0.02] dark:from-red-500/[0.04] dark:to-indigo-500/[0.04] border border-red-500/10 dark:border-red-500/20 p-4 rounded-sm flex flex-col justify-between h-[480px] lg:col-span-1">
          <div>
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
              <div className="flex items-start gap-1.5 border-l-2 border-red-500 pl-2 text-left">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[10px] font-black text-zinc-900 dark:text-white font-display uppercase tracking-wider">AI Recommendations</h3>
                  </div>
                  <p className="text-[7.5px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold">Immediate operational intervention</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Toggle selector */}
                <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/10 dark:border-white/10 gap-0.5">
                  <button
                    onClick={() => setRiskViewMode('line')}
                    className={`p-1 rounded transition-all cursor-pointer border-none flex items-center justify-center ${
                      riskViewMode === 'line'
                        ? 'bg-white dark:bg-acies-gray shadow-sm text-zinc-900 dark:text-white font-bold'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 bg-transparent'
                    }`}
                    title="Line View"
                  >
                    <List size={10} />
                  </button>
                  <button
                    onClick={() => setRiskViewMode('grid')}
                    className={`p-1 rounded transition-all cursor-pointer border-none flex items-center justify-center ${
                      riskViewMode === 'grid'
                        ? 'bg-white dark:bg-acies-gray shadow-sm text-zinc-900 dark:text-white font-bold'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 bg-transparent'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={10} />
                  </button>
                </div>

                <span className="px-1.5 py-0.5 bg-red-500/10 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-500/20 rounded text-[7.5px] font-black tracking-widest uppercase">
                  6 Critical
                </span>
              </div>
            </div>

            {/* List / Grid Stack of Cards */}
            <div className={`overflow-y-auto max-h-[385px] pr-1.5 mt-3 ${
              riskViewMode === 'grid' ? 'grid grid-cols-2 gap-2.5' : 'flex flex-col gap-2.5'
            }`}>
              {CRITICAL_ALERTS.map((alert, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 rounded-sm p-2.5 flex flex-col justify-between text-left hover:border-red-500/25 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[7px] font-extrabold uppercase bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 leading-none">
                        {alert.riskScore} Risk
                      </span>
                      <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        {alert.factor}
                      </span>
                    </div>
                    <h4 className="text-[9.5px] font-extrabold text-zinc-900 dark:text-zinc-200 truncate" title={alert.sku}>
                      {alert.sku}
                    </h4>
                    <p className="text-[8.5px] text-zinc-500 dark:text-zinc-500 leading-normal mt-0.5 font-medium line-clamp-2" title={alert.desc}>
                      {alert.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between mt-1.5">
                    <span className="text-[7.5px] font-black uppercase text-red-600 dark:text-red-400">
                      {alert.action}
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedRiskForAnalysis(alert);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[9.5px] font-extrabold uppercase tracking-wider cursor-pointer border-none shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <span>Analyze</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Rationale Impact Analysis (1 col span) */}
        <div id="rat-breakdown" className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col justify-between h-[480px] lg:col-span-1">
          <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">
                {impactViewMode === 'bar' ? 'RATIONALE IMPACT ANALYSIS' : 'RATIONALE BREAKDOWN'}
              </h3>
              <p className="text-[9px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">
                {impactViewMode === 'bar' 
                  ? 'Distribution of SKUs by primary rationalization reason' 
                  : 'Distribution across primary rationale fields'}
              </p>
            </div>
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10 shrink-0 gap-1">
              <button
                onClick={() => setImpactViewMode('bar')}
                className={`p-2 rounded-lg transition-all cursor-pointer border-none flex items-center justify-center ${
                  impactViewMode === 'bar'
                    ? 'bg-white dark:bg-acies-gray shadow-sm text-zinc-900 dark:text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 bg-transparent'
                }`}
                title="Bar Chart"
              >
                <BarChart2 size={16} />
              </button>
              <button
                onClick={() => setImpactViewMode('donut')}
                className={`p-2 rounded-lg transition-all cursor-pointer border-none flex items-center justify-center ${
                  impactViewMode === 'donut'
                    ? 'bg-white dark:bg-acies-gray shadow-sm text-zinc-900 dark:text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 bg-transparent'
                }`}
                title="Donut Chart"
              >
                <LucidePieChart size={16} />
              </button>
              <button
                onClick={() => setImpactViewMode('spider')}
                className={`p-2 rounded-lg transition-all cursor-pointer border-none flex items-center justify-center ${
                  impactViewMode === 'spider'
                    ? 'bg-white dark:bg-acies-gray shadow-sm text-zinc-900 dark:text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 bg-transparent'
                }`}
                title="Radar Chart"
              >
                <LucideRadar size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 mt-4 relative flex flex-col justify-between">
            {impactViewMode === 'bar' && (
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="95%">
                    <BarChart
                      data={RATIONALE_DRIVERS}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        stroke="currentColor" 
                        fontSize={8} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: 'currentColor', opacity: 0.6 }}
                      />
                      <YAxis 
                        stroke="currentColor" 
                        fontSize={8} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: 'currentColor', opacity: 0.6 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', color: '#fff', fontSize: '9.5px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={30}>
                        {RATIONALE_DRIVERS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[8.5px] font-semibold text-zinc-500 dark:text-zinc-400 mt-2 pb-1">
                  {RATIONALE_DRIVERS.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 justify-center truncate" title={d.name}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="truncate">{d.name} ({d.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {impactViewMode === 'donut' && (
              <div className="w-full h-full flex flex-row items-center justify-around gap-4 p-2">
                {/* Left: Donut Chart */}
                <div className="flex-1 flex items-center justify-center min-w-0">
                  <div className="w-[200px] h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {/* `activeIndex` was removed from <Pie> in Recharts v3
                            (this project is on 3.8.1), so it had been inert since
                            the upgrade — the first slice is no longer statically
                            emphasised. `activeShape` still applies on hover.
                            The dead prop was dropped to match real behaviour. */}
                        <Pie
                          data={RATIONALE_DRIVERS}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="count"
                          stroke="#ffffff"
                          strokeWidth={2}
                          activeShape={renderActiveShape}
                        >
                          {RATIONALE_DRIVERS.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', color: '#fff', fontSize: '9.5px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Right: Vertical Progress Legend */}
                <div className="flex flex-col gap-2.5 justify-center shrink-0 pr-4 select-none">
                  {[...RATIONALE_DRIVERS]
                    .sort((a, b) => b.pct - a.pct)
                    .map(d => (
                      <div key={d.name} className="flex items-center justify-between gap-4 text-[9px] font-semibold">
                        <div className="flex items-center gap-1.5 w-[110px] truncate" title={d.name}>
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-zinc-700 dark:text-zinc-400 truncate">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Progress Bar */}
                          <div className="w-16 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shrink-0">
                            <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                          </div>
                          <span className="w-7 text-right font-black text-zinc-900 dark:text-white font-mono">{d.pct}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {impactViewMode === 'spider' && (
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="95%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RATIONALE_DRIVERS}>
                      <PolarGrid stroke="currentColor" opacity={0.3} strokeWidth={1} strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: 'currentColor', fontWeight: 'bold', opacity: 0.9 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar 
                        name="SKUs" 
                        dataKey="count" 
                        stroke="#6366f1" 
                        strokeWidth={2} 
                        fill="#6366f1" 
                        fillOpacity={0.25} 
                        dot={{ r: 4, fill: '#6366f1', stroke: '#6366f1', strokeWidth: 1 }}
                      >
                        <LabelList 
                          dataKey="count" 
                          position="top" 
                          offset={8} 
                          style={{ fontSize: '9px', fontWeight: '900', fill: '#6366f1', fontFamily: 'monospace' }} 
                        />
                      </Radar>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', color: '#fff', fontSize: '9.5px' }}
                        formatter={(value: any) => [`${value} SKUs`]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roadmap Phase Details Modal */}
      {selectedRoadmapPhase && (() => {
        const details = ROADMAP_PHASES_DETAILS[selectedRoadmapPhase];
        if (!details) return null;
        
        const modalFilteredSkus = details.skus.filter(sku => 
          sku.sku.toLowerCase().includes(roadmapSearchQuery.toLowerCase()) ||
          sku.code.toLowerCase().includes(roadmapSearchQuery.toLowerCase()) ||
          sku.category.toLowerCase().includes(roadmapSearchQuery.toLowerCase())
        );

        const maxCatCount = Math.max(...details.categories.map(c => c.count));
        const maxRegionCount = Math.max(...details.regions.map(r => r.count));
        const maxStageCount = Math.max(...details.stages.map(s => s.count));

        return (
          <ModalShell isOpen onClose={() => setSelectedRoadmapPhase(null)} layer="base" blur="sm" className="flex items-center justify-center p-4 md:p-6 animate-fadeIn text-zinc-800 dark:text-zinc-200">
            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-slideIn">
              
              {/* Header */}
              <div className="p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[9px] text-indigo-700 dark:text-indigo-400 uppercase tracking-widest font-black block mb-1">
                    {details.step} · Phased Rollout breakdown
                  </span>
                  <h3 className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-tight">
                    {details.title}
                  </h3>
                  <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase mt-0.5 block">
                    {details.skusCount} SKUs · {details.revenue} Annualized Revenue Exposure
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedRoadmapPhase(null);
                    setRoadmapSearchQuery('');
                  }}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-700 dark:text-zinc-400">
                
                {/* Breakdowns section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* By Product Category */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 text-left">By Product Category</h4>
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-sm space-y-3">
                        {details.categories.map(cat => (
                          <div key={cat.name} className="flex items-center justify-between gap-3">
                            <span className="w-1/3 truncate text-[10px] font-bold text-zinc-700 dark:text-zinc-400 text-left">{cat.name}</span>
                            <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
                              <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${(cat.count / maxCatCount) * 100}%` }} />
                            </div>
                            <span className="w-8 text-right font-mono font-black text-zinc-700 dark:text-zinc-300">{cat.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* By Region */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 text-left">By Region</h4>
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-sm space-y-3">
                        {details.regions.map(reg => (
                          <div key={reg.name} className="flex items-center justify-between gap-3">
                            <span className="w-1/3 truncate text-[10px] font-bold text-zinc-700 dark:text-zinc-400 text-left">{reg.name}</span>
                            <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
                              <div className={`h-full ${reg.color} rounded-full`} style={{ width: `${(reg.count / maxRegionCount) * 100}%` }} />
                            </div>
                            <span className="w-8 text-right font-mono font-black text-zinc-700 dark:text-zinc-300">{reg.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* By Lifecycle Stage */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 text-left">By Lifecycle Stage</h4>
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-sm space-y-3">
                        {details.stages.map(stg => (
                          <div key={stg.name} className="flex items-center justify-between gap-3">
                            <span className="w-1/3 truncate text-[10px] font-bold text-zinc-700 dark:text-zinc-400 text-left">{stg.name}</span>
                            <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
                              <div className={`h-full ${stg.color} rounded-full`} style={{ width: `${(stg.count / maxStageCount) * 100}%` }} />
                            </div>
                            <span className="w-8 text-right font-mono font-black text-zinc-700 dark:text-zinc-300">{stg.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Insights list */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 text-left">Insights</h4>
                      <div className="space-y-2 text-left">
                        {details.insights.map((insight, idx) => (
                          <div key={idx} className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/30 p-2.5 rounded-sm flex items-start gap-2.5 text-[10px] leading-relaxed">
                            <Lightbulb size={12} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SKUs — Explore & Sort Table section */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 text-left">SKUs — Explore & Sort</h4>
                    
                    {/* Modal Search Bar */}
                    <div className="relative max-w-xs w-full">
                      <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500" />
                      <input 
                        type="text" 
                        placeholder="Search these SKUs by name, code, or category..."
                        value={roadmapSearchQuery}
                        onChange={(e) => setRoadmapSearchQuery(e.target.value)}
                        className="w-full pl-7 pr-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded text-[9.5px] focus:outline-none focus:border-indigo-500 text-zinc-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* SKU Table */}
                  <div className="border border-black/5 dark:border-white/5 rounded overflow-x-auto">
                    <table className="w-full text-[10px] text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-[8px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">
                          <th className="py-2 px-3">SKU</th>
                          <th className="py-2 px-2">Category</th>
                          <th className="py-2 px-2">Region</th>
                          <th className="py-2 px-2">Revenue</th>
                          <th className="py-2 px-2">Margin</th>
                          <th className="py-2 px-2">Growth</th>
                          <th className="py-2 px-2">Stage</th>
                          <th className="py-2 px-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalFilteredSkus.map(sku => (
                          <tr key={sku.code} className="border-b border-black/5 dark:border-white/5 last:border-none hover:bg-black/[0.01] dark:hover:bg-white/[0.01] text-zinc-700 dark:text-zinc-300">
                            <td className="py-2 px-3 text-left">
                              <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block">{sku.sku}</span>
                              <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-widest">{sku.code}</span>
                            </td>
                            <td className="py-2 px-2 font-medium text-left">{sku.category}</td>
                            <td className="py-2 px-2 font-semibold text-left">{sku.region}</td>
                            <td className="py-2 px-2 font-bold text-left">{sku.revenue}</td>
                            <td className="py-2 px-2 font-bold text-left">{sku.margin}</td>
                            <td className={`py-2 px-2 font-mono font-bold text-left ${sku.growthColor}`}>{sku.growth}</td>
                            <td className="py-2 px-2 text-left">
                              <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-extrabold uppercase ${
                                sku.stage === 'Growth' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                                sku.stage === 'Decline' ? 'bg-red-500/10 text-red-500 border border-red-500/10' :
                                'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10'
                              }`}>
                                {sku.stage}
                              </span>
                            </td>
                            <td className="py-2 px-2 font-extrabold text-left">{sku.action}</td>
                          </tr>
                        ))}
                        {modalFilteredSkus.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-zinc-500 dark:text-zinc-500">
                              No SKUs matched your search term.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-end">
                <button 
                  onClick={() => {
                    setSelectedRoadmapPhase(null);
                    setRoadmapSearchQuery('');
                  }}
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-400 rounded text-[9.5px] font-bold uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  Close Roadmap Phase
                </button>
              </div>

            </div>
          </ModalShell>
        );
      })()}      {/* AI Risk Analysis Details Modal */}
      {selectedRiskForAnalysis && (() => {
        const rca = getRcaDetails(selectedRiskForAnalysis.sku, selectedRiskForAnalysis.factor);
        return (
          <ModalShell isOpen onClose={() => setSelectedRiskForAnalysis(null)} layer="base" blur="sm" className="flex items-center justify-center p-4 md:p-6 animate-fadeIn text-zinc-800 dark:text-zinc-200">
            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-slideIn">
              
              {/* Header */}
              <div className="p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[9px] text-red-700 dark:text-red-400 uppercase tracking-widest font-black block mb-1">
                    AI Risk Diagnosis
                  </span>
                  <h3 className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-tight">
                    {selectedRiskForAnalysis.sku}
                  </h3>
                  <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase mt-0.5 block text-left">
                    {selectedRiskForAnalysis.productCat} Category · {selectedRiskForAnalysis.factor}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedRiskForAnalysis(null)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-700 dark:text-zinc-400">
                
                {/* AI Recommended Solution panel */}
                <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-sm text-left space-y-3">
                  <div>
                    <span className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-500 block uppercase tracking-widest mb-1.5">AI Recommended Solution</span>
                    <p className="text-[11.5px] leading-relaxed text-zinc-700 dark:text-zinc-200 font-extrabold">{rca.recommendations}</p>
                  </div>
                  
                  {/* Quantitative Comparison Table */}
                  <div className="border border-emerald-500/20 rounded overflow-hidden mt-3 bg-white/40 dark:bg-black/10">
                    <table className="w-full text-left border-collapse text-[9.5px]">
                      <thead>
                        <tr className="bg-emerald-500/15 border-b border-emerald-500/25 text-[8.5px] uppercase font-black text-emerald-800 dark:text-emerald-500 tracking-wider">
                          <th className="py-2 px-3">Quantitative Perks & Comparison</th>
                          <th className="py-2 px-2 text-right">Current</th>
                          <th className="py-2 px-2 text-right">Future (Simulated)</th>
                          <th className="py-2 px-3 text-right">Delta / Benefit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-500/10 font-bold text-zinc-700 dark:text-zinc-400">
                        {rca.perks && rca.perks.map((perk: any, idx: number) => (
                          <tr key={idx} className="hover:bg-emerald-500/5 transition-colors">
                            <td className="py-2 px-3 font-semibold text-zinc-800 dark:text-zinc-200">{perk.metric}</td>
                            <td className="py-2 px-2 text-right font-mono font-medium">{perk.current}</td>
                            <td className="py-2 px-2 text-right font-mono font-medium">{perk.future}</td>
                            <td className={`py-2 px-3 text-right font-mono font-black ${
                              perk.isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-500'
                            }`}>
                              {perk.delta}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Primary Root Causes */}
                <div className="space-y-2">
                  <h4 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 text-left">Primary Root Causes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {rca.rootCauses.map((cause, index) => (
                      <div key={cause.title} className="bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/5 p-2.5 rounded-sm relative flex flex-col gap-2 text-left hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-center">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-[8.5px] shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-600/10 px-1.5 py-0.5 rounded">FACTOR</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-[10.5px] leading-tight">{cause.title}</span>
                          <p className="text-zinc-600 dark:text-zinc-400 text-[9px] leading-normal">{cause.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnostic Charts */}
                <div className="space-y-4">
                  <h4 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 text-left">Diagnostic Analytics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MarginWaterfallChart />
                    <SkuCategoryBenchmarks skuName={selectedRiskForAnalysis.sku} category={selectedRiskForAnalysis.productCat} />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-between items-center">
                <button 
                  onClick={() => {
                    if (setTasks) {
                      const newTasks = generateTasksForSku(
                        selectedRiskForAnalysis.sku,
                        selectedRiskForAnalysis.action,
                        selectedRiskForAnalysis.factor
                      );
                      setTasks(prev => {
                        const updated = { ...prev };
                        Object.keys(newTasks).forEach(deptKey => {
                          updated[deptKey] = [...(updated[deptKey] || []), ...newTasks[deptKey]];
                        });
                        return updated;
                      });
                    }
                    setSelectedRiskForAnalysis(null);
                    if (setActiveTab) {
                      setActiveTab(11); // Open the Task Tracker tab!
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-sm flex items-center gap-1 font-extrabold"
                >
                  <span>Execute Plan</span>
                </button>
                <button 
                  onClick={() => setSelectedRiskForAnalysis(null)}
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-400 rounded text-[9.5px] font-bold uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  Close Analysis
                </button>
              </div>

            </div>
          </ModalShell>
        );
      })()}

    </div>
  );
};
