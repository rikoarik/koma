// scripts/design-explorer.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

// Let's create precise SVG paths for the letters 'k', 'o', 'm', 'a'
/*
Baseline = 112
x-height top = 56 (height = 56)
Ascender top = 20 (height = 92)
Stroke width = 17.5
Round cap radius = 8.75 or crisp flat terminals (editorial sans usually features crisp horizontal/vertical sheared terminals, e.g. Neue Haas / Futura / GT America).
*/

// Let's create the SVG components with clean paths:

const glyphs = {
  // 'k': Stem from y=20 to y=112.
  // Diagonal arm starts from stem at (x+17.5, 78) to (x+62, 56).
  // Diagonal leg branches from arm at (x+38, 76) to (x+64, 112).
  k: (x) => `
    <g id="glyph-k" class="koma-glyph">
      <!-- Vertical Stem -->
      <rect x="${x}" y="20" width="17.5" height="92" rx="1.5" />
      <!-- Diagonal Arm -->
      <polygon points="${x + 16.5},84.5 ${x + 50.5},56 ${x + 68},56 ${x + 28},89.5" />
      <!-- Diagonal Leg -->
      <polygon points="${x + 30},83 ${x + 65.5},112 ${x + 44.5},112 ${x + 17},88" />
    </g>
  `,

  // 'o': Clean geometric circle/oval with optical compensation
  // Outer circle width 62, height 58 (from y=55 to y=113)
  // Inner counter width 27, height 23 (smooth concentric ellipse)
  o: (x) => `
    <g id="glyph-o" class="koma-glyph">
      <path fill-rule="evenodd" d="
        M ${x + 31} 55
        C ${x + 48.5} 55, ${x + 62} 68, ${x + 62} 84
        C ${x + 62} 100, ${x + 48.5} 113, ${x + 31} 113
        C ${x + 13.5} 113, ${x} 100, ${x} 84
        C ${x} 68, ${x + 13.5} 55, ${x + 31} 55 Z
        M ${x + 31} 72.5
        C ${x + 21} 72.5, ${x + 17.5} 77.5, ${x + 17.5} 84
        C ${x + 17.5} 90.5, ${x + 21} 95.5, ${x + 31} 95.5
        C ${x + 41} 95.5, ${x + 44.5} 90.5, ${x + 44.5} 84
        C ${x + 44.5} 77.5, ${x + 41} 72.5, ${x + 31} 72.5 Z
      " />
    </g>
  `,

  // 'm': Left stem + 2 rounded arches
  m: (x) => `
    <g id="glyph-m" class="koma-glyph">
      <path d="
        M ${x} 56
        L ${x + 17.5} 56
        L ${x + 17.5} 67
        C ${x + 23} 58.5, ${x + 32} 55, ${x + 42} 55
        C ${x + 53} 55, ${x + 61} 61, ${x + 64.5} 70.5
        C ${x + 70} 60.5, ${x + 79} 55, ${x + 90.5} 55
        C ${x + 104} 55, ${x + 112} 64, ${x + 112} 79
        L ${x + 112} 112
        L ${x + 94.5} 112
        L ${x + 94.5} 81
        C ${x + 94.5} 74.5, ${x + 91} 71, ${x + 84.5} 71
        C ${x + 77.5} 71, ${x + 72.5} 75.5, ${x + 72.5} 82.5
        L ${x + 72.5} 112
        L ${x + 55} 112
        L ${x + 55} 81
        C ${x + 55} 74.5, ${x + 51.5} 71, ${x + 45} 71
        C ${x + 38} 71, ${x + 33} 75.5, ${x + 33} 82.5
        L ${x + 33} 112
        L ${x} 112
        Z
      " />
    </g>
  `,

  // 'a': Single-story editorial geometric 'a'
  // Bowl matches 'o', right vertical stem
  a: (x) => `
    <g id="glyph-a" class="koma-glyph">
      <path fill-rule="evenodd" d="
        M ${x + 28} 55
        C ${x + 44} 55, ${x + 56} 66, ${x + 58.5} 78
        L ${x + 58.5} 56
        L ${x + 75.5} 56
        L ${x + 75.5} 112
        L ${x + 59} 112
        L ${x + 59} 101.5
        C ${x + 55.5} 108.5, ${x + 45} 113, ${x + 30} 113
        C ${x + 12.5} 113, ${x} 99.5, ${x} 84
        C ${x} 67.5, ${x + 13} 55, ${x + 28} 55 Z
        M ${x + 32} 72.5
        C ${x + 22} 72.5, ${x + 17.5} 77.5, ${x + 17.5} 84
        C ${x + 17.5} 90.5, ${x + 22} 95.5, ${x + 32} 95.5
        C ${x + 42} 95.5, ${x + 58.5} 89.5, ${x + 58.5} 84
        C ${x + 58.5} 77.5, ${x + 42} 72.5, ${x + 32} 72.5 Z
      " />
    </g>
  `,

  // Comma (The Symbol):
  // Placed right after 'a'
  comma: (cx, cy, scale = 1, fill = '#5A46D6') => {
    // Pure editorial sculpt:
    const r = 16.5 * scale;
    const drop = 36 * scale;
    const sweep = 18 * scale;
    return `
      <g id="koma-symbol" class="koma-symbol">
        <path id="glyph-comma" fill="${fill}" d="
          M ${cx - r} ${cy}
          A ${r} ${r} 0 0 1 ${cx + r} ${cy}
          C ${cx + r} ${cy + r * 0.8}, ${cx + r * 0.4} ${cy + drop * 0.72}, ${cx - sweep} ${cy + drop}
          L ${cx - sweep + 4.5 * scale} ${cy + drop - 3 * scale}
          C ${cx - sweep * 0.15} ${cy + drop * 0.52}, ${cx - r * 0.3} ${cy + r * 1.05}, ${cx - r * 0.45} ${cy + r * 0.9}
          C ${cx - r * 0.95} ${cy + r * 0.65}, ${cx - r} ${cy + r * 0.3}, ${cx - r} ${cy}
          Z
        " />
      </g>
    `;
  }
};

