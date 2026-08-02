# Replyly — WhatsApp Reply Assistant

Replyly helps small businesses (shops, clinics, salons, restaurants, real-estate agents) reply faster on WhatsApp with 3 ready-to-send suggestions.

**Separate product** from ShipNative. Green WhatsApp-adjacent branding. Works offline with a templated engine — no API key required. Installable as a mobile PWA.

## Quick start (local)

```bash
cd replyly
npx serve .
# open http://localhost:3000
```

Or open `index.html` / `app.html` directly in a browser (service worker needs http(s)).

## Deploy (Vercel — separate project)

```bash
cd replyly
npx vercel --yes --prod
```

Suggested project name: `replyly` or `replyly-app`.  
Do **not** deploy this from the ShipNative root — keep this folder as its own Vercel project.

## Features

| Feature | Details |
|--------|---------|
| Business profile | Name, type, services/prices, hours, location, WhatsApp # (`localStorage`) |
| Brand words | Never say / Always say — applied to template + Gemini replies |
| Team mode | Invite code (`RPLY1.…`) encodes profile + brand words + staff labels; paste on each phone |
| Quick intents | Price, Booking, Location, Hours, Complaint, Thanks |
| Business types | Restaurant, Clinic, Salon, Real Estate, Retail, Other |
| Tones | Friendly / Professional / Short |
| Output | 3 suggestions + Copy + Send on WhatsApp (`wa.me`) |
| History | Last 20 replies with intent, relative time, re-copy |
| Language | English default; stronger Arabic-friendly / mix |
| PWA | Manifest + service worker offline shell + Add to Home Screen tip |
| Free tier | 5 generations per day (`localStorage` by date) |
| Pro | `$12/mo` — unlimited; unlock via code `REPLYLY-PRO` or Gumroad |
| AI (optional) | Paste your own Gemini API key in Settings (stored locally) |

## Team invite demo

1. Open the app → expand **Business profile** → fill name/hours/services + brand words → **Save profile**.
2. Expand **Team mode** → enter team label + Staff 1–3 names → **Create invite code**.
3. **Copy invite code** (starts with `RPLY1.`).
4. On another phone/browser: open Replyly → Team mode → paste → **Import shared profile**.
5. Limitation (shown in UI): no live cloud sync — paste the code on each device when the profile changes.

## PWA / Add to Home Screen

1. Open the deployed `/app` URL on a phone.
2. Dismissible tip banner explains iOS Share → Add to Home Screen / Android Install.
3. After install, Replyly opens standalone; shell assets cache via `sw.js` for basic offline use.

## Free vs Pro

- **Free:** 5 generations/day. Counter resets at local midnight (date key in `localStorage`).
- **Pro unlock (demo):** enter promo code `REPLYLY-PRO` in the upgrade modal → sets `replyly_pro=1`.
- **Pay button:** links to Gumroad  
  `https://mariamtariq72.gumroad.com/l/replyly`

## Files

- `index.html` — marketing landing (before/after examples)
- `app.html` — the tool
- `manifest.webmanifest` / `sw.js` / `icons/` — PWA
- `vercel.json` — static hosting + SW/manifest headers
- `marketing-copy.txt` — Gumroad + social blurbs

## Privacy note

Customer messages and API keys never leave the browser unless the user enables Gemini (then only that request goes to Google). Team invite codes are base64 JSON of the profile — treat them like shared shop notes, not secrets.
