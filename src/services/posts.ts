import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebasePost, ReactionBatch } from '../types/firebase';
import { Post } from '../types';
import { REACTIONS } from '../constants';
import { incrementDailyPostCount } from './auth';
import { updateDailyStats } from './stats';

const POSTS_PER_PAGE = 20;
const POST_RETENTION_DAYS = parseInt(import.meta.env.VITE_POST_RETENTION_DAYS) || 7;

// Reaction batching system
let reactionBatchQueue: ReactionBatch[] = [];
let batchTimeout: NodeJS.Timeout | null = null;
const BATCH_INTERVAL = parseInt(import.meta.env.VITE_REACTION_BATCH_INTERVAL) || 30000;

/**
 * Creates a new post in Firestore
 */
export const createPost = async (
  userId: string,
  mood: string,
  text: string,
  isChallenge: boolean,
  challengeId: string | null
): Promise<{ success: boolean; error?: string }> => {
  try {
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + POST_RETENTION_DAYS * 24 * 60 * 60 * 1000)
    );

    // Initialize reactions object
    const reactions: FirebasePost['reactions'] = {};
    REACTIONS.forEach(reaction => {
      reactions[reaction.id] = {
        count: 0,
        users: []
      };
    });

    const postData: Omit<FirebasePost, 'id'> = {
      authorId: userId,
      mood,
      text: text.trim(),
      timestamp: now,
      reactions,
      isChallenge,
      challengeId,
      expiresAt
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);
    
    // Update user's post count
    await incrementDailyPostCount(userId);
    
    // Update daily stats
    await updateDailyStats(mood, isChallenge);
    
    return { success: true };
  } catch (error) {
    console.error('Error creating post:', error);
    return { 
      success: false, 
      error: 'Failed to create post. Please try again.' 
    };
  }
};

/**
 * Loads posts with pagination
 */
