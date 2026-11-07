import type { Centavos } from './money';
import type { RngState } from './rng';

export type StartAge = 10 | 14 | 18;
export const START_AGES: readonly StartAge[] = [10, 14, 18];
export const END_AGE = 30;

export type SaveTarget = 'cofrinho' | 'poupanca' | 'tesouroSelic' | 'cdb';
export type CardPolicy = 'integral' | 'minimo' | 'parcelar';
export type EducationLevel = 'fundamental' | 'medio' | 'tecnico' | 'superior';
export type StudyTrack = 'tecnico' | 'superiorPublica' | 'superiorEad' | 'cursinho';
export type JobId = 'nenhum' | 'aprendiz' | 'atendente' | 'ifood' | 'tecnico' | 'superior';
export type Living = 'pais' | 'sozinho';

export interface Parcela {
  id: string;
  label: string;
  amount: Centavos;
  remaining: number;
  /** True when the instalments are charged to the credit card statement. */
  onCard: boolean;
}

export interface Loan {
  id: string;
  label: string;
  balance: Centavos;
  rateMonthly: number;
  instalment: Centavos;
  remaining: number;
}

/** One investment bucket. `holdingMonths` is a deposit-weighted average age, used for the IR table. */
export interface Lot {
  balance: Centavos;
  principal: Centavos;
  holdingMonths: number;
}

export interface Investments {
  poupanca: Lot;
  tesouroSelic: Lot;
  cdb: Lot;
}

export interface Card {
  has: boolean;
  blocked: boolean;
  limit: Centavos;
  /** Purchases made this cycle; they become the fatura next month. */
  statement: Centavos;
  /** Unpaid fatura balance accruing rotativo interest. */
  revolving: Centavos;
  /** Consecutive months the balance has sat in rotativo (Res. 4.549/2017 allows one). */
  revolvingMonths: number;
  /** Original debt that entered rotativo, the base for the 100% cap (Lei 14.690/2023). */
  capBase: Centavos;
  /** Interest and charges already accrued against capBase. */
  capCharges: Centavos;
  /** Consecutive months where not even the minimum was paid. */
  monthsUnpaid: number;
  policy: CardPolicy;
}

export interface Standing {
  /** Share of positive monthly surplus to put away, 0..1. */
  savePct: number;
  saveInto: SaveTarget;
  lanche: 'compra' | 'casa';
  /** Monthly betting stake; 0 means none. */
  bets: Centavos;
}

export interface Study {
  track: StudyTrack;
  label: string;
  remaining: number;
  monthlyCost: Centavos;
}

export interface Career {
  job: JobId;
  /** Gross monthly pay for the current job. */
  salary: Centavos;
  level: EducationLevel;
  study: Study | null;
  monthsInJob: number;
}

export interface Macro {
  ipcaAnnual: number;
  selicAnnual: number;
  cdiAnnual: number;
  /** Cumulative price level, 1.0 at game start. Used to deflate the final score. */
  priceIndex: number;
  /** Cumulative wage index, 1.0 at game start. Salaries and the mesada follow it. */
  wageIndex: number;
}

export interface HistoryPoint {
  month: number;
  ageMonths: number;
  netWorth: Centavos;
  cash: Centavos;
  invested: Centavos;
  debt: Centavos;
  wellbeing: number;
}

export type LogKind = 'info' | 'good' | 'bad' | 'event' | 'choice' | 'macro';

export interface LogEntry {
  month: number;
  ageMonths: number;
  kind: LogKind;
  /** Key into content/pt-BR/strings.json `log` section, or a literal when it starts with '='. */
  key: string;
  vars?: Record<string, string | number>;
}

export interface Choice {
  id: string;
  tags: string[];
  /** Optional pre-computed detail line, e.g. the instalment amount. */
  vars?: Record<string, string | number>;
}

export interface Stop {
  eventId: string;
  choices: Choice[];
  vars: Record<string, string | number>;
}

export interface GameState {
  version: 1;
  seed: number;
  startAge: StartAge;
  /** Months since the game started. */
  month: number;
  /** Player age in months. Birthdays fall on multiples of 12. */
  ageMonths: number;
  /** 0 = January. The game starts in January. */
  calendarMonth: number;
  cash: Centavos;
  /** Money under the mattress: no interest, no IR, no access to Pix. */
  cofrinho: Centavos;
  /** Pé-de-Meia annual deposits, locked until age 18. */
  peDeMeiaLocked: Centavos;
  inv: Investments;
  card: Card;
  parcelas: Parcela[];
  loans: Loan[];
  standing: Standing;
  career: Career;
  living: Living;
  hasPhone: boolean;
  hasMoto: boolean;
  hasBankAccount: boolean;
  publicSchool: boolean;
  wellbeing: number;
  negativadoUntilMonth: number | null;
  macro: Macro;
  /** Free-form counters and once-flags used by events. */
  flags: Record<string, number>;
  rng: RngState;
  history: HistoryPoint[];
  log: LogEntry[];
  pending: Stop | null;
  ended: boolean;
  stopsCount: number;
  /** Month index of the last random stop, to space them out. */
  lastRandomStopMonth: number;
}

export const emptyLot = (): Lot => ({ balance: 0, principal: 0, holdingMonths: 0 });

export const ageYears = (s: GameState): number => Math.floor(s.ageMonths / 12);
export const isAdult = (s: GameState): boolean => s.ageMonths >= 18 * 12;
export const isTeen = (s: GameState): boolean => s.ageMonths >= 14 * 12 && s.ageMonths < 18 * 12;
export const isChild = (s: GameState): boolean => s.ageMonths < 14 * 12;
export const isNegativado = (s: GameState): boolean =>
  s.negativadoUntilMonth !== null && s.month < s.negativadoUntilMonth;
