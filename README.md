# bibletyper

Scripture typing practice (self-hosted copy).

This folder is a complete copy of bibletyper that can use your own API keys, so you can type the NIV, NLT, ESV and other copyrighted translations.

## Hosting with Node.js

The folder includes a small Express server (`server.js`) so it can run on any Node.js host (Render, Railway, Fly.io, Heroku, a VPS, etc.). Requires **Node 18 or newer**.

### Run locally

```bash
npm install
npm start
```

Then open <http://localhost:3000>.

### Deploying

- The server listens on the `PORT` environment variable (default `3000`).
- On a host, set the build command to `npm install` and the start command to `npm start`. No environment variables are required.
- Behind a domain, serve over HTTPS so API key checks work reliably.
- Only `index.html` and the four translation `.js` files are served; `server.js`, `package.json` and `.git` are not exposed.

Static hosts (GitHub Pages, Netlify) still work without Node.

## Where to get keys

| Provider | Translations | Cost / terms |
| --- | --- | --- |
| [API.Bible](https://api.bible) | NIV, NLT, NKJV, CSB, NASB and more | Free Starter plan is non-commercial; choose up to three copyrighted translations per key |
| [ESV API](https://api.esv.org) | ESV (not on API.Bible) | Free for non-commercial use |

## Terms this copy follows

- Shows each translation's copyright notice next to the text, and the "Scripture via API.Bible" link that API.Bible's Starter plan requires.
- Loads API.Bible's Fair Use (FUMS) script and reports each passage it displays, as API.Bible requires for websites.
- Scripture fetched with your keys is kept in memory only while the page is open and is never saved, so it stays well within the publishers' caching limits.
- Keep the site non-commercial (no ads, fees or paid upgrades). That is a condition of both free keys.

## Files

| File | Description |
| --- | --- |
| `index.html` | The app |
| `kjv.js` | King James Version (public domain) |
| `bsb.js` | Berean Standard Bible (public domain) |
| `web.js` | World English Bible (public domain) |
| `asv.js` | American Standard Version (public domain) |
| `server.js` | Node.js/Express server for hosting |
| `package.json` | Node.js manifest (`npm start`) |
