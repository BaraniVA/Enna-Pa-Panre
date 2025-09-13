export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
};

export const getDailyChallenge = (challenges: string[]): { challenge: string; index: number } => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % challenges.length;
  
  return {
    challenge: challenges[index],
    index
  };
};

export const isToday = (timestamp: number): boolean => {
  const today = new Date().setHours(0, 0, 0, 0);
  const date = new Date(timestamp).setHours(0, 0, 0, 0);
  return today === date;
};