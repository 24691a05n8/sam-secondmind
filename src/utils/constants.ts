import { CategoryMetadata, Memory, PersonContact, UserPreferences } from '../types';

export const CATEGORIES: Record<string, CategoryMetadata> = {
  memorable_moments: {
    id: 'memorable_moments',
    label: 'Memorable Moments',
    description: 'Achievements, travel, celebrations and personal experiences.',
    icon: 'Sparkles',
    color: '#F43F5E',
    bgColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.3)'
  },
  things_to_remember: {
    id: 'things_to_remember',
    label: 'Things to Remember',
    description: 'Important information, facts, codes, and critical details.',
    icon: 'Bookmark',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)'
  },
  ideas_thoughts: {
    id: 'ideas_thoughts',
    label: 'Ideas & Thoughts',
    description: 'Creative sparks, startup concepts, and philosophical reflections.',
    icon: 'Lightbulb',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  things_to_tell: {
    id: 'things_to_tell',
    label: 'Things to Tell',
    description: 'Talking points, questions, and updates to discuss with people.',
    icon: 'MessageSquareShare',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.3)'
  },
  people_conversations: {
    id: 'people_conversations',
    label: 'People & Conversations',
    description: 'Insights, key takeaways, and updates from people in your life.',
    icon: 'Users',
    color: '#4F8CFF',
    bgColor: 'rgba(79, 140, 255, 0.12)',
    borderColor: 'rgba(79, 140, 255, 0.3)'
  },
  important_dates: {
    id: 'important_dates',
    label: 'Important Dates',
    description: 'Birthdays, anniversaries, key milestones, and renewal dates.',
    icon: 'CalendarDays',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    borderColor: 'rgba(236, 72, 153, 0.3)'
  },
  daily_life: {
    id: 'daily_life',
    label: 'Daily Life',
    description: 'Daily observations, health reflections, and mindset notes.',
    icon: 'Coffee',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  tasks_commitments: {
    id: 'tasks_commitments',
    label: 'Tasks & Commitments',
    description: 'Promises made, action items, and pending obligations.',
    icon: 'CheckSquare',
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.3)'
  }
};

export const INITIAL_PREFERENCES: UserPreferences = {
  name: 'Alex Rivera',
  email: 'alex.rivera@secondmind.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  bio: 'Product Architect & Founder exploring human cognition augmentation.',
  enableSound: true,
  enableBrowserNotifications: true,
  theme: 'dark-futuristic',
  glowIntensity: 'high',
  exportFormat: 'markdown'
};

export const INITIAL_CONTACTS: PersonContact[] = [
  {
    id: 'contact_rahul',
    name: 'Rahul Sharma',
    relationship: 'Colleague & Co-founder',
    avatarColor: '#8B5CF6',
    notes: 'Tech architect and venture collaborator. Passionate about AI logistics.',
    lastInteraction: '2026-11-07T14:30:00Z',
    thingsToTell: [
      {
        id: 'tt_1',
        message: 'Review API architecture & discuss food delivery business model next Friday',
        status: 'pending',
        reminderDate: '2026-11-13T10:00:00Z',
        createdAt: '2026-11-07T14:35:00Z'
      },
      {
        id: 'tt_2',
        message: 'Share the updated design prototypes for SAM mobile interface',
        status: 'pending',
        createdAt: '2026-11-06T09:00:00Z'
      }
    ]
  },
  {
    id: 'contact_brother',
    name: 'David Rivera (Brother)',
    relationship: 'Family',
    avatarColor: '#38BDF8',
    notes: 'Software engineer living in Austin. Interested in real estate & robotics.',
    lastInteraction: '2026-11-05T18:00:00Z',
    thingsToTell: [
      {
        id: 'tt_3',
        message: 'Tell him about my new startup project and get his thoughts on hardware telemetry',
        status: 'pending',
        reminderDate: '2026-11-09T18:30:00Z',
        createdAt: '2026-11-05T18:10:00Z'
      }
    ]
  },
  {
    id: 'contact_manager',
    name: 'Elena Rostova (Manager)',
    relationship: 'VP of Engineering',
    avatarColor: '#10B981',
    notes: 'Quarterly reviews, team resource allocation, and cloud compute budget.',
    lastInteraction: '2026-11-04T11:00:00Z',
    thingsToTell: [
      {
        id: 'tt_4',
        message: 'Present Q4 infrastructure migration report and request GPU budget',
        status: 'pending',
        reminderDate: '2026-11-10T15:00:00Z',
        createdAt: '2026-11-04T11:15:00Z'
      }
    ]
  }
];

