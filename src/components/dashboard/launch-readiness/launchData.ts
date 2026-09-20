/**
 * Launch pipeline reference data, stage-gate seeding and small formatters.
 *
 * Extracted verbatim from the 2,661-line VPLaunchReadinessView.tsx.
 */

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

export const STAGE_NAMES: ('Concept' | 'Development' | 'Validation' | 'Launch Ready' | 'Live')[] = [
  'Concept', 'Development', 'Validation', 'Launch Ready', 'Live'
];

export const STAGE_OWNERS: Record<string, string> = {
  'Concept': 'Amit Verma (NPD Lead)',
  'Development': 'Vikram Solanki (QC & Logistics)',
  'Validation': 'Priya Sharma (Brand Director)',
  'Launch Ready': 'Karan Johar (Retail Relations)',
  'Live': 'John D. (Launch Manager)'
};

export const generateInitialStageGates = (products: VPLaunchProduct[]): ProductStageGates[] => {
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

export const RECIPIENT_TITLES: Record<string, string> = {
  'ananya.sen@aciesglobal.com': 'VP Finance',
  'vikram.solanki@aciesglobal.com': 'QC Manager & Logistics Lead',
  'priya.sharma@aciesglobal.com': 'Brand Director',
  'rajendra.patel@aciesglobal.com': 'Vapi Hub Director',
  'amit.verma@aciesglobal.com': 'NPD Lead',
  'karan.johar@aciesglobal.com': 'Retail Relations Director'
};

export interface VPLaunchProduct {
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

export const VP_PRODUCTS: VPLaunchProduct[] = [
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

export const getHexagonStyles = (status: 'Passed' | 'Failed' | 'Waived' | 'Pending', isCurrentPending: boolean, isDarkMode: boolean) => {
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

export const formatReviewerName = (name: string) => {
  const parts = name.split(' ');
  if (parts.length <= 1) return name;
  const firstName = parts[0];
  const lastName = parts[1];
  if (lastName === 'Verma') {
    return `${firstName} ${lastName}`;
  }
  return `${firstName} ${lastName[0]}.`;
};
