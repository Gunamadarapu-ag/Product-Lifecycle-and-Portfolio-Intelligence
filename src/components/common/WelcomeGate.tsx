import React from 'react';
import { motion } from 'motion/react';
import { Crown, Workflow, TrendingUp, Check, Cpu } from 'lucide-react';
import { Role } from '../../types/dashboard';

interface WelcomeGateProps {
  onSelectRole: (role: Role) => void;
}

export const WelcomeGate: React.FC<WelcomeGateProps> = ({ onSelectRole }) => {
  const personas = [
    {
      role: 'VP Product Management' as Role,
      title: 'VP Product Management',
      subtitle: 'Strategic & Executive Command',
      icon: Crown,
      badge: 'Strategic Overview',
      description: 'Strategic portfolio governance, revenue intelligence, executive decision support, risk escalation monitoring, and AI-powered recommendations.',
      features: [
        'Portfolio Health',
        'Revenue Risk Alerts',
        'Strategic Decisions',
        'Executive Dashboard'
      ],
      colorTheme: 'amber',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/20 hover:border-amber-400/50 group-hover:shadow-amber-500/5',
      badgeStyle: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      iconColor: 'text-amber-400',
      btnStyle: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/10',
      widget: (
        <div className="h-20 w-full bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between overflow-hidden relative group/widget">
          <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
            <span>Revenue Target</span>
            <span className="text-amber-400 font-black">+10.2%</span>
          </div>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-xl font-display font-extrabold text-white">102.4%</span>
            <span className="text-[8px] text-green-400 font-bold">YoY</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkline-grad-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 16 Q 15 10 30 14 T 60 6 T 90 2K 100 2"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
              <path
                d="M 0 16 Q 15 10 30 14 T 60 6 T 90 2K 100 2K 100 20K 0 20 Z"
                fill="url(#sparkline-grad-1)"
              />
              <circle cx="98" cy="2" r="2" fill="#f59e0b" className="animate-pulse" />
            </svg>
          </div>
        </div>
      )
    },
    {
      role: 'Product Manager' as Role,
      title: 'Product Manager',
      subtitle: 'Operational & Execution Lens',
      icon: Workflow,
      badge: 'Operational Workflows',
      description: 'Track product lifecycle stages, launch readiness, supply chain bottlenecks, execution progress, and operational KPIs.',
      features: [
        'Lifecycle Tracking',
        'Launch Readiness',
        'Workflow Monitoring',
        'Operational Insights'
      ],
      colorTheme: 'emerald',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/20 hover:border-emerald-400/50 group-hover:shadow-emerald-500/5',
      badgeStyle: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      iconColor: 'text-emerald-400',
      btnStyle: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black shadow-emerald-500/10',
      widget: (
        <div className="h-20 w-full bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between overflow-hidden relative">
          <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
            <span>Launch Pipeline</span>
            <span className="text-emerald-400 font-black">Gate 4/5</span>
          </div>
          <div className="flex items-center justify-between mt-1 px-1 relative z-10">
            <div className="absolute top-1/2 left-3 right-3 h-[1px] bg-zinc-800 -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-3 right-[50%] h-[1px] bg-emerald-500 -translate-y-1/2 z-0" />
            
            <div className="flex flex-col items-center z-10">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-black font-extrabold">✓</div>
              <span className="text-[6px] text-zinc-400 font-bold mt-0.5 scale-90">Source</span>
            </div>
            <div className="flex flex-col items-center z-10">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-black font-extrabold">✓</div>
              <span className="text-[6px] text-zinc-400 font-bold mt-0.5 scale-90">Reg</span>
            </div>
            <div className="flex flex-col items-center z-10">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-black font-extrabold">✓</div>
              <span className="text-[6px] text-zinc-400 font-bold mt-0.5 scale-90">Pack</span>
            </div>
            <div className="flex flex-col items-center z-10">
              <div className="w-4 h-4 rounded-full bg-zinc-950 border border-emerald-500 flex items-center justify-center relative">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[6px] text-emerald-400 font-bold mt-0.5 scale-90">Buffer</span>
            </div>
            <div className="flex flex-col items-center z-10">
              <div className="w-4 h-4 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center" />
              <span className="text-[6px] text-zinc-600 font-bold mt-0.5 scale-90">Ready</span>
            </div>
          </div>
        </div>
      )
    },
    {
      role: 'Pricing and Margin Partner' as Role,
      title: 'Pricing & Margin Partner',
      subtitle: 'Financial & Leakage Diagnostics',
      icon: TrendingUp,
      badge: 'Financial Diagnostics',
      description: 'Analyze margin waterfalls, promotion impact, cost-to-serve leakage, pricing optimization, and profitability trends.',
      features: [
        'Margin Analysis',
        'Leakage Detection',
        'Pricing Optimization',
        'Profitability Dashboard'
      ],
      colorTheme: 'blue',
      bgGlow: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/20 hover:border-blue-400/50 group-hover:shadow-blue-500/5',
      badgeStyle: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      iconColor: 'text-blue-400',
      btnStyle: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-black shadow-blue-500/10',
      widget: (
        <div className="h-20 w-full bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
            <span>Gross Margin Target</span>
            <span className="text-blue-400 font-black">-1.47%</span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <div className="space-y-0.5">
              <div className="flex justify-between text-[7px] font-bold text-zinc-400">
                <span>Actual Margin</span>
                <span className="text-zinc-200">38.53%</span>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '87.5%' }} />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[7px] font-bold text-zinc-400">
                <span>Target Benchmark</span>
                <span className="text-blue-400">40.00%</span>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400/50 rounded-full" style={{ width: '91%' }} />
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] to-[#111827] text-white flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden font-body select-none">
      {/* Precision Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Floating Glowing Particle Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Abstract AI Network Lines SVG Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 200 L300 400 L500 100 L800 500 L1100 300 L1400 600" fill="none" stroke="white" strokeWidth="1" />
          <path d="M200 600 L400 300 L700 700 L1000 400 L1200 800" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="200" r="3" fill="white" />
          <circle cx="300" cy="400" r="3" fill="white" />
          <circle cx="500" cy="100" r="3" fill="white" />
          <circle cx="800" cy="500" r="3" fill="white" />
          <circle cx="1100" cy="300" r="3" fill="white" />
          <circle cx="1400" cy="600" r="3" fill="white" />
          <circle cx="400" cy="300" r="3" fill="white" />
          <circle cx="700" cy="700" r="3" fill="white" />
          <circle cx="1000" cy="400" r="3" fill="white" />
        </svg>
      </div>

      <div className="w-full max-w-6xl z-10 space-y-12 flex flex-col items-center">
        
        {/* Top Header & Title */}
        <div className="text-center space-y-4 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md shadow-sm"
          >
            <Cpu size={12} className="text-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-300">Product Lifecycle & Portfolio Intelligence</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
              Welcome to <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">Product Lifecycle & Portfolio Intelligence</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Choose your workspace and unlock AI-powered portfolio intelligence tailored to your role.
            </p>
            <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-[0.15em] max-w-xl mx-auto">
              Monitor KPIs, analyze risks, optimize profitability, and accelerate product lifecycle decisions.
            </p>
          </motion.div>
        </div>

        {/* 3 Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {personas.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.role}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.15, duration: 0.7, type: 'spring', bounce: 0.2 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => onSelectRole(p.role)}
                className={`group bg-slate-950/45 hover:bg-slate-900/60 backdrop-blur-xl border ${p.borderColor} p-8 rounded-[24px] flex flex-col justify-between min-h-[500px] cursor-pointer transition-all duration-300 relative shadow-2xl overflow-hidden`}
              >
                {/* Embedded Glow Effect */}
                <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${p.bgGlow} blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none`} />

                <div className="space-y-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/5 border border-white/10 text-white rounded-2xl group-hover:scale-105 transition-transform duration-300">
                      <Icon size={24} className={`${p.iconColor} stroke-[2.2]`} />
                    </div>
                    <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${p.badgeStyle}`}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-extrabold text-white group-hover:text-white transition-colors duration-200">
                      {p.title}
                    </h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{p.subtitle}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal pt-2">
                      {p.description}
                    </p>
                  </div>

                  {/* Micro-Widget Preview */}
                  <div className="py-2">
                    {p.widget}
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-2 pt-2">
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${p.badgeStyle}`}>
                          <Check size={8} className="stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-6 mt-auto">
                  <div className={`w-full py-3 rounded-xl text-center text-xs font-bold uppercase tracking-widest transition-all duration-300 ${p.btnStyle}`}>
                    Enter Workspace
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[10px] text-zinc-500 font-bold tracking-[0.2em] pt-6 opacity-60 uppercase"
        >
          Acies Global Virtual Labs • Secure Role Onboarding
        </motion.div>

      </div>
    </div>
  );
};
