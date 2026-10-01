import React, { useState } from 'react';
import { DrilldownFilters }      from './DrilldownFilters';
import { DrilldownNetworkGraph } from './DrilldownNetworkGraph';
import { DrilldownRegionGrid }   from './DrilldownRegionGrid';
import { DrilldownSkuGrid }      from './DrilldownSkuGrid';
import { DrilldownSkuModal }     from './DrilldownSkuModal';
import { TimelineRange }         from '../../../utils/timeframe';
import type { TimeHorizon }      from '../../../types/dashboard';
import { REGIONS_CONFIG }        from '../../../constants/regions';

interface TopDownDrilldownProps {
  isDarkMode: boolean;
  role: string;
  timelineRange: TimelineRange;
  setTimelineRange: (range: TimelineRange) => void;
}

// Editorially curated shortlists of real SKU names per region — not derived
// from per-country sales data (the schema doesn't expose a per-country SKU
// breakdown), so treat this as "worth checking here", not a ranked list.
const REGION_SKUS: Record<string, string[]> = {
  'Southern Europe': ['Mango Fizz 500ml', 'Oat Cookies',     'Herbal Shampoo',  'Hand Cream SPF'],
  'Western Europe':  ['Choco Wafers',     'Fabric Softener', 'Floor Cleaner',   'Green Tea RTD'],
  'Central Europe':  ['Dish Soap 1K',     'Aloe Vera Drink', 'Masala Puffs',    'Foam Face Wash'],
};

export const TopDownDrilldown: React.FC<TopDownDrilldownProps> = ({ isDarkMode, timelineRange, setTimelineRange }) => {
  const timeHorizon = (() => {
    switch (timelineRange) {
      case '1m': return '1M';
      case '3m': return '3M';
      case '6m': return '6M';
      case '12m': return '12M';
      case '24m': return '2Y';
      case '36m': return '3Y';
      default: return '3M';
    }
  })() as TimeHorizon;

  const setTimeHorizon = (h: TimeHorizon) => {
    switch (h) {
      case '1M': setTimelineRange('1m'); break;
      case '3M': setTimelineRange('3m'); break;
      case '6M': setTimelineRange('6m'); break;
      case 'YTD': setTimelineRange('6m'); break;
      case '12M': setTimelineRange('12m'); break;
      case '2Y': setTimelineRange('24m'); break;
      case '3Y': setTimelineRange('36m'); break;
    }
  };

  const [selectedMetric, setSelectedMetric] = useState<'rev' | 'margin' | 'otif'>('rev');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedSkuName, setSelectedSkuName]   = useState<string>('');
  const [isSkuModalOpen,  setIsSkuModalOpen]     = useState<boolean>(false);

  const activeRegionSkus = selectedRegion ? (REGION_SKUS[selectedRegion] || []) : [];

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedSkuName(REGION_SKUS[region]?.[0] || '');
  };

  const handleSkuSelect = (skuName: string) => {
    setSelectedSkuName(skuName);
    setIsSkuModalOpen(true);
  };

  const getHorizonMultiplier = () => {
    switch (timelineRange) {
      case '1m':  return 0.33;
      case '3m':  return 1.0;
      case '6m':  return 2.0;
      case '12m': return 4.0;
      case '24m': return 8.0;
      case '36m': return 12.0;
      default:    return 1.0;
    }
  };

  const multiplier     = getHorizonMultiplier();
  const regionalConfig = REGIONS_CONFIG[selectedRegion as string] || REGIONS_CONFIG['Southern Europe'];

  return (
    <div className="animate-fadeIn w-full flex flex-col gap-3">

      {/* ── Breadcrumb (single compact row) ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm w-full shrink-0">
        <span className="text-[#8b5cf6] dark:text-[#a78bfa]">🏢 Global HQ</span>
        <span className="opacity-25 text-[11px] font-light">&rarr;</span>
        {selectedRegion ? (
          <button
            onClick={() => { setSelectedRegion(null); setSelectedSkuName(''); }}
            className="text-[#8b5cf6] dark:text-[#a78bfa] hover:underline bg-transparent border-none cursor-pointer p-0 font-extrabold uppercase text-[10px]"
            title="Reset Region"
          >
            🌎 {selectedRegion} Hub
          </button>
        ) : (
          <span className="opacity-40 italic text-zinc-400 normal-case font-normal">Select a region node →</span>
        )}
        <span className="opacity-25 text-[11px] font-light">&rarr;</span>
        {selectedSkuName ? (
          <span className="text-[#f59e0b] font-black">📦 {selectedSkuName}</span>
        ) : (
          <span className="opacity-40 italic text-zinc-400 normal-case font-normal">Select a SKU variant</span>
        )}
      </div>

      {/* ── Main two-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-3 w-full">

        {/* LEFT: Filters + Network graph */}
        <div className="flex flex-col gap-3 lg:w-[380px] shrink-0">
          <DrilldownFilters
            timeHorizon={timeHorizon}
            setTimeHorizon={setTimeHorizon}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
          />
          <DrilldownNetworkGraph
            selectedRegion={selectedRegion}
            onRegionSelect={handleRegionChange}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* RIGHT: Region cards + SKU grid */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <DrilldownRegionGrid
            selectedRegion={selectedRegion}
            onRegionSelect={handleRegionChange}
            selectedMetric={selectedMetric}
            timeHorizon={timeHorizon}
            timelineRange={timelineRange}
            isDarkMode={isDarkMode}
          />

          {selectedRegion && (
            <DrilldownSkuGrid
              activeRegionSkus={activeRegionSkus}
              selectedSkuName={selectedSkuName}
              onSkuSelect={handleSkuSelect}
              selectedRegionName={regionalConfig.name}
              timelineRange={timelineRange}
            />
          )}
        </div>

      </div>

      {/* ── SKU Diagnostics Modal ── */}
      <DrilldownSkuModal
        isOpen={isSkuModalOpen}
        onClose={() => setIsSkuModalOpen(false)}
        skuName={selectedSkuName}
        selectedRegion={selectedRegion || ''}
        timeHorizon={timeHorizon}
        multiplier={multiplier}
        isDarkMode={isDarkMode}
        timelineRange={timelineRange}
      />

    </div>
  );
};
