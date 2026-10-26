// scripts/generate-brand-icons.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const iconsDir = path.resolve('public/brand/svg/icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Individual SVG definitions with currentColor for infinite theme adaptability
const iconDefinitions = {
  // 1. Dengerin (Mug with gentle steam - replacing ☕)
  'reaction-dengerin': {
    name: 'Aku Dengerin (Hot Beverage / Steam Mug)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17 8h1a3 3 0 0 1 0 6h-1" />
  <path d="M4 8h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
  <path d="M7 2c0 1.5 1 2 1 3" />
  <path d="M11 1c0 2 1.5 2.5 1.5 4" />
</svg>`
  },

  // 2. Relate (Sculpted flat heart - replacing 🖤)
  'reaction-relate': {
    name: 'Relate (Resonant Heart)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
</svg>`
  },

  // 3. Senyum (Botanical twin sprout - replacing 🌿)
  'reaction-senyum': {
    name: 'Senyum (Fresh Botanical Sprout)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 21v-9" />
  <path d="M12 12C8.5 12 5 9.5 5 5c4.5 0 7 2.5 7 7z" fill="currentColor" fill-opacity="0.25" />
  <path d="M12 15c3.5 0 6-2 6-6-4 0-6 2.5-6 6z" fill="currentColor" fill-opacity="0.25" />
  <path d="M8 21h8" />
</svg>`
  },

  // 4. Peluk (Two figures leaning into a warm embrace - replacing 🫂)
  'reaction-peluk': {
    name: 'Peluk Jauh (Gentle Embrace / Warm Hug)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="9" cy="6" r="2.5" fill="currentColor" />
  <circle cx="15" cy="6" r="2.5" fill="currentColor" />
  <path d="M4 19c0-3.5 2.5-6 6-6h4c3.5 0 6 2.5 6 6" />
  <path d="M7 14.5c2 1.5 5 1.5 7 0" />
  <path d="M9.5 17.5c1.5 1 3.5 1 5 0" />
</svg>`
  },

  // 5. Sparkle (Editorial 4-point star with sparks - replacing ✨)
  'badge-sparkle': {
    name: 'Dibantu AI (Editorial Sparkle)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
  <path d="M19 2.5L19.7 4.3L21.5 5L19.7 5.7L19 7.5L18.3 5.7L16.5 5L18.3 4.3L19 2.5Z" />
  <path d="M5 16.5L5.6 17.9L7 18.5L5.6 19.1L5 20.5L4.4 19.1L3 18.5L4.4 17.9L5 16.5Z" />
</svg>`
  },

  // 6. Shield (Editorial privacy/ethics shield with checkmark - replacing 🛡️)
  'badge-shield': {
    name: 'Prinsip Etika & Privasi (Shield Guard)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fill-opacity="0.18" />
  <path d="M9 12l2 2 4-4" />
</svg>`
  },

  // 7. Star (Editorial diamond 4-point star - replacing ★)
  'badge-star': {
    name: 'Terbit Seketika (Instant Star)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2L14.3 9.7L22 12L14.3 14.3L12 22L9.7 14.3L2 12L9.7 9.7L12 2Z" />
</svg>`
  },

  // 8. Checkmark (Crisp editorial verification mark - replacing ✓)
  'badge-check': {
    name: 'Verifikasi Editorial (Checkmark)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="20 6 9 17 4 12" />
</svg>`
  }
};

// Write each SVG to public/brand/svg/icons/
for (const [key, item] of Object.entries(iconDefinitions)) {
  const filePath = path.join(iconsDir, `${key}.svg`);
  fs.writeFileSync(filePath, item.svg.trim() + '\n');
  console.log(`Generated: ${filePath}`);
}

// Build preview HTML
const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>KOMA Brand Icons Specimen</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 40px;
      background: #F7F4EE;
      color: #1D1B18;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 8px;
    }
    p {
      color: #524E48;
      font-size: 14px;
      margin: 0 0 32px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E5E0D5;
      border-radius: 10px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .card.dark {
      background: #1D1B18;
      border-color: #2D2A26;
      color: #F7F4EE;
    }
    .icon-wrapper {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      color: #5A46D6;
    }
    .dark .icon-wrapper {
      color: #9B8EFF;
    }
    .icon-wrapper svg {
      width: 32px;
      height: 32px;
    }
    .name {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .sub {
      font-size: 11px;
      color: #7A746B;
      font-family: monospace;
    }
    .dark .sub {
      color: #A39E93;
    }
    .scale-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #F0ECE4;
      width: 100%;
      justify-content: center;
    }
    .dark .scale-row {
      border-top-color: #2F2C27;
    }
    .scale-row svg {
      color: #1D1B18;
    }
    .dark .scale-row svg {
      color: #F7F4EE;
    }
  </style>
</head>
<body>
  <h1>KOMA Brand Icons — Emoji Replacements (Pure Vector SVGs)</h1>
  <p>Custom flat-vector icons replacing unicode emojis across reactions, ethics badges, and UI micro-indicators.</p>

  <div class="grid">
    ${Object.entries(iconDefinitions).map(([key, item]) => `
      <div class="card">
        <div class="icon-wrapper">
          ${item.svg}
        </div>
        <div class="name">${item.name}</div>
        <div class="sub">${key}.svg</div>
        <div class="scale-row">
          <div style="width: 14px; height: 14px;">${item.svg}</div>
          <div style="width: 18px; height: 18px;">${item.svg}</div>
          <div style="width: 24px; height: 24px;">${item.svg}</div>
        </div>
      </div>
    `).join('')}
  </div>

  <h2 style="font-size: 16px; margin: 40px 0 16px; text-transform: uppercase; letter-spacing: 0.05em; color: #524E48;">
    Reactions in Dark Mode & Button Preview
  </h2>

  <div class="grid">
    ${['reaction-dengerin', 'reaction-relate', 'reaction-senyum', 'reaction-peluk'].map(key => {
      const item = iconDefinitions[key];
      return `
        <div class="card dark">
          <div class="icon-wrapper">
            ${item.svg}
          </div>
          <div class="name">${item.name}</div>
          <div class="sub">${key}.svg</div>
          <div class="scale-row">
            <div style="width: 14px; height: 14px;">${item.svg}</div>
            <div style="width: 18px; height: 18px;">${item.svg}</div>
            <div style="width: 24px; height: 24px;">${item.svg}</div>
          </div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>
`;

fs.writeFileSync('scripts/icons-specimen.html', testHtml);

async function capture() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 950 },
    deviceScaleFactor: 2
  });
  await page.goto('file://' + path.resolve('scripts/icons-specimen.html'));
  await page.screenshot({ path: 'scripts/preview-icons.png', fullPage: true });
  await browser.close();
  console.log('Saved icons preview to scripts/preview-icons.png');
}

capture().catch(console.error);
