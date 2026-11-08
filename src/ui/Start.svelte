<script lang="ts">
  import { game } from '$lib/game.svelte';
  import { ui } from '$lib/content';
  import { START_AGES, type StartAge } from '$engine/state';
  import Capivara from './Capivara.svelte';

  let publicSchool = $state(true);
  const ages: Array<{ age: StartAge; label: string; desc: string }> = START_AGES.map((age) => ({
    age,
    label: ui(`age${age}`),
    desc: ui(`age${age}Desc`),
  }));
</script>

<div class="container">
  <header class="hero">
    <Capivara size={120} mood="calm" />
    <div>
      <h1>{ui('title')}</h1>
      <p class="muted">{ui('tagline')}</p>
    </div>
  </header>

  {#if game.newerSave}
    <div class="card"><p class="small">{ui('newerSave')}</p><button class="primary" onclick={() => location.reload()}>Recarregar</button></div>
  {/if}
  {#if game.hasSave}
    <div class="card">
      <button class="primary" onclick={() => game.resume()}>{ui('continue')}</button>
    </div>
  {/if}

  <div class="card">
    <h2>{ui('chooseAge')}</h2>
    <div class="ages">
      {#each ages as a (a.age)}
        <button class="age" onclick={() => game.start(a.age, publicSchool)}>
          <strong>{a.label}</strong>
          <span class="small muted">{a.desc}</span>
        </button>
      {/each}
    </div>
    <label class="row small" style="margin-top:12px">
      <input type="checkbox" bind:checked={publicSchool} />
      {ui('publicSchool')}
    </label>
  </div>

  <p class="small muted">
    Nenhum dado seu sai do seu aparelho. Sem conta, sem anúncios, sem rastreio. Código aberto (MIT) e conteúdo CC BY 4.0.
  </p>
</div>

<style>
  .hero {
    display: flex;
    gap: 16px;
    align-items: center;
    margin: 8px 0 16px;
  }
  .ages {
    display: grid;
    gap: 8px;
  }
  .age {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 4px;
    padding: 12px 14px;
  }
</style>
