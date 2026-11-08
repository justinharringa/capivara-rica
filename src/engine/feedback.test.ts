import { describe, expect, it } from 'vitest';
import { brParams } from './testParams';
import { newGame, stepMonth, choose, runWithPolicy, setStanding, leisureCost, monthlyFixedCosts, netWorth } from './sim';
import { capivaraPolicy, gastaoPolicy, chooseByTags } from './policies';
import { deposit } from './investments';
import { BF_ITEMS, EVENTS } from './events';
import { CHAPTERS, START_AGES, chapterOf } from './state';
import strings from '../../content/pt-BR/strings.json';

const p = brParams();

/** Drive a game to a given age with the ghost's choices, intercepting one event id. */
function playUntil(seed: number, startAge: 10 | 14 | 18, ageMonths: number, onStop?: (s: ReturnType<typeof newGame>) => string | undefined) {
  const s = newGame({ seed, startAge }, p);
  while (!s.ended && s.ageMonths < ageMonths) {
    if (s.pending) choose(s, p, onStop?.(s) ?? chooseByTags(s.pending, ['capivara', 'capivara2']));
    else stepMonth(s, p);
  }
  return s;
}

describe('secured card at 16', () => {
  it('is offered on any invested savings and its limit is min(savings, cap), which the text names', () => {
    // A 16-year-old with a bank account and R$ 5.000 in poupança only: the old rule
    // (CDB balance) would never have offered the card.
    const t = newGame({ seed: 1, startAge: 14 }, p);
    t.pending = null;
    t.ageMonths = 16 * 12;
    t.hasBankAccount = true;
    deposit(t.inv.poupanca, 500000);
    const ev = EVENTS.find((e) => e.id === 'cartao_garantido')!;
    expect(ev.eligible({ s: t, p })).toBe(true);
    const v = ev.vars!({ s: t, p });
    expect(v.guardado).toBe(500000);
    expect(v.teto).toBe(Math.round(p.securedCardMaxLimit * t.macro.priceIndex));
    expect(v.limite).toBe(Math.min(500000, Number(v.teto)));
  });

  it('is not offered on cofrinho money alone', () => {
    const t = newGame({ seed: 1, startAge: 14 }, p);
    t.pending = null;
    t.ageMonths = 16 * 12;
    t.hasBankAccount = true;
    t.cofrinho = 500000;
    const ev = EVENTS.find((e) => e.id === 'cartao_garantido')!;
    expect(ev.eligible({ s: t, p })).toBe(false);
  });
});

describe('lifestyle', () => {
  it('costs nothing for a child or a teen on mesada, and scales with the lifestyle once there is a salary', () => {
    const child = newGame({ seed: 1, startAge: 10 }, p);
    expect(leisureCost(child, p)).toBe(0);
    const teen = newGame({ seed: 1, startAge: 14 }, p);
    expect(leisureCost(teen, p)).toBe(0);
    teen.career.job = 'aprendiz';
    const normal = leisureCost(teen, p, 'normal');
    expect(normal).toBe(p.leisureTeenMonthly);
    expect(leisureCost(teen, p, 'economico')).toBeLessThan(normal);
    expect(leisureCost(teen, p, 'folgado')).toBeGreaterThan(normal);
    const adult = newGame({ seed: 1, startAge: 18 }, p);
    expect(leisureCost(adult, p)).toBe(p.leisureAdultMonthly);
    expect(monthlyFixedCosts(adult, p)).toBeGreaterThanOrEqual(p.leisureAdultMonthly);
  });

  it('is a real drag: the same prudent life ends poorer on folgado than on economico', () => {
    const run = (lifestyle: 'economico' | 'folgado') =>
      runWithPolicy({ seed: 8, startAge: 18 }, p, {
        onStart: (s, pp) => {
          capivaraPolicy.onStart!(s, pp);
          setStanding(s, { lifestyle });
        },
        choose: capivaraPolicy.choose,
      });
    const frugal = run('economico');
    const loose = run('folgado');
    expect(netWorth(frugal)).toBeGreaterThan(netWorth(loose));
    expect(loose.stats.leisureSpent).toBeGreaterThan(frugal.stats.leisureSpent);
  });

  it('is a standing order every policy sets', () => {
    const c = runWithPolicy({ seed: 1, startAge: 18 }, p, capivaraPolicy);
    const g = runWithPolicy({ seed: 1, startAge: 18 }, p, gastaoPolicy);
    expect(c.standing.lifestyle).toBe('normal');
    expect(g.standing.lifestyle).toBe('folgado');
  });
});

