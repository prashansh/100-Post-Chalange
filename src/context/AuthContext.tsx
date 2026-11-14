import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { withTimeout } from '../utils/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  country: string;
  dateOfBirth: string;
  creatorHandle: string;
  niche: string;
  createdAt: string;
  updatedAt: string;
  challengeStartDate: string;
}

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated' | 'needs_profile';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  authStatus: AuthStatus;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfileDirectly: (p: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const getProfileCacheKey = (uid: string) => `creator_profile_${uid}`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  const getCachedProfile = (uid: string): UserProfile | null => {
    try {
      const cached = localStorage.getItem(getProfileCacheKey(uid));
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore parse errors
    }
    return null;
  };

  const fetchFirestoreProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await withTimeout(getDoc(docRef), 8000);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn('Firestore fetchProfile timed out or failed:', err);
      return null;
    }
  };

  const resolveUser = async (firebaseUser: User) => {
    setUser(firebaseUser);

    // 1. Check local cache first for instant render on same device
    const cached = getCachedProfile(firebaseUser.uid);
    if (cached) {
      setProfile(cached);
      setAuthStatus('authenticated');
      // Sync fresh Firestore in background
      fetchFirestoreProfile(firebaseUser.uid).then((fresh) => {
        if (fresh) {
          localStorage.setItem(getProfileCacheKey(firebaseUser.uid), JSON.stringify(fresh));
          setProfile(fresh);
        }
      });
      return;
    }

    // 2. Fresh device / mobile phone: fetch directly from authoritative Firestore cloud database
    try {
      const firestoreProfile = await fetchFirestoreProfile(firebaseUser.uid);
      if (firestoreProfile) {
        localStorage.setItem(getProfileCacheKey(firebaseUser.uid), JSON.stringify(firestoreProfile));
        setProfile(firestoreProfile);
        setAuthStatus('authenticated');
      } else {
        setProfile(null);
        setAuthStatus('needs_profile');
      }
    } catch {
      setProfile(null);
      setAuthStatus('needs_profile');
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await fetchFirestoreProfile(user.uid);
    if (p) {
      localStorage.setItem(getProfileCacheKey(user.uid), JSON.stringify(p));
      setProfile(p);
      setAuthStatus('authenticated');
    } else {
      setProfile(null);
      setAuthStatus('needs_profile');
    }
  };

  const setProfileDirectly = (p: UserProfile) => {
    localStorage.setItem(getProfileCacheKey(p.uid), JSON.stringify(p));
    setProfile(p);
    setAuthStatus('authenticated');
  };

  useEffect(() => {
    // Safety fallback: only if auth completely fails to fire after 6 seconds
    const safetyTimer = setTimeout(() => {
      setAuthStatus((current) => {
        if (current === 'loading' && !auth.currentUser) {
          return 'unauthenticated';
        }
        return current;
      });
    }, 6000);

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) resolveUser(result.user);
      })
      .catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await resolveUser(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
        setAuthStatus('unauthenticated');
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setAuthStatus('loading');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err?.code)) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        setAuthStatus('unauthenticated');
        throw err;
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setAuthStatus('unauthenticated');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authStatus,
        signInWithGoogle,
        signOut,
        refreshProfile,
        setProfileDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
