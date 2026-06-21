import type { MorphId, Vec3 } from '../types';

// Multiplayer-ready structure (placeholder for Version 3).
//
// The whole point of this file is that the rest of the game already talks to a
// "transport" abstraction, so wiring up real WebSockets later is a drop-in
// change: implement `MultiplayerTransport` with a real socket and register it.
//
// Version 1 ships with the LocalTransport (a no-op single-player stub). A
// LocalSplitTransport (same-keyboard 2-player) and a WebSocketTransport
// (online) can be added without touching the engine or UI.

/** A snapshot of one player that travels across the network. */
export interface PlayerState {
  id: string;
  name: string; // preset, kid-safe names only — no free chat
  morphId: MorphId;
  position: Vec3;
  facing: number;
  emote?: string; // preset emotes only (Version 3)
}

/** Messages the game sends/receives. Emotes only — there is NO open chat. */
export type NetMessage =
  | { type: 'state'; player: PlayerState }
  | { type: 'emote'; playerId: string; emote: string }
  | { type: 'join'; player: PlayerState }
  | { type: 'leave'; playerId: string };

export interface MultiplayerTransport {
  /** Establish the connection (or pretend to, for local play). */
  connect(roomCode?: string): Promise<void>;
  /** Send the local player's latest state/emote. */
  send(message: NetMessage): void;
  /** Receive remote updates. */
  onMessage(handler: (message: NetMessage) => void): void;
  disconnect(): void;
  readonly kind: 'local' | 'local-split' | 'websocket';
}

/**
 * Single-player no-op transport used in Version 1. It satisfies the interface
 * so the engine can be built "multiplayer-ready" today.
 */
export class LocalTransport implements MultiplayerTransport {
  readonly kind = 'local' as const;

  async connect(): Promise<void> {
    // Nothing to connect to in single-player.
  }

  send(_message: NetMessage): void {
    // No remote peers, so nothing leaves the device.
  }

  onMessage(_handler: (message: NetMessage) => void): void {
    // No remote peers will ever push messages in single-player.
  }

  disconnect(): void {
    // Nothing to tear down.
  }
}

/**
 * Sketch of the future online transport. Left here (unused) as a clear seam for
 * Version 3 so the structure is obvious.
 *
 * Example server endpoint: wss://<your-host>/play  (room-based, emote-only)
 */
export class WebSocketTransport implements MultiplayerTransport {
  readonly kind = 'websocket' as const;
  private socket: WebSocket | null = null;
  private handler: ((message: NetMessage) => void) | null = null;

  constructor(private url: string) {}

  connect(roomCode = 'lobby'): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(`${this.url}?room=${encodeURIComponent(roomCode)}`);
      socket.onopen = () => resolve();
      socket.onerror = (err) => reject(err);
      socket.onmessage = (ev) => {
        try {
          this.handler?.(JSON.parse(ev.data) as NetMessage);
        } catch {
          // Ignore malformed messages — kid-safe clients never trust the wire.
        }
      };
      this.socket = socket;
    });
  }

  send(message: NetMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  onMessage(handler: (message: NetMessage) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.handler = null;
  }
}

/** Preset, parent-approved emotes. No typing, ever. */
export const PRESET_EMOTES = ['👋', '😄', '🎉', '❤️', '⭐', '🍎'] as const;

/** Preset, parent-approved player names for online lobbies. */
export const PRESET_NAMES = [
  'Wiggly',
  'Bouncy',
  'Sunny',
  'Bubbles',
  'Sprout',
  'Pip',
  'Squish',
  'Ziggy',
] as const;
