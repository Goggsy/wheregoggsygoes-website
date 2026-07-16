/**
 * ═══════════════════════════════════════════════════════════
 * WHERE GOGGSY GOES — Latest videos feed (Cloudflare Worker)
 * ═══════════════════════════════════════════════════════════
 *
 * YouTube publishes a public RSS feed of every channel's uploads,
 * but a browser can't fetch it directly (no CORS headers). This
 * Worker fetches it server-side, converts it to JSON, and caches
 * it for an hour.
 *
 * Result: the "Latest adventures" grid always shows your newest
 * uploads, automatically, with zero maintenance and no API key
 * exposed in the page.
 *
 * ── SETUP ──────────────────────────────────────────────────
 * 1. Find your channel ID (NOT the @handle — that won't work):
 *      • Open your channel in a browser
 *      • View page source (Ctrl+U)
 *      • Search for "channelId"
 *      • It looks like: UCxxxxxxxxxxxxxxxxxxxxxx
 * 2. Cloudflare → Workers & Pages → Create Worker.
 *    Name it "wgg-videos". Paste this file in. Deploy.
 * 3. Worker → Settings → Variables, add:
 *      CHANNEL_ID   = UCxxxxxxxxxxxxxxxxxxxxxx    [Text]
 *      ALLOW_ORIGIN = https://wheregoggsygoes.com [Text]
 * 4. Copy the Worker's URL into config.js as videosEndpoint.
 */

export default {
  async fetch(request, env, ctx) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json',
      'Vary': 'Origin',
    };

    const cache = caches.default;
    const cached = await cache.match(request);
    if (cached) return cached;

    if (!env.CHANNEL_ID) {
      return new Response('[]', { status: 500, headers: cors });
    }

    const feedUrl =
      `https://www.youtube.com/feeds/videos.xml?channel_id=${env.CHANNEL_ID}`;

    const r = await fetch(feedUrl);
    if (!r.ok) {
      return new Response('[]', { status: 502, headers: cors });
    }

    const xml = await r.text();
    const items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
      const e = m[1];
      const id    = (e.match(/<yt:videoId>(.*?)<\/yt:videoId>/) || [])[1] || '';
      const title = (e.match(/<title>([\s\S]*?)<\/title>/)      || [])[1] || '';
      const pub   = (e.match(/<published>(.*?)<\/published>/)   || [])[1] || '';
      return {
        id,
        title: decode(title),
        url: `https://www.youtube.com/watch?v=${id}`,
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        published: pub
          ? new Date(pub).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })
          : '',
      };
    });

    const res = new Response(JSON.stringify(items), { headers: cors });
    ctx.waitUntil(cache.put(request, res.clone()));
    return res;
  },
};

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
