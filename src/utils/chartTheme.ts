/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Canonical Recharts theming tokens.
 *
 * Recharts styles its SVG through props rather than CSS classes, so the
 * `dark:` variant cannot reach it and the palette has to be resolved in JS.
 * That is why `isDarkMode` is threaded down to chart components — it is not
 * redundant with the `.dark` class, it covers the gap the class cannot.
 *
 * This module replaces ~14 hand-copied blocks that had drifted apart
 * (tooltip backgrounds of #1f1f1f, #1e1e28, #09090b and #1a1a1a; tooltip
 * text of #000, #1f2937 and #18181b). The dominant value of each pair won.
 */

import type { CSSProperties } from 'react';

export interface ChartTheme {
  /** CartesianGrid / PolarGrid stroke. */
  gridStroke: string;
  /** Axis tick label fill. */
  tickColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  /**
   * Ready-made `contentStyle` for `<Tooltip>`. Pass a font size when a chart
   * needs something other than the 9px default.
   */
  tooltipContentStyle: (fontSize?: string) => CSSProperties;
  /** `cursor` fill for bar/area hover bands. */
  cursorFill: string;
}

export function getChartTheme(isDarkMode: boolean): ChartTheme {
  const tooltipBg = isDarkMode ? '#1f1f1f' : '#ffffff';
  const tooltipBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipText = isDarkMode ? '#ffffff' : '#000000';

  return {
    gridStroke: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    tickColor: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
    tooltipBg,
    tooltipBorder,
    tooltipText,
    tooltipContentStyle: (fontSize = '9px') => ({
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      color: tooltipText,
      fontSize,
    }),
    cursorFill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  };
}
