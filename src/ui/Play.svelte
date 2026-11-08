<script lang="ts">
  import { game, params } from '$lib/game.svelte';
  import { ui, strings, events, t } from '$lib/content';
  import { formatBRL } from '$engine/money';
  import { netWorth, monthlyIncome, comprometimento, debtTotal } from '$engine/sim';
  import { investedTotal } from '$engine/investments';
  import { capRoom } from '$engine/card';
  import { isNegativado, chapterOf, CHAPTERS } from '$engine/state';
  import Capivara from './Capivara.svelte';
  import StopCard from './StopCard.svelte';
  import Standing from './Standing.svelte';
  import Outcome from './Outcome.svelte';
  import Stat from './Stat.svelte';

  const s = $derived(game.state!);
  const nw = $derived(netWorth(s));
  const years = $derived(Math.floor(s.ageMonths / 12));
  const months = $derived(s.ageMonths % 12);
  const income = $derived(monthlyIncome(s, params));
  const comp = $derived(comprometimento(s, params));
  const compClass = $derived(comp >= params.comprometimentoRed ? 'bad' : comp >= params.comprometimentoYellow ? 'warn' : 'good');
  const compLabel = $derived(comp >= params.comprometimentoRed ? 'alto' : comp >= params.comprometimentoYellow ? 'atenção' : 'ok');
  const wealth = $derived(nw >= 20000000 ? 3 : nw >= 5000000 ? 2 : nw >= 1000000 ? 1 : 0);
  const mood = $derived(isNegativado(s) || comp >= params.comprometimentoRed ? 'worried' : wealth >= 2 ? 'happy' : 'calm');
  const ghostNow = $derived(game.ghostNetWorthNow());
  const chapter = $derived(chapterOf(s.ageMonths));
  const chapterFrom = $derived(Math.max(chapter.fromAge, s.startAge) * 12);
  const chapterPct = $derived(Math.round(((s.ageMonths - chapterFrom) / (chapter.toAge * 12 - chapterFrom)) * 100));
  const lm = $derived(s.lastMonth);
  // Keyed by the entry's absolute position in the log, which is stable while the log only grows.
  const recent = $derived(s.log.slice(-8).map((e, i, arr) => ({ e, key: s.log.length - arr.length + i })).reverse());

  const signed = (v: number): string => (v < 0 ? '−' : '+') + formatBRL(Math.abs(v));

  function logText(e: (typeof s.log)[number]): string {
    if (e.key.startsWith('ev:')) return events[e.key.slice(3)]?.title ? t(events[e.key.slice(3)]!.title, e.vars) : e.key;
    if (e.key.startsWith('ch:')) {
      const [, ev, ch] = e.key.split(':');
      const label = events[ev!]?.choices[ch!]?.label;
      return label ? `→ ${t(label, e.vars)}` : e.key;
    }
    const tpl = strings.log[e.key];
    return tpl ? t(tpl, e.vars) : e.key;
  }
</script>

