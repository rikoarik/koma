// scripts/refine-typography.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

// Exact geometric formulas for flawless typography

function getWordmarkV1(startX, color = '#1D1B18') {
  // Option 1: Clean Contemporary Neo-Grotesk / Geometric Editorial
  // Stroke = 17.5px. Ascender = 24px, x-height = 56px..112px, Baseline = 112px.
  
  // 'k'
  // Stem: 24 to 112 (height 88)
  const xK = startX;
  const kPath = `
    <!-- 'k' vertical stem -->
    <rect x="${xK}" y="24" width="17" height="88" rx="1" />
    <!-- 'k' diagonals unified as a single seamless path -->
    <path d="
      M ${xK + 16.5} 82
      L ${xK + 54} 56
      L ${xK + 73} 56
      L ${xK + 34} 83
      L ${xK + 74} 112
      L ${xK + 53} 112
      L ${xK + 23} 90.5
      L ${xK + 16.5} 95.5
      Z
    " />
  `;

  // 'o': Balanced circular geometry
  const xO = xK + 83;
  const oPath = `
    <path fill-rule="evenodd" d="
      M ${xO + 29} 55
      A 29 28.5 0 1 1 ${xO + 28.9} 55
      Z
      M ${xO + 29} 72
      A 12 11.5 0 1 0 ${xO + 29.1} 72
      Z
    " />
  `;

  // 'm': Fluid contemporary shoulders with optical thinning at joins
  const xM = xO + 69;
  const mPath = `
    <path d="
      M ${xM} 56
      L ${xM + 16.5} 56
      L ${xM + 16.5} 67.5
      C ${xM + 22} 59.5, ${xM + 30.5} 55, ${xM + 42} 55
      C ${xM + 53} 55, ${xM + 60.5} 61, ${xM + 64} 70
      C ${xM + 70} 59.5, ${xM + 79} 55, ${xM + 90} 55
      C ${xM + 103} 55, ${xM + 110.5} 63.5, ${xM + 110.5} 78
      L ${xM + 110.5} 112
      L ${xM + 94} 112
      L ${xM + 94} 79.5
      C ${xM + 94} 73.5, ${xM + 90.5} 70, ${xM + 84} 70
      C ${xM + 77} 70, ${xM + 72} 74.5, ${xM + 72} 82
      L ${xM + 72} 112
      L ${xM + 55.5} 112
      L ${xM + 55.5} 79.5
      C ${xM + 55.5} 73.5, ${xM + 52} 70, ${xM + 45.5} 70
      C ${xM + 38.5} 70, ${xM + 33.5} 74.5, ${xM + 33.5} 82
      L ${xM + 33.5} 112
      L ${xM} 112
      Z
    " />
  `;

  // 'a': Single-story editorial geometric 'a'
  const xA = xM + 120;
  const aPath = `
    <path fill-rule="evenodd" d="
      M ${xA + 27} 55
      C ${xA + 42.5} 55, ${xA + 54} 65.5, ${xA + 56.5} 77
      L ${xA + 56.5} 56
      L ${xA + 73} 56
      L ${xA + 73} 112
      L ${xA + 57} 112
      L ${xA + 57} 101.5
      C ${xA + 53} 108.5, ${xA + 43} 113, ${xA + 29} 113
      C ${xA + 12.5} 113, ${xA} 99.5, ${xA} 84
      C ${xA} 68, ${xA + 12.5} 55, ${xA + 27} 55
      Z
      M ${xA + 30} 71.5
      C ${xA + 19.5} 71.5, ${xA + 16.5} 77, ${xA + 16.5} 84
      C ${xA + 16.5} 91, ${xA + 19.5} 96.5, ${xA + 30} 96.5
      C ${xA + 40} 96.5, ${xA + 56.5} 90.5, ${xA + 56.5} 84
      C ${xA + 56.5} 77.5, ${xA + 40} 71.5, ${xA + 30} 71.5
      Z
    " />
  `;

  return {
    k: kPath,
    o: oPath,
    m: mPath,
    a: aPath,
    endX: xA + 73
  };
}

