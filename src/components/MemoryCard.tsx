import React, { useState } from 'react';
import { 
  Heart, 
  Trash2, 
  Edit3, 
  Archive, 
  Calendar, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles,
  Mic,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Memory } from '../types';
import { CATEGORIES } from '../utils/constants';

interface MemoryCardProps {
  memory: Memory;
  onFavoriteToggle: (id: string) => void;
  onArchiveToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (memory: Memory) => void;
  onViewDetails: (memory: Memory) => void;
  onTagClick?: (tag: string) => void;
  onPersonClick?: (person: string) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onFavoriteToggle,
  onArchiveToggle,
  onDelete,
  onEdit,
  onViewDetails,
  onTagClick,
  onPersonClick
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const cat = CATEGORIES[memory.category] || CATEGORIES.daily_life;

  const getSourceIcon = () => {
    switch (memory.source) {
      case 'voice': return <Mic className="w-3 h-3 text-sam-highlight" />;
      case 'image': return <ImageIcon className="w-3 h-3 text-sam-cyan" />;
      default: return <FileText className="w-3 h-3 text-sam-muted" />;
    }
  };

  return (
    <div className="group relative rounded-2xl bg-sam-card/90 border border-sam-purple/15 hover:border-sam-purple/40 backdrop-blur-md p-5 transition-all duration-300 hover:shadow-glow-purple flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Category Badge & Source */}
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5"
              style={{
                backgroundColor: cat.bgColor,
                color: cat.color,
                borderColor: cat.borderColor
              }}
            >
              <span>{cat.label}</span>
            </span>

            <span className="p-1 rounded-md bg-sam-surface border border-sam-purple/20 text-sam-muted" title={`Captured via ${memory.source}`}>
              {getSourceIcon()}
            </span>

            {memory.importance === 'high' && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                High
              </span>
            )}
          </div>

          {/* Quick Actions (Favorite, Archive, Menu) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onFavoriteToggle(memory.id)}
              className={`p-1.5 rounded-lg transition ${
                memory.isFavorite
                  ? 'text-rose-500 bg-rose-500/10'
                  : 'text-sam-muted hover:text-sam-text hover:bg-sam-surface'
              }`}
              title={memory.isFavorite ? 'Remove from favorites' : 'Mark favorite'}
            >
              <Heart className={`w-4 h-4 ${memory.isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => onArchiveToggle(memory.id)}
              className={`p-1.5 rounded-lg transition ${
                memory.isArchived
                  ? 'text-sam-cyan bg-sam-cyan/10'
                  : 'text-sam-muted hover:text-sam-text hover:bg-sam-surface'
              }`}
              title={memory.isArchived ? 'Unarchive' : 'Archive'}
            >
              <Archive className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEdit(memory)}
              className="p-1.5 rounded-lg text-sam-muted hover:text-sam-text hover:bg-sam-surface transition"
              title="Edit memory"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDelete(memory.id)}
              className="p-1.5 rounded-lg text-sam-muted hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete memory"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onViewDetails(memory)}
          className="text-lg font-bold text-sam-text group-hover:text-sam-highlight transition cursor-pointer mb-2 line-clamp-2"
        >
          {memory.title}
        </h3>

        {/* Optional Image thumbnail */}
        {memory.imageUrl && (
          <div 
            onClick={() => onViewDetails(memory)}
            className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-sam-purple/20 cursor-pointer"
          >
            <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          </div>
        )}

        {/* Content Summary */}
        <p className="text-xs sm:text-sm text-sam-muted leading-relaxed mb-3 line-clamp-3">
          {memory.content}
        </p>

        {/* Original Transcript Dropdown */}
        {memory.originalTranscript && (
          <div className="mb-3">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-[11px] text-sam-highlight hover:underline flex items-center gap-1 font-mono"
            >
              <span>{showTranscript ? 'Hide raw voice transcript' : 'Show raw voice transcript'}</span>
              {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showTranscript && (
              <div className="mt-1.5 p-2.5 rounded-lg bg-sam-bg/90 border border-sam-purple/20 text-[11px] text-sam-muted italic">
                "{memory.originalTranscript}"
              </div>
            )}
          </div>
        )}

        {/* Notes Bullet Points if present */}
        {memory.notes && memory.notes.length > 0 && (
          <div className="mb-3 space-y-1">
            {memory.notes.slice(0, 2).map((n, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-sam-muted/80">
                <span className="w-1 h-1 rounded-full bg-sam-purple mt-1.5 shrink-0" />
                <span className="line-clamp-1">{n}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata, Tags, People, Reminder */}
      <div className="pt-3 border-t border-sam-purple/10 mt-2 space-y-2">
        {/* Reminder notification badge */}
        {memory.reminderDate && (
          <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-sam-surface/60 border border-amber-500/20 text-amber-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(memory.reminderDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              memory.reminderStatus === 'completed'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              {memory.reminderStatus === 'completed' ? 'Done' : 'Reminder Set'}
            </span>
          </div>
        )}

        {/* People Linked */}
        {memory.people.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {memory.people.map(person => (
              <button
                key={person}
                onClick={() => onPersonClick?.(person)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sam-blue/10 border border-sam-blue/20 text-sam-blue text-[11px] hover:bg-sam-blue/20 transition"
              >
                <Users className="w-3 h-3" />
                <span>{person}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tags & Date */}
        <div className="flex items-center justify-between text-[11px] text-sam-muted pt-1">
          <div className="flex flex-wrap gap-1">
            {memory.tags.map(tag => (
              <span
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="cursor-pointer hover:text-sam-text"
              >
                #{tag}
              </span>
            ))}
          </div>

          <span className="shrink-0 font-mono text-[10px]">
            {new Date(memory.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};

