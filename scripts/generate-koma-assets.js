// scripts/generate-koma-assets.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const COLORS = {
  ink: '#1D1B18',
  violet: '#5A46D6',
  violetLight: '#8A7BFF',
  paper: '#F7F4EE',
  white: '#FFFFFF',
  mutedInk: '#524E48',
  tan: '#DCCDBB'
};

/*
================================================================================
GEOMETRIC TYPOGRAPHY DEFINITIONS
viewBox height = 160
Baseline = 112
x-height = 56 (y from 56 to 112)
Ascender = 24 (y from 24 to 112)
Descender = 146 (y from 112 to 146)
================================================================================
*/

function buildWordmarkGlyphs(startX) {
  // 1. 'k'
  // Ascender stem: x: startX .. startX + 17, y: 24 .. 112
  // Diagonals: elegant editorial geometric connection
  const xK = startX;
  const kPath = `
    <g id="glyph-k" class="koma-glyph" data-letter="k">
      <rect x="${xK}" y="24" width="17" height="88" rx="0.75" />
      <path d="
        M ${xK + 16.5} 81.5
        L ${xK + 52} 56
        L ${xK + 71} 56
        L ${xK + 33} 83
        L ${xK + 72} 112
        L ${xK + 51} 112
        L ${xK + 22.5} 90.5
        L ${xK + 16.5} 95
        Z
      " />
    </g>
  `;

  // 2. 'o'
  // Exact circular geometry matching the comma head
  // Outer radius = 28.5 (width 57, height 57: y from 55 to 112)
  // Inner radius = 11.5 (stroke thickness = 17)
  const xO = xK + 79;
  const cxO = xO + 28.5;
  const cyO = 83.5;
  const oPath = `
    <g id="glyph-o" class="koma-glyph" data-letter="o">
      <path fill-rule="evenodd" d="
        M ${cxO} ${cyO - 28.5}
        A 28.5 28.5 0 1 1 ${cxO - 0.01} ${cyO - 28.5}
        Z
        M ${cxO} ${cyO - 11.5}
        A 11.5 11.5 0 1 0 ${cxO + 0.01} ${cyO - 11.5}
        Z
      " />
    </g>
  `;

  // 3. 'm'
  // Triple stem with smooth humanist shoulders
  const xM = xO + 66;
  const mPath = `
    <g id="glyph-m" class="koma-glyph" data-letter="m">
      <path d="
        M ${xM} 56
        L ${xM + 16.5} 56
        L ${xM + 16.5} 67
        C ${xM + 21.5} 59.5, ${xM + 30} 55, ${xM + 41.5} 55
        C ${xM + 52.5} 55, ${xM + 60} 60.5, ${xM + 63.5} 69.5
        C ${xM + 69.5} 59.5, ${xM + 78} 55, ${xM + 89.5} 55
        C ${xM + 102.5} 55, ${xM + 109.5} 63.5, ${xM + 109.5} 78
        L ${xM + 109.5} 112
        L ${xM + 93} 112
        L ${xM + 93} 79.5
        C ${xM + 93} 73.5, ${xM + 89.5} 70, ${xM + 83.5} 70
        C ${xM + 76.5} 70, ${xM + 71.5} 74.5, ${xM + 71.5} 82
        L ${xM + 71.5} 112
        L ${xM + 55} 112
        L ${xM + 55} 79.5
        C ${xM + 55} 73.5, ${xM + 51.5} 70, ${xM + 45} 70
        C ${xM + 38} 70, ${xM + 33} 74.5, ${xM + 33} 82
        L ${xM + 33} 112
        L ${xM} 112
        Z
      " />
    </g>
  `;

  // 4. 'a'
  // Single-story geometric editorial 'a'
  // Bowl matches 'o' circular geometry on the left; clean vertical stem on right
  const xA = xM + 118;
  const cxA = xA + 28.5;
  const cyA = 83.5;
  const aPath = `
    <g id="glyph-a" class="koma-glyph" data-letter="a">
      <path fill-rule="evenodd" d="
        M ${xA + 27} 55
        C ${xA + 42} 55, ${xA + 53.5} 65, ${xA + 56} 76.5
        L ${xA + 56} 56
        L ${xA + 72.5} 56
        L ${xA + 72.5} 112
        L ${xA + 56.5} 112
        L ${xA + 56.5} 102
        C ${xA + 53} 108.5, ${xA + 42.5} 113, ${xA + 28.5} 113
        C ${xA + 12.5} 113, ${xA} 99.5, ${xA} 83.5
        C ${xA} 68, ${xA + 12} 55, ${xA + 27} 55
        Z
        M ${xA + 29} 71.5
        C ${xA + 19} 71.5, ${xA + 16} 77, ${xA + 16} 83.5
        C ${xA + 16} 90.5, ${xA + 19} 96.5, ${xA + 29} 96.5
        C ${xA + 39} 96.5, ${xA + 56} 90.5, ${xA + 56} 83.5
        C ${xA + 56} 77, ${xA + 39} 71.5, ${xA + 29} 71.5
        Z
      " />
    </g>
  `;

  return {
    k: kPath,
    o: oPath,
    m: mPath,
    a: aPath,
    endX: xA + 72.5
  };
}

