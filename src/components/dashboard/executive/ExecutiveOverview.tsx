import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Check, X, AlertTriangle, RefreshCw, Zap, Clock, Home, List, Table, PieChart, BarChart2, Calendar, LayoutGrid,
  LineChart as LucideLineChart, AreaChart as LucideAreaChart, Radar as LucideRadar, Activity, ChevronDown, ChevronUp, BookOpen, Cpu, Frown
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Role } from '../../../types/dashboard';
import { 
  VP_ALERTS, VP_APPROVALS, VP_FORECAST, VP_KPI_BASE, SKUS 
} from '../../../constants/data';
import { TimelineRange, getTimeframeScale, getDeterministicNoise, getFilteredSKUS } from '../../../utils/timeframe';
import { SkuDetailsModal } from './SkuDetailsModal';
import { RegionalForecastModal } from './RegionalForecastModal';
import { EmailComposerModal } from '../portfolio-health/EmailComposerModal';
import { TrendMonthForecastModal } from './TrendMonthForecastModal';
import { CategoryPerformanceDetailsModal } from './CategoryPerformanceDetailsModal';
import { SmartAlertDetailsModal, AlertData } from './SmartAlertDetailsModal';
import { AgenticAlertExplanationModal } from './AgenticAlertExplanationModal';
import { EventsCalendarModal } from '../portfolio-health/EventsCalendarModal';
import { ScheduleMeetingModal } from '../portfolio-health/ScheduleMeetingModal';

interface CustomerInsight {
  name: string;
  segment: string;
  revContribution: string;
  interestTrend: string;
  buyingFocus: string[];
  growthTrend: string;
  growthDirection: 'up' | 'down' | 'neutral';
}

const CUSTOMER_INSIGHTS: Record<string, CustomerInsight[]> = {
  Beverages: [
    {
      name: 'Apex Hypermarkets',
      segment: 'Enterprise Chain • 98% Retention',
      revContribution: '$24.8 M',
      interestTrend: 'Rising demand for eco-friendly packaging and natural mineral mixers.',
      buyingFocus: ['BrandF Water Eco-Pack', 'Coconut Water 1K'],
      growthTrend: '+12.4% YoY',
      growthDirection: 'up'
    },
    {
      name: 'QuickCart Convenience',
      segment: 'Regional Chain • 94% Retention',
      revContribution: '$14.2 M',
      interestTrend: 'Shifting shelf preference toward high-energy single-serve options.',
      buyingFocus: ['BrandC Energy Drink', 'Mango Fizz 250ml'],
      growthTrend: '+8.7% YoY',
      growthDirection: 'up'
    },
    {
      name: 'Zenith Distributors',
      segment: 'Wholesale Partner • 91% Retention',
      revContribution: '$18.5 M',
      interestTrend: 'Bulk purchasing of premium fruit-based beverage offerings.',
      buyingFocus: ['Mango Fizz 500ml', 'Aloe Vera Drink'],
      growthTrend: '+4.2% YoY',
      growthDirection: 'up'
    }
  ],
  Snacks: [
    {
      name: 'MetroFoods Group',
      segment: 'Key Account • 97% Retention',
      revContribution: '$19.6 M',
      interestTrend: 'Spike in premium healthy baked items and baked grain products.',
      buyingFocus: ['Oat Cookies', 'Masala Puffs'],
      growthTrend: '+15.3% YoY',
      growthDirection: 'up'
    },
    {
      name: 'Apex Hypermarkets',
      segment: 'Enterprise Chain • 98% Retention',
      revContribution: '$16.8 M',
      interestTrend: 'High volume restocking of classic snack portfolios.',
      buyingFocus: ['BrandB Chips', 'BrandD Chocolate 100g'],
      growthTrend: '+3.4% YoY',
      growthDirection: 'up'
    },
    {
      name: 'Star Retailers',
      segment: 'Mid-Market Chain • 89% Retention',
      revContribution: '$8.4 M',
      interestTrend: 'Margin compression on chocolate products due to promotional shifts.',
      buyingFocus: ['Choco Wafers', 'BrandD Chocolate 250g'],
      growthTrend: '-2.1% YoY',
      growthDirection: 'down'
    }
  ],
  'Personal Care': [
    {
      name: 'Luminate Boutique',
      segment: 'Specialty Retailer • 95% Retention',
      revContribution: '$11.2 M',
      interestTrend: 'Surging demand for organic ingredients and active-SPF hand care.',
      buyingFocus: ['Hand Cream SPF', 'Herbal Shampoo'],
      growthTrend: '+22.4% YoY',
      growthDirection: 'up'
    },
    {
      name: 'GlobalMart Inc',
      segment: 'Enterprise Chain • 96% Retention',
      revContribution: '$14.5 M',
      interestTrend: 'Steady interest in family-pack cleansing and hygiene products.',
      buyingFocus: ['BrandB Soap', 'BrandD Toothpaste'],
      growthTrend: '+6.1% YoY',
      growthDirection: 'up'
    },
    {
      name: 'EcoBeauty Distribs',
      segment: 'Niche Wholesaler • 92% Retention',
      revContribution: '$6.8 M',
      interestTrend: 'Stocking up on foaming cleansers; sensitive skin variants preferred.',
      buyingFocus: ['Foam Face Wash', 'Aloe Face Wash'],
      growthTrend: '+8.2% YoY',
      growthDirection: 'up'
    }
  ],
  Dairy: [
    {
      name: 'MetroFoods Group',
      segment: 'Key Account • 97% Retention',
      revContribution: '$12.4 M',
      interestTrend: 'Expanding premium European cheese inventory across key metro centers.',
      buyingFocus: ['BrandD Cheese Blocks', 'BrandB Yogurt 500g'],
      growthTrend: '+11.2% YoY',
      growthDirection: 'up'
    },
    {
      name: 'Apex Hypermarkets',
      segment: 'Enterprise Chain • 98% Retention',
      revContribution: '$10.5 M',
      interestTrend: 'Steady volume orders for organic and gut-health probiotic brands.',
      buyingFocus: ['BrandB Yogurt 1kg', 'BrandE Yogurt (Straw)'],
      growthTrend: '+4.5% YoY',
      growthDirection: 'up'
    }
  ],
  Household: [
    {
      name: 'GlobalMart Inc',
      segment: 'Enterprise Chain • 96% Retention',
      revContribution: '$18.2 M',
      interestTrend: 'Substantial transition to premium concentrated cleaning capsules.',
      buyingFocus: ['Laundry Pods Premium', 'Dish Soap 1K'],
      growthTrend: '+14.6% YoY',
      growthDirection: 'up'
    },
    {
      name: 'Apex Hypermarkets',
      segment: 'Enterprise Chain • 98% Retention',
      revContribution: '$12.6 M',
      interestTrend: 'Volume restocking of general dish soaps and standard detergents.',
      buyingFocus: ['BrandF Detergent', 'Dish Soap 1K'],
      growthTrend: '+5.3% YoY',
      growthDirection: 'up'
    },
    {
      name: 'QuickCart Convenience',
      segment: 'Regional Chain • 94% Retention',
      revContribution: '$4.8 M',
      interestTrend: 'Decline in fabric softeners due to localized chemical regulatory flags.',
      buyingFocus: ['Fabric Softener', 'Floor Cleaner'],
      growthTrend: '-8.4% YoY',
      growthDirection: 'down'
    }
  ]
};

interface ExecutiveOverviewProps {
  role: Role;
  setActiveTab: (tab: number) => void;
  isDarkMode: boolean;
  onAuditClick: (metric: string) => void;
  timelineRange: TimelineRange;
  onViewAllSkus?: () => void;
}

