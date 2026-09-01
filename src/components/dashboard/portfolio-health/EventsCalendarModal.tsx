import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle, Clock, Check } from 'lucide-react';
import { ModalShell } from '../../common/Modal';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'launch' | 'review' | 'campaign' | 'task' | 'event';
  prio: 'high' | 'medium' | 'low';
  owner: string;
  start: Date;
  end: Date;
  desc: string;
  overdue?: boolean;
  deadline?: boolean;
}

interface EventsCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const CAL_TODAY = new Date();
const calDateStr = (offset: number, hr = 0, min = 0) => {
  const d = new Date(CAL_TODAY);
  d.setDate(d.getDate() + offset);
  d.setHours(hr, min, 0, 0);
  return d;
};

const CAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'VP Portfolio Review', type: 'review', prio: 'high', owner: 'VP + PMs', start: calDateStr(0, 9, 0), end: calDateStr(0, 10, 0), desc: 'Quarterly portfolio health review with product team.' },
  { id: 'e2', title: 'Mango Fizz Launch Readiness', type: 'launch', prio: 'high', owner: 'Product Mgmt', start: calDateStr(0, 11, 30), end: calDateStr(0, 12, 30), desc: 'Final readiness gate before shelf placement.' },
  { id: 'e3', title: 'Promo Budget Approval', type: 'meeting', prio: 'high', owner: 'Finance + VP', start: calDateStr(0, 14, 0), end: calDateStr(0, 15, 0), desc: 'Approve Q4 promotional budget allocation.' },
  { id: 'e4', title: 'Supply Chain Sync', type: 'meeting', prio: 'medium', owner: 'Ops Team', start: calDateStr(0, 16, 0), end: calDateStr(0, 16, 30), desc: 'Weekly supply chain status update.' },
  { id: 'e5', title: 'Floor Cleaner Rationalization Decision', type: 'task', prio: 'high', owner: 'VP', start: calDateStr(-3, 10, 0), end: calDateStr(-3, 11, 0), desc: 'Sign-off on removing Floor Cleaner from portfolio.', overdue: true },
  { id: 'e6', title: 'Choco Wafers Margin Review', type: 'review', prio: 'high', owner: 'Finance', start: calDateStr(-2, 9, 0), end: calDateStr(-2, 10, 0), desc: 'Review promo dependency and margin erosion.', overdue: true },
  { id: 'e7', title: 'Q3 Business Review', type: 'review', prio: 'high', owner: 'All Directors', start: calDateStr(-5, 10, 0), end: calDateStr(-5, 13, 0), desc: 'Quarterly business performance review.' },
  { id: 'e8', title: 'Herbal Shampoo Scale Planning', type: 'meeting', prio: 'high', owner: 'Ops + Product', start: calDateStr(1, 10, 0), end: calDateStr(1, 11, 0), desc: 'Plan supply chain scale-up for Herbal Shampoo.' },
  { id: 'e9', title: 'Mango Fizz 750ml Launch 🚀', type: 'launch', prio: 'high', owner: 'Marketing + Sales', start: calDateStr(2, 9, 0), end: calDateStr(2, 12, 0), desc: 'Official market launch — 240 store placement begins.' },
  { id: 'e10', title: 'APAC Region Strategy Meet', type: 'meeting', prio: 'medium', owner: 'VP + APAC Lead', start: calDateStr(3, 11, 0), end: calDateStr(3, 12, 30), desc: 'Q4 strategy alignment for APAC region.' },
  { id: 'e11', title: 'Q4 Campaign Kickoff', type: 'campaign', prio: 'high', owner: 'Marketing', start: calDateStr(4, 9, 0), end: calDateStr(4, 11, 0), desc: 'Kickoff festive season campaign planning.' },
  { id: 'e12', title: 'SKU Portfolio Audit', type: 'task', prio: 'medium', owner: 'Product Mgmt', start: calDateStr(4, 14, 0), end: calDateStr(4, 16, 0), desc: 'Annual SKU audit — complexity and value scoring.' },
  { id: 'e13', title: 'Board Business Review', type: 'event', prio: 'high', owner: 'Board + VP', start: calDateStr(5, 10, 0), end: calDateStr(5, 14, 0), desc: 'Monthly board-level portfolio performance review.' },
  { id: 'e14', title: 'Herbal Shampoo Pro Launch', type: 'launch', prio: 'high', owner: 'Product + Sales', start: calDateStr(7, 9, 0), end: calDateStr(7, 12, 0), desc: 'New variant launch — Personal Care category.' },
  { id: 'e15', title: 'Supplier Negotiation — ChemCo', type: 'meeting', prio: 'high', owner: 'Procurement', start: calDateStr(7, 14, 0), end: calDateStr(7, 15, 30), desc: 'Renegotiate supply terms for Fabric Softener.' },
  { id: 'e16', title: 'Investor Deck Deadline', type: 'task', prio: 'high', owner: 'Finance', start: calDateStr(8, 17, 0), end: calDateStr(8, 18, 0), desc: 'Submit Q4 investor update deck.', deadline: true },
  { id: 'e17', title: 'Americas Sales Review', type: 'review', prio: 'medium', owner: 'Sales + Finance', start: calDateStr(10, 11, 0), end: calDateStr(10, 12, 30), desc: 'Americas forecast attainment deep-dive.' },
  { id: 'e18', title: 'Festive Campaign Launch', type: 'campaign', prio: 'high', owner: 'Marketing', start: calDateStr(12, 9, 0), end: calDateStr(12, 11, 0), desc: 'Big festive season digital + TVC campaign.' },
  { id: 'e19', title: 'Pricing Strategy Workshop', type: 'meeting', prio: 'medium', owner: 'Pricing + VP', start: calDateStr(14, 10, 0), end: calDateStr(14, 13, 0), desc: 'Annual pricing lever review and strategy setting.' },
  { id: 'e20', title: 'Oat Cookies Multigrain Launch', type: 'launch', prio: 'medium', owner: 'Product + Sales', start: calDateStr(18, 9, 0), end: calDateStr(18, 11, 0), desc: 'New variant launch — Snacks category.' },
  { id: 'e21', title: 'Annual Portfolio Planning', type: 'event', prio: 'high', owner: 'All VPs', start: calDateStr(21, 9, 0), end: calDateStr(21, 17, 0), desc: 'Full-day annual planning session — FY next year.' },
  { id: 'e22', title: 'Category P&L Deep Dive', type: 'review', prio: 'high', owner: 'Finance + Product', start: calDateStr(25, 11, 0), end: calDateStr(25, 13, 0), desc: 'Detailed P&L review by category.' },
  { id: 'e23', title: 'Digital Campaign Performance', type: 'review', prio: 'medium', owner: 'Marketing', start: calDateStr(6, 14, 0), end: calDateStr(6, 15, 0), desc: 'Mid-campaign performance review.' },
  { id: 'e24', title: 'Warehouse Audit — Mumbai DC', type: 'task', prio: 'medium', owner: 'Operations', start: calDateStr(9, 9, 0), end: calDateStr(9, 12, 0), desc: 'Quarterly warehouse capacity and inventory audit.' },
  { id: 'e25', title: 'EMEA Partner Meet', type: 'meeting', prio: 'medium', owner: 'VP + EMEA Lead', start: calDateStr(16, 11, 0), end: calDateStr(16, 12, 30), desc: 'EMEA channel strategy and partner alignment.' },
];

