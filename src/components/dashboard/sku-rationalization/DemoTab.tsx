import React, { useState, useMemo } from 'react';
import { Search, Download, Eye, X, AlertTriangle, TrendingDown, HelpCircle, Activity, ArrowRight, CheckCircle2, Users, Building, TrendingUp, Mail, Truck, Store, Globe } from 'lucide-react';
import { Task } from './TrackerTab';
import { ModalShell } from '../../common/Modal';

const EXPLORER_ROWS = (() => {
  const getProductCategory = (pName: string): string => {
    const name = pName.toLowerCase();
    if (
      name.includes('cola') || name.includes('soda') || name.includes('orange') || 
      name.includes('lemonade') || name.includes('water') || name.includes('energy') || 
      name.includes('protein') || name.includes('coffee') || name.includes('milk')
    ) {
      return 'Beverages';
    }
    if (
      name.includes('yogurt') || name.includes('cheese') || name.includes('butter') || 
      name.includes('cream') || name.includes('ice') || name.includes('chips') || 
      name.includes('pretzels') || name.includes('popcorn') || name.includes('chocolate')
    ) {
      return 'Snacks';
    }
    if (
      name.includes('soap') || name.includes('wash') || name.includes('shampoo') || 
      name.includes('conditioner') || name.includes('toothpaste')
    ) {
      return 'Personal Care';
    }
    if (
      name.includes('detergent') || name.includes('softener') || name.includes('dishwashing') || 
      name.includes('spray') || name.includes('bleach')
    ) {
      return 'Household';
    }
    return 'Beverages';
  };

  const categories = [
    { factor: 'Low Profitability', cat: 'Financial Reasons', desc: 'Consistency low margins below target threshold', impact: 'High', action: 'Discontinue / Consolidate', priority: 'Critical' },
    { factor: 'Declining Sales', cat: 'Financial Reasons', desc: 'Sales declining for 3+ consecutive quarters', impact: 'High', action: 'Reposition', priority: 'High' },
    { factor: 'SKU Proliferation', cat: 'Portfolio Reasons', desc: 'Too many similar SKUs causing complexity', impact: 'Medium', action: 'Consolidate', priority: 'High' },
    { factor: 'Cannibalization', cat: 'Portfolio Reasons', desc: 'SKUs cannibalizing each other\'s sales', impact: 'High', action: 'Consolidate', priority: 'High' },
    { factor: 'Inventory Inefficiency', cat: 'Supply Chain Reasons', desc: 'High inventory holding costs, low turns', impact: 'Low impact', action: 'Reformulate / Redesign', priority: 'Medium' },
    { factor: 'Customer Complaints', cat: 'Customer & Market', desc: 'High customer complaint rate', impact: 'Medium', action: 'Reformulate / Redesign', priority: 'Medium' },
    { factor: 'Competitive Disadvantage', cat: 'Customer & Market', desc: 'Falling behind competitors on key factors', impact: 'High', action: 'Reformulate / Redesign', priority: 'High' },
    { factor: 'Regulatory Changes', cat: 'Regulatory & Risk', desc: 'New regulations affecting product viability', impact: 'High', action: 'Discontinue', priority: 'Critical' },
    { factor: 'Strong Brand Growth', cat: 'Portfolio Reasons', desc: 'High potential for growth and expansion', impact: 'High', action: 'Invest / Expand', priority: 'High' }
  ];

  const brands = ['BrandA', 'BrandB', 'BrandC', 'BrandD', 'BrandE', 'BrandF'];
  const products = [
    'Cola 500ml', 'Cola 1.5L', 'Diet Soda 500ml', 'Orange Drink', 'Lemonade 1L',
    'Water 500ml', 'Water 1.5L', 'Energy Drink', 'Protein Shake', 'Cold Brew Coffee',
    'Yogurt Strawberry', 'Yogurt Blueberry', 'Greek Yogurt 500g', 'Cheddar Cheese 200g', 'Butter 250g',
    'Chips Salted', 'Chips Barbecue', 'Pretzels 150g', 'Popcorn Butter', 'Chocolate Bar 100g',
    'Milk 1L', 'Milk 2L', 'Sour Cream 250ml', 'Cream Cheese 200g', 'Ice Cream Vanilla',
    'Soap Soap', 'Body Wash 250ml', 'Shampoo 400ml', 'Conditioner 400ml', 'Toothpaste 100ml',
    'Detergent Liquid 1L', 'Fabric Softener 1L', 'Dishwashing Liquid 500ml', 'Multi-Purpose Spray', 'Bleach 1L'
  ];

  const regions = ['LATAM', 'North America', 'Europe', 'APAC'];
  const list = [];
  let count = 0;
  for (let b = 0; b < brands.length; b++) {
    for (let p = 0; p < products.length; p++) {
      if (count >= 200) break;
      const skuName = `${brands[b]} ${products[p]}`;
      const factorObj = categories[count % categories.length];
      list.push({
        sku: skuName,
        productCat: getProductCategory(products[p]),
        factor: factorObj.factor,
        cat: factorObj.cat,
        desc: factorObj.desc,
        impact: factorObj.impact,
        action: factorObj.action,
        priority: factorObj.priority,
        region: regions[count % regions.length]
      });
      count++;
    }
    if (count >= 200) break;
  }
  return list;
})();

