import React, { useState } from 'react';
import { Check, Gift, Trophy, Clock, Calendar, Sparkles, ExternalLink, Pencil, Video } from 'lucide-react';
import { ContentPost } from '../types';

interface Grid100Props {
  posts: ContentPost[];
  onSelectDay: (day: number) => void;
  activeFilter?: string;
}

export const Grid100: React.FC<Grid100Props> = ({ posts, onSelectDay, activeFilter }) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Find the first non-published post to highlight as "next up" (like Day 9 in the screenshot)
  const nextUpDay = posts.find((p) => p.status !== 'published')?.day || 1;

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'Reels';
      case 'youtube': return 'Shorts';
      case 'tiktok': return 'TikTok';
      case 'linkedin': return 'LinkedIn';
      case 'x': return 'X (Twitter)';
      default: return platform;
    }
  };

  const getStatusBadge = (status: ContentPost['status']) => {
    switch (status) {
      case 'published':
        return <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">Published</span>;
      case 'in_progress':
        return <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">In Progress</span>;
      case 'ready':
        return <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Ready to Film</span>;
      case 'skipped':
        return <span className="text-[10px] bg-stone-200 text-stone-600 font-bold px-1.5 py-0.5 rounded">Skipped</span>;
      default:
        return <span className="text-[10px] bg-stone-100 text-stone-600 font-medium px-1.5 py-0.5 rounded">Draft</span>;
    }
  };

  return (
    <div className="relative">
      {/* 10x10 Responsive Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5 sm:gap-3 p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-[#ede3d5]">
        {posts.map((post) => {
          const isPublished = post.status === 'published';
          const isInProgress = post.status === 'in_progress';
          const isReady = post.status === 'ready';
          const isNextUp = post.day === nextUpDay && !isPublished && !isInProgress && !isReady;
          const isMilestone = post.isMilestone;
          const isHovered = hoveredDay === post.day;

          // Render button styling based on state
          return (
            <div
              key={post.day}
              className="relative group"
              onMouseEnter={() => setHoveredDay(post.day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <button
                onClick={() => onSelectDay(post.day)}
                className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 transform group-hover:scale-105 group-hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 ${
                  isPublished
                    ? 'bg-[#22c55e] text-white hover:bg-[#1eb355]'
                    : isMilestone && isInProgress
                    ? 'bg-[#facc15] border-2 border-amber-600 text-stone-900 hover:bg-[#ebd500]'
                    : isMilestone
                    ? 'bg-[#facc15] border-2 border-stone-900 text-stone-900 hover:bg-[#ebd500]'
                    : isInProgress
                    ? 'bg-amber-100 border-2 border-amber-500 text-amber-900 hover:bg-amber-200 shadow-xs'
                    : isReady
                    ? 'bg-blue-100 border-2 border-blue-500 text-blue-900 hover:bg-blue-200 shadow-xs'
                    : isNextUp
                    ? 'bg-[#faf7f2] border-2 border-dashed border-[#f45d48] text-[#f45d48] font-bold shadow-sm'
                    : 'bg-[#f4ede4] hover:bg-[#eae0d3] text-stone-500 font-semibold'
                }`}
                aria-label={`Day ${post.day}: ${post.title} (${post.status})`}
              >
                {/* Completed Checkmark State */}
                {isPublished ? (
                  <div className="flex flex-col items-center justify-center">
                    <Check className="w-6 h-6 stroke-[3.2]" />
                    {isMilestone && (
                      <span className="text-[9px] font-black uppercase tracking-tighter opacity-80 mt-0.5">
                        Day {post.day}
                      </span>
                    )}
                  </div>
                ) : isInProgress ? (
                  /* In Progress Working State (Pencil icon indicating it's being worked on) */
                  <div className="flex flex-col items-center justify-center gap-0.5 relative">
                    <div className="relative flex items-center justify-center">
                      {isMilestone ? (
                        <div className="flex items-center gap-0.5">
                          {post.day === 100 ? (
                            <Trophy className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Gift className="w-3.5 h-3.5 fill-current" />
                          )}
                          <Pencil className="w-3.5 h-3.5 stroke-[2.6] text-amber-900" />
                        </div>
                      ) : (
                        <Pencil className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                      )}
                      <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-black tracking-tight leading-none mt-0.5">
                      {post.day}
                    </span>
                  </div>
                ) : isReady ? (
                  /* Ready to Film State */
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
                    <span className="text-[10px] sm:text-xs font-black tracking-tight leading-none mt-0.5">
                      {post.day}
                    </span>
                  </div>
                ) : isMilestone ? (
                  /* Milestone Gift / Trophy State */
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    {post.day === 100 ? (
                      <Trophy className="w-5 h-5 fill-current" />
                    ) : (
                      <Gift className="w-5 h-5 fill-current" />
                    )}
                    <span className="text-xs font-black tracking-tight">{post.day}</span>
                  </div>
                ) : isNextUp ? (
                  /* Current Active / Next Up (Dashed Orange) */
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-base sm:text-lg font-black tracking-tight">{post.day}</span>
                  </div>
                ) : (
                  /* Standard Upcoming Draft Box */
                  <span className="text-sm sm:text-base font-bold text-stone-400 group-hover:text-stone-700 transition-colors">
                    {post.day}
                  </span>
                )}
              </button>

              {/* Floating Quick Preview Card on Hover */}
              {isHovered && (
                <div className="absolute z-40 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-stone-900 text-white rounded-xl shadow-2xl pointer-events-none text-left animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-black text-amber-300">DAY {post.day}</span>
                    {getStatusBadge(post.status)}
                  </div>

                  {post.thumbnailUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden aspect-video w-full bg-stone-950 border border-stone-800">
                      <img src={post.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <p className="text-xs font-bold text-stone-100 line-clamp-2 leading-snug mb-1.5">
                    {post.title}
                  </p>

                  {post.spokenHook && (
                    <p className="text-[11px] text-stone-300 italic line-clamp-2 bg-stone-800/80 p-1.5 rounded mb-1.5">
                      "{post.spokenHook}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-500" />
                      {post.publishDateETA && !isNaN(new Date(post.publishDateETA).getTime())
                        ? new Date(post.publishDateETA).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : 'ETA TBD'}
                    </span>
                    <span className="font-semibold text-amber-400">
                      {getPlatformLabel(post.platform)}
                    </span>
                  </div>

                  {post.isMilestone && post.milestoneReward && (
                    <div className="mt-1.5 pt-1 border-t border-stone-800 text-[10px] font-bold text-yellow-300 flex items-center gap-1">
                      <Gift className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Reward: {post.milestoneReward}</span>
                    </div>
                  )}

                  <div className="mt-1 text-center text-[9px] text-stone-400 font-medium">
                    Click to edit Idea, Hook & Script →
                  </div>

                  {/* Little Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-stone-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
