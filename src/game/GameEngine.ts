import type { GameRenderer, SimState } from './Renderer';
import type {
  AbilityId,
  FoodItem,
  GameStateSnapshot,
  MorphId,
  RenderMode,
} from './types';
import {
  ABILITY_COOLDOWN,
  BIG_DURATION_SEC,
  FOOD_TO_GROW,
  LIFE_DRAIN_PER_SEC,
  LIFE_REFILL_PER_SEC,
} from './constants';
import { DEFAULT_UNLOCKED, MORPHS } from './morphs/morphData';
import { Player } from './player/Player';
import { InputManager } from './input/InputManager';
import { ThreeScene } from './three/ThreeScene';
import { Scene2D } from './babylon/Scene2D';
import {
  LocalTransport,
  type MultiplayerTransport,
} from './multiplayer/MultiplayerManager';
import { generateFood } from './world/food';

// The GameEngine is the brain. It owns the simulation, runs the animation loop,
// reads input, drives whichever renderer is active, and publishes a lightweight
// snapshot to the React UI so the HUD can stay in sync. The renderer and the
// transport are pluggable, which is what keeps the project "Version 2-4 ready".

export class GameEngine {
  readonly input = new InputManager();
  private player = new Player();
  private food: FoodItem[] = [];

  private renderer: GameRenderer | null = null;
  private renderMode: RenderMode = '3D';
  private container: HTMLElement | null = null;

  // Multiplayer-ready: single-player ships with the no-op LocalTransport.
  private transport: MultiplayerTransport = new LocalTransport();

  // Run state.
  private rafId = 0;
  private lastTime = 0;
  private elapsed = 0;
  private running = false;

  // Scoring & meters.
  private score = 0;
  private lifeBar = 1; // 0..1, used by water morphs (the Bloop)
  private bigTimer = 0;
  private foodEatenStreak = 0;
  private abilityCooldown = 0;
  private lastAbility: AbilityId | null = null;
  private lastAbilityAt = 0;
  private unlockedMorphs: MorphId[] = [...DEFAULT_UNLOCKED];

  // Snapshot pub/sub for React.
  private subscribers = new Set<(s: GameStateSnapshot) => void>();

  constructor() {
    this.food = generateFood();
  }

  // ---- lifecycle ----

