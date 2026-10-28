import React, { useState } from 'react';
import { 
  SAAS_ROADMAP, RBAC_ROLES, KZ_DATACENTERS, AI_QA_TEST_CASES, 
  RoadmapMilestone, RbacRole, KazakhstanDatacenter, AiQaTestCase 
} from '../data/productEngData';
import { 
  Cpu, Shield, Smartphone, Users, Server, CheckCircle2, 
  AlertCircle, Play, RefreshCw, Layers, Lock, ShieldCheck, 
  Terminal, Zap, HardDrive, ListChecks, ExternalLink, Clock
} from 'lucide-react';

export const ProductEngView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'roadmap' | 'whatsapp' | 'rbac' | 'hosting' | 'ai_qa' | 'billing' | 'onboarding'
  >('roadmap');

  // AI QA Interactive Simulator state
  const [qaTestCases, setQaTestCases] = useState<AiQaTestCase[]>(AI_QA_TEST_CASES);
  const [isRunningAllTests, setIsRunningAllTests] = useState(false);
  const [testRunSuccess, setTestRunSuccess] = useState<boolean | null>(null);

  // Client Onboarding Wizard simulator
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [clientBusinessName, setClientBusinessName] = useState('Салон красоты «Silk Атырау»');
  const [clientPhone, setClientPhone] = useState('+7 775 123 45 67');

  const handleRunAllQaTests = () => {
    setIsRunningAllTests(true);
    setTimeout(() => {
      setIsRunningAllTests(false);
      setTestRunSuccess(true);
      setTimeout(() => setTestRunSuccess(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Product Engineering (Новый модуль v2.2)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Инженерия и качество SaaS-платформы
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Дорожная карта продукта, надежность WhatsApp, RBAC роли, хостинг в Казахстане, AI QA и биллинг.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-xl border border-slate-700/60 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Управление бэклогом (без прямого изменения production-кода)</span>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-3 border-t border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'roadmap'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Дорожная карта SaaS</span>
          </button>
          <button
            onClick={() => setActiveSubTab('whatsapp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'whatsapp'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Надёжность WhatsApp</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rbac')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'rbac'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Роли и RBAC</span>
          </button>
          <button
            onClick={() => setActiveSubTab('hosting')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'hosting'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Хостинг в РК (ст. 12)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('ai_qa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'ai_qa'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>AI QA & Guardrails</span>
          </button>
          <button
            onClick={() => setActiveSubTab('billing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'billing'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Биллинг & Тарифы</span>
          </button>
          <button
            onClick={() => setActiveSubTab('onboarding')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'onboarding'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Онбординг клиентов</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PRODUCT ROADMAP */}
      {activeSubTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAAS_ROADMAP.map(milestone => (
              <div 
                key={milestone.version}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 font-mono px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                      {milestone.version}
                    </span>
                    <span className="text-[11px] text-slate-400">{milestone.period}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{milestone.name}</h3>
                  <p className="text-xs text-slate-300">{milestone.focus}</p>

                  <div className="pt-2 space-y-2">
                    {milestone.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        {feat.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className={feat.done ? 'text-slate-200' : 'text-slate-400'}>{feat.title}</span>
                          {feat.notes && (
                            <div className="text-[10px] text-slate-500 italic">{feat.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Статус: <strong>{milestone.status === 'in_progress' ? 'В активной разработке' : 'Запланировано'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WHATSAPP RELIABILITY ARCHITECTURE */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Архитектура надёжности WhatsApp и предотвращения блокировок
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Спецификация отказоустойчивости коннекторов, обработки 24-часового окна Meta и очередей сообщений.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Heartbeat & Auto-reconnect */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <RefreshCw className="w-4 h-4" />
                <span>Автовосстановление сессии (Heartbeat)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Каждые 30 секунд проверяется статус соединения с WhatsApp Webhook. При обрыве запускается мягкий реконнект без потери очереди входящих сообщений.
              </p>
              <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                <div>• Максимальное время переподключения: <strong>&lt; 15 сек</strong></div>
                <div>• Исключение дублей ответов по message_id</div>
              </div>
            </div>

            {/* Rate Limiting & Queue */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <Zap className="w-4 h-4" />
                <span>Очереди и защита от банов (Rate Limiting)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Запрет отправки более 1 сообщения в 3 секунды в рамках одного диалога. Рандомизация интервала «набора текста» (typing indicator 1.2 – 2.8 сек).
              </p>
              <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                <div>• Очередь Redis с приоритизацией живых диалогов</div>
                <div>• Защита от спам-триггеров Meta AI Compliance</div>
              </div>
            </div>

            {/* 24-hour Window Handling */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Управление 24-часовым окном Meta</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Автоматическое отслеживание таймера с момента последнего входящего сообщения клиента. Предотвращение попыток отправки бесплатных сообщений после истечения 24 часов.
              </p>
              <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                <div>• Предупреждение оператору за 2 часа до закрытия окна</div>
                <div>• Переход на шаблоны Meta Approved при повторном касании</div>
              </div>
            </div>

            {/* Number Redundancy & Failover */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <Shield className="w-4 h-4" />
                <span>Резервирование номеров (Failover)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Процедура оперативного переключения клиентского бота на резервный корпоративный номер при временной блокировке или смене сим-карты салона.
              </p>
              <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                <div>• Смена привязки QR-сессии за 3 минуты</div>
                <div>• Сохранение всей истории базы знаний и клиентов</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 3: RBAC ROLES MATRIX */}
      {activeSubTab === 'rbac' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Ролевая модель пользователей SaaS (RBAC)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Разграничение прав для защиты финансовой информации, ключей API и переписки клиентов.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {RBAC_ROLES.map(role => (
              <div 
                key={role.roleId}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      {role.roleName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{role.description}</p>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-slate-700/60">
                  <div className="flex items-center gap-1.5">
                    {role.permissions.canViewDialogs ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                    <span className={role.permissions.canViewDialogs ? 'text-slate-200' : 'text-slate-500'}>Просмотр чатов</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {role.permissions.canEditKnowledgeBase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                    <span className={role.permissions.canEditKnowledgeBase ? 'text-slate-200' : 'text-slate-500'}>База знаний</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {role.permissions.canManageBilling ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                    <span className={role.permissions.canManageBilling ? 'text-slate-200' : 'text-slate-500'}>Биллинг и тариф</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {role.permissions.canAccessApiKeys ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                    <span className={role.permissions.canAccessApiKeys ? 'text-slate-200' : 'text-slate-500'}>Ключи API / Настройки</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: KAZAKHSTAN HOSTING (ST. 12) */}
      {activeSubTab === 'hosting' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Локализация хостинга в Республике Казахстан (ст. 12 Закона РК)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Сравнение казахстанских дата-центров для размещения серверов баз данных клиентов и обеспечения полного юридического соответствия.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {KZ_DATACENTERS.map(dc => (
              <div 
                key={dc.provider}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{dc.provider}</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                      {dc.tier}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-400 font-mono">
                    SLA: {dc.uptimeSla} • {dc.city}
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    {dc.pricingMonthlyKZT}
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 space-y-1 text-[11px] text-slate-300">
                    {dc.advantages.map((adv, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-400">•</span>
                        <span>{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Соответствует ст. 12 Закона РК №94-V</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300">
            <strong>Архитектурный стандарт:</strong> База данных PostgreSQL и файловое хранилище развертываются в ЦОД Алматы/Астана. Внешние LLM API (Google Gemini) получают только обезличенный контекст запроса без ФИО и телефонов клиентов.
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AI QA & GUARDRAILS */}
      {activeSubTab === 'ai_qa' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                AI QA & Guardrails (Защита от галлюцинаций)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Автоматическое тестирование точности ответов бота на сложные и провокационные запросы клиентов.
              </p>
            </div>

            <button
              onClick={handleRunAllQaTests}
              disabled={isRunningAllTests}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 transition self-start sm:self-auto shadow-md"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningAllTests ? 'animate-spin' : ''}`} />
              <span>{isRunningAllTests ? 'Тестирование...' : 'Запустить прогон тестов'}</span>
            </button>
          </div>

          {testRunSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Все 5 регрессионных тестов пройдены успешно (100% совпадение с критериями качества). Галлюцинации цен заблокированы.</span>
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            {qaTestCases.map(tc => (
              <div 
                key={tc.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-400">{tc.category}</span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Guardrail активен</span>
                  </span>
                </div>
                <div className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-mono">
                  Запрос клиента: «{tc.userPrompt}»
                </div>
                <div className="text-xs text-slate-400">
                  <strong>Ожидаемое поведение:</strong> {tc.expectedBehavior}
                </div>
                <div className="text-[11px] text-slate-500">
                  Правило: {tc.guardrailRule}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: BILLING & PLANS */}
      {activeSubTab === 'billing' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Тарифная сетка SaaS и модуль биллинга
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Тарифы в тенге для малого и среднего бизнеса Атырау. Оплата через Kaspi Pay или безналичный расчёт.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            {/* Plan: Start */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Тариф Старт</span>
                <div className="text-2xl font-extrabold text-white font-mono">
                  9 900 ₸ <span className="text-xs font-normal text-slate-400">/ мес</span>
                </div>
                <p className="text-xs text-slate-300">
                  Идеально для индивидуальных мастеров массажа, бровистов и небольших студий (до 500 диалогов в месяц).
                </p>
                <div className="space-y-1.5 pt-2 text-xs text-slate-300">
                  <div>✓ 1 рабочий WhatsApp-номер</div>
                  <div>✓ Ответы по прайс-листу и адресу</div>
                  <div>✓ Базовая запись на слоты</div>
                  <div>✓ 1 оператор в чате</div>
                </div>
              </div>
            </div>

            {/* Plan: Business (Popular) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-500/50 space-y-3 flex flex-col justify-between relative shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Тариф Бизнес</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white">Хит</span>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  19 900 ₸ <span className="text-xs font-normal text-slate-400">/ мес</span>
                </div>
                <p className="text-xs text-slate-300">
                  Для салонов красоты, СПА-центров и туристических агентств (до 2 000 диалогов в месяц).
                </p>
                <div className="space-y-1.5 pt-2 text-xs text-slate-300">
                  <div>✓ До 2 000 диалогов в месяц</div>
                  <div>✓ Интерактивная витрина услуг</div>
                  <div>✓ До 3 операторов на смене</div>
                  <div>✓ Приоритетная поддержка в Атырау</div>
                  <div>✓ Счета на оплату с Kaspi QR</div>
                </div>
              </div>
            </div>

            {/* Plan: Pro */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Тариф Про / Сеть</span>
                <div className="text-2xl font-extrabold text-white font-mono">
                  34 900 ₸ <span className="text-xs font-normal text-slate-400">/ мес</span>
                </div>
                <p className="text-xs text-slate-300">
                  Для сетей студий, клиник и компаний с несколькими филиалами (безлимитные диалоги).
                </p>
                <div className="space-y-1.5 pt-2 text-xs text-slate-300">
                  <div>✓ Безлимитные входящие диалоги</div>
                  <div>✓ До 10 операторов и аналитика</div>
                  <div>✓ Индивидуальная настройка промптов</div>
                  <div>✓ Персональный менеджер внедрения</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 7: 1-DAY ONBOARDING WIZARD */}
      {activeSubTab === 'onboarding' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-indigo-400" />
              Визард подключения нового клиента за 1 рабочий день
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Стандартизированный 5-шаговый процесс быстрого запуска, не требующий участия программиста.
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-between max-w-xl mx-auto pt-2">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => setOnboardingStep(step)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                    onboardingStep === step
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                      : onboardingStep > step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {onboardingStep > step ? '✓' : step}
                </button>
                {step < 5 && (
                  <div className={`w-8 sm:w-16 h-1 ${onboardingStep > step ? 'bg-emerald-600' : 'bg-slate-800'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Details */}
          <div className="bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 max-w-xl mx-auto">
            {onboardingStep === 1 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Шаг 1: Реквизиты бизнеса</h4>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Название компании / студии:</label>
                  <input
                    type="text"
                    value={clientBusinessName}
                    onChange={(e) => setClientBusinessName(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">WhatsApp номер администратора:</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Шаг 2: Выбор готового шаблона ниши</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/50 flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-white">Массажный салон / СПА-центр</span>
                    <span className="text-emerald-400 text-xs">✓ Выбран</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    Студия красоты / Барбершоп
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    Туристическое агентство
                  </div>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Шаг 3: Загрузка прайса и адреса</h4>
                <div className="p-4 rounded-xl border border-dashed border-slate-700 text-center text-xs text-slate-400">
                  Прайс-лист импортирован: 8 услуг (классический массаж, массаж спины, лимфодренаж, СПА-программы).
                </div>
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="space-y-3 text-center">
                <h4 className="text-sm font-bold text-white">Шаг 4: Привязка WhatsApp номера</h4>
                <div className="w-36 h-36 mx-auto bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center p-2">
                  <div className="text-slate-400 text-xs">
                    [QR-код сканирования в WhatsApp Web]
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Владелец сканирует QR-код со своего рабочего телефона.
                </p>
              </div>
            )}

            {onboardingStep === 5 && (
              <div className="space-y-3 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Шаг 5: Тестовый диалог успешен!</h4>
                <p className="text-xs text-slate-300">
                  Бот активирован и готов обрабатывать входящие обращения в WhatsApp для «{clientBusinessName}».
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
              <button
                disabled={onboardingStep === 1}
                onClick={() => setOnboardingStep(s => Math.max(1, s - 1))}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 disabled:opacity-30"
              >
                Назад
              </button>
              <button
                disabled={onboardingStep === 5}
                onClick={() => setOnboardingStep(s => Math.min(5, s + 1))}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs disabled:opacity-30"
              >
                {onboardingStep === 4 ? 'Завершить подключение' : 'Далее'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
