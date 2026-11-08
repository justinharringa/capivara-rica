import type { GameState } from './state';
import { netWorth } from './sim';

/**
 * Saved games survive updates through this chain. A save carries `version`; each step turns a
 * version-N save into a version-(N+1) one, and `migrateSave` applies the steps in order until
 * the save is current. The rule (CLAUDE.md): any change to GameState bumps CURRENT_SAVE_VERSION,
 * adds a step here, and adds a fixture under fixtures/ that the migration test replays.
 *
 * Steps work on `any` on purpose: the old shape has no type any more, and the new one is only
 * true once the step has run. Each step must be total: fill every new field with a default,
 * rename what was renamed, and never throw on a save it recognises.
 */
export const CURRENT_SAVE_VERSION = 2;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

const MIGRATIONS: Record<number, (s: Loose) => Loose> = {
  // v1 → v2 (PR #11, 2026-11-08): lifestyle standing order, running stats, the month summary and
  // the chapter baseline. A v1 save has none of them; the chapter baseline starts "now", so the
  // first chapter card after the update reports from the update onwards.
  1: (s) => {
    s.version = 2;
    s.standing = { lifestyle: 'normal', ...s.standing };
    s.stats ??= { interestEarned: 0, interestPaid: 0, leisureSpent: 0 };
    s.lastMonth ??= null;
    s.chapterStart ??= {
      ageMonths: s.ageMonths,
      netWorth: netWorth(s as GameState),
      interestEarned: 0,
      interestPaid: 0,
    };
    return s;
  },
};

/** The versions this build can read, oldest first. */
export const READABLE_SAVE_VERSIONS: readonly number[] = [
  ...Object.keys(MIGRATIONS).map(Number).sort((a, b) => a - b),
  CURRENT_SAVE_VERSION,
];

/**
 * Bring a stored save up to the current version, or return null when it cannot be read: not an
 * object, no numeric version, a version newer than this build, or a gap in the chain.
 */
export function migrateSave(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  let s = { ...(raw as Loose) };
  if (typeof s.version !== 'number' || !Number.isInteger(s.version)) return null;
  if (s.version > CURRENT_SAVE_VERSION) return null;
  while (s.version < CURRENT_SAVE_VERSION) {
    const step = MIGRATIONS[s.version];
    if (!step) return null;
    const from = s.version;
    s = step(s);
    if (s.version !== from + 1) throw new Error(`Save migration from v${from} did not advance the version`);
  }
  return s as GameState;
}
