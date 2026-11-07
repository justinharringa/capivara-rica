import type { Policy } from './sim';
import { setStanding } from './sim';
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
 * The ghost: calm, saves a fifth of every surplus, pays the fatura in full,
 * studies when offered, never bets, buys used phones.
 */
export const capivaraPolicy: Policy = {
  onStart: (s) => {
    setStanding(s, { savePct: 0.2, lanche: 'casa', bets: 0 });
    if (s.hasBankAccount) setStanding(s, { saveInto: 'cdb' });
    s.card.policy = 'integral';
  },
  choose: (_s, _p, stop) => chooseByTags(stop, ['capivara', 'capivara2']),
};

/** Always takes the first offered choice; useful as a stress test. */
export const firstChoicePolicy: Policy = {
  choose: (_s, _p, stop) => chooseByTags(stop, []),
};

/** The anti-ghost: spends, pays the minimum, bets. Used in tests to prove the economy bites. */
export const gastaoPolicy: Policy = {
  onStart: (s) => {
    setStanding(s, { savePct: 0, lanche: 'compra' });
    s.card.policy = 'minimo';
  },
  choose: (_s, _p, stop) => chooseByTags(stop, ['parcelado', 'comprar', 'gastar', 'mensal', 'cantina', 'minimo', 'financiar', 'parcelar', 'aceitar', 'comemorar', 'sozinho', 'ifood', 'nada', 'continuar', 'ignorar', 'ficar_sem', 'sus']),
};
