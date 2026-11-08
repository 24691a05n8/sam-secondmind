export type CategoryType = 
  | 'memorable_moments'
  | 'things_to_remember'
  | 'ideas_thoughts'
  | 'things_to_tell'
  | 'people_conversations'
  | 'important_dates'
  | 'daily_life'
  | 'tasks_commitments';

export type ImportanceLevel = 'low' | 'medium' | 'high';
export type ReminderPriority = 'normal' | 'high' | 'urgent';
export type ReminderStatus = 'none' | 'pending' | 'completed';

export interface Memory {
  id: string;
  title: string;
  content: string;
  originalTranscript?: string;
  category: CategoryType;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  tags: string[];
  importance: ImportanceLevel;
  isFavorite: boolean;
  isArchived: boolean;
  people: string[];
  reminderDate?: string; // ISO String
  reminderStatus: ReminderStatus;
  reminderPriority?: ReminderPriority;
  imageUrl?: string;
  source: 'voice' | 'text' | 'image' | 'ai';
  notes?: string[];
}

export interface TalkingPoint {
  id: string;
  message: string;
  status: 'pending' | 'completed';
  reminderDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PersonContact {
  id: string;
  name: string;
  relationship: string;
  avatarColor: string;
  notes?: string;
  thingsToTell: TalkingPoint[];
  lastInteraction?: string;
}

export interface ChatSourceReference {
  memoryId: string;
  title: string;
  category: CategoryType;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sam';
  text: string;
  timestamp: string;
  sources?: ChatSourceReference[];
  suggestedActions?: string[];
  isThinking?: boolean;
}

export interface DecomposedItemDraft {
  id: string;
  title: string;
  content: string;
  category: CategoryType;
  importance: ImportanceLevel;
  tags: string[];
  people: string[];
  reminderDate?: string;
  notes?: string[];
}

export interface DecompositionResult {
  transcript: string;
  grammarCorrected: string;
  summary: string;
  items: DecomposedItemDraft[];
}

export interface UserPreferences {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  enableSound: boolean;
  enableBrowserNotifications: boolean;
  theme: string;
  glowIntensity: 'low' | 'normal' | 'high';
  exportFormat: 'json' | 'markdown';
}

export interface CategoryMetadata {
  id: CategoryType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

