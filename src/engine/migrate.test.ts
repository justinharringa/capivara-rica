import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { brParams } from './testParams';
import { newGame, stepMonth, choose, netWorth, monthlyIncome, runWithPolicyFrom } from './sim';
import { capivaraPolicy } from './policies';
import { CURRENT_SAVE_VERSION, READABLE_SAVE_VERSIONS, migrateSave } from './migrate';
import type { GameState } from './state';
import eventsText from '../../content/pt-BR/events.json';

const p = brParams();
const fixturesDir = new URL('./fixtures/', import.meta.url);

/** A deterministic game 30 months in: what the fixture of the current version is made from. */
function sampleGame(): GameState {
  const s = newGame({ seed: 20261108, startAge: 10, publicSchool: true }, p);
  capivaraPolicy.onStart?.(s, p);
  while (s.month < 30) {
    if (s.pending) choose(s, p, capivaraPolicy.choose(s, p, s.pending));
    else stepMonth(s, p);
  }
  return s;
}

/**
 * Fields the type allows to be null, `flags` (keys depend on the events a life met) and log
 * vars (free-form per event): compared as "present", whatever they hold right now.
 */
function normalize(s: GameState): unknown {
  return {
    ...s,
    lastMonth: null,
    pending: null,
    negativadoUntilMonth: null,
    flags: {},
    career: { ...s.career, study: null },
    // Log vars are free-form per event; the entry's own fields still count.
    log: s.log.map((e) => ({ ...e, vars: {} })),
  };
}

/**
 * The nested key shape of a state, with leaf types, so a new field without a migration or a
 * default of the wrong type shows up as a diff. Arrays contribute the shape of their first
 * element, so a field added to a history point, a log entry, a loan or a parcela is caught too.
 */
function shape(v: unknown, path = ''): string[] {
  if (Array.isArray(v)) return [path + '[]', ...(v.length ? shape(v[0], path + '[]') : [])];
  if (v && typeof v === 'object') {
    return Object.keys(v as object)
      .sort()
      .flatMap((k) => shape((v as Record<string, unknown>)[k], path ? `${path}.${k}` : k));
  }
  return [`${path}:${v === null ? 'null' : typeof v}`];
}

/** Array element shapes only count when both sides have an element to compare. */
function comparable(mine: string[], theirs: string[]): string[] {
  const arrays = (l: string[]) => l.filter((x) => x.endsWith('[]'));
  const emptyOnOtherSide = arrays(mine).filter((a) => !theirs.some((t) => t.startsWith(a + '.') || t.startsWith(a + '[]')));
  const emptyHere = arrays(mine).filter((a) => !mine.some((t) => t.startsWith(a + '.') || t.startsWith(a + '[]')));
  const skip = new Set([...emptyOnOtherSide, ...emptyHere]);
  return mine.filter((x) => ![...skip].some((a) => x.startsWith(a + '.') || x.startsWith(a + '[]')));
}

const fixtures = readdirSync(fixturesDir)
  .filter((f) => /^save-v\d+(-[\w-]+)?\.json$/.test(f))
  .sort()
  .map((f) => ({ name: f, version: Number(/\d+/.exec(f)![0]), save: JSON.parse(readFileSync(new URL(f, fixturesDir), 'utf8')) as unknown }));

const placeholders = (tpl: string): string[] => [...tpl.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);

