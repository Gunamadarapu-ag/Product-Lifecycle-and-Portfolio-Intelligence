import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TABS } from '../constants/data';
import { SKU } from '../types/dashboard';
import { useLiveData } from '../api/liveData';

export interface SearchItem {
  name: string;
  categoryName: string;
  type: 'metric' | 'sku' | 'tab';
  subtitle?: string;
  valueText?: string;
  rawKpiLabel?: string;
  skuData?: SKU;
  tabId?: number;
  priority?: number;
}

export const useGlobalSearch = (
  filteredSKUS: SKU[],
  filteredPortfolioData: any[],
  onSelectTab: (tabId: number) => void,
  onSelectMetric: (metricLabel: string) => void,
  onSelectSku: (skuData: SKU) => void
) => {
  // Real per-SKU net sales ($M) from the warehouse. The `rev` field on SKU is
  // ~22x too large (TODO.md O1). Falls back to `rev` when the API is offline.
  const { skuRevenueM } = useLiveData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Focus search on Ctrl+K / Meta+K globally, or / when not typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputActive = document.activeElement && (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.getAttribute('contenteditable') === 'true'
      );

      const isCtrlK = (e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === 'k' || e.code === 'KeyK');
      const isSlash = e.key === '/' && !isInputActive;

      if (isCtrlK || isSlash) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select(); // Highlight existing text for quick typing
        setIsSearchFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Scroll highlighted search item into view
  useEffect(() => {
    if (activeSearchIndex >= 0) {
      const element = document.getElementById(`search-item-${activeSearchIndex}`);
      if (element) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeSearchIndex]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // List of search items (navigation tabs + metrics + SKUs)
  const searchItems = useMemo(() => {
    const items: SearchItem[] = [];

    // Add all tabs/navigation views
    TABS.forEach(tab => {
      let description = '';
      if (tab.id === 0) description = 'Dashboard home, overview metrics, executive command center';
      else if (tab.id === 1) description = 'Portfolio health map, 2x2 matrix, revenue vs performance, quadrants';
      else if (tab.id === 2) description = 'New product launch, readiness gates, risk tracker';
      else if (tab.id === 3) description = 'Net profit calculation, margin simulator, value driver tree';
      else if (tab.id === 4) description = 'Sunset candidates, cannibalization, complexity reduction';
      else if (tab.id === 5) description = 'AI agent signals, stockout alerts, market demand';
      else if (tab.id === 6) description = 'Root cause analysis, SKU-level drilldown details';
      else if (tab.id === 7) description = 'AI agent team, simulation settings, macro scenarios';
      else if (tab.id === 8) description = 'Regional density, long-tail burden, cross-location transfer, assortment overview';

      items.push({
        name: tab.name,
        categoryName: 'Navigation Tabs',
        type: 'tab',
        subtitle: description || `Jump to ${tab.name} view`,
        valueText: `Tab ${tab.id + 1}`,
        tabId: tab.id
      });
    });

    // Add all unique KPI metrics across the application
    const uniqueMetrics = [
      { label: 'Total Revenue', value: '$851.2 M' },
      { label: 'Gross Margin', value: '36.2%' },
      { label: 'Active SKUs', value: '100' },
      { label: 'Critical Alerts', value: '2' },
      { label: 'Net Sales (Portfolio)', value: '$473M' },
      { label: 'Avg Gross Margin', value: '38.53%' },
      { label: 'Revenue Concentration', value: '27.81%' },
      { label: 'Portfolio PCI', value: '0.5509' },
      { label: 'Long-Tail SKU Burden', value: '68.0%' },
      { label: 'Rationalize Candidates', value: '35 SKUs' },
      { label: 'Peak Stockout Freq.', value: '440 events' },
      { label: 'Revenue Tail Risk', value: '27.08%' },
      { label: 'Overall Readiness %', value: '82%' },
      { label: 'Net Profit', value: '$95.2 M' },
      { label: 'Gross Profit', value: '$308.1 M' },
      { label: 'Sunset Candidates', value: '6' },
      { label: 'Revenue at Risk', value: '$148 M' },
      { label: 'Avg Complexity', value: '0.48' },
      { label: 'Total Active Signals', value: '6' },
      { label: 'Competitor Alerts', value: '2' },
      { label: 'Market Demand Change', value: '+18.4%' },
      { label: 'Customer Sentiment Score', value: '72' },
      { label: 'Portfolio Revenue', value: '$851.4 M' },
      { label: 'Portfolio SKU Count', value: '100' },
      { label: 'Growth Rate', value: '8.4%' },
      { label: 'Orders — Today', value: '4232' },
      { label: 'Forecast Attainment', value: '94.6%' }
    ];

    uniqueMetrics.forEach(m => {
      items.push({
        name: m.label,
        categoryName: 'KPI Metrics',
        type: 'metric',
        subtitle: 'Open Audit Drawer & calculations',
        valueText: m.value,
        rawKpiLabel: m.label
      });
    });

    // Add SKUs
    filteredSKUS.forEach(s => {
      const pData = filteredPortfolioData.find(p => p.name === s.name);
      const segmentStr = pData ? ` • Segment: ${pData.segment}` : '';
      const stageStr = pData ? ` • Stage: ${pData.stage}` : '';

      items.push({
        name: s.name,
        categoryName: 'SKU Products',
        type: 'sku',
        subtitle: `Category: ${s.cat}${segmentStr}${stageStr} • Margin: ${s.margin}%`,
        valueText: `$${(skuRevenueM?.[s.name] ?? s.rev).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`,
        skuData: s
      });
    });

    return items;
  }, [filteredSKUS, filteredPortfolioData]);

  // Filter and prioritize/sort items based on user search query
  const filteredSearchItems = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (cleanQuery === '') return [];
    
    const keywords = cleanQuery.split(/\s+/).filter(Boolean);
    
    // Filter items first (excluding categoryName from matching text to prevent matching pollution)
    const matched = searchItems.filter(item => {
      const searchText = `${item.name} ${item.subtitle || ''}`.toLowerCase();
      return keywords.every(kw => searchText.includes(kw));
    });

    // Assign priority scores and sort
    return matched.map(item => {
      const nameLower = item.name.toLowerCase();
      let priority = 2; // Default: contains query

      if (nameLower.startsWith(cleanQuery)) {
        priority = 0; // Starts with query
      } else if (nameLower.split(/\s+/).some(w => w.startsWith(cleanQuery))) {
        priority = 1; // Word starts with query
      }

      return { ...item, priority };
    }).sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return 0; // Maintain original relative order
    });
  }, [searchQuery, searchItems]);

  // Group search items for presentation
  const groupedSearchResults = useMemo(() => {
    return filteredSearchItems.reduce<Record<string, SearchItem[]>>((acc, item) => {
      if (!acc[item.categoryName]) acc[item.categoryName] = [];
      acc[item.categoryName].push(item);
      return acc;
    }, {});
  }, [filteredSearchItems]);

  const handleSelectSearchItem = (item: SearchItem) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    setActiveSearchIndex(-1);
    searchInputRef.current?.blur();
    if (item.type === 'tab' && item.tabId !== undefined) {
      onSelectTab(item.tabId);
    } else if (item.type === 'metric' && item.rawKpiLabel) {
      onSelectMetric(item.rawKpiLabel);
    } else if (item.type === 'sku' && item.skuData) {
      onSelectSku(item.skuData);
    }
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSearchIndex(prev => 
        filteredSearchItems.length ? (prev + 1) % filteredSearchItems.length : -1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSearchIndex(prev => 
        filteredSearchItems.length ? (prev - 1 + filteredSearchItems.length) % filteredSearchItems.length : -1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSearchIndex >= 0 && activeSearchIndex < filteredSearchItems.length) {
        handleSelectSearchItem(filteredSearchItems[activeSearchIndex]);
      } else if (filteredSearchItems.length > 0) {
        handleSelectSearchItem(filteredSearchItems[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    activeSearchIndex,
    setActiveSearchIndex,
    searchInputRef,
    searchContainerRef,
    filteredSearchItems,
    groupedSearchResults,
    handleSelectSearchItem,
    handleKeyDownInput,
  };
};
