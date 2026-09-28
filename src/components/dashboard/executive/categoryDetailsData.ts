/**
 * Per-category and per-SKU analysis content.
 *
 * Extracted from CategoryPerformanceDetailsModal.tsx (1,790 lines).
 */


export interface SkuPerformanceDetail {
  name: string;
  rev: string;
  growth: string;
  metricLabel: string;
  metricValue: string;
  rationale: string;
}

export interface CategoryDetails {
  name: string;
  totalRev: string;
  marketShare: string;
  topPerformer: SkuPerformanceDetail;
  underperformer: SkuPerformanceDetail;
  boomingSku: SkuPerformanceDetail;
  vpBriefing: string;
}

export const CATEGORY_DETAILS_DATA: Record<string, CategoryDetails> = {
  Beverages: {
    name: 'Beverages',
    totalRev: '$316.0 M',
    marketShare: '33.6%',
    topPerformer: {
      name: 'Mango Fizz 500ml',
      rev: '$48.2 M',
      growth: '+14.2% YoY',
      metricLabel: 'Gross Margin',
      metricValue: '54.5%',
      rationale: 'Core brand strength and strong regional logistics support. Consistently drives supermarket volume velocity.'
    },
    underperformer: {
      name: 'BrandA Premium Energy 250ml',
      rev: '$4.1 M',
      growth: '-8.3% YoY',
      metricLabel: 'Discount Reliance',
      metricValue: '48.0%',
      rationale: 'Poor shelf rotation and low consumer repeat rates. High cost of sales due to heavy local promotions.'
    },
    boomingSku: {
      name: 'Coconut Water Eco-Pack 1L',
      rev: '$18.5 M',
      growth: '+32.4% MoM',
      metricLabel: 'Sourcing Index',
      metricValue: 'Optimal',
      rationale: 'Surging demand in e-commerce and health-conscious consumer segments. High repeat purchase rate (+22% week-on-week).'
    },
    vpBriefing: 'Sustain marketing support for Coconut Water variants; prepare for production line volume switch to offset potential raw concentrate constraints.'
  },
  Snacks: {
    name: 'Snacks',
    totalRev: '$253.0 M',
    marketShare: '26.9%',
    topPerformer: {
      name: 'BrandB Chips Family Pack',
      rev: '$38.5 M',
      growth: '+9.1% YoY',
      metricLabel: 'Gross Margin',
      metricValue: '42.0%',
      rationale: 'High loyalty and strong distributor channels. Generates stable cash inflows with consistent retail shelf share.'
    },
    underperformer: {
      name: 'Choco Wafers Multi-Pack',
      rev: '$8.4 M',
      growth: '-12.0% YoY',
      metricLabel: 'Discount Reliance',
      metricValue: '72.0%',
      rationale: 'Heavy trade discount pressure in hypermarket accounts. Margin erosion makes this item a key candidate for bundle pricing.'
    },
    boomingSku: {
      name: 'Oat Cookies Healthy Baked',
      rev: '$14.2 M',
      growth: '+24.5% MoM',
      metricLabel: 'Sourcing Index',
      metricValue: '96% on-time',
      rationale: 'Benefiting from school lunchbox snack trends and urban health food placements. High grocery shelf rotation speed.'
    },
    vpBriefing: 'Cap trade promotions on Choco Wafers to halt margins leakage. Standardize premium packaging inventory for Oat Cookies ahead of Q3 peak.'
  },
  'Personal Care': {
    name: 'Personal Care',
    totalRev: '$225.0 M',
    marketShare: '24.0%',
    topPerformer: {
      name: 'Herbal Shampoo Anti-Dandruff',
      rev: '$29.1 M',
      growth: '+18.0% YoY',
      metricLabel: 'Gross Margin',
      metricValue: '58.2%',
      rationale: 'Market-leading SKU with high retail shelf penetration and premium pricing power across regional chain accounts.'
    },
    underperformer: {
      name: 'Foam Face Wash Sensitive 150ml',
      rev: '$6.8 M',
      growth: '-2.1% YoY',
      metricLabel: 'Discount Reliance',
      metricValue: '35.0%',
      rationale: 'High container packaging costs and localized logistics bottlenecks. Struggling to compete with regional boutique brands.'
    },
    boomingSku: {
      name: 'Hand Cream SPF Active',
      rev: '$11.2 M',
      growth: '+45.1% MoM',
      metricLabel: 'Sourcing Index',
      metricValue: 'Active',
      rationale: 'Strong seasonal momentum and influencer marketing pickup. Surging retail repeat rate (+35%) in major metro outlets.'
    },
    vpBriefing: 'Formulate RFP to qualify alternate face wash packaging suppliers. Invest gross margin surplus from Herbal Shampoo into Hand Cream SPF production scaling.'
  },
  Household: {
    name: 'Household',
    totalRev: '$145.0 M',
    marketShare: '15.5%',
    topPerformer: {
      name: 'Dish Soap Lemon 1L',
      rev: '$22.4 M',
      growth: '+6.2% YoY',
      metricLabel: 'Gross Margin',
      metricValue: '36.8%',
      rationale: 'High distributor penetration and stable, reliable retail sales velocity. Acts as a core volume stabilizer for the category.'
    },
    underperformer: {
      name: 'Fabric Softener Premium',
      rev: '$4.8 M',
      growth: '-14.3% YoY',
      metricLabel: 'Discount Reliance',
      metricValue: '55.0%',
      rationale: 'Chemical raw material shipping disruptions and high port transit delays causing shelf stockouts.'
    },
    boomingSku: {
      name: 'Laundry Pods Concentrated',
      rev: '$18.2 M',
      growth: '+38.0% MoM',
      metricLabel: 'Sourcing Index',
      metricValue: 'Optimal',
      rationale: 'Rapid customer transition from traditional powders to premium eco-friendly concentrated pods. Outstanding margins.'
    },
    vpBriefing: 'Accelerate traditional powder transition lines to direct production floor bandwidth toward high-value Laundry Pod operations.'
  }
};

