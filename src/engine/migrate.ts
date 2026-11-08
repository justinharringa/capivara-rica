import type { GameState } from './state';
import type { Params } from './params';
import { netWorth, rebuildStop } from './sim';

/**
 * Saved games survive updates through this chain. A save carries `version`; each step turns a
 * version-N save into a version-(N+1) one, and `migrateSave` applies the steps in order until
 * the save is current. The rule (CLAUDE.md): any change to GameState bumps CURRENT_SAVE_VERSION,
 * adds a step here, and adds a fixture under fixtures/ that the migration test replays.
 *
 * Steps work on `any` on purpose: the old shape has no type any more, and the new one is only
 * true once the step has run. Each step must be total: fill every new field with a default,
 * rename what was renamed, and never throw on a save it recognises. Steps get the live params
 * so they can recompute derived data (a pending stop's vars) under the new rules.
 */
export const CURRENT_SAVE_VERSION = 3;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

const MIGRATIONS: Record<number, (s: Loose, p: Params) => Loose> = {
  // v1 -> v2 (PR #11, 2026-11-08): lifestyle standing order, running stats, the month summary and
  // the chapter baseline. A v1 save has none of them; the chapter baseline starts "now", so the
  // first chapter card after the update reports from the update onwards. The month of the update
  // is kept in flags (numbers only) so the UI can say where the comparison starts.
  1: (s, p) => {
    s.version = 2;
    s.standing = { lifestyle: 'normal', ...s.standing };
    s.stats ??= { interestEarned: 0, interestPaid: 0, leisureSpent: 0 };
    s.lastMonth ??= null;
    s.chapterStart ??= {
      ageMonths: s.ageMonths,
      // netWorth() reads fields later versions add (fgts, v3); evaluate it on the v3 shape.
      netWorth: netWorth({ fgts: 0, ...s } as GameState),
      interestEarned: 0,
      interestPaid: 0,
    };
    s.flags ??= {};
    s.flags.migratedAtMonth = s.month;
    // A stop built by the old engine may lack vars the new texts use ({item}, {teto}). Rebuild
    // it from the current state; an event that no longer exists leaves the month to re-roll.
    if (s.pending?.eventId) s.pending = rebuildStop(s as GameState, p, String(s.pending.eventId));
    return s;
  },
  // v2 -> v3 (v0.2, 2026-11-08): the FGTS balance and the action log. FGTS is estimated from the
  // current job's tenure (deposits before a job change are lost, which understates it). The
  // action log is rebuilt from the diary's choice entries; standing-order edits and money moves
  // were not recorded, so a costed-decisions review stays unavailable for such a game (the
  // replay check in review.ts notices the mismatch and the end screen hides the section).
  2: (s, p) => {
    s.version = 3;
    const job = String(s.career?.job ?? 'nenhum');
    const rate = job === 'aprendiz' ? p.fgtsRateApprentice : job === 'atendente' || job === 'tecnico' || job === 'superior' ? p.fgtsRate : 0;
    s.fgts ??= Math.round(Number(s.career?.salary ?? 0) * rate * Number(s.career?.monthsInJob ?? 0));
    s.actions ??= (s.log as Array<{ key: string; month: number }>)
      .filter((e) => e.key.startsWith('ch:'))
      .map((e) => {
        const [, eventId, choiceId] = e.key.split(':');
        return { kind: 'choice', month: e.month, eventId, choiceId };
      });
    return s;
  },
};

/** The versions this build can read, oldest first. */
export const READABLE_SAVE_VERSIONS: readonly number[] = [
  ...Object.keys(MIGRATIONS).map(Number).sort((a, b) => a - b),
  CURRENT_SAVE_VERSION,
];

/** The version a stored object claims, or null when it has none. */
export function savedVersion(raw: unknown): number | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = (raw as Loose).version;
  return typeof v === 'number' && Number.isInteger(v) ? v : null;
}

/**
 * Bring a stored save up to the current version, or return null when it cannot be read: not an
 * object, no numeric version, a version newer than this build, a gap in the chain, or a step
 * that throws or fails to advance. It never throws: a save that cannot be read is treated as
 * absent, and the caller decides what to do with the stored bytes. Works on a deep copy, so
 * the caller's object is untouched whatever a step does.
 */
export function migrateSave(raw: unknown, p: Params): GameState | null {
  const version = savedVersion(raw);
  if (version === null || version > CURRENT_SAVE_VERSION) return null;
  let s: Loose;
  try {
    s = structuredClone(raw as Loose);
  } catch {
    return null;
  }
  while (s.version < CURRENT_SAVE_VERSION) {
    const step = MIGRATIONS[s.version];
    if (!step) return null;
    const from = s.version;
    try {
      s = step(s, p);
    } catch {
      return null;
    }
    if (s.version !== from + 1) return null;
  }
  return s as GameState;
}
