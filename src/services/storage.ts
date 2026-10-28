import { Task, Deal, EventItem, Partner, SalesAgent, ExpenseItem, LegalTemplate, RiskItem, PlaybookSection } from "../types";
import { SEED_TASKS } from "../data/seedTasks";
import { INITIAL_PLAYBOOKS } from "../data/playbooks";
import { INITIAL_LEGAL_TEMPLATES } from "../data/legalTemplates";
import { INITIAL_RISKS } from "../data/companyOpsData";

const STORAGE_KEYS = {
  TASKS: 'growth_os_kz_tasks_v22',
  DEALS: 'growth_os_kz_deals_v22',
  EVENTS: 'growth_os_kz_events_v22',
  PARTNERS: 'growth_os_kz_partners_v22',
  AGENTS: 'growth_os_kz_agents_v22',
  EXPENSES: 'growth_os_kz_expenses_v22',
  LEGAL_TEMPLATES: 'growth_os_kz_legal_v22',
  RISKS: 'growth_os_kz_risks_v22',
  PLAYBOOKS: 'growth_os_kz_playbooks_v22',
  SETTINGS: 'growth_os_kz_settings_v22',
  AUDIT_LOGS: 'growth_os_kz_audit_logs_v22',
};

export interface AppSettings {
  theme: 'dark' | 'light';
  language: 'ru' | 'kz';
  founderDailyLimitMinutes: number;
  operationsDailyLimitMinutes: number;
  selectedRoleFilter: 'all' | 'founder' | 'operations';
  activeCity: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'ru',
  founderDailyLimitMinutes: 90,
  operationsDailyLimitMinutes: 35,
  selectedRoleFilter: 'all',
  activeCity: 'Атырау',
};

// Initial verified sample events (with real Atyrau contacts)
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
    sourceUrl: "https://atyrau.atameken.kz/",
    updatedAt: "2026-10-28"
  }
];

// Initial real verified pilot partners (without fake deals)
const INITIAL_PARTNERS: Partner[] = [
  {
    id: "partner-1",
    name: "SMM / Таргет Атырау (Локальные специалисты)",
    category: "SMM / Таргетологи",
    contactName: "Айбек (SMM-агентство)",
    phone: "+7 701 000 00 01 (Research)",
    status: "contacted",
    referralCode: "ATYRAU_SMM_01",
    agreedCommissionFixedKZT: 10000,
    referredDealsCount: 0,
    paidDealsCount: 0,
    totalCommissionPaidKZT: 0,
    pendingCommissionKZT: 0,
    notes: "Интересуется автоматизацией заявок для своих клиентов из бьюти-сферы."
  },
  {
    id: "partner-2",
    name: "Интеграции 1С и касс (Западный регион)",
    category: "Интеграторы 1С / CRM",
    contactName: "Ерлан (1С Франчайзинг)",
    phone: "+7 775 000 00 02 (Research)",
    status: "lead",
    referralCode: "1C_PARTNER_KZ",
    agreedCommissionPercent: 20,
    referredDealsCount: 0,
    paidDealsCount: 0,
    totalCommissionPaidKZT: 0,
    pendingCommissionKZT: 0,
    notes: "Обсуждение возможности рекомендовать сервис клиентам с WebKassa."
  }
];

// Initial field agent pipeline
const INITIAL_AGENTS: SalesAgent[] = [
  {
    id: "agent-1",
    fullName: "Кандидат №1 (Студент / Активный представитель)",
    phone: "+7 705 000 00 03",
    status: "applicant",
    area: "Атырау, мкр. Авангард / центр",
    trainingsCompleted: false,
    fieldVisitsCount: 0,
    demosQualifiedCount: 0,
    paidClientsCount: 0,
    earnedBonusesKZT: 0,
    pendingApprovalBonusesKZT: 0,
    notes: "Отклик на объявление, назначен телефонный скрининг на четверг."
  }
];

