/* ============================================================
   BRIGHT SAPLINGS DAYCARE — script.js
   Vanilla JS, no dependencies. Runs with `defer`.

   01. Setup & helpers
   02. Footer year
   03. Sticky header state + scroll progress bar
   04. Mobile navigation drawer
   05. Smooth scroll with header offset
   06. Scroll-spy (highlight the section you're in)
   07. Reveal on scroll + stagger
   08. Hero stat count-up
   09. Contact form validation  <-- plug your backend in here
   10. Magnetic buttons
   11. Pointer tilt on cards
   12. Parallax scene (scroll + pointer)
   13. Heading line-splitting
   14. Open / closed right now
   15. Photo lightbox

   MOTION POLICY
   Sections 10-13 are decoration. Every one of them checks
   prefers-reduced-motion and bails out, and 10-12 also bail on
   touch-only devices where there is no pointer to follow. Nothing
   in here is required for the page to work or be readable.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 01. SETUP & HELPERS -------------------------- */
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var motionQuery  = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = motionQuery.matches;
  var finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isDesktop    = function () { return window.matchMedia('(min-width: 860px)').matches; };

  // Decoration only runs when it is both wanted and useful
  var allowFancy = !reduceMotion && finePointer;

  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };

  document.documentElement.classList.remove('no-js');

  // If someone flips the OS setting mid-visit, stop animating immediately.
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', function (e) {
      reduceMotion = e.matches;
      allowFancy = !reduceMotion && finePointer;
      if (reduceMotion) {
        $$('.parallax').forEach(function (el) {
          el.style.setProperty('--py', '0px');
          el.style.setProperty('--px', '0px');
        });
        $$('[data-tilt]').forEach(function (el) {
          el.style.setProperty('--rx', '0deg');
          el.style.setProperty('--ry', '0deg');
        });
      }
    });
  }


  /* ---------- 02. FOOTER YEAR ------------------------------ */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ---------- 03. STICKY HEADER + PROGRESS BAR ------------- */
  var header   = $('#siteHeader');
  var progress = $('#scrollProgress');


  /* ---------- 04. MOBILE NAV DRAWER ------------------------ */
  var nav    = $('#primaryNav');
  var toggle = $('#navToggle');
  var scrim  = $('#navScrim');

  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
    if (scrim) scrim.hidden = !open;
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (scrim) scrim.addEventListener('click', function () { setNav(false); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  window.addEventListener('resize', function () {
    if (isDesktop()) setNav(false);
  });


  /* ---------- 05. SMOOTH SCROLL ---------------------------- */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.getElementById(id.slice(1));
      if (!target) return;

      e.preventDefault();
      setNav(false);

      var headerH = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 18;

      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });

      if (history.pushState) history.pushState(null, '', id);
    });
  });


  /* ---------- 06. SCROLL-SPY ------------------------------- */
  var navLinks = $$('.nav__link');
  var sections = navLinks
    .map(function (l) { return document.getElementById(l.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }


  /* ---------- 07. REVEAL ON SCROLL + STAGGER --------------- */
  // Children of .stagger get their index written to --i so the CSS
  // can offset each one's transition-delay.
  $$('.stagger').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--i', i);
    });
  });

  var revealEls = $$('.reveal, .stagger');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }


  /* ---------- 08. HERO STAT COUNT-UP ----------------------- */
  var nums = $$('.hero__stats .num');

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;

    var prefix   = el.getAttribute('data-prefix') || '';
    var duration = 1200;
    var start    = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
      el.textContent = prefix + Math.round(target * eased);
      if (p < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  if (!reduceMotion && 'IntersectionObserver' in window && nums.length) {
    var numObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (n) { numObserver.observe(n); });
  }


  /* ---------- 09. CONTACT FORM ----------------------------- *
   *
   * ⚠ THE ONE LINE THAT MATTERS is FORM_ENDPOINT, just below.
   *
   * This form used to say "Thanks! Your request is in" while sending
   * the message precisely nowhere. A parent would have sat waiting
   * for a reply that could never come, and Bright Saplings would
   * never have known they existed. On a page whose whole job is
   * booking tours, that is the worst failure available.
   *
   * So the three outcomes are now all honest:
   *
   *   endpoint set + send works   -> real thank-you
   *   endpoint set + send fails   -> phone number + "text this to us"
   *   no endpoint at all          -> says so plainly, same fallbacks
   *
   * In every case the fields keep what was typed unless the message
   * genuinely went somewhere.
   *
   * OTHER BACKENDS, if you ever move off FormSubmit:
   *
   *  A) Formspree / Basin / Getform — easiest, no code:
   *     add   action="https://formspree.io/f/YOUR_ID"  method="POST"
   *     to the <form> in the HTML and delete this whole handler.
   *
   *  B) Netlify Forms — add  netlify  and a hidden form-name input
   *     to the <form>, then delete this handler.
   *
   *  C) Your own endpoint — replace the SIMULATED SUCCESS block below
   *     with a real fetch(). The commented example shows the shape.
   *
   *  On WordPress, use a form plugin instead — see wordpress/README.md.
   * -------------------------------------------------------- */
  /* ---- WHERE TOUR REQUESTS GO ---------------------------------
     FormSubmit, because it needs no account: the address in the URL
     IS the configuration. Enquiries land in that inbox.

     ⚠ TWO THINGS TO KNOW

     1. ACTIVATION. The very first submission does not arrive as an
        enquiry — FormSubmit emails that address a confirmation link
        instead, and nothing is delivered until someone clicks it.
        So the first test send is the activation, and the second is
        the real test. Do both before telling a parent to use this.

     2. THIS ADDRESS IS PUBLIC. The repository is public and this file
        ships to every visitor, so a scraper can read the address and
        it will attract spam. FormSubmit's own fix: once activated,
        your dashboard shows a hashed alias like
            https://formsubmit.co/ajax/a1b2c3d4e5f6...
        which delivers to the same inbox without naming it. Swap the
        line below for that alias as soon as you have it.

     When Bright Saplings has its own address, this is the one line
     that changes. -------------------------------------------------- */
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/manishm.sharma91@gmail.com';
  var PHONE = '425-428-9660';

  var form   = $('#tourForm');
  var status = $('#formStatus');

  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var phoneRe = /^[\d\s()+.\-]{7,20}$/;

    function setError(name, msg) {
      var input = form.elements[name];
      var slot  = form.querySelector('[data-error-for="' + name + '"]');
      if (slot) slot.textContent = msg || '';
      if (input) {
        if (msg) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
      return !msg;
    }

    function validate() {
      var ok = true;

      var name = form.elements.parentName.value.trim();
      ok = setError('parentName', name.length < 2 ? 'Please tell us your name.' : '') && ok;

      var email = form.elements.email.value.trim();
      if (!email)                    ok = setError('email', 'We need an email to reply to.') && ok;
      else if (!emailRe.test(email)) ok = setError('email', 'That email doesn\'t look right.') && ok;
      else                           setError('email', '');

      var phone = form.elements.phone.value.trim();
      if (phone && !phoneRe.test(phone)) ok = setError('phone', 'Check the phone number format.') && ok;
      else setError('phone', '');

      return ok;
    }

    ['parentName', 'email', 'phone'].forEach(function (n) {
      var el = form.elements[n];
      if (el) el.addEventListener('input', function () { setError(n, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (status) { status.textContent = ''; status.className = 'form__status'; }

      if (!validate()) {
        if (status) {
          status.textContent = 'Please fix the highlighted fields.';
          status.className = 'form__status is-err';
        }
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }

      var data = {
        parentName: form.elements.parentName.value.trim(),
        email:      form.elements.email.value.trim(),
        phone:      form.elements.phone.value.trim(),
        childAge:   form.elements.childAge.value,
        startDate:  form.elements.startDate.value,
        days:       $$('input[name="days"]:checked', form).map(function (c) { return c.value; }),
        message:    form.elements.message.value.trim()
      };

      /* ---- Nothing is connected yet -------------------------
         Say so, and give them something that actually works. The
         form is NOT reset: everything they typed stays on screen,
         so the "text this to us" button can carry it and they can
         still copy it if they'd rather. */
      if (!FORM_ENDPOINT) {
        showNotConnected(data);
        return;
      }

      /* ---- The real thing ----------------------------------
         The keys below become the labels in the email, so they are
         written the way a person reads them rather than the way the
         form names its inputs. The underscore keys are FormSubmit's
         own options, not form data. */
      var payload = {
        _subject: 'Tour request from ' + (data.parentName || 'the website'),
        _template: 'table',
        _captcha: 'false',
        'Parent name':   data.parentName,
        'Email':         data.email,
        'Phone':         data.phone || '(not given)',
        'Child age':     data.childAge || '(not given)',
        'Hoping to start': data.startDate || '(not given)',
        'Days needed':   data.days.length ? data.days.join(', ') : '(not given)',
        'Message':       data.message || '(none)'
      };

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { if (!r.ok) throw new Error('Bad response'); return r; })
        .then(function () { showSuccess(); })
        .catch(function () {
          /* Never a dead end. If the send fails for any reason, the
             parent still gets a way through to a person, with what
             they typed still on the screen. */
          if (status) {
            status.className = 'form__status is-warn';
            status.innerHTML =
              '<b>That didn\'t go through.</b> Please call or text ' +
              '<a href="tel:+1' + PHONE.replace(/\D/g, '') + '">' + PHONE + '</a>' +
              ' and we\'ll pick it up from there.' +
              '<a class="btn btn--sm form__sms" href="' + smsHref(data) + '">Text this to us</a>';
          }
        })
        .finally(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
    });

    /* Builds a text message out of what they typed, so a tap on a
       phone opens Messages with the whole enquiry already written. */
    function smsHref(d) {
      var lines = [
        'Hi Bright Saplings, I would like to book a tour.',
        '',
        'Name: ' + (d.parentName || ''),
        'Email: ' + (d.email || '')
      ];
      if (d.phone)      lines.push('Phone: ' + d.phone);
      if (d.childAge)   lines.push('Child age: ' + d.childAge);
      if (d.startDate)  lines.push('Hoping to start: ' + d.startDate);
      if (d.message)    lines.push('', d.message);
      /* RFC 5724 says "?body=". iOS has historically also accepted
         "&body=", but "?" is the one that works on both Android and
         current iOS, so that is what we use. */
      return 'sms:+1' + PHONE.replace(/\D/g, '') + '?body=' + encodeURIComponent(lines.join('\n'));
    }

    function showNotConnected(d) {
      if (!status) return;
      status.className = 'form__status is-warn';
      status.innerHTML =
        '<b>We can\'t receive messages through this form yet.</b> ' +
        'Please call or text <a href="tel:+1' + PHONE.replace(/\D/g, '') + '">' + PHONE + '</a> ' +
        'and we\'ll answer today. Nothing you typed has been lost.' +
        '<a class="btn btn--sm form__sms" href="' + smsHref(d) + '">Text this to us</a>';
    }

    function showSuccess() {
      if (status) {
        status.textContent = 'Thanks! Your request is in — we\'ll reply within one business day.';
        status.className = 'form__status is-ok';
      }
      form.reset();
      ['parentName', 'email', 'phone'].forEach(function (n) { setError(n, ''); });
    }
  }


  /* ---------- 10. MAGNETIC BUTTONS -------------------------
     The button drifts a few pixels toward the cursor while it is
     nearby. Capped at 6px — enough to feel responsive, not enough
     to make the target move away from someone trying to click it. */
  if (allowFancy) {
    $$('[data-magnetic]').forEach(function (el) {
      var raf = null;
      var tx = 0, ty = 0, cx = 0, cy = 0;

      function run() {
        cx = lerp(cx, tx, .18);
        cy = lerp(cy, ty, .18);
        el.style.setProperty('--mx', cx.toFixed(2) + 'px');
        el.style.setProperty('--my', cy.toFixed(2) + 'px');
        if (Math.abs(cx - tx) > .1 || Math.abs(cy - ty) > .1) raf = requestAnimationFrame(run);
        else raf = null;
      }
      function kick() { if (raf === null) raf = requestAnimationFrame(run); }

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tx = clamp((e.clientX - (r.left + r.width / 2)) * .28, -6, 6);
        ty = clamp((e.clientY - (r.top + r.height / 2)) * .38, -6, 6);
        kick();
      });

      el.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
    });
  }


  /* ---------- 11. POINTER TILT ON CARDS --------------------
     Reads --tilt-max from the stylesheet so the ceiling stays a
     design decision rather than a magic number in here. */
  if (allowFancy) {
    var tiltMax = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--tilt-max')
    ) || 5;

    $$('[data-tilt]').forEach(function (card) {
      var raf = null, nx = 0, ny = 0;

      function apply() {
        card.style.setProperty('--ry', (nx * tiltMax).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-ny * tiltMax).toFixed(2) + 'deg');
        raf = null;
      }

      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        nx = clamp((e.clientX - r.left) / r.width - .5, -.5, .5) * 2;
        ny = clamp((e.clientY - r.top) / r.height - .5, -.5, .5) * 2;
        if (raf === null) raf = requestAnimationFrame(apply);
      });

      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }


  /* ---------- 12. PARALLAX SCENE ---------------------------
     One rAF loop drives the header state, the progress bar and
     every .parallax layer. Layers move by data-depth * distance
     from the viewport centre, so the effect is self-limiting —
     nothing can drift off into space on a long page.

     Pointer drift is lerped separately so it eases rather than
     snapping to the cursor. */
  var layers = $$('.parallax').map(function (el) {
    return { el: el, depth: parseFloat(el.getAttribute('data-depth')) || 0, start: 0 };
  });

  /* Each layer's offset is measured from the scroll position where it
     first enters the viewport, so every layer sits at exactly 0 in its
     designed position on load. Measuring from the viewport centre
     instead would displace the hero before anyone has scrolled. */
  function measureLayers() {
    var y  = window.pageYOffset || document.documentElement.scrollTop;
    var vh = window.innerHeight;

    layers.forEach(function (layer) {
      layer.el.style.setProperty('--py', '0px');
      var top = layer.el.getBoundingClientRect().top + y;
      layer.start = Math.max(0, top - vh);
    });
  }

  var pointerX = 0, pointerY = 0;   // target, -1..1
  var driftX = 0, driftY = 0;       // eased

  if (allowFancy && layers.length) {
    window.addEventListener('pointermove', function (e) {
      pointerX = (e.clientX / window.innerWidth  - .5) * 2;
      pointerY = (e.clientY / window.innerHeight - .5) * 2;
    }, { passive: true });
  }

  var ticking = false;

  function frame() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (header) header.classList.toggle('is-stuck', y > 8);

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }

    if (!reduceMotion && layers.length) {
      driftX = lerp(driftX, pointerX, .06);
      driftY = lerp(driftY, pointerY, .06);

      var vh = window.innerHeight;

      layers.forEach(function (layer) {
        var r = layer.el.getBoundingClientRect();

        // skip anything comfortably off screen
        if (r.bottom < -vh || r.top > vh * 2) return;

        // clamped so a long page can never fling a layer into orbit
        var py = clamp((y - layer.start) * layer.depth, -160, 160);
        var px = driftX * layer.depth * 42;
        var pyPointer = driftY * layer.depth * 26;

        layer.el.style.setProperty('--py', (py + pyPointer).toFixed(1) + 'px');
        layer.el.style.setProperty('--px', px.toFixed(1) + 'px');
      });
    }

    ticking = false;
  }

  function requestFrame() {
    if (!ticking) {
      window.requestAnimationFrame(frame);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', function () {
    measureLayers();
    requestFrame();
  });

  if (layers.length) measureLayers();

  // The pointer drift needs its own heartbeat, otherwise the scene
  // freezes whenever the page is still. Only runs when it can matter.
  if (allowFancy && layers.length) {
    (function heartbeat() {
      if (Math.abs(driftX - pointerX) > .002 || Math.abs(driftY - pointerY) > .002) requestFrame();
      window.requestAnimationFrame(heartbeat);
    })();
  }

  requestFrame();


  /* ---------- 13. HEADING LINE-SPLIT -----------------------
     Wraps each visual line of a [data-split] heading in its own
     overflow-hidden mask, so the lines rise into place one after
     another. Runs only after the webfont has settled, because the
     line breaks depend on the real metrics — splitting against the
     fallback font would mask the wrong words. */
  function splitLines(el) {
    var original = el.getAttribute('data-text') || el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('data-text', original);

    // 1. one span per word so we can read their line positions
    el.innerHTML = original.split(' ').map(function (w) {
      return '<span class="w">' + w + '</span>';
    }).join(' ');

    var words = $$('.w', el);
    if (!words.length) return;

    // 2. group words by their offsetTop
    var lines = [], current = [], lineTop = null;

    words.forEach(function (w) {
      var top = w.offsetTop;
      if (lineTop === null) lineTop = top;
      if (Math.abs(top - lineTop) > 4) {
        lines.push(current);
        current = [];
        lineTop = top;
      }
      current.push(w.textContent);
    });
    if (current.length) lines.push(current);

    // 3. rebuild as masked lines.
    //    Joined with a newline so textContent keeps the word gap between
    //    lines — otherwise a screen reader (and copy-paste) runs the last
    //    word of one line into the first of the next.
    el.innerHTML = lines.map(function (line, i) {
      return '<span class="line-mask"><span style="--l:' + i + '">' +
             line.join(' ') + '</span></span>';
    }).join('\n');
  }

  var splitTargets = $$('[data-split]');

  function runSplit() {
    if (reduceMotion) return;
    splitTargets.forEach(splitLines);
  }

  if (splitTargets.length && !reduceMotion) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(runSplit).catch(runSplit);
    } else {
      window.addEventListener('load', runSplit);
    }

    // Re-split on a real width change — line breaks move with the
    // container. Height-only changes (mobile URL bar) are ignored.
    var lastWidth = window.innerWidth;
    var resizeTimer = null;

    window.addEventListener('resize', function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(runSplit, 220);
    });
  }


  /* ---------- 14. OPEN / CLOSED RIGHT NOW -------------------
     Works out from the visitor's own clock whether Bright
     Saplings is open at this moment, and says so in the hero.

     Two things make this honest rather than decorative:

     - It is computed in AMERICA/LOS_ANGELES, not in the
       visitor's timezone. A parent researching from the East
       Coast at 8pm should see "closed", not "open", and someone
       browsing from another country should see Bothell's hours.
     - It updates itself every minute, so a tab left open over
       6pm doesn't keep claiming the daycare is open.

     If anything at all goes wrong — an old browser without the
     timeZone option, a locale that formats differently — the
     whole thing bails and the pill keeps whatever static text
     was in the HTML. It never guesses.
     ---------------------------------------------------------- */

  var OPEN_HOUR  = 8;    // 8:00am
  var CLOSE_HOUR = 18;   // 6:00pm
  var ZONE = 'America/Los_Angeles';

  function bothellNow() {
    try {
      var f = new Intl.DateTimeFormat('en-US', {
        timeZone: ZONE, weekday: 'short', hour: 'numeric',
        minute: 'numeric', hour12: false
      });
      var parts = {};
      f.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      var days = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
      if (!(parts.weekday in days)) return null;
      var hour = parseInt(parts.hour, 10);
      if (isNaN(hour)) return null;
      if (hour === 24) hour = 0;                 // some locales say 24:00
      return { day: days[parts.weekday], hour: hour, minute: parseInt(parts.minute, 10) || 0 };
    } catch (e) {
      return null;
    }
  }

  function openState() {
    var now = bothellNow();
    if (!now) return null;
    var weekday = now.day >= 1 && now.day <= 5;
    var mins = now.hour * 60 + now.minute;
    var open = weekday && mins >= OPEN_HOUR * 60 && mins < CLOSE_HOUR * 60;

    if (open) {
      var left = CLOSE_HOUR * 60 - mins;
      return { open: true, text: left <= 60
        ? 'Open now · closing at 6' : 'Open now · until 6pm' };
    }
    if (weekday && mins < OPEN_HOUR * 60) return { open: false, text: 'Opens at 8am today' };
    if (now.day === 5 || now.day === 6 || now.day === 0) {
      return { open: false, text: 'Closed · open Monday 8am' };
    }
    return { open: false, text: 'Closed · open 8am tomorrow' };
  }

  var statusEl = $('#openStatus');
  if (statusEl) {
    (function () {
      function paint() {
        var s = openState();
        if (!s) return;                        // leave the static text alone
        statusEl.textContent = s.text;
        statusEl.parentNode.classList.toggle('is-open', s.open);
        statusEl.parentNode.classList.toggle('is-closed', !s.open);
      }
      paint();
      setInterval(paint, 60000);
    })();
  }


  /* ---------- 15. PHOTO LIGHTBOX ----------------------------
     Click a framed photo to see it properly. These are old
     snapshots at small sizes, and the detail in them is the
     whole point, so they need somewhere to be big.

     Progressive enhancement: with JavaScript off, every photo
     is still a plain <img> in the page and loses nothing.

     The accessibility work here is the part worth keeping:
     focus moves into the dialog, Tab is trapped inside it,
     Escape closes, and focus returns to the exact photo that
     opened it. A lightbox that strands keyboard focus behind
     an overlay is worse than no lightbox.
     ---------------------------------------------------------- */

  var zoomables = $$('.frame img');

  if (zoomables.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo');
    box.hidden = true;
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<figure class="lightbox__fig">' +
        '<img alt="">' +
        '<figcaption></figcaption>' +
      '</figure>';
    document.body.appendChild(box);

    var lbImg   = $('img', box);
    var lbCap   = $('figcaption', box);
    var lbClose = $('.lightbox__close', box);
    var opener  = null;

    function openBox(img) {
      opener = img;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      var cap = img.closest('figure') && $('figcaption', img.closest('figure'));
      lbCap.textContent = cap ? cap.textContent.trim() : '';
      lbCap.hidden = !lbCap.textContent;
      box.hidden = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(function () { box.classList.add('is-open'); });
      lbClose.focus();
    }

    function closeBox() {
      box.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      var done = function () { box.hidden = true; lbImg.removeAttribute('src'); };
      if (reduceMotion) done(); else setTimeout(done, 220);
      if (opener) { opener.focus(); opener = null; }
    }

    zoomables.forEach(function (img) {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', (img.alt || 'Photo') + ' — click to enlarge');
      img.addEventListener('click', function () { openBox(img); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox(img); }
      });
    });

    lbClose.addEventListener('click', closeBox);
    box.addEventListener('click', function (e) { if (e.target === box) closeBox(); });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') { closeBox(); return; }
      /* Only one focusable thing is inside, so trapping Tab is
         just: keep it on the close button. */
      if (e.key === 'Tab') { e.preventDefault(); lbClose.focus(); }
    });
  }


})();
