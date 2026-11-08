import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Archive, 
  Trash2, 
  Calendar, 
  Users, 
  Tag, 
  Edit3, 
  Save, 
  Mic
} from 'lucide-react';
import { Memory, CategoryType, ImportanceLevel, ReminderStatus, ReminderPriority } from '../types';
import { CATEGORIES } from '../utils/constants';

interface MemoryModalProps {
  memory: Memory;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Memory>) => void;
  onDelete: (id: string) => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  memory,
  onClose,
  onUpdate,
  onDelete,
  onToast
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(memory.title);
  const [content, setContent] = useState(memory.content);
  const [category, setCategory] = useState<CategoryType>(memory.category);
  const [importance, setImportance] = useState<ImportanceLevel>(memory.importance);
  const [tagsStr, setTagsStr] = useState(memory.tags.join(', '));
  const [peopleStr, setPeopleStr] = useState(memory.people.join(', '));
  const [reminderDate, setReminderDate] = useState(
    memory.reminderDate ? memory.reminderDate.slice(0, 16) : ''
  );
  const [reminderStatus, setReminderStatus] = useState<ReminderStatus>(memory.reminderStatus);

  const catMeta = CATEGORIES[category] || CATEGORIES.daily_life;

  const handleSave = () => {
    const tags = tagsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const people = peopleStr.split(',').map(s => s.trim()).filter(Boolean);

    onUpdate(memory.id, {
      title,
      content,
      category,
      importance,
      tags,
      people,
      reminderDate: reminderDate ? new Date(reminderDate).toISOString() : undefined,
      reminderStatus: reminderDate ? reminderStatus : 'none'
    });

    setIsEditing(false);
    onToast('Memory saved successfully!', 'success');
  };

  const handleToggleFavorite = () => {
    onUpdate(memory.id, { isFavorite: !memory.isFavorite });
    onToast(memory.isFavorite ? 'Removed from favorites' : 'Marked as favorite', 'info');
  };

  const handleToggleArchive = () => {
    onUpdate(memory.id, { isArchived: !memory.isArchived });
    onToast(memory.isArchived ? 'Restored from archive' : 'Archived memory', 'info');
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this memory from SAM?')) {
      onDelete(memory.id);
      onToast('Memory permanently deleted.', 'warning');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-sam-surface border border-sam-purple/30 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-sam-text animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-sam-card hover:bg-sam-bg text-sam-muted hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pr-12">
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5"
              style={{
                backgroundColor: catMeta.bgColor,
                color: catMeta.color,
                borderColor: catMeta.borderColor
              }}
            >
              {catMeta.label}
            </span>

            <span className="text-xs text-sam-muted font-mono">
              Captured {new Date(memory.createdAt).toLocaleDateString()} at {new Date(memory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl border transition ${
                memory.isFavorite
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-sam-card border-sam-purple/20 text-sam-muted hover:text-sam-text'
              }`}
              title="Toggle Favorite"
            >
              <Heart className={`w-4 h-4 ${memory.isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={handleToggleArchive}
              className="p-2 rounded-xl bg-sam-card border border-sam-purple/20 text-sam-muted hover:text-sam-text transition"
              title="Toggle Archive"
            >
              <Archive className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sam-card border border-sam-purple/20 text-xs font-medium text-sam-highlight hover:bg-sam-cardHover transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-sam-card border border-sam-purple/20 text-sam-muted hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete Memory"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-sam-muted block mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl bg-sam-bg border border-sam-purple/30 text-sam-text font-bold text-base focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-sam-muted block mb-1">Content / Description</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-sam-bg border border-sam-purple/30 text-sam-text text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-sam-muted block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full p-2.5 rounded-xl bg-sam-bg border border-sam-purple/30 text-sam-text text-xs focus:outline-none"
                >
                  {Object.values(CATEGORIES).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-sam-muted block mb-1">Importance</label>
                <select
                  value={importance}
                  onChange={(e) => setImportance(e.target.value as ImportanceLevel)}
                  className="w-full p-2.5 rounded-xl bg-sam-bg border border-sam-purple/30 text-sam-text text-xs focus:outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-sam-muted block mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="e.g. startup, business, rahul"
                  className="w-full p-2.5 rounded-xl bg-sam-bg border border-sam-purple/30 text-sam-text text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-sam-muted block mb-1">People Mentioned</label>
                <input
                  type="text"
                  value={peopleStr}
                  onChange={(e) => setPeopleStr(e.target.value)}
                  placeholder="e.g. Rahul Sharma, Elena Rostova"
                  className="w-full p-2.5 rounded-xl bg-sam-bg border border-sam-purple/30 text-sam-text text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-sam-muted block mb-1">Reminder Date & Time</label>
                <input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-sam-bg border border-sam-purple/30 text-sam-text text-xs focus:outline-none"
                />
              </div>

              {reminderDate && (
                <div>
                  <label className="text-xs font-semibold text-sam-muted block mb-1">Reminder Status</label>
                  <select
                    value={reminderStatus}
                    onChange={(e) => setReminderStatus(e.target.value as ReminderStatus)}
                    className="w-full p-2.5 rounded-xl bg-sam-bg border border-sam-purple/30 text-sam-text text-xs focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-sam-purple/20">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-sam-card hover:bg-sam-cardHover text-xs text-sam-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-xs font-bold text-white shadow-glow-purple hover:opacity-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Updates</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-sam-text mb-3 leading-snug">
                {memory.title}
              </h2>
              <p className="text-sm sm:text-base text-sam-text/90 leading-relaxed">
                {memory.content}
              </p>
            </div>

            {/* Optional Image */}
            {memory.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-sam-purple/30 max-h-80">
                <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Original Speech Transcript if present */}
            {memory.originalTranscript && (
              <div className="p-4 rounded-xl bg-sam-bg/90 border border-sam-purple/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-sam-highlight mb-2">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Original Voice Recording Transcript</span>
                </div>
                <p className="text-xs sm:text-sm text-sam-muted italic">
                  "{memory.originalTranscript}"
                </p>
              </div>
            )}

            {/* Point-wise notes if present */}
            {memory.notes && memory.notes.length > 0 && (
              <div className="p-4 rounded-xl bg-sam-card/60 border border-sam-purple/20">
                <h4 className="text-xs font-bold text-sam-text uppercase tracking-wider mb-2">
                  Deconstructed Key Points
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-sam-muted">
                  {memory.notes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sam-purple mt-2 shrink-0" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Linked Entities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-sam-purple/20 text-xs">
              {/* People */}
              <div className="p-3 rounded-xl bg-sam-card/50 border border-sam-purple/15">
                <div className="text-[11px] font-semibold text-sam-muted mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sam-blue" />
                  <span>Associated People</span>
                </div>
                {memory.people.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {memory.people.map(p => (
                      <span key={p} className="px-2 py-1 rounded-md bg-sam-blue/15 text-sam-blue text-xs font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sam-muted/60 italic">No specific individuals linked</span>
                )}
              </div>

              {/* Scheduled Reminder */}
              <div className="p-3 rounded-xl bg-sam-card/50 border border-sam-purple/15">
                <div className="text-[11px] font-semibold text-sam-muted mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reminder & Calendar Link</span>
                </div>
                {memory.reminderDate ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-sam-text">
                      {new Date(memory.reminderDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      memory.reminderStatus === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      Status: {memory.reminderStatus.toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <span className="text-sam-muted/60 italic">No scheduled notification</span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-sam-muted" />
              {memory.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-lg bg-sam-surface text-sam-highlight text-xs font-mono">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

