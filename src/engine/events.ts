import type { Centavos } from './money';
import { instalment } from './money';
import type { Params } from './params';
import type { GameState } from './state';
import { isAdult, isTeen, isChild, ageYears, isNegativado } from './state';
import { random, randomInt, hash32 } from './rng';
import { spendable, deposit, investedTotal } from './investments';
import { chargeCard } from './card';
import { jobSalary, trackInfo, LEVEL_RANK } from './career';
import {
  addLoan,
  addParcela,
  bumpWellbeing,
  log,
  moveCofrinho,
  priced,
  saveInto,
  setStanding,
  trySpend,
  monthlyIncome,
  projectSavings,
  comprometimento,
  netWorth,
  startChapter,
  atChapterBoundary,
} from './sim';
import { chapterOf, CHAPTERS } from './state';

export interface EventContext {
  s: GameState;
  p: Params;
}
type Vars = Record<string, string | number>;

export interface ChoiceDef {
  id: string;
  /** `capivara` marks what the ghost does; `capivara2` is its fallback. */
  tags?: string[];
  available?: (c: EventContext, vars: Vars) => boolean;
  vars?: (c: EventContext, vars: Vars) => Vars;
  apply: (c: EventContext, vars: Vars) => void;
}

export interface EventDef {
  id: string;
  kind: 'scheduled' | 'conditional' | 'random';
  once?: boolean;
  yearly?: boolean;
  /** After this stop resolves, pick again in the same month: the stop is an overlay, not the month's event. */
  passthrough?: boolean;
  eligible: (c: EventContext) => boolean;
  monthlyProb?: (c: EventContext) => number;
  vars?: (c: EventContext) => Vars;
  choices: ChoiceDef[];
}

const at = (s: GameState, years: number, months = 0): boolean => s.ageMonths >= years * 12 + months;

/** Black Friday objects; the id is the key into strings.app.bfItems, the price a param. */
export const BF_ITEMS: ReadonlyArray<{ id: string; price: keyof Params }> = [
  { id: 'tv', price: 'bfPriceTv' },
  { id: 'celular', price: 'bfPriceCelular' },
  { id: 'videogame', price: 'bfPriceVideogame' },
  { id: 'fone', price: 'bfPriceFone' },
  { id: 'tenis', price: 'bfPriceTenis' },
  { id: 'notebook', price: 'bfPriceNotebook' },
  { id: 'airfryer', price: 'bfPriceAirfryer' },
];
const BF_INDEX: Record<string, number> = Object.fromEntries(BF_ITEMS.map((it, i) => [it.id, i + 1]));

/** Dismissal without just cause: FGTS and the fine are paid by the chooser; this does the rest. */
function layOff(s: GameState, v: Vars): void {
  s.fgts = 0;
  s.career.job = 'nenhum';
  s.career.salary = 0;
  s.career.monthsInJob = 0;
  s.flags.demissaoMonth = s.month;
  s.flags.seguroMeses = Number(v.meses);
  s.flags.seguroValor = Number(v.parcela);
  bumpWellbeing(s, -8);
}

/** Moving in with a partner: the rent is shared from now on; a player still at home moves out. */
function moveInTogether(s: GameState): void {
  s.flags.juntos = 1;
  s.living = 'sozinho';
}
/** Remember which object was offered and when; flags hold numbers, so the item is stored by index. */
function bfSeen(s: GameState, v: Vars): void {
  s.flags.bfMonth = s.month;
  s.flags.bfLastItem = BF_INDEX[String(v.item)] ?? 0;
}
const phonePrice = (c: EventContext): Centavos => priced(c.s, c.p.entryPhonePrice);
const usedPhonePrice = (c: EventContext): Centavos => priced(c.s, c.p.usedPhonePrice);

function buyPhoneChoices(prefix: string): ChoiceDef[] {
  return [
    {
      id: 'pix',
      tags: ['avista', 'capivara2'],
      available: (c, v) => spendable(c.s, c.p) >= Number(v.pix),
      apply: (c, v) => {
        trySpend(c.s, c.p, Number(v.pix));
        c.s.hasPhone = true;
        bumpWellbeing(c.s, 4);
      },
    },
    {
      id: 'parcelado',
      tags: ['parcelado'],
      available: (c) => !isNegativado(c.s),
      apply: (c, v) => {
        const onCard = c.s.card.has && !c.s.card.blocked;
        addParcela(c.s, `${prefix}-celular`, 'celular 12x', Number(v.parcela), 12, onCard);
        c.s.hasPhone = true;
        bumpWellbeing(c.s, 4);
      },
    },
    {
      id: 'usado',
      tags: ['capivara'],
      available: (c, v) => spendable(c.s, c.p) >= Number(v.usado),
      apply: (c, v) => {
        trySpend(c.s, c.p, Number(v.usado));
        c.s.hasPhone = true;
        bumpWellbeing(c.s, 1);
      },
    },
  ];
}

const phoneVars = (c: EventContext): Vars => {
  const price = phonePrice(c);
  const pix = Math.round(price * (1 - c.p.pixDiscountTypical));
  return {
    preco: price,
    pix,
    parcela: Math.ceil(price / 12),
    usado: usedPhonePrice(c),
  };
};

