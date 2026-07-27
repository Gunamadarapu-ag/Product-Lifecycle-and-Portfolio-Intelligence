import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, Filter, RefreshCw, BarChart2, PieChart, Info, HelpCircle, Save, Plus, Trash2, ArrowRight, Zap,
  Shield, Bell, Check, X, AlertTriangle, AlertCircle, TrendingUp, TrendingDown, Globe, Activity as ActivityIcon,
  Mail, MapPin, Calendar, Download
} from 'lucide-react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, LabelList,
  ComposedChart, BarChart, Bar, Line, Cell, Legend, PieChart as RePieChart, Pie, AreaChart, Area,
  LineChart, ReferenceLine
} from 'recharts';
import { Role } from '../../../types/dashboard';
import { SKUS as GLOBAL_SKUS } from '../../../constants/data';
import { TimelineRange, getFilteredSKUS, getFilteredPortfolioData } from '../../../utils/timeframe';
import { BottleneckDetailsModal } from './BottleneckDetailsModal';
import { EmailComposerModal } from './EmailComposerModal';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { SuccessFeedbackModal } from './SuccessFeedbackModal';
import { SkuDetailsModal } from '../executive/SkuDetailsModal';
import { ParetoConcentration } from '../assortment/ParetoConcentration';


interface PortfolioHealthMapProps {
  role: Role;
  isDarkMode: boolean;
  onAuditClick?: (metricName: string) => void;
  timelineRange: TimelineRange;
}

interface CustomSKUType {
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

const RECIPIENT_TITLES: Record<string, string> = {
  'ananya.sen@aciesglobal.com': 'VP Finance',
  'vikram.solanki@aciesglobal.com': 'QC Manager & Logistics Lead',
  'priya.sharma@aciesglobal.com': 'Product Manager',
  'rajendra.patel@aciesglobal.com': 'Vapi Hub Director',
  'amit.verma@aciesglobal.com': 'NPD Lead',
  'karan.johar@aciesglobal.com': 'Retail Relations Director',
  'k.srinivasan@aciesglobal.com': 'Maintenance Director',
  'priyanka.rao@aciesglobal.com': 'Chennai Plant Supervisor',
  'gautam.sen@aciesglobal.com': 'National Distribution Manager',
  'marcus.ng@aciesglobal.com': 'Global Procurement Director',
  'elena.rostova@aciesglobal.com': 'R&D Product Lead',
  'vijay.kumar@aciesglobal.com': 'APAC Logistics Head',
  'rohan.sharma@aciesglobal.com': 'Plant Manager - Baddi',
  'amit.mehta@aciesglobal.com': 'Supplier Quality QA Lead',
  'pooja.iyer@aciesglobal.com': 'Citrus Category Manager',
  'siddharth.roy@aciesglobal.com': 'NPD Project Lead',
  'nisha.patel@aciesglobal.com': 'Demand Planning Lead',
  'rajesh.verma@aciesglobal.com': 'VP Sales',
  'jp.dubois@aciesglobal.com': 'Commodities Hedging Director',
  'sarah.jenkins@aciesglobal.com': 'Product Formulation Scientist',
  'dieter.maes@aciesglobal.com': 'Production Scheduler'
};

// Helper to calculate lifecycle stage dynamically
const getLifecycleStage = (growth: number, margin: number, rev: number) => {
  if (growth < 0) return 'Decline';
  if (growth >= 0.15 && rev < 100) return 'Introduction';
  if (growth >= 0.10) return 'Growth';
  return 'Margin';
};

// Calculate Portfolio Health Score dynamically
const calculatePortfolioHealth = (skusList: any[]) => {
  if (skusList.length === 0) {
    return { 
      score: 0, 
      intro: 0, 
      growth: 0, 
      margin: 0, 
      decline: 0, 
      introRev: 0,
      growthRev: 0,
      marginRev: 0,
      declineRev: 0,
      totalRev: 0,
      list: { intro: [], growth: [], margin: [], decline: [] } 
    };
  }
  
  let introCount = 0;
  let growthCount = 0;
  let marginCount = 0;
  let declineCount = 0;
  
  let introRev = 0;
  let growthRev = 0;
  let marginRev = 0;
  let declineRev = 0;
  
  const introSKUs: string[] = [];
  const growthSKUs: string[] = [];
  const marginSKUs: string[] = [];
  const declineSKUs: string[] = [];
  
  let totalMargin = 0;
  let totalStockouts = 0;
  let totalComplexity = 0;
  
  skusList.forEach(s => {
    const stage = getLifecycleStage(s.growth, s.margin, s.rev);
    if (stage === 'Introduction') {
      introCount++;
      introSKUs.push(s.name);
      introRev += s.rev;
    } else if (stage === 'Growth') {
      growthCount++;
      growthSKUs.push(s.name);
      growthRev += s.rev;
    } else if (stage === 'Margin') {
      marginCount++;
      marginSKUs.push(s.name);
      marginRev += s.rev;
    } else {
      declineCount++;
      declineSKUs.push(s.name);
      declineRev += s.rev;
    }
    totalMargin += s.margin;
    totalStockouts += s.stockouts;
    totalComplexity += s.cx;
  });
  
  const avgMargin = totalMargin / skusList.length;
  const avgComplexity = totalComplexity / skusList.length;
  
  // Complexity penalty (0 to 1 score)
  const pciScore = (avgComplexity * 0.8 + (avgMargin >= 35 ? 0.2 : 0.4)) / 1.2;
  const complexityPenalty = pciScore * 25;
  
  // Stockouts penalty
  const avgStockouts = totalStockouts / skusList.length;
  const stockoutPenalty = Math.min(15, avgStockouts * 3);
  
  const positiveTrendPct = ((introCount + growthCount + marginCount) / skusList.length) * 100;
  const marginFactor = Math.min(100, (avgMargin / 40) * 100);
  
  const score = Math.round(
    positiveTrendPct * 0.45 + 
    marginFactor * 0.35 + 
    (100 - complexityPenalty) * 0.10 + 
    (100 - stockoutPenalty) * 0.10
  );
  
  const finalScore = Math.max(0, Math.min(100, score));
  const totalRev = skusList.reduce((sum, s) => sum + s.rev, 0) || 1;
  
  return {
    score: finalScore,
    intro: introCount,
    growth: growthCount,
    margin: marginCount,
    decline: declineCount,
    introRev,
    growthRev,
    marginRev,
    declineRev,
    totalRev,
    list: {
      intro: introSKUs,
      growth: growthSKUs,
      margin: marginSKUs,
      decline: declineSKUs
    }
  };
};

interface LifecycleHealthPanelProps {
  skusList: any[];
  isDarkMode: boolean;
  onSelectSku?: (sku: any) => void;
  onAuditClick?: (metric: string) => void;
}

const LifecycleHealthPanel: React.FC<LifecycleHealthPanelProps> = ({ skusList, isDarkMode, onSelectSku, onAuditClick }) => {
  const data = calculatePortfolioHealth(skusList);
  
  // Circular progress ring setup
  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.score / 100) * circumference;
  
  // Health level attributes
  let ratingLabel = 'ELEVATED RISK';
  let ratingColorClass = 'bg-red-500/10 text-red-500 border-red-500/20';
  let ratingStroke = '#ef4444';
  let insightText = '';
  
