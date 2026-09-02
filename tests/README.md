# Checks

Five scripts that catch the things the eye doesn't. None of them are needed to
edit or publish the site — they exist so that a change made in six months can't
quietly break something without you finding out from a parent.

## Running them

They need Node and Playwright, which the site itself does not:

```bash
npm install -D playwright && npx playwright install chromium
```

Then, from the project folder, start a server in one Terminal tab:

```bash
python3 serve.py
```

and in another:

```bash
node tests/responsive.js     # phones, tablets, laptops
node tests/a11y.js           # colour contrast
node tests/verify.js         # broken links, missing files, JS errors
node tests/test.js           # the nav and the contact form
node tests/feat-test.js      # the open/closed pill and the photo lightbox
node tests/form-test.js      # both outcomes of the contact form
```

They read `http://localhost:8000/dist/` by default. Point them somewhere else
with `BASE_URL=https://yoursite.com/ node tests/a11y.js` — including at the live
site once it's up.

## What each one is for

**`responsive.js`** — loads the page at ten sizes, from a 320px iPhone SE to a
1920px desktop, and reports anything sticking out past the edge of the screen,
text clipped inside its own box, type under 11px, and tap targets under 40px. It
deliberately ignores decoration that overflows inside an `overflow: hidden`
parent, because that is meant to.

**`a11y.js`** — the important one. It walks the rendered page, works out each
element's *real* background by compositing every transparent layer above it, and
checks the contrast ratio. It has caught genuine bugs, including a set of
tuition cards rendering cream-on-cream at 1.00:1 — invisible, and impossible to
spot by eye because the text was still there.

**`verify.js`** — dead anchors, failed requests, JavaScript errors, images that
didn't load, horizontal overflow. Fast, and the first one to run after any
change.

**`test.js`** — opens the mobile nav, clicks through it, and puts the contact
form through every validation branch.

**`form-test.js`** — the contact form's two submit outcomes, with every request
to the mail endpoint intercepted so no real email is ever sent. It checks that
on success the form clears (the message really went) and that on failure it does
**not** clear, and offers a phone number and a prefilled text instead. A parent's
words must never evaporate into a failed request.

**`feat-test.js`** — sets the clock to six different times (mid-morning, just
before closing, before opening, late evening, Saturday, Monday) and checks the
open/closed pill says the right thing at each. Then it opens the lightbox and
checks that focus moves in, Tab stays trapped, Escape closes it, and focus
returns to the photo that opened it.

## One thing worth knowing

A test that passes on the wrong thing is worse than no test. That happened here:
an early version of the menu test checked `element.hidden` — the DOM property —
which was `true` while a CSS rule was overriding it and showing the element
anyway. The test passed; the page was visibly broken.

If a check ever passes and the page still looks wrong, suspect the check.
