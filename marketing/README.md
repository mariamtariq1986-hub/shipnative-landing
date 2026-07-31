# ShipNative — Gumroad product graphics

Self-contained HTML + Tailwind CSS artboards for Gumroad listing images. Open in a browser and screenshot `#artboard` at 1×.

## Files

| File | Artboard size | Suggested Gumroad use |
|------|---------------|------------------------|
| `gumroad-cover.html` | **1280 × 720** | Main product cover / listing header |
| `gumroad-thumbnail.html` | **600 × 600** | Square thumbnail / product icon |

## How to export (Capture node screenshot)

1. Open the HTML file in **Chrome** or **Edge** (needs network once for Tailwind CDN + Google Fonts).
2. Set browser zoom to **100%** (`Ctrl+0` / `Cmd+0`).
3. Open DevTools (`F12` or `Ctrl+Shift+I` / `Cmd+Option+I`).
4. In the **Elements** panel, select the `#artboard` node.
5. Right-click `#artboard` → **Capture node screenshot**.
6. Save as PNG. Keep dimensions exact — do not resize or scale the page.

### Expected output sizes

- Cover → `1280 × 720` PNG  
- Thumbnail → `600 × 600` PNG  

The dark body around `#artboard` is only for framing in the browser. Always capture `#artboard`, not the full page.

### Alternate method (device toolbar)

1. Open DevTools → Toggle device toolbar (`Ctrl+Shift+M` / `Cmd+Shift+M`).
2. Set dimensions to match the artboard (`1280×720` or `600×600`).
3. Zoom the page to 100%, then screenshot the viewport — or still prefer **Capture node screenshot** on `#artboard` for pixel-perfect crops.

## Design notes

- Deep slate (`slateink`) + teal/cyan (`brand`) accents — matches the ShipNative starter kit.
- Fonts: Space Grotesk + JetBrains Mono via Google Fonts.
- Tailwind via CDN (`cdn.tailwindcss.com`) with a small inline `tailwind.config` for brand tokens.
- Root `#artboard` is fixed-size with `overflow: hidden` for clean exports.
