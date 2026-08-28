#!/usr/bin/env python3
"""
Bright Saplings Daycare — make the upload folder
================================================

    python3 make-dist.py

Builds the site first, then copies ONLY the files a visitor's browser needs
into `dist/`. That is the folder you drag onto Netlify.

What it deliberately leaves behind:

    src/            the editable parts — your working files
    wordpress/      the theme, ~736 KB nobody visiting the site will ever load
    build.py        )
    make-dist.py    ) the tooling
    README.md       ) your notes, not the public's
    GOING-LIVE.md   )

Nothing about the site changes. dist/ is the same page, minus the workshop.

Re-run this every time you change something, then re-drag dist/.
"""

import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, 'dist')

# Loose files that go up as-is.
FILES = [
    'index.html',
    '404.html',
    'robots.txt',
    'sitemap.xml',
    'site.webmanifest',
]

# Whole folders that go up as-is.
FOLDERS = [
    'css',
    'js',
    'fonts',
    'images',
]

# Never ship these, wherever they turn up.
SKIP_NAMES = {'.DS_Store', 'Thumbs.db', 'README.txt', 'desktop.ini'}
SKIP_SUFFIX = ('.py', '.md', '.psd', '.ai', '.sketch')


def ignored(_dir, names):
    out = []
    for n in names:
        if n in SKIP_NAMES or n.startswith('.') or n.endswith(SKIP_SUFFIX):
            out.append(n)
    return out


def human(n):
    return f'{n / 1024:.0f} KB' if n < 1024 * 1024 else f'{n / 1048576:.1f} MB'


def folder_size(path):
    total = 0
    for dirpath, _dirs, files in os.walk(path):
        for f in files:
            total += os.path.getsize(os.path.join(dirpath, f))
    return total


def main():
    # 1. Always build first, so dist/ can never be stale.
    print('Building from src/ …')
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'build.py')],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout + r.stderr)
        sys.exit('build.py failed — dist/ not touched.')

    # 2. Note what was there last time, so anything no longer produced can be
    #    cleared out. A stale file left in dist/ would keep being uploaded.
    before = set()
    if os.path.isdir(DIST):
        for dirpath, _dirs, files in os.walk(DIST):
            for f in files:
                before.add(os.path.join(dirpath, f))
    os.makedirs(DIST, exist_ok=True)

    written = set()

    def take(srcp, dstp):
        os.makedirs(os.path.dirname(dstp), exist_ok=True)
        shutil.copy2(srcp, dstp)
        written.add(dstp)

    for name in FILES:
        srcp = os.path.join(ROOT, name)
        if os.path.exists(srcp):
            take(srcp, os.path.join(DIST, name))
        else:
            print(f'  ! missing: {name}')

    for name in FOLDERS:
        srcp = os.path.join(ROOT, name)
        if not os.path.isdir(srcp):
            print(f'  ! missing folder: {name}')
            continue
        for dirpath, dirs, files in os.walk(srcp):
            skip = set(ignored(dirpath, dirs + files))
            dirs[:] = [d for d in dirs if d not in skip]
            rel = os.path.relpath(dirpath, ROOT)
            for f in files:
                if f in skip:
                    continue
                take(os.path.join(dirpath, f), os.path.join(DIST, rel, f))

    count = len(written)

    # 3. Caching rules for the host. Harmless anywhere else.
    #    The HTML must never be cached hard or an edit won't show up;
    #    fonts and images are fingerprinted by content and can cache for a year.
    with open(os.path.join(DIST, '_headers'), 'w') as f:
        f.write(
            '/*\n'
            '  X-Content-Type-Options: nosniff\n'
            '  Referrer-Policy: strict-origin-when-cross-origin\n'
            '  X-Frame-Options: SAMEORIGIN\n'
            '\n'
            '/*.html\n'
            '  Cache-Control: public, max-age=0, must-revalidate\n'
            '\n'
            '/fonts/*\n'
            '  Cache-Control: public, max-age=31536000, immutable\n'
            '\n'
            '/images/*\n'
            '  Cache-Control: public, max-age=604800\n'
        )

    written.add(os.path.join(DIST, '_headers'))
    count += 1

    # 4. Anything from a previous run that is no longer produced.
    stale = sorted(before - written)
    stuck = []
    for p in stale:
        try:
            os.remove(p)
        except OSError:
            stuck.append(os.path.relpath(p, DIST))
    if stale:
        print(f'  removed {len(stale) - len(stuck)} stale file(s)')
    if stuck:
        print('  ! could not remove, delete these by hand before uploading:')
        for p in stuck:
            print(f'      dist/{p}')

    size = folder_size(DIST)
    print(f'\ndist/  →  {count} files, {human(size)}')
    print('Drag this folder onto app.netlify.com/drop')


if __name__ == '__main__':
    main()
