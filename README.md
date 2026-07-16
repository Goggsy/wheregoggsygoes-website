# Where Goggsy Goes

A family of five, living life to the fullest across the UK.
Static site → GitHub → Cloudflare Pages. Contact form → Basin.

**Live:** https://wheregoggsygoes.com
**Channel:** https://www.youtube.com/@wheregoggsygoes

## Quick start

See **DEPLOY.md** for the full walkthrough.

Short version:
1. Push this repo to GitHub
2. Cloudflare → Workers & Pages → Pages → Connect to Git
3. Build command: *(none)* · Output directory: `/`
4. Deploy — the contact form works immediately, no extra setup
5. (Optional) deploy the videos Worker so "Latest adventures" self-updates
6. Submit `sitemap.xml` to Google Search Console

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(The contact form will still hit the real Basin endpoint even from
localhost — Basin works cross-origin by default.)

## Design system

| Token | Hex |
|---|---|
| Navy | `#1B2B45` |
| Orange | `#DD5127` |
| Cream | `#F2E8D5` |
| Ink | `#0E1626` |

Display: **Fraunces** · Body: **Poppins** · Labels: **Spline Sans Mono**

## Notes

- No email address or phone number appears anywhere in the page source.
  The contact form posts to Basin (usebasin.com); the recipient address is
  configured in the Basin dashboard, not in this repo.
- The contact form works even without JavaScript — it's a real HTML form
  with a real `action`, so it degrades gracefully to a full-page submit.
  JS just upgrades it to submit inline without a page reload.
- YouTube embeds are click-to-load facades. They are real embeds — clicking
  loads the genuine `youtube-nocookie` player — but the heavy player script
  only loads on interaction, which protects Core Web Vitals (a Google ranking
  signal).
- Built by [Velyntic](https://velyntic.com).
