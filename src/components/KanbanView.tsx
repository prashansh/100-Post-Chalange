import React from 'react';
import { Check, Clock, Gift, ArrowRight } from 'lucide-react';
import { ContentPost, PostStatus } from '../types';

interface KanbanViewProps {
  posts: ContentPost[];
  onSelectDay: (day: number) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({ posts, onSelectDay }) => {
  const columns: { id: PostStatus; label: string; color: string; badge: string }[] = [
    { id: 'draft', label: 'Ideas & Drafts', color: 'bg-stone-100', badge: 'bg-stone-200 text-stone-700' },
    { id: 'in_progress', label: 'Scripting / In Progress', color: 'bg-amber-50', badge: 'bg-amber-100 text-amber-800' },
    { id: 'ready', label: 'Ready to Film & Record', color: 'bg-blue-50', badge: 'bg-blue-100 text-blue-800' },
    { id: 'published', label: 'Published ✓', color: 'bg-green-50', badge: 'bg-green-100 text-green-800' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colPosts = posts.filter((p) => p.status === col.id);

        return (
          <div key={col.id} className="flex flex-col bg-white rounded-3xl p-4 border border-[#ede3d5] shadow-sm max-h-[75vh]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
              <span className="text-xs font-black uppercase tracking-wider text-stone-800">
                {col.label}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                {colPosts.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {colPosts.map((post) => (
                <div
                  key={post.day}
                  onClick={() => onSelectDay(post.day)}
                  className="p-3.5 rounded-2xl bg-[#faf7f2] hover:bg-amber-50/70 border border-stone-200 hover:border-amber-300 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded">
                      Day {post.day}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-stone-500">
                      {post.platform}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                    {post.title}
                  </p>

                  {post.spokenHook && (
                    <p className="text-[10px] text-stone-500 italic line-clamp-2 mt-1">
                      "{post.spokenHook}"
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(post.publishDateETA).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {post.isMilestone && (
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <Gift className="w-3 h-3" />
                        Reward
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {colPosts.length === 0 && (
                <div className="text-center py-8 text-stone-400 text-xs font-medium">
                  No posts in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
