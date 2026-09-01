/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LAUNCH_PRODUCTS } from '../../../constants/data';

interface TooltipData {
  dimension: string;
  score: number;
  status: string;
  finding: string;
  x: number;
  y: number;
}

interface LaunchSpiderChartProps {
  selectedProductId: string;
  onDimensionClick?: (dim: string) => void;
}

// ─── Color Palette constants (Yellow & Black corporate styling) ────────────
const COLOR_YELLOW = '#facc15'; // acies-yellow bright
const COLOR_AMBER = '#d97706';  // warm amber for intermediate status
const COLOR_BLACK = '#1a1a1a';  // black/charcoal for base/grid
const COLOR_DARK_GRAY = '#2d2d2d'; // darker charcoal for card contrast
const GRID_COLOR = 'rgba(250, 204, 21, 0.1)'; // faint yellow grid

const dimensionLabels: Record<string, string> = {
  'Market': 'Market Fit',
  'Supply Chain': 'Supply Chain',
  'Channel': 'Channel Cover',
  'Pricing': 'Pricing Terms',
  'Operations': 'Operations',
};

export const LaunchSpiderChart: React.FC<LaunchSpiderChartProps> = ({ selectedProductId, onDimensionClick }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const product = LAUNCH_PRODUCTS.find(p => p.id === selectedProductId) || LAUNCH_PRODUCTS[0];
  const dimensions = ['Market', 'Supply Chain', 'Channel', 'Pricing', 'Operations'];
  const n = dimensions.length;

  // Chart dimensions & margins
  const width = 320;
  const height = 260;
  const margin = { left: 45, right: 25, top: 35, bottom: 40 };

  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // Build data points
  const dataPoints = dimensions.map((dim, i) => {
    const metric = product.readiness.find(r => r.dimension === dim);
    const score = metric?.readinessScore ?? 0;
    
    // Map X: distributed equally across plot width
    const x = margin.left + (i * plotW) / (n - 1);
    // Map Y: 100% is at top (margin.top), 0% is at bottom (height - margin.bottom)
    const y = margin.top + (1 - score / 100) * plotH;

    return {
      dim,
      score,
      status: metric?.status ?? 'Unknown',
      finding: metric?.keyFindings?.[0] ?? 'No data available',
      x,
      y,
    };
  });

  // RAG status mapping using yellow-and-black theme
  const getPillarColor = (score: number) => {
    if (score >= 85) return COLOR_YELLOW; // On Track -> bright yellow
    if (score >= 70) return COLOR_AMBER;  // At Risk -> rich amber/gold
    return COLOR_BLACK; // Critical -> high-contrast black/charcoal
  };

  // Horizontal Grid levels (0%, 25%, 50%, 75%, 100%)
  const yLevels = [0, 25, 50, 75, 100];

  // Draw the SVG path for the line
  const linePathD = dataPoints.map((dp, i) => `${i === 0 ? 'M' : 'L'} ${dp.x} ${dp.y}`).join(' ');

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[340px]"
        style={{ overflow: 'visible' }}
      >
        {/* Glow Filters for Neon Visual Appeal */}
        <defs>
          <filter id="yellow-line-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Y-Axis Grid Lines */}
        {yLevels.map(lvl => {
          const y = margin.top + (1 - lvl / 100) * plotH;
          return (
            <g key={lvl} className="opacity-70">
              <line
                x1={margin.left}
                y1={y}
                x2={width - margin.right}
                y2={y}
                stroke={GRID_COLOR}
                strokeWidth={1}
                strokeDasharray="2,3"
              />
              <text
                x={margin.left - 8}
                y={y + 3}
                textAnchor="end"
                fontSize={8}
                fontWeight="700"
                fill={COLOR_YELLOW}
                opacity={0.6}
                className="font-mono"
              >
                {lvl}%
              </text>
            </g>
          );
        })}

        {/* Glowing Connected Line */}
        <path
          d={linePathD}
          fill="none"
          stroke={COLOR_YELLOW}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#yellow-line-glow)"
          style={{ transition: 'd 0.5s ease-in-out' }}
        />

        {/* Semi-transparent filled area under the line */}
        <path
          d={`${linePathD} L ${dataPoints[n-1].x} ${height - margin.bottom} L ${dataPoints[0].x} ${height - margin.bottom} Z`}
          fill={`rgba(250, 204, 21, 0.04)`}
          stroke="none"
          style={{ transition: 'd 0.5s ease-in-out' }}
        />

        {/* Data Markers (Clickable circles) */}
        {dataPoints.map((dp, i) => {
          const dotColor = getPillarColor(dp.score);
          const isCritical = dp.score < 70;
          return (
            <g key={dp.dim}>
              {/* Invisible interactive larger hover region */}
              <circle
                cx={dp.x}
                cy={dp.y}
                r={16}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({
                  dimension: dp.dim,
                  score: dp.score,
                  status: dp.status,
                  finding: dp.finding,
                  x: dp.x,
                  y: dp.y
                })}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => onDimensionClick?.(dp.dim)}
              />

              {/* Glowing Outer Dot Ring */}
              <circle
                cx={dp.x}
                cy={dp.y}
                r={7}
                fill={isCritical ? COLOR_BLACK : dotColor}
                stroke={isCritical ? '#ef4444' : '#fff'}
                strokeWidth={2}
                style={{
                  pointerEvents: 'none',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))'
                }}
              />

              {/* Score Value labels placed slightly above/below markers */}
              <text
                x={dp.x}
                y={dp.y - 12}
                textAnchor="middle"
                fontSize={8.5}
                fontWeight="800"
                fill={isCritical ? '#ef4444' : COLOR_YELLOW}
                className="font-mono select-none pointer-events-none"
              >
                {dp.score}%
              </text>
            </g>
          );
        })}

        {/* X-Axis Labels (Dimension Names) */}
        {dataPoints.map(dp => (
          <text
            key={dp.dim}
            x={dp.x}
            y={height - margin.bottom + 18}
            textAnchor="middle"
            fontSize={8}
            fontWeight="bold"
            fill="currentColor"
            opacity={0.65}
            className="select-none pointer-events-none"
          >
            {dimensionLabels[dp.dim] ?? dp.dim}
          </text>
        ))}

        {/* Premium Tooltip overlay inside the SVG */}
        {tooltip && (() => {
          const tipW = 140;
          const tipH = 75;
          let tx = tooltip.x - tipW / 2;
          let ty = tooltip.y - tipH - 20;

          // Constraints to keep tooltip within viewBox boundaries
          if (tx < 5) tx = 5;
          if (tx + tipW > width - 5) tx = width - tipW - 5;
          if (ty < 5) ty = tooltip.y + 20; // Flip below if too high

          const statusColor = tooltip.score >= 85 ? COLOR_YELLOW : tooltip.score >= 70 ? COLOR_AMBER : '#ef4444';
          const isCrit = tooltip.score < 70;

          return (
            <g style={{ pointerEvents: 'none' }} className="filter drop-shadow-lg">
              {/* Outer Card with Yellow border */}
              <rect
                x={tx}
                y={ty}
                width={tipW}
                height={tipH}
                rx={5}
                fill={COLOR_BLACK}
                stroke={isCrit ? '#ef4444' : COLOR_YELLOW}
                strokeWidth={1.5}
                opacity={0.97}
              />
              <text x={tx + 10} y={ty + 18} fontSize={9} fontWeight="bold" fill="#fff">
                {tooltip.dimension}
              </text>
              <text x={tx + 10} y={ty + 30} fontSize={7.5} fill={statusColor} fontWeight="bold">
                {tooltip.status} · {tooltip.score}%
              </text>
              
              {/* Slicing findings text to fit cleanly inside tooltip */}
              <foreignObject x={tx + 8} y={ty + 36} width={tipW - 16} height={34}>
                {/* No xmlns needed: React switches back to the HTML namespace
                    for <foreignObject> children, so the attribute was inert. */}
                <div
                  style={{
                    fontSize: '6.5px', 
                    color: 'rgba(255,255,255,0.7)', 
                    lineHeight: '1.3', 
                    fontFamily: 'Roboto, sans-serif' 
                  }}
                >
                  {tooltip.finding.length > 80 ? tooltip.finding.slice(0, 77) + '...' : tooltip.finding}
                </div>
              </foreignObject>
            </g>
          );
        })()}
      </svg>

      {/* Legend below the Line Chart */}
      <div className="flex items-center gap-4 mt-3">
        {[
          { label: 'On Track', color: COLOR_YELLOW },
          { label: 'At Risk', color: COLOR_AMBER },
          { label: 'Critical', color: COLOR_BLACK },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full border border-white/20" 
              style={{ backgroundColor: l.color }} 
            />
            <span className="text-[8px] font-bold uppercase opacity-60 tracking-wider">
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
