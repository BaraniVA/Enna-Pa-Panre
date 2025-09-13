import React, { useState } from 'react';
import GeminiBanner from '../assets/GeminiBanner.png';
import { Send, Loader2 } from 'lucide-react';
import { MOOD_OPTIONS, MAX_TEXT_LENGTH } from '../constants';
import { MoodOption } from '../types';

interface MoodSelectorProps {
  onSubmit: (mood: string, text: string, isChallenge: boolean) => void;
  dailyChallenge: string;
  isSubmitting?: boolean;
  error?: string;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSubmit, dailyChallenge, isSubmitting = false, error: externalError }) => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [isChallenge, setIsChallenge] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMood) {
      setError('Please select a mood da!');
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      setError(`Text too long da! Keep it under ${MAX_TEXT_LENGTH} characters.`);
      return;
    }

    onSubmit(selectedMood, text.trim(), isChallenge);
    
    // Reset form
    setSelectedMood('');
    setText('');
    setIsChallenge(false);
    setError('');
  };

  const getMoodButtonStyle = (mood: MoodOption, isSelected: boolean) => ({
    // Pastel bg when not selected, solid accent color when selected
    backgroundColor: isSelected ? mood.color : (mood.bg || 'transparent'),
    borderColor: isSelected ? mood.color : 'transparent',
    color: isSelected ? '#ffffff' : '#111827',
  });

  return (
    <div className="bg-white rounded-2xl p-6 mb-6 mt-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">How are you feeling da?</h2>
        <div
          className="relative rounded-lg overflow-hidden h-48 md:h-56 lg:h-64"
          style={{
            backgroundImage: `url(${GeminiBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="p-6 md:p-8 bg-[#daf837] rounded-2xl">
          <p className="text-lg md:text-xl font-semibold text-gray-800 ">
            <strong>Today's Challenge:</strong> {dailyChallenge}
          </p>
          <label className="flex items-center mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isChallenge}
              onChange={(e) => setIsChallenge(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${isChallenge ? 'bg-yellow-500 border-yellow-500' : 'border-gray-700'}`}>
              {isChallenge && <span className="text-white text-xs">✓</span>}
            </div>
            <span className="text-sm text-gray-900 ml-2">This is for today's challenge</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelectedMood(mood.id)}
              style={getMoodButtonStyle(mood, selectedMood === mood.id)}
              className={`
                p-3 rounded-xl transition-all duration-200 hover:scale-105 min-h-[56px] text-left
                ${selectedMood === mood.id ? 'shadow-lg' : 'hover:shadow-md'}
              `}
            >
              <div className="text-sm font-semibold">{mood.label}</div>
              <div className="text-xs opacity-80">{mood.description}</div>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening da? (optional)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={MAX_TEXT_LENGTH}
          />
          <div className="flex justify-between items-center mt-1">
            <span className={`text-sm ${text.length > MAX_TEXT_LENGTH * 0.8 ? 'text-red-500' : 'text-gray-500'}`}>
              {text.length}/{MAX_TEXT_LENGTH}
            </span>
          </div>
        </div>

        {(error || externalError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {externalError || error}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedMood || isSubmitting}
          className="w-full bg-[#fc3221] hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Share your mood
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MoodSelector;