import React, { useState } from 'react';
import { ExpenseItem, Deal } from '../types';
import { StorageService } from '../services/storage';
import { 
  DollarSign, Plus, TrendingUp, TrendingDown, AlertCircle, 
  Wallet, PieChart, ShieldCheck, CheckCircle2, Calendar
} from 'lucide-react';

interface FinanceViewProps {
  expenses: ExpenseItem[];
  deals: Deal[];
  onExpensesUpdated: (updated: ExpenseItem[]) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  expenses,
  deals,
  onExpensesUpdated
}) => {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [amountKZT, setAmountKZT] = useState<number>(2500);
  const [category, setCategory] = useState<ExpenseItem['category']>('Реклама Meta/Insta');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'planned' | 'approved' | 'paid'>('planned');

  // Revenue calculation based solely on actual paid or renewed deals (no fake numbers)
  const paidDeals = deals.filter(d => d.stage === 'paid' || d.stage === 'activated' || d.stage === 'renewed');
  const totalActualRevenueKZT = paidDeals.reduce((acc, d) => acc + d.amountKZT, 0);

  // Total expenses
  const totalExpensesKZT = expenses.reduce((acc, e) => acc + e.amountKZT, 0);
  const paidExpensesKZT = expenses.filter(e => e.status === 'paid').reduce((acc, e) => acc + e.amountKZT, 0);

  // Unit Economics
  const mrrActualKZT = paidDeals.reduce((acc, d) => acc + d.monthlyRevenueKZT, 0);
  const adsExpense = expenses.filter(e => e.category === 'Реклама Meta/Insta').reduce((acc, e) => acc + e.amountKZT, 0);
  const paidClientsCount = paidDeals.length;
  const cacKZT = paidClientsCount > 0 ? Math.round(adsExpense / paidClientsCount) : 0;

  const handleCreateExpense = () => {
    if (!description.trim() || amountKZT <= 0) {
      alert('Укажите корректную сумму и описание расхода.');
      return;
    }
    const updated = StorageService.addExpense({
      date: new Date().toISOString().slice(0, 10),
      category,
      amountKZT,
      description,
      status,
      approvedBy: 'founder'
    });
    onExpensesUpdated(updated);
    setShowAddExpenseModal(false);
    setDescription('');
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Финансовый учёт и юнит-экономика • Казахстан (KZT)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Финансы, расходы и себестоимость
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Только подтверждённые доходы и контролируемые расходы. Никаких вымышленных показателей выручки.
            </p>
          </div>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition flex items-center gap-2 self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Внести расход</span>
          </button>
        </div>

        {/* Top Financial Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-slate-400">Фактическая выручка:</span>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {totalActualRevenueKZT.toLocaleString('ru-RU')} ₸
            </div>
            <span className="text-[10px] text-slate-500">{paidClientsCount} оплаченных клиентов</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-slate-400">Текущий MRR:</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {mrrActualKZT.toLocaleString('ru-RU')} ₸
            </div>
            <span className="text-[10px] text-slate-500">Регулярная месячная выручка</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-slate-400">Сумма расходов:</span>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
              {totalExpensesKZT.toLocaleString('ru-RU')} ₸
            </div>
            <span className="text-[10px] text-slate-500">Оплачено: {paidExpensesKZT.toLocaleString('ru-RU')} ₸</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-slate-400">CAC (Стоимость привлечения):</span>
            <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
              {cacKZT > 0 ? `${cacKZT.toLocaleString('ru-RU')} ₸` : 'Расчёт после оплат'}
            </div>
            <span className="text-[10px] text-slate-500">Реклама: {adsExpense.toLocaleString('ru-RU')} ₸</span>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-indigo-400" />
            Журнал расходов ({expenses.length})
          </h3>
          <span className="text-xs text-slate-400">
            Лимит недели: <strong>17 500 ₸</strong>
          </span>
        </div>

        <div className="space-y-2">
          {expenses.map(exp => (
            <div 
              key={exp.id}
              className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-indigo-400 font-semibold">{exp.category}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 font-mono">{exp.date}</span>
                  <span className="text-slate-500">·</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                    exp.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {exp.status === 'paid' ? 'Оплачено' : exp.status === 'approved' ? 'Согласовано' : 'Запланировано'}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">{exp.description}</h4>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm sm:text-base font-bold text-white font-mono">
                  {exp.amountKZT.toLocaleString('ru-RU')} ₸
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Внести статью расхода</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Сумма в тенге (KZT):</label>
                <input
                  type="number"
                  value={amountKZT}
                  onChange={(e) => setAmountKZT(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Категория расхода:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs"
                >
                  <option value="Реклама Meta/Insta">Реклама Meta/Insta</option>
                  <option value="Контент / Видео">Контент / Видео</option>
                  <option value="Хостинг / API / WhatsApp">Хостинг / API / WhatsApp</option>
                  <option value="Комиссии партнёрам">Комиссии партнёрам</option>
                  <option value="Мероприятия">Мероприятия</option>
                  <option value="Юридические / Налоги">Юридические / Налоги</option>
                  <option value="Прочее">Прочее</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Описание статьи:</label>
                <input
                  type="text"
                  placeholder="Например: Продление домена / тестовый рекламный бюджет"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Статус платежа:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs"
                >
                  <option value="planned">Запланировано</option>
                  <option value="approved">Согласовано Founder</option>
                  <option value="paid">Фактически оплачено</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateExpense}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
              >
                Сохранить расход
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
