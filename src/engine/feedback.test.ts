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

describe('help texts', () => {
  it('every stat tile and standing-order control has an explanation', () => {
    const help = (strings as { help: Record<string, string> }).help;
    for (const k of ['netWorth', 'ghostNow', 'cash', 'saved', 'debt', 'income', 'committed', 'wellbeing', 'cardInfo', 'savePct', 'saveInto', 'lifestyle', 'cardPolicy', 'lanche']) {
      expect(help[k], `help.${k}`).toBeTruthy();
    }
  });
});

describe('moving money by hand', () => {
  it('deposits from the account into the standing-order target, never more than the cash', async () => {
    const { depositSavings, bucketBalance } = await import('./sim');
    const s = newGame({ seed: 1, startAge: 18 }, p);
    s.pending = null;
    s.cash = 100000;
    setStanding(s, { saveInto: 'cdb' });
    expect(depositSavings(s, 250000)).toBe(100000);
    expect(s.cash).toBe(0);
    expect(bucketBalance(s, 'cdb')).toBe(100000);
    expect(depositSavings(s, 1)).toBe(0);
    expect(s.log.at(-1)?.key).toBe('deposito');
  });

  it('withdraws net of IR on the gain and says so first', async () => {
    const { withdrawSavings, previewWithdrawal } = await import('./sim');
    const s = newGame({ seed: 1, startAge: 18 }, p);
    s.pending = null;
    deposit(s.inv.cdb, 100000);
    s.inv.cdb.balance = 110000; // R$ 100 of gain, held under 6 months: 22.5%
    const pv = previewWithdrawal(s, p, 'cdb', 110000);
    expect(pv.gain).toBe(10000);
    expect(pv.rate).toBe(p.irFixedIncome0to6);
    expect(pv.tax).toBe(2250);
    expect(pv.net).toBe(107750);
    const before = s.cash;
    expect(withdrawSavings(s, p, 'cdb', 110000)).toBe(pv.net);
    expect(s.cash - before).toBe(pv.net);
    expect(s.inv.cdb.balance).toBe(0);
    expect(s.log.at(-1)?.key).toBe('resgate');
  });

  it('poupança and the cofrinho pay no tax; the locked Pé-de-Meia is not a bucket', async () => {
    const { withdrawSavings, previewWithdrawal, bucketBalance } = await import('./sim');
    const s = newGame({ seed: 1, startAge: 14 }, p);
    s.pending = null;
    s.cofrinho = 5000;
    deposit(s.inv.poupanca, 20000);
    s.inv.poupanca.balance = 21000;
    s.peDeMeiaLocked = 100000;
    expect(previewWithdrawal(s, p, 'poupanca', 21000).tax).toBe(0);
    expect(withdrawSavings(s, p, 'cofrinho', 9999)).toBe(5000);
    expect(s.cofrinho).toBe(0);
    expect(bucketBalance(s, 'poupanca')).toBe(21000);
    expect(s.peDeMeiaLocked).toBe(100000);
  });
});

