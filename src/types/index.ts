export interface Post {
  id: string;
  mood: string;
  text: string;
  timestamp: number;
  reactions: {
    [key: string]: {
      count: number;
      userReacted: boolean;
    };
  };
  isChallenge: boolean;
  challengeId: string | null;
}

export interface UserStats {
  totalPosts: number;
  mostUsedMood: string;
  daysActive: number;
  lastActive: number;
  challengesCompleted: number;
  joinDate: number;
}

export interface AppSettings {
  autoRefresh: boolean;
  notifications: boolean;
  theme: string;
}

export interface MoodOption {
  id: string;
  label: string;
  color: string;
  // Optional pastel background color to use for mood tiles
  bg?: string;
  description: string;
}

export interface Reaction {
  id: string;
  label: string;
  emoji: string;
}

export interface AppData {
  posts: Post[];
  userStats: UserStats;
  settings: AppSettings;
}