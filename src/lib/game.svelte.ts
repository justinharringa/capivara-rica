import brJson from '$data/br/2026-11.json';
import { loadParams, type ParamFile } from '$engine/params';
import type { GameState, StartAge, Standing, CardPolicy } from '$engine/state';
import { newGame, stepMonth, choose, setStanding, setCardPolicy, runWithPolicy } from '$engine/sim';
import { capivaraPolicy } from '$engine/policies';
import { loadSave, writeSave, clearSave } from './save';

export const params = loadParams(brJson as ParamFile);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function randomSeed(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0]! || 1;
}

export class Game {
  state = $state.raw<GameState | null>(null);
  ghost = $state.raw<GameState | null>(null);
  busy = $state(false);
  hasSave = $state(false);

  async init(): Promise<void> {
    const s = await loadSave();
    this.hasSave = !!s && !s.ended;
  }

  async resume(): Promise<void> {
    const s = await loadSave();
    if (s) this.state = s;
  }

  start(startAge: StartAge, publicSchool: boolean): void {
    this.ghost = null;
    this.state = newGame({ seed: randomSeed(), startAge, publicSchool }, params);
    void writeSave(this.state);
  }

  /**
   * The engine mutates one object in place; the UI re-renders on a new reference.
   * Always clone the object the engine just touched, never `this.state`, which may
   * already be an older clone.
   */
  private touch(from: GameState): void {
    this.state = { ...from };
  }

  /** Advance one month (`untilStop` false) or month by month until the next stop or the end. */
  async advance(untilStop = false): Promise<void> {
    const s = this.state;
    if (!s || this.busy || s.pending || s.ended) return;
    this.busy = true;
    try {
      do {
        stepMonth(s, params);
        this.touch(s);
        if (untilStop && !s.pending && !s.ended) await sleep(25);
      } while (untilStop && !s.pending && !s.ended);
    } finally {
      this.busy = false;
      this.touch(s);
      await this.afterChange();
    }
  }

  async choose(choiceId: string): Promise<void> {
    const s = this.state;
    if (!s || !s.pending) return;
    choose(s, params, choiceId);
    this.touch(s);
    await this.afterChange();
  }

  updateStanding(patch: Partial<Standing>): void {
    const s = this.state;
    if (!s) return;
    setStanding(s, patch);
    this.touch(s);
    void writeSave(s);
  }

  updateCardPolicy(policy: CardPolicy): void {
    const s = this.state;
    if (!s) return;
    setCardPolicy(s, policy);
    this.touch(s);
    void writeSave(s);
  }

  private async afterChange(): Promise<void> {
    const s = this.state;
    if (!s) return;
    if (s.ended && !this.ghost) {
      this.ghost = runWithPolicy({ seed: s.seed, startAge: s.startAge, publicSchool: s.publicSchool }, params, capivaraPolicy);
      await clearSave();
      this.hasSave = false;
    } else {
      await writeSave(s);
    }
  }

  async reset(): Promise<void> {
    await clearSave();
    this.state = null;
    this.ghost = null;
    this.hasSave = false;
  }
}

export const game = new Game();
