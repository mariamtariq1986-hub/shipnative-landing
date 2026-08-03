# Replyly Mobile — Store Launch Guide

This is the **native** Expo app in `replyly-mobile/`. The web PWA in `../replyly/` stays separate and live at https://replyly-kappa.vercel.app.

**You cannot finish App Store / Play publish until you have developer accounts.** This repo prepares builds, config, and listing checklist so you can ship when accounts are ready.

| Account | Cost (approx.) | Required for |
|--------|----------------|--------------|
| Apple Developer Program | **$99 / year** | iOS App Store |
| Google Play Console | **$25 one-time** | Google Play |
| Expo / EAS | Free tier available; paid for higher limits | Cloud builds & submit |

Privacy policy (required by stores):  
**https://replyly-kappa.vercel.app/privacy**

---

## 0) Run locally first (sanity check)

```bash
cd replyly-mobile
npm install
npx expo start
```

- Entry must be `expo-router/entry` in `package.json` (not a custom `App.tsx` register).
- Scheme: `replyly` · Bundle ID / package: `com.mariamtariq.replyly`
- If the app “won’t open”: clear Metro cache (`npx expo start -c`), reinstall Expo Go / rebuild native, confirm splash + bundle ID, never ship a broken custom entry.

```bash
npm run typecheck
npx expo-doctor
```

---

## 1) Install EAS CLI & configure

```bash
npm install -g eas-cli
eas login
cd replyly-mobile
eas build:configure
```

Replace `extra.eas.projectId` in `app.config.ts` with the ID EAS prints.  
Commit the updated `app.config.ts` / `eas.json`.

---

## 2) Apple Developer + App Store Connect

1. Enroll at https://developer.apple.com/programs/ ($99/yr).
2. Certificates, Identifiers & Profiles → create App ID  
   Bundle ID: **`com.mariamtariq.replyly`**
3. App Store Connect → My Apps → **+** → New App  
   - Name: Replyly  
   - Bundle ID: the one above  
   - SKU: e.g. `replyly-ios`
4. Copy the numeric **Apple ID** (App Store Connect app id) into `eas.json` → `submit.production.ios.ascAppId`.
5. Privacy Policy URL: `https://replyly-kappa.vercel.app/privacy`
6. Prepare screenshots (see §8). Age rating, category (Business / Productivity).

---

## 3) Google Play Console

1. Create account at https://play.google.com/console ($25).
2. Create app → name **Replyly** → app/game → free or paid as you choose.
3. Set package name expectation: **`com.mariamtariq.replyly`** (must match `app.config.ts` — cannot change later).
4. Complete Data safety form (data stored on device; optional notifications; no account system).
5. Privacy policy URL: `https://replyly-kappa.vercel.app/privacy`
6. Upload AAB from EAS production build.

---

## 4) Production builds (EAS cloud — no local Mac required for iOS compile)

```bash
# Android App Bundle for Play
npm run build:android
# or: eas build --platform android --profile production

# iOS IPA (EAS macOS builders)
npm run build:ios
# or: eas build --platform ios --profile production
```

Preview APK for testers:

```bash
eas build --platform android --profile preview
```

Development client:

```bash
eas build --profile development --platform android
```

---

## 5) Submit to stores

```bash
eas submit --platform android --profile production
eas submit --platform ios --profile production
```

Or download the artifact from the Expo dashboard and upload manually in Play Console / Transporter / Organizer.

**Note:** Current Pro unlock uses Gumroad + code `REPLYLY-PRO` stored in AsyncStorage. Native IAP (RevenueCat / StoreKit / Play Billing) can be added later; declare digital goods correctly if you switch to IAP.

---

## 6) Privacy page deploy (web)

From repo:

```bash
cd ../replyly
npx vercel --yes --prod
```

Confirm: https://replyly-kappa.vercel.app/privacy

---

## 7) Common “app won’t open” fixes

1. **Wrong entry** — `package.json` → `"main": "expo-router/entry"`. Delete leftover `App.tsx` / `index.ts` entry registration.
2. **Stale cache** — `npx expo start -c` · Android: clear Expo Go storage · iOS: delete app & reinstall.
3. **Native mismatch** — after adding plugins (notifications, etc.), rebuild with EAS; Expo Go may not include every native module behavior.
4. **Splash stuck** — fonts/context must resolve; `SplashScreen.hideAsync()` runs when `ReplylyProvider` is ready.
5. **Scheme / deep link** — `scheme: "replyly"` in `app.config.ts`.
6. **Bundle ID typo** — must be identical in Apple, Google, and `app.config.ts`.

---

## 8) App Store / Play screenshot guide (placeholders)

Capture on real devices or simulators after UI is polished.

| Slot | Size (typical) | Suggested frame |
|------|----------------|-----------------|
| 1 — Hero | 1290×2796 (iPhone) / phone Play | Generate tab with 3 reply cards + green CTA |
| 2 — Intents | same | Quick intents + Arabic toggle |
| 3 — Profile | same | Business profile modal filled |
| 4 — Team | same | Invite code `RPLY1.…` visible |
| 5 — Pro / Stats | same | Paywall or weekly stats bars |

Tips:

- Use dark forest background; avoid purple “AI” clichés.
- Show realish salon/clinic copy, not lorem ipsum.
- Optional: 6.7" + 6.5" iPhone sets; 7" tablet not required (`supportsTablet: false`).
- Play: 1080×1920 (or current Play console requirements) phone screenshots.

Store listing copy starter:

- **Subtitle:** WhatsApp replies for small businesses  
- **Description:** Paste a customer message, get 3 on-brand replies. Profile, team invite codes, history, pinned templates. Free 5/day. Pro $12/mo.

---

## 9) What’s left for you (checklist)

- [ ] Apple Developer Program enrollment  
- [ ] Google Play Console enrollment  
- [ ] `eas login` + `eas build:configure` (real projectId)  
- [ ] Deploy privacy page if not live yet  
- [ ] Production EAS builds  
- [ ] Screenshots + store listing text  
- [ ] `eas submit` / console upload  
- [ ] (Optional later) Replace Gumroad unlock with native IAP  

Until then, ship the web PWA + run this app in Expo Go / internal preview builds.
