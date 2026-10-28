import { StrategicProject } from "../types";

export const STRATEGIC_PROJECTS: StrategicProject[] = [
  {
    id: "p-ads",
    name: "Таргет Instagram / Meta Ads",
    shortName: "Таргет",
    category: "Продвижение",
    description: "Проверка гипотез, креативов и заявок без автоматического списания бюджета.",
    colorTone: "#508dff",
    projectIds: ["ads", "content"],
    primaryOwner: "founder",
    icon: "Megaphone"
  },
  {
    id: "p-hub",
    name: "Atyrau Hub & Astana Hub",
    shortName: "Hub",
    category: "Экосистема",
    description: "Взаимодействие с региональным хабом, согласование практических мастер-классов.",
    colorTone: "#31c9a6",
    projectIds: ["hub", "residency"],
    primaryOwner: "both",
    icon: "Building2"
  },
  {
    id: "p-atameken-damu",
    name: "НПП Атамекен и Фонд Даму",
    shortName: "Атамекен/Даму",
    category: "Госпрограммы",
    description: "Выход на отраслевые комитеты предпринимателей Атырауской области через официальные контакты.",
    colorTone: "#f6c365",
    projectIds: ["atameken", "damu"],
    primaryOwner: "operations",
    icon: "Landmark"
  },
  {
    id: "p-partners",
    name: "Партнёрская сеть",
    shortName: "Партнёры",
    category: "Дистрибуция",
    description: "SMM-специалисты, 1С-интеграторы и кассовые центры Западного Казахстана.",
    colorTone: "#9c84ff",
    projectIds: ["partners"],
    primaryOwner: "operations",
    icon: "Handshake"
  },
  {
    id: "p-agents",
    name: "Торговые представители",
    shortName: "Торговые",
    category: "Прямые продажи",
    description: "Полевые визиты в торговые точки, салоны и сервисы Атырау по скриптам.",
    colorTone: "#fa7b8d",
    projectIds: ["agents"],
    primaryOwner: "operations",
    icon: "Users"
  },
  {
    id: "p-brand",
    name: "Локальная известность & PR",
    shortName: "PR / Бренд",
    category: "Репутация",
    description: "Узнаваемость среди предпринимателей Атырау, кейсы внедрений, обзоры.",
    colorTone: "#508dff",
    projectIds: ["brand", "research"],
    primaryOwner: "founder",
    icon: "Award"
  },
  {
    id: "p-crm-clients",
    name: "Клиенты, CRM и отзывы",
    shortName: "Клиенты/CRM",
    category: "Продажи",
    description: "Только реальные лиды, демонстрации, триалы и подтверждённые оплаты в тенге.",
    colorTone: "#31c9a6",
    projectIds: ["crm", "sales", "retention", "review"],
    primaryOwner: "both",
    icon: "UserCheck"
  },
  {
    id: "p-company-legal",
    name: "Компания, договоры и бренд",
    shortName: "Компания/Право",
    category: "Юриспруденция",
    description: "Защита персональных данных в РК, оферта SaaS, регистрация товарного знака в Qazpatent.",
    colorTone: "#9c84ff",
    projectIds: ["contracts", "brand_rights", "legal", "privacy", "accounting"],
    primaryOwner: "both",
    icon: "ShieldCheck"
  },
  {
    id: "p-product-eng",
    name: "Product Engineering",
    shortName: "Продукт",
    category: "Разработка",
    description: "Стабильность WhatsApp-коннекторов, WebKassa, интеграции 1С, отказоустойчивость.",
    colorTone: "#508dff",
    projectIds: ["product", "product_quality"],
    primaryOwner: "founder",
    icon: "Cpu"
  },
  {
    id: "p-finance-hosting",
    name: "Финансы, Kaspi и Хостинг",
    shortName: "Финансы/IT",
    category: "Инфраструктура",
    description: "Подключение Kaspi Pay для бизнеса, серверная инфраструктура в РК, учет расходов.",
    colorTone: "#f6c365",
    projectIds: ["finance", "hosting", "payments"],
    primaryOwner: "both",
    icon: "Wallet"
  },
  {
    id: "p-cities",
    name: "Масштабирование в города KZ",
    shortName: "Города KZ",
    category: "Масштаб",
    description: "Актау, Актобе, Уральск, Шымкент, Астана, Алматы — перенос успешной модели Атырау.",
    colorTone: "#fa7b8d",
    projectIds: ["cities"],
    primaryOwner: "founder",
    icon: "MapPin"
  },
  {
    id: "p-routine",
    name: "Операционный ритм и фокус",
    shortName: "Ритм/Фокус",
    category: "Управление",
    description: "Ежедневные 90/35 минутные слоты, разборы недели, отдых в выходные дни.",
    colorTone: "#8590a3",
    projectIds: ["routine"],
    primaryOwner: "both",
    icon: "CalendarCheck"
  }
];

export function getProjectByTaskId(projectId: string): StrategicProject {
  const found = STRATEGIC_PROJECTS.find(p => p.projectIds.includes(projectId));
  if (found) return found;
  return STRATEGIC_PROJECTS[STRATEGIC_PROJECTS.length - 1]; // fallback to routine
}
