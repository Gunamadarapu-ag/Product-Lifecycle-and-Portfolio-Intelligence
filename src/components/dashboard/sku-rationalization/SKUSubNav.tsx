import React from 'react';
import { DollarSign, Play, CheckSquare } from 'lucide-react';

interface SKUSubNavProps {
  activeSubTab: number;
  onChangeSubTab: (tabId: number) => void;
}

export const SKUSubNav: React.FC<SKUSubNavProps> = ({ activeSubTab, onChangeSubTab }) => {
  const items = [
    {
      id: 9,
      title: 'Rationalisation',
      subtitle: '3 root causes · high impact',
      icon: DollarSign,
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      bgClass: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      activeBorder: 'border-indigo-500 dark:border-indigo-400'
    },
    {
      id: 10,
      title: 'Demo',
      subtitle: '2 root causes · medium impact',
      icon: Play,
      iconColor: 'text-amber-500 dark:text-amber-400',
      bgClass: 'bg-amber-500/10 dark:bg-amber-500/15',
      activeBorder: 'border-amber-500 dark:border-amber-400'
    },
    {
      id: 11,
      title: 'Tracker',
      subtitle: '1 root cause · low impact',
      icon: CheckSquare,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      activeBorder: 'border-emerald-500 dark:border-emerald-400'
    }
  ];

  return (
    <div className="w-full lg:w-64 shrink-0 space-y-3 text-left">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-1">
        Root cause analysis
      </h3>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeSubTab(item.id)}
              className={`w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 cursor-pointer outline-none ${
                isActive
                  ? `bg-zinc-50 dark:bg-[#1a1a24] shadow-xs text-zinc-900 dark:text-white ${item.activeBorder} border-2`
                  : 'bg-white dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 border'
              }`}
            >
              <div className={`p-2 rounded-md ${item.bgClass} shrink-0`}>
                <item.icon size={13} className={`${item.iconColor} fill-current opacity-90`} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-[11.5px] font-extrabold leading-tight truncate">{item.title}</h4>
                <p className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 leading-none truncate">
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
