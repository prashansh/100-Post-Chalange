import React, { useState } from 'react';
import { Check, ChevronRight, Loader2, Camera, Globe, User, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createUserProfile, saveUserPosts, saveUserMilestones } from '../utils/firestore';
import { apiSyncUserProfile, apiBatchSavePosts, apiUpdateMilestones } from '../utils/api';
import { generateInitialPosts, DEFAULT_MILESTONES } from '../data/initialData';
import { savePosts, saveMilestones } from '../utils/storage';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belgium','Bolivia','Bosnia and Herzegovina','Brazil','Bulgaria',
  'Cambodia','Canada','Chile','China','Colombia','Croatia','Cyprus','Czech Republic',
  'Denmark','Ecuador','Egypt','Estonia','Ethiopia','Finland','France','Georgia','Germany',
  'Ghana','Greece','Guatemala','Honduras','Hungary','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait',
  'Latvia','Lebanon','Libya','Lithuania','Luxembourg','Malaysia','Maldives','Malta','Mexico',
  'Morocco','Myanmar','Nepal','Netherlands','New Zealand','Nigeria','Norway','Oman','Pakistan',
  'Panama','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia',
  'Senegal','Serbia','Singapore','Slovakia','South Africa','South Korea','Spain','Sri Lanka',
  'Sweden','Switzerland','Taiwan','Tanzania','Thailand','Tunisia','Turkey','Ukraine',
  'United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Venezuela',
  'Vietnam','Yemen','Zimbabwe','Other',
];

const NICHES = [
  'Creator Economy & Tools',
  'Tech & AI',
  'Fitness & Health',
  'Finance & Investing',
  'Lifestyle & Vlog',
  'Fashion & Beauty',
  'Food & Cooking',
  'Travel',
  'Education & Tutorials',
  'Business & Entrepreneurship',
  'Comedy & Entertainment',
  'Art & Design',
  'Gaming',
  'Parenting & Family',
  'Other',
];

type Step = 1 | 2 | 3;

interface FormData {
  displayName: string;
  creatorHandle: string;
  dateOfBirth: string;
  country: string;
  niche: string;
  challengeStartDate: string;
}

