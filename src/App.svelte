<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from '$lib/game.svelte';
  import Start from './ui/Start.svelte';
  import Play from './ui/Play.svelte';
  import End from './ui/End.svelte';

  onMount(() => {
    void game.init();
  });
</script>

{#if !game.state}
  <Start />
{:else if game.state.ended}
  <End />
{:else}
  <Play />
{/if}
