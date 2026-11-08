import type { Centavos } from './money';
import type { Params } from './params';
import type { GameState, Action, Stop } from './state';
import { newGame, stepMonth, choose, score, setStanding, setCardPolicy, depositSavings, withdrawSavings, type Policy } from './sim';

/**
 * "As decisões que mais custaram": for each stop where the player did not take the Capivara's
 * choice, replay the life with her choice at that one stop and the player's own actions
 * afterwards wherever they still apply, and measure the score at 30. The difference is what
 * that single decision cost. Everything is deterministic (same seed, same streams), so the
 * only variable is the choice.
 */
export interface DecisionCost {
  month: number;
  ageMonths: number;
  eventId: string;
  choiceId: string;
  ghostChoiceId: string;
  /** Score at 30 with the Capivara's choice minus the actual score; positive means it cost you. */
  cost: Centavos;
}

const taggedChoice = (stop: Stop): string | null =>
  (stop.choices.find((c) => c.tags.includes('capivara')) ?? stop.choices.find((c) => c.tags.includes('capivara2')))?.id ?? null;

function applyAction(s: GameState, p: Params, a: Action): void {
  switch (a.kind) {
    case 'choice':
      choose(s, p, a.choiceId);
      break;
    case 'standing':
      setStanding(s, a.patch);
      break;
    case 'cardPolicy':
      setCardPolicy(s, a.policy);
      break;
    case 'deposit':
      depositSavings(s, a.amount);
      break;
    case 'withdraw':
      withdrawSavings(s, p, a.target, a.amount);
      break;
  }
}

const choiceFits = (s: GameState, a: Action): boolean =>
  a.kind === 'choice' && !!s.pending && s.pending.eventId === a.eventId && s.pending.choices.some((c) => c.id === a.choiceId);

/**
 * Replay a life from its action log. Returns the state at the end of the log, or null when the
 * log does not reproduce the life (a stop the record does not match, which happens for games
 * saved before the log existed, where only the choices survived).
 */
export function replay(s: GameState, p: Params, onStop?: (state: GameState, index: number) => void): GameState | null {
  const r = newGame({ seed: s.seed, startAge: s.startAge, publicSchool: s.publicSchool }, p);
  for (let i = 0; i < s.actions.length; i += 1) {
    const a = s.actions[i]!;
    while (r.month < a.month) {
      if (r.pending) return null; // a month cannot pass with a stop open
      stepMonth(r, p);
    }
    if (r.month > a.month) return null;
    if (a.kind === 'choice') {
      if (!choiceFits(r, a)) return null;
      onStop?.(r, i);
    }
    applyAction(r, p, a);
  }
  // A finished life has quiet months after its last action; a stop there means divergence.
  if (s.ended) {
    while (!r.ended) {
      if (r.pending) return null;
      stepMonth(r, p);
    }
  }
  return r;
}

/** Play on from `start`: the player's later actions where they still apply, the policy otherwise. */
function playOn(start: GameState, p: Params, actions: Action[], from: number, policy: Policy): GameState {
  const s = structuredClone(start);
  let j = from;
  let guard = 0;
  while (!s.ended && guard < 2000) {
    guard += 1;
    // Standing orders and money moves recorded for this month or earlier still happen; a
    // recorded choice whose month has passed is gone.
    while (j < actions.length && actions[j]!.month <= s.month) {
      const a = actions[j]!;
      if (a.kind === 'choice') {
        if (a.month < s.month) {
          j += 1;
          continue;
        }
        break;
      }
      applyAction(s, p, a);
      j += 1;
    }
    if (s.pending) {
      const a = actions[j];
      if (a && a.month === s.month && choiceFits(s, a)) {
        applyAction(s, p, a);
        j += 1;
      } else {
        choose(s, p, policy.choose(s, p, s.pending));
      }
    } else {
      stepMonth(s, p);
    }
  }
  return s;
}

/**
 * The `n` decisions that cost the most, by the score at 30. Empty when the action log does not
 * reproduce the life, or when every choice was already the Capivara's.
 */
export function costliestDecisions(s: GameState, p: Params, policy: Policy, n = 3): DecisionCost[] {
  if (!s.ended) return [];
  const forks: Array<{ index: number; before: GameState; alt: string }> = [];
  const replayed = replay(s, p, (state, index) => {
    const a = s.actions[index]!;
    if (a.kind !== 'choice' || !state.pending) return;
    const alt = taggedChoice(state.pending);
    if (alt && alt !== a.choiceId) forks.push({ index, before: structuredClone(state), alt });
  });
  if (!replayed || !replayed.ended || score(replayed) !== score(s)) return [];
  const actual = score(s);
  const out: DecisionCost[] = [];
  for (const f of forks) {
    const a = s.actions[f.index] as Extract<Action, { kind: 'choice' }>;
    const cf = f.before;
    choose(cf, p, f.alt);
    const end = playOn(cf, p, s.actions, f.index + 1, policy);
    const cost = score(end) - actual;
    if (cost > 0) out.push({ month: a.month, ageMonths: cf.ageMonths, eventId: a.eventId, choiceId: a.choiceId, ghostChoiceId: f.alt, cost });
  }
  return out.sort((x, y) => y.cost - x.cost).slice(0, n);
}
