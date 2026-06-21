import type { Screen } from '../game/types';
import { GAME_TAGLINE, GAME_TITLE } from '../game/constants';

// The colorful title screen. Big chunky buttons, a wiggling worm emoji, and the
// game's tagline. Exactly the buttons the brief asks for.
export default function TitleScreen({
  onNavigate,
}: {
  onNavigate: (screen: Screen) => void;
}) {
  return (
    <div className="screen title-screen">
      <div className="title-worm" aria-hidden>
        🪱
      </div>
      <h1 className="title-heading">{GAME_TITLE}</h1>
      <p className="title-tagline">“{GAME_TAGLINE}”</p>

      <div className="title-buttons">
        <button className="btn green big" onClick={() => onNavigate('adventure')}>
          ▶ Start Adventure
        </button>
        <button className="btn pink" onClick={() => onNavigate('playground')}>
          🥊 Morph Playground
        </button>
        <button className="btn blue" onClick={() => onNavigate('multiplayer')}>
          👫 Multiplayer Coming Soon
        </button>
        <button className="btn yellow" onClick={() => onNavigate('settings')}>
          ⚙️ Parent Settings
        </button>
      </div>

      <p className="title-footer">A safe, friendly playground for ages 3+</p>

      <style>{`
        .title-screen {
          background: radial-gradient(circle at 50% 20%, #d9f6ff 0%, #bdeaff 45%, #a6e3ff 100%);
          gap: 10px;
          padding: 20px;
          text-align: center;
        }
        .title-worm {
          font-size: clamp(64px, 18vw, 130px);
          animation: wiggle 1.6s ease-in-out infinite;
          filter: drop-shadow(0 10px 0 rgba(0,0,0,0.1));
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-8deg) translateY(0); }
          50% { transform: rotate(8deg) translateY(-10px); }
        }
        .title-heading {
          font-size: clamp(28px, 7vw, 56px);
          margin: 4px 0;
          color: var(--candy-purple);
          text-shadow: 0 4px 0 rgba(255,255,255,0.7);
          line-height: 1.05;
          max-width: 12ch;
        }
        .title-tagline {
          font-size: clamp(16px, 4vw, 26px);
          margin: 0 0 18px;
          color: var(--ink);
          font-weight: 700;
        }
        .title-buttons {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: min(420px, 90vw);
        }
        .title-footer {
          margin-top: 18px;
          font-weight: 700;
          opacity: 0.7;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
