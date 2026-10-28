import React, { useState } from 'react';
import { 
  Megaphone, Building2, Landmark, Handshake, Users, Award, 
  UserCheck, ShieldCheck, Cpu, Wallet, MapPin, CalendarCheck,
  ChevronRight, AlertCircle, Clock, CheckCircle2, ArrowUpRight,
  TrendingUp, Info, Filter, Sparkles
} from 'lucide-react';
import { Task, Deal, ExpenseItem, StrategicProject } from '../types';
import { STRATEGIC_PROJECTS } from '../data/strategicProjects';
import { formatRussianDate, formatShortDate, getDayNumber } from '../utils/dateUtils';

interface GlobalDashboardViewProps {
  tasks: Task[];
  deals: Deal[];
  expenses: ExpenseItem[];
  currentDateStr: string;
  startDateStr: string;
  endDateStr: string;
  onOpenTaskModal: (task: Task) => void;
  onNavigateToTab: (tabId: string, filterParams?: any) => void;
  onUpdatePeriod?: (start: string, end: string) => void;
}

export const GlobalDashboardView: React.FC<GlobalDashboardViewProps> = ({
  tasks,
  deals,
  expenses,
  currentDateStr,
  startDateStr,
  endDateStr,
  onOpenTaskModal,
  onNavigateToTab,
  onUpdatePeriod
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showPeriodEditor, setShowPeriodEditor] = useState(false);
  const [tempStart, setTempStart] = useState(startDateStr);
  const [tempEnd, setTempEnd] = useState(endDateStr);

  const dayNumber = getDayNumber(currentDateStr, startDateStr);

  // 1. Calculate Plan Completion (Steps & Tasks)
  let totalRequiredSteps = 0;
  let completedRequiredSteps = 0;
  let totalTasksCount = tasks.length;
  let doneTasksCount = tasks.filter(t => t.status === 'done').length;

  tasks.forEach(t => {
    const list = t.guidedChecklist && t.guidedChecklist.length > 0 
      ? t.guidedChecklist 
      : t.checklist;
    if (list && list.length > 0) {
      totalRequiredSteps += list.length;
      completedRequiredSteps += list.filter(c => c.done).length;
    } else {
      totalRequiredSteps += 1;
      if (t.status === 'done') completedRequiredSteps += 1;
    }
  });

  const planProgressPct = totalRequiredSteps > 0 
    ? Math.round((completedRequiredSteps / totalRequiredSteps) * 100) 
    : 0;

  // Tone color for Big Ring
  const getProgressTone = (pct: number) => {
    if (pct >= 100) return '#31c9a6'; // green
    if (pct >= 80) return '#31c9a6'; // teal
    if (pct >= 50) return '#9c84ff'; // purple
    if (pct >= 20) return '#f6c365'; // amber
    return '#fa7b8d'; // coral / red
  };

  const globalRingTone = getProgressTone(planProgressPct);

  // 2. Commercial Result (Confirmed Real CRM only - isDemo: false)
  const realDeals = deals.filter(d => !d.isDemo);
  const paidDeals = realDeals.filter(d => d.stage === 'paid' || d.stage === 'activated' || d.stage === 'renewed');
  const totalRevenueKZT = paidDeals.reduce((sum, d) => sum + (d.monthlyRevenueKZT || d.amountKZT || 0), 0);
  const completedDemos = realDeals.filter(d => d.stage === 'demo_completed' || d.stage === 'trial' || d.stage === 'paid').length;

  // 3. Scaling Readiness Gates (5 Milestone Gates)
  // G1: Product WhatsApp demo stable
  const productDone = tasks.filter(t => (t.projectId === 'product' || t.projectId === 'product_quality') && t.status === 'done').length;
  const productTotal = tasks.filter(t => t.projectId === 'product' || t.projectId === 'product_quality').length || 1;
  const g1 = Math.round((productDone / productTotal) * 100);

  // G2: Legal & Privacy localization in KZ
  const legalDone = tasks.filter(t => (t.projectId === 'contracts' || t.projectId === 'legal' || t.projectId === 'privacy') && t.status === 'done').length;
  const legalTotal = tasks.filter(t => t.projectId === 'contracts' || t.projectId === 'legal' || t.projectId === 'privacy').length || 1;
  const g2 = Math.round((legalDone / legalTotal) * 100);

  // G3: Payments / Kaspi Pay verified
  const paymentsDone = tasks.filter(t => (t.projectId === 'payments' || t.projectId === 'finance') && t.status === 'done').length;
  const paymentsTotal = tasks.filter(t => t.projectId === 'payments' || t.projectId === 'finance').length || 1;
  const g3 = Math.round((paymentsDone / paymentsTotal) * 100);

  // G4: First Clients in Atyrau (target 5 paid clients)
  const g4 = Math.min(100, Math.round((paidDeals.length / 5) * 100));

  // G5: Playbooks & Ops handoff
  const opsDone = tasks.filter(t => t.ownerRole === 'operations' && t.status === 'done').length;
  const opsTotal = tasks.filter(t => t.ownerRole === 'operations').length || 1;
  const g5 = Math.round((opsDone / opsTotal) * 100);

  const scalingScore = Math.round((g1 + g2 + g3 + g4 + g5) / 5);

  // Project Progress and Status mapping
  const getProjectStats = (project: StrategicProject) => {
    const projTasks = tasks.filter(t => project.projectIds.includes(t.projectId));
    let pSteps = 0;
    let pDoneSteps = 0;
    let hasBlocked = false;
    let hasWaiting = false;

    projTasks.forEach(t => {
      if (t.status === 'blocked') hasBlocked = true;
      if (t.status === 'waiting_external') hasWaiting = true;

      const list = t.guidedChecklist && t.guidedChecklist.length > 0 ? t.guidedChecklist : t.checklist;
      if (list && list.length > 0) {
        pSteps += list.length;
        pDoneSteps += list.filter(c => c.done).length;
      } else {
        pSteps += 1;
        if (t.status === 'done') pDoneSteps += 1;
      }
    });

    const pct = pSteps > 0 ? Math.round((pDoneSteps / pSteps) * 100) : 0;

    let statusLabel = 'Не начато';
    let statusTone = '#8590a3';
    let statusClass = 'bg-slate-700/60 text-slate-300';

    if (hasBlocked) {
      statusLabel = 'Блокер';
      statusTone = '#fa7b8d';
      statusClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    } else if (pct === 100) {
      statusLabel = 'Готово';
      statusTone = '#31c9a6';
      statusClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    } else if (hasWaiting) {
      statusLabel = 'Ждём ответ';
      statusTone = '#f6c365';
      statusClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    } else if (pct >= 50) {
      statusLabel = 'В работе';
      statusTone = '#9c84ff';
      statusClass = 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    } else if (pct > 0) {
      statusLabel = 'Подготовка';
      statusTone = '#508dff';
      statusClass = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    }

    return { pct, pSteps, pDoneSteps, taskCount: projTasks.length, statusLabel, statusTone, statusClass, tasks: projTasks };
  };

  // Top 3 priority tasks for today
  const todayTasks = tasks.filter(t => t.scheduledDate === currentDateStr && t.status !== 'done');
  const founderPriorities = todayTasks.filter(t => t.ownerRole === 'founder').slice(0, 2);
  const opsPriorities = todayTasks.filter(t => t.ownerRole === 'operations').slice(0, 1);
  const topPriorities = [...founderPriorities, ...opsPriorities];

  // Tasks waiting on external response
  const waitingTasks = tasks.filter(t => t.status === 'waiting_external');

  // Workload balance today
  const founderMinutesToday = todayTasks.filter(t => t.ownerRole === 'founder').reduce((s, t) => s + (t.estimateMinutes || 0), 0);
  const opsMinutesToday = todayTasks.filter(t => t.ownerRole === 'operations').reduce((s, t) => s + (t.estimateMinutes || 0), 0);

  // Icon mapping
  const renderProjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Megaphone': return <Megaphone className="w-4 h-4" />;
      case 'Building2': return <Building2 className="w-4 h-4" />;
      case 'Landmark': return <Landmark className="w-4 h-4" />;
      case 'Handshake': return <Handshake className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'UserCheck': return <UserCheck className="w-4 h-4" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Wallet': return <Wallet className="w-4 h-4" />;
      case 'MapPin': return <MapPin className="w-4 h-4" />;
      default: return <CalendarCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Strategic Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-[#111a2b] via-[#142138] to-[#0c1322] border border-slate-700/80 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Growth OS <span className="text-blue-400">Kazakhstan</span>
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Атырау → KZ
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Личный операционный штаб управления B2B SaaS
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowPeriodEditor(!showPeriodEditor)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{formatShortDate(startDateStr)} — {formatShortDate(endDateStr)}</span>
              <span className="text-[10px] text-blue-400 font-bold ml-1">(День {dayNumber}/90)</span>
            </button>
          </div>
        </div>

        {/* Strategic Motto (honest non-hallucinated badge) */}
        <div className="p-2.5 bg-blue-950/40 border border-blue-500/30 rounded-xl text-blue-200 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>
            <strong>Стратегическая цель:</strong> лидерство в Казахстане. Это цель и фокус усилий, а не доказанный статус.
          </span>
        </div>

        {showPeriodEditor && (
          <div className="mt-3 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs space-y-2">
            <div className="font-bold text-white">Границы 90-дневного плана:</div>
            <div className="flex flex-wrap gap-2 items-center">
              <div>
                <span className="text-slate-400 mr-1">Старт:</span>
                <input 
                  type="date" 
                  value={tempStart} 
                  onChange={e => setTempStart(e.target.value)} 
                  className="p-1.5 bg-slate-800 border border-slate-700 rounded text-white" 
                />
              </div>
              <div>
                <span className="text-slate-400 mr-1">Финал:</span>
                <input 
                  type="date" 
                  value={tempEnd} 
                  onChange={e => setTempEnd(e.target.value)} 
                  className="p-1.5 bg-slate-800 border border-slate-700 rounded text-white" 
                />
              </div>
              <button
                onClick={() => {
                  if (onUpdatePeriod) onUpdatePeriod(tempStart, tempEnd);
                  setShowPeriodEditor(false);
                }}
                className="px-3 py-1.5 font-bold bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Применить
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Big Ring & 3 KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Big Circular Progress Ring */}
        <div className="lg:col-span-6 p-5 sm:p-6 bg-gradient-to-br from-[#121c2e] to-[#0e1625] border border-slate-700/80 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Глобальный план готовности
              </span>
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Легенда статусов</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              {/* Conic Gradient SVG Ring */}
              <div 
                className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full flex-shrink-0 grid place-items-center"
                style={{
                  background: `conic-gradient(${globalRingTone} ${planProgressPct * 3.6}deg, #263449 0deg)`
                }}
              >
                <div className="absolute inset-3 rounded-full bg-[#111a2c] flex flex-col items-center justify-center text-center p-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {planProgressPct}%
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    подготовки
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {completedRequiredSteps}/{totalRequiredSteps} шагов
                  </span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Подготовка к масштабированию
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Каждый отмеченный шаг в чек-листах 237 задач честно обновляет готовность. Ожидание внешнего ответа не считается выполнением.
                </p>
                <div className="text-xs text-slate-400 pt-1">
                  Задач полностью закрыто: <span className="font-bold text-white">{doneTasksCount}</span> из <span className="text-white">{totalTasksCount}</span>
                </div>
              </div>
            </div>

            {/* Collapsible Status Color Legend */}
            {showLegend && (
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs flex flex-wrap gap-2.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8590a3]" /> Не начато (0%)
                </span>
                <span className="flex items-center gap-1.5 text-blue-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#508dff]" /> Подготовка (1-49%)
                </span>
                <span className="flex items-center gap-1.5 text-purple-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9c84ff]" /> В работе (50-79%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f6c365]" /> Ждём ответ (внешний)
                </span>
                <span className="flex items-center gap-1.5 text-rose-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fa7b8d]" /> Блокер
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#31c9a6]" /> Готово (100% gate)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Three Independent Metrics */}
        <div className="lg:col-span-6 p-5 sm:p-6 bg-gradient-to-br from-[#121c2e] to-[#0e1625] border border-slate-700/80 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Три независимых показателя компании
              </h3>
              <span className="text-[11px] text-slate-400">Без вымышленных данных</span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Не путать операционную подготовку с коммерческими продажами. Каждое число берётся строго из своего проверяемого источника.
            </p>

            {/* 3 KPI Blocks */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {/* Metric 1 */}
              <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-1">1. План выполнен</span>
                <div className="text-lg sm:text-xl font-black text-blue-400">
                  {planProgressPct}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {completedRequiredSteps}/{totalRequiredSteps} шагов
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-1">2. Факт выручки</span>
                <div className="text-lg sm:text-xl font-black text-emerald-400">
                  {totalRevenueKZT > 0 ? `${totalRevenueKZT.toLocaleString('ru-RU')} ₸` : '0 ₸'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {paidDeals.length} оплат · {completedDemos} демо
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-1">3. Готовность</span>
                <div className="text-lg sm:text-xl font-black text-purple-400">
                  {scalingScore}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  5 стратегич. gates
                </div>
              </div>
            </div>

            {/* Team Roles Load Today */}
            <div className="p-3 bg-slate-900/50 border border-slate-700/60 rounded-xl space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Баланс нагрузки на сегодня:</span>
                <span className="text-[10px] text-slate-400">Лимит: Founder 90м · Ops 35м</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300 flex items-center gap-1">
                  <span>● Основатель:</span>
                  <span className="font-semibold text-white">{founderMinutesToday} мин</span>
                </span>
                <span className={`text-[11px] ${founderMinutesToday > 90 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                  {founderMinutesToday > 90 ? 'Перегруз!' : 'В норме'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300 flex items-center gap-1">
                  <span>● Супруга (Ops):</span>
                  <span className="font-semibold text-white">{opsMinutesToday} мин</span>
                </span>
                <span className={`text-[11px] ${opsMinutesToday > 35 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                  {opsMinutesToday > 35 ? 'Перегруз!' : 'В норме'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 12 Strategic Directions Rings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              12 стратегических направлений развития
            </h2>
            <p className="text-xs text-slate-400">
              Нажмите на круг направления, чтобы открыть его задачи и этапы
            </p>
          </div>
          {selectedProjectId && (
            <button
              onClick={() => setSelectedProjectId(null)}
              className="text-xs text-blue-400 hover:underline"
            >
              Сбросить фильтр
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {STRATEGIC_PROJECTS.map(project => {
            const stats = getProjectStats(project);
            const isSelected = selectedProjectId === project.id;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(isSelected ? null : project.id)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between group ${
                  isSelected
                    ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-[#111a2b] border-slate-700/80 hover:border-slate-600 hover:bg-[#152238]'
                }`}
              >
                {/* Medium Ring (86px) */}
                <div 
                  className="relative w-20 h-20 rounded-full my-1 grid place-items-center transition-transform group-hover:scale-105"
                  style={{
                    background: `conic-gradient(${stats.statusTone} ${stats.pct * 3.6}deg, #263449 0deg)`
                  }}
                >
                  <div className="absolute inset-2 rounded-full bg-[#111a2c] flex flex-col items-center justify-center">
                    <span className="text-base font-black text-white">
                      {stats.pct}%
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {stats.pDoneSteps}/{stats.pSteps}
                    </span>
                  </div>
                </div>

                <div className="mt-2 w-full">
                  <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-blue-300">
                    {project.shortName}
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${stats.statusClass}`}>
                      {stats.statusLabel}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Project Tasks if a Project Ring is selected */}
      {selectedProjectId && (
        <div className="p-4 sm:p-5 bg-slate-900/90 border border-blue-500/50 rounded-2xl space-y-3">
          {(() => {
            const activeProj = STRATEGIC_PROJECTS.find(p => p.id === selectedProjectId);
            if (!activeProj) return null;
            const stats = getProjectStats(activeProj);

            return (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {renderProjectIcon(activeProj.icon)}
                      <span>{activeProj.name}</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {activeProj.description}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('roadmap', { projectId: activeProj.projectIds[0] })}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"
                  >
                    <span>Все {stats.taskCount} задач</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 mt-3">
                  {stats.tasks.slice(0, 5).map(task => (
                    <div
                      key={task.id}
                      onClick={() => onOpenTaskModal(task)}
                      className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                          <span className={task.ownerRole === 'founder' ? 'text-blue-400 font-bold' : 'text-purple-400 font-bold'}>
                            {task.ownerRole === 'founder' ? 'Основатель' : 'Супруга'}
                          </span>
                          <span>•</span>
                          <span>День {task.dayNumber} ({formatShortDate(task.scheduledDate)})</span>
                          <span>•</span>
                          <span>{task.estimateMinutes} мин</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                          {task.title}
                        </h4>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTaskModal(task);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200"
                      >
                        Инструкция
                      </button>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Today Priority Section & Waiting External Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today Priorities */}
        <div className="p-4 sm:p-5 bg-slate-900/60 border border-slate-700/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Главные действия на сегодня ({formatRussianDate(currentDateStr)})</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('today')}
              className="text-xs text-blue-400 hover:underline"
            >
              Экран «Сегодня» →
            </button>
          </div>

          {topPriorities.length > 0 ? (
            <div className="space-y-2">
              {topPriorities.map(task => (
                <div
                  key={task.id}
                  onClick={() => onOpenTaskModal(task)}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-0.5">
                      <span className={task.ownerRole === 'founder' ? 'text-blue-400 font-bold' : 'text-purple-400 font-bold'}>
                        {task.ownerRole === 'founder' ? 'Основатель' : 'Супруга'}
                      </span>
                      <span>·</span>
                      <span>{task.estimateMinutes} мин</span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      {task.title}
                    </div>
                  </div>
                  <button className="px-2.5 py-1 text-xs font-semibold text-blue-300 bg-blue-500/10 rounded hover:bg-blue-500/20">
                    Открыть
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-800/40 rounded-xl">
              ✓ Все приоритетные задачи на сегодня выполнены или запланирован день отдыха.
            </div>
          )}
        </div>

        {/* Waiting on External Organizations */}
        <div className="p-4 sm:p-5 bg-slate-900/60 border border-slate-700/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Ожидают ответа организаций ({waitingTasks.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Внешняя зависимость</span>
          </div>

          {waitingTasks.length > 0 ? (
            <div className="space-y-2">
              {waitingTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  onClick={() => onOpenTaskModal(task)}
                  className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-amber-200 truncate">
                      {task.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {task.notes || 'Ожидается согласование письма / звонка'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300">
                    Ждём ответ
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-800/40 rounded-xl">
              Нет зависших внешних согласований. Все текущие задачи зависят только от вашей команды.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
