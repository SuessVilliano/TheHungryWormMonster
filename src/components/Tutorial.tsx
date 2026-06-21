import { useState } from 'react';

// A friendly, swipe-through tutorial for first-time players (and replayable from
// the HUD's ❓ button). Big pictures, tiny words — designed to be understood by
// a 3-year-old (with a grown-up reading along).

interface Step {
  emoji: string;
  title: string;
  text: string;
}

const STEPS: Step[] = [
  {
    emoji: '🕹️',
    title: 'Move Around',
    text: 'Drag the joystick (or use the arrow keys / WASD) to wiggle your worm!',
  },
  {
    emoji: '🍎',
    title: 'Eat Yummy Food',
    text: 'Touch fruit, snacks and glowing orbs to gobble them up and earn stars.',
  },
  {
    emoji: '💪',
    title: 'Grow BIG',
    text: 'Eat lots of food in a row to grow super big for a little while!',
  },
  {
    emoji: '🦵',
    title: 'Silly Moves',
    text: 'Tap Kick, Smash and Roar (keys 1, 2, 3) to do goofy moves. Jump too!',
  },
  {
    emoji: '🔄',
    title: 'Morph!',
    text: 'Tap Morph (or press M) to become the Bloop and splash in the pond. Earn stars to unlock more!',
  },
];

export default function Tutorial({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <div className="tut-overlay">
      <div className="tut-card">
        <div className="tut-emoji" aria-hidden>
          {s.emoji}
        </div>
        <h2>{s.title}</h2>
        <p>{s.text}</p>

        <div className="tut-dots" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={`tut-dot${i === step ? ' on' : ''}`} />
          ))}
        </div>

        <div className="tut-buttons">
          <button className="btn ghost" onClick={onDone}>
            Skip
          </button>
          {isLast ? (
            <button className="btn green big" onClick={onDone}>
              Let&apos;s Play! 🎉
            </button>
          ) : (
            <button className="btn green big" onClick={() => setStep((v) => v + 1)}>
              Next ▶
            </button>
          )}
        </div>
      </div>

      <style>{`
        .tut-overlay {
          position: absolute; inset: 0; z-index: 30;
          background: rgba(43, 33, 80, 0.5);
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .tut-card {
          background: #fff7fd; border-radius: 28px; padding: 24px;
          width: min(460px, 92vw); text-align: center;
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }
        .tut-emoji { font-size: clamp(64px, 18vw, 110px); line-height: 1; }
        .tut-card h2 { color: var(--candy-purple); margin: 10px 0 6px; font-size: 30px; }
        .tut-card p { font-weight: 700; font-size: 18px; margin: 0 0 16px; min-height: 3.2em; }
        .tut-dots { display: flex; gap: 8px; justify-content: center; margin-bottom: 18px; }
        .tut-dot { width: 12px; height: 12px; border-radius: 50%; background: #d9cff0; }
        .tut-dot.on { background: var(--candy-purple); }
        .tut-buttons { display: flex; gap: 10px; justify-content: center; align-items: center; }
      `}</style>
    </div>
  );
}
