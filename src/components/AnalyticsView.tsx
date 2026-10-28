import React, { useState } from 'react';
import { Task, Deal, ExpenseItem } from '../types';
import { 
  BarChart3, TrendingUp, Compass, CheckCircle2, AlertCircle, 
  Sparkles, Zap, ArrowRight, ShieldCheck, Flame
} from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  deals: Deal[];
  expenses: ExpenseItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  deals,
  expenses
}) => {
  // Weekly ritual state
  const [accelerateChannel, setAccelerateChannel] = useState('Meta Ads Click-to-WhatsApp (после первого теста)');
  const [pauseChannel, setPauseChannel] = useState('Массовые холодные звонки по справочникам (запрещено политикой)');
  const [experimentChannel, setExperimentChannel] = useState('Отраслевой семинар для массажистов в Atyrau Hub');
  const [ritualSaved, setRitualSaved] = useState(false);

  const doneTasks = tasks.filter(t => t.status === 'done');
  const totalTasks = tasks.length;
  const founderTasks = tasks.filter(t => t.ownerRole === 'founder');
  const opsTasks = tasks.filter(t => t.ownerRole === 'operations');

  const handleSaveRitual = () => {
    setRitualSaved(true);
    setTimeout(() => setRitualSaved(false), 3000);
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Аналитика и еженедельный ритуал управления</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Эффективность каналов и ритуал принятия решений
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              3 уровня контроля: Действия (Activity) → Конверсии (Conversion) → Выручка (Business).
            </p>
          </div>
        </div>
      </div>

      {/* Level 1: Activity & Execution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400">1. Уровень действий (Activity)</span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {doneTasks.length} <span className="text-sm font-normal text-slate-500">/ {totalTasks}</span>
          </div>
          <div className="text-xs text-slate-400">
            Founder: <strong>{founderTasks.filter(t => t.status === 'done').length}</strong> сделано • Ops: <strong>{opsTasks.filter(t => t.status === 'done').length}</strong> сделано
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400">2. Уровень конверсий (Funnel)</span>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            {deals.filter(d => d.stage === 'trial' || d.stage === 'demo_completed').length}
          </div>
          <div className="text-xs text-slate-400">
            Квалифицированных демо и пилотов в CRM
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400">3. Уровень денег (Business)</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            0 ₸
          </div>
          <div className="text-xs text-slate-400">
            Фактическая выручка (цель: 5–10 клиентов к 30 дню)
          </div>
        </div>
      </div>

      {/* Weekly 20-minute Ritual Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Еженедельный 20-минутный ритуал фокусировки
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Каждую пятницу выбираем: 1 канал ускорить, 1 остановить, 1 протестировать на следующей неделе.
            </p>
          </div>

          <button
            onClick={handleSaveRitual}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
          >
            {ritualSaved ? 'Сохранено!' : 'Зафиксировать'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Accelerate */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              1. Ускорить (Accelerate)
            </span>
            <input
              type="text"
              value={accelerateChannel}
              onChange={(e) => setAccelerateChannel(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            />
            <p className="text-[11px] text-slate-400">Канал, показавший наибольший отклик целевой аудитории.</p>
          </div>

          {/* Pause / Stop */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              2. Остановить (Pause / Stop)
            </span>
            <input
              type="text"
              value={pauseChannel}
              onChange={(e) => setPauseChannel(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            />
            <p className="text-[11px] text-slate-400">Действия, отнимающие время без квалифицированных заявок.</p>
          </div>

          {/* Experiment */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              3. Протестировать (Experiment)
            </span>
            <input
              type="text"
              value={experimentChannel}
              onChange={(e) => setExperimentChannel(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            />
            <p className="text-[11px] text-slate-400">Ограниченная гипотеза на 7 дней с четким критерием отсечки.</p>
          </div>

        </div>
      </div>

      {/* Confidence Matrix (Facts vs Experiments vs Hypotheses) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Матрица достоверности данных (Анти-иллюзии)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
            <span className="font-bold text-emerald-400">Доказанные факты:</span>
            <p className="text-slate-300">
              • Демо отрабатывает сценарии записи для массажных салонов.<br />
              • Платформа развернута и сохраняет данные в PWA-режиме.<br />
              • WhatsApp Business номер проверен.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
            <span className="font-bold text-indigo-400">Активные тесты:</span>
            <p className="text-slate-300">
              • Стоимость обращения в Instagram Ads в Атырау (бюджет 2 500 ₸/день).<br />
              • Формат мастер-класса в Atyrau Hub.<br />
              • Отклик реферальных партнеров (SMM/таргетологи).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
            <span className="font-bold text-amber-400">Гипотезы (не факты):</span>
            <p className="text-slate-300">
              • 5–10 платящих клиентов к 30 дню.<br />
              • Применимость продукта в доставке еды и оптовой торговле.<br />
              • Экспансия в Актау и Актобе.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
