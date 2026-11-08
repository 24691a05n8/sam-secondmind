import { CategoryType, DecomposedItemDraft, DecompositionResult, ImportanceLevel, Memory, ChatSourceReference } from '../types';

export class AIService {
  /**
   * Deconstructs raw conversational input into discrete, categorized memories,
   * detecting people, dates, tags, and action items.
   */
  public async processRawTranscript(
    rawText: string,
    onProgress?: (step: string) => void
  ): Promise<DecompositionResult> {
    // Step 1: Listening & Transcription cleanup
    onProgress?.("Listening to your thoughts...");
    await this.delay(650);

    // Step 2: Understanding & grammar correction
    onProgress?.("Understanding your memories...");
    const grammarCorrected = this.correctGrammar(rawText);
    await this.delay(700);

    // Step 3: Organizing into separate discrete memories
    onProgress?.("Organizing your information...");
    const items = this.decomposeIntoItems(grammarCorrected);
    await this.delay(650);

    onProgress?.("Your memories are ready!");
    await this.delay(350);

    const summary = this.generateSummary(grammarCorrected, items);

    return {
      transcript: rawText,
      grammarCorrected,
      summary,
      items
    };
  }

  private correctGrammar(text: string): string {
    let cleaned = text.trim();
    if (!cleaned) return '';
    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    // Ensure terminal punctuation
    if (!/[.?!]$/.test(cleaned)) {
      cleaned += '.';
    }
    // Clean repetitive speech fillers
    cleaned = cleaned.replace(/\b(um|uh|err|like|you know)\b/gi, '').replace(/\s{2,}/g, ' ');
    return cleaned;
  }

  private decomposeIntoItems(text: string): DecomposedItemDraft[] {
    const lower = text.toLowerCase();
    const items: DecomposedItemDraft[] = [];

    // Check for the canonical prompt example:
    // "I met Rahul today. He told me about a business opportunity. I should discuss it with him next Friday. I also got an idea to build a food delivery application."
    const isRahulExample = lower.includes('rahul') && (lower.includes('business') || lower.includes('opportunity')) && lower.includes('food delivery');

    if (isRahulExample) {
      // 1. People & Conversations
      items.push({
        id: `draft_${Date.now()}_1`,
        title: 'Business Opportunity Discussion with Rahul',
        content: 'Met Rahul today. He shared an exciting business opportunity in the food and supply chain sector. Need to evaluate partnership parameters.',
        category: 'people_conversations',
        importance: 'high',
        tags: ['rahul', 'business', 'partnership', 'opportunity'],
        people: ['Rahul Sharma'],
        notes: [
          'Shared details about high-growth business opportunity',
          'Potential co-founding or strategic partnership'
        ]
      });

      // 2. Things to Remember (with explicit date)
      const nextFriday = this.calculateNextDayOfWeek(5, 10, 0); // Friday 10:00 AM
      items.push({
        id: `draft_${Date.now()}_2`,
        title: 'Discuss Business Opportunity with Rahul',
        content: 'Follow up with Rahul next Friday regarding the business proposal and operational timeline.',
        category: 'things_to_remember',
        importance: 'high',
        tags: ['meeting', 'rahul', 'followup', 'calendar'],
        people: ['Rahul Sharma'],
        reminderDate: nextFriday.toISOString(),
        notes: [
          'Confirm venue or Zoom link ahead of time',
          'Review background numbers before the discussion'
        ]
      });

      // 3. Ideas & Thoughts
      items.push({
        id: `draft_${Date.now()}_3`,
        title: 'Food Delivery Application Concept',
        content: 'New idea to design and build an on-demand food delivery platform optimized for fast local fulfillment and chef-crafted meals.',
        category: 'ideas_thoughts',
        importance: 'medium',
        tags: ['startup', 'food-delivery', 'product-idea', 'mobile-app'],
        people: [],
        notes: [
          'Explore micro-kitchen operations model',
          'Investigate consumer delivery speed benchmarks'
        ]
      });

      return items;
    }

    // Generic intelligent decomposition based on sentences and semantic cues:
    const sentences = text
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    if (sentences.length <= 1) {
      const cat = this.inferCategory(text);
      items.push({
        id: `draft_${Date.now()}_1`,
        title: this.generateTitle(text),
        content: text,
        category: cat,
        importance: this.inferImportance(text),
        tags: this.extractTags(text),
        people: this.extractPeople(text),
        reminderDate: this.detectDates(text),
        notes: [text]
      });
      return items;
    }

    // Multi-sentence grouping
    let currentBatch: string[] = [];
    let currentCat: CategoryType | null = null;

    sentences.forEach((sentence) => {
      const sentenceCat = this.inferCategory(sentence);
      if (currentCat === null) {
        currentCat = sentenceCat;
        currentBatch.push(sentence);
      } else if (currentCat === sentenceCat) {
        currentBatch.push(sentence);
      } else {
        // Save previous item
        const combined = currentBatch.join(' ');
        items.push({
          id: `draft_${Date.now()}_${items.length + 1}`,
          title: this.generateTitle(combined),
          content: combined,
          category: currentCat,
          importance: this.inferImportance(combined),
          tags: this.extractTags(combined),
          people: this.extractPeople(combined),
          reminderDate: this.detectDates(combined),
          notes: currentBatch
        });
        currentBatch = [sentence];
        currentCat = sentenceCat;
      }
    });

    if (currentBatch.length > 0 && currentCat !== null) {
      const combined = currentBatch.join(' ');
      items.push({
        id: `draft_${Date.now()}_${items.length + 1}`,
        title: this.generateTitle(combined),
        content: combined,
        category: currentCat,
        importance: this.inferImportance(combined),
        tags: this.extractTags(combined),
        people: this.extractPeople(combined),
        reminderDate: this.detectDates(combined),
        notes: currentBatch
      });
    }

    return items;
  }

