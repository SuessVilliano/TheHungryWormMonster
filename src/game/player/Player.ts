import type { MorphId, Vec3 } from '../types';
import { MORPHS } from '../morphs/morphData';
import {
  GRAVITY,
  GROUND_Y,
  POND_CENTER,
  POND_RADIUS,
  WORLD_RADIUS,
} from '../constants';

// The Player holds the pure simulation state for the character the child is
// controlling: where it is, how fast it's going, which morph it currently is,
// and its goofy wiggle phase. It has no idea how it's drawn (3D or 2D) — that's
// the renderer's job.

export class Player {
  position: Vec3 = { x: 0, y: 0, z: 8 };
  velocity: Vec3 = { x: 0, y: 0, z: 0 };
  facing = 0; // yaw in radians
  morphId: MorphId = 'worm';
  onGround = true;
  wigglePhase = 0;
  abilityPulse = 0; // 1 right after an ability, decays to 0

  /** Apply movement input and physics for one frame. */
  update(dt: number, moveX: number, moveZ: number) {
    const def = MORPHS[this.morphId];

    // Horizontal movement (camera-relative is kept simple: world-aligned).
    const speed = def.moveSpeed;
    this.velocity.x = moveX * speed;
    this.velocity.z = moveZ * speed;

    // Face the direction of travel so the eyes point where you go.
    if (Math.abs(moveX) + Math.abs(moveZ) > 0.01) {
      this.facing = Math.atan2(moveX, moveZ);
      this.wigglePhase += dt; // wiggle faster while moving
    } else {
      this.wigglePhase += dt * 0.4; // gentle idle wiggle
    }

    // Gravity + vertical motion.
    this.velocity.y -= GRAVITY * dt;

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;

    // Ground collision (forgiving flat ground).
    if (this.position.y <= GROUND_Y) {
      this.position.y = GROUND_Y;
      this.velocity.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // Keep the player inside the round world.
    const distFromCenter = Math.hypot(this.position.x, this.position.z);
    const limit = WORLD_RADIUS - 2;
    if (distFromCenter > limit) {
      const k = limit / distFromCenter;
      this.position.x *= k;
      this.position.z *= k;
    }

    // Decay the ability pop.
    if (this.abilityPulse > 0) {
      this.abilityPulse = Math.max(0, this.abilityPulse - dt * 3);
    }
  }

  jump() {
    if (!this.onGround) return;
    const def = MORPHS[this.morphId];
    this.velocity.y = def.jumpStrength;
    this.onGround = false;
  }

  /** True when the player is standing in/over the pond. */
  isInWater(): boolean {
    const d = Math.hypot(
      this.position.x - POND_CENTER.x,
      this.position.z - POND_CENTER.z,
    );
    return d <= POND_RADIUS;
  }

  setMorph(morphId: MorphId) {
    this.morphId = morphId;
    this.abilityPulse = 1; // little pop on transform
  }

  popAbility() {
    this.abilityPulse = 1;
  }
}
