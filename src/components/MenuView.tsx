import React from 'react';
import { 
  Compass, CalendarCheck2, Calendar, Target, Briefcase, Cpu, 
  MapPin, Users2, BookOpen, DollarSign, BarChart3, 
  Settings, ChevronRight, ShieldCheck, Sparkles
} from 'lucide-react';

interface MenuViewProps {
  onNavigate: (tab: string) => void;
  activeTab: string;
}

export const MenuView: React.FC<MenuViewProps> = ({
  onNavigate,
  activeTab
}) => {
  const menuItems = [
    {
      id: 'overview',
      title: 'Карта роста (Обзор v3)',
      desc: 'Командный центр: глобальный круг прогресса, 12 проектных колец, 3 раздельные метрики',
      icon: Compass,
      color: 'text-blue-400 bg-blue-500/10'
    },
    {
      id: 'today',
      title: 'Сегодня',
      desc: 'Командный брифинг дня, фокусные задачи, баланс времени и вечерний итог',
      icon: CalendarCheck2,
      color: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      id: 'roadmap',
      title: '90 Дней / Проекты',
      desc: '237 задач, 12 стратегических направлений, недели 1–13, канбан и перенос сроков',
      icon: Calendar,
      color: 'text-purple-400 bg-purple-500/10'
    },
    {
      id: 'crm',
      title: 'CRM / Сделки и Выручка',
      desc: 'Воронка входящих лидов с подтвержденным согласием (ст. 12 Закона РК)',
      icon: Target,
      color: 'text-sky-400 bg-sky-500/10'
    },
    {
      id: 'company_ops',
      title: 'Company Operations (v2.2)',
      desc: 'Юрлицо, Qazpatent, Kaspi Pay, налоги Атырау 2% vs Astana Hub, риски',
      icon: Briefcase,
      color: 'text-amber-400 bg-amber-500/10'
    },
    {
      id: 'product_eng',
      title: 'Product Engineering (v2.2)',
      desc: 'Дорожная карта SaaS, устойчивость WhatsApp, RBAC роли, ЦОД РК, QA',
      icon: Cpu,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 'events',
      title: 'Организации и События',
      desc: 'Atyrau Hub, НПП Атамекен, Фонд Даму, 10-этапный мастер подготовки',
      icon: MapPin,
      color: 'text-rose-400 bg-rose-500/10'
    },
    {
      id: 'partners',
      title: 'Партнёры и Торговые',
      desc: '10 категорий партнеров, полевые агенты, соглашения и условия',
      icon: Users2,
      color: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      id: 'playbooks',
      title: 'База знаний & Playbooks',
      desc: 'Редактируемые тексты: оффер, скрипты демо, 45-мин доклад, ответы на возражения',
      icon: BookOpen,
      color: 'text-teal-400 bg-teal-500/10'
    },
    {
      id: 'finance',
      title: 'Финансы и Расходы',
      desc: 'Контроль лимитов бюджета, реальная выручка, юнит-экономика и CAC',
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 'analytics',
      title: 'Аналитика и Управление',
      desc: 'Activity vs Conversion vs Revenue, еженедельный 20-минутный ритуал',
      icon: BarChart3,
      color: 'text-violet-400 bg-violet-500/10'
    },
    {
      id: 'settings',
      title: 'Настройки и Безопасность',
      desc: 'PWA установка на iPhone/Android, резервные копии JSON, архитектура РК',
      icon: Settings,
      color: 'text-slate-400 bg-slate-800'
    }
  ];

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#111a2b] via-[#142138] to-[#0c1322] border border-slate-700/80 p-4 sm:p-5 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Все разделы штаба Growth OS
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
          Единый доступ ко всем модулям операционного управления компанией.
        </p>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group min-h-[44px] ${
                isActive
                  ? 'bg-slate-800 border-blue-500 shadow-md'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${item.color} group-hover:scale-105 transition-transform shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