export interface TeamSyncOption {
  action: string;
  impact: string;
  contactName: string;
  contactTitle: string;
  email: string;
  draftBody: string;
}

export interface RecommendationDetail {
  title: string;
  moreInfo: string;
  teamOptions: TeamSyncOption[];
}

export interface SkuRootCauseDeepDive {
  supplyChain: string;
  consumerInsights: string;
  financialPricing: string;
}

export interface SkuAnalysisData {
  whyItIsPerforming: string;
  recommendations: RecommendationDetail[];
  deepDive: SkuRootCauseDeepDive;
}

export const SKU_ANALYSIS_DETAILS: Record<string, SkuAnalysisData> = {
  'Mango Fizz 500ml': {
    whyItIsPerforming: 'Core brand equity, high regional logistics velocity, and strong supermarket retail shelf penetration. Exceptional contribution margins of 54.5% indicate strong consumer pricing power.',
    deepDive: {
      supplyChain: 'Maintained a flawless 99.4% on-shelf availability index across convenience channels due to the successful qualification of regional bottling partners. Regional buffer stocks are optimized at 14 days of supply.',
      consumerInsights: 'Convenience channel checkout velocity remains at record levels, driven by highly effective front-of-store cold-rack product placement. Buyer loyalty index shows high repeat purchasing behavior (+2.4x monthly).',
      financialPricing: 'Premium gross margin of 54.5% is supported by stable raw sweetener sourcing contracts. Promotion efficiency is high, with dynamic weekend pricing offsets driving incremental volume.'
    },
    recommendations: [
      {
        title: 'Optimize Convenience channel shelf-space allocations to mirror successful supermarket models.',
        moreInfo: 'Analyze geographic checkout data to relocate underperforming items. Reallocating prime eye-level shelf space in high-density convenience outlets can increase overall checkout velocity by up to 18%.',
        teamOptions: [
          {
            action: 'Retail Shelf Allocation Alignment',
            impact: 'Optimizes Convenience store space for 54.5% margin item',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Supermarket Channel Space Audit',
            impact: 'Evaluates supermarket placement strategies to duplicate in convenience networks',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Deploy co-branding bundle strategies with low-velocity personal care or snack SKUs.',
        moreInfo: 'Increase checkout basket size by pairing Mango Fizz with complementary snacks (e.g. BrandB Chips) or rationalized items. Bundled pricing targets convenience shoppers.',
        teamOptions: [
          {
            action: 'Co-Branding Bundle Margin Sync',
            impact: 'Aligns on promotional bundle margins and pricing elasticity limits',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Bundle Distribution Logistics Review',
            impact: 'Coordinates bundle packaging and logistics networks with retail managers',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Test localized dynamic retail pricing indices during peak weekend foot-traffic hours.',
        moreInfo: 'Use real-time regional sales velocity data to implement minor, temporary price adjustments. Targets high-volume supermarket locations on Saturdays and Sundays.',
        teamOptions: [
          {
            action: 'Dynamic Pricing Elasticity Sync',
            impact: 'Develops weekend pricing models and caps pricing parameters',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'P&L Contribution margin check',
            impact: 'Evaluates P&L contributions and margin floor protections',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'BrandA Premium Energy 250ml': {
    whyItIsPerforming: 'High dependency on local promotional pricing (48% discount reliance), poor product packaging appeal to younger demographics, and intense competitor shelf crowding.',
    deepDive: {
      supplyChain: 'Sourcing bottlenecks for imported active caffeine inputs added 20 days to logistics cycles, driving convenience shelf out-of-stocks to a critical 12% during peak sales periods.',
      consumerInsights: 'Weak organic pull with repeat purchase rates lagging at +4.5% vs. a category benchmark of 18%. Young buyer cohorts report packaging design is outdated.',
      financialPricing: 'Gross margin compressed due to 48% discount reliance. High slotting fee payouts in major supermarket chains are diluting bottom-line contribution margins.'
    },
    recommendations: [
      {
        title: 'Perform packaging overhaul emphasizing active wellness ingredients to match current health food market trends.',
        moreInfo: 'Modern health-conscious buyers demand clean labeling and functional benefits. Shifting packaging style from commercial energy drinks to organic wellness can attract premium buyers.',
        teamOptions: [
          {
            action: 'Brand Marketing & Package Redesign RFP',
            impact: 'Vets updated packaging timeline and digital ad redirection',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Packaging Focus Group Survey',
            impact: 'Surveys target demographics on new packaging and active ingredient labels',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Cap promotional dilution at 35% and shift marketing budget to digital channels.',
        moreInfo: 'Heavy discount reliance (48%) is eroding product value. Direct digital ad spend toward target demographics to drive organic, full-price shelf rotation.',
        teamOptions: [
          {
            action: 'Promo Discount Floor Limits',
            impact: 'Establishes Q4 promotional margin ceiling to prevent further erosion',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Digital Ad Campaigns Audit',
            impact: 'Evaluates social media ad placements to transition from print/promo discounts',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Transition single-can retail availability to bundled multi-packs to decrease individual unit carrying costs.',
        moreInfo: 'Shipping and stocking single units is highly expensive. Transitioning retail contracts to 4-pack and 6-pack units reduces unit logistics costs.',
        teamOptions: [
          {
            action: 'Multi-Pack Retail Slotting Review',
            impact: 'Coordinates multi-pack contract slotting with hypermarkets',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Supply Chain & Packaging Margin Audit',
            impact: 'Evaluates supply chain cost reductions on bulk box shipments',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'Coconut Water Eco-Pack 1L': {
    whyItIsPerforming: 'Surging e-commerce consumer demand, strong alignment with health & wellness segments, and exceptional repeat purchase patterns (+22% WoW growth).',
    deepDive: {
      supplyChain: 'Sourcing lead times for eco-friendly cardboard packaging surged from 10 to 18 days. Urgent raw packaging material agreements must be secured to avoid e-commerce shipment halts.',
      consumerInsights: 'Exceptional traction in fitness and urban wellness communities, driving an outstanding repeat purchase rate (+22% WoW) and 32.4% MoM demand spikes.',
      financialPricing: 'High initial retail gross margins, though exposed to packaging supply cost volatility if long-term paperboard pricing guarantees are not established.'
    },
    recommendations: [
      {
        title: 'Pre-secure additional packaging raw material contracts to offset potential EU/APAC supply constraints.',
        moreInfo: 'Massive e-commerce demand and 32.4% MoM growth are stretching current supply lines. Lock in long-term raw board and cap supply agreements.',
        teamOptions: [
          {
            action: 'Raw Materials Sourcing Sync',
            impact: 'Secures long-term eco-packaging contracts ahead of supply spikes',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Inventory CAPEX Buffer Allocation',
            impact: 'Allocates reserves to prepay packaging raw materials and secure supplier priority',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Deploy localized influencer marketing budget targeting urban wellness communities.',
        moreInfo: 'Organic beverage growth is highly driven by word-of-mouth and social proof. Target local fitness centers and health-centric micro-influencers.',
        teamOptions: [
          {
            action: 'Wellness Micro-Influencer Launch',
            impact: 'Reviews budget and target selection for local gym brand ambassador campaigns',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Regional Store Distribution Alignment',
            impact: 'Coordinates retail shipping matching the influencer campaign target regions',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Partner with premium fitness and organic food store chains for exclusive display rights.',
        moreInfo: 'Securing premium endcaps in health-focused chains places the product directly in front of high-intent buyers, justifying premium pricing.',
        teamOptions: [
          {
            action: 'Fitness Chain Shelf Slotting lease',
            impact: 'Leases premium endcap positions in organic store hubs',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Wholesale Tier Pricing Review',
            impact: 'Establishes high-margin wholesale prices for wellness partners',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'BrandB Chips Family Pack': {
    whyItIsPerforming: 'High brand loyalty, outstanding retail shelf placement, and stable distributor networks. Generates consistent and reliable contribution margins (42.0%).',
    deepDive: {
      supplyChain: 'Packaging raw materials are fully sourced from domestic suppliers, insulating production schedules from import delays. Buffer stock at distributor centers is stable at 21 days.',
      consumerInsights: 'Strong household brand equity, maintaining a solid 65% repeat buyer index. Displays consistent velocity across major regional supermarket lines.',
      financialPricing: 'Stable contribution margins of 42.0%. Promotional markdown overhead is low (only 12% of gross revenue), indicating strong organic shelf pull.'
    },
    recommendations: [
      {
        title: 'Develop co-marketing bundles with high-margin beverage items to increase cash velocity.',
        moreInfo: 'Combine chips with high-velocity beverages (e.g., Mango Fizz) in checkout lanes to boost overall transaction values and margins.',
        teamOptions: [
          {
            action: 'Chips-Beverage Cross-Promo Plan',
            impact: 'Designs cross-product bundle items and margins sharing models',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Bundle Discount Elasticity Review',
            impact: 'Establishes promotion discount caps and revenue shares',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Deploy regional packaging size optimization pilots to target smaller consumer groups.',
        moreInfo: 'Single-person households show high snack frequency. Launch smaller, premium grab-and-go packs in metro outlets.',
        teamOptions: [
          {
            action: 'Snack Packaging Size Optimization RFP',
            impact: 'Designs grab-and-go packaging specs and production timelines',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Urban Convenience Stores Slotting',
            impact: 'Coordinates shelf placements with boutique convenience stores',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Implement automated replenishment schedules in tier-1 supermarket chains.',
        moreInfo: 'Supermarket out-of-stock events lead to competitor brand substitution. Integrate inventory systems directly with key grocery chains.',
        teamOptions: [
          {
            action: 'Supermarket Automated Replenishment Review',
            impact: 'Establishes real-time inventory API sync with distributor ERPs',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Inventory Capital Buffer Optimization',
            impact: 'Minimizes locked capital in warehouse backup snack stock',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'Choco Wafers Multi-Pack': {
    whyItIsPerforming: 'Margin leakage due to aggressive discount campaigns (72% reliance) pushed by major hypermarket distributors, combined with low organic brand recall.',
    deepDive: {
      supplyChain: 'Finished goods inventory holds an excessively high 42 days of supply, leading to high storage fees. Packaging lines are currently underutilized.',
      consumerInsights: 'General consumer snacking habits are pivoting rapidly toward healthy, low-sugar organic snacks. Multipack wafers are perceived as low-value sweet items.',
      financialPricing: 'Net margins are heavily diluted due to the 72% discount reliance required by hypermarket accounts. Profitability is near zero without promotional funding.'
    },
    recommendations: [
      {
        title: 'Cap hypermarket promo discount rates at 40% starting immediately.',
        moreInfo: 'The current 72% discount dependency is bleeding margins. Implement strict floor prices to protect contribution margins.',
        teamOptions: [
          {
            action: 'Hypermarket Promo Floor Caps',
            impact: 'Establishes hard margin protections and minimum price structures',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Historical Trade Promotion Audit',
            impact: 'Audits trade promotion ROI and identifies leakage points',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Redesign wafer pack format from generic multi-packs to premium single-serve offerings.',
        moreInfo: 'Transitioning from cheap bulk bags to premium individual packs captures impulse buyers at double the unit margins.',
        teamOptions: [
          {
            action: 'Single-Serve Wafer Design Concepts',
            impact: 'Initiates design concepts and packaging materials specifications',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'NPD Budget & Unit P&L Review',
            impact: 'Secures NPD launch budget and estimates unit pricing structure',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Bundle with high-velocity snacks (e.g. Oat Cookies) to clear excess warehouse stock.',
        moreInfo: 'Clear lagging wafer inventory by bundling them as free additions to healthy Oat Cookies. Clears storage fees.',
        teamOptions: [
          {
            action: 'Warehouse Bundle Assembly Sync',
            impact: 'Coordinates bundle packaging assembly at regional depots',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Cross-Product conversion tracking',
            impact: 'Tracks user feedback and cross-product conversion velocity',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'Oat Cookies Healthy Baked': {
    whyItIsPerforming: 'Exceptional alignment with school lunchbox snack trends, high grocer shelf turnover speed, and 96% on-time delivery metrics.',
    deepDive: {
      supplyChain: 'Bakery oven lines are running at 94% load limits. Securing long-term oat crop pricing is vital to guarantee feedstock continuity.',
      consumerInsights: 'Strong growth in urban parent/child cohorts, who value clean ingredient labeling and organic baking. High repeat shelf rotation speed.',
      financialPricing: 'Strong price premium resilience. Contribution margins are stable and support healthy promotional funding without margin dilution.'
    },
    recommendations: [
      {
        title: 'Scale up regional manufacturing capacity by 20% to meet upcoming school re-opening demand.',
        moreInfo: 'High MoM velocity (+24.5%) indicates strong growth. Redirect baking oven capacity during peak morning production cycles.',
        teamOptions: [
          {
            action: 'Bakery Line Scheduling Review',
            impact: 'Plans factory shift updates to increase packing line slots',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Production Capacity CAPEX sync',
            impact: 'Approves CAPEX reserves for oven re-tooling and line expansion',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Lock in raw ingredient prices with primary agricultural suppliers.',
        moreInfo: 'Organic oat prices are volatile. Protect the product\'s margin by establishing fixed-price 12-month supply contracts.',
        teamOptions: [
          {
            action: 'Oat Supply Chain Contract RFP',
            impact: 'Secures agricultural supplier contracts with price protection terms',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Input Cost Inflation Impact Audit',
            impact: 'Audits P&L exposure to agricultural pricing index spikes',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Implement shelf endcap placements during key family shopping seasons.',
        moreInfo: 'Placing Oat Cookies on checkout endcaps increases checkout conversion, targeting grocery shoppers with kids.',
        teamOptions: [
          {
            action: 'Retail Endcap Placement Sync',
            impact: 'Secures Q3 supermarket endcap contracts across 120 prime outlets',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Seasonal Ad Asset Coordination',
            impact: 'Coordinates marketing assets and in-store banner displays',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'Herbal Shampoo Anti-Dandruff': {
    whyItIsPerforming: 'Premium brand positioning, strong retail pharmacy penetration, and high repeat consumer purchase stability driving 58.2% margins.',
    deepDive: {
      supplyChain: 'Bottle packaging molds are sourced domestically. Active botanical extracts are imported, adding 20 days of supply chain buffer complexity.',
      consumerInsights: 'Dermatologist-recommended status drives an exceptional 74% brand loyalty index. Repeat customer lifetime value is the highest in the portfolio.',
      financialPricing: 'Strong pricing power allows a 1.4x retail price premium index over competitor brands, supporting high 58.2% gross margins.'
    },
    recommendations: [
      {
        title: 'Develop hotel and tourist channel travel-size packs to capture boutique volume.',
        moreInfo: 'Leverage premium brand equity to secure high-margin guest-amenity distribution contracts with luxury hotel chains.',
        teamOptions: [
          {
            action: 'Boutique Bottle Design Concept',
            impact: 'Specs small volumes (50ml) and eco-friendly mini plastic design templates',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Hotel Wholesale Contract Review',
            impact: 'Formulates guest amenity supply agreements with hotel chains',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Expand shelf placement contracts to include tier-1 beauty retail chains.',
        moreInfo: 'Premium shampoos require specialized placement. Expanding into cosmetic chains moves it away from grocery price competition.',
        teamOptions: [
          {
            action: 'Cosmetics Shelf-Share Sync',
            impact: 'Coordinates dedicated premium shelf-space in national beauty stores',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Premium Pricing Floor Audit',
            impact: 'Protects wholesale pricing floors to prevent cosmetic channel conflict',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Deploy loyalty card subscription models for regular household purchase channels.',
        moreInfo: 'Increase user retention by offering automatic home delivery subscription cycles via key retail channels.',
        teamOptions: [
          {
            action: 'Subscription Platform Design Sync',
            impact: 'Designs customer incentives and digital checkout subscription loops',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Customer Lifetime Value (CLV) Audit',
            impact: 'Audits subscriber retention margins vs checkout acquisition costs',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'Foam Face Wash Sensitive 150ml': {
    whyItIsPerforming: 'High container pump sourcing costs and logistics bottlenecks in APAC/EMEA ports, leading to stockouts and losing share to local boutique brands.',
    deepDive: {
      supplyChain: 'Imported plastic container pump caps are subject to global port transit congestion. Sourcing container components overseas has increased unit packaging COGS by 18%.',
      consumerInsights: 'Customer acquisition cost (CAC) has increased due to heavy competition in the organic skincare segment. Perceived botanical value requires formula updates.',
      financialPricing: 'High unit shipping costs are diluting margin margins. Localizing container packaging supply is required to achieve target cost reductions.'
    },
    recommendations: [
      {
        title: 'Launch container bottle RFP to source alternate pump mechanisms locally.',
        moreInfo: 'Sourcing container pump caps from overseas is driving up COGS. Localizing manufacturing cuts logistics fees.',
        teamOptions: [
          {
            action: 'Local Pump Sourcing RFP',
            impact: 'Creates RFP specifications and issues to regional plastic injection moulders',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Packaging Component Cost Audit',
            impact: 'Audits container component bills to hit target 15% savings',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Accelerate organic stevia/herbal formulation updates to appeal to eco-conscious consumers.',
        moreInfo: 'Modern buyers prefer clean, natural skincare. Transitioning formulation packaging to eco-certified labels improves demand.',
        teamOptions: [
          {
            action: 'Eco-Certified Botanical formula',
            impact: 'Coordinates laboratory updates and organic certified ingredient reviews',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Botanical branding design sync',
            impact: 'Designs updated brand concepts and labels showing organic certification',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Divert marketing spend to micro-influencer campaigns targeting sensitive skin segments.',
        moreInfo: 'Niche skin segments require trust-based marketing. Micro-influencers drive higher engagement and trust than broad ads.',
        teamOptions: [
          {
            action: 'Micro-Influencer Marketing Review',
            impact: 'Audits engagement rates and selects target skin care influencers',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Regional Outlet Stock Placement',
            impact: 'Coordinates distributor stock limits in campaigns target cities',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'Hand Cream SPF Active': {
    whyItIsPerforming: 'Stunning success in seasonal digital influencer marketing campaigns, resulting in +45.1% MoM demand spike and 35% repeat purchase rate.',
    deepDive: {
      supplyChain: 'Tube-filling packaging machinery is running at 99% load capacity. Immediate expansion of shift schedules is required to prevent regional stockouts.',
      consumerInsights: 'Viral social media visibility has driven high customer acquisition across younger active wellness demographics. Repeat buy rates are strong at 35%.',
      financialPricing: 'High pricing retention, but capital allocation (CAPEX reallocations from mature lines) is needed to upgrade the tube packing machinery.'
    },
    recommendations: [
      {
        title: 'Divert Herbal Shampoo margin surplus to fund Hand Cream production line upgrades.',
        moreInfo: 'Reallocate capital from mature, cash-rich SKUs to high-growth, booming SKUs (+45.1% MoM) to avoid stockouts.',
        teamOptions: [
          {
            action: 'CAPEX Surplus Reallocation Sync',
            impact: 'Approves capital reallocation for hand cream assembly lines',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Production Capacity Upgrade RFP',
            impact: 'Creates specifications for high-speed tube filling machinery',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Establish priority freight corridors for key regional metro distributors.',
        moreInfo: 'High velocity is causing regional logistics gaps. Establish designated fast-freight shipping lanes to key hubs.',
        teamOptions: [
          {
            action: 'Priority Metro Freight Contracts',
            impact: 'Secures air/express shipping slots to prevent out-of-stocks',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Regional inventory level check',
            impact: 'Checks store inventories daily to detect local stockouts early',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Launch seasonal gift bundle packs ahead of peak winter/summer cycles.',
        moreInfo: 'SPF creams sell extremely well in summer and winter. Create seasonal bundles with other personal care items.',
        teamOptions: [
          {
            action: 'Gift Set Bundle Pricing Index',
            impact: 'Determines bundle pricing discounts and channel margins sharing',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Gift Set Design Packaging Sync',
            impact: 'Designs promotional box concepts and packaging materials',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'Dish Soap Lemon 1L': {
    whyItIsPerforming: 'High household distributor penetration and stable retail shelf sales velocity. Act as a critical volume stabilizer for the category.',
    deepDive: {
      supplyChain: 'Bulk plastic packaging supply lines are running smoothly. High turnover velocity at distribution hubs prevents buffer accumulation.',
      consumerInsights: 'Highly recurring utility purchase pattern. High consumer brand habituation and stable checkout placement.',
      financialPricing: 'Modest gross margins (36.8%), but high total volume velocity drives strong cumulative net profitability contribution.'
    },
    recommendations: [
      {
        title: 'Introduce eco-refill concentrate pouch formats to boost unit gross margins.',
        moreInfo: 'Shipping plastic bottles is expensive. Transitioning to lightweight concentrate refill pouches reduces package weight and increases margins.',
        teamOptions: [
          {
            action: 'Refill Pouch NPD Styling Specs',
            impact: 'Vets eco-materials durability and concentrate recipe stability',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Logistics Savings & P&L review',
            impact: 'Evaluates freight bill improvements on dry/pouch configurations',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Optimize shipping container volumes to reduce freight overheads.',
        moreInfo: 'Maximize ocean freight container layouts to minimize empty space and lower shipping unit costs.',
        teamOptions: [
          {
            action: 'Container Layout Optimization Audit',
            impact: 'Re-designs case packs layout to increase box count per pallet',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Distribution center shipping sync',
            impact: 'Audits pallet dispatch files to discover warehouse bottlenecks',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Cross-sell with bundle packs of Dishwasher Pods.',
        moreInfo: 'Pair everyday manual dishwash liquid with premium automated pod products to cross-sell household buyers.',
        teamOptions: [
          {
            action: 'Dishwasher Pods Cross-Promo Sync',
            impact: 'Vets cross-product bundles branding and shelf placements',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Dishwasher Bundle discount analysis',
            impact: 'Determines margin splits and promotional discount limits',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'Fabric Softener Premium': {
    whyItIsPerforming: 'Port cargo delays on key raw chemical imports combined with high packaging shipping costs, causing frequent out-of-stock events (55% promo dependency).',
    deepDive: {
      supplyChain: 'Imported chemical raw materials are subject to maritime delays, causing supermarket out-of-stock events to rise by 14% over Q2.',
      consumerInsights: 'Brand switching behavior is exceptionally high when fabric softener products are out of stock, indicating weak brand-switching barriers.',
      financialPricing: 'Air-freight shipping expedites used to recover stockouts have diluted Q3 contribution margins by an estimated 7.5%.'
    },
    recommendations: [
      {
        title: 'Shift production to concentrated waterless fabric sheets to cut freight shipping costs by 70%.',
        moreInfo: 'Water makes up 90% of fabric softener weight. Transitioning to dry sheets slashes container shipping costs.',
        teamOptions: [
          {
            action: 'Waterless Softener Sheets NPD',
            impact: 'Prototypes dry detergent sheet formulas and recyclable boxes',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Dry Sheets COGS impact sync',
            impact: 'Projects P&L impact and shipping cost reductions',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Establish local storage depots near key distribution centers to maintain supply buffers.',
        moreInfo: 'Port delays cause stockouts. Establish localized buffer stock warehouses to cover shipping disruptions.',
        teamOptions: [
          {
            action: 'Regional Buffer Storage Lease',
            impact: 'Leases storage slots near major inland supermarket centers',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Safety Stock Inventory sync',
            impact: 'Coordinates weekly stock levels audits to warn of port blocks',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Establish priority slotting contracts with local hypermarkets to avoid stockout penalty fees.',
        moreInfo: 'Hypermarket contracts penalize stockouts. Secure priority shipping tiers to keep shelves filled.',
        teamOptions: [
          {
            action: 'Hypermarkets out-of-stock sync',
            impact: 'Negotiates out-of-stock fee waiver clauses with distributors',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Penalty Exposure audit',
            impact: 'Assesses financial risk exposure to distributor SLA penalty charges',
            contactName: 'Amit Mehta',
            contactTitle: 'Product Pricing Director',
            email: 'amit.mehta@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  },
  'Laundry Pods Concentrated': {
    whyItIsPerforming: 'Rapid consumer lifestyle pivot from powder laundry detergent to premium eco-friendly laundry pods, generating massive MoM scaling (+38%).',
    deepDive: {
      supplyChain: 'Factory packing machinery is running at 98% capacity load. CAPEX redirection from declining powder divisions is required to expand the pod assembly line.',
      consumerInsights: 'Surging convenience lifestyle trends are driving high repeat purchase conversion as consumers transition away from traditional detergents.',
      financialPricing: 'High pricing premium elasticity captures a substantial gross margin buffer, supporting extensive NPD and packaging scaling.'
    },
    recommendations: [
      {
        title: 'Redirect factory floor lines from declining traditional powders to Laundry Pod production.',
        moreInfo: 'Consumer demand is moving rapidly to pods. Redirect packing machinery to high-margin, booming pod lanes.',
        teamOptions: [
          {
            action: 'Factory Packing Line re-tooling',
            impact: 'Schedules machine maintenance shut downs to install pod packing slots',
            contactName: 'Amit Verma',
            contactTitle: 'NPD Product Lead',
            email: 'amit.verma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Line Re-tooling CAPEX allocation',
            impact: 'Reallocates packaging machinery CAPEX reserves to pod scaling',
            contactName: 'Ananya Sen',
            contactTitle: 'Director of Portfolio Finance',
            email: 'ananya.sen@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Establish e-commerce subscription refill cycles for home delivery.',
        moreInfo: 'Laundry detergent is a highly recurring household purchase. Offer subscription refills to lock in long-term customer lifetime value.',
        teamOptions: [
          {
            action: 'E-commerce subscription portal NPD',
            impact: 'Develops checkout portal designs and automated recurring pricing models',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Last-Mile Delivery Logistics Review',
            impact: 'Negotiates priority delivery shipping rates with postal partners',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          }
        ]
      },
      {
        title: 'Launch bundle placement campaigns with washing machine manufacturers.',
        moreInfo: 'Include free sample pod packs inside new washing machines to capture high-intent new buyers.',
        teamOptions: [
          {
            action: 'OEM Appliance Brand Alliance',
            impact: 'Negotiates guest inclusion contracts inside new machine deliveries',
            contactName: 'Karan Johar',
            contactTitle: 'Director of Commercial Portfolio',
            email: 'karan.johar@aciesglobal.com',
            draftBody: ''
          },
          {
            action: 'Sample box branding sync',
            impact: 'Coordinates mini product designs and checkout code cards',
            contactName: 'Priya Sharma',
            contactTitle: 'Lead Product Manager',
            email: 'priya.sharma@aciesglobal.com',
            draftBody: ''
          }
        ]
      }
    ]
  }
};
