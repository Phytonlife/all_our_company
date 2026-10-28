import React from 'react';
import { UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Sun, Moon, ShieldCheck, UserCheck, Users, Briefcase } from 'lucide-react';

interface HeaderProps {
  selectedRole: 'all' | 'founder' | 'operations';
  onSelectRole: (role: 'all' | 'founder' | 'operations') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedRole,
  onSelectRole,
  theme,
  onToggleTheme,
  activeTab,
  onNavigate
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/90 dark:bg-slate-950/90 border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div 
            onClick={() => onNavigate('today')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-sm tracking-tighter">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                Growth OS
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.2 KZ
                </span>
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-400 -mt-0.5">
                Атырау • Закрытая SaaS ОС
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Desktop Quick Nav Links (Clean typography, whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-medium text-slate-400">
          <button 
            onClick={() => onNavigate('today')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'today' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
          >
            Сегодня
          </button>
          <button 
            onClick={() => onNavigate('roadmap')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'roadmap' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
          >
            90 Дней
          </button>
          <button 
            onClick={() => onNavigate('crm')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'crm' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
          >
            CRM
          </button>
          <button 
            onClick={() => onNavigate('company_ops')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1 ${activeTab === 'company_ops' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'}`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Company Ops</span>
          </button>
          <button 
            onClick={() => onNavigate('product_eng')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1 ${activeTab === 'product_eng' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Product Eng</span>
          </button>
          <button 
            onClick={() => onNavigate('events')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'events' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
          >
            События
          </button>
          <button 
            onClick={() => onNavigate('playbooks')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'playbooks' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
          >
            Playbooks
          </button>
          <button 
            onClick={() => onNavigate('finance')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'finance' ? 'text-white font-semibold' : 'hover:text-slate-200'}`}
          >
            Финансы
          </button>
        </nav>

        {/* Zone 3: Interactive Role Switcher & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Mobile/Desktop Role Switcher (Founder / Operations / Все) */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-800/90 border border-slate-700/70 text-xs">
            <button
              onClick={() => onSelectRole('founder')}
              className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                selectedRole === 'founder'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Задачи Основателя (демо, стратегия, продукт, таргет)"
            >
              <UserCheck className="w-3 h-3" />
              <span className="hidden xs:inline">Founder</span>
            </button>
            <button
              onClick={() => onSelectRole('operations')}
              className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                selectedRole === 'operations'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Задачи Супруги (организация, площадки, контент, учет)"
            >
              <Users className="w-3 h-3" />
              <span className="hidden xs:inline">Ops</span>
            </button>
            <button
              onClick={() => onSelectRole('all')}
              className={`px-1.5 sm:px-2 py-1 rounded-md font-medium transition-all ${
                selectedRole === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Показать все задачи"
            >
              Все
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton compact={true} />
        </div>
      </div>
    </header>
  );
};
