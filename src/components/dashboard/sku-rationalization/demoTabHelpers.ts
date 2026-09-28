/**
 * Root-cause, rationalisation reason and simulation strategy lookups.
 *
 * Extracted from DemoTab.tsx (1,233 lines).
 */


export const getRcaDetails = (sku: string, factor: string) => {
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

export const getRationalisationReason = (factor: string) => {
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

export const getSimulationStrategy = (action: string) => {
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
