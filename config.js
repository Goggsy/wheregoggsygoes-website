/* ═══════════════════════════════════════════════════════════
   Site configuration.

   Contact form: handled entirely via Basin (usebasin.com) — the
   endpoint is set directly on the <form action="..."> in
   index.html, not here. Nothing to configure. The recipient
   email address lives in the Basin dashboard, not in this repo,
   so it's never exposed in the page source.

   Videos: set this once the videos Worker is deployed. Until
   then the "Latest adventures" grid falls back to the
   placeholder cards already in index.html.
   ═══════════════════════════════════════════════════════════ */
window.WGG = {
  // Cloudflare Worker that proxies + caches the YouTube RSS feed.
  videosEndpoint: 'https://wgg-videos.YOUR-SUBDOMAIN.workers.dev',

  // How many videos to show in the "Latest adventures" grid.
  videoCount: 3
};