// Iconic Comma Symbol Path
// cx, cy = center of the circular head (r = 16)
// bottom of head = cy + 16. When cy = 96, bottom sits at 112 (baseline)!
// tail sweeps down to cy + 36 = 132 (descender)!
function getCommaSymbolPath(cx, cy, scale = 1) {
  const r = 16 * scale;
  const drop = 36 * scale;
  const sweep = 16 * scale;
  
  // Sculpted tension curve:
  // Circular crown from left to right, transitioning seamlessly into an editorial swoop
  const c1x = cx + r;
  const c1y = cy + r * 0.9;
  const c2x = cx + r * 0.52;
  const c2y = cy + drop * 0.76;
  const tipX = cx - sweep;
  const tipY = cy + drop;

  // Inner recovery curve
  const inC1x = cx - sweep * 0.7;
  const inC1y = cy + drop * 0.85;
  const inC2x = cx - 3.5 * scale;
  const inC2y = cy + 22 * scale;
  const inC3x = cx - 2.5 * scale;
  const inC3y = cy + 16 * scale;
  
  // Blend to belly
  const bellyC1x = cx - 2.5 * scale;
  const bellyC1y = cy + 15 * scale;
  const bellyC2x = cx - r;
  const bellyC2y = cy + 12 * scale;
  
  return `
    M ${cx - r} ${cy}
    A ${r} ${r} 0 0 1 ${cx + r} ${cy}
    C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tipX} ${tipY}
    C ${inC1x} ${inC1y}, ${inC2x} ${inC2y}, ${inC3x} ${inC3y}
    C ${bellyC1x} ${bellyC1y}, ${bellyC2x} ${bellyC2y}, ${cx - r} ${cy}
    Z
  `;
}

/*
================================================================================
SVG BUILDERS (Transparent, Structured for Scroll-Craft & Production)
================================================================================
*/

