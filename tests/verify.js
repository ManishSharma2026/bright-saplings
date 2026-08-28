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
    await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,25));}window.scrollTo(0,0);});
    await p.waitForTimeout(400);
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
