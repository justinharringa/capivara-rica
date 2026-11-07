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
