import React, { useState } from 'react';
import { 
  Home, 
  Mic, 
  Layers, 
  Bot, 
  Menu, 
  X, 
  Sparkles, 
  Lightbulb, 
  Bookmark, 
  MessageSquareShare, 
  Users, 
  CheckSquare, 
  Bell, 
  CalendarDays, 
  Settings,
  Brain,
  LogOut
} from 'lucide-react';
import { NavigationPage } from './Sidebar';
import { AuthUser } from '../services/authService';

interface MobileNavProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  memoryCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  user,
  onOpenAuth,
  onSignOut,
  memoryCount
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNav = (page: NavigationPage) => {
    onNavigate(page);
    setDrawerOpen(false);
  };

  const drawerItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'capture', label: 'Capture Anything', icon: Mic },
    { id: 'all_memories', label: `All Memories (${memoryCount})`, icon: Layers },
    { id: 'memorable_moments', label: 'Memorable Moments', icon: Sparkles },
    { id: 'ideas_thoughts', label: 'Ideas & Thoughts', icon: Lightbulb },
    { id: 'things_to_remember', label: 'Things to Remember', icon: Bookmark },
    { id: 'things_to_tell', label: 'Things to Tell', icon: MessageSquareShare },
    { id: 'people_conversations', label: 'People & Conversations', icon: Users },
    { id: 'tasks_commitments', label: 'Tasks & Commitments', icon: CheckSquare },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'ask_sam', label: 'Ask SAM AI', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-sam-surface/95 border-t border-sam-purple/20 backdrop-blur-xl px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => handleNav('overview')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
            currentPage === 'overview' ? 'text-sam-highlight' : 'text-sam-muted'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNav('all_memories')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
            currentPage === 'all_memories' ? 'text-sam-highlight' : 'text-sam-muted'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Memories</span>
        </button>

        {/* Center Floating Mic Button */}
        <div className="relative -top-5">
          <button
            onClick={() => handleNav('capture')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-sam-purple via-sam-blue to-sam-cyan flex items-center justify-center shadow-glow-purple border-2 border-sam-bg active:scale-95 transition"
            title="Capture Anything"
          >
            <Mic className="w-6 h-6 text-white" />
          </button>
        </div>

        <button
          onClick={() => handleNav('ask_sam')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
            currentPage === 'ask_sam' ? 'text-sam-highlight' : 'text-sam-muted'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span>Ask SAM</span>
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-[10px] font-medium text-sam-muted hover:text-sam-text transition"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>

      {/* Slide-over Full Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-md flex justify-end">
          <div className="w-4/5 max-w-sm h-full bg-sam-surface border-l border-sam-purple/30 p-6 flex flex-col justify-between overflow-y-auto animate-slideInRight">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-sam-purple/20 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sam-purple to-sam-blue flex items-center justify-center shadow-glow-purple">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-sam-text">SAM 2.0</h3>
                    <p className="text-[10px] text-sam-muted">Your Second Mind</p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-sam-card text-sam-muted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items */}
              <div className="space-y-1">
                {drawerItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id as NavigationPage)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-sam-purple/20 text-sam-highlight border border-sam-purple/40'
                          : 'text-sam-muted hover:text-sam-text hover:bg-sam-card'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Profile in Drawer */}
            <div className="pt-4 border-t border-sam-purple/20">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-sam-purple/40" />
                    <div>
                      <p className="text-xs font-bold text-sam-text">{user.name}</p>
                      <p className="text-[10px] text-sam-muted truncate max-w-[120px]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onSignOut(); setDrawerOpen(false); }}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { onOpenAuth(); setDrawerOpen(false); }}
                  className="w-full py-2 rounded-xl bg-sam-purple text-white text-xs font-bold shadow-glow-purple"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

