import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, AlertCircle, AlertTriangle, Info, Plus, Check, Play, Inbox, Mail, Send,
  Filter, RefreshCw, Download, Zap, TrendingUp, HelpCircle, Activity, Globe, MapPin, ArrowUpRight, BarChart2, ShieldAlert, Smile, ChevronRight,
  ArrowLeft, CheckCircle2, X, Brain, User, Users, Clock, Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line, BarChart, Bar, Cell
} from 'recharts';
import { Role } from '../../../types/dashboard';
import { EmailComposerModal } from '../portfolio-health/EmailComposerModal';
import { SuccessFeedbackModal } from '../portfolio-health/SuccessFeedbackModal';
import { ResolveSignalModal } from './ResolveSignalModal';
import { AIPredictionModal } from './AIPredictionModal';
import { ExploreSignalDetailModal, ExploreSignal } from './ExploreSignalDetailModal';

const RECIPIENT_TITLES: Record<string, string> = {
  'ananya.sen@aciesglobal.com': 'VP Finance',
  'vikram.solanki@aciesglobal.com': 'QC Manager & Logistics Lead',
  'priya.sharma@aciesglobal.com': 'Product Manager',
  'rajendra.patel@aciesglobal.com': 'Vapi Hub Director',
  'amit.verma@aciesglobal.com': 'NPD Lead',
  'karan.johar@aciesglobal.com': 'Retail Relations Director'
};


interface SignalsBoardProps {
  role: Role;
  setActiveTab: (tab: number) => void;
  isDarkMode: boolean;
  onExploreToggle?: (isOpen: boolean) => void;
}

interface Signal {
  id: number;
  title: string;
  sev: 'critical' | 'warning' | 'info';
  type: string;
  detail: string;
  ack: boolean;
}

interface InboxMessage {
  id: number;
  from: string;
  fromInitials: string;
  fromColor: string;
  type: 'email' | 'message';
  subject: string;  body: string;
  time: string;
  read: boolean;
}


const skuComparisonData: Record<string, {
  you: {
    name: string;
    brand: string;
    priceHistory: string;
    prices: number[];
    campaigns: number;
    discountPill: string;
    availability: string;
    availabilityPct: number;
    trend: string;
  };
  rival1: {
    name: string;
    desc: string;
    priceHistory: string;
    prices: number[];
    campaigns: number;
    discountPill: string;
    availability: string;
    availabilityPct: number;
    trend: string;
  };
  rival2: {
    name: string;
    desc: string;
    priceHistory: string;
    prices: number[];
    campaigns: number;
    discountPill: string;
    availability: string;
    availabilityPct: number;
    trend: string;
  };
  alerts: string[];
}> = {
  Lays: {
    you: {
      name: "Lay's Classic 52g",
      brand: "PepsiCo",
      priceHistory: "₹20 → ₹20",
      prices: [8, 8, 5, 8, 3, 8, 8],
      campaigns: 4,
      discountPill: "Balanced – moderate, rotating promos",
      availability: "In stock",
      availabilityPct: 92,
      trend: "Up 10% vs last quarter"
    },
    rival1: {
      name: "Frito Balaji",
      desc: "Direct chips competitor • Metro & Tier 2",
      priceHistory: "₹19 → ₹21",
      prices: [5, 5, 7, 5, 6, 8, 10],
      campaigns: 6,
      discountPill: "Deep & rare – 20-25% off, ~5x/qtr",
      availability: "In stock",
      availabilityPct: 96,
      trend: "Up 30% vs last quarter"
    },
    rival2: {
      name: "Haldiram's",
      desc: "Namkeen / adjacent snacking • All markets",
      priceHistory: "₹18 → ₹18",
      prices: [4, 4, 4, 4, 6, 6, 6],
      campaigns: 1,
      discountPill: "Rarely discounts – trust-led, not price-led",
      availability: "Limited SKUs",
      availabilityPct: 78,
      trend: "Flat, no change"
    },
    alerts: [
      "You're 11% pricier than Haldiram's right now on current price.",
      "Haldiram's has availability gaps (78% of outlets) — a distribution push here can win shelf space without touching price.",
      "You're 67% pricier than Store-brand Chips right now on current price.",
      "Store-brand Chips has availability gaps (61% of outlets) — a distribution push here can win shelf space without touching price.",
      "Store-brand Chips is running 11 campaigns/quarter vs your 4 — they're out-pacing you on frequency, not just depth."
    ]
  },
  Doritos: {
    you: {
      name: "Doritos Nacho Cheese 60g",
      brand: "PepsiCo",
      priceHistory: "₹30 → ₹30",
      prices: [10, 10, 8, 10, 6, 10, 10],
      campaigns: 5,
      discountPill: "High-margin premium – selective promos",
      availability: "In stock",
      availabilityPct: 95,
      trend: "Up 15% vs last quarter"
    },
    rival1: {
      name: "Frito Balaji",
      desc: "Direct chips competitor • Metro & Tier 2",
      priceHistory: "₹28 → ₹32",
      prices: [7, 7, 9, 8, 8, 9, 10],
      campaigns: 7,
      discountPill: "Deep & rare – 20-25% off, ~5x/qtr",
      availability: "In stock",
      availabilityPct: 94,
      trend: "Up 25% vs last quarter"
    },
    rival2: {
      name: "Haldiram's",
      desc: "Namkeen / adjacent snacking • All markets",
      priceHistory: "₹25 → ₹25",
      prices: [6, 6, 6, 6, 8, 8, 8],
      campaigns: 2,
      discountPill: "Value pricing – moderate promos",
      availability: "Limited SKUs",
      availabilityPct: 80,
      trend: "Flat, no change"
    },
    alerts: [
      "You're 20% pricier than Haldiram's right now on current price.",
      "Haldiram's has availability gaps (80% of outlets) — a distribution push here can win shelf space without touching price.",
      "You're 66% pricier than Store-brand Chips right now on current price.",
      "Store-brand Chips has availability gaps (65% of outlets) — a distribution push here can win shelf space without touching price.",
      "Store-brand Chips is running 14 campaigns/quarter vs your 5 — they're out-pacing you on frequency, not just depth."
    ]
  },
  Kurkure: {
    you: {
      name: "Kurkure Masala Munch 50g",
      brand: "PepsiCo",
      priceHistory: "₹15 → ₹15",
      prices: [6, 6, 4, 6, 3, 6, 6],
      campaigns: 3,
      discountPill: "Mass market – high volume strategy",
      availability: "In stock",
      availabilityPct: 90,
      trend: "Up 5% vs last quarter"
    },
    rival1: {
      name: "Frito Balaji",
      desc: "Direct chips competitor • Metro & Tier 2",
      priceHistory: "₹14 → ₹16",
      prices: [4, 4, 5, 4, 5, 6, 7],
      campaigns: 5,
      discountPill: "Moderate – seasonal discounts",
      availability: "In stock",
      availabilityPct: 95,
      trend: "Up 35% vs last quarter"
    },
    rival2: {
      name: "Haldiram's",
      desc: "Namkeen / adjacent snacking • All markets",
      priceHistory: "₹12 → ₹12",
      prices: [3, 3, 3, 3, 4, 4, 4],
      campaigns: 1,
      discountPill: "Lowest price – bare minimum discounts",
      availability: "Limited SKUs",
      availabilityPct: 75,
      trend: "Flat, no change"
    },
    alerts: [
      "You're 25% pricier than Haldiram's right now on current price.",
      "Haldiram's has availability gaps (75% of outlets) — a distribution push here can win shelf space without touching price.",
      "You're 50% pricier than Store-brand Chips right now on current price.",
      "Store-brand Chips has availability gaps (60% of outlets) — a distribution push here can win shelf space without touching price.",
      "Store-brand Chips is running 9 campaigns/quarter vs your 3 — they're out-pacing you on frequency, not just depth."
    ]
  }
};

