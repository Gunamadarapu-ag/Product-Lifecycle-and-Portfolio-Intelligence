import React from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchItem } from '../../hooks/useGlobalSearch';

interface GlobalSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  activeSearchIndex: number;
  setActiveSearchIndex: (index: number) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  filteredSearchItems: SearchItem[];
  groupedSearchResults: Record<string, SearchItem[]>;
  handleSelectSearchItem: (item: SearchItem) => void;
  handleKeyDownInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
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
}) => {
  return (
    <div ref={searchContainerRef} className="relative w-64 md:w-72">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
          <Search size={13} />
        </span>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setActiveSearchIndex(-1);
          }}
          onFocus={() => setIsSearchFocused(true)}
          onKeyDown={handleKeyDownInput}
          placeholder="Search metrics or SKUs..."
          className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-zinc-700/80 rounded-full px-3 py-1 pl-8.5 pr-24 text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all animate-fadeIn"
        />
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1 pointer-events-none select-none">
          <kbd className="text-[7.5px] font-extrabold bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/15 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400 font-mono">
            Ctrl K
          </kbd>
          <span className="text-[7.5px] font-extrabold text-zinc-400 dark:text-zinc-500 lowercase font-sans">or</span>
          <kbd className="text-[7.5px] font-extrabold bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/15 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400 font-mono">
            /
          </kbd>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isSearchFocused && searchQuery.trim() !== '' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-full sm:w-[300px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-black/15 dark:border-zinc-800/80 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-black/5 dark:divide-zinc-900"
          >
            {Object.keys(groupedSearchResults).length === 0 ? (
              <div className="p-4 text-center text-zinc-600 dark:text-zinc-400 text-[10px] font-bold">
                No results found for <span className="font-extrabold text-acies-yellow">"{searchQuery}"</span>
              </div>
            ) : (
              <div className="max-h-[260px] overflow-y-auto no-scrollbar py-2">
                {Object.entries(groupedSearchResults)
                  .sort((a, b) => {
                    const aMinPriority = Math.min(...(a[1] as SearchItem[]).map(item => item.priority ?? 2));
                    const bMinPriority = Math.min(...(b[1] as SearchItem[]).map(item => item.priority ?? 2));
                    return aMinPriority - bMinPriority;
                  })
                  .map(([category, items]) => (
                    <div key={category} className="space-y-0.5">
                    <div className="px-3.5 py-1 text-[7.5px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 bg-black/[0.02] dark:bg-white/[0.01] border-b border-black/5 dark:border-white/5">
                      {category}
                    </div>
                    {(items as SearchItem[]).map((item) => {
                      const itemIndex = filteredSearchItems.indexOf(item);
                      const isHighlighted = itemIndex === activeSearchIndex;
                      return (
                        <button
                          key={item.name}
                          id={`search-item-${itemIndex}`}
                          type="button"
                          onClick={() => handleSelectSearchItem(item)}
                          className={`w-full text-left px-3.5 py-1.5 transition-all flex items-center justify-between cursor-pointer border-none bg-transparent outline-none group ${
                            isHighlighted 
                              ? 'bg-acies-yellow/20 dark:bg-white/10 text-acies-yellow font-extrabold shadow-inner' 
                              : 'hover:bg-acies-yellow/10 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className={`text-[11px] font-bold transition-colors truncate ${
                              isHighlighted 
                                ? 'text-acies-yellow' 
                                : 'text-zinc-700 dark:text-zinc-200 group-hover:text-acies-yellow'
                            }`}>
                              {item.name}
                            </p>
                            {item.subtitle && (
                              <p className={`text-[9px] mt-0.5 truncate font-medium ${
                                isHighlighted ? 'text-zinc-300' : 'text-zinc-500 dark:text-zinc-400'
                              }`}>
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-acies-yellow shrink-0 group-hover:underline">
                            {item.valueText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
