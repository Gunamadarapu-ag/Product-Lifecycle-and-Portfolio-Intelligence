import React, { useState, useEffect, useMemo } from 'react';
import { REGIONAL_DATA as GLOBAL_REGIONAL_DATA } from '../../../constants/data';
import { Percent, Landmark, ShieldAlert, Check, Globe } from 'lucide-react';
import { StagedAction } from './types';
import { TimelineRange, getFilteredRegionalData } from '../../../utils/timeframe';

interface RegionalAssortmentGridProps {
  onStageAction?: (action: StagedAction) => void;
  onSliderChange: (values: {
    densityVal: string;
    burdenVal: string;
    yieldVal: string;
    cannibalizationVal: string;
    skusDelisted: number;
    marginLift: number;
    capitalFreed: number;
    revenueAtRisk: number;
  }) => void;
  timelineRange: TimelineRange;
}

export const RegionalAssortmentGrid: React.FC<RegionalAssortmentGridProps> = ({ onStageAction, onSliderChange, timelineRange }) => {
  const REGIONAL_DATA = useMemo(() => getFilteredRegionalData(GLOBAL_REGIONAL_DATA, timelineRange), [timelineRange]);
  const [selectedCountry, setSelectedCountry] = useState<string>('Netherlands');
  const [skusDelisted, setSkusDelisted] = useState<number>(0);
  const [flippedCountries, setFlippedCountries] = useState<Record<string, boolean>>({});

  const toggleFlip = (countryName: string) => {
    setFlippedCountries(prev => ({
      ...prev,
      [countryName]: !prev[countryName]
    }));
  };

  // Find the selected region data from constants
  const currentRegion = REGIONAL_DATA.find(r => r.country === selectedCountry) || REGIONAL_DATA[6]; // default to Netherlands
  
  const baseSKUs = currentRegion.skuCount;
  const baseMargin = currentRegion.marginPct;
  const baseRevenue = currentRegion.netSalesM;

  // Max delist limit is dynamic based on regional catalog size
  const maxPrune = baseSKUs > 90 ? 30 : 15;

  // Reset slider when selected country changes
  useEffect(() => {
    setSkusDelisted(0);
  }, [selectedCountry]);

  // Formulas for projected results based on delisted items
  const marginLift = skusDelisted * (selectedCountry === 'Netherlands' ? 0.031 : 0.025);
  const projectedMargin = Math.min(42.0, baseMargin + marginLift);
  const capitalFreed = skusDelisted * 0.95; 
  const revenueAtRisk = skusDelisted * (selectedCountry === 'Netherlands' ? 0.083 : 0.065); 

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSkusDelisted(val);

    // Dynamic metrics updates for header overrides
    const simulatedDensity = `${100 - val} SKUs`;
    const simulatedBurden = `${((68 - val) / 100 * 100).toFixed(1)}%`;
    const simulatedYield = `$${(3.02 + val * 0.012).toFixed(2)} M`;
    const simulatedCannibalization = (0.62 - val * 0.009).toFixed(2);

    onSliderChange({
      densityVal: simulatedDensity,
      burdenVal: simulatedBurden,
      yieldVal: simulatedYield,
      cannibalizationVal: simulatedCannibalization,
      skusDelisted: val,
      marginLift,
      capitalFreed,
      revenueAtRisk
    });
  };

  const handleStagePricing = (countryName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStageAction) {
      onStageAction({
        id: `pricing-${countryName}-${Date.now()}`,
        type: 'pricing',
        title: `Optimize Pricing - ${countryName}`,
        details: `Realign channel margins & address leakage for ${countryName}.`,
        revenueImpact: 0.85,
        marginImpact: 0.45,
        complexityImpact: 0.5,
        spaceImpact: 0
      });
      alert(`Channel Pricing Optimization for ${countryName} staged successfully!`);
    }
  };

  const handleStageRealign = () => {
    if (onStageAction && skusDelisted > 0) {
      const absoluteRevenueImpact = -(baseRevenue * (revenueAtRisk / 100)) * 0.15;
      const absoluteMarginImpact = marginLift * baseRevenue * 0.15;
      const complexitySaved = skusDelisted * 0.4;
      const spaceFreed = skusDelisted * 12;

      onStageAction({
        id: `realign-${selectedCountry}-${Date.now()}`,
        type: 'delisting',
        title: `Prune Catalog - ${selectedCountry}`,
        details: `Delist ${skusDelisted} low-velocity SKUs to reclaim safety stock.`,
        revenueImpact: parseFloat(absoluteRevenueImpact.toFixed(2)),
        marginImpact: parseFloat(absoluteMarginImpact.toFixed(2)),
        complexityImpact: parseFloat(complexitySaved.toFixed(1)),
        spaceImpact: spaceFreed
      });
      
      alert(`Assortment Pruning Plan for ${selectedCountry} staged successfully!`);
      setSkusDelisted(0);
      onSliderChange({
        densityVal: '100 SKUs',
        burdenVal: '68.0%',
        yieldVal: '$3.02 M',
        cannibalizationVal: '0.62',
        skusDelisted: 0,
        marginLift: 0,
        capitalFreed: 0,
        revenueAtRisk: 0
      });
    }
  };

  // Get dynamic description for the optimizer panel
  const getOptimizerDescription = () => {
    if (selectedCountry === 'Netherlands') {
      return `The Netherlands holds our smallest footprint (45 SKUs) but yields the lowest gross margin (38.20%). Realign the mix to close the gap to Austria's benchmark (38.64%).`;
    }
    if (selectedCountry === 'Italy' || selectedCountry === 'Spain' || selectedCountry === 'Germany') {
      return `${selectedCountry} drives our highest sales volume but introduces massive catalog complexity. Prune the long tail to reduce supplier fragmentation and optimize margin yield.`;
    }
    return `Optimize the assortment in ${selectedCountry} to prune low-performing variants, reclaim safety stock capital, and bridge margins to the Austrian category benchmark (38.64%).`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Regional Footprints Grid (2/3 columns) */}
      <div className="lg:col-span-2 flex flex-col justify-between">
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-xs uppercase font-bold tracking-widest text-zinc-400">Regional Footprints</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Select a country card below to inspect metrics and optimize local assortments.</p>
              </div>
              <span className="text-[8px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Target Benchmark: Austria (38.64%)
              </span>
            </div>

            {/* Country Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {REGIONAL_DATA.map((row) => {
                const isSelected = selectedCountry === row.country;
                const isNetherlands = row.country === 'Netherlands';
                const isBenchmark = row.country === 'Austria';

                // Assign border and text colors based on margin health
                let performanceColor = 'border-black/5 dark:border-white/10';
                let marginTextClass = 'text-zinc-800 dark:text-zinc-200';
                if (isNetherlands) {
                  performanceColor = isSelected ? 'border-rose-500 ring-1 ring-rose-500/15' : 'border-rose-500/30 bg-rose-500/[0.01] hover:border-rose-500/60';
                  marginTextClass = 'text-rose-500';
                } else if (isBenchmark) {
                  performanceColor = isSelected ? 'border-emerald-500 ring-1 ring-emerald-500/15' : 'border-emerald-500/30 bg-emerald-500/[0.01] hover:border-emerald-500/60';
                  marginTextClass = 'text-emerald-500';
                } else if (isSelected) {
                  performanceColor = 'border-acies-yellow ring-1 ring-acies-yellow/15';
                }                const isFlipped = flippedCountries[row.country] || false;

                return (
                  <div
                    key={row.country}
                    onClick={() => setSelectedCountry(row.country)}
                    style={{ perspective: '1000px', minHeight: '155px' }}
                    className="relative w-full transition-all duration-200"
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        textAlign: 'left',
                        transition: 'transform 0.6s',
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'none'
                      }}
                    >
                      {/* Front Face */}
                      <div
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                        className={`p-3.5 border rounded-sm cursor-pointer bg-black/[0.01] dark:bg-white/[0.01] ${performanceColor}`}
                      >
                        {/* Active Selected Checkmark */}
                        {isSelected && !isFlipped && (
                          <div className="absolute top-2.5 right-12 w-3.5 h-3.5 rounded-full bg-acies-yellow flex items-center justify-center text-white text-[8px]">
                            <Check size={8} strokeWidth={3} />
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Globe size={11} className="text-zinc-400" />
                            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                              {row.country}
                            </span>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFlip(row.country);
                            }}
                            className="text-[7px] uppercase font-bold text-blue-500 hover:text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 px-1.5 py-0.5 rounded cursor-pointer border-none outline-none z-10"
                          >
                            Channels
                          </button>
                        </div>

                        <div className="space-y-1.5 font-mono text-[9.5px] text-zinc-500">
                          <div className="flex justify-between">
                            <span>Footprint:</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-300">
                              {isSelected && skusDelisted > 0 ? `${baseSKUs - skusDelisted} SKUs` : `${row.skuCount} SKUs`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Net Sales:</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-300">${row.netSalesM.toFixed(1)}M</span>
                          </div>
                          <div className="flex justify-between border-t border-black/5 dark:border-white/5 pt-1.5 mt-1">
                            <span className="font-sans font-bold">Gross Margin:</span>
                            <span className={`font-bold ${marginTextClass}`}>
                              {isSelected && skusDelisted > 0 ? `${projectedMargin.toFixed(2)}%` : `${row.marginPct.toFixed(2)}%`}
                            </span>
                          </div>
                        </div>

                        {/* Footer badge */}
                        <div className="mt-3 flex justify-between items-center text-[7.5px] uppercase font-extrabold tracking-widest">
                          <span className={`px-2 py-0.5 rounded-full ${
                            row.complexityLabel === 'High' ? 'text-rose-500 bg-rose-500/10' :
                            row.complexityLabel === 'Medium' ? 'text-amber-500 bg-amber-500/10' :
                            'text-emerald-500 bg-emerald-500/10'
                          }`}>
                            {row.complexityLabel} Complexity
                          </span>
                          {isNetherlands && !isSelected && (
                            <span className="text-rose-500 animate-pulse font-extrabold tracking-wider">Optimize</span>
                          )}
                        </div>
                      </div>

                      {/* Back Face */}
                      <div
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                        className={`p-3.5 border rounded-sm bg-zinc-50 dark:bg-zinc-950/80 ${isSelected ? 'border-acies-yellow/80 ring-1 ring-acies-yellow/15' : 'border-black/15 dark:border-white/15'}`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">{row.country} channels</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFlip(row.country);
                            }}
                            className="text-[7.5px] uppercase font-bold text-blue-500 hover:text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded cursor-pointer border-none outline-none"
                          >
                            Back
                          </button>
                        </div>

                        <div className="space-y-1 text-[7.5px] font-semibold text-zinc-500">
                          <div className="space-y-0.5">
                            <div className="flex justify-between font-mono font-bold text-[6.5px] text-zinc-400">
                              <span>Hypermarket</span>
                              <span>{row.country === 'Netherlands' ? '50%' : row.country === 'Italy' ? '60%' : '55%'}</span>
                            </div>
                            <div className="h-0.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: row.country === 'Netherlands' ? '50%' : row.country === 'Italy' ? '60%' : '55%' }} />
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex justify-between font-mono font-bold text-[6.5px] text-zinc-400">
                              <span>Convenience</span>
                              <span>{row.country === 'Netherlands' ? '30%' : row.country === 'Italy' ? '15%' : '20%'}</span>
                            </div>
                            <div className="h-0.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500" style={{ width: row.country === 'Netherlands' ? '30%' : row.country === 'Italy' ? '15%' : '20%' }} />
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex justify-between font-mono font-bold text-[6.5px] text-zinc-400">
                              <span>E-commerce</span>
                              <span>{row.country === 'Netherlands' ? '20%' : row.country === 'Italy' ? '25%' : '25%'}</span>
                            </div>
                            <div className="h-0.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: row.country === 'Netherlands' ? '20%' : row.country === 'Italy' ? '25%' : '25%' }} />
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 border-t border-black/5 dark:border-white/5 pt-1.5 flex justify-between items-center text-[7.5px] font-bold text-zinc-600 dark:text-zinc-500 font-mono">
                          <span>Comp Index: {row.country === 'Netherlands' ? '104.2' : row.country === 'Austria' ? '98.5' : '100.8'}</span>
                          {onStageAction ? (
                            <button
                              onClick={(e) => handleStagePricing(row.country, e)}
                              className="text-[7px] bg-purple-600 hover:bg-purple-800 text-white px-2 py-0.5 rounded uppercase font-extrabold tracking-wider cursor-pointer border-none outline-none z-20"
                            >
                              Stage Price Opt
                            </button>
                          ) : (
                            <span className={row.country === 'Netherlands' ? 'text-rose-500' : 'text-emerald-500'}>
                              {row.country === 'Netherlands' ? 'Freight Drag' : 'Route Clear'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Assortment Optimizer Panel (Right column) */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs uppercase font-bold tracking-widest text-zinc-400">Assortment Optimizer</h4>
            <span className="text-[7.5px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded bg-acies-yellow/15 text-acies-yellow">
              Active: {selectedCountry}
            </span>
          </div>
          
          <p className="text-[10px] text-zinc-500 leading-relaxed mb-4">
            {getOptimizerDescription()}
          </p>

          {/* Slider Control */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-[9px] font-bold text-zinc-400">
              <span>Prune Low-Velocity SKUs</span>
              <span className="text-rose-500 font-mono font-bold text-[10px]">{skusDelisted} delisted</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max={maxPrune} 
              value={skusDelisted}
              onChange={handleSliderChange}
              className="w-full accent-rose-500 cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[7.5px] text-zinc-400 font-bold">
              <span>0 SKUs ({baseMargin.toFixed(2)}%)</span>
              <span>{maxPrune} SKUs ({ (baseMargin + (maxPrune * (selectedCountry === 'Netherlands' ? 0.031 : 0.025))).toFixed(2) }%)</span>
            </div>
          </div>

          {/* Projected Indicators */}
          <div className="space-y-3">
            <h5 className="text-[8.5px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-black/5 dark:border-white/5 pb-1">
              <Check size={10} className="text-emerald-500" strokeWidth={3} />
              Projected Optimization Lift
            </h5>

            {/* Metric Row 1: Margin Convergence */}
            <div className="flex justify-between items-center text-[10px] py-0.5">
              <span className="text-zinc-500 flex items-center gap-1">
                <Percent size={9} className="text-blue-500" />
                Gross Margin Lift
              </span>
              <span className="font-bold text-blue-500 font-mono">
                +{marginLift.toFixed(2)}% ({projectedMargin.toFixed(2)}%)
              </span>
            </div>

            {/* Metric Row 2: Safety Stock Reclaimed */}
            <div className="flex justify-between items-center text-[10px] py-0.5">
              <span className="text-zinc-500 flex items-center gap-1">
                <Landmark size={9} className="text-emerald-500" />
                Freed Safety Stock
              </span>
              <span className="font-bold text-emerald-500 font-mono">
                +{capitalFreed.toFixed(1)}% Reclaimed
              </span>
            </div>

            {/* Metric Row 3: Revenue Exposure */}
            <div className="flex justify-between items-center text-[10px] py-0.5">
              <span className="text-zinc-500 flex items-center gap-1">
                <ShieldAlert size={9} className="text-rose-500" />
                Revenue at Risk
              </span>
              <span className="font-bold text-rose-500 font-mono">
                -{revenueAtRisk.toFixed(2)}% (${(baseRevenue * (revenueAtRisk / 100)).toFixed(3)}M)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex gap-2">
          <button 
            onClick={() => {
              alert(`Assortment realign draft saved for ${selectedCountry}! Pruning ${skusDelisted} low-velocity SKUs was proposed to category teams.`);
              setSkusDelisted(0);
              // Reset parent states
              onSliderChange({
                densityVal: '100 SKUs',
                burdenVal: '68.0%',
                yieldVal: '$3.02 M',
                cannibalizationVal: '0.62',
                skusDelisted: 0,
                marginLift: 0,
                capitalFreed: 0,
                revenueAtRisk: 0
              });
            }}
            disabled={skusDelisted === 0}
            className={`w-full py-1.5 rounded text-[8px] font-extrabold uppercase tracking-widest text-center transition-all border-none outline-none ${
              skusDelisted > 0 
                ? 'bg-rose-500 text-white hover:brightness-105 active:scale-95 cursor-pointer' 
                : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            Push Realign Plan
          </button>
          {onStageAction && (
            <button 
              onClick={handleStageRealign}
              disabled={skusDelisted === 0}
              className={`w-full py-1.5 rounded text-[8px] font-extrabold uppercase tracking-widest text-center transition-all border-none outline-none ${
                skusDelisted > 0 
                  ? 'bg-purple-600 text-white hover:brightness-105 active:scale-95 cursor-pointer' 
                  : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              Stage Realign Plan
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
