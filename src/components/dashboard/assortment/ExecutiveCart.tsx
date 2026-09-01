import React, { useState } from 'react';
import { StagedAction } from './types';
import { Briefcase, Trash2, X, CheckCircle, TrendingUp, TrendingDown, Layers, Box, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalShell } from '../../common/Modal';

interface ExecutiveCartProps {
  stagedActions: StagedAction[];
  onRemoveAction: (id: string) => void;
  onClearCart: () => void;
}

export const ExecutiveCart: React.FC<ExecutiveCartProps> = ({ stagedActions, onRemoveAction, onClearCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);

  if (stagedActions.length === 0 && !isCommitted) return null;

  // Calculate totals
  const totalRevenue = stagedActions.reduce((sum, a) => sum + a.revenueImpact, 0);
  const totalMargin = stagedActions.reduce((sum, a) => sum + a.marginImpact, 0);
  const totalComplexity = stagedActions.reduce((sum, a) => sum + a.complexityImpact, 0);
  const totalSpace = stagedActions.reduce((sum, a) => sum + a.spaceImpact, 0);

  const handleCommit = () => {
    setIsCommitted(true);
    setTimeout(() => {
      setIsCommitted(false);
      setIsOpen(false);
      onClearCart();
    }, 3500);
  };

  return (
    <>
      {/* Floating Sticky Cart Summary */}
      <AnimatePresence>
        {!isOpen && stagedActions.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[300] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-black/10 dark:border-white/15 px-4 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center gap-6 text-[10px] font-sans font-bold max-w-[90%] sm:max-w-2xl"
          >
            <div className="flex items-center gap-2 text-acies-yellow shrink-0">
              <Briefcase size={14} className="animate-pulse" />
              <span className="uppercase tracking-wider">Staged Assortment Plan ({stagedActions.length})</span>
            </div>

            <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block" />

            {/* Metrics quick glance */}
            <div className="flex items-center gap-4 text-[9px] overflow-x-auto sm:overflow-visible pr-2">
              <div className="flex items-center gap-1.5 shrink-0">
                {totalRevenue >= 0 ? (
                  <TrendingUp size={11} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={11} className="text-rose-500" />
                )}
                <span className="text-zinc-400">Rev:</span>
                <span className={totalRevenue >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                  {totalRevenue >= 0 ? '+' : ''}${totalRevenue.toFixed(2)} M
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Check size={11} className="text-emerald-500" />
                <span className="text-zinc-400">Margin:</span>
                <span className={totalMargin >= 0 ? 'text-emerald-500 font-extrabold' : 'text-rose-500'}>
                  {totalMargin >= 0 ? '+' : ''}${totalMargin.toFixed(2)} M
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Layers size={11} className="text-blue-500" />
                <span className="text-zinc-400">Comp:</span>
                <span className="text-blue-500">-{totalComplexity.toFixed(1)} pts</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Box size={11} className="text-purple-500" />
                <span className="text-zinc-400">Space:</span>
                <span className="text-purple-500">+{totalSpace.toFixed(0)} Pallets</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-full uppercase tracking-wider text-[8px] font-extrabold cursor-pointer border-none outline-none transition-all active:scale-95 shrink-0"
            >
              Review Plan
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal Backdrop Blur */}
      <AnimatePresence>
        {isOpen && (
          <ModalShell isOpen onClose={() => setIsOpen(false)} layer="cart" scrimClassName="" blur="none" className="flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCommitted && setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded p-6 shadow-2xl z-10 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] font-sans"
            >
              {isCommitted ? (
                /* Success Commit flow screen */
                <div className="flex flex-col items-center justify-center py-10 text-center animate-fadeIn">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5 border border-emerald-500/20"
                  >
                    <CheckCircle size={32} className="text-emerald-500 animate-pulse" />
                  </motion.div>
                  <h4 className="text-sm uppercase font-extrabold tracking-widest text-zinc-800 dark:text-zinc-200 mb-1">
                    Assortment Plan Committed!
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed max-w-sm">
                    Staged assortment changes have been synchronized with the master ledger. FP&A, regional supply chain directors, and local warehouse supervisors have been notified to initiate category adjustments.
                  </p>
                </div>
              ) : (
                /* Standard Action Review Screen */
                <>
                  <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-3 mb-4">
                    <div>
                      <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Review Assortment Decisions</h4>
                      <p className="text-[9px] text-zinc-500 font-medium">Verify the cumulative operational and financial impact of your staged changes.</p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer outline-none p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Actions List (scrollable) */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[40vh] min-h-[150px]">
                    {stagedActions.map((action) => (
                      <div
                        key={action.id}
                        className="p-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded flex justify-between gap-4 text-[9px]"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-[6px] font-extrabold uppercase tracking-wider ${
                              action.type === 'reallocation' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/10' :
                              action.type === 'delisting' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10' :
                              action.type === 'pricing' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' :
                              'bg-purple-500/10 text-purple-500 border border-purple-500/10'
                            }`}>
                              {action.type}
                            </span>
                            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{action.title}</span>
                          </div>
                          <p className="text-[8.5px] text-zinc-500 leading-normal font-medium">{action.details}</p>
                          
                          {/* Item level metrics breakdown */}
                          <div className="flex gap-3 text-[7.5px] font-bold text-zinc-500 pt-1 font-mono">
                            <span className={action.revenueImpact >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                              Rev: {action.revenueImpact >= 0 ? '+' : ''}${action.revenueImpact.toFixed(2)}M
                            </span>
                            <span className="text-emerald-500">
                              Profit: +${action.marginImpact.toFixed(2)}M
                            </span>
                            {action.complexityImpact > 0 && (
                              <span className="text-blue-500">
                                Comp: -{action.complexityImpact.toFixed(1)}pts
                              </span>
                            )}
                            {action.spaceImpact > 0 && (
                              <span className="text-purple-500">
                                Space: +{action.spaceImpact.toFixed(0)}p
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveAction(action.id)}
                          className="text-zinc-400 hover:text-rose-500 bg-transparent border-none cursor-pointer outline-none p-1 self-start transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary Totals Grid */}
                  <div className="border-t border-black/5 dark:border-white/5 pt-4 mt-4 space-y-3 bg-black/[0.01] dark:bg-white/[0.01] p-3 rounded">
                    <span className="text-[8px] uppercase font-extrabold tracking-widest text-zinc-400 block mb-1">Staged Net Plan Totals:</span>
                    <div className="grid grid-cols-2 gap-3 text-[9px] font-bold">
                      <div className="p-2 border border-black/5 dark:border-white/5 rounded bg-white dark:bg-zinc-900 flex items-center justify-between">
                        <span className="text-zinc-500">Net Sales Impact</span>
                        <span className={totalRevenue >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                          {totalRevenue >= 0 ? '+' : ''}${totalRevenue.toFixed(2)} M
                        </span>
                      </div>
                      
                      <div className="p-2 border border-black/5 dark:border-white/5 rounded bg-white dark:bg-zinc-900 flex items-center justify-between">
                        <span className="text-zinc-500">Net Profit Lift</span>
                        <span className={totalMargin >= 0 ? 'text-emerald-500 font-extrabold' : 'text-rose-500'}>
                          {totalMargin >= 0 ? '+' : ''}${totalMargin.toFixed(2)} M
                        </span>
                      </div>

                      <div className="p-2 border border-black/5 dark:border-white/5 rounded bg-white dark:bg-zinc-900 flex items-center justify-between">
                        <span className="text-zinc-500">Complexity Saved</span>
                        <span className="text-blue-500">-{totalComplexity.toFixed(1)} Points</span>
                      </div>

                      <div className="p-2 border border-black/5 dark:border-white/5 rounded bg-white dark:bg-zinc-900 flex items-center justify-between">
                        <span className="text-zinc-500">Warehouse Space</span>
                        <span className="text-purple-500">+{totalSpace.toFixed(0)} Pallets</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleCommit}
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold uppercase tracking-widest text-center py-2 rounded text-[8.5px] cursor-pointer border-none outline-none transition-all active:scale-95 shadow-md shadow-blue-500/20"
                  >
                    Commit & Implement Assortment Plan
                  </button>
                </>
              )}
            </motion.div>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  );
};
