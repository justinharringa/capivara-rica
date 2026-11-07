import eventsJson from '$content/pt-BR/events.json';
import stringsJson from '$content/pt-BR/strings.json';
import { formatBRL } from '$engine/money';

export interface EventText {
  title: string;
  body: string;
  capi: string;
  choices: Record<string, { label: string; detail?: string }>;
}

export const events = eventsJson as Record<string, EventText>;
export const strings = stringsJson as unknown as {
  app: Record<string, string> & { jobs: Record<string, string>; living: Record<string, string> };
  log: Record<string, string>;
};

/** Vars that are plain numbers, not centavos. Everything else numeric is money. */
const NON_MONEY = new Set(['idade', 'chance', 'meses', 'anos', 'comprometido', 'guardando', 'minimo', 'start']);

export function fmtVar(key: string, value: string | number): string {
  if (typeof value === 'string') {
    if (key === 'onde') return strings.app[value] ?? value;
    if (key === 'cargo') return strings.app.jobs[value] ?? value;
    return value;
  }
  if (NON_MONEY.has(key)) return String(value);
  return formatBRL(value);
}

export function t(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? fmtVar(key, vars[key]!) : m));
}

export const ui = (key: string): string => strings.app[key] ?? key;
