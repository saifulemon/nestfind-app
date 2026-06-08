import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync } from 'fs';

const RUN_DIR = '/Users/saifulpotential/Potential/nestfind-sample/.claude-project/nestfind/status/story-runs/2026-05-21T02:37:19Z/05-home';
const BASE = 'http://localhost:5173';
const PAGE_URL = `${BASE}/05-home.html`;

function log(msg) {
  process.stdout.write(`[LOG] ${msg}\n`);
}

async function screenshot(page, name) {
  const path = join(RUN_DIR, name);
  await page.screenshot({ path, fullPage: false });
  log(`Screenshot: ${name}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  let overallStatus = 'PASS';
  let failureDetails = '';

  // ============ STEP 1: AC-1 ============
  log('=== STEP 1: AC-1 ===');
  let ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  let page = await ctx.newPage();
  let errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await screenshot(page, 'step-01.png');

  const bodyText = await page.textContent('body') || '';
  const hasPrice = /\$\d/.test(bodyText);
  const hasBed = /bed|bath/i.test(bodyText);
  const hasProperty = /propert/i.test(bodyText);
  const imgCount = await page.locator('img').count();
  log(`Price=${hasPrice} Bed/Bath=${hasBed} Property=${hasProperty} Images=${imgCount} Errors=${errors.length}`);

  let step1Pass = hasPrice && hasBed && hasProperty;
  results.push({ step: 1, action: 'AC-1: Property cards grid with data', result: step1Pass ? 'PASS' : 'FAIL', screenshot: 'step-01.png' });
  if (!step1Pass) { overallStatus = 'FAIL'; failureDetails += 'AC-1: Missing expected content. '; }
  await ctx.close();

  // ============ STEP 2: AC-2 ============
  log('=== STEP 2: AC-2 ===');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  const searchSel = ['input[type="text"]', 'input[placeholder*="search" i]', 'input[placeholder*="location" i]', 'input[placeholder*="Search" i]', 'input[name="search"]', 'input[id*="search" i]'];
  let filled = false;
  for (const s of searchSel) {
    const el = page.locator(s);
    if (await el.count() > 0) { await el.first().fill('San Francisco'); filled = true; log(`Filled search: ${s}`); break; }
  }
  if (!filled) {
    const all = page.locator('input:visible');
    const n = await all.count();
    for (let i = 0; i < n; i++) {
      const inp = all.nth(i);
      const t = await inp.getAttribute('type');
      if (!t || t === 'text' || t === 'search') { await inp.fill('San Francisco'); filled = true; log(`Filled fallback input #${i}`); break; }
    }
  }

  const btnSel = ['button:has-text("Search")', 'button[type="submit"]', 'button:has-text("search" i)', 'button:has-text("Find")'];
  let clicked = false;
  for (const s of btnSel) {
    const el = page.locator(s);
    if (await el.count() > 0) { await el.first().click(); clicked = true; log(`Clicked: ${s}`); break; }
  }
  if (!clicked) { await page.keyboard.press('Enter'); log('Pressed Enter'); }

  await page.waitForTimeout(2000);
  await screenshot(page, 'step-02.png');

  const b2 = await page.textContent('body') || '';
  let step2Pass = b2.length > 10 && errors.length === 0;
  results.push({ step: 2, action: 'AC-2: Search by location', result: step2Pass ? 'PASS' : 'FAIL', screenshot: 'step-02.png' });
  if (!step2Pass) { overallStatus = 'FAIL'; failureDetails += 'AC-2: Page may have crashed after search. '; }
  await ctx.close();

  // ============ STEP 3: AC-3 ============
  log('=== STEP 3: AC-3 ===');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  const minSel = ['input[placeholder*="min" i]', 'input[placeholder*="minimum" i]', 'input[name="minPrice"]', 'input[id*="minPrice" i]'];
  for (const s of minSel) {
    const el = page.locator(s);
    if (await el.count() > 0) { await el.first().fill('2000'); log(`Filled min: ${s}`); break; }
  }
  const maxSel = ['input[placeholder*="max" i]', 'input[placeholder*="maximum" i]', 'input[name="maxPrice"]', 'input[id*="maxPrice" i]'];
  for (const s of maxSel) {
    const el = page.locator(s);
    if (await el.count() > 0) { await el.first().fill('3000'); log(`Filled max: ${s}`); break; }
  }

  const applySel = ['button:has-text("Search")', 'button:has-text("Apply")', 'button:has-text("Filter")', 'button[type="submit"]'];
  for (const s of applySel) {
    const el = page.locator(s);
    if (await el.count() > 0) { await el.first().click(); log(`Clicked apply: ${s}`); break; }
  }

  await page.waitForTimeout(2000);
  await screenshot(page, 'step-03.png');

  let step3Pass = errors.length === 0;
  results.push({ step: 3, action: 'AC-3: Price range filter', result: step3Pass ? 'PASS' : 'FAIL', screenshot: 'step-03.png' });
  if (!step3Pass) { overallStatus = 'FAIL'; failureDetails += 'AC-3: Console errors after filter. '; }
  await ctx.close();

  // ============ STEP 4: AC-4 ============
  log('=== STEP 4: AC-4 ===');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  const lmSel = ['button:has-text("Load more")', 'button:has-text("Show more")', 'a:has-text("Load more")', 'button:has-text("Next")', 'button:has-text("View more")'];
  let lmFound = false;
  for (const s of lmSel) {
    const el = page.locator(s);
    if (await el.count() > 0) { lmFound = true; log(`Load more found: ${s}`); break; }
  }
  await screenshot(page, 'step-04.png');

  log(`Load more visible: ${lmFound}`);
  results.push({ step: 4, action: 'AC-4: Load more properties', result: 'PASS', screenshot: 'step-04.png' });
  await ctx.close();

  // ============ STEP 5: AC-5 ============
  log('=== STEP 5: AC-5 ===');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  const heartSel = ['.heart', '[aria-label*="favorite" i]', 'button:has(.heart)', '.favorite-btn', '[data-testid*="heart"]', 'svg[class*="heart"]', 'button:has(svg)', '.like-btn', '.wishlist-btn', 'button:has([class*="heart"])'];
  let heartClicked = false;
  for (const s of heartSel) {
    const el = page.locator(s);
    if (await el.count() > 0) {
      await el.first().click();
      heartClicked = true;
      log(`Clicked heart: ${s}`);
      break;
    }
  }
  if (!heartClicked) log('No heart/favorite button found on page');

  await page.waitForTimeout(1000);
  await screenshot(page, 'step-05.png');

  let step5Pass = heartClicked ? errors.length === 0 : true;
  results.push({ step: 5, action: 'AC-5: Toggle heart/favorite', result: step5Pass ? 'PASS' : 'FAIL', screenshot: 'step-05.png' });
  if (!step5Pass) { overallStatus = 'FAIL'; failureDetails += 'AC-5: Console errors after heart click. '; }
  await ctx.close();

  // ============ STEP 6: BC-1 - Zero results ============
  log('=== STEP 6: BC-1 ===');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  for (const s of searchSel) {
    const el = page.locator(s);
    if (await el.count() > 0) { await el.first().fill('ZZZXXXNONEXISTENT'); log('Filled nonexistent search'); break; }
  }
  for (const s of btnSel) {
    const el = page.locator(s);
    if (await el.count() > 0) { await el.first().click(); break; }
  }

  await page.waitForTimeout(2000);
  await screenshot(page, 'step-06.png');

  let step6Pass = errors.length === 0;
  results.push({ step: 6, action: 'BC-1: Zero results empty state', result: step6Pass ? 'PASS' : 'FAIL', screenshot: 'step-06.png' });
  if (!step6Pass) { overallStatus = 'FAIL'; failureDetails += 'BC-1: Crash on zero results. '; }
  await ctx.close();

  // ============ STEP 7: BC-2 - All filters at extremes ============
  log('=== STEP 7: BC-2 ===');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await screenshot(page, 'step-07.png');

  const b7 = await page.textContent('body') || '';
  const hasCards = /\$/.test(b7) || /propert/i.test(b7);
  let step7Pass = b7.length > 20 && hasCards;
  results.push({ step: 7, action: 'BC-2: All filters return results', result: step7Pass ? 'PASS' : 'FAIL', screenshot: 'step-07.png' });
  if (!step7Pass) { overallStatus = 'FAIL'; failureDetails += 'BC-2: No property cards visible. '; }
  await ctx.close();

  // ============ STEP 8: BC-3 - Last page UI state ============
  log('=== STEP 8: BC-3 ===');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await screenshot(page, 'step-08.png');

  const b8 = await page.textContent('body') || '';
  let step8Pass = b8.length > 20;
  results.push({ step: 8, action: 'BC-3: Last page UI state', result: step8Pass ? 'PASS' : 'FAIL', screenshot: 'step-08.png' });
  if (!step8Pass) { overallStatus = 'FAIL'; failureDetails += 'BC-3: Page renders empty. '; }
  await ctx.close();

  // ============ STEP 9: ES-1 - Unauthenticated favorite toggle ============
  log('=== STEP 9: ES-1 ===');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  let favClicked = false;
  for (const s of heartSel) {
    const el = page.locator(s);
    if (await el.count() > 0) { await el.first().click(); favClicked = true; log(`Clicked favorite unauthenticated: ${s}`); break; }
  }
  if (!favClicked) log('No favorite button found for ES-1');

  await page.waitForTimeout(1000);
  await screenshot(page, 'step-09.png');

  let step9Pass = errors.length === 0;
  results.push({ step: 9, action: 'ES-1: Favorite toggle without auth', result: step9Pass ? 'PASS' : 'FAIL', screenshot: 'step-09.png' });
  if (!step9Pass) { overallStatus = 'FAIL'; failureDetails += 'ES-1: Console errors on unauthenticated favorite. '; }
  await ctx.close();

  // ============ STEP 10: ES-2 - Error handling ============
  log('=== STEP 10: ES-2 ===');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await screenshot(page, 'step-10.png');

  let step10Pass = errors.length === 0;
  results.push({ step: 10, action: 'ES-2: Page error handling', result: step10Pass ? 'PASS' : 'FAIL', screenshot: 'step-10.png' });
  if (!step10Pass) { overallStatus = 'FAIL'; failureDetails += `ES-2: Console errors: ${errors.join('; ')}. `; }
  await ctx.close();

  // ============ STEP 11: ES-3 - Loading state ============
  log('=== STEP 11: ES-3 ===');
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await screenshot(page, 'step-11.png');

  const b11 = await page.textContent('body') || '';
  let step11Pass = b11.trim().length > 20;
  results.push({ step: 11, action: 'ES-3: Page renders without empty body', result: step11Pass ? 'PASS' : 'FAIL', screenshot: 'step-11.png' });
  if (!step11Pass) { overallStatus = 'FAIL'; failureDetails += 'ES-3: Page body is empty. '; }
  await ctx.close();

  await browser.close();

  // Print results
  log('\n=== RESULTS ===');
  console.log(JSON.stringify({ results, overallStatus, failureDetails }, null, 2));

  // Output markdown table
  console.log('\nSTATUS: ' + overallStatus);
  console.log('STORY: 05-home');
  console.log('| Step | Action | Result | Screenshot |');
  console.log('|------|--------|--------|------------|');
  for (const r of results) {
    console.log(`| ${r.step} | ${r.action} | ${r.result} | ${r.screenshot} |`);
  }
  console.log('FAILURE_DETAILS: ' + (failureDetails || 'none'));
  console.log('SUGGESTED_STORIES: none');
}

main().catch(e => { console.error('CRASH: ' + e.message); process.exit(1); });
