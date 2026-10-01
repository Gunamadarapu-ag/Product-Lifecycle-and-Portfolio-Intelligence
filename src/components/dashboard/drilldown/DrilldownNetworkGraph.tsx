/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { REGIONS_CONFIG } from '../../../constants/regions';

interface DrilldownNetworkGraphProps {
  selectedRegion: string | null;
  onRegionSelect: (region: string) => void;
  isDarkMode: boolean;
}

// Positioned in a 600×280 viewBox with centre at (300, 140). `key` matches
// REGIONS_CONFIG exactly (used for state/lookups); `label` is the short
// on-node text, since the real region names are too long for that spot.
const NODES = [
  { key: 'Western Europe',  label: 'WEST',    x:  80, y:  80, qx: 190, qy:  80 },
  { key: 'Central Europe',  label: 'CENTRAL', x: 520, y:  80, qx: 410, qy:  80 },
  { key: 'Southern Europe', label: 'SOUTH',   x: 300, y: 230, qx: 300, qy: 185 },
] as const;

const CX = 300;  // Centre HQ x
const CY = 140;  // Centre HQ y
const R_OUTER = 40;  // outer pulse radius for HQ
const R_HQ    = 22;  // HQ node radius
const R_NODE  = 18;  // region node radius
const R_DOT   = 6;   // inner white dot radius

export const DrilldownNetworkGraph: React.FC<DrilldownNetworkGraphProps> = ({
  selectedRegion,
  onRegionSelect,
  isDarkMode,
}) => {
  // Track hover via React state — avoids CSS-hover jitter on SVG elements
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const textColour = isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)';
  const subtextColour = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const railColour = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded shadow-sm p-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          🌐 Supply Chain Network
        </span>
        <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Click a node to drill down
        </span>
      </div>

      <div className="w-full bg-zinc-50/60 dark:bg-zinc-950/30 border border-black/5 dark:border-white/5 rounded-xl overflow-hidden">
        {/*
          viewBox 600×280 rendered at full width, fixed height 260.
          All coordinates live in the viewBox space — no CSS transforms,
          so no hover feedback loop / jitter.
        */}
        <svg
          width="100%"
          height="260"
          viewBox="0 0 600 280"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="ng-hq-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="ng-node-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
            <filter id="ng-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#8b5cf6" floodOpacity="0.55" />
            </filter>
            <filter id="ng-gold" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.7" />
            </filter>
            <style>{`
              @keyframes ng-dash {
                to { stroke-dashoffset: -24; }
              }
              .ng-flow {
                stroke-dasharray: 8 5;
                animation: ng-dash 1.4s linear infinite;
              }
              @keyframes ng-pulse {
                0%, 100% { opacity: 0.12; r: ${R_OUTER}; }
                50%       { opacity: 0.22; r: ${R_OUTER + 6}; }
              }
              .ng-pulse { animation: ng-pulse 2.4s ease-in-out infinite; }
            `}</style>
          </defs>

          {/* ── Connection rails + active flows ── */}
          {NODES.map(node => {
            const isActive = selectedRegion === node.key;
            const d = `M ${CX} ${CY} Q ${node.qx} ${node.qy} ${node.x} ${node.y}`;
            return (
              <g key={`rail-${node.key}`} style={{ pointerEvents: 'none' }}>
                {/* Background rail */}
                <path d={d} fill="none" stroke={railColour} strokeWidth="5" strokeLinecap="round" />
                {/* Active: purple glow layer */}
                {isActive && (
                  <path d={d} fill="none" stroke="#8b5cf6" strokeWidth="4"
                    filter="url(#ng-glow)" opacity="0.8" strokeLinecap="round" />
                )}
                {/* Active: animated amber dash */}
                {isActive && (
                  <path d={d} fill="none" stroke="#f59e0b" strokeWidth="2.5"
                    className="ng-flow" strokeLinecap="round" />
                )}
              </g>
            );
          })}

          {/* ── Central HQ node ── */}
          <g transform={`translate(${CX}, ${CY})`} style={{ pointerEvents: 'none' }}>
            <circle className="ng-pulse" r={R_OUTER} fill="#8b5cf6" />
            <circle r={R_HQ + 6} fill="url(#ng-hq-grad)" opacity="0.18" />
            <circle r={R_HQ}     fill="url(#ng-hq-grad)" filter="url(#ng-glow)" />
            <circle r={R_DOT}    fill="#fff" />
            <text y={R_HQ + 16} textAnchor="middle"
              style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2.5 }}
              fill={subtextColour}>
              Global HQ
            </text>
          </g>

          {/* ── Regional nodes ── */}
          {NODES.map(node => {
            const isSelected = selectedRegion === node.key;
            const isHovered  = hoveredNode === node.key;
            const highlight  = isSelected || isHovered;

            const nodeRadius   = isSelected ? R_NODE + 2 : R_NODE;
            const labelColour  = isSelected ? '#f59e0b' : (isHovered ? '#a78bfa' : textColour);
            const ringStroke   = isSelected ? '#f59e0b' : (isHovered ? '#a78bfa' : 'transparent');
            const ringFilter   = isSelected ? 'url(#ng-gold)' : 'none';

            return (
              <g
                key={`node-${node.key}`}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onRegionSelect(node.key)}
                onMouseEnter={() => setHoveredNode(node.key)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label={`Select ${node.key} region`}
              >
                {/* Hit area (invisible, larger than node) */}
                <circle r={R_NODE + 16} fill="transparent" />

                {/* Outer ring (shown on select / hover) */}
                <circle
                  r={nodeRadius + 10}
                  fill="none"
                  stroke={ringStroke}
                  strokeWidth="2"
                  filter={ringFilter}
                  opacity={highlight ? 1 : 0}
                  style={{ transition: 'opacity 0.2s ease' }}
                />

                {/* Main filled node */}
                <circle
                  r={nodeRadius}
                  fill={isSelected ? '#f59e0b' : (isHovered ? '#6d28d9' : 'url(#ng-node-grad)')}
                  opacity={0.92}
                  style={{ transition: 'r 0.2s ease, fill 0.2s ease' }}
                />
                <circle r={R_DOT} fill="#fff" opacity="0.92" />

                {/* Region abbreviation label (above) */}
                <text
                  y={-(nodeRadius + 14)}
                  textAnchor="middle"
                  style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, transition: 'fill 0.2s ease' }}
                  fill={labelColour}
                >
                  {node.label}
                </text>

                {/* Full region name */}
                <text
                  y={-(nodeRadius + 1)}
                  textAnchor="middle"
                  style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 1 }}
                  fill={isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.38)'}
                >
                  {REGIONS_CONFIG[node.key]?.name}
                </text>

                {/* Plant sub-label (below) */}
                <text
                  y={nodeRadius + 18}
                  textAnchor="middle"
                  style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}
                  fill={isDarkMode ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)'}
                >
                  {REGIONS_CONFIG[node.key]?.plant}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
