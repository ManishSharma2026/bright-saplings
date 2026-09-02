/* Both outcomes of the contact form, without sending a real email.
 *
 * Every request to formsubmit.co is intercepted and answered locally,
 * so this can run as often as you like. It checks two things that
 * matter more than they look:
 *
 *   - on success the form clears, because the message really went;
 *   - on failure it does NOT clear, and offers a phone number and a
 *     prefilled text, because the parent's words must not evaporate.
 *
 * If someone ever makes the failure path clear the form, or makes it
 * claim success, this fails.
 */
const BASE = process.env.BASE_URL || 'http://localhost:8000/dist/';
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();

  for (const mode of ['success', 'failure']) {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = []; let captured = null;
    p.on('pageerror', e => errs.push(e.message));

    // Intercept so no real email is sent while testing.
    await p.route('**/formsubmit.co/**', async route => {
      captured = { url: route.request().url(), body: route.request().postDataJSON(),
                   headers: route.request().headers() };
      if (mode === 'success') {
        await route.fulfill({ status: 200, contentType: 'application/json',
                              body: JSON.stringify({ success: 'true', message: 'sent' }) });
      } else {
        await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      }
    });

    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.getElementById('contact').scrollIntoView());
    await p.waitForTimeout(400);
    await p.fill('#parentName', 'Manish Sharma');
    await p.fill('#email', 'manish@example.com');
    await p.fill('#phone', '425 555 0101');
    await p.fill('#message', 'Looking for a spot in September.');
    await p.click('button[type="submit"]');
    await p.waitForTimeout(700);

    const st = await p.evaluate(() => {
      const s = document.getElementById('formStatus');
      return { cls: s.className, text: s.textContent.trim().slice(0, 110),
               tel: !!s.querySelector('a[href^="tel:"]'), sms: !!s.querySelector('a[href^="sms:"]'),
               kept: document.getElementById('parentName').value,
               btn: document.querySelector('#tourForm button[type="submit"]').textContent.trim(),
               btnDisabled: document.querySelector('#tourForm button[type="submit"]').disabled };
    });

    console.log(`\n=== ${mode.toUpperCase()} ===`);
    console.log('  posted to :', captured && captured.url);
    console.log('  subject   :', captured && captured.body._subject);
    console.log('  fields    :', captured && Object.keys(captured.body).filter(k => k[0] !== '_').join(', '));
    console.log('  parent    :', captured && captured.body['Parent name']);
    console.log('  status cls:', st.cls);
    console.log('  message   :', st.text);
    if (mode === 'failure') console.log('  offers phone:', st.tel, ' offers text:', st.sms, ' kept input:', st.kept !== '');
    else console.log('  form cleared:', st.kept === '');
    console.log('  button restored:', st.btn, '| disabled:', st.btnDisabled);
    console.log('  page errors:', errs.length ? errs : 'none');
    await p.close();
  }
  await b.close();
})();
