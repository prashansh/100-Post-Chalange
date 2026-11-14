import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Share2,
  Copy,
  Check,
  Video,
  FileText,
  Lightbulb,
  Anchor,
  Eye,
  Plus,
  Trash2,
  ExternalLink,
  Gift,
  Trophy,
  PlaySquare,
  BarChart2,
  Sliders,
  Flame,
  Bookmark,
  Home,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { ContentPost, PostStatus, Platform, ContentFormat } from '../types';
import { triggerRewardConfetti } from '../utils/storage';

interface PostDetailViewProps {
  post: ContentPost;
  totalPosts: number;
  onUpdatePost: (updated: ContentPost) => void;
  onBack: () => void;
  onNavigateDay: (day: number) => void;
  onOpenTeleprompter: () => void;
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({
  post,
  totalPosts,
  onUpdatePost,
  onBack,
  onNavigateDay,
  onOpenTeleprompter,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [newShotText, setNewShotText] = useState('');
  const [newBulletText, setNewBulletText] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'visuals' | 'schedule' | 'analytics'>('content');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Compress using canvas to max 800px width/height and 0.8 JPEG quality
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          handleChange('thumbnailUrl', compressedDataUrl);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveThumbnail = () => {
    handleChange('thumbnailUrl', '');
  };

  // Keyboard navigation: Left arrow = previous day, Right arrow = next day, Esc = back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't intercept when typing in inputs
      }
      if (e.key === 'ArrowLeft' && post.day > 1) {
        onNavigateDay(post.day - 1);
      } else if (e.key === 'ArrowRight' && post.day < totalPosts) {
        onNavigateDay(post.day + 1);
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post.day, totalPosts, onNavigateDay, onBack]);

  // Update a single field on the post
  const handleChange = <K extends keyof ContentPost>(field: K, value: ContentPost[K]) => {
    onUpdatePost({
      ...post,
      [field]: value
    });
  };

  // Toggle status to published or other
  const handleStatusChange = (newStatus: PostStatus) => {
    const isNowPublished = newStatus === 'published' && post.status !== 'published';
    const updated: ContentPost = {
      ...post,
      status: newStatus,
      publishedAt: newStatus === 'published' ? (post.publishedAt || new Date().toISOString()) : post.publishedAt
    };
    onUpdatePost(updated);

    if (isNowPublished) {
      triggerRewardConfetti(post.isMilestone);
    }
  };

  // Calculate words and estimated reading duration
  const wordCount = post.script ? post.script.trim().split(/\s+/).filter(Boolean).length : 0;
  // Average speaking pace for high-retention short videos: ~140-150 words per minute
  const speakingSeconds = Math.round((wordCount / 140) * 60);

