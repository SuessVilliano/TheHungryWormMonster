// Game-wide tuning values and copy. Tweak these to rebalance the game without
// hunting through the logic files.

export const GAME_TITLE = 'The Really Hungry Worm Monster';
export const GAME_TAGLINE = 'Eat. Morph. Splash. Roar.';

/** Size of the (roughly square) playable world, in world units from center. */
export const WORLD_RADIUS = 60;

/** Where the calm water pond lives (the Bloop's happy place). */
export const POND_CENTER = { x: 22, z: -18 };
export const POND_RADIUS = 14;

/** Physics-ish constants. Friendly, floaty and forgiving for little players. */
export const GRAVITY = 28; // units / s^2
export const GROUND_Y = 0;

/** Bloop water-survival tuning. */
export const LIFE_DRAIN_PER_SEC = 0.12; // out of water
export const LIFE_REFILL_PER_SEC = 0.45; // in water

/** How much food the worm eats before it grows big, and how long big lasts. */
export const FOOD_TO_GROW = 5;
export const BIG_DURATION_SEC = 8;

/** Ability cooldowns (seconds) so buttons feel snappy but not spammy. */
export const ABILITY_COOLDOWN = 0.4;

/**
 * Progression: reach these scores to unlock new morphs. Gives little players a
 * reason to keep collecting, and the morph menu lights up as they earn each one.
 */
export const UNLOCK_THRESHOLDS: { score: number; morph: import('./types').MorphId }[] = [
  { score: 8, morph: 'dino' },
  { score: 16, morph: 'cloud' },
  { score: 26, morph: 'rock' },
  { score: 38, morph: 'firefly' },
];

/** Friendly bright palette (sky, ground, water, candy accents). */
export const COLORS = {
  sky: 0xafe9ff,
  fog: 0xcdf2ff,
  grass: 0x8fe36b,
  hill: 0x76d65a,
  water: 0x4fc3f7,
  path: 0xffe2a8,
  candyPink: 0xff9ad5,
  candyPurple: 0xc792ea,
  mushroomRed: 0xff6f6f,
  mushroomSpot: 0xfff4d6,
  cloud: 0xffffff,
} as const;
