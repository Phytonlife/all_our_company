import React, { useState } from 'react';
import { StorageService, AppSettings } from '../services/storage';
import { 
  Settings, Download, Upload, Shield, RotateCcw, Smartphone, 
  Server, Lock, CheckCircle2, AlertTriangle, FileText, Globe,
  Calendar, Check, Info
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSettingsUpdated: (updated: AppSettings) => void;
  onDataReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSettingsUpdated,
  onDataReset
}) => {
  const [founderLimit, setFounderLimit] = useState(settings.founderDailyLimitMinutes);
  const [opsLimit, setOpsLimit] = useState(settings.operationsDailyLimitMinutes);
  const [activeCity, setActiveCity] = useState(settings.activeCity);
  const [startDate, setStartDate] = useState(settings.startDate || '2026-10-28');
  const [endDate, setEndDate] = useState(settings.endDate || '2027-01-25');
  const [simulatedDate, setSimulatedDate] = useState(settings.simulatedDate || '');
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveSettings = () => {
    const updated: AppSettings = {
      ...settings,
      founderDailyLimitMinutes: founderLimit,
      operationsDailyLimitMinutes: opsLimit,
      activeCity,
      startDate,
      endDate,
      simulatedDate: simulatedDate.trim() ? simulatedDate.trim() : null
    };
    StorageService.saveSettings(updated);
    onSettingsUpdated(updated);
    setMessage('Настройки успешно сохранены!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    const json = StorageService.exportAllDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growth_os_kz_backup_v3_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Резервная копия скачана в формате JSON.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const res = StorageService.importAllDataJSON(importJsonText);
    if (res.success) {
      alert(res.message);
      window.location.reload();
    } else {
      alert(res.message);
    }
  };

  const handleRestorePreV3 = () => {
    if (confirm('Восстановить резервную копию до перехода на v3? Это отменит последние изменения.')) {
      const ok = StorageService.restorePreV3Backup();
      if (ok) {
        alert('Резервная копия до миграции восстановлена!');
        window.location.reload();
      } else {
        alert('Резервная копия до миграции не найдена.');
      }
    }
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#111a2b] via-[#142138] to-[#0c1322] border border-slate-700/80 p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
          <Settings className="w-3.5 h-3.5" />
          <span>Параметры системы, резервные копии и безопасность РК</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
          Настройки, бэкапы и локализация данных
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
          Управление резервными копиями JSON, временными границами и комплаенс со ст. 12 Закона РК о ПДн.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* SECTION 1: KAZAKHSTAN DATA RESIDENCY */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <Shield className="w-5 h-5 shrink-0" />
          <h2 className="text-base font-bold text-white">
            Безопасный локальный режим & Синхронизация между устройствами
          </h2>
        </div>
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
          <p>
            <strong>Текущий статус приложения:</strong> Приложение работает в <em>изолированном локальном режиме (Local Sandbox Mode)</em> на вашем текущем устройстве. Все изменения, чек-листы, сделки и расходы мгновенно сохраняются в локальном хранилище браузера и не потеряются при перезагрузке.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-300 space-y-1.5">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-400" />
              Почему нет синхронизации между двумя разными телефонами в тестовой версии:
            </span>
            <p>
              В соответствии со <strong>статьей 12 Закона Республики Казахстан «О персональных данных и их защите»</strong>, персональные данные граждан РК (телефоны клиентов, имена, переписка) обязаны физически храниться на серверах внутри Республики Казахстан.
            </p>
            <p>
              Использование публичных зарубежных баз данных для боевой CRM нарушает закон РК. Для реальной защищенной синхронизации между вашим телефоном и телефоном супруги спроектирован <strong>бэкенд на PostgreSQL в казахстанском ЦОД (PS.kz / Servercore KZ в г. Алматы)</strong> с шифрованием AES-256.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: BACKUP & RESTORE */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" />
          Резервное копирование и экспорт (Backup JSON)
        </h3>
        <p className="text-xs text-slate-400">
          Выгружайте резервную копию всех 237 задач, чек-листов, заметок и CRM сделок в файл JSON, чтобы гарантировать сохранность данных.
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Скачать полный бэкап (JSON)</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Восстановить из файла</span>
          </button>

          <button
            onClick={handleRestorePreV3}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Откатить до версии v2.2 (Undo)</span>
          </button>
        </div>

        {showImportModal && (
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
            <h4 className="font-bold text-white text-xs">Вставьте содержимое JSON резервной копии:</h4>
            <textarea
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder='{"version": "3.0.0", "tasks": [...]}'
              className="w-full h-32 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
              >
                Восстановить данные
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: CAMPAIGN DATES & SIMULATION */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          Границы 90-дневного плана и симуляция даты
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Дата старта (День 1):</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Дата финала (День 90):</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Ручная дата (Тест):</label>
            <input
              type="date"
              value={simulatedDate}
              onChange={e => setSimulatedDate(e.target.value)}
              placeholder="Пусто = реальная дата"
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Оставьте пустым для реальной даты Asia/Atyrau</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Лимит времени Founder (мин/день):</label>
            <input
              type="number"
              value={founderLimit}
              onChange={e => setFounderLimit(Number(e.target.value))}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Лимит времени Супруга (мин/день):</label>
            <input
              type="number"
              value={opsLimit}
              onChange={e => setOpsLimit(Number(e.target.value))}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveSettings}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow"
          >
            Сохранить параметры
          </button>
        </div>
      </div>
    </div>
  );
};