describe('review fixes (2026-11-08)', () => {
  it('the chapter card does not swallow events scheduled for the same month', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const young = runWithPolicy({ seed, startAge: 10 }, p, capivaraPolicy);
      expect(young.log.some((e) => e.key === 'ev:aniversario' && e.ageMonths === 14 * 12), `seed ${seed}: 14th birthday`).toBe(true);
      const adult = runWithPolicy({ seed, startAge: 18 }, p, capivaraPolicy);
      const offers = adult.log.filter((e) => e.key === 'ev:sair_de_casa').map((e) => e.ageMonths / 12);
      if (adult.log.some((e) => e.key === 'ev:sair_de_casa' && e.ageMonths === 19 * 12) && offers.length >= 2) {
        expect(offers, `seed ${seed}: age-22 offer`).toContain(22);
      }
    }
  });

  it('the Black Friday object does not consume the shared misc stream', () => {
    // Two lives that differ only in whether Black Friday fired must draw the same birthday gifts.
    const a = newGame({ seed: 3, startAge: 14 }, p);
    const b = newGame({ seed: 3, startAge: 14 }, p);
    const ev = EVENTS.find((e) => e.id === 'black_friday')!;
    for (const s of [a, b]) {
      s.pending = null;
      s.ageMonths = 16 * 12 + 10;
      s.month = 34;
      s.calendarMonth = 10;
      s.hasBankAccount = true;
    }
    a.card.has = true;
    a.card.limit = 1000000;
    expect(ev.eligible({ s: a, p })).toBe(true);
    const va = ev.vars!({ s: a, p });
    expect(typeof va.item).toBe('string');
    expect(a.rng.misc).toBe(b.rng.misc);
  });

  it('a lifestyle that costs nothing moves wellbeing nowhere', async () => {
    const { lifestyleMood } = await import('./sim');
    const child = newGame({ seed: 1, startAge: 10 }, p);
    setStanding(child, { lifestyle: 'folgado' });
    expect(lifestyleMood(child, p)).toBe(0);
    const adult = newGame({ seed: 1, startAge: 18 }, p);
    setStanding(adult, { lifestyle: 'folgado' });
    expect(lifestyleMood(adult, p)).toBe(5);
    setStanding(adult, { lifestyle: 'economico' });
    expect(lifestyleMood(adult, p)).toBe(-5);
  });

  it('parcelada fatura interest is attributed per instalment, not all at once', () => {
    const s = newGame({ seed: 1, startAge: 18 }, p);
    s.pending = null;
    s.cash = 10000000;
    s.hasBankAccount = true;
    s.card.has = true;
    s.card.limit = 10000000;
    s.card.revolving = 100000;
    s.card.capBase = 100000;
    s.card.policy = 'parcelar';
    stepMonth(s, p); // conversion month: the balance becomes 12 instalments
    const parcela = s.parcelas.find((x) => x.label === 'fatura parcelada')!;
    expect(parcela).toBeDefined();
    expect(parcela.interest!).toBeGreaterThan(0);
    expect(s.lastMonth!.interestPaid).toBe(0);
    const before = s.stats.interestPaid;
    while (s.pending) choose(s, p, chooseByTags(s.pending, ['capivara', 'capivara2']));
    stepMonth(s, p); // first instalment carries one month of interest
    expect(s.lastMonth!.interestPaid).toBe(parcela.interest);
    expect(s.stats.interestPaid - before).toBe(parcela.interest);
  });

  it('parses what people type into a reais field', async () => {
    const { parseReais } = await import('./money');
    expect(parseReais('10,50')).toBe(1050);
    expect(parseReais('10.50')).toBe(1050);
    expect(parseReais('1.000')).toBe(100000);
    expect(parseReais('1.000,50')).toBe(100050);
    expect(parseReais('R$ 2000')).toBe(200000);
    expect(parseReais('2000')).toBe(200000);
    expect(parseReais('')).toBe(0);
    expect(parseReais('abc')).toBe(0);
  });
});

describe('cheque especial', () => {
  it('is charged only on what savings cannot cover', () => {
    const s = newGame({ seed: 1, startAge: 18 }, p);
    s.pending = null;
    s.hasBankAccount = true;
    s.career.job = 'atendente';
    s.career.salary = 0; // no income this month
    setStanding(s, { savePct: 0, lifestyle: 'normal' });
    s.cash = 100; // R$ 1,00 in the account
    deposit(s.inv.poupanca, 500000); // R$ 5.000 saved
    stepMonth(s, p);
    while (s.pending) choose(s, p, chooseByTags(s.pending, ['capivara', 'capivara2']));
    // Costs exceeded cash; savings covered them; no overdraft interest.
    expect(s.cash).toBeGreaterThanOrEqual(0);
    expect(s.lastMonth!.interestPaid).toBe(0);
    expect(s.log.some((e) => e.key === 'cheque_especial')).toBe(false);
    expect(s.inv.poupanca.balance).toBeLessThan(500000);
  });
});

describe('fairness of the ghost comparison', () => {
  it('a player who makes the Capivara\'s choice at every stop has her net worth at every month', () => {
    for (const startAge of START_AGES) {
      const ghost = runWithPolicy({ seed: 44, startAge }, p, capivaraPolicy);
      // The player: the same choices by tag, including lunch from home when asked (not before),
      // and the standing orders the Capivara's policy sets through the UI levers.
      const s = newGame({ seed: 44, startAge }, p);
      setStanding(s, { savePct: 0.2, bets: 0, lifestyle: 'normal' });
      if (s.hasBankAccount) setStanding(s, { saveInto: 'cdb' });
      s.card.policy = 'integral';
      let guard = 0;
      while (!s.ended && guard++ < 2000) {
        if (s.pending) choose(s, p, capivaraPolicy.choose(s, p, s.pending));
        else stepMonth(s, p);
      }
      for (let i = 0; i < ghost.history.length; i += 1) {
        expect(s.history[i]!.netWorth, `start ${startAge}, month ${i}`).toBe(ghost.history[i]!.netWorth);
      }
    }
  });

  it('asks about lunch before the first month is charged, so the default never costs a child money unasked', () => {
    const s = newGame({ seed: 1, startAge: 10 }, p);
    expect(s.pending?.eventId).toBe('presente_vovo');
    choose(s, p, 'guardar');
    expect(s.pending?.eventId).toBe('lanche');
    expect(s.month).toBe(0);
  });
});