// 3 Variations of the Comma Symbol
const commaVariants = {
  // Variant A: The Editorial Teardrop (Iconic, fluid, bold circular head with high-tension swoop)
  editorial: (cx, cy, scale = 1, fill = '#5A46D6') => {
    const r = 16 * scale;
    return `
      <path fill="${fill}" d="
        M ${cx - r} ${cy}
        A ${r} ${r} 0 0 1 ${cx + r} ${cy}
        C ${cx + r} ${cy + r * 0.9}, ${cx + r * 0.55} ${cy + 28 * scale}, ${cx - 15 * scale} ${cy + 36 * scale}
        C ${cx - 11 * scale} ${cy + 31 * scale}, ${cx - 4 * scale} ${cy + 22 * scale}, ${cx - 3 * scale} ${cy + 16 * scale}
        C ${cx - 3 * scale} ${cy + 15 * scale}, ${cx - r} ${cy + 12 * scale}, ${cx - r} ${cy}
        Z
      " />
    `;
  },

  // Variant B: The Kinetic Punctuation (Precise geometric circle + dynamic tapered tail with modern cut)
  kinetic: (cx, cy, scale = 1, fill = '#5A46D6') => {
    const r = 16 * scale;
    return `
      <path fill="${fill}" d="
        M ${cx} ${cy - r}
        A ${r} ${r} 0 0 1 ${cx + r} ${cy}
        C ${cx + r} ${cy + 13 * scale}, ${cx + 7 * scale} ${cy + 27 * scale}, ${cx - 16 * scale} ${cy + 37 * scale}
        L ${cx - 11.5 * scale} ${cy + 33 * scale}
        C ${cx - 1 * scale} ${cy + 24 * scale}, ${cx + 0.5 * scale} ${cy + 18 * scale}, ${cx - 0.5 * scale} ${cy + 15.5 * scale}
        C ${cx - 9 * scale} ${cy + 15.5 * scale}, ${cx - r} ${cy + 9 * scale}, ${cx - r} ${cy}
        A ${r} ${r} 0 0 1 ${cx} ${cy - r}
        Z
      " />
    `;
  },

  // Variant C: The Pause Pebble (Slightly softer organic silhouette, warm indie zine feel)
  pebble: (cx, cy, scale = 1, fill = '#5A46D6') => {
    const r = 16.5 * scale;
    return `
      <path fill="${fill}" d="
        M ${cx} ${cy - r}
        C ${cx + r * 0.95} ${cy - r}, ${cx + r} ${cy - r * 0.5}, ${cx + r} ${cy}
        C ${cx + r} ${cy + 12 * scale}, ${cx + 8 * scale} ${cy + 24 * scale}, ${cx - 14 * scale} ${cy + 35 * scale}
        C ${cx - 17 * scale} ${cy + 37 * scale}, ${cx - 14 * scale} ${cy + 33 * scale}, ${cx - 10 * scale} ${cy + 28 * scale}
        C ${cx - 2 * scale} ${cy + 18 * scale}, ${cx + 1 * scale} ${cy + 14 * scale}, ${cx - 2 * scale} ${cy + 12 * scale}
        C ${cx - 9 * scale} ${cy + 12 * scale}, ${cx - r} ${cy + 7 * scale}, ${cx - r} ${cy}
        C ${cx - r} ${cy - r * 0.6}, ${cx - r * 0.6} ${cy - r}, ${cx} ${cy - r}
        Z
      " />
    `;
  }
};

const wm = getWordmarkV1(40);
const commaX = wm.endX + 22; // snug optical kerning
const commaY = 96; // resting at baseline