// 1. Horizontal Logo
function buildHorizontalLogoSVG({ wordmarkColor, symbolColor, bg = null }) {
  const startX = 36;
  const wm = buildWordmarkGlyphs(startX);
  const cxComma = wm.endX + 16; // Snug optical punctuation kerning
  const cyComma = 96; // Baseline alignment
  const totalWidth = cxComma + 24;

  const bgRect = bg ? `<rect width="100%" height="100%" fill="${bg}" />` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 160" width="${totalWidth}" height="160" id="koma-horizontal-logo">
  ${bgRect}
  <!-- Wordmark Layer (Targetable for Stagger / Scroll-Craft) -->
  <g id="koma-wordmark" data-layer="wordmark" fill="${wordmarkColor}">
    ${wm.k}
    ${wm.o}
    ${wm.m}
    ${wm.a}
  </g>
  <!-- Symbol Layer (Independent Layer for Scroll-Craft Pinning / Floating / Morphing) -->
  <g id="koma-symbol" data-layer="symbol" fill="${symbolColor}">
    <path id="glyph-comma" d="${getCommaSymbolPath(cxComma, cyComma, 1)}" />
  </g>
</svg>`;
}

// 2. Standalone Comma Symbol (Raw Vector Glyph)
// viewBox 120 120, centered optically
function buildSymbolSVG({ color, bg = null, rounded = false, radius = 0 }) {
  // Optical center of comma symbol:
  // Head r=28, cy=46, drop=63, sweep=28
  // Total bounding box ~ 56w x 88h
  // Perfect center in 120x120 viewBox: cx = 66, cy = 46
  const scale = 1.75;
  const cx = 66;
  const cy = 46;
  
  let bgElement = '';
  if (bg) {
    if (rounded) {
      bgElement = `<rect width="120" height="120" rx="${radius}" fill="${bg}" />`;
    } else {
      bgElement = `<rect width="120" height="120" fill="${bg}" />`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" id="koma-mark">
  ${bgElement}
  <g id="koma-symbol-standalone" fill="${color}">
    <path id="glyph-comma-mark" d="${getCommaSymbolPath(cx, cy, scale)}" />
  </g>
</svg>`;
}

// 3. Wordmark Only (for decoupled scroll-craft layouts)
function buildWordmarkOnlySVG({ color, bg = null }) {
  const startX = 24;
  const wm = buildWordmarkGlyphs(startX);
  const totalWidth = wm.endX + 24;

  const bgRect = bg ? `<rect width="100%" height="100%" fill="${bg}" />` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 160" width="${totalWidth}" height="160" id="koma-wordmark-only">
  ${bgRect}
  <g id="koma-wordmark" fill="${color}">
    ${wm.k}
    ${wm.o}
    ${wm.m}
    ${wm.a}
  </g>
</svg>`;
}

// 4. Stacked / Centered Lockup (Mark above Wordmark)
function buildStackedLockupSVG({ wordmarkColor, symbolColor, bg = null }) {
  // viewBox 360 260
  // Symbol at top: cx = 180, cy = 60, scale = 1.4
  // Wordmark below: centered at bottom
  const wmStartX = 26; // wm width ~ 308, centered in 360
  const wm = buildWordmarkGlyphs(wmStartX);
  const bgRect = bg ? `<rect width="100%" height="100%" fill="${bg}" />` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260" width="360" height="260" id="koma-stacked-logo">
  ${bgRect}
  <!-- Centered Symbol Mark -->
  <g id="koma-symbol-top" data-layer="symbol" fill="${symbolColor}">
    <path id="glyph-comma-stacked" d="${getCommaSymbolPath(186, 68, 1.4)}" />
  </g>
  <!-- Centered Wordmark (no trailing comma) -->
  <g id="koma-wordmark-bottom" data-layer="wordmark" transform="translate(0, 100)" fill="${wordmarkColor}">
    ${wm.k}
    ${wm.o}
    ${wm.m}
    ${wm.a}
  </g>
</svg>`;
}

