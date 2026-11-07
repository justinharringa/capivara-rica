import { get, set, del } from 'idb-keyval';
import type { GameState } from '$engine/state';

const KEY = 'capivara-rica:save:v1';
/** Persistent-storage is requested once per page load; browsers treat repeat requests as noise. */
let persistRequested = false;

export async function loadSave(): Promise<GameState | null> {
  try {
    const s = (await get<GameState>(KEY)) ?? null;
    if (s) return s;
  } catch {
    /* IndexedDB unavailable (private mode, old browser) */
  }
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

export async function writeSave(s: GameState): Promise<void> {
  try {
    await set(KEY, s);
  } catch {
    /* fall through to localStorage */
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* quota or private mode; the game still plays */
  }
  if (!persistRequested) {
    persistRequested = true;
    try {
      await navigator.storage?.persist?.();
    } catch {
      /* optional */
    }
  }
}

export async function clearSave(): Promise<void> {
  try {
    await del(KEY);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
