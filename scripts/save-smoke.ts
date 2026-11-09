/**
 * Save-and-reload smoke test: a game saved through idb-keyval survives a reload and resumes
 * unchanged. Drives an E2E build in Playwright's Chromium through `window.__game`.
 *
 *   VITE_E2E=1 npm run build && npm run save:smoke
 *
 * Starts a Vite preview server itself, in-process, and closes it on the way out. The steps, each one a pass/fail:
 *   1. clear every stored save (IndexedDB and localStorage) and reload
 *   2. start a game, dismiss the guide, and play three months, answering every stop on the way
 *      (the game opens on a stop, and answering one can open the next), so the save holds
 *      both choices and elapsed months
 *   3. the save is in IndexedDB under `capivara-rica:save`, matching the live game; this is
 *      the line that tests idb-keyval, because src/lib/save.ts also writes a localStorage copy
 *      and swallows storage errors, so a broken idb-keyval would otherwise pass unnoticed
 *   4. delete the localStorage copy, so the resume below can only come through idb-keyval
 *   5. reload: the start screen offers "Continuar jogo salvo"
 *   6. resume: the game state equals the one saved in step 2
 *   7. no uncaught page errors
 *
 * Prints one JSON line and exits 1 at the first failed step. Playwright's own Chromium is used
 * unless PW_CHROMIUM_PATH points at another binary (the cloud sandbox preinstalls one).
 */
import { chromium, type Page } from 'playwright';
import { preview, type PreviewServer } from 'vite';

const PORT = Number(process.env.SAVE_SMOKE_PORT ?? 4174);
const URL = `http://localhost:${PORT}/`;
const KEY = 'capivara-rica:save';
// idb-keyval's default store: createStore('keyval-store', 'keyval').
const IDB_NAME = 'keyval-store';
const IDB_STORE = 'keyval';

type GameWindow = Window & {
  __game: {
    state: { seed: number; ageMonths: number; pending: unknown; ended: boolean; actions: unknown[] } | null;
    advance: (untilStop: boolean) => Promise<void>;
  };
};
const MONTHS = 3;

const result: Record<string, unknown> = { ok: false, failed: null };
const pageErrors: string[] = [];
let step = 'start vite preview';

function check(cond: boolean, detail: string): void {
  if (!cond) throw new Error(detail);
}

/** The game state as JSON, the form the save is stored in, so two states compare exactly. */
const liveState = (p: Page): Promise<string | null> =>
  p.evaluate(() => {
    const s = (window as unknown as GameWindow).__game?.state;
    return s ? JSON.stringify(s) : null;
  });

/** What idb-keyval holds under KEY, read with the raw IndexedDB API rather than idb-keyval itself. */
const idbSave = (p: Page): Promise<string | null> =>
  p.evaluate(
    ([name, store, key]) =>
      new Promise<string | null>((resolve, reject) => {
        const open = indexedDB.open(name);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          if (!db.objectStoreNames.contains(store)) {
            db.close();
            resolve(null);
            return;
          }
          const get = db.transaction(store, 'readonly').objectStore(store).get(key);
          get.onerror = () => reject(get.error);
          get.onsuccess = () => {
            db.close();
            resolve(get.result === undefined ? null : JSON.stringify(get.result));
          };
        };
      }),
    [IDB_NAME, IDB_STORE, KEY] as const,
  );

async function clearStorage(p: Page): Promise<void> {
  await p.evaluate(async (name) => {
    try {
      localStorage.clear();
    } catch {
      /* storage blocked */
    }
    await new Promise<void>((resolve) => {
      const del = indexedDB.deleteDatabase(name);
      del.onsuccess = del.onerror = del.onblocked = () => resolve();
    });
  }, IDB_NAME);
}

/** Answer the current stop with its first choice, filling the guess form first if it has one. */
async function answerStop(p: Page): Promise<void> {
  const guess = await p.$('.stop input[inputmode="numeric"]');
  if (guess) {
    await guess.fill('15000');
    await p.getByRole('button', { name: 'Revelar' }).click();
    await p.waitForTimeout(200);
  }
  const choice = await p.$('.stop .choices button');
  check(choice !== null, 'the first stop has no choice buttons');
  await choice!.click();
  await p.waitForTimeout(250);
}

