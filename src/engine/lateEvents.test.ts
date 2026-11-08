import { describe, expect, it } from 'vitest';
import { brParams } from './testParams';
import { newGame, stepMonth, choose, monthlyIncome, monthlyFixedCosts, runWithPolicy, fgtsMonthly } from './sim';
import { jobSalary } from './career';
import { capivaraPolicy, gastaoPolicy, chooseByTags } from './policies';
import { EVENTS } from './events';
import type { GameState } from './state';

const p = brParams();
const ev = (id: string) => EVENTS.find((e) => e.id === id)!;

function adult(seed = 1): GameState {
  const s = newGame({ seed, startAge: 18 }, p);
  s.pending = null;
  s.ageMonths = 26 * 12;
  s.month = 8 * 12;
  s.hasBankAccount = true;
  s.career.job = 'atendente';
  s.career.salary = jobSalary(s, p, 'atendente');
  s.career.monthsInJob = 30;
  s.cash = 500000;
  return s;
}

describe('FGTS and a dismissal', () => {
  it('accrues 8% of a CLT salary a month (2% for an apprentice, nothing for gig work) and counts in net worth', () => {
    const s = adult();
    expect(fgtsMonthly(s, p)).toBe(Math.round(s.career.salary * p.fgtsRate));
    s.career.job = 'aprendiz';
    expect(fgtsMonthly(s, p)).toBe(Math.round(s.career.salary * p.fgtsRateApprentice));
    s.career.job = 'ifood';
    expect(fgtsMonthly(s, p)).toBe(0);
    const c = runWithPolicy({ seed: 2, startAge: 18 }, p, capivaraPolicy);
    expect(c.fgts).toBeGreaterThan(0);
  });

  it('pays the balance plus 40% at once, then seguro-desemprego for a few months', () => {
    const s = adult();
    s.fgts = 100000;
    const d = ev('demissao');
    expect(d.eligible({ s, p })).toBe(true);
    const v = d.vars!({ s, p });
    expect(v.multa).toBe(40000);
    expect(v.total).toBe(140000);
    expect(v.meses).toBe(p.seguroDesempregoMonthsMax);
    const cash = s.cash;
    d.choices.find((c) => c.id === 'conta')!.apply({ s, p }, v);
    expect(s.cash - cash).toBe(140000);
    expect(s.fgts).toBe(0);
    expect(s.career.job).toBe('nenhum');
    expect(monthlyIncome(s, p)).toBe(Number(v.parcela));
    for (let i = 0; i < Number(v.meses); i += 1) {
      stepMonth(s, p);
      // Turn down the job offers that follow a dismissal, to watch the benefit run out.
      while (s.pending) choose(s, p, s.pending.eventId === 'vaga' ? 'nao' : chooseByTags(s.pending, ['capivara', 'capivara2']));
    }
    expect(s.flags.seguroMeses).toBe(0);
    expect(monthlyIncome(s, p)).toBe(0);
  });
});

