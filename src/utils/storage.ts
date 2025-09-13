import { Post, UserStats, AppSettings, AppData } from '../types';
import { MOOD_OPTIONS } from '../constants';

const STORAGE_KEY = 'enna_pa_panre_data';

const getDefaultUserStats = (): UserStats => ({
  totalPosts: 0,
  mostUsedMood: '',
  daysActive: 0,
  lastActive: Date.now(),
  challengesCompleted: 0,
  joinDate: Date.now()
});

const getDefaultSettings = (): AppSettings => ({
  autoRefresh: true,
  notifications: true,
  theme: 'default'
});

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        posts: parsed.posts || [],
        userStats: { ...getDefaultUserStats(), ...parsed.userStats },
        settings: { ...getDefaultSettings(), ...parsed.settings }
      };
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  
  return {
    posts: [],
    userStats: getDefaultUserStats(),
    settings: getDefaultSettings()
  };
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
    // Handle quota exceeded
    if (error instanceof DOMException && error.code === 22) {
      // Clean old posts and try again
      const cleanedData = {
        ...data,
        posts: data.posts.slice(-20) // Keep only last 20 posts
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedData));
    }
  }
};

export const generatePostId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const updateUserStats = (data: AppData, newPost?: Post): UserStats => {
  const stats = { ...data.userStats };
  
  if (newPost) {
    stats.totalPosts += 1;
    stats.lastActive = Date.now();
    
    // Update most used mood
    const moodCounts: { [key: string]: number } = {};
    [...data.posts, newPost].forEach(post => {
      moodCounts[post.mood] = (moodCounts[post.mood] || 0) + 1;
    });
    
    stats.mostUsedMood = Object.entries(moodCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';
    
    if (newPost.isChallenge) {
      stats.challengesCompleted += 1;
    }
  }
  
  // Update days active
  const today = new Date().setHours(0, 0, 0, 0);
  const lastActiveDay = new Date(stats.lastActive).setHours(0, 0, 0, 0);
  
  if (today !== lastActiveDay) {
    stats.daysActive += 1;
  }
  
  return stats;
};

export const getMoodLabel = (moodId: string): string => {
  return MOOD_OPTIONS.find(mood => mood.id === moodId)?.label || moodId;
};

export const getMoodColor = (moodId: string): string => {
  return MOOD_OPTIONS.find(mood => mood.id === moodId)?.color || '#6B7280';
};