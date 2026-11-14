import React from 'react';
import { Gift, Trophy, Sparkles } from 'lucide-react';
import { MilestoneReward } from '../types';

interface MilestoneBarProps {
  publishedCount: number;
  totalPosts: number;
  milestones: MilestoneReward[];
  onSelectDay: (day: number) => void;
  onOpenMilestones: () => void;
}

export const MilestoneBar: React.FC<MilestoneBarProps> = ({
  publishedCount,
  totalPosts,
  milestones,
  onSelectDay,
  onOpenMilestones
}) => {
  // Find the next milestone that hasn't been reached yet
  const nextMilestone = milestones.find((m) => m.day > publishedCount);
  const postsUntilNext = nextMilestone ? nextMilestone.day - publishedCount : 0;

  // Percentage for the green progress bar (clamped 0 to 100)
  const safeTotal = totalPosts > 0 ? totalPosts : 100;
  const progressPercent = Math.min(100, Math.max(0, (publishedCount / safeTotal) * 100));

  // Current month name for pill
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="my-6">
      {/* Interactive Progress Track */}
      <div className="relative w-full h-3 bg-[#ede4d8] rounded-full flex items-center">
        {/* Filled Green Progress Bar */}
        <div
          className="h-full bg-creator-green rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Milestone Gift Pins along the track */}
        {milestones.map((milestone) => {
          const positionPercent = (milestone.day / safeTotal) * 100;
          const isReached = publishedCount >= milestone.day;
          const isFinal = milestone.day === 100;

          return (
            <div
              key={milestone.day}
              className="absolute -top-3.5 transform -translate-x-1/2 flex flex-col items-center group cursor-pointer"
              style={{ left: `${positionPercent}%` }}
              onClick={() => onSelectDay(milestone.day)}
            >
              {/* Pin Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-stone-900 transition-transform duration-200 group-hover:scale-125 shadow-sm ${
                  isFinal
                    ? 'bg-amber-400 text-stone-900 ring-2 ring-amber-300'
                    : isReached
                    ? 'bg-creator-green text-white border-stone-900'
                    : 'bg-amber-400 text-stone-900'
                }`}
                title={`Day ${milestone.day}: ${milestone.rewardTitle} (${isReached ? 'Unlocked!' : 'Locked'})`}
              >
                {isFinal ? (
                  <Trophy className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Gift className="w-3.5 h-3.5 fill-current" />
                )}
              </div>

              {/* Hover Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 absolute bottom-9 z-30 bg-stone-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-xl flex flex-col items-center">
                <span>Day {milestone.day}: {milestone.rewardTitle}</span>
                <span className="text-[10px] text-amber-300 font-normal">
                  {isReached ? '🎉 Completed & Unlocked' : `${milestone.day - publishedCount} posts remaining`}
                </span>
                <div className="w-2 h-2 bg-stone-900 rotate-45 -mb-1 transform translate-y-1"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info labels below the bar */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {nextMilestone ? (
            <p className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
              <span className="text-stone-900 font-extrabold">{postsUntilNext} more {postsUntilNext === 1 ? 'post' : 'posts'}</span>
              <span>to your next reward</span>
              <button
                onClick={onOpenMilestones}
                className="text-amber-600 hover:text-amber-700 underline text-xs ml-1 font-semibold"
              >
                ({nextMilestone.rewardTitle})
              </button>
            </p>
          ) : (
            <p className="text-sm font-bold text-creator-green flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>All 100 milestones conquered! Legendary consistency!</span>
            </p>
          )}
        </div>

        {/* Month Progress Badge (matching yellow badge in reference image) */}
        <div className="bg-[#facc15] hover:bg-amber-400 text-stone-900 font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          onClick={onOpenMilestones}
        >
          <span>15 posts in {currentMonthName}</span>
        </div>
      </div>
    </div>
  );
};
