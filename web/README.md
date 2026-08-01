# ShipNative marketing site (static)

Pure HTML landing page for free hosting on **Vercel** or **Netlify**. No build step.

| File | Purpose |
|------|---------|
| `index.html` | Deployable landing (standalone; Buy CTAs use real Gumroad `href`s) |
| `lead-magnet.html` | Free “Expo AI App Setup Checklist” (printable / Save as PDF) |
| `crime-scene.html` | Viral toy: GitHub username → funny detective case-file card (PNG download) |
| `vercel.json` | Used only if Vercel **Root Directory** is set to `web` |

Prefer the **repo-root** [`../vercel.json`](../vercel.json): it sets `outputDirectory` to `web`, so importing the Git repo without changing Root Directory still serves this landing (and avoids Expo-root 404s).

Gumroad’s custom landing still lives at the repo root: [`../landing.html`](../landing.html) (permalink `orrtfl`). Keep that file and `web/index.html` in sync when you edit copy or CTAs.

## Deploy (1–2 steps)

### Vercel (recommended)

1. Import this Git repo on [vercel.com](https://vercel.com).
2. Leave **Root Directory** empty / `.` (repo root).
3. Confirm settings (root `vercel.json` should override):
   - **Framework Preset:** Other
   - **Build Command:** empty (skip)
   - **Output Directory:** `web`
   - **Install Command:** empty (skip)
4. Deploy. **Redeploy** after pulling this config if an older deploy 404’d.

Alternative: set **Root Directory** to `web` (then this folder’s `vercel.json` applies; leave Output Directory empty).

Or CLI from the **repo root**:

```bash
npx vercel --yes
```

### Netlify

1. Import this Git repo on [netlify.com](https://netlify.com) (or drag-and-drop the `web` folder).
2. Publish directory is already `web` via root [`../netlify.toml`](../netlify.toml) — Deploy.

Or drag-and-drop only the contents of `web/` in the Netlify UI.

## CTAs & images

- **Buy / Get it / Product page** → `https://mariamtariq72.gumroad.com/l/shipnative`
- **Free checklist** → `lead-magnet.html` (live: `https://shipnative-landing.vercel.app/lead-magnet.html` after redeploy)
- **Commit Crime Scene** → `crime-scene.html` (clean URL: `/crime-scene`)
- **Cover / thumbnail** → absolute Gumroad CDN URLs (`https://public-files.gumroad.com/...`) — valid on Vercel/Netlify
- `data-gumroad-action="buy"` is kept for Gumroad embeds but **standalone hosting relies on `href`**, not those attributes
