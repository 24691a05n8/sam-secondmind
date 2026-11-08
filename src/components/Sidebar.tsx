import React from 'react';
import { 
  Home, 
  Mic, 
  Layers, 
  Sparkles, 
  Lightbulb, 
  Bookmark, 
  MessageSquareShare, 
  Users, 
  CheckSquare, 
  Bell, 
  CalendarDays, 
  Bot, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Brain,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { AuthUser } from '../services/authService';

export type NavigationPage = 
  | 'overview'
  | 'capture'
  | 'all_memories'
  | 'memorable_moments'
  | 'ideas_thoughts'
  | 'things_to_remember'
  | 'things_to_tell'
  | 'people_conversations'
  | 'tasks_commitments'
  | 'reminders'
  | 'calendar'
  | 'ask_sam'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  memoryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  user,
  onOpenAuth,
  onSignOut,
  memoryCount
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home, badge: null },
    { id: 'capture', label: 'Capture Anything', icon: Mic, badge: 'Live' },
    { id: 'all_memories', label: 'All Memories', icon: Layers, badge: memoryCount },
    { id: 'memorable_moments', label: 'Memorable Moments', icon: Sparkles, badge: null },
    { id: 'ideas_thoughts', label: 'Ideas & Thoughts', icon: Lightbulb, badge: null },
    { id: 'things_to_remember', label: 'Things to Remember', icon: Bookmark, badge: null },
    { id: 'things_to_tell', label: 'Things to Tell', icon: MessageSquareShare, badge: null },
    { id: 'people_conversations', label: 'People & Conversations', icon: Users, badge: null },
    { id: 'tasks_commitments', label: 'Tasks & Commitments', icon: CheckSquare, badge: null },
    { id: 'reminders', label: 'Reminders', icon: Bell, badge: null },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays, badge: null },
    { id: 'ask_sam', label: 'Ask SAM', icon: Bot, badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-sam-surface/95 border-r border-sam-purple/20 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between hidden md:flex ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-sam-purple/15">
          <div 
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Glowing Neural Logo */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-sam-purple via-sam-blue to-sam-highlight flex items-center justify-center shadow-glow-purple group-hover:scale-105 transition">
              <Brain className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse pointer-events-none" />
            </div>

            {!isCollapsed && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-wider text-sam-text group-hover:text-sam-highlight transition">
                    SAM
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-sam-purple/20 text-sam-highlight border border-sam-purple/40">
                    2.0
                  </span>
                </div>
                <p className="text-[10px] text-sam-muted font-medium tracking-tight">
                  YOUR SECOND MIND
                </p>
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg bg-sam-card hover:bg-sam-bg text-sam-muted hover:text-white transition"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="py-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as NavigationPage)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-sam-purple/25 to-sam-blue/15 text-sam-highlight border border-sam-purple/35 shadow-sm'
                    : 'text-sam-muted hover:text-sam-text hover:bg-sam-card/60'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active Indicator Glow Pill */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-gradient-to-b from-sam-purple to-sam-blue shadow-glow-purple" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-sam-highlight scale-110' : 'group-hover:text-sam-text'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate text-left flex-1">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.badge === 'AI' || item.badge === 'Live'
                        ? 'bg-sam-purple/30 text-sam-highlight border border-sam-purple/40 animate-pulse'
                        : 'bg-sam-card text-sam-muted'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Profile */}
      <div className="p-3 border-t border-sam-purple/15 bg-sam-surface/90">
        {user ? (
          <div className="flex items-center justify-between gap-2">
            <div 
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden p-1 rounded-xl hover:bg-sam-card/60 transition flex-1"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-sam-purple/40 object-cover shrink-0"
              />
              {!isCollapsed && (
                <div className="overflow-hidden text-left">
                  <p className="text-xs font-bold text-sam-text truncate">{user.name}</p>
                  <p className="text-[10px] text-sam-muted truncate">{user.email}</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={onSignOut}
                className="p-1.5 rounded-lg text-sam-muted hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white text-xs font-bold shadow-glow-purple"
          >
            <ShieldCheck className="w-4 h-4" />
            {!isCollapsed && <span>Sign In / Demo</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

