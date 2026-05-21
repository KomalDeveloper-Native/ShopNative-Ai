const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');

function crc32(buf) {
  let c = 0xffffffff;

  for (const b of buf) {
    c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  }

  return (c ^ 0xffffffff) >>> 0;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuf.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 8 + data.length);
  return out;
}

function writePng(file, width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, png);
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smooth(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function blend(px, color, alpha) {
  const a = clamp01(alpha) * (color[3] / 255);
  const inv = 1 - a;
  px[0] = Math.round(color[0] * a + px[0] * inv);
  px[1] = Math.round(color[1] * a + px[1] * inv);
  px[2] = Math.round(color[2] * a + px[2] * inv);
  px[3] = Math.round(255 * a + px[3] * inv);
}

function sdRoundRect(x, y, cx, cy, w, h, r) {
  const qx = Math.abs(x - cx) - w / 2 + r;
  const qy = Math.abs(y - cy) - h / 2 + r;
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

function sdCircle(x, y, cx, cy, r) {
  return Math.hypot(x - cx, y - cy) - r;
}

function sdSegment(x, y, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = x - ax;
  const wy = y - ay;
  const t = clamp01((wx * vx + wy * vy) / (vx * vx + vy * vy));
  return Math.hypot(x - (ax + vx * t), y - (ay + vy * t));
}

function fillSdf(px, d, color, feather = 1.2) {
  blend(px, color, 1 - smooth(-feather, feather, d));
}

function strokeSdf(px, d, width, color, feather = 1.2) {
  blend(px, color, 1 - smooth(width / 2 - feather, width / 2 + feather, Math.abs(d)));
}

function render(size, round = false) {
  const buf = Buffer.alloc(size * size * 4);
  const c1 = hexToRgb('#0F766E');
  const c2 = hexToRgb('#0EA5A4');
  const c3 = hexToRgb('#1D4ED8');

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = x / (size - 1);
      const ny = y / (size - 1);
      const t = clamp01((nx * 0.65 + ny * 0.85) / 1.5);
      let rgb = mix(c1, c2, t);
      const radial = clamp01(1 - Math.hypot(nx - 0.82, ny - 0.18) / 0.75);
      rgb = mix(rgb, c3, radial * 0.45);

      const i = (y * size + x) * 4;
      buf[i] = rgb[0];
      buf[i + 1] = rgb[1];
      buf[i + 2] = rgb[2];
      buf[i + 3] = 255;

      if (round) {
        const d = sdCircle(x, y, size / 2, size / 2, size * 0.485);
        if (d > 0) {
          buf[i + 3] = 0;
        } else if (d > -2) {
          buf[i + 3] = Math.round(255 * clamp01(-d / 2));
        }
      }
    }
  }

  const S = size / 1024;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const px = [buf[i], buf[i + 1], buf[i + 2], buf[i + 3]];
      if (px[3] === 0) {
        continue;
      }

      fillSdf(px, sdRoundRect(x, y, 512 * S, 568 * S, 520 * S, 470 * S, 96 * S) - 22 * S, [5, 22, 35, 95], 12 * S);
      const bag = sdRoundRect(x, y, 512 * S, 552 * S, 520 * S, 470 * S, 96 * S);
      fillSdf(px, bag, [255, 255, 255, 242], 1.5 * S);
      strokeSdf(px, bag + 3 * S, 16 * S, [255, 255, 255, 255], 1.2 * S);

      const handle = Math.min(
        sdSegment(x, y, 374 * S, 421 * S, 420 * S, 304 * S),
        sdSegment(x, y, 420 * S, 304 * S, 512 * S, 268 * S),
        sdSegment(x, y, 512 * S, 268 * S, 604 * S, 304 * S),
        sdSegment(x, y, 604 * S, 304 * S, 650 * S, 421 * S),
      );
      strokeSdf(px, handle, 44 * S, [13, 116, 110, 245], 1.8 * S);

      strokeSdf(px, sdSegment(x, y, 330 * S, 700 * S, 399 * S, 496 * S), 47 * S, [14, 116, 144, 255], 1.6 * S);
      strokeSdf(px, sdSegment(x, y, 399 * S, 496 * S, 468 * S, 700 * S), 47 * S, [14, 116, 144, 255], 1.6 * S);
      strokeSdf(px, sdSegment(x, y, 362 * S, 624 * S, 435 * S, 624 * S), 39 * S, [14, 116, 144, 255], 1.6 * S);
      strokeSdf(px, sdSegment(x, y, 592 * S, 503 * S, 592 * S, 697 * S), 52 * S, [29, 78, 216, 255], 1.6 * S);
      strokeSdf(px, sdSegment(x, y, 540 * S, 505 * S, 644 * S, 505 * S), 37 * S, [29, 78, 216, 255], 1.6 * S);
      strokeSdf(px, sdSegment(x, y, 540 * S, 695 * S, 644 * S, 695 * S), 37 * S, [29, 78, 216, 255], 1.6 * S);
      strokeSdf(px, sdSegment(x, y, 728 * S, 446 * S, 728 * S, 544 * S), 25 * S, [245, 158, 11, 255], 1.5 * S);
      strokeSdf(px, sdSegment(x, y, 679 * S, 495 * S, 777 * S, 495 * S), 25 * S, [245, 158, 11, 255], 1.5 * S);
      fillSdf(px, sdCircle(x, y, 746 * S, 632 * S, 26 * S), [20, 184, 166, 255], 1.4 * S);

      buf[i] = px[0];
      buf[i + 1] = px[1];
      buf[i + 2] = px[2];
      buf[i + 3] = px[3];
    }
  }

  return buf;
}

const androidIcons = [
  ['mipmap-mdpi', 48],
  ['mipmap-hdpi', 72],
  ['mipmap-xhdpi', 96],
  ['mipmap-xxhdpi', 144],
  ['mipmap-xxxhdpi', 192],
];

for (const [dir, size] of androidIcons) {
  const target = path.join(root, 'android', 'app', 'src', 'main', 'res', dir);
  writePng(path.join(target, 'ic_launcher.png'), size, size, render(size));
  writePng(path.join(target, 'ic_launcher_round.png'), size, size, render(size, true));
}

const iosDir = path.join(root, 'ios', 'ShopNative_Ai', 'Images.xcassets', 'AppIcon.appiconset');
const iosIcons = [
  ['AppIcon-20@2x.png', 40],
  ['AppIcon-20@3x.png', 60],
  ['AppIcon-29@2x.png', 58],
  ['AppIcon-29@3x.png', 87],
  ['AppIcon-40@2x.png', 80],
  ['AppIcon-40@3x.png', 120],
  ['AppIcon-60@2x.png', 120],
  ['AppIcon-60@3x.png', 180],
  ['AppIcon-1024.png', 1024],
];

for (const [name, size] of iosIcons) {
  writePng(path.join(iosDir, name), size, size, render(size));
}

console.log('Generated app icons for Android and iOS.');
