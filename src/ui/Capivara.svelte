<script lang="ts">
  /**
   * The mascot. `wealth` 0..3 picks the accessories as the player's net worth grows;
   * a non-calm `mood` wins over wealth, because the brow is the signal the player needs.
   * Sprites are cropped from assets/raw/capi-sheet-gemini-2026-11-07.jpg (see ASSETS.md).
   */
  let { wealth = 0, mood = 'calm', size = 96 }: { wealth?: number; mood?: 'calm' | 'worried' | 'happy'; size?: number } = $props();

  const base = import.meta.env.BASE_URL;
  const sprite = $derived(mood === 'calm' ? `wealth${Math.max(0, Math.min(3, Math.round(wealth)))}` : mood);
  // All sprites share one canvas: 400 x 329.
  const height = $derived(Math.round(size * (329 / 400)));
</script>

<img class="capi" src="{base}capi/{sprite}.webp" width={size} {height} alt="Capivara" decoding="async" />

<style>
  .capi {
    display: block;
    flex: none;
    height: auto;
    image-rendering: auto;
  }
</style>
