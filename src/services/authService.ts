export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'local' | 'google';
  createdAt: string;
}

const AUTH_USER_KEY = 'sam_auth_user_session';

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      } else {
        // Default Demo User
        this.currentUser = {
          id: 'usr_demo_101',
          name: 'Alex Rivera',
          email: 'alex.rivera@secondmind.ai',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          provider: 'local',
          createdAt: '2026-01-15T08:00:00Z'
        };
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
      }
    } catch {
      this.currentUser = null;
    }
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public subscribe(cb: (user: AuthUser | null) => void): () => void {
    this.listeners.push(cb);
    cb(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentUser));
  }

  public async signIn(email: string): Promise<AuthUser> {
    await this.delay(600);
    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0].replace('.', ' '),
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      provider: 'local',
      createdAt: new Date().toISOString()
    };
    this.currentUser = user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  public async signInWithGoogle(): Promise<AuthUser> {
    await this.delay(700);
    const user: AuthUser = {
      id: 'usr_google_992',
      name: 'Alex Rivera (Google)',
      email: 'alex.rivera@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      provider: 'google',
      createdAt: new Date().toISOString()
    };
    this.currentUser = user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  public async signUp(name: string, email: string): Promise<AuthUser> {
    await this.delay(650);
    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      provider: 'local',
      createdAt: new Date().toISOString()
    };
    this.currentUser = user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  public async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await this.delay(500);
    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${email}.`
    };
  }

  public signOut(): void {
    this.currentUser = null;
    localStorage.removeItem(AUTH_USER_KEY);
    this.notify();
  }

  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }
}

export const authService = new AuthService();

