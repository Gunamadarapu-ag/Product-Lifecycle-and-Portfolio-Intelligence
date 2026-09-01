/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  Activity, Rocket, Layers, Scissors, AlertOctagon, Home, Cpu, Award, BarChart3, LayoutDashboard, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
import { Role } from './types/dashboard';

// Constants
import { KPIS, TABS, SKUS, PORTFOLIO_DATA } from './constants/data';
import { getAgentThoughtsForTab } from './constants/agentData';

// ── Eager shell ──────────────────────────────────────────────────────────────
// Chrome that is on screen for every tab, so there is nothing to gain by
// deferring it.
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { KPICard } from './components/dashboard/KPICard';
import { AuditDrawer } from './components/dashboard/AuditDrawer';
import { WelcomeGate } from './components/common/WelcomeGate';
import { SkuDetailsModal } from './components/dashboard/executive/SkuDetailsModal';
import { GlobalSearchBar } from './components/common/GlobalSearchBar';
import { AgentWidget } from './components/common/AgentWidget';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// ── Lazily loaded tab modules ────────────────────────────────────────────────
// Only one tab is ever mounted at a time, so each gets its own chunk. Before
// this, all twelve (plus every modal they pull in) shipped in the initial
// bundle — ~1.79 MB of JS before the first paint.
const ExecutiveOverview        = lazy(() => import('./components/dashboard/executive/ExecutiveOverview').then(m => ({ default: m.ExecutiveOverview })));
const PortfolioHealthMap       = lazy(() => import('./components/dashboard/portfolio-health/PortfolioHealthMap').then(m => ({ default: m.PortfolioHealthMap })));
const LaunchReadinessDashboard = lazy(() => import('./components/dashboard/launch-readiness/LaunchReadinessDashboard').then(m => ({ default: m.LaunchReadinessDashboard })));
const ProfitabilityTree        = lazy(() => import('./components/dashboard/profitability/ProfitabilityTree').then(m => ({ default: m.ProfitabilityTree })));
const SKURationalization       = lazy(() => import('./components/dashboard/sku-rationalization/SKURationalization').then(m => ({ default: m.SKURationalization })));
const SignalsBoard             = lazy(() => import('./components/dashboard/signals-board/SignalsBoard').then(m => ({ default: m.SignalsBoard })));
const TopDownDrilldown         = lazy(() => import('./components/dashboard/drilldown/TopDownDrilldown').then(m => ({ default: m.TopDownDrilldown })));
const AgentOrchestrator        = lazy(() => import('./components/dashboard/orchestrator/AgentOrchestrator').then(m => ({ default: m.AgentOrchestrator })));
const AssortmentOverview       = lazy(() => import('./components/dashboard/assortment/AssortmentOverview').then(m => ({ default: m.AssortmentOverview })));
const RationalisationTab       = lazy(() => import('./components/dashboard/sku-rationalization/RationalisationTab').then(m => ({ default: m.RationalisationTab })));
const DemoTab                  = lazy(() => import('./components/dashboard/sku-rationalization/DemoTab').then(m => ({ default: m.DemoTab })));
const TrackerTab               = lazy(() => import('./components/dashboard/sku-rationalization/TrackerTab').then(m => ({ default: m.TrackerTab })));
const SKUPerformanceTab        = lazy(() => import('./components/dashboard/executive/SKUPerformanceTab').then(m => ({ default: m.SKUPerformanceTab })));

// Task model is imported from its own module rather than from TrackerTab, so
// seeding task state does not drag the tracker into the initial chunk.
import { DEFAULT_TASKS, Task } from './components/dashboard/sku-rationalization/trackerTasks';

// Utils / Hooks
import { TimelineRange, getFilteredKPIS, getFilteredSKUS, getFilteredPortfolioData } from './utils/timeframe';
import { safeGetItem, safeSetItem, getHashParam } from './utils/hash';
import { useGlobalSearch } from './hooks/useGlobalSearch';
import { useAgentWidget } from './hooks/useAgentWidget';

/** Placeholder shown while a tab chunk is in flight. */
const TabLoading = () => (
  <div className="flex flex-col items-center justify-center min-h-[550px] glass-card">
    <div className="w-10 h-10 rounded-full border-2 border-acies-yellow/20 border-t-acies-yellow animate-spin mb-4" />
    <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">Loading module…</p>
  </div>
);

