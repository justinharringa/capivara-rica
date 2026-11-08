<script lang="ts">
  import { game, params } from '$lib/game.svelte';
  import { ui, t, events } from '$lib/content';
  import { formatBRL, futureValueOfSeries, parseReais, annualToMonthly } from '$engine/money';
  import { score, netWorth, monthlyIncome, monthlyFixedCosts, committedMonthly } from '$engine/sim';
  import { monthlyRate } from '$engine/investments';
  import { renderShareCard, shareOrDownload } from '$lib/shareCard';
  import Capivara from './Capivara.svelte';
  import Chart from './Chart.svelte';

  const s = $derived(game.state!);
  const g = $derived(game.ghost);
  const yours = $derived(score(s));
  const theirs = $derived(g ? score(g) : 0);
  const wealth = $derived(yours >= 20000000 ? 3 : yours >= 5000000 ? 2 : yours >= 1000000 ? 1 : 0);
  const sprite = $derived(yours >= theirs ? (wealth === 0 ? 'happy' : `happy${wealth}`) : `wealth${wealth}`);
  let copied = $state(false);
  let shared = $state(false);

  // "E aos 40?": the current standing order kept for ten more years, compounding at the REAL
  // rate of the chosen instrument (nominal minus the inflation the game is running at), so the
  // answer is in the same reais of today as the score. Debt and locked money do not compound
  // at a savings rate, so the base is what is actually invested, never negative.
  const monthly = $derived(Math.max(0, Math.round(Math.max(0, monthlyIncome(s, params) - monthlyFixedCosts(s, params) - committedMonthly(s, params)) * s.standing.savePct)));
  const realRate = $derived((1 + monthlyRate(s, params, s.standing.saveInto)) / (1 + annualToMonthly(s.macro.ipcaAnnual)) - 1);
  const base = $derived(Math.max(0, netWorth(s) - s.fgts - s.peDeMeiaLocked));
  const at40 = $derived(Math.round((base * Math.pow(1 + realRate, 120) + futureValueOfSeries(monthly, realRate, 120)) / s.macro.priceIndex));
  let guess = $state('');
  let revealed = $state(false);

  const review = $derived(game.review);
  // The stop's vars live on its diary entry, so titles and labels render with their numbers.
  const stopVars = (d: { eventId: string; month: number }) => s.log.find((e) => e.key === `ev:${d.eventId}` && e.month === d.month)?.vars ?? {};
  const reviewTitle = (d: { eventId: string; month: number }): string => t(events[d.eventId]?.title ?? d.eventId, stopVars(d));
  const choiceLabel = (d: { eventId: string; month: number }, choiceId: string): string => t(events[d.eventId]?.choices[choiceId]?.label ?? choiceId, stopVars(d));

  async function share() {
    const text = t(ui('shareText'), { start: s.startAge, score: yours, ghost: theirs, url: location.origin + location.pathname });
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* user cancelled */
    }
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  async function shareImage() {
    const blob = await renderShareCard({ startAge: s.startAge, score: yours, ghost: theirs, sprite, url: location.origin + location.pathname }, import.meta.env.BASE_URL);
    if (!blob) return;
    const text = t(ui('shareText'), { start: s.startAge, score: yours, ghost: theirs, url: location.origin + location.pathname });
    const how = await shareOrDownload(blob, text);
    if (how === 'downloaded') {
      shared = true;
      setTimeout(() => (shared = false), 2000);
    }
  }
</script>

