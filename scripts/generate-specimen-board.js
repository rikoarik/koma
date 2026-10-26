// scripts/generate-specimen-board.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const svgDir = path.resolve('public/brand/svg');
const readSVG = (filename) => fs.readFileSync(path.join(svgDir, filename), 'utf8');

const logoColor = readSVG('koma-logo-horizontal-color.svg');
const logoInk = readSVG('koma-logo-horizontal-ink.svg');
const logoPaper = readSVG('koma-logo-horizontal-paper.svg');
const logoDark = readSVG('koma-logo-horizontal-dark.svg');
const symbolViolet = readSVG('koma-symbol-violet.svg');
const symbolInk = readSVG('koma-symbol-ink.svg');
const symbolPaper = readSVG('koma-symbol-paper.svg');
const appIconViolet = readSVG('koma-app-icon-violet.svg');
const appIconInk = readSVG('koma-app-icon-ink.svg');
const stackedColor = readSVG('koma-logo-stacked-color.svg');
const favicon = readSVG('favicon.svg');

const specimenHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>KOMA Brand Identity Specimen</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 48px;
      background: #F7F4EE;
      color: #1D1B18;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid #1D1B18;
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    .brand-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 14px;
      font-weight: 500;
      color: #524E48;
      margin-top: 6px;
    }
    .meta-tag {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: #5A46D6;
      color: #F7F4EE;
      padding: 6px 12px;
      border-radius: 4px;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #524E48;
      margin: 36px 0 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #DCCDBB;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 20px;
    }

    .card {
      background: #FFFFFF;
      border: 1px solid #E5E0D5;
      border-radius: 12px;
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 200px;
      position: relative;
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
    .card.paper-pattern {
      background: #F7F4EE;
      border: 1px dashed #DCCDBB;
    }

    .card-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #524E48;
      margin-bottom: 20px;
    }
    .dark .card-label {
      color: #A39E93;
    }
    .violet .card-label {
      color: #D6D0FF;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      padding: 10px 0;
    }
    .logo-container svg {
      max-width: 100%;
      height: auto;
      max-height: 80px;
    }

    .card-footer {
      font-size: 11px;
      color: #7A746B;
      margin-top: 16px;
      font-mono;
    }
    .dark .card-footer {
      color: #8C867B;
    }
    .violet .card-footer {
      color: #C3BDFF;
    }

    .color-swatches {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 12px;
    }
    .swatch {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #E5E0D5;
      background: #FFFFFF;
    }
    .swatch-color {
      height: 60px;
      width: 100%;
    }
    .swatch-info {
      padding: 12px;
    }
    .swatch-name {
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .swatch-hex {
      font-size: 11px;
      font-family: monospace;
      color: #524E48;
    }

    .concept-box {
      background: #FFFFFF;
      border-left: 4px solid #5A46D6;
      border-radius: 0 8px 8px 0;
      padding: 20px 24px;
      margin-bottom: 32px;
    }
    .concept-quote {
      font-size: 16px;
      font-weight: 500;
      font-style: italic;
      color: #1D1B18;
      margin-bottom: 6px;
    }
    .concept-desc {
      font-size: 13px;
      color: #524E48;
      line-height: 1.5;
    }

    .favicon-row {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 10px;
    }
    .fav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .fav-item span {
      font-size: 10px;
      color: #524E48;
      font-family: monospace;
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1 class="brand-title">koma,</h1>
      <div class="brand-subtitle">Brand Identity System & Vector Specifications — Indonesian Digital Hangout</div>
    </div>
    <div class="meta-tag">Art Direction: Contemporary Editorial</div>
  </div>

  <div class="concept-box">
    <div class="concept-quote">"Sebuah jeda, bukan akhir kalimat." (A pause, not an ending.)</div>
    <div class="concept-desc">
      In contemporary indie internet culture, the comma represents spontaneous thoughts mid-flow, an open invitation for others to finish the sentence, and a restorative pause between life's noise. The identity pairs precision Swiss-editorial lowercase geometry with a confident, kinetic comma symbol.
    </div>
  </div>

  <div class="section-title">01. Primary Horizontal Logo Lockups</div>
  <div class="grid-2">
    <!-- Card 1: Primary Editorial Color -->
    <div class="card">
      <div class="card-label">Primary Colorway (Ink + Electric Violet on Paper)</div>
      <div class="logo-container">
        ${logoColor}
      </div>
      <div class="card-footer">Asset: koma-logo-horizontal-color.svg / .png</div>
    </div>

    <!-- Card 2: Monochrome Ink -->
    <div class="card">
      <div class="card-label">Monochrome Ink (Print, Newsprint, Editorial)</div>
      <div class="logo-container">
        ${logoInk}
      </div>
      <div class="card-footer">Asset: koma-logo-horizontal-ink.svg / .png</div>
    </div>

    <!-- Card 3: Reverse on Ink Dark Mode -->
    <div class="card dark">
      <div class="card-label">Dark Mode / Night Reading (#1D1B18)</div>
      <div class="logo-container">
        ${logoDark}
      </div>
      <div class="card-footer">Asset: koma-logo-horizontal-dark.svg / .png</div>
    </div>

    <!-- Card 4: Pure Paper Reverse -->
    <div class="card violet">
      <div class="card-label">Electric Violet Campaign Canvas (#5A46D6)</div>
      <div class="logo-container">
        ${logoPaper}
      </div>
      <div class="card-footer">Asset: koma-logo-horizontal-paper.svg / .png</div>
    </div>
  </div>

  <div class="section-title">02. Standalone Symbol & App Icon (Scroll-Craft Ready)</div>
  <div class="grid-4">
    <!-- Icon 1 -->
    <div class="card" style="align-items: center; text-align: center;">
      <div class="card-label">Violet Symbol Mark</div>
      <div class="logo-container" style="width: 80px; height: 80px;">
        ${symbolViolet}
      </div>
      <div class="card-footer">koma-symbol-violet.svg</div>
    </div>

    <!-- Icon 2 -->
    <div class="card" style="align-items: center; text-align: center;">
      <div class="card-label">Ink Symbol Mark</div>
      <div class="logo-container" style="width: 80px; height: 80px;">
        ${symbolInk}
      </div>
      <div class="card-footer">koma-symbol-ink.svg</div>
    </div>

    <!-- Icon 3 -->
    <div class="card violet" style="align-items: center; text-align: center;">
      <div class="card-label">iOS / App Icon (Violet)</div>
      <div class="logo-container" style="width: 80px; height: 80px;">
        ${appIconViolet}
      </div>
      <div class="card-footer">koma-app-icon-512.png</div>
    </div>

    <!-- Icon 4 -->
    <div class="card dark" style="align-items: center; text-align: center;">
      <div class="card-label">App Icon (Ink Charcoal)</div>
      <div class="logo-container" style="width: 80px; height: 80px;">
        ${appIconInk}
      </div>
      <div class="card-footer">koma-app-icon-ink-512.png</div>
    </div>
  </div>

  <div class="section-title">03. Stacked Lockup & Favicon Fidelity</div>
  <div class="grid-2">
    <!-- Stacked Card -->
    <div class="card">
      <div class="card-label">Vertical / Stacked Poster Lockup</div>
      <div class="logo-container">
        ${stackedColor}
      </div>
      <div class="card-footer">Asset: koma-logo-stacked-color.svg / .png</div>
    </div>

    <!-- Favicon scale test -->
    <div class="card paper-pattern">
      <div class="card-label">Favicon Multi-Scale Optical Legibility</div>
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div class="favicon-row">
          <div class="fav-item" style="min-width: 32px;">
            <div style="width: 16px; height: 16px;">${favicon}</div>
            <span style="font-size: 10px; margin-top: 4px;">16px</span>
          </div>
          <div class="fav-item" style="min-width: 32px;">
            <div style="width: 24px; height: 24px;">${favicon}</div>
            <span style="font-size: 10px; margin-top: 4px;">24px</span>
          </div>
          <div class="fav-item" style="min-width: 36px;">
            <div style="width: 32px; height: 32px;">${favicon}</div>
            <span style="font-size: 10px; margin-top: 4px;">32px</span>
          </div>
          <div class="fav-item" style="min-width: 48px;">
            <div style="width: 48px; height: 48px;">${favicon}</div>
            <span style="font-size: 10px; margin-top: 4px;">48px</span>
          </div>
          <div class="fav-item" style="min-width: 64px;">
            <div style="width: 64px; height: 64px;">${favicon}</div>
            <span style="font-size: 10px; margin-top: 4px;">64px</span>
          </div>
        </div>
      </div>
      <div class="card-footer">Tested at 16px browser tab resolution with optical contrast tuning</div>
    </div>
  </div>

  <div class="section-title">04. Brand Color Palette</div>
  <div class="color-swatches">
    <div class="swatch">
      <div class="swatch-color" style="background: #1D1B18;"></div>
      <div class="swatch-info">
        <div class="swatch-name">Tinta Arang (Ink)</div>
        <div class="swatch-hex">#1D1B18 &bull; RGB(29, 27, 24)</div>
      </div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background: #5A46D6;"></div>
      <div class="swatch-info">
        <div class="swatch-name">Electric Violet</div>
        <div class="swatch-hex">#5A46D6 &bull; RGB(90, 70, 214)</div>
      </div>
    </div>
    <div class="swatch">
      <div class="swatch-color" style="background: #F7F4EE; border-bottom: 1px solid #E5E0D5;"></div>
      <div class="swatch-info">
        <div class="swatch-name">Kertas Hangat (Warm Paper)</div>
        <div class="swatch-hex">#F7F4EE &bull; RGB(247, 244, 238)</div>
      </div>
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync('scripts/brand-specimen.html', specimenHtml);

async function captureSpecimen() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1650 },
    deviceScaleFactor: 2
  });
  await page.goto('file://' + path.resolve('scripts/brand-specimen.html'));
  await page.screenshot({ path: 'public/brand/png/koma-brand-specimen.png', fullPage: true });
  await browser.close();
  console.log('Brand specimen sheet rendered to public/brand/png/koma-brand-specimen.png');
}

captureSpecimen().catch(console.error);
