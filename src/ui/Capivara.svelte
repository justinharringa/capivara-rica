<script lang="ts">
  /** The mascot. `wealth` 0..3 adds accessories as the player's net worth grows; `mood` sets the brow. */
  let { wealth = 0, mood = 'calm', size = 96 }: { wealth?: number; mood?: 'calm' | 'worried' | 'happy'; size?: number } = $props();
</script>

<!--
  A capybara in profile, facing right. The cues that keep it from reading as a bear or a cub:
  a long loaf of a body (wider than tall), a wedge head whose crown sits higher than the nose,
  a blunt vertical snout with the nostrils on top, a small unlit eye set high and far back,
  one tiny ear, short legs, no tail.
-->
<svg width={size} height={size} viewBox="0 0 160 110" role="img" aria-label="Capivara" class="capi">
  <!-- legs: back pair, then front pair; darker toward the hooves -->
  <rect x="22" y="78" width="12" height="22" rx="4" fill="#7a4f26" />
  <rect x="40" y="80" width="12" height="20" rx="4" fill="#7a4f26" />
  <rect x="102" y="80" width="12" height="20" rx="4" fill="#7a4f26" />
  <rect x="122" y="78" width="12" height="22" rx="4" fill="#7a4f26" />
  <!-- body: a long loaf, rump rounder than the chest -->
  <path d="M38 40 H128 Q142 40 142 56 V74 Q142 86 128 86 H36 Q10 86 10 62 Q10 40 38 40 Z" fill="#9c6b3c" />
  <!-- lighter underside -->
  <path d="M30 70 H130 V76 Q130 84 122 84 H38 Q24 84 24 74 Q24 70 30 70 Z" fill="#b07d4a" />
  <!-- coarse fur: a few strokes along the flank -->
  <g stroke="#7a4f26" stroke-width="1.4" stroke-linecap="round" opacity="0.45">
    <path d="M50 54 l-3 7" /><path d="M68 52 l-3 7" /><path d="M86 54 l-3 7" />
  </g>
  <!-- head: wedge, crown high at the back, sloping to a blunt tall snout -->
  <path d="M102 60 V30 Q102 20 112 20 H138 L154 30 V60 Q154 70 144 70 H112 Q102 70 102 60 Z" fill="#9c6b3c" />
  <!-- muzzle face, slightly lighter -->
  <path d="M136 30 L154 30 V60 Q154 70 144 70 H136 Z" fill="#b07d4a" />
  <!-- nostrils on top of the snout -->
  <ellipse cx="146" cy="32" rx="2.4" ry="1.5" fill="#3f2712" />
  <ellipse cx="151" cy="33" rx="2" ry="1.3" fill="#3f2712" />
  <!-- mouth low on the front -->
  <path d="M146 61 q4 2 7 0" stroke="#3f2712" stroke-width="1.8" fill="none" stroke-linecap="round" />
  <!-- whisker dots -->
  <circle cx="141" cy="52" r="1" fill="#6b4420" /><circle cx="145" cy="55" r="1" fill="#6b4420" />
  <!-- one tiny ear, far back, below the crown line -->
  <ellipse cx="111" cy="26" rx="4.5" ry="3.5" fill="#7a4f26" />
  <ellipse cx="111" cy="26" rx="2.4" ry="1.8" fill="#4a2e14" />
  <!-- eye: small, unlit, high and far back -->
  <ellipse cx="124" cy="36" rx="3" ry="2.3" fill="#1a1a19" />
  <!-- brow by mood -->
  {#if mood === 'worried'}
    <path d="M118 30 L130 32.5" stroke="#5b3a1a" stroke-width="2.2" stroke-linecap="round" />
  {:else if mood === 'happy'}
    <path d="M119 31 Q124 28.5 129 31" stroke="#5b3a1a" stroke-width="2.2" fill="none" stroke-linecap="round" />
  {/if}
  <!-- accessories by wealth -->
  {#if wealth >= 1}
    <rect x="115" y="31" width="18" height="9" rx="3" fill="#1a1a19" />
    <path d="M115 35 L104 33" stroke="#1a1a19" stroke-width="2" stroke-linecap="round" />
  {/if}
  {#if wealth >= 2}
    <path d="M104 68 Q118 84 136 70" stroke="#d4a017" stroke-width="3" fill="none" />
    <circle cx="120" cy="79" r="4" fill="#d4a017" />
  {/if}
  {#if wealth >= 3}
    <path d="M108 20 L111 8 L118 16 L126 5 L134 16 L141 8 L144 20 Z" fill="#d4a017" stroke="#9a7212" stroke-width="1.5" />
  {/if}
</svg>

<style>
  .capi {
    display: block;
    flex: none;
    height: auto;
  }
</style>
