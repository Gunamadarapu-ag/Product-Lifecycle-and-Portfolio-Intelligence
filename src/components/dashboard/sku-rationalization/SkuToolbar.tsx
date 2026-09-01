/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SkuToolbar — consolidated header / view-switcher / region selector.
 * Renders the correct variant based on `role`.
 */

import React from 'react';
import { Check, MapPin, HelpCircle } from 'lucide-react';
import { Role } from '../../../types/dashboard';
interface SkuToolbarProps {
  role: Role;
  isDarkMode: boolean;
  activeView: 'simulator' | 'analyst' | 'simplify';
  setActiveView: (v: 'simulator' | 'analyst' | 'simplify') => void;
  selectedLocation: string;
  setSelectedLocation: (l: string) => void;
  refreshTime: string;
  setSelectedAiClass: (c: string | null) => void;
}

export const SkuToolbar: React.FC<SkuToolbarProps> = ({
  role, isDarkMode, activeView, setActiveView,
  selectedLocation, setSelectedLocation, refreshTime, setSelectedAiClass,
}) => {

  const regionOptions = [
    { value: 'ALL',      label: 'All Regions' },
    { value: 'APAC',     label: 'APAC' },
    { value: 'EMEA',     label: 'EMEA' },
    { value: 'Americas', label: 'Americas' },
  ];

  const switchView = (v: 'simulator' | 'analyst' | 'simplify') => {
    setActiveView(v);
    setSelectedAiClass(null);
  };
  if (role === 'VP Product Management') {
    return (
      <div className={`p-4 rounded-xl w-full border transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#202022] border-[#2c2c30] text-white shadow-lg'
          : 'bg-white border-black/10 text-zinc-800 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          {/* Title */}
          <div className="w-full md:flex-1 flex justify-start">
            <h2 className={`text-base font-display font-extrabold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              SKU Rationalization
            </h2>
          </div>

          <div className="w-full md:flex-1 flex justify-start md:justify-center">
            <div className="flex items-center gap-2 shrink-0">
              {(['simulator', 'analyst', 'simplify'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => switchView(id)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center outline-none border ${
                    activeView === id
                      ? 'bg-[#5850ec] text-white border-[#5850ec] shadow-sm shadow-[#5850ec]/20 font-extrabold'
                      : 'bg-transparent border-black/15 dark:border-white/15 text-zinc-600 dark:text-zinc-400 hover:border-black/25 dark:hover:border-white/25 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {id === 'simulator' ? 'Portfolio Simulator' : id === 'analyst' ? 'Cannibalisation Simulator' : 'Simplify to Grow'}
                </button>
              ))}
            </div>
          </div>

          {/* Region + sync badge */}
          <div className="w-full md:flex-1 flex justify-start md:justify-end items-center gap-3">
            <div className={`flex items-center gap-1.5 bg-transparent border rounded-lg px-2.5 py-1 transition-colors duration-200 ${
              isDarkMode ? 'border-zinc-700 text-zinc-300' : 'border-zinc-300 text-zinc-700'
            }`}>
              <MapPin size={11} className={isDarkMode ? 'text-zinc-500' : 'text-zinc-500'} />
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className={`bg-transparent border-none text-[10px] font-bold outline-none cursor-pointer focus:ring-0 py-0 pr-8 transition-colors duration-200 ${
                  isDarkMode ? 'text-zinc-300' : 'text-zinc-700'
                }`}
                style={{ background: 'transparent' }}
              >
                {regionOptions.map(o => (
                  <option key={o.value} value={o.value} className={isDarkMode ? 'bg-[#202022] text-white' : 'bg-white text-zinc-800'}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg shrink-0 border transition-colors duration-200 ${
              isDarkMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-[#e6fcf5] text-[#0ca678] border-[#c3fae8]'
            }`}>
              <Check size={11} className="stroke-[3]" />
              <span>Active sync</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Non-VP (analyst / default) variant ────────────────────────────────────
  return (
    <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3 rounded shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 w-full">

      {/* Left: Title & tooltip */}
      <div className="flex items-center gap-2.5 self-start lg:self-auto">
        <div className="w-1.5 h-6 bg-acies-yellow rounded-full shrink-0 animate-pulse" />
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-[12px] font-display font-extrabold uppercase tracking-wider text-acies-gray dark:text-white leading-none">
              {activeView === 'simulator' ? 'SKU Rationalization Command Desk' : activeView === 'analyst' ? 'Cannibalization & Margin Audit' : 'Bain Simplify to Grow'}
            </h2>
            <div className="relative group/help">
              <HelpCircle size={12} className="text-zinc-400 hover:text-acies-yellow transition-colors cursor-help shrink-0" />
              <div className="absolute left-0 top-5 w-64 bg-zinc-900 border border-white/10 text-white text-[9px] p-2.5 rounded shadow-2xl z-50 pointer-events-none opacity-0 group-hover/help:opacity-100 transition-opacity duration-200 leading-relaxed">
                <p className="font-bold mb-1 text-acies-yellow">
                  {activeView === 'simulator' ? 'Simulation Workspace Guide:' : activeView === 'analyst' ? 'Audit Analyst Guide:' : 'Simplify to Grow Guide:'}
                </p>
                <p className="opacity-85">
                  {activeView === 'simulator'
                    ? 'Audit product assortments using AI segmentation, run multi-variable gross margin simulations, and analyze Pareto distributions to optimize tail-end catalog complexity.'
                    : activeView === 'analyst'
                      ? 'Model cross-product cannibalization coefficients, evaluate price-pack margin elasticity corridors, and identify high promotion dependency risks.'
                      : 'Apply the Bain Beyond the Tail framework to de-average shared costs, identify Bad Complexity, and rank SKUs by Consumer-Right IPPV value.'}
                </p>
              </div>
            </div>
          </div>
          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Category Assortment Workspace</p>
        </div>
      </div>

      {/* Center: View switcher tabs */}
      <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded border border-black/5 dark:border-white/10 min-w-[480px]">
        {[
          { id: 'simulator', label: 'Portfolio Simulator Command' },
          { id: 'analyst',   label: 'Cannibalisation Simulator' },
          { id: 'simplify',  label: 'Simplify to Grow' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => switchView(tab.id as 'simulator' | 'analyst' | 'simplify')}
            className={`flex-1 py-1.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm transition-all border-none cursor-pointer text-center outline-none ${
              activeView === tab.id
                ? 'bg-acies-yellow text-white dark:text-acies-gray font-extrabold shadow-sm shadow-black/10'
                : 'bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right: Region + sync badge */}
      <div className="flex items-center gap-4 self-end lg:self-auto flex-wrap justify-end">
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded border border-black/5 dark:border-white/10 shrink-0">
          <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Region:</span>
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="bg-transparent border-none text-[8.5px] font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 outline-none cursor-pointer focus:ring-0 py-0"
            style={{ background: 'transparent' }}
          >
            {regionOptions.map(o => (
              <option key={o.value} value={o.value} className="bg-white dark:bg-zinc-800 text-black dark:text-white">
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-wider rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Active Ledger Sync
          </span>
          <span className="text-[9px] font-mono opacity-40 font-bold">Refreshed {refreshTime}</span>
        </div>
      </div>

    </div>
  );
};
