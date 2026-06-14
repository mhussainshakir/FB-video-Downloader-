require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Config -----------------------------------------------------------
const RAPIDAPI_HOST = 'facebook-video-downloader14.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

if (!RAPIDAPI_KEY) {
  console.warn(
    '[warning] RAPIDAPI_KEY is not set. Add it to a .env file (see .env.example).'
  );
}

// --- Middleware ---------------------------------------------------------
app.use(express.json());
app.use(express.static('public'));

// --- Helpers -------------------------------------------------------------
function isFacebookUrl(url) {
  try {
    const { hostname } = new URL(url);
    return /(^|\.)(facebook\.com|fb\.watch|fb\.com)$/i.test(hostname);
  } catch {
    return false;
  }
}

// --- Routes ---------------------------------------------------------------
app.post('/api/download', async (req, res) => {
  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Paste a Facebook video link first.' });
  }

  if (!isFacebookUrl(url.trim())) {
    return res
      .status(400)
      .json({ error: 'That doesn\'t look like a Facebook link. Copy the link from the Share menu and try again.' });
  }

  if (!RAPIDAPI_KEY) {
    return res
      .status(500)
      .json({ error: 'Server is missing its RapidAPI key. Add RAPIDAPI_KEY to your .env file.' });
  }

  try {
    const body = new URLSearchParams();
    body.append('url', url.trim());

    const response = await axios.post(
      `https://${RAPIDAPI_HOST}/index.php`,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
        timeout: 20000,
      }
    );

    return res.json({ ok: true, raw: response.data });
  } catch (err) {
    const status = err.response?.status;
    const apiMessage =
      err.response?.data?.message || err.response?.data?.error || err.message;

    console.error('RapidAPI request failed:', status, apiMessage);

    if (status === 429) {
      return res
        .status(429)
        .json({ error: 'Free quota for this API has run out for now. Try again later.' });
    }

    return res.status(502).json({
      error: 'Could not fetch this video right now. Double-check the link and try again.',
      detail: apiMessage,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
