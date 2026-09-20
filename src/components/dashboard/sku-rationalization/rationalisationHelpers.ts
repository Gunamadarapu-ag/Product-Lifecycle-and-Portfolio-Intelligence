/**
 * Root-cause lookups and task generation for a selected SKU.
 *
 * Extracted from the original 2,597-line RationalisationTab.tsx.
 */
import type { Task } from './trackerTasks';
import React from 'react';

export const getRcaDetails = (sku: string, factor: string) => {
  const normFactor = factor.toLowerCase();
  if (normFactor.includes('margin') || normFactor.includes('profit') || normFactor.includes('supply')) {
    return {
      summary: 'Unit margins have dropped below the 20% strategic target due to rising commodity costs and high promotional support.',
      rootCauses: [
        { title: 'Material Cost Inflation', desc: 'Raw material procurement costs for this product category have risen by 14.5% YoY.' },
        { title: 'Promotional Dilution', desc: 'Average promotional discount depth of 38% with a low volume lift ratio (1.12x).' },
        { title: 'Manufacturing Overhead', desc: 'Short production runs result in high changeover times, increasing manufacturing overhead by 8.2% per unit.' }
      ],
      metrics: [
        { label: 'Gross Margin', value: '11.4%', target: '25.0%', status: 'Critical' },
        { label: 'Promo Spend', value: '$84K', target: '< $50K', status: 'Warning' },
        { label: 'COGS % of Rev', value: '72.3%', target: '< 60.0%', status: 'Critical' }
      ],
      recommendations: 'Shift SKU to Consolidated regional manufacturing; reduce promotional frequency by 50% and implement a price correction.',
      perks: [
        { metric: 'Gross Margin %', current: '11.4%', future: '26.2%', delta: '+14.8pt (+1480 bps)', isPositive: true },
        { metric: 'Annualized COGS', current: '$3.59M', future: '$3.08M', delta: '-$510K (-14.2%)', isPositive: true },
        { metric: 'Working Capital locked', current: '$1.20M', future: '$150K', delta: '-$1.05M (-87.5%)', isPositive: true },
        { metric: 'Promotional ROI', current: '1.12x', future: '1.85x', delta: '+0.73x (+65.2%)', isPositive: true }
      ]
    };
  } else if (normFactor.includes('sales') || normFactor.includes('decline')) {
    return {
      summary: 'Volume sales have consistently declined for three consecutive quarters, indicating market saturation or shifting consumer preferences.',
      rootCauses: [
        { title: 'Consumer Trend Shift', desc: 'Market-wide migration towards healthier, sugar-free, or eco-friendly alternatives in this segment.' },
        { title: 'Shelf Space Reduction', desc: 'Lost primary eye-level shelf space at major retail partners in favor of competitor store brands.' },
        { title: 'Price Elasticity Pressure', desc: 'Competitor price cuts have made this SKU 15% more expensive than direct substitutes without clear differentiation.' }
      ],
      metrics: [
        { label: 'Sales Growth (QoQ)', value: '-18.5%', target: '> +2.0%', status: 'Critical' },
        { label: 'Retailer Penetration', value: '42.0%', target: '> 60.0%', status: 'Warning' },
        { label: 'Brand Health Score', value: '64 / 100', target: '80 / 100', status: 'Warning' }
      ],
      recommendations: 'Reposition the brand with natural ingredients or repackage into multi-packs to improve volume sales and reclaim retail shelf-space.',
      perks: [
        { metric: 'Volume Sales Growth', current: '-18.5%', future: '+4.2%', delta: '+22.7pt', isPositive: true },
        { metric: 'Retailer Shelf Penetration', current: '42.0%', future: '78.0%', delta: '+36.0pt', isPositive: true },
        { metric: 'Annualized Revenue', current: '$2.15M', future: '$2.80M', delta: '+$650K (+30.2%)', isPositive: true },
        { metric: 'Brand Health Index', current: '64/100', future: '85/100', delta: '+21 points', isPositive: true }
      ]
    };
  } else if (normFactor.includes('overlap') || normFactor.includes('proliferation') || normFactor.includes('cannibalization')) {
    return {
      summary: 'High portfolio overlap and similarity with core items, leading to operational complexity and warehouse footprint wastage.',
      rootCauses: [
        { title: 'Flavor/Size Redundant', desc: 'This SKU sits between two high-volume variants, adding minimal incremental category volume.' },
        { title: 'Distribution Inefficient', desc: 'Low velocity leads to slow warehouse turnover, occupying high-cost picking slots.' },
        { title: 'Retailer Confusion', desc: 'Retailers are refusing to list the entire range, causing fragmented distribution patterns.' }
      ],
      metrics: [
        { label: 'Incremental Volume', value: '2.4%', target: '> 10.0%', status: 'Critical' },
        { label: 'Stock Turns / Year', value: '4.2x', target: '> 12.0x', status: 'Critical' },
        { label: 'Distribution SKU Count', value: '248', target: '200 Max', status: 'Warning' }
      ],
      recommendations: 'Consolidate the SKU into the core brand variant. Delist this specific pack size and transition existing retail contracts to the main product line.',
      perks: [
        { metric: 'Incremental Category Vol', current: '2.4%', future: '12.8%', delta: '+10.4pt', isPositive: true },
        { metric: 'Annual Stock Turns', current: '4.2x', future: '14.5x', delta: '+10.3x (+245%)', isPositive: true },
        { metric: 'Changeover Overhead Cost', current: '$140K', future: '$35K', delta: '-$105K (-75.0%)', isPositive: true },
        { metric: 'Shelf Space Efficiency', current: '48%', future: '92%', delta: '+44pt', isPositive: true }
      ]
    };
  } else {
    // Regulatory or fallback
    return {
      summary: 'Pending chemical tax regulation changes will inflate surfactant packaging COGS by 18%, causing negative gross margin.',
      rootCauses: [
        { title: 'Regulatory COGS Surge', desc: 'Pending chemical tax regulation changes will inflate packaging surfactant COGS by 18%.' },
        { title: 'Formula Compliance', desc: 'Current ingredient formula contains surfactants that face outright ban in major sales regions.' },
        { title: 'Eco-Friendly Gap', desc: 'Lack of compliant compostable packaging alternatives in the current sourcing catalog.' }
      ],
      metrics: [
        { label: 'Compliance Index', value: 'Non-Compliant', target: 'Compliant', status: 'Critical' },
        { label: 'Transition Cost Est.', value: '$180K', target: '< $50K', status: 'Critical' },
        { label: 'Time to Ban Deadline', value: '85 Days', target: '> 180 Days', status: 'Warning' }
      ],
      recommendations: 'Discontinue the current packaging model immediately and transition to the compostable eco-friendly design to ensure compliance.',
      perks: [
        { metric: 'Compliance Index Status', current: 'Non-Compliant', future: '100% Compliant', delta: 'Resolved', isPositive: true },
        { metric: 'Surfactant Chemical Tax', current: '$180K/yr', future: '$0/yr', delta: '-$180K (-100%)', isPositive: true },
        { metric: 'Eco-Preference Lift', current: 'Neutral', future: '+18.0%', delta: '+18.0% Volume', isPositive: true },
        { metric: 'Container COGS Premium', current: '$0.34/unit', future: '$0.38/unit', delta: '+$0.04 (+11.7%)', isPositive: false }
      ]
    };
  }
};

