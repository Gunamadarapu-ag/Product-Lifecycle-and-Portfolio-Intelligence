/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Role } from '../../../types/dashboard';
import { Download, Search, CheckCircle2, Activity, X, Eye, Printer, FileText, RefreshCw } from 'lucide-react';
import { SKUS as GLOBAL_SKUS } from '../../../constants/data';
import { SkuIntelligenceModal } from './SkuIntelligenceModal';
import { ProductDirectory } from './ProductDirectory';
import { KPICard } from '../KPICard';
import { KpiActionModal } from './KpiActionModal';
import { SegmentFilters } from './SegmentFilters';
import { ValueComplexitySection } from './ValueComplexitySection';
import { PLSimulatorSection } from './PLSimulatorSection';
import { SkuToolbar } from './SkuToolbar';
import { CannibalizationAnalystView } from './CannibalizationAnalystView';
import { useSkuRationalizationState } from './useSkuRationalizationState';
import { ActionRoutingPanel } from './ActionRoutingPanel';
import { getDocumentTemplates } from './documentTemplates';
import { SimplifyToGrow } from './simplify-to-grow/SimplifyToGrow';
import { TimelineRange, getFilteredSKUS } from '../../../utils/timeframe';

// Re-export constants and pure functions to prevent breaking sibling imports
export { srClassify, SR_CLASSES, getSkuLocation } from './skuConstants';

interface SKURationalizationProps {
  role: Role;
  isDarkMode: boolean;
  setActiveTab?: (tabId: number) => void;
  timelineRange: TimelineRange;
}

