/**
 * Optional click when a month advances. Off by default; the choice is kept per device in
 * localStorage (same pattern as seen.ts) and nothing leaves the device. The sound is
 * synthesised with the Web Audio API, so there is no audio file to download and nothing to
 * license. Only a player's own tap makes a sound: the Capivara's run is silent, and the
 * fast-forward does not tick.
 */
const KEY = 'capivara-rica:sound';

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setSoundEnabled(on: boolean): void {
  try {
    if (on) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the toggle lasts for this page only */
  }
}

let ctx: AudioContext | null = null;

/** A short, soft tick: 880 Hz sliding to 660 Hz over 60 ms, peak gain 0.12. */
export function playTick(): void {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.06);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch {
    /* no audio: the game is unaffected */
  }
}
