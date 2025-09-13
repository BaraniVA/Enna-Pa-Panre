import React, { useState, useEffect } from 'react';
import { LogOut, BarChart3, Calendar, Award, TrendingUp } from 'lucide-react';
import GeminiAvatar from '../assets/GeminiAvatar.png';
import ImageModal from './ImageModal';
import { auth } from '../config/firebase';
import { signOut, getCurrentUserData } from '../services/auth';
import { getCurrentUsage } from '../services/stats';
import { FirebaseUser, UsageStats } from '../types/firebase';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [userData, setUserData] = useState<FirebaseUser | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        const [user, usage] = await Promise.all([
          getCurrentUserData(auth.currentUser.uid),
          getCurrentUsage()
        ]);
        
        setUserData(user);
        setUsageStats(usage);
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'Unknown';

    // Handle Firestore Timestamp-like objects (have toDate())
    const possible = timestamp as { toDate?: unknown } | string | number | Date;
    if (possible && typeof (possible as { toDate?: unknown }).toDate === 'function') {
      const d = (possible as { toDate: () => Date }).toDate();
      return d.toLocaleDateString();
    }

    return new Date(possible as string | number | Date).toLocaleDateString();
  };

  const getDailyPostsRemaining = () => {
    if (!userData) return 0;
    const dailyLimit = parseInt(import.meta.env.VITE_DAILY_POST_LIMIT) || 10;
    return Math.max(0, dailyLimit - userData.dailyPostCount);
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min(100, (current / limit) * 100);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full">
                <img
                  src={GeminiAvatar}
                  alt="User avatar"
                  className="w-12 h-12 rounded-full object-cover drop-shadow-sm cursor-zoom-in"
                  onClick={() => setAvatarOpen(true)}
                />
                <ImageModal src={GeminiAvatar} alt="Gemini avatar" open={avatarOpen} onClose={() => setAvatarOpen(false)} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Profile</h2>
                <p className="text-red-100 text-sm">Your campus journey</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          {userData && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Account Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Display Name:</span>
                    <p className="font-medium">{userData.displayName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Member since:</span>
                    <p className="font-medium">{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Your Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">Total Posts</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{userData.totalPosts}</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Today's Posts</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{userData.dailyPostCount}</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-600 font-medium">Remaining</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{getDailyPostsRemaining()}</div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-600 font-medium">Status</span>
                    </div>
                    <div className="text-sm font-bold text-orange-900">
                      {userData.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Limit Progress */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Daily Posting Limit</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Posts today</span>
                    <span className="text-sm font-medium">
                      {userData.dailyPostCount}/{parseInt(import.meta.env.VITE_DAILY_POST_LIMIT) || 10}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(userData.dailyPostCount / (parseInt(import.meta.env.VITE_DAILY_POST_LIMIT) || 10)) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Resets daily at midnight to prevent spam and maintain quality
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Stats (if available) */}
          {usageStats && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">System Usage</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Daily Reads</span>
                    <span className="text-sm font-medium">{usageStats.dailyReads}/50,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${getUsagePercentage(usageStats.dailyReads, 50000)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Daily Writes</span>
                    <span className="text-sm font-medium">{usageStats.dailyWrites}/20,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${getUsagePercentage(usageStats.dailyWrites, 20000)}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Firebase free tier usage - resets daily
                </p>
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;