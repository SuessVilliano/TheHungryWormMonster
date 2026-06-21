// Shared type definitions used across the whole game.
// Keeping these in one place means the 3D layer, the 2D layer, the UI and the
// (future) multiplayer layer all speak the same language.

/** Which renderer is currently driving the world. */
export type RenderMode = '3D' | '2D';

/** The high level screen the player is looking at. */
export type Screen =
  | 'title'
  | 'adventure'
  | 'playground'
  | 'multiplayer' // placeholder until Version 3
  | 'settings';

/** Every morph the worm monster can become. Add new ids here as morphs grow. */
export type MorphId =
  | 'worm' // the default Really Hungry Worm Monster
  | 'bloop' // cute blue water blob (Version 1)
  | 'dino' // fast runner (Version 2)
  | 'cloud' // floats slowly (Version 2)
  | 'rock' // strong smash (Version 2)
  | 'firefly'; // glows in dark areas (Version 2)

/** The three silly attacks. */
export type AbilityId = 'kick' | 'smash' | 'roar';

/** A simple 3D vector used for positions and directions. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Definition (the "stats sheet") for a morph. */
export interface MorphDefinition {
  id: MorphId;
  name: string;
  emoji: string;
  description: string;
  color: number; // hex color for the placeholder model
  moveSpeed: number; // world units per second
  jumpStrength: number;
  /** Bloop-style water survival. When true the morph needs water to live. */
  needsWater: boolean;
  /** Whether this morph is unlocked from the start. */
  unlockedByDefault: boolean;
}

/** A collectible food item in the world. */
export interface FoodItem {
  id: string;
  position: Vec3;
  kind: 'fruit' | 'snack' | 'orb';
  points: number;
  collected: boolean;
}

/** Snapshot of everything the HUD needs to draw. The engine pushes this to React. */
export interface GameStateSnapshot {
  renderMode: RenderMode;
  morphId: MorphId;
  score: number;
  foodTotal: number;
  foodCollected: number;
  /** 0..1 — only meaningful for water morphs like the Bloop. */
  lifeBar: number;
  /** True while the active morph cares about the life bar. */
  lifeBarActive: boolean;
  /** True when the worm has grown big after eating a lot. */
  isBig: boolean;
  /** Last ability that fired, for a quick on-screen flourish. */
  lastAbility: AbilityId | null;
  lastAbilityAt: number;
  /** Unlocked morph ids, so the morph menu can show locks. */
  unlockedMorphs: MorphId[];
}

/** Player-tunable settings (the parent-safe settings screen). */
export interface GameSettings {
  musicOn: boolean;
  soundOn: boolean;
  reducedMotion: boolean;
}
