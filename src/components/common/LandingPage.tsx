import React, { useState } from 'react';
import {
  ArrowRight, Menu, X, Layers, MapPinned, Search, BellOff, Plug, Radar, Microscope, ClipboardCheck,
  BellRing, Network, Filter, FileSearch, Plus, Minus, ShieldCheck,
} from 'lucide-react';

/**
 * Public landing page — the first screen before the role picker.
 *
 * Content mirrors the 9 Oct business-case deck: every external figure carries
 * its source, model figures are labelled as estimates, and the product
 * mock-ups use real values from the demo dataset (12 months to 31 Dec 2025),
 * marked "demo dataset" — nothing here is presented as a customer result.
 *
 * Styling follows the deck: white page, Acies yellow/charcoal top border,
 * light pastel cards. It forces light colours regardless of the app's dark
 * mode, because it sits outside the dashboard.
 *
 * In-page navigation scrolls with scrollIntoView instead of #anchors: the app
 * keeps its own state in the URL hash (#tab=…&role=…), so anchor links would
 * collide with it.
 */

interface LandingPageProps {
  onEnterDemo: () => void;
}

const INK = 'text-[#1F2A3D]';
const BODY = 'text-[#3F4A5A]';
const MUTED = 'text-[#7A8494]';
const LABEL = 'text-[#B7791F]';

const TINT = {
  blue: { bg: 'bg-[#EEF4FD]', border: 'border-[#C9DAF5]', text: 'text-[#2F5FB3]' },
  amber: { bg: 'bg-[#FFF7E6]', border: 'border-[#F4DDAA]', text: 'text-[#B26B00]' },
  violet: { bg: 'bg-[#F4F0FC]', border: 'border-[#DCD0F3]', text: 'text-[#6B46C1]' },
  rose: { bg: 'bg-[#FDF1F1]', border: 'border-[#F3CFCF]', text: 'text-[#B4373A]' },
  green: { bg: 'bg-[#EEF8F1]', border: 'border-[#C8E8D2]', text: 'text-[#23824A]' },
  sand: { bg: 'bg-[#FAF8F2]', border: 'border-[#ECE6D6]', text: 'text-[#8A6D1F]' },
};

const NAV = [
  { id: 'problem', label: 'Problem' },
  { id: 'how', label: 'How It Works' },
  { id: 'business-case', label: 'Business Case' },
  { id: 'platform', label: 'Platform' },
  { id: 'faq', label: 'FAQ' },
];

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className={`text-[12px] font-bold uppercase tracking-[0.25em] ${LABEL}`}>{children}</p>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className={`font-display text-3xl md:text-[42px] leading-tight mt-3 ${INK}`}>{children}</h2>
);

const Tag: React.FC<{ tone: 'risk' | 'review' | 'pass'; children: React.ReactNode }> = ({ tone, children }) => {
  const cls = tone === 'risk' ? 'bg-[#FDF1F1] text-[#B4373A] border-[#F3CFCF]'
    : tone === 'review' ? 'bg-[#FFF7E6] text-[#B26B00] border-[#F4DDAA]'
      : 'bg-[#EEF8F1] text-[#23824A] border-[#C8E8D2]';
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{children}</span>;
};

/* ── Mock-ups (real figures from the demo dataset) ─────────────────────────── */