// 5. Optimized Favicon (Crisp, High Optical Weight for 16px - 64px)
function buildFaviconSVG({ bg = COLORS.violet, markColor = COLORS.paper }) {
  // 32x32 viewBox
  // Scale for 32x32: cx=17.5, cy=11.5, scale=0.48
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" id="koma-favicon">
  <rect width="32" height="32" rx="7" fill="${bg}" />
  <path fill="${markColor}" d="${getCommaSymbolPath(17.5, 11.5, 0.48)}" />
</svg>`;
}

/*
================================================================================
ASSET GENERATION & EXPORT PIPELINE
================================================================================
*/

async function generateAllAssets() {
  const svgDir = path.resolve('public/brand/svg');
  const pngDir = path.resolve('public/brand/png');
  fs.mkdirSync(svgDir, { recursive: true });
  fs.mkdirSync(pngDir, { recursive: true });

  console.log('Generating SVG Assets...');

  // 1. Horizontal Logos
  // A. Primary Editorial Color (Ink wordmark + Violet comma, Transparent)
  const svgHColor = buildHorizontalLogoSVG({ wordmarkColor: COLORS.ink, symbolColor: COLORS.violet });
  fs.writeFileSync(path.join(svgDir, 'koma-logo-horizontal-color.svg'), svgHColor);

  // B. Editorial on Warm Paper
  const svgHPaperBg = buildHorizontalLogoSVG({ wordmarkColor: COLORS.ink, symbolColor: COLORS.violet, bg: COLORS.paper });
  fs.writeFileSync(path.join(svgDir, 'koma-logo-horizontal-paperbg.svg'), svgHPaperBg);

  // C. Monochrome Ink (All Ink, Transparent)
  const svgHInk = buildHorizontalLogoSVG({ wordmarkColor: COLORS.ink, symbolColor: COLORS.ink });
  fs.writeFileSync(path.join(svgDir, 'koma-logo-horizontal-ink.svg'), svgHInk);

  // D. Monochrome Paper/White (All Warm Paper, Transparent for dark UI)
  const svgHPaper = buildHorizontalLogoSVG({ wordmarkColor: COLORS.paper, symbolColor: COLORS.paper });
  fs.writeFileSync(path.join(svgDir, 'koma-logo-horizontal-paper.svg'), svgHPaper);

  // E. Dark Mode Inverted (Paper wordmark + Electric Violet symbol, Transparent)
  const svgHDark = buildHorizontalLogoSVG({ wordmarkColor: COLORS.paper, symbolColor: COLORS.violetLight });
  fs.writeFileSync(path.join(svgDir, 'koma-logo-horizontal-dark.svg'), svgHDark);

  // 2. Standalone Symbol Marks
  // A. Violet Mark (Transparent)
  const svgSymViolet = buildSymbolSVG({ color: COLORS.violet });
  fs.writeFileSync(path.join(svgDir, 'koma-symbol-violet.svg'), svgSymViolet);

  // B. Ink Mark (Transparent)
  const svgSymInk = buildSymbolSVG({ color: COLORS.ink });
  fs.writeFileSync(path.join(svgDir, 'koma-symbol-ink.svg'), svgSymInk);

  // C. Paper Mark (Transparent)
  const svgSymPaper = buildSymbolSVG({ color: COLORS.paper });
  fs.writeFileSync(path.join(svgDir, 'koma-symbol-paper.svg'), svgSymPaper);

  // D. App Icon Tile (Squircle Violet + Warm Paper Mark)
  const svgTileViolet = buildSymbolSVG({ color: COLORS.paper, bg: COLORS.violet, rounded: true, radius: 28 });
  fs.writeFileSync(path.join(svgDir, 'koma-app-icon-violet.svg'), svgTileViolet);

  // E. App Icon Tile (Squircle Ink + Warm Paper Mark)
  const svgTileInk = buildSymbolSVG({ color: COLORS.paper, bg: COLORS.ink, rounded: true, radius: 28 });
  fs.writeFileSync(path.join(svgDir, 'koma-app-icon-ink.svg'), svgTileInk);

  // 3. Wordmark Only (Scroll-Craft decoupled layer)
  const svgWmInk = buildWordmarkOnlySVG({ color: COLORS.ink });
  fs.writeFileSync(path.join(svgDir, 'koma-wordmark-only-ink.svg'), svgWmInk);

  const svgWmPaper = buildWordmarkOnlySVG({ color: COLORS.paper });
  fs.writeFileSync(path.join(svgDir, 'koma-wordmark-only-paper.svg'), svgWmPaper);

  // 4. Stacked Lockup
  const svgStackedColor = buildStackedLockupSVG({ wordmarkColor: COLORS.ink, symbolColor: COLORS.violet });
  fs.writeFileSync(path.join(svgDir, 'koma-logo-stacked-color.svg'), svgStackedColor);

  const svgStackedPaper = buildStackedLockupSVG({ wordmarkColor: COLORS.paper, symbolColor: COLORS.violetLight });
  fs.writeFileSync(path.join(svgDir, 'koma-logo-stacked-paper.svg'), svgStackedPaper);

  // 5. Favicon
  const svgFavicon = buildFaviconSVG({ bg: COLORS.violet, markColor: COLORS.paper });
  fs.writeFileSync(path.join(svgDir, 'favicon.svg'), svgFavicon);
  fs.writeFileSync(path.resolve('public/favicon.svg'), svgFavicon);

  console.log('All SVGs generated successfully!');

  // Launch Playwright to render high-DPI Transparent PNGs
  console.log('Rendering high-DPI Transparent PNGs via Chrome...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  const renderSVGToPNG = async (svgString, outPath, width, height, dsf = 2) => {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: dsf
    });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: transparent !important;
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            svg {
              display: block;
              width: ${width}px;
              height: ${height}px;
            }
          </style>
        </head>
        <body>${svgString}</body>
      </html>
    `);
    await page.screenshot({
      path: outPath,
      omitBackground: true
    });
    await page.close();
  };

  // Render Horizontal Logos (width ~420, height 160 -> retina 2x = 840x320)
  await renderSVGToPNG(svgHColor, path.join(pngDir, 'koma-logo-horizontal-color.png'), 420, 160, 2);
  await renderSVGToPNG(svgHColor, path.join(pngDir, 'koma-logo-horizontal-color@4x.png'), 420, 160, 4);
  await renderSVGToPNG(svgHInk, path.join(pngDir, 'koma-logo-horizontal-ink.png'), 420, 160, 2);
  await renderSVGToPNG(svgHPaper, path.join(pngDir, 'koma-logo-horizontal-paper.png'), 420, 160, 2);
  await renderSVGToPNG(svgHDark, path.join(pngDir, 'koma-logo-horizontal-dark.png'), 420, 160, 2);

  // Render Standalone Symbols (120x120 -> 240x240 and 512x512)
  await renderSVGToPNG(svgSymViolet, path.join(pngDir, 'koma-symbol-violet.png'), 120, 120, 2);
  await renderSVGToPNG(svgSymInk, path.join(pngDir, 'koma-symbol-ink.png'), 120, 120, 2);
  await renderSVGToPNG(svgSymPaper, path.join(pngDir, 'koma-symbol-paper.png'), 120, 120, 2);

  // Render App Icons (512x512)
  await renderSVGToPNG(svgTileViolet, path.join(pngDir, 'koma-app-icon-512.png'), 120, 120, 4.266);
  await renderSVGToPNG(svgTileInk, path.join(pngDir, 'koma-app-icon-ink-512.png'), 120, 120, 4.266);

  // Render Wordmark only (decoupled layer)
  await renderSVGToPNG(svgWmInk, path.join(pngDir, 'koma-wordmark-only-ink.png'), 360, 160, 2);
  await renderSVGToPNG(svgWmPaper, path.join(pngDir, 'koma-wordmark-only-paper.png'), 360, 160, 2);

  // Render Stacked Lockup
  await renderSVGToPNG(svgStackedColor, path.join(pngDir, 'koma-logo-stacked-color.png'), 360, 260, 2);

  // Render Standard Favicons
  await renderSVGToPNG(svgFavicon, path.join(pngDir, 'favicon-32x32.png'), 32, 32, 1);
  await renderSVGToPNG(svgFavicon, path.join(pngDir, 'favicon-64x64.png'), 32, 32, 2);
  await renderSVGToPNG(svgFavicon, path.join(pngDir, 'favicon-192x192.png'), 32, 32, 6);

  await browser.close();
  console.log('All PNG exports generated successfully!');
}

generateAllAssets().catch(console.error);
