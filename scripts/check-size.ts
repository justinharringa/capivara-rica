/** Enforces the first-load budget from docs/DESIGN.md: 200 KB gzipped JS+CSS, 500 KB total. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = new URL('../dist/', import.meta.url).pathname;
const BUDGET_GZIP = 200 * 1024;
const BUDGET_TOTAL = 500 * 1024;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

let gz = 0;
let total = 0;
for (const f of walk(dist)) {
  const buf = readFileSync(f);
  total += buf.length;
  if (/\.(js|css)$/.test(f) && !/workbox|sw\.js/.test(f)) gz += gzipSync(buf).length;
}
console.log(`gzipped app JS+CSS: ${(gz / 1024).toFixed(1)} KB (budget ${BUDGET_GZIP / 1024} KB)`);
console.log(`total dist:         ${(total / 1024).toFixed(1)} KB (budget ${BUDGET_TOTAL / 1024} KB)`);
if (gz > BUDGET_GZIP || total > BUDGET_TOTAL) {
  console.error('✗ over budget');
  process.exit(1);
}
