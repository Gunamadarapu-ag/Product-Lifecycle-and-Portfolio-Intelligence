/**
 * Static panel content for the Agentic Alert explanation modal.
 *
 * Extracted verbatim from AgenticAlertExplanationModal.tsx. All three objects
 * are literals independent of props and state.
 */

export type IngestSourceTab = 'finance' | 'crm' | 'iot' | 'api';
export type ComputeTab = 'process' | 'vis' | 'recs' | 'collab' | 'gov';
export type DiagnosticTab = 'diagnostic' | 'root' | 'impact' | 'scenario' | 'alerts' | 'recs';

// Source-specific high fidelity data for Ingestion (Step 1)
export const tabData = {
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
export const computeData = {
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
export const diagnosticData = {
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
