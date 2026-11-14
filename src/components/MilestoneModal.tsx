import React, { useState } from 'react';
import { X, Gift, Trophy, Check, Sparkles, Edit2, Plus, Lock } from 'lucide-react';
import { MilestoneReward } from '../types';
import { triggerRewardConfetti } from '../utils/storage';

interface MilestoneModalProps {
  milestones: MilestoneReward[];
  publishedCount: number;
  onUpdateMilestones: (milestones: MilestoneReward[]) => void;
  onSelectDay: (day: number) => void;
  onClose: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  milestones,
  publishedCount,
  onUpdateMilestones,
  onSelectDay,
  onClose
}) => {
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (m: MilestoneReward) => {
    setEditingDay(m.day);
    setEditTitle(m.rewardTitle);
  };

  const handleSaveEdit = (day: number) => {
    const updated = milestones.map((m) =>
      m.day === day ? { ...m, rewardTitle: editTitle.trim() || m.rewardTitle } : m
    );
    onUpdateMilestones(updated);
    setEditingDay(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#faf7f2] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-300 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-stone-900">
              <Trophy className="w-6 h-6 fill-stone-900" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">Milestone Rewards</h2>
              <p className="text-xs text-stone-500">Reward yourself as you reach milestones in your 100-day journey!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milestone List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {milestones.map((m) => {
            const isUnlocked = publishedCount >= m.day;
            const isEditing = editingDay === m.day;
            const remaining = m.day - publishedCount;

            return (
              <div
                key={m.day}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isUnlocked
                    ? 'bg-green-50/70 border-green-300 text-stone-900'
                    : 'bg-white border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  {/* Icon badge */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 border-stone-900 flex-shrink-0 ${
                      m.day === 100
                        ? 'bg-amber-400 text-stone-900 shadow-sm'
                        : isUnlocked
                        ? 'bg-creator-green text-white'
                        : 'bg-amber-400 text-stone-900'
                    }`}
                  >
                    {m.day === 100 ? (
                      <Trophy className="w-6 h-6 fill-current" />
                    ) : isUnlocked ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : (
                      <Gift className="w-6 h-6 fill-current" />
                    )}
                  </div>

                  {/* Title & info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900 text-amber-300">
                        DAY {m.day}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Unlocked & Achieved!
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3 text-stone-400" />
                          {remaining} more {remaining === 1 ? 'post' : 'posts'} to unlock
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(m.day)}
                          className="flex-1 text-sm font-bold text-stone-900 bg-white border border-stone-300 rounded-lg px-2.5 py-1 outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(m.day)}
                          className="p-1 rounded-lg bg-stone-900 text-white hover:bg-stone-800"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-stone-900 mt-1 truncate">
                        {m.rewardTitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleStartEdit(m)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
                    title="Edit reward"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectDay(m.day);
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl"
                  >
                    View Day
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => triggerRewardConfetti(true)}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Celebrate Progress</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
