/**
 * Signals Board. Dispatches to the VP lens; otherwise renders the practitioner view.
 *
 * Extracted from the original 3,982-line SignalsBoard.tsx.
 */
import React, { useState } from 'react';
import { Info, Inbox, Mail, Send } from 'lucide-react';
import { Bar } from 'recharts';
import { Role } from '../../../types/dashboard';
import { VPSignalsBoardView } from './VPSignalsBoardView';
import { InboxMessage, Signal, skuComparisonData } from './signalsData';

export interface SignalsBoardProps {
  role: Role;
  setActiveTab: (tab: number) => void;
  isDarkMode: boolean;
  onExploreToggle?: (isOpen: boolean) => void;
}

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
        <div id="sig-competitor-console" className="glass-card bg-white dark:bg-[#0b1329] border border-black/10 dark:border-[#1e294b] p-6 rounded-sm shadow-xl space-y-6 text-zinc-800 dark:text-slate-100">
          <div>
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-500">Try It Yourself</span>
            <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-800 dark:text-white mt-1">Drive all four engines</h2>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed max-w-3xl">
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
                      className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/10 dark:border-[#1e294b] rounded p-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none cursor-pointer"
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
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest pb-1 border-b border-black/5 dark:border-[#1e294b]">
                      <span>pricingai.decision_engine – Elasticity + Differential Evolution</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                        <span>Pepsi price</span>
                        <span className="text-amber-700 dark:text-amber-600 dark:text-amber-500 font-bold">₹{pepsiPrice.toFixed(2)}</span>
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
                        <span className="text-amber-700 dark:text-amber-600 dark:text-amber-500 font-bold">₹{mtnDewPrice.toFixed(2)}</span>
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

                  <div className="bg-blue-50/70 dark:bg-[#121c29]/50 border border-blue-500/15 dark:border-blue-500/10 p-3 rounded-sm text-[9.5px] text-zinc-700 dark:text-zinc-400 leading-relaxed font-semibold">
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
                      className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/10 dark:border-[#1e294b] rounded p-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none cursor-pointer"
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
                      className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/10 dark:border-[#1e294b] rounded p-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none cursor-pointer"
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
                      className="bg-zinc-50 dark:bg-[#0f1b35] border border-black/10 dark:border-[#1e294b] rounded p-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none cursor-pointer"
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
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-semibold w-16">Pepsi units</span>
                      <div className="w-[80%] bg-zinc-200 dark:bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (pricingPepsiDemand / 15000) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-semibold w-16">Mtn Dew units</span>
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
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-semibold">No promo</span>
                      <div className="w-[70%] bg-zinc-200 dark:bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-semibold">With promo</span>
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
                <p className="text-[10px] leading-relaxed text-zinc-800 dark:text-zinc-800 dark:text-zinc-400">
                  <strong className={activeEngine === 'pricing'
                    ? "text-emerald-700 dark:text-emerald-500 uppercase tracking-widest text-[9px] mr-2 font-bold"
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

                <div className="bg-blue-50/70 dark:bg-[#121c29]/50 border border-blue-500/15 dark:border-blue-500/10 p-3 rounded-sm text-[9.5px] text-zinc-700 dark:text-zinc-400">
                  🤖 <span className="font-bold text-zinc-700 dark:text-zinc-800 dark:text-zinc-400 ml-1">
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
        <div id="sig-competitor-tracker" className="glass-card bg-white dark:bg-[#0b1329] border border-black/10 dark:border-[#1e294b] p-6 rounded-sm shadow-xl space-y-6 text-zinc-800 dark:text-slate-100">
          
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
                className="bg-white dark:bg-zinc-900 border border-black/15 dark:border-[#1e294b] rounded p-2 text-xs font-semibold text-zinc-900 dark:text-white outline-none cursor-pointer w-full"
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
                      <tr className="border-b border-black/10 dark:border-[#1e294b]/65 text-[9px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-black/20">
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
                          <span className="ml-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">-1.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          ₹{selectedSKU === 'Lays' ? '18' : selectedSKU === 'Doritos' ? '28' : '14'}
                          <span className="ml-2 text-[10px] text-red-600 dark:text-red-500 font-bold">+2.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          ₹{selectedSKU === 'Lays' ? '12' : selectedSKU === 'Doritos' ? '18' : '10'}
                          <span className="ml-2 text-[10px] text-red-600 dark:text-red-500 font-bold">+8.0</span>
                        </td>
                      </tr>

                      {/* Row 2: Avg promo depth (8wk) */}
                      <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <td className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Avg promo depth (8wk)</td>
                        <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">
                          {selectedSKU === 'Lays' ? '14%' : selectedSKU === 'Doritos' ? '18%' : '12%'}
                        </td>
                        <td className="py-3.5 px-4">
                          6% <span className="ml-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">+8.4</span>
                        </td>
                        <td className="py-3.5 px-4">
                          1% <span className="ml-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">+13.4</span>
                        </td>
                        <td className="py-3.5 px-4">
                          9% <span className="ml-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">+5.4</span>
                        </td>
                      </tr>

                      {/* Row 3: Campaigns / quarter */}
                      <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <td className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Campaigns / quarter</td>
                        <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">
                          {selectedSKU === 'Lays' ? '4' : selectedSKU === 'Doritos' ? '5' : '3'}
                        </td>
                        <td className="py-3.5 px-4">
                          6 <span className="ml-2 text-[10px] text-red-700 dark:text-red-500 font-bold">-2.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          1 <span className="ml-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">+3.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          11 <span className="ml-2 text-[10px] text-red-700 dark:text-red-500 font-bold">-7.0</span>
                        </td>
                      </tr>

                      {/* Row 4: Availability */}
                      <tr className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <td className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Availability</td>
                        <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400">
                          {selectedSKU === 'Lays' ? '92%' : selectedSKU === 'Doritos' ? '95%' : '90%'}
                        </td>
                        <td className="py-3.5 px-4">
                          96% <span className="ml-2 text-[10px] text-red-700 dark:text-red-500 font-bold">-4.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          78% <span className="ml-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">+14.0</span>
                        </td>
                        <td className="py-3.5 px-4">
                          61% <span className="ml-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">+31.0</span>
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
                        <span className="bg-blue-600/20 text-blue-700 dark:text-blue-500 text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                          YOU
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        Your brand • {skuComparisonData[selectedSKU]?.you.brand}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                          <span>Price — Last 8 Weeks</span>
                          <span className="text-zinc-800 dark:text-zinc-400 font-bold">
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
                        <span className="font-bold text-zinc-800 dark:text-white">
                          {skuComparisonData[selectedSKU]?.you.campaigns} campaigns
                        </span>
                      </div>

                      <div className="space-y-1 border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Discount strategy</span>
                        <div className="bg-blue-100/50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/30 text-[9.5px] p-2 rounded-sm font-bold text-center">
                          {skuComparisonData[selectedSKU]?.you.discountPill}
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Availability</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-900 dark:text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>
                            {skuComparisonData[selectedSKU]?.you.availability} — {skuComparisonData[selectedSKU]?.you.availabilityPct}% of tracked outlets
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-600 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[8.5px] block">Promo frequency trend</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-red-700 dark:text-red-400 font-bold">
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
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                          <span>Price — Last 8 Weeks</span>
                          <span className="text-zinc-800 dark:text-zinc-400 font-bold">
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
                        <span className="font-bold text-zinc-800 dark:text-white">
                          {skuComparisonData[selectedSKU]?.rival1.campaigns} campaigns
                        </span>
                      </div>

                      <div className="space-y-1 border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Discount strategy</span>
                        <div className="bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-[9.5px] p-2 rounded-sm font-bold text-center">
                          {skuComparisonData[selectedSKU]?.rival1.discountPill}
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Availability</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-900 dark:text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>
                            {skuComparisonData[selectedSKU]?.rival1.availability} — {skuComparisonData[selectedSKU]?.rival1.availabilityPct}% of tracked outlets
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-600 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[8.5px] block">Promo frequency trend</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-red-700 dark:text-red-400 font-bold">
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
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                          <span>Price — Last 8 Weeks</span>
                          <span className="text-zinc-800 dark:text-zinc-400 font-bold">
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
                        <span className="text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px]">Promo campaigns this quarter</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {skuComparisonData[selectedSKU]?.rival2.campaigns} campaigns
                        </span>
                      </div>

                      <div className="space-y-1 border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Discount strategy</span>
                        <div className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[9.5px] p-2 rounded-sm font-bold text-center">
                          {skuComparisonData[selectedSKU]?.rival2.discountPill}
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Availability</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-900 dark:text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>
                            {skuComparisonData[selectedSKU]?.rival2.availability} — {skuComparisonData[selectedSKU]?.rival2.availabilityPct}% of tracked outlets
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-2 space-y-1.5">
                        <span className="text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[8.5px] block">Promo frequency trend</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-500 font-bold">
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
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-500">
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
                        <p className="text-zinc-700 dark:text-zinc-400 text-[11px] leading-normal font-semibold">
                          {alertText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="border border-dashed border-black/10 dark:border-white/10 p-8 text-center rounded-sm bg-zinc-50/50 dark:bg-black/10">
                <p className="text-xs text-zinc-400 dark:text-zinc-400 font-semibold">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mt-1">VP Strategic Signals & Executive Analysis Feed</h3>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-1 leading-normal">
              Below are the executive signal feeds, alert maps, AI predictions, and market intelligence channels synced from the VP view.
            </p>
          </div>
          <VPSignalsBoardView isDarkMode={isDarkMode} setActiveTab={setActiveTab} onExploreToggle={onExploreToggle} />
        </div>
      )}

    </div>
  );
};
