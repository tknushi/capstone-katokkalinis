const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imgDir = path.join(__dirname, 'img');
const frontendDir = __dirname;

// 1. Create Katok Kalinis brand SVG
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="50%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
    <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#dcfce7"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#052e16" flood-opacity="0.35"/>
    </filter>
  </defs>
  <!-- Rounded Shield / Squircle Background -->
  <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#bgGrad)"/>
  <!-- Inner Border Accent -->
  <rect x="36" y="36" width="440" height="440" rx="100" fill="none" stroke="#86efac" stroke-width="6" opacity="0.4"/>
  <!-- Recycling Leaves Motif (Katok Kalinis Clean Environment Symbol) -->
  <g filter="url(#shadow)" fill="url(#leafGrad)">
    <!-- Primary dynamic leaf -->
    <path d="M256 96 C180 96 128 160 128 236 C128 324 212 376 256 416 C300 376 384 324 384 236 C384 160 332 96 256 96 Z M256 148 C308 148 344 194 344 246 C344 304 290 348 256 380 C222 348 168 304 168 246 C168 194 204 148 256 148 Z" fill-rule="evenodd"/>
    <!-- Central Sprout / Clean Life Vein -->
    <path d="M256 176 C256 260 216 296 200 310 C216 306 252 290 256 240 C260 290 296 306 312 310 C296 296 256 260 256 176 Z" fill="#22c55e"/>
    <!-- Sparkling Clean Star Accent -->
    <path d="M360 120 L368 140 L388 148 L368 156 L360 176 L352 156 L332 148 L352 140 Z" fill="#fef08a"/>
  </g>
  <!-- Letter K Brand Stamp -->
  <text x="256" y="448" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="4" opacity="0.9">KATOK KALINIS</text>
</svg>`;

async function main() {
    console.log('Generating Katok Kalinis favicons & WebP assets...');

    // Save SVG favicon
    const svgPath = path.join(imgDir, 'favicon.svg');
    fs.writeFileSync(svgPath, svgFavicon, 'utf8');
    console.log('Saved:', svgPath);

    const svgBuffer = Buffer.from(svgFavicon);

    // 16x16 PNG
    const p16 = path.join(imgDir, 'favicon-16x16.png');
    await sharp(svgBuffer).resize(16, 16).png().toFile(p16);
    console.log('Saved:', p16);

    // 32x32 PNG
    const p32 = path.join(imgDir, 'favicon-32x32.png');
    await sharp(svgBuffer).resize(32, 32).png().toFile(p32);
    console.log('Saved:', p32);

    // 180x180 Apple Touch Icon
    const p180 = path.join(imgDir, 'apple-touch-icon.png');
    await sharp(svgBuffer).resize(180, 180).png().toFile(p180);
    console.log('Saved:', p180);

    // 192x192 & 512x512 PWA icons
    const p192 = path.join(imgDir, 'icon-192x192.png');
    await sharp(svgBuffer).resize(192, 192).png().toFile(p192);

    const p512 = path.join(imgDir, 'icon-512x512.png');
    await sharp(svgBuffer).resize(512, 512).png().toFile(p512);

    // Build multi-size favicon.ico (16x16 and 32x32)
    const buf16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
    const buf32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
    
    // ICO header: 6 bytes (reserved=0, type=1, count=2)
    const icoHeader = Buffer.alloc(6);
    icoHeader.writeUInt16LE(0, 0); // reserved
    icoHeader.writeUInt16LE(1, 2); // type 1 = ICO
    icoHeader.writeUInt16LE(2, 4); // 2 images

    // Directory entry 1: 16x16
    const dir1 = Buffer.alloc(16);
    dir1.writeUInt8(16, 0); // width
    dir1.writeUInt8(16, 1); // height
    dir1.writeUInt8(0, 2);  // color palette
    dir1.writeUInt8(0, 3);  // reserved
    dir1.writeUInt16LE(1, 4); // color planes
    dir1.writeUInt16LE(32, 6); // bpp
    dir1.writeUInt32LE(buf16.length, 8); // image size
    dir1.writeUInt32LE(6 + 16 * 2, 12); // offset: header + 2 entries

    // Directory entry 2: 32x32
    const dir2 = Buffer.alloc(16);
    dir2.writeUInt8(32, 0);
    dir2.writeUInt8(32, 1);
    dir2.writeUInt8(0, 2);
    dir2.writeUInt8(0, 3);
    dir2.writeUInt16LE(1, 4);
    dir2.writeUInt16LE(32, 6);
    dir2.writeUInt32LE(buf32.length, 8);
    dir2.writeUInt32LE(6 + 16 * 2 + buf16.length, 12);

    const icoBuffer = Buffer.concat([icoHeader, dir1, dir2, buf16, buf32]);
    fs.writeFileSync(path.join(frontendDir, 'favicon.ico'), icoBuffer);
    fs.writeFileSync(path.join(imgDir, 'favicon.ico'), icoBuffer);
    console.log('Saved favicon.ico');

    // Compress & convert clenro-logo.png
    const clenroPng = path.join(imgDir, 'clenro-logo.png');
    if (fs.existsSync(clenroPng)) {
        const clenroWebp = path.join(imgDir, 'clenro-logo.webp');
        // Produce optimized webp at high-dpi 400x400 (retina ready for 68px/100px display)
        await sharp(clenroPng)
            .resize(400, 400, { fit: 'inside' })
            .webp({ quality: 85 })
            .toFile(clenroWebp);
        console.log('Saved WebP version:', clenroWebp);

        // Also create a resized optimized PNG backup
        const clenroPngOptimized = path.join(imgDir, 'clenro-logo-optimized.png');
        await sharp(clenroPng)
            .resize(400, 400, { fit: 'inside' })
            .png({ compressionLevel: 9, quality: 85 })
            .toFile(clenroPngOptimized);
        console.log('Saved optimized PNG version:', clenroPngOptimized);
    }

    // Generate site.webmanifest
    const webmanifest = {
        name: "Katok Kalinis",
        short_name: "KatokKalinis",
        description: "Official Solid Waste and Environmental Sanitation Management System - CLENRO",
        start_url: "/login.html",
        display: "standalone",
        background_color: "#0f3d20",
        theme_color: "#16a34a",
        icons: [
            {
                src: "img/icon-192x192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "img/icon-512x512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ]
    };
    fs.writeFileSync(path.join(frontendDir, 'site.webmanifest'), JSON.stringify(webmanifest, null, 2), 'utf8');
    console.log('Saved site.webmanifest');
    console.log('Asset generation complete!');
}

main().catch(err => {
    console.error('Asset generation error:', err);
    process.exit(1);
});
