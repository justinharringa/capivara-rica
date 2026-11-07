import { describe, expect, it } from 'vitest';
import { brParams } from './testParams';
import { newGame, runWithPolicy, score, netWorth, stepMonth, choose, comprometimento } from './sim';
import { capivaraPolicy, gastaoPolicy, firstChoicePolicy } from './policies';
import { START_AGES, END_AGE } from './state';
import { EVENTS } from './events';
import { formatBRL } from './money';

const p = brParams();

describe('a whole life', () => {
  for (const startAge of START_AGES) {
    it(`runs from ${startAge} to ${END_AGE} deterministically`, () => {
      const a = runWithPolicy({ seed: 123, startAge }, p, capivaraPolicy);
      const b = runWithPolicy({ seed: 123, startAge }, p, capivaraPolicy);
      expect(a.ended).toBe(true);
      expect(a.ageMonths).toBe(END_AGE * 12);
      expect(netWorth(a)).toBe(netWorth(b));
      expect(a.log.length).toBe(b.log.length);
      expect(a.history.length).toBe((END_AGE - startAge) * 12 + 1);
    });
  }

  it('keeps the stop count in the 15-minute budget (about 40-80 stops)', () => {
    for (const startAge of START_AGES) {
      const s = runWithPolicy({ seed: 9, startAge }, p, capivaraPolicy);
      expect(s.stopsCount).toBeGreaterThan(25);
      expect(s.stopsCount).toBeLessThan(110);
    }
  });

  it('the capivara beats the gastão on every seed and start age', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      for (const startAge of START_AGES) {
        const capi = runWithPolicy({ seed, startAge }, p, capivaraPolicy);
        const gast = runWithPolicy({ seed, startAge }, p, gastaoPolicy);
        expect(score(capi), `seed ${seed} start ${startAge}: ${formatBRL(score(capi))} vs ${formatBRL(score(gast))}`).toBeGreaterThan(score(gast));
      }
    }
  });

  it('starting at 10 ends richer than starting at 18 for the same prudent policy', () => {
    const young = runWithPolicy({ seed: 77, startAge: 10 }, p, capivaraPolicy);
    const adult = runWithPolicy({ seed: 77, startAge: 18 }, p, capivaraPolicy);
    expect(score(young)).toBeGreaterThan(score(adult));
  });

  it('never leaves the ghost without an available choice', () => {
    for (const seed of [11, 12, 13]) {
      for (const startAge of START_AGES) {
        expect(() => runWithPolicy({ seed, startAge }, p, firstChoicePolicy)).not.toThrow();
      }
    }
  });

  it('refuses a choice that was not offered', () => {
    const s = newGame({ seed: 5, startAge: 10 }, p);
    expect(s.pending?.eventId).toBe('presente_vovo');
    expect(() => choose(s, p, 'nope')).toThrow();
  });

  it('does not advance while a stop is pending', () => {
    const s = newGame({ seed: 5, startAge: 18 }, p);
    const month = s.month;
    stepMonth(s, p);
    expect(s.month).toBe(month);
  });

  it('comprometimento is a share of income', () => {
    const s = runWithPolicy({ seed: 3, startAge: 18 }, p, gastaoPolicy);
    const c = comprometimento(s, p);
    expect(c).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThanOrEqual(1.5);
  });
});

describe('content coverage', () => {
  it('every event and choice has pt-BR text', async () => {
    const content = (await import('../../content/pt-BR/events.json')).default as Record<
      string,
      { title: string; body: string; capi: string; choices: Record<string, { label: string }> }
    >;
    for (const ev of EVENTS) {
      const c = content[ev.id];
      expect(c, `missing text for event ${ev.id}`).toBeDefined();
      for (const ch of ev.choices) {
        expect(c!.choices[ch.id], `missing label for ${ev.id}/${ch.id}`).toBeDefined();
      }
    }
  });
});
