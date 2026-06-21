import type { GameStateSnapshot } from '../game/types';
import { MORPHS } from '../game/morphs/morphData';

// The heads-up display: score, food progress, the Bloop's water life bar, the
// current morph badge, the 3D/2D toggle and a back button. Kept lightweight and
// high-contrast so it reads well on small screens.
export default function HUD({
  snapshot,
  mode,
  bestScore,
  onExit,
  onToggleMode,
  onOpenMorph,
  onHelp,
}: {
  snapshot: GameStateSnapshot;
  mode: 'adventure' | 'playground';
  bestScore: number;
  onExit: () => void;
  onToggleMode: () => void;
  onOpenMorph: () => void;
  onHelp: () => void;
}) {
  const def = MORPHS[snapshot.morphId];

  return (
    <div className="hud">
      {/* Top-left: back + score */}
      <div className="hud-top-left">
        <button className="btn ghost hud-back" onClick={onExit} aria-label="Back to menu">
          ⬅
        </button>
        <div className="hud-pill">
          ⭐ <strong>{snapshot.score}</strong>
        </div>
        <div className="hud-pill best-pill" title="Your best score so far">
          🏆 {Math.max(bestScore, snapshot.score)}
        </div>
        <div className="hud-pill">
          🍎 {snapshot.foodCollected}/{snapshot.foodTotal}
        </div>
        {snapshot.isBig && <div className="hud-pill big-pill">BIG! 💪</div>}
      </div>

      {/* Top-right: help + mode toggle + morph badge */}
      <div className="hud-top-right">
        <button className="btn ghost" onClick={onHelp} title="How to play">
          ❓
        </button>
        <button className="btn ghost" onClick={onToggleMode} title="Switch 3D / 2D (V)">
          {snapshot.renderMode}
        </button>
        <button className="btn ghost hud-morph" onClick={onOpenMorph} title="Morph (M)">
          {def.emoji} {def.name}
        </button>
      </div>

      {/* Water life bar — only shown for water morphs like the Bloop. */}
      {snapshot.lifeBarActive && (
        <div className="hud-lifebar">
          <span className="hud-lifebar-label">💧 Stay near water!</span>
          <div className="hud-lifebar-track">
            <div
              className="hud-lifebar-fill"
              style={{
                width: `${Math.round(snapshot.lifeBar * 100)}%`,
                background:
                  snapshot.lifeBar > 0.3 ? 'var(--sky-blue)' : 'var(--candy-pink)',
              }}
            />
          </div>
        </div>
      )}

      {mode === 'playground' && (
        <div className="hud-arena-tip">Safe Arena — try Kick, Smash &amp; Roar! 🥊</div>
      )}

      <style>{`
        .hud { position: absolute; inset: 0; pointer-events: none; }
        .hud button { pointer-events: auto; }
        .hud-top-left {
          position: absolute; top: 12px; left: 12px;
          display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
          max-width: 70vw;
        }
        .hud-top-right {
          position: absolute; top: 12px; right: 12px;
          display: flex; gap: 8px; align-items: center;
        }
        .hud-back { padding: 12px 16px; font-size: 20px; }
        .hud-pill {
          background: rgba(255,255,255,0.85);
          border-radius: 999px;
          padding: 8px 14px;
          font-weight: 800;
          font-size: clamp(14px, 3.5vw, 20px);
          box-shadow: var(--shadow);
        }
        .big-pill { background: var(--sun-yellow); }
        .best-pill { background: rgba(255, 211, 78, 0.85); }
        .hud-morph { font-size: clamp(13px, 3vw, 18px); }
        .hud-lifebar {
          position: absolute; top: 64px; left: 50%; transform: translateX(-50%);
          width: min(420px, 80vw);
          background: rgba(255,255,255,0.85);
          border-radius: 999px;
          padding: 8px 14px;
          box-shadow: var(--shadow);
          text-align: center;
        }
        .hud-lifebar-label { font-weight: 800; font-size: 14px; }
        .hud-lifebar-track {
          margin-top: 6px; height: 16px; width: 100%;
          background: rgba(0,0,0,0.12); border-radius: 999px; overflow: hidden;
        }
        .hud-lifebar-fill { height: 100%; transition: width 0.1s linear; }
        .hud-arena-tip {
          position: absolute; bottom: 200px; left: 50%; transform: translateX(-50%);
          background: var(--candy-purple); color: white; font-weight: 800;
          padding: 8px 16px; border-radius: 999px; box-shadow: var(--shadow);
          font-size: 14px; white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
