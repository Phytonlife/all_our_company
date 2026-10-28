import { 
  Task, Deal, EventItem, Partner, SalesAgent, ExpenseItem, 
  LegalTemplate, RiskItem, PlaybookSection 
} from "../types";
import { SEED_TASKS } from "../data/seedTasks";
import { INITIAL_PLAYBOOKS } from "../data/playbooks";
import { INITIAL_LEGAL_TEMPLATES } from "../data/legalTemplates";
import { INITIAL_RISKS } from "../data/companyOpsData";

const STORAGE_KEYS = {
  TASKS: 'growth_os_kz_tasks_v3',
  DEALS: 'growth_os_kz_deals_v3',
  EVENTS: 'growth_os_kz_events_v3',
  PARTNERS: 'growth_os_kz_partners_v3',
  AGENTS: 'growth_os_kz_agents_v3',
  EXPENSES: 'growth_os_kz_expenses_v3',
  LEGAL_TEMPLATES: 'growth_os_kz_legal_v3',
  RISKS: 'growth_os_kz_risks_v3',
  PLAYBOOKS: 'growth_os_kz_playbooks_v3',
  SETTINGS: 'growth_os_kz_settings_v3',
  AUDIT_LOGS: 'growth_os_kz_audit_logs_v3',
  BACKUP_PRE_V3: 'growth_os_kz_backup_prev3',
};

// Legacy keys for safe migration
const LEGACY_KEYS = {
  TASKS_V22: 'growth_os_kz_tasks_v22',
  DEALS_V22: 'growth_os_kz_deals_v22',
  PARTNERS_V22: 'growth_os_kz_partners_v22',
  AGENTS_V22: 'growth_os_kz_agents_v22',
  EXPENSES_V22: 'growth_os_kz_expenses_v22',
  SETTINGS_V22: 'growth_os_kz_settings_v22',
};

export interface AppSettings {
  theme: 'dark' | 'light';
  language: 'ru' | 'kz';
  founderDailyLimitMinutes: number;
  operationsDailyLimitMinutes: number;
  selectedRoleFilter: 'all' | 'founder' | 'operations';
  activeCity: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  simulatedDate?: string | null; // Optional override for testing
  showDemoSandbox: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'ru',
  founderDailyLimitMinutes: 90,
  operationsDailyLimitMinutes: 35,
  selectedRoleFilter: 'all',
  activeCity: 'Атырау',
  startDate: '2026-10-28',
  endDate: '2027-01-25',
  simulatedDate: null,
  showDemoSandbox: false,
};

// Verified sample events with real Atyrau contacts
const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-hub-01",
    title: "Практикум: Автоматизация WhatsApp-заявок для МСБ Атырау",
    organization: "Atyrau Hub",
    contactPerson: "Координатор событий Atyrau Hub (ул. Кенжебай Маденова 7А)",
    contactChannel: "Telegram @atyrauithub / https://t.me/atyrauithub",
    status: "inquiry",
    venue: "Atyrau Hub, конференц-зал",
    expectedAudience: 20,
    speaker: "Founder (Основатель)",
    currentStep: 2,
    stepsCompleted: [true, true, false, false, false, false, false, false, false, false],
    registrationGoal: 20,
    actualRegistrations: 0,
    actualAttendance: 0,
    demoBookings: 0,
    paidClients30d: 0,
    costKZT: 0,
    notes: "Подготовлено официальное письмо с предложением даты на вторую декаду ноября.",
    sourceUrl: "https://astanahub.com/ru/event/",
    updatedAt: "2026-10-28"
  },
  {
    id: "evt-atameken-01",
    title: "Отраслевой семинар для сферы услуг и туризма Атырауской области",
    organization: "НПП Атамекен",
    contactPerson: "Секретариат отраслевых советов Палаты (пр. Сатпаева, 78)",
    contactChannel: "+7 (7122) 76-36-55 / atyrau@atameken.kz",
    status: "inquiry",
    venue: "Зал Палаты предпринимателей Атырау",
    expectedAudience: 15,
    speaker: "Founder",
    currentStep: 1,
    stepsCompleted: [true, false, false, false, false, false, false, false, false, false],
    registrationGoal: 15,
    actualRegistrations: 0,
    actualAttendance: 0,
    demoBookings: 0,
    paidClients30d: 0,
    costKZT: 0,
    notes: "Уточнение контактов координатора совета по сфере услуг.",
    sourceUrl: "https://atameken.kz/business",
    updatedAt: "2026-10-28"
  }
];

