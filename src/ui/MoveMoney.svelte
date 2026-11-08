<script lang="ts">
  import { game, params } from '$lib/game.svelte';
  import { ui, t } from '$lib/content';
  import { formatBRL } from '$engine/money';
  import { bucketBalance, previewWithdrawal } from '$engine/sim';
  import type { SaveTarget } from '$engine/state';

  /** Conta ⇄ Guardado by hand. Deposits go to the standing-order target; withdrawals show the IR first. */
  let { onclose }: { onclose: () => void } = $props();
  const s = $derived(game.state!);
  const buckets: SaveTarget[] = ['cofrinho', 'poupanca', 'tesouroSelic', 'cdb'];

  let mode = $state<'deposit' | 'withdraw'>('deposit');
  let amountText = $state('');
  let from = $state<SaveTarget>('cdb');

  const funded = $derived(buckets.filter((b) => bucketBalance(s, b) > 0));
  // Keep `from` on a bucket that has money, when one exists.
  $effect(() => {
    if (funded.length && !funded.includes(from)) from = funded[0]!;
  });

  const amount = $derived(Math.round(Number(amountText.replace(/\./g, '').replace(',', '.')) * 100) || 0);
  const cashAvailable = $derived(Math.max(0, s.cash));
  const fromAvailable = $derived(bucketBalance(s, from));
  const max = $derived(mode === 'deposit' ? cashAvailable : fromAvailable);
  const clamped = $derived(Math.min(amount, max));
  const preview = $derived(mode === 'withdraw' && clamped > 0 ? previewWithdrawal(s, params, from, clamped) : null);

  function setAll() {
    amountText = (max / 100).toFixed(2).replace('.', ',');
  }
  function go() {
    if (clamped <= 0) return;
    if (mode === 'deposit') game.deposit(clamped);
    else game.withdraw(from, clamped);
    amountText = '';
    onclose();
  }
</script>

<section id="move-money" class="card move" aria-label={ui('moveTitle')}>
  <div class="row between">
    <h3>{ui('moveTitle')}</h3>
    <button type="button" class="small" onclick={onclose}>{ui('close')}</button>
  </div>
  <div class="row tabs" role="radiogroup" aria-label={ui('moveTitle')}>
    <button type="button" role="radio" aria-checked={mode === 'deposit'} class:primary={mode === 'deposit'} onclick={() => (mode = 'deposit')}>{ui('moveDeposit')}</button>
    <button type="button" role="radio" aria-checked={mode === 'withdraw'} class:primary={mode === 'withdraw'} onclick={() => (mode = 'withdraw')}>{ui('moveWithdraw')}</button>
  </div>

  {#if mode === 'deposit'}
    <p class="small muted">{ui('moveTo')}: <strong>{ui(s.standing.saveInto)}</strong> · {t(ui('moveAvailable'), { valor: cashAvailable })}</p>
    {#if s.cash < 0}<p class="small bad">{ui('moveOverdraft')}</p>{/if}
  {:else if funded.length === 0}
    <p class="small muted">{ui('moveNothing')}</p>
  {:else}
    <label>
      {ui('moveFrom')}
      <select bind:value={from}>
        {#each funded as b (b)}
          <option value={b}>{ui(b)} ({formatBRL(bucketBalance(s, b))})</option>
        {/each}
      </select>
    </label>
  {/if}

  {#if mode === 'deposit' || funded.length > 0}
    <label>
      {ui('moveAmount')}
      <div class="row">
        <input type="text" inputmode="decimal" bind:value={amountText} placeholder="0,00" aria-label={ui('moveAmount')} />
        <button type="button" onclick={setAll}>{ui('moveAll')}</button>
      </div>
    </label>
    {#if preview}
      <p class="small preview">
        {#if preview.tax > 0}
          {t(ui('movePreview'), { bruto: preview.gross, liquido: preview.net, imposto: preview.tax, aliquota: Math.round(preview.rate * 1000) / 10, ganho: preview.gain })}
        {:else}
          {t(ui('movePreviewNoTax'), { bruto: preview.gross })}
        {/if}
      </p>
    {/if}
    {#if mode === 'withdraw' && s.peDeMeiaLocked > 0}
      <p class="small muted">{t(ui('moveLocked'), { valor: s.peDeMeiaLocked })}</p>
    {/if}
    <button type="button" class="primary" disabled={clamped <= 0} onclick={go}>
      {t(ui(mode === 'deposit' ? 'moveDepositDo' : 'moveWithdrawDo'), { valor: clamped })}
    </button>
  {/if}
</section>

<style>
  .move {
    border-color: var(--brand);
    display: grid;
    gap: 10px;
  }
  .between {
    justify-content: space-between;
  }
  h3 {
    margin: 0;
  }
  .tabs button {
    flex: 1;
  }
  label {
    display: grid;
    gap: 4px;
  }
  input[type='text'] {
    flex: 1;
    min-width: 0;
  }
  .preview {
    background: var(--surface-2);
    padding: 8px 10px;
    border-radius: 10px;
    margin: 0;
  }
</style>
