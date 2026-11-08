import { type Centavos, instalment, interestOn, futureValueOfSeries } from './money';
import type { Params } from './params';
import { initRng, random, randomNormal, clamp } from './rng';
import {
  type GameState,
  type StartAge,
  type Stop,
  type Choice,
  type LogKind,
  type Standing,
  type CardPolicy,
  type Lifestyle,
  type MonthSummary,
  emptyLot,
  chapterOf,
  END_AGE,
  isAdult,
  isChild,
  isTeen,
  ageYears,
  isNegativado,
} from './state';
import { accrueInvestments, deposit, drawDown, investedTotal, liquid, spendable, monthlyRate } from './investments';
import { settleCard, chargeCard, accrueRotativo } from './card';
import { annualRaise, jobSalary, netPay, LEVEL_RANK } from './career';
import { EVENTS, type EventDef, type EventContext } from './events';

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

export interface NewGameOptions {
  seed: number;
  startAge: StartAge;
  /** Public school enables Pé-de-Meia. Defaults to true, which is the majority case. */
  publicSchool?: boolean;
}

export function newGame(opts: NewGameOptions, p: Params): GameState {
  const { seed, startAge } = opts;
  const adult = startAge >= 18;
  const s: GameState = {
    version: 2,
    seed,
    startAge,
    month: 0,
    ageMonths: startAge * 12,
    calendarMonth: 0,
    cash: adult ? 0 : 0,
    cofrinho: 0,
    peDeMeiaLocked: 0,
    inv: { poupanca: emptyLot(), tesouroSelic: emptyLot(), cdb: emptyLot() },
    card: {
      has: false,
      blocked: false,
      limit: 0,
      statement: 0,
      revolving: 0,
      revolvingMonths: 0,
      capBase: 0,
      capCharges: 0,
      monthsUnpaid: 0,
      policy: 'integral',
    },
    parcelas: [],
    loans: [],
    standing: { savePct: 0, saveInto: 'cofrinho', lanche: 'compra', bets: 0, lifestyle: 'normal' },
    career: {
      job: 'nenhum',
      salary: 0,
      level: adult ? 'medio' : 'fundamental',
      study: null,
      monthsInJob: 0,
    },
    living: 'pais',
    hasPhone: adult,
    hasMoto: false,
    hasBankAccount: adult,
    publicSchool: opts.publicSchool ?? true,
    wellbeing: 60,
    negativadoUntilMonth: null,
    macro: {
      ipcaAnnual: p.ipcaExpected,
      selicAnnual: p.selicAnnual,
      cdiAnnual: p.cdiAnnual,
      priceIndex: 1,
      wageIndex: 1,
    },
    flags: {},
    stats: { interestEarned: 0, interestPaid: 0, leisureSpent: 0 },
    lastMonth: null,
    chapterStart: { ageMonths: startAge * 12, netWorth: 0, interestEarned: 0, interestPaid: 0 },
    rng: initRng(seed),
    history: [],
    log: [],
    pending: null,
    ended: false,
    stopsCount: 0,
    lastRandomStopMonth: -99,
  };
  if (adult) s.standing.saveInto = 'poupanca';
  pushHistory(s);
  pickEvent(s, p);
  return s;
}

// ---------------------------------------------------------------------------
// Helpers shared with events
// ---------------------------------------------------------------------------

export function log(s: GameState, kind: LogKind, key: string, vars?: Record<string, string | number>): void {
  s.log.push({ month: s.month, ageMonths: s.ageMonths, kind, key, vars });
  if (s.log.length > 400) s.log.splice(0, s.log.length - 400);
}

export function bumpWellbeing(s: GameState, delta: number): void {
  s.wellbeing = clamp(s.wellbeing + delta, 0, 100);
}

/**
 * Spend from cash, then savings. Returns false and changes nothing when the money is not
 * there after income tax on redemptions. Any centavo-level rounding residue lands on cash.
 */
export function trySpend(s: GameState, p: Params, amount: Centavos): boolean {
  if (spendable(s, p) < amount) return false;
  const short = drawDown(s, p, amount);
  if (short > 0) s.cash -= short;
  return true;
}

