import { interestOn, annualToMonthly, type Centavos } from './money';
import type { Params } from './params';
import type { GameState, Lot, SaveTarget } from './state';

/** Monthly gross rate of each instrument given the current macro picture. */
export function monthlyRate(s: GameState, p: Params, target: SaveTarget): number {
  switch (target) {
    case 'cofrinho':
      return 0;
    case 'poupanca':
      // 0.5% a.m. + TR while Selic > 8.5% a.a.; otherwise 70% of Selic + TR.
      return s.macro.selicAnnual > 0.085 ? p.poupancaMonthly : annualToMonthly(0.7 * s.macro.selicAnnual);
    case 'tesouroSelic':
      return annualToMonthly(s.macro.selicAnnual);
    case 'cdb':
      return annualToMonthly(s.macro.cdiAnnual * p.cdbPctCdi);
  }
}

/** Regressive income tax on fixed-income gains by holding time. Poupança is exempt. */
export function irRate(p: Params, holdingMonths: number): number {
  if (holdingMonths < 6) return p.irFixedIncome0to6;
  if (holdingMonths < 12) return p.irFixedIncome6to12;
  if (holdingMonths < 24) return p.irFixedIncome12to24;
  return p.irFixedIncome24plus;
}

export function deposit(lot: Lot, amount: Centavos): void {
  if (amount <= 0) return;
  const total = lot.balance + amount;
  lot.holdingMonths = total > 0 ? (lot.holdingMonths * lot.balance) / total : 0;
  lot.balance = total;
  lot.principal += amount;
}

/** Accrue one month of interest on every lot. Tesouro pays the B3 custody fee above the exemption. */
export function accrueInvestments(s: GameState, p: Params): void {
  const lots: Array<[SaveTarget, Lot]> = [
    ['poupanca', s.inv.poupanca],
    ['tesouroSelic', s.inv.tesouroSelic],
    ['cdb', s.inv.cdb],
  ];
  for (const [target, lot] of lots) {
    if (lot.balance <= 0) continue;
    let gain = interestOn(lot.balance, monthlyRate(s, p, target));
    if (target === 'tesouroSelic' && lot.balance > p.tesouroCustodyExemptUpTo) {
      gain -= interestOn(lot.balance - p.tesouroCustodyExemptUpTo, p.tesouroCustodyAnnual / 12);
    }
    lot.balance += gain;
    lot.holdingMonths += 1;
  }
}

export interface Redemption {
  /** What leaves the lot. */
  gross: Centavos;
  /** The share of `gross` that is gain, taxed at `rate`. */
  gain: Centavos;
  rate: number;
  tax: Centavos;
  /** What reaches the account. */
  net: Centavos;
}

/** What redeeming `amount` from a lot would cost, without touching it. */
export function previewRedeem(lot: Lot, p: Params, amount: Centavos, taxable: boolean): Redemption {
  const gross = Math.max(0, Math.min(amount, lot.balance));
  const gainShare = lot.balance > 0 ? Math.max(0, lot.balance - lot.principal) / lot.balance : 0;
  const gain = Math.round(gross * gainShare);
  const rate = taxable ? irRate(p, lot.holdingMonths) : 0;
  const tax = Math.round(gain * rate);
  return { gross, gain, rate, tax, net: gross - tax };
}

/** Redeem `amount` (or everything) from a lot. Returns the net cash after IR on the proportional gain. */
export function redeem(lot: Lot, p: Params, amount: Centavos, taxable: boolean): Centavos {
  const r = previewRedeem(lot, p, amount, taxable);
  if (r.gross <= 0) return 0;
  lot.principal = Math.max(0, lot.principal - (r.gross - r.gain));
  lot.balance -= r.gross;
  return r.net;
}

export const investedTotal = (s: GameState): Centavos =>
  s.inv.poupanca.balance + s.inv.tesouroSelic.balance + s.inv.cdb.balance;

/** Everything put away: cofrinho, the three instruments and the locked Pé-de-Meia. The "Guardado" tile. */
export const savedTotal = (s: GameState): Centavos => investedTotal(s) + s.cofrinho + s.peDeMeiaLocked + s.fgts;

/** Liquid money the player can reach this month, in order of cheapness: cash, cofrinho, then investments. */
export function liquid(s: GameState): Centavos {
  return Math.max(0, s.cash) + s.cofrinho + investedTotal(s);
}

/** Net cash a lot would yield if fully redeemed now, after IR on its gain. */
export function netRedeemable(lot: Lot, p: Params, taxable: boolean): Centavos {
  if (lot.balance <= 0) return 0;
  const gain = Math.max(0, lot.balance - lot.principal);
  const tax = taxable ? Math.round(gain * irRate(p, lot.holdingMonths)) : 0;
  return lot.balance - tax;
}

/**
 * What the player can actually spend this month: cash, cofrinho and investments net of the
 * income tax a redemption would trigger. `liquid()` is the gross figure for display; this is
 * the one every affordability check must use, or a purchase can push cash negative.
 */
export function spendable(s: GameState, p: Params): Centavos {
  return (
    Math.max(0, s.cash) +
    s.cofrinho +
    netRedeemable(s.inv.cdb, p, true) +
    netRedeemable(s.inv.tesouroSelic, p, true) +
    netRedeemable(s.inv.poupanca, p, false)
  );
}

/** Pull `amount` out of cash, cofrinho and investments in that order. Returns the shortfall. */
export function drawDown(s: GameState, p: Params, amount: Centavos): Centavos {
  let need = amount;
  const fromCash = Math.min(Math.max(0, s.cash), need);
  s.cash -= fromCash;
  need -= fromCash;
  if (need > 0) {
    const c = Math.min(s.cofrinho, need);
    s.cofrinho -= c;
    need -= c;
  }
  const order: Array<[Lot, boolean]> = [
    [s.inv.cdb, true],
    [s.inv.tesouroSelic, true],
    [s.inv.poupanca, false],
  ];
  for (const [lot, taxable] of order) {
    if (need <= 0) break;
    // Redeem enough gross to cover the net need: gross * (net/gross ratio) >= need.
    const netAll = netRedeemable(lot, p, taxable);
    const ratio = netAll > 0 ? netAll / lot.balance : 1;
    const gross = Math.min(lot.balance, Math.ceil(need / ratio) + 1);
    const net = redeem(lot, p, gross, taxable);
    const used = Math.min(net, need);
    s.cash += net - used;
    need -= used;
  }
  return need;
}
