import React, { useState } from 'react';
import { Partner, SalesAgent } from '../types';
import { StorageService } from '../services/storage';
import { 
  Users2, UserPlus, DollarSign, Calculator, AlertTriangle, 
  CheckCircle2, ShieldCheck, Plus, ExternalLink, Briefcase
} from 'lucide-react';

interface PartnersViewProps {
  partners: Partner[];
  onPartnersUpdated: (updated: Partner[]) => void;
  agents: SalesAgent[];
  onAgentsUpdated: (updated: SalesAgent[]) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  onPartnersUpdated,
  agents,
  onAgentsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'partners' | 'agents' | 'calculator'>('partners');
  
  // Commission Safety Calculator State
  const [calcTariffKZT, setCalcTariffKZT] = useState<number>(19900); // 19 900 ₸ / мес
  const [calcCommissionKZT, setCalcCommissionKZT] = useState<number>(10000); // 10 000 ₸
  const [calcMonthsLifetime, setCalcMonthsLifetime] = useState<number>(4); // 4 месяца
  const [calcMonthlyCostKZT, setCalcMonthlyCostKZT] = useState<number>(2500); // себестоимость хостинга/ИИ

  // Safety checks
  const grossRevenue = calcTariffKZT * calcMonthsLifetime;
  const totalCost = (calcMonthlyCostKZT * calcMonthsLifetime) + calcCommissionKZT;
  const netProfit = grossRevenue - totalCost;
  const isSafeCommission = netProfit > 0 && (calcCommissionKZT <= calcTariffKZT * 0.7);

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
              <Users2 className="w-3.5 h-3.5" />
              <span>Партнёрская экосистема и полевые продажи</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Реферальные партнёры и торговые представители
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              10 категорий партнеров, расчет рентабельности комиссий и контроль полевых визитов в Атырау.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'partners'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            Партнёры-рефералы ({partners.length})
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'agents'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            Торговые агенты ({agents.length})
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Калькулятор маржинальности</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PARTNERS */}
      {activeTab === 'partners' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map(p => (
              <div 
                key={p.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-400">{p.category}</span>
                  <span className="font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                    {p.referralCode}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Контакт: {p.contactName} ({p.phone})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div className="p-2 rounded-lg bg-slate-800/50">
                    <span className="text-slate-400">Привлечено сделок:</span>
                    <div className="font-bold text-white font-mono mt-0.5">{p.referredDealsCount}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/50">
                    <span className="text-slate-400">Оплаченных:</span>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5">{p.paidDealsCount}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/30 text-xs text-slate-300">
                  <strong>Условия:</strong> {p.agreedCommissionFixedKZT ? `${p.agreedCommissionFixedKZT} ₸ за платящего клиента` : `${p.agreedCommissionPercent}% от абонплаты`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SALES AGENTS */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map(a => (
              <div 
                key={a.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-400">Полевой представитель</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                    {a.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{a.fullName}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Тел: {a.phone} • Район: {a.area}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div className="p-2 rounded-lg bg-slate-800/50 text-center">
                    <span className="text-slate-400 text-[11px]">Визиты:</span>
                    <div className="font-bold text-white font-mono mt-0.5">{a.fieldVisitsCount}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/50 text-center">
                    <span className="text-slate-400 text-[11px]">Демо:</span>
                    <div className="font-bold text-indigo-400 font-mono mt-0.5">{a.demosQualifiedCount}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/50 text-center">
                    <span className="text-slate-400 text-[11px]">Оплаты:</span>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5">{a.paidClientsCount}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-400">{a.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COMMISSION SAFETY CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              Калькулятор безопасности партнерских выплат (Unit Economics Guard)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Проверка: можно ли платить партнеру или агенту премию без риска уйти в кассовый разрыв.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Тариф клиента в месяц (KZT):</label>
              <input
                type="number"
                value={calcTariffKZT}
                onChange={(e) => setCalcTariffKZT(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Предлагаемая комиссия партнеру (KZT):</label>
              <input
                type="number"
                value={calcCommissionKZT}
                onChange={(e) => setCalcCommissionKZT(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Ожидаемый средний срок жизни (LTV, мес):</label>
              <input
                type="number"
                value={calcMonthsLifetime}
                onChange={(e) => setCalcMonthsLifetime(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Себестоимость хостинга / LLM на клиента/мес (KZT):</label>
              <input
                type="number"
                value={calcMonthlyCostKZT}
                onChange={(e) => setCalcMonthlyCostKZT(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Results Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700">
              <span className="text-xs text-slate-400">Валовая выручка:</span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {grossRevenue.toLocaleString('ru-RU')} ₸
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700">
              <span className="text-xs text-slate-400">Суммарные расходы (себест + комиссия):</span>
              <div className="text-lg font-bold text-slate-300 font-mono mt-0.5">
                {totalCost.toLocaleString('ru-RU')} ₸
              </div>
            </div>
            <div className={`p-3.5 rounded-xl border ${isSafeCommission ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-rose-950/30 border-rose-500/40'}`}>
              <span className="text-xs text-slate-400">Ожидаемая чистая прибыль:</span>
              <div className={`text-lg font-bold font-mono mt-0.5 ${isSafeCommission ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netProfit.toLocaleString('ru-RU')} ₸
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${isSafeCommission ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'}`}>
            {isSafeCommission ? (
              <>
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  <strong>Условия комиссии безопасны!</strong> Выплата {calcCommissionKZT} ₸ полностью окупается со 2-го месяца удержания клиента.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>
                  <strong>Внимание: комиссия рискованна!</strong> При таком тарифе выплата превышает допустимый порог и создает риск кассового разрыва в первый месяц. Рекомендуется снизить комиссию или привязать ее ко второму продлению.
                </span>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
