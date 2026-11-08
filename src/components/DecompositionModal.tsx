import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Trash2, 
  Edit3, 
  Calendar, 
  Users, 
  Tag
} from 'lucide-react';
import { DecompositionResult, DecomposedItemDraft, CategoryType, ImportanceLevel, Memory } from '../types';
import { CATEGORIES } from '../utils/constants';

interface DecompositionModalProps {
  data: DecompositionResult;
  onClose: () => void;
  onSaveApproved: (memories: Memory[]) => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const DecompositionModal: React.FC<DecompositionModalProps> = ({
  data,
  onClose,
  onSaveApproved,
  onToast
}) => {
  const [items, setItems] = useState<DecomposedItemDraft[]>(data.items);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states when editing a card
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<CategoryType>('things_to_remember');
  const [editImportance, setEditImportance] = useState<ImportanceLevel>('medium');
  const [editDate, setEditDate] = useState<string>('');

  const startEdit = (item: DecomposedItemDraft) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditCategory(item.category);
    setEditImportance(item.importance);
    setEditDate(item.reminderDate ? item.reminderDate.slice(0, 16) : '');
  };

  const saveEdit = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          title: editTitle,
          content: editContent,
          category: editCategory,
          importance: editImportance,
          reminderDate: editDate ? new Date(editDate).toISOString() : undefined
        };
      }
      return item;
    }));
    setEditingId(null);
    onToast('Memory draft updated.', 'info');
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    onToast('Draft item removed.', 'info');
  };

  const handleSaveAll = () => {
    if (items.length === 0) {
      onToast('No memories to save.', 'warning');
      return;
    }

    const createdMemories: Memory[] = items.map(item => ({
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: item.title,
      content: item.content,
      originalTranscript: data.transcript,
      category: item.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: item.tags,
      importance: item.importance,
      isFavorite: item.importance === 'high',
      isArchived: false,
      people: item.people,
      reminderDate: item.reminderDate,
      reminderStatus: item.reminderDate ? 'pending' : 'none',
      reminderPriority: item.importance === 'high' ? 'urgent' : 'normal',
      source: 'voice',
      notes: item.notes
    }));

    onSaveApproved(createdMemories);
  };

  const handleSaveSingle = (item: DecomposedItemDraft) => {
    const memory: Memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: item.title,
      content: item.content,
      originalTranscript: data.transcript,
      category: item.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: item.tags,
      importance: item.importance,
      isFavorite: item.importance === 'high',
      isArchived: false,
      people: item.people,
      reminderDate: item.reminderDate,
      reminderStatus: item.reminderDate ? 'pending' : 'none',
      reminderPriority: item.importance === 'high' ? 'urgent' : 'normal',
      source: 'voice',
      notes: item.notes
    };

    onSaveApproved([memory]);
    setItems(prev => prev.filter(i => i.id !== item.id));
    onToast(`"${item.title}" saved to your second mind!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-sam-surface border border-sam-purple/30 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-sam-text animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-sam-card hover:bg-sam-bg text-sam-muted hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sam-purple to-sam-blue flex items-center justify-center shadow-glow-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-sam-text">
              Review & Approve Memories
            </h2>
            <p className="text-xs sm:text-sm text-sam-muted">
              SAM decomposed your speech into {items.length} distinct actionable memory items.
            </p>
          </div>
        </div>

        {/* Transcript Accordion / Banner */}
        <div className="p-4 rounded-xl bg-sam-card/60 border border-sam-purple/20 mb-6">
          <div className="text-xs font-semibold text-sam-highlight mb-1 flex items-center justify-between">
            <span>Captured Transcript:</span>
            <span className="text-[10px] text-sam-muted uppercase font-mono">Grammar Normalized</span>
          </div>
          <p className="text-xs sm:text-sm text-sam-text/90 italic mb-2">
            "{data.grammarCorrected || data.transcript}"
          </p>
          <p className="text-[11px] text-sam-cyan font-medium">
            AI Summary: {data.summary}
          </p>
        </div>

        {/* List of Decomposed Items */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {items.map((item, idx) => {
            const catMeta = CATEGORIES[item.category] || CATEGORIES.daily_life;
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-sam-card border border-sam-purple/20 hover:border-sam-purple/40 transition relative group"
              >
                {isEditing ? (
                  // Inline Edit Form
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Memory Title"
                      className="w-full p-2.5 rounded-lg bg-sam-bg border border-sam-purple/30 text-sm font-bold text-sam-text focus:outline-none"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 rounded-lg bg-sam-bg border border-sam-purple/30 text-xs text-sam-text focus:outline-none"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-sam-muted font-bold block mb-1">Category</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as CategoryType)}
                          className="w-full p-2 rounded-lg bg-sam-bg border border-sam-purple/30 text-xs text-sam-text focus:outline-none"
                        >
                          {Object.values(CATEGORIES).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-sam-muted font-bold block mb-1">Importance</label>
                        <select
                          value={editImportance}
                          onChange={(e) => setEditImportance(e.target.value as ImportanceLevel)}
                          className="w-full p-2 rounded-lg bg-sam-bg border border-sam-purple/30 text-xs text-sam-text focus:outline-none"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-sam-muted font-bold block mb-1">Reminder Date/Time</label>
                        <input
                          type="datetime-local"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full p-2 rounded-lg bg-sam-bg border border-sam-purple/30 text-xs text-sam-text focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg bg-sam-surface text-xs text-sam-muted hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="px-4 py-1.5 rounded-lg bg-sam-purple text-xs font-semibold text-white hover:bg-sam-purple/90"
                      >
                        Apply Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // Regular Display Card
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-sam-purple/20 text-sam-highlight flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5"
                          style={{
                            backgroundColor: catMeta.bgColor,
                            color: catMeta.color,
                            borderColor: catMeta.borderColor
                          }}
                        >
                          {catMeta.label}
                        </span>
                        {item.importance === 'high' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                            High Priority
                          </span>
                        )}
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg bg-sam-surface hover:bg-sam-bg text-sam-muted hover:text-sam-text text-xs transition"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg bg-sam-surface hover:bg-rose-500/20 text-sam-muted hover:text-rose-400 text-xs transition"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSaveSingle(item)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sam-purple/20 hover:bg-sam-purple text-sam-highlight hover:text-white text-xs font-semibold transition"
                          title="Approve and save only this memory"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-sam-text mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-sam-muted leading-relaxed mb-3">
                      {item.content}
                    </p>

                    {/* Meta Pills (People, Dates, Tags) */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-sam-purple/10 text-xs text-sam-muted">
                      {item.people.length > 0 && (
                        <div className="flex items-center gap-1 text-sam-blue bg-sam-blue/10 px-2 py-0.5 rounded-md text-[11px]">
                          <Users className="w-3 h-3" />
                          <span>{item.people.join(', ')}</span>
                        </div>
                      )}

                      {item.reminderDate && (
                        <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md text-[11px]">
                          <Calendar className="w-3 h-3" />
                          <span>Reminder: {new Date(item.reminderDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      )}

                      {item.tags.map(t => (
                        <span key={t} className="text-[10px] text-sam-muted bg-sam-surface px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Point-wise notes if any */}
                    {item.notes && item.notes.length > 0 && (
                      <div className="mt-2 text-[11px] text-sam-muted space-y-0.5">
                        {item.notes.map((note, nIdx) => (
                          <div key={nIdx} className="flex items-center gap-1.5 text-sam-muted/80">
                            <span className="w-1 h-1 rounded-full bg-sam-purple" />
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-sam-purple/20">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sam-card hover:bg-sam-cardHover text-xs font-semibold text-sam-muted hover:text-sam-text transition"
          >
            Discard All
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleSaveAll}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sam-purple via-sam-blue to-sam-highlight text-white text-xs font-bold shadow-glow-purple hover:opacity-95 transition"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Save All ({items.length} Memories)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

