import { get, set, del } from 'idb-keyval';
import type { GameState } from '$engine/state';

const KEY = 'capivara-rica:save:v2';
/** The GameState shape this build reads. A save from another version is discarded, never migrated. */
const VERSION = 2;
/** Persistent-storage is requested once per page load; browsers treat repeat requests as noise. */
let persistRequested = false;

export async function loadSave(): Promise<GameState | null> {
  try {
    const s = (await get<GameState>(KEY)) ?? null;
    if (s) return current(s);
  } catch {
    /* IndexedDB unavailable (private mode, old browser) */
  }
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? current(JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

const current = (s: GameState): GameState | null => (s.version === VERSION ? s : null);

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
