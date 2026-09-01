import React, { useState } from 'react';
import { StagedAction } from './types';
import { ShieldCheck, AlertTriangle, Layers, Percent, Play, HelpCircle, ArrowRight, Check } from 'lucide-react';

interface LaunchEvaluatorProps {
  onStageAction: (action: StagedAction) => void;
}

export const LaunchEvaluator: React.FC<LaunchEvaluatorProps> = ({ onStageAction }) => {
  const [cannibalizationRisk, setCannibalizationRisk] = useState<number>(65); // % of sales stolen from core Mango Fizz 500ml
  const [priceMultiplier, setPriceMultiplier] = useState<number>(1.2); // price vs 500ml variant (e.g. 1.2x)
  const [isStaged, setIsStaged] = useState(false);

  // Constants for Mango Fizz 750ml Launch Candidate
  const launchBudget = 4.2; // $ M
  const baseLaunchVolumeRevenue = 8.4; // $ M projected gross sales

  // Pricing impact on volume (higher price = lower gross volume)
  const priceElasticity = -2.0;
  const priceOffsetRatio = (priceMultiplier - 1.0);
  const volumeMultiplier = Math.max(0.6, 1 + priceOffsetRatio * priceElasticity);
  const projectedGrossSales = baseLaunchVolumeRevenue * priceMultiplier * volumeMultiplier;

  // Accretive vs Cannibalized split
  const cannibalizedSales = projectedGrossSales * (cannibalizationRisk / 100);
  const accretiveSales = projectedGrossSales * (1 - cannibalizationRisk / 100);

  // Profit/Margin effects
  // Core variant (Mango Fizz 500ml) has 41% margin. Target 750ml has 45% margin.
  // Cannibalized sales lose 41% margin but gain 45% margin (+4% lift on that volume).
  // Accretive sales gain full 45% margin.
  const coreMargin = 0.41;
  const launchMargin = 0.45;
  
  const marginFromAccretive = accretiveSales * launchMargin;
  const marginChangeFromCannibalized = cannibalizedSales * (launchMargin - coreMargin);
  const netMarginProfitLift = marginFromAccretive + marginChangeFromCannibalized;

  // Operational impacts
  const complexityCostPoints = 1.8; // new SKU increases supplier complexity
  const spaceConsumptionPallets = -12; // occupies 12 pallet slots in warehouse (negative space freed)

  const handleStageLaunch = () => {
    onStageAction({
      id: `launch-mango-fizz-750ml-${Date.now()}`,
      type: 'launch',
      title: 'Launch Mango Fizz 750ml Variant',
      details: `Launch 750ml variant at ${priceMultiplier}x pricing. projected sales: $${projectedGrossSales.toFixed(2)} M (${(100 - cannibalizationRisk).toFixed(0)}% accretive).`,
      revenueImpact: parseFloat((accretiveSales).toFixed(2)), // net new revenue added
      marginImpact: parseFloat((netMarginProfitLift).toFixed(2)), // net margin profit gained
      complexityImpact: -complexityCostPoints, // negative because it increases complexity (not savings)
      spaceImpact: spaceConsumptionPallets // negative because it occupies space
    });
    setIsStaged(true);
    setTimeout(() => setIsStaged(false), 2000);
  };

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-5 flex flex-col mb-6">
      
      {/* Header Info */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h4 className="text-xs uppercase font-bold tracking-widest text-zinc-400">Launch Accretion & Cannibalization Evaluator</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Model market entry for pending approvals. Determine if product extensions contribute net-new sales or cannibalize existing listings.</p>
        </div>
        <span className="text-[7.5px] uppercase font-extrabold tracking-widest text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded">
          Approval Staging
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Launch Parameters */}
        <div className="space-y-4">
          <h5 className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-black/5 dark:border-white/5 pb-1">
            <Layers size={10} className="text-purple-500" />
            1. Launch Candidate Details
          </h5>

          {/* Static Details */}
          <div className="p-3 bg-black/5 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5 rounded-sm space-y-2 text-[9px] font-sans">
            <div className="flex justify-between font-bold">
              <span className="text-zinc-400">Launch SKU:</span>
              <span className="text-zinc-900 dark:text-zinc-200">Mango Fizz 750ml</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-zinc-400">Development Budget:</span>
              <span className="text-rose-500">${launchBudget.toFixed(1)} M</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-zinc-400">Target Gross Margin:</span>
              <span className="text-emerald-500">{(launchMargin * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Pricing Multiplier Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-zinc-400">
              <span>Retail Price Index (vs 500ml)</span>
              <span className="text-acies-yellow font-mono">{priceMultiplier.toFixed(1)}x Price</span>
            </div>
            <input 
              type="range" 
              min="0.8" 
              max="1.5" 
              step="0.05"
              value={priceMultiplier}
              onChange={(e) => setPriceMultiplier(parseFloat(e.target.value))}
              className="w-full accent-acies-yellow cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[7px] text-zinc-500 font-bold">
              <span>0.8x (Budget Discount)</span>
              <span>1.5x (Premium Surcharge)</span>
            </div>
          </div>

          {/* Cannibalization Risk Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-zinc-400">
              <span>Cannibalization Risk Coefficient</span>
              <span className="text-rose-500 font-mono">{cannibalizationRisk}% Stolen</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              value={cannibalizationRisk}
              onChange={(e) => setCannibalizationRisk(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[7px] text-zinc-500 font-bold">
              <span>10% (Pure Incremental demand)</span>
              <span>90% (Pure demand substitution)</span>
            </div>
          </div>
        </div>

        {/* Column 2: Accretion vs Cannibalization Demand split */}
        <div className="space-y-4">
          <h5 className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-black/5 dark:border-white/5 pb-1">
            <Percent size={10} className="text-acies-yellow" />
            2. Demand Accretion Profile
          </h5>

          {/* Visual overlapping bar chart */}
          <div className="space-y-3 font-sans">
            <div>
              <div className="flex justify-between text-[8px] font-bold text-zinc-400 mb-1">
                <span>Accretive Demand (New Market Expansion)</span>
                <span className="text-emerald-500 font-mono">${accretiveSales.toFixed(2)} M ({ (100 - cannibalizationRisk).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-black/10 dark:bg-zinc-800 h-2.5 rounded overflow-hidden">
                <div 
                  style={{ width: `${100 - cannibalizationRisk}%` }} 
                  className="bg-emerald-500 h-full rounded transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[8px] font-bold text-zinc-400 mb-1">
                <span>Cannibalized Demand (Substitution of 500ml)</span>
                <span className="text-rose-500 font-mono">${cannibalizedSales.toFixed(2)} M ({cannibalizationRisk}%)</span>
              </div>
              <div className="w-full bg-black/10 dark:bg-zinc-800 h-2.5 rounded overflow-hidden">
                <div 
                  style={{ width: `${cannibalizationRisk}%` }} 
                  className="bg-rose-500 h-full rounded transition-all duration-300"
                />
              </div>
            </div>

            <div className="p-3 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded text-[8px] leading-relaxed text-zinc-500">
              <HelpCircle size={10} className="inline mr-1 text-zinc-400" />
              Adjusting the **Price Index** shifts demand volume (elasticity effects). Accretive sales expand catalog footprint, whereas cannibalized sales substitute standard 500ml units but capture a **+4.00% gross margin premium**.
            </div>
          </div>
        </div>

        {/* Column 3: P&L Lift & Staging */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <h5 className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 border-b border-black/5 dark:border-white/5 pb-1 flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-emerald-500" />
              3. projected Financial Impact
            </h5>

            <div className="space-y-2 text-[9.5px]">
              {/* Gross Projected Sales */}
              <div className="flex justify-between items-center py-2 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm">
                <span className="text-zinc-500">Projected Gross Sales</span>
                <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                  ${projectedGrossSales.toFixed(2)} M
                </span>
              </div>

              {/* Net New Revenue Lift */}
              <div className="flex justify-between items-center py-2 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm">
                <span className="text-zinc-500">Net-New Revenue (Accretive)</span>
                <span className="font-bold font-mono text-emerald-500">
                  +${accretiveSales.toFixed(2)} M
                </span>
              </div>

              {/* Net Profit Gain */}
              <div className="flex justify-between items-center py-2.5 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm border-l-2 border-l-purple-500">
                <span className="font-bold text-zinc-700 dark:text-zinc-400">Net Margin Profit Lift</span>
                <span className="font-bold font-mono text-purple-500">
                  +${netMarginProfitLift.toFixed(2)} M
                </span>
              </div>

              {/* Sourcing Cost alert */}
              <p className="text-[7.5px] leading-relaxed text-zinc-500 italic border border-dashed border-black/10 dark:border-white/10 p-2 rounded">
                <AlertTriangle size={8} className="inline mr-1 text-amber-500 animate-bounce" />
                Sourcing new variant adds **+{complexityCostPoints} PCI complexity points** and consumes **{Math.abs(spaceConsumptionPallets)} pallets** storage footprint.
              </p>
            </div>
          </div>

          <button 
            onClick={handleStageLaunch}
            className={`w-full py-1.5 rounded text-[8px] font-extrabold uppercase tracking-widest text-center transition-all border-none outline-none mt-4 cursor-pointer ${
              isStaged
                ? 'bg-emerald-600 text-white'
                : 'bg-purple-600 text-white hover:brightness-105 active:scale-95'
            }`}
          >
            {isStaged ? '✓ SKU Launch Staged!' : 'Stage SKU Launch Action'}
          </button>
        </div>

      </div>
    </div>
  );
};
