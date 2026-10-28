import React, { useState } from 'react';
import { StorageService, AppSettings } from '../services/storage';
import { 
  Settings, Download, Upload, Shield, RotateCcw, Smartphone, 
  Server, Lock, CheckCircle2, AlertTriangle, FileText, Globe
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
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState(StorageService.getAuditLogs());

  const handleSaveLimits = () => {
    StorageService.saveSettings({
      founderDailyLimitMinutes: founderLimit,
      operationsDailyLimitMinutes: opsLimit,
      activeCity
    });
    onSettingsUpdated({
      ...settings,
      founderDailyLimitMinutes: founderLimit,
      operationsDailyLimitMinutes: opsLimit,
      activeCity
    });
    alert('Настройки лимитов нагрузки сохранены!');
  };

  const handleExport = () => {
    const json = StorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growth_os_kz_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = StorageService.importAllData(importJsonText);
    if (success) {
      alert('Резервная копия успешно восстановлена!');
      window.location.reload();
    } else {
      alert('Ошибка при чтении файла резервной копии. Проверьте формат JSON.');
    }
  };

  const handleReset = () => {
    if (confirm('ВНИМАНИЕ: Это восстановит начальное состояние базы данных (237 плановых задач). Все ваши отметки будут сброшены. Продолжить?')) {
      StorageService.resetToInitial();
      onDataReset();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
          <Settings className="w-3.5 h-3.5" />
          <span>Параметры системы и безопасность данных</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
          Настройки, PWA и архитектура данных РК
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Управление резервными копиями, лимитами доступности времени и комплаенс по ст. 12 Закона РК о ПДн.
        </p>
      </div>

      {/* SECTION 1: KAZAKHSTAN DATA RESIDENCY EXPLANATION */}
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
              <Lock className="w-4 h-4 text-indigo-400" />
              Почему нет синхронизации между двумя разными телефонами в тестовой версии:
            </span>
            <p>
              В соответствии со <strong>статьей 12 Закона Республики Казахстан «О персональных данных и их защите»</strong>, персональные данные граждан РК (телефоны клиентов, имена, переписка) обязаны физически храниться на серверах внутри Республики Казахстан.
            </p>
            <p>
              Использование публичных зарубежных баз данных (например, американских или европейских облаков) для боевой CRM нарушает закон РК. Для реальной защищенной синхронизации между вашим телефоном и телефоном супруги спроектирован <strong>бэкенд на PostgreSQL в казахстанском ЦОД (PS.kz / Servercore KZ в г. Алматы)</strong> с шифрованием AES-256.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: WORKLOAD LIMITS */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          Лимиты доступности времени команды
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700">
            <label className="font-semibold text-indigo-300">
              Дневной лимит Founder (минут/будни):
            </label>
            <input
              type="number"
              value={founderLimit}
              onChange={(e) => setFounderLimit(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
            <span className="text-[11px] text-slate-400">Рекомендуется: 90–120 мин на демо и ключевые задачи</span>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700">
            <label className="font-semibold text-purple-300">
              Дневной лимит Operations / Супруга (минут/будни):
            </label>
            <input
              type="number"
              value={opsLimit}
              onChange={(e) => setOpsLimit(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
            <span className="text-[11px] text-slate-400">Рекомендуется: 20–40 мин без перегрузки семейного графика</span>
          </div>
        </div>

        <button
          onClick={handleSaveLimits}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
        >
          Сохранить лимиты
        </button>
      </div>

      {/* SECTION 3: BACKUP / EXPORT / IMPORT */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" />
          Резервное копирование и перенос данных (JSON)
        </h3>
        <p className="text-xs text-slate-400">
          Вы можете выгрузить полный архив всех 237 задач, сделок, шаблонов и заметок в файл и импортировать на другой телефон.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Экспорт резервной копии (JSON)</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Восстановить из файла</span>
          </button>
        </div>
      </div>

      {/* SECTION 4: AUDIT LOGS */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Журнал аудита действий (Audit Log)
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs font-mono pr-2">
          {auditLogs.length === 0 ? (
            <div className="text-slate-500 text-[11px] italic">Журнал чист.</div>
          ) : (
            auditLogs.slice(0, 15).map((log, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-800/40 text-slate-300 flex items-center justify-between text-[11px]">
                <span>{log.details}</span>
                <span className="text-slate-500 shrink-0 ml-2">
                  {new Date(log.timestamp).toLocaleTimeString('ru-RU')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 5: DANGER ZONE */}
      <div className="rounded-2xl bg-rose-950/20 border border-rose-900/40 p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Опасная зона
        </h3>
        <p className="text-xs text-rose-300">
          Сброс вернет исходный чистый план 237 задач v2.2. Используйте только если хотите полностью начать заново.
        </p>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-medium transition"
        >
          Сбросить локальные данные к начальным
        </button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="font-bold text-base text-white">Вставьте содержимое JSON бэкапа</h3>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Вставьте скопированный текст из файла резервной копии..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs text-slate-400"
              >
                Отмена
              </button>
              <button
                onClick={handleImport}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium text-xs"
              >
                Импортировать данные
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
