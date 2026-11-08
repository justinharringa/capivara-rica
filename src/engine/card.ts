import { instalment, interestOn, type Centavos } from './money';
import type { Params } from './params';
import type { GameState, Parcela } from './state';
import { drawDown } from './investments';

/**
 * The Brazilian credit card, as the law describes it in 2026.
 *
 * - The fatura is the previous cycle's purchases plus any instalments charged to the card.
 * - Whatever is not paid goes to rotativo at `cardRotativoMonthly` (about 15% a month in 2026).
 * - After one cycle in rotativo the balance must be offered as a parcelamento
 *   (CMN Res. 4.549/2017); here it converts automatically when the policy is "mínimo".
 * - Interest and charges on rotativo + parcelamento together cannot exceed 100% of the
 *   original debt (Lei 14.690/2023, CMN Res. 5.112/2023, in force 3 Jan 2024). The cap counts
 *   from the first day of rotativo and is not reset by switching to parcelamento.
 *   How new purchases interact with an existing capped debt is still unverified; this model
 *   adds each new unpaid balance to capBase, which is the reading Idec criticised as generous.
 */

export const CARD_PARCELAMENTO_MONTHS = 12;

/** How much the cap still allows in charges. */
export function capRoom(s: GameState, p: Params): Centavos {
  return Math.max(0, Math.round(s.card.capBase * p.cardCapMultiple) - s.card.capCharges);
}

export function chargeCard(s: GameState, amount: Centavos): boolean {
  const c = s.card;
  if (!c.has || c.blocked) return false;
  if (c.statement + c.revolving + amount > c.limit) return false;
  c.statement += amount;
  return true;
}

/** Total due this month: the fatura (last cycle) plus the whole rotativo balance. */
export function faturaDue(s: GameState): Centavos {
  return s.card.statement + s.card.revolving;
}

/** Accrue one month of rotativo interest, respecting the legal cap. */
export function accrueRotativo(s: GameState, p: Params): Centavos {
  const c = s.card;
  if (c.revolving <= 0) return 0;
  const raw = interestOn(c.revolving, p.cardRotativoMonthly);
  const allowed = Math.min(raw, capRoom(s, p));
  c.revolving += allowed;
  c.capCharges += allowed;
  c.revolvingMonths += 1;
  return allowed;
}

/** Convert the rotativo balance into 12 instalments at the parcelado rate, inside the cap. */
export function parcelarFatura(s: GameState, p: Params): Parcela | null {
  const c = s.card;
  const principal = c.revolving;
  if (principal <= 0) return null;
  let pmt = instalment(principal, p.cardParceladoMonthly, CARD_PARCELAMENTO_MONTHS);
  let totalInterest = pmt * CARD_PARCELAMENTO_MONTHS - principal;
  const room = capRoom(s, p);
  if (totalInterest > room) {
    totalInterest = room;
    pmt = Math.ceil((principal + totalInterest) / CARD_PARCELAMENTO_MONTHS);
  }
  c.capCharges += totalInterest;
  c.revolving = 0;
  c.revolvingMonths = 0;
  const parcela: Parcela = {
    id: `fatura-${s.month}`,
    label: 'fatura parcelada',
    amount: pmt,
    remaining: CARD_PARCELAMENTO_MONTHS,
    onCard: true,
    interest: Math.round(totalInterest / CARD_PARCELAMENTO_MONTHS),
  };
  s.parcelas.push(parcela);
  return parcela;
}

export interface CardSettlement {
  due: Centavos;
  paid: Centavos;
  toRevolving: Centavos;
  interest: Centavos;
  parcelou: boolean;
  missedMinimum: boolean;
}

/**
 * Settle this month's fatura according to the player's policy, drawing on cash
 * and then savings. Card instalments were already added to `statement` by the
 * parcela step, so they are part of `due`.
 */
export function settleCard(s: GameState, p: Params, refinanced: Centavos = 0): CardSettlement {
  const c = s.card;
  const due = faturaDue(s);
  const result: CardSettlement = { due, paid: 0, toRevolving: 0, interest: 0, parcelou: false, missedMinimum: false };
  if (!c.has || due <= 0) {
    c.statement = 0;
    c.monthsUnpaid = 0;
    return result;
  }

  const minimum = Math.min(due, Math.max(Math.round(due * p.cardMinimumPaymentPct), 1));
  let target: Centavos;
  switch (c.policy) {
    case 'integral':
      target = due;
      break;
    case 'minimo':
      target = minimum;
      break;
    case 'parcelar':
      // Pay the current cycle's purchases; the rest is parcelado below.
      target = c.statement;
      break;
  }

  const shortfall = drawDown(s, p, target);
  const paid = target - shortfall;
  result.paid = paid;

  const unpaid = due - paid;
  // New credit that enters rotativo for the first time widens the cap base. Instalments of
  // an earlier parcelada fatura that go unpaid again are the same debt coming round, so they
  // do not: otherwise the base grows on every re-entry and the 100% cap never binds (seen on
  // 2026-11-08: a spendthrift life reached a capBase of R$ 38M).
  const newlyRevolving = Math.max(0, unpaid - c.revolving);
  c.capBase += Math.max(0, newlyRevolving - Math.min(refinanced, unpaid));
  c.revolving = unpaid;
  c.statement = 0;

  if (paid < minimum) {
    c.monthsUnpaid += 1;
    result.missedMinimum = true;
  } else {
    c.monthsUnpaid = 0;
  }

  if (c.revolving > 0) {
    if (c.policy === 'parcelar' || c.revolvingMonths >= 1) {
      // Capture the balance before parcelarFatura() moves it into instalments and zeroes it.
      result.toRevolving = c.revolving;
      parcelarFatura(s, p);
      result.parcelou = true;
    } else {
      result.interest = accrueRotativo(s, p);
      result.toRevolving = c.revolving;
    }
  } else {
    c.revolvingMonths = 0;
    if (s.parcelas.every((x) => !x.onCard)) {
      // Debt fully cleared: the cap base resets for the next episode.
      c.capBase = 0;
      c.capCharges = 0;
    }
  }
  return result;
}
