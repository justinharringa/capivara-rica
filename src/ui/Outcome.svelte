<script lang="ts">
  import type { Outcome } from '$lib/game.svelte';
  import { ui, events, t } from '$lib/content';
  import { formatBRL } from '$engine/money';

  let { outcome }: { outcome: Outcome } = $props();
  const text = $derived(events[outcome.eventId]);
  const chosen = $derived(text?.choices[outcome.choiceId]?.label ?? outcome.choiceId);
  const ghostLabel = $derived(outcome.ghostChoiceId ? (text?.choices[outcome.ghostChoiceId]?.label ?? outcome.ghostChoiceId) : null);
  const signed = (v: number): string => (v < 0 ? '−' : '+') + formatBRL(Math.abs(v));
  const lines = $derived(
    [
      { k: ui('outCash'), v: outcome.cash, money: true, goodUp: true },
      { k: ui('outSaved'), v: outcome.saved, money: true, goodUp: true },
      { k: ui('outDebt'), v: outcome.debt, money: true, goodUp: false },
      { k: ui('outCommitted'), v: outcome.committed, money: true, goodUp: false, perMonth: true },
      { k: ui('outWellbeing'), v: outcome.wellbeing, money: false, goodUp: true },
    ].filter((l) => l.v !== 0),
  );
</script>

<section class="card outcome" aria-live="polite">
  <h3 class="small muted">{ui('outcome')}</h3>
  <p><strong>→ {t(chosen)}</strong></p>
  {#if lines.length}
    <ul class="small">
      {#each lines as l (l.k)}
        <li class:good={l.goodUp ? l.v > 0 : l.v < 0} class:bad={l.goodUp ? l.v < 0 : l.v > 0}>
          {l.k}: {l.money ? signed(l.v) : (l.v > 0 ? '+' : '') + l.v}{l.perMonth ? '/mês' : ''}
        </li>
      {/each}
    </ul>
  {:else}
    <p class="small muted">{ui('outNothing')}</p>
  {/if}
  <p class="capi-line small">
    <span aria-hidden="true">🐾</span>
    {#if ghostLabel}{t(ui('outGhost'), { escolha: t(ghostLabel) })}{:else}{ui('outSame')}{/if}
  </p>
</section>

<style>
  .outcome {
    border-left: 4px solid var(--series-you);
  }
  h3 {
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 0.75rem;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 8px;
    display: grid;
    gap: 2px;
  }
  .capi-line {
    font-style: italic;
    color: var(--ink-2);
    margin: 0;
  }
</style>
