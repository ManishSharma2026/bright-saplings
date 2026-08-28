const BASE = process.env.BASE_URL || 'http://localhost:8000/dist/';
const { chromium } = require('playwright');

const AUDIT = () => {
  const srgb = c => { c/=255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); };
  const lum = ([r,g,b]) => 0.2126*srgb(r)+0.7152*srgb(g)+0.0722*srgb(b);
  const ratio = (a,b) => { const la=lum(a), lb=lum(b), hi=Math.max(la,lb), lo=Math.min(la,lb); return (hi+0.05)/(lo+0.05); };
  const parse = s => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : null; };

  // walk up for the first opaque background, compositing any alpha layers
  function effectiveBg(el) {
    let stack = [];
    let node = el;
    while (node && node !== document.documentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg) {
        const a = bg.length === 4 ? bg[3] : 1;
        if (a > 0) { stack.push([bg[0],bg[1],bg[2],a]); if (a === 1) break; }
      }
      node = node.parentElement;
    }
    stack.push([250,248,243,1]);       // page background backstop
    let out = stack[stack.length-1].slice(0,3);
    for (let i = stack.length-2; i >= 0; i--) {
      const [r,g,b,a] = stack[i];
      out = [r*a+out[0]*(1-a), g*a+out[1]*(1-a), b*a+out[2]*(1-a)];
    }
    return out;
  }

  const out = [];
  document.querySelectorAll('body *').forEach(el => {
    // only elements with their own visible text
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!own) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;

    const fg = parse(cs.color); if (!fg) return;
    const alpha = (fg.length === 4 ? fg[3] : 1) * parseFloat(cs.opacity || 1);
    const bg = effectiveBg(el);
    const composited = [
      fg[0]*alpha + bg[0]*(1-alpha),
      fg[1]*alpha + bg[1]*(1-alpha),
      fg[2]*alpha + bg[2]*(1-alpha),
    ];
    const cr = ratio(composited, bg);

    const px = parseFloat(cs.fontSize);
    const w  = parseInt(cs.fontWeight) || 400;
    const large = px >= 24 || (px >= 18.66 && w >= 700);
    const need = large ? 3 : 4.5;

    if (cr < need) {
      out.push({
        sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0,2).join('.') : ''),
        text: el.textContent.trim().slice(0, 42),
        size: px.toFixed(1), ratio: cr.toFixed(2), need
      });
    }
  });
  // dedupe by selector
  const seen = new Set();
  return out.filter(o => { const k = o.sel + o.ratio; if (seen.has(k)) return false; seen.add(k); return true; });
};

(async () => {
  const b = await chromium.launch();
  for (const [name, w] of [['desktop', 1440], ['mobile', 390]]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await p.goto(BASE, { waitUntil: 'load' });
    await p.waitForTimeout(900);
    await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await p.evaluate(() => document.querySelectorAll('.reveal, .stagger').forEach(e => e.classList.add('is-visible')));
    await p.waitForTimeout(400);
    const fails = await p.evaluate(AUDIT);
    console.log(`\n=== ${name} (${w}px) — ${fails.length} contrast failures ===`);
    fails.forEach(f => console.log(`  ${f.ratio} (need ${f.need})  ${f.size}px  ${f.sel}\n      "${f.text}"`));
    await p.close();
  }
  await b.close();
})();
