# ShipNative marketing site (static)

Pure HTML landing page for free hosting on **Vercel** or **Netlify**. No build step.

| File | Purpose |
|------|---------|
| `index.html` | Deployable landing (standalone; Buy CTAs use real Gumroad `href`s) |
| `vercel.json` | Optional clean URLs + basic headers (used when Root Directory = `web`) |

Gumroad’s custom landing still lives at the repo root: [`../landing.html`](../landing.html) (permalink `orrtfl`). Keep that file and `web/index.html` in sync when you edit copy or CTAs.

## Deploy (1–2 steps)

### Vercel

1. Import this Git repo on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `web` → Deploy.

Or CLI from this folder:

```bash
npx vercel
```

### Netlify

1. Import this Git repo on [netlify.com](https://netlify.com) (or drag-and-drop the `web` folder).
2. Publish directory is already `web` via root [`../netlify.toml`](../netlify.toml) — Deploy.

Or drag-and-drop only the contents of `web/` in the Netlify UI.

## CTAs & images

- **Buy / Get it / Product page** → `https://mariamtariq72.gumroad.com/l/shipnative`
- **Cover / thumbnail** → absolute Gumroad CDN URLs (`https://public-files.gumroad.com/...`) — valid on Vercel/Netlify
- `data-gumroad-action="buy"` is kept for Gumroad embeds but **standalone hosting relies on `href`**, not those attributes
