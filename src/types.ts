export type AppPage = 'today' | 'library' | 'rewards' | 'settings';

export interface PhotoEntry {
  id: string;
  date: string;
  image: Blob;
  note: string;
  location?: string;
  prompt?: string;
  timestamp: number;
  updatedAt: number;
  demo?: boolean;
}

export interface StoredEntry {
  id: string;
  date: string;
  image: Blob;
  note: string;
  location?: string;
  prompt?: string;
  timestamp: number;
  updatedAt: number;
  demo?: boolean;
}

export interface Challenge {
  id: string;
  prompt: string;
  category: string;
}

export interface ChallengeHistory {
  [date: string]: {
    completed: boolean;
    prompt: string;
    challengeId: string;
  };
}

export interface Settings {
  onboarded: boolean;
  demoLoaded: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
  notificationsGranted: boolean;
  timezone: string;
  locationEnabled: boolean;
  soundEnabled: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: 'streak' | 'library' | 'challenges' | 'consistency';
  requirement: number;
  icon: string;
}

export interface ToastMessage {
  id: string;
  tone: 'success' | 'error' | 'info';
  message: string;
}

export interface StreakResult {
  current: number;
  longest: number;
  totalPhotos: number;
  totalDays: number;
}