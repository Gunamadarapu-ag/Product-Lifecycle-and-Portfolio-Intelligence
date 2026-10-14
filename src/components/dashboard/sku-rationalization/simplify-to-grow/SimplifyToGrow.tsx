/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Simplify to Grow — Bain & Company "Beyond the Tail" Framework Implementation
 * Refactored to follow SOLID principles (Single Responsibility, Decoupling).
 */

import React from 'react';
import { Role } from '../../../../types/dashboard';
import { useSimplifyToGrowState } from './useSimplifyToGrowState';
import { FlywheelHero } from './components/FlywheelHero';
import { PillarsGrid } from './components/PillarsGrid';
import { IppvLeagueTable } from './components/IppvLeagueTable';
import { ComplexityPl } from './components/ComplexityPl';
import { ShelfProductivity } from './components/ShelfProductivity';
import { SkuFocusDrawer } from './components/SkuFocusDrawer';
import { StrategicActionPlan } from './StrategicActionPlan';

import { TimelineRange } from '../../../../utils/timeframe';

interface Props {
  role: Role;
  isDarkMode: boolean;
  setActiveTab: (tab: number) => void;
  selectedLocation?: string;
  timelineRange: TimelineRange;
}

export const SimplifyToGrow: React.FC<Props> = ({ isDarkMode, setActiveTab, selectedLocation, timelineRange }) => {
  const state = useSimplifyToGrowState(setActiveTab, selectedLocation, timelineRange);

  const scoreColor = state.overallScore >= 70 ? 'text-emerald-500' : state.overallScore >= 50 ? 'text-amber-500' : 'text-red-500';
  const scoreRingColor = state.overallScore >= 70 ? '#10b981' : state.overallScore >= 50 ? '#f59e0b' : '#ef4444';
  const maxIppv = 100;

  return (
    <div className="space-y-4 pb-8 text-zinc-800 dark:text-white">
      {/* ── Hero Banner ── */}
      <FlywheelHero
        pillars={state.pillars}
        overallScore={state.overallScore}
        scoreColor={scoreColor}
        scoreRingColor={scoreRingColor}
      />

      {/* ── ① Flywheel Pillar Scores ── */}
      <PillarsGrid
        pillars={state.pillars}
        expandedPillar={state.expandedPillar}
        setExpandedPillar={state.setExpandedPillar}
        skus={state.skus}
        onNavigate={state.handleNavigate}
        onSkuClick={state.handleSkuClick}
      />

      {/* ── ② IPPV League Table ── */}
      <IppvLeagueTable
        radarData={state.radarData}
        filteredSkus={state.filteredSkus}
        skus={state.skus}
        classFilter={state.classFilter}
        setClassFilter={state.setClassFilter}
        ippvSort={state.ippvSort}
        setIppvSort={state.setIppvSort}
        selectedSku={state.selectedSku}
        handleSkuClick={state.handleSkuClick}
        handleNavigate={state.handleNavigate}
        setSelectedCategory={state.setSelectedCategory}
        isDarkMode={isDarkMode}
        goodCount={state.goodCount}
        badCount={state.badCount}
        neutralCount={state.neutralCount}
      />

      {/* ── ③ Complexity P&L ── */}
      <ComplexityPl
        categories={state.categories}
        skus={state.skus}
        selectedCategory={state.selectedCategory}
        setSelectedCategory={state.setSelectedCategory}
        costDriverFilter={state.costDriverFilter}
        setCostDriverFilter={state.setCostDriverFilter}
        handleSkuClick={state.handleSkuClick}
        isDarkMode={isDarkMode}
      />

      {/* ── ④ Availability-Adjusted Value ── */}
      <ShelfProductivity
        categories={state.categories}
        selectedCategory={state.selectedCategory}
        setSelectedCategory={state.setSelectedCategory}
        handleNavigate={state.handleNavigate}
        isDarkMode={isDarkMode}
      />

      {/* ── ⑤ Strategic Action Plan ── */}
      <StrategicActionPlan
        skus={state.skus}
        isDarkMode={isDarkMode}
        onNavigate={state.handleNavigate}
        onSkuClick={state.handleSkuClick}
      />

      {/* ── Footer ── */}
      <div className="text-center pt-4 border-t border-black/5 dark:border-white/5">
        <p className="text-[7.5px] text-zinc-400 dark:text-zinc-600 font-medium">
          Framework sourced from Bain &amp; Company — "Beyond the Tail: How a Strategic Approach to Simplification Fuels Growth" ·{' '}
          <a href="https://www.bain.com/how-we-help/beyond-the-tail-how-a-strategic-approach-to-simplification-fuels-growth/"
            target="_blank" rel="noreferrer" className="underline hover:text-indigo-500 transition-colors">
            bain.com
          </a>{' '}· Cruz, Javor, Kwon, Mologni
        </p>
      </div>

      {state.selectedSku && (
        <SkuFocusDrawer
          sku={state.selectedSku}
          onClose={() => state.handleSkuClick(null)}
          onNavigate={state.handleNavigate}
          isDarkMode={isDarkMode}
          maxIppv={maxIppv}
        />
      )}
    </div>
  );
};
