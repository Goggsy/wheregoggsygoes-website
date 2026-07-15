# Where Goggsy Goes

A family of five, living life to the fullest across the UK.
Static site → GitHub → Cloudflare Pages.

**Live:** https://wheregoggsygoes.com
**Channel:** https://www.youtube.com/@wheregoggsygoes

## Quick start

See **DEPLOY.md** for the full walkthrough.

Short version:
1. Push this repo to GitHub
2. Cloudflare → Workers & Pages → Pages → Connect to Git
3. Build command: *(none)* · Output directory: `/`
4. Deploy the two Workers, paste their URLs into `config.js`
5. Submit `sitemap.xml` to Google Search Console

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

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
  The contact address lives in the Worker's secrets.
- YouTube embeds are click-to-load facades. They are real embeds — clicking
  loads the genuine `youtube-nocookie` player — but the heavy player script
  only loads on interaction, which protects Core Web Vitals (a Google ranking
  signal).
- Built by [Velyntic](https://velyntic.com).
