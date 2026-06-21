import { useCallback, useRef, useState } from 'react';
import type { AbilityId } from '../game/types';

// Touch-friendly on-screen controls: a draggable joystick on the left and big
// colorful action buttons on the right. They also work with a mouse so the same
// buttons serve desktop players. Pointer Events cover touch + mouse uniformly.
export default function MobileControls({
  onMove,
  onJump,
  onAbility,
  onMorph,
}: {
  onMove: (x: number, z: number) => void;
  onJump: () => void;
  onAbility: (a: AbilityId) => void;
  onMorph: () => void;
}) {
  return (
    <div className="controls">
      <Joystick onMove={onMove} />

      <div className="action-cluster">
        <div className="action-row">
          <button className="action morph" onClick={onMorph} aria-label="Morph">
            🔄
            <span>Morph</span>
          </button>
          <button className="action jump" onPointerDown={onJump} aria-label="Jump">
            ⬆️
            <span>Jump</span>
          </button>
        </div>
        <div className="action-row">
          <button
            className="action kick"
            onPointerDown={() => onAbility('kick')}
            aria-label="Kick"
          >
            🦵<span>Kick</span>
          </button>
          <button
            className="action smash"
            onPointerDown={() => onAbility('smash')}
            aria-label="Smash"
          >
            🔨<span>Smash</span>
          </button>
          <button
            className="action roar"
            onPointerDown={() => onAbility('roar')}
            aria-label="Roar"
          >
            🦁<span>Roar</span>
          </button>
        </div>
      </div>

      <style>{`
        .controls { position: absolute; inset: 0; pointer-events: none; }
        .controls > * { pointer-events: auto; }
        .action-cluster {
          position: absolute; right: 16px; bottom: 24px;
          display: flex; flex-direction: column; gap: 10px; align-items: flex-end;
        }
        .action-row { display: flex; gap: 10px; }
        .action {
          width: 78px; height: 78px; border-radius: 50%;
          font-size: 30px; color: white; font-weight: 800;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          box-shadow: var(--shadow);
          line-height: 1;
        }
        .action span { font-size: 11px; margin-top: 2px; }
        .action:active { transform: translateY(3px); }
        .action.kick { background: #ff6f6f; }
        .action.smash { background: #ffa64d; }
        .action.roar { background: #b06bff; }
        .action.jump { background: var(--leaf-green); }
        .action.morph { background: var(--sky-blue); }
        @media (max-width: 480px) {
          .action { width: 66px; height: 66px; font-size: 24px; }
        }
      `}</style>
    </div>
  );
}

/** A simple analog joystick. Reports a normalized (x, z) vector in [-1, 1]. */
function Joystick({ onMove }: { onMove: (x: number, z: number) => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const activePointer = useRef<number | null>(null);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const maxR = rect.width / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const len = Math.hypot(dx, dy);
      if (len > maxR) {
        dx = (dx / len) * maxR;
        dy = (dy / len) * maxR;
      }
      setKnob({ x: dx, y: dy });
      // dy maps to forward/back (z): up on screen = forward (negative z).
      onMove(dx / maxR, dy / maxR);
    },
    [onMove],
  );

  const reset = useCallback(() => {
    activePointer.current = null;
    setKnob({ x: 0, y: 0 });
    onMove(0, 0);
  }, [onMove]);

  return (
    <div
      ref={baseRef}
      className="joystick-base"
      onPointerDown={(e) => {
        activePointer.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        handleMove(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (activePointer.current === e.pointerId) handleMove(e.clientX, e.clientY);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div
        className="joystick-knob"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
      <style>{`
        .joystick-base {
          position: absolute; left: 20px; bottom: 28px;
          width: 130px; height: 130px; border-radius: 50%;
          background: rgba(255,255,255,0.45);
          border: 4px solid rgba(255,255,255,0.7);
          touch-action: none;
          display: flex; align-items: center; justify-content: center;
        }
        .joystick-knob {
          width: 60px; height: 60px; border-radius: 50%;
          background: var(--candy-purple);
          box-shadow: var(--shadow);
        }
        @media (max-width: 480px) {
          .joystick-base { width: 110px; height: 110px; }
          .joystick-knob { width: 52px; height: 52px; }
        }
      `}</style>
    </div>
  );
}
