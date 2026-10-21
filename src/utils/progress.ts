import { addDays, localDateKey } from './date';
import type { ChallengeHistory, PhotoEntry, Reward, Settings, StreakResult } from '../types';

export function calculateStreak(entries: PhotoEntry[], today = localDateKey()): StreakResult {
  const dates = [...new Set(entries.map(entry => entry.date))].sort();
  let longest = 0;
  let running = 0;
  let previous = '';

  dates.forEach(date => {
    running = previous && addDays(previous, 1) === date ? running + 1 : 1;
    longest = Math.max(longest, running);
    previous = date;
  });

  let current = 0;
  let cursor = dates.includes(today) ? today : addDays(today, -1);
  while (dates.includes(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return {
    current,
    longest,
    totalPhotos: entries.length,
    totalDays: dates.length,
  };
}

export function completedChallengeCount(history: ChallengeHistory): number {
  return new Set(
    Object.values(history)
      .filter(item => item.completed)
      .map(item => item.challengeId),
  ).size;
}

export function calculateXp(
  entries: PhotoEntry[],
  streak: StreakResult,
  history: ChallengeHistory,
): number {
  const photoXp = entries.length * 20;
  const challengeXp = Object.values(history).filter(item => item.completed).length * 10;
  return photoXp + challengeXp + streak.current * 5 + streak.longest * 2;
}

export function levelForXp(xp: number): { level: number; current: number; needed: number; progress: number } {
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 75)) + 1);
  const floor = Math.pow(level - 1, 2) * 75;
  const ceiling = Math.pow(level, 2) * 75;
  const current = xp - floor;
  const needed = ceiling - floor;
  return {
    level,
    current,
    needed,
    progress: Math.min(100, Math.round((current / needed) * 100)),
  };
}

export function isRewardUnlocked(
  reward: Reward,
  streak: StreakResult,
  challengeCount: number,
): boolean {
  if (reward.category === 'streak') return streak.longest >= reward.requirement;
  if (reward.category === 'challenges') return challengeCount >= reward.requirement;
  return streak.totalDays >= reward.requirement;
}

export function isDuplicateDate(entries: PhotoEntry[], date: string): boolean {
  return entries.some(entry => entry.date === date);
}

export function getChallengeForDate(
  date: string,
  history: ChallengeHistory,
  challenges: { id: string; prompt: string }[],
): string {
  if (history[date]?.prompt) return history[date].prompt;
  const hash = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return challenges[hash % challenges.length]?.prompt ?? challenges[0].prompt;
}

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  demoLoaded: false,
  reminderEnabled: false,
  reminderTime: '19:00',
  notificationsGranted: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  locationEnabled: false,
  soundEnabled: true,
};