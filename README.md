# Bright Saplings Daycare — website

A one-page site for a licensed in-home daycare. No frameworks, no build tools
required to view it, and no external dependencies at all — the fonts ship with
the project, so nothing is loaded from a third party.

**To see it:** double-click `index.html`. That's it.

**To put it on a domain:** read **`GOING-LIVE.md`** — the whole launch, in order,
including the one step that will cost you an enrolment if it's missed (making
the contact form actually send).

**To run it properly:** `python3 serve.py` — builds, starts a small server, opens
a browser. Double-clicking `index.html` mostly works but the fonts won't load.

**To publish it:** read **`GITHUB.md`**. Once set up, `git push` updates the live
site by itself. (Or run `python3 make-dist.py` and drag the `dist` folder onto
Netlify — see `GOING-LIVE.md`.)

---

## What's in this folder

```
Day-care-website/
│
├── index.html              The finished page. Open this in a browser.
├── GOING-LIVE.md           ← read this before the domain goes live
├── 404.html                shown if someone hits a bad URL
├── robots.txt              ) all three need your real domain
├── sitemap.xml             ) swapping in — see GOING-LIVE.md
├── site.webmanifest        ) 
├── css/style.css           The finished stylesheet (generated — see below).
├── js/script.js            All the interactive behaviour.
├── images/                 Logo, icons, share card. Photos go here too.
│                           logo.png      the full badge (footer, 404, share card)
│                           logo-mark.png the simplified sapling (header, favicons)
│                           og-image.jpg  what shows when the link is shared
├── fonts/                  Fraunces + Karla, served from the project itself.
├── GITHUB.md               ← how to publish it and get a link to share
├── serve.py                Runs the site on this computer. Start here.
├── build.py                Re-stitches the parts into index.html + style.css.
├── make-dist.py            Builds, then fills dist/ with only what goes online.
├── dist/                   ← WHAT GETS PUBLISHED. Generated; don't edit it.
├── tests/                  Five checks. See tests/README.md.
├── .github/workflows/      Deploys to GitHub Pages on every push.
│
├── src/                    ← THE PARTS. This is where you edit.
│   ├── _layout-top.html        <head> and everything before the header
│   ├── _layout-bottom.html     closing <script> and </html>
│   ├── sections/               ONE FILE PER SECTION OF THE PAGE
│   │   ├── 01-header.html      sticky nav
│   │   ├── 02-hero.html        headline, CTA, the four facts
│   │   ├── 03-about.html       about us + the six "what we offer" points
│   │   ├── 04-story.html       ← POOJA'S STORY. Read the note at the top.
│   │   ├── 05-programs.html    toddlers + preschool
│   │   ├── 06-activities.html  daily rhythm, weekly + monthly themes
│   │   ├── 07-food.html        the bakery + how allergies are handled
│   │   ├── 08-location.html
│   │   ├── 09-contact.html     phone + tour form
│   │   └── 10-footer.html
│   └── css/                    ONE FILE PER SECTION, PLUS SHARED BASICS
│       ├── 00-tokens.css       colours, spacing, radii  ← start here
│       ├── 01-base.css         reset and element defaults
│       ├── 02-layout.css       .wrap and .section
│       ├── 03-typography.css   headings, drawn marks, stickers, lists
│       ├── 04-buttons.css
│       ├── 05-image-placeholders.css
│       ├── 06-cards.css        bordered cards with hard shadows
│       ├── 07-animations.css   reveal, parallax, drawn-mark timing
│       └── sections/           header.css, hero.css, about.css, story.css, …
│
└── wordpress/              ← READY FOR WORDPRESS
    ├── README.md               step-by-step install guide
    ├── bright-saplings.zip      upload this in Appearance → Themes → Add New
    └── bright-saplings/         the same theme, unzipped, so you can edit it
```

Every HTML section has a matching CSS file with the same name. Change the hero?
You only touch `src/sections/02-hero.html` and `src/css/sections/hero.css`.

---

## Editing

### The quick way

Open `index.html`, find what you want to change, change it. Everything is in
one file and it works immediately. Do the same in `css/style.css` for styling.

**But:** the next time anyone runs `build.py`, those two files get regenerated
from `src/` and your edits are gone. Use the quick way only for a one-off tweak,
or make the same change in `src/` afterwards.

### The safe way (recommended)

1. Edit the file in `src/` — the section HTML, the section CSS, or both.
2. Run the build from this folder:

   ```bash
   python3 build.py
   ```

3. Refresh the browser.

The build takes well under a second. It rewrites `index.html`, `css/style.css`,
and the copies inside the WordPress theme, so everything stays in sync.

### Changing the look

