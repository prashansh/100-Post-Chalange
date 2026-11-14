import React from 'react';
import { Check, Clock, Gift, Trophy, ExternalLink, Pencil } from 'lucide-react';
import { ContentPost } from '../types';

interface ListViewProps {
  posts: ContentPost[];
  onSelectDay: (day: number) => void;
}

export const ListView: React.FC<ListViewProps> = ({ posts, onSelectDay }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#ede3d5] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#faf7f2] border-b border-stone-200 text-stone-500 uppercase tracking-wider font-extrabold text-[11px]">
              <th className="py-3.5 px-4 w-16 text-center">Day</th>
              <th className="py-3.5 px-4">Title & Concept</th>
              <th className="py-3.5 px-4">Hook Preview</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Channel</th>
              <th className="py-3.5 px-4">ETA</th>
              <th className="py-3.5 px-4 text-right">Views</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {posts.map((post) => {
              const isPublished = post.status === 'published';
              return (
                <tr
                  key={post.day}
                  onClick={() => onSelectDay(post.day)}
                  className="hover:bg-amber-50/50 cursor-pointer transition-colors group"
                >
                  {/* Day # */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                        isPublished
                          ? 'bg-creator-green text-white'
                          : post.isMilestone
                          ? 'bg-amber-400 text-stone-900 border border-stone-900'
                          : post.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-900 border border-amber-400'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {isPublished ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : post.status === 'in_progress' ? (
                        <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        post.day
                      )}
                    </span>
                  </td>

                  {/* Title & Idea */}
                  <td className="py-3 px-4 font-semibold text-stone-900 max-w-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{post.title}</span>
                      {post.isMilestone && (
                        <Gift className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] font-normal text-stone-400 truncate mt-0.5">
                      {post.idea}
                    </p>
                  </td>

                  {/* Hook */}
                  <td className="py-3 px-4 text-stone-600 max-w-sm">
                    <p className="italic text-[11px] truncate">"{post.spokenHook || post.textOverlayHook}"</p>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : post.status === 'ready'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {post.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-4 uppercase font-bold text-stone-700">
                    {post.platform}
                  </td>

                  {/* ETA */}
                  <td className="py-3 px-4 whitespace-nowrap text-stone-500 font-medium">
                    {new Date(post.publishDateETA).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>

                  {/* Views */}
                  <td className="py-3 px-4 text-right font-bold text-stone-900">
                    {post.views ? post.views.toLocaleString() : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
