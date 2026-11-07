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
<svg width={size} height={size} viewBox="0 0 184 110" role="img" aria-label="Capivara" class="capi">
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
  <!-- head: long wedge, about twice as long as tall; crown at the back, top line sloping down to a deep blunt nose -->
  <path d="M98 60 V30 Q98 20 108 20 H140 L176 32 V60 Q176 70 166 70 H108 Q98 70 98 60 Z" fill="#9c6b3c" />
  <!-- muzzle, slightly lighter, from below the eye to the nose -->
  <path d="M138 29 L176 32 V60 Q176 70 166 70 H138 Z" fill="#b07d4a" />
  <!-- nostrils on top of the snout, right at the tip -->
  <ellipse cx="168" cy="34" rx="2.4" ry="1.5" fill="#3f2712" />
  <ellipse cx="173" cy="35" rx="2" ry="1.3" fill="#3f2712" />
  <!-- mouth low on the front -->
  <path d="M166 62 q4 2 7 0" stroke="#3f2712" stroke-width="1.8" fill="none" stroke-linecap="round" />
  <!-- whisker dots along the muzzle -->
  <circle cx="156" cy="52" r="1" fill="#6b4420" /><circle cx="161" cy="55" r="1" fill="#6b4420" /><circle cx="151" cy="56" r="1" fill="#6b4420" />
  <!-- one tiny ear, far back, below the crown line -->
  <ellipse cx="107" cy="26" rx="4.5" ry="3.5" fill="#7a4f26" />
  <ellipse cx="107" cy="26" rx="2.4" ry="1.8" fill="#4a2e14" />
  <!-- eye: small, unlit, high and close to the ear -->
  <ellipse cx="121" cy="36" rx="3" ry="2.3" fill="#1a1a19" />
  <!-- brow by mood -->
  {#if mood === 'worried'}
    <path d="M115 30 L127 32.5" stroke="#5b3a1a" stroke-width="2.2" stroke-linecap="round" />
  {:else if mood === 'happy'}
    <path d="M116 31 Q121 28.5 126 31" stroke="#5b3a1a" stroke-width="2.2" fill="none" stroke-linecap="round" />
  {/if}
  <!-- accessories by wealth -->
  {#if wealth >= 1}
    <!-- sunglasses in profile: one slanted lens, a straight bridge hooking over the nose, a straight arm to the ear -->
    <path d="M113 31 H131 L129 41 H115 Q113 41 113 39 Z" fill="#1a1a19" />
    <path d="M117 38 L126 32" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.35" />
    <path d="M131 32 H139 V35" stroke="#1a1a19" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M113 33 L103 31" stroke="#1a1a19" stroke-width="1.8" stroke-linecap="round" />
  {/if}
  {#if wealth >= 2}
    <path d="M104 68 Q118 84 136 70" stroke="#d4a017" stroke-width="3" fill="none" />
    <circle cx="120" cy="79" r="4" fill="#d4a017" />
  {/if}
  {#if wealth >= 3}
    <path d="M104 20 L107 8 L114 16 L122 5 L130 16 L137 8 L140 20 Z" fill="#d4a017" stroke="#9a7212" stroke-width="1.5" />
  {/if}
</svg>

<style>
  .capi {
    display: block;
    flex: none;
    height: auto;
  }
</style>
