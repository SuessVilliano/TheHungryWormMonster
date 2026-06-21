import { MORPHS } from '../game/morphs/morphData';
import type { MorphId } from '../game/types';

// A cheerful pop-up banner that celebrates unlocking a new morph.
export default function UnlockToast({ morphId }: { morphId: MorphId }) {
  const def = MORPHS[morphId];
  return (
    <div className="unlock-toast" role="status">
      <span className="unlock-emoji">{def.emoji}</span>
      <span>
        New morph unlocked: <strong>{def.name}</strong>! 🎉
      </span>
      <style>{`
        .unlock-toast {
          position: absolute; top: 110px; left: 50%; transform: translateX(-50%);
          z-index: 25; background: var(--sun-yellow); color: var(--ink);
          font-weight: 800; padding: 12px 20px; border-radius: 999px;
          box-shadow: var(--shadow); display: flex; align-items: center; gap: 10px;
          animation: pop-in 0.3s ease, float 1.4s ease-in-out 0.3s infinite;
          white-space: nowrap; font-size: clamp(14px, 3.5vw, 18px);
        }
        .unlock-emoji { font-size: 26px; }
        @keyframes pop-in {
          from { transform: translateX(-50%) scale(0.6); opacity: 0; }
          to { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -6px; }
        }
      `}</style>
    </div>
  );
}
