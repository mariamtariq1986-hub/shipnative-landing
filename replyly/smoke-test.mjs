/**
 * Replyly smoke test — structural + static checks (no DOM VM).
 * Run: node smoke-test.mjs
 */
import { readFileSync } from 'fs';

const html = readFileSync(new URL('./app.html', import.meta.url), 'utf8');
const index = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');

let failed = 0;
function ok(label) { console.log('OK:', label); }
function fail(label) { console.error('FAIL:', label); failed++; }

const appIds = [
  'onboardingModal', 'softUpsellModal', 'favoritesSection', 'historySearch',
  'themeToggle', 'proBanner', 'profileMeter', 'profilePct', 'teamProLock',
  'generateBtn', 'upgradeModal', 'payBtn', 'promoCode',
];
for (const id of appIds) {
  if (html.includes('id="' + id + '"')) ok('element ' + id);
  else fail('missing element ' + id);
}

const needles = [
  'FREE_FAV_LIMIT',
  'profileCompleteness',
  'toggleFavorite',
  'maybeSoftUpsell',
  'maybeShowOnboarding',
  'renderFavorites',
  'REPLYLY-PRO',
  'mariamtariq72.gumroad.com/l/replyly',
  "You've used today's free replies",
  'Ctrl',
];
for (const n of needles) {
  if (html.includes(n)) ok('logic ' + n);
  else fail('missing logic ' + n);
}

if (index.includes('Try free') && index.includes('See pricing') && index.includes('id="features"')) {
  ok('landing CTA + features grid');
} else fail('landing missing CTA hierarchy or features');

if (index.includes('themeToggle') && index.includes('replyly_theme')) ok('landing dark mode');
else fail('landing dark mode');

if (sw.includes('replyly-shell-v3')) ok('service worker cache v3');
else fail('service worker not bumped');

// Validate empty + intent gate
if (html.includes('Paste a customer message or tap a quick intent first.')) ok('empty validation');
else fail('empty validation');

// Free vs Pro constants
if (html.includes('const FREE_LIMIT = 5') && html.includes('const FREE_FAV_LIMIT = 3')) ok('free limits');
else fail('free limits');

if (failed) {
  console.error('\nSmoke test FAILED with', failed, 'issues');
  process.exit(1);
}
console.log('\nSmoke test PASSED');
