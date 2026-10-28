import React, { useState } from 'react';
import { Task, UserRole, TaskStatus } from '../types';
import { StorageService } from '../services/storage';
import { 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, RotateCcw, 
  Sparkles, CheckSquare, ChevronRight, AlertCircle, 
  HelpCircle, CalendarDays, Zap, Shield, Flame, ChevronLeft, Info
} from 'lucide-react';
import { 
  formatRussianDate, formatShortDate, getWeekdayName, 
  getDayNumber, getAtyrauDateString, CAMPAIGN_START_DATE 
} from '../utils/dateUtils';

interface TodayViewProps {
  tasks: Task[];
  onTasksUpdated: (updated: Task[]) => void;
  selectedRoleFilter: 'all' | 'founder' | 'operations';
  onNavigate: (tab: string) => void;
  founderDailyLimit: number;
  operationsDailyLimit: number;
  onOpenTaskModal: (task: Task) => void;
  currentDateStr: string;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  onTasksUpdated,
  selectedRoleFilter,
  onNavigate,
  founderDailyLimit,
  operationsDailyLimit,
  onOpenTaskModal,
  currentDateStr
}) => {
  // Selected date defaults to current date in Asia/Atyrau
  const [selectedDate, setSelectedDate] = useState<string>(currentDateStr || getAtyrauDateString());
  const [showOverdueView, setShowOverdueView] = useState(false);
  const [helpFeedback, setHelpFeedback] = useState<string | null>(null);

  const dayNumber = getDayNumber(selectedDate, CAMPAIGN_START_DATE);
  const weekday = getWeekdayName(selectedDate);

  // Navigate dates
  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00Z');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00Z');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleResetToday = () => {
    setSelectedDate(currentDateStr || getAtyrauDateString());
  };

  // Filter tasks for today's selected date
  const todaysTasks = tasks.filter(t => t.scheduledDate === selectedDate);
  
  // Overdue tasks (scheduled before selected date and not done/skipped)
  const overdueTasks = tasks.filter(t => t.scheduledDate < selectedDate && t.status !== 'done' && t.status !== 'skipped');

  // Split by role
  const founderTasks = todaysTasks.filter(t => t.ownerRole === 'founder');
  const opsTasks = todaysTasks.filter(t => t.ownerRole === 'operations');

  // Filtered by active role view
  const visibleTasks = selectedRoleFilter === 'founder'
    ? founderTasks
    : selectedRoleFilter === 'operations'
    ? opsTasks
    : todaysTasks;

  // Calculate workloads
  const founderMinutesPlanned = founderTasks.reduce((acc, t) => acc + (t.status !== 'skipped' ? t.estimateMinutes : 0), 0);
  const founderMinutesDone = founderTasks.filter(t => t.status === 'done').reduce((acc, t) => acc + t.estimateMinutes, 0);
  const opsMinutesPlanned = opsTasks.reduce((acc, t) => acc + (t.status !== 'skipped' ? t.estimateMinutes : 0), 0);
  const opsMinutesDone = opsTasks.filter(t => t.status === 'done').reduce((acc, t) => acc + t.estimateMinutes, 0);

  const doneCount = visibleTasks.filter(t => t.status === 'done').length;
  const totalCount = visibleTasks.length;

  // "Что делать прямо сейчас?": find highest priority unfinished task
  const urgentTask = visibleTasks.find(t => t.status === 'todo' && t.priority === 'P0') ||
                     visibleTasks.find(t => t.status === 'todo' && t.priority === 'P1') ||
                     visibleTasks.find(t => t.status === 'todo');

  const handleQuickStatusChange = (e: React.MouseEvent, task: Task, newStatus: TaskStatus) => {
    e.stopPropagation();
    const updated = StorageService.updateTask(task.id, { status: newStatus });
    onTasksUpdated(updated);
  };

  const handleAskHelp = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const timestampStr = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const updated = StorageService.updateTask(task.id, {
      notes: (task.notes ? task.notes + '\n' : '') + `[${timestampStr}] Запрос поддержки: требуется подключение партнёра.`
    });
    onTasksUpdated(updated);
    setHelpFeedback(`Заметка о помощи по задаче «${task.title}» сохранена в карточке. (Push-уведомление требует настройки общего сервера)`);
    setTimeout(() => setHelpFeedback(null), 5000);
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Top Header Card: Greeting & Date in Asia/Atyrau */}
      <div className="rounded-2xl bg-gradient-to-br from-[#111a2b] via-[#142138] to-[#0c1322] border border-slate-700/80 p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Часовой пояс: Asia/Atyrau (UTC+05)</span>
              <span>•</span>
              <span className="text-slate-300">День {dayNumber} из 90</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              {weekday}, {formatRussianDate(selectedDate)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Ежедневный фокус для двоих: только конкретные измеримые шаги.
            </p>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 self-start sm:self-auto">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300"
              title="Предыдущий день"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 text-xs text-white rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleNextDay}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300"
              title="Следующий день"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {selectedDate !== currentDateStr && (
              <button 
                onClick={handleResetToday}
                className="text-[11px] text-blue-400 hover:underline px-1.5 font-bold"
              >
                Сегодня
              </button>
            )}
          </div>
        </div>

        {/* Load Meters & Balance for Founder & Operations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
          
          {/* Founder Load */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Основатель (Founder): {founderMinutesPlanned} мин
              </span>
              <span className="text-slate-400">Лимит: {founderDailyLimit} мин</span>
            </div>
            <div className="w-full bg-slate-700/50 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${founderMinutesPlanned > founderDailyLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, (founderMinutesPlanned / founderDailyLimit) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Выполнено: {founderMinutesDone} мин</span>
              <span>{founderTasks.filter(t => t.status === 'done').length}/{founderTasks.length} задач</span>
            </div>
          </div>

          {/* Operations Load (Spouse) */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Супруга (Operations): {opsMinutesPlanned} мин
              </span>
              <span className="text-slate-400">Лимит: {operationsDailyLimit} мин</span>
            </div>
            <div className="w-full bg-slate-700/50 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${opsMinutesPlanned > operationsDailyLimit ? 'bg-amber-500' : 'bg-purple-500'}`}
                style={{ width: `${Math.min(100, (opsMinutesPlanned / operationsDailyLimit) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Выполнено: {opsMinutesDone} мин</span>
              <span>{opsTasks.filter(t => t.status === 'done').length}/{opsTasks.length} задач</span>
            </div>
          </div>
        </div>
      </div>

      {/* Help Notification Feedback */}
      {helpFeedback && (
        <div className="p-3 bg-blue-950/80 border border-blue-500/60 rounded-xl text-blue-200 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>{helpFeedback}</span>
        </div>
      )}

      {/* Overdue Switcher Banner if overdue tasks exist */}
      {overdueTasks.length > 0 && (
        <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Есть <strong>{overdueTasks.length}</strong> задач с наступившим сроком, требующих пересмотра или переноса.
            </span>
          </div>
          <button
            onClick={() => setShowOverdueView(!showOverdueView)}
            className="px-2.5 py-1 rounded-lg font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
          >
            {showOverdueView ? 'Скрыть просроченные' : 'Показать просроченные'}
          </button>
        </div>
      )}

      {/* Overdue Tasks List */}
      {showOverdueView && overdueTasks.length > 0 && (
        <div className="p-4 bg-slate-900 border border-amber-500/50 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Задачи, требующие актуализации срока ({overdueTasks.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Нажмите, чтобы перенести или закрыть</span>
          </div>
          <div className="space-y-2">
            {overdueTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onOpenTaskModal(task)}
                className="p-3 bg-slate-800/90 border border-slate-700 hover:border-amber-500/60 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                    <span className="text-amber-400 font-semibold">Срок: {formatShortDate(task.scheduledDate)}</span>
                    <span>•</span>
                    <span className={task.ownerRole === 'founder' ? 'text-blue-300' : 'text-purple-300'}>
                      {task.ownerRole === 'founder' ? 'Основатель' : 'Супруга'}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{task.title}</h4>
                </div>
                <button className="px-3 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg">
                  Открыть
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* "Что делать прямо сейчас" Action Card */}
      {urgentTask && (
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/50 border border-blue-500/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-blue-400" />
              Рекомендуемый фокус прямо сейчас
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ~{urgentTask.estimateMinutes} минут
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
            {urgentTask.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-3">
            {urgentTask.guide?.firstAction || urgentTask.guide?.why || urgentTask.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Исполнитель: <span className="font-semibold text-slate-200">{urgentTask.ownerRole === 'founder' ? 'Основатель' : 'Супруга'}</span>
            </div>
            <button
              onClick={() => onOpenTaskModal(urgentTask)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors shadow-md shadow-blue-900/30"
            >
              <span>Открыть инструкцию и шаги</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tasks List for the Day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Задачи на день ({doneCount}/{totalCount})</span>
          </h2>
          <div className="text-xs text-slate-400">
            {doneCount === totalCount && totalCount > 0 ? '✓ Все задачи дня закрыты' : 'Кликните на задачу для подробной инструкции'}
          </div>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">На этот день нет запланированных задач</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Возможно, это выходной день или задачи назначены на другие даты. Вы можете просмотреть общий 90-дневный план в разделе «Проекты».
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visibleTasks.map(task => {
              const checklist = task.guidedChecklist || task.checklist;
              const stepDone = checklist ? checklist.filter(c => c.done).length : 0;
              const stepTotal = checklist ? checklist.length : 0;

              return (
                <div
                  key={task.id}
                  onClick={() => onOpenTaskModal(task)}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.status === 'done'
                      ? 'bg-emerald-950/15 border-emerald-500/30 text-slate-300'
                      : task.status === 'waiting_external'
                      ? 'bg-amber-950/20 border-amber-500/30 text-white'
                      : task.status === 'blocked'
                      ? 'bg-rose-950/20 border-rose-500/30 text-white'
                      : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 text-white'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        task.ownerRole === 'founder'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {task.ownerRole === 'founder' ? 'Основатель' : 'Супруга'}
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {task.workstream || 'Проект'}
                      </span>

                      <span className="text-[11px] text-slate-400">
                        · {task.estimateMinutes} мин
                      </span>

                      {stepTotal > 0 && (
                        <span className="text-[11px] font-semibold text-slate-300">
                          · {stepDone}/{stepTotal} шагов
                        </span>
                      )}

                      {task.status === 'done' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          ✓ Выполнено
                        </span>
                      )}
                      {task.status === 'waiting_external' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          ⏳ Ждём ответ
                        </span>
                      )}
                      {task.status === 'blocked' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                          ✕ Блокер
                        </span>
                      )}
                    </div>

                    <h3 className={`text-sm sm:text-base font-bold leading-snug ${
                      task.status === 'done' ? 'line-through text-slate-400' : 'text-white'
                    }`}>
                      {task.title}
                    </h3>

                    {task.guide?.firstAction && task.status !== 'done' && (
                      <div className="text-xs text-slate-300 mt-1 line-clamp-1">
                        <span className="text-blue-400 font-semibold mr-1">Первое действие:</span>
                        {task.guide.firstAction}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleAskHelp(e, task)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Зафиксировать заметку о запросе помощи"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                    </button>

                    <button
                      onClick={() => onOpenTaskModal(task)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1"
                    >
                      <span>Инструкция</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
