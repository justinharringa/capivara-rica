<script lang="ts">
  import { game } from '$lib/game.svelte';
  import { events, t } from '$lib/content';
  import type { Stop } from '$engine/state';
  import { formatBRL } from '$engine/money';

  let { stop }: { stop: Stop } = $props();
  const text = $derived(events[stop.eventId]);
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