export const EVENTS: EventDef[] = [
  // ---------------------------------------------------------------- chapters
  {
    // First in the list so a chapter opens before any event scheduled for the same month.
    id: 'capitulo',
    kind: 'scheduled',
    yearly: true,
    passthrough: true,
    eligible: ({ s }) => atChapterBoundary(s),
    vars: ({ s }) => {
      const c = chapterOf(s.ageMonths);
      const inicio = s.chapterStart.netWorth;
      const agora = netWorth(s);
      return {
        capitulo: c.n,
        total: CHAPTERS.length,
        titulo: c.id,
        anterior: chapterOf(s.ageMonths - 1).id,
        idade: ageYears(s),
        inicio,
        patrimonio: agora,
        delta: agora - inicio,
        juros: s.stats.interestEarned - s.chapterStart.interestEarned,
        jurosPagos: s.stats.interestPaid - s.chapterStart.interestPaid,
      };
    },
    choices: [{ id: 'continuar', tags: ['capivara'], apply: ({ s }) => startChapter(s) }],
  },
  // ---------------------------------------------------------------- childhood
  {
    id: 'presente_vovo',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => s.startAge === 10 && s.month === 0,
    vars: ({ s, p }) => ({ valor: priced(s, p.giftGrandma) }),
    choices: [
      {
        id: 'guardar',
        tags: ['capivara'],
        apply: ({ s }, v) => {
          s.cofrinho += Number(v.valor);
          setStanding(s, { savePct: 0.2 });
        },
      },
      {
        id: 'gastar',
        apply: ({ s }) => {
          bumpWellbeing(s, 4);
        },
      },
    ],
  },
  {
    id: 'lanche',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => isChild(s) && s.month >= 1,
    vars: ({ s, p }) => ({ cantina: priced(s, p.lanchePrice * p.schoolDaysPerMonth), mesada: monthlyIncome(s, p) }),
    choices: [
      { id: 'cantina', apply: ({ s }) => setStanding(s, { lanche: 'compra' }) },
      {
        id: 'casa',
        tags: ['capivara'],
        apply: ({ s }) => {
          setStanding(s, { lanche: 'casa' });
          bumpWellbeing(s, -2);
        },
      },
    ],
  },
  {
    id: 'conta_jovem',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => !s.hasBankAccount && (at(s, 12) || s.startAge >= 14) && s.month >= 1,
    choices: [
      {
        id: 'abrir',
        tags: ['capivara'],
        apply: ({ s }) => {
          s.hasBankAccount = true;
          setStanding(s, { saveInto: 'cdb', savePct: Math.max(s.standing.savePct, 0.2) });
          moveCofrinho(s);
        },
      },
      { id: 'nao', apply: () => {} },
    ],
  },
  {
    id: 'aniversario',
    kind: 'scheduled',
    yearly: true,
    eligible: ({ s }) => !isAdult(s) && s.month > 0 && s.ageMonths % 12 === 0,
    vars: ({ s, p }) => ({ valor: priced(s, p.giftBirthdayUnit * randomInt(s.rng, 'misc', 1, 2)), idade: ageYears(s) }),
    choices: [
      { id: 'guardar', tags: ['capivara'], apply: ({ s }, v) => saveInto(s, Number(v.valor)) },
      {
        id: 'gastar',
        apply: ({ s }) => {
          bumpWellbeing(s, 4);
        },
      },
    ],
  },
  {
    id: 'diamantes',
    kind: 'random',
    eligible: ({ s }) => !isAdult(s),
    monthlyProb: () => 0.05,
    vars: ({ s, p }) => ({ preco: priced(s, p.gameDiamondsPrice) }),
    choices: [
      {
        id: 'comprar',
        available: (c, v) => spendable(c.s, c.p) >= Number(v.preco),
        apply: ({ s, p }, v) => {
          trySpend(s, p, Number(v.preco));
          bumpWellbeing(s, 3);
        },
      },
      { id: 'nao', tags: ['capivara'], apply: ({ s }) => bumpWellbeing(s, -1) },
    ],
  },
  // ---------------------------------------------------------------- teenage
  {
    id: 'aprendiz',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => at(s, 14) && !isAdult(s) && s.career.job === 'nenhum',
    vars: ({ s, p }) => ({ salario: jobSalary(s, p, 'aprendiz') }),
    choices: [
      {
        id: 'aceitar',
        tags: ['capivara'],
        apply: ({ s, p }) => {
          s.career.job = 'aprendiz';
          s.career.salary = jobSalary(s, p, 'aprendiz');
          s.career.monthsInJob = 0;
          bumpWellbeing(s, -3);
        },
      },
      { id: 'recusar', apply: () => {} },
    ],
  },
  {
    id: 'pe_de_meia',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => s.publicSchool && at(s, 14, 1) && !isAdult(s),
    vars: ({ s, p }) => ({ mensal: priced(s, p.peDeMeiaMonthly), anual: priced(s, p.peDeMeiaAnnualLocked) }),
    choices: [
      {
        id: 'ok',
        tags: ['capivara'],
        apply: ({ s }) => {
          s.flags.peDeMeia = 1;
        },
      },
    ],
  },
  {
    id: 'primeiro_celular',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => !s.hasPhone && at(s, 14, 3),
    vars: phoneVars,
    choices: [
      ...buyPhoneChoices('primeiro'),
      {
        id: 'esperar',
        apply: ({ s }) => {
          bumpWellbeing(s, -5);
          s.flags.celularAdiado = s.month;
        },
      },
    ],
  },
  {
    id: 'celular_de_novo',
    kind: 'conditional',
    eligible: ({ s }) => !s.hasPhone && !!s.flags.celularAdiado && s.month >= s.flags.celularAdiado + 6,
    vars: phoneVars,
    choices: [
      ...buyPhoneChoices('denovo'),
      {
        id: 'esperar',
        apply: ({ s }) => {
          bumpWellbeing(s, -5);
          s.flags.celularAdiado = s.month;
        },
      },
    ],
  },
  {
    id: 'bico_ou_aula',
    kind: 'random',
    eligible: ({ s }) => isTeen(s) && !!s.flags.peDeMeia,
    monthlyProb: () => 0.03,
    vars: ({ s, p }) => ({ bico: priced(s, p.bicoWeekPay), pedemeia: priced(s, p.peDeMeiaMonthly) }),
    choices: [
      {
        id: 'bico',
        apply: ({ s }, v) => {
          s.cash += Number(v.bico) - Number(v.pedemeia);
          bumpWellbeing(s, 1);
        },
      },
      { id: 'aula', tags: ['capivara'], apply: () => {} },
    ],
  },
  {
    id: 'cartao_garantido',
    kind: 'scheduled',
    once: true,
    // A secured card: the limit is the teen's own money, held as collateral (Nubank 16-17, Inter
    // "CDB Mais Limite"). Any invested savings count, not just the CDB; the cofrinho cannot back
    // a card. The game caps the limit so a first card stays small, and the text says so.
    eligible: ({ s, p }) => at(s, 16) && !isAdult(s) && s.hasBankAccount && !s.card.has && investedTotal(s) >= p.securedCardMinSavings,
    vars: ({ s, p }) => {
      const guardado = investedTotal(s);
      const teto = priced(s, p.securedCardMaxLimit);
      return { guardado, teto, limite: Math.min(guardado, teto) };
    },
    choices: [
      {
        id: 'aceitar',
        tags: ['capivara'],
        apply: ({ s }, v) => {
          s.card.has = true;
          s.card.limit = Number(v.limite);
          s.card.policy = 'integral';
        },
      },
      { id: 'recusar', apply: () => {} },
    ],
  },
  {
    id: 'tigrinho',
    kind: 'random',
    eligible: ({ s }) => at(s, 15) && s.standing.bets === 0 && (!s.flags.tigrinhoMonth || s.month - s.flags.tigrinhoMonth >= 24),
    monthlyProb: () => 0.03,
    vars: ({ s, p }) => ({ aposta: priced(s, p.betsStake), perda: Math.round(priced(s, p.betsStake) * p.betsExpectedLoss) }),
    choices: [
      {
        id: 'mensal',
        apply: ({ s }, v) => {
          setStanding(s, { bets: Number(v.aposta) });
          s.flags.tigrinhoMonth = s.month;
        },
      },
      {
        id: 'uma_vez',
        available: (c, v) => spendable(c.s, c.p) >= Number(v.aposta),
        apply: ({ s, p }, v) => {
          trySpend(s, p, Number(v.perda));
          s.flags.tigrinhoMonth = s.month;
        },
      },
      {
        id: 'ignorar',
        tags: ['capivara'],
        apply: ({ s }) => {
          s.flags.tigrinhoMonth = s.month;
        },
      },
    ],
  },
  {
    id: 'parar_apostas',
    kind: 'random',
    eligible: ({ s }) => s.standing.bets > 0,
    monthlyProb: () => 0.08,
    vars: ({ s }) => ({ perdido: s.flags.betsLostTotal ?? 0 }),
    choices: [
      { id: 'parar', tags: ['capivara'], apply: ({ s }) => setStanding(s, { bets: 0 }) },
      { id: 'continuar', apply: () => {} },
    ],
  },
  {
    id: 'celular_roubado',
    kind: 'random',
    eligible: ({ s }) => s.hasPhone && at(s, 14),
    monthlyProb: ({ s, p }) => (isAdult(s) ? p.phoneTheftAnnualProb / 12 : p.phoneTheftAnnualProb / 24),
    vars: phoneVars,
    choices: [
      ...buyPhoneChoices('roubado'),
      {
        id: 'ficar_sem',
        apply: ({ s }) => {
          s.hasPhone = false;
          bumpWellbeing(s, -8);
          s.flags.celularAdiado = s.month;
        },
      },
    ],
  },
  // ---------------------------------------------------------------- adult
  {
    id: 'primeiro_emprego',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => at(s, 18) && (s.career.job === 'nenhum' || s.career.job === 'aprendiz'),
    vars: ({ s, p }) => ({ clt: jobSalary(s, p, 'atendente'), ifood: jobSalary(s, p, 'ifood') }),
    choices: [
      {
        id: 'clt',
        tags: ['capivara'],
        apply: ({ s, p }) => {
          s.career.job = 'atendente';
          s.career.salary = jobSalary(s, p, 'atendente');
          s.career.monthsInJob = 0;
          s.hasBankAccount = true;
        },
      },
      {
        id: 'ifood',
        apply: ({ s, p }) => {
          s.career.job = 'ifood';
          s.career.salary = jobSalary(s, p, 'ifood');
          s.career.monthsInJob = 0;
          s.hasBankAccount = true;
          bumpWellbeing(s, -3);
        },
      },
      {
        id: 'so_estudar',
        available: ({ s }) => s.living === 'pais',
        apply: ({ s }) => {
          s.career.job = 'nenhum';
          s.career.salary = 0;
        },
      },
    ],
  },
  {
    id: 'vaga',
    kind: 'random',
    eligible: ({ s }) => isAdult(s) && s.career.job === 'nenhum',
    monthlyProb: () => 0.08,
    vars: ({ s, p }) => ({ clt: jobSalary(s, p, 'atendente'), ifood: jobSalary(s, p, 'ifood') }),
    choices: [
      {
        id: 'clt',
        tags: ['capivara'],
        apply: ({ s, p }) => {
          s.career.job = 'atendente';
          s.career.salary = jobSalary(s, p, 'atendente');
          s.career.monthsInJob = 0;
          s.hasBankAccount = true;
        },
      },
      {
        id: 'ifood',
        apply: ({ s, p }) => {
          s.career.job = 'ifood';
          s.career.salary = jobSalary(s, p, 'ifood');
          s.career.monthsInJob = 0;
          s.hasBankAccount = true;
        },
      },
      { id: 'nao', apply: ({ s }) => bumpWellbeing(s, -2) },
    ],
  },
  {
    id: 'primeiro_cartao',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => at(s, 18, 1) && !s.card.has && s.hasBankAccount && !isNegativado(s),
    vars: ({ s, p }) => ({ limite: priced(s, p.cardFirstLimit) }),
    choices: [
      {
        id: 'aceitar',
        tags: ['capivara'],
        apply: ({ s }, v) => {
          s.card.has = true;
          s.card.limit = Number(v.limite);
          s.card.policy = 'integral';
        },
      },
      { id: 'recusar', apply: () => {} },
    ],
  },
  {
    id: 'politica_fatura',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => s.card.has && at(s, 18, 2),
    vars: ({ p }) => ({
      rotativo: (p.cardRotativoMonthly * 100).toFixed(1),
      parcelado: (p.cardParceladoMonthly * 100).toFixed(1),
      minimo: Math.round(p.cardMinimumPaymentPct * 100),
    }),
    choices: [
      { id: 'integral', tags: ['capivara'], apply: ({ s }) => (s.card.policy = 'integral') },
      { id: 'minimo', apply: ({ s }) => (s.card.policy = 'minimo') },
      { id: 'parcelar', apply: ({ s }) => (s.card.policy = 'parcelar') },
    ],
  },
  {
    id: 'sair_de_casa',
    kind: 'scheduled',
    yearly: true,
    eligible: ({ s }) => s.living === 'pais' && (s.ageMonths === 19 * 12 || s.ageMonths === 22 * 12 || s.ageMonths === 25 * 12),
    vars: ({ s, p }) => ({
      aluguel: priced(s, p.rentKitnetSP),
      comida: priced(s, p.cestaBasicaSP),
      ajuda: priced(s, p.familyContribution),
      renda: monthlyIncome(s, p),
    }),
    choices: [
      {
        id: 'sozinho',
        available: ({ s, p }, v) => monthlyIncome(s, p) > Number(v.aluguel) + Number(v.comida),
        apply: ({ s }) => {
          s.living = 'sozinho';
          bumpWellbeing(s, 6);
        },
      },
      {
        id: 'ficar',
        tags: ['capivara'],
        apply: ({ s }) => {
          if (ageYears(s) >= 22) bumpWellbeing(s, -3);
        },
      },
    ],
  },
  {
    id: 'estudar',
    kind: 'scheduled',
    yearly: true,
    eligible: ({ s }) =>
      !s.career.study &&
      LEVEL_RANK[s.career.level] < LEVEL_RANK.superior &&
      (s.ageMonths === 18 * 12 + 6 || s.ageMonths === 20 * 12 + 6 || s.ageMonths === 22 * 12 + 6 || s.ageMonths === 24 * 12 + 6),
    vars: ({ s, p }) => ({
      ead: trackInfo(p, 'superiorEad').monthlyCost,
      tecnico: trackInfo(p, 'tecnico').monthlyCost,
      cursinho: trackInfo(p, 'cursinho').monthlyCost,
      chance: s.flags.cursinhoDone ? 60 : 35,
      superior: jobSalary(s, p, 'superior'),
      tecnicoSalario: jobSalary(s, p, 'tecnico'),
    }),
    choices: [
      {
        id: 'sisu',
        tags: ['capivara'],
        apply: ({ s, p }, v) => {
          const passed = random(s.rng, 'career') * 100 < Number(v.chance);
          if (passed) {
            const t = trackInfo(p, 'superiorPublica');
            s.career.study = { track: 'superiorPublica', label: 'faculdade pública', remaining: t.months, monthlyCost: 0 };
            log(s, 'good', 'sisu_passou');
            bumpWellbeing(s, 5);
          } else {
            log(s, 'bad', 'sisu_falhou');
            bumpWellbeing(s, -4);
          }
        },
      },
      {
        id: 'ead',
        tags: ['capivara2'],
        apply: ({ s, p }) => {
          const t = trackInfo(p, 'superiorEad');
          s.career.study = { track: 'superiorEad', label: 'faculdade EAD', remaining: t.months, monthlyCost: t.monthlyCost };
        },
      },
      {
        id: 'tecnico',
        available: ({ s }) => LEVEL_RANK[s.career.level] < LEVEL_RANK.tecnico,
        apply: ({ s, p }) => {
          const t = trackInfo(p, 'tecnico');
          s.career.study = { track: 'tecnico', label: 'curso técnico', remaining: t.months, monthlyCost: t.monthlyCost };
        },
      },
      {
        id: 'cursinho',
        available: ({ s }) => !s.flags.cursinhoDone,
        apply: ({ s, p }) => {
          const t = trackInfo(p, 'cursinho');
          s.career.study = { track: 'cursinho', label: 'cursinho', remaining: t.months, monthlyCost: t.monthlyCost };
        },
      },
      { id: 'nada', apply: () => {} },
    ],
  },
  {
    id: 'cansaco',
    kind: 'random',
    eligible: ({ s }) => !!s.career.study && s.career.job !== 'nenhum',
    monthlyProb: () => 0.02,
    choices: [
      { id: 'continuar', tags: ['capivara'], apply: ({ s }) => bumpWellbeing(s, -5) },
      {
        id: 'trancar',
        apply: ({ s }) => {
          s.career.study = null;
          bumpWellbeing(s, 3);
          log(s, 'bad', 'trancou');
        },
      },
    ],
  },
  {
    id: 'nova_vaga',
    kind: 'conditional',
    eligible: ({ s }) => !!s.flags.formatura && isAdult(s),
    vars: ({ s, p }) => {
      const job = s.career.level === 'superior' ? 'superior' : 'tecnico';
      return { salario: jobSalary(s, p, job), atual: s.career.salary, cargo: job };
    },
    choices: [
      {
        id: 'aceitar',
        tags: ['capivara'],
        apply: ({ s, p }, v) => {
          s.flags.formatura = 0;
          const job = v.cargo === 'superior' ? 'superior' : 'tecnico';
          s.career.job = job;
          s.career.salary = jobSalary(s, p, job);
          s.career.monthsInJob = 0;
          s.hasBankAccount = true;
          bumpWellbeing(s, 6);
        },
      },
      {
        id: 'ficar',
        apply: ({ s }) => {
          s.flags.formatura = 0;
        },
      },
    ],
  },
  {
    id: 'promocao',
    kind: 'random',
    eligible: ({ s }) => isAdult(s) && s.career.job !== 'nenhum' && s.career.job !== 'ifood' && s.career.monthsInJob >= 12,
    monthlyProb: () => 0.012,
    vars: ({ s, p }) => ({ novo: Math.round(s.career.salary * 1.08), bonus: priced(s, p.promotionBonus) }),
    choices: [
      {
        id: 'comemorar',
        apply: ({ s, p }, v) => {
          s.career.salary = Number(v.novo);
          trySpend(s, p, Number(v.bonus));
          bumpWellbeing(s, 5);
        },
      },
      {
        id: 'guardar',
        tags: ['capivara'],
        apply: ({ s }, v) => {
          s.career.salary = Number(v.novo);
          saveInto(s, Number(v.bonus));
          bumpWellbeing(s, 2);
        },
      },
    ],
  },
  {
    id: 'emergencia',
    kind: 'random',
    eligible: ({ s }) => isAdult(s),
    monthlyProb: () => 0.012,
    vars: ({ s, p }) => {
      const cheio = priced(s, randomInt(s.rng, 'shocks', p.emergencyMinCost, p.emergencyMaxCost));
      // With a health plan the private ER costs a co-payment, not the bill.
      const valor = s.flags.planoSaude ? Math.round(cheio * 0.2) : cheio;
      return { valor, parcela: instalment(valor, p.personalLoanMonthly, 12) };
    },
    choices: [
      { id: 'pagar', tags: ['capivara'], available: (c, v) => spendable(c.s, c.p) >= Number(v.valor), apply: ({ s, p }, v) => void trySpend(s, p, Number(v.valor)) },
      {
        id: 'cartao',
        tags: ['capivara2'],
        available: ({ s }, v) => s.card.has && !s.card.blocked && s.card.statement + s.card.revolving + Number(v.valor) <= s.card.limit,
        apply: ({ s }, v) => void chargeCard(s, Number(v.valor)),
      },
      {
        id: 'emprestimo',
        available: ({ s }) => !isNegativado(s) && s.hasBankAccount,
        apply: ({ s, p }, v) => addLoan(s, 'emergencia', 'empréstimo pessoal', Number(v.valor), p.personalLoanMonthly, 12),
      },
      { id: 'sus', apply: ({ s }) => bumpWellbeing(s, -10) },
    ],
  },
  {
    // A different object each time, never the same as last time, and at most every other year:
    // the TV every November read as a bug to the first players (2026-11-08).
    id: 'black_friday',
    kind: 'scheduled',
    yearly: true,
    eligible: ({ s, p }) =>
      s.calendarMonth === 10 &&
      at(s, 16) &&
      (!s.flags.bfMonth || s.month - s.flags.bfMonth >= 20) &&
      (s.card.has || spendable(s, p) >= priced(s, p.blackFridayMinCash)),
    vars: ({ s, p }) => {
      // Not an rng stream: the ghost may not see this event in the same month (it needs a
      // card or cash), and a conditional draw would shift the 'misc' luck of both lives apart.
      let i = hash32(s.seed, s.month + 1) % BF_ITEMS.length;
      if (BF_INDEX[BF_ITEMS[i]!.id] === s.flags.bfLastItem) i = (i + 1) % BF_ITEMS.length;
      const item = BF_ITEMS[i]!;
      const preco = priced(s, p[item.price]);
      return { item: item.id, preco, pix: Math.round(preco * (1 - p.blackFridayPixDiscount)), parcela: Math.ceil(preco / 12) };
    },
    choices: [
      {
        id: 'parcelar',
        available: ({ s }, v) => s.card.has && !s.card.blocked && s.card.statement + s.card.revolving + Number(v.preco) <= s.card.limit,
        apply: ({ s }, v) => {
          bfSeen(s, v);
          addParcela(s, 'bf', 'Black Friday 12x', Number(v.parcela), 12, true);
          bumpWellbeing(s, 6);
        },
      },
      {
        id: 'avista',
        available: (c, v) => spendable(c.s, c.p) >= Number(v.pix) * c.p.reserveMultipleBigPurchase,
        apply: ({ s, p }, v) => {
          bfSeen(s, v);
          trySpend(s, p, Number(v.pix));
          bumpWellbeing(s, 6);
        },
      },
      {
        id: 'passar',
        tags: ['capivara'],
        apply: ({ s }, v) => {
          bfSeen(s, v);
          bumpWellbeing(s, -2);
        },
      },
    ],
  },
  {
    id: 'moto',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => at(s, 20) && !s.hasMoto && s.career.job !== 'nenhum',
    vars: ({ s, p }) => {
      const preco = priced(s, p.motoPrice);
      const parcela = instalment(preco, p.motoFinanceMonthly, p.motoFinanceMonths);
      return { preco, parcela, meses: p.motoFinanceMonths, total: parcela * p.motoFinanceMonths, custo: priced(s, p.motoRunningCost) };
    },
    choices: [
      {
        id: 'financiar',
        available: ({ s }) => !isNegativado(s),
        apply: ({ s, p }, v) => {
          addLoan(s, 'moto', 'moto 60x', Number(v.preco), p.motoFinanceMonthly, p.motoFinanceMonths);
          s.hasMoto = true;
          bumpWellbeing(s, 6);
        },
      },
      {
        id: 'avista',
        tags: ['capivara2'],
        available: (c, v) => spendable(c.s, c.p) >= Number(v.preco) * c.p.reserveMultipleMoto,
        apply: ({ s, p }, v) => {
          trySpend(s, p, Number(v.preco));
          s.hasMoto = true;
          bumpWellbeing(s, 6);
        },
      },
      { id: 'onibus', tags: ['capivara'], apply: () => {} },
    ],
  },
  {
    id: 'familia_pix',
    kind: 'random',
    eligible: ({ s }) => at(s, 14),
    monthlyProb: () => 0.015,
    vars: ({ s, p }) => ({ valor: priced(s, p.familyPixAmount) }),
    choices: [
      {
        id: 'ajudar',
        tags: ['capivara'],
        available: (c, v) => spendable(c.s, c.p) >= Number(v.valor) * 3,
        apply: ({ s, p }, v) => {
          trySpend(s, p, Number(v.valor));
          bumpWellbeing(s, 2);
        },
      },
      { id: 'nao', tags: ['capivara2'], apply: ({ s }) => bumpWellbeing(s, -3) },
    ],
  },
  {
    id: 'consignado',
    kind: 'random',
    eligible: ({ s }) =>
      isAdult(s) &&
      at(s, 20) &&
      (s.career.job === 'atendente' || s.career.job === 'tecnico' || s.career.job === 'superior') &&
      !isNegativado(s) &&
      (!s.flags.consignadoMonth || s.month - s.flags.consignadoMonth >= 36),
    monthlyProb: () => 0.012,
    vars: ({ s, p }) => {
      const valor = priced(s, p.consignadoAmount);
      const parcela = instalment(valor, p.consignadoMonthly, 24);
      return { valor, parcela, total: parcela * 24 };
    },
    choices: [
      {
        id: 'aceitar',
        apply: ({ s, p }, v) => {
          s.cash += Number(v.valor);
          addLoan(s, 'consignado', 'consignado 24x', Number(v.valor), p.consignadoMonthly, 24);
          s.flags.consignadoMonth = s.month;
          bumpWellbeing(s, 3);
        },
      },
      {
        id: 'recusar',
        tags: ['capivara'],
        apply: ({ s }) => {
          s.flags.consignadoMonth = s.month;
        },
      },
    ],
  },
  {
    id: 'negativado',
    kind: 'conditional',
    eligible: ({ s }) => s.card.monthsUnpaid >= 3 && !isNegativado(s),
    vars: ({ s }) => {
      const divida = s.card.revolving + s.card.statement + s.parcelas.filter((x) => x.onCard).reduce((a, x) => a + x.amount * x.remaining, 0);
      return { divida, entrada: Math.round(divida * 0.4), anos: 5 };
    },
    choices: [
      {
        id: 'renegociar',
        tags: ['capivara'],
        available: (c, v) => spendable(c.s, c.p) >= Number(v.entrada),
        apply: ({ s, p }, v) => {
          trySpend(s, p, Number(v.entrada));
          s.card.revolving = 0;
          s.card.statement = 0;
          s.card.capBase = 0;
          s.card.capCharges = 0;
          s.card.monthsUnpaid = 0;
          s.parcelas = s.parcelas.filter((x) => !x.onCard);
          s.card.blocked = true;
          s.negativadoUntilMonth = s.month + 12;
          log(s, 'bad', 'negativado_renegociou');
        },
      },
      {
        id: 'ignorar',
        tags: ['capivara2'],
        apply: ({ s, p }) => {
          s.card.blocked = true;
          s.card.monthsUnpaid = 0;
          s.negativadoUntilMonth = s.month + p.negativacaoYears * 12;
          bumpWellbeing(s, -8);
          log(s, 'bad', 'negativado');
        },
      },
    ],
  },
  {
    id: 'primeira_aplicacao',
    kind: 'conditional',
    once: true,
    eligible: ({ s }) => !!s.flags.primeiraAplicacao,
    vars: ({ s, p }) => {
      const mensal = s.flags.primeiraAplicacaoValor ?? 0;
      return { mensal, dezAnos: projectSavings(s, p, mensal, 120), depositado: mensal * 120, onde: s.standing.saveInto };
    },
    choices: [{ id: 'ver', tags: ['capivara'], apply: () => {} }],
  },
  // ---------------------------------------------------------------- 22 to 30
  {
    // A CLT job can end. FGTS plus the 40% fine land in the account at once; seguro-desemprego
    // pays for a few months. The month's slot then re-rolls `vaga` offers as usual.
    id: 'demissao',
    kind: 'random',
    eligible: ({ s }) =>
      isAdult(s) &&
      (s.career.job === 'atendente' || s.career.job === 'tecnico' || s.career.job === 'superior') &&
      s.career.monthsInJob >= 12 &&
      (!s.flags.demissaoMonth || s.month - s.flags.demissaoMonth >= 36),
    monthlyProb: ({ p }) => p.layoffAnnualProb / 12,
    vars: ({ s, p }) => {
      const multa = Math.round(s.fgts * p.fgtsFineRate);
      const meses = s.career.monthsInJob >= 24 ? p.seguroDesempregoMonthsMax : p.seguroDesempregoMonthsMin;
      const parcela = Math.min(priced(s, p.seguroDesempregoMax), Math.max(Math.round(p.minimumWage * s.macro.wageIndex), Math.round(s.career.salary * 0.8)));
      return { fgts: s.fgts, multa, total: s.fgts + multa, meses, parcela };
    },
    choices: [
      {
        id: 'guardar',
        tags: ['capivara'],
        apply: ({ s }, v) => {
          layOff(s, v);
          saveInto(s, Number(v.total));
        },
      },
      {
        id: 'conta',
        apply: ({ s }, v) => {
          layOff(s, v);
          s.cash += Number(v.total);
        },
      },
    ],
  },
  {
    id: 'filho',
    kind: 'random',
    once: true,
    eligible: ({ s }) => at(s, 25) && (s.career.job !== 'nenhum' || !!s.flags.juntos),
    monthlyProb: () => 0.012,
    vars: ({ s, p }) => ({ custo: priced(s, p.childMonthlyCost), creche: Math.round(priced(s, p.childMonthlyCost) * 1.5) }),
    choices: [
      {
        id: 'publica',
        tags: ['capivara'],
        apply: ({ s }) => {
          s.flags.filhos = (s.flags.filhos ?? 0) + 1;
          bumpWellbeing(s, 8);
        },
      },
      {
        id: 'particular',
        apply: ({ s }) => {
          s.flags.filhos = (s.flags.filhos ?? 0) + 1;
          s.flags.crecheParticular = 1;
          bumpWellbeing(s, 10);
        },
      },
    ],
  },
  {
    id: 'carro',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => at(s, 24) && s.career.job !== 'nenhum' && !s.flags.carro,
    vars: ({ s, p }) => {
      const preco = priced(s, p.usedCarPrice);
      const parcela = instalment(preco, p.carFinanceMonthly, p.carFinanceMonths);
      return { preco, parcela, meses: p.carFinanceMonths, total: parcela * p.carFinanceMonths, custo: priced(s, p.carRunningCost) };
    },
    choices: [
      {
        id: 'financiar',
        available: ({ s }) => !isNegativado(s),
        apply: ({ s, p }, v) => {
          addLoan(s, 'carro', 'carro usado', Number(v.preco), p.carFinanceMonthly, p.carFinanceMonths);
          s.flags.carro = 1;
          bumpWellbeing(s, 6);
        },
      },
      {
        id: 'avista',
        tags: ['capivara2'],
        available: (c, v) => spendable(c.s, c.p) >= Number(v.preco) * c.p.reserveMultipleMoto,
        apply: ({ s, p }, v) => {
          trySpend(s, p, Number(v.preco));
          s.flags.carro = 1;
          bumpWellbeing(s, 6);
        },
      },
      { id: 'sem_carro', tags: ['capivara'], apply: () => {} },
    ],
  },
  {
    id: 'morar_junto',
    kind: 'random',
    once: true,
    eligible: ({ s }) => at(s, 24) && !s.flags.juntos,
    monthlyProb: () => 0.015,
    vars: ({ s, p }) => {
      const festa = priced(s, p.weddingCostParty);
      return {
        civil: priced(s, p.weddingCostSimple),
        festa,
        parcela: Math.ceil(festa / 12),
        aluguel: Math.round(priced(s, p.rentKitnetSP) / 2),
      };
    },
    choices: [
      {
        id: 'civil',
        tags: ['capivara'],
        available: (c, v) => spendable(c.s, c.p) >= Number(v.civil),
        apply: ({ s, p }, v) => {
          trySpend(s, p, Number(v.civil));
          moveInTogether(s);
          bumpWellbeing(s, 8);
        },
      },
      {
        id: 'festa',
        available: ({ s }, v) => s.card.has && !s.card.blocked && s.card.statement + s.card.revolving + Number(v.festa) <= s.card.limit,
        apply: ({ s }, v) => {
          addParcela(s, 'casamento', 'festa de casamento 12x', Number(v.parcela), 12, true);
          moveInTogether(s);
          bumpWellbeing(s, 12);
        },
      },
      { id: 'depois', tags: ['capivara2'], apply: ({ s }) => bumpWellbeing(s, -2) },
    ],
  },
  {
    id: 'plano_saude',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => at(s, 24) && s.career.job !== 'nenhum',
    vars: ({ s, p }) => ({ mensal: priced(s, p.healthPlanYoung), ps: priced(s, p.emergencyMaxCost) }),
    choices: [
      { id: 'contratar', tags: ['capivara'], apply: ({ s }) => (s.flags.planoSaude = 1) },
      { id: 'sus', apply: () => {} },
    ],
  },
  {
    id: 'viagem',
    kind: 'random',
    eligible: ({ s }) => at(s, 20) && (!s.flags.viagemMonth || s.month - s.flags.viagemMonth >= 24),
    monthlyProb: () => 0.015,
    vars: ({ s, p }) => {
      const preco = priced(s, p.tripCost);
      return { preco, parcela: Math.ceil(preco / 10) };
    },
    choices: [
      {
        id: 'avista',
        tags: ['capivara'],
        available: (c, v) => spendable(c.s, c.p) >= Number(v.preco) * c.p.reserveMultipleBigPurchase,
        apply: ({ s, p }, v) => {
          s.flags.viagemMonth = s.month;
          trySpend(s, p, Number(v.preco));
          bumpWellbeing(s, 8);
        },
      },
      {
        id: 'parcelar',
        available: ({ s }, v) => s.card.has && !s.card.blocked && s.card.statement + s.card.revolving + Number(v.preco) <= s.card.limit,
        apply: ({ s }, v) => {
          s.flags.viagemMonth = s.month;
          addParcela(s, 'viagem', 'viagem 10x', Number(v.parcela), 10, true);
          bumpWellbeing(s, 8);
        },
      },
      {
        id: 'ficar',
        tags: ['capivara2'],
        apply: ({ s }) => {
          s.flags.viagemMonth = s.month;
          bumpWellbeing(s, -3);
        },
      },
    ],
  },
  {
    id: 'curso_ingles',
    kind: 'scheduled',
    once: true,
    eligible: ({ s }) => at(s, 22) && s.career.job !== 'nenhum' && !s.flags.ingles && !s.flags.inglesAte,
    vars: ({ s, p }) => ({ mensal: priced(s, p.englishCourseMonthly), premio: Math.round(p.englishPremium * 100), salario: s.career.salary }),
    choices: [
      {
        id: 'fazer',
        tags: ['capivara'],
        apply: ({ s }, v) => {
          addParcela(s, 'ingles', 'curso de inglês', Number(v.mensal), 12, false);
          s.flags.inglesAte = s.month + 12;
        },
      },
      { id: 'nao', apply: () => {} },
    ],
  },
  {
    id: 'revisao_anual',
    kind: 'scheduled',
    yearly: true,
    eligible: ({ s }) => at(s, 14) && s.ageMonths % 12 === 6 && s.month > 0,
    vars: ({ s, p }) => ({
      idade: ageYears(s),
      renda: monthlyIncome(s, p),
      comprometido: Math.round(comprometimento(s, p) * 100),
      guardando: Math.round(s.standing.savePct * 100),
    }),
    choices: [{ id: 'ok', tags: ['capivara'], apply: () => {} }],
  },
];

export function eventById(id: string): EventDef | undefined {
  return EVENTS.find((e) => e.id === id);
}

export { deposit };
