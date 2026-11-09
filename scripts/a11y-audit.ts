/**
 * Accessibility audit: axe-core (WCAG 2.0/2.1/2.2 A + AA rules) on every screen of the game,
 * in light and dark mode, driven by Playwright through the `window.__game` hook of an E2E build.
 *
 *   VITE_E2E=1 npm run build && npm run a11y
 *
 * Starts `vite preview` itself. Exits 1 on any violation and prints the element and the fix
 * axe suggests. Screens: start; first month (guide + first stop); help and "Mover dinheiro"
 * open; the outcome card after a choice; the guess form of the first-investment stop; the
 * chapter card at 14; the end screen. Stops are answered with their first choice, which
 * reaches the end in under a minute.
 *
 * Playwright's own Chromium is used unless PW_CHROMIUM_PATH points at another binary (the
 * cloud sandbox preinstalls one at /opt/pw-browsers/chromium). axe covers the automated
 * subset of WCAG; keyboard order, focus visibility and meaning are still checked by hand.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium, type Page } from 'playwright';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PORT = Number(process.env.A11Y_PORT ?? 4173);
const URL = `http://localhost:${PORT}/`;

type Violation = { id: string; impact: string | null; help: string; nodes: { target: string[]; html: string; failureSummary: string }[] };
type Found = { scheme: string; screen: string; v: Violation };
const found: Found[] = [];
let screens = 0;

async function audit(p: Page, scheme: string, screen: string): Promise<void> {
  if (!(await p.evaluate(() => 'axe' in window))) await p.addScriptTag({ content: AXE });
  const r = (await p.evaluate((tags) => (window as unknown as { axe: { run: (c: Document, o: unknown) => Promise<{ violations: Violation[] }> } }).axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS)) as { violations: Violation[] };
  screens++;
  for (const v of r.violations) found.push({ scheme, screen, v });
  console.log(`${scheme.padEnd(5)} ${screen.padEnd(28)} ${r.violations.length} violation type(s)`);
}

async function resolveStop(p: Page, scheme: string, audited: Set<string>): Promise<boolean> {
  // The first-investment stop asks for a guess before it shows its choices.
  const guess = await p.$('.stop input[inputmode="numeric"]');
  if (guess) {
    if (!audited.has('stop-guess')) {
      audited.add('stop-guess');
      await audit(p, scheme, 'stop-guess');
    }
    await guess.fill('15000');
    await p.getByRole('button', { name: 'Revelar' }).click();
    await p.waitForTimeout(200);
  }
  const choice = await p.$('.stop .choices button');
  if (!choice) return false;
  await choice.click();
  await p.waitForTimeout(250);
  return true;
}

type GameWindow = Window & { __game: { state: { ageMonths: number; pending: unknown; ended: boolean } | null; advance: (untilStop: boolean) => Promise<void> } };
const readState = (p: Page) =>
  p.evaluate(() => {
    const g = (window as unknown as GameWindow).__game;
    return { has: !!g.state, pending: !!g.state?.pending, age: g.state?.ageMonths ?? 0, ended: !!g.state?.ended };
  });

async function run(scheme: 'light' | 'dark'): Promise<void> {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || undefined });
  const p = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
  const audited = new Set<string>();
  try {
    await p.goto(URL);
    await p.evaluate(() => {
      try {
        localStorage.clear();
      } catch {
        /* storage blocked */
      }
    });
    await p.reload();
    await p.waitForTimeout(300);
    await audit(p, scheme, 'start');
    await p.getByRole('button', { name: /10 anos/ }).first().click();
    await p.waitForTimeout(300);
    await audit(p, scheme, 'play-first-month');
    await p.getByRole('button', { name: 'Entendi' }).click();
    const info = await p.$('.stat button');
    if (info) await info.click();
    const move = p.getByRole('button', { name: /Mover dinheiro/ });
    if (await move.count()) await move.first().click();
    await p.waitForTimeout(200);
    await audit(p, scheme, 'play-help-and-move-open');
    await resolveStop(p, scheme, audited);
    await audit(p, scheme, 'play-outcome');
    for (let i = 0; i < 500; i++) {
      const st = await readState(p);
      if (!st.has || st.ended) break;
      if (st.age >= 14 * 12 && st.pending) break;
      if (st.pending) {
        if (!(await resolveStop(p, scheme, audited))) throw new Error(`stop without choices at ${st.age} months`);
        continue;
      }
      await p.evaluate(() => (window as unknown as GameWindow).__game.advance(true));
      await p.waitForTimeout(100);
    }
    await audit(p, scheme, 'chapter-card-14');
    for (let i = 0; i < 3000; i++) {
      const st = await readState(p);
      if (!st.has || st.ended) break;
      if (st.pending) {
        if (!(await resolveStop(p, scheme, audited))) throw new Error(`stop without choices at ${st.age} months`);
        continue;
      }
      await p.evaluate(() => (window as unknown as GameWindow).__game.advance(true));
      await p.waitForTimeout(60);
    }
    await p.waitForTimeout(400);
    const h1 = await p.$eval('h1', (e) => e.textContent).catch(() => null);
    if (!h1) throw new Error('the end screen was not reached');
    await audit(p, scheme, 'end');
  } finally {
    await browser.close();
  }
}

const preview = spawn('npx', ['--no-install', 'vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
try {
  let up = false;
  for (let i = 0; i < 60 && !up; i++) {
    up = await fetch(URL).then((r) => r.ok).catch(() => false);
    if (!up) await new Promise((r) => setTimeout(r, 500));
  }
  if (!up) throw new Error(`vite preview did not answer on ${URL}`);
  const hook = await fetch(URL).then((r) => r.text());
  if (!hook.includes('__game') && !process.env.A11Y_SKIP_HOOK_CHECK) {
    // The hook lives in the bundle, not in index.html; only warn, the run itself fails loudly.
    console.log('note: build with VITE_E2E=1 so window.__game is exposed');
  }
  await run('light');
  await run('dark');
} finally {
  preview.kill();
}

if (found.length) {
  console.error(`\n✗ ${found.length} violation(s) across ${screens} screens`);
  for (const { scheme, screen, v } of found) {
    console.error(`\n[${scheme}/${screen}] ${v.id} (${v.impact}): ${v.help}`);
    for (const n of v.nodes.slice(0, 5)) console.error(`  ${n.target.join(' ')}\n    ${n.html.slice(0, 140)}\n    ${n.failureSummary.split('\n').slice(0, 2).join(' ')}`);
  }
  process.exit(1);
}
console.log(`\n✓ no WCAG A/AA violations on ${screens} screens (light + dark)`);
