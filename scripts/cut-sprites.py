#!/usr/bin/env python3
"""Cut the Capivara character sheet into game sprites and app icons.

Usage: python3 -I scripts/cut-sprites.py assets/raw/capi-sheet-gemini-2026-11-07.jpg public/capi
Then move public/capi/icon-*.png and favicon.png up to public/.

Needs Pillow and numpy. The sheet is a 4x2 grid on a flat #f9eddd background:
row 1 = wealth 0..3 (plain, sunglasses, chain, crown); row 2 = calm, worried, happy, icon.
"""
import sys, os
from PIL import Image, ImageDraw
import numpy as np

src, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)
im = Image.open(src).convert('RGB')
W, H = im.size
a = np.asarray(im).astype(np.int32)
bg = np.array([249, 237, 221], dtype=np.int32)
dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
# soft key: 0 alpha within 14 of the bg colour, full alpha beyond 44
alpha = np.clip((dist - 14) / 30.0, 0, 1)
# un-premultiply fringe: push edge pixels toward the fur colour instead of cream
rgba = np.dstack([a.astype(np.uint8), (alpha * 255).astype(np.uint8)])
full = Image.fromarray(rgba, 'RGBA')

cols, rows = 4, 2
cw, ch = W // cols, H // rows
names = [['wealth0', 'wealth1', 'wealth2', 'wealth3'], ['calm', 'worried', 'happy', 'icon']]
cells = {}
boxes = {}
for r in range(rows):
    for c in range(cols):
        cell = full.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
        al = np.asarray(cell)[:, :, 3]
        ys, xs = np.where(al > 20)
        boxes[names[r][c]] = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
        cells[names[r][c]] = cell

# Common canvas: the largest content box plus a margin, bottom-aligned so feet line up.
bw = max(b[2] - b[0] for b in boxes.values())
bh = max(b[3] - b[1] for b in boxes.values())
m = int(0.03 * max(bw, bh))
CW, CH = bw + 2 * m, bh + 2 * m
TARGET_W = 400
report = []
for name, cell in cells.items():
    x0, y0, x1, y1 = boxes[name]
    content = cell.crop((x0, y0, x1, y1))
    canvas = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    canvas.paste(content, ((CW - content.width) // 2, CH - m - content.height), content)
    scale = TARGET_W / CW
    out = canvas.resize((TARGET_W, round(CH * scale)), Image.LANCZOS)
    p = os.path.join(outdir, f'{name}.webp')
    if name not in ('calm', 'icon'):
        out.save(p, 'WEBP', quality=82, alpha_quality=95, method=6)
        report.append((name, out.size, os.path.getsize(p)))
    if name == 'icon':
        for size in (512, 192):
            ic = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            d = ImageDraw.Draw(ic)
            d.rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=(47, 111, 78, 255))
            inner = int(size * 0.80)
            s2 = inner / max(canvas.width, canvas.height)
            sub = canvas.resize((round(canvas.width * s2), round(canvas.height * s2)), Image.LANCZOS)
            ic.paste(sub, ((size - sub.width) // 2, (size - sub.height) // 2 + int(size * 0.02)), sub)
            ip = os.path.join(outdir, f'icon-{size}.png')
            ic.quantize(colors=128, method=Image.Quantize.FASTOCTREE).save(ip, 'PNG', optimize=True)
            report.append((f'icon-{size}', ic.size, os.path.getsize(ip)))
            if size == 192:
                ic.resize((64, 64), Image.LANCZOS).quantize(colors=64, method=Image.Quantize.FASTOCTREE).save(os.path.join(outdir, 'favicon.png'), 'PNG', optimize=True)
for n, s, b in report:
    print(f'{n:10s} {s[0]}x{s[1]}  {b/1024:.1f} KB')
print('canvas', CW, CH, 'boxes', {k: (v[2]-v[0], v[3]-v[1]) for k, v in boxes.items()})

src, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)
im = Image.open(src).convert('RGB')
W, H = im.size
a = np.asarray(im).astype(np.int32)
bg = np.array([249, 237, 221], dtype=np.int32)
dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
# soft key: 0 alpha within 14 of the bg colour, full alpha beyond 44
alpha = np.clip((dist - 14) / 30.0, 0, 1)
# un-premultiply fringe: push edge pixels toward the fur colour instead of cream
rgba = np.dstack([a.astype(np.uint8), (alpha * 255).astype(np.uint8)])
full = Image.fromarray(rgba, 'RGBA')

cols, rows = 4, 2
cw, ch = W // cols, H // rows
names = [['wealth0', 'wealth1', 'wealth2', 'wealth3'], ['calm', 'worried', 'happy', 'icon']]
cells = {}
boxes = {}
for r in range(rows):
    for c in range(cols):
        cell = full.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
        al = np.asarray(cell)[:, :, 3]
        ys, xs = np.where(al > 20)
        boxes[names[r][c]] = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
        cells[names[r][c]] = cell

# Common canvas: the largest content box plus a margin, bottom-aligned so feet line up.
bw = max(b[2] - b[0] for b in boxes.values())
bh = max(b[3] - b[1] for b in boxes.values())
m = int(0.03 * max(bw, bh))
CW, CH = bw + 2 * m, bh + 2 * m
TARGET_W = 400
report = []
for name, cell in cells.items():
    x0, y0, x1, y1 = boxes[name]
    content = cell.crop((x0, y0, x1, y1))
    canvas = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    canvas.paste(content, ((CW - content.width) // 2, CH - m - content.height), content)
    scale = TARGET_W / CW
    out = canvas.resize((TARGET_W, round(CH * scale)), Image.LANCZOS)
    p = os.path.join(outdir, f'{name}.webp')
    if name not in ('calm', 'icon'):
        out.save(p, 'WEBP', quality=82, alpha_quality=95, method=6)
        report.append((name, out.size, os.path.getsize(p)))
    if name == 'icon':
        for size in (512, 192):
            ic = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            d = ImageDraw.Draw(ic)
            d.rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=(47, 111, 78, 255))
            inner = int(size * 0.80)
            s2 = inner / max(canvas.width, canvas.height)
            sub = canvas.resize((round(canvas.width * s2), round(canvas.height * s2)), Image.LANCZOS)
            ic.paste(sub, ((size - sub.width) // 2, (size - sub.height) // 2 + int(size * 0.02)), sub)
            ip = os.path.join(outdir, f'icon-{size}.png')
            ic.quantize(colors=128, method=Image.Quantize.FASTOCTREE).save(ip, 'PNG', optimize=True)
            report.append((f'icon-{size}', ic.size, os.path.getsize(ip)))
            if size == 192:
                ic.resize((64, 64), Image.LANCZOS).quantize(colors=64, method=Image.Quantize.FASTOCTREE).save(os.path.join(outdir, 'favicon.png'), 'PNG', optimize=True)
for n, s, b in report:
    print(f'{n:10s} {s[0]}x{s[1]}  {b/1024:.1f} KB')
print('canvas', CW, CH, 'boxes', {k: (v[2]-v[0], v[3]-v[1]) for k, v in boxes.items()})
