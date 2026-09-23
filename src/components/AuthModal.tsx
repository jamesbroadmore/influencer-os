import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin'
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          throw new Error('Please enter your creator or business name');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signUpWithEmail(email.trim(), password, displayName.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Authentication failed. Please check your details.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. If you do not have an account, please Sign Up.';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please Sign In instead.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = (demoType: 'sydney' | 'melbourne') => {
    if (demoType === 'sydney') {
      setEmail('creator.sydney@example.com');
      setPassword('CreatorPass2026!');
      setDisplayName('Aura Media Labs');
    } else {
      setEmail('charlie.vlogs@example.com');
      setPassword('CreatorPass2026!');
      setDisplayName('Charlie Visuals Pty Ltd');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        {/* Header decoration */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-800/80 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-emerald-600/30">
              CL
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {mode === 'signin' ? 'Sign in to creatorledger' : 'Create Creator Account'}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Secure Australian business cloud identity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-800 w-full"></div>
            <span className="bg-neutral-900 px-3 text-[11px] text-neutral-500 font-mono uppercase tracking-wider">
              or with email
            </span>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] text-neutral-400 font-medium mb-1">
                  Creator / Business Legal Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. Aura Media / Maya Lin"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] text-neutral-400 font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="creator@yourdomain.com.au"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              <span>{mode === 'signin' ? 'Sign In to Ledger' : 'Create Account & Start'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Pre-fills */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1.5 font-mono">
              <span>DEMO EVALUATION SHORTCUTS:</span>
              <span className="text-emerald-400">1-click fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('sydney')}
                className="p-2 text-left rounded-lg bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 transition-colors text-[11px]"
              >
                <span className="font-semibold text-neutral-200 block truncate">Sydney Creator</span>
                <span className="text-[10px] text-neutral-500 block truncate">aura@media.au</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('melbourne')}
                className="p-2 text-left rounded-lg bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 transition-colors text-[11px]"
              >
                <span className="font-semibold text-neutral-200 block truncate">Melbourne Pty Ltd</span>
                <span className="text-[10px] text-neutral-500 block truncate">charlie@visuals.au</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted with Firebase Auth & Zero-Trust Firestore Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
