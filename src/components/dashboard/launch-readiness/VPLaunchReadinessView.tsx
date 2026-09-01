import React, { useState, useEffect } from 'react';
import { 
  Filter, RefreshCw, Download, Zap, BarChart2, PieChart as PieIcon, Shield, ShieldAlert, DollarSign, Activity, Play, Check, AlertTriangle, Rocket, TrendingUp, Grid, Table, X, Layers,
  Calendar, User, Plus, Search, ChevronRight, HelpCircle, CheckCircle2, XCircle, AlertCircle, Clock, FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  PieChart, Pie, AreaChart, Area
} from 'recharts';
import { ResolveEscalationModal, VPEscalation } from './ResolveEscalationModal';
import { EmailComposerModal } from '../portfolio-health/EmailComposerModal';
import { SuccessFeedbackModal } from '../portfolio-health/SuccessFeedbackModal';
import { AIPredictionModal } from '../signals-board/AIPredictionModal';
import { ModalShell } from '../../common/Modal';
import { LAYER } from '../../../constants/layers';
import { useDialogBehavior } from '../../../hooks/useDialogBehavior';

export interface StageGateRecord {
  stageName: 'Concept' | 'Development' | 'Validation' | 'Launch Ready' | 'Live';
  gateName: string;
  reviewer: string;
  reviewDate: string;
  status: 'Passed' | 'Failed' | 'Waived' | 'Pending';
  riskRating: 'No Risk' | 'High Risk' | 'Medium/High Risk' | 'Attention Required';
  approvalNotes: string;
  supportingDocs: string[];
  auditTrail: { timestamp: string; action: string; user: string }[];
}

export interface ProductStageGates {
  productId: string;
  productName: string;
  category: string;
  region: string;
  brand: string;
  owner: string;
  gates: StageGateRecord[];
}

const STAGE_NAMES: ('Concept' | 'Development' | 'Validation' | 'Launch Ready' | 'Live')[] = [
  'Concept', 'Development', 'Validation', 'Launch Ready', 'Live'
];

const STAGE_OWNERS: Record<string, string> = {
  'Concept': 'Amit Verma (NPD Lead)',
  'Development': 'Vikram Solanki (QC & Logistics)',
  'Validation': 'Priya Sharma (Brand Director)',
  'Launch Ready': 'Karan Johar (Retail Relations)',
  'Live': 'John D. (Launch Manager)'
};

const generateInitialStageGates = (products: VPLaunchProduct[]): ProductStageGates[] => {
  return products.map(p => {
    let currentStageIndex = 0;
    if (p.stage === 'Ideation') currentStageIndex = 0;
    else if (p.stage === 'Development') currentStageIndex = 1;
    else if (p.stage === 'Testing') currentStageIndex = 2;
    else if (p.stage === 'Pre-market') currentStageIndex = 3;
    else if (p.stage === 'Launch') currentStageIndex = 4;

    const gates: StageGateRecord[] = STAGE_NAMES.map((stageName, idx) => {
      let status: 'Passed' | 'Failed' | 'Waived' | 'Pending' = 'Pending';
      let riskRating: 'No Risk' | 'High Risk' | 'Medium/High Risk' | 'Attention Required' = 'Attention Required';
      let approvalNotes = '';
      let reviewer = STAGE_OWNERS[stageName];
      let reviewDate = '';

      if (idx < currentStageIndex) {
        status = 'Passed';
        riskRating = 'No Risk';
        approvalNotes = `Gate review completed and approved successfully. All exit criteria met.`;
        reviewDate = `2026-03-${10 + idx * 5}`;
      } else if (idx === currentStageIndex) {
        status = 'Pending';
        riskRating = 'Attention Required';
        approvalNotes = `Gate review currently active and under evaluation.`;
        reviewDate = `2026-06-15`;
      } else {
        status = 'Pending';
        riskRating = 'Attention Required';
        approvalNotes = `Not started. Waiting for previous gates to clear.`;
        reviewDate = '--';
      }

      if (p.id === 'LP24' && stageName === 'Development') {
        status = 'Failed';
        riskRating = 'High Risk';
        approvalNotes = `CRITICAL FAILURE: Packaging material shortage identified. Co-packer capacity constraint creates a 15-day delay on critical path.`;
        reviewDate = '2026-06-12';
      } else if (p.id === 'LP19' && stageName === 'Validation') {
        status = 'Waived';
        riskRating = 'Medium/High Risk';
        approvalNotes = `WAIVED BY VP OVERRIDE: Logistics lead approved temporary waiver on local packaging standards to meet regional window. Review in Q3.`;
        reviewDate = '2026-06-14';
      } else if (p.id === 'LP25' && stageName === 'Validation') {
        status = 'Failed';
        riskRating = 'High Risk';
        approvalNotes = `CRITICAL FAILURE: EU regulatory compliance check failed on ingredient labels. EU market hold enforced.`;
        reviewDate = '2026-06-10';
      } else if (p.id === 'LP20' && stageName === 'Validation') {
        status = 'Failed';
        riskRating = 'High Risk';
        approvalNotes = `CRITICAL FAILURE: Formulation testing failed sweetness guidelines for region. Formulating V2.`;
        reviewDate = '2026-06-11';
      }

      if (status === 'Waived') {
        riskRating = 'Medium/High Risk';
      } else if (status === 'Failed') {
        riskRating = 'High Risk';
      } else if (status === 'Passed') {
        riskRating = 'No Risk';
      }

      const gateName = `${stageName} Gate Review`;
      const docs = [
        `${stageName}_Checklist_v1.pdf`,
        `${stageName}_Review_Signoff.xlsx`
      ];

      return {
        stageName,
        gateName,
        reviewer,
        reviewDate,
        status,
        riskRating,
        approvalNotes,
        supportingDocs: docs,
        auditTrail: [
          { timestamp: '2026-06-01 09:00', action: 'Gate Review Initialized', user: 'System' },
          ...(status !== 'Pending' ? [
            { timestamp: `${reviewDate} 14:30`, action: `Status marked as ${status}`, user: reviewer }
          ] : [])
        ]
      };
    });

    return {
      productId: p.id,
      productName: p.name,
      category: p.category,
      region: p.region,
      brand: p.brand,
      owner: p.owner,
      gates
    };
  });
};

const RECIPIENT_TITLES: Record<string, string> = {
  'ananya.sen@aciesglobal.com': 'VP Finance',
  'vikram.solanki@aciesglobal.com': 'QC Manager & Logistics Lead',
  'priya.sharma@aciesglobal.com': 'Brand Director',
  'rajendra.patel@aciesglobal.com': 'Vapi Hub Director',
  'amit.verma@aciesglobal.com': 'NPD Lead',
  'karan.johar@aciesglobal.com': 'Retail Relations Director'
};

interface VPLaunchProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  region: string;
  stage: 'Ideation' | 'Development' | 'Testing' | 'Pre-market' | 'Launch';
  quarter: string;
  readiness: number;
  risk: 'High' | 'Medium' | 'Low';
  revExposure: number;
  budget: number;
  spent: number;
  owner: string;
}

const VP_PRODUCTS: VPLaunchProduct[] = [
  { id: 'LP01', name: 'BrandA Premium Energy', category: 'Beverages', brand: 'BrandA', region: 'APAC', stage: 'Pre-market', quarter: 'Q2 2026', readiness: 95, risk: 'Low', revExposure: 1.2, budget: 0.8, spent: 0.75, owner: 'John D.' },
  { id: 'LP02', name: 'BrandB Chips Pro', category: 'Snacks', brand: 'BrandB', region: 'Americas', stage: 'Launch', quarter: 'Q2 2026', readiness: 99, risk: 'Low', revExposure: 1.5, budget: 1.0, spent: 1.0, owner: 'Mike T.' },
  { id: 'LP03', name: 'BrandF Eco Water', category: 'Beverages', brand: 'BrandF', region: 'APAC', stage: 'Testing', quarter: 'Q2 2026', readiness: 88, risk: 'Low', revExposure: 0.9, budget: 0.6, spent: 0.55, owner: 'Dave P.' },
  { id: 'LP04', name: 'BrandD Yogurt Drink', category: 'Beverages', brand: 'BrandD', region: 'EMEA', stage: 'Testing', quarter: 'Q3 2026', readiness: 86, risk: 'Low', revExposure: 0.5, budget: 0.3, spent: 0.25, owner: 'Sarah K.' },
  { id: 'LP05', name: 'BrandB Tortilla Chips', category: 'Snacks', brand: 'BrandB', region: 'Americas', stage: 'Pre-market', quarter: 'Q2 2026', readiness: 88, risk: 'Low', revExposure: 1.1, budget: 0.7, spent: 0.65, owner: 'Mike T.' },
  { id: 'LP06', name: 'BrandF Alkaline Water', category: 'Beverages', brand: 'BrandF', region: 'India', stage: 'Pre-market', quarter: 'Q2 2026', readiness: 97, risk: 'Low', revExposure: 0.4, budget: 0.3, spent: 0.28, owner: 'Dave P.' },
  { id: 'LP07', name: 'BrandA Soy Milk', category: 'Beverages', brand: 'BrandA', region: 'APAC', stage: 'Pre-market', quarter: 'Q3 2026', readiness: 90, risk: 'Low', revExposure: 0.8, budget: 0.5, spent: 0.48, owner: 'John D.' },
  { id: 'LP08', name: 'BrandD Greek Yogurt', category: 'Snacks', brand: 'BrandD', region: 'India', stage: 'Launch', quarter: 'Q2 2026', readiness: 99, risk: 'Low', revExposure: 1.3, budget: 0.8, spent: 0.8, owner: 'Sarah K.' },
  { id: 'LP09', name: 'BrandE Face Scrub', category: 'Personal Care', brand: 'BrandE', region: 'EMEA', stage: 'Testing', quarter: 'Q3 2026', readiness: 85, risk: 'Low', revExposure: 0.7, budget: 0.4, spent: 0.32, owner: 'Anna L.' },
  { id: 'LP10', name: 'BrandG Floor Wipes', category: 'Household', brand: 'BrandG', region: 'EMEA', stage: 'Testing', quarter: 'Q2 2026', readiness: 95, risk: 'Low', revExposure: 0.6, budget: 0.4, spent: 0.38, owner: 'Tom H.' },
  { id: 'LP11', name: 'BrandH Laundry Pods', category: 'Household', brand: 'BrandH', region: 'India', stage: 'Testing', quarter: 'Q3 2026', readiness: 88, risk: 'Low', revExposure: 1.2, budget: 0.8, spent: 0.6, owner: 'Vicky S.' },
  { id: 'LP12', name: 'BrandH Fabric Sheets', category: 'Household', brand: 'BrandH', region: 'Americas', stage: 'Pre-market', quarter: 'Q3 2026', readiness: 89, risk: 'Low', revExposure: 0.5, budget: 0.3, spent: 0.26, owner: 'Vicky S.' },
  { id: 'LP13', name: 'BrandB Potato Crisps', category: 'Snacks', brand: 'BrandB', region: 'APAC', stage: 'Testing', quarter: 'Q2 2026', readiness: 90, risk: 'Low', revExposure: 1.1, budget: 0.7, spent: 0.62, owner: 'Mike T.' },
  { id: 'LP14', name: 'BrandE Hand Wash', category: 'Personal Care', brand: 'BrandE', region: 'APAC', stage: 'Pre-market', quarter: 'Q4 2026', readiness: 85, risk: 'Low', revExposure: 0.9, budget: 0.5, spent: 0.45, owner: 'Anna L.' },
  { id: 'LP15', name: 'BrandA Energy Gel', category: 'Beverages', brand: 'BrandA', region: 'EMEA', stage: 'Pre-market', quarter: 'Q4 2026', readiness: 86, risk: 'Low', revExposure: 0.8, budget: 0.5, spent: 0.44, owner: 'John D.' },
  { id: 'LP16', name: 'BrandE Hair Serum', category: 'Personal Care', brand: 'BrandE', region: 'India', stage: 'Pre-market', quarter: 'Q4 2026', readiness: 87, risk: 'Low', revExposure: 0.7, budget: 0.4, spent: 0.35, owner: 'Anna L.' },
  { id: 'LP17', name: 'BrandG Dish Spray', category: 'Household', brand: 'BrandG', region: 'APAC', stage: 'Development', quarter: 'Q4 2026', readiness: 85, risk: 'Low', revExposure: 0.9, budget: 0.6, spent: 0.4, owner: 'Tom H.' },
  { id: 'LP18', name: 'BrandH Iron Spray', category: 'Household', brand: 'BrandH', region: 'EMEA', stage: 'Ideation', quarter: 'Q4 2026', readiness: 82, risk: 'Low', revExposure: 0.4, budget: 0.3, spent: 0.1, owner: 'Vicky S.' },
  { id: 'LP19', name: 'BrandD Organic Yogurt', category: 'Snacks', brand: 'BrandD', region: 'EMEA', stage: 'Pre-market', quarter: 'Q3 2026', readiness: 74, risk: 'Medium', revExposure: 0.8, budget: 0.5, spent: 0.4, owner: 'Sarah K.' },
  { id: 'LP20', name: 'BrandA Fruit Punch', category: 'Beverages', brand: 'BrandA', region: 'India', stage: 'Pre-market', quarter: 'Q3 2026', readiness: 65, risk: 'Medium', revExposure: 0.7, budget: 0.4, spent: 0.3, owner: 'John D.' },
  { id: 'LP21', name: 'BrandB Pretzel Sticks', category: 'Snacks', brand: 'BrandB', region: 'EMEA', stage: 'Development', quarter: 'Q4 2026', readiness: 71, risk: 'Medium', revExposure: 0.6, budget: 0.4, spent: 0.2, owner: 'Mike T.' },
  { id: 'LP22', name: 'BrandE Body Lotion', category: 'Personal Care', brand: 'BrandE', region: 'Americas', stage: 'Development', quarter: 'Q4 2026', readiness: 62, risk: 'Medium', revExposure: 1.0, budget: 0.6, spent: 0.3, owner: 'Anna L.' },
  { id: 'LP23', name: 'BrandG Glass Cleaner', category: 'Household', brand: 'BrandG', region: 'Americas', stage: 'Pre-market', quarter: 'Q3 2026', readiness: 60, risk: 'Medium', revExposure: 0.8, budget: 0.5, spent: 0.35, owner: 'Tom H.' },
  { id: 'LP24', name: 'BrandC Biscuits Eco', category: 'Snacks', brand: 'BrandC', region: 'EMEA', stage: 'Development', quarter: 'Q4 2026', readiness: 42, risk: 'High', revExposure: 2.1, budget: 1.2, spent: 0.6, owner: 'Lisa R.' },
  { id: 'LP25', name: 'BrandC Chocolate Oats', category: 'Snacks', brand: 'BrandC', region: 'Americas', stage: 'Pre-market', quarter: 'Q4 2026', readiness: 48, risk: 'High', revExposure: 2.1, budget: 1.5, spent: 0.8, owner: 'Lisa R.' }
];

