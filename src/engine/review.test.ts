import { describe, expect, it } from 'vitest';
import { brParams } from './testParams';
import { newGame, stepMonth, choose, runWithPolicy, score, setStanding, depositSavings } from './sim';
import { capivaraPolicy, gastaoPolicy } from './policies';
import { replay, costliestDecisions } from './review';
import { EVENTS } from './events';

const p = brParams();

describe('replay from the action log', () => {
  it('reproduces a policy-driven life exactly', () => {
    for (const startAge of [10, 14, 18] as const) {
      const s = runWithPolicy({ seed: 31, startAge }, p, gastaoPolicy);
      const r = replay(s, p);
      expect(r).not.toBeNull();
      expect(r!.ended).toBe(true);
      expect(score(r!)).toBe(score(s));
    }
  });

  it('reproduces standing-order edits and money moves made between stops', () => {
    const s = newGame({ seed: 32, startAge: 18 }, p);
    capivaraPolicy.onStart?.(s, p);
    let guard = 0;
    while (!s.ended && guard++ < 2000) {
      if (s.pending) choose(s, p, capivaraPolicy.choose(s, p, s.pending));
      else {
        if (s.month === 20) setStanding(s, { savePct: 0.5, lifestyle: 'economico' }, true);
        if (s.month === 40) depositSavings(s, 100000, true);
        stepMonth(s, p);
      }
    }
    const r = replay(s, p);
    expect(r).not.toBeNull();
    expect(score(r!)).toBe(score(s));
  });

  it('returns null when the log does not match the life (choices only, from an old save)', () => {
    const s = runWithPolicy({ seed: 33, startAge: 14 }, p, gastaoPolicy);
    const broken = { ...s, actions: s.actions.filter((a) => a.kind === 'choice').map((a, i) => (i === 3 && a.kind === 'choice' ? { ...a, choiceId: 'nope' } : a)) };
    expect(replay(broken, p)).toBeNull();
  });
});

describe('costliest decisions', () => {
  it('finds up to three positive-cost decisions in a spendthrift life, each with a different Capivara choice', () => {
    const s = runWithPolicy({ seed: 34, startAge: 14 }, p, gastaoPolicy);
    const top = costliestDecisions(s, p, capivaraPolicy);
    expect(top.length).toBeGreaterThan(0);
    expect(top.length).toBeLessThanOrEqual(3);
    for (const d of top) {
      expect(d.cost).toBeGreaterThan(0);
      expect(d.ghostChoiceId).not.toBe(d.choiceId);
      expect(EVENTS.some((e) => e.id === d.eventId)).toBe(true);
    }
    expect(top[0]!.cost).toBeGreaterThanOrEqual(top[top.length - 1]!.cost);
  });

  it('is empty for the Capivara herself and for an unfinished game', () => {
    const s = runWithPolicy({ seed: 35, startAge: 10 }, p, capivaraPolicy);
    expect(costliestDecisions(s, p, capivaraPolicy)).toEqual([]);
    const half = newGame({ seed: 35, startAge: 10 }, p);
    expect(costliestDecisions(half, p, capivaraPolicy)).toEqual([]);
  });
});