// Generate test HTML
const xK = 40;
const xO = xK + 74;
const xM = xO + 68;
const xA = xM + 118;
const cxComma = xA + 82 + 20;
const cyComma = 95.5;

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 40px;
      background: #F7F4EE;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1D1B18;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 24px;
      color: #1D1B18;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E8E3D9;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(29, 27, 24, 0.03);
    }
    .card.dark {
      background: #1D1B18;
      border-color: #2F2C27;
      color: #F7F4EE;
    }
    .card.violet {
      background: #5A46D6;
      border-color: #4835C2;
      color: #FFFFFF;
    }
    .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 16px;
      opacity: 0.6;
    }
    svg {
      display: block;
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <h1>KOMA Brand Identity — Typographic & Symbol Exploration</h1>
  
  <div class="grid">
    <!-- Card 1: Horizontal Lockup (Editorial Color) -->
    <div class="card">
      <div class="label">1. Primary Horizontal Logo (Warm Paper Background)</div>
      <svg viewBox="0 0 440 160" width="440" height="160" xmlns="http://www.w3.org/2000/svg">
        <g id="koma-wordmark" fill="#1D1B18">
          ${glyphs.k(xK)}
          ${glyphs.o(xO)}
          ${glyphs.m(xM)}
          ${glyphs.a(xA)}
        </g>
        ${glyphs.comma(cxComma, cyComma, 1, '#5A46D6')}
      </svg>
    </div>

    <!-- Card 2: Horizontal Lockup (Monochrome Ink) -->
    <div class="card">
      <div class="label">2. Monochrome Ink (Editorial Pure)</div>
      <svg viewBox="0 0 440 160" width="440" height="160" xmlns="http://www.w3.org/2000/svg">
        <g id="koma-wordmark" fill="#1D1B18">
          ${glyphs.k(xK)}
          ${glyphs.o(xO)}
          ${glyphs.m(xM)}
          ${glyphs.a(xA)}
        </g>
        ${glyphs.comma(cxComma, cyComma, 1, '#1D1B18')}
      </svg>
    </div>

    <!-- Card 3: Reverse on Ink Dark Mode -->
    <div class="card dark">
      <div class="label">3. Reversed on Charcoal Ink (#1D1B18)</div>
      <svg viewBox="0 0 440 160" width="440" height="160" xmlns="http://www.w3.org/2000/svg">
        <g id="koma-wordmark" fill="#F7F4EE">
          ${glyphs.k(xK)}
          ${glyphs.o(xO)}
          ${glyphs.m(xM)}
          ${glyphs.a(xA)}
        </g>
        ${glyphs.comma(cxComma, cyComma, 1, '#8A7BFF')}
      </svg>
    </div>

    <!-- Card 4: Electric Violet Background -->
    <div class="card violet">
      <div class="label">4. Reversed on Electric Violet (#5A46D6)</div>
      <svg viewBox="0 0 440 160" width="440" height="160" xmlns="http://www.w3.org/2000/svg">
        <g id="koma-wordmark" fill="#FFFFFF">
          ${glyphs.k(xK)}
          ${glyphs.o(xO)}
          ${glyphs.m(xM)}
          ${glyphs.a(xA)}
        </g>
        ${glyphs.comma(cxComma, cyComma, 1, '#F7F4EE')}
      </svg>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync('scripts/sandbox.html', htmlContent);

async function capture() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 1000, height: 800 },
    deviceScaleFactor: 2
  });
  await page.goto('file://' + path.resolve('scripts/sandbox.html'));
  await page.screenshot({ path: 'scripts/preview-initial.png' });
  await browser.close();
  console.log('Sandbox rendered successfully to scripts/preview-initial.png');
}

capture().catch(console.error);
