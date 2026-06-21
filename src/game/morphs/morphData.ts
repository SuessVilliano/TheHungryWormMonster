import type { MorphDefinition, MorphId } from '../types';

// The "stats sheet" for every morph. Version 1 actively uses `worm` and `bloop`;
// the rest are defined now so Version 2's morph menu can light them up with no
// extra plumbing.
export const MORPHS: Record<MorphId, MorphDefinition> = {
  worm: {
    id: 'worm',
    name: 'Worm Monster',
    emoji: '🪱',
    description: 'The Really Hungry Worm Monster! Wiggles, eats, and roars.',
    color: 0x9be36b,
    moveSpeed: 9,
    jumpStrength: 11,
    needsWater: false,
    unlockedByDefault: true,
  },
  bloop: {
    id: 'bloop',
    name: 'The Bloop',
    emoji: '💧',
    description: 'A cute water blob. Stay near water or the life bar drains!',
    color: 0x4fc3f7,
    moveSpeed: 8,
    jumpStrength: 14, // big Splash Jump
    needsWater: true,
    unlockedByDefault: true,
  },
  dino: {
    id: 'dino',
    name: 'Tiny Dino',
    emoji: '🦖',
    description: 'A speedy little dino. Zoom zoom!',
    color: 0x7ed957,
    moveSpeed: 14,
    jumpStrength: 11,
    needsWater: false,
    unlockedByDefault: false,
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud Puff',
    emoji: '☁️',
    description: 'Floats slowly and gently through the sky.',
    color: 0xffffff,
    moveSpeed: 6,
    jumpStrength: 16,
    needsWater: false,
    unlockedByDefault: false,
  },
  rock: {
    id: 'rock',
    name: 'Rock Buddy',
    emoji: '🪨',
    description: 'Slow but super strong. Best smash in town!',
    color: 0xa98467,
    moveSpeed: 6,
    jumpStrength: 9,
    needsWater: false,
    unlockedByDefault: false,
  },
  firefly: {
    id: 'firefly',
    name: 'Firefly',
    emoji: '✨',
    description: 'Glows brightly in dark, secret caves.',
    color: 0xfff27a,
    moveSpeed: 11,
    jumpStrength: 13,
    needsWater: false,
    unlockedByDefault: false,
  },
};

/** Helper: list of morph ids unlocked when a brand-new game starts. */
export const DEFAULT_UNLOCKED: MorphId[] = (
  Object.values(MORPHS) as MorphDefinition[]
)
  .filter((m) => m.unlockedByDefault)
  .map((m) => m.id);

/** Ordered list for menus. */
export const MORPH_ORDER: MorphId[] = [
  'worm',
  'bloop',
  'dino',
  'cloud',
  'rock',
  'firefly',
];
