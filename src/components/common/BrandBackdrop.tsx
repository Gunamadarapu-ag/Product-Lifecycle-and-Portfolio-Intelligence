import React from 'react';

/**
 * Shared low-opacity backdrop for the pre-dashboard screens (Login, Welcome
 * Gate): a product-lifecycle S-curve, portfolio growth bars, and diamond
 * markers echoing the logo's cube facets — so the background reads as this
 * product, not a generic "AI network" pattern.
 */
export const BrandBackdrop: React.FC = () => (
  <div className="absolute inset-0 opacity-[0.05] pointer-events-none overflow-hidden">
    <svg
      className="w-full h-full"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Portfolio growth bars */}
      <g stroke="white" strokeWidth="1" fill="none">
        <rect x="80" y="620" width="26" height="80" />
        <rect x="120" y="580" width="26" height="120" />
        <rect x="160" y="530" width="26" height="170" />
        <rect x="200" y="560" width="26" height="140" />
        <rect x="240" y="480" width="26" height="220" />
        <rect x="280" y="430" width="26" height="270" />
      </g>

      {/* Product lifecycle curve: introduction -> growth -> maturity -> decline */}
      <path
        d="M 60 700 C 300 700, 340 250, 620 200 C 850 160, 950 160, 1120 260 C 1280 350, 1320 500, 1400 620"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Stage markers, echoing the logo's cube facets */}
      <g stroke="white" strokeWidth="1" fill="none">
        <rect x="52" y="692" width="16" height="16" transform="rotate(45 60 700)" />
        <rect x="612" y="192" width="16" height="16" transform="rotate(45 620 200)" />
        <rect x="1112" y="252" width="16" height="16" transform="rotate(45 1120 260)" />
        <rect x="1392" y="612" width="16" height="16" transform="rotate(45 1400 620)" />
      </g>

      {/* Connective nodes at each stage */}
      <g fill="white">
        <circle cx="60" cy="700" r="3" />
        <circle cx="620" cy="200" r="3" />
        <circle cx="1120" cy="260" r="3" />
        <circle cx="1400" cy="620" r="3" />
      </g>
    </svg>
  </div>
);
