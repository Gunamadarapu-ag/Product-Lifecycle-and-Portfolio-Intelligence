/**
 * Scenario shape, margin velocity alerts and break-even SKUs.
 *
 * Extracted from ProfitabilityTree.tsx (2,081 lines).
 */


export interface Scenario {
  name: string;
  units: number;
  price: number;
  cost: number;
  logistics: number;
  promo: number;
  overhead: number;
  rev: number;
  gm: number;
  ebit: number;
  gmPct: string;
  ebitPct: string;
}

export const marginVelocityAlerts = [
  { name: 'Snacks', detail: 'from 22% margin', delta: '-1.2pp/mo', status: 'critical', sColor: '#ef4444' },
  { name: 'Green Tea RTD', detail: 'Beverages · Now 29% margin', delta: '-1.1pp/mo', status: 'high', sColor: '#f59e0b' },
  { name: 'Foam Face Wash', detail: 'Personal Care · Now 26% margin', delta: '-1.0pp/mo', status: 'high', sColor: '#f59e0b' },
  { name: 'Fabric Softener', detail: 'Household · Now 15% margin', delta: '-1.0pp/mo', status: 'critical', sColor: '#ef4444' },
];

export const breakevenSKUs = [
  { name: 'Fabric Softener', detail: 'Household · Rev $28Cr', margin: 15, color: '#ef4444' },
  { name: 'Floor Cleaner', detail: 'Household · Rev $30Cr', margin: 19, color: '#f59e0b' },
];
