<script lang="ts">
  import { game } from '$lib/game.svelte';
  import { ui, t } from '$lib/content';
  import { formatBRL } from '$engine/money';
  import { score } from '$engine/sim';
  import Capivara from './Capivara.svelte';
  import Chart from './Chart.svelte';

  const s = $derived(game.state!);
  const g = $derived(game.ghost);
  const yours = $derived(score(s));
  const theirs = $derived(g ? score(g) : 0);
  const wealth = $derived(yours >= 20000000 ? 3 : yours >= 5000000 ? 2 : yours >= 1000000 ? 1 : 0);
  let copied = $state(false);

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

  {#if g}
    <section class="card">
      <h2>{ui('ghostTitle')}</h2>
      <p class="muted small">{ui('ghostDesc')}</p>
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

  <div class="card row">
    <button class="primary" onclick={() => game.reset()}>{ui('playAgain')}</button>
    <button onclick={share}>{copied ? ui('shared') : ui('share')}</button>
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
</style>
