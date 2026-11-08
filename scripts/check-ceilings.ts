/**
 * Every `allowedVersions` ceiling in renovate.json must have a lifter: a check that fails the
 * moment the reason for the ceiling is gone, so the ceiling cannot outlive it (the knuckles
 * rule: a ceiling with no lifter is a pin that rots by design).
 *
 *   node --experimental-strip-types scripts/check-ceilings.ts
 *
 * Ceilings known here:
 *   typescript <7  — lifted when svelte-check's peerDependencies admit TypeScript 7.
 */
import { readFileSync } from 'node:fs';

interface Rule { matchDepNames?: string[]; allowedVersions?: string }
const renovate = JSON.parse(readFileSync(new URL('../renovate.json', import.meta.url), 'utf8')) as { packageRules: Rule[] };
const ceilings = renovate.packageRules.filter((r) => r.allowedVersions);
let failed = false;

for (const rule of ceilings) {
  const deps = rule.matchDepNames ?? [];
  if (deps.length === 1 && deps[0] === 'typescript' && rule.allowedVersions === '<7') {
    const svelteCheck = JSON.parse(readFileSync(new URL('../node_modules/svelte-check/package.json', import.meta.url), 'utf8')) as {
      version: string;
      peerDependencies?: Record<string, string>;
    };
    const range = svelteCheck.peerDependencies?.typescript ?? '';
    // "^7", ">=7", "|| 7" or a bare "7.x" in the peer range means svelte-check takes TS 7.
    const admits7 = /(\^|>=|~)?\s*7(\.\d+)*(\.x)?(\s|$|\|)/.test(range.replace(/\|\|/g, ' || '));
    console.log(`typescript <7: svelte-check ${svelteCheck.version} peer typescript "${range}" -> ${admits7 ? 'ADMITS 7' : 'below 7'}`);
    if (admits7) {
      console.error('✗ svelte-check now supports TypeScript 7: delete the `typescript` allowedVersions rule in renovate.json');
      failed = true;
    }
    continue;
  }
  console.error(`✗ ceiling without a lifter: ${JSON.stringify(rule)} — add a check here before adding a ceiling`);
  failed = true;
}
console.log(`${ceilings.length} ceiling(s) checked`);
process.exit(failed ? 1 : 0);