const getRcaDetails = (sku: string, factor: string) => {
  switch(factor) {
    case 'Low Profitability':
      return {
        summary: 'Unit margins have dropped below the 20% strategic target due to rising commodity costs and high promotional support.',
        rootCauses: [
          { title: 'Material Cost Inflation', desc: 'Raw material procurement costs for this product category have risen by 14.5% YoY.' },
          { title: 'Promotional Dilution', desc: 'Average promotional discount depth of 38% with a low volume lift ratio (1.12x).' },
          { title: 'Manufacturing Overhead', desc: 'Short production runs result in high changeover times, increasing manufacturing overhead by 8.2% per unit.' }
        ],
        metrics: [
          { label: 'Gross Margin', value: '11.4%', target: '25.0%', status: 'Critical' },
          { label: 'Promo Spend', value: '$84K', target: '< $50K', status: 'Warning' },
          { label: 'COGS % of Rev', value: '72.3%', target: '< 60.0%', status: 'Critical' }
        ],
        recommendations: 'Shift SKU to Consolidated regional manufacturing; reduce promotional frequency by 50% and implement a price correction.'
      };
    case 'Declining Sales':
      return {
        summary: 'Volume sales have consistently declined for three consecutive quarters, indicating market saturation or shifting consumer preferences.',
        rootCauses: [
          { title: 'Consumer Trend Shift', desc: 'Market-wide migration towards healthier, sugar-free, or eco-friendly alternatives in this segment.' },
          { title: 'Shelf Space Reduction', desc: 'Lost primary eye-level shelf space at major retail partners in favor of competitor store brands.' },
          { title: 'Price Elasticity Pressure', desc: 'Competitor price cuts have made this SKU 15% more expensive than direct substitutes without clear differentiation.' }
        ],
        metrics: [
          { label: 'Sales Growth (QoQ)', value: '-18.5%', target: '> +2.0%', status: 'Critical' },
          { label: 'Retailer Penetration', value: '42.0%', target: '> 60.0%', status: 'Warning' },
          { label: 'Brand Health Score', value: '64 / 100', target: '80 / 100', status: 'Warning' }
        ],
        recommendations: 'Reposition the brand with natural ingredients or repackage into multi-packs to improve volume sales and reclaim retail shelf-space.'
      };
    case 'SKU Proliferation':
      return {
        summary: 'High portfolio overlap and similarity with core items, leading to operational complexity and warehouse footprint wastage.',
        rootCauses: [
          { title: 'Flavor/Size Redundancy', desc: 'This SKU sits between two high-volume variants, adding minimal incremental category volume.' },
          { title: 'Distribution Inefficiency', desc: 'Low velocity leads to slow warehouse turnover, occupying high-cost picking slots.' },
          { title: 'Retailer Confusion', desc: 'Retailers are refusing to list the entire range, causing fragmented distribution patterns.' }
        ],
        metrics: [
          { label: 'Incremental Volume', value: '2.4%', target: '> 10.0%', status: 'Critical' },
          { label: 'Stock Turns / Year', value: '4.2x', target: '> 12.0x', status: 'Critical' },
          { label: 'Distribution SKU Count', value: '248', target: '200 Max', status: 'Warning' }
        ],
        recommendations: 'Consolidate the SKU into the core brand variant. Delist this specific pack size and transition existing retail contracts to the main product line.'
      };
    case 'Cannibalization':
      return {
        summary: 'Highly overlapping target demographic and price point, leading to revenue transfer from higher-margin core SKUs.',
        rootCauses: [
          { title: 'Audience Overlap', desc: 'Over 82% of buyers also purchase the primary brand line, indicating no new buyer acquisition.' },
          { title: 'Margin Dilution', desc: 'Customers are trading down from a 42% margin product to this 34% margin product.' },
          { title: 'Inconsistent Marketing', desc: 'Overlapping digital ad campaigns are bidding against each other for the same customer search terms.' }
        ],
        metrics: [
          { label: 'Cannibalization Rate', value: '78.5%', target: '< 15.0%', status: 'Critical' },
          { label: 'Margin Gap vs Core', value: '-8.0%', target: '>= 0.0%', status: 'Critical' },
          { label: 'Net Category Incremental Rev', value: '$12K', target: '> $100K', status: 'Critical' }
        ],
        recommendations: 'Consolidate this SKU into the core line or adjust pricing to create a clear tier premium and minimize buyer overlap.'
      };
    case 'Inventory Inefficiency':
      return {
        summary: 'Excessive working capital tied up in slow-moving inventory, combined with high minimum order quantities (MOQ).',
        rootCauses: [
          { title: 'High Supplier MOQ', desc: 'Raw packaging material supplier requires a minimum order quantity equivalent to 9 months of demand.' },
          { title: 'Low Inventory Turns', desc: 'Days Inventory Outstanding (DIO) stands at 145 days versus the target of 45 days.' },
          { title: 'Warehouse Space Premium', desc: 'Temperature-controlled storage slots occupied by slow-moving items are driving up storage costs.' }
        ],
        metrics: [
          { label: 'Days Inv Outstanding', value: '145 Days', target: '< 45 Days', status: 'Critical' },
          { label: 'Working Capital Tied', value: '$120K', target: '< $30K', status: 'Critical' },
          { label: 'Write-off Risk (Spoilage)', value: 'Medium', target: 'Low', status: 'Warning' }
        ],
        recommendations: 'Reformulate to share components with core products, re-negotiate MOQ with suppliers, or transition to a make-to-order fulfillment model.'
      };
    case 'Customer Complaints':
      return {
        summary: 'Elevated rate of customer returns and complaints concerning packaging durability and consistency.',
        rootCauses: [
          { title: 'Packaging Seal Defect', desc: 'The cap seal is prone to micro-fractures during transit, causing minor leakage in 1.4% of shipments.' },
          { title: 'Taste Profile Variation', desc: 'Ingredient sourcing changes have caused minor taste variations, noticed by long-term buyers.' },
          { title: 'Labeling Inaccuracies', desc: 'Minor printing issues on nutritional facts panels have led to customer returns.' }
        ],
        metrics: [
          { label: 'Complaint Rate', value: '2.1%', target: '< 0.2%', status: 'Critical' },
          { label: 'Return Rate', value: '1.8%', target: '< 0.5%', status: 'Critical' },
          { label: 'NPS Score', value: '-12', target: '> +30', status: 'Critical' }
        ],
        recommendations: 'Reformulate ingredients or redesign the packaging seal mechanism; halt production at the current co-packer pending audit.'
      };
    case 'Competitive Disadvantage':
      return {
        summary: 'Losing market share rapidly as competitors launch superior formulations and cheaper price points.',
        rootCauses: [
          { title: 'Lacking Modern Features', desc: 'Competitors have introduced eco-friendly packaging and vitamin-fortified formulas.' },
          { title: 'Retail Margin Gap', desc: 'Competitors offer retail chains 4% higher margins, incentivizing them to prioritize competitor placement.' },
          { title: 'Weak Digital Presence', desc: 'Competitor share-of-voice in digital channels is 3x higher in key target metropolitan areas.' }
        ],
        metrics: [
          { label: 'Market Share Change', value: '-4.8%', target: '>= 0.0%', status: 'Critical' },
          { label: 'Retailer Margin Offer', value: '28%', target: '32%', status: 'Warning' },
          { label: 'Share of Voice', value: '12%', target: '> 30%', status: 'Critical' }
        ],
        recommendations: 'Redesign formula to include organic ingredients, adjust pricing structures for retailers, and boost marketing spend.'
      };
    case 'Regulatory Changes':
      return {
        summary: 'New environmental and health regulations impacting the use of specific plastic packaging types or chemical formulations.',
        rootCauses: [
          { title: 'Single-Use Plastic Ban', desc: 'New local laws banning the primary container material starting next quarter.' },
          { title: 'Ingredient Restrictions', desc: 'Updated regional food safety guidelines restricting the shelf-life extending additives used.' },
          { title: 'Ecodesign Requirements', desc: 'Mandatory recycled content rules that the current supplier cannot fulfill.' }
        ],
        metrics: [
          { label: 'Compliance Index', value: 'Non-Compliant', target: 'Compliant', status: 'Critical' },
          { label: 'Transition Cost Est.', value: '$180K', target: '< $50K', status: 'Critical' },
          { label: 'Time to Ban Deadline', value: '85 Days', target: '> 180 Days', status: 'Warning' }
        ],
        recommendations: 'Discontinue the current packaging model immediately and transition to the compostable eco-friendly design to ensure compliance.'
      };
    default:
      return {
        summary: 'Operational and financial performance metrics indicate underlying issues requiring strategic intervention.',
        rootCauses: [
          { title: 'Cost Pressures', desc: 'Increasing manufacturing complexity and raw material pricing constraints.' },
          { title: 'Market Pressure', desc: 'Shifting consumer demands and strong competitor discount initiatives.' },
          { title: 'Supply Chain Friction', desc: 'Long lead times and high inventory carrying costs.' }
        ],
        metrics: [
          { label: 'Operational Health', value: 'Critical', target: 'Healthy', status: 'Critical' }
        ],
        recommendations: 'Initiate a complete product audit and review formulation design.'
      };
  }
};

