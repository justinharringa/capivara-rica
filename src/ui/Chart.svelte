<script lang="ts">
  import { formatBRL } from '$engine/money';
  import type { HistoryPoint } from '$engine/state';

  /** Two net-worth series on one axis: the player and the ghost, in reais of today. */
  let {
    you,
    ghost,
    deflateYou = 1,
    deflateGhost = 1,
  }: { you: HistoryPoint[]; ghost: HistoryPoint[]; deflateYou?: number; deflateGhost?: number } = $props();

  const W = 640;
  const H = 300;
  const M = { top: 16, right: 72, bottom: 32, left: 56 };

  type Pt = { age: number; v: number };
  const sy = $derived<Pt[]>(you.map((h) => ({ age: h.ageMonths / 12, v: h.netWorth / deflateYou })));
  const sg = $derived<Pt[]>(ghost.map((h) => ({ age: h.ageMonths / 12, v: h.netWorth / deflateGhost })));

  const xMin = $derived(Math.min(sy[0]?.age ?? 10, sg[0]?.age ?? 10));
  const xMax = $derived(Math.max(sy.at(-1)?.age ?? 30, sg.at(-1)?.age ?? 30));
  const yMin = $derived(Math.min(0, ...sy.map((d) => d.v), ...sg.map((d) => d.v)));
  const yMax = $derived(Math.max(1, ...sy.map((d) => d.v), ...sg.map((d) => d.v)) * 1.05);

  const x = (age: number) => M.left + ((age - xMin) / (xMax - xMin || 1)) * (W - M.left - M.right);
  const y = (v: number) => M.top + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - M.top - M.bottom);
  const path = (pts: Pt[]) => pts.map((d, i) => `${i ? 'L' : 'M'}${x(d.age).toFixed(1)},${y(d.v).toFixed(1)}`).join(' ');

  const yTicks = $derived.by(() => {
    const n = 4;
    const step = (yMax - yMin) / n;
    return Array.from({ length: n + 1 }, (_, i) => yMin + i * step);
  });
  const xTicks = $derived.by(() => {
    const out: number[] = [];
    for (let a = Math.ceil(xMin); a <= xMax; a += xMax - xMin > 12 ? 4 : 2) out.push(a);
    return out;
  });

  let hover = $state<number | null>(null);
  function onMove(e: PointerEvent) {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const age = xMin + ((px - M.left) / (W - M.left - M.right)) * (xMax - xMin);
    hover = Math.max(xMin, Math.min(xMax, age));
  }
  const near = (pts: Pt[], age: number | null): Pt | null => {
    if (age === null || pts.length === 0) return null;
    let best = pts[0]!;
    for (const d of pts) if (Math.abs(d.age - age) < Math.abs(best.age - age)) best = d;
    return best;
  };
  const hy = $derived(near(sy, hover));
  const hg = $derived(near(sg, hover));
  const short = (v: number) => (Math.abs(v) >= 100000 ? `${(v / 100000).toFixed(0)} mil` : formatBRL(v));
</script>

<figure class="chart">
  <div class="legend small" aria-hidden="true">
    <span><i class="sw you"></i> Você</span>
    <span><i class="sw ghost"></i> Capivara</span>
  </div>
  <svg viewBox="0 0 {W} {H}" role="img" aria-label="Patrimônio por idade: você e a Capivara" onpointermove={onMove} onpointerleave={() => (hover = null)}>
    {#each yTicks as tv (tv)}
      <line x1={M.left} x2={W - M.right} y1={y(tv)} y2={y(tv)} class="grid" />
      <text x={M.left - 6} y={y(tv) + 4} class="tick" text-anchor="end">{short(tv)}</text>
    {/each}
    {#each xTicks as a (a)}
      <text x={x(a)} y={H - 10} class="tick" text-anchor="middle">{a}</text>
    {/each}
    <line x1={M.left} x2={W - M.right} y1={y(0)} y2={y(0)} class="axis" />
    <path d={path(sg)} class="line ghost" />
    <path d={path(sy)} class="line you" />
    {#if sy.length}
      <text x={x(sy.at(-1)!.age) + 6} y={y(sy.at(-1)!.v) + 4} class="label">Você</text>
    {/if}
    {#if sg.length}
      <text x={x(sg.at(-1)!.age) + 6} y={y(sg.at(-1)!.v) + 4} class="label">Capivara</text>
    {/if}
    {#if hover !== null && hy && hg}
      <line x1={x(hy.age)} x2={x(hy.age)} y1={M.top} y2={H - M.bottom} class="cross" />
      <circle cx={x(hy.age)} cy={y(hy.v)} r="5" class="dot you" />
      <circle cx={x(hg.age)} cy={y(hg.v)} r="5" class="dot ghost" />
      <g transform="translate({Math.min(x(hy.age) + 8, W - 200)}, {M.top})">
        <rect width="190" height="54" rx="6" class="tip" />
        <text x="8" y="16" class="tipText">{Math.floor(hy.age)} anos</text>
        <text x="8" y="32" class="tipText">Você: {formatBRL(hy.v)}</text>
        <text x="8" y="48" class="tipText">Capivara: {formatBRL(hg.v)}</text>
      </g>
    {/if}
  </svg>
  <details class="small">
    <summary>Ver como tabela</summary>
    <table>
      <thead><tr><th>Idade</th><th>Você</th><th>Capivara</th></tr></thead>
      <tbody>
        {#each xTicks as a (a)}
          <tr>
            <td>{a}</td>
            <td>{formatBRL(near(sy, a)?.v ?? 0)}</td>
            <td>{formatBRL(near(sg, a)?.v ?? 0)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </details>
</figure>

<style>
  .chart {
    margin: 0;
  }
  svg {
    width: 100%;
    height: auto;
    /* Horizontal drags drive the crosshair; vertical ones must still scroll the page. */
    touch-action: pan-y;
  }
  .legend {
    display: flex;
    gap: 16px;
    margin-bottom: 4px;
  }
  .sw {
    display: inline-block;
    width: 14px;
    height: 3px;
    vertical-align: middle;
    margin-right: 4px;
    border-radius: 2px;
  }
  .sw.you,
  .line.you,
  .dot.you {
    background: var(--series-you);
    stroke: var(--series-you);
  }
  .sw.ghost,
  .line.ghost,
  .dot.ghost {
    background: var(--series-ghost);
    stroke: var(--series-ghost);
  }
  .line {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
  }
  .dot {
    fill: var(--surface);
    stroke-width: 2;
  }
  .grid {
    stroke: var(--line);
    stroke-width: 1;
  }
  .axis {
    stroke: var(--ink-3);
    stroke-width: 1;
  }
  .cross {
    stroke: var(--ink-3);
    stroke-dasharray: 3 3;
  }
  .tick,
  .label,
  .tipText {
    font-size: 12px;
    fill: var(--ink-2);
  }
  .label {
    fill: var(--ink);
    font-weight: 600;
  }
  .tip {
    fill: var(--surface);
    stroke: var(--line);
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  td,
  th {
    text-align: right;
    padding: 4px 6px;
    border-bottom: 1px solid var(--line);
  }
</style>
