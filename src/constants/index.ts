import { MoodOption, Reaction } from '../types';

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'full_tension_da', label: 'Full tension da', color: '#DC2626', bg: '#FEE2E2', description: 'stressed/anxious' },
  { id: 'chill_panren', label: 'Chill panren', color: '#16A34A', bg: '#DCFCE7', description: 'relaxing/happy' },
  { id: 'family_drama_running', label: 'Family drama running', color: '#EA580C', bg: '#FFF7ED', description: 'family issues' },
  { id: 'crush_a_pathen', label: 'Crush-a pathen', color: '#EC4899', bg: '#FFE4F0', description: 'romantic excitement' },
  { id: 'canteen_la_queue', label: 'Canteen-la queue', color: '#EAB308', bg: '#FFFBEB', description: 'waiting/bored' },
  { id: 'bus_miss_aachu', label: 'Bus miss aachu', color: '#991B1B', bg: '#FEECEB', description: 'frustrated/late' },
  { id: 'professor_vera_level', label: 'Professor vera level', color: '#7C3AED', bg: '#F3E8FF', description: 'academic stress' },
  { id: 'semma_mood', label: 'Semma mood', color: '#15803D', bg: '#ECFDF5', description: 'excellent mood' },
  { id: 'mokka_feeling', label: 'Mokka feeling', color: '#6B7280', bg: '#F3F4F6', description: 'disappointed/upset' },
  { id: 'sleepy_da', label: 'Sleepy da', color: '#2563EB', bg: '#EAF2FF', description: 'tired' }
];

export const REACTIONS: Reaction[] = [
  { id: 'semma', label: 'Semma!', emoji: '🔥' },
  { id: 'same_pinch', label: 'Same pinch!', emoji: '🤝' },
  { id: 'mokka_da', label: 'Mokka da', emoji: '😒' },
  { id: 'tension_vendam_da', label: 'Tension vendam da', emoji: '🤗' },
  { id: 'gethu', label: 'Gethu!', emoji: '😎' },
  { id: 'enna_pa_idhu', label: 'Enna pa idhu?', emoji: '🤔' }
];

export const DAILY_CHALLENGES: string[] = [
  "Describe your morning in Tamil slang",
  "What's your canteen mood today?",
  "How are you handling today's lectures?",
  "Share your bus/auto experience",
  "What's your weekend plan da?",
  "Describe your hostel life in one mood",
  "How's your project submission going?",
  "What's your go-to stress buster?",
  "Share your favorite campus spot",
  "How do you feel about exams coming up?",
  "What's your current crush status?",
  "Describe your family drama in one word",
  "How's the weather affecting your mood?",
  "What's your favorite college memory?",
  "How do you feel about group studies?",
  "Describe your last-minute assignment panic",
  "What's your canteen order today?",
  "How do you feel about online classes?",
  "Share your funniest campus moment",
  "What's your go-to relaxation method?",
  "What's your favorite snack during study sessions?"
];

export const MAX_TEXT_LENGTH = 100;
export const MAX_POSTS = 50;
export const REFRESH_INTERVAL = 30000; // 30 seconds
export const DAYS_TO_KEEP_POSTS = 7;