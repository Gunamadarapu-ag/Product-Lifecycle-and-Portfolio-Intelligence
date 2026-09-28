/**
 * SKU drill-down: explorer grid, root-cause analysis and per-SKU actions.
 *
 * Extracted from DemoTab.tsx (1,233 lines).
 */
import React, { useState, useMemo } from 'react';
import { Search, Download, X, Activity, ArrowRight, Users, Building, TrendingUp, Mail, Truck, Store, Globe } from 'lucide-react';
import { Task } from './TrackerTab';
import { ModalShell } from '../../common/Modal';
import { MarginWaterfallChart, SkuCategoryBenchmarks } from './DemoTabCharts';
import { EXPLORER_ROWS } from './demoTabData';
import { getRationalisationReason, getRcaDetails, getSimulationStrategy } from './demoTabHelpers';
// DemoTab previously carried a byte-identical copy of this; both now use one source.
import { generateTasksForSku } from './rationalisationHelpers';

export interface DemoTabProps {
  role?: string;
  tasks?: Record<string, Task[]>;
  setTasks?: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
  setActiveTab?: (tabId: number) => void;
  actionFilter?: string;
  setActionFilter?: (action: string) => void;
  searchQuery?: string;
  setSearchQuery?: (search: string) => void;
}

export const DemoTab: React.FC<DemoTabProps> = ({ 
  role, 
  tasks, 
  setTasks, 
  setActiveTab,
  actionFilter: propsActionFilter,
  setActionFilter: propsSetActionFilter,
  searchQuery: propsSearchQuery,
  setSearchQuery: propsSetSearchQuery
}) => {
  const [selectedSkuForRca, setSelectedSkuForRca] = useState<any>(null);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [simulatingSkuName, setSimulatingSkuName] = useState<string | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simViewMode, setSimViewMode] = useState<'revenue' | 'margin'>('revenue');
  
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = propsSearchQuery !== undefined ? propsSearchQuery : localSearchQuery;
  const setSearchQuery = propsSetSearchQuery !== undefined ? propsSetSearchQuery : setLocalSearchQuery;
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [impactFilter, setImpactFilter] = useState('All');
  
  const [localActionFilter, setLocalActionFilter] = useState('All');
  const actionFilter = propsActionFilter !== undefined ? propsActionFilter : localActionFilter;
  const setActionFilter = propsSetActionFilter !== undefined ? propsSetActionFilter : setLocalActionFilter;
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [executionSkuName, setExecutionSkuName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleSimulate = (skuName: string) => {
    setSimulatingSkuName(skuName);
    setIsSimulationModalOpen(true);
    setSimulationProgress(0);
    setSimulationResult(null);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setSimulationProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setSimulationResult({
          grossMarginImprovement: '+1.45% (+145 bps)',
          costSavings: '$412K',
          workingCapital: '$1.15M',
          cannibalization: 'Low (14% recovery on sibling SKUs)',
          customerTransition: '96.2%',
          recommendation: 'Approve sunset recommendation and shift active inventory to consolidated core line.'
        });
      }
    }, 100);
  };

  // Filter logic for explorer table
  const filteredRows = useMemo(() => {
    return EXPLORER_ROWS.filter(row => {
      const matchesSearch = row.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            row.factor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            row.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || row.cat === categoryFilter;
      const matchesProductCategory = productCategoryFilter === 'All' || row.productCat === productCategoryFilter;
      const matchesRegion = regionFilter === 'All' || row.region === regionFilter;
      const matchesImpact = impactFilter === 'All' || row.impact === impactFilter;
      const matchesAction = actionFilter === 'All' || row.action.toLowerCase().includes(actionFilter.toLowerCase()) || 
                            actionFilter.toLowerCase().includes(row.action.toLowerCase());
      return matchesSearch && matchesCategory && matchesProductCategory && matchesRegion && matchesImpact && matchesAction;
    });
  }, [searchQuery, categoryFilter, productCategoryFilter, regionFilter, impactFilter, actionFilter]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, productCategoryFilter, regionFilter, impactFilter, actionFilter]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  const handleExportCSV = () => {
    const headers = ['SKU', 'Category', 'Region', 'Identified Issue', 'Rationale Factors', 'Description', 'Impact Level', 'Recommended Action', 'Investigate'];
    const csvContent = [
      headers.join(','),
      ...filteredRows.map(r => `"${r.sku}","${r.productCat}","${r.region}","${r.factor}","${r.cat}","${r.desc}","${r.impact}","${r.action}","Run RCA"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Demo_Detailed_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">


      {/* Detailed Rationale Explorer */}
      <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200">DETAILED RATIONALE EXPLORER</h3>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">Drill down into specific rationale factors</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-black/2 dark:bg-white/2 p-2 rounded-sm border border-black/5 dark:border-white/5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
            <input
              type="text"
              placeholder="Search rationale factors or SKUs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 p-1.5 pl-8 text-[10px] font-semibold rounded-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-acies-yellow"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9.5px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Beverages">Beverages</option>
              <option value="Snacks">Snacks</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Household">Household</option>
            </select>

            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9.5px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
            >
              <option value="All">All Regions</option>
              <option value="LATAM">LATAM</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="APAC">APAC</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9.5px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
            >
              <option value="All">All Rationale Factors</option>
              <option value="Financial Reasons">Financial Reasons</option>
              <option value="Portfolio Reasons">Portfolio Reasons</option>
              <option value="Supply Chain Reasons">Supply Chain Reasons</option>
              <option value="Customer & Market">Customer & Market</option>
              <option value="Regulatory & Risk">Regulatory & Risk</option>
            </select>

            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
              className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9.5px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
            >
              <option value="All">All Impact Levels</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low impact">Low impact</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 rounded-sm p-1.5 text-[9.5px] font-bold text-zinc-700 dark:text-zinc-400 outline-none cursor-pointer"
            >
              <option value="All">All Actions</option>
              <option value="Discontinue">Discontinue / Consolidate</option>
              <option value="Reposition">Reposition</option>
              <option value="Consolidate">Consolidate</option>
              <option value="Reformulate">Reformulate / Redesign</option>
              <option value="Invest">Invest / Expand</option>
            </select>

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none"
            >
              <Download size={11} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Explorer Table */}
        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[8.5px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-extrabold bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-2">Category</th>
                <th className="py-2.5 px-2">Region</th>
                <th className="py-2.5 px-2">Identified Issue</th>
                <th className="py-2.5 px-2">Rationale Factors</th>
                <th className="py-2.5 px-2">Description</th>
                <th className="py-2.5 px-2">Impact Level</th>
                <th className="py-2.5 px-2">Recommended Action</th>
                <th className="py-2.5 px-3 text-right">Investigate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-400">
              {paginatedRows.map(row => (
                <tr key={row.sku} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
                  <td className="py-2.5 px-3 font-extrabold text-zinc-900 dark:text-zinc-100">{row.sku}</td>
                  <td className="py-2.5 px-2 font-bold text-zinc-800 dark:text-zinc-200">{row.productCat}</td>
                  <td className="py-2.5 px-2 font-bold text-zinc-800 dark:text-zinc-200">{row.region}</td>
                  <td className="py-2.5 px-2 font-bold text-zinc-800 dark:text-zinc-200">{row.factor}</td>
                  <td className="py-2.5 px-2 text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-600">{row.cat}</td>
                  <td className="py-2.5 px-2 text-zinc-500 dark:text-zinc-400 font-normal">{row.desc}</td>
                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      row.impact === 'High' 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10' 
                        : row.impact === 'Medium'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10'
                          : row.impact === 'Low impact'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10'
                            : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/10'
                    }`}>
                      {row.impact}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-extrabold text-zinc-900 dark:text-zinc-300">{row.action}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedSkuForRca(row)}
                      className="p-1 px-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white border border-indigo-200 dark:border-indigo-800/40 rounded text-[8.5px] font-black uppercase tracking-wider cursor-pointer inline-flex items-center gap-1 transition-all shadow-sm"
                      title="View Detailed Root Cause Analysis"
                    >
                      <Activity size={10} className="stroke-[2.5]" />
                      <span>Analyze</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-zinc-500 dark:text-zinc-500">
                    No SKUs match your active filter criteria. Try resetting your search or filter pills.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/5 text-[9.5px] font-bold text-zinc-500 dark:text-zinc-400">
            <span>Showing {Math.min(filteredRows.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredRows.length, currentPage * itemsPerPage)} of {filteredRows.length} SKUs</span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-black/5 cursor-pointer text-[9px] uppercase font-bold text-zinc-700 dark:text-zinc-400"
              >
                Previous
              </button>
              <span className="font-mono">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-black/5 cursor-pointer text-[9px] uppercase font-bold text-zinc-700 dark:text-zinc-400"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Root Cause Analysis Modal */}
      {selectedSkuForRca && (() => {
        const rca = getRcaDetails(selectedSkuForRca.sku, selectedSkuForRca.factor);
        return (
          <ModalShell isOpen onClose={() => setSelectedSkuForRca(null)} layer="base" blur="sm" className="flex items-center justify-center p-4 md:p-6 animate-fadeIn">
            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-slideIn">
              
              {/* Header */}
              <div className="p-5 border-b border-b-black/5 dark:border-b-white/5 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-tight">{selectedSkuForRca.sku}</h3>
                  <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase mt-0.5 block">{selectedSkuForRca.productCat} Category</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => setSelectedSkuForRca(null)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
 
              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-700 dark:text-zinc-400">
                


                {/* Key Findings */}
                <div className="space-y-2">
                  <h4 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500">Primary Root Causes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {rca.rootCauses.map((cause, index) => (
                      <div key={cause.title} className="bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/5 p-2.5 rounded-sm relative flex flex-col gap-2 text-left hover:border-indigo-500/30 transition-all hover:shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-[8.5px] shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-600/10 px-1.5 py-0.5 rounded">FACTOR</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-[10.5px] leading-tight">{cause.title}</span>
                          <p className="text-zinc-600 dark:text-zinc-400 text-[9px] leading-normal">{cause.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Margin Analysis Section */}
                <div className="space-y-4">
                  <h4 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500">Margin Performance Diagnostics</h4>
                  
                  {/* Margin KPI Tiles */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm text-left">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 block mb-2 lowercase">target margin</span>
                      <h4 className="text-2xl font-display font-black text-zinc-800 dark:text-white leading-none">20.0%</h4>
                    </div>
                    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm text-left">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 block mb-2 lowercase">actual margin</span>
                      <h4 className="text-2xl font-display font-black text-zinc-800 dark:text-white leading-none">14.6%</h4>
                    </div>
                    <div className="bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-sm text-left">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 block mb-2 lowercase">total gap</span>
                      <h4 className="text-2xl font-display font-black text-red-500 dark:text-red-400 leading-none">-5.4pt</h4>
                    </div>
                  </div>

                  {/* Waterfall and Benchmarks side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MarginWaterfallChart />
                    <SkuCategoryBenchmarks skuName={selectedSkuForRca.sku} category={selectedSkuForRca.productCat} />
                  </div>
                </div>
               </div>

              {/* Footer */}
              <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-between items-center">
                <button 
                  onClick={() => {
                    handleSimulate(selectedSkuForRca.sku);
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-800 hover:to-indigo-800 text-white rounded-sm text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all duration-150"
                >
                  Simulate Rationalisation
                </button>
                <button 
                  onClick={() => setSelectedSkuForRca(null)}
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-400 rounded text-[9.5px] font-bold uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  Close Analysis
                </button>
              </div>

            </div>
          </ModalShell>
        );
      })()}

      {/* Simulation Modal Popup */}
      {isSimulationModalOpen && simulatingSkuName && (
        <ModalShell isOpen onClose={() => setIsSimulationModalOpen(false)} layer="base" blur="sm" className="flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-slideIn">
            {/* Header */}
            <div className="p-5 border-b border-b-black/5 dark:border-b-white/5 flex justify-between items-start">
              <div>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-black block mb-1">Rationalisation Simulator</span>
                <h3 className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-tight">{simulatingSkuName}</h3>
              </div>
              <button 
                onClick={() => {
                  setIsSimulationModalOpen(false);
                  setSimulatingSkuName(null);
                  setSimulationResult(null);
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-3 text-[10px] text-zinc-700 dark:text-zinc-400">
              {simulationProgress < 100 ? (
                <div className="space-y-3 py-6 text-center">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider">Simulating SKU Rationalisation</h4>
                  <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 max-w-[280px] mx-auto">Running scenario models, cross-elasticity checks, and inventory buffer calculations...</p>
                  <div className="w-full bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-100" style={{ width: `${simulationProgress}%` }} />
                  </div>
                  <span className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400">{simulationProgress}% Complete</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-1.5 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center">
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider">Simulation Results</h4>
                    </div>
                  </div>
                  
                  <div className="border border-black/10 dark:border-white/10 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse text-[9.5px]">
                      <thead>
                        <tr className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-[8px] uppercase font-black text-zinc-500 tracking-wider">
                          <th className="py-2 px-3">Evaluation Metric</th>
                          <th className="py-2 px-2 text-right">Current</th>
                          <th className="py-2 px-2 text-right">Simulated</th>
                          <th className="py-2 px-3 text-right">Delta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5 font-semibold text-zinc-700 dark:text-zinc-400">
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-800 dark:text-zinc-200">Revenue Impact</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$4.20M</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$5.07M</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-500 font-bold">+$870K (+20.7%)</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-800 dark:text-zinc-200">Cost Savings (COGS)</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$3.59M</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$3.08M</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-500 font-bold">-$510K (-14.2%)</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-800 dark:text-zinc-200">Inventory Impact (Working Capital)</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$1.20M</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">$150K</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-500 font-bold">-$1.05M (-87.5%)</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-zinc-800 dark:text-zinc-200">Risks Score (Supply/Defect)</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">68%</td>
                          <td className="py-2 px-2 text-right font-mono font-medium">15%</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-500 font-bold">-53% (-77.9%)</td>
                        </tr>
                        <tr className="bg-emerald-500/5 dark:bg-emerald-500/5 border-t border-black/10 dark:border-white/10">
                          <td className="py-2 px-3 font-extrabold text-zinc-900 dark:text-white">Expected ROI %</td>
                          <td className="py-2 px-2 text-right font-mono font-black">12.4%</td>
                          <td className="py-2 px-2 text-right font-mono font-black">34.8%</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-emerald-500">+22.4% (+2240 bps)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-sm text-left">
                    <span className="text-[8.5px] font-black text-amber-600 dark:text-amber-500 block uppercase tracking-widest mb-1">Descriptive Rationalisation Justification</span>
                    <p className="text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-400 font-semibold">{getRationalisationReason(selectedSkuForRca?.factor || '')}</p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[8.5px] font-black text-zinc-500 dark:text-zinc-400 block uppercase tracking-widest text-left">Simulation Evaluation Factors</span>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Verify Profitability Card */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[72px] shadow-sm">
                        <div>
                          <span className="text-[9.5px] text-zinc-500 dark:text-zinc-500 font-semibold block leading-none">Verify profitability</span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white block mt-1.5 leading-none">21.4%</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-semibold mt-2 block leading-none">+3.6pt vs 20.0% floor</span>
                        <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                      </div>

                      {/* Customer Impact Card */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[72px] shadow-sm">
                        <div>
                          <span className="text-[9.5px] text-zinc-500 dark:text-zinc-500 font-semibold block leading-none">Customer impact</span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white block mt-1.5 leading-none">96.2%</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-semibold mt-2 block leading-none">low transition friction</span>
                        <Users size={13} className="text-emerald-600 dark:text-emerald-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                      </div>

                      {/* Market Trends Card */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[72px] shadow-sm">
                        <div>
                          <span className="text-[9.5px] text-zinc-500 dark:text-zinc-500 font-semibold block leading-none">Market trends</span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white block mt-1.5 leading-none">strong</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-semibold mt-2 block leading-none">matches larger-sizing demand shift</span>
                        <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                      </div>

                      {/* Strategic Fit Card */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[72px] shadow-sm">
                        <div>
                          <span className="text-[9.5px] text-zinc-500 dark:text-zinc-500 font-semibold block leading-none">Strategic fit</span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white block mt-1.5 leading-none">-2</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-semibold mt-2 block leading-none">6 → 4 active warehouses</span>
                        <Building size={13} className="text-emerald-600 dark:text-emerald-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const strategy = getSimulationStrategy(selectedSkuForRca?.action || '');
                    const actionVal = selectedSkuForRca?.action || '';
                    const normAction = actionVal.toLowerCase();
                    
                    let depts: { label: string, theme: string }[] = [];
                    if (normAction.includes('sunset') || normAction.includes('discontinue') || normAction.includes('rationalise') || normAction.includes('remove') || normAction.includes('rationalize')) {
                      depts = [
                        { label: 'PMO', theme: 'bg-[#fbece5] text-[#9a3412] border-orange-500/10' },
                        { label: 'Procurement', theme: 'bg-[#ffedd5] text-[#9a3412] border-amber-500/10' },
                        { label: 'Finance', theme: 'bg-[#fee2e2] text-[#991b1b] border-red-500/10' },
                        { label: 'Consumer', theme: 'bg-[#fafaf9] text-[#44403c] border-stone-500/10' }
                      ];
                    } else if (normAction.includes('consolidate') || normAction.includes('merge')) {
                      depts = [
                        { label: 'PMO', theme: 'bg-[#fbece5] text-[#9a3412] border-orange-500/10' },
                        { label: 'R&D', theme: 'bg-[#fdf2f8] text-[#9d174d] border-pink-500/10' },
                        { label: 'Marketing', theme: 'bg-[#e0f2fe] text-[#075985] border-sky-500/10' },
                        { label: 'Sales', theme: 'bg-[#f0fdf4] text-[#166534] border-emerald-500/10' }
                      ];
                    } else {
                      depts = [
                        { label: 'R&D', theme: 'bg-[#fdf2f8] text-[#9d174d] border-pink-500/10' },
                        { label: 'Quality Assurance', theme: 'bg-[#e0f7fa] text-[#006064] border-cyan-500/10' },
                        { label: 'Procurement', theme: 'bg-[#ffedd5] text-[#9a3412] border-amber-500/10' },
                        { label: 'Sustainability', theme: 'bg-[#ecfccb] text-[#3f6212] border-lime-500/10' }
                      ];
                    }

                    return (
                      <div className="flex flex-col gap-3">
                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-sm text-left">
                          <span className="text-[8.5px] font-black text-indigo-500 dark:text-indigo-400 block uppercase tracking-widest mb-1">{strategy.title}</span>
                          <p className="text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-400 font-semibold">{strategy.recommendation}</p>
                        </div>
                        
                        <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-sm text-left">
                          <span className="text-[8.5px] font-black text-zinc-500 dark:text-zinc-600 block uppercase tracking-widest mb-2">Auto-Task Assignment Preview</span>
                          <div className="flex flex-wrap gap-1.5">
                            {depts.map((d) => (
                              <span 
                                key={d.label} 
                                className={`px-2 py-0.5 border rounded text-[8px] font-black uppercase ${d.theme}`}
                              >
                                {d.label}
                              </span>
                            ))}
                          </div>
                          <span className="text-[8.5px] font-semibold text-zinc-400 dark:text-zinc-500 block mt-2 leading-tight">
                            Upon executing, a new unread task will be dispatched to the workstreams highlighted above.
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsSimulationModalOpen(false);
                  setSimulatingSkuName(null);
                  setSimulationResult(null);
                }}
                className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-400 rounded text-[9.5px] font-bold uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                Close Simulator
              </button>
              {simulationProgress === 100 && (
                <button 
                  onClick={() => {
                    if (role === 'Product Manager' && setTasks) {
                      const skuNameVal = selectedSkuForRca?.name || selectedSkuForRca?.skuName || simulatingSkuName || 'Selected SKU';
                      const newTasks = generateTasksForSku(
                        skuNameVal,
                        selectedSkuForRca?.action || '',
                        selectedSkuForRca?.factor || ''
                      );
                      setTasks(prev => {
                        const updated = { ...prev };
                        Object.keys(newTasks).forEach(deptKey => {
                          updated[deptKey] = [...(updated[deptKey] || []), ...newTasks[deptKey]];
                        });
                        return updated;
                      });
                    }
                    setIsSimulationModalOpen(false);
                    setSimulatingSkuName(null);
                    setSimulationResult(null);
                    setSelectedSkuForRca(null);
                    if (setActiveTab) {
                      setActiveTab(11);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-sm flex items-center gap-1"
                >
                  <span>Execute Plan</span>
                  <ArrowRight size={11} />
                </button>
              )}
            </div>
          </div>
        </ModalShell>
      )}
      {/* Execution Plan & Communication Modal */}
      {isExecutionModalOpen && executionSkuName && (
        <ModalShell isOpen onClose={() => setIsExecutionModalOpen(false)} layer="panel" blur="sm" className="flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-slideIn">
            
            {/* Header */}
            <div className="p-5 border-b border-b-black/5 dark:border-b-white/5 flex justify-between items-start">
              <div>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-black block mb-1">Execution Action Plan</span>
                <h3 className="text-base font-display font-extrabold text-zinc-900 dark:text-white leading-tight">Communication Playbook</h3>
                <p className="text-[9.5px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">Required communications for {executionSkuName}</p>
              </div>
              <button 
                onClick={() => {
                  setIsExecutionModalOpen(false);
                  setExecutionSkuName(null);
                  setSelectedSkuForRca(null);
                  setSimulatingSkuName(null);
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-4 text-[10px] text-zinc-700 dark:text-zinc-400">
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 p-3 rounded-sm text-left">
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 block uppercase tracking-widest mb-1">Execution Objective</span>
                <p className="text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                  To successfully coordinate the rationalisation of <span className="font-bold text-zinc-900 dark:text-white">{executionSkuName}</span>, the Product Manager must dispatch and align the following communication streams across sales, supply chain, retail channels, and catalogs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Sales Card */}
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[90px] shadow-sm">
                  <div>
                    <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider leading-none mb-1.5">Sales & Account Managers</span>
                    <span className="text-[10.5px] font-bold text-zinc-900 dark:text-white block leading-tight">Send substitution templates</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-2 block leading-relaxed">
                    Provide the sales force with email sequences and pricing alternatives to migrate accounts to sister variants.
                  </span>
                  <Mail size={13} className="text-indigo-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                </div>

                {/* Supply Chain Card */}
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[90px] shadow-sm">
                  <div>
                    <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider leading-none mb-1.5">Operations & Logistics</span>
                    <span className="text-[10.5px] font-bold text-zinc-900 dark:text-white block leading-tight">Issue stop & wind-down order</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-2 block leading-relaxed">
                    Notify purchasing agents to freeze raw stock orders, and set target manufacturing wind-down dates.
                  </span>
                  <Truck size={13} className="text-indigo-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                </div>

                {/* Retail Distributors Card */}
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[90px] shadow-sm">
                  <div>
                    <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider leading-none mb-1.5">Distributors & Retailers</span>
                    <span className="text-[10.5px] font-bold text-zinc-900 dark:text-white block leading-tight">Dispatch phase-out notification</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-2 block leading-relaxed">
                    Deliver formal 60-day discontinuation letters detailing buyback eligibility limits and depletion windows.
                  </span>
                  <Store size={13} className="text-indigo-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                </div>

                {/* Database & Portfolio Card */}
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-3.5 relative text-left flex flex-col justify-between min-h-[90px] shadow-sm">
                  <div>
                    <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider leading-none mb-1.5">Master Catalog Database</span>
                    <span className="text-[10.5px] font-bold text-zinc-900 dark:text-white block leading-tight">Flag SKU status as Deprecated</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-2 block leading-relaxed">
                    Coordinate with digital category analysts to mark SKU as inactive across digital inventory records.
                  </span>
                  <Globe size={13} className="text-indigo-500 absolute top-3.5 right-3.5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-end gap-3">
              <button 
                onClick={() => {
                  if (role === 'Product Manager' && setTasks) {
                    const skuNameVal = selectedSkuForRca?.name || selectedSkuForRca?.skuName || executionSkuName || 'Selected SKU';
                    const newTasks = generateTasksForSku(
                      skuNameVal,
                      selectedSkuForRca?.action || '',
                      selectedSkuForRca?.factor || ''
                    );
                    setTasks(prev => {
                      const updated = { ...prev };
                      Object.keys(newTasks).forEach(deptKey => {
                        updated[deptKey] = [...(updated[deptKey] || []), ...newTasks[deptKey]];
                      });
                      return updated;
                    });
                  }
                  setIsExecutionModalOpen(false);
                  setExecutionSkuName(null);
                  setSelectedSkuForRca(null);
                  setSimulatingSkuName(null);
                  if (setActiveTab) {
                    setActiveTab(11);
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-sm flex items-center gap-1"
              >
                <span>Confirm & Mark Completed</span>
              </button>
            </div>

          </div>
        </ModalShell>
      )}
    </div>
  );
};
