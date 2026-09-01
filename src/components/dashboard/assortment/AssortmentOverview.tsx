import React, { useState } from 'react';
import { Role } from '../../../types/dashboard';
import { AssortmentKPICards } from './AssortmentKPICards';
import { RegionalAssortmentGrid } from './RegionalAssortmentGrid';

import { TransferenceSimulator } from './TransferenceSimulator';
import { CrossLocationTransfer } from './CrossLocationTransfer';
import { LaunchEvaluator } from './LaunchEvaluator';
import { ExecutiveCart } from './ExecutiveCart';
import { SKUHoldingsMatrix } from './SKUHoldingsMatrix';
import { StagedAction } from './types';
import { Globe, Layers, Truck, Briefcase, ChevronRight, ChevronLeft, Trash2, CheckCircle } from 'lucide-react';
import { RegionalChannelPerformance } from './RegionalChannelPerformance';
import { ProductMixClustering } from './ProductMixClustering';

import { TimelineRange } from '../../../utils/timeframe';

interface AssortmentOverviewProps {
  role: Role;
  isDarkMode: boolean;
  onAuditClick: (metricName: string) => void;
  timelineRange: TimelineRange;
}

export const AssortmentOverview: React.FC<AssortmentOverviewProps> = ({ role, isDarkMode, onAuditClick, timelineRange }) => {
  // Local state to manage overrides passed from slider in RegionalAssortmentGrid to AssortmentKPICards
  const [kpiOverrides, setKpiOverrides] = useState<{
    density: string;
    burden: string;
    yieldVal: string;
    cannibalization: string;
  }>({
    density: '100 SKUs',
    burden: '68.0%',
    yieldVal: '$3.02 M',
    cannibalization: '0.62'
  });

  // Keep defaults in sync with global timeline picker changes
  React.useEffect(() => {
    let densityVal = '100 SKUs';
    let burdenVal = '68.0%';
    let yieldValueStr = '$3.02 M';
    let cannibalizationVal = '0.62';

    switch (timelineRange) {
      case '1m':
        burdenVal = '68.2%';
        yieldValueStr = '$0.25 M';
        cannibalizationVal = '0.64';
        break;
      case '3m':
        burdenVal = '67.5%';
        yieldValueStr = '$0.76 M';
        cannibalizationVal = '0.63';
        break;
      case '6m':
        burdenVal = '67.0%';
        yieldValueStr = '$1.51 M';
        cannibalizationVal = '0.62';
        break;
      case '12m':
        burdenVal = '66.7%';
        yieldValueStr = '$3.02 M';
        cannibalizationVal = '0.62';
        break;
      case '24m':
        burdenVal = '65.5%';
        yieldValueStr = '$6.04 M';
        cannibalizationVal = '0.61';
        break;
      case '36m':
        burdenVal = '64.2%';
        yieldValueStr = '$9.06 M';
        cannibalizationVal = '0.60';
        break;
    }

    setKpiOverrides({
      density: densityVal,
      burden: burdenVal,
      yieldVal: yieldValueStr,
      cannibalization: cannibalizationVal
    });
  }, [timelineRange]);

  const [stagedActions, setStagedActions] = useState<StagedAction[]>([]);
  const [subTab, setSubTab] = useState<'comprehensive' | 'performance' | 'mix_clustering' | 'guided'>('comprehensive');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '#';
      const params = new URLSearchParams(hash.substring(1));
      const subTabParam = params.get('subTab');
      if (subTabParam === 'guided' || subTabParam === 'comprehensive') {
        setSubTab(subTabParam);
      }
      const stepParam = params.get('step');
      if (stepParam) {
        const stepNum = parseInt(stepParam, 10);
        if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 4) {
          setCurrentStep(stepNum);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleStageAction = (action: StagedAction) => {
    setStagedActions(prev => [...prev, action]);
  };

  const handleRemoveAction = (id: string) => {
    setStagedActions(prev => prev.filter(a => a.id !== id));
  };

  const handleSliderChange = (simValues: {
    densityVal: string;
    burdenVal: string;
    yieldVal: string;
    cannibalizationVal: string;
  }) => {
    setKpiOverrides({
      density: simValues.densityVal,
      burden: simValues.burdenVal,
      yieldVal: simValues.yieldVal,
      cannibalization: simValues.cannibalizationVal
    });
  };

  const handleCommitInPage = () => {
    setIsCommitted(true);
    setTimeout(() => {
      setIsCommitted(false);
      setStagedActions([]);
    }, 3500);
  };

  // Totals for in-page Step 4 review
  const totalRevenue = stagedActions.reduce((sum, a) => sum + a.revenueImpact, 0);
  const totalMargin = stagedActions.reduce((sum, a) => sum + a.marginImpact, 0);
  const totalComplexity = stagedActions.reduce((sum, a) => sum + a.complexityImpact, 0);
  const totalSpace = stagedActions.reduce((sum, a) => sum + a.spaceImpact, 0);

  const steps = [
    { number: 1, name: 'Current Holdings', icon: Globe },
    { number: 2, name: 'Performance Diagnostics', icon: Layers },
    { number: 3, name: 'Reallocation & Launch', icon: Truck },
    { number: 4, name: 'Risk vs. Reward Ledger', icon: Briefcase }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-24 font-sans">
      {/* Assortment Header KPI Strip (Always Visible) */}
      <AssortmentKPICards 
        role={role} 
        onAuditClick={onAuditClick} 
        customValues={kpiOverrides} 
      />

      {/* Sub-tab Selection Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-zinc-800 dark:text-zinc-200">Assortment Decision Center</h2>
          <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Model catalog alterations, evaluate launch expansion variants, and commit local reallocations.</p>
        </div>
        
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded border border-black/10 dark:border-white/10 self-start font-bold gap-1 flex-wrap">
          <button
            onClick={() => setSubTab('comprehensive')}
            className={`px-3 py-1.5 text-[8.5px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer border-none outline-none ${
              subTab === 'comprehensive'
                ? 'bg-white dark:bg-zinc-800 text-acies-yellow shadow-sm shadow-black/5'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent'
            }`}
          >
            Comprehensive View
          </button>
          <button
            onClick={() => setSubTab('performance')}
            className={`px-3 py-1.5 text-[8.5px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer border-none outline-none ${
              subTab === 'performance'
                ? 'bg-white dark:bg-zinc-800 text-acies-yellow shadow-sm shadow-black/5'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent'
            }`}
          >
            Regional & Channel Performance
          </button>
          <button
            onClick={() => setSubTab('mix_clustering')}
            className={`px-3 py-1.5 text-[8.5px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer border-none outline-none ${
              subTab === 'mix_clustering'
                ? 'bg-white dark:bg-zinc-800 text-acies-yellow shadow-sm shadow-black/5'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent'
            }`}
          >
            Product Mix & Clustering
          </button>
          <button
            onClick={() => setSubTab('guided')}
            className={`px-3 py-1.5 text-[8.5px] font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer border-none outline-none ${
              subTab === 'guided'
                ? 'bg-white dark:bg-zinc-800 text-acies-yellow shadow-sm shadow-black/5'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent'
            }`}
          >
            Decision Flow (Wizard)
          </button>
        </div>
      </div>

      {subTab === 'comprehensive' && (
        <div className="space-y-6">
          {/* Regional Footprints & Optimizer Grid */}
          <RegionalAssortmentGrid 
            onSliderChange={handleSliderChange} 
            onStageAction={handleStageAction} 
            timelineRange={timelineRange}
          />



          {/* Demand Transference & Substitution Simulator */}
          <TransferenceSimulator onStageAction={handleStageAction} />

          {/* SKU Launch Accretion & Cannibalization Evaluator */}
          <LaunchEvaluator onStageAction={handleStageAction} />

          {/* Cross-Location Assortment Reallocation */}
          <CrossLocationTransfer onStageAction={handleStageAction} />

          {/* Executive Decision Cart (Sticky overlay drawer) */}
          <ExecutiveCart 
            stagedActions={stagedActions} 
            onRemoveAction={handleRemoveAction} 
            onClearCart={() => setStagedActions([])} 
          />
        </div>
      )}

      {subTab === 'performance' && (
        <RegionalChannelPerformance isDarkMode={isDarkMode} />
      )}

      {subTab === 'mix_clustering' && (
        <div className="space-y-6">
          <ProductMixClustering isDarkMode={isDarkMode} onStageAction={handleStageAction} />
          <ExecutiveCart 
            stagedActions={stagedActions} 
            onRemoveAction={handleRemoveAction} 
            onClearCart={() => setStagedActions([])} 
          />
        </div>
      )}

      {subTab === 'guided' && (
        <div className="space-y-6">
          
          {/* Step Navigator Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm">
            {steps.map((s) => {
              const isCurrent = currentStep === s.number;
              const isCompleted = currentStep > s.number;
              
              return (
                <div 
                  key={s.number} 
                  onClick={() => setCurrentStep(s.number)}
                  className={`flex items-center gap-3 cursor-pointer select-none transition-all duration-200 p-2 rounded-sm ${
                    isCurrent 
                      ? 'bg-acies-yellow/5 border border-acies-yellow/20 font-bold text-acies-yellow' 
                      : isCompleted 
                        ? 'opacity-85 text-emerald-500 font-bold' 
                        : 'opacity-40 text-zinc-500'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] font-bold font-mono transition-colors shrink-0 ${
                    isCurrent 
                      ? 'bg-acies-yellow/15 border-acies-yellow text-acies-yellow shadow-[0_0_8px_rgba(250,204,21,0.2)]' 
                      : isCompleted 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                        : 'bg-black/5 dark:bg-zinc-800 border-black/10 dark:border-white/10 text-zinc-500'
                  }`}>
                    {isCompleted ? '✓' : s.number}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[6.5px] uppercase tracking-wider text-zinc-400 block font-bold leading-none mb-0.5">Step {s.number}</span>
                    <span className="text-[8.5px] font-extrabold uppercase tracking-wider leading-none block truncate">{s.name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Holdings Diagnostic */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-sm text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                <h3 className="font-extrabold uppercase tracking-widest text-blue-500 mb-1 text-xs">Step 1: Current holdings & Catalog Footprints</h3>
                <p>What is the current holding of different SKUs at different locations? Use the holdings matrix below to inspect the listing availability and stock health of all 24 product variants across regions. Then, click the footprint cards below to inspect competitor price indices and depot capacity bounds.</p>
              </div>

              {/* SKU Holdings Matrix Grid */}
              <SKUHoldingsMatrix />

              {/* Regional Capacity Cards */}
              <RegionalAssortmentGrid 
                onSliderChange={handleSliderChange} 
                onStageAction={handleStageAction} 
                timelineRange={timelineRange}
              />
            </div>
          )}

          {/* Step 2: Performance Issues */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                <h3 className="font-extrabold uppercase tracking-widest text-acies-yellow mb-1 text-xs">Step 2: SKU Performance & Catalog Diagnostics</h3>
                <p>Are these SKUs selling well, or is there an issue we are facing in their sales? Hover over bars on the Pareto Concentration curve to diagnose tail-end SKU performance, and delist underperforming items on the virtual shelf simulator to capture demand transference flows.</p>
              </div>


              <TransferenceSimulator onStageAction={handleStageAction} />
            </div>
          )}

          {/* Step 3: Reallocation & Launch */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-sm text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                <h3 className="font-extrabold uppercase tracking-widest text-purple-500 mb-1 text-xs">Step 3: Reallocation & Launch Modeling</h3>
                <p>Does moving SKUs from one location to another help the situation? Use the SVG interactive logistics network map to drag route links and reallocate catalog listings to warehouses with free capacity. If launching new variants (e.g. Mango Fizz 750ml), model price packs vs. cannibalization profiles.</p>
              </div>

              <LaunchEvaluator onStageAction={handleStageAction} />
              <CrossLocationTransfer onStageAction={handleStageAction} />
            </div>
          )}

          {/* Step 4: Risk vs. Reward Decision Ledger */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                <h3 className="font-extrabold uppercase tracking-widest text-emerald-500 mb-1 text-xs">Step 4: Risk vs. Reward Decision Ledger</h3>
                <p>What are the risks and rewards involved in these decisions? Review the cumulative rewards (margin profit lift, manufacturing line savings, warehouse space freed) against operational risks before committing this assortment cycle plan to the supply chain ledger.</p>
              </div>

              {stagedActions.length === 0 ? (
                <div className="p-12 border border-dashed border-black/10 dark:border-white/10 rounded-sm text-center bg-black/[0.01] dark:bg-white/[0.01]">
                  <Briefcase size={32} className="mx-auto text-zinc-400 mb-4 animate-pulse" />
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-700 dark:text-zinc-300">No Staged Actions in Ledger</h4>
                  <p className="text-[10px] text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                    Staged decisions are currently empty. Please go back to Step 1, 2, or 3 to stage category realignments, delistings, price updates, or SKU launches.
                  </p>
                </div>
              ) : (
                <div className="p-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm space-y-6 text-left">
                  <div className="border-b border-black/5 dark:border-white/5 pb-3">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-zinc-800 dark:text-zinc-300">Review Staged Decisions Ledger</h4>
                    <p className="text-[9px] text-zinc-500 font-medium mt-0.5">Below is the ledger of all proposed assortment adjustments. Verify the cumulative operational and financial impact.</p>
                  </div>

                  {/* Staged Items list */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {stagedActions.map((action) => (
                      <div
                        key={action.id}
                        className="p-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded flex justify-between gap-4 text-[9.5px]"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-[6px] font-extrabold uppercase tracking-wider ${
                              action.type === 'reallocation' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/10' :
                              action.type === 'delisting' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10' :
                              action.type === 'pricing' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' :
                              'bg-purple-500/10 text-purple-500 border border-purple-500/10'
                            }`}>
                              {action.type}
                            </span>
                            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{action.title}</span>
                          </div>
                          <p className="text-[9px] text-zinc-500 leading-normal font-medium">{action.details}</p>
                          
                          {/* Item metrics */}
                          <div className="flex gap-3 text-[8px] font-bold text-zinc-500 pt-1 font-mono">
                            <span className={action.revenueImpact >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                              Rev: {action.revenueImpact >= 0 ? '+' : ''}${action.revenueImpact.toFixed(2)}M
                            </span>
                            <span className="text-emerald-500">
                              Profit: +${action.marginImpact.toFixed(2)}M
                            </span>
                            {action.complexityImpact > 0 && (
                              <span className="text-blue-500">
                                Comp: -{action.complexityImpact.toFixed(1)}pts
                              </span>
                            )}
                            {action.spaceImpact > 0 && (
                              <span className="text-purple-500">
                                Space: +{action.spaceImpact.toFixed(0)}p
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveAction(action.id)}
                          className="text-zinc-400 hover:text-rose-500 bg-transparent border-none cursor-pointer outline-none p-1 self-start transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Totals Summary */}
                  <div className="bg-black/[0.01] dark:bg-white/[0.01] p-4 border border-black/5 dark:border-white/5 rounded">
                    <span className="text-[8.5px] uppercase font-extrabold tracking-widest text-zinc-400 block mb-2.5">Staged Net Plan Totals:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-bold">
                      <div className="p-3 border border-black/5 dark:border-white/5 rounded bg-white dark:bg-zinc-900 flex flex-col justify-between">
                        <span className="text-zinc-600 text-[8px] uppercase tracking-wider block mb-1">Net Sales Impact</span>
                        <span className={totalRevenue >= 0 ? 'text-emerald-500 text-xs' : 'text-rose-500 text-xs'}>
                          {totalRevenue >= 0 ? '+' : ''}${totalRevenue.toFixed(2)} M
                        </span>
                      </div>
                      
                      <div className="p-3 border border-black/5 dark:border-white/5 rounded bg-white dark:bg-zinc-900 flex flex-col justify-between">
                        <span className="text-zinc-600 text-[8px] uppercase tracking-wider block mb-1">Net Profit Lift</span>
                        <span className={totalMargin >= 0 ? 'text-emerald-500 text-xs font-extrabold' : 'text-rose-500 text-xs'}>
                          {totalMargin >= 0 ? '+' : ''}${totalMargin.toFixed(2)} M
                        </span>
                      </div>

                      <div className="p-3 border border-black/5 dark:border-white/5 rounded bg-white dark:bg-zinc-900 flex flex-col justify-between">
                        <span className="text-zinc-600 text-[8px] uppercase tracking-wider block mb-1">Complexity Saved</span>
                        <span className="text-blue-500 text-xs">-{totalComplexity.toFixed(1)} Points</span>
                      </div>

                      <div className="p-3 border border-black/5 dark:border-white/5 rounded bg-white dark:bg-zinc-900 flex flex-col justify-between">
                        <span className="text-zinc-600 text-[8px] uppercase tracking-wider block mb-1">Warehouse Space</span>
                        <span className="text-purple-500 text-xs">+{totalSpace.toFixed(0)} Pallets</span>
                      </div>
                    </div>
                  </div>

                  {/* In-page Commit screen/action */}
                  {isCommitted ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center animate-fadeIn">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 border border-emerald-500/20">
                        <CheckCircle size={24} className="text-emerald-500 animate-pulse" />
                      </div>
                      <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-800 dark:text-zinc-200 mb-1">
                        Category Plan Dispatched!
                      </h4>
                      <p className="text-[9px] text-zinc-500 max-w-sm">
                        Assortment changes committed to master ledgers. Supply chain, pricing, and category teams notified.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleCommitInPage}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold uppercase tracking-widest text-center py-2.5 rounded text-[9px] cursor-pointer border-none outline-none transition-all active:scale-95 shadow-md shadow-blue-500/20"
                    >
                      Commit & Dispatch Category Plan
                    </button>
                  )}

                </div>
              )}

            </div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="flex justify-between items-center border-t border-black/5 dark:border-white/5 pt-4 mt-6">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className={`flex items-center gap-1.5 px-4 py-2 text-[9px] font-extrabold uppercase tracking-wider rounded-sm border transition-all ${
                currentStep === 1
                  ? 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-700 dark:border-zinc-700 cursor-not-allowed'
                  : 'bg-white dark:bg-zinc-800 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-zinc-700 dark:text-zinc-300 cursor-pointer active:scale-95'
              }`}
            >
              <ChevronLeft size={12} />
              Previous Step
            </button>

            <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400">
              Step {currentStep} of 4
            </span>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 text-[9px] font-extrabold uppercase tracking-wider rounded-sm bg-blue-500 hover:bg-blue-600 text-white cursor-pointer active:scale-95 border-none outline-none"
              >
                Next Step
                <ChevronRight size={12} />
              </button>
            ) : (
              <div className="w-[85px]" /> // placeholder spacer to keep justify-between aligned
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default AssortmentOverview;
