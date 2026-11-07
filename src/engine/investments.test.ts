import { describe, expect, it } from 'vitest';
import { brParams } from './testParams';
import { newGame } from './sim';
import { accrueInvestments, deposit, redeem, monthlyRate, irRate } from './investments';
import { reais, annualToMonthly } from './money';

const p = brParams();

describe('instruments', () => {
  it('orders returns as cofrinho < poupança < Tesouro Selic ≈ CDB at 2026 rates', () => {
    const s = newGame({ seed: 1, startAge: 18 }, p);
    const r = (t: Parameters<typeof monthlyRate>[2]) => monthlyRate(s, p, t);
    expect(r('cofrinho')).toBe(0);
    expect(r('poupanca')).toBeLessThan(r('tesouroSelic'));
    expect(r('tesouroSelic')).toBeCloseTo(annualToMonthly(p.selicAnnual), 6);
    expect(r('cdb')).toBeCloseTo(annualToMonthly(p.cdiAnnual), 6);
  });

  it('poupança switches to 70% of Selic when Selic is at or below 8.5%', () => {
    const s = newGame({ seed: 1, startAge: 18 }, p);
    s.macro.selicAnnual = 0.08;
    expect(monthlyRate(s, p, 'poupanca')).toBeCloseTo(annualToMonthly(0.056), 6);
  });

  it('compounds R$100/month in CDB to more than the deposits over 10 years', () => {
    const s = newGame({ seed: 1, startAge: 18 }, p);
    for (let m = 0; m < 120; m++) {
      deposit(s.inv.cdb, reais(100));
      accrueInvestments(s, p);
    }
    expect(s.inv.cdb.principal).toBe(reais(12000));
    expect(s.inv.cdb.balance).toBeGreaterThan(reais(20000));
  });

  it('applies the regressive IR table on redemption', () => {
    expect(irRate(p, 3)).toBe(0.225);
    expect(irRate(p, 25)).toBe(0.15);
    const lot = { balance: reais(1200), principal: reais(1000), holdingMonths: 30 };
    const net = redeem(lot, p, reais(1200), true);
    // gain 200, 15% tax = 30
    expect(net).toBe(reais(1170));
    expect(lot.balance).toBe(0);
  });

  it('charges Tesouro custody only above the R$10k exemption', () => {
    const s = newGame({ seed: 1, startAge: 18 }, p);
    deposit(s.inv.tesouroSelic, reais(5000));
    deposit(s.inv.cdb, reais(5000));
    accrueInvestments(s, p);
    // Tesouro Selic pays slightly more than CDB (Selic > CDI) when no custody applies.
    expect(s.inv.tesouroSelic.balance).toBeGreaterThanOrEqual(s.inv.cdb.balance);
  });
});

describe('spendable vs liquid', () => {
  it('refuses a purchase the gross balance covers but the after-tax balance does not, without touching state', async () => {
    const { trySpend, liquid, spendable } = await import('./sim');
    const s = newGame({ seed: 1, startAge: 18 }, p);
    s.cash = 0;
    // A CDB lot whose balance is mostly gain, held under 6 months: 22.5% IR on the gain.
    s.inv.cdb.balance = reais(1000);
    s.inv.cdb.principal = reais(200);
    s.inv.cdb.holdingMonths = 3;
    expect(liquid(s)).toBe(reais(1000));
    expect(spendable(s, p)).toBe(reais(820)); // 1000 - 22.5% of 800
    const before = JSON.stringify(s);
    expect(trySpend(s, p, reais(900))).toBe(false);
    expect(JSON.stringify(s)).toBe(before);
    expect(trySpend(s, p, reais(820))).toBe(true);
    expect(s.cash).toBeGreaterThanOrEqual(0);
    expect(s.cash).toBeLessThan(reais(2));
  });
});
