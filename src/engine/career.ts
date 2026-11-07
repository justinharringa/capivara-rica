import type { Centavos } from './money';
import type { Params } from './params';
import type { GameState, JobId, StudyTrack, EducationLevel } from './state';

/** Gross monthly pay for a job at today's wage index. */
export function jobSalary(s: GameState, p: Params, job: JobId): Centavos {
  const w = s.macro.wageIndex;
  switch (job) {
    case 'nenhum':
      return 0;
    case 'aprendiz':
      return Math.round(p.jovemAprendizPay4h * w);
    case 'atendente':
      return Math.round(p.minimumWage * w);
    case 'ifood':
      return Math.round(p.salaryIfood * w);
    case 'tecnico':
      return Math.round(((p.salaryAuxAdmin + p.salaryTecnicoEnfermagem) / 2) * w);
    case 'superior':
      return Math.round(((p.salaryDevJunior + p.salaryEnfermeiro + p.salaryProfessor) / 3) * w);
  }
}

/** Net pay after INSS (first band) and the vale-transporte deduction for CLT jobs. */
export function netPay(s: GameState, p: Params): Centavos {
  const c = s.career;
  if (c.job === 'nenhum') return 0;
  if (c.job === 'ifood') {
    // Gig income: no INSS deduction here, but fuel and maintenance eat into it.
    const costs = s.hasMoto ? Math.round(c.salary * 0.25) : Math.round(c.salary * 0.1);
    return c.salary - costs;
  }
  if (c.job === 'aprendiz') {
    return c.salary - Math.round(c.salary * p.inssRateBand1);
  }
  return c.salary - Math.round(c.salary * p.inssRateBand1) - Math.round(c.salary * p.valeTransporteRate);
}

export interface TrackInfo {
  track: StudyTrack;
  months: number;
  monthlyCost: Centavos;
  level: EducationLevel | null;
}

export function trackInfo(p: Params, track: StudyTrack): TrackInfo {
  switch (track) {
    case 'tecnico':
      return { track, months: 18, monthlyCost: p.tecnicoTuitionMonthly, level: 'tecnico' };
    case 'superiorPublica':
      return { track, months: 48, monthlyCost: 0, level: 'superior' };
    case 'superiorEad':
      return { track, months: 48, monthlyCost: p.eadTuitionMonthly, level: 'superior' };
    case 'cursinho':
      return { track, months: 12, monthlyCost: p.cursinhoMonthly, level: null };
  }
}

export const LEVEL_RANK: Record<EducationLevel, number> = {
  fundamental: 0,
  medio: 1,
  tecnico: 2,
  superior: 3,
};

/** Yearly raise: inflation indexation for everyone, plus a small real raise for tenure. */
export function annualRaise(s: GameState, p: Params): void {
  const c = s.career;
  if (c.job === 'nenhum') return;
  const base = jobSalary(s, p, c.job);
  const tenureYears = Math.floor(c.monthsInJob / 12);
  const realBump = c.job === 'aprendiz' || c.job === 'atendente' ? 0 : Math.min(0.3, 0.03 * tenureYears);
  c.salary = Math.max(base, Math.round(base * (1 + realBump)));
}
