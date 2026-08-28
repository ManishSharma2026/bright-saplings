const BASE = process.env.BASE_URL || 'http://localhost:8000/dist/';
const { chromium } = require('playwright');

const TIMES = [
  ['2026-08-26T16:30:00Z', 'Wed 9:30am PT'],   // open
  ['2026-08-27T00:30:00Z', 'Wed 5:30pm PT'],   // open, closing soon
  ['2026-08-26T13:00:00Z', 'Wed 6:00am PT'],   // before open
  ['2026-08-27T04:00:00Z', 'Wed 9:00pm PT'],   // after close
  ['2026-08-29T19:00:00Z', 'Sat 12:00pm PT'],  // weekend
  ['2026-08-31T16:30:00Z', 'Mon 9:30am PT'],   // open Monday
];

(async () => {
  const b = await chromium.launch();

  console.log('--- open/closed pill ---');
  for (const [iso, label] of TIMES) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, timezoneId: 'Europe/London' });
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date(iso) });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(200);
    const r = await p.evaluate(() => ({
      text: document.getElementById('openStatus').textContent.trim(),
      cls: document.getElementById('openPill').className.replace(/reveal[\w-]*/g,'').trim(),
    }));
    console.log(`  ${label.padEnd(16)} → "${r.text}"  [${r.cls.replace(/\s+/g,' ')}]`);
    await ctx.close();
  }

  console.log('\n--- lightbox ---');
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.getElementById('story').scrollIntoView());
  await p.waitForTimeout(500);

  const img = await p.$('#story .frame img');
  console.log('  photo is focusable:', await img.evaluate(e => e.tabIndex === 0));
  console.log('  has aria-label:', !!(await img.getAttribute('aria-label')));
  await img.click();
  await p.waitForTimeout(350);
  console.log('  opens:', await p.evaluate(() => !document.querySelector('.lightbox').hidden));
  console.log('  focus on close button:', await p.evaluate(() => document.activeElement.className === 'lightbox__close'));
  console.log('  body scroll locked:', await p.evaluate(() => document.body.classList.contains('is-locked')));
  console.log('  caption carried over:', await p.evaluate(() => document.querySelector('.lightbox figcaption').textContent.trim()));
  console.log('  image loaded:', await p.evaluate(() => { const i = document.querySelector('.lightbox img'); return i.naturalWidth > 0; }));

  // Tab must stay trapped
  await p.keyboard.press('Tab');
  console.log('  Tab stays trapped:', await p.evaluate(() => document.activeElement.className === 'lightbox__close'));

  await p.keyboard.press('Escape');
  await p.waitForTimeout(350);
  console.log('  closes on Escape:', await p.evaluate(() => document.querySelector('.lightbox').hidden));
  console.log('  scroll unlocked:', await p.evaluate(() => !document.body.classList.contains('is-locked')));
  console.log('  focus returned to photo:', await p.evaluate(() => document.activeElement.tagName === 'IMG'));

  // backdrop click
  await img.click(); await p.waitForTimeout(300);
  await p.mouse.click(20, 20);
  await p.waitForTimeout(350);
  console.log('  closes on backdrop click:', await p.evaluate(() => document.querySelector('.lightbox').hidden));

  console.log('\n  page errors:', errs.length ? errs : 'none');
  await b.close();
})();
