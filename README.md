# Glowdown — Facebook Video Downloader

Ek simple website jahan koi bhi Facebook video ka link paste kare aur
download karne ke options paa sake. Frontend HTML/CSS/JS hai, backend
Node.js (Express) hai jo aapki RapidAPI key ko safe rakhta hai.

## Files

- `server.js` — backend server. `/api/download` route RapidAPI ko call karta hai.
- `public/index.html` — page (hero, "how it works", features, FAQ, terms)
- `public/style.css` — colorful theme + light/dark mode
- `public/script.js` — form handling, theme toggle, result rendering
- `.env` — yahan aapki `RAPIDAPI_KEY` already daali hui hai (testing ke liye)

## Replit par chalana

1. Naya **Node.js Repl** banayen aur ye sab files usme paste/upload kar den
   (ya GitHub se import kar den).
2. **Secrets** tab (lock icon) mein jaa kar `RAPIDAPI_KEY` add karen — wahi
   key jo `.env` file mein hai. Replit Secrets zyada safe hai kyunki `.env`
   file accidentally public ho sakti hai.
3. Run dabayen — Replit khud `npm install` aur `npm start` chala dega
   (agar nahi chalaye to terminal mein `npm install` likh kar phir `npm start`).
4. Aapko ek public URL milega — wahi link share kar sakte hain.

## Local par chalana

```bash
npm install
npm start
```

Phir browser mein `http://localhost:3000` kholen.

## Zaroori baat — API response ka shape

Mujhe RapidAPI ke is endpoint ka **actual JSON response** nahi mila (test
karne ke liye uska domain mere sandbox mein allow nahi tha), is liye
`public/script.js` mein ek **flexible parser** (`extractVideoInfo`) likha
hai jo common field names try karta hai (`medias`, `links`, `hd`, `sd`,
`download_url`, etc.) aur agar kuch na mile to **"Raw API response"**
section mein poora JSON dikha deta hai.

Pehli baar test karne ke baad:
1. Page par "Raw API response" khol kar dekhen ke real response mein
   download links kahan hain (e.g. `data.medias[0].url`).
2. Agar links nahi mil rahe, to `public/script.js` ke `extractVideoInfo`
   function mein wo field name add kar den — ye 5 minute ka kaam hai.

## Important — ToS aur copyright

Facebook video downloader tools usually platform ke Terms of Service ke
khilaf hote hain agar in se **dusron ka copyrighted content** download
kiya jaye. Website ke "Terms" section mein ye baat already mention hai —
sirf wo content download karen jis ke aap khud owner hain ya jisko download
karne ki permission ho. Agar aap ye public launch kar rahe hain to apne
mulk ke copyright laws aur Facebook ke ToS bhi ek nazar dekh lein.

## Next steps (jab TikTok wala bhi add karna ho)

Jab aap TikTok downloader add karne ka soche, to:
- RapidAPI se TikTok downloader API ka endpoint/key lein.
- `server.js` mein ek naya route `/api/download/tiktok` bana den (alag
  host/key ke saath).
- Frontend par ek "platform" tab/toggle (Facebook / TikTok) add kar den —
  baqi UI (theme, FAQ, terms) wahi reuse ho jayega.
