import type { AbilityId, Vec3 } from '../types';

// Collects input from the keyboard and from the on-screen mobile controls and
// exposes a single tidy snapshot the engine can read every frame.
//
// Desktop:
//   WASD / Arrows  -> move
//   Space          -> jump
//   1 / 2 / 3      -> kick / smash / roar
//   M              -> open morph menu (handled by React via onMorphMenu)
//   V              -> toggle 3D/2D (handled by React via onToggleMode)

export type InputCallbacks = {
  onMorphMenu?: () => void;
  onToggleMode?: () => void;
  onAbility?: (ability: AbilityId) => void;
  onJump?: () => void;
};

export class InputManager {
  /** Movement vector in the XZ plane, each component in [-1, 1]. */
  readonly move: Vec3 = { x: 0, y: 0, z: 0 };

  private keys = new Set<string>();
  private joystick = { x: 0, z: 0 }; // set by the mobile joystick
  private callbacks: InputCallbacks = {};
  private attached = false;

  attach(callbacks: InputCallbacks = {}) {
    // Merge so multiple callers (e.g. React wiring the morph menu, then the
    // engine wiring jump/abilities) can each register handlers.
    this.callbacks = { ...this.callbacks, ...callbacks };
    if (this.attached) return;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.clearKeys);
    this.attached = true;
  }

  detach() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.clearKeys);
    this.attached = false;
    this.clearKeys();
  }

  /** Mobile joystick feeds normalized values here (-1..1). */
  setJoystick(x: number, z: number) {
    this.joystick.x = clamp(x, -1, 1);
    this.joystick.z = clamp(z, -1, 1);
  }

  /** Mobile buttons (and any caller) can trigger abilities directly. */
  fireAbility(ability: AbilityId) {
    this.callbacks.onAbility?.(ability);
  }

  fireJump() {
    this.callbacks.onJump?.();
  }

  /** Call once per frame to refresh the combined movement vector. */
  update() {
    let x = this.joystick.x;
    let z = this.joystick.z;

    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) z -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) z += 1;

    // Normalize diagonal movement so it isn't faster than straight movement.
    const len = Math.hypot(x, z);
    if (len > 1) {
      x /= len;
      z /= len;
    }
    this.move.x = x;
    this.move.z = z;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    // Avoid the page scrolling when playing.
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      e.preventDefault();
    }
    if (this.keys.has(key)) return; // ignore auto-repeat for one-shot actions
    this.keys.add(key);

    switch (key) {
      case ' ':
        this.callbacks.onJump?.();
        break;
      case '1':
        this.callbacks.onAbility?.('kick');
        break;
      case '2':
        this.callbacks.onAbility?.('smash');
        break;
      case '3':
        this.callbacks.onAbility?.('roar');
        break;
      case 'm':
        this.callbacks.onMorphMenu?.();
        break;
      case 'v':
        this.callbacks.onToggleMode?.();
        break;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  private clearKeys = () => {
    this.keys.clear();
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
