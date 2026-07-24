import React, { useState } from 'react';
import { Plus, X, Calendar, Bell, AlertCircle, MessageSquare, ChevronDown, ChevronUp, MoveLeft, MoveRight } from 'lucide-react';

export interface Task {
  id: string;
  tags: string[];
  title: string;
  duration: string;
  progress?: string;
  dueDate: string;
  avatars: string[];
  alertType?: 'red-alarm' | 'exclamation';
  isCompleted?: boolean;
  comments?: number;
  subtasks?: number;
  isNew?: boolean;
  createdAt?: number;
}

export const DEFAULT_TASKS: Record<string, Task[]> = {
  pmo: [
    { id: 'pmo-1', tags: ['Design'], title: 'Network Design Implementation Design', duration: '52.25 days', progress: '42%', dueDate: '05/17', avatars: ['JO', 'AM'] },
    { id: 'pmo-2', tags: ['Deployment'], title: 'Install New Product in Corporate Data Centers and Go-Live', duration: '5 days', dueDate: '06/03/2025', avatars: ['JI'], alertType: 'red-alarm' },
    { id: 'pmo-3', tags: ['Scope'], title: 'Complete Post Implementation Survey', duration: '4 days', dueDate: '06/11/2025', avatars: ['JO'] },
    { id: 'pmo-4', tags: ['Development'], title: 'Complete Project Closure Checklist', duration: '7 days', dueDate: '06/05/2025', avatars: ['AM', 'JI'], alertType: 'exclamation' },
    { id: 'pmo-5', tags: ['Design'], title: 'Cutover Ph 2 Users and Monitor', duration: '5 days', dueDate: '06/10/2025', avatars: ['JO'] }
  ],
  it: [
    { id: 'it-1', tags: ['Testing'], title: 'Test Plan complete', duration: '0 days', dueDate: '07/31', avatars: ['AM'] },
    { id: 'it-2', tags: ['Development'], title: 'Modify code', duration: '10 days', dueDate: '03/25/2025', avatars: ['AM', 'JI'] },
    { id: 'it-3', tags: ['Design'], title: 'Re-test modified code', duration: '10 days', dueDate: '04/08/2025', avatars: ['JI'] }
  ],
  marketing: [
    { id: 'mkt-1', tags: ['Testing'], title: 'Test component modules to product specifications', duration: '20 days', dueDate: '01/15/2025', avatars: ['JO'] },
    { id: 'mkt-2', tags: ['Development'], title: 'Develop Product and System Test Plans based on product specifications.', duration: '13 days', dueDate: '07/31', avatars: ['AM'] },
    { id: 'mkt-3', tags: ['Development'], title: 'Re-test modified code', duration: '7 days', dueDate: '02/11/2025', avatars: [] },
    { id: 'mkt-4', tags: ['Design'], title: 'Create Mockup based on Network Design Implementation Definition and Design', duration: '40.75 days', dueDate: '07/12', avatars: ['JI', 'JO', 'AM'] }
  ],
  sales: [
    { id: 'sls-1', tags: ['Testing'], title: 'Test module integration', duration: '20 days', dueDate: '03/11/2025', avatars: ['JI', 'AM'], comments: 2, subtasks: 2 },
    { id: 'sls-2', tags: ['Scope'], title: 'Communication Error Communication', duration: '25 days', dueDate: '11/20', avatars: ['AM', 'JO'] },
    { id: 'sls-3', tags: ['Scope'], title: 'Pilot complete', duration: '0 days', dueDate: '05/13/2025', avatars: [] },
    { id: 'sls-4', tags: ['Scope', 'Design'], title: 'List of pilot users delivered from corporate to the team', duration: '0 days', dueDate: '02/11/2025', avatars: ['JO'] },
    { id: 'sls-5', tags: ['Deployment'], title: 'Finalize Project Closure report', duration: '3 days', dueDate: '05/20/2025', avatars: ['AM'] }
  ],
  engineering: [
    { id: 'eng-1', tags: ['Development'], title: 'Evaluate testing information', duration: '5 days', dueDate: '05/13/2025', avatars: ['AM', 'JI'] },
    { id: 'eng-2', tags: ['Testing'], title: 'Conduct Pilot User Testing', duration: '10 days', dueDate: '04/22/2025', avatars: ['JO'] },
    { id: 'eng-3', tags: ['Analysis'], title: 'Summarize activities required to move product into production', duration: '10 days', dueDate: '05/20/2025', avatars: ['JI'] },
    { id: 'eng-4', tags: ['Scope'], title: 'Close Network Connection Exchange', duration: '15 days', dueDate: '09/27', avatars: ['JI', 'JO', 'AM'], alertType: 'exclamation' },
    { id: 'eng-5', tags: ['Analysis'], title: 'Network Protocol Communication Exchange testing', duration: '5 days', dueDate: '09/30', avatars: ['JO'] }
  ],
  sustainability: [
    { id: 'sus-1', tags: ['Analysis'], title: 'Conduct product lifecycle carbon footprint assessment', duration: '14 days', dueDate: '06/20/2025', avatars: ['JI'] },
    { id: 'sus-2', tags: ['Design'], title: 'Assess biodegradable packaging replacement options', duration: '10 days', dueDate: '07/15/2025', avatars: ['AM'] }
  ],
  finance: [
    { id: 'fin-1', tags: ['Analysis'], title: 'Audit annual category margin projection model', duration: '8 days', dueDate: '05/30/2025', avatars: ['JO'] },
    { id: 'fin-2', tags: ['Scope'], title: 'Calculate post-rationalisation write-off savings', duration: '5 days', dueDate: '06/05/2025', avatars: ['AM'] }
  ],
  procurement: [
    { id: 'pro-1', tags: ['Development'], title: 'Draft supplier notice letter for Sunset SKUs', duration: '4 days', dueDate: '05/22/2025', avatars: ['JI'] },
    { id: 'pro-2', tags: ['Testing'], title: 'Verify alternative co-packer capacity runways', duration: '12 days', dueDate: '06/18/2025', avatars: ['JO'] }
  ],
  qa: [
    { id: 'qa-1', tags: ['Testing'], title: 'Execute formula stability testing for reformulated variants', duration: '30 days', dueDate: '08/01/2025', avatars: ['JI'] },
    { id: 'qa-2', tags: ['Analysis'], title: 'Verify label allergen statements compliance audit', duration: '5 days', dueDate: '05/28/2025', avatars: ['AM'] }
  ],
  rd: [
    { id: 'rd-1', tags: ['Design'], title: 'Finalise ingredient substitution specifications report', duration: '15 days', dueDate: '06/10/2025', avatars: ['AM', 'JI'] },
    { id: 'rd-2', tags: ['Development'], title: 'Create prototype packaging formats mockups', duration: '20 days', dueDate: '07/05/2025', avatars: ['JO'] }
  ],
  consumer: [
    { id: 'con-1', tags: ['Analysis'], title: 'Analyze post-rationalization focus group feedback', duration: '7 days', dueDate: '05/25/2025', avatars: ['JO'] },
    { id: 'con-2', tags: ['Scope'], title: 'Verify customer brand loyalty transition mapping data', duration: '10 days', dueDate: '06/12/2025', avatars: ['JI'] }
  ]
};

