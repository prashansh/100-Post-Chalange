import React, { useState } from 'react';
import { Trophy, Flame, Edit2, Check, Download, RotateCcw, BarChart3, Settings } from 'lucide-react';
import { CreatorProfile } from '../types';

interface HeaderProps {
  profile: CreatorProfile;
  publishedCount: number;
  totalPosts: number;
  onUpdateProfile: (profile: CreatorProfile) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onReset: () => void;
  onOpenAnalytics: () => void;
  onOpenMilestones: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  publishedCount,
  totalPosts,
  onUpdateProfile,
  onExportCSV,
  onExportJSON,
  onReset,
  onOpenAnalytics,
  onOpenMilestones
}) => {
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [handleInput, setHandleInput] = useState(profile.handle);
  const [titleInput, setTitleInput] = useState(profile.challengeTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleSaveHandle = () => {
    setIsEditingHandle(false);
    onUpdateProfile({
      ...profile,
      handle: handleInput.startsWith('@') ? handleInput : `@${handleInput}`
    });
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    onUpdateProfile({
      ...profile,
      challengeTitle: titleInput.trim() || '100 Post Challenge'
    });
  };

  return (
    <header className="pt-8 pb-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Left: Challenge Title & Handle */}
        <div>
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  autoFocus
                  className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight bg-white border border-stone-300 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-stone-900"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight">
                  {profile.challengeTitle}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-900"
                  title="Rename challenge"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Creator Handle */}
          <div className="mt-1 flex items-center gap-2">
            {isEditingHandle ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveHandle()}
                  autoFocus
                  className="text-lg font-medium text-stone-600 bg-white border border-stone-300 rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-stone-900"
                />
                <button
                  onClick={handleSaveHandle}
                  className="p-1 rounded bg-stone-900 text-white hover:bg-stone-800"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-2">
                <span className="text-lg font-semibold text-stone-500 hover:text-stone-700 transition-colors">
                  {profile.handle}
                </span>
                <button
                  onClick={() => setIsEditingHandle(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-stone-600"
                  title="Change handle"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 ml-2">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              {publishedCount} Day Streak
            </span>
          </div>
        </div>

        {/* Right: Big Hero Stats & Action Toolbar */}
        <div className="flex flex-col md:items-end gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl md:text-7xl font-black text-stone-900 tracking-tight">
              {publishedCount}
            </span>
            <span className="text-3xl md:text-4xl font-bold text-stone-400">
              /{totalPosts}
            </span>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-stone-500 text-right">
            POSTS DONE
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <button
              onClick={onOpenMilestones}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-900 shadow-sm transition-all"
            >
              <Trophy className="w-3.5 h-3.5" />
              Milestone Rewards
            </button>
            <button
              onClick={onOpenAnalytics}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-800 transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Stats
            </button>
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-800 transition-all"
              title="Export all 100 days to CSV / Excel"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 p-1.5 text-xs font-semibold rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-all"
              title="Reset data to sample"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
