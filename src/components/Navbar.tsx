import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  Sparkles, 
  Command, 
  X,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AuthUser } from '../services/authService';
import { Memory } from '../types';

interface NavbarProps {
  user: AuthUser | null;
  onOpenAuth: () => void;
  onQuickCapture: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  upcomingReminders: Memory[];
  onSelectReminder: (memory: Memory) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onQuickCapture,
  onSearchChange,
  searchQuery,
  upcomingReminders,
  onSelectReminder
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-sam-bg/80 backdrop-blur-xl border-b border-sam-purple/15 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sam-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search memories, people, tags, dates (Ctrl + K)..."
          className="w-full pl-10 pr-10 py-2 rounded-xl bg-sam-surface/80 border border-sam-purple/20 text-sam-text placeholder-sam-muted/60 text-xs focus:outline-none focus:border-sam-purple/60 focus:ring-1 focus:ring-sam-purple/40 transition"
        />
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sam-muted hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] text-sam-muted font-mono bg-sam-card px-1.5 py-0.5 rounded border border-sam-purple/20">
            <Command className="w-2.5 h-2.5" />K
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Capture Button */}
        <button
          onClick={onQuickCapture}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white text-xs font-bold shadow-glow-purple hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Capture Memory</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-sam-surface border border-sam-purple/20 text-sam-muted hover:text-sam-text hover:bg-sam-card transition"
            title="Reminders & Notifications"
          >
            <Bell className="w-4 h-4" />
            {upcomingReminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {upcomingReminders.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-sam-surface border border-sam-purple/30 shadow-2xl p-4 z-50 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-sam-purple/20 mb-3">
                <span className="text-xs font-bold text-sam-text flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upcoming Reminders</span>
                </span>
                <span className="text-[10px] text-sam-muted font-mono">
                  {upcomingReminders.length} Pending
                </span>
              </div>

              {upcomingReminders.length === 0 ? (
                <div className="py-6 text-center text-xs text-sam-muted">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
                  <p>All caught up! No reminders pending.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {upcomingReminders.map(rem => (
                    <div
                      key={rem.id}
                      onClick={() => {
                        onSelectReminder(rem);
                        setShowNotifications(false);
                      }}
                      className="p-2.5 rounded-xl bg-sam-card hover:bg-sam-cardHover border border-sam-purple/15 cursor-pointer transition"
                    >
                      <p className="text-xs font-bold text-sam-text line-clamp-1">{rem.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-300 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(rem.reminderDate!).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar */}
        {user ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-sam-purple/50 object-cover cursor-pointer"
            title={user.name}
          />
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-xl bg-sam-surface border border-sam-purple/30 text-xs font-medium text-sam-text hover:text-white"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

