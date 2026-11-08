import React, { useState } from 'react';
import { 
  X, 
  Brain, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { authService, AuthUser } from '../services/authService';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  onToast
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === 'login') {
        const user = await authService.signIn(email || 'alex.rivera@secondmind.ai');
        onSuccess(user);
        onToast(`Welcome back, ${user.name}!`, 'success');
        onClose();
      } else if (tab === 'register') {
        const user = await authService.signUp(name || 'Alex Rivera', email || 'alex@secondmind.ai');
        onSuccess(user);
        onToast(`Welcome to SAM, ${user.name}! Your second mind is ready.`, 'success');
        onClose();
      } else if (tab === 'forgot') {
        const res = await authService.forgotPassword(email || 'alex.rivera@secondmind.ai');
        setForgotSent(true);
        onToast(res.message, 'info');
      }
    } catch (e) {
      onToast('Authentication failed. Please retry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await authService.signInWithGoogle();
      onSuccess(user);
      onToast(`Signed in with Google as ${user.name}!`, 'success');
      onClose();
    } catch {
      onToast('Google authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-sam-surface border border-sam-purple/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-sam-text animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-sam-card hover:bg-sam-bg text-sam-muted hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Headline */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sam-purple via-sam-blue to-sam-highlight flex items-center justify-center mx-auto mb-3 shadow-glow-purple">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-sam-text">
            {tab === 'login' ? 'Welcome Back to SAM' : tab === 'register' ? 'Initialize Your Second Mind' : 'Reset Password'}
          </h2>
          <p className="text-xs text-sam-muted mt-1">
            "Your Mind Is for Living. SAM Is for Remembering."
          </p>
        </div>

        {/* Quick Demo Mode Banner */}
        <div className="p-3 rounded-xl bg-sam-purple/10 border border-sam-purple/30 mb-6 text-center">
          <p className="text-xs text-sam-highlight font-semibold">
            Interactive Prototype Ready
          </p>
          <p className="text-[11px] text-sam-muted mt-0.5">
            Clicking sign in logs you in as verified founder Alex Rivera with preloaded sample data.
          </p>
        </div>

        {/* Auth Mode Tabs */}
        {tab !== 'forgot' && (
          <div className="flex p-1 rounded-xl bg-sam-bg border border-sam-purple/20 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                tab === 'login' ? 'bg-sam-purple text-white shadow-glow-purple' : 'text-sam-muted hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                tab === 'register' ? 'bg-sam-purple text-white shadow-glow-purple' : 'text-sam-muted hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="text-xs font-bold text-sam-muted block mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sam-muted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-sam-bg border border-sam-purple/25 text-xs text-sam-text focus:outline-none focus:border-sam-purple/60"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-sam-muted block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sam-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.rivera@secondmind.ai"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-sam-bg border border-sam-purple/25 text-xs text-sam-text focus:outline-none focus:border-sam-purple/60"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-sam-muted">Password</label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] text-sam-highlight hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sam-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-sam-bg border border-sam-purple/25 text-xs text-sam-text focus:outline-none focus:border-sam-purple/60"
                />
              </div>
            </div>
          )}

          {forgotSent && tab === 'forgot' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reset link dispatched! Please check your inbox.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white font-bold text-xs shadow-glow-purple hover:opacity-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : tab === 'login' ? 'Sign In to SAM' : tab === 'register' ? 'Get Started' : 'Send Reset Link'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Google OAuth alternative */}
        {tab !== 'forgot' && (
          <div className="mt-4 pt-4 border-t border-sam-purple/15">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-sam-bg hover:bg-sam-card border border-sam-purple/20 text-xs font-semibold text-sam-text flex items-center justify-center gap-2.5 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {tab === 'forgot' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => { setTab('login'); setForgotSent(false); }}
              className="text-xs text-sam-highlight hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

