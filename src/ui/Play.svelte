<script lang="ts">
  import { game, params } from '$lib/game.svelte';
  import { ui, strings, events, t } from '$lib/content';
  import { formatBRL } from '$engine/money';
  import { netWorth, monthlyIncome, comprometimento, debtTotal } from '$engine/sim';
  import { investedTotal } from '$engine/investments';
  import { capRoom } from '$engine/card';
  import { isNegativado } from '$engine/state';
  import Capivara from './Capivara.svelte';
  import StopCard from './StopCard.svelte';
  import Standing from './Standing.svelte';

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
  const recent = $derived(s.log.slice(-8).reverse());

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
    </div>
  </header>

  <div class="grid">
    <div class="stat"><div class="label">{ui('netWorth')}</div><div class="value" class:bad={nw < 0}>{formatBRL(nw)}</div></div>
    <div class="stat"><div class="label">{ui('cash')}</div><div class="value" class:bad={s.cash < 0}>{formatBRL(s.cash)}</div></div>
    <div class="stat"><div class="label">{ui('saved')}</div><div class="value">{formatBRL(investedTotal(s) + s.cofrinho + s.peDeMeiaLocked)}</div></div>
    <div class="stat"><div class="label">{ui('debt')}</div><div class="value" class:bad={debtTotal(s) > 0}>{formatBRL(debtTotal(s))}</div></div>
    <div class="stat"><div class="label">{ui('income')}</div><div class="value">{formatBRL(income)}</div></div>
    <div class="stat">
      <div class="label">{ui('committed')}</div>
      <div class="value {compClass}">{Math.round(comp * 100)}% <span class="small">({compLabel})</span></div>
    </div>
    <div class="stat">
      <div class="label">{ui('wellbeing')}</div>
      <div class="value"><meter min="0" max="100" low="30" high="70" optimum="80" value={s.wellbeing}>{s.wellbeing}</meter> {s.wellbeing}</div>
    </div>
    {#if s.card.has}
      <div class="stat">
        <div class="label">{ui('cardInfo')}</div>
        <div class="value small">
          {ui('cardLimit')} {formatBRL(s.card.limit)}
          {#if s.card.revolving > 0}<br /><span class="bad">{ui('cardRevolving')} {formatBRL(s.card.revolving)}</span><br /><span class="muted">{ui('capRoom')}: {formatBRL(capRoom(s, params))}</span>{/if}
          {#if s.card.blocked}<br /><span class="bad">bloqueado</span>{/if}
        </div>
      </div>
    {/if}
  </div>

  {#if s.pending}
    <StopCard stop={s.pending} />
  {:else}
    <div class="card row">
      <button class="primary" onclick={() => game.advance(false)} disabled={game.busy}>{ui('next')}</button>
      <button onclick={() => game.advance(true)} disabled={game.busy}>{ui('fast')}</button>
    </div>
  {/if}

  <Standing />

  <details class="card" open>
    <summary><strong>{ui('log')}</strong></summary>
    <ul class="log small">
      {#each recent as e, i (s.log.length - i)}
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
  }
  .grid {
    margin-bottom: 12px;
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