const CAL_TYPE_CFG = {
  meeting:  { color: '#3b82f6', bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400 border border-blue-500/25', label: 'Meeting'  },
  launch:   { color: '#10b981', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400 border border-emerald-500/25', label: 'Launch'   },
  review:   { color: '#8b5cf6', bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400 border border-purple-500/25', label: 'Review'   },
  campaign: { color: '#f59e0b', bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400 border border-amber-500/25', label: 'Campaign' },
  task:     { color: '#6b7280', bg: 'bg-zinc-500/10 dark:bg-zinc-500/20', text: 'text-zinc-700 dark:text-zinc-400 border border-zinc-500/25', label: 'Task'     },
  event:    { color: '#ec4899', bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400 border border-pink-500/25', label: 'Event'    },
};

const calSameDay = (a: Date, b: Date) => 
  a.getFullYear() === b.getFullYear() && 
  a.getMonth() === b.getMonth() && 
  a.getDate() === b.getDate();

const calEventsOnDay = (d: Date) => 
  CAL_EVENTS.filter(e => calSameDay(e.start, d)).sort((a, b) => a.start.getTime() - b.start.getTime());

const calFmt = (d: Date) => 
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

const calFmtDate = (d: Date) => 
  d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

const calIsToday = (d: Date) => calSameDay(d, CAL_TODAY);

export const EventsCalendarModal: React.FC<EventsCalendarModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [cursorDate, setCursorDate] = useState<Date>(new Date(CAL_TODAY));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(CAL_TODAY));
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleDaySelect = (d: Date) => {
    setSelectedDate(d);
    setCursorDate(new Date(d));
    const evs = calEventsOnDay(d);
    if (evs.length > 0) {
      setDrawerOpen(true);
    } else {
      setDrawerOpen(false);
    }
  };

  // Navigations
  const handleNav = (direction: number) => {
    if (view === 'month') {
      const nextDate = new Date(cursorDate);
      nextDate.setMonth(nextDate.getMonth() + direction);
      setCursorDate(nextDate);
    } else if (view === 'week') {
      const nextDate = new Date(cursorDate);
      nextDate.setDate(nextDate.getDate() + direction * 7);
      setCursorDate(nextDate);
    } else {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + direction);
      setSelectedDate(nextDate);
      setCursorDate(nextDate);
      const evs = calEventsOnDay(nextDate);
      if (evs.length > 0) {
        setDrawerOpen(true);
      } else {
        setDrawerOpen(false);
      }
    }
  };

  // Month calculations
  const renderMonthView = () => {
    const year = cursorDate.getFullYear();
    const month = cursorDate.getMonth();
    const monthName = cursorDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const cells: { d: Date; other: boolean }[] = [];
    for (let i = startDow - 1; i >= 0; i--) {
      cells.push({ d: new Date(year, month - 1, daysInPrev - i), other: true });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ d: new Date(year, month, i), other: false });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ d: new Date(year, month + 1, cells.length - daysInMonth - startDow + 1), other: true });
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-4 py-2 border-b border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
          <button onClick={() => handleNav(-1)} className="w-7 h-7 border border-black/10 dark:border-white/10 rounded bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center justify-center">
            <ChevronLeft size={14} />
          </button>
          <div className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">{monthName}</div>
          <button onClick={() => handleNav(1)} className="w-7 h-7 border border-black/10 dark:border-white/10 rounded bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center justify-center">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 text-center uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-7 gap-1">
                {week.map(({ d, other }, dIdx) => {
                  const evs = calEventsOnDay(d);
                  const isTd = calIsToday(d);
                  const isSel = calSameDay(d, selectedDate);
                  const show = evs.slice(0, 2);
                  const overflow = evs.length - 2;

                  return (
                    <div 
                      key={dIdx} 
                      onClick={() => handleDaySelect(d)}
                      className={`min-h-[58px] rounded p-1 cursor-pointer border transition-all relative flex flex-col justify-between ${
                        other ? 'opacity-40' : ''
                      } ${
                        isTd 
                          ? 'bg-blue-500/[0.06] border-blue-500/40 dark:border-blue-500/50' 
                          : isSel 
                            ? 'bg-blue-500/[0.12] border-blue-500 dark:border-blue-500' 
                            : 'bg-black/[0.01] dark:bg-white/[0.02] border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className={`text-[10px] font-bold ${isTd ? 'text-blue-500 font-extrabold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        {d.getDate()}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                        {show.map(e => (
                          <div 
                            key={e.id} 
                            className={`text-[8px] font-bold px-1 py-0.5 rounded-sm truncate w-full ${CAL_TYPE_CFG[e.type].bg} ${CAL_TYPE_CFG[e.type].text}`}
                            title={e.title}
                          >
                            {e.title}
                          </div>
                        ))}
                        {overflow > 0 && (
                          <div className="text-[7.5px] text-zinc-400 dark:text-zinc-500 font-bold pl-1 mt-0.5">
                            +{overflow} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Week calculations
  const renderWeekView = () => {
    const start = new Date(cursorDate);
    start.setDate(start.getDate() - start.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const navLabel = `${days[0].toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-4 py-2 border-b border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
          <button onClick={() => handleNav(-1)} className="w-7 h-7 border border-black/10 dark:border-white/10 rounded bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center justify-center">
            <ChevronLeft size={14} />
          </button>
          <div className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">{navLabel}</div>
          <button onClick={() => handleNav(1)} className="w-7 h-7 border border-black/10 dark:border-white/10 rounded bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center justify-center">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto p-3">
          <div className="min-w-[560px]">
            {/* Header row */}
            <div className="grid grid-cols-[44px_repeat(7,1fr)] border-b border-black/10 dark:border-white/10 pb-1">
              <div></div>
              {days.map((d, i) => {
                const isTd = calIsToday(d);
                return (
                  <div key={i} className={`p-1 text-center ${isTd ? 'text-blue-500 font-extrabold' : ''}`}>
                    <div className="text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      {d.toLocaleDateString([], { weekday: 'short' })}
                    </div>
                    <div 
                      onClick={() => handleDaySelect(d)} 
                      className={`text-[12px] font-bold mx-auto cursor-pointer flex items-center justify-center w-5 h-5 rounded-full ${
                        isTd ? 'bg-blue-500 text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Hour rows */}
            <div className="divide-y divide-black/[0.03] dark:divide-white/[0.03] mt-1 max-h-[300px] overflow-y-auto">
              {hours.map(hr => (
                <div key={hr} className="grid grid-cols-[44px_repeat(7,1fr)] items-stretch">
                  <div className="text-[8.5px] text-zinc-400 dark:text-zinc-500 text-right pr-2 font-mono flex items-center justify-end h-8 shrink-0">
                    {hr}:00
                  </div>
                  {days.map((d, dIdx) => {
                    const evs = calEventsOnDay(d).filter(e => e.start.getHours() === hr);
                    return (
                      <div key={dIdx} className="border-l border-black/5 dark:border-white/5 p-0.5 relative min-h-[32px] hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        {evs.map(e => (
                          <div 
                            key={e.id}
                            onClick={() => handleDaySelect(d)}
                            className={`rounded-sm px-1 py-0.5 text-[7.5px] font-bold truncate cursor-pointer h-full flex flex-col justify-center ${CAL_TYPE_CFG[e.type].bg} ${CAL_TYPE_CFG[e.type].text}`}
                            title={`${e.title}: ${calFmt(e.start)}`}
                          >
                            {e.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Day calculations
  const renderDayView = () => {
    const d = selectedDate;
    const evs = calEventsOnDay(d);
    const label = calFmtDate(d);
    const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const isTd = calIsToday(d);

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-4 py-2 border-b border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
          <button onClick={() => handleNav(-1)} className="w-7 h-7 border border-black/10 dark:border-white/10 rounded bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center justify-center">
            <ChevronLeft size={14} />
          </button>
          <div className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            {label}
            {isTd && <span className="bg-blue-500/10 text-blue-500 text-[8px] font-extrabold px-1.5 py-0.5 rounded">TODAY</span>}
          </div>
          <button onClick={() => handleNav(1)} className="w-7 h-7 border border-black/10 dark:border-white/10 rounded bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center justify-center">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="p-3 space-y-2 max-h-[350px] overflow-y-auto">
          {evs.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-[10px] font-medium">
              No events scheduled for this day.
            </div>
          ) : (
            hours.map(hr => {
              const hrEvs = evs.filter(e => e.start.getHours() === hr);
              return (
                <div key={hr} className="flex gap-3 min-h-[44px]">
                  <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 w-9 text-right pt-1 shrink-0">
                    {hr}:00
                  </div>
                  <div className="w-[1px] bg-black/10 dark:bg-white/10 my-0.5 shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    {hrEvs.map(e => {
                      const cfg = CAL_TYPE_CFG[e.type];
                      const prioIcon = e.prio === 'high' ? '🔴' : e.prio === 'medium' ? '🟡' : '🟢';
                      return (
                        <div 
                          key={e.id}
                          className={`border rounded p-2 flex items-center justify-between gap-3 transition-all cursor-pointer ${cfg.bg} border-black/5 dark:border-white/10 hover:opacity-95`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">{e.title}</div>
                            <div className="text-[9px] text-zinc-500 dark:text-zinc-500 mt-0.5 font-medium flex items-center gap-1.5">
                              <Clock size={9} />
                              {calFmt(e.start)} – {calFmt(e.end)} &nbsp;·&nbsp; Owner: {e.owner}
                            </div>
                            <div className="text-[9.5px] text-zinc-700 dark:text-zinc-400 mt-1 leading-relaxed">{e.desc}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${cfg.text}`}>
                              {cfg.label}
                            </span>
                            {e.overdue && (
                              <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded-sm font-bold uppercase">
                                Overdue
                              </span>
                            )}
                            <span className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                              <span>{prioIcon}</span>
                              <span className="capitalize">{e.prio}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Side Panel calculations
  // Today's events
  const todayEvs = calEventsOnDay(CAL_TODAY);
  // Upcoming 7 days
  const upcomingEvs = CAL_EVENTS.filter(e => {
    const diff = (e.start.getTime() - CAL_TODAY.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 7;
  }).sort((a, b) => a.start.getTime() - b.start.getTime());

  // Deadlines
  const deadlineEvs = CAL_EVENTS.filter(e => e.deadline || e.prio === 'high')
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 6);

  // Launches
  const launchEvs = CAL_EVENTS.filter(e => e.type === 'launch')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <ModalShell isOpen onClose={onClose} layer="panel" className="flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#6d28d9]/10 text-[#6d28d9] dark:bg-[#a78bfa]/15 dark:text-[#a78bfa] rounded-sm">
              <CalendarIcon size={14} />
            </div>
            <div>
              <span className="text-[13.5px] font-bold text-zinc-800 dark:text-zinc-100 block">
                Smart Events Calendar
              </span>
              <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-medium">
                VP Portfolio Launch Controls & Meeting Schedule
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View selectors */}
            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-sm overflow-hidden bg-black/5 dark:bg-white/5 p-0.5">
              <button 
                onClick={() => setView('month')}
                className={`px-3 py-1 text-[9px] font-bold rounded-sm border-none cursor-pointer ${
                  view === 'month' 
                    ? 'bg-[#6d28d9] dark:bg-[#a78bfa] text-white shadow-sm' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 bg-transparent'
                }`}
              >
                Month
              </button>
              <button 
                onClick={() => setView('week')}
                className={`px-3 py-1 text-[9px] font-bold rounded-sm border-none cursor-pointer ${
                  view === 'week' 
                    ? 'bg-[#6d28d9] dark:bg-[#a78bfa] text-white shadow-sm' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 bg-transparent'
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => { setView('day'); handleDaySelect(selectedDate); }}
                className={`px-3 py-1 text-[9px] font-bold rounded-sm border-none cursor-pointer ${
                  view === 'day' 
                    ? 'bg-[#6d28d9] dark:bg-[#a78bfa] text-white shadow-sm' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 bg-transparent'
                }`}
              >
                Day
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer border-none bg-transparent"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Modal Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start">
          
          {/* Main Calendar Panel */}
          <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded shadow-sm overflow-hidden flex flex-col">
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}

            {/* Event Detail Drawer (for Month/Week views) */}
            {view !== 'day' && drawerOpen && (
              <div className="border-t border-black/10 dark:border-white/10 p-4 bg-zinc-50/50 dark:bg-white/[0.01]">
                <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5 mb-3">
                  <span className="text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">
                    {calFmtDate(selectedDate)} {calIsToday(selectedDate) && <span className="bg-blue-500/10 text-blue-500 text-[7px] font-extrabold px-1 py-0.5 rounded ml-1">TODAY</span>} — {calEventsOnDay(selectedDate).length} Event(s)
                  </span>
                  <button onClick={() => setDrawerOpen(false)} className="text-zinc-400 hover:text-zinc-600 bg-transparent border-none cursor-pointer">
                    ✕
                  </button>
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {calEventsOnDay(selectedDate).map(e => {
                    const cfg = CAL_TYPE_CFG[e.type];
                    const prioColor = e.prio === 'high' ? 'text-red-500' : e.prio === 'medium' ? 'text-amber-500' : 'text-emerald-500';
                    return (
                      <div key={e.id} className="flex gap-2.5 p-2 bg-white dark:bg-zinc-900 rounded border border-black/[0.04] dark:border-white/[0.06] shadow-sm items-start">
                        <div className={`w-1.5 self-stretch rounded-full shrink-0`} style={{ backgroundColor: cfg.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-zinc-900 dark:text-zinc-200">{e.title}</div>
                          <div className="text-[8.5px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">
                            {calFmt(e.start)} – {calFmt(e.end)} &nbsp;·&nbsp; {e.owner}
                          </div>
                          <div className="text-[9px] text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">{e.desc}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          <span className={`text-[8.5px] font-bold capitalize ${prioColor}`}>
                            {e.prio}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Calendar Feeds */}
          <div className="flex flex-col gap-3 shrink-0">
            
            {/* Today's Events */}
            <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded overflow-hidden flex flex-col">
              <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center gap-1.5">
                <span>☀️</span> Today's Events
              </div>
              <div className="max-h-[140px] overflow-y-auto divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                {todayEvs.length > 0 ? (
                  todayEvs.map(e => (
                    <div 
                      key={e.id} 
                      onClick={() => handleDaySelect(CAL_TODAY)}
                      className="p-2.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all flex flex-col gap-1"
                    >
                      <div className="text-[9.5px] font-bold text-zinc-800 dark:text-zinc-200 truncate leading-snug">{e.title}</div>
                      <div className="flex items-center justify-between text-[8px] font-medium mt-0.5">
                        <span className="font-mono text-zinc-400 dark:text-zinc-500">{calFmt(e.start)}</span>
                        <span className={`px-1.5 py-0.2 rounded-sm ${CAL_TYPE_CFG[e.type].text}`}>{CAL_TYPE_CFG[e.type].label}</span>
                        <span className={`font-bold ${e.prio === 'high' ? 'text-red-500' : 'text-amber-500'}`}>{e.prio.toUpperCase()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-zinc-400 dark:text-zinc-500 text-[9.5px]">No events today.</div>
                )}
              </div>
            </div>

            {/* Upcoming 7 Days */}
            <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded overflow-hidden flex flex-col">
              <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center gap-1.5">
                <span>🔜</span> Next 7 Days
              </div>
              <div className="max-h-[140px] overflow-y-auto divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                {upcomingEvs.length > 0 ? (
                  upcomingEvs.map(e => {
                    const diff = Math.ceil((e.start.getTime() - CAL_TODAY.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div 
                        key={e.id} 
                        onClick={() => handleDaySelect(e.start)}
                        className="p-2.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all flex flex-col gap-1"
                      >
                        <div className="text-[9.5px] font-bold text-zinc-800 dark:text-zinc-200 truncate leading-snug">{e.title}</div>
                        <div className="flex items-center justify-between text-[8px] font-medium mt-0.5">
                          <span className="text-indigo-500 font-bold">{calFmtDate(e.start)}</span>
                          <span className={`px-1 rounded-sm ${CAL_TYPE_CFG[e.type].text}`}>{CAL_TYPE_CFG[e.type].label}</span>
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-1 py-0.2 rounded-sm font-bold">+{diff}d</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-zinc-400 dark:text-zinc-500 text-[9.5px]">No upcoming events.</div>
                )}
              </div>
            </div>

            {/* Important Deadlines */}
            <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded overflow-hidden flex flex-col">
              <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center gap-1.5">
                <span>⚠️</span> Important Deadlines
              </div>
              <div className="max-h-[140px] overflow-y-auto divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                {deadlineEvs.map(e => {
                  const isPast = e.start < CAL_TODAY && !calIsToday(e.start);
                  const isToday2 = calIsToday(e.start);
                  return (
                    <div 
                      key={e.id} 
                      onClick={() => handleDaySelect(e.start)}
                      className="p-2.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all flex flex-col gap-1"
                    >
                      <div className="text-[9.5px] font-bold text-zinc-800 dark:text-zinc-200 truncate leading-snug">{e.title}</div>
                      <div className="flex items-center justify-between text-[8px] font-medium mt-0.5">
                        <span className="text-zinc-500 font-bold">{calFmtDate(e.start)}</span>
                        {isPast ? (
                          <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-1 py-0.2 rounded-sm font-bold uppercase">Overdue</span>
                        ) : isToday2 ? (
                          <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1 py-0.2 rounded-sm font-bold uppercase">Today</span>
                        ) : (
                          <span className="bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 px-1 py-0.2 rounded-sm font-bold uppercase">Upcoming</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Launches */}
            <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded overflow-hidden flex flex-col">
              <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center gap-1.5">
                <span>🚀</span> Launch Pipeline
              </div>
              <div className="max-h-[140px] overflow-y-auto divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                {launchEvs.map(e => {
                  const isPast = e.start < CAL_TODAY && !calIsToday(e.start);
                  return (
                    <div 
                      key={e.id} 
                      onClick={() => handleDaySelect(e.start)}
                      className="p-2.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]">🚀</span>
                        <div className="text-[9.5px] font-bold text-zinc-800 dark:text-zinc-200 truncate flex-1">{e.title}</div>
                      </div>
                      <div className="flex items-center justify-between text-[8px] font-medium mt-1 pl-4">
                        <span className="text-zinc-500 dark:text-zinc-500 font-bold">{calFmtDate(e.start)}</span>
                        {isPast ? (
                          <span className="text-zinc-400 dark:text-zinc-600 line-through">Launched</span>
                        ) : (
                          <span className="text-emerald-500 font-extrabold font-mono">{calFmt(e.start)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-black/15 dark:border-white/15 pt-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent"
          >
            Close Calendar
          </button>
        </div>

      </div>
    </ModalShell>
  );
};