<div class="container">
  <header class="row top">
    <Capivara size={64} {wealth} {mood} />
    <div class="who">
      <strong>{ui('age')}: {years} anos{months ? ` e ${months} ${months === 1 ? 'mês' : 'meses'}` : ''}</strong>
      <div class="small muted">
        {strings.app.jobs[s.career.job]} · {strings.app.living[s.living]}
        {#if s.career.study} · {ui('studying')}: {s.career.study.label} ({s.career.study.remaining} meses){/if}
        {#if isNegativado(s)} · <span class="bad">{ui('negativado')}</span>{/if}
      </div>
      <div class="chapter small">
        <span>{ui('chapter')} {chapter.n} de {CHAPTERS.length} · {strings.app.chapters[chapter.id]}</span>
        <progress max="100" value={chapterPct} aria-label="Progresso do capítulo">{chapterPct}%</progress>
      </div>
    </div>
  </header>

  <div class="grid">
    <Stat id="netWorth" label={ui('netWorth')} valueClass={nw < 0 ? 'bad' : ''}>{formatBRL(nw)}</Stat>
    {#if ghostNow !== null}
      <Stat id="ghostNow" label={ui('ghostNow')} ghost>
        {formatBRL(ghostNow)}
        <span class="small" class:good={nw >= ghostNow} class:bad={nw < ghostNow}>({signed(nw - ghostNow)})</span>
      </Stat>
    {/if}
    <Stat id="cash" label={ui('cash')} valueClass={s.cash < 0 ? 'bad' : ''}>{formatBRL(s.cash)}</Stat>
    <Stat id="saved" label={ui('saved')}>{formatBRL(investedTotal(s) + s.cofrinho + s.peDeMeiaLocked)}</Stat>
    <Stat id="debt" label={ui('debt')} valueClass={debtTotal(s) > 0 ? 'bad' : ''}>{formatBRL(debtTotal(s))}</Stat>
    <Stat id="income" label={ui('income')}>{formatBRL(income)}</Stat>
    <Stat id="committed" label={ui('committed')} valueClass={compClass}>{Math.round(comp * 100)}% <span class="small">({compLabel})</span></Stat>
    <Stat id="wellbeing" label={ui('wellbeing')}>
      <meter min="0" max="100" low="30" high="70" optimum="80" value={s.wellbeing}>{s.wellbeing}</meter> {s.wellbeing}
    </Stat>
    {#if s.card.has}
      <Stat id="cardInfo" label={ui('cardInfo')} valueClass="small">
        {ui('cardLimit')} {formatBRL(s.card.limit)}
        {#if s.card.revolving > 0}<br /><span class="bad">{ui('cardRevolving')} {formatBRL(s.card.revolving)}</span><br /><span class="muted">{ui('capRoom')}: {formatBRL(capRoom(s, params))}</span>{/if}
        {#if s.card.blocked}<br /><span class="bad">bloqueado</span>{/if}
      </Stat>
    {/if}
  </div>

  {#if lm}
    <p class="lastmonth small muted" aria-live="polite">
      <strong>{ui('lastMonth')}:</strong>
      <span class="good">+{formatBRL(lm.income)} {ui('lmIncome')}</span>
      · <span>−{formatBRL(lm.costs)} {ui('lmCosts')}</span>
      {#if lm.committed > 0}· <span>−{formatBRL(lm.committed)} {ui('lmCommitted')}</span>{/if}
      {#if lm.saved > 0}· <span>{formatBRL(lm.saved)} {ui('lmSaved')}</span>{/if}
      {#if lm.interestEarned > 0}· <span class="good">+{formatBRL(lm.interestEarned)} {ui('lmInterest')}</span>{/if}
      {#if lm.interestPaid > 0}· <span class="bad">−{formatBRL(lm.interestPaid)} {ui('lmInterestPaid')}</span>{/if}
      {#if lm.betsLost > 0}· <span class="bad">−{formatBRL(lm.betsLost)} {ui('lmBets')}</span>{/if}
    </p>
  {/if}

  {#if s.pending}
    <StopCard stop={s.pending} />
  {:else}
    {#if game.lastOutcome}
      <Outcome outcome={game.lastOutcome} />
    {/if}
    <div class="card row">
      <button class="primary" onclick={() => game.advance(false)} disabled={game.busy}>{ui('next')}</button>
      <button onclick={() => game.advance(true)} disabled={game.busy}>{ui('fast')}</button>
    </div>
  {/if}

  <Standing />

  <details class="card" open>
    <summary><strong>{ui('log')}</strong></summary>
    <ul class="log small">
      {#each recent as { e, key } (key)}
        <li class={e.kind}><span class="muted">{Math.floor(e.ageMonths / 12)}a{e.ageMonths % 12 ? `${e.ageMonths % 12}m` : ''}</span> {logText(e)}</li>
      {/each}
    </ul>
  </details>
</div>

<style>
  .top {
    margin-bottom: 12px;
  }
  .who {
    min-width: 0;
    flex: 1;
  }
  .chapter {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    color: var(--ink-2);
  }
  .chapter progress {
    flex: 1;
    max-width: 120px;
    height: 8px;
    accent-color: var(--brand);
  }
  .grid {
    margin-bottom: 12px;
  }
  .lastmonth {
    margin: -4px 0 12px;
    line-height: 1.6;
  }
  meter {
    width: 70px;
    vertical-align: middle;
  }
  .log {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
    display: grid;
    gap: 4px;
  }
  .log li.bad {
    color: var(--bad);
  }
  .log li.good {
    color: var(--good);
  }
  .log li.choice {
    color: var(--ink-2);
  }
</style>
