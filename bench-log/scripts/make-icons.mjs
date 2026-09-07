// Generates the PWA icons from code so they can be regenerated and reviewed in
// a diff rather than landing as opaque binaries. `npm run icons`.
//
// The mark is three bars in the rating ramp: pale, mid, moss. It is the heatmap
// legend, which is the one screen the app exists for. Colours match index.css.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const INK = [0x16, 0x21, 0x1d, 255];
const BARS = [
  [0xe5, 0xeb, 0xe8, 255], // level 0
  [0xa9, 0xdc, 0xc6, 255], // level 1
  [0x1f, 0x7a, 0x5c, 255], // moss
];

const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(buf) {
  let c = ~0;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    rgba.copy(raw, row + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function inRounded(x, y, left, top, w, h, r) {
  const right = left + w;
  const bottom = top + h;
  if (x < left || x > right || y < top || y > bottom) return false;
  const cx = Math.min(Math.max(x, left + r), right - r);
  const cy = Math.min(Math.max(y, top + r), bottom - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function draw(size, { maskable = false } = {}) {
  const ss = 3; // supersample and average down: cheap anti-aliasing
  const n = size * ss;
  const acc = new Float64Array(size * size * 4);

  // Maskable icons are cropped to a circle by the launcher: the tile bleeds to
  // the edges and the mark shrinks into the safe zone.
  const pad = maskable ? 0 : n * 0.06;
  const tileR = maskable ? 0 : n * 0.22;
  const scale = maskable ? 0.6 : 0.78;
  const barW = n * 0.14 * scale;
  const gap = n * 0.07 * scale;
  const heights = [0.3, 0.48, 0.66].map((f) => n * f * scale);
  const groupW = barW * 3 + gap * 2;
  const x0 = (n - groupW) / 2;
  const baseline = n / 2 + (heights[2] / 2) * 0.9;
  const barR = barW * 0.3;

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let px = null;
      if (inRounded(x, y, pad, pad, n - pad * 2, n - pad * 2, tileR)) px = INK;
      for (let i = 0; i < 3; i++) {
        const left = x0 + i * (barW + gap);
        if (inRounded(x, y, left, baseline - heights[i], barW, heights[i], barR)) px = BARS[i];
      }
      if (!px) continue;
      const o = (Math.floor(y / ss) * size + Math.floor(x / ss)) * 4;
      acc[o] += px[0];
      acc[o + 1] += px[1];
      acc[o + 2] += px[2];
      acc[o + 3] += px[3];
    }
  }

  const samples = ss * ss;
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const a = acc[i * 4 + 3] / samples;
    const cover = a / 255; // un-premultiply so edges fade in alpha, not to black
    out[i * 4] = cover ? Math.round(acc[i * 4] / samples / cover) : 0;
    out[i * 4 + 1] = cover ? Math.round(acc[i * 4 + 1] / samples / cover) : 0;
    out[i * 4 + 2] = cover ? Math.round(acc[i * 4 + 2] / samples / cover) : 0;
    out[i * 4 + 3] = Math.round(a);
  }
  return png(size, out);
}

mkdirSync(OUT, { recursive: true });
for (const [name, buf] of [
  ['icon-192.png', draw(192)],
  ['icon-512.png', draw(512)],
  ['icon-maskable-512.png', draw(512, { maskable: true })],
  ['apple-touch-icon.png', draw(180, { maskable: true })],
]) {
  writeFileSync(join(OUT, name), buf);
  console.log(`${name}  ${(buf.length / 1024).toFixed(1)} kB`);
}
