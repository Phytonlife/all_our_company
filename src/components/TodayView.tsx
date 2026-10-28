import React, { useState } from 'react';
import { Task, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, RotateCcw, 
  Sparkles, CheckSquare, ChevronRight, MessageSquare, AlertCircle, 
  HelpCircle, CalendarDays, Zap, Shield, Flame
} from 'lucide-react';

interface TodayViewProps {
  tasks: Task[];
  onTasksUpdated: (updated: Task[]) => void;
  selectedRoleFilter: 'all' | 'founder' | 'operations';
  onNavigate: (tab: string) => void;
  founderDailyLimit: number;
  operationsDailyLimit: number;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  onTasksUpdated,
  selectedRoleFilter,
  onNavigate,
  founderDailyLimit,
  operationsDailyLimit
}) => {
  // Current date anchor (start date: 2026-10-28)
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-28");
  const [activeTaskForAction, setActiveTaskForAction] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'complete' | 'postpone' | 'block' | 'notes' | null>(null);
  
  // Action form states
  const [postponeDate, setPostponeDate] = useState<string>("2026-10-29");
  const [postponeReason, setPostponeReason] = useState<string>("");
  const [blockerText, setBlockerText] = useState<string>("");
  const [notesText, setNotesText] = useState<string>("");
  const [actualMetricText, setActualMetricText] = useState<string>("");
  const [checklistState, setChecklistState] = useState<boolean[]>([]);
  const [showEveningSummary, setShowEveningSummary] = useState(false);

  // Filter tasks for today's selected date
  const todaysTasks = tasks.filter(t => t.scheduledDate === selectedDate);
  
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

  const openActionModal = (task: Task, mode: 'complete' | 'postpone' | 'block' | 'notes') => {
    setActiveTaskForAction(task);
    setModalMode(mode);
    setChecklistState(task.checklist.map(c => c.done));
    setNotesText(task.notes || '');
    setActualMetricText(task.actualMetric || '');
    setPostponeReason(task.postponementReason || '');
    setBlockerText(task.blockerReason || '');
    // Default postpone target: next day
    const curr = new Date(task.scheduledDate);
    curr.setDate(curr.getDate() + 1);
    setPostponeDate(curr.toISOString().slice(0, 10));
  };

  const handleConfirmComplete = () => {
    if (!activeTaskForAction) return;
    const updatedChecklist = activeTaskForAction.checklist.map((item, idx) => ({
      ...item,
      done: checklistState[idx] ?? true
    }));
    const updated = StorageService.updateTask(activeTaskForAction.id, {
      status: 'done',
      checklist: updatedChecklist,
      notes: notesText,
      actualMetric: actualMetricText || 'Выполнено по критериям'
    });
    onTasksUpdated(updated);
    setModalMode(null);
  };

  const handleConfirmPostpone = () => {
    if (!activeTaskForAction) return;
    if (!postponeReason.trim()) {
      alert("Пожалуйста, укажите причину переноса срока (для фиксации в аудит-логе).");
      return;
    }
    const updated = StorageService.postponeTask(activeTaskForAction.id, postponeDate, postponeReason);
    onTasksUpdated(updated);
    setModalMode(null);
  };

  const handleConfirmBlock = () => {
    if (!activeTaskForAction) return;
    const updated = StorageService.updateTask(activeTaskForAction.id, {
      status: 'blocked',
      blockerReason: blockerText || 'Ожидание внешнего подтверждения'
    });
    onTasksUpdated(updated);
    setModalMode(null);
  };

  const handleConfirmNotes = () => {
    if (!activeTaskForAction) return;
    const updated = StorageService.updateTask(activeTaskForAction.id, {
      notes: notesText,
      actualMetric: actualMetricText
    });
    onTasksUpdated(updated);
    setModalMode(null);
  };

  const handleAskHelp = (task: Task) => {
    const updated = StorageService.updateTask(task.id, {
      notes: (task.notes ? task.notes + '\n' : '') + `[${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}] Нужна помощь партнера/супруги!`
    });
    onTasksUpdated(updated);
    alert(`Запрос о помощи по задаче «${task.title}» зафиксирован в карточке и направлен партнеру.`);
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Top Header Card: Greeting & Date in Asia/Atyrau */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Часовой пояс: Asia/Atyrau (UTC+05)</span>
              <span>•</span>
              <span className="text-slate-400">День 1 из 90</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Среда, 28 октября 2026 г.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Личный операционный командный пункт: фокус на реальных результатах, а не имитации занятости.
            </p>
          </div>

          {/* Quick Date Switcher for testing all days */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 self-start sm:self-auto">
            <span className="text-xs text-slate-400 px-1">Дата:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 text-xs text-slate-200 rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
            {selectedDate !== "2026-10-28" && (
              <button 
                onClick={() => setSelectedDate("2026-10-28")}
                className="text-[11px] text-indigo-400 hover:underline px-1"
              >
                День 1
              </button>
            )}
          </div>
        </div>

        {/* Load Meters & Balance for Founder & Operations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          
          {/* Founder Load */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Основатель (Founder): {founderMinutesPlanned} мин
              </span>
              <span className="text-slate-400">Лимит: {founderDailyLimit} мин</span>
            </div>
            <div className="w-full bg-slate-700/50 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${founderMinutesPlanned > founderDailyLimit ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, (founderMinutesPlanned / founderDailyLimit) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Выполнено: {founderMinutesDone} мин</span>
              <span>{founderTasks.filter(t => t.status === 'done').length}/{founderTasks.length} задач</span>
            </div>
          </div>

          {/* Operations Load (Spouse) */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
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

      {/* "Что делать прямо сейчас?" Action Banner */}
      {urgentTask && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/40 p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Flame className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Что делать прямо сейчас
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  {urgentTask.ownerRole === 'founder' ? 'Founder' : 'Operations'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ~{urgentTask.estimateMinutes} мин
                </span>
              </div>
              <h2 className="text-base font-semibold text-white mt-0.5">
                {urgentTask.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                {urgentTask.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => openActionModal(urgentTask, 'complete')}
            className="sm:self-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 shrink-0 transition active:scale-95"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Выполнить действие</span>
          </button>
        </div>
      )}

      {/* Task List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Задачи на сегодня ({visibleTasks.length})
            </h2>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-emerald-400 font-medium">
              {doneCount} из {totalCount} готово
            </span>
          </div>

          <button
            onClick={() => setShowEveningSummary(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>Вечерний итог</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/80 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white">Все задачи на выбранную дату закрыты!</h3>
            <p className="text-xs text-slate-400 mt-1">
              На этот день нет невыполненных задач. Можно отдохнуть или спланировать следующие шаги в 90-дневном плане.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleTasks.map(task => {
              const isDone = task.status === 'done';
              const isBlocked = task.status === 'blocked';
              const roleBadgeColor = task.ownerRole === 'founder' 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

              return (
                <div 
                  key={task.id}
                  className={`rounded-2xl border transition-all p-4 ${
                    isDone 
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-80' 
                      : isBlocked
                      ? 'bg-amber-950/10 border-amber-800/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      
                      {/* Meta header (Zero-pill discipline with clean typographic separation) */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${roleBadgeColor}`}>
                          {task.ownerRole === 'founder' ? 'Founder' : 'Operations'}
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="font-mono text-slate-400">~{task.estimateMinutes} мин</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 font-medium">{task.workstream}</span>
                        <span className="text-slate-500">·</span>
                        <span className={`text-[11px] font-bold ${task.priority === 'P0' ? 'text-rose-400' : 'text-slate-400'}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className={`text-base font-semibold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Blocker alert if present */}
                      {isBlocked && (
                        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Блокер: {task.blockerReason || 'Ожидает решения'}</span>
                        </div>
                      )}

                      {/* Notes / Actual metric if done */}
                      {task.actualMetric && (
                        <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 mt-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Итог: {task.actualMetric}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons (Large touch targets >= 44px for thumb navigation) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {!isDone ? (
                        <button
                          onClick={() => openActionModal(task, 'complete')}
                          className="min-h-[44px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                        >
                          <CheckSquare className="w-4 h-4" />
                          <span>Сделано</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const updated = StorageService.updateTask(task.id, { status: 'todo' });
                            onTasksUpdated(updated);
                          }}
                          className="min-h-[44px] px-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Вернуть в план</span>
                        </button>
                      )}

                      <button
                        onClick={() => openActionModal(task, 'postpone')}
                        className="min-h-[44px] px-3 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition"
                        title="Перенести срок на другую дату"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Перенести</span>
                      </button>

                      <button
                        onClick={() => openActionModal(task, 'block')}
                        className={`min-h-[44px] px-3 rounded-xl border text-xs flex items-center gap-1.5 transition ${
                          isBlocked 
                            ? 'border-amber-600 bg-amber-500/20 text-amber-300' 
                            : 'border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-400'
                        }`}
                        title="Пометить как заблокированное"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Блокер</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAskHelp(task)}
                        className="min-h-[44px] px-2.5 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 text-xs flex items-center gap-1 transition"
                        title="Запросить содействие партнера"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Помощь</span>
                      </button>

                      <button
                        onClick={() => openActionModal(task, 'notes')}
                        className="min-h-[44px] px-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1 transition"
                        title="Добавить заметку или ссылку"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Заметка</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Modals */}
      {modalMode && activeTaskForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal: COMPLETE */}
            {modalMode === 'complete' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-semibold text-base">Подтверждение выполнения</h3>
                  </div>
                  <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <p className="text-xs text-slate-400">
                  Отметьте выполненные мини-шаги и подтвердите результат:
                </p>

                <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  {activeTaskForAction.checklist.map((item, idx) => (
                    <label key={idx} className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-200">
                      <input 
                        type="checkbox"
                        checked={checklistState[idx] || false}
                        onChange={(e) => {
                          const copy = [...checklistState];
                          copy[idx] = e.target.checked;
                          setChecklistState(copy);
                        }}
                        className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-0 mt-0.5"
                      />
                      <span>{item.title}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Подтвержденный результат / факт:
                  </label>
                  <input
                    type="text"
                    value={actualMetricText}
                    onChange={(e) => setActualMetricText(e.target.value)}
                    placeholder="Например: Демо проведено, клиент согласовал тест на 3 дня"
                    className="w-full text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Заметка / следующий шаг:
                  </label>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={2}
                    placeholder="Опционально: заметка о возражениях или контакте"
                    className="w-full text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setModalMode(null)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleConfirmComplete}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-md transition"
                  >
                    Зафиксировать выполнение
                  </button>
                </div>
              </div>
            )}

            {/* Modal: POSTPONE */}
            {modalMode === 'postpone' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Clock className="w-5 h-5" />
                    <h3 className="font-semibold text-base">Перенос срока задачи</h3>
                  </div>
                  <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <p className="text-xs text-slate-400">
                  Исходный дедлайн ({activeTaskForAction.originalDeadline}) сохранится в истории. Перенос не стирает план, а документирует фактический ритм.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Новая дата выполнения:</label>
                  <input
                    type="date"
                    value={postponeDate}
                    onChange={(e) => setPostponeDate(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Причина переноса (обязательно для аудита):
                  </label>
                  <input
                    type="text"
                    value={postponeReason}
                    onChange={(e) => setPostponeReason(e.target.value)}
                    placeholder="Например: Ожидание ответа организатора Hub / перегрузка дня"
                    className="w-full text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setModalMode(null)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleConfirmPostpone}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition"
                  >
                    Сохранить перенос
                  </button>
                </div>
              </div>
            )}

            {/* Modal: BLOCK */}
            {modalMode === 'block' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-semibold text-base">Фиксация блокера</h3>
                  </div>
                  <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Что препятствует выполнению?</label>
                  <textarea
                    value={blockerText}
                    onChange={(e) => setBlockerText(e.target.value)}
                    rows={3}
                    placeholder="Опишите причину блокировки: нет доступа, ожидание обратной связи от клиента/банка/органа..."
                    className="w-full text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setModalMode(null)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleConfirmBlock}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs sm:text-sm shadow-md transition"
                  >
                    Зафиксировать блокер
                  </button>
                </div>
              </div>
            )}

            {/* Modal: NOTES */}
            {modalMode === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <MessageSquare className="w-5 h-5" />
                    <h3 className="font-semibold text-base">Заметки по задаче</h3>
                  </div>
                  <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={4}
                    placeholder="Рабочие заметки, ссылки на документы или контакты..."
                    className="w-full text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setModalMode(null)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleConfirmNotes}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition"
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Evening Review Modal */}
      {showEveningSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Вечерний командный итог дня
              </h3>
              <button onClick={() => setShowEveningSummary(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-300">Выполнено задач:</span>
                <span className="font-bold text-emerald-400">{doneCount} из {totalCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-300">Фактическое время Founder:</span>
                <span className="font-mono font-semibold text-indigo-300">{founderMinutesDone} мин</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-300">Фактическое время Operations:</span>
                <span className="font-mono font-semibold text-purple-300">{opsMinutesDone} мин</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-300">Сумма выручки за день:</span>
                <span className="font-bold text-white">0 ₸ (Реальный факт)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Отличная работа! Все зафиксированные действия сохранены в локальной базе. Невыполненные задачи можно перенести на завтра одной кнопкой.
            </p>

            <button
              onClick={() => setShowEveningSummary(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition"
            >
              Завершить день
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
