import React from 'react';
import { UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Sun, Moon, ShieldCheck, UserCheck, Users, Briefcase, Compass } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0c1322]/95 border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div 
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-sm tracking-tighter">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                Growth OS
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  v3.0 KZ
                </span>
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-400 -mt-0.5">
                Атырау • Штаб B2B SaaS
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Desktop Quick Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-medium text-slate-400">
          <button 
            onClick={() => onNavigate('overview')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'overview' ? 'text-blue-400 font-bold' : 'hover:text-slate-200'}`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Обзор</span>
          </button>
          <button 
            onClick={() => onNavigate('today')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'today' ? 'text-white font-bold' : 'hover:text-slate-200'}`}
          >
            Сегодня
          </button>
          <button 
            onClick={() => onNavigate('roadmap')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'roadmap' ? 'text-white font-bold' : 'hover:text-slate-200'}`}
          >
            Проекты
          </button>
          <button 
            onClick={() => onNavigate('crm')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'crm' ? 'text-white font-bold' : 'hover:text-slate-200'}`}
          >
            Клиенты
          </button>
          <button 
            onClick={() => onNavigate('company_ops')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1 ${activeTab === 'company_ops' ? 'text-indigo-400 font-bold' : 'hover:text-slate-200'}`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Компания</span>
          </button>
          <button 
            onClick={() => onNavigate('product_eng')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1 ${activeTab === 'product_eng' ? 'text-cyan-400 font-bold' : 'hover:text-slate-200'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Продукт</span>
          </button>
          <button 
            onClick={() => onNavigate('playbooks')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'playbooks' ? 'text-white font-bold' : 'hover:text-slate-200'}`}
          >
            База знаний
          </button>
          <button 
            onClick={() => onNavigate('menu')}
            className={`whitespace-nowrap transition-colors ${activeTab === 'menu' ? 'text-white font-bold' : 'hover:text-slate-200'}`}
          >
            Ещё...
          </button>
        </nav>

        {/* Zone 3: Role Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Role Filter Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/90 border border-slate-700">
            <button
              onClick={() => onSelectRole('founder')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                selectedRole === 'founder'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Фильтр: задачи Основателя"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Основатель</span>
            </button>
            <button
              onClick={() => onSelectRole('operations')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                selectedRole === 'operations'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Фильтр: задачи Супруги (Operations)"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Супруга</span>
            </button>
            <button
              onClick={() => onSelectRole('all')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Все задачи"
            >
              Все
            </button>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            aria-label="Сменить тему"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
