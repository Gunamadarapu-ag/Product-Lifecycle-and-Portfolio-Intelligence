/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Custom hook that consolidates all state, memos, and effects for
 * the SKU Rationalization dashboard. Returns a single flat object
 * that the parent orchestrator passes straight down to child components.
 */

import { useState, useEffect, useMemo } from 'react';
import { SKUS as GLOBAL_SKUS } from '../../../constants/data';
import { Role, KPI } from '../../../types/dashboard';
import { srClassify, getSkuLocation, PAIRS_DATA, SR_CLASSES } from './skuConstants';
import { TimelineRange, getFilteredSKUS } from '../../../utils/timeframe';
import { getChartTheme } from '../../../utils/chartTheme';

export function useSkuRationalizationState(role: Role, isDarkMode: boolean, timelineRange: TimelineRange) {
  const SKUS = useMemo(() => getFilteredSKUS(GLOBAL_SKUS, timelineRange), [timelineRange]);

  // ── Region ─────────────────────────────────────────────────────────────────
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  const locationFilteredSkus = useMemo(() => {
    if (selectedLocation === 'ALL') return SKUS;
    return SKUS.filter(s => getSkuLocation(s.name) === selectedLocation);
  }, [selectedLocation, SKUS]);

  // ── Chart visual constants ─────────────────────────────────────────────────
  // Sourced from the shared theme so every chart in the app resolves the same
  // palette. Destructured rather than passed as one object to keep the hook's
  // existing return shape unchanged for its many consumers.
  const { gridStroke, tickColor, tooltipBg, tooltipBorder, tooltipText } = getChartTheme(isDarkMode);

  // ── View & toolbar ─────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<'simulator' | 'analyst' | 'simplify'>(() => {
    try {
      const saved = localStorage.getItem('sku_rationalization_active_view');
      if (saved === 'simulator' || saved === 'analyst' || saved === 'simplify') {
        return saved;
      }
    } catch {}
    return 'analyst';
  });
  const [refreshTime, setRefreshTime] = useState('');
  const [activeKpiAction, setActiveKpiAction] = useState<string | null>(null);

  useEffect(() => {
    setRefreshTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sku_rationalization_active_view', activeView);
    } catch {}
  }, [activeView]);
  // ── KPI cards ──────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const activeSkusCount = locationFilteredSkus.length;
    const isSunset = (s: any) => {
      if (s.val >= 0.7 && s.cx <= 0.4) return false;
      if (s.val >= 0.6 && s.growth >= 0.15) return false;
      if (s.val < 0.5 && s.cx < 0.5 && s.margin >= 30) return false;
      if (s.val < 0.4 && s.cx >= 0.6) return true;
      return false;
    };
    const sunsetCount  = locationFilteredSkus.filter(isSunset).length;
    const revAtRisk    = locationFilteredSkus.filter(isSunset).reduce((sum, s) => sum + s.rev, 0);
    const avgComplexity = locationFilteredSkus.reduce((sum, s) => sum + s.cx, 0) / (activeSkusCount || 1);

    // Annotated so `highlight` narrows to Role[] rather than widening to
    // string[] — without this the cards do not satisfy the KPI contract.
    const cards: KPI[] = [
      {
        label: 'Portfolio SKUs',
        value: String(activeSkusCount),
        trend: 'up' as const,
        trendValue: '▲ 3 rationalized this Q',
        info: 'Total active SKUs across the global portfolio. Cleaned up low-value items.',
        highlight: ['VP Product Management'],
      },
      {
        label: 'Sunset Candidates',
        value: String(sunsetCount),
        trend: 'down' as const,
        trendValue: 'Immediate action required',
        info: 'Low value and high complexity tail SKUs recommended for removal by AI.',
        highlight: ['VP Product Management'],
        isRisk: true,
      },
      {
        label: 'Revenue at Risk',
        value: `$${revAtRisk} M`,
        trend: 'down' as const,
        trendValue: 'If tail SKUs removed',
        info: 'Estimated maximum revenue exposure if all sunset candidates are removed concurrently.',
        highlight: ['VP Product Management'],
        isRisk: true,
      },
      {
        label: 'Avg Complexity',
        value: avgComplexity.toFixed(2),
        trend: 'down' as const,
        trendValue: 'Target <0.40',
        info: 'Average operational and manufacturing complexity index across the active catalog.',
        highlight: ['VP Product Management'],
        isRisk: true,
      },
    ];

    return role === 'VP Product Management'
      ? cards.filter(c => c.label !== 'Portfolio SKUs')
      : cards;
  }, [locationFilteredSkus, role]);

  // ── Auto-scroll to directory ───────────────────────────────────────────────
  useEffect(() => {
    const hasHash = window.location.hash.includes('product-directory-section');
    const hasFlag = (window as any).__scrollToDirectory;
    if (!hasHash && !hasFlag) return;

    if (hasHash) {
      try {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const newParams = new URLSearchParams();
        let updated = false;
        params.forEach((value, key) => {
          if (!key.includes('product-directory')) { newParams.set(key, value); }
          else { updated = true; }
        });
        if (updated) window.history.replaceState(null, '', '#' + newParams.toString());
        else window.location.hash = '';
      } catch { window.location.hash = ''; }
    }
    (window as any).__scrollToDirectory = false;

    const scrollWithRetry = (attempts = 0) => {
      const el = document.getElementById('product-directory-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (attempts < 10) setTimeout(() => scrollWithRetry(attempts + 1), 150);
    };
    setTimeout(() => scrollWithRetry(0), 350);
  }, []);

  // ── AI classification filter ───────────────────────────────────────────────
  const [selectedAiClass, setSelectedAiClass] = useState<string | null>(null);

  // ── SKU grouping helpers ───────────────────────────────────────────────────
  const skusByCategory = useMemo(() => {
    const map: Record<string, typeof SKUS> = {
      Beverages: [], Snacks: [], 'Personal Care': [], Dairy: [], Household: [], Beauty: [], Fashion: [],
    };
    locationFilteredSkus.forEach(s => {
      const label = s.cat === 'Home Care' ? 'Household' : s.cat;
      if (map[label]) map[label].push(s);
      else map[label] = [s];
    });
    return map;
  }, [locationFilteredSkus]);

  const groups = useMemo(() => {
    const res: Record<string, typeof SKUS> = {
      retain: [], grow: [], bundle: [], reposition: [], sunset: [],
    };
    locationFilteredSkus.forEach(s => {
      const c = srClassify(s);
      if (res[c]) res[c].push(s);
    });
    return res;
  }, [locationFilteredSkus]);

  // ── Simulator states ───────────────────────────────────────────────────────
  const [simTab, setSimTab]                       = useState<'remove' | 'price' | 'launch'>('remove');
  const [selectedSkuName, setSelectedSkuName]     = useState(SKUS[0].name);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#';
      const params = new URLSearchParams(hash.substring(1).replace(/\+/g, '%20'));
      
      const viewParam = params.get('view');
      if (viewParam === 'simulator' || viewParam === 'analyst' || viewParam === 'simplify') {
        setActiveView(viewParam);
      }
      
      const aiClassParam = params.get('aiClass');
      if (aiClassParam) {
        if (aiClassParam.toLowerCase().includes('sunset')) {
          setSelectedAiClass('sunset');
        } else if (aiClassParam.toLowerCase().includes('reposition')) {
          setSelectedAiClass('reposition');
        } else if (aiClassParam.toLowerCase().includes('bundle')) {
          setSelectedAiClass('bundle');
        } else if (aiClassParam.toLowerCase().includes('grow')) {
          setSelectedAiClass('grow');
        } else if (aiClassParam.toLowerCase().includes('retain')) {
          setSelectedAiClass('retain');
        } else {
          setSelectedAiClass(aiClassParam);
        }
      }
      
      const skuNameParam = params.get('sku');
      if (skuNameParam) {
        const foundSku = SKUS.find(s => s.name.toLowerCase() === skuNameParam.toLowerCase() || s.name.toLowerCase().includes(skuNameParam.toLowerCase()));
        if (foundSku) {
          setSelectedSkuName(foundSku.name);
        }
      }

      const simTabParam = params.get('simTab');
      if (simTabParam === 'remove' || simTabParam === 'price' || simTabParam === 'launch') {
        setSimTab(simTabParam);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [priceChange, setPriceChange]             = useState(0);
  const [volumeElasticity, setVolumeElasticity]   = useState(-1.2);
  const [projectedRevenue, setProjectedRevenue]   = useState(40);
  const [expectedMargin, setExpectedMargin]       = useState(35);
  const [cannibalizationRisk, setCannibalizationRisk] = useState(0);
  const [btnText, setBtnText]                     = useState('⚡ Run Simulation');
  const [isSimulating, setIsSimulating]           = useState(false);

  // Sunset SKU transference overrides
  const [sunsetTransferenceRate, setSunsetTransferenceRate] = useState(60);
  const [sunsetSubstituteSkuName, setSunsetSubstituteSkuName] = useState('');

  const selectedSku = useMemo(
    () => locationFilteredSkus.find(s => s.name === selectedSkuName) || locationFilteredSkus[0] || SKUS[0],
    [selectedSkuName, locationFilteredSkus]
  );

  const sunsetSubstituteOptions = useMemo(() => {
    if (!selectedSku) return [];
    return locationFilteredSkus.filter(s => s.cat === selectedSku.cat && s.name !== selectedSku.name);
  }, [selectedSku, locationFilteredSkus]);

  useEffect(() => {
    if (sunsetSubstituteOptions.length > 0) {
      if (!sunsetSubstituteOptions.some(o => o.name === sunsetSubstituteSkuName)) {
        setSunsetSubstituteSkuName(sunsetSubstituteOptions[0].name);
      }
    } else {
      setSunsetSubstituteSkuName('');
    }
  }, [selectedSkuName, sunsetSubstituteOptions, sunsetSubstituteSkuName]);

  const sunsetSubstituteSku = useMemo(() => {
    return sunsetSubstituteOptions.find(o => o.name === sunsetSubstituteSkuName) || null;
  }, [sunsetSubstituteSkuName, sunsetSubstituteOptions]);

  const totalRev = useMemo(
    () => locationFilteredSkus.reduce((s, k) => s + k.rev, 0),
    [locationFilteredSkus]
  );

  const rankedPriorities = useMemo(() => {
    return [...locationFilteredSkus]
      .filter(s => { const c = srClassify(s); return c === 'sunset' || c === 'reposition'; })
      .sort((a, b) => {
        const sa = a.cx + a.stockouts * 0.05 - a.val;
        const sb = b.cx + b.stockouts * 0.05 - b.val;
        return sb - sa;
      })
      .slice(0, 7);
  }, [locationFilteredSkus]);

  useEffect(() => {
    if (locationFilteredSkus.length > 0 && !locationFilteredSkus.some(s => s.name === selectedSkuName)) {
      setSelectedSkuName(locationFilteredSkus[0].name);
    }
  }, [locationFilteredSkus, selectedSkuName]);

  const handleRunSim = () => {
    setIsSimulating(true);
    setBtnText('⏳ Calculating...');
    setTimeout(() => {
      setIsSimulating(false);
      setBtnText('✅ Simulation Complete');
      setTimeout(() => setBtnText('⚡ Run Simulation'), 2000);
    }, 800);
  };

  // Advanced Simulator derived values for Sunset SKU
  const transferredVolume = parseFloat((selectedSku.rev * (sunsetTransferenceRate / 100)).toFixed(1));
  const leakageVolume     = parseFloat((selectedSku.rev * (1 - sunsetTransferenceRate / 100)).toFixed(1));
  const complexitySavings = parseFloat((selectedSku.rev * 0.04).toFixed(1)); // 4% operational savings
  const cannibalizationRelief = useMemo(() => {
    if (!sunsetSubstituteSku) return 0;
    return parseFloat((sunsetSubstituteSku.rev * 0.05 * selectedSku.cx).toFixed(1));
  }, [sunsetSubstituteSku, selectedSku.cx]);

  const netProfitImpact = useMemo(() => {
    const delistedProfit = selectedSku.rev * (selectedSku.margin / 100);
    const substituteMargin = sunsetSubstituteSku ? sunsetSubstituteSku.margin : 0;
    const transferredProfit = transferredVolume * (substituteMargin / 100);
    const reliefProfit = sunsetSubstituteSku ? (cannibalizationRelief * (substituteMargin / 100)) : 0;
    return parseFloat((transferredProfit - delistedProfit + complexitySavings + reliefProfit).toFixed(2));
  }, [selectedSku.rev, selectedSku.margin, transferredVolume, sunsetSubstituteSku, complexitySavings, cannibalizationRelief]);

  const removeRevImpact = useMemo(() => {
    // Net portfolio revenue shift = - discontinued + transferred + cannibalization relief
    return parseFloat((-selectedSku.rev + transferredVolume + cannibalizationRelief).toFixed(1));
  }, [selectedSku.rev, transferredVolume, cannibalizationRelief]);

  const removeMarginImpact = useMemo(() => {
    // Blended margin shift
    const oldPortfolioProfit = locationFilteredSkus.reduce((sum, s) => sum + s.rev * (s.margin / 100), 0);
    const delistedProfit = selectedSku.rev * (selectedSku.margin / 100);
    const substituteMargin = sunsetSubstituteSku ? sunsetSubstituteSku.margin : 0;
    const transferredProfit = transferredVolume * (substituteMargin / 100);
    const reliefProfit = sunsetSubstituteSku ? (cannibalizationRelief * (substituteMargin / 100)) : 0;
    
    const newPortfolioProfit = oldPortfolioProfit - delistedProfit + transferredProfit + complexitySavings + reliefProfit;
    const oldPortfolioRev = totalRev;
    const newPortfolioRev = totalRev - selectedSku.rev + transferredVolume + cannibalizationRelief;
    
    const oldBlendedMargin = (oldPortfolioProfit / (oldPortfolioRev || 1)) * 100;
    const newBlendedMargin = (newPortfolioProfit / (newPortfolioRev || 1)) * 100;
    return parseFloat((newBlendedMargin - oldBlendedMargin).toFixed(2));
  }, [locationFilteredSkus, selectedSku, sunsetSubstituteSku, transferredVolume, complexitySavings, cannibalizationRelief, totalRev]);

  const removeCustImpact   = selectedSku.val > 0.6 ? 'High — brand loyalists affected' : 'Low — high substitution rate';
  const removeScImpact     = `Frees ${selectedSku.lead}d lead buffer · −${selectedSku.stockouts} stockout events`;
  const volChange          = (priceChange * volumeElasticity) / 100;
  const newRev             = parseFloat((selectedSku.rev * (1 + priceChange / 100) * (1 + volChange)).toFixed(1));
  const revDelta           = parseFloat((newRev - selectedSku.rev).toFixed(1));
  const newMargin          = parseFloat((selectedSku.margin + priceChange * 0.7).toFixed(1));
  const cannRiskLabel      = ['Low', 'Medium', 'High'][cannibalizationRisk];
  const cannHaircut        = cannibalizationRisk === 2 ? 0.18 : cannibalizationRisk === 1 ? 0.09 : 0.02;
  const netLaunchRev       = parseFloat((projectedRevenue * (1 - cannHaircut)).toFixed(1));

  const paretoData = useMemo(() => {
    const sorted = [...locationFilteredSkus].sort((a, b) => b.rev - a.rev);
    const sunsetSkuName = simTab === 'remove' ? selectedSkuName : null;
    const sunsetSku = locationFilteredSkus.find(s => s.name === sunsetSkuName);
    const hasSunset = !!sunsetSku;
    const newTotalRev = hasSunset ? totalRev - sunsetSku!.rev : totalRev;
    let cumNormal = 0; let cumSim = 0;
    return sorted.map(s => {
      cumNormal += s.rev;
      const isSunset = s.name === sunsetSkuName;
      if (!isSunset) cumSim += s.rev;
      const cls = srClassify(s);
      let color = 'rgba(16,185,129,0.7)';
      if (cls === 'grow') color = 'rgba(59,130,246,0.7)';
      else if (cls === 'bundle') color = 'rgba(139,92,246,0.7)';
      else if (cls === 'reposition') color = 'rgba(245,158,11,0.7)';
      else if (cls === 'sunset') color = 'rgba(239,68,68,0.7)';
      return {
        name: s.name.split(' ')[0],
        fullName: s.name,
        rev: s.rev,
        cumPct: parseFloat(((cumNormal / (totalRev || 1)) * 100).toFixed(1)),
        simCumPct: isSunset ? null : parseFloat(((cumSim / (newTotalRev || 1)) * 100).toFixed(1)),
        fill: isSunset ? 'rgba(239,68,68,0.15)' : color,
        aiClass: SR_CLASSES[cls].label,
        highlightClass: cls,
        isDimmed: selectedAiClass ? cls !== selectedAiClass : false,
      };
    });
  }, [simTab, selectedSkuName, totalRev, selectedAiClass, locationFilteredSkus]);

  const matrixScatterData = useMemo(() => {
    return locationFilteredSkus.map(s => {
      const cls = srClassify(s);
      let fill = '#10b981';
      if (cls === 'grow') fill = '#3b82f6';
      else if (cls === 'bundle') fill = '#8b5cf6';
      else if (cls === 'reposition') fill = '#f59e0b';
      else if (cls === 'sunset') fill = '#ef4444';
      return {
        name: s.name, x: s.cx, y: s.val, rev: s.rev, margin: s.margin,
        aiClass: SR_CLASSES[cls].label, fill, z: s.rev, highlightClass: cls,
        isDimmed: selectedAiClass ? cls !== selectedAiClass : false,
      };
    });
  }, [selectedAiClass, locationFilteredSkus]);

  const groupedBarData = useMemo(() => {
    const cats = [
      { key: 'Retain/Grow', classes: ['retain', 'grow'], defaultVal: 0.74, defaultCx: 0.26 },
      { key: 'Bundle',      classes: ['bundle'],          defaultVal: 0.64, defaultCx: 0.31 },
      { key: 'Reposition',  classes: ['reposition'],      defaultVal: 0.57, defaultCx: 0.47 },
      { key: 'Sunset',      classes: ['sunset'],          defaultVal: 0.29, defaultCx: 0.64 },
    ];
    return cats.map(cat => {
      const f = locationFilteredSkus.filter(s => cat.classes.includes(srClassify(s)));
      if (f.length === 0) return { name: cat.key, 'Commercial value': cat.defaultVal, 'Complexity score': cat.defaultCx };
      return {
        name: cat.key,
        'Commercial value': parseFloat((f.reduce((a, s) => a + s.val, 0) / f.length).toFixed(2)),
        'Complexity score': parseFloat((f.reduce((a, s) => a + s.cx,  0) / f.length).toFixed(2)),
      };
    });
  }, [locationFilteredSkus]);

  // ── Cannibalization Analyst states ─────────────────────────────────────────
  const [skuA, setSkuA]                         = useState('Mango Fizz 500ml');
  const [skuB, setSkuB]                         = useState('Aloe Vera Drink');
  const [correlation, setCorrelation]           = useState(-0.62);
  const [category, setCategory]                 = useState('Beverages');
  const [hasScored, setHasScored]               = useState(true);
  const [selectedRoutingTeam, setSelectedRoutingTeam] = useState(0);
  const [selectedSkuDetails, setSelectedSkuDetails]   = useState<typeof SKUS[0] | null>(null);

  // Workflow control center persistent states
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sku_rationalization_workflow_steps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
      return {};
    } catch { return {}; }
  });

  const [shortlistedSkus, setShortlistedSkus] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sku_rationalization_shortlisted');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch { return []; }
  });

  const [frozenSkus, setFrozenSkus] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sku_rationalization_frozen');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch { return []; }
  });

  const [auditLog, setAuditLog] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('sku_rationalization_audit_log');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch { return []; }
  });

  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);

  const [exitDateDays, setExitDateDays] = useState(60);
  const [pricingPriceShift, setPricingPriceShift] = useState(0);
  const [supplySafetyStockShift, setSupplySafetyStockShift] = useState(15);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDoc(null);
  }, [skuA, skuB]);

  useEffect(() => {
    localStorage.setItem('sku_rationalization_workflow_steps', JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem('sku_rationalization_shortlisted', JSON.stringify(shortlistedSkus));
  }, [shortlistedSkus]);

  useEffect(() => {
    localStorage.setItem('sku_rationalization_frozen', JSON.stringify(frozenSkus));
  }, [frozenSkus]);

  useEffect(() => {
    localStorage.setItem('sku_rationalization_audit_log', JSON.stringify(auditLog));
  }, [auditLog]);

  const setStepCompleted = (pairKey: string, team: string, stepIdx: number, completed: boolean) => {
    setCompletedSteps(prev => ({
      ...prev,
      [`${pairKey}|${team}|${stepIdx}`]: completed
    }));
  };

  const logAction = (team: string, stepLabel: string, details: string, rationale: string) => {
    const newEntry = {
      id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleString(),
      pairKey: `${skuA}|${skuB}`,
      skuA,
      skuB,
      team,
      actionLabel: stepLabel,
      details,
      rationale,
      riskScore: pairRisk,
    };
    setAuditLog(prev => {
      const filtered = prev.filter(entry => !(entry.pairKey === newEntry.pairKey && entry.actionLabel === newEntry.actionLabel));
      return [newEntry, ...filtered];
    });
  };

  const logReversalAction = (team: string, stepLabel: string, details: string, rationale: string) => {
    const newEntry = {
      id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleString(),
      pairKey: `${skuA}|${skuB}`,
      skuA,
      skuB,
      team,
      actionLabel: `REVERSAL: ${stepLabel}`,
      details,
      rationale,
      riskScore: pairRisk,
    };
    setAuditLog(prev => [newEntry, ...prev]);
  };

  const removeActionLog = (pairKey: string, stepLabel: string) => {
    setAuditLog(prev => prev.filter(entry => !(entry.pairKey === pairKey && entry.actionLabel === stepLabel)));
  };

  const resetPairWorkflow = (pairKey: string) => {
    setCompletedSteps(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (key.startsWith(pairKey + '|')) {
          delete next[key];
        }
      });
      return next;
    });
    setAuditLog(prev => prev.filter(entry => entry.pairKey !== pairKey));
  };

  const shortlistSku = (name: string) => {
    if (!shortlistedSkus.includes(name)) {
      setShortlistedSkus(prev => [...prev, name]);
    }
  };

  const unshortlistSku = (name: string) => {
    setShortlistedSkus(prev => prev.filter(n => n !== name));
  };

  const freezeSkuReplenishment = (name: string) => {
    if (!frozenSkus.includes(name)) {
      setFrozenSkus(prev => [...prev, name]);
    }
  };

  const unfreezeSkuReplenishment = (name: string) => {
    setFrozenSkus(prev => prev.filter(n => n !== name));
  };


  const skuACategory = useMemo(() => {
    const s = locationFilteredSkus.find(item => item.name === skuA);
    return s ? s.cat : 'Beverages';
  }, [skuA, locationFilteredSkus]);

  const skuBOptions = useMemo(
    () => locationFilteredSkus.filter(s => s.cat === skuACategory && s.name !== skuA),
    [skuACategory, skuA, locationFilteredSkus]
  );

  useEffect(() => {
    if (locationFilteredSkus.length > 0 && !locationFilteredSkus.some(s => s.name === skuA)) {
      setSkuA(locationFilteredSkus[0].name);
    }
  }, [locationFilteredSkus, skuA]);

  useEffect(() => {
    if (!skuBOptions.some(o => o.name === skuB) && skuBOptions.length > 0) {
      setSkuB(skuBOptions[0].name);
    }
  }, [skuBOptions, skuB]);

  useEffect(() => {
    if (!skuA || !skuB) return;
    const predefined = PAIRS_DATA.find(
      p => (p.a === skuA && p.b === skuB) || (p.a === skuB && p.b === skuA)
    );
    if (predefined) {
      setCorrelation(-predefined.risk);
    } else {
      const combined = [skuA, skuB].sort().join('|');
      let hash = 0;
      for (let i = 0; i < combined.length; i++) hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      const normalized = Math.abs(hash % 100) / 100;
      setCorrelation(parseFloat((-0.15 - normalized * 0.45).toFixed(2)));
    }
  }, [skuA, skuB]);

  useEffect(() => {
    const label = skuACategory === 'Home Care' ? 'Household' : skuACategory;
    setCategory(label);
  }, [skuACategory]);

  const pairRisk = Math.max(0, -correlation);
  let riskVerdict = 'Low Risk';
  let verdictColor = 'text-green-500 bg-green-500/10 border-green-500/20';
  if (pairRisk > 0.5) { riskVerdict = 'High Risk'; verdictColor = 'text-red-500 bg-red-500/10 border-red-500/20'; }
  else if (pairRisk > 0.25) { riskVerdict = 'Moderate'; verdictColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20'; }

  const handleAnalystScatterClick = (node: any) => {
    if (node?.name) {
      const parts = node.name.split(' ↔ ');
      if (parts.length === 2) {
        setSkuA(parts[0]); setSkuB(parts[1]);
        setCorrelation(-node.risk); setCategory(node.cat);
        setHasScored(true);
      }
    }
  };

  const scatterPairsData = PAIRS_DATA.map((p, idx) => ({
    index: idx,
    risk: p.risk,
    name: `${p.a} ↔ ${p.b}`,
    revAtRisk: p.revAtRisk,
    cat: p.cat,
    fill: p.risk > 0.5 ? '#A32D2D' : p.risk > 0.3 ? '#854F0B' : '#0F6E56',
  }));

  const promoErosionData = useMemo(() => {
    return [...locationFilteredSkus]
      .sort((a, b) => b.promo - a.promo)
      .slice(0, 10)
      .map(s => ({
        name: s.name,
        promoPct: Math.round(s.promo * 100),
        fill: s.promo > 0.5 ? '#ef4444' : s.promo > 0.35 ? '#f59e0b' : '#10b981',
      }));
  }, [locationFilteredSkus]);

  const highRiskPairs     = PAIRS_DATA.filter(p => p.risk > 0.5).length;
  const moderateRiskPairs = PAIRS_DATA.filter(p => p.risk > 0.3 && p.risk <= 0.5).length;
  const promoRiskSkus     = promoErosionData.filter(d => d.promoPct > 40).length;

  return {
    // region
    selectedLocation, setSelectedLocation, locationFilteredSkus,
    // chart constants
    gridStroke, tickColor, tooltipBg, tooltipBorder, tooltipText,
    // view
    activeView, setActiveView,
    refreshTime,
    activeKpiAction, setActiveKpiAction,
    kpis,
    // ai class filter
    selectedAiClass, setSelectedAiClass,
    // groups / categories
    skusByCategory, groups,
    // simulator
    simTab, setSimTab,
    selectedSkuName, setSelectedSkuName,
    priceChange, setPriceChange,
    volumeElasticity, setVolumeElasticity,
    projectedRevenue, setProjectedRevenue,
    expectedMargin, setExpectedMargin,
    cannibalizationRisk, setCannibalizationRisk,
    btnText, isSimulating, handleRunSim,
    selectedSku, totalRev, rankedPriorities,
    removeRevImpact, removeMarginImpact, removeCustImpact, removeScImpact,
    volChange, newRev, revDelta, newMargin,
    cannRiskLabel, netLaunchRev,
    paretoData, matrixScatterData, groupedBarData,
    // sunset state & calculations
    sunsetTransferenceRate, setSunsetTransferenceRate,
    sunsetSubstituteSkuName, setSunsetSubstituteSkuName,
    sunsetSubstituteOptions, sunsetSubstituteSku,
    transferredVolume, leakageVolume, complexitySavings, cannibalizationRelief, netProfitImpact,
    // analyst
    skuA, setSkuA,
    skuB, setSkuB,
    correlation, setCorrelation,
    category,
    hasScored, setHasScored,
    selectedRoutingTeam, setSelectedRoutingTeam,
    selectedSkuDetails, setSelectedSkuDetails,
    skuACategory, skuBOptions,
    pairRisk, riskVerdict, verdictColor,
    handleAnalystScatterClick,
    scatterPairsData, promoErosionData,
    highRiskPairs, moderateRiskPairs, promoRiskSkus,
    // Control center persistent states & triggers
    completedSteps, setStepCompleted, resetPairWorkflow,
    shortlistedSkus, shortlistSku, unshortlistSku,
    frozenSkus, freezeSkuReplenishment, unfreezeSkuReplenishment,
    auditLog, isControlCenterOpen, setIsControlCenterOpen,
    logAction, logReversalAction, removeActionLog,
    exitDateDays, setExitDateDays,
    pricingPriceShift, setPricingPriceShift,
    supplySafetyStockShift, setSupplySafetyStockShift,
    selectedDoc, setSelectedDoc,
  };
}
