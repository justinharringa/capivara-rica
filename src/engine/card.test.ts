import { describe, expect, it } from 'vitest';
import { brParams } from './testParams';
import { newGame, stepMonth, choose } from './sim';
import { chargeCard, settleCard, capRoom, accrueRotativo } from './card';
import { reais } from './money';
import type { GameState } from './state';

const p = brParams();

function adultWithCard(): GameState {
  const s = newGame({ seed: 7, startAge: 18 }, p);
  // Clear the opening stop so we can drive the card directly.
  while (s.pending) choose(s, p, s.pending.choices[0]!.id);
  s.card.has = true;
  s.card.limit = reais(5000);
  s.card.policy = 'integral';
  s.cash = 0;
  return s;
}

describe('rotativo and the 100% cap', () => {
  it('doubles a R$1,000 debt in about five months and then stops growing', () => {
    const s = adultWithCard();
    s.card.policy = 'minimo';
    s.cash = 0;
    expect(chargeCard(s, reais(1000))).toBe(true);
    // Month 1: nothing paid (no cash), the whole balance enters rotativo.
    settleCard(s, p);
    expect(s.card.capBase).toBe(reais(1000));
    let months = 1;
    // Keep it in rotativo (bypass the automatic parcelamento) to see the cap bite.
    while (capRoom(s, p) > 0 && months < 24) {
      accrueRotativo(s, p);
      months += 1;
    }
    expect(s.card.capCharges).toBe(reais(1000));
    expect(s.card.revolving).toBe(reais(2000));
    expect(months).toBeLessThanOrEqual(7);
    expect(accrueRotativo(s, p)).toBe(0);
  });

  it('converts to parcelamento after one cycle when paying the minimum', () => {
    const s = adultWithCard();
    s.card.policy = 'minimo';
    s.cash = reais(10_000);
    chargeCard(s, reais(1000));
    settleCard(s, p); // pays 15%, rest to rotativo
    expect(s.card.revolving).toBeGreaterThan(0);
    expect(s.parcelas.length).toBe(0);
    settleCard(s, p); // second cycle: must become instalments
    expect(s.card.revolving).toBe(0);
    expect(s.parcelas.some((x) => x.id.startsWith('fatura-'))).toBe(true);
    const total = s.parcelas[0]!.amount * s.parcelas[0]!.remaining + s.card.capCharges;
    // Interest + charges never exceed the original debt.
    expect(s.card.capCharges).toBeLessThanOrEqual(s.card.capBase);
    expect(total).toBeGreaterThan(0);
  });

  it('reports the parcelled balance, not zero, when the fatura is converted', () => {
    const s = adultWithCard();
    s.card.policy = 'parcelar';
    s.cash = 0;
    chargeCard(s, reais(1000));
    const r = settleCard(s, p);
    expect(r.parcelou).toBe(true);
    expect(r.toRevolving).toBe(reais(1000));
    expect(s.card.revolving).toBe(0);
  });

  it('pays in full when there is cash and resets the cap base', () => {
    const s = adultWithCard();
    s.cash = reais(3000);
    chargeCard(s, reais(1000));
    const r = settleCard(s, p);
    expect(r.paid).toBe(reais(1000));
    expect(s.cash).toBe(reais(2000));
    expect(s.card.revolving).toBe(0);
    expect(s.card.capBase).toBe(0);
  });

  it('refuses purchases over the limit', () => {
    const s = adultWithCard();
    expect(chargeCard(s, reais(6000))).toBe(false);
  });

  it('a full month step keeps the invariant charges <= capBase', () => {
    const s = adultWithCard();
    s.card.policy = 'minimo';
    chargeCard(s, reais(2000));
    for (let i = 0; i < 36; i++) {
      stepMonth(s, p);
      if (s.pending) choose(s, p, s.pending.choices[s.pending.choices.length - 1]!.id);
      expect(s.card.capCharges).toBeLessThanOrEqual(Math.round(s.card.capBase * p.cardCapMultiple) + 1);
    }
  });
});
