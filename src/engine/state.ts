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
/** How much of the discretionary budget (lazer, roupa, rolê) the player spends each month. */
export type Lifestyle = 'economico' | 'normal' | 'folgado';
export const LIFESTYLES: readonly Lifestyle[] = ['economico', 'normal', 'folgado'];

/** Life chapters. The game pauses on a chapter card at each boundary after the first. */
export interface Chapter {
  n: number;
  id: string;
  fromAge: number;
  toAge: number;
}
export const CHAPTERS: readonly Chapter[] = [
  { n: 1, id: 'infancia', fromAge: 10, toAge: 14 },
  { n: 2, id: 'ensino_medio', fromAge: 14, toAge: 18 },
  { n: 3, id: 'primeiro_emprego', fromAge: 18, toAge: 22 },
  { n: 4, id: 'vida_adulta', fromAge: 22, toAge: 26 },
  { n: 5, id: 'rumo_aos_30', fromAge: 26, toAge: 30 },
];
export function chapterOf(ageMonths: number): Chapter {
  const years = ageMonths / 12;
  return CHAPTERS.find((c) => years < c.toAge) ?? CHAPTERS[CHAPTERS.length - 1]!;
}

export interface Parcela {
  id: string;
  label: string;
  amount: Centavos;
  remaining: number;
  /** True when the instalments are charged to the credit card statement. */
  onCard: boolean;
  /** Interest inside each instalment, when the instalments carry any (a parcelada fatura). */
  interest?: Centavos;
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
  lifestyle: Lifestyle;
}

/** Running totals the chapter cards and the end screen report. */
export interface Stats {
  /** Interest credited on poupança, Tesouro and CDB. */
  interestEarned: Centavos;
  /** Rotativo and parcelado charges, loan interest and cheque especial. */
  interestPaid: Centavos;
  /** Discretionary spending (lifestyle) actually paid. */
  leisureSpent: Centavos;
}

/** Where the cash went last month, for the feedback line under the stats. */
export interface MonthSummary {
  month: number;
  income: Centavos;
  /** Fixed costs including lifestyle. */
  costs: Centavos;
  /** Instalments, loan payments and whatever was paid on the fatura. */
  committed: Centavos;
  /** The standing order that left cash for savings. */
  saved: Centavos;
  interestEarned: Centavos;
  interestPaid: Centavos;
  betsLost: Centavos;
  cashBefore: Centavos;
  cashAfter: Centavos;
}

/** Snapshot taken at the start of the current chapter, so a chapter card can show the delta. */
export interface ChapterStart {
  ageMonths: number;
  netWorth: Centavos;
  interestEarned: Centavos;
  interestPaid: Centavos;
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
  version: 2;
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
  stats: Stats;
  lastMonth: MonthSummary | null;
  chapterStart: ChapterStart;
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