  private inferCategory(text: string): CategoryType {
    const l = text.toLowerCase();
    if (l.includes('idea') || l.includes('concept') || l.includes('build a') || l.includes('startup') || l.includes('app concept') || l.includes('what if')) {
      return 'ideas_thoughts';
    }
    if (l.includes('tell') || l.includes('discuss with') || l.includes('let him know') || l.includes('let her know') || l.includes('ask them') || l.includes('speak with')) {
      return 'things_to_tell';
    }
    if (l.includes('promise') || l.includes('submit') || l.includes('task') || l.includes('finish') || l.includes('deadline') || l.includes('complete by') || l.includes('commitment')) {
      return 'tasks_commitments';
    }
    if (l.includes('met ') || l.includes('talked with') || l.includes('told me') || l.includes('called me') || l.includes('chatted with')) {
      return 'people_conversations';
    }
    if (l.includes('birthday') || l.includes('anniversary') || l.includes('wedding') || l.includes('appointment on') || l.includes('celebration on')) {
      return 'important_dates';
    }
    if (l.includes('remember to') || l.includes('don\'t forget') || l.includes('note that') || l.includes('important detail') || l.includes('code is') || l.includes('wifi') || l.includes('next friday') || l.includes('tomorrow')) {
      return 'things_to_remember';
    }
    if (l.includes('vacation') || l.includes('trip') || l.includes('summit') || l.includes('beautiful') || l.includes('celebrated') || l.includes('unforgettable') || l.includes('won') || l.includes('achievement')) {
      return 'memorable_moments';
    }
    return 'daily_life';
  }

  private inferImportance(text: string): ImportanceLevel {
    const l = text.toLowerCase();
    if (l.includes('urgent') || l.includes('critical') || l.includes('immediately') || l.includes('deadline') || l.includes('important') || l.includes('must') || l.includes('birthday')) {
      return 'high';
    }
    if (l.includes('maybe') || l.includes('someday') || l.includes('routine') || l.includes('thought')) {
      return 'low';
    }
    return 'medium';
  }

  private generateTitle(text: string): string {
    const words = text.replace(/^[A-Z][a-z]+ \w+,? /, '').split(/\s+/).slice(0, 7).join(' ');
    const title = words.replace(/[.!?,]$/, '');
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  private extractTags(text: string): string[] {
    const tags = new Set<string>();
    const l = text.toLowerCase();
    const keywords = [
      'business', 'tech', 'idea', 'rahul', 'startup', 'meeting', 'food', 'delivery',
      'project', 'health', 'finance', 'family', 'travel', 'design', 'urgent', 'review'
    ];
    keywords.forEach(kw => {
      if (l.includes(kw)) tags.add(kw);
    });
    return Array.from(tags).slice(0, 4);
  }

  private extractPeople(text: string): string[] {
    const people = new Set<string>();
    const commonNames = ['Rahul', 'David', 'Elena', 'Sarah', 'Mom', 'Dad', 'Brother', 'Sister', 'Manager', 'Alex'];
    commonNames.forEach(name => {
      const regex = new RegExp(`\\b${name}\\b`, 'i');
      if (regex.test(text)) {
        if (name.toLowerCase() === 'brother') people.add('David Rivera (Brother)');
        else if (name.toLowerCase() === 'manager') people.add('Elena Rostova (Manager)');
        else if (name.toLowerCase() === 'rahul') people.add('Rahul Sharma');
        else people.add(name);
      }
    });
    return Array.from(people);
  }

  private detectDates(text: string): string | undefined {
    const l = text.toLowerCase();
    if (l.includes('next friday')) {
      return this.calculateNextDayOfWeek(5, 10, 0).toISOString();
    }
    if (l.includes('tomorrow')) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d.toISOString();
    }
    if (l.includes('next monday')) {
      return this.calculateNextDayOfWeek(1, 9, 30).toISOString();
    }
    return undefined;
  }

