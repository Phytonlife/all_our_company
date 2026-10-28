import React, { useState } from 'react';
import { EventItem } from '../types';
import { StorageService } from '../services/storage';
import { 
  Calendar, MapPin, Users, CheckSquare, Plus, ExternalLink, 
  Clock, CheckCircle2, ChevronRight, FileText, QrCode
} from 'lucide-react';

interface EventsViewProps {
  events: EventItem[];
  onEventsUpdated: (updated: EventItem[]) => void;
}

const STEP_LABELS = [
  "1. Идея и аудитория",
  "2. Контакт с организатором",
  "3. Согласование даты/зала",
  "4. Подготовка презентации",
  "5. Форма регистрации opt-in",
  "6. Анонс и приглашения",
  "7. Чек-лист оборудования",
  "8. Репетиция и тест демо",
  "9. Проведение события",
  "10. Follow-up и аналитика"
];

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onEventsUpdated
}) => {
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(events[0] || null);

  const handleToggleStep = (event: EventItem, stepIndex: number) => {
    const updatedSteps = [...event.stepsCompleted];
    updatedSteps[stepIndex] = !updatedSteps[stepIndex];
    const newCurrentStep = updatedSteps.filter(Boolean).length;
    
    const updated = StorageService.updateEvent(event.id, {
      stepsCompleted: updatedSteps,
      currentStep: newCurrentStep
    });
    onEventsUpdated(updated);
    if (activeEvent && activeEvent.id === event.id) {
      setActiveEvent({ ...activeEvent, stepsCompleted: updatedSteps, currentStep: newCurrentStep });
    }
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Организации и деловые мероприятия в Атырау</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Atyrau Hub, Atameken, Damu и площадки
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              10-шаговый визард подготовки мероприятий: от первого письма до follow-up и подтвержденных оплат.
            </p>
          </div>
        </div>
      </div>

      {/* Events Grid & Wizard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left: Events List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Запланированные события ({events.length})
          </h3>
          {events.map(evt => (
            <div
              key={evt.id}
              onClick={() => setActiveEvent(evt)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                activeEvent?.id === evt.id
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-indigo-400 font-semibold">
                <span>{evt.organization}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Шаг {evt.currentStep}/10
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1 line-clamp-2">
                {evt.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{evt.venue}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                <span>Спикер: {evt.speaker}</span>
                <span className="text-indigo-400 font-medium">Открыть →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: 10-Step Interactive Wizard */}
        {activeEvent && (
          <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-indigo-400">{activeEvent.organization}</span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{activeEvent.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Контакт: <strong>{activeEvent.contactPerson}</strong> ({activeEvent.contactChannel})
                </p>
              </div>

              {activeEvent.sourceUrl && (
                <a
                  href={activeEvent.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 self-start transition"
                >
                  <span>Ссылка</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Metrics Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400">Ожидаемо гостей:</span>
                <div className="font-bold text-white font-mono mt-0.5">{activeEvent.expectedAudience} чел</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400">Записей на демо:</span>
                <div className="font-bold text-indigo-400 font-mono mt-0.5">{activeEvent.demoBookings}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400">Оплат за 30 дней:</span>
                <div className="font-bold text-emerald-400 font-mono mt-0.5">{activeEvent.paidClients30d} (Факт)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400">Расходы на запуск:</span>
                <div className="font-bold text-slate-300 font-mono mt-0.5">{activeEvent.costKZT.toLocaleString('ru-RU')} ₸</div>
              </div>
            </div>

            {/* 10-Step Wizard Checklist */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                10 этапов подготовки мероприятия:
              </h4>

              <div className="space-y-1.5">
                {STEP_LABELS.map((label, idx) => {
                  const isChecked = activeEvent.stepsCompleted[idx] || false;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleStep(activeEvent, idx)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked 
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                        />
                        <span className={isChecked ? 'font-medium' : ''}>{label}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {isChecked ? 'Выполнено' : 'В ожидании'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-xs text-slate-300">
              <strong>Заметки координации:</strong> {activeEvent.notes}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
