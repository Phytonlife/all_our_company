import React, { useState, useEffect } from 'react';
import { StorageService, AppSettings } from './services/storage';
import { Task, Deal, EventItem, Partner, SalesAgent, ExpenseItem, LegalTemplate, RiskItem, PlaybookSection } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TodayView } from './components/TodayView';
import { RoadmapView } from './components/RoadmapView';
import { CrmView } from './components/CrmView';
import { CompanyOpsView } from './components/CompanyOpsView';
import { ProductEngView } from './components/ProductEngView';
import { EventsView } from './components/EventsView';
import { PartnersView } from './components/PartnersView';
import { PlaybooksView } from './components/PlaybooksView';
import { FinanceView } from './components/FinanceView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { MenuView } from './components/MenuView';

export default function App() {
  // App State
  const [activeTab, setActiveTab] = useState<string>('today');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'founder' | 'operations'>('all');
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [theme, setTheme] = useState<'dark' | 'light'>(settings.theme || 'dark');

  // Datasets
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [legalTemplates, setLegalTemplates] = useState<LegalTemplate[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [playbooks, setPlaybooks] = useState<PlaybookSection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedTasks = StorageService.getTasks();
    const loadedDeals = StorageService.getDeals();
    const loadedEvents = StorageService.getEvents();
    const loadedPartners = StorageService.getPartners();
    const loadedAgents = StorageService.getAgents();
    const loadedExpenses = StorageService.getExpenses();
    const loadedTemplates = StorageService.getLegalTemplates();
    const loadedRisks = StorageService.getRisks();
    const loadedPlaybooks = StorageService.getPlaybooks();
    const loadedSettings = StorageService.getSettings();

    setTasks(loadedTasks);
    setDeals(loadedDeals);
    setEvents(loadedEvents);
    setPartners(loadedPartners);
    setAgents(loadedAgents);
    setExpenses(loadedExpenses);
    setLegalTemplates(loadedTemplates);
    setRisks(loadedRisks);
    setPlaybooks(loadedPlaybooks);
    setSettings(loadedSettings);
    setSelectedRoleFilter(loadedSettings.selectedRoleFilter || 'all');
    setTheme(loadedSettings.theme || 'dark');
    setIsLoaded(true);
  }, []);

  // Theme synchronization with HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    StorageService.saveSettings({ theme: nextTheme });
  };

  const handleSelectRole = (role: 'all' | 'founder' | 'operations') => {
    setSelectedRoleFilter(role);
    StorageService.saveSettings({ selectedRoleFilter: role });
  };

  // Today count for mobile badge
  const todayDateStr = "2026-10-28";
  const todayTasksCount = tasks.filter(t => t.scheduledDate === todayDateStr && t.status !== 'done').length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Инициализация Growth OS Kazakhstan...
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Top Header */}
      <Header
        selectedRole={selectedRoleFilter}
        onSelectRole={handleSelectRole}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {activeTab === 'today' && (
          <TodayView
            tasks={tasks}
            onTasksUpdated={setTasks}
            selectedRoleFilter={selectedRoleFilter}
            onNavigate={setActiveTab}
            founderDailyLimit={settings.founderDailyLimitMinutes}
            operationsDailyLimit={settings.operationsDailyLimitMinutes}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView
            tasks={tasks}
            onTasksUpdated={setTasks}
            selectedRoleFilter={selectedRoleFilter}
          />
        )}

        {activeTab === 'crm' && (
          <CrmView
            deals={deals}
            onDealsUpdated={setDeals}
            selectedRoleFilter={selectedRoleFilter}
          />
        )}

        {activeTab === 'company_ops' && (
          <CompanyOpsView
            legalTemplates={legalTemplates}
            onTemplatesUpdated={setLegalTemplates}
            risks={risks}
            onRisksUpdated={setRisks}
          />
        )}

        {activeTab === 'product_eng' && (
          <ProductEngView />
        )}

        {activeTab === 'events' && (
          <EventsView
            events={events}
            onEventsUpdated={setEvents}
          />
        )}

        {activeTab === 'partners' && (
          <PartnersView
            partners={partners}
            onPartnersUpdated={setPartners}
            agents={agents}
            onAgentsUpdated={setAgents}
          />
        )}

        {activeTab === 'playbooks' && (
          <PlaybooksView
            playbooks={playbooks}
            onPlaybooksUpdated={setPlaybooks}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            expenses={expenses}
            deals={deals}
            onExpensesUpdated={setExpenses}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            tasks={tasks}
            deals={deals}
            expenses={expenses}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSettingsUpdated={setSettings}
            onDataReset={() => {
              setTasks(StorageService.getTasks());
              setDeals(StorageService.getDeals());
              setEvents(StorageService.getEvents());
              setPartners(StorageService.getPartners());
              setAgents(StorageService.getAgents());
              setExpenses(StorageService.getExpenses());
            }}
          />
        )}

        {activeTab === 'menu' && (
          <MenuView
            onNavigate={setActiveTab}
            activeTab={activeTab}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (Visible on lg:hidden) */}
      <BottomNav
        activeTab={activeTab}
        onNavigate={setActiveTab}
        todayCount={todayTasksCount}
      />
    </div>
  );
}