The palette was flipped in August 2026: the page used to be cream with big
green bands, and is now **pale yellow with green type and orange buttons.**
Everything lives at the top of `src/css/00-tokens.css`:

```css
--page:  #fdf5dd;   /* pale yellow — the page */
--ink:   #35411c;   /* green — headings, 10.0:1 */
--ink-2: #3f4d20;   /* green — body, 8.4:1 */
--tang:  #f2ad6b;   /* light orange — buttons */

--green-deep: #2f3b18;   /* borders, hard shadows, footer, allergy slab */
```

**The one thing worth understanding.** The flip was not a rewrite. Green stopped
being a *ground* and became the *ink*, and because every drawn border and every
hard shadow on the site reads from `--line-ink`, and the footer reads from
`--bark-deep`, repointing those two variables at a deep green turned the whole
page over without touching a single section file. If you ever want to flip it
back or somewhere else, start there — not in the sections.

**Read this before changing a colour:**

| Colour | Safe for | Not safe for |
|---|---|---|
| `--ink` / `--ink-2` | all text on any light band | on the dark green ground |
| `--muted` | secondary text on page, oat, sage (4.9:1+) | on blush, sun or orange |
| `--tang` | button grounds with the deep-green label (6.2:1) | as text, anywhere |
| `--tang-text` | that orange **as text** on light (5.9:1) | as a background |
| `--sun` / `--olive` | decoration only now | text of any colour |
| `--green-deep` | big grounds with cream text (11.7:1) | as text on dark |

That is why there are more variables than there are colours. The logo's own sun
yellow is now within a hair of the page colour, so it can no longer be a button
or a label — it survives as an accent only.

**One trap.** A light card placed inside a coloured section inherits that
section's text colour. If you put a light card on the blush or the deep-green
band, reset its text colour explicitly.

### Spacing and type

Every margin, padding and gap comes from a nine-step scale at the top of
`00-tokens.css`:

```css
--s-1: 4px;   --s-4: 16px;  --s-7: 40px;
--s-2: 8px;   --s-5: 20px;  --s-8: 56px;
--s-3: 12px;  --s-6: 28px;  --s-9: 80px;
```

Before this existed the CSS used 9, 13, 15, 22, 26, 34, 38, 46 and 54px — all
slightly different, all arbitrary, and collectively the reason the page read as
*nearly* aligned rather than composed. 147 values were snapped onto the scale.

**Use the token, not the number.** Then changing a value here fixes it
everywhere it appears, and nothing drifts back to being nearly-right.

Line height moves with size, which is the opposite of the usual mistake: big
display type takes *less* leading (`h1` 1.04) and small body text takes more
(1.62). One line-height across both makes headings look loose and paragraphs
look cramped.

Running text has one measure — `--measure`, 62 characters. Past about 68 the eye
starts losing the beginning of the next line.

### Two things the page does that aren't obvious

**The hero pill knows whether you're open.** It reads the clock and says "Open
now · until 6pm", "Opens at 8am today", or "Closed · open Monday 8am", and
refreshes every minute so a tab left open over 6pm doesn't keep lying.

It is computed in **Bothell's timezone, not the visitor's** — a parent
researching from New Jersey at 8pm should see *closed*, and someone browsing
from abroad should see your hours, not theirs. The hours live in two constants
at the top of section 14 of `js/script.js`:

```js
var OPEN_HOUR  = 8;
var CLOSE_HOUR = 18;
```

If anything fails — an old browser, an odd locale — the whole thing bails out
and the static text in the HTML stays. It never guesses.

**Every photo enlarges.** Click any framed photo and it opens full size. This
matters most for the story photos, which are old snapshots where the detail is
the whole point.

With JavaScript off, they're just images in the page and nothing is lost. The
part worth keeping is the keyboard handling: focus moves into the dialog, Tab is
trapped there, Escape closes, and focus returns to the exact photo that opened
it. A lightbox that strands keyboard focus behind an overlay is worse than no
lightbox at all.

### Pooja's story

**This section is a template, and everything on it is true.**

An earlier draft invented a city, a year and the children's ages to make the
story read well. That was the wrong call — it is a real person's life — so every
made-up fact has been taken out. What is on the page now is only what we were
actually told: Pooja came from India with her husband and two children, an older
daughter and a son; she ran Sugar n Flakes Bakery & Cafe; she opened Bright
Saplings. It reads finished, and it can go live exactly as it is.

**The slots.** Open `src/sections/04-story.html` and search for `⟨`. Each one is
a comment saying what to ask Pooja and where her answer goes. Nothing breaks if a
slot is never filled — the sentence around it already works.