export const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'mem_1',
    title: 'Business Opportunity with Rahul',
    content: 'Rahul pitched an exciting business partnership regarding localized cloud kitchens and high-speed B2B food delivery logistics. He has strong supplier connections.',
    originalTranscript: 'I met Rahul today. He told me about a business opportunity. I should discuss it with him next Friday. I also got an idea to build a food delivery application.',
    category: 'people_conversations',
    createdAt: '2026-11-07T10:15:00Z',
    updatedAt: '2026-11-07T10:15:00Z',
    tags: ['business', 'partnership', 'rahul', 'startup'],
    importance: 'high',
    isFavorite: true,
    isArchived: false,
    people: ['Rahul Sharma'],
    source: 'voice',
    notes: [
      'Rahul has connections with 40+ restaurant chains',
      'Requires preliminary tech stack evaluation'
    ]
  },
  {
    id: 'mem_2',
    title: 'Discussion with Rahul Next Friday',
    content: 'Prepare the commercial model breakdown and sync with Rahul to evaluate investment and tech feasibility.',
    originalTranscript: 'I should discuss it with him next Friday.',
    category: 'things_to_remember',
    createdAt: '2026-11-07T10:15:00Z',
    updatedAt: '2026-11-07T10:15:00Z',
    tags: ['meeting', 'rahul', 'followup'],
    importance: 'high',
    isFavorite: false,
    isArchived: false,
    people: ['Rahul Sharma'],
    reminderDate: '2026-11-13T10:00:00Z',
    reminderStatus: 'pending',
    reminderPriority: 'urgent',
    source: 'voice',
    notes: [
      'Schedule a Zoom or coffee meetup at 10 AM',
      'Bring wireframe decks'
    ]
  },
  {
    id: 'mem_3',
    title: 'On-Demand Cloud Kitchen Food Delivery App',
    content: 'Concept for a dynamic food delivery platform that utilizes micro-fulfillment hubs and AI-driven batch routing to deliver farm-to-table meals in under 15 minutes.',
    originalTranscript: 'I also got an idea to build a food delivery application.',
    category: 'ideas_thoughts',
    createdAt: '2026-11-07T10:15:00Z',
    updatedAt: '2026-11-07T10:15:00Z',
    tags: ['ideas', 'food-delivery', 'ai', 'logistics'],
    importance: 'medium',
    isFavorite: true,
    isArchived: false,
    people: [],
    source: 'voice',
    notes: [
      'Core differentiator: Hyper-local micro-kitchens',
      'Predictive meal prep based on neighborhood ordering patterns'
    ]
  },
  {
    id: 'mem_4',
    title: 'Tell Brother About New Project',
    content: 'Catch up with David to reveal the AI second-mind architecture and get his feedback on the embedded database syncing layer.',
    originalTranscript: 'I want to tell my brother about my new project this weekend.',
    category: 'things_to_tell',
    createdAt: '2026-11-06T18:40:00Z',
    updatedAt: '2026-11-06T18:40:00Z',
    tags: ['family', 'brother', 'project'],
    importance: 'medium',
    isFavorite: false,
    isArchived: false,
    people: ['David Rivera (Brother)'],
    reminderDate: '2026-11-09T18:30:00Z',
    reminderStatus: 'pending',
    reminderPriority: 'normal',
    source: 'text',
    notes: [
      'Show him the local vector search demo'
    ]
  },
  {
    id: 'mem_5',
    title: 'Summit of Mount Rainier Sunrise',
    content: 'Reached the summit ridge at 6:15 AM just as the crimson sun pierced through the sea of clouds. Unforgettable sense of peace, clarity and gratitude.',
    category: 'memorable_moments',
    createdAt: '2026-10-18T06:15:00Z',
    updatedAt: '2026-10-18T06:15:00Z',
    tags: ['travel', 'hiking', 'nature', 'life-milestone'],
    importance: 'high',
    isFavorite: true,
    isArchived: false,
    people: ['Sarah Jenkins'],
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    source: 'image',
    notes: [
      'Temp was -4°C at summit',
      'Felt a profound realization about focusing on what truly matters'
    ]
  },
  {
    id: 'mem_6',
    title: "Mom's 60th Birthday Celebration",
    content: 'Organize surprise dinner party at Villa Bella. Family from Chicago arriving Friday afternoon. Need to order custom botanical cake by Nov 18.',
    category: 'important_dates',
    createdAt: '2026-11-01T12:00:00Z',
    updatedAt: '2026-11-01T12:00:00Z',
    tags: ['family', 'birthday', 'celebration'],
    importance: 'high',
    isFavorite: true,
    isArchived: false,
    people: ['Mom', 'David Rivera (Brother)'],
    reminderDate: '2026-11-24T09:00:00Z',
    reminderStatus: 'pending',
    reminderPriority: 'urgent',
    source: 'text',
    notes: [
      'Cake order deadline: Nov 18',
      'Reservations confirmed for 14 guests'
    ]
  },
  {
    id: 'mem_7',
    title: 'Morning Focus & Deep Work Routine Reflection',
    content: 'Tested the 90-minute morning deep work block with zero phone notifications before 10 AM. Completed entire system design doc with extraordinary focus. Keep this permanent habit.',
    category: 'daily_life',
    createdAt: '2026-11-05T08:30:00Z',
    updatedAt: '2026-11-05T08:30:00Z',
    tags: ['habits', 'productivity', 'wellness'],
    importance: 'medium',
    isFavorite: false,
    isArchived: false,
    people: [],
    source: 'text',
    notes: [
      'Energy level: 9/10',
      'Drink 500ml water first thing'
    ]
  },
  {
    id: 'mem_8',
    title: 'Submit Q4 Cloud Infrastructure Budget',
    content: 'Finalize server and inference cost estimations with finance team and submit to VP Elena Rostova before quarterly board review.',
    category: 'tasks_commitments',
    createdAt: '2026-11-04T16:20:00Z',
    updatedAt: '2026-11-04T16:20:00Z',
    tags: ['work', 'budget', 'commitments'],
    importance: 'high',
    isFavorite: false,
    isArchived: false,
    people: ['Elena Rostova (Manager)'],
    reminderDate: '2026-11-10T15:00:00Z',
    reminderStatus: 'pending',
    reminderPriority: 'urgent',
    source: 'text',
    notes: [
      'Include 25% buffer for GPU burst capacity'
    ]
  }
];

export const SUGGESTED_QUESTIONS = [
  "What did Rahul tell me?",
  "What business ideas have I saved?",
  "What do I need to discuss with my manager?",
  "What were my happiest memories?",
  "What promises have I made?",
  "What should I remember this week?",
  "What did I plan last month?"
];

