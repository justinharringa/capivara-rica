/**
 * Deterministic PRNG with named streams.
 *
 * Each stream (macro, events, shocks, ...) has its own state, so the ghost replay
 * can reuse the exact same luck while the player's choices differ: drawing an
 * extra number in one stream never shifts the draws of another. The state lives
 * inside the GameState so a save file is fully reproducible.
 *
 * Algorithm: mulberry32, a small 32-bit generator that is good enough for a game.
 */
export type RngStream = 'macro' | 'events' | 'shocks' | 'career' | 'misc';
export const RNG_STREAMS: readonly RngStream[] = ['macro', 'events', 'shocks', 'career', 'misc'];

export type RngState = Record<RngStream, number>;

/** A stateless 32-bit hash, for choices that must not consume a stream (e.g. which object is on sale). */
export function hash32(seed: number, salt: number): number {
  let h = (seed ^ (salt * 0x9e3779b9)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export function initRng(seed: number): RngState {
  const s = {} as RngState;
  RNG_STREAMS.forEach((name, i) => {
    s[name] = hash32(seed, i + 1) || 1;
  });
  return s;
}

/** Uniform in [0, 1). Advances the named stream in place. */
export function random(state: RngState, stream: RngStream): number {
  let a = (state[stream] + 0x6d2b79f5) >>> 0;
  state[stream] = a;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [min, max] inclusive. */
export function randomInt(state: RngState, stream: RngStream, min: number, max: number): number {
  return min + Math.floor(random(state, stream) * (max - min + 1));
}

/** Approximate normal via sum of uniforms (fine for macro drift). */
export function randomNormal(state: RngState, stream: RngStream, mean: number, sd: number): number {
  let s = 0;
  for (let i = 0; i < 6; i++) s += random(state, stream);
  return mean + sd * ((s - 3) / Math.sqrt(0.5));
}

export const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));
