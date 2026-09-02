# Going live

Everything below takes an afternoon. Steps 1–4 are the launch; 5–8 are what
actually gets parents to find you.

---

## First, a recommendation

You have two ways to put this online, and they are genuinely different:

**Host the files directly** (Netlify, Cloudflare Pages, Vercel — all free).
You drag this folder onto the page, it goes live in about thirty seconds with
HTTPS included. Nothing to update, nothing to patch, nothing that can be hacked,
and it loads in well under a second. The trade: changing the text means editing
a file and re-uploading.

**Or WordPress**, using the theme in `wordpress/`. Costs roughly $5–15/month for
hosting, needs updating every few weeks, and is slower. The trade: Pooja can
edit the words from a browser without touching a file.

For a one-page site that changes a few times a year, **host the files directly**
and let me change the words when you need them changed. Come back to WordPress
if someone wants to self-serve.

---

## 1. Buy the domain

Namecheap, Cloudflare or Porkbun — about $12/year. Cloudflare sells at cost and
doesn't upsell.

Worth grabbing whichever of these is free:

- `brightsaplingsdaycare.com` — clearest, matches the business name
- `brightsaplings.com` — shorter, may be taken
- `brightsaplingsbothell.com` — the town helps local search

Buy the `.com`. Don't bother with `.net`, `.info`, or the "domain privacy
protection" upsell — most registrars now include it free.

---

## 2. Put the site online

First, make the upload folder. From inside `Day-care-website`:

```bash
python3 make-dist.py
```

That builds the site and puts **only the files a visitor needs** into `dist/` —
about 517 KB, 21 files. Your working files (`src/`, `wordpress/`, `build.py`,
these notes) stay on your Mac and never go online.

Then **Netlify Drop**, which needs no account to try:

1. Go to `app.netlify.com/drop`
2. Drag the **`dist` folder** onto the page — not `Day-care-website`, and not
   the folder above it. Netlify uses the contents of whatever you drop as the
   site root, so dropping `dist` puts `index.html` at the top and the address is
   the bare domain.
3. It goes live immediately on a temporary address like
   `brave-tree-a1b2c3.netlify.app`
4. Create a free account to keep it, then **Domain settings → Add custom
   domain**, and follow the DNS instructions

HTTPS is switched on automatically, and Netlify puts no branding on the page —
visitors see your domain and nothing else.

**Every time you change something:** run `python3 make-dist.py` again, then drag
`dist` in again. The script rebuilds and wipes the folder first, so a deleted
file really disappears instead of lingering from the last upload.

---

## 3. Swap in the real domain

Right now the site says `https://www.brightsaplings.com/` as a placeholder.
This matters — it's what Google and Facebook read.

Find and replace that URL in **three files**:

| File | How many times |
|---|---|
| `index.html` | 4 (canonical, og:url, og:image, and twice in the structured data) |
| `sitemap.xml` | 1 |
| `robots.txt` | 1 |

If you'd rather not, send me the domain and I'll do it in a minute.

---

## 4. Make the form actually send

**This is the one thing that will cost you an enrolment if it's missed.**

The form validates properly, but nothing is connected to it yet. It does not
pretend otherwise: submit it and it says *"We can't receive messages through
this form yet"*, gives the phone number, and offers a **Text this to us**
button that opens Messages with the whole enquiry already written. Nothing a
parent types is lost.

That is a safe holding position, not a finished form. Wire it up:

1. Go to `formspree.io`, sign up free, create a form, copy the form URL. It
   looks like `https://formspree.io/f/abcdwxyz`.
2. Open `js/script.js`, find section 09 near the top, and paste it in:

   ```js
   var FORM_ENDPOINT = 'https://formspree.io/f/abcdwxyz';
   ```

3. Run `python3 build.py`.

That's the whole change — one line. The form starts posting for real, shows a
proper thank-you on success, and falls back to the phone number if the request
fails. The "not connected" message disappears by itself.

4. **Send yourself a test and confirm it arrives.** Then check the spam folder,
   because the first one usually lands there.

Free tier is 50 submissions a month, far more than a home daycare will see.

---

## 5. Claim your Google Business Profile

**Do this even before the website.** For a local daycare, the Google Business
listing brings more enquiries than the site will, and the site's job is largely
to be what people click *from* it.

Go to `business.google.com`, search for Bright Saplings, and claim or create it.
You'll get a postcard with a verification code in about a week.

Fill in: the phone number, the hours (8–6, Mon–Fri), the website address, the
category **Day care center**, and the same photos you put on the site. Ask every
happy parent for a Google review — it is the single biggest lever on whether you
show up in "daycare near me".

---

## 6. Tell Google the site exists

At `search.google.com/search-console`, add your domain, verify it (the DNS
method is easiest if you bought through Cloudflare), then submit
`https://yourdomain.com/sitemap.xml`.

Indexing takes a few days to a couple of weeks. It is not instant and that's
normal.

The site already carries **structured data** — a machine-readable block naming
the business type, hours, phone, ages served and areas covered. That's what lets
Google show your hours directly in the result instead of just a blue link. Check
it renders right at `search.google.com/test/rich-results`.

---

## 7. Check how the link looks when shared

Paste your URL into `developers.facebook.com/tools/debug`. You should see the
share card — logo, name, "Growing bright minds, one child at a time", and the
three chips. That's what appears when a parent texts your link to a friend, and
it's the difference between a card and a bare grey rectangle.

---

## 8. Replace the placeholders

The dashed boxes are labelled with the filename each one wants. Every photo
slot, in priority order:

1. **`images/hero.jpg`** — the one that matters. Bright, warm, the play space or
   the garden.
2. **`images/pooja.jpg`** — for the story section. A real, warm photo: kitchen,
   doorway or garden. Not a studio headshot — the whole section is about a
   person, and a stock-looking portrait undoes it.
3. **`images/about.jpg`** — the front room.
4. **`images/program-toddler.jpg`** and **`program-preschool.jpg`**
5. **`images/map.jpg`** — a screenshot of the neighbourhood, or swap the whole
   figure for a Google Maps embed

Read `images/README.txt` for the one-line swap from placeholder to real photo.

**Do not post photos of other people's children without written permission from
their parents.** Photos of the space, the garden, the table, the toys are safer
and work just as well.

---

## Still outstanding

Things the site is currently silent about because I don't have them:

- **An email address** — the site only offers the phone number. Many parents
  prefer email for a first enquiry.
- **The licence number** — worth displaying. It's public record and it reassures.
- **The street address** — currently "Bothell, WA" with a note that the exact
  address comes at tour confirmation. That's a deliberate choice for a family
  home; if you'd rather publish it, it helps local search.
- **Real parent quotes** — I left the testimonials section out rather than
  inventing any. Ask families at the six-month mark and I'll add it.
- **Staff names and bios** — same reasoning.
- **The true version of Pooja's story** — the city, the years and the children's
  ages in `04-story.html` are a first draft and need her corrections before the
  page is public. See the note at the top of that file.

---

## A note on the licence

The site currently describes Bright Saplings as "licensed" in several places.
Make sure that's accurate before launch — Washington State takes childcare
licensing seriously, and it's the one claim on the page a parent might check.
If the licence is still in progress, tell me and I'll soften the wording until
it comes through.
