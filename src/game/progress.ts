import type { MorphId } from './types';
import { DEFAULT_UNLOCKED } from './morphs/morphData';

// Player progression that survives between visits (saved on-device only — no
// servers, no accounts). Tracks the best score, lifetime stars/food, and which
// morphs have been unlocked so kids keep what they earn.

const STORAGE_KEY = 'hwm.progress.v1';

export interface Progress {
  bestScore: number;
  totalStars: number; // lifetime stars earned across all sessions
  totalFoodEaten: number; // lifetime food eaten
  unlockedMorphs: MorphId[];
  tutorialSeen: boolean;
}

export const DEFAULT_PROGRESS: Progress = {
  bestScore: 0,
  totalStars: 0,
  totalFoodEaten: 0,
  unlockedMorphs: [...DEFAULT_UNLOCKED],
  tutorialSeen: false,
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Progress>;
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
        // Make sure the default morphs are always present even on old saves.
        unlockedMorphs: Array.from(
          new Set([...DEFAULT_UNLOCKED, ...(parsed.unlockedMorphs ?? [])]),
        ),
      };
    }
  } catch {
    /* fall through to defaults */
  }
  return { ...DEFAULT_PROGRESS };
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* storage might be unavailable; that's fine */
  }
}
