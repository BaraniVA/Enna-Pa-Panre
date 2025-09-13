import { useState, useEffect, useCallback } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { Post } from '../types';
import { 
  loadPosts, 
  subscribeToRecentPosts, 
  getUserReactionStatus,
  addReaction as addReactionService,
  removeReaction as removeReactionService,
  flushReactionBatch
} from '../services/posts';
import { trackUsage } from '../services/stats';

export const useFirebasePosts = (userId: string | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates for recent posts
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToRecentPosts(
      async (newPosts) => {
        try {
          // Track read operations
          await trackUsage('read', newPosts.length);
          
          // Update user reaction status
          const postsWithReactions = await getUserReactionStatus(newPosts, userId);
          setPosts(postsWithReactions);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing posts:', err);
          setError('Failed to load posts');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Posts subscription error:', err);
        setError('Connection error. Please refresh.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  // Load more posts (pagination)
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const result = await loadPosts(lastDoc || undefined);
      
      if (result.posts.length > 0 && userId) {
        const postsWithReactions = await getUserReactionStatus(result.posts, userId);
        setPosts(prev => [...prev, ...postsWithReactions]);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
        
        // Track read operations
        await trackUsage('read', result.posts.length);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more posts:', err);
      setError('Failed to load more posts');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, lastDoc, userId]);

  // Handle reactions with optimistic updates
  const handleReaction = useCallback(async (postId: string, reactionId: string) => {
    if (!userId) return;

    // Optimistic update
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const currentReaction = post.reactions[reactionId];
        const wasReacted = currentReaction?.userReacted || false;
        
        return {
          ...post,
          reactions: {
            ...post.reactions,
            [reactionId]: {
              count: wasReacted 
                ? Math.max(0, (currentReaction?.count || 0) - 1)
                : (currentReaction?.count || 0) + 1,
              userReacted: !wasReacted
            }
          }
        };
      }
      return post;
    }));

    // Add to batch queue
    const currentPost = posts.find(p => p.id === postId);
    const wasReacted = currentPost?.reactions[reactionId]?.userReacted || false;
    
    if (wasReacted) {
      removeReactionService(postId, reactionId, userId);
    } else {
      addReactionService(postId, reactionId, userId);
    }
  }, [userId, posts]);

  // Flush reaction batch on unmount
  useEffect(() => {
    return () => {
      flushReactionBatch();
    };
  }, []);

  return {
    posts,
    loading,
    hasMore,
    error,
    loadMorePosts,
    handleReaction,
    refreshPosts: () => {
      setLastDoc(null);
      setHasMore(true);
      setPosts([]);
      setLoading(true);
    }
  };
};