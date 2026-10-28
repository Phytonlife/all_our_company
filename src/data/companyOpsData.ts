import { RiskItem } from "../types";

export interface TaxRegimeComparison {
  regimeId: 'atyrau_snr_2' | 'standard_snr_3' | 'astana_hub';
  name: string;
  tagline: string;
  taxRateDescription: string;
  corpIncomeTaxPercent: number; // КПН
  personalIncomeTaxPercent: number; // ИПН
  vatPercent: number; // НДС
  socialTaxPercent: number; // Соцналог
  hubTechnoparkFeePercent: number; // Сбор в технопарк
  revenueLimitAnnualKZT: number;
  eligibilityNotes: string;
}

export const TAX_REGIMES: TaxRegimeComparison[] = [
  {
    regimeId: 'atyrau_snr_2',
    name: 'СНР «Упрощенка 2%» (Атырау)',
    tagline: 'При подтверждении решения маслихата г. Атырау',
    taxRateDescription: '2% от валового дохода (вместо базовых 3–4%)',
    corpIncomeTaxPercent: 1.0,
    personalIncomeTaxPercent: 1.0,
    vatPercent: 0,
    socialTaxPercent: 0,
    hubTechnoparkFeePercent: 0,
    revenueLimitAnnualKZT: 177400440, // 24 038 МРП в полугодие (~354 млн в год)
    eligibilityNotes: 'Требуется проверка действующего решения маслихата г. Атырау о снижении ставки для ОКЭД 62.01/58.29. До подтверждения ориентироваться на 3%.'
  },
  {
    regimeId: 'standard_snr_3',
    name: 'СНР «Упрощенка 3%» (Базовый РК)',
    tagline: 'Общереспубликанский режим для малого бизнеса',
    taxRateDescription: '3% от валового дохода (1.5% КПН/ИПН + 1.5% соцналог)',
    corpIncomeTaxPercent: 1.5,
    personalIncomeTaxPercent: 1.5,
    vatPercent: 0,
    socialTaxPercent: 0,
    hubTechnoparkFeePercent: 0,
    revenueLimitAnnualKZT: 177400440,
    eligibilityNotes: 'Стандартный гарантированный режим для ИП и ТОО малого бизнеса с численностью сотрудников до 30 человек.'
  },
  {
    regimeId: 'astana_hub',
    name: 'Режим участника Astana Hub',
    tagline: 'Максимальные налоговые льготы технопарка',
    taxRateDescription: '0% КПН, 0% ИПН, 0% НДС, 0% соцналог + 1% сбор в технопарк',
    corpIncomeTaxPercent: 0,
    personalIncomeTaxPercent: 0,
    vatPercent: 0,
    socialTaxPercent: 0,
    hubTechnoparkFeePercent: 1.0, // 1% квартальный сбор от доходов
    revenueLimitAnnualKZT: 10000000000, // Без жесткого порога малого бизнеса
    eligibilityNotes: 'Требуется прохождение комиссии Astana Hub по перечню ПВД (разработка SaaS). Экстерриториальный принцип: можно работать находясь в Атырау!'
  }
];

export interface ComplianceObligation {
  id: string;
  title: string;
  authority: string;
  formName: string;
  deadlineRule: string;
  nextDeadline: string;
  recurrence: 'Ежемесячно' | 'Полугодие' | 'Ежегодно';
  description: string;
  status: 'pending' | 'completed';
}

export const COMPLIANCE_OBLIGATIONS: ComplianceObligation[] = [
  {
    id: "comp-1",
    title: "Уплата соцплатежей за сотрудников (ОПВ, ВОСМС, СО)",
    authority: "КГД МФ РК / НАО ГК «Правительство для граждан»",
    formName: "Платежное поручение",
    deadlineRule: "До 25-го числа месяца, следующего за отчетным",
    nextDeadline: "2026-11-25",
    recurrence: "Ежемесячно",
    description: "Перечисление обязательных пенсионных взносов, соцотчислений и медстрахования по начисленным зарплатам.",
    status: "pending"
  },
  {
    id: "comp-2",
    title: "Сдача налоговой декларации ф. 910.00 за II полугодие",
    authority: "УГД по г. Атырау (налоговая)",
    formName: "Форма 910.00 (Упрощенная декларация)",
    deadlineRule: "До 15 февраля года, следующего за отчетным",
    nextDeadline: "2027-02-15",
    recurrence: "Полугодие",
    description: "Декларирование полученного дохода за период с 1 июля по 31 декабря и исчисление 2% или 3% налога.",
    status: "pending"
  },
  {
    id: "comp-3",
    title: "Уплата налогов по декларации ф. 910.00 за II полугодие",
    authority: "УГД по г. Атырау",
    formName: "КБК 101111 / 103101",
    deadlineRule: "До 25 февраля года, следующего за отчетным",
    nextDeadline: "2027-02-25",
    recurrence: "Полугодие",
    description: "Уплата исчисленной суммы корпоративного подоходного налога / ИПН и социального налога.",
    status: "pending"
  },
  {
    id: "comp-4",
    title: "Продление сертификатов ЭЦП НУЦ РК",
    authority: "Национальный удостоверяющий центр РК (pki.gov.kz)",
    formName: "ЭЦП первого руководителя",
    deadlineRule: "За 10 дней до окончания 1-летнего срока действия",
    nextDeadline: "2027-10-15",
    recurrence: "Ежегодно",
    description: "Контроль срока действия электронных ключей RSA/GOST для недопущения остановки электронного документооборота.",
    status: "pending"
  },
  {
    id: "comp-5",
    title: "Квартальный отчёт резидента Astana Hub (при получении статуса)",
    authority: "Международный технопарк IT-стартапов «Astana Hub»",
    formName: "Форма мониторинга деятельности",
    deadlineRule: "До 25-го числа месяца, следующего за кварталом",
    nextDeadline: "2027-01-25",
    recurrence: "Ежемесячно",
    description: "Отчетность по доходам от приоритетных видов деятельности и уплата 1% сбора.",
    status: "pending"
  }
];

