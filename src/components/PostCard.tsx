import React from 'react';
import { Heart, Clock } from 'lucide-react';
import { Post } from '../types';
import { REACTIONS } from '../constants';
import { getMoodLabel, getMoodColor } from '../utils/storage';
import { formatRelativeTime } from '../utils/time';

interface PostCardProps {
  post: Post;
  onReaction: (postId: string, reactionId: string) => void;
  index: number;
}

const PostCard: React.FC<PostCardProps> = ({ post, onReaction, index }) => {
  const moodColor = getMoodColor(post.mood);
  const moodLabel = getMoodLabel(post.mood);

  // Array of pastel background colors
  const pastelColors = [
    '#E3F2FD', // Light blue
    '#E8F5E8', // Light green
    '#FFFDE7', // Light yellow
    '#FCE4EC', // Light pink
    '#F3E5F5', // Light purple
    '#FFF3E0', // Light orange
  ];

  const backgroundColor = pastelColors[index % pastelColors.length];

  const handleReactionClick = (reactionId: string) => {
    onReaction(post.id, reactionId);
  };

  const getTotalReactions = () => {
    return Object.values(post.reactions).reduce((sum, reaction) => sum + reaction.count, 0);
  };

  return (
    <div className="rounded-lg shadow-md p-4 mb-4 transition-all duration-200 hover:shadow-lg border-l-4" 
         style={{ 
           backgroundColor: backgroundColor,
           borderLeftColor: moodColor 
         }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span 
            className="px-3 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: moodColor }}
          >
            {moodLabel}
          </span>
          {post.isChallenge && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
              Challenge
            </span>
          )}
        </div>
        <div className="flex items-center text-gray-500 text-sm gap-1">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(post.timestamp)}
        </div>
      </div>

      {/* Content */}
      {post.text && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{post.text}</p>
        </div>
      )}

      {/* Reactions */}
      <div className="border-t pt-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {REACTIONS.map((reaction) => {
            const reactionData = post.reactions[reaction.id] || { count: 0, userReacted: false };
            return (
              <button
                key={reaction.id}
                onClick={() => handleReactionClick(reaction.id)}
                className={`
                  flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200
                  ${reactionData.userReacted 
                    ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-transparent'
                  }
                `}
              >
                <span>{reaction.emoji}</span>
                <span className="font-medium">{reaction.label}</span>
                {reactionData.count > 0 && (
                  <span className="bg-white rounded-full px-2 py-0.5 text-xs font-bold">
                    {reactionData.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {getTotalReactions() > 0 && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {getTotalReactions()} reactions
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;