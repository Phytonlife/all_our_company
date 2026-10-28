import React from 'react';
import { CalendarCheck2, Calendar, Target, Briefcase, Menu } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  todayCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigate,
  todayCount
}) => {
  const tabs = [
    {
      id: 'today',
      label: 'Сегодня',
      icon: CalendarCheck2,
      badge: todayCount > 0 ? todayCount : null
    },
    {
      id: 'roadmap',
      label: '90 Дней',
      icon: Calendar
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Target
    },
    {
      id: 'company_ops',
      label: 'Компания',
      icon: Briefcase
    },
    {
      id: 'menu',
      label: 'Меню',
      icon: Menu
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center h-full relative py-1 transition-colors active:scale-90 ${
                isActive
                  ? 'text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-indigo-400' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
