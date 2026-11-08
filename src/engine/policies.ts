import type { Policy } from './sim';
import { setStanding, setCardPolicy, monthlyIncome, monthlyFixedCosts, committedMonthly, priced } from './sim';
import type { Stop } from './state';

/** Picks the first choice carrying a tag, in priority order, else the first choice. */
export function chooseByTags(stop: Stop, priority: string[]): string {
  for (const tag of priority) {
    const c = stop.choices.find((x) => x.tags.includes(tag));
    if (c) return c.id;
  }
  const first = stop.choices[0];
  if (!first) throw new Error(`Stop ${stop.eventId} has no choices`);
  return first.id;
}

/**
 * The ghost: calm, saves a fifth of every surplus, lives a normal (not stingy) lifestyle,
 * pays the fatura in full, studies when offered, never bets, buys used phones.
 */
export const capivaraPolicy: Policy = {
  // Recorded in the action log (third argument) so a policy-driven life replays exactly.
  onStart: (s) => {
    setStanding(s, { savePct: 0.2, lanche: 'casa', bets: 0, lifestyle: 'normal' }, true);
    if (s.hasBankAccount) setStanding(s, { saveInto: 'cdb' }, true);
    setCardPolicy(s, 'integral', true);
  },
  choose: (s, p, stop) => {
    // In the red, she tightens the belt before anything else (recorded, so her life replays).
    if (s.cash < 0 && s.standing.lifestyle !== 'economico') setStanding(s, { lifestyle: 'economico' }, true);
    // A child only when the budget already has room for it; otherwise "esperar mais um pouco".
    if (stop.eventId === 'filho') {
      const room = monthlyIncome(s, p) - monthlyFixedCosts(s, p) - committedMonthly(s, p);
      const custo = Math.round(priced(s, p.childMonthlyCost) / (s.flags.juntos ? 2 : 1));
      if (room < custo && stop.choices.some((c) => c.id === 'depois')) return 'depois';
    }
    return chooseByTags(stop, ['capivara', 'capivara2']);
  },
};

/** Always takes the first offered choice; useful as a stress test. */
export const firstChoicePolicy: Policy = {
  choose: (_s, _p, stop) => chooseByTags(stop, []),
};

/** The anti-ghost: spends, pays the minimum, bets. Used in tests to prove the economy bites. */
export const gastaoPolicy: Policy = {
  onStart: (s) => {
    setStanding(s, { savePct: 0, lanche: 'compra', lifestyle: 'folgado' }, true);
    setCardPolicy(s, 'minimo', true);
  },
  choose: (_s, _p, stop) => chooseByTags(stop, ['parcelado', 'comprar', 'gastar', 'mensal', 'cantina', 'minimo', 'financiar', 'parcelar', 'aceitar', 'comemorar', 'sozinho', 'ifood', 'nada', 'continuar', 'ignorar', 'ficar_sem', 'sus']),
};
