import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Layers, 
  Clock, 
  Lightbulb, 
  Calendar, 
  Plus, 
  ArrowRight, 
  Search, 
  Users, 
  CheckCircle2, 
  Bell,
  Heart
} from 'lucide-react';
import { Memory, DecompositionResult } from '../types';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { MemoryCard } from '../components/MemoryCard';
import { NavigationPage } from '../components/Sidebar';

interface DashboardProps {
  memories: Memory[];
  onDecomposedReady: (result: DecompositionResult) => void;
  onFavoriteToggle: (id: string) => void;
  onArchiveToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (memory: Memory) => void;
  onViewDetails: (memory: Memory) => void;
  onNavigate: (page: NavigationPage) => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  userName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  memories,
  onDecomposedReady,
  onFavoriteToggle,
  onArchiveToggle,
  onDelete,
  onEdit,
  onViewDetails,
  onNavigate,
  onToast,
  userName = 'Alex'
}) => {
  const [askQuery, setAskQuery] = useState('');

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const activeMemories = memories.filter(m => !m.isArchived);
  const totalCount = activeMemories.length;
  const highImportanceCount = activeMemories.filter(m => m.importance === 'high').length;
  const upcomingReminders = activeMemories.filter(m => m.reminderDate && m.reminderStatus === 'pending');
  const savedIdeasCount = activeMemories.filter(m => m.category === 'ideas_thoughts').length;

  const recentMemories = activeMemories.slice(0, 4);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (askQuery.trim()) {
      onNavigate('ask_sam');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Greeting Section */}
      <div className="relative rounded-3xl bg-gradient-to-r from-sam-surface via-sam-card to-sam-surface border border-sam-purple/20 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sam-purple/20 via-sam-blue/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sam-purple/10 border border-sam-purple/30 text-sam-highlight text-xs font-semibold mb-3">
            <Brain className="w-3.5 h-3.5" />
            <span>SAM Neural Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-sam-text tracking-tight">
            {getGreeting()}, {userName}! What's on your mind today?
          </h1>

          <p className="text-base sm:text-lg text-sam-muted mt-2 font-medium">
            Your second mind is ready to remember. Capture anything without worrying about notes, folders, or reminders.
          </p>

          {/* Quick Ask SAM Input Box */}
          <form onSubmit={handleAskSubmit} className="mt-6 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sam-muted" />
              <input
                type="text"
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                placeholder="Ask SAM what you forgot... (e.g. 'What did Rahul say?')"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-sam-bg/90 border border-sam-purple/25 text-sam-text placeholder-sam-muted/60 text-xs sm:text-sm focus:outline-none focus:border-sam-purple/60 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white font-bold text-xs shadow-glow-purple hover:opacity-95 transition flex items-center gap-1.5 shrink-0"
            >
              <span>Ask SAM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* CORE FEATURE: Large Central Capture Anything Section */}
      <section>
        <VoiceRecorder
          onDecomposedReady={onDecomposedReady}
          onToast={onToast}
        />
      </section>

      {/* Stats Metrics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Memories */}
        <div 
          onClick={() => onNavigate('all_memories')}
          className="p-5 rounded-2xl bg-sam-surface/80 border border-sam-purple/15 hover:border-sam-purple/40 backdrop-blur-md cursor-pointer transition group hover:shadow-glow-purple"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sam-muted uppercase tracking-wider">Total Memories</span>
            <div className="w-8 h-8 rounded-lg bg-sam-purple/10 flex items-center justify-center text-sam-highlight group-hover:scale-110 transition">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-sam-text">{totalCount}</div>
          <p className="text-[11px] text-sam-muted mt-1">Stored safely in your vault</p>
        </div>

        {/* Important Memories */}
        <div 
          onClick={() => onNavigate('all_memories')}
          className="p-5 rounded-2xl bg-sam-surface/80 border border-sam-purple/15 hover:border-sam-purple/40 backdrop-blur-md cursor-pointer transition group hover:shadow-glow-purple"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sam-muted uppercase tracking-wider">Important</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-sam-text">{highImportanceCount}</div>
          <p className="text-[11px] text-sam-muted mt-1">High priority & starred</p>
        </div>

        {/* Upcoming Reminders */}
        <div 
          onClick={() => onNavigate('reminders')}
          className="p-5 rounded-2xl bg-sam-surface/80 border border-sam-purple/15 hover:border-sam-purple/40 backdrop-blur-md cursor-pointer transition group hover:shadow-glow-purple"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sam-muted uppercase tracking-wider">Upcoming Reminders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-sam-text">{upcomingReminders.length}</div>
          <p className="text-[11px] text-sam-muted mt-1">Action items pending</p>
        </div>

        {/* Saved Ideas */}
        <div 
          onClick={() => onNavigate('ideas_thoughts')}
          className="p-5 rounded-2xl bg-sam-surface/80 border border-sam-purple/15 hover:border-sam-purple/40 backdrop-blur-md cursor-pointer transition group hover:shadow-glow-purple"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sam-muted uppercase tracking-wider">Saved Ideas</span>
            <div className="w-8 h-8 rounded-lg bg-sam-blue/10 flex items-center justify-center text-sam-blue group-hover:scale-110 transition">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-sam-text">{savedIdeasCount}</div>
          <p className="text-[11px] text-sam-muted mt-1">Concepts & creative sparks</p>
        </div>
      </section>

      {/* Two Column Section: Recent Memories & Upcoming Events Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Memories */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-sam-text">Recent Memories</h3>
              <p className="text-xs text-sam-muted">Latest experiences organized by SAM</p>
            </div>
            <button
              onClick={() => onNavigate('all_memories')}
              className="text-xs font-bold text-sam-highlight hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentMemories.map(m => (
              <MemoryCard
                key={m.id}
                memory={m}
                onFavoriteToggle={onFavoriteToggle}
                onArchiveToggle={onArchiveToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>

        {/* Right: Upcoming Commitments & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Schedule Widget */}
          <div className="p-5 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sam-purple/15">
              <h4 className="text-sm font-bold text-sam-text flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Upcoming Commitments</span>
              </h4>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-[11px] font-semibold text-sam-highlight hover:underline"
              >
                Calendar
              </button>
            </div>

            {upcomingReminders.length === 0 ? (
              <p className="text-xs text-sam-muted py-4 text-center">
                No reminders scheduled. Enjoy your focus!
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingReminders.slice(0, 3).map(rem => (
                  <div
                    key={rem.id}
                    onClick={() => onViewDetails(rem)}
                    className="p-3 rounded-xl bg-sam-card hover:bg-sam-cardHover border border-sam-purple/15 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between text-[10px] text-amber-300 mb-1">
                      <span className="font-mono">
                        {new Date(rem.reminderDate!).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                        {rem.reminderPriority || 'Normal'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-sam-text line-clamp-1">{rem.title}</p>
                    <p className="text-[11px] text-sam-muted line-clamp-1 mt-0.5">{rem.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Shortcuts */}
          <div className="p-5 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 space-y-3">
            <h4 className="text-xs font-bold text-sam-muted uppercase tracking-wider mb-2">
              Second Mind Quick Actions
            </h4>

            <button
              onClick={() => onNavigate('things_to_tell')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-sam-card hover:bg-sam-cardHover border border-sam-purple/15 text-xs text-sam-text font-semibold transition"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-sam-blue" />
                <span>Queue talking point for someone</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-sam-muted" />
            </button>

            <button
              onClick={() => onNavigate('ask_sam')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-sam-card hover:bg-sam-cardHover border border-sam-purple/15 text-xs text-sam-text font-semibold transition"
            >
              <div className="flex items-center gap-2.5">
                <Brain className="w-4 h-4 text-sam-highlight" />
                <span>Chat with Ask SAM</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-sam-muted" />
            </button>

            <button
              onClick={() => onNavigate('calendar')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-sam-card hover:bg-sam-cardHover border border-sam-purple/15 text-xs text-sam-text font-semibold transition"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Open Interactive Calendar</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-sam-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