export const ProfileSetupPage: React.FC = () => {
  const { user, setProfileDirectly } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    displayName: user?.displayName || '',
    creatorHandle: '',
    dateOfBirth: '',
    country: '',
    niche: '',
    challengeStartDate: new Date().toISOString().slice(0, 10),
  });

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (): boolean => {
    if (step === 1) return form.displayName.trim().length >= 2 && form.creatorHandle.trim().length >= 2;
    if (step === 2) return form.dateOfBirth.trim().length > 0 && form.country.trim().length > 0;
    if (step === 3) return form.niche.trim().length > 0 && form.challengeStartDate.trim().length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < 3) setStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as Step);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    const handle = form.creatorHandle.trim().startsWith('@')
      ? form.creatorHandle.trim()
      : `@${form.creatorHandle.trim()}`;

    const profileData = {
      uid: user.uid,
      email: user.email || '',
      displayName: form.displayName.trim() || user.displayName || 'Creator',
      photoURL: user.photoURL || '',
      creatorHandle: handle,
      dateOfBirth: form.dateOfBirth,
      country: form.country,
      niche: form.niche,
      challengeStartDate: form.challengeStartDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Initialize 100 posts: Day 1 as rich example, Days 2-100 as blank templates
    const initialPosts = generateInitialPosts(form.challengeStartDate);

    // 1. Save to local scoped cache (instant access)
    savePosts(initialPosts, user.uid);
    saveMilestones(DEFAULT_MILESTONES, user.uid);

    // 2. Save to Firestore Cloud Database (Primary persistent cloud store for mobile & desktop)
    try {
      await Promise.allSettled([
        createUserProfile(user.uid, profileData),
        saveUserPosts(user.uid, initialPosts),
        saveUserMilestones(user.uid, DEFAULT_MILESTONES),
      ]);
    } catch (err) {
      console.warn('Firestore initial seeding error:', err);
    }

    // 3. Save to secondary Backend Database (SQLite API if available)
    apiSyncUserProfile(profileData).catch((err) => {
      console.warn('API sync profile warning:', err);
    });
    apiBatchSavePosts(user.uid, initialPosts).catch((err) => {
      console.warn('API batch save warning:', err);
    });
    apiUpdateMilestones(user.uid, DEFAULT_MILESTONES).catch((err) => {
      console.warn('API update milestones warning:', err);
    });

    // 4. Immediately route to challenge dashboard!
    setProfileDirectly(profileData);
  };

  const stepMeta = [
    { number: 1, label: 'Your Name' },
    { number: 2, label: 'About You' },
    { number: 3, label: 'Your Challenge' },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Top: avatar from Google + welcome */}
        <div className="text-center mb-8">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg mb-4 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg mb-4 bg-stone-200 flex items-center justify-center">
              <User className="w-9 h-9 text-stone-500" />
            </div>
          )}
          <h2 className="text-2xl font-black text-stone-900">
            Welcome, {user?.displayName?.split(' ')[0] || 'Creator'}! 👋
          </h2>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Let's set up your creator profile in 3 quick steps.
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {stepMeta.map((s, idx) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all ${
                    step > s.number
                      ? 'bg-creator-green border-creator-green text-white'
                      : step === s.number
                      ? 'bg-stone-900 border-stone-900 text-white'
                      : 'bg-white border-stone-300 text-stone-400'
                  }`}
                >
                  {step > s.number ? <Check className="w-4 h-4 stroke-[3]" /> : s.number}
                </div>
                <span className={`text-[10px] font-bold mt-1 ${step === s.number ? 'text-stone-900' : 'text-stone-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < stepMeta.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${step > s.number ? 'bg-creator-green' : 'bg-stone-200'}`}
                  style={{ width: 60 }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-[#ede3d5]">

          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: Name & Handle ── */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-stone-900">What's your name?</h3>
                    <p className="text-xs text-stone-500">This will show on your challenge dashboard.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) => updateField('displayName', e.target.value)}
                      placeholder="e.g. Akash Kapoor"
                      className="w-full text-sm font-semibold text-stone-900 bg-[#faf7f2] border border-stone-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Creator / Social Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">@</span>
                      <input
                        type="text"
                        value={form.creatorHandle.replace(/^@/, '')}
                        onChange={(e) => updateField('creatorHandle', e.target.value.replace(/^@/, ''))}
                        placeholder="akash_kapoor"
                        className="w-full pl-8 pr-4 py-3 text-sm font-semibold text-stone-900 bg-[#faf7f2] border border-stone-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">Your Instagram, TikTok, or YouTube handle.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: DOB & Country ── */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">About You</h3>
                  <p className="text-xs text-stone-500">We use this to personalize your creator dashboard.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full text-sm font-semibold text-stone-900 bg-[#faf7f2] border border-stone-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Country
                </label>
                <select
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full text-sm font-semibold text-stone-900 bg-[#faf7f2] border border-stone-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all cursor-pointer"
                >
                  <option value="">Select your country...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── STEP 3: Niche & Challenge Start Date ── */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Your Content Challenge</h3>
                  <p className="text-xs text-stone-500">This sets up your 100-day calendar.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Content Niche
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {NICHES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateField('niche', n)}
                      className={`text-left px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                        form.niche === n
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-[#faf7f2] text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Challenge Start Date
                </label>
                <input
                  type="date"
                  value={form.challengeStartDate}
                  onChange={(e) => updateField('challengeStartDate', e.target.value)}
                  className="w-full text-sm font-semibold text-stone-900 bg-[#faf7f2] border border-stone-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                />
                <p className="text-[11px] text-stone-400 mt-1">The day you start your 100-day challenge.</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-7 flex items-center justify-between gap-3 pt-5 border-t border-stone-100">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Back
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!canProceed() || saving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-creator-green hover:bg-creator-green-dark text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Launching Challenge...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Let's Get Started 🚀</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Profile photo note */}
        <p className="text-center text-xs text-stone-400 font-medium mt-4 flex items-center justify-center gap-1">
          <Camera className="w-3.5 h-3.5" />
          Profile photo imported from your Google account automatically.
        </p>
      </div>
    </div>
  );
};
