/**
 * Fails when a shipped parameter still lacks a verified source.
 *
 *   node --experimental-strip-types scripts/check-data.ts            # report only
 *   node --experimental-strip-types scripts/check-data.ts --release  # exit 1 on memory/placeholder
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

type Status = 'verified' | 'secondary' | 'memory' | 'placeholder';
interface Entry { value: number; unit: string; asOf: string; source: string; status: Status; note?: string }
interface File { country: string; asOf: string; params: Record<string, Entry> }

const release = process.argv.includes('--release');
const root = new URL('../data/', import.meta.url).pathname;
let failed = false;

for (const country of readdirSync(root)) {
  const dir = join(root, country);
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'schema.json')) {
    const file = JSON.parse(readFileSync(join(dir, name), 'utf8')) as File;
    const counts: Record<Status, string[]> = { verified: [], secondary: [], memory: [], placeholder: [] };
    for (const [key, e] of Object.entries(file.params)) {
      for (const field of ['value', 'unit', 'asOf', 'source', 'status'] as const) {
        if (e[field] === undefined || e[field] === '') {
          console.error(`✗ ${country}/${name}: ${key} is missing "${field}"`);
          failed = true;
        }
      }
      if (!counts[e.status]) {
        console.error(`✗ ${country}/${name}: ${key} has unknown status "${e.status}"`);
        failed = true;
        continue;
      }
      counts[e.status].push(key);
    }
    console.log(`${country}/${name}: ${Object.keys(file.params).length} params`);
    for (const st of ['verified', 'secondary', 'memory', 'placeholder'] as Status[]) {
      console.log(`  ${st.padEnd(11)} ${String(counts[st].length).padStart(3)}${st === 'memory' || st === 'placeholder' ? '  ' + counts[st].join(', ') : ''}`);
    }
    if (release && (counts.memory.length || counts.placeholder.length)) {
      console.error(`✗ release blocked: ${counts.memory.length + counts.placeholder.length} parameter(s) still memory/placeholder`);
      failed = true;
    }
  }
}
process.exit(failed ? 1 : 0);
