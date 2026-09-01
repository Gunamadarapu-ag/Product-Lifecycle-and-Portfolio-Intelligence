/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LAYER } from '../../constants/layers';
import { useDialogBehavior } from '../../hooks/useDialogBehavior';
import { Zap, ChevronRight } from 'lucide-react';
import { AGENT_ROSTER } from '../../constants/data';

interface SidebarProps {
  isOpen: boolean;
  close: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, close }) => {
  // Escape-to-close, scroll lock and focus restore. The drawer keeps its own
  // AnimatePresence markup — a centring ModalShell would nest the sliding
  // aside inside the scrim and lose the spring exit.
  useDialogBehavior(isOpen, close);

  return (
  <>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          style={{ zIndex: LAYER.base }}
        />
      )}
    </AnimatePresence>
    <motion.aside 
      // The aside stays mounted so it can slide in and out, so it must only
      // advertise itself as a dialog while it is actually open — otherwise a
      // permanently-present role="dialog" sits in the DOM behind every page.
      role={isOpen ? 'dialog' : undefined}
      aria-modal={isOpen || undefined}
      aria-label="How This Evolves"
      aria-hidden={!isOpen}
      inert={!isOpen}
      animate={{ x: isOpen ? 0 : '100%' }}
      initial={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white dark:bg-acies-gray border-l border-black/10 dark:border-white/10 p-10 overflow-y-auto"
      style={{ zIndex: LAYER.panel }}
    >
      <div className="flex justify-between items-center mb-16">
        <div>
          <h2 className="text-3xl font-display">How This Evolves</h2>
          <div className="h-1 w-12 bg-acies-yellow mt-2" />
        </div>
        <button onClick={close} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-acies-gray dark:text-white">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="space-y-16">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-display opacity-20">01</span>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-acies-gray dark:text-white">The As-Is State (Now)</h3>
          </div>
          <div className="pl-9 border-l border-black/5 dark:border-white/5">
            <p className="text-sm opacity-70 leading-relaxed mb-4">
              Top 10% of SKUs drive 27.81% of revenue, while 66.7% contribute &lt;1% each but consume 100% of supplier overhead. 
              Portfolio visibility is fragmented across 4 systems.
            </p>
            <div className="bg-red-50 dark:bg-red-950/20 p-4 border-l-2 border-red-200 dark:border-red-800/50">
               <p className="text-[10px] font-bold text-red-800 dark:text-red-400 uppercase mb-1">Pain Point</p>
               <p className="text-xs text-red-900 dark:text-red-200 font-medium italic">"31% of SKUs contribute only 4% of revenue but consume 22% of supplier relationships."</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-display opacity-20">02</span>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-acies-yellow">AI-Assisted (Transition)</h3>
          </div>
          <div className="pl-9 border-l border-acies-yellow/30">
            <p className="text-sm opacity-70 leading-relaxed mb-4">
              Automated SKU tracking identifies "Rationalize" candidates. Removing these 35 items cuts safety stock by 42.2% 
              ($246M &rarr; $142M) with minimal revenue risk.
            </p>
            <div className="bg-acies-yellow/10 p-4 border-l-2 border-acies-yellow">
               <p className="text-[10px] font-bold text-acies-gray dark:text-white uppercase mb-1">Efficiency Gain</p>
               <p className="text-xs text-acies-gray dark:text-white/90 font-medium">Data consolidation effort reduced from 20 hours to &lt;30 minutes.</p>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-acies-gray text-white p-8 -mx-10 md:mx-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={100} />
            </div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <span className="text-2xl font-display text-acies-yellow">03</span>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Agentic Swarm (Future)</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-10 relative z-10">
              Agentic simulations target top 12% revenue drivers for 68% portfolio margin uplift. Orchestrated 
              workflows autonomously prune low-performing categories like Dairy (27.78% friction).
            </p>
            
            <div className="space-y-4 relative z-10">
              {AGENT_ROSTER.map((agent, i) => (
                <motion.div 
                  key={agent.name} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border border-white/10 p-4 flex gap-4 items-center bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="shrink-0 w-10 h-10 rounded-full bg-acies-yellow flex items-center justify-center text-acies-gray font-display text-lg">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-acies-yellow mb-0.5">{agent.name}</h4>
                    <p className="text-[10px] opacity-60 leading-tight">{agent.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 relative z-10">
               <p className="text-[10px] font-bold uppercase tracking-widest text-acies-yellow mb-2">Acies POV</p>
               <p className="text-xs opacity-80 leading-relaxed italic">
                 "In the age of hyper-competition, portfolio intelligence isn't about having data—it's about having organized agents that can simulate and act on that data at the speed of the market."
               </p>
            </div>
          </div>
        </section>
      </div>
    </motion.aside>
  </>
  );
};
