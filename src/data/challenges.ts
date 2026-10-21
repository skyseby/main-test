import type { Challenge, Reward } from '../types';

export const CHALLENGES: Challenge[] = [
  { id: 'smile', prompt: 'Show something that made you smile.', category: 'Joy' },
  { id: 'color', prompt: 'Capture your favorite color.', category: 'Color' },
  { id: 'angle', prompt: 'Photograph something from a new angle.', category: 'Perspective' },
  { id: 'surroundings', prompt: 'Take a photo of your current surroundings.', category: 'Place' },
  { id: 'detail', prompt: 'Capture a detail you would usually overlook.', category: 'Detail' },
  { id: 'today', prompt: 'Photograph something that represents today.', category: 'Meaning' },
  { id: 'light', prompt: 'Find the most interesting light of today.', category: 'Light' },
  { id: 'texture', prompt: 'Capture a texture that caught your attention.', category: 'Texture' },
  { id: 'shadow', prompt: 'Photograph a shape made by shadow.', category: 'Composition' },
  { id: 'beginning', prompt: 'Capture something that is just beginning.', category: 'Story' },
  { id: 'small', prompt: 'Photograph a small thing that made your day.', category: 'Details' },
  { id: 'movement', prompt: 'Capture movement in your day.', category: 'Motion' },
];

export const REWARDS: Reward[] = [
  { id: 'streak-3', name: 'First rhythm', description: 'Reach a 3-day streak', category: 'streak', requirement: 3, icon: 'flame' },
  { id: 'streak-7', name: 'Full week', description: 'Reach a 7-day streak', category: 'streak', requirement: 7, icon: 'calendar' },
  { id: 'streak-14', name: 'Fortnight', description: 'Reach a 14-day streak', category: 'streak', requirement: 14, icon: 'calendar' },
  { id: 'streak-30', name: 'Monthly rhythm', description: 'Reach a 30-day streak', category: 'streak', requirement: 30, icon: 'trophy' },
  { id: 'streak-100', name: 'Century frame', description: 'Reach a 100-day streak', category: 'streak', requirement: 100, icon: 'award' },
  { id: 'streak-365', name: 'Year in frames', description: 'Reach a 365-day streak', category: 'streak', requirement: 365, icon: 'crown' },
  { id: 'library-10', name: 'Growing archive', description: 'Capture 10 days', category: 'library', requirement: 10, icon: 'images' },
  { id: 'library-50', name: 'Visual diary', description: 'Capture 50 days', category: 'library', requirement: 50, icon: 'images' },
  { id: 'library-100', name: 'Living archive', description: 'Capture 100 days', category: 'library', requirement: 100, icon: 'images' },
  { id: 'challenge-5', name: 'Curious eye', description: 'Complete 5 different challenges', category: 'challenges', requirement: 5, icon: 'sparkles' },
  { id: 'challenge-10', name: 'Wide perspective', description: 'Complete 10 different challenges', category: 'challenges', requirement: 10, icon: 'sparkles' },
  { id: 'consistency-21', name: 'Steady presence', description: 'Capture on 21 unique days', category: 'consistency', requirement: 21, icon: 'medal' },
  { id: 'consistency-50', name: 'Half a century', description: 'Capture on 50 unique days', category: 'consistency', requirement: 50, icon: 'medal' },
  { id: 'consistency-100', name: 'Persistent eye', description: 'Capture on 100 unique days', category: 'consistency', requirement: 100, icon: 'medal' },
];

export const DEMO_ENTRIES = [
  { offset: 1, note: 'Morning light across the kitchen table.', prompt: 'Capture a detail you would usually overlook.' },
  { offset: 2, note: 'A quiet corner after the rain.', prompt: 'Take a photo of your current surroundings.' },
  { offset: 3, note: 'Found a tiny green leaf.', prompt: 'Show something that made you smile.' },
  { offset: 7, note: 'The city looked different in blue.', prompt: 'Capture your favorite color.' },
];