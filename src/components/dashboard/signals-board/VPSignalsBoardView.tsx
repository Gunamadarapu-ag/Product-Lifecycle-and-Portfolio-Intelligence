/**
 * VP lens for the Signals Board.
 *
 * Extracted from the original 3,982-line SignalsBoard.tsx.
 */
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, Play, Inbox, Filter, RefreshCw, Download, Zap, TrendingUp, Globe, ArrowUpRight, ArrowLeft, Users, Sparkles } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line, Bar } from 'recharts';
import { EmailComposerModal } from '../portfolio-health/EmailComposerModal';
import { SuccessFeedbackModal } from '../portfolio-health/SuccessFeedbackModal';
import { ResolveSignalModal } from './ResolveSignalModal';
import { AIPredictionModal } from './AIPredictionModal';
import { ExploreSignalDetailModal, ExploreSignal } from './ExploreSignalDetailModal';
import { CompetitiveIntelligenceModal } from './CompetitiveIntelligenceModal';
import { PortfolioDeepDiveModal } from './PortfolioDeepDiveModal';
import { RegionalAlertsModal } from './RegionalAlertsModal';
import { RECIPIENT_TITLES, Signal, VPSignal, VP_SIGNALS_DATA } from './signalsData';

export const VPSignalsBoardView: React.FC<{ 
  isDarkMode: boolean; 
  setActiveTab: (tab: number) => void;
  onExploreToggle?: (isOpen: boolean) => void;
}> = ({ isDarkMode, setActiveTab, onExploreToggle }) => {
  const [signals, setSignals] = useState<VPSignal[]>(VP_SIGNALS_DATA);
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [toasts, setToasts] = useState<{ id: string; title: string; body: string; color: string }[]>([]);

  const [activeResolveSignal, setActiveResolveSignal] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerEmail, setComposerEmail] = useState({ to: '', name: '', subject: '', body: '', action: '' });
  const [successFeedback, setSuccessFeedback] = useState<{
    isOpen: boolean;
    recipientName: string;
    recipientTitle: string;
    recipientEmail: string;
    contextType: 'signal';
    contextTitle: string;
    channel: 'email' | 'message';
  } | null>(null);
  const [trendsTimeframe, setTrendsTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [npsTimeframe, setNpsTimeframe] = useState<'weekly' | 'monthly'>('monthly');
  const [aiPredictionOpen, setAiPredictionOpen] = useState(false);
  const [activePredictionType, setActivePredictionType] = useState<'stockout' | 'elasticity' | 'margin' | 'demand' | null>(null);
  const [selectedAlertRegion, setSelectedAlertRegion] = useState<string | null>(null);
  const [selectedCompIntelIdx, setSelectedCompIntelIdx] = useState<number | null>(null);
  const [selectedPortfolioBlock, setSelectedPortfolioBlock] = useState<'overlap' | 'innovation' | 'risk' | null>(null);
  const [marketSignalsView, setMarketSignalsView] = useState<'grid' | 'table'>('grid');
  const [exploreFilter, setExploreFilter] = useState<'All' | 'Risk' | 'Growth' | 'Competition' | 'Supply'>('All');
  const [showExplorePage, setShowExplorePage] = useState(false);
  const [explorePageView, setExplorePageView] = useState<'grid' | 'table'>('grid');
  const [selectedExploreSignal, setSelectedExploreSignal] = useState<ExploreSignal | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastRefreshed(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (onExploreToggle) {
      onExploreToggle(showExplorePage);
    }
  }, [showExplorePage, onExploreToggle]);

  const addToast = (title: string, body: string, color: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, body, color }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleResolveSignal = (id: string, title: string, resolutionMsg: string) => {
    setSignals(prev => prev.filter(s => s.id !== id));
    addToast('Signal Resolved', `${title}: ${resolutionMsg}`, '#10b981');
  };

  const handleToggleAck = (id: string) => {
    setSignals(prev => prev.map(s => {
      if (s.id === id) {
        const nextAck = !s.ack;
        addToast(
          nextAck ? 'Signal Acknowledged' : 'Signal Re-opened', 
          `Signal ref: ${s.refCode}`, 
          nextAck ? '#3b82f6' : '#f59e0b'
        );
        return { ...s, ack: nextAck };
      }
      return s;
    }));
  };

  // Filtered lists
  const filteredSignals = signals.filter(s => {
    const matchRegion = filterRegion === 'All' || s.region === filterRegion;
    const matchCategory = filterCategory === 'All' || s.category === filterCategory;
    const matchType = filterType === 'All' || s.type === filterType;
    const matchSeverity = filterSeverity === 'All' || s.severity === filterSeverity;
    return matchRegion && matchCategory && matchType && matchSeverity;
  });

  // KPI Calculations
  const activeCriticalCount = filteredSignals.filter(s => s.severity === 'critical' && !s.ack).length;
  const competitorAlertsCount = filteredSignals.filter(s => s.type === 'Competitor' && !s.ack).length;
  const activeOpportunityCount = filteredSignals.filter(s => s.type === 'Opportunity' && !s.ack).length;
  
  // Simulated overall risk exposure ($ Millions)
  const riskExposureVal = filteredSignals.reduce((sum, s) => {
    if (s.type === 'Risk' || s.type === 'Supply') {
      return sum + (s.severity === 'critical' ? 2.1 : 1.0);
    }
    return sum;
  }, 0);
  const finalRiskExposure = riskExposureVal > 0 ? riskExposureVal : 6.4;

  // Regions under alert
  const alertRegions = Array.from(new Set(filteredSignals.filter(s => s.severity === 'critical' || s.severity === 'warning').map(s => s.region)));

  // Resolution Rate
  const resolvedCount = VP_SIGNALS_DATA.length - signals.length;
  const resolutionRate = VP_SIGNALS_DATA.length > 0 
    ? Math.round((resolvedCount / VP_SIGNALS_DATA.length) * 15 + 85) // simulated baseline 85% + resolved factor
    : 91;

  // Recharts Trends Line Data
  const categoryTrendsWeeklyData = [
    { name: 'W1', Beverages: 62, Snacks: 55, PersonalCare: 45, Household: 35 },
    { name: 'W2', Beverages: 68, Snacks: 53, PersonalCare: 48, Household: 34 },
    { name: 'W3', Beverages: 72, Snacks: 58, PersonalCare: 46, Household: 38 },
    { name: 'W4', Beverages: 78, Snacks: 54, PersonalCare: 44, Household: 42 },
  ];

  const categoryTrendsMonthlyData = [
    { name: 'Jan', Beverages: 58, Snacks: 50, PersonalCare: 40, Household: 30 },
    { name: 'Feb', Beverages: 64, Snacks: 52, PersonalCare: 42, Household: 32 },
    { name: 'Mar', Beverages: 70, Snacks: 56, PersonalCare: 45, Household: 36 },
    { name: 'Apr', Beverages: 76, Snacks: 54, PersonalCare: 43, Household: 40 },
    { name: 'May', Beverages: 80, Snacks: 58, PersonalCare: 47, Household: 42 },
    { name: 'Jun', Beverages: 83, Snacks: 60, PersonalCare: 49, Household: 44 }
  ];

  const categoryTrendsData = trendsTimeframe === 'weekly' ? categoryTrendsWeeklyData : categoryTrendsMonthlyData;

  // NPS Trends Data
  const npsTrendsData = [
    { name: 'Jan', Beverages: 72, Snacks: 68, PersonalCare: 70, Household: 65 },
    { name: 'Feb', Beverages: 73, Snacks: 70, PersonalCare: 71, Household: 66 },
    { name: 'Mar', Beverages: 75, Snacks: 72, PersonalCare: 70, Household: 68 },
    { name: 'Apr', Beverages: 76, Snacks: 71, PersonalCare: 68, Household: 72 },
    { name: 'May', Beverages: 78, Snacks: 73, PersonalCare: 69, Household: 74 },
    { name: 'Jun', Beverages: 79, Snacks: 74, PersonalCare: 71, Household: 75 }
  ];

  const npsTrendsWeeklyData = [
    { name: 'W1', Beverages: 76, Snacks: 71, PersonalCare: 69, Household: 72 },
    { name: 'W2', Beverages: 77, Snacks: 72, PersonalCare: 70, Household: 73 },
    { name: 'W3', Beverages: 78, Snacks: 73, PersonalCare: 69, Household: 74 },
    { name: 'W4', Beverages: 79, Snacks: 74, PersonalCare: 71, Household: 75 }
  ];

  const activeNpsData = npsTimeframe === 'weekly' ? npsTrendsWeeklyData : npsTrendsData;

  // Market signals explore data
  const exploreSignals = [
    { id: 1, type: 'Risk', title: 'Price sensitivity rising', desc: 'Consumer trade-down accelerating in Q2', urgency: 85, urgencyLabel: 'High', action: 'Trigger a cross-category bundle campaign (Snacks + Beverages) to protect volume.' },
    { id: 2, type: 'Growth', title: 'Health segment up', desc: '+19% YoY, outpacing core', urgency: 60, urgencyLabel: 'Medium', action: 'Formulate health-aligned brand line extension (BrandA Sugar-Free) in 90 days.' },
    { id: 3, type: 'Competition', title: 'New entrants: 4', desc: '2 direct, 2 adjacent SKUs launched', urgency: 75, urgencyLabel: 'High', action: 'Deploy localized supermarket end-cap display campaign to raise retail distribution to 85%.' },
    { id: 4, type: 'Supply', title: 'Supply constraints', desc: 'Raw material lead times +3 wks', urgency: 95, urgencyLabel: 'Critical', action: 'Onboard domestic secondary ingredient supplier in Gujarat to shorten lead time.' },
    { id: 5, type: 'Growth', title: 'Export opportunity', desc: 'APAC demand signal strong', urgency: 35, urgencyLabel: 'Low', action: 'Allocate 15% extra manufacturing capacity to Eco-Pack mineral water for APAC.' },
    { id: 6, type: 'Growth', title: 'Online channel growth', desc: 'D2C grocery sales +24%', urgency: 70, urgencyLabel: 'Medium', action: 'Optimize e-commerce product listings and bundle offers for online retailers.' }
  ];

  const filteredExplore = exploreSignals.filter(s => exploreFilter === 'All' || s.type === s.type && s.type === exploreFilter);

  // Heatmap metrics
  const regionList = ['APAC', 'EMEA', 'Americas', 'India'];
  const getAlertLoad = (reg: string) => {
    return filteredSignals.filter(s => s.region === reg && !s.ack).length;
  };

  const handleExport = () => {
    addToast('Summary Exported', 'Strategic signal audit log has been compiled and downloaded.', '#3b82f6');
  };

  return (
    <div className="space-y-6">
      {showExplorePage ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Header with back button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2 rounded-sm shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExplorePage(false)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white cursor-pointer border-none bg-transparent flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={14} />
              </button>
              <div>
                <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa]">Market Recommendations</span>
                <h2 className="text-sm font-display font-bold text-zinc-800 dark:text-zinc-100 leading-tight mt-0.5">VP-Ready Signals Board</h2>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-mono text-zinc-400">Last updated: {lastRefreshed}</span>
            </div>
          </div>

          {/* Explore view body */}
          <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 rounded-sm shadow-sm space-y-6">
            {/* Heading Block */}
            <div className="space-y-1 pb-3 border-b border-black/5 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Interactive Signal Filter</span>
              <p className="text-[9.5px] text-zinc-600 dark:text-zinc-400 mt-0.5">Filter the urgency signals to isolate key decision areas.</p>
            </div>

            {/* Filters & View Toggles Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
              {/* Filter bar */}
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'Risk', 'Growth', 'Competition', 'Supply'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setExploreFilter(f)}
                    className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
                      exploreFilter === f
                        ? 'bg-[#6d28d9] dark:bg-[#a78bfa] text-white shadow-sm'
                        : 'bg-black/5 dark:bg-white/5 text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Grid & Table toggle buttons (in right corner) */}
              <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setExplorePageView('grid')}
                  className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                    explorePageView === 'grid'
                      ? 'bg-[#5850ec] text-white shadow-sm'
                      : `bg-transparent text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setExplorePageView('table')}
                  className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                    explorePageView === 'table'
                      ? 'bg-[#5850ec] text-white shadow-sm'
                      : `bg-transparent text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {/* Signals list */}
            {explorePageView === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExplore.map(s => {
                  const colorHex = s.type === 'Risk' || s.type === 'Supply'
                    ? (s.urgency > 80 ? '#ef4444' : '#f59e0b')
                    : (s.type === 'Growth' ? '#10b981' : '#3b82f6');
                  
                  const typeBadgeColor = s.type === 'Risk'
                    ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25'
                    : s.type === 'Supply'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25'
                    : s.type === 'Growth'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                    : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25';

                  return (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedExploreSignal(s)}
                      className="p-4 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded hover:scale-[1.01] hover:shadow-md hover:border-[#6d28d9]/35 transition-all space-y-3 flex flex-col justify-between cursor-pointer"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0 space-y-1">
                            <h4 className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
                              {s.title}
                              <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${typeBadgeColor}`}>
                                {s.type}
                              </span>
                            </h4>
                            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
                          </div>

                          {/* Urgency priority bar */}
                          <div className="flex flex-col gap-1 w-20 shrink-0">
                            <div className="flex justify-between text-[8px] font-extrabold uppercase">
                              <span className="text-zinc-400">Urgency</span>
                              <span style={{ color: colorHex }}>{s.urgency}%</span>
                            </div>
                            <div className="w-full h-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${s.urgency}%`, backgroundColor: colorHex }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inline Recommended Action */}
                      <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.04] bg-[#6d28d9]/[0.02] dark:bg-[#a78bfa]/[0.01] p-2 rounded-sm">
                        <p className="text-[10px] text-zinc-800 dark:text-zinc-200 leading-relaxed">
                          <strong className="text-[8.5px] uppercase tracking-wider text-[#6d28d9] dark:text-[#a78bfa] mr-2 font-extrabold">Recommended Action:</strong>
                          {s.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Table view of explore signals
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      <th className="py-2 pb-1.5 font-bold w-1/4">Signal</th>
                      <th className="py-2 pb-1.5 font-bold w-1/4">Urgency</th>
                      <th className="py-2 pb-1.5 font-bold w-2/4">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03] text-[10.5px]">
                    {filteredExplore.map(s => {
                      const colorHex = s.type === 'Risk' || s.type === 'Supply'
                        ? (s.urgency > 80 ? '#ef4444' : '#f59e0b')
                        : (s.type === 'Growth' ? '#10b981' : '#3b82f6');
                      
                      const typeBadgeColor = s.type === 'Risk'
                        ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25'
                        : s.type === 'Supply'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25'
                        : s.type === 'Growth'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                        : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25';

                      return (
                        <tr 
                          key={s.id} 
                          onClick={() => setSelectedExploreSignal(s)}
                          className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                        >
                          <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200 pr-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{s.title}</span>
                              <span className={`text-[7.5px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${typeBadgeColor}`}>
                                {s.type}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-zinc-400 font-medium mt-0.5">{s.desc}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-col gap-1 w-24">
                              <div className="flex justify-between text-[7.5px] font-extrabold uppercase">
                                <span className="text-zinc-400">Urgency</span>
                                <span style={{ color: colorHex }}>{s.urgency}%</span>
                              </div>
                              <div className="w-full h-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${s.urgency}%`, backgroundColor: colorHex }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-zinc-800 dark:text-zinc-200">
                            <div className="bg-[#6d28d9]/[0.02] dark:bg-[#a78bfa]/[0.01] border border-black/[0.02] dark:border-white/[0.02] p-2 rounded-sm max-w-lg">
                              {s.action}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              <button
                onClick={() => addToast('Scenario Simulation Started', 'Opening AI sandbox to model price & supply scenarios...', '#10b981')}
                className="px-5 py-2.5 bg-acies-gray hover:bg-acies-yellow hover:text-acies-gray text-white border-none rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Simulate scenarios</span>
                <Play size={11} />
              </button>
              <button
                onClick={() => addToast('Board Exported', 'Strategic market signals report compiled and downloaded.', '#3b82f6')}
                className="px-5 py-2.5 border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[10px] font-bold text-zinc-700 dark:text-zinc-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-transparent uppercase tracking-wider"
              >
                <span>Export board summary</span>
                <Download size={11} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
      

      {/* Top Filter Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-3.5 rounded-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2 py-1.5 rounded-sm">
            <Filter size={11} className="text-[#6d28d9] dark:text-[#a78bfa] shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Filters</span>
          </div>

          <select 
            value={filterRegion} 
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
          >
            <option value="All">All Regions</option>
            <option value="APAC">APAC</option>
            <option value="EMEA">EMEA</option>
            <option value="Americas">Americas</option>
            <option value="India">India</option>
          </select>

          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Beverages">Beverages</option>
            <option value="Snacks">Snacks</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Household">Household</option>
          </select>

          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
          >
            <option value="All">All Signal Types</option>
            <option value="Risk">Risk</option>
            <option value="Opportunity">Opportunity</option>
            <option value="Competitor">Competitor</option>
            <option value="Sentiment">Sentiment</option>
            <option value="Supply">Supply</option>
            <option value="Portfolio">Portfolio</option>
          </select>

          <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="critical">🔴 Critical</option>
            <option value="warning">🟡 Warning</option>
            <option value="info">🔵 Info</option>
          </select>

          {(filterRegion !== 'All' || filterCategory !== 'All' || filterType !== 'All' || filterSeverity !== 'All') && (
            <button 
              onClick={() => { setFilterRegion('All'); setFilterCategory('All'); setFilterType('All'); setFilterSeverity('All'); }}
              className="text-[9px] text-[#6d28d9] dark:text-[#a78bfa] font-bold uppercase tracking-wider hover:underline px-1 cursor-pointer bg-transparent border-none"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold font-mono">
            <RefreshCw size={11} className="text-zinc-400" />
            <span>UPDATED: {lastRefreshed}</span>
          </div>
          <span className="h-4 w-px bg-black/10 dark:bg-white/15"></span>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider rounded-sm text-zinc-600 dark:text-zinc-400 cursor-pointer"
          >
            <Download size={11} />
            Export Summary
          </button>
        </div>
      </div>

      {/* Row 1: Critical Signals KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* KPI 1: Competitor Alerts */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Competitor Alerts</p>
          <h4 className="text-2xl font-display font-extrabold text-[#6d28d9] dark:text-[#a78bfa] leading-none">{competitorAlertsCount}</h4>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase font-bold text-[#6d28d9] dark:text-[#a78bfa]">Active Campaigns</p>
        </div>

        {/* KPI 2: Opportunity Signals */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Opportunities</p>
          <h4 className="text-2xl font-display font-extrabold text-emerald-500 leading-none">{activeOpportunityCount}</h4>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">Growth drivers</p>
        </div>

        {/* KPI 3: Risk Exposure */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Risk Exposure</p>
          <h4 className="text-2xl font-display font-extrabold text-orange-500 leading-none">${finalRiskExposure.toFixed(1)}M</h4>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">Revenue at risk</p>
        </div>

        {/* KPI 4: AI Risk Predictions */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">AI Risk Predictions</p>
          <h4 className="text-2xl font-display font-extrabold text-[#6d28d9] dark:text-[#a78bfa] leading-none">12</h4>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">Emergent concerns</p>
        </div>

        {/* KPI 5: Regions Under Alert */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Regions Alerted</p>
          <h4 className="text-2xl font-display font-extrabold text-blue-500 leading-none">{alertRegions.length}</h4>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">
            {alertRegions.length > 0 ? alertRegions.join(', ') : 'None'}
          </p>
        </div>

        {/* KPI 6: Signal Resolution Rate */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Resolution Rate</p>
          <h4 className="text-2xl font-display font-extrabold text-zinc-800 dark:text-zinc-200 leading-none">{resolutionRate}%</h4>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">Action efficiency</p>
        </div>

      </div>

      {/* Row 2: Executive Signal Feed | Category Trend Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Main Executive Signal Feed */}
        <div className="xl:col-span-7 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Executive Signal Feed</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {filteredSignals.length} active notifications
            </span>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {filteredSignals.length > 0 ? (
              filteredSignals.map(sig => {
                const borderCol = sig.severity === 'critical' ? 'border-red-500/30' : sig.severity === 'warning' ? 'border-amber-500/30' : 'border-blue-500/30';
                const indicatorBg = sig.severity === 'critical' ? 'bg-red-500/10 text-red-500' : sig.severity === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500';
                
                return (
                  <div key={sig.id} className={`p-3.5 border-l-2 ${borderCol} rounded-r-sm bg-zinc-50/50 dark:bg-white/5 space-y-3 ${sig.ack ? 'opacity-40' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-[11.5px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
                          {sig.title}
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded-sm opacity-55">
                            {sig.type}
                          </span>
                        </h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">{sig.detail}</p>
                        
                        {/* Trigger and Solution Summary */}
                        <div className="mt-2 space-y-1.5 pl-2 border-l border-black/10 dark:border-white/10 text-[9.5px] leading-relaxed">
                          <p className="text-zinc-600 dark:text-zinc-400">
                            <strong className="text-orange-600 dark:text-orange-400 uppercase tracking-wider text-[8px] mr-1.5">Trigger:</strong>
                            {sig.trigger}
                          </p>
                          <p className="text-zinc-600 dark:text-zinc-400">
                            <strong className="text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[8px] mr-1.5">Solution:</strong>
                            {sig.rectification}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm whitespace-nowrap ${indicatorBg}`}>
                        {sig.impact}
                      </span>
                    </div>

                    <div className="flex gap-2 justify-end pt-1 border-t border-black/[0.03] dark:border-white/[0.03]">
                      <button 
                        onClick={() => handleToggleAck(sig.id)}
                        className="px-2.5 py-1 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 rounded-sm text-[8.5px] font-bold uppercase tracking-wider transition-all cursor-pointer bg-transparent text-zinc-500 dark:text-zinc-400"
                      >
                        {sig.ack ? 'Re-open' : 'Acknowledge'}
                      </button>
                      <button 
                        onClick={() => {
                          setActiveResolveSignal(sig.id);
                        }}
                        className="px-2.5 py-1 bg-acies-gray hover:bg-acies-yellow hover:text-acies-gray text-white rounded-sm text-[8.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center gap-1"
                      >
                        Resolve ✓
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-[10px] text-zinc-500 font-bold py-12">✓ Strategic feed cleared</p>
            )}
          </div>
        </div>

        {/* Category & Brand Momentum Trend Chart */}
        <div className="xl:col-span-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category & Brand Momentum</span>
              <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
                {trendsTimeframe === 'weekly' ? 'Weekly sales index' : 'Monthly sales index'}
              </p>
            </div>
            
            <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setTrendsTimeframe('weekly')}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                  trendsTimeframe === 'weekly'
                    ? 'bg-[#5850ec] text-white shadow-sm'
                    : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setTrendsTimeframe('monthly')}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                  trendsTimeframe === 'monthly'
                    ? 'bg-[#5850ec] text-white shadow-sm'
                    : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryTrendsData} margin={{ left: -25, right: 5, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDarkMode ? '#fff' : '#000' }}
                  itemStyle={{ fontSize: 9 }}
                  labelStyle={{ fontSize: 9, fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line type="monotone" dataKey="Beverages" stroke="#6d28d9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Snacks" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="PersonalCare" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Household" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Market Signals Map | AI Predictive Signals */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Market Signals Map (Regional Alert Load Heatgrid) */}
        <div className="xl:col-span-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Market Signals Alert Map</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Alert loading by region</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            {regionList.map(reg => {
              const count = getAlertLoad(reg);
              const color = count >= 3 
                ? 'border-red-500/35 text-red-500 bg-red-500/5 hover:border-red-500/55 hover:bg-red-500/10' 
                : count >= 1 
                  ? 'border-amber-500/35 text-amber-500 bg-amber-500/5 hover:border-amber-500/55 hover:bg-amber-500/10' 
                  : 'border-emerald-500/35 text-emerald-500 bg-emerald-500/5 hover:border-emerald-500/55 hover:bg-emerald-500/10';
              return (
                <div 
                  key={reg} 
                  onClick={() => setSelectedAlertRegion(reg)}
                  className={`p-4 border rounded-sm flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer select-none transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${color}`}
                >
                  <Globe size={40} className="absolute -right-2 -bottom-2 opacity-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">{reg} Region</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <h5 className="text-xl font-display font-bold leading-none">{count}</h5>
                    <span className="text-[8px] font-extrabold uppercase">unresolved</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Predictions & Risk Scores */}
        <div className="xl:col-span-7 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa] flex items-center gap-1">
              <Zap size={11} className="fill-[#6d28d9] dark:fill-[#a78bfa]" />
              AI Risk Predictions
            </span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Forecasted disruptions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Prediction 1 */}
            <div 
              onClick={() => {
                setActivePredictionType('stockout');
                setAiPredictionOpen(true);
              }}
              className="p-3 border border-black/5 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 cursor-pointer hover:border-purple-500/35 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all"
            >
              <div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-600">
                  <span>Launch Supply Shortage</span>
                  <span className="text-red-500">92% Prob.</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">BrandA Premium Energy</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Pre-launch safety buffer at Vapi Hub is <span className="font-bold text-red-500">below threshold</span> for regional launch.
                </p>
              </div>
            </div>

            {/* Prediction 2 */}
            <div 
              onClick={() => {
                setActivePredictionType('elasticity');
                setAiPredictionOpen(true);
              }}
              className="p-3 border border-black/5 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 cursor-pointer hover:border-purple-500/35 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all"
            >
              <div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-600">
                  <span>Counter-Launch Price War</span>
                  <span className="text-amber-500">74% Impact</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">BrandD Yogurt Drink</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Competitor wafer price cuts designed to <span className="font-bold text-amber-500">block shelf placements</span> of new launch in EU.
                </p>
              </div>
            </div>

            {/* Prediction 3 */}
            <div 
              onClick={() => {
                setActivePredictionType('margin');
                setAiPredictionOpen(true);
              }}
              className="p-3 border border-black/5 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 cursor-pointer hover:border-purple-500/35 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all"
            >
              <div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-600">
                  <span>Launch Cost Overrun</span>
                  <span className="text-red-500">81% Prob.</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">BrandC Biscuits</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Initial mold tooling and launch marketing costs projected to <span className="font-bold text-red-500">exceed budget by 24%</span>.
                </p>
              </div>
            </div>

            {/* Prediction 4 */}
            <div 
              onClick={() => {
                setActivePredictionType('demand');
                setAiPredictionOpen(true);
              }}
              className="p-3 border border-black/5 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 cursor-pointer hover:border-purple-500/35 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all"
            >
              <div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-600">
                  <span>Pilot Production Delay</span>
                  <span className="text-indigo-500">88% Prob.</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">BrandF Eco-Pack Water</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Manufacturing validation line and regulatory permit backlog <span className="font-bold text-indigo-500">delaying pilot run</span> in APAC.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Row 4: Market Signals | Competitive Intelligence */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Market Signals Card */}
        <div className="xl:col-span-7 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Market signals</span>
              
              <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setMarketSignalsView('grid')}
                  className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                    marketSignalsView === 'grid'
                      ? 'bg-[#5850ec] text-white shadow-sm'
                      : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setMarketSignalsView('table')}
                  className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                    marketSignalsView === 'table'
                      ? 'bg-[#5850ec] text-white shadow-sm'
                      : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {marketSignalsView === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Item 1 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/10">
                    <AlertTriangle size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-800 dark:text-zinc-200 leading-none">Price sensitivity rising</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">Consumer trade-down accelerating in Q2</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/10">
                    <TrendingUp size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-800 dark:text-zinc-200 leading-none">Health segment up</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">+19% YoY, outpacing core</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/10">
                    <Users size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-800 dark:text-zinc-200 leading-none">New entrants: 4</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">2 direct, 2 adjacent SKUs launched</p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10">
                    <Inbox size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-800 dark:text-zinc-200 leading-none">Supply constraints</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">Raw material lead times +3 wks</p>
                  </div>
                </div>

                {/* Item 5 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/10">
                    <Globe size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-800 dark:text-zinc-200 leading-none">Export opportunity</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">APAC demand signal strong</p>
                  </div>
                </div>

                {/* Item 6 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/10">
                    <Sparkles size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-800 dark:text-zinc-200 leading-none">Online channel growth</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">D2C grocery sales +24%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      <th className="py-2 pb-1.5 font-bold">Signal</th>
                      <th className="py-2 pb-1.5 font-bold">Category</th>
                      <th className="py-2 pb-1.5 font-bold">Impact / Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03] text-[10.5px]">
                    {/* Row 1 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <AlertTriangle size={13} className="text-red-500" />
                        Price sensitivity rising
                      </td>
                      <td className="py-2.5 text-red-500 font-bold uppercase text-[9px]">High Risk</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">Consumer trade-down accelerating in Q2</td>
                    </tr>
                    {/* Row 2 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <TrendingUp size={13} className="text-emerald-500" />
                        Health segment up
                      </td>
                      <td className="py-2.5 text-emerald-500 font-bold uppercase text-[9px]">Growth Opportunity</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">+19% YoY, outpacing core</td>
                    </tr>
                    {/* Row 3 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <Users size={13} className="text-blue-500" />
                        New entrants: 4
                      </td>
                      <td className="py-2.5 text-blue-500 font-bold uppercase text-[9px]">Market Alert</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">2 direct, 2 adjacent SKUs launched</td>
                    </tr>
                    {/* Row 4 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <Inbox size={13} className="text-amber-500" />
                        Supply constraints
                      </td>
                      <td className="py-2.5 text-amber-500 font-bold uppercase text-[9px]">Sourcing Risk</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">Raw material lead times +3 wks</td>
                    </tr>
                    {/* Row 5 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <Globe size={13} className="text-emerald-500" />
                        Export opportunity
                      </td>
                      <td className="py-2.5 text-emerald-500 font-bold uppercase text-[9px]">Global Opportunity</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">APAC demand signal strong</td>
                    </tr>
                    {/* Row 6 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <Sparkles size={13} className="text-purple-500" />
                        Online channel growth
                      </td>
                      <td className="py-2.5 text-purple-500 font-bold uppercase text-[9px]">Growth Opportunity</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">D2C grocery sales +24%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowExplorePage(true);
              addToast('Opening Explore Page', 'Opening dedicated VP-ready signals board.', '#3b82f6');
            }}
            className="w-full mt-4 py-2 border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[10px] font-bold text-zinc-700 dark:text-zinc-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-transparent"
          >
            <span>Explore</span>
            <ArrowUpRight size={13} className="shrink-0" />
          </button>

      </div>

        {/* Competitive Intelligence Signals */}
        <div className="xl:col-span-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Competitive Intelligence</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Market activity ticker</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              { label: 'Rival Pricing Cut', body: 'Competitor wafers priced drop -10% in EU supermarts.', time: '1h ago', cat: 'Snacks' },
              { label: 'Competitor Launch', body: 'Alternative premium soy drink introduced in APAC region.', time: '3h ago', cat: 'Beverages' },
              { label: 'Distribution Surge', body: 'Rival personal care brand secured 80% shelf targets in West India.', time: '5h ago', cat: 'Personal Care' }
            ].map((c, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedCompIntelIdx(i)}
                className="flex justify-between items-start gap-4 p-3 bg-black/[0.01] dark:bg-white/5 rounded border border-black/5 dark:border-white/5 text-[11px] cursor-pointer hover:border-purple-500/35 hover:bg-black/[0.02] dark:hover:bg-white/5 hover:scale-[1.01] transition-all"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 flex-wrap">
                    {c.label} · <span className="text-[8px] font-bold uppercase px-1 bg-black/10 dark:bg-white/10 rounded">{c.cat}</span>
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">{c.body}</p>
                  <span className="text-[8.5px] text-[#6d28d9] dark:text-[#a78bfa] font-bold uppercase mt-1 flex items-center gap-1">
                    <Sparkles size={10} className="animate-pulse" /> AI Comparison Available
                  </span>
                </div>
                <span className="text-[8.5px] font-mono text-zinc-400 whitespace-nowrap shrink-0">{c.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 5: Customer Sentiment NPS | Portfolio Saturation & Cannibalization */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Customer Sentiment NPS Meter */}
        <div className="xl:col-span-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Customer NPS Sentiment</span>
              <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">Target Score: &gt; 70</p>
            </div>
            
            <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setNpsTimeframe('weekly')}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                  npsTimeframe === 'weekly'
                    ? 'bg-[#5850ec] text-white shadow-sm'
                    : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setNpsTimeframe('monthly')}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                  npsTimeframe === 'monthly'
                    ? 'bg-[#5850ec] text-white shadow-sm'
                    : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeNpsData} margin={{ left: -25, right: 5, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDarkMode ? '#fff' : '#000' }}
                  itemStyle={{ fontSize: 9 }}
                />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line type="monotone" dataKey="Beverages" stroke="#6d28d9" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Snacks" stroke="#10b981" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="PersonalCare" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Household" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Health & Saturation Dials */}
        <div className="xl:col-span-7 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Portfolio Saturation & Cannibalization</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">System metrics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Card 1: Beverages Overlap Ratio */}
            <div 
              onClick={() => setSelectedPortfolioBlock('overlap')}
              className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col items-center text-center space-y-2 cursor-pointer hover:scale-[1.02] hover:shadow-md hover:border-purple-500/35 transition-all select-none"
            >
              <div className="relative">
                <svg viewBox="0 0 120 70" className="w-28 h-16">
                  {/* Background track */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke={isDarkMode ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)"}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Filled track for 0.68 */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={141.37}
                    strokeDashoffset={141.37 * (1 - 0.68)}
                  />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl font-display font-extrabold text-red-500 block leading-none">0.68</span>
                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 block">Beverages overlap ratio</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                High cannibalization
              </span>
            </div>

            {/* Card 2: Innovation Volume Share */}
            <div 
              onClick={() => setSelectedPortfolioBlock('innovation')}
              className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col items-center text-center space-y-2 cursor-pointer hover:scale-[1.02] hover:shadow-md hover:border-purple-500/35 transition-all select-none"
            >
              <div className="relative">
                <svg viewBox="0 0 120 70" className="w-28 h-16">
                  {/* Background track */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke={isDarkMode ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)"}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Filled track for 34% (0.34) */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={141.37}
                    strokeDashoffset={141.37 * (1 - 0.34)}
                  />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl font-display font-extrabold text-emerald-600 dark:text-emerald-500 block leading-none">34%</span>
                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 block">Innovation volume share</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Target &gt; 30%
              </span>
            </div>

            {/* Card 3: Portfolio Health Risk Index */}
            <div 
              onClick={() => setSelectedPortfolioBlock('risk')}
              className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col items-center text-center space-y-2 cursor-pointer hover:scale-[1.02] hover:shadow-md hover:border-purple-500/35 transition-all select-none"
            >
              <div className="relative">
                <svg viewBox="0 0 120 70" className="w-28 h-16">
                  {/* Background track */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke={isDarkMode ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.1)"}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Filled track for 0.44 */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={141.37}
                    strokeDashoffset={141.37 * (1 - 0.44)}
                  />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl font-display font-extrabold text-amber-500 block leading-none">0.44</span>
                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 block">Portfolio health risk index</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Moderate risk
              </span>
            </div>
          </div>
        </div>
    </div>
        </>
      )}

      {/* Floating Corner Toasts Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map(t => (
          <div 
            key={t.id} 
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="pointer-events-auto bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-3.5 rounded shadow-lg flex items-start gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: t.color }} />
            <div>
              <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 leading-none">{t.title}</h5>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{t.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resolve Sync Meeting Modal */}
      <ResolveSignalModal
        isOpen={!!activeResolveSignal}
        signal={signals.find(x => x.id === activeResolveSignal) || null}
        onClose={() => setActiveResolveSignal(null)}
        onRequestAction={(email, name, subject, body) => {
          setComposerEmail({
            to: email,
            name,
            subject,
            body,
            action: activeResolveSignal || ''
          });
          setComposerOpen(true);
        }}
      />

      {/* Email Composer Modal */}
      <EmailComposerModal 
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        initialEmail={composerEmail}
        onSend={(name, email, subject, body, channel) => {
          setComposerOpen(false);
          const resolvedTitle = RECIPIENT_TITLES[email.toLowerCase()] || 'Product Manager';
          const signal = signals.find(x => x.id === composerEmail.action);
          const title = signal ? signal.title : '';
          
          setSuccessFeedback({
            isOpen: true,
            recipientName: name,
            recipientTitle: resolvedTitle,
            recipientEmail: email,
            contextType: 'signal',
            contextTitle: title,
            channel
          });
          
          addToast(
            'Sync Meeting Invitation Sent', 
            `Meeting invite ${channel === 'email' ? 'email' : 'message'} sent successfully to ${name} (${email}).`, 
            '#10b981'
          );
          
          // Resolve signal
          setSignals(prev => prev.filter(s => s.id !== composerEmail.action));
          setActiveResolveSignal(null);
        }}
      />

      {/* Success Feedback Modal */}
      {successFeedback && (
        <SuccessFeedbackModal
          isOpen={successFeedback.isOpen}
          onClose={() => setSuccessFeedback(null)}
          recipientName={successFeedback.recipientName}
          recipientTitle={successFeedback.recipientTitle}
          recipientEmail={successFeedback.recipientEmail}
          contextType={successFeedback.contextType}
          contextTitle={successFeedback.contextTitle}
          isDarkMode={isDarkMode}
          channel={successFeedback.channel}
        />
      )}

      {/* AI Prediction Explainer Modal */}
      <AIPredictionModal 
        isOpen={aiPredictionOpen}
        onClose={() => {
          setAiPredictionOpen(false);
          setActivePredictionType(null);
        }}
        predictionType={activePredictionType}
      />

      {/* Regional Alerts Summary Modal */}
      {selectedAlertRegion && (
        <RegionalAlertsModal 
          isOpen={!!selectedAlertRegion}
          onClose={() => setSelectedAlertRegion(null)}
          region={selectedAlertRegion}
          signals={signals}
        />
      )}

      {/* Competitive Intelligence Comparison Modal */}
      {selectedCompIntelIdx !== null && (
        <CompetitiveIntelligenceModal 
          isOpen={selectedCompIntelIdx !== null}
          onClose={() => setSelectedCompIntelIdx(null)}
          intelIdx={selectedCompIntelIdx}
        />
      )}

      {/* Portfolio Deep Dive Modal */}
      <PortfolioDeepDiveModal
        isOpen={selectedPortfolioBlock !== null}
        onClose={() => setSelectedPortfolioBlock(null)}
        metricType={selectedPortfolioBlock}
        isDarkMode={isDarkMode}
      />

      {/* Explore Signal Detail Modal */}
      <ExploreSignalDetailModal
        isOpen={selectedExploreSignal !== null}
        signal={selectedExploreSignal}
        onClose={() => setSelectedExploreSignal(null)}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
