import React, { useState } from 'react';
import { LegalTemplate, RiskItem } from '../types';
import { StorageService } from '../services/storage';
import { TAX_REGIMES, COMPLIANCE_OBLIGATIONS, ComplianceObligation } from '../data/companyOpsData';
import { 
  Building2, Scale, ShieldAlert, FileText, CreditCard, Calculator, 
  Landmark, CalendarClock, AlertOctagon, CheckCircle2, Copy, 
  ExternalLink, Edit3, Save, Info, AlertTriangle, ArrowRight, AlertCircle
} from 'lucide-react';

interface CompanyOpsViewProps {
  legalTemplates: LegalTemplate[];
  onTemplatesUpdated: (updated: LegalTemplate[]) => void;
  risks: RiskItem[];
  onRisksUpdated: (updated: RiskItem[]) => void;
}

export const CompanyOpsView: React.FC<CompanyOpsViewProps> = ({
  legalTemplates,
  onTemplatesUpdated,
  risks,
  onRisksUpdated
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'taxes' | 'legal' | 'qazpatent' | 'kaspi' | 'astana_hub' | 'compliance' | 'risks'
  >('taxes');

  // Tax Model Simulator States
  const [annualRevenueKZT, setAnnualRevenueKZT] = useState<number>(15000000); // 15 млн ₸ default
  const [monthlyPayrollKZT, setMonthlyPayrollKZT] = useState<number>(600000); // 2 сотрудника по 300к ₸

  // Legal template editor state
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(legalTemplates[0] || null);
  const [templateContent, setTemplateContent] = useState<string>(legalTemplates[0]?.content || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compliance obligations state
  const [obligations, setObligations] = useState<ComplianceObligation[]>(COMPLIANCE_OBLIGATIONS);

  // Calculate tax figures for simulation
  const calcTaxes = (regimeId: 'atyrau_snr_2' | 'standard_snr_3' | 'astana_hub') => {
    const annualPayroll = monthlyPayrollKZT * 12;
    // Salary taxes standard: OPV (10%), VOSMS (3%), SO (3.5%) = ~16.5%
    const payrollTaxesAnnual = annualPayroll * 0.165;

    if (regimeId === 'atyrau_snr_2') {
      const revenueTax = annualRevenueKZT * 0.02;
      const totalTax = revenueTax + payrollTaxesAnnual;
      return { revenueTax, totalTax, effectiveRate: (totalTax / annualRevenueKZT) * 100 };
    }
    if (regimeId === 'standard_snr_3') {
      const revenueTax = annualRevenueKZT * 0.03;
      const totalTax = revenueTax + payrollTaxesAnnual;
      return { revenueTax, totalTax, effectiveRate: (totalTax / annualRevenueKZT) * 100 };
    }
    // Astana Hub
    const technoparkFee = annualRevenueKZT * 0.01; // 1%
    // 0% IPN on employees salary in Astana Hub! Only OPV + VOSMS (~13%)
    const payrollTaxesHub = annualPayroll * 0.13;
    const totalTax = technoparkFee + payrollTaxesHub;
    return { revenueTax: technoparkFee, totalTax, effectiveRate: (totalTax / annualRevenueKZT) * 100 };
  };

  const atyrauResult = calcTaxes('atyrau_snr_2');
  const standardResult = calcTaxes('standard_snr_3');
  const hubResult = calcTaxes('astana_hub');

  const savingsHubVsStandard = standardResult.totalTax - hubResult.totalTax;
  const savingsAtyrauVsStandard = standardResult.totalTax - atyrauResult.totalTax;

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;
    const updated = StorageService.updateLegalTemplate(selectedTemplate.id, templateContent);
    onTemplatesUpdated(updated);
    alert('Шаблон документа успешно сохранен в локальной базе!');
  };

  const handleCopyTemplate = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
              <Building2 className="w-3.5 h-3.5" />
              <span>Company Operations (Новый модуль v2.2)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Юридический и операционный контур РК
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Юрлицо, товарный знак Qazpatent, авторские права, Kaspi Pay, налоги Атырау vs Astana Hub, комплаенс и риски.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation (Single-line, horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-3 border-t border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('taxes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'taxes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Налоги & Сравнение</span>
          </button>
          <button
            onClick={() => setActiveSubTab('legal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'legal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Юр. Шаблоны ({legalTemplates.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('qazpatent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'qazpatent'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Товарный знак</span>
          </button>
          <button
            onClick={() => setActiveSubTab('kaspi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'kaspi'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Kaspi Pay & Касса</span>
          </button>
          <button
            onClick={() => setActiveSubTab('astana_hub')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'astana_hub'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Astana Hub</span>
          </button>
          <button
            onClick={() => setActiveSubTab('compliance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'compliance'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Календарь обязательств</span>
          </button>
          <button
            onClick={() => setActiveSubTab('risks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'risks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Реестр рисков ({risks.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: TAX MODEL COMPARISON (Атырау 2% vs Astana Hub vs СНР 3%) */}
      {activeSubTab === 'taxes' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                Интерактивная финансовая модель налоговых режимов РК
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Сравнение фактической налоговой нагрузки при работе на СНР упрощенки в Атырау (ставка 2% при наличии решения маслихата), стандартном СНР 3% и режиме участника технопарка Astana Hub.
              </p>
            </div>

            {/* Interactive Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Планируемая годовая выручка:</span>
                  <span className="text-white font-mono font-bold">{annualRevenueKZT.toLocaleString('ru-RU')} ₸</span>
                </div>
                <input 
                  type="range"
                  min="2000000"
                  max="60000000"
                  step="500000"
                  value={annualRevenueKZT}
                  onChange={(e) => setAnnualRevenueKZT(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2 млн ₸</span>
                  <span>15 млн ₸</span>
                  <span>30 млн ₸</span>
                  <span>60 млн ₸</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Фонд оплаты труда (в месяц):</span>
                  <span className="text-white font-mono font-bold">{monthlyPayrollKZT.toLocaleString('ru-RU')} ₸</span>
                </div>
                <input 
                  type="range"
                  min="150000"
                  max="2500000"
                  step="50000"
                  value={monthlyPayrollKZT}
                  onChange={(e) => setMonthlyPayrollKZT(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>150 тыс ₸</span>
                  <span>600 тыс ₸</span>
                  <span>1.5 млн ₸</span>
                  <span>2.5 млн ₸</span>
                </div>
              </div>
            </div>

            {/* Three-Card Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Option 1: Atyrau 2% */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400">СНР Атырау 2%</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                    При маслихате
                  </span>
                </div>
                <div className="text-xl font-extrabold text-white font-mono">
                  {Math.round(atyrauResult.totalTax).toLocaleString('ru-RU')} ₸ <span className="text-xs font-normal text-slate-400">/ год</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-700/60">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Налог с дохода (2%):</span>
                    <span className="font-mono">{Math.round(atyrauResult.revenueTax).toLocaleString('ru-RU')} ₸</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Налоги с зарплат:</span>
                    <span className="font-mono">{Math.round(monthlyPayrollKZT * 12 * 0.165).toLocaleString('ru-RU')} ₸</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 text-sky-300">
                    <span>Эффективная ставка:</span>
                    <span className="font-mono">{atyrauResult.effectiveRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2 rounded-lg mt-2">
                  Требует официального подтверждения действующего решения маслихата Атырау.
                </div>
              </div>

              {/* Option 2: Standard SNR 3% */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">СНР Стандарт 3%</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                    Гарантирован РК
                  </span>
                </div>
                <div className="text-xl font-extrabold text-white font-mono">
                  {Math.round(standardResult.totalTax).toLocaleString('ru-RU')} ₸ <span className="text-xs font-normal text-slate-400">/ год</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-700/60">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Налог с дохода (3%):</span>
                    <span className="font-mono">{Math.round(standardResult.revenueTax).toLocaleString('ru-RU')} ₸</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Налоги с зарплат:</span>
                    <span className="font-mono">{Math.round(monthlyPayrollKZT * 12 * 0.165).toLocaleString('ru-RU')} ₸</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 text-slate-200">
                    <span>Эффективная ставка:</span>
                    <span className="font-mono">{standardResult.effectiveRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-800 p-2 rounded-lg mt-2">
                  Базовый режим до вступления в Astana Hub. Без риска претензий.
                </div>
              </div>

              {/* Option 3: Astana Hub (Recommended) */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-500/50 space-y-2 relative shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">Резидент Astana Hub</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                    0% КПН / НДС
                  </span>
                </div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono">
                  {Math.round(hubResult.totalTax).toLocaleString('ru-RU')} ₸ <span className="text-xs font-normal text-slate-400">/ год</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-700/60">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Сбор в технопарк (1%):</span>
                    <span className="font-mono">{Math.round(hubResult.revenueTax).toLocaleString('ru-RU')} ₸</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Налоги с зарплат (льгота):</span>
                    <span className="font-mono">{Math.round(monthlyPayrollKZT * 12 * 0.13).toLocaleString('ru-RU')} ₸</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 text-emerald-300">
                    <span>Эффективная ставка:</span>
                    <span className="font-mono">{hubResult.effectiveRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg mt-2 font-medium">
                  Чистая экономия против стандартного СНР: +{Math.round(savingsHubVsStandard).toLocaleString('ru-RU')} ₸ / год!
                </div>
              </div>

            </div>

            {/* Strategic Conclusion */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 text-xs text-slate-300 space-y-1.5">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-400" />
                Вывод для стратегии:
              </span>
              <p>
                1. На старте (до 5–10 клиентов): работаем на СНР упрощенки (2% или 3%), чтобы не нести административные расходы по отчетности Astana Hub.<br />
                2. При превышении выручки <strong>15–20 млн ₸ в год</strong> или найме более 3 штатных разработчиков/операторов оформляем статус резидента Astana Hub — экономия на зарплатных налогах и КПН полностью окупает 1% сбор.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LEGAL TEMPLATES */}
      {activeSubTab === 'legal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Template Selector List */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              Юридические шаблоны ({legalTemplates.length})
            </h3>
            {legalTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setTemplateContent(template.content);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedTemplate?.id === template.id
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{template.category}</span>
                  {template.isDraft && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                      Черновик
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white mt-1 line-clamp-2">
                  {template.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {template.lawBasis}
                </p>
              </div>
            ))}
          </div>

          {/* Template Live Editor */}
          {selectedTemplate && (
            <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ЧЕРНОВИК ДО ПРОВЕРКИ ЮРИСТОМ
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Обновлен: {selectedTemplate.lastUpdated}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{selectedTemplate.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyTemplate(templateContent, selectedTemplate.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedId === selectedTemplate.id ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Сохранить</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Основание: <strong className="text-slate-200">{selectedTemplate.lawBasis}</strong>. Все договоры обозначаются как черновики до проверки юристом.
              </div>

              <textarea
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                rows={18}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 3: QAZPATENT TRADEMARK REGISTRATION */}
      {activeSubTab === 'qazpatent' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              Регистрация товарного знака в Qazpatent (Казпатент)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Защита бренда сервиса на территории Республики Казахстан. Реестр РГП «Национальный институт интеллектуальной собственности» (НИИС).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700">
              <span className="text-xs font-bold text-indigo-400">Класс 09 МКТУ</span>
              <h4 className="text-xs font-semibold text-white mt-1">Программное обеспечение</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Программы для ЭВМ, алгоритмы автоматической обработки сообщений, интерфейсы чат-ботов.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700">
              <span className="text-xs font-bold text-purple-400">Класс 35 МКТУ</span>
              <h4 className="text-xs font-semibold text-white mt-1">Реклама и бизнес</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Лидогенерация, управление клиентами (CRM), автоматизация маркетинга для МСБ.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700">
              <span className="text-xs font-bold text-sky-400">Класс 38 МКТУ</span>
              <h4 className="text-xs font-semibold text-white mt-1">Телекоммуникации</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Передача электронных сообщений, маршрутизация диалогов в мессенджерах.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700">
              <span className="text-xs font-bold text-emerald-400">Класс 42 МКТУ</span>
              <h4 className="text-xs font-semibold text-white mt-1">SaaS / Облачные сервисы</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Предоставление программного обеспечения как услуги, хостинг облачных платформ.
              </p>
            </div>
          </div>

          {/* Procedure Timeline */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Этапы регистрации товарного знака в РК:
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Предварительный поиск (1–3 дня):</strong> Проверка названия по базе зарегистрированных и заявленных знаков РК (gosreestr.kazpatent.kz).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Подача электронной заявки:</strong> Подписание ЭЦП через cabinet.kazpatent.kz и фиксация даты приоритета.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  <strong>Предварительная экспертиза (1 месяц):</strong> Проверка правильности заполнения документов и оплаты пошлины (~18 000 ₸).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                <div>
                  <strong>Полная экспертиза (до 7 месяцев):</strong> Проверка на различительную способность и сходство. Оплата пошлины за экспертизу (~45 000 ₸).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">5</span>
                <div>
                  <strong>Выдача охранного свидетельства:</strong> Действует 10 лет с правом продления на всей территории Казахстана.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: KASPI PAY, KASPI RED+ & KASPI КАССА */}
      {activeSubTab === 'kaspi' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-400" />
              Kaspi Pay, Kaspi Red+ и Kaspi Касса
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Официальное подключение приема оплат для юридических лиц и ИП без фиктивных интеграций.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            
            {/* Kaspi Pay B2B Remote Invoicing */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">Удаленный счёт Kaspi Pay</h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">B2B & B2C</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Выставление счёта на оплату клиенту по его номеру телефона прямо в мобильное приложение Kaspi.kz.
              </p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/60 space-y-1">
                <div>• Комиссия Kaspi Gold: <strong>0.95%</strong></div>
                <div>• Срок зачисления: <strong>мгновенно</strong> на счёт Kaspi Pay</div>
                <div>• Доступно для ИП и ТОО</div>
              </div>
            </div>

            {/* Kaspi Red+ */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">Kaspi Red+ и Кредит</h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Рассрочка</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Возможность для клиентов оплачивать годовые тарифы (99 000 – 299 000 ₸) в рассрочку без переплаты.
              </p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/60 space-y-1">
                <div>• Комиссия эквайринга: <strong>от 2.3% до 8%</strong></div>
                <div>• Требуется подключение партнёрства в Kaspi Pay</div>
                <div>• Оценка целесообразности в юнит-экономике</div>
              </div>
            </div>

            {/* Kaspi Kassa / WebKassa */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">Фискализация (Касса)</h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">ОФД РК</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Формирование фискальных чеков при получении оплат с передачей данных операторам ОФД (Казахтелеком/Транстелеком).
              </p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/60 space-y-1">
                <div>• Встроенная Kaspi Касса (бесплатно в приложении)</div>
                <div>• Альтернатива: WebKassa / Rekassa</div>
                <div>• Полное соответствие Налоговому кодексу РК</div>
              </div>
            </div>

          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Внимание: Система не отправляет и не списывает деньги автоматически. Все счета выставляются вручную через официальное приложение Kaspi Pay.
            </span>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ASTANA HUB RESIDENCY */}
      {activeSubTab === 'astana_hub' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-400" />
              Дорожная карта резидентства в Astana Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Экстерриториальные налоговые преференции международного технопарка для казахстанского SaaS.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
              <span className="text-xs text-indigo-400 font-bold">Экстерриториальность</span>
              <p className="text-xs text-slate-300">
                Компания может быть зарегистрирована и фактически работать в <strong>г. Атырау</strong> без переезда в Астану.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
              <span className="text-xs text-indigo-400 font-bold">Налоговые каникулы</span>
              <p className="text-xs text-slate-300">
                <strong>0% КПН</strong>, <strong>0% ИПН</strong> на доходы сотрудников, <strong>0% НДС</strong> на лицензии ПО.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
              <span className="text-xs text-indigo-400 font-bold">Обязательства</span>
              <p className="text-xs text-slate-300">
                Ежеквартальный сбор <strong>1% от доходов</strong>, запрет на непрофильную деятельность, сдача отчетов.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              План вступления:
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <span>1. Аудит соответствия Приказу МЦРИАП №125/НҚ (Перечень ПВД)</span>
                <span className="text-emerald-400 font-semibold">Готово</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <span>2. Регистрация ТОО с целевыми кодами ОКЭД 62.01 / 58.29</span>
                <span className="text-indigo-400 font-semibold">В плане</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <span>3. Составление бизнес-плана по шаблону Astana Hub (3 года)</span>
                <span className="text-slate-400">Ожидает</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <span>4. Электронная подача заявки с ЭЦП через portal.astanahub.com</span>
                <span className="text-slate-400">Ожидает</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <span>5. Защита перед комиссией и получение свидетельства резидента</span>
                <span className="text-slate-400">Ожидает</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: COMPLIANCE CALENDAR */}
      {activeSubTab === 'compliance' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-indigo-400" />
                Календарь обязательств и комплаенс-контроль
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Контроль сроков сдачи налоговой отчетности ф. 910/200, уплаты соцплатежей и продления сертификатов ЭЦП.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {obligations.map(ob => (
              <div 
                key={ob.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-indigo-300 font-mono">{ob.nextDeadline}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{ob.authority}</span>
                    <span className="text-slate-500">·</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 text-[10px]">
                      {ob.recurrence}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">{ob.title}</h4>
                  <p className="text-xs text-slate-400">{ob.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400">{ob.deadlineRule}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 7: RISK REGISTER */}
      {activeSubTab === 'risks' && (
        <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Реестр рисков компании ({risks.length})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Систематический мониторинг правовых, налоговых, репутационных и технических угроз с планом компенсаторных действий.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {risks.map(risk => {
              const impactColor = risk.impact === 'Критический' 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : risk.impact === 'Высокий'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-700 text-slate-300 border-slate-600';

              return (
                <div 
                  key={risk.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">{risk.category}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Вероятность: <strong>{risk.probability}</strong></span>
                        <span className={`px-1.5 py-0.2 rounded font-semibold border text-[10px] ${impactColor}`}>
                          {risk.impact}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">{risk.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <strong>Компенсация:</strong> {risk.mitigationStrategy}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                    <span>Ответственный: <strong>{risk.owner === 'founder' ? 'Founder' : 'Operations'}</strong></span>
                    <span className="text-emerald-400 font-medium">{risk.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
