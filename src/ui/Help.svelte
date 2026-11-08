<script lang="ts">
  import { help, ui } from '$lib/content';

  /** A tappable ℹ️ that opens a one-line explanation inline. Hover tooltips do not exist on phones. */
  let { id, label }: { id: string; label: string } = $props();
  let open = $state(false);
  const text = $derived(help(id));
</script>

{#if text}
  <button type="button" class="info" aria-expanded={open} aria-controls={`help-${id}`} aria-label={`${ui('helpButton')} ${label}`} onclick={() => (open = !open)}>
    <span aria-hidden="true">i</span>
  </button>
  {#if open}
    <p id={`help-${id}`} class="help small">{text}</p>
  {/if}
{/if}

<style>
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
    margin-left: 6px;
    /* 44px hit area without 44px of layout. */
    position: relative;
  }
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
  .help {
    margin: 6px 0 0;
    color: var(--ink-2);
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    line-height: 1.4;
  }
</style>