  start(container: HTMLElement, mode: RenderMode = '3D') {
    this.container = container;
    this.renderMode = mode;
    this.mountRenderer();

    this.input.attach({
      onJump: () => this.player.jump(),
      onAbility: (a) => this.useAbility(a),
      onToggleMode: () => this.toggleRenderMode(),
      // onMorphMenu is handled in React (it opens the overlay).
    });

    window.addEventListener('resize', this.handleResize);

    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
    this.transport.connect().catch(() => {/* single-player: ignore */});
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.handleResize);
    this.input.detach();
    this.renderer?.unmount();
    this.renderer = null;
    this.transport.disconnect();
  }

  private mountRenderer() {
    if (!this.container) return;
    this.renderer = this.renderMode === '3D' ? new ThreeScene() : new Scene2D();
    this.renderer.mount(this.container);
    this.renderer.resize();
  }

  private handleResize = () => this.renderer?.resize();

  // ---- main loop ----

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // clamp big gaps
    this.lastTime = now;
    this.elapsed += dt;

    this.update(dt);
    this.renderer?.sync(this.buildSimState(dt));
    this.publish();

    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.input.update();
    this.player.update(dt, this.input.move.x, this.input.move.z);

    // --- Water survival (the Bloop) ---
    const def = MORPHS[this.player.morphId];
    if (def.needsWater) {
      if (this.player.isInWater()) {
        this.lifeBar = Math.min(1, this.lifeBar + LIFE_REFILL_PER_SEC * dt);
      } else {
        this.lifeBar = Math.max(0, this.lifeBar - LIFE_DRAIN_PER_SEC * dt);
      }
      // Kid-safe "fail": no scary death — the Bloop just gently turns back into
      // the worm when its life runs out.
      if (this.lifeBar <= 0) {
        this.setMorph('worm');
      }
    } else {
      // Non-water morphs keep the bar topped up so switching back feels nice.
      this.lifeBar = 1;
    }

    // --- Big timer ---
    if (this.bigTimer > 0) {
      this.bigTimer = Math.max(0, this.bigTimer - dt);
    }

    // --- Cooldown ---
    if (this.abilityCooldown > 0) {
      this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);
    }

    // --- Food pickup ---
    this.checkFoodPickups();
  }

  private checkFoodPickups() {
    const p = this.player.position;
    const reach = this.isBig() ? 2.2 : 1.4;
    for (const food of this.food) {
      if (food.collected) continue;
      const d = Math.hypot(p.x - food.position.x, p.z - food.position.z);
      if (d <= reach) {
        food.collected = true;
        this.score += food.points;
        this.foodEatenStreak += 1;
        if (this.foodEatenStreak >= FOOD_TO_GROW) {
          this.foodEatenStreak = 0;
          this.bigTimer = BIG_DURATION_SEC; // grow big!
        }
      }
    }
  }

  // ---- player actions ----

  useAbility(ability: AbilityId) {
    if (this.abilityCooldown > 0) return;
    this.abilityCooldown = ABILITY_COOLDOWN;
    this.lastAbility = ability;
    this.lastAbilityAt = this.elapsed;
    this.player.popAbility();
    // Each silly attack just plays a flourish in V1; enemies arrive in V2's
    // Morph Battle Playground. The hooks are here so behavior can be added.
    // kick / smash / roar -> (future) knock funny blobs around.
  }

  setMorph(morphId: MorphId) {
    if (!this.unlockedMorphs.includes(morphId)) return;
    this.player.setMorph(morphId);
    // Reset the life bar so a fresh Bloop starts comfortable.
    this.lifeBar = 1;
  }

  unlockMorph(morphId: MorphId) {
    if (!this.unlockedMorphs.includes(morphId)) {
      this.unlockedMorphs.push(morphId);
      this.publish();
    }
  }

  toggleRenderMode() {
    this.setRenderMode(this.renderMode === '3D' ? '2D' : '3D');
  }

  setRenderMode(mode: RenderMode) {
    if (mode === this.renderMode || !this.container) return;
    this.renderer?.unmount();
    this.renderMode = mode;
    this.mountRenderer();
    this.publish();
  }

  // ---- mobile control bridges (called by React buttons / joystick) ----

  setJoystick(x: number, z: number) {
    this.input.setJoystick(x, z);
  }

  requestJump() {
    this.player.jump();
  }

  // ---- snapshot / subscription ----

  private isBig() {
    return this.bigTimer > 0;
  }

  private buildSimState(dt: number): SimState {
    return {
      time: this.elapsed,
      dt,
      player: {
        position: this.player.position,
        facing: this.player.facing,
        morphId: this.player.morphId,
        isBig: this.isBig(),
        wigglePhase: this.player.wigglePhase,
        abilityPulse: this.player.abilityPulse,
      },
      food: this.food,
      inWater: this.player.isInWater(),
    };
  }

  getSnapshot(): GameStateSnapshot {
    const def = MORPHS[this.player.morphId];
    return {
      renderMode: this.renderMode,
      morphId: this.player.morphId,
      score: this.score,
      foodTotal: this.food.length,
      foodCollected: this.food.filter((f) => f.collected).length,
      lifeBar: this.lifeBar,
      lifeBarActive: def.needsWater,
      isBig: this.isBig(),
      lastAbility: this.lastAbility,
      lastAbilityAt: this.lastAbilityAt,
      unlockedMorphs: [...this.unlockedMorphs],
    };
  }

  subscribe(fn: (s: GameStateSnapshot) => void): () => void {
    this.subscribers.add(fn);
    fn(this.getSnapshot()); // push current state immediately
    return () => this.subscribers.delete(fn);
  }

  private publish() {
    const snap = this.getSnapshot();
    this.subscribers.forEach((fn) => fn(snap));
  }
}