const testHtml = `
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
    h2 {
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 16px;
      color: #524E48;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E5E0D5;
      border-radius: 10px;
      padding: 24px;
    }
    .card.dark {
      background: #1D1B18;
      border-color: #2D2A26;
      color: #F7F4EE;
    }
    .title {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #5A46D6;
    }
    .dark .title {
      color: #9B8EFF;
    }
    svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .icon-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 16px;
    }
    .icon-box {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: #1D1B18;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-box.violet {
      background: #5A46D6;
    }
    .icon-box.paper {
      background: #F7F4EE;
      border: 1px solid #DCCDBB;
    }
  </style>
</head>
<body>
  <h2>Comma Symbol Exploration: 3 Refined Directions</h2>

  <div class="row">
    <!-- Direction 1: The Editorial Teardrop -->
    <div class="card">
      <div class="title">DIRECTION A: THE EDITORIAL TEARDROP</div>
      <svg viewBox="0 0 440 160">
        <g id="koma-wordmark" fill="#1D1B18">
          ${wm.k}
          ${wm.o}
          ${wm.m}
          ${wm.a}
        </g>
        <g id="koma-symbol">
          ${commaVariants.editorial(commaX, commaY, 1, '#5A46D6')}
        </g>
      </svg>
      <div class="icon-preview">
        <div class="icon-box violet">
          <svg viewBox="0 0 80 80" width="40" height="40">
            ${commaVariants.editorial(40, 36, 1.25, '#FFFFFF')}
          </svg>
        </div>
        <div class="icon-box">
          <svg viewBox="0 0 80 80" width="40" height="40">
            ${commaVariants.editorial(40, 36, 1.25, '#5A46D6')}
          </svg>
        </div>
        <div class="icon-box paper">
          <svg viewBox="0 0 80 80" width="40" height="40">
            ${commaVariants.editorial(40, 36, 1.25, '#1D1B18')}
          </svg>
        </div>
      </div>
    </div>

    <!-- Direction 2: The Kinetic Punctuation -->
    <div class="card">
      <div class="title">DIRECTION B: THE KINETIC PUNCTUATION</div>
      <svg viewBox="0 0 440 160">
        <g id="koma-wordmark" fill="#1D1B18">
          ${wm.k}
          ${wm.o}
          ${wm.m}
          ${wm.a}
        </g>
        <g id="koma-symbol">
          ${commaVariants.kinetic(commaX, commaY, 1, '#5A46D6')}
        </g>
      </svg>
      <div class="icon-preview">
        <div class="icon-box violet">
          <svg viewBox="0 0 80 80" width="40" height="40">
            ${commaVariants.kinetic(40, 36, 1.25, '#FFFFFF')}
          </svg>
        </div>
        <div class="icon-box">
          <svg viewBox="0 0 80 80" width="40" height="40">
            ${commaVariants.kinetic(40, 36, 1.25, '#5A46D6')}
          </svg>
        </div>
        <div class="icon-box paper">
          <svg viewBox="0 0 80 80" width="40" height="40">
            ${commaVariants.kinetic(40, 36, 1.25, '#1D1B18')}
          </svg>
        </div>
      </div>
    </div>

    <!-- Direction 3: The Pause Pebble -->
    <div class="card">
      <div class="title">DIRECTION C: THE PAUSE PEBBLE</div>
      <svg viewBox="0 0 440 160">
        <g id="koma-wordmark" fill="#1D1B18">
          ${wm.k}
          ${wm.o}
          ${wm.m}
          ${wm.a}
        </g>
        <g id="koma-symbol">
          ${commaVariants.pebble(commaX, commaY, 1, '#5A46D6')}
        </g>
      </svg>
      <div class="icon-preview">
        <div class="icon-box violet">
          <svg viewBox="0 0 80 80" width="40" height="40">
            ${commaVariants.pebble(40, 36, 1.25, '#FFFFFF')}
          </svg>
        </div>
        <div class="icon-box">
          <svg viewBox="0 0 80 80" width="40" height="40">
            ${commaVariants.pebble(40, 36, 1.25, '#5A46D6')}
          </svg>
        </div>
        <div class="icon-box paper">
          <svg viewBox="0 0 80 80" width="40" height="40">
            ${commaVariants.pebble(40, 36, 1.25, '#1D1B18')}
          </svg>
        </div>
      </div>
    </div>
  </div>

  <h2>Monochrome & High Contrast Inversions (Direction A)</h2>
  <div class="row">
    <div class="card dark">
      <div class="title">INVERTED ON INK (#1D1B18)</div>
      <svg viewBox="0 0 440 160">
        <g id="koma-wordmark" fill="#F7F4EE">
          ${wm.k}
          ${wm.o}
          ${wm.m}
          ${wm.a}
        </g>
        <g id="koma-symbol">
          ${commaVariants.editorial(commaX, commaY, 1, '#9B8EFF')}
        </g>
      </svg>
    </div>

    <div class="card dark">
      <div class="title">PURE MONOCHROME PAPER ON INK</div>
      <svg viewBox="0 0 440 160">
        <g id="koma-wordmark" fill="#F7F4EE">
          ${wm.k}
          ${wm.o}
          ${wm.m}
          ${wm.a}
        </g>
        <g id="koma-symbol">
          ${commaVariants.editorial(commaX, commaY, 1, '#F7F4EE')}
        </g>
      </svg>
    </div>

    <div class="card">
      <div class="title">PURE MONOCHROME INK ON PAPER</div>
      <svg viewBox="0 0 440 160">
        <g id="koma-wordmark" fill="#1D1B18">
          ${wm.k}
          ${wm.o}
          ${wm.m}
          ${wm.a}
        </g>
        <g id="koma-symbol">
          ${commaVariants.editorial(commaX, commaY, 1, '#1D1B18')}
        </g>
      </svg>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync('scripts/typography-test.html', testHtml);

async function render() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 950 },
    deviceScaleFactor: 2
  });
  await page.goto('file://' + path.resolve('scripts/typography-test.html'));
  await page.screenshot({ path: 'scripts/preview-refinement.png' });
  await browser.close();
  console.log('Saved to scripts/preview-refinement.png');
}

render().catch(console.error);
