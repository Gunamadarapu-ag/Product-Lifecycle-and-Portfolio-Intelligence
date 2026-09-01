import React, { useState } from 'react';
import { ArrowLeft, Info, RefreshCw, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { getChartTheme } from '../../../utils/chartTheme';

interface ForecastAccuracySimulatorProps {
  isDarkMode: boolean;
  onClose: () => void;
}

export const ForecastAccuracySimulator: React.FC<ForecastAccuracySimulatorProps> = ({
  isDarkMode,
  onClose
}) => {
  // Sliders State
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(71);
  const [aiTargetAccuracy, setAiTargetAccuracy] = useState<number>(88);
  const [inventoryAtRisk, setInventoryAtRisk] = useState<number>(1.4); // in $ Millions
  const [avgMargin, setAvgMargin] = useState<number>(34); // in %

  // Calculations
  const accuracyGain = Math.max(0, aiTargetAccuracy - currentAccuracy);
  
  // Overstock Reduction matches the screenshot (default: 30% for 71% -> 88%)
  // Formula calibrated to give 30% for default values (17 * 1.765 = 30%)
  const overstockReduction = Math.max(0, Math.min(90, Math.round(accuracyGain * 1.765)));
  
  // Margin Recovery matches the screenshot (default: $0.41M for $1.4M inventory)
  // Calibrated using a multiplier to match the mockup's business logic
  const marginRecovery = inventoryAtRisk * (overstockReduction / 100) * (avgMargin / 100) * 2.85;

  // Base inventory data for the year (in units) representing the peaks/dips in the mockup
  const baseData = [
    { month: 'Jul', current: 280, optimal: 310 },
    { month: 'Aug', current: 310, optimal: 295 },
    { month: 'Sep', current: 390, optimal: 345 },
    { month: 'Oct', current: 320, optimal: 280 },
    { month: 'Nov', current: 460, optimal: 420 },
    { month: 'Dec', current: 370, optimal: 375 },
    { month: 'Jan', current: 290, optimal: 300 },
    { month: 'Feb', current: 410, optimal: 460 },
    { month: 'Mar', current: 300, optimal: 340 },
    { month: 'Apr', current: 340, optimal: 370 },
    { month: 'May', current: 410, optimal: 415 },
    { month: 'Jun', current: 420, optimal: 390 },
  ];

  // Dynamic Theme Colors
  const { gridStroke, tickColor, tooltipBg, tooltipBorder, tooltipText } = getChartTheme(isDarkMode);

  // Dynamic chart data where the green AI line and savings area respond to sliders
  const chartData = baseData.map((d) => {
    const accuracyDelta = (aiTargetAccuracy - 50) / 50; // normalized weight (0 to 1)
    
    // AI model gets closer to optimal demand as target accuracy increases
    const aiVal = Math.round(d.current - (d.current - d.optimal) * accuracyDelta);
    
    // The savings zone area lies between the current model line and the AI model line
    const minVal = Math.min(d.current, aiVal);
    const maxVal = Math.max(d.current, aiVal);

    return {
      month: d.month,
      current: d.current,
      ai: aiVal,
      savingsMin: minVal,
      savingsMax: maxVal
    };
  });

  return (
    <div className="space-y-6 animate-fade-in font-body pb-12 text-zinc-800 dark:text-zinc-300">
      
      {/* Top Navigation / Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-50 dark:bg-[#1e1e28] border border-black/10 dark:border-white/10 rounded-xl p-4 gap-4 shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-zinc-800 dark:text-white transition-all cursor-pointer border border-black/10 dark:border-white/10"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[8px] uppercase font-bold tracking-widest text-[#8b5cf6] dark:text-[#a78bfa]">AI OPPORTUNITIES DEEP DIVE</span>
            <h2 className="text-sm font-display font-black text-zinc-900 dark:text-white uppercase tracking-wider">
              Forecast Accuracy vs Overstock Savings — Interactive Simulator
            </h2>
          </div>
        </div>
        
        <button
          onClick={() => {
            setCurrentAccuracy(71);
            setAiTargetAccuracy(88);
            setInventoryAtRisk(1.4);
            setAvgMargin(34);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-800 dark:text-white text-[9.5px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow"
        >
          <RefreshCw size={12} /> Reset Parameters
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sliders and Metric Cards */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161620] border border-black/10 dark:border-white/5 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-md dark:shadow-xl">
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">Adjust your parameters to model the impact</h3>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium">Drag the sliders to see simulated margin recovery in real-time</p>
            </div>

            {/* Sliders Container */}
            <div className="space-y-5">
              
              {/* Current Accuracy */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10.5px] font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">Current forecast accuracy</span>
                  <span className="font-mono text-zinc-900 dark:text-white text-xs">{currentAccuracy}%</span>
                </div>
                <input 
                  type="range" min="50" max="95" step="1"
                  value={currentAccuracy} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentAccuracy(val);
                    if (val > aiTargetAccuracy) {
                      setAiTargetAccuracy(val);
                    }
                  }}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#8b5cf6] dark:accent-[#a78bfa]"
                />
              </div>

              {/* AI Target Accuracy */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10.5px] font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">AI target accuracy</span>
                  <span className="font-mono text-zinc-900 dark:text-white text-xs">{aiTargetAccuracy}%</span>
                </div>
                <input 
                  type="range" min="55" max="100" step="1"
                  value={aiTargetAccuracy} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAiTargetAccuracy(Math.max(val, currentAccuracy));
                  }}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-500"
                />
              </div>

              {/* Inventory At Risk */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10.5px] font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">Inventory at risk ($M)</span>
                  <span className="font-mono text-zinc-900 dark:text-white text-xs">${inventoryAtRisk.toFixed(1)}M</span>
                </div>
                <input 
                  type="range" min="0.5" max="5.0" step="0.1"
                  value={inventoryAtRisk} 
                  onChange={(e) => setInventoryAtRisk(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500 dark:accent-sky-400"
                />
              </div>

              {/* Avg Margin */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10.5px] font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">Avg margin on at-risk SKUs</span>
                  <span className="font-mono text-zinc-900 dark:text-white text-xs">{avgMargin}%</span>
                </div>
                <input 
                  type="range" min="15" max="60" step="1"
                  value={avgMargin} 
                  onChange={(e) => setAvgMargin(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-black/10 dark:border-white/5">
            
            {/* Accuracy Gain */}
            <div className="p-3 bg-zinc-50 dark:bg-white/[0.02] border border-black/10 dark:border-white/5 rounded-lg flex flex-col justify-between h-20 shadow">
              <span className="text-[7.5px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-500">ACCURACY GAIN</span>
              <p className="text-base font-display font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                +{accuracyGain}pp
              </p>
            </div>

            {/* Overstock Reduction */}
            <div className="p-3 bg-zinc-50 dark:bg-white/[0.02] border border-black/10 dark:border-white/5 rounded-lg flex flex-col justify-between h-20 shadow">
              <span className="text-[7.5px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-500">OVERSTOCK REDUCTION</span>
              <p className="text-base font-display font-black text-teal-700 dark:text-teal-400 font-mono mt-1">
                {overstockReduction}%
              </p>
            </div>

            {/* Margin Recovery */}
            <div className="p-3 bg-zinc-50 dark:bg-white/[0.02] border border-black/10 dark:border-white/5 rounded-lg flex flex-col justify-between h-20 shadow">
              <span className="text-[7.5px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-500">MARGIN RECOVERY</span>
              <p className="text-base font-display font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                ${marginRecovery.toFixed(2)}M
              </p>
            </div>

          </div>

        </div>

        {/* Right Column: High-fidelity Recharts Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161620] border border-black/10 dark:border-white/5 rounded-xl p-6 flex flex-col shadow-md dark:shadow-xl">
          
          {/* Legend and Info Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <BarChart2 size={12} className="text-[#8b5cf6] dark:text-[#a78bfa]" /> Annual Inventory Profile (Units)
              </span>
            </div>
            
            {/* Custom Legend to match Mockup exactly */}
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 bg-blue-500" />
                <span className="text-zinc-600 dark:text-zinc-400">Current model</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 bg-emerald-500" />
                <span className="text-zinc-600 dark:text-zinc-400">AI model</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-2.5 bg-emerald-500/10 dark:bg-emerald-500/10 border border-dashed border-emerald-500/20 rounded-sm" />
                <span className="text-zinc-600 dark:text-zinc-500">Savings zone</span>
              </div>
            </div>
          </div>

          {/* Chart Wrapper */}
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={isDarkMode ? 0.15 : 0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fill: tickColor, fontSize: 8 }} 
                  axisLine={false} 
                  tickLine={false} 
                  domain={[260, 460]}
                  ticks={[260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460]}
                  tickFormatter={(val) => `${val} u`}
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                  itemStyle={{ fontSize: 9.5 }}
                />

                {/* Savings Zone Range Area */}
                <Area 
                  type="monotone" 
                  dataKey="savingsMax" 
                  baseValue={"savingsMin" as any}
                  stroke="none" 
                  fill="url(#savingsGrad)" 
                  name="Savings zone"
                />

                {/* Current Model Line */}
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  name="Current model" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false}
                />

                {/* AI Model Line */}
                <Line 
                  type="monotone" 
                  dataKey="ai" 
                  name="AI model" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  strokeDasharray="3 3"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-lg flex items-start gap-2.5">
            <Info size={14} className="text-[#8b5cf6] dark:text-[#a78bfa] shrink-0 mt-0.5" />
            <p className="text-[9.5px] text-zinc-600 dark:text-zinc-500 font-medium leading-relaxed">
              <strong>Savings Zone:</strong> The shaded area represents the overstock inventory units saved annually. Smoother scheduling and advanced demand sensing reduce peak safety stock targets and raw materials buffering by aligning supply with actual forecast velocity.
            </p>
          </div>

        </div>
        
      </div>
      
    </div>
  );
};
