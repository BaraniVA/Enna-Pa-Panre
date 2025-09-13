import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DailyStats, UsageStats } from '../types/firebase';

/**
 * Updates daily statistics when a new post is created
 */
export const updateDailyStats = async (
  mood: string,
  isChallenge: boolean
): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const statsRef = doc(db, 'dailyStats', today);
    const statsDoc = await getDoc(statsRef);

    if (!statsDoc.exists()) {
      // Create new daily stats document
      const newStats: DailyStats = {
        id: today,
        date: today,
        totalPosts: 1,
        moodBreakdown: { [mood]: 1 },
        activeUsers: 1, // This would need to be calculated more accurately
        challengePosts: isChallenge ? 1 : 0,
        topMood: mood,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(statsRef, newStats);
    } else {
      // Update existing stats
      const currentStats = statsDoc.data() as DailyStats;
      const updatedMoodBreakdown = { ...currentStats.moodBreakdown };
      updatedMoodBreakdown[mood] = (updatedMoodBreakdown[mood] || 0) + 1;

      // Find the top mood
      const topMood = Object.entries(updatedMoodBreakdown)
        .sort(([, a], [, b]) => b - a)[0][0];

      await updateDoc(statsRef, {
        totalPosts: increment(1),
        moodBreakdown: updatedMoodBreakdown,
        challengePosts: isChallenge ? increment(1) : currentStats.challengePosts,
        topMood,
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error updating daily stats:', error);
  }
};

/**
 * Gets daily statistics for a specific date
 */
export const getDailyStats = async (date: string): Promise<DailyStats | null> => {
  try {
    const statsRef = doc(db, 'dailyStats', date);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data() as DailyStats;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting daily stats:', error);
    return null;
  }
};

/**
 * Gets statistics for the last N days
 */
export const getRecentStats = async (days: number = 7): Promise<DailyStats[]> => {
  try {
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const statsPromises = dates.map(date => getDailyStats(date));
    const results = await Promise.all(statsPromises);
    
    return results.filter(stat => stat !== null) as DailyStats[];
  } catch (error) {
    console.error('Error getting recent stats:', error);
    return [];
  }
};

/**
 * Tracks Firebase usage to stay within free tier limits
 */
export const trackUsage = async (
  operation: 'read' | 'write',
  count: number = 1
): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const usageRef = doc(db, 'usage', today);
    const usageDoc = await getDoc(usageRef);

    const dailyReadLimit = 50000; // Firebase free tier limit
    const dailyWriteLimit = 20000; // Firebase free tier limit
    const warningThreshold = 0.8; // 80% of limit
    const criticalThreshold = 0.95; // 95% of limit

    if (!usageDoc.exists()) {
      // Create new usage document
      const newUsage: UsageStats = {
        dailyReads: operation === 'read' ? count : 0,
        dailyWrites: operation === 'write' ? count : 0,
        lastReset: today,
        warningThreshold,
        criticalThreshold
      };
      
      await setDoc(usageRef, newUsage);
    } else {
      // Update existing usage
      const field = operation === 'read' ? 'dailyReads' : 'dailyWrites';
      await updateDoc(usageRef, {
        [field]: increment(count)
      });
    }

    // Check if we're approaching limits
    const updatedDoc = await getDoc(usageRef);
    if (updatedDoc.exists()) {
      const usage = updatedDoc.data() as UsageStats;
      
      const readPercentage = usage.dailyReads / dailyReadLimit;
      const writePercentage = usage.dailyWrites / dailyWriteLimit;
      
      if (readPercentage > criticalThreshold || writePercentage > criticalThreshold) {
        console.warn('CRITICAL: Approaching Firebase usage limits!', {
          reads: `${usage.dailyReads}/${dailyReadLimit} (${(readPercentage * 100).toFixed(1)}%)`,
          writes: `${usage.dailyWrites}/${dailyWriteLimit} (${(writePercentage * 100).toFixed(1)}%)`
        });
      } else if (readPercentage > warningThreshold || writePercentage > warningThreshold) {
        console.warn('WARNING: High Firebase usage detected', {
          reads: `${usage.dailyReads}/${dailyReadLimit} (${(readPercentage * 100).toFixed(1)}%)`,
          writes: `${usage.dailyWrites}/${dailyWriteLimit} (${(writePercentage * 100).toFixed(1)}%)`
        });
      }
    }
  } catch (error) {
    console.error('Error tracking usage:', error);
  }
};

/**
 * Gets current usage statistics
 */
export const getCurrentUsage = async (): Promise<UsageStats | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const usageRef = doc(db, 'usage', today);
    const usageDoc = await getDoc(usageRef);
    
    if (usageDoc.exists()) {
      return usageDoc.data() as UsageStats;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current usage:', error);
    return null;
  }
};

/**
 * Calculates active users for daily stats
 */
export const updateActiveUsersCount = async (date: string): Promise<void> => {
  try {
    // Get all posts for the day
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    
    const q = query(
      collection(db, 'posts'),
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<=', Timestamp.fromDate(endOfDay))
    );

    const snapshot = await getDocs(q);
    const uniqueUsers = new Set<string>();
    
    snapshot.docs.forEach(doc => {
      const post = doc.data();
      uniqueUsers.add(post.authorId);
    });

    // Update daily stats with active user count
    const statsRef = doc(db, 'dailyStats', date);
    await updateDoc(statsRef, {
      activeUsers: uniqueUsers.size,
      updatedAt: Timestamp.now()
    });

  } catch (error) {
    console.error('Error updating active users count:', error);
  }
};

/**
 * Gets aggregated statistics for the app
 */
export const getAggregatedStats = async (): Promise<{
  totalPosts: number;
  totalUsers: number;
  averageDailyPosts: number;
  topMoods: { mood: string; count: number }[];
}> => {
  try {
    const recentStats = await getRecentStats(30); // Last 30 days
    
    const totalPosts = recentStats.reduce((sum, stat) => sum + stat.totalPosts, 0);
    const averageDailyPosts = recentStats.length > 0 ? totalPosts / recentStats.length : 0;
    
    // Aggregate mood data
    const moodCounts: { [mood: string]: number } = {};
    recentStats.forEach(stat => {
      Object.entries(stat.moodBreakdown).forEach(([mood, count]) => {
        moodCounts[mood] = (moodCounts[mood] || 0) + count;
      });
    });
    
    const topMoods = Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get total users (this would be more accurate with a proper user count)
    const totalUsers = recentStats.reduce((max, stat) => Math.max(max, stat.activeUsers), 0);

    return {
      totalPosts,
      totalUsers,
      averageDailyPosts,
      topMoods
    };
  } catch (error) {
    console.error('Error getting aggregated stats:', error);
    return {
      totalPosts: 0,
      totalUsers: 0,
      averageDailyPosts: 0,
      topMoods: []
    };
  }
};