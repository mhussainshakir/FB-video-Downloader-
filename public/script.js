// ---------------------------------------------------------------
// Theme toggle (persisted in localStorage)
// ---------------------------------------------------------------
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  localStorage.setItem('glowdown-theme', next);
});

// ---------------------------------------------------------------
// Footer year
// ---------------------------------------------------------------
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------------------------------------------------------------
// Download form
// ---------------------------------------------------------------
const form = document.getElementById('downloadForm');
const input = document.getElementById('videoUrl');
const btn = document.getElementById('downloadBtn');
const result = document.getElementById('result');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const url = input.value.trim();
  if (!url) return;

  setLoading(true);
  showLoading();

  try {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong. Try again.');
      return;
    }

    renderResult(data.raw);
  } catch (err) {
    showError('Network error — check your connection and try again.');
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  btn.disabled = isLoading;
  btn.classList.toggle('is-loading', isLoading);
}

function showLoading() {
  result.hidden = false;
  result.innerHTML = `
    <div class="result-state">
      <span class="result-spinner" aria-hidden="true"></span>
      <span>Fetching video info…</span>
    </div>
  `;
}

function showError(message) {
  result.hidden = false;
  result.innerHTML = `
    <div class="result-state error">
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

function renderResult(raw) {
  const info = extractVideoInfo(raw);

  if (!info.links.length) {
    result.innerHTML = `
      <div class="result-state error">
        <span>No downloadable links were found in the response. Open "Raw API response" below to see what came back — the field names may need a small tweak in script.js.</span>
      </div>
      ${rawBlock(raw)}
    `;
    return;
  }

  result.innerHTML = `
    <div class="result-media">
      ${info.thumbnail ? `<img class="result-thumb" src="${escapeHtml(info.thumbnail)}" alt="" loading="lazy" />` : ''}
      <div>
        <div class="result-title">${escapeHtml(info.title || 'Video found')}</div>
        <div class="result-links">
          ${info.links.map((link) => `
            <a class="result-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" download>
              <span>${escapeHtml(link.label)}</span>
              <span class="tag">Download</span>
            </a>
          `).join('')}
        </div>
      </div>
    </div>
    ${rawBlock(raw)}
  `;
}

function rawBlock(raw) {
  return `
    <details class="result-raw">
      <summary>Raw API response</summary>
      <pre>${escapeHtml(JSON.stringify(raw, null, 2))}</pre>
    </details>
  `;
}

// Different RapidAPI downloader endpoints return slightly different
// JSON shapes. This walks the response and tries the common patterns
// so the page works without knowing the exact shape in advance.
function extractVideoInfo(raw) {
  const info = { title: '', thumbnail: '', links: [] };
  if (!raw || typeof raw !== 'object') return info;

  const containers = [raw, raw.data, raw.result, raw.response].filter(
    (o) => o && typeof o === 'object'
  );

  for (const obj of containers) {
    info.title = info.title || obj.title || obj.desc || obj.description || '';
    info.thumbnail =
      info.thumbnail || obj.thumbnail || obj.thumb || obj.cover || obj.image || '';

    for (const key of ['medias', 'links', 'urls', 'formats', 'videos', 'media']) {
      const arr = obj[key];
      if (Array.isArray(arr)) {
        arr.forEach((item, i) => {
          const url =
            typeof item === 'string' ? item : item.url || item.link || item.download_url;
          if (url) {
            const label =
              (typeof item === 'object' &&
                (item.quality || item.label || item.resolution || item.type)) ||
              `Option ${i + 1}`;
            info.links.push({ url, label: String(label) });
          }
        });
      }
    }

    for (const key of [
      'hd', 'sd', 'hd_url', 'sd_url', 'high', 'low',
      'download_url', 'download', 'video', 'video_url',
    ]) {
      const val = obj[key];
      if (typeof val === 'string' && val.startsWith('http')) {
        info.links.push({ url: val, label: key.replace(/_/g, ' ').toUpperCase() });
      }
    }
  }

  // Last resort: scan the whole response for direct media URLs.
  if (!info.links.length) {
    (function walk(obj) {
      if (!obj || typeof obj !== 'object') return;
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'string' && /^https?:\/\//.test(val) && /\.(mp4|m3u8)(\?|$)/i.test(val)) {
          info.links.push({ url: val, label: key.toUpperCase() });
        } else if (typeof val === 'object') {
          walk(val);
        }
      }
    })(raw);
  }

  const seen = new Set();
  info.links = info.links.filter((link) => {
    if (seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });

  return info;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}
