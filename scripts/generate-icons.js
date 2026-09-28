import fs from "fs";
import path from "path";
import zlib from "zlib";

function createPng(width, height, pixelFn) {
  // raw scanlines: each row starts with filter byte 0 (None)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });

  function writeChunk(type, data) {
    const typeBuf = Buffer.from(type, "ascii");
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const typeAndData = Buffer.concat([typeBuf, data]);
    const crc = zlib.crc32(typeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0, 0);

    return Buffer.concat([lenBuf, typeAndData, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // No interlace
  const ihdrChunk = writeChunk("IHDR", ihdrData);

  // IDAT
  const idatChunk = writeChunk("IDAT", compressedData);

  // IEND
  const iendChunk = writeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw brand meal-planner icon with gradient and plate motif
function brandIconDrawer(isMaskable) {
  return (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Normalized coordinates
    const nx = x / w;
    const ny = y / h;

    // Corner radius for standard app icon (unmasked)
    const cornerRadius = w * 0.22;
    if (!isMaskable) {
      // Rounded rect check
      const qx = Math.max(0, Math.abs(dx) - (w / 2 - cornerRadius));
      const qy = Math.max(0, Math.abs(dy) - (h / 2 - cornerRadius));
      if (Math.sqrt(qx * qx + qy * qy) > cornerRadius) {
        return [0, 0, 0, 0]; // Transparent outside rounded squircle
      }
    }

    // Emerald gradient background
    // Top-left: #059669 -> Bottom-right: #047857
    const gradT = (nx + ny) / 2;
    let bgR = Math.round(5 + gradT * (4 - 5));
    let bgG = Math.round(150 + gradT * (120 - 150));
    let bgB = Math.round(105 + gradT * (87 - 105));

    // Inner plate circle (scale for maskable safe margin: maskable uses 0.35, standard uses 0.40)
    const plateRadius = isMaskable ? w * 0.33 : w * 0.38;
    const plateRimRadius = plateRadius * 0.92;
    const plateCenterRadius = plateRadius * 0.76;

    if (dist <= plateRadius) {
      // Outer plate rim (soft white/slate)
      if (dist > plateRimRadius) {
        return [255, 255, 255, 245];
      }
      // Inner plate groove
      if (dist > plateCenterRadius) {
        return [241, 245, 249, 255];
      }
      // Center plate area
      // Check leaf & cutlery motifs in center
      // Healthy leaf shape (left side of plate center)
      const lx = dx + (isMaskable ? 14 : 20);
      const ly = dy + 5;
      const leafDist = Math.sqrt(lx * lx + ly * ly);

      if (dx < 0 && leafDist < plateCenterRadius * 0.65) {
        // Vibrant emerald leaf
        return [16, 185, 129, 255];
      }

      // Cutlery / fork motif (right side of plate)
      if (dx > 4 && dx < plateCenterRadius * 0.55 && Math.abs(dy) < plateCenterRadius * 0.65) {
        if (Math.abs(dx - plateCenterRadius * 0.3) < 4) {
          return [30, 41, 59, 255]; // Dark slate fork handle
        }
        if (dy < -plateCenterRadius * 0.25 && (Math.abs(dx - plateCenterRadius * 0.18) < 3 || Math.abs(dx - plateCenterRadius * 0.42) < 3)) {
          return [30, 41, 59, 255]; // Fork prongs
        }
      }

      // Plate base white
      return [255, 255, 255, 255];
    }

    return [bgR, bgG, bgB, 255];
  };
}

const publicDir = path.join(process.cwd(), "public");

console.log("Generating PWA Icon Assets...");

// 1. pwa-192x192.png
const pwa192 = createPng(192, 192, brandIconDrawer(false));
fs.writeFileSync(path.join(publicDir, "pwa-192x192.png"), pwa192);
console.log("✓ Generated public/pwa-192x192.png");

// 2. pwa-512x512.png
const pwa512 = createPng(512, 512, brandIconDrawer(false));
fs.writeFileSync(path.join(publicDir, "pwa-512x512.png"), pwa512);
console.log("✓ Generated public/pwa-512x512.png");

// 3. pwa-maskable-512x512.png (padded safe-zone)
const pwaMaskable = createPng(512, 512, brandIconDrawer(true));
fs.writeFileSync(path.join(publicDir, "pwa-maskable-512x512.png"), pwaMaskable);
console.log("✓ Generated public/pwa-maskable-512x512.png");

// 4. apple-touch-icon.png (180x180)
const appleIcon = createPng(180, 180, brandIconDrawer(false));
fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), appleIcon);
console.log("✓ Generated public/apple-touch-icon.png");

// 5. favicon.ico (copy 192 png as lightweight valid image or write 32x32 png)
const favicon = createPng(32, 32, brandIconDrawer(false));
fs.writeFileSync(path.join(publicDir, "favicon.ico"), favicon);
console.log("✓ Generated public/favicon.ico");

console.log("All PWA Icon Assets generated successfully!");