describe('black friday', () => {
  it('rotates the object, never repeats the previous one, and comes at most every other year', () => {
    for (const seed of [1, 2, 3, 4]) {
      const s = runWithPolicy({ seed, startAge: 14 }, p, capivaraPolicy);
      const offers = s.log.filter((e) => e.key === 'ev:black_friday');
      expect(offers.length).toBeGreaterThanOrEqual(5);
      const items = offers.map((e) => String(e.vars?.item));
      expect(new Set(items).size).toBeGreaterThanOrEqual(3);
      for (let i = 1; i < items.length; i += 1) {
        expect(items[i]).not.toBe(items[i - 1]);
        expect(offers[i]!.month - offers[i - 1]!.month).toBeGreaterThanOrEqual(20);
      }
      for (const it of items) expect(BF_ITEMS.some((b) => b.id === it)).toBe(true);
    }
  });

  it('has a pt-BR name and a price parameter for every object', () => {
    const names = (strings as { app: { bfItems: Record<string, string> } }).app.bfItems;
    for (const it of BF_ITEMS) {
      expect(names[it.id], `bfItems.${it.id}`).toBeTruthy();
      expect(p[it.price]).toBeGreaterThan(0);
    }
  });
});

describe('chapters', () => {
  it('opens a chapter card at every boundary after the starting one', () => {
    const expected: Record<number, number[]> = { 10: [14, 18, 22, 26], 14: [18, 22, 26], 18: [22, 26] };
    for (const startAge of START_AGES) {
      const s = runWithPolicy({ seed: 5, startAge }, p, capivaraPolicy);
      const cards = s.log.filter((e) => e.key === 'ev:capitulo');
      expect(cards.map((e) => e.ageMonths / 12)).toEqual(expected[startAge]);
      expect(cards.map((e) => Number(e.vars?.capitulo))).toEqual(expected[startAge]!.map((a) => chapterOf(a * 12).n));
      for (const c of cards) {
        expect(c.vars?.titulo).toBe(chapterOf(c.ageMonths).id);
        expect(Number(c.vars?.juros)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('names every chapter in pt-BR', () => {
    const names = (strings as { app: { chapters: Record<string, string> } }).app.chapters;
    for (const c of CHAPTERS) expect(names[c.id], `chapters.${c.id}`).toBeTruthy();
  });

  it('resets the chapter baseline so each card reports only its own chapter', () => {
    const s = playUntil(5, 10, 18 * 12 + 1);
    const cards = s.log.filter((e) => e.key === 'ev:capitulo');
    expect(cards).toHaveLength(2);
    const second = cards[1]!.vars!;
    // The second card's starting net worth is the first card's ending one.
    expect(second.inicio).toBe(cards[0]!.vars!.patrimonio);
  });
});

describe('month summary and stats', () => {
  it('records where last month went and accumulates interest both ways', () => {
    const s = runWithPolicy({ seed: 2, startAge: 10 }, p, capivaraPolicy);
    expect(s.lastMonth).not.toBeNull();
    expect(s.lastMonth!.income).toBeGreaterThan(0);
    expect(s.stats.interestEarned).toBeGreaterThan(0);
    expect(s.stats.interestPaid).toBe(0);
    const g = runWithPolicy({ seed: 2, startAge: 18 }, p, gastaoPolicy);
    expect(g.stats.interestPaid).toBeGreaterThan(0);
  });

  it('the ghost history lines up with the player by age, for the live comparison', () => {
    const you = playUntil(9, 14, 20 * 12);
    const ghost = runWithPolicy({ seed: 9, startAge: 14 }, p, capivaraPolicy);
    const i = you.ageMonths - you.startAge * 12;
    expect(ghost.history[i]!.ageMonths).toBe(you.ageMonths);
    // Same seed, same macro stream: the two lives share the price level at every age, so
    // nominal net worths are comparable without deflating.
    const ghostAtSameAge = runWithPolicy({ seed: 9, startAge: 14 }, p, { ...capivaraPolicy }, 0);
    expect(ghostAtSameAge.macro.priceIndex).toBe(1);
    expect(you.history[i]!.ageMonths).toBe(ghost.history[i]!.ageMonths);
  });
});
