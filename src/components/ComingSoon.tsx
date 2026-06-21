import { PRESET_EMOTES } from '../game/multiplayer/MultiplayerManager';

// Friendly placeholder for the Multiplayer Fun Mode (arrives in Version 3). The
// architecture is already in place (see game/multiplayer) — this screen just
// tells little players (and parents) what's coming and how it stays safe.
export default function ComingSoon({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen coming-soon">
      <div className="cs-emoji">👫</div>
      <h1>Multiplayer Fun Mode</h1>
      <p className="cs-sub">Coming Soon!</p>
      <p className="cs-body">
        Soon you&apos;ll play with 2–4 friends — run around, collect food, roar and
        morph together!
      </p>

      <div className="cs-card">
        <h3>Safe by design 💚</h3>
        <p>No typing or open chat — just friendly preset emotes:</p>
        <div className="cs-emotes">
          {PRESET_EMOTES.map((e) => (
            <span key={e}>{e}</span>
          ))}
        </div>
      </div>

      <button className="btn green big" onClick={onBack}>
        ⬅ Back
      </button>

      <style>{`
        .coming-soon {
          background: radial-gradient(circle at 50% 25%, #e7d9ff, #cdb8ff);
          gap: 12px; padding: 20px; text-align: center;
        }
        .cs-emoji { font-size: clamp(64px, 16vw, 120px); }
        .coming-soon h1 { color: var(--candy-purple); margin: 0; font-size: clamp(26px, 6vw, 44px); }
        .cs-sub { font-weight: 800; font-size: 22px; margin: 0; }
        .cs-body { max-width: 30ch; font-weight: 600; }
        .cs-card {
          background: rgba(255,255,255,0.85); border-radius: 22px; padding: 16px 22px;
          width: min(440px, 92vw); box-shadow: var(--shadow);
        }
        .cs-card h3 { margin: 0 0 6px; }
        .cs-emotes { font-size: 32px; display: flex; gap: 10px; justify-content: center; margin-top: 8px; }
      `}</style>
    </div>
  );
}
