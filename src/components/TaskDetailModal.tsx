import React, { useState } from 'react';
import { 
  X, CheckSquare, Square, ExternalLink, Phone, Mail, 
  Copy, Check, AlertTriangle, Clock, ArrowRight, ShieldAlert,
  Calendar, Award, User, HelpCircle
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { formatRussianDate, formatShortDate } from '../utils/dateUtils';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: TaskStatus, note?: string) => void;
  onToggleStep: (taskId: string, stepId: string, done: boolean) => void;
  onPostpone: (taskId: string, newDate: string, reason: string) => void;
  onSaveEvidence: (taskId: string, evidenceNote: string, proofUrl?: string) => void;
  onRequestHelp?: (taskId: string, note: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdateStatus,
  onToggleStep,
  onPostpone,
  onSaveEvidence,
  onRequestHelp
}) => {
  const [copied, setCopied] = useState(false);
  const [evidenceText, setEvidenceText] = useState(task.evidenceNote || task.notes || '');
  const [proofUrlInput, setProofUrlInput] = useState(task.proofUrls?.[0] || '');
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [newPostponeDate, setNewPostponeDate] = useState(task.scheduledDate);
  const [postponeReason, setPostponeReason] = useState('');
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [blockerReason, setBlockerReason] = useState('');
  const [helpNoteSaved, setHelpNoteSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const guide = task.guide;
  const checklist = task.guidedChecklist || (task.checklist || []).map((c, i) => ({
    id: `chk-${i}`,
    title: c.title,
    done: c.done
  }));

  const totalSteps = checklist.length;
  const completedSteps = checklist.filter(c => c.done).length;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : (task.status === 'done' ? 100 : 0);

  // Status visual mapping
  const getStatusBadge = () => {
    switch (task.status) {
      case 'done':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">✓ Готово</span>;
      case 'waiting_external':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">⏳ Ждём ответ</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">● В работе</span>;
      case 'blocked':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">✕ Заблокировано</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/50">○ Не начато</span>;
    }
  };

  const handleCopyExample = () => {
    const textToCopy = guide?.example || task.description;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCompleteTask = () => {
    if (completedSteps < totalSteps && totalSteps > 0) {
      const confirmIncomplete = window.confirm(
        `Отмечено только ${completedSteps} из ${totalSteps} шагов.\nВы уверены, что все обязательные критерии выполнены?`
      );
      if (!confirmIncomplete) return;
    }

    onSaveEvidence(task.id, evidenceText, proofUrlInput);
    onUpdateStatus(task.id, 'done', evidenceText);
    setStatusMessage('Задача успешно подтверждена и отмечена выполненной!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleHelpClick = () => {
    const note = `[${formatShortDate(task.scheduledDate)}] Запрос поддержки от исполнителя (${task.ownerRole === 'operations' ? 'Супруга' : 'Основатель'})`;
    if (onRequestHelp) {
      onRequestHelp(task.id, note);
    }
    setHelpNoteSaved(true);
    setStatusMessage('Заметка о запросе помощи зафиксирована в карточке. Для push-уведомлений на другое устройство требуется подключение общего сервера.');
  };

  const handleSavePostpone = () => {
    if (!postponeReason.trim()) {
      alert('Пожалуйста, укажите причину переноса срока для журнала контроля.');
      return;
    }
    onPostpone(task.id, newPostponeDate, postponeReason);
    setShowPostponeModal(false);
  };

  const handleSaveBlocker = () => {
    if (!blockerReason.trim()) {
      alert('Укажите, что именно блокирует задачу.');
      return;
    }
    onUpdateStatus(task.id, 'blocked', `Заблокировано: ${blockerReason}`);
    setShowBlockerModal(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-4 sm:p-5 bg-[#131f37] border-b border-slate-700/80">
          <div className="flex-1 pr-3">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                task.ownerRole === 'founder' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {task.ownerRole === 'founder' ? 'Основатель' : 'Супруга (Operations)'}
              </span>
              <span className="text-xs text-slate-400">
                День {task.dayNumber} · {formatRussianDate(task.scheduledDate)}
              </span>
              {getStatusBadge()}
              {task.legacyUnverified && (
                <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Требует подтверждения
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {task.title}
            </h2>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{task.workstream || 'Направление'}</span>
              <span>•</span>
              <span>{task.estimateMinutes} мин.</span>
              <span>•</span>
              <span className="font-semibold text-slate-300">Приоритет {task.priority}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Circular mini progress */}
            <div className="relative w-11 h-11 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-slate-700"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className={`${progressPct === 100 ? 'stroke-emerald-400' : progressPct > 40 ? 'stroke-indigo-400' : 'stroke-blue-400'} transition-all duration-300`}
                  strokeWidth="3"
                  strokeDasharray={`${progressPct * 0.88}, 100`}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-white">{progressPct}%</span>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm">
          {/* Status Alert if set */}
          {statusMessage && (
            <div className="p-3 bg-blue-900/40 border border-blue-500/50 rounded-xl text-blue-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Section 1: Зачем это? */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/70 rounded-xl">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-400" />
              1. Зачем эта задача бизнесу?
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed">
              {guide?.why || task.description || 'Обеспечение операционной готовности и исключение ошибок ручного запуска.'}
            </p>
          </div>

          {/* Section 2: Первое действие и Шаги */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                2. Что делать по шагам ({completedSteps}/{totalSteps})
              </h3>
              <span className="text-xs text-slate-400">
                {progressPct}% шагов
              </span>
            </div>

            {guide?.firstAction && (
              <div className="mb-3 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-indigo-200 text-xs">
                <span className="font-bold text-indigo-300 block mb-1">▶ Первое действие на сегодня:</span>
                {guide.firstAction}
              </div>
            )}

            <div className="space-y-2">
              {checklist.map((step, idx) => (
                <div 
                  key={step.id || idx}
                  onClick={() => onToggleStep(task.id, step.id, !step.done)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    step.done 
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300' 
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-white'
                  }`}
                >
                  <button 
                    type="button"
                    className="mt-0.5 flex-shrink-0 text-slate-400"
                  >
                    {step.done ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 hover:text-slate-200" />
                    )}
                  </button>
                  <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                    <span className={`inline-block mr-1 font-semibold ${step.done ? 'text-emerald-400 line-through' : 'text-slate-400'}`}>
                      Шаг {idx + 1}.
                    </span>
                    <span className={step.done ? 'line-through text-slate-400' : 'text-slate-100'}>
                      {step.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Официальные контакты и ссылки */}
          <div className="p-4 bg-slate-800/40 border border-slate-700/70 rounded-xl">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              3. Официальные источники и контакты
            </h3>

            {task.links && task.links.length > 0 ? (
              <div className="space-y-2.5">
                {task.links.map((link, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-cyan-300">{link.label}</span>
                      {link.verifiedAsOf && (
                        <span className="text-[10px] text-slate-400">Проверено {link.verifiedAsOf}</span>
                      )}
                    </div>

                    {link.contact?.address && (
                      <div className="text-xs text-slate-300 mb-1.5">
                        📍 <span className="text-slate-400">Адрес:</span> {link.contact.address}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {link.url && (
                        <a 
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Официальный сайт ↗
                        </a>
                      )}

                      {link.contact?.phone ? (
                        <a 
                          href={`tel:${link.contact.phone.replace(/[^+\d]/g, '')}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Позвонить {link.contact.phone}
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Прямой телефон: уточнить при личном визите
                        </span>
                      )}

                      {link.contact?.email && (
                        <a 
                          href={`mailto:${link.contact.email}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Написать письмо
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Внешние контакты не требуются (внутренняя техническая, продуктовая или плановая задача компании).
              </p>
            )}
          </div>

          {/* Section 4: Готовый пример текста / скрипт */}
          {guide?.example && (
            <div className="p-4 bg-slate-800/40 border border-slate-700/70 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Copy className="w-4 h-4 text-purple-400" />
                  4. Готовый пример текста / скрипт
                </h3>
                <button
                  type="button"
                  onClick={handleCopyExample}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Скопировано!' : 'Скопировать'}
                </button>
              </div>

              <div className="p-3 bg-slate-900/70 border border-slate-700/60 rounded-lg text-xs sm:text-sm text-slate-200 leading-relaxed font-sans select-all whitespace-pre-wrap">
                {guide.example}
              </div>
              <div className="text-[11px] text-amber-300/80 mt-1.5 italic">
                * Учебный пример формулировки. Перед звонком или отправкой адаптируйте под конкретную нишу.
              </div>
            </div>
          )}

          {/* Section 5: Что должно получиться & Подтверждение */}
          <div className="p-4 bg-slate-800/40 border border-slate-700/70 rounded-xl space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              5. Что должно получиться (Критерий завершения)
            </h3>

            {guide?.deliverable && (
              <div className="text-xs text-slate-200">
                <span className="font-bold text-amber-300">Артефакт:</span> {guide.deliverable}
              </div>
            )}

            {guide?.qualityGate && (
              <div className="text-xs text-slate-300 p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/40">
                <span className="font-bold text-emerald-300">Quality Gate:</span> {guide.qualityGate}
              </div>
            )}

            {/* Evidence Note Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Фактический результат / Ссылка на подтверждение:
              </label>
              <textarea
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                placeholder="Зафиксируйте результат: что сделано, с кем поговорили, дата следующего шага..."
                className="w-full h-16 p-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Request Help button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleHelpClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {helpNoteSaved ? 'Запрос помощи зафиксирован' : 'Нужна помощь (зафиксировать заметку)'}
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-10 p-3 sm:p-4 bg-[#131f37] border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onUpdateStatus(task.id, 'in_progress')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                task.status === 'in_progress'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              В работе
            </button>

            <button
              type="button"
              onClick={() => onUpdateStatus(task.id, 'waiting_external')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                task.status === 'waiting_external'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Ждём ответ
            </button>

            <button
              type="button"
              onClick={() => setShowBlockerModal(true)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                task.status === 'blocked'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Блокер
            </button>

            <button
              type="button"
              onClick={() => setShowPostponeModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              Перенести
            </button>
          </div>

          <button
            type="button"
            onClick={handleCompleteTask}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {task.status === 'done' ? 'Обновить подтверждение' : 'Подтвердить и готово'}
          </button>
        </div>

        {/* Postpone Sub-Modal */}
        {showPostponeModal && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-sm p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3">
              <h4 className="font-bold text-white text-sm">Перенос срока задачи</h4>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Новая дата (YYYY-MM-DD):</label>
                <input 
                  type="date"
                  value={newPostponeDate}
                  onChange={(e) => setNewPostponeDate(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Причина переноса:</label>
                <textarea
                  value={postponeReason}
                  onChange={(e) => setPostponeReason(e.target.value)}
                  placeholder="Например: ожидание ответа от координатора Hub..."
                  className="w-full h-16 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostponeModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSavePostpone}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                >
                  Сохранить перенос
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blocker Sub-Modal */}
        {showBlockerModal && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-sm p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                Фиксация блокера
              </h4>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Что именно блокирует выполнение?</label>
                <textarea
                  value={blockerReason}
                  onChange={(e) => setBlockerReason(e.target.value)}
                  placeholder="Опишите причину и кто должен её решить..."
                  className="w-full h-20 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockerModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSaveBlocker}
                  className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-500"
                >
                  Зафиксировать блокер
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
