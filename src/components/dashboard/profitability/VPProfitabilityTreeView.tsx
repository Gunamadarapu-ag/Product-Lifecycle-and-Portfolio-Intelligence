/**
 * VP lens for the Profitability Tree.
 *
 * Extracted from ProfitabilityTree.tsx (2,081 lines).
 */
import React, { useState } from 'react';
import { TrendingUp, HelpCircle, Award, AlertTriangle, Sparkles, RefreshCw, Package, FileText, ArrowUpRight, ArrowLeft, MapPin, Workflow, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Line, Legend, ComposedChart } from 'recharts';
import { ForecastAccuracySimulator } from './ForecastAccuracySimulator';
import { MarginSimulator } from './MarginSimulator';
import { TimelineRange, getTimeframeScale, getDeterministicNoise, getAdjustedMargin, getAdjustedPci } from '../../../utils/timeframe';
import { chartDatum } from '../../../utils/rechartsCompat';
import { getChartTheme } from '../../../utils/chartTheme';
import { ModalShell } from '../../common/Modal';
import { Scenario } from './profitabilityData';

export const CustomContributorTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-[#181822] p-3 border border-black/10 dark:border-white/10 rounded-lg shadow-lg text-[11px] font-sans">
        <p className="font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">{data.rank}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#6366f1]" />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{data.catName}</span>
            </div>
            <span className="font-bold text-zinc-900 dark:text-white">${data.catVal}M</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{data.brandName}</span>
            </div>
            <span className="font-bold text-zinc-900 dark:text-white">${data.brandVal}M</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const VPProfitabilityTreeView: React.FC<{ 
  isDarkMode: boolean;
  isSimulatorOpen?: boolean;
  setIsSimulatorOpen?: (open: boolean) => void;
  onAuditClick?: (metric: string | null) => void;
  timelineRange: TimelineRange;
}> = ({ isDarkMode, isSimulatorOpen, setIsSimulatorOpen, onAuditClick, timelineRange }) => {
  const accentColor = isDarkMode ? '#a78bfa' : '#6d28d9';
  const { gridStroke, tickColor, tooltipBg, tooltipBorder, tooltipText } = getChartTheme(isDarkMode);


  const [showForecastSimulatorLocal, setShowForecastSimulatorLocal] = useState<boolean>(false);
  const showForecastSimulator = setIsSimulatorOpen ? (isSimulatorOpen ?? false) : showForecastSimulatorLocal;
  const setShowForecastSimulator = setIsSimulatorOpen ? setIsSimulatorOpen : setShowForecastSimulatorLocal;
  const [simRawMaterial, setSimRawMaterial] = useState<number>(0);
  const [simPriceChange, setSimPriceChange] = useState<number>(0);
  const [simPromoCut, setSimPromoCut] = useState<number>(0);
  const [selectedCell, setSelectedCell] = useState<{ category: string; month: string; val: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [trendHorizon, setTrendHorizon] = useState<'months' | 'weeks' | 'years'>('months');
  const [contributorTab, setContributorTab] = useState<'category' | 'brand'>('category');
  const [selectedDetail, setSelectedDetail] = useState<{ type: 'category' | 'brand'; name: string; value: number; percent: number } | null>(null);
  const [openBreakdownModal, setOpenBreakdownModal] = useState<'category' | 'brand' | null>(null);
  const [expandedLeakage, setExpandedLeakage] = useState<string | null>(null);
  
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({
    'pt-revenue': false,
    'pt-cost': false,
    'pt-margin': false,
    'pt-c2s': false,
    'pt-leakage': false,
    'pt-dept': false,
  });

  const handleToggleNode = (id: string) => {
    setOpenNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSetAllNodes = (isOpen: boolean) => {
    setOpenNodes({
      'pt-revenue': isOpen,
      'pt-cost': isOpen,
      'pt-margin': isOpen,
      'pt-c2s': isOpen,
      'pt-leakage': isOpen,
      'pt-dept': isOpen,
    });
  };

  // ROI by Category / SKU Chart Data
  const categoryRoiData = [
    { name: 'Beverages', spend: 38, revenue: 90, roi: 137 },
    { name: 'Snacks', spend: 52, revenue: 105, roi: 102 },
    { name: 'Personal Care', spend: 28, revenue: 62, roi: 121 },
    { name: 'Household', spend: 22, revenue: 55, roi: 150 },
  ];

  const skuRoiData = [
    // Beverages
    { name: 'Cola Max', spend: 12, revenue: 32, roi: 167, category: 'Beverages' },
    { name: 'Green Tea RTD', spend: 15, revenue: 31, roi: 107, category: 'Beverages' },
    { name: 'Mango Fizz', spend: 11, revenue: 27, roi: 145, category: 'Beverages' },
    // Snacks
    { name: 'Choco Wafers', spend: 18, revenue: 35, roi: 94, category: 'Snacks' },
    { name: 'Oat Cookies', spend: 14, revenue: 30, roi: 114, category: 'Snacks' },
    { name: 'Potato Chips', spend: 20, revenue: 40, roi: 100, category: 'Snacks' },
    // Personal Care
    { name: 'Herbal Shampoo', spend: 10, revenue: 25, roi: 150, category: 'Personal Care' },
    { name: 'Foam Face Wash', spend: 12, revenue: 23, roi: 92, category: 'Personal Care' },
    { name: 'Aloe Vera Gel', spend: 6, revenue: 14, roi: 133, category: 'Personal Care' },
    // Household
    { name: 'Floor Cleaner', spend: 8, revenue: 21, roi: 163, category: 'Household' },
    { name: 'Fabric Softener', spend: 9, revenue: 22, roi: 144, category: 'Household' },
    { name: 'Dishwash Gel', spend: 5, revenue: 12, roi: 140, category: 'Household' },
  ];

  const [roiViewMode, setRoiViewMode] = useState<'category' | 'sku'>('category');
  const [selectedRoiCategory, setSelectedRoiCategory] = useState<string | null>(null);
  const activeErosionPromos = 3;

  const atRiskSKUs = [
    { name: 'Fabric Softener', cat: 'Household', margin: 15, promo: 0.76, rev: 28, isCrit: true },
    { name: 'Floor Cleaner', cat: 'Household', margin: 19, promo: 0.60, rev: 30, isCrit: true },
    { name: 'Choco Wafers', cat: 'Snacks', margin: 22, promo: 0.72, rev: 44, isCrit: true },
    { name: 'Foam Face Wash', cat: 'Personal Care', margin: 26, promo: 0.57, rev: 55, isCrit: false },
    { name: 'Green Tea RTD', cat: 'Beverages', margin: 29, promo: 0.62, rev: 76, isCrit: false },
  ];

  const marginTrendData = [
    { name: 'Jan', gross: 34.1, operating: 17.8, net: 10.4 },
    { name: 'Feb', gross: 34.4, operating: 17.9, net: 10.5 },
    { name: 'Mar', gross: 34.7, operating: 18.0, net: 10.6 },
    { name: 'Apr', gross: 35.0, operating: 18.1, net: 10.7 },
    { name: 'May', gross: 35.3, operating: 18.2, net: 10.8 },
    { name: 'Jun', gross: 35.6, operating: 18.3, net: 10.9 },
    { name: 'Jul', gross: 35.9, operating: 18.5, net: 11.0 },
    { name: 'Aug', gross: 36.1, operating: 18.6, net: 11.1 },
    { name: 'Sep', gross: 36.1, operating: 18.5, net: 11.1 },
    { name: 'Oct', gross: 36.2, operating: 18.4, net: 11.1 },
  ];

  const costBreakdownData = [
    { name: 'Manufacturing', value: 312, color: '#ef4444' },
    { name: 'Transportation', value: 68, color: '#f59e0b' },
    { name: 'Packaging', value: 44, color: '#8b5cf6' },
    { name: 'Marketing', value: 91, color: '#3b82f6' },
    { name: 'Warehouse', value: 38, color: '#10b981' },
  ];

  const scale = getTimeframeScale(timelineRange);
  const noise = (key: string) => 1 + getDeterministicNoise(key, timelineRange) * 0.03;
  const pci = getAdjustedPci(0.5509, timelineRange);

  const PT_NODES = [
    {
      id: 'pt-revenue',
      icon: '📊',
      label: 'Revenue Breakdown',
      color: '#10b981',
      bg: 'rgba(16,185,129,0.06)',
      dotColor: '#10b981',
      items: [
        { label: 'Product-wise revenue', val: `$${Math.round(851 * scale * noise('pt-rev-product'))} M`, badge: '▲ 8.4%', bc: 'rgba(16,185,129,0.15)', bcolor: '#10b981' },
        { label: 'SKU-wise revenue', val: `${Math.round(100 + getDeterministicNoise('active_skus_pt', timelineRange)*3)} SKUs`, badge: '', bc: '', bcolor: '' },
        { label: 'Category contribution', val: '5 categories', badge: '', bc: '', bcolor: '' },
      ]
    },
    {
      id: 'pt-cost',
      icon: '📋',
      label: 'Cost Breakdown',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.06)',
      dotColor: '#ef4444',
      items: [
        { label: 'Manufacturing costs', val: `$${Math.round(312 * scale * noise('pt-mfg-cost'))} M`, badge: '', bc: '', bcolor: '' },
        { label: 'Transportation costs', val: `$${Math.round(68 * scale * noise('pt-trans-cost'))} M`, badge: '▲ 4%', bc: 'rgba(239,68,68,0.12)', bcolor: '#ef4444' },
        { label: 'Packaging costs', val: `$${Math.round(44 * scale * noise('pt-pack-cost'))} M`, badge: '', bc: '', bcolor: '' },
        { label: 'Marketing expenses', val: `$${Math.round(91 * scale * noise('pt-mkt-cost'))} M`, badge: '', bc: '', bcolor: '' },
      ]
    },
    {
      id: 'pt-margin',
      icon: '％',
      label: 'Margin Analysis',
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.06)',
      dotColor: '#8b5cf6',
      items: [
        { label: 'Gross Margin (GM)', val: `${getAdjustedMargin(36.2, 'GM_PT', timelineRange)}%`, badge: '▲ 1.1pp', bc: 'rgba(139,92,246,0.12)', bcolor: '#8b5cf6' },
        { label: 'Operating Margin (OM)', val: `${getAdjustedMargin(18.4, 'OM_PT', timelineRange)}%`, badge: '', bc: '', bcolor: '' },
        { label: 'Net Margin (NM)', val: `${getAdjustedMargin(11.1, 'NM_PT', timelineRange)}%`, badge: '', bc: '', bcolor: '' },
      ]
    },
    {
      id: 'pt-c2s',
      icon: '📦',
      label: 'Cost-to-Serve Analysis',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.06)',
      dotColor: '#f59e0b',
      items: [
        { label: 'Cost to maintain each SKU', val: `$${(4.2 * (1 + getDeterministicNoise('pt-c2s-cost', timelineRange)*0.05)).toFixed(1)} M avg`, badge: '', bc: '', bcolor: '' },
        { label: 'Active complex designs', val: `${Math.round(14 + getDeterministicNoise('active_designs_pt', timelineRange)*2)} items`, badge: '', bc: '', bcolor: '' },
      ]
    },
    {
      id: 'pt-leakage',
      icon: '⚠️',
      label: 'Leakage & Complexity Drivers',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.06)',
      dotColor: '#ef4444',
      items: [
        { label: 'Excess inventory', val: `$${Math.round(28 * scale * noise('pt-leak-inv'))} M`, badge: 'Critical', bc: 'rgba(239,68,68,0.15)', bcolor: '#ef4444' },
        { label: 'Packaging complexity', val: `$${Math.round(14 * scale * noise('pt-leak-pack'))} M`, badge: 'High', bc: 'rgba(245,158,11,0.12)', bcolor: '#f59e0b' },
      ]
    },
    {
      id: 'pt-dept',
      icon: '🏢',
      label: 'Department Usage',
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.06)',
      dotColor: '#3b82f6',
      items: [
        { label: 'Finance ownership', val: 'P&L Owner', badge: '', bc: '', bcolor: '' },
        { label: 'Pricing Team controls', val: 'Levers Active', badge: '', bc: '', bcolor: '' },
      ]
    },
  ];





  const monthsList = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const marginHealthmapData = [
    { category: 'Mango Fizz', months: [38, 38, 38, 38, 38, 42, 42, 42, 38, 38, 42, 44] },
    { category: 'Bitter Vanilla', months: [32, 32, 32, 32, 32, 32, 32, 36, 36, 36, 36, 37] },
    { category: 'Green Tea', months: [30, 30, 27, 27, 27, 30, 30, 31, 31, 32, 30, 29] },
    { category: 'Choc Cookies', months: [44, 44, 44, 44, 44, 40, 40, 40, 42, 42, 42, 41] },
    { category: 'Matcha Wafers', months: [40, 40, 38, 38, 38, 35, 35, 35, 38, 38, 41, 40] },
    { category: 'Choco Wafers', months: [28, 28, 22, 22, 22, 24, 24, 25, 28, 28, 25, 22] },
    { category: 'Hand Cream', months: [34, 34, 34, 33, 33, 33, 34, 34, 32, 32, 34, 34] },
    { category: 'Herbal Shampoo', months: [40, 40, 40, 40, 38, 38, 40, 40, 47, 47, 48, 45] }
  ];

  const revenueVsProfitMonths = [
    { label: 'Jul', revenue: 58, profit: 22, margin: 38.0 },
    { label: 'Aug', revenue: 60, profit: 23, margin: 38.3 },
    { label: 'Sep', revenue: 63, profit: 24, margin: 38.8 },
    { label: 'Oct', revenue: 66, profit: 25, margin: 39.0 },
    { label: 'Nov', revenue: 68, profit: 26, margin: 38.2 },
    { label: 'Dec', revenue: 71, profit: 27, margin: 38.7 },
    { label: 'Jan', revenue: 73, profit: 28, margin: 38.8 },
    { label: 'Feb', revenue: 75, profit: 28.5, margin: 38.0 },
    { label: 'Mar', revenue: 78, profit: 29, margin: 38.2 },
    { label: 'Apr', revenue: 80, profit: 29.5, margin: 37.5 },
    { label: 'May', revenue: 82, profit: 31, margin: 37.8 },
    { label: 'Jun', revenue: 84, profit: 32, margin: 37.5 }
  ];

  const revenueVsProfitWeeks = [
    { label: 'W20', revenue: 14.5, profit: 5.5, margin: 37.9 },
    { label: 'W21', revenue: 15.0, profit: 5.7, margin: 38.0 },
    { label: 'W22', revenue: 15.2, profit: 5.8, margin: 38.2 },
    { label: 'W23', revenue: 14.8, profit: 5.6, margin: 37.8 },
    { label: 'W24', revenue: 16.1, profit: 6.2, margin: 38.5 },
    { label: 'W25', revenue: 16.5, profit: 6.4, margin: 38.8 },
    { label: 'W26', revenue: 17.0, profit: 6.5, margin: 38.2 },
    { label: 'W27', revenue: 16.8, profit: 6.3, margin: 37.5 },
    { label: 'W28', revenue: 17.2, profit: 6.6, margin: 38.4 },
    { label: 'W29', revenue: 18.0, profit: 6.9, margin: 38.3 },
    { label: 'W30', revenue: 18.5, profit: 7.0, margin: 37.8 },
    { label: 'W31', revenue: 19.0, profit: 7.2, margin: 37.9 }
  ];

  const revenueVsProfitYears = [
    { label: '2022', revenue: 640, profit: 236, margin: 36.9 },
    { label: '2023', revenue: 710, profit: 266, margin: 37.5 },
    { label: '2024', revenue: 780, profit: 298, margin: 38.2 },
    { label: '2025', revenue: 840, profit: 320, margin: 38.1 },
    { label: '2026 YTD', revenue: 851, profit: 328, margin: 38.5 }
  ];

  const activeTrendData = trendHorizon === 'months' 
    ? revenueVsProfitMonths 
    : trendHorizon === 'weeks' 
      ? revenueVsProfitWeeks 
      : revenueVsProfitYears;

  const scenarioRev = 851.2 * (1 + simPriceChange / 100);
  const scenarioGp = 851.2 * (0.362 + (simPriceChange * 0.8) / 100 - (simRawMaterial * 0.6) / 100 + (simPromoCut * 0.4) / 100);
  const scenarioGmPct = scenarioRev > 0 ? ((scenarioGp / scenarioRev) * 100).toFixed(1) : '0';
  const scenarioGpImpact = scenarioGp - 851.2 * 0.362;
  const scenarioSkusBelow20 = simRawMaterial > 8 ? 4 : 2;



    const leakageItems = [
    {
      id: 'returns',
      title: 'Returns & refunds',
      value: '−$1.1M',
      desc: 'Return rate 9.8% vs 8.0% benchmark. Concentrated in Electronics (44% of returns).',
      width: '95%',
      where: 'Electronics category (44% of total returns)',
      why: 'Return rate is 9.8% vs. 8.0% target benchmark',
      how: 'Defects or product mismatches in high-value electronic units driving reverse logistics and restocking overhead.'
    },
    {
      id: 'markdowns',
      title: 'Markdown losses',
      value: '−$0.8M',
      desc: 'End-of-season markdowns 34% above plan — driven by Apparel overstock.',
      width: '72%',
      where: 'Apparel category overstock',
      why: 'End-of-season markdown budget exceeded by 34%',
      how: 'Excess seasonal inventory must be liquidated at low margins to clear warehouse floor space.'
    },
    {
      id: 'expired',
      title: 'Expired inventory',
      value: '−$0.6M',
      desc: 'SKU-level forecast accuracy at 71%; 12 slow-moving lines driving 80% of write-offs.',
      width: '54%',
      where: '12 slow-moving product lines (80% of write-offs)',
      why: 'Low SKU-level forecast accuracy (averaging 71%)',
      how: 'Excess buffer stock of short shelf-life items is produced, sits past expiry, and requires complete write-off.'
    },
    {
      id: 'margin',
      title: 'Channel margin erosion',
      value: '−$0.4M',
      desc: 'Marketplace fees rose 1.2pp YoY; direct channel under-indexed.',
      width: '36%',
      where: 'Digital marketplaces and direct channel mix',
      why: 'Marketplace commission fees rose 1.2 percentage points YoY',
      how: 'Marketplace commission fee hikes eat directly into net margin since direct DTC channels lack volume leverage.'
    },
    {
      id: 'supplier',
      title: 'Supplier overcharges',
      value: '−$0.2M',
      desc: 'Billing anomalies in 3 supplier accounts identified via contract audit.',
      width: '18%',
      where: '3 specific supplier accounts',
      why: 'Invoicing discrepancies and contract non-compliance',
      how: 'Supplier systems billed above pre-negotiated volume price tiers, requiring contract audit discovery to claw back overpayments.'
    }
  ];

  if (showForecastSimulator) {

    return (
      <ForecastAccuracySimulator 
        isDarkMode={isDarkMode} 
        onClose={() => setShowForecastSimulator(false)} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-body pb-12">
      {/* Revenue vs Profit Trend Card */}
      {/* Side-by-Side Grid for Trend and Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Revenue vs Profit Trend Card */}
        <div className="lg:col-span-3 glass-card bg-white dark:bg-[#1a1a24]/90 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-sm flex flex-col h-[350px]">
          <div className="p-3.5 sm:p-4 border-b border-black/5 dark:border-white/5 flex flex-col justify-between items-start gap-3 shrink-0">
            <div className="w-full flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider">
                REVENUE VS PROFIT TREND
              </h3>
              {/* Time Horizon Button Toggles */}
              <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg shrink-0">
                {(['weeks', 'months', 'years'] as const).map((horizon) => (
                  <button
                    key={horizon}
                    type="button"
                    onClick={() => setTrendHorizon(horizon)}
                    className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer border-none outline-none ${
                      trendHorizon === horizon
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-transparent'
                    }`}
                  >
                    {horizon}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#2563eb]" />
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#0d9488]" />
                <span>Gross profit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 border-t border-dashed border-[#ea580c] relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#ea580c] absolute" />
                </div>
                <span className="ml-1.5">Margin %</span>
              </div>
            </div>
          </div>
          <div className="p-3.5 sm:p-4 flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={activeTrendData} 
                  barCategoryGap="45%" 
                  barGap={5} 
                  margin={{ left: -35, right: 5, top: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="label" tick={{ fill: tickColor, fontSize: 9 }} axisLine={false} tickLine={false} />
                  
                  {/* Left YAxis for Revenue & Profit */}
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fill: tickColor, fontSize: 9 }} 
                    tickFormatter={(val) => `$${val}M`} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  
                  {/* Right YAxis for Margin % */}
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fill: tickColor, fontSize: 9 }} 
                    tickFormatter={(val) => `${val}%`} 
                    domain={[30, 45]} 
                    ticks={[30, 32, 34, 36, 38, 40, 42, 45]} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                    itemStyle={{ fontSize: 9.5 }}
                    formatter={(value: any, name: any) => {
                      if (name === 'Margin %') return [`${value}%`, name];
                      return [`$${value}M`, name];
                    }}
                  />
                  
                  {/* Side-by-side grouped bars: Revenue on left, Gross profit on right */}
                  <Bar 
                    yAxisId="left" 
                    dataKey="revenue" 
                    name="Revenue" 
                    fill="#2563eb" 
                    radius={[2, 2, 0, 0]} 
                    barSize={12} 
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="profit" 
                    name="Gross profit" 
                    fill="#0d9488" 
                    radius={[2, 2, 0, 0]} 
                    barSize={12} 
                  />
                  
                  {/* Secondary Axis Line for Margin % */}
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="margin" 
                    name="Margin %" 
                    stroke="#ea580c" 
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    dot={{ r: 3.5, fill: '#ea580c', stroke: '#ea580c', strokeWidth: 1 }} 
                    activeDot={{ r: 5 }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Profit Contributors Card */}
        <div className="lg:col-span-2 glass-card bg-white dark:bg-[#1a1a24]/90 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-sm flex flex-col h-[350px]">
          <div className="flex items-center justify-between p-3.5 border-b bg-teal-500/[0.03] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center text-xs flex-shrink-0">
                <Award size={14} className="stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold font-display text-teal-700 dark:text-teal-400">
                Top profit contributors
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Category / Brand Toggle Tabs */}
              <div className="flex gap-0.5 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setContributorTab('category');
                    setOpenBreakdownModal('category');
                  }}
                  className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer border-none outline-none ${
                    contributorTab === 'category'
                      ? 'bg-white dark:bg-zinc-700 text-[#6366f1] shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContributorTab('brand');
                    setOpenBreakdownModal('brand');
                  }}
                  className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer border-none outline-none ${
                    contributorTab === 'brand'
                      ? 'bg-white dark:bg-zinc-700 text-[#f59e0b] shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Brand
                </button>
              </div>
              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider shrink-0 font-sans">
                YTD
              </span>
            </div>
          </div>
          <div className="p-3.5 sm:p-4 flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    contributorTab === 'category'
                      ? [
                          { name: 'Electronics', value: 9.4, percent: 30 },
                          { name: 'Apparel', value: 7.2, percent: 23 },
                          { name: 'Home & Living', value: 5.8, percent: 18 },
                          { name: 'Beauty', value: 4.9, percent: 16 },
                          { name: 'Sports', value: 4.3, percent: 14 },
                        ]
                      : [
                          { name: 'BrandX', value: 6.1, percent: 19 },
                          { name: 'NovaLine', value: 5.4, percent: 17 },
                          { name: 'Apex', value: 4.8, percent: 15 },
                          { name: 'Zestora', value: 3.9, percent: 12 },
                          { name: 'Other', value: 11.4, percent: 36 },
                        ]
                  }
                  margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorCategory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.95}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.95}/>
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                  <XAxis 
                    dataKey="name" 
                    stroke={isDarkMode ? '#88889b' : '#71717a'}
                    fontSize={8.5}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke={isDarkMode ? '#88889b' : '#71717a'}
                    fontSize={8.5}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}M`}
                  />
                  <Tooltip content={<CustomContributorTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill={contributorTab === 'category' ? 'url(#colorCategory)' : 'url(#colorBrand)'} 
                    radius={[4, 4, 0, 0]} 
                    barSize={18} 
                    className="cursor-pointer"
                    onClick={(data) => {
                      if (data) {
                        const row = chartDatum<{ name: string; value: number; percent: number }>(data);
                        const name = row.name ?? (data as { name?: string }).name;
                        const value = row.value ?? (data as { value?: number }).value;
                        const percent = row.percent ?? 0;
                        if (name && value) {
                          setSelectedDetail({
                            type: contributorTab,
                            name,
                            value,
                            percent
                          });
                        }
                      }
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Contributor Detail Modal */}
      {selectedDetail && (
        <ModalShell isOpen onClose={() => setSelectedDetail(null)} layer="base" blur="sm" className="flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  selectedDetail.type === 'category' ? 'bg-[#6366f1]/15 text-[#6366f1]' : 'bg-[#f59e0b]/15 text-[#f59e0b]'
                }`}>
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-display">
                    {selectedDetail.type === 'category' ? 'Category Details' : 'Brand Details'}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Drilldown analysis for "{selectedDetail.name}"</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all border-none outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/30 border border-black/5 dark:border-white/5 rounded-xl">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Profit Contribution</span>
                  <span className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100">${selectedDetail.value} M</span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/30 border border-black/5 dark:border-white/5 rounded-xl">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Portfolio Share</span>
                  <span className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100">{selectedDetail.percent}%</span>
                </div>
              </div>

              {/* Sub-breakdown details */}
              <div>
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  {selectedDetail.type === 'category' ? 'Brand Performance under this Category' : 'Category Performance under this Brand'}
                </h4>
                <div className="space-y-3">
                  {/* Category-specific brands list */}
                  {selectedDetail.type === 'category' && (
                    selectedDetail.name === 'Electronics' ? [
                      { name: 'BrandX', val: 5.2, pct: 55 },
                      { name: 'NovaLine', val: 3.0, pct: 32 },
                      { name: 'Apex', val: 1.2, pct: 13 },
                    ] : selectedDetail.name === 'Apparel' ? [
                      { name: 'BrandX', val: 3.5, pct: 49 },
                      { name: 'Zestora', val: 2.5, pct: 35 },
                      { name: 'Other', val: 1.2, pct: 16 },
                    ] : selectedDetail.name === 'Home & Living' ? [
                      { name: 'NovaLine', val: 2.8, pct: 48 },
                      { name: 'Other', val: 2.0, pct: 35 },
                      { name: 'Apex', val: 1.0, pct: 17 },
                    ] : selectedDetail.name === 'Beauty' ? [
                      { name: 'Zestora', val: 3.0, pct: 61 },
                      { name: 'Apex', val: 1.5, pct: 31 },
                      { name: 'Other', val: 0.4, pct: 8 },
                    ] : [ // Sports
                      { name: 'Apex', val: 2.2, pct: 51 },
                      { name: 'BrandX', val: 1.5, pct: 35 },
                      { name: 'Other', val: 0.6, pct: 14 },
                    ]
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-400">
                        <span>{item.name}</span>
                        <div className="flex gap-3">
                          <span className="font-bold">${item.val}M</span>
                          <span className="text-zinc-500 dark:text-zinc-500 font-mono text-[10px]">{item.pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
                        <div className="h-1 rounded-full bg-[#6366f1]" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}

                  {/* Brand-specific categories list */}
                  {selectedDetail.type === 'brand' && (
                    selectedDetail.name === 'BrandX' ? [
                      { name: 'Electronics', val: 3.2, pct: 52 },
                      { name: 'Apparel', val: 1.8, pct: 30 },
                      { name: 'Sports', val: 1.1, pct: 18 },
                    ] : selectedDetail.name === 'NovaLine' ? [
                      { name: 'Electronics', val: 2.5, pct: 46 },
                      { name: 'Home & Living', val: 2.0, pct: 37 },
                      { name: 'Apparel', val: 0.9, pct: 17 },
                    ] : selectedDetail.name === 'Apex' ? [
                      { name: 'Sports', val: 2.0, pct: 42 },
                      { name: 'Beauty', val: 1.5, pct: 31 },
                      { name: 'Electronics', val: 1.3, pct: 27 },
                    ] : selectedDetail.name === 'Zestora' ? [
                      { name: 'Beauty', val: 2.1, pct: 54 },
                      { name: 'Apparel', val: 1.5, pct: 38 },
                      { name: 'Home & Living', val: 0.3, pct: 8 },
                    ] : [ // Other
                      { name: 'Home & Living', val: 4.5, pct: 39 },
                      { name: 'Apparel', val: 3.0, pct: 26 },
                      { name: 'Sports', val: 2.0, pct: 18 },
                      { name: 'Electronics', val: 1.0, pct: 9 },
                      { name: 'Beauty', val: 0.9, pct: 8 },
                    ]
                  ).map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-400">
                        <span>{item.name}</span>
                        <div className="flex gap-3">
                          <span className="font-bold">${item.val}M</span>
                          <span className="text-zinc-500 dark:text-zinc-500 font-mono text-[10px]">{item.pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
                        <div className="h-1 rounded-full bg-[#f59e0b]" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top performing SKUs */}
              <div>
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5">Top Profit-Generating SKUs</h4>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {(
                    selectedDetail.type === 'category'
                      ? (selectedDetail.name === 'Electronics' ? [
                          { rank: 1, name: 'BrandX TV 55"', val: 2.8, detail: 'High margin, premium segment' },
                          { rank: 2, name: 'NovaLine Laptop Pro', val: 1.9, detail: 'B2B volume driver' },
                          { rank: 3, name: 'BrandX Soundbar', val: 1.5, detail: 'Cross-sell champion' }
                        ] : selectedDetail.name === 'Apparel' ? [
                          { rank: 1, name: 'BrandX Leather Jacket', val: 2.1, detail: 'Seasonal premium margin' },
                          { rank: 2, name: 'Zestora Silk Dress', val: 1.6, detail: 'High direct-to-consumer share' },
                          { rank: 3, name: 'BrandX Denim Classic', val: 1.4, detail: 'Core volume product' }
                        ] : selectedDetail.name === 'Home & Living' ? [
                          { rank: 1, name: 'NovaLine Desk Chair', val: 1.5, detail: 'Ergonomic line success' },
                          { rank: 2, name: 'BrandY Dining Table', val: 1.2, detail: 'High ticket item contribution' },
                          { rank: 3, name: 'NovaLine Desk Lamp', val: 1.0, detail: 'Steady demand contributor' }
                        ] : selectedDetail.name === 'Beauty' ? [
                          { rank: 1, name: 'Zestora Face Serum', val: 1.8, detail: 'Social media promo driver' },
                          { rank: 2, name: 'Apex Eye Cream', val: 1.1, detail: 'Loyal customer subscription base' },
                          { rank: 3, name: 'Zestora Sunscreen', val: 0.9, detail: 'Summer volume uplift' }
                        ] : [ // Sports
                          { rank: 1, name: 'Apex Running Shoes', val: 1.4, detail: 'Core athletic footwear margin' },
                          { rank: 2, name: 'BrandX Yoga Mat', val: 0.9, detail: 'Active lifestyle segment driver' },
                          { rank: 3, name: 'Apex Dumbbells set', val: 0.8, detail: 'Home fitness equipment peak' }
                        ])
                      : (selectedDetail.name === 'BrandX' ? [
                          { rank: 1, name: 'BrandX TV 55"', val: 1.5, detail: 'Electronics division leader' },
                          { rank: 2, name: 'BrandX Leather Jacket', val: 1.2, detail: 'Apparel luxury flag' },
                          { rank: 3, name: 'BrandX Soundbar', val: 0.9, detail: 'Audio accessory driver' }
                        ] : selectedDetail.name === 'NovaLine' ? [
                          { rank: 1, name: 'NovaLine Laptop Pro', val: 1.4, detail: 'High value computing line' },
                          { rank: 2, name: 'NovaLine Desk Chair', val: 1.1, detail: 'Work from home hero' },
                          { rank: 3, name: 'NovaLine Desk Lamp', val: 0.8, detail: 'Desk lighting core product' }
                        ] : selectedDetail.name === 'Apex' ? [
                          { rank: 1, name: 'Apex Running Shoes', val: 1.2, detail: 'Premium performance athletic' },
                          { rank: 2, name: 'Apex Eye Cream', val: 0.9, detail: 'Clinical beauty segment driver' },
                          { rank: 3, name: 'Apex Dumbbells set', val: 0.7, detail: 'Core fitness hardware volume' }
                        ] : selectedDetail.name === 'Zestora' ? [
                          { rank: 1, name: 'Zestora Face Serum', val: 1.3, detail: 'Dermatological hero SKU' },
                          { rank: 2, name: 'Zestora Silk Dress', val: 1.0, detail: 'Direct consumer apparel leader' },
                          { rank: 3, name: 'Zestora Sunscreen', val: 0.7, detail: 'Skincare staple volume' }
                        ] : [ // Other
                          { rank: 1, name: 'Other Sofa Set', val: 2.5, detail: 'Living room premium line' },
                          { rank: 2, name: 'Other Ceramic Vase', val: 1.8, detail: 'Home decor high margin' },
                          { rank: 3, name: 'Other Bike Helmet', val: 1.2, detail: 'Sports protection segment leader' }
                        ])
                  ).map((sku: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 rounded-lg transition-all">
                      <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-extrabold text-zinc-500 flex items-center justify-center shrink-0 mt-0.5">
                        #{sku.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">{sku.name}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{sku.detail}</p>
                      </div>
                      <div className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 shrink-0">
                        ${sku.val}M
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Category / Brand Breakdown Modal */}
      {openBreakdownModal && (
        <ModalShell isOpen onClose={() => setOpenBreakdownModal(null)} layer="base" blur="sm" className="flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  openBreakdownModal === 'category' ? 'bg-[#6366f1]/15 text-[#6366f1]' : 'bg-[#f59e0b]/15 text-[#f59e0b]'
                }`}>
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-display">
                    {openBreakdownModal === 'category' ? 'Category Profit Contributors Breakdown' : 'Brand Profit Contributors Breakdown'}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium">YTD breakdown details</p>
                </div>
              </div>
              <button
                onClick={() => setOpenBreakdownModal(null)}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all border-none outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5">
              {openBreakdownModal === 'category' ? (
                <div className="space-y-4">
                  {[
                    { name: 'Electronics', value: 9.4, percent: 30 },
                    { name: 'Apparel', value: 7.2, percent: 23 },
                    { name: 'Home & Living', value: 5.8, percent: 18 },
                    { name: 'Beauty', value: 4.9, percent: 16 },
                    { name: 'Sports', value: 4.3, percent: 14 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <button
                          onClick={() => {
                            setOpenBreakdownModal(null);
                            setSelectedDetail({ type: 'category', name: item.name, value: item.value, percent: item.percent });
                          }}
                          className="text-xs font-bold text-[#6366f1] dark:text-[#818cf8] hover:underline cursor-pointer bg-transparent border-none p-0 text-left outline-none transition-all"
                        >
                          {item.name}
                        </button>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-zinc-900 dark:text-zinc-200">${item.value}M</span>
                          <span className="text-zinc-500 dark:text-zinc-500 font-mono w-8 text-right">{item.percent}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#4f46e5]" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { name: 'BrandX', value: 6.1, percent: 19 },
                    { name: 'NovaLine', value: 5.4, percent: 17 },
                    { name: 'Apex', value: 4.8, percent: 15 },
                    { name: 'Zestora', value: 3.9, percent: 12 },
                    { name: 'Other', value: 11.4, percent: 36 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <button
                          onClick={() => {
                            setOpenBreakdownModal(null);
                            setSelectedDetail({ type: 'brand', name: item.name, value: item.value, percent: item.percent });
                          }}
                          className="text-xs font-bold text-[#f59e0b] dark:text-[#fbbf24] hover:underline cursor-pointer bg-transparent border-none p-0 text-left outline-none transition-all"
                        >
                          {item.name}
                        </button>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-zinc-900 dark:text-zinc-200">${item.value}M</span>
                          <span className="text-zinc-500 dark:text-zinc-500 font-mono w-8 text-right">{item.percent}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706]" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ModalShell>
      )}


            {/* Profit Leakage Card & Regional Margin Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card bg-white dark:bg-[#1a1a24]/90 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-3.5 border-b bg-red-500/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-700 dark:text-red-400 flex items-center justify-center text-sm flex-shrink-0">
                <AlertTriangle size={16} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-bold font-display text-red-700 dark:text-red-400">
                Profit leakage — loss-making areas
              </span>
            </div>
            <span className="text-xs font-bold text-red-500 dark:text-red-500 font-mono">
              Total: −$3.1M
            </span>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leakageItems.map((item) => {
                const isExpanded = expandedLeakage === item.id;
                return (
                  <div 
                    key={item.id}
                    onClick={() => setExpandedLeakage(isExpanded ? null : item.id)}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden select-none ${
                      isExpanded 
                        ? 'border-red-500 bg-red-500/[0.02] dark:bg-red-500/[0.04] ring-1 ring-red-500/20 col-span-1 md:col-span-2 shadow-md' 
                        : 'border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                          {item.title}
                          {!isExpanded && (
                            <span className="text-[7.5px] font-bold text-red-500/80 dark:text-red-400/85 border border-red-500/20 dark:border-red-400/30 bg-red-500/5 dark:bg-red-400/10 rounded px-1.5 py-0.2 animate-pulse uppercase tracking-wider">
                              Click to analyze
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-red-500 dark:text-red-400 font-mono">{item.value}</span>
                          <ChevronRight size={12} className={`text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-red-500' : ''}`} />
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                      
                      {!isExpanded && (
                        <div className="w-full bg-black/5 dark:bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full" style={{ width: item.width }} />
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-red-500/10 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in text-[10px] font-sans">
                        {/* WHERE */}
                        <div className="space-y-1 bg-black/[0.02] dark:bg-white/[0.01] p-2.5 rounded-lg border border-red-500/5">
                          <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-black uppercase tracking-wider text-[8px]">
                            <MapPin size={10} className="stroke-[2.5]" />
                            Where
                          </div>
                          <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                            {item.where}
                          </p>
                        </div>
                        {/* WHY */}
                        <div className="space-y-1 bg-black/[0.02] dark:bg-white/[0.01] p-2.5 rounded-lg border border-red-500/5">
                          <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-black uppercase tracking-wider text-[8px]">
                            <HelpCircle size={10} className="stroke-[2.5]" />
                            Why
                          </div>
                          <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                            {item.why}
                          </p>
                        </div>
                        {/* HOW */}
                        <div className="space-y-1 bg-black/[0.02] dark:bg-white/[0.01] p-2.5 rounded-lg border border-red-500/5 col-span-1">
                          <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-black uppercase tracking-wider text-[8px]">
                            <Workflow size={10} className="stroke-[2.5]" />
                            How (Operational Impact)
                          </div>
                          <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                            {item.how}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <MarginSimulator onAuditClick={onAuditClick ? (metric) => onAuditClick(metric) : undefined} />
        </div>
      </div>

      {/* AI Opportunity Recommendations Card */}
      <div className="glass-card bg-white dark:bg-[#1a1a24]/90 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-3.5 border-b bg-emerald-500/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm flex-shrink-0">
              <Sparkles size={16} className="stroke-[2.5]" />
            </div>
            <span className="text-[12px] font-bold font-display text-emerald-700 dark:text-emerald-400">
              AI opportunity recommendations
            </span>
          </div>
          <span className="text-[9.5px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
            4 actions · ~$1.6M potential
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Dynamic pricing engine */}
          <div className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col justify-between min-h-[145px] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all">
            <div>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">Dynamic pricing engine</h4>
                  <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">+$0.6M potential</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium mt-3 leading-relaxed">
                Elasticity model on 2,400 SKUs optimises prices in real-time. Pilot on Electronics estimated 6.4% margin uplift.
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 rounded-full">
                High impact
              </span>
              <button 
                onClick={() => setShowForecastSimulator(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-black/10 dark:border-white/10 rounded-lg text-[9.5px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-zinc-600 dark:text-zinc-300 cursor-pointer"
              >
                Deep dive <ArrowUpRight size={12} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Returns propensity AI */}
          <div className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col justify-between min-h-[145px] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all">
            <div>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <RefreshCw size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">Returns propensity AI</h4>
                  <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">+$0.4M potential</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium mt-3 leading-relaxed">
                Pre-shipment risk scoring cuts return rate from 9.8% → 8.0%. Integrates with OMS with 2-week setup.
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 rounded-full">
                High impact
              </span>
              <button 
                onClick={() => setShowForecastSimulator(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-black/10 dark:border-white/10 rounded-lg text-[9.5px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-zinc-600 dark:text-zinc-300 cursor-pointer"
              >
                Deep dive <ArrowUpRight size={12} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* AI demand forecasting */}
          <div className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col justify-between min-h-[145px] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all">
            <div>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Package size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">AI demand forecasting</h4>
                  <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">+$0.4M potential</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium mt-3 leading-relaxed">
                LSTM time-series model lifts forecast accuracy to 88%, cutting overstock write-offs by 30% across 12 problem SKUs.
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1 rounded-full">
                Medium
              </span>
              <button 
                onClick={() => setShowForecastSimulator(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-black/10 dark:border-white/10 rounded-lg text-[9.5px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-zinc-600 dark:text-zinc-300 cursor-pointer"
              >
                Deep dive <ArrowUpRight size={12} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Contract intelligence */}
          <div className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col justify-between min-h-[145px] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all">
            <div>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
                  <FileText size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">Contract intelligence</h4>
                  <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">+$0.2M potential</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium mt-3 leading-relaxed">
                NLP audit of 340 supplier contracts surfaces billing anomalies and triggers renegotiation workflow automatically.
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1 rounded-full">
                Medium
              </span>
              <button 
                onClick={() => setShowForecastSimulator(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-black/10 dark:border-white/10 rounded-lg text-[9.5px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-zinc-600 dark:text-zinc-300 cursor-pointer"
              >
                Deep dive <ArrowUpRight size={12} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* P&L Tree Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-[#1a1a24]/90 border border-black/10 dark:border-white/10 rounded-xl p-4 gap-4 shadow-sm">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6] dark:text-purple-300">P&L Tree Decomposition</h3>
          <p className="text-[9.5px] text-zinc-500 dark:text-zinc-500 font-medium mt-0.5">Explore granular financial metrics across key operational areas</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => handleSetAllNodes(true)}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 bg-[#8b5cf6]/5 hover:bg-[#8b5cf6]/10 text-[#8b5cf6] dark:text-purple-300 text-[9.5px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            ⊞ Expand All
          </button>
          <button
            onClick={() => handleSetAllNodes(false)}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 border border-zinc-500/20 hover:border-zinc-500/40 bg-zinc-500/5 hover:bg-zinc-500/10 text-zinc-500 dark:text-zinc-300 text-[9.5px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            ⊟ Collapse All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PT_NODES.map((n) => {
          const isOpen = openNodes[n.id];
          return (
            <div key={n.id} className={`glass-card bg-white dark:bg-[#1a1a24]/90 border transition-all rounded-xl overflow-hidden shadow-sm ${isOpen ? 'border-[#8b5cf6]/20 dark:border-white/10' : 'border-black/5 dark:border-white/5'}`}>
              <div 
                onClick={() => handleToggleNode(n.id)} 
                className={`flex items-center justify-between py-1.5 px-2.5 cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.02] ${isOpen ? 'border-b border-black/5 dark:border-white/5' : ''}`}
                style={{ backgroundColor: isOpen ? 'rgba(139,92,246,0.03)' : 'transparent' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ backgroundColor: n.bg, color: n.color }}>{n.icon}</div>
                  <span className="text-[11px] font-bold font-display" style={{ color: n.color }}>{n.label}</span>
                </div>
                <div className="text-[9px] font-bold uppercase text-zinc-400">
                  {isOpen ? '✕' : '▼'}
                </div>
              </div>
              <div className="transition-all duration-350 ease-in-out overflow-hidden" style={{ maxHeight: isOpen ? '500px' : '0px' }}>
                <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {n.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-2 px-3 text-[11px] font-semibold hover:bg-black/[0.005]">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: n.dotColor }} />
                      <span className="text-zinc-600 dark:text-zinc-400">{it.label}</span>
                      {it.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded ml-2" style={{ backgroundColor: it.bc, color: it.bcolor }}>
                          {it.badge}
                        </span>
                      )}
                      <span className="ml-auto font-mono text-[10px] text-zinc-800 dark:text-zinc-200">{it.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card bg-white dark:bg-[#1a1a24]/90 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              {selectedRoiCategory && (
                <button
                  onClick={() => {
                    setSelectedRoiCategory(null);
                    setRoiViewMode('category');
                  }}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all cursor-pointer mr-1"
                  title="Back to Categories"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <span className="text-[13px] font-bold font-display text-zinc-800 dark:text-zinc-100">
                {roiViewMode === 'category'
                  ? 'ROI by Category'
                  : selectedRoiCategory
                    ? `ROI by SKU — ${selectedRoiCategory}`
                    : 'ROI by SKU'}
              </span>
            </div>
            {/* Custom Legend */}
            <div className="flex items-center gap-4 text-[10.5px] font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#5faad9]" />
                <span>Spend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#52d69b]" />
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  <div className="w-4 h-0.5 border-t border-dashed border-[#f27a35]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f27a35] -ml-1" />
                </div>
                <span>ROI%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRoiViewMode('category');
                  setSelectedRoiCategory(null);
                }}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  roiViewMode === 'category'
                    ? 'bg-[#18181b] text-white border-[#18181b] dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-sm'
                    : 'bg-transparent text-zinc-500 border-zinc-200 hover:text-zinc-800 hover:border-zinc-300 dark:text-zinc-400 dark:border-zinc-800 dark:hover:text-zinc-200 dark:hover:border-zinc-700'
                }`}
              >
                Category
              </button>
              <button
                onClick={() => {
                  setRoiViewMode('sku');
                }}
                className={`px-3.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  roiViewMode === 'sku'
                    ? 'bg-[#18181b] text-white border-[#18181b] dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-sm'
                    : 'bg-transparent text-zinc-500 border-zinc-200 hover:text-zinc-800 hover:border-zinc-300 dark:text-zinc-400 dark:border-zinc-800 dark:hover:text-zinc-200 dark:hover:border-zinc-700'
                }`}
              >
                SKU
              </button>
            </div>
            {roiViewMode === 'category' && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Click a bar to drill down</span>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="h-72 border border-black/5 dark:border-white/5 p-4 rounded-lg bg-black/[0.005] dark:bg-white/[0.005]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={
                  roiViewMode === 'category'
                    ? categoryRoiData
                    : selectedRoiCategory
                      ? skuRoiData.filter((item) => item.category === selectedRoiCategory)
                      : skuRoiData
                }
                margin={{ top: 15, right: -5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: tickColor, fontSize: 8.5, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, roiViewMode === 'category' ? 120 : 'auto']}
                  ticks={roiViewMode === 'category' ? [0, 20, 40, 60, 80, 100, 120] : undefined}
                  tick={{ fill: tickColor, fontSize: 9, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}M`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[90, roiViewMode === 'category' ? 150 : 'auto']}
                  ticks={roiViewMode === 'category' ? [90, 100, 110, 120, 130, 140, 150] : undefined}
                  tick={{ fill: tickColor, fontSize: 9, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const spendVal = payload.find((p) => p.dataKey === 'spend')?.value;
                      const revenueVal = payload.find((p) => p.dataKey === 'revenue')?.value;
                      const roiVal = payload.find((p) => p.dataKey === 'roi')?.value;
                      return (
                        <div className="p-3 bg-[#18181b] border border-white/10 rounded-lg text-white text-[11px] shadow-xl space-y-1 font-semibold">
                          <p className="font-bold text-xs text-zinc-200 border-b border-white/10 pb-1 mb-1">{label}</p>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-zinc-400">Spend:</span>
                            <span className="font-mono">${spendVal}M</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-zinc-400">Revenue:</span>
                            <span className="font-mono text-[#52d69b]">${revenueVal}M</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-zinc-400">ROI:</span>
                            <span className="font-mono text-[#f27a35]">{roiVal}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="spend"
                  name="Spend"
                  fill="#5faad9"
                  radius={[3, 3, 0, 0]}
                  barSize={roiViewMode === 'category' ? 24 : 16}
                >
                  {(
                    roiViewMode === 'category'
                      ? categoryRoiData
                      : selectedRoiCategory
                        ? skuRoiData.filter((item) => item.category === selectedRoiCategory)
                        : skuRoiData
                  ).map((entry, index) => (
                    <Cell
                      key={`cell-spend-${index}`}
                      className={roiViewMode === 'category' ? 'cursor-pointer hover:opacity-85 transition-all' : ''}
                      onClick={() => {
                        if (roiViewMode === 'category') {
                          setSelectedRoiCategory(entry.name);
                          setRoiViewMode('sku');
                        }
                      }}
                    />
                  ))}
                </Bar>
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  fill="#52d69b"
                  radius={[3, 3, 0, 0]}
                  barSize={roiViewMode === 'category' ? 24 : 16}
                >
                  {(
                    roiViewMode === 'category'
                      ? categoryRoiData
                      : selectedRoiCategory
                        ? skuRoiData.filter((item) => item.category === selectedRoiCategory)
                        : skuRoiData
                  ).map((entry, index) => (
                    <Cell
                      key={`cell-revenue-${index}`}
                      className={roiViewMode === 'category' ? 'cursor-pointer hover:opacity-85 transition-all' : ''}
                      onClick={() => {
                        if (roiViewMode === 'category') {
                          setSelectedRoiCategory(entry.name);
                          setRoiViewMode('sku');
                        }
                      }}
                    />
                  ))}
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="roi"
                  name="ROI%"
                  stroke="#f27a35"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, strokeWidth: 1, fill: '#f27a35' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      

      <div className="glass-card bg-white dark:bg-[#1a1a24]/90 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-3.5 border-b bg-[#8b5cf6]/[0.03]">
          <div className="flex items-start flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/15 text-[#8b5cf6] flex items-center justify-center text-sm flex-shrink-0">
                🎛️
              </div>
              <span className="text-[12px] font-bold font-display text-[#8b5cf6]">
                Scenario Simulator — Instant Portfolio Impact
              </span>
            </div>
            <p className="text-[9.5px] text-zinc-400 font-medium ml-9 mt-0.5">Adjust a lever and see the portfolio-wide margin impact instantly — no manual calculation</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                <span>Raw Material Cost Change</span>
                <span className="font-mono text-blue-500">{simRawMaterial >= 0 ? '+' : ''}{simRawMaterial}%</span>
              </div>
              <input 
                type="range" min="-10" max="20" step="1"
                value={simRawMaterial} onChange={(e) => setSimRawMaterial(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div className="space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                <span>Price Change (All SKUs)</span>
                <span className="font-mono text-emerald-500">{simPriceChange >= 0 ? '+' : ''}{simPriceChange}%</span>
              </div>
              <input 
                type="range" min="-5" max="15" step="1"
                value={simPriceChange} onChange={(e) => setSimPriceChange(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div className="space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                <span>Promo Spend Cut</span>
                <span className="font-mono text-[#8b5cf6]">{simPromoCut}%</span>
              </div>
              <input 
                type="range" min="0" max="50" step="5"
                value={simPromoCut} onChange={(e) => setSimPromoCut(parseInt(e.target.value))}
                className="w-full accent-[#8b5cf6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
            <div className="p-4 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-lg space-y-1">
              <p className="text-[8px] font-extrabold uppercase tracking-widest text-zinc-400">NEW REVENUE</p>
              <h5 className="text-base font-display font-black text-blue-500">${scenarioRev.toFixed(1)}M</h5>
              <p className="text-[9px] font-mono text-emerald-500 font-extrabold">${(scenarioRev - 851.2).toFixed(1)}M MTD</p>
            </div>
            <div className="p-4 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-lg space-y-1">
              <p className="text-[8px] font-extrabold uppercase tracking-widest text-zinc-400">NEW GROSS MARGIN</p>
              <h5 className="text-base font-display font-black text-emerald-500">{scenarioGmPct}%</h5>
              <p className="text-[9px] font-mono text-emerald-500 font-extrabold">Simulated</p>
            </div>
            <div className="p-4 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-lg space-y-1">
              <p className="text-[8px] font-extrabold uppercase tracking-widest text-zinc-400">GP IMPACT</p>
              <h5 className={`text-base font-display font-black ${scenarioGpImpact >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ${scenarioGpImpact >= 0 ? '+' : ''}{scenarioGpImpact.toFixed(1)}M
              </h5>
              <p className="text-[9px] font-mono text-emerald-500 font-extrabold">Reclaimed</p>
            </div>
            <div className="p-4 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-lg space-y-1">
              <p className="text-[8px] font-extrabold uppercase tracking-widest text-zinc-400">SKUS BELOW 20% MARGIN</p>
              <h5 className={`text-base font-display font-black ${scenarioSkusBelow20 > 2 ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-200'}`}>{scenarioSkusBelow20}</h5>
              <p className="text-[9px] font-mono text-red-500 font-extrabold">Critical</p>
            </div>
          </div>
        </div>
      </div>


      <div className="glass-card bg-white dark:bg-[#1a1a24]/90 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-3.5 border-b bg-emerald-500/[0.03]">
          <div className="flex items-start flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-sm flex-shrink-0">
                🗺️
              </div>
              <span className="text-[12px] font-bold font-display text-emerald-500">
                Rolling 12-Month Margin Heatmap
              </span>
            </div>
            <p className="text-[9.5px] text-zinc-400 font-medium ml-9 mt-0.5">Month vs SKU — color intensity represents margin % Spot seasonal dips and structural declines instantly</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="overflow-x-auto border border-black/10 dark:border-white/10 rounded-lg">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-4 w-40">SKU</th>
                  {monthsList.map(m => (
                    <th key={m} className="py-3 px-1 text-center font-mono text-[9px]">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {marginHealthmapData.map((row) => (
                  <tr key={row.category} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
                    <td className="py-3 px-4 font-bold text-zinc-800 dark:text-zinc-200">{row.category}</td>
                    {row.months.map((val, idx) => {
                      const month = monthsList[idx];
                      let cellBg = 'bg-red-500/10 text-red-500 border border-red-500/20';
                      if (val >= 40) {
                        cellBg = 'bg-[#0f4d3a] text-[#34d399] border border-[#0f4d3a]/30';
                      } else if (val >= 35) {
                        cellBg = 'bg-[#1e5c4a] text-[#6ee7b7] border border-[#1e5c4a]/30';
                      } else if (val >= 30) {
                        cellBg = 'bg-[#115e59] text-[#2dd4bf] border border-[#115e59]/30';
                      } else if (val >= 25) {
                        cellBg = 'bg-[#7c2d12] text-[#fed7aa] border border-[#7c2d12]/30';
                      } else {
                        cellBg = 'bg-[#7f1d1d] text-[#fecaca] border border-[#7f1d1d]/30';
                      }
                      
                      const isSelected = selectedCell?.category === row.category && selectedCell?.month === month;

                      return (
                        <td key={idx} className="py-2 px-1 text-center">
                          <div 
                            onClick={() => setSelectedCell({ category: row.category, month, val })}
                            className={`mx-auto w-12 py-2 rounded font-mono text-[9.5px] font-bold cursor-pointer transition-all hover:scale-105 ${cellBg} ${isSelected ? 'ring-2 ring-[#8b5cf6] scale-105 shadow-md' : ''}`}
                          >
                            {val}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-black/5 dark:bg-white/5 px-4 py-3 rounded-lg border border-black/10 dark:border-white/10 text-[8.5px] font-bold uppercase tracking-wider">
            <span className="text-zinc-400">Margin color:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#0f4d3a] border border-[#0f4d3a]" />
              <span>≥40%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#1e5c4a] border border-[#1e5c4a]" />
              <span>35-39%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#115e59] border border-[#115e59]" />
              <span>30-34%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#7c2d12] border border-[#7c2d12]" />
              <span>25-29%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#7f1d1d] border border-[#7f1d1d]" />
              <span>&lt;25%</span>
            </div>
          </div>

          {selectedCell ? (
            <div className="p-4 bg-[#8b5cf6]/[0.04] border border-[#8b5cf6]/20 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
              <div className="space-y-0.5">
                <span className="text-[7.5px] font-black uppercase bg-[#8b5cf6]/20 text-[#8b5cf6] px-2 py-0.5 rounded-sm">CELL DIAGNOSTIC</span>
                <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                  SKU Category: <span className="text-[#8b5cf6] font-extrabold">{selectedCell.category}</span> · Month: <span className="font-mono">{selectedCell.month}</span>
                </h5>
                <p className="text-[9.5px] text-zinc-600 dark:text-zinc-400 font-medium">
                  Detailed audit shows gross margin of <span className="font-bold font-mono text-[#8b5cf6]">{selectedCell.val}%</span>. 
                  {selectedCell.val >= 40 ? ' Highly profitable segment, exceeding all target margin thresholds.' : selectedCell.val >= 35 ? ' Margin is strong and stable in line with expectations.' : selectedCell.val >= 30 ? ' Stable margin, monitored for commodity inflation pressure.' : ' Attention required! Promo leakage or COGS surge compressing bottom line.'}
                </p>
              </div>
              <button 
                onClick={() => setSelectedCell(null)}
                className="px-3.5 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[9px] font-bold uppercase rounded cursor-pointer text-zinc-500 dark:text-zinc-400 shrink-0"
              >
                Close Audit
              </button>
            </div>
          ) : (
            <div className="p-3.5 bg-black/[0.01] dark:bg-white/[0.01] border border-dashed border-black/10 dark:border-white/10 rounded-lg text-center text-[10px] text-zinc-400 font-medium">
              💡 Tip: Click any monthly category percentage cell above to audit granular margin health.
            </div>
          )}
        </div>
      </div>


      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#16161c] text-white border border-white/10 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in">
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'warning' ? 'bg-red-400' : 'bg-blue-400'}`} />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

    </div>
  );
};
