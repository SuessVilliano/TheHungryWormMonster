import { useEffect, useRef, useState } from 'react';
import type { GameSettings, GameStateSnapshot, MorphId } from '../game/types';
import { GameEngine } from '../game/GameEngine';
import type { Progress } from '../game/progress';
import HUD from './HUD';
import MobileControls from './MobileControls';
import MorphMenu from './MorphMenu';
import Tutorial from './Tutorial';
import UnlockToast from './UnlockToast';

// Hosts a live game session: creates the GameEngine, mounts a renderer into a
// container div, wires the React UI (HUD, mobile controls, morph menu, tutorial)
// to the engine, persists progress, and tears everything down on exit.
export default function GameScreen({
  mode,
  settings,
  progress,
  onProgress,
  onExit,
}: {
  mode: 'adventure' | 'playground';
  settings: GameSettings;
  progress: Progress;
  onProgress: (patch: Partial<Progress>) => void;
  onExit: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [snapshot, setSnapshot] = useState<GameStateSnapshot | null>(null);
  const [morphMenuOpen, setMorphMenuOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(!progress.tutorialSeen);
  const [unlockToast, setUnlockToast] = useState<MorphId | null>(null);

  // Keep the latest progress in a ref so the snapshot handler can read it
  // without re-subscribing on every change.
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const lastUnlockAt = useRef(0);

  // Create the engine ONCE and start it. The container div is always rendered
  // (see below) so containerRef.current is guaranteed to exist here — this is
  // the fix for the engine never starting when a loading screen was shown first.
  useEffect(() => {
    const engine = new GameEngine(progressRef.current.unlockedMorphs);
    engineRef.current = engine;

    // The M key opens the morph menu; route it through React state.
    engine.input.attach({ onMorphMenu: () => setMorphMenuOpen((v) => !v) });

    const unsub = engine.subscribe((snap) => {
      setSnapshot(snap);

      // Persist progress as it changes (best score, lifetime stars, unlocks).
      const p = progressRef.current;
      const patch: Partial<Progress> = {};
      if (snap.score > p.bestScore) patch.bestScore = snap.score;
      if (snap.unlockedMorphs.length > p.unlockedMorphs.length) {
        patch.unlockedMorphs = snap.unlockedMorphs;
      }
      if (Object.keys(patch).length) onProgress(patch);

      // Show a celebration toast when a morph is newly unlocked this session.
      if (snap.justUnlocked && snap.justUnlockedAt !== lastUnlockAt.current) {
        lastUnlockAt.current = snap.justUnlockedAt;
        setUnlockToast(snap.justUnlocked);
        window.setTimeout(() => setUnlockToast(null), 3200);
      }
    });

    if (containerRef.current) engine.start(containerRef.current, '3D');

    return () => {
      unsub();
      engine.stop();
      engineRef.current = null;
    };
  }, [mode, onProgress]);

  const engine = engineRef.current;

  const finishTutorial = () => {
    setShowTutorial(false);
    if (!progressRef.current.tutorialSeen) onProgress({ tutorialSeen: true });
  };

  return (
    <div className="game-screen">
      {/* Always render the canvas container so the engine can mount into it. */}
      <div className="game-canvas" ref={containerRef} />

      {snapshot && (
        <>
          <HUD
            snapshot={snapshot}
            mode={mode}
            bestScore={progress.bestScore}
            onExit={onExit}
            onToggleMode={() => engine?.toggleRenderMode()}
            onOpenMorph={() => setMorphMenuOpen(true)}
            onHelp={() => setShowTutorial(true)}
          />

          <MobileControls
            onMove={(x, z) => engine?.setJoystick(x, z)}
            onJump={() => engine?.requestJump()}
            onAbility={(a) => engine?.useAbility(a)}
            onMorph={() => setMorphMenuOpen(true)}
          />

          {unlockToast && <UnlockToast morphId={unlockToast} />}

          {morphMenuOpen && (
            <MorphMenu
              unlocked={snapshot.unlockedMorphs}
              current={snapshot.morphId}
              onPick={(id) => {
                engine?.setMorph(id);
                setMorphMenuOpen(false);
              }}
              onClose={() => setMorphMenuOpen(false)}
            />
          )}
        </>
      )}

      {showTutorial && <Tutorial onDone={finishTutorial} />}

      {/* Music/sound flags live in settings; the (Version 4) audio layer reads
          them. Referenced here so the wiring is explicit and parent-safe. */}
      {settings.musicOn ? null : null}

      <style>{`
        .game-screen { position: absolute; inset: 0; overflow: hidden; background: #bdeaff; }
        .game-canvas { position: absolute; inset: 0; }
      `}</style>
    </div>
  );
}