export function addParcela(s: GameState, id: string, label: string, amount: Centavos, months: number, onCard: boolean): void {
  s.parcelas.push({ id: `${id}-${s.month}`, label, amount, remaining: months, onCard });
}

export function addLoan(s: GameState, id: string, label: string, principal: Centavos, rateMonthly: number, months: number): void {
  s.loans.push({
    id: `${id}-${s.month}`,
    label,
    balance: principal,
    rateMonthly,
    instalment: instalment(principal, rateMonthly, months),
    remaining: months,
  });
}

export function saveInto(s: GameState, amount: Centavos): void {
  if (amount <= 0) return;
  switch (s.standing.saveInto) {
    case 'cofrinho':
      s.cofrinho += amount;
      break;
    case 'poupanca':
      deposit(s.inv.poupanca, amount);
      break;
    case 'tesouroSelic':
      deposit(s.inv.tesouroSelic, amount);
      break;
    case 'cdb':
      deposit(s.inv.cdb, amount);
      break;
  }
}

export const priced = (s: GameState, base: Centavos): Centavos => Math.round(base * s.macro.priceIndex);

// ---------------------------------------------------------------------------
// Derived figures
// ---------------------------------------------------------------------------

export function debtTotal(s: GameState): Centavos {
  const parcelas = s.parcelas.reduce((a, x) => a + x.amount * x.remaining, 0);
  const loans = s.loans.reduce((a, x) => a + x.balance, 0);
  const overdraft = s.cash < 0 ? -s.cash : 0;
  return s.card.statement + s.card.revolving + parcelas + loans + overdraft;
}

export function netWorth(s: GameState): Centavos {
  return Math.max(0, s.cash) + s.cofrinho + s.peDeMeiaLocked + investedTotal(s) - debtTotal(s);
}

/** Net worth in reais of the start year. */
export const score = (s: GameState): Centavos => Math.round(netWorth(s) / s.macro.priceIndex);

export function monthlyIncome(s: GameState, p: Params): Centavos {
  let total = 0;
  if (s.career.job !== 'nenhum') total += netPay(s, p);
  if (!isAdult(s) && s.living === 'pais' && s.career.job === 'nenhum') {
    total += Math.round((p.mesadaMonthly + p.mesadaYearlyStep * Math.max(0, ageYears(s) - 10)) * s.macro.wageIndex);
  }
  if (s.flags.peDeMeia && isTeen(s)) total += priced(s, p.peDeMeiaMonthly);
  return total;
}

/** The lifestyle multiplier on the discretionary budget. */
export function lifestyleFactor(p: Params, lifestyle: Lifestyle): number {
  switch (lifestyle) {
    case 'economico':
      return p.lifestyleEconomicoFactor;
    case 'normal':
      return 1;
    case 'folgado':
      return p.lifestyleFolgadoFactor;
  }
}

/**
 * Discretionary spending (rolê, roupa, lazer, transporte) every month. A teen with a salary
 * pays the teen base; an adult pays the adult base; a child or a teen on mesada pays nothing
 * here, their pocket money is the lanche and the one-off events. Scaled by the lifestyle.
 */
export function leisureCost(s: GameState, p: Params, lifestyle: Lifestyle = s.standing.lifestyle): Centavos {
  let base = 0;
  if (isAdult(s)) base = p.leisureAdultMonthly;
  else if (isTeen(s) && s.career.job !== 'nenhum') base = p.leisureTeenMonthly;
  return Math.round(priced(s, base) * lifestyleFactor(p, lifestyle));
}

/** How the lifestyle moves the wellbeing level the player drifts back to (60 by default). */
export function lifestyleMood(lifestyle: Lifestyle): number {
  return lifestyle === 'economico' ? -5 : lifestyle === 'folgado' ? 5 : 0;
}