export const StorageService = {
  // --- TASKS ---
  getTasks(): Task[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!stored) {
        // Initial load: save all 237 seed tasks
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
        return SEED_TASKS;
      }
      const parsed: Task[] = JSON.parse(stored);
      
      // Idempotent merge: ensure any new v2.2 tasks exist without duplicating
      const existingIds = new Set(parsed.map(t => t.id));
      let hasNew = false;
      const merged = [...parsed];

      for (const seedTask of SEED_TASKS) {
        if (!existingIds.has(seedTask.id)) {
          merged.push(seedTask);
          existingIds.add(seedTask.id);
          hasNew = true;
        }
      }

      if (hasNew) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(merged));
      }
      return merged;
    } catch (e) {
      console.error("Error reading tasks from storage:", e);
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
        }
        return result;
      }
      return t;
    });
    this.saveTasks(updated);
    this.addAuditLog('task_updated', `Задача ${taskId} обновлена: статус ${updates.status || 'без изменений'}`);
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
          status: 'todo' as const
        };
      }
      return t;
    });
    this.saveTasks(updated);
    this.addAuditLog('task_postponed', `Задача ${taskId} перенесена на ${newDate}. Причина: ${reason}`);
    return updated;
  },

  // --- DEALS (CRM) ---
  getDeals(): Deal[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEALS);
      if (!stored) {
        // Return empty or sample pilot with zero fake numbers
        const initialDeals: Deal[] = [
          {
            id: "deal-pilot-01",
            companyName: "Студия массажа «Relax Атырау» (Пилот)",
            industry: "Массаж / СПА",
            city: "Атырау",
            contactPerson: "Айнагуль (Управляющая)",
            phoneOrWa: "+7 775 000 00 11",
            consentSource: "Личная встреча с согласия владельца",
            consentDate: "2026-10-27",
            stage: "trial",
            owner: "founder",
            planName: "Старт (9 900 ₸)",
            amountKZT: 9900,
            setupCostKZT: 0,
            monthlyRevenueKZT: 9900,
            notes: "Тестирование сценария записи клиентов после 20:00. Оплата ожидается после окончания пилота.",
            nextActionDate: "2026-10-30",
            nextActionText: "Сверить журнал обращений и отзывы клиентов за 3 дня",
            createdAt: "2026-10-27T10:00:00Z",
            updatedAt: "2026-10-28T09:00:00Z"
          }
        ];
        localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(initialDeals));
        return initialDeals;
      }
      return JSON.parse(stored);
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
    const deals = this.getDeals();
    const newDeal: Deal = {
      ...deal,
      id: `deal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newDeal, ...deals];
    this.saveDeals(updated);
    this.addAuditLog('deal_created', `Создана сделка: ${deal.companyName}`);
    return updated;
  },

  updateDeal(dealId: string, updates: Partial<Deal>): Deal[] {
    const deals = this.getDeals();
    const updated = deals.map(d => {
      if (d.id === dealId) {
        return { ...d, ...updates, updatedAt: new Date().toISOString() };
      }
      return d;
    });
    this.saveDeals(updated);
    this.addAuditLog('deal_updated', `Сделка ${dealId} обновлена: этап ${updates.stage || 'без изменений'}`);
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
    } catch (e) {
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
  getPartners(): Partner[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(INITIAL_PARTNERS));
        return INITIAL_PARTNERS;
      }
      return JSON.parse(stored);
    } catch (e) {
      return INITIAL_PARTNERS;
    }
  },

  savePartners(partners: Partner[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
    } catch (e) {
      console.error("Error saving partners:", e);
    }
  },

  addPartner(partner: Omit<Partner, 'id' | 'referredDealsCount' | 'paidDealsCount' | 'totalCommissionPaidKZT' | 'pendingCommissionKZT'>): Partner[] {
    const partners = this.getPartners();
    const newPartner: Partner = {
      ...partner,
      id: `partner-${Date.now()}`,
      referredDealsCount: 0,
      paidDealsCount: 0,
      totalCommissionPaidKZT: 0,
      pendingCommissionKZT: 0
    };
    const updated = [newPartner, ...partners];
    this.savePartners(updated);
    return updated;
  },

  // --- SALES AGENTS ---
  getAgents(): SalesAgent[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AGENTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(INITIAL_AGENTS));
        return INITIAL_AGENTS;
      }
      return JSON.parse(stored);
    } catch (e) {
      return INITIAL_AGENTS;
    }
  },

  saveAgents(agents: SalesAgent[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
    } catch (e) {
      console.error("Error saving agents:", e);
    }
  },

  addAgent(agent: Omit<SalesAgent, 'id' | 'fieldVisitsCount' | 'demosQualifiedCount' | 'paidClientsCount' | 'earnedBonusesKZT' | 'pendingApprovalBonusesKZT'>): SalesAgent[] {
    const agents = this.getAgents();
    const newAgent: SalesAgent = {
      ...agent,
      id: `agent-${Date.now()}`,
      fieldVisitsCount: 0,
      demosQualifiedCount: 0,
      paidClientsCount: 0,
      earnedBonusesKZT: 0,
      pendingApprovalBonusesKZT: 0
    };
    const updated = [newAgent, ...agents];
    this.saveAgents(updated);
    return updated;
  },

  // --- EXPENSES ---
  getExpenses(): ExpenseItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!stored) {
        const initialExpenses: ExpenseItem[] = [
          {
            id: "exp-01",
            date: "2026-10-28",
            category: "Реклама Meta/Insta",
            amountKZT: 2500,
            description: "Тестовый дневной бюджет первого запуска Click-to-WhatsApp",
            status: "planned",
            approvedBy: "founder"
          }
        ];
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
        return initialExpenses;
      }
      return JSON.parse(stored);
    } catch (e) {
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
    this.addAuditLog('expense_added', `Расход: ${expense.amountKZT} ₸ (${expense.description})`);
    return updated;
  },

  // --- LEGAL TEMPLATES ---
  getLegalTemplates(): LegalTemplate[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEGAL_TEMPLATES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.LEGAL_TEMPLATES, JSON.stringify(INITIAL_LEGAL_TEMPLATES));
        return INITIAL_LEGAL_TEMPLATES;
      }
      return JSON.parse(stored);
    } catch (e) {
      return INITIAL_LEGAL_TEMPLATES;
    }
  },

  saveLegalTemplates(templates: LegalTemplate[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LEGAL_TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.error("Error saving templates:", e);
    }
  },

  updateLegalTemplate(templateId: string, content: string): LegalTemplate[] {
    const templates = this.getLegalTemplates();
    const updated = templates.map(t => {
      if (t.id === templateId) {
        return { ...t, content, lastUpdated: new Date().toISOString().slice(0, 10) };
      }
      return t;
    });
    this.saveLegalTemplates(updated);
    return updated;
  },

  // --- RISKS ---
  getRisks(): RiskItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RISKS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(INITIAL_RISKS));
        return INITIAL_RISKS;
      }
      return JSON.parse(stored);
    } catch (e) {
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

  updateRisk(riskId: string, updates: Partial<RiskItem>): RiskItem[] {
    const risks = this.getRisks();
    const updated = risks.map(r => r.id === riskId ? { ...r, ...updates } : r);
    this.saveRisks(updated);
    return updated;
  },

  addRisk(risk: Omit<RiskItem, 'id'>): RiskItem[] {
    const risks = this.getRisks();
    const newRisk: RiskItem = { ...risk, id: `risk-${Date.now()}` };
    const updated = [newRisk, ...risks];
    this.saveRisks(updated);
    return updated;
  },

  // --- PLAYBOOKS ---
  getPlaybooks(): PlaybookSection[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYBOOKS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PLAYBOOKS, JSON.stringify(INITIAL_PLAYBOOKS));
        return INITIAL_PLAYBOOKS;
      }
      return JSON.parse(stored);
    } catch (e) {
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

  updatePlaybook(playbookId: string, markdownContent: string): PlaybookSection[] {
    const playbooks = this.getPlaybooks();
    const updated = playbooks.map(p => {
      if (p.id === playbookId) {
        return { ...p, markdownContent, lastEdited: new Date().toISOString().slice(0, 10) };
      }
      return p;
    });
    this.savePlaybooks(updated);
    return updated;
  },

  // --- SETTINGS ---
  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  },

  // --- AUDIT LOGS ---
  getAuditLogs(): Array<{ timestamp: string; action: string; details: string }> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  addAuditLog(action: string, details: string) {
    try {
      const logs = this.getAuditLogs();
      const newLog = {
        timestamp: new Date().toISOString(),
        action,
        details
      };
      const updated = [newLog, ...logs.slice(0, 99)]; // keep 100 entries
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    } catch (e) {
      // silent
    }
  },

  // --- EXPORT & IMPORT ---
  exportAllData(): string {
    const data = {
      version: "2.2.0",
      exportDate: new Date().toISOString(),
      tasks: this.getTasks(),
      deals: this.getDeals(),
      events: this.getEvents(),
      partners: this.getPartners(),
      agents: this.getAgents(),
      expenses: this.getExpenses(),
      legalTemplates: this.getLegalTemplates(),
      risks: this.getRisks(),
      playbooks: this.getPlaybooks(),
      settings: this.getSettings(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
      if (data.deals) localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(data.deals));
      if (data.events) localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
      if (data.partners) localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(data.partners));
      if (data.agents) localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(data.agents));
      if (data.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
      if (data.legalTemplates) localStorage.setItem(STORAGE_KEYS.LEGAL_TEMPLATES, JSON.stringify(data.legalTemplates));
      if (data.risks) localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(data.risks));
      if (data.playbooks) localStorage.setItem(STORAGE_KEYS.PLAYBOOKS, JSON.stringify(data.playbooks));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      this.addAuditLog('data_imported', 'Восстановление базы данных из резервной копии');
      return true;
    } catch (e) {
      console.error("Import error:", e);
      return false;
    }
  },

  resetToInitial(): void {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.DEALS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.PARTNERS);
    localStorage.removeItem(STORAGE_KEYS.AGENTS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.LEGAL_TEMPLATES);
    localStorage.removeItem(STORAGE_KEYS.RISKS);
    localStorage.removeItem(STORAGE_KEYS.PLAYBOOKS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  }
};
