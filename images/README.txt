IMAGES FOLDER
=============

Drop your real photos in here, then swap the placeholder <div> blocks in
index.html for real <img> tags. Every placeholder in the HTML has a comment
directly above it telling you the exact filename and recommended size.

Recommended files (names already referenced in the HTML comments):

  hero.jpg          1600 x 1200   Bright, warm shot of the play space or a
                                  child mid-activity. Avoid faces you don't
                                  have photo release for.
  about.jpg         1200 x 1400   You / your family / the home exterior.
  program-infant.jpg   900 x 700
  program-toddler.jpg  900 x 700
  program-preschool.jpg 900 x 700
  staff-1.jpg        600 x 600    Square headshots crop best.
  staff-2.jpg        600 x 600
  staff-3.jpg        600 x 600
  gallery-1.jpg ... gallery-6.jpg  1200 x 900 (gallery-1 and gallery-4 are
                                  the two tall/wide feature slots)
  og-image.jpg      1200 x 630    Social share preview.
  favicon.png         64 x 64

HOW TO SWAP A PLACEHOLDER
-------------------------
Find this in index.html:

    <!-- IMAGE: images/about.jpg (1200x1400) -->
    <div class="img-ph img-ph--portrait" aria-hidden="true">
      <span class="img-ph__label">About photo</span>
    </div>

Replace the whole <div> with:

    <img src="images/about.jpg" alt="Miss Dana reading with two toddlers"
         class="img-real img-real--portrait" width="1200" height="1400" loading="lazy">

The .img-real classes keep the same rounded corners and aspect ratios the
placeholders use, so nothing else needs to change.

TIPS
----
- Export as .webp if you can (smaller, same quality). Just change the
  extension in the src.
- Keep every file under ~300 KB so the page stays fast.
- Always write a real alt description - it matters for accessibility and SEO.
- Do not post photos of other people's children without written permission.