export const SKURationalization: React.FC<SKURationalizationProps> = ({ role, isDarkMode, setActiveTab, timelineRange }) => {
  const SKUS = useMemo(() => getFilteredSKUS(GLOBAL_SKUS, timelineRange), [timelineRange]);
  const state = useSkuRationalizationState(role, isDarkMode, timelineRange);

  // Audit Ledger filtering states
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTeamFilter, setLedgerTeamFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return (state.auditLog || []).filter(log => {
      const matchSearch = 
        log.skuA.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        log.skuB.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        log.actionLabel.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        log.rationale.toLowerCase().includes(ledgerSearch.toLowerCase());
      const matchTeam = ledgerTeamFilter === 'ALL' || log.team.toLowerCase().replace(' ', '') === ledgerTeamFilter.toLowerCase().replace(' ', '');
      return matchSearch && matchTeam;
    });
  }, [state.auditLog, ledgerSearch, ledgerTeamFilter]);

  const exportLogsCSV = () => {
    const headers = ['Audit ID', 'Timestamp', 'SKU A', 'SKU B', 'Team', 'Action', 'Parameters', 'Rationale', 'Risk Score'];
    const rows = (state.auditLog || []).map(entry => [
      entry.id,
      entry.timestamp,
      entry.skuA,
      entry.skuB,
      entry.team,
      entry.actionLabel,
      entry.details,
      entry.rationale,
      entry.riskScore
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rationalization_Audit_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getDocTypeForStep = (team: string, actionLabel: string): string | null => {
    const t = team.toLowerCase().replace(' ', '');
    const a = actionLabel.trim();
    if (t === 'pricing') {
      if (a === 'Pull price ladder') return 'price_ladder';
      if (a === 'Run cross-elasticity') return 'pricing_elasticity';
      if (a === 'Separate promo slots') return 'promo_deconfliction';
      if (a === 'Escalate to committee') return 'committee_escalation';
    }
    if (t === 'product') {
      if (a === 'Add to shortlist') return 'watchlist_registration';
      if (a === 'Feasibility check') return 'capacity';
      if (a === 'Sunset plan draft') return 'sunset';
    }
    if (t === 'supplychain' || t === 'supply') {
      if (a === 'Freeze replenishment') return 'replenishment_freeze';
      if (a === 'Raise safety stock') return 'mrp_safety_revision';
      if (a === 'Warehouse release') return 'warehouse_release';
    }
    return null;
  };

  const sA = SKUS.find(s => s.name === state.skuA) || SKUS[0];
  const sB = SKUS.find(s => s.name === state.skuB) || SKUS[1];
  const revA = sA ? sA.rev : 10;
  const marginA = sA ? sA.margin : 35;
  const marginB = sB ? sB.margin : 40;
  const transferenceRate = Math.round(state.pairRisk * 100);
  const transferenceVolume = parseFloat((revA * (transferenceRate / 100)).toFixed(2));
  const marginDiffUplift = transferenceVolume * ((marginB - marginA) / 100);
  const complexitySavings = revA * 0.05;
  const annualSavingsThousands = Math.round((marginDiffUplift + complexitySavings) * 1000);

  const skuA = state.skuA;
  const skuB = state.skuB;
  const exitDateDays = state.exitDateDays;
  const pricingPriceShift = state.pricingPriceShift;
  const supplySafetyStockShift = state.supplySafetyStockShift;
  const pairRisk = state.pairRisk;
  const category = state.category;

  const documentTemplates = getDocumentTemplates({
    skuA,
    skuB,
    category,
    pairRisk,
    transferenceRate,
    transferenceVolume,
    marginDiffUplift,
    complexitySavings,
    annualSavingsThousands,
    exitDateDays,
    pricingPriceShift,
    supplySafetyStockShift,
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">
      

      {/* Consolidated Toolbar Header */}
      <SkuToolbar
        role={role}
        isDarkMode={isDarkMode}
        activeView={state.activeView}
        setActiveView={state.setActiveView}
        selectedLocation={state.selectedLocation}
        setSelectedLocation={state.setSelectedLocation}
        refreshTime={state.refreshTime}
        setSelectedAiClass={state.setSelectedAiClass}
      />

      {/* KPI Cards Strip */}
      {state.activeView !== 'simplify' && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${role === 'VP Product Management' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3`}>
          {state.kpis.map((kpi) => (
            <KPICard 
              key={kpi.label}
              kpi={kpi} 
              role={role} 
              onAuditClick={() => state.setActiveKpiAction(kpi.label)}
            />
          ))}
        </div>
      )}

      {/* WORKSPACE VIEW 1: STRATEGIC SIMULATOR VIEW */}
      {state.activeView === 'simulator' && (
        <div className="space-y-6">
          
          <SegmentFilters
            groups={state.groups}
            selectedAiClass={state.selectedAiClass}
            setSelectedAiClass={state.setSelectedAiClass}
          />

          <ValueComplexitySection
            groupedBarData={state.groupedBarData}
            rankedPriorities={state.rankedPriorities}
            selectedAiClass={state.selectedAiClass}
            setSelectedSkuName={state.setSelectedSkuName}
            setSimTab={state.setSimTab}
            setSelectedSkuDetails={state.setSelectedSkuDetails}
            isDarkMode={isDarkMode}
            gridStroke={state.gridStroke}
            tickColor={state.tickColor}
            tooltipBg={state.tooltipBg}
            tooltipBorder={state.tooltipBorder}
            tooltipText={state.tooltipText}
          />

          <PLSimulatorSection
            simTab={state.simTab}
            setSimTab={state.setSimTab}
            selectedSkuName={state.selectedSkuName}
            setSelectedSkuName={state.setSelectedSkuName}
            skusByCategory={state.skusByCategory}
            setSelectedSkuDetails={state.setSelectedSkuDetails}
            priceChange={state.priceChange}
            setPriceChange={state.setPriceChange}
            volumeElasticity={state.volumeElasticity}
            setVolumeElasticity={state.setVolumeElasticity}
            projectedRevenue={state.projectedRevenue}
            setProjectedRevenue={state.setProjectedRevenue}
            expectedMargin={state.expectedMargin}
            setExpectedMargin={state.setExpectedMargin}
            cannibalizationRisk={state.cannibalizationRisk}
            setCannibalizationRisk={state.setCannibalizationRisk}
            handleRunSim={state.handleRunSim}
            isSimulating={state.isSimulating}
            btnText={state.btnText}
            selectedSku={state.selectedSku}
            removeRevImpact={state.removeRevImpact}
            removeMarginImpact={state.removeMarginImpact}
            removeCustImpact={state.removeCustImpact}
            removeScImpact={state.removeScImpact}
            volChange={state.volChange}
            newRev={state.newRev}
            revDelta={state.revDelta}
            newMargin={state.newMargin}
            cannRiskLabel={state.cannRiskLabel}
            netLaunchRev={state.netLaunchRev}
            paretoData={state.paretoData}
            totalRev={state.totalRev}
            selectedAiClass={state.selectedAiClass}
            isDarkMode={isDarkMode}
            gridStroke={state.gridStroke}
            tickColor={state.tickColor}
            tooltipBg={state.tooltipBg}
            tooltipBorder={state.tooltipBorder}
            tooltipText={state.tooltipText}
            // new sunset parameters
            sunsetTransferenceRate={state.sunsetTransferenceRate}
            setSunsetTransferenceRate={state.setSunsetTransferenceRate}
            sunsetSubstituteSkuName={state.sunsetSubstituteSkuName}
            setSunsetSubstituteSkuName={state.setSunsetSubstituteSkuName}
            sunsetSubstituteOptions={state.sunsetSubstituteOptions}
            sunsetSubstituteSku={state.sunsetSubstituteSku}
            transferredVolume={state.transferredVolume}
            leakageVolume={state.leakageVolume}
            complexitySavings={state.complexitySavings}
            cannibalizationRelief={state.cannibalizationRelief}
            netProfitImpact={state.netProfitImpact}
          />

          {/* PORTFOLIO INTELLIGENCE DIRECTORY */}
          <div id="product-directory-section" style={{ scrollMarginTop: '100px' }}>
            <ProductDirectory 
              onSelectSku={(sku) => state.setSelectedSkuDetails(sku)} 
              selectedLocation={state.selectedLocation} 
              shortlistedSkus={state.shortlistedSkus}
              frozenSkus={state.frozenSkus}
            />
          </div>

        </div>
      )}

      {/* WORKSPACE VIEW 2: CANNIBALIZATION & PROMO ANALYST */}
      {state.activeView === 'analyst' && (
        <CannibalizationAnalystView
          skuA={state.skuA}
          setSkuA={state.setSkuA}
          skuB={state.skuB}
          setSkuB={state.setSkuB}
          correlation={state.correlation}
          setCorrelation={state.setCorrelation}
          category={state.category}
          hasScored={state.hasScored}
          setHasScored={state.setHasScored}
          selectedRoutingTeam={state.selectedRoutingTeam}
          setSelectedRoutingTeam={state.setSelectedRoutingTeam}
          setSelectedSkuDetails={state.setSelectedSkuDetails}
          skuACategory={state.skuACategory}
          skuBOptions={state.skuBOptions}
          skusByCategory={state.skusByCategory}
          pairRisk={state.pairRisk}
          riskVerdict={state.riskVerdict}
          verdictColor={state.verdictColor}
          scatterPairsData={state.scatterPairsData}
          promoErosionData={state.promoErosionData}
          highRiskPairs={state.highRiskPairs}
          moderateRiskPairs={state.moderateRiskPairs}
          promoRiskSkus={state.promoRiskSkus}
          handleAnalystScatterClick={state.handleAnalystScatterClick}
          isDarkMode={isDarkMode}
          gridStroke={state.gridStroke}
          tickColor={state.tickColor}
          tooltipBg={state.tooltipBg}
          tooltipBorder={state.tooltipBorder}
          tooltipText={state.tooltipText}
          // Control Center states & actions
          completedSteps={state.completedSteps}
          setStepCompleted={state.setStepCompleted}
          resetPairWorkflow={state.resetPairWorkflow}
          shortlistedSkus={state.shortlistedSkus}
          shortlistSku={state.shortlistSku}
          unshortlistSku={state.unshortlistSku}
          frozenSkus={state.frozenSkus}
          freezeSkuReplenishment={state.freezeSkuReplenishment}
          unfreezeSkuReplenishment={state.unfreezeSkuReplenishment}
          isControlCenterOpen={state.isControlCenterOpen}
          setIsControlCenterOpen={state.setIsControlCenterOpen}
          auditLog={state.auditLog}
          logAction={state.logAction}
          removeActionLog={state.removeActionLog}
        />
      )}

      {/* WORKSPACE VIEW 3: SIMPLIFY TO GROW */}
      {state.activeView === 'simplify' && (
        <SimplifyToGrow 
          role={role} 
          isDarkMode={isDarkMode} 
          selectedLocation={state.selectedLocation}
          timelineRange={timelineRange}
          setActiveTab={(tabId) => {
            if (tabId === 4) {
              state.setActiveView('simulator');
            } else if (setActiveTab) {
              setActiveTab(tabId);
            }
          }}
        />
      )}

      {/* ⑥ CROSS-FUNCTIONAL ACTIONS & AUDIT LOG LEDGER */}
      {state.activeView !== 'simplify' && (
        <div className="space-y-3 pt-6 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between gap-4 py-0.5 w-full">
            <div className="flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                ⑥ Cross-Functional Actions & Audit Log Ledger
              </h3>
            </div>
            {state.auditLog && state.auditLog.length > 0 && (
              <button
                onClick={exportLogsCSV}
                className="flex items-center gap-1.5 px-3 py-1 text-[9px] font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition shadow-sm border-none"
              >
                <Download size={10} />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          <div className="glass-card bg-white dark:bg-[#1a1a24] border border-black/10 dark:border-white/10 p-5 shadow-sm rounded-xl space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Search audit trail by variant name, action or rationale..." 
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full bg-black/5 dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-lg py-2 px-3 pl-8 text-xs font-semibold text-acies-gray dark:text-white outline-none focus:border-emerald-600"
                />
                <span className="absolute left-2.5 top-2.5 text-zinc-500 dark:text-zinc-500 text-xs">
                  <Search size={12} />
                </span>
              </div>
              <select 
                value={ledgerTeamFilter}
                onChange={(e) => setLedgerTeamFilter(e.target.value)}
                className="bg-black/5 dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-lg py-2 px-3 text-xs font-bold text-acies-gray dark:text-white outline-none focus:border-emerald-600"
              >
                <option value="ALL">All Teams</option>
                <option value="pricing">Pricing & Finance</option>
                <option value="product">Product Management</option>
                <option value="supplychain">Supply Chain Ops</option>
              </select>
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 text-zinc-400 font-bold uppercase tracking-wider text-[8px]">
                    <th className="py-2.5 px-3">Audit ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Variant Pair</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-3">Action Executed</th>
                    <th className="py-2.5 px-3">Parameters & Audit Rationale</th>
                    <th className="py-2.5 px-3 text-right">Sign-Off</th>
                    <th className="py-2.5 px-3 text-right">Document Vault</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                      <td className="py-3 px-3 font-mono font-bold text-zinc-500">{log.id}</td>
                      <td className="py-3 px-3 text-zinc-400 font-bold whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3 px-3">
                        <div className="font-black text-acies-gray dark:text-zinc-200">
                          {log.skuA} <span className="text-zinc-400 font-normal">↔</span> {log.skuB}
                        </div>
                        <div className="text-[8px] text-zinc-400 font-bold uppercase">Risk: {(log.riskScore * 100).toFixed(0)}%</div>
                      </td>
                      <td className="py-3 px-3 uppercase tracking-wider text-[8px] font-black">
                        <span className={`px-2 py-0.5 rounded ${
                          log.team === 'pricing' ? 'bg-red-500/10 text-red-500' :
                          log.team === 'product' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {log.team === 'pricing' ? 'Pricing' : log.team === 'product' ? 'Product' : 'Supply'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold uppercase text-acies-gray dark:text-zinc-200">{log.actionLabel}</td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-500 leading-relaxed max-w-sm">
                        <div className="font-black text-[9px] text-zinc-400 uppercase">Params: {log.details}</div>
                        <div className="mt-0.5">{log.rationale}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-black uppercase">
                        {log.actionLabel.startsWith('REVERSAL:') ? (
                          <span className="inline-flex items-center gap-1 text-amber-500 text-[8px]">
                            <X size={10} />
                            <span>Reversed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-500 text-[8px]">
                            <CheckCircle2 size={10} />
                            <span>Success</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {(() => {
                          const docType = getDocTypeForStep(log.team, log.actionLabel);
                          if (docType) {
                            return (
                              <button
                                type="button"
                                onClick={() => state.setSelectedDoc(docType)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black border border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 rounded-lg cursor-pointer transition border-none"
                              >
                                <FileText size={10} />
                                <span>View Doc</span>
                              </button>
                            );
                          }
                          return <span className="text-zinc-400 dark:text-zinc-700">—</span>;
                        })()}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                        No actions executed on the ledger yet. Open the Control Room to execute steps.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SKU DETAIL MODAL WINDOW */}
      <SkuIntelligenceModal
        sku={state.selectedSkuDetails}
        onClose={() => state.setSelectedSkuDetails(null)}
        setActiveTab={setActiveTab}
        onLoadInSimulator={(skuName) => {
          state.setSelectedSkuName(skuName);
          state.setSimTab('remove');
          state.setActiveView('simulator');
        }}
        auditLog={state.auditLog}
      />

      {/* KPI ACTION OPTIONS MODAL */}
      <KpiActionModal
        activeKpi={state.activeKpiAction}
        onClose={() => state.setActiveKpiAction(null)}
        setSelectedAiClass={state.setSelectedAiClass}
        setActiveView={state.setActiveView}
        setSimTab={state.setSimTab}
        setSelectedSkuName={state.setSelectedSkuName}
        setSelectedSkuDetails={(sku) => state.setSelectedSkuDetails(sku)}
      />

      {/* Full-Screen Action Control Room Modal Overlay */}
      {state.isControlCenterOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-sm z-[999] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fadeIn font-sans">
          <div className="bg-white dark:bg-acies-offwhite border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative text-zinc-900 dark:text-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-acies-gray dark:text-white flex items-center gap-2">
                  <Activity className="text-purple-600 dark:text-purple-400 stroke-[2.5]" size={16} />
                  <span>Action Control Desk</span>
                </h3>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase mt-1">
                  Manage and authorize operations for sibling variant: {state.skuA} vs {state.skuB}
                </p>
              </div>
              <button
                onClick={() => state.setIsControlCenterOpen(false)}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 border-none rounded-lg cursor-pointer text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition bg-transparent"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable routing panel */}
            <div className="flex-1 overflow-y-auto p-6 bg-black/[0.01] dark:bg-acies-gray/50">
              <ActionRoutingPanel
                role={role}
                auditLog={state.auditLog}
                hasScored={state.hasScored}
                pairRisk={state.pairRisk}
                riskVerdict={state.riskVerdict}
                verdictColor={state.verdictColor}
                skuA={state.skuA}
                skuB={state.skuB}
                category={state.category}
                selectedRoutingTeam={state.selectedRoutingTeam}
                setSelectedRoutingTeam={state.setSelectedRoutingTeam}
                completedSteps={state.completedSteps}
                setStepCompleted={state.setStepCompleted}
                resetPairWorkflow={state.resetPairWorkflow}
                shortlistedSkus={state.shortlistedSkus}
                shortlistSku={state.shortlistSku}
                unshortlistSku={state.unshortlistSku}
                frozenSkus={state.frozenSkus}
                freezeSkuReplenishment={state.freezeSkuReplenishment}
                unfreezeSkuReplenishment={state.unfreezeSkuReplenishment}
                logAction={state.logAction}
                logReversalAction={state.logReversalAction}
                removeActionLog={state.removeActionLog}
                isDarkMode={isDarkMode}
                exitDateDays={state.exitDateDays}
                setExitDateDays={state.setExitDateDays}
                pricingPriceShift={state.pricingPriceShift}
                setPricingPriceShift={state.setPricingPriceShift}
                supplySafetyStockShift={state.supplySafetyStockShift}
                setSupplySafetyStockShift={state.setSupplySafetyStockShift}
                selectedDoc={state.selectedDoc}
                setSelectedDoc={state.setSelectedDoc}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Document Viewer Modal Overlay */}
      {state.selectedDoc && documentTemplates[state.selectedDoc] && createPortal(
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-mono">
          <div className="bg-zinc-50 dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative text-zinc-900 dark:text-zinc-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 flex items-center gap-1.5 font-sans">
                  <FileText className="stroke-[2.5]" size={14} />
                  <span>Executive Document Vault</span>
                </h3>
                <p className="text-[8px] text-zinc-400 font-bold uppercase mt-1 font-sans">
                  Confidential Verification Certificate
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsPrinting(true);
                    setTimeout(() => {
                      setIsPrinting(false);
                      alert("Document sent to printer successfully.");
                    }, 1200);
                  }}
                  disabled={isPrinting || isDownloading}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 border-none rounded-lg cursor-pointer text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition bg-transparent disabled:opacity-55"
                  title="Print Document"
                >
                  <Printer size={14} />
                </button>
                <button
                  onClick={() => {
                    setIsDownloading(true);
                    setTimeout(() => {
                      setIsDownloading(false);
                      const doc = documentTemplates[state.selectedDoc!];
                      if (doc) {
                        const blob = new Blob([`${doc.title}\n${doc.subtitle}\n${doc.code}\n\n[CONFIDENTIAL DOCUMENT LOG]`], { type: 'text/plain;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.setAttribute('href', url);
                        link.setAttribute('download', `${state.selectedDoc}_report.txt`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }, 1200);
                  }}
                  disabled={isPrinting || isDownloading}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 border-none rounded-lg cursor-pointer text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition bg-transparent disabled:opacity-55"
                  title="Download PDF/Report"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => state.setSelectedDoc(null)}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 border-none rounded-lg cursor-pointer text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition bg-transparent"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Document Body Area */}
            <div className="flex-1 overflow-y-auto p-8 relative bg-white dark:bg-[#16161c]">
              {/* Paper Look */}
              <div className="border border-zinc-300 dark:border-zinc-800 p-6 rounded shadow-sm bg-zinc-50/50 dark:bg-zinc-900/30 min-h-full flex flex-col justify-between relative">
                
                {/* Confidential Watermark Ribbon */}
                <div className="absolute top-2 right-2 text-[6px] tracking-widest font-sans font-bold px-1.5 py-0.5 rounded border border-red-500/20 text-red-500 bg-red-500/5 rotate-[5deg] uppercase">
                  Confidential - Exec Eyes Only
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                  {/* Header info */}
                  <div className="space-y-1">
                    <div className="text-[14px] font-black tracking-tight text-zinc-900 dark:text-white leading-tight font-sans">
                      {documentTemplates[state.selectedDoc].title}
                    </div>
                    <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-sans">
                      {documentTemplates[state.selectedDoc].subtitle}
                    </div>
                    <div className="text-[7px] text-zinc-400 font-mono select-all break-all bg-black/5 dark:bg-white/5 p-1 rounded">
                      {documentTemplates[state.selectedDoc].code}
                    </div>
                  </div>

                  <hr className="border-t-2 border-zinc-300 dark:border-zinc-700" />

                  {/* Render content */}
                  <div className="text-zinc-700 dark:text-zinc-300 font-mono text-[10px] leading-relaxed">
                    {documentTemplates[state.selectedDoc].content}
                  </div>
                </div>

                {/* Footer security warning */}
                <div className="mt-8 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-[7px] text-zinc-400 font-sans uppercase tracking-widest text-center">
                  This document was automatically generated upon execution of state-certified workflow steps in the Acies Portfolio Intelligence Suite. All operations are logged on the immutable ledger under hash key protocols.
                </div>
              </div>

              {/* Status overlays for actions */}
              {isPrinting && (
                <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center animate-fadeIn z-50">
                  <div className="bg-white dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-xl p-6 shadow-xl flex flex-col items-center gap-3">
                    <RefreshCw size={24} className="animate-spin text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-300 font-sans">
                      Sending to Vault Printer...
                    </span>
                  </div>
                </div>
              )}

              {isDownloading && (
                <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center animate-fadeIn z-50">
                  <div className="bg-white dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-xl p-6 shadow-xl flex flex-col items-center gap-3">
                    <RefreshCw size={24} className="animate-spin text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-300 font-sans">
                      Generating Verification Report...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
