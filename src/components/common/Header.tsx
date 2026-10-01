/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { User, Sun, Moon, Home, Crown, Workflow, TrendingUp, Check, ChevronDown } from 'lucide-react';
import { Role } from '../../types/dashboard';
import { TimelineRange } from '../../utils/timeframe';

interface HeaderProps {
  currentRole: Role;
  setRole: (role: Role) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  timelineRange: TimelineRange;
  setTimelineRange: (range: TimelineRange) => void;
  onStartTour?: () => void;
  onClickHome?: () => void;
  searchBar?: React.ReactNode;
  activeTab?: number;
}

const ROLE_OPTIONS: { role: Role; label: string; icon: typeof Crown; dot: string }[] = [
  { role: 'VP Product Management', label: 'VP Product Management', icon: Crown, dot: 'bg-amber-500' },
  { role: 'Product Manager', label: 'Product Manager', icon: Workflow, dot: 'bg-green-500' },
  { role: 'Pricing and Margin Partner', label: 'Pricing & Margin Partner', icon: TrendingUp, dot: 'bg-blue-500' },
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setRole,
  isDarkMode,
  toggleDarkMode,
  timelineRange,
  setTimelineRange,
  onStartTour,
  onClickHome,
  searchBar,
  activeTab,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  return (
    <header className="h-14 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-acies-gray sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <img src="/logo-mark.png" alt="" className="h-7 w-7 shrink-0" />
        <div>
          <h1 className="text-xs font-display font-extrabold uppercase tracking-widest leading-none text-acies-gray dark:text-white">
            Product Lifecycle and Portfolio Intelligence
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Unified premium toolbar widget matching template */}
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 border border-black/10 dark:border-white/10 rounded-xl p-1.5 shadow-sm">
          {/* Active Persona indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800/80 border border-black/10 dark:border-white/10 rounded-lg text-zinc-700 dark:text-zinc-200 font-extrabold text-[9.5px] uppercase tracking-wider shadow-sm shrink-0">
            <span className={`h-1.5 w-1.5 rounded-full animate-pulse shrink-0 ${
              currentRole === 'VP Product Management' ? 'bg-amber-500' :
              currentRole === 'Product Manager' ? 'bg-green-500' : 'bg-blue-500'
            }`} />
            <span className="text-zinc-400 dark:text-zinc-500 font-medium normal-case mr-0.5">Profile:</span>
            <span>{currentRole}</span>
          </div>

          <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10 shrink-0" />

          {searchBar}
          
          <button 
            onClick={onClickHome} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-acies-gray dark:text-white font-extrabold text-[10px] uppercase tracking-wider transition-colors cursor-pointer outline-none"
            title="Go to HOME"
          >
            <Home size={13} className="shrink-0" />
            <span>HOME</span>
          </button>

          <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10 shrink-0" />

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-acies-gray dark:text-white font-extrabold text-[10px] transition-colors cursor-pointer outline-none"
              title="Switch Profile"
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen}
            >
              <User size={13} className="shrink-0 opacity-70" />
              <span>Switch profile</span>
              <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-3 py-2 border-b border-black/5 dark:border-white/5">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400">Switch Profile</span>
                </div>
                {ROLE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isActive = opt.role === currentRole;
                  return (
                    <button
                      key={opt.role}
                      onClick={() => { setRole(opt.role); setIsProfileMenuOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors cursor-pointer outline-none ${
                        isActive ? 'bg-black/[0.03] dark:bg-white/[0.05]' : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${opt.dot}`} />
                      <Icon size={14} className="shrink-0 text-zinc-500 dark:text-zinc-400" />
                      <span className="flex-1 text-[11px] font-bold text-acies-gray dark:text-zinc-200">{opt.label}</span>
                      {isActive && <Check size={13} className="shrink-0 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button 
            onClick={toggleDarkMode} 
            className="p-2 bg-white dark:bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-acies-gray dark:text-white/85 transition-colors cursor-pointer outline-none flex items-center justify-center"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>

      </div>
    </header>
  );
};