const HeroMockup: React.FC = () => (
  <div className="bg-white border border-[#E3E7ED] rounded-2xl shadow-[0_20px_60px_-25px_rgba(31,42,61,0.35)] p-6">
    <div className="flex items-center justify-between">
      <p className={`text-[11px] font-bold uppercase tracking-widest ${MUTED}`}>SKU signal</p>
      <span className={`text-[11px] ${MUTED}`}>Mock-up · demo dataset</span>
    </div>
    <div className="mt-4 flex items-start justify-between gap-4">
      <div>
        <p className={`font-display text-2xl ${INK}`}>Green Tea RTD</p>
        <p className={`text-sm ${BODY}`}>Beverages · Southern Europe · last 12 months</p>
      </div>
      <div className="text-right">
        <p className={`text-[11px] uppercase tracking-wider ${MUTED}`}>Net sales</p>
        <p className={`font-display text-2xl ${INK}`}>$2.24M</p>
      </div>
    </div>
    <div className="mt-5 space-y-2.5">
      {[
        { k: 'Sales vs prior year', v: '−4.0%', tone: 'risk' as const, t: 'Declining' },
        { k: 'Gross margin vs portfolio', v: '23.8% vs 38.5%', tone: 'risk' as const, t: 'Below' },
        { k: 'Stockout rate vs portfolio', v: '13.8% vs 9.4%', tone: 'review' as const, t: 'Needs review' },
        { k: 'Supplier notice', v: 'None', tone: 'pass' as const, t: 'Clear' },
      ].map(r => (
        <div key={r.k} className="flex items-center justify-between gap-3 border-b border-[#F0F2F5] pb-2.5 last:border-0">
          <span className={`text-sm ${BODY}`}>{r.k}</span>
          <span className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${INK}`}>{r.v}</span>
            <Tag tone={r.tone}>{r.t}</Tag>
          </span>
        </div>
      ))}
    </div>
    <div className={`mt-4 rounded-lg ${TINT.amber.bg} border ${TINT.amber.border} px-3.5 py-2.5 text-sm ${BODY}`}>
      <span className="font-semibold text-[#B26B00]">Margin erosion on promotion: 11.2 pt</span> — among the five
      highest in the portfolio.
    </div>
    <div className="mt-4 flex items-center justify-between">
      <span className={`text-sm ${BODY}`}>Recommended action</span>
      <span className={`text-sm font-semibold ${INK}`}>Discontinue / consolidate in this market</span>
    </div>
  </div>
);

const SignalsMockup: React.FC = () => (
  <div className="space-y-2">
    {[
      { s: 'Critical', c: 'risk' as const, t: 'Skyr Vanilla 450g — business-case gate overdue', i: '$1.7M year-1 plan' },
      { s: 'Critical', c: 'risk' as const, t: 'Vitamin C Serum — business-case gate overdue', i: '$1.4M year-1 plan' },
      { s: 'Warning', c: 'review' as const, t: 'Green Tea RTD — margin erosion on promotion', i: '$2.2M sales' },
      { s: 'Warning', c: 'review' as const, t: 'Choco Wafers — supplier discontinuation', i: '$0.6M sales' },
    ].map(r => (
      <div key={r.t} className="flex items-center justify-between gap-3 bg-white border border-[#E3E7ED] rounded-lg px-3 py-2">
        <span className="flex items-center gap-2 min-w-0">
          <Tag tone={r.c}>{r.s}</Tag>
          <span className={`text-[13px] truncate ${INK}`}>{r.t}</span>
        </span>
        <span className={`text-[12px] shrink-0 ${MUTED}`}>{r.i}</span>
      </div>
    ))}
  </div>
);

const DrillMockup: React.FC = () => {
  const rows = [
    ['Italy', 137.2, '89.6%'], ['Spain', 106.9, '89.8%'], ['Germany', 88.5, '89.9%'],
    ['Austria', 43.0, '91.7%'], ['Poland', 42.6, '91.4%'], ['France', 42.6, '91.6%'], ['Netherlands', 12.3, '92.7%'],
  ] as const;
  return (
    <div className="bg-white border border-[#E3E7ED] rounded-lg p-3 space-y-1.5">
      <div className={`flex justify-between text-[11px] uppercase tracking-wider ${MUTED}`}>
        <span>Country · net sales</span><span>Fulfilment</span>
      </div>
      {rows.map(([c, v, f]) => (
        <div key={c} className="flex items-center gap-3">
          <span className={`w-24 text-[13px] ${INK}`}>{c}</span>
          <div className="flex-1 h-2 rounded-full bg-[#F0F2F5]">
            <div className="h-2 rounded-full bg-[#7A9CD6]" style={{ width: `${(v / 137.2) * 100}%` }} />
          </div>
          <span className={`w-16 text-right text-[12px] ${BODY}`}>${v}M</span>
          <span className={`w-12 text-right text-[12px] ${BODY}`}>{f}</span>
        </div>
      ))}
    </div>
  );
};

const RationaleMockup: React.FC = () => (
  <div className="space-y-2">
    <div className="grid grid-cols-4 gap-2">
      {[['37', 'Discontinue / consolidate', TINT.rose], ['0', 'Reposition', TINT.amber],
        ['12', 'Reformulate', TINT.violet], ['5', 'Invest / expand', TINT.green]].map(([n, l, t]) => {
        const tt = t as typeof TINT.rose;
        return (
          <div key={l as string} className={`${tt.bg} border ${tt.border} rounded-lg px-2 py-2 text-center`}>
            <p className={`font-display text-xl ${tt.text}`}>{n as string}</p>
            <p className={`text-[11px] leading-tight ${BODY}`}>{l as string}</p>
          </div>
        );
      })}
    </div>
    {[
      ['Toilet Paper 12-Pack', 'Margin 26.6% vs 38.5% portfolio', 'Reformulate'],
      ['Choco Wafers', 'Supplier discontinuation, Jan 2026', 'Discontinue'],
      ['Sunscreen SPF 50', 'Sales +14.4% vs +8.3% portfolio', 'Invest'],
    ].map(([s, why, a]) => (
      <div key={s} className="flex items-center justify-between gap-3 bg-white border border-[#E3E7ED] rounded-lg px-3 py-2">
        <span className="min-w-0">
          <span className={`block text-[13px] font-semibold ${INK}`}>{s}</span>
          <span className={`block text-[12px] truncate ${MUTED}`}>{why}</span>
        </span>
        <span className={`text-[12px] font-semibold shrink-0 ${BODY}`}>{a}</span>
      </div>
    ))}
  </div>
);

const AuditMockup: React.FC = () => (
  <div className="bg-white border border-[#E3E7ED] rounded-lg p-4 space-y-3">
    <div className="flex items-center justify-between">
      <span className={`text-[13px] font-semibold ${INK}`}>Gross margin · 38.51%</span>
      <Tag tone="pass">Live · from data</Tag>
    </div>
    <div className={`rounded-md bg-[#F7F8FA] border border-[#EDF0F4] px-3 py-2 font-mono text-[12px] ${BODY}`}>
      Σ gross_margin ÷ Σ net_sales over the selected window
    </div>
    {[
      ['1', 'Source', 'fact_sales — 357,471 rows'],
      ['2', 'Calculation', 'one documented SQL function'],
      ['3', 'Check', 'breakdowns reconcile to the total'],
      ['4', 'Shown', 'card, drill-down and audit trail agree'],
    ].map(([n, k, v]) => (
      <div key={n} className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-[#FFD966] text-[12px] font-bold text-[#1F2A3D] flex items-center justify-center">{n}</span>
        <span className={`w-24 text-[13px] font-semibold ${INK}`}>{k}</span>
        <span className={`text-[13px] ${BODY}`}>{v}</span>
      </div>
    ))}
  </div>
);

/* ── ROI calculator (illustrative model, same as the deck) ─────────────────── */

const RoiCalculator: React.FC = () => {
  const [cases, setCases] = useState(12);
  const [weekly, setWeekly] = useState(50);
  const [weeks, setWeeks] = useState(6);
  const [hours, setHours] = useState(12);
  const atRisk = cases * weeks * weekly / 1000;          // $M per year
  const protectedM = atRisk * 0.67;                      // 67% of the delay removed
  const hoursFreed = Math.round(cases * hours * 0.75);   // 75% less investigation effort
  const field = (label: string, value: number, set: (v: number) => void, step: number, suffix: string) => (
    <label className="block">
      <span className={`text-[13px] font-semibold ${INK}`}>{label}</span>
      <div className="mt-1.5 flex items-center border border-[#D9DEE6] rounded-lg bg-white focus-within:border-[#B7791F]">
        <input type="number" min={0} step={step} value={value}
          onChange={e => set(Math.max(0, Number(e.target.value) || 0))}
          className={`w-full bg-transparent px-3 py-2 text-[15px] outline-none ${INK}`} />
        <span className={`px-3 text-[13px] ${MUTED}`}>{suffix}</span>
      </div>
    </label>
  );
  return (
    <div className="grid md:grid-cols-2 gap-6 bg-white border border-[#E3E7ED] rounded-2xl p-6 md:p-8">
      <div className="space-y-4">
        <p className={`font-display text-xl ${INK}`}>Estimate it for your portfolio</p>
        {field('Late SKU decisions per year', cases, setCases, 1, 'cases')}
        {field('Revenue at risk per week, per issue', weekly, setWeekly, 5, '$K')}
        {field('Weeks from issue to decision today', weeks, setWeeks, 1, 'weeks')}
        {field('Analyst hours per issue', hours, setHours, 1, 'hours')}
      </div>
      <div className={`${TINT.sand.bg} border ${TINT.sand.border} rounded-xl p-6 flex flex-col justify-between`}>
        <div className="space-y-5">
          {[
            ['Revenue at risk per year', `$${atRisk.toFixed(1)}M`],
            ['Revenue protected (≈ 67%)', `$${protectedM.toFixed(1)}M`],
            ['Analyst hours released per year', hoursFreed.toLocaleString('en-US')],
          ].map(([k, v]) => (
            <div key={k}>
              <p className={`text-[13px] ${BODY}`}>{k}</p>
              <p className={`font-display text-4xl ${INK}`}>{v}</p>
            </div>
          ))}
        </div>
        <p className={`mt-6 text-[12px] leading-relaxed ${MUTED}`}>
          Illustrative model, not a guaranteed saving: revenue at risk = decisions × weeks × weekly revenue at risk;
          ≈ 67% is protected when the decision comes sooner; investigation effort falls by about 75%.
          Confirmed with your own data in a pilot.
        </p>
      </div>
    </div>
  );
};

/* ── FAQ ───────────────────────────────────────────────────────────────────── */

const FAQS = [
  ['Does V-Labs replace our ERP or planning tools?',
   'No. It sits on top of the systems you already run — ERP, planning and BI — and reads their sales, forecast, stock and promotion data. Decisions are then actioned in your existing systems.'],
  ['Is the data live?',
   'Data is refreshed on a schedule agreed with each client — typically every 4 to 6 hours. This demo runs on a generated, reproducible dataset rather than a live feed. External market signals are added through your own data providers’ APIs.'],
  ['Does V-Labs decide automatically?',
   'No. It is decision support: it shows where a SKU is underperforming, in which market, what is at stake and why — and recommends an action. A person decides.'],
  ['How long does it take to integrate?',
   'Typically 4–6 weeks when your data is available, plus 2–4 weeks if it first needs preparing. That is our estimate; it depends on the number of systems and markets.'],
  ['How do we know a number is right?',
   'Every figure is one documented calculation over named source data. Each card opens an audit trail with the formula, the columns used and the source, and every breakdown is checked to add up to its total.'],
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E3E7ED]">
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-left bg-transparent border-none cursor-pointer">
        <span className={`text-[17px] font-semibold ${INK}`}>{q}</span>
        {open ? <Minus size={18} className="shrink-0 text-[#B7791F]" /> : <Plus size={18} className="shrink-0 text-[#B7791F]" />}
      </button>
      {open && <p className={`pb-5 pr-8 text-[15px] leading-relaxed ${BODY}`}>{a}</p>}
    </div>
  );
};

/* ── Page ──────────────────────────────────────────────────────────────────── */

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDemo }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (id: string) => { setMenuOpen(false); scrollTo(id); };

  const primaryBtn = 'inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1F2A3D] text-white text-[15px] font-semibold hover:bg-[#2C3A52] transition-colors cursor-pointer border-none';
  const secondaryBtn = 'inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-[#1F2A3D] text-[15px] font-semibold border border-[#D9DEE6] hover:border-[#B7791F] transition-colors cursor-pointer';

  return (
    <div className="min-h-screen bg-white font-body text-[#3F4A5A]">
      {/* Acies top border, as on the deck */}
      <div className="flex h-2">
        <div className="flex-[3] bg-[#FFD966]" />
        <div className="flex-1 bg-[#222222]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#EDF0F4]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0">
            <img src="/logo-mark.png" alt="" className="h-8 w-8" />
            <span className="text-left leading-tight">
              <span className={`block text-[15px] font-bold ${INK}`}>V-Labs</span>
              <span className={`block text-[11px] tracking-wide ${MUTED}`}>by Acies Global</span>
            </span>
          </button>
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(n => (
              <button key={n.id} onClick={() => go(n.id)}
                className={`text-[14px] font-medium bg-transparent border-none cursor-pointer ${BODY} hover:text-[#1F2A3D]`}>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <button onClick={onEnterDemo} className={`${primaryBtn} !py-2.5 !text-[14px] whitespace-nowrap`}>
                Explore the Demo <ArrowRight size={16} />
              </button>
            </span>
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"
              className="md:hidden p-2 bg-transparent border-none cursor-pointer text-[#1F2A3D]">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-[#EDF0F4] bg-white px-5 py-3 space-y-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => go(n.id)}
                className={`block w-full text-left py-2 text-[15px] bg-transparent border-none cursor-pointer ${INK}`}>
                {n.label}
              </button>
            ))}
            <button onClick={onEnterDemo} className={`${primaryBtn} w-full justify-center mt-2`}>
              Explore the Demo <ArrowRight size={16} />
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 md:pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center [&>*]:min-w-0">
          <div>
            <SectionLabel>Product Lifecycle &amp; Portfolio Intelligence</SectionLabel>
            <h1 className={`font-display text-4xl md:text-[56px] leading-[1.08] mt-4 ${INK}`}>
              From weeks of SKU reviews to decisions in hours.
            </h1>
            <p className={`mt-6 text-[18px] leading-relaxed ${BODY}`}>
              V-Labs connects the sales, forecast, stock and promotion data a consumer-goods company already has,
              watches every SKU in every market, and flags what needs a decision — with the revenue at stake and the
              evidence behind it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={onEnterDemo} className={primaryBtn}>Explore the Demo <ArrowRight size={16} /></button>
              <button onClick={() => go('how')} className={secondaryBtn}>See How It Works</button>
            </div>
            <p className={`mt-6 text-[14px] ${MUTED}`}>
              Built for portfolio, product and pricing teams in FMCG and consumer packaged goods.
            </p>
          </div>
          <HeroMockup />
        </div>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            [TINT.blue, 'Weeks → hours', 'from issue to decision'],
            [TINT.green, '67%', 'faster decisions'],
            [TINT.violet, '75%', 'less analyst effort per issue'],
            [TINT.amber, '100%', 'of SKU × market combinations watched'],
          ].map(([t, big, small]) => {
            const tt = t as typeof TINT.blue;
            return (
              <div key={big as string} className={`${tt.bg} border ${tt.border} rounded-xl p-5`}>
                <p className={`font-display text-3xl ${tt.text}`}>{big as string}</p>
                <p className={`mt-1 text-[14px] ${BODY}`}>{small as string}</p>
              </div>
            );
          })}
        </div>
        <p className={`mt-3 text-[12px] ${MUTED}`}>
          Estimates from our model, to be confirmed with client data in a pilot — not independently validated customer results.
        </p>
      </section>

      {/* Problem */}
      <section id="problem" className="bg-[#FAFBFC] border-y border-[#EDF0F4] scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <SectionLabel>The current reality</SectionLabel>
          <SectionTitle>SKU decisions shouldn&rsquo;t wait for the quarter-end review.</SectionTitle>
          <p className={`mt-4 max-w-3xl text-[17px] leading-relaxed ${BODY}`}>
            The data already exists. The time goes into finding the problem, explaining it and getting it in front of
            the person who can act.
          </p>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              [Layers, 'Evidence in many systems', 'Sales, forecast, stock and promotion data sit in different tools and reports.'],
              [MapPinned, 'National totals hide local problems', 'A SKU declining in one market is invisible in the country or group view.'],
              [Search, 'Manual investigation', 'About 12 analyst hours per issue to pull data together and explain it.'],
              [BellOff, 'No proactive alerts', 'Problems are found only when someone happens to look.'],
            ].map(([Icon, h, d], i) => {
              const I = Icon as typeof Layers;
              return (
                <div key={h as string} className="bg-white border border-[#E3E7ED] rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <I size={20} className="text-[#B7791F]" />
                    <span className={`text-[12px] font-bold ${MUTED}`}>0{i + 1}</span>
                  </div>
                  <p className={`mt-4 text-[16px] font-semibold ${INK}`}>{h as string}</p>
                  <p className={`mt-2 text-[14px] leading-relaxed ${BODY}`}>{d as string}</p>
                </div>
              );
            })}
          </div>

          <p className={`mt-14 text-[13px] font-bold uppercase tracking-[0.2em] ${MUTED}`}>What independent surveys report</p>
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              [TINT.blue, '73%', 'of leaders say slow decisions and delayed execution cost them up to 5% of annual revenue',
                'West Monroe, Nov 2025 · 1,200+ US leaders'],
              [TINT.amber, '2.4%', 'average annual revenue lost to disruption — and 40+ hours just to understand its impact',
                'Sphera, May 2026 · 200 CFOs and COOs'],
              [TINT.violet, '2–5%', 'of total revenue typically lost by the 73% of companies that report a loss',
                'Cleo / Dimensional Research, Jun 2026'],
              [TINT.rose, '$1.73T', 'lost every year to out-of-stocks and overstocks — 6.5% of global retail sales',
                'IHL Group, Sep 2025'],
            ].map(([t, big, txt, src]) => {
              const tt = t as typeof TINT.blue;
              return (
                <div key={big as string} className={`${tt.bg} border ${tt.border} rounded-xl p-5 flex flex-col`}>
                  <p className={`font-display text-4xl ${tt.text}`}>{big as string}</p>
                  <p className={`mt-3 text-[14px] leading-relaxed flex-1 ${INK}`}>{txt as string}</p>
                  <p className={`mt-4 pt-3 border-t ${tt.border} text-[12px] italic ${MUTED}`}>{src as string}</p>
                </div>
              );
            })}
          </div>
          <div className={`mt-8 ${TINT.sand.bg} border ${TINT.sand.border} border-l-4 border-l-[#8A6D1F] rounded-lg px-5 py-4`}>
            <p className={`text-[16px] ${INK}`}>
              <span className="font-semibold">The gap is not missing data.</span> It is the time between a signal and a
              decision — that is where revenue leaks.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-5 py-20 scroll-mt-20">
        <SectionLabel>How V-Labs works</SectionLabel>
        <SectionTitle>Turn scattered portfolio data into decisions with evidence.</SectionTitle>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            [Plug, TINT.blue, 'Connect', 'Read sales, forecast, stock and promotion data from the systems you already run, refreshed on a schedule you set.',
              'One governed data model'],
            [Radar, TINT.amber, 'Detect', 'Watch every SKU in every market against clear rules — declining sales, margin below portfolio, stockouts, supplier notices.',
              'Alerts ranked by revenue at stake'],
            [Microscope, TINT.violet, 'Diagnose', 'Drill from the portfolio to the country and the SKU, and see why it was flagged.',
              'Root cause in hours, not weeks'],
            [ClipboardCheck, TINT.green, 'Decide', 'Assess the options — continue, reposition, reformulate, discontinue — with the revenue and margin effect.',
              'A recommended action with an evidence trail'],
          ].map(([Icon, t, h, d, out], i) => {
            const I = Icon as typeof Plug;
            const tt = t as typeof TINT.blue;
            return (
              <div key={h as string} className={`${tt.bg} border ${tt.border} rounded-xl p-6 flex flex-col`}>
                <div className="flex items-center justify-between">
                  <I size={22} className={tt.text} />
                  <span className={`text-[12px] font-bold ${MUTED}`}>0{i + 1}</span>
                </div>
                <p className={`mt-4 font-display text-2xl ${tt.text}`}>{h as string}</p>
                <p className={`mt-2 text-[14px] leading-relaxed flex-1 ${BODY}`}>{d as string}</p>
                <p className={`mt-4 pt-3 border-t ${tt.border} text-[13px] ${INK}`}>
                  <span className="font-semibold">Output: </span>{out as string}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className={`text-[13px] font-semibold mr-1 ${INK}`}>Built for</span>
          {['FMCG', 'Consumer packaged goods', 'Food & beverage', 'Personal care', 'Household'].map(t => (
            <span key={t} className={`text-[13px] px-3 py-1 rounded-full border border-[#E3E7ED] bg-white ${BODY}`}>{t}</span>
          ))}
        </div>
        <p className={`mt-10 font-display text-2xl md:text-3xl ${INK}`}>Data connects. Rules detect. People decide.</p>
      </section>

      {/* Business case */}
      <section id="business-case" className="bg-[#FAFBFC] border-y border-[#EDF0F4] scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <SectionLabel>The business case</SectionLabel>
          <SectionTitle>Protect revenue by deciding sooner.</SectionTitle>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              ['Time', 'Weeks to hours from issue to decision', 'Measure the time from the first signal to the recorded decision, before and during a pilot.'],
              ['Revenue', 'About two-thirds of revenue at risk protected', 'Compare revenue at risk on the pilot category against the baseline period.'],
              ['Effort and coverage', '75% less analyst effort; every SKU × market watched', 'Track analyst hours per issue and the share of combinations reviewed each cycle.'],
            ].map(([k, claim, how], i) => (
              <div key={k} className="bg-white border border-[#E3E7ED] rounded-xl p-6">
                <span className={`text-[12px] font-bold ${MUTED}`}>0{i + 1} · {k}</span>
                <p className={`mt-3 text-[18px] font-semibold leading-snug ${INK}`}>{claim}</p>
                <p className={`mt-4 pt-3 border-t border-[#EDF0F4] text-[13px] ${BODY}`}>
                  <span className="font-semibold">How to measure: </span>{how}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10"><RoiCalculator /></div>

          <p className={`mt-14 text-[13px] font-bold uppercase tracking-[0.2em] ${MUTED}`}>What leading brands learned</p>
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Hershey', '1999', '$100M+ of orders missed in peak season; quarterly profit −19%.'],
              ['Nike', '2001', '$100M of sales lost in one quarter; the rebuild took 6 years and $400–500M.'],
              ['Nestlé', '2022–24', 'Cut more than 20% of SKUs and walked away from ≈ $750M of zero-profit revenue.'],
              ['Unilever', '2024', 'Refocused on 30 Power Brands — about 75% of turnover.'],
            ].map(([co, yr, txt]) => (
              <div key={co} className="bg-white border border-[#E3E7ED] rounded-xl p-5">
                <div className="flex items-baseline justify-between">
                  <p className={`font-display text-xl ${INK}`}>{co}</p>
                  <span className={`text-[12px] ${MUTED}`}>{yr}</span>
                </div>
                <p className={`mt-2 text-[14px] leading-relaxed ${BODY}`}>{txt}</p>
              </div>
            ))}
          </div>
          <p className={`mt-3 text-[12px] ${MUTED}`}>
            Sources: published Hershey (1999) and Nike (2001) case studies; Nike recovery, CIO Magazine (2004); Nestlé
            earnings commentary (2024); Unilever Growth Action Plan (2024).
          </p>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="max-w-6xl mx-auto px-5 py-20 scroll-mt-20">
        <SectionLabel>Platform</SectionLabel>
        <SectionTitle>Nine capabilities. One connected decision journey.</SectionTitle>
        <div className="mt-12 space-y-16">
          {[
            {
              icon: BellRing, label: 'Signals Board', title: 'Know what needs attention the moment it appears',
              bullets: ['Rules over sales, margin, stock, launch and supplier data', 'Each alert carries its category, market and revenue at stake', 'Ranked so the biggest exposure comes first'],
              outcome: 'No manual hunting for problems.', mock: <SignalsMockup />,
            },
            {
              icon: Network, label: 'Top-Down Drill', title: 'From the portfolio to the market and the SKU',
              bullets: ['Revenue, margin, growth and fulfilment by country and region', 'Every breakdown adds up to the headline', 'Straight to the SKU that is causing the change'],
              outcome: 'Root cause in hours, not weeks.', mock: <DrillMockup />,
            },
            {
              icon: Filter, label: 'SKU Rationalization', title: 'Keep, fix or exit — with the reason stated',
              bullets: ['Each flagged SKU gets one clear reason and one action', 'Revenue and margin effect of removing it', 'Strong performers flagged for investment'],
              outcome: 'Faster, defensible portfolio decisions.', mock: <RationaleMockup />,
            },
            {
              icon: FileSearch, label: 'Audit trail', title: 'Every number shows where it came from',
              bullets: ['Formula, source columns and data provenance on every card', 'Assumptions labelled as assumptions', 'Totals checked against their breakdowns'],
              outcome: 'Numbers leadership can trust.', mock: <AuditMockup />,
            },
          ].map((m, i) => {
            const I = m.icon;
            return (
              <div key={m.label} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center [&>*]:min-w-0 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <div>
                  <p className={`flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.15em] ${LABEL}`}>
                    <I size={16} /> {m.label}
                  </p>
                  <h3 className={`mt-3 font-display text-2xl md:text-3xl ${INK}`}>{m.title}</h3>
                  <ul className="mt-5 space-y-2.5">
                    {m.bullets.map(b => (
                      <li key={b} className={`flex gap-3 text-[15px] ${BODY}`}>
                        <ShieldCheck size={18} className="shrink-0 mt-0.5 text-[#23824A]" />{b}
                      </li>
                    ))}
                  </ul>
                  <p className={`mt-5 text-[15px] ${INK}`}><span className="font-semibold">Business outcome: </span>{m.outcome}</p>
                </div>
                <div className={`${TINT.sand.bg} border ${TINT.sand.border} rounded-2xl p-5`}>
                  <p className={`mb-3 text-[11px] uppercase tracking-widest ${MUTED}`}>Mock-up · demo dataset</p>
                  {m.mock}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-16 flex flex-wrap gap-2">
          <span className={`text-[13px] font-semibold mr-1 ${INK}`}>Also in the platform</span>
          {['Executive Home', 'Portfolio Health', 'Profitability', 'SKU Assortment', 'Launch Readiness'].map(t => (
            <span key={t} className={`text-[13px] px-3 py-1 rounded-full border border-[#E3E7ED] bg-white ${BODY}`}>{t}</span>
          ))}
          <span className={`text-[13px] px-3 py-1 rounded-full border border-dashed border-[#C9CFD8] ${MUTED}`}>Agent Orchestrator · roadmap</span>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className={`${TINT.blue.bg} border ${TINT.blue.border} rounded-2xl px-8 py-12 text-center`}>
          <h2 className={`font-display text-3xl md:text-4xl ${INK}`}>See the decision journey in action.</h2>
          <p className={`mt-3 text-[16px] ${BODY}`}>
            Choose a role — portfolio VP, product manager or pricing and margin — and explore the demo.
          </p>
          <button onClick={onEnterDemo} className={`${primaryBtn} mt-7`}>Explore the Demo <ArrowRight size={16} /></button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#FAFBFC] border-y border-[#EDF0F4] scroll-mt-20">
        <div className="max-w-3xl mx-auto px-5 py-20">
          <SectionLabel>FAQ</SectionLabel>
          <SectionTitle>Common questions about V-Labs</SectionTitle>
          <div className="mt-8">
            {FAQS.map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-6xl mx-auto px-5 py-20 text-center">
        <h2 className={`font-display text-3xl md:text-[44px] leading-tight max-w-3xl mx-auto ${INK}`}>
          Make portfolio decisions faster, clearer and traceable.
        </h2>
        <button onClick={onEnterDemo} className={`${primaryBtn} mt-8`}>Explore the Demo <ArrowRight size={16} /></button>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EDF0F4]">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo-mark.png" alt="" className="h-7 w-7" />
            <span className={`text-[14px] ${INK}`}>
              <span className="font-semibold">V-Labs</span> · Product Lifecycle &amp; Portfolio Intelligence
            </span>
          </div>
          <p className={`text-[13px] ${MUTED}`}>© 2026 Acies Global. Demo built on a generated dataset.</p>
        </div>
        <div className="flex h-1.5">
          <div className="flex-[3] bg-[#FFD966]" />
          <div className="flex-1 bg-[#222222]" />
        </div>
      </footer>
    </div>
  );
};
