#!/usr/bin/env python3
"""Cut a Capivara character sheet into game sprites and, optionally, app icons.

Usage:
  python3 -I scripts/cut-sprites.py SHEET OUTDIR [--grid 4x2] [--names a,b,c,...]
                                    [--flip name,...] [--canvas WxH] [--icons]

The sheet is a grid of the same character on a flat background (#f9eddd as Gemini
rendered it). Cells are named left to right, top to bottom; "-" skips a cell.
--canvas fixes the source-pixel canvas every sprite is placed on, so sprites cut from
different sheets come out at the same scale. Both sheets so far use 622x573.
--icons also writes icon-512.png, icon-192.png and favicon.png from the cell named "icon".

Needs Pillow and numpy.

Sheets used so far:
  assets/raw/capi-sheet-gemini-2026-11-07.jpg        --names wealth0,wealth1,wealth2,wealth3,-,worried,happy,icon --icons
  assets/raw/capi-sheet-moods-gemini-2026-11-07.jpg  --names -,worried1,worried2,worried3,happy1,-,happy2,happy3 --flip happy3 --canvas 622x573
  assets/raw/capi-sheet-child-gemini-2026-11-08.jpg        public/capi/child --names wealth0,wealth1,wealth2,wealth3,worried,happy,happy1,happy3 --flip happy3 --canvas 622x573 --width 200
  assets/raw/capi-sheet-child-moods-gemini-2026-11-08.jpg  public/capi/child --names=-,-,-,happy2,worried1,worried2,worried3,- --canvas 622x573 --width 200
    (the child is drawn smaller on the same canvas on purpose; a name list that starts with "-"
    needs the --names= form or argparse reads it as an option)
  assets/raw/capi-sheet-teen-gemini-2026-11-08.jpg         public/capi/teen --names wealth0,wealth1,wealth2,wealth3,worried,happy,happy1,happy3 --flip happy3 --canvas 520x479 --width 200
    (Gemini drew the teen at the child's size, so a smaller canvas of the same 622:573 ratio puts
    it between child and adult; the teen has no worried1-3 or happy2, Capivara.svelte falls back
    to the calm sprite plus the sweat drop, and to happy1)
"""
import argparse
import os

import numpy as np
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('outdir')
ap.add_argument('--grid', default='4x2')
ap.add_argument('--names', required=True)
ap.add_argument('--flip', default='')
ap.add_argument('--canvas', default='')
ap.add_argument('--icons', action='store_true')
ap.add_argument('--width', type=int, default=400)
args = ap.parse_args()

os.makedirs(args.outdir, exist_ok=True)
cols, rows = (int(x) for x in args.grid.lower().split('x'))
names = args.names.split(',')
assert len(names) == cols * rows, f'expected {cols * rows} names, got {len(names)}'
flip = set(filter(None, args.flip.split(',')))

im = Image.open(args.src).convert('RGB')
W, H = im.size
a = np.asarray(im).astype(np.int32)
bg = np.array([249, 237, 221], dtype=np.int32)
dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
# Soft key: transparent within 14 of the background colour, opaque beyond 44.
alpha = np.clip((dist - 14) / 30.0, 0, 1)
full = Image.fromarray(np.dstack([a.astype(np.uint8), (alpha * 255).astype(np.uint8)]), 'RGBA')

cw, ch = W // cols, H // rows
cells, boxes = {}, {}
for i, name in enumerate(names):
    if name == '-':
        continue
    r, c = divmod(i, cols)
    cell = full.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
    if name in flip:
        cell = cell.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    # Neighbouring cells can poke a nose or crown across the grid line. Keep only the
    # contiguous run of columns and rows that contains the cell centre; blank the rest.
    arr = np.array(cell)
    al = arr[:, :, 3]
    for axis, centre in ((0, cw // 2), (1, ch // 2)):
        present = (al > 20).any(axis=axis)
        lo = centre
        while lo > 0 and present[lo - 1]:
            lo -= 1
        hi = centre
        while hi < len(present) - 1 and present[hi + 1]:
            hi += 1
        keep = np.zeros_like(present)
        keep[lo : hi + 1] = True
        if axis == 0:
            arr[:, ~keep, 3] = 0
        else:
            arr[~keep, :, 3] = 0
        al = arr[:, :, 3]
    cell = Image.fromarray(arr, 'RGBA')
    ys, xs = np.where(al > 20)
    boxes[name] = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    cells[name] = cell

bw = max(b[2] - b[0] for b in boxes.values())
bh = max(b[3] - b[1] for b in boxes.values())
m = int(0.03 * max(bw, bh))
if args.canvas:
    CW, CH = (int(x) for x in args.canvas.lower().split('x'))
    assert bw <= CW and bh <= CH, f'content {bw}x{bh} does not fit canvas {CW}x{CH}'
    # Keep the sheet-to-sheet scale exact; shrink the margin instead of the canvas.
    m = min(m, (CW - bw) // 2, (CH - bh) // 2)
else:
    CW, CH = bw + 2 * m, bh + 2 * m

for name, cell in cells.items():
    x0, y0, x1, y1 = boxes[name]
    content = cell.crop((x0, y0, x1, y1))
    canvas = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    canvas.paste(content, ((CW - content.width) // 2, CH - m - content.height), content)
    scale = args.width / CW
    out = canvas.resize((args.width, round(CH * scale)), Image.LANCZOS)
    if name != 'icon':
        p = os.path.join(args.outdir, f'{name}.webp')
        out.save(p, 'WEBP', quality=82, alpha_quality=95, method=6)
        print(f'{name:10s} {out.size[0]}x{out.size[1]}  {os.path.getsize(p) / 1024:.1f} KB')
    if name == 'icon' and args.icons:
        for size in (512, 192):
            ic = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            ImageDraw.Draw(ic).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=(47, 111, 78, 255))
            s2 = int(size * 0.80) / max(canvas.width, canvas.height)
            sub = canvas.resize((round(canvas.width * s2), round(canvas.height * s2)), Image.LANCZOS)
            ic.paste(sub, ((size - sub.width) // 2, (size - sub.height) // 2 + int(size * 0.02)), sub)
            ic.quantize(colors=128, method=Image.Quantize.FASTOCTREE).save(os.path.join(args.outdir, f'icon-{size}.png'), 'PNG', optimize=True)
            if size == 192:
                ic.resize((64, 64), Image.LANCZOS).quantize(colors=64, method=Image.Quantize.FASTOCTREE).save(os.path.join(args.outdir, 'favicon.png'), 'PNG', optimize=True)
print('canvas', CW, 'x', CH, 'content boxes', {k: (v[2] - v[0], v[3] - v[1]) for k, v in boxes.items()})
