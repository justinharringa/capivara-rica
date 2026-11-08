import { describe, expect, it } from 'vitest';
import { brParams } from './testParams';
import { newGame, stepMonth, choose } from './sim';
import { chooseByTags } from './policies';
import { chargeCard } from './card';

const p = brParams();

describe('the 100% cap on card charges', () => {
  it('holds when a parcelada fatura is itself left unpaid month after month', () => {
    // One purchase of R$ 1.000 on a card whose owner pays nothing, ever. Whatever the
    // rotativo and parcelamento do, charges can never exceed the original debt.
    const s = newGame({ seed: 1, startAge: 18 }, p);
    Object.assign(s, { pending: null }); // not `s.pending = null`: that narrows the type for the rest of the test
    s.hasBankAccount = true;
    s.cash = 0;
    s.career.job = 'nenhum';
    s.card.has = true;
    s.card.limit = 100000000;
    s.card.policy = 'minimo';
    expect(chargeCard(s, 100000)).toBe(true);
    for (let i = 0; i < 48; i += 1) {
      stepMonth(s, p);
      for (let stop = s.pending; stop; stop = s.pending) choose(s, p, stop.eventId === 'vaga' ? 'nao' : chooseByTags(stop, ['capivara', 'capivara2']));
      s.cash = Math.min(s.cash, 0); // no income ever reaches the card
    }
    expect(s.card.capBase).toBeLessThanOrEqual(100000 + 1);
    expect(s.card.capCharges).toBeLessThanOrEqual(s.card.capBase * p.cardCapMultiple + 1);
    const owed = s.card.revolving + s.card.statement + s.parcelas.filter((x) => x.onCard).reduce((a, x) => a + x.amount * x.remaining, 0);
    // Twice the original debt, plus the ceil() rounding of up to 48 instalments.
    expect(owed).toBeLessThanOrEqual(2 * 100000 + 1000);
  });
});
