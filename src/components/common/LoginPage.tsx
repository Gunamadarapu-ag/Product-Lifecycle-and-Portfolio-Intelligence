import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, Info, Crown, Workflow, TrendingUp } from 'lucide-react';
import { BrandBackdrop } from './BrandBackdrop';

interface LoginPageProps {
  onLogin: () => void;
}

const PROFILE_PREVIEW = [
  { icon: Crown, label: 'VP Product Management', line: 'Strategic & executive command', dot: 'bg-amber-400' },
  { icon: Workflow, label: 'Product Manager', line: 'Operational & execution lens', dot: 'bg-emerald-400' },
  { icon: TrendingUp, label: 'Pricing & Margin Partner', line: 'Financial & leakage diagnostics', dot: 'bg-blue-400' },
];

/**
 * A login screen, not a login system.
 *
 * There is no backend, no account store and nothing to check a password
 * against — this project has none of those yet (see documentation/formulas.md
 * and the "Nine Tabs, Zero Backend" audit for why). Rather than fake a check
 * that doesn't exist, this form accepts any non-empty username and password
 * and says so on screen. It exists to give the app a front door, not to
 * secure one.
 */
export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Enter a name and a password to continue.');
      return;
    }
    setError(null);
    setSubmitting(true);
    // Nothing to await — no backend exists. The short delay is only so the
    // button's own feedback state is visible before the gate advances.
    window.setTimeout(() => onLogin(), 260);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] to-[#111827] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-body select-none">
      {/* Precision grid, matching the Welcome Gate */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />
      <BrandBackdrop />
      {/* The same three glowing blobs as the Welcome Gate, at rest — a quiet
          visual thread from this screen into the one that follows it. */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-emerald-500/8 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md shadow-sm mb-10 z-10"
      >
        <img src="/logo-mark.png" alt="" className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-300">
          Product Lifecycle &amp; Portfolio Intelligence
        </span>
      </motion.div>

      <div className="w-full max-w-4xl z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] rounded-[28px] overflow-hidden border border-white/10 shadow-2xl">

        {/* ── Left: what's on the other side of signing in ─────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.6 }}
          className="hidden lg:flex flex-col justify-between bg-slate-950/60 backdrop-blur-xl p-10 border-r border-white/5"
        >
          <div>
            <h1 className="text-[26px] leading-tight font-display font-extrabold text-white">
              One portfolio.<br />
              <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Three ways to see it.
              </span>
            </h1>
            <p className="text-[13px] text-zinc-400 leading-relaxed mt-4 max-w-xs">
              After you sign in, choose the lens you work in — each one leads with the
              tabs and KPIs built for that role.
            </p>
          </div>

          <div className="space-y-3 mt-10">
            {PROFILE_PREVIEW.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-zinc-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dot} shrink-0`} />
                      <span className="text-[12px] font-bold text-white truncate">{p.label}</span>
                    </div>
                    <p className="text-[10.5px] text-zinc-500 mt-0.5 truncate">{p.line}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="text-[10px] text-zinc-600 font-bold tracking-[0.18em] uppercase mt-10">
            Acies Global Virtual Labs
          </p>
        </motion.div>

        {/* ── Right: the actual form ────────────────────────────────────── */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-slate-950/40 backdrop-blur-xl p-8 sm:p-10 flex flex-col justify-center space-y-5"
          noValidate
        >
          <div className="space-y-1.5">
            <h2 className="text-2xl font-display font-extrabold text-white">Sign in</h2>
            <p className="text-xs text-zinc-400">Enter any name and password to continue.</p>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">
              Username
            </span>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null); }}
                placeholder="e.g. j.patel"
                autoComplete="username"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-colors"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">
              Password
            </span>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Anything works"
                autoComplete="current-password"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-colors"
              />
            </div>
          </label>

          {error && (
            <p className="text-xs text-rose-400 font-medium" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl text-center text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/10 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
            {!submitting && <ArrowRight size={14} strokeWidth={2.5} />}
          </button>

          <div className="flex items-start gap-2 pt-1 text-[10.5px] text-zinc-500 leading-relaxed border-t border-white/5 mt-1 pt-4">
            <Info size={12} className="mt-0.5 shrink-0" />
            <span>
              Demo build — this screen is a front door, not an account system. Nothing is
              checked against a real user store, and no password is verified.
            </span>
          </div>
        </motion.form>
      </div>
    </div>
  );
};
