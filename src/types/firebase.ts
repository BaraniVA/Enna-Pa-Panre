import { Timestamp } from 'firebase/firestore';

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  lastActive: Timestamp;
  totalPosts: number;
  isActive: boolean;
  dailyPostCount: number;
  lastPostDate: string; // YYYY-MM-DD format
}

export interface FirebasePost {
  id: string;
  authorId: string;
  mood: string;
  text: string;
  timestamp: Timestamp;
  reactions: {
    [key: string]: {
      count: number;
      users: string[]; // Array of user IDs who reacted
    };
  };
  isChallenge: boolean;
  challengeId: string | null;
  expiresAt: Timestamp; // For automatic cleanup
}

export interface DailyStats {
  id: string; // Format: YYYY-MM-DD
  date: string;
  totalPosts: number;
  moodBreakdown: {
    [moodId: string]: number;
  };
  activeUsers: number;
  challengePosts: number;
  topMood: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReactionBatch {
  postId: string;
  reactionId: string;
  userId: string;
  action: 'add' | 'remove';
  timestamp: number;
}

export interface UsageStats {
  dailyReads: number;
  dailyWrites: number;
  lastReset: string; // YYYY-MM-DD format
  warningThreshold: number;
  criticalThreshold: number;
}