export const loadPosts = async (
  lastDoc?: DocumentSnapshot,
  pageSize: number = POSTS_PER_PAGE
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> => {
  try {
    let q = query(
      collection(db, 'posts'),
      orderBy('timestamp', 'desc'),
      limit(pageSize + 1) // Load one extra to check if there are more
    );

    if (lastDoc) {
      q = query(
        collection(db, 'posts'),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(pageSize + 1)
      );
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    
    // Remove the extra document if it exists
    const postsToReturn = hasMore ? docs.slice(0, -1) : docs;
    const newLastDoc = postsToReturn.length > 0 ? postsToReturn[postsToReturn.length - 1] : null;

    const posts: Post[] = postsToReturn.map(doc => {
      const data = doc.data() as FirebasePost;
      return convertFirebasePostToPost(doc.id, data);
    });

    return { posts, lastDoc: newLastDoc, hasMore };
  } catch (error) {
    console.error('Error loading posts:', error);
    return { posts: [], lastDoc: null, hasMore: false };
  }
};

/**
 * Sets up real-time listener for posts
 */
export const subscribeToRecentPosts = (
  callback: (posts: Post[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const q = query(
    collection(db, 'posts'),
    orderBy('timestamp', 'desc'),
    limit(POSTS_PER_PAGE)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const posts: Post[] = snapshot.docs.map(doc => {
        const data = doc.data() as FirebasePost;
        return convertFirebasePostToPost(doc.id, data);
      });
      callback(posts);
    },
    (error) => {
      console.error('Error in posts subscription:', error);
      onError?.(error);
    }
  );
};

/**
 * Adds a reaction to a post (batched)
 */
export const addReaction = (
  postId: string,
  reactionId: string,
  userId: string
): void => {
  // Add to batch queue
  reactionBatchQueue.push({
    postId,
    reactionId,
    userId,
    action: 'add',
    timestamp: Date.now()
  });

  // Set up batch processing if not already scheduled
  if (!batchTimeout) {
    batchTimeout = setTimeout(processBatchedReactions, BATCH_INTERVAL);
  }
};

/**
 * Removes a reaction from a post (batched)
 */
export const removeReaction = (
  postId: string,
  reactionId: string,
  userId: string
): void => {
  // Add to batch queue
  reactionBatchQueue.push({
    postId,
    reactionId,
    userId,
    action: 'remove',
    timestamp: Date.now()
  });

  // Set up batch processing if not already scheduled
  if (!batchTimeout) {
    batchTimeout = setTimeout(processBatchedReactions, BATCH_INTERVAL);
  }
};

/**
 * Processes batched reactions to minimize Firestore writes
 */
const processBatchedReactions = async (): Promise<void> => {
  if (reactionBatchQueue.length === 0) {
    batchTimeout = null;
    return;
  }

  try {
    const batch = writeBatch(db);
    const processedPosts = new Set<string>();

    // Group reactions by post
    const reactionsByPost: { [postId: string]: ReactionBatch[] } = {};
    
    reactionBatchQueue.forEach(reaction => {
      if (!reactionsByPost[reaction.postId]) {
        reactionsByPost[reaction.postId] = [];
      }
      reactionsByPost[reaction.postId].push(reaction);
    });

    // Process each post's reactions
    for (const [postId, reactions] of Object.entries(reactionsByPost)) {
      const postRef = doc(db, 'posts', postId);
      
      // Get current post data
      const postDoc = await getDocs(query(collection(db, 'posts'), where('__name__', '==', postId)));
      if (postDoc.empty) continue;
      
      const postData = postDoc.docs[0].data() as FirebasePost;
      const updatedReactions = { ...postData.reactions };

      // Apply all reactions for this post
      reactions.forEach(reaction => {
        const reactionData = updatedReactions[reaction.reactionId];
        if (!reactionData) return;

        if (reaction.action === 'add') {
          if (!reactionData.users.includes(reaction.userId)) {
            reactionData.users.push(reaction.userId);
            reactionData.count = reactionData.users.length;
          }
        } else if (reaction.action === 'remove') {
          const userIndex = reactionData.users.indexOf(reaction.userId);
          if (userIndex > -1) {
            reactionData.users.splice(userIndex, 1);
            reactionData.count = reactionData.users.length;
          }
        }
      });

      batch.update(postRef, { reactions: updatedReactions });
      processedPosts.add(postId);
    }

    // Commit the batch
    if (processedPosts.size > 0) {
      await batch.commit();
      console.log(`Processed ${reactionBatchQueue.length} reactions for ${processedPosts.size} posts`);
    }

    // Clear the queue
    reactionBatchQueue = [];
    batchTimeout = null;

  } catch (error) {
    console.error('Error processing batched reactions:', error);
    // Retry after a delay
    batchTimeout = setTimeout(processBatchedReactions, BATCH_INTERVAL);
  }
};

/**
 * Forces immediate processing of batched reactions
 */
export const flushReactionBatch = async (): Promise<void> => {
  if (batchTimeout) {
    clearTimeout(batchTimeout);
    batchTimeout = null;
  }
  await processBatchedReactions();
};

/**
 * Cleans up old posts (should be run periodically)
 */
export const cleanOldPosts = async (): Promise<number> => {
  try {
    const cutoffDate = Timestamp.fromDate(
      new Date(Date.now() - POST_RETENTION_DAYS * 24 * 60 * 60 * 1000)
    );

    const q = query(
      collection(db, 'posts'),
      where('timestamp', '<', cutoffDate),
      limit(100) // Process in batches to avoid timeout
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    if (snapshot.docs.length > 0) {
      await batch.commit();
      console.log(`Cleaned up ${snapshot.docs.length} old posts`);
    }

    return snapshot.docs.length;
  } catch (error) {
    console.error('Error cleaning old posts:', error);
    return 0;
  }
};

/**
 * Converts Firebase post to app post format
 */
const convertFirebasePostToPost = (id: string, firebasePost: FirebasePost): Post => {
  const reactions: Post['reactions'] = {};
  
  Object.entries(firebasePost.reactions).forEach(([reactionId, reactionData]) => {
    reactions[reactionId] = {
      count: reactionData.count,
      userReacted: false // This will be set by the component based on current user
    };
  });

  return {
    id,
    mood: firebasePost.mood,
    text: firebasePost.text,
    timestamp: firebasePost.timestamp.toMillis(),
    reactions,
    isChallenge: firebasePost.isChallenge,
    challengeId: firebasePost.challengeId
  };
};

/**
 * Gets user's reaction status for posts
 */
export const getUserReactionStatus = async (
  posts: Post[],
  userId: string
): Promise<Post[]> => {
  try {
    // Return early if no posts to avoid empty array in 'in' query
    if (posts.length === 0) {
      return posts;
    }
    
    const postIds = posts.map(post => post.id);
    const q = query(
      collection(db, 'posts'),
      where('__name__', 'in', postIds)
    );

    const snapshot = await getDocs(q);
    const firebasePosts: { [id: string]: FirebasePost } = {};
    
    snapshot.docs.forEach(doc => {
      firebasePosts[doc.id] = doc.data() as FirebasePost;
    });

    return posts.map(post => {
      const firebasePost = firebasePosts[post.id];
      if (!firebasePost) return post;

      const updatedReactions = { ...post.reactions };
      Object.entries(firebasePost.reactions).forEach(([reactionId, reactionData]) => {
        if (updatedReactions[reactionId]) {
          updatedReactions[reactionId].userReacted = reactionData.users.includes(userId);
        }
      });

      return { ...post, reactions: updatedReactions };
    });
  } catch (error) {
    console.error('Error getting user reaction status:', error);
    return posts;
  }
};