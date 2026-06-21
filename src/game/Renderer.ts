import type { FoodItem, MorphId, Vec3 } from './types';

// A renderer turns the pure simulation state into something you can see.
// The 3D renderer (Three.js) and the lightweight 2D renderer both implement this
// interface, which is what makes the V / "switch 3D-2D mode" toggle painless:
// the engine just swaps one GameRenderer for another.

/** The read-only view of the world that a renderer needs to draw a frame. */
export interface SimState {
  time: number; // seconds since the game started
  dt: number; // seconds since last frame
  player: {
    position: Vec3;
    /** facing angle in radians (yaw), for turning the model */
    facing: number;
    morphId: MorphId;
    isBig: boolean;
    /** 0..1 wiggle phase used for the goofy worm wiggle animation */
    wigglePhase: number;
    /** true on the frame an ability fires, for a quick visual pop */
    abilityPulse: number; // decays 1 -> 0
  };
  food: FoodItem[];
  /** Whether the active morph is currently touching water. */
  inWater: boolean;
}

export interface GameRenderer {
  /** Attach to a DOM container and build the scene. */
  mount(container: HTMLElement): void;
  /** Tear everything down and free GPU resources. */
  unmount(): void;
  /** Draw one frame from the current simulation state. */
  sync(state: SimState): void;
  /** Respond to a container/window resize. */
  resize(): void;
}