export function monthlyFixedCosts(s: GameState, p: Params): Centavos {
  let total = leisureCost(s, p);
  if (!isAdult(s) && s.standing.lanche === 'compra') total += priced(s, p.lanchePrice * p.schoolDaysPerMonth);
  if (s.hasPhone) total += priced(s, p.phonePlan);
  if (isAdult(s)) {
    if (s.living === 'sozinho') total += priced(s, p.rentKitnetSP + p.cestaBasicaSP);
    else if (s.career.job !== 'nenhum') total += priced(s, p.familyContribution);
    if (s.career.job === 'ifood' || s.career.job === 'nenhum') total += priced(s, p.busFareSP * 40);
  }
  if (s.hasMoto) total += priced(s, p.motoRunningCost);
  if (s.career.study) total += s.career.study.monthlyCost;
  return total;
}

export function committedMonthly(s: GameState, p: Params): Centavos {
  const parcelas = s.parcelas.reduce((a, x) => a + x.amount, 0);
  const loans = s.loans.reduce((a, x) => a + x.instalment, 0);
  const cardMin = s.card.revolving > 0 ? Math.round(s.card.revolving * p.cardMinimumPaymentPct) : 0;
  return parcelas + loans + cardMin;
}

/** Share of net income already promised to instalments and loans. */
export function comprometimento(s: GameState, p: Params): number {
  const income = monthlyIncome(s, p);
  if (income <= 0) return committedMonthly(s, p) > 0 ? 1 : 0;
  return committedMonthly(s, p) / income;
}

export function projectSavings(s: GameState, p: Params, monthly: Centavos, months: number): Centavos {
  return futureValueOfSeries(monthly, monthlyRate(s, p, s.standing.saveInto), months);
}

// ---------------------------------------------------------------------------
// The month
// ---------------------------------------------------------------------------

function pushHistory(s: GameState): void {
  s.history.push({
    month: s.month,
    ageMonths: s.ageMonths,
    netWorth: netWorth(s),
    cash: s.cash,
    invested: investedTotal(s) + s.cofrinho,
    debt: debtTotal(s),
    wellbeing: s.wellbeing,
  });
}

function yearlyMacro(s: GameState, p: Params): void {
  const m = s.macro;
  // Inflation mean-reverts toward 4.5% a year, with noise; clamped to 2%..12%.
  const ipcaMean = 0.5 * m.ipcaAnnual + 0.5 * 0.045;
  m.ipcaAnnual = clamp(randomNormal(s.rng, 'macro', ipcaMean, 0.015), 0.02, 0.12);
  // The real Selic drifts around 5%; 2026's 8% is unusually high and should not persist.
  const realMean = 0.5 * (m.selicAnnual - m.ipcaAnnual) + 0.5 * 0.05;
  const real = clamp(randomNormal(s.rng, 'macro', realMean, 0.02), 0.0, 0.09);
  m.selicAnnual = clamp(m.ipcaAnnual + real, 0.05, 0.2);
  m.cdiAnnual = m.selicAnnual - 0.001;
  const gdp = clamp(randomNormal(s.rng, 'macro', 0.02, 0.01), 0, 0.03);
  m.priceIndex *= 1 + m.ipcaAnnual;
  m.wageIndex *= 1 + m.ipcaAnnual + gdp;
  annualRaise(s, p);
  // A card paid on time all year earns a larger limit, up to three months of pay.
  if (s.card.has && !s.card.blocked && !s.flags.cardMissedThisYear) {
    const ceiling = Math.max(s.card.limit, 3 * Math.max(s.career.salary, p.minimumWage));
    s.card.limit = Math.min(ceiling, Math.round(s.card.limit * 1.2));
  }
  s.flags.cardMissedThisYear = 0;
  log(s, 'macro', 'ano_novo', {
    ipca: (m.ipcaAnnual * 100).toFixed(1),
    selic: (m.selicAnnual * 100).toFixed(2),
  });
}