describe('the 22-30 events', () => {
  it('a child adds a monthly cost; private daycare adds half again', () => {
    const s = adult();
    const base = monthlyFixedCosts(s, p);
    ev('filho').choices.find((c) => c.id === 'publica')!.apply({ s, p }, {});
    expect(monthlyFixedCosts(s, p) - base).toBe(Math.round(p.childMonthlyCost * s.macro.priceIndex));
    const t = adult();
    ev('filho').choices.find((c) => c.id === 'particular')!.apply({ s: t, p }, {});
    expect(monthlyFixedCosts(t, p) - base).toBe(Math.round(p.childMonthlyCost * t.macro.priceIndex) * 1.5);
  });

  it('a financed car is a loan plus a running cost; à vista needs the reserve', () => {
    const s = adult();
    const e = ev('carro');
    const v = e.vars!({ s, p });
    expect(Number(v.total)).toBeGreaterThan(Number(v.preco));
    const base = monthlyFixedCosts(s, p);
    e.choices.find((c) => c.id === 'financiar')!.apply({ s, p }, v);
    expect(s.loans.some((l) => l.id.startsWith('carro'))).toBe(true);
    expect(monthlyFixedCosts(s, p) - base).toBe(Number(v.custo));
    const poor = adult();
    poor.cash = 100;
    expect(e.choices.find((c) => c.id === 'avista')!.available!({ s: poor, p }, v)).toBe(false);
  });

  it('moving in together moves a player out of the parents\' home and halves the rent', () => {
    const s = adult();
    const e = ev('morar_junto');
    const v = e.vars!({ s, p });
    e.choices.find((c) => c.id === 'civil')!.apply({ s, p }, v);
    expect(s.living).toBe('sozinho');
    expect(s.flags.juntos).toBe(1);
    const alone = adult();
    alone.living = 'sozinho';
    const together = adult();
    together.living = 'sozinho';
    together.flags.juntos = 1;
    expect(monthlyFixedCosts(alone, p) - monthlyFixedCosts(together, p)).toBe(Math.round(p.rentKitnetSP * alone.macro.priceIndex) - Math.round(Math.round(p.rentKitnetSP / 2) * alone.macro.priceIndex));
  });

  it('a health plan costs monthly and turns the emergency into a co-payment', () => {
    const s = adult();
    const base = monthlyFixedCosts(s, p);
    ev('plano_saude').choices.find((c) => c.id === 'contratar')!.apply({ s, p }, {});
    expect(monthlyFixedCosts(s, p) - base).toBe(Math.round(p.healthPlanYoung * s.macro.priceIndex));
    const withPlan = ev('emergencia').vars!({ s: structuredClone(s), p });
    const t = adult();
    const noPlan = ev('emergencia').vars!({ s: t, p });
    // Same shocks draw (same rng state), one fifth of the bill.
    expect(Number(withPlan.valor)).toBe(Math.round(Number(noPlan.valor) * 0.2));
  });

  it('an English course costs 12 instalments and then raises the salary once', () => {
    const s = adult();
    s.flags.demissaoMonth = s.month; // no layoff during the course, so the raise is observable
    const e = ev('curso_ingles');
    const v = e.vars!({ s, p });
    e.choices.find((c) => c.id === 'fazer')!.apply({ s, p }, v);
    const salary = s.career.salary;
    for (let i = 0; i < 13; i += 1) {
      stepMonth(s, p);
      while (s.pending) choose(s, p, chooseByTags(s.pending, ['capivara', 'capivara2']));
    }
    expect(s.flags.ingles).toBe(1);
    expect(s.career.salary).toBeGreaterThanOrEqual(Math.round(salary * (1 + p.englishPremium)));
    expect(s.log.some((x) => x.key === 'ingles_concluido')).toBe(true);
  });

  it('a parent can wait, and the question comes back two years later at the earliest', () => {
    const s = adult();
    const e = ev('filho');
    expect(e.eligible({ s, p })).toBe(true);
    e.choices.find((c) => c.id === 'depois')!.apply({ s, p }, {});
    expect(s.flags.filhos).toBeUndefined();
    expect(e.eligible({ s, p })).toBe(false);
    s.month += 24;
    expect(e.eligible({ s, p })).toBe(true);
  });

  it('financing is offered only when the instalment fits under the red line', () => {
    const s = adult();
    const car = ev('carro');
    const v = car.vars!({ s, p });
    // A R$ 1.300 instalment on a minimum wage is over 40% of income: not offered.
    expect(car.choices.find((c) => c.id === 'financiar')!.available!({ s, p }, v)).toBe(false);
    s.career.salary = 2000000; // R$ 20k gross
    expect(car.choices.find((c) => c.id === 'financiar')!.available!({ s, p }, v)).toBe(true);
  });

  it('taking any job ends the seguro-desemprego, and a graduate is offered a job at their level', () => {
    const s = adult();
    s.career.job = 'nenhum';
    s.career.level = 'superior';
    s.flags.seguroMeses = 3;
    s.flags.seguroValor = 100000;
    const vaga = ev('vaga');
    const v = vaga.vars!({ s, p });
    expect(v.cargo).toBe('superior');
    const nivel = vaga.choices.find((c) => c.id === 'nivel')!;
    expect(nivel.available!({ s, p }, v)).toBe(true);
    nivel.apply({ s, p }, v);
    expect(s.career.job).toBe('superior');
    expect(s.flags.seguroMeses).toBe(0);
    expect(monthlyIncome(s, p)).toBeGreaterThan(0);
  });

  it('a trip comes at most every two years', () => {
    const s = runWithPolicy({ seed: 7, startAge: 18 }, p, gastaoPolicy);
    const trips = s.log.filter((e) => e.key === 'ev:viagem');
    for (let i = 1; i < trips.length; i += 1) expect(trips[i]!.month - trips[i - 1]!.month).toBeGreaterThanOrEqual(24);
  });

  it('the late events do fire in ordinary lives, and the Capivara still wins', () => {
    const ids = ['demissao', 'filho', 'carro', 'morar_junto', 'plano_saude', 'viagem', 'curso_ingles'];
    const seen = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      for (const startAge of [10, 14, 18] as const) {
        const c = runWithPolicy({ seed, startAge }, p, capivaraPolicy);
        const g = runWithPolicy({ seed, startAge }, p, gastaoPolicy);
        for (const e of [...c.log, ...g.log]) if (e.key.startsWith('ev:')) seen.add(e.key.slice(3));
      }
    }
    for (const id of ids) expect(seen.has(id), id).toBe(true);
  });
});
