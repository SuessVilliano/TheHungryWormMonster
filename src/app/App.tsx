import { useState } from 'react';
import type { Screen } from '../game/types';
import { useSettings } from './useSettings';
import { useProgress } from './useProgress';
import TitleScreen from '../components/TitleScreen';
import GameScreen from '../components/GameScreen';
import SettingsScreen from '../components/SettingsScreen';
import ComingSoon from '../components/ComingSoon';

// Top-level app: just a friendly screen router. Adventure Mode and the Morph
// Playground both load the same world in Version 1 (the playground spawns you in
// the safe arena zone); they are separate screens so Versions 2-4 can diverge.
export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const { settings, update } = useSettings();
  const { progress, update: updateProgress } = useProgress();

  switch (screen) {
    case 'adventure':
    case 'playground':
      return (
        <GameScreen
          mode={screen}
          settings={settings}
          progress={progress}
          onProgress={updateProgress}
          onExit={() => setScreen('title')}
        />
      );
    case 'multiplayer':
      return <ComingSoon onBack={() => setScreen('title')} />;
    case 'settings':
      return (
        <SettingsScreen
          settings={settings}
          onChange={update}
          onBack={() => setScreen('title')}
        />
      );
    case 'title':
    default:
      return <TitleScreen bestScore={progress.bestScore} onNavigate={setScreen} />;
  }
}
