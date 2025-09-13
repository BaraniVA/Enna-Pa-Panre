import React, { useState } from 'react';
import { Heart, Shield, Users, Globe, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../services/auth';

const SignInScreen: React.FC = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError('');

    const result = await signInWithGoogle();
    
    if (!result.success) {
      setError(result.error || 'Sign in failed');
    }
    
    setIsSigningIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* App Logo and Title */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Enna Pa Panre</h1>
          <p className="text-gray-600">Tamil College Mood Vibes</p>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Welcome to your campus mood community!
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Anonymous Sharing</h3>
                <p className="text-sm text-gray-600">Share your college vibes without revealing your identity</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Safe Space</h3>
                <p className="text-sm text-gray-600">College email verification ensures a trusted community</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Tamil Culture</h3>
                <p className="text-sm text-gray-600">Express yourself in familiar Tamil college slang</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with College Gmail
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>By signing in, you agree to use your college email address</p>
          <p className="mt-1">and maintain respectful community standards</p>
        </div>
      </div>
    </div>
  );
};

export default SignInScreen;