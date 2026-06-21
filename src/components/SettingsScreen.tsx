import type { GameSettings } from '../game/types';

// Parent-safe settings. No accounts, no purchases, no chat — just simple toggles
// stored on the device. This is the "parent-safe settings" screen from the brief.
export default function SettingsScreen({
  settings,
  onChange,
  onBack,
}: {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  onBack: () => void;
}) {
  return (
    <div className="screen settings-screen">
      <h1>⚙️ Parent Settings</h1>

      <div className="settings-list">
        <Toggle
          label="🎵 Music"
          value={settings.musicOn}
          onChange={(v) => onChange({ musicOn: v })}
        />
        <Toggle
          label="🔊 Sound Effects"
          value={settings.soundOn}
          onChange={(v) => onChange({ soundOn: v })}
        />
        <Toggle
          label="🌿 Reduced Motion"
          value={settings.reducedMotion}
          onChange={(v) => onChange({ reducedMotion: v })}
        />
      </div>

      <div className="safety-card">
        <h3>👪 Made safe for ages 3+</h3>
        <ul>
          <li>No open chat — emotes only in multiplayer</li>
          <li>No purchases &amp; no ads</li>
          <li>No scary content, blood, or weapons</li>
          <li>Nothing collected leaves your device</li>
        </ul>
      </div>

      <button className="btn green big" onClick={onBack}>
        ⬅ Back
      </button>

      <style>{`
        .settings-screen {
          background: radial-gradient(circle at 50% 20%, #fff3d6, #ffe6b8);
          gap: 18px; padding: 20px; text-align: center;
        }
        .settings-screen h1 { color: var(--candy-purple); font-size: clamp(26px, 6vw, 44px); }
        .settings-list { display: flex; flex-direction: column; gap: 12px; width: min(420px, 90vw); }
        .safety-card {
          background: rgba(255,255,255,0.8); border-radius: 22px; padding: 16px 22px;
          width: min(460px, 92vw); text-align: left; box-shadow: var(--shadow);
        }
        .safety-card h3 { margin: 0 0 8px; color: var(--ink); }
        .safety-card ul { margin: 0; padding-left: 20px; font-weight: 600; }
        .safety-card li { margin: 4px 0; }
      `}</style>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      className={`btn ${value ? 'green' : 'ghost'}`}
      onClick={() => onChange(!value)}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      <span>{label}</span>
      <span>{value ? 'ON' : 'OFF'}</span>
    </button>
  );
}
