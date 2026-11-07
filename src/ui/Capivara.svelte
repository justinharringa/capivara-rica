<script lang="ts">
  /**
   * The mascot. `wealth` 0..3 picks the accessories as the player's net worth grows and
   * `mood` picks the expression; every combination has its own sprite.
   * Sprites are cut from the two sheets in assets/raw by scripts/cut-sprites.py (see ASSETS.md).
   */
  let { wealth = 0, mood = 'calm', size = 96 }: { wealth?: number; mood?: 'calm' | 'worried' | 'happy'; size?: number } = $props();

  const base = import.meta.env.BASE_URL;
  const level = $derived(Math.max(0, Math.min(3, Math.round(wealth))));
  // calm → wealth0..3; worried/happy → worried, worried1..3, happy, happy1..3 (accessories kept).
  const sprite = $derived(mood === 'calm' ? `wealth${level}` : level === 0 ? mood : `${mood}${level}`);
  // All sprites share one canvas: 400 x 368.
  const height = $derived(Math.round(size * (368 / 400)));
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