// Top Customer Insights Dataset
const CUSTOMER_INSIGHTS_DATA: Record<string, Array<{
  name: string;
  segment: string;
  revContribution: string;
  interestTrend: string;
  buyingFocus: string[];
  growthTrend: string;
  growthDirection: 'up' | 'down';
}>> = {
  Beverages: [
    {
      name: "Apex Hypermarkets",
      segment: "Enterprise Chain • 98% Retention",
      revContribution: "$24.8 M",
      interestTrend: "Rising demand for eco-friendly packaging and natural mineral mixers.",
      buyingFocus: ["BrandF Water Eco-Pack", "Coconut Water 1K"],
      growthTrend: "+12.4% YoY",
      growthDirection: "up"
    },
    {
      name: "QuickCart Convenience",
      segment: "Regional Chain • 94% Retention",
      revContribution: "$14.2 M",
      interestTrend: "Shifting shelf preference toward high-energy single-serve options.",
      buyingFocus: ["BrandC Energy Drink", "Mango Fizz 250ml"],
      growthTrend: "+8.7% YoY",
      growthDirection: "up"
    },
    {
      name: "Zenith Distributors",
      segment: "Wholesale Partner • 91% Retention",
      revContribution: "$18.5 M",
      interestTrend: "Bulk purchasing of premium fruit-based beverage offerings.",
      buyingFocus: ["Mango Fizz 500ml", "Aloe Vera Drink"],
      growthTrend: "+4.2% YoY",
      growthDirection: "up"
    }
  ],
  Snacks: [
    {
      name: "MetroFoods Group",
      segment: "Key Account • 97% Retention",
      revContribution: "$19.6 M",
      interestTrend: "Spike in premium healthy baked items and baked grain products.",
      buyingFocus: ["Oat Cookies", "Masala Puffs"],
      growthTrend: "+15.3% YoY",
      growthDirection: "up"
    },
    {
      name: "Apex Hypermarkets",
      segment: "Enterprise Chain • 98% Retention",
      revContribution: "$16.8 M",
      interestTrend: "High volume restocking of classic snack portfolios.",
      buyingFocus: ["BrandB Chips", "BrandD Chocolate 100g"],
      growthTrend: "+3.4% YoY",
      growthDirection: "up"
    },
    {
      name: "Star Retailers",
      segment: "Mid-Market Chain • 89% Retention",
      revContribution: "$8.4 M",
      interestTrend: "Margin compression on chocolate products due to promotional shifts.",
      buyingFocus: ["Choco Wafers", "BrandD Chocolate 250g"],
      growthTrend: "-2.1% YoY",
      growthDirection: "down"
    }
  ],
  "Personal Care": [
    {
      name: "Luminate Boutique",
      segment: "Specialty Retailer • 95% Retention",
      revContribution: "$11.2 M",
      interestTrend: "Surging demand for organic ingredients and active-SPF hand care.",
      buyingFocus: ["Hand Cream SPF", "Herbal Shampoo"],
      growthTrend: "+22.4% YoY",
      growthDirection: "up"
    },
    {
      name: "GlobalMart Inc",
      segment: "Enterprise Chain • 96% Retention",
      revContribution: "$14.5 M",
      interestTrend: "Steady interest in family-pack cleansing and hygiene products.",
      buyingFocus: ["BrandB Soap", "BrandD Toothpaste"],
      growthTrend: "+6.1% YoY",
      growthDirection: "up"
    },
    {
      name: "EcoBeauty Distribs",
      segment: "Niche Wholesaler • 92% Retention",
      revContribution: "$6.8 M",
      interestTrend: "Stocking up on foaming cleansers; sensitive skin variants preferred.",
      buyingFocus: ["Foam Face Wash", "Aloe Face Wash"],
      growthTrend: "+8.2% YoY",
      growthDirection: "up"
    }
  ],
  Dairy: [
    {
      name: "MetroFoods Group",
      segment: "Key Account • 97% Retention",
      revContribution: "$12.4 M",
      interestTrend: "Expanding premium European cheese inventory across key metro centers.",
      buyingFocus: ["BrandD Cheese Blocks", "BrandB Yogurt 500g"],
      growthTrend: "+11.2% YoY",
      growthDirection: "up"
    },
    {
      name: "Apex Hypermarkets",
      segment: "Enterprise Chain • 98% Retention",
      revContribution: "$10.5 M",
      interestTrend: "Steady volume orders for organic and gut-health probiotic brands.",
      buyingFocus: ["BrandB Yogurt 1kg", "BrandE Yogurt (Straw)"],
      growthTrend: "+4.5% YoY",
      growthDirection: "up"
    }
  ],
  Household: [
    {
      name: "GlobalMart Inc",
      segment: "Enterprise Chain • 96% Retention",
      revContribution: "$18.2 M",
      interestTrend: "Substantial transition to premium concentrated cleaning capsules.",
      buyingFocus: ["Laundry Pods Premium", "Dish Soap 1K"],
      growthTrend: "+14.6% YoY",
      growthDirection: "up"
    },
    {
      name: "Apex Hypermarkets",
      segment: "Enterprise Chain • 98% Retention",
      revContribution: "$12.6 M",
      interestTrend: "Volume restocking of general dish soaps and standard detergents.",
      buyingFocus: ["BrandF Detergent", "Dish Soap 1K"],
      growthTrend: "+5.3% YoY",
      growthDirection: "up"
    },
    {
      name: "QuickCart Convenience",
      segment: "Regional Chain • 94% Retention",
      revContribution: "$4.8 M",
      interestTrend: "Decline in fabric softeners due to localized chemical regulatory flags.",
      buyingFocus: ["Fabric Softener", "Floor Cleaner"],
      growthTrend: "-8.4% YoY",
      growthDirection: "down"
    }
  ]
};

// Strategic Forecast Details Dataset
const MONTH_FORECAST_DETAILS: Record<string, {
  month: string;
  fullName: string;
  thisYearActual: string;
  thisYearTarget: string;
  lastYearActual: string;
  nextYearForecast: string;
  lastYearPriceIndex: string;
  thisYearPriceIndex: string;
  growthRate: string;
  aiRecommendations: string[];
}> = {
  Jan: {
    month: "Jan",
    fullName: "January",
    thisYearActual: "$58.0 M",
    thisYearTarget: "$60.0 M",
    lastYearActual: "$51.8 M",
    nextYearForecast: "$65.0 M",
    lastYearPriceIndex: "$142 / unit",
    thisYearPriceIndex: "$148 / unit",
    growthRate: "+12.4% projected",
    aiRecommendations: [
      "Raw material prices are projected to ease in Q1. Pre-negotiate wholesale sugar and packaging contracts to lock in a 4% cost reduction.",
      "Sustain higher marketing allocation for APAC Beverages to offset the slight winter seasonal slowdown.",
      "Transition low-velocity Dairy variants to regional distributors to lower direct administrative complexity."
    ]
  },
  Feb: {
    month: "Feb",
    fullName: "February",
    thisYearActual: "$61.0 M",
    thisYearTarget: "$63.0 M",
    lastYearActual: "$54.5 M",
    nextYearForecast: "$68.3 M",
    lastYearPriceIndex: "$143 / unit",
    thisYearPriceIndex: "$149 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Run cross-promotional campaigns linking Beverages and Snacks to capture post-holiday retail velocity.",
      "Increase safety stock levels by 6% in hypermarkets for top 10 hero SKUs to avoid recurring stockout leakage.",
      "Hold contract pricing corridors stable across Italy and Spain; resist discount pressure from enterprise accounts."
    ]
  },
  Mar: {
    month: "Mar",
    fullName: "March",
    thisYearActual: "$65.0 M",
    thisYearTarget: "$66.0 M",
    lastYearActual: "$58.1 M",
    nextYearForecast: "$72.8 M",
    lastYearPriceIndex: "$144 / unit",
    thisYearPriceIndex: "$151 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Lock in procurement logistics for Q2 peak shipping lanes to hedge against freight rates volatility.",
      "Introduce secondary vendor options for primary flavor concentrates to hedge supply chain lead-time risks.",
      "Prepare shelf layouts for upcoming BrandA Premium Energy launches; secure endcap space with retailers."
    ]
  },
  Apr: {
    month: "Apr",
    fullName: "April",
    thisYearActual: "$70.0 M",
    thisYearTarget: "$70.0 M",
    lastYearActual: "$62.5 M",
    nextYearForecast: "$78.4 M",
    lastYearPriceIndex: "$144 / unit",
    thisYearPriceIndex: "$152 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Monitor raw milk supplier capacity; pre-arrange backup supply agreements to secure gross margin parameters.",
      "Deploy regional price increases of 3.5% on snacks where demand elasticity is low to counter inflation.",
      "Standardize currency hedging contracts to insulate EMEA sales margins from currency fluctuations."
    ]
  },
  May: {
    month: "May",
    fullName: "May",
    thisYearActual: "$74.0 M",
    thisYearTarget: "$74.0 M",
    lastYearActual: "$66.1 M",
    nextYearForecast: "$82.9 M",
    lastYearPriceIndex: "$145 / unit",
    thisYearPriceIndex: "$153 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Run optimization algorithms on regional inventories to balance stock levels across North and West DCs.",
      "Optimize trade promotion depth: enforce a 15% discount cap on cookies and chips to reclaim margin rates.",
      "Accelerate phase-out timelines for low-value sunset candidates to reallocate production floor bandwidth."
    ]
  },
  Jun: {
    month: "Jun",
    fullName: "June",
    thisYearActual: "$77.0 M",
    thisYearTarget: "$76.0 M",
    lastYearActual: "$68.8 M",
    nextYearForecast: "$86.2 M",
    lastYearPriceIndex: "$146 / unit",
    thisYearPriceIndex: "$154 / unit",
    growthRate: "+11.9% projected",
    aiRecommendations: [
      "Implement direct-to-retailer distribution routes in high-density metro corridors to bypass regional depot margins.",
      "Triage competitor pricing moves: match promotional discount frequency, but maintain base list prices.",
      "Leverage summer volume gains by scaling distribution of single-serve mineral water and sports drinks."
    ]
  },
  Jul: {
    month: "Jul",
    fullName: "July",
    thisYearActual: "$80.0 M",
    thisYearTarget: "$80.0 M",
    lastYearActual: "$71.4 M",
    nextYearForecast: "$89.6 M",
    lastYearPriceIndex: "$146 / unit",
    thisYearPriceIndex: "$154 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Conduct midpoint operational reviews of supply sourcing lead times; update DC replenishment schedules.",
      "Consolidate raw material freight carriers to secure bulk shipping lane contract discounts.",
      "Optimize portfolio mix: increase production volume for top-margin items while capping low-velocity lines."
    ]
  },
  Aug: {
    month: "Aug",
    fullName: "August",
    thisYearActual: "$84.0 M",
    thisYearTarget: "$83.0 M",
    lastYearActual: "$75.0 M",
    nextYearForecast: "$94.1 M",
    lastYearPriceIndex: "$147 / unit",
    thisYearPriceIndex: "$155 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Initiate discussions with primary supermarkets for holiday shelf placement commitments.",
      "Pre-position packaging inventory at regional warehouses to avoid shipping congestions.",
      "Analyze customer NPS score feedback; prioritize delivery dispatch speed optimizations in Europe."
    ]
  },
  Sep: {
    month: "Sep",
    fullName: "September",
    thisYearActual: "$88.0 M",
    thisYearTarget: "$86.0 M",
    lastYearActual: "$78.6 M",
    nextYearForecast: "$98.6 M",
    lastYearPriceIndex: "$148 / unit",
    thisYearPriceIndex: "$156 / unit",
    growthRate: "+12.1% projected",
    aiRecommendations: [
      "Negotiate bulk warehouse space leases for Q4 inventory build-ups before spot rental rates spike.",
      "Curb promotional discounts on high-erosion accounts to recover list price margins prior to holidays.",
      "Audit supplier performance indexes; draft performance improvement plans for lagging partners."
    ]
  },
  Oct: {
    month: "Oct",
    fullName: "October",
    thisYearActual: "$91.0 M",
    thisYearTarget: "$90.0 M",
    lastYearActual: "$81.3 M",
    nextYearForecast: "$101.9 M",
    lastYearPriceIndex: "$148 / unit",
    thisYearPriceIndex: "$157 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Execute phased rollouts for regional pricing adjustments on personal care portfolios.",
      "Establish priority freight lanes with logistics providers to secure holiday delivery dispatch windows.",
      "Monitor cannibalization alerts in Snacks; adjust shelf spacing to favor high-margin variants."
    ]
  },
  Nov: {
    month: "Nov",
    fullName: "November",
    thisYearActual: "$92.4 M",
    thisYearTarget: "$93.0 M",
    lastYearActual: "$83.0 M",
    nextYearForecast: "$104.2 M",
    lastYearPriceIndex: "$149 / unit",
    thisYearPriceIndex: "$157 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Run final tests on the upcoming Q1 new product launches; check milestone pipeline readiness.",
      "Maximize distributor shelf inventory depth on high-demand holiday SKU lines.",
      "Ensure Continuous Close audit ledger records are updated; clear all intercompany variances."
    ]
  },
  Dec: {
    month: "Dec",
    fullName: "December",
    thisYearActual: "$95.1 M",
    thisYearTarget: "$96.0 M",
    lastYearActual: "$85.7 M",
    nextYearForecast: "$107.5 M",
    lastYearPriceIndex: "$150 / unit",
    thisYearPriceIndex: "$158 / unit",
    growthRate: "+12.0% projected",
    aiRecommendations: [
      "Review full-year margin and revenue targets; formulate Q1 operational goals and benchmarks.",
      "Leverage year-end volume rebates with raw material suppliers to maximize gross margins.",
      "Prepare portfolio rationalization lists for phase-out rollouts in the new fiscal year."
    ]
  }
};