// Previously a second, narrower `Task` interface was declared here while the
// tracker used its own. Both fed the same `trackerTasks` state, so the two
// shapes could disagree silently. Use the canonical model instead.


export const generateTasksForSku = (skuName: string, action: string, factor: string): Record<string, Task[]> => {
  const normAction = (action || '').toLowerCase();
  const timestamp = Date.now();

  const generated: Record<string, Task[]> = {};

  if (normAction.includes('sunset') || normAction.includes('discontinue') || normAction.includes('rationalise') || normAction.includes('remove') || normAction.includes('rationalize')) {
    generated.pmo = [
      { id: `pmo-auto-${timestamp}-1`, tags: ['Scope'], title: `Coordinate sunset checklist & transition for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.procurement = [
      { id: `pro-auto-${timestamp}-1`, tags: ['Analysis'], title: `Negotiate contract termination & raw materials write-off for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
    generated.finance = [
      { id: `fin-auto-${timestamp}-1`, tags: ['Analysis'], title: `Calculate final margin write-off savings & tax implications for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.consumer = [
      { id: `con-auto-${timestamp}-1`, tags: ['Scope'], title: `Draft customer substitution & delisting notice for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['AM'], isNew: true, createdAt: timestamp }
    ];
  } else if (normAction.includes('consolidate') || normAction.includes('merge')) {
    generated.pmo = [
      { id: `pmo-auto-${timestamp}-1`, tags: ['Scope'], title: `Manage consolidation timeline & retail transition for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.rd = [
      { id: `rd-auto-${timestamp}-1`, tags: ['Design'], title: `Draft SKU merge specifications & revised bill of materials for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
    generated.marketing = [
      { id: `mkt-auto-${timestamp}-1`, tags: ['Design'], title: `Execute packaging rebranding & shelf slot transition mockups for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.sales = [
      { id: `sls-auto-${timestamp}-1`, tags: ['Development'], title: `Update price list sheets & retail inventory links for consolidated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['AM'], isNew: true, createdAt: timestamp }
    ];
  } else {
    generated.rd = [
      { id: `rd-auto-${timestamp}-1`, tags: ['Development'], title: `Develop ingredient substitution prototypes for ${skuName} cost savings`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
    generated.qa = [
      { id: `qa-auto-${timestamp}-1`, tags: ['Testing'], title: `Execute formula stability testing & check compliance files for reformulated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['AM'], isNew: true, createdAt: timestamp }
    ];
    generated.procurement = [
      { id: `pro-auto-${timestamp}-1`, tags: ['Development'], title: `Source new raw material vendor agreements for reformulated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.sustainability = [
      { id: `sus-auto-${timestamp}-1`, tags: ['Analysis'], title: `Conduct packaging recyclability lifecycle assessment for reformulated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
  }
  return generated;
};
