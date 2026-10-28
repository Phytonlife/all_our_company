import React, { useState } from 'react';
import { Deal, DealStage } from '../types';
import { StorageService } from '../services/storage';
import { 
  Target, Plus, Filter, Phone, Calendar, CheckCircle2, 
  Clock, ShieldCheck, Download, AlertCircle, Search, 
  Building, User, DollarSign, ChevronRight
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
  
  // New Deal Form State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Массаж / СПА');
  const [city, setCity] = useState('Атырау');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneOrWa, setPhoneOrWa] = useState('');
  const [consentSource, setConsentSource] = useState('Входящий WhatsApp запрос с сайта');
  const [consentConfirmed, setConsentConfirmed] = useState(true);
  const [planName, setPlanName] = useState<'Старт (9 900 ₸)' | 'Бизнес (19 900 ₸)' | 'Про (34 900 ₸)' | 'Кастом'>('Бизнес (19 900 ₸)');
  const [notes, setNotes] = useState('');
  const [nextActionDate, setNextActionDate] = useState('2026-10-30');
  const [nextActionText, setNextActionText] = useState('Провести 15-минутное демо в WhatsApp');

  const filteredDeals = deals.filter(deal => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return deal.companyName.toLowerCase().includes(q) ||
             deal.contactPerson.toLowerCase().includes(q) ||
             deal.phoneOrWa.includes(q);
    }
    return true;
  });

  const handleCreateDeal = () => {
    if (!companyName.trim() || !contactPerson.trim() || !phoneOrWa.trim()) {
      alert('Пожалуйста, заполните название компании, контактное лицо и телефон.');
      return;
    }
    if (!consentConfirmed) {
      alert('В соответствии со ст. 12 Закона РК и WhatsApp Business Policy, контакт должен иметь подтвержденное законное согласие (opt-in).');
      return;
    }

    let amount = 19900;
    if (planName.includes('9 900')) amount = 9900;
    if (planName.includes('34 900')) amount = 34900;

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
      nextActionText
    });

    onDealsUpdated(updated);
    setShowNewDealModal(false);
    // Reset form
    setCompanyName('');
    setContactPerson('');
    setPhoneOrWa('');
    setNotes('');
  };

  const handleMoveStage = (dealId: string, nextStage: DealStage) => {
    const updated = StorageService.updateDeal(dealId, { stage: nextStage });
    onDealsUpdated(updated);
    if (activeDealDetail && activeDealDetail.id === dealId) {
      setActiveDealDetail({ ...activeDealDetail, stage: nextStage });
    }
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Top CRM Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
              <Target className="w-3.5 h-3.5" />
              <span>Воронка B2B-сделок • WhatsApp AI SaaS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Управление сделками и клиентами
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Только легальные подтвержденные контакты с зафиксированным согласием. Никаких холодных спам-баз.
            </p>
          </div>

          <button
            onClick={() => setShowNewDealModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition flex items-center gap-2 self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить сделку</span>
          </button>
        </div>

        {/* Pipeline Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-slate-400">Всего сделок:</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{deals.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-slate-400">В процессе демо:</span>
            <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
              {deals.filter(d => d.stage === 'demo_scheduled' || d.stage === 'demo_completed').length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-slate-400">Пилоты / Тест:</span>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
              {deals.filter(d => d.stage === 'trial').length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-slate-400">Оплачено и активно:</span>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {deals.filter(d => d.stage === 'paid' || d.stage === 'activated' || d.stage === 'renewed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по компании, имени, телефону..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Город: <strong className="text-white">Атырау</strong>
        </span>
      </div>

      {/* Horizontal Scrollable Stages Board */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {STAGES.map(stage => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
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
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500/70 cursor-pointer shadow-sm space-y-2 transition"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-indigo-400 truncate max-w-[150px]">
                            {deal.industry}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {deal.amountKZT.toLocaleString('ru-RU')} ₸
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                          {deal.companyName}
                        </h4>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>{deal.contactPerson}</span>
                          <span className="text-slate-500 font-mono">{deal.phoneOrWa}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="line-clamp-1">След: {deal.nextActionText}</span>
                          <span className="text-indigo-400 font-mono shrink-0">{deal.nextActionDate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Deal Modal */}
      {showNewDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Новая B2B сделка в CRM
              </h3>
              <button onClick={() => setShowNewDealModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Название компании / студии:</label>
                <input
                  type="text"
                  placeholder="Например: Салон массажа «Асыл Атырау»"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Отрасль:</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs"
                  >
                    <option value="Массаж / СПА">Массаж / СПА</option>
                    <option value="Салон красоты">Салон красоты</option>
                    <option value="Турагентство">Турагентство</option>
                    <option value="Стоматология / Медуслуги">Стоматология / Медуслуги</option>
                    <option value="Услуги для бизнеса">Услуги для бизнеса</option>
                    <option value="Другое">Другое</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Город:</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Контактное лицо:</label>
                  <input
                    type="text"
                    placeholder="Имя, должность"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Телефон / WhatsApp:</label>
                  <input
                    type="text"
                    placeholder="+7 7XX XXX XX XX"
                    value={phoneOrWa}
                    onChange={(e) => setPhoneOrWa(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Источник контакта / согласия (ст. 12 Закона РК):</label>
                <input
                  type="text"
                  placeholder="Входящая заявка / Семинар Atyrau Hub / Рекомендация"
                  value={consentSource}
                  onChange={(e) => setConsentSource(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-500 bg-slate-800 border-slate-700 mt-0.5"
                />
                <span className="text-xs text-slate-300">
                  Подтверждаю наличие законного согласия на связь (без спама по открытым базам).
                </span>
              </label>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Тарифный план:</label>
                <select
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs"
                >
                  <option value="Старт (9 900 ₸)">Старт (9 900 ₸ / мес)</option>
                  <option value="Бизнес (19 900 ₸)">Бизнес (19 900 ₸ / мес)</option>
                  <option value="Про (34 900 ₸)">Про (34 900 ₸ / мес)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Следующее действие:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Действие"
                    value={nextActionText}
                    onChange={(e) => setNextActionText(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowNewDealModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateDeal}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
              >
                Создать сделку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deal Detail / Stage Mover Modal */}
      {activeDealDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-indigo-400 font-semibold">{activeDealDetail.industry}</span>
                <h3 className="font-bold text-base text-white mt-0.5">{activeDealDetail.companyName}</h3>
              </div>
              <button onClick={() => setActiveDealDetail(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Контакт:</span>
                  <span className="text-white font-medium">{activeDealDetail.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">WhatsApp / Телефон:</span>
                  <span className="text-white font-mono">{activeDealDetail.phoneOrWa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Источник согласия:</span>
                  <span className="text-slate-200">{activeDealDetail.consentSource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Планируемый тариф:</span>
                  <span className="text-emerald-400 font-mono font-bold">{activeDealDetail.planName}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Переместить на этап воронки:</label>
                <div className="grid grid-cols-2 gap-2">
                  {STAGES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleMoveStage(activeDealDetail.id, s.id)}
                      className={`p-2 rounded-xl text-left text-xs transition border ${
                        activeDealDetail.stage === s.id
                          ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Draft generator */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-300">Быстрые действия:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button 
                    onClick={() => {
                      const text = `Здравствуйте, ${activeDealDetail.contactPerson}! Это по поводу автоматизации WhatsApp для ${activeDealDetail.companyName}. Когда вам удобно провести 10-минутное демо?`;
                      navigator.clipboard.writeText(text);
                      alert('Текст приглашения на демо скопирован в буфер обмена!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Скопировать сообщение для WhatsApp
                  </button>
                  <button 
                    onClick={() => {
                      alert(`Сформирован черновик счёта на оплату для ${activeDealDetail.companyName} на сумму ${activeDealDetail.amountKZT} ₸ с реквизитами юрлица.`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Сформировать счёт (PDF)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveDealDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:text-white"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