// Month Forecast Modal Component
const MonthForecastModal: React.FC<{ isOpen: boolean; month: string | null; onClose: () => void }> = ({ isOpen, month, onClose }) => {
  if (!isOpen || !month) return null;
  const data = MONTH_FORECAST_DETAILS[month];
  if (!data) return null;
  const isBelowTarget = data.thisYearActual !== "N/A (Pending)" && parseFloat(data.thisYearActual.replace(/[^\d.]/g, "")) < parseFloat(data.thisYearTarget.replace(/[^\d.]/g, ""));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-display font-extrabold text-zinc-900 dark:text-zinc-50">
                Strategic Forecast & Pricing Review: {data.fullName}
              </h2>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Corporate Intelligence & Projections
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-650 cursor-pointer border-none bg-transparent outline-none"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="font-bold text-[9.5px] uppercase tracking-widest text-zinc-400">Revenue Analysis ($ M)</p>
            <div className="bg-zinc-50 dark:bg-white/5 p-3.5 rounded border border-black/5 dark:border-white/10 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Prior Year (Last Year) Sales:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{data.lastYearActual}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">This Year Target vs Actual:</span>
                <span className="font-semibold text-zinc-855 dark:text-white">
                  {data.thisYearTarget} / <span className={isBelowTarget ? "text-amber-500 font-bold" : "text-green-500 font-bold"}>{data.thisYearActual}</span>
                </span>
              </div>
              <div className="border-t border-black/5 dark:border-white/5 pt-2.5 flex justify-between items-center">
                <span className="text-purple-600 dark:text-purple-400 font-extrabold">Next Year Forecast (Proj):</span>
                <div className="text-right">
                  <span className="font-extrabold text-purple-600 dark:text-purple-400 text-sm block">{data.nextYearForecast}</span>
                  <span className="text-[8px] text-green-500 uppercase tracking-wider font-extrabold">{data.growthRate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-[9.5px] uppercase tracking-widest text-zinc-400">Blended Price Index (Category unit)</p>
            <div className="bg-zinc-50 dark:bg-white/5 p-3.5 rounded border border-black/5 dark:border-white/10 space-y-2.5 h-[116px] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Last Year Blended Price:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{data.lastYearPriceIndex}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">This Year Blended Price:</span>
                <span className="font-semibold text-zinc-855 dark:text-white">{data.thisYearPriceIndex}</span>
              </div>
              <div className="border-t border-black/5 dark:border-white/5 pt-2.5 flex justify-between items-center">
                <span className="text-indigo-655 dark:text-indigo-400 font-bold">YoY Price Lift:</span>
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">+4.2% Growth</span>
              </div>
            </div>
          </div>
        </div>



        <div className="flex justify-end border-t border-black/10 dark:border-white/10 pt-3 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent outline-none"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

const EVENT_TEMPLATES = [
  { sev: 'info', sevC: '#3b82f6', type: 'Demand', msgs: ['Mango Fizz 500ml — reorder triggered: 12,000 units', 'E-Commerce channel orders up 18% in last 2hrs', 'Oat Cookies demand spike detected — APAC region', 'Customer return rate dropped to 1.2% — all categories'] },
  { sev: 'warning', sevC: '#f59e0b', type: 'Supply', msgs: ['Fabric Softener stock level below safety threshold', 'Lead time breach — supplier notification sent', 'Cold chain temperature alert — Mumbai DC resolved', 'Freight cost increase 4% — Mumbai to Bangalore lane'] },
  { sev: 'critical', sevC: '#ef4444', type: 'Margin', msgs: ['Margin erosion detected: Green Tea RTD promo overlap', 'Price floor breach on Choco Wafers — auto-flagged', 'Promotional budget 83% consumed — 14 days remaining', 'Cost variance alert: packaging +7% vs budget'] },
  { sev: 'info', sevC: '#10b981', type: 'Finance', msgs: ['Invoice cleared: Supplier ID #4821 — $2.3 M', 'Revenue milestone: $850 M MTD achieved', 'GST reconciliation complete — no discrepancies', 'Quarterly audit trail generated and archived'] },
  { sev: 'info', sevC: '#8b5cf6', type: 'Launch', msgs: ['Mango Fizz 750ml — shelf placement confirmed: 240 stores', 'Launch readiness score updated: 82/100', 'Market test: Herbal Shampoo new variant — positive signal', 'NPD gate review scheduled: Thursday 10:00 AM'] },
];

const generateInitialEvents = () => {
  const list = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const tmpl = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
    const msg = tmpl.msgs[Math.floor(Math.random() * tmpl.msgs.length)];
    const timeObj = new Date(now.getTime() - i * 60000);
    const timeStr = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    list.push({
      id: 'init-' + i + '-' + Date.now(),
      sev: tmpl.sev,
      sevC: tmpl.sevC,
      type: tmpl.type,
      msg,
      time: timeStr
    });
  }
  return list;
};

const FLAGGED_SKUS = [
  { name: 'Premium Cold Brew 250ml', reason: 'Revenue decline', value: '-18.2%', color: '#ef4444', pct: 80, isRed: true },
  { name: 'BrandB Chips', reason: 'Margin decline', value: '-6.2 pts', color: '#f59e0b', pct: 60, isRed: false },
  { name: 'Organic Whole Milk 1K', reason: 'Sentiment drop', value: '3.2 / 5', color: '#ef4444', pct: 62, isRed: true },
  { name: 'Mango Fizz 500ml', reason: 'Revenue decline', value: '-9.1%', color: '#f59e0b', pct: 45, isRed: false },
  { name: 'Toilet Paper 12-Pack', reason: 'Stockout risk', value: 'High', color: '#f59e0b', pct: 38, isRed: false },
];

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({ role, setActiveTab, isDarkMode, onAuditClick, timelineRange, onViewAllSkus }) => {
  const [alerts, setAlerts] = useState(() => VP_ALERTS.map(a => ({ ...a })));
  const [approvals, setApprovals] = useState(() => VP_APPROVALS.map(a => ({ ...a })));
  const [kpis, setKpis] = useState(() => {
    let baseKpis = VP_KPI_BASE;
    if (role === 'VP Product Management') {
      baseKpis = baseKpis.filter(k => k.label !== 'Gross Margin');
    }
    return baseKpis.map(k => ({ ...k, sparkPoints: k.spark.map((v, i) => ({ index: i, value: v })) }));
  });
  const [lastRefreshed, setLastRefreshed] = useState<string>('Refreshed just now');
  const [attentionViewMode, setAttentionViewMode] = useState<'progress' | 'table' | 'cards'>('cards');

  useEffect(() => {
    let baseKpis = VP_KPI_BASE;
    if (role === 'VP Product Management') {
      baseKpis = baseKpis.filter(k => k.label !== 'Gross Margin');
    }
    
    const scale = getTimeframeScale(timelineRange);
    const updated = baseKpis.map(k => {
      let scaledValue = k.value;
      let scaledSpark = [...k.spark];
      const noiseFactor = 1 + getDeterministicNoise(k.label, timelineRange) * 0.03;
      
      if (k.label === 'Total Revenue') {
        scaledValue = Math.round(k.value * scale * noiseFactor);
        scaledSpark = k.spark.map(v => Math.round(v * scale * noiseFactor));
      } else if (k.label === 'Gross Margin') {
        let drift = 0;
        if (timelineRange === '1m') drift = -1.5;
        else if (timelineRange === '3m') drift = -0.8;
        else if (timelineRange === '6m') drift = -0.3;
        else if (timelineRange === '24m') drift = 0.5;
        else if (timelineRange === '36m') drift = 1.1;
        scaledValue = parseFloat((k.value + drift + getDeterministicNoise('GM_Overview', timelineRange) * 0.5).toFixed(1));
        scaledSpark = k.spark.map(v => parseFloat((v + drift + getDeterministicNoise('GM_Overview', timelineRange) * 0.5).toFixed(1)));
      } else if (k.label === 'Active SKUs') {
        let drift = 0;
        if (timelineRange === '1m') drift = 5;
        else if (timelineRange === '3m') drift = 3;
        else if (timelineRange === '6m') drift = 2;
        else if (timelineRange === '24m') drift = -4;
        else if (timelineRange === '36m') drift = -8;
        scaledValue = Math.round(k.value + drift + getDeterministicNoise('SKUs_Overview', timelineRange) * 2);
        scaledSpark = k.spark.map(v => Math.round(v + drift + getDeterministicNoise('SKUs_Overview', timelineRange) * 2));
      } else if (k.label === 'Critical Alerts') {
        scaledValue = Math.max(0, Math.round(k.value * scale * noiseFactor));
        scaledSpark = k.spark.map(v => Math.max(0, Math.round(v * scale * noiseFactor)));
      }
      
      return {
        ...k,
        value: scaledValue,
        spark: scaledSpark,
        sparkPoints: scaledSpark.map((v, i) => ({ index: i, value: v }))
      };
    });
    
    setKpis(updated);
  }, [timelineRange, role]);

  // Live Industry Updates states
  const [viewFormat, setViewFormat] = useState<'grid' | 'table'>('grid');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');
  const [feedEvents, setFeedEvents] = useState(() => generateInitialEvents());

  // Vercel UI states
  const [revenueChartType, setRevenueChartType] = useState<'line' | 'combi' | 'bar'>('line');
  const [categoryChartType, setCategoryChartType] = useState<'donut' | 'bar' | 'radar'>('donut');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [activeCategoryInsights, setActiveCategoryInsights] = useState<string>('Beverages');
  
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

  // Timer for adding live events
  useEffect(() => {
    const scheduleNextEvent = () => {
      const delay = 1800 + Math.random() * 4200;
      return setTimeout(() => {
        const tmpl = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
        const msg = tmpl.msgs[Math.floor(Math.random() * tmpl.msgs.length)];
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newEv = {
          id: 'dyn-' + Date.now(),
          sev: tmpl.sev,
          sevC: tmpl.sevC,
          type: tmpl.type,
          msg,
          time: timeStr
        };

        setFeedEvents(prev => [newEv, ...prev.slice(0, 79)]);

        if (tmpl.sev === 'critical' && Math.random() > 0.6) {
          addToast('Critical alert', msg, '#ef4444');
          setAlerts(prevAlerts => {
            if (prevAlerts.some(a => a.title === msg)) return prevAlerts;
            const newAlert = {
              id: 'dyn-al-' + Date.now(),
              sev: 'critical',
              title: msg,
              detail: tmpl.type + ' · Auto-detected'
            };
            return [newAlert, ...prevAlerts.slice(0, 11)];
          });
        }
        timerId = scheduleNextEvent();
      }, delay);
    };

    let timerId = scheduleNextEvent();
    return () => clearTimeout(timerId);
  }, []);

  // Category filter and modal states for Top SKU Performance card
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeCustomerCategory, setActiveCustomerCategory] = useState<string>('Beverages');
  const [selectedSku, setSelectedSku] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [isEmailOpen, setIsEmailOpen] = useState<boolean>(false);
  const [emailData, setEmailData] = useState({ to: '', name: '', subject: '', body: '' });
  const [skuViewMode, setSkuViewMode] = useState<'list' | 'chart'>('list');
  const [hoveredSku, setHoveredSku] = useState<any>(null);
  const [regionViewMode, setRegionViewMode] = useState<'list' | 'chart'>('chart');
  const [revenueViewMode, setRevenueViewMode] = useState<'line' | 'combi' | 'bar'>('combi');
  const [categoryViewMode, setCategoryViewMode] = useState<'donut' | 'bar' | 'radar'>('radar');
  const [selectedTrendMonth, setSelectedTrendMonth] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [activeAlertMeeting, setActiveAlertMeeting] = useState<AlertData | null>(null);
  const [isAgenticExplanationOpen, setIsAgenticExplanationOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  // Dynamic accent color based on theme
  const accentColor = isDarkMode ? '#a78bfa' : '#6d28d9';
  const tooltipBg = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const tooltipBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipText = isDarkMode ? '#fff' : '#000';
  const gridStroke = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleRefresh = () => {
    // Jitter KPIs slightly to simulate real-time updates
    setKpis(prevKpis => prevKpis.map((kpi) => {
      let newValue = kpi.value;
      if (kpi.label === 'Total Revenue') {
        newValue = +(kpi.value + (Math.random() * 0.6 - 0.2)).toFixed(1);
      } else if (kpi.label === 'Gross Margin') {
        newValue = +(kpi.value + (Math.random() * 0.04 - 0.01)).toFixed(1);
      }
      
      const newSpark = [...kpi.spark.slice(1), newValue];
      return {
        ...kpi,
        value: newValue,
        spark: newSpark,
        sparkPoints: newSpark.map((v, i) => ({ index: i, value: v }))
      };
    }));

    setLastRefreshed('Refreshed just now at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleAckAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleAckAllAlerts = () => {
    setAlerts([]);
  };

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
  };

    // Recharts actual vs target data
  const revMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revActual = [58, 61, 65, 70, 74, 77, 80, 84, 88, 91, 92.4, 95.1];
  const revTarget = [60, 63, 66, 70, 74, 76, 80, 83, 86, 90, 93, 96];

  const numMonthsToShow = timelineRange === '1m' ? 1 :
                          timelineRange === '3m' ? 3 :
                          timelineRange === '6m' ? 6 : 12;
  const slicedActual = revActual.slice(-numMonthsToShow);
  const slicedTarget = revTarget.slice(-numMonthsToShow);
  const slicedMonths = revMonths.slice(-numMonthsToShow);

  const revenueTrendData = slicedMonths.map((m, idx) => ({
    month: m,
    Actual: idx < slicedActual.length ? slicedActual[idx] : null,
    Target: slicedTarget[idx]
  }));

  // Category performance
  const scale = getTimeframeScale(timelineRange);
  const categoryPerfData = [
    { name: 'Beverages', value: Math.round(316 * scale * (1 + getDeterministicNoise('Beverages_perf', timelineRange) * 0.03)), color: '#7C3AED' },
    { name: 'Snacks', value: Math.round(253 * scale * (1 + getDeterministicNoise('Snacks_perf', timelineRange) * 0.03)), color: '#0F6E56' },
    { name: 'Dairy', value: Math.round(180 * scale * (1 + getDeterministicNoise('Dairy_perf', timelineRange) * 0.03)), color: '#F59E0B' },
    { name: 'Personal Care', value: Math.round(225 * scale * (1 + getDeterministicNoise('PersonalCare_perf', timelineRange) * 0.03)), color: '#185FA5' },
    { name: 'Household', value: Math.round(145 * scale * (1 + getDeterministicNoise('Household_perf', timelineRange) * 0.03)), color: '#854F0B' }
  ];

  // Top SKUs by revenue filtered by category
  const timeframeSkus = getFilteredSKUS(SKUS, timelineRange);
  const filteredSkus = activeCategory === 'All'
    ? timeframeSkus
    : timeframeSkus.filter(s => s.cat === activeCategory);
  const topSkus = [...filteredSkus].sort((a, b) => b.rev - a.rev).slice(0, 5);
  const maxSkuRev = topSkus[0]?.rev || 1;
  
  const filteredEvents = eventFilter === 'all' ? feedEvents : feedEvents.filter(e => e.type === eventFilter);

  const alertsBlock = (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5">
      <div className="flex justify-between items-center pb-2.5 border-b border-black/5 dark:border-white/5 mb-2.5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 select-none">
          <Cpu size={11} className="text-[#6d28d9] dark:text-[#a78bfa] shrink-0 animate-pulse" />
          Smart Alerts
          <span className="text-[9px] font-extrabold bg-red-500 text-white rounded-full px-1.5 py-0.5 animate-pulse">
            {alerts.length}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setIsAgenticExplanationOpen(true)}
            className="text-[8px] font-bold uppercase tracking-widest border border-[#a78bfa]/40 text-[#6d28d9] dark:text-[#a78bfa] px-2 py-1 hover:bg-[#6d28d9]/5 dark:hover:bg-[#a78bfa]/5 transition-all cursor-pointer flex items-center gap-1 rounded-sm"
          >
            <Cpu size={10} className="animate-pulse" />
            Inspect Swarm
          </button>
          {alerts.length > 0 && (
            <button 
              type="button"
              onClick={handleAckAllAlerts}
              className="text-[8px] font-bold uppercase tracking-widest border border-black/10 dark:border-white/10 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer rounded-sm"
            >
              Acknowledge All
            </button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="py-6 text-center text-zinc-400 dark:text-zinc-500 text-[11px] font-bold uppercase tracking-widest flex flex-col items-center gap-2">
          <Check size={22} className="text-green-500" />
          No active alerts — all clear
        </div>
      ) : (
        <div className="max-h-[235px] overflow-y-auto divide-y divide-black/5 dark:divide-white/5 pr-1.5">
          {alerts.map(a => {
            const borderCol = a.sev === 'critical' ? 'border-red-500/30' : a.sev === 'warning' ? 'border-amber-500/30' : 'border-blue-500/30';
            const indicatorCol = a.sev === 'critical' ? 'bg-red-500' : a.sev === 'warning' ? 'bg-amber-500' : 'bg-blue-500';
            return (
              <div key={a.id} className={`py-2 flex justify-between items-center gap-3 transition-all hover:bg-black/[0.01] dark:hover:bg-white/[0.02] border-l-2 ${borderCol} pl-2`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1 h-1 rounded-full shrink-0 ${indicatorCol}`} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-acies-gray dark:text-white truncate">{a.title}</p>
                    <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{a.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setSelectedAlert(a)}
                    className="text-[8px] font-extrabold uppercase tracking-widest bg-[#6d28d9] text-white dark:bg-[#a78bfa] dark:text-zinc-950 hover:bg-[#5b21b6] dark:hover:bg-[#c084fc] px-2 py-0.5 rounded-sm transition-all cursor-pointer border-none"
                  >
                    Investigate
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleAckAlert(a.id)}
                    className="text-[8px] font-bold uppercase tracking-widest border border-black/10 dark:border-white/10 px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  return (
    <div className="space-y-4">
      
      {/* Inline Refresh Options */}
      <div className="flex justify-end items-center gap-3 py-0.5">
        {role === 'VP Product Management' && (
          <button
            type="button"
            onClick={() => onAuditClick('Executive Guide')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-600 hover:bg-purple-750 text-white dark:bg-purple-650 dark:hover:bg-purple-550 border border-purple-500/20 text-[8.5px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-sm shadow-sm active:scale-95"
          >
            <BookOpen size={9} />
            View Executive Guide
          </button>
        )}
        <span className="text-[8.5px] font-bold uppercase tracking-widest opacity-40 text-zinc-500 dark:text-zinc-400">
          {lastRefreshed}
        </span>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-1 px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-acies-gray dark:text-white text-[8.5px] font-bold uppercase tracking-widest hover:bg-acies-yellow hover:text-acies-gray transition-all cursor-pointer rounded-sm"
        >
          <RefreshCw size={9} className="animate-spin-slow" />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${role === 'VP Product Management' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3`}>
        {kpis.map((k, i) => {
          const isUp = k.trend >= 0;
          const isRisk = k.label === 'Critical Alerts';
          const trendIcon = isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />;
          const trendColor = isRisk 
            ? (isUp ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10')
            : (isUp ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10');
          
          return (
            <div 
              key={k.label} 
              className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3 h-[115px] flex flex-col justify-between relative overflow-hidden transition-all hover:border-acies-yellow/50 cursor-pointer"
              onClick={() => {
                console.log("KPI card clicked on Home:", k.label);
                if (k.label === 'Total Revenue') onAuditClick('Total Revenue');
                else if (k.label === 'Active SKUs') onAuditClick('Active SKUs');
                else if (k.label === 'Critical Alerts') onAuditClick('Critical Alerts');
                else if (k.label === 'Gross Margin') onAuditClick('Gross Margin');
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: k.color }} />
              <div>
                <p className="text-[8.5px] font-bold uppercase tracking-widest opacity-40 mb-0.5">{k.label}</p>
                <h3 className="text-xl font-display font-bold text-acies-gray dark:text-white leading-none mb-0.5">
                  {k.fmt(k.value)}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className={`text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${trendColor}`}>
                  {trendIcon}
                  {Math.abs(k.trend)}{k.label === 'Total Revenue' ? ' M' : k.label === 'Gross Margin' ? 'pp' : ''} MoM
                </span>
                
                {/* Micro Sparkline Chart */}
                <div className="w-16 h-[22px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={k.sparkPoints}>
                      <defs>
                        <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={k.color} stopOpacity={0.2}/>
                          <stop offset="100%" stopColor={k.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={k.color} 
                        strokeWidth={1.2} 
                        fill={`url(#grad-${i})`} 
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {role === 'Pricing and Margin Partner' && alertsBlock}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Revenue Trend actual vs target */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5 h-[400px] flex flex-col">
          <div className="mb-2.5 flex justify-between items-start">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest">Revenue Trend</h3>
              <p className="text-[8.5px] text-zinc-500 uppercase tracking-widest mt-0.5 leading-normal">
                Monthly Actual vs Target ($ M) — This Year
                <br />
                <span className="text-purple-650 dark:text-purple-400 font-extrabold normal-case">
                  Click any month to forecast next year & review price indexes
                </span>
              </p>
            </div>
            
            {/* Chart Type Toggles */}
            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-md overflow-hidden bg-black/5 dark:bg-white/5 p-0.5 ml-1 shrink-0">
              <button
                type="button"
                onClick={() => setRevenueViewMode('line')}
                className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  revenueViewMode === 'line' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Line Chart"
              >
                <LucideLineChart size={18} />
              </button>
              <button
                type="button"
                onClick={() => setRevenueViewMode('combi')}
                className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  revenueViewMode === 'combi' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Combi Chart (Bar + Line)"
              >
                <Activity size={18} />
              </button>
              <button
                type="button"
                onClick={() => setRevenueViewMode('bar')}
                className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  revenueViewMode === 'bar' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Bar Chart"
              >
                <BarChart2 size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              {revenueViewMode === 'line' ? (
                <LineChart 
                  className="cursor-pointer"
                  data={revenueTrendData} 
                  margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
                  onClick={(state) => { if (state && state.activeLabel) setSelectedTrendMonth(state.activeLabel); }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="month" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }} 
                    itemStyle={{ color: tooltipText, fontSize: 10 }}
                    labelStyle={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="Actual" stroke={accentColor} strokeWidth={2} activeDot={{ r: 5 }} dot={{ r: 2.5 }} />
                  <Line type="monotone" dataKey="Target" stroke={isDarkMode ? '#facc15' : '#d97706'} strokeDasharray="4 4" dot={false} strokeWidth={1.8} />
                </LineChart>
              ) : revenueViewMode === 'combi' ? (
                <ComposedChart 
                  className="cursor-pointer"
                  data={revenueTrendData} 
                  margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
                  onClick={(state) => { if (state && state.activeLabel) setSelectedTrendMonth(state.activeLabel); }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="month" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }} 
                    itemStyle={{ fontSize: 10 }}
                    labelStyle={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Actual" fill={accentColor} radius={[2, 2, 0, 0]} barSize={14} />
                  <Line type="monotone" dataKey="Target" stroke={isDarkMode ? '#facc15' : '#d97706'} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                </ComposedChart>
              ) : (
                <BarChart 
                  className="cursor-pointer"
                  data={revenueTrendData} 
                  margin={{ top: 15, right: 20, left: -10, bottom: 5 }} 
                  barGap={4}
                  onClick={(state) => { if (state && state.activeLabel) setSelectedTrendMonth(state.activeLabel); }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="month" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }} 
                    itemStyle={{ fontSize: 10 }}
                    labelStyle={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Actual" fill={accentColor} radius={[2, 2, 0, 0]} barSize={12} />
                  <Bar dataKey="Target" fill={isDarkMode ? '#facc15' : '#d97706'} radius={[2, 2, 0, 0]} barSize={12} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5 h-[400px] flex flex-col">
          <div className="mb-2.5 flex justify-between items-start">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest">Category Performance</h3>
              <p className="text-[8.5px] text-zinc-550 dark:text-zinc-450 uppercase tracking-widest mt-0.5 leading-normal">
                Revenue $ M by Category — Current Month
                <br />
                <span className="text-blue-500 font-extrabold normal-case">
                  Click any category to view SKU performer, underperformer & booming trends
                </span>
              </p>
            </div>
            
            {/* Chart Type Toggles */}
            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-md overflow-hidden bg-black/5 dark:bg-white/5 p-0.5 ml-1 shrink-0">
              <button
                type="button"
                onClick={() => setCategoryViewMode('donut')}
                className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  categoryViewMode === 'donut' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Donut Chart"
              >
                <PieChart size={18} />
              </button>
              <button
                type="button"
                onClick={() => setCategoryViewMode('bar')}
                className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  categoryViewMode === 'bar' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Bar Chart"
              >
                <BarChart2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => setCategoryViewMode('radar')}
                className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                  categoryViewMode === 'radar' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                }`}
                title="Radar Chart"
              >
                <LucideRadar size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              {categoryViewMode === 'donut' ? (
                <RePieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                    itemStyle={{ fontSize: 10 }}
                    formatter={(value: any) => [`$${value}M`]}
                  />
                  <Pie
                    data={categoryPerfData}
                    cx="50%"
                    cy="40%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    onClick={(data) => { if (data && data.name) setSelectedCategory(data.name); }}
                    cursor="pointer"
                  >
                    {categoryPerfData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 8.5, fontWeight: 'bold', bottom: 5 }}
                    onClick={(data) => { if (data && data.value) setSelectedCategory(data.value); }}
                  />
                </RePieChart>
              ) : categoryViewMode === 'bar' ? (
                <BarChart 
                  data={categoryPerfData} 
                  margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                  onClick={(state) => { if (state && state.activeLabel) setSelectedCategory(state.activeLabel); }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                    itemStyle={{ fontSize: 10 }}
                    formatter={(value: any) => [`$${value}M`]}
                  />
                  <Bar dataKey="value" barSize={18} radius={[3, 3, 0, 0]}>
                    {categoryPerfData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <RadarChart 
                  cx="50%" 
                  cy="50%" 
                  outerRadius="70%" 
                  data={categoryPerfData}
                  onClick={(state) => { if (state && state.activeLabel) setSelectedCategory(state.activeLabel); }}
                  className="cursor-pointer"
                >
                  <PolarGrid stroke={gridStroke} />
                  <PolarAngleAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 8, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 350]} tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 7 }} />
                  <Radar name="Revenue" dataKey="value" stroke={accentColor} fill={accentColor} fillOpacity={0.3} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                    itemStyle={{ fontSize: 10 }}
                    formatter={(value: any) => [`$${value}M`]}
                  />
                </RadarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Row grid */}
      <div className={`grid grid-cols-1 ${role === 'Product Manager' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-4`}>
        
        {/* Top SKU Performance List */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5 h-[400px] flex flex-col">
          <h3 className="text-[11px] font-bold uppercase tracking-widest pb-2 border-b border-black/5 dark:border-white/5 mb-2 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <span>Top SKU Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[7.5px] font-extrabold opacity-40 uppercase">By Revenue</span>
              <div className="flex items-center border border-black/10 dark:border-white/10 rounded-md overflow-hidden bg-black/5 dark:bg-white/5 p-0.5 ml-1 normal-case shrink-0">
                <button
                  onClick={() => setSkuViewMode('list')}
                  className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                    skuViewMode === 'list' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                  }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setSkuViewMode('chart')}
                  className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                    skuViewMode === 'chart' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                  }`}
                  title="Pie Chart View"
                >
                  <PieChart size={18} />
                </button>
              </div>
            </div>
          </h3>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-2.5 border-b border-black/5 dark:border-white/5 pb-2">
            {['All', 'Beverages', 'Dairy', 'Snacks', 'Personal Care', 'Household', 'Beauty', 'Fashion'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all border border-black/5 dark:border-white/10 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-acies-yellow text-acies-gray font-extrabold border-acies-yellow'
                    : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {skuViewMode === 'list' ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 pb-2">
                {topSkus.map(s => {
                  const widthPct = Math.round((s.rev / maxSkuRev) * 100);
                  return (
                    <button
                      key={s.name}
                      onClick={() => setSelectedSku(s)}
                      className="w-full text-left space-y-1 block hover:bg-black/5 dark:hover:bg-white/5 py-1.5 px-2.5 rounded transition-all group cursor-pointer border-none bg-transparent outline-none"
                    >
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-bold text-zinc-700 dark:text-zinc-350 group-hover:text-acies-yellow dark:group-hover:text-acies-yellow truncate max-w-[220px] transition-colors">
                          {s.name}
                        </span>
                        <span className="font-extrabold text-acies-yellow group-hover:underline">${s.rev}M</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-acies-yellow transition-all group-hover:bg-yellow-400" style={{ width: `${widthPct}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex items-center justify-center relative pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                    itemStyle={{ fontSize: 10 }}
                    formatter={(value: any, name: any) => [`$${value}M`, name]}
                  />
                  <Pie
                    data={topSkus}
                    cx="50%"
                    cy="42%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="rev"
                    nameKey="name"
                    onClick={(data) => setSelectedSku(data)}
                    onMouseEnter={(_, idx) => setHoveredSku(topSkus[idx])}
                    onMouseLeave={() => setHoveredSku(null)}
                    cursor="pointer"
                  >
                    {topSkus.map((entry, index) => {
                      const skuColors = ['#6366F1', '#8B5CF6', '#10B981', '#F43F5E', '#EAB308'];
                      return <Cell key={`cell-${index}`} fill={skuColors[index % skuColors.length]} />;
                    })}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: 8.5, fontWeight: 'bold', bottom: 18 }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              
              {/* Dynamic SKU details label at the bottom of the card */}
              <div className="absolute bottom-1 w-full text-center pointer-events-none px-4">
                {hoveredSku ? (
                  <span className="text-[9.5px] font-bold text-zinc-700 dark:text-zinc-350 bg-black/5 dark:bg-white/5 py-0.5 px-2 rounded-sm border border-black/5 dark:border-white/5 inline-block">
                    Hovered: <span className="font-extrabold text-[#6d28d9] dark:text-[#a78bfa]">{hoveredSku.name}</span> (${hoveredSku.rev}M)
                  </span>
                ) : (
                  <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Hover slices to view details
                  </span>
                )}
              </div>
            </div>
          )}

          {/* View All SKUs button at the bottom */}
          <button
            onClick={() => {
              if (onViewAllSkus) {
                onViewAllSkus();
              }
            }}
            className="w-full mt-2.5 py-1.5 border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[9.5px] font-bold text-zinc-705 dark:text-zinc-350 transition-all flex items-center justify-center gap-1 cursor-pointer bg-transparent shrink-0"
            title="View All SKUs in SKU Rationalization Command Desk"
          >
            <span>View All SKUs</span>
          </button>
        </div>

        {/* Products requiring attention (PM only) */}
        {role === 'Product Manager' && (
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5 h-[400px] flex flex-col justify-between">
            <div className="flex flex-col flex-1 min-h-0">
              <h3 className="text-[11px] font-bold uppercase tracking-widest pb-2 border-b border-black/5 dark:border-white/5 mb-2.5 flex items-center justify-between gap-1.5 shrink-0">
                <span>Products requiring attention</span>
                <div className="flex items-center gap-2">
                  <span className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">5 flagged</span>
                  <div className="flex items-center border border-black/10 dark:border-white/10 rounded-md overflow-hidden bg-black/5 dark:bg-white/5 p-0.5 ml-1 normal-case shrink-0">
                    <button
                      type="button"
                      onClick={() => setAttentionViewMode('cards')}
                      className={`p-1 px-2 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                        attentionViewMode === 'cards' 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                      }`}
                      title="Cards View"
                    >
                      <LayoutGrid size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttentionViewMode('progress')}
                      className={`p-1 px-2 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                        attentionViewMode === 'progress' 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                      }`}
                      title="Progress View"
                    >
                      <Activity size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttentionViewMode('table')}
                      className={`p-1 px-2 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                        attentionViewMode === 'table' 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                      }`}
                      title="Table View"
                    >
                      <Table size={12} />
                    </button>
                  </div>
                </div>
              </h3>

              {attentionViewMode === 'cards' ? (
                <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 pr-1.5 pb-2 min-h-0 no-scrollbar">
                  {FLAGGED_SKUS.map(s => {
                    let icon = <TrendingDown size={11} />;
                    let labelColor = 'text-red-500';
                    let valueColor = 'text-red-500';
                    
                    if (s.reason === 'Revenue decline') {
                      icon = <TrendingDown size={11} />;
                      labelColor = 'text-red-500';
                      valueColor = 'text-red-500';
                    } else if (s.reason === 'Margin decline') {
                      icon = <BarChart2 size={11} />;
                      labelColor = 'text-amber-500';
                      valueColor = 'text-amber-500';
                    } else if (s.reason === 'Sentiment drop') {
                      icon = <Frown size={11} />;
                      labelColor = 'text-red-500';
                      valueColor = 'text-red-500';
                    } else if (s.reason === 'Stockout risk') {
                      icon = <AlertTriangle size={11} />;
                      labelColor = 'text-amber-500';
                      valueColor = 'text-amber-500';
                    }

                    return (
                      <div key={s.name} className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-2 rounded-sm flex flex-col justify-between h-[85px] hover:border-acies-yellow/20 transition-all">
                        <div>
                          <div className={`flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider ${labelColor}`}>
                            {icon}
                            <span>{s.reason}</span>
                          </div>
                          <h4 className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200 truncate mt-1 leading-tight" title={s.name}>
                            {s.name}
                          </h4>
                        </div>
                        <div className={`font-black text-[13px] tracking-tight ${valueColor} leading-none mt-1`}>
                          {s.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : attentionViewMode === 'progress' ? (
                <div className="space-y-4 overflow-y-auto flex-1 pr-1.5 pb-2 min-h-0 no-scrollbar">
                  {FLAGGED_SKUS.map(s => (
                    <div key={s.name} className="space-y-1 block py-0.5 px-0.5">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {s.name} <span className="text-[8.5px] font-normal text-zinc-400 dark:text-zinc-500 ml-1.5">{s.reason}</span>
                        </span>
                        <span className={`font-extrabold ${s.isRed ? 'text-red-500' : 'text-amber-500'}`}>{s.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 pr-1.5 pb-2 min-h-0 no-scrollbar">
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="border-b border-black/5 dark:border-white/5 text-[9px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-extrabold">
                        <th className="py-2 px-1">Product</th>
                        <th className="py-2 px-1">Issue</th>
                        <th className="py-2 px-1">Metric</th>
                        <th className="py-2 px-1 text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                      {FLAGGED_SKUS.map(s => (
                        <tr key={s.name} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                          <td className="py-2.5 px-1 font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[145px]" title={s.name}>
                            {s.name}
                          </td>
                          <td className="py-2.5 px-1 text-zinc-455 dark:text-zinc-500 font-semibold">
                            {s.reason.replace(' decline', '').replace(' drop', '').replace(' risk', '')}
                          </td>
                          <td className={`py-2.5 px-1 font-extrabold ${s.isRed ? 'text-red-500' : 'text-amber-500'}`}>
                            {s.value}
                          </td>
                          <td className={`py-2.5 px-1 text-right font-extrabold ${s.isRed ? 'text-red-500' : 'text-amber-500'}`}>
                            <span className="text-xs">↘</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (onViewAllSkus) {
                  onViewAllSkus();
                }
              }}
              className="w-full mt-2.5 py-2 border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[9.5px] font-bold text-zinc-705 dark:text-zinc-350 transition-all flex items-center justify-center gap-1 cursor-pointer bg-transparent shrink-0"
              title="View All Flagged SKUs"
            >
              <span>View all flagged SKUs</span>
              <span className="text-[11px]">&rarr;</span>
            </button>
          </div>
        )}

        {/* Top Customer Insights List */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5 h-[400px] flex flex-col">
          <h3 className="text-[11px] font-bold uppercase tracking-widest pb-2 border-b border-black/5 dark:border-white/5 mb-2 flex items-center justify-between gap-1.5">
            <span>Top Customer Insights</span>
            <span className="text-[7.5px] font-extrabold opacity-40 uppercase">Buying Intent</span>
          </h3>

          {/* Customer Category Filter Pills */}
          <div className="flex flex-wrap gap-1 mb-2 border-b border-black/5 dark:border-white/5 pb-2">
            {['Beverages', 'Snacks', 'Personal Care', 'Dairy', 'Household', 'Beauty', 'Fashion'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCustomerCategory(cat)}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border border-black/5 dark:border-white/10 cursor-pointer ${
                  activeCustomerCategory === cat
                    ? 'bg-acies-yellow text-acies-gray font-extrabold border-acies-yellow'
                    : 'bg-black/5 dark:bg-white/5 text-zinc-650 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto pr-1 pb-1 space-y-2 min-h-0 no-scrollbar">
            {(CUSTOMER_INSIGHTS[activeCustomerCategory] || []).map((c) => {
              const trendCol = c.growthDirection === 'up' ? 'text-green-500' : c.growthDirection === 'down' ? 'text-red-500' : 'text-zinc-550';
              return (
                <div
                  key={c.name}
                  className="bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/5 p-2 rounded-sm space-y-1 hover:border-acies-yellow/30 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200 truncate max-w-[170px]">
                        {c.name}
                      </h4>
                      <p className="text-[8px] text-zinc-500 font-semibold tracking-wide truncate max-w-[170px]">
                        {c.segment}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9.5px] font-mono font-bold text-acies-yellow block">
                        {c.revContribution}
                      </span>
                      <span className={`text-[7.5px] font-bold ${trendCol}`}>
                        {c.growthTrend}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-650 dark:text-zinc-400 leading-normal">
                      <span className="font-bold text-zinc-850 dark:text-zinc-300">Interest: </span>
                      {c.interestTrend}
                    </p>
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[7.5px] font-bold text-zinc-500 uppercase shrink-0">Focus:</span>
                      {c.buyingFocus.map(focusItem => (
                        <span
                          key={focusItem}
                          className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-1 py-0.5 rounded-sm text-[7.5px] font-bold text-[#6d28d9] dark:text-[#a78bfa] truncate max-w-[110px]"
                        >
                          {focusItem}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecast vs Actual by Region */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5 h-[400px] flex flex-col">
          <h3 className="text-[11px] font-bold uppercase tracking-widest pb-2 border-b border-black/5 dark:border-white/5 mb-2 flex items-center justify-between gap-1.5">
            <span>Regional Forecast</span>
            <div className="flex items-center gap-2">
              <span className="text-[7.5px] font-extrabold opacity-40 uppercase">Actual vs Target</span>
              <div className="flex items-center border border-black/10 dark:border-white/10 rounded-md overflow-hidden bg-black/5 dark:bg-white/5 p-0.5 ml-1 normal-case shrink-0">
                <button
                  onClick={() => setRegionViewMode('list')}
                  className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                    regionViewMode === 'list' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                  }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setRegionViewMode('chart')}
                  className={`p-1.5 px-2.5 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm shrink-0 ${
                    regionViewMode === 'chart' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                  }`}
                  title="Grouped Bar Chart"
                >
                  <BarChart2 size={18} />
                </button>
              </div>
            </div>
          </h3>
          
          {regionViewMode === 'list' ? (
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 min-h-0">
              {VP_FORECAST.map(f => {
                const widthPct = Math.min(100, Math.round((f.actual / f.target) * 100));
                const deltaColor = f.up ? 'text-green-500' : 'text-red-500';
                return (
                  <button
                    key={f.region}
                    onClick={() => setSelectedRegion(f)}
                    className="w-full text-left space-y-1.5 block hover:bg-black/5 dark:hover:bg-white/5 py-1.5 px-2.5 rounded transition-all group cursor-pointer border-none bg-transparent outline-none"
                  >
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-bold text-zinc-700 dark:text-zinc-350 group-hover:text-acies-yellow dark:group-hover:text-acies-yellow transition-colors">{f.region}</span>
                      <span className={`font-extrabold ${deltaColor} group-hover:underline`}>{f.delta}</span>
                    </div>
                    <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-acies-yellow transition-all group-hover:bg-yellow-400" style={{ width: `${widthPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-550 dark:text-zinc-450 font-semibold uppercase tracking-wider">
                      <span>Actual: ${f.actual}M</span>
                      <span>Target: ${f.target}M</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col justify-between pt-1 pb-0.5">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={VP_FORECAST} barGap={4} margin={{ top: 35, right: 15, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis 
                      dataKey="region" 
                      tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      domain={[0, 350]}
                      ticks={[0, 50, 100, 150, 200, 250, 300, 350]}
                      tickFormatter={(val) => `$${val}`}
                      tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 8, fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false}
                      width={35}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                      itemStyle={{ fontSize: 10 }}
                      formatter={(value: any) => [`$${value}M`]}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="left"
                      iconType="square"
                      height={25}
                      iconSize={10}
                      wrapperStyle={{ fontSize: 10, fontWeight: 'bold', top: 0, paddingLeft: 10 }}
                    />
                    <Bar 
                      dataKey="actual" 
                      name="Actual" 
                      fill={isDarkMode ? '#818cf8' : '#4f46e5'} 
                      barSize={30} 
                      radius={[4, 4, 0, 0]} 
                      onClick={(data) => setSelectedRegion(data)}
                      cursor="pointer"
                    />
                    <Bar 
                      dataKey="target" 
                      name="Target" 
                      fill={isDarkMode ? '#facc15' : '#ca8a04'} 
                      barSize={30} 
                      radius={[4, 4, 0, 0]} 
                      onClick={(data) => setSelectedRegion(data)}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center mt-1.5">
                Click bars to open regional mitigation controls
              </div>
            </div>
          )}
        </div>
      </div>

      {(role === 'VP Product Management' || role === 'Product Manager') && (
        <div className="space-y-4 mt-4">
          <div>
            {alertsBlock}
          </div>

          {/* FULL WIDTH: LIVE INDUSTRY UPDATES */}
          <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Live Industry Updates</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1 text-[9px] font-bold text-zinc-600 dark:text-zinc-400 outline-none cursor-pointer"
                >
                  <option value="all">All Events</option>
                  <option value="Supply">Supply</option>
                  <option value="Demand">Demand</option>
                  <option value="Margin">Margin</option>
                  <option value="Launch">Launch</option>
                  <option value="Finance">Finance</option>
                </select>

                {/* Layout Toggle Buttons */}
                <div className="flex items-center border border-black/10 dark:border-white/10 rounded-sm overflow-hidden bg-black/5 dark:bg-white/5 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewFormat('grid')}
                    className={`p-1 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm ${
                      viewFormat === 'grid' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewFormat('table')}
                    className={`p-1 transition-all cursor-pointer border-none flex items-center justify-center rounded-sm ${
                      viewFormat === 'table' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 bg-transparent'
                    }`}
                    title="Table View"
                  >
                    <List size={11} />
                  </button>
                </div>

                {/* Calendar Button */}
                <button
                  type="button"
                  onClick={() => setCalendarOpen(true)}
                  className="px-2 py-0.5 transition-all cursor-pointer border border-black/10 dark:border-white/10 rounded-sm flex items-center justify-center gap-1.5 bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-black/10 dark:hover:bg-white/10 h-[21px] text-[9px] font-bold"
                  title="Open Calendar"
                >
                  <Calendar size={11} />
                  <span>Calendar</span>
                </button>
              </div>
            </div>

            {/* Scrollable event lists in a horizontal multi-column grid or table */}
            <div className="overflow-y-auto space-y-2 max-h-[300px] pr-1">
              {viewFormat === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredEvents.map((ev, i) => (
                    <div 
                      key={ev.id} 
                      className={`flex items-start justify-between gap-3 p-3.5 rounded-sm border border-black/5 dark:border-white/5 transition-all text-xs h-full ${
                        i === 0 ? 'bg-black/[0.02] dark:bg-white/5 animate-pulse border-emerald-500/35 shadow-sm' : 'bg-transparent'
                      }`}
                    >
                      <div className="flex gap-2 min-w-0">
                        <span 
                          className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" 
                          style={{ backgroundColor: ev.sevC }} 
                        />
                        <div className="min-w-0">
                          <p className="text-zinc-800 dark:text-zinc-200 leading-snug font-semibold break-words">{ev.msg}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span 
                              className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                              style={{ backgroundColor: `${ev.sevC}15`, color: ev.sevC }}
                            >
                              {ev.type}
                            </span>
                            <span className="text-[8px] opacity-40 font-bold uppercase">{ev.sev}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-550 font-mono whitespace-nowrap">{ev.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full overflow-x-auto border border-black/5 dark:border-white/10 rounded-sm">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-[9px] uppercase tracking-wider font-bold text-zinc-400">
                        <th className="py-2.5 px-4 w-[60px]">Status</th>
                        <th className="py-2.5 px-4 min-w-[200px]">Description</th>
                        <th className="py-2.5 px-4 w-[100px]">Category</th>
                        <th className="py-2.5 px-4 w-[100px]">Priority</th>
                        <th className="py-2.5 px-4 w-[100px] text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                      {filteredEvents.map((ev, i) => (
                        <tr 
                          key={ev.id} 
                          className={`hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors ${
                            i === 0 ? 'bg-black/[0.02] dark:bg-white/5 animate-pulse' : 'bg-transparent'
                          }`}
                        >
                          <td className="py-2.5 px-4">
                            <div className="flex items-center justify-center">
                              <span 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: ev.sevC, boxShadow: `0 0 6px ${ev.sevC}66` }} 
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-zinc-800 dark:text-zinc-200 leading-snug break-words">
                            {ev.msg}
                          </td>
                          <td className="py-2.5 px-4 font-bold">
                            <span 
                              className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm"
                              style={{ backgroundColor: `${ev.sevC}15`, color: ev.sevC }}
                            >
                              {ev.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 uppercase text-[9px] font-bold text-zinc-400">
                            {ev.sev}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-[9.5px] text-zinc-500 dark:text-zinc-400 font-semibold whitespace-nowrap">
                            {ev.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sku Details Modal */}
      <SkuDetailsModal 
        isOpen={!!selectedSku} 
        sku={selectedSku} 
        onClose={() => setSelectedSku(null)}
        onRequestAction={(email, name, subject, body) => {
          setEmailData({ to: email, name, subject, body });
          setIsEmailOpen(true);
        }}
      />

      {/* Regional Forecast Modal */}
      <RegionalForecastModal 
        isOpen={!!selectedRegion}
        region={selectedRegion}
        onClose={() => setSelectedRegion(null)}
        onRequestAction={(email, name, subject, body) => {
          setEmailData({ to: email, name, subject, body });
          setIsEmailOpen(true);
        }}
      />

      {/* Trend Month Forecast Modal */}
      <TrendMonthForecastModal 
        isOpen={!!selectedTrendMonth}
        month={selectedTrendMonth}
        onClose={() => setSelectedTrendMonth(null)}
      />

      {/* Category Performance Details Modal */}
      <CategoryPerformanceDetailsModal 
        isOpen={!!selectedCategory}
        categoryName={selectedCategory}
        onClose={() => setSelectedCategory(null)}
      />

      {/* Smart Alert Details Modal */}
      <SmartAlertDetailsModal 
        isOpen={!!selectedAlert}
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onScheduleMeeting={(alert) => {
          setActiveAlertMeeting(alert);
          setSelectedAlert(null);
        }}
      />

      {/* Agentic Alert Explanation Modal */}
      <AgenticAlertExplanationModal
        isOpen={isAgenticExplanationOpen}
        onClose={() => setIsAgenticExplanationOpen(false)}
        alerts={alerts}
        isDarkMode={isDarkMode}
        onInvestigateAlert={(alertId) => {
          setIsAgenticExplanationOpen(false);
          const found = alerts.find(a => a.id === alertId);
          if (found) {
            setSelectedAlert(found);
          }
        }}
      />

      {/* Schedule Sync Meeting Modal */}
      <ScheduleMeetingModal 
        isOpen={!!activeAlertMeeting}
        approval={activeAlertMeeting ? {
          id: activeAlertMeeting.id,
          title: activeAlertMeeting.title,
          type: activeAlertMeeting.id === 'a1' || activeAlertMeeting.id === 'a5' ? 'Launch' :
                activeAlertMeeting.id === 'a2' || activeAlertMeeting.id === 'a6' ? 'Promo' :
                activeAlertMeeting.id === 'a3' ? 'Pricing' : 'Rationalize',
          age: '1d',
          urgency: activeAlertMeeting.sev === 'critical' ? 'high' : 'medium',
          done: false
        } : null}
        onClose={() => setActiveAlertMeeting(null)}
        onRequestAction={(email, name, subject, body) => {
          setEmailData({ to: email, name, subject, body });
          setIsEmailOpen(true);
          setAlerts(prev => prev.filter(a => a.id !== activeAlertMeeting?.id));
          setActiveAlertMeeting(null);
        }}
      />

      {/* Strategic Forecast & Pricing Review (Month Forecast) Modal */}
      <MonthForecastModal
        isOpen={!!selectedMonth}
        month={selectedMonth}
        onClose={() => setSelectedMonth(null)}
      />

      {/* Email Composer Modal */}
      <EmailComposerModal 
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        initialEmail={emailData}
        onSend={(recipientName, recipientEmail, subject, body) => {
          setToastMessage(`Mitigation request successfully sent to ${recipientName}!`);
          setTimeout(() => setToastMessage(null), 4000);
          setIsEmailOpen(false);
        }}
      />

      {/* Events Calendar Modal */}
      <EventsCalendarModal 
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Floating Premium Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[200] animate-toast-slide-in flex items-center gap-3 bg-zinc-950/95 dark:bg-white/95 text-white dark:text-zinc-900 border border-white/10 dark:border-black/10 px-4 py-3 rounded shadow-2xl backdrop-blur-md max-w-sm">
          <style>{`
            @keyframes toastSlideIn {
              0% { transform: translateY(100px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            .animate-toast-slide-in {
              animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div className="bg-green-500 rounded-full p-1 text-white shrink-0">
            <Check size={14} strokeWidth={3} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">System Notification</p>
            <p className="text-[11px] font-bold leading-normal mt-0.5">{toastMessage}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)} 
            className="text-zinc-400 hover:text-white dark:text-zinc-500 dark:hover:text-zinc-900 cursor-pointer border-none bg-transparent"
          >
            <X size={14} />
          </button>
        </div>
      )}

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
              <h5 className="text-[11px] font-bold text-zinc-850 dark:text-zinc-150 leading-none">{t.title}</h5>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{t.body}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
