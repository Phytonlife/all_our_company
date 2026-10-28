import React, { useState } from 'react';
import { PlaybookSection } from '../types';
import { StorageService } from '../services/storage';
import { 
  BookOpen, Edit3, Save, Copy, CheckCircle2, 
  ExternalLink, Search, Sparkles, FileText, ChevronRight
} from 'lucide-react';

interface PlaybooksViewProps {
  playbooks: PlaybookSection[];
  onPlaybooksUpdated: (updated: PlaybookSection[]) => void;
}

export const PlaybooksView: React.FC<PlaybooksViewProps> = ({
  playbooks,
  onPlaybooksUpdated
}) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookSection | null>(playbooks[0] || null);
  const [editingContent, setEditingContent] = useState<string>(playbooks[0]?.markdownContent || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', 'Оффер и Демо', 'Мероприятия Hub/Damu', 'Партнёры', 'Торговые', 'Маркетинг и Таргет', 'Города и Процессы'];

  const filteredPlaybooks = playbooks.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.markdownContent.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelect = (p: PlaybookSection) => {
    setSelectedPlaybook(p);
    setEditingContent(p.markdownContent);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!selectedPlaybook) return;
    const updated = StorageService.updatePlaybook(selectedPlaybook.id, editingContent);
    onPlaybooksUpdated(updated);
    setIsEditing(false);
    alert('Материалы базы знаний успешно сохранены!');
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Редактируемая база знаний & Playbooks v2</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Материалы, скрипты и регламенты компании
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Все сценарии демо, письма для Hub/Damu, скрипты визитов и регламенты доступны для редактирования и копирования.
            </p>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-3 border-t border-slate-800 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Все разделы' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Selector + Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Playbook List */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по базе знаний..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            {filteredPlaybooks.map(p => (
              <div
                key={p.id}
                onClick={() => handleSelect(p)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedPlaybook?.id === p.id
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] font-semibold text-indigo-400">
                  {p.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5 line-clamp-2">
                  {p.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {p.shortDescription}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Viewer / Editor */}
        {selectedPlaybook && (
          <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-indigo-400 font-semibold">{selectedPlaybook.category}</span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{selectedPlaybook.title}</h3>
                <span className="text-[11px] text-slate-500">Последнее изменение: {selectedPlaybook.lastEdited}</span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => handleCopy(editingContent, selectedPlaybook.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === selectedPlaybook.id ? 'Скопировано!' : 'Копировать текст'}</span>
                </button>
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Сохранить</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Редактировать</span>
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                rows={20}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-wrap font-sans bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                {editingContent}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