const getHexagonStyles = (status: 'Passed' | 'Failed' | 'Waived' | 'Pending', isCurrentPending: boolean, isDarkMode: boolean) => {
  if (status === 'Passed') {
    return {
      fill: isDarkMode ? 'rgba(74, 222, 128, 0.15)' : '#c6e8b3',
      stroke: isDarkMode ? '#4ade80' : '#4b852f',
      text: isDarkMode ? '#4ade80' : '#4b852f',
    };
  }
  if (status === 'Failed') {
    return {
      fill: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fecaca',
      stroke: isDarkMode ? '#f87171' : '#dc2626',
      text: isDarkMode ? '#f87171' : '#dc2626',
    };
  }
  if (status === 'Waived') {
    return {
      fill: isDarkMode ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7',
      stroke: isDarkMode ? '#fbbf24' : '#d97706',
      text: isDarkMode ? '#fbbf24' : '#d97706',
    };
  }
  // Pending
  if (isCurrentPending) {
    return {
      fill: isDarkMode ? 'rgba(96, 165, 250, 0.15)' : '#bfdbfe',
      stroke: isDarkMode ? '#60a5fa' : '#2563eb',
      text: isDarkMode ? '#60a5fa' : '#2563eb',
    };
  }
  return {
    fill: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
    stroke: isDarkMode ? '#27272a' : '#e4e4e7',
    text: isDarkMode ? '#71717a' : '#71717a',
  };
};

const formatReviewerName = (name: string) => {
  const parts = name.split(' ');
  if (parts.length <= 1) return name;
  const firstName = parts[0];
  const lastName = parts[1];
  if (lastName === 'Verma') {
    return `${firstName} ${lastName}`;
  }
  return `${firstName} ${lastName[0]}.`;
};

interface VPLaunchReadinessViewProps {
  isDarkMode: boolean;
  simulateDelay?: boolean;
  setSimulateDelay?: (v: boolean) => void;
  onAuditClick?: (metric: string) => void;
}

