/**
 * Static reference data for the Rationalisation tab.
 *
 * Extracted from the original 2,597-line RationalisationTab.tsx.
 */
import React from 'react';
import { TrendingDown, Tag, Compass, Shield, Box } from 'lucide-react';

export const REASONS = [
  { category: 'LOW PROFITABILITY REASONS', count: 4, desc: 'Key factors identified', icon: TrendingDown, color: 'text-red-500 bg-red-500/10' },
  { category: 'PORTFOLIO REASONS', count: 4, desc: 'Strategic issues', icon: Compass, color: 'text-blue-500 bg-blue-500/10' },
  { category: 'SUPPLY CHAIN REASONS', count: 3, desc: 'Operational challenges', icon: Box, color: 'text-amber-500 bg-amber-500/10' },
  { category: 'CUSTOMER & MARKET REASONS', count: 5, desc: 'Market & customer issues', icon: Tag, color: 'text-purple-500 bg-purple-500/10' },
  { category: 'REGULATORY & RISK REASONS', count: 3, desc: 'Compliance & risk factors', icon: Shield, color: 'text-emerald-500 bg-emerald-500/10' }
];

export const RATIONALE_DRIVERS = [
  { rank: 1, name: 'Financial', count: 90, pct: 29, color: '#ef4444' },
  { rank: 2, name: 'Portfolio', count: 55, pct: 18, color: '#3b82f6' },
  { rank: 3, name: 'Supply Chain', count: 65, pct: 21, color: '#f59e0b' },
  { rank: 4, name: 'Customer & Market', count: 50, pct: 16, color: '#a855f7' },
  { rank: 5, name: 'Regulatory & Risk', count: 50, pct: 16, color: '#10b981' }
];

export interface RoadmapPhaseData {
  title: string;
  step: string;
  skusCount: number;
  revenue: string;
  action: string;
  categories: { name: string; count: number; color: string }[];
  regions: { name: string; count: number; color: string }[];
  stages: { name: string; count: number; color: string }[];
  insights: string[];
  skus: {
    sku: string;
    code: string;
    category: string;
    region: string;
    revenue: string;
    margin: string;
    growth: string;
    growthColor: string;
    stage: string;
    action: string;
  }[];
}

