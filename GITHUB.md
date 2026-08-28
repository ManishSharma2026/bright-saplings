# Putting this on GitHub

Two things you get out of this, and they're the two you asked for:

- **A link to send Pooja**, free and live in about five minutes.
- **Every version kept.** Change something, don't like it, go back. Nothing
  is ever lost, and you can see exactly what changed and when.

After the one-time setup below, updating the live site is one command.

---

## One-time setup

### 1. Make a GitHub account

`github.com` → Sign up. Free. Use an email you'll keep.

### 2. Tell git who you are

Open **Terminal** (⌘-Space, type "Terminal"), and run these two, with your
own name and the email you signed up with:

```bash
git config --global user.name "Manish Sharma"
git config --global user.email "you@example.com"
```

You only ever do this once, on this Mac.

### 3. Create the repository

On `github.com`, click **+** (top right) → **New repository**.

- **Name:** `bright-saplings`
- **Public** — it has to be public for the free GitHub Pages hosting. That's
  fine: everything in here is a public website anyway, and there are no
  passwords or private data in the folder.
- **Do not** tick "Add a README" — the folder already has one, and ticking it
  creates a conflict you'd have to untangle.

Click **Create repository**. Leave that page open; you need the URL from it.

### 4. Push the folder up

In Terminal:

```bash
cd ~/Day-care-website
git init
git add .
git commit -m "Bright Saplings website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/bright-saplings.git
git push -u origin main
```

Replace `YOUR-USERNAME`. GitHub will ask you to sign in — a browser window
opens, you approve, done.

> **If it asks for a password in the Terminal**, don't type your GitHub
> password; it won't work. GitHub stopped accepting those. Install the helper
> instead — `brew install gh` then `gh auth login` — and run the push again.

### 5. Turn the website on

In your new repository: **Settings** → **Pages** (left sidebar) →
under **Source**, choose **GitHub Actions**.

That's the whole setup. Go to the **Actions** tab and watch the first build
run — about a minute. When it goes green, your site is live at:

```
https://YOUR-USERNAME.github.io/bright-saplings/
```

**That's the link to send Pooja.**

---

## Making changes after that

```bash
cd ~/Day-care-website
python3 serve.py             # look at it locally first
```

Edit whatever you want in `src/`, refresh the browser, repeat. When you're
happy:

```bash
git add .
git commit -m "say what you changed"
git push
```

The live site updates itself about a minute later. You never touch a hosting
control panel, and you never drag a folder anywhere.

**Write the commit message for a version of you who has forgotten this
entirely.** "Fixed Pooja's story with her real details" will mean something to
you in March. "update" will not.

---

## Looking at it on your own machine

```bash
python3 serve.py
```

It builds, starts a small server, and opens `http://localhost:8000`.
Ctrl-C stops it.

**Test it on your phone too**, on the same wi-fi. Find your Mac's address:

```bash
ipconfig getifaddr en0
```

Then open `http://THAT-ADDRESS:8000` on your phone. This is worth doing at
least once before Pooja sees it — most parents will open this on a phone, and
the phone is where layout problems actually show up.

### Why not just double-click index.html?

You can, and it mostly works. But opening a file directly uses `file://`, and
browsers apply stricter rules there — most visibly Chrome refuses to load the
fonts, so the page falls back to Georgia and looks wrong. `serve.py` is the
smallest possible real server, and it shows you what a visitor will actually
see.

---

## How the deploy works

`.github/workflows/deploy.yml` runs on every push to `main`. It checks out the
folder, runs `make-dist.py`, sanity-checks that a page and a stylesheet
actually came out, and publishes `dist/`.

It **rebuilds rather than trusting the committed `dist/`**, so if you edit
`src/` and forget to rebuild before pushing, the live site is still correct.

If a deploy ever fails, the **Actions** tab shows exactly which step broke and
why. The site stays on the last good version until a build succeeds — a broken
push can't take the site down.

---

## When you buy the domain

GitHub Pages will host `brightsaplings.com` for free, so you don't need Netlify
at all unless you'd rather.

1. **Settings → Pages → Custom domain**, type the domain, Save.
2. At your registrar, add the DNS records GitHub shows you.
3. Wait for **Enforce HTTPS** to become tickable — usually under an hour — then
   tick it.
4. Send me the domain and I'll swap the placeholder URL in the six places it
   appears (see `GOING-LIVE.md` step 3).

---

## Two things worth knowing

**The repo is public.** Anyone who finds it can read every file. That is fine —
it's a website, and its HTML is public the moment it's online — but it does
mean **don't ever commit anything private**: no licence documents, no parent
lists, no photos you haven't got permission to publish. `_to_delete/` and
`_directions/` are already excluded in `.gitignore`.

**Before the first push**, check what's about to go up:

```bash
git status
```

Anything listed there is about to become public. Read the list once.
