import React, { useState } from 'react';
import { REGIONAL_DATA, SKUS } from '../../../constants/data';
import { ArrowRight, Truck, Clock, ShieldCheck, AlertTriangle, Layers, Percent, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { StagedAction } from './types';

// Geographic coordinate proxies for dynamic distance/leadtime/freight calculations
// Realistic geographical relative SVG coordinates (spread to fit the 100x80 viewBox)
const COUNTRY_COORDS: Record<string, { x: number; y: number }> = {
  'Netherlands': { x: 45.0, y: 15.0 },
  'Germany':     { x: 60.0, y: 20.0 },
  'Poland':      { x: 88.0, y: 16.0 },
  'Austria':     { x: 70.0, y: 36.0 },
  'Italy':       { x: 67.0, y: 64.0 },
  'France':      { x: 35.0, y: 40.0 },
  'Spain':       { x: 18.0, y: 60.0 }
};

const mapX = (x: number) => x;
const mapY = (y: number) => y;

interface CrossLocationTransferProps {
  onStageAction?: (action: StagedAction) => void;
}

const REGIONAL_CAPACITIES: Record<string, number> = {
  'Netherlands': 42,
  'Germany':     88,
  'Poland':      76,
  'Austria':     54,
  'Italy':       95, // Peak Overload
  'France':      68,
  'Spain':       62
};

export const CrossLocationTransfer: React.FC<CrossLocationTransferProps> = ({ onStageAction }) => {
  const [selectedSku, setSelectedSku] = useState<string>('Mango Fizz 500ml');
  const [sourceCountry, setSourceCountry] = useState<string>('Netherlands');
  const [targetCountry, setTargetCountry] = useState<string>('Austria');
  const [isTransferred, setIsTransferred] = useState<boolean>(false);

  // Drag and click selector states for SVG nodes
  const [dragStartCountry, setDragStartCountry] = useState<string | null>(null);
  const [dragCurrentCoords, setDragCurrentCoords] = useState<{ x: number; y: number } | null>(null);
  const [activeSelectionSlot, setActiveSelectionSlot] = useState<'source' | 'target'>('source');

  const handleNodeMouseDown = (country: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDragStartCountry(country);
    const coords = COUNTRY_COORDS[country];
    if (coords) {
      setDragCurrentCoords({ x: mapX(coords.x), y: mapY(coords.y) });
    }
  };

  const handleNodeMouseUp = (country: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragStartCountry) {
      if (dragStartCountry === country) {
        // Simple click selection logic using active selection slot
        if (activeSelectionSlot === 'source') {
          setSourceCountry(country);
          setActiveSelectionSlot('target'); // Auto-focus target for the next click
        } else {
          setTargetCountry(country);
        }
      } else {
        // Drag select logic
        setSourceCountry(dragStartCountry);
        setTargetCountry(country);
      }
    }
    setDragStartCountry(null);
    setDragCurrentCoords(null);
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragStartCountry) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 80;
    setDragCurrentCoords({ x, y });
  };

  const handleSvgMouseUp = () => {
    setDragStartCountry(null);
    setDragCurrentCoords(null);
  };

  // Retrieve SKU and Region details
  const skuDetails = SKUS.find(s => s.name === selectedSku) || SKUS[0];
  const sourceRegion = REGIONAL_DATA.find(r => r.country === sourceCountry) || REGIONAL_DATA[6];
  const targetRegion = REGIONAL_DATA.find(r => r.country === targetCountry) || REGIONAL_DATA[4];

  // Coordinates
  const sourceCoord = COUNTRY_COORDS[sourceCountry] || { x: 5, y: 5 };
  const targetCoord = COUNTRY_COORDS[targetCountry] || { x: 6, y: 4 };

  // Dynamic Distance Calculation
  const dx = targetCoord.x - sourceCoord.x;
  const dy = targetCoord.y - sourceCoord.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // SKU Regional Margin calculation helper (incorporates SKU base margin + category-specific regional performance offset)
  const getSkuRegionalMargin = (sku: typeof skuDetails, country: string) => {
    const category = sku.cat || 'Beverages';
    const categoryOffsets: Record<string, Record<string, number>> = {
      'Beverages': { 'Italy': 0.8, 'Spain': -0.4, 'Germany': 0.5, 'France': -0.2, 'Austria': 1.1, 'Poland': -0.6, 'Netherlands': 0.2 },
      'Snacks':    { 'Italy': -0.5, 'Spain': 0.9, 'Germany': -0.2, 'France': 0.6, 'Austria': -0.4, 'Poland': 1.2, 'Netherlands': -0.8 },
      'Personal Care': { 'Italy': 1.2, 'Spain': -0.6, 'Germany': 0.8, 'France': -0.4, 'Austria': 0.5, 'Poland': -1.0, 'Netherlands': 0.6 },
      'Dairy':     { 'Italy': -0.9, 'Spain': 0.4, 'Germany': -0.6, 'France': 1.1, 'Austria': -0.2, 'Poland': 0.5, 'Netherlands': -0.4 },
      'Household': { 'Italy': 0.5, 'Spain': -1.1, 'Germany': 0.3, 'France': -0.5, 'Austria': 0.8, 'Poland': -0.3, 'Netherlands': 0.4 },
    };
    const offset = categoryOffsets[category]?.[country] || 0;
    return parseFloat((sku.margin + offset).toFixed(2));
  };

  const sourceSkuMargin = getSkuRegionalMargin(skuDetails, sourceCountry);
  const targetSkuMargin = getSkuRegionalMargin(skuDetails, targetCountry);

  const targetCapacity = REGIONAL_CAPACITIES[targetCountry] || 50;
  const isTargetOverloaded = targetCapacity > 90;

  // Dynamic Freight Margin Penalty (farther, heavier categories, sourcing complexity, and target capacity surcharge = higher freight drag)
  const categoryFreightMultipliers: Record<string, number> = {
    'Dairy': 1.35,      // cold chain handling
    'Beverages': 1.15,  // heavy liquid weight
    'Household': 1.10,  // bulky packaging
    'Snacks': 0.90,     // light dry items
    'Personal Care': 0.95
  };
  const categoryMultiplier = categoryFreightMultipliers[skuDetails.cat] || 1.0;
  const complexityModifier = 1 + (skuDetails.cx * 0.25);
  
  const freightDrag = distance === 0 ? 0 : parseFloat((distance * 0.38 * categoryMultiplier * complexityModifier + 0.2 + (isTargetOverloaded ? 1.5 : 0)).toFixed(2));
  
  // Dynamic Transit Lead Time addition (farther, longer replenishment lead, and higher complexity = longer delay)
  const transitLeadTime = distance === 0 ? 0 : parseFloat((distance * 0.85 + (skuDetails.lead * 0.08) + (skuDetails.cx * 0.5)).toFixed(1));

  // Dynamic Route Feasibility Score (0 - 100) (reduced by distance, SKU stockouts, and promo dependency risks)
  const riskPenalty = (skuDetails.stockouts * 2.5) + (skuDetails.promo * 5);
  const feasibilityScore = distance === 0 ? 100 : Math.max(10, Math.min(98, Math.round(98 - (distance * 12) - riskPenalty)));

  // Margin Yield Difference
  const marginDelta = parseFloat((targetSkuMargin - sourceSkuMargin).toFixed(2));
  
  // Net Assortment Margin Lift
  const netMarginLift = parseFloat((marginDelta - freightDrag).toFixed(2));

  // Route Risk Classification
  const getRiskLevel = () => {
    if (distance === 0) return { label: 'Invalid Route', class: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' };
    if (feasibilityScore >= 75) return { label: 'Low Risk / High Feasibility', class: 'text-emerald-500 bg-emerald-500/10 border-emerald-600/20' };
    if (feasibilityScore >= 45) return { label: 'Medium Risk / Feasible', class: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    return { label: 'High Risk / Severe Friction', class: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
  };

  const risk = getRiskLevel();

  const handleApplyTransfer = () => {
    if (sourceCountry === targetCountry) {
      alert("Source and Target countries must be different to execute a cross-location transfer.");
      return;
    }
    setIsTransferred(true);
    alert(`Assortment Listing Transfer Committed! Shifting ${selectedSku} listing from ${sourceCountry} shelf to ${targetCountry} catalog. Logistics teams notified to establish inter-depot route (+${transitLeadTime} days transit lead time).`);
    
    // Reset transfer state after 3 seconds
    setTimeout(() => {
      setIsTransferred(false);
    }, 4000);
  };

  const handleStageReallocation = () => {
    if (!onStageAction) return;
    
    // Net complexity change is -0.1 points saved
    const complexityChange = parseFloat((0.5 * complexityModifier).toFixed(1));
    
    // Net space impact: frees up 20 pallets at the source depot!
    const spaceFreed = 20;

    onStageAction({
      id: `reallocation-${sourceCountry}-${targetCountry}-${Date.now()}`,
      type: 'reallocation',
      title: `Reallocate SKU: ${sourceCountry.substring(0,3).toUpperCase()} → ${targetCountry.substring(0,3).toUpperCase()}`,
      details: `Shift ${selectedSku} listing. Margin Lift: ${netMarginLift}%, Delay: +${transitLeadTime} days.`,
      revenueImpact: 0, // shifting listings doesn't add gross revenue
      marginImpact: parseFloat((netMarginLift * 0.15).toFixed(2)), // profit lift scaled
      complexityImpact: complexityChange,
      spaceImpact: spaceFreed
    });
    alert(`Reallocation action for ${selectedSku} successfully staged to the Assortment Plan!`);
  };

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-5 flex flex-col mb-6">
      
      {/* Header Info */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h4 className="text-xs uppercase font-bold tracking-widest text-zinc-400">Cross-Location Assortment Reallocation</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Reallocate listing allocations between geographies, balancing margin lifts against transportation friction and transit delays.</p>
        </div>
        <span className="text-[7.5px] uppercase font-extrabold tracking-widest text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded">
          Supply Chain Integrated
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step 1: Select SKU & Route */}
        <div className="space-y-4">
          <h5 className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-black/5 dark:border-white/5 pb-1">
            <Layers size={10} className="text-blue-500" />
            1. Select Variant & Route
          </h5>

          {/* SKU Dropdown */}
          <div className="space-y-1">
            <label className="text-[8px] uppercase font-bold text-zinc-400">Product Variant</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full bg-black/5 dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded px-2.5 py-1.5 text-[10px] outline-none text-zinc-800 dark:text-zinc-200"
            >
              {SKUS.map(s => (
                <option key={s.name} value={s.name}>{s.name} ({s.cat})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Source Region Card */}
            <div 
              onClick={() => setActiveSelectionSlot('source')}
              className={`group/slot relative p-2.5 rounded border transition-all cursor-pointer flex flex-col justify-between h-[55px] ${
                activeSelectionSlot === 'source'
                  ? 'bg-rose-500/10 border-rose-600/50 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                  : 'bg-black/5 dark:bg-zinc-800/40 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[8px] uppercase font-bold transition-colors ${
                  activeSelectionSlot === 'source' ? 'text-rose-500' : 'text-zinc-400 group-hover/slot:text-rose-400'
                }`}>Source (Click Map)</span>
                {activeSelectionSlot === 'source' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <div className="flex items-center justify-between mt-1 relative">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {sourceCountry}
                </span>
                
                <div className="relative w-5 h-5 flex items-center justify-center rounded hover:bg-black/15 dark:hover:bg-white/10 transition-colors">
                  <ChevronDown size={12} className="text-zinc-400" />
                  <select
                    value={sourceCountry}
                    onChange={(e) => {
                      setSourceCountry(e.target.value);
                      setActiveSelectionSlot('target');
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {REGIONAL_DATA.map(r => (
                      <option key={r.country} value={r.country}>{r.country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Target Region Card */}
            <div 
              onClick={() => setActiveSelectionSlot('target')}
              className={`group/slot relative p-2.5 rounded border transition-all cursor-pointer flex flex-col justify-between h-[55px] ${
                activeSelectionSlot === 'target'
                  ? 'bg-emerald-500/10 border-emerald-600/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                  : 'bg-black/5 dark:bg-zinc-800/40 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[8px] uppercase font-bold transition-colors ${
                  activeSelectionSlot === 'target' ? 'text-emerald-500' : 'text-zinc-400 group-hover/slot:text-emerald-400'
                }`}>Target (Click Map)</span>
                {activeSelectionSlot === 'target' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <div className="flex items-center justify-between mt-1 relative">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {targetCountry}
                </span>
                
                <div className="relative w-5 h-5 flex items-center justify-center rounded hover:bg-black/15 dark:hover:bg-white/10 transition-colors">
                  <ChevronDown size={12} className="text-zinc-400" />
                  <select
                    value={targetCountry}
                    onChange={(e) => {
                      setTargetCountry(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {REGIONAL_DATA.map(r => (
                      <option key={r.country} value={r.country}>{r.country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {sourceCountry === targetCountry && (
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[8.5px] font-bold rounded">
              Select different source and target countries to calculate logistics friction.
            </div>
          )}
        </div>

        {/* Step 2: Route Dynamics & Risk Visualizer */}
        <div className="space-y-4">
          <h5 className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-black/5 dark:border-white/5 pb-1">
            <Truck size={10} className="text-acies-yellow" />
            2. Logistics Route Friction
          </h5>

          <div className="space-y-3">
            {/* Help Guide Banner */}
            <div className="bg-black/5 dark:bg-zinc-800/40 border border-black/10 dark:border-white/10 px-2.5 py-1.5 rounded-sm text-[7.5px] font-sans font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                {activeSelectionSlot === 'source' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>Click map node to choose SOURCE warehouse</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Click map node to choose TARGET warehouse</span>
                  </>
                )}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSelectionSlot(activeSelectionSlot === 'source' ? 'target' : 'source');
                }}
                className="text-blue-500 hover:text-blue-400 bg-none border-none cursor-pointer uppercase tracking-wider text-[6.5px] font-extrabold transition-colors outline-none"
              >
                Switch to {activeSelectionSlot === 'source' ? 'Target' : 'Source'}
              </button>
            </div>

            {/* Dynamic SVG Map (Always Visible) */}
            <div className="relative w-full h-[125px] bg-slate-950/40 dark:bg-black/45 rounded-sm border border-black/10 dark:border-white/10 overflow-hidden select-none">
              {/* Capacity Surcharge Warning */}
              {sourceCountry !== targetCountry && isTargetOverloaded && (
                <div className="absolute top-2 left-2 bg-rose-500/95 text-white text-[6px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded animate-pulse z-20">
                  ⚠️ Depot Overflow Alert: Target is {targetCapacity}% utilized (+1.5% surcharge applied)
                </div>
              )}
              
              {/* Distance & CO2 labels (visible if active route) */}
              {sourceCountry !== targetCountry && (
                <div className="absolute top-2 right-2 bg-black/60 text-[6.5px] font-mono px-1.5 py-0.5 rounded text-zinc-500 flex gap-2">
                  <span>Dist: {Math.round(distance * 320)} km</span>
                  <span>CO₂: {(distance * 0.14).toFixed(2)} kg/u</span>
                </div>
              )}
              
              {/* SVG canvas */}
              <svg 
                viewBox="0 0 100 80" 
                className="w-full h-full"
                onMouseMove={handleSvgMouseMove}
                onMouseUp={handleSvgMouseUp}
                onMouseLeave={handleSvgMouseUp}
              >
                <style>{`
                  @keyframes dash {
                    to {
                      stroke-dashoffset: -20;
                    }
                  }
                  .animate-path {
                    animation: dash 5s linear infinite;
                  }
                `}</style>
                
                {/* Network background mesh links */}
                {(() => {
                  const links = [
                    ['Spain', 'France'],
                    ['France', 'Netherlands'],
                    ['France', 'Germany'],
                    ['France', 'Italy'],
                    ['Netherlands', 'Germany'],
                    ['Germany', 'Poland'],
                    ['Germany', 'Austria'],
                    ['Austria', 'Italy'],
                  ];
                  return links.map(([c1, c2], idx) => {
                    const coord1 = COUNTRY_COORDS[c1];
                    const coord2 = COUNTRY_COORDS[c2];
                    if (!coord1 || !coord2) return null;
                    return (
                      <line 
                        key={idx}
                        x1={mapX(coord1.x)} y1={mapY(coord1.y)} 
                        x2={mapX(coord2.x)} y2={mapY(coord2.y)} 
                        stroke="rgba(255,255,255,0.04)" 
                        strokeWidth="0.5" 
                      />
                    );
                  });
                })()}

                {/* Active Route Path */}
                {sourceCountry !== targetCountry && (() => {
                  const sx = mapX(sourceCoord.x);
                  const sy = mapY(sourceCoord.y);
                  const tx = mapX(targetCoord.x);
                  const ty = mapY(targetCoord.y);
                  const isUp = netMarginLift >= 0;
                  
                  return (
                    <>
                      <line 
                        x1={sx} y1={sy} x2={tx} y2={ty} 
                        stroke={isUp ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'} 
                        strokeWidth="2.5" 
                      />
                      <line 
                        x1={sx} y1={sy} x2={tx} y2={ty} 
                        stroke={isUp ? '#10b981' : '#f43f5e'} 
                        strokeWidth="1" 
                        strokeDasharray="4, 3"
                        className="animate-path"
                      />
                      <motion.circle
                        cx={sx}
                        cy={sy}
                        r="1.8"
                        fill="#facc15"
                        animate={{ cx: [sx, tx], cy: [sy, ty] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                      />
                    </>
                  );
                })()}

                {/* Drag-drawing line */}
                {dragStartCountry && dragCurrentCoords && (() => {
                  const startCoords = COUNTRY_COORDS[dragStartCountry];
                  if (!startCoords) return null;
                  return (
                    <line
                      x1={mapX(startCoords.x)}
                      y1={mapY(startCoords.y)}
                      x2={dragCurrentCoords.x}
                      y2={dragCurrentCoords.y}
                      stroke="#facc15"
                      strokeWidth="1"
                      strokeDasharray="3, 3"
                    />
                  );
                })()}

                {/* Country Node circles */}
                {Object.entries(COUNTRY_COORDS).map(([country, coords]) => {
                  const cx = mapX(coords.x);
                  const cy = mapY(coords.y);
                  const isSource = country === sourceCountry;
                  const isTarget = country === targetCountry && sourceCountry !== targetCountry;
                  
                  let nodeFill = 'rgba(255,255,255,0.15)';
                  let nodeStroke = 'rgba(255,255,255,0.2)';
                  let nodeRadius = 2.0;

                  if (isSource) {
                    nodeFill = '#ef4444';
                    nodeStroke = 'rgba(239,68,68,0.3)';
                    nodeRadius = 3.2;
                  } else if (isTarget) {
                    nodeFill = '#10b981';
                    nodeStroke = 'rgba(16,185,129,0.3)';
                    nodeRadius = 3.2;
                  }

                  return (
                    <g 
                      key={country}
                      className="cursor-pointer select-none group"
                      onMouseDown={(e) => handleNodeMouseDown(country, e)}
                      onMouseUp={(e) => handleNodeMouseUp(country, e)}
                    >
                      {/* Pulse glow circle for source/target or hover */}
                      {(isSource || isTarget) ? (
                        <circle cx={cx} cy={cy} r={nodeRadius + 2.5} fill="none" stroke={nodeStroke} strokeWidth="1" className="animate-pulse" />
                      ) : (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={nodeRadius + 2} 
                          fill="none" 
                          stroke="rgba(250,204,21,0)" 
                          strokeWidth="1" 
                          className={`transition-all ${
                            activeSelectionSlot === 'source'
                              ? 'group-hover:stroke-rose-500/30 group-hover:animate-ping'
                              : 'group-hover:stroke-emerald-500/30 group-hover:animate-ping'
                          }`} 
                        />
                      )}
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={nodeRadius} 
                        fill={nodeFill} 
                        className={`transition-colors duration-200 ${
                          activeSelectionSlot === 'source'
                            ? 'group-hover:fill-rose-500'
                            : 'group-hover:fill-emerald-500'
                        }`} 
                      />
                      <text 
                        x={cx} 
                        y={cy + 5.5} 
                        textAnchor="middle" 
                        fill={isSource ? '#ef4444' : isTarget ? '#10b981' : '#71717a'} 
                        fontSize="3.8" 
                        fontWeight="bold"
                        className="font-sans select-none pointer-events-none"
                      >
                        {country.substring(0, 2).toUpperCase()} ({REGIONAL_CAPACITIES[country]}%)
                      </text>
                    </g>
                  );
                })}
              </svg>

            </div>

            {/* Conditionally render details underneath map */}
            {sourceCountry !== targetCountry ? (
              <>
                {/* Source/Target Margin detail row */}
                <div className="flex justify-between items-center text-[8.5px] px-3 py-1.5 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-sm font-mono font-bold font-sans">
                  <div>
                    <span className="text-zinc-500 block text-[6.5px] font-sans">Source ({sourceCountry.substring(0,3).toUpperCase()})</span>
                    <span className="text-rose-500">{sourceSkuMargin.toFixed(2)}% margin</span>
                  </div>
                  <ArrowRight size={10} className="text-zinc-400" />
                  <div className="text-right">
                    <span className="text-zinc-500 block text-[6.5px] font-sans">Target ({targetCountry.substring(0,3).toUpperCase()})</span>
                    <span className="text-emerald-500">{targetSkuMargin.toFixed(2)}% margin</span>
                  </div>
                </div>

                {/* Feasibility/Risk Indicator */}
                <div className={`p-2 border rounded-sm text-center text-[9px] font-bold ${risk.class}`}>
                  {risk.label} (Feasibility Index: {feasibilityScore}/100)
                </div>

                {/* Dynamic parameters details */}
                <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold text-zinc-500">
                  <div className="p-2 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-sm flex items-center gap-2">
                    <Clock size={10} className="text-blue-500" />
                    <div>
                      <span className="text-[7px] text-zinc-400 uppercase font-bold block">Transit Lead Time</span>
                      +{transitLeadTime} Days Delay
                    </div>
                  </div>
                  
                  <div className="p-2 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-sm flex items-center gap-2">
                    <Percent size={10} className="text-rose-500" />
                    <div>
                      <span className="text-[7px] text-zinc-400 uppercase font-bold block">Freight Drag</span>
                      -{freightDrag}% margin
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-3.5 bg-black/[0.01] dark:bg-white/[0.01] border border-dashed border-black/10 dark:border-white/10 rounded-sm text-center text-[8.5px] text-zinc-500 font-semibold leading-relaxed">
                <AlertTriangle size={12} className="inline mr-1 text-rose-600 animate-bounce" />
                Click and drag between warehouse nodes (dots) or click two different nodes to configure route.
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Financial Net Impact */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <h5 className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 border-b border-black/5 dark:border-white/5 pb-1 flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-emerald-500" />
              3. Projected Reallocation Gain
            </h5>

            {sourceCountry !== targetCountry ? (
              <div className="space-y-3">
                {/* Gross Yield Diff */}
                <div className="flex justify-between items-center text-[10px] py-1 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm">
                  <span className="text-zinc-500">Gross Margin Differential</span>
                  <span className={`font-bold font-mono ${marginDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {marginDelta >= 0 ? `+${marginDelta}%` : `${marginDelta}%`}
                  </span>
                </div>

                {/* Freight Penalty */}
                <div className="flex justify-between items-center text-[10px] py-1 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm">
                  <span className="text-zinc-500">Freight & Sourcing Drag</span>
                  <span className="font-bold font-mono text-rose-500">
                    -{freightDrag}%
                  </span>
                </div>

                {/* Net Profit Gain */}
                <div className="flex justify-between items-center text-[10px] py-1.5 px-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm border-l-2 border-l-blue-500">
                  <span className="font-bold text-zinc-700 dark:text-zinc-400">Net Margin Differential Lift</span>
                  <span className={`font-bold font-mono text-xs ${netMarginLift >= 0 ? 'text-emerald-500 animate-pulse' : 'text-rose-500'}`}>
                    {netMarginLift >= 0 ? `+${netMarginLift}%` : `${netMarginLift}%`}
                  </span>
                </div>

                {/* Explanatory summary text */}
                <p className="text-[7.5px] leading-relaxed text-zinc-500 italic bg-black/[0.01] dark:bg-white/[0.01] p-2 border border-black/5 dark:border-white/5 rounded-sm">
                  {netMarginLift >= 0 ? (
                    <span>
                      <ShieldCheck size={8} className="inline mr-1 text-emerald-500" />
                      Assortment transfer yields a net profit of **{netMarginLift}%** after subtracting **{freightDrag}%** freight drag. This represents an optimized location re-alignment.
                    </span>
                  ) : (
                    <span>
                      <AlertTriangle size={8} className="inline mr-1 text-rose-500" />
                      Warning: Freight drag (**{freightDrag}%**) exceeds gross margin gains (**{marginDelta}%**). This transfer route is margin-dilutive and not recommended.
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                <AlertTriangle size={20} className="mb-2" />
                <p className="text-[9px] uppercase font-extrabold tracking-widest">Awaiting Route Input</p>
              </div>
            )}
          </div>

          {sourceCountry !== targetCountry && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={handleApplyTransfer}
                disabled={isTransferred}
                className={`py-1.5 rounded text-[8px] font-extrabold uppercase tracking-widest text-center transition-all border-none outline-none w-full ${
                  isTransferred
                    ? 'bg-emerald-600 text-white cursor-wait'
                    : netMarginLift >= 0
                      ? 'bg-blue-500 text-white hover:brightness-105 active:scale-95 cursor-pointer'
                      : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 hover:bg-rose-500 hover:text-white hover:brightness-105 active:scale-95 cursor-pointer'
                }`}
              >
                {isTransferred ? 'Transfer Sent!' : netMarginLift >= 0 ? 'Apply Reallocation' : 'Force Reallocation'}
              </button>

              <button 
                onClick={handleStageReallocation}
                className="py-1.5 rounded text-[8px] font-extrabold uppercase tracking-widest text-center transition-all border-none bg-purple-600 hover:bg-purple-700 hover:brightness-105 text-white active:scale-95 cursor-pointer outline-none w-full"
              >
                Stage Reallocation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossLocationTransfer;
