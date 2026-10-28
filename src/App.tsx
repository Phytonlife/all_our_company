import React, { useState, useEffect } from 'react';
import { StorageService, AppSettings } from './services/storage';
import { 
  Task, Deal, EventItem, Partner, SalesAgent, 
  ExpenseItem, LegalTemplate, RiskItem, PlaybookSection, TaskStatus 
} from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GlobalDashboardView } from './components/GlobalDashboardView';
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
import { TaskDetailModal } from './components/TaskDetailModal';
import { getAtyrauDateString, CAMPAIGN_START_DATE, CAMPAIGN_END_DATE } from './utils/dateUtils';

export default function App() {
  // App State - Default to 'overview' (First Screen: Global Growth Map)
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'founder' | 'operations'>('all');
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [theme, setTheme] = useState<'dark' | 'light'>(settings.theme || 'dark');
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [roadmapProjectIdFilter, setRoadmapProjectIdFilter] = useState<string | null>(null);

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

  // Dynamic Asia/Atyrau current date (with optional test override from settings)
  const currentDateStr = getAtyrauDateString(settings.simulatedDate);
  const startDateStr = settings.startDate || CAMPAIGN_START_DATE;
  const endDateStr = settings.endDate || CAMPAIGN_END_DATE;

  // Initialize data on mount
  useEffect(() => {
    const loadedTasks = StorageService.getTasks();
    const loadedDeals = StorageService.getDeals(true); // include all in state
    const loadedEvents = StorageService.getEvents();
    const loadedPartners = StorageService.getPartners(true);
    const loadedAgents = StorageService.getAgents(true);
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

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus, note?: string) => {
    const updates: Partial<Task> = { status };
    if (note) updates.notes = note;
    const updated = StorageService.updateTask(taskId, updates);
    setTasks(updated);
    if (selectedTaskForModal && selectedTaskForModal.id === taskId) {
      setSelectedTaskForModal({ ...selectedTaskForModal, ...updates });
    }
  };

  const handleToggleTaskStep = (taskId: string, stepId: string, done: boolean) => {
    const updated = StorageService.toggleGuidedChecklistStep(taskId, stepId, done);
    setTasks(updated);
    if (selectedTaskForModal && selectedTaskForModal.id === taskId) {
      const refreshed = updated.find(t => t.id === taskId);
      if (refreshed) setSelectedTaskForModal(refreshed);
    }
  };

  const handlePostponeTask = (taskId: string, newDate: string, reason: string) => {
    const updated = StorageService.postponeTask(taskId, newDate, reason);
    setTasks(updated);
    if (selectedTaskForModal && selectedTaskForModal.id === taskId) {
      const refreshed = updated.find(t => t.id === taskId);
      if (refreshed) setSelectedTaskForModal(refreshed);
    }
  };

  const handleSaveEvidence = (taskId: string, evidenceNote: string, proofUrl?: string) => {
    const updates: Partial<Task> = {
      evidenceNote,
      proofUrls: proofUrl ? [proofUrl] : []
    };
    const updated = StorageService.updateTask(taskId, updates);
    setTasks(updated);
  };

  const handleRequestHelp = (taskId: string, note: string) => {
    const task = tasks.find(t => t.id === taskId);
    const existing = task?.notes ? task.notes + '\n' : '';
    const updated = StorageService.updateTask(taskId, {
      notes: existing + note
    });
    setTasks(updated);
  };

  const handleNavigateWithFilter = (tabId: string, params?: { projectId?: string }) => {
    if (params?.projectId) {
      setRoadmapProjectIdFilter(params.projectId);
    } else {
      setRoadmapProjectIdFilter(null);
    }
    setActiveTab(tabId);
  };

  // Today count for mobile badge
  const todayTasksCount = tasks.filter(t => t.scheduledDate === currentDateStr && t.status !== 'done').length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#090e1c] flex items-center justify-center text-slate-400 text-sm">
        Инициализация Growth OS Kazakhstan...
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#090e1c] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Top Header */}
      <Header
        selectedRole={selectedRoleFilter}
        onSelectRole={handleSelectRole}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeTab={activeTab}
        onNavigate={(tab) => {
          setRoadmapProjectIdFilter(null);
          setActiveTab(tab);
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* TAB 1: OVERVIEW (First Screen - Global Growth Map) */}
        {activeTab === 'overview' && (
          <GlobalDashboardView
            tasks={tasks}
            deals={deals}
            expenses={expenses}
            currentDateStr={currentDateStr}
            startDateStr={startDateStr}
            endDateStr={endDateStr}
            onOpenTaskModal={(t) => setSelectedTaskForModal(t)}
            onNavigateToTab={handleNavigateWithFilter}
            onUpdatePeriod={(start, end) => {
              const updated = { ...settings, startDate: start, endDate: end };
              StorageService.saveSettings(updated);
              setSettings(updated);
            }}
          />
        )}

        {/* TAB 2: TODAY */}
        {activeTab === 'today' && (
          <TodayView
            tasks={tasks}
            onTasksUpdated={setTasks}
            selectedRoleFilter={selectedRoleFilter}
            onNavigate={setActiveTab}
            founderDailyLimit={settings.founderDailyLimitMinutes}
            operationsDailyLimit={settings.operationsDailyLimitMinutes}
            onOpenTaskModal={(t) => setSelectedTaskForModal(t)}
            currentDateStr={currentDateStr}
          />
        )}

        {/* TAB 3: 90 DAYS / PROJECTS ROADMAP */}
        {activeTab === 'roadmap' && (
          <RoadmapView
            tasks={tasks}
            onTasksUpdated={setTasks}
            selectedRoleFilter={selectedRoleFilter}
            onOpenTaskModal={(t) => setSelectedTaskForModal(t)}
            initialProjectId={roadmapProjectIdFilter}
          />
        )}

        {/* TAB 4: CRM / DEALS */}
        {activeTab === 'crm' && (
          <CrmView
            deals={deals}
            onDealsUpdated={setDeals}
            selectedRoleFilter={selectedRoleFilter}
          />
        )}

        {/* TAB 5: COMPANY OPERATIONS */}
        {activeTab === 'company_ops' && (
          <CompanyOpsView
            legalTemplates={legalTemplates}
            onTemplatesUpdated={setLegalTemplates}
            risks={risks}
            onRisksUpdated={setRisks}
          />
        )}

        {/* TAB 6: PRODUCT ENGINEERING */}
        {activeTab === 'product_eng' && (
          <ProductEngView />
        )}

        {/* TAB 7: EVENTS (Hub, Atameken, Damu) */}
        {activeTab === 'events' && (
          <EventsView
            events={events}
            onEventsUpdated={setEvents}
          />
        )}

        {/* TAB 8: PARTNERS & AGENTS */}
        {activeTab === 'partners' && (
          <PartnersView
            partners={partners}
            onPartnersUpdated={setPartners}
            agents={agents}
            onAgentsUpdated={setAgents}
          />
        )}

        {/* TAB 9: PLAYBOOKS */}
        {activeTab === 'playbooks' && (
          <PlaybooksView
            playbooks={playbooks}
            onPlaybooksUpdated={setPlaybooks}
          />
        )}

        {/* TAB 10: FINANCE */}
        {activeTab === 'finance' && (
          <FinanceView
            expenses={expenses}
            deals={deals}
            onExpensesUpdated={setExpenses}
          />
        )}

        {/* TAB 11: ANALYTICS */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            tasks={tasks}
            deals={deals}
            expenses={expenses}
          />
        )}

        {/* TAB 12: SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSettingsUpdated={setSettings}
            onDataReset={() => {
              setTasks(StorageService.getTasks());
              setDeals(StorageService.getDeals(true));
              setEvents(StorageService.getEvents());
              setPartners(StorageService.getPartners(true));
              setAgents(StorageService.getAgents(true));
              setExpenses(StorageService.getExpenses());
            }}
          />
        )}

        {/* TAB 13: MENU (ALL MODULES) */}
        {activeTab === 'menu' && (
          <MenuView
            onNavigate={(tab) => {
              setRoadmapProjectIdFilter(null);
              setActiveTab(tab);
            }}
            activeTab={activeTab}
          />
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTaskForModal && (
        <TaskDetailModal
          task={selectedTaskForModal}
          onClose={() => setSelectedTaskForModal(null)}
          onUpdateStatus={handleUpdateTaskStatus}
          onToggleStep={handleToggleTaskStep}
          onPostpone={handlePostponeTask}
          onSaveEvidence={handleSaveEvidence}
          onRequestHelp={handleRequestHelp}
        />
      )}

      {/* Mobile Bottom Navigation (Visible on lg:hidden) */}
      <BottomNav
        activeTab={activeTab}
        onNavigate={(tab) => {
          setRoadmapProjectIdFilter(null);
          setActiveTab(tab);
        }}
        todayCount={todayTasksCount}
      />
    </div>
  );
}
