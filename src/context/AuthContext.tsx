import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, appleProvider, db } from '../firebase';
import { withTimeout } from '../utils/firestore';
import { generateInitialPosts, DEFAULT_MILESTONES } from '../data/initialData';
import { savePosts, saveMilestones } from '../utils/storage';
import { apiSyncUserProfile, apiBatchSavePosts, apiGetUserProfile } from '../utils/api';

declare global {
  interface Window {
    recaptchaVerifier?: any;
    confirmationResult?: any;
  }
}

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
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendPhoneOtp: (phone: string, buttonId: string) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmation: ConfirmationResult, code: string) => Promise<void>;
  signInAsGuest: (guestName?: string) => Promise<void>;
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
      return;
    }

    // 2. Check backend SQLite database
    try {
      const backendProfile = await apiGetUserProfile(firebaseUser.uid);
      if (backendProfile) {
        localStorage.setItem(getProfileCacheKey(firebaseUser.uid), JSON.stringify(backendProfile));
        setProfile(backendProfile);
        setAuthStatus('authenticated');
        return;
      }
    } catch (e) {
      // ignore
    }

    // 3. Fallback/New Account: immediately generate profile and challenge
    const chosenName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Creator';
    const handle = `@${chosenName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'creator'}`;
    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: chosenName,
      photoURL: firebaseUser.photoURL || '',
      creatorHandle: handle,
      country: 'Global',
      dateOfBirth: '2000-01-01',
      niche: 'Creator Economy & Tools',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      challengeStartDate: new Date().toISOString().slice(0, 10),
    };

    localStorage.setItem(getProfileCacheKey(firebaseUser.uid), JSON.stringify(newProfile));
    const initialPosts = generateInitialPosts(newProfile.challengeStartDate);
    savePosts(initialPosts, firebaseUser.uid);
    saveMilestones(DEFAULT_MILESTONES, firebaseUser.uid);
    apiSyncUserProfile(newProfile).catch(console.warn);
    apiBatchSavePosts(firebaseUser.uid, initialPosts).catch(console.warn);

    setProfile(newProfile);
    setAuthStatus('authenticated');
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
    // Check if guest session is active
    const isGuest = localStorage.getItem('creator_toolkit_guest_session');
    if (isGuest === 'true') {
      const guestUid = localStorage.getItem('creator_toolkit_guest_uid') || 'guest_creator';
      const cached = getCachedProfile(guestUid) || {
        uid: guestUid,
        email: 'creator@local.app',
        displayName: 'Guest Creator',
        photoURL: '',
        creatorHandle: '@creator',
        country: 'Global',
        dateOfBirth: '2000-01-01',
        niche: 'Content Creation & Tech',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        challengeStartDate: new Date().toISOString().slice(0, 10),
      };
      setUser({ uid: guestUid, displayName: cached.displayName, email: cached.email } as unknown as User);
      setProfile(cached);
      setAuthStatus('authenticated');
      return;
    }

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
        const guestCheck = localStorage.getItem('creator_toolkit_guest_session');
        if (guestCheck !== 'true') {
          setUser(null);
          setProfile(null);
          setAuthStatus('unauthenticated');
        }
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const signInAsGuest = async (guestName: string = 'Guest Creator') => {
    const guestUid = 'guest_creator';
    const guestProfile: UserProfile = getCachedProfile(guestUid) || {
      uid: guestUid,
      email: 'creator@local.app',
      displayName: guestName,
      photoURL: '',
      creatorHandle: '@creator',
      country: 'Global',
      dateOfBirth: '2000-01-01',
      niche: 'Content Creation & Tech',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      challengeStartDate: new Date().toISOString().slice(0, 10),
    };
    localStorage.setItem('creator_toolkit_guest_session', 'true');
    localStorage.setItem('creator_toolkit_guest_uid', guestUid);
    localStorage.setItem(getProfileCacheKey(guestUid), JSON.stringify(guestProfile));
    setUser({ uid: guestUid, displayName: guestName, email: 'creator@local.app' } as unknown as User);
    setProfile(guestProfile);
    setAuthStatus('authenticated');
  };

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

  const signInWithApple = async () => {
    setAuthStatus('loading');
    try {
      await signInWithPopup(auth, appleProvider);
    } catch (err: any) {
      if (['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err?.code)) {
        await signInWithRedirect(auth, appleProvider);
      } else {
        setAuthStatus('unauthenticated');
        throw err;
      }
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthStatus('loading');
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await resolveUser(res.user);
    } catch (err) {
      setAuthStatus('unauthenticated');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    setAuthStatus('loading');
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const chosenName = name?.trim() || email.split('@')[0] || 'Creator';
      try {
        await updateProfile(res.user, { displayName: chosenName });
      } catch (e) {
        // ignore
      }

      const handle = `@${chosenName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'creator'}`;
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || email.trim(),
        displayName: chosenName,
        photoURL: '',
        creatorHandle: handle,
        country: 'Global',
        dateOfBirth: '2000-01-01',
        niche: 'Creator Economy & Tools',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        challengeStartDate: new Date().toISOString().slice(0, 10),
      };

      localStorage.setItem(getProfileCacheKey(res.user.uid), JSON.stringify(newProfile));
      const initialPosts = generateInitialPosts(newProfile.challengeStartDate);
      savePosts(initialPosts, res.user.uid);
      saveMilestones(DEFAULT_MILESTONES, res.user.uid);
      apiSyncUserProfile(newProfile).catch(console.warn);
      apiBatchSavePosts(res.user.uid, initialPosts).catch(console.warn);

      setUser(res.user);
      setProfile(newProfile);
      setAuthStatus('authenticated');
    } catch (err) {
      setAuthStatus('unauthenticated');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const sendPhoneOtp = async (phoneNumber: string, buttonId: string): Promise<ConfirmationResult> => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: 'invisible',
      });
    }
    const confirmation = await signInWithPhoneNumber(auth, phoneNumber.trim(), window.recaptchaVerifier);
    window.confirmationResult = confirmation;
    return confirmation;
  };

  const confirmPhoneOtp = async (confirmation: ConfirmationResult, code: string) => {
    setAuthStatus('loading');
    try {
      const res = await confirmation.confirm(code.trim());
      await resolveUser(res.user);
    } catch (err) {
      setAuthStatus('unauthenticated');
      throw err;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('creator_toolkit_guest_session');
    localStorage.removeItem('creator_toolkit_guest_uid');
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
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
        signInWithApple,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        sendPhoneOtp,
        confirmPhoneOtp,
        signInAsGuest,
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
