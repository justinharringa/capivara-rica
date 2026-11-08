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
type Dict = Record<string, string>;
export const strings = stringsJson as unknown as {
  app: Record<string, string> & {
    jobs: Dict;
    living: Dict;
    lifestyles: Dict;
    chapters: Dict;
    bfItems: Dict;
  };
  log: Dict;
  help: Dict;
};

/** Vars that are plain numbers, not centavos. Everything else numeric is money. */
const NON_MONEY = new Set(['idade', 'chance', 'meses', 'anos', 'comprometido', 'guardando', 'minimo', 'start', 'capitulo', 'total', 'aliquota']);

/** String vars that are keys into a strings.app table rather than literal text. */
const STRING_TABLES: Record<string, Dict> = {
  cargo: strings.app.jobs,
  item: strings.app.bfItems,
  titulo: strings.app.chapters,
  anterior: strings.app.chapters,
};

export function fmtVar(key: string, value: string | number): string {
  if (typeof value === 'string') {
    if (key === 'onde') return strings.app[value] ?? value;
    const table = STRING_TABLES[key];
    return table ? (table[value] ?? value) : value;
  }
  if (NON_MONEY.has(key)) return String(value);
  return formatBRL(value);
}

export function t(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? fmtVar(key, vars[key]!) : m));
}

export const ui = (key: string): string => strings.app[key] ?? key;
/** The ℹ️ text for a stat tile or a standing-order control, or '' when there is none. */
export const help = (key: string): string => strings.help[key] ?? '';