async function run(): Promise<void> {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || undefined });
  try {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
    p.on('pageerror', (e) => pageErrors.push(String(e)));

    step = 'clear storage';
    await p.goto(URL);
    check(await p.evaluate(() => '__game' in window), 'window.__game is missing: build with VITE_E2E=1');
    await clearStorage(p);
    await p.reload();
    await p.waitForTimeout(300);
    check((await liveState(p)) === null, 'a game is loaded after clearing storage');

    step = `play ${MONTHS} months`;
    await p.getByRole('button', { name: /10 anos/ }).first().click();
    await p.waitForTimeout(300);
    await p.getByRole('button', { name: 'Entendi' }).click();
    const startAge = await p.evaluate(() => (window as unknown as GameWindow).__game.state?.ageMonths ?? -1);
    check(startAge >= 0, 'no game after choosing an age');
    for (let i = 0; i < 50; i++) {
      const st = await p.evaluate(() => {
        const g = (window as unknown as GameWindow).__game.state;
        return { age: g?.ageMonths ?? -1, pending: !!g?.pending, ended: !!g?.ended };
      });
      check(!st.ended, 'the game ended during the smoke test');
      if (st.age >= startAge + MONTHS && !st.pending) break;
      if (st.pending) await answerStop(p);
      else {
        await p.evaluate(() => (window as unknown as GameWindow).__game.advance(false));
        await p.waitForTimeout(100);
      }
    }
    await p.waitForTimeout(300);
    const saved = await liveState(p);
    check(saved !== null, 'no game state after playing');
    const s = JSON.parse(saved!) as { seed: number; ageMonths: number; actions: unknown[] };
    Object.assign(result, { seed: s.seed, ageMonths: s.ageMonths, actions: s.actions.length, bytes: saved!.length });
    check(s.ageMonths >= startAge + MONTHS, `only reached month ${s.ageMonths - startAge} of ${MONTHS}`);
    check(s.actions.length > 0, 'no choice was recorded');

    step = 'save is in IndexedDB';
    const inIdb = await idbSave(p);
    check(inIdb !== null, `nothing under "${KEY}" in IndexedDB "${IDB_NAME}"`);
    check(inIdb === saved, 'the IndexedDB save differs from the live game');

    step = 'drop the localStorage copy';
    await p.evaluate((key) => localStorage.removeItem(key), KEY);
    check((await p.evaluate((key) => localStorage.getItem(key), KEY)) === null, 'the localStorage copy is still there');

    step = 'reload offers the saved game';
    await p.reload();
    const resume = p.getByRole('button', { name: 'Continuar jogo salvo' });
    await resume.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined);
    check((await resume.count()) === 1, 'no "Continuar jogo salvo" button after reload');

    step = 'resume restores the game';
    await resume.click();
    await p.waitForFunction(() => !!(window as unknown as GameWindow).__game.state, null, { timeout: 10_000 }).catch(() => undefined);
    const resumed = await liveState(p);
    check(resumed !== null, 'no game state after resuming');
    check(resumed === saved, 'the resumed game differs from the one that was saved');

    step = 'no page errors';
    check(pageErrors.length === 0, `${pageErrors.length} uncaught page error(s)`);
    result.ok = true;
  } finally {
    await browser.close();
  }
}

// In-process, not `npx vite preview`: see the same note in scripts/a11y-audit.ts. A busy port
// fails here, at 'start vite preview', instead of testing whatever server already holds it.
let server: PreviewServer | undefined;
try {
  server = await preview({ logLevel: 'warn', preview: { port: PORT, strictPort: true, open: false } });
  await run();
} catch (e) {
  result.failed = step;
  result.reason = String(e instanceof Error ? e.message : e).split('\n')[0];
} finally {
  await server?.close();
}
if (pageErrors.length) result.pageErrors = pageErrors;
console.log(JSON.stringify(result));
process.exit(result.ok ? 0 : 1);
