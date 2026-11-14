import React, { useState } from 'react';
import { Zap, Flame, Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🗓️', label: '100-Day Grid', desc: 'Visual calendar of every post in your challenge' },
  { icon: '🪝', label: 'Hook Builder', desc: '3-second spoken, text overlay, and visual hooks' },
  { icon: '📝', label: 'Script Editor', desc: 'Live word count with speaking-time calculator' },
  { icon: '🎥', label: 'Teleprompter', desc: 'Fullscreen scrolling prompter for recording' },
  { icon: '🎁', label: 'Milestone Rewards', desc: 'Unlock custom rewards as you hit milestones' },
  { icon: '📊', label: 'Analytics', desc: 'Track views, likes, and engagement per post' },
];

export const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setLoading(false);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('Sign-in was closed before completing. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Please allow popups for localhost to sign in.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in Firebase Console.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase Console.');
      } else {
        setError(`Sign-in failed (${code || 'error'}). Please try again.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col md:flex-row">
      {/* ───── Left Panel: Brand + Feature List ───── */}
      <div className="relative md:w-[42%] bg-stone-900 text-white px-8 py-12 md:px-14 md:py-16 flex flex-col justify-between overflow-hidden">
        {/* Background texture blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-orange-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Logo & Title */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-2 mb-8">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-black tracking-tight text-amber-300">Creator Toolkit</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black leading-tight text-white tracking-tight">
            100 Post<br />
            <span className="text-amber-400">Challenge</span><br />
            Tracker
          </h1>

          <p className="mt-4 text-base text-stone-300 font-medium leading-relaxed max-w-sm">
            Your all-in-one content production system. Plan ideas, write hooks, script videos, and track 100 days of consistent publishing.
          </p>
        </div>

        {/* Feature chips grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 my-10">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 transition-colors"
            >
              <div className="text-xl mb-1">{f.icon}</div>
              <p className="text-xs font-black text-white">{f.label}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-2 text-xs text-stone-500">
          <Shield className="w-4 h-4 text-stone-600" />
          <span>Each creator gets an isolated, secure account powered by Firebase.</span>
        </div>
      </div>

      {/* ───── Right Panel: Sign-In Form ───── */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 md:px-14">
        <div className="w-full max-w-sm">

          {/* Headline */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-stone-500">Account Access</span>
            </div>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">
              Sign in to your<br />creator dashboard
            </h2>
            <p className="text-sm text-stone-500 font-medium mt-2">
              Sign in with your Google account. Your challenge progress is private and saved automatically.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-900 font-bold text-sm border-2 border-stone-900 rounded-2xl px-6 py-4 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-stone-600" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{loading ? 'Signing in with Google...' : 'Continue with Google'}</span>
            {!loading && (
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all ml-auto" />
            )}
          </button>

          <p className="text-center text-xs text-stone-400 font-medium mt-4">
            New creators will set up their profile & 100-day schedule upon first sign-in.
          </p>

          {/* Divider with milestone badges */}
          <div className="mt-10 pt-8 border-t border-stone-200">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 text-center">Your rewards unlock as you go</p>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {['Day 10', 'Day 30', 'Day 50', 'Day 75', 'Day 100 🏆'].map((d) => (
                <span
                  key={d}
                  className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full border border-amber-300"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
