import { get, set, del } from 'idb-keyval';
import type { GameState } from '$engine/state';
import { migrateSave } from '$engine/migrate';

/**
 * One key for all versions: the version lives inside the save and src/engine/migrate.ts brings
 * it up to date. The two legacy keys carried the version in their name and are read once, moved
 * to the current key, then deleted.
 */
const KEY = 'capivara-rica:save';
const LEGACY_KEYS = ['capivara-rica:save:v2', 'capivara-rica:save:v1'];
/** Persistent-storage is requested once per page load; browsers treat repeat requests as noise. */
let persistRequested = false;

async function readKey(key: string): Promise<unknown> {
  try {
    const s = await get<unknown>(key);
    if (s) return s;
  } catch {
    /* IndexedDB unavailable (private mode, old browser) */
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

async function removeKey(key: string): Promise<void> {
  try {
    await del(key);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export async function loadSave(): Promise<GameState | null> {
  const current = migrateSave(await readKey(KEY));
  if (current) return current;
  for (const legacy of LEGACY_KEYS) {
    const s = migrateSave(await readKey(legacy));
    await removeKey(legacy);
    if (s) {
      await writeSave(s);
      return s;
    }
  }
  return null;
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
  await removeKey(KEY);
}
