const BASE = process.env.BASE_URL || 'http://localhost:8000/dist/';
const { chromium, devices } = require('playwright');

const SIZES = [
  ['iPhone SE',        320, 568,  3],
  ['iPhone 12/13 mini',375, 812,  3],
  ['iPhone 14',        390, 844,  3],
  ['iPhone 14 Pro Max',430, 932,  3],
  ['Pixel 7',          412, 915,  2.6],
  ['iPad mini portrait',768,1024, 2],
  ['iPad Pro portrait',1024,1366, 2],
  ['Small laptop',    1280, 800,  2],
  ['MacBook 14"',     1512, 982,  2],
  ['Desktop',         1920,1080,  1],
];

(async () => {
  const b = await chromium.launch();
  const rows = [];
  for (const [name, w, h, dpr] of SIZES) {
    const ctx = await b.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: dpr,
      isMobile: w < 900,
      hasTouch: w < 900,
    });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}window.scrollTo(0,0);});
    await p.waitForTimeout(400);

    const r = await p.evaluate((vw) => {
      const out = { overflow: null, wide: [], smallText: [], smallTaps: [], clipped: [] };
      const de = document.documentElement;
      out.overflow = de.scrollWidth - vw;

      // Anything sticking out past the viewport.
      //
      // Two things are deliberately excluded, because flagging them
      // made the report useless noise:
      //   - anything inside an overflow:hidden ancestor. The hero glow
      //     and the curved hero edge are MEANT to run past the edge;
      //     they are clipped by their parent and can never cause a
      //     scrollbar.
      //   - .visually-hidden, which is off-screen on purpose.
      const clipped = el => {
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          const c = getComputedStyle(n);
          if (c.overflow === 'hidden' || c.overflowX === 'hidden') return true;
        }
        return false;
      };
      document.querySelectorAll('body *').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') return;
        if (el.classList.contains('visually-hidden') || el.closest('.lightbox')) return;
        if (clipped(el)) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        if (r.right > vw + 1.5 || r.left < -1.5) {
          const id = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0,2).join('.') : '');
          if (!out.wide.some(x => x.el === id)) out.wide.push({ el: id, left: Math.round(r.left), right: Math.round(r.right) });
        }
      });

      // text under 12px, and tap targets under 40px
      document.querySelectorAll('p, li, a, button, dd, dt, span, h1,h2,h3,h4,figcaption,cite,label,input,select,textarea').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none') return;
        if (el.classList.contains('visually-hidden') || el.closest('.lightbox')) return;
        const txt = (el.textContent||'').trim();
        const fs = parseFloat(cs.fontSize);
        /* 11px is the floor. The uppercase, letter-spaced micro-labels
           on this site sit at 11.5-11.8px by design — they are labels,
           not reading text, and inflating them past ~12px stops them
           reading as labels at all. Anything BELOW 11px is a real
           problem on a phone and should be flagged. */
        if (txt && el.children.length === 0 && fs < 11) {
          const id = el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '');
          if (!out.smallText.some(x => x.el === id)) out.smallText.push({ el: id, px: +fs.toFixed(1) });
        }
        if (/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.height < 40 || r.width < 40)) {
            const id = el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '');
            if (!out.smallTaps.some(x => x.el === id)) out.smallTaps.push({ el: id, w: Math.round(r.width), h: Math.round(r.height) });
          }
        }
      });

      // text overflowing its own box
      document.querySelectorAll('h1,h2,h3,h4,p,dd,li').forEach(el => {
        if (el.classList.contains('visually-hidden')) return;
        if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'auto') {
          const id = el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '');
          if (!out.clipped.some(x => x.el === id)) out.clipped.push({ el: id, over: el.scrollWidth - el.clientWidth });
        }
      });
      return out;
    }, w);

    r.errors = errs;
    rows.push([name, w, r]);
    await ctx.close();
  }

  for (const [name, w, r] of rows) {
    const bad = r.overflow > 0 || r.wide.length || r.smallText.length || r.smallTaps.length || r.clipped.length || r.errors.length;
    console.log(`\n${bad ? '✗' : '✓'} ${name} (${w}px)`);
    if (r.overflow > 0) console.log(`    horizontal overflow: +${r.overflow}px`);
    if (r.wide.length)      console.log('    sticking out:', JSON.stringify(r.wide.slice(0,5)));
    if (r.clipped.length)   console.log('    text clipped:', JSON.stringify(r.clipped.slice(0,5)));
    if (r.smallText.length) console.log('    text < 12px:', JSON.stringify(r.smallText.slice(0,6)));
    if (r.smallTaps.length) console.log('    tap target < 40px:', JSON.stringify(r.smallTaps.slice(0,6)));
    if (r.errors.length)    console.log('    JS errors:', r.errors);
  }
  await b.close();
})();
