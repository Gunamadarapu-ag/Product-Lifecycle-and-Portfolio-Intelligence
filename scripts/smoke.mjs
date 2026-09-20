/**
 * Smoke test: load every tab for every persona and fail on any console error.
 *
 * Compilation does not prove a lazy-loaded chunk renders, so this drives the
 * built app in a real browser after each refactor step.
 */
import puppeteer from 'puppeteer';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const ROLES = ['VP Product Management', 'Product Manager', 'Pricing and Margin Partner'];
const TABS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000 });

const problems = [];
let current = '';

// The app ships no favicon; that 404 is pre-existing and not worth failing on.
const IGNORE = /favicon\.ico/;

page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error' && !IGNORE.test(t) && !/status of 404/.test(t)) {
    problems.push(`${current} :: console: ${t.slice(0, 160)}`);
  }
});
page.on('pageerror', (e) => problems.push(`${current} :: pageerror: ${String(e).slice(0, 160)}`));
page.on('response', (r) => {
  if (r.status() >= 400 && !IGNORE.test(r.url())) problems.push(`${current} :: HTTP ${r.status()} ${r.url()}`);
});

for (const role of ROLES) {
  for (const tab of TABS) {
    current = `${role} / tab ${tab}`;
    const url = `${BASE}/#tab=${tab}&role=${encodeURIComponent(role)}&timeline=12m&theme=light`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    // lazy chunk + chart render
    await new Promise((r) => setTimeout(r, 900));
    const text = await page.evaluate(() => document.body.innerText.trim().length);
    if (text < 200) problems.push(`${current} :: rendered only ${text} chars — likely blank`);
  }
}

await browser.close();

if (problems.length) {
  console.log(`FAIL — ${problems.length} problem(s):`);
  for (const p of problems.slice(0, 25)) console.log('  ' + p);
  process.exit(1);
}
console.log(`PASS — ${ROLES.length * TABS.length} role/tab combinations rendered with no console errors`);
