import * as THREE from 'three';
import type { GameRenderer, SimState } from '../Renderer';
import type { FoodItem, MorphId } from '../types';
import { COLORS } from '../constants';
import { buildWorld } from './WorldBuilder';
import { animateCharacter, buildCharacter } from './characterModels';

// The 3D renderer. Owns the Three.js scene, camera and lights, builds the world
// once, and on every `sync()` updates the character, food and camera from the
// pure simulation state. It deliberately knows nothing about input or game rules.

export class ThreeScene implements GameRenderer {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private container: HTMLElement | null = null;

  private character!: THREE.Group;
  private currentMorph: MorphId = 'worm';
  private water!: THREE.Mesh;

  // Food meshes keyed by food id so we can show/hide them as they are eaten.
  private foodMeshes = new Map<string, THREE.Mesh>();

  mount(container: HTMLElement) {
    this.container = container;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.sky);
    this.scene.fog = new THREE.Fog(COLORS.fog, 60, 130);

    this.camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      400,
    );
    this.camera.position.set(0, 12, 16);

    this.addLights();

    const world = buildWorld();
    this.scene.add(world.root);
    this.water = world.water;

    this.character = buildCharacter('worm');
    this.scene.add(this.character);
  }

  private addLights() {
    // Soft sky + ground bounce so everything looks gentle and cartoony.
    this.scene.add(new THREE.HemisphereLight(0xffffff, COLORS.grass, 0.9));

    const sun = new THREE.DirectionalLight(0xfff4d6, 1.1);
    sun.position.set(20, 40, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;
    const s = 60;
    sun.shadow.camera.left = -s;
    sun.shadow.camera.right = s;
    sun.shadow.camera.top = s;
    sun.shadow.camera.bottom = -s;
    this.scene.add(sun);
  }

  /** Lazily create a cheerful mesh for a food item. */
  private ensureFoodMesh(food: FoodItem): THREE.Mesh {
    let mesh = this.foodMeshes.get(food.id);
    if (mesh) return mesh;

    let geometry: THREE.BufferGeometry;
    let color: number;
    switch (food.kind) {
      case 'fruit':
        geometry = new THREE.SphereGeometry(0.5, 14, 14);
        color = 0xff5d73;
        break;
      case 'snack':
        geometry = new THREE.BoxGeometry(0.7, 0.5, 0.7);
        color = 0xffc14d;
        break;
      case 'orb':
      default:
        geometry = new THREE.IcosahedronGeometry(0.5, 0);
        color = 0x8be9ff;
        break;
    }
    mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshToonMaterial({
        color,
        emissive: food.kind === 'orb' ? color : 0x000000,
        emissiveIntensity: food.kind === 'orb' ? 0.6 : 0,
      }),
    );
    mesh.castShadow = true;
    mesh.position.set(food.position.x, food.position.y, food.position.z);
    this.foodMeshes.set(food.id, mesh);
    this.scene.add(mesh);
    return mesh;
  }

  sync(state: SimState) {
    // Swap the character model if the morph changed.
    if (state.player.morphId !== this.currentMorph) {
      this.scene.remove(this.character);
      disposeGroup(this.character);
      this.character = buildCharacter(state.player.morphId);
      this.scene.add(this.character);
      this.currentMorph = state.player.morphId;
    }

    // Position + face the character.
    const p = state.player.position;
    this.character.position.set(p.x, p.y, p.z);
    this.character.rotation.y = state.player.facing;
    const moving = Math.abs(p.x) + Math.abs(p.z) >= 0; // wiggle always, more when moving handled by amp
    animateCharacter(
      this.character,
      state.player.wigglePhase,
      moving,
      state.player.isBig,
    );

    // A little squash-pop when an ability fires.
    if (state.player.abilityPulse > 0) {
      const pop = 1 + state.player.abilityPulse * 0.25;
      this.character.scale.multiplyScalar(pop);
    }

    // Food: spin the uncollected, hide the eaten.
    for (const food of state.food) {
      const mesh = this.ensureFoodMesh(food);
      if (food.collected) {
        mesh.visible = false;
      } else {
        mesh.visible = true;
        mesh.rotation.y += state.dt * 2;
        // gentle bob
        mesh.position.y =
          food.position.y + Math.sin(state.time * 2 + food.position.x) * 0.15;
      }
    }

    // Ripple the pond surface.
    this.water.position.y = 0.05 + Math.sin(state.time * 2) * 0.03;

    // Chase camera: sit behind and above the player, looking at them.
    const camTarget = new THREE.Vector3(p.x, p.y + 1.5, p.z);
    const behind = new THREE.Vector3(
      p.x - Math.sin(state.player.facing) * 12,
      p.y + 9,
      p.z - Math.cos(state.player.facing) * 12,
    );
    this.camera.position.lerp(behind, 0.08);
    this.camera.lookAt(camTarget);

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  unmount() {
    this.foodMeshes.forEach((m) => disposeMesh(m));
    this.foodMeshes.clear();
    disposeGroup(this.character);
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.container = null;
  }
}

// --- tiny disposal helpers so swapping morphs/modes doesn't leak GPU memory ---

function disposeMesh(mesh: THREE.Mesh) {
  mesh.geometry.dispose();
  const mat = mesh.material;
  if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
  else mat.dispose();
  mesh.parent?.remove(mesh);
}

function disposeGroup(group: THREE.Group) {
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      const mat = obj.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    }
  });
  group.parent?.remove(group);
}
