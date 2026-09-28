/**
 * Explorer rows for the SKU drill-down grid.
 *
 * Extracted from DemoTab.tsx (1,233 lines).
 */


export const EXPLORER_ROWS = (() => {
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