const MarginWaterfallChart: React.FC = () => {
  return (
    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm">
      <h5 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-4">Margin Bridge (% of Revenue)</h5>
      <div className="relative w-full h-[180px] font-semibold text-[8px] sm:text-[9px] text-zinc-400">
        {/* Draw a grid of horizontal helper lines: 0%, 5%, 10%, 15%, 20%, 22% */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-zinc-500">
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
          <div className="w-full border-t border-zinc-500" />
        </div>
        
        {/* Draw the columns */}
        <div className="absolute inset-0 flex justify-between px-2 pt-2">
          {/* Column 1: Target margin (0% to 20%) */}
          <div className="flex flex-col items-center justify-end h-full w-[15%]">
            <div className="w-full bg-zinc-500 dark:bg-zinc-600 rounded-t-xs h-[90%] flex items-center justify-center text-white font-bold text-[9px]">20.0%</div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-500">Target Margin</span>
          </div>

          {/* Column 2: Material cost inflation (-2.0%, from 20% down to 18%) */}
          <div className="flex flex-col items-center justify-end h-full w-[18%]">
            <div className="w-full h-full relative">
              {/* Floating bar: 18% to 20% (height is 9% of total, offset from top is 10%) */}
              <div className="absolute w-full bg-red-500 rounded-xs flex items-center justify-center text-white font-bold text-[8.5px]" style={{ bottom: '81%', height: '9%' }}>
                -2.0%
              </div>
            </div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-500">Material Cost</span>
          </div>

          {/* Column 3: Promotional dilution (-2.4%, from 18% down to 15.6%) */}
          <div className="flex flex-col items-center justify-end h-full w-[18%]">
            <div className="w-full h-full relative">
              {/* Floating bar: 15.6% to 18% (height is 10.8% of total, offset from top is 19%) */}
              <div className="absolute w-full bg-red-500 rounded-xs flex items-center justify-center text-white font-bold text-[8.5px]" style={{ bottom: '70.2%', height: '10.8%' }}>
                -2.4%
              </div>
            </div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-500">Promo Dilution</span>
          </div>

          {/* Column 4: Manufacturing overhead (-1.0%, from 15.6% down to 14.6%) */}
          <div className="flex flex-col items-center justify-end h-full w-[18%]">
            <div className="w-full h-full relative">
              {/* Floating bar: 14.6% to 15.6% (height is 4.5% of total, offset from top is 29.8%) */}
              <div className="absolute w-full bg-red-500 rounded-xs flex items-center justify-center text-white font-bold text-[8.5px]" style={{ bottom: '65.7%', height: '4.5%' }}>
                -1.0%
              </div>
            </div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-500">Mfg Overhead</span>
          </div>

          {/* Column 5: Actual margin (0% to 14.6%) */}
          <div className="flex flex-col items-center justify-end h-full w-[15%]">
            <div className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-xs h-[65.7%] flex items-center justify-center text-white font-bold text-[9px]">14.6%</div>
            <span className="mt-2 text-[7.5px] text-center uppercase tracking-wider font-extrabold truncate w-full text-zinc-500">Actual Margin</span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 border-t border-black/5 dark:border-white/5 pt-2 text-[8px] font-black uppercase tracking-wider text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-zinc-500 dark:bg-zinc-600 rounded-xs" />
          <span>Baseline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-xs" />
          <span>Margin Loss</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs" />
          <span>Result</span>
        </div>
      </div>
    </div>
  );
};

const SkuCategoryBenchmarks: React.FC<{ skuName: string, category: string }> = ({ skuName, category }) => {
  return (
    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm space-y-4 text-left">
      <h5 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 leading-tight">
        {skuName} vs. {category.toLowerCase()} category
      </h5>
      
      <div className="space-y-4">
        {/* Metric 1: Material cost inflation */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-[10.5px]">
            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Material cost inflation</span>
            <span className="font-mono font-black text-red-500">+14.5% YoY</span>
          </div>
          {/* Progress bar track */}
          <div className="relative h-2 w-full bg-black/15 dark:bg-white/10 rounded-full overflow-visible">
            <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full" style={{ width: '72.5%' }} />
            <div className="absolute top-[-4px] h-4 w-[2px] bg-white border border-black/40 dark:border-white/60" style={{ left: '49%' }} />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase">
            <span>this SKU: 14.5%</span>
            <span>category avg: 9.8%</span>
          </div>
        </div>

        {/* Metric 2: Promotional lift ratio */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-[10.5px]">
            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Promotional lift ratio</span>
            <span className="font-mono font-black text-red-500">1.12x (rank 21/24)</span>
          </div>
          {/* Progress bar track */}
          <div className="relative h-2 w-full bg-black/15 dark:bg-white/10 rounded-full overflow-visible">
            <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full" style={{ width: '15%' }} />
            <div className="absolute top-[-4px] h-4 w-[2px] bg-white border border-black/40 dark:border-white/60" style={{ left: '50%' }} />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase">
            <span>this SKU: 1.12x</span>
            <span>category median: 1.70x</span>
          </div>
        </div>

        {/* Metric 3: Manufacturing overhead per unit */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-[10.5px]">
            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">Manufacturing overhead per unit</span>
            <span className="font-mono font-black text-amber-500">+8.2%</span>
          </div>
          {/* Progress bar track */}
          <div className="relative h-2 w-full bg-black/15 dark:bg-white/10 rounded-full overflow-visible">
            <div className="absolute top-0 left-0 h-full bg-amber-500 rounded-full" style={{ width: '68%' }} />
            <div className="absolute top-[-4px] h-4 w-[2px] bg-white border border-black/40 dark:border-white/60" style={{ left: '58%' }} />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase">
            <span>this SKU: 8.2%</span>
            <span>category avg: 7.0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getRationalisationReason = (factor: string) => {
  switch(factor) {
    case 'Low Profitability':
      return 'This SKU is currently performing significantly below the company\'s 20.0% strategic margin threshold. High raw material cost inflation (+14.5% YoY) combined with promotional dilution (38.0% discount depth) has severely eroded profit margins. Sunsetting this tail SKU will allow the portfolio to consolidate demand into core high-margin variants, reducing supply chain complexity and manufacturing overheads while recovering up to 96% of the customer volume.';
    case 'Declining Sales':
      return 'Sales volume for this SKU has dropped for 3+ consecutive quarters, indicating permanent customer migration. Sustaining this product is causing high warehouse holding costs and resource dilution. Sunsetting or repositioning the SKU consolidates shelf space for growth variants.';
    case 'SKU Proliferation':
      return 'The product category suffers from high internal overlap, diluting brand focus and confusing channel partners. Sunsetting this candidate redirects volume to core offerings, streamlining inventory replenishment cycles and maximizing category turnover.';
    case 'Cannibalization':
      return 'This variant is heavily cannibalizing sales of sibling products within the same brand family without attracting net-new customers. Removing this SKU consolidates sales into anchor products, improving gross margin and simplifying logistics.';
    case 'Inventory Inefficiency':
      return 'Low inventory turnover rate combined with high warehouse holding costs is locking up valuable working capital. Sunsetting this SKU releases $1.15M in capital that can be reinvested in high-velocity assets.';
    case 'Customer Complaints':
      return 'Persistent customer quality complaints have increased brand risk. Discontinuing or reformulating the product protects overall brand equity and aligns the portfolio with quality compliance standards.';
    case 'Competitive Disadvantage':
      return 'Falling market share and low pricing power against major competitors has made the variant unprofitable. Rationalisation allows restructuring the category pricing hierarchy.';
    default:
      return 'The variant is underperforming key portfolio targets. Rationalisation simplifies production lines, reduces operational overhead, and redirects marketing focus to high-contribution products.';
  }
};

const getSimulationStrategy = (action: string) => {
  const normAction = action ? action.toLowerCase() : '';
  if (normAction.includes('discontinue')) {
    return {
      title: 'Recommended Sunset Strategy',
      recommendation: 'Approve sunset recommendation, wind down excess inventory over the next 60 days, and shift active shelf space and customer demand to consolidated core lines.'
    };
  } else if (normAction.includes('reposition')) {
    return {
      title: 'Recommended Repositioning Strategy',
      recommendation: 'Approve repositioning action plan. Re-align marketing messaging to focus on health-conscious value propositions and adjust product placement to premium regional retailers.'
    };
  } else if (normAction.includes('consolidate')) {
    return {
      title: 'Recommended Consolidation Strategy',
      recommendation: 'Approve consolidation plan. Merge this duplicate variant into the anchor product line to reduce production changeover times and optimize raw packaging stock levels.'
    };
  } else if (normAction.includes('reformulate') || normAction.includes('redesign')) {
    return {
      title: 'Recommended Redesign Strategy',
      recommendation: 'Approve redesign and reformulation plan. Swap high-cost additives for standard ingredients and update container packaging to shared, low-cost formats.'
    };
  }
  return {
    title: 'Recommended Strategic Action',
    recommendation: 'Proceed with the designated action plan and monitor category margin lift.'
  };
};

interface DemoTabProps {
  role?: string;
  tasks?: Record<string, Task[]>;
  setTasks?: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
  setActiveTab?: (tabId: number) => void;
  actionFilter?: string;
  setActionFilter?: (action: string) => void;
  searchQuery?: string;
  setSearchQuery?: (search: string) => void;
}

const generateTasksForSku = (skuName: string, action: string, factor: string): Record<string, Task[]> => {
  const normAction = (action || '').toLowerCase();
  const timestamp = Date.now();

  const generated: Record<string, Task[]> = {};

  if (normAction.includes('sunset') || normAction.includes('discontinue') || normAction.includes('rationalise') || normAction.includes('remove') || normAction.includes('rationalize')) {
    generated.pmo = [
      { id: `pmo-auto-${timestamp}-1`, tags: ['Scope'], title: `Coordinate sunset checklist & transition for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.procurement = [
      { id: `pro-auto-${timestamp}-1`, tags: ['Analysis'], title: `Negotiate contract termination & raw materials write-off for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
    generated.finance = [
      { id: `fin-auto-${timestamp}-1`, tags: ['Analysis'], title: `Calculate final margin write-off savings & tax implications for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.consumer = [
      { id: `con-auto-${timestamp}-1`, tags: ['Scope'], title: `Draft customer substitution & delisting notice for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['AM'], isNew: true, createdAt: timestamp }
    ];
  } else if (normAction.includes('consolidate') || normAction.includes('merge')) {
    generated.pmo = [
      { id: `pmo-auto-${timestamp}-1`, tags: ['Scope'], title: `Manage consolidation timeline & retail transition for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.rd = [
      { id: `rd-auto-${timestamp}-1`, tags: ['Design'], title: `Draft SKU merge specifications & revised bill of materials for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
    generated.marketing = [
      { id: `mkt-auto-${timestamp}-1`, tags: ['Design'], title: `Execute packaging rebranding & shelf slot transition mockups for ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.sales = [
      { id: `sls-auto-${timestamp}-1`, tags: ['Development'], title: `Update price list sheets & retail inventory links for consolidated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['AM'], isNew: true, createdAt: timestamp }
    ];
  } else {
    generated.rd = [
      { id: `rd-auto-${timestamp}-1`, tags: ['Development'], title: `Develop ingredient substitution prototypes for ${skuName} cost savings`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
    generated.qa = [
      { id: `qa-auto-${timestamp}-1`, tags: ['Testing'], title: `Execute formula stability testing & check compliance files for reformulated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['AM'], isNew: true, createdAt: timestamp }
    ];
    generated.procurement = [
      { id: `pro-auto-${timestamp}-1`, tags: ['Development'], title: `Source new raw material vendor agreements for reformulated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JO'], isNew: true, createdAt: timestamp }
    ];
    generated.sustainability = [
      { id: `sus-auto-${timestamp}-1`, tags: ['Analysis'], title: `Conduct packaging recyclability lifecycle assessment for reformulated ${skuName}`, duration: '1 sec ago', dueDate: 'TBD', avatars: ['JI'], isNew: true, createdAt: timestamp }
    ];
  }
  return generated;
};

export const DemoTab: React.FC<DemoTabProps> = ({ 
  role, 
  tasks, 
  setTasks, 
  setActiveTab,
  actionFilter: propsActionFilter,
  setActionFilter: propsSetActionFilter,
  searchQuery: propsSearchQuery,
  setSearchQuery: propsSetSearchQuery
}) => {
  const [selectedSkuForRca, setSelectedSkuForRca] = useState<any>(null);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [simulatingSkuName, setSimulatingSkuName] = useState<string | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simViewMode, setSimViewMode] = useState<'revenue' | 'margin'>('revenue');
  
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = propsSearchQuery !== undefined ? propsSearchQuery : localSearchQuery;
  const setSearchQuery = propsSetSearchQuery !== undefined ? propsSetSearchQuery : setLocalSearchQuery;
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [impactFilter, setImpactFilter] = useState('All');
  
  const [localActionFilter, setLocalActionFilter] = useState('All');
  const actionFilter = propsActionFilter !== undefined ? propsActionFilter : localActionFilter;
  const setActionFilter = propsSetActionFilter !== undefined ? propsSetActionFilter : setLocalActionFilter;
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [executionSkuName, setExecutionSkuName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleSimulate = (skuName: string) => {
    setSimulatingSkuName(skuName);
    setIsSimulationModalOpen(true);
    setSimulationProgress(0);
    setSimulationResult(null);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setSimulationProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setSimulationResult({
          grossMarginImprovement: '+1.45% (+145 bps)',
          costSavings: '$412K',
          workingCapital: '$1.15M',
          cannibalization: 'Low (14% recovery on sibling SKUs)',
          customerTransition: '96.2%',
          recommendation: 'Approve sunset recommendation and shift active inventory to consolidated core line.'
        });
      }
    }, 100);
  };

  // Filter logic for explorer table
  const filteredRows = useMemo(() => {
    return EXPLORER_ROWS.filter(row => {
      const matchesSearch = row.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            row.factor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            row.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || row.cat === categoryFilter;
      const matchesProductCategory = productCategoryFilter === 'All' || row.productCat === productCategoryFilter;
      const matchesRegion = regionFilter === 'All' || row.region === regionFilter;
      const matchesImpact = impactFilter === 'All' || row.impact === impactFilter;
      const matchesAction = actionFilter === 'All' || row.action.toLowerCase().includes(actionFilter.toLowerCase()) || 
                            actionFilter.toLowerCase().includes(row.action.toLowerCase());
      return matchesSearch && matchesCategory && matchesProductCategory && matchesRegion && matchesImpact && matchesAction;
    });
  }, [searchQuery, categoryFilter, productCategoryFilter, regionFilter, impactFilter, actionFilter]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, productCategoryFilter, regionFilter, impactFilter, actionFilter]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  const handleExportCSV = () => {
    const headers = ['SKU', 'Category', 'Region', 'Identified Issue', 'Rationale Factors', 'Description', 'Impact Level', 'Recommended Action', 'Investigate'];
    const csvContent = [
      headers.join(','),
      ...filteredRows.map(r => `"${r.sku}","${r.productCat}","${r.region}","${r.factor}","${r.cat}","${r.desc}","${r.impact}","${r.action}","Run RCA"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Demo_Detailed_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">


      {/* Detailed Rationale Explorer */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">DETAILED RATIONALE EXPLORER</h3>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">Drill down into specific rationale factors</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-black/2 dark:bg-white/2 p-2 rounded-sm border border-black/5 dark:border-white/5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
            <input
              type="text"
              placeholder="Search rationale factors or SKUs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 p-1.5 pl-8 text-[10px] font-semibold rounded-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-acies-yellow"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9.5px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Beverages">Beverages</option>
              <option value="Snacks">Snacks</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Household">Household</option>
            </select>

            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9.5px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
            >
              <option value="All">All Regions</option>
              <option value="LATAM">LATAM</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="APAC">APAC</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9.5px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
            >
              <option value="All">All Rationale Factors</option>
              <option value="Financial Reasons">Financial Reasons</option>
              <option value="Portfolio Reasons">Portfolio Reasons</option>
              <option value="Supply Chain Reasons">Supply Chain Reasons</option>
              <option value="Customer & Market">Customer & Market</option>
              <option value="Regulatory & Risk">Regulatory & Risk</option>
            </select>

            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
              className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9.5px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
            >
              <option value="All">All Impact Levels</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low impact">Low impact</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9.5px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
            >
              <option value="All">All Actions</option>
              <option value="Discontinue">Discontinue / Consolidate</option>
              <option value="Reposition">Reposition</option>
              <option value="Consolidate">Consolidate</option>
              <option value="Reformulate">Reformulate / Redesign</option>
              <option value="Invest">Invest / Expand</option>
            </select>

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none"
            >
              <Download size={11} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Explorer Table */}
        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-2">Category</th>
                <th className="py-2.5 px-2">Region</th>
                <th className="py-2.5 px-2">Identified Issue</th>
                <th className="py-2.5 px-2">Rationale Factors</th>
                <th className="py-2.5 px-2">Description</th>
                <th className="py-2.5 px-2">Impact Level</th>
                <th className="py-2.5 px-2">Recommended Action</th>
                <th className="py-2.5 px-3 text-right">Investigate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-400">
              {paginatedRows.map(row => (
                <tr key={row.sku} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
                  <td className="py-2.5 px-3 font-extrabold text-zinc-900 dark:text-zinc-100">{row.sku}</td>
                  <td className="py-2.5 px-2 font-bold text-zinc-800 dark:text-zinc-200">{row.productCat}</td>
                  <td className="py-2.5 px-2 font-bold text-zinc-800 dark:text-zinc-200">{row.region}</td>
                  <td className="py-2.5 px-2 font-bold text-zinc-800 dark:text-zinc-200">{row.factor}</td>
                  <td className="py-2.5 px-2 text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-600">{row.cat}</td>
                  <td className="py-2.5 px-2 text-zinc-500 dark:text-zinc-400 font-normal">{row.desc}</td>
                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      row.impact === 'High' 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10' 
                        : row.impact === 'Medium'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10'
                          : row.impact === 'Low impact'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10'
                            : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/10'
                    }`}>
                      {row.impact}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-extrabold text-zinc-900 dark:text-zinc-300">{row.action}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedSkuForRca(row)}
                      className="p-1 px-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white border border-indigo-200 dark:border-indigo-800/40 rounded text-[8.5px] font-black uppercase tracking-wider cursor-pointer inline-flex items-center gap-1 transition-all shadow-sm"
                      title="View Detailed Root Cause Analysis"
                    >
                      <Activity size={10} className="stroke-[2.5]" />
                      <span>Analyze</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-zinc-500 dark:text-zinc-500">
                    No SKUs match your active filter criteria. Try resetting your search or filter pills.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/5 text-[9.5px] font-bold text-zinc-500 dark:text-zinc-400">
            <span>Showing {Math.min(filteredRows.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredRows.length, currentPage * itemsPerPage)} of {filteredRows.length} SKUs</span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-black/5 cursor-pointer text-[9px] uppercase font-bold text-zinc-700 dark:text-zinc-400"
              >
                Previous
              </button>
              <span className="font-mono">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-black/5 cursor-pointer text-[9px] uppercase font-bold text-zinc-700 dark:text-zinc-400"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Root Cause Analysis Modal */}
      {selectedSkuForRca && (() => {
        const rca = getRcaDetails(selectedSkuForRca.sku, selectedSkuForRca.factor);
        return (
          <ModalShell isOpen onClose={() => setSelectedSkuForRca(null)} layer="base" blur="sm" className="flex items-center justify-center p-4 md:p-6 animate-fadeIn">
            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-slideIn">
              
              {/* Header */}
              <div className="p-5 border-b border-b-black/5 dark:border-b-white/5 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-tight">{selectedSkuForRca.sku}</h3>
                  <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase mt-0.5 block">{selectedSkuForRca.productCat} Category</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => setSelectedSkuForRca(null)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
 
              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-700 dark:text-zinc-400">
                


                {/* Key Findings */}
                <div className="space-y-2">
                  <h4 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500">Primary Root Causes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {rca.rootCauses.map((cause, index) => (
                      <div key={cause.title} className="bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/5 p-2.5 rounded-sm relative flex flex-col gap-2 text-left hover:border-indigo-500/30 transition-all hover:shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-[8.5px] shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-600/10 px-1.5 py-0.5 rounded">FACTOR</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-[10.5px] leading-tight">{cause.title}</span>
                          <p className="text-zinc-600 dark:text-zinc-400 text-[9px] leading-normal">{cause.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Margin Analysis Section */}
                <div className="space-y-4">
                  <h4 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500">Margin Performance Diagnostics</h4>
                  
                  {/* Margin KPI Tiles */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm text-left">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 block mb-2 lowercase">target margin</span>
                      <h4 className="text-2xl font-display font-black text-zinc-800 dark:text-white leading-none">20.0%</h4>
                    </div>
                    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm text-left">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 block mb-2 lowercase">actual margin</span>
                      <h4 className="text-2xl font-display font-black text-zinc-800 dark:text-white leading-none">14.6%</h4>
                    </div>
                    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm text-left">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 block mb-2 lowercase">total gap</span>
                      <h4 className="text-2xl font-display font-black text-red-500 dark:text-red-400 leading-none">-5.4pt</h4>
                    </div>
                  </div>

                  {/* Waterfall and Benchmarks side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MarginWaterfallChart />
                    <SkuCategoryBenchmarks skuName={selectedSkuForRca.sku} category={selectedSkuForRca.productCat} />
                  </div>
                </div>
               </div>

              {/* Footer */}
              <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-between items-center">
                <button 
                  onClick={() => {
                    handleSimulate(selectedSkuForRca.sku);
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-800 hover:to-indigo-800 text-white rounded-sm text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all duration-150"
                >
                  Simulate Rationalisation
                </button>
                <button 
                  onClick={() => setSelectedSkuForRca(null)}
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-400 rounded text-[9.5px] font-bold uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  Close Analysis
                </button>
              </div>

            </div>
          </ModalShell>
        );
      })()}

      {/* Simulation Modal Popup */}
      {isSimulationModalOpen && simulatingSkuName && (
        <ModalShell isOpen onClose={() => setIsSimulationModalOpen(false)} layer="base" blur="sm" className="flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-slideIn">
            {/* Header */}
            <div className="p-5 border-b border-b-black/5 dark:border-b-white/5 flex justify-between items-start">
              <div>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-black block mb-1">Rationalisation Simulator</span>
                <h3 className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-tight">{simulatingSkuName}</h3>
              </div>
              <button 
                onClick={() => {
                  setIsSimulationModalOpen(false);
                  setSimulatingSkuName(null);
                  setSimulationResult(null);
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-3 text-[10px] text-zinc-700 dark:text-zinc-400">
              {simulationProgress < 100 ? (
                <div className="space-y-3 py-6 text-center">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider">Simulating SKU Rationalisation</h4>
                  <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 max-w-[280px] mx-auto">Running scenario models, cross-elasticity checks, and inventory buffer calculations...</p>
                  <div className="w-full bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-100" style={{ width: `${simulationProgress}%` }} />
                  </div>
                  <span className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400">{simulationProgress}% Complete</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-1.5 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center">
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider">Simulation Results</h4>
                    </div>
                  </div>
                  
                  <div className="border border-black/10 dark:border-white/10 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse text-[9.5px]">
                      <thead>
                        <tr className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-[8px] uppercase font-black text-zinc-500 tracking-wider">
                          <th className="py-2 px-3">Evaluation Metric</th>
                          <th className="py-2 px-2 text-right">Current</th>
                          <th className="py-2 px-2 text-right">Simulated</th>
                          <th className="py-2 px-3 text-right">Delta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-400">
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-800 dark:text-zinc-200">Revenue Impact</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$4.20M</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$5.07M</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-500 font-bold">+$870K (+20.7%)</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-800 dark:text-zinc-200">Cost Savings (COGS)</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$3.59M</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$3.08M</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-500 font-bold">-$510K (-14.2%)</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-800 dark:text-zinc-200">Inventory Impact (Working Capital)</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$1.20M</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$150K</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-500 font-bold">-$1.05M (-87.5%)</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-800 dark:text-zinc-200">Risks Score (Supply/Defect)</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">68%</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">15%</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-500 font-bold">-53% (-77.9%)</td>
                        </tr>
                        <tr className="bg-emerald-500/5 dark:bg-emerald-500/5 border-t border-black/10 dark:border-white/10">
                          <td className="py-2 px-3 font-extrabold text-zinc-900 dark:text-white">Expected ROI %</td>
                          <td className="py-2 px-2 text-right font-mono font-black">12.4%</td>
                          <td className="py-2 px-2 text-right font-mono font-black">34.8%</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-emerald-500">+22.4% (+2240 bps)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-sm text-left">
                    <span className="text-[8.5px] font-black text-amber-600 dark:text-amber-500 block uppercase tracking-widest mb-1">Descriptive Rationalisation Justification</span>
                    <p className="text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-400 font-semibold">{getRationalisationReason(selectedSkuForRca?.factor || '')}</p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[8.5px] font-black text-zinc-500 dark:text-zinc-400 block uppercase tracking-widest text-left">Simulation Evaluation Factors</span>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Verify Profitability Card */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[72px] shadow-sm">
                        <div>
                          <span className="text-[9.5px] text-zinc-500 dark:text-zinc-500 font-semibold block leading-none">Verify profitability</span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white block mt-1.5 leading-none">21.4%</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-semibold mt-2 block leading-none">+3.6pt vs 20.0% floor</span>
                        <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                      </div>

                      {/* Customer Impact Card */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[72px] shadow-sm">
                        <div>
                          <span className="text-[9.5px] text-zinc-500 dark:text-zinc-500 font-semibold block leading-none">Customer impact</span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white block mt-1.5 leading-none">96.2%</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-semibold mt-2 block leading-none">low transition friction</span>
                        <Users size={13} className="text-emerald-600 dark:text-emerald-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                      </div>

                      {/* Market Trends Card */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[72px] shadow-sm">
                        <div>
                          <span className="text-[9.5px] text-zinc-500 dark:text-zinc-500 font-semibold block leading-none">Market trends</span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white block mt-1.5 leading-none">strong</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-semibold mt-2 block leading-none">matches larger-sizing demand shift</span>
                        <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                      </div>

                      {/* Strategic Fit Card */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[72px] shadow-sm">
                        <div>
                          <span className="text-[9.5px] text-zinc-500 dark:text-zinc-500 font-semibold block leading-none">Strategic fit</span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white block mt-1.5 leading-none">-2</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-semibold mt-2 block leading-none">6 → 4 active warehouses</span>
                        <Building size={13} className="text-emerald-600 dark:text-emerald-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const strategy = getSimulationStrategy(selectedSkuForRca?.action || '');
                    const actionVal = selectedSkuForRca?.action || '';
                    const normAction = actionVal.toLowerCase();
                    
                    let depts: { label: string, theme: string }[] = [];
                    if (normAction.includes('sunset') || normAction.includes('discontinue') || normAction.includes('rationalise') || normAction.includes('remove') || normAction.includes('rationalize')) {
                      depts = [
                        { label: 'PMO', theme: 'bg-[#fbece5] text-[#9a3412] border-orange-500/10' },
                        { label: 'Procurement', theme: 'bg-[#ffedd5] text-[#9a3412] border-amber-500/10' },
                        { label: 'Finance', theme: 'bg-[#fee2e2] text-[#991b1b] border-red-500/10' },
                        { label: 'Consumer', theme: 'bg-[#fafaf9] text-[#44403c] border-stone-500/10' }
                      ];
                    } else if (normAction.includes('consolidate') || normAction.includes('merge')) {
                      depts = [
                        { label: 'PMO', theme: 'bg-[#fbece5] text-[#9a3412] border-orange-500/10' },
                        { label: 'R&D', theme: 'bg-[#fdf2f8] text-[#9d174d] border-pink-500/10' },
                        { label: 'Marketing', theme: 'bg-[#e0f2fe] text-[#075985] border-sky-500/10' },
                        { label: 'Sales', theme: 'bg-[#f0fdf4] text-[#166534] border-emerald-500/10' }
                      ];
                    } else {
                      depts = [
                        { label: 'R&D', theme: 'bg-[#fdf2f8] text-[#9d174d] border-pink-500/10' },
                        { label: 'Quality Assurance', theme: 'bg-[#e0f7fa] text-[#006064] border-cyan-500/10' },
                        { label: 'Procurement', theme: 'bg-[#ffedd5] text-[#9a3412] border-amber-500/10' },
                        { label: 'Sustainability', theme: 'bg-[#ecfccb] text-[#3f6212] border-lime-500/10' }
                      ];
                    }

                    return (
                      <div className="flex flex-col gap-3">
                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-sm text-left">
                          <span className="text-[8.5px] font-black text-indigo-500 dark:text-indigo-400 block uppercase tracking-widest mb-1">{strategy.title}</span>
                          <p className="text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-400 font-semibold">{strategy.recommendation}</p>
                        </div>
                        
                        <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm text-left">
                          <span className="text-[8.5px] font-black text-zinc-500 dark:text-zinc-600 block uppercase tracking-widest mb-2">Auto-Task Assignment Preview</span>
                          <div className="flex flex-wrap gap-1.5">
                            {depts.map((d) => (
                              <span 
                                key={d.label} 
                                className={`px-2 py-0.5 border rounded text-[8px] font-black uppercase ${d.theme}`}
                              >
                                {d.label}
                              </span>
                            ))}
                          </div>
                          <span className="text-[8.5px] font-semibold text-zinc-400 dark:text-zinc-500 block mt-2 leading-tight">
                            Upon executing, a new unread task will be dispatched to the workstreams highlighted above.
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsSimulationModalOpen(false);
                  setSimulatingSkuName(null);
                  setSimulationResult(null);
                }}
                className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-400 rounded text-[9.5px] font-bold uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                Close Simulator
              </button>
              {simulationProgress === 100 && (
                <button 
                  onClick={() => {
                    if (role === 'Product Manager' && setTasks) {
                      const skuNameVal = selectedSkuForRca?.name || selectedSkuForRca?.skuName || simulatingSkuName || 'Selected SKU';
                      const newTasks = generateTasksForSku(
                        skuNameVal,
                        selectedSkuForRca?.action || '',
                        selectedSkuForRca?.factor || ''
                      );
                      setTasks(prev => {
                        const updated = { ...prev };
                        Object.keys(newTasks).forEach(deptKey => {
                          updated[deptKey] = [...(updated[deptKey] || []), ...newTasks[deptKey]];
                        });
                        return updated;
                      });
                    }
                    setIsSimulationModalOpen(false);
                    setSimulatingSkuName(null);
                    setSimulationResult(null);
                    setSelectedSkuForRca(null);
                    if (setActiveTab) {
                      setActiveTab(11);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-sm flex items-center gap-1"
                >
                  <span>Execute Plan</span>
                  <ArrowRight size={11} />
                </button>
              )}
            </div>
          </div>
        </ModalShell>
      )}
      {/* Execution Plan & Communication Modal */}
      {isExecutionModalOpen && executionSkuName && (
        <ModalShell isOpen onClose={() => setIsExecutionModalOpen(false)} layer="panel" blur="sm" className="flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-slideIn">
            
            {/* Header */}
            <div className="p-5 border-b border-b-black/5 dark:border-b-white/5 flex justify-between items-start">
              <div>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-black block mb-1">Execution Action Plan</span>
                <h3 className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-tight">Communication Playbook</h3>
                <p className="text-[9.5px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">Required communications for {executionSkuName}</p>
              </div>
              <button 
                onClick={() => {
                  setIsExecutionModalOpen(false);
                  setExecutionSkuName(null);
                  setSelectedSkuForRca(null);
                  setSimulatingSkuName(null);
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-4 text-[10px] text-zinc-700 dark:text-zinc-400">
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 p-3 rounded-sm text-left">
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 block uppercase tracking-widest mb-1">Execution Objective</span>
                <p className="text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                  To successfully coordinate the rationalisation of <span className="font-bold text-zinc-900 dark:text-white">{executionSkuName}</span>, the Product Manager must dispatch and align the following communication streams across sales, supply chain, retail channels, and catalogs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Sales Card */}
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[90px] shadow-sm">
                  <div>
                    <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider leading-none mb-1.5">Sales & Account Managers</span>
                    <span className="text-[10.5px] font-bold text-zinc-900 dark:text-white block leading-tight">Send substitution templates</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-2 block leading-relaxed">
                    Provide the sales force with email sequences and pricing alternatives to migrate accounts to sister variants.
                  </span>
                  <Mail size={13} className="text-indigo-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                </div>

                {/* Supply Chain Card */}
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[90px] shadow-sm">
                  <div>
                    <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider leading-none mb-1.5">Operations & Logistics</span>
                    <span className="text-[10.5px] font-bold text-zinc-900 dark:text-white block leading-tight">Issue stop & wind-down order</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-2 block leading-relaxed">
                    Notify purchasing agents to freeze raw stock orders, and set target manufacturing wind-down dates.
                  </span>
                  <Truck size={13} className="text-indigo-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                </div>

                {/* Retail Distributors Card */}
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[90px] shadow-sm">
                  <div>
                    <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider leading-none mb-1.5">Distributors & Retailers</span>
                    <span className="text-[10.5px] font-bold text-zinc-900 dark:text-white block leading-tight">Dispatch phase-out notification</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-2 block leading-relaxed">
                    Deliver formal 60-day discontinuation letters detailing buyback eligibility limits and depletion windows.
                  </span>
                  <Store size={13} className="text-indigo-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                </div>

                {/* Database & Portfolio Card */}
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[90px] shadow-sm">
                  <div>
                    <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider leading-none mb-1.5">Master Catalog Database</span>
                    <span className="text-[10.5px] font-bold text-zinc-900 dark:text-white block leading-tight">Flag SKU status as Deprecated</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-2 block leading-relaxed">
                    Coordinate with digital category analysts to mark SKU as inactive across digital inventory records.
                  </span>
                  <Globe size={13} className="text-indigo-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-end gap-3">
              <button 
                onClick={() => {
                  if (role === 'Product Manager' && setTasks) {
                    const skuNameVal = selectedSkuForRca?.name || selectedSkuForRca?.skuName || executionSkuName || 'Selected SKU';
                    const newTasks = generateTasksForSku(
                      skuNameVal,
                      selectedSkuForRca?.action || '',
                      selectedSkuForRca?.factor || ''
                    );
                    setTasks(prev => {
                      const updated = { ...prev };
                      Object.keys(newTasks).forEach(deptKey => {
                        updated[deptKey] = [...(updated[deptKey] || []), ...newTasks[deptKey]];
                      });
                      return updated;
                    });
                  }
                  setIsExecutionModalOpen(false);
                  setExecutionSkuName(null);
                  setSelectedSkuForRca(null);
                  setSimulatingSkuName(null);
                  if (setActiveTab) {
                    setActiveTab(11);
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-sm flex items-center gap-1"
              >
                <span>Confirm & Mark Completed</span>
              </button>
            </div>

          </div>
        </ModalShell>
      )}
    </div>
  );
};
