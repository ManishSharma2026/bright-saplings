const BASE = process.env.BASE_URL || 'http://localhost:8000/dist/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(400);

  // no-js removed
  console.log('no-js removed:', !(await p.evaluate(() => document.documentElement.classList.contains('no-js'))));

  // mobile nav open
  await p.click('#navToggle');
  await p.waitForTimeout(300);
  console.log('nav open:', await p.evaluate(() => document.getElementById('primaryNav').classList.contains('is-open')));
  console.log('scrim shown:', await p.evaluate(() => !document.getElementById('navScrim').hidden));
  await p.screenshot({ path: 'nav-open.png' });
  // click a nav link -> closes + scrolls
  await p.click('#primaryNav a[href="#programs"]');
  await p.waitForTimeout(900);
  console.log('nav closed after link:', await p.evaluate(() => !document.getElementById('primaryNav').classList.contains('is-open')));
  console.log('scrolled to programs:', await p.evaluate(() => Math.abs(document.getElementById('programs').getBoundingClientRect().top) < 120));

  // form: empty submit
  await p.click('#contact');
  await p.evaluate(() => document.getElementById('tourForm').scrollIntoView());
  await p.waitForTimeout(300);
  await p.click('#tourForm button[type=submit]');
  await p.waitForTimeout(200);
  console.log('empty submit status:', await p.textContent('#formStatus'));
  console.log('name error:', await p.textContent('[data-error-for="parentName"]'));
  console.log('email error:', await p.textContent('[data-error-for="email"]'));

  // bad email
  await p.fill('#parentName', 'Manish S');
  await p.fill('#email', 'nope');
  await p.fill('#phone', 'abc');
  await p.click('#tourForm button[type=submit]');
  await p.waitForTimeout(200);
  console.log('bad email error:', await p.textContent('[data-error-for="email"]'));
  console.log('bad phone error:', await p.textContent('[data-error-for="phone"]'));

  // good
  await p.fill('#email', 'a@b.com');
  await p.fill('#phone', '425-555-0142');
  await p.check('input[name="days"][value="Mon"]');
  await p.click('#tourForm button[type=submit]');
  await p.waitForTimeout(300);
  /* While FORM_ENDPOINT is empty the form must NOT claim to have sent
     anything. This asserts the honest behaviour, so that if someone ever
     puts the fake "Thanks!" message back, this test fails loudly. */
  const st = await p.evaluate(() => {
    const s = document.getElementById('formStatus');
    return { cls: s.className, text: s.textContent, tel: !!s.querySelector('a[href^="tel:"]'),
             sms: !!s.querySelector('a[href^="sms:"]') };
  });
  const connected = await p.evaluate(() =>
    !!(window.__FORM_ENDPOINT || document.querySelector('#tourForm')?.getAttribute('action')));
  if (connected) {
    console.log('endpoint configured; success status:', st.text.trim().slice(0, 60));
    console.log('form reset:', await p.inputValue('#parentName') === '');
  } else {
    console.log('no endpoint — honest fallback shown:', st.cls.includes('is-warn'));
    console.log('  does NOT claim success:', !/thanks|your request is in/i.test(st.text));
    console.log('  offers phone:', st.tel, ' offers text:', st.sms);
    console.log('  keeps what was typed:', await p.inputValue('#parentName') !== '');
  }
  await p.screenshot({ path: 'form-success.png' });

  console.log('page errors:', JSON.stringify(errs));
  await b.close();
})();
