import { useCallback, useEffect, useState } from 'react';
import type { GameSettings } from '../game/types';

// Tiny settings store backed by localStorage so the parent-safe options stick
// between visits. No accounts, no servers — everything stays on the device.

const STORAGE_KEY = 'hwm.settings';

const DEFAULTS: GameSettings = {
  musicOn: true,
  soundOn: true,
  reducedMotion: false,
};

function load(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* ignore — fall back to defaults */
  }
  return DEFAULTS;
}

export function useSettings() {
  const [settings, setSettings] = useState<GameSettings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage might be unavailable; that's fine */
    }
  }, [settings]);

  const update = useCallback((patch: Partial<GameSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  return { settings, update };
}
