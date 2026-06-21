import type { GameRenderer, SimState } from '../Renderer';
import type { MorphId } from '../types';
import { MORPHS } from '../morphs/morphData';
import { POND_CENTER, POND_RADIUS, WORLD_RADIUS } from '../constants';

// The lightweight 2D / "simple" mode renderer.
//
// The brief lists Babylon.js as OPTIONAL for the 2D/simple mode. To keep the
// download tiny and mobile-friendly for a 3+ audience, Version 1 ships a
// dependency-free top-down Canvas2D scene that implements the SAME GameRenderer
// interface as the 3D scene. That makes the V / "switch 3D-2D" toggle a clean
// one-line swap.
//
// If you later prefer Babylon.js here, implement GameRenderer with a Babylon
// engine and register it in GameEngine — nothing else needs to change.

export class Scene2D implements GameRenderer {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private container: HTMLElement | null = null;
  private scale = 8; // pixels per world unit (recomputed on resize)

  mount(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    if (!this.container) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Fit the whole world into the smaller screen dimension.
    this.scale = Math.min(w, h) / (WORLD_RADIUS * 2.1);
  }

  /** Convert world XZ coords to screen pixels, centered on the player camera. */
  private project(
    x: number,
    z: number,
    cam: { x: number; z: number },
    w: number,
    h: number,
  ): [number, number] {
    return [w / 2 + (x - cam.x) * this.scale, h / 2 + (z - cam.z) * this.scale];
  }

  sync(state: SimState) {
    const ctx = this.ctx;
    const w = this.canvas.clientWidth || this.container!.clientWidth;
    const h = this.canvas.clientHeight || this.container!.clientHeight;
    const cam = { x: state.player.position.x, z: state.player.position.z };

    // Sky-ish background.
    ctx.fillStyle = '#bdeaff';
    ctx.fillRect(0, 0, w, h);

    // Grass disc.
    const [cx, cz] = this.project(0, 0, cam, w, h);
    ctx.fillStyle = '#8fe36b';
    ctx.beginPath();
    ctx.arc(cx, cz, WORLD_RADIUS * this.scale, 0, Math.PI * 2);
    ctx.fill();

    // Pond.
    const [px, pz] = this.project(POND_CENTER.x, POND_CENTER.z, cam, w, h);
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(px, pz, POND_RADIUS * this.scale, 0, Math.PI * 2);
    ctx.fill();

    // Food.
    for (const food of state.food) {
      if (food.collected) continue;
      const [fx, fz] = this.project(food.position.x, food.position.z, cam, w, h);
      ctx.fillStyle =
        food.kind === 'fruit' ? '#ff5d73' : food.kind === 'snack' ? '#ffc14d' : '#8be9ff';
      const r = 0.5 * this.scale;
      ctx.beginPath();
      ctx.arc(fx, fz, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player.
    this.drawPlayer(state.player.morphId, cx, cz, state, w, h, cam);
  }

  private drawPlayer(
    morphId: MorphId,
    _cx: number,
    _cz: number,
    state: SimState,
    w: number,
    h: number,
    cam: { x: number; z: number },
  ) {
    const ctx = this.ctx;
    const [sx, sy] = this.project(
      state.player.position.x,
      state.player.position.z,
      cam,
      w,
      h,
    );
    const baseR = (state.player.isBig ? 1.5 : 1) * this.scale;
    const color = '#' + MORPHS[morphId].color.toString(16).padStart(6, '0');

    // Body.
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx, sy, baseR, 0, Math.PI * 2);
    ctx.fill();

    // Two googly eyes facing the move direction.
    const fx = Math.sin(state.player.facing);
    const fz = Math.cos(state.player.facing);
    for (const side of [-0.45, 0.45]) {
      const ex = sx + fx * baseR * 0.4 - fz * baseR * side;
      const ey = sy + fz * baseR * 0.4 + fx * baseR * side;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex, ey, baseR * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(ex + fx * baseR * 0.1, ey + fz * baseR * 0.1, baseR * 0.13, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ability pop ring.
    if (state.player.abilityPulse > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${state.player.abilityPulse})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sx, sy, baseR * (1.4 + (1 - state.player.abilityPulse)), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  unmount() {
    if (this.container && this.canvas.parentElement === this.container) {
      this.container.removeChild(this.canvas);
    }
    this.container = null;
  }
}
