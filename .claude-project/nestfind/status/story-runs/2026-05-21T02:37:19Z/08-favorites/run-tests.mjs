import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const RUN_DIR = '/Users/saifulpotential/Potential/nestfind-sample/.claude-project/nestfind/status/story-runs/2026-05-21T02:37:19Z/08-favorites';
const BASE_URL = 'http://localhost:5173';
const PAGE_PATH = '/08-favorites.html';

mkdirSync(RUN_DIR, { recursive: true });

const consoleErrors = [];
let browser;

try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });

  // ---------- Step 1: AC-1 - View favorites grid ----------
  console.log('\n=== STEP 1: AC-1 ===');
  await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${RUN_DIR}/step-01.png`, fullPage: true });

  const bodyText1 = await page.evaluate(() => document.body.innerText || '');
  const hasContent = bodyText1.length > 20;
  const hasFavoritesContent = /favorite|saved|heart|property/i.test(bodyText1) || bodyText1.toLowerCase().includes('property');
  console.log(`Step 1 - Body text length: ${bodyText1.length}, hasContent: ${hasContent}, favContent: ${hasFavoritesContent}`);
  console.log(`Step 1 - Body preview: ${bodyText1.substring(0, 300)}`);

  // ---------- Step 2: AC-2 - Click card to navigate ----------
  console.log('\n=== STEP 2: AC-2 ===');
  await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Try various card selectors
  const cardBtn = await page.$('a[href*="property"], a[href*="detail"], .property-card, a.card, .card a, [class*="property-card"], a[class*="card"]');
  if (cardBtn) {
    const urlBefore = page.url();
    console.log(`URL before click: ${urlBefore}`);
    await cardBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    console.log(`URL after click: ${urlAfter}`);
    console.log(`Navigation occurred: ${urlBefore !== urlAfter}`);
  } else {
    console.log('Step 2 - No clickable card found');
  }
  await page.screenshot({ path: `${RUN_DIR}/step-02.png`, fullPage: true });

  // ---------- Step 3: AC-3 - Click heart to unfavorite ----------
  console.log('\n=== STEP 3: AC-3 ===');
  await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  let heartBtn = await page.$('.heart, [aria-label*="favorite"], button.favorite, [class*="heart"], [class*="favorite"], [data-testid*="fav"]');
  // Also try button with heart icon
  if (!heartBtn) {
    heartBtn = await page.$('button:has(.heart), button:has([data-icon*="heart"]), [onclick*="preventDefault"]');
  }
  if (heartBtn) {
    const errorsBeforeClick = consoleErrors.length;
    await heartBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
    console.log(`Console errors before: ${errorsBeforeClick}, after: ${consoleErrors.length}`);
  } else {
    console.log('Step 3 - No heart/favorite button found');
  }
  await page.screenshot({ path: `${RUN_DIR}/step-03.png`, fullPage: true });

  // ---------- Step 4: BC-1 - Empty state ----------
  console.log('\n=== STEP 4: BC-1 ===');
  await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const bodyText4 = await page.evaluate(() => document.body.innerText || '');
  console.log(`Step 4 - Body: ${bodyText4.substring(0, 300)}`);
  await page.screenshot({ path: `${RUN_DIR}/step-04.png`, fullPage: true });

  // ---------- Step 5: BC-2 - Remove all favorites ----------
  console.log('\n=== STEP 5: BC-2 ===');
  await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const hearts = await page.$$('.heart, [aria-label*="favorite"], button.favorite, [class*="heart"]');
  console.log(`Found ${hearts.length} heart/favorite buttons`);
  for (let i = 0; i < hearts.length; i++) {
    try {
      await hearts[i].click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log(`Heart ${i} click failed: ${e.message}`);
    }
  }
  await page.screenshot({ path: `${RUN_DIR}/step-05.png`, fullPage: true });

  // ---------- Step 6: ES-1 - Unauthenticated access ----------
  console.log('\n=== STEP 6: ES-1 ===');
  await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const bodyText6 = await page.evaluate(() => document.body.innerText || '');
  console.log(`Step 6 - Body text length: ${bodyText6.length}, has white screen: ${bodyText6.length < 10}`);
  await page.screenshot({ path: `${RUN_DIR}/step-06.png`, fullPage: true });

  // ---------- Step 7: ES-2 - Remove favorite no crash ----------
  console.log('\n=== STEP 7: ES-2 ===');
  await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const heartBtn7 = await page.$('.heart, [aria-label*="favorite"], button.favorite, [class*="heart"], [class*="favorite"], [data-testid*="fav"]');
  if (heartBtn7) {
    const errsBefore7 = consoleErrors.length;
    await heartBtn7.click().catch(() => {});
    await page.waitForTimeout(1000);
    const errsAfter7 = consoleErrors.length;
    console.log(`Console errors before: ${errsBefore7}, after: ${errsAfter7}, no new errors: ${errsAfter7 === errsBefore7}`);
  } else {
    console.log('Step 7 - No heart/favorite button found');
  }
  await page.screenshot({ path: `${RUN_DIR}/step-07.png`, fullPage: true });

  // ---------- Step 8: ES-3 - No console errors, content renders ----------
  console.log('\n=== STEP 8: ES-3 ===');
  await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const bodyText8 = await page.evaluate(() => document.body.innerText || '');
  const hasBodyContent = bodyText8.trim().length > 10;
  console.log(`Step 8 - Body content length: ${bodyText8.length}, empty: ${!hasBodyContent}`);
  console.log(`Step 8 - Total console errors: ${consoleErrors.length}`);
  console.log(`Step 8 - Body preview: ${bodyText8.substring(0, 300)}`);
  await page.screenshot({ path: `${RUN_DIR}/step-08.png`, fullPage: true });

  // Final summary
  console.log('\n=== FINAL SUMMARY ===');
  console.log(`Total console errors across all steps: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors:');
    consoleErrors.forEach((e, i) => console.log(`  ${i + 1}: ${e}`));
  }

} catch (err) {
  console.error('CRASH:', err.message);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
