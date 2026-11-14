export type PostStatus = 'draft' | 'in_progress' | 'ready' | 'published' | 'skipped';

export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'x' | 'threads' | 'facebook';

export type ContentFormat = 'short_video' | 'carousel' | 'long_video' | 'text_image' | 'story';

export interface MilestoneReward {
  day: number;
  rewardTitle: string;
  isUnlocked: boolean;
  rewardNote?: string;
  icon?: string;
}

export interface ContentPost {
  day: number; // 1 to 100
  title: string;
  status: PostStatus;
  
  // Idea
  idea: string;
  category: string;
  targetAudience: string;
  
  // Hook
  visualHook: string; // What happens in the first 3 seconds visually
  spokenHook: string; // Verbal first sentence
  textOverlayHook: string; // Text on screen hook
  
  // Script
  script: string;
  bulletPoints: string[];
  cta: string; // Call to action
  
  // Visual / Production
  format: ContentFormat;
  visualNotes: string;
  shotList: { id: string; text: string; done: boolean }[];
  thumbnailConcept?: string;
  thumbnailUrl?: string;
  referenceLinks?: string[];
  
  // Scheduling & Publishing
  publishDateETA: string; // ISO date string e.g. "2026-11-15T14:00"
  publishedAt?: string;
  platform: Platform;
  secondaryPlatforms?: Platform[];
  liveUrl?: string;
  
  // Performance (optional after published)
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  notes?: string;

  // Milestone if applicable
  isMilestone?: boolean;
  milestoneReward?: string;
}

export interface CreatorProfile {
  handle: string;
  name: string;
  challengeTitle: string;
  startDate: string;
  targetEndDate: string;
  niche: string;
}

export type ViewMode = 'grid' | 'list' | 'kanban' | 'analytics';
