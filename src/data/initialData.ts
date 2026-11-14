import { ContentPost, CreatorProfile, MilestoneReward } from '../types';

export const DEFAULT_CREATOR_PROFILE: CreatorProfile = {
  handle: '@your_handle',
  name: 'Creator',
  challengeTitle: '100 Post Challenge',
  startDate: new Date().toISOString().slice(0, 10),
  targetEndDate: '',
  niche: 'Content Creation',
};

export const DEFAULT_MILESTONES: MilestoneReward[] = [
  { day: 5,   rewardTitle: 'Special Coffee & Treat ☕',                     isUnlocked: false, rewardNote: 'Celebrate hitting the first 5 posts!' },
  { day: 10,  rewardTitle: 'Upgrade Studio Lighting / Softbox 💡',           isUnlocked: false, rewardNote: 'Reward for hitting double digits!' },
  { day: 15,  rewardTitle: 'Buy High-End Wireless Lavalier Mic 🎙️',          isUnlocked: false, rewardNote: 'Level up your audio quality' },
  { day: 30,  rewardTitle: 'Fancy Dinner + 1 Full Day Offline Break 🍽️',     isUnlocked: false, rewardNote: 'Surviving 1 full month of consistency!' },
  { day: 50,  rewardTitle: 'Weekend Getaway / Creator Retreat 🏕️',           isUnlocked: false, rewardNote: 'Halfway mark conquered!' },
  { day: 75,  rewardTitle: 'Hire Video Editor / Thumbnail Designer 🎨',      isUnlocked: false, rewardNote: 'Time to scale the pipeline' },
  { day: 100, rewardTitle: '🏆 Launch Your Own Digital Product / Celebrate!', isUnlocked: false, rewardNote: 'The ultimate milestone — you did it!' },
];

// ─── Example content for Day 1 only ──────────────────────────────────────────
const DAY_ONE_EXAMPLE: Omit<ContentPost, 'day' | 'publishDateETA' | 'isMilestone' | 'milestoneReward'> = {
  title: 'Day 1: The 3-App Stack That Saved Me 15 Hours a Week',
  status: 'published',
  category: 'Productivity & Tech',
  idea: 'Show the minimalist creator app stack that automates clip cutting, transcription, and scheduling so solo creators can batch 3 videos in 60 minutes.',
  targetAudience: 'Solo creators, indie hackers, and online entrepreneurs looking to build consistency without burning out.',
  visualHook: 'Rapid split-screen: cluttered messy desktop vs. clean Notion + Whisper workflow — with a dramatic swoosh sound effect.',
  spokenHook: 'I wasted 15 hours last week doing this manually — until I found these 3 tools that now run my entire content pipeline.',
  textOverlayHook: 'Stop editing Shorts manually in 2026 🛑',
  script: `Here is the exact 3-app stack saving me 15 hours every single week as a solo creator:

Tool 1: Riverside.fm — Studio-grade multi-track audio and instant auto-transcription.
Tool 2: Notion Creator OS — Track hooks, retention notes, and ideas in one clean dashboard.
Tool 3: OpusClip or Descript — Auto-cut dead air and generate animated captions in seconds.

If you're doing this solo, your system is your only unfair advantage.
Comment "STACK" below and I'll send you my Notion template for free!`,
  bulletPoints: [
    'Problem: Solo creators burn hours on manual editing',
    'Tool 1: Riverside — audio capture + auto-transcription',
    'Tool 2: Notion Creator OS — the content pipeline hub',
    'Tool 3: OpusClip/Descript — auto-cut + captions',
    'CTA: comment "STACK" for free Notion template',
  ],
  cta: 'Comment "STACK" for the free workflow Notion template.',
  format: 'short_video',
  visualNotes: 'Ring light + Sony ZV-E10, 4K 24fps, 16mm f/1.4. Clean desk aesthetic with warm LED background.',
  shotList: [
    { id: '1', text: 'Talking-head A-Roll intro (0–15s)', done: true },
    { id: '2', text: 'Screen-capture B-Roll of each app UI', done: true },
    { id: '3', text: 'Text callouts + woosh/pop sound effects', done: true },
    { id: '4', text: 'Outro with CTA graphic banner', done: true },
  ],
  thumbnailConcept: 'Bold high-contrast portrait left, 3-word yellow headline right with drop shadow.',
  platform: 'instagram',
  secondaryPlatforms: ['youtube', 'tiktok'],
  liveUrl: '',
  publishedAt: new Date().toISOString(),
  views: 24300,
  likes: 1870,
  comments: 143,
  shares: 412,
  notes: 'Hook performed exceptionally — 81% watch-through on Reels. "STACK" CTA drove 340 DMs. Repurpose as carousel next week.',
};

// ─── Blank template for Days 2–100 ───────────────────────────────────────────
function blankPost(day: number, publishDate: Date): ContentPost {
  const isoDate = publishDate.toISOString().slice(0, 16);
  const milestoneDays = [5, 10, 15, 30, 50, 75, 100];
  const isMilestone = milestoneDays.includes(day);
  const milestoneObj = DEFAULT_MILESTONES.find((m) => m.day === day);

  return {
    day,
    title: `Day ${day}: Your post title`,
    status: 'draft',
    category: 'Uncategorized',
    idea: '',
    targetAudience: '',
    visualHook: '',
    spokenHook: '',
    textOverlayHook: '',
    script: '',
    bulletPoints: [],
    cta: '',
    format: 'short_video',
    visualNotes: '',
    shotList: [
      { id: '1', text: 'Talking-head A-Roll intro', done: false },
      { id: '2', text: 'B-Roll footage', done: false },
      { id: '3', text: 'Text overlays & captions', done: false },
      { id: '4', text: 'Outro with CTA', done: false },
    ],
    thumbnailConcept: '',
    publishDateETA: isoDate,
    platform: 'instagram',
    secondaryPlatforms: [],
    isMilestone,
    milestoneReward: milestoneObj?.rewardTitle,
  };
}

// ─── Main generator ───────────────────────────────────────────────────────────
export function generateInitialPosts(startDateStr?: string): ContentPost[] {
  const posts: ContentPost[] = [];
  const baseDate = startDateStr ? new Date(startDateStr) : new Date();
  baseDate.setHours(10, 0, 0, 0);

  for (let i = 1; i <= 100; i++) {
    const postDate = new Date(baseDate);
    postDate.setDate(baseDate.getDate() + (i - 1));

    if (i === 1) {
      // Day 1: rich example (already published)
      posts.push({
        ...DAY_ONE_EXAMPLE,
        day: 1,
        publishDateETA: postDate.toISOString().slice(0, 16),
        isMilestone: false,
        milestoneReward: undefined,
      });
    } else {
      // Days 2–100: blank templates
      posts.push(blankPost(i, postDate));
    }
  }

  return posts;
}
