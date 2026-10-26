const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const outputDir = path.join(__dirname, '../docs/screenshots/admin');
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('Navigating to http://localhost:3001/admin ...');
  await page.goto('http://localhost:3001/admin', { waitUntil: 'networkidle' });

  // 1. Screenshot login page
  await page.screenshot({ path: path.join(outputDir, 'admin-1-login.png'), fullPage: true });
  console.log('Captured docs/screenshots/admin/admin-1-login.png');

  // 2. Fill password and login
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('[SECURITY ERROR] ADMIN_PASSWORD environment variable is required to capture authenticated screens.');
    await browser.close();
    process.exit(1);
  }
  await page.fill('input[type="password"]', adminPassword);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // 3. Screenshot Overview
  await page.screenshot({ path: path.join(outputDir, 'admin-2-overview.png') });
  console.log('Captured docs/screenshots/admin/admin-2-overview.png');

  // 4. Navigate to Analytics
  await page.click('button:has-text("Analitik Riil & Tren")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin-3-analytics.png') });
  console.log('Captured docs/screenshots/admin/admin-3-analytics.png');

  // 5. Navigate to Content
  await page.click('button:has-text("Arsip & Kelola Coretan")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin-4-content.png') });
  console.log('Captured docs/screenshots/admin/admin-4-content.png');

  // 6. Navigate to Moderation
  await page.click('button:has-text("Antrean Laporan")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin-5-moderation.png') });
  console.log('Captured docs/screenshots/admin/admin-5-moderation.png');

  // 7. Navigate to Rules
  await page.click('button:has-text("Aturan & Kata Terlarang")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin-6-rules.png') });
  console.log('Captured docs/screenshots/admin/admin-6-rules.png');

  // 8. Navigate to AI Studio
  await page.click('button:has-text("Status & Penggunaan AI")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin-7-ai.png') });
  console.log('Captured docs/screenshots/admin/admin-7-ai.png');

  // 9. Navigate to Donations
  await page.click('button:has-text("Traktir Kopi & QRIS")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin-8-donations.png') });
  console.log('Captured docs/screenshots/admin/admin-8-donations.png');

  // 10. Navigate to System
  await page.click('button:has-text("Sistem & Audit Log")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin-9-system.png') });
  console.log('Captured docs/screenshots/admin/admin-9-system.png');

  // Mobile Viewport test
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3001/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'admin-10-mobile.png') });
  console.log('Captured docs/screenshots/admin/admin-10-mobile.png');

  await browser.close();
  console.log('All visual captures complete!');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
