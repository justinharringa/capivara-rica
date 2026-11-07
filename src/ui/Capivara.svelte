<script lang="ts">
  /** The mascot. `wealth` 0..3 adds accessories as the player's net worth grows; `mood` sets the brow. */
  let { wealth = 0, mood = 'calm', size = 96 }: { wealth?: number; mood?: 'calm' | 'worried' | 'happy'; size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 120 120"
  role="img"
  aria-label="Capivara"
  class="capi"
>
  <!-- body -->
  <ellipse cx="58" cy="78" rx="40" ry="26" fill="#a9733b" />
  <!-- legs -->
  <rect x="30" y="92" width="10" height="16" rx="4" fill="#8a5a2b" />
  <rect x="48" y="96" width="10" height="14" rx="4" fill="#8a5a2b" />
  <rect x="70" y="96" width="10" height="14" rx="4" fill="#8a5a2b" />
  <!-- head -->
  <circle cx="84" cy="58" r="24" fill="#a9733b" />
  <ellipse cx="100" cy="64" rx="12" ry="9" fill="#b8824a" />
  <!-- ears -->
  <circle cx="72" cy="40" r="6" fill="#a9733b" />
  <circle cx="92" cy="37" r="6" fill="#a9733b" />
  <!-- eye -->
  <circle cx="90" cy="54" r="3.2" fill="#1a1a19" />
  <!-- brow -->
  {#if mood === 'worried'}
    <path d="M84 46 L96 49" stroke="#5b3a1a" stroke-width="2.5" stroke-linecap="round" />
  {:else if mood === 'happy'}
    <path d="M85 47 Q90 44 95 47" stroke="#5b3a1a" stroke-width="2.5" fill="none" stroke-linecap="round" />
  {/if}
  <!-- nose -->
  <ellipse cx="108" cy="62" rx="4" ry="2.6" fill="#5b3a1a" />
  <!-- accessories by wealth -->
  {#if wealth >= 1}
    <!-- sunglasses -->
    <rect x="82" y="50" width="16" height="8" rx="3" fill="#1a1a19" />
    <rect x="99" y="52" width="9" height="6" rx="3" fill="#1a1a19" />
  {/if}
  {#if wealth >= 2}
    <!-- chain -->
    <path d="M66 74 Q84 92 102 76" stroke="#d4a017" stroke-width="3" fill="none" />
    <circle cx="84" cy="84" r="4" fill="#d4a017" />
  {/if}
  {#if wealth >= 3}
    <!-- crown -->
    <path d="M70 36 L74 24 L80 32 L86 20 L92 32 L98 24 L102 36 Z" fill="#d4a017" stroke="#9a7212" stroke-width="1.5" />
  {/if}
</svg>

<style>
  .capi {
    display: block;
    flex: none;
  }
</style>
