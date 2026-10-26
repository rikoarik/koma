const { chromium } = require('playwright-core');
const path = require('path');

async function test() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });

  console.log('Navigating to http://localhost:3000/jelajah...');
  await page.goto('http://localhost:3000/jelajah', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.innerText && btn.innerText.includes('Tulis Coretan'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });

  await page.waitForSelector('text=Tumpahkan isi kepalamu', { timeout: 10000 });
  await page.waitForTimeout(500);

  const modal = await page.$('div.relative.w-full.max-w-xl');

  // Open visual dropdown
  await page.click('button[aria-label="Lampiran Visual Zine"]');
  await page.waitForTimeout(300);

  // Click "Zine Menulis" option
  await page.click('li:has-text("Zine Menulis")');
  await page.waitForTimeout(400);

  // Capture screenshot with Zine Menulis selected
  await modal.screenshot({
    path: path.join(__dirname, '../docs/screenshots/verification/shot-dropdown-selected-state.png'),
  });
  console.log('Saved docs/screenshots/verification/shot-dropdown-selected-state.png');

  await browser.close();
  console.log('Done test selection!');
}

test().catch(console.error);
