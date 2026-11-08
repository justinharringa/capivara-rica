import { formatBRL } from '$engine/money';

/**
 * The shareable result card: a 1080x1080 PNG drawn on a canvas, with the player's and the
 * Capivara's scores and the mascot. Nothing leaves the device unless the player shares it.
 */
export interface ShareCardInput {
  startAge: number;
  score: number;
  ghost: number;
  /** Sprite file name under /capi/, without extension. */
  sprite: string;
  url: string;
}

const W = 1080;
const H = 1080;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startPx: number, family: string, weight = '700'): number {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && px > 24) {
    px -= 4;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

export async function renderShareCard(input: ShareCardInput, base = '/'): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const family = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

  // Background and a card.
  ctx.fillStyle = '#2f6f4e';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fffdf8';
  roundRect(ctx, 60, 60, W - 120, H - 120, 40);
  ctx.fill();

  // Title.
  ctx.fillStyle = '#1f1b16';
  ctx.textAlign = 'center';
  ctx.font = `800 64px ${family}`;
  ctx.fillText('Capivara Rica', W / 2, 160);
  ctx.fillStyle = '#5a5247';
  ctx.font = `500 34px ${family}`;
  ctx.fillText(`Comecei aos ${input.startAge} anos. Aos 30, em reais de hoje:`, W / 2, 220);

  // Mascot.
  const img = await loadImage(`${base}capi/${input.sprite}.webp`);
  if (img) ctx.drawImage(img, W / 2 - 150, 250, 300, 276);

  // Scores.
  const you = formatBRL(input.score);
  const ghost = formatBRL(input.ghost);
  ctx.fillStyle = '#1f1b16';
  fit(ctx, you, W - 240, 96, family, '800');
  ctx.fillText(you, W / 2, 640);
  ctx.fillStyle = '#5a5247';
  ctx.font = `500 32px ${family}`;
  ctx.fillText('Você', W / 2, 690);

  ctx.fillStyle = '#1d4ed8';
  fit(ctx, ghost, W - 240, 72, family, '800');
  ctx.fillText(ghost, W / 2, 800);
  ctx.fillStyle = '#5a5247';
  ctx.font = `500 32px ${family}`;
  ctx.fillText('A Capivara, com a mesma sorte', W / 2, 850);

  const verdict = input.score >= input.ghost ? 'Ganhei da Capivara.' : 'A Capivara ganhou. Por enquanto.';
  ctx.fillStyle = '#c2410c';
  ctx.font = `700 36px ${family}`;
  ctx.fillText(verdict, W / 2, 930);

  ctx.fillStyle = '#8a8072';
  ctx.font = `500 28px ${family}`;
  ctx.fillText(input.url.replace(/^https?:\/\//, ''), W / 2, 990);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Share the PNG through the Web Share API when the browser can, else download it. Returns how. */
export async function shareOrDownload(blob: Blob, text: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], 'capivara-rica.png', { type: 'image/png' });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return 'shared';
    }
  } catch {
    return 'cancelled';
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'capivara-rica.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
