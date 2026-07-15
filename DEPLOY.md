# Deploying Where Goggsy Goes

Three stages. The site works after stage 1 — stages 2 and 3 turn on the
contact form and the auto-updating video grid.

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

**The site is now live.** The contact form and latest-videos grid aren't
connected yet, but nothing looks broken — the form shows a friendly notice
and the video grid falls back to cards linking to the channel.

---

## Stage 2 — Contact form Worker

A static site can't send email. This Worker does it, and keeps your address
out of the page source so bots can't scrape it.

### 1. Get a Resend API key

1. Sign up at [resend.com](https://resend.com) — free tier is 3,000 emails/month
2. Add and verify `wheregoggsygoes.com` as a sending domain
3. Copy your API key (starts `re_`)

### 2. Create the Worker

1. Cloudflare → **Workers & Pages** → **Create Worker**
2. Name it `wgg-contact`
3. **Edit code** → paste in `workers/contact-worker.js` → **Deploy**

### 3. Add the variables

Worker → **Settings** → **Variables and Secrets**:

| Name | Value | Type |
|---|---|---|
| `TO_EMAIL` | `michaelgoggs@googlemail.com` | **Secret** |
| `RESEND_KEY` | `re_xxxxxxxxxxxx` | **Secret** |
| `FROM_EMAIL` | `contact@wheregoggsygoes.com` | Text |
| `ALLOW_ORIGIN` | `https://wheregoggsygoes.com` | Text |

Use **Secret** (not Text) for the two marked — Secrets are encrypted and
can't be read back out of the dashboard.

### 4. Wire it up

Copy the Worker's URL and paste it into `config.js`:

```js
contactEndpoint: 'https://wgg-contact.your-subdomain.workers.dev',
```

Commit and push. Cloudflare redeploys automatically.

---

## Stage 3 — Latest videos Worker

This makes the "Latest adventures" grid update itself every time you upload.

### 1. Find your channel ID

Not the `@wheregoggsygoes` handle — you need the raw ID.

1. Open your channel in a browser
2. View page source (**Ctrl+U** / **Cmd+Opt+U**)
3. **Ctrl+F** for `channelId`
4. Copy the value — it looks like `UCxxxxxxxxxxxxxxxxxxxxxx`

### 2. Create the Worker

1. Cloudflare → **Create Worker** → name it `wgg-videos`
2. Paste in `workers/videos-worker.js` → **Deploy**
3. **Settings** → **Variables**:

| Name | Value | Type |
|---|---|---|
| `CHANNEL_ID` | `UCxxxxxxxxxxxxxxxxxxxxxx` | Text |
| `ALLOW_ORIGIN` | `https://wheregoggsygoes.com` | Text |

### 3. Wire it up

```js
videosEndpoint: 'https://wgg-videos.your-subdomain.workers.dev',
```

Push. Done — the grid now self-updates within an hour of every upload.

---

## Stage 4 — Tell Google the site exists

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

## Updating the site later

### Adding videos to the curated sections

Open `index.html` and find an `.ecard` block:

```html
<article class="ecard">
  <div class="embed-mount" data-yt="VIDEO_ID" data-title="Video title here"></div>
  <h3 class="etitle">Video title here</h3>
</article>
```

Copy it, change `data-yt` to the new video's ID (the bit after `youtu.be/` or
`?v=` in the URL), and update both title spots.

**Also** add a matching `VideoObject` entry to the JSON-LD block in `<head>` —
that's what tells Google the video exists and can earn you a video rich result
in search. Copy an existing one and swap the ID, title and description.

### The "Latest adventures" grid

Nothing to do. It pulls from YouTube automatically once the videos Worker is
running.

---

## What's in this repo

```
index.html            The site
404.html              Not-found page
config.js             Your two Worker URLs go here
robots.txt            Tells crawlers what to index
sitemap.xml           Tells Google what pages exist
site.webmanifest      Makes it installable on phones
_headers              Security + caching rules for Cloudflare
assets/
  css/styles.css      All styling
  js/main.js          Embeds, contact form, video feed
  img/                Logos, favicons, social share card
workers/
  contact-worker.js   Contact form → email relay
  videos-worker.js    YouTube feed proxy
```