export const StorageService = {
  // --- MIGRATION & BACKUP ---

  createPreV3Backup(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const backup: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(LEGACY_KEYS)) {
        backup[k] = localStorage.getItem(v);
      }
      localStorage.setItem(STORAGE_KEYS.BACKUP_PRE_V3, JSON.stringify({
        timestamp: new Date().toISOString(),
        legacyData: backup
      }));
      return true;
    } catch (e) {
      console.warn("Failed to create pre-v3 backup:", e);
      return false;
    }
  },

  restorePreV3Backup(): boolean {
    try {
      const backupRaw = localStorage.getItem(STORAGE_KEYS.BACKUP_PRE_V3);
      if (!backupRaw) return false;
      const parsed = JSON.parse(backupRaw);
      if (parsed.legacyData) {
        for (const [k, v] of Object.entries(parsed.legacyData)) {
          const key = LEGACY_KEYS[k as keyof typeof LEGACY_KEYS];
          if (key && typeof v === 'string') {
            localStorage.setItem(key, v);
          }
        }
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.DEALS);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to restore pre-v3 backup:", e);
      return false;
    }
  },

  exportAllDataJSON(): string {
    const data = {
      version: "3.0.0",
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      deals: this.getDeals(true), // include all
      events: this.getEvents(),
      partners: this.getPartners(true),
      agents: this.getAgents(true),
      expenses: this.getExpenses(),
      settings: this.getSettings(),
      playbooks: this.getPlaybooks(),
      legalTemplates: this.getLegalTemplates(),
      risks: this.getRisks(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(data, null, 2);
  },

  importAllDataJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !Array.isArray(parsed.tasks)) {
        return { success: false, message: "Неверный формат резервной копии: отсутствует массив задач" };
      }

      // Safe backup first
      this.createPreV3Backup();

      if (parsed.tasks) this.saveTasks(parsed.tasks);
      if (parsed.deals) this.saveDeals(parsed.deals);
      if (parsed.events) this.saveEvents(parsed.events);
      if (parsed.partners) this.savePartners(parsed.partners);
      if (parsed.agents) this.saveAgents(parsed.agents);
      if (parsed.expenses) this.saveExpenses(parsed.expenses);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.playbooks) this.savePlaybooks(parsed.playbooks);

      this.addAuditLog('backup_imported', `Импортирован бэкап от ${parsed.exportedAt || 'неизвестной даты'}`);
      return { success: true, message: `Успешно восстановлено ${parsed.tasks.length} задач и данные CRM` };
    } catch (e: any) {
      return { success: false, message: `Ошибка при импорте: ${e.message || String(e)}` };
    }
  },

  // --- TASKS ---

  getTasks(): Task[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return SEED_TASKS;
      }

      const storedV3 = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (storedV3) {
        const parsed: Task[] = JSON.parse(storedV3);
        // Idempotent sync with SEED_TASKS to ensure all 237 tasks have full guide/checklist
        const storedMap = new Map(parsed.map(t => [t.id, t]));
        let hasChanges = false;

        const merged: Task[] = SEED_TASKS.map(seedTask => {
          const userTask = storedMap.get(seedTask.id);
          if (!userTask) {
            hasChanges = true;
            return seedTask;
          }

          // User had this task: preserve user choices, enrich guide
          const updated: Task = {
            ...seedTask,
            status: userTask.status || seedTask.status,
            completedAt: userTask.completedAt ?? seedTask.completedAt,
            scheduledDate: userTask.scheduledDate || seedTask.scheduledDate,
            notes: userTask.notes || seedTask.notes,
            proofUrls: userTask.proofUrls && userTask.proofUrls.length > 0 ? userTask.proofUrls : seedTask.proofUrls,
            postponementReason: userTask.postponementReason ?? seedTask.postponementReason,
            postponementHistory: userTask.postponementHistory ?? seedTask.postponementHistory,
            blockerReason: userTask.blockerReason ?? seedTask.blockerReason,
            evidenceNote: userTask.evidenceNote ?? seedTask.evidenceNote,
            verificationConfirmed: userTask.verificationConfirmed ?? seedTask.verificationConfirmed,
            legacyUnverified: userTask.legacyUnverified,
          };

          // Merge guided checklist checkboxes
          if (seedTask.guidedChecklist && seedTask.guidedChecklist.length > 0) {
            const userChecklistMap = new Map((userTask.guidedChecklist || []).map(c => [c.id || c.title, c.done]));
            updated.guidedChecklist = seedTask.guidedChecklist.map(sc => ({
              ...sc,
              done: userChecklistMap.has(sc.id) ? !!userChecklistMap.get(sc.id) : (userChecklistMap.has(sc.title) ? !!userChecklistMap.get(sc.title) : sc.done)
            }));
          }

          return updated;
        });

        // Also keep any user-created custom manual tasks that were not in seed
        for (const [id, userTask] of storedMap.entries()) {
          if (!SEED_TASKS.some(st => st.id === id)) {
            merged.push(userTask);
          }
        }

        if (hasChanges) {
          localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(merged));
        }
        return merged;
      }

      // Check for legacy V2.2 storage to migrate
      const storedLegacy = localStorage.getItem(LEGACY_KEYS.TASKS_V22);
      if (storedLegacy) {
        this.createPreV3Backup();
        try {
          const legacyParsed: Task[] = JSON.parse(storedLegacy);
          const legacyMap = new Map(legacyParsed.map(t => [t.id, t]));

          const migrated: Task[] = SEED_TASKS.map(seedTask => {
            const old = legacyMap.get(seedTask.id);
            if (!old) return seedTask;

            // Preserve user notes and postponements
            const isUserDone = old.status === 'done' && (old.notes?.trim() || old.proofUrls?.length > 0);
            return {
              ...seedTask,
              status: isUserDone ? 'done' : 'todo',
              completedAt: isUserDone ? old.completedAt : null,
              notes: old.notes || seedTask.notes,
              proofUrls: old.proofUrls || seedTask.proofUrls,
              scheduledDate: old.scheduledDate || seedTask.scheduledDate,
              postponementReason: old.postponementReason || null,
              postponementHistory: old.postponementHistory || [],
              legacyUnverified: old.status === 'done' && !isUserDone,
            };
          });

          localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(migrated));
          return migrated;
        } catch (e) {
          console.error("Migration from legacy tasks failed:", e);
        }
      }

      // Fresh clean install: all 237 tasks in todo with 0% initial completion
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
      return SEED_TASKS;
    } catch (e) {
      console.error("Error loading tasks:", e);
      return SEED_TASKS;
    }
  },

  saveTasks(tasks: Task[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error("Error saving tasks:", e);
    }
  },

  updateTask(taskId: string, updates: Partial<Task>): Task[] {
    const tasks = this.getTasks();
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const result = { ...t, ...updates };
        if (updates.status === 'done' && !t.completedAt) {
          result.completedAt = new Date().toISOString();
        } else if (updates.status && updates.status !== 'done') {
          result.completedAt = null;
        }
        return result;
      }
      return t;
    });
    this.saveTasks(updated);
    this.addAuditLog('task_updated', `Задача ${taskId} обновлена: статус ${updates.status || 'без изменений'}`);
    return updated;
  },

  toggleGuidedChecklistStep(taskId: string, stepId: string, done: boolean): Task[] {
    const tasks = this.getTasks();
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const checklist = (t.guidedChecklist || []).map(item => {
          if (item.id === stepId) {
            return { ...item, done };
          }
          return item;
        });

        // Calculate progress
        const doneCount = checklist.filter(c => c.done).length;
        const totalCount = checklist.length;

        // Auto-update status to in_progress if starting steps
        let newStatus = t.status;
        if (doneCount > 0 && doneCount < totalCount && t.status === 'todo') {
          newStatus = 'in_progress';
        }

        return {
          ...t,
          guidedChecklist: checklist,
          status: newStatus
        };
      }
      return t;
    });
    this.saveTasks(updated);
    return updated;
  },

  postponeTask(taskId: string, newDate: string, reason: string): Task[] {
    const tasks = this.getTasks();
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const history = t.postponementHistory || [];
        history.push({
          fromDate: t.scheduledDate,
          toDate: newDate,
          reason,
          timestamp: new Date().toISOString()
        });
        return {
          ...t,
          scheduledDate: newDate,
          postponementReason: reason,
          postponementHistory: history,
        };
      }
      return t;
    });
    this.saveTasks(updated);
    this.addAuditLog('task_postponed', `Задача ${taskId} перенесена на ${newDate}. Причина: ${reason}`);
    return updated;
  },

  // --- DEALS (CRM) ---
  // Real mode returns only real deals (isDemo: false).
  // Sandbox mode can show demo deals.
  getDeals(includeDemo: boolean = false): Deal[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEALS);
      if (!stored) {
        // Pure start: 0 real deals
        const initialDeals: Deal[] = [
          // Demo sandbox deal (isolated)
          {
            id: "deal-sandbox-demo-01",
            companyName: "Студия массажа «Relax Атырау» (Учебный пример)",
            industry: "Массаж / СПА",
            city: "Атырау",
            contactPerson: "Айнагуль (Управляющая)",
            phoneOrWa: "+7 775 000 00 11 (Демо)",
            consentSource: "Учебный сценарий",
            consentDate: "2026-10-27",
            stage: "trial",
            owner: "founder",
            planName: "Старт (9 900 ₸)",
            amountKZT: 9900,
            setupCostKZT: 0,
            monthlyRevenueKZT: 9900,
            notes: "Учебная карточка для проверки воронки. Не учитывается в реальной выручке.",
            nextActionDate: "2026-10-30",
            nextActionText: "Провести повторный разбор сценария записи",
            createdAt: "2026-10-27T10:00:00Z",
            updatedAt: "2026-10-28T09:00:00Z",
            isDemo: true
          }
        ];
        localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(initialDeals));
        return includeDemo ? initialDeals : [];
      }
      const parsed: Deal[] = JSON.parse(stored);
      // Clean legacy fake deal `deal-pilot-01`
      const cleaned = parsed.map(d => {
        if (d.id === 'deal-pilot-01') {
          return { ...d, isDemo: true, companyName: d.companyName + ' (Демо)' };
        }
        return d;
      });
      return includeDemo ? cleaned : cleaned.filter(d => !d.isDemo);
    } catch (e) {
      console.error("Error reading deals:", e);
      return [];
    }
  },

  saveDeals(deals: Deal[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
    } catch (e) {
      console.error("Error saving deals:", e);
    }
  },

  addDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Deal[] {
    const deals = this.getDeals(true);
    const newDeal: Deal = {
      ...deal,
      id: `deal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newDeal, ...deals];
    this.saveDeals(updated);
    this.addAuditLog('deal_created', `Создана сделка: ${deal.companyName} (${deal.isDemo ? 'Демо' : 'Реальная'})`);
    return updated;
  },

  updateDeal(dealId: string, updates: Partial<Deal>): Deal[] {
    const deals = this.getDeals(true);
    const updated = deals.map(d => {
      if (d.id === dealId) {
        return { ...d, ...updates, updatedAt: new Date().toISOString() };
      }
      return d;
    });
    this.saveDeals(updated);
    this.addAuditLog('deal_updated', `Сделка ${dealId} обновлена`);
    return updated;
  },

  deleteDeal(dealId: string): Deal[] {
    const deals = this.getDeals(true);
    const updated = deals.filter(d => d.id !== dealId);
    this.saveDeals(updated);
    this.addAuditLog('deal_deleted', `Удалена сделка ${dealId}`);
    return updated;
  },

  // --- EVENTS ---
  getEvents(): EventItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
        return INITIAL_EVENTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_EVENTS;
    }
  },

  saveEvents(events: EventItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error("Error saving events:", e);
    }
  },

  updateEvent(eventId: string, updates: Partial<EventItem>): EventItem[] {
    const events = this.getEvents();
    const updated = events.map(e => {
      if (e.id === eventId) {
        return { ...e, ...updates, updatedAt: new Date().toISOString().slice(0, 10) };
      }
      return e;
    });
    this.saveEvents(updated);
    return updated;
  },

  addEvent(event: Omit<EventItem, 'id' | 'updatedAt'>): EventItem[] {
    const events = this.getEvents();
    const newEvent: EventItem = {
      ...event,
      id: `evt-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    const updated = [newEvent, ...events];
    this.saveEvents(updated);
    return updated;
  },

  // --- PARTNERS ---
  getPartners(includeDemo: boolean = false): Partner[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      if (!stored) {
        const demoPartners: Partner[] = [
          {
            id: "partner-demo-1",
            name: "SMM / Таргет Атырау (Учебный пример)",
            category: "SMM / Таргетологи",
            contactName: "Исследовательский профиль",
            phone: "+7 701 000 00 01 (Демо)",
            status: "contacted",
            referralCode: "ATYRAU_SMM_DEMO",
            agreedCommissionFixedKZT: 10000,
            referredDealsCount: 0,
            paidDealsCount: 0,
            totalCommissionPaidKZT: 0,
            pendingCommissionKZT: 0,
            notes: "Учебный пример для отработки скрипта партнёрского соглашения.",
            isDemo: true
          }
        ];
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(demoPartners));
        return includeDemo ? demoPartners : [];
      }
      const parsed: Partner[] = JSON.parse(stored);
      return includeDemo ? parsed : parsed.filter(p => !p.isDemo);
    } catch {
      return [];
    }
  },

  savePartners(partners: Partner[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
    } catch (e) {
      console.error("Error saving partners:", e);
    }
  },

  addPartner(partner: Omit<Partner, 'id'>): Partner[] {
    const partners = this.getPartners(true);
    const newPartner: Partner = {
      ...partner,
      id: `partner-${Date.now()}`
    };
    const updated = [newPartner, ...partners];
    this.savePartners(updated);
    return updated;
  },

  updatePartner(partnerId: string, updates: Partial<Partner>): Partner[] {
    const partners = this.getPartners(true);
    const updated = partners.map(p => p.id === partnerId ? { ...p, ...updates } : p);
    this.savePartners(updated);
    return updated;
  },

  // --- SALES AGENTS ---
  getAgents(includeDemo: boolean = false): SalesAgent[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AGENTS);
      if (!stored) {
        const demoAgents: SalesAgent[] = [
          {
            id: "agent-demo-1",
            fullName: "Кандидат в торговые (Учебный профиль)",
            phone: "+7 705 000 00 03 (Демо)",
            status: "applicant",
            area: "Атырау, мкр. Авангард",
            trainingsCompleted: false,
            fieldVisitsCount: 0,
            demosQualifiedCount: 0,
            paidClientsCount: 0,
            earnedBonusesKZT: 0,
            pendingApprovalBonusesKZT: 0,
            notes: "Демонстрационная анкета для тестирования воронки отбора агентов.",
            isDemo: true
          }
        ];
        localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(demoAgents));
        return includeDemo ? demoAgents : [];
      }
      const parsed: SalesAgent[] = JSON.parse(stored);
      return includeDemo ? parsed : parsed.filter(a => !a.isDemo);
    } catch {
      return [];
    }
  },

  saveAgents(agents: SalesAgent[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
    } catch (e) {
      console.error("Error saving agents:", e);
    }
  },

  addAgent(agent: Omit<SalesAgent, 'id'>): SalesAgent[] {
    const agents = this.getAgents(true);
    const newAgent: SalesAgent = { ...agent, id: `agent-${Date.now()}` };
    const updated = [newAgent, ...agents];
    this.saveAgents(updated);
    return updated;
  },

  updateAgent(agentId: string, updates: Partial<SalesAgent>): SalesAgent[] {
    const agents = this.getAgents(true);
    const updated = agents.map(a => a.id === agentId ? { ...a, ...updates } : a);
    this.saveAgents(updated);
    return updated;
  },

  // --- EXPENSES ---
  getExpenses(): ExpenseItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  saveExpenses(expenses: ExpenseItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error("Error saving expenses:", e);
    }
  },

  addExpense(expense: Omit<ExpenseItem, 'id'>): ExpenseItem[] {
    const expenses = this.getExpenses();
    const newExpense: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now()}`
    };
    const updated = [newExpense, ...expenses];
    this.saveExpenses(updated);
    this.addAuditLog('expense_created', `Добавлен расход: ${expense.amountKZT} ₸ (${expense.category})`);
    return updated;
  },

  // --- PLAYBOOKS & KNOWLEDGE ---
  getPlaybooks(): PlaybookSection[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYBOOKS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PLAYBOOKS, JSON.stringify(INITIAL_PLAYBOOKS));
        return INITIAL_PLAYBOOKS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_PLAYBOOKS;
    }
  },

  savePlaybooks(playbooks: PlaybookSection[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYBOOKS, JSON.stringify(playbooks));
    } catch (e) {
      console.error("Error saving playbooks:", e);
    }
  },

  updatePlaybook(id: string, markdownContent: string): PlaybookSection[] {
    const playbooks = this.getPlaybooks();
    const updated = playbooks.map(p => p.id === id ? { ...p, markdownContent, lastEdited: new Date().toISOString().slice(0, 10) } : p);
    this.savePlaybooks(updated);
    return updated;
  },

  // --- LEGAL & RISKS ---
  getLegalTemplates(): LegalTemplate[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEGAL_TEMPLATES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.LEGAL_TEMPLATES, JSON.stringify(INITIAL_LEGAL_TEMPLATES));
        return INITIAL_LEGAL_TEMPLATES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_LEGAL_TEMPLATES;
    }
  },

  saveLegalTemplates(templates: LegalTemplate[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LEGAL_TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.error("Error saving legal templates:", e);
    }
  },

  updateLegalTemplate(templateId: string, contentOrUpdates: string | Partial<LegalTemplate>): LegalTemplate[] {
    const templates = this.getLegalTemplates();
    const updates = typeof contentOrUpdates === 'string' ? { content: contentOrUpdates } : contentOrUpdates;
    const updated = templates.map(t => t.id === templateId ? { ...t, ...updates, lastUpdated: new Date().toISOString().slice(0, 10) } : t);
    this.saveLegalTemplates(updated);
    return updated;
  },

  getRisks(): RiskItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RISKS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(INITIAL_RISKS));
        return INITIAL_RISKS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_RISKS;
    }
  },

  saveRisks(risks: RiskItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(risks));
    } catch (e) {
      console.error("Error saving risks:", e);
    }
  },

  // --- SETTINGS ---
  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) {
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>) {
    try {
      const current = this.getSettings();
      const merged = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  },

  // --- AUDIT LOGS ---
  getAuditLogs(): Array<{ id: string; action: string; details: string; timestamp: string }> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  addAuditLog(action: string, details: string) {
    try {
      const logs = this.getAuditLogs();
      const newLog = {
        id: `log-${Date.now()}`,
        action,
        details,
        timestamp: new Date().toISOString()
      };
      const updated = [newLog, ...logs.slice(0, 99)]; // keep 100 recent
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    } catch (e) {
      console.error("Error writing audit log:", e);
    }
  }
};
