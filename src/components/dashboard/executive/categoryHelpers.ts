/**
 * Message templates and trend series for the category detail modals.
 *
 * Extracted from CategoryPerformanceDetailsModal.tsx (1,790 lines).
 */


export const getFormalEmail = (name: string, role: string, action: string, impact: string, title: string) => {
  const firstName = name.split(' ')[0];
  const senderRole = 
    role === 'Product Manager' ? 'Product Manager' : 
    role === 'Pricing and Margin Partner' ? 'Pricing & Margin Partner' : 
    'VP of Product Management';
  return `Dear ${firstName},\n\nI hope this email finds you well.\n\nI would like to schedule a formal alignment meeting regarding our action plan for "${title}". Specifically, I want to sync on the "${action}" initiative to achieve the following objective: ${impact}.\n\nPlease let me know your availability for a 30-minute sync this week.\n\nBest regards,\n${senderRole}`;
};

export const getCasualMessage = (name: string, action: string) => {
  const firstName = name.split(' ')[0];
  return `Hey ${firstName}, quick question – do you have 10 mins this week to sync on "${action}"? Want to align on the next steps. Thanks!`;
};

export const generateTrendData = (skuName: string, type: 'good' | 'poor' | 'booming') => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  let baseVal = 10;
  if (skuName.includes('Mango')) baseVal = 40;
  else if (skuName.includes('Eco-Pack')) baseVal = 15;
  else if (skuName.includes('Energy')) baseVal = 5;
  else if (skuName.includes('Chips')) baseVal = 30;
  else if (skuName.includes('Wafers')) baseVal = 10;
  else if (skuName.includes('Cookies')) baseVal = 12;
  else if (skuName.includes('Shampoo')) baseVal = 25;
  else if (skuName.includes('Face Wash')) baseVal = 8;
  else if (skuName.includes('Hand Cream')) baseVal = 9;
  else if (skuName.includes('Soap')) baseVal = 20;
  else if (skuName.includes('Softener')) baseVal = 6;
  else if (skuName.includes('Pods')) baseVal = 14;

  return months.map((month, idx) => {
    let multiplier = 1.0;
    if (type === 'good') {
      multiplier = 1.0 + (idx * 0.03);
    } else if (type === 'poor') {
      multiplier = 1.0 - (idx * 0.04);
    } else {
      multiplier = 1.0 + (idx * 0.08);
    }
    const noise = (Math.sin(idx) * 0.02);
    const value = parseFloat((baseVal * (multiplier + noise)).toFixed(1));
    return { month, Revenue: value };
  });
};
