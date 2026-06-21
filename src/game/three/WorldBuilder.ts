import * as THREE from 'three';
import { COLORS, POND_CENTER, POND_RADIUS, WORLD_RADIUS } from '../constants';

// Builds the bright fantasy playground world: soft hills, a candy forest, a
// mushroom village, a water pond for the Bloop, bridges, and a safe arena zone.
// Everything is procedural low-poly so it loads instantly and stays cheerful.

export interface BuiltWorld {
  root: THREE.Group;
  /** A reference to the animated water surface so the scene can ripple it. */
  water: THREE.Mesh;
}

function candyTree(x: number, z: number): THREE.Group {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.4, 2.2, 8),
    new THREE.MeshToonMaterial({ color: 0xb5835a }),
  );
  trunk.position.y = 1.1;
  trunk.castShadow = true;
  tree.add(trunk);

  // Stacked candy-colored "cotton candy" blobs.
  const palette = [COLORS.candyPink, COLORS.candyPurple, 0x9be3ff];
  for (let i = 0; i < 3; i++) {
    const blob = new THREE.Mesh(
      new THREE.SphereGeometry(1.1 - i * 0.15, 14, 14),
      new THREE.MeshToonMaterial({ color: palette[i % palette.length] }),
    );
    blob.position.set((Math.random() - 0.5) * 0.6, 2.4 + i * 0.7, (Math.random() - 0.5) * 0.6);
    blob.castShadow = true;
    tree.add(blob);
  }
  tree.position.set(x, 0, z);
  return tree;
}

function mushroom(x: number, z: number, scale = 1): THREE.Group {
  const m = new THREE.Group();
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 1, 10),
    new THREE.MeshToonMaterial({ color: 0xfff4d6 }),
  );
  stem.position.y = 0.5;
  stem.castShadow = true;
  m.add(stem);

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshToonMaterial({ color: COLORS.mushroomRed }),
  );
  cap.position.y = 1;
  cap.castShadow = true;
  m.add(cap);

  // White polka dots on the cap.
  for (let i = 0; i < 5; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshToonMaterial({ color: COLORS.mushroomSpot }),
    );
    const a = (i / 5) * Math.PI * 2;
    dot.position.set(Math.cos(a) * 0.5, 1.2, Math.sin(a) * 0.5);
    m.add(dot);
  }
  m.position.set(x, 0, z);
  m.scale.setScalar(scale);
  return m;
}

function softHill(x: number, z: number, radius: number, height: number): THREE.Mesh {
  const hill = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshToonMaterial({ color: COLORS.hill }),
  );
  hill.scale.y = height / radius;
  hill.position.set(x, -0.2, z);
  hill.receiveShadow = true;
  return hill;
}

export function buildWorld(): BuiltWorld {
  const root = new THREE.Group();

  // --- Ground (big friendly grass disc) ---
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(WORLD_RADIUS, 64),
    new THREE.MeshToonMaterial({ color: COLORS.grass }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  // --- Water pond (the Bloop's happy place) ---
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(POND_RADIUS, 48),
    new THREE.MeshToonMaterial({
      color: COLORS.water,
      transparent: true,
      opacity: 0.85,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(POND_CENTER.x, 0.05, POND_CENTER.z);
  root.add(water);

  // Sandy ring around the pond.
  const sand = new THREE.Mesh(
    new THREE.RingGeometry(POND_RADIUS, POND_RADIUS + 2, 48),
    new THREE.MeshToonMaterial({ color: COLORS.path }),
  );
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(POND_CENTER.x, 0.04, POND_CENTER.z);
  root.add(sand);

  // --- Candy forest (cluster on the left) ---
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 12 + Math.random() * 18;
    root.add(candyTree(-25 + Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4));
  }

  // --- Mushroom village (cluster up top) ---
  for (let i = 0; i < 12; i++) {
    root.add(
      mushroom(
        -10 + (Math.random() - 0.5) * 24,
        24 + (Math.random() - 0.5) * 16,
        0.7 + Math.random() * 0.8,
      ),
    );
  }

  // --- Soft rolling hills around the edges ---
  softHillRing(root);

  // --- A simple bridge over a little gap near the pond ---
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.3, 8),
    new THREE.MeshToonMaterial({ color: 0xc98a5a }),
  );
  bridge.position.set(POND_CENTER.x - POND_RADIUS - 3, 0.4, POND_CENTER.z + 6);
  bridge.castShadow = true;
  bridge.receiveShadow = true;
  root.add(bridge);

  // --- Safe arena zone (the Morph Battle Playground) ---
  const arena = new THREE.Mesh(
    new THREE.RingGeometry(8, 9, 48),
    new THREE.MeshToonMaterial({ color: COLORS.candyPurple }),
  );
  arena.rotation.x = -Math.PI / 2;
  arena.position.set(-28, 0.06, -22);
  root.add(arena);

  return { root, water };
}

function softHillRing(root: THREE.Group) {
  const count = 8;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r = WORLD_RADIUS - 6;
    root.add(
      softHill(
        Math.cos(a) * r,
        Math.sin(a) * r,
        6 + Math.random() * 4,
        4 + Math.random() * 3,
      ),
    );
  }
}
