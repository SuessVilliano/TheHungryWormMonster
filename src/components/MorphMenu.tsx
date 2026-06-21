import type { MorphId } from '../game/types';
import { MORPHS, MORPH_ORDER } from '../game/morphs/morphData';

// The morph picker overlay (opened with the M key or the Morph button). Shows
// every morph as a big card; locked morphs are greyed out with a padlock so kids
// can see what's coming as they unlock them in later versions.
export default function MorphMenu({
  unlocked,
  current,
  onPick,
  onClose,
}: {
  unlocked: MorphId[];
  current: MorphId;
  onPick: (id: MorphId) => void;
  onClose: () => void;
}) {
  return (
    <div className="morph-overlay" onClick={onClose}>
      <div className="morph-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Pick a Morph!</h2>
        <div className="morph-grid">
          {MORPH_ORDER.map((id) => {
            const def = MORPHS[id];
            const isUnlocked = unlocked.includes(id);
            const isCurrent = id === current;
            return (
              <button
                key={id}
                className={`morph-card${isCurrent ? ' current' : ''}`}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onPick(id)}
              >
                <span className="morph-emoji">{isUnlocked ? def.emoji : '🔒'}</span>
                <span className="morph-name">{def.name}</span>
                <span className="morph-desc">{def.description}</span>
              </button>
            );
          })}
        </div>
        <button className="btn pink" onClick={onClose}>
          Close
        </button>
      </div>

      <style>{`
        .morph-overlay {
          position: absolute; inset: 0; z-index: 20;
          background: rgba(43, 33, 80, 0.45);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .morph-panel {
          background: #fff7fd; border-radius: 28px; padding: 20px;
          width: min(680px, 95vw); max-height: 90vh; overflow: auto;
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
          text-align: center;
        }
        .morph-panel h2 { color: var(--candy-purple); margin: 4px 0 16px; font-size: 28px; }
        .morph-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px; margin-bottom: 16px;
        }
        .morph-card {
          background: white; border-radius: 20px; padding: 14px 10px;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          box-shadow: 0 6px 0 rgba(0,0,0,0.08);
          border: 4px solid transparent;
        }
        .morph-card.current { border-color: var(--leaf-green); }
        .morph-card:disabled { opacity: 0.55; }
        .morph-emoji { font-size: 44px; }
        .morph-name { font-weight: 800; color: var(--ink); }
        .morph-desc { font-size: 12px; color: #6b6386; }
      `}</style>
    </div>
  );
}