export const ROADMAP_PHASES_DETAILS: Record<string, RoadmapPhaseData> = {
  q1: {
    title: 'Discontinue / Consolidate',
    step: 'Q1 - Step 1',
    skusCount: 78,
    revenue: '$23.4M',
    action: 'Discontinue / Consolidate',
    categories: [
      { name: 'Snacks & Beverages', count: 29, color: 'bg-indigo-500' },
      { name: 'Home & Living', count: 15, color: 'bg-emerald-500' },
      { name: 'Apparel & Accessories', count: 12, color: 'bg-amber-500' },
      { name: 'Personal Care', count: 10, color: 'bg-blue-500' },
      { name: 'Family & Pet Care', count: 8, color: 'bg-red-500' },
      { name: 'Home Care', count: 4, color: 'bg-teal-500' }
    ],
    regions: [
      { name: 'LATAM', count: 24, color: 'bg-indigo-500' },
      { name: 'North America', count: 22, color: 'bg-emerald-500' },
      { name: 'Europe', count: 18, color: 'bg-amber-500' },
      { name: 'APAC', count: 14, color: 'bg-blue-500' }
    ],
    stages: [
      { name: 'Maturity', count: 55, color: 'bg-indigo-500' },
      { name: 'Growth', count: 18, color: 'bg-emerald-500' },
      { name: 'Decline', count: 5, color: 'bg-amber-500' }
    ],
    insights: [
      '37% of affected SKUs sit in Snacks & Beverages — the largest concentration, suggesting a category-level review rather than one-off fixes.',
      'Average margin is 12.4%, below the portfolio average of 20.7% by 8.3 pts.',
      'Average YoY growth is -6.8%, behind the portfolio average (-4.2%).',
      'Customer satisfaction averages 52/100 vs a portfolio average of 69, and LATAM carries the largest regional share (24 SKUs).',
      'Combined annualized revenue exposure across these SKUs is $23.4M.'
    ],
    skus: [
      { sku: 'Sparkling Water Lime', code: 'SKU-1022', category: 'Snacks & Beverages', region: 'LATAM', revenue: '$480K', margin: '10.2%', growth: '-7.5%', growthColor: 'text-red-500', stage: 'Decline', action: 'Discontinue / Consolidate' },
      { sku: 'Premium Office Chair', code: 'SKU-1144', category: 'Home & Living', region: 'North America', revenue: '$450K', margin: '11.8%', growth: '-8.9%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Discontinue / Consolidate' },
      { sku: 'Cotton Socks Pack', code: 'SKU-1077', category: 'Apparel & Accessories', region: 'Europe', revenue: '$410K', margin: '9.4%', growth: '-5.2%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Discontinue / Consolidate' },
      { sku: 'Hydrating Shaving Gel', code: 'SKU-1188', category: 'Personal Care', region: 'APAC', revenue: '$390K', margin: '12.0%', growth: '-4.1%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Discontinue / Consolidate' },
      { sku: 'Organic Dog Treats', code: 'SKU-1201', category: 'Family & Pet Care', region: 'LATAM', revenue: '$380K', margin: '13.5%', growth: '-6.0%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Discontinue / Consolidate' },
      { sku: 'Lemon Dish Soap', code: 'SKU-1212', category: 'Home Care', region: 'North America', revenue: '$350K', margin: '8.5%', growth: '-9.1%', growthColor: 'text-red-500', stage: 'Decline', action: 'Discontinue / Consolidate' }
    ]
  },
  q2: {
    title: 'Reposition',
    step: 'Q2 - Step 2',
    skusCount: 56,
    revenue: '$16.4M',
    action: 'Reposition',
    categories: [
      { name: 'Snacks & Beverages', count: 22, color: 'bg-indigo-500' },
      { name: 'Home & Living', count: 11, color: 'bg-emerald-500' },
      { name: 'Apparel & Accessories', count: 8, color: 'bg-amber-500' },
      { name: 'Personal Care', count: 7, color: 'bg-blue-500' },
      { name: 'Family & Pet Care', count: 5, color: 'bg-red-500' },
      { name: 'Home Care', count: 3, color: 'bg-teal-500' }
    ],
    regions: [
      { name: 'LATAM', count: 18, color: 'bg-indigo-500' },
      { name: 'North America', count: 16, color: 'bg-emerald-500' },
      { name: 'Europe', count: 12, color: 'bg-amber-500' },
      { name: 'APAC', count: 10, color: 'bg-blue-500' }
    ],
    stages: [
      { name: 'Maturity', count: 40, color: 'bg-indigo-500' },
      { name: 'Growth', count: 12, color: 'bg-emerald-500' },
      { name: 'Decline', count: 4, color: 'bg-amber-500' }
    ],
    insights: [
      '39% of affected SKUs sit in Snacks & Beverages — the largest concentration, suggesting a category-level review rather than one-off fixes.',
      'Average margin is 18.2%, below the portfolio average of 20.7% by 2.5 pts.',
      'Average YoY growth is 2.1%, ahead of the portfolio average (-4.2%).',
      'Customer satisfaction averages 61/100 vs a portfolio average of 69, and LATAM carries the largest regional share (18 SKUs).',
      'Combined annualized revenue exposure across these SKUs is $16.4M.'
    ],
    skus: [
      { sku: 'Diet Orange Soda', code: 'SKU-1045', category: 'Snacks & Beverages', region: 'LATAM', revenue: '$420K', margin: '18.5%', growth: '+1.5%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reposition' },
      { sku: 'Ergonomic Seat Cushion', code: 'SKU-1120', category: 'Home & Living', region: 'North America', revenue: '$380K', margin: '17.4%', growth: '+2.1%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Reposition' },
      { sku: 'Running Cap Pro', code: 'SKU-1090', category: 'Apparel & Accessories', region: 'Europe', revenue: '$340K', margin: '19.0%', growth: '+3.4%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reposition' },
      { sku: 'Aloe Vera Lotion', code: 'SKU-1160', category: 'Personal Care', region: 'APAC', revenue: '$310K', margin: '16.5%', growth: '+1.8%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Reposition' },
      { sku: 'Premium Cat Kibble', code: 'SKU-1205', category: 'Family & Pet Care', region: 'LATAM', revenue: '$290K', margin: '20.1%', growth: '+2.5%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reposition' }
    ]
  },
  q3: {
    title: 'Reformulate / Redesign',
    step: 'Q3 - Step 3',
    skusCount: 72,
    revenue: '$21.1M',
    action: 'Reformulate / Redesign',
    categories: [
      { name: 'Snacks & Beverages', count: 27, color: 'bg-[#4f46e5]' },
      { name: 'Home & Living', count: 13, color: 'bg-[#10b981]' },
      { name: 'Apparel & Accessories', count: 10, color: 'bg-[#f59e0b]' },
      { name: 'Personal Care', count: 9, color: 'bg-[#3b82f6]' },
      { name: 'Family & Pet Care', count: 7, color: 'bg-[#ef4444]' },
      { name: 'Home Care', count: 6, color: 'bg-[#0d9488]' }
    ],
    regions: [
      { name: 'LATAM', count: 21, color: 'bg-[#4f46e5]' },
      { name: 'North America', count: 21, color: 'bg-[#10b981]' },
      { name: 'Europe', count: 17, color: 'bg-[#f59e0b]' },
      { name: 'APAC', count: 13, color: 'bg-[#3b82f6]' }
    ],
    stages: [
      { name: 'Maturity', count: 51, color: 'bg-[#4f46e5]' },
      { name: 'Growth', count: 19, color: 'bg-[#10b981]' },
      { name: 'Decline', count: 2, color: 'bg-[#f59e0b]' }
    ],
    insights: [
      '38% of affected SKUs sit in Snacks & Beverages — the largest concentration, suggesting a category-level review rather than one-off fixes.',
      'Average margin is 20.6%, below the portfolio average of 20.7% by 0.2 pts.',
      'Average YoY growth is 4.5%, ahead of the portfolio average (-4.2%).',
      'Customer satisfaction averages 66/100 vs a portfolio average of 69, and LATAM carries the largest regional share (21 SKUs).',
      'Combined annualized revenue exposure across these SKUs is $21.1M.'
    ],
    skus: [
      { sku: 'Cedar & Co Energy Drink Classic', code: 'SKU-1049', category: 'Snacks & Beverages', region: 'LATAM', revenue: '$507K', margin: '32.2%', growth: '+4.7%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Meridian Phone Charger Sport', code: 'SKU-1129', category: 'Apparel & Accessories', region: 'North America', revenue: '$506K', margin: '4.8%', growth: '+3.6%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Foundry Yoga Mat Max', code: 'SKU-1119', category: 'Home & Living', region: 'LATAM', revenue: '$498K', margin: '34.5%', growth: '-5.9%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Everline Ice Cream Tub Lite', code: 'SKU-1003', category: 'Snacks & Beverages', region: 'LATAM', revenue: '$495K', margin: '15.7%', growth: '-5.6%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Everline Conditioner Sensitive', code: 'SKU-1152', category: 'Personal Care', region: 'APAC', revenue: '$471K', margin: '19.9%', growth: '+18.2%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Reformulate / Redesign' },
      { sku: 'Foundry Coffee Pods Classic', code: 'SKU-1055', category: 'Snacks & Beverages', region: 'North America', revenue: '$467K', margin: '21.9%', growth: '-0.3%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Crestview Cotton T-Shirt Family Pack', code: 'SKU-1097', category: 'Apparel & Accessories', region: 'Europe', revenue: '$456K', margin: '6.7%', growth: '+5.7%', growthColor: 'text-emerald-500', stage: 'Maturity', action: 'Reformulate / Redesign' },
      { sku: 'Northwind Notebook Set Family Pack', code: 'SKU-1193', category: 'Home & Living', region: 'LATAM', revenue: '$455K', margin: '21.6%', growth: '-2.1%', growthColor: 'text-red-500', stage: 'Maturity', action: 'Reformulate / Redesign' }
    ]
  },
  q4: {
    title: 'Invest / Expand',
    step: 'Q4 - Step 4',
    skusCount: 42,
    revenue: '$12.8M',
    action: 'Invest / Expand',
    categories: [
      { name: 'Snacks & Beverages', count: 16, color: 'bg-indigo-500' },
      { name: 'Home & Living', count: 8, color: 'bg-emerald-500' },
      { name: 'Apparel & Accessories', count: 6, color: 'bg-amber-500' },
      { name: 'Personal Care', count: 5, color: 'bg-blue-500' },
      { name: 'Family & Pet Care', count: 4, color: 'bg-red-500' },
      { name: 'Home Care', count: 3, color: 'bg-teal-500' }
    ],
    regions: [
      { name: 'LATAM', count: 13, color: 'bg-indigo-500' },
      { name: 'North America', count: 12, color: 'bg-emerald-500' },
      { name: 'Europe', count: 10, color: 'bg-amber-500' },
      { name: 'APAC', count: 7, color: 'bg-blue-500' }
    ],
    stages: [
      { name: 'Maturity', count: 28, color: 'bg-indigo-500' },
      { name: 'Growth', count: 12, color: 'bg-emerald-500' },
      { name: 'Decline', count: 2, color: 'bg-amber-500' }
    ],
    insights: [
      '38% of affected SKUs sit in Snacks & Beverages — the largest concentration, suggesting a category-level review rather than one-off fixes.',
      'Average margin is 26.5%, ahead of the portfolio average of 20.7% by 5.8 pts.',
      'Average YoY growth is 14.8%, ahead of the portfolio average (-4.2%).',
      'Customer satisfaction averages 78/100 vs a portfolio average of 69, and LATAM carries the largest regional share (13 SKUs).',
      'Combined annualized revenue exposure across these SKUs is $12.8M.'
    ],
    skus: [
      { sku: 'BrandA Cola 500ml', code: 'SKU-1001', category: 'Snacks & Beverages', region: 'LATAM', revenue: '$650K', margin: '28.5%', growth: '+12.4%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Invest / Expand' },
      { sku: 'Ultra Light Sleeping Pad', code: 'SKU-1110', category: 'Home & Living', region: 'North America', revenue: '$520K', margin: '27.4%', growth: '+10.9%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Invest / Expand' },
      { sku: 'Waterproof Running Jacket', code: 'SKU-1080', category: 'Apparel & Accessories', region: 'Europe', revenue: '$480K', margin: '25.8%', growth: '+15.2%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Invest / Expand' },
      { sku: 'Gentle Cleansing Foam', code: 'SKU-1150', category: 'Personal Care', region: 'APAC', revenue: '$420K', margin: '29.0%', growth: '+11.5%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Invest / Expand' },
      { sku: 'Eco-Friendly Laundry Pods', code: 'SKU-1210', category: 'Home Care', region: 'North America', revenue: '$380K', margin: '24.5%', growth: '+9.8%', growthColor: 'text-emerald-500', stage: 'Growth', action: 'Invest / Expand' }
    ]
  }
};
