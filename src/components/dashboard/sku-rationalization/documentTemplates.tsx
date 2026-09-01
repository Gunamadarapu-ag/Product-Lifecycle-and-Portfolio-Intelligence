/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface DocumentParams {
  skuA: string;
  skuB: string;
  category: string;
  pairRisk: number;
  transferenceRate: number;
  transferenceVolume: number;
  marginDiffUplift: number;
  complexitySavings: number;
  annualSavingsThousands: number;
  exitDateDays: number;
  pricingPriceShift: number;
  supplySafetyStockShift: number;
}

export const getDocumentTemplates = ({
  skuA,
  skuB,
  category,
  pairRisk,
  transferenceRate,
  transferenceVolume,
  marginDiffUplift,
  complexitySavings,
  annualSavingsThousands,
  exitDateDays,
  pricingPriceShift,
  supplySafetyStockShift,
}: DocumentParams): Record<string, { title: string; subtitle: string; code: string; content: React.ReactNode }> => {
  return {
    price_ladder: {
      title: "BRAND PRICE LADDER COMPARISON REPORT",
      subtitle: "FORM FIN-LADDER-102",
      code: "SHA256: e82f1b0a92d3f9e9a44b8292019c83664ef819bc2e1a90c1f2b2c3a5b6c7d8e90",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] ANALYSIS STATUS:</strong> <span className="text-emerald-500 font-extrabold">COMPLETED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="grid grid-cols-3 gap-2 text-[9px] font-bold text-center border-b pb-1.5 border-black/5 dark:border-white/5 text-zinc-500">
            <div>Metric</div>
            <div className="text-purple-700 dark:text-purple-400">{skuA ? skuA.split(' ')[0] : ''}</div>
            <div className="text-emerald-500">{skuB ? skuB.split(' ')[0] : ''}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[9px] font-semibold text-center divide-y divide-black/[0.02] dark:divide-white/[0.02] text-zinc-600 dark:text-zinc-400">
            <div className="text-left font-bold text-[8px] uppercase">Base Retail Price</div>
            <div>$90</div>
            <div>$80</div>
            <div className="text-left font-bold text-[8px] uppercase pt-1.5">Distributor Price</div>
            <div className="pt-1.5">$65</div>
            <div className="pt-1.5">$55</div>
            <div className="text-left font-bold text-[8px] uppercase pt-1.5">Gross Margin</div>
            <div className="pt-1.5 text-red-500 font-extrabold font-bold">41.0%</div>
            <div className="pt-1.5 text-emerald-500 font-extrabold font-bold">34.0%</div>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Price Positioning Audit</span>
            <p>· Sibling {skuB ? skuB.split(' ')[0] : ''} sits $10 lower in the retail value tier.</p>
            <p>· Net margins are aligned; margin shift will be mitigated by volume transference gains.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">David Miller</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Category Financial Controller</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Audit Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    promo_deconfliction: {
      title: "PROMOTIONAL CALENDAR DE-CONFLICTION DIRECTIVE",
      subtitle: "FORM MKT-PROMO-903",
      code: "SHA256: 12f9b2d9a9bc8f42d201e912f2b2d2a2c2c2f1f5e2a2c3a5b6c7d8e90a98c819",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] MITIGATION STATUS:</strong> <span className="text-emerald-500 font-extrabold">DE-CONFLICTED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Promo Schedule Separations</span>
            <p>Overlapping promotion slots detected on: <strong>Week 4 and Week 8</strong></p>
            <p>Erosion Risk: Double discounting on overlapping category items causes blended margin dilution.</p>
            <p>Mitigation: Halted promotional discount overlays. Separated campaign schedules by 14 days minimum.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-500 block uppercase tracking-wider text-[8px] font-bold font-sans">Promotional Calendar Slots</span>
            <div className="grid grid-cols-6 gap-1.5 text-[8px] text-center font-bold">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                <div key={w} className={`p-1 rounded border bg-black/5 dark:bg-white/5 border-transparent text-zinc-500`}>
                  Wk {w} {w === 4 || w === 8 ? '✅' : ''}
                </div>
              ))}
            </div>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Clara Higgins</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Brand Promotion Director</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    committee_escalation: {
      title: "SKU RATIONALIZATION COMMITTEE ESCALATION BRIEF",
      subtitle: "FORM COM-ESC-122",
      code: "SHA256: 5f9d22c8b9354117fd89c1b3f9b2d90a98c819192938e3e4a9bc8f42d201e912",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] ESCALATION STATUS:</strong> <span className="text-purple-700 dark:text-purple-400 font-extrabold">SUBMITTED TO BOARD</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Escalation Proposal Summary</span>
            <p>Sunset Candidate SKU: <strong>{skuA}</strong></p>
            <p>Target Category: {category}</p>
            <p>Risk Score: {(pairRisk * 100).toFixed(0)}% Substitution Risk</p>
            <p>Estimated Revenue Exposure: ${Math.round(pairRisk * 42)} M</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Escalation Justification</span>
            <p>· Sibling variant {skuB} has capacity margins and supply network ready to absorb sunset demand.</p>
            <p>· Eliminating SKU A will simplify manufacturing lines, reducing logistics and changeover overhead.</p>
            <p>· Net annual Category saving is estimated to reach ${annualSavingsThousands}k.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Vikash Sharma</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Portfolio Review Secretariat</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    watchlist_registration: {
      title: "PORTFOLIO SHORTLIST WATCHLIST REGISTRATION CERTIFICATE",
      subtitle: "FORM PM-WATCH-884",
      code: "SHA256: a82f1b0a92d3f9e9a44b8292019c83664ef819bc2e1a90c1f2b2c3a5b6c7d8e90",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] WATCHLIST STATUS:</strong> <span className="text-emerald-500 font-extrabold">SHORTLISTED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Shortlist Registration Details</span>
            <p>SKU Name: <strong>{skuA}</strong></p>
            <p>Shortlist Date: {new Date().toLocaleDateString()}</p>
            <p>Audit Class: Sunset Candidate</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Strategic Justification</span>
            <p>· High substitution overlap with sibling variant {skuB} ({transferenceRate}%).</p>
            <p>· Low-value product margin performance profile.</p>
            <p>· Registered under the active rationalization monitor loop.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Linda Carter</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Category Portfolio Director</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    mrp_safety_revision: {
      title: "MRP SAFETY STOCK BUFFER REVISION ORDER",
      subtitle: "FORM SC-MRP-049",
      code: "SHA256: c3a5b6c7d8e90a98c819f2b2d2a2c2c2f1f5e2a2c3a5b6c7d8e90a98c81912fa",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] MRP STATUS:</strong> <span className="text-emerald-500 font-extrabold">UPDATED / RE-BUFFERED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">MRP Buffer Modification</span>
            <p>Target Sibling SKU: <strong>{skuB}</strong></p>
            <p>Adjust Safety Buffer Stock level: <strong>+{supplySafetyStockShift}%</strong></p>
            <p>MRP Re-order Point Parameter: Raised to handle target demand redirection.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Operations Safety Assessment</span>
            <p>· Increased safety buffers provide a transition safety net for accounts during the run-down of SKU A.</p>
            <p>· Ensures zero shelf out-of-stock events on variant {skuB ? skuB.split(' ')[0] : ''}.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">David Reynolds</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Director of Material Requirements Planning</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Issue Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    capacity: {
      title: "CAPACITY CLEARANCE & LINE FEASIBILITY CERTIFICATE",
      subtitle: "FORM MFG-CAP-AUD-2026",
      code: "SHA256: 8f3b20c92176d54efd0a1b92a3f9e9a44b8292019c83664ef819bc2e1a90c1f2",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] EVALUATION STATUS:</strong> <span className="text-emerald-500 font-extrabold">FEASIBLE (APPROVED)</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="grid grid-cols-2 gap-4 font-semibold">
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Sunset SKU (A)</span>
              <span className="font-bold">{skuA}</span>
            </div>
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Sibling SKU (B)</span>
              <span className="font-bold">{skuB}</span>
            </div>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Manufacturing Line Audit Details</span>
            <p>Location: Pune Manufacturing Complex, Plant Bottling Line 4</p>
            <p>Line Velocity: 120 Units/Minute (Rotary filler capacity)</p>
            <p>Baseline Line Utilization (pre-absorption): 82.1% OEE</p>
            <p>Incremental Load (SKU A absorbed volume): +7.2% load projection</p>
            <p>Projected Post-Absorption Utilization: 89.3% OEE (Under 96% critical limit)</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Operational Impact & Mitigation</span>
            <p>· Sibling SKU {skuB ? skuB.split(' ')[0] : ''} shares tooling and nozzle calibrations with SKU A.</p>
            <p>· Line changeovers will be reduced from 3 to 1 per week, recovering 8 hours of active runtime.</p>
            <p>· Operations recommends extending shift hours by 4 hours/week during transition peaks.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-900" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Rajesh Nair</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Director of Manufacturing Operations</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Audit Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    sunset: {
      title: "SKU SUNSET DIRECTIVE & RETRACTION TIMELINE",
      subtitle: "FORM MKT-SUNSET-2026-04",
      code: "SHA256: 4f9d22c8b9354117fd89c1b3f9b2d90a98c819192938e3e4a9bc8f42d201e912",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] DIRECTION STATUS:</strong> <span className="text-purple-700 dark:text-purple-400 font-extrabold">PHASE-OUT AUTHORIZED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="grid grid-cols-2 gap-4 font-semibold">
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Product to Sunset</span>
              <span className="font-bold text-red-500">{skuA}</span>
            </div>
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Primary Substituted Variant</span>
              <span className="font-bold text-emerald-500">{skuB}</span>
            </div>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Phase-out Parameters</span>
            <p>Exit Duration Target: {exitDateDays} Days</p>
            <p>Distributor Markdown Allowance: 25% discount threshold</p>
            <p>Shelf Retraction Schedule: Immediate notice to accounts</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Account Notice Dispatches</span>
            <p>· Walmart US: Notice dispatched (Delisting on sunset date)</p>
            <p>· Target Corp: Notice dispatched (Inventory run-down active)</p>
            <p>· Tesco PLC: Delisting pending (Notice queue confirmed)</p>
            <p>· Costco Wholesale: Active review (Margin offset negotiations ongoing)</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Sarah Jenkins</span>
              <span className="block text-[8px] text-zinc-400 font-sans">VP Category Management & Brand Planning</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Issue Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    replenishment_freeze: {
      title: "WMS REPLENISHMENT FREEZE & PRODUCTION BLOCK DIRECTIVE",
      subtitle: "FORM WMS-FRZ-992",
      code: "SHA256: d182c3f8e91916362547b9a8f4c2e1f2b2d2a2c2c2f1f5e2a2c3a5b6c7d8e90a",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] INVENTORY STATUS:</strong> <span className="text-red-500 font-extrabold">LOCKED / STOP REPLENISHMENT</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">ERP Block Directive</span>
            <p>System Affected: SAP S/4HANA & WMS Ledger</p>
            <p>Target SKU Identifier: {skuA}</p>
            <p>Status: Block Level 1 (Stop all inbound SKU releases and manufacturing order routing)</p>
            <p>Warehouse Action: Allow run-down of existing finished DC inventory. Do not replenish.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Current Stock Run-down Estimate</span>
            <p>Warehouse DC-2 (Pune): 1,240 cases remaining</p>
            <p>Warehouse DC-4 (Mumbai): 850 cases remaining</p>
            <p>Estimated Supply Runway: {exitDateDays} days based on current category run rates</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Marcus Brody</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Supply Chain & Logistics Operations Manager</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Block Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    pricing_elasticity: {
      title: "PORTFOLIO CROSS-ELASTICITY & DE-RUIZING SIMULATION REPORT",
      subtitle: "FORM FIN-ELAST-881",
      code: "SHA256: 7f3b8219c92176d54efd0a1b92a3f9e9a44b8292019c83664ef819bc2e1a90c1f2",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] ANALYSIS SUMMARY:</strong> <span className="text-emerald-500 font-extrabold">UPLIFT ESTIMATED (APPROVED)</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="grid grid-cols-2 gap-4 font-semibold">
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Pricing Price Gap</span>
              <span className="font-bold">{pricingPriceShift >= 0 ? '+' : ''}{pricingPriceShift}%</span>
            </div>
            <div>
              <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Estimated Sibling Transference</span>
              <span className="font-bold text-emerald-500">{transferenceRate}%</span>
            </div>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Quantitative Elasticity Parameters</span>
            <p>Sunset SKU Base Price: $90</p>
            <p>Sibling SKU Base Price: $80</p>
            <p>Estimated Sibling Volume Shift: +{(15 + pricingPriceShift * 0.8).toFixed(1)}%</p>
            <p>Uncompensated Category Leakage: {(100 - transferenceRate).toFixed(1)}%</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Financial Net Benefit</span>
            <p>Net Annual Margin Uplift: ${marginDiffUplift.toFixed(2)} M</p>
            <p>Complexity Savings (Logistics release): ${complexitySavings.toFixed(2)} M</p>
            <p>Total Estimated Annual Category Gain: ${(marginDiffUplift + complexitySavings).toFixed(2)} M</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Ananya Roy</span>
              <span className="block text-[8px] text-zinc-400 font-sans">Lead Pricing & FP&A Analyst</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Simulation Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    },
    warehouse_release: {
      title: "FORM SC-114: DC BAY DE-ALLOCATION & CAPITAL RELEASE",
      subtitle: "FORM LOG-BAY-RELEASE",
      code: "SHA256: 3c9b20d98127efd0a1b92a3f9e9a44b8292019c83664ef819bc2e1a90c1f28b2c",
      content: (
        <div className="space-y-4 text-[9.5px]">
          <div>
            <strong>[1] BAY RELEASE STATUS:</strong> <span className="text-emerald-500 font-extrabold">RELEASED / DE-ALLOCATED</span>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Distribution Center De-allocation</span>
            <p>Target DC: Pune Regional Distribution Center</p>
            <p>Released Pallet Locations: 120 locations (Bays DC-2 & DC-4)</p>
            <p>Inventory Level: 0 cases (Run-down completed)</p>
            <p>Recovered Storage Capital: ${(pairRisk * 4.0).toFixed(1)}M / year</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="space-y-1">
            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-sans">Sourcing Redirection</span>
            <p>· Freed warehouse storage positions re-allocated to Hero SKU {skuB ? skuB.split(' ')[0] : ''} stock safety buffers.</p>
            <p>· Material handling labor hours for SKU A reassigned to active SKU B line consolidation.</p>
          </div>
          <hr className="border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[7px] font-bold font-sans">AUTHORIZED SIGNATURE</span>
              <span className="font-serif italic text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Vikram Rathore</span>
              <span className="block text-[8px] text-zinc-400 font-sans">DC Warehouse Director</span>
            </div>
            <div className="text-right text-[8px] text-zinc-400">
              <span>Form Signature Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )
    }
  };
};
