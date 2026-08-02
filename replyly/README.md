# Replyly — WhatsApp Reply Assistant

Replyly helps small businesses (shops, clinics, salons, restaurants, real-estate agents) reply faster on WhatsApp with 3 ready-to-send suggestions.

**Separate product** from ShipNative. Green WhatsApp-adjacent branding. Works offline with a templated engine — no API key required.

## Quick start (local)

```bash
cd replyly
npx serve .
# open http://localhost:3000
```

Or open `index.html` / `app.html` directly in a browser.

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
| Quick intents | Price, Booking, Location, Hours, Complaint, Thanks |
| Business types | Restaurant, Clinic, Salon, Real Estate, Retail, Other |
| Tones | Friendly / Professional / Short |
| Output | 3 suggestions + Copy + Send on WhatsApp (`wa.me`) |
| History | Last 15 replies with re-copy |
| Language | English default; stronger Arabic-friendly / mix |
| Free tier | 5 generations per day (`localStorage` by date) |
| Pro | `$12/mo` — unlimited; unlock via code `REPLYLY-PRO` or Gumroad |
| AI (optional) | Paste your own Gemini API key in Settings (stored locally) |

## Free vs Pro

- **Free:** 5 generations/day. Counter resets at local midnight (date key in `localStorage`).
- **Pro unlock (demo):** enter promo code `REPLYLY-PRO` in the upgrade modal → sets `replyly_pro=1`.
- **Pay button:** links to Gumroad placeholder  
  `https://mariamtariq72.gumroad.com/l/replyly`  
  Create the product, then the same URL works.

## Monetization next steps

1. Create Gumroad (or Lemon Squeezy) product at **$12/mo** (or $99/yr).
2. Paste real checkout URL into `app.html` (`GUMROAD_URL`).
3. Optionally email license codes after purchase; customers enter them like `REPLYLY-PRO`.
4. Post Reddit/Dev.to blurbs from `marketing-copy.txt`.

## Optional Gemini

In the app → Settings → paste a Gemini API key. Stored only in the browser (`localStorage`). If present and valid, generations use Gemini; otherwise the offline template engine runs.

## Files

- `index.html` — marketing landing
- `app.html` — the tool
- `vercel.json` — static hosting config
- `marketing-copy.txt` — Gumroad + social blurbs

## Privacy note

Customer messages and API keys never leave the browser unless the user enables Gemini (then only that request goes to Google).
