<script lang="ts">
  /**
   * The mascot. `wealth` 0..3 picks the accessories as the player's net worth grows, `mood`
   * picks the expression and `age` picks the sheet: child (backpack, under 14), teen
   * (headphones, 14 to 17) or adult. Sprites are cut from the sheets in assets/raw by
   * scripts/cut-sprites.py (see ASSETS.md). The adult and child sets share one 622 x 573 source
   * canvas at the same scale, so the child is drawn smaller; the teen sits on a 520 x 479 canvas,
   * which puts it between the two. Adult files are exported at 400 x 368, child and teen at
   * 200 x 184 (they are only ever shown at 64 px); the component sizes by `size`.
   * With sunglasses on, the worried face is hard to tell from calm, so the worried mood also
   * gets a sweat drop drawn over the sprite, in front of the glasses. The teen sheet has no
   * worried face with accessories and no happy face with the chain alone: there, the calm sprite
   * plus the drop is the worry, and happy1 stands in for happy2.
   */
  let {
    wealth = 0,
    mood = 'calm',
    age = 'adult',
    size = 96,
  }: { wealth?: number; mood?: 'calm' | 'worried' | 'happy'; age?: 'child' | 'teen' | 'adult'; size?: number } = $props();

  const base = import.meta.env.BASE_URL;
  const level = $derived(Math.max(0, Math.min(3, Math.round(wealth))));
  // calm → wealth0..3; worried/happy → worried, worried1..3, happy, happy1..3 (accessories kept).
  const sprite = $derived.by(() => {
    if (mood === 'calm') return `wealth${level}`;
    if (level === 0) return mood;
    if (age === 'teen') return mood === 'worried' ? `wealth${level}` : level === 2 ? 'happy1' : `happy${level}`;
    return `${mood}${level}`;
  });
  const dir = $derived(age === 'adult' ? 'capi/' : `capi/${age}/`);
  const height = $derived(Math.round(size * (368 / 400)));
  // The drop scales with how much of the canvas the figure fills: adult 95%, teen 82%, child 69%.
  const dropWidth = $derived(Math.max(3, Math.round(size * (age === 'adult' ? 0.065 : age === 'teen' ? 0.055 : 0.045))));
</script>

<span class="capi {age}" style="width:{size}px;height:{height}px">
  <img src="{base}{dir}{sprite}.webp" width={size} {height} alt="Capivara" decoding="async" />
  {#if mood === 'worried'}
    <svg class="drop" viewBox="0 0 20 28" aria-hidden="true" style="width:{dropWidth}px">
      <path d="M10 1 C6 9 2 13 2 18.5 A8 8 0 0 0 18 18.5 C18 13 14 9 10 1 Z" fill="#5aa9e6" stroke="#2f6f9e" stroke-width="1.2" />
      <path d="M6.5 19 A3.5 3.5 0 0 0 9 22.5" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.8" />
    </svg>
  {/if}
</span>

<style>
  .capi {
    position: relative;
    display: block;
    flex: none;
  }
  .capi img {
    display: block;
    width: 100%;
    height: auto;
  }
  .drop {
    position: absolute;
    /* on the brow: just above the hinge of the sunglasses, overlapping the head */
    left: 55%;
    top: 21%;
    height: auto;
    transform: rotate(14deg);
    animation: drip 1.6s ease-in-out infinite;
  }
  /* Measured on the sprites: the sunglasses span x 52-93% / y 16-28% of the canvas on the adult,
     x 47-88% / y 27-38% on the teen and x 51-81% / y 39-48% on the child. The drop sits on the
     ear-side end of the glasses in all three. */
  .teen .drop {
    left: 50%;
    top: 32%;
  }
  .child .drop {
    left: 53%;
    top: 43%;
  }
  @keyframes drip {
    0%,
    100% {
      transform: translateY(0) rotate(14deg);
    }
    50% {
      transform: translateY(6%) rotate(14deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .drop {
      animation: none;
    }
  }
</style>