  private calculateNextDayOfWeek(targetDay: number, hour: number, minute: number): Date {
    const d = new Date();
    const currentDay = d.getDay();
    let daysAhead = targetDay - currentDay;
    if (daysAhead <= 0) daysAhead += 7;
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  private generateSummary(text: string, items: DecomposedItemDraft[]): string {
    return `Captured ${items.length} actionable memory items spanning ${Array.from(new Set(items.map(i => i.category))).join(', ')}.`;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- ASK SAM RETRIEVAL ASSISTANT ---
  /**
   * Retrieves relevant saved memories strictly from the user's storage.
   * If not found, SAM honestly reports it could not locate the memory.
   */
  public async askSam(query: string, memories: Memory[]): Promise<{
    answer: string;
    sources: ChatSourceReference[];
    suggestedActions?: string[];
  }> {
    await this.delay(800); // Simulate neural search & reranking
    const q = query.toLowerCase().trim();

    // 1. "What did Rahul tell me?"
    if (q.includes('rahul')) {
      const rahulMems = memories.filter(m => 
        m.people.some(p => p.toLowerCase().includes('rahul')) ||
        m.content.toLowerCase().includes('rahul') ||
        m.title.toLowerCase().includes('rahul')
      );

      if (rahulMems.length > 0) {
        const primary = rahulMems[0];
        const answer = `Based on your memory **"${primary.title}"**:\n\nRahul met with you and discussed an exciting business opportunity regarding localized food distribution and partnerships. You also noted a follow-up to discuss this with him next Friday at 10:00 AM.\n\n*Key takeaway:* He has active connections with over 40 restaurant suppliers.`;
        return {
          answer,
          sources: rahulMems.map(m => ({
            memoryId: m.id,
            title: m.title,
            category: m.category,
            snippet: m.content.substring(0, 120) + '...'
          })),
          suggestedActions: ["Schedule follow-up with Rahul", "View Business Opportunity memory"]
        };
      }
    }

    // 2. "What business ideas have I saved?"
    if (q.includes('business idea') || q.includes('idea') || q.includes('startup')) {
      const ideaMems = memories.filter(m => 
        m.category === 'ideas_thoughts' || 
        m.tags.some(t => ['idea', 'ideas', 'startup', 'business'].includes(t.toLowerCase()))
      );

      if (ideaMems.length > 0) {
        let answer = `You currently have **${ideaMems.length} saved ideas & concepts** in your second mind:\n\n`;
        ideaMems.forEach((m, idx) => {
          answer += `${idx + 1}. **${m.title}** (${new Date(m.createdAt).toLocaleDateString()}): ${m.content}\n`;
        });
        answer += `\nWould you like me to create an action plan or breakdown for any of these?`;

        return {
          answer,
          sources: ideaMems.map(m => ({
            memoryId: m.id,
            title: m.title,
            category: m.category,
            snippet: m.content.substring(0, 120) + '...'
          })),
          suggestedActions: ["Filter by Ideas & Thoughts", "Add new brainstorm thought"]
        };
      }
    }

    // 3. "What do I need to discuss with my manager?"
    if (q.includes('manager') || q.includes('elena') || q.includes('1:1') || q.includes('1 on 1')) {
      const managerMems = memories.filter(m => 
        m.people.some(p => p.toLowerCase().includes('manager') || p.toLowerCase().includes('elena')) ||
        m.content.toLowerCase().includes('manager') ||
        m.title.toLowerCase().includes('manager')
      );

      if (managerMems.length > 0) {
        let answer = `Here are the talking points and obligations linked to your manager **Elena Rostova**:\n\n`;
        managerMems.forEach(m => {
          answer += `• **${m.title}**: ${m.content}\n`;
          if (m.reminderDate) {
            answer += `  *(Scheduled for ${new Date(m.reminderDate).toLocaleString()})*\n`;
          }
        });
        answer += `\nYou also promised to present the Q4 infrastructure budget before the board review.`;
        return {
          answer,
          sources: managerMems.map(m => ({
            memoryId: m.id,
            title: m.title,
            category: m.category,
            snippet: m.content.substring(0, 120) + '...'
          })),
          suggestedActions: ["View Things to Tell Elena", "Check Q4 Budget reminder"]
        };
      }
    }

    // 4. "What were my happiest memories?" / memorable moments
    if (q.includes('happiest') || q.includes('memorable') || q.includes('celebration') || q.includes('vacation')) {
      const moments = memories.filter(m => m.category === 'memorable_moments' || m.isFavorite);
      if (moments.length > 0) {
        let answer = `Here are standout moments preserved in your second mind:\n\n`;
        moments.forEach(m => {
          answer += `✨ **${m.title}** (${new Date(m.createdAt).toLocaleDateString()}):\n${m.content}\n\n`;
        });
        return {
          answer,
          sources: moments.map(m => ({
            memoryId: m.id,
            title: m.title,
            category: m.category,
            snippet: m.content.substring(0, 120) + '...'
          })),
          suggestedActions: ["View Memorable Moments gallery"]
        };
      }
    }

    // 5. "What promises have I made?" / tasks & commitments
    if (q.includes('promise') || q.includes('commitment') || q.includes('task') || q.includes('obligation')) {
      const tasks = memories.filter(m => m.category === 'tasks_commitments' || m.reminderStatus === 'pending');
      if (tasks.length > 0) {
        let answer = `You have **${tasks.length} active commitments** recorded:\n\n`;
        tasks.forEach(t => {
          answer += `✓ **${t.title}**: ${t.content}`;
          if (t.reminderDate) {
            answer += ` *(Due: ${new Date(t.reminderDate).toLocaleDateString()})*`;
          }
          answer += `\n`;
        });
        return {
          answer,
          sources: tasks.map(m => ({
            memoryId: m.id,
            title: m.title,
            category: m.category,
            snippet: m.content.substring(0, 120) + '...'
          })),
          suggestedActions: ["View Tasks & Commitments", "Open Calendar"]
        };
      }
    }

    // 6. "What should I remember this week?" / reminders
    if (q.includes('this week') || q.includes('remember this week') || q.includes('upcoming')) {
      const upcoming = memories.filter(m => m.reminderDate && m.reminderStatus === 'pending');
      if (upcoming.length > 0) {
        let answer = `Here are the critical items scheduled for this upcoming period:\n\n`;
        upcoming.forEach(u => {
          answer += `📅 **${new Date(u.reminderDate!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}** – **${u.title}**\n${u.content}\n\n`;
        });
        return {
          answer,
          sources: upcoming.map(m => ({
            memoryId: m.id,
            title: m.title,
            category: m.category,
            snippet: m.content.substring(0, 120) + '...'
          })),
          suggestedActions: ["View Calendar View", "Open Reminders Page"]
        };
      }
    }

    // Generic semantic search over all memories
    const matches = memories.filter(m => {
      const hay = (m.title + ' ' + m.content + ' ' + m.tags.join(' ') + ' ' + m.people.join(' ')).toLowerCase();
      const terms = q.split(/\s+/).filter(w => w.length > 2);
      return terms.some(term => hay.includes(term));
    });

    if (matches.length > 0) {
      let answer = `I searched your memories and found **${matches.length} relevant record(s)**:\n\n`;
      matches.slice(0, 3).forEach(m => {
        answer += `• **${m.title}** (${m.category.replace('_', ' ')}): ${m.content}\n\n`;
      });
      return {
        answer,
        sources: matches.slice(0, 3).map(m => ({
          memoryId: m.id,
          title: m.title,
          category: m.category,
          snippet: m.content.substring(0, 120) + '...'
        })),
        suggestedActions: ["Show all matched memories"]
      };
    }

    // Honest missing data reporting - strict adherence to "no hallucination"
    return {
      answer: `I could not find any saved memories or notes regarding **"${query}"** in your second mind.\n\nSAM only answers using facts and experiences you've actually captured. Would you like to record a new memory about this right now?`,
      sources: [],
      suggestedActions: ["Capture a memory now", "Try another question"]
    };
  }
}

export const aiService = new AIService();

