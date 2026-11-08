/**
 * All money in the engine is an integer number of centavos.
 * Floating-point reais drift after a few hundred compounding steps; centavos do not.
 */
export type Centavos = number;

export const reais = (r: number): Centavos => Math.round(r * 100);

/** Multiply centavos by a rate, rounding to the nearest centavo. */
export const mulRate = (c: Centavos, rate: number): Centavos => Math.round(c * rate);

/** Compound interest: one period at `rate` on `c`. Returns the interest only. */
export const interestOn = (c: Centavos, rate: number): Centavos => mulRate(c, rate);

/** Convert an annual rate to the equivalent monthly rate: (1+i)^(1/12) - 1. */
export const annualToMonthly = (annual: number): number => Math.pow(1 + annual, 1 / 12) - 1;

/** Convert a monthly rate to the equivalent annual rate: (1+i)^12 - 1. Brazil quotes both. */
export const monthlyToAnnual = (monthly: number): number => Math.pow(1 + monthly, 12) - 1;

/** Future value of a fixed monthly deposit at a monthly rate (deposit at start of each month). */
export function futureValueOfSeries(monthly: Centavos, rateMonthly: number, months: number): Centavos {
  if (rateMonthly === 0) return monthly * months;
  const g = Math.pow(1 + rateMonthly, months);
  return Math.round(monthly * ((g - 1) / rateMonthly) * (1 + rateMonthly));
}

/** Price (PMT) of a loan: level instalment for `principal` at `rateMonthly` over `n` months. */
/**
 * Parse what a person types into a reais field, into centavos. Accepts "10,50", "10.50",
 * "1.000", "1.000,50", "R$ 2000" and "2000". A single dot followed by one or two digits is a
 * decimal point; dots followed by three digits are thousands separators. Returns 0 on nonsense.
 */
export function parseReais(text: string): Centavos {
  const t = text.replace(/[^\d.,-]/g, '').trim();
  if (!t) return 0;
  let normalized: string;
  if (t.includes(',')) normalized = t.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) normalized = t.replace(/\./g, '');
  else normalized = t;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function instalment(principal: Centavos, rateMonthly: number, n: number): Centavos {
  if (n <= 0) return principal;
  if (rateMonthly === 0) return Math.ceil(principal / n);
  const f = Math.pow(1 + rateMonthly, n);
  return Math.round((principal * rateMonthly * f) / (f - 1));
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatBRL = (c: Centavos): string => brl.format(c / 100);
export const formatPct = (rate: number, digits = 1): string =>
  `${(rate * 100).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
