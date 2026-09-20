/**
 * Competitor pricing and share comparison for a selected SKU.
 *
 * Extracted from the original 3,982-line SignalsBoard.tsx.
 */
import React, { useState } from 'react';
import { TrendingUp, X, Sparkles } from 'lucide-react';
import { ModalShell } from '../../common/Modal';

export interface CompetitiveIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  intelIdx: number;
}

export const CompetitiveIntelligenceModal: React.FC<CompetitiveIntelligenceModalProps> = ({
  isOpen,
  onClose,
  intelIdx
}) => {
  if (!isOpen) return null;

  const [activeModalTab, setActiveModalTab] = useState<'comparison' | 'projection'>('comparison');

  const intelData = [
    {
      title: 'Rival Pricing Cut',
      category: 'Snacks',
      competitorName: 'Competitor B (Rival Wafers)',
      ourProduct: 'BrandC Cookies (Snacks)',
      summary: 'Competitor wafers price dropped by 10% in EU supermarkets, driving volume growth away from our mid-tier cookie lines.',
      metrics: [
        { param: 'Retail Pricing', rival: '€1.80', ours: '€2.00', winner: 'rival', note: 'Rival is 10% cheaper' },
        { param: 'Monthly Sales Growth', rival: '+24% YoY', ours: '+2% YoY', winner: 'rival', note: 'Rival volume surge' },
        { param: 'Customer Rating', rival: '4.3 / 5.0', ours: '4.5 / 5.0', winner: 'ours', note: 'Our quality is preferred' },
        { param: 'Distribution Coverage', rival: '85%', ours: '78%', winner: 'rival', note: 'Rival has better retail penetration' }
      ],
      aiRecommendation: 'Trigger a cross-category bundle campaign (e.g. BrandD Yogurt + BrandC Cookies at €2.50) to protect basket share. Avoid direct margin degradation via a price match; instead, deploy localized supermarket end-cap displays to raise distribution visibility to 85%.'
    },
    {
      title: 'Competitor Launch',
      category: 'Beverages',
      competitorName: 'GreenLife Soy (Rival)',
      ourProduct: 'BrandA Premium Energy (Beverages)',
      summary: 'GreenLife launched a premium Organic Soy Drink in APAC with aggressive sustainability-themed marketing.',
      metrics: [
        { param: 'Retail Pricing', rival: '$2.80', ours: '$2.50', winner: 'ours', note: 'Our product is more affordable' },
        { param: 'Customer Rating', rival: '4.7 / 5.0', ours: '4.1 / 5.0', winner: 'rival', note: 'Rival has high quality perception' },
        { param: 'Organic Certified', rival: 'Yes', ours: 'No', winner: 'rival', note: 'Rival targets eco-conscious niche' },
        { param: 'Distribution Coverage', rival: '40%', ours: '85%', winner: 'ours', note: 'We have massive distribution advantage' }
      ],
      aiRecommendation: 'Formulate an organic-certified brand line extension for BrandA within 90 days. Leverage our existing 85% distribution footprint to place it on shelves immediately, preempting the competitor before they can expand their retail network.'
    },
    {
      title: 'Distribution Surge',
      category: 'Personal Care',
      competitorName: 'GlowHerb Brands',
      ourProduct: 'BrandE Organic Shampoo (Personal Care)',
      summary: 'Rival brand GlowHerb secured 80% shelf targets in West India supermarkets, gaining high visibility.',
      metrics: [
        { param: 'Retail Pricing', rival: '$120', ours: '$150', winner: 'rival', note: 'Rival targets mass market pricing' },
        { param: 'Customer Rating', rival: '4.0 / 5.0', ours: '4.4 / 5.0', winner: 'ours', note: 'Our formula is rated significantly higher' },
        { param: 'Distribution Coverage', rival: '80%', ours: '55%', winner: 'rival', note: 'Rival has superior retail reach' },
        { param: 'Supermarket Shelf Visibility', rival: '90% (Premium End-cap)', ours: '40% (Bottom shelf)', winner: 'rival', note: 'Rival purchased premium placements' }
      ],
      aiRecommendation: 'Restructure channel margins for West India distributors to incentivize retail placement. Secure co-marketing contracts for eye-level shelf placements in top 50 high-volume grocery locations in Gujarat and Maharashtra.'
    }
  ];

  const forecastData = [
    {
      title: 'Post-AI Projected Improvements',
      ourProduct: 'BrandC Cookies (Snacks)',
      implementation: 'Co-category bundle (BrandD Yogurt + BrandC Cookies at €2.50) & end-cap displays.',
      comparisons: [
        { metric: 'Monthly Sales Growth', before: '+2% YoY', after: '+18% YoY', delta: '+16.0% Growth', status: 'better' },
        { metric: 'Distribution Coverage', before: '78%', after: '85%', delta: '+7.0% Coverage', status: 'better' },
        { metric: 'Gross Margin Rate', before: '42%', after: '40%', delta: '-2.0% (Stable)', status: 'neutral' },
        { metric: 'Supermarket Visibility', before: 'Bottom Shelf', after: 'Premium End-cap', delta: 'Prominent Shift', status: 'better' }
      ]
    },
    {
      title: 'Post-AI Projected Improvements',
      ourProduct: 'BrandA Premium Energy (Beverages)',
      implementation: 'Launch BrandA Organic extension on 85% distribution footprint within 90 days.',
      comparisons: [
        { metric: 'Organic Certified Status', before: 'Non-Organic', after: 'USDA Organic', delta: 'New Segment Entry', status: 'better' },
        { metric: 'Eco-conscious Rating', before: '4.1 / 5.0', after: '4.7 / 5.0', delta: '+0.6 Quality Rating', status: 'better' },
        { metric: 'Distribution Coverage', before: '85% (Unused Eco)', after: '85% (Eco Placed)', delta: 'Instant Placement', status: 'better' },
        { metric: 'Monthly Revenue Growth', before: '+5% YoY', after: '+22% YoY', delta: '+17.0% Growth', status: 'better' }
      ]
    },
    {
      title: 'Post-AI Projected Improvements',
      ourProduct: 'BrandE Organic Shampoo (Personal Care)',
      implementation: 'Restructure channel margins + co-marketing shelf contracts for top 50 outlets.',
      comparisons: [
        { metric: 'Distribution Coverage', before: '55%', after: '82%', delta: '+27.0% Coverage', status: 'better' },
        { metric: 'Shelf Visibility Placement', before: 'Bottom Shelf', after: 'Eye-level End-cap', delta: 'Premium Shelf Placement', status: 'better' },
        { metric: 'Monthly Sales Volume', before: '12,000 units', after: '28,000 units', delta: '+16,000 units', status: 'better' },
        { metric: 'Regional Category Share', before: '14%', after: '29%', delta: '+15.0% Share', status: 'better' }
      ]
    }
  ];

  const data = intelData[intelIdx] || intelData[0];
  const forecast = forecastData[intelIdx] || forecastData[0];

  return (
    <ModalShell isOpen onClose={onClose} layer="panel" className="flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-5 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-3">
          <div className="flex items-center gap-2 text-[#6d28d9] dark:text-[#a78bfa]">
            <TrendingUp size={18} />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">Competitive Intelligence Analysis</span>
              <h3 className="text-[15px] font-display font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                {data.title} ({data.category})
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Overview Details */}
        <div className="space-y-1.5 p-3.5 rounded bg-zinc-50 dark:bg-zinc-800 border border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-300">
          <p className="text-[10.5px] leading-relaxed">
            <strong>Market Intel:</strong> {data.summary}
          </p>
        </div>
        {activeModalTab === 'comparison' && (
          <div className="space-y-5 animate-fade-in">
            {/* Head-to-Head Comparison Table */}
            <div className="space-y-2.5">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Metric Performance Breakdown
              </span>
              <div className="border border-black/10 dark:border-white/10 rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider text-[8px] border-b border-black/10 dark:border-white/10">
                      <th className="p-2.5 font-bold">Parameter</th>
                      <th className="p-2.5 font-bold text-[#ef4444] dark:text-red-400">{data.competitorName}</th>
                      <th className="p-2.5 font-bold text-[#10b981] dark:text-emerald-400">{data.ourProduct}</th>
                      <th className="p-2.5 font-bold">Winner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {data.metrics.map((m, idx) => {
                      const isRivalWinner = m.winner === 'rival';
                      const winnerLabel = isRivalWinner ? 'Competitor' : 'Us';
                      const winnerCol = isRivalWinner ? 'text-red-500 bg-red-500/5 dark:bg-red-500/10' : 'text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10';

                      return (
                        <tr key={idx} className="hover:bg-black/[0.01] dark:hover:bg-white/2 transition-colors">
                          <td className="p-2.5 font-semibold text-zinc-700 dark:text-zinc-300">{m.param}</td>
                          <td className={`p-2.5 font-bold ${isRivalWinner ? 'text-red-500' : 'text-zinc-500'}`}>{m.rival}</td>
                          <td className={`p-2.5 font-bold ${!isRivalWinner ? 'text-emerald-500' : 'text-zinc-500'}`}>{m.ours}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-sm font-bold text-[8px] uppercase tracking-wider ${winnerCol}`}>
                              {winnerLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Recommendations Banner */}
            <div className="space-y-2.5 p-4 rounded bg-[#5850ec]/5 border border-[#5850ec]/15">
              <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-100">
                <Sparkles size={14} className="text-[#5850ec] dark:text-indigo-400 animate-pulse" />
                <h5 className="font-bold uppercase tracking-wider text-[10.5px]">AI Recommendation: Optimize Our Product</h5>
              </div>
              <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed pl-5 relative">
                <span className="absolute left-0 top-0 text-[#6d28d9] dark:text-[#a78bfa] font-bold">💡</span>
                {data.aiRecommendation}
              </p>
              <div className="pl-5 pt-1.5">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('projection')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5850ec] hover:bg-[#4f46e5] text-white text-[9px] font-extrabold uppercase tracking-widest rounded-sm transition-all cursor-pointer border-none shadow-sm shadow-indigo-500/20"
                >
                  <Sparkles size={10} className="animate-pulse" />
                  Simulate Improvement with AI Solution
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Simulation Projections */}
        {activeModalTab === 'projection' && (
          <div className="space-y-5 animate-fade-in">
            {/* Implementation Strategy */}
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 p-3.5 rounded">
              <span className="text-[8px] font-extrabold text-[#10b981] dark:text-[#a78bfa] uppercase tracking-widest block">Proposed Optimization Strategy</span>
              <p className="text-[10.5px] font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                {forecast.implementation}
              </p>
            </div>

            {/* Before vs After Projections Table */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600 block">
                Simulated Metric Improvements (Before vs After)
              </span>
              <div className="border border-black/10 dark:border-white/10 rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider text-[8px] border-b border-black/10 dark:border-white/10">
                      <th className="p-2.5 font-bold">Metric Parameter</th>
                      <th className="p-2.5 font-bold text-zinc-500">Current (Before)</th>
                      <th className="p-2.5 font-bold text-[#10b981] dark:text-emerald-500">Simulated (After)</th>
                      <th className="p-2.5 font-bold text-right">Projected Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {forecast.comparisons.map((item, idx) => {
                      const isNeutral = item.status === 'neutral';
                      return (
                        <tr key={idx} className="hover:bg-black/[0.01] dark:hover:bg-white/2 transition-colors">
                          <td className="p-2.5 font-semibold text-zinc-700 dark:text-zinc-300">{item.metric}</td>
                          <td className="p-2.5 font-mono text-zinc-500">{item.before}</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-500">{item.after}</td>
                          <td className={`p-2.5 font-mono font-extrabold text-right ${isNeutral ? 'text-zinc-400' : 'text-[#10b981]'}`}>
                            {item.delta}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Explainer Note */}
            <p className="text-[9px] text-zinc-400 dark:text-zinc-600 leading-normal italic">
              *Projections are generated via our AI Simulation Engine using dynamic consumer elasticity modeling and historical supermarket lift values.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-black/15 dark:border-white/15 pt-3.5">
          <span className="text-[9px] text-zinc-500 dark:text-zinc-600 font-mono font-bold uppercase">Competitor Audit Log</span>
          <div className="flex items-center gap-2">
            {activeModalTab === 'projection' && (
              <button 
                type="button"
                onClick={() => setActiveModalTab('comparison')}
                className="px-3.5 py-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 text-[9px] font-extrabold uppercase tracking-widest rounded-sm border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer"
              >
                ← Back to Comparison
              </button>
            )}
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-acies-gray hover:bg-acies-yellow hover:text-acies-gray text-white text-[9px] font-extrabold uppercase tracking-widest rounded-sm transition-all cursor-pointer border-none"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>

      </div>
    </ModalShell>
  );
};
