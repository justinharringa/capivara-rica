<script lang="ts">
  import type { Snippet } from 'svelte';
  import { help } from '$lib/content';
  import Help from './Help.svelte';

  /** A dashboard tile: label with its ℹ️, value, optional action, and the explanation under the value. */
  let {
    id,
    label,
    valueClass = '',
    ghost = false,
    children,
    action,
  }: { id: string; label: string; valueClass?: string; ghost?: boolean; children: Snippet; action?: Snippet } = $props();
  let open = $state(false);
  const text = $derived(help(id));
</script>

<div class="stat" class:ghost>
  <div class="label">{label}<Help {id} {label} bind:open showText={false} /></div>
  <div class="value {valueClass}">{@render children()}</div>
  {#if action}
    <div class="action">{@render action()}</div>
  {/if}
  {#if open && text}
    <p id={`help-${id}`} class="help small">{text}</p>
  {/if}
</div>

<style>
  .stat.ghost {
    border-left: 3px solid var(--series-ghost);
  }
  .action {
    margin-top: 6px;
  }
  .action :global(button) {
    min-height: 32px;
    padding: 4px 10px;
    font-size: 0.85rem;
  }
  .help {
    margin: 6px 0 0;
    color: var(--ink-2);
    text-transform: none;
    letter-spacing: 0;
    line-height: 1.4;
  }
</style>
