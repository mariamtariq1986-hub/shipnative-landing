const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require(path.join(__dirname, '..', '..', 'node_modules', 'sharp'));
} catch {
  sharp = require('sharp');
}

const dir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(dir, { recursive: true });

async function make(name, size, radius) {
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#07110d"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.32}" fill="#25d366"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${Math.round(size * 0.34)}" fill="#07110d">R</text>
</svg>`);
  await sharp(svg).png().toFile(path.join(dir, name));
}

(async () => {
  await make('icon.png', 1024, 220);
  await make('adaptive-icon.png', 1024, 0);
  await make('splash-icon.png', 512, 110);
  await make('favicon.png', 48, 10);
  console.log('Generated Replyly icons in assets/');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
