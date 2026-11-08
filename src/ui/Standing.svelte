<script lang="ts">
  import { game, params } from '$lib/game.svelte';
  import { ui } from '$lib/content';
  import { isAdult, LIFESTYLES } from '$engine/state';
  import type { SaveTarget, CardPolicy, Lifestyle } from '$engine/state';
  import { formatBRL } from '$engine/money';
  import { leisureCost } from '$engine/sim';
  import { t, strings } from '$lib/content';
  import Help from './Help.svelte';

  const s = $derived(game.state!);
  const leisure = $derived(leisureCost(s, params));
  const targets: SaveTarget[] = ['cofrinho', 'poupanca', 'tesouroSelic', 'cdb'];
  const policies: CardPolicy[] = ['integral', 'minimo', 'parcelar'];
</script>

<details class="card">
  <summary><strong>{ui('standing')}</strong></summary>
  <div class="form">
    <label>
      <span>{ui('savePct')}: <strong>{Math.round(s.standing.savePct * 100)}%</strong><Help id="savePct" label={ui('savePct')} /></span>
      <input
        type="range"
        min="0"
        max="60"
        step="5"
        value={Math.round(s.standing.savePct * 100)}
        oninput={(e) => game.updateStanding({ savePct: Number((e.target as HTMLInputElement).value) / 100 })}
      />
    </label>
    <label>
      <span>{ui('saveInto')}<Help id="saveInto" label={ui('saveInto')} /></span>
      <select value={s.standing.saveInto} onchange={(e) => game.updateStanding({ saveInto: (e.target as HTMLSelectElement).value as SaveTarget })}>
        {#each targets as tg (tg)}
          <option value={tg} disabled={tg !== 'cofrinho' && !s.hasBankAccount}>{ui(tg)}</option>
        {/each}
      </select>
      {#if !s.hasBankAccount}<span class="small muted">{ui('noAccount')}</span>{/if}
    </label>
    <label>
      <span>{ui('lifestyle')}<Help id="lifestyle" label={ui('lifestyle')} /></span>
      <select value={s.standing.lifestyle} onchange={(e) => game.updateStanding({ lifestyle: (e.target as HTMLSelectElement).value as Lifestyle })}>
        {#each LIFESTYLES as l (l)}
          <option value={l}>{strings.app.lifestyles[l]} ({formatBRL(leisureCost(s, params, l))}/mês)</option>
        {/each}
      </select>
      <span class="small muted">{leisure > 0 ? t(ui('lifestyleHint'), { valor: leisure }) : ui('lifestyleNone')}</span>
    </label>
    {#if s.card.has}
      <label>
        <span>{ui('cardPolicy')}<Help id="cardPolicy" label={ui('cardPolicy')} /></span>
        <select value={s.card.policy} onchange={(e) => game.updateCardPolicy((e.target as HTMLSelectElement).value as CardPolicy)}>
          {#each policies as pol (pol)}
            <option value={pol}>{ui(pol)}</option>
          {/each}
        </select>
      </label>
    {/if}
    {#if !isAdult(s)}
      <label>
        <span>{ui('lanche')}<Help id="lanche" label={ui('lanche')} /></span>
        <select value={s.standing.lanche} onchange={(e) => game.updateStanding({ lanche: (e.target as HTMLSelectElement).value as 'compra' | 'casa' })}>
          <option value="compra">{ui('lancheCompra')}</option>
          <option value="casa">{ui('lancheCasa')}</option>
        </select>
      </label>
    {/if}
    {#if s.standing.bets > 0}
      <div class="row">
        <span class="bad">{ui('bets')}: {formatBRL(s.standing.bets)}/mês</span>
        <button onclick={() => game.updateStanding({ bets: 0 })}>{ui('stopBets')}</button>
      </div>
    {/if}
  </div>
</details>

<style>
  summary {
    cursor: pointer;
    min-height: 32px;
  }
  .form {
    display: grid;
    gap: 12px;
    margin-top: 12px;
  }
  label {
    display: grid;
    gap: 4px;
  }
</style>
