import React, { useState } from 'react';
import { Deal, DealStage } from '../types';
import { StorageService } from '../services/storage';
import { 
  Target, Plus, Filter, Phone, Calendar, CheckCircle2, 
  Clock, ShieldCheck, Download, AlertCircle, Search, 
  Building, User, DollarSign, ChevronRight, Sparkles,
  Info, ExternalLink, Trash2
} from 'lucide-react';

interface CrmViewProps {
  deals: Deal[];
  onDealsUpdated: (updated: Deal[]) => void;
  selectedRoleFilter: 'all' | 'founder' | 'operations';
}

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'lead', label: '1. Новый лид', color: 'border-slate-700 bg-slate-900/60' },
  { id: 'contact_permitted', label: '2. Разрешённый контакт', color: 'border-sky-800/40 bg-sky-950/20' },
  { id: 'qualified', label: '3. Квалифицирован', color: 'border-indigo-800/40 bg-indigo-950/20' },
  { id: 'demo_scheduled', label: '4. Назначено демо', color: 'border-purple-800/40 bg-purple-950/20' },
  { id: 'demo_completed', label: '5. Демо проведено', color: 'border-violet-800/40 bg-violet-950/20' },
  { id: 'trial', label: '6. Тест / Пилот', color: 'border-amber-800/40 bg-amber-950/20' },
  { id: 'invoice_sent', label: '7. Счёт выставлен', color: 'border-blue-800/40 bg-blue-950/20' },
  { id: 'paid', label: '8. Оплачен', color: 'border-emerald-800/40 bg-emerald-950/20' },
  { id: 'activated', label: '9. Активирован', color: 'border-emerald-600/40 bg-emerald-900/20' },
  { id: 'renewed', label: '10. Продление', color: 'border-teal-600/40 bg-teal-900/20' }
];

