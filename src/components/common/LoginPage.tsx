import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Lock, User, ArrowRight, Info } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

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
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] to-[#111827] text-white flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden font-body">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-amber-500/10 blur-[110px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md shadow-sm mb-8 z-10"
      >
        <Cpu size={12} className="text-amber-400 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-300">
          Product Lifecycle &amp; Portfolio Intelligence
        </span>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, type: 'spring', bounce: 0.2 }}
        className="w-full max-w-sm bg-slate-950/50 backdrop-blur-xl border border-white/10 p-8 rounded-[24px] shadow-2xl z-10 space-y-5"
        noValidate
      >
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-display font-extrabold text-white">Sign in</h1>
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
          className="w-full py-3 rounded-xl text-center text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/10 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
          {!submitting && <ArrowRight size={14} strokeWidth={2.5} />}
        </button>

        <div className="flex items-start gap-2 pt-1 text-[10.5px] text-zinc-500 leading-relaxed">
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>
            Demo build — this screen is a front door, not an account system. Nothing is
            checked against a real user store, and no password is verified.
          </span>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-[10px] text-zinc-500 font-bold tracking-[0.2em] pt-8 opacity-60 uppercase z-10"
      >
        Acies Global Virtual Labs
      </motion.div>
    </div>
  );
};
