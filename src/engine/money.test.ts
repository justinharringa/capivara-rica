import { describe, expect, it } from 'vitest';
import { annualToMonthly, monthlyToAnnual, futureValueOfSeries, instalment, reais, formatBRL } from './money';

describe('rates', () => {
  it('converts the 2026 rotativo (451.7% a.a.) to about 15.3% a.m.', () => {
    expect(annualToMonthly(4.517)).toBeCloseTo(0.153, 2);
  });
  it('round-trips monthly and annual', () => {
    expect(monthlyToAnnual(annualToMonthly(0.1375))).toBeCloseTo(0.1375, 10);
  });
});

describe('future value', () => {
  it('matches a hand computation for R$100/month at 0.5% for 12 months', () => {
    // (1.005^12 - 1)/0.005 * 1.005 = 12.3972 → R$1,239.72
    expect(futureValueOfSeries(reais(100), 0.005, 12)).toBe(123972);
  });
  it('is linear at zero rate', () => {
    expect(futureValueOfSeries(reais(50), 0, 10)).toBe(reais(500));
  });
});

describe('instalment', () => {
  it('prices a R$17,350 moto at 1.57% over 60 months near R$455', () => {
    const pmt = instalment(reais(17350), 0.0157, 60);
    expect(pmt).toBeGreaterThan(reais(440));
    expect(pmt).toBeLessThan(reais(470));
  });
  it('formats in pt-BR', () => {
    expect(formatBRL(123456).replace(/ /g, ' ')).toBe('R$ 1.234,56');
  });
});
