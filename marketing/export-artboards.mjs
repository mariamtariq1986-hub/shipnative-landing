import { chromium } from 'playwright';
import { mkdirSync, existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname);
const exportsDir = resolve(root, 'exports');

const jobs = [
  {
    html: resolve(root, 'gumroad-cover.html'),
    out: resolve(exportsDir, 'shipnative-cover-1280x720.png'),
    width: 1280,
    height: 720,
  },
  {
    html: resolve(root, 'gumroad-thumbnail.html'),
    out: resolve(exportsDir, 'shipnative-thumbnail-600x600.png'),
    width: 600,
    height: 600,
  },
];

async function getPngSize(filePath) {
  // Prefer sharp if available; else use pngjs; else parse IHDR manually
  try {
    const require = createRequire(import.meta.url);
    const sharp = require('sharp');
    const meta = await sharp(filePath).metadata();
    return { width: meta.width, height: meta.height };
  } catch {
    // Manual PNG IHDR parse
    const { readFileSync } = await import('fs');
    const buf = readFileSync(filePath);
    if (buf.toString('ascii', 1, 4) !== 'PNG') {
      throw new Error(`Not a PNG: ${filePath}`);
    }
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height };
  }
}

async function main() {
  if (!existsSync(exportsDir)) {
    mkdirSync(exportsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    viewport: { width: 1400, height: 900 },
  });

  for (const job of jobs) {
    const page = await context.newPage();
    const url = pathToFileURL(job.html).href;
    console.log(`Opening ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    await page.waitForSelector('#artboard', { state: 'visible', timeout: 60000 });
    // Give fonts/CDN a moment to settle
    await page.waitForTimeout(1500);

    const artboard = page.locator('#artboard');
    const box = await artboard.boundingBox();
    console.log(`#artboard box:`, box);

    await artboard.screenshot({
      path: job.out,
      type: 'png',
    });

    const size = await getPngSize(job.out);
    const bytes = statSync(job.out).size;
    console.log(`Wrote ${job.out} (${bytes} bytes) dimensions=${size.width}x${size.height}`);

    if (size.width !== job.width || size.height !== job.height) {
      console.warn(
        `WARN: expected ${job.width}x${job.height}, got ${size.width}x${size.height}`
      );
      // Retry with clip if size mismatched
      if (box) {
        await page.screenshot({
          path: job.out,
          type: 'png',
          clip: {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: job.width,
            height: job.height,
          },
        });
        const size2 = await getPngSize(job.out);
        console.log(`Retry clip dimensions=${size2.width}x${size2.height}`);
        if (size2.width !== job.width || size2.height !== job.height) {
          throw new Error(
            `Dimension mismatch for ${job.out}: expected ${job.width}x${job.height}, got ${size2.width}x${size2.height}`
          );
        }
      } else {
        throw new Error(`No bounding box for #artboard in ${job.html}`);
      }
    }

    await page.close();
  }

  await browser.close();
  console.log('Export complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
