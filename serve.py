#!/usr/bin/env python3
"""
Run the site on this computer.

    python3 serve.py

Then open http://localhost:8000 in a browser. Ctrl-C to stop.

WHY NOT JUST DOUBLE-CLICK index.html?
You can, and mostly it works. But opening a file directly uses the
file:// protocol, and browsers apply stricter rules there — most
visibly, Chrome refuses to load the fonts, so the page falls back to
Georgia and Helvetica and looks wrong. Everything a real visitor will
see needs a real server, and this is the smallest possible one.

It rebuilds first, so what you see is always what is in src/.
"""

import http.server
import os
import socketserver
import subprocess
import sys
import webbrowser

PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        # Never cache while developing, or you edit a file, reload, and
        # spend ten minutes wondering why nothing changed.
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    def log_message(self, fmt, *args):
        if '404' in (fmt % args):
            sys.stderr.write('  404  %s\n' % (fmt % args))


def main():
    print('Building…')
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'build.py')],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout + r.stderr)
        sys.exit('build.py failed.')

    socketserver.TCPServer.allow_reuse_address = True
    try:
        httpd = socketserver.TCPServer(('', PORT), Handler)
    except OSError:
        sys.exit(f'Port {PORT} is already in use. Close the other server, '
                 f'or change PORT at the top of this file.')

    url = f'http://localhost:{PORT}/'
    print(f'\n  Serving at {url}')
    print('  Edit anything in src/, run  python3 build.py,  then refresh.')
    print('  Ctrl-C to stop.\n')
    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
        httpd.server_close()


if __name__ == '__main__':
    main()
