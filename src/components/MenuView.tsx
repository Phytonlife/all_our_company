import React from 'react';
import { 
  CalendarCheck2, Calendar, Target, Briefcase, Cpu, 
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
      id: 'today',
      title: 'Сегодня',
      desc: 'Командный брифинг дня, 3 фокусных задачи, баланс времени и вечерний итог',
      icon: CalendarCheck2,
      color: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      id: 'roadmap',
      title: '90 Дней / Roadmap',
      desc: '237 задач, вехи Day 14/30/60/90, недели 1–13, канбан и перенос сроков',
      icon: Calendar,
      color: 'text-purple-400 bg-purple-500/10'
    },
    {
      id: 'crm',
      title: 'CRM / Сделки',
      desc: 'Воронка входящих лидов с подтвержденным согласием (ст. 12 Закона РК)',
      icon: Target,
      color: 'text-sky-400 bg-sky-500/10'
    },
    {
      id: 'company_ops',
      title: 'Company Operations (v2.2)',
      desc: 'Юрлицо, Qazpatent, Kaspi Pay, налоги Атырау 2% vs Astana Hub, риски',
      icon: Briefcase,
      color: 'text-amber-400 bg-amber-500/10',
      isNew: true
    },
    {
      id: 'product_eng',
      title: 'Product Engineering (v2.2)',
      desc: 'Дорожная карта SaaS, устойчивость WhatsApp, RBAC роли, ЦОД РК, AI QA',
      icon: Cpu,
      color: 'text-emerald-400 bg-emerald-500/10',
      isNew: true
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
      desc: '10 категорий партнеров, полевые агенты, проверка безопасности комиссий',
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
    <div className="space-y-4 pb-16">
      
      {/* Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm">
        <h1 className="text-xl font-bold text-white">Все модули Growth OS</h1>
        <p className="text-xs text-slate-400 mt-1">
          Единый центр управления маркетингом, продажами, юрлицом и разработкой SaaS.
        </p>
      </div>

      {/* Menu List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition active:scale-[0.98] ${
                isActive
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                  {item.isNew && (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500 text-white font-bold text-[9px] uppercase tracking-wider">
                      NEW 2.2
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 self-center" />
            </button>
          );
        })}
      </div>

    </div>
  );
};
