import * as THREE from 'three';
import type { MorphId } from '../types';
import { MORPHS } from '../morphs/morphData';

// Builds friendly, cartoon, low-poly placeholder characters out of basic
// Three.js shapes. No external 3D assets needed — everything is procedural so
// the game runs anywhere and stays tiny to download.
//
// Each builder returns a THREE.Group whose children are tagged via userData so
// the animation code can wiggle the right parts.

/** Two big googly cartoon eyes, returned as a small group. */
function makeEyes(radius: number, spread: number, forwardZ: number): THREE.Group {
  const eyes = new THREE.Group();
  const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshToonMaterial({ color: 0x222222 });

  for (const side of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16), whiteMat);
    white.position.set(side * spread, 0, forwardZ);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.5, 12, 12),
      pupilMat,
    );
    // Push the pupil slightly forward so it reads as "looking at you".
    pupil.position.set(0, 0, radius * 0.7);
    white.add(pupil);
    eyes.add(white);
  }
  return eyes;
}

/** A wide happy smile made from a thin torus arc. */
function makeSmile(radius: number, y: number, z: number): THREE.Mesh {
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(radius, radius * 0.18, 8, 24, Math.PI),
    new THREE.MeshToonMaterial({ color: 0x5a2a2a }),
  );
  // Rotate so the arc opens upward like a grin.
  smile.rotation.z = Math.PI;
  smile.position.set(0, y, z);
  return smile;
}

/** The Really Hungry Worm Monster: a stack of segments with a big goofy head. */
function buildWorm(color: number): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshToonMaterial({ color });

  const segmentCount = 5;
  for (let i = 0; i < segmentCount; i++) {
    const t = i / (segmentCount - 1);
    const size = THREE.MathUtils.lerp(0.95, 0.55, t); // head biggest, tail smallest
    const seg = new THREE.Mesh(new THREE.SphereGeometry(size, 18, 18), bodyMat);
    seg.position.set(0, size, -i * 0.85);
    seg.castShadow = true;
    seg.userData.segmentIndex = i; // used for the wiggle
    group.add(seg);

    if (i === 0) {
      // Head decorations live on the first (front) segment.
      const eyes = makeEyes(0.26, 0.34, 0.7);
      eyes.position.set(0, 0.3, 0.15);
      seg.add(eyes);
      seg.add(makeSmile(0.32, -0.1, 0.82));

      // Two little antennae for extra goofiness.
      const antennaMat = new THREE.MeshToonMaterial({ color: 0xffd166 });
      for (const side of [-1, 1]) {
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8),
          antennaMat,
        );
        stalk.position.set(side * 0.22, 0.95, 0);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), antennaMat);
        ball.position.set(0, 0.3, 0);
        stalk.add(ball);
        seg.add(stalk);
      }
    }
  }
  return group;
}

/** The Bloop: a jiggly translucent blue water blob with a happy face. */
function buildBloop(color: number): THREE.Group {
  const group = new THREE.Group();
  const blobMat = new THREE.MeshToonMaterial({
    color,
    transparent: true,
    opacity: 0.85,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), blobMat);
  body.scale.set(1, 0.85, 1);
  body.position.y = 0.8;
  body.castShadow = true;
  body.userData.segmentIndex = 0; // squish target
  group.add(body);

  const eyes = makeEyes(0.2, 0.28, 0.6);
  eyes.position.set(0, 1.0, 0.45);
  body.add(eyes);
  body.add(makeSmile(0.26, 0.0, 0.78));
  return group;
}

/** Generic friendly creature for the not-yet-detailed morphs. */
function buildGeneric(color: number): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshToonMaterial({ color });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), mat);
  body.position.y = 0.7;
  body.castShadow = true;
  body.userData.segmentIndex = 0;
  group.add(body);

  const eyes = makeEyes(0.18, 0.26, 0.5);
  eyes.position.set(0, 0.95, 0.55);
  body.add(eyes);
  body.add(makeSmile(0.22, 0.55, 0.56));
  return group;
}

/** Factory: returns a fresh character group for the given morph. */
export function buildCharacter(morphId: MorphId): THREE.Group {
  const def = MORPHS[morphId];
  switch (morphId) {
    case 'worm':
      return buildWorm(def.color);
    case 'bloop':
      return buildBloop(def.color);
    default:
      return buildGeneric(def.color);
  }
}

/**
 * Wiggle/idle animation applied each frame. Reads userData.segmentIndex so each
 * worm segment sways with an offset, giving the goofy wiggle.
 */
export function animateCharacter(
  group: THREE.Group,
  wigglePhase: number,
  moving: boolean,
  isBig: boolean,
) {
  const amp = moving ? 0.35 : 0.12;
  group.traverse((obj) => {
    const idx = obj.userData.segmentIndex;
    if (typeof idx === 'number') {
      obj.position.x = Math.sin(wigglePhase * 6 - idx * 0.8) * amp;
      obj.rotation.z = Math.sin(wigglePhase * 6 - idx * 0.8) * amp * 0.4;
    }
  });
  const grow = isBig ? 1.6 : 1;
  // Smoothly approach the target scale so growing/shrinking looks bouncy.
  group.scale.lerp(new THREE.Vector3(grow, grow, grow), 0.1);
}
