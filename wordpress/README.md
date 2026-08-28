# Putting this site into WordPress

Three routes, easiest first. Pick one — you don't need all three.

---

## Route 1 — Upload the theme (recommended)

The whole site, already built as a proper WordPress theme.

1. In WordPress: **Appearance → Themes → Add New → Upload Theme**.
2. Choose `bright-saplings.zip` from this folder.
3. **Install Now**, then **Activate**.
4. Go to **Settings → Reading** and set *Your homepage displays* to
   **A static page**, then pick any page as the homepage. The theme's
   `front-page.php` takes over from there.

That's the whole install. The site looks exactly like `index.html`.

### Where things are once it's installed

```
wp-content/themes/bright-saplings/
├── style.css              theme header only — real CSS is in assets/
├── functions.php          loads CSS/JS, holds your business details
├── header.php             sticky nav + everything before <main>
├── footer.php             site footer + </main>
├── front-page.php         the one-page layout — reorder sections here
├── index.php              fallback for any other URL
├── template-parts/
│   ├── section-hero.php        ← one file per section
│   ├── section-about.php
│   ├── section-programs.php
│   ├── section-schedule.php
│   ├── section-safety.php
│   ├── section-team.php
│   ├── section-gallery.php
│   ├── section-testimonials.php
│   ├── section-tuition.php
│   └── section-contact.php
└── assets/
    ├── css/style.css      the bundle (what loads by default)
    ├── css/part-*.css     the same rules split per section
    ├── fonts/*.woff2      Fraunces + Karla, served by the theme itself
    └── js/script.js
```

### Editing the theme

**Your business details are in one place.** Open `functions.php` and edit the
`bright_saplings_info()` array near the bottom — name, phone, email, city,
hours, license number. The header and footer read from it automatically.

The section text lives in `template-parts/section-*.php`. They are plain HTML
with a short PHP header; edit them like normal HTML.

**Reorder the page** by moving lines in `front-page.php`. **Remove a section**
by deleting its line there.

### Seeing which file a style came from

In `functions.php`, set:

```php
define( 'BRIGHT_SAPLINGS_SPLIT_CSS', true );
```

Now the twenty individual part files load instead of the bundle, so DevTools
shows you `part-section-hero.css` rather than one big file. Set it back to
`false` before you go live — one request is faster than twenty.

### A note on fonts

The theme requests nothing from Google. Fraunces and Karla are served from
`assets/fonts/` through an `@font-face` block at the top of the stylesheet, so
the site keeps working behind a firewall, loads no third-party trackers, and
never flashes in a fallback face. If a plugin or a parent theme also enqueues
webfonts, you can safely dequeue them.

### Keeping the theme in sync with the static site

The template parts and CSS in the theme are **generated** from `src/` in the
parent folder. If you edit `src/`, run `python3 build.py` from the project root
and the theme is updated too. If you'd rather work only inside WordPress from
now on, that's fine — just stop running the build so it can't overwrite you.

---

## Route 2 — Paste sections into blocks

Good if you already have a theme you like and only want these sections.

1. Add the CSS once: **Appearance → Customize → Additional CSS**, then paste
   the entire contents of `../css/style.css`.
   (Better for a real site: use a child theme and enqueue the file properly —
   Additional CSS has a size limit on some hosts.)
2. Edit a page → add a **Custom HTML** block.
3. Paste the contents of one file from `../src/sections/` — for example
   `02-hero.html`.
4. Repeat, one block per section, in the order you want.
5. For the animations, sticky header and form validation, add `js/script.js`
   with a plugin like *WPCode* or *Simple Custom CSS and JS*, set to load in
   the footer.

Each file in `src/sections/` is self-contained and starts with a comment
telling you which CSS file it needs, so you can take just the sections you want.

---

## Route 3 — Elementor or another page builder

Same as Route 2, but paste each section into an **HTML widget** instead of a
Custom HTML block. Put the stylesheet in Elementor's *Custom CSS* (Pro) or in
Additional CSS.

One warning: builders sometimes wrap widgets in extra containers with their own
padding and max-widths, which can fight the `.wrap` and `.section` spacing. If
sections look cramped, set the builder's container padding to 0 and let the CSS
do the layout.

---

## The contact form

The form in `section-contact.php` is **frontend only** — it validates and shows
a success message, but nothing is emailed. On WordPress you have two options:

**Use a form plugin (recommended).** Install *Contact Form 7*, *WPForms Lite*,
or *Fluent Forms*, build your form there, and replace everything between
`<form class="form" id="tourForm" novalidate>` and `</form>` in
`template-parts/section-contact.php` with the plugin's shortcode:

```php
<?php echo do_shortcode( '[contact-form-7 id="123" title="Tour request"]' ); ?>
```

You'll lose the custom field styling unless you add the plugin's class names to
`assets/css/part-section-contact.css` — most plugins let you set custom
classes per field, so `.field`, `.field input` and `.chip` can be reused.

**Or point the existing form at a service.** Add
`action="https://formspree.io/f/YOUR_ID" method="POST"` to the `<form>` tag and
delete the submit handler in `assets/js/script.js` (section 09). No plugin,
works immediately, free tier is fine for a daycare's volume.

---

## Images

The theme ships with placeholder boxes, not photos. Two ways to replace them:

**Simple:** upload your photos to **Media**, copy each URL, and swap the
placeholder `<div class="img-ph …">` in the template part for:

```html
<img src="YOUR-MEDIA-URL" alt="Describe the photo" class="img-real img-real--wide" loading="lazy">
```

The `img-real--*` classes match the placeholder shapes exactly, so nothing
shifts. See `../images/README.txt` for which class goes where.

**Editable from the admin:** replace the placeholder with a Customizer setting
or an ACF image field so you can swap photos without touching code. That's more
setup — worth it only if someone else will be updating the site.

Don't post photos of other people's children without written permission.

---

## Before you go live

- [ ] Replace every `EDIT ME` placeholder — name, phone, email, hours, ages,
      license number. Search the theme folder for `EDIT ME`.
- [ ] Update `bright_saplings_info()` in `functions.php`.
- [ ] Replace the sample staff bios and testimonials with real ones.
- [ ] Add real photos; write a real `alt` description for each.
- [ ] Wire up the contact form and send yourself a test.
- [ ] Set the site title and tagline in **Settings → General**.
- [ ] Upload a favicon under **Appearance → Customize → Site Identity**.
- [ ] Install an SEO plugin for the page title, description and social image.
- [ ] Confirm HTTPS is on — parents are typing their contact details in.
