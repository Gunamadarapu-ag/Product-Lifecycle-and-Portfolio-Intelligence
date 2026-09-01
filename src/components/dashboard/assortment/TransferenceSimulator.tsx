import React, { useState } from 'react';
import { RefreshCw, Percent, ArrowRight, ShieldCheck, TrendingDown, HelpCircle, Layers, Scissors, Check, Play } from 'lucide-react';
import { StagedAction } from './types';

interface CategoryVariant {
  name: string;
  revenue: number; // M
  margin: number; // %
  growth: number; // %
  lead: number; // days
  reason: string;
  segment: 'Keep' | 'Grow' | 'Consolidate' | 'Rationalize';
  gradient: string; // packaging colors
  unitText: string;
}

const CATEGORY_ITEMS: Record<string, CategoryVariant[]> = {
  Beverages: [
    { name: 'BrandF Water', revenue: 17.03, margin: 40, growth: 12.4, lead: 5, reason: 'Hero SKU, core category profit driver.', segment: 'Keep', gradient: 'from-sky-400 via-blue-500 to-blue-700', unitText: 'Premium 1K' },
    { name: 'Green Tea RTD', revenue: 7.6, margin: 29, growth: -4, lead: 22, reason: 'Declining growth, high promo dependency (62%)', segment: 'Rationalize', gradient: 'from-emerald-400 via-green-500 to-green-700', unitText: 'RTD 330ml' },
    { name: 'Aloe Vera Drink', revenue: 9.8, margin: 34, growth: 9, lead: 18, reason: 'Moderate margin, variable demand stability.', segment: 'Grow', gradient: 'from-teal-300 via-teal-500 to-emerald-600', unitText: 'Organic 500ml' },
    { name: 'Mango Fizz 250ml', revenue: 8.4, margin: 38, growth: 12, lead: 14, reason: 'High cannibalization with 500ml variant.', segment: 'Consolidate', gradient: 'from-amber-400 via-orange-500 to-red-500', unitText: 'Can 250ml' }
  ],
  Dairy: [
    { name: 'BrandD Cheese', revenue: 11.20, margin: 39.5, growth: 6.1, lead: 5.2, reason: 'Core regional cheese listing; stable demand.', segment: 'Keep', gradient: 'from-yellow-300 via-amber-400 to-yellow-600', unitText: 'Block 250g' },
    { name: 'BrandE Yogurt (Straw)', revenue: 3.5, margin: 21, growth: -14, lead: 19, reason: 'Negative growth, severe margin leakage.', segment: 'Rationalize', gradient: 'from-pink-300 via-rose-500 to-pink-600', unitText: 'Tub 150g' },
    { name: 'BrandB Yogurt 1kg', revenue: 4.2, margin: 24, growth: -8, lead: 18, reason: 'High stockout frequency, low margin yield.', segment: 'Rationalize', gradient: 'from-indigo-400 via-indigo-700 to-purple-800', unitText: 'Bucket 1kg' },
    { name: 'BrandB Yogurt 500g', revenue: 7.2, margin: 35, growth: 2, lead: 14, reason: 'Below category average gross margin (39%).', segment: 'Consolidate', gradient: 'from-violet-400 via-purple-500 to-indigo-600', unitText: 'Tub 500g' }
  ],
  Snacks: [
    { name: 'BrandB Chips', revenue: 13.03, margin: 39.8, growth: 5.4, lead: 5.3, reason: 'High-performing snack hero; stable volume.', segment: 'Keep', gradient: 'from-red-400 via-red-700 to-amber-700', unitText: 'Bag 150g' },
    { name: 'Choco Wafers', revenue: 4.4, margin: 22, growth: -12, lead: 28, reason: 'Long lead time, heavy promotional dependency.', segment: 'Rationalize', gradient: 'from-amber-600 via-yellow-900 to-amber-950', unitText: 'Box 200g' },
    { name: 'BrandD Chocolate 250g', revenue: 5.2, margin: 31, growth: -2, lead: 19, reason: 'High demand volatility, seasonal fluctuations.', segment: 'Rationalize', gradient: 'from-amber-800 via-amber-900 to-zinc-900', unitText: 'Bar 250g' },
    { name: 'Masala Puffs', revenue: 8.8, margin: 38, growth: 11, lead: 14, reason: 'High promotional margin erosion (14.88).', segment: 'Grow', gradient: 'from-orange-400 via-amber-500 to-yellow-600', unitText: 'Pouch 80g' }
  ]
};

