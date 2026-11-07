import { readFileSync } from 'node:fs';
import { loadParams, type ParamFile } from './params';

/** The live Brazil parameter file, for tests. */
export function brParams() {
  const raw = readFileSync(new URL('../../data/br/2026-11.json', import.meta.url), 'utf8');
  return loadParams(JSON.parse(raw) as ParamFile);
}
