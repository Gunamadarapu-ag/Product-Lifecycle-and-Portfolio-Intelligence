/**
 * Explainer lookups for regional alerts: why an alert fired and how it is rectified.
 *
 * Extracted from the original 3,982-line SignalsBoard.tsx.
 */
import { VPSignal } from './signalsData';

export const getAlertExplainer = (id: string) => {
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

export const getTriggerVal = (sig: VPSignal) => {
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

export const getRectificationVal = (sig: VPSignal) => {
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
