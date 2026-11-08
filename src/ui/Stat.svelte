<script lang="ts">
  import type { Snippet } from 'svelte';
  import { help, ui } from '$lib/content';

  /** A dashboard tile: label, value, and a tappable ℹ️ whose explanation opens under the value. */
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
  <div class="label">
    {label}
    {#if text}
      <button type="button" class="info" aria-expanded={open} aria-controls={`help-${id}`} aria-label={`${ui('helpButton')} ${label}`} onclick={() => (open = !open)}>
        <span aria-hidden="true">i</span>
      </button>
    {/if}
  </div>
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
  .info {
    min-height: 0;
    width: 20px;
    height: 20px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--ink-3);
    background: transparent;
    color: var(--ink-3);
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    margin-left: 4px;
    position: relative;
  }
  /* 44px hit area without 44px of layout. */
  .info::after {
    content: '';
    position: absolute;
    inset: -12px;
  }
  .info[aria-expanded='true'] {
    background: var(--brand);
    border-color: var(--brand);
    color: var(--brand-ink);
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
    line-height: 1.4;
  }
</style>
