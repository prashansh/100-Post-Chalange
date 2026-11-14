import { doc, setDoc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../context/AuthContext';
import { ContentPost, MilestoneReward } from '../types';

// Utility to clean undefined values before sending to Firestore (prevents Firestore undefined error)
export function sanitizeForFirestore<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => (value === undefined ? null : value))
  );
}

// Timeout helper so promises never hang indefinitely on poor networks
export function withTimeout<T>(promise: Promise<T>, ms: number = 4000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ─── 1. USER PROFILE (users/{uid}) ──────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const payload = sanitizeForFirestore({
      ...data,
      uid,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    await withTimeout(setDoc(userRef, payload, { merge: true }), 5000);
  } catch (err) {
    console.warn('Firestore createUserProfile error:', err);
  }
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const payload = sanitizeForFirestore({
      ...data,
      updatedAt: new Date().toISOString(),
    });
    await withTimeout(setDoc(userRef, payload, { merge: true }), 5000);
  } catch (err) {
    console.warn('Firestore updateUserProfile error:', err);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await withTimeout(getDoc(docRef), 4000);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (err) {
    console.warn('Firestore getUserProfile error:', err);
    return null;
  }
}

export function subscribeUserProfile(
  uid: string,
  onProfileUpdate: (profile: UserProfile) => void
): Unsubscribe {
  const ref = doc(db, 'users', uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onProfileUpdate(snap.data() as UserProfile);
      }
    },
    (err) => {
      console.warn('Firestore subscribeUserProfile warning:', err);
    }
  );
}

// ─── 2. USER 100 POSTS (users/{uid}/challenge/posts) ─────────────────────────

export async function saveUserPosts(uid: string, posts: ContentPost[]): Promise<void> {
  try {
    const ref = doc(db, 'users', uid, 'challenge', 'posts');
    const sanitizedPosts = sanitizeForFirestore(posts);
    await withTimeout(
      setDoc(ref, {
        posts: sanitizedPosts,
        updatedAt: new Date().toISOString(),
      }, { merge: true }),
      6000
    );
  } catch (err) {
    console.warn('Firestore saveUserPosts error:', err);
  }
}

export async function getUserPosts(uid: string): Promise<ContentPost[] | null> {
  try {
    const ref = doc(db, 'users', uid, 'challenge', 'posts');
    const snap = await withTimeout(getDoc(ref), 4000);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.posts && Array.isArray(data.posts) && data.posts.length === 100) {
        return data.posts as ContentPost[];
      }
    }
    return null;
  } catch (err) {
    console.warn('Firestore getUserPosts error:', err);
    return null;
  }
}

// Real-time listener: across phone and laptop, changes sync live!
export function subscribeUserPosts(
  uid: string,
  onPostsUpdate: (posts: ContentPost[]) => void
): Unsubscribe {
  const ref = doc(db, 'users', uid, 'challenge', 'posts');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.posts && Array.isArray(data.posts) && data.posts.length === 100) {
          onPostsUpdate(data.posts as ContentPost[]);
        }
      }
    },
    (err) => {
      console.warn('Firestore subscribeUserPosts warning:', err);
    }
  );
}

// ─── 3. USER MILESTONES (users/{uid}/challenge/milestones) ───────────────────

export async function saveUserMilestones(uid: string, milestones: MilestoneReward[]): Promise<void> {
  try {
    const ref = doc(db, 'users', uid, 'challenge', 'milestones');
    const sanitized = sanitizeForFirestore(milestones);
    await withTimeout(
      setDoc(ref, {
        milestones: sanitized,
        updatedAt: new Date().toISOString(),
      }, { merge: true }),
      5000
    );
  } catch (err) {
    console.warn('Firestore saveUserMilestones error:', err);
  }
}

export async function getUserMilestones(uid: string): Promise<MilestoneReward[] | null> {
  try {
    const ref = doc(db, 'users', uid, 'challenge', 'milestones');
    const snap = await withTimeout(getDoc(ref), 4000);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.milestones && Array.isArray(data.milestones)) {
        return data.milestones as MilestoneReward[];
      }
    }
    return null;
  } catch (err) {
    console.warn('Firestore getUserMilestones error:', err);
    return null;
  }
}

export function subscribeUserMilestones(
  uid: string,
  onMilestonesUpdate: (milestones: MilestoneReward[]) => void
): Unsubscribe {
  const ref = doc(db, 'users', uid, 'challenge', 'milestones');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.milestones && Array.isArray(data.milestones)) {
          onMilestonesUpdate(data.milestones as MilestoneReward[]);
        }
      }
    },
    (err) => {
      console.warn('Firestore subscribeUserMilestones warning:', err);
    }
  );
}
