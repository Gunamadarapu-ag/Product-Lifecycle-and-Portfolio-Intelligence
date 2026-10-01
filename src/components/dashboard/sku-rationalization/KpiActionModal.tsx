import React from 'react';
import { X, Sparkles, TrendingUp, TrendingDown, ArrowRight, Play, Eye, FileSearch, HelpCircle } from 'lucide-react';
import { SKUS } from '../../../constants/data';
import { ModalShell } from '../../common/Modal';
import { useLiveData } from '../../../api/liveData';

interface KpiActionModalProps {
  activeKpi: string | null;
  onClose: () => void;
  // State control actions passed from the main workspace
  setSelectedAiClass: (val: string | null) => void;
  setActiveView: (view: 'simulator' | 'analyst') => void;
  setSimTab: (tab: 'remove' | 'price' | 'launch') => void;
  setSelectedSkuName: (name: string) => void;
  setSelectedSkuDetails: (sku: typeof SKUS[0]) => void;
}

export const KpiActionModal: React.FC<KpiActionModalProps> = ({
  activeKpi,
  onClose,
  setSelectedAiClass,
  setActiveView,
  setSimTab,
  setSelectedSkuName,
  setSelectedSkuDetails
}) => {
  // Real per-SKU net sales ($M); `s.rev` is ~22x too large (TODO.md O1). Must
  // run before the early return below — hooks can't be called conditionally.
  const { skuRevenueM } = useLiveData();
  if (!activeKpi) return null;

  // Get the 6 sunset candidates dynamically
  const sunsetCandidates = SKUS.filter(s => {
    if (s.val >= 0.7 && s.cx <= 0.4) return false;
    if (s.val >= 0.6 && s.growth >= 0.15) return false;
    if (s.val < 0.5 && s.cx < 0.5 && s.margin >= 30) return false;
    if (s.val < 0.4 && s.cx >= 0.6) return true;
    return false;
  });

  // Action options configuration based on KPI label
  const getKpiDetails = () => {
    switch (activeKpi) {
      case 'Portfolio SKUs':
        return {
          title: 'Portfolio SKUs Assortment Command',
          value: '100 Active SKUs',
          trendText: '−3 rationalized this Q',
          trendType: 'up',
          desc: 'Total active SKUs across the global portfolio. Monitoring category velocity splits is critical to prevent stockouts and carrier fragmentation.',
          actions: [
            {
              title: '🔍 Focus Portfolio Product Directory',
              desc: 'Scroll down to the Portfolio Product Directory at the bottom of this page to search, filter, and inspect specific product margins.',
              buttonText: 'Open Product Directory',
              onExecute: () => {
                onClose();
                setTimeout(() => {
                  const element = document.getElementById('product-directory-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    element.classList.add('ring-2', 'ring-acies-yellow/50');
                    setTimeout(() => element.classList.remove('ring-2', 'ring-acies-yellow/50'), 2000);
                  }
                }, 100);
              }
            },
            {
              title: '📈 Filter Dashboard: Core Hero SKUs (Retain)',
              desc: 'Apply a segment filter across all charts to isolate the top-performing commercial value products.',
              buttonText: 'Show Retain Segment',
              onExecute: () => {
                setSelectedAiClass('retain');
                onClose();
                setTimeout(() => {
                  const element = document.getElementById('quadrant-matrix-section');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }
            },
            {
              title: '📦 Switch to Cannibalization Analyst Workspace',
              desc: 'Analyze category variants and potential product cannibalization to optimize the active portfolio.',
              buttonText: 'Switch Workspaces',
              onExecute: () => {
                setActiveView('analyst');
                onClose();
              }
            }
          ]
        };

      case 'Sunset Candidates':
        return {
          title: 'Sunset Candidates Action Center',
          value: `${sunsetCandidates.length} SKUs Identified`,
          trendText: 'Action required immediately',
          trendType: 'down',
          desc: 'AI has flagged these low-value, high-complexity tail SKUs as sunset candidates. Decommissioning these items frees up critical supply chain resources.',
          actions: [
            {
              title: '⚡ Simulate SKU Discontinuation',
              desc: 'Model the direct financial impact and margin displacement of sun-setting a specific candidate.',
              buttonText: 'Discontinue Candidates...',
              isSubmenu: true,
              submenuItems: sunsetCandidates.map(s => ({
                label: `Discontinue ${s.name} ($${(skuRevenueM?.[s.name] ?? s.rev).toLocaleString('en-US', { maximumFractionDigits: 1 })} M)`,
                onClick: () => {
                  setSelectedSkuName(s.name);
                  setSimTab('remove');
                  onClose();
                  setTimeout(() => {
                    const element = document.getElementById('simulation-desk-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      element.classList.add('ring-2', 'ring-acies-yellow/50');
                      setTimeout(() => element.classList.remove('ring-2', 'ring-acies-yellow/50'), 2000);
                    }
                  }, 100);
                }
              }))
            },
            {
              title: '🔍 Inspect SKU Intelligence Profile',
              desc: 'Open the detailed glassmorphic profile card to audit margin leakage, stockouts, and lead times.',
              buttonText: 'Inspect Profiles...',
              isSubmenu: true,
              submenuItems: sunsetCandidates.map(s => ({
                label: `Inspect ${s.name}`,
                onClick: () => {
                  setSelectedSkuDetails(s);
                  onClose();
                }
              }))
            },
            {
              title: '🌅 Bulk Segment Filter: Sunset SKU Candidates',
              desc: 'Filter all workspace charts and lists to isolate all 6 sunset SKUs in the scatter quadrants.',
              buttonText: 'Filter by Sunset Candidates',
              onExecute: () => {
                setSelectedAiClass('sunset');
                onClose();
                setTimeout(() => {
                  const element = document.getElementById('quadrant-matrix-section');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }
            }
          ]
        };

      case 'Revenue at Risk':
        return {
          title: 'Revenue Exposure & Substitution Planner',
          value: '$148 M Exposure',
          trendText: 'Estimated maximum tail risk',
          trendType: 'down',
          desc: 'Total sales revenue generated by sunset candidates. A phased pruning or pricing mitigation strategy is recommended to transfer volume to hero lines.',
          actions: [
            {
              title: '📈 Model Phased Pruning Scenarios',
              desc: 'Evaluate safety stock vs. revenue impact under different pruning phases (e.g., Bottom 10% vs. Full Sunset).',
              buttonText: 'Open Scenario Console',
              onExecute: () => {
                onClose();
                setTimeout(() => {
                  const element = document.getElementById('pareto-chart-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-acies-yellow/50');
                    setTimeout(() => element.classList.remove('ring-2', 'ring-acies-yellow/50'), 2000);
                  }
                }, 100);
              }
            },
            {
              title: '🔄 Simulate Price Elasticity & Pricing Adjustments',
              desc: 'Adjust unit pricing corridors on sunset candidates to recover margins before resorting to deletion.',
              buttonText: 'Run Price Simulation',
              onExecute: () => {
                setSimTab('price');
                // Auto-select first sunset candidate for pricing adjustments
                if (sunsetCandidates.length > 0) setSelectedSkuName(sunsetCandidates[0].name);
                onClose();
                setTimeout(() => {
                  const element = document.getElementById('simulation-desk-section');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }
            },
            {
              title: '🔍 Audit Substitution Pairs & Cannibalization',
              desc: 'Review negative cross-correlations to ensure active SKUs can safely absorb displaced demand.',
              buttonText: 'Audit Substitution Pairs',
              onExecute: () => {
                setActiveView('analyst');
                onClose();
                setTimeout(() => {
                  const element = document.getElementById('cannibalization-section');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }
            }
          ]
        };

      case 'Avg Complexity':
        return {
          title: 'Operational Complexity & Sourcing Command',
          value: '0.48 Average PCI',
          trendText: 'Corporate target: <0.40',
          trendType: 'down',
          desc: 'Catalog complexity is driven by supplier fragmentation and promotional markdown erosion. Actions must focus on sourcing consolidation.',
          actions: [
            {
              title: '📊 Review Complexity & PCI Drivers',
              desc: 'Inspect the 6 primary complexity sub-drivers to identify and isolate logistics bottlenecks.',
              buttonText: 'View Complexity Chart',
              onExecute: () => {
                onClose();
                setTimeout(() => {
                  const element = document.getElementById('complexity-matrix-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-acies-yellow/50');
                    setTimeout(() => element.classList.remove('ring-2', 'ring-acies-yellow/50'), 2000);
                  }
                }, 100);
              }
            },
            {
              title: '🛒 Inspect Markdown & Promotional Erosion',
              desc: 'Open the markdown dependency chart to audit high discount erosion items causing margin leaks.',
              buttonText: 'Inspect Promo Erosion',
              onExecute: () => {
                setActiveView('analyst');
                onClose();
                setTimeout(() => {
                  const element = document.getElementById('promo-erosion-section');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }
            },
            {
              title: '⚡ Launch Replacement SKU Scenario',
              desc: 'Simulate launching a consolidated product variant to replace multiple overlapping tail SKUs.',
              buttonText: 'Configure Launch Simulation',
              onExecute: () => {
                setSimTab('launch');
                onClose();
                setTimeout(() => {
                  const element = document.getElementById('simulation-desk-section');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }
            }
          ]
        };

      default:
        return null;
    }
  };

  const details = getKpiDetails();
  if (!details) return null;

  return (
    <ModalShell isOpen onClose={onClose} layer="nested" aria-label="KPI actions">
      {/* Action Dialog. Centring now comes from the shell, so the panel no
          longer positions itself with fixed/translate offsets. */}
      <div className="w-[90%] max-w-xl bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-body text-zinc-800 dark:text-white animate-scaleUp">
        
        {/* Header */}
        <div className="border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-white/5 py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-acies-yellow fill-acies-yellow animate-pulse" />
            <div>
              <p className="text-[8px] uppercase font-black tracking-widest text-zinc-400 dark:text-zinc-500">Executive Action Panel</p>
              <h3 className="text-sm font-display font-medium leading-tight text-acies-gray dark:text-white">{details.title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-white/60 cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info Strip */}
        <div className="bg-black/5 dark:bg-white/2 py-3.5 px-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-display font-extrabold text-acies-yellow">{details.value}</span>
            <span className={`text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-0.5 ${
              details.trendType === 'up' ? 'text-green-500' : 'text-amber-500'
            }`}>
              {details.trendType === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {details.trendText}
            </span>
          </div>
          <p className="text-[10px] opacity-70 max-w-[55%] text-right leading-snug">{details.desc}</p>
        </div>

        {/* Actions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[350px]">
          <h4 className="text-[9.5px] font-black uppercase tracking-widest opacity-50 mb-1">Select an Action Plan:</h4>
          
          {details.actions.map((act, index) => (
            <div 
              key={index}
              className="bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-acies-yellow/30 transition-all duration-200"
            >
              <div className="flex-1 space-y-1">
                <h5 className="text-[11px] font-bold text-acies-gray dark:text-white flex items-center gap-1.5">
                  {act.title}
                </h5>
                <p className="text-[9.5px] opacity-60 leading-relaxed max-w-sm">{act.desc}</p>
              </div>

              {act.isSubmenu ? (
                <div className="flex flex-col gap-1.5 shrink-0 min-w-[150px]">
                  <span className="text-[7.5px] font-bold uppercase tracking-widest opacity-40 text-center">Available Variants</span>
                  {act.submenuItems?.map((sub, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={sub.onClick}
                      className="w-full text-left bg-black/5 dark:bg-white/5 hover:bg-acies-yellow hover:text-acies-gray text-[9px] font-bold px-2 py-1.5 rounded transition-all border-none cursor-pointer flex items-center justify-between group"
                    >
                      <span className="truncate pr-1">{sub.label}</span>
                      <ArrowRight size={8} className="transition-transform group-hover:translate-x-0.5 opacity-55 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={act.onExecute}
                  className="bg-acies-yellow text-white dark:text-acies-gray font-extrabold text-[8.5px] uppercase tracking-wider px-3.5 py-2 rounded-lg hover:brightness-105 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer border-none outline-none flex items-center gap-1 shrink-0 self-start sm:self-auto"
                >
                  <Play size={8} className="fill-current" />
                  {act.buttonText}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-white/5 flex items-center justify-between text-[8px] opacity-40 uppercase font-bold tracking-widest text-zinc-500">
          <span>Acies Virtual Labs</span>
          <span className="flex items-center gap-1"><FileSearch size={10} /> Local Action Orchestrator</span>
        </div>
      </div>
    </ModalShell>
  );
};
