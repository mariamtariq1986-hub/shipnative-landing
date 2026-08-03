# Replyly Mobile (Expo)

Native iOS/Android app for **Replyly** — WhatsApp reply assistant for small businesses.

- **Separate** from the web PWA in `../replyly/` (https://replyly-kappa.vercel.app)
- Expo SDK 57 · Expo Router · TypeScript · Fraunces + Outfit fonts
- Template reply engine (offline, no paid API) · AsyncStorage · EAS-ready

## Run locally

```bash
cd replyly-mobile
npm install
npx expo start
```

Then press `i` / `a` or scan the QR with Expo Go.

```bash
npm run typecheck
npm run android   # expo start --android
npm run ios       # expo start --ios
```

## Store builds

See **[STORE_LAUNCH.md](./STORE_LAUNCH.md)** for Apple/Google accounts, EAS, privacy URL, screenshots, and “won’t open” fixes.

```bash
npm run build:android
npm run build:ios
```

## App structure

```
app/
  _layout.tsx          # fonts, providers, stack
  index.tsx            # onboarding gate
  onboarding.tsx
  (tabs)/              # Generate · History · Pinned · Stats · More
  profile.tsx · team.tsx · paywall.tsx
lib/                   # engine, storage, theme, haptics, notifications stub
context/ReplylyContext.tsx
components/ui.tsx
```

## Features

- Generate 3 replies (biz type, tone, Arabic mix, intents)
- Copy · Share sheet · WhatsApp (`wa.me`)
- Profile + brand words · Team `RPLY1.` invite codes
- History (20) · Favorites · Weekly stats export
- Onboarding · haptics · dark/light · rating prompt stub · local reminder stub
- Free 5 gens/day · Pro unlock code `REPLYLY-PRO` · Gumroad link

Privacy: https://replyly-kappa.vercel.app/privacy
