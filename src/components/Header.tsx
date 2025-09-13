import React from 'react';
import { Users } from 'lucide-react';
import GeminiHeader from '../assets/GeminiHeader1.png';
import GeminiAvatar from '../assets/GeminiAvatar.png';
// ImageModal removed from header — avatar enlarges only in UserProfile view
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  user: FirebaseUser | null;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onProfileClick }) => {

  return (
  <header className="bg-[#fed403] from-red-600 to-red-700 text-white shadow-lg rounded-b-2xl overflow-visible">
    <div className="container mx-auto px-4 py-10 md:py-12 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div>
              <h1 className="text-black text-2xl md:text-3xl font-bold">Enna Pa Panre</h1>
              <p className="text-black text-sm">College Mood Vibes</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm">Anonymous & Safe</span>
            </div>
            
            {user && (
              <>
                <button
                  onClick={onProfileClick}
                  className="flex items-center gap-3 px-1 py-0 rounded-full transition-colors"
                  aria-label="Open profile"
                >
                  <img
                    src={GeminiAvatar}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full object-cover drop-shadow-sm"
                  />
                </button>
              </>
            )}
          </div>
        </div>
        {/* Centered mascot overlapping header bottom */}
        <img
          src={GeminiHeader}
          alt="Gemini mascot"
          className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 h-28 md:h-32 lg:h-36 w-auto object-contain drop-shadow-2xl z-20"
        />
      </div>
    </header>
  );
};

export default Header;