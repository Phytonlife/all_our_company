import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { StorageService } from '../services/storage';
import { 
  Calendar, CheckCircle2, Clock, Filter, AlertTriangle, 
  RotateCcw, CheckSquare, Search, ChevronRight, Layers, LayoutList, 
  Columns3, CalendarDays, ArrowUpRight, Flame
} from 'lucide-react';

interface RoadmapViewProps {
  tasks: Task[];
  onTasksUpdated: (updated: Task[]) => void;
  selectedRoleFilter: 'all' | 'founder' | 'operations';
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  tasks,
  onTasksUpdated,
  selectedRoleFilter
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'growth' | 'operations' | 'engineering'>('all');
  
  // Postpone modal state
  const [activeTaskForPostpone, setActiveTaskForPostpone] = useState<Task | null>(null);
  const [newPostponeDate, setNewPostponeDate] = useState<string>('');
  const [postponeReason, setPostponeReason] = useState<string>('');

  // Filtering logic
  const filteredTasks = tasks.filter(task => {
    // Role filter
    if (selectedRoleFilter !== 'all' && task.ownerRole !== selectedRoleFilter) {
      return false;
    }
    // Week filter
    if (selectedWeek !== 'all' && task.weekNumber !== selectedWeek) {
      return false;
    }
    // Status filter
    if (statusFilter === 'todo' && task.status !== 'todo') return false;
    if (statusFilter === 'done' && task.status !== 'done') return false;
    if (statusFilter === 'blocked' && task.status !== 'blocked') return false;
    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'operations' && task.category !== 'operations' && task.projectId !== 'company_ops') return false;
      if (categoryFilter === 'engineering' && task.category !== 'engineering' && task.projectId !== 'product_eng') return false;
      if (categoryFilter === 'growth' && (task.category === 'operations' || task.category === 'engineering')) return false;
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(q) || 
             task.description.toLowerCase().includes(q) ||
             task.workstream.toLowerCase().includes(q);
    }
    return true;
  });

  const totalTasksCount = tasks.length;
  const doneTasksCount = tasks.filter(t => t.status === 'done').length;
  const completionPercent = Math.round((doneTasksCount / totalTasksCount) * 100);

  const handleToggleTaskStatus = (task: Task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    const updated = StorageService.updateTask(task.id, { status: nextStatus });
    onTasksUpdated(updated);
  };

  const handleOpenPostpone = (task: Task) => {
    setActiveTaskForPostpone(task);
    const curr = new Date(task.scheduledDate);
    curr.setDate(curr.getDate() + 1);
    setNewPostponeDate(curr.toISOString().slice(0, 10));
    setPostponeReason(task.postponementReason || '');
  };

  const handleConfirmPostpone = () => {
    if (!activeTaskForPostpone) return;
    if (!postponeReason.trim()) {
      alert("Укажите причину переноса для сохранения истории.");
      return;
    }
    const updated = StorageService.postponeTask(activeTaskForPostpone.id, newPostponeDate, postponeReason);
    onTasksUpdated(updated);
    setActiveTaskForPostpone(null);
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* 90-Day Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>90-дневный стратегический план • 28.10.2026 – 25.01.2027</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Дорожная карта масштабирования
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Всего 237 задач (188 базовых + 49 модулей Company Ops & Product Engineering). Без фальшивых 100%.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-extrabold text-white font-mono tabular-nums">
                {doneTasksCount} <span className="text-slate-500 font-normal text-sm">/ {totalTasksCount}</span>
              </div>
              <div className="text-xs text-indigo-400 font-medium">{completionPercent}% выполнено</div>
            </div>
          </div>
        </div>

        {/* Milestone Milestones Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">День 1–14</div>
            <div className="text-xs font-medium text-slate-200 mt-0.5 line-clamp-1">Запуск, демо, CRM и офферы</div>
            <div className="text-[11px] text-slate-400 mt-1">Недели 1–2</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">День 15–30</div>
            <div className="text-xs font-medium text-slate-200 mt-0.5 line-clamp-1">Первые платящие клиенты</div>
            <div className="text-[11px] text-slate-400 mt-1">Недели 3–5</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">День 31–60</div>
            <div className="text-xs font-medium text-slate-200 mt-0.5 line-clamp-1">Полевые агенты и B2B партнеры</div>
            <div className="text-[11px] text-slate-400 mt-1">Недели 5–9</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">День 61–90</div>
            <div className="text-xs font-medium text-slate-200 mt-0.5 line-clamp-1">Юнит-экономика и новые города</div>
            <div className="text-[11px] text-slate-400 mt-1">Недели 9–13</div>
          </div>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по задачам, темам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Badges & Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">Все направления</option>
            <option value="growth">Маркетинг & Продажи</option>
            <option value="operations">Company Operations (v2.2)</option>
            <option value="engineering">Product Engineering (v2.2)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">Все статусы</option>
            <option value="todo">К выполнению</option>
            <option value="done">Выполненные</option>
            <option value="blocked">Заблокированные</option>
          </select>

          {/* View Mode Switcher (List vs Kanban) */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Список / таймлайн"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition ${viewMode === 'kanban' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Канбан доска"
            >
              <Columns3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weeks Filter Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedWeek('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
            selectedWeek === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Все недели
        </button>
        {Array.from({ length: 13 }, (_, i) => i + 1).map(week => (
          <button
            key={week}
            onClick={() => setSelectedWeek(week)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              selectedWeek === week
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Неделя {week}
          </button>
        ))}
      </div>

      {/* Task Content: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs">
              Задач с выбранными фильтрами не найдено.
            </div>
          ) : (
            filteredTasks.map(task => {
              const isDone = task.status === 'done';
              const isBlocked = task.status === 'blocked';
              const roleBadgeColor = task.ownerRole === 'founder' 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

              return (
                <div 
                  key={task.id}
                  className={`rounded-2xl border p-4 transition ${
                    isDone 
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-80' 
                      : isBlocked
                      ? 'bg-amber-950/10 border-amber-800/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      
                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${roleBadgeColor}`}>
                          {task.ownerRole === 'founder' ? 'Founder' : 'Operations'}
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 font-mono">День {task.dayNumber}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 font-mono">{task.scheduledDate}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">~{task.estimateMinutes} мин</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{task.workstream}</span>
                        <span className="text-slate-500">·</span>
                        <span className={`text-[11px] font-bold ${task.priority === 'P0' ? 'text-rose-400' : 'text-slate-400'}`}>
                          {task.priority}
                        </span>
                      </div>

                      <h3 className={`text-base font-semibold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Blocker alert if present */}
                      {isBlocked && (
                        <div className="text-xs text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Блокер: {task.blockerReason || 'Ожидает решения'}</span>
                        </div>
                      )}

                      {/* Postponement notice if postponed */}
                      {task.postponementReason && (
                        <div className="text-xs text-indigo-400 bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Перенесено с {task.originalDeadline}. Причина: {task.postponementReason}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Mark Complete Button */}
                    <button
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition ${
                        isDone 
                          ? 'text-emerald-400 hover:text-slate-400' 
                          : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                      }`}
                      title={isDone ? 'Снять отметку' : 'Отметить сделанным'}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPostpone(task)}
                        className="hover:text-indigo-400 flex items-center gap-1 transition"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Перенести</span>
                      </button>
                      <span className="text-slate-700">|</span>
                      <span>Критерии: {task.acceptanceCriteria.length}</span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono">
                      id: {task.id}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Task Content: KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Column: To Do */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold px-1 text-slate-400">
              <span>К выполнению</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {filteredTasks.filter(t => t.status === 'todo').length}
              </span>
            </div>
            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
              {filteredTasks.filter(t => t.status === 'todo').map(task => (
                <div key={task.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`px-1.5 py-0.2 rounded font-semibold ${task.ownerRole === 'founder' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      {task.ownerRole === 'founder' ? 'Founder' : 'Operations'}
                    </span>
                    <span className="text-slate-400 font-mono">{task.scheduledDate}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white line-clamp-2">{task.title}</h4>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-500">~{task.estimateMinutes} мин</span>
                    <button
                      onClick={() => handleToggleTaskStatus(task)}
                      className="text-xs text-indigo-400 hover:text-emerald-400 font-medium"
                    >
                      Сделано →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Blocked / Waiting */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold px-1 text-amber-400">
              <span>Блокировано / Ожидание</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {filteredTasks.filter(t => t.status === 'blocked').length}
              </span>
            </div>
            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
              {filteredTasks.filter(t => t.status === 'blocked').map(task => (
                <div key={task.id} className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                  <span className="text-[11px] font-semibold text-amber-400">
                    {task.blockerReason || 'Блокер'}
                  </span>
                  <h4 className="text-xs font-semibold text-white">{task.title}</h4>
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className="w-full text-center py-1 text-xs text-amber-300 hover:text-white bg-amber-600/20 rounded-lg transition"
                  >
                    Разблокировать / Сделано
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Done */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold px-1 text-emerald-400">
              <span>Выполнено</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {filteredTasks.filter(t => t.status === 'done').length}
              </span>
            </div>
            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
              {filteredTasks.filter(t => t.status === 'done').map(task => (
                <div key={task.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 opacity-80 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="line-through">{task.title}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    {task.actualMetric || 'Завершено'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Postpone Modal */}
      {activeTaskForPostpone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Перенос задачи в 90-дневном плане
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Исходный срок: <strong className="text-white">{activeTaskForPostpone.originalDeadline}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300">Новая дата выполнения:</label>
                <input
                  type="date"
                  value={newPostponeDate}
                  onChange={(e) => setNewPostponeDate(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Причина переноса (для аудита):</label>
                <textarea
                  value={postponeReason}
                  onChange={(e) => setPostponeReason(e.target.value)}
                  rows={2}
                  placeholder="Опишите обоснование переноса..."
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setActiveTaskForPostpone(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmPostpone}
                className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition"
              >
                Подтвердить перенос
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
