/* ═══════════════════════════════════════════════════════════
   WHERE GOGGSY GOES — main.js
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = window.WGG || {};

  /* ─────────────────────────────────────────────────────────
     1. YOUTUBE EMBEDS — click-to-load facade
     These ARE real YouTube embeds. Clicking swaps the thumbnail
     for the genuine youtube-nocookie player. We defer loading the
     player until interaction because five raw iframes would each
     pull ~1MB of scripts on page load — which wrecks Core Web
     Vitals, and Google uses those as a ranking signal.
     ───────────────────────────────────────────────────────── */
  function mountEmbed(el) {
    var id = el.getAttribute('data-yt');
    var title = el.getAttribute('data-title') || 'Video';
    if (!id) return;

    var wrap = document.createElement('div');
    wrap.className = 'embed';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'efacade';
    btn.setAttribute('aria-label', 'Play video: ' + title);

    var img = document.createElement('img');
    // hqdefault always exists; maxres does not for every video.
    img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    img.alt = '';
    img.loading = 'lazy';
    img.width = 480;
    img.height = 360;

    var play = document.createElement('span');
    play.className = 'eplay';

    btn.appendChild(img);
    btn.appendChild(play);
    wrap.appendChild(btn);
    el.appendChild(wrap);

    btn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
                   '?autoplay=1&rel=0&modestbranding=1';
      iframe.title = title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; ' +
                     'gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.setAttribute('frameborder', '0');
      wrap.innerHTML = '';
      wrap.appendChild(iframe);
    }, { once: true });
  }

  document.querySelectorAll('[data-yt]').forEach(mountEmbed);

  /* ─────────────────────────────────────────────────────────
     2. LATEST VIDEOS — pulled from the channel via the Worker
     ───────────────────────────────────────────────────────── */
  var grid = document.querySelector('[data-videos]');
  if (grid && CFG.videosEndpoint && CFG.videosEndpoint.indexOf('YOUR-SUBDOMAIN') === -1) {
    fetch(CFG.videosEndpoint)
      .then(function (r) { if (!r.ok) throw new Error('feed'); return r.json(); })
      .then(function (items) {
        if (!items || !items.length) throw new Error('empty');
        var n = CFG.videoCount || 3;
        grid.innerHTML = items.slice(0, n).map(function (v) {
          return '<a class="vid" href="' + v.url + '" target="_blank" rel="noopener">' +
                   '<span class="vthumb">' +
                     '<img src="' + v.thumb + '" alt="" loading="lazy" width="480" height="360">' +
                   '</span>' +
                   '<span class="vtitle">' + escapeHtml(v.title) + '</span>' +
                   '<span class="vmeta">' + escapeHtml(v.published) + '</span>' +
                 '</a>';
        }).join('');
      })
      .catch(function () {
        /* Feed unavailable — the hand-written placeholder cards stay put,
           each linking to the channel. Nothing looks broken. */
      });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ─────────────────────────────────────────────────────────
     3. CONTACT FORM — posts directly to Basin (usebasin.com).
     Basin is a hosted form backend: it receives the submission
     and emails it on to the address configured in the Basin
     dashboard. That address is set up in Basin, NOT here — so
     it never appears anywhere in this page's source and can't
     be scraped.
     Request format follows Basin's own documented AJAX pattern:
     https://docs.usebasin.com/creating-forms/form-backend/
     ───────────────────────────────────────────────────────── */
  var form = document.querySelector('[data-form]');
  if (form) {
    var status = form.querySelector('[data-status]');
    var btn = form.querySelector('.fbtn');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: bots fill hidden fields, humans don't.
      if (form.company && form.company.value) return;

      if (!form.checkValidity()) {
        setStatus('Please fill in every field before sending.', 'err');
        form.reportValidity();
        return;
      }

      btn.disabled = true;
      setStatus('Sending\u2026', '');

      var formData = new FormData(form);
      formData.delete('company'); // don't bother sending the honeypot field

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      })
        .then(function (r) {
          if (!r.ok) throw new Error('submit failed');
          form.reset();
          setStatus('Message sent \u2014 we\u2019ll get back to you.', 'ok');
        })
        .catch(function () {
          setStatus('That didn\u2019t send. Please try again in a moment.', 'err');
        })
        .finally(function () { btn.disabled = false; });
    });

    function setStatus(msg, cls) {
      status.textContent = msg;
      status.className = 'fnote' + (cls ? ' ' + cls : '');
    }
  }

  /* ─────────────────────────────────────────────────────────
     4. Footer year
     ───────────────────────────────────────────────────────── */
  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