export const VPLaunchReadinessView: React.FC<VPLaunchReadinessViewProps> = ({ 
  isDarkMode, 
  simulateDelay: propSimulateDelay, 
  setSimulateDelay: propSetSimulateDelay,
  onAuditClick
}) => {
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterQuarter, setFilterQuarter] = useState('All');
  const [pipelineView, setPipelineView] = useState<'bar' | 'pie'>('bar');
  const [predictionsView, setPredictionsView] = useState<'grid' | 'table'>('grid');
  const [financialView, setFinancialView] = useState<'bar' | 'area' | 'radar'>('bar');
  const [localSimulateDelay, setLocalSimulateDelay] = useState(false);
  const simulateDelay = propSimulateDelay !== undefined ? propSimulateDelay : localSimulateDelay;
  const setSimulateDelay = propSetSimulateDelay !== undefined ? propSetSimulateDelay : setLocalSimulateDelay;
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [toasts, setToasts] = useState<{ id: string; title: string; body: string; color: string }[]>([]);
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [predictionModalType, setPredictionModalType] = useState<'stockout' | 'elasticity' | 'margin' | 'demand' | 'delay' | null>(null);
  const [selectedStageSKUs, setSelectedStageSKUs] = useState<{ 
    title: string; 
    meaning?: string; 
    skus: VPLaunchProduct[];
    formula?: string;
    lineage?: string;
  } | null>(null);

  const [stageGates, setStageGates] = useState<ProductStageGates[]>(() => generateInitialStageGates(VP_PRODUCTS));
  const [selectedProductId, setSelectedProductId] = useState<string>('LP01');
  const [trackerSelectedCategory, setTrackerSelectedCategory] = useState<string>('Beverages');
  const [selectedStageName, setSelectedStageName] = useState<'Concept' | 'Development' | 'Validation' | 'Launch Ready' | 'Live'>('Concept');
  const [trackerFilterStatus, setTrackerFilterStatus] = useState<string>('All');
  const [trackerFilterOwner, setTrackerFilterOwner] = useState<string>('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Escape-to-close, scroll lock and focus restore for the gate-review drawer.
  useDialogBehavior(isDrawerOpen, () => setIsDrawerOpen(false));
  const [vpCommentText, setVpCommentText] = useState('');

  const handleForcePass = (productId: string, stageName: string) => {
    setStageGates(prev => prev.map(pg => {
      if (pg.productId !== productId) return pg;
      return {
        ...pg,
        gates: pg.gates.map(g => {
          if (g.stageName !== stageName) return g;
          return {
            ...g,
            status: 'Passed' as const,
            riskRating: 'No Risk' as const,
            approvalNotes: `FORCE PASSED BY VP OVERRIDE: Exit criteria manually approved by VP on ${new Date().toLocaleDateString()}.`,
            auditTrail: [
              ...g.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                action: 'Force Passed by VP Override',
                user: 'VP of Product Management'
              }
            ]
          };
        })
      };
    }));
    addToast('Gate Force Passed', `Stage "${stageName}" manually approved by VP.`, '#10b981');
  };

  const handleWaiveGate = (productId: string, stageName: string) => {
    setStageGates(prev => prev.map(pg => {
      if (pg.productId !== productId) return pg;
      return {
        ...pg,
        gates: pg.gates.map(g => {
          if (g.stageName !== stageName) return g;
          return {
            ...g,
            status: 'Waived' as const,
            riskRating: 'Medium/High Risk' as const,
            approvalNotes: `WAIVED BY VP OVERRIDE: Temporary waiver granted by VP on ${new Date().toLocaleDateString()}. Review in Q3.`,
            auditTrail: [
              ...g.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                action: 'Waived by VP Override',
                user: 'VP of Product Management'
              }
            ]
          };
        })
      };
    }));
    addToast('Gate Waived', `Stage "${stageName}" successfully waived by VP.`, '#f59e0b');
  };

  const handleAddComment = (productId: string, stageName: string, comment: string) => {
    if (!comment.trim()) return;
    setStageGates(prev => prev.map(pg => {
      if (pg.productId !== productId) return pg;
      return {
        ...pg,
        gates: pg.gates.map(g => {
          if (g.stageName !== stageName) return g;
          return {
            ...g,
            auditTrail: [
              ...g.auditTrail,
              {
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                action: `Comment: ${comment}`,
                user: 'VP of Product Management'
              }
            ]
          };
        })
      };
    }));
    setVpCommentText('');
    addToast('Comment Posted', 'VP comment appended to the gate audit trail.', '#3b82f6');
  };

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
    const selectedProd = stageGates.find(sg => sg.productId === selectedProductId);
    if (selectedProd && selectedProd.category !== trackerSelectedCategory) {
      setTrackerSelectedCategory(selectedProd.category);
    }
  }, [selectedProductId, stageGates, trackerSelectedCategory]);

  const addToast = (title: string, body: string, color: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, body, color }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [escalations, setEscalations] = useState([
    { id: 'esc1', title: 'Packaging Material Shortage', sub: 'BrandC Biscuits Eco', severity: 'High', impact: '15d Launch Delay', status: 'Pending', color: '#ef4444' },
    { id: 'esc2', title: 'EU Regulatory Approval', sub: 'BrandC Chocolate Oats', severity: 'Medium', impact: 'EU Market Hold', status: 'Pending', color: '#f59e0b' },
    { id: 'esc3', title: 'Co-packer Capacity Constraint', sub: 'BrandD Organic Yogurt', severity: 'High', impact: '$10Cr Revenue Risk', status: 'Pending', color: '#ef4444' },
    { id: 'esc4', title: 'Label Compliance Issue', sub: 'BrandG Glass Cleaner', severity: 'Low', impact: 'Minor packaging rerun', status: 'Pending', color: '#3b82f6' }
  ]);

  const [activeResolveEscalation, setActiveResolveEscalation] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerEmail, setComposerEmail] = useState({ to: '', name: '', subject: '', body: '', action: '' });
  const [successFeedback, setSuccessFeedback] = useState<{
    isOpen: boolean;
    recipientName: string;
    recipientTitle: string;
    recipientEmail: string;
    contextType: 'approval' | 'bottleneck' | 'signal';
    contextTitle: string;
    channel: 'email' | 'message';
  } | null>(null);

  const handleResolveEscalation = (id: string, title: string, actionMsg: string) => {
    setEscalations(prev => prev.filter(e => e.id !== id));
    addToast('Escalation Resolved', `${title}: ${actionMsg}`, '#10b981');
  };

  const [selectedSimProductId, setSelectedSimProductId] = useState<string>('LP01');
  const [activeRecommendations, setActiveRecommendations] = useState<string[]>([]);
  const [simValues, setSimValues] = useState<Record<string, number>>({});

  // Helper to compute stable baseline scores for the 8 dimensions of any product based on its ID, base readiness, and risk rating.
  const getProductDimensions = (p: VPLaunchProduct) => {
    const seed = p.id.charCodeAt(2) + p.id.charCodeAt(3);
    const base = p.readiness;
    
    // Distribute variations around base
    const variations = [
      (seed % 7) - 3,
      ((seed >> 1) % 9) - 4,
      ((seed >> 2) % 5) - 2,
      ((seed >> 3) % 11) - 5,
      ((seed >> 4) % 7) - 3,
      ((seed >> 5) % 9) - 4,
      ((seed >> 6) % 5) - 2,
      0
    ];
    
    const rawScores = variations.map(v => Math.max(10, Math.min(100, base + v * 3)));
    const sumRaw = rawScores.slice(0, 7).reduce((a, b) => a + b, 0);
    const targetSum = base * 8;
    const lastScore = Math.max(10, Math.min(100, targetSum - sumRaw));
    rawScores[7] = lastScore;
    
    return {
      'Product Readiness': rawScores[0],
      'Market Readiness': rawScores[1],
      'Sales Readiness': rawScores[2],
      'Marketing Readiness': rawScores[3],
      'Operations Readiness': rawScores[4],
      'Customer Support Readiness': rawScores[5],
      'Compliance Readiness': rawScores[6],
      'Financial Readiness': rawScores[7]
    };
  };

  const selectedSimProduct = VP_PRODUCTS.find(p => p.id === selectedSimProductId) || VP_PRODUCTS[0];

  useEffect(() => {
    const base = getProductDimensions(selectedSimProduct);
    setSimValues(base);
    setActiveRecommendations([]);
  }, [selectedSimProductId]);

  const processedProducts = VP_PRODUCTS.map(p => {
    let readiness = p.readiness;
    let risk = p.risk;
    let spent = p.spent;

    if (simulateDelay && p.region === 'APAC') {
      readiness = Math.max(0, p.readiness - 15);
      risk = readiness < 50 ? 'High' : readiness < 75 ? 'Medium' : p.risk;
    }

    return {
      ...p,
      readiness,
      risk,
      spent
    };
  });

  const filteredProducts = processedProducts.filter(p => {
    const matchRegion = filterRegion === 'All' || p.region === filterRegion;
    const matchCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchRisk = filterRisk === 'All' || p.risk === matchRiskFilterHelper(filterRisk);
    const matchQuarter = filterQuarter === 'All' || p.quarter === filterQuarter;
    return matchRegion && matchCategory && matchRisk && matchQuarter;
  });

  function matchRiskFilterHelper(filter: string) {
    if (filter === 'High Risk') return 'High';
    if (filter === 'Medium Risk') return 'Medium';
    if (filter === 'Low Risk') return 'Low';
    return filter;
  }

  const totalLaunches = filteredProducts.length;
  const onTrackCount = filteredProducts.filter(p => p.readiness >= 75).length;
  const atRiskCount = filteredProducts.filter(p => p.readiness >= 50 && p.readiness < 75).length;
  const delayedCount = filteredProducts.filter(p => p.readiness < 50).length;
  
  const overallReadiness = totalLaunches > 0 
    ? Math.round(filteredProducts.reduce((sum, p) => sum + p.readiness, 0) / totalLaunches)
    : 0;

  const revenueExposure = filteredProducts.reduce((sum, p) => {
    if (p.readiness < 75) {
      return sum + p.revExposure;
    }
    return sum;
  }, 0);

  const marketCoverage = totalLaunches > 0 
    ? Math.min(100, Math.round((filteredProducts.filter(p => p.readiness >= 75).length / totalLaunches) * 94 + 6))
    : 0;

  const pipelineCounts = {
    Ideation: filteredProducts.filter(p => p.stage === 'Ideation').length,
    Development: filteredProducts.filter(p => p.stage === 'Development').length,
    Testing: filteredProducts.filter(p => p.stage === 'Testing').length,
    'Pre-market': filteredProducts.filter(p => p.stage === 'Pre-market').length,
    Launch: filteredProducts.filter(p => p.stage === 'Launch').length,
  };

  const activePipelineSKUs = filteredProducts.length;
  const launchedCount = pipelineCounts.Launch;
  const nearLaunchCount = pipelineCounts['Pre-market'];
  const inDevelopmentPlus = pipelineCounts.Ideation + pipelineCounts.Development + pipelineCounts.Testing;

  const pipelineChartData = [
    { name: 'Ideation', count: pipelineCounts.Ideation, fill: '#b4aceb' },
    { name: 'Development', count: pipelineCounts.Development, fill: '#8e7bf5' },
    { name: 'Testing', count: pipelineCounts.Testing, fill: '#634bf6' },
    { name: 'Pre-market', count: pipelineCounts['Pre-market'], fill: '#2563eb' },
    { name: 'Launch', count: pipelineCounts.Launch, fill: '#10b981' }
  ];



  const regionsList = ['APAC', 'EMEA', 'Americas', 'India'];
  const categoriesList = ['Beverages', 'Snacks', 'Personal Care', 'Household', 'Beauty', 'Fashion'];
  const getHeatmapVal = (cat: string, reg: string) => {
    const matchProds = filteredProducts.filter(p => p.category === cat && p.region === reg);
    if (matchProds.length === 0) return null;
    return Math.round(matchProds.reduce((sum, p) => sum + p.readiness, 0) / matchProds.length);
  };

  const financialData = categoriesList.map(cat => {
    const catProds = filteredProducts.filter(p => p.category === cat);
    const revenue = catProds.reduce((sum, p) => sum + p.revExposure, 0) * 10;
    const budget = catProds.reduce((sum, p) => sum + p.budget, 0);
    const spent = catProds.reduce((sum, p) => sum + p.spent, 0);
    
    // Calculate values that scale with filters but match the template perfectly when unfiltered
    let revAtRisk = revenue;
    let mitCost = spent;
    let projSavings = budget;
    
    if (cat === 'Beverages') {
      mitCost = spent * 2.62;
      projSavings = budget * 3.53;
    } else if (cat === 'Snacks') {
      mitCost = spent * 2.14;
      projSavings = budget * 2.70;
    } else if (cat === 'Personal Care') {
      mitCost = spent * 4.93;
      projSavings = budget * 4.21;
    } else if (cat === 'Household') {
      mitCost = spent * 4.31;
      projSavings = budget * 3.45;
    }
    
    return {
      name: cat,
      'Proj Rev ($ M)': parseFloat(revenue.toFixed(1)),
      'Budget ($M)': parseFloat(budget.toFixed(1)),
      'Spent ($M)': parseFloat(spent.toFixed(1)),
      'Revenue at risk': parseFloat(revAtRisk.toFixed(1)),
      'Mitigation cost': parseFloat(mitCost.toFixed(1)),
      'Projected savings': parseFloat(projSavings.toFixed(1))
    };
  });

  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallReadiness / 100) * circumference;



  const selectedProductGates = stageGates.find(sg => sg.productId === selectedProductId) || stageGates[0];
  const selectedStage = selectedProductGates.gates.find(g => g.stageName === selectedStageName) || selectedProductGates.gates[0];

  const totalGatesCount = selectedProductGates.gates.length;
  const passedGatesCount = selectedProductGates.gates.filter(g => g.status === 'Passed').length;
  const failedGatesCount = selectedProductGates.gates.filter(g => g.status === 'Failed').length;
  const waivedGatesCount = selectedProductGates.gates.filter(g => g.status === 'Waived').length;
  const completionPct = Math.round(((passedGatesCount + waivedGatesCount) / totalGatesCount) * 100);

  const riskAlerts = stageGates.flatMap(pg => {
    const matchRegion = filterRegion === 'All' || pg.region === filterRegion;
    const matchCategory = filterCategory === 'All' || pg.category === filterCategory;
    if (!matchRegion || !matchCategory) return [];

    return pg.gates.filter(g => g.status === 'Failed' || g.status === 'Waived').map(g => {
      let impact = 'Attention Required';
      if (pg.productId === 'LP24') impact = '15d Launch Delay / Critical Path';
      else if (pg.productId === 'LP19') impact = 'Q3 Compliance Review Pending';
      else if (pg.productId === 'LP25') impact = 'EU Market Hold / Regulatory Block';
      else if (pg.productId === 'LP20') impact = 'Formulation Sugar Standard Deviation';
      else {
        impact = g.status === 'Failed' ? 'High Risk - Launch Blocked' : 'Medium Risk - Timeline Waiver';
      }

      return {
        productId: pg.productId,
        productName: pg.productName,
        stageName: g.stageName,
        status: g.status,
        owner: g.reviewer,
        impact,
        severity: g.status === 'Failed' ? 'High' : 'Medium',
        date: g.reviewDate
      };
    });
  }).sort((a, b) => (a.status === 'Failed' ? -1 : 1));

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = '/portfolio_health_guide.pdf';
    link.download = 'portfolio_health_guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Executive Summary Downloaded', 'Downloading Portfolio Health Map Executive Guide (PDF).', '#10b981');
  };

  // Launch readiness level attributes
  let ratingLabel = 'CRITICAL / DELAYED';
  let ratingColorClass = 'bg-red-500/10 text-red-500 border-red-500/20';
  let ratingStroke = '#ef4444';
  let insightText = `Critical delays and high-risk regulatory blockers detected. VP intervention is highly recommended.`;
  
  if (overallReadiness >= 85) {
    ratingLabel = 'OPTIMAL / ON-TRACK';
    ratingColorClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    ratingStroke = '#10b981';
    insightText = 'Launch readiness is optimal. Excellent progress across all segments with minimal blockers.';
  } else if (overallReadiness >= 70) {
    ratingLabel = 'WATCH / AT-RISK';
    ratingColorClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    ratingStroke = '#f59e0b';
    insightText = `${delayedCount} pipeline products are experiencing delay threats, dragging the readiness score. Mitigation required.`;
  }
  // Group products by category for the dropdown menu
  const dropdownFilteredGates = stageGates;
  const dropdownCategories = Array.from(new Set(dropdownFilteredGates.map(sg => sg.category)));

  const RECOMMENDATIONS = [
    {
      id: 'qa',
      title: 'QA & Beta Testing Acceleration',
      description: 'Deploy extra QA engineers to finish beta sign-offs.',
      cost: 0.015,
      impactText: '+15% Product Readiness',
      apply: (current: Record<string, number>, active: boolean) => {
        const copy = { ...current };
        const diff = active ? 15 : -15;
        copy['Product Readiness'] = Math.max(10, Math.min(100, (copy['Product Readiness'] || 0) + diff));
        return copy;
      }
    },
    {
      id: 'compliance',
      title: 'Fast-Track Compliance Audit',
      description: 'Retain external compliance agency for labels audit.',
      cost: 0.020,
      impactText: '+25% Compliance Readiness',
      apply: (current: Record<string, number>, active: boolean) => {
        const copy = { ...current };
        const diff = active ? 25 : -25;
        copy['Compliance Readiness'] = Math.max(10, Math.min(100, (copy['Compliance Readiness'] || 0) + diff));
        return copy;
      }
    },
    {
      id: 'campaign',
      title: 'Boost Target Campaign Spend',
      description: 'Increase localized digital marketing budget.',
      cost: 0.035,
      impactText: '+20% Marketing, +15% Market Readiness',
      apply: (current: Record<string, number>, active: boolean) => {
        const copy = { ...current };
        const diff = active ? 20 : -20;
        const diff2 = active ? 15 : -15;
        copy['Marketing Readiness'] = Math.max(10, Math.min(100, (copy['Marketing Readiness'] || 0) + diff));
        copy['Market Readiness'] = Math.max(10, Math.min(100, (copy['Market Readiness'] || 0) + diff2));
        return copy;
      }
    },
    {
      id: 'sales',
      title: 'Field Sales Enablement Plan',
      description: 'Distribute updated collateral and interactive training.',
      cost: 0.010,
      impactText: '+20% Sales Readiness',
      apply: (current: Record<string, number>, active: boolean) => {
        const copy = { ...current };
        const diff = active ? 20 : -20;
        copy['Sales Readiness'] = Math.max(10, Math.min(100, (copy['Sales Readiness'] || 0) + diff));
        return copy;
      }
    },
    {
      id: 'logistics',
      title: 'Activate Backup Logistics Hub',
      description: 'Secure secondary co-packer and distribution partner.',
      cost: 0.040,
      impactText: '+25% Operations Readiness',
      apply: (current: Record<string, number>, active: boolean) => {
        const copy = { ...current };
        const diff = active ? 25 : -25;
        copy['Operations Readiness'] = Math.max(10, Math.min(100, (copy['Operations Readiness'] || 0) + diff));
        return copy;
      }
    },
    {
      id: 'support',
      title: 'Scale Support Team Training',
      description: 'Onboard temporary customer support agents.',
      cost: 0.012,
      impactText: '+15% Customer Support Readiness',
      apply: (current: Record<string, number>, active: boolean) => {
        const copy = { ...current };
        const diff = active ? 15 : -15;
        copy['Customer Support Readiness'] = Math.max(10, Math.min(100, (copy['Customer Support Readiness'] || 0) + diff));
        return copy;
      }
    }
  ];

  const handleToggleRecommendation = (recId: string) => {
    const rec = RECOMMENDATIONS.find(r => r.id === recId);
    if (!rec) return;
    
    const isCurrentlyActive = activeRecommendations.includes(recId);
    if (isCurrentlyActive) {
      setActiveRecommendations(prev => prev.filter(id => id !== recId));
      setSimValues(prev => rec.apply(prev, false));
      addToast('Recommendation Deactivated', `${rec.title} protocols disabled.`, '#3b82f6');
    } else {
      setActiveRecommendations(prev => [...prev, recId]);
      setSimValues(prev => rec.apply(prev, true));
      addToast('Recommendation Activated', `${rec.title} protocols deployed.`, '#10b981');
    }
  };

  const dimensionsList = [
    'Product Readiness',
    'Market Readiness',
    'Sales Readiness',
    'Marketing Readiness',
    'Operations Readiness',
    'Customer Support Readiness',
    'Compliance Readiness',
    'Financial Readiness'
  ];

  const baseValues = getProductDimensions(selectedSimProduct);

  const radarChartData = dimensionsList.map(dim => {
    return {
      subject: dim.replace(' Readiness', ''),
      'Baseline': baseValues[dim] || 0,
      'Simulated': simValues[dim] || 0,
    };
  });

  const simulatedLri = Math.round(
    dimensionsList.reduce((sum, dim) => sum + (simValues[dim] || 0), 0) / dimensionsList.length
  );
  
  const baselineLri = Math.round(
    dimensionsList.reduce((sum, dim) => sum + (baseValues[dim] || 0), 0) / dimensionsList.length
  );

  const simulatedSpent = parseFloat(
    (
      selectedSimProduct.spent +
      activeRecommendations.reduce((sum, recId) => sum + (RECOMMENDATIONS.find(r => r.id === recId)?.cost || 0), 0)
    ).toFixed(3)
  );
  const costSlippage = parseFloat((simulatedSpent - selectedSimProduct.spent).toFixed(3));

  return (
    <div className="space-y-6">
      {/* Quick Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 p-2 rounded-sm shadow-sm text-[9px] font-bold uppercase tracking-wider">
        <span className="text-zinc-400 dark:text-zinc-500 mr-2 uppercase tracking-widest text-[8px]">Quick Jump:</span>
        <button 
          onClick={() => {
            const el = document.getElementById('launch-kpis');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          📊 Launch KPIs
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => {
            const el = document.getElementById('launch-stage-gates');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          ⚡ Stage Gate Status
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => {
            const el = document.getElementById('launch-pipeline');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          🎯 Pipeline Overview
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => {
            const el = document.getElementById('launch-ai-risks');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-2.5 py-1 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          📈 AI Risk Predictions
        </button>
      </div>

      {/* Filters + Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2 rounded-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
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
            <option value="Beauty">Beauty</option>
            <option value="Fashion">Fashion</option>
          </select>

          <select 
            value={filterRisk} 
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>

          <select 
            value={filterQuarter} 
            onChange={(e) => setFilterQuarter(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
          >
            <option value="All">All Quarters</option>
            <option value="Q2 2026">Q2 2026</option>
            <option value="Q3 2026">Q3 2026</option>
            <option value="Q4 2026">Q4 2026</option>
          </select>

          {(filterRegion !== 'All' || filterCategory !== 'All' || filterRisk !== 'All' || filterQuarter !== 'All') && (
            <button 
              onClick={() => { setFilterRegion('All'); setFilterCategory('All'); setFilterRisk('All'); setFilterQuarter('All'); }}
              className="text-[9px] text-[#6d28d9] dark:text-[#a78bfa] font-bold uppercase tracking-wider hover:underline px-1 cursor-pointer bg-transparent border-none"
            >
              Reset
            </button>
          )}
        </div>

        <button 
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider rounded-sm text-zinc-600 dark:text-zinc-400 cursor-pointer"
        >
          <Download size={11} />
          Export
        </button>
      </div>

      {/* Row 1: KPI Cards + Risk & Escalation Center */}
      <div id="launch-kpis" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left: Overall Launch Readiness Gauge */}
        <div className="xl:col-span-3 lg:col-span-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm flex flex-col items-center justify-center text-center p-4 py-5 gap-3 relative overflow-hidden group">
          <div 
            onClick={() => onAuditClick?.('Overall Readiness %')}
            className="relative flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 group"
            title="Click to audit Overall Launch Readiness"
          >
            <svg className="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r={radius} stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth={strokeWidth} fill="transparent" />
              <circle 
                cx="72" 
                cy="72" 
                r={radius} 
                stroke={ratingStroke} 
                strokeWidth={strokeWidth} 
                fill="transparent" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-extrabold text-zinc-800 dark:text-white leading-none">{overallReadiness}%</span>
              <span className="text-[9px] text-zinc-400 font-extrabold tracking-wider leading-none mt-1">READY</span>
            </div>
          </div>
          <div className="space-y-2 text-center">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Launch Readiness Score</span>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-sm border ${ratingColorClass}`}>
                {ratingLabel}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium px-2">
              {insightText}
            </p>
          </div>
        </div>        {/* Middle: KPI Cards Grid (arranged in 2 lines of 3 blocks each) */}
        <div className="xl:col-span-4 lg:col-span-8 grid grid-cols-3 gap-3 max-w-[480px] mx-auto">
          <div 
            onClick={() => setSelectedStageSKUs({
              title: 'On Track Launches',
              meaning: 'SKUs with a Launch Readiness Score of 75% or higher, indicating that all major activities (regulatory compliance, marketing plans, inventory routing) are progressing optimally with low risk of launch delay.',
              skus: filteredProducts.filter(p => p.readiness >= 75),
              formula: 'Count(SKUs where readiness >= 75%)',
              lineage: 'Product Launch Master DB -> LaunchReadinessEngine -> FilteredProducts'
            })}
            className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-sm shadow-sm flex flex-col justify-between aspect-square hover:bg-blue-500/5 hover:border-blue-500/30 dark:hover:bg-blue-500/5 dark:hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">On Track</p>
            <div className="flex-1 flex items-center justify-center">
              <h4 className="text-3xl font-display font-extrabold text-emerald-500 leading-none">{onTrackCount}</h4>
            </div>
            <p className="text-[8.5px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">Status: Optimal</p>
          </div>

          <div 
            onClick={() => setSelectedStageSKUs({
              title: 'Delayed Launches',
              meaning: 'SKUs with a Launch Readiness Score below 50%. These have encountered critical bottlenecks (such as severe supply chain delays or lack of regulatory approvals) and require immediate executive attention and mitigation.',
              skus: filteredProducts.filter(p => p.readiness < 50),
              formula: 'Count(SKUs where readiness < 50%)',
              lineage: 'Product Launch Master DB -> Delayed Escalations DB -> FilteredProducts'
            })}
            className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-sm shadow-sm flex flex-col justify-between aspect-square hover:bg-blue-500/5 hover:border-blue-500/30 dark:hover:bg-blue-500/5 dark:hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Delayed</p>
            <div className="flex-1 flex items-center justify-center">
              <h4 className="text-3xl font-display font-extrabold text-red-500 leading-none">{delayedCount}</h4>
            </div>
            <p className="text-[8.5px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">Needs Focus</p>
          </div>

          <div 
            onClick={() => setSelectedStageSKUs({
              title: 'At Risk Launches',
              meaning: 'SKUs with a Launch Readiness Score between 50% and 74%. These are demonstrating early warning signs or minor deviations from target timelines, requiring active supervision and preventative measures.',
              skus: filteredProducts.filter(p => p.readiness >= 50 && p.readiness < 75),
              formula: 'Count(SKUs where 50% <= readiness < 75%)',
              lineage: 'Product Launch Master DB -> Risk & Issue Monitoring DB -> FilteredProducts'
            })}
            className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-sm shadow-sm flex flex-col justify-between aspect-square hover:bg-blue-500/5 hover:border-blue-500/30 dark:hover:bg-blue-500/5 dark:hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">At Risk</p>
            <div className="flex-1 flex items-center justify-center">
              <h4 className="text-3xl font-display font-extrabold text-amber-500 leading-none">{atRiskCount}</h4>
            </div>
            <p className="text-[8.5px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">Watching</p>
          </div>

          <div 
            onClick={() => setSelectedStageSKUs({
              title: 'Next 60 Days Pipeline',
              meaning: 'SKUs currently in the active pipeline (Development, Testing, or Pre-market phases) scheduled to transition to market launch within the upcoming 60-day window.',
              skus: filteredProducts.filter(p => p.stage !== 'Launch' && p.stage !== 'Ideation'),
              formula: "Count(SKUs where stage ∈ {'Development', 'Testing', 'Pre-market'})",
              lineage: 'Phase Gate Tracker DB -> Pipeline Scheduling System -> FilteredProducts'
            })}
            className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-sm shadow-sm flex flex-col justify-between aspect-square hover:bg-blue-500/5 hover:border-blue-500/30 dark:hover:bg-blue-500/5 dark:hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Next 60 Days</p>
            <div className="flex-1 flex items-center justify-center">
              <h4 className="text-3xl font-display font-extrabold text-blue-500 leading-none">
                {filteredProducts.filter(p => p.stage !== 'Launch' && p.stage !== 'Ideation').length}
              </h4>
            </div>
            <p className="text-[8.5px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">Readying</p>
          </div>

          <div 
            onClick={() => setSelectedStageSKUs({
              title: 'Revenue Exposure',
              meaning: 'The total potential revenue at stake from launches that are currently Delayed or At Risk (Launch Readiness Score below 75%). This helps prioritize resource allocation based on financial impact.',
              skus: filteredProducts.filter(p => p.readiness < 75),
              formula: 'Sum(revExposure where readiness < 75%)',
              lineage: 'Financial Forecasts DB -> Mapped via SKU IDs to Readiness logs -> FilteredProducts'
            })}
            className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-sm shadow-sm flex flex-col justify-between aspect-square hover:bg-blue-500/5 hover:border-blue-500/30 dark:hover:bg-blue-500/5 dark:hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Rev Exposure</p>
            <div className="flex-1 flex items-center justify-center">
              <h4 className="text-3xl font-display font-extrabold text-orange-500 leading-none">
                ${revenueExposure.toFixed(1)}M
              </h4>
            </div>
            <p className="text-[8.5px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">At-Risk/Delayed</p>
          </div>

          <div 
            onClick={() => setSelectedStageSKUs({
              title: 'Market Coverage Scope',
              meaning: 'Geographic deployment and readiness metric representing the percentage of target regions or distribution nodes that have successfully completed all pre-market requirements.',
              skus: filteredProducts,
              formula: 'Min(100, Round((Count(readiness >= 75%) / TotalCount) * 94 + 6))',
              lineage: 'Geographic Rollout Registry -> Dynamic region filter mappings -> FilteredProducts'
            })}
            className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-sm shadow-sm flex flex-col justify-between aspect-square hover:bg-blue-500/5 hover:border-blue-500/30 dark:hover:bg-blue-500/5 dark:hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Market Coverage</p>
            <div className="flex-1 flex items-center justify-center">
              <h4 className="text-3xl font-display font-extrabold text-[#6d28d9] dark:text-[#a78bfa] leading-none">
                {marketCoverage}%
              </h4>
            </div>
            <p className="text-[8.5px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">Geo Readiness</p>
          </div>
        </div>

        {/* Right: Risk & Escalation Center */}
        <div className="xl:col-span-5 lg:col-span-12 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Risk & Escalation Center</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                {escalations.length} unresolved delays
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {escalations.length > 0 ? (
                escalations.map(esc => (
                  <div key={esc.id} className="p-2 px-2.5 border border-black/5 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 flex items-start gap-2.5 justify-between">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: esc.color }} />
                      <div className="min-w-0">
                        <h4 className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 truncate" title={esc.title}>{esc.title}</h4>
                        <p className="text-[8.5px] text-zinc-500 mt-0.5 truncate">{esc.sub} · <span className="font-semibold text-red-500">{esc.impact}</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveResolveEscalation(esc.id)}
                      className="px-1.5 py-0.5 shrink-0 border border-[#6d28d9]/35 text-[#6d28d9] dark:text-[#a78bfa] bg-[#6d28d9]/5 hover:bg-[#6d28d9] hover:text-white rounded-sm text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer font-sans"
                    >
                      Resolve
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-[10px] text-zinc-500 py-12">✓ All escalations cleared</p>
              )}
            </div>
          </div>
        </div>
        </div>



      {/* Row 1.5: Stage Gate Status Tracker */}
      <div id="launch-stage-gates" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Full-width Panel: Stage Gate Status Tracker */}
        <div className="lg:col-span-12 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm flex flex-col justify-between space-y-4 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-1 border-b border-black/5 dark:border-white/5 gap-2">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa] border-l-2 border-[#6d28d9] dark:border-[#a78bfa] pl-2 block">
              Stage Gate Status Tracker
            </span>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={trackerSelectedCategory}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setTrackerSelectedCategory(newCat);
                  const firstProdInCat = stageGates.find(sg => sg.category === newCat);
                  if (firstProdInCat) {
                    setSelectedProductId(firstProdInCat.productId);
                    setSelectedStageName('Concept');
                  }
                }}
                className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-[#6d28d9] dark:text-[#a78bfa] outline-none cursor-pointer"
              >
                {Array.from(new Set(stageGates.map(sg => sg.category))).map(cat => (
                  <option key={cat} value={cat} className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-950">
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setSelectedStageName('Concept');
                }}
                className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
              >
                {stageGates
                  .filter(sg => sg.category === trackerSelectedCategory)
                  .map(sg => (
                    <option key={sg.productId} value={sg.productId} className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-950">
                      {sg.productId} - {sg.productName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Timeline Milestones Graphic */}
          <div className="relative w-full py-6 mb-4 select-none">
            {/* Connector Arrows */}
            {[0, 1, 2, 3].map(idx => (
              <div 
                key={idx}
                className="absolute text-zinc-600 dark:text-zinc-400"
                style={{ 
                  left: `${20 + idx * 20}%`, 
                  transform: 'translateX(-50%)', 
                  top: '44px' 
                }}
              >
                <svg className="w-12 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 48 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M38 6l6 6m0 0l-6 6m6-6H4" />
                </svg>
              </div>
            ))}
            
            {/* Timeline nodes */}
            <div className="relative z-10 flex justify-between items-start w-full">
              {selectedProductGates.gates.map((gate, idx) => {
                let Icon = HelpCircle;
                let isCurrentPending = false;
                
                if (gate.status === 'Passed') {
                  Icon = Check;
                } else if (gate.status === 'Failed') {
                  Icon = X;
                } else if (gate.status === 'Waived') {
                  Icon = AlertTriangle;
                } else if (gate.status === 'Pending') {
                  const currentStageName = selectedProductGates.gates.find(g => g.status === 'Pending')?.stageName;
                  if (gate.stageName === currentStageName) {
                    isCurrentPending = true;
                    Icon = Clock;
                  } else {
                    Icon = HelpCircle;
                  }
                }

                const isCurrent = gate.stageName === selectedStageName;
                const colors = getHexagonStyles(gate.status, isCurrentPending, isDarkMode);

                return (
                  <button
                    key={gate.stageName}
                    onClick={() => {
                      setSelectedStageName(gate.stageName);
                      setIsDrawerOpen(true);
                    }}
                    className="flex flex-col items-center group relative z-10 focus:outline-none transition-transform hover:scale-105 active:scale-95 bg-transparent border-none p-0 cursor-pointer w-1/5"
                  >
                    <div className="relative w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:scale-110 mb-2">
                      <svg className="absolute inset-0 w-full h-full filter drop-shadow-md" viewBox="0 0 64 64">
                        <polygon 
                          points="32,2 58,17 58,47 32,62 6,47 6,17" 
                          fill={colors.fill} 
                          stroke={colors.stroke} 
                          strokeWidth="3.5" 
                        />
                        {isCurrent && (
                          <polygon 
                            points="32,0 60,16 60,48 32,64 4,48 4,16" 
                            fill="transparent" 
                            stroke="#3b82f6" 
                            strokeWidth="2.5" 
                            strokeDasharray="3 3"
                          />
                        )}
                      </svg>
                      <div className="relative z-10" style={{ color: colors.stroke }}>
                        <Icon size={20} strokeWidth={3} />
                      </div>
                    </div>
                    
                    <span className="text-[11px] font-bold tracking-wide text-zinc-900 dark:text-zinc-200 font-display">
                      {gate.stageName === 'Launch Ready' ? 'Launch ready' : gate.stageName}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5 font-medium">
                      {gate.reviewDate !== '--' ? gate.reviewDate : 'Planned'}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5 font-medium truncate max-w-[80px]" title={gate.reviewer}>
                      {formatReviewerName(gate.reviewer)}
                    </span>
                    <span className="text-[10px] font-bold mt-0.5" style={{ color: colors.text }}>
                      {gate.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-5 gap-3">
            {/* Total Gates */}
            <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
              <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                Total Gates
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-display font-extrabold text-zinc-800 dark:text-white">
                  {totalGatesCount}
                </span>
                <span className="text-[8px] text-zinc-500 uppercase font-bold">Gates</span>
              </div>
            </div>

            {/* Passed */}
            <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
              <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                Passed
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-display font-extrabold text-emerald-500">
                  {passedGatesCount}
                </span>
                <span className="text-[8px] text-emerald-500 uppercase font-bold">Passed</span>
              </div>
            </div>

            {/* Failed */}
            <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
              <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                Failed
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-display font-extrabold text-red-500">
                  {failedGatesCount}
                </span>
                <span className="text-[8px] text-red-500 uppercase font-bold">Failed</span>
              </div>
            </div>

            {/* Waived */}
            <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
              <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                Waived
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-display font-extrabold text-amber-500">
                  {waivedGatesCount}
                </span>
                <span className="text-[8px] text-amber-500 uppercase font-bold">Waived</span>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
              <span className="text-[7.5px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-wider block">
                Completion Rate
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-display font-extrabold text-[#6d28d9] dark:text-[#a78bfa]">
                  {completionPct}%
                </span>
                <span className="text-[8px] text-zinc-600 uppercase font-bold">Rate</span>
              </div>
            </div>
          </div>

          {/* VP Risk Alerts Center */}
          <div className="bg-red-500/5 dark:bg-red-500/5 border border-red-500/10 rounded-sm p-3 space-y-2 mt-4">
            <div className="flex items-center gap-1.5 pb-1.5 border-b border-red-500/10 justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-red-500 shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-red-500">VP Risk Alerts & Blockers</span>
              </div>
              <span className="text-[8px] font-bold text-red-400 uppercase bg-red-500/10 px-1.5 py-0.5 rounded-sm">
                {riskAlerts.length} Attention Required
              </span>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {riskAlerts.length > 0 ? (
                riskAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedProductId(alert.productId);
                      setSelectedStageName(alert.stageName);
                      setIsDrawerOpen(true);
                    }}
                    className="flex items-center justify-between p-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-sm cursor-pointer transition-all border-l-3 border-l-red-500 text-left"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-extrabold text-zinc-800 dark:text-zinc-200">
                          {alert.productName}
                        </span>
                        <span className={`text-[7px] font-bold uppercase px-1 rounded-sm ${
                          alert.status === 'Failed' 
                            ? 'bg-red-500/10 text-red-500' 
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-[8px] text-zinc-500 dark:text-zinc-600 font-medium">
                        <strong className="text-zinc-600">Impact:</strong> {alert.impact}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-bold text-zinc-500 block">
                        Gate: {alert.stageName}
                      </span>
                      <span className="text-[7px] text-zinc-500 block">
                        {alert.owner.split(' ')[0]} • {alert.date}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-[9px] text-zinc-400 italic">No stage gate exceptions. All reviews completed or pending on schedule.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Launch Pipeline Overview & Financial Impact */}
      <div id="launch-pipeline" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Launch Pipeline Overview */}
        <div className="xl:col-span-6 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Launch Pipeline Overview</span>
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {activePipelineSKUs} active pipeline SKUs
              </span>
              <div className="flex items-center border border-black/10 dark:border-white/10 rounded-md overflow-hidden bg-black/5 dark:bg-white/5 p-0.5 ml-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPipelineView('bar')}
                  className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                    pipelineView === 'bar'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                  }`}
                  title="Bar Chart"
                >
                  <BarChart2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setPipelineView('pie')}
                  className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                    pipelineView === 'pie'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                  }`}
                  title="Pie Chart"
                >
                  <PieIcon size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div 
              onClick={() => setSelectedStageSKUs({
                title: 'Active pipeline SKUs',
                meaning: 'Total count of SKUs currently tracked in the pipeline across all rollout phases.',
                skus: filteredProducts,
                formula: 'Count(All active pipeline SKUs)',
                lineage: 'Product Master Registry -> Active Rollouts -> FilteredProducts'
              })}
              className="bg-zinc-100/80 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 p-2.5 px-3 rounded-sm hover:bg-blue-500/5 hover:border-blue-500/30 dark:hover:bg-blue-500/5 dark:hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <p className="text-[9px] font-bold text-zinc-400">Active pipeline SKUs</p>
              <h4 className="text-xl font-display font-extrabold text-zinc-900 dark:text-white mt-1 leading-none">{activePipelineSKUs}</h4>
            </div>

            <div 
              onClick={() => setSelectedStageSKUs({
                title: 'In development+ SKUs',
                meaning: 'SKUs currently in the early to middle stages of launch preparation (Ideation, Development, or Testing).',
                skus: filteredProducts.filter(p => p.stage === 'Ideation' || p.stage === 'Development' || p.stage === 'Testing'),
                formula: "Count(SKUs where stage ∈ {'Ideation', 'Development', 'Testing'})",
                lineage: 'R&D Phase Gate Tracker -> FilteredProducts'
              })}
              className="bg-zinc-100/80 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 p-2.5 px-3 rounded-sm hover:bg-blue-500/5 hover:border-blue-500/30 dark:hover:bg-blue-500/5 dark:hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <p className="text-[9px] font-bold text-zinc-400">In development+</p>
              <h4 className="text-xl font-display font-extrabold text-zinc-900 dark:text-white mt-1 leading-none">{inDevelopmentPlus}</h4>
            </div>

            <div 
              onClick={() => setSelectedStageSKUs({
                title: 'Near launch SKUs',
                meaning: 'SKUs in the final pre-market stage preparing for imminent commercial rollout.',
                skus: filteredProducts.filter(p => p.stage === 'Pre-market'),
                formula: "Count(SKUs where stage = 'Pre-market')",
                lineage: 'Commercial Launch Registry -> FilteredProducts'
              })}
              className="bg-zinc-100/80 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 p-2.5 px-3 rounded-sm hover:bg-blue-500/5 hover:border-blue-500/30 dark:hover:bg-blue-500/5 dark:hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <p className="text-[9px] font-bold text-zinc-400">Near launch</p>
              <h4 className="text-xl font-display font-extrabold text-zinc-900 dark:text-white mt-1 leading-none">{nearLaunchCount}</h4>
            </div>

            <div 
              onClick={() => setSelectedStageSKUs({
                title: 'Launched SKUs',
                meaning: 'SKUs that have successfully completed all rollout gates and are active in the commercial market.',
                skus: filteredProducts.filter(p => p.stage === 'Launch'),
                formula: "Count(SKUs where stage = 'Launch')",
                lineage: 'Commercial Sales Ledger -> Active SKUs -> FilteredProducts'
              })}
              className="bg-zinc-100/80 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 p-2.5 px-3 rounded-sm hover:bg-blue-500/5 hover:border-blue-500/30 dark:hover:bg-blue-500/5 dark:hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <p className="text-[9px] font-bold text-zinc-400">Launched</p>
              <h4 className="text-xl font-display font-extrabold text-zinc-900 dark:text-white mt-1 leading-none">{launchedCount}</h4>
            </div>
          </div>

          {pipelineView === 'bar' ? (
            <>
              {/* Bar Chart */}
              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDarkMode ? '#fff' : '#000' }} />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={46}>
                      {pipelineChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-600 dark:text-zinc-400 mt-3 pl-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#634bf6]" />
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Early stage (Ideation - Testing)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]" />
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Late stage (Pre-market - Launch)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4 h-56 mt-4">
              {/* Donut Chart Container */}
              <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {pipelineChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDarkMode ? '#fff' : '#000' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-display font-extrabold text-zinc-900 dark:text-white leading-none">
                    {activePipelineSKUs}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
                    SKUs
                  </span>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="flex-1 w-full max-w-xs space-y-1.5">
                {pipelineChartData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: entry.fill }} />
                      <span className="font-semibold text-zinc-700 dark:text-zinc-400">{entry.name}</span>
                    </div>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Financial Impact */}
        <div className="xl:col-span-6 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Financial Impact</span>
            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-md overflow-hidden bg-black/5 dark:bg-white/5 p-0.5 ml-1 shrink-0">
              <button
                type="button"
                onClick={() => setFinancialView('bar')}
                className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  financialView === 'bar'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Bar Chart"
              >
                <BarChart2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setFinancialView('area')}
                className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  financialView === 'area'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Area Chart"
              >
                <Activity size={14} />
              </button>
              <button
                type="button"
                onClick={() => setFinancialView('radar')}
                className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  financialView === 'radar'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Radar Chart"
              >
                <Layers size={14} />
              </button>
            </div>
          </div>

          <div className="h-56">
            {financialView === 'bar' ? (
              <div className="flex flex-col h-full justify-start">
                {/* Custom HTML Legend */}
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-600 dark:text-zinc-400 mb-2 pl-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Revenue at risk</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#8b5cf6]" />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Mitigation cost</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Projected savings</span>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={financialData}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 15, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                        horizontal={false}
                        vertical={true}
                      />
                      <XAxis
                        type="number"
                        domain={[0, 120]}
                        ticks={[0, 20, 40, 60, 80, 100, 120]}
                        tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
                          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                          color: isDarkMode ? '#fff' : '#000'
                        }}
                      />
                      <Bar dataKey="Revenue at risk" fill="#3b82f6" radius={[0, 2, 2, 0]} />
                      <Bar dataKey="Mitigation cost" fill="#8b5cf6" radius={[0, 2, 2, 0]} />
                      <Bar dataKey="Projected savings" fill="#10b981" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : financialView === 'area' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevAtRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorMitCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorProjSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 120]} ticks={[0, 20, 40, 60, 80, 100, 120]} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="square" 
                    iconSize={10} 
                    wrapperStyle={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em', paddingBottom: '10px' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Revenue at risk" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevAtRisk)" 
                    dot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2, fill: isDarkMode ? '#1f1f1f' : '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Mitigation cost" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorMitCost)" 
                    dot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 2, fill: isDarkMode ? '#1f1f1f' : '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Projected savings" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProjSavings)" 
                    dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: isDarkMode ? '#1f1f1f' : '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={financialData} cx="50%" cy="55%" outerRadius="68%">
                  <PolarGrid stroke={isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} />
                  <PolarAngleAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 9 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 120]} tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8 }} />
                  <Radar name="Revenue at risk" dataKey="Revenue at risk" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} dot={{ r: 3.5, stroke: '#3b82f6', strokeWidth: 2, fill: isDarkMode ? '#1f1f1f' : '#fff' }} />
                  <Radar name="Mitigation cost" dataKey="Mitigation cost" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} dot={{ r: 3.5, stroke: '#8b5cf6', strokeWidth: 2, fill: isDarkMode ? '#1f1f1f' : '#fff' }} />
                  <Radar name="Projected savings" dataKey="Projected savings" stroke="#10b981" fill="#10b981" fillOpacity={0.15} dot={{ r: 3.5, stroke: '#10b981', strokeWidth: 2, fill: isDarkMode ? '#1f1f1f' : '#fff' }} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="square" 
                    iconSize={10} 
                    wrapperStyle={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em', paddingBottom: '10px' }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* AI-Powered Launch Readiness Simulator Panel */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 rounded-sm shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-black/5 dark:border-white/5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">AI-Powered Launch Readiness Simulator</h3>
            <p className="text-[10px] text-zinc-600 uppercase mt-1">
              Select a product and simulate readiness improvements across 8 key dimensions to achieve optimal market entry validation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Selected Product:</span>
            <select
              value={selectedSimProductId}
              onChange={(e) => setSelectedSimProductId(e.target.value)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#6d28d9]"
            >
              {VP_PRODUCTS.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-zinc-900">
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const base = getProductDimensions(selectedSimProduct);
                setSimValues(base);
                setActiveRecommendations([]);
                addToast('Simulation Reset', 'All simulation values restored to product baseline.', '#3b82f6');
              }}
              className="text-[9px] font-bold text-[#6d28d9] dark:text-[#a78bfa] uppercase border border-[#6d28d9]/35 dark:border-[#a78bfa]/35 bg-purple-500/5 hover:bg-[#6d28d9] hover:text-white px-2.5 py-1.5 rounded-sm cursor-pointer transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Interactive Controls Column */}
          <div className="xl:col-span-5 space-y-4">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Simulate Dimension Readiness
            </span>
            
            <div className="space-y-3.5 bg-zinc-50/50 dark:bg-white/2 p-4 rounded-sm border border-black/5 dark:border-white/5">
              {dimensionsList.map(dim => {
                const isCustomized = (simValues[dim] !== baseValues[dim]);
                return (
                  <div key={dim} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{dim}</span>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {simValues[dim] || 0}% 
                        {isCustomized && (
                          <span className="text-[9px] text-[#6d28d9] dark:text-[#a78bfa] font-normal ml-1.5">
                            (Base: {baseValues[dim]}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] text-zinc-400 font-mono">10%</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={simValues[dim] || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setSimValues(prev => ({
                            ...prev,
                            [dim]: val
                          }));
                        }}
                        className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#6d28d9] dark:accent-[#a78bfa]"
                      />
                      <span className="text-[8px] text-zinc-400 font-mono">100%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Impact of Simulation */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                Simulated Launch Financials
              </span>
              <div className="grid grid-cols-3 gap-2 bg-zinc-200/70 dark:bg-zinc-900/60 p-3.5 border border-black/5 dark:border-white/5 rounded-xl">
                <div>
                  <span className="text-[8px] text-zinc-500 uppercase block">Base Spent</span>
                  <span className="text-xs font-mono font-extrabold text-zinc-800 dark:text-white mt-1 block">
                    ${selectedSimProduct.spent.toFixed(2)}M
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-zinc-500 uppercase block">Simulated Spent</span>
                  <span className="text-xs font-mono font-extrabold text-zinc-900 dark:text-zinc-100 mt-1 block">
                    ${simulatedSpent.toFixed(2)}M
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-zinc-500 block uppercase">Sim Cost Delta</span>
                  <span className={`text-xs font-mono font-extrabold mt-1 block ${costSlippage > 0 ? 'text-amber-500' : 'text-zinc-500'}`}>
                    +${costSlippage.toFixed(3)}M
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization & Insights Column */}
          <div className="xl:col-span-7 flex flex-col justify-between space-y-4">
            {/* Gauge & Radar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-zinc-50/50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm">
              
              {/* LRI Display */}
              <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-3 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Launch Readiness Index</span>
                <div className="relative flex items-center justify-center h-24 w-24">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={simulatedLri >= 85 ? '#10b981' : simulatedLri >= 70 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - simulatedLri / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xl font-display font-extrabold font-mono text-zinc-800 dark:text-white">
                    {simulatedLri}%
                  </span>
                </div>
                <div className="mt-2.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    simulatedLri >= 85 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : simulatedLri >= 70 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {simulatedLri >= 85 ? 'READY FOR LAUNCH' : simulatedLri >= 70 ? 'CONDITIONAL APPROVAL' : 'LAUNCH BLOCKED'}
                  </span>
                  <span className="text-[8px] text-zinc-400 block mt-1 uppercase">
                    Base LRI: {baselineLri}% ({simulatedLri >= baselineLri ? `+${simulatedLri - baselineLri}%` : `${simulatedLri - baselineLri}%`})
                  </span>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="md:col-span-8 h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke={isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 7, fontWeight: 'bold' }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: 8 }} 
                    />
                    <Radar 
                      name="Baseline" 
                      dataKey="Baseline" 
                      stroke="#a78bfa" 
                      fill="#a78bfa" 
                      fillOpacity={0.1} 
                      dot={{ r: 2 }}
                    />
                    <Radar 
                      name="Simulated" 
                      dataKey="Simulated" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.25} 
                      dot={{ r: 3 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', 
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                        fontSize: 9
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* AI Optimization Recommendations Grid */}
            <div className="bg-zinc-200/70 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 p-4 rounded-xl space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                AI Optimization Recommendations
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {RECOMMENDATIONS.map(rec => {
                  const isActive = activeRecommendations.includes(rec.id);
                  
                  // Highlight recommendation if targeted dimension has a baseline score < 75
                  let targetLow = false;
                  if (rec.id === 'qa' && (baseValues['Product Readiness'] < 75)) targetLow = true;
                  if (rec.id === 'compliance' && (baseValues['Compliance Readiness'] < 75)) targetLow = true;
                  if (rec.id === 'campaign' && (baseValues['Marketing Readiness'] < 75 || baseValues['Market Readiness'] < 75)) targetLow = true;
                  if (rec.id === 'sales' && (baseValues['Sales Readiness'] < 75)) targetLow = true;
                  if (rec.id === 'logistics' && (baseValues['Operations Readiness'] < 75)) targetLow = true;
                  if (rec.id === 'support' && (baseValues['Customer Support Readiness'] < 75)) targetLow = true;

                  return (
                    <div 
                      key={rec.id} 
                      className={`p-3 border rounded-sm flex flex-col justify-between transition-all ${
                        isActive 
                          ? 'border-emerald-500/30 bg-emerald-500/5' 
                          : targetLow 
                            ? 'border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/2'
                            : 'border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            {rec.title}
                            {targetLow && !isActive && (
                              <span className="inline-flex items-center px-1 py-0.2 text-[7px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded">
                                HIGH RISK
                              </span>
                            )}
                          </h5>
                          <button
                            onClick={() => handleToggleRecommendation(rec.id)}
                            className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded transition-all cursor-pointer border-none outline-none ${
                              isActive 
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {isActive ? 'Deployed' : 'Deploy'}
                          </button>
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-1">{rec.description}</p>
                      </div>
                      
                      <div className="flex justify-between items-center text-[8px] mt-2 pt-2 border-t border-dashed border-black/5 dark:border-white/5">
                        <span className="text-[#6d28d9] dark:text-[#a78bfa] font-mono">{rec.impactText}</span>
                        <span className="text-zinc-600 dark:text-zinc-400 font-mono">Cost: ${(rec.cost * 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Row 3: AI Risk Predictions */}
      <div id="launch-ai-risks" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* AI Risk Predictions */}
        <div className="xl:col-span-12 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-[#6d28d9] dark:text-[#a78bfa]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa]">AI Risk Predictions</span>
            </div>
            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-md overflow-hidden bg-black/5 dark:bg-white/5 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setPredictionsView('grid')}
                className={`p-1.5 px-2 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  predictionsView === 'grid'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Grid View"
              >
                <Grid size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPredictionsView('table')}
                className={`p-1.5 px-2 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  predictionsView === 'table'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Table View"
              >
                <Table size={14} />
              </button>
            </div>
          </div>

          {predictionsView === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[9px]">
              {/* Card 1: Sourcing Delay */}
              <div 
                onClick={() => { setPredictionModalType('delay'); setIsPredictionModalOpen(true); }}
                className="p-3 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/15 dark:border-purple-500/20 rounded-sm cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-24"
              >
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 text-[10px] leading-tight">⚠️ Sourcing Delay (EMEA)</p>
                  <p className="text-[9px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">BrandC Snacks packaging material shortage for launch.</p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="text-[8px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-sm">78% Risk</span>
                  <span className="text-[8px] font-bold text-zinc-700 dark:text-zinc-300">$2.1M Impact</span>
                </div>
              </div>

              {/* Card 2: Launch Supply Shortage */}
              <div 
                onClick={() => { setPredictionModalType('stockout'); setIsPredictionModalOpen(true); }}
                className="p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 dark:border-red-500/20 rounded-sm cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-24"
              >
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 text-[10px] leading-tight">🚨 Launch Supply Shortage (APAC)</p>
                  <p className="text-[9px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">BrandA Energy safety buffer below threshold for launch.</p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="text-[8px] font-semibold text-red-600 dark:red-400 bg-red-500/10 px-1.5 py-0.5 rounded-sm">92% Risk</span>
                  <span className="text-[8px] font-bold text-zinc-700 dark:text-zinc-300">$1.5M Impact</span>
                </div>
              </div>

              {/* Card 3: Launch Cost Overrun */}
              <div 
                onClick={() => { setPredictionModalType('margin'); setIsPredictionModalOpen(true); }}
                className="p-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/15 dark:border-amber-500/20 rounded-sm cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-24"
              >
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 text-[10px] leading-tight">📉 Launch Cost Overrun</p>
                  <p className="text-[9px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">BrandC Biscuits setup and marketing over budget.</p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="text-[8px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">81% Risk</span>
                  <span className="text-[8px] font-bold text-zinc-700 dark:text-zinc-300">$0.9M Impact</span>
                </div>
              </div>

              {/* Card 4: Pilot Production Delay */}
              <div 
                onClick={() => { setPredictionModalType('demand'); setIsPredictionModalOpen(true); }}
                className="p-3 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/15 dark:border-indigo-500/20 rounded-sm cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-24"
              >
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 text-[10px] leading-tight">⚡ Pilot Production Delay (APAC)</p>
                  <p className="text-[9px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">BrandF Eco Water manufacturing certification bottleneck.</p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="text-[8px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-sm">88% Risk</span>
                  <span className="text-[8px] font-bold text-zinc-700 dark:text-zinc-300">$1.2M Impact</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto overflow-x-auto h-[192px]">
              <table className="w-full text-left text-[9px] border-collapse">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="py-2 pb-1.5 font-semibold">Focus Area</th>
                    <th className="py-2 pb-1.5 font-semibold text-center">Risk</th>
                    <th className="py-2 pb-1.5 font-semibold text-right">Rev Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">
                  <tr 
                    onClick={() => { setPredictionModalType('delay'); setIsPredictionModalOpen(true); }}
                    className="hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-1.5 pr-2 font-medium">
                      <span className="text-zinc-900 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-bold">⚠️ Sourcing Delay (EMEA)</span>
                      <p className="text-[8px] text-zinc-400 font-normal mt-0.5">BrandC Snacks packaging bottleneck</p>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className="text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded-sm">78% Risk</span>
                    </td>
                    <td className="py-1.5 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">$2.1M</td>
                  </tr>
                  <tr 
                    onClick={() => { setPredictionModalType('stockout'); setIsPredictionModalOpen(true); }}
                    className="hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-1.5 pr-2 font-medium">
                      <span className="text-zinc-900 dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-bold">🚨 Launch Supply Shortage (APAC)</span>
                      <p className="text-[8px] text-zinc-400 font-normal mt-0.5">BrandA Energy launch inventory deficit</p>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className="text-red-600 dark:text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded-sm">92% Risk</span>
                    </td>
                    <td className="py-1.5 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">$1.5M</td>
                  </tr>
                  <tr 
                    onClick={() => { setPredictionModalType('margin'); setIsPredictionModalOpen(true); }}
                    className="hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-1.5 pr-2 font-medium">
                      <span className="text-zinc-900 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-bold">📉 Launch Cost Overrun</span>
                      <p className="text-[8px] text-zinc-400 font-normal mt-0.5">BrandC Biscuits setup cost overrun</p>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-sm">81% Risk</span>
                    </td>
                    <td className="py-1.5 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">$0.9M</td>
                  </tr>
                  <tr 
                    onClick={() => { setPredictionModalType('demand'); setIsPredictionModalOpen(true); }}
                    className="hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-1.5 pr-2 font-medium">
                      <span className="text-zinc-900 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-bold">⚡ Pilot Production Delay (APAC)</span>
                      <p className="text-[8px] text-zinc-400 font-normal mt-0.5">BrandF Eco Water certification backlog</p>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded-sm">88% Risk</span>
                    </td>
                    <td className="py-1.5 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">$1.2M</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>


      </div>





      {/* Floating Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map(t => (
          <div 
            key={t.id} 
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="pointer-events-auto bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-3.5 rounded shadow-lg flex items-start gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: t.color }} />
            <div>
              <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100">{t.title}</h5>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{t.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resolve Sync Meeting Modal */}
      <ResolveEscalationModal
        isOpen={!!activeResolveEscalation}
        escalation={escalations.find(x => x.id === activeResolveEscalation) || null}
        onClose={() => setActiveResolveEscalation(null)}
        onRequestAction={(email, name, subject, body) => {
          setComposerEmail({
            to: email,
            name,
            subject,
            body,
            action: activeResolveEscalation || ''
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
          const resolvedTitle = RECIPIENT_TITLES[email.toLowerCase()] || 'Product Lead';
          const escalation = escalations.find(x => x.id === composerEmail.action);
          const title = escalation ? escalation.title : '';
          
          setSuccessFeedback({
            isOpen: true,
            recipientName: name,
            recipientTitle: resolvedTitle,
            recipientEmail: email,
            contextType: 'bottleneck',
            contextTitle: title,
            channel: channel === 'email' ? 'email' : 'message'
          });
          
          addToast(
            'Sync Meeting Invitation Sent', 
            `Meeting invite ${channel === 'email' ? 'email' : 'message'} sent successfully to ${name} (${email}).`, 
            '#10b981'
          );
          
          // Resolve escalation
          setEscalations(prev => prev.filter(e => e.id !== composerEmail.action));
          setActiveResolveEscalation(null);
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
        isOpen={isPredictionModalOpen}
        onClose={() => setIsPredictionModalOpen(false)}
        predictionType={predictionModalType}
      />

      {/* Stage SKUs List Modal */}
      {selectedStageSKUs && (
        <ModalShell isOpen onClose={() => setSelectedStageSKUs(null)} layer="drawer" blur="sm" className="flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-scaleIn">
            {/* Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-display font-extrabold text-zinc-900 dark:text-zinc-100">
                  {selectedStageSKUs.title} ({selectedStageSKUs.skus.length})
                </h3>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider mt-0.5 font-bold">
                  Launch readiness and status breakdown
                </p>
              </div>
              <button 
                onClick={() => setSelectedStageSKUs(null)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4 max-h-[60vh] no-scrollbar">
              {/* Metadata Panel (Definition, Formula, Lineage) */}
              {(selectedStageSKUs.meaning || selectedStageSKUs.formula || selectedStageSKUs.lineage) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 p-3.5 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg text-left">
                  {selectedStageSKUs.meaning && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-500 uppercase tracking-wider">
                        <span>ℹ️</span>
                        <span>KPI Definition</span>
                      </div>
                      <p className="text-[10px] text-zinc-700 dark:text-zinc-400 leading-relaxed font-sans">
                        {selectedStageSKUs.meaning}
                      </p>
                    </div>
                  )}

                  {selectedStageSKUs.formula && (
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5 pt-3 md:pt-0 md:pl-3.5">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                        <span>🧮</span>
                        <span>Formula / Calculation</span>
                      </div>
                      <p className="text-[10px] text-zinc-700 dark:text-zinc-400 leading-relaxed font-mono bg-black/5 dark:bg-white/5 p-1.5 rounded-sm overflow-x-auto">
                        {selectedStageSKUs.formula}
                      </p>
                    </div>
                  )}

                  {selectedStageSKUs.lineage && (
                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5 pt-3 md:pt-0 md:pl-3.5">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-purple-500 uppercase tracking-wider mb-1">
                        <span>🔗</span>
                        <span>Data Lineage</span>
                      </div>
                      <div className="flex flex-col items-stretch gap-1 text-[10px]">
                        {selectedStageSKUs.lineage.split(' -> ').map((step, idx, arr) => (
                          <React.Fragment key={step}>
                            <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/10 dark:border-purple-500/20 px-2.5 py-1.5 rounded-sm font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm text-center">
                              {step}
                            </div>
                            {idx < arr.length - 1 && (
                              <div className="text-purple-400 dark:text-purple-500 text-center font-bold">
                                ↓
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {selectedStageSKUs.skus.length > 0 ? (
                <div className="border border-black/5 dark:border-white/10 rounded-sm overflow-hidden bg-zinc-50/30 dark:bg-white/5">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-extrabold">
                        <th className="p-3">SKU Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Region</th>
                        <th className="p-3">Stage</th>
                        <th className="p-3">Readiness</th>
                        <th className="p-3">Risk</th>
                        <th className="p-3">Rev Exposure</th>
                        <th className="p-3">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {selectedStageSKUs.skus.map(sku => (
                        <tr 
                          key={sku.id}
                          className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors"
                        >
                          <td className="p-3 font-extrabold text-zinc-900 dark:text-zinc-200">
                            {sku.name}
                            <span className="block text-[8px] text-zinc-400 font-bold uppercase mt-0.5">{sku.brand}</span>
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400 font-bold">{sku.category}</td>
                          <td className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">{sku.region}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wide ${
                              sku.stage === 'Launch' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                              sku.stage === 'Pre-market' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                              sku.stage === 'Testing' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                              'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                            }`}>
                              {sku.stage}
                            </span>
                          </td>
                          <td className="p-3 font-bold">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                sku.readiness >= 75 ? 'bg-emerald-500' :
                                sku.readiness >= 50 ? 'bg-amber-500' :
                                'bg-red-500'
                              }`} />
                              <span className={
                                sku.readiness >= 75 ? 'text-emerald-500' :
                                sku.readiness >= 50 ? 'text-amber-500' :
                                'text-red-500'
                              }>{sku.readiness}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`font-extrabold ${
                              sku.risk === 'High' ? 'text-red-500' :
                              sku.risk === 'Medium' ? 'text-amber-500' :
                              'text-emerald-500'
                            }`}>
                              {sku.risk}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-zinc-800 dark:text-zinc-400">
                            ${sku.revExposure.toFixed(1)}M
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-500 font-bold">{sku.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-zinc-500">No SKUs in this status currently</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 flex justify-end">
              <button 
                onClick={() => setSelectedStageSKUs(null)}
                className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Slide-out Gate Review Details Drawer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            style={{ zIndex: LAYER.nested }}
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Gate review details"
            style={{ zIndex: LAYER.detail }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-950 border-l border-black/10 dark:border-white/10 shadow-2xl flex flex-col animate-slideOver overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-blue-500">
                  {selectedProductGates.productId} • {selectedProductGates.productName}
                </span>
                <h3 className="text-xs font-display font-black text-zinc-900 dark:text-zinc-100">
                  {selectedStage.gateName}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors border-none bg-transparent"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
              {/* Gate metadata cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-sm">
                  <span className="text-[7px] font-bold uppercase text-zinc-500 block mb-1">Gate Owner</span>
                  <div className="flex items-center gap-1.5">
                    <User size={11} className="text-zinc-600 dark:text-zinc-500" />
                    <span className="text-[9px] font-extrabold text-zinc-700 dark:text-zinc-300">
                      {selectedStage.reviewer}
                    </span>
                  </div>
                </div>

                <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-sm">
                  <span className="text-[7px] font-bold uppercase text-zinc-500 block mb-1">Review Date</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-zinc-600 dark:text-zinc-500" />
                    <span className="text-[9px] font-extrabold text-zinc-700 dark:text-zinc-300">
                      {selectedStage.reviewDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Risk Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-sm">
                  <span className="text-[7px] font-bold uppercase text-zinc-500 block mb-1">Gate Status</span>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    selectedStage.status === 'Passed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                    selectedStage.status === 'Failed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    selectedStage.status === 'Waived' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    {selectedStage.status === 'Passed' && <CheckCircle2 size={9} />}
                    {selectedStage.status === 'Failed' && <XCircle size={9} />}
                    {selectedStage.status === 'Waived' && <AlertCircle size={9} />}
                    {selectedStage.status === 'Pending' && <Clock size={9} />}
                    {selectedStage.status}
                  </span>
                </div>

                <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-sm">
                  <span className="text-[7px] font-bold uppercase text-zinc-500 block mb-1">Risk Assessment</span>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    selectedStage.riskRating === 'No Risk' ? 'bg-emerald-500/10 text-emerald-500' :
                    selectedStage.riskRating === 'High Risk' ? 'bg-red-500/10 text-red-500' :
                    selectedStage.riskRating === 'Medium/High Risk' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {selectedStage.riskRating}
                  </span>
                </div>
              </div>

              {/* Approval Notes */}
              <div className="space-y-1">
                <span className="text-[8px] font-bold uppercase text-zinc-500">Approval / Review Notes</span>
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-sm border border-black/5 dark:border-white/5 text-[9px] text-zinc-700 dark:text-zinc-400 leading-relaxed">
                  {selectedStage.approvalNotes}
                </div>
              </div>

              {/* Supporting Documents */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold uppercase text-zinc-500">Supporting Documents</span>
                <div className="space-y-1">
                  {selectedStage.supportingDocs.map((doc, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-sm text-[8px] text-zinc-700 dark:text-zinc-400 font-bold transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText size={11} className="text-zinc-500 dark:text-zinc-600" />
                        <span>{doc}</span>
                      </div>
                      <span className="text-blue-500 hover:underline">Download</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Trail */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold uppercase text-zinc-500">Audit Trail</span>
                <div className="border border-black/5 dark:border-white/5 rounded-sm overflow-hidden bg-zinc-50/20 dark:bg-white/5">
                  <div className="p-2 bg-black/[0.02] dark:bg-white/5 text-[7px] font-bold uppercase tracking-wider text-zinc-400 border-b border-black/5 dark:border-white/5 grid grid-cols-3">
                    <div>Timestamp</div>
                    <div>Action</div>
                    <div>User</div>
                  </div>
                  <div className="divide-y divide-black/5 dark:divide-white/5 max-h-24 overflow-y-auto">
                    {selectedStage.auditTrail.map((log, idx) => (
                      <div key={idx} className="p-2 text-[8px] grid grid-cols-3 text-zinc-600 dark:text-zinc-400 font-medium">
                        <div className="font-mono">{log.timestamp}</div>
                        <div className="font-bold text-zinc-700 dark:text-zinc-300">{log.action}</div>
                        <div className="truncate">{log.user}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* VP Overrides Section */}
              <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3">
                <span className="text-[8px] font-bold uppercase text-red-500 flex items-center gap-1">
                  <Shield size={11} />
                  VP Governance Overrides
                </span>
                
                <div className="flex gap-2">
                  <button
                    disabled={selectedStage.status === 'Passed'}
                    onClick={() => handleForcePass(selectedProductGates.productId, selectedStage.stageName)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wider rounded-sm cursor-pointer border-none transition-all flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={11} />
                    Force Pass Gate
                  </button>

                  <button
                    disabled={selectedStage.status === 'Waived'}
                    onClick={() => handleWaiveGate(selectedProductGates.productId, selectedStage.stageName)}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600 text-white font-bold text-[9px] uppercase tracking-wider rounded-sm cursor-pointer border-none transition-all flex items-center justify-center gap-1"
                  >
                    <AlertTriangle size={11} />
                    Waive Gate
                  </button>
                </div>

                {/* Comment Section */}
                <div className="space-y-1.5">
                  <textarea
                    placeholder="Append comment or escalation directive to this gate..."
                    value={vpCommentText}
                    onChange={(e) => setVpCommentText(e.target.value)}
                    className="w-full h-12 p-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm text-[9px] text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500/50 resize-none font-sans"
                  />
                  <button
                    onClick={() => handleAddComment(selectedProductGates.productId, selectedStage.stageName, vpCommentText)}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-800 text-white font-bold text-[9px] uppercase tracking-wider rounded-sm cursor-pointer border-none transition-all flex items-center justify-center gap-1"
                  >
                    <Plus size={11} />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 flex justify-end bg-black/[0.01] dark:bg-white/[0.01]">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 rounded-sm text-[9px] font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer border-none"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
