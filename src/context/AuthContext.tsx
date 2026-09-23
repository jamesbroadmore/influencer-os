import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  googleProvider,
  FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { BusinessIdentity, TaxProfile } from '../types';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface NotificationPreferences {
  emailAlerts: boolean;
  gstThresholdWarning: boolean; // Alerts when nearing $75k turnover
  basFilingReminders: boolean; // Quarterly BAS countdown
  superannuationDueAlerts: boolean; // 28th of month following quarter for 12% SG
  brandDealReminders: boolean; // Overdue invoice remittances
  weeklyFinancialDigest: boolean; // Net profit & tax escrow summary
}

export interface UserProfileData {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  themePreference: ThemeMode;
  notificationPreferences: NotificationPreferences;
  businessIdentity?: Partial<BusinessIdentity>;
  taxProfile?: Partial<TaxProfile>;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  emailAlerts: true,
  gstThresholdWarning: true,
  basFilingReminders: true,
  superannuationDueAlerts: true,
  brandDealReminders: true,
  weeklyFinancialDigest: false
};

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  theme: ThemeMode;
  notificationPreferences: NotificationPreferences;
  setTheme: (theme: ThemeMode) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  saveBusinessIdentity: (biz: BusinessIdentity, tax: TaxProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme preference with localStorage fallback
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('creatorledger_theme') as ThemeMode) || 'dark';
  });

  // Notification preferences with localStorage fallback
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem('creatorledger_notifications');
    if (saved) {
      try {
        return { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(saved) };
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });

  // Apply theme class to document
  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('creatorledger_theme', theme);
  }, [theme]);

  // Listen to system theme changes if theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

  // Fetch or initialize user document in Firestore
  const loadOrCreateUserProfile = async (firebaseUser: FirebaseUser) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfileData;
        setUserProfile(data);
        if (data.themePreference) {
          setThemeState(data.themePreference);
        }
        if (data.notificationPreferences) {
          setNotificationPreferences(data.notificationPreferences);
        }
      } else {
        const newProfile: UserProfileData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Australian Creator',
          photoURL: firebaseUser.photoURL || undefined,
          themePreference: theme,
          notificationPreferences,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      // Graceful error logging with security details
      console.warn('Could not read/create Firestore user document directly:', error);
      // Construct in-memory profile so user is not blocked
      setUserProfile({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Australian Creator',
        photoURL: firebaseUser.photoURL || undefined,
        themePreference: theme,
        notificationPreferences,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      if (currentUser) {
        await loadOrCreateUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('creatorledger_theme', newTheme);
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          themePreference: newTheme,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not update theme in Firestore:', err);
      }
    }
  };

  const updateNotificationPreferences = async (prefs: Partial<NotificationPreferences>) => {
    const updated = { ...notificationPreferences, ...prefs };
    setNotificationPreferences(updated);
    localStorage.setItem('creatorledger_notifications', JSON.stringify(updated));

    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          notificationPreferences: updated,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not update notification preferences in Firestore:', err);
      }
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      await loadOrCreateUserProfile(cred.user);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await loadOrCreateUserProfile(cred.user);
    }
  };

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user) {
      await loadOrCreateUserProfile(cred.user);
    }
  };

  const logOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const saveBusinessIdentity = async (biz: BusinessIdentity, tax: TaxProfile) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        businessIdentity: biz,
        taxProfile: tax,
        updatedAt: new Date().toISOString()
      });
      setUserProfile(prev => prev ? { ...prev, businessIdentity: biz, taxProfile: tax } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        theme,
        notificationPreferences,
        setTheme,
        updateNotificationPreferences,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        logOut,
        saveBusinessIdentity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
