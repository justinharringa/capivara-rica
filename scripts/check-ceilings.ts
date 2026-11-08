/**
 * Every `allowedVersions` ceiling in renovate.json must have a lifter: a check that fails the
 * moment the reason for the ceiling is gone, so the ceiling cannot outlive it (the knuckles
 * rule: a ceiling with no lifter is a pin that rots by design).
 *
 *   node --experimental-strip-types scripts/check-ceilings.ts
 *   node --experimental-strip-types scripts/check-ceilings.ts --self-test   # the range reader
 *
 * Ceilings known here:
 *   typescript <7  — lifted when svelte-check's peerDependencies admit TypeScript 7.
 */
import { readFileSync } from 'node:fs';
import semver from 'semver';

interface Rule { matchDepNames?: string[]; allowedVersions?: string }

/** Does a peer range admit any 7.x release (prereleases included)? */
export const admitsTs7 = (range: string): boolean =>
  range.trim() !== '' && semver.validRange(range) !== null && semver.intersects(range, '>=7.0.0-0', { includePrerelease: true });

if (process.argv.includes('--self-test')) {
  const cases: Array<[string, boolean]> = [
    ['^5.0.0 || ^6.0.0', false],
    ['^5.7', false],
    ['>=4.9.7 <6', false],
    ['^5.0.17', false],
    ['^5.0.0 || ^6.0.7', false],
    ['>=5.0.0', true],
    ['^7.0.0-rc.1', true],
    ['^5.0.0 || ^6.0.0 || ^7.0.0', true],
    ['*', true],
    ['', false],
  ];
  let bad = 0;
  for (const [range, expected] of cases) {
    const got = admitsTs7(range);
    if (got !== expected) {
      console.error(`✗ "${range}": expected ${expected}, got ${got}`);
      bad += 1;
    }
  }
  console.log(bad ? `${bad} self-test failure(s)` : `${cases.length} range cases ok`);
  process.exit(bad ? 1 : 0);
}

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
    const admits7 = admitsTs7(range);
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
