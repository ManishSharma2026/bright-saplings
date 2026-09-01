# The original logo

`logo-original.jpg` is the artwork exactly as the client supplied it —
1254×1254, square, no drop shadow. **Every icon on the site is generated
from this file.** If the logo is ever redrawn, drop the new one in here and
regenerate rather than editing the outputs.

## What gets generated, and the geometry it uses

| Output | Crop | Used for |
|---|---|---|
| `images/logo.png` | centre (629, 626) r 583 | the whole badge: footer, 404, share card |
| `images/logo-mark.png` | centre (630, 440) r 330 | the header, and the app icons |
| `images/favicon-*.png`, `favicon.ico` | centre (625, 350) r 250 | browser tabs |

## The constraint that decides the header mark

The illustration is **wider than it is tall** relative to its own centre. So
a circle large enough to hold its full width also reaches down into "Bright
Saplings" and slices the tops off the letters.

Centre (630, 440) radius 330 is the largest circle that holds the whole
picture — sun with its face, tree, both children, the grass — **and** stops
above the type. Enlarging it re-introduces the clipped wordmark, which is
the exact thing the client flagged twice.

The favicon crop drops the children on purpose. Below about 40px they turn
to noise, and the tree is the part that still reads at 16px.

This folder is not published: `make-dist.py` only copies `images/`, so the
2MB of source art never reaches the live site.