The most valuable one is `⟨THE TURNING POINT⟩`: what was the moment she decided
to open a daycare? One real answer there is worth more than all the others put
together.

**The pull quote is not attributed to her.** It is signed *Bright Saplings*,
because it is the house's promise and not something she said. When she sends a
line of her own, paste it in and change the `<cite>` to her name.

**The children are never named**, on purpose. Naming minors on a public page is
a decision only their mother should make, and it is easier to add a name later
than to take one back off the web.

### The photos in the story

`images/story-photo-1.jpg` and `story-photo-2.jpg` came from the client as old
phone snapshots. The restoration script is `enhance2.py` in the working notes.

**The one idea that made the difference:** on old phone sensors the noise is
overwhelmingly in the *colour* channels, not the brightness one. So everything
happens in YCrCb — chroma is denoised hard (16–17), luma barely at all (2–3),
and all sharpening is on luma only. That is what removed the red and magenta
speckle off the play-room wall while keeping every strand of hair.

An early attempt denoised the whole RGB image instead and turned the girl's face
to plastic. On photographs whose entire value is that they are real, detail beats
cleanliness.

The rest, in order: white balance off the brightest few percent (grey-world
drains that play room, which is genuinely full of red and orange), a
shadow-weighted gamma lift, black and white points set, mild CLAHE, and a
two-pass unsharp mask — wide radius at low amount for micro-contrast, then tight
radius at high amount for edges. One pass cannot do both without haloing.

**Super-resolution was used on one photo and not the other.** The play-room shot
goes through FSRCNN ×4 and gains real detail. The portrait does not: it has
genuine motion blur, and FSRCNN is trained on clean bicubic downscales, so on
that frame it just smooths what is left. Plain Lanczos plus the two-pass sharpen
kept far more of her face. Worth remembering when the next batch of photos
arrives — check both ways rather than assuming the fancier tool wins.

**Before these go public, confirm with Pooja that she is happy for photographs of
her children to be on a website.** They are hers to decide about, and consent to
send them in a chat is not the same as consent to publish them.

### The food section

There used to be a four-week rotating menu here, with tabs, a print stylesheet
and about 150 lines of JavaScript. **It was removed in August 2026** at the
client's request, along with `08-print.css` and section 14 of `script.js`.

What replaced it is deliberately static: where the cooking comes from (Sugar n
Flakes Bakery & Cafe) and how allergies are handled. Nothing on the page now
names a dish or a date, which means it never goes stale and never needs
rebuilding when the cooking changes.

**The allergy block is the most important text on the site.** A parent whose
child has an allergy is scanning for exactly that, which is why it's the only
dark slab in that half of the page — it's findable before it's readable. Every
line in it is a promise, so make sure Bright Saplings actually does all five
before this goes live, and delete any it doesn't.

### Fonts

**Fraunces** for headings — it echoes the serif in the logo wordmark, and its
`SOFT` and `WONK` axes give the warmth. **Karla** for body text.

Both ship inside the project in `fonts/`, loaded by `@font-face`. Nothing is
requested from Google or any third party, so the page works offline, loads no
external trackers, and never flashes in a fallback face. About 170 KB total.

### Changing the business details

The real details are already in — Bright Saplings, Bothell WA, 425-428-9660,
18 months to 5 years, 8:00am to 6:00pm. They appear in `_layout-top.html`
(title and meta), `02-hero.html`, `08-location.html`, `09-contact.html` and
`10-footer.html`.

**Still to add when you have them:** an email address, the licence number, and
the real street address if you decide to publish it. Search for `425-428-9660`
to find every place the phone number appears.

**The logo.** Drop the real file in as `images/logo.png`, then in
`src/sections/01-header.html` swap the `<span class="brand__mark">` block for
the `<img class="brand__logo">` line in the comment just above it. The header
currently uses a simplified sapling drawn in SVG as a stand-in.

### Adding your photos

Read `images/README.txt`. Each placeholder box on the page is labelled with the
exact filename it expects and the recommended size, and the README shows the
one-line swap from placeholder `<div>` to real `<img>`.

---

## Adding or removing a section

**Remove one:** delete its file from `src/sections/` (and its CSS from
`src/css/sections/`), then run `build.py`. Also remove the matching
`get_template_part` line in `wordpress/bright-saplings/front-page.php` and the
entry in `bright_saplings_css_parts()` in `functions.php`.

**Add one:** create `src/sections/13-yourname.html` and
`src/css/sections/yourname.css`, add the CSS file to `BUILD_ORDER` at the top
of `build.py`, run the build, then add the section to `front-page.php` and
`functions.php`.

**Reorder:** rename the number prefixes in `src/sections/` and rebuild.

