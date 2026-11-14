import React, { useState, useEffect } from 'react';
import { Flame, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoadingScreen: React.FC = () => {
  const { bypassToDashboard, user } = useAuth();
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center gap-4 px-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-stone-900 flex items-center justify-center shadow-lg">
          <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
        </div>
        <span className="text-xl font-black text-stone-900 tracking-tight">100 Post Challenge</span>
      </div>

      <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
      <p className="text-xs font-semibold text-stone-500">
        Loading your creator dashboard...
      </p>

      {showSkip && (
        <button
          onClick={bypassToDashboard}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-stone-900 text-white rounded-xl shadow-sm hover:bg-stone-800 transition-all animate-in fade-in"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
