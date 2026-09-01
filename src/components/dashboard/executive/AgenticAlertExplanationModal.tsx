/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, ZoomIn } from 'lucide-react';

interface AgenticAlertExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: { id: string; title: string; sev: string; detail: string }[];
  isDarkMode: boolean;
  onInvestigateAlert: (alertId: string) => void;
}

type IngestSourceTab = 'finance' | 'crm' | 'iot' | 'api';
type ComputeTab = 'process' | 'vis' | 'recs' | 'collab' | 'gov';
type DiagnosticTab = 'diagnostic' | 'root' | 'impact' | 'scenario' | 'alerts' | 'recs';

export const AgenticAlertExplanationModal: React.FC<AgenticAlertExplanationModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [activeSourceTab, setActiveSourceTab] = useState<IngestSourceTab>('finance');
  const [activeComputeTab, setActiveComputeTab] = useState<ComputeTab>('process');
  const [activeDiagnosticTab, setActiveDiagnosticTab] = useState<DiagnosticTab>('diagnostic');
  const [isZoomedRootCause, setIsZoomedRootCause] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  if (!isOpen) return null;

  // Source-specific high fidelity data for Ingestion (Step 1)
  const tabData = {
    finance: {
      title: 'Finance Auditor Agent',
      subtitle: 'Autonomous ledger monitoring and profit leak audit agent',
      systems: [
        { name: 'SAP Ingestion Agent', badge: 'SAP', badgeBg: 'bg-blue-600' },
        { name: 'Oracle Auditor Agent', badge: 'ORCL', badgeBg: 'bg-red-600' },
        { name: 'NetSuite Costing Agent', badge: 'NS', badgeBg: 'bg-zinc-800' },
      ],
      dataIngested: [
        'Revenue',
        'COGS',
        'Gross Margin',
        'Operating Cost',
        'Formulation Cost',
        'Product P&L',
      ],
      quality: {
        pct: 98,
        sync: '5 min ago',
        completeness: '98%',
        accuracy: '97%',
        freshness: '99%',
        records: '2.4M',
      },
      insight: {
        bullets: [
          '27 SKUs are generating 80% of portfolio profit.',
          '15 SKUs have declining margins despite revenue growth.',
          'Potential margin recovery: $3.2M annually.',
        ],
      },
      outcomes: [
        'Profitability Analysis',
        'SKU Rationalization',
        'Margin Optimization',
        'Portfolio Health Scoring',
      ],
      flow: [
        { label: 'Finance Auditor Agent', desc: 'Raw financial, pricing, and formulation cost data ingested' },
        { label: 'Revenue + Cost Data', desc: 'Unified and cleansed financial metrics prepared' },
        { label: 'AI Profitability Engine', desc: 'AI models analyze margins, trends and profit drivers' },
        { label: 'SKU Health Score', desc: 'Each SKU scored on profitability, growth and risk' },
        { label: 'Recommendations', desc: 'Discontinue SKU-142 (Red), Expand SKU-217 (Green), Optimize SKU-089 (Yellow)' },
      ],
    },
    crm: {
      title: 'Client Insights Agent',
      subtitle: 'Customer accounts and sales lifecycle monitoring agent',
      systems: [
        { name: 'Salesforce Ingestion Agent', badge: 'SFDC', badgeBg: 'bg-sky-500' },
        { name: 'Dynamics Pipeline Agent', badge: 'MSFT', badgeBg: 'bg-teal-600' },
        { name: 'HubSpot Engagement Agent', badge: 'HUBS', badgeBg: 'bg-orange-500' },
      ],
      dataIngested: [
        'Customer Accounts',
        'Sales Orders',
        'Pipeline Stages',
        'Return Logs',
        'Service Cases',
        'Opportunity Data',
      ],
      quality: {
        pct: 96,
        sync: '12 min ago',
        completeness: '96%',
        accuracy: '95%',
        freshness: '98%',
        records: '4.8M',
      },
      insight: {
        bullets: [
          'High concentration of low-margin orders identified in region West.',
          'Customer churn probability reduced by 12% via proactive pricing adjustments.',
          'Potential pipeline expansion: $1.8M.',
        ],
      },
      outcomes: [
        'Customer LTV Maximization',
        'Pricing Elasticity Modeling',
        'Demand Forecasting',
        'Pipeline Optimization',
      ],
      flow: [
        { label: 'Client Insights Agent Data', desc: 'Customer profiling and transaction histories ingested' },
        { label: 'Client Segments', desc: 'Cleansed profiles sorted by volume and value' },
        { label: 'AI LTV Predictor', desc: 'AI computes long-term margins and churn risks' },
        { label: 'Customer Scorecard', desc: 'Clients ranked by profitability and retention potential' },
        { label: 'Recommendations', desc: 'Target Account A-09 (Green), Upsell Bundle B-12 (Green), Flag Account C-44 (Yellow)' },
      ],
    },
    iot: {
      title: 'Operations Telemetry Agent',
      subtitle: 'Real-time batch consistency and product quality telemetry agent',
      systems: [
        { name: 'AWS IoT Scraper Agent', badge: 'AWS', badgeBg: 'bg-amber-500' },
        { name: 'Azure Telemetry Agent', badge: 'MSFT', badgeBg: 'bg-blue-500' },
        { name: 'Formulation Lab Scraper', badge: 'LAB', badgeBg: 'bg-cyan-700' },
      ],
      dataIngested: [
        'Formulation Acidity',
        'Sweetness Index (Brix)',
        'Package Seal Pressure',
        'Batch Density',
        'Pasteurization Temp',
        'Shelf-Life Projection',
      ],
      quality: {
        pct: 99,
        sync: 'Real-time',
        completeness: '99.4%',
        accuracy: '98.9%',
        freshness: '99.9%',
        records: '142M',
      },
      insight: {
        bullets: [
          'Batch #42 shows abnormal acidity variance (potential taste profile drift).',
          'Line B packaging seal pressure spiked 18% during peak temperature cycles.',
          'Potential margin recovery via formula tuning: $420k.',
        ],
      },
      outcomes: [
        'Predictive Formulation Tuning',
        'Taste Profile Consistency',
        'Acidity Level Control',
        'Packaging Waste Minimization',
      ],
      flow: [
        { label: 'Formulation Telemetry', desc: 'Real-time batch density and brix values ingested' },
        { label: 'Quality Assurance Agent', desc: 'Acidity and seal parameters checked for variance thresholds' },
        { label: 'AI Taste Profiler', desc: 'ML models forecast product batch shelf-life and taste' },
        { label: 'Product Quality Score', desc: 'Individual batches scored by profile alignment' },
        { label: 'Recommendations', desc: 'Adjust Batch-42 Acidity (Red), Calibrate Filler B (Yellow), Accept Batch-09 (Green)' },
      ],
    },
    api: {
      title: 'Market Scraper Agent',
      subtitle: 'Economic indicators and competitor price scraping agent',
      systems: [
        { name: 'Bloomberg Feed Agent', badge: 'BBG', badgeBg: 'bg-black border border-zinc-700 text-amber-500' },
        { name: 'Weather Assortment Agent', badge: 'OWM', badgeBg: 'bg-[#0f2c59]' },
        { name: 'Fed Rate Scraper Agent', badge: 'FED', badgeBg: 'bg-emerald-600' },
      ],
      dataIngested: [
        'Global Index Pricing',
        'Competitor Web-scraping',
        'Inflation Rates',
        'Consumer Confidence',
        'Weather Patterns',
        'Economic Indices',
      ],
      quality: {
        pct: 97,
        sync: '15 min ago',
        completeness: '97.2%',
        accuracy: '99.1%',
        freshness: '95.5%',
        records: '820k',
      },
      insight: {
        bullets: [
          'Macroeconomic inflation pressure expected to squeeze raw material margin by Q3.',
          'Competitor X raised list prices by 5% on 12 overlapping SKUs.',
          'Potential margin hedge: $900k.',
        ],
      },
      outcomes: [
        'Dynamic Competitor Pricing',
        'Macroeconomic Hedging',
        'Local Weather Assortment',
        'Sentiment-driven Sourcing',
      ],
      flow: [
        { label: 'Market Intelligence', desc: 'External price indices and competitor catalogs ingested' },
        { label: 'Competitor Mapping', desc: 'Overlapping products indexed to internal SKUs' },
        { label: 'AI Price Elasticity', desc: 'Neural nets predict demand response to market shifts' },
        { label: 'Market Risk Score', desc: 'Portfolio items evaluated for inflation susceptibility' },
        { label: 'Recommendations', desc: 'Hedge Steel Inputs (Red), Match Competitor X Price (Green), Adjust Fuel Surcharges (Yellow)' },
      ],
    },
  };

  // Source-specific high fidelity data for Analysis & Modeling Swarm (Step 2)
  const computeData = {
    process: {
      title: 'Modeling Swarm Overview',
      subtitle: 'Cooperating agent swarm executing optimization models',
      metrics: [
        { label: 'Signals Processed', val: '2.4M', pct: '↑ 18.4%', icon: 'db' },
        { label: 'Agent Decisions', val: '28', pct: '↑ 12.5%', icon: 'cube' },
        { label: 'Insights Generated', val: '156', pct: '↑ 22.3%', icon: 'bulb' },
        { label: 'Recommendations', val: '42', pct: '↑ 15.4%', icon: 'target' },
        { label: 'Action Taken', val: '31', pct: '↑ 19.2%', icon: 'check' },
      ],
      processSteps: [
        { step: '1. Consensus Alignment', desc: 'Map and align signals across ingestion agents', badge: '2.4M signals', icon: 'db' },
        { step: '2. Causal Reasoning', desc: 'Analyze profit leak causal connections', badge: '18 agent tasks', icon: 'model' },
        { step: '3. Agent Simulation', desc: 'Run Monte Carlo volume & price simulations', badge: '28 runs', icon: 'brain' },
        { step: '4. Portfolio Audit', desc: 'Evaluate portfolio risk indices and margins', badge: '64 KPIs audited', icon: 'kpi' },
        { step: '5. Consolidation Swarm', desc: 'Synthesize collaborative agent action lists', badge: '156 insights synthesized', icon: 'bulb' },
      ],
      insights: [
        { text: '27 SKUs are driving 80% of total profit. Concentrate investments on these top SKUs.', badge: 'High Impact', badgeColor: 'text-red-400 border-red-500/20 bg-red-500/5', icon: 'trend' },
        { text: '15 SKUs have declining margin for 2 consecutive quarters. Review pricing and cost structure.', badge: 'Medium Impact', badgeColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5', icon: 'alert' },
        { text: 'Premium Juice segment demand up 15% among enterprise customers. Opportunity to expand 3 SKUs.', badge: 'High Impact', badgeColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', icon: 'check' },
      ],
      models: [
        { name: 'Demand Forecasting', type: 'Time Series', acc: '95.2%', run: '3 min ago', status: 'Healthy' },
        { name: 'Profitability Scoring', type: 'Classification', acc: '91.7%', run: '6 min ago', status: 'Healthy' },
        { name: 'Churn Prediction', type: 'Classification', acc: '89.5%', run: '12 min ago', status: 'Healthy' },
        { name: 'Price Optimization', type: 'Regression', acc: '92.1%', run: '15 min ago', status: 'Healthy' },
        { name: 'Portfolio Optimization', type: 'Complexity Reduction', acc: '93.8%', run: '20 min ago', status: 'Healthy' },
      ],
      kpis: [
        { label: 'Gross Margin %', val: '27.6%', change: '↑ 2.4pp' },
        { label: 'Portfolio ROI', val: '18.9%', change: '↑ 1.8pp' },
        { label: 'Fill Rate', val: '96.2%', change: '↑ 3.1pp' },
        { label: 'SKU Retained %', val: '92.4%', change: '↑ 1.2%' },
      ],
      recs: [
        { title: 'Discontinue SKU-142', desc: 'Low profitability and declining demand', impact: 'High', val: '$1.2M', color: 'text-red-400 border-red-500/15 bg-red-500/[0.02]' },
        { title: 'Expand SKU-217', desc: 'High growth and strong margin', impact: 'High', val: '$2.8M', color: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/[0.02]' },
        { title: 'Optimize Price for SKU-089', desc: 'Price increase opportunity of 5-7%', impact: 'Medium', val: '$0.6M', color: 'text-amber-400 border-amber-500/15 bg-amber-500/[0.02]' },
      ],
      flow: [
        { label: 'Agent Ingestion', desc: '2.4M signals consolidated' },
        { label: 'Swarm Reasoning', desc: '28 agent tasks executed, 64 KPIs audited' },
        { label: 'Causal Insights', desc: '156 agent insights generated' },
        { label: 'Consensus Proposals', desc: '42 consensus action proposals' },
        { label: 'Attributed EBITDA', desc: '$4.6M attributed EBITDA value' },
      ],
    },
    vis: {
      title: 'Visualization & Report Agent',
      subtitle: 'Autonomous interface rendering and alerts dispatch agent',
      metrics: [
        { label: 'Reports Generated', val: '240', pct: '↑ 8.5%', icon: 'db' },
        { label: 'Alerts Triggered', val: '45', pct: '↓ 12.1%', icon: 'cube' },
        { label: 'Active Users', val: '180', pct: '↑ 15.0%', icon: 'bulb' },
        { label: 'Dashboard Views', val: '1.2k', pct: '↑ 20.3%', icon: 'target' },
        { label: 'Delivery Rate', val: '100%', pct: '→ 0.0%', icon: 'check' },
      ],
      processSteps: [
        { step: '1. Layout Adaptation', desc: 'Map visual components to user role contexts', badge: '12 templates', icon: 'db' },
        { step: '2. Visual Translation', desc: 'Select chart styles based on severity', badge: '45 charts active', icon: 'model' },
        { step: '3. Narrative Synthesis', desc: 'Generate real-time executive summaries', badge: '1.2s avg latency', icon: 'brain' },
        { step: '4. Alert Dispatch Routing', desc: 'Package warnings for target channels', badge: '45 rules active', icon: 'kpi' },
        { step: '5. Chat Sync', desc: 'Link chart data to interactive chat agent', badge: '240 reports synchronized', icon: 'bulb' },
      ],
      insights: [
        { text: 'Regional APAC dashboard latency spike detected. Resolved via automated query caching.', badge: 'Resolved', badgeColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', icon: 'check' },
        { text: 'Margin alert delivered successfully to 12 executives with zero packet drop.', badge: 'Delivered', badgeColor: 'text-purple-400 border-purple-500/20 bg-purple-500/5', icon: 'trend' },
      ],
      models: [
        { name: 'UI Adapter', type: 'Cognitive Layout', acc: '99.9%', run: 'Real-time', status: 'Healthy' },
        { name: 'Narrative NLG', type: 'Summary Synthesis', acc: '100.0%', run: '10 min ago', status: 'Healthy' },
        { name: 'Channel Router', type: 'Alert Dispatch', acc: '99.8%', run: '1 min ago', status: 'Healthy' },
      ],
      kpis: [
        { label: 'UI Load Latency', val: '2.1s', change: '↓ 0.4s' },
        { label: 'Active Visuals', val: '412', change: '↑ 18%' },
        { label: 'Routed Alerts', val: '14/day', change: '↓ 3.2' },
        { label: 'Uptime', val: '99.98%', change: '↑ 0.02%' },
      ],
      recs: [
        { title: 'Tune Layout Caching', desc: 'Accelerate visual context rendering times', impact: 'Medium', val: '1.1s', color: 'text-amber-400 border-amber-500/15 bg-amber-500/[0.02]' },
        { title: 'Enable SMS Alerts', desc: 'Deploy urgent text dispatches to field managers', impact: 'High', val: '98%', color: 'text-purple-400 border-purple-500/15 bg-purple-500/[0.02]' },
      ],
      flow: [
        { label: 'Context Mapping', desc: 'User role visual layouts selected' },
        { label: 'Cognitive Selection', desc: 'Anomalies highlighted visually' },
        { label: 'Dynamic Narrative', desc: 'NLG agent generates summaries' },
        { label: 'Router Dispatch', desc: 'Notifications sent to active channels' },
        { label: 'Chat Synchronization', desc: 'Stakeholders query details via chat agent' },
      ],
    },
    recs: {
      title: 'AI Recommendation Agent',
      subtitle: 'Action ranking and displacement simulation agent',
      metrics: [
        { label: 'Total Recs', val: '42', pct: '↑ 15.4%', icon: 'db' },
        { label: 'Approved Mitigation Action Agent', val: '18', pct: '↑ 20.0%', icon: 'cube' },
        { label: 'Rejected / Snoozed', val: '4', pct: '↓ 50.0%', icon: 'bulb' },
        { label: 'Value Realized', val: '$1.4M', pct: '↑ 32.1%', icon: 'target' },
        { label: 'Success Rate', val: '85.4%', pct: '↑ 4.2%', icon: 'check' },
      ],
      processSteps: [
        { step: '1. Insight Intake', desc: 'Aggregate variance and anomaly logs', badge: '156 inputs', icon: 'db' },
        { step: '2. Scenario Run', desc: 'Simulate pricing and volume swings', badge: '120 runs/hr', icon: 'model' },
        { step: '3. Constraint Check', desc: 'Run feasibility and safety bounds', badge: '6 rules active', icon: 'brain' },
        { step: '4. ROI Scoring', desc: 'Rank actions by financial returns', badge: '8 metrics scored', icon: 'kpi' },
        { step: '5. Action Output', desc: 'Publish final approved suggestions', badge: '42 active recs', icon: 'bulb' },
      ],
      insights: [
        { text: 'Recommended price increase on overlap SKUs matching competitor price shifts will secure $1.2M.', badge: 'High Impact', badgeColor: 'text-red-400 border-red-500/20 bg-red-500/5', icon: 'trend' },
        { text: 'Product formulation consolidation recommendation for segment B approved by portfolio leads.', badge: 'Approved', badgeColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', icon: 'check' },
      ],
      models: [
        { name: 'ROI Predictor', type: 'Regressor', acc: '94.2%', run: '5 min ago', status: 'Healthy' },
        { name: 'Constraint Checker', type: 'Boolean Logic', acc: '100.0%', run: '1 min ago', status: 'Healthy' },
        { name: 'Scenario Simulator', type: 'Monte Carlo', acc: '91.8%', run: '30 min ago', status: 'Healthy' },
      ],
      kpis: [
        { label: 'Precision', val: '96.2%', change: '↑ 1.4pp' },
        { label: 'Value Score', val: '8.4/10', change: '↑ 0.5pt' },
        { label: 'Approval Speed', val: '45m', change: '↓ 12m' },
        { label: 'Implementation Rate', val: '42%', change: '↑ 8.0%' },
      ],
      recs: [
        { title: 'Trigger SKU Consolidation', desc: 'Consolidate 12 duplicate listings in category C', impact: 'High', val: '$0.4M', color: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/[0.02]' },
        { title: 'Initiate Supplier Hedge', desc: 'Order bulk raw materials to lock in Q4 cost', impact: 'Medium', val: '$0.8M', color: 'text-amber-400 border-amber-500/15 bg-amber-500/[0.02]' },
      ],
      flow: [
        { label: 'Insight Input', desc: 'Margin leak details fed in' },
        { label: 'Simulation', desc: 'Market variations generated' },
        { label: 'Policy Check', desc: 'Brand guardrails and legal margins cross-checked' },
        { label: 'ROI Analysis', desc: 'Benefit vs cost ratios compiled' },
        { label: 'Decision output', desc: 'Recommendations populated' },
      ],
    },
    collab: {
      title: 'Orchestration & Workflow Agent',
      subtitle: 'Human-in-the-loop task routing and swarm coordination agent',
      metrics: [
        { label: 'Pending Approvals', val: '6', pct: '↓ 22.0%', icon: 'db' },
        { label: 'Approved Mitigation Action Agent', val: '12', pct: '↑ 15.0%', icon: 'cube' },
        { label: 'Escalated Tasks', val: '2', pct: '↓ 50.0%', icon: 'bulb' },
        { label: 'Mitigation Action Agent Assigned', val: '24', pct: '↑ 12.0%', icon: 'target' },
        { label: 'Team Members', val: '8', pct: '→ 0.0%', icon: 'check' },
      ],
      processSteps: [
        { step: '1. Alert Assign', desc: 'Direct alert anomalies to operators', badge: 'Real-time', icon: 'db' },
        { step: '2. Action Draft', desc: 'Outline mitigations and pricing shifts', badge: 'Auto-draft active', icon: 'model' },
        { step: '3. Request Approval', desc: 'Notify team lead of pending action', badge: 'Slack/Mail ping', icon: 'brain' },
        { step: '4. Review Loop', desc: 'Modify pricing parameters or skip', badge: '1.2h SLA target', icon: 'kpi' },
        { step: '5. Executed Action', desc: 'Commit variables directly to ERP', badge: 'Write-back active', icon: 'bulb' },
      ],
      insights: [
        { text: 'SLA target breach probability reduced by 25% due to automated load balancing.', badge: 'High Impact', badgeColor: 'text-red-400 border-red-500/20 bg-red-500/5', icon: 'trend' },
        { text: 'Operator SLA response speed increased by 3.2x over the last 14 days.', badge: 'Opr Speed', badgeColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', icon: 'check' },
      ],
      models: [
        { name: 'SLA Predictor', type: 'Gradient Boost', acc: '89.1%', run: '15 min ago', status: 'Healthy' },
        { name: 'Auto Router', type: 'Heuristic', acc: '98.5%', run: 'Real-time', status: 'Healthy' },
      ],
      kpis: [
        { label: 'Avg Latency', val: '1.8 hrs', change: '↓ 0.6h' },
        { label: 'Escalation Rate', val: '8.3%', change: '↓ 4.1%' },
        { label: 'FTE Utilization', val: '88.5%', change: '↑ 12%' },
        { label: 'ERP Commit rate', val: '100%', change: '→ 0%' },
      ],
      recs: [
        { title: 'Re-route Pending SKU-142 Approval', desc: 'Escalate to VP after 4 hours of inactivity', impact: 'High', val: 'Urgent', color: 'text-red-400 border-red-500/15 bg-red-500/[0.02]' },
        { title: 'Archive Snoozed Alert B-12', desc: 'Clear dashboard clutter for resolved issue', impact: 'Low', val: 'Snoozed', color: 'text-zinc-500 border-zinc-800 bg-zinc-900/40' },
      ],
      flow: [
        { label: 'Alert Routing', desc: 'Task assigned to portfolio analyst' },
        { label: 'Proposal', desc: ' analyst drafts mitigation parameters' },
        { label: 'Review Request', desc: 'Manager notified of transaction proposal' },
        { label: 'Approval Commit', desc: 'Approval granted in workspace' },
        { label: 'ERP Writeback', desc: 'Changes executed in SAP Ingestion Agent' },
      ],
    },
    gov: {
      title: 'Governance & Cleansing Agent',
      subtitle: 'Schema validation and automated metadata self-cleansing agent',
      metrics: [
        { label: 'Compliance Index', val: '100%', pct: '→ 0.0%', icon: 'db' },
        { label: 'Anomaly Flags', val: '14', pct: '↓ 35.0%', icon: 'cube' },
        { label: 'Rules Active', val: '120', pct: '↑ 8.0%', icon: 'bulb' },
        { label: 'Cleansed Rows', val: '2.4M', pct: '↑ 18.4%', icon: 'target' },
        { label: 'Security Score', val: '99.8%', pct: '↑ 0.1%', icon: 'check' },
      ],
      processSteps: [
        { step: '1. Semantic Schema Alignment', desc: 'Map fields to standard product ontology', badge: '100% compliant', icon: 'db' },
        { step: '2. Hallucination Guardrailing', desc: 'Validate agent decisions against physical ledgers', badge: '14 checks active', icon: 'model' },
        { step: '3. Concept Drift Auditing', desc: 'Monitor model weight and variance drift', badge: '120 active rules', icon: 'brain' },
        { step: '4. Policy Compliance Auditing', desc: 'Verify price changes against legal limits', badge: '20ms avg delay', icon: 'kpi' },
        { step: '5. Explainability Trace Logging', desc: 'Generate multi-agent Chain-of-Thought logs', badge: 'CoT Trace logged', icon: 'bulb' },
      ],
      insights: [
        { text: 'Semantic validation completed. Zero schema drift anomalies detected across active sources.', badge: 'Compliant', badgeColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', icon: 'check' },
        { text: 'Hallucination guardrail verified 11 ledger values during reasoning audits.', badge: 'Verified', badgeColor: 'text-purple-400 border-purple-500/20 bg-purple-500/5', icon: 'trend' },
      ],
      models: [
        { name: 'Drift Auditor', type: 'Semantic Drift', acc: '97.5%', run: '1 hr ago', status: 'Healthy' },
        { name: 'Guardrail Engine', type: 'Fact Verification', acc: '100.0%', run: 'Real-time', status: 'Healthy' },
        { name: 'Lineage Provenance', type: 'CoT Trace Logger', acc: '99.9%', run: '12 hrs ago', status: 'Healthy' },
      ],
      kpis: [
        { label: 'Guardrail Latency', val: '14ms', change: '↓ 3ms' },
        { label: 'Reasoning Trust Index', val: '98.5%', change: '↑ 1.2%' },
        { label: 'Provenance Depth', val: '18 hops', change: '↑ 2 hops' },
        { label: 'Compliance Index', val: '100%', change: '→ 0%' },
      ],
      recs: [
        { title: 'Re-align Semantic Schema', desc: 'Adjust ontology mapping for NetSuite Costing Agent connector', impact: 'Medium', val: '120ms', color: 'text-amber-400 border-amber-500/15 bg-amber-500/[0.02]' },
        { title: 'Update Guardrail Rules', desc: 'Increase variance thresholds on pricing check logs', impact: 'High', val: 'Rule 42', color: 'text-purple-400 border-purple-500/15 bg-purple-500/[0.02]' },
      ],
      flow: [
        { label: 'Semantic Scan', desc: 'Ingestion records checked for semantic ontology compliance' },
        { label: 'Fact Verification', desc: 'Agent outputs verified against transaction ledgers' },
        { label: 'Drift Auditing', desc: 'Concept drift checks run on model weights' },
        { label: 'Provenance Log', desc: 'Reasoning chain logged to explainability trace' },
        { label: 'Compliance Audit', desc: 'Logs verified for legal price bounds and published' },
      ],
    },
  };

  // Source-specific high fidelity data for Remediation & Action Swarm (Step 3)
  const diagnosticData = {
    diagnostic: {
      title: 'Remediation & Action Swarm Overview',
      subtitle: 'Swarm-detected portfolio anomalies, margin risks and opportunities',
      metrics: [
        { label: 'Total Diagnostics Run', val: '134', pct: '↑ 18.3%', icon: 'diag' },
        { label: 'Issues Detected', val: '17', pct: '↑ 21.4%', icon: 'alert' },
        { label: 'High Impact Issues', val: '5', pct: '↑ 25%', icon: 'target' },
        { label: 'Opportunities Identified', val: '12', pct: '↑ 33.3%', icon: 'opportunity' },
        { label: 'Resolution Rate', val: '82%', pct: '↑ 12.6%', icon: 'check' },
      ],
      severity: {
        total: 17,
        breakdown: [
          { label: 'Critical', val: 5, pct: 29, color: 'bg-red-500', text: 'text-red-500' },
          { label: 'High', val: 7, pct: 41, color: 'bg-orange-500', text: 'text-orange-500' },
          { label: 'Medium', val: 3, pct: 18, color: 'bg-yellow-400', text: 'text-yellow-500' },
          { label: 'Low', val: 2, pct: 12, color: 'bg-emerald-500', text: 'text-emerald-400' },
        ],
      },
      categories: [
        { label: 'Margin Erosion', val: 6, pct: 35, bg: 'bg-red-500' },
        { label: 'Demand Risk', val: 4, pct: 24, bg: 'bg-orange-500' },
        { label: 'COGS Inflation', val: 3, pct: 18, bg: 'bg-yellow-500' },
        { label: 'Price & Mix', val: 2, pct: 12, bg: 'bg-emerald-500' },
        { label: 'Policy Drift', val: 2, pct: 12, bg: 'bg-blue-500' },
      ],
      issues: [
        { name: 'Declining margin in 15 SKUs', desc: 'Margin erosion detected for SKUs in Energy Drink category', sev: 'Critical', sevColor: 'text-red-400 border-red-500/20 bg-red-500/5', impact: '$1.2M', time: '5 min ago', status: 'Open', statusColor: 'text-red-400' },
        { name: 'High complexity risk for 8 SKUs', desc: 'SKU sales volume below threshold limits', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', impact: '$780K', time: '15 min ago', status: 'Open', statusColor: 'text-red-400' },
        { name: 'Demand drop in 3 regions', desc: 'Co2 demand decline > 20%', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', impact: '$560K', time: '30 min ago', status: 'Open', statusColor: 'text-red-400' },
        { name: 'Stockout risk in 2 SKUs', desc: 'Projected stockout in next 14 days', sev: 'Medium', sevColor: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5', impact: '$320K', time: '45 min ago', status: 'Investigating', statusColor: 'text-sky-400' },
        { name: 'Data quality issue in sales data', desc: 'Missing values in key fields', sev: 'Low', sevColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', impact: '-', time: '1 hour ago', status: 'Resolved', statusColor: 'text-emerald-400' },
      ],
      impacts: [
        { label: 'Financial Impact', val: '$2.8M', tag: 'High', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Potential impact on profitability', icon: 'gear' },
        { label: 'Revenue Impact', val: '$4.1M', tag: 'High', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'At risk revenue over next 90 days', icon: 'list' },
        { label: 'Customer Impact', val: 'Medium', tag: 'Medium', tagColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5', desc: 'At risk customer satisfaction', icon: 'user' },
      ],
      recs: [
        { title: 'Optimize Pricing for 15 SKUs', tag: 'High Impact', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Increase price by 3-5% to recover margin.', val: '$1.2M', conf: 92 },
        { title: 'Rationalize 8 Low Performing SKUs', tag: 'High Impact', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Discontinue or consolidate low margin SKUs.', val: '$780K', conf: 88 },
        { title: 'Consolidate SKUs in 3 Categories', tag: 'Medium Impact', tagColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5', desc: 'Discontinue lowest 10% performance SKUs.', val: '$430K', conf: 75 },
        { title: 'Improve Forecasting Accuracy', tag: 'Medium Impact', tagColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5', desc: 'Enhance demand forecasting for at-risk regions.', val: '$320K', conf: 70 },
      ],
    },
    root: {
      title: 'Root Cause Reasoning Agent',
      subtitle: 'LLM-powered reasoning agent tracing anomaly causation links',
      metrics: [
        { label: 'Causes Identified', val: '24', pct: '↑ 12.0%', icon: 'diag' },
        { label: 'Core Factors', val: '3', pct: '→ 0.0%', icon: 'alert' },
        { label: 'Diagnostic Depth', val: '92%', pct: '↑ 5.1%', icon: 'target' },
        { label: 'Resolved Factors', val: '14', pct: '↑ 18.0%', icon: 'opportunity' },
        { label: 'Auto-Correlation & Assortment Agents', val: '180', pct: '↑ 24.2%', icon: 'check' },
      ],
      severity: {
        total: 24,
        breakdown: [
          { label: 'Critical', val: 8, pct: 33, color: 'bg-red-500', text: 'text-red-500' },
          { label: 'High', val: 10, pct: 42, color: 'bg-orange-500', text: 'text-orange-500' },
          { label: 'Medium', val: 4, pct: 17, color: 'bg-yellow-400', text: 'text-yellow-500' },
          { label: 'Low', val: 2, pct: 8, color: 'bg-emerald-500', text: 'text-emerald-400' },
        ],
      },
      categories: [
        { label: 'Material Cost inflation', val: 10, pct: 42, bg: 'bg-red-500' },
        { label: 'Ingredient Cost Spikes', val: 6, pct: 25, bg: 'bg-orange-500' },
        { label: 'Promotional Overspend', val: 4, pct: 17, bg: 'bg-yellow-500' },
        { label: 'Labor shortage', val: 2, pct: 8, bg: 'bg-emerald-500' },
        { label: 'Packaging fees', val: 2, pct: 8, bg: 'bg-blue-500' },
      ],
      issues: [
        { name: 'Supplier Price Surge', desc: 'Raw packaging cost increased by 14% at source', sev: 'Critical', sevColor: 'text-red-400 border-red-500/20 bg-red-500/5', impact: '$820k', time: '10 min ago', status: 'Open', statusColor: 'text-red-400' },
        { name: 'Sourcing Rate spikes on caps', desc: 'Supplier A raised base pricing on glass containers', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', impact: '$450k', time: '20 min ago', status: 'Open', statusColor: 'text-red-400' },
        { name: 'Trade spend variance', desc: 'Promotional discounts exceeded margin limits in West', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', impact: '$320k', time: '35 min ago', status: 'Open', statusColor: 'text-red-400' },
      ],
      impacts: [
        { label: 'Cost Index Delta', val: '+14%', tag: 'High', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Net impact on COGS baseline', icon: 'gear' },
        { label: 'Revenue Leakage', val: '$1.8M', tag: 'High', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'At risk turnover from logistics lag', icon: 'list' },
        { label: 'Sourcing Risk', val: 'Medium', tag: 'Medium', tagColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5', desc: 'Vendor delivery confidence decline', icon: 'user' },
      ],
      recs: [
        { title: 'Source alternate cap supplier', tag: 'High Impact', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Onboard pre-approved vendor B to hedge rates.', val: '$450K', conf: 90 },
        { title: 'Re-negotiate raw pricing contracts', tag: 'Medium Impact', tagColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5', desc: 'Contract bulk raw materials to lock in Q4 cost.', val: '$800K', conf: 82 },
      ],
    },
    impact: {
      title: 'Value Attribution Agent',
      subtitle: 'Quantitative agent attributing EBITDA and customer SLA risks',
      metrics: [
        { label: 'Financial Impact', val: '$2.8M', pct: '↑ 20.2%', icon: 'diag' },
        { label: 'Revenue Risk', val: '$4.1M', pct: '↑ 18.0%', icon: 'alert' },
        { label: 'Customer NPS impact', val: '-8 pts', pct: '↓ 50%', icon: 'target' },
        { label: 'EBITDA Pressure', val: '0.4%', pct: '↑ 12.0%', icon: 'opportunity' },
        { label: 'Sourcing Risk Index', val: 'Medium', pct: '→ 0%', icon: 'check' },
      ],
      severity: {
        total: 12,
        breakdown: [
          { label: 'Critical', val: 4, pct: 33, color: 'bg-red-500', text: 'text-red-500' },
          { label: 'High', val: 5, pct: 42, color: 'bg-orange-500', text: 'text-orange-500' },
          { label: 'Medium', val: 2, pct: 17, color: 'bg-yellow-400', text: 'text-yellow-500' },
          { label: 'Low', val: 1, pct: 8, color: 'bg-emerald-500', text: 'text-emerald-400' },
        ],
      },
      categories: [
        { label: 'Margin Erosion', val: 5, pct: 42, bg: 'bg-red-500' },
        { label: 'Demand Risk', val: 3, pct: 25, bg: 'bg-orange-500' },
        { label: 'COGS Variance', val: 2, pct: 17, bg: 'bg-yellow-500' },
        { label: 'Price & Mix', val: 1, pct: 8, bg: 'bg-emerald-500' },
        { label: 'Policy Drift', val: 1, pct: 8, bg: 'bg-blue-500' },
      ],
      issues: [
        { name: 'Margin leak in Energy segment', desc: 'COGS inflation overpassing wholesale adjustments', sev: 'Critical', sevColor: 'text-red-400 border-red-500/20 bg-red-500/5', impact: '$1.2M', time: '5 min ago', status: 'Open', statusColor: 'text-red-400' },
        { name: 'Product Listing penalties', desc: 'Compliance fines accrued from wrong labeling codes', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', impact: '$220k', time: '30 min ago', status: 'Open', statusColor: 'text-red-400' },
      ],
      impacts: [
        { label: 'Financial Impact', val: '$2.8M', tag: 'High', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Net profit impact across portfolio', icon: 'gear' },
        { label: 'Revenue Impact', val: '$4.1M', tag: 'High', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Gross revenue at risk next 90 days', icon: 'list' },
        { label: 'Customer Impact', val: 'Medium', tag: 'Medium', tagColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5', desc: 'NPS feedback on product quality', icon: 'user' },
      ],
      recs: [
        { title: 'Re-align pricing tier levels', tag: 'High Impact', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Deploy dynamic price adjustment schedules.', val: '$1.2M', conf: 92 },
        { title: 'Consolidate ingredient orders', tag: 'Medium Impact', tagColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5', desc: 'Utilize bulk contracts to bypass rate surges.', val: '$180K', conf: 76 },
      ],
    },
    scenario: {
      title: 'Scenario Simulator Agent',
      subtitle: 'Monte Carlo agent simulating volume and price elasticity outcomes',
      metrics: [
        { label: 'Simulations Run', val: '420', pct: '↑ 14.5%', icon: 'diag' },
        { label: 'Convergence Rate', val: '99.8%', pct: '↑ 0.1%', icon: 'alert' },
        { label: 'Confidence Interval', val: '95%', pct: '→ 0.0%', icon: 'target' },
        { label: 'Best Case ROI', val: '+$1.8M', pct: '↑ 10.0%', icon: 'opportunity' },
        { label: 'Worst Case Risk', val: '-$800k', pct: '↓ 15.0%', icon: 'check' },
      ],
      severity: {
        total: 8,
        breakdown: [
          { label: 'Critical', val: 2, pct: 25, color: 'bg-red-500', text: 'text-red-500' },
          { label: 'High', val: 3, pct: 37, color: 'bg-orange-500', text: 'text-orange-500' },
          { label: 'Medium', val: 2, pct: 25, color: 'bg-yellow-400', text: 'text-yellow-500' },
          { label: 'Low', val: 1, pct: 13, color: 'bg-emerald-500', text: 'text-emerald-400' },
        ],
      },
      categories: [
        { label: 'Price Elasticity Shifts', val: 3, pct: 37, bg: 'bg-red-500' },
        { label: 'Ingredient Rate Hikes', val: 2, pct: 25, bg: 'bg-orange-500' },
        { label: 'Promotion Swings', val: 2, pct: 25, bg: 'bg-yellow-500' },
        { label: 'Packaging Cost Hikes', val: 1, pct: 13, bg: 'bg-emerald-500' },
      ],
      issues: [
        { name: '10% Price Increase Run', desc: 'Predict response to price increases in beverage lines', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', impact: '+$840k', time: '1 hr ago', status: 'Completed', statusColor: 'text-emerald-400' },
        { name: 'Container rate spike simulation', desc: 'Predict impact of 15% increase in packaging costs', sev: 'Critical', sevColor: 'text-red-400 border-red-500/20 bg-red-500/5', impact: '-$620k', time: '2 hrs ago', status: 'Completed', statusColor: 'text-emerald-400' },
      ],
      impacts: [
        { label: 'Projected Net ROI', val: '+$1.2M', tag: 'High', tagColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', desc: 'Weighted average simulated outcome', icon: 'gear' },
        { label: 'Volume variance', val: '-3.2%', tag: 'Medium', tagColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5', desc: 'Simulated customer demand decrease', icon: 'list' },
        { label: 'NPS Risk', val: 'Low', tag: 'Low', tagColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', desc: 'Simulated quality complaint index', icon: 'user' },
      ],
      recs: [
        { title: 'Proceed with 4% price increase', tag: 'High Impact', tagColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', desc: 'Increases revenue without significant volume impact.', val: '$1.2M', conf: 92 },
        { title: 'Hedge container purchase rates', tag: 'Medium Impact', tagColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5', desc: 'Sign long-term glass container supply contracts.', val: '$450K', conf: 85 },
      ],
    },
    alerts: {
      title: 'Alerts & Anomaly Detection Agents Log',
      subtitle: 'Real-time threshold violation logs and pattern detections',
      metrics: [
        { label: 'Alerts Active', val: '17', pct: '↑ 21.4%', icon: 'diag' },
        { label: 'Auto Triaged', val: '85', pct: '↑ 32.1%', icon: 'alert' },
        { label: 'Mean Time to Detect', val: '14s', pct: '↓ 20.0%', icon: 'target' },
        { label: 'False Positives', val: '0.2%', pct: '↓ 50.0%', icon: 'opportunity' },
        { label: 'Active Rules', val: '420', pct: '↑ 8.0%', icon: 'check' },
      ],
      severity: {
        total: 17,
        breakdown: [
          { label: 'Critical', val: 5, pct: 29, color: 'bg-red-500', text: 'text-red-500' },
          { label: 'High', val: 7, pct: 41, color: 'bg-orange-500', text: 'text-orange-500' },
          { label: 'Medium', val: 3, pct: 18, color: 'bg-yellow-400', text: 'text-yellow-500' },
          { label: 'Low', val: 2, pct: 12, color: 'bg-emerald-500', text: 'text-emerald-400' },
        ],
      },
      categories: [
        { label: 'Margin Variance', val: 6, pct: 35, bg: 'bg-red-500' },
        { label: 'Complexity Outliers', val: 4, pct: 24, bg: 'bg-orange-500' },
        { label: 'Demand Drops', val: 3, pct: 18, bg: 'bg-yellow-500' },
        { label: 'Price deviations', val: 2, pct: 12, bg: 'bg-emerald-500' },
        { label: 'Reasoning Ambiguity', val: 2, pct: 12, bg: 'bg-blue-500' },
      ],
      issues: [
        { name: 'Critical Margin Slip in Segment A', desc: 'Wholesale unit price exceeded margin limits by 18%', sev: 'Critical', sevColor: 'text-red-400 border-red-500/20 bg-red-500/5', impact: '$320k', time: '12 min ago', status: 'Open', statusColor: 'text-red-400' },
        { name: 'Retailer A product delist', desc: 'Sales volumes fell below regional listing limits', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', impact: '$120k', time: '24 min ago', status: 'Open', statusColor: 'text-red-400' },
      ],
      impacts: [
        { label: 'Anomaly Count', val: '17 active', tag: 'High', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Outstanding active flags', icon: 'gear' },
        { label: 'Detection Speed', val: '14 seconds', tag: 'High', tagColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', desc: 'Mean detection cycle', icon: 'list' },
        { label: 'SLA Penalty Risk', val: '0.04%', tag: 'Low', tagColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', desc: 'Pricing elasticity variance index', icon: 'user' },
      ],
      recs: [
        { title: 'Investigate Segment A pricing logs', tag: 'High Impact', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Verify transaction parameters for model calibration.', val: 'Verify', conf: 95 },
        { title: 'Update return alert threshold', tag: 'Low Impact', tagColor: 'text-zinc-500 border-zinc-800 bg-zinc-900/40', desc: 'Increase floor limits by 5% during seasonal peaks.', val: 'Rule 18', conf: 99 },
      ],
    },
    recs: {
      title: 'Diagnostic Recommendations Panel',
      subtitle: 'Suggested actions compiled directly from active issues and root cause analysis',
      metrics: [
        { label: 'Recs online', val: '28', pct: '↑ 12.0%', icon: 'diag' },
        { label: 'Approved Mitigation Action Agent', val: '12', pct: '↑ 15.0%', icon: 'alert' },
        { label: 'Snoozed / Skipped', val: '4', pct: '↓ 50.0%', icon: 'target' },
        { label: 'Realized Gains', val: '$850k', pct: '↑ 42.1%', icon: 'opportunity' },
        { label: 'Confidence factor', val: '88%', pct: '↑ 2.1%', icon: 'check' },
      ],
      severity: {
        total: 28,
        breakdown: [
          { label: 'Critical', val: 8, pct: 28, color: 'bg-red-500', text: 'text-red-500' },
          { label: 'High', val: 12, pct: 43, color: 'bg-orange-500', text: 'text-orange-500' },
          { label: 'Medium', val: 5, pct: 18, color: 'bg-yellow-400', text: 'text-yellow-500' },
          { label: 'Low', val: 3, pct: 11, color: 'bg-emerald-500', text: 'text-emerald-400' },
        ],
      },
      categories: [
        { label: 'Price Optimizations', val: 12, pct: 43, bg: 'bg-red-500' },
        { label: 'SKU rationalizations', val: 8, pct: 28, bg: 'bg-orange-500' },
        { label: 'Complexity Promos', val: 5, pct: 18, bg: 'bg-yellow-500' },
        { label: 'Forecasting tuning', val: 3, pct: 11, bg: 'bg-emerald-500' },
      ],
      issues: [
        { name: 'Pricing adjustment for overlap SKU', desc: 'Align prices with competitor changes in segment B', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', impact: '$1.2M', time: '1 hr ago', status: 'Pending', statusColor: 'text-amber-500' },
        { name: 'Fringe SKU sunset action', desc: 'Discontinue 4 lowest performing SKUs in category D', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', impact: '$450K', time: '2 hrs ago', status: 'Pending', statusColor: 'text-amber-500' },
      ],
      impacts: [
        { label: 'Average Return Index', val: '+8.4%', tag: 'High', tagColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', desc: 'Simulated portfolio ROI recovery rate', icon: 'gear' },
        { label: 'Realized Gains', val: '$850k', tag: 'High', tagColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', desc: 'Gains confirmed from committed actions', icon: 'list' },
        { label: 'Implementation SLA', val: '3 hrs', tag: 'Medium', tagColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5', desc: 'Average time from approval to ERP writeback', icon: 'user' },
      ],
      recs: [
        { title: 'Confirm overlap pricing change', tag: 'High Impact', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5', desc: 'Submit approved pricing variables to ERP database.', val: '$1.2M', conf: 92 },
        { title: 'Archive duplicate products', tag: 'Medium Impact', tagColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5', desc: 'Consolidate 3 listings to clean category B.', val: '$220K', conf: 84 },
      ],
    },
  };

  const currentTab = tabData[activeSourceTab];
  const currentCompute = computeData[activeComputeTab];
  const currentDiagnostic = diagnosticData[activeDiagnosticTab];

  return (
    <div className={`fixed inset-0 backdrop-blur-md z-[120] flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'bg-black/85' : 'bg-slate-900/40'}`}>
      <div className={`w-full max-w-5xl p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-5 text-xs max-h-[95vh] overflow-y-auto font-sans animate-fade-in bg-[#121218] border border-purple-500/15 text-zinc-300 ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fadeIn 0.2s ease-out forwards;
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 12s linear infinite;
          }

          /* Light Mode Custom Styling Overrides */
          .light-mode.bg-\\[\\#121218\\], .light-mode .bg-\\[\\#121218\\] { background-color: #ffffff !important; }
          .light-mode.text-zinc-300, .light-mode .text-zinc-300 { color: #374151 !important; }
          .light-mode.border-purple-500\\/15, .light-mode .border-purple-500\\/15 { border-color: rgba(147, 51, 234, 0.25) !important; }

          .light-mode .bg-\\[\\#16151c\\] { background-color: #f9fafb !important; }
          .light-mode .bg-\\[\\#1a1921\\] { background-color: #f3f4f6 !important; }
          .light-mode .bg-\\[\\#1e1c26\\] { background-color: #f5f3ff !important; border-color: #c084fc !important; }
          .light-mode .bg-\\[\\#25183a\\]\\/65 { background-color: rgba(243, 232, 255, 0.65) !important; }
          .light-mode .bg-\\[\\#0f0e13\\] { background-color: #f9fafb !important; }
          .light-mode .bg-\\[\\#0a0a0f\\] { background-color: #f3f4f6 !important; }
          .light-mode .bg-\\[\\#0b0a0f\\] { background-color: #f9fafb !important; }
          .light-mode .bg-\\[\\#0d0d12\\] { background-color: #f9fafb !important; }
          .light-mode .bg-\\[\\#0d0d12\\]\\/30 { background-color: rgba(243, 244, 246, 0.3) !important; }
          .light-mode .bg-\\[\\#121217\\] { background-color: #ffffff !important; }
          .light-mode .bg-\\[\\#171720\\] { background-color: #ffffff !important; }
          .light-mode .bg-\\[\\#181822\\] { background-color: #ffffff !important; }
          .light-mode .bg-\\[\\#120d20\\] { background-color: #f5f3ff !important; }
          
          .light-mode .bg-zinc-800 { background-color: #f3f4f6 !important; }
          .light-mode .bg-zinc-900 { background-color: #e5e7eb !important; }
          .light-mode .bg-zinc-900\\/30 { background-color: rgba(229, 231, 235, 0.3) !important; }
          .light-mode .bg-zinc-900\\/40 { background-color: rgba(229, 231, 235, 0.4) !important; }
          .light-mode .bg-zinc-900\\/50 { background-color: rgba(229, 231, 235, 0.5) !important; }
          .light-mode .bg-zinc-950\\/20 { background-color: rgba(209, 213, 219, 0.2) !important; }
          .light-mode .bg-zinc-950\\/30 { background-color: rgba(209, 213, 219, 0.3) !important; }

          .light-mode .hover\\:bg-\\[\\#1a1921\\]:hover { background-color: #e5e7eb !important; }
          .light-mode .hover\\:bg-\\[\\#7c3aed\\]:hover { background-color: #6d28d9 !important; }
          .light-mode .hover\\:bg-zinc-800:hover { background-color: #e5e7eb !important; }
          .light-mode .hover\\:bg-zinc-900:hover { background-color: #e5e7eb !important; }
          .light-mode .hover\\:bg-zinc-900\\/30:hover { background-color: rgba(229, 231, 235, 0.3) !important; }

          .light-mode .text-white { color: #111827 !important; }
          .light-mode .text-zinc-200 { color: #1f2937 !important; }
          .light-mode .text-zinc-400 { color: #4b5563 !important; }
          .light-mode .text-zinc-400 { color: #4b5563 !important; }
          .light-mode .text-zinc-500 { color: #4b5563 !important; }
          .light-mode .text-zinc-500 { color: #4b5563 !important; }
          .light-mode .text-zinc-500 { color: #6b7280 !important; }
          .light-mode .text-zinc-600 { color: #6b7280 !important; }
          .light-mode .text-zinc-600 { color: #6b7280 !important; }
          .light-mode .text-zinc-700 { color: #6b7280 !important; }
          .light-mode .text-zinc-700 { color: #374151 !important; }
          .light-mode .text-zinc-800 { color: #9ca3af !important; }
          .light-mode .text-zinc-900 { color: #111827 !important; }

          .light-mode .text-purple-200 { color: #6d28d9 !important; }
          .light-mode .text-purple-300 { color: #5b21b6 !important; }
          .light-mode .text-purple-400 { color: #7c3aed !important; }
          .light-mode .text-purple-400\\/80 { color: rgba(124, 58, 237, 0.8) !important; }
          .light-mode .text-purple-500 { color: #6d28d9 !important; }
          .light-mode .text-purple-500\\/80 { color: rgba(109, 40, 217, 0.8) !important; }

          .light-mode .hover\\:text-white:hover { color: #111827 !important; }
          .light-mode .hover\\:text-zinc-200:hover { color: #1f2937 !important; }

          .light-mode .border-zinc-700 { border-color: #d1d5db !important; }
          .light-mode .border-zinc-800 { border-color: #e5e7eb !important; }
          .light-mode .border-zinc-800 { border-color: #e5e7eb !important; }
          .light-mode .border-zinc-800\\/40 { border-color: rgba(229, 231, 235, 0.4) !important; }
          .light-mode .border-zinc-800\\/80 { border-color: rgba(229, 231, 235, 0.8) !important; }
          .light-mode .border-zinc-900 { border-color: #e5e7eb !important; }
          .light-mode .border-zinc-900\\/40 { border-color: rgba(229, 231, 235, 0.4) !important; }
          .light-mode .border-zinc-900\\/50 { border-color: rgba(229, 231, 235, 0.5) !important; }
          .light-mode .border-zinc-900\\/60 { border-color: rgba(229, 231, 235, 0.6) !important; }
          .light-mode .border-zinc-900\\/80 { border-color: rgba(229, 231, 235, 0.8) !important; }
          .light-mode .border-purple-500\\/10 { border-color: rgba(168, 85, 247, 0.2) !important; }
          .light-mode .border-purple-500\\/15 { border-color: rgba(168, 85, 247, 0.25) !important; }
          .light-mode .border-purple-500\\/20 { border-color: rgba(168, 85, 247, 0.3) !important; }
          .light-mode .border-purple-500\\/25 { border-color: rgba(168, 85, 247, 0.35) !important; }
          .light-mode .border-purple-500\\/30 { border-color: rgba(168, 85, 247, 0.4) !important; }
          .light-mode .border-purple-500\\/35 { border-color: rgba(168, 85, 247, 0.45) !important; }
          .light-mode .border-purple-500\\/80 { border-color: rgba(168, 85, 247, 0.8) !important; }
          .light-mode .border-purple-500 { border-color: #8b5cf6 !important; }

          .light-mode .hover\\:border-purple-500\\/35:hover { border-color: rgba(168, 85, 247, 0.5) !important; }
          .light-mode .hover\\:border-zinc-700:hover { border-color: #9ca3af !important; }
          .light-mode .hover\\:border-zinc-800:hover { border-color: #d1d5db !important; }

          .light-mode .divide-zinc-900\\/40 > * + * { border-color: rgba(229, 231, 235, 0.5) !important; }
        `}</style>

        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3.5">
          <div className="space-y-0.5">
            <h2 className="text-[13px] font-bold tracking-wider uppercase text-white font-mono">
              Product Lifecycle & Portfolio Intelligence • Agentic Swarm Diagnostic Flowchart
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[7.5px] font-sans font-black bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded border border-purple-500/20 uppercase tracking-widest">
              Workflow View
            </span>
            <button 
              type="button"
              onClick={onClose}
              className="p-1 rounded cursor-pointer border-none bg-transparent outline-none transition-colors hover:bg-zinc-800 text-zinc-500 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* GENERAL FLOWCHART SECTION */}
        <div className="space-y-4">
          <h3 className="text-[8.5px] uppercase tracking-widest text-zinc-500 font-extrabold font-mono">General Flowchart</h3>
          
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-3 w-full">
            
            {/* Step 1 Card: Agentic Data Ingestion */}
            <div 
              onClick={() => setActiveStepIndex(0)}
              className={`flex-1 border p-4.5 rounded-xl flex flex-col gap-3.5 cursor-pointer transition-all duration-200 select-none ${
                activeStepIndex === 0 
                  ? 'border-purple-500 bg-[#1e1c26] shadow-[0_0_20px_rgba(168,85,247,0.18)]' 
                  : 'border-zinc-800/80 bg-[#16151c] hover:border-purple-500/35 hover:bg-[#1a1921]'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center gap-1.5 border border-purple-500/30 bg-[#25183a]/65 px-2.5 py-1 rounded text-[8.5px] font-black uppercase text-purple-300 w-fit select-none">
                <svg className="w-2.5 h-2.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22c5.523 0 10-2.239 10-5s-4.477-5-10-5-10 2.239-10 5 4.477 5 10 5Z" />
                  <path d="M22 12c0 2.761-4.477 5-10 5S2 14.761 2 12" />
                  <path d="M22 7c0 2.761-4.477 5-10 5S2 9.761 2 7" />
                </svg>
                <span>Ingestion Agent</span>
              </div>
              
              {/* Heading */}
              <h4 className="font-bold text-[14px] text-white tracking-wide">Agentic Data Ingestion</h4>
              
              {/* 2x2 Sub-items */}
              <div className="grid grid-cols-2 gap-2 mt-0.5">
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Finance Auditor Agent</span>
                </div>
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="8" x="2" y="3" rx="2" />
                    <rect width="20" height="8" x="2" y="13" rx="2" />
                    <line x1="6" y1="7" x2="6.01" y2="7" />
                    <line x1="6" y1="17" x2="6.01" y2="17" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Client Insights Agent</span>
                </div>
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20" />
                    <path d="M17 5H7" />
                    <path d="M19 9H5" />
                    <path d="M15 13H9" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Operations Telemetry Agent</span>
                </div>
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <div className="h-4 flex items-center">
                    <span className="text-[7.5px] font-mono font-black text-purple-400 uppercase tracking-wider bg-purple-500/10 px-1 py-0.2 rounded border border-purple-500/20">API</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-zinc-300">Market Scraper Agent</span>
                </div>
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:flex flex-shrink-0 text-zinc-700 select-none items-center justify-center px-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Step 2 Card: Analysis & Modeling Swarm */}
            <div 
              onClick={() => setActiveStepIndex(1)}
              className={`flex-1 border p-4.5 rounded-xl flex flex-col gap-3.5 cursor-pointer transition-all duration-200 select-none ${
                activeStepIndex === 1 
                  ? 'border-purple-500 bg-[#1e1c26] shadow-[0_0_20px_rgba(168,85,247,0.18)]' 
                  : 'border-zinc-800/80 bg-[#16151c] hover:border-purple-500/35 hover:bg-[#1a1921]'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center gap-1.5 border border-purple-500/30 bg-[#25183a]/65 px-2.5 py-1 rounded text-[8.5px] font-black uppercase text-purple-300 w-fit select-none">
                <svg className="w-2.5 h-2.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                  <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
                </svg>
                <span>Compute Agents</span>
              </div>
              
              {/* Heading */}
              <h4 className="font-bold text-[14px] text-white tracking-wide">Analysis & Modeling Swarm</h4>
              
              {/* 2x2 Sub-items */}
              <div className="grid grid-cols-2 gap-2 mt-0.5">
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="3" />
                    <circle cx="5" cy="19" r="3" />
                    <circle cx="19" cy="19" r="3" />
                    <path d="M12 8v8M7 17l3-1.5M17 17l-3-1.5" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Analysis & Modeling Swarm</span>
                </div>
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 17V9M15 17v-4" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Visualization & Report Agent</span>
                </div>
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 6.18a5 5 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M18 16a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v5" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Orchestration & Workflow Agent</span>
                </div>
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Governance & Cleansing Agent</span>
                </div>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:flex flex-shrink-0 text-zinc-700 select-none items-center justify-center px-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Step 3 Card: Remediation & Action Swarm */}
            <div 
              onClick={() => setActiveStepIndex(2)}
              className={`flex-1 border p-4.5 rounded-xl flex flex-col gap-3.5 cursor-pointer transition-all duration-200 select-none ${
                activeStepIndex === 2 
                  ? 'border-purple-500 bg-[#1e1c26] shadow-[0_0_20px_rgba(168,85,247,0.18)]' 
                  : 'border-zinc-800/80 bg-[#16151c] hover:border-purple-500/35 hover:bg-[#1a1921]'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center gap-1.5 border border-purple-500/30 bg-[#25183a]/65 px-2.5 py-1 rounded text-[8.5px] font-black uppercase text-purple-300 w-fit select-none">
                <svg className="w-2.5 h-2.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Alert Swarm</span>
              </div>
              
              {/* Heading */}
              <h4 className="font-bold text-[14px] text-white tracking-wide">Remediation & Action Swarm</h4>
              
              {/* 2x2 Sub-items */}
              <div className="grid grid-cols-2 gap-2 mt-0.5">
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Alerts Dispatcher Agent</span>
                </div>
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
                    <path d="M18 8h4v4h-4z" />
                    <path d="M14 12h4" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Root Cause Reasoning Agent</span>
                </div>
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 17V9M15 17v-4" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Value Attribution Agent</span>
                </div>
                <div className="bg-[#0f0e13] border border-zinc-900/60 p-2.5 rounded-lg flex flex-col justify-between items-start min-h-[60px]">
                  <svg className="text-purple-400 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22c5.523 0 10-2.239 10-5s-4.477-5-10-5-10 2.239-10 5 4.477 5 10 5Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span className="text-[9.5px] font-bold text-zinc-300">Mitigation Proposal Agent</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DEEP-DIVE SECTION */}
        <div className="space-y-3 pt-4 border-t border-zinc-800/80 mt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[8.5px] uppercase tracking-widest text-zinc-500 font-extrabold font-mono">Deep-Dive</h3>
            {activeStepIndex !== null && (
              <span className="text-[7px] font-sans font-bold bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded border border-purple-500/15 uppercase">
                Interactive Detail
              </span>
            )}
          </div>
          
          {activeStepIndex === null ? (
            <div className="flex flex-col items-center justify-center py-14 border border-dashed border-zinc-800/80 rounded-xl bg-zinc-950/20 text-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center animate-pulse">
                <Sparkles size={14} />
              </div>
              <span className="font-bold text-[10px] text-zinc-300 uppercase tracking-wider font-mono">Select a flowchart block</span>
              <p className="text-[8.5px] text-zinc-500 max-w-sm font-medium leading-relaxed">
                Click on Agentic Data Ingestion (Step 1), Analysis & Modeling Swarm (Step 2), or Remediation & Action Swarm (Step 3) above to view its specific deep-dive metrics.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in w-full">
              
              {/* Step 1 Deep Dive: High Fidelity Source Selector & Dashboard */}
              {activeStepIndex === 0 && (
                <div className="flex flex-col lg:flex-row gap-4 w-full mt-1 animate-fade-in">
                  
                  {/* Left Column (Source selector Menu) */}
                  <div className="w-full lg:w-[250px] flex-shrink-0 border border-purple-500/10 rounded-2xl p-4.5 bg-[#0a0a0f] flex flex-col justify-between gap-5">
                    <div className="flex flex-col gap-4">
                      {/* Badge & Title */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 border border-purple-500/30 bg-[#25183a]/65 px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase text-purple-300 w-fit select-none">
                          <svg className="w-2.5 h-2.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 22c5.523 0 10-2.239 10-5s-4.477-5-10-5-10 2.239-10 5 4.477 5 10 5Z" />
                            <path d="M22 12c0 2.761-4.477 5-10 5S2 14.761 2 12" />
                            <path d="M22 7c0 2.761-4.477 5-10 5S2 9.761 2 7" />
                          </svg>
                          <span>INGEST</span>
                        </div>
                        <h4 className="text-[17px] font-semibold text-white tracking-tight leading-tight">Agentic Data Ingestion</h4>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Connect and ingest data from multiple sources to power AI-driven portfolio insights.
                        </p>
                      </div>

                      {/* Source buttons list */}
                      <div className="flex flex-col gap-2.5 mt-2">
                        {/* Finance Auditor Agent */}
                        <button
                          type="button"
                          onClick={() => setActiveSourceTab('finance')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeSourceTab === 'finance'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeSourceTab === 'finance' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Finance Auditor Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">ERP, GL, P&L, Formulations...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Client Insights Agent */}
                        <button
                          type="button"
                          onClick={() => setActiveSourceTab('crm')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeSourceTab === 'crm'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeSourceTab === 'crm' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="20" height="8" x="2" y="3" rx="2" />
                              <rect width="20" height="8" x="2" y="13" rx="2" />
                              <line x1="6" y1="7" x2="6.01" y2="7" />
                              <line x1="6" y1="17" x2="6.01" y2="17" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Client Insights Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Customers, Orders, Pipeline...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Operations Telemetry Agent */}
                        <button
                          type="button"
                          onClick={() => setActiveSourceTab('iot')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeSourceTab === 'iot'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeSourceTab === 'iot' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v20" />
                              <path d="M17 5H7" />
                              <path d="M19 9H5" />
                              <path d="M15 13H9" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Operations Telemetry Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Production, Machines, Quality...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Market Scraper Agent */}
                        <button
                          type="button"
                          onClick={() => setActiveSourceTab('api')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeSourceTab === 'api'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className={`text-[7px] font-mono font-black uppercase tracking-wider px-1 py-0.2 rounded border ${
                              activeSourceTab === 'api' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' : 'text-zinc-500 border-zinc-800 bg-zinc-900/50'
                            }`}>API</span>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Market Scraper Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Market, Competitor, Retail...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="border-t border-zinc-900 pt-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[9px]">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <svg className="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                            <path d="M12 12v9" />
                            <path d="m8 17 4 4 4-4" />
                          </svg>
                          <span>Overall Ingestion Status</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-400 font-bold text-[8.5px]">Operational</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[8px] text-zinc-500">
                        <span>Last Sync</span>
                        <span>{currentTab.quality.sync}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Dynamic content display panel) */}
                  <div className="flex-1 min-w-0 border border-zinc-800/80 rounded-2xl p-5.5 bg-[#0b0a0f] flex flex-col gap-4.5 justify-between">
                    
                    {/* Panel Header */}
                    <div className="flex justify-between items-start border-b border-zinc-900/60 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                          {activeSourceTab === 'finance' && (
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          )}
                          {activeSourceTab === 'crm' && (
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="20" height="8" x="2" y="3" rx="2" />
                              <rect width="20" height="8" x="2" y="13" rx="2" />
                              <line x1="6" y1="7" x2="6.01" y2="7" />
                              <line x1="6" y1="17" x2="6.01" y2="17" />
                            </svg>
                          )}
                          {activeSourceTab === 'iot' && (
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v20" />
                              <path d="M17 5H7" />
                              <path d="M19 9H5" />
                              <path d="M15 13H9" />
                            </svg>
                          )}
                          {activeSourceTab === 'api' && (
                            <span className="text-[9px] font-black font-mono">API</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h5 className="text-[14px] font-bold text-white tracking-wide">{currentTab.title}</h5>
                          <span className="text-[9.5px] text-zinc-500">{currentTab.subtitle}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStepIndex(null)}
                        className="p-1 rounded cursor-pointer border-none bg-transparent outline-none transition-colors hover:bg-zinc-900 text-zinc-700 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Top Row Cards: Connected Agent Data Sources, Data Ingested, Data Quality */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      {/* Card 1: Connected Agent Data Sources */}
                      <div className="bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col gap-3.5">
                        <span className="text-[8.5px] font-black uppercase text-zinc-500 tracking-wider">Connected Agent Data Sources</span>
                        <div className="flex flex-col gap-2">
                          {currentTab.systems.map((sys, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className={`${sys.badgeBg} text-[8px] font-black text-white px-1.5 py-0.5 rounded mr-2 uppercase tracking-wide`}>
                                  {sys.badge}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-300">{sys.name}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[8.5px] text-emerald-400 font-bold">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <span>Connected</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 2: Data Being Ingested */}
                      <div className="bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col gap-3.5">
                        <span className="text-[8.5px] font-black uppercase text-zinc-500 tracking-wider">Data Being Ingested</span>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                          {currentTab.dataIngested.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <svg className="w-3 h-3 text-purple-400/80 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <path d="M3 9h18M3 15h18" />
                              </svg>
                              <span className="text-[9.5px] font-bold text-zinc-300 leading-none">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 3: Data Quality */}
                      <div className="bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col gap-3">
                        <span className="text-[8.5px] font-black uppercase text-zinc-500 tracking-wider">Data Quality</span>
                        <div className="flex items-center justify-between gap-3">
                          {/* Circle progress ring SVG */}
                          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <circle className="text-zinc-900" strokeWidth="2.5" stroke="currentColor" fill="none" r="16" cx="18" cy="18" />
                              <circle className="text-emerald-400" strokeWidth="2.5" strokeDasharray="100" strokeDashoffset={100 - currentTab.quality.pct} strokeLinecap="round" stroke="currentColor" fill="none" r="16" cx="18" cy="18" />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                              <span className="text-[9px] font-black text-white leading-none">{currentTab.quality.pct}%</span>
                              <span className="text-[5.5px] text-zinc-500 font-extrabold uppercase tracking-wide mt-0.5">Quality</span>
                            </div>
                          </div>

                          {/* Data Quality details */}
                          <div className="flex-1 flex flex-col gap-0.5 text-[8.5px] text-zinc-400">
                            <div className="flex justify-between border-b border-zinc-900 pb-0.5">
                              <span>Completeness</span>
                              <span className="font-bold text-white">{currentTab.quality.completeness}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-900 pb-0.5">
                              <span>Accuracy</span>
                              <span className="font-bold text-white">{currentTab.quality.accuracy}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-900 pb-0.5">
                              <span>Freshness</span>
                              <span className="font-bold text-white">{currentTab.quality.freshness}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Records</span>
                              <span className="font-bold text-white">{currentTab.quality.records}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Middle Row: AI Insight & Business Outcomes Enabled */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      {/* Card 4: AI Insight */}
                      <div className="bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col gap-3">
                        <span className="text-[8.5px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                          <Sparkles size={9} className="text-purple-400" />
                          <span>AI Insight</span>
                        </span>
                        
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            {currentTab.insight.bullets.map((bullet, idx) => {
                              const parts = bullet.split(/(\$[0-9\.]+[M|k]|\d+\s*SKUs|\d+\%)/g);
                              return (
                                <p key={idx} className="text-[9.5px] text-zinc-300 leading-normal">
                                  {parts.map((p, i) => {
                                    if (p.match(/(\$[0-9\.]+[M|k]|\d+\s*SKUs|\d+\%)/)) {
                                      return <strong key={i} className="text-purple-400 font-extrabold">{p}</strong>;
                                    }
                                    return p;
                                  })}
                                </p>
                              );
                            })}
                          </div>
                          {/* Brain SVG Illustration */}
                          <div className="flex-shrink-0 self-center">
                            <svg className="w-20 h-16 text-purple-500/80" viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M50 25c-8-6-20-4-24 5-3 5-2 12 3 15-4 5-3 12 2 15 5 3 11 1 14-2v-5c0-1.5.5-3 1.5-4l3.5-3.5 3.5 3.5c1 1 1.5 2.5 1.5 4v5c3 3 9 5 14 2 5-3 6-10 2-15 5-3 6-10 3-15-4-9-16-11-24-5Z" strokeDasharray="1.5 1.5" />
                              <circle cx="38" cy="35" r="2.5" fill="#8b5cf6" stroke="none" />
                              <circle cx="45" cy="45" r="2.5" fill="#a855f7" stroke="none" />
                              <circle cx="55" cy="45" r="2.5" fill="#a855f7" stroke="none" />
                              <circle cx="62" cy="35" r="2.5" fill="#8b5cf6" stroke="none" />
                              <path d="M38 35l7 10M62 35l-7 10M45 45h10" strokeWidth="1" stroke="currentColor" opacity="0.6" />
                              <rect x="75" y="45" width="4" height="20" rx="1.2" fill="#8b5cf6" stroke="none" />
                              <rect x="82" y="35" width="4" height="30" rx="1.2" fill="#a855f7" stroke="none" />
                              <rect x="89" y="25" width="4" height="40" rx="1.2" fill="#c084fc" stroke="none" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Card 5: Business Outcomes Enabled */}
                      <div className="bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col gap-3">
                        <span className="text-[8.5px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                          <svg className="w-2.5 h-2.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="6" />
                            <circle cx="12" cy="12" r="2" />
                          </svg>
                          <span>Business Outcomes Enabled</span>
                        </span>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            {currentTab.outcomes.map((outcome, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-[8px] font-black">
                                  ✓
                                </div>
                                <span className="text-[9.5px] font-bold text-zinc-300">{outcome}</span>
                              </div>
                            ))}
                          </div>
                          {/* Rising Chart SVG Illustration */}
                          <div className="flex-shrink-0 self-center">
                            <svg className="w-20 h-16 text-purple-500/80" viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="15" y="55" width="8" height="15" rx="1.5" fill="#6366f1" opacity="0.6" stroke="none" />
                              <rect x="30" y="45" width="8" height="25" rx="1.5" fill="#8b5cf6" opacity="0.8" stroke="none" />
                              <rect x="45" y="30" width="8" height="40" rx="1.5" fill="#a855f7" stroke="none" />
                              <rect x="60" y="15" width="8" height="55" rx="1.5" fill="#c084fc" stroke="none" />
                              <path d="M10 70L65 20" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                              <path d="M52 20h13v13" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Section: Swarm Reasoning Flow */}
                    <div className="bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9.5px] font-bold text-white tracking-wide">Swarm Reasoning Flow</span>
                        <span className="text-[8px] text-zinc-500 font-medium">From raw data ingestion to automated portfolio actions</span>
                      </div>

                      {/* Horizontal Process flow cards */}
                      <div className="flex flex-col md:flex-row items-center gap-2.5 w-full mt-1">
                        {currentTab.flow.map((flowItem, idx) => {
                          const isLast = idx === currentTab.flow.length - 1;
                          return (
                            <React.Fragment key={idx}>
                              {/* Flow block card */}
                              <div className={`flex-1 border p-3 rounded-lg flex flex-col gap-1 w-full min-h-[70px] ${
                                isLast
                                  ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                                  : 'border-zinc-900 bg-[#0f0e13]'
                              }`}>
                                <div className="flex items-center gap-1.5">
                                  {idx === 0 && (
                                    <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect width="20" height="8" x="2" y="3" rx="2" />
                                      <rect width="20" height="8" x="2" y="13" rx="2" />
                                      <line x1="6" y1="7" x2="6.01" y2="7" />
                                      <line x1="6" y1="17" x2="6.01" y2="17" />
                                    </svg>
                                  )}
                                  {idx === 1 && (
                                    <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M12 22c5.523 0 10-2.239 10-5s-4.477-5-10-5-10 2.239-10 5 4.477 5 10 5Z" />
                                      <path d="M22 12c0 2.761-4.477 5-10 5S2 14.761 2 12" />
                                    </svg>
                                  )}
                                  {idx === 2 && (
                                    <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M12 22c5.523 0 10-2.239 10-5s-4.477-5-10-5-10 2.239-10 5 4.477 5 10 5Z" />
                                      <circle cx="12" cy="12" r="3" />
                                    </svg>
                                  )}
                                  {idx === 3 && (
                                    <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M3 12h3l3-9 4 18 3-12h5" />
                                    </svg>
                                  )}
                                  {idx === 4 && (
                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[8px] font-black">
                                      ✓
                                    </div>
                                  )}
                                  <span className={`text-[9.5px] font-bold ${isLast ? 'text-emerald-400' : 'text-zinc-200'}`}>{flowItem.label}</span>
                                </div>
                                
                                {idx < 4 ? (
                                  <p className="text-[8px] text-zinc-500 font-medium leading-relaxed mt-0.5">{flowItem.desc}</p>
                                ) : (
                                  <div className="flex flex-col text-[8px] font-black tracking-wide gap-0.5 mt-1 leading-none">
                                    {flowItem.desc.split(',').map((rec, rIdx) => {
                                      const text = rec.trim();
                                      let color = 'text-zinc-400';
                                      if (text.includes('Discontinue')) color = 'text-red-400';
                                      else if (text.includes('Expand')) color = 'text-emerald-400';
                                      else if (text.includes('Optimize')) color = 'text-amber-400';
                                      return <span key={rIdx} className={color}>{text}</span>;
                                    })}
                                  </div>
                                )}
                              </div>

                              {!isLast && (
                                <div className="text-zinc-700 select-none hidden md:block">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ingestion Footer actions */}
                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-3 mt-0.5 text-[8.5px]">
                      <div className="flex items-center gap-1.5 text-zinc-500 font-semibold font-mono">
                        <svg className="w-3.5 h-3.5 text-zinc-700 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        <span>Auto Refresh: <span className="text-emerald-400 font-extrabold">ON</span></span>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* Step 2 Deep Dive: High Fidelity Analysis & Modeling Swarm Selector & Dashboard */}
              {activeStepIndex === 1 && (
                <div className="flex flex-col lg:flex-row gap-4 w-full mt-1 animate-fade-in text-zinc-400">
                  
                  {/* Left Column (Compute tab selector Menu) */}
                  <div className="w-full lg:w-[250px] flex-shrink-0 border border-purple-500/10 rounded-2xl p-4.5 bg-[#0a0a0f] flex flex-col justify-between gap-5">
                    <div className="flex flex-col gap-4">
                      {/* Badge & Title */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 border border-purple-500/30 bg-[#25183a]/65 px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase text-purple-300 w-fit select-none">
                          <svg className="w-2.5 h-2.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                            <rect x="9" y="9" width="6" height="6" rx="1" />
                            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
                          </svg>
                          <span>COMPUTE</span>
                        </div>
                        <h4 className="text-[17px] font-semibold text-white tracking-tight leading-tight font-serif">Analysis & Modeling Swarm</h4>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Transform ingested data into actionable insights using AI-powered analytics.
                        </p>
                      </div>

                      {/* Compute Menu Buttons */}
                      <div className="flex flex-col gap-2.5 mt-2">
                        {/* Process & Analysis */}
                        <button
                          type="button"
                          onClick={() => setActiveComputeTab('process')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeComputeTab === 'process'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeComputeTab === 'process' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="5" r="3" />
                              <circle cx="5" cy="19" r="3" />
                              <circle cx="19" cy="19" r="3" />
                              <path d="M12 8v8M7 17l3-1.5M17 17l-3-1.5" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Analysis & Modeling Swarm</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Data modeling, AI/ML, KPIs...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Visualization & Reporting */}
                        <button
                          type="button"
                          onClick={() => setActiveComputeTab('vis')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeComputeTab === 'vis'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeComputeTab === 'vis' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="M9 17V9M15 17v-4" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Visualization & Report Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Dashboards, reports, alerts...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Recommendations */}
                        <button
                          type="button"
                          onClick={() => setActiveComputeTab('recs')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeComputeTab === 'recs'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeComputeTab === 'recs' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 22c5.523 0 10-2.239 10-5s-4.477-5-10-5-10 2.239-10 5 4.477 5 10 5Z" />
                              <path d="m9 12 2 2 4-4" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">AI Recommendation Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">AI-driven actions, next steps...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Collaboration & Workflow */}
                        <button
                          type="button"
                          onClick={() => setActiveComputeTab('collab')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeComputeTab === 'collab'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeComputeTab === 'collab' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 6.18a5 5 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M18 16a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v5" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Orchestration & Workflow Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Tasks, approvals, workflow...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Data Quality & Governance */}
                        <button
                          type="button"
                          onClick={() => setActiveComputeTab('gov')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeComputeTab === 'gov'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeComputeTab === 'gov' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Governance & Cleansing Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Validation, compliance, rules...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="border-t border-zinc-900 pt-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[9px]">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <svg className="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          <span>Overall Pipeline Status</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8.5px] text-emerald-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Healthy</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[8px] text-zinc-500">
                        <span>Records Processed</span>
                        <span className="text-white font-bold">2.4M</span>
                      </div>
                      <div className="flex justify-between text-[8px] text-zinc-500">
                        <span>Success Rate</span>
                        <span className="text-emerald-400 font-bold">99.3%</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Dynamic content display panel) */}
                  <div className="flex-1 min-w-0 border border-zinc-800/80 rounded-2xl p-5.5 bg-[#0b0a0f] flex flex-col gap-4.5 justify-between">
                    
                    {/* Panel Header */}
                    <div className="flex justify-between items-start border-b border-zinc-900/60 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="5" r="3" />
                            <circle cx="5" cy="19" r="3" />
                            <circle cx="19" cy="19" r="3" />
                            <path d="M12 8v8M7 17l3-1.5M17 17l-3-1.5" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <h5 className="text-[14px] font-bold text-white tracking-wide">{currentCompute.title}</h5>
                          <span className="text-[9.5px] text-zinc-500">{currentCompute.subtitle}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() => setActiveStepIndex(null)}
                          className="p-1 rounded cursor-pointer border-none bg-transparent outline-none transition-colors hover:bg-zinc-900 text-zinc-700 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Top Row: Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {currentCompute.metrics.map((m, idx) => (
                        <div key={idx} className="bg-[#121217] border border-zinc-900/60 p-3 rounded-xl flex items-center justify-between">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8.5px] text-zinc-500 font-bold truncate max-w-[80px]">{m.label}</span>
                            <span className="text-[15px] font-bold text-white tracking-tight">{m.val}</span>
                            <span className="text-[8px] text-emerald-400 font-bold">{m.pct} <span className="text-zinc-600 font-normal">vs last 7d</span></span>
                          </div>
                          <div className="p-1.5 bg-[#171720] border border-zinc-800/40 rounded-lg text-purple-400">
                            {m.icon === 'db' && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="20" height="8" x="2" y="3" rx="2" />
                                <rect width="20" height="8" x="2" y="13" rx="2" />
                              </svg>
                            )}
                            {m.icon === 'cube' && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              </svg>
                            )}
                            {m.icon === 'bulb' && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                              </svg>
                            )}
                            {m.icon === 'target' && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                              </svg>
                            )}
                            {m.icon === 'check' && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m9 12 2 2 4-4" />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Middle Row: Our Analytics Process & Key Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      
                      {/* Left: Our Analytics Process (Takes 2/3) */}
                      <div className="lg:col-span-2 bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3">
                        <div className="flex flex-col">
                          <span className="text-[9.5px] font-bold text-white">Our Analytics Process</span>
                          <span className="text-[8px] text-zinc-500 font-medium mt-0.5">From raw data to decision-ready insights</span>
                        </div>

                        {/* Horizontal Process Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-2.5">
                          {currentCompute.processSteps.map((step, idx) => {
                            const isLast = idx === currentCompute.processSteps.length - 1;
                            return (
                              <div key={idx} className="relative flex flex-col items-center text-center p-2 bg-[#0d0d12] border border-zinc-900 rounded-xl min-h-[110px] justify-between w-full">
                                {/* Icon container */}
                                <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mt-1">
                                  {step.icon === 'db' && (
                                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect width="20" height="8" x="2" y="3" rx="2" />
                                      <rect width="20" height="8" x="2" y="13" rx="2" />
                                    </svg>
                                  )}
                                  {step.icon === 'model' && (
                                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="5" r="3" />
                                      <circle cx="5" cy="19" r="3" />
                                      <circle cx="19" cy="19" r="3" />
                                      <path d="M12 8v8M7 17l3-1.5M17 17l-3-1.5" />
                                    </svg>
                                  )}
                                  {step.icon === 'brain' && (
                                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44" />
                                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44" />
                                    </svg>
                                  )}
                                  {step.icon === 'kpi' && (
                                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect x="3" y="3" width="18" height="18" rx="2" />
                                      <path d="M9 17V9M15 17v-4" />
                                    </svg>
                                  )}
                                  {step.icon === 'bulb' && (
                                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5" />
                                      <path d="M9 18h6" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5 px-1.5">
                                  <span className="text-[9.5px] font-bold text-white leading-tight">{step.step}</span>
                                  <span className="text-[7.5px] text-zinc-600 leading-tight font-medium mt-0.5">{step.desc}</span>
                                </div>
                                <span className="bg-purple-950/40 border border-purple-500/20 text-purple-300 text-[7px] font-black uppercase px-2 py-0.5 rounded-full mb-1">
                                  {step.badge}
                                </span>
                                {!isLast && (
                                  <div className="absolute top-1/2 -right-3 -translate-y-1/2 text-zinc-800 select-none hidden md:block z-10">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M5 12h14" strokeLinecap="round" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Key Insights Generated (Takes 1/3) */}
                      <div className="bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                          <span className="text-[9.5px] font-bold text-white">Key Insights Generated</span>
                          <span className="text-[7.5px] font-mono font-black text-purple-400 bg-purple-500/10 px-1 py-0.2 rounded border border-purple-500/15">AI</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          {currentCompute.insights.map((insight, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start">
                              <div className="mt-0.5 p-1 bg-[#181822] border border-zinc-800/40 rounded text-purple-400">
                                {insight.icon === 'trend' && (
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m22 7-8.5 8.5-5-5L2 17M22 7h-6M22 7v6" />
                                  </svg>
                                )}
                                {insight.icon === 'alert' && (
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                  </svg>
                                )}
                                {insight.icon === 'check' && (
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect width="18" height="18" x="3" y="3" rx="2" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5 flex-1">
                                <p className="text-[9px] text-zinc-300 leading-normal">{insight.text}</p>
                                <span className={`text-[6.5px] font-extrabold uppercase border px-1.5 py-0.2 w-fit rounded ${insight.badgeColor}`}>
                                  {insight.badge}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>


                      </div>

                    </div>

                    {/* Third Row: Model Performance, KPI Trends, Top Recommendations */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      
                      {/* 1. Model Performance Table */}
                      <div className="bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-[9.5px] font-bold text-white">Model Performance</span>
                          <span className="text-[8px] text-zinc-500 font-medium">Performance of AI/ML models</span>
                        </div>

                        <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20">
                          <table className="w-full text-[8.5px] text-left border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-900 text-zinc-500 font-extrabold bg-[#0d0d12]/30 uppercase text-[7.5px] tracking-wide">
                                <th className="p-2">Model</th>
                                <th className="p-2">Accuracy</th>
                                <th className="p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900/40 text-zinc-300">
                              {currentCompute.models.map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.01]">
                                  <td className="p-2 font-bold max-w-[85px] truncate">{row.name}</td>
                                  <td className="p-2 font-mono text-white font-bold">{row.acc}</td>
                                  <td className="p-2 text-emerald-400 font-bold">{row.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>


                      </div>

                      {/* 2. KPI Trends Line Chart */}
                      <div className="bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-[9.5px] font-bold text-white">KPI Trends</span>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1">
                              <span className="w-2.5 h-0.5 bg-purple-500 inline-block" />
                              <span className="text-[8px] text-zinc-400 font-bold">Current Period</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2.5 h-0.5 border-t border-dashed border-purple-400 inline-block" />
                              <span className="text-[8px] text-zinc-400 font-bold">Previous Period</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Line Chart SVG */}
                        <div className="relative w-full h-[105px] border-b border-l border-zinc-900 mt-2 bg-zinc-950/20 rounded-md p-1.5 flex flex-col justify-between">
                          <svg className="w-full h-full text-purple-500" viewBox="0 0 300 100" fill="none" stroke="currentColor">
                            <line x1="0" y1="25" x2="300" y2="25" stroke="#1f1e29" strokeWidth="0.8" />
                            <line x1="0" y1="50" x2="300" y2="50" stroke="#1f1e29" strokeWidth="0.8" />
                            <line x1="0" y1="75" x2="300" y2="75" stroke="#1f1e29" strokeWidth="0.8" />
                            {/* Previous Period (Dashed) */}
                            <path d="M 0 85 Q 50 35 100 75 T 200 55 T 300 30" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                            {/* Current Period (Solid) */}
                            <path d="M 0 75 Q 50 15 100 65 T 200 35 T 300 10" stroke="#a855f7" strokeWidth="2" fill="none" />
                            {/* Dot markers */}
                            <circle cx="300" cy="10" r="3" fill="#a855f7" stroke="none" />
                            <circle cx="200" cy="35" r="3" fill="#a855f7" stroke="none" />
                          </svg>
                          <div className="flex justify-between text-[7px] text-zinc-700 font-bold tracking-wide mt-1">
                            <span>May 8</span>
                            <span>May 9</span>
                            <span>May 10</span>
                            <span>May 11</span>
                            <span>May 12</span>
                            <span>May 13</span>
                            <span>May 14</span>
                          </div>
                        </div>

                        {/* Metrics Row at bottom of KPI Trends */}
                        <div className="grid grid-cols-4 gap-1 pt-1.5 text-center">
                          {currentCompute.kpis.map((kpi, idx) => (
                            <div key={idx} className="flex flex-col border-r border-zinc-900 last:border-none">
                              <span className="text-[7.5px] text-zinc-600 font-bold truncate">{kpi.label}</span>
                              <span className="text-[10px] font-bold text-white mt-0.5">{kpi.val}</span>
                              <span className="text-[7px] text-emerald-400 font-extrabold mt-0.5">{kpi.change}</span>
                            </div>
                          ))}
                        </div>


                      </div>

                      {/* 3. Top Recommendations */}
                      <div className="bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-[9.5px] font-bold text-white">Top Recommendations</span>
                          <span className="text-[8px] text-zinc-500 font-medium">Approved optimization variables</span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {currentCompute.recs.map((rec, idx) => (
                            <div key={idx} className={`p-2.5 rounded-xl border flex justify-between items-center ${rec.color}`}>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-[9.5px] text-white leading-none">{rec.title}</span>
                                <span className="text-[7.5px] text-zinc-500 mt-0.5 truncate max-w-[130px] font-medium">{rec.desc}</span>
                              </div>
                              <div className="text-right flex flex-col gap-0.5">
                                <span className="text-[9px] font-mono font-black text-white leading-none">{rec.val}</span>
                                <span className="text-[6.5px] font-extrabold uppercase tracking-wide opacity-80">{rec.impact}</span>
                              </div>
                            </div>
                          ))}
                        </div>


                      </div>

                    </div>

                    {/* Bottom Row: Data to Decision Impact */}
                    <div className="bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9.5px] font-bold text-white">Data to Decision Impact</span>
                        <span className="text-[8px] text-zinc-500 font-medium">How our analysis drives business decisions</span>
                      </div>

                      {/* Decision Flow Blocks & Gradient Box */}
                      <div className="flex flex-col md:flex-row items-center gap-3 w-full">
                        
                        {/* 5 Process flow blocks */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 flex-1 w-full">
                          {currentCompute.flow.map((flowItem, idx) => {
                            const isLast = idx === currentCompute.flow.length - 1;
                            return (
                              <div key={idx} className="relative bg-[#0f0e13] border border-zinc-900 p-3 rounded-lg flex flex-col gap-1 w-full min-h-[55px] justify-between">
                                <div className="flex items-center gap-1.5">
                                  {idx === 0 && (
                                    <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect width="20" height="8" x="2" y="3" rx="2" />
                                      <rect width="20" height="8" x="2" y="13" rx="2" />
                                    </svg>
                                  )}
                                  {idx === 1 && (
                                    <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="5" r="3" />
                                      <circle cx="5" cy="19" r="3" />
                                      <circle cx="19" cy="19" r="3" />
                                      <path d="M12 8v8M7 17l3-1.5M17 17l-3-1.5" />
                                    </svg>
                                  )}
                                  {idx === 2 && (
                                    <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5" />
                                      <path d="M9 18h6" />
                                    </svg>
                                  )}
                                  {idx === 3 && (
                                    <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10" />
                                      <circle cx="12" cy="12" r="6" />
                                    </svg>
                                  )}
                                  {idx === 4 && (
                                    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10" />
                                      <path d="m9 12 2 2 4-4" />
                                    </svg>
                                  )}
                                  <span className="text-[9.5px] font-bold text-zinc-200">{flowItem.label}</span>
                                </div>
                                <span className="text-[8px] text-zinc-500 font-medium leading-relaxed mt-0.5">{flowItem.desc}</span>
                                {!isLast && (
                                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 text-zinc-800 select-none hidden md:block z-10">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M5 12h14" strokeLinecap="round" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Right purple gradient callout box */}
                        <div className="w-full md:w-[170px] bg-gradient-to-r from-[#6b21a8] to-[#4c1d95] rounded-xl p-3.5 flex flex-col justify-between min-h-[55px] shadow-[0_4px_14px_rgba(107,33,168,0.25)] border border-purple-500/25">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black uppercase tracking-wider text-purple-200">Value Add</span>
                            <Sparkles size={11} className="text-purple-300" />
                          </div>
                          <span className="text-[10px] font-extrabold text-white tracking-wide mt-1.5 leading-tight">Turning Data into Business Value</span>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Step 3 Deep Dive: High Fidelity Remediation & Action Swarm Selector & Dashboard */}
              {activeStepIndex === 2 && (
                <div className="flex flex-col lg:flex-row gap-4 w-full mt-1 animate-fade-in text-zinc-400">
                  
                  {/* Left Column (Diagnostics Selector Menu) */}
                  <div className="w-full lg:w-[250px] flex-shrink-0 border border-purple-500/10 rounded-2xl p-4.5 bg-[#0a0a0f] flex flex-col justify-between gap-5">
                    <div className="flex flex-col gap-4">
                      {/* Badge & Title */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 border border-purple-500/30 bg-[#25183a]/65 px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase text-purple-300 w-fit select-none">
                          <svg className="w-2.5 h-2.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                          </svg>
                          <span>ALERTS</span>
                        </div>
                        <h4 className="text-[17px] font-semibold text-white tracking-tight leading-tight font-serif">Remediation & Action Swarm</h4>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          AI-driven diagnostics that identify issues, root causes and opportunities to improve portfolio performance.
                        </p>
                      </div>

                      {/* Diagnostics Menu Buttons */}
                      <div className="flex flex-col gap-2.5 mt-2">
                        {/* Remediation & Action Swarm */}
                        <button
                          type="button"
                          onClick={() => setActiveDiagnosticTab('diagnostic')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeDiagnosticTab === 'diagnostic'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeDiagnosticTab === 'diagnostic' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <circle cx="12" cy="12" r="6" />
                              <circle cx="12" cy="12" r="2" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Remediation & Action Swarm</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Issues, root causes, opportunities...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Root Cause Analysis */}
                        <button
                          type="button"
                          onClick={() => setActiveDiagnosticTab('root')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeDiagnosticTab === 'root'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeDiagnosticTab === 'root' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="3" />
                              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
                              <path d="M18 8h4v4h-4z" />
                              <path d="M14 12h4" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Root Cause Reasoning Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Drill down to core factors...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Impact Assessment */}
                        <button
                          type="button"
                          onClick={() => setActiveDiagnosticTab('impact')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeDiagnosticTab === 'impact'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeDiagnosticTab === 'impact' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="M9 17V9M15 17v-4" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Value Attribution Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Quantify financial & NPS impact...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Scenario Simulation */}
                        <button
                          type="button"
                          onClick={() => setActiveDiagnosticTab('scenario')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeDiagnosticTab === 'scenario'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeDiagnosticTab === 'scenario' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                              <path d="M12 22.08V12" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Scenario Simulator Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Simulate price / volume shocks...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Alerts & Anomaly Detection Agents */}
                        <button
                          type="button"
                          onClick={() => setActiveDiagnosticTab('alerts')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeDiagnosticTab === 'alerts'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeDiagnosticTab === 'alerts' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Alerts Dispatcher Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">Real-time limits, active anomalies...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>

                        {/* Recommendations */}
                        <button
                          type="button"
                          onClick={() => setActiveDiagnosticTab('recs')}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            activeDiagnosticTab === 'recs'
                              ? 'border-purple-500/80 bg-purple-500/5 text-white shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                              : 'border-zinc-800 bg-[#121217] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <svg className={`w-4 h-4 ${activeDiagnosticTab === 'recs' ? 'text-purple-400' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 22c5.523 0 10-2.239 10-5s-4.477-5-10-5-10 2.239-10 5 4.477 5 10 5Z" />
                              <path d="m9 12 2 2 4-4" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="text-[10.5px] font-bold">Mitigation Proposal Agent</span>
                              <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[130px]">AI-suggested recovery options...</span>
                            </div>
                          </div>
                          <span className="text-zinc-500 font-mono text-[9px] select-none">&gt;</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="border-t border-zinc-900 pt-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[9px]">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <svg className="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <span>Diagnostics Health</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8.5px] text-emerald-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Healthy</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[8px] text-zinc-500">
                        <span>Checks Performed</span>
                        <span className="text-white font-bold">134</span>
                      </div>
                      <div className="flex justify-between text-[8px] text-zinc-500">
                        <span>Issues Detected</span>
                        <span className="text-red-400 font-bold">17</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Dynamic content display panel) */}
                  <div className="flex-1 min-w-0 border border-zinc-800/80 rounded-2xl p-5.5 bg-[#0b0a0f] flex flex-col gap-4.5 justify-between">
                    
                    {/* Panel Header */}
                    <div className="flex justify-between items-start border-b border-zinc-900/60 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                          <svg className="w-4.5 h-4.5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12h3l3-9 4 18 3-12h5" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <h5 className="text-[14px] font-bold text-white tracking-wide">{currentDiagnostic.title}</h5>
                          <span className="text-[9.5px] text-zinc-500">{currentDiagnostic.subtitle}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() => setActiveStepIndex(null)}
                          className="p-1 rounded cursor-pointer border-none bg-transparent outline-none transition-colors hover:bg-zinc-900 text-zinc-700 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Top Row: Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {currentDiagnostic.metrics.map((m, idx) => (
                        <div key={idx} className="bg-[#121217] border border-zinc-900/60 p-3 rounded-xl flex items-center justify-between">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8.5px] text-zinc-600 font-bold truncate max-w-[80px] leading-tight">{m.label}</span>
                            <span className="text-[15px] font-bold text-white tracking-tight">{m.val}</span>
                            <span className={`text-[8.5px] font-extrabold ${m.label === 'Issues Detected' ? 'text-red-400' : 'text-emerald-400'}`}>{m.pct}</span>
                          </div>
                          <div className="p-1.5 bg-[#171720] border border-zinc-800/40 rounded-lg text-purple-400">
                            {m.icon === 'diag' && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h3l3-9 4 18 3-12h5" />
                              </svg>
                            )}
                            {m.icon === 'alert' && (
                              <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                              </svg>
                            )}
                            {m.icon === 'target' && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="2" />
                              </svg>
                            )}
                            {m.icon === 'opportunity' && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20V10M18 20V4M6 20v-4" />
                              </svg>
                            )}
                            {m.icon === 'check' && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* DYNAMIC DETAILS BY DIAGNOSTIC TAB */}
                    {activeDiagnosticTab === 'diagnostic' && (
                      <div className="flex flex-col gap-4.5 animate-in fade-in duration-200">
                        {/* Middle Row: Severity Distribution, Issues Over Time, Top Categories */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                          
                          {/* Left: Issue Severity Distribution (Donut) */}
                          <div className="bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col justify-between gap-3 min-h-[160px]">
                            <span className="text-[9.5px] font-bold text-white">Issue Severity Distribution</span>
                            
                            <div className="flex items-center justify-between gap-4 mt-1">
                              {/* Donut chart SVG */}
                              <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                  {/* Background track */}
                                  <circle className="text-zinc-900" strokeWidth="4.5" stroke="currentColor" fill="none" r="15" cx="18" cy="18" />
                                  {/* Low (green): 2 issues -> 12% */}
                                  <circle className="text-emerald-500" strokeWidth="4.5" strokeDasharray="12 100" strokeDashoffset="0" stroke="currentColor" fill="none" r="15" cx="18" cy="18" />
                                  {/* Medium (yellow): 3 issues -> 18% */}
                                  <circle className="text-amber-400" strokeWidth="4.5" strokeDasharray="18 100" strokeDashoffset="-12" stroke="currentColor" fill="none" r="15" cx="18" cy="18" />
                                  {/* High (orange): 7 issues -> 41% */}
                                  <circle className="text-orange-500" strokeWidth="4.5" strokeDasharray="41 100" strokeDashoffset="-30" stroke="currentColor" fill="none" r="15" cx="18" cy="18" />
                                  {/* Critical (red): 5 issues -> 29% */}
                                  <circle className="text-red-500" strokeWidth="4.5" strokeDasharray="29 100" strokeDashoffset="-71" stroke="currentColor" fill="none" r="15" cx="18" cy="18" />
                                </svg>
                                <div className="absolute text-center flex flex-col items-center justify-center">
                                  <span className="text-[11px] font-black text-white">{currentDiagnostic.severity.total}</span>
                                  <span className="text-[5.5px] text-zinc-600 font-extrabold uppercase tracking-wide leading-none">Total Issues</span>
                                </div>
                              </div>

                              {/* Legend details */}
                              <div className="flex-1 flex flex-col gap-1 text-[9px] text-zinc-400 font-bold">
                                {currentDiagnostic.severity.breakdown.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center pb-0.5 border-b border-zinc-900 last:border-none">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                                      <span>{item.label}</span>
                                    </div>
                                    <span className="text-white">{item.val} ({item.pct}%)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Middle: Issues Over Time (Line Chart) */}
                          <div className="bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col justify-between gap-3 min-h-[160px]">
                            <div className="flex justify-between items-center">
                              <span className="text-[9.5px] font-bold text-white">Issues Over Time</span>
                              {/* Tiny color dots Legend */}
                              <div className="flex items-center gap-1.5 text-[7px] text-zinc-500 font-black uppercase">
                                <span className="text-red-500">•</span> Crit
                                <span className="text-orange-500">•</span> High
                                <span className="text-amber-400">•</span> Med
                                <span className="text-emerald-500">•</span> Low
                              </div>
                            </div>

                            {/* 4 Line chart SVG */}
                            <div className="relative w-full h-[95px] border-b border-l border-zinc-900 bg-zinc-950/20 rounded-md p-1 flex flex-col justify-between mt-1">
                              <svg className="w-full h-full text-zinc-700" viewBox="0 0 300 100" fill="none" stroke="currentColor">
                                <line x1="0" y1="25" x2="300" y2="25" stroke="#1f1e29" strokeWidth="0.8" />
                                <line x1="0" y1="50" x2="300" y2="50" stroke="#1f1e29" strokeWidth="0.8" />
                                <line x1="0" y1="75" x2="300" y2="75" stroke="#1f1e29" strokeWidth="0.8" />
                                {/* Critical line (Red) */}
                                <path d="M 0 50 Q 50 30 100 45 T 200 35 T 300 15" stroke="#ef4444" strokeWidth="1.5" fill="none" />
                                {/* High line (Orange) */}
                                <path d="M 0 65 Q 50 45 100 55 T 200 50 T 300 35" stroke="#f97316" strokeWidth="1.5" fill="none" />
                                {/* Medium line (Yellow) */}
                                <path d="M 0 80 Q 50 65 100 75 T 200 60 T 300 50" stroke="#eab308" strokeWidth="1.2" fill="none" />
                                {/* Low line (Green) */}
                                <path d="M 0 90 Q 50 80 100 85 T 200 80 T 300 70" stroke="#10b981" strokeWidth="1.2" fill="none" />
                              </svg>
                              <div className="flex justify-between text-[7px] text-zinc-700 font-bold tracking-wide mt-1">
                                <span>May 8</span>
                                <span>May 9</span>
                                <span>May 10</span>
                                <span>May 11</span>
                                <span>May 12</span>
                                <span>May 13</span>
                                <span>May 14</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Top Issue Categories (Horizontal bars) */}
                          <div className="bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col justify-between gap-3 min-h-[160px]">
                            <span className="text-[9.5px] font-bold text-white">Top Issue Categories</span>
                            
                            <div className="flex flex-col gap-2.5 mt-1">
                              {currentDiagnostic.categories.map((cat, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                  <div className="flex justify-between text-[8.5px] text-zinc-400 font-bold leading-none">
                                    <span>{cat.label}</span>
                                    <span className="text-white">{cat.val} ({cat.pct}%)</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-[#0f0e13] rounded-full overflow-hidden border border-zinc-900/40">
                                    <div className={`h-full ${cat.bg} rounded-full`} style={{ width: `${cat.pct}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Third Row: Top Issues Table, Root Cause Snapshot, Impact Assessment */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                          
                          {/* 1. Top Issues Table */}
                          <div className="lg:col-span-1 bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col justify-between gap-3 min-h-[220px]">
                            <div className="flex flex-col pb-0.5">
                              <span className="text-[9.5px] font-bold text-white">Top Issues Detected</span>
                              <span className="text-[8px] text-zinc-600 mt-0.5">Prioritized active system anomalies</span>
                            </div>

                            <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20">
                              <table className="w-full text-[8.5px] text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-zinc-900 text-zinc-500 font-extrabold bg-[#0d0d12]/30 uppercase text-[7.5px] tracking-wide">
                                    <th className="p-2.5">Issue</th>
                                    <th className="p-2.5">Severity</th>
                                    <th className="p-2.5">Impact</th>
                                    <th className="p-2.5">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900/40 text-zinc-400">
                                  {currentDiagnostic.issues.slice(0, 3).map((row, idx) => (
                                    <tr 
                                      key={idx} 
                                      onClick={() => setActiveDiagnosticTab('alerts')}
                                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                                    >
                                      <td className="p-2.5 flex flex-col gap-0.5 max-w-[100px]">
                                        <span className="font-bold text-white truncate leading-tight text-[9px]">{row.name}</span>
                                        <span className="text-[7px] text-zinc-600 font-medium truncate leading-normal">{row.desc}</span>
                                      </td>
                                      <td className="p-2.5">
                                        <span className={`text-[6.5px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${row.sevColor}`}>
                                          {row.sev}
                                        </span>
                                      </td>
                                      <td className="p-2.5 font-mono font-bold text-white text-[9px]">{row.impact}</td>
                                      <td className="p-2.5 font-bold text-[7.5px]"><span className={row.statusColor}>{row.status}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* 2. Root Cause Snapshot Diagram */}
                          <div 
                            onClick={() => setActiveDiagnosticTab('root')}
                            className="bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col justify-between gap-3 min-h-[220px] cursor-pointer hover:border-purple-500/30 transition-all group"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col">
                                <span className="text-[9.5px] font-bold text-white uppercase tracking-wider font-mono">Root Cause Snapshot</span>
                                <span className="text-[8px] text-zinc-600 mt-0.5">Click for deep-dive reasoning trace</span>
                              </div>
                              <span className="text-[7.5px] text-purple-400 font-bold font-mono border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                VIEW DRILLDOWN
                              </span>
                            </div>

                            {/* Causal Snapshot CSS layout */}
                            <div className="relative w-full h-[125px] border border-zinc-900/50 rounded-xl bg-zinc-950/30 flex items-center justify-center p-1 overflow-hidden mt-1 select-none">
                              {/* Inner circle node */}
                              <div className="w-18 h-18 rounded-full border border-purple-500 bg-[#120d20] flex items-center justify-center text-center text-[7px] text-white font-extrabold p-2.5 z-10 shadow-[0_0_12px_rgba(168,85,247,0.25)] leading-tight">
                                Margin Erosion in 15 SKUs
                              </div>

                              {/* Outer absolute nodes */}
                              {/* Top-Left */}
                              <div className="absolute left-1.5 top-1.5 bg-[#0f0e13] border border-zinc-900 p-1.5 rounded-lg text-left flex flex-col gap-0.5 leading-none shadow-md">
                                <span className="text-red-400 font-black text-[7.5px] flex items-center gap-0.5">
                                  <span>&uarr;</span> Raw Material
                                </span>
                                <span className="text-[7px] text-zinc-600 font-medium">Costs (+12%)</span>
                              </div>

                              {/* Top-Right */}
                              <div className="absolute right-1.5 top-1.5 bg-[#0f0e13] border border-zinc-900 p-1.5 rounded-lg text-right flex flex-col gap-0.5 leading-none shadow-md">
                                <span className="text-orange-400 font-black text-[7.5px] flex items-center gap-0.5 justify-end">
                                  <span>&darr;</span> Price Real.
                                </span>
                                <span className="text-[7px] text-zinc-600 font-medium">(-4%)</span>
                              </div>

                              {/* Mid-Left */}
                              <div className="absolute left-1.5 bottom-12 bg-[#0f0e13] border border-zinc-900 p-1.5 rounded-lg text-left flex flex-col gap-0.5 leading-none shadow-md">
                                <span className="text-orange-400 font-black text-[7.5px] flex items-center gap-0.5">
                                  <span>&uarr;</span> Raw Pack.
                                </span>
                                <span className="text-[7px] text-zinc-600 font-medium">(+8%)</span>
                              </div>

                              {/* Mid-Right */}
                              <div className="absolute right-1.5 bottom-12 bg-[#0f0e13] border border-zinc-900 p-1.5 rounded-lg text-right flex flex-col gap-0.5 leading-none shadow-md">
                                <span className="text-orange-400 font-black text-[7.5px] flex items-center gap-0.5 justify-end">
                                  <span>&darr;</span> Prod Mix
                                </span>
                                <span className="text-[7px] text-zinc-600 font-medium">(-5%)</span>
                              </div>

                              {/* Bottom-Left */}
                              <div className="absolute left-6 bottom-1 bg-[#0f0e13] border border-zinc-900 p-1.5 rounded-lg text-left flex flex-col gap-0.5 leading-none shadow-md">
                                <span className="text-red-400 font-black text-[7.5px] flex items-center gap-0.5">
                                  <span>&uarr;</span> Ingredients
                                </span>
                                <span className="text-[7px] text-zinc-600 font-medium">(+7%)</span>
                              </div>

                              {/* Bottom-Right */}
                              <div className="absolute right-6 bottom-1 bg-[#0f0e13] border border-zinc-900 p-1.5 rounded-lg text-right flex flex-col gap-0.5 leading-none shadow-md">
                                <span className="text-orange-400 font-black text-[7.5px] flex items-center gap-0.5 justify-end">
                                  <span>&uarr;</span> Promo Spend
                                </span>
                                <span className="text-[7px] text-zinc-600 font-medium">(-3%)</span>
                              </div>
                            </div>
                          </div>

                          {/* 3. Impact Assessment Values */}
                          <div className="lg:col-span-1 bg-[#121217] border border-zinc-900/60 p-4 rounded-xl flex flex-col justify-between gap-3 min-h-[220px]">
                            <div className="flex flex-col">
                              <span className="text-[9.5px] font-bold text-white">Impact Assessment</span>
                              <span className="text-[8px] text-zinc-600 mt-0.5">Anomaly Detection Agents value quantification</span>
                            </div>

                            <div className="flex flex-col gap-2">
                              {currentDiagnostic.impacts.map((imp, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => setActiveDiagnosticTab('impact')}
                                  className="p-2.5 rounded-xl border border-zinc-900 bg-[#0f0e13] flex justify-between items-center cursor-pointer hover:border-purple-500/20 hover:bg-purple-500/[0.01] transition-all"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 bg-[#16151c] border border-zinc-800/40 rounded text-purple-400 flex-shrink-0">
                                      {imp.icon === 'gear' && (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="12" cy="12" r="3" />
                                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                      )}
                                      {imp.icon === 'list' && (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <rect width="18" height="18" x="3" y="3" rx="2" />
                                          <path d="M3 9h18M3 15h18" />
                                        </svg>
                                      )}
                                      {imp.icon === 'user' && (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                          <circle cx="9" cy="7" r="4" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-bold text-[9.5px] text-white leading-none">{imp.label}</span>
                                      <span className="text-[7px] text-zinc-500 font-medium leading-normal mt-0.5 truncate max-w-[125px]">{imp.desc}</span>
                                    </div>
                                  </div>
                                  <div className="text-right flex flex-col gap-0.5">
                                    <span className="text-[10px] font-mono font-black text-white leading-none">{imp.val}</span>
                                    <span className={`text-[6.5px] font-extrabold uppercase tracking-wide px-1 rounded border ${imp.tagColor}`}>{imp.tag}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Fourth Row: Recommended Mitigation Action Agent (AI Suggested) */}
                        <div className="bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3">
                          <span className="text-[9.5px] font-bold text-white tracking-wide">Recommended Mitigation Action Agent (AI Suggested)</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                            {currentDiagnostic.recs.map((rec, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => setActiveDiagnosticTab('recs')}
                                className="bg-[#0f0e13] border border-zinc-900 p-3 rounded-lg flex flex-col justify-between min-h-[105px] cursor-pointer hover:border-purple-500/20 hover:bg-purple-500/[0.01] transition-all"
                              >
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between items-start">
                                    <span className={`text-[6.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${rec.tagColor}`}>
                                      {rec.tag}
                                    </span>
                                  </div>
                                  <span className="font-bold text-[9.5px] text-white leading-tight">{rec.title}</span>
                                  <p className="text-[7.5px] text-zinc-600 leading-relaxed font-medium mt-0.5">{rec.desc}</p>
                                </div>
                                
                                <div className="border-t border-zinc-900/80 pt-2 flex flex-col gap-1.5 mt-1 text-[8px] text-zinc-400">
                                  <div className="flex justify-between font-bold">
                                    <span>Potential Impact</span>
                                    <span className="text-emerald-400 font-mono">{rec.val}</span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex justify-between font-medium text-[7px] text-zinc-500">
                                      <span>Confidence</span>
                                      <span>{rec.conf}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-[#16151c] rounded-full overflow-hidden border border-zinc-900/40">
                                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rec.conf}%` }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}

                            <div className="bg-gradient-to-br from-[#121118] to-[#0d0c12] border border-purple-500/5 p-3 rounded-lg flex flex-col items-center justify-center text-center gap-2.5 min-h-[105px]">
                              <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-purple-400">
                                <Sparkles size={14} />
                              </div>
                              <span className="text-[8.5px] text-zinc-500 uppercase tracking-wider">
                                Decision Support Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeDiagnosticTab === 'root' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start animate-in fade-in duration-200">
                        {/* Left Column: Causal Snapshot SVG */}
                        <div className="lg:col-span-2 bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3.5">
                          <div className="flex justify-between items-center pb-1">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Causal Network Reasoning Map</span>
                            <span className="text-[7.5px] text-zinc-600 italic font-mono font-bold">Click diagram to open interactive detail overlay</span>
                          </div>
                          <div 
                            onClick={() => setIsZoomedRootCause(true)}
                            className="relative w-full h-[240px] border border-zinc-900/65 rounded-xl bg-zinc-950/40 flex items-center justify-center p-2 cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/[0.02] transition-all group select-none"
                          >
                            <div className="absolute top-3 right-3 p-1 rounded-md bg-black/60 border border-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[8.5px] font-bold font-mono z-10">
                              <ZoomIn size={12} />
                              <span>INTERACTIVE ZOOM</span>
                            </div>
                            
                            <svg className="w-full h-full" viewBox="0 0 420 220" fill="none">
                              <defs>
                                <marker id="arrow-red-md" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                                </marker>
                                <marker id="arrow-orange-md" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f97316" />
                                </marker>
                              </defs>

                              {/* Connections */}
                              <path d="M 110 38 Q 170 38 185 92" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" className="opacity-50" markerEnd="url(#arrow-red-md)" />
                              <path d="M 110 110 L 170 110" stroke="#f97316" strokeWidth="1.2" strokeDasharray="3 3" className="opacity-50" markerEnd="url(#arrow-orange-md)" />
                              <path d="M 110 182 Q 170 182 185 128" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" className="opacity-50" markerEnd="url(#arrow-red-md)" />
                              
                              <path d="M 310 38 Q 250 38 235 92" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" className="opacity-50" markerEnd="url(#arrow-red-md)" />
                              <path d="M 310 110 L 250 110" stroke="#f97316" strokeWidth="1.2" strokeDasharray="3 3" className="opacity-50" markerEnd="url(#arrow-orange-md)" />
                              <path d="M 310 182 Q 250 182 235 128" stroke="#f97316" strokeWidth="1.2" strokeDasharray="3 3" className="opacity-50" markerEnd="url(#arrow-orange-md)" />

                              {/* Center Node */}
                              <circle cx="210" cy="110" r="34" fill="#120d20" stroke="#a855f7" strokeWidth="1.5" className="shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
                              <text x="210" y="107" textAnchor="middle" fontSize="8" fill="#ffffff" fontWeight="black" fontFamily="monospace">Margin Erosion</text>
                              <text x="210" y="117" textAnchor="middle" fontSize="7.5" fill="#a855f7" fontWeight="black" fontFamily="sans-serif">in 15 SKUs</text>

                              {/* Left nodes */}
                              <foreignObject x="10" y="20" width="100" height="34">
                                <div className="bg-[#0f0e13] border border-red-500/20 p-1.5 rounded text-left flex flex-col justify-center h-full shadow-md">
                                  <span className="text-red-400 font-extrabold text-[7.5px] uppercase tracking-wide">&uarr; Raw Materials</span>
                                  <span className="text-zinc-500 text-[6.5px] font-bold">Steel index (+12%)</span>
                                </div>
                              </foreignObject>
                              <foreignObject x="10" y="93" width="100" height="34">
                                <div className="bg-[#0f0e13] border border-orange-500/20 p-1.5 rounded text-left flex flex-col justify-center h-full shadow-md">
                                  <span className="text-orange-400 font-extrabold text-[7.5px] uppercase tracking-wide">&uarr; Raw Packaging</span>
                                  <span className="text-zinc-500 text-[6.5px] font-bold">Glass container (+8%)</span>
                                </div>
                              </foreignObject>
                              <foreignObject x="10" y="165" width="100" height="34">
                                <div className="bg-[#0f0e13] border border-red-500/20 p-1.5 rounded text-left flex flex-col justify-center h-full shadow-md">
                                  <span className="text-red-400 font-extrabold text-[7.5px] uppercase tracking-wide">&uarr; Ingredient Cost</span>
                                  <span className="text-zinc-500 text-[6.5px] font-bold">Sweeteners (+7%)</span>
                                </div>
                              </foreignObject>

                              {/* Right nodes */}
                              <foreignObject x="310" y="20" width="100" height="34">
                                <div className="bg-[#0f0e13] border border-red-500/20 p-1.5 rounded text-right flex flex-col justify-center h-full shadow-md">
                                  <span className="text-red-400 font-extrabold text-[7.5px] uppercase tracking-wide">&darr; Price Realization</span>
                                  <span className="text-zinc-500 text-[6.5px] font-bold">Contract delays (-4%)</span>
                                </div>
                              </foreignObject>
                              <foreignObject x="310" y="93" width="100" height="34">
                                <div className="bg-[#0f0e13] border border-orange-500/20 p-1.5 rounded text-right flex flex-col justify-center h-full shadow-md">
                                  <span className="text-orange-400 font-extrabold text-[7.5px] uppercase tracking-wide">&darr; Product Mix</span>
                                  <span className="text-zinc-500 text-[6.5px] font-bold">Low-margin surge (-5%)</span>
                                </div>
                              </foreignObject>
                              <foreignObject x="310" y="165" width="100" height="34">
                                <div className="bg-[#0f0e13] border border-orange-500/20 p-1.5 rounded text-right flex flex-col justify-center h-full shadow-md">
                                  <span className="text-orange-400 font-extrabold text-[7.5px] uppercase tracking-wide">&uarr; Promo Spend</span>
                                  <span className="text-zinc-500 text-[6.5px] font-bold">West trade over (-3%)</span>
                                </div>
                              </foreignObject>
                            </svg>
                          </div>
                        </div>

                        {/* Right Column: Ledger List */}
                        <div className="lg:col-span-1 bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3 max-h-[295px] overflow-y-auto pr-1">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Causal Factors Ledger</span>
                          <div className="flex flex-col gap-2">
                            {[
                              { label: 'Raw Material Inflation', val: '+12%', color: 'text-red-400' },
                              { label: 'Raw Packaging Surcharges', val: '+8%', color: 'text-orange-400' },
                              { label: 'Price Realization Lag', val: '-4%', color: 'text-red-400' },
                              { label: 'Portfolio Product Mix', val: '-5%', color: 'text-orange-400' }
                            ].map((item, idx) => (
                              <div key={idx} className="p-2.5 rounded-lg border border-zinc-900 bg-[#0f0e13] flex justify-between items-center hover:border-purple-500/30 transition-colors">
                                <span className="font-bold text-[9.5px] text-white leading-tight">{item.label}</span>
                                <span className={`font-mono font-black text-[9.5px] ${item.color}`}>{item.val}</span>
                              </div>
                            ))}
                            <div 
                              onClick={() => setIsZoomedRootCause(true)}
                              className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center cursor-pointer hover:bg-purple-500/20 transition-all mt-1"
                            >
                              <span className="text-[9.5px] text-purple-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                                <Sparkles size={11} /> Open Detailed Trace Console
                              </span>
                            </div>

                            <div 
                              onClick={() => setActiveDiagnosticTab('impact')}
                              className="p-3 bg-[#6b21a8]/25 border border-purple-500/35 rounded-lg text-center cursor-pointer hover:bg-[#6b21a8]/40 transition-all mt-2 select-none"
                            >
                              <span className="text-[9.5px] text-white font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                                Attribute EBITDA Impact &rarr;
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeDiagnosticTab === 'impact' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start animate-in fade-in duration-200">
                        {/* Left Column: Attributed EBITDA Leakage Ledger */}
                        <div className="lg:col-span-2 bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Attributed EBITDA Leakage Breakdown</span>
                          <div className="flex flex-col gap-2.5 mt-1">
                            {[
                              { driver: 'Raw Material Price Surcharges', value: '-$820,000', contribution: '29.3%', pct: 29, color: 'bg-red-500' },
                              { driver: 'Price Realization Backlog', value: '-$620,000', contribution: '22.1%', pct: 22, color: 'bg-red-500' },
                              { driver: 'Product Mix cannibalization', value: '-$510,000', contribution: '18.2%', pct: 18, color: 'bg-orange-500' },
                              { driver: 'Raw Packaging Closure tariffs', value: '-$450,000', contribution: '16.1%', pct: 16, color: 'bg-orange-500' },
                              { driver: 'Ingredient sweetner cost drift', value: '-$320,000', contribution: '11.4%', pct: 11, color: 'bg-yellow-500' },
                              { driver: 'Promotional trade overspend', value: '-$320,000', contribution: '11.4%', pct: 11, color: 'bg-yellow-500' }
                            ].map((item, idx) => (
                              <div key={idx} className="flex flex-col gap-1 bg-[#0f0e13] border border-zinc-900 p-2.5 rounded-lg">
                                <div className="flex justify-between text-[9px] font-bold">
                                  <span className="text-zinc-400">{item.driver}</span>
                                  <div className="flex gap-2">
                                    <span className="text-white font-mono">{item.value}</span>
                                    <span className="text-zinc-500">({item.contribution})</span>
                                  </div>
                                </div>
                                <div className="w-full h-1.5 bg-[#16151c] rounded-full overflow-hidden border border-zinc-900/40">
                                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct * 3}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div 
                            onClick={() => setActiveDiagnosticTab('scenario')}
                            className="mt-3.5 p-3 bg-[#6b21a8]/20 border border-purple-500/35 rounded-lg text-center cursor-pointer hover:bg-[#6b21a8]/35 transition-all font-sans select-none"
                          >
                            <span className="text-[9.5px] text-purple-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                              <Sparkles size={11} /> Run Scenario Simulations &rarr;
                            </span>
                          </div>
                        </div>

                        {/* Right Column: Risk Exposure Forecast */}
                        <div className="lg:col-span-1 bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Risk Exposure Forecast</span>
                          <div className="flex flex-col gap-2 mt-1">
                            {[
                              { label: 'Financial Exposure', val: '$2.8M', desc: 'Attributed quarterly EBITDA leak', badge: 'Critical', bg: 'text-red-400 border-red-500/20 bg-red-500/5' },
                              { label: 'Revenue at Risk', val: '$4.1M', desc: 'At risk turnover from logistics lag', badge: 'Critical', bg: 'text-red-400 border-red-500/20 bg-red-500/5' },
                              { label: 'Customer NPS impact', val: '-8 pts', desc: 'Complaints on product quality', badge: 'High', bg: 'text-orange-400 border-orange-500/20 bg-orange-500/5' },
                              { label: 'Sourcing Volatility Index', val: 'Medium', desc: 'Vendor delivery confidence rating', badge: 'Medium', bg: 'text-amber-400 border-amber-500/20 bg-amber-500/5' }
                            ].map((item, idx) => (
                              <div key={idx} className="p-2.5 bg-[#0f0e13] border border-zinc-900 rounded-lg flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9.5px] font-extrabold text-white">{item.label}</span>
                                  <span className={`text-[6.5px] font-black uppercase px-1 rounded border ${item.bg}`}>{item.badge}</span>
                                </div>
                                <span className="text-[14px] font-mono font-black text-white">{item.val}</span>
                                <span className="text-[7.5px] text-zinc-500 leading-none">{item.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeDiagnosticTab === 'scenario' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start animate-in fade-in duration-200">
                        {/* Left Column: Elasticity Simulation Queue */}
                        <div className="lg:col-span-2 bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Elasticity Simulation Queue</span>
                          <div className="flex flex-col gap-2 mt-1">
                            {[
                              { scenario: 'Run #1: +4% wholesale pricing adjustment', desc: 'Significantly increases revenue with minimal volume drop', roi: '+$1,200,000', conf: 92, badge: 'Optimal', badgeColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                              { scenario: 'Run #2: +10% aggressive list price hike', desc: 'High risk of product delisting & customer churn in West', roi: '+$840,000', conf: 82, badge: 'High Risk', badgeColor: 'text-red-400 border-red-500/20 bg-red-500/5' },
                              { scenario: 'Run #3: Container procurement raw-rate hedging', desc: 'Sign long-term glass container supply contract at baseline rates', roi: '+$450,000', conf: 85, badge: 'Recommended', badgeColor: 'text-purple-400 border-purple-500/20 bg-purple-500/5' },
                              { scenario: 'Run #4: Alternate natural sweetener transition', desc: 'Substitute sucrose with corn syrup to reduce formulation cost', roi: '+$320,000', conf: 70, badge: 'Vetting Req.', badgeColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5' }
                            ].map((item, idx) => (
                              <div key={idx} className="p-2.5 bg-[#0f0e13] border border-zinc-900 rounded-lg flex justify-between items-center gap-3">
                                <div className="flex flex-col gap-0.5 max-w-[280px]">
                                  <span className="text-[9.5px] font-bold text-white leading-tight">{item.scenario}</span>
                                  <span className="text-[7.5px] text-zinc-600 leading-relaxed font-medium">{item.desc}</span>
                                </div>
                                <div className="text-right flex flex-col gap-1 flex-shrink-0">
                                  <span className="text-[11.5px] font-mono font-black text-white">{item.roi}</span>
                                  <span className={`text-[6px] font-black uppercase px-1 rounded border leading-none py-0.5 ${item.badgeColor}`}>{item.badge}</span>
                                  <span className="text-[7.5px] text-zinc-500 font-mono text-[7px]">Conf: {item.conf}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div 
                            onClick={() => setActiveDiagnosticTab('recs')}
                            className="mt-3.5 p-3 bg-[#6b21a8]/20 border border-purple-500/35 rounded-lg text-center cursor-pointer hover:bg-[#6b21a8]/35 transition-all font-sans select-none"
                          >
                            <span className="text-[9.5px] text-purple-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                              <Sparkles size={11} /> Compile Mitigation Proposals &rarr;
                            </span>
                          </div>
                        </div>

                        {/* Right Column: Simulation Outcomes Console */}
                        <div className="lg:col-span-1 bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3 min-h-[300px] justify-between">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Monte Carlo Outcomes Console</span>
                          
                          <div className="flex flex-col gap-3 py-3 border-y border-zinc-900">
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[8px] font-extrabold text-zinc-500 uppercase">
                                <span>Best Case ROI Projection</span>
                                <span className="text-emerald-400 font-bold">+$1.8M</span>
                              </div>
                              <div className="w-full h-1 bg-[#16151c] rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[8px] font-extrabold text-zinc-500 uppercase">
                                <span>Weighted Average ROI</span>
                                <span className="text-purple-400 font-bold">+$1.2M</span>
                              </div>
                              <div className="w-full h-1 bg-[#16151c] rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: '66%' }} />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[8px] font-extrabold text-zinc-500 uppercase">
                                <span>Worst Case ROI Protection</span>
                                <span className="text-red-400 font-bold">-$800k</span>
                              </div>
                              <div className="w-full h-1 bg-[#16151c] rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: '40%' }} />
                              </div>
                            </div>
                          </div>

                          <div className="text-[7.5px] text-zinc-600 italic leading-relaxed text-center font-medium">
                            Monte Carlo simulations run complete. Projected ROI converged at 99.8% stability index across 420 random price elasticity paths.
                          </div>
                        </div>
                      </div>
                    )}

                    {activeDiagnosticTab === 'alerts' && (
                      <div className="bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3 select-none animate-in fade-in duration-200">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">System Alert Triage Ledger</span>
                          <span className="text-[8px] text-zinc-500 mt-0.5 leading-normal">Real-time system alarms triaged and assigned to diagnostic agents</span>
                        </div>

                        <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20 mt-1">
                          <table className="w-full text-[8.5px] text-left border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-900 text-zinc-500 font-extrabold bg-[#0d0d12]/30 uppercase text-[7.5px] tracking-wide">
                                <th className="p-2.5">Alert ID</th>
                                <th className="p-2.5">Violation Target</th>
                                <th className="p-2.5">Metric Severity</th>
                                <th className="p-2.5">EBITDA Leakage</th>
                                <th className="p-2.5">Triage Assignee</th>
                                <th className="p-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900/40 text-zinc-400">
                              {[
                                { id: 'ALT-109 • 12m ago', target: 'Beverage Category (West Division - Segment A)', desc: 'Critical margin slip due to pricing realization lag', sev: 'Critical', sevColor: 'text-red-400 border-red-500/20 bg-red-500/5', leak: '$320k', assignee: 'Wholesale Pricing Agent', status: 'Triaged', statusColor: 'text-emerald-400' },
                                { id: 'ALT-112 • 24m ago', target: 'Energy segment (National Accounts)', desc: 'Contract volume drop below limits', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', leak: '$120k', assignee: 'Commercial Contract Agent', status: 'Investigating', statusColor: 'text-amber-500' },
                                { id: 'ALT-084 • 1h ago', target: 'Premium Juice Line (Line B packaging)', desc: 'Container surcharge adjustment delay', sev: 'High', sevColor: 'text-orange-400 border-orange-500/20 bg-orange-500/5', leak: '$450k', assignee: 'Procurement Sourcing Agent', status: 'Queued', statusColor: 'text-zinc-500' },
                                { id: 'ALT-065 • 2h ago', target: 'Syrup formulation (Batch #42)', desc: 'Formulation acidity variance drift', sev: 'Medium', sevColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5', leak: '$180k', assignee: 'Formulation Tuning Agent', status: 'Triaged', statusColor: 'text-emerald-400' },
                                { id: 'ALT-055 • 4h ago', target: 'Product Portfolio SKU mapping', desc: 'Low margin product mix cannibalization', sev: 'Critical', sevColor: 'text-red-400 border-red-500/20 bg-red-500/5', leak: '$510k', assignee: 'Portfolio Audit Agent', status: 'Investigating', statusColor: 'text-amber-500' },
                                { id: 'ALT-022 • 8h ago', target: 'Distributor discount approvals', desc: 'Overlapping trade spends limit overrun', sev: 'Medium', sevColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5', leak: '$320k', assignee: 'Finance Ledger Agent', status: 'Triaged', statusColor: 'text-emerald-400' }
                              ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.01]">
                                  <td className="p-2.5 flex flex-col gap-0.5">
                                    <span className="font-bold text-white font-mono text-[9px]">{row.id.split(' • ')[0]}</span>
                                    <span className="text-[7.5px] text-zinc-600 font-bold leading-normal">{row.id.split(' • ')[1]}</span>
                                  </td>
                                  <td className="p-2.5">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-bold text-white text-[9px]">{row.target}</span>
                                      <span className="text-[7.5px] text-zinc-500 leading-tight">{row.desc}</span>
                                    </div>
                                  </td>
                                  <td className="p-2.5">
                                    <span className={`text-[6.5px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${row.sevColor}`}>
                                      {row.sev}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-mono font-bold text-white text-[9px]">{row.leak}</td>
                                  <td className="p-2.5 text-zinc-400 font-bold text-[8.5px]">{row.assignee}</td>
                                  <td className="p-2.5 font-bold text-[8.5px]"><span className={row.statusColor}>{row.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div 
                          onClick={() => setActiveDiagnosticTab('root')}
                          className="mt-3.5 p-3 bg-[#6b21a8]/20 border border-purple-500/35 rounded-lg text-center cursor-pointer hover:bg-[#6b21a8]/35 transition-all font-sans select-none"
                        >
                          <span className="text-[9.5px] text-purple-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                            <Sparkles size={11} /> Trace Root Cause in Causal Network &rarr;
                          </span>
                        </div>
                      </div>
                    )}

                    {activeDiagnosticTab === 'recs' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start animate-in fade-in duration-200">
                        {/* Left Column: Proposed Mitigations Grid */}
                        <div className="lg:col-span-2 bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Proposed Mitigations Queue</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                            {[
                              { title: 'Source alternate cap supplier', desc: 'Onboard pre-approved vendor B to hedge glass container closure rates.', val: '+$450K EBITDA', conf: 90, tag: 'High Impact', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5' },
                              { title: 'Re-negotiate raw pricing contracts', desc: 'Contract bulk raw materials to lock in Q4 costing indices.', val: '+$800K EBITDA', conf: 82, tag: 'Medium Impact', tagColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5' },
                              { title: 'Trigger overlap SKU consolidation', desc: 'Consolidate 12 duplicate listings in category C to reduce shelf complexity.', val: '+$400K EBITDA', conf: 92, tag: 'High Impact', tagColor: 'text-red-400 border-red-500/20 bg-red-500/5' },
                              { title: 'Adjust wholesale pricing tier levels', desc: 'Deploy automated index-linked pricing adjusts on wholesale accounts.', val: '+$1.2M EBITDA', conf: 95, tag: 'Critical Impact', tagColor: 'text-purple-400 border-purple-500/20 bg-purple-500/5' }
                            ].map((rec, idx) => (
                              <div key={idx} className="bg-[#0f0e13] border border-zinc-900 p-3 rounded-lg flex flex-col justify-between min-h-[120px] hover:border-purple-500/30 transition-colors cursor-pointer">
                                <div className="flex flex-col gap-1.5">
                                  <span className={`text-[6px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border w-fit ${rec.tagColor}`}>
                                    {rec.tag}
                                  </span>
                                  <span className="font-bold text-[9.5px] text-white leading-tight mt-0.5">{rec.title}</span>
                                  <p className="text-[7.5px] text-zinc-600 leading-relaxed font-medium mt-0.5">{rec.desc}</p>
                                </div>
                                
                                <div className="border-t border-zinc-900/80 pt-2 flex flex-col gap-1.5 mt-2 text-[8px] text-zinc-400">
                                  <div className="flex justify-between font-bold">
                                    <span>Potential Recovery</span>
                                    <span className="text-emerald-400 font-mono">{rec.val}</span>
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex justify-between font-medium text-[7px] text-zinc-500">
                                      <span>Confidence Score</span>
                                      <span>{rec.conf}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-[#16151c] rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rec.conf}%` }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Column: Human-in-the-Loop ERP Commit Console */}
                        <div className="lg:col-span-1 bg-[#121217] border border-zinc-900/60 p-4.5 rounded-xl flex flex-col gap-3 min-h-[300px] justify-between">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">ERP Commit Console</span>
                            <span className="text-[7.5px] text-zinc-600 leading-normal">Authorize AI recommendations and write back variables directly to active ledgers</span>
                          </div>

                          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900 flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                              <span className="text-[9px] font-bold text-white">Pending Action Review</span>
                            </div>
                            <p className="text-[8px] text-zinc-500 leading-relaxed">
                              Select any proposed mitigation card in the queue to preview write-back variables and compile approval logs.
                            </p>
                            <button 
                              disabled 
                              className="w-full py-2 bg-purple-500/10 border border-purple-500/10 text-purple-400/50 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-not-allowed"
                            >
                              Select Card to Authorize
                            </button>
                          </div>

                          <div className="flex flex-col gap-1.5 text-[7.5px] text-zinc-700 bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-900/30">
                            <span className="font-mono uppercase font-black tracking-widest text-zinc-500 text-[6.5px]">Policy Guardrail Check</span>
                            <div className="flex justify-between">
                              <span>• Pricing elastic limits verified</span>
                              <span className="text-emerald-500 font-bold">PASS</span>
                            </div>
                            <div className="flex justify-between">
                              <span>• Formulation recipe variance bounds</span>
                              <span className="text-emerald-500 font-bold">PASS</span>
                            </div>
                            <div className="flex justify-between">
                              <span>• Vendor contract pricing limits</span>
                              <span className="text-emerald-500 font-bold">PASS</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer actions */}
                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-3 mt-0.5 text-[8.5px]">
                      <div className="flex items-center gap-1.5 text-zinc-600 font-semibold font-mono">
                        <svg className="w-3.5 h-3.5 text-zinc-700 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        <span>Auto Refresh: <span className="text-emerald-400 font-extrabold">ON</span></span>
                      </div>

                    </div>

                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-zinc-800/80 pt-3 mt-1 text-[8px] text-zinc-500 tracking-wider font-mono">
          <span>PROVENANCE PIPELINE DIAGNOSTIC VIEW</span>
          <span className="italic">Click on any step card above to see the corresponding deep-dive panel.</span>
        </div>

      </div>

      {/* Expanded Causal Network Zoom Modal Overlay */}
      {isZoomedRootCause && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[130] flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setIsZoomedRootCause(false)}
        >
          <div 
            className="w-full max-w-5xl bg-[#0b0a0e] border border-purple-500/25 rounded-2xl p-6 shadow-[0_0_60px_rgba(168,85,247,0.2)] flex flex-col gap-5 text-xs max-h-[90vh] overflow-y-auto font-sans relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-800/80 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="text-[14px] font-bold text-white font-mono uppercase tracking-wider animate-pulse">
                    Interactive Causal Network Trace
                  </h3>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Trace multi-agent causal inference logs mapping feedstock price hikes, price realization delay, and product margin erosion.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsZoomedRootCause(false)}
                className="p-1.5 rounded cursor-pointer border border-zinc-800 bg-[#16151c] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Columns: Expanded Interactive SVG */}
              <div className="lg:col-span-2 bg-zinc-950/40 border border-zinc-900/60 p-4 rounded-xl flex flex-col gap-3 relative select-none">
                <div className="flex justify-between items-center">
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                    Visual Causal Reasoning Map
                  </span>
                  <span className="text-[8px] text-zinc-600 italic font-mono">
                    Hover over nodes or ledger cards to highlight causal relationships
                  </span>
                </div>
                
                <div className="w-full aspect-[16/9] border border-zinc-900/40 rounded-lg bg-zinc-950/60 p-2 overflow-hidden flex items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 600 337.5" fill="none">
                    <defs>
                      <marker id="arrow-red-lg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                      </marker>
                      <marker id="arrow-orange-lg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f97316" />
                      </marker>
                    </defs>

                    {/* Connection lines from Sourcing (Left) */}
                    <path 
                      d="M 160 48 C 220 48, 220 90, 265 95" 
                      stroke="#ef4444" 
                      strokeWidth={hoveredNode === 'material' ? 2.5 : 1.2} 
                      strokeDasharray={hoveredNode === 'material' ? '0' : '4 4'} 
                      className={`transition-all duration-300 ${hoveredNode === 'material' ? 'opacity-100' : 'opacity-35'}`} 
                      markerEnd="url(#arrow-red-lg)" 
                    />
                    <path 
                      d="M 160 138 C 220 138, 220 120, 258 115" 
                      stroke="#f97316" 
                      strokeWidth={hoveredNode === 'packaging' ? 2.5 : 1.2} 
                      strokeDasharray={hoveredNode === 'packaging' ? '0' : '4 4'} 
                      className={`transition-all duration-300 ${hoveredNode === 'packaging' ? 'opacity-100' : 'opacity-35'}`} 
                      markerEnd="url(#arrow-orange-lg)" 
                    />
                    <path 
                      d="M 210 258 C 240 258, 250 200, 280 150" 
                      stroke="#ef4444" 
                      strokeWidth={hoveredNode === 'ingredient' ? 2.5 : 1.2} 
                      strokeDasharray={hoveredNode === 'ingredient' ? '0' : '4 4'} 
                      className={`transition-all duration-300 ${hoveredNode === 'ingredient' ? 'opacity-100' : 'opacity-35'}`} 
                      markerEnd="url(#arrow-red-lg)" 
                    />

                    {/* Connection lines from Commercial (Right) */}
                    <path 
                      d="M 440 48 C 380 48, 380 90, 335 95" 
                      stroke="#ef4444" 
                      strokeWidth={hoveredNode === 'pricing' ? 2.5 : 1.2} 
                      strokeDasharray={hoveredNode === 'pricing' ? '0' : '4 4'} 
                      className={`transition-all duration-300 ${hoveredNode === 'pricing' ? 'opacity-100' : 'opacity-35'}`} 
                      markerEnd="url(#arrow-red-lg)" 
                    />
                    <path 
                      d="M 440 138 C 380 138, 380 120, 342 115" 
                      stroke="#f97316" 
                      strokeWidth={hoveredNode === 'mix' ? 2.5 : 1.2} 
                      strokeDasharray={hoveredNode === 'mix' ? '0' : '4 4'} 
                      className={`transition-all duration-300 ${hoveredNode === 'mix' ? 'opacity-100' : 'opacity-35'}`} 
                      markerEnd="url(#arrow-orange-lg)" 
                    />
                    <path 
                      d="M 390 258 C 360 258, 350 200, 320 150" 
                      stroke="#f97316" 
                      strokeWidth={hoveredNode === 'promotion' ? 2.5 : 1.2} 
                      strokeDasharray={hoveredNode === 'promotion' ? '0' : '4 4'} 
                      className={`transition-all duration-300 ${hoveredNode === 'promotion' ? 'opacity-100' : 'opacity-35'}`} 
                      markerEnd="url(#arrow-orange-lg)" 
                    />

                    {/* Central Glowing Node */}
                    <circle cx="300" cy="110" r="46" fill="#120d20" stroke="#a855f7" strokeWidth="2" className="shadow-[0_0_20px_rgba(168,85,247,0.35)]" />
                    <circle cx="300" cy="110" r="54" fill="none" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="3 3" className="opacity-45" />
                    <text x="300" y="102" textAnchor="middle" fontSize="9" fill="#ffffff" fontWeight="black" fontFamily="monospace" letterSpacing="0.5">EBITDA LEAKAGE</text>
                    <text x="300" y="115" textAnchor="middle" fontSize="10.5" fill="#a855f7" fontWeight="black" fontFamily="sans-serif">Margin Erosion</text>
                    <text x="300" y="127" textAnchor="middle" fontSize="8" fill="#ef4444" fontWeight="bold" fontFamily="monospace">Est: -$2.8M Impact</text>

                    {/* Sourcing / COGS Pressures (Left) */}
                    
                    {/* Node: Raw Material */}
                    <foreignObject 
                      x={10} y={25} width={150} height={46}
                      onMouseEnter={() => setHoveredNode('material')}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <div className={`bg-[#0d0c11] border rounded-lg p-2 flex flex-col justify-center h-full transition-all duration-300 ${
                        hoveredNode === 'material' 
                          ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] bg-red-500/[0.02]' 
                          : 'border-red-500/20'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="text-red-400 font-extrabold text-[8px] uppercase tracking-wide">&uarr; Raw Material</span>
                          <span className="text-red-400 font-mono font-bold text-[8.5px]">+12%</span>
                        </div>
                        <span className="text-zinc-500 font-medium text-[7.5px] leading-tight mt-0.5 truncate">Steel index surge</span>
                      </div>
                    </foreignObject>

                    {/* Node: Raw Packaging */}
                    <foreignObject 
                      x={10} y={115} width={150} height={46}
                      onMouseEnter={() => setHoveredNode('packaging')}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <div className={`bg-[#0d0c11] border rounded-lg p-2 flex flex-col justify-center h-full transition-all duration-300 ${
                        hoveredNode === 'packaging' 
                          ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.25)] bg-orange-500/[0.02]' 
                          : 'border-orange-500/20'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-extrabold text-[8px] uppercase tracking-wide">&uarr; Raw Packaging</span>
                          <span className="text-orange-400 font-mono font-bold text-[8.5px]">+8%</span>
                        </div>
                        <span className="text-zinc-500 font-medium text-[7.5px] leading-tight mt-0.5 truncate">Glass closures surcharge</span>
                      </div>
                    </foreignObject>

                    {/* Node: Ingredient */}
                    <foreignObject 
                      x={60} y={235} width={150} height={46}
                      onMouseEnter={() => setHoveredNode('ingredient')}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <div className={`bg-[#0d0c11] border rounded-lg p-2 flex flex-col justify-center h-full transition-all duration-300 ${
                        hoveredNode === 'ingredient' 
                          ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] bg-red-500/[0.02]' 
                          : 'border-red-500/20'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="text-red-400 font-extrabold text-[8px] uppercase tracking-wide">&uarr; Ingredient Cost</span>
                          <span className="text-red-400 font-mono font-bold text-[8.5px]">+7%</span>
                        </div>
                        <span className="text-zinc-500 font-medium text-[7.5px] leading-tight mt-0.5 truncate">Sweetener constraints</span>
                      </div>
                    </foreignObject>

                    {/* Commercial / Revenue Pressures (Right) */}

                    {/* Node: Price Realization */}
                    <foreignObject 
                      x={440} y={25} width={150} height={46}
                      onMouseEnter={() => setHoveredNode('pricing')}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <div className={`bg-[#0d0c11] border rounded-lg p-2 flex flex-col justify-center h-full transition-all duration-300 ${
                        hoveredNode === 'pricing' 
                          ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] bg-red-500/[0.02]' 
                          : 'border-red-500/20'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="text-red-400 font-extrabold text-[8px] uppercase tracking-wide">&darr; Price Realization</span>
                          <span className="text-red-400 font-mono font-bold text-[8.5px]">-4%</span>
                        </div>
                        <span className="text-zinc-500 font-medium text-[7.5px] leading-tight mt-0.5 truncate text-right">Contract adjustment lag</span>
                      </div>
                    </foreignObject>

                    {/* Node: Product Mix */}
                    <foreignObject 
                      x={440} y={115} width={150} height={46}
                      onMouseEnter={() => setHoveredNode('mix')}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <div className={`bg-[#0d0c11] border rounded-lg p-2 flex flex-col justify-center h-full transition-all duration-300 ${
                        hoveredNode === 'mix' 
                          ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.25)] bg-orange-500/[0.02]' 
                          : 'border-orange-500/20'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-extrabold text-[8px] uppercase tracking-wide">&darr; Product Mix</span>
                          <span className="text-orange-400 font-mono font-bold text-[8.5px]">-5%</span>
                        </div>
                        <span className="text-zinc-500 font-medium text-[7.5px] leading-tight mt-0.5 truncate text-right">Low-margin volume surge</span>
                      </div>
                    </foreignObject>

                    {/* Node: Promotional Spend */}
                    <foreignObject 
                      x={390} y={235} width={150} height={46}
                      onMouseEnter={() => setHoveredNode('promotion')}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <div className={`bg-[#0d0c11] border rounded-lg p-2 flex flex-col justify-center h-full transition-all duration-300 ${
                        hoveredNode === 'promotion' 
                          ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.25)] bg-orange-500/[0.02]' 
                          : 'border-orange-500/20'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-400 font-extrabold text-[8px] uppercase tracking-wide">&uarr; Promo Spend</span>
                          <span className="text-orange-400 font-mono font-bold text-[8.5px]">-3%</span>
                        </div>
                        <span className="text-zinc-500 font-medium text-[7.5px] leading-tight mt-0.5 truncate text-right">West trade overspend</span>
                      </div>
                    </foreignObject>
                  </svg>
                </div>
              </div>

              {/* Right Column: Detailed Ledger details */}
              <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-auto h-full max-h-[385px] pr-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Attribution & Mitigations
                </span>
                
                <div className="flex flex-col gap-2">
                  {[
                    {
                      id: 'material',
                      title: 'Raw Material Inflation',
                      subtitle: 'COGS Pressure',
                      metric: '+12%',
                      impact: '-$820k EBITDA',
                      confidence: '94%',
                      desc: 'Automated SAP audit identified global steel index surge of 18% impacting wholesale packaging container pricing contracts.',
                      mitigation: 'Activate dual-sourcing options on secondary supplier contract B.',
                      color: 'red',
                      textClr: 'text-red-400'
                    },
                    {
                      id: 'packaging',
                      title: 'Raw Packaging Surcharges',
                      subtitle: 'COGS Pressure',
                      metric: '+8%',
                      impact: '-$450k EBITDA',
                      confidence: '88%',
                      desc: 'Unplanned energy and logistics tariffs applied on glass closures. Swarm agents detected supplier price adjustment discrepancy.',
                      mitigation: 'Trigger price discrepancy audit with Procurement team.',
                      color: 'orange',
                      textClr: 'text-orange-400'
                    },
                    {
                      id: 'pricing',
                      title: 'Price Realization Lag',
                      subtitle: 'Revenue Leakage',
                      metric: '-4%',
                      impact: '-$620k EBITDA',
                      confidence: '95%',
                      desc: 'Wholesale contract renewal pricing adjustments delayed by 3 weeks due to manual routing backlog in CRM systems.',
                      mitigation: 'Automate wholesale price index adjustments in CRM systems.',
                      color: 'red',
                      textClr: 'text-red-400'
                    },
                    {
                      id: 'mix',
                      title: 'Portfolio Product Mix',
                      subtitle: 'Margin Dilution',
                      metric: '-5%',
                      impact: '-$510k EBITDA',
                      confidence: '89%',
                      desc: 'Low-margin high-volume product SKUs grew 14% while high-margin premium juice segment sales fell by 4%.',
                      mitigation: 'Re-align commercial incentives toward high-margin premium juice SKUs.',
                      color: 'orange',
                      textClr: 'text-orange-400'
                    },
                    {
                      id: 'ingredient',
                      title: 'Ingredient Cost Drift',
                      subtitle: 'COGS Pressure',
                      metric: '+7%',
                      impact: '-$320k EBITDA',
                      confidence: '91%',
                      desc: 'Natural flavor sweeteners supply pinch drove spot-market prices up. Recipe optimization agents suggesting corn syrup substitutions.',
                      mitigation: 'Approve recipe modification simulator runs for minor formulation adjustment.',
                      color: 'red',
                      textClr: 'text-red-400'
                    },
                    {
                      id: 'promotion',
                      title: 'Promotional Overspend',
                      subtitle: 'Revenue Leakage',
                      metric: '-3%',
                      impact: '-$320k EBITDA',
                      confidence: '78%',
                      desc: 'Overlapping distributor-led trade discounts applied without proper verification, exceeding target margin limits in West.',
                      mitigation: 'Enforce maximum discount limits in the automated pricing approval flow.',
                      color: 'orange',
                      textClr: 'text-orange-400'
                    }
                  ].map((node) => (
                    <div 
                      key={node.id}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                        hoveredNode === node.id 
                          ? 'bg-purple-950/20 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
                          : 'bg-[#121217] border-zinc-900/80 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[6px] font-black uppercase px-1 rounded ${
                              node.color === 'red' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}>
                              {node.subtitle}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-500 font-bold">Conf: {node.confidence}</span>
                          </div>
                          <span className="font-bold text-[10px] text-white mt-1 leading-tight">{node.title}</span>
                        </div>
                        <div className="text-right flex flex-col gap-0.5">
                          <span className={`text-[9.5px] font-mono font-black ${node.textClr}`}>{node.metric}</span>
                          <span className="text-[7.5px] text-zinc-400 font-bold">{node.impact}</span>
                        </div>
                      </div>
                      
                      <div className={`overflow-hidden transition-all duration-300 ${
                        hoveredNode === node.id ? 'max-h-[140px] opacity-100 mt-2' : 'max-h-0 opacity-0 pointer-events-none'
                      }`}>
                        <p className="text-[8.5px] leading-relaxed text-zinc-400">{node.desc}</p>
                        <div className="p-1.5 rounded bg-zinc-950 border border-zinc-900 text-purple-400 font-semibold flex flex-col gap-0.5 mt-1.5">
                          <span className="text-[6.5px] text-zinc-500 uppercase tracking-wider font-mono">Mitigation Proposal</span>
                          <span>{node.mitigation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div 
                    onClick={() => {
                      setIsZoomedRootCause(false);
                      setActiveDiagnosticTab('impact');
                    }}
                    className="p-3 bg-[#6b21a8]/25 border border-purple-500/35 rounded-xl text-center cursor-pointer hover:bg-[#6b21a8]/40 transition-all mt-2 select-none"
                  >
                    <span className="text-[9.5px] text-white font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                      Close & Attribute EBITDA Impact &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
