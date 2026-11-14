import React, { useState } from 'react';
import {
  Zap,
  Flame,
  Shield,
  ArrowRight,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  KeyRound,
  User as UserIcon,
  UserPlus,
  RefreshCw,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmationResult } from 'firebase/auth';

const FEATURES = [
  { icon: '🗓️', label: '100-Day Grid', desc: 'Visual calendar of every post in your challenge' },
  { icon: '🪝', label: 'Hook Builder', desc: '3-second spoken, text overlay, and visual hooks' },
  { icon: '📝', label: 'Script Editor', desc: 'Live word count with speaking-time calculator' },
  { icon: '🎥', label: 'Teleprompter', desc: 'Fullscreen scrolling prompter for recording' },
  { icon: '🎁', label: 'Milestone Rewards', desc: 'Unlock custom rewards as you hit milestones' },
  { icon: '📊', label: 'Analytics', desc: 'Track views, likes, and engagement per post' },
];

type AuthMethod = 'social' | 'email' | 'phone';
type EmailMode = 'signin' | 'signup' | 'forgot';

export const LoginPage: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    sendPhoneOtp,
    confirmPhoneOtp,
  } = useAuth();

  const [activeMethod, setActiveMethod] = useState<AuthMethod>('social');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email form state
  const [emailMode, setEmailMode] = useState<EmailMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Phone form state
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const resetMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const getCleanErrorMessage = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Sign-in popup was closed before completing.';
      case 'auth/popup-blocked':
        return 'Browser blocked the popup. Please allow popups for this site.';
      case 'auth/user-not-found':
        return 'No account found with this email. Click "Create one" below to register.';
      case 'auth/wrong-password':
        return 'Incorrect password. Click "Forgot password?" if you need to reset it.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. If you are new, click "Create one" below to register your account.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format. Please include country code (e.g. +91 9876543210).';
      case 'auth/invalid-verification-code':
        return 'Invalid 6-digit OTP code. Please try again.';
      case 'auth/code-expired':
        return 'OTP code expired. Please request a new one.';
      case 'auth/unauthorized-domain':
        return `Domain ${window.location.hostname} is not authorized in Firebase Console.`;
      case 'auth/operation-not-allowed':
        return 'Provider needs configuration in Firebase (Apple requires Apple Developer Keys; Phone requires SMS quota or test numbers).';
      default:
        return err?.message || 'Authentication failed. Please try again.';
    }
  };

  // 1. Google OAuth
  const handleGoogleLogin = async () => {
    resetMessages();
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setLoading(false);
      setError(getCleanErrorMessage(err));
    }
  };

  // 2. Apple OAuth
  const handleAppleLogin = async () => {
    resetMessages();
    setLoading(true);
    try {
      await signInWithApple();
    } catch (err: any) {
      setLoading(false);
      setError(getCleanErrorMessage(err));
    }
  };

  // 3. Email & Password / Register / Reset
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (emailMode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(email.trim());
        setLoading(false);
        setSuccessMsg('Password reset email sent! Check your inbox.');
      } catch (err: any) {
        setLoading(false);
        setError(getCleanErrorMessage(err));
      }
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      if (emailMode === 'signup') {
        await signUpWithEmail(email.trim(), password, displayName.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      setLoading(false);
      setError(getCleanErrorMessage(err));
    }
  };

  // 4. Phone OTP: Send Code
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!cleanPhone.startsWith('+') || cleanPhone.length < 8) {
      setError('Please enter a valid phone number with country code (e.g. +91 9876543210).');
      return;
    }

    setLoading(true);
    try {
      const confirmation = await sendPhoneOtp(cleanPhone, 'phone-submit-btn');
      setConfirmationResult(confirmation);
      setLoading(false);
      setSuccessMsg(`SMS verification code sent to ${phoneNumber}!`);
    } catch (err: any) {
      setLoading(false);
      setError(getCleanErrorMessage(err));
    }
  };

  // 5. Phone OTP: Confirm Code
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!confirmationResult) {
      setError('Please request an OTP first.');
      return;
    }

    if (!verificationCode.trim() || verificationCode.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await confirmPhoneOtp(confirmationResult, verificationCode.trim());
    } catch (err: any) {
      setLoading(false);
      setError(getCleanErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col md:flex-row">
      {/* Invisible reCAPTCHA container for phone auth */}
      <div id="recaptcha-container" />

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
          <span>Secure multi-provider authentication powered by Firebase.</span>
        </div>
      </div>

      {/* ───── Right Panel: Sign-In Form ───── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:px-14">
        <div className="w-full max-w-md">

          {/* Headline */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-stone-500">Account Access</span>
            </div>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">
              Sign in to your<br />creator dashboard
            </h2>
            <p className="text-sm text-stone-500 font-medium mt-1">
              Choose your preferred sign-in method to access your challenge.
            </p>
          </div>

          {/* Auth Method Tabs */}
          <div className="flex items-center bg-stone-200/70 p-1.5 rounded-2xl mb-6">
            <button
              onClick={() => { setActiveMethod('social'); resetMessages(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeMethod === 'social'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              OAuth (Google/Apple)
            </button>
            <button
              onClick={() => { setActiveMethod('email'); resetMessages(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeMethod === 'email'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => { setActiveMethod('phone'); resetMessages(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeMethod === 'phone'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Phone (SMS)
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 1: SOCIAL (Google & Apple)                     */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeMethod === 'social' && (
            <div className="space-y-3">
              {/* Google Button */}
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
                <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
                {!loading && (
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all ml-auto" />
                )}
              </button>

              {/* Apple Button */}
              <button
                onClick={handleAppleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-black hover:bg-stone-800 active:bg-stone-900 text-white font-bold text-sm border-2 border-black rounded-2xl px-6 py-4 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.93.04-2.02.63-2.67 1.4-.58.68-1.09 1.77-.95 2.82 1.03.08 2.05-.52 2.68-1.29z"/>
                  </svg>
                )}
                <span>{loading ? 'Connecting...' : 'Continue with Apple'}</span>
                {!loading && (
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-white group-hover:translate-x-0.5 transition-all ml-auto" />
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-500 font-medium">
                  Prefer email?{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveMethod('email'); setEmailMode('signup'); resetMessages(); }}
                    className="font-bold text-stone-900 hover:underline cursor-pointer"
                  >
                    Create new account with email
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 2: EMAIL & PASSWORD                            */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeMethod === 'email' && (
            <div className="space-y-4">
              {/* Email Mode Sub-Tabs */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => { setEmailMode('signin'); resetMessages(); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    emailMode === 'signin'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailMode('signup'); resetMessages(); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    emailMode === 'signup'
                      ? 'bg-amber-400 text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ✨ Create New Account
                </button>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {emailMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        className="w-full bg-white border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creator@example.com"
                      className="w-full bg-white border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                    />
                  </div>
                </div>

                {emailMode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        {emailMode === 'signup' ? 'Create Password (min 6 chars)' : 'Password'}
                      </label>
                      {emailMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => { setEmailMode('forgot'); resetMessages(); }}
                          className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 font-bold text-sm rounded-xl py-3 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${
                    emailMode === 'signup'
                      ? 'bg-amber-400 hover:bg-amber-300 text-stone-900 border-2 border-stone-900 font-black'
                      : 'bg-stone-900 hover:bg-stone-800 active:bg-black text-white'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : emailMode === 'signup' ? (
                    <UserPlus className="w-4 h-4" />
                  ) : emailMode === 'forgot' ? (
                    <KeyRound className="w-4 h-4" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>
                    {loading
                      ? 'Setting up your account...'
                      : emailMode === 'signup'
                      ? '🚀 Create Account & Launch Dashboard'
                      : emailMode === 'forgot'
                      ? 'Send Reset Link'
                      : 'Sign In with Email'}
                  </span>
                </button>

                {/* Mode switch */}
                <div className="text-center pt-2">
                  {emailMode === 'signin' ? (
                    <p className="text-xs text-stone-500 font-medium">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setEmailMode('signup'); resetMessages(); }}
                        className="font-bold text-stone-900 hover:underline cursor-pointer"
                      >
                        Create one
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-stone-500 font-medium">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setEmailMode('signin'); resetMessages(); }}
                        className="font-bold text-stone-900 hover:underline cursor-pointer"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* TAB 3: PHONE / SMS OTP                              */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeMethod === 'phone' && (
            <div className="space-y-4">
              {!confirmationResult ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Phone Number (with Country Code)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full bg-white border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400 font-medium mt-1">
                      We will send an SMS OTP code to verify your phone number.
                    </p>
                  </div>

                  <button
                    id="phone-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 active:bg-black text-white font-bold text-sm rounded-xl py-3 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Sending SMS Code...' : 'Send SMS OTP Code'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Enter 6-Digit SMS Code
                      </label>
                      <button
                        type="button"
                        onClick={() => { setConfirmationResult(null); resetMessages(); }}
                        className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Change number
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-white border-2 border-stone-900 focus:ring-2 focus:ring-amber-400 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-stone-900 outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-900 font-black text-sm border-2 border-stone-900 rounded-xl py-3 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-xs text-stone-400 font-medium mt-6">
            New creators will set up their profile & 100-day schedule upon first sign-in.
          </p>

          {/* Divider with milestone badges */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5 text-center">Your rewards unlock as you go</p>
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
