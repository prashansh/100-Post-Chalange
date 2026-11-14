import React from 'react';
import { X, TrendingUp, Eye, Heart, MessageCircle, Share2, Flame, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { ContentPost } from '../types';

interface AnalyticsOverviewProps {
  posts: ContentPost[];
  onClose: () => void;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ posts, onClose }) => {
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === 'published');
  const publishedCount = publishedPosts.length;
  const inProgressCount = posts.filter((p) => p.status === 'in_progress').length;
  const readyCount = posts.filter((p) => p.status === 'ready').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  const totalViews = publishedPosts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = publishedPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const totalComments = publishedPosts.reduce((acc, p) => acc + (p.comments || 0), 0);
  const totalShares = publishedPosts.reduce((acc, p) => acc + (p.shares || 0), 0);

  const avgViewsPerPost = publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;
  const completionPercent = Math.round((publishedCount / totalPosts) * 100);

  // Platform distribution
  const platformCounts: Record<string, number> = {};
  posts.forEach((p) => {
    platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#faf7f2] w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-300 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-stone-900 text-amber-300">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">100-Day Performance & Stats</h2>
              <p className="text-xs text-stone-500">Live tracker of your consistency, reach, and audience growth.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
          {/* Main Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Completion
              </span>
              <p className="text-3xl font-black text-stone-900">{completionPercent}%</p>
              <p className="text-xs text-creator-green font-bold mt-1">
                {publishedCount} of 100 done
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Current Streak
              </span>
              <p className="text-3xl font-black text-amber-600">{publishedCount} Days</p>
              <p className="text-xs text-stone-500 font-medium mt-1">Unbroken consistency</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-blue-500" /> Total Reach
              </span>
              <p className="text-3xl font-black text-stone-900">
                {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
              </p>
              <p className="text-xs text-stone-500 font-medium mt-1">~{avgViewsPerPost.toLocaleString()} avg / post</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Total Likes
              </span>
              <p className="text-3xl font-black text-stone-900">
                {totalLikes >= 1000 ? `${(totalLikes / 1000).toFixed(1)}k` : totalLikes}
              </p>
              <p className="text-xs text-stone-500 font-medium mt-1">
                {totalComments} comments • {totalShares} shares
              </p>
            </div>
          </div>

          {/* Pipeline Status Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-600 mb-3">
              Production Pipeline Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-green-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-creator-green" /> Published
                </span>
                <span>{publishedCount} ({Math.round((publishedCount / totalPosts) * 100)}%)</span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex">
                <div style={{ width: `${(publishedCount / totalPosts) * 100}%` }} className="bg-creator-green" />
                <div style={{ width: `${(inProgressCount / totalPosts) * 100}%` }} className="bg-amber-400" />
                <div style={{ width: `${(readyCount / totalPosts) * 100}%` }} className="bg-blue-400" />
                <div style={{ width: `${(draftCount / totalPosts) * 100}%` }} className="bg-stone-300" />
              </div>
              <div className="flex items-center gap-4 text-[11px] font-semibold text-stone-500 pt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-creator-green" /> Published: {publishedCount}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> In Progress: {inProgressCount}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Ready to Film: {readyCount}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-300" /> Drafts: {draftCount}</span>
              </div>
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-600 mb-3">
              Content Channels & Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(platformCounts).map(([platform, count]) => (
                <div key={platform} className="bg-[#faf7f2] p-3 rounded-xl border border-stone-200 text-center">
                  <p className="text-xs font-bold uppercase text-stone-600">{platform}</p>
                  <p className="text-lg font-black text-stone-900 mt-0.5">{count}</p>
                  <p className="text-[10px] text-stone-400">{Math.round((count / totalPosts) * 100)}% of content</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
