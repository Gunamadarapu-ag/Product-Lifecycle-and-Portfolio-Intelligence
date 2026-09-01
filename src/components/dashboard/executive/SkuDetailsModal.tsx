/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, TrendingUp, TrendingDown, AlertTriangle, Info, Mail, Zap, Activity, Clock, ShieldAlert 
} from 'lucide-react';

interface SKU {
  name: string;
  cat: string;
  rev: number;
  val: number;
  cx: number;
  stockouts: number;
  promo: number;
  margin: number;
  growth: number;
  lead: number;
}

interface SkuDetailsModalProps {
  isOpen: boolean;
  sku: SKU | null;
  onClose: () => void;
  onRequestAction: (email: string, name: string, subject: string, body: string) => void;
}

export const SkuDetailsModal: React.FC<SkuDetailsModalProps> = ({
  isOpen,
  sku,
  onClose,
  onRequestAction
}) => {
  if (!isOpen || !sku) return null;

  // Determine SKU segment
  let segment = 'Consolidate';
  let segmentColor = 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  
  if (sku.val >= 0.7 && sku.cx < 0.4) {
    segment = 'Keep';
    segmentColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  } else if (sku.val >= 0.7 && sku.cx >= 0.4) {
    segment = 'Grow';
    segmentColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  } else if (sku.val < 0.7 && sku.cx >= 0.5) {
    segment = 'Rationalize';
    segmentColor = 'text-red-500 bg-red-500/10 border-red-500/20';
  }

  // Generate tailored AI recommendations & email drafts
  const getAiRecommendations = (item: SKU) => {
    const list: { action: string; impact: string; owner: string; title: string; email: string; body: string }[] = [];
    
    // Determine category plant locations and default leads
    let plantName = 'Vapi Consumer Goods Hub';
    let brandLeadName = 'Marcus Ng';
    let brandLeadTitle = 'Global Procurement Director';
    let brandLeadEmail = 'marcus.ng@aciesglobal.com';

    if (item.cat === 'Beverages') {
      plantName = 'Chennai Bottling Plant';
      brandLeadName = 'Pooja Iyer';
      brandLeadTitle = 'Citrus Category Manager';
      brandLeadEmail = 'pooja.iyer@aciesglobal.com';
    } else if (item.cat === 'Snacks') {
      plantName = 'Baddi Manufacturing Hub';
      brandLeadName = 'Rohan Sharma';
      brandLeadTitle = 'Plant Manager - Baddi';
      brandLeadEmail = 'rohan.sharma@aciesglobal.com';
    } else if (item.cat === 'Personal Care') {
      plantName = 'Chennai Chemical Division';
      brandLeadName = 'Amit Mehta';
      brandLeadTitle = 'Supplier Quality QA Lead';
      brandLeadEmail = 'amit.mehta@aciesglobal.com';
    }

    // SUGGESTION 1: Supply Chain & Stockout Mitigation
    if (item.lead > 20 || item.stockouts > 3) {
      const revLoss = (item.rev * 0.015 * item.stockouts).toFixed(2);
      list.push({
        action: `Qualify secondary logistics routes and local buffer partners at ${plantName} to mitigate the ${item.lead}-day lead time.`,
        impact: `Recover an estimated $${revLoss} M in stockout-related sales dilution and reduce supply volatility.`,
        owner: 'Vijay Kumar',
        title: 'APAC Logistics Head',
        email: 'vijay.kumar@aciesglobal.com',
        body: `Hi Vijay,

I am writing to address the critical logistics constraints facing "${item.name}" in the ${item.cat} segment. 

Currently, our supplier lead time stands at ${item.lead} days, which led to ${item.stockouts} stockout events this quarter at the ${plantName}. Based on our calculations, this supply friction has diluted sales by an estimated $${revLoss} M.

We need to qualify secondary logistics routes and establish safety stock buffers to protect this item. Can we review options for regional carriers and supply buffers by Friday?

Best regards,
Executive Director`
      });
    } else {
      const inventorySavings = (item.rev * 0.035).toFixed(2);
      list.push({
        action: `Tune safety stock coefficients and transition to automated replenishment triggers for ${item.name} at ${plantName}.`,
        impact: `Reduces inventory holding costs by approximately $${inventorySavings} M while maintaining 99.8% OTIF service levels.`,
        owner: 'Nisha Patel',
        title: 'Demand Planning Lead',
        email: 'nisha.patel@aciesglobal.com',
        body: `Hi Nisha,

Our high-velocity SKU "${item.name}" has demonstrated stable supply performance (lead time: ${item.lead} days, only ${item.stockouts} stockout). 

To optimize working capital, I propose tuning safety stock coefficients at the ${plantName}. Our calculations show this can release $${inventorySavings} M in locked capital with zero supply-line risk. Let's schedule a simulation run.

Best regards,
Executive Director`
      });
    }

    // SUGGESTION 2: Pricing & Promo Erosion
    if (item.promo > 0.40) {
      const promoSpend = (item.rev * item.promo * 0.25).toFixed(2);
      const targetMarginLift = (item.margin + 3.0).toFixed(1);
      list.push({
        action: `Establish a promo cap and shift trade spend from heavy discounting to brand loyalty campaigns.`,
        impact: `Recovers margin to ${targetMarginLift}% (currently ${item.margin}%) and optimizes $${promoSpend} M in promotion dilution.`,
        owner: 'Rajesh Verma',
        title: 'VP Sales',
        email: 'rajesh.verma@aciesglobal.com',
        body: `Hi Rajesh,

I am looking at the promo dependency for "${item.name}" (${item.cat}). At ${Math.round(item.promo * 100)}% discount dependency, we are spending roughly $${promoSpend} M on trade promotions, compressing our margins down to ${item.margin}%.

We need to protect our brand premium and category margins. Let's design a phased rollback of the discount caps to lift margins to ${targetMarginLift}%. Let me know when you can present a proposed outline.

Thanks,
Executive Director`
      });
    } else {
      const pricingLift = (item.rev * 0.015).toFixed(2);
      list.push({
        action: `Implement a selective list-price hike (+1.5% to +2.0%) targeting high-volume channels.`,
        impact: `Captures an estimated $${pricingLift} M in pure gross margin with minimal price-elasticity churn.`,
        owner: 'Sarah Jenkins',
        title: 'Product Formulation Scientist',
        email: 'sarah.jenkins@aciesglobal.com',
        body: `Hi Sarah,

Given the low promotional dependency of "${item.name}" (${Math.round(item.promo * 100)}%) and stable demand, we have a pricing premium window. 

I propose a +1.5% adjustment to the list price. With quarterly sales at $${item.rev} M, this is projected to return $${pricingLift} M in gross margin. Let's review the price-sensitivity analysis for this brand category.

Best regards,
Executive Director`
      });
    }

    // SUGGESTION 3: Portfolio & Lifecycle Strategy
    if (item.cx > 0.60 && item.margin < 30) {
      const safetyStockFreed = (item.rev * item.cx * 0.3).toFixed(2);
      list.push({
        action: `Initiate a SKU rationalization audit or consolidate low-margin package variants.`,
        impact: `Reduces operational complexity score from ${(item.cx).toFixed(2)} and frees $${safetyStockFreed} M in warehouse safety stock.`,
        owner: brandLeadName,
        title: brandLeadTitle,
        email: brandLeadEmail,
        body: `Hi ${brandLeadName.split(' ')[0]},

Our SKU "${item.name}" represents an operational complexity risk. It has a high complexity score of ${(item.cx).toFixed(2)} and a compressed margin of ${item.margin}%, placing it in our 'Rationalize' segment.

I suggest we initiate a variant rationalization study to consolidate this product line at the ${plantName}. Let's evaluate options to prune this SKU and unlock $${safetyStockFreed} M in working capital.

Regards,
Executive Director`
      });
    } else if (item.growth > 0.15) {
      const salesLift = (item.rev * item.growth * 1.2).toFixed(1);
      list.push({
        action: `Accelerate channel distribution and expand shelf-space allocation with key retailers.`,
        impact: `Capture up to $${salesLift} M in incremental net sales over the next fiscal year.`,
        owner: brandLeadName,
        title: brandLeadTitle,
        email: brandLeadEmail,
        body: `Hi ${brandLeadName.split(' ')[0]},

Excellent performance on "${item.name}" with a YoY growth rate of ${Math.round(item.growth * 100)}% and $${item.rev} M in sales. 

Given this momentum, I want to accelerate channel distribution expansion, specifically targeting e-commerce and premium retail channels. Please draft a shelf-space expansion plan for our next quarterly review.

Best,
Executive Director`
      });
    } else {
      let revampAction = 'Initiate a sustainable packaging revamp to capture eco-conscious consumer demand.';
      let revampImpact = 'Boosts sales velocity and category mix margin by ~1.2%';
      let revampBody = `Hi Siddharth,

For our SKU "${item.name}" (${item.cat}), we are observing stable but low growth (${Math.round(item.growth * 100)}%). 

To stimulate volume without relying on heavy discounts, I suggest exploring a sustainable eco-packaging relaunch. Please draft a preliminary cost and timeline estimate for this packaging upgrade at the ${plantName}.

Thanks,
Executive Director`;

      if (item.cat === 'Beverages' || item.cat === 'Snacks') {
        revampAction = 'Reformulate with low-sugar natural ingredients to qualify for health-wellness channels.';
        revampImpact = 'Unlocks premium listing status and lifts category mix margin by ~1.5%';
        revampBody = `Hi Dr. Elena,

For our SKU "${item.name}" (${item.cat}), we are observing slow growth (${Math.round(item.growth * 100)}%). 

To capture the health-wellness segment, I propose we reformulate the recipe to use low-sugar natural ingredients. Please estimate the product development timeline and cost factors.

Best regards,
Executive Director`;
      }

      list.push({
        action: revampAction,
        impact: revampImpact,
        owner: item.cat === 'Beverages' || item.cat === 'Snacks' ? 'Dr. Elena Rostova' : 'Siddharth Roy',
        title: item.cat === 'Beverages' || item.cat === 'Snacks' ? 'R&D Product Lead' : 'NPD Project Lead',
        email: item.cat === 'Beverages' || item.cat === 'Snacks' ? 'elena.rostova@aciesglobal.com' : 'siddharth.roy@aciesglobal.com',
        body: revampBody
      });
    }

    return list;
  };

  const recommendations = getAiRecommendations(sku);

  // Diagnostic Status
  const isHighComplexity = sku.cx >= 0.6;
  const isHighPromo = sku.promo >= 0.5;
  const isHighStockout = sku.stockouts >= 4;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-display font-extrabold text-zinc-900 dark:text-zinc-50">
                {sku.name}
              </h2>
              <span className={`text-[8.5px] uppercase font-extrabold px-2 py-0.5 rounded border ${segmentColor}`}>
                {segment} Segment
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Category: <span className="text-zinc-700 dark:text-zinc-300 font-bold">{sku.cat}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded">
            <p className="font-bold text-[8.5px] uppercase tracking-widest text-zinc-400 mb-1">QTD Revenue</p>
            <p className="text-lg font-display font-bold text-acies-yellow">${sku.rev} M</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded">
            <p className="font-bold text-[8.5px] uppercase tracking-widest text-zinc-400 mb-1">Gross Margin</p>
            <p className="text-lg font-display font-bold text-zinc-800 dark:text-white">{sku.margin}%</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded">
            <p className="font-bold text-[8.5px] uppercase tracking-widest text-zinc-400 mb-1">YoY Growth</p>
            <div className="flex items-center gap-1">
              <span className={`text-lg font-display font-bold ${sku.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {sku.growth >= 0 ? '+' : ''}{Math.round(sku.growth * 100)}%
              </span>
              {sku.growth >= 0 ? (
                <TrendingUp size={14} className="text-green-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Operational Indicators */}
        <div className="space-y-2.5">
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">Operational & Supply Chain Health</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
            
            {/* Commercial Value Index */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <Activity size={10} className="text-zinc-500" />
                  Commercial Value Score
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{sku.val.toFixed(2)}</span>
              </div>
              <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${sku.val * 100}%` }} />
              </div>
            </div>

            {/* Complexity Index */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <Zap size={10} className="text-zinc-500" />
                  Complexity Index
                </span>
                <span className={`font-bold ${isHighComplexity ? 'text-amber-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                  {sku.cx.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${isHighComplexity ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${sku.cx * 100}%` }} />
              </div>
            </div>

            {/* Lead Time */}
            <div className="flex justify-between items-center py-1.5 border-b border-black/5 dark:border-white/5">
              <span className="text-zinc-500 flex items-center gap-1">
                <Clock size={11} className="text-zinc-400" />
                Supplier Lead Time
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                {sku.lead} Days
                {sku.lead > 25 && <AlertTriangle size={11} className="text-amber-500" />}
              </span>
            </div>

            {/* Stockout Frequency */}
            <div className="flex justify-between items-center py-1.5 border-b border-black/5 dark:border-white/5">
              <span className="text-zinc-500 flex items-center gap-1">
                <ShieldAlert size={11} className="text-zinc-400" />
                Quarterly Stockouts
              </span>
              <span className={`font-bold ${isHighStockout ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                {sku.stockouts} Events
              </span>
            </div>

            {/* Promo Dependency */}
            <div className="flex justify-between items-center py-1.5 border-b border-black/5 dark:border-white/5 md:col-span-2">
              <span className="text-zinc-500 flex items-center gap-1">
                <Info size={11} className="text-zinc-400" />
                Promotional Sales Dependency
              </span>
              <span className={`font-bold ${isHighPromo ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                {Math.round(sku.promo * 100)}% of sales
              </span>
            </div>

          </div>
        </div>

        {/* AI Copilot Recommendations */}
        <div className="space-y-2">
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">AI-Assisted Tactical Action Plans</p>
          
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-sm hover:border-[#6d28d9] dark:hover:border-[#a78bfa] transition-all flex flex-col gap-1.5 shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-bold text-indigo-500 shrink-0 mt-0.5">0{index + 1}</span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-zinc-800 dark:text-zinc-100 leading-snug">{rec.action}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      <span className="opacity-70 font-bold text-[8px] uppercase tracking-wider block">Est. Business Impact</span>
                      {rec.impact}
                    </p>
                  </div>
                </div>

                <div className="pl-5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-2">
                  <div className="text-[8px] opacity-60">
                    Stakeholder: <span className="font-bold">{rec.owner}</span> ({rec.title})
                  </div>
                  <button
                    onClick={() => onRequestAction(rec.email, rec.owner, `Action Proposal: ${sku.name} Performance Improvement`, rec.body)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-white bg-[#6d28d9] dark:bg-[#a78bfa] hover:opacity-90 rounded-sm transition-all cursor-pointer border-none"
                  >
                    <Mail size={10} />
                    Request Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-black/10 dark:border-white/10 pt-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent"
          >
            Close Analysis
          </button>
        </div>

      </div>
    </div>
  );
};
