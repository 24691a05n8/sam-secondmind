import { Memory, PersonContact, UserPreferences } from '../types';
import { INITIAL_MEMORIES, INITIAL_CONTACTS, INITIAL_PREFERENCES } from '../utils/constants';

const MEMORIES_KEY = 'sam_memories_v1';
const CONTACTS_KEY = 'sam_contacts_v1';
const PREFERENCES_KEY = 'sam_preferences_v1';
const AUTH_KEY = 'sam_auth_state_v1';

export interface StorageAdapter {
  getMemories(): Promise<Memory[]>;
  saveMemory(memory: Memory): Promise<Memory>;
  updateMemory(id: string, updates: Partial<Memory>): Promise<Memory>;
  deleteMemory(id: string): Promise<boolean>;
}

class LocalStorageService implements StorageAdapter {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(MEMORIES_KEY)) {
      localStorage.setItem(MEMORIES_KEY, JSON.stringify(INITIAL_MEMORIES));
    }
    if (!localStorage.getItem(CONTACTS_KEY)) {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(INITIAL_CONTACTS));
    }
    if (!localStorage.getItem(PREFERENCES_KEY)) {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(INITIAL_PREFERENCES));
    }
  }

  // --- MEMORIES ---
  public async getMemories(): Promise<Memory[]> {
    try {
      const data = localStorage.getItem(MEMORIES_KEY);
      return data ? JSON.parse(data) : INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  }

  public async saveMemory(memory: Memory): Promise<Memory> {
    const list = await this.getMemories();
    const updated = [memory, ...list];
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(updated));
    return memory;
  }

  public async saveMultipleMemories(memories: Memory[]): Promise<Memory[]> {
    const list = await this.getMemories();
    const updated = [...memories, ...list];
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(updated));
    return memories;
  }

  public async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory> {
    const list = await this.getMemories();
    const index = list.findIndex(m => m.id === id);
    if (index === -1) throw new Error(`Memory with id ${id} not found`);

    const updatedMemory = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    list[index] = updatedMemory;
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(list));
    return updatedMemory;
  }

  public async deleteMemory(id: string): Promise<boolean> {
    const list = await this.getMemories();
    const filtered = list.filter(m => m.id !== id);
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(filtered));
    return true;
  }

  // --- CONTACTS & TALKING POINTS ---
  public async getContacts(): Promise<PersonContact[]> {
    try {
      const data = localStorage.getItem(CONTACTS_KEY);
      return data ? JSON.parse(data) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  }

  public async saveContact(contact: PersonContact): Promise<PersonContact> {
    const list = await this.getContacts();
    const updated = [contact, ...list];
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
    return contact;
  }

  public async updateContact(id: string, updates: Partial<PersonContact>): Promise<PersonContact> {
    const list = await this.getContacts();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Contact not found');
    list[idx] = { ...list[idx], ...updates };
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(list));
    return list[idx];
  }

  public async addTalkingPoint(contactId: string, message: string, reminderDate?: string): Promise<PersonContact> {
    const list = await this.getContacts();
    const idx = list.findIndex(c => c.id === contactId);
    if (idx === -1) throw new Error('Contact not found');

    const newPoint = {
      id: `tt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      message,
      status: 'pending' as const,
      reminderDate,
      createdAt: new Date().toISOString()
    };

    list[idx].thingsToTell = [newPoint, ...list[idx].thingsToTell];
    list[idx].lastInteraction = new Date().toISOString();
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(list));
    return list[idx];
  }

  public async toggleTalkingPoint(contactId: string, pointId: string): Promise<PersonContact> {
    const list = await this.getContacts();
    const idx = list.findIndex(c => c.id === contactId);
    if (idx === -1) throw new Error('Contact not found');

    list[idx].thingsToTell = list[idx].thingsToTell.map(p => {
      if (p.id === pointId) {
        const nextStatus = p.status === 'pending' ? 'completed' : 'pending';
        return {
          ...p,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return p;
    });

    localStorage.setItem(CONTACTS_KEY, JSON.stringify(list));
    return list[idx];
  }

  // --- USER PREFERENCES ---
  public async getPreferences(): Promise<UserPreferences> {
    try {
      const data = localStorage.getItem(PREFERENCES_KEY);
      return data ? JSON.parse(data) : INITIAL_PREFERENCES;
    } catch {
      return INITIAL_PREFERENCES;
    }
  }

  public async savePreferences(prefs: UserPreferences): Promise<UserPreferences> {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    return prefs;
  }

  // --- BACKUP & RESTORE ---
  public exportData(): string {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      memories: JSON.parse(localStorage.getItem(MEMORIES_KEY) || '[]'),
      contacts: JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]'),
      preferences: JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}')
    };
    return JSON.stringify(payload, null, 2);
  }

  public exportMarkdown(): string {
    const memories: Memory[] = JSON.parse(localStorage.getItem(MEMORIES_KEY) || '[]');
    let md = `# SAM - Second Mind Memory Export\n`;
    md += `*Generated on: ${new Date().toLocaleString()}*\n\n`;

    memories.forEach(m => {
      md += `## ${m.title}\n`;
      md += `**Category:** ${m.category.replace('_', ' ').toUpperCase()} | **Date:** ${new Date(m.createdAt).toLocaleDateString()} | **Importance:** ${m.importance.toUpperCase()}\n\n`;
      md += `${m.content}\n\n`;
      if (m.originalTranscript) {
        md += `> **Original Transcript:** ${m.originalTranscript}\n\n`;
      }
      if (m.tags && m.tags.length > 0) {
        md += `*Tags:* #${m.tags.join(' #')}\n\n`;
      }
      if (m.people && m.people.length > 0) {
        md += `*People:* ${m.people.join(', ')}\n\n`;
      }
      if (m.reminderDate) {
        md += `*Reminder Scheduled:* ${new Date(m.reminderDate).toLocaleString()} (Status: ${m.reminderStatus})\n\n`;
      }
      if (m.notes && m.notes.length > 0) {
        md += `**Key Points:**\n`;
        m.notes.forEach(n => {
          md += `- ${n}\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    return md;
  }

  public importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.memories) localStorage.setItem(MEMORIES_KEY, JSON.stringify(data.memories));
      if (data.contacts) localStorage.setItem(CONTACTS_KEY, JSON.stringify(data.contacts));
      if (data.preferences) localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data.preferences));
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  public resetAllToDemo(): void {
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(INITIAL_MEMORIES));
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(INITIAL_CONTACTS));
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(INITIAL_PREFERENCES));
  }

  public clearAllData(): void {
    localStorage.setItem(MEMORIES_KEY, JSON.stringify([]));
    localStorage.setItem(CONTACTS_KEY, JSON.stringify([]));
  }
}

export const storageService = new LocalStorageService();

