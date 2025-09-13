import React from 'react';
import { TrendingUp, Calendar, Award, Activity } from 'lucide-react';
import { Post } from '../types';
import { User } from 'firebase/auth';
import { MOOD_OPTIONS } from '../constants';
import { getMoodLabel, getMoodColor } from '../utils/storage';
import { isToday } from '../utils/time';

interface StatsPanelProps {
  posts: Post[];
  user: User | null;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ posts, user }) => {
  const getMoodDistribution = () => {
    const distribution: { [key: string]: number } = {};
    
    posts.forEach(post => {
      distribution[post.mood] = (distribution[post.mood] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([moodId, count]) => ({
        moodId,
        label: getMoodLabel(moodId),
        color: getMoodColor(moodId),
        count,
        percentage: (count / posts.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getTodaysPosts = () => {
    return posts.filter(post => isToday(post.timestamp)).length;
  };

  const getMoodOfTheDay = () => {
    const todaysPosts = posts.filter(post => isToday(post.timestamp));
    if (todaysPosts.length === 0) return null;

    const moodCounts: { [key: string]: number } = {};
    todaysPosts.forEach(post => {
      moodCounts[post.mood] = (moodCounts[post.mood] || 0) + 1;
    });

    const topMood = Object.entries(moodCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return topMood ? {
      moodId: topMood[0],
      label: getMoodLabel(topMood[0]),
      color: getMoodColor(topMood[0]),
      count: topMood[1]
    } : null;
  };

  const moodDistribution = getMoodDistribution();
  const moodOfTheDay = getMoodOfTheDay();
  const todaysPosts = getTodaysPosts();

  return (
    <div className="bg-white p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Campus Stats</h2>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#3a9afb] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-blue-900" />
            <span className="text-sm text-blue-900 font-medium">Total Posts</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{posts.length}</div>
        </div>

        <div className="bg-[#e6fd51] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Today</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{todaysPosts}</div>
        </div>

        <div className="bg-[#b4bbfe] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-600 font-medium">Real-time</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">Live</div>
        </div>

        <div className="bg-[#fc3f36] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-900" />
            <span className="text-sm text-orange-900 font-medium">Anonymous</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">Safe</div>
        </div>
      </div>

      {/* Mood of the Day */}
      {moodOfTheDay && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Mood of the Day
          </h3>
          <div 
            className="p-4 rounded-lg text-white"
            style={{ backgroundColor: moodOfTheDay.color }}
          >
            <div className="text-xl font-bold">{moodOfTheDay.label}</div>
            <div className="opacity-90">{moodOfTheDay.count} students feeling this way</div>
          </div>
        </div>
      )}

      {/* Mood Distribution */}
      {moodDistribution.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Overall Campus Mood</h3>
          <div className="space-y-3">
            {moodDistribution.slice(0, 5).map((mood) => (
              <div key={mood.moodId} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{mood.label}</span>
                    <span className="text-sm text-gray-500">
                      {mood.count} ({mood.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: mood.color,
                        width: `${mood.percentage}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;