describe('save migrations', () => {
  it('newGame writes the current version, and the fixture for it exists', () => {
    expect(sampleGame().version).toBe(CURRENT_SAVE_VERSION);
    expect(fixtures.map((f) => f.version)).toContain(CURRENT_SAVE_VERSION);
  });

  it('every readable version has a fixture, and every fixture is readable', () => {
    expect([...new Set(fixtures.map((f) => f.version))].sort((a, b) => a - b)).toEqual([...READABLE_SAVE_VERSIONS]);
  });

  for (const f of fixtures) {
    it(`migrates ${f.name} to v${CURRENT_SAVE_VERSION}, with the shape of a fresh game, and the game goes on`, () => {
      const s = migrateSave(structuredClone(f.save), p);
      expect(s).not.toBeNull();
      expect(s!.version).toBe(CURRENT_SAVE_VERSION);
      const fresh = shape(normalize(sampleGame()));
      const mine = shape(normalize(s!));
      expect(comparable(mine, fresh)).toEqual(comparable(fresh, mine));
      // A pending stop carried over must have every var its texts use, or the player sees "{item}".
      if (s!.pending) {
        const text = (eventsText as Record<string, { title: string; body: string; capi: string; choices: Record<string, { label: string; detail?: string }> }>)[s!.pending.eventId]!;
        const used = new Set([text.title, text.body, text.capi, ...Object.values(text.choices).flatMap((c) => [c.label, c.detail ?? ''])].flatMap(placeholders));
        for (const key of used) {
          const inStop = key in s!.pending.vars || s!.pending.choices.some((c) => c.vars && key in c.vars);
          expect(inStop, `${f.name}: pending ${s!.pending.eventId} lacks {${key}}`).toBe(true);
        }
      }
      expect(Number.isFinite(netWorth(s!))).toBe(true);
      while (s!.pending) choose(s!, p, capivaraPolicy.choose(s!, p, s!.pending));
      stepMonth(s!, p);
      expect(Number.isFinite(netWorth(s!))).toBe(true);
      expect(Number.isFinite(monthlyIncome(s!, p))).toBe(true);
      expect(s!.lastMonth?.income).toBeGreaterThanOrEqual(0);
      // And all the way to the end, on a copy, with no NaN anywhere in the money.
      const end = runWithPolicyFrom(s!, p, capivaraPolicy);
      expect(end.ended).toBe(true);
      expect(Number.isFinite(netWorth(end))).toBe(true);
      expect(end.history.every((h) => Number.isFinite(h.netWorth) && Number.isFinite(h.cash))).toBe(true);
    });
  }

  it('the v1 step fills exactly the documented defaults and records the update month', () => {
    const f = fixtures.find((x) => x.version === 1)!;
    const raw = f.save as GameState;
    const s = migrateSave(structuredClone(f.save), p)!;
    expect(s.standing.lifestyle).toBe('normal');
    expect(s.stats).toEqual({ interestEarned: 0, interestPaid: 0, leisureSpent: 0 });
    expect(s.lastMonth).toBeNull();
    expect(s.chapterStart.ageMonths).toBe(raw.ageMonths);
    expect(s.chapterStart.netWorth).toBe(netWorth(s));
    expect(s.flags.migratedAtMonth).toBe(raw.month);
  });

  it('refuses what it cannot read, and never throws: garbage, no version, a newer version, a gap, a step that fails', () => {
    expect(migrateSave(null, p)).toBeNull();
    expect(migrateSave('x', p)).toBeNull();
    expect(migrateSave({}, p)).toBeNull();
    expect(migrateSave({ version: CURRENT_SAVE_VERSION + 1 }, p)).toBeNull();
    expect(migrateSave({ version: 0 }, p)).toBeNull();
    // A v1 object with nothing else: the v1 step calls netWorth() on it and throws; that is
    // an unreadable save, not a crash on resume.
    expect(migrateSave({ version: 1 }, p)).toBeNull();
  });

  it('leaves the stored object alone, nested objects included (migration works on a deep copy)', () => {
    const raw = structuredClone(fixtures.find((f) => f.version === 1)!.save) as { version: number; standing: Record<string, unknown> };
    const snapshot = JSON.stringify(raw);
    migrateSave(raw, p);
    expect(JSON.stringify(raw)).toBe(snapshot);
    expect(raw.standing.lifestyle).toBeUndefined();
  });

  it('a stop pending in a v1 save is rebuilt with the vars the new texts need', () => {
    const f = fixtures.find((x) => x.name.includes('black-friday'))!;
    const s = migrateSave(structuredClone(f.save), p)!;
    expect(s.pending?.eventId).toBe('black_friday');
    expect(typeof s.pending?.vars.item).toBe('string');
    const c = migrateSave(structuredClone(fixtures.find((x) => x.name.includes('cartao'))!.save), p)!;
    expect(c.pending?.eventId).toBe('cartao_garantido');
    expect(c.pending?.vars.teto).toBeGreaterThan(0);
    expect(c.pending?.vars.guardado).toBeGreaterThan(0);
  });

  // `npm run save:fixture`: rewrite the fixture of the CURRENT version from sampleGame().
  // Older fixtures are never regenerated: they are what real players' saves looked like.
  it.runIf(process.env.WRITE_SAVE_FIXTURE === '1')('writes the fixture for the current version', () => {
    const out = new URL(`save-v${CURRENT_SAVE_VERSION}.json`, fixturesDir);
    writeFileSync(out, JSON.stringify(sampleGame(), null, 2) + '\n');
    console.log(`wrote ${out.pathname}`);
  });
});
