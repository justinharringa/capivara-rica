<script lang="ts">
  /** The mascot. `wealth` 0..3 adds accessories as the player's net worth grows; `mood` sets the brow. */
  let { wealth = 0, mood = 'calm', size = 96 }: { wealth?: number; mood?: 'calm' | 'worried' | 'happy'; size?: number } = $props();
</script>

<!--
  A capybara, not a bear: boxy flat-topped head, blunt squared muzzle, nostrils on top of the
  snout, eyes set high, tiny ears far back, barrel body on short legs, no tail.
-->
<svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Capivara" class="capi">
  <!-- legs (back pair first so the body overlaps them) -->
  <rect x="26" y="84" width="11" height="20" rx="4" fill="#8a5a2b" />
  <rect x="44" y="86" width="11" height="18" rx="4" fill="#8a5a2b" />
  <rect x="64" y="86" width="11" height="18" rx="4" fill="#8a5a2b" />
  <rect x="80" y="84" width="11" height="20" rx="4" fill="#8a5a2b" />
  <!-- barrel body -->
  <rect x="12" y="46" width="82" height="46" rx="22" fill="#a9733b" />
  <!-- lighter belly -->
  <rect x="26" y="68" width="56" height="20" rx="10" fill="#b8824a" />
  <!-- head: flat top, blunt front -->
  <rect x="64" y="30" width="48" height="40" rx="9" fill="#a9733b" />
  <!-- muzzle block, slightly lighter, squared off -->
  <rect x="90" y="40" width="24" height="30" rx="7" fill="#b8824a" />
  <!-- nostrils sit on TOP of the snout -->
  <ellipse cx="105" cy="44" rx="2.4" ry="1.6" fill="#4a2e14" />
  <ellipse cx="111" cy="45" rx="2" ry="1.4" fill="#4a2e14" />
  <!-- mouth: a short line low on the muzzle -->
  <path d="M100 63 q6 3 11 0" stroke="#4a2e14" stroke-width="1.8" fill="none" stroke-linecap="round" />
  <!-- whisker dots -->
  <circle cx="97" cy="56" r="1" fill="#6b4420" />
  <circle cx="101" cy="58" r="1" fill="#6b4420" />
  <!-- tiny ears, high and far back -->
  <ellipse cx="74" cy="33" rx="5" ry="4" fill="#8a5a2b" />
  <ellipse cx="74" cy="33" rx="2.6" ry="2" fill="#5b3a1a" />
  <!-- eye: small, set high -->
  <circle cx="86" cy="44" r="2.8" fill="#1a1a19" />
  <circle cx="87" cy="43" r="0.9" fill="#ffffff" />
  <!-- brow by mood -->
  {#if mood === 'worried'}
    <path d="M80 38 L91 40.5" stroke="#5b3a1a" stroke-width="2.2" stroke-linecap="round" />
  {:else if mood === 'happy'}
    <path d="M81 39 Q86 36.5 91 39" stroke="#5b3a1a" stroke-width="2.2" fill="none" stroke-linecap="round" />
  {/if}
  <!-- accessories by wealth -->
  {#if wealth >= 1}
    <!-- sunglasses: one lens over the eye, arm back along the head -->
    <rect x="78" y="39" width="17" height="9" rx="3" fill="#1a1a19" />
    <path d="M78 42 L66 40" stroke="#1a1a19" stroke-width="2" stroke-linecap="round" />
  {/if}
  {#if wealth >= 2}
    <!-- chain around the neck -->
    <path d="M64 66 Q78 82 96 70" stroke="#d4a017" stroke-width="3" fill="none" />
    <circle cx="80" cy="77" r="4" fill="#d4a017" />
  {/if}
  {#if wealth >= 3}
    <!-- crown on the flat head -->
    <path d="M70 30 L73 18 L80 26 L88 15 L96 26 L103 18 L106 30 Z" fill="#d4a017" stroke="#9a7212" stroke-width="1.5" />
  {/if}
</svg>

<style>
  .capi {
    display: block;
    flex: none;
  }
</style>
