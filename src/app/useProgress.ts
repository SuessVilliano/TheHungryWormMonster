import { useCallback, useState } from 'react';
import { loadProgress, saveProgress, type Progress } from '../game/progress';

// React access to saved progression. Loads once, and every update is persisted
// to localStorage so kids keep their best score, stars and unlocked morphs.
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress);

  const update = useCallback((patch: Partial<Progress>) => {
    setProgress((prev) => {
      const next = { ...prev, ...patch };
      saveProgress(next);
      return next;
    });
  }, []);

  return { progress, update };
}