export const INITIAL_RISKS: RiskItem[] = [
  {
    id: "risk-1",
    title: "Блокировка WhatsApp-номера из-за жалоб на спам",
    category: "Технические / WhatsApp",
    probability: "Средняя",
    impact: "Критический",
    mitigationStrategy: "Только opt-in коммуникация, ограничение скорости отправки до 1 сообщения в 3 сек, использование официальных Meta Templates, наличие резервного номера.",
    status: "Контролируется",
    owner: "founder"
  },
  {
    id: "risk-2",
    title: "Претензии регулятора по ст. 12 Закона РК (хранение ПДн вне РК)",
    category: "Правовые",
    probability: "Низкая",
    impact: "Высокий",
    mitigationStrategy: "Размещение продакшн баз данных в казахстанском ЦОД (PS.kz / Servercore KZ), хранение подписанных согласий на обработку ПДн.",
    status: "Контролируется",
    owner: "founder"
  },
  {
    id: "risk-3",
    title: "Отрицательная юнит-экономика при выплате высоких реферальных комиссий",
    category: "Финансовые",
    probability: "Средняя",
    impact: "Высокий",
    mitigationStrategy: "Привязка выплат комиссии только к подтвержденным платежам с проверкой валовой маржи через калькулятор в Growth OS.",
    status: "Контролируется",
    owner: "operations"
  },
  {
    id: "risk-4",
    title: "Галлюцинации AI в чатах (выдумывание скидок и неверных цен)",
    category: "Репутационные",
    probability: "Средняя",
    impact: "Высокий",
    mitigationStrategy: "Строгие Guardrails в системном промпте: при отсутствии точной цены бот обязан переводить диалог на оператора, регрессионное тестирование промптов.",
    status: "Активен",
    owner: "founder"
  },
  {
    id: "risk-5",
    title: "Отказ в регистрации товарного знака в Казпатенте по сходству",
    category: "Правовые",
    probability: "Низкая",
    impact: "Средний",
    mitigationStrategy: "Проведение предварительного поиска по базе Qazpatent до подачи заявки, подача комбинированного знака с уникальной графикой.",
    status: "Контролируется",
    owner: "operations"
  },
  {
    id: "risk-6",
    title: "Превышение лимита дохода по СНР (24 038 МРП) без своевременного перехода на НДС",
    category: "Налоговые",
    probability: "Низкая",
    impact: "Критический",
    mitigationStrategy: "Автоматический мониторинг накопленной выручки в модуле Финансы, превентивная подготовка перехода в Astana Hub.",
    status: "Контролируется",
    owner: "founder"
  },
  {
    id: "risk-7",
    title: "Сбои в работе фискализации Kaspi Касса / WebKassa",
    category: "Налоговые",
    probability: "Средняя",
    impact: "Средний",
    mitigationStrategy: "Еженедельная сверка z-отчетов ККМ с выпиской Kaspi Pay, резервный ручной чек в кабинете ОФД.",
    status: "Контролируется",
    owner: "operations"
  },
  {
    id: "risk-8",
    title: "Преждевременное масштабирование во второй город без готовой команды",
    category: "Репутационные",
    probability: "Низкая",
    impact: "Высокий",
    mitigationStrategy: "Соблюдение правила Readiness Gate: выход в Актау/Актобе только после 5+ платящих активных клиентов в Атырау с доказанной окупаемостью.",
    status: "Контролируется",
    owner: "founder"
  }
];
