import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Volume2, 
  Sliders, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Sparkles
} from 'lucide-react';
import { UserPreferences, Memory } from '../types';
import { storageService } from '../services/storageService';
import { reminderService } from '../services/reminderService';
import { AuthUser } from '../services/authService';

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  memories: Memory[];
  user: AuthUser | null;
  onResetDemoData: () => void;
  onClearAllData: () => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  preferences,
  onUpdatePreferences,
  memories,
  user,
  onResetDemoData,
  onClearAllData,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'data' | 'theme'>('profile');
  const [name, setName] = useState(preferences.name);
  const [email, setEmail] = useState(preferences.email);
  const [bio, setBio] = useState(preferences.bio);
  const [enableSound, setEnableSound] = useState(preferences.enableSound);
  const [enableNotifications, setEnableNotifications] = useState(preferences.enableBrowserNotifications);
  const [glowIntensity, setGlowIntensity] = useState(preferences.glowIntensity);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      ...preferences,
      name,
      email,
      bio
    });
    onToast('Profile updated successfully!', 'success');
  };

  const handleSaveNotifications = async () => {
    if (enableNotifications) {
      const granted = await reminderService.requestNotificationPermission();
      if (!granted) {
        onToast('Browser notification permission was not granted.', 'warning');
      }
    }
    onUpdatePreferences({
      ...preferences,
      enableSound,
      enableBrowserNotifications: enableNotifications
    });
    onToast('Notification preferences saved.', 'info');
  };

  const handleExportJSON = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAM_Second_Mind_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Full JSON backup downloaded.', 'success');
  };

  const handleExportMarkdown = () => {
    const md = storageService.exportMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAM_Memories_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Readable Markdown notes export downloaded.', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importData(content);
      if (success) {
        onToast('Memories successfully imported! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        onToast('Failed to parse backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sam-purple/10 border border-sam-purple/30 text-sam-highlight text-xs font-medium mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>System & Preferences</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-sam-text">
          Settings & Data Management
        </h2>
        <p className="text-sm text-sam-muted mt-1">
          Control your profile, audio chimes, backup exports, and privacy boundaries.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-sam-surface border border-sam-purple/20 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'profile' ? 'bg-sam-purple text-white shadow-glow-purple' : 'text-sam-muted hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'notifications' ? 'bg-sam-purple text-white shadow-glow-purple' : 'text-sam-muted hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'privacy' ? 'bg-sam-purple text-white shadow-glow-purple' : 'text-sam-muted hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy & Security</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'data' ? 'bg-sam-purple text-white shadow-glow-purple' : 'text-sam-muted hover:text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export & Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'theme' ? 'bg-sam-purple text-white shadow-glow-purple' : 'text-sam-muted hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Theme & Glow</span>
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-sam-purple/15">
            <img
              src={preferences.avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl border-2 border-sam-purple/40 object-cover shadow-glow-purple"
            />
            <div>
              <h4 className="text-base font-bold text-sam-text">{preferences.name}</h4>
              <p className="text-xs text-sam-muted">{preferences.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sam-purple/20 text-sam-highlight border border-sam-purple/30">
                PRO SECOND MIND TIER
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-sam-muted block mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-sam-bg border border-sam-purple/25 text-xs text-sam-text focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-sam-muted block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-sam-bg border border-sam-purple/25 text-xs text-sam-text focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-sam-muted block mb-1">Personal Focus / Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-sam-bg border border-sam-purple/25 text-xs text-sam-text focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white text-xs font-bold shadow-glow-purple hover:opacity-95 transition"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 space-y-6">
          <h3 className="text-base font-bold text-sam-text">Notification Channels</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-sam-card border border-sam-purple/15">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-sam-highlight" />
                <div>
                  <h4 className="text-xs font-bold text-sam-text">Futuristic Synthesizer Chimes</h4>
                  <p className="text-[11px] text-sam-muted">Plays pleasant Web Audio tone on actions and reminders</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableSound}
                onChange={(e) => setEnableSound(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-sam-card border border-sam-purple/15">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-sam-text">Browser Push Notifications</h4>
                  <p className="text-[11px] text-sam-muted">Display system notifications for scheduled commitments</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableNotifications}
                onChange={(e) => setEnableNotifications(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveNotifications}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white text-xs font-bold shadow-glow-purple hover:opacity-95 transition"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PRIVACY & CONSENT */}
      {activeTab === 'privacy' && (
        <div className="p-6 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-sam-purple/15">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-sam-text">Second Mind Privacy Architecture</h3>
              <p className="text-xs text-sam-muted">Your personal memories are sacred and confidential.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-sam-muted leading-relaxed">
            <div className="p-4 rounded-xl bg-sam-card border border-sam-purple/15">
              <h4 className="font-bold text-sam-text mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Server Telemetry in Prototype</span>
              </h4>
              <p>All recorded memories, people contacts, talking points, and preferences reside solely inside your browser's private LocalStorage sandbox.</p>
            </div>

            <div className="p-4 rounded-xl bg-sam-card border border-sam-purple/15">
              <h4 className="font-bold text-sam-text mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Explicit Data Consent</span>
              </h4>
              <p>Speech recordings are processed locally or transiently for decomposition. SAM never sells, indexes, or shares private recollections with third-party advertisers.</p>
            </div>

            <div className="p-4 rounded-xl bg-sam-card border border-sam-purple/15">
              <h4 className="font-bold text-sam-text mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Complete Data Portability & Right to Erasure</span>
              </h4>
              <p>You can export 100% of your records at any moment in open JSON or Markdown format, or permanently delete everything with one click.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA EXPORT & DANGER ZONE */}
      {activeTab === 'data' && (
        <div className="p-6 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 space-y-6">
          <h3 className="text-base font-bold text-sam-text">Data Portability & Backup</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-sam-card border border-sam-purple/15 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-sam-text mb-1">Download Full Backup (JSON)</h4>
                <p className="text-[11px] text-sam-muted mb-4">Complete structured database snapshot including all {memories.length} memories, contacts, and settings.</p>
              </div>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sam-purple text-white text-xs font-bold hover:bg-sam-purple/90 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-sam-card border border-sam-purple/15 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-sam-text mb-1">Download Markdown Notes (.md)</h4>
                <p className="text-[11px] text-sam-muted mb-4">Clean human-readable notes formatted with Obsidian/Notion compatible headers and bullet points.</p>
              </div>
              <button
                onClick={handleExportMarkdown}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sam-blue text-white text-xs font-bold hover:bg-sam-blue/90 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>

          {/* Import Backup */}
          <div className="p-4 rounded-xl bg-sam-card border border-sam-purple/15 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-sam-text">Restore / Import Backup</h4>
              <p className="text-[11px] text-sam-muted">Import a previously exported JSON backup file</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-sam-surface hover:bg-sam-cardHover border border-sam-purple/20 text-xs font-bold text-sam-highlight"
            >
              <Upload className="w-4 h-4 inline mr-1.5" />
              Upload JSON
            </button>
          </div>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-rose-500/20 space-y-4">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </h4>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <div>
                <p className="text-xs font-bold text-sam-text">Reset to Initial Demo State</p>
                <p className="text-[11px] text-sam-muted">Restores the canonical Rahul, Brother, and Food Delivery app memories</p>
              </div>
              <button
                onClick={onResetDemoData}
                className="px-4 py-2 rounded-xl bg-sam-surface hover:bg-sam-card border border-sam-purple/30 text-xs font-semibold text-sam-text shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                Reset Demo Data
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <div>
                <p className="text-xs font-bold text-rose-400">Clear All Memories</p>
                <p className="text-[11px] text-sam-muted">Permanently wipes all memory records from local storage</p>
              </div>
              <button
                onClick={onClearAllData}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: THEME & GLOW */}
      {activeTab === 'theme' && (
        <div className="p-6 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 space-y-6">
          <h3 className="text-base font-bold text-sam-text">Visual Aesthetics</h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-sam-card border border-sam-purple/15">
              <h4 className="text-xs font-bold text-sam-text mb-2">Preset Cyber-Luxe Palette</h4>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#080A12] border border-sam-purple/30" title="Background: #080A12" />
                <div className="w-8 h-8 rounded-lg bg-[#101426] border border-sam-purple/30" title="Surface: #101426" />
                <div className="w-8 h-8 rounded-lg bg-[#151A2E] border border-sam-purple/30" title="Card: #151A2E" />
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]" title="Primary Purple: #8B5CF6" />
                <div className="w-8 h-8 rounded-lg bg-[#4F8CFF]" title="Electric Blue: #4F8CFF" />
                <div className="w-8 h-8 rounded-lg bg-[#B69CFF]" title="Highlight: #B69CFF" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sam-card border border-sam-purple/15">
              <h4 className="text-xs font-bold text-sam-text mb-1">Aurora Glow Intensity</h4>
              <p className="text-[11px] text-sam-muted mb-3">Controls blur radius and neon intensity on interactive components</p>

              <div className="flex gap-2">
                {(['low', 'normal', 'high'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setGlowIntensity(lvl);
                      onUpdatePreferences({ ...preferences, glowIntensity: lvl });
                      onToast(`Glow intensity set to ${lvl}.`, 'info');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                      glowIntensity === lvl
                        ? 'bg-sam-purple text-white shadow-glow-purple'
                        : 'bg-sam-surface text-sam-muted hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

