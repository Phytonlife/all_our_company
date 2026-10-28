import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { StorageService } from '../services/storage';
import { STRATEGIC_PROJECTS } from '../data/strategicProjects';
import { 
  Calendar, CheckCircle2, Clock, Filter, AlertTriangle, 
  RotateCcw, CheckSquare, Search, ChevronRight, Layers, LayoutList, 
  Columns3, CalendarDays, ArrowUpRight, Flame, Square
} from 'lucide-react';
import { formatRussianDate, formatShortDate } from '../utils/dateUtils';

interface RoadmapViewProps {
  tasks: Task[];
  onTasksUpdated: (updated: Task[]) => void;
  selectedRoleFilter: 'all' | 'founder' | 'operations';
  onOpenTaskModal: (task: Task) => void;
  initialProjectId?: string | null;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  tasks,
  onTasksUpdated,
  selectedRoleFilter,
  onOpenTaskModal,
  initialProjectId = null
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>(initialProjectId || 'all');
  
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
    if (statusFilter !== 'all') {
      if (statusFilter === 'todo' && task.status !== 'todo') return false;
      if (statusFilter === 'in_progress' && task.status !== 'in_progress') return false;
      if (statusFilter === 'waiting_external' && task.status !== 'waiting_external') return false;
      if (statusFilter === 'blocked' && task.status !== 'blocked') return false;
      if (statusFilter === 'done' && task.status !== 'done') return false;
    }
    // Project filter
    if (selectedProjectId !== 'all') {
      const proj = STRATEGIC_PROJECTS.find(p => p.id === selectedProjectId);
      if (proj && !proj.projectIds.includes(task.projectId)) {
        return false;
      }
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
  const completionPercent = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-5 pb-20">
      
      {/* 90-Day Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#111a2b] via-[#142138] to-[#0c1322] border border-slate-700/80 p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>90-дневный стратегический план • 28.10.2026 – 25.01.2027</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Проекты и дорожная карта (237 задач)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Все 237 задач обогащены подробными пошаговыми инструкциями, контактами и примерами.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-800/90 border border-slate-700">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Список</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Канбан</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Progress Strip */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Всего закрыто:</span>
            <span className="font-bold text-white text-sm">{doneTasksCount} из {totalTasksCount} задач ({completionPercent}%)</span>
          </div>
          <div className="w-full sm:w-64 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters Bar: Project, Week, Status, Search */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl space-y-3">
        {/* Project Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedProjectId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedProjectId === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Все направления (12)
          </button>
          {STRATEGIC_PROJECTS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedProjectId === p.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p.shortName}
            </button>
          ))}
        </div>

        {/* Search & Week & Status */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по задачам, шагам или проектам..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
          >
            <option value="all">Все статусы</option>
            <option value="todo">Не начато</option>
            <option value="in_progress">В работе</option>
            <option value="waiting_external">Ждём ответ</option>
            <option value="blocked">Заблокировано</option>
            <option value="done">Выполнено</option>
          </select>

          <select
            value={selectedWeek}
            onChange={e => setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
          >
            <option value="all">Все недели (1–13)</option>
            {Array.from({ length: 13 }, (_, i) => i + 1).map(w => (
              <option key={w} value={w}>Неделя {w}</option>
            ))}
          </select>

          <span className="text-xs text-slate-400 ml-auto">
            Найдено: <strong className="text-white">{filteredTasks.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Content: List or Kanban */}
      {viewMode === 'list' ? (
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400">
              По выбранным фильтрам задач не найдено.
            </div>
          ) : (
            filteredTasks.map(task => {
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
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        task.ownerRole === 'founder'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {task.ownerRole === 'founder' ? 'Основатель' : 'Супруга'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        День {task.dayNumber} ({formatShortDate(task.scheduledDate)})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        · {task.workstream}
                      </span>
                      {stepTotal > 0 && (
                        <span className="text-[11px] font-semibold text-slate-300">
                          · {stepDone}/{stepTotal} шагов
                        </span>
                      )}
                      {task.status === 'done' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          ✓ Готово
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

                    {task.guide?.why && (
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                        {task.guide.why}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTaskModal(task);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1"
                    >
                      <span>Инструкция</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 overflow-x-auto pb-4">
          {[
            { id: 'todo', title: 'Не начато', color: 'border-slate-700 bg-slate-900/60' },
            { id: 'in_progress', title: 'В работе', color: 'border-indigo-800/40 bg-indigo-950/20' },
            { id: 'waiting_external', title: 'Ждём ответ', color: 'border-amber-800/40 bg-amber-950/20' },
            { id: 'done', title: 'Выполнено', color: 'border-emerald-800/40 bg-emerald-950/20' }
          ].map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className={`rounded-2xl border p-3 flex flex-col min-h-[300px] ${col.color}`}>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs font-bold text-white">
                  <span>{col.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-2 flex-1">
                  {colTasks.slice(0, 15).map(task => (
                    <div
                      key={task.id}
                      onClick={() => onOpenTaskModal(task)}
                      className="p-3 bg-slate-900/90 border border-slate-700/80 hover:border-blue-500 rounded-xl cursor-pointer transition shadow-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className={task.ownerRole === 'founder' ? 'text-blue-400 font-semibold' : 'text-purple-400 font-semibold'}>
                          {task.ownerRole === 'founder' ? 'Основатель' : 'Супруга'}
                        </span>
                        <span>День {task.dayNumber}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2">
                        {task.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
