import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { FirebaseUser } from '../types/firebase';

const ALLOWED_DOMAINS = import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS?.split(',') || [];
const INACTIVE_DAYS_LIMIT = 7;

/**
 * Validates if email domain is allowed for college students
 */
const isValidCollegeEmail = (email: string): boolean => {
  if (ALLOWED_DOMAINS.length === 0) {
    console.warn('No email domains configured. Allowing all emails for development.');
    return true;
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.some(allowedDomain => 
    domain === allowedDomain.toLowerCase()
  );
};

/**
 * Signs in user with Google and validates college email domain
 */
export const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    if (!user.email || !isValidCollegeEmail(user.email)) {
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'Please use your college email address to sign in'
      };
    }

    // Create or update user document
    await createOrUpdateUser(user);
    
    return { success: true };
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign in was cancelled' };
    }
    
    return { 
      success: false, 
      error: 'Failed to sign in. Please try again.' 
    };
  }
};

/**
 * Signs out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

/**
 * Creates or updates user document in Firestore
 */
const createOrUpdateUser = async (user: User): Promise<void> => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  const now = Timestamp.now();
  const today = new Date().toISOString().split('T')[0];
  
  if (!userDoc.exists()) {
    // Create new user
    const newUser: FirebaseUser = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || 'Anonymous Student',
      createdAt: now,
      lastActive: now,
      totalPosts: 0,
      isActive: true,
      dailyPostCount: 0,
      lastPostDate: today
    };
    
    await setDoc(userRef, newUser);
  } else {
    // Update existing user
    const userData = userDoc.data() as FirebaseUser;
    const lastActiveDate = userData.lastActive.toDate();
    const daysSinceActive = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Reset daily post count if it's a new day
    const resetDailyCount = !userData.lastPostDate || userData.lastPostDate !== today;
    
    await updateDoc(userRef, {
      lastActive: now,
      isActive: daysSinceActive <= INACTIVE_DAYS_LIMIT,
      displayName: user.displayName || userData.displayName,
      ...(resetDailyCount && { 
        dailyPostCount: 0, 
        lastPostDate: today 
      }),
      // Ensure these fields exist
      ...(userData.totalPosts === undefined && { totalPosts: 0 }),
      ...(userData.dailyPostCount === undefined && { dailyPostCount: 0 })
    });
  }
};

/**
 * Checks if user has exceeded daily post limit
 */
export const checkDailyPostLimit = async (userId: string): Promise<{ canPost: boolean; remaining: number }> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    // If user document doesn't exist, create it first
    const now = Timestamp.now();
    const today = new Date().toISOString().split('T')[0];
    const dailyLimit = parseInt(import.meta.env.VITE_DAILY_POST_LIMIT) || 10;
    
    const newUser: Partial<FirebaseUser> = {
      dailyPostCount: 0,
      lastPostDate: today,
      totalPosts: 0,
      lastActive: now,
      isActive: true
    };
    
    await updateDoc(userRef, newUser);
    return { canPost: true, remaining: dailyLimit };
  }
  
  const userData = userDoc.data() as FirebaseUser;
  const dailyLimit = parseInt(import.meta.env.VITE_DAILY_POST_LIMIT) || 10;
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize dailyPostCount if it doesn't exist
  const currentDailyCount = userData.dailyPostCount || 0;
  
  // Reset count if it's a new day
  if (!userData.lastPostDate || userData.lastPostDate !== today) {
    await updateDoc(userRef, {
      dailyPostCount: 0,
      lastPostDate: today
    });
    // Return the updated values after reset
    return { canPost: true, remaining: dailyLimit };
  }
  
  const remaining = Math.max(0, dailyLimit - currentDailyCount);
  return { 
    canPost: remaining > 0, 
    remaining 
  };
};

/**
 * Increments user's daily post count
 */
export const incrementDailyPostCount = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const userData = userDoc.data() as FirebaseUser;
    await updateDoc(userRef, {
      dailyPostCount: userData.dailyPostCount + 1,
      totalPosts: userData.totalPosts + 1,
      lastActive: Timestamp.now()
    });
  }
};

/**
 * Gets current user data from Firestore
 */
export const getCurrentUserData = async (userId: string): Promise<FirebaseUser | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as FirebaseUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Sets up auth state listener
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Cleans up inactive users (runs periodically)
 */
export const cleanupInactiveUsers = async (): Promise<void> => {
  // This would typically be implemented as a Cloud Function
  // For client-side, we just mark users as inactive during sign-in
  console.log('Inactive user cleanup should be handled by Cloud Functions');
};