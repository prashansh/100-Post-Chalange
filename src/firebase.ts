import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const getEnv = (key: string, fallback: string = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as any)[key]) {
    return (import.meta.env as any)[key];
  }
  const proc = (globalThis as any).process;
  if (typeof proc !== 'undefined' && proc.env && proc.env[key]) {
    return proc.env[key];
  }
  return fallback;
};

const firebaseConfig = {
  apiKey:            getEnv('VITE_FIREBASE_API_KEY', 'AIzaSyAjTJM-l93h_o3-gWhEpUmH1S40zP78ehw'),
  authDomain:        getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'creatortoolkit-53489.firebaseapp.com'),
  projectId:         getEnv('VITE_FIREBASE_PROJECT_ID', 'creatortoolkit-53489'),
  storageBucket:     getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'creatortoolkit-53489.firebasestorage.app'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '759197627794'),
  appId:             getEnv('VITE_FIREBASE_APP_ID', '1:759197627794:web:ce05c294822625b755fd4b'),
  measurementId:     getEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-NGXD91W3HY'),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics (only in browser, not SSR)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Auth
export const auth = getAuth(app);

// Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Apple OAuth Provider
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Firestore
export const db = getFirestore(app);

export default app;
