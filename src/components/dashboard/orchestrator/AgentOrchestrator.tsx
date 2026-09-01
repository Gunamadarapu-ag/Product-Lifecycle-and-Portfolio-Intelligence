/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cpu, Database, Shield, Zap, TrendingUp, Sparkles, RefreshCw, CheckCircle2, ChevronRight, Layers, Play, Network, FileText, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip 
} from 'recharts';

interface AgentOrchestratorProps {
  isDarkMode: boolean;
  role: string;
}

interface AgentInfo {
  id: string;
  name: string;
  title: string;
  status: 'Idle' | 'Processing' | 'Synced';
  tasks: string[];
  color: string;
  bgColor: string;
}

const AGENTS_LIST: AgentInfo[] = [
  {
    id: 'fpa',
    name: 'FP&A Agent',
    title: 'Financial Planning & Analysis',
    status: 'Synced',
    tasks: ['Execute 3-Statement Modeling', 'Integrated Statement Analysis', 'Cash Flow & Liquidity Projections'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20'
  },
  {
    id: 'controller',
    name: 'Controller Agent',
    title: 'Governance & Closing Close',
    status: 'Synced',
    tasks: ['Accounting Compliance Audit', 'Intercompany Reconciliation', 'Continuous Close Acceleration'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'merchandiser',
    name: 'Merchandiser Agent',
    title: 'Category & Inventory Syncer',
    status: 'Synced',
    tasks: ['Shelf Velocity Optimization', 'Promotional Alignment', 'Margin Dilution Warnings'],
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 'supply',
    name: 'Supply Chain Agent',
    title: 'Logistics & Demand Forecasts',
    status: 'Synced',
    tasks: ['Supplier Capacity Modeling', 'Lead Time Shock Simulations', 'Safety Stock Level Optimization'],
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/20'
  }
];

export const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({ isDarkMode, role }) => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'foresight' | 'governance'>('workspace');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('fpa');
  const [selectedDriver, setSelectedDriver] = useState<'normal' | 'inflation' | 'weather' | 'freight'>('normal');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [routingLogs, setRoutingLogs] = useState<string[]>([
    '[System Launch] Acies Orchestrator online.',
    '[Registry] All 4 specialist planning agents registered.',
    '[Status] Waiting for workflow execution input.'
  ]);

  // Chart data simulation based on drivers
  const getForecastChartData = () => {
    const baseData = [
      { name: 'Jan', revenue: 72, margin: 38.2, cash: 45 },
      { name: 'Feb', revenue: 74, margin: 38.5, cash: 48 },
      { name: 'Mar', revenue: 77, margin: 38.1, cash: 52 },
      { name: 'Apr', revenue: 80, margin: 38.4, cash: 56 },
      { name: 'May', revenue: 83, margin: 38.8, cash: 62 },
      { name: 'Jun', revenue: 85, margin: 38.5, cash: 65 }
    ];

    switch (selectedDriver) {
      case 'inflation':
        return baseData.map(d => ({
          ...d,
          revenue: Math.round(d.revenue * 1.04), // nominal inflation increase
          margin: +(d.margin - 2.1).toFixed(1),  // raw margin compression
          cash: Math.round(d.cash * 0.9)         // cash burn
        }));
      case 'weather':
        return baseData.map((d, i) => ({
          ...d,
          revenue: i >= 3 ? Math.round(d.revenue * 1.15) : d.revenue, // Beverage demand surge in summer
          margin: +(d.margin + 0.5).toFixed(1),
          cash: i >= 3 ? Math.round(d.cash * 1.1) : d.cash
        }));
      case 'freight':
        return baseData.map(d => ({
          ...d,
          revenue: Math.round(d.revenue * 0.95),  // delayed delivery loss
          margin: +(d.margin - 1.5).toFixed(1),   // freight surcharges
          cash: Math.round(d.cash * 0.82)         // working capital locked
        }));
      case 'normal':
      default:
        return baseData;
    }
  };

  const chartData = getForecastChartData();

  // Run simulation sequence
  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);
    setRoutingLogs(prev => [
      `[Trigger] Initiating 3-Statement Forecast Refresh under ${selectedDriver.toUpperCase()} scenario.`,
      ...prev
    ]);
  };

  useEffect(() => {
    if (!isSimulating) return;

    const timer = setTimeout(() => {
      if (simStep === 1) {
        setRoutingLogs(prev => [
          `[Orchestrator] Task routed to FP&A Agent: Refresh income statement and check cash flow viability.`,
          ...prev
        ]);
        setSimStep(2);
      } else if (simStep === 2) {
        setRoutingLogs(prev => [
          `[Specialist Sync] Supply Chain Agent simulated lead time shock under scenario drivers. Sourcing risk raised.`,
          ...prev
        ]);
        setSimStep(3);
      } else if (simStep === 3) {
        setRoutingLogs(prev => [
          `[Specialist Sync] Merchandiser Agent adjusted retail price indices. Recommended promotion rollback to protect margin.`,
          ...prev
        ]);
        setSimStep(4);
      } else if (simStep === 4) {
        setRoutingLogs(prev => [
          `[Orchestrator] Consolidated predictions validated by Controller Agent. Data written to enterprise ledger via REST APIs.`,
          ...prev
        ]);
        setSimStep(5);
      } else if (simStep === 5) {
        setRoutingLogs(prev => [
          `[Status] Refresh complete. 3-Statement Balance Sheet and Cash Flow models fully synced. Explainable logs archived.`,
          ...prev
        ]);
        setIsSimulating(false);
        setSimStep(0);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isSimulating, simStep, selectedDriver]);

  const selectedAgent = AGENTS_LIST.find(a => a.id === selectedAgentId) || AGENTS_LIST[0];

  return (
    <div className="space-y-6 animate-fadeIn w-full text-zinc-800 dark:text-white">
      
      {/* Horizontally Stacked Tab Menu selectors */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3 rounded shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">Agent Center:</span>
          <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/10 min-w-[320px]">
            {[
              { id: 'workspace', label: 'Orchestrator Workspace' },
              { id: 'foresight', label: 'Foresight Engines' },
              { id: 'governance', label: 'Security & Governance' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer text-center ${
                  activeTab === tab.id
                    ? 'bg-acies-yellow text-white dark:text-acies-gray font-extrabold shadow-sm shadow-black/10'
                    : 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-acies-yellow animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
            Acies AI Agentic Orchestration Console v1.0
          </span>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Nodes Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Network size={14} className="text-acies-yellow" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Collaborative Specialist Agents
                  </h3>
                </div>
                <span className="text-[7.5px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                  4 active planners connected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AGENTS_LIST.map(agent => {
                  const isActive = selectedAgentId === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`text-left bg-zinc-50 dark:bg-white/5 border p-4 rounded shadow-sm transition-all hover:translate-y-[-1px] cursor-pointer flex flex-col justify-between min-h-[110px] relative overflow-hidden group outline-none ${
                        isActive 
                          ? 'border-acies-yellow dark:border-acies-yellow ring-1 ring-acies-yellow/30 bg-acies-yellow/[0.01]' 
                          : 'border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/15'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-acies-yellow" />
                      )}
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-display font-extrabold text-zinc-900 dark:text-white leading-tight ${agent.color}`}>
                            {agent.name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                            <span className="text-[7.5px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                              {agent.status}
                            </span>
                          </span>
                        </div>
                        <p className="text-[8px] uppercase tracking-wider font-bold text-zinc-500 mt-0.5">
                          {agent.title}
                        </p>
                      </div>

                      <div className="space-y-1.5 mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                        <p className="text-[7px] uppercase font-bold text-zinc-400 tracking-wider">Key Functional Focus:</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.tasks.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-[6.5px] bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Agent Tasks Detail Panel */}
            <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-acies-yellow" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Agent Core Strategy: {selectedAgent.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedAgent.tasks.map((task, idx) => (
                    <div key={idx} className="p-3 bg-black/5 dark:bg-white/5 rounded border border-black/5 dark:border-white/5 flex flex-col justify-between min-h-[90px]">
                      <span className="text-[8px] uppercase font-bold text-zinc-400">Ability {idx + 1}</span>
                      <p className="text-[10px] font-bold text-zinc-700 dark:text-white leading-tight mt-1">{task}</p>
                      <span className="text-[7px] text-acies-yellow uppercase tracking-widest font-semibold mt-2.5 flex items-center gap-1">
                        <CheckCircle2 size={8} /> Production Ready
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded bg-acies-yellow/5 border border-acies-yellow/15 flex items-start gap-2.5">
                  <AlertCircle size={14} className="text-acies-yellow shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h5 className="text-[9px] font-bold uppercase text-acies-yellow">Collaborative Enterprise Planning Protocol</h5>
                    <p className="text-[8.5px] leading-relaxed text-zinc-500 dark:text-zinc-500">
                      The Orchestrator natively synchronizes variables across agents. For example, if the <strong>Supply Chain Agent</strong> predicts capacity deficits, it automatically prompts the <strong>FP&A Agent</strong> to re-model cost of goods and trigger secondary transport budgeting, bypassing manual request delays.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orchestrator Logs Panel */}
          <div className="space-y-6">
            <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded shadow-sm flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Play size={14} className="text-acies-yellow" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Workflow Execution Control
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <label className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Choose Scenario Driver:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'normal', label: 'Baseline scenario' },
                      { id: 'inflation', label: 'Inflation shock' },
                      { id: 'weather', label: 'Summer weather' },
                      { id: 'freight', label: 'Freight delay' }
                    ].map(drv => (
                      <button
                        key={drv.id}
                        onClick={() => setSelectedDriver(drv.id as any)}
                        disabled={isSimulating}
                        className={`py-1.5 px-2 text-[8px] font-bold uppercase rounded border transition-all cursor-pointer outline-none ${
                          selectedDriver === drv.id
                            ? 'bg-acies-yellow border-acies-yellow text-white dark:text-acies-gray'
                            : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-500'
                        }`}
                      >
                        {drv.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={startSimulation}
                    disabled={isSimulating}
                    className="w-full mt-4 py-2 bg-acies-gray dark:bg-white text-white dark:text-acies-gray text-[9px] font-bold uppercase tracking-widest hover:bg-acies-yellow hover:text-acies-gray hover:dark:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={10} className={isSimulating ? 'animate-spin' : ''} />
                    {isSimulating ? 'Simulating Agent Coordination...' : 'Execute Orchestration refresh'}
                  </button>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <span className="text-[7.5px] uppercase font-bold tracking-widest text-zinc-400">Live Orchestrator Routing Logs:</span>
                <div className="bg-black/20 dark:bg-black/45 font-mono p-3 rounded text-[8px] text-green-400 dark:text-green-300 h-44 overflow-y-auto space-y-2 scroll-smooth border border-black/10">
                  {routingLogs.map((log, i) => (
                    <div key={i} className="flex gap-1.5">
                      <span className="text-zinc-500 select-none">▶</span>
                      <span className="break-words leading-relaxed">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'foresight' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Predictive Engine Explanation */}
          <div className="space-y-6">
            <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
                <Sparkles size={14} className="text-acies-yellow" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Acies Foresight Engines
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase text-zinc-500">External Economic Intelligence</h4>
                  <p className="text-[8.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Connects directly to over 5 million macro datasets, index parameters, regional weather trackers, and trade routes. Allows the Supply Chain and Merchandiser agents to auto-discover correlation drivers.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase text-zinc-500">Growth Driver Autodiscovery</h4>
                  <p className="text-[8.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Rather than predicting on historical cycles alone, the machine learning models simulate leading indices (e.g. consumer confidence indices) to verify which parameters act as drivers for category demand.
                  </p>
                </div>

                <div className="p-3 bg-black/5 dark:bg-white/5 rounded border border-black/5 dark:border-white/10 space-y-1.5">
                  <span className="text-[7.5px] uppercase font-bold text-acies-yellow tracking-widest">Active Signal Driver</span>
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase mt-1">
                    <span>Selected Driver Scenario:</span>
                    <span className="text-acies-yellow">{selectedDriver.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Forecasting Visualization chart */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-acies-yellow" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Real-time Predictive Statement Forecast
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500/80" />
                    <span className="text-[8px] uppercase font-bold text-zinc-400">Revenue ($ M)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />
                    <span className="text-[8px] uppercase font-bold text-zinc-400">Cash Position ($ M)</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={8} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={8} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#18181b' : '#ffffff', 
                        borderColor: 'rgba(0,0,0,0.1)', 
                        fontSize: '9px',
                        borderRadius: '4px' 
                      }} 
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="cash" stroke="#60a5fa" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                <div className="space-y-0.5">
                  <span className="text-[7.5px] uppercase font-bold text-zinc-400">June Forecast revenue</span>
                  <p className="text-sm font-display font-black text-zinc-800 dark:text-white">
                    ${chartData[5].revenue} M
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[7.5px] uppercase font-bold text-zinc-400">June Avg Gross Margin</span>
                  <p className="text-sm font-display font-black text-zinc-800 dark:text-white">
                    {chartData[5].margin}%
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[7.5px] uppercase font-bold text-zinc-400">June Ending cash position</span>
                  <p className="text-sm font-display font-black text-zinc-800 dark:text-white">
                    ${chartData[5].cash} M
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'governance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Structure Awareness */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
              <Database size={14} className="text-acies-yellow" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Structure Awareness
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-[8.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                The agent environment natively interprets hierarchical data models (regions, channels, SKU matrices) rather than reading flat files.
              </p>
              <div className="space-y-2">
                <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider">Active Schema Connections:</span>
                {[
                  { label: 'Market Hierarchy Metadata', status: 'Online' },
                  { label: 'Role-Based Access Mapping', status: 'Online' },
                  { label: 'Material Ledger Schema', status: 'Online' }
                ].map((schema, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[8px] bg-black/5 dark:bg-white/5 p-2 rounded">
                    <span className="font-bold text-zinc-700 dark:text-white">{schema.label}</span>
                    <span className="text-green-500 font-bold uppercase tracking-widest text-[7px]">{schema.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Open Integration Architecture */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
              <Layers size={14} className="text-acies-yellow" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Open Integrations
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-[8.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                Enable "Bring-Your-Own-Model" workflows. Run algorithms on custom models and securely write outputs back into the dashboard ledger.
              </p>
              <div className="space-y-2">
                <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider">Available API Integrations:</span>
                {[
                  { name: 'Azure ML Studio Connector', type: 'REST' },
                  { name: 'Databricks Unity Catalog', type: 'Spark' },
                  { name: 'Snowflake External Functions', type: 'SQL' }
                ].map((api, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[8px] bg-black/5 dark:bg-white/5 p-2 rounded">
                    <span className="font-bold text-zinc-700 dark:text-white">{api.name}</span>
                    <span className="text-zinc-400 font-mono text-[7px] uppercase font-bold">{api.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Auditability & Governance */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
              <Shield size={14} className="text-acies-yellow" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Trust & Audit Trails
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-[8.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                Verifiable confidence. All agent recommendations are logged with complete traceability back to the input driver dataset.
              </p>
              <div className="space-y-2">
                <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider">Verification Standards:</span>
                {[
                  { spec: 'Explainable AI Logs (XAI)', status: 'Active' },
                  { spec: 'Verifiable Scenario Lineage', status: 'Enabled' },
                  { spec: '256-bit Row-Level Security', status: 'Enforced' }
                ].map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[8px] bg-black/5 dark:bg-white/5 p-2 rounded border border-black/5 dark:border-white/5">
                    <span className="font-bold text-zinc-700 dark:text-white">{spec.spec}</span>
                    <span className="text-acies-yellow font-bold uppercase tracking-widest text-[7.5px]">{spec.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
