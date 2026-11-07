<script lang="ts">
  /**
   * The mascot. `wealth` 0..3 picks the accessories as the player's net worth grows and
   * `mood` picks the expression; every combination has its own sprite.
   * Sprites are cut from the two sheets in assets/raw by scripts/cut-sprites.py (see ASSETS.md).
   * With sunglasses on, the worried face is hard to tell from calm, so the worried mood also
   * gets a sweat drop drawn over the sprite.
   */
  let { wealth = 0, mood = 'calm', size = 96 }: { wealth?: number; mood?: 'calm' | 'worried' | 'happy'; size?: number } = $props();

  const base = import.meta.env.BASE_URL;
  const level = $derived(Math.max(0, Math.min(3, Math.round(wealth))));
  // calm → wealth0..3; worried/happy → worried, worried1..3, happy, happy1..3 (accessories kept).
  const sprite = $derived(mood === 'calm' ? `wealth${level}` : level === 0 ? mood : `${mood}${level}`);
  // All sprites share one canvas: 400 x 368.
  const height = $derived(Math.round(size * (368 / 400)));
</script>

<span class="capi" style="width:{size}px;height:{height}px">
  <img src="{base}capi/{sprite}.webp" width={size} {height} alt="Capivara" decoding="async" />
  {#if mood === 'worried'}
    <svg class="drop" viewBox="0 0 20 28" aria-hidden="true" style="width:{Math.round(size * 0.08)}px">
      <path d="M10 1 C6 9 2 13 2 18.5 A8 8 0 0 0 18 18.5 C18 13 14 9 10 1 Z" fill="#5aa9e6" stroke="#2f6f9e" stroke-width="1.2" />
      <path d="M6.5 19 A3.5 3.5 0 0 0 9 22.5" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.8" />
    </svg>
    {#if level >= 1}
      <!-- the sunglasses sit in front of the drop: repaint just the lens region of the sprite on top -->
      <img class="lens" src="{base}capi/{sprite}.webp" width={size} {height} alt="" aria-hidden="true" decoding="async" />
    {/if}
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
  .lens {
    position: absolute;
    inset: 0;
    /* the sunglasses box, measured from the sprites: x 52%..80%, y 17%..28% */
    clip-path: inset(16.5% 20% 71.5% 51.5%);
    pointer-events: none;
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
