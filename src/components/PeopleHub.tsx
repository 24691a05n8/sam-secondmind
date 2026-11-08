import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  MessageSquareShare, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { PersonContact, TalkingPoint, Memory } from '../types';

interface PeopleHubProps {
  contacts: PersonContact[];
  onAddContact: (contact: PersonContact) => void;
  onAddTalkingPoint: (contactId: string, message: string, reminderDate?: string) => void;
  onToggleTalkingPoint: (contactId: string, pointId: string) => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  memories: Memory[];
  onViewMemory: (id: string) => void;
}

export const PeopleHub: React.FC<PeopleHubProps> = ({
  contacts,
  onAddContact,
  onAddTalkingPoint,
  onToggleTalkingPoint,
  onToast,
  memories,
  onViewMemory
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string>(
    contacts[0]?.id || ''
  );

  // New Contact Form Modal
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactNotes, setNewContactNotes] = useState('');

  // New Talking Point Form
  const [talkingMessage, setTalkingMessage] = useState('');
  const [talkingDate, setTalkingDate] = useState('');

  const selectedContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  // Linked memories that mention this contact
  const linkedMemories = selectedContact ? memories.filter(m => 
    m.people.some(p => p.toLowerCase().includes(selectedContact.name.toLowerCase().split(' ')[0])) ||
    m.content.toLowerCase().includes(selectedContact.name.toLowerCase().split(' ')[0])
  ) : [];

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const colors = ['#8B5CF6', '#4F8CFF', '#38BDF8', '#10B981', '#EC4899', '#F59E0B'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newContact: PersonContact = {
      id: `contact_${Date.now()}`,
      name: newContactName.trim(),
      relationship: newContactRelation.trim() || 'Connection',
      avatarColor: randomColor,
      notes: newContactNotes.trim(),
      lastInteraction: new Date().toISOString(),
      thingsToTell: []
    };

    onAddContact(newContact);
    setSelectedContactId(newContact.id);
    setShowNewContact(false);
    setNewContactName('');
    setNewContactRelation('');
    setNewContactNotes('');
    onToast(`Added contact "${newContact.name}" to directory.`, 'success');
  };

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talkingMessage.trim() || !selectedContact) return;

    onAddTalkingPoint(
      selectedContact.id,
      talkingMessage.trim(),
      talkingDate ? new Date(talkingDate).toISOString() : undefined
    );

    setTalkingMessage('');
    setTalkingDate('');
    onToast(`Added talking point for ${selectedContact.name}.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sam-blue/10 border border-sam-blue/30 text-sam-blue text-xs font-medium mb-2">
            <MessageSquareShare className="w-3.5 h-3.5" />
            <span>People-Linked Second Mind</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sam-text">
            Things to Tell Someone
          </h2>
          <p className="text-sm text-sam-muted mt-1">
            Never forget conversations, ideas, or promises you planned to share with people you know.
          </p>
        </div>

        <button
          onClick={() => setShowNewContact(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white text-xs font-bold shadow-glow-purple hover:opacity-95 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Contact</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Contacts List */}
        <div className="lg:col-span-4 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 p-4 space-y-2">
          <h3 className="text-xs font-bold text-sam-muted uppercase tracking-wider px-2 mb-2">
            People & Collaborators ({contacts.length})
          </h3>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {contacts.map(c => {
              const pendingCount = c.thingsToTell.filter(t => t.status === 'pending').length;
              const isSelected = c.id === selectedContact?.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContactId(c.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border ${
                    isSelected
                      ? 'bg-sam-card border-sam-purple/50 shadow-glow-purple'
                      : 'hover:bg-sam-card/50 border-transparent text-sam-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                      style={{ backgroundColor: c.avatarColor }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-sam-text">{c.name}</p>
                      <p className="text-xs text-sam-muted">{c.relationship}</p>
                    </div>
                  </div>

                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-sam-blue/20 text-sam-blue text-xs font-bold font-mono">
                      {pendingCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Contact Details & Talking Points Queue */}
        <div className="lg:col-span-8 rounded-2xl bg-sam-surface/90 border border-sam-purple/20 p-6 space-y-6">
          {selectedContact ? (
            <>
              {/* Contact Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sam-purple/15">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white shadow-glow-purple shrink-0"
                    style={{ backgroundColor: selectedContact.avatarColor }}
                  >
                    {selectedContact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-sam-text">
                      {selectedContact.name}
                    </h3>
                    <p className="text-xs text-sam-muted">
                      {selectedContact.relationship} • {selectedContact.notes || 'No notes added'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-sam-muted font-mono">
                  <Clock className="w-3.5 h-3.5 text-sam-highlight" />
                  <span>
                    Last sync: {selectedContact.lastInteraction ? new Date(selectedContact.lastInteraction).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>

              {/* Add New Talking Point Form */}
              <form onSubmit={handleAddPoint} className="p-4 rounded-xl bg-sam-card border border-sam-purple/20 space-y-3">
                <label className="text-xs font-bold text-sam-text flex items-center gap-1.5">
                  <MessageSquareShare className="w-3.5 h-3.5 text-sam-highlight" />
                  <span>Add something to discuss with {selectedContact.name}:</span>
                </label>

                <textarea
                  value={talkingMessage}
                  onChange={(e) => setTalkingMessage(e.target.value)}
                  placeholder={`E.g. "Discuss the new food delivery application business model and cloud kitchen API next Friday"`}
                  rows={2}
                  className="w-full p-3 rounded-lg bg-sam-bg border border-sam-purple/25 text-xs text-sam-text placeholder-sam-muted focus:outline-none focus:border-sam-purple/60"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Calendar className="w-4 h-4 text-sam-muted shrink-0" />
                    <input
                      type="datetime-local"
                      value={talkingDate}
                      onChange={(e) => setTalkingDate(e.target.value)}
                      className="p-1.5 rounded-lg bg-sam-bg border border-sam-purple/25 text-xs text-sam-text focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!talkingMessage.trim()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white text-xs font-bold shadow-glow-purple hover:opacity-95 disabled:opacity-40 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Queue Talking Point</span>
                  </button>
                </div>
              </form>

              {/* Pending Talking Points Queue */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-sam-muted uppercase tracking-wider">
                  Pending Talking Points ({selectedContact.thingsToTell.filter(t => t.status === 'pending').length})
                </h4>

                {selectedContact.thingsToTell.filter(t => t.status === 'pending').length === 0 ? (
                  <div className="p-6 rounded-xl bg-sam-card/40 border border-sam-purple/10 text-center text-xs text-sam-muted">
                    No pending points. You're completely up to date with {selectedContact.name}!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedContact.thingsToTell.filter(t => t.status === 'pending').map(point => (
                      <div
                        key={point.id}
                        className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-sam-card border border-sam-purple/20 hover:border-sam-purple/40 transition group"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onToggleTalkingPoint(selectedContact.id, point.id)}
                            className="mt-0.5 text-sam-muted hover:text-emerald-400 transition"
                            title="Mark as discussed"
                          >
                            <Circle className="w-4 h-4" />
                          </button>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-sam-text leading-snug">
                              {point.message}
                            </p>
                            {point.reminderDate && (
                              <div className="flex items-center gap-1.5 text-[10px] text-amber-300 mt-1">
                                <Calendar className="w-3 h-3" />
                                <span>Reminder: {new Date(point.reminderDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleTalkingPoint(selectedContact.id, point.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 text-xs hover:text-white transition shrink-0"
                        >
                          Done
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Discussions History */}
              {selectedContact.thingsToTell.some(t => t.status === 'completed') && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-sam-muted uppercase tracking-wider">
                    Discussed History
                  </h4>
                  <div className="space-y-1.5 opacity-70">
                    {selectedContact.thingsToTell.filter(t => t.status === 'completed').map(point => (
                      <div
                        key={point.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-sam-card/40 border border-sam-purple/10 text-xs text-sam-muted line-through"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>{point.message}</span>
                        </div>
                        <span className="text-[10px] font-mono">
                          {point.completedAt ? new Date(point.completedAt).toLocaleDateString() : 'Completed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Memories from SAM Vault */}
              {linkedMemories.length > 0 && (
                <div className="pt-4 border-t border-sam-purple/15 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-sam-text">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sam-highlight" />
                      <span>Saved Memories Referencing {selectedContact.name} ({linkedMemories.length})</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {linkedMemories.map(m => (
                      <div
                        key={m.id}
                        onClick={() => onViewMemory(m.id)}
                        className="p-3 rounded-xl bg-sam-card hover:bg-sam-cardHover border border-sam-purple/15 cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between text-[10px] text-sam-muted mb-1">
                          <span className="text-sam-highlight font-semibold">{m.category.replace('_', ' ')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                        <h5 className="text-xs font-bold text-sam-text line-clamp-1">{m.title}</h5>
                        <p className="text-[11px] text-sam-muted line-clamp-2 mt-1">{m.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-sam-muted text-sm">
              No contacts found. Click "New Contact" to start organizing your people-linked mind!
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Contact */}
      {showNewContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateContact}
            className="w-full max-w-md bg-sam-surface border border-sam-purple/30 rounded-2xl p-6 space-y-4 shadow-2xl animate-scaleUp"
          >
            <h3 className="text-lg font-bold text-sam-text flex items-center gap-2">
              <Users className="w-5 h-5 text-sam-highlight" />
              <span>Create New Contact</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-sam-muted block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full p-2.5 rounded-lg bg-sam-bg border border-sam-purple/30 text-xs text-sam-text focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-sam-muted block mb-1">Relationship / Role</label>
              <input
                type="text"
                value={newContactRelation}
                onChange={(e) => setNewContactRelation(e.target.value)}
                placeholder="e.g. Co-founder, Brother, Manager, Client"
                className="w-full p-2.5 rounded-lg bg-sam-bg border border-sam-purple/30 text-xs text-sam-text focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-sam-muted block mb-1">Notes / Context</label>
              <textarea
                value={newContactNotes}
                onChange={(e) => setNewContactNotes(e.target.value)}
                rows={2}
                placeholder="Details about communication style or key projects..."
                className="w-full p-2.5 rounded-lg bg-sam-bg border border-sam-purple/30 text-xs text-sam-text focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewContact(false)}
                className="px-4 py-2 rounded-lg bg-sam-card text-xs text-sam-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-sam-purple to-sam-blue text-xs font-bold text-white shadow-glow-purple"
              >
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

