# Deploying Where Goggsy Goes

Two stages. The site — including the contact form — works fully after
stage 1. Stage 2 turns on the auto-updating "Latest adventures" grid.

---

## Before you start: set your domain

The site is written for `wheregoggsygoes.com`. If your domain is different,
do a find-and-replace for `wheregoggsygoes.com` across these three files:

- `index.html`
- `robots.txt`
- `sitemap.xml`

That's it — nothing else hardcodes the domain.

---

## Stage 1 — GitHub → Cloudflare Pages

### 1. Push to GitHub

```bash
cd wgg-site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/wheregoggsygoes.git
git push -u origin main
```

### 2. Connect Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages**
2. **Connect to Git** → authorise GitHub → pick the repo
3. Build settings — leave these **empty**, it's a static site:
   - Framework preset: **None**
   - Build command: *(blank)*
   - Build output directory: `/`
4. **Save and Deploy**

You'll get a `*.pages.dev` URL immediately.

### 3. Add your custom domain

1. Pages project → **Custom domains** → **Set up a custom domain**
2. Enter `wheregoggsygoes.com`
3. Cloudflare adds the DNS records automatically if the domain is already
   in your Cloudflare account.

**The site — including the contact form — is now fully live.** The form
posts straight to Basin, which was already configured with your form ID
before this was built. There is nothing further to connect.

The "Latest adventures" grid isn't wired up yet, but nothing looks broken —
it shows placeholder cards linking to the channel until Stage 2 is done.

---

## Stage 2 — Latest videos Worker (optional but recommended)

This makes the "Latest adventures" grid update itself every time you upload
to YouTube, with no further editing, ever.

### 1. Find your channel ID

Not the `@wheregoggsygoes` handle — you need the raw ID.

1. Open your channel in a browser
2. View page source (**Ctrl+U** / **Cmd+Opt+U**)
3. **Ctrl+F** for `channelId`
4. Copy the value — it looks like `UCxxxxxxxxxxxxxxxxxxxxxx`

### 2. Create the Worker

1. Cloudflare → **Workers & Pages** → **Create Worker**
2. Name it `wgg-videos`
3. **Edit code** → paste in `workers/videos-worker.js` → **Deploy**
4. **Settings** → **Variables**:

| Name | Value | Type |
|---|---|---|
| `CHANNEL_ID` | `UCxxxxxxxxxxxxxxxxxxxxxx` | Text |
| `ALLOW_ORIGIN` | `https://wheregoggsygoes.com` | Text |

### 3. Wire it up

Open `config.js` and paste the Worker's URL in:

```js
videosEndpoint: 'https://wgg-videos.your-subdomain.workers.dev',
```

Commit and push. Cloudflare redeploys automatically, and the grid now
self-updates within an hour of every upload.

---

## Stage 3 — Tell Google the site exists

Deploying doesn't get you indexed. Do this or you'll wait weeks.

1. **Google Search Console** → [search.google.com/search-console](https://search.google.com/search-console)
   - Add property → `wheregoggsygoes.com`
   - Verify via DNS (Cloudflare makes this a one-click TXT record)
   - **Sitemaps** → submit `sitemap.xml`
   - **URL Inspection** → paste your homepage → **Request indexing**

2. **Bing Webmaster Tools** → can import directly from Search Console

3. **Test your structured data** →
   [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
   Paste your live URL. You should see `Organization`, `WebSite`, `VideoObject`
   ×5, and `FAQPage` detected.

4. **Check your social share card** →
   Paste the URL into [opengraph.xyz](https://www.opengraph.xyz) to see how it
   looks when shared on WhatsApp, Facebook, LinkedIn.

---

## Managing form submissions

Every submission lands in your **Basin dashboard** at usebasin.com, and
also gets emailed to whatever address is configured there. To change where
submissions go, or add spam filtering, do it in the Basin dashboard —
nothing in this repo needs to change.

---

## Updating the site later

### Adding videos to the curated sections ("The caravan renovation", "Adventures & cold water")

Open `index.html` and find an `.ecard` block:

```html
<article class="ecard">
  <div class="embed-mount" data-yt="VIDEO_ID" data-title="Video title here"></div>
  <h3 class="etitle">Video title here</h3>
</article>
```

Copy it, change `data-yt` to the new video's ID (the bit after `youtu.be/` or
`?v=` in the URL), and update both title spots.

**Recommended but optional:** also add a matching `VideoObject` entry to the
JSON-LD block in `<head>` — that's what can earn a video rich result in
Google search. Copy an existing one and swap the ID, title and description.
The site works fine without this step; it's purely an SEO bonus.

**You do not need to come back here to do this** — see the "Editing on
GitHub directly" section below for the no-terminal way to make this exact
change from a browser.

### The "Latest adventures" grid

Nothing to do. It pulls from YouTube automatically once the videos Worker
from Stage 2 is running.

---

## Editing on GitHub directly (no terminal needed)

For small text or video-ID changes, you don't need git, a terminal, or to
come back here at all:

1. Go to the file on github.com (e.g. `index.html`)
2. Click the **pencil icon** (top right of the file view) — "Edit this file"
3. Make your change
4. Scroll down, add a short commit message, click **Commit changes**

Cloudflare Pages redeploys automatically within about a minute of any commit
to the `main` branch. No local setup required — this works from a phone
browser if needed.

If a change is more involved (a new section, a design tweak, something that
needs testing before it goes live), it's genuinely easier to come back and
ask — but anything that's just "swap this video ID" or "fix this sentence"
is a two-minute job directly on GitHub.

---

## What's in this repo

```
index.html            The site
404.html              Not-found page
config.js             Videos Worker URL goes here (contact form needs no config)
robots.txt             Tells crawlers what to index
sitemap.xml           Tells Google what pages exist
site.webmanifest      Makes it installable on phones
_headers              Security + caching rules for Cloudflare
assets/
  css/styles.css      All styling
  js/main.js          Embeds, contact form, video feed
  img/                Logos, favicons, social share card
workers/
  videos-worker.js    YouTube feed proxy
```
