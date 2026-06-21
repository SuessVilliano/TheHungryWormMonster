# 🪱 The Really Hungry Worm Monster

> **“Eat. Morph. Splash. Roar.”**

A colorful, funny, **kid-friendly (ages 3+)** 3D web game. You play as a goofy
giant worm monster who explores a magical playground world, gobbles up food,
makes friends, morphs into silly creatures, and uses goofy attacks like **Kick**,
**Smash**, and **Roar**.

Built with **Vite + React + TypeScript + Three.js**, with a one-tap **2D simple
mode** and a **multiplayer-ready architecture** for later.

This repository currently ships **Version 1 (MVP)** and is structured so
Versions 2–4 drop in cleanly (see the [Roadmap](#-roadmap)).

---

## ✨ What's in Version 1 (MVP)

- 🎬 Colorful **title screen** — *Start Adventure*, *Morph Playground*,
  *Multiplayer Coming Soon*, *Parent Settings*
- 🌍 A bright **3D world** (Three.js): grass, water pond, candy forest,
  mushroom village, soft hills, a bridge, and a safe arena zone
- 🪱 The **Worm Monster** with googly eyes, a goofy grin, antennae, and a wiggle
- 🕹️ **Movement** with keyboard *and* an on-screen joystick
- 🍎 **Food collectibles** (fruit, snacks, glowing orbs) — eat 5 to **grow BIG!**
- 🦵🔨🦁 **Kick, Smash, Roar** buttons (and keys `1` / `2` / `3`)
- 💧 The **Bloop** morph — a cute water blob with a **water survival life bar**
  (drains away from water, refills in the pond). Splash Jump included!
- 🔄 **Morph menu** (`M`) with locked previews of upcoming morphs
- 🔁 **3D ⇆ 2D toggle** (`V`) — a lightweight 2D scene renders the same world
- 👪 **Parent-safe settings** (music, sound, reduced motion) saved on-device
- 🌐 **Multiplayer-ready** transport layer (no-op local stub today, WebSocket
  scaffold included)

### Kid-safe by design
No blood · no weapons · no scary death · no open chat · no purchases · no ads ·
bright colors · big buttons · simple instructions. Nothing you collect ever
leaves the device.

---

## 🎮 Controls

### Desktop / Keyboard
| Action | Key |
| --- | --- |
| Move | `W A S D` or Arrow keys |
| Jump | `Space` |
| Kick | `1` |
| Smash | `2` |
| Roar | `3` |
| Morph menu | `M` |
| Switch 3D / 2D | `V` |

### Mobile / Touch
- On-screen **joystick** (bottom-left) to move
- Big colorful buttons (bottom-right): **Jump, Kick, Smash, Roar, Morph**

---

## 🚀 Getting started

**Requirements:** Node.js 18+ (tested on Node 22) and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (with hot reload)
npm run dev
# open the printed URL, e.g. http://localhost:5173
# the server is also exposed on your local network so you can test on a phone

# 3. Production build
npm run build

# 4. Preview the production build locally
npm run preview
```

Type-check only: `npm run typecheck`.

---

## ▲ Deploying to Vercel

This project is a standard Vite app and deploys to Vercel with zero extra
config (a `vercel.json` is included).

### Option A — Vercel dashboard (easiest)
1. Push this repo to GitHub (see below).
2. Go to <https://vercel.com/new> and **Import** your GitHub repository.
3. Vercel auto-detects **Vite**. Confirm the defaults:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**. Done — you'll get a live URL.

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel        # follow the prompts (first run links the project)
vercel --prod # deploy to production
```

Every push to your default branch will auto-deploy a new production build, and
pull requests get preview URLs automatically.

---

## 🐙 GitHub repo setup

```bash
# from the project folder
git init                      # (already a git repo here)
git add .
git commit -m "The Really Hungry Worm Monster — Version 1 MVP"

# create an empty repo on github.com first, then:
git remote add origin https://github.com/<you>/the-really-hungry-worm-monster.git
git branch -M main
git push -u origin main
```

Then connect the repo to Vercel as described above.

---

## 🗂️ Project structure

```
the-really-hungry-worm-monster/
├── index.html               # app shell
├── vite.config.ts           # Vite config (@ alias -> /src)
├── vercel.json              # Vercel deployment config
├── public/
│   └── assets/              # art/audio drop-zone (V1 is fully procedural)
└── src/
    ├── main.tsx             # React entry point
    ├── app/
    │   ├── App.tsx          # screen router (title/adventure/playground/…)
    │   └── useSettings.ts   # parent-safe settings (localStorage)
    ├── components/          # all React UI
    │   ├── TitleScreen.tsx
    │   ├── GameScreen.tsx   # hosts the engine + UI for a play session
    │   ├── HUD.tsx          # score, food, life bar, toggles
    │   ├── MobileControls.tsx  # joystick + Kick/Smash/Roar/Jump/Morph
    │   ├── MorphMenu.tsx
    │   ├── SettingsScreen.tsx
    │   └── ComingSoon.tsx   # multiplayer placeholder
    └── game/
        ├── GameEngine.ts    # the brain: loop, rules, snapshots
        ├── Renderer.ts      # GameRenderer interface (3D & 2D implement it)
        ├── types.ts         # shared types
        ├── constants.ts     # tuning + palette + copy
        ├── input/
        │   └── InputManager.ts   # keyboard + joystick
        ├── player/
        │   └── Player.ts    # pure player simulation (physics, morph state)
        ├── morphs/
        │   └── morphData.ts # the morph "stats sheets"
        ├── world/
        │   └── food.ts      # food spawner
        ├── three/           # 3D mode (Three.js)
        │   ├── ThreeScene.ts
        │   ├── WorldBuilder.ts
        │   └── characterModels.ts
        ├── babylon/         # simple 2D mode (lightweight Canvas2D)
        │   └── Scene2D.ts
        └── multiplayer/     # multiplayer-ready transport layer
            └── MultiplayerManager.ts
```

### How it fits together (architecture)

```
            React UI (HUD, controls, menus)
                     ▲   │ user actions
          snapshots  │   ▼
                 ┌──────────────┐      reads input from
                 │  GameEngine  │◄──────  InputManager (keys + joystick)
                 │  (the brain) │
                 └──────┬───────┘
              sync()    │   owns          ┌─────────────┐
            SimState    ▼                 │   Player    │ (pure simulation)
                 ┌──────────────┐         └─────────────┘
                 │ GameRenderer │  ◄── ThreeScene (3D)  /  Scene2D (2D)
                 └──────────────┘
```

The engine runs the simulation and publishes a tiny **snapshot** to React for
the HUD. Each frame it hands a read-only **SimState** to whichever renderer is
active. Swapping 3D ⇆ 2D — or, later, plugging in real multiplayer — is just
swapping an implementation behind an interface. That's what keeps Versions 2–4
low-friction.

---

## 🧪 Why these tech choices

- **Vite + React + TypeScript** — fast dev loop, tiny config, type safety, and
  a trivial Vercel deploy.
- **Three.js** for 3D — the most widely-used web 3D engine.
- **Lightweight Canvas2D** for the *simple/2D* mode — the brief lists Babylon.js
  as *optional* here; a dependency-free 2D renderer keeps downloads tiny for
  little kids on phones. It lives in `src/game/babylon/` and implements the same
  `GameRenderer` interface, so you can swap in Babylon.js later with no other
  changes.

---

## 🗺️ Roadmap

**✅ Version 1 — MVP (this release)**
Single-player · 3D world · worm movement · food · Kick/Smash/Roar · Bloop morph
with water life bar · 2D toggle · multiplayer-ready scaffolding.

**🔜 Version 2 — Playground**
- Activate all morphs (Tiny Dino, Cloud Puff, Rock Buddy, Firefly)
- Friendly NPCs to find and chat-bubble with
- Sticker & star rewards
- Polished 2D mode

**🔜 Version 3 — Multiplayer**
- 2–4 players, preset names, **emotes only** (no chat)
- Multiplayer arena
- Real WebSocket server (scaffold in `multiplayer/MultiplayerManager.ts`)

**🔜 Version 4 — Polished Kids Game**
- Nicer animations & funny sound effects
- Music toggle wired to real audio
- Costumes & level select
- Expanded parent-safe settings

---

## 🧩 Extending the game (quick how-tos)

- **Add a morph:** add an entry to `src/game/morphs/morphData.ts`, give it a
  model case in `characterModels.ts`, and set `unlockedByDefault` (or call
  `engine.unlockMorph(id)` when earned). The morph menu picks it up automatically.
- **Add a renderer:** implement `GameRenderer` (see `Renderer.ts`) and register
  it in `GameEngine.mountRenderer()`.
- **Go online:** swap `LocalTransport` for `WebSocketTransport` in
  `GameEngine` and point it at your `wss://` server.

---

## 📄 License

Original work — not affiliated with any existing game or franchise. Use it,
remix it, and have fun. Add your preferred license file before publishing.
