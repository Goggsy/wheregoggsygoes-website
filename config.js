/* ═══════════════════════════════════════════════════════════
   Set these two values once, after deploying the Workers.
   Until then the site still works: the contact form shows a
   friendly message, and the "Latest adventures" grid falls back
   to placeholder cards linking to the channel.
   ═══════════════════════════════════════════════════════════ */
window.WGG = {
  // Cloudflare Worker that relays the contact form to email.
  contactEndpoint: 'https://wgg-contact.YOUR-SUBDOMAIN.workers.dev',

  // Cloudflare Worker that proxies + caches the YouTube RSS feed.
  videosEndpoint:  'https://wgg-videos.YOUR-SUBDOMAIN.workers.dev',

  // How many videos to show in the "Latest adventures" grid.
  videoCount: 3
};
