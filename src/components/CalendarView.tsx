import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ExternalLink,
  Bell
} from 'lucide-react';
import { Memory } from '../types';
import { reminderService } from '../services/reminderService';

interface CalendarViewProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  onUpdateMemory: (id: string, updates: Partial<Memory>) => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  memories,
  onSelectMemory,
  onUpdateMemory,
  onToast
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

  // Reminders with valid dates
  const datedMemories = memories.filter(m => m.reminderDate);

  const prevPeriod = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const nextPeriod = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Month grid helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
  // Prefix days
  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ day: 0, dateStr: '', isCurrentMonth: false });
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, dateStr: dStr, isCurrentMonth: true });
  }

  const getMemoriesForDate = (dateStr: string) => {
    return datedMemories.filter(m => m.reminderDate?.startsWith(dateStr));
  };

  const handleToggleReminderStatus = (m: Memory, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = m.reminderStatus === 'completed' ? 'pending' : 'completed';
    onUpdateMemory(m.id, { reminderStatus: nextStatus });
    if (nextStatus === 'completed') {
      reminderService.playFuturisticChime();
      onToast(`Marked "${m.title}" reminder as completed!`, 'success');
    } else {
      onToast(`Reopened "${m.title}" reminder.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sam-purple/10 border border-sam-purple/30 text-sam-highlight text-xs font-medium mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Interactive Timeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sam-text">
            Calendar & Reminders
          </h2>
          <p className="text-sm text-sam-muted mt-1">
            Visual month & day schedule of time-sensitive memories, follow-ups and commitments.
          </p>
        </div>

        {/* View Switcher & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-sam-surface border border-sam-purple/20">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'month'
                  ? 'bg-sam-purple text-white shadow-glow-purple'
                  : 'text-sam-muted hover:text-white'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'day'
                  ? 'bg-sam-purple text-white shadow-glow-purple'
                  : 'text-sam-muted hover:text-white'
              }`}
            >
              Day View
            </button>
          </div>

          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 rounded-xl bg-sam-card hover:bg-sam-cardHover border border-sam-purple/20 text-xs font-semibold text-sam-text transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* Month / Day Header Bar */}
      <div className="p-4 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-sam-text">
            {viewMode === 'month'
              ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-sam-purple/20 text-sam-highlight border border-sam-purple/30 font-mono">
            {datedMemories.filter(m => m.reminderStatus === 'pending').length} Pending
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevPeriod}
            className="p-2 rounded-xl bg-sam-card hover:bg-sam-cardHover border border-sam-purple/20 text-sam-muted hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextPeriod}
            className="p-2 rounded-xl bg-sam-card hover:bg-sam-cardHover border border-sam-purple/20 text-sam-muted hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="rounded-2xl bg-sam-surface/90 border border-sam-purple/20 p-4 overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-sam-muted font-mono">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((item, index) => {
              if (!item.isCurrentMonth) {
                return (
                  <div
                    key={index}
                    className="min-h-[100px] rounded-xl bg-sam-card/20 border border-transparent p-2 opacity-25"
                  />
                );
              }

              const dayMemories = getMemoriesForDate(item.dateStr);
              const isToday =
                new Date().toISOString().startsWith(item.dateStr);

              return (
                <div
                  key={index}
                  className={`min-h-[110px] rounded-xl p-2 border transition flex flex-col justify-between ${
                    isToday
                      ? 'bg-sam-card/90 border-sam-purple shadow-glow-purple'
                      : 'bg-sam-card/50 border-sam-purple/15 hover:border-sam-purple/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-sam-purple text-white' : 'text-sam-muted'
                      }`}
                    >
                      {item.day}
                    </span>
                    {dayMemories.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>

                  {/* Memory Reminder Chips */}
                  <div className="space-y-1 overflow-y-auto max-h-16 no-scrollbar">
                    {dayMemories.map(m => (
                      <div
                        key={m.id}
                        onClick={() => onSelectMemory(m)}
                        className={`text-[10px] p-1 rounded font-medium truncate cursor-pointer transition flex items-center justify-between gap-1 ${
                          m.reminderStatus === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-400 line-through'
                            : 'bg-sam-purple/20 text-sam-highlight hover:bg-sam-purple/40 border border-sam-purple/30'
                        }`}
                        title={m.title}
                      >
                        <span className="truncate">{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="rounded-2xl bg-sam-surface/90 border border-sam-purple/20 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sam-purple/20">
            <h4 className="text-sm font-bold text-sam-text">
              Schedule for {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h4>
          </div>

          {getMemoriesForDate(currentDate.toISOString().slice(0, 10)).length === 0 ? (
            <div className="py-12 text-center text-sam-muted text-xs">
              <Clock className="w-8 h-8 text-sam-muted/40 mx-auto mb-2" />
              <p>No reminders or commitments recorded for this day.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getMemoriesForDate(currentDate.toISOString().slice(0, 10)).map(m => (
                <div
                  key={m.id}
                  onClick={() => onSelectMemory(m)}
                  className="flex items-center justify-between p-4 rounded-xl bg-sam-card border border-sam-purple/20 hover:border-sam-purple/50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={(e) => handleToggleReminderStatus(m, e)}
                      className={`p-1.5 rounded-lg transition ${
                        m.reminderStatus === 'completed'
                          ? 'text-emerald-400 bg-emerald-500/20'
                          : 'text-sam-muted hover:text-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div>
                      <h5 className={`text-sm font-bold text-sam-text ${m.reminderStatus === 'completed' ? 'line-through opacity-60' : ''}`}>
                        {m.title}
                      </h5>
                      <p className="text-xs text-sam-muted line-clamp-1">{m.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-amber-300 bg-amber-400/10 px-2 py-1 rounded-md">
                      {new Date(m.reminderDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <ExternalLink className="w-4 h-4 text-sam-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

