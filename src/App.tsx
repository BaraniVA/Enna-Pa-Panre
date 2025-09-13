import React, { useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import Header from './components/Header';
import MoodSelector from './components/MoodSelector';
import PostFeed from './components/PostFeed';
import StatsPanel from './components/StatsPanel';
import AuthGuard from './components/AuthGuard';
import UserProfile from './components/UserProfile';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useFirebasePosts } from './hooks/useFirebasePosts';
import { DAILY_CHALLENGES } from './constants';
import { createPost } from './services/posts';
import { checkDailyPostLimit } from './services/auth';
import { getDailyChallenge } from './utils/time';

function App() {
  const { user } = useFirebaseAuth();
  const { posts, loading, hasMore, error, loadMorePosts, handleReaction, refreshPosts } = useFirebasePosts(user?.uid || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [currentChallenge] = useState(getDailyChallenge(DAILY_CHALLENGES));

  const handlePostSubmit = useCallback(async (mood: string, text: string, isChallenge: boolean) => {
    if (!user) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Check daily post limit
      const limitCheck = await checkDailyPostLimit(user.uid);
      if (!limitCheck.canPost) {
        setSubmitError('Daily post limit reached! Try again tomorrow.');
        return;
      }

      // Create the post
      const result = await createPost(
        user.uid,
        mood,
        text,
        isChallenge,
        isChallenge ? currentChallenge.index.toString() : null
      );

      if (!result.success) {
        setSubmitError(result.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, currentChallenge]);

  return (
    <AuthGuard>
  <div className="min-h-screen bg-[#ffffff]">
        <Header 
          user={user}
          onProfileClick={() => setShowProfile(true)}
        />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <MoodSelector 
                onSubmit={handlePostSubmit}
                dailyChallenge={currentChallenge.challenge}
                isSubmitting={isSubmitting}
                error={submitError}
              />
              
              <PostFeed 
                posts={posts}
                onReaction={handleReaction}
                onRefresh={refreshPosts}
                onLoadMore={loadMorePosts}
                loading={loading}
                hasMore={hasMore}
                error={error}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <StatsPanel 
                posts={posts}
                user={user}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#fed403] text-white py-8 mt-12 rounded-t-2xl">
          <div className="container mx-auto px-4 text-center">
            <h3 className="font-bold mb-2 text-black">Enna Pa Panre</h3>
            <p className="text-black text-sm mb-4">
              Share your college vibes anonymously with your Tamil community
            </p>
            <div className="flex justify-center gap-4 text-sm text-black">
              <span>🔒 Anonymous</span>
              <span>💝 Safe Space</span>
              <span>🌟 Tamil Culture</span>
            </div>
          </div>
        </footer>

        {/* User Profile Modal */}
        {showProfile && (
          <UserProfile onClose={() => setShowProfile(false)} />
        )}
      </div>
    </AuthGuard>
  );
}

export default App;