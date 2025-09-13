import React from 'react';
import GeminiImg from '../assets/Gemini.png';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#daf730] flex items-center justify-center">
      <div className="text-center">
        <div className="p-2 rounded-full w-28 h-28 mx-auto mb-4 flex items-center justify-center animate-pulse bg-white/30 backdrop-blur-sm overflow-hidden">
          <img src={GeminiImg} alt="Gemini mascot" className="w-24 h-24 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Enna Pa Panre</h1>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <span>Loading your campus vibes...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;