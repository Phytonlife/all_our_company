import React from 'react';
import { Compass, CalendarCheck2, Layers, Users, Menu } from 'lucide-react';

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
      id: 'overview',
      label: 'Обзор',
      icon: Compass
    },
    {
      id: 'today',
      label: 'Сегодня',
      icon: CalendarCheck2,
      badge: todayCount > 0 ? todayCount : null
    },
    {
      id: 'roadmap',
      label: 'Проекты',
      icon: Layers
    },
    {
      id: 'crm',
      label: 'Клиенты',
      icon: Users
    },
    {
      id: 'menu',
      label: 'Ещё',
      icon: Menu
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0c1322]/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center h-full relative py-1 transition-colors active:scale-90 min-h-[44px] ${
                isActive
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-400' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
