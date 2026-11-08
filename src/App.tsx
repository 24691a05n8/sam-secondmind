import React, { useState, useEffect } from 'react';
import { 
  Memory, 
  PersonContact, 
  UserPreferences, 
  DecompositionResult, 
  CategoryType 
} from './types';
import { storageService } from './services/storageService';
import { authService, AuthUser } from './services/authService';
import { reminderService } from './services/reminderService';
import { Sidebar, NavigationPage } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Navbar } from './components/Navbar';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { DecompositionModal } from './components/DecompositionModal';
import { MemoryModal } from './components/MemoryModal';
import { AuthModal } from './components/AuthModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { AllMemories } from './pages/AllMemories';
import { AskSamChat } from './components/AskSamChat';
import { PeopleHub } from './components/PeopleHub';
import { CalendarView } from './components/CalendarView';
import { SettingsPage } from './pages/SettingsPage';
import { VoiceRecorder } from './components/VoiceRecorder';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [contacts, setContacts] = useState<PersonContact[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    name: 'Alex Rivera',
    email: 'alex.rivera@secondmind.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: 'Product Architect & Founder exploring human cognition augmentation.',
    enableSound: true,
    enableBrowserNotifications: true,
    theme: 'dark-futuristic',
    glowIntensity: 'high',
    exportFormat: 'markdown'
  });

  // Global Search in Navbar
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals & Overlays
  const [decompositionData, setDecompositionData] = useState<DecompositionResult | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Floating Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial Load from Storage
  useEffect(() => {
    const loadAll = async () => {
      const mems = await storageService.getMemories();
      const conts = await storageService.getContacts();
      const prefs = await storageService.getPreferences();
      setMemories(mems);
      setContacts(conts);
      setPreferences(prefs);
    };
    loadAll();

    // Subscribe to Auth changes
    const unsub = authService.subscribe(u => setUser(u));
    return () => unsub();
  }, []);

  // Keyboard shortcut listener (Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentPage('all_memories');
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Memory Handlers
  const handleSaveApprovedMemories = async (newMemories: Memory[]) => {
    const saved = await storageService.saveMultipleMemories(newMemories);
    setMemories(prev => [...saved, ...prev]);
    setDecompositionData(null);
    if (preferences.enableSound) {
      reminderService.playFuturisticChime();
    }
    addToast(`Successfully stored ${saved.length} memories in your second mind!`, 'success');
  };

  const handleUpdateMemory = async (id: string, updates: Partial<Memory>) => {
    const updated = await storageService.updateMemory(id, updates);
    setMemories(prev => prev.map(m => m.id === id ? updated : m));
    if (selectedMemory && selectedMemory.id === id) {
      setSelectedMemory(updated);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    await storageService.deleteMemory(id);
    setMemories(prev => prev.filter(m => m.id !== id));
    if (selectedMemory && selectedMemory.id === id) {
      setSelectedMemory(null);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const mem = memories.find(m => m.id === id);
    if (mem) {
      handleUpdateMemory(id, { isFavorite: !mem.isFavorite });
      addToast(mem.isFavorite ? 'Removed from favorites' : 'Added to favorites', 'info');
    }
  };

  const handleToggleArchive = (id: string) => {
    const mem = memories.find(m => m.id === id);
    if (mem) {
      handleUpdateMemory(id, { isArchived: !mem.isArchived });
      addToast(mem.isArchived ? 'Restored from archive' : 'Archived memory', 'info');
    }
  };

  // Contacts Handlers
  const handleAddContact = async (contact: PersonContact) => {
    const saved = await storageService.saveContact(contact);
    setContacts(prev => [saved, ...prev]);
  };

  const handleAddTalkingPoint = async (contactId: string, message: string, reminderDate?: string) => {
    const updated = await storageService.addTalkingPoint(contactId, message, reminderDate);
    setContacts(prev => prev.map(c => c.id === contactId ? updated : c));
  };

  const handleToggleTalkingPoint = async (contactId: string, pointId: string) => {
    const updated = await storageService.toggleTalkingPoint(contactId, pointId);
    setContacts(prev => prev.map(c => c.id === contactId ? updated : c));
  };

  // Preferences & Demo Reset
  const handleUpdatePreferences = async (newPrefs: UserPreferences) => {
    const saved = await storageService.savePreferences(newPrefs);
    setPreferences(saved);
  };

  const handleResetDemoData = () => {
    if (confirm('Reset memory vault to initial demo state?')) {
      storageService.resetAllToDemo();
      window.location.reload();
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to PERMANENTLY ERASE all memories? This cannot be undone.')) {
      storageService.clearAllData();
      setMemories([]);
      setContacts([]);
      addToast('All personal memories erased.', 'warning');
    }
  };

  const upcomingReminders = memories.filter(
    m => m.reminderDate && m.reminderStatus === 'pending'
  );

  // Helper to map dedicated category pages to AllMemories with category pre-selected
  const renderCategoryPage = (cat: CategoryType) => (
    <AllMemories
      memories={memories}
      initialCategory={cat}
      onFavoriteToggle={handleToggleFavorite}
      onArchiveToggle={handleToggleArchive}
      onDelete={handleDeleteMemory}
      onEdit={(m) => setSelectedMemory(m)}
      onViewDetails={(m) => setSelectedMemory(m)}
      onToast={addToast}
    />
  );

  return (
    <div className="min-h-screen bg-[#080A12] text-[#F8FAFC] flex font-sans selection:bg-purple-600 selection:text-white">
      {/* Aurora Ambient Background Lighting */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-sam-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-sam-blue/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Desktop Collapsible Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={() => authService.signOut()}
        memoryCount={memories.length}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pb-20 md:pb-8 ${
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        {/* Sticky Top Navbar */}
        <Navbar
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          onQuickCapture={() => setCurrentPage('capture')}
          onSearchChange={(q) => {
            setGlobalSearch(q);
            if (q.trim() && currentPage !== 'all_memories') {
              setCurrentPage('all_memories');
            }
          }}
          searchQuery={globalSearch}
          upcomingReminders={upcomingReminders}
          onSelectReminder={(m) => setSelectedMemory(m)}
        />

        {/* Dynamic Page Router */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'overview' && (
            <Dashboard
              memories={memories}
              onDecomposedReady={(res) => setDecompositionData(res)}
              onFavoriteToggle={handleToggleFavorite}
              onArchiveToggle={handleToggleArchive}
              onDelete={handleDeleteMemory}
              onEdit={(m) => setSelectedMemory(m)}
              onViewDetails={(m) => setSelectedMemory(m)}
              onNavigate={(page) => setCurrentPage(page)}
              onToast={addToast}
              userName={user?.name?.split(' ')[0] || preferences.name.split(' ')[0]}
            />
          )}

          {currentPage === 'capture' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <VoiceRecorder
                onDecomposedReady={(res) => setDecompositionData(res)}
                onToast={addToast}
              />
            </div>
          )}

          {currentPage === 'all_memories' && (
            <AllMemories
              memories={memories}
              onFavoriteToggle={handleToggleFavorite}
              onArchiveToggle={handleToggleArchive}
              onDelete={handleDeleteMemory}
              onEdit={(m) => setSelectedMemory(m)}
              onViewDetails={(m) => setSelectedMemory(m)}
              onToast={addToast}
            />
          )}

          {currentPage === 'memorable_moments' && renderCategoryPage('memorable_moments')}
          {currentPage === 'ideas_thoughts' && renderCategoryPage('ideas_thoughts')}
          {currentPage === 'things_to_remember' && renderCategoryPage('things_to_remember')}
          {currentPage === 'tasks_commitments' && renderCategoryPage('tasks_commitments')}

          {currentPage === 'things_to_tell' && (
            <PeopleHub
              contacts={contacts}
              onAddContact={handleAddContact}
              onAddTalkingPoint={handleAddTalkingPoint}
              onToggleTalkingPoint={handleToggleTalkingPoint}
              onToast={addToast}
              memories={memories}
              onViewMemory={(id) => {
                const mem = memories.find(m => m.id === id);
                if (mem) setSelectedMemory(mem);
              }}
            />
          )}

          {currentPage === 'people_conversations' && (
            <PeopleHub
              contacts={contacts}
              onAddContact={handleAddContact}
              onAddTalkingPoint={handleAddTalkingPoint}
              onToggleTalkingPoint={handleToggleTalkingPoint}
              onToast={addToast}
              memories={memories}
              onViewMemory={(id) => {
                const mem = memories.find(m => m.id === id);
                if (mem) setSelectedMemory(mem);
              }}
            />
          )}

          {currentPage === 'reminders' && (
            <CalendarView
              memories={memories}
              onSelectMemory={(m) => setSelectedMemory(m)}
              onUpdateMemory={handleUpdateMemory}
              onToast={addToast}
            />
          )}

          {currentPage === 'calendar' && (
            <CalendarView
              memories={memories}
              onSelectMemory={(m) => setSelectedMemory(m)}
              onUpdateMemory={handleUpdateMemory}
              onToast={addToast}
            />
          )}

          {currentPage === 'ask_sam' && (
            <AskSamChat
              memories={memories}
              onViewMemory={(id) => {
                const mem = memories.find(m => m.id === id);
                if (mem) setSelectedMemory(mem);
              }}
              onToast={addToast}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              memories={memories}
              user={user}
              onResetDemoData={handleResetDemoData}
              onClearAllData={handleClearAllData}
              onToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation & Slide-over Drawer */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={() => authService.signOut()}
        memoryCount={memories.length}
      />

      {/* Decomposition Approval Modal */}
      {decompositionData && (
        <DecompositionModal
          data={decompositionData}
          onClose={() => setDecompositionData(null)}
          onSaveApproved={handleSaveApprovedMemories}
          onToast={addToast}
        />
      )}

      {/* Memory Details / Edit Modal */}
      {selectedMemory && (
        <MemoryModal
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
          onUpdate={handleUpdateMemory}
          onDelete={handleDeleteMemory}
          onToast={addToast}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => setUser(u)}
          onToast={addToast}
        />
      )}

      {/* Notification Toasts Container */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

