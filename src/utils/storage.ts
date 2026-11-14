import confetti from 'canvas-confetti';
import { ContentPost, CreatorProfile, MilestoneReward } from '../types';
import { DEFAULT_CREATOR_PROFILE, DEFAULT_MILESTONES, generateInitialPosts } from '../data/initialData';

const getStorageKey = (prefix: string, uid?: string) => {
  return uid ? `creator_${prefix}_${uid}` : `creator_${prefix}_guest`;
};

export function loadPosts(uid?: string): ContentPost[] {
  try {
    const key = getStorageKey('posts', uid);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = generateInitialPosts();
      savePosts(initial, uid);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load posts from storage:', err);
    return generateInitialPosts();
  }
}

export function savePosts(posts: ContentPost[], uid?: string): void {
  try {
    const key = getStorageKey('posts', uid);
    localStorage.setItem(key, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save posts to storage:', err);
  }
}

export function loadProfile(uid?: string): CreatorProfile {
  try {
    const key = getStorageKey('profile', uid);
    const raw = localStorage.getItem(key);
    if (!raw) {
      saveProfile(DEFAULT_CREATOR_PROFILE, uid);
      return DEFAULT_CREATOR_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CREATOR_PROFILE;
  }
}

export function saveProfile(profile: CreatorProfile, uid?: string): void {
  try {
    const key = getStorageKey('profile', uid);
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export function loadMilestones(uid?: string): MilestoneReward[] {
  try {
    const key = getStorageKey('milestones', uid);
    const raw = localStorage.getItem(key);
    if (!raw) {
      saveMilestones(DEFAULT_MILESTONES, uid);
      return DEFAULT_MILESTONES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MILESTONES;
  }
}

export function saveMilestones(milestones: MilestoneReward[], uid?: string): void {
  try {
    const key = getStorageKey('milestones', uid);
    localStorage.setItem(key, JSON.stringify(milestones));
  } catch (err) {
    console.error('Failed to save milestones:', err);
  }
}

export function clearUserStorage(uid?: string): void {
  try {
    if (uid) {
      localStorage.removeItem(getStorageKey('posts', uid));
      localStorage.removeItem(getStorageKey('profile', uid));
      localStorage.removeItem(getStorageKey('milestones', uid));
    }
  } catch (err) {
    console.error('Failed to clear user storage:', err);
  }
}

export function triggerRewardConfetti(isGrandMilestone: boolean = false) {
  if (isGrandMilestone) {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#facc15', '#22c55e', '#3b82f6', '#f43f5e']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#facc15', '#fbbf24', '#f59e0b']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45
    });
  } else {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#16a34a', '#86efac', '#facc15']
    });
  }
}

export function exportToCSV(posts: ContentPost[]): void {
  const headers = [
    'Day',
    'Title',
    'Status',
    'Platform',
    'Category',
    'Idea',
    'Spoken Hook',
    'Text Overlay Hook',
    'Visual Hook',
    'Script',
    'CTA',
    'ETA Publish Date',
    'Published Date',
    'Live URL',
    'Views',
    'Likes',
    'Comments',
    'Shares',
    'Milestone Reward'
  ];

  const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = posts.map(p => [
    p.day,
    escapeCSV(p.title),
    escapeCSV(p.status),
    escapeCSV(p.platform),
    escapeCSV(p.category),
    escapeCSV(p.idea),
    escapeCSV(p.spokenHook),
    escapeCSV(p.textOverlayHook),
    escapeCSV(p.visualHook),
    escapeCSV(p.script),
    escapeCSV(p.cta),
    escapeCSV(p.publishDateETA),
    escapeCSV(p.publishedAt || ''),
    escapeCSV(p.liveUrl || ''),
    p.views || 0,
    p.likes || 0,
    p.comments || 0,
    p.shares || 0,
    escapeCSV(p.milestoneReward || '')
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `100_Post_Challenge_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(posts: ContentPost[], profile: CreatorProfile, milestones: MilestoneReward[]): void {
  const data = {
    exportedAt: new Date().toISOString(),
    profile,
    milestones,
    posts
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `100_Post_Challenge_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
