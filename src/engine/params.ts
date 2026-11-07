import type { Centavos } from './money';

/**
 * Every economic parameter carries its own provenance. A build can refuse to
 * ship numbers that are still `memory` or `placeholder` (see scripts/check-data.ts).
 */
export type ParamStatus = 'verified' | 'secondary' | 'memory' | 'placeholder';

export interface ParamEntry {
  value: number;
  unit: string;
  asOf: string;
  source: string;
  status: ParamStatus;
  note?: string;
}

export interface ParamFile {
  country: string;
  asOf: string;
  currency: string;
  params: Record<string, ParamEntry>;
}

export const PARAM_KEYS = [
  'minimumWage',
  'inssRateBand1',
  'valeTransporteRate',
  'cardRotativoMonthly',
  'cardParceladoMonthly',
  'cardCapMultiple',
  'cardMinimumPaymentPct',
  'cardFirstLimit',
  'chequeEspecialMonthly',
  'personalLoanMonthly',
  'consignadoMonthly',
  'motoFinanceMonthly',
  'motoFinanceMonths',
  'selicAnnual',
  'cdiAnnual',
  'poupancaMonthly',
  'tesouroCustodyAnnual',
  'tesouroCustodyExemptUpTo',
  'cdbPctCdi',
  'irFixedIncome0to6',
  'irFixedIncome6to12',
  'irFixedIncome12to24',
  'irFixedIncome24plus',
  'ipcaAnnualLast',
  'ipcaExpected',
  'inflationTarget',
  'mesadaMonthly',
  'lanchePrice',
  'schoolDaysPerMonth',
  'jovemAprendizPay4h',
  'peDeMeiaMonthly',
  'peDeMeiaAnnualLocked',
  'cestaBasicaSP',
  'busFareSP',
  'rentKitnetSP',
  'phonePlan',
  'entryPhonePrice',
  'pixDiscountTypical',
  'motoPrice',
  'privateTuitionMonthly',
  'eadTuitionMonthly',
  'tecnicoTuitionMonthly',
  'cursinhoMonthly',
  'salaryAuxAdmin',
  'salaryTecnicoEnfermagem',
  'salaryDevJunior',
  'salaryEnfermeiro',
  'salaryProfessor',
  'salaryIfood',
  'medioPremium',
  'tecnicoPremium',
  'degreePremium',
  'comprometimentoYellow',
  'comprometimentoRed',
  'phoneTheftAnnualProb',
  'betsExpectedLoss',
  'healthPlanYoung',
  'negativacaoYears',
  'familyContribution',
  'motoRunningCost',
] as const;

export type ParamKey = (typeof PARAM_KEYS)[number];
export type Params = Record<ParamKey, number>;

/** Validate a param file and flatten it to plain numbers for the engine. */
export function loadParams(file: ParamFile): Params {
  const out = {} as Record<string, number>;
  for (const key of PARAM_KEYS) {
    const entry = file.params[key];
    if (!entry) throw new Error(`Missing parameter "${key}" in ${file.country}/${file.asOf}`);
    if (typeof entry.value !== 'number' || Number.isNaN(entry.value)) {
      throw new Error(`Parameter "${key}" has a non-numeric value`);
    }
    out[key] = entry.value;
  }
  return out as Params;
}

export const centavos = (p: Params, key: ParamKey): Centavos => Math.round(p[key]);
