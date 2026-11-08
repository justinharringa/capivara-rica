import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { brParams } from './testParams';
import { newGame, stepMonth, choose, netWorth, monthlyIncome } from './sim';
import { capivaraPolicy } from './policies';
import { CURRENT_SAVE_VERSION, READABLE_SAVE_VERSIONS, migrateSave } from './migrate';
import type { GameState } from './state';

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

/** Fields the type allows to be null: compared as "present", whatever they hold right now. */
function normalize(s: GameState): unknown {
  return { ...s, lastMonth: null, pending: null, negativadoUntilMonth: null, career: { ...s.career, study: null } };
}

/** The nested key shape of a state, so a new field without a migration shows up as a diff. */
function shape(v: unknown, path = ''): string[] {
  if (Array.isArray(v)) return [path + '[]'];
  if (v && typeof v === 'object') {
    return Object.keys(v as object)
      .sort()
      .flatMap((k) => shape((v as Record<string, unknown>)[k], path ? `${path}.${k}` : k));
  }
  return [path];
}

const fixtures = readdirSync(fixturesDir)
  .filter((f) => /^save-v\d+\.json$/.test(f))
  .map((f) => ({ name: f, version: Number(/\d+/.exec(f)![0]), save: JSON.parse(readFileSync(new URL(f, fixturesDir), 'utf8')) as unknown }));

describe('save migrations', () => {
  it('newGame writes the current version, and the fixture for it exists', () => {
    expect(sampleGame().version).toBe(CURRENT_SAVE_VERSION);
    expect(fixtures.map((f) => f.version)).toContain(CURRENT_SAVE_VERSION);
  });

  it('every readable version has a fixture, and every fixture is readable', () => {
    expect(fixtures.map((f) => f.version).sort((a, b) => a - b)).toEqual([...READABLE_SAVE_VERSIONS]);
  });

  for (const f of fixtures) {
    it(`migrates ${f.name} to v${CURRENT_SAVE_VERSION} and the game goes on`, () => {
      const s = migrateSave(structuredClone(f.save));
      expect(s).not.toBeNull();
      expect(s!.version).toBe(CURRENT_SAVE_VERSION);
      // The migrated save has exactly the shape a fresh game has: a field added to GameState
      // without a migration step fails here, not on a player's phone.
      expect(shape(normalize(s!))).toEqual(shape(normalize(sampleGame())));
      const before = netWorth(s!);
      expect(Number.isFinite(before)).toBe(true);
      while (s!.pending) choose(s!, p, capivaraPolicy.choose(s!, p, s!.pending));
      stepMonth(s!, p);
      expect(Number.isFinite(netWorth(s!))).toBe(true);
      expect(Number.isFinite(monthlyIncome(s!, p))).toBe(true);
      expect(s!.lastMonth?.income).toBeGreaterThanOrEqual(0);
    });
  }

  it('refuses what it cannot read: garbage, no version, a newer version, a gap in the chain', () => {
    expect(migrateSave(null)).toBeNull();
    expect(migrateSave('x')).toBeNull();
    expect(migrateSave({})).toBeNull();
    expect(migrateSave({ version: CURRENT_SAVE_VERSION + 1 })).toBeNull();
    expect(migrateSave({ version: 0 })).toBeNull();
  });

  it('leaves the stored object alone (migration works on a copy)', () => {
    const raw = { ...(fixtures.find((f) => f.version === 1)!.save as object) } as { version: number };
    migrateSave(raw);
    expect(raw.version).toBe(1);
  });

  // `npm run save:fixture`: rewrite the fixture of the CURRENT version from sampleGame().
  // Older fixtures are never regenerated: they are what real players' saves looked like.
  it.runIf(process.env.WRITE_SAVE_FIXTURE === '1')('writes the fixture for the current version', () => {
    const out = new URL(`save-v${CURRENT_SAVE_VERSION}.json`, fixturesDir);
    writeFileSync(out, JSON.stringify(sampleGame(), null, 2) + '\n');
    console.log(`wrote ${out.pathname}`);
  });
});