---

## The contact form

It posts to **FormSubmit**, delivering to `manishm.sharma91@gmail.com` while
this is being tested. One line in section 09 of `js/script.js`:

```js
var FORM_ENDPOINT = 'https://formsubmit.co/ajax/manishm.sharma91@gmail.com';
```

**It must be activated before it delivers anything.** The first submission
triggers a confirmation email to that inbox rather than arriving as an enquiry.
See `GOING-LIVE.md` step 4 — and read the part about swapping in the hashed
alias, because a public repo means that address is scrapable.

**Why the three outcomes are all honest.** This form used to say *"Thanks! Your
request is in"* while sending the message precisely nowhere. A parent would have
waited for a reply that could never come, and Bright Saplings would never have
known they existed.

| Situation | What happens |
|---|---|
| Sends successfully | Real thank-you, form clears |
| Send fails | Phone number + a prefilled text, **fields kept** |
| No endpoint configured | Says so plainly, same fallbacks |

The fields are only cleared when the message genuinely went somewhere. That is
the whole rule, and `tests/form-test.js` enforces it.

## Moving to WordPress

See **`wordpress/README.md`**. Short version: there are three routes, and the
folder is set up for all three.

1. **Upload the theme** — `wordpress/bright-saplings.zip`, one upload, done.
2. **Paste sections into blocks** — each file in `src/sections/` is a
   self-contained block you can drop into a Custom HTML block.
3. **Elementor / another builder** — same files, pasted into HTML widgets.

---

## The motion system

Three layers, all in `js/script.js`, all styled from
`src/css/07-animations.css`:

| What | Where it comes from | Notes |
|---|---|---|
| **Reveal** | `.reveal`, `.stagger` | Elements rise *and un-rotate* into place, so they look placed by hand rather than snapped to a grid. `.stagger` children arrive in sequence. |
| **Drawn marks** | `.u`, `.circled` | Real SVG paths that draw themselves on with `stroke-dashoffset` when the heading arrives. |
| **Parallax** | `.parallax` + `data-depth` | Measured from where each layer enters the viewport, so everything sits at exactly 0 in its designed position on load. |
| **Pointer** | `data-tilt`, `data-magnetic` | Cards tilt toward the cursor (capped at `--tilt-max`, 4°); buttons drift up to 6px toward it. |

**Three deliberate limits.** The tilt ceiling is small because a card that
swings hard looks like a demo, not a business. Magnetic pull is capped at 6px
because a button that runs away from the cursor is a usability bug wearing a
costume. And there is no scroll-pinned section anywhere — pinning fights a
parent who is scrolling to find your phone number.

Everything switches off under `prefers-reduced-motion`, and the pointer effects
also switch off on touch devices where there is no cursor to follow. Nothing in
the motion layer is required for the page to work or be readable.

To turn a single effect off, remove its attribute in the HTML — delete
`data-tilt` from the cards and they simply stop tilting.

## Why the page looks hand-made

Worth knowing, so a later edit doesn't undo it by accident:

- **Nothing is perfectly straight.** Cards, stickers, badges and photo frames
  each sit a degree or two off square, set by `--rot`. Straightening them is the
  fastest way to make this design look generated.
- **Every photo lives in a `.frame`** — a cream mount with a strip of tape and
  an italic caption underneath. That is the site's signature element.
- **Shadows are hard offsets, never blurs.** `--hard` and `--hard-lg`. A drawn
  border plus a solid shadow reads as printed; a soft blur reads as a UI kit.
- **Sections do not share a template.** Each one has its own ground colour and
  its own heading treatment, and the page runs cream → sapling → cream → oat →
  cream → oat → blush → cream → bark so scrolling feels like turning pages.
- **There is real paper grain** over the whole page (`.grain` in
  `01-base.css`). It is the cheapest thing that stops flat vector output looking
  like flat vector output.

## Browser support & accessibility

Works in current Chrome, Safari, Firefox and Edge. Notes:

- Semantic HTML throughout: one `<h1>`, real `<section>`/`<nav>`/`<footer>`.
- Skip-to-content link, visible focus rings, labelled form fields, `aria-live`
  status messages, `aria-expanded` on the menu button.
- Everything animated is disabled under `prefers-reduced-motion`.
- If JavaScript is off, all content is still visible (the `no-js` fallback).
- Verified for no horizontal overflow at 390px and 1440px.
- **Every piece of text on the page passes WCAG AA contrast** at both
  breakpoints — checked by walking the rendered DOM and compositing each
  element's real background, not by eyeballing swatches. `--ink-3` and
  `--amber-deep` are the values they are *because* the audit failed at the
  lighter ones.