export const CrmView: React.FC<CrmViewProps> = ({
  deals,
  onDealsUpdated,
  selectedRoleFilter
}) => {
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [activeDealDetail, setActiveDealDetail] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSandboxDemo, setShowSandboxDemo] = useState(false);
  
  // New Deal Form State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Сфера услуг / Салон');
  const [city, setCity] = useState('Атырау');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneOrWa, setPhoneOrWa] = useState('');
  const [consentSource, setConsentSource] = useState('Личная встреча с согласия владельца');
  const [consentConfirmed, setConsentConfirmed] = useState(true);
  const [planName, setPlanName] = useState<'Старт (9 900 ₸)' | 'Бизнес (19 900 ₸)' | 'Про (34 900 ₸)' | 'Кастом'>('Бизнес (19 900 ₸)');
  const [customAmount, setCustomAmount] = useState<number>(19900);
  const [notes, setNotes] = useState('');
  const [nextActionDate, setNextActionDate] = useState('2026-10-30');
  const [nextActionText, setNextActionText] = useState('Провести демонстрацию сценария WhatsApp');
  const [isDemoDeal, setIsDemoDeal] = useState(false);

  // Filter deals: real by default, or demo if sandbox view enabled
  const displayedDeals = deals.filter(deal => {
    if (!showSandboxDemo && deal.isDemo) return false;
    if (showSandboxDemo && !deal.isDemo) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return deal.companyName.toLowerCase().includes(q) ||
             deal.contactPerson.toLowerCase().includes(q) ||
             deal.phoneOrWa.includes(q);
    }
    return true;
  });

  const realDeals = deals.filter(d => !d.isDemo);
  const paidRealDeals = realDeals.filter(d => d.stage === 'paid' || d.stage === 'activated' || d.stage === 'renewed');
  const totalRevenueKZT = paidRealDeals.reduce((sum, d) => sum + (d.monthlyRevenueKZT || d.amountKZT || 0), 0);
  const activeDemosCount = realDeals.filter(d => d.stage === 'demo_scheduled' || d.stage === 'demo_completed').length;
  const trialCount = realDeals.filter(d => d.stage === 'trial').length;

  const handleCreateDeal = () => {
    if (!companyName.trim() || !contactPerson.trim() || !phoneOrWa.trim()) {
      alert('Пожалуйста, заполните название компании, контактное лицо и телефон.');
      return;
    }
    if (!consentConfirmed) {
      alert('В соответствии со ст. 12 Закона РК и политикой Meta, контакт должен иметь подтверждённое согласие (opt-in).');
      return;
    }

    let amount = customAmount;
    if (planName === 'Старт (9 900 ₸)') amount = 9900;
    else if (planName === 'Бизнес (19 900 ₸)') amount = 19900;
    else if (planName === 'Про (34 900 ₸)') amount = 34900;

    const updated = StorageService.addDeal({
      companyName,
      industry,
      city,
      contactPerson,
      phoneOrWa,
      consentSource,
      consentDate: new Date().toISOString().slice(0, 10),
      stage: 'lead',
      owner: selectedRoleFilter === 'operations' ? 'operations' : 'founder',
      planName,
      amountKZT: amount,
      setupCostKZT: 0,
      monthlyRevenueKZT: amount,
      notes,
      nextActionDate,
      nextActionText,
      isDemo: isDemoDeal
    });

    onDealsUpdated(updated);
    setShowNewDealModal(false);
    // Reset form
    setCompanyName('');
    setContactPerson('');
    setPhoneOrWa('');
    setNotes('');
    setIsDemoDeal(false);
  };

  const handleMoveStage = (dealId: string, nextStage: DealStage) => {
    const updated = StorageService.updateDeal(dealId, { 
      stage: nextStage,
      paymentConfirmedDate: nextStage === 'paid' ? new Date().toISOString().slice(0, 10) : undefined
    });
    onDealsUpdated(updated);
    if (activeDealDetail && activeDealDetail.id === dealId) {
      setActiveDealDetail({ ...activeDealDetail, stage: nextStage });
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту сделку?')) {
      const updated = StorageService.deleteDeal(dealId);
      onDealsUpdated(updated);
      setActiveDealDetail(null);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Top CRM Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#111a2b] via-[#142138] to-[#0c1322] border border-slate-700/80 p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Target className="w-3.5 h-3.5" />
              <span>Честная воронка продаж • B2B SaaS Казахстан</span>
              <span>•</span>
              <span className="text-slate-400">{city}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Клиенты, демонстрации и выручка
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Только реальные подтверждённые обращения с согласием (opt-in). Без спама и фиктивных пилотов.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowSandboxDemo(!showSandboxDemo)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                showSandboxDemo 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {showSandboxDemo ? '★ Режим: Песочница' : 'Режим: Боевой (Реальность)'}
            </button>

            <button
              onClick={() => setShowNewDealModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить лид</span>
            </button>
          </div>
        </div>

        {/* Pipeline Summary Bar - strictly from real deals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400">Реальных клиентов в базе:</span>
            <div className="text-xl font-black text-white mt-0.5">
              {realDeals.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400">В процессе демо:</span>
            <div className="text-xl font-black text-blue-400 mt-0.5">
              {activeDemosCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400">Активных пилотов:</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              {trialCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400">Фактическая выручка:</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {totalRevenueKZT > 0 ? `${totalRevenueKZT.toLocaleString('ru-RU')} ₸` : '0 ₸'}
            </div>
          </div>
        </div>
      </div>

      {showSandboxDemo && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/50 rounded-xl text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Внимание: Вы просматриваете <strong>учебную песочницу</strong>. Записи здесь служат для отработки сценариев и не влияют на реальные показатели компании.
            </span>
          </div>
          <button
            onClick={() => setShowSandboxDemo(false)}
            className="text-xs font-bold text-amber-300 underline ml-2"
          >
            Вернуться в боевой режим
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по компании, имени, телефону..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Регион: <strong className="text-white">Атырау</strong> (Западный Казахстан)
        </span>
      </div>

      {/* If 0 deals, show clean helpful state */}
      {displayedDeals.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Target className="w-12 h-12 text-blue-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">
            {showSandboxDemo ? 'В песочнице нет учебных сделок' : 'Реальных сделок пока нет'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {showSandboxDemo
              ? 'Вы можете добавить демонстрационную сделку для отработки воронки.'
              : 'В Growth OS Kazakhstan стартовая база чистая: 0 ₸ выручки и 0 выдуманных клиентов. Добавьте первый реальный контакт с согласия клиента или переключитесь в песочницу для тестирования.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setShowNewDealModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              + Добавить первый контакт
            </button>
            {!showSandboxDemo && (
              <button
                onClick={() => setShowSandboxDemo(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700"
              >
                Открыть учебную песочницу
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Horizontal Scrollable Stages Board */
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
          {STAGES.map(stage => {
            const stageDeals = displayedDeals.filter(d => d.stage === stage.id);
            return (
              <div 
                key={stage.id}
                className={`w-72 shrink-0 rounded-2xl border p-3 flex flex-col justify-between ${stage.color}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold">
                    <span className="text-slate-200">{stage.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 min-h-[120px]">
                    {stageDeals.length === 0 ? (
                      <div className="h-20 flex items-center justify-center text-[11px] text-slate-500 italic">
                        Нет сделок на этом этапе
                      </div>
                    ) : (
                      stageDeals.map(deal => (
                        <div
                          key={deal.id}
                          onClick={() => setActiveDealDetail(deal)}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-blue-500/70 cursor-pointer shadow-sm space-y-2 transition"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-blue-400 truncate max-w-[150px]">
                              {deal.industry}
                            </span>
                            <span className="text-slate-300 font-mono font-bold">
                              {deal.amountKZT.toLocaleString('ru-RU')} ₸
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                            {deal.companyName}
                          </h4>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between">
                            <span>{deal.contactPerson}</span>
                            {deal.isDemo && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold">
                                ДЕМО
                              </span>
                            )}
                          </div>
                          {deal.nextActionText && (
                            <div className="text-[10px] text-slate-300 bg-slate-800/80 p-1.5 rounded-md truncate">
                              ▶ {deal.nextActionText}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deal Detail Modal */}
      {activeDealDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveDealDetail(null);
          }}
        >
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Карточка сделки {activeDealDetail.isDemo && '(Учебный пример)'}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {activeDealDetail.companyName}
                </h3>
                <div className="text-xs text-slate-400">
                  {activeDealDetail.industry} · {activeDealDetail.city}
                </div>
              </div>
              <button
                onClick={() => setActiveDealDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Контактное лицо:</span>
                  <span className="font-semibold text-white">{activeDealDetail.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Телефон / WhatsApp:</span>
                  <a 
                    href={`tel:${activeDealDetail.phoneOrWa.replace(/[^+\d]/g, '')}`}
                    className="font-semibold text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {activeDealDetail.phoneOrWa}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Источник согласия (opt-in):</span>
                  <span className="font-semibold text-emerald-400">{activeDealDetail.consentSource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Тарифный план:</span>
                  <span className="font-semibold text-white">{activeDealDetail.planName} ({activeDealDetail.amountKZT.toLocaleString('ru-RU')} ₸)</span>
                </div>
              </div>

              {/* Move Stage Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Переместить на этап:</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                  {STAGES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleMoveStage(activeDealDetail.id, s.id)}
                      className={`p-2 rounded-lg text-left text-xs font-semibold border transition-colors ${
                        activeDealDetail.stage === s.id
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Action */}
              <div className="p-3 bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block mb-1">Следующий шаг:</span>
                <div className="text-white font-medium">{activeDealDetail.nextActionText || '—'}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Срок: {activeDealDetail.nextActionDate || 'не назначен'}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                onClick={() => handleDeleteDeal(activeDealDetail.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить сделку</span>
              </button>
              <button
                onClick={() => setActiveDealDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      {showNewDealModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewDealModal(false);
          }}
        >
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4 my-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Новый лид в воронку</h3>
                <p className="text-xs text-slate-400">
                  Фиксация легального обращения предпринимателя
                </p>
              </div>
              <button onClick={() => setShowNewDealModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Название компании / Бизнеса *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Например: Салон «Aura Atyrau»"
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Отрасль</label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Массаж / СПА">Массаж / СПА</option>
                    <option value="Салон красоты / Барбер">Салон красоты / Барбер</option>
                    <option value="Стоматология / Клиника">Стоматология / Клиника</option>
                    <option value="Автосервис / Детейлинг">Автосервис / Детейлинг</option>
                    <option value="Фитнес / Йога">Фитнес / Йога</option>
                    <option value="Туризм / Экскурсии">Туризм / Экскурсии</option>
                    <option value="Другое">Другое</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Город</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Контактное лицо *</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    placeholder="Айгуль"
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">WhatsApp / Телефон *</label>
                  <input
                    type="text"
                    value={phoneOrWa}
                    onChange={e => setPhoneOrWa(e.target.value)}
                    placeholder="+7 701 ..."
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Источник согласия (opt-in) *</label>
                <input
                  type="text"
                  value={consentSource}
                  onChange={e => setConsentSource(e.target.value)}
                  placeholder="Личная встреча, входящий вопрос, визитка..."
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Тариф</label>
                  <select
                    value={planName}
                    onChange={e => {
                      const p = e.target.value as any;
                      setPlanName(p);
                      if (p.includes('9 900')) setCustomAmount(9900);
                      else if (p.includes('19 900')) setCustomAmount(19900);
                      else if (p.includes('34 900')) setCustomAmount(34900);
                    }}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Старт (9 900 ₸)">Старт (9 900 ₸)</option>
                    <option value="Бизнес (19 900 ₸)">Бизнес (19 900 ₸)</option>
                    <option value="Про (34 900 ₸)">Про (34 900 ₸)</option>
                    <option value="Кастом">Кастом</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Сумма (₸)</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={e => setCustomAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg">
                <input
                  type="checkbox"
                  id="demo-check"
                  checked={isDemoDeal}
                  onChange={e => setIsDemoDeal(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="demo-check" className="text-[11px] text-slate-300 cursor-pointer">
                  Это учебный пример (поместить в песочницу, не суммировать в выручку)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowNewDealModal(false)}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateDeal}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow"
              >
                Сохранить сделку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
