import { useCallback, useEffect, useMemo, useState } from 'react';
import { CHALLENGES, DEMO_ENTRIES, REWARDS } from '../data/challenges';
import { addDays, localDateKey } from '../utils/date';
import {
  calculateStreak,
  calculateXp,
  completedChallengeCount,
  isRewardUnlocked,
} from '../utils/progress';
import { clearPhotos, deletePhoto, listPhotos, savePhoto } from '../utils/storage';
import type { ChallengeHistory, PhotoEntry } from '../types';

const HISTORY_KEY = 'dayframe-challenges-v1';

function readHistory(): ChallengeHistory {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}') as ChallengeHistory;
  } catch {
    return {};
  }
}

export function usePhotoLibrary() {
  const [entries, setEntries] = useState<PhotoEntry[]>([]);
  const [history, setHistory] = useState<ChallengeHistory>(readHistory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const persistHistory = useCallback((next: ChallengeHistory) => {
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setEntries(await listPhotos());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The photo library could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const streak = useMemo(() => calculateStreak(entries), [entries]);
  const xp = useMemo(() => calculateXp(entries, streak, history), [entries, streak, history]);
  const challengeCount = useMemo(() => completedChallengeCount(history), [history]);
  const rewards = useMemo(
    () => REWARDS.map(reward => ({
      ...reward,
      unlocked: isRewardUnlocked(reward, streak, challengeCount),
    })),
    [streak, challengeCount],
  );

  const save = useCallback(async (entry: PhotoEntry, prompt?: string) => {
    await savePhoto(entry);
    setEntries(current => {
      const next = current.filter(item => item.date !== entry.date);
      return [...next, { ...entry, updatedAt: Date.now() }].sort((a, b) => b.timestamp - a.timestamp);
    });

    if (prompt) {
      const challenge = CHALLENGES.find(item => item.prompt === prompt);
      persistHistory({
        ...history,
        [entry.date]: {
          completed: true,
          prompt,
          challengeId: challenge?.id ?? 'custom',
        },
      });
    }
  }, [history, persistHistory]);

  const remove = useCallback(async (date: string) => {
    await deletePhoto(date);
    setEntries(current => current.filter(item => item.date !== date));
    const next = { ...history };
    delete next[date];
    persistHistory(next);
  }, [history, persistHistory]);

  const clear = useCallback(async () => {
    await clearPhotos();
    setEntries([]);
    persistHistory({});
  }, [persistHistory]);

  const setPrompt = useCallback((date: string, prompt: string) => {
    const challenge = CHALLENGES.find(item => item.prompt === prompt);
    persistHistory({
      ...history,
      [date]: {
        completed: Boolean(history[date]?.completed),
        prompt,
        challengeId: challenge?.id ?? 'custom',
      },
    });
  }, [history, persistHistory]);

  const loadDemo = useCallback(async () => {
    const images = await Promise.all([
      makeDemoBlob('#6554c0'),
      makeDemoBlob('#197f91'),
      makeDemoBlob('#29755d'),
      makeDemoBlob('#9d6641'),
    ]);

    for (let index = 0; index < DEMO_ENTRIES.length; index += 1) {
      const demo = DEMO_ENTRIES[index];
      const date = addDays(localDateKey(), -demo.offset);
      await savePhoto({
        id: date,
        date,
        image: images[index],
        note: demo.note,
        prompt: demo.prompt,
        timestamp: Date.now() - demo.offset * 86_400_000,
        updatedAt: Date.now(),
        demo: true,
      });
    }
    await refresh();
  }, [refresh]);

  const clearDemo = useCallback(async () => {
    const demoEntries = entries.filter(entry => entry.demo);
    await Promise.all(demoEntries.map(entry => deletePhoto(entry.date)));
    await refresh();
  }, [entries, refresh]);

  return {
    entries,
    history,
    loading,
    error,
    streak,
    xp,
    challengeCount,
    rewards,
    save,
    remove,
    clear,
    setPrompt,
    loadDemo,
    clearDemo,
    refresh,
  };
}

function makeDemoBlob(color: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Demo images cannot be created.');

  const gradient = context.createLinearGradient(0, 0, 900, 1200);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, '#171720');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 900, 1200);
  context.fillStyle = 'rgba(255,255,255,.8)';
  context.beginPath();
  context.arc(620, 310, 125, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = 'rgba(255,255,255,.12)';
  context.fillRect(90, 790, 720, 210);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Demo image failed.')),
      'image/jpeg',
      0.85,
    );
  });
}