const DEFAULT_IT_COMPLETED: Task[] = [
  { id: 'it-comp-1', tags: ['Design'], title: 'Define Resources and effort for tasks and develop detailed MS Project Schedule', duration: '5 days', progress: '100%', dueDate: '11/20/2023', avatars: ['JO', 'AM'], alertType: 'red-alarm', isCompleted: true }
];

interface TrackerTabProps {
  tasks?: Record<string, Task[]>;
  setTasks?: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
}

export const TrackerTab: React.FC<TrackerTabProps> = ({ tasks: propsTasks, setTasks: propsSetTasks }) => {
  const [localTasks, setLocalTasks] = useState<Record<string, Task[]>>(DEFAULT_TASKS);
  const tasks = propsTasks || localTasks;
  const setTasks = propsSetTasks || setLocalTasks;
  const [completedItTasks, setCompletedItTasks] = useState<Task[]>(DEFAULT_IT_COMPLETED);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getElapsedTime = (createdAt: number) => {
    const diffMs = Date.now() - createdAt;
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) {
      return `${Math.max(1, diffSecs)} sec ago`;
    }
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    }
    const diffHrs = Math.floor(diffMins / 60);
    return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
  };

  // New task form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<string>('pmo');
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTag, setNewTag] = useState('Design');
  const [newOwner, setNewOwner] = useState('JO');

  const columns = [
    { key: 'pmo', label: 'PMO', themeClass: 'bg-[#fbece5] text-[#9a3412] dark:bg-orange-950/20 dark:text-orange-300 border-orange-200/50 dark:border-orange-900/30' },
    { key: 'it', label: 'IT', themeClass: 'bg-[#f3e8ff] text-[#6b21a8] dark:bg-purple-950/20 dark:text-purple-300 border-purple-200/50 dark:border-purple-900/30' },
    { key: 'marketing', label: 'Marketing', themeClass: 'bg-[#e0f2fe] text-[#075985] dark:bg-sky-950/20 dark:text-sky-300 border-sky-200/50 dark:border-sky-900/30' },
    { key: 'sales', label: 'Sales', themeClass: 'bg-[#f0fdf4] text-[#166534] dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/30' },
    { key: 'engineering', label: 'Engineering', themeClass: 'bg-[#f3f4f6] text-[#374151] dark:bg-zinc-800/40 dark:text-zinc-300 border-zinc-200/50 dark:border-zinc-700/30' },
    { key: 'sustainability', label: 'Sustainability', themeClass: 'bg-[#ecfccb] text-[#3f6212] dark:bg-lime-950/20 dark:text-lime-300 border-lime-200/50 dark:border-lime-900/30' },
    { key: 'finance', label: 'Finance', themeClass: 'bg-[#fee2e2] text-[#991b1b] dark:bg-red-950/20 dark:text-red-300 border-red-200/50 dark:border-red-900/30' },
    { key: 'procurement', label: 'Procurement', themeClass: 'bg-[#ffedd5] text-[#9a3412] dark:bg-amber-950/20 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/30' },
    { key: 'qa', label: 'Quality Assurance', themeClass: 'bg-[#e0f7fa] text-[#006064] dark:bg-cyan-950/20 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-900/30' },
    { key: 'rd', label: 'R&D', themeClass: 'bg-[#fdf2f8] text-[#9d174d] dark:bg-pink-950/20 dark:text-pink-300 border-pink-200/50 dark:border-pink-900/30' },
    { key: 'consumer', label: 'Consumer', themeClass: 'bg-[#fafaf9] text-[#44403c] dark:bg-stone-800/40 dark:text-stone-300 border-stone-200/50 dark:border-stone-900/30' }
  ];

  const getTagColor = (tag: string): string => {
    switch (tag.toLowerCase()) {
      case 'design': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400';
      case 'deployment': return 'bg-sky-100 text-sky-800 dark:bg-sky-950/30 dark:text-sky-400';
      case 'scope': return 'bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-400';
      case 'development': return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400';
      case 'testing': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-400';
      case 'analysis': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400';
      default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getAvatarColor = (name: string): string => {
    switch (name) {
      case 'JO': return 'bg-amber-600 text-white';
      case 'AM': return 'bg-rose-600 text-white';
      case 'JI': return 'bg-emerald-600 text-white';
      default: return 'bg-indigo-600 text-white';
    }
  };

  const handleOpenAddModal = (colKey: string) => {
    setTargetColumn(colKey);
    setNewTitle('');
    setNewDuration('');
    setNewDueDate('');
    setIsAddModalOpen(true);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `${targetColumn}-${Date.now()}`,
      tags: [newTag],
      title: newTitle,
      duration: newDuration ? `${newDuration} days` : '0 days',
      dueDate: newDueDate || 'TBD',
      avatars: newOwner ? [newOwner] : []
    };

    setTasks(prev => ({
      ...prev,
      [targetColumn]: [...prev[targetColumn], newTask]
    }));

    setIsAddModalOpen(false);
  };

  const moveTask = (task: Task, fromCol: string, toCol: string) => {
    setTasks(prev => {
      const sourceList = prev[fromCol].filter(t => t.id !== task.id);
      const targetList = [...prev[toCol], task];
      return {
        ...prev,
        [fromCol]: sourceList,
        [toCol]: targetList
      };
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-zinc-800 dark:text-white">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block">RATIONALISATION MANAGEMENT BOARD</span>
          <h2 className="text-xl font-display leading-tight text-acies-gray dark:text-white font-bold mt-1">Rationalisation Tracker</h2>
          <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold mt-0.5">Track cross-functional rollout steps and integration milestones</p>
        </div>
      </div>

      {/* Department KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {columns.map((col) => {
          const activeCount = tasks[col.key]?.length || 0;
          const completedCount = col.key === 'it' ? completedItTasks.length : 0;
          const isExpanded = expandedDepartment === col.key;
          const hasNewTasks = tasks[col.key]?.some(t => t.isNew);
          
          let cardStyle = 'bg-white dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-indigo-500/20 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]';
          if (hasNewTasks) {
            cardStyle = 'border-red-500 bg-red-500/[0.03] dark:bg-red-500/[0.08] shadow-md shadow-red-500/5 animate-pulse';
          } else if (isExpanded) {
            cardStyle = 'border-indigo-500 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] shadow-md shadow-indigo-500/5';
          }
          
          return (
            <button
              key={col.key}
              type="button"
              onClick={() => {
                if (isExpanded) {
                  setExpandedDepartment(null);
                } else {
                  setExpandedDepartment(col.key);
                  // Mark tasks in this department as read
                  if (hasNewTasks && setTasks) {
                    setTasks(prev => {
                      const updated = { ...prev };
                      if (updated[col.key]) {
                        updated[col.key] = updated[col.key].map(t => t.isNew ? { ...t, isNew: false } : t);
                      }
                      return updated;
                    });
                  }
                }
              }}
              className={`glass-card p-5 rounded-xl border text-left flex flex-col justify-between h-[148px] transition-all duration-200 cursor-pointer w-full group relative overflow-hidden ${cardStyle}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-black tracking-widest uppercase ${hasNewTasks ? 'text-red-500 dark:text-red-400 font-bold' : 'text-zinc-400 dark:text-zinc-500'}`}>{col.label}</span>
                <span className={`px-2.5 py-1 rounded text-[8.5px] font-extrabold uppercase ${
                  hasNewTasks 
                    ? 'bg-red-600 text-white dark:bg-red-900 dark:text-red-100 border-none' 
                    : col.themeClass.split(' ')[0] + ' ' + col.themeClass.split(' ')[1]
                }`}>
                  {hasNewTasks ? 'NEW' : 'DEPT'}
                </span>
              </div>
              <div className="my-1">
                <h4 className="text-4xl font-display font-black text-zinc-850 dark:text-zinc-100 leading-none">
                  {activeCount}
                </h4>
                <p className="text-[9.5px] font-bold text-zinc-400 dark:text-zinc-500 mt-2 uppercase tracking-wider">
                  Active Tasks {completedCount > 0 && `· ${completedCount} Completed`}
                </p>
              </div>
              <div className={`pt-2.5 border-t flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider w-full ${
                hasNewTasks 
                  ? 'border-red-500/20 text-red-600 dark:text-red-450' 
                  : 'border-black/5 dark:border-white/5 text-indigo-600 dark:text-indigo-400'
              }`}>
                <span>{hasNewTasks ? 'New tasks - click to read' : isExpanded ? 'Click to collapse' : 'Click to expand'}</span>
                <ChevronDown size={10} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Department Tasks List */}
      {expandedDepartment && (() => {
        const col = columns.find(c => c.key === expandedDepartment);
        if (!col) return null;
        const colTasks = tasks[col.key] || [];
        const idx = columns.findIndex(c => c.key === col.key);
        
        return (
          <div className="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl flex flex-col gap-5 animate-slideIn">
            
            {/* Expanded Section Header */}
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
              <div className="text-left">
                <span className="text-[9px] text-indigo-500 uppercase tracking-widest font-black block">Active workstream</span>
                <h3 className="text-sm font-display font-extrabold text-zinc-900 dark:text-white leading-tight uppercase mt-0.5">
                  {col.label} DEPARTMENT TASK BOARD
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddModal(col.key)}
                className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9.5px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-sm transition-all duration-150 active:scale-95 shrink-0"
              >
                <Plus size={12} className="stroke-[2.5]" />
                <span>Add task</span>
              </button>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {colTasks.map(task => (
                <div key={task.id} className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800/85 p-4 rounded-xl shadow-sm relative flex flex-col gap-3 group text-left hover:border-indigo-500/30 dark:hover:border-indigo-500/40 transition-all hover:shadow-md">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 items-center">
                    {task.tags.map(t => (
                      <span key={t} className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${getTagColor(t)}`}>
                        {t}
                      </span>
                    ))}
                    {task.isNew && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="New Task" />
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-150 leading-snug pr-8">
                    {task.title}
                  </h4>

                  {/* Metadata (Duration / Progress) */}
                  <div className="flex items-baseline gap-1.5 text-[9px] text-zinc-400 dark:text-zinc-500 font-bold">
                    <span>{task.createdAt ? getElapsedTime(task.createdAt) : task.duration}</span>
                    {task.progress && (
                      <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 px-1 rounded">
                        {task.progress}
                      </span>
                    )}
                  </div>

                  {/* Footer Row (Due date & Avatars) */}
                  <div className="flex justify-between items-center border-t border-black/5 dark:border-white/5 pt-3 mt-1">
                    {/* Left: Alerts & Date */}
                    <div className="flex items-center gap-1.5 text-[8.5px] font-semibold text-zinc-450 dark:text-zinc-500">
                      {task.alertType === 'red-alarm' && <Bell size={10} className="text-red-500 fill-red-500/20 animate-bounce" />}
                      {task.alertType === 'exclamation' && <AlertCircle size={10} className="text-red-500" />}
                      <Calendar size={10} />
                      <span className="font-mono">{task.dueDate}</span>
                      {task.comments !== undefined && (
                        <div className="flex items-center gap-0.5 ml-1">
                          <MessageSquare size={10} />
                          <span>{task.comments}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Avatars */}
                    <div className="flex -space-x-1.5">
                      {task.avatars.map(av => (
                        <div 
                          key={av} 
                          className={`w-4.5 h-4.5 rounded-full border border-white dark:border-zinc-900 flex items-center justify-center text-[7.5px] font-black font-sans shrink-0 shadow-xs ${getAvatarColor(av)}`}
                          title={`Owner: ${av}`}
                        >
                          {av}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column Quick Navigation Triggers */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    {idx > 0 && (
                      <button 
                        type="button"
                        onClick={() => moveTask(task, col.key, columns[idx - 1].key)}
                        className="p-1 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded border-none cursor-pointer text-zinc-500 dark:text-zinc-300 flex items-center justify-center"
                        title={`Move to ${columns[idx - 1].label}`}
                      >
                        <MoveLeft size={10} />
                      </button>
                    )}
                    {idx < columns.length - 1 && (
                      <button 
                        type="button"
                        onClick={() => moveTask(task, col.key, columns[idx + 1].key)}
                        className="p-1 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded border-none cursor-pointer text-zinc-500 dark:text-zinc-300 flex items-center justify-center"
                        title={`Move to ${columns[idx + 1].label}`}
                      >
                        <MoveRight size={10} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className="col-span-full py-10 border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl text-center text-zinc-455 dark:text-zinc-500 font-bold uppercase tracking-widest text-[9.5px]">
                  No active tasks in this workstream
                </div>
              )}
            </div>

            {/* Completed Section for IT column */}
            {col.key === 'it' && (
              <div className="mt-2 border-t border-black/5 dark:border-white/5 pt-5">
                <button 
                  type="button"
                  onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                  className="w-full flex justify-between items-center p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-[#6b21a8] dark:text-purple-300 text-[9.5px] font-black uppercase tracking-wider cursor-pointer border-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Completed Tasks</span>
                    <span className="bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full font-bold">{completedItTasks.length}</span>
                  </div>
                  {isCompletedExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {isCompletedExpanded && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {completedItTasks.map(task => (
                      <div key={task.id} className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800/80 p-4 rounded-xl shadow-sm relative flex flex-col gap-3 group text-left opacity-80">
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map(t => (
                            <span key={t} className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${getTagColor(t)}`}>
                              {t}
                            </span>
                          ))}
                        </div>
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-150 leading-snug line-through decoration-zinc-400 decoration-1">
                          {task.title}
                        </h4>
                        <div className="flex items-baseline gap-1.5 text-[9px] text-zinc-400 dark:text-zinc-500 font-bold">
                          <span>{task.duration}</span>
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 rounded uppercase text-[7px] font-black tracking-wider">
                            100%
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-black/5 dark:border-white/5 pt-3 mt-1">
                          <div className="flex items-center gap-1.5 text-[8.5px] font-semibold text-zinc-450 dark:text-zinc-500">
                            <Bell size={10} className="text-emerald-500" />
                            <Calendar size={10} />
                            <span className="font-mono">{task.dueDate}</span>
                          </div>
                          <div className="flex -space-x-1.5">
                            {task.avatars.map(av => (
                              <div 
                                key={av} 
                                className={`w-4.5 h-4.5 rounded-full border border-white dark:border-zinc-900 flex items-center justify-center text-[7.5px] font-black font-sans shrink-0 shadow-xs ${getAvatarColor(av)}`}
                              >
                                {av}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        );
      })()}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <form 
            onSubmit={handleAddTask} 
            className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-sm max-w-sm w-full overflow-hidden shadow-2xl relative flex flex-col animate-slideIn p-5 text-left text-zinc-800 dark:text-zinc-200"
          >
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2.5 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">
                Add Task to {columns.find(c => c.key === targetColumn)?.label}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[8.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Task Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Enter detailed task summary..." 
                  className="w-full bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 p-1.5 text-[10px] font-semibold rounded-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-acies-yellow" 
                  required
                />
              </div>

              {/* Tag & Owner */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Workstream Tag</label>
                  <select 
                    value={newTag} 
                    onChange={e => setNewTag(e.target.value)}
                    className="w-full bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 p-1.5 text-[9.5px] font-bold rounded-sm text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="Design">Design</option>
                    <option value="Deployment">Deployment</option>
                    <option value="Scope">Scope</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Analysis">Analysis</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Owner</label>
                  <select 
                    value={newOwner} 
                    onChange={e => setNewOwner(e.target.value)}
                    className="w-full bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 p-1.5 text-[9.5px] font-bold rounded-sm text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="JO">JO (PMO)</option>
                    <option value="AM">AM (IT)</option>
                    <option value="JI">JI (Ops)</option>
                  </select>
                </div>
              </div>

              {/* Duration & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Duration (Days)</label>
                  <input 
                    type="number" 
                    value={newDuration} 
                    onChange={e => setNewDuration(e.target.value)}
                    placeholder="e.g. 5" 
                    className="w-full bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 p-1.5 text-[10px] font-semibold rounded-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-acies-yellow" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8.5px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Due Date</label>
                  <input 
                    type="text" 
                    value={newDueDate} 
                    onChange={e => setNewDueDate(e.target.value)}
                    placeholder="e.g. 06/30/2025" 
                    className="w-full bg-white dark:bg-acies-gray border border-black/10 dark:border-white/10 p-1.5 text-[10px] font-semibold rounded-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-acies-yellow" 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 border-t border-black/5 dark:border-white/5 pt-3">
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-650 dark:text-zinc-400 rounded text-[9px] font-bold uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer border-none shadow-xs"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
