<script lang="ts">
  import { game } from '$lib/game.svelte';
  import { events, t, ui } from '$lib/content';
  import type { Stop } from '$engine/state';
  import { formatBRL } from '$engine/money';
  import Chart from './Chart.svelte';

  let { stop }: { stop: Stop } = $props();
  const text = $derived(events[stop.eventId]);
  const isChapter = $derived(stop.eventId === 'capitulo');
  const ghostNow = $derived(isChapter ? game.ghostNetWorthNow() : null);
  const you = $derived(isChapter ? game.state!.history : []);
  const ghostHistory = $derived(isChapter ? game.ghostHistorySoFar() : []);
  const signed = (v: number): string => (v < 0 ? '−' : '+') + formatBRL(Math.abs(v));
  // The guess-then-reveal step: hide the number until the player has committed a guess.
  let guess = $state('');
  let revealed = $state(false);
  const isGuess = $derived(stop.eventId === 'primeira_aplicacao');
</script>

<section class="card stop" aria-live="polite">
  <h2>{t(text?.title ?? stop.eventId, stop.vars)}</h2>
  <p>{t(text?.body ?? '', stop.vars)}</p>

  {#if isGuess && !revealed}
    <label class="small">
      Seu palpite (em reais)
      <input type="text" inputmode="numeric" bind:value={guess} placeholder="ex.: 15000" />
    </label>
    <button class="primary" onclick={() => (revealed = true)} disabled={!guess}>Revelar</button>
  {:else}
    {#if isGuess}
      <p class="reveal">
        Seu palpite: <strong>{formatBRL(Math.round(Number(guess.replace(/\D/g, '')) * 100) || 0)}</strong>.
        Resultado: <strong>{formatBRL(Number(stop.vars.dezAnos))}</strong>, dos quais {formatBRL(Number(stop.vars.depositado))} foram depósitos.
      </p>
    {/if}
    {#if isChapter}
      <div class="grid two chapter-grid">
        <div class="stat"><div class="label">{ui('chapterYou')}</div><div class="value">{formatBRL(Number(stop.vars.patrimonio))}</div></div>
        {#if ghostNow !== null}
          <div class="stat ghost">
            <div class="label">{ui('chapterGhost')}</div>
            <div class="value">
              {formatBRL(ghostNow)}
              <span class="small" class:good={Number(stop.vars.patrimonio) >= ghostNow} class:bad={Number(stop.vars.patrimonio) < ghostNow}>({signed(Number(stop.vars.patrimonio) - ghostNow)})</span>
            </div>
          </div>
        {/if}
        <div class="stat"><div class="label">{ui('chapterInterest')}</div><div class="value good">{formatBRL(Number(stop.vars.juros))}</div></div>
        <div class="stat"><div class="label">{ui('chapterInterestPaid')}</div><div class="value" class:bad={Number(stop.vars.jurosPagos) > 0}>{formatBRL(Number(stop.vars.jurosPagos))}</div></div>
      </div>
      {#if game.state!.flags.migratedAtMonth !== undefined && game.state!.chapterStart.ageMonths === game.state!.startAge * 12 + game.state!.flags.migratedAtMonth}
        <p class="small muted">{t(ui('statsSince'), { idade: Math.floor(game.state!.chapterStart.ageMonths / 12) })}</p>
      {/if}
      {#if ghostHistory.length > 1}
        <Chart {you} ghost={ghostHistory} />
      {/if}
    {/if}
    <p class="capi-line"><span aria-hidden="true">🐾</span> {t(text?.capi ?? '', stop.vars)}</p>
    <div class="choices">
      {#each stop.choices as c (c.id)}
        {@const ct = text?.choices[c.id]}
        <button onclick={() => game.choose(c.id)}>
          <strong>{t(ct?.label ?? c.id, { ...stop.vars, ...(c.vars ?? {}) })}</strong>
          {#if ct?.detail}
            <span class="small muted">{t(ct.detail, { ...stop.vars, ...(c.vars ?? {}) })}</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</section>

<style>
  .stop {
    border-color: var(--brand);
  }
  .chapter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin: 8px 0 12px;
  }
  .stat.ghost {
    border-left: 3px solid var(--series-ghost);
  }
  .capi-line {
    font-style: italic;
    color: var(--ink-2);
    border-left: 3px solid var(--brand);
    padding-left: 10px;
  }
  .choices {
    display: grid;
    gap: 8px;
  }
  .choices button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 2px;
    padding: 10px 14px;
  }
  .reveal {
    background: var(--surface-2);
    padding: 10px;
    border-radius: 10px;
  }
  label {
    display: grid;
    gap: 4px;
    margin-bottom: 8px;
  }
</style>
