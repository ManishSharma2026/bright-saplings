const BASE = process.env.BASE_URL || 'http://localhost:8000/dist/';
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const [name, w] of [['desktop',1440],['mobile',390]]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs=[], bad=[];
    p.on('pageerror', e => errs.push(e.message));
    p.on('response', r => { if (r.status()>=400) bad.push(r.status()+' '+r.url()); });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    /* Force every lazy image to load before checking. Scrolling the page
       quickly is NOT enough — the lazy loader can miss an image that flies
       past in one 500px jump, which showed up here as a phantom "image
       failed" on a photo that loads perfectly in a real browser. A test
       that reports a bug which isn't there costs as much trust as one that
       misses a bug that is. */
    await p.evaluate(() => document.querySelectorAll('img[loading="lazy"]')
      .forEach(i => i.loading = 'eager'));
    await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,25));}window.scrollTo(0,0);});
    await p.evaluate(() => Promise.all([...document.images]
      .filter(i => !i.closest('.lightbox'))
      .map(i => i.decode().catch(() => {}))));
    await p.waitForTimeout(1200);   // large photos need time to decode
    out[name] = await p.evaluate(() => ({
      sections: [...document.querySelectorAll('section[id]')].map(s=>s.id),
      navLinks: [...document.querySelectorAll('.nav__link')].map(a=>a.getAttribute('href')),
      deadAnchors: [...document.querySelectorAll('a[href^="#"]')]
        .map(a=>a.getAttribute('href')).filter(h=>h!=='#'&&h!=='#top'&&!document.querySelector(h)),
      menuLeftovers: document.querySelectorAll('.menu__table,.menu__wk,#menuWeeks,#menuPrint').length,
      hOverflow: document.documentElement.scrollWidth > window.innerWidth,
      pageBg: getComputedStyle(document.body).backgroundColor,
      h1Color: getComputedStyle(document.querySelector('h1')).color,
      btnBg: getComputedStyle(document.querySelector('.hero .btn')).backgroundColor,
      // The lightbox's <img> is deliberately empty until a photo is
      // opened, so it is excluded — otherwise this check fails forever.
      imgsOk: [...document.images].filter(i=>!i.closest('.lightbox')).every(i=>i.naturalWidth>0),
    }));
    out[name].errors = errs; out[name].badRequests = bad;
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