/** Advance one month. No-op while a stop is pending or after the end. */
export function stepMonth(s: GameState, p: Params): void {
  if (s.ended || s.pending) return;
  s.month += 1;
  s.ageMonths += 1;
  s.calendarMonth = (s.calendarMonth + 1) % 12;
  if (s.calendarMonth === 0) yearlyMacro(s, p);
  const summary: MonthSummary = {
    month: s.month,
    income: 0,
    costs: 0,
    committed: 0,
    saved: 0,
    interestEarned: 0,
    interestPaid: 0,
    betsLost: 0,
    cashBefore: s.cash,
    cashAfter: 0,
  };

  // 1. Income.
  const income = monthlyIncome(s, p);
  s.cash += income;
  summary.income = income;
  if (s.career.job !== 'nenhum') s.career.monthsInJob += 1;
  if (s.flags.peDeMeia && isTeen(s) && s.calendarMonth === 11) {
    s.peDeMeiaLocked += priced(s, p.peDeMeiaAnnualLocked);
  }
  if (s.ageMonths === 18 * 12 && s.peDeMeiaLocked > 0) {
    log(s, 'good', 'pedemeia_liberado', { valor: s.peDeMeiaLocked });
    s.cash += s.peDeMeiaLocked;
    s.peDeMeiaLocked = 0;
  }

  // 2. Compulsory costs.
  const costs = monthlyFixedCosts(s, p);
  s.cash -= costs;
  summary.costs = costs;
  s.stats.leisureSpent += leisureCost(s, p);

  // 3. Instalments and loans. Card instalments go to the statement; the rest leaves cash.
  let committedPaid = 0;
  for (const x of s.parcelas) {
    if (x.onCard) s.card.statement += x.amount;
    else s.cash -= x.amount;
    committedPaid += x.amount;
    x.remaining -= 1;
  }
  s.parcelas = s.parcelas.filter((x) => x.remaining > 0);
  for (const l of s.loans) {
    const interest = interestOn(l.balance, l.rateMonthly);
    summary.interestPaid += interest;
    l.balance = Math.max(0, l.balance + interest - l.instalment);
    s.cash -= l.instalment;
    committedPaid += l.instalment;
    l.remaining -= 1;
    if (l.remaining <= 0) l.balance = 0;
  }
  s.loans = s.loans.filter((l) => l.remaining > 0 && l.balance > 0);

  // 4. The fatura.
  if (s.card.has) {
    const chargesBefore = s.card.capCharges;
    const r = settleCard(s, p);
    // capCharges only grows (rotativo accrual, parcelamento interest) until the debt clears.
    summary.interestPaid += Math.max(0, s.card.capCharges - chargesBefore);
    if (r.missedMinimum) {
      s.flags.cardMissedThisYear = 1;
      log(s, 'bad', 'fatura_nao_paga', { valor: r.due });
    } else if (r.parcelou) {
      log(s, 'bad', 'fatura_parcelada', { valor: r.toRevolving });
    } else if (r.interest > 0) {
      log(s, 'bad', 'rotativo', { juros: r.interest, saldo: r.toRevolving });
    }
    if (s.card.capBase > 0 && s.card.capCharges >= Math.round(s.card.capBase * p.cardCapMultiple) && !s.flags.capLogged) {
      s.flags.capLogged = 1;
      log(s, 'info', 'cap_atingido', { base: s.card.capBase });
    }
    if (s.card.capBase === 0) s.flags.capLogged = 0;
    committedPaid += r.paid;
  }

  // 5. Bets, as a narrated expected loss. Nothing is animated and nothing is won.
  if (s.standing.bets > 0) {
    const stake = Math.min(s.standing.bets, Math.max(0, s.cash));
    const lost = Math.round(stake * p.betsExpectedLoss);
    s.cash -= lost;
    summary.betsLost = lost;
    s.flags.betsLostTotal = (s.flags.betsLostTotal ?? 0) + lost;
  }

  // 6. Standing order: put away a share of what is left.
  const surplus = income - costs - committedPaid;
  if (surplus > 0 && s.standing.savePct > 0 && s.cash > 0) {
    const amount = Math.min(s.cash, Math.round(surplus * s.standing.savePct));
    s.cash -= amount;
    saveInto(s, amount);
    summary.saved = amount;
    if (s.standing.saveInto !== 'cofrinho' && !s.flags.primeiraAplicacao) {
      s.flags.primeiraAplicacao = 1;
      s.flags.primeiraAplicacaoValor = amount;
    }
  }

  // 7. Overdraft. Adults with an account pay cheque especial up to a limit of one month's
  //    income; past it the bank cuts the account off and the name goes to Serasa. Children
  //    get bailed out by their parents, with a cost.
  if (s.cash < 0) {
    if (isAdult(s) && s.hasBankAccount) {
      const juros = interestOn(-s.cash, p.chequeEspecialMonthly);
      s.cash -= juros;
      summary.interestPaid += juros;
      log(s, 'bad', 'cheque_especial', { juros, saldo: -s.cash });
      // Pull from savings first before letting the overdraft roll.
      const short = drawDown(s, p, -s.cash + 0);
      s.cash = short === 0 ? 0 : -short;
      const limit = Math.max(income, priced(s, p.overdraftFloor));
      if (s.cash < -limit) {
        s.cash = -limit;
        bumpWellbeing(s, -5);
        if (!isNegativado(s)) {
          s.negativadoUntilMonth = s.month + p.negativacaoYears * 12;
          s.card.blocked = true;
          log(s, 'bad', 'conta_estourada', { limite: limit });
        }
      }
    } else {
      const short = drawDown(s, p, -s.cash);
      s.cash = short > 0 ? 0 : s.cash;
      if (short > 0) {
        log(s, 'bad', 'pais_cobriram', { valor: short });
        bumpWellbeing(s, -3);
      } else {
        s.cash = 0;
      }
    }
  }

  // 8. Interest on savings.
  const investedBefore = investedTotal(s);
  accrueInvestments(s, p);
  summary.interestEarned = investedTotal(s) - investedBefore;

  // 9. Study progress.
  if (s.career.study) {
    s.career.study.remaining -= 1;
    if (s.career.study.remaining <= 0) {
      const t = s.career.study;
      s.career.study = null;
      if (t.track === 'cursinho') {
        s.flags.cursinhoDone = 1;
        log(s, 'good', 'cursinho_concluido');
      } else {
        const level = t.track === 'tecnico' ? 'tecnico' : 'superior';
        if (LEVEL_RANK[level] > LEVEL_RANK[s.career.level]) s.career.level = level;
        s.flags.formatura = 1;
        log(s, 'good', 'formatura', { curso: t.label });
      }
    }
  }
  if (s.ageMonths === 18 * 12 && LEVEL_RANK[s.career.level] < LEVEL_RANK.medio) s.career.level = 'medio';

  // 10. Wellbeing drifts back toward 60 (shifted by the lifestyle); being negativado weighs on it.
  const target = 60 + lifestyleMood(s.standing.lifestyle);
  if (s.wellbeing < target) bumpWellbeing(s, 1);
  else if (s.wellbeing > target) bumpWellbeing(s, -1);
  if (isNegativado(s)) bumpWellbeing(s, -1);
  if (s.negativadoUntilMonth !== null && s.month >= s.negativadoUntilMonth) {
    s.negativadoUntilMonth = null;
    s.card.blocked = false;
    log(s, 'good', 'nome_limpo');
  }

  summary.committed = committedPaid;
  summary.cashAfter = s.cash;
  s.lastMonth = summary;
  s.stats.interestEarned += summary.interestEarned;
  s.stats.interestPaid += summary.interestPaid;

  pushHistory(s);
  if (s.ageMonths >= END_AGE * 12) {
    s.ended = true;
    return;
  }
  pickEvent(s, p);
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function buildStop(s: GameState, p: Params, ev: EventDef): Stop {
  const ctx: EventContext = { s, p };
  const vars = ev.vars ? ev.vars(ctx) : {};
  const choices: Choice[] = ev.choices
    .filter((c) => !c.available || c.available(ctx, vars))
    .map((c) => ({ id: c.id, tags: c.tags ?? [], vars: c.vars ? c.vars(ctx, vars) : undefined }));
  return { eventId: ev.id, choices, vars };
}

function fire(s: GameState, p: Params, ev: EventDef): void {
  s.pending = buildStop(s, p, ev);
  s.stopsCount += 1;
  if (ev.once) s.flags[`ev:${ev.id}`] = 1;
  if (ev.yearly) s.flags[`ev:${ev.id}:${Math.floor(s.month / 12)}`] = 1;
  if (ev.kind === 'random') s.lastRandomStopMonth = s.month;
  log(s, 'event', `ev:${ev.id}`, s.pending.vars);
}

function eligible(s: GameState, p: Params, ev: EventDef): boolean {
  if (ev.once && s.flags[`ev:${ev.id}`]) return false;
  if (ev.yearly && s.flags[`ev:${ev.id}:${Math.floor(s.month / 12)}`]) return false;
  return ev.eligible({ s, p });
}

export function pickEvent(s: GameState, p: Params): void {
  if (s.pending || s.ended) return;
  for (const ev of EVENTS) {
    if (ev.kind === 'random') continue;
    if (eligible(s, p, ev)) {
      fire(s, p, ev);
      return;
    }
  }
  // One draw per month from the events stream, whatever is eligible, so that the
  // ghost replay sees exactly the same luck as the player.
  const roll = random(s.rng, 'events');
  if (s.month - s.lastRandomStopMonth < 2) return;
  let acc = 0;
  for (const ev of EVENTS) {
    if (ev.kind !== 'random') continue;
    if (!eligible(s, p, ev)) continue;
    acc += ev.monthlyProb ? ev.monthlyProb({ s, p }) : 0;
    if (roll < acc) {
      fire(s, p, ev);
      return;
    }
  }
}

/** Apply a choice to the pending stop. Throws on an unknown or unavailable choice. */
export function choose(s: GameState, p: Params, choiceId: string): void {
  const stop = s.pending;
  if (!stop) throw new Error('No pending stop');
  const ev = EVENTS.find((e) => e.id === stop.eventId);
  if (!ev) throw new Error(`Unknown event ${stop.eventId}`);
  const offered = stop.choices.find((c) => c.id === choiceId);
  const def = ev.choices.find((c) => c.id === choiceId);
  if (!offered || !def) throw new Error(`Choice ${choiceId} is not available for ${stop.eventId}`);
  def.apply({ s, p }, stop.vars);
  log(s, 'choice', `ch:${stop.eventId}:${choiceId}`, { ...stop.vars, ...(offered.vars ?? {}) });
  s.pending = null;
}

export function setStanding(s: GameState, patch: Partial<Standing>): void {
  s.standing = { ...s.standing, ...patch };
  if (s.standing.saveInto !== 'cofrinho' && !s.hasBankAccount) s.standing.saveInto = 'cofrinho';
  s.standing.savePct = clamp(s.standing.savePct, 0, 1);
}

export function setCardPolicy(s: GameState, policy: CardPolicy): void {
  s.card.policy = policy;
}

/** Move everything from the cofrinho into the chosen instrument (used once an account exists). */
export function moveCofrinho(s: GameState): void {
  if (s.cofrinho > 0 && s.standing.saveInto !== 'cofrinho') {
    const amt = s.cofrinho;
    s.cofrinho = 0;
    saveInto(s, amt);
  }
}

// ---------------------------------------------------------------------------
// Policies and full runs (the ghost)
// ---------------------------------------------------------------------------

export interface Policy {
  onStart?: (s: GameState, p: Params) => void;
  choose: (s: GameState, p: Params, stop: Stop) => string;
}

export function runWithPolicy(opts: NewGameOptions, p: Params, policy: Policy, maxMonths = 400): GameState {
  const s = newGame(opts, p);
  policy.onStart?.(s, p);
  let guard = 0;
  while (!s.ended && guard < maxMonths * 4) {
    guard += 1;
    if (s.pending) choose(s, p, policy.choose(s, p, s.pending));
    else stepMonth(s, p);
  }
  return s;
}

/** Called by the chapter event when a new chapter opens: snapshot the baseline for the next card. */
export function startChapter(s: GameState): void {
  s.chapterStart = {
    ageMonths: s.ageMonths,
    netWorth: netWorth(s),
    interestEarned: s.stats.interestEarned,
    interestPaid: s.stats.interestPaid,
  };
}

/** True on the first month of a chapter that is not the one the game started in. */
export function atChapterBoundary(s: GameState): boolean {
  const c = chapterOf(s.ageMonths);
  return s.ageMonths === c.fromAge * 12 && s.ageMonths > s.startAge * 12;
}

export const END_MONTHS = END_AGE * 12;
export { chargeCard, accrueRotativo, isChild, isTeen, isAdult, ageYears, liquid, spendable, chapterOf };
