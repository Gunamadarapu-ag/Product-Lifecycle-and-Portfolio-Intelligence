export const parseTrendData = (headers: string[], rows: string[][]) => {
  try {
    if (!headers || !rows || rows.length === 0) return null;
    
    // Check which format it is
    const hasTarget = headers.some(h => h.toLowerCase().includes('target'));
    const isYoY = headers.some(h => h.toLowerCase().includes('2022')) && headers.some(h => h.toLowerCase().includes('2023'));
    
    return rows.map(row => {
      const label = row[0];
      
      // Parse main value
      let value = 0;
      if (row[1]) {
        // Strip out non-numeric characters except dots and minus
        const cleanedVal = row[1].replace(/[^\d.-]/g, '');
        value = parseFloat(cleanedVal) || 0;
      }
      
      let targetValue = 0;
      if (hasTarget && row[3]) {
        const cleanedTarget = row[3].replace(/[^\d.-]/g, '');
        targetValue = parseFloat(cleanedTarget) || 0;
      }
      
      let prevValue = 0;
      if (isYoY && row[2]) {
        const cleanedPrev = row[2].replace(/[^\d.-]/g, '');
        // For YoY, row[1] is 2022 (prev) and row[2] is 2023 (current)
        prevValue = value; // row[1]
        value = parseFloat(cleanedPrev) || 0; // row[2]
      }
      
      return {
        name: label,
        value,
        target: targetValue,
        prev: prevValue
      };
    });
  } catch (e) {
    console.error("Failed to parse trend data", e);
    return null;
  }
};

/**
 * Flags metrics that measure a risk rather than a result, so the drawer can
 * colour them differently.
 *
 * This used to label everything else 'OPTIMAL / ON-TRACK' — a performance claim
 * made without comparing the metric to any target (TODO.md O17). It now returns
 * null for those, and the drawer shows no badge, rather than asserting a verdict
 * nothing computed. The surviving label is categorical ("this measures a risk"),
 * not a statement that risk is currently elevated.
 */
export const getMetricStatus = (metric: string): { label: string } | null => {
  const riskMetrics = ['Critical Alerts', 'Long-Tail SKU Burden', 'Rationalize Candidates', 'Revenue Tail Risk', 'Peak Stockout Freq', 'Total Active Signals', 'Long-Tail Burden Ratio', 'Cannibalization Risk Index', 'Total Stockouts'];
  return riskMetrics.includes(metric) ? { label: 'RISK METRIC' } : null;
};
