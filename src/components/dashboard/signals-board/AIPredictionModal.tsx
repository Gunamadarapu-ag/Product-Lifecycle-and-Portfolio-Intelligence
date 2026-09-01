import React from 'react';
import { X, Zap, Brain, TrendingUp, Sparkles, AlertTriangle, ShieldCheck, Activity, CheckCircle2, User, ArrowLeft, Clock, Info } from 'lucide-react';

interface AIPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  predictionType: 'stockout' | 'elasticity' | 'margin' | 'demand' | 'delay' | null;
}

export const AIPredictionModal: React.FC<AIPredictionModalProps> = ({ isOpen, onClose, predictionType }) => {
  const [selectedRecIdx, setSelectedRecIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    setSelectedRecIdx(null);
  }, [predictionType, isOpen]);

  if (!isOpen || !predictionType) return null;

  // Render properties depending on selected type
  const getModalContent = () => {
    switch (predictionType) {
      case 'delay':
        return {
          title: 'Sourcing Delay Risk Assessment',
          category: 'Launch Sourcing Delay',
          categoryColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          confidenceLabel: 'Delay Probability',
          confidenceValue: '78% Prob.',
          targetName: 'BrandC Products (Snacks)',
          detailText: 'Delayed initial launch batch likely in EMEA due to packaging material sourcing bottleneck.',
          whyDrivers: [
            { label: 'Launch Sourcing Bottleneck', desc: 'Primary packaging supplier in EMEA reports raw paperboard shortage for new layout.' },
            { label: 'Cargo Transit Congestion', desc: 'Average maritime shipping times between plant and launch hub increased by 9 days.' },
            { label: 'Low Material Safety Stock', desc: 'Initial pilot packaging material safety stock at EMEA hub is down to 3 days.' }
          ],
          howMethodology: {
            model: 'Random Forest classifier for supply chain bottleneck analysis combined with an LSTM network for forecasting.',
            inputs: 'Sourcing capacity indexes, transit logs, lead times, and factory runtime records.',
            key: 'EMEA-DELAY-V2.4'
          },
          recommendations: [
            {
              urgency: 'Immediate',
              bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              title: 'Domestic Sourcing',
              desc: 'Qualify and onboard local packaging vendors to recover 12 days and save $2.1M launch revenue risk.',
              detailed: {
                owner: 'Sourcing & Procurement Director',
                timeline: '15 Days',
                impact: 'Recovers 12 days of lead time; mitigates $2.1M revenue risk.',
                checklist: [
                  'Request sample runs from qualified local suppliers in India and APAC.',
                  'Perform fast-track quality and compliance validation of alternative material.',
                  'Draft short-term purchasing order to cover active Q2 packaging gaps.'
                ]
              }
            },
            {
              urgency: 'Medium-Term',
              bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
              title: 'Air Freight Backup',
              desc: 'Expedite a critical batch of packaging materials via air freight to bridge the launch transition gap.',
              detailed: {
                owner: 'Logistics Operations Lead',
                timeline: '3 Days',
                impact: 'Reduces transit time by 18 days, securing immediate production line schedule.',
                checklist: [
                  'Obtain budget clearance for emergency air freight transit.',
                  'Coordinate pick-up and customs priority clearing at hubs.',
                  'Schedule factory production shift to receive and process incoming cargo.'
                ]
              }
            },
            {
              urgency: 'Strategic',
              bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
              title: 'Multi-vendor Contracts',
              desc: 'Transition to a multi-source supplier agreement for future launch packaging materials.',
              detailed: {
                owner: 'VP Global Procurement',
                timeline: '30 Days',
                impact: 'Reduces future sourcing bottleneck risks by 75%.',
                checklist: [
                  'Identify and shortlist two secondary verified global vendors.',
                  'Negotiate parallel SLA agreements with active volume-shifting clauses.',
                  'Conduct quarterly reviews of vendor capacities and buffer stocks.'
                ]
              }
            }
          ]
        };
      case 'stockout':
        return {
          title: 'Launch Supply Shortage Assessment',
          category: 'Launch Inventory Deficit',
          categoryColor: 'text-red-500 bg-red-500/10 border-red-500/20',
          confidenceLabel: 'Shortage Probability',
          confidenceValue: '92% Prob.',
          targetName: 'BrandA Premium Energy (Drink)',
          detailText: 'Pre-launch inventory safety buffer is below threshold for APAC regional launch.',
          whyDrivers: [
            { label: 'Launch Buffer Deficit', desc: 'Initial pre-launch batch allocation at Vapi Hub is 25% below the safe launch threshold.' },
            { label: 'Expedited Lead Time Lag', desc: 'Supplier turnaround for emergency replenishment lead time is 35 days.' },
            { label: 'Distributor Placement Load', desc: 'Pre-orders from key retail partners exceed initial production run by 18%.' }
          ],
          howMethodology: {
            model: 'Hybrid LSTM (Long Short-Term Memory) Neural Network paired with an XGBoost regressor model.',
            inputs: 'Daily orders, cargo transit logs, supplier production sheets, and seasonal growth coefficients.',
            key: 'LSTM-XGB-V3.4'
          },
          recommendations: [
            {
              urgency: 'Immediate',
              bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              title: 'Route Launch Reserve',
              desc: 'Divert 15,000 units of domestic Western safety reserves to the APAC hub to immediately cover the launch stock deficit.',
              detailed: {
                owner: 'Regional Logistics Manager',
                timeline: '48 Hours',
                impact: 'Covers the launch inventory gap; recovers $420k potential revenue loss.',
                checklist: [
                  'Verify Western region inventory levels and confirm safety stock buffers.',
                  'Initiate emergency freight transfer authorization from domestic warehouses.',
                  'Update Vapi Hub warehouse management system for incoming expedited transit.'
                ]
              }
            },
            {
              urgency: 'Medium-Term',
              bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
              title: 'Onboard Local Vendor',
              desc: 'Activate backup domestic suppliers with a shorter 10-day lead time to secure supply during launch.',
              detailed: {
                owner: 'Head of Procurement',
                timeline: '10 Days',
                impact: 'Reduces dependency on EU ports by 40%.',
                checklist: [
                  'Execute fast-track quality audits and check regulatory compliance for local vendors.',
                  'Establish contract pricing matching regional procurement bounds.',
                  'Issue test purchase order of 5,005 units to verify lead time of 10 days.'
                ]
              }
            },
            {
              urgency: 'Strategic',
              bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
              title: 'Launch Promo Moderation',
              desc: 'Temporarily scale down regional pre-launch marketing campaigns to slow run-rate consumption.',
              detailed: {
                owner: 'APAC Marketing Coordinator',
                timeline: '24 Hours',
                impact: 'Lowers demand by 15% (extends stockout buffer by 18 days).',
                checklist: [
                  'Coordinate with marketing team to pause Q2 APAC digital campaigns.',
                  'Adjust wholesale pricing triggers to suppress promotional pricing at key retailers.',
                  'Monitor inventory burn rate daily against modified sales velocities.'
                ]
              }
            }
          ]
        };
      case 'elasticity':
        return {
          title: 'Counter-Launch Price War Assessment',
          category: 'Launch Market Share Risk',
          categoryColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          confidenceLabel: 'Market Share Impact',
          confidenceValue: '74% Impact',
          targetName: 'BrandD Yogurt Drink (Dairy)',
          detailText: 'Competitor pricing cuts on substitute lines threatening initial launch market share in EU.',
          whyDrivers: [
            { label: 'Competitor Launch Block', desc: 'Competitor B dropped adjacent wafer prices by 10% specifically to block our new launch shelf space.' },
            { label: 'High Substitution Elasticity', desc: 'Historical scan data shows a high cross-promotion correlation of -0.62 for launch brands.' },
            { label: 'Retail Shelf Placement Overlap', desc: 'High substitution propensity observed due to shared supermarket launch display planograms.' }
          ],
          howMethodology: {
            model: 'Mixed-Effects Linear Regression pricing model coupled with a Random Forest categorization engine.',
            inputs: 'Supermarket daily scanner datasets, competitor catalog pricing indices, and regional discount calendars.',
            key: 'PRICE-ELAST-V1.8'
          },
          recommendations: [
            {
              urgency: 'Immediate',
              bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              title: 'Trigger Bundle Promo',
              desc: 'Launch a pre-approved cross-category coupon bundling new Yogurt with BrandC cookies to maintain launch targets.',
              detailed: {
                owner: 'Trade Marketing Lead',
                timeline: '3 Days',
                impact: 'Protects EU sales volumes, expected target preservation of 94%.',
                checklist: [
                  'Configure SKU bundling rules in central pricing database (Yogurt + Cookies).',
                  'Send digital discount coupon to customer loyalty app accounts.',
                  'Deploy promotional point-of-sale displays at partner supermarkets.'
                ]
              }
            },
            {
              urgency: 'Medium-Term',
              bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
              title: 'Display Re-routing',
              desc: 'Relocate display units away from the snacks section and place them in organic breakfast aisle to secure launch visibility.',
              detailed: {
                owner: 'Category Manager (EU)',
                timeline: '5 Days',
                impact: '+$120K gross margin improvement due to high-margin breakfast traffic.',
                checklist: [
                  'Submit planogram update requests to major EU grocery chains.',
                  'Redirect end-cap displays from cookies to the organic breakfast aisle.',
                  'Track conversion rates for breakfast aisle placements vs baseline snacks aisle.'
                ]
              }
            },
            {
              urgency: 'Strategic',
              bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
              title: 'Retail Co-investment',
              desc: 'Partner with key grocery chains to launch a buy-one-get-one-half-off campaign funded by co-marketing budgets.',
              detailed: {
                owner: 'Director of Key Accounts',
                timeline: '14 Days',
                impact: 'Maintains category shelf share, recovers 11% volume drop risk.',
                checklist: [
                  'Initiate review of annual trade spend budget allocations with retail account managers.',
                  'Draft co-marketing agreement defining BOGO funding proportions.',
                  'Set up KPI tracking for wholesale volume metrics over the co-investment cycle.'
                ]
              }
            }
          ]
        };
      case 'margin':
        return {
          title: 'Launch Cost Overrun Assessment',
          category: 'Launch Budget Deficit',
          categoryColor: 'text-red-500 bg-red-500/10 border-red-500/20',
          confidenceLabel: 'Overrun Probability',
          confidenceValue: '81% Prob.',
          targetName: 'BrandC Biscuits (Snacks)',
          detailText: 'Initial packaging setup, tooling, and launch marketing costs projected to exceed budget by 24%.',
          whyDrivers: [
            { label: 'Tooling & Mold Setup Costs', desc: 'Initial production mold tooling setup at EMEA contract packager ran 35% over estimates.' },
            { label: 'Launch Marketing Spend', desc: 'Expedited retail slotting fees and slot placement spending exceeded budget by 12%.' },
            { label: 'Raw Material Surcharge', desc: 'Spot-buy price surcharges on short-notice organic ingredients added 22% to launch COGS.' }
          ],
          howMethodology: {
            model: 'Linear regression pricing elasticity model combined with a gradient boosting classifier for discount margin degradation.',
            inputs: 'Supermarket checkout logs, promotional calendars, historical margin levels, and wholesale cost sheets.',
            key: 'MARGIN-LEAK-V2.1'
          },
          recommendations: [
            {
              urgency: 'Immediate',
              bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              title: 'Cap Launch Expenses',
              desc: 'Restructure active service contracts with local design and packing vendors to cap launch setup fees.',
              detailed: {
                owner: 'Finance Controller',
                timeline: '5 Days',
                impact: 'Saves +2.8% on gross margin; halts immediate leakage.',
                checklist: [
                  'Send formal notice of co-investment budget re-allocations to distributors.',
                  'Lock distributor co-investment limits to 15% in CRM system.',
                  'Schedule contract review meetings with top three distributor key contacts.'
                ]
              }
            },
            {
              urgency: 'Medium-Term',
              bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
              title: 'Optimize Pack Layout',
              desc: 'Change outer box graphics and dimensions to reduce print plate tooling setup costs.',
              detailed: {
                owner: 'Portfolio Strategist',
                timeline: '7 Days',
                impact: '+$340k margin preservation via portfolio mix optimization.',
                checklist: [
                  'Generate co-merchandising plan for Biscuits & Organic Cheese bundle.',
                  'Implement basket discount pricing rules in POS vendor portals.',
                  'Evaluate average basket gross margin weekly during pilot phase.'
                ]
              }
            },
            {
              urgency: 'Strategic',
              bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
              title: 'Domestic Sourcing',
              desc: 'Transition ingredient sourcing to domestic organic growers to lower cost of goods sold (COGS) by 8%.',
              detailed: {
                owner: 'Procurement Sourcing Lead',
                timeline: '30 Days',
                impact: 'Lowers COGS by 8%, boosting overall category margins to 34%.',
                checklist: [
                  'Identify local certified organic wheat and cocoa suppliers.',
                  'Request sample batches to verify sensory properties and ingredient standards.',
                  'Draft multi-year supply agreement to lock in volume discounts.'
                ]
              }
            }
          ]
        };
      case 'demand':
      default:
        return {
          title: 'Pilot Production Bottleneck Analysis',
          category: 'Launch Production Risk',
          categoryColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
          confidenceLabel: 'Bottleneck Probability',
          confidenceValue: '88% Prob.',
          targetName: 'BrandF Eco-Pack Water (Beverages)',
          detailText: 'Manufacturing line qualification and regulatory certification delays at the APAC production plant.',
          whyDrivers: [
            { label: 'Line Qualification Delay', desc: 'Eco-pack bottling line calibration running 14 days behind schedule.' },
            { label: 'Regulatory Permit Backlog', desc: 'Local state environmental certification processing delayed by 2 weeks.' },
            { label: 'Pilot Run Waste Rate', desc: 'Initial pilot batch trial runs report an elevated 12% scrap/waste rate.' }
          ],
          howMethodology: {
            model: 'Random Forest classifier for supply chain bottleneck analysis combined with an LSTM network for forecasting.',
            inputs: 'Supply chain capacity indexes, factory runtime records, lead times, and web search trend indicators.',
            key: 'APAC-ECO-V1.2'
          },
          recommendations: [
            {
              urgency: 'Immediate',
              bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              title: 'Accelerate Line Setup',
              desc: 'Contract emergency line engineers from India to finish qualification within 15 days.',
              detailed: {
                owner: 'VP of Supply Chain',
                timeline: '15 Days',
                impact: 'Ensures Q3 stock availability, reducing shipping costs by $45k.',
                checklist: [
                  'Review pre-qualification audits for target packaging suppliers in India.',
                  'Draft fast-track quality verification protocol for local eco-materials.',
                  'Confirm transport capacity for regional container routing.'
                ]
              }
            },
            {
              urgency: 'Medium-Term',
              bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
              title: 'Expand Line Capacity',
              desc: 'Install a secondary semi-automated packaging line at the Vapi Hub to raise peak throughput capacity.',
              detailed: {
                owner: 'Engineering Lead',
                timeline: '60 Days',
                impact: 'Increases packaging capacity by 50% for eco-pack variations.',
                checklist: [
                  'Request capital expenditure authorization for semi-automated packaging line.',
                  'Finalize floor space layout and power hookups at the Vapi Hub facility.',
                  'Coordinate line assembly and technician training schedule.'
                ]
              }
            },
            {
              urgency: 'Strategic',
              bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
              title: 'Raw Material Routing',
              desc: 'Re-route standard raw paper stock to the eco-pack lines to maintain manufacturing volumes.',
              detailed: {
                owner: 'Production Manager',
                timeline: '45 Days',
                impact: 'Avoids immediate capacity gap, stabilizes production levels.',
                checklist: [
                  'Update production scheduler to redirect paper stock to eco-pack lines.',
                  'Adjust warehouse delivery routing templates for raw paper stock.',
                  'Conduct safety review for modified materials handling configurations.'
                ]
              }
            }
          ]
        };
    }
  };

  const content = getModalContent();

  // Show detailed summary on another page/view if a recommendation is clicked
  if (selectedRecIdx !== null && content.recommendations[selectedRecIdx]) {
    const rec = content.recommendations[selectedRecIdx];
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-5 text-xs max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedRecIdx(null)}
                className="flex items-center gap-1 text-zinc-500 hover:text-[#5850ec] dark:hover:text-indigo-400 font-bold cursor-pointer border-none bg-transparent outline-none transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <div className="flex items-center gap-1.5 text-[#6d28d9] dark:text-[#a78bfa]">
                <Brain size={18} className="fill-[#6d28d9]/10" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">Detailed Solution Summary</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
            >
              <X size={16} />
            </button>
          </div>

          {/* Hero Title & Description */}
          <div className="space-y-2.5 p-4 rounded bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${rec.bg}`}>
                {rec.urgency}
              </span>
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {rec.title}
              </h4>
            </div>
            <div className="space-y-1.5 text-zinc-700 dark:text-zinc-400">
              <p className="text-[11px] leading-snug">
                <strong>Objective:</strong> {rec.desc}
              </p>
              <p className="text-[9.5px] opacity-75">
                <strong>Target Product:</strong> {content.targetName} ({content.category})
              </p>
            </div>
          </div>

          {/* Action Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {/* Checklist */}
            <div className="md:col-span-3 space-y-3">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Execution Action Steps
              </span>
              <ul className="space-y-2 list-none pl-0">
                {rec.detailed.checklist.map((step, sIdx) => (
                  <li key={sIdx} className="flex gap-2.5 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50/40 dark:bg-white/2 p-2.5 rounded border border-black/2 dark:border-white/2 hover:border-black/5 dark:hover:border-white/5 transition-all">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Details Sidebar Column */}
            <div className="md:col-span-2 space-y-4">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Mitigation Parameters
              </span>
              <div className="space-y-3.5 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded border border-black/5 dark:border-white/5">
                <div className="space-y-1">
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                    <User size={12} className="text-zinc-400" /> Assigned Owner
                  </span>
                  <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">
                    {rec.detailed.owner}
                  </p>
                </div>
                
                <div className="space-y-1 border-t border-black/5 dark:border-white/5 pt-2.5">
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                    <Clock size={12} className="text-zinc-400" /> Lead Time / Timeline
                  </span>
                  <p className="text-[11px] font-bold text-[#6d28d9] dark:text-[#a78bfa] font-mono">
                    {rec.detailed.timeline}
                  </p>
                </div>

                <div className="space-y-1 border-t border-black/5 dark:border-white/5 pt-2.5">
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                    <TrendingUp size={12} className="text-zinc-400" /> Expected Outcome
                  </span>
                  <p className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-500 leading-normal font-mono">
                    {rec.detailed.impact}
                  </p>
                </div>
              </div>

              {/* AI Engine Status */}
              <div className="p-2.5 bg-indigo-50/30 dark:bg-indigo-950/10 rounded border border-[#5850ec]/10 flex items-center gap-2">
                <Zap size={12} className="text-[#5850ec] dark:text-indigo-400 animate-pulse" />
                <span className="text-[8.5px] font-mono text-indigo-700 dark:text-indigo-400">
                  AI Sourcing Engine Qualified
                </span>
              </div>
            </div>
          </div>

          {/* Operational Warning Note */}
          <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 rounded text-[10px] text-amber-700 dark:text-amber-400 flex gap-2">
            <Info size={14} className="shrink-0 mt-0.5 animate-bounce" />
            <p className="leading-normal">
              <strong>Advisory:</strong> Triggering these steps logs a portfolio variance record. Owners will receive automated Slack & email notifications. Coordinate with regional leads prior to dispatching.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center border-t border-black/15 dark:border-white/15 pt-3.5">
            <button 
              onClick={() => setSelectedRecIdx(null)}
              className="px-3.5 py-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 text-[9px] font-extrabold uppercase tracking-widest rounded-sm border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer"
            >
              ← Back to Explainer
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

  // Page 1: Main Explainer View (Why, How, and Recommendations 3 blocks with no bottom details box)
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-5 text-xs max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-3">
          <div className="flex items-center gap-2 text-[#6d28d9] dark:text-[#a78bfa]">
            <Brain size={18} className="fill-[#6d28d9]/10" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">AI Intelligence Explainer</span>
              <h3 className="text-[15px] font-display font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                {content.title}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Hero Alert Details */}
        <div className={`p-4 rounded border flex justify-between items-center ${content.categoryColor}`}>
          <div>
            <span className="text-[8px] font-bold uppercase tracking-widest opacity-75">Target Object</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              {content.targetName}
            </h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
              {content.detailText}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[8px] font-bold uppercase tracking-widest block opacity-75">{content.confidenceLabel}</span>
            <span className="text-sm font-mono font-extrabold block">
              {content.confidenceValue}
            </span>
          </div>
        </div>

        {/* Explanation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Why (Underlying Drivers) */}
          <div className="space-y-2.5 p-3.5 rounded bg-zinc-50/50 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200">
              <AlertTriangle size={14} className="text-orange-500" />
              <h5 className="font-bold uppercase tracking-wider text-[10px]">Why was this predicted?</h5>
            </div>
            <ul className="space-y-2 text-zinc-700 dark:text-zinc-300 list-none pl-0">
              {content.whyDrivers.map((driver, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-[#6d28d9] dark:text-[#a78bfa] font-bold">•</span>
                  <span><strong>{driver.label}:</strong> {driver.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How (Methodology) */}
          <div className="space-y-2.5 p-3.5 rounded bg-zinc-50/50 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200">
              <Activity size={14} className="text-[#6d28d9] dark:text-[#a78bfa]" />
              <h5 className="font-bold uppercase tracking-wider text-[10px]">How was it calculated?</h5>
            </div>
            <div className="space-y-2 text-zinc-700 dark:text-zinc-400">
              <p>
                <strong>Algorithm Model:</strong> {content.howMethodology.model}
              </p>
              <p>
                <strong>Input Parameters:</strong> {content.howMethodology.inputs}
              </p>
              <div className="flex justify-between items-center text-[9px] font-mono border-t border-black/5 dark:border-white/10 pt-2 mt-2">
                <span className="opacity-60">MODEL KEY</span>
                <span className="font-bold text-[#6d28d9] dark:text-[#a78bfa]">{content.howMethodology.key}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Recommendations block */}
        <div className="space-y-3 p-4 rounded bg-[#5850ec]/5 border border-[#5850ec]/15">
          <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
            <Sparkles size={14} className="text-[#5850ec] dark:text-indigo-400 animate-pulse" />
            <h5 className="font-bold uppercase tracking-wider text-[10.5px]">Recommendations: How to make it better?</h5>
            <span className="text-[9px] text-[#5850ec]/65 dark:text-indigo-400/60 font-mono ml-auto">Click a solution to view steps</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-zinc-700 dark:text-zinc-300">
            {content.recommendations.map((rec, idx) => {
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedRecIdx(idx)}
                  className="p-3 bg-white dark:bg-zinc-900 rounded border cursor-pointer select-none transition-all duration-200 hover:scale-[1.01] border-black/5 dark:border-white/5 hover:border-[#5850ec]/30 dark:hover:border-indigo-400/30 hover:shadow-md space-y-1"
                >
                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${rec.bg}`}>
                    {rec.urgency}
                  </span>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-1">{rec.title}</p>
                  <p className="text-[10.5px] opacity-75 leading-relaxed">{rec.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-black/15 dark:border-white/15 pt-3.5">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono font-bold">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>AI EXPLAINABILITY ONLINE</span>
          </div>
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
};
