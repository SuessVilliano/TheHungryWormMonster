import type { FoodItem } from '../types';
import { POND_CENTER, POND_RADIUS, WORLD_RADIUS } from '../constants';

// Scatters cheerful food collectibles around the world: fruit, snacks and
// glowing orbs. Orbs are worth the most because they're the shiniest!

const KINDS: FoodItem['kind'][] = ['fruit', 'snack', 'orb'];
const POINTS: Record<FoodItem['kind'], number> = {
  fruit: 1,
  snack: 2,
  orb: 3,
};

/** Generate a fresh batch of food items for a new game. */
export function generateFood(count = 40): FoodItem[] {
  const items: FoodItem[] = [];
  let attempts = 0;
  while (items.length < count && attempts < count * 10) {
    attempts++;
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * (WORLD_RADIUS - 6);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;

    // Don't drop most food in the pond (the worm can't reach underwater easily).
    const inPond =
      Math.hypot(x - POND_CENTER.x, z - POND_CENTER.z) < POND_RADIUS - 2;
    if (inPond && Math.random() > 0.2) continue;

    const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
    items.push({
      id: `food-${items.length}`,
      position: { x, y: 0.8, z },
      kind,
      points: POINTS[kind],
      collected: false,
    });
  }
  return items;
}