<div class="container">
  <header class="row">
    <Capivara size={96} {wealth} mood={yours >= theirs ? 'happy' : 'calm'} />
    <div>
      <h1>{ui('endTitle')}</h1>
      <p class="muted">{ui('endScore')}</p>
    </div>
  </header>

  <div class="grid two">
    <div class="stat"><div class="label">{ui('you')}</div><div class="value big">{formatBRL(yours)}</div></div>
    <div class="stat"><div class="label">{ui('ghost')}</div><div class="value big">{formatBRL(theirs)}</div></div>
  </div>

  <div class="grid two">
    <div class="stat"><div class="label">{ui('endInterest')}</div><div class="value good">{formatBRL(s.stats.interestEarned)}</div></div>
    <div class="stat"><div class="label">{ui('endInterestPaid')}</div><div class="value" class:bad={s.stats.interestPaid > 0}>{formatBRL(s.stats.interestPaid)}</div></div>
  </div>
  {#if s.flags.migratedAtMonth !== undefined}
    <p class="small muted">{t(ui('statsSince'), { idade: Math.floor((s.startAge * 12 + s.flags.migratedAtMonth) / 12) })}</p>
  {/if}

  <section class="card coda">
    <h2>{ui('codaTitle')}</h2>
    <p>{t(ui('codaBody'), { mensal: monthly, onde: s.standing.saveInto })}</p>
    {#if !revealed}
      <label class="small">
        {ui('codaGuess')}
        <input type="text" inputmode="numeric" bind:value={guess} placeholder="ex.: 300000" />
      </label>
      <button class="primary" onclick={() => (revealed = true)} disabled={!guess}>{ui('codaReveal')}</button>
    {:else}
      <p class="reveal">
        Seu palpite: <strong>{formatBRL(Math.max(0, parseReais(guess)))}</strong>.
        {t(ui('codaResult'), { aos40: at40, depositado: monthly * 120 })}
      </p>
      <p class="capi-line small"><span aria-hidden="true">🐾</span> {ui('codaCapi')}</p>
    {/if}
  </section>

  {#if g}
    <section class="card">
      <h2>{ui('ghostTitle')}</h2>
      <p class="muted small">{ui('ghostDesc')}{#if game.ghostSince !== null} {t(ui('ghostSince'), { idade: Math.floor(game.ghostSince / 12) })}{/if}</p>
      <Chart you={s.history} ghost={g.history} deflateYou={s.macro.priceIndex} deflateGhost={g.macro.priceIndex} />
      <p class="small" style="margin-top:8px">
        {#if yours >= theirs}
          Você venceu a Capivara por {formatBRL(yours - theirs)}. Ela quer saber como.
        {:else}
          A Capivara terminou {formatBRL(theirs - yours)} à frente, com a mesma sorte que você. A diferença foi escolha, não azar.
        {/if}
      </p>
    </section>
  {/if}

  <section class="card review">
    <h2>{ui('reviewTitle')}</h2>
    <p class="muted small">{ui('reviewDesc')}</p>
    {#if review === null}
      <p class="small muted">{ui('reviewUnavailable')}</p>
    {:else if review.length === 0}
      <p class="small">{ui('reviewNone')}</p>
    {:else}
      <ol class="decisions">
        {#each review as d (d.month + d.eventId)}
          <li>
            <strong>{reviewTitle(d)}</strong> <span class="small muted">({Math.floor(d.ageMonths / 12)} anos)</span>
            <div class="small">{ui('reviewYou')}: {choiceLabel(d, d.choiceId)} · {ui('reviewGhost')}: {choiceLabel(d, d.ghostChoiceId)}</div>
            <div class="bad">{t(ui('reviewCost'), { valor: d.cost })}</div>
          </li>
        {/each}
      </ol>
    {/if}
  </section>

  <div class="card row">
    <button class="primary" onclick={() => game.reset()}>{ui('playAgain')}</button>
    <button onclick={share}>{copied ? ui('shared') : ui('share')}</button>
    <button onclick={shareImage}>{shared ? ui('sharedImage') : ui('shareImage')}</button>
  </div>
</div>

<style>
  .two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin: 12px 0;
  }
  .big {
    font-size: 1.25rem;
  }
  .coda {
    border-color: var(--brand);
  }
  .reveal {
    background: var(--surface-2);
    padding: 10px;
    border-radius: 10px;
  }
  .capi-line {
    font-style: italic;
    color: var(--ink-2);
    border-left: 3px solid var(--brand);
    padding-left: 10px;
  }
  label {
    display: grid;
    gap: 4px;
    margin-bottom: 8px;
  }
  .decisions {
    padding-left: 20px;
    display: grid;
    gap: 10px;
    margin: 8px 0 0;
  }
</style>
