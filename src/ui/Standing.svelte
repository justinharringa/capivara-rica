<script lang="ts">
  import { game } from '$lib/game.svelte';
  import { ui } from '$lib/content';
  import { isAdult } from '$engine/state';
  import type { SaveTarget, CardPolicy } from '$engine/state';
  import { formatBRL } from '$engine/money';

  const s = $derived(game.state!);
  const targets: SaveTarget[] = ['cofrinho', 'poupanca', 'tesouroSelic', 'cdb'];
  const policies: CardPolicy[] = ['integral', 'minimo', 'parcelar'];
</script>

<details class="card">
  <summary><strong>{ui('standing')}</strong></summary>
  <div class="form">
    <label>
      {ui('savePct')}: <strong>{Math.round(s.standing.savePct * 100)}%</strong>
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
      {ui('saveInto')}
      <select value={s.standing.saveInto} onchange={(e) => game.updateStanding({ saveInto: (e.target as HTMLSelectElement).value as SaveTarget })}>
        {#each targets as tg (tg)}
          <option value={tg} disabled={tg !== 'cofrinho' && !s.hasBankAccount}>{ui(tg)}</option>
        {/each}
      </select>
      {#if !s.hasBankAccount}<span class="small muted">{ui('noAccount')}</span>{/if}
    </label>
    {#if s.card.has}
      <label>
        {ui('cardPolicy')}
        <select value={s.card.policy} onchange={(e) => game.updateCardPolicy((e.target as HTMLSelectElement).value as CardPolicy)}>
          {#each policies as pol (pol)}
            <option value={pol}>{ui(pol)}</option>
          {/each}
        </select>
      </label>
    {/if}
    {#if !isAdult(s)}
      <label>
        {ui('lanche')}
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