const HERO_SUBSTITUTES: Record<string, { name: string; margin: number }> = {
  Beverages: { name: 'BrandF Water', margin: 40 },
  Dairy: { name: 'BrandD Cheese', margin: 39.5 },
  Snacks: { name: 'BrandB Chips', margin: 39.8 }
};

interface TransferenceSimulatorProps {
  onStageAction?: (action: StagedAction) => void;
}

export const TransferenceSimulator: React.FC<TransferenceSimulatorProps> = ({ onStageAction }) => {
  const [selectedCategory, setSelectedCategory] = useState<'Beverages' | 'Dairy' | 'Snacks'>('Dairy');
  const [prunedSkus, setPrunedSkus] = useState<Record<string, boolean>>({});
  const [transferencePct, setTransferencePct] = useState<number>(55); // default CPG standard transfer rate

  const skus = CATEGORY_ITEMS[selectedCategory];
  const heroSubstitute = HERO_SUBSTITUTES[selectedCategory];

  const handleCategoryChange = (cat: 'Beverages' | 'Dairy' | 'Snacks') => {
    setSelectedCategory(cat);
  };

  const togglePrune = (skuName: string) => {
    // Hero cannot be pruned
    if (skuName === heroSubstitute.name) {
      alert(`"${skuName}" is a category Hero SKU. Delisting hero lines is locked to prevent severe baseline category collapse.`);
      return;
    }
    setPrunedSkus(prev => ({
      ...prev,
      [skuName]: !prev[skuName]
    }));
  };

  // Calculate cumulative impact of all delisted SKUs in the current category
  const activePrunedItems = skus.filter(s => prunedSkus[s.name]);
  const totalRevenueDelisted = activePrunedItems.reduce((sum, s) => sum + s.revenue, 0);
  
  // Transferred sales to hero
  const revenueTransferred = totalRevenueDelisted * (transferencePct / 100);
  const revenueLostToCompetitors = totalRevenueDelisted * (1 - transferencePct / 100);

  // Margin lift calculation
  // Delisted items have lower margins. Transferred revenue moves to the Hero SKU (higher margin).
  const netMarginDeltaLift = activePrunedItems.reduce((sum, s) => {
    const marginDiff = heroSubstitute.margin - s.margin;
    const itemTransferred = s.revenue * (transferencePct / 100);
    return sum + (itemTransferred * (marginDiff / 100));
  }, 0);

  // Complexity reduction points saved
  const complexityScoreSaved = activePrunedItems.reduce((sum, s) => sum + (s.lead * 0.5), 0).toFixed(1);

  const handleStageDelisting = () => {
    if (!onStageAction) return;
    const revenueImpactValue = -revenueLostToCompetitors;
    const marginImpactValue = netMarginDeltaLift;
    const complexityImpactValue = parseFloat(complexityScoreSaved);
    const spaceImpactValue = activePrunedItems.length * 8;

    onStageAction({
      id: `delisting-${selectedCategory}-${Date.now()}`,
      type: 'delisting',
      title: `Prune ${selectedCategory} Shelf`,
      details: `Delisted ${activePrunedItems.map(s => s.name).join(', ')}.`,
      revenueImpact: parseFloat(revenueImpactValue.toFixed(2)),
      marginImpact: parseFloat(marginImpactValue.toFixed(2)),
      complexityImpact: complexityImpactValue,
      spaceImpact: spaceImpactValue
    });
    alert(`Category delisting action for ${selectedCategory} staged to the Assortment Plan!`);
    setPrunedSkus({});
  };

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-5 flex flex-col mb-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h4 className="text-xs uppercase font-bold tracking-widest text-zinc-400">Interactive Shelf & Demand Transference</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Click items on the virtual retail shelf below to delist/prune them and simulate customer substitution flows.</p>
        </div>

        {/* Category Buttons */}
        <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/5 self-start">
          {(['Beverages', 'Dairy', 'Snacks'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1 text-[8.5px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-zinc-800 text-acies-yellow shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              {cat} Shelf
            </button>
          ))}
        </div>
      </div>

      {/* Main Simulator Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left/Middle: Virtual Retail Shelf Display (2/3 columns) */}
        <div className="xl:col-span-2 flex flex-col justify-between">
          <div className="relative p-6 bg-slate-50/50 dark:bg-zinc-950/20 border border-black/5 dark:border-white/5 rounded-sm flex flex-col justify-end min-h-[220px]">
            
            {/* Shelf Items */}
            <div className="flex justify-around items-end gap-3 px-4 z-10 pb-1">
              {skus.map((item) => {
                const isPruned = prunedSkus[item.name];
                const isHero = item.name === heroSubstitute.name;
                
                return (
                  <div
                    key={item.name}
                    onClick={() => togglePrune(item.name)}
                    className={`group relative flex flex-col items-center transition-all duration-300 transform cursor-pointer w-28 text-center select-none ${
                      isPruned 
                        ? 'opacity-40 scale-95 translate-y-1' 
                        : 'hover:-translate-y-3'
                    }`}
                  >
                    {/* Floating Segment Indicator */}
                    <span className={`absolute -top-6 px-1.5 py-0.5 text-[6.5px] font-bold uppercase tracking-widest rounded-full border shadow-sm ${
                      item.segment === 'Keep' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' :
                      item.segment === 'Grow' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' :
                      item.segment === 'Consolidate' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' :
                      'text-rose-500 border-rose-500/20 bg-rose-500/5'
                    }`}>
                      {item.segment}
                    </span>

                    {/* Packaging Mockup representation */}
                    <div className={`w-14 h-24 rounded-t-lg rounded-b-md shadow-md bg-gradient-to-b ${item.gradient} transition-all duration-300 relative flex flex-col justify-between p-1.5 border border-white/10 ${
                      isPruned ? 'border-dashed border-rose-500/80 shadow-none' : 'group-hover:shadow-glow'
                    }`}>
                      {/* Brand Label Graphic */}
                      <div className="w-full h-1/2 bg-white/95 dark:bg-zinc-900/95 rounded p-1 flex flex-col justify-center items-center">
                        <span className="text-[6.5px] font-bold truncate leading-none text-zinc-800 dark:text-zinc-200">
                          {item.name.split(' ')[0]}
                        </span>
                        <span className="text-[5px] font-extrabold uppercase tracking-widest text-zinc-400 mt-0.5 leading-none">
                          {item.unitText}
                        </span>
                      </div>

                      {/* Transferred Flow Arrow Overlay (Visual Interaction) */}
                      {isPruned && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-t-lg rounded-b-md text-white text-[7.5px] font-bold uppercase tracking-widest">
                          Delisted
                        </div>
                      )}

                      {/* Price/Sales indicator */}
                      <div className="text-right leading-none">
                        <span className="text-[8px] font-extrabold text-white/90 font-mono">
                          ${item.revenue}M
                        </span>
                      </div>
                    </div>

                    {/* Product Footer on shelf */}
                    <div className="mt-2">
                      <p className="text-[8.5px] font-bold text-zinc-700 dark:text-zinc-400 truncate max-w-[100px]">
                        {item.name}
                      </p>
                      <p className="text-[7.5px] font-bold font-mono text-zinc-400">
                        {item.margin}% margin
                      </p>
                    </div>

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full mb-8 w-44 bg-acies-gray text-white text-[8px] p-2.5 shadow-2xl border border-white/10 z-50 pointer-events-none rounded-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity text-left">
                      <p className="font-extrabold text-acies-yellow mb-1">{item.name}</p>
                      <p className="opacity-70">{item.reason}</p>
                      {isHero && (
                        <p className="text-emerald-400 font-extrabold mt-1">★ Category HERO (Cannot delist)</p>
                      )}
                      {!isHero && (
                        <p className="text-rose-400 font-bold mt-1">✂ Click to delist variant</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3D Styled Wood Shelf */}
            <div className="h-3 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 rounded-full shadow-lg border-t border-amber-600/30 w-full mt-2 relative">
              <div className="absolute inset-x-0 -bottom-1 h-1 bg-black/25 blur-sm" />
            </div>

            {/* Transferred Sales Flow Indicator overlay */}
            {revenueTransferred > 0 && (
              <div className="absolute top-2 left-6 right-6 flex justify-center items-center bg-emerald-500/10 border border-emerald-500/20 py-1 px-3 rounded-full text-[8.5px] font-bold text-emerald-500 animate-fadeIn select-none z-30">
                <Check size={10} className="mr-1 shrink-0" />
                <span>
                  Delisted ${totalRevenueDelisted.toFixed(1)} M: **{transferencePct}%** (${revenueTransferred.toFixed(1)} M) transferred to **{heroSubstitute.name}**
                </span>
              </div>
            )}
          </div>

          {/* Transference slider buffer */}
          <div className="mt-4 p-4 border border-black/5 dark:border-white/5 rounded-sm bg-black/[0.01] dark:bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-1.5">
                <span>Category Transference Rate</span>
                <span className="text-acies-yellow font-mono">{transferencePct}% customer transfer</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={transferencePct}
                onChange={(e) => setTransferencePct(parseInt(e.target.value, 10))}
                className="w-full accent-acies-yellow cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[7px] text-zinc-500 font-bold mt-1">
                <span>0% (Competitor eats all sales)</span>
                <span>100% (Absolute brand loyalty)</span>
              </div>
            </div>
            <div className="sm:w-44 text-[8.5px] text-zinc-500 leading-normal border-l border-black/10 dark:border-white/10 pl-3">
              <HelpCircle size={10} className="inline mr-1 text-zinc-400" />
              Adjust to model market substitution strength. Industry standard transfer rates are around **45% - 60%**.
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Net Category Impact */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <h5 className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 border-b border-black/5 dark:border-white/5 pb-1 flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-emerald-500" />
              Net Category P&L Impact
            </h5>

            {/* Metric Box: Total revenue pruned */}
            <div className="flex justify-between items-center py-2.5 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm text-[10px]">
              <span className="text-zinc-500 flex items-center gap-1">
                <Scissors size={9} className="text-rose-500" />
                Gross Revenue Pruned
              </span>
              <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                ${totalRevenueDelisted.toFixed(1)} M
              </span>
            </div>

            {/* Metric Box: Permanent revenue lost */}
            <div className="flex justify-between items-center py-2.5 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm text-[10px]">
              <span className="text-zinc-500 flex items-center gap-1">
                <TrendingDown size={9} className="text-rose-500" />
                Permanent Revenue Loss
              </span>
              <span className="font-bold font-mono text-rose-500">
                -${revenueLostToCompetitors.toFixed(1)} M (-{(100 - transferencePct)}%)
              </span>
            </div>

            {/* Metric Box: Margin Lift recaptured */}
            <div className="flex justify-between items-center py-2.5 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm text-[10px]">
              <span className="text-zinc-500 flex items-center gap-1">
                <Percent size={9} className="text-emerald-500" />
                Recaptured Substitution Margin
              </span>
              <span className={`font-bold font-mono ${netMarginDeltaLift > 0 ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {netMarginDeltaLift > 0 ? `+$${netMarginDeltaLift.toFixed(2)} M` : '$0.00 M'}
              </span>
            </div>

            {/* Metric Box: Supply Chain Complexity Freed */}
            <div className="flex justify-between items-center py-2.5 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm text-[10px]">
              <span className="text-zinc-500 flex items-center gap-1">
                <Layers size={9} className="text-blue-500" />
                Saved Sourcing Overhead
              </span>
              <span className={`font-bold font-mono ${parseFloat(complexityScoreSaved) > 0 ? 'text-blue-500' : 'text-zinc-500'}`}>
                {parseFloat(complexityScoreSaved) > 0 ? `+${complexityScoreSaved} points` : '0 points'}
              </span>
            </div>

            {/* Interactive feedback narrative box */}
            <div className="bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 p-3 rounded-sm leading-relaxed text-[8.5px] text-zinc-500">
              {activePrunedItems.length > 0 ? (
                <div>
                  <span className="font-bold uppercase text-zinc-400 block mb-1">Delist Scenario Summary:</span>
                  Delisting **{activePrunedItems.length}** item(s) from the **{selectedCategory}** shelf risks **${revenueLostToCompetitors.toFixed(1)} M** of top-line sales, but redirects **${revenueTransferred.toFixed(1)} M** to **{heroSubstitute.name}** (**{heroSubstitute.margin}%** margin). This substitution yields a net margin lift of **${netMarginDeltaLift.toFixed(2)} M** and frees up manufacturing line overheads.
                </div>
              ) : (
                <div className="italic text-center py-2 text-zinc-400">
                  Click on one or more products (e.g. Green Tea RTD or Strawberry Yogurt) on the shelf above to simulate delisting impacts.
                </div>
              )}
            </div>
          </div>

          {activePrunedItems.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button 
                onClick={() => {
                  alert(`Assortment delisting simulation logged! Category delisting plan for ${activePrunedItems.length} SKUs sent to FP&A and Procurement teams.`);
                  setPrunedSkus({});
                }}
                className="w-full bg-rose-500 text-white hover:brightness-105 active:scale-95 transition-all py-1.5 rounded text-[8px] font-extrabold uppercase tracking-widest text-center cursor-pointer border-none outline-none"
              >
                Commit Delisting Plan
              </button>
              <button 
                onClick={handleStageDelisting}
                className="w-full bg-purple-600 text-white hover:brightness-105 active:scale-95 transition-all py-1.5 rounded text-[8px] font-extrabold uppercase tracking-widest text-center cursor-pointer border-none outline-none"
              >
                Stage Delisting Plan
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
