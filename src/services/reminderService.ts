import { Memory } from '../types';

class ReminderService {
  private audioCtx: AudioContext | null = null;

  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  public hasNotificationPermission(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }

  public notifyUser(title: string, body: string, icon?: string): void {
    this.playFuturisticChime();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: icon
        });
      } catch (e) {
        console.warn('System notification failed', e);
      }
    }
  }

  /**
   * Synthesizes a high-end futuristic dual-tone chime using Web Audio API (zero audio file dependencies!)
   */
  public playFuturisticChime(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      // Tone 1: 587.33 Hz (D5) -> 880 Hz (A5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Tone 2: Harmonious sparkle
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.1);
      gain2.gain.setValueAtTime(0.05, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.0005, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.6);
    } catch (e) {
      // Audio autoplay policy or unavailable
    }
  }

  public getUpcomingReminders(memories: Memory[]): Memory[] {
    const now = new Date().getTime();
    return memories
      .filter(m => m.reminderDate && m.reminderStatus === 'pending')
      .sort((a, b) => new Date(a.reminderDate!).getTime() - new Date(b.reminderDate!).getTime());
  }

  public formatRelativeDate(isoDate: string): string {
    const target = new Date(isoDate);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      if (Math.abs(diffHours) < 24) return `Overdue by ${Math.abs(diffHours)}h`;
      return `Overdue by ${Math.abs(diffDays)}d`;
    }

    if (diffHours < 1) return 'In less than an hour';
    if (diffHours < 24) return `In ${diffHours} hours`;
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;

    return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export const reminderService = new ReminderService();

