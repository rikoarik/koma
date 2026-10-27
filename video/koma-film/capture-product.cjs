const { chromium } = require('playwright-core');
const path = require('node:path');
const fs = require('node:fs');
(async()=>{
  const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  const page=await browser.newPage({viewport:{width:430,height:850},deviceScaleFactor:2});
  const out=path.join(__dirname,'assets','screens'); fs.mkdirSync(out,{recursive:true});
  await page.goto('https://ruangkoma.web.id',{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(out,'home-mobile.png')});
  console.log('BUTTONS',await page.getByRole('button').allTextContents());
  const button=page.getByRole('button',{name:/Tulis Coretan Pertama/}).first();
  await button.click(); await page.waitForTimeout(350);
  await page.screenshot({path:path.join(out,'composer-mobile.png')});
  console.log('COMPOSER',await page.locator('body').innerText());
  const studio=page.getByRole('button',{name:/studio|inspirasi/i}).first();
  if(await studio.count()){
    await studio.click();await page.waitForTimeout(300);
    await page.screenshot({path:path.join(out,'studio-mobile.png')});
    console.log('STUDIO',await page.locator('body').innerText());
  }
  await browser.close();
})();
