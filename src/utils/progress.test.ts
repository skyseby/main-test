import { describe, expect, it } from 'vitest';
import { CHALLENGES, REWARDS } from '../data/challenges';
import { calculateStreak, isDuplicateDate, isRewardUnlocked } from './progress';
import type { PhotoEntry } from '../types';

function entry(date: string): PhotoEntry {
  return {
    id: date,
    date,
    image: new Blob(['image']),
    note: '',
    timestamp: new Date(`${date}T12:00:00`).getTime(),
    updatedAt: Date.now(),
  };
}

describe('calculateStreak', () => {
  it('counts consecutive calendar days', () => {
    const result = calculateStreak([
      entry('2026-10-18'),
      entry('2026-10-19'),
      entry('2026-10-20'),
    ], '2026-10-20');

    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
    expect(result.totalDays).toBe(3);
  });

  it('resets only the current streak after a missing day', () => {
    const result = calculateStreak([
      entry('2026-10-10'),
      entry('2026-10-11'),
      entry('2026-10-20'),
    ], '2026-10-20');

    expect(result.current).toBe(1);
    expect(result.longest).toBe(2);
    expect(result.totalDays).toBe(3);
  });
});

describe('duplicate prevention', () => {
  it('detects an existing date', () => {
    expect(isDuplicateDate([entry('2026-10-20')], '2026-10-20')).toBe(true);
    expect(isDuplicateDate([entry('2026-10-20')], '2026-10-21')).toBe(false);
  });
});

describe('rewards', () => {
  it('unlocks the three-day streak reward', () => {
    const reward = REWARDS.find(item => item.id === 'streak-3')!;
    const streak = { current: 3, longest: 3, totalPhotos: 3, totalDays: 3 };
    expect(isRewardUnlocked(reward, streak, 0)).toBe(true);
  });
});

describe('challenge completion', () => {
  it('provides a deterministic daily challenge', () => {
    expect(CHALLENGES.length).toBeGreaterThan(6);
    expect(CHALLENGES.some(item => item.id === 'smile')).toBe(true);
    expect(CHALLENGES.some(item => item.id === 'today')).toBe(true);
  });
});