  if (data.score >= 85) {
    ratingLabel = 'OPTIMAL / ON-TRACK';
    ratingColorClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    ratingStroke = '#10b981';
    insightText = 'Portfolio health is optimal. Excellent balance of high-margin cash cows and growing products.';
  } else if (data.score >= 70) {
    ratingLabel = 'STABLE / ON-TRACK';
    ratingColorClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    ratingStroke = '#f59e0b';
    insightText = `${data.decline} Decline products (${Math.round((data.decline / skusList.length) * 100)}%) are dragging the health score. Consider sunsetting candidates.`;
  } else {
    ratingLabel = 'CRITICAL DRAG';
    ratingColorClass = 'bg-red-500/10 text-red-500 border-red-500/20';
    ratingStroke = '#ef4444';
    insightText = 'Critical complexity and declining volumes. Immediate SKU rationalization is highly recommended.';
  }

  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const totalCount = skusList.length || 1;
  const totalRevVal = data.totalRev || 1;
  const stages = [
    { key: 'intro', label: 'Introduction', count: data.intro, pct: Math.round((data.intro / totalCount) * 100), revAmount: data.introRev, revPct: Math.round((data.introRev / totalRevVal) * 100), color: '#8b5cf6', list: data.list.intro, desc: 'New launches and pipeline concepts' },
    { key: 'growth', label: 'Growth', count: data.growth, pct: Math.round((data.growth / totalCount) * 100), revAmount: data.growthRev, revPct: Math.round((data.growthRev / totalRevVal) * 100), color: '#10b981', list: data.list.growth, desc: 'High growth and expanding volume' },
    { key: 'margin', label: 'Maturity', count: data.margin, pct: Math.round((data.margin / totalCount) * 100), revAmount: data.marginRev, revPct: Math.round((data.marginRev / totalRevVal) * 100), color: '#f59e0b', list: data.list.margin, desc: 'Mature cash cows with solid margins' },
    { key: 'decline', label: 'Decline', count: data.decline, pct: Math.round((data.decline / totalCount) * 100), revAmount: data.declineRev, revPct: Math.round((data.declineRev / totalRevVal) * 100), color: '#ef4444', list: data.list.decline, desc: 'Dwindling volumes and low margins' },
  ];

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* LEFT COLUMN: GAUGE & HEALTH */}
      <div className="lg:col-span-4 flex flex-col items-center justify-center gap-4 border-r border-black/5 dark:border-white/5 pr-4 h-full py-2">
        <div 
          onClick={() => onAuditClick?.('Portfolio Health Score')}
          className="relative flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 group"
          title="Click to audit Portfolio Health Score"
        >
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r={radius} stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth={strokeWidth} fill="transparent" />
            <circle 
              cx="64" 
              cy="64" 
              r={radius} 
              stroke={ratingStroke} 
              strokeWidth={strokeWidth} 
              fill="transparent" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-display font-extrabold text-acies-gray dark:text-white leading-none">{data.score}%</span>
            <span className="text-[8px] text-zinc-400 font-extrabold tracking-wider leading-none mt-1">HEALTH</span>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Portfolio Health Score</span>
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-sm border ${ratingColorClass}`}>
              {ratingLabel}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium px-2">
            {insightText}
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: TIMELINE JOURNEY AND SUMMARY CARDS */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex justify-between items-center pb-1 border-b border-black/5 dark:border-white/5">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa] border-l-2 border-[#6d28d9] dark:border-[#a78bfa] pl-2 block">Product Lifecycle Journey Timeline</span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 uppercase">
            Active Portfolio View
          </span>
        </div>

        {/* Horizontal Journey Timeline */}
        <div className="relative w-full py-4 mb-4 select-none">
          {/* Thin connector line behind nodes */}
          <div className="absolute top-[48px] left-[12.5%] right-[12.5%] h-[2px] bg-zinc-200 dark:bg-zinc-800 z-0"></div>

          {/* Timeline nodes */}
          <div className="relative z-10 flex justify-between items-start w-full">
            {stages.map((stage) => {
              const borderCol = 
                stage.key === 'intro' ? 'border-purple-500' :
                stage.key === 'growth' ? 'border-teal-500' :
                stage.key === 'margin' ? 'border-amber-500' : 'border-red-500';

              const textCol = 
                stage.key === 'intro' ? 'text-purple-600 dark:text-purple-400' :
                stage.key === 'growth' ? 'text-teal-600 dark:text-teal-400' :
                stage.key === 'margin' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
              
              const isEfficient = stage.revPct >= stage.pct;
              const isHoveredOrActive = hoveredStage === stage.key;

              return (
                <div 
                  key={stage.key} 
                  className="flex flex-col items-center text-center w-1/4 group select-none relative"
                  onMouseEnter={() => setHoveredStage(stage.key)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  {/* Circular Badge showing SKU Share % */}
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-display font-extrabold text-xs border-[5px] bg-white dark:bg-zinc-900 shadow-md transition-all duration-300 group-hover:scale-110 cursor-pointer ${borderCol} ${textCol}`}
                    title={`${stage.label} stage SKU share: ${stage.pct}%`}
                  >
                    <span className="text-zinc-800 dark:text-white font-mono">{stage.pct}%</span>
                  </div>

                  {/* Stage Name */}
                  <span className={`text-[10px] font-extrabold tracking-wide mt-2 text-zinc-800 dark:text-zinc-200 group-hover:${textCol} transition-colors`}>
                    {stage.label}
                  </span>

                  {/* Absolute SKU Count */}
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {stage.count} SKUs
                  </span>

                  {/* Absolute Revenue Value */}
                  <span className="text-[9px] font-extrabold text-zinc-700 dark:text-zinc-300 font-mono mt-0.5">
                    ${Math.round(stage.revAmount).toLocaleString('en-IN')} M
                  </span>

                  {/* Efficiency arrow */}
                  <div className="flex items-center gap-0.5 mt-0.5 text-[8px] font-bold">
                    {isEfficient ? (
                      <span className="text-emerald-500 flex items-center gap-0.5" title="Revenue share is higher than SKU share (Efficient)">
                        <TrendingUp size={9} />
                        <span>▲ Efficient</span>
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-0.5" title="SKU share is higher than revenue share (Underperforming)">
                        <TrendingDown size={9} />
                        <span>▼ Underperforming</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Share comparison */}
                  <span className="text-[7px] text-zinc-400 dark:text-zinc-650 font-mono mt-0.5">
                    ({stage.revPct}% Rev vs {stage.pct}% SKU)
                  </span>

                  {/* Micro SKU list popover on hover */}
                  {isHoveredOrActive && stage.list.length > 0 && (
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-2 rounded-sm shadow-xl z-30 space-y-1.5 max-h-48 w-44 overflow-y-auto no-scrollbar"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-[7.5px] font-bold uppercase tracking-widest text-zinc-400 mb-1 leading-none">{stage.label} SKUs ({stage.count})</p>
                      <div className="flex flex-wrap gap-1">
                        {stage.list.map(name => (
                          <button 
                            key={name}
                            onClick={(e) => {
                              e.stopPropagation();
                              const skuObject = skusList.find(s => s.name === name);
                              if (skuObject && onSelectSku) {
                                onSelectSku(skuObject);
                              }
                            }}
                            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-1 py-0.5 rounded-sm text-[7.5px] font-medium text-acies-gray dark:text-zinc-200 hover:bg-[#8b5cf6]/10 hover:border-[#8b5cf6]/30 cursor-pointer transition-all outline-none"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-black/5 dark:border-white/5">
          {/* Total SKUs */}
          <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
            <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
              Total SKUs
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-display font-extrabold text-zinc-800 dark:text-white">
                {totalCount}
              </span>
              <span className="text-[8px] text-zinc-500 uppercase font-bold">Items</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
            <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
              Total Revenue
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-display font-extrabold text-zinc-800 dark:text-white font-mono">
                ${Math.round(totalRevVal).toLocaleString('en-IN')}
              </span>
              <span className="text-[8px] text-zinc-500 uppercase font-bold">M</span>
            </div>
          </div>

          {/* Most Efficient Stage */}
          {(() => {
            let mostEfficient = stages[0];
            let maxRatio = 0;
            stages.forEach(st => {
              const ratio = st.count > 0 ? st.revAmount / st.count : 0;
              if (ratio > maxRatio) {
                maxRatio = ratio;
                mostEfficient = st;
              }
            });
            const textCol = 
              mostEfficient.key === 'intro' ? 'text-purple-650 dark:text-purple-400' :
              mostEfficient.key === 'growth' ? 'text-teal-650 dark:text-teal-400' :
              mostEfficient.key === 'margin' ? 'text-amber-650 dark:text-amber-400' : 'text-red-650 dark:text-red-400';
            return (
              <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
                <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                  Most Efficient Stage
                </span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className={`text-[11px] font-display font-extrabold ${textCol} truncate max-w-[55px]`}>
                    {mostEfficient.label}
                  </span>
                  <span className="text-[8px] font-mono text-emerald-500 font-bold">
                    Ratio: {maxRatio.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Least Efficient Stage */}
          {(() => {
            let leastEfficient = stages[0];
            let minRatio = Infinity;
            stages.forEach(st => {
              const ratio = st.count > 0 ? st.revAmount / st.count : 0;
              if (ratio < minRatio) {
                minRatio = ratio;
                leastEfficient = st;
              }
            });
            const textCol = 
              leastEfficient.key === 'intro' ? 'text-purple-650 dark:text-purple-400' :
              leastEfficient.key === 'growth' ? 'text-teal-650 dark:text-teal-400' :
              leastEfficient.key === 'margin' ? 'text-amber-650 dark:text-amber-400' : 'text-red-650 dark:text-red-400';
            return (
              <div className="bg-black/5 dark:bg-white/5 rounded-sm p-2.5 border border-black/5 dark:border-white/5 flex flex-col justify-between">
                <span className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                  Least Efficient Stage
                </span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className={`text-[11px] font-display font-extrabold ${textCol} truncate max-w-[55px]`}>
                    {leastEfficient.label}
                  </span>
                  <span className="text-[8px] font-mono text-red-500 font-bold">
                    Ratio: {minRatio.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

interface InvestmentMarginSku {
  name: string;
  cat: string;
  rev: number;
  margin: number;
  growth: number;
  investment: number;
  returnMargin: number;
  quadrant: 'quickwin' | 'strategic' | 'niche' | 'avoid';
  rec: string;
}

interface InvestmentMarginMapProps {
  skusList: any[];
  isDarkMode: boolean;
  onSelectSku?: (sku: any) => void;
  addToast?: (title: string, body: string, color: string) => void;
  onScheduleMeeting?: (title: string, type: string) => void;
}

const getInvestmentMarginData = (skusList: any[]): InvestmentMarginSku[] => {
  return skusList.map(s => {
    let investment = 50;
    let returnMargin = s.margin;
    let rec = '';

    if (s.name === 'Herbal Shampoo') {
      investment = 14; returnMargin = 85;
      rec = 'Booming demand requires low capital layout of $14 M; yields a high return margin of 85%. Primary focus for budget boost.';
    } else if (s.name === 'BrandD Toothpaste') {
      investment = 22; returnMargin = 72;
      rec = 'Stable personal care SKU. Low marketing investment needed; returns steady 72% margins. Increase store penetration.';
    } else if (s.name === 'Oat Cookies') {
      investment = 18; returnMargin = 78;
      rec = 'Snack leader with low freight overhead. Low investment of $18 M yields 78% returns. Increase promotional layout.';
    } else if (s.name === 'BrandC Chips (Spicy)') {
      investment = 28; returnMargin = 68;
      rec = 'High local demand pull; low capital required ($28 M) to yield 68% returns. Optimize distributor placement.';
    } else if (s.name === 'Coconut Water 330ml') {
      investment = 35; returnMargin = 81;
      rec = 'Organic category with high profit return of 81% against moderate $35 M capital expansion. Secure convenience store placement.';
    } else if (s.name === 'Mango Fizz 500ml') {
      investment = 75; returnMargin = 70;
      rec = 'Market leader requires substantial launch budget ($75 M) for regional campaigns. Returns a strong 70% margin.';
    } else if (s.name === 'Laundry Pods Premium') {
      investment = 82; returnMargin = 74;
      rec = 'Premium category needs automated line upgrades ($82 M) but offers excellent 74% margins once scaled.';
    } else if (s.name === 'Dish Soap 1L') {
      investment = 60; returnMargin = 62;
      rec = 'Steady household demand. Scaling production requires $60 M with solid 62% margins.';
    } else if (s.name === 'Choco Wafers') {
      investment = 70; returnMargin = 22;
      rec = 'High promotional dependency (72%) and heavy capital layout. Margin returns only 22%. Avoid additional investment.';
    } else if (s.name === 'Fabric Softener') {
      investment = 85; returnMargin = 15;
      rec = 'Severe logistics bottleneck (35d lead time). Requires $85 M for warehouse overrides with poor 15% margin yields.';
    } else if (s.name === 'BrandB Yogurt 1kg') {
      investment = 65; returnMargin = 24;
      rec = 'Saturated dairy item. Shift production focus to higher-margin fresh cheese.';
    } else if (s.name === 'Floor Cleaner') {
      investment = 32; returnMargin = 19;
      rec = 'Low margin (19%) and low capital layout. Maintain baseline trading without active expansion.';
    } else if (s.name === 'Aloe Face Wash') {
      investment = 25; returnMargin = 18;
      rec = 'Underperforming skin care item. Low capital cost but returns only 18%. Defer expansion.';
    } else if (s.name === 'BrandE Yogurt (Straw)') {
      investment = 40; returnMargin = 21;
      rec = 'Minor dairy segment. Defer promotional budgets to release safety stock capital.';
    } else if (s.name === 'Foam Face Wash') {
      investment = 45; returnMargin = 26;
      rec = 'High volume but low margins (26%). Limit capital layout to baseline maintenance.';
    } else {
      if (s.margin >= 35) {
        if (s.rev >= 80) {
          investment = Math.round(55 + (s.rev % 35));
          returnMargin = Math.round(s.margin);
          rec = `High-value product. Requires $${investment} M capital to yield ${returnMargin}% margins.`;
        } else {
          investment = Math.round(15 + (s.rev % 30));
          returnMargin = Math.round(s.margin);
          rec = `Attractive margin profile. Low investment of $${investment} M delivers ${returnMargin}% returns.`;
        }
      } else {
        if (s.rev >= 80) {
          investment = Math.round(60 + (s.rev % 30));
          returnMargin = Math.round(s.margin);
          rec = `Capital heavy and low yield. Investment of $${investment} M delivers only ${returnMargin}% margin.`;
        } else {
          investment = Math.round(10 + (s.rev % 35));
          returnMargin = Math.round(s.margin);
          rec = `Minor tactical SKU. Low investment of $${investment} M yields minor ${returnMargin}% margins.`;
        }
      }
    }

    let quadrant: 'quickwin' | 'strategic' | 'niche' | 'avoid' = 'niche';
    if (returnMargin >= 50 && investment < 50) {
      quadrant = 'quickwin';
    } else if (returnMargin >= 50 && investment >= 50) {
      quadrant = 'strategic';
    } else if (returnMargin < 50 && investment < 50) {
      quadrant = 'niche';
    } else {
      quadrant = 'avoid';
    }

    return {
      name: s.name,
      cat: s.cat,
      rev: s.rev,
      margin: s.margin,
      growth: s.growth,
      investment,
      returnMargin,
      quadrant,
      rec
    };
  });
};

const InvestmentMarginMap: React.FC<InvestmentMarginMapProps> = ({ skusList, isDarkMode, onSelectSku, addToast, onScheduleMeeting }) => {
  const [activeQuad, setActiveQuad] = useState<'quickwin' | 'strategic' | 'niche' | 'avoid'>('quickwin');
  const [viewMode, setViewMode] = useState<'quadrant' | 'category'>('quadrant');
  const [activeCat, setActiveCat] = useState<string>('Beverages');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const oppData = getInvestmentMarginData(skusList);
  
  const chartData = categoryFilter === 'all' 
    ? oppData 
    : oppData.filter(x => x.cat === categoryFilter);

  const filteredOppData = (viewMode === 'quadrant'
    ? oppData.filter(x => x.quadrant === activeQuad)
    : oppData.filter(x => x.cat === activeCat)
  ).filter(x => categoryFilter === 'all' || x.cat === categoryFilter);

  useEffect(() => {
    if (categoryFilter !== 'all') {
      setActiveCat(categoryFilter);
    }
  }, [categoryFilter]);
  
  const accentColor = isDarkMode ? '#a78bfa' : '#6d28d9';
  const gridStroke = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const categoryColors: Record<string, string> = {
    'Beverages': '#7C3AED',
    'Snacks': '#10b981',
    'Personal Care': '#185FA5',
    'Dairy': '#854F0B',
    'Household': '#ED93B1',
    'Beauty': '#EC4899',
    'Fashion': '#F97316'
  };

  const counts = {
    quickwin: oppData.filter(x => x.quadrant === 'quickwin' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    strategic: oppData.filter(x => x.quadrant === 'strategic' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    niche: oppData.filter(x => x.quadrant === 'niche' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    avoid: oppData.filter(x => x.quadrant === 'avoid' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
  };

  const catCounts = {
    'Beverages': oppData.filter(x => x.cat === 'Beverages').length,
    'Snacks': oppData.filter(x => x.cat === 'Snacks').length,
    'Personal Care': oppData.filter(x => x.cat === 'Personal Care').length,
    'Dairy': oppData.filter(x => x.cat === 'Dairy').length,
    'Household': oppData.filter(x => x.cat === 'Household').length,
  };

  const handleApproveInvestment = (skuName: string, potential: number) => {
    if (addToast) {
      addToast(
        "Investment Approved",
        `Mitigation plan & $${potential} M expansion budget successfully approved for ${skuName}.`,
        "#10b981"
      );
    }
  };

  const getBubbleColor = (quad: string) => {
    switch (quad) {
      case 'quickwin': return '#10b981';
      case 'strategic': return '#8b5cf6';
      case 'niche': return '#f59e0b';
      case 'avoid': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-950 border border-black/15 dark:border-zinc-800/80 p-3 rounded-md shadow-lg text-[10px] space-y-1">
          <p className="font-extrabold text-zinc-900 dark:text-zinc-50">{data.name}</p>
          <p className="text-zinc-550 dark:text-zinc-400 font-bold uppercase tracking-wider text-[8px]">{data.cat}</p>
          <div className="border-t border-black/5 dark:border-white/5 pt-1 mt-1 space-y-0.5 font-medium">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Investment:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">${data.investment} M</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Return Margin:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{data.returnMargin}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-450">SKU Revenue:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-450">${data.rev} M</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-black/5 dark:border-white/5 mb-3 gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Investment vs. Return Margin Map</span>
          <p className="text-[9px] text-zinc-550 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
            Optimize fund allocation: High Return & Low Investment (Quick Wins) represent top priority candidates.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 text-zinc-750 dark:text-zinc-200 rounded-sm text-[8.5px] font-extrabold uppercase tracking-widest px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="Beverages">Beverages</option>
            <option value="Snacks">Snacks</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Dairy">Dairy</option>
            <option value="Household">Household</option>
            <option value="Beauty">Beauty</option>
            <option value="Fashion">Fashion</option>
          </select>

          <span className="text-[8px] font-bold uppercase tracking-wider text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full animate-pulse">
            Capital Allocation Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SCATTER MAP */}
        <div className="lg:col-span-7 space-y-2 relative">
          {viewMode === 'category' && (
            <div className="flex flex-wrap items-center justify-center gap-4 py-2 px-3 text-[8.5px] font-bold uppercase tracking-widest bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm mb-3">
              {Object.entries(categoryColors).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5 animate-fadeIn">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-zinc-650 dark:text-zinc-350">{cat}</span>
                </div>
              ))}
            </div>
          )}

          <div className="h-80 relative">
            {viewMode === 'quadrant' && (
              <>
                <div className="absolute top-6 left-16 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded-sm">
                  Quick Wins (High Priority)
                </div>
                <div className="absolute top-6 right-6 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-purple-500/80 bg-purple-500/5 px-2 py-0.5 border border-purple-500/10 rounded-sm">
                  Strategic Bets (Scale)
                </div>
                <div className="absolute top-[200px] left-16 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-amber-500/80 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded-sm">
                  Niche / Tactical
                </div>
                <div className="absolute top-[200px] right-6 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-red-500/80 bg-red-500/5 px-2 py-0.5 border border-red-500/10 rounded-sm">
                  Avoid / High Risk
                </div>
              </>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <ReferenceLine x={50} stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeDasharray="5 5" />
                <ReferenceLine y={50} stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeDasharray="5 5" />
                <XAxis 
                  type="number" 
                  dataKey="investment" 
                  name="Investment" 
                  domain={[0, 100]} 
                  tick={{ fill: tickColor, fontSize: 9 }} 
                  label={{ value: 'Required Investment ($ M) →', position: 'bottom', fill: tickColor, fontSize: 10, offset: 10 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="returnMargin" 
                  name="Return Margin" 
                  domain={[0, 100]} 
                  tick={{ fill: tickColor, fontSize: 9 }} 
                  label={{ value: 'Return Margin (%)', angle: -90, position: 'left', fill: tickColor, fontSize: 10, offset: 15 }} 
                />
                <ZAxis type="number" dataKey="rev" range={[100, 600]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={<CustomTooltip />}
                />
                <Scatter data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={viewMode === 'category' ? (categoryColors[entry.cat] || '#6b7280') : getBubbleColor(entry.quadrant)} 
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={() => {
                        const originalSku = skusList.find(s => s.name === entry.name);
                        if (originalSku && onSelectSku) {
                          onSelectSku(originalSku);
                        }
                      }}
                    />
                  ))}
                  <LabelList 
                    dataKey="name" 
                    position="top" 
                    style={{ fill: 'rgba(156, 163, 175, 0.65)', fontSize: 7, pointerEvents: 'none', fontWeight: 'bold' }} 
                    formatter={(val: string) => {
                      const highlights = ['Herbal Shampoo', 'Oat Cookies', 'Laundry Pods Premium', 'Mango Fizz 500ml', 'Choco Wafers'];
                      return highlights.includes(val) ? val : '';
                    }}
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR LIST */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex border-b border-black/10 dark:border-white/10 p-0.5 bg-black/5 dark:bg-white/5 rounded-sm">
            {viewMode === 'quadrant' ? (
              [
                { id: 'quickwin', label: 'Quick Wins', count: counts.quickwin, color: '#10b981' },
                { id: 'strategic', label: 'Strategic', count: counts.strategic, color: '#8b5cf6' },
                { id: 'niche', label: 'Niche', count: counts.niche, color: '#f59e0b' },
                { id: 'avoid', label: 'Avoid', count: counts.avoid, color: '#ef4444' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveQuad(t.id as any)}
                  className={`flex-1 py-1.5 text-[8.5px] font-extrabold uppercase tracking-wider text-center rounded-sm transition-all cursor-pointer border-none flex items-center justify-center gap-1 ${
                    activeQuad === t.id
                      ? 'bg-white dark:bg-zinc-800 shadow-sm font-black text-acies-gray dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350 bg-transparent'
                  }`}
                  style={{ borderTop: activeQuad === t.id ? `2px solid ${t.color}` : 'none' }}
                >
                  <span>{t.label}</span>
                  <span className="text-[7.5px] opacity-60 px-1 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
                    {t.count}
                  </span>
                </button>
              ))
            ) : (
              [
                { id: 'Beverages', label: 'Bev.', count: catCounts['Beverages'], color: '#7C3AED' },
                { id: 'Snacks', label: 'Snack', count: catCounts['Snacks'], color: '#10b981' },
                { id: 'Personal Care', label: 'Pers.', count: catCounts['Personal Care'], color: '#185FA5' },
                { id: 'Dairy', label: 'Dairy', count: catCounts['Dairy'], color: '#854F0B' },
                { id: 'Household', label: 'House.', count: catCounts['Household'], color: '#ED93B1' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveCat(t.id);
                    setCategoryFilter(t.id);
                  }}
                  className={`flex-1 py-1.5 text-[8px] font-extrabold uppercase tracking-wider text-center rounded-sm transition-all cursor-pointer border-none flex items-center justify-center gap-0.5 ${
                    activeCat === t.id
                      ? 'bg-white dark:bg-zinc-800 shadow-sm font-black text-acies-gray dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350 bg-transparent'
                  }`}
                  style={{ borderTop: activeCat === t.id ? `2px solid ${t.color}` : 'none' }}
                >
                  <span>{t.label}</span>
                  <span className="text-[7px] opacity-60 px-1 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
                    {t.count}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="space-y-2.5 max-h-[265px] overflow-y-auto pr-1 no-scrollbar animate-fadeIn">
            {filteredOppData.map(item => (
              <div 
                key={item.name}
                className="p-3 border border-black/10 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all flex flex-col gap-2 relative group animate-fadeIn"
              >
                <div className="flex justify-between items-start gap-2">
                  <div 
                    onClick={() => {
                      const originalSku = skusList.find(s => s.name === item.name);
                      if (originalSku && onSelectSku) {
                        onSelectSku(originalSku);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <h4 className="text-[11.5px] font-extrabold text-zinc-850 dark:text-zinc-150 group-hover:text-emerald-500 transition-colors font-display">
                      {item.name}
                    </h4>
                    <p className="text-[8.5px] text-zinc-400 dark:text-zinc-505 uppercase font-bold tracking-wider mt-0.5">
                      {item.cat} • Rev: ${item.rev} M • Margin: {item.margin}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      ${item.investment} M
                    </span>
                    <p className="text-[7.5px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold mt-0.5">
                      Investment
                    </p>
                  </div>
                </div>

                <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {item.rec}
                </p>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const originalSku = skusList.find(s => s.name === item.name);
                      if (originalSku && onSelectSku) {
                        onSelectSku(originalSku);
                      }
                    }}
                    className="px-2 py-1 border border-black/10 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-sm text-[8.5px] font-bold uppercase tracking-wider cursor-pointer bg-transparent outline-none"
                  >
                    Review Metrics
                  </button>
                  {item.quadrant === 'quickwin' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onScheduleMeeting) {
                          onScheduleMeeting(item.name, 'CAPEX');
                        } else {
                          handleApproveInvestment(item.name, item.investment);
                        }
                      }}
                      className="px-2 py-1 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-zinc-950 hover:opacity-90 rounded-sm text-[8.5px] font-extrabold uppercase tracking-wider cursor-pointer border-none flex items-center gap-1 outline-none"
                    >
                      <Plus size={10} />
                      Approve Investment
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredOppData.length === 0 && (
              <div className="p-8 text-center text-zinc-450 text-[10px] font-bold uppercase tracking-wider">
                No SKUs found for this active filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface RevPerfSku {
  name: string;
  cat: string;
  rev: number;
  margin: number;
  growth: number;
  performance: number;
  quadrant: 'high_performer' | 'underperformer' | 'hidden_growth' | 'attention';
  rec: string;
}

interface RevenuePerformanceMatrixProps {
  skusList: any[];
  isDarkMode: boolean;
  onSelectSku?: (sku: any) => void;
  addToast?: (title: string, body: string, color: string) => void;
  onScheduleMeeting?: (title: string, type: string) => void;
}

const getRevPerfData = (skusList: any[]): RevPerfSku[] => {
  return skusList.map(s => {
    const perf = Math.round(s.margin * 1.5 + s.growth * 100);
    const performance = Math.min(100, Math.max(0, perf));
    const revenue = s.rev;
    let quadrant: 'high_performer' | 'underperformer' | 'hidden_growth' | 'attention' = 'attention';
    let rec = '';

    if (revenue >= 75 && performance >= 50) {
      quadrant = 'high_performer';
      rec = `Core driver of portfolio revenue. Protect shelf placement, maintain marketing support, and ensure stock availability.`;
    } else if (revenue >= 75 && performance < 50) {
      quadrant = 'underperformer';
      rec = `Generates high revenue ($${revenue} M) but has low performance score (${performance}%). Review pricing and optimize margin metrics.`;
    } else if (revenue < 75 && performance >= 50) {
      quadrant = 'hidden_growth';
      rec = `High-margin and strong growth with low volume. Expand distribution channels, increase marketing, and scale production.`;
    } else {
      quadrant = 'attention';
      rec = `Lagging in both revenue and performance. Candidate for consolidation, supply chain optimization, or sunsetting.`;
    }

    return {
      name: s.name,
      cat: s.cat,
      rev: s.rev,
      margin: s.margin,
      growth: s.growth,
      performance,
      quadrant,
      rec
    };
  });
};

const RevenuePerformanceMatrix: React.FC<RevenuePerformanceMatrixProps> = ({ skusList, isDarkMode, onSelectSku, addToast, onScheduleMeeting }) => {
  const [activeQuad, setActiveQuad] = useState<'high_performer' | 'underperformer' | 'hidden_growth' | 'attention'>('high_performer');
  const [viewMode, setViewMode] = useState<'quadrant' | 'category'>('quadrant');
  const [activeCat, setActiveCat] = useState<string>('Beverages');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const oppData = getRevPerfData(skusList);
  
  const chartData = categoryFilter === 'all' 
    ? oppData 
    : oppData.filter(x => x.cat === categoryFilter);

  const filteredOppData = (viewMode === 'quadrant'
    ? oppData.filter(x => x.quadrant === activeQuad)
    : oppData.filter(x => x.cat === activeCat)
  ).filter(x => categoryFilter === 'all' || x.cat === categoryFilter);

  useEffect(() => {
    if (categoryFilter !== 'all') {
      setActiveCat(categoryFilter);
    }
  }, [categoryFilter]);
  
  const accentColor = isDarkMode ? '#a78bfa' : '#6d28d9';
  const gridStroke = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const categoryColors: Record<string, string> = {
    'Beverages': '#7C3AED',
    'Snacks': '#10b981',
    'Personal Care': '#185FA5',
    'Dairy': '#854F0B',
    'Household': '#ED93B1',
    'Beauty': '#EC4899',
    'Fashion': '#F97316'
  };

  const counts = {
    high_performer: oppData.filter(x => x.quadrant === 'high_performer' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    underperformer: oppData.filter(x => x.quadrant === 'underperformer' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    hidden_growth: oppData.filter(x => x.quadrant === 'hidden_growth' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
    attention: oppData.filter(x => x.quadrant === 'attention' && (categoryFilter === 'all' || x.cat === categoryFilter)).length,
  };

  const catCounts = {
    'Beverages': oppData.filter(x => x.cat === 'Beverages').length,
    'Snacks': oppData.filter(x => x.cat === 'Snacks').length,
    'Personal Care': oppData.filter(x => x.cat === 'Personal Care').length,
    'Dairy': oppData.filter(x => x.cat === 'Dairy').length,
    'Household': oppData.filter(x => x.cat === 'Household').length,
  };

  const handleAuthorizeStrategy = (skuName: string, quadrant: string) => {
    if (addToast) {
      let title = "Strategy Authorized";
      let msg = `Directives logged successfully for ${skuName}.`;
      let color = "#10b981";

      if (quadrant === 'high_performer') {
        title = "Defensive Strategy Active";
        msg = `Shelf allocation protection and distribution guardrails locked in for ${skuName}.`;
        color = "#10b981";
      } else if (quadrant === 'underperformer') {
        title = "Margin Stabilization Active";
        msg = `Authorized price adjustment and discount reduction study for ${skuName}.`;
        color = "#f59e0b";
      } else if (quadrant === 'hidden_growth') {
        title = "Scale Strategy Active";
        msg = `Approved marketing expansion budget and multi-channel rollout plan for ${skuName}.`;
        color = "#8b5cf6";
      } else if (quadrant === 'attention') {
        title = "Pruning Directives Active";
        msg = `Authorized supply chain audit and sunset feasibility assessment for ${skuName}.`;
        color = "#ef4444";
      }

      addToast(title, msg, color);
    }
  };

  const getBubbleColor = (quad: string) => {
    switch (quad) {
      case 'high_performer': return '#10b981';
      case 'hidden_growth': return '#8b5cf6';
      case 'underperformer': return '#f59e0b';
      case 'attention': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-950 border border-black/15 dark:border-zinc-800/80 p-3 rounded-md shadow-lg text-[10px] space-y-1">
          <p className="font-extrabold text-zinc-900 dark:text-zinc-50">{data.name}</p>
          <p className="text-zinc-550 dark:text-zinc-400 font-bold uppercase tracking-wider text-[8px]">{data.cat}</p>
          <div className="border-t border-black/5 dark:border-white/5 pt-1 mt-1 space-y-0.5 font-medium">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Revenue:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">${data.rev} M</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Performance:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{data.performance}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Gross Margin:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{data.margin}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-black/5 dark:border-white/5 mb-3 gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Revenue vs. Performance Matrix</span>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 text-zinc-750 dark:text-zinc-200 rounded-sm text-[8.5px] font-extrabold uppercase tracking-widest px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="Beverages">Beverages</option>
            <option value="Snacks">Snacks</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Dairy">Dairy</option>
            <option value="Household">Household</option>
            <option value="Beauty">Beauty</option>
            <option value="Fashion">Fashion</option>
          </select>

          <span className="text-[8px] font-bold uppercase tracking-wider text-[#8b5cf6] bg-[#8b5cf6]/10 px-2 py-0.5 rounded-full animate-pulse">
            Portfolio Segmentation Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SCATTER MAP */}
        <div className="lg:col-span-7 space-y-2 relative">
          {viewMode === 'category' && (
            <div className="flex flex-wrap items-center justify-center gap-4 py-2 px-3 text-[8.5px] font-bold uppercase tracking-widest bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm mb-3">
              {Object.entries(categoryColors).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5 animate-fadeIn">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-zinc-650 dark:text-zinc-350">{cat}</span>
                </div>
              ))}
            </div>
          )}

          <div className="h-80 relative">
            {viewMode === 'quadrant' && (
              <>
                <div className="absolute top-6 left-16 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-purple-500/80 bg-purple-500/5 px-2 py-0.5 border border-purple-500/10 rounded-sm">
                  Hidden Growth (Top-Left)
                </div>
                <div className="absolute top-6 right-6 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded-sm">
                  High Performers (Top-Right)
                </div>
                <div className="absolute top-[200px] left-16 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-red-500/80 bg-red-500/5 px-2 py-0.5 border border-red-500/10 rounded-sm">
                  Attention Required (Bottom-Left)
                </div>
                <div className="absolute top-[200px] right-6 pointer-events-none text-[8px] font-bold uppercase tracking-wider text-amber-500/80 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded-sm">
                  Underperformers (Bottom-Right)
                </div>
              </>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <ReferenceLine x={75} stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeDasharray="5 5" />
                <ReferenceLine y={50} stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeDasharray="5 5" />
                <XAxis 
                  type="number" 
                  dataKey="rev" 
                  name="Revenue" 
                  domain={[0, 160]} 
                  tick={{ fill: tickColor, fontSize: 9 }} 
                  label={{ value: 'Revenue ($ M) →', position: 'bottom', fill: tickColor, fontSize: 10, offset: 10 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="performance" 
                  name="Performance" 
                  domain={[0, 100]} 
                  tick={{ fill: tickColor, fontSize: 9 }} 
                  label={{ value: 'Performance Score (%)', angle: -90, position: 'left', fill: tickColor, fontSize: 10, offset: 15 }} 
                />
                <ZAxis type="number" dataKey="margin" range={[100, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={<CustomTooltip />}
                />
                <Scatter data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={viewMode === 'category' ? (categoryColors[entry.cat] || '#6b7280') : getBubbleColor(entry.quadrant)} 
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={() => {
                        const originalSku = skusList.find(s => s.name === entry.name);
                        if (originalSku && onSelectSku) {
                          onSelectSku(originalSku);
                        }
                      }}
                    />
                  ))}
                  <LabelList 
                    dataKey="name" 
                    position="top" 
                    style={{ fill: 'rgba(156, 163, 175, 0.65)', fontSize: 7, pointerEvents: 'none', fontWeight: 'bold' }} 
                    formatter={(val: string) => {
                      const highlights = ['Herbal Shampoo', 'Oat Cookies', 'Laundry Pods Premium', 'Mango Fizz 500ml', 'Choco Wafers'];
                      return highlights.includes(val) ? val : '';
                    }}
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR LIST */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex border-b border-black/10 dark:border-white/10 p-0.5 bg-black/5 dark:bg-white/5 rounded-sm">
            {viewMode === 'quadrant' ? (
              [
                { id: 'high_performer', label: 'High Perf.', count: counts.high_performer, color: '#10b981' },
                { id: 'underperformer', label: 'Underperf.', count: counts.underperformer, color: '#f59e0b' },
                { id: 'hidden_growth', label: 'Hidden Gr.', count: counts.hidden_growth, color: '#8b5cf6' },
                { id: 'attention', label: 'Attention', count: counts.attention, color: '#ef4444' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveQuad(t.id as any)}
                  className={`flex-1 py-1.5 text-[8px] font-extrabold uppercase tracking-wider text-center rounded-sm transition-all cursor-pointer border-none flex items-center justify-center gap-0.5 ${
                    activeQuad === t.id
                      ? 'bg-white dark:bg-zinc-800 shadow-sm font-black text-acies-gray dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350 bg-transparent'
                  }`}
                  style={{ borderTop: activeQuad === t.id ? `2px solid ${t.color}` : 'none' }}
                >
                  <span>{t.label}</span>
                  <span className="text-[7px] opacity-60 px-1 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
                    {t.count}
                  </span>
                </button>
              ))
            ) : (
              [
                { id: 'Beverages', label: 'Bev.', count: catCounts['Beverages'], color: '#7C3AED' },
                { id: 'Snacks', label: 'Snack', count: catCounts['Snacks'], color: '#10b981' },
                { id: 'Personal Care', label: 'Pers.', count: catCounts['Personal Care'], color: '#185FA5' },
                { id: 'Dairy', label: 'Dairy', count: catCounts['Dairy'], color: '#854F0B' },
                { id: 'Household', label: 'House.', count: catCounts['Household'], color: '#ED93B1' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveCat(t.id);
                    setCategoryFilter(t.id);
                  }}
                  className={`flex-1 py-1.5 text-[8px] font-extrabold uppercase tracking-wider text-center rounded-sm transition-all cursor-pointer border-none flex items-center justify-center gap-0.5 ${
                    activeCat === t.id
                      ? 'bg-white dark:bg-zinc-800 shadow-sm font-black text-acies-gray dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350 bg-transparent'
                  }`}
                  style={{ borderTop: activeCat === t.id ? `2px solid ${t.color}` : 'none' }}
                >
                  <span>{t.label}</span>
                  <span className="text-[7px] opacity-60 px-1 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
                    {t.count}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="space-y-2.5 max-h-[265px] overflow-y-auto pr-1 no-scrollbar animate-fadeIn">
            {filteredOppData.map(item => (
              <div 
                key={item.name}
                className="p-3 border border-black/10 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all flex flex-col gap-2 relative group animate-fadeIn"
              >
                <div className="flex justify-between items-start gap-2">
                  <div 
                    onClick={() => {
                      const originalSku = skusList.find(s => s.name === item.name);
                      if (originalSku && onSelectSku) {
                        onSelectSku(originalSku);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <h4 className="text-[11.5px] font-extrabold text-zinc-850 dark:text-zinc-150 group-hover:text-purple-500 transition-colors font-display">
                      {item.name}
                    </h4>
                    <p className="text-[8.5px] text-zinc-400 dark:text-zinc-505 uppercase font-bold tracking-wider mt-0.5">
                      {item.cat} • Rev: ${item.rev} M • Perf: {item.performance}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] font-extrabold font-mono text-purple-600 dark:text-purple-400">
                      ${item.rev} M
                    </span>
                    <p className="text-[7.5px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold mt-0.5">
                      Revenue
                    </p>
                  </div>
                </div>

                <p className="text-[9.5px] text-zinc-505 dark:text-zinc-400 leading-relaxed font-medium">
                  {item.rec}
                </p>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const originalSku = skusList.find(s => s.name === item.name);
                      if (originalSku && onSelectSku) {
                        onSelectSku(originalSku);
                      }
                    }}
                    className="px-2 py-1 border border-black/10 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-sm text-[8.5px] font-bold uppercase tracking-wider cursor-pointer bg-transparent outline-none"
                  >
                    Review Metrics
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onScheduleMeeting) {
                        const meetingType = item.quadrant === 'high_performer' ? 'Pricing' :
                                            item.quadrant === 'underperformer' ? 'Rationalize' :
                                            item.quadrant === 'hidden_growth' ? 'Launch' : 'Pricing';
                        onScheduleMeeting(item.name, meetingType);
                      } else {
                        handleAuthorizeStrategy(item.name, item.quadrant);
                      }
                    }}
                    className="px-2 py-1 bg-purple-600 dark:bg-purple-500 text-white dark:text-zinc-950 hover:opacity-90 rounded-sm text-[8.5px] font-extrabold uppercase tracking-wider cursor-pointer border-none flex items-center gap-1 outline-none"
                  >
                    Authorize Strategy
                  </button>
                </div>
              </div>
            ))}
            {filteredOppData.length === 0 && (
              <div className="p-8 text-center text-zinc-450 text-[10px] font-bold uppercase tracking-wider">
                No SKUs found for this active filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMMAND CENTER SUB-COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const VPCommandCenter: React.FC<{ 
  isDarkMode: boolean; 
  onAuditClick?: (metricName: string) => void; 
  timelineRange: TimelineRange;
  role: Role;
}> = ({ isDarkMode, onAuditClick, timelineRange, role }) => {
  const SKUS = getFilteredSKUS(GLOBAL_SKUS, timelineRange);
  const accentColor = isDarkMode ? '#a78bfa' : '#6d28d9';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const gridStroke = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const tooltipBg = isDarkMode ? '#1f1f1f' : '#fff';
  const tooltipBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipText = isDarkMode ? '#fff' : '#000';

  // Toasts
  interface Toast {
    id: string;
    title: string;
    body: string;
    color: string;
  }
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (title: string, body: string, color: string) => {
    const id = Math.random().toString();
    setToasts(prev => [{ id, title, body, color }, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Interactive deck states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHealthTier, setSelectedHealthTier] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [activeBottleneck, setActiveBottleneck] = useState<string | null>(null);
  const [activeApprovalMeeting, setActiveApprovalMeeting] = useState<any | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerEmail, setComposerEmail] = useState({ to: '', subject: '', body: '', name: '', action: '' });
  const [successFeedback, setSuccessFeedback] = useState<{
    isOpen: boolean;
    recipientName: string;
    recipientTitle: string;
    recipientEmail: string;
    contextType: 'approval' | 'bottleneck';
    contextTitle: string;
    channel: 'email' | 'message';
  } | null>(null);

  const [selectedSkuForModal, setSelectedSkuForModal] = useState<any>(null);

  // Dropdown filter states
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterQuarter, setFilterQuarter] = useState('All');
  const [lastRefreshed, setLastRefreshed] = useState('');

  // Jitter offsets
  const [jitterOffset, setJitterOffset] = useState({
    rev: 0,
    skuCount: 0,
    growth: 0,
    orders: 0,
    fcast: 0
  });
  const [kpiFlash, setKpiFlash] = useState<Record<string, 'up' | 'dn' | null>>({});

  // Listen to hashchange to support category and SKU deep-linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#';
      const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
      
      const catParam = params.get('category') || params.get('filterCat');
      if (catParam) {
        const categoriesList = ['Beverages', 'Snacks', 'Personal Care', 'Dairy', 'Household', 'Beauty', 'Fashion'];
        const matched = categoriesList.find(c => c.toLowerCase() === catParam.toLowerCase());
        if (matched) {
          setFilterCategory(matched);
        } else if (catParam.toLowerCase() === 'all') {
          setFilterCategory('All');
        }
      }

      const skuParam = params.get('sku');
      if (skuParam) {
        const foundSku = SKUS.find(s => s.name.toLowerCase() === skuParam.toLowerCase());
        if (foundSku) {
          setSelectedSkuForModal(foundSku);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync selectedCategory state with filterCategory selection
  useEffect(() => {
    setSelectedCategory(filterCategory === 'All' ? 'all' : filterCategory);
  }, [filterCategory]);

  // Jitter KPIs via offsets
  useEffect(() => {
    const interval = setInterval(() => {
      const keys = ['rev', 'orders', 'fcast', 'skuCount', 'growth'] as const;
      const key = keys[Math.floor(Math.random() * keys.length)];
      const delta = (Math.random() - 0.3) * { rev: 0.4, orders: 8, fcast: 0.05, skuCount: 0, growth: 0.05 }[key];

      setJitterOffset(prev => {
        const newVal = prev[key] + delta;
        setKpiFlash(f => ({ ...f, [key]: delta > 0 ? 'up' : 'dn' }));
        setTimeout(() => {
          setKpiFlash(f => ({ ...f, [key]: null }));
        }, 800);

        return {
          ...prev,
          [key]: newVal
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update clock time live matching the template '02:31:46 pm'
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = String(hours).padStart(2, '0');
      setLastRefreshed(`${strHours}:${minutes}:${seconds} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Map SKU properties for filtering
  const processedSKUs = React.useMemo(() => {
    return SKUS.map((s, idx) => {
      const regions = ['APAC', 'EMEA', 'Americas', 'India'];
      const region = regions[idx % regions.length];

      const quarters = ['Q2 2026', 'Q3 2026', 'Q4 2026'];
      const quarter = quarters[idx % quarters.length];

      let risk = 'Low';
      if (s.cx > 0.6 || s.stockouts >= 5 || s.margin < 25) {
        risk = 'High';
      } else if (s.cx > 0.4 || s.stockouts >= 3 || s.margin < 35) {
        risk = 'Medium';
      }

      return { ...s, region, quarter, risk };
    });
  }, [SKUS]);

  // Filter SKUs
  const filteredSKUs = React.useMemo(() => {
    return processedSKUs.filter(s => {
      const matchRegion = filterRegion === 'All' || s.region === filterRegion;
      const matchCategory = filterCategory === 'All' || s.cat === filterCategory;
      const matchRisk = filterRisk === 'All' || s.risk === filterRisk;
      const matchQuarter = filterQuarter === 'All' || s.quarter === filterQuarter;
      return matchRegion && matchCategory && matchRisk && matchQuarter;
    });
  }, [processedSKUs, filterRegion, filterCategory, filterRisk, filterQuarter]);

  // Dynamically calculate KPIs based on filtered SKUs and jittering offset
  const filteredCount = filteredSKUs.length || 1;
  const dynamicTotalRev = filteredSKUs.reduce((sum, s) => sum + s.rev, 0) * (851.2 / 8419.74);
  const dynamicSkuCount = filteredSKUs.length;
  const dynamicGrowth = (filteredSKUs.reduce((sum, s) => sum + s.growth, 0) / filteredCount) * 100;
  const dynamicOrders = filteredSKUs.reduce((sum, s) => sum + s.rev, 0) * (4218 / 8419.74);
  const dynamicFcast = 94.6 + (filteredSKUs.reduce((sum, s) => sum + s.margin, 0) / filteredCount - 35.1) * 0.1;

  // Apply scale offsets
  const revVal = parseFloat((dynamicTotalRev + jitterOffset.rev).toFixed(1));
  const revScale = Math.max(0.1, revVal / 851.2);
  const revHist = [790, 800, 811, 820, 829, 838, 845, 851.2].map(v => v * revScale);

  const skuCountVal = Math.round(dynamicSkuCount + jitterOffset.skuCount);
  const skuCountScale = Math.max(0.1, skuCountVal / 100);
  const skuCountHist = [105, 104, 104, 103, 103, 100, 100, 100].map(v => v * skuCountScale);

  const growthVal = parseFloat((dynamicGrowth + jitterOffset.growth).toFixed(1));
  const growthScale = Math.max(0.1, growthVal / 8.4);
  const growthHist = [7.2, 7.5, 7.8, 8.0, 8.1, 8.3, 8.3, 8.4].map(v => v * growthScale);

  const ordersVal = Math.round(dynamicOrders + jitterOffset.orders);
  const ordersScale = Math.max(0.1, ordersVal / 4218);
  const ordersHist = [3800, 3900, 3980, 4050, 4100, 4150, 4190, 4218].map(v => v * ordersScale);

  const fcastVal = parseFloat((dynamicFcast + jitterOffset.fcast).toFixed(1));
  const fcastScale = Math.max(0.1, fcastVal / 94.6);
  const fcastHist = [96.1, 95.8, 95.4, 95.2, 95.0, 94.9, 94.7, 94.6].map(v => v * fcastScale);

  const kpis = {
    rev: { val: revVal, hist: revHist, target: 900, label: 'Portfolio Revenue', suffix: ' M', prefix: '$', color: '#3b82f6' },
    skuCount: { val: skuCountVal, hist: skuCountHist, target: 100, label: 'Portfolio SKU Count', suffix: '', prefix: '', color: '#10b981' },
    growth: { val: growthVal, hist: growthHist, target: 10.0, label: 'Growth Rate', suffix: '%', prefix: '', color: '#ec4899' },
    orders: { val: ordersVal, hist: ordersHist, target: 5000, label: 'Orders — Today', suffix: '', prefix: '', color: '#8b5cf6' },
    fcast: { val: fcastVal, hist: fcastHist, target: 97.0, label: 'Forecast Attainment', suffix: '%', prefix: '', color: '#f59e0b' },
  };

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = '/portfolio_health_guide.pdf';
    link.download = 'portfolio_health_guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Executive Summary Downloaded', 'Downloading Portfolio Health Map Executive Guide (PDF).', '#10b981');
  };

  const stockToasted = useRef(false);

  // Master datasets for the 3 roles/lenses
  const ALL_APPROVALS = [
    // VP Product Management (Portfolio Strategy & Performance Lens)
    { id: 'p_vp1', role: 'VP Product Management', type: 'Launch', title: 'Portfolio Roadmap: Authorize BrandF Soda 250ml slim-can product extension GTM charter — $4.5 M', age: '2 days', urgency: 'high', done: false },
    { id: 'p_vp2', role: 'VP Product Management', type: 'CAPEX', title: 'CAPEX Allocation: Approve Q3 product packaging automation capital budget — $12.5 M', age: '6 days', urgency: 'high', done: false },
    { id: 'p_vp3', role: 'VP Product Management', type: 'Launch', title: 'M&A Integration: Sign off on BrandC Snacks portfolio consolidation & product alignment', age: '4 days', urgency: 'medium', done: false },

    // Product Manager (Operational & Execution Lens)
    { id: 'p_pm1', role: 'Product Manager', type: 'Rationalize', title: 'SKU Rationalization: Phase 1 sunset proposal for 15 low-margin tail products', age: '2 days', urgency: 'high', done: false },
    { id: 'p_pm2', role: 'Product Manager', type: 'Launch', title: 'Product Governance: Validate compliance certification for BrandB Chips product reformulation', age: '4 days', urgency: 'medium', done: false },
    { id: 'p_pm3', role: 'Product Manager', type: 'Launch', title: 'Product Roadmap: Sign off on BrandD Toothpaste NPD launch readiness criteria', age: '6 days', urgency: 'high', done: false },

    // Pricing and Margin Partner (Financial & Leakage Diagnostics Lens)
    { id: 'p_pr1', role: 'Pricing and Margin Partner', type: 'Pricing', title: 'Pricing Policy: Establish BrandD Cheese +4.5% price index adjust to offset margin leakage', age: '3 days', urgency: 'high', done: false },
    { id: 'p_pr2', role: 'Pricing and Margin Partner', type: 'Promo', title: 'Margin Integrity: Approve BrandC Chips maximum promotional discount depth limit of 15%', age: '5 days', urgency: 'medium', done: false },
    { id: 'p_pr3', role: 'Pricing and Margin Partner', type: 'Promo', title: 'Revenue Diagnostics: Audit distributor price protection claim variance for BrandB Soap', age: '1 day', urgency: 'high', done: false },
  ];

  const ALL_BOTTLENECKS = [
    // VP Product Management (Portfolio Strategy & Performance Lens)
    {
      role: 'VP Product Management',
      label: 'BrandF Soda',
      val: 90,
      color: '#ef4444',
      status: 'critical',
      location: 'Southern Region (Chennai)',
      cause: 'Severe brand dilution and sales drop-offs due to intense internal flavor cannibalization between Cola and Lime variants.',
      suggestions: [
        {
          action: 'Re-position Lime flavor under the secondary BrandC sub-brand to segregate consumer target segments.',
          impact: 'Stabilizes core Cola revenue; reduces line setup changes by 25%.',
          contactName: 'Priya Sharma',
          contactTitle: 'Lead Product Manager',
          email: 'priya.sharma@aciesglobal.com',
          draftBody: 'Hi Priya,\n\nRegarding the BrandF Soda cannibalization issues, let\'s execute the plan to re-position Lime under BrandC to protect our main Cola revenue.\n\nThanks,\nVP Product Management'
        },
        {
          action: 'Approve formulation update to low-calorie stevia base to attract wellness consumers.',
          impact: 'Raises brand growth by 4pp in premium channels.',
          contactName: 'Dr. Elena Rostova',
          contactTitle: 'NPD Product Lead',
          email: 'elena.rostova@aciesglobal.com',
          draftBody: 'Hi Elena,\n\nLet\'s move forward with the sugar-free stevia formulation update for BrandF Soda to shift consumer focus.\n\nThanks,\nVP Product Management'
        }
      ]
    },
    {
      role: 'VP Product Management',
      label: 'BrandD Cheese',
      val: 89,
      color: '#ef4444',
      status: 'critical',
      location: 'Western Region (Vapi)',
      cause: 'Strategic brand dilution due to excessive SKU proliferation (12 low-volume tail variants) causing customer choice confusion.',
      suggestions: [
        {
          action: 'Consolidate category options by sunsetting the bottom 4 performing variants.',
          impact: 'Reclaims shelf space focus and lifts core BrandD sales by 8%.',
          contactName: 'Pooja Iyer',
          contactTitle: 'Category Product Manager',
          email: 'pooja.iyer@aciesglobal.com',
          draftBody: 'Hi Pooja,\n\nTo address choice confusion on BrandD Cheese, let\'s draft a proposal to consolidate our tail variants.\n\nThanks,\nVP Product Management'
        }
      ]
    },
    {
      role: 'VP Product Management',
      label: 'BrandC Snacks',
      val: 88,
      color: '#ef4444',
      status: 'critical',
      location: 'Northern Region (Baddi)',
      cause: 'Post-acquisition brand architecture overlap between BrandC organic chips and premium nut lines, leading to consumer brand friction.',
      suggestions: [
        {
          action: 'Pivot organic snacks line under a single cohesive brand architecture.',
          impact: 'Clears shelf presentation; projects +15% category revenue uplift.',
          contactName: 'Pooja Iyer',
          contactTitle: 'Category Product Manager',
          email: 'pooja.iyer@aciesglobal.com',
          draftBody: 'Hi Pooja,\n\nRegarding the BrandC post-acquisition product overlap, let\'s prepare the plan to pivot all organic snacks under a unified brand architecture.\n\nThanks,\nVP Product Management'
        },
        {
          action: 'Approve formulation update to premium packaging to justify price delta.',
          impact: 'Lifts average basket margin by 4.2pp.',
          contactName: 'K. Srinivasan',
          contactTitle: 'Product Design Lead',
          email: 'k.srinivasan@aciesglobal.com',
          draftBody: 'Hi Srinivasan,\n\nLet\'s move forward with updating the product packaging design to premium eco-boxes to support our pricing delta.\n\nThanks,\nVP Product Management'
        }
      ]
    },
    {
      role: 'VP Product Management',
      label: 'BrandB Soap',
      val: 84,
      color: '#f59e0b',
      status: 'warning',
      location: 'Western Region (Vapi)',
      cause: 'BrandB Soap formulation failing to meet the modern wellness consumer standards, leading to a steady drop in trial rates and product affinity.',
      suggestions: [
        {
          action: 'Pivot brand formulation to organic base extracts to tap into the active natural care segment.',
          impact: 'Revitalizes product affinity; projected +20% year-on-year sales acceleration.',
          contactName: 'Dr. Elena Rostova',
          contactTitle: 'NPD Product Lead',
          email: 'elena.rostova@aciesglobal.com',
          draftBody: 'Hi Elena,\n\nPlease accelerate the organic formulation pivot for BrandB Soap to align with natural care product trends.\n\nThanks,\nVP Product Management'
        }
      ]
    },
    {
      role: 'VP Product Management',
      label: 'BrandG Dairy',
      val: 86,
      color: '#f59e0b',
      status: 'warning',
      location: 'Eastern Region (Kolkata)',
      cause: 'Lactose-free variant launching delay due to cold-chain logistics capacity constraints in transit hubs.',
      suggestions: [
        {
          action: 'Authorize premium third-party reefer fleet lease for Eastern distribution corridor.',
          impact: 'Reduces launch transit lead time by 12 days; secures early market footprint.',
          contactName: 'Amit Sen',
          contactTitle: 'Supply Chain Director',
          email: 'amit.sen@aciesglobal.com',
          draftBody: 'Hi Amit,\n\nPlease authorize the lease of premium reefer trucks for our Lactose-free Dairy launch in the East.\n\nThanks,\nVP Product Management'
        }
      ]
    },
    {
      role: 'VP Product Management',
      label: 'BrandH Personal Care',
      val: 92,
      color: '#ef4444',
      status: 'critical',
      location: 'Southern Region (Bengaluru)',
      cause: 'Eco-friendly bamboo toothbrush line experiencing high bristles shedding defect rate (5.4% vs 0.5% hurdle).',
      suggestions: [
        {
          action: 'Trigger manufacturing line shutdown for ultrasonic bristle anchor calibration.',
          impact: 'Brings defect rate back to benchmark <0.5%; protects brand quality reputation.',
          contactName: 'Dr. Elena Rostova',
          contactTitle: 'NPD Product Lead',
          email: 'elena.rostova@aciesglobal.com',
          draftBody: 'Hi Elena,\n\nPlease trigger a line shutdown for bristle anchor calibration to fix the bamboo toothbrush defect rate.\n\nThanks,\nVP Product Management'
        }
      ]
    },

    // Product Manager (Operational & Execution Lens)
    {
      role: 'Product Manager',
      label: 'BrandA Softener',
      val: 92,
      color: '#ef4444',
      status: 'critical',
      location: 'Western Region (Vapi)',
      cause: 'Rapid customer sentiment decline and brand fatigue due to outdated foaming pump bottle design and poor usability ratings.',
      suggestions: [
        {
          action: 'Launch an eco-friendly pump refill pouch format to revive brand interest.',
          impact: 'Improves sustainability rating by 30% and reduces packaging material unit cost.',
          contactName: 'K. Srinivasan',
          contactTitle: 'Product Design Lead',
          email: 'k.srinivasan@aciesglobal.com',
          draftBody: 'Hi Srinivasan,\n\nPlease accelerate the eco-refill pouch design for BrandA Softener to resolve customer usability concerns.\n\nThanks,\nProduct Manager'
        },
        {
          action: 'Review and audit the product packaging layout for a clean, modern aesthetic.',
          impact: 'Improves trial rates by 15% in premium supermarket channels.',
          contactName: 'Dr. Elena Rostova',
          contactTitle: 'NPD Product Lead',
          email: 'elena.rostova@aciesglobal.com',
          draftBody: 'Hi Elena,\n\nCan we initiate a design audit on the Softener packaging to counter brand fatigue?\n\nThanks,\nProduct Manager'
        }
      ]
    },
    {
      role: 'Product Manager',
      label: 'BrandD Water',
      val: 85,
      color: '#f59e0b',
      status: 'warning',
      location: 'South East Asia (Penang)',
      cause: 'Brand fatigue in Modern Trade channels due to a lack of pack size diversity failing to attract single-serve wellness shoppers.',
      suggestions: [
        {
          action: 'Fast-track single-serve aluminum can format launch.',
          impact: 'Opens new convenience store channels; projected +18% volume growth.',
          contactName: 'Siddharth Roy',
          contactTitle: 'NPD Product Lead',
          email: 'siddharth.roy@aciesglobal.com',
          draftBody: 'Hi Siddharth,\n\nPlease speed up the single-serve aluminum can launch for BrandD Water.\n\nThanks,\nProduct Manager'
        }
      ]
    },
    {
      role: 'Product Manager',
      label: 'BrandJ Snacks',
      val: 87,
      color: '#f59e0b',
      status: 'warning',
      location: 'Western Region (Pune)',
      cause: 'Rancidity reports on high-fat nut mixes due to packaging foil barrier thickness variation.',
      suggestions: [
        {
          action: 'Upgrade to triple-layer nitrogen flush film barrier packing.',
          impact: 'Extends shelf life from 3 months to 9 months; resolves customer returns.',
          contactName: 'K. Srinivasan',
          contactTitle: 'Product Design Lead',
          email: 'k.srinivasan@aciesglobal.com',
          draftBody: 'Hi Srinivasan,\n\nPlease upgrade the snack foil barrier thickness to triple-layer nitrogen flush film immediately.\n\nThanks,\nProduct Manager'
        }
      ]
    },

    // Pricing and Margin Partner (Financial & Leakage Diagnostics Lens)
    {
      role: 'Pricing and Margin Partner',
      label: 'BrandC Chips',
      val: 91,
      color: '#ef4444',
      status: 'critical',
      location: 'Northern Region (Baddi)',
      cause: 'High promotional dependency (over 45% of sales on deep discount) resulting in gross margin dilution below the 35% category hurdle.',
      suggestions: [
        {
          action: 'Cap promotional discount depth at 15% and redirect marketing budget to brand campaigns.',
          impact: 'Reclaims 3.2% category gross margin; protects brand health.',
          contactName: 'Rajesh Verma',
          contactTitle: 'Director of Commercial Portfolio',
          email: 'rajesh.verma@aciesglobal.com',
          draftBody: 'Hi Rajesh,\n\nRegarding the BrandC Chips margin compression, please initiate a promotional discount cap at 15%.\n\nThanks,\nPricing Partner'
        },
        {
          action: 'Adjust promotion timing to avoid direct overlap with competitor discount cycles.',
          impact: 'Protects organic sales and avoids unnecessary margin dilution.',
          contactName: 'Amit Mehta',
          contactTitle: 'Product Pricing Director',
          email: 'amit.mehta@aciesglobal.com',
          draftBody: 'Hi Amit,\n\nPlease review our promotional calendar for BrandC Chips to avoid direct overlaps with competitor cycles.\n\nThanks,\nPricing Partner'
        }
      ]
    },
    {
      role: 'Pricing and Margin Partner',
      label: 'BrandE Water',
      val: 89,
      color: '#ef4444',
      status: 'critical',
      location: 'Western Region (Pune)',
      cause: 'Revenue leakage from uncoordinated distributor price protection claims and retail coupon stackings.',
      suggestions: [
        {
          action: 'Implement a strict retail promotion matching cap and audit distributor claims.',
          impact: 'Recovers 4.5% in lost margin revenue; stops promotion overruns.',
          contactName: 'Ananya Sen',
          contactTitle: 'Director of Portfolio Finance',
          email: 'ananya.sen@aciesglobal.com',
          draftBody: 'Hi Ananya,\n\nPlease establish an audit framework for BrandE Water distributor price protection claims to prevent further leakage.\n\nThanks,\nPricing Partner'
        }
      ]
    },
    {
      role: 'Pricing and Margin Partner',
      label: 'BrandK Household',
      val: 93,
      color: '#ef4444',
      status: 'critical',
      location: 'Northern Region (Baddi)',
      cause: 'Raw chemical surfactant price spike (linear alkylbenzene sulfonate +25%) eroding laundry detergent margins by 4.8pp.',
      suggestions: [
        {
          action: 'Initiate value-engineering review to substitute surfactant base with bio-derived enzymes.',
          impact: 'Restores 3.5pp margin while improving product biodegradability profile.',
          contactName: 'Ananya Sen',
          contactTitle: 'Director of Portfolio Finance',
          email: 'ananya.sen@aciesglobal.com',
          draftBody: 'Hi Ananya,\n\nPlease kick off the formulation value-engineering review for the laundry detergent line to offset surfactant cost inflation.\n\nThanks,\nPricing Partner'
        }
      ]
    },
    {
      role: 'VP Product Management',
      label: 'BrandM Beverages',
      val: 94,
      color: '#ef4444',
      status: 'critical',
      location: 'Southern Region (Chennai)',
      cause: 'Severe glass bottle supplier capacity shortfalls causing 20% order fulfillment backlog for premium carbonated mixers.',
      suggestions: [
        {
          action: 'Transition 40% of production volume to premium aluminum sleek cans.',
          impact: 'Resolves delivery backlog; reduces unit freight cost by 8%.',
          contactName: 'Siddharth Roy',
          contactTitle: 'Director of Sourcing',
          email: 'siddharth.roy@aciesglobal.com',
          draftBody: 'Hi Siddharth,\n\nRegarding the glass bottle shortage on BrandM, let\'s initiate a transition of 40% volume to aluminum sleek cans to resolve the Chennai logistics backlog.\n\nThanks,\nVP Product Management'
        }
      ]
    },
    {
      role: 'VP Product Management',
      label: 'BrandL Snacks',
      val: 86,
      color: '#f59e0b',
      status: 'warning',
      location: 'Western Region (Mumbai)',
      cause: 'Modern Trade shelf-space contraction of 15% due to aggressive competitor category encroachment.',
      suggestions: [
        {
          action: 'Negotiate exclusive high-visibility endcap slots with top 3 supermarket chains.',
          impact: 'Reclaims category share and lifts impulse purchase conversion by 12%.',
          contactName: 'Rajesh Verma',
          contactTitle: 'Director of Commercial Portfolio',
          email: 'rajesh.verma@aciesglobal.com',
          draftBody: 'Hi Rajesh,\n\nPlease review shelf placements and slotting contracts for BrandL in Mumbai Modern Trade channels to counter competitor endcap encroachment.\n\nThanks,\nVP Product Management'
        }
      ]
    },
    {
      role: 'Product Manager',
      label: 'BrandP Dairy',
      val: 89,
      color: '#ef4444',
      status: 'critical',
      location: 'Western Region (Vapi)',
      cause: 'Critical transit packaging leakage in eco-friendly milk carton caps leading to 4.2% product loss during shipping.',
      suggestions: [
        {
          action: 'Upgrade carton cap design to dual-seal leakproof threading.',
          impact: 'Reduces transit product loss below 0.1% and restores customer freshness ratings.',
          contactName: 'K. Srinivasan',
          contactTitle: 'Product Design Lead',
          email: 'k.srinivasan@aciesglobal.com',
          draftBody: 'Hi Srinivasan,\n\nPlease accelerate the dual-seal cap packaging design revision for BrandP Dairy to fix shipping leakages.\n\nThanks,\nProduct Manager'
        }
      ]
    },
    {
      role: 'Pricing and Margin Partner',
      label: 'BrandQ Personal Care',
      val: 85,
      color: '#f59e0b',
      status: 'warning',
      location: 'Southern Region (Bengaluru)',
      cause: 'Margin compression due to 12% increase in imported paperboard raw material cost for premium gift sets.',
      suggestions: [
        {
          action: 'Source certified local recycled paperboard for packaging gift sets.',
          impact: 'Saves 15% in procurement costs and improves sustainability index score.',
          contactName: 'Ananya Sen',
          contactTitle: 'Director of Portfolio Finance',
          email: 'ananya.sen@aciesglobal.com',
          draftBody: 'Hi Ananya,\n\nPlease evaluate the financial viability of local recycled paperboard packaging for BrandQ gift sets to offset raw material cost hikes.\n\nThanks,\nPricing Partner'
        }
      ]
    }
  ];

  const ALL_DECISIONS = [
    // VP Product Management (Portfolio Strategy & Performance Lens)
    { id: 'd_vp1', role: 'VP Product Management', icon: '⚡', iconBg: 'rgba(239,68,68,0.1)', iconColor: '#ef4444', title: 'Portfolio Strategy: Consolidate BrandD Cheese product line (rationalize 4 tail variants)', sub: 'SKU Proliferation · Brand Dilution', stats: [['Tail SKUs', '12 variants'], ['Tail Sales', '<1.2% total'], ['Margin Drag', '-1.8%'], ['Action', 'Sunset 4 SKUs']], done: false },
    { id: 'd_vp2', role: 'VP Product Management', icon: '📦', iconBg: 'rgba(59,130,246,0.1)', iconColor: '#3b82f6', title: 'Strategic Investment: Scale BrandF Water portfolio footprint to capture double-digit growth', sub: 'Category Leader · +12.4% YoY', stats: [['Net Sales', '$17.03 M'], ['Margin', '40%'], ['Growth', '12.4% YoY'], ['Opportunity', 'Expand footprint']], done: false },

    // Product Manager (Operational & Execution Lens)
    { id: 'd_pm1', role: 'Product Manager', icon: '⚡', iconBg: 'rgba(239,68,68,0.1)', iconColor: '#ef4444', title: 'Product Redesign: Refurbish BrandA Softener foaming pump packaging design to resolve sentiment decline', sub: 'Sentiment Decline · Usability', stats: [['Tail SKUs', '2.1 / 5'], ['Sentiment', '-32%'], ['Refill conversion', '18%'], ['Action', 'Eco refill pouch']], done: false },
    { id: 'd_pm2', role: 'Product Manager', icon: '📦', iconBg: 'rgba(59,130,246,0.1)', iconColor: '#3b82f6', title: 'NPD Roadmap: Launch BrandD Water single-serve aluminum can variant', sub: 'NPD Launch · Modern Trade', stats: [['Target Market', 'Convenience'], ['Projected growth', '+18% vol'], ['Material cost', '-5.5%'], ['Status', 'FDA ready']], done: false },

    // Pricing and Margin Partner (Financial & Leakage Diagnostics Lens)
    { id: 'd_pr1', role: 'Pricing and Margin Partner', icon: '⚡', iconBg: 'rgba(239,68,68,0.1)', iconColor: '#ef4444', title: 'Promo Policy: Enforce BrandC Chips promotional discount cap to protect gross margins', sub: 'Promo Dependency · Margin Dilution', stats: [['Promo Share', '45%'], ['Category Margin', '32.1%'], ['Hurdle limit', '35%'], ['Cap proposed', '15% max']], done: false },
    { id: 'd_pr2', role: 'Pricing and Margin Partner', icon: '📦', iconBg: 'rgba(59,130,246,0.1)', iconColor: '#3b82f6', title: 'Revenue Diagnostics: Audit BrandE Water price protection claims to prevent margin leakage', sub: 'Revenue Leakage · Distributor', stats: [['Claim volume', '$2.8 M'], ['Leakage est', '14.2%'], ['Audit timeline', '14 days'], ['Action', 'Set matching limits']], done: false }
  ];

  // Alerts
  const [alerts, setAlerts] = useState([
    { id: 'a1', sev: 'critical', sevC: '#ef4444', title: 'Product Design Alert: BrandA Softener outdated packaging design', desc: 'Execution · Drop in trial rate · Western Region (Vapi) affected', dismissed: false },
    { id: 'a2', sev: 'critical', sevC: '#ef4444', title: 'Margin Risk Alert: BrandC Chips promo dependency exceeds threshold', desc: 'Margin · Only 55% organic revenue. Budget cap review required.', dismissed: false },
    { id: 'a3', sev: 'warning', sevC: '#f59e0b', title: 'Portfolio Risk Alert: BrandD Cheese SKU proliferation causing brand dilution', desc: 'Strategy · 12 low-volume tail variants confuse consumers', dismissed: false },
    { id: 'a4', sev: 'warning', sevC: '#f59e0b', title: 'Portfolio Risk Alert: Flavor cannibalization between BrandF Soda variants', desc: 'Strategy · Lime and Cola flavor overlap dilutes core brand', dismissed: false },
    { id: 'a5', sev: 'info', sevC: '#3b82f6', title: 'Roadmap Opportunity: Scale BrandF Water portfolio footprint', desc: 'Strategy · High margin category leader', dismissed: false },
    { id: 'a6', sev: 'critical', sevC: '#ef4444', title: 'Portfolio Risk Alert: BrandC Snacks post-acquisition brand architecture overlap', desc: 'Strategy · Overlap between organic chips and premium nut lines · Northern Region (Baddi) affected', dismissed: false },
    { id: 'a7', sev: 'warning', sevC: '#f59e0b', title: 'Product Quality Alert: BrandB Soap formulation failing modern wellness standards', desc: 'Strategy · Trial rate and product affinity decline · Western Region (Vapi) affected', dismissed: false },
    { id: 'a8', sev: 'warning', sevC: '#f59e0b', title: 'Logistics Alert: BrandG Dairy cold-chain capacity bottlenecks', desc: 'Supply · Transit delay for lactose-free launches · Eastern Region (Kolkata) affected', dismissed: false },
    { id: 'a9', sev: 'critical', sevC: '#ef4444', title: 'Quality Alert: BrandH Personal Care bamboo toothbrush bristle defects', desc: 'Execution · Defect rate exceeds limits · Southern Region (Bengaluru) affected', dismissed: false },
    { id: 'a10', sev: 'critical', sevC: '#ef4444', title: 'Margin Alert: BrandK Household surfactant material cost variance', desc: 'Margin · Raw material price hikes erode category margins · Northern Region (Baddi) affected', dismissed: false },
    { id: 'a11', sev: 'critical', sevC: '#ef4444', title: 'Packaging Supply Alert: BrandM Beverages glass bottle supplier shortage', desc: 'Supply · 20% order backlog · Southern Region (Chennai) affected', dismissed: false },
    { id: 'a12', sev: 'warning', sevC: '#f59e0b', title: 'Shelf Contraction Alert: BrandL Snacks category space reduction', desc: 'Strategy · 15% shelf contraction · Western Region (Mumbai) affected', dismissed: false },
    { id: 'a13', sev: 'critical', sevC: '#ef4444', title: 'Packaging Design Alert: BrandP Dairy carton cap transit leakages', desc: 'Execution · 4.2% product loss during shipping · Western Region (Vapi) affected', dismissed: false },
    { id: 'a14', sev: 'warning', sevC: '#f59e0b', title: 'Material Cost Alert: BrandQ Personal Care paperboard cost escalation', desc: 'Margin · 12% increase in packaging gift box costs · Southern Region (Bengaluru) affected', dismissed: false },
  ]);

  const handleDismissAlert = (id: string, title: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    addToast('Alert action logged', `Alert dismissed: "${title.substring(0, 25)}..."`, '#3b82f6');
  };

  // Decisions
  const [decisions, setDecisions] = useState(ALL_DECISIONS);

  const handleApproveDecision = (id: string, title: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, done: true } : d));
    addToast('Decision Recorded', `Approved: "${title}"`, '#10b981');
  };

  const handleDeferDecision = (id: string, title: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, done: true } : d));
    addToast('Decision Deferred', `Deferred: "${title}"`, '#f59e0b');
  };

  // Approvals
  const [approvals, setApprovals] = useState(ALL_APPROVALS);

  const handleScheduleMeeting = (id: string, title: string) => {
    setActiveApprovalMeeting(id);
  };

  const handleRemindLater = (id: string, title: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, done: true } : a));
    addToast('Reminder Set', `Snoozed. Will remind you in 2 hours for: "${title}"`, '#f59e0b');
  };

  const openEmailComposer = (to: string, name: string, subject: string, body: string, action: string = '') => {
    setComposerEmail({ to, name, subject, body, action });
    setComposerOpen(true);
  };

  // Region and Bottleneck data
  const regions = [
    { name: 'APAC', rev: '$312 M', pct: 94, delta: '+7.6%', up: true },
    { name: 'Americas', rev: '$228 M', pct: 78, delta: '−5.0%', up: false },
    { name: 'EMEA', rev: '$311 M', pct: 88, delta: '+2.0%', up: true },
  ];

  const bottlenecks = ALL_BOTTLENECKS;

  // Filtered lists for the active role's lens
  const filteredApprovals = approvals.filter(a => a.role === role && !a.done);
  const filteredBottlenecks = bottlenecks.filter(b => b.role === role);
  const filteredDecisions = decisions.filter(d => d.role === role && !d.done);

  // Chart data
  const monthlyRevenueData = [
    { name: 'Jan', Actual: 780, Target: 800 },
    { name: 'Feb', Actual: 795, Target: 812 },
    { name: 'Mar', Actual: 808, Target: 824 },
    { name: 'Apr', Actual: 821, Target: 836 },
    { name: 'May', Actual: 833, Target: 848 },
    { name: 'Jun', Actual: 843, Target: 860 },
    { name: 'Jul', Actual: 854, Target: 872 },
    { name: 'Aug', Actual: 866, Target: 884 },
    { name: 'Sep', Actual: 877, Target: 896 },
    { name: 'Oct', Actual: null, Target: 900 },
  ];

  const categoryMixData = [
    { name: 'Beverages', value: 316 },
    { name: 'Snacks', value: 253 },
    { name: 'Personal Care', value: 225 },
    { name: 'Household', value: 145 },
  ];

  const pieColors = [accentColor, '#10b981', '#8b5cf6', '#f59e0b'];

  const skuHealthData = [
    { name: 'Healthy', count: 58, color: '#10b981' },
    { name: 'At Risk', count: 31, color: '#3b82f6' },
    { name: 'Promo Dep.', count: 22, color: '#f59e0b' },
    { name: 'Declining', count: 10, color: '#ef4444' },
    { name: 'Rationalize', count: 6, color: '#6b7280' },
  ];

  const getFilteredRevenueData = () => {
    if (selectedCategory === 'all') return monthlyRevenueData;
    const factorMap: Record<string, number> = { Beverages: 0.336, Snacks: 0.269, 'Personal Care': 0.239, Household: 0.156 };
    const f = factorMap[selectedCategory] || 1;
    return monthlyRevenueData.map(d => ({
      name: d.name,
      Actual: d.Actual !== null ? Math.round(d.Actual * f * 10) / 10 : null,
      Target: Math.round(d.Target * f * 10) / 10,
    }));
  };
  const activeRevenueData = getFilteredRevenueData();

  const getFilteredSkuHealthData = () => {
    if (selectedCategory === 'all') return skuHealthData;
    const dataMap: Record<string, number[]> = {
      Beverages: [22, 10, 8, 3, 1],
      Snacks: [16, 9, 7, 3, 1],
      'Personal Care': [12, 7, 4, 2, 2],
      Household: [8, 5, 3, 2, 2],
    };
    const counts = dataMap[selectedCategory] || [0, 0, 0, 0, 0];
    return skuHealthData.map((d, idx) => ({
      ...d,
      count: counts[idx] || 0
    }));
  };
  const activeSkuHealthData = getFilteredSkuHealthData();

  const activeAlerts = alerts.filter(a => !a.dismissed);

  return (
    <div className="space-y-6">

      {/* Live KPIs - Horizontal Format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(kpis).map(([key, kpiItem]) => {
          const kpi = kpiItem as any;
          const flash = kpiFlash[key];
          const flashClass = flash === 'up' ? 'text-emerald-500 font-bold' : flash === 'dn' ? 'text-red-500 font-bold' : '';
          
          let deltaText = '';
          let deltaColor = 'text-zinc-500 dark:text-zinc-400';
          if (key === 'rev') {
            deltaText = '▲ +8.4% vs last month';
            deltaColor = 'text-emerald-500';
          } else if (key === 'orders') {
            deltaText = '▲ +12.3% vs yesterday';
            deltaColor = 'text-emerald-500';
          } else if (key === 'fcast') {
            deltaText = '▼ −2.1pp vs target';
            deltaColor = 'text-amber-500';
          } else if (key === 'skuCount') {
            deltaText = '▼ −3 SKUs rationalized';
            deltaColor = 'text-emerald-500';
          } else if (key === 'growth') {
            deltaText = '▼ −1.6pp vs target';
            deltaColor = 'text-amber-500';
          }

          return (
            <div 
              key={key} 
              onClick={() => onAuditClick?.(kpi.label)}
              className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-sm shadow-sm flex flex-col justify-between h-[115px] group cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all"
            >
              <div className="flex justify-between items-start mb-0.5">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 truncate">{kpi.label}</p>
                  <h3 className={`text-xl font-display font-extrabold text-zinc-850 dark:text-zinc-150 transition-colors duration-300 ${flashClass}`}>
                    {kpi.prefix}{kpi.val}{kpi.suffix}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[8px] uppercase font-bold text-zinc-400">Target</span>
                  <p className="text-[10px] font-bold font-mono text-zinc-550 dark:text-zinc-350 leading-none mt-0.5">{kpi.prefix}{kpi.target}{kpi.suffix}</p>
                </div>
              </div>

              {/* Sparkline chart */}
              <div className="h-[22px] my-1 opacity-85 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.hist.map((val, idx) => ({ idx, val }))} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Area 
                      type="monotone" 
                      dataKey="val" 
                      stroke={kpi.color} 
                      fill={`${kpi.color}15`} 
                      strokeWidth={1.5} 
                      dot={false} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                <span className={deltaColor}>{deltaText}</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* Quick Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 p-2 rounded-sm shadow-sm text-[9px] font-bold uppercase tracking-wider">
        <span className="text-zinc-400 dark:text-zinc-500 mr-2 uppercase tracking-widest text-[8px]">Quick Jump:</span>
        <button 
          onClick={() => scrollToSection('vp-lifecycle-health')}
          className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-350 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          📊 Lifecycle Health
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => scrollToSection('vp-action-desk')}
          className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-350 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          ⚡ {role === 'VP Product Management' ? 'Executive Action Desk' : 
              role === 'Pricing and Margin Partner' ? 'Pricing & Margin Action Desk' : 
              'Product Manager Action Desk'}
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => scrollToSection('vp-investment-map')}
          className="px-2.5 py-1 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          🎯 Investment vs. Return
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => scrollToSection('vp-rev-perf-matrix')}
          className="px-2.5 py-1 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          📈 Revenue vs. Performance Matrix
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => scrollToSection('vp-pareto-concentration')}
          className="px-2.5 py-1 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-sm cursor-pointer border-none bg-transparent font-bold outline-none"
        >
          📊 Pareto SKU Concentration
        </button>
      </div>

      {/* Filters + Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2 rounded-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2.5 py-1.5 rounded-sm">
            <Filter size={11} className="text-[#6d28d9] dark:text-[#a78bfa] shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Filters</span>
          </div>

          <select 
            value={filterRegion} 
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-650 dark:text-zinc-350 outline-none cursor-pointer"
          >
            <option value="All">All Regions</option>
            <option value="APAC">APAC</option>
            <option value="EMEA">EMEA</option>
            <option value="Americas">Americas</option>
            <option value="India">India</option>
          </select>

          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-650 dark:text-zinc-350 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Beverages">Beverages</option>
            <option value="Snacks">Snacks</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Dairy">Dairy</option>
            <option value="Household">Household</option>
            <option value="Beauty">Beauty</option>
            <option value="Fashion">Fashion</option>
          </select>

          <select 
            value={filterRisk} 
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-650 dark:text-zinc-350 outline-none cursor-pointer"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>

          <select 
            value={filterQuarter} 
            onChange={(e) => setFilterQuarter(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-650 dark:text-zinc-350 outline-none cursor-pointer"
          >
            <option value="All">All Quarters</option>
            <option value="Q2 2026">Q2 2026</option>
            <option value="Q3 2026">Q3 2026</option>
            <option value="Q4 2026">Q4 2026</option>
          </select>

          {(filterRegion !== 'All' || filterCategory !== 'All' || filterRisk !== 'All' || filterQuarter !== 'All') && (
            <button 
              onClick={() => { setFilterRegion('All'); setFilterCategory('All'); setFilterRisk('All'); setFilterQuarter('All'); }}
              className="text-[9px] text-[#6d28d9] dark:text-[#a78bfa] font-bold uppercase tracking-wider hover:underline px-1 cursor-pointer bg-transparent border-none"
            >
              Reset
            </button>
          )}
        </div>

        <button 
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider rounded-sm text-zinc-600 dark:text-zinc-400 cursor-pointer"
        >
          <Download size={11} />
          Export
        </button>
      </div>



      {/* Portfolio Health & Lifecycle Distribution */}
      <div id="vp-lifecycle-health" className="scroll-mt-16">
        <LifecycleHealthPanel skusList={filteredSKUs} isDarkMode={isDarkMode} onSelectSku={setSelectedSkuForModal} onAuditClick={onAuditClick} />
      </div>

      {/* Main Command Center Grid */}
      <div id="vp-action-desk" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-16">
        {/* LEFT COLUMN: EXECUTIVE APPROVAL BOARD */}
        <div className="space-y-6">
          {/* Executive Approval Board */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa] border-l-2 border-[#6d28d9] dark:border-[#a78bfa] pl-2">
                {role === 'VP Product Management' ? 'Executive Approval Board' : 
                 role === 'Pricing and Margin Partner' ? 'Pricing & Margin Partner Approval Board' : 
                 'Product Manager Approval Board'}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#8b5cf6] bg-[#8b5cf6]/10 px-2 py-0.5 rounded-full">{filteredApprovals.length} Pending</span>
            </div>
            
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredApprovals.length > 0 ? (
                filteredApprovals.map(a => (
                  <div 
                    key={a.id} 
                    className={`p-4 border rounded-xl flex flex-col gap-3.5 shadow-sm transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-[#202020] border-[#2c2c2c] text-white' 
                        : 'bg-white border-zinc-200 text-zinc-900'
                    }`}
                  >
                    {/* Title, Age, and Urgency Badge */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h4 className={`text-[12.5px] font-black tracking-wide leading-tight break-words ${isDarkMode ? 'text-white' : 'text-zinc-850'}`}>{a.title}</h4>
                        <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isDarkMode ? 'text-[#9d9d9d]' : 'text-zinc-450'}`}>{a.type} · Waiting {a.age}</p>
                      </div>
                      <span 
                        className={`text-[10px] font-extrabold uppercase tracking-wide px-3.5 py-0.5 rounded-full shrink-0 ${
                          a.urgency === 'high' 
                            ? 'bg-[#fde8e8] text-[#9b1c1c]' 
                            : 'bg-[#fef3c7] text-[#92400e]'
                        }`}
                      >
                        {a.urgency === 'high' ? 'High' : 'Medium'}
                      </span>
                    </div>

                    {/* Progress Bar representing waiting time */}
                    <div className={`w-full h-1 rounded-full overflow-hidden my-1 ${isDarkMode ? 'bg-[#292929]' : 'bg-black/5'}`}>
                      <div 
                        className="h-full rounded-full animate-progress" 
                        style={{ 
                          width: a.age.includes('6') ? '75%' : a.age.includes('4') ? '50%' : '25%',
                          backgroundColor: a.urgency === 'high' ? '#f05252' : '#f59e0b'
                        }} 
                      />
                    </div>

                    {/* Action buttons with icons */}
                    <div className="flex gap-2 justify-center pt-1">
                      <button 
                        onClick={() => handleScheduleMeeting(a.id, a.title)} 
                        className={`px-3.5 py-2 border rounded-lg text-[10.5px] font-bold tracking-wide transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                          isDarkMode 
                            ? 'border-blue-500/35 text-blue-400 bg-blue-500/5 hover:bg-blue-500 hover:text-white' 
                            : 'border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        <Calendar size={13} className={isDarkMode ? 'text-blue-400' : 'text-blue-500'} />
                        Schedule a meeting
                      </button>
                      <button 
                        onClick={() => handleRemindLater(a.id, a.title)} 
                        className={`px-3.5 py-2 border rounded-lg text-[10.5px] font-bold tracking-wide transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                          isDarkMode 
                            ? 'border-amber-500/35 text-amber-400 bg-amber-500/5 hover:bg-amber-500 hover:text-white' 
                            : 'border-amber-200 text-amber-600 bg-amber-50/50 hover:bg-amber-600 hover:text-white'
                        }`}
                      >
                        <Bell size={13} className={isDarkMode ? 'text-amber-400' : 'text-amber-500'} />
                        Remind me later
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[10px] text-zinc-500 font-bold py-4">All caught up</p>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: PORTFOLIO HEALTH ALERTS */}
        <div className="space-y-6">
          {/* Portfolio Health Alerts */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa] border-l-2 border-[#6d28d9] dark:border-[#a78bfa] pl-2">Portfolio Health Alerts</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">{filteredBottlenecks.filter(b => b.status === 'critical').length} Critical</span>
            </div>
            <div className="space-y-3">
              {filteredBottlenecks.map(b => (
                <div key={b.label} className="border-b border-black/[0.03] dark:border-white/[0.03] pb-2 last:border-b-0 animate-fadeIn">
                  <div 
                    className="w-full flex items-center justify-between gap-2.5 text-[11px] hover:bg-black/[0.01] dark:hover:bg-white/5 p-2 rounded-sm transition-all text-left"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate" title={b.label}>{b.label}</span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-1 max-w-[120px]">
                      <div className="flex-1 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${b.val}%`, backgroundColor: b.color }} />
                      </div>
                      <span className="text-[10px] font-bold font-mono text-right min-w-[28px]" style={{ color: b.color }}>{b.val}%</span>
                    </div>
                    <button
                      onClick={() => setActiveBottleneck(b.label)}
                      className={`px-2 py-1 border rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                        isDarkMode 
                          ? 'border-blue-500/35 text-blue-400 bg-blue-500/5 hover:bg-blue-500 hover:text-white' 
                          : 'border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>

      {/* AI Investment vs Return Margin Map */}
      <div id="vp-investment-map" className="mt-6 scroll-mt-16">
        <InvestmentMarginMap 
          skusList={SKUS} 
          isDarkMode={isDarkMode} 
          onSelectSku={setSelectedSkuForModal} 
          addToast={addToast} 
          onScheduleMeeting={(title, type) => {
            setActiveApprovalMeeting({
              id: 'dyn-inv-' + Date.now(),
              title: `Investment: ${title}`,
              type: type,
              age: '1d',
              urgency: 'high',
              done: false
            });
          }}
        />
      </div>

      {/* Revenue vs. Performance Matrix */}
      <div id="vp-rev-perf-matrix" className="mt-6 scroll-mt-16">
        <RevenuePerformanceMatrix 
          skusList={SKUS} 
          isDarkMode={isDarkMode} 
          onSelectSku={setSelectedSkuForModal} 
          addToast={addToast} 
          onScheduleMeeting={(title, type) => {
            setActiveApprovalMeeting({
              id: 'dyn-strat-' + Date.now(),
              title: `Strategy: ${title}`,
              type: type,
              age: '1d',
              urgency: 'high',
              done: false
            });
          }}
        />
      </div>

      {/* Pareto SKU Concentration */}
      <div id="vp-pareto-concentration" className="mt-6 scroll-mt-16">
        <ParetoConcentration />
      </div>

      {/* Floating Corner Toasts Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map(t => (
          <div 
            key={t.id} 
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="pointer-events-auto bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-3.5 rounded shadow-lg flex items-start gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: t.color }} />
            <div>
              <h5 className="text-[11px] font-bold text-zinc-805 dark:text-zinc-105 leading-none">{t.title}</h5>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{t.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Email Composer Modal */}
      <EmailComposerModal 
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        initialEmail={composerEmail}
        onSend={(name, email, subject, body, channel) => {
          setComposerOpen(false);
          const resolvedTitle = RECIPIENT_TITLES[email.toLowerCase()] || 'Product Manager';
          if (composerEmail.action) {
            const approval = approvals.find(x => x.id === composerEmail.action);
            const title = approval ? approval.title : '';
            setSuccessFeedback({
              isOpen: true,
              recipientName: name,
              recipientTitle: resolvedTitle,
              recipientEmail: email,
              contextType: 'approval',
              contextTitle: title,
              channel
            });
            addToast(
              'Sync Meeting Invitation Sent', 
              `Meeting invite ${channel === 'email' ? 'email' : 'message'} sent successfully to ${name} (${email}).`, 
              '#10b981'
            );
            setApprovals(prev => prev.filter(a => a.id !== composerEmail.action));
            setActiveApprovalMeeting(null);
          } else {
            setSuccessFeedback({
              isOpen: true,
              recipientName: name,
              recipientTitle: resolvedTitle,
              recipientEmail: email,
              contextType: 'bottleneck',
              contextTitle: activeBottleneck || '',
              channel
            });
            addToast(
              'Mitigation Plan Requested', 
              `Request ${channel === 'email' ? 'email' : 'message'} has been sent successfully to ${name} (${email}) regarding this concern.`, 
              '#10b981'
            );
          }
        }}
      />

      {/* Success Feedback Modal */}
      {successFeedback && (
        <SuccessFeedbackModal
          isOpen={successFeedback.isOpen}
          onClose={() => setSuccessFeedback(null)}
          recipientName={successFeedback.recipientName}
          recipientTitle={successFeedback.recipientTitle}
          recipientEmail={successFeedback.recipientEmail}
          contextType={successFeedback.contextType}
          contextTitle={successFeedback.contextTitle}
          isDarkMode={isDarkMode}
          channel={successFeedback.channel}
        />
      )}

      {/* Bottleneck Details Modal */}
      <BottleneckDetailsModal 
        isOpen={!!activeBottleneck}
        bottleneck={bottlenecks.find(x => x.label === activeBottleneck) || null}
        onClose={() => setActiveBottleneck(null)}
        onRequestAction={(email, name, subject, body) => {
          openEmailComposer(email, name, subject, body);
        }}
        onPrev={() => {
          const currentIndex = bottlenecks.findIndex(x => x.label === activeBottleneck);
          if (currentIndex > 0) {
            setActiveBottleneck(bottlenecks[currentIndex - 1].label);
          } else {
            setActiveBottleneck(bottlenecks[bottlenecks.length - 1].label);
          }
        }}
        onNext={() => {
          const currentIndex = bottlenecks.findIndex(x => x.label === activeBottleneck);
          if (currentIndex < bottlenecks.length - 1) {
            setActiveBottleneck(bottlenecks[currentIndex + 1].label);
          } else {
            setActiveBottleneck(bottlenecks[0].label);
          }
        }}
      />

      {/* Schedule Sync Meeting Modal */}
      <ScheduleMeetingModal 
        isOpen={!!activeApprovalMeeting}
        approval={
          activeApprovalMeeting && typeof activeApprovalMeeting === 'object' 
            ? activeApprovalMeeting 
            : approvals.find(x => x.id === activeApprovalMeeting) || null
        }
        onClose={() => setActiveApprovalMeeting(null)}
        onRequestAction={(email, name, subject, body) => {
          const actionId = activeApprovalMeeting && typeof activeApprovalMeeting === 'object'
            ? activeApprovalMeeting.id
            : activeApprovalMeeting || undefined;
          openEmailComposer(email, name, subject, body, actionId);
        }}
      />

      {/* SKU Details Modal */}
      <SkuDetailsModal
        isOpen={!!selectedSkuForModal}
        sku={selectedSkuForModal}
        onClose={() => {
          setSelectedSkuForModal(null);
          try {
            const hash = window.location.hash || '#';
            const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
            if (params.has('sku')) {
              params.delete('sku');
              const newHash = params.toString();
              window.history.replaceState(null, '', newHash ? '#' + newHash : ' ');
            }
          } catch (e) {
            console.warn("Could not remove sku from URL hash:", e);
          }
        }}
        onRequestAction={(email, name, subject, body) => {
          openEmailComposer(email, name, subject, body);
          setSelectedSkuForModal(null);
          try {
            const hash = window.location.hash || '#';
            const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
            if (params.has('sku')) {
              params.delete('sku');
              const newHash = params.toString();
              window.history.replaceState(null, '', newHash ? '#' + newHash : ' ');
            }
          } catch (e) {
            console.warn("Could not remove sku from URL hash:", e);
          }
        }}
      />

    </div>
  );
};

export const PortfolioHealthMap: React.FC<PortfolioHealthMapProps> = ({ 
  role, 
  isDarkMode, 
  onAuditClick, 
  timelineRange 
}) => {
  return (
    <VPCommandCenter 
      isDarkMode={isDarkMode} 
      onAuditClick={onAuditClick} 
      timelineRange={timelineRange} 
      role={role}
    />
  );
};

export const PortfolioHealthMapOld: React.FC<PortfolioHealthMapProps> = ({ 
  role, 
  isDarkMode, 
  onAuditClick, 
  timelineRange 
}) => {
  const SKUS = getFilteredSKUS(GLOBAL_SKUS, timelineRange);
  if (role === 'VP Product Management') {
    return (
      <VPCommandCenter 
        isDarkMode={isDarkMode} 
        onAuditClick={onAuditClick} 
        timelineRange={timelineRange} 
        role={role}
      />
    );
  }

  // Hash helpers for sub-tab routing
  const getSubTabHashParam = (key: string): string | null => {
    try {
      const hash = window.location.hash || '#';
      const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
      return params.get(key);
    } catch (e) {
      return null;
    }
  };

  const updateSubTabHash = (key: string, value: string) => {
    try {
      const hash = window.location.hash || '#';
      const params = new URLSearchParams(hash.substring(1));
      params.set(key, value);
      window.history.replaceState(null, '', '#' + params.toString());
    } catch (e) {
      console.warn("Could not update URL hash:", e);
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<string>(() => {
    const subParam = getSubTabHashParam('subtab');
    const validSubTabs = ['ph-kpi', 'ph-matrix', 'ph-classification', 'ph-pareto', 'ph-channel', 'ph-sim', 'ph-growth'];
    if (subParam && validSubTabs.includes(subParam)) {
      return subParam;
    }
    return 'ph-kpi';
  });

  useEffect(() => {
    updateSubTabHash('subtab', activeSubTab);
  }, [activeSubTab]);
  
  const accentColor = isDarkMode ? '#a78bfa' : '#6d28d9';
  const gridStroke = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const tooltipBg = isDarkMode ? '#1f1f1f' : '#fff';
  const tooltipBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipText = isDarkMode ? '#fff' : '#000';
  const nonAccentColor = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  
  // ─── Sub-Tab 0: KPI Filters & Recalculations ────────────────────────────────
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterMinRev, setFilterMinRev] = useState<number>(0);
  const [filteredSKUs, setFilteredSKUs] = useState(() => [...SKUS]);

  useEffect(() => {
    const res = SKUS.filter(s => {
      const matchCat = filterCat === 'all' || s.cat === filterCat;
      const matchRev = s.rev >= filterMinRev;
      return matchCat && matchRev;
    });
    setFilteredSKUs(res);
  }, [timelineRange]);

  const [selectedSkuForModal, setSelectedSkuForModal] = useState<any>(null);

  // Listen to hashchange to support subtab, category, minRev and SKU deep-linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#';
      const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
      
      const subParam = params.get('subtab');
      const validSubTabs = ['ph-kpi', 'ph-matrix', 'ph-classification', 'ph-pareto', 'ph-channel', 'ph-sim', 'ph-growth'];
      if (subParam && validSubTabs.includes(subParam)) {
        setActiveSubTab(subParam);
      }
      
      const minRevParam = params.get('minRev');
      let currentMinRev = filterMinRev;
      if (minRevParam !== null) {
        const parsedMinRev = parseFloat(minRevParam);
        if (!isNaN(parsedMinRev)) {
          setFilterMinRev(parsedMinRev);
          currentMinRev = parsedMinRev;
        }
      }
      
      const catParam = params.get('category') || params.get('filterCat');
      if (catParam) {
        const categoriesList = ['Beverages', 'Snacks', 'Personal Care', 'Dairy', 'Household', 'Beauty', 'Fashion'];
        const matched = categoriesList.find(c => c.toLowerCase() === catParam.toLowerCase());
        if (matched) {
          setFilterCat(matched);
          const res = SKUS.filter(s => s.cat === matched && s.rev >= currentMinRev);
          setFilteredSKUs(res);
        } else if (catParam.toLowerCase() === 'all') {
          setFilterCat('all');
          const res = SKUS.filter(s => s.rev >= currentMinRev);
          setFilteredSKUs(res);
        }
      }

      const skuParam = params.get('sku');
      if (skuParam) {
        const foundSku = SKUS.find(s => s.name.toLowerCase() === skuParam.toLowerCase());
        if (foundSku) {
          setSelectedSkuForModal(foundSku);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [filterMinRev]);

  // Standard view toasts state
  interface Toast {
    id: string;
    title: string;
    body: string;
    color: string;
  }
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (title: string, body: string, color: string) => {
    const id = Math.random().toString();
    setToasts(prev => [{ id, title, body, color }, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Guide accordion toggles
  const [openGuides, setOpenGuides] = useState<Record<string, boolean>>({});
  const toggleGuide = (id: string) => {
    setOpenGuides(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplyFilters = () => {
    const res = SKUS.filter(s => {
      const matchCat = filterCat === 'all' || s.cat === filterCat;
      const matchRev = s.rev >= filterMinRev;
      return matchCat && matchRev;
    });
    setFilteredSKUs(res.length ? res : [...SKUS]);
  };

  const handleResetFilters = () => {
    setFilterCat('all');
    setFilterMinRev(0);
    setFilteredSKUs([...SKUS]);
  };

  // Compute KPIs dynamically based on filtered SKUs
  const totalRev = filteredSKUs.reduce((sum, s) => sum + s.rev, 0);
  const avgMargin = filteredSKUs.reduce((sum, s) => sum + s.margin, 0) / filteredSKUs.length;
  const avgGrowth = filteredSKUs.reduce((sum, s) => sum + s.growth, 0) / filteredSKUs.length;
  const avgCx = filteredSKUs.reduce((sum, s) => sum + s.cx, 0) / filteredSKUs.length;
  const avgPromo = filteredSKUs.reduce((sum, s) => sum + s.promo, 0) / filteredSKUs.length;
  const avgLead = filteredSKUs.reduce((sum, s) => sum + s.lead, 0) / filteredSKUs.length;
  const totalStockouts = filteredSKUs.reduce((sum, s) => sum + s.stockouts, 0);
  const highValCount = filteredSKUs.filter(s => s.val >= 0.6).length;
  const pci = (avgCx * 0.8 + avgPromo * 0.5 + (avgLead / 35) * 0.4) / 1.7;

  const kpisData = [
    { label: 'Total Revenue', value: `$${Math.round(totalRev)}M`, delta: '+12%', dir: 'up', risk: false, info: 'Total portfolio net sales' },
    { label: 'Avg Gross Margin', value: `${avgMargin.toFixed(1)}%`, delta: '+1.4pp', dir: 'up', risk: false, info: 'Unweighted gross margin average' },
    { label: 'Revenue Growth', value: `${(avgGrowth * 100).toFixed(1)}%`, delta: 'YoY', dir: avgGrowth > 0 ? 'up' : 'down', risk: false, info: 'Year-over-year revenue change' },
    { label: 'Portfolio Complexity', value: pci.toFixed(3), delta: '+0.04', dir: 'up', risk: true, info: 'Portfolio Complexity Index score' },
    { label: 'Promo Dependency', value: `${(avgPromo * 100).toFixed(0)}%`, delta: '+3pp', dir: 'up', risk: true, info: 'Revenue earned during promotions' },
    { label: 'Avg Lead Time', value: `${Math.round(avgLead)}d`, delta: '+2d', dir: 'up', risk: true, info: 'Average supplier fulfillment time' },
    { label: 'Total Stockouts', value: totalStockouts, delta: 'events', dir: totalStockouts > 15 ? 'down' : 'up', risk: true, info: 'Sum of stockout incidents' },
    { label: 'High-Value SKUs', value: `${highValCount}/${filteredSKUs.length}`, delta: '', dir: 'up', risk: false, info: 'SKUs with Value Score >= 0.6' },
  ];

  // Report download trigger
  const handleGenerateReport = () => {
    const reportText = `Portfolio Report — Category: ${filterCat}\n\n` + 
      kpisData.map(k => `${k.label}: ${k.value}`).join('\n') + 
      `\n\nGenerated: ${new Date().toLocaleString()}`;
    alert(reportText);
  };

  // ─── Sub-Tab 1: Value × Complexity Matrix ──────────────────────────────────
  const [customSKU, setCustomSKU] = useState<CustomSKUType | null>(null);
  
  // Custom SKU form state
  const [custName, setCustName] = useState('Mango Fizz 750ml');
  const [custCat, setCustCat] = useState('Beverages');
  const [custRev, setCustRev] = useState(120);
  const [custMargin, setCustMargin] = useState(38);
  const [custLead, setCustLead] = useState(18);
  const [custPromo, setCustPromo] = useState(12);

  const handleAddCustomSKU = () => {
    // Normalise pricing and operations to 0-1 scores
    const normVal = (custRev / 150 * 0.4) + (custMargin / 50 * 0.4) + 0.2;
    const normCx = (custLead / 35 * 0.5) + (custPromo / 80 * 0.5);

    const newItem: CustomSKUType = {
      name: custName,
      cat: custCat,
      rev: custRev,
      margin: custMargin,
      lead: custLead,
      promo: custPromo / 100,
      val: +Math.min(1, Math.max(0, normVal)).toFixed(2),
      cx: +Math.min(1, Math.max(0, normCx)).toFixed(2),
      stockouts: 2,
      growth: 0.12
    };

    setCustomSKU(newItem);
  };

  const handleClearCustomSKU = () => {
    setCustomSKU(null);
  };

  const matrixSKUs = [...SKUS, ...(customSKU ? [customSKU] : [])];

  // Color mapping
  const categoryColors: Record<string, string> = {
    Beverages: accentColor,
    Snacks: '#0F6E56',
    'Personal Care': '#185FA5',
    Household: '#854F0B',
    Custom: '#ED93B1',
    Beauty: '#EC4899',
    Fashion: '#F97316'
  };

  // Map data for Scatter Top SKUs in Sub-Tab 0
  const scatterData = filteredSKUs.map(s => ({
    name: s.name,
    cx: s.cx,
    val: s.val,
    rev: s.rev,
    cat: s.cat,
    fill: categoryColors[s.cat] || '#888'
  }));

  // Map data for Quadrant Scatter in Sub-Tab 1
  const matrixScatterData = matrixSKUs.map(s => {
    const isCustom = customSKU && s.name === customSKU.name;
    return {
      name: s.name,
      cx: s.cx,
      val: s.val,
      rev: s.rev,
      cat: isCustom ? 'Custom' : s.cat,
      fill: isCustom ? categoryColors.Custom : (categoryColors[s.cat] || '#888')
    };
  });

  // ─── Sub-Tab 2: Revenue Pareto Analysis ─────────────────────────────────────
  const [paretoThreshold, setParetoThreshold] = useState<number>(80);
  
  // Sort SKUs by revenue descending
  const sortedSKUs = [...SKUS].sort((a, b) => b.rev - a.rev);
  const paretoTotal = sortedSKUs.reduce((sum, s) => sum + s.rev, 0);
  
  let runningSum = 0;
  const paretoData = sortedSKUs.map((s, idx) => {
    runningSum += s.rev;
    const cumPct = Math.round((runningSum / paretoTotal) * 100);
    return {
      name: s.name.split(' ')[0], // short name
      fullName: s.name,
      Revenue: s.rev,
      Cumulative: cumPct,
      index: idx + 1
    };
  });

  // Find how many SKUs are needed to cross the threshold
  let crossIdx = 0;
  let runningPct = 0;
  for (let i = 0; i < sortedSKUs.length; i++) {
    runningPct += sortedSKUs[i].rev;
    if ((runningPct / paretoTotal) * 100 >= paretoThreshold) {
      crossIdx = i + 1;
      break;
    }
  }

  // ─── Sub-Tab 3: Channel Performance ─────────────────────────────────────────
  const [channelFilterCat, setChannelFilterCat] = useState<string>('all');
  
  const channelDataMap = [
    { name: 'Modern Trade', Beverages: 120, Snacks: 85, 'Personal Care': 90, Household: 45 },
    { name: 'E-Commerce', Beverages: 95, Snacks: 110, 'Personal Care': 95, Household: 50 },
    { name: 'General Trade', Beverages: 60, Snacks: 45, 'Personal Care': 30, Household: 35 },
    { name: 'Pharmacy', Beverages: 10, Snacks: 5, 'Personal Care': 62, Household: 25 },
    { name: 'D2C', Beverages: 31, Snacks: 8, 'Personal Care': 28, Household: 28 },
  ];

  // Calculate values for channels based on category filter
  const channelComputedData = channelDataMap.map(ch => {
    let value = 0;
    if (channelFilterCat === 'all') {
      value = ch.Beverages + ch.Snacks + ch['Personal Care'] + ch.Household;
    } else {
      value = ch[channelFilterCat as keyof typeof ch] as number || 0;
    }
    return { name: ch.name, Revenue: value };
  });

  const totalChannelRev = channelComputedData.reduce((sum, c) => sum + c.Revenue, 0);
  const pieData = channelComputedData.map(c => ({
    name: c.name,
    value: c.Revenue,
    pct: Math.round((c.Revenue / totalChannelRev) * 100)
  }));

  const pieColors = [accentColor, '#0F6E56', '#185FA5', '#854F0B', '#ED93B1'];

  // ─── Sub-Tab 4: Rationalization Simulator ───────────────────────────────
  const [cxT, setCxT] = useState<number>(0.60);
  const [revF, setRevF] = useState<number>(20);
  const [transfer, setTransfer] = useState<number>(40);
  const [opsRate, setOpsRate] = useState<number>(28);

  const candidates = SKUS.filter(s => s.cx >= cxT && s.rev <= revF);
  const simTotalRev = SKUS.reduce((sum, s) => sum + s.rev, 0);
  const simCandRev = candidates.reduce((sum, s) => sum + s.rev, 0);
  const simRevAtRisk = Math.round(simCandRev * (1 - transfer / 100));
  const simOpsSaving = Math.round(simCandRev * (opsRate / 100));
  
  const sumCx = SKUS.reduce((sum, s) => sum + s.cx, 0);
  const candCx = candidates.reduce((sum, s) => sum + s.cx, 0);
  const simNewPCI = ((sumCx - candCx) / (SKUS.length - candidates.length || 1)).toFixed(3);
  const simBasePCI = (sumCx / SKUS.length).toFixed(3);

  const simNetRevAfter = simTotalRev - simRevAtRisk;
  const simNetPortfolio = simNetRevAfter + simOpsSaving;

  const simWaterfallData = [
    { name: 'Portfolio Revenue', bottom: 0, value: simTotalRev, displayVal: simTotalRev, color: accentColor },
    { name: 'Revenue at Risk', bottom: Math.min(simTotalRev, simNetRevAfter), value: simRevAtRisk, displayVal: -simRevAtRisk, color: '#A32D2D' },
    { name: 'Ops Savings', bottom: Math.min(simNetRevAfter, simNetPortfolio), value: simOpsSaving, displayVal: simOpsSaving, color: '#0F6E56' },
    { name: 'Net Portfolio', bottom: 0, value: simNetPortfolio, displayVal: simNetPortfolio, color: accentColor }
  ];

  const handleExportCSV = () => {
    const csvContent = "SKU,Category,Revenue,Complexity,Stockouts\n" + 
      candidates.map(s => `${s.name},${s.cat},${s.rev},${s.cx},${s.stockouts}`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rationalization_candidates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header Banner */}
      <div className="glass-card bg-acies-gray text-white py-5 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 pointer-events-none">
          <Layers size={100} />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex-1 pr-4">
            <p className="text-[9px] uppercase font-bold tracking-widest opacity-40 mb-2">Interactive Explorer</p>
            <h2 className="text-xl font-display font-medium text-white mb-2">Portfolio Health Map</h2>
            <p className="text-xs text-zinc-300 font-medium max-w-xl leading-relaxed">
              Analyze SKU value, complexity, and operational fragility. Click the sub-tabs below to explore quadrant matrices, pareto analysis, channel mixes, and Sunset simulations.
            </p>
          </div>
          
          <div className="flex flex-wrap lg:flex-nowrap gap-px shrink-0 bg-white/5 p-1 rounded-sm">
            {[
              { label: 'Safety Capital Released', value: '$42.2 M', sub: 'Optimized tail reduction target' },
              { label: 'Tail Burden Ratio', value: '66.7%', sub: 'SKUs driving <1% sales aggregate' },
              { label: 'Max Revenue Risk', value: '27.08%', sub: 'EBITDA impact if all candidates rationalized' },
            ].map((stat, i) => (
              <div key={i} className="pl-4 pr-5 py-2 min-w-[140px] border-r border-white/5 last:border-none">
                <p className="text-[8px] opacity-40 uppercase font-bold mb-0.5">{stat.label}</p>
                <p className="text-sm font-display text-acies-yellow leading-none mb-1">{stat.value}</p>
                <p className="text-[7.5px] opacity-35 leading-snug">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Tab Rows Navigation */}
      <div className="flex flex-wrap border-b border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-2">
        {[
          { id: 'ph-kpi', label: 'KPI Overview' },
          { id: 'ph-matrix', label: 'Value × Complexity' },
          { id: 'ph-classification', label: 'Revenue vs Performance' },
          { id: 'ph-pareto', label: 'Revenue Analysis' },
          { id: 'ph-channel', label: 'Channel Performance' },
          { id: 'ph-sim', label: 'Rationalization Sim' },
          { id: 'ph-growth', label: 'Investment vs Margin' },
        ].map(st => (
          <button
            key={st.id}
            onClick={() => setActiveSubTab(st.id)}
            className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer border-b-2 transition-all hover:text-acies-yellow ${
              activeSubTab === st.id 
                ? 'border-acies-yellow text-acies-yellow font-bold' 
                : 'border-transparent text-zinc-400 dark:text-zinc-400 hover:border-zinc-400'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          SUB-TAB 0: KPI OVERVIEW 
          ──────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'ph-kpi' && (
        <div className="space-y-6">
          
          {/* How to read accordion */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4">
            <button 
              onClick={() => toggleGuide('kpi')}
              className="w-full text-left font-bold text-xs uppercase tracking-widest text-acies-yellow flex justify-between items-center cursor-pointer border-none bg-transparent"
            >
              <span>📖 How to read this tab</span>
              <span className="text-[10px]">{openGuides.kpi ? '✕ Collapse' : '▲ Expand'}</span>
            </button>
            
            {openGuides.kpi && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-black/5 dark:border-white/5 mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">1. Understand the KPI strip</h4>
                  <p>8 headline metrics at the top. Green ▲ = healthy improvement. Red ▲ = rising risk (complexity, stockouts). Each card updates live.</p>
                </div>
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">2. Filter dynamically</h4>
                  <p>Use the form to narrow by category, or minimum revenue. The entire dashboard recalculates instantly. Try category selection to verify.</p>
                </div>
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">3. Identify risk signals</h4>
                  <p>Portfolio Complexity Index &gt; 0.55 and Promo Dependency &gt; 40% are red flags. High stockout counts indicate supply fragility.</p>
                </div>
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">4. Export insights</h4>
                  <p>Click "Generate Report" to create a summary of current filters. Use this for weekly decks or stakeholder updates.</p>
                </div>
              </div>
            )}
          </div>

          {/* Filters Form */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Filter size={12} />
              Filter Portfolio View
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">Category</label>
                <select 
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-2 text-xs font-semibold text-acies-gray dark:text-white outline-none"
                >
                  <option value="all">All Categories</option>
                  <option>Beverages</option>
                  <option>Snacks</option>
                  <option>Personal Care</option>
                  <option>Household</option>
                  <option>Beauty</option>
                  <option>Fashion</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">Min Revenue ($ M)</label>
                <input 
                  type="number" 
                  value={filterMinRev}
                  onChange={(e) => setFilterMinRev(parseFloat(e.target.value) || 0)}
                  min="0"
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-2 text-xs font-semibold text-acies-gray dark:text-white outline-none"
                />
              </div>
              <div className="flex items-end gap-2">
                <button 
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-2 bg-acies-gray text-white text-[9px] font-bold uppercase tracking-widest hover:bg-acies-yellow hover:text-acies-gray transition-all cursor-pointer border-none"
                >
                  Apply Filters
                </button>
                <button 
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-black/10 dark:border-white/10 text-zinc-500 text-[9px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Reset
                </button>
                <button 
                  onClick={handleGenerateReport}
                  className="px-4 py-2 border border-black/10 dark:border-white/10 text-acies-yellow text-[9px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Report
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic KPI Strip (8 cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpisData.map((k, i) => {
              const roleHighlight = role === 'VP Product Management' && (i === 0 || i === 3);
              const highlightBorder = roleHighlight ? 'border-2 border-acies-yellow shadow-lg shadow-acies-yellow/5' : 'border-black/5 dark:border-white/10';
              return (
                <div 
                  key={k.label} 
                  onClick={() => onAuditClick?.(k.label)}
                  className={`glass-card bg-white dark:bg-white/5 border ${highlightBorder} p-4 flex flex-col justify-between h-28 cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all`}
                >
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 flex items-center justify-between">
                      {k.label}
                      <span className="text-zinc-500 cursor-pointer" title={k.info}><Info size={10} /></span>
                    </p>
                    <h3 className="text-xl font-display font-bold text-acies-gray dark:text-white mt-1.5">{k.value}</h3>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <span className={k.risk ? 'text-red-500' : 'text-green-500'}>
                      {k.dir === 'up' ? '▲' : '▼'} {k.delta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Portfolio Health & Lifecycle Distribution */}
          <LifecycleHealthPanel skusList={filteredSKUs} isDarkMode={isDarkMode} onSelectSku={setSelectedSkuForModal} />

          {/* Revenue vs Complexity Scatter chart */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5">
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest">Top SKU Performance — Revenue vs Complexity</h3>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">Bubble size = revenue. Hover any bubble for details.</p>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis type="number" dataKey="cx" name="Complexity" domain={[0, 1]} tick={{ fill: tickColor, fontSize: 9 }} label={{ value: 'Complexity →', position: 'bottom', fill: tickColor, fontSize: 10, offset: 5 }} />
                  <YAxis type="number" dataKey="val" name="Value" domain={[0, 1]} tick={{ fill: tickColor, fontSize: 9 }} label={{ value: '← Value', angle: -90, position: 'left', fill: tickColor, fontSize: 10, offset: 5 }} />
                  <ZAxis type="number" dataKey="rev" range={[50, 450]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                    itemStyle={{ fontSize: 11 }}
                    labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
                    formatter={(value: any, name: any, props: any) => {
                      if (name === 'Revenue') return [`$${value}M`, 'Revenue'];
                      return [value, name];
                    }}
                  />
                  <Scatter data={scatterData} fill="#8884d8">
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="name" position="top" style={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8, pointerEvents: 'none' }} />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          SUB-TAB 1: VALUE × COMPLEXITY MATRIX
          ──────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'ph-matrix' && (
        <div className="space-y-6">
          
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4">
            <button 
              onClick={() => toggleGuide('matrix')}
              className="w-full text-left font-bold text-xs uppercase tracking-widest text-acies-yellow flex justify-between items-center cursor-pointer border-none bg-transparent"
            >
              <span>📖 How to read this matrix</span>
              <span className="text-[10px]">{openGuides.matrix ? '✕ Collapse' : '▲ Expand'}</span>
            </button>
            
            {openGuides.matrix && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-black/5 dark:border-white/5 mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">1. Understand the axes</h4>
                  <p>X-axis = Operational Complexity (supply chain friction). Y-axis = Commercial Value (revenue + margin + growth). Both 0–1 normalized.</p>
                </div>
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">2. Read the quadrants</h4>
                  <p><strong>Keep</strong> (top-left) = high value, low complexity. <strong>Grow</strong> (top-right) = high value, high complexity. <strong>Consolidate</strong> (bottom-left) = low value, low complexity. <strong>Rationalize</strong> (bottom-right) = low value, high complexity.</p>
                </div>
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">3. Plot custom scenarios</h4>
                  <p>Type in a new SKU brief parameters (revenue, margin, lead times) and click plot. Verify its positioning as a pink bubble inside a quadrant.</p>
                </div>
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">4. Segment candidates</h4>
                  <p>SKUs inside the bottom-right quadrant are severe resource sinks. These are Sunset/rationalization priority candidates.</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Custom SKUbrief Plotting Form */}
            <div className="lg:col-span-4 flex flex-col justify-between glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Plus size={12} />
                  Add Custom SKU brief
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">SKU Name</label>
                    <input 
                      type="text" 
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-xs text-acies-gray dark:text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Category</label>
                    <select 
                      value={custCat}
                      onChange={(e) => setCustCat(e.target.value)}
                      className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-xs text-acies-gray dark:text-white outline-none"
                    >
                      <option>Beverages</option>
                      <option>Snacks</option>
                      <option>Personal Care</option>
                      <option>Household</option>
                      <option>Beauty</option>
                      <option>Fashion</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Projected Revenue ($ M)</label>
                    <input 
                      type="number" 
                      value={custRev}
                      onChange={(e) => setCustRev(parseInt(e.target.value) || 0)}
                      className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-xs text-acies-gray dark:text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Gross Margin %</label>
                    <input 
                      type="number" 
                      value={custMargin}
                      onChange={(e) => setCustMargin(parseInt(e.target.value) || 0)}
                      className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-xs text-acies-gray dark:text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Lead Time (days)</label>
                    <input 
                      type="number" 
                      value={custLead}
                      onChange={(e) => setCustLead(parseInt(e.target.value) || 0)}
                      className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-xs text-acies-gray dark:text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Promo Budget %</label>
                    <input 
                      type="number" 
                      value={custPromo}
                      onChange={(e) => setCustPromo(parseInt(e.target.value) || 0)}
                      className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-xs text-acies-gray dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                <button 
                  onClick={handleAddCustomSKU}
                  className="flex-1 px-4 py-2 bg-acies-gray text-white text-[9px] font-bold uppercase tracking-widest hover:bg-acies-yellow hover:text-acies-gray transition-all cursor-pointer border-none"
                >
                  Plot SKU
                </button>
                {customSKU && (
                  <button 
                    onClick={handleClearCustomSKU}
                    className="p-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer rounded-sm"
                    title="Remove custom SKU"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Quadrant Map */}
            <div className="lg:col-span-8 glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 relative">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Value × Complexity Matrix Map</h3>
              
              {/* Labels for Quadrants overlaid inside the chart block visually */}
              <div className="absolute top-16 left-12 opacity-25 text-[10px] font-bold uppercase tracking-widest text-green-500 pointer-events-none">Keep (High Val / Easy Ops)</div>
              <div className="absolute top-16 right-8 opacity-25 text-[10px] font-bold uppercase tracking-widest text-blue-500 pointer-events-none">Grow (High Val / Complex Ops)</div>
              <div className="absolute bottom-12 left-12 opacity-25 text-[10px] font-bold uppercase tracking-widest text-amber-500 pointer-events-none">Consolidate (Low Val / Easy Ops)</div>
              <div className="absolute bottom-12 right-8 opacity-25 text-[10px] font-bold uppercase tracking-widest text-red-500 pointer-events-none">Rationalize (Low Val / Complex Ops)</div>

              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis type="number" dataKey="cx" name="Complexity" domain={[0, 1]} tick={{ fill: tickColor, fontSize: 9 }} label={{ value: 'Complexity →', position: 'bottom', fill: tickColor, fontSize: 10 }} />
                    <YAxis type="number" dataKey="val" name="Value" domain={[0, 1]} tick={{ fill: tickColor, fontSize: 9 }} label={{ value: '← Value', angle: -90, position: 'left', fill: tickColor, fontSize: 10 }} />
                    <ZAxis type="number" dataKey="rev" range={[60, 450]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                      itemStyle={{ fontSize: 11 }}
                      labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
                      formatter={(value: any, name: any) => {
                        if (name === 'Revenue') return [`$${value}M`, 'Revenue'];
                        return [value, name];
                      }}
                    />
                    <Scatter data={matrixScatterData}>
                      {matrixScatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="name" position="top" style={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8, pointerEvents: 'none' }} />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          SUB-TAB: REVENUE VS PERFORMANCE MATRIX
          ──────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'ph-classification' && (
        <div className="space-y-6">
          <RevenuePerformanceMatrix 
            skusList={filteredSKUs} 
            isDarkMode={isDarkMode} 
            onSelectSku={setSelectedSkuForModal} 
            addToast={addToast} 
          />
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          SUB-TAB 2: REVENUE PARETO ANALYSIS
          ──────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'ph-pareto' && (
        <div className="space-y-6">
          
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-1">Pareto Concentration Analysis</h3>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Understand revenue concentration across your SKUs</p>
            
            {/* Pareto Slider */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
              <div className="md:col-span-3 flex flex-col gap-2 justify-center">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span>Pareto Revenue Cut-Off Threshold</span>
                  <span className="text-acies-yellow font-extrabold">{paretoThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={paretoThreshold}
                  onChange={(e) => setParetoThreshold(parseInt(e.target.value) || 80)}
                  className="w-full accent-acies-yellow cursor-pointer h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"
                />
              </div>
              <div className="flex flex-col justify-center items-center p-3 bg-acies-gray text-white text-center rounded-sm">
                <p className="text-[8px] font-bold opacity-45 uppercase tracking-widest mb-1">Current Diagnosis</p>
                <h4 className="text-xl font-display font-bold text-acies-yellow">{crossIdx} SKUs</h4>
                <p className="text-[8.5px] opacity-40 uppercase font-extrabold mt-0.5">drive {paretoThreshold}% of revenue</p>
              </div>
            </div>

            {/* Recharts Pareto Chart */}
            <div className="h-96 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 20, right: -5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: tickColor, fontSize: 9 }} label={{ value: 'Revenue ($ M)', angle: -90, position: 'insideLeft', fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: tickColor, fontSize: 9 }} label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                    itemStyle={{ fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  
                  {/* Bars for individual revenues */}
                  <Bar yAxisId="left" dataKey="Revenue" fill={accentColor} barSize={16}>
                    {paretoData.map((entry, index) => {
                      const isHighValue = index < crossIdx;
                      return <Cell key={`cell-${index}`} fill={isHighValue ? accentColor : nonAccentColor} />;
                    })}
                  </Bar>
                  
                  {/* Line overlay for cumulative percentage */}
                  <Line yAxisId="right" type="monotone" dataKey="Cumulative" stroke="#0F6E56" strokeWidth={2} dot={{ r: 3, fill: '#0F6E56' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          SUB-TAB 3: CHANNEL PERFORMANCE
          ──────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'ph-channel' && (
        <div className="space-y-6">
          
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-black/5 dark:border-white/5 mb-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest">Multi-Channel Revenue Performance</h3>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">Slicing retail revenues across Modern Trade, E-Commerce, General Trade, Pharmacy, and D2C</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold opacity-45 uppercase">Select Category:</span>
                <select 
                  value={channelFilterCat}
                  onChange={(e) => setChannelFilterCat(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-xs text-acies-gray dark:text-white outline-none"
                >
                  <option value="all">All Categories</option>
                  <option>Beverages</option>
                  <option>Snacks</option>
                  <option>Personal Care</option>
                  <option>Household</option>
                  <option>Beauty</option>
                  <option>Fashion</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Channel Revenues Bar chart */}
              <div className="lg:col-span-8">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Revenue Breakdown by Channel</h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={channelComputedData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: tickColor, fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                        itemStyle={{ fontSize: 11 }}
                      />
                      <Bar dataKey="Revenue" fill="#185FA5" barSize={28}>
                        {channelComputedData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Channel Mix Pie chart */}
              <div className="lg:col-span-4 flex flex-col justify-center items-center border-l border-black/5 dark:border-white/5 pl-6">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Channel Revenue Share</h4>
                <div className="w-full h-48 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie 
                        data={pieData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={80} 
                        paddingAngle={3}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}M`} />
                    </RePieChart>
                  </ResponsiveContainer>
                  
                  {/* Center revenue label */}
                  <div className="absolute text-center">
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 leading-none mb-1">Total</p>
                    <p className="text-base font-display font-extrabold text-acies-gray dark:text-white leading-none">${totalChannelRev}M</p>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 mt-4 text-[9px] font-extrabold uppercase tracking-wider">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                      <span className="truncate opacity-75">{d.name}:</span>
                      <span className="text-acies-yellow">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          SUB-TAB 4: RATIONALIZATION SIMULATOR
          ──────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'ph-sim' && (
        <div className="space-y-6">
          
          {/* How to read guide */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4">
            <button 
              onClick={() => toggleGuide('sim')}
              className="w-full text-left font-bold text-xs uppercase tracking-widest text-acies-yellow flex justify-between items-center cursor-pointer border-none bg-transparent"
            >
              <span>📖 Using the simulator</span>
              <span className="text-[10px]">{openGuides.sim ? '✕ Collapse' : '▲ Expand'}</span>
            </button>
            
            {openGuides.sim && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-black/5 dark:border-white/5 mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">1. Set criteria</h4>
                  <p>Define complexity threshold and revenue floor. SKUs above complexity AND below revenue floor are rationalization candidates.</p>
                </div>
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">2. Model the impact</h4>
                  <p>The sim calculates: candidates count, revenue at risk (after transfer), ops savings, and new portfolio Complexity Index.</p>
                </div>
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">3. Demand transfer rate</h4>
                  <p>Adjust the slider to model how much revenue transfers to remaining SKUs. 40% transfer means 60% of revenue truly lost.</p>
                </div>
                <div>
                  <h4 className="font-bold text-acies-gray dark:text-white mb-1.5">4. Export candidates</h4>
                  <p>Click "Export List" to download a CSV of rationalization candidates for further offline audit.</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Control Sliders Panel */}
            <div className="lg:col-span-5 glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <RefreshCw size={12} className="animate-spin-slow text-acies-yellow" />
                Configure Simulator Parameters
              </h3>
              
              {/* Slider 1: Complexity Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span>Complexity Threshold</span>
                  <span className="text-acies-yellow font-extrabold">{cxT.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.3" 
                  max="0.9" 
                  step="0.05"
                  value={cxT}
                  onChange={(e) => setCxT(parseFloat(e.target.value) || 0)}
                  className="w-full accent-acies-yellow cursor-pointer h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"
                />
                <p className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider">SKUs above this operational complexity level are candidates</p>
              </div>

              {/* Slider 2: Revenue Floor */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span>Revenue Floor ($ M)</span>
                  <span className="text-acies-yellow font-extrabold">${revF}M</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="80" 
                  step="5"
                  value={revF}
                  onChange={(e) => setRevF(parseInt(e.target.value) || 0)}
                  className="w-full accent-acies-yellow cursor-pointer h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"
                />
                <p className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider">SKUs with revenue below this level are candidates</p>
              </div>

              {/* Slider 3: Demand Transfer Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span>Demand Transfer Rate</span>
                  <span className="text-acies-yellow font-extrabold">{transfer}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="80" 
                  step="5"
                  value={transfer}
                  onChange={(e) => setTransfer(parseInt(e.target.value) || 0)}
                  className="w-full accent-acies-yellow cursor-pointer h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"
                />
                <p className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider">% of candidate revenue salvaged by transfers to remaining SKUs</p>
              </div>

              {/* Slider 4: Ops Savings Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span>Ops Savings Rate</span>
                  <span className="text-acies-yellow font-extrabold">{opsRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="50" 
                  step="2"
                  value={opsRate}
                  onChange={(e) => setOpsRate(parseInt(e.target.value) || 0)}
                  className="w-full accent-acies-yellow cursor-pointer h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"
                />
                <p className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider">Supplier overhead reduction realized per rationalized SKU</p>
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/5 flex gap-2">
                <button 
                  onClick={handleExportCSV}
                  className="w-full py-2 bg-acies-gray text-white text-[9px] font-bold uppercase tracking-widest hover:bg-acies-yellow hover:text-acies-gray transition-all cursor-pointer rounded-sm border-none flex items-center justify-center gap-1"
                >
                  📤 Export Candidate List
                </button>
                <button 
                  onClick={() => {
                    setCxT(0.60);
                    setRevF(20);
                    setTransfer(40);
                    setOpsRate(28);
                  }}
                  className="w-32 py-2 border border-black/10 dark:border-white/10 text-zinc-500 text-[9px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer rounded-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Simulated Results Dashboard */}
            <div className="lg:col-span-7 glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Simulation Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Card 1: Candidates count */}
                  <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm relative">
                    <span className="absolute top-3 right-3 text-[9px] text-zinc-500 font-bold">Sunset</span>
                    <p className="text-[8px] font-bold uppercase opacity-45 tracking-widest mb-1.5">Candidates</p>
                    <h4 className="text-xl font-display font-bold text-red-500">{candidates.length} SKUs</h4>
                    <p className="text-[8px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase mt-1">To rationalize from 12 portfolio items</p>
                  </div>

                  {/* Card 2: Revenue at Risk */}
                  <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm relative">
                    <span className="absolute top-3 right-3 text-[9px] text-zinc-500 font-bold">Risk</span>
                    <p className="text-[8px] font-bold uppercase opacity-45 tracking-widest mb-1.5">Revenue at Risk</p>
                    <h4 className="text-xl font-display font-bold text-amber-500">${simRevAtRisk}M</h4>
                    <p className="text-[8px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase mt-1">Unsalvaged net revenue after transfer</p>
                  </div>

                  {/* Card 3: Ops Savings */}
                  <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm relative">
                    <span className="absolute top-3 right-3 text-[9px] text-zinc-500 font-bold">Savings</span>
                    <p className="text-[8px] font-bold uppercase opacity-45 tracking-widest mb-1.5">Ops Savings</p>
                    <h4 className="text-xl font-display font-bold text-green-500">${simOpsSaving}M</h4>
                    <p className="text-[8px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase mt-1">Released supplier admin burden</p>
                  </div>

                  {/* Card 4: New Complexity Index (PCI) */}
                  <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm relative">
                    <span className="absolute top-3 right-3 text-[9px] text-zinc-500 font-bold">Complexity</span>
                    <p className="text-[8px] font-bold uppercase opacity-45 tracking-widest mb-1.5">New Portfolio PCI</p>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-xl font-display font-bold text-blue-500">{simNewPCI}</h4>
                      <span className="text-[9px] opacity-40 font-bold line-through">{simBasePCI}</span>
                    </div>
                    <p className="text-[8px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase mt-1">Complexity target is ≤ 0.420</p>
                  </div>

                </div>
              </div>

              {/* Action alert suggestion */}
              <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-2">
                <Zap size={14} className="stroke-[2.5] text-acies-yellow fill-acies-yellow" />
                Candidates represent {Math.round(simCandRev / (simTotalRev || 1) * 100)}% of total portfolio sales. Sunset review recommended.
              </div>

            </div>

          </div>

          {/* Waterfall Chart */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-1">Impact Waterfall</h3>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-4">Revenue before/after rationalization + ops savings recovery</p>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simWaterfallData} margin={{ top: 25, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tickColor, fontSize: 9 }} label={{ value: '$ Million', angle: -90, position: 'insideLeft', fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                    itemStyle={{ fontSize: 11 }}
                    formatter={(value: any, name: any, props: any) => {
                      return [`$${props.payload.displayVal}M`, 'Value'];
                    }}
                  />
                  <Bar dataKey="bottom" stackId="sim-wfall" fill="transparent" />
                  <Bar dataKey="value" stackId="sim-wfall" radius={2}>
                    {simWaterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Candidates List Table */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Rationalization Candidates List</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 text-[9px] uppercase tracking-widest font-extrabold opacity-40 h-8">
                    <th className="pb-2">SKU Name</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">Revenue</th>
                    <th className="pb-2 text-right">Complexity</th>
                    <th className="pb-2 text-right">Stockouts</th>
                    <th className="pb-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold">
                  {candidates.length > 0 ? (
                    candidates.map((s, idx) => (
                      <tr key={idx} className="h-10 hover:bg-black/[0.01] dark:hover:bg-white/[0.02]">
                        <td className="text-acies-gray dark:text-white font-bold">{s.name}</td>
                        <td>{s.cat}</td>
                        <td className="text-right">${s.rev}M</td>
                        <td className="text-right text-red-500 font-extrabold">{s.cx.toFixed(2)}</td>
                        <td className="text-right">{s.stockouts}</td>
                        <td className="text-center">
                          <span className="text-[8px] font-extrabold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-sm">
                            Rationalize
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-6 font-bold text-zinc-500 uppercase">
                        No candidates at current thresholds
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          SUB-TAB 5: INVESTMENT VS RETURN MARGIN
          ──────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'ph-growth' && (
        <div className="space-y-6">
          <InvestmentMarginMap 
            skusList={filteredSKUs} 
            isDarkMode={isDarkMode} 
            onSelectSku={setSelectedSkuForModal} 
            addToast={addToast} 
          />
        </div>
      )}

      {/* Floating Corner Toasts Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map(t => (
          <div 
            key={t.id} 
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="pointer-events-auto bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-3.5 rounded shadow-lg flex items-start gap-2.5 cursor-pointer hover:opacity-90 transition-opacity animate-fadeIn"
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: t.color }} />
            <div>
              <h5 className="text-[11px] font-bold text-zinc-850 dark:text-zinc-100 leading-none">{t.title}</h5>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{t.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SKU Details Modal */}
      <SkuDetailsModal
        isOpen={!!selectedSkuForModal}
        sku={selectedSkuForModal}
        onClose={() => {
          setSelectedSkuForModal(null);
          try {
            const hash = window.location.hash || '#';
            const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
            if (params.has('sku')) {
              params.delete('sku');
              const newHash = params.toString();
              window.history.replaceState(null, '', newHash ? '#' + newHash : ' ');
            }
          } catch (e) {
            console.warn("Could not remove sku from URL hash:", e);
          }
        }}
        onRequestAction={(email, name, subject, body) => {
          addToast(
            'Action Plan Request Logged',
            `Mitigation action plan request successfully logged and sent to ${name} (${email}).`,
            '#10b981'
          );
          setSelectedSkuForModal(null);
          try {
            const hash = window.location.hash || '#';
            const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
            if (params.has('sku')) {
              params.delete('sku');
              const newHash = params.toString();
              window.history.replaceState(null, '', newHash ? '#' + newHash : ' ');
            }
          } catch (e) {
            console.warn("Could not remove sku from URL hash:", e);
          }
        }}
      />

    </div>
  );
};
