import { useEffect, useRef, useState } from 'react';
import type { GameSettings, GameStateSnapshot } from '../game/types';
import { GameEngine } from '../game/GameEngine';
import HUD from './HUD';
import MobileControls from './MobileControls';
import MorphMenu from './MorphMenu';

// Hosts a live game session: creates the GameEngine, mounts a renderer into a
// container div, wires the React UI (HUD, mobile controls, morph menu) to the
// engine, and tears everything down on exit.
export default function GameScreen({
  mode,
  settings,
  onExit,
}: {
  mode: 'adventure' | 'playground';
  settings: GameSettings;
  onExit: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [snapshot, setSnapshot] = useState<GameStateSnapshot | null>(null);
  const [morphMenuOpen, setMorphMenuOpen] = useState(false);

  // Create the engine once and start it on the container.
  useEffect(() => {
    const engine = new GameEngine();
    engineRef.current = engine;

    // The M key opens the morph menu; route it through React state.
    engine.input.attach({ onMorphMenu: () => setMorphMenuOpen((v) => !v) });

    const unsub = engine.subscribe(setSnapshot);
    if (containerRef.current) engine.start(containerRef.current, '3D');

    return () => {
      unsub();
      engine.stop();
      engineRef.current = null;
    };
  }, [mode]);

  const engine = engineRef.current;

  if (!snapshot) {
    return (
      <div className="screen" style={{ background: '#bdeaff' }}>
        <div style={{ fontSize: 64 }}>🪱</div>
        <p style={{ fontWeight: 800 }}>Loading the playground…</p>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="game-canvas" ref={containerRef} />

      <HUD
        snapshot={snapshot}
        mode={mode}
        onExit={onExit}
        onToggleMode={() => engine?.toggleRenderMode()}
        onOpenMorph={() => setMorphMenuOpen(true)}
      />

      <MobileControls
        onMove={(x, z) => engine?.setJoystick(x, z)}
        onJump={() => engine?.requestJump()}
        onAbility={(a) => engine?.useAbility(a)}
        onMorph={() => setMorphMenuOpen(true)}
      />

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

      {/* Music/sound are honored by the (Version 4) audio layer; the flags live
          in settings today so the UI is wired and parent-safe. */}
      {settings.musicOn ? null : null}

      <style>{`
        .game-screen { position: absolute; inset: 0; overflow: hidden; }
        .game-canvas { position: absolute; inset: 0; }
      `}</style>
    </div>
  );
}
