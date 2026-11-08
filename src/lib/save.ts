import { get, set, del } from 'idb-keyval';
import type { GameState } from '$engine/state';
import type { Params } from '$engine/params';
import { migrateSave, savedVersion, CURRENT_SAVE_VERSION } from '$engine/migrate';

/**
 * One key for all versions: the version lives inside the save and src/engine/migrate.ts brings
 * it up to date. The two legacy keys carried the version in their name and are read once, moved
 * to the current key, then deleted. When a save is migrated, a copy of the migrated state is kept
 * under FORK_KEY: the Capivara of that game is played from there, not from birth, because the
 * player's earlier months ran under the old rules.
 */
const KEY = 'capivara-rica:save';
const FORK_KEY = 'capivara-rica:ghost-fork';
const LEGACY_KEYS = ['capivara-rica:save:v2', 'capivara-rica:save:v1'];
/** Persistent-storage is requested once per page load; browsers treat repeat requests as noise. */
let persistRequested = false;
/**
 * Set when the stored save comes from a newer build than this one (an old shell served by the
 * service worker right after a deploy). Nothing is written until the page reloads, so the newer
 * save is not overwritten by a game started on the old shell.
 */
let blockedByNewerSave = false;

export interface LoadResult {
  state: GameState | null;
  /** The stored save is from a newer build; it is kept, and this build will not write. */
  newer: boolean;
}

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

async function writeKey(key: string, value: unknown): Promise<void> {
  try {
    await set(key, value);
  } catch {
    /* fall through to localStorage */
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode; the game still plays */
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

export async function loadSave(p: Params): Promise<LoadResult> {
  const raw = await readKey(KEY);
  const version = savedVersion(raw);
  if (version !== null && version > CURRENT_SAVE_VERSION) {
    blockedByNewerSave = true;
    return { state: null, newer: true };
  }
  const current = migrateSave(raw, p);
  if (current) {
    if (version !== CURRENT_SAVE_VERSION) await persist(current, true);
    return { state: current, newer: false };
  }
  for (const legacy of LEGACY_KEYS) {
    const legacyRaw = await readKey(legacy);
    const s = migrateSave(legacyRaw, p);
    if (!s) continue;
    // Drop the legacy copies only once the moved save is readable under the new key. If
    // storage is blocked (quota, private mode), they stay and are moved again next time
    // rather than lost. All of them go: a player who played before and after the previous
    // release has both, and the older one must not come back as "Continuar" later.
    // The ghost forks only when a migration step actually ran: a current-version save that
    // merely changed key was played under this engine, so its replay from birth is faithful.
    if (await persist(s, savedVersion(legacyRaw) !== CURRENT_SAVE_VERSION)) for (const k of LEGACY_KEYS) await removeKey(k);
    return { state: s, newer: false };
  }
  return { state: null, newer: false };
}

/** Write a loaded save under the current key (and the ghost fork when it was migrated); true when it reads back. */
async function persist(s: GameState, migrated: boolean): Promise<boolean> {
  await writeKey(KEY, s);
  if (migrated) await writeKey(FORK_KEY, s);
  return savedVersion(await readKey(KEY)) === CURRENT_SAVE_VERSION;
}

/** The state the Capivara's replay starts from, when this game was migrated; null otherwise. */
export async function loadGhostFork(p: Params): Promise<GameState | null> {
  return migrateSave(await readKey(FORK_KEY), p);
}

export async function writeSave(s: GameState): Promise<void> {
  if (blockedByNewerSave) return;
  await writeKey(KEY, s);
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
  if (blockedByNewerSave) return;
  await removeKey(KEY);
  await removeKey(FORK_KEY);
  // A legacy copy must not come back as "Continuar jogo salvo" after "Novo jogo" or a finished game.
  for (const legacy of LEGACY_KEYS) await removeKey(legacy);
}
