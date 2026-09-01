/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, TrendingUp, TrendingDown, AlertTriangle, Globe, Activity, Mail, CheckCircle, Ship 
} from 'lucide-react';

interface ForecastItem {
  region: string;
  actual: number;
  target: number;
  delta: string;
  up: boolean;
}

interface RegionalForecastModalProps {
  isOpen: boolean;
  region: ForecastItem | null;
  onClose: () => void;
  onRequestAction: (email: string, name: string, subject: string, body: string) => void;
}

export const RegionalForecastModal: React.FC<RegionalForecastModalProps> = ({
  isOpen,
  region,
  onClose,
  onRequestAction
}) => {
  if (!isOpen || !region) return null;

  const pctAchievement = (region.actual / region.target) * 100;
  
  // Dynamic metrics and insights based on region
  const getRegionalMixData = (regName: string) => {
    let categories: { name: string; sales: number; color: string }[] = [];
    let channels: { name: string; sales: number; color: string }[] = [];
    let insights: string[] = [];
    let actions: { title: string; desc: string; owner: string; ownerTitle: string; email: string; body: string }[] = [];
    let statusText = 'On Track';
    let statusColor = 'text-green-500 bg-green-500/10 border-green-500/20';

    if (regName === 'APAC') {
      statusText = 'Overperforming';
      statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      categories = [
        { name: 'Beverages', sales: 125, color: 'bg-indigo-500' },
        { name: 'Snacks', sales: 98, color: 'bg-emerald-500' },
        { name: 'Personal Care', sales: 65, color: 'bg-blue-500' },
        { name: 'Household', sales: 24, color: 'bg-amber-500' }
      ];
      channels = [
        { name: 'E-commerce', sales: 110, color: 'bg-purple-500' },
        { name: 'Supermarket', sales: 95, color: 'bg-emerald-500' },
        { name: 'Hypermarket', sales: 72, color: 'bg-blue-500' },
        { name: 'Convenience', sales: 35, color: 'bg-orange-500' }
      ];
      insights = [
        'Blockbuster expansion of Herbal Shampoo (+28% YoY) and Mango Fizz (+18% YoY) driving primary sales lift.',
        'Convenience channel underpenetrated relative to growth rate (+15% Week-over-Week).',
        'Supply chain constraint: Periodic stockouts at Baddi Manufacturing Hub due to local label supplier delays.'
      ];
      actions = [
        {
          title: 'Establish Priority Air-freight Route for Baddi Components',
          desc: 'Re-route packaging shipments to eliminate label bottlenecks and secure high-demand inventory.',
          owner: 'Vijay Kumar',
          ownerTitle: 'APAC Logistics Head',
          email: 'vijay.kumar@aciesglobal.com',
          body: `Hi Vijay,

Following our Q2 regional review of the APAC region (which is overperforming by +7.6% at $312 M), we are facing capacity bottlenecks for our high-demand SKUs. 

Specifically, Baddi manufacturing component shortages are threatening stock availability for Herbal Shampoo and Mango Fizz. 

I propose establishing a priority express-logistics buffer to bypass local label shipment delays. Let's model the cost next week.

Best regards,
Executive Director`
        },
        {
          title: 'Conform Convenience-channel Promotional Campaign Relaunch',
          desc: 'Capitalize on convenience growth velocity by scaling localized digital banners.',
          owner: 'Rajesh Verma',
          ownerTitle: 'VP Sales',
          email: 'rajesh.verma@aciesglobal.com',
          body: `Hi Rajesh,

Our convenience channel in APAC is growing at +15% WoW but remains under-allocated in promotional spend (contributing only $35 M of the $312 M actuals).

I recommend launching a localized digital promo campaign targeting urban convenience outlets to sustain this velocity. Please present a budget outline by Wednesday.

Best regards,
Executive Director`
        }
      ];
    } else if (regName === 'Americas') {
      statusText = 'Underperforming';
      statusColor = 'text-red-500 bg-red-500/10 border-red-500/20';
      categories = [
        { name: 'Beverages', sales: 70, color: 'bg-indigo-500' },
        { name: 'Snacks', sales: 68, color: 'bg-emerald-500' },
        { name: 'Personal Care', sales: 50, color: 'bg-blue-500' },
        { name: 'Household', sales: 40, color: 'bg-amber-500' }
      ];
      channels = [
        { name: 'E-commerce', sales: 62, color: 'bg-purple-500' },
        { name: 'Supermarket', sales: 78, color: 'bg-emerald-500' },
        { name: 'Hypermarket', sales: 60, color: 'bg-blue-500' },
        { name: 'Convenience', sales: 28, color: 'bg-orange-500' }
      ];
      insights = [
        'Severe margin erosion on Choco Wafers due to excess trade discount dependency (72%).',
        'Supply chain bottleneck: Fabric Softener (Vapi Hub) recorded 7 major stockouts, causing $6.2 M in lost demand.',
        'High raw material costs in packaging plastics driving down category gross margins to 32.5%.'
      ];
      actions = [
        {
          title: 'Establish a Trade Promo Ceiling on Choco Wafers',
          desc: 'Enforce a maximum discount cap of 35% to stop hypermarket margin compression.',
          owner: 'Rajesh Verma',
          ownerTitle: 'VP Sales',
          email: 'rajesh.verma@aciesglobal.com',
          body: `Hi Rajesh,

The Americas region has fallen short of target by -5.0% (actual $228 M vs target $240 M). A primary driver is margin compression in hypermarkets, particularly on Choco Wafers.

Our discount reliance stands at 72% here. We need to implement a strict trade promo ceiling of 35% and pivot to organic brand activations. Please draft a policy outline.

Regards,
Executive Director`
        },
        {
          title: 'Initiate Supplier Audit for Sourcing Plastics',
          desc: 'Audit secondary resin packaging suppliers to combat the raw material plastic inflation.',
          owner: 'Marcus Ng',
          ownerTitle: 'Global Procurement Director',
          email: 'marcus.ng@aciesglobal.com',
          body: `Hi Marcus,

Our gross margins in the Americas region have dropped to 32.5% due to rising packaging plastics costs. 

To mitigate this, I want to initiate a sourcing audit and qualify secondary resin suppliers outside of our primary vendor network. Let's schedule an RFP briefing.

Thanks,
Executive Director`
        }
      ];
    } else { // EMEA
      statusText = 'On Target';
      statusColor = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      categories = [
        { name: 'Beverages', sales: 120, color: 'bg-indigo-500' },
        { name: 'Snacks', sales: 90, color: 'bg-emerald-500' },
        { name: 'Personal Care', sales: 60, color: 'bg-blue-500' },
        { name: 'Household', sales: 41, color: 'bg-amber-500' }
      ];
      channels = [
        { name: 'E-commerce', sales: 98, color: 'bg-purple-500' },
        { name: 'Supermarket', sales: 105, color: 'bg-emerald-500' },
        { name: 'Hypermarket', sales: 78, color: 'bg-blue-500' },
        { name: 'Convenience', sales: 30, color: 'bg-orange-500' }
      ];
      insights = [
        'Stable core performance across Beverages, led by strong distribution agreements in Germany & Italy.',
        'High supplier complexity (1.20 index) is causing logistical friction at European sea-ports.',
        'Commodity price hedging successfully cushioned EMEA from raw coffee and oil price spikes.'
      ];
      actions = [
        {
          title: 'Optimize Hub Transfers and Transit Surcharges',
          desc: 'Audit sea-port freight schedules to bypass congested ports and use secondary rail hubs.',
          owner: 'Vijay Kumar',
          ownerTitle: 'APAC Logistics Head',
          email: 'vijay.kumar@aciesglobal.com',
          body: `Hi Vijay,

EMEA performance is stable (+2.0% actual $311 M), but supplier complexity is introducing container delay risks. 

I propose implementing a port-diversification protocol, routing shipments through Northern rail hubs to bypass congested docks. Please map the logistics flow and transit cost implications.

Best regards,
Executive Director`
        },
        {
          title: 'Approve Commodities Hedging Contract Roll-Forward',
          desc: 'Extend agricultural commodities swaps to lock in raw coffee and sugar inputs for Beverages.',
          owner: 'Jean-Pierre Dubois',
          ownerTitle: 'Commodities Hedging Director',
          email: 'jp.dubois@aciesglobal.com',
          body: `Hi Jean-Pierre,

Excellent work on our commodities swaps, which cushioned EMEA Beverages margin from raw coffee price inflation this quarter. 

Given market trends, I authorize rolling forward our agricultural hedging positions for another 6 months. Let's align on contract structures.

Best,
Executive Director`
        }
      ];
    }

    return { categories, channels, insights, actions, statusText, statusColor };
  };

  const { categories, channels, insights, actions, statusText, statusColor } = getRegionalMixData(region.region);
  const variance = region.actual - region.target;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-sm font-display font-extrabold text-zinc-900 dark:text-zinc-50">
                Regional Performance: {region.region}
              </h2>
              <span className={`text-[8.5px] uppercase font-extrabold px-2 py-0.5 rounded border ${statusColor}`}>
                {statusText}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Forecast vs Actual Exploration
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Core KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded">
            <p className="font-bold text-[8.5px] uppercase tracking-widest text-zinc-400 mb-1">Actual Sales</p>
            <p className="text-lg font-display font-bold text-acies-yellow">${region.actual} M</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded">
            <p className="font-bold text-[8.5px] uppercase tracking-widest text-zinc-400 mb-1">Target Sales</p>
            <p className="text-lg font-display font-bold text-zinc-800 dark:text-white">${region.target} M</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded">
            <p className="font-bold text-[8.5px] uppercase tracking-widest text-zinc-400 mb-1">Variance Achievement</p>
            <div className="flex items-center gap-1">
              <span className={`text-lg font-display font-bold ${variance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {variance >= 0 ? '+' : ''}{variance.toFixed(1)} M ({pctAchievement.toFixed(1)}%)
              </span>
              {variance >= 0 ? (
                <TrendingUp size={14} className="text-green-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Double Column Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-1">
          
          {/* Category Mix */}
          <div className="space-y-2">
            <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">Category Sales Mix</p>
            <div className="space-y-2 bg-zinc-50 dark:bg-white/5 p-3 rounded border border-black/5 dark:border-white/10">
              {categories.map(cat => {
                const totalSales = categories.reduce((sum, c) => sum + c.sales, 0);
                const pct = Math.round((cat.sales / totalSales) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                      <span>{cat.name}</span>
                      <span>${cat.sales} M ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Performance */}
          <div className="space-y-2">
            <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">Channel Performance</p>
            <div className="space-y-2 bg-zinc-50 dark:bg-white/5 p-3 rounded border border-black/5 dark:border-white/10">
              {channels.map(ch => {
                const totalSales = channels.reduce((sum, c) => sum + c.sales, 0);
                const pct = Math.round((ch.sales / totalSales) * 100);
                return (
                  <div key={ch.name} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                      <span>{ch.name}</span>
                      <span>${ch.sales} M ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${ch.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* AI Performance Diagnostics */}
        <div className="space-y-1.5">
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">AI Performance Diagnostics</p>
          <div className="bg-zinc-50 dark:bg-white/5 p-3 rounded border border-black/5 dark:border-white/10 space-y-1.5">
            {insights.map((ins, idx) => (
              <div key={idx} className="flex gap-2 text-zinc-700 dark:text-zinc-400 leading-relaxed font-normal">
                <span className="text-zinc-400 font-bold shrink-0 mt-0.5">•</span>
                <p>{ins}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Mitigation Plans */}
        <div className="space-y-2">
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-400">Tactical Mitigation Actions</p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {actions.map((act, index) => (
              <div 
                key={index} 
                className="p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-sm hover:border-[#6d28d9] dark:hover:border-[#a78bfa] transition-all flex flex-col gap-1.5 shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-bold text-indigo-500 shrink-0 mt-0.5">0{index + 1}</span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-zinc-800 dark:text-zinc-100 leading-snug">{act.title}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{act.desc}</p>
                  </div>
                </div>

                <div className="pl-5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-2">
                  <div className="text-[8px] opacity-60">
                    Stakeholder: <span className="font-bold">{act.owner}</span> ({act.ownerTitle})
                  </div>
                  <button
                    onClick={() => onRequestAction(act.email, act.owner, `Action Request: ${region.region} ${act.title}`, act.body)}
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
