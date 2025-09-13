import React from 'react';
import { RefreshCw, Users, Loader2, AlertCircle } from 'lucide-react';
import { Post } from '../types';
import PostCard from './PostCard';

interface PostFeedProps {
  posts: Post[];
  onReaction: (postId: string, reactionId: string) => void;
  onRefresh: () => void;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  error?: string | null;
}

const PostFeed: React.FC<PostFeedProps> = ({ 
  posts, 
  onReaction, 
  onRefresh, 
  onLoadMore,
  loading = false,
  hasMore = false,
  error = null
}) => {
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-600 mb-2">Connection Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">Loading campus vibes...</h3>
          <p className="text-gray-500">Getting the latest moods from your community</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-600 mb-2">No moods shared yet da!</h3>
        <p className="text-gray-500 mb-4">Be the first to share how you're feeling today.</p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Campus Vibes</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-red-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            onReaction={onReaction}
            index={index}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="text-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more...
              </>
            ) : (
              <>
                Load More Posts
              </>
            )}
          </button>
        </div>
      )}

      {/* End of Feed Message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-600 text-sm">
            You've reached the end! Posts older than 7 days are automatically cleaned up.
          </p>
        </div>
      )}
    </div>
  );
};

export default PostFeed;