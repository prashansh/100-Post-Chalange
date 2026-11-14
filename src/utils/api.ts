import { ContentPost, MilestoneReward, CreatorProfile } from '../types';
import { UserProfile } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const getHeaders = (uid: string) => ({
  'Content-Type': 'application/json',
  'x-user-id': uid,
});

// 1. Sync / Upsert User Profile
export async function apiSyncUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/user/sync`, {
      method: 'POST',
      headers: getHeaders(profile.uid),
      body: JSON.stringify(profile),
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend API sync profile warning:', err);
    return false;
  }
}

// 2. Get User Profile from Backend
export async function apiGetUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      headers: getHeaders(uid),
    });
    if (res.ok) {
      return (await res.json()) as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Backend API get profile warning:', err);
    return null;
  }
}

// 3. Update User Profile
export async function apiUpdateUserProfile(uid: string, data: Partial<CreatorProfile>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      method: 'PUT',
      headers: getHeaders(uid),
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend API update profile warning:', err);
    return false;
  }
}

// 4. Get User 100 Posts from Backend Database
export async function apiGetUserPosts(uid: string): Promise<ContentPost[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/posts`, {
      headers: getHeaders(uid),
    });
    if (res.ok) {
      const data = await res.json();
      return (data.posts as ContentPost[]) || null;
    }
    return null;
  } catch (err) {
    console.warn('Backend API get posts warning:', err);
    return null;
  }
}

// 5. Update Single Post (Day 1..100)
export async function apiUpdateUserPost(uid: string, day: number, post: ContentPost): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${day}`, {
      method: 'PUT',
      headers: getHeaders(uid),
      body: JSON.stringify(post),
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend API update post warning:', err);
    return false;
  }
}

// 6. Batch Save Posts
export async function apiBatchSavePosts(uid: string, posts: ContentPost[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/batch`, {
      method: 'POST',
      headers: getHeaders(uid),
      body: JSON.stringify({ posts }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend API batch save warning:', err);
    return false;
  }
}

// 7. Get Milestones
export async function apiGetUserMilestones(uid: string): Promise<MilestoneReward[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/milestones`, {
      headers: getHeaders(uid),
    });
    if (res.ok) {
      const data = await res.json();
      return (data.milestones as MilestoneReward[]) || null;
    }
    return null;
  } catch (err) {
    console.warn('Backend API get milestones warning:', err);
    return null;
  }
}

// 8. Update Milestones
export async function apiUpdateMilestones(uid: string, milestones: MilestoneReward[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/milestones`, {
      method: 'PUT',
      headers: getHeaders(uid),
      body: JSON.stringify({ milestones }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend API update milestones warning:', err);
    return false;
  }
}

// 9. Reset Challenge
export async function apiResetChallenge(uid: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/reset`, {
      method: 'POST',
      headers: getHeaders(uid),
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend API reset warning:', err);
    return false;
  }
}
