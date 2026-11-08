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

type ChoiceAction = Extract<Action, { kind: 'choice' }>;

/**
 * Play on from `start`, keeping the player's own later decisions. A counterfactual shifts
 * later events by months, so recorded choices are matched by event, in order of occurrence,
 * never by month: the player's n-th answer to an event is reused for its n-th occurrence here.
 * A stop with no recorded answer left takes the player's last answer to that event, when it
 * is still offered; only an event the player never met falls back to the policy. Standing
 * orders and money moves still happen at their recorded months.
 */
function playOn(start: GameState, p: Params, actions: Action[], from: number, policy: Policy): GameState {
  const s = structuredClone(start);
  const later = actions.slice(from);
  const queues = new Map<string, string[]>();
  const lastAnswer = new Map<string, string>();
  for (const a of actions) {
    if (a.kind !== 'choice') continue;
    lastAnswer.set(a.eventId, a.choiceId);
  }
  for (const a of later) {
    if (a.kind !== 'choice') continue;
    (queues.get(a.eventId) ?? queues.set(a.eventId, []).get(a.eventId)!).push(a.choiceId);
  }
  const others = later.filter((a): a is Exclude<Action, ChoiceAction> => a.kind !== 'choice');
  let k = 0;
  let guard = 0;
  while (!s.ended && guard < 2000) {
    guard += 1;
    while (k < others.length && others[k]!.month <= s.month) {
      applyAction(s, p, others[k]!);
      k += 1;
    }
    if (s.pending) {
      const offered = (id: string | undefined): id is string => !!id && s.pending!.choices.some((c) => c.id === id);
      const queue = queues.get(s.pending.eventId);
      const next = queue?.[0];
      let pick: string;
      if (offered(next)) {
        queue!.shift();
        pick = next;
      } else if (offered(lastAnswer.get(s.pending.eventId))) {
        pick = lastAnswer.get(s.pending.eventId)!;
      } else {
        pick = policy.choose(s, p, s.pending);
      }
      choose(s, p, pick);
    } else {
      stepMonth(s, p);
    }
  }
  return s;
}

/**
 * The `n` decisions that cost the most, by the score at 30. Null when the action log does not
 * reproduce the life (the UI then says the review is unavailable, rather than praising the
 * player); empty when every choice was already the Capivara's.
 */
export function costliestDecisions(s: GameState, p: Params, policy: Policy, n = 3): DecisionCost[] | null {
  if (!s.ended) return null;
  const forks: Array<{ index: number; before: GameState; alt: string }> = [];
  const replayed = replay(s, p, (state, index) => {
    const a = s.actions[index]!;
    if (a.kind !== 'choice' || !state.pending) return;
    const alt = taggedChoice(state.pending);
    if (alt && alt !== a.choiceId) forks.push({ index, before: structuredClone(state), alt });
  });
  if (!replayed || !replayed.ended || score(replayed) !== score(s)) return null;
  const actual = score(s);
  const out: DecisionCost[] = [];
  for (const f of forks) {
    const a = s.actions[f.index] as ChoiceAction;
    const cf = f.before;
    choose(cf, p, f.alt);
    const end = playOn(cf, p, s.actions, f.index + 1, policy);
    const cost = score(end) - actual;
    if (cost > 0) out.push({ month: a.month, ageMonths: cf.ageMonths, eventId: a.eventId, choiceId: a.choiceId, ghostChoiceId: f.alt, cost });
  }
  return out.sort((x, y) => y.cost - x.cost).slice(0, n);
}