const getTabDisplayName = (id: number, name: string): string => {
  switch (id) {
    case 0: return 'Home';
    case 1: return 'Portfolio Health';
    case 2: return 'Launch Readiness';
    case 3: return 'Profitability';
    case 4: return 'SKU Rationalize';
    case 5: return 'Signals Board';
    case 6: return 'Top-Down Drill';
    case 7: return 'Agent Orchestrator';
    case 8: return 'SKU Assortment';
    case 9: return 'Rationalisation Home';
    case 10: return 'SKU Drill Down';
    case 11: return 'Task Tracker';
    default: return name;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<number>(() => {
    const tabParam = getHashParam('tab');
    if (tabParam !== null) {
      const parsed = parseInt(tabParam, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < TABS.length) return parsed;
    }
    const saved = safeGetItem('acies_active_tab');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < TABS.length) return parsed;
    }
    return 0;
  });

  const [role, setRole] = useState<Role>(() => {
    const roleParam = getHashParam('role');
    if (roleParam !== null) return roleParam as Role;
    
    const saved = safeGetItem('acies_role');
    return (saved as Role) || 'VP Product Management';
  });

  const [timelineRange, setTimelineRange] = useState<TimelineRange>(() => {
    const timeParam = getHashParam('timeline') as TimelineRange | null;
    if (timeParam !== null && ['1m', '3m', '6m', '12m', '24m', '36m'].includes(timeParam)) return timeParam;
    
    const saved = safeGetItem('acies_timeline_range') as TimelineRange | null;
    if (saved !== null && ['1m', '3m', '6m', '12m', '24m', '36m'].includes(saved)) return saved;
    
    return '12m';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSkuPerformancePage, setShowSkuPerformancePage] = useState<boolean>(() => {
    const viewParam = getHashParam('view');
    return viewParam === 'sku-performance';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const themeParam = getHashParam('theme');
    if (themeParam !== null) return themeParam === 'dark';
    
    const saved = safeGetItem('acies_dark_mode');
    return saved === 'true';
  });

  const [activeAuditMetric, setActiveAuditMetric] = useState<string | null>(null);
  const [trackerTasks, setTrackerTasks] = useState<Record<string, Task[]>>(DEFAULT_TASKS);
  const [skuDrilldownActionFilter, setSkuDrilldownActionFilter] = useState<string>('All');
  const [skuDrilldownSearchQuery, setSkuDrilldownSearchQuery] = useState<string>('');

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  // Redirect Product Manager from tab 4 to tab 9, and VP from 9/10/11 to 4
  useEffect(() => {
    if (activeTab === 4 && role === 'Product Manager') {
      setActiveTab(9);
    }
    if ((activeTab === 9 || activeTab === 10 || activeTab === 11) && role === 'VP Product Management') {
      setActiveTab(4);
    }
  }, [activeTab, role]);

  const timelineRangeRef = useRef(timelineRange);
  timelineRangeRef.current = timelineRange;

  // Timeframe filtered base datasets
  const filteredSKUS = getFilteredSKUS(SKUS, timelineRange);
  const filteredPortfolioData = getFilteredPortfolioData(PORTFOLIO_DATA, timelineRange);
  const filteredKPIS = getFilteredKPIS(KPIS, timelineRange);

  // Focus and Selection callbacks for Search
  const [selectedSkuForSearch, setSelectedSkuForSearch] = useState<any>(null);

  const {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    activeSearchIndex,
    setActiveSearchIndex,
    searchInputRef,
    searchContainerRef,
    filteredSearchItems,
    groupedSearchResults,
    handleSelectSearchItem,
    handleKeyDownInput,
  } = useGlobalSearch(
    filteredSKUS,
    filteredPortfolioData,
    (tabId) => setActiveTab(tabId),
    (metricLabel) => setActiveAuditMetric(metricLabel),
    (skuData) => setSelectedSkuForSearch(skuData)
  );

  const [launchTourActive, setLaunchTourActive] = useState(false);
  const [simulateDelay, setSimulateDelay] = useState(false);
  const [isProfitabilitySimulatorOpen, setIsProfitabilitySimulatorOpen] = useState<boolean>(false);
  const [showWelcomeGate, setShowWelcomeGate] = useState<boolean>(() => {
    const roleParam = getHashParam('role');
    if (roleParam !== null) return false;
    
    try {
      const sessionActive = sessionStorage.getItem('acies_session_active');
      return sessionActive === null;
    } catch (e) {
      return true;
    }
  });

  const viewParam = getHashParam('view');
  const thoughtsData = getAgentThoughtsForTab(activeTab, viewParam);

  const {
    isAgentWidgetExpanded,
    setIsAgentWidgetExpanded,
    isAgentWidgetVisible,
    setIsAgentWidgetVisible,
    agentMessageInput,
    setAgentMessageInput,
    isAgentTyping,
    currentChatHistory,
    handleSendMessage,
  } = useAgentWidget(
    activeTab,
    viewParam,
    thoughtsData,
    () => setActiveTab(7)
  );

  useEffect(() => {
    // Reset simulator if switching away from Tab 3 and it's not open in the URL
    if (activeTab !== 3) {
      const hash = window.location.hash || '#';
      const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
      if (params.get('simulator') !== 'true') {
        setIsProfitabilitySimulatorOpen(false);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#';
      const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
      
      const tabParam = params.get('tab');
      if (tabParam !== null) {
        const parsed = parseInt(tabParam, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < TABS.length && parsed !== activeTabRef.current) {
          setActiveTab(parsed);
        }
      }

      const timeParam = params.get('timeline') as TimelineRange | null;
      if (timeParam !== null && ['1m', '3m', '6m', '12m', '24m', '36m'].includes(timeParam) && timeParam !== timelineRangeRef.current) {
        setTimelineRange(timeParam);
      }

      const metricParam = params.get('metric');
      if (metricParam !== null) {
        setActiveAuditMetric(metricParam);
      }

      const simParam = params.get('simulator');
      if (simParam === 'true') {
        setIsProfitabilitySimulatorOpen(true);
      } else if (simParam === 'false') {
        setIsProfitabilitySimulatorOpen(false);
      }

      const viewParam = params.get('view');
      setShowSkuPerformancePage(viewParam === 'sku-performance');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Consolidated source of truth to sync React states to localStorage & URL hash
  useEffect(() => {
    safeSetItem('acies_active_tab', activeTab.toString());
    safeSetItem('acies_role', role);
    safeSetItem('acies_timeline_range', timelineRange);
    safeSetItem('acies_dark_mode', isDarkMode.toString());

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    try {
      const params = new URLSearchParams();
      params.set('tab', activeTab.toString());
      params.set('role', role);
      params.set('timeline', timelineRange);
      params.set('theme', isDarkMode ? 'dark' : 'light');
      if (isProfitabilitySimulatorOpen) {
        params.set('simulator', 'true');
      }
      if (showSkuPerformancePage) {
        params.set('view', 'sku-performance');
      }
      
      const newHash = '#' + params.toString();
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    } catch (e) {
      console.warn("Could not sync state to URL hash:", e);
    }
  }, [activeTab, role, timelineRange, isDarkMode, isProfitabilitySimulatorOpen, showSkuPerformancePage]);

  const tabs = TABS.map(tab => {
     let icon = Activity;
     if (tab.id === 0) icon = Home;
     if (tab.id === 1) icon = Layers;
     if (tab.id === 2) icon = Rocket;
     if (tab.id === 3) icon = BarChart3;
     if (tab.id === 4) icon = Scissors;
     if (tab.id === 5) icon = AlertOctagon;
     if (tab.id === 6) icon = LayoutDashboard;
     if (tab.id === 7) icon = Cpu;
     if (tab.id === 8) icon = Award;
     if (tab.id === 9) icon = Scissors;
     return { ...tab, icon };
  });

  const [isExploreOpen, setIsExploreOpen] = useState<boolean>(false);

  const handleSwitchPersona = () => {
    try {
      sessionStorage.removeItem('acies_session_active');
    } catch (e) {}
    try {
      const hash = window.location.hash || '#';
      const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
      params.delete('role');
      window.history.replaceState(null, '', '#' + params.toString());
    } catch (e) {
      console.warn("Could not remove role parameter from URL hash:", e);
    }
    setShowWelcomeGate(true);
  };

  if (showWelcomeGate) {
    return (
      <WelcomeGate 
        onSelectRole={(selectedRole) => {
          setRole(selectedRole);
          try {
            sessionStorage.setItem('acies_session_active', 'true');
          } catch (e) {}
          setShowWelcomeGate(false);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen font-body bg-acies-offwhite dark:bg-acies-gray transition-colors pb-20">
      <Header 
        currentRole={role} 
        setRole={setRole} 
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        timelineRange={timelineRange}
        setTimelineRange={setTimelineRange}
        activeTab={activeTab}
        onStartTour={() => {
          if (activeTab === 2) {
            setLaunchTourActive(true);
          }
        }}
        onClickHome={() => setActiveTab(0)}
        onSwitchPersona={handleSwitchPersona}
        searchBar={
          <GlobalSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
            activeSearchIndex={activeSearchIndex}
            setActiveSearchIndex={setActiveSearchIndex}
            searchInputRef={searchInputRef}
            searchContainerRef={searchContainerRef}
            filteredSearchItems={filteredSearchItems}
            groupedSearchResults={groupedSearchResults}
            handleSelectSearchItem={handleSelectSearchItem}
            handleKeyDownInput={handleKeyDownInput}
          />
        }
      />

      <div className="w-full max-w-full pr-6 pl-0 py-6 font-body">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar Tabs Navigation */}
          {!showSkuPerformancePage && (() => {
            const hasSubdivisions = activeTab === 9 || activeTab === 10 || activeTab === 11;
            return (
              <aside className={`w-full shrink-0 lg:sticky lg:top-16 self-start transition-all duration-300 ${
                hasSubdivisions ? 'lg:w-44' : 'lg:w-22'
              }`}>
                <div className={`flex flex-row lg:flex-col gap-3 p-2 lg:py-3 bg-white dark:bg-white/5 border border-acies-yellow/15 dark:border-white/10 rounded-2xl items-center justify-start overflow-x-auto lg:overflow-y-auto lg:max-h-[calc(100vh-120px)] scroll-smooth no-scrollbar shadow-sm shadow-acies-yellow/5 transition-all duration-300 ${
                  hasSubdivisions ? 'lg:px-2' : 'lg:px-0.5'
                }`}>
                  {tabs.filter(tab => tab.id < 9).map((tab) => {
                    const isActive = activeTab === tab.id || (tab.id === 4 && (activeTab === 9 || activeTab === 10 || activeTab === 11));
                    const displayName = getTabDisplayName(tab.id, tab.name);
                    return (
                      <React.Fragment key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none transition-all duration-200 shrink-0 w-16"
                        >
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isActive
                                ? 'bg-acies-yellow text-white dark:text-acies-gray shadow-md shadow-acies-yellow/20'
                                : 'bg-acies-yellow/5 dark:bg-white/5 text-acies-gray/60 dark:text-white/50 group-hover:bg-acies-yellow/10 group-hover:dark:bg-white/10 group-hover:text-acies-gray dark:group-hover:text-white'
                            }`}
                          >
                            <tab.icon
                              size={20}
                              strokeWidth={isActive ? 2 : 1.5}
                              className="transition-transform duration-200 group-hover:scale-105"
                            />
                          </div>
                          <span
                            className={`mt-1.5 text-[9px] font-semibold text-center leading-tight tracking-wide break-words w-full px-1 transition-colors duration-200 ${
                              isActive 
                                ? 'text-acies-yellow font-bold' 
                                : 'text-acies-gray/50 dark:text-white/40 group-hover:text-acies-gray/80 dark:group-hover:text-white/70'
                            }`}
                          >
                            {displayName}
                          </span>
                        </button>

                        {/* Submenu for SKU Rationalisation */}
                        {tab.id === 4 && (activeTab === 9 || activeTab === 10 || activeTab === 11) && (
                          <div className="flex flex-col gap-1 my-2 p-1.5 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5 animate-fadeIn w-full text-left">
                            {[
                              { id: 9, label: 'Rationalisation Home' },
                              { id: 10, label: 'SKU Drill Down' },
                              { id: 11, label: 'Task Tracker' }
                            ].map((sub) => {
                              const isSubActive = activeTab === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => setActiveTab(sub.id)}
                                  className={`w-full flex items-center gap-1.5 py-1 px-1.5 rounded transition-all border-none cursor-pointer text-left ${
                                    isSubActive
                                      ? 'bg-[#1e3a8a]/20 dark:bg-[#1e3a8a]/40 text-[#2563eb] dark:text-[#38bdf8] font-bold'
                                      : 'bg-transparent text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                  }`}
                                >
                                  <span className="text-[10px]">•</span>
                                  <span className="text-[10px] tracking-wide whitespace-nowrap">{sub.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </aside>
            );
          })()}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {showSkuPerformancePage ? (
              <ErrorBoundary moduleName="SKU Performance" resetKey="sku-performance">
                <Suspense fallback={<TabLoading />}>
                  <SKUPerformanceTab
                    isDarkMode={isDarkMode}
                    onSelectSku={(sku) => setSelectedSkuForSearch(sku)}
                    onBack={() => setShowSkuPerformancePage(false)}
                  />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <>
                {activeTab !== 0 && activeTab !== 9 && activeTab !== 10 && activeTab !== 11 && !(activeTab === 3 && isProfitabilitySimulatorOpen) && !(activeTab === 4 && role === 'VP Product Management') && !(activeTab === 5 && isExploreOpen) && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-display leading-tight text-acies-gray dark:text-white">{tabs[activeTab]?.name || 'Unknown Module'}</h2>
                    </div>
                  </div>
                )}

                {activeTab !== 0 && (() => {
                  const tabKpis = (() => {
                    if (activeTab === 1) {
                      if (role === 'VP Product Management' || role === 'Product Manager' || role === 'Pricing and Margin Partner') return [];
                      return filteredKPIS.filter(kpi => 
                        ['Net Sales (Portfolio)', 'Avg Gross Margin', 'Revenue Concentration', 'Long-Tail SKU Burden'].includes(kpi.label)
                      );
                    }
                    if (activeTab === 2 && (role === 'VP Product Management' || role === 'Product Manager')) {
                      return [
                        {
                          label: 'Overall Readiness %',
                          value: simulateDelay ? '79%' : '82%',
                          trend: 'up',
                          trendValue: 'Across 25 Launches',
                          info: 'Average launch readiness index across all active product concepts and packaging timelines.',
                          highlight: ['VP Product Management']
                        },
                        {
                          label: 'Revenue Tail Risk',
                          value: simulateDelay ? '32.40%' : '27.08%',
                          trend: 'up',
                          trendValue: simulateDelay ? '+5.32% risk' : 'Full Rat. scenario',
                          info: 'Maximum revenue at risk if all 35 "Rationalize" segment SKUs are removed simultaneously.',
                          isRisk: true,
                          highlight: ['Pricing and Margin Partner']
                        },
                        {
                          label: 'Peak Stockout Freq.',
                          value: simulateDelay ? '582 events' : '440 events',
                          trend: 'up',
                          trendValue: simulateDelay ? '+142 events' : 'BrandC Biscuits',
                          info: 'Highest stockout frequency in portfolio: BrandC Biscuits (440) and BrandF Soap (440). Supply chain fragility signal.',
                          isRisk: true,
                          highlight: ['Product Manager']
                        },
                        {
                          label: 'Rationalize Candidates',
                          value: simulateDelay ? '38 SKUs' : '35 SKUs',
                          trend: 'up',
                          trendValue: simulateDelay ? '+3 flags' : '−27.08% tail risk',
                          info: 'Low Value / High Complexity. Full removal cuts safety stock by 42.2% but introduces 27.08% revenue tail risk.',
                          isRisk: true,
                          highlight: ['Product Manager']
                        }
                      ];
                    }
                    if (activeTab === 3 && role === 'VP Product Management') {
                      return [
                        {
                          label: 'Net Profit',
                          value: '$95.2 M',
                          trend: 'up',
                          trendValue: 'MTD Blended',
                          info: 'Net profit contribution from active products after raw material costs, freight overheads, and promotional dilution.',
                          highlight: ['Pricing and Margin Partner']
                        },
                        {
                          label: 'Gross Profit',
                          value: '$308.1 M',
                          trend: 'up',
                          trendValue: '36.2% Gross Margin',
                          info: 'Total gross profit margin across categories before supply chain and promotional expenses.',
                          highlight: ['Pricing and Margin Partner']
                        },
                        {
                          label: 'Value Diluting SKUs',
                          value: '12 SKUs',
                          trend: 'up',
                          trendValue: 'BrandC Energy Drink',
                          info: 'Products underperforming portfolio margins (e.g. BrandC Energy Drink at 44% vs 45% target). High-leverage adjustment points.',
                          highlight: ['Product Manager']
                        },
                        {
                          label: 'Total SG&A Overhead',
                          value: '$117.7 M',
                          trend: 'neutral',
                          trendValue: 'Fixed & Variable Mix',
                          info: 'Selling, General and Administrative expenses including regional shipping, warehousing overheads, and currency hedging margins.',
                          highlight: ['Pricing and Margin Partner']
                        }
                      ];
                    }
                    if (activeTab === 4) {
                      if (role === 'VP Product Management') return [];
                      return filteredKPIS.filter(kpi => 
                        ['Active SKUs', 'Rationalize Candidates', 'Long-Tail SKU Burden', 'Revenue Tail Risk'].includes(kpi.label)
                      );
                    }
                    if (activeTab === 5) {
                      if (role === 'VP Product Management') return [];
                      return filteredKPIS.filter(kpi => 
                        ['Total Active Signals', 'Competitor Alerts', 'Market Demand Change', 'Customer Sentiment Score'].includes(kpi.label)
                      );
                    }
                    if (activeTab === 6) {
                      if (role === 'VP Product Management') return [];
                      return filteredKPIS.filter(kpi => 
                        ['Total Revenue', 'Gross Margin', 'Active SKUs', 'Critical Alerts'].includes(kpi.label)
                      );
                    }
                    if (activeTab === 7) {
                      if (role === 'VP Product Management') return [];
                      return filteredKPIS.filter(kpi => 
                        ['Total Active Signals', 'Competitor Alerts', 'Market Demand Change', 'Customer Sentiment Score'].includes(kpi.label)
                      );
                    }
                    if (activeTab === 8) {
                      if (role === 'VP Product Management') return [];
                      return filteredKPIS.filter(kpi => 
                        ['Long-Tail SKU Burden', 'Avg Complexity', 'Peak Stockout Freq.', 'Revenue Tail Risk'].includes(kpi.label)
                      );
                    }
                    return [];
                  })();

                  if (tabKpis.length === 0) return null;

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {tabKpis.map((kpi, idx) => (
                        <motion.div 
                          key={kpi.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <KPICard 
                            kpi={kpi} 
                            role={role} 
                            onAuditClick={() => setActiveAuditMetric(kpi.label)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* One boundary per tab: a module that throws shows its own
                        fallback instead of blanking the dashboard, and switching
                        tabs clears the error via resetKey. */}
                    <ErrorBoundary
                      moduleName={getTabDisplayName(activeTab, tabs[activeTab]?.name ?? 'This module')}
                      resetKey={activeTab}
                    >
                    <Suspense fallback={<TabLoading />}>
                    {activeTab === 0 && (
                      <ExecutiveOverview 
                        role={role} 
                        setActiveTab={setActiveTab} 
                        isDarkMode={isDarkMode} 
                        onAuditClick={setActiveAuditMetric} 
                        timelineRange={timelineRange}
                        onViewAllSkus={() => setShowSkuPerformancePage(true)}
                      />
                    )}
                    {activeTab === 1 && <PortfolioHealthMap role={role} isDarkMode={isDarkMode} onAuditClick={setActiveAuditMetric} timelineRange={timelineRange} />}
                    {activeTab === 2 && (
                      <LaunchReadinessDashboard 
                        role={role} 
                        onAuditClick={setActiveAuditMetric} 
                        tourActive={launchTourActive}
                        onTourClose={() => setLaunchTourActive(false)}
                        isDarkMode={isDarkMode}
                        simulateDelay={simulateDelay}
                        setSimulateDelay={setSimulateDelay}
                      />
                    )}
                    {activeTab === 3 && (
                      <ProfitabilityTree 
                        role={role} 
                        onAuditClick={setActiveAuditMetric} 
                        isDarkMode={isDarkMode} 
                        isSimulatorOpen={isProfitabilitySimulatorOpen}
                        setIsSimulatorOpen={setIsProfitabilitySimulatorOpen}
                        timelineRange={timelineRange}
                      />
                    )}
                    {activeTab === 4 && <SKURationalization role={role} isDarkMode={isDarkMode} setActiveTab={setActiveTab} timelineRange={timelineRange} />}
                    {activeTab === 5 && <SignalsBoard role={role} setActiveTab={setActiveTab} isDarkMode={isDarkMode} onExploreToggle={setIsExploreOpen} />}
                    {activeTab === 6 && <TopDownDrilldown isDarkMode={isDarkMode} role={role} timelineRange={timelineRange} setTimelineRange={setTimelineRange} />}
                    {activeTab === 7 && <AgentOrchestrator isDarkMode={isDarkMode} role={role} />}
                    {activeTab === 8 && <AssortmentOverview role={role} isDarkMode={isDarkMode} onAuditClick={setActiveAuditMetric} timelineRange={timelineRange} />}
                    {activeTab === 9 && (
                      <RationalisationTab 
                        setActiveTab={setActiveTab} 
                        setSelectedRoadmapPhaseFilter={setSkuDrilldownActionFilter} 
                        setSkuDrilldownSearchQuery={setSkuDrilldownSearchQuery}
                        tasks={trackerTasks}
                        setTasks={setTrackerTasks}
                      />
                    )}
                    {activeTab === 10 && (
                      <DemoTab 
                        role={role} 
                        tasks={trackerTasks} 
                        setTasks={setTrackerTasks} 
                        setActiveTab={setActiveTab} 
                        actionFilter={skuDrilldownActionFilter}
                        setActionFilter={setSkuDrilldownActionFilter}
                        searchQuery={skuDrilldownSearchQuery}
                        setSearchQuery={setSkuDrilldownSearchQuery}
                      />
                    )}
                    {activeTab === 11 && (
                      <TrackerTab 
                        tasks={trackerTasks} 
                        setTasks={setTrackerTasks} 
                      />
                    )}
                    {(activeTab < 0 || activeTab > 11) ? (
                      <div className="flex flex-col items-center justify-center min-h-[550px] glass-card">
                        <div className="w-16 h-16 rounded-full bg-acies-yellow/10 flex items-center justify-center mb-6">
                          <Zap size={32} className="text-acies-yellow" />
                        </div>
                        <h3 className="font-display text-2xl mb-1">{tabs[activeTab]?.name || 'Unknown Module'}</h3>
                        <p className="text-xs uppercase tracking-[0.2em] opacity-40 mb-8 underline underline-offset-8 decoration-acies-yellow decoration-2">Development Phase: Core Logic Integration</p>
                        <div className="max-w-md text-center opacity-60 text-sm leading-relaxed">
                          This module is being architected to integrate real-time competitor signals, SKU-level elasticity models, and automated rationalization simulations.
                        </div>
                      </div>
                    ) : null}
                    </Suspense>
                    </ErrorBoundary>
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </main>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} />
      <AuditDrawer activeMetric={activeAuditMetric} close={() => setActiveAuditMetric(null)} isDarkMode={isDarkMode} />
      <SkuDetailsModal 
        isOpen={!!selectedSkuForSearch} 
        sku={selectedSkuForSearch} 
        onClose={() => setSelectedSkuForSearch(null)}
        onRequestAction={(recipientEmail, recipientName, subject, body) => {
          alert(`Mitigation request email successfully sent to ${recipientName} (${recipientEmail})!`);
          setSelectedSkuForSearch(null);
        }}
      />

      <footer className="mt-10 border-t border-black/5 dark:border-white/5 py-6 px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-8">
            <button className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-40 hover:opacity-100 hover:text-acies-yellow transition-all flex items-center gap-2 group">
              Diagnostic Workshop
            </button>
            <button className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-40 hover:opacity-100 hover:text-acies-yellow transition-all flex items-center gap-2 group">
              Use Cases
            </button>
            <button className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-40 hover:opacity-100 hover:text-acies-yellow transition-all flex items-center gap-2 group">
              Lab Explorer
            </button>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <p className="text-[9px] opacity-30 font-medium uppercase tracking-widest mb-0.5">Acies Virtual Labs • April 2026</p>
            <p className="text-[8px] opacity-20 uppercase font-bold">Confidential Commercial Asset</p>
          </div>
        </div>
      </footer>

      {/* Floating Agent Assistant Widget */}
      {((activeTab >= 1 && activeTab <= 6) || activeTab === 8) && thoughtsData && (
        <AgentWidget
          thoughtsData={thoughtsData}
          isAgentWidgetExpanded={isAgentWidgetExpanded}
          setIsAgentWidgetExpanded={setIsAgentWidgetExpanded}
          isAgentWidgetVisible={isAgentWidgetVisible}
          setIsAgentWidgetVisible={setIsAgentWidgetVisible}
          agentMessageInput={agentMessageInput}
          setAgentMessageInput={setAgentMessageInput}
          isAgentTyping={isAgentTyping}
          currentChatHistory={currentChatHistory}
          handleSendMessage={handleSendMessage}
          onNavigateToOrchestrator={() => setActiveTab(7)}
        />
      )}
    </div>
  );
}