export const SignalsBoard: React.FC<SignalsBoardProps> = ({ role, setActiveTab, isDarkMode, onExploreToggle }) => {
  if (role === 'VP Product Management') {
    return <VPSignalsBoardView isDarkMode={isDarkMode} setActiveTab={setActiveTab} onExploreToggle={onExploreToggle} />;
  }
  const accentColor = isDarkMode ? '#a78bfa' : '#6d28d9';
  // Accordion guide
  const [guideOpen, setGuideOpen] = useState(false);

  // Initial signals based on prototype
  const [signals, setSignals] = useState<Signal[]>([
    { id: 1, title: 'Fabric Softener stockout — 7 events Q4', sev: 'critical', type: 'Supply', detail: 'Highest stockout frequency in portfolio. Lead time 35 days is 2.5× benchmark.', ack: false },
    { id: 2, title: 'Choco Wafers promo dependency at 72%', sev: 'critical', type: 'Margin', detail: 'Only 28% of revenue is organic. Margin collapses if promo budget cut.', ack: false },
    { id: 3, title: 'Green Tea RTD revenue declining YoY −4%', sev: 'warning', type: 'Demand', detail: 'Also 62% promo dependent. Double-risk SKU — flag for rationalization review.', ack: false },
    { id: 4, title: 'Herbal Shampoo growth at 28% — scale supply', sev: 'info', type: 'Supply', detail: 'Fastest-growing SKU. Lead time 11 days allows rapid ramp-up.', ack: false },
    { id: 5, title: 'Beverages cannibalization risk elevated', sev: 'warning', type: 'Cannibalization', detail: 'Mango Fizz variants showing −0.62 promo correlation. Review variant architecture.', ack: false },
    { id: 6, title: 'Floor Cleaner complexity score 0.74', sev: 'warning', type: 'Supply', detail: 'Highest complexity + lowest value. Priority rationalization candidate.', ack: false },
  ]);

  // Form states
  const [sigTitle, setSigTitle] = useState('');
  const [sigSev, setSigSev] = useState<'critical' | 'warning' | 'info'>('warning');
  const [sigType, setSigType] = useState('Supply');
  const [sigDetail, setSigDetail] = useState('');

  // Active severity filter
  const [sevFilter, setSevFilter] = useState<string>('all');

  // Competitor Analysis Decision Console States
  const [activeEngine, setActiveEngine] = useState<'promo' | 'pricing' | 'compete' | 'bundle' | 'estimate'>('promo');
  const [promoProduct, setPromoProduct] = useState('Lays');
  const [promoDiscount, setPromoDiscount] = useState(20);
  const [promoWeeks, setPromoWeeks] = useState(3);
  const [promoBudget, setPromoBudget] = useState(10.0);
  
  // PricingAI (Pepsi / Mountain Dew Elasticity Engine)
  const [pepsiPrice, setPepsiPrice] = useState(20);
  const [mtnDewPrice, setMtnDewPrice] = useState(22);
  const [pricingProduct, setPricingProduct] = useState('Pepsi'); // back-compatibility
  const [pricingOurPrice, setPricingOurPrice] = useState(20); // back-compatibility
  const [pricingRivalPrice, setPricingRivalPrice] = useState(18); // back-compatibility

  const [selectedSKU, setSelectedSKU] = useState<string | null>(null);

  const [competeRivalReaction, setCompeteRivalReaction] = useState<'aggressive' | 'moderate' | 'passive'>('aggressive');
  const [competeOurPromoDepth, setCompeteOurPromoDepth] = useState(25);

  const [bundleSelection, setBundleSelection] = useState('Snacks+Soda');
  const [bundleDiscount, setBundleDiscount] = useState(15);

  const [estimateSeasonality, setEstimateSeasonality] = useState<'high' | 'normal' | 'low'>('normal');
  const [estimateInflation, setEstimateInflation] = useState(5);


  // Role-based mock inbox messages
  const [inboxMessages, setInboxMessages] = useState<Record<string, InboxMessage[]>>({
    'Product Manager': [
      { id: 1, from: 'Vikram Anand', fromInitials: 'VA', fromColor: '#534AB7', type: 'email', subject: 'Sunset Approval Escalation — Q4', body: 'Priya, please check Choco Wafers dependency in Tab 4. We need to validate a sunset schedule before the executive review on Friday.', time: '10m ago', read: false },
      { id: 2, from: 'Rohan Mehta', fromInitials: 'RM', fromColor: '#854F0B', type: 'message', subject: 'Margin Leakage — Green Tea RTD', body: 'Priya, Green Tea RTD YoY growth dropped below -4%. I have flagged a Warning alert on your Signals Board.', time: '1h ago', read: false }
    ],
    'Pricing and Margin Partner': [
      { id: 3, from: 'Vikram Anand', fromInitials: 'VA', fromColor: '#534AB7', type: 'email', subject: 'Pricing Elasticity Simulation sign-off', body: 'Rohan, please review margin waterfalls and adjust pricing sliders for beverages. We need to protect the 40% margin target.', time: '30m ago', read: false }
    ],
    'VP Product Management': [
      { id: 4, from: 'Priya Sharma', fromInitials: 'PS', fromColor: '#0F6E56', type: 'message', subject: 'Mango Fizz 750ml Launch Brief', body: 'Vikram, I have uploaded the Mango Fizz new launch brief in Tab 2. Scores are at 88/100, ready for your sign-off.', time: '15m ago', read: false }
    ]
  });

  const handleAddSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigTitle.trim()) {
      alert('Please enter a signal title.');
      return;
    }

    const newSignal: Signal = {
      id: Date.now(),
      title: sigTitle,
      sev: sigSev,
      type: sigType,
      detail: sigDetail.trim() || 'No detail provided.',
      ack: false
    };

    setSignals(prev => [newSignal, ...prev]);
    setSigTitle('');
    setSigDetail('');
  };

  const handleToggleAck = (id: number) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, ack: !s.ack } : s));
  };

  const handleMarkRead = (id: number) => {
    const roleKey = role === 'Pricing and Margin Partner' ? 'Pricing and Margin Partner' : role === 'Product Manager' ? 'Product Manager' : 'VP Product Management';
    setInboxMessages(prev => {
      const list = prev[roleKey] || [];
      return {
        ...prev,
        [roleKey]: list.map(m => m.id === id ? { ...m, read: true } : m)
      };
    });
  };

  // Determine filtered signals
  const filteredSignals = sevFilter === 'all' 
    ? signals 
    : signals.filter(s => s.sev === sevFilter);

  // Generate 30 days historical timeline data (stable with slight random fluctuation)
  const generateTimelineData = () => {
    const dates = [];
    const baseDate = new Date();
    
    // stable seeds
    const critSeed = [1, 2, 0, 1, 2, 3, 1, 0, 2, 1, 1, 2, 0, 1, 2, 1, 2, 3, 1, 0, 1, 2, 0, 2, 1, 1, 0, 2, 1, 2];
    const warnSeed = [3, 4, 2, 3, 4, 3, 2, 3, 4, 4, 3, 2, 3, 4, 2, 3, 4, 3, 4, 2, 3, 4, 3, 2, 4, 3, 2, 3, 4, 3];
    const infoSeed = [2, 1, 3, 2, 1, 2, 3, 2, 1, 2, 3, 1, 2, 3, 2, 1, 2, 2, 3, 1, 2, 1, 3, 2, 1, 2, 3, 1, 2, 3];

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(baseDate.getDate() - 30 + i);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dates.push({
        date: dateStr,
        Critical: critSeed[i],
        Warning: warnSeed[i],
        Info: infoSeed[i]
      });
    }
    return dates;
  };

  const timelineData = generateTimelineData();

  // Active messages based on role
  const roleKey = role === 'Pricing and Margin Partner' ? 'Pricing and Margin Partner' : role === 'Product Manager' ? 'Product Manager' : 'VP Product Management';
  const roleMessages = inboxMessages[roleKey] || [];
  const unreadCount = roleMessages.filter(m => !m.read).length;


  // ────────────────────────────────────────────────────────────────────────
  // COMPETITOR ANALYSIS DECISION CONSOLE MATH ENGINE
  // ────────────────────────────────────────────────────────────────────────
  
  // 1. PromoAI Calculations
  const promoBaseUnits = 1000;
  const promoBasePrice = 20;
  const promoBaseCost = 11;
  const promoBaseMargin = promoBasePrice - promoBaseCost; // 9
  
  const promoFatigue = 1.0 - Math.exp(-promoWeeks / 2.0);
  const promoLiftFactor = (promoDiscount / 100) * 2.08 * promoFatigue;
  const promoPredictedUnits = Math.round(promoBaseUnits * (1.0 + promoLiftFactor));
  const promoLiftPct = Math.round(promoLiftFactor * 100);
  
  const promoEstSpend = Math.round((promoDiscount / 100) * promoBasePrice * promoPredictedUnits);
  const promoDiscountedMargin = promoBaseMargin - (promoDiscount / 100) * promoBasePrice;
  const promoEstProfit = Math.round(promoPredictedUnits * promoDiscountedMargin);
  
  const promoRoiVerdict = promoEstProfit >= (promoBaseUnits * promoBaseMargin) ? 'HIGH ROI' : 'LOW ROI';
  const promoVerdictText = promoRoiVerdict === 'LOW ROI'
    ? "Volume lift doesn't cover the margin given up. MILP would rank this plan low in the calendar."
    : "Strong volume lift offsets the margin reduction. MILP recommends executing this promo in the next cycle.";
    
  const promoRivalDepth = 20;
  const promoRivalText = promoDiscount > promoRivalDepth
    ? `AGGRESSIVE — you are undercutting Frito Balaji by running a deeper discount.`
    : promoDiscount === promoRivalDepth
      ? `MATCHED — you're running about the same depth as Frito Balaji`
      : `CONSERVATIVE — you are running a shallower discount than Frito Balaji.`;

  // 2. PricingAI Calculations (Pepsi & Mountain Dew Elasticity + Cross-elasticity Engine)
  const pricingPepsiBaseUnits = 10000;
  const pricingMtnDewBaseUnits = 6000;
  
  const pricingPepsiDemand = Math.max(0, Math.round(pricingPepsiBaseUnits - 800 * (pepsiPrice - 20) + 200 * (mtnDewPrice - 22)));
  const pricingMtnDewDemand = Math.max(0, Math.round(pricingMtnDewBaseUnits - 500 * (mtnDewPrice - 22) + 150 * (pepsiPrice - 20)));
  
  const pricingEstRevenue = pricingPepsiDemand * pepsiPrice + pricingMtnDewDemand * mtnDewPrice;
  const pricingEstProfit = pricingPepsiDemand * (pepsiPrice - 9) + pricingMtnDewDemand * (mtnDewPrice - 10);
  
  const pricingAvgPrice = (pepsiPrice + mtnDewPrice) / 2;
  const pricingRivalAvgPrice = (21.00 + 21.50) / 2; // 21.25
  
  let pricingVerdict = 'PRICED IN LINE';
  let pricingVerdictText = "Solid combination — good margin on both products with demand balanced between them.";
  if (pricingAvgPrice > pricingRivalAvgPrice + 0.50) {
    pricingVerdict = 'PREMIUM PRICING';
    pricingVerdictText = "Portfolio is priced at a premium compared to Coke & Sprite equivalents. Volume will slow, but unit margin is protected.";
  } else if (pricingAvgPrice < pricingRivalAvgPrice - 0.50) {
    pricingVerdict = 'DISCOUNT PRICING';
    pricingVerdictText = "Portfolio is priced at a discount compared to Coke & Sprite equivalents. High volume lift, but unit margins are squeezed.";
  }

  // Fallbacks for compatibility with legacy references
  const pricingPredictedUnits = pricingPepsiDemand;
  const pricingVolumeChange = (pricingPepsiDemand - 10000) / 10000;

  // 3. CompeteAI Calculations
  const competeBaseUnits = 1000;
  let competeReactionFactor = 1.0;
  if (competeRivalReaction === 'aggressive') competeReactionFactor = 0.5;
  else if (competeRivalReaction === 'moderate') competeReactionFactor = 0.8;
  
  const competeLiftFactor = (competeOurPromoDepth / 100) * 2.2 * competeReactionFactor;
  const competePredictedUnits = Math.round(competeBaseUnits * (1.0 + competeLiftFactor));
  const competeEstSpend = Math.round((competeOurPromoDepth / 100) * 20 * competePredictedUnits);
  const competeDiscountedMargin = 9 - (competeOurPromoDepth / 100) * 20;
  const competeEstProfit = Math.round(competePredictedUnits * competeDiscountedMargin);
  
  const competeVerdict = competeRivalReaction === 'aggressive'
    ? 'RIVAL MATCHED'
    : competeRivalReaction === 'moderate'
      ? 'MODERATE VALUE'
      : 'HIGH CAPTURE';
      
  const competeVerdictText = competeVerdict === 'RIVAL MATCHED'
    ? "Rival matched your discount. Margin is compromised with little incremental volume gain."
    : competeVerdict === 'MODERATE VALUE'
      ? "Rival reaction is limited. You will capture moderate volume but margin is slightly compressed."
      : "No rival reaction. You will capture maximum market share with high ROI.";

  // 4. BundleAI Calculations
  const bundleBaseUnits = 1000;
  const bundleLiftFactor = (bundleDiscount / 100) * 3.0;
  const bundlePredictedUnits = Math.round(bundleBaseUnits * (1.0 + bundleLiftFactor));
  const bundleEstSpend = Math.round((bundleDiscount / 100) * 35 * bundlePredictedUnits);
  const bundleEstProfit = Math.round(bundlePredictedUnits * (15 - (bundleDiscount / 100) * 35));
  
  const bundleVerdict = bundleDiscount > 20
    ? 'MARGIN EROSION'
    : bundleDiscount < 10
      ? 'LOW APPEAL'
      : 'BASKET EXPANSION';
      
  const bundleVerdictText = bundleVerdict === 'MARGIN EROSION'
    ? "Discount is too high. Basket expansion is offset by excessive margin dilution."
    : bundleVerdict === 'LOW APPEAL'
      ? "Discount is too low to drive customer adoption. Basket size remains flat."
      : "Optimal bundle discount. Drives substantial cross-category volume lift.";

  // 5. EstimateAI Calculations
  const estimateBaseUnits = 1000;
  const estimateCogs = Math.round(11 * (1.0 + estimateInflation / 100) * 10) / 10;
  let estimateDemandIndex = 1.0;
  if (estimateSeasonality === 'high') estimateDemandIndex = 1.4;
  else if (estimateSeasonality === 'low') estimateDemandIndex = 0.7;
  
  const estimatePredictedUnits = Math.round(estimateBaseUnits * estimateDemandIndex);
  const estimateEstRevenue = estimatePredictedUnits * 20;
  const estimateEstProfit = Math.round(estimatePredictedUnits * (20 - estimateCogs));
  
  const estimateVerdict = estimateInflation > 8
    ? 'MARGIN SQUEEZE'
    : estimateSeasonality === 'low'
      ? 'LOW DEMAND'
      : 'STABLE MARGIN';
      
  const estimateVerdictText = estimateVerdict === 'MARGIN SQUEEZE'
    ? "High inflation is severely eroding unit margins. Retail price adjustments recommended."
    : estimateVerdict === 'LOW DEMAND'
      ? "Low seasonal demand is depressing volume. Focus on inventory cost control."
      : "Margins remain protected against input cost changes due to seasonal volume support.";

  return (
    <div className="space-y-6">

      {/* Quick Navigation Bar for Product Manager */}
      {role === 'Product Manager' && (
        <div className="flex flex-wrap items-center gap-2 bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 p-2 rounded-sm shadow-sm text-[9px] font-bold uppercase tracking-wider">
          <span className="text-zinc-400 dark:text-zinc-500 mr-2 uppercase tracking-widest text-[8px]">Quick Jump:</span>
          <button 
            type="button"
            onClick={() => document.getElementById('sig-competitor-console')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/5 text-[#d97706] dark:text-[#fbbf24] rounded transition-all cursor-pointer border-none bg-transparent font-bold"
          >
            Promo Simulator
          </button>
          <button 
            type="button"
            onClick={() => document.getElementById('sig-competitor-tracker')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/5 text-amber-600 dark:text-amber-500 rounded transition-all cursor-pointer border-none bg-transparent font-bold animate-pulse"
          >
            Competitor SKU Audit
          </button>
          <button 
            type="button"
            onClick={() => document.getElementById('sig-exec-feed')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-2.5 py-1 hover:bg-black/5 dark:hover:bg-white/5 text-[#6d28d9] dark:text-[#a78bfa] rounded transition-all cursor-pointer border-none bg-transparent font-bold"
          >
            VP Strategic Signals
          </button>
        </div>
      )}

      {/* Dynamic InboxAccess Panel based on role */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest pb-3 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
          <Inbox size={13} className="text-acies-yellow" />
          Inbox Access — Active Profile Requests
          {unreadCount > 0 && (
            <span className="text-[8px] font-extrabold bg-red-500 text-white rounded-full px-2 py-0.5 animate-pulse">
              {unreadCount} Unread
            </span>
          )}
        </h3>

        {roleMessages.length === 0 ? (
          <p className="text-xs text-zinc-500 font-semibold py-2">No active messages in folder.</p>
        ) : (
          <div className="space-y-3">
            {roleMessages.map(msg => (
              <div 
                key={msg.id} 
                onClick={() => handleMarkRead(msg.id)}
                className={`p-3 border rounded-sm flex gap-3 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 ${
                  msg.read 
                    ? 'border-black/5 dark:border-white/5 opacity-60' 
                    : 'border-acies-yellow bg-acies-yellow/5'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-inner"
                  style={{ background: `linear-gradient(135deg, ${msg.fromColor}, ${msg.fromColor}CC)` }}
                >
                  {msg.fromInitials}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-acies-gray dark:text-white">{msg.from}</span>
                    <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-1 ${
                      msg.type === 'email' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {msg.type === 'email' ? <Mail size={9} /> : <Send size={9} />}
                      {msg.type}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-semibold text-acies-gray dark:text-white truncate">{msg.subject}</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal line-clamp-2 pt-1">{msg.body}</p>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold shrink-0">{msg.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competitor Analysis Decision Console Block (Only for Product Manager) */}
      {role === 'Product Manager' && (
        <div id="sig-competitor-console" className="glass-card bg-white dark:bg-[#0b1329] border border-black/10 dark:border-[#1e294b] p-6 rounded-sm shadow-xl space-y-6 text-zinc-805 dark:text-slate-100">
          <div>
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-500">Try It Yourself</span>
            <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-805 dark:text-white mt-1">Drive all four engines</h2>
            <p className="text-[10px] text-zinc-550 dark:text-zinc-400 mt-2 leading-relaxed max-w-3xl">
              PromoAI and PricingAI optimize your own numbers. CompeteAI adds the missing half of the picture — what rivals are actually charging and promoting — so every recommendation is benchmarked, not guessed. BundleAI turns that intelligence into offers you can act on. Move the controls below and watch each engine respond live.
            </p>
          </div>

          {/* Engine Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 dark:bg-[#0f1b35] p-1 rounded border border-black/10 dark:border-[#1e294b]">
            <button 
              type="button"
              onClick={() => setActiveEngine('promo')}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-all border-none outline-none ${
                activeEngine === 'promo' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              ⚙ PromoAI
            </button>
            <button 
              type="button"
              onClick={() => setActiveEngine('pricing')}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-all border-none outline-none ${
                activeEngine === 'pricing' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              ⚙ PricingAI
            </button>
            <button 
              type="button"
              onClick={() => setActiveEngine('compete')}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-all border-none outline-none ${
                activeEngine === 'compete' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              ⚙ CompeteAI
            </button>
            <button 
              type="button"
              onClick={() => setActiveEngine('bundle')}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-all border-none outline-none ${
                activeEngine === 'bundle' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              ⚙ BundleAI
            </button>
            <button 
              type="button"
              onClick={() => setActiveEngine('estimate')}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-all border-none outline-none ${
                activeEngine === 'estimate' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              ⚙ EstimateAI <span className="text-[8px] text-amber-400 lowercase italic ml-1">– new</span>
            </button>
          </div>

          {/* Interactive Console Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-black/10 dark:border-[#1e294b]">
            
            {/* LEFT PANEL: Controls (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {activeEngine === 'promo' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>Product</span>
                      <span className="text-amber-600 dark:text-amber-500 uppercase tracking-wider font-bold">Lay's</span>
                    </div>
                    <select 
                      value={promoProduct}
                      onChange={(e) => setPromoProduct(e.target.value)}
                      className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/10 dark:border-[#1e294b] rounded p-2 text-xs font-semibold text-zinc-850 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="Lays">Lay's – base 1,000 units/wk</option>
                      <option value="Doritos">Doritos – base 800 units/wk</option>
                      <option value="Kurkure">Kurkure – base 1,200 units/wk</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>Discount offered</span>
                      <span className="text-amber-600 dark:text-amber-500 font-bold">{promoDiscount}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="50" 
                      step="5"
                      value={promoDiscount} 
                      onChange={(e) => setPromoDiscount(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-[#0f1b35] h-1 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-zinc-500 italic">Bigger discounts lift volume — but eat into margin per unit.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>Weeks since last promo on this SKU</span>
                      <span className="text-amber-600 dark:text-amber-500 font-bold">{promoWeeks} wks</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1"
                      value={promoWeeks} 
                      onChange={(e) => setPromoWeeks(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-[#0f1b35] h-1 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-zinc-500 italic">Running promos back-to-back trains customers to wait for the discount.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>Remaining promo budget this cycle</span>
                      <span className="text-amber-600 dark:text-amber-500 font-bold">₹{promoBudget.toFixed(1)} Cr</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      step="0.5"
                      value={promoBudget} 
                      onChange={(e) => setPromoBudget(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-[#0f1b35] h-1 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-zinc-500 italic">MILP won't recommend a spend that blows the budget.</p>
                  </div>
                </>
              )}

              {activeEngine === 'pricing' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-550 dark:text-zinc-500 uppercase tracking-widest pb-1 border-b border-black/5 dark:border-[#1e294b]">
                      <span>pricingai.decision_engine – Elasticity + Differential Evolution</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                        <span>Pepsi price</span>
                        <span className="text-amber-655 dark:text-amber-600 dark:text-amber-500 font-bold">₹{pepsiPrice.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="15" 
                        max="30" 
                        step="1"
                        value={pepsiPrice} 
                        onChange={(e) => setPepsiPrice(Number(e.target.value))}
                        className="w-full premium-slider cursor-pointer mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                        <span>Mountain Dew price</span>
                        <span className="text-amber-655 dark:text-amber-600 dark:text-amber-500 font-bold">₹{mtnDewPrice.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="15" 
                        max="30" 
                        step="1"
                        value={mtnDewPrice} 
                        onChange={(e) => setMtnDewPrice(Number(e.target.value))}
                        className="w-full premium-slider cursor-pointer mt-1"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50/70 dark:bg-[#121c29]/50 border border-blue-500/15 dark:border-blue-500/10 p-3 rounded-sm text-[9.5px] text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                    Cross-elasticity: raising Pepsi's price nudges some buyers toward Mountain Dew.
                  </div>
                </>
              )}

              {activeEngine === 'compete' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>Predicted Rival Response Level</span>
                      <span className="text-amber-600 dark:text-amber-500 uppercase tracking-wider font-bold">{competeRivalReaction}</span>
                    </div>
                    <select 
                      value={competeRivalReaction}
                      onChange={(e) => setCompeteRivalReaction(e.target.value as any)}
                      className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/10 dark:border-[#1e294b] rounded p-2 text-xs font-semibold text-zinc-850 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="aggressive">Aggressive (Matches all price changes)</option>
                      <option value="moderate">Moderate (Selective regional matching)</option>
                      <option value="passive">Passive (No matching response)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>Our Promo Depth</span>
                      <span className="text-amber-600 dark:text-amber-500 font-bold">{competeOurPromoDepth}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="40" 
                      step="5"
                      value={competeOurPromoDepth} 
                      onChange={(e) => setCompeteOurPromoDepth(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-[#0f1b35] h-1 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-zinc-500 italic">Deep promos trigger aggressive competitor defensive countermeasures.</p>
                  </div>
                </>
              )}

              {activeEngine === 'bundle' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>Cross-Category Bundle Offer</span>
                      <span className="text-amber-600 dark:text-amber-500 uppercase tracking-wider font-bold">Select Combo</span>
                    </div>
                    <select 
                      value={bundleSelection}
                      onChange={(e) => setBundleSelection(e.target.value)}
                      className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/10 dark:border-[#1e294b] rounded p-2 text-xs font-semibold text-zinc-850 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="Snacks+Soda">Lay's + Pepsi 750ml</option>
                      <option value="Snacks+Snacks">Lay's + Doritos Dual-Pack</option>
                      <option value="Personal+Household">Herbal Shampoo + Softener</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>Bundle Discount Depth</span>
                      <span className="text-amber-600 dark:text-amber-500 font-bold">{bundleDiscount}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="30" 
                      step="5"
                      value={bundleDiscount} 
                      onChange={(e) => setBundleDiscount(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-[#0f1b35] h-1 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-zinc-500 italic">Increases cross-category basket size but dilutes single SKU profitability.</p>
                  </div>
                </>
              )}

              {activeEngine === 'estimate' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>Seasonal Index Target</span>
                      <span className="text-amber-600 dark:text-amber-500 uppercase tracking-wider font-bold">{estimateSeasonality}</span>
                    </div>
                    <select 
                      value={estimateSeasonality}
                      onChange={(e) => setEstimateSeasonality(e.target.value as any)}
                      className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/10 dark:border-[#1e294b] rounded p-2 text-xs font-semibold text-zinc-850 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="high">High Season (Festive Q4 Peak)</option>
                      <option value="normal">Normal Season (Standard Quarter)</option>
                      <option value="low">Low Season (Monsoon Q2 Dip)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                      <span>Input Cost Inflation Rate</span>
                      <span className="text-amber-600 dark:text-amber-500 font-bold">+{estimateInflation}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="15" 
                      step="1"
                      value={estimateInflation} 
                      onChange={(e) => setEstimateInflation(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-[#0f1b35] h-1 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-zinc-500 italic">Raw material pricing jumps directly compress our product profit ceiling.</p>
                  </div>
                </>
              )}

            </div>

            {/* RIGHT PANEL: Outputs & Visualizations (7 Cols) */}
            <div className="lg:col-span-7 bg-[#0b101f] border border-[#1e294b] p-5 rounded-sm space-y-5">
              
              {/* Output Grid of 4 Cards */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Card 1 */}
                <div className="border border-black/10 dark:border-[#1e294b]/60 bg-zinc-50 dark:bg-[#0f1629] p-3.5 rounded-sm flex flex-col justify-between min-h-[80px]">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Predicted Units</span>
                  <div className="mt-1">
                    <span className="text-2xl font-bold font-display text-white">
                      {activeEngine === 'promo' && promoPredictedUnits.toLocaleString()}
                      {activeEngine === 'pricing' && pricingPredictedUnits.toLocaleString()}
                      {activeEngine === 'compete' && competePredictedUnits.toLocaleString()}
                      {activeEngine === 'bundle' && bundlePredictedUnits.toLocaleString()}
                      {activeEngine === 'estimate' && estimatePredictedUnits.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold ml-1.5">
                      {activeEngine === 'promo' && `+${promoLiftPct}% vs base`}
                      {activeEngine === 'pricing' && `${pricingVolumeChange >= 0 ? '+' : ''}${Math.round(pricingVolumeChange * 100)}%`}
                      {activeEngine === 'compete' && `+${Math.round(competeLiftFactor * 100)}%`}
                      {activeEngine === 'bundle' && `+${Math.round(bundleLiftFactor * 100)}%`}
                      {activeEngine === 'estimate' && `${estimateDemandIndex >= 1.0 ? '+' : ''}${Math.round((estimateDemandIndex - 1.0) * 100)}%`}
                    </span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="border border-black/10 dark:border-[#1e294b]/60 bg-zinc-50 dark:bg-[#0f1629] p-3.5 rounded-sm flex flex-col justify-between min-h-[80px]">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                    {activeEngine === 'pricing' || activeEngine === 'estimate' ? 'EST. REVENUE' : 'EST. SPEND'}
                  </span>
                  <div className="mt-1">
                    <span className="text-2xl font-bold font-display text-white">
                      ₹
                      {activeEngine === 'promo' && promoEstSpend.toLocaleString()}
                      {activeEngine === 'pricing' && pricingEstRevenue.toLocaleString()}
                      {activeEngine === 'compete' && competeEstSpend.toLocaleString()}
                      {activeEngine === 'bundle' && bundleEstSpend.toLocaleString()}
                      {activeEngine === 'estimate' && estimateEstRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="border border-black/10 dark:border-[#1e294b]/60 bg-zinc-50 dark:bg-[#0f1629] p-3.5 rounded-sm flex flex-col justify-between min-h-[80px]">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Est. Profit</span>
                  <div className="mt-1">
                    <span className="text-2xl font-bold font-display text-white">
                      ₹
                      {activeEngine === 'promo' && promoEstProfit.toLocaleString()}
                      {activeEngine === 'pricing' && pricingEstProfit.toLocaleString()}
                      {activeEngine === 'compete' && competeEstProfit.toLocaleString()}
                      {activeEngine === 'bundle' && bundleEstProfit.toLocaleString()}
                      {activeEngine === 'estimate' && estimateEstProfit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="border border-black/10 dark:border-[#1e294b]/60 bg-zinc-50 dark:bg-[#0f1629] p-3.5 rounded-sm flex flex-col justify-between min-h-[80px]">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">MILP Verdict</span>
                  <div className="mt-1 font-bold text-sm tracking-wider uppercase">
                    {activeEngine === 'promo' && (
                      <span className={promoRoiVerdict === 'LOW ROI' ? 'text-red-500' : 'text-emerald-500'}>{promoRoiVerdict}</span>
                    )}
                    {activeEngine === 'pricing' && (
                      <span className={pricingVerdict === 'HIGH PRICE RISK' ? 'text-red-500' : pricingVerdict === 'LOW MARGIN RISK' ? 'text-yellow-500' : 'text-emerald-500'}>
                        {pricingVerdict}
                      </span>
                    )}
                    {activeEngine === 'compete' && (
                      <span className={competeVerdict === 'RIVAL MATCHED' ? 'text-red-500' : competeVerdict === 'MODERATE VALUE' ? 'text-yellow-500' : 'text-emerald-500'}>
                        {competeVerdict}
                      </span>
                    )}
                    {activeEngine === 'bundle' && (
                      <span className={bundleVerdict === 'MARGIN EROSION' ? 'text-red-500' : bundleVerdict === 'LOW APPEAL' ? 'text-yellow-500' : 'text-emerald-500'}>
                        {bundleVerdict}
                      </span>
                    )}
                    {activeEngine === 'estimate' && (
                      <span className={estimateVerdict === 'MARGIN SQUEEZE' ? 'text-red-500' : estimateVerdict === 'LOW DEMAND' ? 'text-yellow-500' : 'text-emerald-500'}>
                        {estimateVerdict}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Progress-style Bar comparison */}
              {activeEngine === 'pricing' ? (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-450 font-semibold w-16">Pepsi units</span>
                      <div className="w-[80%] bg-zinc-200 dark:bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (pricingPepsiDemand / 15000) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-455 font-semibold w-16">Mtn Dew units</span>
                      <div className="w-[80%] bg-zinc-200 dark:bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
                        <div className="bg-orange-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (pricingMtnDewDemand / 10000) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                    <span>VOLUME LIFT COMPARISON</span>
                    <span className="text-zinc-500">BASE VS PROPOSED</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-450 font-semibold">No promo</span>
                      <div className="w-[70%] bg-zinc-200 dark:bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-455 font-semibold">With promo</span>
                      <div className="w-[70%] bg-zinc-200 dark:bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-orange-500 h-full rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${Math.min(100, 40 * (
                              activeEngine === 'promo' ? (1.0 + promoLiftFactor) :
                              activeEngine === 'compete' ? (1.0 + competeLiftFactor) :
                              activeEngine === 'bundle' ? (1.0 + bundleLiftFactor) :
                              estimateDemandIndex
                            ))}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Verdict Text Box */}
              <div className={activeEngine === 'pricing' 
                ? "border border-emerald-500/30 bg-emerald-50/50 dark:bg-[#0a2020]/40 p-4 rounded-sm"
                : "bg-red-50/70 dark:bg-[#1c121e]/80 border border-red-500/15 p-4 rounded-sm"
              }>
                <p className="text-[10px] leading-relaxed text-zinc-755 dark:text-zinc-755 dark:text-zinc-350">
                  <strong className={activeEngine === 'pricing'
                    ? "text-emerald-650 dark:text-emerald-450 uppercase tracking-widest text-[9px] mr-2 font-bold"
                    : "text-red-400 uppercase tracking-widest text-[8px] mr-2"
                  }>
                    VERDICT
                  </strong>
                  {activeEngine === 'promo' && promoVerdictText}
                  {activeEngine === 'pricing' && pricingVerdictText}
                  {activeEngine === 'compete' && competeVerdictText}
                  {activeEngine === 'bundle' && bundleVerdictText}
                  {activeEngine === 'estimate' && estimateVerdictText}
                </p>
              </div>

              {/* Rival comparison Section */}
              <div className="pt-4 border-t border-black/10 dark:border-[#1e294b] space-y-3">
                <div className="flex justify-between items-center text-[8px] font-bold text-zinc-500 tracking-wider">
                  <span>YOU VS RIVAL – SAME PRODUCT, THIS WEEK</span>
                  <span>VS FRITO BALAJI</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-400">Your promo</span>
                    <div className="w-[65%] bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all" 
                        style={{ 
                          width: `${activeEngine === 'promo' ? promoDiscount : activeEngine === 'compete' ? competeOurPromoDepth : activeEngine === 'bundle' ? bundleDiscount : 20}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-bold">
                      {activeEngine === 'promo' && `${promoDiscount}%`}
                      {activeEngine === 'pricing' && `${Math.round(pricingOurPrice)}`}
                      {activeEngine === 'compete' && `${competeOurPromoDepth}%`}
                      {activeEngine === 'bundle' && `${bundleDiscount}%`}
                      {activeEngine === 'estimate' && `₹20`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-400">Rival promo</span>
                    <div className="w-[65%] bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-600 h-full rounded-full transition-all" 
                        style={{ 
                          width: `${activeEngine === 'pricing' ? (pricingRivalPrice / 30) * 100 : 20}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-bold">
                      {activeEngine === 'pricing' ? `${pricingRivalPrice}` : '20%'}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50/70 dark:bg-[#121c29]/50 border border-blue-500/15 dark:border-blue-500/10 p-3 rounded-sm text-[9.5px] text-zinc-650 dark:text-zinc-400">
                  🤖 <span className="font-bold text-zinc-705 dark:text-zinc-755 dark:text-zinc-350 ml-1">
                    {activeEngine === 'promo' && promoRivalText}
                    {activeEngine === 'pricing' && `Our price is ₹${pricingOurPrice} vs Rival ₹${pricingRivalPrice}.`}
                    {activeEngine === 'compete' && `Competitor reaction level is set to ${competeRivalReaction}.`}
                    {activeEngine === 'bundle' && `Bundle discount is ${bundleDiscount}% for category combo ${bundleSelection}.`}
                    {activeEngine === 'estimate' && `Estimated COGS base is ₹${estimateCogs} with seasonality target ${estimateSeasonality}.`}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* VP Signals Board Section for Product Manager */}

      {/* Separate Competitor SKU Tracking Block (Only for Product Manager) */}
      {role === 'Product Manager' && (
        <div id="sig-competitor-tracker" className="glass-card bg-white dark:bg-[#0b1329] border border-black/10 dark:border-[#1e294b] p-6 rounded-sm shadow-xl space-y-6 text-zinc-805 dark:text-slate-100">
          
          <div className="pb-3 border-b border-black/10 dark:border-[#1e294b] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#d97706] dark:text-[#fbbf24] flex items-center gap-2">
              🔍 Competitor SKU Tracking Console
            </h3>
            <span className="text-[8px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
              Live Audit
            </span>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-[#0f1b35] p-4 rounded border border-black/5 dark:border-[#1e294b] max-w-sm">
              <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-2">
                Your brand / SKU being tracked
              </label>
              <select 
                value={selectedSKU || ''}
                onChange={(e) => setSelectedSKU(e.target.value || null)}
                className="bg-white dark:bg-zinc-900 border border-black/15 dark:border-[#1e294b] rounded p-2 text-xs font-semibold text-zinc-850 dark:text-white outline-none cursor-pointer w-full"
              >
                <option value="">-- Select SKU to analyze --</option>
                <option value="Lays">Lay's Classic 52g</option>
                <option value="Doritos">Doritos Nacho Cheese 60g</option>
                <option value="Kurkure">Kurkure Masala Munch 50g</option>
              </select>
            </div>

            {/* Revealed Competitor Analysis Details */}
            {selectedSKU ? (
              <>
                <div className="overflow-x-auto border border-black/5 dark:border-white/5 rounded-sm pt-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-black/10 dark:border-[#1e294b]/65 text-[9px] font-bold uppercase tracking-widest text-zinc-555 dark:text-zinc-400 bg-zinc-50 dark:bg-black/20">
                        <th className="py-3 px-4">Metric</th>
                        <th className="py-3 px-4">
                          You — {selectedSKU === 'Lays' ? "Lay's Classic 52g" : selectedSKU === 'Doritos' ? "Doritos Nacho Cheese 60g" : "Kurkure Masala Munch 50g"}
                        </th>
                        <th className="py-3 px-4">Frito Balaji</th>
                        <th className="py-3 px-4">Haldiram's</th>
                        <th className="py-3 px-4">Store-Brand Chips</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-[#1e294b]/40 font-medium">
                      {/* Row 1: Current Price */}
                      <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <td className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Current price</td>
                        <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">
                          ₹{selectedSKU === 'Lays' ? '20' : selectedSKU === 'Doritos' ? '30' : '15'}
                        </td>
                        <td className="py-3.5 px-4">
                          ₹{selectedSKU === 'Lays' ? '21' : selectedSKU === 'Doritos' ? '32' : '16'}
                          <span className="ml-2 text-[10px] text-emerald-650 dark:text-emerald-400 font-bold">-1.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          ₹{selectedSKU === 'Lays' ? '18' : selectedSKU === 'Doritos' ? '28' : '14'}
                          <span className="ml-2 text-[10px] text-red-600 dark:text-red-505 font-bold">+2.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          ₹{selectedSKU === 'Lays' ? '12' : selectedSKU === 'Doritos' ? '18' : '10'}
                          <span className="ml-2 text-[10px] text-red-600 dark:text-red-505 font-bold">+8.0</span>
                        </td>
                      </tr>

                      {/* Row 2: Avg promo depth (8wk) */}
                      <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <td className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Avg promo depth (8wk)</td>
                        <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">
                          {selectedSKU === 'Lays' ? '14%' : selectedSKU === 'Doritos' ? '18%' : '12%'}
                        </td>
                        <td className="py-3.5 px-4">
                          6% <span className="ml-2 text-[10px] text-emerald-655 dark:text-emerald-400 font-bold">+8.4</span>
                        </td>
                        <td className="py-3.5 px-4">
                          1% <span className="ml-2 text-[10px] text-emerald-655 dark:text-emerald-400 font-bold">+13.4</span>
                        </td>
                        <td className="py-3.5 px-4">
                          9% <span className="ml-2 text-[10px] text-emerald-655 dark:text-emerald-400 font-bold">+5.4</span>
                        </td>
                      </tr>

                      {/* Row 3: Campaigns / quarter */}
                      <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <td className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Campaigns / quarter</td>
                        <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">
                          {selectedSKU === 'Lays' ? '4' : selectedSKU === 'Doritos' ? '5' : '3'}
                        </td>
                        <td className="py-3.5 px-4">
                          6 <span className="ml-2 text-[10px] text-red-655 dark:text-red-500 font-bold">-2.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          1 <span className="ml-2 text-[10px] text-emerald-655 dark:text-emerald-400 font-bold">+3.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          11 <span className="ml-2 text-[10px] text-red-655 dark:text-red-500 font-bold">-7.0</span>
                        </td>
                      </tr>

                      {/* Row 4: Availability */}
                      <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <td className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Availability</td>
                        <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">
                          {selectedSKU === 'Lays' ? '92%' : selectedSKU === 'Doritos' ? '95%' : '90%'}
                        </td>
                        <td className="py-3.5 px-4">
                          96% <span className="ml-2 text-[10px] text-red-655 dark:text-red-500 font-bold">-4.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          78% <span className="ml-2 text-[10px] text-emerald-655 dark:text-emerald-400 font-bold">+14.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          61% <span className="ml-2 text-[10px] text-emerald-655 dark:text-emerald-400 font-bold">+31.0</span>
                        </td>
                      </tr>

                      {/* Row 5: Promo frequency trend */}
                      <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <td className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Promo frequency trend</td>
                        <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">
                          {selectedSKU === 'Lays' ? 'Up 10% vs last quarter' : selectedSKU === 'Doritos' ? 'Up 15% vs last quarter' : 'Up 5% vs last quarter'}
                        </td>
                        <td className="py-3.5 px-4">Up 30% vs last quarter</td>
                        <td className="py-3.5 px-4">Flat, no change</td>
                        <td className="py-3.5 px-4">Up 45% vs last quarter</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3 Columns Side-by-Side Brand Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                  
                  {/* YOU Card */}
                  <div className="bg-zinc-50 dark:bg-[#0f1b35] border-2 border-blue-500 rounded-sm p-4 shadow-lg flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                          {skuComparisonData[selectedSKU]?.you.name}
                        </h4>
                        <span className="bg-blue-600/20 text-blue-655 dark:text-blue-450 text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                          YOU
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        Your brand • {skuComparisonData[selectedSKU]?.you.brand}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400 mb-1.5">
                          <span>Price — Last 8 Weeks</span>
                          <span className="text-zinc-800 dark:text-zinc-350 font-bold">
                            {skuComparisonData[selectedSKU]?.you.priceHistory}
                          </span>
                        </div>
                        {/* Bar Graphic */}
                        <div className="flex items-end gap-1 h-6">
                          {skuComparisonData[selectedSKU]?.you.prices.map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-orange-500 dark:bg-orange-600 rounded-sm"
                              style={{ height: `${h * 10}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px]">Promo campaigns this quarter</span>
                        <span className="font-bold text-zinc-805 dark:text-white">
                          {skuComparisonData[selectedSKU]?.you.campaigns} campaigns
                        </span>
                      </div>

                      <div className="space-y-1 border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-zinc-555 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Discount strategy</span>
                        <div className="bg-blue-100/50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/30 text-[9.5px] p-2 rounded-sm font-bold text-center">
                          {skuComparisonData[selectedSKU]?.you.discountPill}
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-555 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Availability</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-850 dark:text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>
                            {skuComparisonData[selectedSKU]?.you.availability} — {skuComparisonData[selectedSKU]?.you.availabilityPct}% of tracked outlets
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-555 dark:text-zinc-455 font-semibold uppercase tracking-wider text-[8.5px] block">Promo frequency trend</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-red-655 dark:text-red-400 font-bold">
                          <span>▲</span>
                          <span>{skuComparisonData[selectedSKU]?.you.trend}</span>
                        </div>
                      </div>
                    </div>

                    <button type="button" className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-[#13223e] dark:hover:bg-[#1e2f54] text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/5 rounded-sm py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer">
                      View 8-week raw log ▼
                    </button>
                  </div>

                  {/* Rival 1 Card (Frito Balaji) */}
                  <div className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/10 dark:border-white/10 rounded-sm p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                        {skuComparisonData[selectedSKU]?.rival1.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {skuComparisonData[selectedSKU]?.rival1.desc}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400 mb-1.5">
                          <span>Price — Last 8 Weeks</span>
                          <span className="text-zinc-800 dark:text-zinc-350 font-bold">
                            {skuComparisonData[selectedSKU]?.rival1.priceHistory}
                          </span>
                        </div>
                        {/* Bar Graphic */}
                        <div className="flex items-end gap-1 h-6">
                          {skuComparisonData[selectedSKU]?.rival1.prices.map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-sm"
                              style={{ height: `${h * 10}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px]">Promo campaigns this quarter</span>
                        <span className="font-bold text-zinc-805 dark:text-white">
                          {skuComparisonData[selectedSKU]?.rival1.campaigns} campaigns
                        </span>
                      </div>

                      <div className="space-y-1 border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-zinc-555 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Discount strategy</span>
                        <div className="bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-[9.5px] p-2 rounded-sm font-bold text-center">
                          {skuComparisonData[selectedSKU]?.rival1.discountPill}
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Availability</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-850 dark:text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>
                            {skuComparisonData[selectedSKU]?.rival1.availability} — {skuComparisonData[selectedSKU]?.rival1.availabilityPct}% of tracked outlets
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-555 dark:text-zinc-455 font-semibold uppercase tracking-wider text-[8.5px] block">Promo frequency trend</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-red-655 dark:text-red-400 font-bold">
                          <span>▲</span>
                          <span>{skuComparisonData[selectedSKU]?.rival1.trend}</span>
                        </div>
                      </div>
                    </div>

                    <button type="button" className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-[#13223e] dark:hover:bg-[#1e2f54] text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/5 rounded-sm py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer">
                      View 8-week raw log ▼
                    </button>
                  </div>

                  {/* Rival 2 Card (Haldiram's) */}
                  <div className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/10 dark:border-white/10 rounded-sm p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                        {skuComparisonData[selectedSKU]?.rival2.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {skuComparisonData[selectedSKU]?.rival2.desc}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400 mb-1.5">
                          <span>Price — Last 8 Weeks</span>
                          <span className="text-zinc-805 dark:text-zinc-350 font-bold">
                            {skuComparisonData[selectedSKU]?.rival2.priceHistory}
                          </span>
                        </div>
                        {/* Bar Graphic */}
                        <div className="flex items-end gap-1 h-6">
                          {skuComparisonData[selectedSKU]?.rival2.prices.map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-sm"
                              style={{ height: `${h * 10}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-zinc-555 dark:text-zinc-405 font-semibold uppercase tracking-wider text-[8.5px]">Promo campaigns this quarter</span>
                        <span className="font-bold text-zinc-850 dark:text-white">
                          {skuComparisonData[selectedSKU]?.rival2.campaigns} campaigns
                        </span>
                      </div>

                      <div className="space-y-1 border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-zinc-555 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Discount strategy</span>
                        <div className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[9.5px] p-2 rounded-sm font-bold text-center">
                          {skuComparisonData[selectedSKU]?.rival2.discountPill}
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-555 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Availability</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-850 dark:text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>
                            {skuComparisonData[selectedSKU]?.rival2.availability} — {skuComparisonData[selectedSKU]?.rival2.availabilityPct}% of tracked outlets
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-555 dark:text-zinc-405 font-semibold uppercase tracking-wider text-[8.5px] block">Promo frequency trend</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-655 dark:text-emerald-450 font-bold">
                          <span>▼</span>
                          <span>{skuComparisonData[selectedSKU]?.rival2.trend}</span>
                        </div>
                      </div>
                    </div>

                    <button type="button" className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-[#13223e] dark:hover:bg-[#1e2f54] text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/5 rounded-sm py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer">
                      View 8-week raw log ▼
                    </button>
                  </div>

                </div>

                {/* Illustrative Alerts Section */}
                <div className="space-y-3 pt-6 border-t border-black/10 dark:border-[#1e294b] mt-6">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-655 dark:text-emerald-450">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Illustrative — in production these five fields refresh continuously from scraped/panel data rather than a point-in-time snapshot.</span>
                  </div>
                  
                  <div className="space-y-2">
                    {skuComparisonData[selectedSKU]?.alerts.map((alertText, idx) => (
                      <div 
                        key={idx} 
                        className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/5 dark:border-white/5 p-3 rounded-sm flex items-center gap-3 text-xs"
                      >
                        <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-sm border border-orange-500/20">
                          READ
                        </span>
                        <p className="text-zinc-655 dark:text-zinc-350 text-[11px] leading-normal font-semibold">
                          {alertText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="border border-dashed border-black/10 dark:border-white/10 p-8 text-center rounded-sm bg-zinc-50/50 dark:bg-black/10">
                <p className="text-xs text-zinc-405 dark:text-zinc-400 font-semibold">
                  Select a tracked SKU above to reveal current market competitor pricing, availability, and campaigns metrics audit.
                </p>
              </div>
            )}
          </div>

        </div>
      )}


      {/* VP Signals Board Section for Product Manager */}
      {role === 'Product Manager' && (
        <div id="sig-exec-feed" className="pt-8 border-t border-black/10 dark:border-white/10 space-y-6">
          <div className="bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa]">Executive Integration</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-850 dark:text-white mt-1">VP Strategic Signals & Executive Analysis Feed</h3>
            <p className="text-[10px] text-zinc-550 dark:text-zinc-400 mt-1 leading-normal">
              Below are the executive signal feeds, alert maps, AI predictions, and market intelligence channels synced from the VP view.
            </p>
          </div>
          <VPSignalsBoardView isDarkMode={isDarkMode} setActiveTab={setActiveTab} onExploreToggle={onExploreToggle} />
        </div>
      )}

    </div>
  );
};
export interface VPSignal {
  id: string;
  title: string;
  category: string;
  region: string;
  type: 'Risk' | 'Opportunity' | 'Competitor' | 'Sentiment' | 'Supply' | 'Portfolio';
  severity: 'critical' | 'warning' | 'info';
  impact: string;
  detail: string;
  ack: boolean;
  refCode: string;
  trigger: string;
  rectification: string;
}

export const VP_SIGNALS_DATA: VPSignal[] = [
  { 
    id: 'S01', 
    title: 'Demand spike in APAC Beverages', 
    category: 'Beverages', 
    region: 'APAC', 
    type: 'Opportunity', 
    severity: 'critical', 
    impact: '$1.2M Revenue Opportunity', 
    detail: 'Beverages volume trending +18% YoY in APAC. Sourcing buffers are currently insufficient to cover this demand shift.', 
    ack: false, 
    refCode: 'BEV-APAC-01',
    trigger: 'A sharp 18% YoY volume spike in Q2 consumer consumption tracking across major APAC retail networks.',
    rectification: 'Re-route 15,000 units of safety stock from Western warehouses to Vapi Hub and expand peak packaging throughput.'
  },
  { 
    id: 'S02', 
    title: 'Packaging Material Shortage', 
    category: 'Snacks', 
    region: 'EMEA', 
    type: 'Risk', 
    severity: 'critical', 
    impact: '15d Launch Delay', 
    detail: 'Organic packaging supplier in Germany locked down. BrandC Biscuits Eco launch target at risk.', 
    ack: false, 
    refCode: 'SNC-EMEA-02',
    trigger: 'Sudden local environmental regulatory hold and supplier factory lockdown at German eco-carton supplier.',
    rectification: 'Onboard pre-qualified regional packaging vendor in Poland and fast-track quality verification loops.'
  },
  { 
    id: 'S03', 
    title: 'Competitor price reduction', 
    category: 'Snacks', 
    region: 'EMEA', 
    type: 'Competitor', 
    severity: 'warning', 
    impact: 'Market Share Risk', 
    detail: 'Competitor B cut price of Wafers by 10% in Europe. Category gross margin target under pressure.', 
    ack: false, 
    refCode: 'COMP-EMEA-03',
    trigger: 'Competitor B initiated an aggressive 10% price promotion across discount grocery channels in EU supermarkets.',
    rectification: 'Trigger a cross-category bundle campaign (Yogurt + BrandC Cookies) to shield customer grocery basket value.'
  },
  { 
    id: 'S04', 
    title: 'Social sentiment decline', 
    category: 'Personal Care', 
    region: 'Americas', 
    type: 'Sentiment', 
    severity: 'warning', 
    impact: 'Brand Equity Risk', 
    detail: 'Social mentions for Personal Care lines dropped by 14% post-artwork revision. Packaging aesthetics cited as key factor.', 
    ack: false, 
    refCode: 'SENT-AMER-04',
    trigger: 'Negative online reviews and social media mentions spike citing poor ergonomics and artwork changes on new personal care bottles.',
    rectification: 'Revert bottle packaging layout to classic artwork template and schedule target consumer feedback focus groups.'
  },
  { 
    id: 'S05', 
    title: 'Raw material shortage', 
    category: 'Household', 
    region: 'India', 
    type: 'Supply', 
    severity: 'critical', 
    impact: '$800K Revenue Risk', 
    detail: 'Active surfactant supplier constraint in domestic market. Alternate local validation recommended.', 
    ack: false, 
    refCode: 'SUPP-IND-05',
    trigger: 'Primary chemical raw materials processing line breakdown at our domestic supplier in Western India.',
    rectification: 'Qualify and onboard backup regional raw materials manufacturer in Gujarat within 10 days to fill inventory gap.'
  },
  { 
    id: 'S06', 
    title: 'Product Cannibalization Alert', 
    category: 'Beverages', 
    region: 'India', 
    type: 'Portfolio', 
    severity: 'warning', 
    impact: 'Margin Leakage', 
    detail: 'Mango Fizz 250ml and 500ml variants show -0.62 promotional correlation. Variant shelf rationalization required.', 
    ack: false, 
    refCode: 'PORT-IND-06',
    trigger: 'Overlapping promotional cycles showing high cross-substitution (-0.62 correlation) between 250ml and 500ml variants.',
    rectification: 'Consolidate promotional funding onto the 500ml high-margin pack size and phase out overlapping 250ml discount runs.'
  },
  { 
    id: 'S07', 
    title: 'NPS Score Decline', 
    category: 'Snacks', 
    region: 'EMEA', 
    type: 'Sentiment', 
    severity: 'info', 
    impact: 'Customer Satisfaction Drop', 
    detail: 'Snacks segment NPS fell from 74 to 71 in Europe due to recent logistics delays. Core product quality scores stable.', 
    ack: false, 
    refCode: 'SENT-EMEA-07',
    trigger: 'Extended shipping logistics port bottlenecks in Rotterdam causing 5-day delivery delays to major retail stores.',
    rectification: 'Pre-position finished goods buffer stock at secondary warehouse in Germany to stabilize localized supply rates.'
  },
  { 
    id: 'S08', 
    title: 'Competitor launch in India', 
    category: 'Beverages', 
    region: 'India', 
    type: 'Competitor', 
    severity: 'info', 
    impact: 'Market Competitiveness', 
    detail: 'Rival brand launched Organic Green Tea SKU in West region. Pricing aligns with our mid-tier line.', 
    ack: false, 
    refCode: 'COMP-IND-08',
    trigger: 'Competitor launched a new Organic Green Tea SKU in Western region supermarkets, matching our pricing structure.',
    rectification: 'Enhance regional shelf-display visibility and coordinate a co-marketing campaign highlighting our local packaging origin.'
  },
  { 
    id: 'S09', 
    title: 'Logistics bottleneck at port', 
    category: 'Personal Care', 
    region: 'APAC', 
    type: 'Supply', 
    severity: 'warning', 
    impact: '10d Lead Time Extension', 
    detail: 'APAC port gridlock causing shipment lag on personal care materials. Pre-positioned buffer stock recommended.', 
    ack: false, 
    refCode: 'SUPP-APAC-09',
    trigger: 'Major maritime cargo transit gridlock and customs clearance backlog at the Shanghai port hubs.',
    rectification: 'Divert upcoming raw materials shipments to secondary ports and pre-position buffer stock at the local hub.'
  },
  { 
    id: 'S10', 
    title: 'Growing market demand shift', 
    category: 'Household', 
    region: 'Americas', 
    type: 'Opportunity', 
    severity: 'warning', 
    impact: '$600K Revenue Opportunity', 
    detail: 'Americas household category demand increased 24% in South region. Eco-friendly line under-distributed.', 
    ack: false, 
    refCode: 'OPP-AMER-10',
    trigger: 'Sustained 24% consumer demand surge for biodegradable cleaning products in Southern Americas retail stores.',
    rectification: 'Expand regional distribution network agreements to place eco-friendly household detergents in 120 new outlets.'
  }
];

interface CompetitiveIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  intelIdx: number;
}

const CompetitiveIntelligenceModal: React.FC<CompetitiveIntelligenceModalProps> = ({
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
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
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-400 block">
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
              <p className="text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed pl-5 relative">
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
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-550 block">
                Simulated Metric Improvements (Before vs After)
              </span>
              <div className="border border-black/10 dark:border-white/10 rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider text-[8px] border-b border-black/10 dark:border-white/10">
                      <th className="p-2.5 font-bold">Metric Parameter</th>
                      <th className="p-2.5 font-bold text-zinc-500">Current (Before)</th>
                      <th className="p-2.5 font-bold text-[#10b981] dark:text-emerald-450">Simulated (After)</th>
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
            <p className="text-[9px] text-zinc-400 dark:text-zinc-555 leading-normal italic">
              *Projections are generated via our AI Simulation Engine using dynamic consumer elasticity modeling and historical supermarket lift values.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-black/15 dark:border-white/15 pt-3.5">
          <span className="text-[9px] text-zinc-500 dark:text-zinc-555 font-mono font-bold uppercase">Competitor Audit Log</span>
          <div className="flex items-center gap-2">
            {activeModalTab === 'projection' && (
              <button 
                type="button"
                onClick={() => setActiveModalTab('comparison')}
                className="px-3.5 py-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 text-[9px] font-extrabold uppercase tracking-widest rounded-sm border border-zinc-250 dark:border-zinc-700 transition-all cursor-pointer"
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
    </div>
  );
};

interface RegionalAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: string;
  signals: VPSignal[];
}

const getAlertExplainer = (id: string) => {
  switch (id) {
    case 'S01':
      return {
        owner: 'Ananya Sen (VP Finance)',
        timeline: '48 Hours',
        outcome: 'Covers the 12-day gap; recovers $420k potential revenue loss.',
        checklist: [
          'Verify Western region inventory levels and confirm safety stock buffers.',
          'Initiate emergency freight transfer authorization from domestic warehouses.',
          'Update Vapi Hub warehouse management system for incoming expedited transit.'
        ]
      };
    case 'S02':
      return {
        owner: 'Priya Sharma (Product Manager)',
        timeline: '5 Days',
        outcome: 'Saves the Organic snacks launch target; reduces launch delay by 10 days.',
        checklist: [
          'Onboard Poland eco-carton supplier in ERP system.',
          'Request fast-track quality verification sample testing.',
          'Deploy secondary container freight route to secure carton supply.'
        ]
      };
    case 'S03':
      return {
        owner: 'Vikram Solanki (QC Manager & Logistics Lead)',
        timeline: '3 Days',
        outcome: 'Protects EU sales volumes; expected category volume preservation of 95%.',
        checklist: [
          'Configure promotional bundle parameters in trade billing systems.',
          'Deploy point-of-sale marketing flyers in partner retail stores.',
          'Monitor margin dilution index across discount channels daily.'
        ]
      };
    case 'S04':
      return {
        owner: 'Amit Verma (NPD Lead)',
        timeline: '10 Days',
        outcome: 'Restores brand equity; stabilizes Q2 net sentiment score back to +42.',
        checklist: [
          'Instruct packaging engineering to halt printing of modified artwork.',
          'Retrieve and deploy legacy artwork plates to active print lines.',
          'Schedule consumer panel research focus group to test ergonomic preferences.'
        ]
      };
    case 'S05':
      return {
        owner: 'Rajendra Patel (Vapi Hub Director)',
        timeline: '10 Days',
        outcome: 'Ensures continued production runtime; preserves $800k revenue.',
        checklist: [
          'Issue emergency supplier audit request for Gujarat chemical facility.',
          'Execute technical lab verification on sample surfactant raw batches.',
          'Establish contract terms matching base wholesale procurement limits.'
        ]
      };
    case 'S06':
      return {
        owner: 'Priya Sharma (Product Manager)',
        timeline: '7 Days',
        outcome: 'Boosts net category gross margin by +2.4 percentage points.',
        checklist: [
          'De-authorize discount schedule for 250ml variant in supermarket promotional logs.',
          'Redirect trade spend budgets onto high-margin 500ml pack size.',
          'Monitor net category volume run-rate post discount consolidation.'
        ]
      };
    case 'S07':
      return {
        owner: 'Vikram Solanki (QC & Logistics Lead)',
        timeline: '4 Days',
        outcome: 'Stabilizes regional supply rates; restores customer delivery satisfaction index.',
        checklist: [
          'Secure 150 pallet spaces in the German regional buffer warehouse.',
          'Initiate transfer of snacks category stock to pre-position reserves.',
          'Coordinate with logistics agents to bypass port delays via truck freight.'
        ]
      };
    case 'S08':
      return {
        owner: 'Karan Johar (Retail Relations Director)',
        timeline: '5 Days',
        outcome: 'Defends market share; preserves category placement index.',
        checklist: [
          'Secure premium end-cap display placement contracts with major West India grocers.',
          'Launch local regional marketing banners highlighting organic provenance.',
          'Distribute wholesale discount coupons to trade managers.'
        ]
      };
    case 'S09':
      return {
        owner: 'Rajendra Patel (Vapi Hub Director)',
        timeline: '6 Days',
        outcome: 'Bypasses cargo transit gridlock; prevents assembly line downtime.',
        checklist: [
          'Redirect container bookings from Shanghai port to Ningbo terminals.',
          'Deploy express customs clearance agent to expedite current shipping holds.',
          'Utilize road freight buffers to bridge regional inventory levels.'
        ]
      };
    case 'S10':
      return {
        owner: 'Karan Johar (Retail Relations Director)',
        timeline: '14 Days',
        outcome: 'Captures $600k revenue potential; expands retail footprint.',
        checklist: [
          'Draft distribution agreements for eco-friendly household products with retail networks.',
          'Authorize allocation shift of finished household detergent stock to South region.',
          'Coordinate shelf promotion setup with regional store managers.'
        ]
      };
    default:
      return {
        owner: 'Operations Coordinator',
        timeline: '7 Days',
        outcome: 'Stabilizes localized supply variance metrics.',
        checklist: [
          'Audit current safety buffers and cargo logs.',
          'Coordinate emergency response review call with category leads.',
          'Dispatch advisory report to all field stakeholders.'
        ]
      };
  }
};

const getTriggerVal = (sig: VPSignal) => {
  if (sig.trigger && sig.trigger.trim() !== '') return sig.trigger;
  switch (sig.id) {
    case 'S01': return 'A sharp 18% YoY volume spike in Q2 consumer consumption tracking across major APAC retail networks.';
    case 'S02': return 'Sudden local environmental regulatory hold and supplier factory lockdown at German eco-carton supplier.';
    case 'S03': return 'Competitor B initiated an aggressive 10% price promotion across discount grocery channels in EU supermarkets.';
    case 'S04': return 'Negative online reviews and social media mentions spike citing poor ergonomics and artwork changes on new personal care bottles.';
    case 'S05': return 'Primary chemical raw materials processing line breakdown at our domestic supplier in Western India.';
    case 'S06': return 'Overlapping promotional cycles showing high cross-substitution (-0.62 correlation) between 250ml and 500ml variants.';
    case 'S07': return 'Extended shipping logistics port bottlenecks in Rotterdam causing 5-day delivery delays to major retail stores.';
    case 'S08': return 'Competitor launched a new Organic Green Tea SKU in Western region supermarkets, matching our pricing structure.';
    case 'S09': return 'Major maritime cargo transit gridlock and customs clearance backlog at the Shanghai port hubs.';
    case 'S10': return 'Sustained 24% consumer demand surge for biodegradable cleaning products in Southern Americas retail stores.';
    default: return 'Automated predictive threshold alert triggered by anomaly detection agent.';
  }
};

const getRectificationVal = (sig: VPSignal) => {
  if (sig.rectification && sig.rectification.trim() !== '') return sig.rectification;
  switch (sig.id) {
    case 'S01': return 'Re-route 15,000 units of safety stock from Western warehouses to Vapi Hub and expand peak packaging throughput.';
    case 'S02': return 'Onboard pre-qualified regional packaging vendor in Poland and fast-track quality verification loops.';
    case 'S03': return 'Trigger a cross-category bundle campaign (Yogurt + BrandC Cookies) to shield customer grocery basket value.';
    case 'S04': return 'Revert bottle packaging layout to classic artwork template and schedule target consumer feedback focus groups.';
    case 'S05': return 'Qualify and onboard backup regional raw materials manufacturer in Gujarat within 10 days to fill inventory gap.';
    case 'S06': return 'Consolidate promotional funding onto the 500ml high-margin pack size and phase out overlapping 250ml discount runs.';
    case 'S07': return 'Pre-position finished goods buffer stock at secondary warehouse in Germany to stabilize localized supply rates.';
    case 'S10': return 'Expand regional distribution network agreements to place eco-friendly household detergents in 120 new outlets.';
    default: return 'Initiate cross-functional alignment review and establish mitigation logistics.';
  }
};

interface PortfolioDeepDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: 'overlap' | 'innovation' | 'risk' | null;
  isDarkMode: boolean;
}

const PortfolioDeepDiveModal: React.FC<PortfolioDeepDiveModalProps> = ({
  isOpen,
  onClose,
  metricType,
  isDarkMode
}) => {
  if (!isOpen || !metricType) return null;

  const getMetricData = () => {
    switch (metricType) {
      case 'overlap':
        return {
          title: 'Beverages Overlap Ratio',
          value: '0.68',
          status: 'High Cannibalization',
          statusColor: 'text-red-500 bg-red-500/10 border-red-500/20 dark:bg-red-500/5 dark:border-red-500/10',
          gaugeColor: '#ef4444',
          description: 'Measures the product/flavour similarity and customer base overlap across our active beverage SKUs. High overlap indicates that our variants are siphoning organic sales from each other rather than capturing new market share.',
          details: [
            { label: 'Primary Contributor', value: 'Mango Fizz 500ml vs 750ml' },
            { label: 'Promo Correlation', value: '-0.62 (High Sales Cannibalization)' },
            { label: 'Monthly Margin Drag', value: '~$1.2M estimated' },
            { label: 'Customer Overlap', value: '74% shared audience' }
          ],
          aiRecommendations: [
            'Consolidate duplicate pack sizes (e.g. phase out overlapping discount runs on the 750ml bottle and focus on the 500ml high-margin pack).',
            'Reposition variant branding: Align Mango Fizz Sugar-Free specifically toward health-conscious young adults and the Classic variant for family sharing.',
            'Establish non-overlapping promotional calendars siphoning SKUs to avoid co-depleting organic demand.'
          ],
          chartData: [
            { name: 'W1', 'Mango Fizz 500ml': 420, 'Mango Fizz 750ml': 380, 'Net Organic': 580 },
            { name: 'W2', 'Mango Fizz 500ml': 460, 'Mango Fizz 750ml': 320, 'Net Organic': 560 },
            { name: 'W3', 'Mango Fizz 500ml': 510, 'Mango Fizz 750ml': 290, 'Net Organic': 540 },
            { name: 'W4', 'Mango Fizz 500ml': 550, 'Mango Fizz 750ml': 260, 'Net Organic': 550 }
          ]
        };
      case 'innovation':
        return {
          title: 'Innovation Volume Share',
          value: '34%',
          status: 'Target > 30% (Outperforming)',
          statusColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/5 dark:border-emerald-500/10',
          gaugeColor: '#10b981',
          description: 'Tracks the percentage of total sales volume generated by product lines introduced within the last 18 months. Achieving 34% demonstrates rapid consumer adoption and strong market traction for our NPDs.',
          details: [
            { label: 'Leading Launch', value: 'Eco-Pack Mineral Water (BrandF)' },
            { label: 'NPD Adoption Rate', value: '14.2% MoM volume growth' },
            { label: 'Active Innovation SKUs', value: '18 products' },
            { label: 'Contribution to Margin', value: '+3.1% gross margin expansion' }
          ],
          aiRecommendations: [
            'Increase production capacity allocation by 15% for the top-performing Eco-Pack SKU to preempt potential stockouts.',
            'Onboard a domestic secondary supplier in Gujarat to reduce raw material transit time from 28 days to 10 days.',
            'Deploy targeted digital programmatic ad campaigns focusing on the Eco-Pack packaging sustainability claims in metros.'
          ],
          chartData: [
            { name: 'Jan', 'New Products': 28, 'Core Portfolio': 72 },
            { name: 'Feb', 'New Products': 30, 'Core Portfolio': 70 },
            { name: 'Mar', 'New Products': 32, 'Core Portfolio': 68 },
            { name: 'Apr', 'New Products': 31, 'Core Portfolio': 69 },
            { name: 'May', 'New Products': 33, 'Core Portfolio': 67 },
            { name: 'Jun', 'New Products': 34, 'Core Portfolio': 66 }
          ]
        };
      case 'risk':
        return {
          title: 'Portfolio Health Risk Index',
          value: '0.44',
          status: 'Moderate Risk Profile',
          statusColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/5 dark:border-amber-500/10',
          gaugeColor: '#f59e0b',
          description: 'A composite health index scoring the catalog\'s structural risks. Factors include raw materials complexity, single-source dependency, promotional reliance, and supply lead-time volatility.',
          details: [
            { label: 'Primary Risk Driver', value: 'Promo dependency (72% on snacks)' },
            { label: 'Average Lead Time', value: '24.5 days (Target < 15 days)' },
            { label: 'SKU Complexity Count', value: '42 low-velocity SKUs' },
            { label: 'Revenue Under Volatility', value: '$4.2M exposure' }
          ],
          aiRecommendations: [
            'Retire the bottom 10% low-velocity, high-complexity SKUs (e.g. low-margin floor cleaners) to free up warehouse capacity.',
            'Renegotiate wholesale agreements for ingredients to transition snack lines from promo-reliant pricing to everyday low pricing (EDLP).',
            'Pre-position ingredient buffers at primary regional hubs to compress procurement lead time by 30%.'
          ],
          chartData: [
            { name: 'Jan', 'Margin Leakage': 2.4, 'Supply Bottleneck': 1.8, 'Promo Reliance': 3.5 },
            { name: 'Feb', 'Margin Leakage': 2.3, 'Supply Bottleneck': 1.9, 'Promo Reliance': 3.4 },
            { name: 'Mar', 'Margin Leakage': 2.1, 'Supply Bottleneck': 2.2, 'Promo Reliance': 3.6 },
            { name: 'Apr', 'Margin Leakage': 1.9, 'Supply Bottleneck': 2.5, 'Promo Reliance': 3.2 },
            { name: 'May', 'Margin Leakage': 1.8, 'Supply Bottleneck': 2.8, 'Promo Reliance': 3.1 },
            { name: 'Jun', 'Margin Leakage': 1.7, 'Supply Bottleneck': 2.4, 'Promo Reliance': 3.0 }
          ]
        };
      default:
        return null;
    }
  };

  const data = getMetricData();
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-5 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#6d28d9] dark:text-[#a78bfa]" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">System Metric Deep Dive</span>
              <h3 className="text-[15px] font-display font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                {data.title}
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

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 flex flex-col items-center p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-black/5 dark:border-white/5">
            <svg viewBox="0 0 120 70" className="w-24 h-14">
              <path
                d="M 15 60 A 45 45 0 0 1 105 60"
                fill="none"
                stroke={isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 15 60 A 45 45 0 0 1 105 60"
                fill="none"
                stroke={data.gaugeColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={141.37}
                strokeDashoffset={141.37 * (1 - (metricType === 'innovation' ? 0.34 : metricType === 'overlap' ? 0.68 : 0.44))}
              />
            </svg>
            <span className="text-2xl font-display font-extrabold mt-1" style={{ color: data.gaugeColor }}>{data.value}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider mt-1.5 border ${data.statusColor}`}>
              {data.status}
            </span>
          </div>
          <div className="md:col-span-8 space-y-2">
            <h4 className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Metric Definition & Context</h4>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-[10.5px]">
              {data.description}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-black/5 dark:border-white/5 space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-700 dark:text-zinc-350 uppercase tracking-wider border-b border-black/5 dark:border-white/5 pb-1">Key Diagnostic Metrics</h4>
            <div className="space-y-2">
              {data.details.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-400">{d.label}</span>
                  <span className="font-bold text-zinc-750 dark:text-zinc-200">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-black/5 dark:border-white/5 space-y-3">
            <h4 className="text-[10px] font-bold text-[#6d28d9] dark:text-[#a78bfa] uppercase tracking-wider border-b border-black/5 dark:border-white/5 pb-1 flex items-center gap-1">
              <Brain size={12} />
              AI Strategic Recommendations
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] leading-relaxed">
              {data.aiRecommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Chart */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-black/5 dark:border-white/5 space-y-3">
          <h4 className="text-[10px] font-bold text-zinc-700 dark:text-zinc-350 uppercase tracking-wider border-b border-black/5 dark:border-white/5 pb-1">Performance Trend & Simulations</h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              {metricType === 'overlap' ? (
                <AreaChart data={data.chartData as any} margin={{ left: -25, right: 5, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDarkMode ? '#fff' : '#000', fontSize: 9 }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Area type="monotone" dataKey="Mango Fizz 500ml" stroke="#ef4444" fill="rgba(239, 68, 68, 0.1)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="Mango Fizz 750ml" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.1)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="Net Organic" stroke="#10b981" fill="rgba(16, 185, 129, 0.1)" strokeWidth={2} strokeDasharray="4 4" />
                </AreaChart>
              ) : metricType === 'innovation' ? (
                <BarChart data={data.chartData as any} margin={{ left: -25, right: 5, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDarkMode ? '#fff' : '#000', fontSize: 9 }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="New Products" stackId="a" fill="#10b981" />
                  <Bar dataKey="Core Portfolio" stackId="a" fill={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'} />
                </BarChart>
              ) : (
                <LineChart data={data.chartData as any} margin={{ left: -25, right: 5, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDarkMode ? '#fff' : '#000', fontSize: 9 }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Line type="monotone" dataKey="Margin Leakage" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="Supply Bottleneck" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="Promo Reliance" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-black/10 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-acies-gray hover:bg-acies-yellow hover:text-acies-gray text-white text-[9px] font-extrabold uppercase tracking-widest rounded-sm transition-all cursor-pointer border-none"
          >
            Close Deep Dive
          </button>
        </div>

      </div>
    </div>
  );
};

const RegionalAlertsModal: React.FC<RegionalAlertsModalProps> = ({
  isOpen,
  onClose,
  region,
  signals
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAlertId(null);
  }, [region, isOpen]);

  if (!isOpen) return null;

  // Filter unresolved alerts for the region
  const regionAlerts = signals.filter(s => s.region === region && !s.ack);
  
  // Sort by severity (critical first, then warning, then info)
  const sortedRegionAlerts = [...regionAlerts].sort((a, b) => {
    const sevWeight = { critical: 3, warning: 2, info: 1 };
    return (sevWeight[b.severity] || 0) - (sevWeight[a.severity] || 0);
  });

  if (selectedAlertId) {
    const sig = signals.find(s => s.id === selectedAlertId);
    if (sig) {
      const explainer = getAlertExplainer(sig.id);
      const triggerText = getTriggerVal(sig);
      const solutionText = getRectificationVal(sig);
      const indicatorBg = sig.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : sig.severity === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20';

      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-5 text-xs max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedAlertId(null)}
                  className="flex items-center gap-1 text-zinc-500 hover:text-[#5850ec] dark:hover:text-indigo-400 font-bold cursor-pointer border-none bg-transparent outline-none transition-colors text-xs"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <span className="text-zinc-300 dark:text-zinc-750">|</span>
                <div className="flex items-center gap-1.5 text-[#6d28d9] dark:text-[#a78bfa]">
                  <Brain size={18} className="fill-[#6d28d9]/10" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">AI Alert Explainer</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
              >
                <X size={16} />
              </button>
            </div>

            {/* Hero Alert Details */}
            <div className={`p-4 rounded border flex justify-between items-center ${indicatorBg}`}>
              <div>
                <span className="text-[8px] font-bold uppercase tracking-widest opacity-75">{sig.refCode} · {sig.type}</span>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-white">
                  {sig.title}
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                  {sig.detail}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[8px] font-bold uppercase tracking-widest block opacity-75">Projected Impact</span>
                <span className="text-sm font-mono font-extrabold block">
                  {sig.impact}
                </span>
              </div>
            </div>

            {/* Explanation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Why (Underlying Drivers) */}
              <div className="space-y-2.5 p-3.5 rounded bg-zinc-50/50 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200">
                  <AlertTriangle size={14} className="text-orange-500" />
                  <h5 className="font-bold uppercase tracking-wider text-[10px]">Why was this triggered?</h5>
                </div>
                <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                  <p>{triggerText}</p>
                </div>
              </div>

              {/* How to Solve */}
              <div className="space-y-2.5 p-3.5 rounded bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15">
                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200">
                  <Sparkles size={14} className="text-[#5850ec] dark:text-indigo-400 animate-pulse" />
                  <h5 className="font-bold uppercase tracking-wider text-[10px] text-emerald-600 dark:text-emerald-450">How can it be solved?</h5>
                </div>
                <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                  <p>{solutionText}</p>
                </div>
              </div>

            </div>

            {/* Execution Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 border-t border-black/5 dark:border-white/10 pt-4">
              {/* Checklist */}
              <div className="md:col-span-3 space-y-3">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  Mitigation Action Steps
                </span>
                <ul className="space-y-2 list-none pl-0">
                  {explainer.checklist.map((step, sIdx) => (
                    <li key={sIdx} className="flex gap-2.5 text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed bg-zinc-50/40 dark:bg-white/2 p-2.5 rounded border border-black/2 dark:border-white/2 hover:border-black/5 dark:hover:border-white/5 transition-all">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Parameter Sidebar */}
              <div className="md:col-span-2 space-y-4">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  Ownership & Timeline
                </span>
                <div className="space-y-3.5 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded border border-black/5 dark:border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-1">
                      <User size={12} className="text-zinc-400" /> Assigned Owner
                    </span>
                    <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">
                      {explainer.owner}
                    </p>
                  </div>
                  
                  <div className="space-y-0.5 border-t border-black/5 dark:border-white/5 pt-2.5">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-1">
                      <Clock size={12} className="text-zinc-400" /> Expected Lead Time
                    </span>
                    <p className="text-[11px] font-bold text-[#6d28d9] dark:text-[#a78bfa] font-mono">
                      {explainer.timeline}
                    </p>
                  </div>

                  <div className="space-y-0.5 border-t border-black/5 dark:border-white/5 pt-2.5">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-1">
                      <TrendingUp size={12} className="text-zinc-400" /> Expected Outcome
                    </span>
                    <p className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-450 leading-normal font-mono">
                      {explainer.outcome}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-black/15 dark:border-white/15 pt-3.5">
              <button 
                onClick={() => setSelectedAlertId(null)}
                className="px-3.5 py-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-655 dark:text-zinc-300 text-[9px] font-extrabold uppercase tracking-widest rounded-sm border border-zinc-250 dark:border-zinc-700 transition-all cursor-pointer"
              >
                ← Back to Summary
              </button>
              
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-acies-gray hover:bg-acies-yellow hover:text-acies-gray text-white text-[9px] font-extrabold uppercase tracking-widest rounded-sm transition-all cursor-pointer border-none"
              >
                Acknowledge & Close
              </button>
            </div>

          </div>
        </div>
      );
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-5 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-3">
          <div className="flex items-center gap-2 text-[#6d28d9] dark:text-[#a78bfa]">
            <Globe size={18} className="fill-[#6d28d9]/10" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">{region} Regional Alerts</span>
              <h3 className="text-[15px] font-display font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                Alert Triggers & Rectification Summary
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Overview Banner */}
        <div className="bg-[#6d28d9]/5 dark:bg-[#a78bfa]/5 border border-[#6d28d9]/10 dark:border-[#a78bfa]/10 p-3.5 rounded text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
          This summary outlines active operational alerts detected in the <strong className="text-zinc-800 dark:text-white">{region}</strong> region. Click an alert below to view its AI predictive analysis, trigger drivers, and step-by-step mitigation plans.
        </div>

        {/* Alerts Registry details inside Modal */}
        <div className="space-y-3">
          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
            {sortedRegionAlerts.length > 0 ? (
              sortedRegionAlerts.map(sig => {
                const borderCol = sig.severity === 'critical' ? 'border-red-500/30' : sig.severity === 'warning' ? 'border-amber-500/30' : 'border-blue-500/30';
                const indicatorBg = sig.severity === 'critical' ? 'bg-red-500/10 text-red-500' : sig.severity === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500';
                const triggerText = getTriggerVal(sig);
                const solutionText = getRectificationVal(sig);
                
                return (
                  <div 
                    key={sig.id} 
                    onClick={() => setSelectedAlertId(sig.id)}
                    className={`p-4 border-l-2 ${borderCol} border border-black/5 dark:border-white/5 rounded bg-zinc-50/20 dark:bg-white/2 space-y-3.5 transition-all duration-200 hover:scale-[1.01] hover:shadow-md hover:bg-black/[0.02] dark:hover:bg-white/5 cursor-pointer`}
                  >
                    
                    {/* Upper Meta Details */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[8.5px] font-bold text-[#6d28d9] dark:text-[#a78bfa] bg-[#6d28d9]/5 dark:bg-[#a78bfa]/5 px-1.5 py-0.5 rounded">
                            {sig.refCode}
                          </span>
                          <span className="text-zinc-350 dark:text-zinc-600">•</span>
                          <h4 className="text-[12px] font-bold text-zinc-800 dark:text-zinc-150 leading-tight">
                            {sig.title}
                          </h4>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded-sm opacity-55">
                            {sig.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed pt-0.5">
                          {sig.detail}
                        </p>
                      </div>

                      <div className="shrink-0 text-right space-y-1">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm inline-block ${indicatorBg}`}>
                          {sig.impact}
                        </span>
                        <span className="text-[8px] font-semibold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest font-mono block">
                          Cat: {sig.category}
                        </span>
                      </div>
                    </div>

                    {/* Trigger and Solution Summary */}
                    <div className="mt-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.04] space-y-1.5 text-[10px] leading-relaxed">
                      <p className="text-zinc-600 dark:text-zinc-350">
                        <strong className="text-orange-600 dark:text-orange-400 uppercase tracking-wider text-[8px] mr-1.5">Trigger:</strong>
                        {triggerText}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-350">
                        <strong className="text-emerald-650 dark:text-emerald-400 uppercase tracking-wider text-[8px] mr-1.5">Solution:</strong>
                        {solutionText}
                      </p>
                    </div>

                    {/* AI Prediction Explainer Prompt */}
                    <div className="pt-2 border-t border-black/[0.02] dark:border-white/[0.02] flex justify-between items-center text-[9px] text-[#6d28d9] dark:text-[#a78bfa] font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles size={10} className="animate-pulse" /> AI Predictor Explainer Available
                      </span>
                      <span className="uppercase tracking-widest hover:underline flex items-center gap-0.5">
                        View Analysis <ChevronRight size={10} />
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 space-y-2">
                <p className="text-[20px]">🎉</p>
                <p className="text-[11px] text-zinc-500 font-bold">All alerts resolved for the {region} Region!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-black/15 dark:border-white/15 pt-3.5">
          <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono font-bold">
            <ShieldAlert size={12} className="text-zinc-500" />
            <span>REGIONAL ALERT SUMMARY</span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-acies-gray hover:bg-acies-yellow hover:text-acies-gray text-white text-[9px] font-extrabold uppercase tracking-widest rounded-sm transition-all cursor-pointer border-none"
          >
            Close Summary
          </button>
        </div>

      </div>
    </div>
  );
};


const VPSignalsBoardView: React.FC<{ 
  isDarkMode: boolean; 
  setActiveTab: (tab: number) => void;
  onExploreToggle?: (isOpen: boolean) => void;
}> = ({ isDarkMode, setActiveTab, onExploreToggle }) => {
  const [signals, setSignals] = useState<VPSignal[]>(VP_SIGNALS_DATA);
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [toasts, setToasts] = useState<{ id: string; title: string; body: string; color: string }[]>([]);

  const [activeResolveSignal, setActiveResolveSignal] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerEmail, setComposerEmail] = useState({ to: '', name: '', subject: '', body: '', action: '' });
  const [successFeedback, setSuccessFeedback] = useState<{
    isOpen: boolean;
    recipientName: string;
    recipientTitle: string;
    recipientEmail: string;
    contextType: 'signal';
    contextTitle: string;
    channel: 'email' | 'message';
  } | null>(null);
  const [trendsTimeframe, setTrendsTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [npsTimeframe, setNpsTimeframe] = useState<'weekly' | 'monthly'>('monthly');
  const [aiPredictionOpen, setAiPredictionOpen] = useState(false);
  const [activePredictionType, setActivePredictionType] = useState<'stockout' | 'elasticity' | 'margin' | 'demand' | null>(null);
  const [selectedAlertRegion, setSelectedAlertRegion] = useState<string | null>(null);
  const [selectedCompIntelIdx, setSelectedCompIntelIdx] = useState<number | null>(null);
  const [selectedPortfolioBlock, setSelectedPortfolioBlock] = useState<'overlap' | 'innovation' | 'risk' | null>(null);
  const [marketSignalsView, setMarketSignalsView] = useState<'grid' | 'table'>('grid');
  const [exploreFilter, setExploreFilter] = useState<'All' | 'Risk' | 'Growth' | 'Competition' | 'Supply'>('All');
  const [showExplorePage, setShowExplorePage] = useState(false);
  const [explorePageView, setExplorePageView] = useState<'grid' | 'table'>('grid');
  const [selectedExploreSignal, setSelectedExploreSignal] = useState<ExploreSignal | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastRefreshed(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (onExploreToggle) {
      onExploreToggle(showExplorePage);
    }
  }, [showExplorePage, onExploreToggle]);

  const addToast = (title: string, body: string, color: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, body, color }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleResolveSignal = (id: string, title: string, resolutionMsg: string) => {
    setSignals(prev => prev.filter(s => s.id !== id));
    addToast('Signal Resolved', `${title}: ${resolutionMsg}`, '#10b981');
  };

  const handleToggleAck = (id: string) => {
    setSignals(prev => prev.map(s => {
      if (s.id === id) {
        const nextAck = !s.ack;
        addToast(
          nextAck ? 'Signal Acknowledged' : 'Signal Re-opened', 
          `Signal ref: ${s.refCode}`, 
          nextAck ? '#3b82f6' : '#f59e0b'
        );
        return { ...s, ack: nextAck };
      }
      return s;
    }));
  };

  // Filtered lists
  const filteredSignals = signals.filter(s => {
    const matchRegion = filterRegion === 'All' || s.region === filterRegion;
    const matchCategory = filterCategory === 'All' || s.category === filterCategory;
    const matchType = filterType === 'All' || s.type === filterType;
    const matchSeverity = filterSeverity === 'All' || s.severity === filterSeverity;
    return matchRegion && matchCategory && matchType && matchSeverity;
  });

  // KPI Calculations
  const activeCriticalCount = filteredSignals.filter(s => s.severity === 'critical' && !s.ack).length;
  const competitorAlertsCount = filteredSignals.filter(s => s.type === 'Competitor' && !s.ack).length;
  const activeOpportunityCount = filteredSignals.filter(s => s.type === 'Opportunity' && !s.ack).length;
  
  // Simulated overall risk exposure ($ Millions)
  const riskExposureVal = filteredSignals.reduce((sum, s) => {
    if (s.type === 'Risk' || s.type === 'Supply') {
      return sum + (s.severity === 'critical' ? 2.1 : 1.0);
    }
    return sum;
  }, 0);
  const finalRiskExposure = riskExposureVal > 0 ? riskExposureVal : 6.4;

  // Regions under alert
  const alertRegions = Array.from(new Set(filteredSignals.filter(s => s.severity === 'critical' || s.severity === 'warning').map(s => s.region)));

  // Resolution Rate
  const resolvedCount = VP_SIGNALS_DATA.length - signals.length;
  const resolutionRate = VP_SIGNALS_DATA.length > 0 
    ? Math.round((resolvedCount / VP_SIGNALS_DATA.length) * 15 + 85) // simulated baseline 85% + resolved factor
    : 91;

  // Recharts Trends Line Data
  const categoryTrendsWeeklyData = [
    { name: 'W1', Beverages: 62, Snacks: 55, PersonalCare: 45, Household: 35 },
    { name: 'W2', Beverages: 68, Snacks: 53, PersonalCare: 48, Household: 34 },
    { name: 'W3', Beverages: 72, Snacks: 58, PersonalCare: 46, Household: 38 },
    { name: 'W4', Beverages: 78, Snacks: 54, PersonalCare: 44, Household: 42 },
  ];

  const categoryTrendsMonthlyData = [
    { name: 'Jan', Beverages: 58, Snacks: 50, PersonalCare: 40, Household: 30 },
    { name: 'Feb', Beverages: 64, Snacks: 52, PersonalCare: 42, Household: 32 },
    { name: 'Mar', Beverages: 70, Snacks: 56, PersonalCare: 45, Household: 36 },
    { name: 'Apr', Beverages: 76, Snacks: 54, PersonalCare: 43, Household: 40 },
    { name: 'May', Beverages: 80, Snacks: 58, PersonalCare: 47, Household: 42 },
    { name: 'Jun', Beverages: 83, Snacks: 60, PersonalCare: 49, Household: 44 }
  ];

  const categoryTrendsData = trendsTimeframe === 'weekly' ? categoryTrendsWeeklyData : categoryTrendsMonthlyData;

  // NPS Trends Data
  const npsTrendsData = [
    { name: 'Jan', Beverages: 72, Snacks: 68, PersonalCare: 70, Household: 65 },
    { name: 'Feb', Beverages: 73, Snacks: 70, PersonalCare: 71, Household: 66 },
    { name: 'Mar', Beverages: 75, Snacks: 72, PersonalCare: 70, Household: 68 },
    { name: 'Apr', Beverages: 76, Snacks: 71, PersonalCare: 68, Household: 72 },
    { name: 'May', Beverages: 78, Snacks: 73, PersonalCare: 69, Household: 74 },
    { name: 'Jun', Beverages: 79, Snacks: 74, PersonalCare: 71, Household: 75 }
  ];

  const npsTrendsWeeklyData = [
    { name: 'W1', Beverages: 76, Snacks: 71, PersonalCare: 69, Household: 72 },
    { name: 'W2', Beverages: 77, Snacks: 72, PersonalCare: 70, Household: 73 },
    { name: 'W3', Beverages: 78, Snacks: 73, PersonalCare: 69, Household: 74 },
    { name: 'W4', Beverages: 79, Snacks: 74, PersonalCare: 71, Household: 75 }
  ];

  const activeNpsData = npsTimeframe === 'weekly' ? npsTrendsWeeklyData : npsTrendsData;

  // Market signals explore data
  const exploreSignals = [
    { id: 1, type: 'Risk', title: 'Price sensitivity rising', desc: 'Consumer trade-down accelerating in Q2', urgency: 85, urgencyLabel: 'High', action: 'Trigger a cross-category bundle campaign (Snacks + Beverages) to protect volume.' },
    { id: 2, type: 'Growth', title: 'Health segment up', desc: '+19% YoY, outpacing core', urgency: 60, urgencyLabel: 'Medium', action: 'Formulate health-aligned brand line extension (BrandA Sugar-Free) in 90 days.' },
    { id: 3, type: 'Competition', title: 'New entrants: 4', desc: '2 direct, 2 adjacent SKUs launched', urgency: 75, urgencyLabel: 'High', action: 'Deploy localized supermarket end-cap display campaign to raise retail distribution to 85%.' },
    { id: 4, type: 'Supply', title: 'Supply constraints', desc: 'Raw material lead times +3 wks', urgency: 95, urgencyLabel: 'Critical', action: 'Onboard domestic secondary ingredient supplier in Gujarat to shorten lead time.' },
    { id: 5, type: 'Growth', title: 'Export opportunity', desc: 'APAC demand signal strong', urgency: 35, urgencyLabel: 'Low', action: 'Allocate 15% extra manufacturing capacity to Eco-Pack mineral water for APAC.' },
    { id: 6, type: 'Growth', title: 'Online channel growth', desc: 'D2C grocery sales +24%', urgency: 70, urgencyLabel: 'Medium', action: 'Optimize e-commerce product listings and bundle offers for online retailers.' }
  ];

  const filteredExplore = exploreSignals.filter(s => exploreFilter === 'All' || s.type === s.type && s.type === exploreFilter);

  // Heatmap metrics
  const regionList = ['APAC', 'EMEA', 'Americas', 'India'];
  const getAlertLoad = (reg: string) => {
    return filteredSignals.filter(s => s.region === reg && !s.ack).length;
  };

  const handleExport = () => {
    addToast('Summary Exported', 'Strategic signal audit log has been compiled and downloaded.', '#3b82f6');
  };

  return (
    <div className="space-y-6">
      {showExplorePage ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Header with back button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2 rounded-sm shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExplorePage(false)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white cursor-pointer border-none bg-transparent flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={14} />
              </button>
              <div>
                <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa]">Market Recommendations</span>
                <h2 className="text-sm font-display font-bold text-zinc-805 dark:text-zinc-105 leading-tight mt-0.5">VP-Ready Signals Board</h2>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-mono text-zinc-400">Last updated: {lastRefreshed}</span>
            </div>
          </div>

          {/* Explore view body */}
          <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 rounded-sm shadow-sm space-y-6">
            {/* Heading Block */}
            <div className="space-y-1 pb-3 border-b border-black/5 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Interactive Signal Filter</span>
              <p className="text-[9.5px] text-zinc-550 dark:text-zinc-400 mt-0.5">Filter the urgency signals to isolate key decision areas.</p>
            </div>

            {/* Filters & View Toggles Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
              {/* Filter bar */}
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'Risk', 'Growth', 'Competition', 'Supply'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setExploreFilter(f)}
                    className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
                      exploreFilter === f
                        ? 'bg-[#6d28d9] dark:bg-[#a78bfa] text-white shadow-sm'
                        : 'bg-black/5 dark:bg-white/5 text-zinc-550 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Grid & Table toggle buttons (in right corner) */}
              <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setExplorePageView('grid')}
                  className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                    explorePageView === 'grid'
                      ? 'bg-[#5850ec] text-white shadow-sm'
                      : `bg-transparent text-zinc-550 hover:text-zinc-805 dark:text-zinc-400 dark:hover:text-white`
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setExplorePageView('table')}
                  className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                    explorePageView === 'table'
                      ? 'bg-[#5850ec] text-white shadow-sm'
                      : `bg-transparent text-zinc-550 hover:text-zinc-805 dark:text-zinc-400 dark:hover:text-white`
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {/* Signals list */}
            {explorePageView === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExplore.map(s => {
                  const colorHex = s.type === 'Risk' || s.type === 'Supply'
                    ? (s.urgency > 80 ? '#ef4444' : '#f59e0b')
                    : (s.type === 'Growth' ? '#10b981' : '#3b82f6');
                  
                  const typeBadgeColor = s.type === 'Risk'
                    ? 'bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/25'
                    : s.type === 'Supply'
                    ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border-amber-500/25'
                    : s.type === 'Growth'
                    ? 'bg-emerald-500/10 text-emerald-655 dark:text-emerald-400 border-emerald-500/25'
                    : 'bg-blue-500/10 text-blue-650 dark:text-blue-400 border-blue-500/25';

                  return (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedExploreSignal(s)}
                      className="p-4 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded hover:scale-[1.01] hover:shadow-md hover:border-[#6d28d9]/35 transition-all space-y-3 flex flex-col justify-between cursor-pointer"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0 space-y-1">
                            <h4 className="text-[12px] font-bold text-zinc-805 dark:text-zinc-155 flex items-center gap-2 flex-wrap">
                              {s.title}
                              <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${typeBadgeColor}`}>
                                {s.type}
                              </span>
                            </h4>
                            <p className="text-[10px] text-zinc-550 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
                          </div>

                          {/* Urgency priority bar */}
                          <div className="flex flex-col gap-1 w-20 shrink-0">
                            <div className="flex justify-between text-[8px] font-extrabold uppercase">
                              <span className="text-zinc-400">Urgency</span>
                              <span style={{ color: colorHex }}>{s.urgency}%</span>
                            </div>
                            <div className="w-full h-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${s.urgency}%`, backgroundColor: colorHex }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inline Recommended Action */}
                      <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.04] bg-[#6d28d9]/[0.02] dark:bg-[#a78bfa]/[0.01] p-2 rounded-sm">
                        <p className="text-[10px] text-zinc-800 dark:text-zinc-200 leading-relaxed">
                          <strong className="text-[8.5px] uppercase tracking-wider text-[#6d28d9] dark:text-[#a78bfa] mr-2 font-extrabold">Recommended Action:</strong>
                          {s.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Table view of explore signals
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      <th className="py-2 pb-1.5 font-bold w-1/4">Signal</th>
                      <th className="py-2 pb-1.5 font-bold w-1/4">Urgency</th>
                      <th className="py-2 pb-1.5 font-bold w-2/4">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03] text-[10.5px]">
                    {filteredExplore.map(s => {
                      const colorHex = s.type === 'Risk' || s.type === 'Supply'
                        ? (s.urgency > 80 ? '#ef4444' : '#f59e0b')
                        : (s.type === 'Growth' ? '#10b981' : '#3b82f6');
                      
                      const typeBadgeColor = s.type === 'Risk'
                        ? 'bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/25'
                        : s.type === 'Supply'
                        ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border-amber-500/25'
                        : s.type === 'Growth'
                        ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border-emerald-500/25'
                        : 'bg-blue-500/10 text-blue-650 dark:text-blue-400 border-blue-500/25';

                      return (
                        <tr 
                          key={s.id} 
                          onClick={() => setSelectedExploreSignal(s)}
                          className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                        >
                          <td className="py-3 font-bold text-zinc-800 dark:text-zinc-200 pr-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{s.title}</span>
                              <span className={`text-[7.5px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${typeBadgeColor}`}>
                                {s.type}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-zinc-400 font-medium mt-0.5">{s.desc}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-col gap-1 w-24">
                              <div className="flex justify-between text-[7.5px] font-extrabold uppercase">
                                <span className="text-zinc-400">Urgency</span>
                                <span style={{ color: colorHex }}>{s.urgency}%</span>
                              </div>
                              <div className="w-full h-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${s.urgency}%`, backgroundColor: colorHex }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-zinc-800 dark:text-zinc-200">
                            <div className="bg-[#6d28d9]/[0.02] dark:bg-[#a78bfa]/[0.01] border border-black/[0.02] dark:border-white/[0.02] p-2 rounded-sm max-w-lg">
                              {s.action}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              <button
                onClick={() => addToast('Scenario Simulation Started', 'Opening AI sandbox to model price & supply scenarios...', '#10b981')}
                className="px-5 py-2.5 bg-acies-gray hover:bg-acies-yellow hover:text-acies-gray text-white border-none rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Simulate scenarios</span>
                <Play size={11} />
              </button>
              <button
                onClick={() => addToast('Board Exported', 'Strategic market signals report compiled and downloaded.', '#3b82f6')}
                className="px-5 py-2.5 border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[10px] font-bold text-zinc-700 dark:text-zinc-350 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-transparent uppercase tracking-wider"
              >
                <span>Export board summary</span>
                <Download size={11} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
      

      {/* Top Filter Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-3.5 rounded-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2 py-1.5 rounded-sm">
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
            <option value="Household">Household</option>
          </select>

          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-650 dark:text-zinc-350 outline-none cursor-pointer"
          >
            <option value="All">All Signal Types</option>
            <option value="Risk">Risk</option>
            <option value="Opportunity">Opportunity</option>
            <option value="Competitor">Competitor</option>
            <option value="Sentiment">Sentiment</option>
            <option value="Supply">Supply</option>
            <option value="Portfolio">Portfolio</option>
          </select>

          <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9px] font-bold text-zinc-650 dark:text-zinc-350 outline-none cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="critical">🔴 Critical</option>
            <option value="warning">🟡 Warning</option>
            <option value="info">🔵 Info</option>
          </select>

          {(filterRegion !== 'All' || filterCategory !== 'All' || filterType !== 'All' || filterSeverity !== 'All') && (
            <button 
              onClick={() => { setFilterRegion('All'); setFilterCategory('All'); setFilterType('All'); setFilterSeverity('All'); }}
              className="text-[9px] text-[#6d28d9] dark:text-[#a78bfa] font-bold uppercase tracking-wider hover:underline px-1 cursor-pointer bg-transparent border-none"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold font-mono">
            <RefreshCw size={11} className="text-zinc-400" />
            <span>UPDATED: {lastRefreshed}</span>
          </div>
          <span className="h-4 w-px bg-black/10 dark:bg-white/15"></span>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider rounded-sm text-zinc-600 dark:text-zinc-400 cursor-pointer"
          >
            <Download size={11} />
            Export Summary
          </button>
        </div>
      </div>

      {/* Row 1: Critical Signals KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* KPI 1: Competitor Alerts */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Competitor Alerts</p>
          <h4 className="text-2xl font-display font-extrabold text-[#6d28d9] dark:text-[#a78bfa] leading-none">{competitorAlertsCount}</h4>
          <p className="text-[9px] text-zinc-450 dark:text-zinc-550 font-semibold uppercase font-bold text-[#6d28d9] dark:text-[#a78bfa]">Active Campaigns</p>
        </div>

        {/* KPI 2: Opportunity Signals */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Opportunities</p>
          <h4 className="text-2xl font-display font-extrabold text-emerald-500 leading-none">{activeOpportunityCount}</h4>
          <p className="text-[9px] text-zinc-450 dark:text-zinc-550 font-semibold uppercase">Growth drivers</p>
        </div>

        {/* KPI 3: Risk Exposure */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Risk Exposure</p>
          <h4 className="text-2xl font-display font-extrabold text-orange-500 leading-none">${finalRiskExposure.toFixed(1)}M</h4>
          <p className="text-[9px] text-zinc-450 dark:text-zinc-550 font-semibold uppercase">Revenue at risk</p>
        </div>

        {/* KPI 4: AI Risk Predictions */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">AI Risk Predictions</p>
          <h4 className="text-2xl font-display font-extrabold text-[#6d28d9] dark:text-[#a78bfa] leading-none">12</h4>
          <p className="text-[9px] text-zinc-450 dark:text-zinc-550 font-semibold uppercase">Emergent concerns</p>
        </div>

        {/* KPI 5: Regions Under Alert */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Regions Alerted</p>
          <h4 className="text-2xl font-display font-extrabold text-blue-500 leading-none">{alertRegions.length}</h4>
          <p className="text-[9px] text-zinc-450 dark:text-zinc-550 font-semibold uppercase">
            {alertRegions.length > 0 ? alertRegions.join(', ') : 'None'}
          </p>
        </div>

        {/* KPI 6: Signal Resolution Rate */}
        <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-sm shadow-sm flex flex-col justify-between h-28 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Resolution Rate</p>
          <h4 className="text-2xl font-display font-extrabold text-zinc-800 dark:text-zinc-200 leading-none">{resolutionRate}%</h4>
          <p className="text-[9px] text-zinc-450 dark:text-zinc-550 font-semibold uppercase">Action efficiency</p>
        </div>

      </div>

      {/* Row 2: Executive Signal Feed | Category Trend Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Main Executive Signal Feed */}
        <div className="xl:col-span-7 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Executive Signal Feed</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {filteredSignals.length} active notifications
            </span>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {filteredSignals.length > 0 ? (
              filteredSignals.map(sig => {
                const borderCol = sig.severity === 'critical' ? 'border-red-500/30' : sig.severity === 'warning' ? 'border-amber-500/30' : 'border-blue-500/30';
                const indicatorBg = sig.severity === 'critical' ? 'bg-red-500/10 text-red-500' : sig.severity === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500';
                
                return (
                  <div key={sig.id} className={`p-3.5 border-l-2 ${borderCol} rounded-r-sm bg-zinc-50/50 dark:bg-white/5 space-y-3 ${sig.ack ? 'opacity-40' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-[11.5px] font-bold text-zinc-805 dark:text-zinc-155 flex items-center gap-2 flex-wrap">
                          {sig.title}
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded-sm opacity-55">
                            {sig.type}
                          </span>
                        </h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">{sig.detail}</p>
                        
                        {/* Trigger and Solution Summary */}
                        <div className="mt-2 space-y-1.5 pl-2 border-l border-black/10 dark:border-white/10 text-[9.5px] leading-relaxed">
                          <p className="text-zinc-600 dark:text-zinc-400">
                            <strong className="text-orange-600 dark:text-orange-400 uppercase tracking-wider text-[8px] mr-1.5">Trigger:</strong>
                            {sig.trigger}
                          </p>
                          <p className="text-zinc-600 dark:text-zinc-400">
                            <strong className="text-emerald-650 dark:text-emerald-400 uppercase tracking-wider text-[8px] mr-1.5">Solution:</strong>
                            {sig.rectification}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm whitespace-nowrap ${indicatorBg}`}>
                        {sig.impact}
                      </span>
                    </div>

                    <div className="flex gap-2 justify-end pt-1 border-t border-black/[0.03] dark:border-white/[0.03]">
                      <button 
                        onClick={() => handleToggleAck(sig.id)}
                        className="px-2.5 py-1 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 rounded-sm text-[8.5px] font-bold uppercase tracking-wider transition-all cursor-pointer bg-transparent text-zinc-500 dark:text-zinc-400"
                      >
                        {sig.ack ? 'Re-open' : 'Acknowledge'}
                      </button>
                      <button 
                        onClick={() => {
                          setActiveResolveSignal(sig.id);
                        }}
                        className="px-2.5 py-1 bg-acies-gray hover:bg-acies-yellow hover:text-acies-gray text-white rounded-sm text-[8.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center gap-1"
                      >
                        Resolve ✓
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-[10px] text-zinc-500 font-bold py-12">✓ Strategic feed cleared</p>
            )}
          </div>
        </div>

        {/* Category & Brand Momentum Trend Chart */}
        <div className="xl:col-span-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category & Brand Momentum</span>
              <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
                {trendsTimeframe === 'weekly' ? 'Weekly sales index' : 'Monthly sales index'}
              </p>
            </div>
            
            <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setTrendsTimeframe('weekly')}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                  trendsTimeframe === 'weekly'
                    ? 'bg-[#5850ec] text-white shadow-sm'
                    : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setTrendsTimeframe('monthly')}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                  trendsTimeframe === 'monthly'
                    ? 'bg-[#5850ec] text-white shadow-sm'
                    : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryTrendsData} margin={{ left: -25, right: 5, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDarkMode ? '#fff' : '#000' }}
                  itemStyle={{ fontSize: 9 }}
                  labelStyle={{ fontSize: 9, fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line type="monotone" dataKey="Beverages" stroke="#6d28d9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Snacks" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="PersonalCare" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Household" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Market Signals Map | AI Predictive Signals */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Market Signals Map (Regional Alert Load Heatgrid) */}
        <div className="xl:col-span-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Market Signals Alert Map</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Alert loading by region</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            {regionList.map(reg => {
              const count = getAlertLoad(reg);
              const color = count >= 3 
                ? 'border-red-500/35 text-red-500 bg-red-500/5 hover:border-red-500/55 hover:bg-red-500/10' 
                : count >= 1 
                  ? 'border-amber-500/35 text-amber-500 bg-amber-500/5 hover:border-amber-500/55 hover:bg-amber-500/10' 
                  : 'border-emerald-500/35 text-emerald-500 bg-emerald-500/5 hover:border-emerald-500/55 hover:bg-emerald-500/10';
              return (
                <div 
                  key={reg} 
                  onClick={() => setSelectedAlertRegion(reg)}
                  className={`p-4 border rounded-sm flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer select-none transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${color}`}
                >
                  <Globe size={40} className="absolute -right-2 -bottom-2 opacity-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">{reg} Region</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <h5 className="text-xl font-display font-bold leading-none">{count}</h5>
                    <span className="text-[8px] font-extrabold uppercase">unresolved</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Predictions & Risk Scores */}
        <div className="xl:col-span-7 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6d28d9] dark:text-[#a78bfa] flex items-center gap-1">
              <Zap size={11} className="fill-[#6d28d9] dark:fill-[#a78bfa]" />
              AI Risk Predictions
            </span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Forecasted disruptions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Prediction 1 */}
            <div 
              onClick={() => {
                setActivePredictionType('stockout');
                setAiPredictionOpen(true);
              }}
              className="p-3 border border-black/5 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 cursor-pointer hover:border-purple-500/35 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all"
            >
              <div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase text-zinc-450 dark:text-zinc-550">
                  <span>Launch Supply Shortage</span>
                  <span className="text-red-500">92% Prob.</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">BrandA Premium Energy</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Pre-launch safety buffer at Vapi Hub is <span className="font-bold text-red-500">below threshold</span> for regional launch.
                </p>
              </div>
            </div>

            {/* Prediction 2 */}
            <div 
              onClick={() => {
                setActivePredictionType('elasticity');
                setAiPredictionOpen(true);
              }}
              className="p-3 border border-black/5 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 cursor-pointer hover:border-purple-500/35 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all"
            >
              <div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase text-zinc-450 dark:text-zinc-550">
                  <span>Counter-Launch Price War</span>
                  <span className="text-amber-500">74% Impact</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">BrandD Yogurt Drink</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Competitor wafer price cuts designed to <span className="font-bold text-amber-500">block shelf placements</span> of new launch in EU.
                </p>
              </div>
            </div>

            {/* Prediction 3 */}
            <div 
              onClick={() => {
                setActivePredictionType('margin');
                setAiPredictionOpen(true);
              }}
              className="p-3 border border-black/5 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 cursor-pointer hover:border-purple-500/35 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all"
            >
              <div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase text-zinc-450 dark:text-zinc-550">
                  <span>Launch Cost Overrun</span>
                  <span className="text-red-500">81% Prob.</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">BrandC Biscuits</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Initial mold tooling and launch marketing costs projected to <span className="font-bold text-red-500">exceed budget by 24%</span>.
                </p>
              </div>
            </div>

            {/* Prediction 4 */}
            <div 
              onClick={() => {
                setActivePredictionType('demand');
                setAiPredictionOpen(true);
              }}
              className="p-3 border border-black/5 dark:border-white/10 rounded-sm bg-zinc-50/50 dark:bg-white/5 cursor-pointer hover:border-purple-500/35 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all"
            >
              <div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase text-zinc-450 dark:text-zinc-550">
                  <span>Pilot Production Delay</span>
                  <span className="text-indigo-500">88% Prob.</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">BrandF Eco-Pack Water</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Manufacturing validation line and regulatory permit backlog <span className="font-bold text-indigo-500">delaying pilot run</span> in APAC.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Row 4: Market Signals | Competitive Intelligence */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Market Signals Card */}
        <div className="xl:col-span-7 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Market signals</span>
              
              <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setMarketSignalsView('grid')}
                  className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                    marketSignalsView === 'grid'
                      ? 'bg-[#5850ec] text-white shadow-sm'
                      : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setMarketSignalsView('table')}
                  className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                    marketSignalsView === 'table'
                      ? 'bg-[#5850ec] text-white shadow-sm'
                      : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {marketSignalsView === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Item 1 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/10">
                    <AlertTriangle size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-805 dark:text-zinc-155 leading-none">Price sensitivity rising</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">Consumer trade-down accelerating in Q2</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/10">
                    <TrendingUp size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-805 dark:text-zinc-155 leading-none">Health segment up</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">+19% YoY, outpacing core</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/10">
                    <Users size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-805 dark:text-zinc-155 leading-none">New entrants: 4</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">2 direct, 2 adjacent SKUs launched</p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10">
                    <Inbox size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-805 dark:text-zinc-155 leading-none">Supply constraints</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">Raw material lead times +3 wks</p>
                  </div>
                </div>

                {/* Item 5 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/10">
                    <Globe size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-805 dark:text-zinc-155 leading-none">Export opportunity</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">APAC demand signal strong</p>
                  </div>
                </div>

                {/* Item 6 */}
                <div className="flex items-center gap-3.5 p-3 bg-black/[0.01] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/10">
                    <Sparkles size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11.5px] font-bold text-zinc-805 dark:text-zinc-155 leading-none">Online channel growth</h5>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">D2C grocery sales +24%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      <th className="py-2 pb-1.5 font-bold">Signal</th>
                      <th className="py-2 pb-1.5 font-bold">Category</th>
                      <th className="py-2 pb-1.5 font-bold">Impact / Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03] text-[10.5px]">
                    {/* Row 1 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <AlertTriangle size={13} className="text-red-500" />
                        Price sensitivity rising
                      </td>
                      <td className="py-2.5 text-red-500 font-bold uppercase text-[9px]">High Risk</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">Consumer trade-down accelerating in Q2</td>
                    </tr>
                    {/* Row 2 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <TrendingUp size={13} className="text-emerald-500" />
                        Health segment up
                      </td>
                      <td className="py-2.5 text-emerald-500 font-bold uppercase text-[9px]">Growth Opportunity</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">+19% YoY, outpacing core</td>
                    </tr>
                    {/* Row 3 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <Users size={13} className="text-blue-500" />
                        New entrants: 4
                      </td>
                      <td className="py-2.5 text-blue-500 font-bold uppercase text-[9px]">Market Alert</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">2 direct, 2 adjacent SKUs launched</td>
                    </tr>
                    {/* Row 4 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <Inbox size={13} className="text-amber-500" />
                        Supply constraints
                      </td>
                      <td className="py-2.5 text-amber-500 font-bold uppercase text-[9px]">Sourcing Risk</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">Raw material lead times +3 wks</td>
                    </tr>
                    {/* Row 5 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <Globe size={13} className="text-emerald-500" />
                        Export opportunity
                      </td>
                      <td className="py-2.5 text-emerald-500 font-bold uppercase text-[9px]">Global Opportunity</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">APAC demand signal strong</td>
                    </tr>
                    {/* Row 6 */}
                    <tr>
                      <td className="py-2.5 flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <Sparkles size={13} className="text-purple-500" />
                        Online channel growth
                      </td>
                      <td className="py-2.5 text-purple-500 font-bold uppercase text-[9px]">Growth Opportunity</td>
                      <td className="py-2.5 text-zinc-500 dark:text-zinc-400">D2C grocery sales +24%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowExplorePage(true);
              addToast('Opening Explore Page', 'Opening dedicated VP-ready signals board.', '#3b82f6');
            }}
            className="w-full mt-4 py-2 border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[10px] font-bold text-zinc-700 dark:text-zinc-350 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-transparent"
          >
            <span>Explore</span>
            <ArrowUpRight size={13} className="shrink-0" />
          </button>

      </div>

        {/* Competitive Intelligence Signals */}
        <div className="xl:col-span-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Competitive Intelligence</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Market activity ticker</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              { label: 'Rival Pricing Cut', body: 'Competitor wafers priced drop -10% in EU supermarts.', time: '1h ago', cat: 'Snacks' },
              { label: 'Competitor Launch', body: 'Alternative premium soy drink introduced in APAC region.', time: '3h ago', cat: 'Beverages' },
              { label: 'Distribution Surge', body: 'Rival personal care brand secured 80% shelf targets in West India.', time: '5h ago', cat: 'Personal Care' }
            ].map((c, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedCompIntelIdx(i)}
                className="flex justify-between items-start gap-4 p-3 bg-black/[0.01] dark:bg-white/5 rounded border border-black/5 dark:border-white/5 text-[11px] cursor-pointer hover:border-purple-500/35 hover:bg-black/[0.02] dark:hover:bg-white/5 hover:scale-[1.01] transition-all"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 flex-wrap">
                    {c.label} · <span className="text-[8px] font-bold uppercase px-1 bg-black/10 dark:bg-white/10 rounded">{c.cat}</span>
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">{c.body}</p>
                  <span className="text-[8.5px] text-[#6d28d9] dark:text-[#a78bfa] font-bold uppercase mt-1 flex items-center gap-1">
                    <Sparkles size={10} className="animate-pulse" /> AI Comparison Available
                  </span>
                </div>
                <span className="text-[8.5px] font-mono text-zinc-400 whitespace-nowrap shrink-0">{c.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 5: Customer Sentiment NPS | Portfolio Saturation & Cannibalization */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Customer Sentiment NPS Meter */}
        <div className="xl:col-span-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Customer NPS Sentiment</span>
              <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">Target Score: &gt; 70</p>
            </div>
            
            <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setNpsTimeframe('weekly')}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                  npsTimeframe === 'weekly'
                    ? 'bg-[#5850ec] text-white shadow-sm'
                    : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setNpsTimeframe('monthly')}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer outline-none ${
                  npsTimeframe === 'monthly'
                    ? 'bg-[#5850ec] text-white shadow-sm'
                    : `bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white`
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeNpsData} margin={{ left: -25, right: 5, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDarkMode ? '#fff' : '#000' }}
                  itemStyle={{ fontSize: 9 }}
                />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line type="monotone" dataKey="Beverages" stroke="#6d28d9" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Snacks" stroke="#10b981" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="PersonalCare" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Household" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Health & Saturation Dials */}
        <div className="xl:col-span-7 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Portfolio Saturation & Cannibalization</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">System metrics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Card 1: Beverages Overlap Ratio */}
            <div 
              onClick={() => setSelectedPortfolioBlock('overlap')}
              className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col items-center text-center space-y-2 cursor-pointer hover:scale-[1.02] hover:shadow-md hover:border-purple-500/35 transition-all select-none"
            >
              <div className="relative">
                <svg viewBox="0 0 120 70" className="w-28 h-16">
                  {/* Background track */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke={isDarkMode ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)"}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Filled track for 0.68 */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={141.37}
                    strokeDashoffset={141.37 * (1 - 0.68)}
                  />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl font-display font-extrabold text-red-500 block leading-none">0.68</span>
                <span className="text-[10px] font-bold text-zinc-550 dark:text-zinc-400 block">Beverages overlap ratio</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20">
                High cannibalization
              </span>
            </div>

            {/* Card 2: Innovation Volume Share */}
            <div 
              onClick={() => setSelectedPortfolioBlock('innovation')}
              className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col items-center text-center space-y-2 cursor-pointer hover:scale-[1.02] hover:shadow-md hover:border-purple-500/35 transition-all select-none"
            >
              <div className="relative">
                <svg viewBox="0 0 120 70" className="w-28 h-16">
                  {/* Background track */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke={isDarkMode ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)"}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Filled track for 34% (0.34) */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={141.37}
                    strokeDashoffset={141.37 * (1 - 0.34)}
                  />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl font-display font-extrabold text-emerald-555 dark:text-emerald-500 block leading-none">34%</span>
                <span className="text-[10px] font-bold text-zinc-555 dark:text-zinc-400 block">Innovation volume share</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20">
                Target &gt; 30%
              </span>
            </div>

            {/* Card 3: Portfolio Health Risk Index */}
            <div 
              onClick={() => setSelectedPortfolioBlock('risk')}
              className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col items-center text-center space-y-2 cursor-pointer hover:scale-[1.02] hover:shadow-md hover:border-purple-500/35 transition-all select-none"
            >
              <div className="relative">
                <svg viewBox="0 0 120 70" className="w-28 h-16">
                  {/* Background track */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke={isDarkMode ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.1)"}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Filled track for 0.44 */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={141.37}
                    strokeDashoffset={141.37 * (1 - 0.44)}
                  />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl font-display font-extrabold text-amber-500 block leading-none">0.44</span>
                <span className="text-[10px] font-bold text-zinc-555 dark:text-zinc-400 block">Portfolio health risk index</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Moderate risk
              </span>
            </div>
          </div>
        </div>
    </div>
        </>
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
              <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 leading-none">{t.title}</h5>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{t.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resolve Sync Meeting Modal */}
      <ResolveSignalModal
        isOpen={!!activeResolveSignal}
        signal={signals.find(x => x.id === activeResolveSignal) || null}
        onClose={() => setActiveResolveSignal(null)}
        onRequestAction={(email, name, subject, body) => {
          setComposerEmail({
            to: email,
            name,
            subject,
            body,
            action: activeResolveSignal || ''
          });
          setComposerOpen(true);
        }}
      />

      {/* Email Composer Modal */}
      <EmailComposerModal 
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        initialEmail={composerEmail}
        onSend={(name, email, subject, body, channel) => {
          setComposerOpen(false);
          const resolvedTitle = RECIPIENT_TITLES[email.toLowerCase()] || 'Product Manager';
          const signal = signals.find(x => x.id === composerEmail.action);
          const title = signal ? signal.title : '';
          
          setSuccessFeedback({
            isOpen: true,
            recipientName: name,
            recipientTitle: resolvedTitle,
            recipientEmail: email,
            contextType: 'signal',
            contextTitle: title,
            channel
          });
          
          addToast(
            'Sync Meeting Invitation Sent', 
            `Meeting invite ${channel === 'email' ? 'email' : 'message'} sent successfully to ${name} (${email}).`, 
            '#10b981'
          );
          
          // Resolve signal
          setSignals(prev => prev.filter(s => s.id !== composerEmail.action));
          setActiveResolveSignal(null);
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

      {/* AI Prediction Explainer Modal */}
      <AIPredictionModal 
        isOpen={aiPredictionOpen}
        onClose={() => {
          setAiPredictionOpen(false);
          setActivePredictionType(null);
        }}
        predictionType={activePredictionType}
      />

      {/* Regional Alerts Summary Modal */}
      {selectedAlertRegion && (
        <RegionalAlertsModal 
          isOpen={!!selectedAlertRegion}
          onClose={() => setSelectedAlertRegion(null)}
          region={selectedAlertRegion}
          signals={signals}
        />
      )}

      {/* Competitive Intelligence Comparison Modal */}
      {selectedCompIntelIdx !== null && (
        <CompetitiveIntelligenceModal 
          isOpen={selectedCompIntelIdx !== null}
          onClose={() => setSelectedCompIntelIdx(null)}
          intelIdx={selectedCompIntelIdx}
        />
      )}

      {/* Portfolio Deep Dive Modal */}
      <PortfolioDeepDiveModal
        isOpen={selectedPortfolioBlock !== null}
        onClose={() => setSelectedPortfolioBlock(null)}
        metricType={selectedPortfolioBlock}
        isDarkMode={isDarkMode}
      />

      {/* Explore Signal Detail Modal */}
      <ExploreSignalDetailModal
        isOpen={selectedExploreSignal !== null}
        signal={selectedExploreSignal}
        onClose={() => setSelectedExploreSignal(null)}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