  const handleCopyScript = () => {
    const fullText = `HOOK: ${post.spokenHook}\n\nSCRIPT:\n${post.script}\n\nCTA: ${post.cta}`;
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyCaption = () => {
    const caption = `${post.textOverlayHook}\n\n${post.idea}\n\n${post.cta}\n\n#creator #contentcreator #100dayschallenge #growth #${post.platform}`;
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleAddShot = () => {
    if (!newShotText.trim()) return;
    const newShots = [
      ...(post.shotList || []),
      { id: Date.now().toString(), text: newShotText.trim(), done: false }
    ];
    handleChange('shotList', newShots);
    setNewShotText('');
  };

  const handleToggleShot = (id: string) => {
    const newShots = (post.shotList || []).map((s) => (s.id === id ? { ...s, done: !s.done } : s));
    handleChange('shotList', newShots);
  };

  const handleDeleteShot = (id: string) => {
    const newShots = (post.shotList || []).filter((s) => s.id !== id);
    handleChange('shotList', newShots);
  };

  const handleAddBullet = () => {
    if (!newBulletText.trim()) return;
    handleChange('bulletPoints', [...(post.bulletPoints || []), newBulletText.trim()]);
    setNewBulletText('');
  };

  const handleDeleteBullet = (idx: number) => {
    handleChange(
      'bulletPoints',
      (post.bulletPoints || []).filter((_, i) => i !== idx)
    );
  };

  // Formatted date string
  const etaDate = post.publishDateETA ? new Date(post.publishDateETA) : null;
  const isEtaValid = Boolean(etaDate && !isNaN(etaDate.getTime()));
  const isPast = isEtaValid && etaDate!.getTime() < Date.now() && post.status !== 'published';

  return (
    <div className="max-w-5xl mx-auto py-6 animate-in fade-in duration-200">
      {/* Top Sticky Navigation Bar */}
      <div className="sticky top-2 z-30 mb-6 bg-white/90 backdrop-blur-md border border-stone-200 shadow-md rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Back and Day Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Back to Home (Esc)"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="h-5 w-px bg-stone-200 mx-1" />

          {/* Previous Day */}
          <button
            onClick={() => post.day > 1 && onNavigateDay(post.day - 1)}
            disabled={post.day <= 1}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Previous Day (←)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Current Day Badge */}
          <span className="font-black text-sm text-stone-900 px-2.5 py-1 bg-[#f4ede4] rounded-lg">
            Day {post.day} <span className="text-stone-400 font-semibold">/ {totalPosts}</span>
          </span>

          {/* Next Day */}
          <button
            onClick={() => post.day < totalPosts && onNavigateDay(post.day + 1)}
            disabled={post.day >= totalPosts}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Next Day (→)"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Milestone Ribbon if applicable */}
        {post.isMilestone && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold">
            {post.day === 100 ? (
              <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            ) : (
              <Gift className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            )}
            <span>Milestone: {post.milestoneReward || 'Reward unlocked!'}</span>
          </div>
        )}

        {/* Right Action Tools: Status selector, Prompter, Published button */}
        <div className="flex items-center gap-2">
          {/* Teleprompter Button */}
          <button
            onClick={onOpenTeleprompter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all"
            title="Open Teleprompter to film this script"
          >
            <PlaySquare className="w-3.5 h-3.5" />
            <span>Teleprompter</span>
          </button>

          {/* Status Dropdown */}
          <select
            value={post.status}
            onChange={(e) => handleStatusChange(e.target.value as PostStatus)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all ${
              post.status === 'published'
                ? 'bg-green-100 text-green-900 border-green-300'
                : post.status === 'in_progress'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : post.status === 'ready'
                ? 'bg-blue-100 text-blue-900 border-blue-300'
                : 'bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="ready">Ready to Film</option>
            <option value="published">Published ✓</option>
            <option value="skipped">Skipped</option>
          </select>

          {/* Quick Mark Complete Button */}
          {post.status !== 'published' ? (
            <button
              onClick={() => handleStatusChange('published')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-creator-green hover:bg-creator-green-dark text-white rounded-xl shadow-sm transition-all"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Mark Published</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Published</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Post Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ede3d5] mb-6">
        {/* Title and Category */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-stone-900 text-amber-300 shadow-xs">
                DAY {post.day}
              </span>
            </div>

            {/* Platform & ETA Badge */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-stone-600 flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                ETA: {isEtaValid ? etaDate!.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
              </span>
              <span className="font-bold text-stone-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg uppercase">
                {post.platform}
              </span>
            </div>
          </div>

          {/* Editable Post Title */}
          <div>
            <input
              type="text"
              value={post.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full text-2xl sm:text-3xl font-black text-stone-900 tracking-tight bg-transparent border-b border-transparent hover:border-stone-200 focus:border-stone-900 outline-none py-1 transition-all"
              placeholder="Post Title / Concept headline..."
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-stone-200 pt-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('content')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'content'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Idea, Hook & Script</span>
            </button>
            <button
              onClick={() => setActiveTab('visuals')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'visuals'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Visuals & B-Roll ({(post.shotList || []).filter((s) => s.done).length}/{(post.shotList || []).length})</span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'schedule'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule & Platform</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'analytics'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Performance & Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: IDEA, HOOK & SCRIPT */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* SECTION 1: THE IDEA & TARGET AUDIENCE */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#ede3d5]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">1. Core Content Idea</h3>
                  <p className="text-xs text-stone-500">The angle, problem solved, and why viewers should care.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1 uppercase tracking-wider">
                  The Idea & Angle
                </label>
                <textarea
                  value={post.idea}
                  onChange={(e) => handleChange('idea', e.target.value)}
                  rows={2}
                  className="w-full text-sm font-medium text-stone-800 bg-[#faf7f2] border border-stone-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-y"
                  placeholder="What is the key takeaway or unique insight?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1 uppercase tracking-wider">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={post.targetAudience}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  className="w-full text-xs font-medium text-stone-800 bg-[#faf7f2] border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  placeholder="Who is this post specifically for?"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: THE 3-SECOND HOOK (VERBAL, VISUAL, TEXT) */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-7 shadow-sm border border-amber-200/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
                  <Anchor className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-stone-900">2. The 3-Second Hook System</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Crucial for Retention
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">The 3 levers that stop viewers from swiping away in the first 3 seconds.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Spoken Hook */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-stone-900 flex items-center gap-1">
                    🗣️ Spoken Hook
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold">1st sentence</span>
                </div>
                <p className="text-[11px] text-stone-500 mb-2">What you say aloud immediately:</p>
                <textarea
                  value={post.spokenHook}
                  onChange={(e) => handleChange('spokenHook', e.target.value)}
                  rows={3}
                  className="w-full text-xs font-semibold text-stone-900 bg-[#faf7f2] border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  placeholder="e.g. 'I wasted 15 hours last week until I discovered...'"
                />
              </div>

              {/* Text Overlay Hook */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-stone-900 flex items-center gap-1">
                    🔤 Text Overlay Hook
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold">Headline</span>
                </div>
                <p className="text-[11px] text-stone-500 mb-2">Large high-contrast text on screen:</p>
                <textarea
                  value={post.textOverlayHook}
                  onChange={(e) => handleChange('textOverlayHook', e.target.value)}
                  rows={3}
                  className="w-full text-xs font-semibold text-stone-900 bg-[#faf7f2] border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  placeholder="e.g. 'Stop editing shorts manually in 2026 🛑'"
                />
              </div>

              {/* Visual Hook */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-stone-900 flex items-center gap-1">
                    ⚡ Visual Hook
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold">Movement</span>
                </div>
                <p className="text-[11px] text-stone-500 mb-2">Pattern interrupt or physical action:</p>
                <textarea
                  value={post.visualHook}
                  onChange={(e) => handleChange('visualHook', e.target.value)}
                  rows={3}
                  className="w-full text-xs font-semibold text-stone-900 bg-[#faf7f2] border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  placeholder="e.g. 'Split screen comparing slow vs fast setup'"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SCRIPT & OUTLINE */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#ede3d5]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">3. Video Script & Outline</h3>
                  <p className="text-xs text-stone-500">Full voiceover script, body points, and Call-To-Action.</p>
                </div>
              </div>

              {/* Script Stats & Copy */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                  {wordCount} words (~{speakingSeconds}s)
                </span>
                <button
                  onClick={handleCopyScript}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-all"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
            </div>

            {/* Script Textarea */}
            <div className="space-y-4">
              <div>
                <textarea
                  value={post.script}
                  onChange={(e) => handleChange('script', e.target.value)}
                  rows={8}
                  className="w-full font-mono text-xs sm:text-sm leading-relaxed text-stone-800 bg-[#faf7f2] border border-stone-200 rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-y"
                  placeholder="Write full script here. Keep sentences short and punchy for video delivery..."
                />
              </div>

              {/* Key Outline Bullet Points */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Key Talking Points
                </label>
                <div className="space-y-2 mb-2">
                  {(post.bulletPoints || []).map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#faf7f2] px-3 py-2 rounded-xl border border-stone-200">
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-stone-800 flex-1">{bullet}</span>
                      <button
                        onClick={() => handleDeleteBullet(idx)}
                        className="text-stone-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBulletText}
                    onChange={(e) => setNewBulletText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddBullet()}
                    placeholder="Add bullet point..."
                    className="flex-1 text-xs px-3 py-2 bg-[#faf7f2] border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <button
                    onClick={handleAddBullet}
                    className="px-3 py-2 bg-stone-800 text-white text-xs font-bold rounded-xl hover:bg-stone-900"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Call To Action (CTA) */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-600 mb-1 uppercase tracking-wider">
                  Call To Action (CTA)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={post.cta}
                    onChange={(e) => handleChange('cta', e.target.value)}
                    placeholder="e.g. 'Comment STACK for the free Notion template.'"
                    className="flex-1 text-xs font-semibold text-stone-800 bg-[#faf7f2] border border-stone-200 rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none"
                  />
                  <button
                    onClick={handleCopyCaption}
                    className="px-3 py-2 bg-amber-400 text-stone-900 text-xs font-bold rounded-xl hover:bg-amber-300 transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedCaption ? 'Copied' : 'Copy Social Caption'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUALS & B-ROLL CHECKLIST */}
      {activeTab === 'visuals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#ede3d5]">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900">Visual Format & Style</h3>
                <p className="text-xs text-stone-500">Aspect ratio, camera settings, and lighting notes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Format Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Content Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'short_video', label: 'Vertical Video (9:16)', sub: 'Reels / Shorts / TikTok' },
                    { id: 'carousel', label: 'Carousel (4:5 / 1:1)', sub: 'Slides / LinkedIn / IG' },
                    { id: 'long_video', label: 'Landscape Video (16:9)', sub: 'YouTube / Podcast' },
                    { id: 'text_image', label: 'Text + Graphic', sub: 'X / LinkedIn Thread' }
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => handleChange('format', fmt.id as ContentFormat)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        post.format === fmt.id
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 bg-[#faf7f2] text-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <p className="text-xs font-bold">{fmt.label}</p>
                      <p className={`text-[10px] mt-0.5 ${post.format === fmt.id ? 'text-stone-300' : 'text-stone-500'}`}>
                        {fmt.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Camera, Lighting & Aesthetic Notes
                </label>
                <textarea
                  value={post.visualNotes}
                  onChange={(e) => handleChange('visualNotes', e.target.value)}
                  rows={4}
                  className="w-full text-xs font-medium text-stone-800 bg-[#faf7f2] border border-stone-200 rounded-2xl p-3 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none resize-none"
                  placeholder="e.g. Ring light setup, 24fps 4k, moody background LED lights, mic position..."
                />
              </div>
            </div>

            {/* Thumbnail / Cover Image & Multiline Notes */}
            <div className="mt-6 pt-6 border-t border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-xs font-black text-stone-800 uppercase tracking-wider">
                    Thumbnail & Cover Image
                  </label>
                  <p className="text-[11px] text-stone-400">
                    Upload your thumbnail or cover mockup, and specify your design notes.
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleThumbnailUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Upload / Image Preview */}
                <div>
                  {post.thumbnailUrl ? (
                    <div className="relative group rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-900 aspect-video flex items-center justify-center shadow-sm">
                      <img
                        src={post.thumbnailUrl}
                        alt="Thumbnail Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl transition-all cursor-pointer"
                        >
                          Change Image
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveThumbnail}
                          className="p-1.5 text-xs font-bold text-white bg-red-600/80 hover:bg-red-600 rounded-xl transition-all cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-amber-400 bg-[#faf7f2] hover:bg-amber-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all aspect-video flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-stone-500 group-hover:text-amber-600 border border-stone-200 group-hover:border-amber-300 transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-stone-800 group-hover:text-amber-900">Upload Thumbnail</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Click to browse (PNG, JPG, WebP)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Multiline Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1.5 uppercase tracking-wider">
                    Thumbnail Notes & Layout Concept
                  </label>
                  <textarea
                    value={post.thumbnailConcept || ''}
                    onChange={(e) => handleChange('thumbnailConcept', e.target.value)}
                    rows={5}
                    placeholder="e.g. Bold high-contrast portrait on left, 3-word bold yellow font on right with drop shadow. Clean dark background gradient."
                    className="w-full text-xs font-medium text-stone-800 bg-[#faf7f2] border border-stone-200 rounded-2xl p-3 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* B-ROLL SHOT LIST */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#ede3d5]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">B-Roll & Shots Checklist</h3>
                <p className="text-xs text-stone-500">Check off shots as you film them to stay organized.</p>
              </div>
              <span className="text-xs font-black text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                {(post.shotList || []).filter((s) => s.done).length} / {(post.shotList || []).length} Filmed
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {(post.shotList || []).map((shot) => (
                <div
                  key={shot.id}
                  onClick={() => handleToggleShot(shot.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    shot.done
                      ? 'bg-green-50/70 border-green-200 text-stone-500'
                      : 'bg-[#faf7f2] border-stone-200 hover:border-stone-300 text-stone-900'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                      shot.done
                        ? 'bg-creator-green border-creator-green text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {shot.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <span className={`text-xs font-semibold flex-1 ${shot.done ? 'line-through text-stone-400' : ''}`}>
                    {shot.text}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteShot(shot.id);
                    }}
                    className="text-stone-300 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new shot input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newShotText}
                onChange={(e) => setNewShotText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddShot()}
                placeholder="Add new shot (e.g. Over-the-shoulder typing, product b-roll)..."
                className="flex-1 text-xs px-3 py-2.5 bg-[#faf7f2] border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-900"
              />
              <button
                onClick={handleAddShot}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Shot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULE & PLATFORM */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#ede3d5]">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 rounded-xl bg-green-100 text-green-800">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900">Publish Date & Distribution</h3>
                <p className="text-xs text-stone-500">Schedule your ETA, select platforms, and log live links.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ETA Date Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Target Publish Date & Time (ETA)
                </label>
                <input
                  type="datetime-local"
                  value={post.publishDateETA}
                  onChange={(e) => handleChange('publishDateETA', e.target.value)}
                  className="w-full text-sm font-semibold text-stone-900 bg-[#faf7f2] border border-stone-200 rounded-2xl p-3.5 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none"
                />
                <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isPast
                    ? '⚠️ Target date has passed! Keep the momentum and finish filming today.'
                    : isEtaValid
                    ? `Scheduled for ${etaDate!.toLocaleString()}`
                    : 'Schedule date not set'}
                </p>
              </div>

              {/* Primary Platform Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Primary Platform
                </label>
                <select
                  value={post.platform}
                  onChange={(e) => handleChange('platform', e.target.value as Platform)}
                  className="w-full text-sm font-semibold text-stone-900 bg-[#faf7f2] border border-stone-200 rounded-2xl p-3.5 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none"
                >
                  <option value="instagram">Instagram Reels</option>
                  <option value="youtube">YouTube Shorts</option>
                  <option value="tiktok">TikTok</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="x">X / Twitter</option>
                  <option value="threads">Threads</option>
                </select>
              </div>
            </div>

            {/* Live URL once published */}
            <div className="mt-6 pt-6 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-600 mb-1 uppercase tracking-wider">
                Live Published URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={post.liveUrl || ''}
                  onChange={(e) => handleChange('liveUrl', e.target.value)}
                  placeholder="https://instagram.com/reel/..."
                  className="flex-1 text-xs font-mono text-stone-800 bg-[#faf7f2] border border-stone-200 rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none"
                />
                {post.liveUrl && (
                  <a
                    href={post.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 flex items-center justify-center"
                    title="Open live post"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE & NOTES */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#ede3d5]">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-800">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900">Post Performance & Analytics</h3>
                <p className="text-xs text-stone-500">Record metrics 24-48 hours after publishing to learn what resonated.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#faf7f2] p-4 rounded-2xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Views / Reach
                </label>
                <input
                  type="number"
                  value={post.views || ''}
                  onChange={(e) => handleChange('views', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full text-xl font-black text-stone-900 bg-transparent outline-none"
                />
              </div>

              <div className="bg-[#faf7f2] p-4 rounded-2xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Likes
                </label>
                <input
                  type="number"
                  value={post.likes || ''}
                  onChange={(e) => handleChange('likes', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full text-xl font-black text-stone-900 bg-transparent outline-none"
                />
              </div>

              <div className="bg-[#faf7f2] p-4 rounded-2xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Comments
                </label>
                <input
                  type="number"
                  value={post.comments || ''}
                  onChange={(e) => handleChange('comments', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full text-xl font-black text-stone-900 bg-transparent outline-none"
                />
              </div>

              <div className="bg-[#faf7f2] p-4 rounded-2xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Shares / Saves
                </label>
                <input
                  type="number"
                  value={post.shares || ''}
                  onChange={(e) => handleChange('shares', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full text-xl font-black text-stone-900 bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Creator Retrospective / Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                Post-Mortem & Creator Learnings
              </label>
              <textarea
                value={post.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="w-full text-xs font-medium text-stone-800 bg-[#faf7f2] border border-stone-200 rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-stone-900 outline-none resize-none"
                placeholder="What worked well? Did the hook convert? What would you do differently next time?"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
