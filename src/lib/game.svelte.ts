import brJson from '$data/br/2026-11.json';
import { loadParams, type ParamFile } from '$engine/params';
import type { GameState, StartAge, Standing, CardPolicy, SaveTarget } from '$engine/state';
import { newGame, stepMonth, choose, setStanding, setCardPolicy, runWithPolicy, runWithPolicyFrom, debtTotal, committedMonthly, depositSavings, withdrawSavings } from '$engine/sim';
import { savedTotal } from '$engine/investments';
import { capivaraPolicy } from '$engine/policies';
import { loadSave, loadGhostFork, writeSave, clearSave } from './save';

export const params = loadParams(brJson as ParamFile);

/** What one choice did to the numbers, shown right after it so the feedback is immediate. */
export interface Outcome {
  eventId: string;
  choiceId: string;
  cash: number;
  saved: number;
  debt: number;
  committed: number;
  wellbeing: number;
  /** The choice the ghost would have made, or null when no offered choice carries its tag. */
  ghostChoiceId: string | null;
  sameAsGhost: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function randomSeed(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0]! || 1;
}

function snapshot(s: GameState) {
  return {
    cash: s.cash,
    saved: savedTotal(s),
    debt: debtTotal(s),
    committed: committedMonthly(s, params),
    wellbeing: s.wellbeing,
  };
}

export class Game {
  state = $state.raw<GameState | null>(null);
  /** The Capivara's life on the same seed. Built at the start, so every screen can compare. */
  ghost = $state.raw<GameState | null>(null);
  lastOutcome = $state.raw<Outcome | null>(null);
  busy = $state(false);
  hasSave = $state(false);
  /** The stored game comes from a newer build; the page must reload to pick up the new shell. */
  newerSave = $state(false);
  /** Age in months from which the Capivara plays, when the game was migrated; null when from birth. */
  ghostSince = $state<number | null>(null);

  async init(): Promise<void> {
    const r = await loadSave(params);
    this.newerSave = r.newer;
    this.hasSave = !!r.state && !r.state.ended;
  }

  async resume(): Promise<void> {
    const r = await loadSave(params);
    this.newerSave = r.newer;
    if (!r.state) return;
    this.state = r.state;
    this.lastOutcome = null;
    const fork = await loadGhostFork(params);
    if (fork && fork.seed === r.state.seed) {
      this.ghost = runWithPolicyFrom(fork, params, capivaraPolicy);
      this.ghostSince = fork.ageMonths;
    } else {
      this.ghost = this.buildGhost(r.state);
      this.ghostSince = null;
    }
  }

  start(startAge: StartAge, publicSchool: boolean): void {
    this.lastOutcome = null;
    this.ghostSince = null;
    this.state = newGame({ seed: randomSeed(), startAge, publicSchool }, params);
    this.ghost = this.buildGhost(this.state);
    void writeSave(this.state);
  }

  /** Deterministic: same seed, same macro draws, same luck. A few milliseconds. */
  private buildGhost(s: GameState): GameState {
    return runWithPolicy({ seed: s.seed, startAge: s.startAge, publicSchool: s.publicSchool }, params, capivaraPolicy);
  }

  /** The ghost's net worth at the player's current age, or null before the ghost exists. */
  ghostNetWorthNow(): number | null {
    const s = this.state;
    const g = this.ghost;
    if (!s || !g) return null;
    const i = s.ageMonths - s.startAge * 12;
    const h = g.history[i];
    return h && h.ageMonths === s.ageMonths ? h.netWorth : null;
  }

  /** The ghost's history up to the player's current age, for a chapter chart. */
  ghostHistorySoFar() {
    const s = this.state;
    const g = this.ghost;
    if (!s || !g) return [];
    return g.history.slice(0, s.ageMonths - s.startAge * 12 + 1);
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
      // A new stop replaces the last outcome; between stops it stays as a reminder.
      if (s.pending) this.lastOutcome = null;
      this.touch(s);
      await this.afterChange();
    }
  }

  async choose(choiceId: string): Promise<void> {
    const s = this.state;
    if (!s || !s.pending) return;
    const stop = s.pending;
    const before = snapshot(s);
    // Only a tagged choice is the Capivara's; chooseByTags' first-choice fallback is for the
    // ghost run, not for attributing an arbitrary option (often the credit one) to it.
    const ghostChoice = (stop.choices.find((c) => c.tags.includes('capivara')) ?? stop.choices.find((c) => c.tags.includes('capivara2')))?.id ?? null;
    choose(s, params, choiceId);
    const after = snapshot(s);
    this.lastOutcome = {
      eventId: stop.eventId,
      choiceId,
      cash: after.cash - before.cash,
      saved: after.saved - before.saved,
      debt: after.debt - before.debt,
      committed: after.committed - before.committed,
      wellbeing: after.wellbeing - before.wellbeing,
      ghostChoiceId: ghostChoice,
      sameAsGhost: ghostChoice === choiceId,
    };
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

  /** Conta → Guardado, into the standing-order target. */
  deposit(amount: number): void {
    const s = this.state;
    if (!s) return;
    depositSavings(s, amount);
    this.touch(s);
    void writeSave(s);
  }

  /** Guardado → Conta, net of IR. */
  withdraw(target: SaveTarget, amount: number): void {
    const s = this.state;
    if (!s) return;
    withdrawSavings(s, params, target, amount);
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
    if (s.ended) {
      if (!this.ghost) this.ghost = this.buildGhost(s);
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
    this.ghostSince = null;
    this.lastOutcome = null;
    this.hasSave = false;
  }
}

export const game = new Game();
